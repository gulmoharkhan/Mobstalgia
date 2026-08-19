// Seeds the database with an admin account and a sample catalog, but only if the
// database is empty — safe to run every time the server starts.
import { db } from './db.js';
import { createAdminIfMissing } from './auth.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './config.js';
import { createFrame, setFrameImages } from './models.js';

// Mobstalgia is a DIY frame-kit business: we send a frame, you dismantle your
// own device and mount it yourself. These ten pieces are the inspiration
// gallery — real devices, framed as examples of what your own drawer phone
// could become. "type" doubles as a teardown-difficulty tier: 'novice' means
// case, main board, battery and display; 'expert' means going past the board
// into hidden components — camera modules, Taptic Engines, vibration motors.
const SAMPLE_FRAMES = [
  {
    slug: 'apple-watch-series-3',
    title: 'Apple Watch Series 3 — Wrist-Sized Wonder',
    brand: 'Apple',
    phoneModel: 'Apple Watch Series 3, 38mm / 42mm, GPS or Cellular',
    description:
      "Inside a case smaller than a coin sits a complete computer — S3 chip, Taptic Engine, and a battery curved to fit your wrist. This is an Expert-tier build: every part is tiny, dense, and easy to lose, and getting to the Taptic Engine is the real test. If yours has been sitting in a drawer since the Series 4 came out, it's ready for a second life on your wall.",
    price: 149900,
    type: 'expert',
    status: 'available',
    stock: 30,
    featured: true,
  },
  {
    slug: 'nokia-n91',
    title: 'Nokia N91 — The Original Music Phone',
    brand: 'Nokia',
    phoneModel: 'Nokia N91, 4GB / 8GB, Music Edition',
    description:
      "Before phones did everything, the N91 did one thing brilliantly: it carried your entire music library on a genuine spinning hard disk, inside a phone. That's a piece of engineering history most people have never actually seen. Frame it, and give that history a wall instead of a drawer.",
    price: 199900,
    type: 'novice',
    status: 'available',
    stock: 25,
    featured: true,
  },
  {
    slug: 'nokia-n73',
    title: 'Nokia N73 — The Camera Icon',
    brand: 'Nokia',
    phoneModel: 'Nokia N73, Music Edition / Classic',
    description:
      'The N73 made a 3.2-megapixel Carl Zeiss lens something to brag about. Open it up and the board is a study in symmetry — camera module, keypad flex, and speaker sitting in near-perfect balance. Expert tier: freeing that camera module intact, without snapping its ribbon, is the whole challenge. This was the phone half a generation carried everywhere; taking it apart now feels like opening a time capsule.',
    price: 199900,
    type: 'expert',
    status: 'available',
    stock: 25,
    featured: false,
  },
  {
    slug: 'nokia-n8',
    title: "Nokia N8 — Symbian's Last Stand",
    brand: 'Nokia',
    phoneModel: 'Nokia N8, 16GB, Anodised Aluminium',
    description:
      "The N8 packed a 12-megapixel, Xenon-flash camera into an aluminium unibody years before that was normal. Underneath the shell is a dense, confident layout that still looks modern once it's laid flat and framed. For anyone who swore by Nokia before the world went all touchscreen icons, this one's personal.",
    price: 219900,
    type: 'novice',
    status: 'available',
    stock: 20,
    featured: false,
  },
  {
    slug: 'iphone-5s',
    title: 'iPhone 5S — Where Touch ID Began',
    brand: 'Apple',
    phoneModel: 'iPhone 5S, 16GB / 32GB / 64GB',
    description:
      "The 5S introduced Touch ID and the A7 chip, the first 64-bit processor to ship in a phone — a genuine turning point. Its logic board is compact but purposeful, with the fingerprint sensor's flex cable a small piece of history in itself. Expert tier: extracting the Touch ID sensor without wrecking that cable is the part most people never even attempt. If this was your first 'real' iPhone, you already know why it deserves a frame.",
    price: 269900,
    type: 'expert',
    status: 'available',
    stock: 25,
    featured: true,
  },
  {
    slug: 'iphone-4s',
    title: 'iPhone 4S — The One With Siri',
    brand: 'Apple',
    phoneModel: 'iPhone 4S, 16GB / 32GB / 64GB',
    description:
      "Glass front, glass back, and Siri talking to you for the first time — the 4S is the phone a lot of us fell for smartphones on. Inside, its glass-and-steel sandwich opens to reveal one of the most tightly engineered boards Apple ever shipped, plus a camera assembly and vibration motor packed in tighter than you'd expect. Expert tier, and a genuinely satisfying one to take apart.",
    price: 249900,
    type: 'expert',
    status: 'available',
    stock: 25,
    featured: false,
  },
  {
    slug: 'iphone-4',
    title: 'iPhone 4 — The Design That Changed Everything',
    brand: 'Apple',
    phoneModel: 'iPhone 4, 8GB / 16GB / 32GB',
    description:
      'Steve Jobs called it the biggest leap since the original iPhone, and the design still holds up today. Stainless steel band, glass on both sides, a Retina display that reset expectations. Taking one apart means handling a genuine design landmark, piece by piece.',
    price: 249900,
    type: 'novice',
    status: 'available',
    stock: 25,
    featured: true,
  },
  {
    slug: 'iphone-3gs',
    title: "iPhone 3GS — Where It Really Took Off",
    brand: 'Apple',
    phoneModel: 'iPhone 3GS, 8GB / 16GB / 32GB',
    description:
      "The 3GS is where the App Store generation truly began — faster, smarter, and the phone that convinced a lot of people to switch for good. Its curved plastic shell hides a surprisingly simple, elegant internal layout. Nostalgia doesn't get much purer than this.",
    price: 229900,
    type: 'novice',
    status: 'available',
    stock: 20,
    featured: false,
  },
  {
    slug: 'ipod-classic-2nd-gen',
    title: "iPod Classic (2nd Gen) — A Thousand Songs In Your Pocket",
    brand: 'Apple',
    phoneModel: 'iPod Classic, 2nd Generation, 10GB / 20GB',
    description:
      "Before the iPhone, there was this — the device that put a real hard drive and a click wheel in your pocket and changed how the world listened to music. Its insides are larger and more mechanical than anything that came after, which makes for a genuinely striking frame. For the collectors who remember exactly where their music library used to live.",
    price: 299900,
    type: 'novice',
    status: 'available',
    stock: 18,
    featured: true,
  },
  {
    slug: 'iphone-6',
    title: 'iPhone 6 — The One Everyone Had',
    brand: 'Apple',
    phoneModel: 'iPhone 6, 16GB / 64GB / 128GB',
    description:
      "Bigger screen, thinner body, sold in record numbers — the iPhone 6 is probably the most-owned phone on this page, and probably the one most likely still sitting in your own drawer right now. If any device here is 'the one', it's this.",
    price: 259900,
    type: 'novice',
    status: 'available',
    stock: 30,
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
