form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: fd, // ne PAS mettre de headers ici
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Erreur serveur');
    alert('Message envoyé ! ID: ' + data.id);
    form.reset();
  } catch (err) {
    alert('Échec: ' + err.message);
  }
});
