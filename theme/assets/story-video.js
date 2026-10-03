/*
  Yarn Basket · story-video.js (docs/home-media-plan.md §4)
  The "Made by hand" clip: muted, inline and looping, playing only while at least half of it is on screen (phones
  too: a deliberate exception to motion-plan §8, decisions.md 2026-10-02), and paused when it's scrolled away or the
  tab is hidden. Nothing downloads until the section is about half a screen away.
  It never starts by itself with reduced motion, lite mode or data saver (checked live, so changing the setting stops
  it), or when the browser refuses autoplay (iPhone Low Power Mode): the play button is always there instead.
  A pause from the shopper sticks; a play from the shopper wins over everything above.
  One thing at a time (docs/yarn-story-plan.md §4): while the section's yarn heading is still to be written, the clip
  waits, and starts when the words are done ('yarn:written'). Without the writing (reduced motion, lite mode) it
  behaves as above.
  Loaded only by sections/story.liquid when it has a video.
*/

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const phone = matchMedia('(max-width: 989px)');
const calm = () => reduce.matches || html.classList.contains('lite') || !!navigator.connection?.saveData;

document.querySelectorAll('[data-story-video]').forEach((box) => {
  const video = box.querySelector('video');
  const toggle = box.querySelector('[data-video-toggle]');
  let inView = false;
  let userPaused = false;
  let userPlayed = false;
  let refused = false;
  const words = box.closest('section')?.querySelector('.yarn--play');
  const writing = () => !!words && html.classList.contains('yarn-play') && !words.classList.contains('is-written');

  const load = () => {
    if (!video.getAttribute('src')) video.src = phone.matches ? video.dataset.srcSmall : video.dataset.srcLarge;
  };
  const show = (playing) => {
    box.toggleAttribute('data-playing', playing);
    toggle.setAttribute('aria-label', playing ? toggle.dataset.labelPause : toggle.dataset.labelPlay);
  };
  const play = () => {
    load();
    video.play().then(
      () => show(true),
      () => {
        // Autoplay refused: leave the still frame and the play button.
        if (!userPlayed) refused = true;
        show(false);
      }
    );
  };
  const allowed = () => userPlayed || (!userPaused && !refused && !calm());
  const may = () => userPlayed || (allowed() && !writing());
  const update = () => {
    if (inView && may() && !document.hidden) play();
    else if (!video.paused) {
      video.pause();
      show(false);
    }
  };

  video.addEventListener('playing', () => box.setAttribute('data-started', ''), { once: true });
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    if (video.paused) {
      userPaused = false;
      userPlayed = true;
      play();
    } else {
      userPaused = true;
      userPlayed = false;
      video.pause();
      show(false);
    }
  });

  // Half a screen away: start fetching, so it's ready when it arrives (never in the calm modes). Not a whole screen:
  // the section sits right after Bestsellers, and most visitors who never scroll that far shouldn't pay for it.
  const near = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || !allowed()) return;
    near.disconnect();
    video.preload = 'auto';
    load();
  }, { rootMargin: '50% 0px' });
  near.observe(box);
  new IntersectionObserver(([entry]) => {
    inView = entry.intersectionRatio >= 0.5;
    update();
  }, { threshold: [0, 0.5] }).observe(box);

  words?.addEventListener('yarn:written', update);
  document.addEventListener('visibilitychange', update);
  reduce.addEventListener('change', update);
});
