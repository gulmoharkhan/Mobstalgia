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

function storyBlock({ headlinePre, headlineStrong, headlineSuf, body }) {
  return `
  <div class="about-story-block" data-reveal>
    <h2 class="about-story-headline">${headlinePre}${headlineStrong ? `<span class="text-blue">${headlineStrong}</span>` : ''}${headlineSuf || ''}</h2>
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
      headlinePre: "Aren't our phones a reflection of the ",
      headlineStrong: 'choices that we made in our lives',
      headlineSuf: '?',
      body: "At Mobstalgia we truly believe that phones are personal devices and a reflection of someone's financial position, character, and choices at different points in their lives. Think deeply and you will feel that phones are extension of a person's identity and choices.",
    })}
    ${storyBlock({
      headlinePre: 'And... why should such an important part of your past sit inside that drawer',
      headlineSuf: '?',
      body: 'We wanted to give these phones an opportunity to rekindle those memories from the past within you. Your phone is an engineering and design marvel that reflects not just you but the pinnacle of what was possible at that time.',
    })}
    ${storyBlock({
      headlinePre: 'Mobstalgia frames honour your deeply personal devices',
      body: 'Mobstalgia aims to be that conversation starter when you meet your college friend and relive those days when you used those phones. And boy those phones had a character back then... Slide, flip, keyboards, projectors, and what not.',
    })}
  </div>

  <section class="about-timeline-section">
    <div class="container">
      <div class="section-head" data-reveal>
        <h2>How the frame kit works</h2>
        <p>Five steps, from forgotten drawer to something on your wall.</p>
      </div>
      <div class="about-timeline">
        ${[
          ['Pick your style', 'Casual to open the phone and see every component, or Expert if you want to open those components too.'],
          ['We ship the frame', 'Your kit arrives with the frame, mounting hardware, and a simple guide for taking your device apart safely.'],
          ['You dismantle it', 'Screw by screw, layer by layer — your phone, in your hands. This is where you get to admire the work of the engineers who actually built it.'],
          ['You arrange &amp; mount', "Lay the components into the frame however you like — there's no wrong way to tell your phone's story."],
          ['Hang it up', 'What used to sit in a drawer now sits on your wall — a small, honest piece of inspiration instead of forgotten history.'],
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
        <p class="about-manifesto-lead">We could tear phones apart for you and ship you a finished piece — plenty of places do exactly that.</p>
        <p class="about-manifesto-body">But taking it apart yourself is the whole point. It's a few quiet, satisfying hours with a screwdriver and a device that actually means something to you, and it ends with something you made, not something you bought pre-made. Next time you spot an old phone lying around, you'll probably see it differently, too.</p>
      </div>
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
      <h2>Not sure where to start?</h2>
      <p>Browse a few devices we've framed ourselves for inspiration — Nokia bricks, early iPhones, an iPod Classic and more — then order the kit that matches your phone. New teardowns and behind-the-scenes shots go up on Instagram first.</p>
      <div class="about-cta-actions">
        <a href="/shop" class="btn">Browse the shop</a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="link-btn">@mobstalgia on Instagram →</a>
      </div>
    </div>
  </section>
  `;
}
