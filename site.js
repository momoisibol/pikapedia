// Donkere modus, zoekbalk voor de hele site en PWA-registratie.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const esc = PK.esc;

  // ---------- Donkere modus ----------
  const root = document.documentElement;
  const applyTheme = (t) => {
    root.dataset.theme = t;
    const b = $("theme-toggle");
    if (b) {
      b.textContent = t === "dark" ? L("Licht", "Light") : L("Donker", "Dark");
      b.title = t === "dark" ? L("Lichte modus", "Light mode") : L("Donkere modus", "Dark mode");
      b.setAttribute("aria-label", b.title);
    }
  };
  $("theme-toggle")?.addEventListener("click", () => {
    const t = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", t);
    applyTheme(t);
  });
  applyTheme(root.dataset.theme || "light");
  document.addEventListener("langchange", () => applyTheme(root.dataset.theme || "light"));

  // ---------- Zoeken ----------
  const searches = {
    "gs-q": { boxId: "gs-results", hits: [], activeHit: -1, searchRequest: 0 },
    "home-gs-q": { boxId: "home-gs-results", hits: [], activeHit: -1, searchRequest: 0 },
  };
  const TOOLS = [
    ["team", "Teambuilder", "Team builder"],
    ["chart", "Typetabel", "Type chart"],
    ["shiny", "Shiny-teller", "Shiny counter"],
    ["evolution", "Evolutielijn", "Evolution tree"],
    ["moves", "Aanvallen zoeken", "Move search"],
    ["tm", "TM-compatibiliteit", "TM compatibility"],
    ["catch", "Vangkans", "Catch calculator"],
  ];
  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const matchRank = (term, ...values) => {
    const text = values.map(normalize).join(" ");
    if (!text.includes(term)) return Infinity;
    return text === term ? 0 : text.startsWith(term) ? 1 : 2;
  };

  const pages = () => [...document.querySelectorAll(".tab[data-view]")].map((t) => ({ label: t.textContent.trim(), view: t.dataset.view }));

  function search(q) {
    const term = normalize(q);
    if (term.length < 2) return [];
    const out = [];
    const add = (hit, rank = 1) => out.push({ ...hit, rank });
    pages().forEach((page) => {
      const rank = matchRank(term, page.label);
      if (rank !== Infinity) add({ label: page.label, sub: L("Pagina", "Page"), kind: L("Pagina", "Page"), run: () => NAV.go(page.view) }, rank);
    });
    TOOLS.forEach(([id, nl, en]) => {
      const rank = matchRank(term, nl, en);
      if (rank !== Infinity) add({ label: L(nl, en), sub: L("Trainer-tools", "Trainer tools"), kind: L("Tool", "Tool"), run: () => Tools.open(id) }, rank);
    });
    (window.SITE_ARTICLES || []).forEach((a) => {
      const rank = matchRank(term, a.title, a.intro, a.tag);
      if (rank !== Infinity) add({
        label: a.title,
        sub: L("Artikel", "Article"),
        kind: L("Artikel", "Article"),
        run: () => {
          NAV.go("articles");
          [...document.querySelectorAll(".article-card")].find((card) => card.dataset.id === a.id)?.click();
        },
      }, rank);
    });
    const dex = window.__dexNames || {};
    Object.keys(dex).forEach((name) => {
      const rank = matchRank(term, PK.pretty(name), name, dex[name]);
      if (rank !== Infinity) add({
        label: PK.pretty(name),
        sub: `Pokédex #${dex[name]}`,
        kind: "Pokémon",
        image: PK.ART(dex[name]),
        run: () => { NAV.go("pokedex"); if (typeof openDetail === "function") openDetail(dex[name]); },
      }, rank - 0.25);
    });
    (window.WALKTHROUGH_DATA || []).flatMap((group) => group.games || []).forEach((game) => {
      const rank = matchRank(term, game.name, game.platform, game.year);
      if (rank !== Infinity) add({
        label: game.name,
        sub: L("Walkthrough", "Walkthrough"),
        kind: L("Game", "Game"),
        run: () => {
          NAV.go("walkthrough");
          [...document.querySelectorAll("#wt-groups .wt-card[data-id]")].find((card) => card.dataset.id === game.id)?.click();
        },
      }, rank);
    });
    const cardsRank = matchRank(term, "kaarten kaartwaarde cards");
    add({
      label: L(`Kaarten zoeken: “${q.trim()}”`, `Search cards: “${q.trim()}”`),
      sub: L("Kaartwaarde", "Card values"),
      kind: L("Kaarten", "Cards"),
      run: () => {
        NAV.go("cards");
        const field = $("tcg-q");
        if (field) { field.value = q.trim(); $("tcg-form")?.requestSubmit(); }
      },
    }, cardsRank === Infinity ? 2.5 : cardsRank);
    return out.sort((a, b) => a.rank - b.rank).slice(0, 9);
  }

  function render(searchId, query, { loading = false, partial = false } = {}) {
    const input = $(searchId);
    const state = searches[searchId];
    const box = $(state.boxId);
    const valid = normalize(query).length >= 2;
    box.hidden = !valid;
    input.setAttribute("aria-expanded", String(valid));
    input.removeAttribute("aria-activedescendant");
    state.activeHit = -1;
    if (!valid) { box.innerHTML = ""; return; }
    const rows = state.hits.map((hit, index) => {
      const art = hit.image
        ? `<span class="gs-hit-art"><img src="${esc(hit.image)}" alt="" loading="lazy"></span>`
        : `<span class="gs-hit-art" aria-hidden="true">${esc(hit.kind.slice(0, 3).toUpperCase())}</span>`;
      return `<button type="button" id="${searchId}-option-${index}" class="gs-hit" data-search-id="${searchId}" data-i="${index}" role="option" aria-selected="false">
        ${art}<span class="gs-hit-copy"><b>${esc(hit.label)}</b><small>${esc(hit.sub)}</small></span>
        <span class="gs-hit-category">${esc(hit.kind)}</span>
      </button>`;
    }).join("");
    const empty = !state.hits.length && !loading
      ? `<div class="gs-empty" role="status">${L("Geen resultaten gevonden. Probeer een andere zoekterm.", "No results found. Try another search term.")}</div>`
      : "";
    const status = loading
      ? `<div class="gs-loading" role="status">${L("Meer resultaten zoeken…", "Searching for more results…")}</div>`
      : partial
        ? `<div class="gs-loading" role="status">${L("Niet alle resultaten konden worden geladen. Controleer je internetverbinding.", "Some results could not be loaded. Check your internet connection.")}</div>`
        : "";
    const footer = state.hits.length
      ? `<div class="gs-footer"><span>${L("Pijltjes om te kiezen", "Use arrows to choose")}</span><span><kbd>Enter</kbd> ${L("openen", "open")} · <kbd>Esc</kbd> ${L("sluiten", "close")}</span></div>`
      : "";
    box.innerHTML = `<div class="gs-heading">${L("Zoekresultaten", "Search results")}</div>${rows}${empty}${status}${footer}`;
  }
  function show(searchId) {
    const input = $(searchId);
    const state = searches[searchId];
    const query = input.value.trim();
    const request = ++state.searchRequest;
    state.hits = search(query);
    const term = normalize(query);
    render(searchId, query, { loading: term.length >= 3 });
    if (normalize(query).length < 3) return;
    const routeTerm = /(?:^| )(route|city|town|island|cave|forest|woods|mount|lake|road|path|canyon)(?: |$)/.test(term);
    const providers = [["items", window.ITEM_SEARCH?.find(query) || Promise.resolve([])]];
    if (routeTerm || state.hits.every((hit) => hit.kind === L("Kaarten", "Cards"))) {
      providers.push(["locations", window.REGION_SEARCH?.find(query) || Promise.resolve([])]);
    }
    Promise.allSettled([
      ...providers.map(([, result]) => result),
    ]).then((results) => {
      if (request !== state.searchRequest || !$(searchId) || $(searchId).value.trim() !== query) return;
      let partial = false;
      results.forEach((result, index) => {
        const provider = providers[index][0];
        if (result.status === "rejected") {
          partial = true;
          console.error(provider === "items" ? "Could not search items:" : "Could not search locations:", result.reason);
          return;
        }
        result.value.forEach((entry) => {
          if (provider === "items") state.hits.push({
            label: entry.label,
            sub: entry.sub,
            kind: L("Item", "Item"),
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${entry.name}.png`,
            rank: matchRank(normalize(query), entry.label, entry.name) - 0.1,
            run: () => window.ITEM_SEARCH.open(entry.name),
          });
          else state.hits.push({
            label: entry.label,
            sub: entry.sub,
            kind: L("Locatie", "Location"),
            rank: matchRank(normalize(query), entry.label, entry.name, entry.region) - 0.15,
            run: () => entry.regionOnly
              ? window.REGION_SEARCH.openRegion(entry.region)
              : window.REGION_SEARCH.open(entry.region, entry.name),
          });
        });
      });
      state.hits.sort((a, b) => a.rank - b.rank);
      state.hits = state.hits.slice(0, 9);
      render(searchId, query, { partial });
    });
  }
  const closeSearch = (searchId, blur = false) => {
    const input = $(searchId);
    const box = $(searches[searchId].boxId);
    box.hidden = true;
    if (input) {
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      if (blur) input.blur();
    }
  };
  const go = (searchId, i) => {
    const state = searches[searchId];
    const input = $(searchId);
    const hit = state.hits[i];
    if (!hit) return;
    closeSearch(searchId);
    input.value = "";
    hit.run();
  };

  PK.dex().then((d) => { window.__dexNames = d; });
  document.addEventListener("input", (e) => {
    if (searches[e.target.id]) show(e.target.id);
  });
  document.addEventListener("keydown", (e) => {
    const searchId = e.target.id;
    if (searches[searchId]) {
      const state = searches[searchId];
      const input = $(searchId);
      const box = $(state.boxId);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!state.hits.length) return;
        e.preventDefault();
        state.activeHit = e.key === "ArrowDown"
          ? (state.activeHit + 1) % state.hits.length
          : (state.activeHit <= 0 ? state.hits.length - 1 : state.activeHit - 1);
        box.querySelectorAll(".gs-hit").forEach((hit, index) => {
          const active = index === state.activeHit;
          hit.classList.toggle("active", active);
          hit.setAttribute("aria-selected", String(active));
        });
        input.setAttribute("aria-activedescendant", `${searchId}-option-${state.activeHit}`);
      } else if (e.key === "Enter") {
        if (state.hits.length) { e.preventDefault(); go(searchId, state.activeHit < 0 ? 0 : state.activeHit); }
      } else if (e.key === "Escape") {
        closeSearch(searchId, true);
      }
      return;
    }
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); $("gs-q").focus(); }
  });
  document.addEventListener("click", (e) => {
    const option = e.target.closest(".gs-hit[data-search-id]");
    if (option) {
      const searchId = option.dataset.searchId;
      go(searchId, Number(option.dataset.i));
      Object.keys(searches).filter((id) => id !== searchId).forEach((id) => closeSearch(id));
      return;
    }
    Object.keys(searches).forEach((searchId) => {
      const owner = $(searchId)?.closest(".gs");
      if (owner && !owner.contains(e.target)) closeSearch(searchId);
    });
  });
  document.addEventListener("langchange", () => {
    Object.keys(searches).forEach((searchId) => {
      if ($(searchId)?.value.trim()) show(searchId);
    });
  });

  // ---------- PWA ----------
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("sw.js").catch((error) => console.error("Service worker registration failed:", error));
  }

  const networkStatus = $("network-status");
  const updateNetworkStatus = () => {
    if (!networkStatus) return;
    networkStatus.hidden = navigator.onLine;
    networkStatus.textContent = navigator.onLine
      ? ""
      : L("Je bent offline. De site kan eerder opgeslagen pagina's en gegevens tonen; nieuwe gegevens zijn niet beschikbaar.", "You are offline. The site can show previously cached pages and data; new data is unavailable.");
  };
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  updateNetworkStatus();
  document.addEventListener("langchange", updateNetworkStatus);
})();
