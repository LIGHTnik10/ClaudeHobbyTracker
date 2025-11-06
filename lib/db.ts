import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'hobbies.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hobbies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    time_spent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hobby_id INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hobby_id) REFERENCES hobbies (id) ON DELETE CASCADE
  );
`);

// Insert default user if not exists
const bcrypt = require('bcryptjs');
const defaultUsername = 'admin';
const defaultPassword = 'hobby123';

try {
  const userExists = db.prepare('SELECT id FROM users WHERE username = ?').get(defaultUsername);
  if (!userExists) {
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(defaultUsername, hashedPassword);
    console.log('Default user created: admin / hobby123');
  }
} catch (error: any) {
  // Ignore duplicate user errors during build
  if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
    throw error;
  }
}

export default db;
