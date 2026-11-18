// Trainer-tools: teambuilder, typetabel en shiny-teller.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const esc = PK.esc;
  const API = "https://pokeapi.co/api/v2";
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const store = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const slugOf = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "-");

  const SECTIONS = [
    ["team", "Teambuilder", "Team builder"],
    ["chart", "Typetabel", "Type chart"],
    ["shiny", "Shiny-teller", "Shiny counter"],
    ["evolution", "Evolutielijn", "Evolution tree"],
    ["moves", "Aanvallen zoeken", "Move search"],
    ["tm", "TM-compatibiliteit", "TM compatibility"],
    ["catch", "Vangkans", "Catch calculator"],
  ];
  let section = load("toolsSection", "team");
  if (!SECTIONS.some((s) => s[0] === section)) section = "team";

  const infoCache = {};
  const apiCache = {};
  async function getJSON(url) {
    if (!apiCache[url]) {
      apiCache[url] = fetch(url).then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
    return apiCache[url];
  }

  async function monInfo(slug) {
    if (!infoCache[slug]) {
      const d = await getJSON(`${API}/pokemon/${slug}`);
      infoCache[slug] = { id: d.id, types: d.types.map((t) => t.type.name) };
    }
    return infoCache[slug];
  }

  let dex = {};
  PK.dex().then((d) => {
    dex = d;
  });

  const chips = () => `<div class="wt-chips tl-chips">${SECTIONS.map(([id, nl, en]) =>
    `<button class="wt-chip${section === id ? " active" : ""}" data-sec="${id}">${L(nl, en)}</button>`).join("")}</div>`;

  function pokemonPicker(id, value = "", options = {}) {
    const slug = slugOf(value);
    const number = dex[slug];
    const placeholder = options.placeholder || L("Zoek of kies een Pokémon", "Search or pick a Pokémon");
    const ariaLabel = options.ariaLabel || L("Zoek een Pokémon", "Search for a Pokémon");
    return `<div class="tl-pokemon-field"><div class="tl-pokemon-picker-wrap">
      <input id="${id}" class="tl-pokemon-picker" data-pokemon-picker ${options.attributes || ""} value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-suggestions" aria-label="${esc(ariaLabel)}">
      <div id="${id}-suggestions" class="tl-pokemon-suggestions" role="listbox" hidden></div>
    </div>${options.preview === false ? "" : `<img class="tl-pokemon-preview" data-picker-preview src="${number ? PK.ART(number) : ""}" alt="${number ? esc(PK.pretty(slug)) : ""}"${number ? "" : " hidden"}>`}</div>`;
  }

  function closePicker(input) {
    const menu = $(input.getAttribute("aria-controls"));
    if (!menu) return;
    menu.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  function updatePickerPreview(input) {
    const preview = input.closest(".tl-pokemon-field").querySelector("[data-picker-preview]");
    if (!preview) return;
    const slug = slugOf(input.value);
    const id = dex[slug];
    preview.hidden = !id;
    preview.src = id ? PK.ART(id) : "";
    preview.alt = id ? PK.pretty(slug) : "";
  }

  function renderPickerOptions(input) {
    const menu = $(input.getAttribute("aria-controls"));
    if (!menu) return;
    const query = slugOf(input.value);
    const names = Object.keys(dex).filter((name) => !query || name.includes(query))
      .sort((a, b) => Number(!a.startsWith(query)) - Number(!b.startsWith(query)) || a.localeCompare(b))
      .slice(0, 8);
    menu.innerHTML = names.map((name) => `<button type="button" class="tl-pokemon-option" role="option" aria-selected="${name === query}" data-picker-option="${esc(name)}">
      <img src="${PK.ART(dex[name])}" alt=""><span>${esc(PK.pretty(name))}</span></button>`).join("");
    menu.hidden = names.length === 0;
    input.setAttribute("aria-expanded", String(names.length > 0));
  }

  function choosePickerOption(option) {
    const menu = option.closest(".tl-pokemon-suggestions");
    const input = menu && menu.parentElement.querySelector("[data-pokemon-picker]");
    if (!input) return;
    input.value = option.dataset.pickerOption;
    updatePickerPreview(input);
    input.focus();
    closePicker(input);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ---------- Teambuilder ----------
  let team = load("pokeBuilder", []);
  while (team.length < 6) team.push("");
  team = team.slice(0, 6);

  async function teamHtml() {
    const infos = await Promise.all(team.map((s) => (s ? monInfo(s).catch(() => null) : null)));
    const slots = team.map((s, i) => {
      const inf = infos[i];
      return `<div class="tl-slot${inf ? " filled" : ""}">
        <span class="tl-slot-number">${L("Pokémon", "Pokémon")} ${i + 1}</span>
        ${inf ? `<img src="${PK.ART(inf.id)}" alt="${esc(PK.pretty(s))}">` : `<div class="tl-empty">+</div>`}
        ${pokemonPicker(`team-name-${i}`, s, { attributes: `data-slot="${i}"`, ariaLabel: L(`Pokémon voor plek ${i + 1}`, `Pokémon for slot ${i + 1}`), preview: false })}
        <div class="tl-types">${inf ? inf.types.map(PK.typeBadge).join("") : ""}</div>
      </div>`;
    }).join("");
    const members = infos.filter(Boolean);
    const reset = `<div class="tl-team-heading"><h3>${L("Jouw team", "Your team")}</h3><button class="wt-chip tl-team-reset" data-team-reset ${team.some(Boolean) ? "" : "disabled"}>${L("Team leegmaken", "Clear team")}</button></div>`;
    if (!members.length) return `<div class="tl-card">${reset}<div class="tl-slots">${slots}</div><p class="status">${L("Kies Pokémon om je team te vullen en het zwaktes-overzicht te bekijken.", "Pick Pokémon to fill your team and see its weakness overview.")}</p></div>`;

    const rows = PK.allTypes().map((a) => {
      const ms = members.map((m) => PK.mult(a, m.types));
      return { a, weak: ms.filter((x) => x > 1).length, resist: ms.filter((x) => x < 1 && x > 0).length, immune: ms.filter((x) => x === 0).length, ms };
    });
    const danger = rows.filter((r) => r.weak - r.resist - r.immune >= 2).map((r) => PK.typeBadge(r.a)).join(" ");
    const types = members.flatMap((m) => m.types);
    const uncovered = PK.allTypes().filter((d) => !types.some((t) => PK.mult(t, [d]) > 1));
    return `<div class="tl-card">${reset}<div class="tl-slots">${slots}</div></div>
      <div class="tl-card">
        <h3>${L("Zwaktes van je team", "Your team's weaknesses")}</h3>
        <div class="tl-scroll"><table class="tl-table"><thead><tr><th>${L("Aanval", "Attack")}</th>${members.map((m, i) => `<th><img src="${PK.ART(m.id)}" alt="" width="34" height="34"></th>`).join("")}<th>${L("Zwak", "Weak")}</th><th>${L("Bestand", "Resist")}</th></tr></thead>
        <tbody>${rows.map((r) => `<tr class="${r.weak - r.resist - r.immune >= 2 ? "bad" : ""}"><td>${PK.typeBadge(r.a)}</td>${r.ms.map((x) => `<td class="m${x === 0 ? "0" : x >= 4 ? "4" : x > 1 ? "2" : x < 1 ? "h" : "1"}">${x === 0 ? "0" : x === 1 ? "" : x === 0.25 ? "¼" : x === 0.5 ? "½" : "×" + x}</td>`).join("")}<td><b>${r.weak}</b></td><td><b>${r.resist + r.immune}</b></td></tr>`).join("")}</tbody></table></div>
        <p>${danger ? `<b>${L("Let op:", "Watch out:")}</b> ${L("je team is extra kwetsbaar voor", "your team is extra vulnerable to")} ${danger}` : L("Geen type waar je team extra kwetsbaar voor is.", "No type your team is especially vulnerable to.")}</p>
        <p>${uncovered.length ? `${L("Geen super effectieve aanval (via de types van je team) tegen:", "No super effective STAB coverage against:")} ${uncovered.map(PK.typeBadge).join(" ")}` : L("Je types raken alle types super effectief.", "Your types hit every type super effectively.")}</p>
      </div>`;
  }

  // ---------- Typetabel ----------
  function chartHtml() {
    const ts = PK.allTypes();
    const head = ts.map((t) => `<th style="background:${PK.TYPE_COLORS[t]}" title="${PK.typeName(t)}">${PK.typeName(t).slice(0, 3)}</th>`).join("");
    const body = ts.map((a) => `<tr><th style="background:${PK.TYPE_COLORS[a]}" title="${PK.typeName(a)}">${PK.typeName(a)}</th>${ts.map((d) => {
      const m = PK.mult(a, [d]);
      return `<td class="m${m === 0 ? "0" : m > 1 ? "2" : m < 1 ? "h" : "1"}">${m === 0 ? "0" : m > 1 ? "2" : m < 1 ? "½" : ""}</td>`;
    }).join("")}</tr>`).join("");
    const opts = (id, blank) => `<select id="${id}"><option value="">${blank}</option>${ts.map((t) => `<option value="${t}">${PK.typeName(t)}</option>`).join("")}</select>`;
    return `<div class="tl-card">
        <h3>${L("Snel opzoeken", "Quick lookup")}</h3>
        <div class="tl-row">${opts("tl-d1", L("Type 1", "Type 1"))} ${opts("tl-d2", L("Type 2 (optioneel)", "Type 2 (optional)"))}</div>
        <div id="tl-lookup" class="tl-lookup"></div>
      </div>
      <div class="tl-card"><h3>${L("Volledige tabel", "Full chart")}</h3>
        <p class="status tl-hint">${L("Rijen = aanvaller, kolommen = verdediger. 2 = super effectief, ½ = niet erg effectief, 0 = geen effect.", "Rows = attacker, columns = defender. 2 = super effective, ½ = not very effective, 0 = no effect.")}</p>
        <div class="tl-scroll"><table class="tl-chart"><thead><tr><th></th>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
  }

  // ---------- Evolutielijn ----------
  const evolutionCache = {};
  function evolutionCondition(d) {
    const conditions = [];
    if (d.trigger.name === "trade") conditions.push(L("ruilen", "trade"));
    if (d.min_level) conditions.push(`${L("vanaf level", "at level")} ${d.min_level}`);
    if (d.min_happiness) conditions.push(`${L("vriendschap", "friendship")} ≥ ${d.min_happiness}`);
    if (d.min_beauty) conditions.push(`${L("schoonheid", "beauty")} ≥ ${d.min_beauty}`);
    if (d.item) conditions.push(`${L("gebruik", "use")} ${PK.pretty(d.item.name)}`);
    if (d.held_item) conditions.push(`${L("houd vast", "hold")} ${PK.pretty(d.held_item.name)}`);
    if (d.known_move) conditions.push(`${L("kent", "knows")} ${PK.pretty(d.known_move.name)}`);
    if (d.location) conditions.push(`${L("bij", "at")} ${PK.pretty(d.location.name)}`);
    if (d.time_of_day) conditions.push(d.time_of_day === "day" ? L("overdag", "during the day") : L("’s nachts", "at night"));
    if (d.gender === 1) conditions.push(L("vrouwelijk", "female"));
    if (d.gender === 2) conditions.push(L("mannelijk", "male"));
    if (d.needs_overworld_rain) conditions.push(L("tijdens regen", "while raining"));
    if (d.turn_upside_down) conditions.push(L("houd je apparaat ondersteboven", "turn the device upside down"));
    if (d.min_affection) conditions.push(`${L("genegenheid", "affection")} ≥ ${d.min_affection}`);
    return conditions.join(" · ") || PK.pretty(d.trigger.name);
  }

  function evolutionNode(node, condition = "") {
    const name = node.species.name;
    const id = dex[name];
    const children = node.evolves_to.map((child) => {
        const details = child.evolution_details.map(evolutionCondition).join(` ${L("of", "or")} `);
        return evolutionNode(child, details);
    }).join("");
    return `<li>${condition ? `<small class="tl-evo-condition">${esc(condition)}</small>` : ""}
        <div class="tl-evo-mon">${id ? `<img src="${PK.ART(id)}" alt="">` : ""}<b>${esc(PK.pretty(name))}</b></div>
        ${children ? `<ul>${children}</ul>` : ""}</li>`;
  }

  function evolutionHtml() {
    return `<div class="tl-card"><h3>${L("Zoek een evolutielijn", "Find an evolution tree")}</h3>
        <form class="tl-row" id="ev-form"><div class="tl-control"><label for="ev-name">${L("Pokémon", "Pokémon")}</label>${pokemonPicker("ev-name", "", { placeholder: L("bijv. eevee", "e.g. eevee") })}</div>
        <button class="big-btn" type="submit">${L("Bekijk evoluties", "Show evolutions")}</button></form>
        <div id="ev-result" aria-live="polite"></div></div>`;
  }

  async function showEvolution(name) {
    const slug = slugOf(name);
    if (!dex[slug]) { $("ev-result").innerHTML = `<p class="status">${L("Kies een Pokémon uit de lijst.", "Choose a Pokémon from the list.")}</p>`; return; }
    $("ev-result").innerHTML = `<p class="status">${L("Evoluties laden...", "Loading evolutions...")}</p>`;
    try {
        if (!evolutionCache[slug]) {
          const species = await getJSON(`${API}/pokemon-species/${dex[slug]}`);
          evolutionCache[slug] = await getJSON(species.evolution_chain.url);
        }
        $("ev-result").innerHTML = `<div class="tl-evo-tree"><ul>${evolutionNode(evolutionCache[slug].chain)}</ul></div>`;
    } catch (error) {
        console.error("Could not load evolution chain:", error);
        $("ev-result").innerHTML = `<p class="status">${L("De evolutielijn kon niet worden geladen.", "Could not load the evolution tree.")}</p>`;
    }
  }

  // ---------- Aanvallen zoeken ----------
  let moveList = null;
  let moveResultsRequest = 0;
  let moveRequest = 0;
  const moveCache = {};
  function moveHtml() {
    return `<div class="tl-card"><h3>${L("Zoek een aanval", "Search moves")}</h3>
        <label>${L("Naam van de aanval", "Move name")}<input id="move-search" type="search" placeholder="${L("bijv. thunderbolt", "e.g. thunderbolt")}" autocomplete="off"></label>
        <div id="move-results" class="tl-move-results" aria-live="polite">${L("Aanvallen laden...", "Loading moves...")}</div>
        <div id="move-detail"></div></div>`;
  }

  async function renderMoveResults() {
    const request = ++moveResultsRequest;
    const host = $("move-results");
    if (!host) return;
    try {
        if (!moveList) moveList = (await getJSON(`${API}/move?limit=2000`)).results;
        if (request !== moveResultsRequest || !host.isConnected) return;
        const query = $("move-search").value.trim().toLowerCase().replace(/\s+/g, "-");
        const found = moveList.filter((m) => !query || m.name.includes(query)).slice(0, 40);
        host.innerHTML = found.length
          ? found.map((m) => `<button class="wt-chip" data-move="${esc(m.name)}">${esc(PK.pretty(m.name))}</button>`).join("")
          : `<p class="status">${L("Geen aanvallen gevonden.", "No moves found.")}</p>`;
    } catch (error) {
        console.error("Could not load moves:", error);
        if (request === moveResultsRequest && host.isConnected) host.innerHTML = `<p class="status">${L("De aanvallen konden niet worden geladen.", "Could not load moves.")}</p>`;
    }
  }

  async function showMove(name) {
    const request = ++moveRequest;
    const host = $("move-detail");
    host.innerHTML = `<p class="status">${L("Aanval laden...", "Loading move...")}</p>`;
    try {
        const move = moveCache[name] || (moveCache[name] = await getJSON(`${API}/move/${name}`));
        const effect = move.effect_entries.find((e) => e.language.name === (I18N.lang === "nl" ? "nl" : "en")) ||
          move.effect_entries.find((e) => e.language.name === "en");
        const labels = `${L("Type", "Type")}: ${PK.typeName(move.type.name)} · ${L("Categorie", "Category")}: ${L(move.damage_class.name === "physical" ? "fysiek" : move.damage_class.name === "special" ? "speciaal" : "status", PK.pretty(move.damage_class.name))} · ${L("Kracht", "Power")}: ${move.power ?? "—"} · ${L("Nauwkeurigheid", "Accuracy")}: ${move.accuracy == null ? "—" : move.accuracy + "%"}`;
        let text = effect ? effect.short_effect.replace(/\$effect_chance/g, move.effect_chance ?? "") : L("Geen uitleg beschikbaar.", "No description available.");
        if (effect && I18N.lang === "nl" && effect.language.name !== "nl") text = await I18N.translate(text, "en", "nl");
        if (request !== moveRequest) return;
        host.innerHTML = `<div class="tl-card"><h4>${esc(PK.pretty(move.name))}</h4><p>${esc(labels)}</p><p>${esc(text)}</p></div>`;
    } catch (error) {
        console.error("Could not load move details:", error);
        if (request === moveRequest) host.innerHTML = `<p class="status">${L("De aanvalsdetails konden niet worden geladen.", "Could not load move details.")}</p>`;
    }
  }

  // ---------- TM-compatibiliteit ----------
  function tmHtml() {
    return `<div class="tl-card"><h3>${L("Kan deze Pokémon de TM leren?", "Can this Pokémon learn the TM?")}</h3>
        <form class="tl-row" id="tm-form"><div class="tl-control"><label for="tm-name">${L("Pokémon", "Pokémon")}</label>${pokemonPicker("tm-name", "", { placeholder: L("bijv. pikachu", "e.g. pikachu") })}</div>
        <label>${L("Gameversie", "Game version")}<select id="tm-version"><option value="">${L("Alle versies", "All versions")}</option></select></label>
        <button class="big-btn" type="submit">${L("Zoek TM's", "Find TMs")}</button></form>
        <div id="tm-result" aria-live="polite"></div></div>`;
  }

  async function showTMs(name, version) {
    const slug = slugOf(name);
    if (!dex[slug]) { $("tm-result").innerHTML = `<p class="status">${L("Kies een Pokémon uit de lijst.", "Choose a Pokémon from the list.")}</p>`; return; }
    $("tm-result").innerHTML = `<p class="status">${L("Compatibiliteit laden...", "Loading compatibility...")}</p>`;
    try {
        const pokemon = await getJSON(`${API}/pokemon/${dex[slug]}`);
        const all = pokemon.moves;
        const groups = [...new Set(all.flatMap((m) => m.version_group_details
          .filter((d) => d.move_learn_method.name === "machine").map((d) => d.version_group.name)))].sort();
        const select = $("tm-version");
        const old = version || select.value;
        select.innerHTML = `<option value="">${L("Alle versies", "All versions")}</option>${groups.map((g) => `<option value="${esc(g)}">${esc(PK.pretty(g))}</option>`).join("")}`;
        select.value = groups.includes(old) ? old : "";
        const available = all.filter((m) => m.version_group_details.some((d) =>
          d.move_learn_method.name === "machine" && (!select.value || d.version_group.name === select.value)
        ));
        $("tm-result").innerHTML = `<p class="status">${available.length} ${L("TM-aanvallen", "machine moves")}</p>
          <div class="tl-move-results">${available.map((m) => `<span class="wt-chip">${esc(PK.pretty(m.move.name))}</span>`).join("")}</div>`;
    } catch (error) {
        console.error("Could not load TM compatibility:", error);
        $("tm-result").innerHTML = `<p class="status">${L("TM-compatibiliteit kon niet worden geladen.", "Could not load TM compatibility.")}</p>`;
    }
  }

  // ---------- Vangkans ----------
  function catchHtml() {
    return `<div class="tl-card"><h3>${L("Vangkans berekenen", "Calculate catch chance")}</h3>
        <p class="tl-hint">${L("Schatting op basis van de basisvangstkans en de gekozen modifiers. Spelversies kunnen aanvullende regels hebben.", "Estimate based on the base catch rate and selected modifiers. Individual games may have additional rules.")}</p>
        <form class="tl-form tl-row" id="catch-form">
          <div class="tl-control"><label for="catch-name">${L("Pokémon", "Pokémon")}</label>${pokemonPicker("catch-name", "", { placeholder: L("bijv. pikachu", "e.g. pikachu") })}</div>
          <label>${L("Maximale HP", "Maximum HP")}<input id="catch-max" type="number" min="1" value="100" required></label>
          <label>${L("Huidige HP", "Current HP")}<input id="catch-current" type="number" min="1" value="1" required></label>
          <label>${L("Pokébal", "Poké Ball")}<select id="catch-ball"><option value="1">Pokébal · ×1</option><option value="1.5">Superbal · ×1,5</option><option value="2">Hyperbal · ×2</option><option value="3.5">Nachtbal · ×3,5</option><option value="5">Snelbal (eerste beurt) · ×5</option></select></label>
          <label>${L("Status", "Status")}<select id="catch-status"><option value="1">${L("Geen", "None")}</option><option value="2">${L("Slaap of bevriezing", "Sleep or freeze")}</option><option value="1.5">${L("Andere status", "Other status")}</option></select></label>
          <button class="big-btn" type="submit">${L("Bereken kans", "Calculate chance")}</button>
        </form><div id="catch-result" aria-live="polite"></div></div>`;
  }

  async function calculateCatch(e) {
    e.preventDefault();
    const slug = slugOf($("catch-name").value);
    if (!dex[slug]) { $("catch-result").innerHTML = `<p class="status">${L("Kies een Pokémon uit de lijst.", "Choose a Pokémon from the list.")}</p>`; return; }
    const max = Number($("catch-max").value), current = Number($("catch-current").value);
    if (!max || current < 1 || current > max) { $("catch-result").innerHTML = `<p class="status">${L("Vul geldige HP-waarden in.", "Enter valid HP values.")}</p>`; return; }
    $("catch-result").innerHTML = `<p class="status">${L("Vangkans laden...", "Calculating...")}</p>`;
    try {
        const species = await getJSON(`${API}/pokemon-species/${dex[slug]}`);
        const ball = Number($("catch-ball").value), status = Number($("catch-status").value);
        const a = Math.floor(((3 * max - 2 * current) * species.capture_rate * ball * status) / (3 * max));
        const shake = a >= 255 ? 1 : a <= 0 ? 0 : Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / a))) / 65536;
        const chance = Math.pow(shake, 4);
        $("catch-result").innerHTML = `<p class="tl-catch-result">${esc(PK.pretty(slug))}: <b>${(chance * 100).toFixed(2)}%</b> · ${L("basisvangstkans", "base catch rate")}: ${species.capture_rate}</p>`;
    } catch (error) {
        console.error("Could not calculate catch chance:", error);
        $("catch-result").innerHTML = `<p class="status">${L("De vangkans kon niet worden berekend.", "Could not calculate the catch chance.")}</p>`;
    }
  }

  function updateLookup() {
    const defs = [$("tl-d1").value, $("tl-d2").value].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    const box = $("tl-lookup");
    if (!defs.length) { box.innerHTML = ""; return; }
    const by = {};
    PK.allTypes().forEach((a) => { (by[PK.mult(a, defs)] ||= []).push(a); });
    const line = (m, label) => by[m] ? `<p><b>${label}</b> ${by[m].map(PK.typeBadge).join(" ")}</p>` : "";
    box.innerHTML = line(4, "×4") + line(2, "×2") + line(0.5, "×½") + line(0.25, "×¼") + line(0, L("Geen effect (×0)", "No effect (×0)"));
  }

  // ---------- Shiny-teller ----------
  const ODDS = [
    [4096, "Normaal · generatie 6 en later · 1 op 4096", "Normal · generation 6 onward · 1 in 4096"],
    [8192, "Normaal · generatie 2 t/m 5 · 1 op 8192", "Normal · generations 2–5 · 1 in 8192"],
    [1365, "Normaal + Shiny Charm (generatie 6+) · 1 op 1365", "Normal + Shiny Charm (generation 6+) · 1 in 1365"],
    [683, "Masuda-methode · 1 op 683", "Masuda method · 1 in 683"],
    [512, "Masuda + Shiny Charm · 1 op 512", "Masuda + Shiny Charm · 1 in 512"],
    [1024, "Generatie 9 · Shiny Power Lv. 3-sandwich, zonder Charm · 1 op 1024", "Generation 9 · Shiny Power Lv. 3 sandwich, no Charm · 1 in 1024"],
  ];
  let hunts = load("pokeShiny", []);
  const saveHunts = () => store("pokeShiny", hunts);

  function shinyHtml() {
    const cards = hunts.map((h, i) => {
      const p = (1 - Math.pow(1 - 1 / h.odds, h.count)) * 100;
      const pLabel = p > 0 && p < 0.1 ? p.toFixed(3) : p.toFixed(1);
      return `<div class="tl-hunt">
        <div class="tl-hunt-art"><img src="${h.id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${h.id}.png` : ""}" alt="${esc(PK.pretty(h.name))}"></div>
        <div class="tl-hunt-body">
          <div class="tl-hunt-heading"><h4>${esc(PK.pretty(h.name))}</h4><span class="tl-odds">${L("Kans per ontmoeting", "Odds per encounter")}: <b>1 op ${h.odds}</b></span></div>
          <div class="tl-hunt-stats">
            <div><small>${L("Ontmoetingen", "Encounters")}</small><strong class="tl-count">${h.count}</strong></div>
            <div><small>${L("Kans op minstens 1 shiny tot nu toe", "Chance of at least 1 shiny so far")}</small><strong class="tl-prob">${pLabel}%</strong></div>
          </div>
          <div class="tl-progress" role="progressbar" aria-label="${L("Kans op minstens 1 shiny", "Chance of at least 1 shiny")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, p).toFixed(1)}"><i style="width:${Math.min(100, p).toFixed(1)}%"></i></div>
          <p class="tl-hint">${L("Dit is een kansberekening, geen garantie. Je kunt eerder of later een shiny vinden.", "This is a probability, not a guarantee. You may find a shiny earlier or later.")}</p>
          <div class="tl-btns">
            <button data-hunt="${i}" data-d="1">${L("+1 ontmoeting", "+1 encounter")}</button>
            <button data-hunt="${i}" data-d="10">${L("+10 ontmoetingen", "+10 encounters")}</button>
            <button data-hunt="${i}" data-d="-1" title="${L("Eén ontmoeting eraf (bij een foutje)", "Remove one encounter (if you slipped)")}">${L("−1", "−1")}</button>
            <button data-hunt="${i}" data-d="reset" title="${L("Teller terug naar 0", "Reset counter to 0")}">↺ ${L("Opnieuw", "Reset")}</button>
            <button data-hunt="${i}" data-d="del" title="${L("Deze jacht verwijderen", "Remove this hunt")}">${L("Verwijderen", "Remove")}</button></div></div></div>`;
    }).join("");
    return `<div class="tl-card"><h3>${L("Shiny-teller", "Shiny counter")}</h3>
      <p class="tl-help">${L("Vul je Pokémon en shiny-kans in. Tel elke ontmoeting (gevangen, verslagen of weggelopen); de teller berekent de kans dat je tot nu toe minstens één shiny had kunnen vinden.", "Choose your Pokémon and shiny odds. Count each encounter (caught, defeated or fled); the counter calculates the chance of finding at least one shiny by now.")}</p>
      <p class="tl-hint">${L("De kans per ontmoeting is niet hetzelfde als de totale kans. Bij 0 ontmoetingen is de totale kans 0%.", "Odds per encounter are not the same as your overall chance. At 0 encounters, the overall chance is 0%.")}</p></div>
      <div class="tl-card"><h3>${L("Nieuwe jacht starten", "Start a new hunt")}</h3>
      <div class="tl-form tl-row">
        <div class="tl-control"><label for="sh-name">${L("Welke Pokémon?", "Which Pokémon?")}</label>${pokemonPicker("sh-name", "", { placeholder: L("bijv. pikachu", "e.g. pikachu") })}</div>
        <label>${L("Kans in jouw spel en methode", "Odds for your game and method")}<select id="sh-odds">${ODDS.map(([o, nl, en]) => `<option value="${o}">${L(nl, en)}</option>`).join("")}</select></label>
        <button class="big-btn" id="sh-add">${L("Jacht toevoegen", "Add hunt")}</button></div>
      <p class="tl-hint">${L("Weet je de kans niet? Controleer de regels van je game en methode voordat je kiest.", "Not sure about the odds? Check your game's rules and method before choosing.")}</p></div>
      ${cards || `<p class="status">${L("Nog geen jachten. Start hierboven je eerste jacht.", "No hunts yet. Start your first hunt above.")}</p>`}`;
  }

  // ---------- Hoofdweergave ----------
  let token = 0;
  async function render() {
    const my = ++token;
    const body = {
      team: teamHtml, chart: async () => chartHtml(), shiny: async () => shinyHtml(),
      evolution: async () => evolutionHtml(), moves: async () => moveHtml(),
      tm: async () => tmHtml(), catch: async () => catchHtml(),
    }[section];
    const html = await body();
    if (my !== token) return;
    $("tools-body").innerHTML = chips() + html;
    if (section === "chart") updateLookup();
    if (section === "moves") renderMoveResults();
  }

  const view = $("view-tools");
  view.addEventListener("click", (e) => {
    const t = e.target;
    const pickerOption = t.closest("[data-picker-option]");
    if (pickerOption) return choosePickerOption(pickerOption);
    const sec = t.closest("[data-sec]");
    if (sec) { section = sec.dataset.sec; store("toolsSection", section); return render(); }
    if (t.closest("[data-team-reset]")) {
      team = Array(6).fill("");
      store("pokeBuilder", team);
      return render();
    }
    const h = t.closest("[data-hunt]");
    if (h) {
      const i = Number(h.dataset.hunt), d = h.dataset.d;
      if (d === "del") hunts.splice(i, 1);
      else if (d === "reset") hunts[i].count = 0;
      else hunts[i].count = Math.max(0, hunts[i].count + Number(d));
      saveHunts();
      return render();
    }
    if (t.closest("#sh-add")) {
      const slug = slugOf($("sh-name").value);
      if (!slug || !dex[slug]) { $("sh-name").focus(); $("sh-name").classList.add("bad"); return; }
      hunts.push({ name: slug, id: dex[slug], odds: Number($("sh-odds").value), count: 0 });
      saveHunts();
      return render();
    }
    const move = t.closest("[data-move]");
    if (move) return showMove(move.dataset.move);
  });
  view.addEventListener("mousedown", (e) => {
    if (e.target.closest("[data-picker-option]")) e.preventDefault();
  });
  view.addEventListener("focusin", (e) => {
    if (e.target.matches("[data-pokemon-picker]")) {
      updatePickerPreview(e.target);
      renderPickerOptions(e.target);
    }
  });
  view.addEventListener("focusout", (e) => {
    if (!e.target.matches("[data-pokemon-picker]")) return;
    const input = e.target;
    setTimeout(() => {
      if (!input.closest(".tl-pokemon-field").contains(document.activeElement)) closePicker(input);
    }, 0);
  });
  view.addEventListener("change", (e) => {
    const slot = e.target.closest("[data-slot]");
    if (slot) {
      const slug = slugOf(slot.value);
      team[Number(slot.dataset.slot)] = !slug || dex[slug] ? slug : "";
      store("pokeBuilder", team);
      return render();
    }
    if (e.target.id === "tl-d1" || e.target.id === "tl-d2") updateLookup();
    if (e.target.id === "tm-version" && $("tm-name").value) showTMs($("tm-name").value, e.target.value);
  });
  view.addEventListener("input", (e) => {
    if (e.target.id === "move-search") renderMoveResults();
    if (e.target.matches("[data-pokemon-picker]")) {
      updatePickerPreview(e.target);
      renderPickerOptions(e.target);
    }
  });
  view.addEventListener("submit", (e) => {
    if (e.target.id === "ev-form") { e.preventDefault(); showEvolution($("ev-name").value); }
    if (e.target.id === "tm-form") { e.preventDefault(); showTMs($("tm-name").value, $("tm-version").value); }
    if (e.target.id === "catch-form") calculateCatch(e);
  });
  view.addEventListener("keydown", (e) => {
    if (e.target.matches("[data-pokemon-picker]")) {
      const input = e.target;
      const menu = $(input.getAttribute("aria-controls"));
      const options = menu ? [...menu.querySelectorAll("[data-picker-option]")] : [];
      if (e.key === "ArrowDown" && options.length) {
        e.preventDefault();
        options[0].focus();
      } else if (e.key === "Enter" && input.hasAttribute("data-slot") && dex[slugOf(input.value)]) {
        e.preventDefault();
        input.value = slugOf(input.value);
        closePicker(input);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (e.key === "Enter" && dex[slugOf(input.value)]) {
        closePicker(input);
      } else if (e.key === "Enter" && options.length && !dex[slugOf(input.value)]) {
        e.preventDefault();
        choosePickerOption(options[0]);
      } else if (e.key === "Escape") {
        closePicker(input);
      }
    } else if (e.target.matches("[data-picker-option]")) {
      const options = [...e.target.closest(".tl-pokemon-suggestions").querySelectorAll("[data-picker-option]")];
      const index = options.indexOf(e.target);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        options[(index + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].focus();
      } else if (e.key === "Escape") {
        const input = e.target.closest(".tl-pokemon-field").querySelector("[data-pokemon-picker]");
        input.focus();
        closePicker(input);
      }
    }
    if (e.key === "Enter" && e.target.id === "sh-name") $("sh-add").click();
  });

  window.Tools = { open(sec) { if (SECTIONS.some((s) => s[0] === sec)) { section = sec; store("toolsSection", sec); } NAV.go("tools"); } };
  document.querySelector('.tab[data-view="tools"]').addEventListener("click", render);
  document.addEventListener("langchange", () => { if (!view.hidden) render(); });
})();
