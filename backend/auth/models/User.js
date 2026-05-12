/**
 * User model
 */
import db from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export function createUser(email, passwordHash, name = '') {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, email, passwordHash, name);
  return { id, email, name };
}

export function findUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function findUserById(id) {
  const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}
