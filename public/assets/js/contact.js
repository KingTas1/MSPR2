const form = document.querySelector('#contact-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: fd, // ne pas ajouter de headers
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Erreur serveur');
    alert('Message envoyé ! ID: ' + data.id);
    form.reset();
  } catch (err) {
    alert('Échec: ' + err.message);
  }
});
