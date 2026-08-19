import { escapeHtml, formatCurrency } from '../../utils.js';

const FRAME_TYPE_LABELS = { novice: 'Casual', expert: 'Expert' };

export function renderFramesList({ frames }) {
  const rows = frames
    .map(
      (f) => `
    <tr>
      <td><input type="checkbox" class="frame-select" value="${f.id}" aria-label="Select ${escapeHtml(f.title)}"></td>
      <td><img class="admin-thumb" src="${f.images?.[0]?.url || '/img/placeholder.svg'}" alt=""></td>
      <td>${escapeHtml(f.title)}<div style="color:#8a8a8a;font-size:0.78rem;">${escapeHtml(f.brand)} · ${escapeHtml(f.phone_model)}</div></td>
      <td>${FRAME_TYPE_LABELS[f.type] || f.type}</td>
      <td>${formatCurrency(f.price)}</td>
      <td>${f.stock}</td>
      <td><span class="status-pill status-pill--${f.status === 'available' ? 'confirmed' : f.status === 'sold' ? 'cancelled' : 'pending'}">${f.status}</span></td>
      <td>
        <div class="admin-row-actions">
          <a class="link-btn" href="/admin/frames/${f.id}/edit">Edit</a>
          <form method="POST" action="/admin/frames/${f.id}/delete" onsubmit="return confirm('Delete &quot;${escapeHtml(f.title).replace(/"/g, '&quot;')}&quot;? This cannot be undone.');">
            <button type="submit" class="link-btn" style="color:#9a2a20;">Delete</button>
          </form>
        </div>
      </td>
    </tr>`
    )
    .join('');

  return `
  <div class="admin-page-head">
    <div><h1>Frames</h1><p>Manage the pieces listed in your shop</p></div>
    <a href="/admin/frames/new" class="btn">+ Add New Frame</a>
  </div>
  ${
    frames.length
      ? `
    <div class="admin-bulk-bar" id="bulk-bar" hidden>
      <span id="bulk-count">0 selected</span>
      <button type="button" class="btn btn--danger btn--sm" id="bulk-delete-btn">Delete Selected</button>
      <button type="button" class="link-btn" id="bulk-clear-btn">Clear selection</button>
    </div>
    <div class="admin-table-wrap"><table class="admin-table" id="frames-table">
      <thead><tr><th><input type="checkbox" id="select-all-frames" aria-label="Select all frames"></th><th></th><th>Piece</th><th>Style</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <script src="/js/admin-frames-list.js"></script>
    `
      : `<div class="admin-empty">No frames yet. <a href="/admin/frames/new">Add your first piece</a>.</div>`
  }
  `;
}
