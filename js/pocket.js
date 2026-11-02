// Pocket preview: cycles real Pocket screens. Pauses offscreen and on reduced motion.
(() => {
  const root = document.querySelector('[data-pocket]');
  if (!root) return;
  const imgs = [...root.querySelectorAll('.scr img')];
  const caps = [...root.querySelectorAll('[data-pk]')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer = null, visible = false;

  const show = (n) => {
    i = (n + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    caps.forEach((c, k) => c.setAttribute('aria-current', k === i ? 'true' : 'false'));
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!still && visible && !timer) timer = setInterval(() => show(i + 1), 3600); };

  caps.forEach((c, k) => c.addEventListener('click', () => { show(k); stop(); start(); }));
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { imgs.forEach((im) => (im.loading = 'eager')); start(); } else stop();
  }, { threshold: 0.25 }).observe(root);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();
