// Live wallpapers: een eigen bewegende achtergrond per pagina.
(() => {
  const THEMES = {
    dashboard: { cls: "th-tech", p: [["star", 30], ["ball", 10]] },
    pokedex: { cls: "th-ocean", p: [["bubble", 26], ["star", 20]] },
    regions: { cls: "th-forest", p: [["leaf", 26], ["firefly", 14]] },
    walkthrough: { cls: "th-dusk", p: [["firefly", 22], ["star", 30]] },
    elite: { cls: "th-ember", p: [["spark", 40], ["glitter", 8]] },
    cards: { cls: "th-glitter", p: [["glitter", 36], ["card", 8]] },
    album: { cls: "th-cardsea", p: [["card", 14], ["glitter", 18]] },
    tcg: { cls: "th-cardsea", p: [["card", 14], ["glitter", 18]] },
    items: { cls: "th-sunset", p: [["ball", 14], ["glitter", 12]] },
    game: { cls: "th-night", p: [["qmark", 22], ["star", 40]] },
    tools: { cls: "th-tech", p: [["star", 30], ["ball", 10]] },
    news: { cls: "th-library", p: [["glitter", 20], ["star", 14]] },
    coloring: { cls: "th-rainbow", p: [["blob", 9], ["bubble", 16]] },
    articles: { cls: "th-library", p: [["glitter", 20], ["leaf", 10]] },
    emulator: { cls: "th-emulator", p: [["ball", 14], ["star", 32], ["spark", 18]] },
    websites: { cls: "th-tech", p: [["star", 40], ["blob", 5]] },
    legal: { cls: "th-legal", p: [["star", 40], ["bubble", 8]] },
  };
  const r = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const MAKE = {
    bubble: () => `<i class="pt rise pt-bubble" style="left:${r(0, 98)}%;--s:${r(10, 60)}px;animation-duration:${r(10, 24)}s;animation-delay:-${r(0, 24)}s"></i>`,
    leaf: () => `<i class="pt fall pt-leaf" style="left:${r(0, 98)}%;--s:${r(18, 36)}px;animation-duration:${r(12, 26)}s;animation-delay:-${r(0, 26)}s"></i>`,
    firefly: () => `<i class="pt twinkle pt-firefly" style="left:${r(0, 98)}%;top:${r(0, 98)}%;--s:${r(5, 10)}px;animation-duration:${r(3, 7)}s;animation-delay:-${r(0, 7)}s"></i>`,
    spark: () => `<i class="pt rise pt-spark" style="left:${r(0, 98)}%;--s:${r(3, 8)}px;animation-duration:${r(5, 12)}s;animation-delay:-${r(0, 12)}s"></i>`,
    glitter: () => `<i class="pt twinkle pt-glit" style="left:${r(0, 98)}%;top:${r(0, 98)}%;--s:${r(4, 9)}px;animation-duration:${r(2, 5)}s;animation-delay:-${r(0, 5)}s"></i>`,
    card: () => `<i class="pt rise pt-card" style="left:${r(0, 95)}%;--s:${r(40, 90)}px;animation-duration:${r(20, 40)}s;animation-delay:-${r(0, 40)}s"></i>`,
    ball: () => `<i class="pt rise pt-ball" style="left:${r(0, 95)}%;--s:${r(30, 80)}px;animation-duration:${r(16, 34)}s;animation-delay:-${r(0, 34)}s"></i>`,
    qmark: () => `<i class="pt rise pt-text pt-q" style="left:${r(0, 98)}%;--s:${r(30, 90)}px;animation-duration:${r(14, 30)}s;animation-delay:-${r(0, 30)}s">?</i>`,
    star: () => `<i class="pt twinkle pt-star" style="left:${r(0, 98)}%;top:${r(0, 98)}%;--s:${r(2, 5)}px;animation-duration:${r(3, 7)}s;animation-delay:-${r(0, 7)}s"></i>`,
    blob: () => `<i class="pt drift pt-blob" style="left:${r(0, 85)}%;top:${r(0, 85)}%;--s:${r(180, 380)}px;--c:${pick(["#ff3d6e", "#ffd23f", "#26c6da", "#8e44ff", "#7ac74c", "#ff7a3d"])};animation-duration:${r(14, 28)}s;animation-delay:-${r(0, 20)}s"></i>`,
  };

  let layer = null;
  function ensure() {
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "live-bg";
    layer.setAttribute("aria-hidden", "true");
    document.body.prepend(layer);
    document.body.classList.add("live");
    return layer;
  }

  window.LiveBG = {
    set(name) {
      const t = THEMES[name];
      const el = ensure();
      document.body.classList.toggle("live-off", !t);
      if (!t) { el.innerHTML = ""; el.className = "live-bg"; el.dataset.theme = ""; return; }
      if (el.dataset.theme === name) return;
      el.dataset.theme = name;
      el.className = "live-bg " + t.cls;
      el.innerHTML = t.p.map(([type, n]) => Array.from({ length: n }, MAKE[type]).join("")).join("");
    },
  };

  // Op losse pagina's (zonder navigatie) meteen het standaardthema tonen
  document.addEventListener("DOMContentLoaded", () => { if (!window.NAV) LiveBG.set("legal"); });
})();
