// Beta sign-up: AJAX post to Formspree (free plan, form xrppoadj → matt@aetherfm.xyz), inline thank-you.
(() => {
  const f = document.querySelector('[data-beta]');
  if (!f) return;
  const msg = f.querySelector('[data-beta-msg]');
  const btn = f.querySelector('.bsend');
  const id = (f.dataset.formId || '').trim();
  const d = f.closest('[data-beta-d]');
  // #beta links open the form
  const openFromHash = () => { if (d && location.hash === '#beta') { d.open = true; } };
  openFromHash(); addEventListener('hashchange', openFromHash);
  if (d) d.addEventListener('toggle', () => { if (d.open && !f.hasAttribute('data-done')) setTimeout(() => f.name.focus({ preventScroll: true }), 50); });
  if (id) f.action = 'https://formspree.io/f/' + id;

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!id) { msg.textContent = 'Sign-up opens soon.'; return; }
    if (!f.checkValidity()) { f.reportValidity(); return; }
    btn.disabled = true; msg.textContent = 'Sending…';
    try {
      const r = await fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      f.setAttribute('data-done', '');
      msg.textContent = "You're on the list. We'll be in touch when the beta opens.";
    } catch {
      msg.textContent = "That didn't send. Please try again, or email matt@aetherfm.xyz.";
    } finally { btn.disabled = false; }
  });
})();
