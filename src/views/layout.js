import { SITE_NAME, SITE_TAGLINE, INSTAGRAM_URL } from '../config.js';
import { escapeHtml } from '../utils.js';

export function renderLayout({ title, activeNav = '', bodyHtml = '', extraHead = '', flash = null }) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const navItem = (href, label, key) =>
    `<a href="${href}" class="nav-link${activeNav === key ? ' nav-link--active' : ''}">${label}</a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(fullTitle)}</title>
<script>document.documentElement.className += ' js';</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css" />
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2216%22 fill=%22%23111%22/><rect x=%2228%22 y=%2214%22 width=%2244%22 height=%2272%22 rx=%228%22 fill=%22none%22 stroke=%22white%22 stroke-width=%226%22/></svg>">
${extraHead}
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="brand">
      <img src="/img/logo.png" alt="${escapeHtml(SITE_NAME)}" class="brand-mark" width="34" height="34">
      <span class="brand-text">${escapeHtml(SITE_NAME)}</span>
    </a>
    <nav class="main-nav" id="main-nav">
      ${navItem('/', 'Home', 'home')}
      ${navItem('/shop', 'Shop', 'shop')}
      ${navItem('/about', 'About', 'about')}
      ${navItem('/track', 'Track Order', 'track')}
      ${navItem('/feedback', 'Contact', 'feedback')}
    </nav>
    <div class="header-actions">
      <a href="${INSTAGRAM_URL}" class="icon-link" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(SITE_NAME)} on Instagram" title="Follow us on Instagram">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
      </a>
      <a href="/cart" class="cart-link" id="cart-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>Cart</span>
        <span class="cart-count" id="cart-count" hidden>0</span>
      </a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>
  <div class="nav-backdrop" id="nav-backdrop" hidden></div>
</header>
${flash ? `<div class="flash flash--${flash.type || 'info'}"><div class="container">${escapeHtml(flash.message)}</div></div>` : ''}
<main class="site-main">
${bodyHtml}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <div class="footer-brand">
        <img src="/img/logo.png" alt="${escapeHtml(SITE_NAME)}" class="brand-mark brand-mark--footer" width="30" height="30">
        <span class="brand-text">${escapeHtml(SITE_NAME)}</span>
      </div>
      <p class="footer-tagline">${escapeHtml(SITE_TAGLINE)}</p>
    </div>
    <div class="footer-links">
      <a href="/shop">Shop</a>
      <a href="/about">About</a>
      <a href="/track">Track Order</a>
      <a href="/feedback">Contact</a>
      <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
      <a href="/admin" class="footer-admin-link">Admin</a>
    </div>
  </div>
</footer>
<script src="/js/cart.js"></script>
<script src="/js/site-interactions.js"></script>
</body>
</html>`;
}
