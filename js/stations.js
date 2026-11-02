// Stations strip: past station names beside the locked /matt. A name turns bold while it is live on dontpanic.fm.
(() => {
  const strip = document.querySelector('[data-st-strip]');
  if (!strip) return;
  document.addEventListener('aether:mounts', (e) => {
    const live = new Set(e.detail || []);
    strip.querySelectorAll('[data-mount]').forEach((n) => n.classList.toggle('on', live.has(n.dataset.mount.toLowerCase())));
  });
})();
