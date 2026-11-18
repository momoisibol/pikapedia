// National Pokédex artwork gallery with on-demand PokéAPI filters.
(() => {
  const root = document.getElementById("pokemon-art-gallery");
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const L = (nl, en) => I18N.L(nl, en);
  const API = "https://pokeapi.co/api/v2";
  const PAGE_SIZE = 60;
  const GENERATIONS = [
    ["Kanto", "Kanto"], ["Johto", "Johto"], ["Hoenn", "Hoenn"],
    ["Sinnoh", "Sinnoh"], ["Unova", "Unova"], ["Kalos", "Kalos"],
    ["Alola", "Alola"], ["Galar", "Galar"], ["Paldea", "Paldea"],
  ];
  const state = {
    all: [],
    filtered: [],
    loaded: false,
    loading: false,
    filtering: false,
    error: "",
    query: "",
    type: "",
    generation: "",
    sort: "dex",
    visible: PAGE_SIZE,
    request: 0,
  };
  const typeCache = new Map();
  const generationCache = new Map();

  function idFromUrl(url) {
    return Number(url.replace(/\/+$/, "").split("/").pop());
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`PokéAPI request failed (${response.status})`);
    return response.json();
  }

  function cachedSet(cache, key, load) {
    if (!cache.has(key)) {
      cache.set(key, load().catch((error) => {
        cache.delete(key);
        throw error;
      }));
    }
    return cache.get(key);
  }

  function loadType(type) {
    return cachedSet(typeCache, type, async () => {
      const data = await fetchJson(`${API}/type/${encodeURIComponent(type)}`);
      return new Set(data.pokemon.map((entry) => idFromUrl(entry.pokemon.url)));
    });
  }

  function loadGeneration(generation) {
    return cachedSet(generationCache, generation, async () => {
      const data = await fetchJson(`${API}/generation/${generation}`);
      return new Set(data.pokemon_species.map((entry) => idFromUrl(entry.url)));
    });
  }

  function renderShell() {
    const typeOptions = PK.allTypes().map((type) =>
      `<option value="${PK.esc(type)}"${state.type === type ? " selected" : ""}>${PK.esc(PK.typeName(type))}</option>`
    ).join("");
    const generationOptions = GENERATIONS.map(([nl, en], index) =>
      `<option value="${index + 1}"${state.generation === String(index + 1) ? " selected" : ""}>${L(`Generatie ${index + 1} - ${nl}`, `Generation ${index + 1} - ${en}`)}</option>`
    ).join("");
    root.innerHTML = `
      <header class="pokemon-art-heading">
        <p class="wp-eyebrow">${L("Nationale Pokédex", "National Pokédex")}</p>
        <h2 class="view-title">${L("Pokémon-illustraties", "Pokémon illustrations")}</h2>
      </header>
      <div class="pokemon-art-filters">
        <label>${L("Zoeken", "Search")}
          <input id="pokemon-art-search" type="search" value="${PK.esc(state.query)}" placeholder="${L("Naam of Pokédexnummer", "Name or Pokédex number")}" autocomplete="off">
        </label>
        <label>${L("Type", "Type")}
          <select id="pokemon-art-type"><option value="">${L("Alle types", "All types")}</option>${typeOptions}</select>
        </label>
        <label>${L("Generatie", "Generation")}
          <select id="pokemon-art-generation"><option value="">${L("Alle generaties", "All generations")}</option>${generationOptions}</select>
        </label>
        <label>${L("Volgorde", "Sort")}
          <select id="pokemon-art-sort">
            <option value="dex"${state.sort === "dex" ? " selected" : ""}>${L("Pokédexnummer", "Pokédex number")}</option>
            <option value="name"${state.sort === "name" ? " selected" : ""}>${L("Naam (A-Z)", "Name (A-Z)")}</option>
          </select>
        </label>
        <button id="pokemon-art-reset" type="button" class="wt-chip">${L("Filters wissen", "Clear filters")}</button>
      </div>
      <p id="pokemon-art-status" class="pokemon-art-status" role="status" aria-live="polite"></p>
      <button id="pokemon-art-retry" type="button" class="wt-chip" hidden>${L("Opnieuw proberen", "Try again")}</button>
      <div id="pokemon-art-grid" class="pokemon-art-grid"></div>
      <button id="pokemon-art-more" type="button" class="big-btn more-btn" hidden>${L("Meer laden", "Load more")}</button>`;
    renderResults();
  }

  function renderResults() {
    const status = document.getElementById("pokemon-art-status");
    const grid = document.getElementById("pokemon-art-grid");
    const more = document.getElementById("pokemon-art-more");
    const retry = document.getElementById("pokemon-art-retry");
    if (!status || !grid || !more || !retry) return;
    retry.hidden = !state.error;
    if (state.error) {
      status.textContent = state.error;
      grid.innerHTML = "";
      more.hidden = true;
      return;
    }
    if (!state.loaded) {
      status.textContent = state.loading
        ? L("Pokédex laden...", "Loading Pokédex...")
        : L("Open deze tab om de Pokédex te laden.", "Open this tab to load the Pokédex.");
      grid.innerHTML = "";
      more.hidden = true;
      return;
    }
    if (state.filtering) {
      status.textContent = L("Filters toepassen...", "Applying filters...");
      grid.innerHTML = "";
      more.hidden = true;
      return;
    }

    const shown = Math.min(state.visible, state.filtered.length);
    status.textContent = L(
      `Toont ${shown} van ${state.filtered.length} Pokémon (${state.all.length} in de Nationale Pokédex).`,
      `Showing ${shown} of ${state.filtered.length} Pokémon (${state.all.length} in the National Pokédex).`
    );
    if (state.filtered.length === 0) {
      grid.innerHTML = `<p class="pokemon-art-empty">${L("Geen Pokémon gevonden met deze filters.", "No Pokémon match these filters.")}</p>`;
    } else {
      grid.innerHTML = state.filtered.slice(0, shown).map((pokemon) => {
        const paddedId = String(pokemon.id).padStart(4, "0");
        const name = PK.pretty(pokemon.name);
        return `
          <article class="pokemon-art-card">
            <a class="pokemon-art-image-link" href="${PK.ART(pokemon.id)}" data-pokemon-art-id="${pokemon.id}" aria-label="${PK.esc(L(`Open illustratie van ${name}`, `Open ${name} artwork`))}">
              <img class="pokemon-art-image" loading="lazy" decoding="async" data-pokemon-id="${pokemon.id}" alt="${PK.esc(name)}" src="${PK.ART(pokemon.id)}">
            </a>
            <div class="pokemon-art-card-copy"><span>#${paddedId}</span><h3>${PK.esc(name)}</h3></div>
          </article>`;
      }).join("");
    }
    more.hidden = shown >= state.filtered.length;
  }

  function openArtPreview(pokemon) {
    const name = PK.pretty(pokemon.name);
    modalBody.innerHTML = `
      <section class="pokemon-art-detail">
        <h2>${PK.esc(name)} <span>#${String(pokemon.id).padStart(4, "0")}</span></h2>
        <div class="pokemon-art-detail-preview">
          <img src="${PK.ART(pokemon.id)}" alt="${PK.esc(name)}">
        </div>
        <button type="button" class="big-btn" data-pokemon-art-download="${pokemon.id}">${L("Download transparante PNG", "Download transparent PNG")}</button>
        <p class="pokemon-art-download-status" role="status" aria-live="polite">${L("De achtergrond is transparant; het schaakbord laat dat zien.", "The background is transparent; the checkerboard shows it.")}</p>
      </section>`;
    modal.hidden = false;
    document.getElementById("close").focus();
  }

  async function applyFilters() {
    if (!state.loaded) return loadDex();
    const request = ++state.request;
    state.error = "";
    state.filtering = true;
    renderResults();
    try {
      const [typeIds, generationIds] = await Promise.all([
        state.type ? loadType(state.type) : null,
        state.generation ? loadGeneration(state.generation) : null,
      ]);
      if (request !== state.request) return;
      const query = state.query.trim().toLowerCase().replace(/\s+/g, "-");
      const numberQuery = /^#?\d+$/.test(query) ? Number(query.replace(/^#/, "")) : null;
      state.filtered = state.all.filter((pokemon) =>
        (!query || pokemon.name.includes(query) || pokemon.id === numberQuery) &&
        (!typeIds || typeIds.has(pokemon.id)) &&
        (!generationIds || generationIds.has(pokemon.id))
      );
      if (state.sort === "name") state.filtered.sort((a, b) => a.name.localeCompare(b.name));
      else state.filtered.sort((a, b) => a.id - b.id);
      state.visible = PAGE_SIZE;
      state.filtering = false;
      renderResults();
    } catch (error) {
      if (request !== state.request) return;
      state.filtering = false;
      state.error = L(
        `De filtergegevens konden niet worden geladen (${error.message}). Controleer je verbinding en probeer opnieuw.`,
        `Could not load filter data (${error.message}). Check your connection and try again.`
      );
      renderResults();
    }
  }

  async function loadDex() {
    if (state.loaded) return applyFilters();
    if (state.loading) return;
    state.loading = true;
    state.error = "";
    renderResults();
    try {
      const data = await fetchJson(`${API}/pokemon-species?limit=2000`);
      state.all = data.results
        .map((entry) => ({ id: idFromUrl(entry.url), name: entry.name }))
        .filter((pokemon) => pokemon.id > 0)
        .sort((a, b) => a.id - b.id);
      state.loaded = true;
      state.loading = false;
      await applyFilters();
    } catch (error) {
      state.loading = false;
      state.error = L(
        `De Nationale Pokédex kon niet worden geladen (${error.message}). Controleer je verbinding en probeer opnieuw.`,
        `Could not load the National Pokédex (${error.message}). Check your connection and try again.`
      );
      renderResults();
    }
  }

  root.addEventListener("input", (event) => {
    if (event.target.id !== "pokemon-art-search") return;
    state.query = event.target.value;
    applyFilters();
  });
  root.addEventListener("change", (event) => {
    if (event.target.id === "pokemon-art-type") state.type = event.target.value;
    else if (event.target.id === "pokemon-art-generation") state.generation = event.target.value;
    else if (event.target.id === "pokemon-art-sort") state.sort = event.target.value;
    else return;
    applyFilters();
  });
  root.addEventListener("click", (event) => {
    const artLink = event.target.closest("[data-pokemon-art-id]");
    if (artLink) {
      event.preventDefault();
      const pokemon = state.all.find((entry) => entry.id === Number(artLink.dataset.pokemonArtId));
      if (pokemon) openArtPreview(pokemon);
    } else if (event.target.closest("#pokemon-art-more")) {
      state.visible += PAGE_SIZE;
      renderResults();
    } else if (event.target.closest("#pokemon-art-reset")) {
      state.query = "";
      state.type = "";
      state.generation = "";
      state.sort = "dex";
      renderShell();
      applyFilters();
    } else if (event.target.closest("#pokemon-art-retry")) {
      state.error = "";
      if (state.loaded) applyFilters();
      else loadDex();
    }
  });
  modalBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-pokemon-art-download]");
    if (!button) return;
    const pokemon = state.all.find((entry) => entry.id === Number(button.dataset.pokemonArtDownload));
    if (!pokemon) return;
    const status = modalBody.querySelector(".pokemon-art-download-status");
    button.disabled = true;
    status.textContent = L("PNG downloaden...", "Downloading PNG...");
    try {
      const response = await fetch(PK.ART(pokemon.id));
      if (!response.ok) throw new Error(`Image request failed (${response.status})`);
      const imageUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${pokemon.name}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      status.textContent = L("De transparante PNG is gedownload.", "The transparent PNG has been downloaded.");
    } catch (error) {
      status.textContent = L(
        `Download mislukt (${error.message}). Probeer het opnieuw.`,
        `Download failed (${error.message}). Please try again.`
      );
    } finally {
      button.disabled = false;
    }
  });
  root.addEventListener("error", (event) => {
    const image = event.target;
    if (!image.matches(".pokemon-art-image")) return;
    if (image.dataset.fallback) {
      image.hidden = true;
      return;
    }
    image.dataset.fallback = "true";
    image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${image.dataset.pokemonId}.png`;
  }, true);
  document.addEventListener("gallerymodechange", (event) => {
    if (event.detail === "pokemon-illustrations") loadDex();
  });
  document.addEventListener("langchange", () => {
    renderShell();
    if (state.loaded && !state.error) applyFilters();
    else renderResults();
  });

  renderShell();
})();
