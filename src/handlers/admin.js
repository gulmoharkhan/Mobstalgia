import { renderAdminLogin } from '../views/admin/login.js';
import { renderAdminLayout } from '../views/admin/layout.js';
import { renderDashboard } from '../views/admin/dashboard.js';
import { renderFramesList } from '../views/admin/framesList.js';
import { renderFrameForm } from '../views/admin/frameForm.js';
import { renderOrdersList } from '../views/admin/ordersList.js';
import { renderOrderDetail } from '../views/admin/orderDetail.js';
import { renderFeedbackList } from '../views/admin/feedbackList.js';
import { renderSettings } from '../views/admin/settings.js';
import { renderWallsList } from '../views/admin/wallsList.js';
import { renderWallEditor } from '../views/admin/wallEditor.js';
import { sendHtml, sendJson, redirect, rupeesToPaise } from '../utils.js';
import { findAdminByEmail, verifyPassword, createSession, destroySession, hashPassword } from '../auth.js';
import { SESSION_COOKIE, ORDER_STATUSES, PAYMENT_STATUSES, FRAME_TYPES, FRAME_STATUSES } from '../config.js';
import * as models from '../models.js';
import { saveBase64Image } from '../images.js';
import { db } from '../db.js';

/* ---------------------------- Auth ---------------------------- */

// In production (behind HTTPS — true on virtually every host), mark the session
// cookie Secure so it's never sent over plain HTTP. Locally (NODE_ENV unset) it's
// left off so http://localhost keeps working without TLS.
const COOKIE_SECURE_FLAG = process.env.NODE_ENV === 'production' ? '; Secure' : '';

export async function loginPageGet(ctx) {
  sendHtml(ctx.res, 200, renderAdminLogin({}));
}

export async function loginPagePost(ctx) {
  const { email, password } = ctx.form;
  const admin = findAdminByEmail((email || '').trim().toLowerCase());
  if (!admin || !verifyPassword(password || '', admin.salt, admin.password_hash)) {
    return sendHtml(ctx.res, 401, renderAdminLogin({ error: 'Incorrect email or password.' }));
  }
  const { token, expires } = createSession(admin.id);
  redirect(ctx.res, '/admin', {
    'Set-Cookie': `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax${COOKIE_SECURE_FLAG}`,
  });
}

export async function logoutPost(ctx) {
  if (ctx.cookies[SESSION_COOKIE]) destroySession(ctx.cookies[SESSION_COOKIE]);
  redirect(ctx.res, '/admin/login', {
    'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${COOKIE_SECURE_FLAG}`,
  });
}

/* ---------------------------- Dashboard ---------------------------- */

export async function dashboard(ctx) {
  const stats = models.getDashboardStats();
  const html = renderAdminLayout({
    title: 'Dashboard',
    activeNav: 'dashboard',
    adminEmail: ctx.admin.email,
    bodyHtml: renderDashboard({ stats }),
  });
  sendHtml(ctx.res, 200, html);
}

/* ---------------------------- Frames ---------------------------- */

export async function framesListPage(ctx) {
  const frames = models.listFrames();
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Frames', activeNav: 'frames', adminEmail: ctx.admin.email, bodyHtml: renderFramesList({ frames }) })
  );
}

export async function frameNewPage(ctx) {
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Add Frame', activeNav: 'frames', adminEmail: ctx.admin.email, bodyHtml: renderFrameForm({ frame: null, mode: 'new' }) })
  );
}

export async function frameEditPage(ctx) {
  const frame = models.getFrameById(Number(ctx.params.id));
  if (!frame) return sendHtml(ctx.res, 404, 'Frame not found');
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Edit Frame', activeNav: 'frames', adminEmail: ctx.admin.email, bodyHtml: renderFrameForm({ frame, mode: 'edit' }) })
  );
}

function validateFramePayload(body) {
  if (!body.title || !String(body.title).trim()) throw new Error('Title is required.');
  if (!body.brand || !String(body.brand).trim()) throw new Error('Brand is required.');
  if (!body.phoneModel || !String(body.phoneModel).trim()) throw new Error('Phone model is required.');
  if (!body.description || !String(body.description).trim()) throw new Error('Description is required.');
  const price = rupeesToPaise(body.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a valid number.');
  const stock = parseInt(body.stock, 10);
  if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a whole number.');
  if (!FRAME_TYPES.includes(body.type)) throw new Error('Invalid type.');
  if (!FRAME_STATUSES.includes(body.status)) throw new Error('Invalid status.');
  return {
    title: String(body.title).trim(),
    brand: String(body.brand).trim(),
    phoneModel: String(body.phoneModel).trim(),
    description: String(body.description).trim(),
    price,
    stock,
    type: body.type,
    status: body.status,
    featured: !!body.featured,
  };
}

// Product-detail spec fields (material/size/units/box contents/highlights) are
// optional and edited from the admin form. Highlight images arrive either as an
// existing image URL (unchanged) or a fresh data: URL from a file upload, which
// gets saved to disk here just like the main product images.
function extractSpecsPayload(body) {
  const material = body.material ? String(body.material).trim() : '';
  const sizeLabel = body.sizeLabel ? String(body.sizeLabel).trim() : '';
  const unitsLabel = body.unitsLabel ? String(body.unitsLabel).trim() : '';
  const boxContents = Array.isArray(body.boxContents)
    ? body.boxContents.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const highlights = (Array.isArray(body.highlights) ? body.highlights : [])
    .map((h, i) => {
      const title = h?.title ? String(h.title).trim() : '';
      const hBody = h?.body ? String(h.body).trim() : '';
      let image = h?.image ? String(h.image) : '';
      if (image.startsWith('data:')) {
        image = saveBase64Image(image, h.filename || `highlight-${i}`);
      }
      return { title, body: hBody, image };
    })
    .filter((h) => h.title || h.body || h.image);
  return { material, sizeLabel, unitsLabel, boxContents, highlights };
}

export async function frameCreateApi(ctx) {
  try {
    const body = ctx.json;
    const data = validateFramePayload(body);
    const id = models.createFrame(data);

    const urls = [];
    for (const img of body.newImages || []) {
      urls.push(saveBase64Image(img.dataBase64, img.filename));
    }
    if (urls.length) models.setFrameImages(id, urls);

    models.setFrameSpecs(id, extractSpecsPayload(body));

    sendJson(ctx.res, 200, { id });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function frameUpdateApi(ctx) {
  try {
    const id = Number(ctx.params.id);
    const existingFrame = models.getFrameById(id);
    if (!existingFrame) throw new Error('Frame not found.');
    const body = ctx.json;
    const data = validateFramePayload(body);
    models.updateFrame(id, data);

    // Build final ordered image URL list: keep existing (by id, in given order) + append new uploads.
    const keepIds = (body.existingImageIds || []).map(Number);
    const existingByI = new Map(existingFrame.images.map((img) => [img.id, img.url]));
    const orderedUrls = [];
    for (const keepId of keepIds) {
      if (existingByI.has(keepId)) orderedUrls.push(existingByI.get(keepId));
    }
    for (const img of body.newImages || []) {
      orderedUrls.push(saveBase64Image(img.dataBase64, img.filename));
    }
    models.setFrameImages(id, orderedUrls);

    models.setFrameSpecs(id, extractSpecsPayload(body));

    sendJson(ctx.res, 200, { id });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function frameDeletePost(ctx) {
  models.deleteFrame(Number(ctx.params.id));
  redirect(ctx.res, '/admin/frames');
}

export async function frameBulkDeleteApi(ctx) {
  try {
    const rawIds = Array.isArray(ctx.json?.ids) ? ctx.json.ids : [];
    const ids = [...new Set(rawIds.map(Number).filter(Number.isInteger))];
    if (!ids.length) throw new Error('No frames selected.');
    for (const id of ids) models.deleteFrame(id);
    sendJson(ctx.res, 200, { deleted: ids.length });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

/* ---------------------------- Orders ---------------------------- */

export async function ordersListPage(ctx) {
  const status = ctx.query.status || '';
  const orders = models.listOrders({ status: status || undefined });
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({
      title: 'Orders',
      activeNav: 'orders',
      adminEmail: ctx.admin.email,
      bodyHtml: renderOrdersList({ orders, statusFilter: status }),
    })
  );
}

export async function orderDetailPage(ctx) {
  const order = models.getOrderById(Number(ctx.params.id));
  if (!order) return sendHtml(ctx.res, 404, 'Order not found');
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: order.order_number, activeNav: 'orders', adminEmail: ctx.admin.email, bodyHtml: renderOrderDetail({ order }) })
  );
}

export async function orderStatusPost(ctx) {
  const id = Number(ctx.params.id);
  const { status, paymentStatus } = ctx.form;
  if (!ORDER_STATUSES.includes(status) || !PAYMENT_STATUSES.includes(paymentStatus)) {
    return sendHtml(ctx.res, 400, 'Invalid status');
  }
  models.updateOrderStatus(id, { status, paymentStatus });
  redirect(ctx.res, `/admin/orders/${id}`);
}

/* ---------------------------- Feedback ---------------------------- */

export async function feedbackListPage(ctx) {
  const feedback = models.listFeedback();
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Feedback', activeNav: 'feedback', adminEmail: ctx.admin.email, bodyHtml: renderFeedbackList({ feedback }) })
  );
}

export async function feedbackMarkReadPost(ctx) {
  models.markFeedbackRead(Number(ctx.params.id));
  redirect(ctx.res, '/admin/feedback');
}

/* ---------------------------- Settings ---------------------------- */

export async function settingsPage(ctx) {
  const coverImage = models.getSetting('cover_image_url', '/img/figma2/hero-bg.jpg');
  const whyChooseBlocks = models.getWhyChooseBlocks();
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Settings', activeNav: 'settings', adminEmail: ctx.admin.email, bodyHtml: renderSettings({ adminEmail: ctx.admin.email, coverImage, whyChooseBlocks }) })
  );
}

export async function settingsWhyChooseImageApi(ctx) {
  try {
    const body = ctx.json;
    const index = Number(body?.index);
    if (!Number.isInteger(index) || index < 0 || index > 3) throw new Error('Invalid block.');
    if (!body?.dataBase64) throw new Error('No image provided.');
    const url = saveBase64Image(body.dataBase64, body.filename || `why-choose-${index}`);
    const blocks = models.setWhyChooseBlockImage(index, url);
    sendJson(ctx.res, 200, { url, blocks });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function settingsCoverImageApi(ctx) {
  try {
    const body = ctx.json;
    if (!body?.dataBase64) throw new Error('No image provided.');
    const url = saveBase64Image(body.dataBase64, body.filename || 'cover');
    models.setSetting('cover_image_url', url);
    sendJson(ctx.res, 200, { url });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function settingsPasswordPost(ctx) {
  const { currentPassword, newPassword, confirmPassword } = ctx.form;
  const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(ctx.admin.id);
  const fail = (error) =>
    sendHtml(
      ctx.res,
      400,
      renderAdminLayout({ title: 'Settings', activeNav: 'settings', adminEmail: ctx.admin.email, bodyHtml: renderSettings({ adminEmail: ctx.admin.email, error }) })
    );

  if (!verifyPassword(currentPassword || '', admin.salt, admin.password_hash)) return fail('Current password is incorrect.');
  if (!newPassword || newPassword.length < 8) return fail('New password must be at least 8 characters.');
  if (newPassword !== confirmPassword) return fail('New password and confirmation do not match.');

  const { hash, salt } = hashPassword(newPassword);
  db.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, admin.id);

  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({
      title: 'Settings',
      activeNav: 'settings',
      adminEmail: ctx.admin.email,
      bodyHtml: renderSettings({ adminEmail: ctx.admin.email, success: 'Password updated successfully.' }),
    })
  );
}

/* ---------------------------- Homepage walls ---------------------------- */

export async function wallsListPage(ctx) {
  const walls = models.getWallCompositions();
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Walls', activeNav: 'walls', adminEmail: ctx.admin.email, bodyHtml: renderWallsList({ walls }) })
  );
}

export async function wallNewPage(ctx) {
  const allFrames = models.listFrames();
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({ title: 'Add Wall', activeNav: 'walls', adminEmail: ctx.admin.email, bodyHtml: renderWallEditor({ wall: null, allFrames }) })
  );
}

export async function wallEditPage(ctx) {
  const wall = models.getWallCompositionById(ctx.params.id);
  if (!wall) return sendHtml(ctx.res, 404, 'Wall not found');
  const frameIds = wall.frames.map((f) => f.frameId);
  const framesById = new Map(models.getFramesByIds(frameIds).map((f) => [f.id, f]));
  const wallWithFrames = { ...wall, frames: wall.frames.map((p) => ({ ...p, frame: framesById.get(p.frameId) || null })) };
  const allFrames = models.listFrames();
  sendHtml(
    ctx.res,
    200,
    renderAdminLayout({
      title: 'Edit Wall',
      activeNav: 'walls',
      adminEmail: ctx.admin.email,
      bodyHtml: renderWallEditor({ wall: wallWithFrames, allFrames }),
    })
  );
}

// Background arrives either as a plain URL (stock photo, typed/pasted) or a
// fresh data: URL from a file upload, which gets saved to disk the same way
// frame/highlight images are.
function extractWallPayload(body) {
  let background = body?.background ? String(body.background).trim() : '';
  if (background.startsWith('data:')) {
    background = saveBase64Image(background, body.backgroundFilename || 'wall');
  }
  const frames = (Array.isArray(body?.frames) ? body.frames : []).slice(0, 4);
  return { background, frames };
}

export async function wallCreateApi(ctx) {
  try {
    const payload = extractWallPayload(ctx.json);
    if (!payload.background) throw new Error('Add a background photo first.');
    if (!payload.frames.length) throw new Error('Place at least one frame on the wall.');
    const id = models.addWallComposition(payload);
    sendJson(ctx.res, 200, { id });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function wallUpdateApi(ctx) {
  try {
    const id = ctx.params.id;
    if (!models.getWallCompositionById(id)) throw new Error('Wall not found.');
    const payload = extractWallPayload(ctx.json);
    if (!payload.background) throw new Error('Add a background photo first.');
    if (!payload.frames.length) throw new Error('Place at least one frame on the wall.');
    models.updateWallComposition(id, payload);
    sendJson(ctx.res, 200, { id });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function wallDeletePost(ctx) {
  models.deleteWallComposition(ctx.params.id);
  redirect(ctx.res, '/admin/walls');
}
