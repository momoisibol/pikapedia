// Kaartalbum: bewaar welke kaarten je hebt (in je browser) en zie hun waarde.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const KEY = "pokeAlbum";
  const PKEY = "pokeAlbumPrices-v3";
  const HKEY = "pokeAlbumHistory";
  const esc = PK.esc;

  let items = JSON.parse(localStorage.getItem(KEY) || "{}");      // id -> {id,name,image,localId,set,qty,added}
  let prices = JSON.parse(localStorage.getItem(PKEY) || "{}");    // id -> {trend, at}
  let history = JSON.parse(localStorage.getItem(HKEY) || "[]");   // [{d: "YYYY-MM-DD", v: total}]
  let busy = false;

  const save = () => localStorage.setItem(KEY, JSON.stringify(items));
  const savePrices = () => localStorage.setItem(PKEY, JSON.stringify(prices));
  const fmt = (v) => (window.TCG ? TCG.eur.format(v) : "€" + v.toFixed(2));
  const thumb = (c) => {
    if (!c.image) return "";
    return /\.(?:webp|png|jpe?g)(?:\?|$)/i.test(c.image) ? c.image : `${c.image}/low.webp`;
  };

  window.Album = {
    has: (id) => !!items[id],
    qty: (id) => items[id]?.qty || 0,
    remove(id) {
      const cur = items[id];
      if (!cur) return;
      if (cur.qty > 1) items[id] = { ...cur, qty: cur.qty - 1 };
      else delete items[id];
      save();
      renderIfVisible();
    },
    add(c) {
      const cur = items[c.id];
      items[c.id] = cur ? { ...cur, qty: cur.qty + 1 } : { id: c.id, name: c.name, image: c.image || "", localId: c.localId ?? "", set: c.set || "", qty: 1, added: Date.now() };
      save();
      renderIfVisible();
    },
  };

  const value = (c) => (prices[c.id]?.trend != null ? prices[c.id].trend * c.qty : 0);

  function list() {
    const q = $("al-q").value.trim().toLowerCase();
    const sort = $("al-sort").value;
    const arr = Object.values(items).filter((c) => !q || c.name.toLowerCase().includes(q) || (c.set || "").toLowerCase().includes(q));
    const by = {
      value: (a, b) => value(b) - value(a),
      name: (a, b) => a.name.localeCompare(b.name),
      recent: (a, b) => b.added - a.added,
    }[sort];
    return arr.sort(by);
  }

  function recordHistory() {
    const total = Object.values(items).reduce((s, c) => s + value(c), 0);
    const d = new Date().toISOString().slice(0, 10);
    if (history.length && history[history.length - 1].d === d) history[history.length - 1].v = total;
    else history.push({ d, v: total });
    history = history.slice(-60);
    localStorage.setItem(HKEY, JSON.stringify(history));
  }

  function renderHistory() {
    const box = $("al-history");
    if (history.length < 2) {
      box.innerHTML = Object.keys(items).length ? `<p class="status">${L("Het waardeverloop verschijnt zodra je album op minstens twee verschillende dagen is bijgewerkt.", "The value history appears once your album has been updated on at least two different days.")}</p>` : "";
      return;
    }
    const W = 600, H = 140, P = 12;
    const vals = history.map((h) => h.v);
    const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
    const pts = history.map((h, i) => [P + (i / (history.length - 1)) * (W - 2 * P), H - P - ((h.v - min) / span) * (H - 2 * P)]);
    const first = history[0], last = history[history.length - 1];
    const diff = last.v - first.v;
    box.innerHTML = `
      <div class="al-history-card">
        <div class="al-history-head"><b>${L("Waardeverloop", "Value history")}</b>
          <span class="${diff >= 0 ? "up" : "down"}">${diff >= 0 ? "▲ +" : "▼ "}${fmt(diff)} ${L("sinds", "since")} ${esc(first.d)}</span></div>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L("Grafiek van de albumwaarde", "Album value chart")}">
          <polyline fill="none" stroke="#2b7de9" stroke-width="3" stroke-linejoin="round" points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}"/>
          ${pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="#2b7de9"><title>${esc(history[i].d)}: ${fmt(history[i].v)}</title></circle>`).join("")}
        </svg>
      </div>`;
  }

  function renderMovers() {
    const rows = Object.values(items)
      .map((c) => {
        const p = prices[c.id];
        return p?.trend != null && p.avg7 ? { c, p: p.trend, pct: ((p.trend - p.avg7) / p.avg7) * 100 } : null;
      })
      .filter((r) => r && Math.abs(r.pct) >= 0.5);
    const box = $("al-movers");
    if (!rows.length) { box.innerHTML = ""; return; }
    const col = (title, arr, cls) => `
      <div class="al-mv-col"><b>${title}</b>
        ${arr.length ? arr.map((r) => `<div class="al-mv-row"><span>${esc(r.c.name)}</span><em class="${cls}">${r.pct > 0 ? "▲ +" : "▼ "}${r.pct.toFixed(1)}%</em><small>${fmt(r.p)}</small></div>`).join("") : `<p class="status">–</p>`}
      </div>`;
    const up = rows.filter((r) => r.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 5);
    const down = rows.filter((r) => r.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 5);
    box.innerHTML = `<div class="al-history-card"><div class="al-history-head"><b>${L("Stijgers en dalers van de week", "Weekly risers and fallers")}</b>
      <small>${L("trend t.o.v. 7-daags gemiddelde", "trend vs 7-day average")}</small></div>
      <div class="al-mv">${col(L("Grootste stijgers", "Biggest risers"), up, "up")}${col(L("Grootste dalers", "Biggest fallers"), down, "down")}</div></div>`;
  }

  let setTotals = null;
  async function renderProgress() {
    const box = $("al-progress");
    const sets = {};
    Object.values(items).forEach((c) => {
      const sid = c.id.slice(0, c.id.lastIndexOf("-"));
      (sets[sid] ||= { name: c.set || sid, own: 0 }).own++;
    });
    const ids = Object.keys(sets);
    if (!ids.length) { box.innerHTML = ""; return; }
    if (!setTotals && window.TCG) {
      try { setTotals = Object.fromEntries((await TCG.getJSON("/sets")).map((s) => [s.id, s.cardCount?.total || 0])); } catch { setTotals = {}; }
    }
    const rows = ids.map((id) => ({ ...sets[id], total: setTotals?.[id] || 0 })).sort((a, b) => (b.own / (b.total || Infinity)) - (a.own / (a.total || Infinity)));
    box.innerHTML = `<div class="al-history-card"><div class="al-history-head"><b>${L("Set-voortgang", "Set progress")}</b></div>
      ${rows.map((r) => {
        const pct = r.total ? Math.min(100, (r.own / r.total) * 100) : 0;
        return `<div class="al-pr-row"><span>${esc(r.name)}</span><div class="al-pr-bar"><i style="width:${pct.toFixed(1)}%"></i></div><small>${r.own}${r.total ? `/${r.total} (${pct.toFixed(0)}%)` : ""}</small></div>`;
      }).join("")}</div>`;
  }

  function render() {
    const all = Object.values(items);
    const total = all.reduce((s, c) => s + value(c), 0);
    const top = all.reduce((best, c) => {
      const p = prices[c.id]?.trend;
      return p != null && (!best || p > best.p) ? { c, p } : best;
    }, null);
    const count = all.reduce((s, c) => s + c.qty, 0);
    const unpriced = all.filter((c) => prices[c.id]?.trend == null).length;
    $("al-stats").innerHTML = `
      <div class="tcg-box main"><span>${L("Totale waarde", "Total value")}</span><b>${fmt(total)}</b></div>
      <div class="tcg-box"><span>${L("Kaarten", "Cards")}</span><b>${count}</b></div>
      <div class="tcg-box"><span>${L("Unieke kaarten", "Unique cards")}</span><b>${all.length}</b></div>
      <div class="tcg-box"><span>${L("Duurste kaart", "Most valuable card")}</span><b>${top ? `${esc(top.c.name)} · ${fmt(top.p)}` : "–"}</b></div>
      <div class="tcg-box"><span>${L("Zonder prijs", "No price")}</span><b>${unpriced}</b></div>`;
    renderHistory();
    renderMovers();
    renderProgress();

    const arr = list();
    if (!all.length) {
      $("al-grid").innerHTML = `<p class="status">${L("Je album is nog leeg. Open het menu Kaartwaarde en klik op + bij een kaart om hem toe te voegen.", "Your album is empty. Open Card values and click + on a card to add it.")}</p>`;
      return;
    }
    $("al-grid").innerHTML = arr.map((c) => {
      const p = prices[c.id]?.trend;
      return `
      <div class="al-card" data-id="${esc(c.id)}">
        <div class="al-img" data-open="${esc(c.id)}">${c.image ? `<img loading="lazy" alt="${esc(c.name)}" src="${thumb(c)}">` : `<div class="tcg-noimg">${L("Geen afbeelding", "No image")}</div>`}</div>
        <b>${esc(c.name)}</b>
        <small>${esc(c.set || "")} · #${esc(c.localId)}</small>
        <div class="al-price">${p != null ? fmt(p) : "–"}${c.qty > 1 && p != null ? ` <small>× ${c.qty} = ${fmt(p * c.qty)}</small>` : ""}</div>
        <div class="al-qty"><button data-dec="${esc(c.id)}" aria-label="-">−</button><span>${c.qty}</span><button data-inc="${esc(c.id)}" aria-label="+">+</button>
          <button class="al-del" data-del="${esc(c.id)}" title="${L("Verwijderen", "Remove")}">${L("Verwijderen", "Remove")}</button></div>
      </div>`;
    }).join("");
  }

  const renderIfVisible = () => { if (!$("view-album").hidden) render(); };

  async function refreshPrices() {
    if (busy || !window.TCG) return;
    const ids = Object.keys(items);
    if (!ids.length) return;
    busy = true;
    $("al-refresh").disabled = true;
    let done = 0;
    const status = $("al-status");
    const queue = [...ids];
    const worker = async () => {
      while (queue.length) {
        const id = queue.shift();
        try {
          const card = await TCG.getJSON(`/cards/${id}`);
          const p = TCG.prices(card);
          prices[id] = { trend: p.trend ?? p.avg ?? null, avg7: p.avg7 ?? null, at: Date.now() };
          if (items[id] && !items[id].set && card.set?.name) items[id].set = card.set.name;
        } catch { /* keep old price */ }
        done++;
        status.textContent = L(`Prijzen bijwerken ${done}/${ids.length}...`, `Updating prices ${done}/${ids.length}...`);
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    savePrices(); save(); recordHistory();
    busy = false;
    $("al-refresh").disabled = false;
    status.textContent = L("Prijzen bijgewerkt om ", "Prices updated at ") + new Date().toLocaleTimeString(I18N.lang === "nl" ? "nl-NL" : "en-GB");
    renderIfVisible();
  }

  $("al-grid").addEventListener("click", (e) => {
    const t = e.target;
    const open = t.closest("[data-open]");
    if (open) { NAV.go("cards"); return TCG.openCard(open.dataset.open); }
    const inc = t.closest("[data-inc]"), dec = t.closest("[data-dec]"), del = t.closest("[data-del]");
    if (inc) items[inc.dataset.inc].qty++;
    else if (dec) { const c = items[dec.dataset.dec]; c.qty--; if (c.qty <= 0) delete items[c.id]; }
    else if (del) delete items[del.dataset.del];
    else return;
    save();
    render();
  });
  $("al-q").addEventListener("input", render);
  $("al-sort").addEventListener("change", render);
  $("al-refresh").addEventListener("click", refreshPrices);
  $("al-clear").addEventListener("click", () => {
    if (!Object.keys(items).length || !confirm(L("Je hele album wissen?", "Clear your entire album?"))) return;
    items = {}; prices = {}; history = []; save(); savePrices(); localStorage.removeItem(HKEY); render();
  });

  document.querySelector('.tab[data-view="album"]').addEventListener("click", () => {
    render();
    const stale = Object.keys(items).some((id) => !prices[id] || prices[id].avg7 === undefined || Date.now() - prices[id].at > 10 * 60 * 1000);
    if (stale) refreshPrices();
  });
  document.addEventListener("langchange", render);
  render();
})();
