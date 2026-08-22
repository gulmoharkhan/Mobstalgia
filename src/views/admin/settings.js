import { escapeHtml } from '../../utils.js';

function whyChooseBlockCard(block, index) {
  const image = block?.image || '';
  return `
    <div class="why-choose-admin-block">
      <div id="why-choose-error-${index}" class="flash flash--error" hidden style="border-radius:4px;padding:10px 14px;margin-bottom:10px;font-size:0.85rem;"></div>
      <img id="why-choose-preview-${index}" src="${escapeHtml(image)}" alt="Block ${index + 1} image" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;display:block;margin-bottom:10px;background:#f2f2f2;" ${image ? '' : 'hidden'}>
      <p style="color:#8a8a8a;font-size:0.82rem;margin:0 0 8px;">${escapeHtml(block?.heading || `Block ${index + 1}`)}</p>
      <input type="file" class="why-choose-input" data-index="${index}" accept="image/*">
    </div>`;
}

export function renderSettings({ adminEmail, error, success, coverImage, whyChooseBlocks = [] }) {
  return `
  <div class="admin-page-head">
    <div><h1>Settings</h1><p>Manage your admin login and site appearance</p></div>
  </div>

  ${error ? `<div class="flash flash--error" style="border-radius:4px;padding:12px 16px;margin-bottom:20px;">${escapeHtml(error)}</div>` : ''}
  ${success ? `<div class="flash flash--success" style="border-radius:4px;padding:12px 16px;margin-bottom:20px;">${escapeHtml(success)}</div>` : ''}

  <div class="admin-form-card">
    <h3>Homepage cover image</h3>
    <p style="color:#8a8a8a;font-size:0.88rem;">The background photo shown behind the hero headline on the homepage.</p>
    <div id="cover-image-error" class="flash flash--error" hidden style="border-radius:4px;padding:12px 16px;margin-bottom:16px;"></div>
    <div id="cover-image-success" class="flash flash--success" hidden style="border-radius:4px;padding:12px 16px;margin-bottom:16px;"></div>
    <img id="cover-image-preview" src="${escapeHtml(coverImage || '')}" alt="Current cover image" style="max-width:320px;width:100%;border-radius:8px;display:block;margin-bottom:16px;${coverImage ? '' : 'display:none;'}" ${coverImage ? '' : 'hidden'}>
    <form id="cover-image-form">
      <div class="form-field">
        <label for="cover-image-input">Upload new cover image</label>
        <input type="file" id="cover-image-input" accept="image/*">
      </div>
      <button type="submit" class="btn">Upload Cover Image</button>
    </form>
  </div>

  <div class="admin-form-card">
    <h3>"Why choose Mobstalgia?" blocks</h3>
    <p style="color:#8a8a8a;font-size:0.88rem;">Upload an image for each block shown on the homepage — the image updates as soon as you choose a file.</p>
    <div id="why-choose-success" class="flash flash--success" hidden style="border-radius:4px;padding:12px 16px;margin-bottom:16px;"></div>
    <div class="why-choose-admin-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;">
      ${whyChooseBlocks.map((b, i) => whyChooseBlockCard(b, i)).join('')}
    </div>
  </div>

  <div class="admin-form-card">
    <h3>Change password</h3>
    <p style="color:#8a8a8a;font-size:0.88rem;">Signed in as ${escapeHtml(adminEmail)}</p>
    <form method="POST" action="/admin/settings/password">
      <div class="form-field">
        <label for="currentPassword">Current password</label>
        <input type="password" id="currentPassword" name="currentPassword" required>
      </div>
      <div class="form-field">
        <label for="newPassword">New password</label>
        <input type="password" id="newPassword" name="newPassword" required minlength="8">
      </div>
      <div class="form-field">
        <label for="confirmPassword">Confirm new password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required minlength="8">
      </div>
      <button type="submit" class="btn">Update Password</button>
    </form>
  </div>
  <script src="/js/admin-cover-image.js"></script>
  <script src="/js/admin-why-choose.js"></script>
  `;
}
