// Pagina met downloads van GBA-emulators (officiële sites van de makers).
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);

  const detectOS = () => {
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPad/i.test(ua)) return "mobile";
    if (/Mac/i.test(ua)) return "mac";
    if (/Linux|X11/i.test(ua)) return "linux";
    return "win";
  };
  // Kiest het juiste bestand uit de nieuwste GitHub-release voor het besturingssysteem van de bezoeker.
  const PICKERS = {
    mgba: (assets, os) => {
      const find = (re) => assets.find((a) => re.test(a.name));
      if (os === "win") return find(/win64-installer\.exe$/);
      if (os === "mac") return find(/macos\.dmg$/);
      if (os === "linux") return find(/appimage-x64\.appimage$/);
    },
    vbam: (assets, os) => {
      const find = (re) => assets.find((a) => re.test(a.name));
      if (os === "win") return find(/Win-x86_64\.zip$/);
      if (os === "mac") return find(/Mac-ARM64\.zip$/) || find(/Mac-x86_64\.zip$/);
    },
  };

  const EMUS = [
    {
      name: "mGBA", badge: ["Aanbevolen", "Recommended"], url: "https://mgba.io/downloads.html",
      repo: "mgba-emu/mgba", pick: "mgba",
      platforms: "Windows · macOS · Linux · Android",
      nl: "Snel, nauwkeurig en gratis. Ondersteunt save states, cheats, snel vooruitspoelen en controllers. De beste keuze voor de meeste mensen.",
      en: "Fast, accurate and free. Supports save states, cheats, fast-forward and controllers. The best choice for most people.",
    },
    {
      name: "VisualBoyAdvance-M", badge: ["Klassiek", "Classic"], url: "https://vba-m.com/downloads",
      repo: "visualboyadvance-m/visualboyadvance-m", pick: "vbam",
      platforms: "Windows · macOS · Linux",
      nl: "De bekende klassieker met veel instellingen, ook voor Game Boy en Game Boy Color.",
      en: "The well-known classic with lots of options, also for Game Boy and Game Boy Color.",
    },
    {
      name: "RetroArch", badge: ["Alles-in-één", "All-in-one"], url: "https://www.retroarch.com/?page=platforms",
      platforms: "Windows · macOS · Linux · Android · iOS · Switch",
      nl: "Eén programma voor veel consoles, met shaders en online functies. Gebruik de mGBA-core voor GBA.",
      en: "One program for many consoles, with shaders and online features. Use the mGBA core for GBA.",
    },
    {
      name: "Delta", badge: ["iPhone / iPad", "iPhone / iPad"], url: "https://deltaemulator.com",
      platforms: "iOS · iPadOS",
      nl: "Gratis emulator voor Apple-apparaten met touch-bediening en ondersteuning voor controllers.",
      en: "Free emulator for Apple devices with touch controls and controller support.",
    },
  ];

  const STEPS = [
    ["Download een emulator hieronder en installeer of pak hem uit.", "Download an emulator below and install or unzip it."],
    ["Start de emulator en kies Bestand → Openen (File → Open).", "Start the emulator and choose File → Open."],
    ["Selecteer je eigen spelbestand (.gba). Het spel start meteen.", "Select your own game file (.gba). The game starts right away."],
    ["Stel je toetsen of controller in via het menu Opties/Input.", "Set up your keys or controller in the Options/Input menu."],
    ["Bewaar je voortgang met een save state of de gewone save in het spel.", "Save your progress with a save state or the normal in-game save."],
  ];

  function render() {
    $("view-emulator").innerHTML = `
      <h2 class="view-title">${L("GBA-emulator downloaden", "Download a GBA emulator")}</h2>
      <p class="wt-lead">${L(
        "Wil je de klassieke Pokémon-games op de Game Boy Advance spelen, zoals FireRed, LeafGreen, Ruby, Sapphire en Emerald? Met een emulator kan dat op je pc of telefoon. Hieronder staan de populairste gratis emulators, met links naar de officiële downloadpagina's.",
        "Want to play the classic Game Boy Advance Pokémon games like FireRed, LeafGreen, Ruby, Sapphire and Emerald? An emulator lets you do that on your PC or phone. Below are the most popular free emulators, linked to their official download pages.")}</p>

      <div class="emu-grid">
        ${EMUS.map((e) => `
          <article class="emu-card">
            <span class="emu-badge">${L(e.badge[0], e.badge[1])}</span>
            <h3>${e.name}</h3>
            <small>${e.platforms}</small>
            <p>${L(e.nl, e.en)}</p>
            <a class="big-btn emu-dl" href="${e.url}" target="_blank" rel="noopener noreferrer"${e.repo ? ` data-repo="${e.repo}" data-pick="${e.pick}"` : ""}            >${L("Downloaden", "Download")}</a>
          </article>`).join("")}
      </div>

      <h3 class="home-h">${L("Zo begin je", "Getting started")}</h3>
      <ol class="emu-steps">${STEPS.map(([nl, en]) => `<li>${L(nl, en)}</li>`).join("")}</ol>

      <div class="emu-note">
        <b>${L("Let op: spelbestanden (ROMs)", "Note: game files (ROMs)")}</b>
        <p>${L(
          "Emulators zelf zijn legaal, maar de Pokémon-spelbestanden zijn auteursrechtelijk beschermd. Op deze site vind je dus geen ROMs en we linken er ook niet naar. Gebruik alleen een back-up van een spel dat je zelf bezit.",
          "Emulators themselves are legal, but the Pokémon game files are copyrighted. This site does not host or link to ROMs. Only use a backup of a game you own.")}</p>
        <p>${L("Download emulators altijd van de officiële site van de maker om malware te vermijden.", "Always download emulators from the maker's official site to avoid malware.")}</p>
      </div>`;
  }

  // Directe download via de nieuwste GitHub-release; bij een fout opent de officiële downloadpagina.
  $("view-emulator").addEventListener("click", async (ev) => {
    const a = ev.target.closest("a[data-repo]");
    if (!a) return;
    const os = detectOS();
    if (os === "mobile") return;
    ev.preventDefault();
    const label = a.textContent;
    a.textContent = L("Bezig…", "Working…");
    try {
      const res = await fetch(`https://api.github.com/repos/${a.dataset.repo}/releases/latest`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const asset = PICKERS[a.dataset.pick](((await res.json()).assets) || [], os);
      if (!asset) throw new Error("geen bestand");
      a.textContent = L("Download gestart", "Download started");
      window.location.href = asset.browser_download_url;
      setTimeout(() => (a.textContent = label), 4000);
    } catch {
      a.textContent = label;
      window.open(a.href, "_blank", "noopener");
    }
  });

  document.addEventListener("langchange", render);
  render();
})();
