import { escapeHtml, formatCurrency, splitTitle } from '../utils.js';

const KIT_LABEL = { novice: 'Casual Kit', expert: 'Expert Kit' };

function productCard(frame) {
  const cover = frame.images?.[0]?.url || '/img/placeholder.svg';
  const { name, tagline } = splitTitle(frame.title);
  return `
  <a class="product-card" href="/piece/${frame.id}">
    <div class="product-card-media">
      <img src="${cover}" alt="${escapeHtml(frame.title)}" loading="lazy">
      <span class="badge badge--type${frame.type === 'expert' ? ' badge--type--expert' : ''}">${KIT_LABEL[frame.type] || 'Frame Kit'}</span>
    </div>
    <div class="product-card-title">${escapeHtml(name)}</div>
    ${tagline ? `<div class="product-card-sub">${escapeHtml(tagline)}</div>` : ''}
    <div class="product-card-price">${formatCurrency(frame.price)}</div>
  </a>`;
}

function ctaTile() {
  return `
  <a class="product-card product-card--cta" href="/shop">
    <div class="product-card-cta-inner">
      <span class="product-card-cta-arrow" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
      <span class="product-card-cta-text">Browse all frames</span>
    </div>
  </a>`;
}

export function renderHome({ featured }) {
  return `
  <section class="hero-orbit-outer">
    <div class="hero-orbit-frame" data-reveal>
      <div class="hero-orbit-rings" aria-hidden="true">
        <span class="hero-orbit-ring hero-orbit-ring--1"></span>
        <span class="hero-orbit-ring hero-orbit-ring--2"></span>
      </div>
      <div class="hero-orbit-connectors" aria-hidden="true">
        <span class="hero-orbit-connector" style="--rot:210deg; --len:320px;"></span>
        <span class="hero-orbit-connector" style="--rot:150deg; --len:320px;"></span>
        <span class="hero-orbit-connector" style="--rot:-30deg; --len:320px;"></span>
        <span class="hero-orbit-connector" style="--rot:30deg; --len:320px;"></span>
        <span class="hero-orbit-connector" style="--rot:-90deg; --len:320px;"></span>
        <span class="hero-orbit-connector" style="--rot:90deg; --len:320px;"></span>
      </div>
      <span class="hero-orbit-node hero-orbit-node--1" style="--tx:-277px; --ty:-160px;">🔩</span>
      <span class="hero-orbit-node hero-orbit-node--2" style="--tx:-277px; --ty:160px;">🔋</span>
      <span class="hero-orbit-node hero-orbit-node--3" style="--tx:277px; --ty:-160px;">📷</span>
      <span class="hero-orbit-node hero-orbit-node--4" style="--tx:277px; --ty:160px;">🔌</span>
      <span class="hero-orbit-node hero-orbit-node--5" style="--tx:0px; --ty:-320px;">📱</span>
      <span class="hero-orbit-node hero-orbit-node--6" style="--tx:0px; --ty:320px;">⚙️</span>
      <div class="hero-orbit-center">
        <span class="kicker hero-orbit-kicker">The teardown frame kit</span>
        <h1 class="hero-oneliner">Still holding onto that old phone?<br><span class="text-italic">Give it a wall, not a drawer.</span></h1>
        <p class="hero-orbit-sub">Every screw, cable and sensor — laid out and framed, not hidden in a drawer.</p>
        <div class="hero-actions">
          <a href="/shop" class="btn" data-magnetic>Get the Frame Kit</a>
          <a href="/about" class="link-btn link-btn--lg">How it works →</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section container">
    <span class="section-tag">1.1</span>
    <div class="section-head" data-reveal>
      <span class="kicker">Pick an era</span>
      <h2>A few phones worth framing</h2>
      <p>A handful of teardowns to spark ideas — pick an era, or bring your own.</p>
    </div>
    <div class="home-grid" data-reveal>
      ${featured.slice(0, 7).map((f) => productCard(f)).join('') || '<p>New pieces are on the way — check back soon.</p>'}
      ${ctaTile()}
    </div>
  </section>

  <section class="section container tier-section">
    <span class="section-tag">1.2</span>
    <div class="section-head" data-reveal>
      <span class="kicker">Choose your depth</span>
      <h2>How expert are you?</h2>
      <p>Every kit reflects how far you go. Casual keeps it simple. Expert leaves nothing behind.</p>
    </div>
    <div class="tier-split">
      <div class="tier-panel tier-panel--novice" data-reveal style="--reveal-delay:60ms">
        <span class="tier-flag">Just starting out</span>
        <h3 class="tier-name">Casual</h3>
        <p class="tier-tagline">Open the phone. Meet every part.</p>
        <p class="tier-desc">For your first teardown. Pull the shell off and lay out the whole device — main board, battery, display, camera, speaker — every component, intact and exactly where the engineers put it. No specialist tools required.</p>
        <span class="tier-chip">Main board · Battery · Display</span>
        <a href="/shop?type=novice" class="link-btn link-btn--lg">Browse Casual kits →</a>
      </div>
      <div class="tier-panel tier-panel--expert" data-reveal style="--reveal-delay:140ms">
        <span class="tier-flag">Detail-obsessed</span>
        <h3 class="tier-name">Expert</h3>
        <p class="tier-tagline">Open the parts, not just the phone.</p>
        <p class="tier-desc">For people who don't stop at "that's a camera module." Open the camera itself and find the lens assembly, autofocus system, and image sensor inside. Same with the Taptic Engine — every part with its own hidden layers, taken all the way down.</p>
        <span class="tier-chip">Lens assembly · Autofocus system · Image sensor</span>
        <a href="/shop?type=expert" class="link-btn link-btn--lg">Browse Expert kits →</a>
      </div>
    </div>
  </section>

  <section class="section container promise-section">
    <span class="section-tag">1.3</span>
    <div class="promise-grid">
      <div class="promise-lead" data-reveal>
        <span class="kicker">Our promise</span>
        <h2>We don't cut corners.<br><span class="text-italic">Literally.</span></h2>
        <p class="promise-body">Most teardown frames quietly leave things out — a flex cable with nowhere tidy to go, a bottom board that's "basically just contacts." We don't. Every functional component gets a place on the frame, positioned with the same proximity and connectivity it had inside the phone. Nothing is skipped because it was hard to mount.</p>
        <a href="/about" class="link-btn link-btn--lg">See how we lay it out →</a>
      </div>
      <ul class="promise-list" data-reveal style="--reveal-delay:100ms">
        <li class="promise-item">
          <span class="promise-item-mark">✓</span>
          <div><span class="promise-item-name">Flex cables</span><p>The connector every other kit skips because it doesn't sit flat — ours gets its own bracket.</p></div>
        </li>
        <li class="promise-item">
          <span class="promise-item-mark">✓</span>
          <div><span class="promise-item-name">Bottom board</span><p>Charging port, mic, speaker terminals — mounted in place, not boxed off to the side.</p></div>
        </li>
        <li class="promise-item">
          <span class="promise-item-mark">✓</span>
          <div><span class="promise-item-name">Camera module internals</span><p>Lens assembly, autofocus coil, sensor — kept adjacent, the way they sat in the housing.</p></div>
        </li>
        <li class="promise-item">
          <span class="promise-item-mark">✓</span>
          <div><span class="promise-item-name">Every last screw</span><p>Even the fasteners get a marked spot. If it came out of the phone, it goes on the frame.</p></div>
        </li>
      </ul>
    </div>
  </section>

  <section class="fomo-story">
    <div class="container fomo-story-grid">
      <div class="fomo-collage" data-reveal aria-hidden="true">
        <img class="fomo-photo fomo-photo--a" src="/img/seed/nokia-n73-2.jpg" alt="" loading="lazy">
        <img class="fomo-photo fomo-photo--b" src="/img/seed/iphone-4s-1.jpg" alt="" loading="lazy">
        <img class="fomo-photo fomo-photo--c" src="/img/seed/apple-watch-series-3-3.jpg" alt="" loading="lazy">
      </div>
      <div class="fomo-story-copy">
        <h2 class="fomo-story-lead" data-reveal style="--reveal-delay:60ms">Every phone was a chapter.<br><span class="text-italic">This one's still being written.</span></h2>
        <div class="fomo-story-body" data-reveal style="--reveal-delay:120ms">
          <p>You remember the exact click of its buttons. The crack in the corner from the fall you still tell people about. The sticker you half-peeled off and gave up on. That phone isn't just old — it's evidence.</p>
          <p>Take it apart. Study the board like a tiny city map. Arrange the pieces however you like, mount it, and hang it somewhere you'll actually see it — not a drawer you open twice a year.</p>
        </div>
        <a href="/about" class="link-btn link-btn--lg" data-reveal style="--reveal-delay:180ms">See how the frame kit works →</a>
      </div>
    </div>
  </section>
  `;
}
