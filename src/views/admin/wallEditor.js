import { escapeHtml } from '../../utils.js';

export function renderWallEditor({ wall, allFrames }) {
  const isNew = !wall;
  const background = wall?.background || '';
  const placements = (wall?.frames || []).map((p) => ({
    frameId: p.frameId,
    x: p.x,
    y: p.y,
    width: p.width,
    rotation: p.rotation || 0,
    z: p.z || 1,
    image: p.frame?.images?.[0]?.url || '/img/placeholder.svg',
    title: p.frame?.title || '',
  }));

  const paletteHtml = allFrames
    .map(
      (f) => `
    <div class="wall-palette-item" draggable="true" data-frame-id="${f.id}" data-image="${escapeHtml(f.images?.[0]?.url || '/img/placeholder.svg')}" data-title="${escapeHtml(f.title)}">
      <img src="${escapeHtml(f.images?.[0]?.url || '/img/placeholder.svg')}" alt="">
      <span>${escapeHtml(f.title)}</span>
    </div>`
    )
    .join('');

  const initialData = { id: wall?.id || null, background, placements };

  return `
  <div class="admin-page-head">
    <div><h1>${isNew ? 'Add a wall' : 'Edit wall'}</h1><p>Drag up to 4 frames onto the background photo, then drag to move, use the bottom-right handle to resize, and the top handle to rotate.</p></div>
    <a href="/admin/walls" class="btn btn--outline-light">Back to walls</a>
  </div>

  <div id="wall-editor-flash" class="flash flash--error" hidden style="border-radius:4px;padding:12px 16px;margin-bottom:16px;"></div>

  <div class="wall-editor-layout">
    <div class="wall-editor-canvas-wrap">
      <div class="admin-form-card" style="padding:16px;">
        <div class="form-field" style="margin-bottom:14px;">
          <label for="wall-bg-url">Background photo URL</label>
          <input type="url" id="wall-bg-url" value="${escapeHtml(background)}" placeholder="https://images.pexels.com/...">
        </div>
        <div class="form-field" style="margin-bottom:14px;">
          <label for="wall-bg-upload">Or upload a background photo</label>
          <input type="file" id="wall-bg-upload" accept="image/*">
        </div>
        <div id="wall-canvas" class="wall-editor-canvas" style="${background ? `background-image:url('${escapeHtml(background)}')` : ''}">
          ${!background ? '<div class="wall-editor-empty" id="wall-canvas-empty">Add a background photo above, then drag frames from the right onto it.</div>' : ''}
        </div>
        <p class="wall-editor-hint">Up to 4 frames per wall. Click the red × to remove a placed frame.</p>
      </div>
    </div>
    <div>
      <div class="admin-form-card">
        <h3>Frames palette</h3>
        <p style="color:#8a8a8a;font-size:0.82rem;">Drag a frame onto the wall photo.</p>
        <div class="wall-palette" id="wall-palette">${paletteHtml}</div>
      </div>
      <div class="admin-form-card">
        <button type="button" id="wall-save" class="btn" style="width:100%;">Save wall</button>
        <div id="wall-save-msg" style="margin-top:10px;font-size:0.85rem;"></div>
      </div>
    </div>
  </div>

  <script>window.__WALL_INITIAL__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};</script>
  <script src="/js/admin-wall-editor.js"></script>
  `;
}
