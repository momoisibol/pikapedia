// Taalkeuze (NL/EN) + gedeelde hulpfuncties voor alle modules.
(() => {
  const translationCache = new Map();
  const I18N = {
    lang: localStorage.getItem("lang") === "en" ? "en" : "nl",
    L(nl, en) { return this.lang === "en" ? en : nl; },
    async translate(text, from = "en", to = this.lang) {
      if (from === to || !text.trim()) return text;
      const key = `${from}:${to}:${text}`;
      const cached = translationCache.get(key);
      if (cached) return cached;
      const url = new URL("https://translate.googleapis.com/translate_a/single");
      [["client", "gtx"], ["sl", from], ["tl", to], ["dt", "t"], ["q", text]]
        .forEach(([name, value]) => url.searchParams.set(name, value));
      const request = fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Translation service returned HTTP " + res.status);
          return res.json();
        })
        .then((data) => {
          const translated = Array.isArray(data[0])
            ? data[0].map((part) => typeof part[0] === "string" ? part[0] : "").join("").trim()
            : "";
          if (!translated) throw new Error("Translation service returned no translated text");
          return translated;
        });
      translationCache.set(key, request);
      try {
        const translated = await request;
        translationCache.set(key, translated);
        return translated;
      } catch (error) {
        translationCache.delete(key);
        throw error;
      }
    },
    // Kiest uit een object {nl, en}; valt terug op de andere taal.
    pick(o) { return o == null ? "" : typeof o === "string" ? o : (o[this.lang] ?? o.nl ?? o.en ?? ""); },
    apply() {
      document.documentElement.lang = this.lang;
      document.querySelectorAll("[data-en]").forEach((el) => {
        if (el.dataset.nl === undefined) el.dataset.nl = el.innerHTML;
        el.innerHTML = this.lang === "en" ? el.dataset.en : el.dataset.nl;
      });
      ["placeholder", "title", "aria-label"].forEach((attr) => {
        document.querySelectorAll(`[data-en-${attr}]`).forEach((el) => {
          const key = "nl" + attr.replace(/-/g, "");
          if (el.dataset[key] === undefined) el.dataset[key] = el.getAttribute(attr) || "";
          el.setAttribute(attr, this.lang === "en" ? el.getAttribute(`data-en-${attr}`) : el.dataset[key]);
        });
      });
      document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === this.lang));
    },
    set(lang) {
      this.lang = lang === "en" ? "en" : "nl";
      localStorage.setItem("lang", this.lang);
      this.apply();
      document.dispatchEvent(new CustomEvent("langchange", { detail: this.lang }));
    },
  };
  window.I18N = I18N;

  const TYPE_NL = {
    normal: "normaal", fire: "vuur", water: "water", electric: "elektrisch", grass: "gras", ice: "ijs",
    fighting: "vechten", poison: "gif", ground: "grond", flying: "vliegend", psychic: "psychisch", bug: "insect",
    rock: "gesteente", ghost: "spook", dragon: "draak", dark: "duister", steel: "staal", fairy: "fee",
  };
  const TYPE_COLORS = {
    normal: "#a8a77a", fire: "#ee8130", water: "#6390f0", electric: "#f7d02c", grass: "#7ac74c", ice: "#96d9d6",
    fighting: "#c22e28", poison: "#a33ea1", ground: "#e2bf65", flying: "#a98ff3", psychic: "#f95587", bug: "#a6b91a",
    rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc", dark: "#705746", steel: "#b7b7ce", fairy: "#d685ad",
  };
  // attacker: [super effective, not very effective, no effect]
  const CHART = {
    normal: [[], ["rock", "steel"], ["ghost"]],
    fire: [["grass", "ice", "bug", "steel"], ["fire", "water", "rock", "dragon"], []],
    water: [["fire", "ground", "rock"], ["water", "grass", "dragon"], []],
    electric: [["water", "flying"], ["electric", "grass", "dragon"], ["ground"]],
    grass: [["water", "ground", "rock"], ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], []],
    ice: [["grass", "ground", "flying", "dragon"], ["fire", "water", "ice", "steel"], []],
    fighting: [["normal", "ice", "rock", "dark", "steel"], ["poison", "flying", "psychic", "bug", "fairy"], ["ghost"]],
    poison: [["grass", "fairy"], ["poison", "ground", "rock", "ghost"], ["steel"]],
    ground: [["fire", "electric", "poison", "rock", "steel"], ["grass", "bug"], ["flying"]],
    flying: [["grass", "fighting", "bug"], ["electric", "rock", "steel"], []],
    psychic: [["fighting", "poison"], ["psychic", "steel"], ["dark"]],
    bug: [["grass", "psychic", "dark"], ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], []],
    rock: [["fire", "ice", "flying", "bug"], ["fighting", "ground", "steel"], []],
    ghost: [["psychic", "ghost"], ["dark"], ["normal"]],
    dragon: [["dragon"], ["steel"], ["fairy"]],
    dark: [["psychic", "ghost"], ["fighting", "dark", "fairy"], []],
    steel: [["ice", "rock", "fairy"], ["fire", "water", "electric", "steel"], []],
    fairy: [["fighting", "dragon", "dark"], ["fire", "poison", "steel"], []],
  };

  const ART = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  let dexPromise = null;

  const PK = {
    TYPE_COLORS,
    ART,
    esc: (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])),
    pretty: (n) => String(n).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    typeName: (t) => (I18N.lang === "nl" ? TYPE_NL[t] || t : t),
    typeBadge: (t) => `<span class="type" style="--c:${TYPE_COLORS[t] || "#777"}">${PK.typeName(t)}</span>`,
    // Types die super effectief zijn tegen type t
    weakTo: (t) => Object.keys(CHART).filter((a) => CHART[a][0].includes(t)),
    // Types waar type t tegen bestand is of immuun voor is
    resists: (t) => Object.keys(CHART).filter((a) => CHART[a][1].includes(t) || CHART[a][2].includes(t)),
    allTypes: () => Object.keys(CHART),
    superVs: (t) => CHART[t][0],
    // Schade-multiplier van aanvalstype a tegen een Pokémon met types defs
    mult: (a, defs) => defs.reduce((m, d) => m * (CHART[a][0].includes(d) ? 2 : CHART[a][1].includes(d) ? 0.5 : CHART[a][2].includes(d) ? 0 : 1), 1),
    // Map van soortnaam -> Pokédex-nummer, eenmalig geladen
    dex() {
      if (!dexPromise) {
        dexPromise = fetch("https://pokeapi.co/api/v2/pokemon-species?limit=2000")
          .then((r) => r.json())
          .then((d) => {
            const m = {};
            d.results.forEach((s) => (m[s.name] = Number(s.url.split("/").filter(Boolean).pop())));
            return m;
          })
          .catch(() => { dexPromise = null; return {}; });
      }
      return dexPromise;
    },
    // Vult <img data-mon="slug"> met artwork zodra de index geladen is
    async fillMons(root) {
      const dex = await PK.dex();
      root.querySelectorAll("img[data-mon]").forEach((img) => {
        const id = dex[img.dataset.mon];
        if (id) img.src = ART(id);
        else img.removeAttribute("data-mon");
      });
    },
    // Team [[slug, level], ...] als kaartjes
    teamHtml(team) {
      return `<div class="team">${team
        .map(([s, lv]) => `<div class="mon"><img data-mon="${PK.esc(s)}" alt="${PK.esc(PK.pretty(s))}" loading="lazy"><b>${PK.esc(PK.pretty(s))}</b><small>Lv. ${lv}</small></div>`)
        .join("")}</div>`;
    },
  };
  window.PK = PK;

  document.addEventListener("DOMContentLoaded", () => {
    I18N.apply();
    document.querySelectorAll(".lang-btn").forEach((b) => b.addEventListener("click", () => I18N.set(b.dataset.lang)));
  });
})();
