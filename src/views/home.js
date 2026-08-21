import { escapeHtml, formatCurrency, splitTitle } from '../utils.js';

function productCard(frame) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  const { name, tagline } = splitTitle(frame.title);
  return `
  <a class="product-card" href="/piece/${frame.id}">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
    </div>
    <div class="product-card-row">
      <span class="product-card-title">${escapeHtml(name)}</span>
      <span class="product-card-price">${formatCurrency(frame.price)}</span>
    </div>
    ${tagline ? `<div class="product-card-sub">${escapeHtml(tagline)}</div>` : ''}
  </a>`;
}

function checkIcon() {
  return `<span class="why-choose-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`;
}

export function renderHome({ featured }) {
  return `
  <section class="home-hero" data-reveal>
    <img class="home-hero-bg" src="/img/figma2/hero-bg.jpg" alt="" loading="eager">
    <div class="container home-hero-inner">
      <h1>Still holding onto that old phone?<br>Give it a wall, not a drawer.</h1>
      <div class="home-hero-actions">
        <a href="/shop" class="btn" data-magnetic>Browse frames</a>
        <a href="/about" class="btn btn--outline-light">Learn more</a>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head" data-reveal>
      <h2>Which one defined you back then?</h2>
    </div>
    <div class="home-grid" data-reveal>
      ${featured.slice(0, 8).map((f) => productCard(f)).join('') || '<p>New pieces are on the way — check back soon.</p>'}
    </div>
    <div class="home-grid-footer" data-reveal>
      <a href="/shop" class="btn">Browse all frames</a>
    </div>
  </section>

  <section class="section container tier-section">
    <div class="section-head" data-reveal>
      <h2>Up for the challenge?</h2>
    </div>
    <div class="tier-challenge-split">
      <div class="tier-challenge-panel" data-reveal style="--reveal-delay:60ms">
        <h3><span class="tier-challenge-emoji" aria-hidden="true">🤓</span>Welcome starters</h3>
        <p>Open the shell off and lay out the whole device — main board, battery, display, camera, speaker — every component, intact and exactly where the engineers put it. No specialist tools required.</p>
        <a href="/shop?type=novice" class="btn btn--sm">Browse Casual kits →</a>
      </div>
      <div class="tier-challenge-panel" data-reveal style="--reveal-delay:140ms">
        <h3><span class="tier-challenge-emoji" aria-hidden="true">😈</span>Wassup experts</h3>
        <p>For people who don't stop at "that's a camera module." Open the camera itself, the Taptic Engine, and every part with its own hidden layers — taken all the way down.</p>
        <a href="/shop?type=expert" class="btn btn--sm">Browse Expert kits →</a>
      </div>
    </div>
  </section>

  <section class="section container why-choose-section">
    <div class="why-choose-grid">
      <div class="why-choose-media" data-reveal>
        <img src="/img/figma2/why-choose.jpg" alt="Phone teardown parts laid out on a workbench">
      </div>
      <div class="why-choose-copy" data-reveal style="--reveal-delay:100ms">
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
