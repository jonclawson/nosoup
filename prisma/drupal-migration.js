// node script to migrate data from a drupal 6 database to this dev.db database.
import dotenv from 'dotenv';
// import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
// import { prisma } from '../src/lib/prisma'
import { PrismaClient } from '@prisma/client'
import { type } from 'os';

const globalForPrisma = globalThis 
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 

dotenv.config({ path: '../.env' });

async function migrateDrupal6ToSqlite(drupalConfig, sqlitePath) {
    // Connect to Drupal 6 MySQL database
    // console.log('Connecting to Drupal database...', drupalConfig);
    const drupalConnection = await mysql.createConnection({
        host: drupalConfig.host,
        port: drupalConfig.port,
        user: drupalConfig.user,
        password: drupalConfig.password,
        database: drupalConfig.database
    });

    // Connect to SQLite database
    // const sqliteDb = new sqlite3.Database(sqlitePath);

    // Example: Migrate users from Drupal 6 to SQLite
    // const [users] = await drupalConnection.execute('SELECT uid, name, mail FROM users');
    const [nodes] = await drupalConnection.execute(`
      select n.nid, nr.title, nr.body from node as n
      join node_revisions as nr on n.nid = nr.nid;
      `);

    
    const deleteManyArticles = await prisma.article.deleteMany({where: {}});
    const deleteManyFields = await prisma.field.deleteMany({where: {}});
    console.log(`Deleted ${deleteManyArticles.count} existing articles.`);
    console.log(`Deleted ${deleteManyFields.count} existing fields.`);
    for (const node of nodes) {
        console.log(node.nid, node.title);
        const article = await prisma.article.create({
          data: {
            title: node.title,
            body: node.body.replace('sites/jonclawson.com/files/', 'files/'),
            authorId: process.env.AUTHOR_DEFAULT_ID
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
              value: image.filepath.replace('sites/jonclawson.com/files/', 'files/'),
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
              value: cd.field_code_value.replace('sites/jonclawson.com/files/', 'files/'),
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
              value: link.field_link_url.replace('sites/jonclawson.com/files/', 'files/'),
              article: {
                connect: {
                  id: article.id
                }
              }
            }
          });
        }
      }

    // sqliteDb.serialize(() => {
        // sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
        //     id INTEGER PRIMARY KEY,
        //     username TEXT,
        //     email TEXT
        // )`);

        // const insertStmt = sqliteDb.prepare('INSERT INTO users (id, username, email) VALUES (?, ?, ?)');

        // users.forEach(user => {
        //     insertStmt.run(user.uid, user.name, user.mail);
        // });

        // const insertStmt = sqliteDb.prepare('INSERT INTO article ( title, body) VALUES (?, ?)');
        // articles.forEach(article => {
        // console.log(article);
          // insertStmt.run(article.title, article.body);
        // });

        // insertStmt.finalize();
    // });

    // Close connections
    await drupalConnection.end();
    // sqliteDb.close();
}

// Example usage
const drupalConfig = {
    host: process.env.DRUPAL_DB_HOST || 'localhost',
    port: process.env.DRUPAL_DB_PORT || 3306,
    user: process.env.DRUPAL_DB_USER || 'drupal_user',
    password: process.env.DRUPAL_DB_PASSWORD || 'drupal_password',
    database: process.env.DRUPAL_DB_NAME || 'drupal_database'
};

const sqlitePath = './dev.db';

migrateDrupal6ToSqlite(drupalConfig, sqlitePath)
    .then(() => console.log('Migration completed successfully.'))
    .catch(err => console.error('Migration failed:', err)); 