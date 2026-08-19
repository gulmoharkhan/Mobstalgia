import { escapeHtml, formatCurrency } from '../utils.js';

const KIT_LABEL = { novice: 'Novice Kit', expert: 'Expert Kit' };
const TIER_COPY = {
  novice: "Novice tier — a clean first teardown. Case off, main board, battery, and display exposed. No specialist tools required.",
  expert: "Expert tier — the real challenge. It goes past the main board into camera modules, sensors, and flex cables most owners never see. Bring patience and a small precision driver set.",
};

export function renderPiece({ frame, related }) {
  const images = frame.images.length ? frame.images : [{ url: '/img/placeholder.svg' }];
  const isAvailable = frame.status === 'available' && frame.stock > 0;

  const thumbs = images
    .map((img, i) => `<img src="${img.url}" data-full="${img.url}" class="${i === 0 ? 'active' : ''}" alt="">`)
    .join('');

  const galleryNavHtml =
    images.length > 1
      ? `
      <button type="button" class="gallery-nav gallery-nav--prev" id="gallery-prev" aria-label="Previous image">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <button type="button" class="gallery-nav gallery-nav--next" id="gallery-next" aria-label="Next image">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>`
      : '';

  const zoomIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
  const closeIconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const chevronLeftSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  const chevronRightSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  const lightboxHtml = `
    <div class="lightbox" id="lightbox" hidden>
      <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close enlarged image">${closeIconSvg}</button>
      ${
        images.length > 1
          ? `
      <button type="button" class="lightbox-nav lightbox-nav--prev" id="lightbox-prev" aria-label="Previous image">${chevronLeftSvg}</button>
      <button type="button" class="lightbox-nav lightbox-nav--next" id="lightbox-next" aria-label="Next image">${chevronRightSvg}</button>`
          : ''
      }
      <img id="lightbox-img" src="" alt="${escapeHtml(frame.title)}">
    </div>`;

  const kitLabel = KIT_LABEL[frame.type] || 'Frame Kit';
  const tierNote = TIER_COPY[frame.type];

  let ctaHtml;
  if (isAvailable) {
    ctaHtml = `
      <div class="qty-row">
        <label for="qty-input">Qty</label>
        <input type="number" id="qty-input" class="qty-input" min="1" max="${frame.stock}" value="1">
      </div>
      <button class="btn btn--block" id="add-to-cart-btn" data-frame-id="${frame.id}" data-original-label="Add Kit to Cart">Add Kit to Cart</button>`;
  } else {
    ctaHtml = `<button class="btn btn--block" disabled>${frame.status === 'sold' ? 'Sold Out' : 'Reserved'}</button>`;
  }

  const relatedHtml = related.length
    ? `
    <section class="section container" style="border-top:1px solid var(--line);">
      <div class="section-head"><h2>You may also like</h2></div>
      <div class="product-grid">
        ${related
          .map(
            (r) => `
          <a class="product-card" href="/piece/${r.id}">
            <div class="product-card-media"><img src="${r.images?.[0]?.url || '/img/placeholder.svg'}" alt="${escapeHtml(r.title)}"></div>
            <div class="product-card-title">${escapeHtml(r.title)}</div>
            <div class="product-card-sub">${escapeHtml(r.brand)} · ${escapeHtml(r.phone_model)}</div>
            <div class="product-card-price">${formatCurrency(r.price)}</div>
          </a>`
          )
          .join('')}
      </div>
    </section>`
    : '';

  return `
  <div class="container product-detail">
    <div>
      <div class="gallery-main">
        <img id="gallery-main-img" src="${images[0].url}" alt="${escapeHtml(frame.title)}">
        <button type="button" class="gallery-zoom-hint" id="gallery-zoom" aria-label="Enlarge image">${zoomIconSvg}</button>
        ${galleryNavHtml}
      </div>
      <div class="gallery-thumbs">${thumbs}</div>
    </div>
    <div>
      <div class="detail-eyebrow">${escapeHtml(frame.brand)} · ${kitLabel}</div>
      <h1>${escapeHtml(frame.title)}</h1>
      <div class="detail-price">${formatCurrency(frame.price)}</div>
      <p class="detail-desc">${escapeHtml(frame.description)}</p>
      ${tierNote ? `<div class="detail-tier-note detail-tier-note--${frame.type}"><span class="tier-index tier-index--sm">${frame.type === 'expert' ? '02' : '01'}</span><p>${escapeHtml(tierNote)}</p></div>` : ''}
      ${ctaHtml}
      <div class="detail-meta">
        <dl>
          <dt>Inspired by</dt><dd>${escapeHtml(frame.phone_model)}</dd>
          <dt>Difficulty</dt><dd>${kitLabel}</dd>
        </dl>
      </div>
    </div>
  </div>
  ${relatedHtml}
  ${lightboxHtml}
  <script src="/js/product-page.js"></script>
  `;
}
