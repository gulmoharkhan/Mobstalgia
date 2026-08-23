// Auth for shoppers/players (separate from the admin auth in auth.js) — an
// email+password account used to sign up, sign in, and save Snake high scores.
import crypto from 'node:crypto';
import { db } from './db.js';
import { hashPassword, verifyPassword } from './auth.js';

const SESSION_DAYS = 30;

export function findCustomerByEmail(email) {
  return db.prepare('SELECT * FROM customers WHERE email = ?').get(email);
}

export function getCustomerById(id) {
  return db.prepare('SELECT id, email, display_name, created_at FROM customers WHERE id = ?').get(id);
}

export function createCustomer({ email, password, displayName }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || String(password).length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  if (findCustomerByEmail(normalizedEmail)) {
    throw new Error('An account with that email already exists — try signing in instead.');
  }
  const name = String(displayName || '').trim() || normalizedEmail.split('@')[0];
  const { hash, salt } = hashPassword(password);
  const result = db
    .prepare('INSERT INTO customers (email, password_hash, salt, display_name) VALUES (?, ?, ?, ?)')
    .run(normalizedEmail, hash, salt, name);
  return getCustomerById(Number(result.lastInsertRowid));
}

export function verifyCustomerLogin(email, password) {
  const customer = findCustomerByEmail(String(email).trim().toLowerCase());
  if (!customer) return null;
  if (!verifyPassword(password || '', customer.salt, customer.password_hash)) return null;
  return getCustomerById(customer.id);
}

export function createCustomerSession(customerId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_DAYS);
  db.prepare('INSERT INTO customer_sessions (token, customer_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    customerId,
    expires.toISOString()
  );
  return { token, expires };
}

export function destroyCustomerSession(token) {
  db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
}

export function getSessionCustomer(token) {
  if (!token) return null;
  const session = db.prepare('SELECT * FROM customer_sessions WHERE token = ?').get(token);
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    destroyCustomerSession(token);
    return null;
  }
  return getCustomerById(session.customer_id);
}
