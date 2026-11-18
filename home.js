// Startpagina: slideshow en snelkoppelingen.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const ART = PK.ART;

  const SLIDES = [
    { id: 6, name: "Charizard", g: ["#ff512f", "#dd2476", "#3a0ca3"], nl: "Vlam in de lucht", en: "Flames in the sky" },
    { id: 150, name: "Mewtwo", g: ["#5b247a", "#1bcedf", "#0b1a4a"], nl: "De sterkste geest van Kanto", en: "Kanto's mightiest mind" },
    { id: 384, name: "Rayquaza", g: ["#0f9b6c", "#134e5e", "#0a1f2e"], nl: "Heerser van de hemel", en: "Ruler of the skies" },
    { id: 249, name: "Lugia", g: ["#2b5876", "#4e4376", "#14122e"], nl: "Wachter van de zee", en: "Guardian of the seas" },
    { id: 493, name: "Arceus", g: ["#f5af19", "#f12711", "#4a1a73"], nl: "De schepper van alles", en: "The creator of all" },
    { id: 25, name: "Pikachu", g: ["#f7971e", "#ffd200", "#ff512f"], nl: "Het gezicht van Pokémon", en: "The face of Pokémon" },
    { id: 658, name: "Greninja", g: ["#1e3c72", "#2a5298", "#0b1a4a"], nl: "Schaduw van het water", en: "Shadow of the water" },
    { id: 445, name: "Garchomp", g: ["#41295a", "#8e44ff", "#12082b"], nl: "Jager van de grotten", en: "Cave hunter" },
  ];
  let slide = 0;
  let timer = null;
  let featuredPokemon = null;
  let featuredPokemonFailed = false;

  function localDayNumber() {
    const today = new Date();
    return Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
  }

  async function loadFeaturedPokemon() {
    try {
      const dex = await PK.dex();
      const species = Object.entries(dex)
        .map(([name, id]) => ({ name, id }))
        .filter((pokemon) => Number.isInteger(pokemon.id) && pokemon.id > 0)
        .sort((a, b) => a.id - b.id);
      if (!species.length) throw new Error("The Pokémon species list is empty.");

      const day = localDayNumber();
      const selected = species[day % species.length];
      featuredPokemon = {
        id: selected.id,
        name: PK.pretty(selected.name),
        g: SLIDES[day % SLIDES.length].g,
      };
      featuredPokemonFailed = false;
    } catch (error) {
      console.error("Could not load the Pokémon of the day:", error);
      featuredPokemon = null;
      featuredPokemonFailed = true;
    }
    updateFeaturedCard();
  }

  function scheduleFeaturedPokemonRefresh() {
    const now = new Date();
    const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setTimeout(() => {
      loadFeaturedPokemon();
      scheduleFeaturedPokemonRefresh();
    }, nextDay.getTime() - now.getTime());
  }

  function slideHtml(s, i) {
    return `
      <div class="hs${i === slide ? " on" : ""}" style="--g1:${s.g[0]};--g2:${s.g[1]};--g3:${s.g[2]}">
        <div class="hs-ring"></div><div class="hs-ring r2"></div>
        <img class="hs-art" alt="${s.name}" src="${ART(s.id)}" ${i === 0 ? "" : 'loading="lazy"'}>
        <div class="hs-text">
          <small>${L(s.nl, s.en)}</small>
          <h2>${s.name}</h2>
        </div>
      </div>`;
  }

  function liveBg() {
    const r = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
    const stars = Array.from({ length: 70 }, () => `<i class="lv-star" style="left:${r(0, 100)}%;top:${r(0, 100)}%;animation-delay:${r(0, 6)}s;--s:${r(2, 5)}px"></i>`).join("");
    const balls = Array.from({ length: 10 }, () => `<i class="lv-ball" style="left:${r(0, 95)}%;top:${r(0, 97)}%;--s:${r(28, 90)}px;animation-duration:${r(18, 38)}s;animation-delay:-${r(0, 30)}s"></i>`).join("");
    const ids = [25, 133, 39, 54, 143, 94, 150, 249, 384, 448, 658, 700];
    const mons = ids.map((id) => `<img class="lv-mon" alt="" loading="lazy" src="${ART(id)}" style="left:${r(0, 90)}%;top:${r(0, 97)}%;--s:${r(90, 170)}px;animation-duration:${r(30, 55)}s;animation-delay:-${r(0, 50)}s">`).join("");
    return stars + balls + mons;
  }

  function featuredCardHtml() {
    return featuredPokemon
      ? `<button id="daily-featured" class="home-pick home-pick-feature" data-go="pokedex" style="--g1:${featuredPokemon.g[0]};--g2:${featuredPokemon.g[1]}">
          <span class="home-pick-copy">
            <small>${L("Pokémon van de dag · #", "Pokémon of the day · #")}${featuredPokemon.id}</small>
            <b>${PK.esc(featuredPokemon.name)}</b>
            <span>${L("Bekijk de Pokédex voor stats, types en evoluties.", "Explore its Pokédex data, stats, types, and evolutions.")}</span>
            <em>${L("Duik in de Pokédex →", "Explore the Pokédex →")}</em>
          </span>
          <img src="${ART(featuredPokemon.id)}" alt="" loading="lazy">
        </button>`
      : `<button id="daily-featured" class="home-pick home-pick-feature" data-go="pokedex">
          <span class="home-pick-copy">
            <small>${L("Pokémon van de dag", "Pokémon of the day")}</small>
            <b>${featuredPokemonFailed ? L("Niet beschikbaar", "Unavailable") : L("Wordt geladen...", "Loading...")}</b>
            <span>${featuredPokemonFailed ? L("De Pokémonlijst kon niet worden geladen.", "The Pokémon list could not be loaded.") : L("De Pokémonlijst wordt opgehaald.", "Loading the Pokémon list.")}</span>
          </span>
        </button>`;
  }

  function updateFeaturedCard() {
    const card = $("daily-featured");
    if (card) card.outerHTML = featuredCardHtml();
  }

  function render() {
    const go = (v, nl, en, d1, d2) => `
      <button class="home-feat" data-go="${v}"><b>${L(nl, en)}</b><span>${L(d1, d2)}</span></button>`;
    $("view-home").innerHTML = `
      <div class="home-live" aria-hidden="true">${liveBg()}</div>
      <section class="home-hero">
        <div class="hs-wrap">${SLIDES.map(slideHtml).join("")}</div>
        <div class="home-hero-text">
          <a class="home-contact-link" href="contact.html">${L("Contact", "Contact")}</a>
          <h1><span class="ball"></span> ${L("Welkom in de wereld van Pokémon", "Welcome to the world of Pokémon")}</h1>
          <p>${L("Pokédex, walkthroughs, routes, Elite Four, kaartwaarden en meer – alles voor trainers op één plek.", "Pokédex, walkthroughs, routes, Elite Four, card values and more – everything for trainers in one place.")}</p>
          <div class="home-cta">
            <button class="big-btn" data-go="pokedex">${L("Open de Pokédex", "Open the Pokédex")}</button>
            <button class="big-btn secondary" data-go="walkthrough">${L("Bekijk walkthroughs", "Browse walkthroughs")}</button>
          </div>
        </div>
        <div class="hs-dots">${SLIDES.map((s, i) => `<button class="hs-dot${i === slide ? " on" : ""}" data-slide="${i}" aria-label="${s.name}"></button>`).join("")}</div>
      </section>

      <div class="home-wrap">
        <section class="home-search" aria-labelledby="home-search-title">
          <div class="home-search-copy">
            <h2 id="home-search-title">${L("Zoek alles op de website", "Search the whole website")}</h2>
            <p>${L("Pokémon, games, routes, items, kaarten en meer.", "Pokémon, games, routes, items, cards, and more.")}</p>
          </div>
          <div class="gs home-search-control">
            <label class="gs-field" for="home-gs-q">
              <svg class="gs-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path></svg>
              <input id="home-gs-q" type="search" placeholder="Zoek bijvoorbeeld Pikachu, FireRed of een route..." data-en-placeholder="Try Pikachu, FireRed, or a route..." autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="home-gs-results" aria-expanded="false" aria-label="Zoeken op de hele website" data-en-aria-label="Search the whole website">
              <kbd class="gs-shortcut" aria-hidden="true">↵</kbd>
            </label>
            <div id="home-gs-results" class="gs-results" role="listbox" aria-label="Zoekresultaten" data-en-aria-label="Search results" hidden></div>
          </div>
        </section>

        <section class="home-picks" aria-labelledby="home-picks-title">
          <div class="home-picks-head">
            <div><small>${L("Elke dag iets nieuws", "A fresh pick every day")}</small>
            <h2 id="home-picks-title">${L("Uitgelicht vandaag", "Today's highlights")}</h2></div>
            <p>${L("Een nieuwe Pokémon om te ontdekken, plus ideeën voor je volgende avontuur.", "A new Pokémon to discover, plus ideas for your next adventure.")}</p>
          </div>
          <div class="home-picks-grid">
            ${featuredCardHtml()}
            <button class="home-pick" data-go="game">
              <small>${L("Klaar voor een uitdaging?", "Ready for a challenge?")}</small>
              <b>${L("Wie is deze Pokémon?", "Who's that Pokémon?")}</b>
              <span>${L("Herken het silhouet en bouw je score op.", "Recognize the silhouette and build your score.")}</span>
              <em>${L("Speel de quiz →", "Play the quiz →")}</em>
            </button>
            <button class="home-pick" data-go="walkthrough">
              <small>${L("Op naar je volgende badge", "On to your next badge")}</small>
              <b>${L("Plan je avontuur", "Plan your adventure")}</b>
              <span>${L("Handige stappen, geheimen en tips voor je game.", "Helpful steps, secrets and tips for your game.")}</span>
              <em>${L("Bekijk de walkthroughs →", "Browse walkthroughs →")}</em>
            </button>
          </div>
        </section>

        <h2 class="home-h">${L("Ontdek de site", "Explore the site")}</h2>
        <div class="home-feats">
          ${go("pokedex", "Pokédex", "Pokédex", "Alle Pokémon met stats, types en shiny's.", "Every Pokémon with stats, types and shinies.")}
          ${go("regions", "Regio's & routes", "Regions & routes", "Per route: wat je vangt en welke trainers er staan.", "Per route: what you catch and which trainers wait.")}
          ${go("walkthrough", "Walkthrough", "Walkthrough", "Stappen, geheimen, tips en post-game per game.", "Steps, secrets, tips and post-game for every game.")}
          ${go("characters", "Personages", "Characters", "Ontdek de bekendste trainers, rivalen en verhalen.", "Meet the best-known trainers, rivals, and stories.")}
          ${go("emulator", "GBA-emulator", "GBA emulator", "Bekijk de emulatorpagina en beschikbare downloads.", "Visit the emulator page and available downloads.")}
          ${go("elite", "Elite Four", "Elite Four", "Teams van de Elite Four en kampioenen + tips.", "Elite Four and champion teams + tips.")}
          ${go("cards", "Kaartwaarde", "Card values", "Alle kaarten doorzoeken met actuele prijzen.", "Search every card with live prices.")}
          ${go("album", "Kaartalbum", "Card album", "Bewaar je collectie en zie wat ze waard is.", "Track your collection and see what it is worth.")}
          ${go("game", "Wie is deze Pokémon?", "Who's that Pokémon?", "Raad het silhouet, kies je generaties.", "Guess the silhouette, pick your generations.")}
          ${go("items", "Items", "Items", "Zoek elk item en lees wat het doet.", "Look up any item and read what it does.")}
          ${go("tools", "Trainer-tools", "Trainer tools", "Teambuilder, typetabel en shiny-teller.", "Team builder, type chart and shiny counter.")}
          ${go("news", "Nieuws & agenda", "News & agenda", "Aangekondigde games, kaartsets en evenementen.", "Announced games, card sets and events.")}
        </div>

        ${window.News ? `<h2 class="home-h">${L("Wat komt eraan?", "What's coming?")}</h2>
        <div class="hm-news">${News.upcoming(3).map(News.item).join("")}</div>` : ""}

      </div>`;
  }

  function setSlide(i) {
    slide = (i + SLIDES.length) % SLIDES.length;
    document.querySelectorAll(".hs").forEach((el, k) => el.classList.toggle("on", k === slide));
    document.querySelectorAll(".hs-dot").forEach((el, k) => el.classList.toggle("on", k === slide));
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => { if (NAV.current === "home") setSlide(slide + 1); }, 6000);
  }

  $("view-home").addEventListener("click", (e) => {
    const dot = e.target.closest("[data-slide]");
    if (dot) { setSlide(Number(dot.dataset.slide)); return restart(); }
    const go = e.target.closest("[data-go]");
    if (go) NAV.go(go.dataset.go);
  });

  document.addEventListener("langchange", render);
  render();
  loadFeaturedPokemon();
  scheduleFeaturedPokemonRefresh();
  restart();
})();
