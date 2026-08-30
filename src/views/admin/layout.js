import { SITE_NAME } from '../../config.js';
import { escapeHtml } from '../../utils.js';

export function renderAdminLayout({ title, activeNav = '', bodyHtml = '', adminEmail = '', flash = null }) {
  const item = (href, label, key) =>
    `<a href="${href}" class="admin-nav-link${activeNav === key ? ' admin-nav-link--active' : ''}">${label}</a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)} · Admin · ${escapeHtml(SITE_NAME)}</title>
<link rel="stylesheet" href="/styles.css" />
</head>
<body class="admin-body">
<div class="admin-shell">
  <aside class="admin-sidebar">
    <div class="admin-brand">${escapeHtml(SITE_NAME)}<span>Admin</span></div>
    <nav class="admin-nav">
      ${item('/admin', 'Dashboard', 'dashboard')}
      ${item('/admin/frames', 'Frames', 'frames')}
      ${item('/admin/walls', 'Walls', 'walls')}
      ${item('/admin/orders', 'Orders', 'orders')}
      ${item('/admin/feedback', 'Feedback', 'feedback')}
      ${item('/admin/settings', 'Settings', 'settings')}
    </nav>
    <div class="admin-sidebar-footer">
      <div class="admin-user">${escapeHtml(adminEmail)}</div>
      <a href="/shop" class="admin-view-site">View site ↗</a>
      <form method="POST" action="/admin/logout"><button class="admin-logout-btn" type="submit">Log out</button></form>
    </div>
  </aside>
  <div class="admin-content">
    ${flash ? `<div class="flash flash--${flash.type || 'info'}">${escapeHtml(flash.message)}</div>` : ''}
    <main>
      ${bodyHtml}
    </main>
  </div>
</div>
</body>
</html>`;
}
