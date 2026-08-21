// Database layer — built on Node's native `node:sqlite` (no external deps).
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Overridable via env var so a host with a persistent disk (e.g. Render) can point
// this at a mounted volume instead of the app's own (often ephemeral) filesystem.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'store.sqlite');
export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS frames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    phone_model TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,               -- stored in smallest currency unit (paise)
    type TEXT NOT NULL DEFAULT 'novice', -- 'novice' | 'expert' (teardown-difficulty tier)
    status TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'reserved' | 'sold'
    stock INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS frame_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    frame_id INTEGER NOT NULL REFERENCES frames(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    status TEXT NOT NULL DEFAULT 'pending',       -- pending | confirmed | shipped | delivered | cancelled
    payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | paid
    total_amount INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    frame_id INTEGER REFERENCES frames(id) ON DELETE SET NULL,
    title_snapshot TEXT NOT NULL,
    price_snapshot INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER,
    frame_id INTEGER REFERENCES frames(id) ON DELETE SET NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// One-time data migration: the "type" column used to encode a kit-size tier
// ('handcrafted' = Classic Kit, 'printed' = Compact Kit). It now encodes a
// teardown-difficulty tier instead ('novice' = main board & battery,
// 'expert' = hidden components like camera modules and Taptic Engines).
// Runs on every boot; it's a no-op once every row has been migrated.
const EXPERT_TITLE_PREFIXES = ['Apple Watch Series 3', 'iPhone 5S', 'iPhone 4S', 'Nokia N73'];
const legacyTypedFrames = db.prepare("SELECT id, title FROM frames WHERE type IN ('handcrafted', 'printed')").all();
for (const row of legacyTypedFrames) {
  const newType = EXPERT_TITLE_PREFIXES.some((prefix) => row.title.startsWith(prefix)) ? 'expert' : 'novice';
  db.prepare('UPDATE frames SET type = ? WHERE id = ?').run(newType, row.id);
}

export default db;
