// Seeds the database with an admin account and a sample catalog, but only if the
// database is empty — safe to run every time the server starts.
import { db } from './db.js';
import { createAdminIfMissing } from './auth.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './config.js';
import { createFrame, setFrameImages } from './models.js';

const SAMPLE_FRAMES = [
  {
    slug: 'iphone-15-pro-max',
    title: 'iPhone 15 Pro Max — Titanium Teardown',
    brand: 'Apple',
    phoneModel: 'iPhone 15 Pro Max, 256GB, Natural Titanium',
    description:
      'A complete, fully hand-disassembled iPhone 15 Pro Max mounted in a deep-set titanium-toned frame. The A17 Pro logic board, triple camera array, and titanium mid-frame are arranged to mirror the phone\'s real internal geometry. Every screw is the original screw.',
    price: 1899900,
    type: 'handcrafted',
    status: 'available',
    stock: 1,
    featured: true,
  },
  {
    slug: 'galaxy-s24-ultra',
    title: 'Galaxy S24 Ultra — Circuit City',
    brand: 'Samsung',
    phoneModel: 'Galaxy S24 Ultra, 512GB, Titanium Black',
    description:
      'The S24 Ultra\'s board is genuinely dense — this piece leans into that, laying the Snapdragon board, S Pen module, and periscope camera out like a city grid seen from above. Finished in a matte black frame that disappears against the components.',
    price: 1749900,
    type: 'handcrafted',
    status: 'available',
    stock: 1,
    featured: true,
  },
  {
    slug: 'pixel-8-pro',
    title: 'Pixel 8 Pro — Tensor Study',
    brand: 'Google',
    phoneModel: 'Pixel 8 Pro, 256GB, Bay Blue',
    description:
      'A close study of Google\'s Tensor G3 board alongside the Pixel 8 Pro\'s temperature sensor and camera bar hardware. Cool blue backing pays homage to the original "Bay" colourway.',
    price: 1299900,
    type: 'handcrafted',
    status: 'available',
    stock: 1,
    featured: true,
  },
  {
    slug: 'iphone-14-pro',
    title: 'iPhone 14 Pro — Dynamic Island Teardown',
    brand: 'Apple',
    phoneModel: 'iPhone 14 Pro, 128GB, Deep Purple',
    description:
      'One of our most requested pieces — the 14 Pro\'s camera housing sits front and centre, with the board and battery fanned out beneath it. A great entry point into collecting handcrafted teardown art.',
    price: 1099900,
    type: 'handcrafted',
    status: 'reserved',
    stock: 1,
    featured: false,
  },
  {
    slug: 'oneplus-12',
    title: 'OnePlus 12 — Speed Study',
    brand: 'OnePlus',
    phoneModel: 'OnePlus 12, 512GB, Flowy Emerald',
    description:
      'OnePlus\'s flagship cooling system is the star here — the vapour chamber and Snapdragon 8 Gen 3 board are mounted side by side to show off just how much engineering goes into keeping this phone cool under load.',
    price: 949900,
    type: 'handcrafted',
    status: 'available',
    stock: 1,
    featured: false,
  },
  {
    slug: 'galaxy-z-fold-5',
    title: 'Galaxy Z Fold 5 — Hinge Anatomy',
    brand: 'Samsung',
    phoneModel: 'Galaxy Z Fold 5, 512GB, Phantom Black',
    description:
      'Foldables are the hardest teardown we do — this piece captures the Z Fold 5\'s hinge mechanism, flexible display layer, and dual battery pack in a single wide-format frame. A genuine showpiece.',
    price: 2499900,
    type: 'handcrafted',
    status: 'sold',
    stock: 0,
    featured: false,
  },
  {
    slug: 'iphone-13-mini',
    title: 'iPhone 13 Mini — Compact Composition',
    brand: 'Apple',
    phoneModel: 'iPhone 13 Mini, 128GB, Starlight',
    description:
      'Proof that small phones have just as much to look at — a tightly-packed, symmetrical layout of the 13 Mini\'s board and dual camera system in a compact square frame.',
    price: 100000,
    type: 'printed',
    status: 'available',
    stock: 6,
    featured: false,
  },
  {
    slug: 'xperia-1-v',
    title: 'Xperia 1 V — Photographer\'s Cut',
    brand: 'Sony',
    phoneModel: 'Sony Xperia 1 V, 256GB, Black',
    description:
      'A print run inspired by Sony\'s camera-first flagship — built around the Xperia 1 V\'s telephoto module and dedicated imaging chip. A great gift for the photographer in your life.',
    price: 79900,
    type: 'printed',
    status: 'available',
    stock: 8,
    featured: true,
  },
];

export function runSeed() {
  createAdminIfMissing(DEFAULT_ADMIN_EMAIL.toLowerCase(), DEFAULT_ADMIN_PASSWORD);

  const { c: frameCount } = db.prepare('SELECT COUNT(*) c FROM frames').get();
  if (frameCount > 0) return; // already seeded

  for (const item of SAMPLE_FRAMES) {
    const id = createFrame(item);
    const images = [1, 2, 3].map((n) => `/img/seed/${item.slug}-${n}.jpg`);
    setFrameImages(id, images);
  }
  console.log(`Seeded ${SAMPLE_FRAMES.length} sample frames and admin account (${DEFAULT_ADMIN_EMAIL}).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
  console.log('Seed complete.');
}
