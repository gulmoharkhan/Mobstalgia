import { escapeHtml, formatCurrency, splitTitle } from '../utils.js';
import { AMAZON_SEARCH_BASE, SITE_NAME } from '../config.js';

const KIT_LABEL = { novice: 'Casual Kit', expert: 'Expert Kit' };
const TIER_COPY = {
  novice: "Casual build — a clean first teardown. Case off, main board, battery, and display, every component exposed and intact. No specialist tools required.",
  expert: "Expert build — for people who don't stop at the component level. This one goes inside the parts themselves: open the camera to find its lens assembly and image sensor, open the Taptic Engine to see what makes it tick. Bring patience and a small precision driver set.",
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
  const { name, tagline } = splitTitle(frame.title);

  let ctaHtml;
  if (isAvailable) {
    const amazonUrl = `${AMAZON_SEARCH_BASE}${encodeURIComponent(`${SITE_NAME} ${frame.title}`)}`;
    ctaHtml = `
      <div class="detail-cta">
        <a class="btn btn--block" href="${amazonUrl}" target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
      </div>`;
  } else {
    ctaHtml = `<button class="btn btn--block" disabled>${frame.status === 'sold' ? 'Sold Out' : 'Reserved'}</button>`;
  }

  const relatedHtml = related.length
    ? `
    <section class="section container" style="border-top:1px solid var(--line);">
      <div class="section-head"><h2>You may also like</h2></div>
      <div class="product-grid">
        ${related
          .map((r) => {
            const rTitle = splitTitle(r.title);
            return `
          <a class="product-card" href="/piece/${r.id}">
            <div class="product-card-media">
              <img src="${r.images?.[0]?.url || '/img/placeholder.svg'}" alt="${escapeHtml(r.title)}">
              ${r.status === 'sold' ? '<span class="badge badge--sold">Sold</span>' : ''}
              ${r.status === 'reserved' ? '<span class="badge badge--reserved">Reserved</span>' : ''}
              <span class="badge badge--type${r.type === 'expert' ? ' badge--type--expert' : ''}">${KIT_LABEL[r.type] || 'Frame Kit'}</span>
            </div>
            <div class="product-card-title">${escapeHtml(rTitle.name)}</div>
            ${rTitle.tagline ? `<div class="product-card-sub">${escapeHtml(rTitle.tagline)}</div>` : ''}
            <div class="product-card-price">${formatCurrency(r.price)}</div>
          </a>`;
          })
          .join('')}
      </div>
    </section>`
    : '';

  const boxContents = Array.isArray(frame.boxContents) ? frame.boxContents : [];

  const specRows = [
    ['Material', frame.material],
    ['Size', frame.size_label],
    ['Units', frame.units_label],
    boxContents.length ? ['In the box', boxContents.join(', ')] : null,
  ].filter((row) => row && row[1]);

  const specsInlineHtml = specRows.length
    ? `<dl class="detail-specs-inline" data-reveal>
        ${specRows
          .map(
            ([label, value], i) =>
              `<div${i === specRows.length - 1 && label === 'In the box' ? ' style="grid-column:1 / -1"' : ''}><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
          )
          .join('')}
      </dl>`
    : '';

  const highlights = Array.isArray(frame.highlights) ? frame.highlights : [];
  const highlightsHtml = highlights.length
    ? `
    <section class="section container" style="border-top:1px solid var(--line);">
      <div class="section-head" data-reveal><h2>What made it special</h2></div>
      <div class="highlight-list">
        ${highlights
          .map(
            (h, i) => `
          <div class="highlight-block${i % 2 === 1 ? ' highlight-block--reverse' : ''}" data-reveal style="--reveal-delay:${i * 80}ms">
            <div class="highlight-media">
              <img src="${h.image}" alt="${escapeHtml(h.title || '')}" loading="lazy">
            </div>
            <div class="highlight-copy">
              <h3>${escapeHtml(h.title || '')}</h3>
              <p>${escapeHtml(h.body || '')}</p>
            </div>
          </div>`
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
      <div class="detail-eyebrow">
        <span>${escapeHtml(frame.brand)}</span>
        <span class="detail-eyebrow-sep">·</span>
        ${
          tierNote
            ? `<details class="kit-tag-details">
                <summary class="detail-kit-tag detail-kit-tag--${frame.type}">${kitLabel}<svg class="kit-tag-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg></summary>
                <p class="kit-tag-note">${escapeHtml(tierNote)}</p>
              </details>`
            : `<span class="detail-kit-tag detail-kit-tag--${frame.type}">${kitLabel}</span>`
        }
      </div>
      <h1>${escapeHtml(name)}</h1>
      ${tagline ? `<p class="detail-tagline">${escapeHtml(tagline)}</p>` : ''}
      <div class="detail-price">${formatCurrency(frame.price)}</div>
      <p class="detail-desc">${escapeHtml(frame.description)}</p>
      ${specsInlineHtml}
      ${ctaHtml}
      <div class="detail-meta">
        <dl>
          <dt>Inspired by</dt><dd>${escapeHtml(frame.phone_model)}</dd>
          <dt>Style</dt><dd>${kitLabel}</dd>
        </dl>
      </div>
    </div>
  </div>
  ${highlightsHtml}
  ${relatedHtml}
  ${lightboxHtml}
  <script src="/js/product-page.js"></script>
  `;
}
