// Beta sign-up: AJAX post to Formspree (free plan, form xrppoadj → matt@aetherfm.xyz), inline thank-you.
(() => {
  const f = document.querySelector('[data-beta]');
  if (!f) return;
  const msg = f.querySelector('[data-beta-msg]');
  const btn = f.querySelector('.bsend');
  const id = (f.dataset.formId || '').trim();
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
