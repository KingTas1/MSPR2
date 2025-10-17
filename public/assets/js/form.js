document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const phoneError = document.getElementById("phone-error");
  const messageError = document.getElementById("message-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    nameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";
    messageError.textContent = "";

    let isValid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    if (name === "") {
      nameError.textContent = "Le nom est obligatoire !";
      isValid = false;
    }

    if (email === "" && phone === "") {
      emailError.textContent = "Veuillez entrer un email ou un numéro.";
      phoneError.textContent = "Veuillez entrer un numéro ou un email.";
      isValid = false;
    }

    if (message.length < 5) {
      messageError.textContent = "Votre message doit contenir au moins 5 caractères.";
      isValid = false;
    }

    if (isValid) {
      alert("Formulaire envoyé avec succès !");
      console.log("Formulaire envoyé avec succès !")
      form.reset();
    }
  });
});
