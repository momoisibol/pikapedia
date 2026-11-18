const API = "https://pokeapi.co/api/v2";

const TYPE_COLORS = {
  normal: "#a8a77a", fire: "#ee8130", water: "#6390f0", electric: "#f7d02c",
  grass: "#7ac74c", ice: "#96d9d6", fighting: "#c22e28", poison: "#a33ea1",
  ground: "#e2bf65", flying: "#a98ff3", psychic: "#f95587", bug: "#a6b91a",
  rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc", dark: "#705746",
  steel: "#b7b7ce", fairy: "#d685ad",
};
const TYPE_NL = {
  normal: "normaal", fire: "vuur", water: "water", electric: "elektrisch",
  grass: "gras", ice: "ijs", fighting: "vechten", poison: "gif",
  ground: "grond", flying: "vliegend", psychic: "psychisch", bug: "insect",
  rock: "gesteente", ghost: "spook", dragon: "draak", dark: "duister",
  steel: "staal", fairy: "fee",
};
const STAT_NL = {
  hp: "HP", attack: "Aanval", defense: "Verdediging",
  "special-attack": "Sp. aanval", "special-defense": "Sp. verd.", speed: "Snelheid",
};
const STAT_EN = {
  hp: "HP", attack: "Attack", defense: "Defense",
  "special-attack": "Sp. Atk", "special-defense": "Sp. Def", speed: "Speed",
};
const VERSION_GROUP_ORDER = [
  "red-blue", "yellow", "gold-silver", "crystal", "ruby-sapphire", "emerald",
  "firered-leafgreen", "diamond-pearl", "platinum", "heartgold-soulsilver",
  "black-white", "black-2-white-2", "x-y", "omega-ruby-alpha-sapphire",
  "sun-moon", "ultra-sun-ultra-moon", "lets-go-pikachu-lets-go-eevee",
  "sword-shield", "brilliant-diamond-and-shining-pearl", "legends-arceus",
  "scarlet-violet",
];
const VERSION_GROUP_NL = {
  "red-blue": "Rood & Blauw", yellow: "Geel", "gold-silver": "Goud & Zilver",
  crystal: "Crystal", "ruby-sapphire": "Ruby & Sapphire", emerald: "Emerald",
  "firered-leafgreen": "FireRed & LeafGreen", "diamond-pearl": "Diamond & Pearl",
  platinum: "Platinum", "heartgold-soulsilver": "HeartGold & SoulSilver",
  "black-white": "Black & White", "black-2-white-2": "Black 2 & White 2",
  "x-y": "X & Y", "omega-ruby-alpha-sapphire": "Omega Ruby & Alpha Sapphire",
  "sun-moon": "Sun & Moon", "ultra-sun-ultra-moon": "Ultra Sun & Ultra Moon",
  "lets-go-pikachu-lets-go-eevee": "Let's Go Pikachu & Eevee",
  "sword-shield": "Sword & Shield",
  "brilliant-diamond-and-shining-pearl": "Brilliant Diamond & Shining Pearl",
  "legends-arceus": "Legends: Arceus", "scarlet-violet": "Scarlet & Violet",
};
const L = (nl, en) => I18N.L(nl, en);
const statName = (n) => (I18N.lang === "nl" ? STAT_NL : STAT_EN)[n] || n;

const $ = (id) => document.getElementById(id);
const grid = $("grid");
const statusEl = $("status");
const searchEl = $("search");
const typeEl = $("type");
const genEl = $("gen");
const bstEl = $("dex-bst");
const evolutionEl = $("dex-evolution");
const favBtn = $("fav-toggle");
const modal = $("modal");
const modalBody = $("modal-body");

const cache = new Map(); // id -> pokemon data
const evolutionCache = new Map(); // evolution-chain URL -> data promise
const speciesCache = new Map();
const evolutionStageCache = new Map();
let list = []; // [{id, name}] of current generation
let favorites = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
let onlyFavs = false;
let typeSet = null; // Set of names for selected type
let renderToken = 0;

const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadTypes() {
  const data = await getJSON(`${API}/type`);
  data.results
    .filter((t) => TYPE_COLORS[t.name])
    .forEach((t) => {
      const o = document.createElement("option");
      o.value = t.name;
      o.textContent = PK.typeName(t.name);
      typeEl.appendChild(o);
    });
}

async function loadGeneration(gen) {
  statusEl.textContent = L("Laden...", "Loading...");
  grid.innerHTML = "";
  try {
    const data = await getJSON(`${API}/generation/${gen}`);
    list = data.pokemon_species
      .map((s) => ({ name: s.name, id: Number(s.url.split("/").filter(Boolean).pop()), speciesUrl: s.url }))
      .sort((a, b) => a.id - b.id);
    render();
    return true;
  } catch (e) {
    statusEl.textContent = L("Kon de Pokémon niet laden. Controleer je internetverbinding.", "Could not load the Pokémon. Check your internet connection.");
    return false;
  }
}

async function loadTypeSet(type) {
  if (!type) { typeSet = null; return; }
  const data = await getJSON(`${API}/type/${type}`);
  typeSet = new Set(
    data.pokemon.map((p) => Number(p.pokemon.url.split("/").filter(Boolean).pop()))
  );
}

async function favoriteItems() {
  const dex = await PK.dex();
  const names = {};
  Object.entries(dex).forEach(([slug, id]) => (names[id] = slug));
  return [...favorites].sort((a, b) => a - b).map((id) => ({ id, name: names[id] || String(id), speciesUrl: `${API}/pokemon-species/${id}` }));
}

function updateFavCount() {
  const el = $("fav-count");
  if (el) el.textContent = favorites.size ? ` (${favorites.size})` : "";
}

async function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  let items = (onlyFavs ? await favoriteItems() : list).filter((p) => {
    if (q && !p.name.includes(q) && String(p.id) !== q) return false;
    if (typeSet && !typeSet.has(p.id)) return false;
    return true;
  });
  const minBst = Number(bstEl.value);
  const evolutionStage = evolutionEl.value;
  if (!minBst && evolutionStage === "all") return items;
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(8, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      if (minBst) {
        const pokemon = await getPokemon(item.id);
        const bst = pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
        if (bst < minBst) continue;
      }
      if (evolutionStage !== "all" && await getEvolutionStage(item) !== evolutionStage) continue;
      results.push(item);
    }
  });
  await Promise.all(workers);
  return results.sort((a, b) => a.id - b.id);
}

async function getPokemon(id) {
  if (!cache.has(id)) cache.set(id, await getJSON(`${API}/pokemon/${id}`));
  return cache.get(id);
}

async function getEvolutionChain(url) {
  if (!evolutionCache.has(url)) {
    evolutionCache.set(url, getJSON(url).catch((error) => {
      evolutionCache.delete(url);
      throw error;
    }));
  }
  return evolutionCache.get(url);
}

async function getSpecies(item) {
  if (!speciesCache.has(item.id)) {
    speciesCache.set(item.id, getJSON(item.speciesUrl).catch((error) => {
      speciesCache.delete(item.id);
      throw error;
    }));
  }
  return speciesCache.get(item.id);
}

async function getEvolutionStage(item) {
  if (!evolutionStageCache.has(item.id)) {
    const stage = (async () => {
      const species = await getSpecies(item);
      const { chain } = await getEvolutionChain(species.evolution_chain.url);
      let found = null;
      let count = 0;
      const visit = (node, depth) => {
        const id = Number(node.species.url.split("/").filter(Boolean).pop());
        count++;
        if (id === item.id) found = { depth, hasChildren: node.evolves_to.length > 0 };
        node.evolves_to.forEach((child) => visit(child, depth + 1));
      };
      visit(chain, 0);
      if (!found) throw new Error(`Evolution stage missing for species ${item.id}`);
      if (count === 1) return "single";
      if (found.depth === 0) return "base";
      return found.hasChildren ? "middle" : "final";
    })().catch((error) => {
      evolutionStageCache.delete(item.id);
      throw error;
    });
    evolutionStageCache.set(item.id, stage);
  }
  return evolutionStageCache.get(item.id);
}

function typeBadges(p) {
  return p.types
    .map((t) => `<span class="type" style="--c:${TYPE_COLORS[t.type.name]}">${PK.typeName(t.type.name)}</span>`)
    .join("");
}

function prettyName(name) {
  return PK.esc(PK.pretty(name));
}

function evolutionCondition(detail) {
  const conditions = [];
  const trigger = detail.trigger?.name;
  const triggerLabels = {
    "level-up": L("level-up", "level up"),
    "use-item": L("gebruik een voorwerp", "use an item"),
    trade: L("ruilen", "trade"),
    shed: L("extra Pokémon in je team", "have an extra Pokémon in your party"),
    spin: L("ronddraaien", "spin around"),
    "tower-of-darkness": L("proef van de Toren der Duisternis", "Tower of Darkness trial"),
    "tower-of-waters": L("proef van de Toren der Wateren", "Tower of Waters trial"),
    "three-critical-hits": L("drie kritieke treffers", "land three critical hits"),
    "take-damage": L("schade oplopen", "take damage"),
    other: L("speciale voorwaarde", "special condition"),
    "agile-style-move": L("een aanval in Agile-stijl gebruiken", "use an Agile Style move"),
    "strong-style-move": L("een aanval in Strong-stijl gebruiken", "use a Strong Style move"),
    "recoil-damage": L("terugslagschade oplopen", "take recoil damage"),
  };

  if (detail.min_level == null) {
    conditions.push(trigger === "level-up"
      ? L("tijdens level-up", "when leveling up")
      : L("geen vast level", "no fixed level"));
  }
  if (detail.min_level != null) conditions.push(L(`vanaf level ${detail.min_level}`, `at level ${detail.min_level}`));
  if (detail.min_happiness != null) conditions.push(L(`vriendschap ${detail.min_happiness}+`, `${detail.min_happiness}+ friendship`));
  if (detail.min_affection != null) conditions.push(L(`genegenheid ${detail.min_affection}+`, `${detail.min_affection}+ affection`));
  if (detail.min_beauty != null) conditions.push(L(`schoonheid ${detail.min_beauty}+`, `${detail.min_beauty}+ beauty`));
  if (detail.item) conditions.push(L(`gebruik ${prettyName(detail.item.name)}`, `use ${prettyName(detail.item.name)}`));
  if (detail.held_item) conditions.push(L(`houd ${prettyName(detail.held_item.name)} vast`, `hold ${prettyName(detail.held_item.name)}`));
  if (detail.trade_species) conditions.push(L(`ruil voor ${prettyName(detail.trade_species.name)}`, `trade for ${prettyName(detail.trade_species.name)}`));
  if (detail.known_move) conditions.push(L(`ken ${prettyName(detail.known_move.name)}`, `know ${prettyName(detail.known_move.name)}`));
  if (detail.known_move_type) conditions.push(L(`ken een aanval van het type ${prettyName(detail.known_move_type.name)}`, `know a ${prettyName(detail.known_move_type.name)}-type move`));
  if (detail.location) conditions.push(L(`op ${prettyName(detail.location.name)}`, `at ${prettyName(detail.location.name)}`));
  if (detail.time_of_day) conditions.push(detail.time_of_day === "day" ? L("overdag", "during the day") : L("'s nachts", "at night"));
  if (detail.gender === 1) conditions.push(L("vrouwelijk", "female"));
  if (detail.gender === 2) conditions.push(L("mannelijk", "male"));
  if (detail.party_species) conditions.push(L(`met ${prettyName(detail.party_species.name)} in je team`, `with ${prettyName(detail.party_species.name)} in your party`));
  if (detail.party_type) conditions.push(L(`met een Pokémon van type ${prettyName(detail.party_type.name)} in je team`, `with a ${prettyName(detail.party_type.name)}-type Pokémon in your party`));
  if (detail.needs_overworld_rain) conditions.push(L("terwijl het regent", "while it is raining"));
  if (detail.turn_upside_down) conditions.push(L("houd je apparaat ondersteboven", "turn your device upside down"));
  if (detail.relative_physical_stats != null) {
    const relation = { "-1": L("aanval lager dan verdediging", "Attack lower than Defense"), 0: L("aanval gelijk aan verdediging", "Attack equal to Defense"), 1: L("aanval hoger dan verdediging", "Attack higher than Defense") };
    conditions.push(relation[detail.relative_physical_stats] || L("bepaalde aanvals-/verdedigingsverhouding", "a specific Attack/Defense ratio"));
  }

  if (conditions.length) return conditions.join(", ");
  return triggerLabels[trigger] || (trigger ? prettyName(trigger) : L("voorwaarde onbekend", "unknown condition"));
}

function evolutionTree(node, currentSpeciesId) {
  const speciesId = Number(node.species.url.split("/").filter(Boolean).pop());
  const current = speciesId === currentSpeciesId;
  const name = `<span class="evo-node" data-evo="${speciesId}" title="${prettyName(node.species.name)}">`;
  const nameFull = name + `<img class="evo-img" src="${artwork(speciesId)}" alt="${prettyName(node.species.name)}" loading="lazy"><span class="evo-name${current ? " current" : ""}">${prettyName(node.species.name)}${current ? ` <small>${L("(deze Pokémon)", "(this Pokémon)")}</small>` : ""}</span></span>`;
  const children = node.evolves_to.map((child) => {
    const rules = new Map();
    child.evolution_details.forEach((detail) => {
      const rule = evolutionCondition(detail);
      if (!rules.has(rule)) rules.set(rule, new Set());
      if (detail.version_group?.name) rules.get(rule).add(detail.version_group.name);
    });
    const hasAlternatives = rules.size > 1;
    const ruleHtml = [...rules].map(([rule, groups]) => {
      const versions = hasAlternatives && groups.size
        ? ` <small>(${[...groups].map(versionGroupLabel).join(", ")})</small>`
        : "";
      return `<span class="evo-rule">${rule}${versions}</span>`;
    }).join("");
    return `<li>${ruleHtml}${evolutionTree(child, currentSpeciesId)}</li>`;
  }).join("");
  return `<span class="evo-stage">${nameFull}${children ? `<ul>${children}</ul>` : ""}</span>`;
}

function getLevelUpMoves(pokemon) {
  const groups = new Map();
  pokemon.moves.forEach(({ move, version_group_details }) => {
    version_group_details
      .filter((detail) => detail.move_learn_method.name === "level-up")
      .forEach((detail) => {
        const group = detail.version_group.name;
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push({ name: move.name, level: detail.level_learned_at });
      });
  });
  groups.forEach((moves, group) => {
    const unique = new Map(moves.map((move) => [`${move.level}:${move.name}`, move]));
    groups.set(group, [...unique.values()].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)));
  });
  return groups;
}

function versionGroupLabel(group) {
  if (I18N.lang === "nl") return VERSION_GROUP_NL[group] || PK.pretty(group);
  return group.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function render() {
  const token = ++renderToken;
  grid.innerHTML = "";
  statusEl.textContent = (Number(bstEl.value) || evolutionEl.value !== "all")
    ? L("Filters toepassen...", "Applying filters...")
    : L("Laden...", "Loading...");
  let items;
  try {
    items = await filtered();
  } catch {
    if (token === renderToken) statusEl.textContent = L("De filters konden niet worden geladen. Probeer het opnieuw.", "Could not load filter data. Please try again.");
    return;
  }
  if (token !== renderToken) return;
  statusEl.textContent = items.length ? `${items.length} Pokémon` : L("Geen Pokémon gevonden.", "No Pokémon found.");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id;
    card.innerHTML = `
      <button class="fav ${favorites.has(item.id) ? "on" : ""}" title="${L("Favoriet", "Favorite")}" aria-label="${L("Favoriet", "Favorite")}">${L("Favoriet", "Favorite")}</button>
      <img loading="lazy" alt="${item.name}" src="${artwork(item.id)}">
      <div class="num">#${String(item.id).padStart(4, "0")}</div>
      <h3>${item.name.replace(/-/g, " ")}</h3>
      <div class="types"></div>`;
    card._token = token;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
  grid.querySelectorAll(".card").forEach((card) => observer.observe(card));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(async (entry) => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const card = entry.target;
    try {
      const p = await getPokemon(Number(card.dataset.id));
      card.querySelector(".types").innerHTML = typeBadges(p);
      card.style.setProperty("--c", TYPE_COLORS[p.types[0].type.name]);
    } catch { /* ignore */ }
  });
}, { rootMargin: "200px" });

async function openDetail(id) {
  modal.hidden = false;
  modalBody.innerHTML = `<p style='text-align:center'>${L("Laden...", "Loading...")}</p>`;
  try {
    const p = await getPokemon(id);
    const species = await getJSON(p.species.url);
    let evolutionChain = null;
    let evolutionError = false;
    try {
      evolutionChain = await getEvolutionChain(species.evolution_chain.url);
    } catch {
      evolutionError = true;
    }
    const entry =
      (I18N.lang === "nl" && species.flavor_text_entries.find((f) => f.language.name === "nl")) ||
      [...species.flavor_text_entries].reverse().find((f) => f.language.name === "en");
    const text = entry ? entry.flavor_text.replace(/[\f\n]/g, " ") : "";
    const color = TYPE_COLORS[p.types[0].type.name];
    const stats = p.stats
      .map((s) => `
        <div class="stat">
          <span>${statName(s.stat.name)}</span>
          <b>${s.base_stat}</b>
          <div class="bar"><i style="width:${Math.min(100, (s.base_stat / 180) * 100)}%"></i></div>
        </div>`)
      .join("");
    const normal = artwork(id);
    const shiny = p.sprites.other["official-artwork"].front_shiny;
    const levelUpMoves = getLevelUpMoves(p);
    const versionGroups = [...levelUpMoves.keys()].sort((a, b) => {
      const ai = VERSION_GROUP_ORDER.indexOf(a);
      const bi = VERSION_GROUP_ORDER.indexOf(b);
      return (ai < 0 ? VERSION_GROUP_ORDER.length : ai) - (bi < 0 ? VERSION_GROUP_ORDER.length : bi) || a.localeCompare(b);
    });
    const evolutionHtml = evolutionChain
      ? `<div class="dex-section"><h3>${L("Evolutielijn", "Evolution line")}</h3><div class="evolution-tree"><ul>${evolutionTree(evolutionChain.chain, species.id)}</ul></div></div>`
      : `<div class="dex-section"><h3>${L("Evolutielijn", "Evolution line")}</h3><p class="dex-note error">${evolutionError ? L("De evolutiegegevens konden niet worden geladen.", "Evolution data could not be loaded.") : L("Geen evolutielijn beschikbaar.", "No evolution line available.")}</p></div>`;
    const moveHtml = versionGroups.length
      ? `<div class="dex-section">
          <h3>${L("Moves geleerd door level-up", "Moves learned by leveling up")}</h3>
          <label class="move-version-label" for="move-version">${L("Gameversie", "Game version")}</label>
          <select id="move-version">${versionGroups.map((group) => `<option value="${PK.esc(group)}">${PK.esc(versionGroupLabel(group))}</option>`).join("")}</select>
          <p class="dex-note">${L("Moves en leerniveaus kunnen per gameversie verschillen. Namen van aanvallen worden weergegeven zoals in de API-bron.", "Moves and learn levels can vary by game version. Move names are shown as provided by the API source.")}</p>
          <div id="move-list" class="move-list"></div>
        </div>`
      : `<div class="dex-section"><h3>${L("Moves geleerd door level-up", "Moves learned by leveling up")}</h3><p class="dex-note">${L("Voor deze Pokémon zijn geen level-up-moves beschikbaar in de gegevensbron.", "No level-up moves are available for this Pokémon in the data source.")}</p></div>`;

    modalBody.innerHTML = `
      <div class="detail dex-detail" style="--c:${color}">
        <div class="num">#${String(id).padStart(4, "0")}</div>
        <h2>${p.name.replace(/-/g, " ")}</h2>
        <img id="detail-img" alt="${p.name}" src="${normal}">
        ${shiny ? `<div class="sprites"><button data-src="${normal}">${L("Normaal", "Normal")}</button><button data-src="${shiny}">Shiny</button></div>` : ""}
        <div class="types" style="margin-top:.8rem">${typeBadges(p)}</div>
        <p class="desc">${text}</p>
        <div class="info">
          <div><span>${L("Lengte", "Height")}</span>${(p.height / 10).toFixed(1)} m</div>
          <div><span>${L("Gewicht", "Weight")}</span>${(p.weight / 10).toFixed(1)} kg</div>
          <div><span>${L("Vaardigheid", "Ability")}</span>${p.abilities[0].ability.name.replace(/-/g, " ")}</div>
        </div>
        <div class="stats">${stats}</div>
        ${evolutionHtml}
        ${moveHtml}
      </div>`;
    modalBody.querySelectorAll(".sprites button").forEach((b) =>
      b.addEventListener("click", () => ($("detail-img").src = b.dataset.src))
    );
    if (versionGroups.length) {
      const versionSelect = $("move-version");
      const moveList = $("move-list");
      const drawMoves = () => {
        const moves = levelUpMoves.get(versionSelect.value) || [];
        moveList.innerHTML = moves.length
          ? `<ol>${moves.map((move) => `<li><span>${L("Level", "Level")} ${move.level}</span><b>${prettyName(move.name)}</b></li>`).join("")}</ol>`
          : `<p class="dex-note">${L("Geen level-up-moves in deze gameversie.", "No level-up moves in this game version.")}</p>`;
      };
      const knownGroups = versionGroups.filter((group) => VERSION_GROUP_ORDER.includes(group));
      const latestKnownGroup = knownGroups[knownGroups.length - 1];
      versionSelect.value = latestKnownGroup || versionGroups[versionGroups.length - 1];
      versionSelect.addEventListener("change", drawMoves);
      drawMoves();
    }
  } catch {
    modalBody.innerHTML = `<p style='text-align:center'>${L("Kon details niet laden.", "Could not load details.")}</p>`;
  }
}

function closeModal() { modal.hidden = true; }

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = Number(card.dataset.id);
  if (e.target.classList.contains("fav")) {
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    localStorage.setItem("favorites", JSON.stringify([...favorites]));
    updateFavCount();
    e.target.classList.toggle("on");
    if (onlyFavs) render();
    return;
  }
  openDetail(id);
});

let searchTimer;
searchEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(render, 150);
});
typeEl.addEventListener("change", async () => {
  statusEl.textContent = L("Laden...", "Loading...");
  try { await loadTypeSet(typeEl.value); } catch { typeSet = null; }
  render();
});
genEl.addEventListener("change", () => loadGeneration(genEl.value));
bstEl.addEventListener("change", render);
evolutionEl.addEventListener("change", render);
favBtn.addEventListener("click", () => {
  onlyFavs = !onlyFavs;
  favBtn.classList.toggle("active", onlyFavs);
  render();
});
updateFavCount();
$("close").addEventListener("click", closeModal);
modalBody.addEventListener("click", (e) => {
  const node = e.target.closest("[data-evo]");
  if (node) openDetail(Number(node.dataset.evo));
});
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

document.addEventListener("langchange", () => {
  [...typeEl.options].forEach((o) => { if (o.value) o.textContent = PK.typeName(o.value); });
  if (list.length) render();
  if (!modal.hidden && NAV.current !== "items") modal.hidden = true;
});

let dexInitialized = false;
document.querySelector('.tab[data-view="pokedex"]').addEventListener("click", () => {
  if (dexInitialized) return;
  dexInitialized = true;
  Promise.allSettled([loadTypes(), loadGeneration(genEl.value)]).then(([types, generation]) => {
    if (types.status === "rejected" || generation.status !== "fulfilled" || !generation.value) {
      dexInitialized = false;
      statusEl.textContent = L("De Pokédex kon niet volledig worden geladen. Probeer het opnieuw.", "The Pokédex could not be fully loaded. Please try again.");
    }
  });
});
