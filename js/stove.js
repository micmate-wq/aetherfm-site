// "On the stove": light news from data/stove.json. Also feeds the hero's "Next on air" hint.
(() => {
  const sec = document.querySelector('[data-stove]');
  const list = document.querySelector('[data-stove-list]');
  const next = document.querySelector('[data-next-air]');
  const today = new Date().toISOString().slice(0, 10);
  const fmt = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(2, 4)}` : '—.—.—');
  const nice = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  fetch('data/stove.json?v=' + Date.now().toString(36).slice(0, -3), { cache: 'no-cache' })
    .then((r) => r.json())
    .then((items) => {
      if (!Array.isArray(items)) return;
      const shown = items.filter((i) => i && i.text && !(i.until && i.until <= today)).slice(0, 5);
      if (shown.length && sec && list) {
        for (const i of shown) {
          const li = document.createElement('li');
          const d = document.createElement('span'); d.className = 'num'; d.textContent = fmt(i.date || '');
          const t = document.createElement('span'); t.className = 'tx'; t.textContent = i.text;
          if (i.date && i.date > today) li.className = 'soon';
          li.append(d, t); list.append(li);
        }
        sec.hidden = false;
      }
      const show = items.filter((i) => i && i.onair && i.date && i.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
      if (show && next) { next.textContent = `Next on air · ${nice(show.date)}`; next.href = '#stove-h'; }
    })
    .catch(() => {});
})();
