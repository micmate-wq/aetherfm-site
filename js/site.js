/* AETHER FM · v0 · no frameworks.
   Stream + status come from the public Icecast behind dontpanic.fm (/listen/ is proxied over https, CORS open).
   Nothing here is faked: if /matt is not broadcasting the page says OFF AIR and the timer reads --:--:--. */
(() => {
  'use strict';
  const ICECAST = 'https://dontpanic.fm/listen/';
  const STATUS_URL = ICECAST + 'status-json.xsl';
  const POLL_MS = 20000;
  const q = new URLSearchParams(location.search);
  // ?mount=<name> lets you point the page at another public mount (testing / future stations).
  const MOUNT = /^[a-z0-9_-]{1,40}$/i.test(q.get('mount') || '') ? q.get('mount') : 'matt';
  const STREAM_URL = ICECAST + MOUNT;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const body = document.body, audio = $('[data-audio]');
  const el = {
    word: $('[data-word]'), timer: $('[data-timer]'), marquee: $('[data-marquee]'), note: $('[data-note]'),
    listenText: $('[data-listen-text]'), npLive: $('[data-np-live]'),
    statusWord: $('[data-status-word]'), statusSmall: $('[data-status-small]'),
  };
  $$('[data-mount-label]').forEach(n => n.textContent = '/' + MOUNT);
  $$('[data-play]').forEach(b => b.setAttribute('aria-label', `Play the /${MOUNT} stream`));

  let state = 'checking', streamStart = null, listenStart = null, lastNP = '';

  const pad = n => String(n).padStart(2, '0');
  const hms = s => { s = Math.max(0, Math.floor(s)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };

  function setMarquee(text) {
    if (text === lastNP) return;
    lastNP = text;
    const one = `<span>${text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span>`;
    el.marquee.innerHTML = one.repeat(4) + one.repeat(4); // two identical halves → seamless -50% loop
    el.marquee.style.setProperty('--mq-dur', Math.max(12, text.length * 0.55) + 's');
    el.npLive.textContent = text;
  }

  function render() {
    body.dataset.state = state;
    const live = state === 'live';
    el.word.textContent = live ? 'ON AIR' : state === 'checking' ? 'TUNING' : 'OFF AIR';
    el.statusWord.textContent = live ? 'On air' : state === 'checking' ? 'Tuning' : 'Off air';
    el.statusSmall.textContent = live ? 'Live' : state === 'checking' ? '…' : 'Silent';
    if (state === 'off') { setMarquee(`silent — /${MOUNT} is not broadcasting right now`); el.note.textContent = 'Nothing on air. Try later.'; }
    if (state === 'unknown') { setMarquee(`status unknown — press play to try /${MOUNT}`); el.note.textContent = 'Could not read the air.'; }
    if (state === 'checking') { setMarquee('tuning in'); el.note.textContent = 'Checking the air…'; }
    tick();
  }

  function tick() {
    const now = Date.now() / 1000;
    el.timer.textContent = (state === 'live' && streamStart) ? hms(now - streamStart) : '--:--:--';
    el.listenText.textContent = listenStart ? `Listening · ${hms(now - listenStart)}` : 'Listen · 24/7';
  }
  setInterval(tick, 1000);

  async function poll() {
    try {
      const r = await fetch(STATUS_URL, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      let src = d.icestats && d.icestats.source; src = src ? (Array.isArray(src) ? src : [src]) : [];
      const s = src.find(x => (x.listenurl || '').split('/').pop() === MOUNT);   // present = a source is connected
      if (s) {
        state = 'live';
        const t = Date.parse(s.stream_start_iso8601 || s.stream_start || '');
        streamStart = isNaN(t) ? null : t / 1000;
        setMarquee(s.title || s.server_name || `/${MOUNT} — live`);
        el.note.textContent = s.title ? 'Now playing · from the stream' : ((s.server_description && !/^(unspecified description|unspecified name|no description)$/i.test(s.server_description.trim())) ? s.server_description : 'Live on the air');
      } else { state = 'off'; streamStart = null; }
    } catch (e) { state = 'unknown'; streamStart = null; }
    render();
  }
  poll();
  let pollTimer = setInterval(poll, POLL_MS);
  document.addEventListener('visibilitychange', () => {
    clearInterval(pollTimer);
    if (!document.hidden) { poll(); pollTimer = setInterval(poll, POLL_MS); }
  });

  /* ---------- play / pause ---------- */
  let stallTimer = null;
  function setPlaying(on) {
    body.classList.toggle('playing', on);
    $$('[data-play]').forEach(b => { b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} the /${MOUNT} stream`); });
    if (!on) listenStart = null;
    tick();
  }
  function silent(msg) {
    clearTimeout(stallTimer); audio.removeAttribute('src'); audio.load(); setPlaying(false);
    el.note.textContent = msg || `Silent — nothing on /${MOUNT} right now.`;
  }
  function play() {
    audio.src = STREAM_URL + '?t=' + Date.now();   // fresh connection, never a stale buffer
    setPlaying(true); el.note.textContent = 'Connecting…';
    clearTimeout(stallTimer); stallTimer = setTimeout(() => { if (audio.paused || audio.readyState < 3) silent(); }, 12000);
    audio.play().catch(err => silent(err && err.name === 'NotAllowedError' ? 'Press play to listen.' : undefined));
  }
  function stop() { clearTimeout(stallTimer); audio.pause(); audio.removeAttribute('src'); audio.load(); setPlaying(false); render(); }
  audio.addEventListener('playing', () => { clearTimeout(stallTimer); if (!listenStart) listenStart = Date.now() / 1000; el.note.textContent = state === 'live' ? (lastNP ? 'Now playing · from the stream' : 'Live') : 'Playing'; tick(); });
  audio.addEventListener('error', () => { if (body.classList.contains('playing')) silent(); });
  $$('[data-play]').forEach(b => b.addEventListener('click', () => body.classList.contains('playing') ? stop() : play()));
  if (location.hash === '#play') play();   // only works where autoplay is allowed

  /* ---------- node tiles: hover-clip hook (v0: no audio assets) ---------- */
  $$('.tile[data-clip]').forEach(t => {
    t.tabIndex = 0;
    t.addEventListener('mouseenter', () => { const src = t.dataset.clip; if (src) { /* future: short clip via a shared <audio> */ } });
  });

  /* ---------- drifting dots (canvas, ~30fps, pauses offscreen / hidden / reduced motion) ---------- */
  const cv = $('[data-dots]'), ctx = cv.getContext('2d');
  const COLS = ['#141414', '#141414', '#141414', '#141414', '#f6d24a', '#f4a6c1', '#94c6ec', '#e8432f'];
  let W = 0, H = 0, dots = [], visible = false, raf = 0, last = 0;
  function size() {
    const dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect();
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(160, W * H / 7000));
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    dots = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, r: [1, 1, 1.5, 1.5, 2, 2.5, 3, 4, 5.5, 7][Math.floor(rnd() * 10)],
      c: COLS[Math.floor(rnd() * COLS.length)], a: .25 + rnd() * .6, vx: (rnd() - .3) * .18, vy: (rnd() - .5) * .08 }));
    // three speed groups, interleaved by index (dot order is random in space): 1.25x, 1.10x, 1x
    const SPEEDS = [1.35, 1.15, 1];
    dots.forEach((d, i) => { const k = SPEEDS[i % 3]; d.vx *= k; d.vy *= k; });
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) { ctx.globalAlpha = d.a; ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function frame(t) {
    raf = 0; if (!visible || document.hidden) return;
    if (t - last > 33) { last = t; for (const d of dots) { d.x += d.vx; d.y += d.vy; if (d.x > W + 8) d.x = -8; if (d.x < -8) d.x = W + 8; if (d.y > H + 8) d.y = -8; if (d.y < -8) d.y = H + 8; } draw(); }
    raf = requestAnimationFrame(frame);
  }
  const go = () => { if (!reduceMotion && visible && !document.hidden && !raf) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; go(); }).observe(cv);
  document.addEventListener('visibilitychange', go);
  addEventListener('resize', () => { clearTimeout(size.t); size.t = setTimeout(size, 150); });
  size();
})();
