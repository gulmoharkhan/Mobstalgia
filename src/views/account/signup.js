import { escapeHtml } from '../../utils.js';

export function renderSignup({ error, prefill = {}, next = '' } = {}) {
  return `
  <div class="container auth-page">
    <div class="auth-card" data-reveal>
      <h1>Create an account</h1>
      <p class="auth-sub">Save your Snake high score and see it on the leaderboard.</p>
      ${error ? `<div class="flash flash--error" style="border-radius:4px;padding:12px 16px;margin-bottom:16px;">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/account/signup">
        <input type="hidden" name="next" value="${escapeHtml(next || '')}">
        <div class="form-field">
          <label for="displayName">Name (shown on the leaderboard)</label>
          <input type="text" id="displayName" name="displayName" value="${escapeHtml(prefill.displayName || '')}" maxlength="40" required>
        </div>
        <div class="form-field">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" value="${escapeHtml(prefill.email || '')}" required>
        </div>
        <div class="form-field">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" minlength="6" required>
        </div>
        <button type="submit" class="btn" style="width:100%;">Create account</button>
      </form>
      <button type="button" class="btn btn--outline auth-google-btn" disabled title="Ask the site admin to enable Google sign-in">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 6 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.2 5.2C40.8 36 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
        Continue with Google (coming soon)
      </button>
      <p class="auth-switch">Already have an account? <a href="/account/login${next ? `?next=${encodeURIComponent(next)}` : ''}">Sign in</a></p>
    </div>
  </div>
  `;
}
