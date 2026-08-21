import { escapeHtml } from '../../utils.js';

export function renderSettings({ adminEmail, error, success, coverImage }) {
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
  `;
}
