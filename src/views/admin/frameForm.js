import { escapeHtml } from '../../utils.js';
import { FRAME_TYPES, FRAME_STATUSES } from '../../config.js';

export function renderFrameForm({ frame, mode }) {
  const isEdit = mode === 'edit';
  const endpoint = isEdit ? `/admin/api/frames/${frame.id}` : '/admin/api/frames';
  const priceRupees = frame ? (frame.price / 100).toFixed(0) : '';
  const existingImages = isEdit ? frame.images.map((i) => ({ id: i.id, url: i.url })) : [];

  const opt = (options, current) =>
    options.map((o) => `<option value="${o}" ${o === current ? 'selected' : ''}>${o[0].toUpperCase() + o.slice(1)}</option>`).join('');

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
          <label for="type">Type</label>
          <select id="type" name="type">${opt(FRAME_TYPES, frame?.type || 'handcrafted')}</select>
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

      <div class="form-actions">
        <button type="submit" class="btn">${isEdit ? 'Save Changes' : 'Create Frame'}</button>
        <a href="/admin/frames" class="btn btn--outline">Cancel</a>
      </div>
    </form>
  </div>

  <script>window.TDF_EXISTING_IMAGES = ${JSON.stringify(existingImages)};</script>
  <script src="/js/admin-frame-form.js"></script>
  `;
}
