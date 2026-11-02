// Film in section 02: plays muted while on screen, pauses offscreen. Sound is opt-in.
// Phones get the 9:16 cut. Reduced motion: nothing autoplays; press play.
(() => {
  const fig = document.querySelector('[data-film]');
  if (!fig) return;
  const v = fig.querySelector('video');
  const playBtn = fig.querySelector('[data-film-play]');
  const snd = fig.querySelector('[data-film-sound]');
  const sndLabel = fig.querySelector('[data-film-sound-label]');
  const tall = matchMedia('(max-width: 720px)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (tall) v.poster = v.dataset.posterTall;
  let loaded = false, wanted = false;
  const load = () => { if (!loaded) { v.src = tall ? v.dataset.srcTall : v.dataset.srcWide; loaded = true; } };
  const play = () => { load(); const p = v.play(); if (p) p.catch(() => {}); };
  v.addEventListener('playing', () => fig.setAttribute('data-playing', ''));
  v.addEventListener('pause', () => fig.removeAttribute('data-playing'));
  playBtn.addEventListener('click', () => { wanted = true; play(); });
  v.addEventListener('click', () => (v.paused ? play() : v.pause()));
  snd.addEventListener('click', () => {
    v.muted = !v.muted;
    snd.setAttribute('aria-pressed', String(!v.muted));
    sndLabel.textContent = v.muted ? 'Sound off' : 'Sound on';
    if (!v.muted && v.paused) { wanted = true; play(); }
  });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!still || wanted) play(); }
    else if (!v.paused) v.pause();
  }, { threshold: 0.35 }).observe(fig);
})();
