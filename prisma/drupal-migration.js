// node script to migrate data from a drupal 6 database to this dev.db database.
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis 
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 

dotenv.config({ path: '../.env' });

async function migrateDrupal6ToSqlite(drupalConfig) {
    // Connect to Drupal 6 MySQL database
    // console.log('Connecting to Drupal database...', drupalConfig);
    const drupalConnection = await mysql.createConnection({
        host: drupalConfig.host,
        port: drupalConfig.port,
        user: drupalConfig.user,
        password: drupalConfig.password,
        database: drupalConfig.database
    });

    // Example: Migrate users from Drupal 6 to SQLite
    const [nodes] = await drupalConnection.execute(`
      select n.nid, nr.title, nr.body, n.created, n.changed from node as n
      join node_revisions as nr on n.nid = nr.nid;
      `);

    const deleteeManyTermNodes = await prisma.tag.deleteMany({where: {}});
    console.log(`Deleted ${deleteeManyTermNodes.count} existing tags.`);
    const deleteManyArticles = await prisma.article.deleteMany({where: {}});
    console.log(`Deleted ${deleteManyArticles.count} existing articles.`);
    const deleteManyFields = await prisma.field.deleteMany({where: {}});
    console.log(`Deleted ${deleteManyFields.count} existing fields.`);

    for (const node of nodes) {
      console.log(node.nid, node.title);
      const article = await prisma.article.create({
        data: {
          title: node.title,
          body: node.body.replace(`sites/${process.env.DRUPAL_SITE}/files/`, 'files/'),
          authorId: process.env.AUTHOR_DEFAULT_ID,
          createdAt: new Date(node.created * 1000),
          updatedAt: new Date(node.changed * 1000)
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
        console.log('Created article:', article.id);
        const [terms] = await drupalConnection.execute(`
          select td.tid, td.vid, tn.nid, td.name 
          from term_data as td
          join term_node as tn
          on td.tid = tn.tid
          where tn.nid = '${node.nid}';
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
          where img.nid = '${node.nid}' order by img.vid;
          `);
        console.log('Images for article:', images);
        for (const image of images) {
          if (!image.filepath) continue;
          await prisma.field.create({
            data: {
              type: 'image',
              value: image.filepath.replace(`sites/${process.env.DRUPAL_SITE}/files/`, 'files/'),
              article: {
                connect: {
                  id: article.id
                }
              }
            }
          });
        }
        const [code] = await drupalConnection.execute(`
          select *
          from content_field_code as cd
          where cd.nid = '${node.nid}' order by cd.vid;
          `);
        console.log('Code for article:', code);
        for (const cd of code) {
          if (!cd.field_code_value) continue;
          await prisma.field.create({
            data: {
              type: 'code',
              value: cd.field_code_value.replace(`sites/${process.env.DRUPAL_SITE}/files/`, 'files/'),
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
          where l.nid = '${node.nid}' order by l.vid;
          `);
        console.log('Links for article:', links);
        for (const link of links) {
          if (!link.field_link_url) continue;
          await prisma.field.create({
            data: {
              type: 'link',
              value: link.field_link_url.replace(`sites/${process.env.DRUPAL_SITE}/files/`, 'files/'),
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