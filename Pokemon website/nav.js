// Navigatie tussen de weergaven (zijmenu) en de paginatitel.
(() => {
  const $ = (id) => document.getElementById(id);
  const TITLES = {
    home: ["Pikapedia", "Pikapedia"],
    dashboard: ["Trainer-dashboard", "Trainer dashboard"],
    pokedex: ["Pokédex & Items", "Pokédex & Items"],
    regions: ["Regio's & routes", "Regions & routes"],
    walkthrough: ["Walkthrough", "Walkthrough"],
    characters: ["Pokémon-personages", "Pokémon characters"],
    elite: ["Elite Four & Kampioenen", "Elite Four & Champions"],
    cards: ["Kaartwaarde", "Card values"],
    album: ["Kaartalbum", "Card album"],
    tcg: ["Pokémon TCG", "Pokémon TCG"],
    items: ["Items", "Items"],
    game: ["Wie is deze Pokémon?", "Who's that Pokémon?"],
    tools: ["Trainer-tools", "Trainer tools"],
    news: ["Nieuws & agenda", "News & agenda"],
    coloring: ["Galerij", "Gallery"],
    articles: ["Artikelen", "Articles"],
    emulator: ["GBA-emulator", "GBA emulator"],
    websites: ["Websites", "Websites"],
  };
  let current = "home";

  function show(view, keepScroll) {
    current = view;
    const welcome = $("first-visit");
    const seenWelcome = localStorage.getItem("firstVisitSeen") === "1";
    if (welcome) welcome.hidden = seenWelcome || view !== "home";
    if (view !== "home") localStorage.setItem("firstVisitSeen", "1");
    const activeView = view === "items" ? "pokedex" : view;
    document.querySelectorAll(".tab[data-view]").forEach((t) => t.classList.toggle("active", t.dataset.view === activeView));
    document.querySelectorAll("[id^='view-']").forEach((el) => (el.hidden = el.id !== "view-" + view));
    $("dex-controls").hidden = view !== "pokedex";
    $("catalog-switch").hidden = view !== "pokedex" && view !== "items";
    $("catalog-switch").querySelectorAll("[data-catalog-view]").forEach((b) => b.classList.toggle("active", b.dataset.catalogView === view));
    $("page-hero").hidden = view === "home";
    const t = TITLES[view] || TITLES.home;
    $("page-title").textContent = I18N.L(t[0], t[1]);
    window.LiveBG?.set(view === "home" ? "" : view);
    if (!keepScroll) window.scrollTo({ top: 0 });
  }

  document.querySelectorAll(".tab[data-view]").forEach((tab) => tab.addEventListener("click", () => show(tab.dataset.view)));
  document.addEventListener("langchange", () => show(current, true));
  window.NAV = {
    go(v) {
      const tab = document.querySelector(`.tab[data-view="${v}"]`);
      if (tab) return tab.click();
      if (!$(`view-${v}`)) return;
      show(v);
      document.dispatchEvent(new CustomEvent("navview", { detail: { view: v } }));
    },
    get current() { return current; },
  };
  $("catalog-switch").addEventListener("click", (e) => {
    const button = e.target.closest("[data-catalog-view]");
    if (button) window.NAV.go(button.dataset.catalogView);
  });
  $("first-visit-close").addEventListener("click", () => {
    localStorage.setItem("firstVisitSeen", "1");
    $("first-visit").hidden = true;
  });
  $("first-visit").addEventListener("click", (e) => {
    const button = e.target.closest("[data-onboarding-go]");
    if (button) window.NAV.go(button.dataset.onboardingGo);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const requestedView = new URLSearchParams(location.search).get("view");
    if (requestedView === "items") {
      window.NAV.go("items");
    } else {
      const startupTab = [...document.querySelectorAll(".tab[data-view]")].find((tab) => tab.dataset.view === requestedView);
      if (startupTab) startupTab.click();
      else show("home");
    }
  });
})();
