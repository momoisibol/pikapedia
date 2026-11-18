// Regio's en routes: zijmenu met mappen per regio, wilde Pokémon (PokéAPI) en trainers (eigen data).
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const API = "https://pokeapi.co/api/v2";
  const ART = PK.ART;

  const REGIONS = [
    { id: "kanto", n: 1, name: "Kanto", art: [3, 6, 9], pref: ["firered", "red", "yellow", "blue", "leafgreen", "lets-go-pikachu"] },
    { id: "johto", n: 2, name: "Johto", art: [154, 157, 160], pref: ["heartgold", "gold", "crystal", "silver", "soulsilver"] },
    { id: "hoenn", n: 3, name: "Hoenn", art: [254, 257, 260], pref: ["emerald", "ruby", "omega-ruby", "sapphire", "alpha-sapphire"] },
    { id: "sinnoh", n: 4, name: "Sinnoh", art: [389, 392, 395], pref: ["platinum", "diamond", "pearl", "brilliant-diamond"] },
    { id: "unova", n: 5, name: "Unova", art: [497, 500, 503], pref: ["black-2", "black", "white", "white-2"] },
    { id: "kalos", n: 6, name: "Kalos", art: [652, 655, 658], pref: ["x", "y"] },
    { id: "alola", n: 7, name: "Alola", art: [724, 727, 730], pref: ["ultra-sun", "sun", "moon", "ultra-moon"] },
    { id: "galar", n: 8, name: "Galar", art: [812, 815, 818], pref: ["sword", "shield"] },
    { id: "hisui", n: 9, name: "Hisui", art: [905, 899, 903], pref: ["legends-arceus"] },
    { id: "paldea", n: 10, name: "Paldea", art: [908, 911, 914], pref: ["scarlet", "violet"] },
  ];
  const METHOD_NL = {
    walk: "Lopen (gras/grot)", surf: "Surfen", "old-rod": "Oude hengel", "good-rod": "Goede hengel", "super-rod": "Super hengel",
    "rock-smash": "Rock Smash", headbutt: "Headbutt", gift: "Cadeau", "only-one": "Eenmalig", "rough-terrain": "Ruw terrein",
    "sos-encounter": "SOS-oproep", "squirt-bottle": "Squirt Bottle", "wailmer-pail": "Wailmer Pail", "devon-scope": "Devon Scope",
  };

  const METHOD_ORDER = ["walk", "surf", "old-rod", "good-rod", "super-rod", "rock-smash", "headbutt", "gift", "only-one"];
  const COND_NL = {
    "time-morning": "Ochtend", "time-day": "Overdag", "time-night": "'s Nachts", "swarm-yes": "Zwerm", "swarm-no": "Geen zwerm",
    "radar-on": "Met PokeRadar", "radar-off": "Zonder PokeRadar", "season-spring": "Lente", "season-summer": "Zomer", "season-autumn": "Herfst", "season-winter": "Winter",
  };
  const REGION_INFO = {
    kanto: { prof: "Prof. Oak", starters: "Bulbasaur, Charmander, Squirtle", league: "Indigo Plateau", real: ["Kantō, Japan", "Kantō, Japan"], games: "Red/Blue/Yellow, FireRed/LeafGreen, Let's Go" },
    johto: { prof: "Prof. Elm", starters: "Chikorita, Cyndaquil, Totodile", league: "Indigo Plateau", real: ["Kansai, Japan", "Kansai, Japan"], games: "Gold/Silver/Crystal, HeartGold/SoulSilver" },
    hoenn: { prof: "Prof. Birch", starters: "Treecko, Torchic, Mudkip", league: "Ever Grande City", real: ["Kyushu, Japan", "Kyushu, Japan"], games: "Ruby/Sapphire/Emerald, Omega Ruby/Alpha Sapphire" },
    sinnoh: { prof: "Prof. Rowan", starters: "Turtwig, Chimchar, Piplup", league: "Sinnoh Pokémon League", real: ["Hokkaido, Japan", "Hokkaido, Japan"], games: "Diamond/Pearl/Platinum, Brilliant Diamond/Shining Pearl" },
    unova: { prof: "Prof. Juniper", starters: "Snivy, Tepig, Oshawott", league: "Unova Pokémon League", real: ["New York en omgeving, VS", "New York and surroundings, USA"], games: "Black/White, Black 2/White 2" },
    kalos: { prof: "Prof. Sycamore", starters: "Chespin, Fennekin, Froakie", league: "Kalos Pokémon League", real: ["Frankrijk", "France"], games: "X/Y, Legends: Z-A" },
    alola: { prof: "Prof. Kukui", starters: "Rowlet, Litten, Popplio", league: "Mount Lanakila", real: ["Hawaï, VS", "Hawaii, USA"], games: "Sun/Moon, Ultra Sun/Ultra Moon" },
    galar: { prof: "Prof. Magnolia", starters: "Grookey, Scorbunny, Sobble", league: "Wyndon Stadium", real: ["Verenigd Koninkrijk", "United Kingdom"], games: "Sword/Shield" },
    hisui: { prof: "Prof. Laventon", starters: "Rowlet, Cyndaquil, Oshawott", league: "-", real: ["Sinnoh van lang geleden", "Sinnoh long ago"], games: "Legends: Arceus" },
    paldea: { prof: "Prof. Sada / Turo", starters: "Sprigatito, Fuecoco, Quaxly", league: "Paldea Pokémon League", real: ["Spanje en Portugal", "Spain and Portugal"], games: "Scarlet/Violet" },
  };
  const CATS = [
    ["city", ["Steden & dorpen", "Cities & towns"]],
    ["route", ["Routes", "Routes"]],
    ["wild", ["Grotten, bossen & natuur", "Caves, forests & nature"]],
    ["league", ["Pokémon League", "Pokémon League"]],
    ["other", ["Overige plekken", "Other places"]],
  ];

  const loadPreferences = (r) => {
    try {
      const prefs = JSON.parse(localStorage.getItem(`regionPreferences:${r.id}`) || "{}");
      return prefs && typeof prefs === "object" ? prefs : {};
    } catch { return {}; }
  };
  const savePreferences = () => {
    if (!region) return;
    localStorage.setItem(`regionPreferences:${region.id}`, JSON.stringify({
      game: mapGame,
      query: flt.q,
      method: flt.m,
    }));
  };

  const cache = {};
  let locationSearchPromise = null;
  const getJSON = async (url) => {
    if (cache[url]) return cache[url];
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return (cache[url] = await r.json());
  };
  const mapLimit = async (items, limit, fn) => {
    const results = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await fn(items[index]);
      }
    }));
    return results;
  };
  const method = (m) => (I18N.lang === "nl" ? METHOD_NL[m] : null) || PK.pretty(m);
  const condLabel = (c) => c.split(",").filter(Boolean).map((x) => (I18N.lang === "nl" && COND_NL[x]) || PK.pretty(x.replace(/^(time|season|swarm|radar|slot2|radio)-/, ""))).join(", ");
  const natural = (a, b) => a.label.localeCompare(b.label, "en", { numeric: true });
  const catOf = (slug) =>
    /route/.test(slug) ? "route"
      : /-(city|town|village|island)$|^lumiose/.test(slug) ? "city"
      : /plateau|league|ever-grande/.test(slug) ? "league"
      : /cave|tunnel|mt-|mount|mountain|forest|woods|tower|mansion|plant|safari|ruins|lake|bay|falls|islands|path|pillar|cavern|grotto|shrine|temple|valley|canyon|desert|swamp|beach|garden|park|field|road|chasm|marsh|cliff/.test(slug) ? "wild"
      : "other";

  let region = null;     // actieve regio
  let locs = {};         // regio-id -> [{slug,label,cat}]
  let loc = null;        // actieve locatie { slug, name, areas }
  let ver = "";          // gekozen game-versie
  let mapGame = "";      // voorkeursversie voor de regio
  let flt = { q: "", m: "" };

  const label = (slug, r) => PK.pretty(slug.replace(new RegExp("^" + r.id + "-"), ""));

  async function loadLocs(r) {
    if (locs[r.id]) return locs[r.id];
    const d = await getJSON(`${API}/region/${r.n}`);
    return (locs[r.id] = d.locations.map((l) => ({ slug: l.name, label: label(l.name, r), cat: catOf(l.name) })).sort(natural));
  }

  // Locaties per categorie, elke groep met een kopje
  function grouped(list, btn, head, wrap) {
    return CATS.map(([k, [nl, en]]) => {
      const items = list.filter((l) => l.cat === k);
      if (!items.length) return "";
      const body = items.map(btn).join("");
      return head(L(nl, en), items.length) + (wrap ? `<div class="rg-locs">${body}</div>` : body);
    }).join("");
  }

  // Unieke Gym-sets per regio (versies delen vaak dezelfde lijst)
  function gymSets(r) {
    const sets = [];
    Object.entries(window.BATTLES).forEach(([gid, b]) => {
      if (!b || b.region !== r.id || !b.gyms.length) return;
      let s = sets.find((x) => x.gyms === b.gyms);
      if (!s) sets.push((s = { gyms: b.gyms, ids: [] }));
      s.ids.push(gid);
    });
    return sets.map((s) => ({ ...s, title: s.ids.map((id) => BattleUI.gameOf(id).name).join(" · "), gen: BattleUI.gameOf(s.ids[0]).gen }));
  }

  function pane(name) {
    ["rg-main", "rg-region", "rg-loc"].forEach((id) => ($(id).hidden = id !== name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- Overzicht van alle regio's -----
  function renderMain() {
    $("rg-main").innerHTML = `
      <h2 class="view-title">${L("Regio's & routes", "Regions & routes")}</h2>
      <p class="wt-lead">${L("Kies een regio om alle routes, steden en grotten te zien met de Pokémon die je er kunt vangen en de belangrijkste trainers.", "Pick a region to see all routes, cities and caves with the Pokémon you can catch and the key trainers.")}</p>
      <div class="wt-grid">${REGIONS.map((r) => `
        <button class="wt-card" data-region="${r.id}">
          <div class="wt-art">${r.art.map((i) => `<img loading="lazy" alt="" src="${ART(i)}">`).join("")}</div>
          <div class="wt-card-body"><b>${r.name}</b><span>${L("Generatie", "Generation")} ${r.id === "hisui" ? 8 : r.n <= 9 ? r.n : 9}</span></div>
        </button>`).join("")}</div>`;
  }

  // ----- Regio: lijst van locaties -----
  async function showRegion(r) {
    region = r;
    const prefs = loadPreferences(r);
    mapGame = r.pref.includes(prefs.game) ? prefs.game : r.pref[0];
    ver = mapGame;
    flt = { q: prefs.query || "", m: prefs.method || "" };
    NAV.current !== "regions" && NAV.go("regions");
    pane("rg-region");
    const el = $("rg-region");
    el.innerHTML = `<p class="status">${L("Laden...", "Loading...")}</p>`;
    let list;
    try { list = await loadLocs(r); } catch { el.innerHTML = `<p class="status">${L("Kon de locaties niet laden.", "Could not load locations.")}</p>`; return; }
    const info = REGION_INFO[r.id];
    const sets = gymSets(r);
    const gyms = sets[0]?.gyms || [];
    const fact = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
    el.innerHTML = `
      <button class="back-btn" id="rg-back-main" style="max-width:none">${L("← Alle regio's", "← All regions")}</button>
      <h2 class="view-title">${r.name}</h2>
      <div class="rg-card">
        <div class="wt-facts">
          ${fact(L("Professor", "Professor"), info.prof)}
          ${fact("Starters", info.starters)}
          ${fact("League", info.league)}
          ${fact(L("Gebaseerd op", "Based on"), I18N.pick({ nl: info.real[0], en: info.real[1] }))}
          ${fact("Games", info.games)}
          ${fact(L("Plekken in de database", "Places in the database"), list.length)}
        </div>
        ${gyms.length ? `<h4 class="bt-h">${L("De route langs de Gyms", "The path along the Gyms")}</h4>
        <div class="rg-gyms">${gyms.map((g, i) => `<button class="rg-gym" style="--c:${PK.TYPE_COLORS[g.type]}" data-slug="${list.some((l) => l.slug === g.slug) ? PK.esc(g.slug) : "__gyms"}"><b>${i + 1}</b><span>${PK.esc(g.city)}<small>${PK.esc(g.leader)} · ${PK.typeName(g.type)}</small></span></button>`).join("")}</div>` : ""}
        <div class="rg-links">
          <button class="wt-chip" data-go="walkthrough">${L("Walkthrough", "Walkthrough")}</button>
          <button class="wt-chip" data-go="elite">${L("Elite Four & Kampioenen", "Elite Four & Champions")}</button>
          <button class="wt-chip" data-go="items">${L("Itemgids openen", "Open item guide")}</button>
        </div>
      </div>
        <form id="rg-pokemon-form" class="rg-pokemon-finder">
          <label for="rg-pokemon-search">${L("Waar vind ik een Pokémon?", "Where can I find a Pokémon?")}</label>
          <div><input id="rg-pokemon-search" type="search" placeholder="${L("bijv. pikachu", "e.g. pikachu")}" autocomplete="off">
            <button class="wt-chip" type="submit">${L("Zoek op de kaart", "Find on map")}</button></div>
          <div id="rg-pokemon-result" aria-live="polite"></div>
        </form>
        <section class="rg-map-card" aria-labelledby="rg-map-title">
          <div class="rg-map-heading"><h3 id="rg-map-title">${L("Schematische routekaart", "Schematic route map")}</h3>
            <label>${L("Game:", "Game:")} <select id="rg-map-version">${r.pref.map((v) => `<option value="${PK.esc(v)}" ${v === mapGame ? "selected" : ""}>${PK.esc(PK.pretty(v))}</option>`).join("")}</select></label>
          </div>
          <p class="rg-map-note">${L("Locaties zijn per soort gegroepeerd en alfabetisch gerangschikt. Dit is een interactieve kaartindex, geen geografische of officiële gamekaart. Kies een game om die versie als standaard te onthouden.", "Locations are grouped by type and sorted alphabetically. This is an interactive map index, not a geographic or official game map. Choose a game to remember it as your default.")}</p>
          <div id="rg-map" class="rg-map">${grouped(list, (l) => `<button class="rg-loc rg-map-node" data-slug="${PK.esc(l.slug)}">${PK.esc(l.label)}</button>`, (t, n) => `<h4 class="rg-cat">${t} <small>${n}</small></h4>`, true)}</div>
        </section>
        <div class="items-controls"><input id="rg-filter" type="search" value="${PK.esc(flt.q)}" placeholder="${L("Zoek een route of stad...", "Search a route or city...")}" autocomplete="off"></div>
      <div class="rg-locs"><button class="rg-loc gold" data-slug="__gyms">${L("Gym leaders & bazen", "Gym leaders & bosses")}</button></div>
      <div id="rg-list">${grouped(list, (l) => `<button class="rg-loc" data-slug="${PK.esc(l.slug)}">${PK.esc(l.label)}</button>`, (t, n) => `<h4 class="rg-cat">${t} <small>${n}</small></h4>`, true)}</div>`;
  }

  // ----- Locatiepagina -----
  function trainersHtml(r, slug) {
    if (slug === "__gyms") {
      const sets = gymSets(r);
      if (!sets.length) return `<p>${L("Deze regio heeft geen traditionele Gyms in de games. Zie het menu Elite Four & Kampioenen.", "This region has no traditional Gyms in the games. See the Elite Four & Champions menu.")}</p>`;
      return sets.map((s, i) => `
        <details class="rg-det" ${i === 0 ? "open" : ""}><summary>${PK.esc(s.title)}</summary>
          <div class="bt-grid">${s.gyms.map((g, k) => BattleUI.card(g, `Gym ${k + 1}`, s.gen)).join("")}</div>
        </details>`).join("");
    }
    const hits = gymSets(r).map((s) => ({ s, i: s.gyms.findIndex((g) => g.slug === slug) })).filter((x) => x.i >= 0);
    if (!hits.length) return "";
    return hits.map(({ s, i }) => `<h4 class="bt-h">${PK.esc(s.title)}</h4><div class="bt-grid single">${BattleUI.card(s.gyms[i], `Gym ${i + 1}`, s.gen)}</div>`).join("");
  }

  // Per gebied: Pokémon per manier en voorwaarde; kansen van losse slots worden opgeteld
  function buildAreas(areas, v) {
    return areas.map((a) => {
      const per = new Map();
      a.pokemon_encounters.forEach((pe) => {
        const id = Number(pe.pokemon.url.split("/").filter(Boolean).pop());
        pe.version_details.forEach((vd) => {
          if (v && v !== "__all" && vd.version.name !== v) return;
          vd.encounter_details.forEach((ed) => {
            const cond = (ed.condition_values || []).map((c) => c.name).sort().join(",");
            const key = `${pe.pokemon.name}|${ed.method.name}|${cond}`;
            let o = per.get(key);
            if (!o) per.set(key, (o = { id, name: pe.pokemon.name, method: ed.method.name, cond, min: 999, max: 0, vers: new Map() }));
            o.min = Math.min(o.min, ed.min_level);
            o.max = Math.max(o.max, ed.max_level);
            o.vers.set(vd.version.name, (o.vers.get(vd.version.name) || 0) + ed.chance);
          });
        });
      });
      const rows = [...per.values()].map((o) => ({ ...o, chance: Math.min(100, Math.max(...o.vers.values())) }));
      const en = a.names?.find((n) => n.language.name === "en")?.name;
      let lbl = en || PK.pretty(a.name.replace(loc.slug + "-", ""));
      if (/^area$/i.test(lbl) || lbl === PK.pretty(loc.slug) + " Area" || a.name === loc.slug + "-area") lbl = "";
      return { label: lbl, rows };
    }).filter((a) => a.rows.length);
  }

  const rarity = (c) => (c >= 30 ? ["common", L("Algemeen", "Common")] : c >= 10 ? ["uncommon", L("Gemiddeld", "Uncommon")] : c > 0 ? ["rare", L("Zeldzaam", "Rare")] : ["none", ""]);

  function renderTable() {
    const host = $("rg-table-host");
    if (!host) return;
    const v = ver === "" ? "__all" : ver;
    const areas = buildAreas(loc.areas, v);
    if (!areas.length) {
      host.innerHTML = `<p>${L("Voor deze plek (en versie) zijn geen wilde Pokémon gevonden in de database. Dat komt vaak voor in steden, nieuwere games (Galar, Paldea, Hisui) of op plekken met alleen trainers.", "No wild Pokémon found for this place (and version) in the database. This is common for cities, newer games (Galar, Paldea, Hisui) or trainer-only places.")}</p>`;
      return;
    }
    const all = areas.flatMap((a) => a.rows);
    const methods = [...new Set(all.map((r) => r.method))].sort((a, b) => (METHOD_ORDER.indexOf(a) + 100) % 100 - (METHOD_ORDER.indexOf(b) + 100) % 100 || a.localeCompare(b));
    if (flt.m && !methods.includes(flt.m)) flt.m = "";
    const q = flt.q.trim().toLowerCase().replace(/\s+/g, "-");
    const unique = new Set(all.map((r) => r.name)).size;
    const chips = [["", L("Alle manieren", "All methods")], ...methods.map((m) => [m, method(m)])]
      .map(([m, l]) => `<button class="wt-chip${flt.m === m ? " active" : ""}" data-m="${m}">${PK.esc(l)}</button>`).join("");
    let shown = 0;
    const body = areas.map((a) => {
      const byM = methods.filter((m) => !flt.m || m === flt.m).map((m) => {
        const rows = a.rows.filter((r) => r.method === m && (!q || r.name.includes(q))).sort((x, y) => y.chance - x.chance || x.name.localeCompare(y.name));
        if (!rows.length) return "";
        shown += rows.length;
        return `<div class="rg-method"><h5>${PK.esc(method(m))} <small>${rows.length}</small></h5>
          <div class="rg-table-wrap"><table class="rg-table"><thead><tr><th>Pokémon</th><th>${L("Level", "Level")}</th><th>${L("Kans", "Chance")}</th><th>${L("Voorwaarde", "Condition")}</th></tr></thead><tbody>${rows.map((x) => {
            const [rk, rl] = rarity(x.chance);
            return `<tr><td><img loading="lazy" alt="" src="${ART(x.id)}"><b>${PK.esc(PK.pretty(x.name))}</b></td><td>${x.min === x.max ? x.min : x.min + "–" + x.max}</td>
              <td><div class="rg-bar ${rk}" title="${rl}"><i style="width:${Math.max(4, x.chance)}%"></i></div><span class="rg-pct">${x.chance ? x.chance + "%" : "–"}</span></td><td>${PK.esc(condLabel(x.cond)) || "–"}</td></tr>`;
          }).join("")}</tbody></table></div></div>`;
      }).join("");
      return byM ? (a.label ? `<h4 class="rg-area">${PK.esc(a.label)}</h4>` : "") + byM : "";
    }).join("");
    host.innerHTML = `
      <p class="wt-note">${L(`${unique} verschillende Pokémon op deze plek. De kans is het aandeel van de ontmoetingen met die manier (bij elkaar 100% per manier); bij meerdere voorwaarden zoals tijdstip kan het totaal hoger zijn.`, `${unique} different Pokémon here. Chance is the share of encounters for that method (adds up to 100% per method); with several conditions such as time of day the total may be higher.`)}</p>
      <div class="wt-chips">${chips}</div>
      ${body || `<p>${L("Geen Pokémon gevonden met dit filter.", "No Pokémon match this filter.")}</p>`}`;
  }

  function renderLoc() {
    const r = region;
    const versions = [...new Set(loc.areas.flatMap((a) => a.pokemon_encounters.flatMap((pe) => pe.version_details.map((vd) => vd.version.name))))];
    versions.sort((a, b) => (r.pref.indexOf(a) + 100) % 100 - (r.pref.indexOf(b) + 100) % 100 || a.localeCompare(b));
    if (ver !== "" && ver !== "__all" && !versions.includes(ver)) ver = "";
    if (ver === "" && !loc.userPicked) ver = versions.find((v) => r.pref.includes(v)) || versions[0] || "";
    const bulba = `https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(loc.name.replace(/ /g, "_"))}`;
    const isGyms = loc.slug === "__gyms";

    $("rg-loc").innerHTML = `
      <button class="back-btn" id="rg-back-region" style="max-width:none">← ${r.name}</button>
      <h2 class="view-title">${PK.esc(loc.name)}</h2>
      ${isGyms ? "" : `<h3 class="tcg-h">${L("Pokémon die je hier kunt vangen", "Pokémon you can catch here")}</h3>
      <div class="items-controls">
        ${versions.length ? `<label>${L("Game:", "Game:")} <select id="rg-ver">
          ${versions.map((v) => `<option value="${v}" ${v === ver ? "selected" : ""}>${PK.esc(PK.pretty(v))}</option>`).join("")}
          <option value="__all" ${ver === "__all" ? "selected" : ""}>${L("Alle versies samen", "All versions combined")}</option></select></label>` : ""}
        <input id="rg-q" type="search" placeholder="${L("Zoek een Pokémon hier...", "Search a Pokémon here...")}" value="${PK.esc(flt.q)}" autocomplete="off">
      </div>
      <div id="rg-table-host"></div>`}
      <h3 class="tcg-h">${L("Trainers & belangrijke gevechten", "Trainers & key battles")}</h3>
      ${trainersHtml(r, loc.slug) || `<p>${L("Geen Gym leader of baas op deze plek.", "No Gym leader or boss at this place.")}</p>`}
      <section class="rg-item-guide">
        <h3>${L("Itemgids", "Item guide")}</h3>
        <p>${L("Bekijk de werking van items in de itemgids. De locatiegegevens van PokéAPI bevatten geen betrouwbare lijst van items per route.", "See what items do in the item guide. PokéAPI location data does not provide a reliable list of items for each route.")}</p>
        <button class="wt-chip" data-go="items">${L("Open itemgids", "Open item guide")}</button>
      </section>
      <p class="wt-note">${L("Een volledige lijst van alle gewone trainers en hun Pokémon vind je op", "A full list of all regular trainers and their Pokémon is on")} <a href="${bulba}" target="_blank" rel="noopener">Bulbapedia: ${PK.esc(loc.name)}</a>.</p>`;
    renderTable();
    BattleUI.mount($("rg-loc"));
  }

  async function showLocation(r, slug) {
    region = r;
    if (slug !== "__gyms") {
      const prefs = loadPreferences(r);
      mapGame = r.pref.includes(prefs.game) ? prefs.game : r.pref[0];
      flt = { q: prefs.query || "", m: prefs.method || "" };
      ver = mapGame;
    }
    NAV.current !== "regions" && NAV.go("regions");
    pane("rg-loc");
    if (slug === "__gyms") {
      loc = { slug, name: `${r.name} – ${L("Gym leaders & bazen", "Gym leaders & bosses")}`, areas: [], userPicked: true };
      renderLoc();
      return;
    }
    $("rg-loc").innerHTML = `<p class="status">${L("Laden...", "Loading...")}</p>`;
    try {
      const d = await getJSON(`${API}/location/${slug}`);
      const areas = await Promise.all(d.areas.map((a) => getJSON(a.url)));
      const en = d.names.find((n) => n.language.name === "en");
      loc = { slug, name: en ? en.name : PK.pretty(slug), areas };
      renderLoc();
    } catch {
      $("rg-loc").innerHTML = `<button class="back-btn" id="rg-back-region" style="max-width:none">← ${r.name}</button><p class="status">${L("Kon deze locatie niet laden.", "Could not load this location.")}</p>`;
    }
  }

  async function findPokemonLocations(r, input) {
    const host = $("rg-pokemon-result");
    const query = input.trim().toLowerCase();
    if (!query) {
      host.innerHTML = `<p class="status">${L("Vul eerst een Pokémonnaam in.", "Enter a Pokémon name first.")}</p>`;
      return;
    }
    host.innerHTML = `<p class="status">${L("Locaties zoeken...", "Searching locations...")}</p>`;
    try {
      const dex = await PK.dex();
      if (!Object.keys(dex).length) throw new Error("Pokédex name index is empty");
      const canonical = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const slug = Object.keys(dex).find((name) => canonical(name) === canonical(query));
      if (!slug) {
        host.innerHTML = `<p class="status">${L("Kies een Pokémonnaam uit de Pokédex.", "Choose a Pokémon name from the Pokédex.")}</p>`;
        return;
      }
      const encounters = await getJSON(`${API}/pokemon/${dex[slug]}/encounters`);
      const matching = encounters.filter((entry) => entry.version_details.some((detail) => detail.version.name === mapGame));
      const areas = await mapLimit(matching, 8, (entry) => getJSON(entry.location_area.url));
      const locationUrls = [...new Set(areas.map((area) => area.location.url))];
      const locations = await mapLimit(locationUrls, 8, getJSON);
      const inRegion = new Set(locations
        .filter((location) => location.region?.name === r.id)
        .map((location) => location.name));
      const hits = [...new Set(areas
        .filter((area) => inRegion.has(area.location.name))
        .map((area) => area.location.name))]
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
      host.innerHTML = hits.length
        ? `<p>${L(`${PK.pretty(slug)} komt voor in ${PK.pretty(mapGame)} op:`, `${PK.pretty(slug)} can be found in ${PK.pretty(mapGame)} at:`)}</p>
          <div class="rg-pokemon-results">${hits.map((name) => `<button class="wt-chip rg-pokemon-location" type="button" data-slug="${PK.esc(name)}">${PK.esc(PK.pretty(name))}</button>`).join("")}</div>`
        : `<p class="status">${L(`Geen vindplaats gevonden voor ${PK.pretty(slug)} in ${PK.pretty(mapGame)} binnen ${r.name}.`, `No location found for ${PK.pretty(slug)} in ${PK.pretty(mapGame)} within ${r.name}.`)}</p>`;
    } catch (error) {
      console.error("Could not search Pokémon locations:", error);
      host.innerHTML = `<p class="status">${L("De vindplaatsen konden niet worden geladen.", "Could not load Pokémon locations.")}</p>`;
    }
  }

  // ----- Zijmenu-boom -----
  function renderTree() {
    $("region-tree").innerHTML = REGIONS.map((r) => `
      <div class="tree-region" data-region="${r.id}">
        <button class="tree-folder">${r.name}</button>
        <div class="tree-body" hidden></div>
      </div>`).join("");
  }

  async function toggleFolder(box) {
    const r = REGIONS.find((x) => x.id === box.dataset.region);
    const body = box.querySelector(".tree-body");
    if (!body.hidden) { body.hidden = true; box.classList.remove("open"); return; }
    document.querySelectorAll(".tree-body").forEach((b) => { b.hidden = true; b.parentElement.classList.remove("open"); });
    box.classList.add("open");
    body.hidden = false;
    body.innerHTML = `<small class="tree-note">${L("Laden...", "Loading...")}</small>`;
    try {
      const list = await loadLocs(r);
      body.innerHTML = `
        <input class="tree-filter" type="search" placeholder="${L("Filter...", "Filter...")}" autocomplete="off">
        <button class="tree-item gold" data-slug="__gyms">${L("Gyms & bazen", "Gyms & bosses")}</button>
        ${grouped(list, (l) => `<button class="tree-item" data-slug="${PK.esc(l.slug)}">${PK.esc(l.label)}</button>`, (t) => `<small class="tree-h">${t}</small>`, false)}`;
    } catch {
      body.innerHTML = `<small class="tree-note">${L("Kon niet laden", "Could not load")}</small>`;
    }
    showRegion(r);
  }

  $("region-tree").addEventListener("click", (e) => {
    const item = e.target.closest(".tree-item");
    if (item) {
      const r = REGIONS.find((x) => x.id === item.closest(".tree-region").dataset.region);
      $("region-tree").querySelectorAll(".tree-item.active").forEach((b) => b.classList.remove("active"));
      item.classList.add("active");
      return showLocation(r, item.dataset.slug);
    }
    const folder = e.target.closest(".tree-folder");
    if (folder) toggleFolder(folder.parentElement);
  });
  $("region-tree").addEventListener("input", (e) => {
    if (!e.target.matches(".tree-filter")) return;
    const q = e.target.value.trim().toLowerCase();
    e.target.closest(".tree-body").querySelectorAll(".tree-item").forEach((b) => (b.hidden = !!q && !b.textContent.toLowerCase().includes(q) && !b.classList.contains("gold")));
  });

  $("view-regions").addEventListener("click", (e) => {
    const card = e.target.closest("[data-region]");
    if (card && card.closest("#rg-main")) return showRegion(REGIONS.find((r) => r.id === card.dataset.region));
    const l = e.target.closest(".rg-loc, .rg-gym, .rg-pokemon-location");
    if (l) return showLocation(region, l.dataset.slug);
    const go = e.target.closest("[data-go]");
    if (go) return NAV.go(go.dataset.go);
    const chip = e.target.closest("[data-m]");
    if (chip) { flt.m = chip.dataset.m; return renderTable(); }
    if (e.target.closest("#rg-back-main")) return pane("rg-main");
    if (e.target.closest("#rg-back-region")) return showRegion(region);
  });
  $("view-regions").addEventListener("input", (e) => {
    if (e.target.id === "rg-q") { flt.q = e.target.value; savePreferences(); return renderTable(); }
    if (e.target.id !== "rg-filter") return;
    flt.q = e.target.value;
    savePreferences();
    const q = e.target.value.trim().toLowerCase();
    $("rg-region").querySelectorAll(".rg-loc").forEach((b) => (b.hidden = !!q && !b.textContent.toLowerCase().includes(q)));
    $("rg-list")?.querySelectorAll(".rg-cat").forEach((h) => (h.hidden = ![...h.nextElementSibling.children].some((b) => !b.hidden)));
  });
  $("view-regions").addEventListener("change", (e) => {
    if (e.target.id === "rg-map-version") {
      mapGame = e.target.value;
      ver = mapGame;
      savePreferences();
      return;
    }
    if (e.target.id === "rg-ver") {
      ver = e.target.value;
      mapGame = ver === "__all" ? mapGame : ver;
      savePreferences();
      loc.userPicked = true;
      renderLoc();
    }
  });
  $("view-regions").addEventListener("submit", (e) => {
    if (e.target.id !== "rg-pokemon-form") return;
    e.preventDefault();
    findPokemonLocations(region, $("rg-pokemon-search").value);
  });

  window.REGION_SEARCH = {
    async find(query) {
      const normalize = (value) => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      const term = normalize(query);
      if (term.length < 3) return [];
      if (!locationSearchPromise) {
        locationSearchPromise = Promise.all(REGIONS.map(async (r) => ({
          region: r,
          locations: await loadLocs(r),
        }))).catch((error) => {
          locationSearchPromise = null;
          throw error;
        });
      }
      const index = await locationSearchPromise;
      return index.flatMap(({ region: r, locations }) => {
        const matches = locations
          .filter((location) => normalize(`${location.label} ${location.slug}`).includes(term))
          .map((location) => ({
            name: location.slug,
            label: location.label,
            region: r.id,
            sub: `${L("Locatie", "Location")} · ${r.name}`,
          }));
        if (normalize(r.name).includes(term)) matches.unshift({
          name: "",
          label: r.name,
          region: r.id,
          regionOnly: true,
          sub: L("Regio", "Region"),
        });
        return matches;
      }).slice(0, 5);
    },
    openRegion(regionId) {
      const r = REGIONS.find((item) => item.id === regionId);
      if (r) showRegion(r);
    },
    open(regionId, slug) {
      const r = REGIONS.find((item) => item.id === regionId);
      if (r) showLocation(r, slug);
    },
  };

  document.querySelectorAll(".tab[data-view]").forEach((tab) =>
    tab.addEventListener("click", (e) => {
      $("region-tree").hidden = tab.dataset.view !== "regions";
      if (tab.dataset.view === "regions" && e.isTrusted) pane("rg-main");
    })
  );
  document.addEventListener("langchange", () => {
    renderMain(); renderTree();
    if (!$("rg-loc").hidden && loc) renderLoc();
    else if (!$("rg-region").hidden && region) showRegion(region);
  });

  renderMain();
  renderTree();
  $("region-tree").hidden = true;
})();
