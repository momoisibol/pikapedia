(() => {
  const $ = (id) => document.getElementById(id);
  const data = window.WALKTHROUGH_DATA;
  const ART = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const L = (nl, en) => I18N.L(nl, en);
  const EXTRA = window.WALKTHROUGH_EXTRA || {};
  const SECTIONS = () => [
    ["overview", L("Overzicht", "Overview")],
    ["steps", L("Walkthrough", "Walkthrough")],
    ["battles", L("Gyms & Elite Four", "Gyms & Elite Four")],
    ["team", L("Team advies", "Team advice")],
    ["secrets", L("Geheimen", "Secrets")],
    ["tips", L("Tips & tricks", "Tips & tricks")],
    ["post", L("Post-game", "Post-game")],
  ];

  const games = data.flatMap((g) => g.games.map((game) => ({ ...game, gen: g.gen, region: g.region })));
  let genFilter = "all";

  const imgs = (g) => g.art.map((id) => `<img loading="lazy" alt="" src="${ART(id)}">`).join("");

  function renderMenu() {
    const chips = [["all", L("Alle", "All")], ...data.map((g) => [String(g.gen), `Gen ${g.gen}`])]
      .map(([v, l]) => `<button class="wt-chip${genFilter === v ? " active" : ""}" data-gen="${v}">${l}</button>`)
      .join("");
    const groups = data
      .filter((g) => genFilter === "all" || String(g.gen) === genFilter)
      .map(
        (g) => `
        <h3 class="tcg-h">${L("Generatie", "Generation")} ${g.gen} <small class="wt-region">${g.region}</small></h3>
        <div class="wt-grid">
          ${g.games
            .map(
              (game) => `
            <button class="wt-card" data-id="${game.id}">
              <div class="wt-art">${imgs(game)}</div>
              <div class="wt-card-body">
                <b>${game.name}</b>
                <span>${game.platform} · ${game.year}</span>
              </div>
            </button>`
            )
            .join("")}
        </div>`
      )
      .join("");
    $("wt-groups").innerHTML = `<div class="wt-chips">${chips}</div>${groups}`;
  }

  const list = (items, cls = "") => `<ul class="wt-list ${cls}">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

  // NL: uitgebreide verhaaltekst. EN: lijst gegenereerd uit de gevechtsdata.
  function stepsFor(game) {
    if (I18N.lang === "nl") return game.steps;
    const b = window.BATTLES[game.id];
    const names = (arr) => arr.map((t) => PK.typeName(t)).join(", ");
    const steps = [["Start: pick your starter", `Starters: <b>${game.starters}</b>. Legendary Pokémon in this game: ${game.legendary}.`]];
    if (b) {
      b.gyms.forEach((g, i) => {
        steps.push([`Gym ${i + 1}: ${g.city}`, `Leader <b>${g.leader}</b> (${PK.typeName(g.type)}). ${g.team.length ? "Team: " + g.team.map(([s, l]) => `${PK.pretty(s)} Lv. ${l}`).join(", ") + ". " : ""}Use ${names(PK.weakTo(g.type))} moves.`]);
      });
      if (b.e4.length) steps.push(["Elite Four", b.e4.map((m) => `<b>${m.name}</b> (${PK.typeName(m.type)})`).join(", ") + "."]);
      if (b.champion) steps.push(["Champion: " + b.champion.name, b.champTip ? I18N.pick(b.champTip) : ""]);
    }
    return steps;
  }

  function stepsHtml(game) {
    const key = `wt-done-${I18N.lang === "nl" ? "" : "en-"}${game.id}`;
    const done = JSON.parse(localStorage.getItem(key) || "[]");
    return `
      <p class="wt-note">${L("Vink een stap af als je hem hebt gedaan. Je voortgang wordt bewaard in je browser.", "Tick a step when you have completed it. Your progress is saved in your browser.")}</p>
      ${I18N.lang === "en" ? `<p class="wt-note">The detailed story text of this guide is written in Dutch. In English you get the full progression of Gyms, Elite Four and champion.</p>` : ""}
      <ol class="wt-steps">
        ${stepsFor(game)
          .map(
            ([title, text], i) => `
          <li class="${done.includes(i) ? "done" : ""}">
            <label><input type="checkbox" data-step="${i}" ${done.includes(i) ? "checked" : ""}>
              <span><b>${title}</b><em>${text}</em></span></label>
          </li>`
          )
          .join("")}
      </ol>`;
  }

  // Nederlandse basislijst + tweetalige extra's
  function mergedList(game, sec) {
    const extra = (EXTRA[game.id]?.[sec] || []).map(([nl, en]) => (I18N.lang === "nl" ? nl : en));
    return I18N.lang === "nl" ? [...game[sec], ...extra] : extra.length ? extra : game[sec];
  }

  function sectionHtml(game, sec) {
    if (sec === "overview") {
      const intro = I18N.lang === "nl" ? game.intro : `Pokémon ${game.name} is a Generation ${game.gen} game for the ${game.platform}, set in the ${game.region} region (${game.year}). Starters: ${game.starters}. Legendary Pokémon: ${game.legendary}.`;
      return `
        <p class="wt-intro">${intro}</p>
        <div class="wt-facts">
          <div><small>${L("Regio", "Region")}</small><b>${game.region}</b></div>
          <div><small>${L("Generatie", "Generation")}</small><b>${game.gen}</b></div>
          <div><small>${L("Uitgebracht", "Released")}</small><b>${game.year}</b></div>
          <div><small>Console</small><b>${game.platform}</b></div>
          <div><small>Starters</small><b>${game.starters}</b></div>
          <div><small>${L("Legendarische Pokémon", "Legendary Pokémon")}</small><b>${game.legendary}</b></div>
        </div>`;
    }
    if (sec === "steps") return stepsHtml(game);
    if (sec === "battles") return BattleUI.html(game.id, { gyms: true });
    if (sec === "team") return TeamAdvisor.html(game);
    if (sec === "secrets") return list(mergedList(game, sec), sec) + guidesHtml(game);
    return list(mergedList(game, sec), sec);
  }

  function guidesHtml(game) {
    const g = window.SECRET_GUIDES?.[game.id];
    if (!g) return "";
    return `<h3 class="bt-h">${L("Zo ontgrendel je het: stap voor stap", "How to unlock it: step by step")}</h3>` + g.map((x, i) => `
      <details class="rg-det" ${i === 0 ? "open" : ""}><summary>${L(x.t[0], x.t[1])}</summary>
        <ol class="wt-steps plain">${x.s.map(([nl, en]) => `<li>${L(nl, en)}</li>`).join("")}</ol></details>`).join("");
  }

  function openGame(id, sec = "overview") {
    const game = games.find((g) => g.id === id);
    $("wt-menu").hidden = true;
    const guide = $("wt-guide");
    guide.hidden = false;
    guide.dataset.id = id;
    guide.dataset.sec = sec;
    guide.innerHTML = `
      <button class="back-btn" id="wt-back" style="max-width:none">${L("← Terug naar alle games", "← Back to all games")}</button>
      <div class="wt-hero"><div class="wt-art">${imgs(game)}</div>
        <div><small>${L("Generatie", "Generation")} ${game.gen} · ${game.region}</small><h2>Pokémon ${game.name}</h2></div></div>
      <div class="wt-tabs">${SECTIONS().map(
        ([k, l]) => `<button class="wt-tab${k === sec ? " active" : ""}" data-sec="${k}">${l}</button>`
      ).join("")}</div>
      <div class="wt-body">${sectionHtml(game, sec)}</div>`;
    if (sec === "battles") BattleUI.mount(guide);
    if (sec === "team") TeamAdvisor.mount(guide, game);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToMenu() {
    $("wt-guide").hidden = true;
    $("wt-menu").hidden = false;
  }

  $("wt-groups").addEventListener("click", (e) => {
    const chip = e.target.closest(".wt-chip");
    if (chip) {
      genFilter = chip.dataset.gen;
      renderMenu();
      return;
    }
    const card = e.target.closest(".wt-card");
    if (card) openGame(card.dataset.id);
  });

  $("wt-guide").addEventListener("click", (e) => {
    if (e.target.closest("#wt-back")) return backToMenu();
    const tab = e.target.closest(".wt-tab");
    if (tab) openGame($("wt-guide").dataset.id, tab.dataset.sec);
  });

  $("wt-guide").addEventListener("change", (e) => {
    if (!e.target.matches("input[data-step]")) return;
    const key = `wt-done-${I18N.lang === "nl" ? "" : "en-"}${$("wt-guide").dataset.id}`;
    const done = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    const i = Number(e.target.dataset.step);
    e.target.checked ? done.add(i) : done.delete(i);
    localStorage.setItem(key, JSON.stringify([...done]));
    e.target.closest("li").classList.toggle("done", e.target.checked);
  });

  document.querySelector('.tab[data-view="walkthrough"]').addEventListener("click", backToMenu);
  document.addEventListener("langchange", () => {
    renderMenu();
    const g = $("wt-guide");
    if (!g.hidden) openGame(g.dataset.id, g.dataset.sec);
  });
  renderMenu();
})();
