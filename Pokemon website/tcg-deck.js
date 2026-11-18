// TCG card catalog and local deck builder.
(() => {
  const root = document.getElementById("view-tcg");
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const L = (nl, en) => I18N.L(nl, en);
  const esc = PK.esc;
  const PAGE_SIZE = 48;
  const DECK_KEY = "pokemon-tcg-deck-v1";
  const TYPES = ["Colorless", "Darkness", "Dragon", "Fairy", "Fighting", "Fire", "Grass", "Lightning", "Metal", "Psychic", "Water"];
  const TYPE_LABELS = {
    Colorless: ["Kleurloos", "Colorless"], Darkness: ["Duister", "Darkness"], Dragon: ["Draak", "Dragon"],
    Fairy: ["Fee", "Fairy"], Fighting: ["Vecht", "Fighting"], Fire: ["Vuur", "Fire"],
    Grass: ["Gras", "Grass"], Lightning: ["Bliksem", "Lightning"], Metal: ["Metaal", "Metal"],
    Psychic: ["Psychisch", "Psychic"], Water: ["Water", "Water"],
  };
  const RARITIES = [
    "Common", "Uncommon", "Rare", "Rare Holo", "Rare Holo EX", "Rare Holo GX",
    "Rare Holo V", "Rare Holo VMAX", "Rare Holo VSTAR", "Rare Ultra", "Rare Secret",
    "Rare Rainbow", "Double rare", "Illustration rare", "Special illustration rare",
    "Hyper rare", "ACE SPEC Rare", "Amazing Rare", "Radiant Rare", "Shiny Rare",
    "Shiny Ultra Rare", "Promo",
  ];
  const TRAINER_TYPES = ["Item", "Supporter", "Stadium", "Tool"];
  const state = {
    activeTab: "catalog",
    sets: [],
    setsLoaded: false,
    setsError: "",
    initialized: false,
    initPromise: null,
    focusType: "",
    deck: { name: "Mijn Pokémon TCG-deck", cards: [] },
    feedback: "",
    catalog: newFinder(""),
    finder: newFinder("Pokemon"),
  };
  const detailCache = new Map();
  const pendingAdds = new Set();

  function newFinder(category) {
    return { query: "", set: "", category, type: "", trainerType: "", energyType: "", rarity: "", page: 0, cards: [], more: false, loading: false, searched: false, error: "", token: 0 };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(DECK_KEY) || "null");
    if (saved && Array.isArray(saved.cards)) {
      state.deck.name = typeof saved.name === "string" ? saved.name : state.deck.name;
      state.deck.cards = saved.cards.filter((card) => card && typeof card.id === "string" && typeof card.name === "string" && Number(card.qty) > 0);
    }
  } catch (error) {
    console.error("Could not read the saved Pokémon TCG deck.", error);
    state.feedback = L("Het opgeslagen deck kon niet worden gelezen.", "The saved deck could not be read.");
  }

  const typeLabel = (type) => {
    const labels = TYPE_LABELS[type];
    return labels ? L(labels[0], labels[1]) : type;
  };

  function buildFilter(prefix, filter) {
    const setOptions = state.sets.map((set) =>
      `<option value="${esc(set.id)}"${filter.set === set.id ? " selected" : ""}>${esc(set.name)}${set.cardCount?.total ? ` (${set.cardCount.total})` : ""}</option>`
    ).join("");
    const typeOptions = TYPES.map((type) =>
      `<option value="${esc(type)}"${filter.type === type ? " selected" : ""}>${esc(typeLabel(type))}</option>`
    ).join("");
    const rarityOptions = RARITIES.map((rarity) =>
      `<option value="${esc(rarity)}"${filter.rarity === rarity ? " selected" : ""}>${esc(rarity)}</option>`
    ).join("");
    const trainerOptions = TRAINER_TYPES.map((type) =>
      `<option value="${esc(type)}"${filter.trainerType === type ? " selected" : ""}>${esc(type)}</option>`
    ).join("");
    return `
      <form class="tcg-hub-filters" data-tcg-form="${prefix}">
        <label>${L("Zoek kaart", "Search cards")}
          <input type="search" data-filter="query" value="${esc(filter.query)}" placeholder="${L("Bijv. Pikachu of Professor's Research", "e.g. Pikachu or Professor's Research")}" autocomplete="off">
        </label>
        <label>${L("Set", "Set")}
          <select data-filter="set"><option value="">${L("Alle sets", "All sets")}</option>${setOptions}</select>
        </label>
        <label>${L("Kaartcategorie", "Card category")}
          <select data-filter="category">
            <option value="">${L("Alle categorieën", "All categories")}</option>
            <option value="Pokemon"${filter.category === "Pokemon" ? " selected" : ""}>Pokémon</option>
            <option value="Trainer"${filter.category === "Trainer" ? " selected" : ""}>Trainer</option>
            <option value="Energy"${filter.category === "Energy" ? " selected" : ""}>${L("Energie", "Energy")}</option>
          </select>
        </label>
        <label data-filter-wrap="type" ${filter.category && filter.category !== "Pokemon" ? "hidden" : ""}>${L("Pokémon-type", "Pokémon type")}
          <select data-filter="type"><option value="">${L("Alle types", "All types")}</option>${typeOptions}</select>
        </label>
        <label data-filter-wrap="trainerType" ${filter.category !== "Trainer" ? "hidden" : ""}>${L("Trainerkaart", "Trainer card")}
          <select data-filter="trainerType"><option value="">${L("Alle trainerkaarten", "All trainer cards")}</option>${trainerOptions}</select>
        </label>
        <label data-filter-wrap="energyType" ${filter.category !== "Energy" ? "hidden" : ""}>${L("Energiesoort", "Energy type")}
          <select data-filter="energyType">
            <option value="">${L("Alle energie", "All energy")}</option>
            <option value="Normal"${filter.energyType === "Normal" ? " selected" : ""}>${L("Basisenergie", "Basic energy")}</option>
            <option value="Special"${filter.energyType === "Special" ? " selected" : ""}>${L("Speciale energie", "Special energy")}</option>
          </select>
        </label>
        <label>${L("Zeldzaamheid", "Rarity")}
          <select data-filter="rarity"><option value="">${L("Alle zeldzaamheden", "All rarities")}</option>${rarityOptions}</select>
        </label>
        <div class="tcg-hub-filter-actions">
          <button type="submit" class="big-btn">${L("Zoeken", "Search")}</button>
          <button type="button" class="wt-chip" data-tcg-clear="${prefix}">${L("Wissen", "Clear")}</button>
        </div>
      </form>
      <p class="tcg-note tcg-hub-result-status" id="tcg-${prefix}-status" role="status" aria-live="polite"></p>
      <div class="tcg-hub-card-grid" id="tcg-${prefix}-results"></div>
      <div class="tcg-hub-results-actions">
        <button type="button" class="wt-chip" data-tcg-retry="${prefix}" hidden>${L("Opnieuw proberen", "Try again")}</button>
        <button type="button" class="big-btn more-btn" data-tcg-more="${prefix}" hidden>${L("Meer kaarten laden", "Load more cards")}</button>
      </div>`;
  }

  function renderShell() {
    root.innerHTML = `
      <header class="tcg-hub-heading">
        <p class="wp-eyebrow">Trading Card Game</p>
        <h2 class="view-title">${L("Pokémon TCG", "Pokémon TCG")}</h2>
        <p>${L("Doorzoek sets en kaarten, of bouw en bewaar je eigen deck.", "Browse sets and cards, or build and save your own deck.")}</p>
      </header>
      <div class="wt-chips tcg-hub-tabs" role="tablist" aria-label="${L("TCG-onderdelen", "TCG sections")}">
        <button type="button" class="wt-chip${state.activeTab === "catalog" ? " active" : ""}" role="tab" aria-selected="${state.activeTab === "catalog"}" aria-controls="tcg-hub-catalog" data-tcg-tab="catalog">${L("Kaartencatalogus", "Card catalog")}</button>
        <button type="button" class="wt-chip${state.activeTab === "deck" ? " active" : ""}" role="tab" aria-selected="${state.activeTab === "deck"}" aria-controls="tcg-hub-deck" data-tcg-tab="deck">${L("Deckmaker", "Deck builder")}</button>
      </div>
      <p id="tcg-hub-feedback" class="tcg-hub-feedback" role="status" aria-live="polite">${esc(state.feedback)}</p>
      <section id="tcg-hub-catalog" role="tabpanel" ${state.activeTab !== "catalog" ? "hidden" : ""}>
        <h3 class="tcg-hub-section-title">${L("Alle kaarten doorzoeken", "Browse all cards")}</h3>
        <p class="tcg-note">${state.setsError ? esc(state.setsError) : state.setsLoaded ? L(`${state.sets.length} sets in de database.`, `${state.sets.length} sets in the database.`) : L("Sets laden...", "Loading sets...")}</p>
        ${buildFilter("catalog", state.catalog)}
      </section>
      <section id="tcg-hub-deck" role="tabpanel" ${state.activeTab !== "deck" ? "hidden" : ""}>
        <div class="tcg-deck-heading">
          <label>${L("Decknaam", "Deck name")}<input id="tcg-deck-name" type="text" maxlength="60" value="${esc(state.deck.name)}"></label>
          <div class="tcg-deck-actions">
            <button type="button" class="wt-chip" data-tcg-export>${L("Exporteer decklijst", "Export deck list")}</button>
            <button type="button" class="wt-chip" data-tcg-clear-deck>${L("Deck wissen", "Clear deck")}</button>
          </div>
        </div>
        <div class="tcg-deck-guide">
          <b>${L("Handig startpunt", "A useful starting point")}</b>
          <p>${L("Richtlijn voor een deck van 60 kaarten: ongeveer 15–20 Pokémon, 25–35 Trainerkaarten en 8–15 Energiekaarten. Pas dit aan op je strategie; het is geen vaste regel.", "A starting point for a 60-card deck: around 15–20 Pokémon, 25–35 Trainer cards, and 8–15 Energy cards. Adjust for your strategy; these are not fixed rules.")}</p>
          <p>${L("Supporters helpen vaak met kaarten trekken of zoeken, Items geven snelle acties en Tools of Stadiums ondersteunen je strategie.", "Supporters often help draw or search cards, Items provide quick actions, and Tools or Stadiums support your strategy.")}</p>
          <label>${L("Kies een Pokémon-focus-type", "Choose a Pokémon focus type")}
            <select id="tcg-deck-focus"><option value="">${L("Kies een type", "Choose a type")}</option>${TYPES.map((type) => `<option value="${esc(type)}"${state.focusType === type ? " selected" : ""}>${esc(typeLabel(type))}</option>`).join("")}</select>
          </label>
          <p id="tcg-deck-tip" class="tcg-deck-tip"></p>
          <div class="tcg-deck-tip-actions">
            <button type="button" class="wt-chip" data-tcg-tip="focus">${L("Zoek focus-Pokémon", "Find focus Pokémon")}</button>
            <button type="button" class="wt-chip" data-tcg-tip="Supporter">Supporter</button>
            <button type="button" class="wt-chip" data-tcg-tip="Item">Item</button>
            <button type="button" class="wt-chip" data-tcg-tip="Stadium">Stadium</button>
            <button type="button" class="wt-chip" data-tcg-tip="Energy">${L("Energie", "Energy")}</button>
          </div>
        </div>
        <div class="tcg-deck-builder">
          <section class="tcg-deck-panel">
            <div class="tcg-deck-list-heading">
              <h3>${L("Mijn deck", "My deck")}</h3>
              <b id="tcg-deck-count">0 / 60</b>
            </div>
            <progress id="tcg-deck-progress" max="60" value="0" aria-label="${L("Deckgrootte", "Deck size")}"></progress>
            <div id="tcg-deck-breakdown" class="tcg-deck-breakdown"></div>
            <p class="tcg-deck-rules">${L("Maximaal 4 kaarten met dezelfde naam; basisenergie is uitgezonderd. Totaal: 60 kaarten.", "Maximum 4 cards with the same name; Basic Energy is exempt. Total: 60 cards.")}</p>
            <div id="tcg-deck-list" class="tcg-deck-list"></div>
          </section>
          <section class="tcg-deck-panel tcg-deck-finder">
            <h3>${L("Kaarten zoeken en toevoegen", "Find and add cards")}</h3>
            ${buildFilter("finder", state.finder)}
          </section>
        </div>
      </section>`;
    renderFinder("catalog");
    renderFinder("finder");
    renderDeck();
    renderFocusTip();
  }

  function cardImage(card, quality = "low", setId = "") {
    return TCG.img(card, quality, setId);
  }

  function renderFinder(prefix) {
    const filter = state[prefix];
    const status = document.getElementById(`tcg-${prefix}-status`);
    const results = document.getElementById(`tcg-${prefix}-results`);
    const more = root.querySelector(`[data-tcg-more="${prefix}"]`);
    const retry = root.querySelector(`[data-tcg-retry="${prefix}"]`);
    if (!filter || !status || !results || !more || !retry) return;
    status.textContent = filter.error || (filter.loading
      ? L("Kaarten laden...", "Loading cards...")
      : filter.searched
        ? filter.cards.length
          ? L(`${filter.cards.length}${filter.more ? "+" : ""} kaarten gevonden.`, `${filter.cards.length}${filter.more ? "+" : ""} cards found.`)
          : L("Geen kaarten gevonden.", "No cards found.")
        : L("Zoek of kies filters om kaarten te bekijken.", "Search or choose filters to view cards."));
    retry.hidden = !filter.error;
    more.hidden = filter.loading || !filter.more;
    results.innerHTML = filter.cards.map((card) => {
      const image = cardImage(card, "low", filter.set);
      return `
        <article class="tcg-hub-card">
          <button type="button" class="tcg-hub-card-preview" data-tcg-preview="${esc(card.id)}" aria-label="${esc(L(`Bekijk ${card.name}`, `View ${card.name}`))}">
            ${image ? `<img loading="lazy" alt="" src="${esc(image)}" onerror="this.outerHTML='&lt;span class=&quot;tcg-hub-no-image&quot;&gt;TCG&lt;/span&gt;'">` : `<span class="tcg-hub-no-image">TCG</span>`}
          </button>
          <h4>${esc(card.name)}</h4>
          <small>${esc(card.localId ? `#${card.localId}` : card.id)}</small>
          <button type="button" class="tcg-hub-add" data-tcg-add="${esc(card.id)}">${L("+ Aan deck", "+ Add to deck")}</button>
        </article>`;
    }).join("");
  }

  function renderDeck() {
    const list = document.getElementById("tcg-deck-list");
    if (!list) return;
    const total = state.deck.cards.reduce((sum, card) => sum + card.qty, 0);
    const countBy = (category) => state.deck.cards.filter((card) => card.category === category).reduce((sum, card) => sum + card.qty, 0);
    document.getElementById("tcg-deck-count").textContent = `${total} / 60`;
    document.getElementById("tcg-deck-progress").value = Math.min(total, 60);
    document.getElementById("tcg-deck-breakdown").innerHTML = `
      <span>${L("Pokémon", "Pokémon")} <b>${countBy("Pokemon")}</b></span>
      <span>${L("Trainer", "Trainer")} <b>${countBy("Trainer")}</b></span>
      <span>${L("Energie", "Energy")} <b>${countBy("Energy")}</b></span>`;
    if (!state.deck.cards.length) {
      list.innerHTML = `<p class="tcg-note">${L("Je deck is nog leeg. Zoek kaarten en voeg ze toe.", "Your deck is empty. Find cards and add them.")}</p>`;
      return;
    }
    const order = { Pokemon: 0, Trainer: 1, Energy: 2 };
    const cards = state.deck.cards.slice().sort((a, b) => (order[a.category] ?? 3) - (order[b.category] ?? 3) || a.name.localeCompare(b.name));
    list.innerHTML = cards.map((card) => {
      const image = cardImage(card);
      return `
        <article class="tcg-deck-card">
          ${image ? `<img loading="lazy" alt="" src="${esc(image)}">` : `<span class="tcg-hub-no-image">TCG</span>`}
          <div class="tcg-deck-card-info"><b>${esc(card.name)}</b><small>${esc(card.category || "")}${card.types?.length ? ` · ${esc(card.types.join("/"))}` : ""}${card.trainerType ? ` · ${esc(card.trainerType)}` : ""}</small></div>
          <div class="tcg-deck-qty"><button type="button" data-tcg-qty="${esc(card.id)}" data-delta="-1" aria-label="${L("Een kaart verwijderen", "Remove one card")}">−</button><span>${card.qty}</span><button type="button" data-tcg-qty="${esc(card.id)}" data-delta="1" aria-label="${L("Een kaart toevoegen", "Add one card")}">+</button></div>
        </article>`;
    }).join("");
  }

  function renderFocusTip() {
    const tip = document.getElementById("tcg-deck-tip");
    if (!tip) return;
    tip.textContent = state.focusType
      ? L(`Focus je Pokémon-lijn op ${typeLabel(state.focusType)} en kies energie die daarbij past. Bekijk ook welke Trainerkaarten je Pokémon helpen opzetten.`, `Focus your Pokémon line on ${typeLabel(state.focusType)} and choose matching Energy. Also look for Trainer cards that help set up your Pokémon.`)
      : L("Kies een focus-type en zoek daarna passende Pokémon. Je kunt daarnaast Supporters, Items, Tools, Stadiums en energie apart selecteren.", "Choose a focus type to find matching Pokémon. You can also search Supporters, Items, Tools, Stadiums, and Energy separately.");
  }

  function setFeedback(message) {
    state.feedback = message;
    const feedback = document.getElementById("tcg-hub-feedback");
    if (feedback) feedback.textContent = message;
  }

  function syncFilterVisibility(prefix) {
    const filter = state[prefix];
    const form = root.querySelector(`[data-tcg-form="${prefix}"]`);
    if (!filter || !form) return;
    const type = form.querySelector('[data-filter-wrap="type"]');
    const trainer = form.querySelector('[data-filter-wrap="trainerType"]');
    const energy = form.querySelector('[data-filter-wrap="energyType"]');
    type.hidden = Boolean(filter.category && filter.category !== "Pokemon");
    trainer.hidden = filter.category !== "Trainer";
    energy.hidden = filter.category !== "Energy";
  }

  function syncFilterForm(prefix) {
    const filter = state[prefix];
    const form = root.querySelector(`[data-tcg-form="${prefix}"]`);
    if (!filter || !form) return;
    form.querySelectorAll("[data-filter]").forEach((input) => {
      input.value = filter[input.dataset.filter] || "";
    });
    syncFilterVisibility(prefix);
  }

  function queryPath(filter, page) {
    const params = [`pagination:page=${page}`, `pagination:itemsPerPage=${PAGE_SIZE}`];
    if (filter.query.trim()) params.push(`name=${encodeURIComponent(filter.query.trim())}`);
    if (filter.set) params.push(`set.id=${encodeURIComponent(filter.set)}`);
    if (filter.category) params.push(`category=${encodeURIComponent(filter.category)}`);
    if (filter.type) params.push(`types=${encodeURIComponent(filter.type)}`);
    if (filter.category === "Trainer" && filter.trainerType) params.push(`trainerType=${encodeURIComponent(filter.trainerType)}`);
    if (filter.category === "Energy" && filter.energyType) params.push(`energyType=${encodeURIComponent(filter.energyType)}`);
    if (filter.rarity) params.push(`rarity=${encodeURIComponent(filter.rarity)}`);
    return `/cards?${params.join("&")}`;
  }

  async function searchCards(prefix, append) {
    const filter = state[prefix];
    if (!filter) return;
    const token = ++filter.token;
    const page = append ? filter.page + 1 : 1;
    if (!append) {
      filter.cards = [];
      filter.page = 0;
      filter.more = false;
    }
    filter.error = "";
    filter.loading = true;
    renderFinder(prefix);
    try {
      const cards = await TCG.getJSON(queryPath(filter, page));
      if (token !== filter.token) return;
      if (!Array.isArray(cards)) throw new Error("Unexpected card search response");
      filter.cards = append ? filter.cards.concat(cards) : cards;
      filter.page = page;
      filter.more = cards.length === PAGE_SIZE;
      filter.loading = false;
      filter.searched = true;
      renderFinder(prefix);
    } catch (error) {
      if (token !== filter.token) return;
      filter.loading = false;
      filter.searched = true;
      filter.error = L(`Kaarten konden niet worden geladen (${error.message}). Probeer het opnieuw.`, `Cards could not be loaded (${error.message}). Please try again.`);
      renderFinder(prefix);
    }
  }

  async function loadSets() {
    try {
      const sets = await TCG.getJSON("/sets");
      if (!Array.isArray(sets)) throw new Error("Unexpected set list response");
      state.sets = sets;
      state.setsLoaded = true;
      state.setsError = "";
    } catch (error) {
      console.error("Could not load TCG sets.", error);
      state.setsError = L(`De setlijst is niet beschikbaar (${error.message}).`, `The set list is unavailable (${error.message}).`);
    }
  }

  function init() {
    if (state.initPromise) return state.initPromise;
    state.initialized = true;
    state.initPromise = (async () => {
      await loadSets();
      renderShell();
      await searchCards("catalog", false);
    })();
    return state.initPromise;
  }

  async function getCard(id) {
    if (!detailCache.has(id)) {
      detailCache.set(id, TCG.getJSON(`/cards/${id}`).catch((error) => {
        detailCache.delete(id);
        throw error;
      }));
    }
    return detailCache.get(id);
  }

  function basicEnergy(card) {
    return card.category === "Energy" && card.energyType === "Normal";
  }

  function saveDeck() {
    try {
      localStorage.setItem(DECK_KEY, JSON.stringify(state.deck));
      setFeedback(L("Deck automatisch opgeslagen op dit apparaat.", "Deck saved on this device."));
    } catch (error) {
      console.error("Could not save the Pokémon TCG deck.", error);
      setFeedback(L(`Het deck kon niet worden opgeslagen (${error.message}).`, `The deck could not be saved (${error.message}).`));
    }
  }

  function addDetail(card) {
    const total = state.deck.cards.reduce((sum, entry) => sum + entry.qty, 0);
    if (total >= 60) {
      setFeedback(L("Een deck mag maximaal 60 kaarten bevatten.", "A deck can contain no more than 60 cards."));
      return;
    }
    const sameNameCount = state.deck.cards
      .filter((entry) => entry.name.toLowerCase() === card.name.toLowerCase())
      .reduce((sum, entry) => sum + entry.qty, 0);
    if (!basicEnergy(card) && sameNameCount >= 4) {
      setFeedback(L("Je mag maximaal 4 kaarten met dezelfde naam gebruiken.", "You can use at most 4 cards with the same name."));
      return;
    }
    const existing = state.deck.cards.find((entry) => entry.id === card.id);
    if (existing) existing.qty++;
    else state.deck.cards.push({
      id: card.id,
      name: card.name,
      image: card.image || "",
      localId: card.localId || "",
      set: card.set || null,
      category: card.category || "",
      types: card.types || [],
      trainerType: card.trainerType || "",
      energyType: card.energyType || "",
      rarity: card.rarity || "",
      qty: 1,
    });
    saveDeck();
    renderDeck();
  }

  async function addToDeck(id) {
    if (pendingAdds.has(id)) return;
    pendingAdds.add(id);
    setFeedback(L("Kaart ophalen...", "Loading card..."));
    try {
      addDetail(await getCard(id));
    } catch (error) {
      console.error("Could not add TCG card to deck.", error);
      setFeedback(L(`Kaart kon niet worden opgehaald (${error.message}).`, `Could not load card (${error.message}).`));
    } finally {
      pendingAdds.delete(id);
    }
  }

  async function previewCard(id) {
    modal.hidden = false;
    modalBody.innerHTML = `<p class="status">${L("Kaart laden...", "Loading card...")}</p>`;
    try {
      const card = await getCard(id);
      const image = cardImage(card, "high");
      const category = card.category === "Pokemon" ? L("Pokémon", "Pokémon") : card.category === "Energy" ? L("Energie", "Energy") : card.category || "";
      modalBody.innerHTML = `
        <div class="tcg-hub-card-detail">
          <div class="tcg-hub-card-detail-image">${image ? `<img src="${esc(image)}" alt="${esc(card.name)}">` : `<span class="tcg-hub-no-image">TCG</span>`}</div>
          <div>
            <h2>${esc(card.name)}</h2>
            <p class="tcg-note">${esc(card.set?.name || "")} · #${esc(card.localId || "")}</p>
            <dl>
              <div><dt>${L("Categorie", "Category")}</dt><dd>${esc(category)}</dd></div>
              ${card.types?.length ? `<div><dt>${L("Type", "Type")}</dt><dd>${esc(card.types.join(" / "))}</dd></div>` : ""}
              ${card.trainerType ? `<div><dt>${L("Trainerkaart", "Trainer card")}</dt><dd>${esc(card.trainerType)}</dd></div>` : ""}
              ${card.energyType ? `<div><dt>${L("Energiesoort", "Energy type")}</dt><dd>${card.energyType === "Normal" ? L("Basisenergie", "Basic energy") : L("Speciale energie", "Special energy")}</dd></div>` : ""}
              ${card.rarity ? `<div><dt>${L("Zeldzaamheid", "Rarity")}</dt><dd>${esc(card.rarity)}</dd></div>` : ""}
            </dl>
            <button type="button" class="big-btn" data-tcg-modal-add="${esc(card.id)}">${L("+ Aan deck toevoegen", "+ Add to deck")}</button>
            <p class="tcg-hub-modal-status" role="status" aria-live="polite"></p>
          </div>
        </div>`;
    } catch (error) {
      console.error("Could not load TCG card details.", error);
      modalBody.innerHTML = `<p class="status">${L(`Kaartdetails konden niet worden geladen (${error.message}).`, `Card details could not be loaded (${error.message}).`)}</p>`;
    }
  }

  function renderDeckName() {
    const input = document.getElementById("tcg-deck-name");
    if (input) input.value = state.deck.name;
  }

  function activateTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll("[data-tcg-tab]").forEach((button) => {
      const active = button.dataset.tcgTab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.getElementById("tcg-hub-catalog").hidden = tab !== "catalog";
    document.getElementById("tcg-hub-deck").hidden = tab !== "deck";
    if (tab === "deck" && state.initialized && !state.finder.searched) searchCards("finder", false);
  }

  function searchTip(value) {
    const filter = state.finder;
    if (value === "focus") {
      filter.category = "Pokemon";
      filter.type = state.focusType;
      filter.trainerType = "";
      filter.energyType = "";
    } else if (value === "Energy") {
      filter.category = "Energy";
      filter.type = "";
      filter.trainerType = "";
      filter.energyType = "";
    } else {
      filter.category = "Trainer";
      filter.type = "";
      filter.trainerType = value;
      filter.energyType = "";
    }
    filter.query = "";
    filter.set = "";
    filter.rarity = "";
    syncFilterForm("finder");
    searchCards("finder", false);
  }

  function exportDeck() {
    const lines = [state.deck.name, `${state.deck.cards.reduce((sum, card) => sum + card.qty, 0)} / 60 cards`, ""];
    ["Pokemon", "Trainer", "Energy"].forEach((category) => {
      const cards = state.deck.cards.filter((card) => card.category === category);
      if (!cards.length) return;
      lines.push(category === "Pokemon" ? "Pokemon" : category, ...cards.map((card) => `${card.qty} ${card.name}${card.set?.name ? ` (${card.set.name})` : ""}`), "");
    });
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(state.deck.name || "pokemon-tcg-deck").trim().replace(/[^\w-]+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback(L("Decklijst geëxporteerd.", "Deck list exported."));
  }

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-tcg-form]");
    if (!form) return;
    event.preventDefault();
    searchCards(form.dataset.tcgForm, false);
  });
  root.addEventListener("change", (event) => {
    if (event.target.id === "tcg-deck-focus") {
      state.focusType = event.target.value;
      renderFocusTip();
      return;
    }
    const form = event.target.closest("[data-tcg-form]");
    if (!form) return;
    const filter = state[form.dataset.tcgForm];
    const field = event.target.dataset.filter;
    if (!filter || !field) return;
    filter[field] = event.target.value;
    if (field === "category") {
      filter.type = "";
      filter.trainerType = "";
      filter.energyType = "";
      syncFilterForm(form.dataset.tcgForm);
    }
  });
  root.addEventListener("input", (event) => {
    if (event.target.id === "tcg-deck-name") {
      state.deck.name = event.target.value;
      saveDeck();
      return;
    }
    const form = event.target.closest("[data-tcg-form]");
    if (form && event.target.dataset.filter === "query") state[form.dataset.tcgForm].query = event.target.value;
  });
  root.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tcg-tab]");
    if (tab) { activateTab(tab.dataset.tcgTab); return; }
    const add = event.target.closest("[data-tcg-add]");
    if (add) { addToDeck(add.dataset.tcgAdd); return; }
    const preview = event.target.closest("[data-tcg-preview]");
    if (preview) { previewCard(preview.dataset.tcgPreview); return; }
    const more = event.target.closest("[data-tcg-more]");
    if (more) { searchCards(more.dataset.tcgMore, true); return; }
    const retry = event.target.closest("[data-tcg-retry]");
    if (retry) { searchCards(retry.dataset.tcgRetry, false); return; }
    const clear = event.target.closest("[data-tcg-clear]");
    if (clear) {
      const filter = state[clear.dataset.tcgClear];
      const fresh = newFinder(clear.dataset.tcgClear === "finder" ? "Pokemon" : "");
      const requestToken = filter.token;
      Object.assign(filter, fresh);
      filter.token = requestToken;
      syncFilterForm(clear.dataset.tcgClear);
      searchCards(clear.dataset.tcgClear, false);
      return;
    }
    const tip = event.target.closest("[data-tcg-tip]");
    if (tip) { searchTip(tip.dataset.tcgTip); return; }
    const quantity = event.target.closest("[data-tcg-qty]");
    if (quantity) {
      const card = state.deck.cards.find((entry) => entry.id === quantity.dataset.tcgQty);
      if (!card) return;
      if (quantity.dataset.delta === "-1") {
        card.qty--;
        if (card.qty <= 0) state.deck.cards = state.deck.cards.filter((entry) => entry.id !== card.id);
        saveDeck();
        renderDeck();
      } else {
        addDetail(card);
      }
      return;
    }
    if (event.target.closest("[data-tcg-clear-deck]")) {
      if (!state.deck.cards.length || !confirm(L("Je deck helemaal wissen?", "Clear the entire deck?"))) return;
      state.deck.cards = [];
      saveDeck();
      renderDeck();
      return;
    }
    if (event.target.closest("[data-tcg-export]")) exportDeck();
  });
  modalBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tcg-modal-add]");
    if (!button) return;
    const status = modalBody.querySelector(".tcg-hub-modal-status");
    button.disabled = true;
    getCard(button.dataset.tcgModalAdd)
      .then((card) => {
        addDetail(card);
        if (status) status.textContent = state.feedback;
      })
      .catch((error) => {
        console.error("Could not add TCG card to deck.", error);
        if (status) status.textContent = L(`Toevoegen mislukt (${error.message}).`, `Could not add card (${error.message}).`);
      })
      .finally(() => { button.disabled = false; });
  });

  document.querySelector('.tab[data-view="tcg"]').addEventListener("click", init);
  document.addEventListener("langchange", () => {
    renderShell();
    if (state.initialized && !state.catalog.searched) searchCards("catalog", false);
    if (state.activeTab === "deck" && state.initialized && !state.finder.searched) searchCards("finder", false);
  });

  renderShell();
})();
