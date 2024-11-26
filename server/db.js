import createConnectionPool from '@databases/sqlite';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const db = createConnectionPool('./data.db');

// Initialize database schema
async function initDb() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS facilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        phone TEXT,
        status TEXT DEFAULT 'pending',
        subscription_status TEXT DEFAULT 'inactive',
        stripe_customer_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if admin user exists
    const adminUser = await db.query(`
      SELECT * FROM users WHERE email = $1 AND role = 'admin'
    `, ['admin@example.com']);

    if (!adminUser || adminUser.length === 0) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const adminId = nanoid();

      await db.query(`
        INSERT INTO users (id, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
      `, [adminId, 'admin@example.com', hashedPassword, 'admin']);

      console.log('Admin user created successfully');
    }

    // Check if test user exists
    const existingUser = await db.query(`
      SELECT * FROM users WHERE email = $1
    `, ['demo@example.com']);

    if (!existingUser || existingUser.length === 0) {
      // Create test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demo123', salt);
      const userId = nanoid();

      await db.query(`
        INSERT INTO users (id, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
      `, [userId, 'demo@example.com', hashedPassword, 'user']);

      console.log('Test user created successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Initialize the database
initDb().catch(console.error);

export async function query(sql, params = []) {
  try {
    const result = await db.query(sql, params);
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default { query };