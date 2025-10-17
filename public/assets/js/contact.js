const form = document.querySelector('#contact-form');
const statusEl = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Envoi en cours...';
  const fd = new FormData(form);

  try {
    const res = await fetch('/api/message', { // <-- route correcte
      method: 'POST',
      body: fd // ne PAS ajouter de headers avec FormData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    statusEl.textContent = `✅ Message envoyé ! ID: ${data.id}`;
    form.reset();
  } catch (err) {
    statusEl.textContent = `❌ ${err.message}`;
  }
});
