(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const API = "https://api.tcgdex.net/v2/en";
  const REFRESH_MS = 60000;
  const PAGE = 60;
  const CLASSIC_COLLECTION_IMAGES = [
    "4", "5", "11", "11g", "18", "19", "25", "33", "41", "43",
    "47", "50", "57", "58", "69", "85", "89", "94", "99", "100",
    "101", "106p", "106m", "106", "108", "114", "123", "138", "149", "203",
  ];
  const RGB_MEW_CARD_IMAGES = {
    "30th-R": "https://pkmncards.com/wp-content/uploads/me5-5m_en_001_std.png",
    "30th-G": "https://pkmncards.com/wp-content/uploads/me5-5m_en_002_std.png",
    "30th-B": "https://pkmncards.com/wp-content/uploads/me5-5m_en_003_std.png",
  };

  // TCGdex set id -> Scrydex set id, for sets whose cards have no image in TCGdex
  const SCRYDEX_SETS = {
    "2015xy": "mcd15", miscp: "miscp", "ex5.5": "wb1", exu: "ex10",
    "tk-ex-latia": "tk1a", "tk-ex-latio": "tk1b", "tk-ex-p": "tk2a", "tk-ex-m": "tk2b",
    "tk-dp-m": "tk3a", "tk-dp-l": "tk3b", "tk-hs-r": "tk4a", "tk-hs-g": "tk4b",
    "tk-bw-z": "tk5a", "tk-bw-e": "tk5b", "tk-xy-sy": "tk6a", "tk-xy-n": "tk6b",
    "tk-xy-w": "tk7a", "tk-xy-b": "tk7b", "tk-xy-latio": "tk8a", "tk-xy-latia": "tk8b",
    "tk-xy-su": "tk9a", "tk-xy-p": "tk9b", "tk-sm-l": "tk10a", "tk-sm-r": "tk10b",
    "2011bw": "mcd11", "2012bw": "mcd12", "2014xy": "mcd14", "2016xy": "mcd16", "2017sm": "mcd17", "2018sm": "mcd18",
    "2019sm": "mcd19", "2021swsh": "mcd21", "2022swsh": "mcd22", "2023sv": "mcd23", "2024sv": "mcd24",
    "sm3.5": "sm35", "sm7.5": "sm75", "swsh4.5sv": "swsh45sv", "swsh12.5gg": "swsh12pt5gg", cel25cc: "cel25c",
    bog: "bp", hgssp: "hsp", mep: "mep", mee: "mee", sve: "sve", dc1: "dc1", smp: "smp", swshp: "swshp", svp: "svp",
    bwp: "bwp", xyp: "xyp", swsh9tg: "swsh9tg", swsh10tg: "swsh10tg", swsh11tg: "swsh11tg", swsh12tg: "swsh12tg",
    ecard2: "ecard2", ecard3: "ecard3", pop6: "pop6", pl2: "pl2", xy8: "xy8", sm2: "sm2", sm6: "sm6", det1: "det1", cel25: "cel25",
  };
  // Scrydex numbers for the Celebrations Classic Collection (TCGdex uses CC001-CC025)
  const CEL25C_NUMBERS = ["2_A", "4_A", "15_A1", "73_A", "8_A", "15_A2", "15_A3", "24_A", "20_A", "66_A", "9_A", "86_A", "88_A", "93_A", "17_A", "15_A4", "109_A", "145_A", "107_A", "113_A", "114_A", "54_A", "97_A", "76_A", "60_A"];
  // Sets whose TCGdex image links exist but are broken
  const FORCE_SCRYDEX = new Set(["dc1"]);
  const scrydexNumber = (setId, localId) => {
    const local = String(localId ?? "");
    if (setId === "cel25cc") return CEL25C_NUMBERS[Number(local.replace(/\D/g, "")) - 1] || local;
    if (setId === "ecard2") return local.replace(/^(\d+)[ab]$/i, "$1").replace(/^([A-Za-z]*)0+(?=\d)/, "$1");
    if (setId === "ecard3") return local.replace(/^([A-Za-z]*)0+(?=\d)/, "$1");
    return /^\d+$/.test(local) ? String(Number(local)) : local;
  };

  const eur = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const esc = PK.esc;

  let loaded = false;
  let openId = null;       // card currently shown in detail view
  let lastPrice = {};      // id -> last trend price, used to flash changes
  let timer = null;
  let sets = [];           // all sets from the API
  let shown = [];          // cards of the current result list
  let shownCount = 0;
  let searchPage = 0;      // >0 while paging through API name search
  let lastQuery = "";
  let lastCard = null;     // card object currently shown in detail
  const marketPriceCache = new Map();
  const marketPriceValues = new Map();
  let priceRunId = 0;

  // Verified corrections for TCGdex/Cardmarket records that are known to be mis-mapped.
  const VERIFIED_CARDMARKET_PRICES = {
    "me06-138": {
      trend: 285.45,
      avg: 301.58,
      low: 195,
      avg1: 255.84,
      avg7: 277.94,
      avg30: 301.58,
      updated: "2026-11-17",
    },
  };

  const getJSON = async (path) => {
    const res = await fetch(API + path, { cache: path.startsWith("/cards/") ? "no-store" : "default" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  };
  // TCGdex set id -> images.pokemontcg.io set id (fallback for cards without an image in TCGdex)
  const PTCG_IO_SETS = {
    "swsh12.5gg": "swsh12pt5gg", bog: "bp", hgssp: "hsp",
    "2011bw": "mcd11", "2012bw": "mcd12", "2016xy": "mcd16", "2019sm": "mcd19", "2021swsh": "mcd21", "2022swsh": "mcd22",
  };
  const img = (card, q = "low", selectedSetId = "") => {
    if (RGB_MEW_CARD_IMAGES[card.id]) return RGB_MEW_CARD_IMAGES[card.id];
    const setId = selectedSetId || card.set?.id || card.id.slice(0, card.id.lastIndexOf("-"));
    const scrydexUrl = () => `https://images.scrydex.com/pokemon/${SCRYDEX_SETS[setId]}-${encodeURIComponent(scrydexNumber(setId, card.localId))}/${q === "high" ? "large" : "small"}`;
    if (FORCE_SCRYDEX.has(setId)) return scrydexUrl();
    if (card.image) return `${card.image}/${q}.webp`;
    if (setId === "30th-c") {
      const imageId = CLASSIC_COLLECTION_IMAGES[Number(card.localId) - 1];
      return imageId ? `https://cdn.pooka.app/card/en-me55c-${imageId}.png?size=${q === "high" ? "default" : "small"}` : "";
    }
    if (/^(?:[AB]\d[a-z]?|P-A)$/i.test(setId)) {
      const number = String(card.localId ?? "").padStart(3, "0");
      return `https://raw.githubusercontent.com/Vociferix/ptcgp-images/master/cards/${encodeURIComponent(setId)}/${encodeURIComponent(number)}.png`;
    }
    if (SCRYDEX_SETS[setId]) return scrydexUrl();
    const ptcgId = PTCG_IO_SETS[setId] || (/^(?:sm|swsh|xy|ex|ecard|pop|pl|hgss|dp|bw|det|sve|svp|smp|xyp|bwp)[\w.]*$/i.test(setId) ? setId.replace(".", "") : "");
    if (ptcgId) {
      const local = String(card.localId ?? "");
      const number = /^\d+$/.test(local) ? String(Number(local)) : local;
      return `https://images.pokemontcg.io/${ptcgId}/${encodeURIComponent(number)}.png`;
    }
    return "";
  };
  const time = () => new Date().toLocaleTimeString("nl-NL");

  // Pull the useful numbers out of a card's pricing block
  function prices(card) {
    const cm = card.pricing?.cardmarket || null;
    const tp = card.pricing?.tcgplayer || null;
    const corrected = VERIFIED_CARDMARKET_PRICES[card.id];
    const pick = (k) => cm ? (cm[k] != null ? cm[k] : (cm[k + "-holo"] != null ? cm[k + "-holo"] : null)) : null;
    const holoPick = (k) => cm?.[k + "-holo"] != null ? cm[k + "-holo"] : null;
    let tcg = null;
    if (tp) {
      const key = ["reverse-holofoil", "holofoil", "normal"].find((name) =>
        tp[name] && typeof tp[name] === "object" && tp[name].marketPrice != null
      );
      if (key) tcg = tp[key].marketPrice;
    }
    const result = {
      trend: pick("trend"), avg: pick("avg"), low: pick("low"),
      holoTrend: holoPick("trend"), holoAvg: holoPick("avg"), holoLow: holoPick("low"),
      avg1: pick("avg1"), avg7: pick("avg7"), avg30: pick("avg30"),
      holoAvg1: holoPick("avg1"), holoAvg7: holoPick("avg7"), holoAvg30: holoPick("avg30"),
      tcg, updated: cm?.updated || tp?.updated || null,
    };
    if (corrected) {
      Object.assign(result, corrected);
      result.corrected = true;
    }
    return result;
  }

  // ---------- Browse all cards + search ----------
  async function loadSets() {
    sets = await getJSON("/sets");
    const prev = $("tcg-set").value;
    $("tcg-set").innerHTML =
      `<option value="">${L("Alle sets (zoek op naam)", "All sets (search by name)")}</option>` +
      sets.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}${s.cardCount?.total ? ` (${s.cardCount.total})` : ""}</option>`).join("");
    $("tcg-set").value = prev;
    renderRecentSets();
  }

  function renderRecentSets() {
    const root = $("tcg-latest-sets");
    const recent = sets
      .filter((set) => set.cardCount?.total && !/(promo|sample|jumbo)/i.test(set.name || ""))
      .slice(-6)
      .reverse();
    root.innerHTML = `
      <h3 class="tcg-h">${L("Recente sets in de kaartendatabase", "Recent sets in the card database")}</h3>
      <p class="tcg-note">${L("De volgorde volgt de TCGdex-database en kan achterlopen op aankondigingen of per regio verschillen. Zeldzame kaarten zijn geen garantie op marktwaarde.", "Order follows the TCGdex database and may lag behind announcements or vary by region. Rarity does not guarantee market value.")}</p>
      <div class="tcg-set-list">${recent.map((set) => `
        <button type="button" class="tcg-set-pick" data-set="${esc(set.id)}">
          ${set.logo
            ? `<img loading="lazy" alt="${esc(set.name)}" src="${esc(set.logo)}.webp" onerror="this.hidden=true">`
            : `<span class="tcg-set-logo-placeholder" aria-hidden="true">${L("TCG", "TCG")}</span>`}
          <span><b>${esc(set.name)}</b><small>${set.cardCount.total} ${L("kaarten", "cards")}</small></span>
          <span aria-hidden="true">→</span>
        </button>`).join("")}
      </div>`;
  }

  const tile = (c, setId = "") => {
    const inAlbum = window.Album && Album.has(c.id);
    const image = img(c, "low", setId);
    const marketValue = marketPriceValues.get(c.id);
    return `
      <div class="tcg-mini" data-id="${esc(c.id)}">
        <button class="tcg-add${inAlbum ? " on" : ""}" data-add="${esc(c.id)}" title="${L("Aan album toevoegen", "Add to album")}">${inAlbum ? L("In album", "In album") : "+"}</button>
        ${image ? `<img loading="lazy" alt="${esc(c.name)}" src="${esc(image)}" onerror="this.outerHTML='&lt;div class=&quot;tcg-noimg&quot;&gt;TCG&lt;/div&gt;'">` : `<div class="tcg-noimg">TCG</div>`}
        <div>${esc(c.name)}</div><small>#${esc(c.localId ?? "")}</small>
        ${marketValue == null ? "" : `<small class="tcg-market-price">${eur.format(marketValue)}</small>`}
      </div>`;
  };

  function renderShown(append, setId = $("tcg-set").value) {
    const grid = $("tcg-results");
    if (!append) { grid.innerHTML = ""; shownCount = 0; }
    const slice = shown.slice(shownCount, shownCount + PAGE);
    grid.insertAdjacentHTML("beforeend", slice.map((card) => tile(card, setId)).join(""));
    shownCount += slice.length;
    $("tcg-more").hidden = !(shownCount < shown.length || searchPage > 0);
  }

  function hasPriceOptions() {
    const sort = $("tcg-price-sort").value;
    return Boolean(sort === "asc" || sort === "desc" || $("tcg-price-min").value || $("tcg-price-max").value);
  }

  function hasNumberSort() {
    return $("tcg-price-sort").value.startsWith("num-");
  }

  function applyNumberSort(setId) {
    const direction = $("tcg-price-sort").value === "num-desc" ? -1 : 1;
    shown = shown.slice().sort((a, b) => direction * String(a.localId).localeCompare(String(b.localId), undefined, { numeric: true }));
    searchPage = 0;
    $("tcg-status").textContent = L(`${shown.length} kaarten gesorteerd op kaartnummer`, `${shown.length} cards sorted by card number`);
    renderShown(false, setId);
  }

  function marketTrend(card) {
    if (!marketPriceCache.has(card.id)) {
      marketPriceCache.set(card.id, getJSON(`/cards/${card.id}`)
        .then((data) => prices(data).trend)
        .catch(() => { marketPriceCache.delete(card.id); return null; }));
    }
    return marketPriceCache.get(card.id);
  }

  async function applyPriceOptions(setId, runId) {
    const minValue = $("tcg-price-min").value;
    const maxValue = $("tcg-price-max").value;
    const min = minValue === "" ? null : Number(minValue);
    const max = maxValue === "" ? null : Number(maxValue);
    const sort = $("tcg-price-sort").value;
    const status = $("tcg-status");
    const priceById = new Map();
    let next = 0;
    let completed = 0;
    const candidates = shown.slice();

    const worker = async () => {
      while (next < candidates.length) {
        const card = candidates[next++];
        priceById.set(card.id, await marketTrend(card));
        completed++;
        if (runId === priceRunId) status.textContent = L(`Prijzen ophalen... ${completed} / ${candidates.length}`, `Loading prices... ${completed} / ${candidates.length}`);
      }
    };
    await Promise.all(Array.from({ length: Math.min(5, candidates.length) }, worker));
    if (runId !== priceRunId) return;
    priceById.forEach((value, id) => marketPriceValues.set(id, value));

    let results = candidates.filter((card) => {
      const value = priceById.get(card.id);
      if (value == null && (min != null || max != null)) return false;
      return (min == null || value >= min) && (max == null || value <= max);
    });
    if (sort === "asc" || sort === "desc") {
      const direction = sort === "asc" ? 1 : -1;
      results.sort((a, b) => {
        const aValue = priceById.get(a.id);
        const bValue = priceById.get(b.id);
        if (aValue == null) return bValue == null ? 0 : 1;
        if (bValue == null) return -1;
        return direction * (aValue - bValue);
      });
    } else if (hasNumberSort()) {
      const direction = sort === "num-desc" ? -1 : 1;
      results.sort((a, b) => direction * String(a.localId).localeCompare(String(b.localId), undefined, { numeric: true }));
    }

    shown = results;
    searchPage = 0;
    const rangeApplied = min != null || max != null;
    const summary = rangeApplied
      ? L(`${shown.length} kaarten binnen het prijsbereik`, `${shown.length} cards in this price range`)
      : L(`${shown.length} kaarten gesorteerd op waarde`, `${shown.length} cards sorted by value`);
    status.textContent = summary;
    renderShown(false, setId);
  }

  async function run(more) {
    const runId = ++priceRunId;
    const q = $("tcg-q").value.trim();
    const setId = $("tcg-set").value;
    const status = $("tcg-status");
    if (more && searchPage === 0 && shownCount < shown.length) {
      renderShown(true, setId);
      return;
    }
    if (more && (hasPriceOptions() || hasNumberSort())) more = false;
    const usePrices = hasPriceOptions();
    const fetchAll = usePrices || hasNumberSort();
    const min = $("tcg-price-min").value;
    const max = $("tcg-price-max").value;
    if (min !== "" && max !== "" && Number(min) > Number(max)) {
      status.textContent = L("De minimumwaarde mag niet hoger zijn dan de maximumwaarde.", "The minimum value cannot be greater than the maximum value.");
      return;
    }
    try {
      if (setId) {
        if (!more) {
          status.textContent = L("Laden...", "Loading...");
          const set = await getJSON(`/sets/${setId}`);
          if (runId !== priceRunId) return;
          const ql = q.toLowerCase();
          shown = (set.cards || []).filter((c) => !ql || c.name.toLowerCase().includes(ql));
          searchPage = 0;
          if (usePrices) await applyPriceOptions(setId, runId);
          else if (hasNumberSort()) applyNumberSort(setId);
          else {
            status.textContent = L(`${shown.length} kaarten in ${set.name}`, `${shown.length} cards in ${set.name}`);
            renderShown(false, setId);
          }
        } else renderShown(true);
      } else if (q) {
        if (!more) { shown = []; searchPage = 0; lastQuery = q; status.textContent = L("Zoeken...", "Searching..."); }
        let page = searchPage + 1;
        let list;
        do {
          list = await getJSON(`/cards?name=${encodeURIComponent(lastQuery)}&pagination:page=${page}&pagination:itemsPerPage=${PAGE}`);
          if (runId !== priceRunId) return;
          shown = shown.concat(list);
          searchPage = list.length === PAGE ? page : 0;
          if (!fetchAll || !searchPage) break;
          page++;
          status.textContent = L(`Zoekresultaten ophalen... ${shown.length}`, `Loading search results... ${shown.length}`);
        } while (true);

        if (usePrices) await applyPriceOptions("", runId);
        else if (hasNumberSort()) applyNumberSort("");
        else {
          status.textContent = shown.length ? L(`${shown.length} kaarten gevonden`, `${shown.length} cards found`) : L("Geen kaarten gevonden.", "No cards found.");
          if (!more) $("tcg-results").innerHTML = "";
          $("tcg-results").insertAdjacentHTML("beforeend", list.map((card) => tile(card, card.set?.id || "")).join(""));
          shownCount = shown.length;
          $("tcg-more").hidden = searchPage === 0;
        }
      } else {
        shown = []; shownCount = 0; searchPage = 0;
        $("tcg-results").innerHTML = "";
        $("tcg-more").hidden = true;
        status.textContent = L("Kies een set of zoek op de naam van een kaart.", "Pick a set or search for a card name.");
      }
    } catch {
      if (runId === priceRunId) status.textContent = L("Kon de kaarten niet laden. Controleer je internetverbinding.", "Could not load the cards. Check your internet connection.");
    }
  }

  // ---------- Detail ----------
  function chart(p) {
    const hasHoloHistory = p.holoAvg30 != null || p.holoAvg7 != null || p.holoAvg1 != null;
    const trend = hasHoloHistory ? p.holoTrend : p.trend;
    const pts = (hasHoloHistory
      ? [
          [L("30 dagen", "30 days"), p.holoAvg30],
          [L("7 dagen", "7 days"), p.holoAvg7],
          [L("1 dag", "1 day"), p.holoAvg1],
        ]
      : [
          [L("30 dagen", "30 days"), p.avg30],
          [L("7 dagen", "7 days"), p.avg7],
          [L("1 dag", "1 day"), p.avg1],
        ]).filter(([, v]) => v != null);
    if (pts.length < 2) return `<p class='tcg-note'>${L("Niet genoeg prijsgegevens voor een grafiek.", "Not enough price data for a chart.")}</p>`;

    const W = 520, H = 220, padL = 55, padR = 55, padT = 30, padB = 40;
    const vals = pts.map(([, v]) => v).concat(trend != null ? [trend] : []);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const x = (i) => padL + (i * (W - padL - padR)) / (pts.length - 1);
    const y = (v) => padT + (1 - (v - min) / span) * (H - padT - padB);
    const line = pts.map(([, v], i) => `${x(i)},${y(v)}`).join(" ");
    const area = `${x(0)},${H - padB} ${line} ${x(pts.length - 1)},${H - padB}`;
    const dots = pts
      .map(
        ([l, v], i) => `
        <circle cx="${x(i)}" cy="${y(v)}" r="6" class="dot"/>
        <text x="${x(i)}" y="${y(v) - 12}" text-anchor="middle" class="val">${eur.format(v)}</text>
        <text x="${x(i)}" y="${H - 14}" text-anchor="middle" class="lab">${l}</text>`
      )
      .join("");
    const trendLine =
      trend != null
        ? `<line x1="${padL}" x2="${W - padR}" y1="${y(trend)}" y2="${y(trend)}" class="trend"/>
           <text x="${W - padR}" y="${y(trend) - 6}" text-anchor="end" class="lab">trend ${eur.format(trend)}</text>`
        : "";
    return `
      <svg viewBox="0 0 ${W} ${H}" class="tcg-chart" role="img" aria-label="Prijsgrafiek">
        <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#8e44ff" stop-opacity=".35"/><stop offset="1" stop-color="#8e44ff" stop-opacity="0"/>
        </linearGradient></defs>
        <polygon points="${area}" fill="url(#g)"/>
        ${trendLine}
        <polyline points="${line}" class="line"/>
        ${dots}
      </svg>`;
  }

  function renderDetail(card, fresh) {
    const p = prices(card);
    const prev = lastPrice[card.id];
    const dir = prev != null && p.trend != null && prev !== p.trend ? (p.trend > prev ? "up" : "down") : "";
    if (p.trend != null) lastPrice[card.id] = p.trend;

    const box = (label, val, cls = "") => `<div class="tcg-box ${cls}"><span>${label}</span><b>${val}</b></div>`;
    const updated = p.updated ? new Date(p.updated).toLocaleString(I18N.lang === "nl" ? "nl-NL" : "en-GB") : L("onbekend", "unknown");
    const owned = window.Album ? Album.qty(card.id) : 0;
    const image = img(card, "high");

    $("tcg-detail-body").innerHTML = `
      <div class="tcg-layout">
        <div class="tcg-big">${image ? `<img alt="${esc(card.name)}" src="${esc(image)}" onerror="this.outerHTML='&lt;div class=&quot;tcg-noimg big&quot;&gt;TCG&lt;/div&gt;'">` : `<div class="tcg-noimg big">TCG</div>`}</div>
        <div class="tcg-info">
          <h2>${esc(card.name)}</h2>
          <p class="tcg-sub">${esc(card.set?.name || "")} · #${esc(card.localId)}${card.rarity ? " · " + esc(card.rarity) : ""}</p>
          <button class="big-btn album-btn${owned ? " owned" : ""}" id="tcg-album-btn" style="margin-left:0">${owned ? L(`In je album (${owned}x) – nog een toevoegen`, `In your album (${owned}x) – add another`) : L("+ Toevoegen aan mijn album", "+ Add to my album")}</button>
          <div class="live-bar"><span class="live-dot"></span> LIVE · ${L("gecontroleerd om", "checked at")} <b id="tcg-checked">${time()}</b> · ${L("elke 60 sec", "every 60 sec")}</div>
          ${
            p.trend != null || p.avg != null
              ? `<div class="tcg-boxes">
                  ${box(L("Trendprijs", "Trend price"), p.trend != null ? eur.format(p.trend) : "–", "main " + dir)}
                  ${box(L("Gemiddeld", "Average"), p.avg != null ? eur.format(p.avg) : "–")}
                  ${box(L("Laagste", "Lowest"), p.low != null ? eur.format(p.low) : "–")}
                  ${p.holoTrend != null || p.holoAvg != null || p.holoLow != null
                    ? `${box(L("Holo trend", "Holo trend"), p.holoTrend != null ? eur.format(p.holoTrend) : "–")}
                       ${box(L("Holo gemiddeld", "Holo average"), p.holoAvg != null ? eur.format(p.holoAvg) : "–")}
                       ${box(L("Holo laagste", "Holo lowest"), p.holoLow != null ? eur.format(p.holoLow) : "–")}`
                    : ""}
                  ${box("TCGplayer", p.tcg != null ? usd.format(p.tcg) : "–")}
                </div>
                <h4>${L("Prijsverloop (gemiddelde prijs)", "Price history (average price)")}</h4>
                ${chart(p)}
                <p class="tcg-note">${p.corrected
                  ? L("Gecorrigeerd op basis van de door jou aangeleverde Cardmarket-gegevens. Bron laatst bijgewerkt:", "Corrected using the Cardmarket data you provided. Source last updated:")
                  : L("Bron: Cardmarket (EUR) en TCGplayer (USD), via TCGdex. Bron laatst bijgewerkt:", "Source: Cardmarket (EUR) and TCGplayer (USD), via TCGdex. Source last updated:")} ${esc(updated)}.</p>`
              : `<p class="tcg-note">${L("Voor deze kaart is geen prijs beschikbaar.", "No price available for this card.")}</p>`
          }
        </div>
      </div>`;
    lastCard = card;
    if (fresh) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openCard(id) {
    openId = id;
    $("tcg-main").hidden = true;
    $("tcg-detail").hidden = false;
    $("tcg-detail-body").innerHTML = `<p>${L("Laden...", "Loading...")}</p>`;
    try {
      renderDetail(await getJSON(`/cards/${id}`), true);
    } catch {
      $("tcg-detail-body").innerHTML = `<p>${L("Kon de kaart niet laden.", "Could not load the card.")}</p>`;
    }
  }

  function closeCard() {
    openId = null;
    $("tcg-detail").hidden = true;
    $("tcg-main").hidden = false;
  }

  // ---------- Auto refresh ----------
  async function tick() {
    if ($("view-cards").hidden || !openId) return;
    try {
      renderDetail(await getJSON(`/cards/${openId}`), false);
    } catch { /* keep showing the last data */ }
  }

  async function init() {
    if (!loaded) {
      loaded = true;
      try { await loadSets(); $("tcg-set").value = ""; } catch { /* run() shows the error */ }
      run(false);
      timer = setInterval(tick, REFRESH_MS);
    } else if (!openId && !$("tcg-detail").hidden) closeCard();
  }

  // Bevestiging na toevoegen aan het album, met ongedaan maken en snelle link naar het album.
  let toastTimer;
  function albumToast(card) {
    let el = $("album-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "album-toast";
      el.className = "album-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    const qty = Album.qty(card.id);
    el.innerHTML = `<span><b>${esc(card.name)}</b> ${L("toegevoegd aan je album", "added to your album")}${qty > 1 ? ` (${qty}x)` : ""}</span>
      <button type="button" data-act="undo">${L("Ongedaan maken", "Undo")}</button>
      <button type="button" data-act="open">${L("Naar album", "Go to album")}</button>`;
    el.dataset.id = card.id;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 5000);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("#album-toast button");
    if (!b) return;
    const el = $("album-toast");
    if (b.dataset.act === "undo") {
      const id = el.dataset.id;
      Album.remove(id);
      document.querySelectorAll(".tcg-add").forEach((x) => {
        if (x.dataset.add === id) { x.classList.toggle("on", Album.has(id)); x.textContent = Album.has(id) ? L("In album", "In album") : "+"; }
      });
      if (lastCard && lastCard.id === id && !$("tcg-detail").hidden) renderDetail(lastCard, false);
    } else NAV.go("album");
    el.classList.remove("show");
  });

  window.TCG = { openCard: (id) => { init(); return openCard(id); }, getJSON, prices, eur, usd, img, esc };

  document.querySelector('.tab[data-view="cards"]').addEventListener("click", (e) => { if (e.isTrusted) { if (!$("tcg-detail").hidden) closeCard(); } init(); });
  $("tcg-results").addEventListener("click", (e) => {
    const add = e.target.closest(".tcg-add");
    if (add) {
      e.stopPropagation();
      const c = shown.find((x) => x.id === add.dataset.add);
      if (c) {
        Album.add({ ...c, image: img(c, "low", $("tcg-set").value) });
        add.classList.add("on");
        add.textContent = L("In album", "In album");
        albumToast(c);
      }
      return;
    }
    const t = e.target.closest(".tcg-mini");
    if (t) openCard(t.dataset.id);
  });
  $("tcg-detail-body").addEventListener("click", (e) => {
    if (!e.target.closest("#tcg-album-btn") || !lastCard) return;
    Album.add({ id: lastCard.id, name: lastCard.name, image: img(lastCard, "low"), localId: lastCard.localId, set: lastCard.set?.name });
    renderDetail(lastCard, false);
    albumToast(lastCard);
  });
  $("tcg-back").addEventListener("click", closeCard);
  $("tcg-more").addEventListener("click", () => run(true));
  $("tcg-latest-sets").addEventListener("click", (e) => {
    const button = e.target.closest("[data-set]");
    if (!button) return;
    $("tcg-set").value = button.dataset.set;
    $("tcg-q").value = "";
    run(false);
    $("tcg-form").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("tcg-set").addEventListener("change", () => run(false));
  $("tcg-form").addEventListener("submit", (e) => { e.preventDefault(); run(false); });
  document.addEventListener("langchange", () => { if (loaded) { loadSets().then(() => {}).catch(() => {}); } if (openId && lastCard) renderDetail(lastCard, false); });
})();
