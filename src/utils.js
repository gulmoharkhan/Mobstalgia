import crypto from 'node:crypto';

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    const MAX = 25 * 1024 * 1024; // 25MB cap (image uploads as base64)
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export async function readJson(req) {
  const buf = await readBody(req);
  if (!buf.length) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    return {};
  }
}

export async function readForm(req) {
  const buf = await readBody(req);
  const params = new URLSearchParams(buf.toString('utf8'));
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

export function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function sendHtml(res, statusCode, html, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    ...extraHeaders,
  });
  res.end(html);
}

export function redirect(res, location, extraHeaders = {}) {
  res.writeHead(302, { Location: location, ...extraHeaders });
  res.end();
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Amounts stored in paise (integer). Currency: INR.
export function formatCurrency(paise) {
  const rupees = Math.round(paise) / 100;
  return '₹' + rupees.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: rupees % 1 === 0 ? 0 : 2 });
}

export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

export function genOrderNumber() {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `TDF-${ymd}-${rand}`;
}

// Frame titles are authored as "Device Name — Tagline" (e.g. "iPhone 5S — Where
// Touch ID Began"). Splits that into the device name (shown as the card title)
// and the tagline (shown as the subtext, replacing the old brand/storage line).
export function splitTitle(title) {
  const parts = String(title || '').split(' — ');
  if (parts.length < 2) return { name: title || '', tagline: '' };
  return { name: parts[0], tagline: parts.slice(1).join(' — ') };
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
