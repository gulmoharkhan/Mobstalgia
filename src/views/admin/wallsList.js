import { escapeHtml } from '../../utils.js';

function wallCard(wall) {
  const frameCount = wall.frames.length;
  return `
  <div class="wall-list-card">
    <div class="wall-list-card-media">
      ${wall.background ? `<img src="${escapeHtml(wall.background)}" alt="">` : ''}
    </div>
    <div class="wall-list-card-body">
      <span>${frameCount} frame${frameCount === 1 ? '' : 's'} placed</span>
      <div class="wall-list-card-actions">
        <a class="btn" style="padding:8px 14px;font-size:0.8rem;" href="/admin/walls/${encodeURIComponent(wall.id)}/edit">Edit</a>
        <form method="POST" action="/admin/walls/${encodeURIComponent(wall.id)}/delete" onsubmit="return confirm('Remove this wall from the homepage carousel?');">
          <button type="submit" class="btn btn--outline-light" style="padding:8px 14px;font-size:0.8rem;">Delete</button>
        </form>
      </div>
    </div>
  </div>`;
}

export function renderWallsList({ walls = [] }) {
  return `
  <div class="admin-page-head">
    <div><h1>Homepage walls</h1><p>The room photos and frame placements shown as a swipeable carousel at the top of the homepage.</p></div>
    <a href="/admin/walls/new" class="btn">Add a wall</a>
  </div>

  ${
    walls.length
      ? `<div class="wall-list-grid">${walls.map(wallCard).join('')}</div>`
      : `<div class="admin-form-card"><p style="color:#8a8a8a;">No walls yet — add one to start the homepage carousel.</p></div>`
  }
  `;
}
