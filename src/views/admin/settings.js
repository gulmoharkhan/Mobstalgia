import { escapeHtml } from '../../utils.js';

export function renderSettings({ adminEmail, error, success }) {
  return `
  <div class="admin-page-head">
    <div><h1>Settings</h1><p>Manage your admin login</p></div>
  </div>

  ${error ? `<div class="flash flash--error" style="border-radius:4px;padding:12px 16px;margin-bottom:20px;">${escapeHtml(error)}</div>` : ''}
  ${success ? `<div class="flash flash--success" style="border-radius:4px;padding:12px 16px;margin-bottom:20px;">${escapeHtml(success)}</div>` : ''}

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
  `;
}
