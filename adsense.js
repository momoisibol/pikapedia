(() => {
  // Het publisher-ID komt uit het AdSense-script in index.html (parameter "client"), zodat je het maar op één plek invult.
  // Vul hieronder per advertentie-eenheid het slot-ID in (AdSense > Advertenties > Per advertentie-eenheid).
  // Zonder slot-ID blijft het blok verborgen en gebruikt Google alleen Auto ads (indien aangezet).
  const SLOTS = {
    footer: "",
  };

  const lib = document.querySelector('script[src*="adsbygoogle.js"]');
  const client = lib && new URL(lib.src).searchParams.get("client");
  const valid = /^ca-pub-\d{10,20}$/.test(client || "") && !/^ca-pub-0+$/.test(client || "");

  if (valid) {
    document.querySelectorAll(".ad-slot").forEach((box) => {
      const slot = SLOTS[box.dataset.slot];
      if (!slot) return;
      const ins = box.querySelector("ins");
      ins.dataset.adClient = client;
      ins.dataset.adSlot = slot;
      box.hidden = false;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  // Opent opnieuw het toestemmingsvenster van Google (Privacy & berichten in AdSense).
  document.querySelectorAll("[data-cookie-settings]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.googlefc = window.googlefc || {};
      googlefc.callbackQueue = googlefc.callbackQueue || [];
      if (googlefc.showRevocationMessage) googlefc.showRevocationMessage();
      else googlefc.callbackQueue.push(() => googlefc.showRevocationMessage && googlefc.showRevocationMessage());
    })
  );
})();
