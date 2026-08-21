import { escapeHtml, formatCurrency, splitTitle } from '../utils.js';

const KIT_LABEL = { novice: 'Casual Kit', expert: 'Expert Kit' };

function productCard(frame) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  const { name, tagline } = splitTitle(frame.title);
  return `
  <a class="product-card" href="/piece/${frame.id}">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
      <span class="badge badge--type${frame.type === 'expert' ? ' badge--type--expert' : ''}">${KIT_LABEL[frame.type] || 'Frame Kit'}</span>
    </div>
    <div class="product-card-title">${escapeHtml(name)}</div>
    ${tagline ? `<div class="product-card-sub">${escapeHtml(tagline)}</div>` : ''}
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

function checkIcon() {
  return `<span class="why-choose-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`;
}

export function renderHome({ featured }) {
  return `
  <section class="home-hero" data-reveal>
    <img class="home-hero-bg" src="/img/figma/hero-desk.jpg" alt="" loading="eager">
    <div class="container home-hero-inner">
      <span class="home-hero-eyebrow">Mobstalgia</span>
      <h1>Still holding onto that old phone?<br>Give it a wall, not a drawer.</h1>
      <div class="home-hero-actions">
        <a href="/shop" class="btn" data-magnetic>Get the Frame Kit</a>
        <a href="/about" class="btn btn--outline-light">How it works</a>
      </div>
    </div>
  </section>

  <section class="section container">
    <span class="section-tag">1.1</span>
    <div class="section-head" data-reveal>
      <span class="kicker">Pick an era</span>
      <h2>Which one defined you back then?</h2>
      <p>A handful of teardowns to spark ideas — pick an era, or bring your own.</p>
    </div>
    <div class="home-grid" data-reveal>
      ${featured.slice(0, 7).map((f) => productCard(f)).join('') || '<p>New pieces are on the way — check back soon.</p>'}
      ${ctaTile()}
    </div>
  </section>

  <section class="section container tier-section">
    <span class="section-tag">1.2</span>
    <div class="section-head" data-reveal>
      <span class="kicker">Choose your depth</span>
      <h2>Up for the challenge?</h2>
      <p>Every kit reflects how far you go. Casual keeps it simple. Expert leaves nothing behind.</p>
    </div>
    <div class="tier-challenge-split">
      <div class="tier-challenge-panel" data-reveal style="--reveal-delay:60ms">
        <span class="tier-challenge-emoji" aria-hidden="true">🤓</span>
        <h3>Welcome starters</h3>
        <p>Open the shell off and lay out the whole device — main board, battery, display, camera, speaker — every component, intact and exactly where the engineers put it. No specialist tools required.</p>
        <a href="/shop?type=novice" class="btn btn--sm">Browse Casual kits →</a>
      </div>
      <div class="tier-challenge-panel" data-reveal style="--reveal-delay:140ms">
        <span class="tier-challenge-emoji" aria-hidden="true">😈</span>
        <h3>Wassup experts</h3>
        <p>For people who don't stop at "that's a camera module." Open the camera itself, the Taptic Engine, and every part with its own hidden layers — taken all the way down.</p>
        <a href="/shop?type=expert" class="btn btn--sm">Browse Expert kits →</a>
      </div>
    </div>
  </section>

  <section class="section container why-choose-section">
    <span class="section-tag">1.3</span>
    <div class="why-choose-grid">
      <div class="why-choose-media" data-reveal>
        <img src="/img/figma/workbench-teardown.jpg" alt="Phone teardown parts laid out on a workbench">
      </div>
      <div class="why-choose-copy" data-reveal style="--reveal-delay:100ms">
        <span class="kicker">Our promise</span>
        <h2>Why choose Mobstalgia?</h2>
        <p>Most teardown frames quietly leave things out — a flex cable with nowhere tidy to go, a bottom board that's "basically just contacts." We don't. Every functional component gets a place on the frame, positioned with the same proximity and connectivity it had inside the phone.</p>
        <p>Your phone is an engineering and design marvel that reflects not just you but the pinnacle of what was possible at that time. Nothing is skipped because it was hard to mount.</p>
        <p>We ship every kit with a numbered layout guide, so putting it together feels like a second teardown — this time, one you get to keep.</p>
        <ul class="why-choose-list">
          <li>${checkIcon()}Flex cables included</li>
          <li>${checkIcon()}Bottom board mounted</li>
          <li>${checkIcon()}Camera internals kept</li>
          <li>${checkIcon()}Every last screw</li>
        </ul>
      </div>
    </div>
  </section>
  `;
}
