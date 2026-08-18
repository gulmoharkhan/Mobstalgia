// One-time (dev-only) asset generator — creates the stylised placeholder "teardown"
// artwork used by the sample catalog in src/seed.js. Requires `sharp`, which is NOT a
// runtime dependency of the app itself — only needed if you want to regenerate these.
// Run with: node scripts/generate-seed-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePlaceholderDataUrl } from '../src/seedImages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'img', 'seed');
fs.mkdirSync(OUT_DIR, { recursive: true });

const PIECES = [
  { slug: 'iphone-15-pro-max', label: 'IPHONE 15 PRO MAX' },
  { slug: 'galaxy-s24-ultra', label: 'GALAXY S24 ULTRA' },
  { slug: 'pixel-8-pro', label: 'PIXEL 8 PRO' },
  { slug: 'iphone-14-pro', label: 'IPHONE 14 PRO' },
  { slug: 'oneplus-12', label: 'ONEPLUS 12' },
  { slug: 'galaxy-z-fold-5', label: 'GALAXY Z FOLD 5' },
  { slug: 'iphone-13-mini', label: 'IPHONE 13 MINI' },
  { slug: 'xperia-1-v', label: 'XPERIA 1 V' },
];

let seedNum = 0;
for (const piece of PIECES) {
  for (let variant = 0; variant < 3; variant++) {
    const dataUrl = await generatePlaceholderDataUrl({ seedNum, label: piece.label, variant });
    const base64 = dataUrl.split(',')[1];
    const filePath = path.join(OUT_DIR, `${piece.slug}-${variant + 1}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    console.log('wrote', filePath);
  }
  seedNum++;
}
console.log('Done.');
