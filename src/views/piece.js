import { escapeHtml, formatCurrency } from '../utils.js';

export function renderPiece({ frame, related }) {
  const images = frame.images.length ? frame.images : [{ url: '/img/placeholder.svg' }];
  const isAvailable = frame.status === 'available' && frame.stock > 0;

  const thumbs = images
    .map((img, i) => `<img src="${img.url}" data-full="${img.url}" class="${i === 0 ? 'active' : ''}" alt="">`)
    .join('');

  let ctaHtml;
  if (isAvailable) {
    ctaHtml = `
      <div class="qty-row">
        <label for="qty-input" style="font-size:0.82rem;color:#6a6a6a;">Qty</label>
        <input type="number" id="qty-input" class="qty-input" min="1" max="${frame.stock}" value="1">
        <span style="font-size:0.8rem;color:#8a8a8a;">${frame.stock} in stock</span>
      </div>
      <button class="btn btn--block" id="add-to-cart-btn" data-frame-id="${frame.id}" data-original-label="Add to Cart">Add to Cart</button>`;
  } else {
    ctaHtml = `<button class="btn btn--block" disabled>${frame.status === 'sold' ? 'Sold Out' : 'Reserved'}</button>`;
  }

  const relatedHtml = related.length
    ? `
    <section class="section container" style="border-top:1px solid #ececea;">
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
      <div class="gallery-main"><img id="gallery-main-img" src="${images[0].url}" alt="${escapeHtml(frame.title)}"></div>
      <div class="gallery-thumbs">${thumbs}</div>
    </div>
    <div>
      <div class="detail-eyebrow">${escapeHtml(frame.brand)} · ${frame.type === 'handcrafted' ? 'Handcrafted' : 'Printed'} piece</div>
      <h1>${escapeHtml(frame.title)}</h1>
      <div class="detail-price">${formatCurrency(frame.price)}</div>
      <div class="detail-desc">${escapeHtml(frame.description)}</div>
      ${ctaHtml}
      <div class="detail-meta">
        <dl>
          <dt>Source phone</dt><dd>${escapeHtml(frame.phone_model)}</dd>
          <dt>Technique</dt><dd>${frame.type === 'handcrafted' ? 'Fully handcrafted, one of a kind' : 'Printed reproduction'}</dd>
          <dt>Status</dt><dd style="text-transform:capitalize;">${frame.status}</dd>
        </dl>
      </div>
    </div>
  </div>
  ${relatedHtml}
  <script src="/js/product-page.js"></script>
  `;
}
