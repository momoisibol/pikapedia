(() => {
  const CONTACT_ENDPOINT = "https://formspree.io/f/xljbndzq";
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  const submit = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || submit.disabled) return;

    const data = new FormData(form);
    data.set("_subject", String(data.get("subject") || "").trim());
    data.set("_replyto", String(data.get("email") || "").trim());
    submit.disabled = true;
    status.textContent = "Je bericht wordt verzonden...";

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Formspree returned HTTP ${response.status}`);

      form.reset();
      status.textContent = "Je vraag is doorgestuurd. Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.";
    } catch (error) {
      console.error("Contact form submission failed:", error);
      status.textContent = "Verzenden is niet gelukt. Controleer je internetverbinding en probeer het opnieuw, of mail rechtstreeks naar pikapedia@hotmail.com.";
    } finally {
      submit.disabled = false;
    }
  });
})();
