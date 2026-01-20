// node script to migrate data from a drupal 6 database to this dev.db database.
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { error } from 'console';

// const globalForPrisma = globalThis 
// const prisma = globalForPrisma.prisma ?? new PrismaClient()
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 

const prisma = new PrismaClient()
console.log('ENVIRONMENT:', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './.env.production' });
} else {
  dotenv.config({ path: './.env' });
}

async function migrateDrupal6ToSqlite(drupalConfig) {
    // Connect to Drupal 6 MySQL database
    console.log('Connecting to Drupal database...', drupalConfig);
    let drupalConnection;
    try {
    drupalConnection = await mysql.createConnection({
        host: drupalConfig.host,
        port: drupalConfig.port,
        user: drupalConfig.user,
        password: drupalConfig.password,
        database: drupalConfig.database
    });
  } catch (err) {
    console.error('Error connecting to Drupal database:', err);
    throw err;
  }
    console.log('Connected to Drupal database.');

    // Example: Migrate users from Drupal 6 to SQLite
    const [nodes] = await drupalConnection.execute(`
      select n.nid, n.vid, nr.title, nr.body, n.created, n.changed, n.status, n.promote, n.sticky from node as n
      join node_revisions as nr on n.vid = nr.vid;
      `);

    const deleteeManyTermNodes = await prisma.tag.deleteMany({where: {}});
    console.log(`Deleted ${deleteeManyTermNodes.count} existing tags.`);
    const deleteManyArticles = await prisma.article.deleteMany({where: {}});
    console.log(`Deleted ${deleteManyArticles.count} existing articles.`);
    const deleteManyFields = await prisma.field.deleteMany({where: {}});
    console.log(`Deleted ${deleteManyFields.count} existing fields.`);

    for (const node of nodes) {
      console.log(node.nid, node.title);
      const createArticle = async ({slug}= {slug: true}) => {
        return await prisma.article.create({
          data: {
            title: node.title,
            slug: slug ? slugify(node.title, { lower: true, strict: true }) : undefined,
            body: node.body.replace(`sites/${process.env.DRUPAL_SITE}/files/`, '/files/'),
            authorId: process.env.AUTHOR_DEFAULT_ID,
            createdAt: new Date(node.created * 1000),
            updatedAt: new Date(node.changed * 1000),
            published: node.status === 1,
            featured: node.promote === 1,
            sticky: node.sticky === 1
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
                }
              }
            }
          });
        }
        let article;
        try {
          article = await createArticle();
        } catch (err) {
          console.warn('Error creating article for node:', node, err);
          if (err.message.includes('slug')) {
            console.log('Retrying article creation without slug...');
            article = await createArticle({slug: false});
          }
        }
        console.log('Created article:', article.id);
        const [terms] = await drupalConnection.execute(`
          select td.tid, td.vid, tn.nid, td.name 
          from term_data as td
          join term_node as tn
          on td.tid = tn.tid
          where tn.vid = '${node.vid}';
        `);
        for (const term of terms) {
          await prisma.tag.create({
            data: {
              name: term.name,
              article: {
                connect: {
                  id: article.id
                }
              }
            }
          });
        }
        const [images] = await drupalConnection.execute(`
          select * 
          from files as f
          join content_field_img as img
          on img.field_img_fid = f.fid
          where img.vid = '${node.vid}';
          `);
        console.log('Images for article:', images);
        for (const image of images) {
          if (!image.filepath) continue;
          await prisma.field.create({
            data: {
              type: 'image',
              value: `/files/${image.filepath.split('/').pop()}`,
              article: {
                connect: {
                  id: article.id
                }
              }
            }
          });

          if (process.env.COPY_DRUPAL_FILES === 'true') {
            console.log('Copying image files from Drupal files directory to local files directory')
            console.log('Source DRUPAL_FILES_DIR:', process.env.DRUPAL_FILES_DIR);
            console.log('Destination LOCAL_FILES_DIR:', process.env.LOCAL_FILES_DIR);
            const sourcePath = path.join(process.env.DRUPAL_FILES_DIR, image.filepath);
            const destPath = path.join(process.env.LOCAL_FILES_DIR, image.filepath.split('/').pop());
            try {
              await fs.promises.copyFile(sourcePath, destPath);
            }
            catch (err) {
              console.error(`Error copying file from ${sourcePath} to ${destPath}:`, err);
            }
          }
        }
        const [code] = await drupalConnection.execute(`
          select *
          from content_field_code as cd
          where cd.vid = '${node.vid}';
          `);
        console.log('Code for article:', code);
        for (const cd of code) {
          if (!cd.field_code_value) continue;
          await prisma.field.create({
            data: {
              type: 'code',
              value: cd.field_code_value.replace(`sites/${process.env.DRUPAL_SITE}/files/`, '/files/'),
              article: {
                connect: {
                  id: article.id
                }
              }
            }
          });
        }
        const [links] = await drupalConnection.execute(`
          select *
          from content_field_lnk as l
          where l.vid = '${node.vid}';
          `);
        console.log('Links for article:', links);
        for (const link of links) {
          if (!link.field_lnk_url) continue;
          await prisma.field.create({
            data: {
              type: 'link',
              value: link.field_lnk_url.replace(`sites/${process.env.DRUPAL_SITE}/files/`, '/files/'),
              article: {
                connect: {
                  id: article.id
                }
              }
            }
          });
        }
      }

    // Close connections
    await drupalConnection.end();
}

// Example usage
const drupalConfig = {
    host: process.env.DRUPAL_DB_HOST || 'localhost',
    port: process.env.DRUPAL_DB_PORT || 3306,
    user: process.env.DRUPAL_DB_USER || 'drupal_user',
    password: process.env.DRUPAL_DB_PASSWORD || 'drupal_password',
    database: process.env.DRUPAL_DB_NAME || 'drupal_database'
};


migrateDrupal6ToSqlite(drupalConfig)
    .then(() => console.log('Migration completed successfully.'))
    .catch(err => console.error('Migration failed:', err)); 