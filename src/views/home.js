import { escapeHtml, formatCurrency, splitTitle } from '../utils.js';

function productCard(frame) {
  const cover = frame.images?.[0]?.url || '/img/figma2/product-placeholder.jpg';
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
  return `<img class="why-choose-check" src="/img/figma2/icon-check.png" alt="" aria-hidden="true">`;
}

export function renderHome({ featured }) {
  return `
  <section class="home-hero" data-reveal>
    <img class="home-hero-bg" src="/img/figma2/hero-bg.jpg" alt="" loading="eager">
    <div class="container home-hero-inner">
      <h1><span class="line-ink">Still holding onto that old phone?</span><span class="line-accent">Give it a wall, not a drawer</span></h1>
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
      <a href="/shop" class="btn btn--outline-light">Browse all frames</a>
    </div>
  </section>

  <section class="section container tier-section">
    <div class="section-head" data-reveal>
      <h2>Up for the challenge?</h2>
    </div>
    <div class="tier-challenge-split">
      <div class="tier-challenge-panel" data-reveal style="--reveal-delay:60ms">
        <h3>Welcome starters<span class="tier-challenge-emoji" aria-hidden="true">🤓</span></h3>
        <p>Don't have experience with opening tech toys? Fear not. There's always a first time. The starter kits are for first timers. Basic teardown and then mounting on the frame. Cakewalk!</p>
        <a href="/shop?type=novice" class="btn">Browse starter kits</a>
      </div>
      <div class="tier-challenge-panel" data-reveal style="--reveal-delay:140ms">
        <h3>Wassup experts!<span class="tier-challenge-emoji" aria-hidden="true">😈</span></h3>
        <p>Think you are good? Try our one of a kind, super detailed kits. They show magnets &amp; coils buried inside taptic engines, sensors &amp; lenses inside the camera. Not for the faint hearted!</p>
        <a href="/shop?type=expert" class="btn">Browse expert kits</a>
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
        <p>Check out other frame providers. No one does as meticulous teardown as us. Not even YouTubers!</p>
        <p>At Mobstalgia we don't cut corners for aesthetics. Every functional part finds a way into the frame. Every frame is crafted after tedious rearrangements to find the best possible composition showing connection between parts while looking cool as hell.</p>
        <ul class="why-choose-list">
          <li>${checkIcon()}All functional components are shown</li>
          <li>${checkIcon()}Composition showing connections</li>
          <li>${checkIcon()}Top tier aesthetics</li>
          <li>${checkIcon()}Hand crafted pieces-truly one-of-a-kind</li>
        </ul>
      </div>
    </div>
  </section>
  `;
}
