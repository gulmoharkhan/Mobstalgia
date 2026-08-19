export const SITE_NAME = 'Mobstalgia';
export const SITE_TAGLINE = 'Frame kits for the phone still in your drawer';
export const CURRENCY_SYMBOL = '₹';

export const INSTAGRAM_URL = 'https://www.instagram.com/mobstalgia?igsh=c2w4eW0xbXd5OW1w';

// Seeded on first run — CHANGE THIS PASSWORD after logging in via /admin/settings
export const DEFAULT_ADMIN_EMAIL = 'gulmohar.khan@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'teardown-admin-2026';

export const PAYMENT_INSTRUCTIONS = [
  'This store does not yet take card payments online — that\'s the next step once you connect a payment provider (see README).',
  'For now, orders are placed as a reservation. We will email or call you at the contact details you provided to arrange payment (UPI / bank transfer) and confirm your order.',
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUSES = ['unpaid', 'paid'];
export const FRAME_TYPES = ['handcrafted', 'printed'];
export const FRAME_STATUSES = ['available', 'reserved', 'sold'];

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const SESSION_COOKIE = 'tdf_session';
