import { db } from './db.js';
import { genOrderNumber } from './utils.js';
import { deleteImageFile } from './images.js';

/* ---------------------------- Frames ---------------------------- */

function attachImages(frame) {
  if (!frame) return frame;
  const images = db
    .prepare('SELECT id, url, sort_order FROM frame_images WHERE frame_id = ? ORDER BY sort_order ASC, id ASC')
    .all(frame.id);
  return { ...frame, images };
}

function parseJsonArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

// box_contents/highlights are stored as JSON text on the row — give callers
// the parsed shape instead of making every view do it.
function parseSpecs(frame) {
  if (!frame) return frame;
  return {
    ...frame,
    boxContents: parseJsonArray(frame.box_contents),
    highlights: parseJsonArray(frame.highlights),
  };
}

export function listFrames({ type, brand, status, q, sort = 'newest', featuredOnly = false, availableFirst = false } = {}) {
  const clauses = [];
  const params = [];
  if (type) {
    clauses.push('type = ?');
    params.push(type);
  }
  if (brand) {
    clauses.push('brand = ?');
    params.push(brand);
  }
  if (status) {
    clauses.push('status = ?');
    params.push(status);
  } else {
    // by default, don't hide anything on admin; public callers pass status explicitly if needed
  }
  if (q) {
    clauses.push('(title LIKE ? OR phone_model LIKE ? OR brand LIKE ? OR description LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (featuredOnly) clauses.push('featured = 1');

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const orderBy =
    {
      newest: 'created_at DESC',
      price_asc: 'price ASC',
      price_desc: 'price DESC',
      title_asc: 'title ASC',
    }[sort] || 'created_at DESC';
  // Available pieces surface first (then reserved, then sold), with the chosen
  // sort applied as the tiebreaker within each group.
  const fullOrderBy = availableFirst
    ? `CASE status WHEN 'available' THEN 0 WHEN 'reserved' THEN 1 ELSE 2 END, ${orderBy}`
    : orderBy;

  const frames = db.prepare(`SELECT * FROM frames ${where} ORDER BY ${fullOrderBy}`).all(...params);
  const ids = frames.map((f) => f.id);
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const allImages = db
    .prepare(`SELECT frame_id, url, sort_order FROM frame_images WHERE frame_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`)
    .all(...ids);
  return frames.map((f) => ({
    ...f,
    images: allImages.filter((img) => img.frame_id === f.id),
  }));
}

export function listBrands() {
  return db.prepare('SELECT DISTINCT brand FROM frames ORDER BY brand ASC').all().map((r) => r.brand);
}

export function getFrameById(id) {
  const frame = db.prepare('SELECT * FROM frames WHERE id = ?').get(id);
  return parseSpecs(attachImages(frame));
}

export function getFramesByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const frames = db.prepare(`SELECT * FROM frames WHERE id IN (${placeholders})`).all(...ids);
  return frames.map(attachImages);
}

export function createFrame(data) {
  const result = db
    .prepare(
      `INSERT INTO frames (title, brand, phone_model, description, price, type, status, stock, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.title,
      data.brand,
      data.phoneModel,
      data.description,
      data.price,
      data.type,
      data.status,
      data.stock,
      data.featured ? 1 : 0
    );
  return Number(result.lastInsertRowid);
}

export function updateFrame(id, data) {
  db.prepare(
    `UPDATE frames SET title=?, brand=?, phone_model=?, description=?, price=?, type=?, status=?, stock=?, featured=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(data.title, data.brand, data.phoneModel, data.description, data.price, data.type, data.status, data.stock, data.featured ? 1 : 0, id);
}

// Product-detail spec fields (material/size/units/box contents/highlights)
// are curated in seed.js rather than the admin UI for now — same pattern as
// description/type syncing below. This just persists that seed data.
export function setFrameSpecs(frameId, { material = '', sizeLabel = '', unitsLabel = '', boxContents = [], highlights = [] } = {}) {
  db.prepare(
    `UPDATE frames SET material=?, size_label=?, units_label=?, box_contents=?, highlights=? WHERE id=?`
  ).run(material, sizeLabel, unitsLabel, JSON.stringify(boxContents), JSON.stringify(highlights), frameId);
}

export function setFrameImages(frameId, orderedUrls) {
  // Replace all images for a frame with the given ordered list of URLs.
  const existing = db.prepare('SELECT id, url FROM frame_images WHERE frame_id = ?').all(frameId);
  const keepUrls = new Set(orderedUrls);
  for (const img of existing) {
    if (!keepUrls.has(img.url)) {
      deleteImageFile(img.url);
    }
  }
  db.prepare('DELETE FROM frame_images WHERE frame_id = ?').run(frameId);
  const insert = db.prepare('INSERT INTO frame_images (frame_id, url, sort_order) VALUES (?, ?, ?)');
  orderedUrls.forEach((url, idx) => insert.run(frameId, url, idx));
}

export function deleteFrame(id) {
  const images = db.prepare('SELECT url FROM frame_images WHERE frame_id = ?').all(id);
  images.forEach((img) => deleteImageFile(img.url));
  db.prepare('DELETE FROM frames WHERE id = ?').run(id);
}

/* ---------------------------- Orders ---------------------------- */

export function createOrder({ customer, items }) {
  if (!items || items.length === 0) throw new Error('Your cart is empty.');
  const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip'];
  for (const field of required) {
    if (!customer[field] || !String(customer[field]).trim()) {
      throw new Error(`Please provide your ${field}.`);
    }
  }
  if (!/^\S+@\S+\.\S+$/.test(customer.email)) throw new Error('Please provide a valid email address.');

  const frameIds = items.map((i) => i.frameId);
  const frames = getFramesByIds(frameIds);

  let total = 0;
  const lineItems = [];
  for (const item of items) {
    const frame = frames.find((f) => f.id === item.frameId);
    if (!frame) throw new Error('One of the items in your cart is no longer available.');
    if (frame.status !== 'available') throw new Error(`"${frame.title}" is no longer available.`);
    const qty = Math.max(1, Math.min(item.quantity || 1, frame.stock));
    total += frame.price * qty;
    lineItems.push({ frame, qty });
  }

  const orderNumber = genOrderNumber();
  db.exec('BEGIN');
  try {
    const orderResult = db
      .prepare(
        `INSERT INTO orders (order_number, customer_name, email, phone, address, city, state, zip, country, total_amount, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        orderNumber,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
        customer.zip,
        customer.country || 'India',
        total,
        customer.notes || null
      );
    const orderId = Number(orderResult.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, frame_id, title_snapshot, price_snapshot, quantity) VALUES (?, ?, ?, ?, ?)`
    );
    for (const { frame, qty } of lineItems) {
      insertItem.run(orderId, frame.id, frame.title, frame.price, qty);
      const remaining = frame.stock - qty;
      db.prepare(`UPDATE frames SET stock = ?, status = ?, updated_at = datetime('now') WHERE id = ?`).run(
        Math.max(remaining, 0),
        remaining <= 0 ? 'sold' : frame.status,
        frame.id
      );
    }
    db.exec('COMMIT');
    return { orderId, orderNumber, total };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function attachOrderItems(order) {
  if (!order) return order;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  return { ...order, items };
}

export function getOrderByNumber(orderNumber) {
  return attachOrderItems(db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber));
}

export function getOrderByNumberAndEmail(orderNumber, email) {
  return attachOrderItems(
    db.prepare('SELECT * FROM orders WHERE order_number = ? AND email = ?').get(orderNumber, email)
  );
}

export function getOrderById(id) {
  return attachOrderItems(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
}

export function listOrders({ status } = {}) {
  if (status) return db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status);
  return db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
}

export function updateOrderStatus(id, { status, paymentStatus }) {
  db.prepare(
    `UPDATE orders SET status = ?, payment_status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, paymentStatus, id);
}

/* ---------------------------- Feedback ---------------------------- */

export function createFeedback(data) {
  if (!data.name || !data.email || !data.message) throw new Error('Please fill in your name, email, and message.');
  const result = db
    .prepare('INSERT INTO feedback (name, email, message, rating, frame_id) VALUES (?, ?, ?, ?, ?)')
    .run(data.name, data.email, data.message, data.rating || null, data.frameId || null);
  return Number(result.lastInsertRowid);
}

export function listFeedback({ unreadOnly = false } = {}) {
  if (unreadOnly) return db.prepare('SELECT * FROM feedback WHERE is_read = 0 ORDER BY created_at DESC').all();
  return db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
}

export function markFeedbackRead(id) {
  db.prepare('UPDATE feedback SET is_read = 1 WHERE id = ?').run(id);
}

/* ---------------------------- Dashboard stats ---------------------------- */

export function getDashboardStats() {
  const totalFrames = db.prepare('SELECT COUNT(*) c FROM frames').get().c;
  const availableFrames = db.prepare("SELECT COUNT(*) c FROM frames WHERE status = 'available'").get().c;
  const totalOrders = db.prepare('SELECT COUNT(*) c FROM orders').get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'pending'").get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(total_amount),0) s FROM orders WHERE payment_status = 'paid'").get().s;
  const unreadFeedback = db.prepare('SELECT COUNT(*) c FROM feedback WHERE is_read = 0').get().c;
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
  const recentFeedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5').all();
  return { totalFrames, availableFrames, totalOrders, pendingOrders, revenue, unreadFeedback, recentOrders, recentFeedback };
}

/* ---------------------------- Site settings ---------------------------- */

export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}

const DEFAULT_WHY_CHOOSE_BLOCKS = [
  { image: '/img/figma2/why-choose.jpg', heading: 'All functional components are shown', description: 'No one does as meticulous teardown as us. Not even YouTubers!' },
  { image: '/img/figma2/why-choose.jpg', heading: 'Composition showing connections', description: 'Every frame is arranged to show how the parts actually connect.' },
  { image: '/img/figma2/why-choose.jpg', heading: 'Top tier aesthetics', description: 'We don’t cut corners for looks — form and function, side by side.' },
  { image: '/img/figma2/why-choose.jpg', heading: 'Hand crafted pieces', description: 'Truly one-of-a-kind — every frame is assembled by hand.' },
];

export function getWhyChooseBlocks() {
  const raw = getSetting('why_choose_blocks', null);
  if (!raw) return DEFAULT_WHY_CHOOSE_BLOCKS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (err) {
    /* fall through to default */
  }
  return DEFAULT_WHY_CHOOSE_BLOCKS;
}

export function setWhyChooseBlockImage(index, url) {
  const blocks = getWhyChooseBlocks().map((b) => ({ ...b }));
  if (!blocks[index]) return blocks;
  blocks[index].image = url;
  setSetting('why_choose_blocks', JSON.stringify(blocks));
  return blocks;
}

/* ---------------------------- Wall compositions ---------------------------- */

// The homepage's "wall carousel" shows a handful of room-photo backgrounds with
// up to 4 existing frames composited on top (see admin/walls). Compositions are
// stored the same way as why_choose_blocks: one JSON blob under site_settings,
// keyed by a stable string id (not array index) so deletes never shift ids out
// from under an in-progress edit.
//
// If nothing has been saved yet (or the saved data references frames that no
// longer exist), we build a default straight from whatever frames are actually
// in the database right now — so the carousel always shows real, working
// pieces even right after a fresh seed or a data reset.
const WALL_BACKGROUNDS = [
  'https://images.pexels.com/photos/6970077/pexels-photo-6970077.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/5824815/pexels-photo-5824815.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/28744513/pexels-photo-28744513.jpeg?auto=compress&cs=tinysrgb&w=1600',
];

const WALL_PLACEMENT_SETS = [
  [
    { x: 12, y: 24, width: 15, rotation: -3 },
    { x: 33, y: 12, width: 13, rotation: 2 },
    { x: 53, y: 30, width: 16, rotation: -1 },
    { x: 76, y: 16, width: 14, rotation: 3 },
  ],
  [
    { x: 15, y: 32, width: 14, rotation: 2 },
    { x: 38, y: 10, width: 16, rotation: -2 },
    { x: 60, y: 26, width: 13, rotation: 1 },
    { x: 80, y: 14, width: 15, rotation: -3 },
  ],
  [
    { x: 10, y: 16, width: 16, rotation: 1 },
    { x: 34, y: 34, width: 14, rotation: -2 },
    { x: 56, y: 14, width: 15, rotation: 2 },
    { x: 78, y: 30, width: 13, rotation: -1 },
  ],
];

function buildDefaultWallCompositions() {
  const ids = db.prepare('SELECT id FROM frames ORDER BY id ASC').all().map((r) => r.id);
  if (!ids.length) return [];
  return WALL_BACKGROUNDS.map((background, wi) => ({
    id: `wall-${wi + 1}`,
    background,
    frames: WALL_PLACEMENT_SETS[wi].map((p, fi) => ({
      frameId: ids[(wi * 4 + fi) % ids.length],
      ...p,
      z: fi + 1,
    })),
  }));
}

export function getWallCompositions() {
  const raw = getSetting('wall_compositions', null);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (err) {
      /* fall through to default */
    }
  }
  return buildDefaultWallCompositions();
}

export function setWallCompositions(compositions) {
  setSetting('wall_compositions', JSON.stringify(compositions));
}

function sanitizeWallFrames(frames) {
  return (Array.isArray(frames) ? frames : [])
    .map((f) => ({
      frameId: Number(f.frameId),
      x: Number(f.x) || 0,
      y: Number(f.y) || 0,
      width: Number(f.width) || 15,
      rotation: Number(f.rotation) || 0,
      z: Number(f.z) || 1,
    }))
    .filter((f) => Number.isInteger(f.frameId))
    .slice(0, 4);
}

export function addWallComposition({ background, frames }) {
  const list = getWallCompositions().map((w) => ({ ...w }));
  const id = `wall-${Date.now().toString(36)}`;
  list.push({ id, background: background || '', frames: sanitizeWallFrames(frames) });
  setWallCompositions(list);
  return id;
}

export function updateWallComposition(id, { background, frames }) {
  const list = getWallCompositions().map((w) =>
    w.id === id ? { ...w, background: background || '', frames: sanitizeWallFrames(frames) } : w
  );
  setWallCompositions(list);
}

export function deleteWallComposition(id) {
  setWallCompositions(getWallCompositions().filter((w) => w.id !== id));
}

export function getWallCompositionById(id) {
  return getWallCompositions().find((w) => w.id === id) || null;
}

/* ---------------------------- Snake leaderboard ---------------------------- */

export function recordSnakeScore(customerId, score) {
  if (!Number.isInteger(score) || score < 0) throw new Error('Invalid score.');
  db.prepare('INSERT INTO snake_scores (customer_id, score) VALUES (?, ?)').run(customerId, score);
}

export function getSnakeLeaderboard(limit = 10) {
  // Best single score per customer, ranked highest first.
  return db
    .prepare(
      `SELECT c.display_name AS displayName, MAX(s.score) AS score
       FROM snake_scores s
       JOIN customers c ON c.id = s.customer_id
       GROUP BY s.customer_id
       ORDER BY score DESC
       LIMIT ?`
    )
    .all(limit);
}

export function getCustomerBestScore(customerId) {
  const row = db.prepare('SELECT MAX(score) AS best FROM snake_scores WHERE customer_id = ?').get(customerId);
  return row?.best || 0;
}
