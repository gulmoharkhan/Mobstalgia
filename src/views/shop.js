import { escapeHtml, formatCurrency } from '../utils.js';

const KIT_LABEL = { novice: 'Casual Kit', expert: 'Meticulous Kit' };

function productCard(frame, index = 0) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  const delay = Math.min(index * 45, 360);
  return `
  <a class="product-card" href="/piece/${frame.id}" data-reveal style="--reveal-delay:${delay}ms">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
      ${frame.status === 'sold' ? '<span class="badge badge--sold">Sold</span>' : ''}
      ${frame.status === 'reserved' ? '<span class="badge badge--reserved">Reserved</span>' : ''}
      <span class="badge badge--type${frame.type === 'expert' ? ' badge--type--expert' : ''}">${KIT_LABEL[frame.type] || 'Frame Kit'}</span>
    </div>
    <div class="product-card-title">${escapeHtml(frame.title)}</div>
    <div class="product-card-sub">${escapeHtml(frame.brand)} · ${escapeHtml(frame.phone_model)}</div>
    <div class="product-card-price">${formatCurrency(frame.price)}</div>
  </a>`;
}

export function renderShop({ frames, brands, query }) {
  const opt = (value, label, current) => `<option value="${value}" ${value === current ? 'selected' : ''}>${label}</option>`;
  const hasFilters = Boolean(query.q || query.brand || query.type || query.availability);
  const activeFilterCount = [query.brand, query.type, query.availability].filter(Boolean).length;

  return `
  <div class="container">
    <div class="section-head" style="padding-top:44px;" data-reveal>
      <h1>Frame Kits</h1>
    </div>

    <form class="filters-bar" method="GET" action="/shop" id="filters-form">
      <div class="filter-field filter-field--search">
        <label for="q">Search</label>
        <input type="text" id="q" name="q" placeholder="iPhone, Nokia, iPod…" value="${escapeHtml(query.q || '')}">
      </div>

      <button type="button" class="filters-toggle" id="filters-toggle" aria-expanded="false" aria-controls="filters-sheet">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2" fill="#fff"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill="#fff"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="11" cy="18" r="2" fill="#fff"/></svg>
        Filters${activeFilterCount ? `<span class="filters-badge">${activeFilterCount}</span>` : ''}
      </button>

      <div class="filters-sheet" id="filters-sheet">
        <div class="filters-sheet-head">
          <span>Filters</span>
          <button type="button" class="filters-sheet-close" id="filters-close" aria-label="Close filters">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="filter-field">
          <label for="brand">Brand</label>
          <select id="brand" name="brand">
            ${opt('', 'All brands', query.brand)}
            ${brands.map((b) => opt(b, b, query.brand)).join('')}
          </select>
        </div>
        <div class="filter-field">
          <label for="type">Style</label>
          <select id="type" name="type">
            ${opt('', 'All styles', query.type)}
            ${opt('novice', 'Casual Kit', query.type)}
            ${opt('expert', 'Meticulous Kit', query.type)}
          </select>
        </div>
        <div class="filter-field">
          <label for="availability">Availability</label>
          <select id="availability" name="availability">
            ${opt('', 'All', query.availability)}
            ${opt('available', 'Available only', query.availability)}
            ${opt('reserved', 'Reserved', query.availability)}
            ${opt('sold', 'Sold', query.availability)}
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
        <div class="filters-sheet-foot">
          ${hasFilters ? '<a href="/shop" class="link-btn">Clear all</a>' : '<span></span>'}
          <button class="btn" type="submit">Apply</button>
        </div>
      </div>

      <button class="btn filters-apply-inline" type="submit">Apply</button>
      ${hasFilters ? '<a href="/shop" class="link-btn filters-clear-inline">Clear</a>' : ''}
    </form>
    <div class="filters-backdrop" id="filters-backdrop" hidden></div>

    <div class="product-grid" style="padding-bottom:70px;">
      ${frames.map((f, i) => productCard(f, i)).join('') || '<p style="grid-column:1/-1;text-align:center;padding:60px 0;color:#8a8a8a;">No kits match those filters.</p>'}
    </div>
  </div>
  <script src="/js/shop-filters.js"></script>
  `;
}
