import { escapeHtml, formatCurrency } from '../utils.js';

const KIT_LABEL = { handcrafted: 'Classic Kit', printed: 'Compact Kit' };

function productCard(frame) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  return `
  <a class="product-card" href="/piece/${frame.id}">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
      <span class="badge badge--type${frame.type === 'printed' ? ' badge--type--printed' : ''}">${KIT_LABEL[frame.type] || 'Frame Kit'}</span>
    </div>
    <div class="product-card-title">${escapeHtml(frame.title)}</div>
    <div class="product-card-sub">${escapeHtml(frame.brand)} · ${escapeHtml(frame.phone_model)}</div>
    <div class="product-card-price">${formatCurrency(frame.price)}</div>
  </a>`;
}

function ctaTile() {
  return `
  <a class="product-card product-card--cta" href="/shop">
    <div class="product-card-cta-inner">
      <span class="product-card-cta-arrow" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
      <span class="product-card-cta-text">Browse all frames</span>
    </div>
  </a>`;
}

export function renderHome({ featured }) {
  return `
  <section class="hero hero--onliner">
    <div class="container">
      <div class="hero-eyebrow" data-reveal><span class="status-dot" aria-hidden="true"></span>DIY teardown art kits</div>
      <h1 class="hero-oneliner" data-reveal style="--reveal-delay:70ms">That old phone in your drawer?<br><span class="weight-bold">It deserves a wall, not a drawer.</span></h1>
      <div class="hero-actions" data-reveal style="--reveal-delay:210ms">
        <a href="/shop" class="btn" data-magnetic>Get the Frame Kit</a>
        <a href="/about" class="btn btn--outline">How it works</a>
      </div>
    </div>
  </section>

  <section class="section container" style="padding-top:8px;">
    <div class="section-head" data-reveal>
      <h2>A few phones worth framing</h2>
      <p>Real teardowns, for inspiration — send us any phone's story, or start with yours.</p>
    </div>
    <div class="masonry-scroll" data-reveal>
      <div class="masonry-scroll-track">
        ${featured.map((f) => productCard(f)).join('') || '<p>New pieces are on the way — check back soon.</p>'}
        ${ctaTile()}
      </div>
    </div>
  </section>

  <section class="fomo-story">
    <div class="container fomo-story-inner">
      <div class="hero-eyebrow" data-reveal>Why frame it</div>
      <h2 class="fomo-story-lead" data-reveal style="--reveal-delay:60ms">Your phone was never just a device.<br>It's a reflection of your choices.</h2>
      <div class="fomo-story-body" data-reveal style="--reveal-delay:120ms">
        <p>Every phone you've owned has a character — a shape, a story, a version of you that carried it everywhere. The one sitting in your drawer right now still has that character. It just doesn't need to be hidden anymore.</p>
        <p>Take it apart. Admire the work of the engineers and designers who built it. Arrange what's inside, mount it, and give it a second life as a piece of inspiration on your wall or your desk — a small, honest reminder of where you've been.</p>
      </div>
      <a href="/about" class="link-btn" data-reveal style="--reveal-delay:180ms">See how the frame kit works →</a>
    </div>
  </section>
  `;
}
