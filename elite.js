// Elite Four, kampioenen en Gym leaders: weergave voor het Elite-menu en voor het Walkthrough-tabblad.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const ART = PK.ART;
  const wt = window.WALKTHROUGH_DATA || [];
  const games = wt.flatMap((g) => g.games.map((game) => ({ ...game, gen: g.gen, region: g.region })));
  const gameOf = (id) => games.find((g) => g.id === id);

  const typesForGen = (types, gen) =>
    types.filter((t) => !(t === "fairy" && gen < 6) && !(t === "steel" && gen < 2) && !(t === "dark" && gen < 2));
  const names = (types) => types.map(PK.typeName).join(", ");

  const COUNTERS = {
    normal: ["Machamp, Lucario of Conkeldurr", "Close Combat, Brick Break of Drain Punch"],
    fire: ["Swampert, Gyarados of Garchomp", "Surf, Earthquake of Rock Slide"],
    water: ["Jolteon, Raichu of Venusaur", "Thunderbolt, Energy Ball of Leaf Blade"],
    electric: ["Dugtrio, Swampert of Garchomp", "Earthquake of Dig"],
    grass: ["Arcanine, Charizard of Crobat", "Flamethrower, Air Slash of U-turn"],
    ice: ["Lucario, Arcanine of Metagross", "Close Combat, Flamethrower of Meteor Mash"],
    fighting: ["Alakazam, Crobat of Gardevoir", "Psychic, Air Slash of Moonblast"],
    poison: ["Alakazam, Espeon of Garchomp", "Psychic of Earthquake"],
    ground: ["Gyarados, Sceptile of Articuno", "Surf, Leaf Blade of Ice Beam"],
    flying: ["Jolteon, Mamoswine of Ampharos", "Thunderbolt, Ice Beam of Rock Slide"],
    psychic: ["Tyranitar, Scizor of Gengar", "Crunch, U-turn of Shadow Ball"],
    bug: ["Arcanine, Crobat of Talonflame", "Flamethrower, Brave Bird of Rock Slide"],
    rock: ["Swampert, Gyarados of Venusaur", "Surf, Earthquake of Razor Leaf"],
    ghost: ["Tyranitar, Umbreon of Gengar", "Crunch, Dark Pulse of Shadow Ball"],
    dragon: ["Mamoswine, Weavile of Gardevoir", "Ice Beam, Ice Shard of Play Rough"],
    dark: ["Lucario, Heracross of Gardevoir", "Close Combat, Aura Sphere of Play Rough"],
    steel: ["Arcanine, Garchomp of Lucario", "Flamethrower, Earthquake of Close Combat"],
    fairy: ["Metagross, Excadrill of Gengar", "Iron Head, Flash Cannon of Sludge Bomb"],
  };

  function strategyHtml(type, gen) {
    const guide = COUNTERS[type];
    if (!guide) return "";
    const [pokemon, moves] = guide;
    const weak = names(typesForGen(PK.weakTo(type), gen));
    const pokemonAdvice =
      type === "psychic" && gen === 1
        ? L("Gebruik bijvoorbeeld <b>Snorlax</b> met Body Slam of een sterke Bug-aanval.", `Try <b>Snorlax</b> with Body Slam or a strong Bug move, for example.`)
        : L(`Probeer bijvoorbeeld <b>${pokemon}</b> (als die in jouw versie beschikbaar zijn).`, `Try <b>${pokemon}</b> (if available in your version).`);
    const moveAdvice =
      type === "psychic" && gen === 1
        ? L("Ghost-aanvallen werken hier niet door een spelbug.", `Ghost moves do not work here due to a game bug.`)
        : L(`Goede aanvallen zijn <b>${moves}</b>.`, `Good moves include <b>${moves}</b>.`);
    const tacticAdvice = type === "psychic" && gen === 1
      ? L("Focus op sterke fysieke schade; Bug is de enige supereffectieve aanvalsklasse in deze generatie.", "Focus on strong physical damage; Bug is the only super-effective move type in this generation.")
      : L(`Zwakke punten: <b>${weak}</b>. Let op neventypes en immuniteiten.`, `Weaknesses: <b>${weak}</b>. Watch for secondary types and immunities.`);
    return `<details class="bt-tip bt-strategy"><summary>${L("Zo pak je dit gevecht aan", "Battle strategy")}</summary><p>${pokemonAdvice}</p><p>${moveAdvice}</p><p>${tacticAdvice}</p></details>`;
  }

  function tipFor(type, gen, team, name) {
    if (!PK.TYPE_COLORS[type]) return "";
    const weak = typesForGen(PK.weakTo(type), gen);
    const resist = typesForGen(PK.resists(type), gen);
    const last = team[team.length - 1];
    const lastName = last ? PK.pretty(last[0]) : "";
    const nlLast = last ? ` Zijn/haar laatste Pokémon is <b>${lastName}</b> (Lv. ${last[1]}): bewaar je beste aanvaller en genezende items voor dat gevecht.` : "";
    const enLast = last ? ` The last Pokémon is <b>${lastName}</b> (Lv. ${last[1]}): save your best attacker and healing items for it.` : "";
    return L(
      `<b>${name}</b> speelt met <b>${PK.typeName(type)}</b>. Gebruik ${weak.length ? `<b>${names(weak)}</b>-aanvallen` : "krachtige neutrale aanvallen"}. Aanvallen van het type ${names(resist.slice(0, 5))} doen weinig schade.${nlLast}`,
      `<b>${name}</b> uses <b>${PK.typeName(type)}</b> types. Use ${weak.length ? `<b>${names(weak)}</b> moves` : "strong neutral moves"}. ${names(resist.slice(0, 5))} moves do little damage.${enLast}`
    );
  }

  function memberCard(m, role, gen, tip) {
    const color = PK.TYPE_COLORS[m.type] || "#8e44ff";
    const typeBadge = PK.TYPE_COLORS[m.type] ? PK.typeBadge(m.type) : `<span class="type" style="--c:#8e44ff">${L("gemengd", "mixed")}</span>`;
    return `
      <div class="bt-card" style="--c:${color}">
        <div class="bt-head"><div><b>${PK.esc(m.name || m.leader)}</b><small>${role}${m.city ? " · " + PK.esc(m.city) : ""}</small></div>${typeBadge}</div>
        ${m.team.length ? PK.teamHtml(m.team) : `<p class="bt-tip">${L("Team niet opgenomen. Zie de gids voor deze Gym.", "Team not listed. See the guide for this Gym.")}</p>`}
        ${strategyHtml(m.type, gen)}
        <p class="bt-tip">${tip || tipFor(m.type, gen, m.team.length ? m.team : [], PK.esc(m.name || m.leader))}</p>
      </div>`;
  }

  function html(id, opts = {}) {
    const b = window.BATTLES[id];
    const game = gameOf(id);
    if (!b || !game) return `<p>${L("Geen gegevens beschikbaar.", "No data available.")}</p>`;
    const gen = game.gen;
    let out = "";
    if (b.note) out += `<p class="wt-note">${I18N.pick(b.note)}</p>`;
    out += `<p class="wt-note">${L("Levels zijn bij benadering en kunnen per versie of moeilijkheid verschillen.", "Levels are approximate and can differ per version or difficulty.")}</p>`;
    out += `<p class="wt-note">${L("Pokémon en moves hieronder zijn voorbeelden; beschikbaarheid en TM’s verschillen per game. Gebruik zo nodig een andere Pokémon met hetzelfde effectieve type.", "Pokémon and moves below are examples; availability and TMs vary by game. If needed, use another Pokémon with the same effective type.")}</p>`;
    out += `<p class="bt-tip">${L("<b>Voorbereiding:</b> train tot ongeveer het level van de sterkste tegenstander, neem Potions/Full Restores en Revives mee en herstel tussen Elite Four-gevechten met items. Wissel per tegenstander naar een passende Pokémon en let ook op diens tweede type.", "<b>Preparation:</b> train to around the strongest opponent's level, bring Potions/Full Restores and Revives, and heal with items between Elite Four battles. Switch to a suitable Pokémon for each opponent and watch its secondary type.")}</p>`;
    if (opts.gyms && b.gyms.length) {
      out += `<h3 class="bt-h">${L("Gym leaders", "Gym leaders")}</h3><div class="bt-grid">${b.gyms
        .map((g, i) => memberCard(g, `${L("Gym", "Gym")} ${i + 1}`, gen))
        .join("")}</div>`;
    }
    if (b.e4.length) {
      out += `<h3 class="bt-h">${L("Elite Four", "Elite Four")}</h3><div class="bt-grid">${b.e4
        .map((m, i) => memberCard(m, `${L("Elite Four", "Elite Four")} ${i + 1}`, gen))
        .join("")}</div>`;
    }
    if (b.champion) {
      out += `<h3 class="bt-h">${L("Kampioen", "Champion")}</h3><div class="bt-grid single">${memberCard(
        b.champion,
        L("Kampioen", "Champion"),
        gen,
        `${tipFor(b.champion.type, gen, b.champion.team, PK.esc(b.champion.name))} ${b.champTip ? "<br><br>" + I18N.pick(b.champTip) : ""}`
      )}</div>`;
    } else if (!b.e4.length) {
      out += `<p>${L("In deze game is er geen Elite Four of kampioen in de klassieke vorm.", "This game has no classic Elite Four or champion.")}</p>`;
    }
    return out;
  }

  window.BattleUI = {
    // Verwerkt nadat de HTML in de DOM staat
    mount(root) { PK.fillMons(root); },
    html,
    card: (m, role, gen) => memberCard(m, role, gen),
    gameOf,
  };

  // ----- Elite-weergave -----
  let genFilter = "all";
  let openId = null;

  function renderMenu() {
    const chips = [["all", L("Alle", "All")], ...wt.map((g) => [String(g.gen), `Gen ${g.gen}`])]
      .map(([v, l]) => `<button class="wt-chip${genFilter === v ? " active" : ""}" data-gen="${v}">${l}</button>`)
      .join("");
    const groups = wt
      .filter((g) => genFilter === "all" || String(g.gen) === genFilter)
      .map(
        (g) => `
      <h3 class="tcg-h">${L("Generatie", "Generation")} ${g.gen} <small class="wt-region">${g.region}</small></h3>
      <div class="wt-grid">${g.games
        .map(
          (game) => `
        <button class="wt-card" data-id="${game.id}">
          <div class="wt-art">${game.art.map((i) => `<img loading="lazy" alt="" src="${ART(i)}">`).join("")}</div>
          <div class="wt-card-body"><b>${game.name}</b><span>${(window.BATTLES[game.id]?.e4 || []).length ? "Elite Four + " : ""}${L("kampioen", "champion")}</span></div>
        </button>`
        )
        .join("")}</div>`
      )
      .join("");
    $("el-groups").innerHTML = `<div class="wt-chips">${chips}</div>${groups}`;
  }

  function renderDetail() {
    const game = gameOf(openId);
    if (!game) return;
    $("el-menu").hidden = true;
    const el = $("el-detail");
    el.hidden = false;
    el.innerHTML = `
      <button class="back-btn" id="el-back" style="max-width:none">${L("← Terug naar alle games", "← Back to all games")}</button>
      <div class="wt-hero"><div class="wt-art">${game.art.map((i) => `<img alt="" src="${ART(i)}">`).join("")}</div>
        <div><small>${L("Generatie", "Generation")} ${game.gen} · ${game.region}</small><h2>Pokémon ${game.name}</h2></div></div>
      ${html(openId, { gyms: false })}`;
    PK.fillMons(el);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    openId = null;
    $("el-detail").hidden = true;
    $("el-menu").hidden = false;
  }

  $("el-groups").addEventListener("click", (e) => {
    const chip = e.target.closest(".wt-chip");
    if (chip) { genFilter = chip.dataset.gen; return renderMenu(); }
    const card = e.target.closest(".wt-card");
    if (card) { openId = card.dataset.id; renderDetail(); }
  });
  $("el-detail").addEventListener("click", (e) => { if (e.target.closest("#el-back")) back(); });
  document.querySelector('.tab[data-view="elite"]')?.addEventListener("click", back);
  document.addEventListener("navview", (e) => { if (e.detail.view === "elite") back(); });
  document.addEventListener("langchange", () => { renderMenu(); if (openId) renderDetail(); });
  renderMenu();
})();
