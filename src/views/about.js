import { SITE_NAME, INSTAGRAM_URL } from '../config.js';

const STRIP_PHOTOS = [
  '/img/figma2/about-photo-1.jpg',
  '/img/figma2/about-photo-2.jpg',
  '/img/figma2/about-photo-3.jpg',
  '/img/figma2/about-photo-4.jpg',
  '/img/figma2/about-photo-5.jpg',
  '/img/figma2/about-photo-6.jpg',
  '/img/figma2/about-photo-7.jpg',
];

function storyBlock({ headlineLead, headlinePre, headlineStrong, headlineSuf, body }) {
  return `
  <div class="about-story-block" data-reveal>
    <h2 class="about-story-headline">${headlineLead ? `${headlineLead}<br>` : ''}${headlinePre}${headlineStrong ? `<span class="text-blue">${headlineStrong}</span>` : ''}${headlineSuf || ''}</h2>
    <p class="about-story-body">${body}</p>
  </div>`;
}

export function renderAbout() {
  return `
  <section class="about-strip" data-reveal aria-hidden="true">
    <div class="about-strip-track">
      ${STRIP_PHOTOS.map((src) => `<img src="${src}" alt="" loading="lazy">`).join('')}
    </div>
  </section>

  <div class="container about-story">
    ${storyBlock({
      headlinePre: "Somewhere in a drawer, there's a phone that used to be your whole world. Isn't it strange how it became just ",
      headlineStrong: 'another thing you forgot to throw away',
      headlineSuf: '?',
      body: "It held your first messages, your worst selfies, songs you were embarrassed to admit you liked. It knew you before you figured yourself out. And now it just sits there, dead weight in a drawer, waiting for a decision you keep putting off.",
    })}
    ${storyBlock({
      headlineLead: "We think there's a better ending.",
      headlinePre: 'What if you could open it up, take it apart with your own two hands, and watch the whole ',
      headlineStrong: 'machine reveal itself',
      headlineSuf: '?',
      body: 'Every screw you remove is a small act of curiosity. Every layer you lift uncovers circuitry, sensors, and tiny feats of engineering that spent years hidden behind a screen. This is the part nobody tells you about old phones — they are genuinely beautiful once you let yourself look inside.',
    })}
    ${storyBlock({
      headlinePre: "That's the whole idea behind a Mobstalgia frame",
      body: "You don't buy a finished piece from us. You build one, screw by screw, on your own table, at your own pace — and then you hang up something that's unmistakably yours. Not mass produced. Not somebody else's idea of nostalgia. Yours.",
    })}
  </div>

  <section class="about-timeline-section">
    <div class="container">
      <div class="section-head" data-reveal>
        <h2>What it actually feels like to build one</h2>
        <p>Five moments, from forgotten drawer to something worth looking at every day.</p>
      </div>
      <div class="about-timeline">
        ${[
          ['You choose your path', "Casual, if you want to see every component sitting whole and proud. Expert, if 'that's a camera module' isn't a good enough answer for you."],
          ['A box shows up at your door', 'Inside: your frame, the mounting hardware, a screwdriver set, and a guide written so you never feel like you need a second pair of hands.'],
          ['You sit down and just start', 'No deadline, no manual you have to rush through. Just you, a screwdriver, and a phone giving up its secrets one screw at a time — this is the part people say is oddly meditative.'],
          ['The reveal moment', "You lift the back panel and there it is — the board, the battery, the ribbon cables — laid out like nothing you expected from something that fit in your pocket for years."],
          ['You arrange it your way', "There's no diagram to follow here. You decide what goes where, what gets the spotlight, what tells your version of this phone's story."],
        ]
          .map(
            ([title, body], i) => `
        <div class="about-timeline-step" data-reveal style="--reveal-delay:${i * 70}ms">
          <div class="about-timeline-marker"><span>${String(i + 1).padStart(2, '0')}</span></div>
          <div class="about-timeline-content"><h3>${title}</h3><p>${body}</p></div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="about-manifesto">
    <div class="container">
      <div class="about-manifesto-inner" data-reveal>
        <p class="about-manifesto-lead">We could tear the phone apart for you and just ship you a finished piece. Plenty of places do exactly that.</p>
        <p class="about-manifesto-body">But taking it apart yourself is the whole point. It's a few quiet, satisfying hours with a screwdriver and a device that actually means something to you, and it ends with something you made — not something you bought pre-made. Next time you spot an old phone lying around, you'll probably see it differently, too.</p>
      </div>
    </div>
  </section>

  <section class="about-arcade">
    <div class="container about-arcade-inner">
      <div class="section-head about-arcade-head" data-reveal>
        <h2>While you decide, take a break</h2>
        <p>Before phones had cameras worth bragging about, they had this. Play a round the way it used to feel — on us.</p>
      </div>
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
      </div>
      <p class="about-arcade-caption">Use arrow keys or WASD, or tap the pad. High score is bragging rights only — we don't save it.</p>
    </div>
  </section>

  <div class="container about-body">
    <div class="section-head" data-reveal><h2>Casual Kit vs. Expert Kit</h2></div>
    <div class="about-compare-grid">
      <div class="about-compare-card" data-reveal>
        <span class="about-compare-flag">Casual Kit</span>
        <p>Your first teardown — open the phone and see every component laid out whole: main board, battery, display, camera, speaker. A clean, satisfying build with no specialist tools required.</p>
      </div>
      <div class="about-compare-card about-compare-card--expert" data-reveal style="--reveal-delay:80ms">
        <span class="about-compare-flag">Expert Kit</span>
        <p>For the ones who don't stop at "that's a camera module." It opens the components themselves — the camera taken apart into its lens assembly, autofocus system, and image sensor; the Taptic Engine opened to see what's actually inside it. Bring a set of precision screwdrivers and some patience.</p>
      </div>
    </div>
  </div>

  <section class="about-cta-band">
    <div class="container about-cta-inner" data-reveal>
      <h2>Ready to open yours up?</h2>
      <p>Browse a few devices we've framed ourselves for inspiration — Nokia bricks, early iPhones, an iPod Classic and more — then order the kit that matches your phone. New teardowns and behind-the-scenes shots go up on Instagram first.</p>
      <div class="about-cta-actions">
        <a href="/shop" class="btn">Browse the shop</a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="link-btn">@mobstalgia on Instagram →</a>
      </div>
    </div>
  </section>
  <script src="/js/about-snake.js"></script>
  `;
}
