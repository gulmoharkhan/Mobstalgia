import { sendJson } from '../utils.js';
import * as models from '../models.js';

function frameSummary(f) {
  return {
    id: f.id,
    title: f.title,
    brand: f.brand,
    phoneModel: f.phone_model,
    price: f.price,
    status: f.status,
    stock: f.stock,
    image: f.images?.[0]?.url || null,
  };
}

export async function getFrames(ctx) {
  const idsParam = ctx.query.ids;
  if (!idsParam) return sendJson(ctx.res, 200, { frames: [] });
  const ids = idsParam
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n));
  const frames = models.getFramesByIds(ids);
  sendJson(ctx.res, 200, { frames: frames.map(frameSummary) });
}

export async function createOrder(ctx) {
  try {
    const { customer, items } = ctx.json;
    if (!customer || !items) throw new Error('Missing order details.');
    const normalizedItems = items
      .map((i) => ({ frameId: Number(i.frameId), quantity: Math.max(1, parseInt(i.quantity, 10) || 1) }))
      .filter((i) => Number.isInteger(i.frameId));
    const result = models.createOrder({ customer, items: normalizedItems });
    sendJson(ctx.res, 200, { orderNumber: result.orderNumber, total: result.total });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function submitFeedback(ctx) {
  try {
    const { name, email, message, rating, frameId } = ctx.json;
    models.createFeedback({ name, email, message, rating: rating ? Number(rating) : null, frameId: frameId ? Number(frameId) : null });
    sendJson(ctx.res, 200, { ok: true });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}
