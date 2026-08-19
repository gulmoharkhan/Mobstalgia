import { escapeHtml, formatCurrency } from '../utils.js';

const KIT_LABEL = { novice: 'Novice Kit', expert: 'Expert Kit' };

function productCard(frame) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  return `
  <a class="product-card" href="/piece/${frame.id}">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
      <span class="badge badge--type${frame.type === 'expert' ? ' badge--type--expert' : ''}">${KIT_LABEL[frame.type] || 'Frame Kit'}</span>
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
      <h1 class="hero-oneliner" data-reveal style="--reveal-delay:70ms">That old phone in your drawer?<br><span class="text-italic">It deserves a wall, not a drawer.</span></h1>
      <div class="hero-actions" data-reveal style="--reveal-delay:210ms">
        <a href="/shop" class="btn" data-magnetic>Get the Frame Kit</a>
        <a href="/about" class="btn btn--outline">How it works</a>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head" data-reveal>
      <h2>A few phones worth framing</h2>
      <p>A handful of teardowns to spark ideas — pick an era, or bring your own.</p>
    </div>
    <div class="masonry-scroll" data-reveal>
      <div class="masonry-scroll-track">
        ${featured.slice(0, 5).map((f) => productCard(f)).join('') || '<p>New pieces are on the way — check back soon.</p>'}
        ${ctaTile()}
      </div>
    </div>
  </section>

  <section class="section container tier-section">
    <div class="section-head" data-reveal>
      <h2>Pick your teardown level</h2>
      <p>Every kit is rated by how deep it goes. Some open with a screwdriver. Others dare you to find the parts most owners never see.</p>
    </div>
    <div class="tier-grid">
      <div class="tier-card tier-card--novice" data-reveal style="--reveal-delay:60ms">
        <span class="tier-index">01</span>
        <span class="tier-flag">Start here</span>
        <h3>Novice</h3>
        <p class="tier-tagline">Open the case. Meet the board.</p>
        <p>Your first teardown. Pull the shell, lift out the main board, battery, and display, and see exactly how the whole device fits together — no specialist tools required.</p>
        <span class="tier-chip">Main board · Battery · Display</span>
        <a href="/shop?type=novice" class="link-btn tier-link">Browse Novice kits →</a>
      </div>
      <div class="tier-card tier-card--expert" data-reveal style="--reveal-delay:140ms">
        <span class="tier-index">02</span>
        <span class="tier-flag">Bring tools</span>
        <h3>Expert</h3>
        <p class="tier-tagline">Go past the board. Find what's hiding.</p>
        <p>The real challenge. Chase down camera modules, vibration motors, Taptic Engines, and the tiny flex cables most people don't even know are inside their phone.</p>
        <span class="tier-chip">Camera modules · Taptic Engines · Hidden flex cables</span>
        <a href="/shop?type=expert" class="link-btn tier-link">Browse Expert kits →</a>
      </div>
    </div>
  </section>

  <section class="fomo-story">
    <div class="container fomo-story-grid">
      <div class="fomo-collage" data-reveal aria-hidden="true">
        <img class="fomo-photo fomo-photo--a" src="/img/seed/nokia-n73-2.jpg" alt="" loading="lazy">
        <img class="fomo-photo fomo-photo--b" src="/img/seed/iphone-4s-1.jpg" alt="" loading="lazy">
        <img class="fomo-photo fomo-photo--c" src="/img/seed/apple-watch-series-3-3.jpg" alt="" loading="lazy">
        <span class="fomo-tape fomo-tape--a"></span>
        <span class="fomo-tape fomo-tape--b"></span>
      </div>
      <div class="fomo-story-copy">
        <div class="hero-eyebrow" data-reveal><span class="status-dot" aria-hidden="true"></span>Why frame it</div>
        <h2 class="fomo-story-lead" data-reveal style="--reveal-delay:60ms">Every phone was a chapter.<br><span class="text-italic">This one's still being written.</span></h2>
        <div class="fomo-story-body" data-reveal style="--reveal-delay:120ms">
          <p>You remember the exact click of its buttons. The crack in the corner from the fall you still tell people about. The sticker you half-peeled off and gave up on. That phone isn't just old — it's evidence.</p>
          <p>Take it apart. Study the board like a tiny city map. Arrange what's inside however tells your version of the story, mount it, and hang it somewhere you'll actually see it — not a drawer you open twice a year.</p>
        </div>
        <a href="/about" class="link-btn" data-reveal style="--reveal-delay:180ms">See how the frame kit works →</a>
      </div>
    </div>
  </section>
  `;
}
