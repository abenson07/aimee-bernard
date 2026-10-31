/* Contact form: sends the message through Web3Forms, which emails it to Aimee (aepbernard@gmail.com).
   The access key comes from PUBLIC_WEB3FORMS_KEY (set in .env and in Vercel); it is public by design. */
(() => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  if (!form || !status) return;
  const btn = form.querySelector('button[type="submit"]');
  const label = btn ? btn.querySelectorAll('.button-text') : [];
  const setLabel = (t) => label.forEach((l) => { l.textContent = t; });
  const MAIL = 'aepbernard@gmail.com';

  let sent = false;
  // After a successful send the button stays on "Sent!" (disabled) until the visitor types again.
  const resetSent = () => {
    if (!sent) return;
    sent = false;
    btn.disabled = false; btn.classList.remove('is-sent'); setLabel('Send message');
    status.hidden = true;
  };
  form.addEventListener('input', resetSent);
  form.addEventListener('change', resetSent);

  const show = (kind, html) => { status.hidden = false; status.className = `contact__status is-${kind}`; status.innerHTML = html; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = form.dataset.key;
    const fd = new FormData(form);
    if (fd.get('botcheck')) return; // spam trap: bots tick the hidden box
    if (!key) {
      show('error', `The form isn't switched on yet. Please email <a href="mailto:${MAIL}">${MAIL}</a> directly.`);
      return;
    }
    const topic = fd.get('topic') || 'General';
    const payload = {
      access_key: key,
      subject: `New message from the website: ${topic}`,
      from_name: 'Aimee Pugh-Bernard website',
      name: fd.get('name'),
      email: fd.get('email'),
      topic,
      message: fd.get('message'),
      botcheck: '',
    };
    btn.disabled = true; setLabel('Sending…'); status.hidden = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        form.reset();
        sent = true;
        btn.classList.add('is-sent'); setLabel('Sent!');
        show('ok', 'Thanks! Your message is on its way to Aimee.');
      } else throw new Error(data.message || 'send failed');
    } catch (err) {
      show('error', `Something went wrong sending that. Please try again, or email <a href="mailto:${MAIL}">${MAIL}</a> directly.`);
    } finally {
      if (!sent) { btn.disabled = false; setLabel('Send message'); }
    }
  });
})();
