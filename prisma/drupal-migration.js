// node script to migrate data from a drupal 6 database to this dev.db database.
import dotenv from 'dotenv';
// import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
// import { prisma } from '../src/lib/prisma'
import { PrismaClient } from '@prisma/client'

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
    const [articles] = await drupalConnection.execute(`
      select n.nid, nr.title, nr.body from node as n
      join node_revisions as nr on n.nid = nr.nid;
      `);
    
    articles.forEach(article => {
        console.log(article);
          (async () => {
            await prisma.article.create({
              data: {
                title: article.title,
                body: article.body,
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
          })();
      });

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