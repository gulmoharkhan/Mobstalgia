import { escapeHtml } from '../utils.js';
import { INSTAGRAM_URL } from '../config.js';

const STRIP_PHOTOS = [
  '/img/figma2/about-photo-1.jpg',
  '/img/figma2/about-photo-2.jpg',
  '/img/figma2/about-photo-3.jpg',
  '/img/figma2/about-photo-4.jpg',
  '/img/figma2/about-photo-5.jpg',
  '/img/figma2/about-photo-6.jpg',
  '/img/figma2/about-photo-7.jpg',
];

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
  <section class="about-strip about-strip--compact" data-reveal aria-hidden="true">
    <div class="about-strip-track">
      ${STRIP_PHOTOS.map((src) => `<img src="${src}" alt="" loading="lazy">`).join('')}
    </div>
  </section>

  <section class="about-hero-minimal container">
    <h1 data-reveal>Old phone. New story.</h1>
    <p data-reveal style="--reveal-delay:60ms">Take it apart with your own hands. Build something only you could've made.</p>
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

  <section class="about-why container">
    <p data-reveal>No one does as meticulous a teardown as us — every frame is a few quiet hours with a screwdriver and a phone that actually means something to you. Not mass produced. Not somebody else's idea of nostalgia. Yours.</p>
  </section>

  <section class="about-steps container">
    <div class="about-steps-row">
      ${[
        ['Choose a kit', 'Casual to see it whole, Expert to go all the way in.'],
        ['Take it apart', 'Screw by screw, at your own pace.'],
        ['Hang it up', 'Something only you could have made.'],
      ]
        .map(
          ([title, body], i) => `
        <div class="about-step" data-reveal style="--reveal-delay:${i * 70}ms">
          <span class="about-step-num">${String(i + 1).padStart(2, '0')}</span>
          <h3>${title}</h3>
          <p>${body}</p>
        </div>`
        )
        .join('')}
    </div>
  </section>

  <div class="container about-body">
    <div class="about-compare-grid">
      <div class="about-compare-card" data-reveal>
        <span class="about-compare-flag">Casual Kit</span>
        <p>Open the phone, see every component laid out whole. No specialist tools required.</p>
      </div>
      <div class="about-compare-card about-compare-card--expert" data-reveal style="--reveal-delay:80ms">
        <span class="about-compare-flag">Expert Kit</span>
        <p>The components come apart too — camera lens assembly, Taptic Engine, the works. Bring patience.</p>
      </div>
    </div>
  </div>

  <section class="about-cta-band">
    <div class="container about-cta-inner" data-reveal>
      <h2>Ready to open yours up?</h2>
      <div class="about-cta-actions">
        <a href="/shop" class="btn">Browse the shop</a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="link-btn">@mobstalgia on Instagram →</a>
      </div>
    </div>
  </section>
  <script src="/js/about-snake.js"></script>
  `;
}
