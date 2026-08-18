// Generates stylised placeholder "teardown" artwork so the seeded catalog isn't full of
// broken image icons. Purely illustrative — swap for real photos via the admin panel.
import sharp from 'sharp';

const PALETTES = [
  { bg: '#101014', board: '#1c3b2e', trace: '#4ade80', accent: '#e8ffe8' },
  { bg: '#0e1016', board: '#1e2a44', trace: '#60a5fa', accent: '#eaf2ff' },
  { bg: '#120e10', board: '#3a1f2b', trace: '#f472b6', accent: '#ffeaf3' },
  { bg: '#0f0e12', board: '#2c2440', trace: '#a78bfa', accent: '#f2edff' },
  { bg: '#12100c', board: '#3d3115', trace: '#facc15', accent: '#fff8e0' },
  { bg: '#0c1210', board: '#173d2e', trace: '#2dd4bf', accent: '#e2fffb' },
];

function traces(seedNum, trace) {
  let paths = '';
  const rng = mulberry32(seedNum);
  for (let i = 0; i < 14; i++) {
    const x1 = 40 + rng() * 320;
    const y1 = 60 + rng() * 480;
    const segs = 2 + Math.floor(rng() * 3);
    let d = `M ${x1} ${y1}`;
    let x = x1, y = y1;
    for (let s = 0; s < segs; s++) {
      x += (rng() - 0.5) * 120;
      y += (rng() - 0.5) * 120;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    paths += `<path d="${d}" stroke="${trace}" stroke-width="${rng() > 0.7 ? 2.4 : 1.2}" fill="none" opacity="${0.35 + rng() * 0.5}"/>`;
  }
  return paths;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSvg({ seedNum, label, variant }) {
  const palette = PALETTES[seedNum % PALETTES.length];
  const rng = mulberry32(seedNum + variant * 97);
  const camX = 90 + rng() * 40;
  const camY = 130 + rng() * 30;

  return `
  <svg width="800" height="1000" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="500" fill="${palette.bg}"/>
    <rect x="70" y="60" width="260" height="380" rx="26" fill="${palette.board}" opacity="0.9"/>
    ${traces(seedNum * 13 + variant * 7, palette.trace)}
    <circle cx="${camX}" cy="${camY}" r="22" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.8"/>
    <circle cx="${camX}" cy="${camY}" r="10" fill="${palette.accent}" opacity="0.55"/>
    <rect x="150" y="290" width="150" height="90" rx="8" fill="none" stroke="${palette.accent}" stroke-width="1.6" opacity="0.6"/>
    <rect x="90" y="310" width="46" height="46" rx="6" fill="${palette.trace}" opacity="0.5"/>
    ${Array.from({ length: 10 })
      .map((_, i) => `<rect x="${100 + i * 20}" y="70" width="10" height="4" fill="${palette.accent}" opacity="0.4"/>`)
      .join('')}
    <text x="200" y="470" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" fill="${palette.accent}" opacity="0.85" letter-spacing="1">${label}</text>
  </svg>`;
}

export async function generatePlaceholderDataUrl({ seedNum, label, variant = 0 }) {
  const svg = buildSvg({ seedNum, label, variant });
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}
