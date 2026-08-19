import { escapeHtml, formatCurrency } from '../utils.js';

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

export function renderShop({ frames, brands, query }) {
  const opt = (value, label, current) => `<option value="${value}" ${value === current ? 'selected' : ''}>${label}</option>`;

  return `
  <div class="container">
    <div class="section-head" style="padding-top:44px;" data-reveal>
      <h1>Shop the Collection</h1>
      <p class="mono">${frames.length} piece${frames.length === 1 ? '' : 's'}</p>
    </div>

    <form class="filters-bar" method="GET" action="/shop">
      <div class="filter-field">
        <label for="q">Search</label>
        <input type="text" id="q" name="q" placeholder="iPhone, Galaxy, Pixel…" value="${escapeHtml(query.q || '')}">
      </div>
      <div class="filter-field">
        <label for="brand">Brand</label>
        <select id="brand" name="brand">
          ${opt('', 'All brands', query.brand)}
          ${brands.map((b) => opt(b, b, query.brand)).join('')}
        </select>
      </div>
      <div class="filter-field">
        <label for="type">Type</label>
        <select id="type" name="type">
          ${opt('', 'All types', query.type)}
          ${opt('handcrafted', 'Handcrafted', query.type)}
          ${opt('printed', 'Printed', query.type)}
        </select>
      </div>
      <div class="filter-field">
        <label for="sort">Sort by</label>
        <select id="sort" name="sort">
          ${opt('newest', 'Newest', query.sort)}
          ${opt('price_asc', 'Price: Low to High', query.sort)}
          ${opt('price_desc', 'Price: High to Low', query.sort)}
          ${opt('title_asc', 'Name: A–Z', query.sort)}
        </select>
      </div>
      <button class="btn btn--outline" type="submit">Apply</button>
      ${query.q || query.brand || query.type ? '<a href="/shop" class="link-btn" style="align-self:center;">Clear</a>' : ''}
    </form>

    <div class="product-grid" style="padding-bottom:70px;">
      ${frames.map((f, i) => productCard(f, i)).join('') || '<p style="grid-column:1/-1;text-align:center;padding:60px 0;color:#8a8a8a;">No pieces match those filters.</p>'}
    </div>
  </div>
  `;
}
