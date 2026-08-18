import { SITE_NAME } from '../../config.js';
import { escapeHtml } from '../../utils.js';

export function renderAdminLogin({ error } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin Login · ${escapeHtml(SITE_NAME)}</title>
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
<div class="auth-shell">
  <div class="auth-card">
    <h1>Admin Login</h1>
    <div class="sub">${escapeHtml(SITE_NAME)} control panel</div>
    ${error ? `<div class="flash flash--error" style="border-radius:4px;padding:10px 14px;margin-bottom:18px;">${escapeHtml(error)}</div>` : ''}
    <form method="POST" action="/admin/login">
      <div class="form-field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required autofocus>
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit" class="btn btn--block">Log In</button>
    </form>
  </div>
</div>
</body>
</html>`;
}
