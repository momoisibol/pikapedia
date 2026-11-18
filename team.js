// Walkthrough-tabblad "Team advies": starter-advies en een Pokémon-team-bouwer.
(() => {
  const L = (nl, en) => I18N.L(nl, en);
  const API = "https://pokeapi.co/api/v2";
  const MINDEX = { 1: 1, 2: 152, 3: 252, 4: 387, 5: 494, 6: 650, 7: 722, 8: 810, 9: 906 };
  const MAXDEX = { 1: 151, 2: 251, 3: 386, 4: 493, 5: 649, 6: 721, 7: 809, 8: 905, 9: 1025 };
  const REGIONS = { 1: "Kanto", 2: "Johto", 3: "Hoenn", 4: "Sinnoh", 5: "Unova", 6: "Kalos", 7: "Alola", 8: "Galar", 9: "Paldea" };
  const esc = PK.esc;

  const ST = (pick, nl, en) => ({ pick, nl, en });
  const STARTER = {
    rb: ST(["squirtle", "bulbasaur"], "Kies <b>Squirtle</b> of <b>Bulbasaur</b>. Water en Gras zijn sterk tegen Brock en Misty, en je hebt veel keuze aan Vuur-Pokémon later. Charmander is mooi maar heeft het in het begin moeilijker.", "Pick <b>Squirtle</b> or <b>Bulbasaur</b>. Water and Grass are strong against Brock and Misty. Charmander is great later but struggles early on."),
    yellow: ST(["pikachu", "bulbasaur"], "Je krijgt <b>Pikachu</b> automatisch. Haal zo snel mogelijk <b>Bulbasaur</b> (Cerulean City) als extra Pokémon voor Brock; later volgen Charmander en Squirtle.", "You get <b>Pikachu</b> automatically. Get <b>Bulbasaur</b> (Cerulean City) quickly as a helper for Brock; Charmander and Squirtle follow later."),
    gs: ST(["cyndaquil", "totodile"], "<b>Cyndaquil</b> is sterk tegen Bugsy, Pryce en Jasmine. <b>Totodile</b> is een stevige, evenwichtige keuze. Chikorita is de moeilijkste starter.", "<b>Cyndaquil</b> is strong against Bugsy, Pryce and Jasmine. <b>Totodile</b> is a solid, balanced choice. Chikorita is the hardest starter."),
    crystal: ST(["cyndaquil", "totodile"], "<b>Cyndaquil</b> of <b>Totodile</b>. Beide zijn sterk door het hele spel.", "<b>Cyndaquil</b> or <b>Totodile</b>. Both are strong throughout the game."),
    hgss: ST(["cyndaquil", "totodile"], "<b>Cyndaquil</b> is het beste tegen veel Gyms; <b>Totodile</b> is een goede alleskunner.", "<b>Cyndaquil</b> is best against many Gyms; <b>Totodile</b> is a good all-rounder."),
    rs: ST(["mudkip", "torchic"], "<b>Mudkip</b> (Water/Grond) heeft maar één zwakte en wordt Swampert, de sterkste starter. <b>Torchic</b> is sterk maar moeilijker bij Gym 1.", "<b>Mudkip</b> (Water/Ground) has a single weakness and becomes Swampert, the strongest starter. <b>Torchic</b> is strong but harder at Gym 1."),
    emerald: ST(["mudkip", "torchic"], "<b>Mudkip</b> is ideaal tegen de vele Water- en Rock-gevechten. <b>Torchic</b> wordt Blaziken, krachtig in de eindfase.", "<b>Mudkip</b> is ideal against the many Water and Rock battles. <b>Torchic</b> becomes Blaziken, powerful late in the game."),
    oras: ST(["mudkip", "treecko"], "<b>Mudkip</b> is veilig door het hele spel. <b>Treecko</b> is snel en heeft Mega Sceptile.", "<b>Mudkip</b> is safe throughout the game. <b>Treecko</b> is fast and gets Mega Sceptile."),
    frlg: ST(["squirtle", "bulbasaur"], "<b>Squirtle</b> of <b>Bulbasaur</b> maken de eerste Gyms makkelijk. Charmander kan later pas.", "<b>Squirtle</b> or <b>Bulbasaur</b> make the first Gyms easy. Charmander shines later."),
    dp: ST(["chimchar", "piplup"], "<b>Chimchar</b> (Vuur/Vechten) is sterk en snel. <b>Piplup</b> (Water/Staal) is een veilige keuze met weinig zwaktes.", "<b>Chimchar</b> (Fire/Fighting) is strong and fast. <b>Piplup</b> (Water/Steel) is a safe pick with few weaknesses."),
    platinum: ST(["chimchar", "piplup"], "<b>Chimchar</b> is lekker aanvallend, <b>Piplup</b> is betrouwbaar.", "<b>Chimchar</b> is nicely offensive, <b>Piplup</b> is reliable."),
    bdsp: ST(["chimchar", "piplup"], "<b>Chimchar</b> en <b>Piplup</b> zijn beide uitstekend; Turtwig is de moeilijkste.", "<b>Chimchar</b> and <b>Piplup</b> are both excellent; Turtwig is the hardest."),
    bw: ST(["tepig", "oshawott"], "<b>Tepig</b> wordt Emboar (Vuur/Vechten) en is sterk bij veel Gyms. <b>Oshawott</b> is evenwichtig. Snivy is traag.", "<b>Tepig</b> becomes Emboar (Fire/Fighting) and handles many Gyms. <b>Oshawott</b> is balanced. Snivy is slow."),
    bw2: ST(["tepig", "oshawott"], "<b>Tepig</b> of <b>Oshawott</b>; kies de een waar je team ruimte voor heeft.", "<b>Tepig</b> or <b>Oshawott</b>; pick whichever fits your team."),
    xy: ST(["froakie", "fennekin"], "<b>Froakie</b> wordt Greninja, een van de beste starters. <b>Fennekin</b> is sterk tegen Viola en Ramos.", "<b>Froakie</b> becomes Greninja, one of the best starters. <b>Fennekin</b> is strong against Viola and Ramos."),
    sm: ST(["litten", "popplio"], "<b>Litten</b> (Incineroar) is krachtig; <b>Popplio</b> (Primarina) is veilig en sterk tegen Totems.", "<b>Litten</b> (Incineroar) is powerful; <b>Popplio</b> (Primarina) is safe and strong against Totems."),
    usum: ST(["litten", "popplio"], "<b>Litten</b> of <b>Popplio</b>; Rowlet is leuk maar heeft het moeilijker.", "<b>Litten</b> or <b>Popplio</b>; Rowlet is fun but has a harder time."),
    lgpe: ST(["pikachu", "eevee"], "Je partner staat vast: <b>Pikachu</b> of <b>Eevee</b>. Eevee is iets sterker door zijn hoge stats.", "Your partner is fixed: <b>Pikachu</b> or <b>Eevee</b>. Eevee is slightly stronger thanks to higher stats."),
    swsh: ST(["scorbunny", "sobble"], "<b>Scorbunny</b> (Cinderace) is snel en krachtig. <b>Sobble</b> is betrouwbaar. Grookey is moeilijker tegen sommige Gyms.", "<b>Scorbunny</b> (Cinderace) is fast and powerful. <b>Sobble</b> is dependable. Grookey is harder against some Gyms."),
    pla: ST(["cyndaquil", "oshawott"], "<b>Cyndaquil</b> (Hisuian Typhlosion) is een sterke Vuur/Spook-aanvaller. <b>Oshawott</b> is evenwichtig.", "<b>Cyndaquil</b> (Hisuian Typhlosion) is a strong Fire/Ghost attacker. <b>Oshawott</b> is balanced."),
    sv: ST(["fuecoco", "quaxly"], "<b>Fuecoco</b> is sterk tegen Katy en Brassius, de eerste Gyms. <b>Quaxly</b> is een goede alleskunner.", "<b>Fuecoco</b> is strong against Katy and Brassius, the first Gyms. <b>Quaxly</b> is a great all-rounder."),
    plza: ST(["tepig", "totodile"], "Kies <b>Tepig</b> of <b>Totodile</b>; Chikorita is moeilijker.", "Pick <b>Tepig</b> or <b>Totodile</b>; Chikorita is harder."),
  };

  let dex = null;
  const cache = new Map();
  const getMon = async (id) => {
    if (!cache.has(id)) {
      cache.set(id, fetch(`${API}/pokemon/${id}`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((p) => ({
          id, name: p.species.name,
          types: p.types.map((t) => t.type.name),
          bst: p.stats.reduce((s, x) => s + x.base_stat, 0),
        }))
        .catch((error) => {
          cache.delete(id);
          throw error;
        }));
    }
    return cache.get(id);
  };

  const allowed = (gen) => PK.allTypes().filter((t) => !(t === "fairy" && gen < 6) && !(t === "steel" && gen < 2) && !(t === "dark" && gen < 2));

  function combos(arr, k) {
    const out = [];
    (function rec(s, c) {
      if (c.length === k) return void out.push([...c]);
      for (let i = s; i < arr.length; i++) { c.push(arr[i]); rec(i + 1, c); c.pop(); }
    })(0, []);
    return out;
  }

  function analyse(team, types) {
    const covered = new Set();
    team.forEach((m) => m.types.forEach((t) => PK.superVs(t).forEach((d) => covered.add(d))));
    const weak = {};
    types.forEach((t) => (weak[t] = team.filter((m) => PK.mult(t, m.types) > 1).length));
    const resistedBy = (t) => team.some((m) => PK.mult(t, m.types) < 1);
    return { covered, weak, resistedBy };
  }

  function score(team, types) {
    const a = analyse(team, types);
    let s = team.reduce((x, m) => x + m.bst, 0) / 15 + 4 * [...a.covered].filter((t) => types.includes(t)).length;
    types.forEach((t) => {
      if (a.weak[t] >= 3) s -= 8 * (a.weak[t] - 2);
      if (a.resistedBy(t)) s += 1.5;
    });
    return s;
  }

  function bestTeam(mons, types) {
    if (mons.length <= 6) return mons;
    const pool = [...mons].sort((a, b) => b.bst - a.bst).slice(0, 14);
    let best = null, bs = -Infinity;
    combos(pool, 6).forEach((c) => { const s = score(c, types); if (s > bs) { bs = s; best = c; } });
    return best;
  }

  const monCard = (m) => `
    <div class="tm-mon"><img alt="" src="${PK.ART(m.id)}"><b>${esc(PK.pretty(m.name))}</b>
      <div class="types">${m.types.map(PK.typeBadge).join("")}</div><small>BST ${m.bst}</small></div>`;

  function advice(mons, game) {
    const gen = game.gen;
    const types = allowed(gen);
    if (!mons.length) return `<p class="status">${L("Voeg Pokémon toe om advies te krijgen.", "Add Pokémon to get advice.")}</p>`;
    const team = bestTeam(mons, types);
    const bench = mons.filter((m) => !team.includes(m));
    const a = analyse(team, types);
    const weakTypes = types.filter((t) => a.weak[t] >= 2).sort((x, y) => a.weak[y] - a.weak[x]);
    const missing = types.filter((t) => !a.covered.has(t));

    const sugg = types.map((t) => {
      const cover = PK.superVs(t).filter((d) => missing.includes(d)).length;
      const res = weakTypes.filter((w) => PK.mult(w, [t]) < 1).length;
      return { t, v: cover * 2 + res * 2 };
    }).filter((x) => x.v > 0).sort((x, y) => y.v - x.v).slice(0, 3);

    const b = window.BATTLES[game.id];
    const bosses = b ? [...b.gyms, ...b.e4, ...(b.champion ? [b.champion] : [])].filter((x) => PK.TYPE_COLORS[x.type]) : [];
    const danger = bosses.filter((x) => weakTypes.includes(x.type) || PK.superVs(x.type).some((d) => team.filter((m) => m.types.includes(d)).length >= 2));
    const good = bosses.filter((x) => team.some((m) => m.types.some((t) => PK.superVs(t).includes(x.type))));

    const name = (x) => esc(x.name || x.leader);
    return `
      <h4 class="bt-h">${L("Jouw aanbevolen team", "Your recommended team")} (${team.length}/6)</h4>
      <div class="tm-team">${team.map(monCard).join("")}</div>
      ${bench.length ? `<details class="tm-details"><summary>${L(`Reserve (${bench.length})`, `On the bench (${bench.length})`)}</summary><p>${bench.map((m) => esc(PK.pretty(m.name))).join(", ")}</p></details>` : ""}
      <details class="tm-details">
        <summary>${L("Type-overzicht", "Type overview")}</summary>
        <div class="tm-cols">
          <div class="bt-tip"><b>${L("Gedekte types", "Covered types")}</b><br>${[...a.covered].filter((t) => types.includes(t)).map(PK.typeBadge).join(" ") || "–"}
            ${missing.length ? `<br><br><b>${L("Geen super effectieve aanval tegen", "No super-effective moves against")}</b><br>${missing.map(PK.typeBadge).join(" ")}` : `<br><br>${L("Je team raakt alle types super effectief.", "Your team hits every type super effectively.")}`}</div>
          <div class="bt-tip"><b>${L("Gedeelde zwaktes", "Shared weaknesses")}</b><br>${weakTypes.length ? weakTypes.map((t) => `${PK.typeBadge(t)} ×${a.weak[t]}`).join(" ") : L("Geen type waar meerdere Pokémon zwak voor zijn.", "No type that several Pokémon are weak to.")}</div>
        </div>
        ${sugg.length ? `<div class="bt-tip"><b>${L("Overweeg een Pokémon van het type", "Consider a Pokémon of type")}</b> ${sugg.map((s) => PK.typeBadge(s.t)).join(" ")}<br>${L("Die kan ontbrekende types dekken en/of je zwaktes opvangen.", "It can cover missing types and/or help with shared weaknesses.")}</div>` : ""}
      </details>
      ${bosses.length ? `<details class="tm-details">
        <summary>${L("Gym- en kampioenmatch-ups", "Gym and champion match-ups")}</summary>
        <div class="tm-cols">
          <div class="bt-tip"><b>${L("Sterk tegen", "Strong against")}</b><br>${good.map((x) => `${name(x)} ${PK.typeBadge(x.type)}`).join("<br>") || "–"}</div>
          <div class="bt-tip"><b>${L("Let op bij", "Be careful with")}</b><br>${danger.map((x) => `${name(x)} ${PK.typeBadge(x.type)}`).join("<br>") || "–"}</div>
        </div>
      </details>` : ""}
      <p class="wt-note">${L("Advies op basis van basisstats (BST), type-dekking en gedeelde zwaktes. Kies bij voorkeur de uiteindelijke evolutie.", "Advice is based on base stats (BST), type coverage and shared weaknesses. Prefer final evolutions.")}</p>`;
  }

  const KANTO = ["bulbasaur", "charmander", "squirtle"];
  const TRIOS = {
    rb: KANTO, frlg: KANTO, yellow: ["pikachu", ...KANTO],
    gs: ["chikorita", "cyndaquil", "totodile"], crystal: ["chikorita", "cyndaquil", "totodile"], hgss: ["chikorita", "cyndaquil", "totodile"],
    rs: ["treecko", "torchic", "mudkip"], emerald: ["treecko", "torchic", "mudkip"], oras: ["treecko", "torchic", "mudkip"],
    dp: ["turtwig", "chimchar", "piplup"], platinum: ["turtwig", "chimchar", "piplup"], bdsp: ["turtwig", "chimchar", "piplup"],
    bw: ["snivy", "tepig", "oshawott"], bw2: ["snivy", "tepig", "oshawott"],
    xy: ["chespin", "fennekin", "froakie"], sm: ["rowlet", "litten", "popplio"], usum: ["rowlet", "litten", "popplio"],
    lgpe: ["pikachu", "eevee"], swsh: ["grookey", "scorbunny", "sobble"], pla: ["rowlet", "cyndaquil", "oshawott"],
    sv: ["sprigatito", "fuecoco", "quaxly"], plza: ["chikorita", "tepig", "totodile"],
  };

  const starterHtml = (game) => {
    const s = STARTER[game.id];
    if (!s) return "";
    const trio = TRIOS[game.id] || s.pick;
    return `
      <h3 class="bt-h">${L("Welke starter kies je?", "Which starter should you pick?")}</h3>
      <div class="bt-card"><div class="tm-starters">${trio.map((p) => `<div class="mon${s.pick.includes(p) ? " rec" : ""}"><img data-mon="${p}" alt="${PK.pretty(p)}"><b>${PK.pretty(p)}</b>${s.pick.includes(p) ? `<small>${L("Aanbevolen", "Recommended")}</small>` : ""}</div>`).join("")}</div>
      <p class="bt-tip">${L(s.nl, s.en)}</p></div>`;
  };

  function html(game) {
    return `
      ${starterHtml(game)}
      <h3 class="bt-h">${L("Team-bouwer", "Team builder")}</h3>
      <section class="tm-picker">
        <p class="tm-instructions">${L("Kies een generatie en klik Pokémon aan om ze toe te voegen. Gebruik zoeken om snel een Pokémon te vinden.", "Choose a generation and click Pokémon to add them. Use search to find one quickly.")}</p>
        <div class="tm-picker-controls">
          <label>${L("Generatie", "Generation")}
            <select id="tm-gen">${Object.keys(MINDEX).map((gen) => `<option value="${gen}"${Number(gen) === game.gen ? " selected" : ""}>${L("Generatie", "Generation")} ${gen} · ${REGIONS[gen]}</option>`).join("")}</select>
          </label>
          <label class="tm-search-label">${L("Zoeken", "Search")}
            <input id="tm-q" type="search" placeholder="${L("Zoek op naam of nummer...", "Search by name or number...")}" autocomplete="off">
          </label>
        </div>
        <div class="tm-picker-summary"><b id="tm-count">0/6</b><span id="tm-picker-hint"></span><button class="tm-reset" id="tm-clear" type="button">${L("Team leegmaken", "Reset team")}</button></div>
        <div id="tm-picker-list" class="tm-picker-list"></div>
      </section>
      <section class="tm-selected-panel">
        <h4 class="bt-h">${L("Jouw selectie", "Your selection")}</h4>
        <div id="tm-owned" class="tm-results"></div>
        <button id="tm-analyze" class="big-btn" type="button" disabled>${L("Bekijk teamadvies", "Get team advice")}</button>
      </section>
      <div id="tm-out"></div>`;
  }

  async function mount(root, game) {
    PK.fillMons(root);
    const key = `teamOwned-${game.id}`;
    let owned = JSON.parse(localStorage.getItem(key) || "[]");
    dex = dex || (await PK.dex());
    const names = Object.entries(dex);
    const q = root.querySelector("#tm-q");
    const generation = root.querySelector("#tm-gen");
    const picker = root.querySelector("#tm-picker-list");
    const count = root.querySelector("#tm-count");
    const hint = root.querySelector("#tm-picker-hint");
    const analyzeButton = root.querySelector("#tm-analyze");
    let analysisToken = 0;
    let currentNames = [];

    const renderPicker = () => {
      const gen = Number(generation.value);
      const min = MINDEX[gen];
      const max = MAXDEX[gen];
      const query = q.value.trim().toLowerCase().replace(/\s+/g, "-");
      currentNames = names
        .filter(([name, id]) => id >= min && id <= max && (!query || name.includes(query) || String(id) === query))
        .sort((a, b) => a[1] - b[1]);
      picker.innerHTML = currentNames.length
        ? currentNames.map(([name, id]) => `
          <button class="tm-pokemon${owned.includes(id) ? " selected" : ""}" type="button" data-toggle="${id}" aria-pressed="${owned.includes(id)}">
            <img loading="lazy" alt="" src="${PK.ART(id)}"><span>${esc(PK.pretty(name))}</span><small>#${String(id).padStart(4, "0")}</small>
          </button>`).join("")
        : `<p class="tm-empty">${L("Geen Pokémon gevonden.", "No Pokémon found.")}</p>`;
      hint.textContent = L(`${currentNames.length} Pokémon`, `${currentNames.length} Pokémon`);
    };

    const renderOwned = () => {
      analysisToken++;
      localStorage.setItem(key, JSON.stringify(owned));
      const out = root.querySelector("#tm-out");
      const nameById = new Map(names.map(([name, id]) => [id, name]));
      root.querySelector("#tm-owned").innerHTML = owned.length
        ? owned.map((id) => `<button class="tm-chip on" type="button" data-rm="${id}"><img alt="" src="${PK.ART(id)}">${esc(PK.pretty(nameById.get(id) || id))} <span aria-hidden="true">×</span></button>`).join("")
        : `<small>${L("Klik Pokémon hierboven aan om je selectie te maken.", "Click Pokémon above to build your selection.")}</small>`;
      count.textContent = `${owned.length} ${L("gekozen", "selected")}`;
      analyzeButton.disabled = owned.length === 0;
      out.innerHTML = owned.length
        ? `<p class="tm-placeholder">${L("Je advies verschijnt hier wanneer je op ‘Bekijk teamadvies’ klikt.", "Your advice will appear here when you select “Get team advice”.")}</p>`
        : `<p class="tm-placeholder">${L("Voeg Pokémon toe om teamadvies te bekijken.", "Add Pokémon to see team advice.")}</p>`;
      const selectedVisible = currentNames.filter(([, id]) => owned.includes(id)).length;
      picker.querySelectorAll("[data-toggle]").forEach((button) => {
        const selected = owned.includes(Number(button.dataset.toggle));
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      hint.textContent = `${currentNames.length} ${L("Pokémon", "Pokémon")} · ${selectedVisible} ${L("geselecteerd", "selected")}`;
    };

    q.addEventListener("input", renderPicker);
    generation.addEventListener("change", renderPicker);
    picker.addEventListener("click", (e) => {
      const button = e.target.closest("[data-toggle]");
      if (!button) return;
      const id = Number(button.dataset.toggle);
      owned = owned.includes(id) ? owned.filter((selectedId) => selectedId !== id) : [...owned, id];
      renderOwned();
    });
    root.querySelector("#tm-clear").addEventListener("click", () => {
      owned = [];
      q.value = "";
      generation.value = String(game.gen);
      renderPicker();
      renderOwned();
    });
    root.querySelector("#tm-owned").addEventListener("click", (e) => {
      const b = e.target.closest("[data-rm]");
      if (!b) return;
      owned = owned.filter((id) => id !== Number(b.dataset.rm));
      renderOwned();
    });
    analyzeButton.addEventListener("click", async () => {
      if (!owned.length) return;
      const token = ++analysisToken;
      analyzeButton.disabled = true;
      root.querySelector("#tm-out").innerHTML = `<p class="tm-placeholder">${L("Teamadvies berekenen...", "Calculating team advice...")}</p>`;
      try {
        const mons = await mapConcurrent(owned, 8, getMon);
        if (token !== analysisToken) return;
        root.querySelector("#tm-out").innerHTML = advice(mons, game);
      } catch {
        if (token === analysisToken) {
          root.querySelector("#tm-out").innerHTML = `<p class="tm-placeholder">${L("Kon de Pokémon niet laden. Controleer je internetverbinding en probeer opnieuw.", "Could not load the Pokémon. Check your connection and try again.")}</p>`;
        }
      } finally {
        if (token === analysisToken) analyzeButton.disabled = false;
      }
    });
    renderPicker();
    renderOwned();
  }

  async function mapConcurrent(items, limit, mapper) {
    const results = new Array(items.length);
    let next = 0;
    async function worker() {
      while (next < items.length) {
        const index = next++;
        results[index] = await mapper(items[index]);
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
  }

  window.TeamAdvisor = { html, mount };
})();
