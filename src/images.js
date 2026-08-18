import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Overridable via env var so a host with a persistent disk (e.g. Render) can point
// this at a mounted volume instead of the app's own (often ephemeral) filesystem.
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/**
 * Accepts a data URL (e.g. "data:image/png;base64,....") and writes it to
 * /public/uploads, returning the public URL path ("/uploads/xxxx.png").
 */
export function saveBase64Image(dataUrl, filenameHint = 'image') {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('Invalid image data');
  const mime = match[1];
  const base64 = match[2];
  const ext = EXT_BY_MIME[mime] || 'jpg';
  const baseHint = String(filenameHint).replace(/\.[a-zA-Z0-9]+$/, ''); // strip any existing extension
  const safeHint = baseHint.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'image';
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeHint}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  return `/uploads/${filename}`;
}

export function deleteImageFile(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const filePath = path.join(UPLOADS_DIR, url.slice('/uploads/'.length));
  fs.rm(filePath, { force: true }, () => {});
}
