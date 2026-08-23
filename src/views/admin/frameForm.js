import { escapeHtml } from '../../utils.js';
import { FRAME_TYPES, FRAME_STATUSES } from '../../config.js';

// Customer-facing names for the "type" tier — kept distinct from the internal
// 'novice' / 'expert' values stored in the database.
const FRAME_TYPE_LABELS = { novice: 'Casual', expert: 'Expert' };

export function renderFrameForm({ frame, mode }) {
  const isEdit = mode === 'edit';
  const endpoint = isEdit ? `/admin/api/frames/${frame.id}` : '/admin/api/frames';
  const priceRupees = frame ? (frame.price / 100).toFixed(0) : '';
  const existingImages = isEdit ? frame.images.map((i) => ({ id: i.id, url: i.url })) : [];
  const boxContentsText = isEdit && Array.isArray(frame.boxContents) ? frame.boxContents.join('\n') : '';
  const existingHighlights = isEdit && Array.isArray(frame.highlights) ? frame.highlights : [];

  const opt = (options, current) =>
    options.map((o) => `<option value="${o}" ${o === current ? 'selected' : ''}>${o[0].toUpperCase() + o.slice(1)}</option>`).join('');
  const optLabeled = (options, labels, current) =>
    options.map((o) => `<option value="${o}" ${o === current ? 'selected' : ''}>${labels[o] || o}</option>`).join('');

  return `
  <div class="admin-page-head">
    <div><h1>${isEdit ? 'Edit Frame' : 'Add New Frame'}</h1><p>${isEdit ? 'Update this piece’s details, pricing, or images.' : 'List a new teardown piece for sale.'}</p></div>
    <a href="/admin/frames" class="link-btn">← Back to frames</a>
  </div>

  <div id="frame-form-error" class="flash flash--error" hidden style="border-radius:4px;padding:12px 16px;margin-bottom:20px;"></div>

  <div class="admin-form-card">
    <form id="frame-form" data-endpoint="${endpoint}">
      <div class="form-field">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" required value="${escapeHtml(frame?.title || '')}" placeholder="e.g. iPhone 15 Pro — Exploded View">
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label for="brand">Brand</label>
          <input type="text" id="brand" name="brand" required value="${escapeHtml(frame?.brand || '')}" placeholder="Apple, Samsung, Google…">
        </div>
        <div class="form-field">
          <label for="phoneModel">Phone model</label>
          <input type="text" id="phoneModel" name="phoneModel" required value="${escapeHtml(frame?.phone_model || '')}" placeholder="iPhone 15 Pro Max, 256GB">
        </div>
      </div>
      <div class="form-field">
        <label for="description">Description</label>
        <textarea id="description" name="description" required placeholder="Describe the teardown, materials, and what makes this piece unique.">${escapeHtml(frame?.description || '')}</textarea>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label for="price">Price (₹)</label>
          <input type="number" id="price" name="price" min="0" step="1" required value="${escapeHtml(priceRupees)}">
        </div>
        <div class="form-field">
          <label for="stock">Stock (quantity available)</label>
          <input type="number" id="stock" name="stock" min="0" step="1" required value="${frame ? frame.stock : 1}">
        </div>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label for="type">Style</label>
          <select id="type" name="type">${optLabeled(FRAME_TYPES, FRAME_TYPE_LABELS, frame?.type || 'novice')}</select>
        </div>
        <div class="form-field">
          <label for="status">Status</label>
          <select id="status" name="status">${opt(FRAME_STATUSES, frame?.status || 'available')}</select>
        </div>
      </div>
      <div class="form-field checkbox-row">
        <input type="checkbox" id="featured" name="featured" ${frame?.featured ? 'checked' : ''}>
        <label for="featured" style="margin:0;text-transform:none;">Feature this piece on the homepage</label>
      </div>

      <div class="form-field">
        <label>Images</label>
        <label for="image-input" class="image-upload-zone">Click to upload images (JPG, PNG, WEBP) — add as many as you like</label>
        <input type="file" id="image-input" accept="image/*" multiple style="display:none;">
        <div class="image-preview-grid" id="image-preview-grid"></div>
      </div>

      <h2 class="admin-form-section-head">Product page details</h2>
      <p class="admin-form-section-note">These power the "What you're getting" and "What made it special" sections on the product page. All optional — leave blank to hide a section.</p>

      <div class="form-grid">
        <div class="form-field">
          <label for="material">Material</label>
          <input type="text" id="material" name="material" value="${escapeHtml(frame?.material || '')}" placeholder="Solid ash wood frame, anti-glare acrylic front">
        </div>
        <div class="form-field">
          <label for="sizeLabel">Size</label>
          <input type="text" id="sizeLabel" name="sizeLabel" value="${escapeHtml(frame?.size_label || '')}" placeholder="30 × 40 cm (12 × 16 in)">
        </div>
      </div>
      <div class="form-field">
        <label for="unitsLabel">Units</label>
        <input type="text" id="unitsLabel" name="unitsLabel" value="${escapeHtml(frame?.units_label || '')}" placeholder="1 frame kit — enough for one device">
      </div>
      <div class="form-field">
        <label for="boxContents">In the box</label>
        <textarea id="boxContents" name="boxContentsText" placeholder="One item per line, e.g.&#10;Solid ash wood frame&#10;Anti-glare acrylic front panel&#10;Wall-hanging hardware">${escapeHtml(boxContentsText)}</textarea>
      </div>

      <div class="form-field">
        <label>What made it special (highlights)</label>
        <div id="highlight-list"></div>
        <button type="button" id="add-highlight-btn" class="btn btn--outline" style="margin-top:8px;">+ Add highlight</button>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn">${isEdit ? 'Save Changes' : 'Create Frame'}</button>
        <a href="/admin/frames" class="btn btn--outline">Cancel</a>
      </div>
    </form>
  </div>

  <script>
    window.TDF_EXISTING_IMAGES = ${JSON.stringify(existingImages)};
    window.TDF_EXISTING_HIGHLIGHTS = ${JSON.stringify(existingHighlights)};
  </script>
  <script src="/js/admin-frame-form.js"></script>
  `;
}
