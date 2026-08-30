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
      <div class="product-card-title">${escapeHtml(name)}</div>
      ${tagline ? `<div class="product-card-sub">${escapeHtml(tagline)}</div>` : ''}
      <div class="product-card-price">${formatCurrency(frame.price)}</div>
    </div>
  </a>`;
}

const CHEVRON_LEFT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
const CHEVRON_RIGHT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

function wallFramePlacement(placement) {
  const frame = placement.frame;
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  const { name } = splitTitle(frame.title);
  const style = `left:${placement.x}%;top:${placement.y}%;width:${placement.width}%;transform:rotate(${placement.rotation || 0}deg);z-index:${placement.z || 1};`;
  return `
  <a class="wall-frame" style="${style}" href="/piece/${frame.id}" aria-label="Open ${escapeHtml(frame.title)}">
    <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
    <span class="wall-frame-tag">${escapeHtml(name)}</span>
  </a>`;
}

function wallSlide(wall, index, total) {
  return `
  <div class="wall-slide" role="group" aria-roledescription="slide" aria-label="Wall ${index + 1} of ${total}">
    <img class="wall-slide-bg" src="${escapeHtml(wall.background)}" alt="" loading="${index === 0 ? 'eager' : 'lazy'}">
    <div class="wall-slide-shade"></div>
    <div class="wall-slide-frames">
      ${wall.frames.map(wallFramePlacement).join('')}
    </div>
  </div>`;
}

function wallCarousel(wallCompositions) {
  if (!wallCompositions.length) return null;
  const multi = wallCompositions.length > 1;
  return `
  <section class="wall-carousel-section" data-reveal aria-label="A look at the frames on the wall">
    <div class="container wall-carousel-head">
      <h1><span class="line-ink">Still holding onto that old phone?</span><span class="line-accent">See it back on the wall.</span></h1>
      <p class="wall-carousel-sub">Every kit becomes a piece you actually hang. Swipe through a few walls to see how it looks — then tap a frame to open it.</p>
    </div>
    <div class="wall-carousel">
      <div class="wall-track" id="wall-track">
        ${wallCompositions.map((w, i) => wallSlide(w, i, wallCompositions.length)).join('')}
      </div>
      ${
        multi
          ? `<div class="wall-controls">
        <button type="button" class="wall-arrow wall-arrow--prev" id="wall-prev" aria-label="Previous wall">${CHEVRON_LEFT}</button>
        <div class="wall-dots" id="wall-dots">
          ${wallCompositions.map((_, i) => `<button type="button" class="wall-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to wall ${i + 1}"></button>`).join('')}
        </div>
        <button type="button" class="wall-arrow wall-arrow--next" id="wall-next" aria-label="Next wall">${CHEVRON_RIGHT}</button>
      </div>`
          : ''
      }
    </div>
    <div class="wall-carousel-cta container">
      <a href="/shop" class="btn" data-magnetic>Browse frames</a>
      <a href="/about" class="btn btn--outline-light">Learn more</a>
    </div>
  </section>
  <script src="/js/home-wall-carousel.js"></script>`;
}

function legacyHero(coverImage) {
  return `
  <section class="home-hero" data-reveal>
    <img class="home-hero-bg" src="${escapeHtml(coverImage || '/img/figma2/hero-bg.jpg')}" alt="" loading="eager">
    <div class="container home-hero-inner">
      <h1><span class="line-ink">Still holding onto that old phone?</span><span class="line-accent">Give it a wall, not a drawer</span></h1>
      <div class="home-hero-actions">
        <a href="/shop" class="btn" data-magnetic>Browse frames</a>
        <a href="/about" class="btn btn--outline-light">Learn more</a>
      </div>
    </div>
  </section>`;
}

function whyChooseBlock(block, index) {
  const imageFirst = index % 2 === 0;
  const media = `
    <div class="why-choose-block-media">
      <img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.heading || '')}" loading="lazy">
    </div>`;
  const copy = `
    <div class="why-choose-block-copy">
      <h3 class="why-choose-block-title">${escapeHtml(block.heading || '')}</h3>
      <p class="why-choose-block-desc">${escapeHtml(block.description || '')}</p>
    </div>`;
  return `
  <div class="why-choose-block" data-reveal>
    ${imageFirst ? media + copy : copy + media}
  </div>`;
}

export function renderHome({ featured, coverImage, whyChooseBlocks = [], wallCompositions = [] }) {
  return `
  ${wallCarousel(wallCompositions) || legacyHero(coverImage)}

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

  <section class="section tier-section">
    <div class="section-head tier-section-head" data-reveal>
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

  <section class="section why-choose-section">
    <div class="container">
      <div class="section-head" data-reveal>
        <h2>Why choose Mobstalgia?</h2>
        <p class="why-choose-intro">No one does as meticulous a teardown as us — not even YouTubers. Every frame is crafted after tedious rearrangement to find the best composition, showing off the connections between parts while looking cool as hell.</p>
      </div>
      <div class="why-choose-card">
        <div class="why-choose-blocks">
          ${whyChooseBlocks.map((b, i) => whyChooseBlock(b, i)).join('')}
        </div>
      </div>
    </div>
  </section>
  `;
}
