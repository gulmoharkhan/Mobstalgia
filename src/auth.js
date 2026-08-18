import crypto from 'node:crypto';
import { db } from './db.js';

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminIfMissing(email, password) {
  const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
  if (existing) return existing.id;
  const { hash, salt } = hashPassword(password);
  const result = db
    .prepare('INSERT INTO admin_users (email, password_hash, salt) VALUES (?, ?, ?)')
    .run(email, hash, salt);
  return result.lastInsertRowid;
}

export function findAdminByEmail(email) {
  return db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
}

export function createSession(adminId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  db.prepare('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    adminId,
    expires.toISOString()
  );
  return { token, expires };
}

export function destroySession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function getSessionAdmin(token) {
  if (!token) return null;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    destroySession(token);
    return null;
  }
  return db.prepare('SELECT id, email FROM admin_users WHERE id = ?').get(session.admin_id);
}

export function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}
