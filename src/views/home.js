import { escapeHtml, formatCurrency } from '../utils.js';
import { SITE_TAGLINE } from '../config.js';

function productCard(frame, index = 0) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  const delay = Math.min(index * 45, 360);
  return `
  <a class="product-card" href="/piece/${frame.id}" data-reveal style="--reveal-delay:${delay}ms">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
      ${frame.status === 'sold' ? '<span class="badge badge--sold">Sold</span>' : ''}
      ${frame.status === 'reserved' ? '<span class="badge badge--reserved">Reserved</span>' : ''}
      <span class="badge badge--type">${frame.type === 'handcrafted' ? 'Handcrafted' : 'Printed'}</span>
    </div>
    <div class="product-card-title">${escapeHtml(frame.title)}</div>
    <div class="product-card-sub">${escapeHtml(frame.brand)} · ${escapeHtml(frame.phone_model)}</div>
    <div class="product-card-price">${formatCurrency(frame.price)}</div>
  </a>`;
}

export function renderHome({ featured, recent, stats }) {
  return `
  <section class="hero">
    <div class="container">
      <div class="hero-eyebrow" data-reveal><span class="status-dot" aria-hidden="true"></span>One-of-a-kind wall art from real phone teardowns</div>
      <h1 data-reveal style="--reveal-delay:70ms">Every flagship phone has a beautiful skeleton. We frame it.</h1>
      <p class="lead" data-reveal style="--reveal-delay:140ms">${escapeHtml(SITE_TAGLINE)}. Each piece is built by hand from a real, fully disassembled premium phone — circuit boards, camera modules, batteries and all — arranged and mounted as gallery-ready art.</p>
      <div class="hero-actions" data-reveal style="--reveal-delay:210ms">
        <a href="/shop" class="btn" data-magnetic>Browse the Collection</a>
        <a href="/about" class="btn btn--outline">How it's made</a>
      </div>
    </div>
  </section>

  <div class="stat-strip">
    <div data-reveal><strong class="mono">${stats.totalFrames}</strong><span>Pieces created</span></div>
    <div data-reveal style="--reveal-delay:50ms"><strong class="mono">${stats.available}</strong><span>Available now</span></div>
    <div data-reveal style="--reveal-delay:100ms"><strong class="mono">100%</strong><span>Hand-teardown sourced</span></div>
    <div data-reveal style="--reveal-delay:150ms"><strong class="mono">2</strong><span>Finishes: handcrafted &amp; printed</span></div>
  </div>

  <section class="section container">
    <div class="section-head" data-reveal>
      <h2>Featured pieces</h2>
      <p>A few of the current standouts</p>
    </div>
    <div class="product-grid">
      ${featured.map((f, i) => productCard(f, i)).join('') || '<p>New pieces are on the way — check back soon.</p>'}
    </div>
  </section>

  <section class="section container" style="padding-top:0;">
    <div class="section-head" data-reveal>
      <h2>Latest additions</h2>
      <a href="/shop" class="link-btn">View all →</a>
    </div>
    <div class="product-grid">
      ${recent.map((f, i) => productCard(f, i)).join('') || '<p>No pieces listed yet.</p>'}
    </div>
  </section>
  `;
}
