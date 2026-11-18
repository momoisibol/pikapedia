(() => {
  const root = document.getElementById("view-dashboard");
  const L = (nl, en) => I18N.L(nl, en);
  const esc = (value) => PK.esc(String(value));

  function readStored(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn(`Could not read dashboard data "${key}".`, error);
      return fallback;
    }
  }

  function storageKeys() {
    try {
      return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean);
    } catch (error) {
      console.warn("Could not inspect saved dashboard progress.", error);
      return [];
    }
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function progressData() {
    const favorites = asArray(readStored("favorites", [])).length;
    const team = asArray(readStored("pokeBuilder", []));
    const deck = readStored("pokemon-tcg-deck-v1", {});
    const deckCards = asArray(deck?.cards).filter((card) => card && Number(card.qty) > 0);
    const deckCount = deckCards.reduce((sum, card) => sum + Number(card.qty), 0);

    const albumValue = readStored("pokeAlbum", {});
    const album = albumValue && typeof albumValue === "object" && !Array.isArray(albumValue) ? albumValue : {};
    const pricesValue = readStored("pokeAlbumPrices", {});
    const prices = pricesValue && typeof pricesValue === "object" && !Array.isArray(pricesValue) ? pricesValue : {};
    const albumCards = Object.values(album);
    const albumCount = albumCards.reduce((sum, card) => sum + Math.max(0, Number(card?.qty) || 0), 0);
    const albumWorth = albumCards.reduce((sum, card) => {
      const price = Number(prices[card?.id]?.trend);
      return Number.isFinite(price) ? sum + price * Math.max(0, Number(card?.qty) || 0) : sum;
    }, 0);

    const hunts = asArray(readStored("pokeShiny", []));
    const encounters = hunts.reduce((sum, hunt) => sum + Math.max(0, Number(hunt?.count) || 0), 0);
    const walkthroughs = new Map();
    const caught = new Set();
    let checklistCards = 0;
    let checklistSets = 0;

    storageKeys().forEach((key) => {
      if (key.startsWith("wt-done-")) {
        const savedId = key.slice("wt-done-".length);
        const gameId = savedId.startsWith("en-") ? savedId.slice(3) : savedId;
        const steps = asArray(readStored(key, []));
        if (!walkthroughs.has(gameId)) walkthroughs.set(gameId, new Set());
        steps.forEach((step) => walkthroughs.get(gameId).add(step));
      } else if (key.startsWith("caught-checklist-gen-")) {
        asArray(readStored(key, [])).forEach((id) => caught.add(id));
      } else if (key.startsWith("tcg-master-checklist-")) {
        const cards = asArray(readStored(key, []));
        if (cards.length) checklistSets++;
        checklistCards += cards.length;
      }
    });

    const completedSteps = [...walkthroughs.values()].reduce((sum, steps) => sum + steps.size, 0);
    const trackedGuides = [...walkthroughs.values()].filter((steps) => steps.size > 0).length;
    const quizBest = Math.max(0, Number(readStored("quizBest", 0)) || 0);
    const number = (value) => new Intl.NumberFormat(I18N.lang === "en" ? "en-US" : "nl-NL").format(value);
    const currency = new Intl.NumberFormat(I18N.lang === "en" ? "en-US" : "nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(albumWorth);

    return {
      favorites,
      teamCount: team.filter(Boolean).length,
      albumCount,
      albumUnique: albumCards.length,
      albumWorth: currency,
      deckCount,
      deckUnique: deckCards.length,
      huntCount: hunts.length,
      encounters,
      completedSteps,
      trackedGuides,
      caught: caught.size,
      checklistCards,
      checklistSets,
      quizBest,
      number,
    };
  }

  const groups = [
    {
      title: ["Pokémon ontdekken", "Discover Pokémon"],
      description: ["Vind Pokémon, items en inspiratie voor je volgende ontdekking.", "Find Pokémon, items, and inspiration for your next discovery."],
      links: [
        ["Pokédex", "Pokédex", "Zoek Pokémon op naam, type, generatie en meer.", "Find Pokémon by name, type, generation, and more.", "view:pokedex"],
        ["Items", "Items", "Ontdek wat items doen en zoek in de catalogus.", "Learn what items do and search the catalog.", "view:items"],
        ["Regio's & routes", "Regions & routes", "Bekijk gebieden, routes en wat je er kunt vinden.", "Explore areas, routes, and what you can find there.", "view:regions"],
        ["Pokémon-illustraties", "Pokémon illustrations", "Blader op Pokédexnummer door de illustraties.", "Browse Pokémon illustrations by Pokédex number.", "gallery:pokemon-illustrations"],
        ["Kleurplaten", "Coloring pages", "Kies een Pokémon-kleurplaat om creatief aan de slag te gaan.", "Pick a Pokémon coloring page and get creative.", "gallery:coloring"],
        ["Wallpapers", "Wallpapers", "Bekijk Pokémon-wallpapers voor je apparaten.", "Browse Pokémon wallpapers for your devices.", "gallery:wallpapers"],
      ],
    },
    {
      title: ["Avontuur & gevechten", "Adventure & battles"],
      description: ["Bereid je voor op je game, ontdek strategieën en speel een quiz.", "Prepare for your game, explore strategies, and play a quiz."],
      links: [
        ["Walkthroughs", "Walkthroughs", "Volg stap voor stap je game en vink je voortgang af.", "Follow your game step by step and track your progress.", "view:walkthrough"],
        ["Elite Four & Kampioenen", "Elite Four & Champions", "Bekijk teams en tips voor belangrijke gevechten.", "See teams and tips for major battles.", "view:elite"],
        ["Wie is deze Pokémon?", "Who's that Pokémon?", "Herken silhouetten en bouw je highscore op.", "Recognize silhouettes and build your high score.", "view:game"],
        ["Artikelen", "Articles", "Lees gidsen, weetjes en strategie-artikelen.", "Read guides, facts, and strategy articles.", "view:articles"],
        ["Stijlquiz", "Personality quiz", "Beantwoord vragen en ontdek je beste Pokémon-match.", "Answer questions and find your best Pokémon match.", "article:personality-quiz"],
        ["Printbare checklists", "Printable checklists", "Houd je Pokédex en TCG-verzameling bij.", "Track your Pokédex and TCG collection.", "article:printable-checklists"],
      ],
    },
    {
      title: ["Trainer-tools", "Trainer tools"],
      description: ["Bouw teams, analyseer types en plan je volgende jacht.", "Build teams, analyze types, and plan your next hunt."],
      links: [
        ["Teambuilder", "Team builder", "Stel je team samen en bekijk gedeelde zwaktes.", "Build your team and review shared weaknesses.", "tool:team"],
        ["Typetabel", "Type chart", "Controleer snel wat sterk of zwak is tegen een type.", "Quickly check type strengths and weaknesses.", "tool:chart"],
        ["Shiny-teller", "Shiny counter", "Bewaar je shiny-jachten en tel ontmoetingen.", "Save shiny hunts and count encounters.", "tool:shiny"],
        ["Evolutielijn", "Evolution tree", "Zoek evoluties en hun voorwaarden op.", "Look up evolutions and their requirements.", "tool:evolution"],
        ["Aanvallen zoeken", "Move search", "Zoek aanvallen en bekijk hun eigenschappen.", "Search moves and review their details.", "tool:moves"],
        ["TM-compatibiliteit", "TM compatibility", "Controleer welke Pokémon een TM kunnen leren.", "Check which Pokémon can learn a TM.", "tool:tm"],
        ["Vangkans", "Catch calculator", "Schat de kans om een Pokémon te vangen.", "Estimate the chance of catching a Pokémon.", "tool:catch"],
      ],
    },
    {
      title: ["Kaarten & verzamelen", "Cards & collecting"],
      description: ["Beheer je kaarten, ontdek sets en maak een eigen deck.", "Manage your cards, explore sets, and build a deck."],
      links: [
        ["Pokémon TCG-catalogus", "Pokémon TCG catalog", "Doorzoek kaarten en sets met filters.", "Search cards and sets with filters.", "view:tcg"],
        ["Deckmaker", "Deck builder", "Maak een deck en bewaar het op dit apparaat.", "Build a deck and save it on this device.", "tcg:deck"],
        ["Kaartwaarde", "Card values", "Zoek kaarten en bekijk beschikbare prijsinformatie.", "Search cards and view available price information.", "view:cards"],
        ["Kaartalbum", "Card album", "Bewaar je collectie en bekijk de geschatte waarde.", "Save your collection and see its estimated value.", "view:album"],
      ],
    },
    {
      title: ["Meer van Pikapedia", "More from Pikapedia"],
      description: ["Ontdek updates, officiële hulpmiddelen en handige websites.", "Explore updates, official resources, and useful websites."],
      links: [
        ["Nieuws & agenda", "News & agenda", "Bekijk aangekondigde games, sets en evenementen.", "See announced games, sets, and events.", "view:news"],
        ["GBA-emulator", "GBA emulator", "Bekijk informatie over emulatoren en speelopties.", "Find information about emulators and ways to play.", "view:emulator"],
        ["Handige websites", "Useful websites", "Ontdek andere handige Pokémon-bronnen.", "Discover other useful Pokémon resources.", "view:websites"],
        ["Startpagina", "Home", "Bekijk de dagelijkse spotlight en het laatste site-overzicht.", "See the daily spotlight and the latest site overview.", "view:home"],
      ],
    },
  ];

  function statCard(label, value, detail, action, progress) {
    const bar = progress
      ? `<progress value="${Math.min(progress.value, progress.max)}" max="${progress.max}" aria-label="${esc(label)}"></progress>`
      : "";
    return `<button class="td-stat" type="button" data-dashboard-action="${esc(action)}">
      <span class="td-stat-label">${esc(label)}</span>
      <strong>${esc(value)}</strong>
      <small>${esc(detail)}</small>
      ${bar}
    </button>`;
  }

  function render() {
    const data = progressData();
    const groupsHtml = groups.map((group) => `
      <section class="td-group" aria-labelledby="td-group-${groups.indexOf(group)}">
        <div class="td-heading">
          <div><h3 id="td-group-${groups.indexOf(group)}">${L(...group.title)}</h3><p>${L(...group.description)}</p></div>
        </div>
        <div class="td-link-grid">
          ${group.links.map(([nl, en, descriptionNl, descriptionEn, action]) => `
            <button type="button" class="td-link-card" data-dashboard-action="${esc(action)}">
              <span class="td-link-title">${L(nl, en)}</span>
              <span class="td-link-description">${L(descriptionNl, descriptionEn)}</span>
              <span class="td-link-cta">${L("Open onderdeel", "Open section")}</span>
            </button>`).join("")}
        </div>
      </section>`).join("");

    root.innerHTML = `
      <div class="trainer-dashboard">
        <section class="td-hero">
          <div>
            <p class="td-kicker">${L("JOUW TRAINER-HUB", "YOUR TRAINER HUB")}</p>
            <h2>${L("Alles voor jouw Pokémon-avontuur", "Everything for your Pokémon adventure")}</h2>
            <p>${L("Je team, voortgang, verzamelingen en favoriete tools overzichtelijk bij elkaar.", "Your team, progress, collections, and favorite tools in one clear overview.")}</p>
          </div>
          <div class="td-hero-actions">
            <button type="button" class="td-hero-button" data-dashboard-action="tool:team">${L("Bouw je team", "Build your team")}</button>
            <button type="button" class="td-hero-button secondary" data-dashboard-action="view:walkthrough">${L("Ga verder met je avontuur", "Continue your adventure")}</button>
          </div>
        </section>

        <section class="td-panel" aria-labelledby="td-progress-title">
          <div class="td-heading">
            <div><h3 id="td-progress-title">${L("Jouw voortgang", "Your progress")}</h3>
              <p>${L("Opgeslagen in deze browser op dit apparaat.", "Saved in this browser on this device.")}</p></div>
            <span class="td-local-badge">${L("Alleen voor jou", "Private to you")}</span>
          </div>
          <div class="td-stats">
            ${statCard(L("Favoriete Pokémon", "Favorite Pokémon"), data.number(data.favorites), L("Bewaard in je Pokédex", "Saved in your Pokédex"), "view:favorites")}
            ${statCard(L("Pokémon in je team", "Pokémon in your team"), `${data.teamCount}/6`, L("Plekken in de Teambuilder", "Team builder slots"), "tool:team", { value: data.teamCount, max: 6 })}
            ${statCard(L("Kaarten in je album", "Cards in your album"), data.number(data.albumCount), `${data.albumUnique} ${L("uniek", "unique")} · ${data.albumWorth}`, "view:album")}
            ${statCard(L("TCG-deck", "TCG deck"), `${data.deckCount}/60`, `${data.deckUnique} ${L("verschillende kaarten", "unique cards")}`, "tcg:deck", { value: data.deckCount, max: 60 })}
            ${statCard(L("Shiny-ontmoetingen", "Shiny encounters"), data.number(data.encounters), `${data.huntCount} ${L("jachten bijgehouden", "hunts tracked")}`, "tool:shiny")}
            ${statCard(L("Walkthrough-stappen", "Walkthrough steps"), data.number(data.completedSteps), `${data.trackedGuides} ${L("gidsen bijgehouden", "guides tracked")}`, "view:walkthrough")}
            ${statCard(L("Pokédex-checklist", "Pokédex checklist"), `${data.number(data.caught)}/1025`, L("Pokémon afgevinkt", "Pokémon checked off"), "article:printable-checklists", { value: data.caught, max: 1025 })}
            ${statCard(L("TCG-checklists", "TCG checklists"), data.number(data.checklistCards), `${data.checklistSets} ${L("sets met voortgang", "sets with progress")}`, "article:printable-checklists")}
            ${statCard(L("Quiz-highscore", "Quiz high score"), data.number(data.quizBest), L("Wie is deze Pokémon?", "Who's that Pokémon?"), "view:game")}
          </div>
        </section>

        <div class="td-dashboard-heading">
          <h2>${L("Jouw Pokémon-wereld", "Your Pokémon world")}</h2>
          <p>${L("Kies een onderdeel om direct verder te gaan.", "Choose a section to jump right in.")}</p>
        </div>
        <div class="td-groups">${groupsHtml}</div>
        <p class="td-storage-note">${L("Je dashboard gebruikt je bestaande sitegegevens. Er is geen account nodig; gegevens blijven in de browser waarin je ze hebt opgeslagen.", "Your dashboard uses your existing site data. No account is needed; data stays in the browser where you saved it.")}</p>
      </div>`;
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dashboard-action]");
    if (!button) return;
    const [kind, value] = button.dataset.dashboardAction.split(":");

    if (kind === "tool") {
      if (window.Tools?.open) window.Tools.open(value);
      else console.error("Trainer tools are not available.");
    } else if (kind === "gallery") {
      NAV.go("coloring");
      const tab = document.querySelector(`[data-gallery-tab="${value}"]`);
      if (tab) tab.click();
      else console.error(`Gallery tab "${value}" is not available.`);
    } else if (kind === "tcg") {
      NAV.go("tcg");
      const tab = document.querySelector(`[data-tcg-tab="${value}"]`);
      if (tab) tab.click();
      else console.error(`TCG tab "${value}" is not available.`);
    } else if (kind === "article") {
      NAV.go("articles");
      const card = [...document.querySelectorAll("#article-grid .article-card")]
        .find((article) => article.dataset.id === value);
      if (card) card.click();
      else console.error(`Article "${value}" is not available.`);
    } else if (kind === "view") {
      if (value === "favorites") {
        NAV.go("pokedex");
        const toggle = document.getElementById("fav-toggle");
        if (toggle && !toggle.classList.contains("active")) toggle.click();
      } else {
        NAV.go(value);
      }
    }
  });

  document.querySelector('.tab[data-view="dashboard"]').addEventListener("click", render);
  document.addEventListener("langchange", render);
  window.addEventListener("storage", () => {
    if (!root.hidden) render();
  });
  render();
})();
