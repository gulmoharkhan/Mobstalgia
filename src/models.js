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
  return attachImages(frame);
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
