// Motion layer: Lenis smooth scroll (mouse/trackpad only), a gentle "pop" on the hero elements
// as they reach mid-screen, and a light pull onto a section's top when a scroll stops just past it.
// Reduced motion → none of this runs; phones keep native touch scrolling and get no pull.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const nav = document.querySelector('.nav');
  const navH = () => (nav ? nav.offsetHeight : 0);
  const pops = [...document.querySelectorAll('.face, .film-frame, .phone')];
  if (still) return;

  let lenis = null;
  if (window.Lenis && !touch) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false });
    window.__aetherLenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // In-page links: smooth with Lenis, keep the hash (beta.js opens the form on #beta).
  if (lenis) document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = a.getAttribute('href').slice(1);
    const el = id ? document.getElementById(id) : document.body;
    if (!el) return;
    e.preventDefault();
    if (location.hash !== '#' + id) { history.pushState(null, '', '#' + id); window.dispatchEvent(new HashChangeEvent('hashchange')); }
    lenis.scrollTo(id === 'top' ? 0 : el, { offset: -navH() - 8, duration: 1.1 });
  });

  // Pop: --pop goes 0 → 1 as an element's centre nears the viewport centre.
  const live = new Set();
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight, mid = vh / 2;
    for (const el of live) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid) / (vh * 0.6);
      const p = Math.max(0, 1 - d);
      el.style.setProperty('--pop', (p * p * (3 - 2 * p)).toFixed(3));
    }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  const io = new IntersectionObserver((es) => { es.forEach((x) => (x.isIntersecting ? live.add(x.target) : (live.delete(x.target), x.target.style.setProperty('--pop', 0)))); onScroll(); }, { rootMargin: '10% 0px' });
  pops.forEach((el) => { el.classList.add('pop'); io.observe(el); });
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll); update();

  // Light pull: after a wheel scroll settles within ~14% of a viewport past (or before) a section top, ease onto it.
  if (!lenis) return;
  const sections = [...document.querySelectorAll('main > section:not([hidden]), footer')];
  let t = 0, pulling = false;
  lenis.on('scroll', () => {
    if (pulling) return;
    clearTimeout(t);
    t = setTimeout(() => {
      if (lenis.isScrolling || Math.abs(lenis.velocity) > 0.2) return;
      const y = lenis.scroll, off = navH(), win = innerHeight * 0.14;
      let best = null;
      for (const s of sections) {
        if (s.hidden) continue;
        const top = s.getBoundingClientRect().top + y - off;
        const dist = top - y;
        if (Math.abs(dist) > 4 && Math.abs(dist) < win && (!best || Math.abs(dist) < Math.abs(best - y))) best = top;
      }
      if (best === null) return;
      pulling = true;
      lenis.scrollTo(best, { duration: 0.7, easing: (x) => 1 - Math.pow(1 - x, 3), onComplete: () => (pulling = false) });
      setTimeout(() => (pulling = false), 900);
    }, 170);
  });
})();
