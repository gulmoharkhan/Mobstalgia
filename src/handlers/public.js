import { renderLayout } from '../views/layout.js';
import { renderHome } from '../views/home.js';
import { renderShop } from '../views/shop.js';
import { renderPiece } from '../views/piece.js';
import { renderCart } from '../views/cart.js';
import { renderCheckout } from '../views/checkout.js';
import { renderOrderConfirm } from '../views/orderConfirm.js';
import { renderTrack } from '../views/track.js';
import { renderFeedback } from '../views/feedbackPage.js';
import { renderAbout } from '../views/about.js';
import { sendHtml, redirect } from '../utils.js';
import * as models from '../models.js';

export async function home(ctx) {
  let featured = models.listFrames({ status: 'available', featuredOnly: true, sort: 'newest' });
  if (featured.length === 0) featured = models.listFrames({ sort: 'newest', availableFirst: true }).slice(0, 8);
  const coverImage = models.getSetting('cover_image_url', '/img/figma2/hero-bg.jpg');
  const whyChooseBlocks = models.getWhyChooseBlocks();
  const wallCompositions = resolveWallCompositions();
  const html = renderLayout({
    activeNav: 'home',
    customer: ctx.customer,
    bodyHtml: renderHome({ featured, coverImage, whyChooseBlocks, wallCompositions }),
  });
  sendHtml(ctx.res, 200, html);
}

// The wall carousel is stored as bare {frameId, x, y, width, rotation, z}
// placements — attach the actual frame (title + cover image) here so the view
// never has to know about the storage shape, and silently drop any placement
// whose frame has since been deleted.
function resolveWallCompositions() {
  const raw = models.getWallCompositions();
  const frameIds = [...new Set(raw.flatMap((w) => w.frames.map((f) => f.frameId)))];
  const framesById = new Map(models.getFramesByIds(frameIds).map((f) => [f.id, f]));
  return raw
    .map((w) => ({
      ...w,
      frames: w.frames.map((p) => (framesById.has(p.frameId) ? { ...p, frame: framesById.get(p.frameId) } : null)).filter(Boolean),
    }))
    .filter((w) => w.background && w.frames.length);
}

export async function shop(ctx) {
  const { q, brand, type, sort, availability } = ctx.query;
  // "availability" is the user-facing filter (all / available / reserved / sold);
  // it maps straight onto the frame's `status` column.
  const status = availability && availability !== 'all' ? availability : undefined;
  const frames = models.listFrames({ q, brand, type, sort, status, availableFirst: true });
  const brands = models.listBrands();
  const html = renderLayout({
    title: 'Shop',
    activeNav: 'shop',
    customer: ctx.customer,
    bodyHtml: renderShop({ frames, brands, query: { q, brand, type, sort, availability } }),
  });
  sendHtml(ctx.res, 200, html);
}

export async function piece(ctx) {
  const id = Number(ctx.params.id);
  const frame = models.getFrameById(id);
  if (!frame) {
    return sendHtml(ctx.res, 404, renderLayout({ title: 'Not found', customer: ctx.customer, bodyHtml: '<div class="narrow container"><h1>Piece not found</h1><a href="/shop" class="btn">Back to Shop</a></div>' }));
  }
  const related = models
    .listFrames({ brand: frame.brand, status: 'available' })
    .filter((f) => f.id !== frame.id)
    .slice(0, 4);
  const html = renderLayout({
    title: frame.title,
    customer: ctx.customer,
    bodyHtml: renderPiece({ frame, related }),
  });
  sendHtml(ctx.res, 200, html);
}

export async function cartPage(ctx) {
  sendHtml(ctx.res, 200, renderLayout({ title: 'Cart', activeNav: 'cart', customer: ctx.customer, bodyHtml: renderCart() }));
}

export async function checkoutPage(ctx) {
  sendHtml(ctx.res, 200, renderLayout({ title: 'Checkout', customer: ctx.customer, bodyHtml: renderCheckout() }));
}

export async function orderConfirmPage(ctx) {
  const orderNumber = ctx.query.order;
  const order = orderNumber ? models.getOrderByNumber(orderNumber) : null;
  sendHtml(ctx.res, 200, renderLayout({ title: 'Order Confirmed', customer: ctx.customer, bodyHtml: renderOrderConfirm({ order }) }));
}

export async function trackPageGet(ctx) {
  const { order: orderNumber, email } = ctx.query;
  let order = null;
  let submitted = false;
  if (orderNumber && email) {
    submitted = true;
    order = models.getOrderByNumberAndEmail(orderNumber.trim(), email.trim());
  }
  sendHtml(
    ctx.res,
    200,
    renderLayout({
      title: 'Track Order',
      activeNav: 'track',
      customer: ctx.customer,
      bodyHtml: renderTrack({ order, submitted, prefill: { order: orderNumber, email } }),
    })
  );
}

export async function feedbackPageGet(ctx) {
  sendHtml(ctx.res, 200, renderLayout({ title: 'Feedback', activeNav: 'feedback', customer: ctx.customer, bodyHtml: renderFeedback({ submitted: false }) }));
}

export async function feedbackPagePost(ctx) {
  try {
    models.createFeedback({
      name: ctx.form.name,
      email: ctx.form.email,
      message: ctx.form.message,
      rating: ctx.form.rating ? Number(ctx.form.rating) : null,
    });
    sendHtml(ctx.res, 200, renderLayout({ title: 'Feedback', activeNav: 'feedback', customer: ctx.customer, bodyHtml: renderFeedback({ submitted: true }) }));
  } catch (err) {
    sendHtml(
      ctx.res,
      400,
      renderLayout({
        title: 'Feedback',
        activeNav: 'feedback',
        customer: ctx.customer,
        flash: { type: 'error', message: err.message },
        bodyHtml: renderFeedback({ submitted: false }),
      })
    );
  }
}

export async function aboutPage(ctx) {
  const leaderboard = models.getSnakeLeaderboard();
  sendHtml(
    ctx.res,
    200,
    renderLayout({
      title: 'About',
      activeNav: 'about',
      customer: ctx.customer,
      bodyHtml: renderAbout({ customer: ctx.customer, leaderboard }),
    })
  );
}
