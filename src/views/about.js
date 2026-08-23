import { escapeHtml } from '../utils.js';
import { INSTAGRAM_URL } from '../config.js';

function leaderboardList(leaderboard) {
  if (!leaderboard.length) {
    return `<p class="snake-leaderboard-empty">No scores yet — be the first on the board.</p>`;
  }
  return `
  <ol class="snake-leaderboard-list">
    ${leaderboard
      .map(
        (row, i) => `
      <li>
        <span class="snake-leaderboard-rank">${i + 1}</span>
        <span class="snake-leaderboard-name">${escapeHtml(row.displayName)}</span>
        <span class="snake-leaderboard-score">${row.score}</span>
      </li>`
      )
      .join('')}
  </ol>`;
}

export function renderAbout({ customer = null, leaderboard = [] } = {}) {
  return `
  <section class="about-hero-minimal container">
    <h1 data-reveal>Every phone has one more story in it.</h1>
    <p data-reveal style="--reveal-delay:60ms">We believe an old phone isn't waste — it's raw material for something that means more. Mobstalgia gives it a new life: off the shelf, onto your wall, into your everyday.</p>
  </section>

  <section class="about-arcade">
    <div class="container about-arcade-inner">
      <div class="about-arcade-grid">
        <div class="nokia-phone" data-reveal>
          <div class="nokia-speaker" aria-hidden="true"></div>
          <div class="nokia-screen-bezel">
            <canvas id="snake-canvas" width="220" height="220" role="img" aria-label="Retro snake game"></canvas>
            <div class="nokia-screen-overlay" id="snake-overlay">
              <p class="nokia-overlay-title">SNAKE</p>
              <p class="nokia-overlay-hint">Press start to play</p>
            </div>
          </div>
          <div class="nokia-controls">
            <div class="nokia-softkeys">
              <button type="button" class="nokia-softkey" id="snake-start">Start</button>
              <div class="nokia-score" id="snake-score" aria-live="polite">000</div>
            </div>
            <div class="nokia-dpad" role="group" aria-label="Snake direction controls">
              <button type="button" class="nokia-dpad-btn nokia-dpad-up" data-dir="up" aria-label="Up">▲</button>
              <button type="button" class="nokia-dpad-btn nokia-dpad-left" data-dir="left" aria-label="Left">◀</button>
              <button type="button" class="nokia-dpad-btn nokia-dpad-center" aria-hidden="true"></button>
              <button type="button" class="nokia-dpad-btn nokia-dpad-right" data-dir="right" aria-label="Right">▶</button>
              <button type="button" class="nokia-dpad-btn nokia-dpad-down" data-dir="down" aria-label="Down">▼</button>
            </div>
          </div>
          <p class="about-arcade-caption">Arrow keys, WASD, or tap the pad.</p>
        </div>

        <div class="snake-leaderboard" data-reveal style="--reveal-delay:100ms"
             data-logged-in="${customer ? 'true' : 'false'}"
             data-display-name="${customer ? escapeHtml(customer.display_name) : ''}">
          <h2>High scores</h2>
          <div id="snake-leaderboard-list">${leaderboardList(leaderboard)}</div>
          <div id="snake-account-prompt" class="snake-account-prompt" ${customer ? 'hidden' : ''}>
            <p>Sign in to save your score and get on the board.</p>
            <div class="snake-account-actions">
              <a href="/account/signup?next=/about" class="btn btn--sm">Create account</a>
              <a href="/account/login?next=/about" class="link-btn">Sign in</a>
            </div>
          </div>
          <p id="snake-save-status" class="snake-save-status" hidden></p>
        </div>
      </div>
    </div>
  </section>

  <section class="about-philosophy container">
    <p class="about-philosophy-lead" data-reveal>We don't think a phone's story ends the day a new one arrives. It just needs a new job — one where it gets to mean something again.</p>
  </section>

  <section class="about-beliefs container">
    ${[
      ['New life, not landfill.', 'Every kit is one fewer phone gathering dust in a drawer, or worse.'],
      ['Made by your hands.', 'Not a factory. You choose the pace, you feel every screw come loose.'],
      ['A reminder, every day.', 'Hang it where you\'ll see it — and remember the year it carried you through.'],
    ]
      .map(
        ([title, body], i) => `
      <div class="about-belief" data-reveal style="--reveal-delay:${i * 80}ms">
        <h3>${title}</h3>
        <p>${body}</p>
      </div>`
      )
      .join('')}
  </section>

  <section class="about-cta-band">
    <div class="container about-cta-inner" data-reveal>
      <h2>Give yours a new life.</h2>
      <div class="about-cta-actions">
        <a href="/shop" class="btn">Browse the shop</a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="link-btn">@mobstalgia on Instagram →</a>
      </div>
    </div>
  </section>
  <script src="/js/about-snake.js"></script>
  `;
}
