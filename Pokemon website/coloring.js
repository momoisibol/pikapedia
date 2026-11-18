// Kleurplaten: lijntekening uit officiële artwork, tekenen, vullen en printen.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const SIZE = 800;
  const PAGES = [
    [25, "Pikachu"], [4, "Charmander"], [1, "Bulbasaur"], [7, "Squirtle"], [133, "Eevee"],
    [39, "Jigglypuff"], [143, "Snorlax"], [150, "Mewtwo"], [6, "Charizard"], [94, "Gengar"],
    [54, "Psyduck"], [52, "Meowth"], [37, "Vulpix"], [129, "Magikarp"], [130, "Gyarados"],
    [131, "Lapras"], [149, "Dragonite"], [151, "Mew"], [152, "Chikorita"], [155, "Cyndaquil"],
    [158, "Totodile"], [175, "Togepi"], [196, "Espeon"], [197, "Umbreon"], [249, "Lugia"],
    [282, "Gardevoir"], [448, "Lucario"], [658, "Greninja"], [700, "Sylveon"], [778, "Mimikyu"],
    [3, "Venusaur"], [9, "Blastoise"], [12, "Butterfree"], [18, "Pidgeot"], [65, "Alakazam"],
    [68, "Machamp"], [76, "Golem"], [87, "Dewgong"], [95, "Onix"], [122, "Mr. Mime"],
    [144, "Articuno"], [145, "Zapdos"], [146, "Moltres"], [250, "Ho-Oh"], [384, "Rayquaza"],
    [445, "Garchomp"], [487, "Giratina"], [719, "Diancie"], [791, "Solgaleo"], [792, "Lunala"],
    [2, "Ivysaur"], [5, "Charmeleon"], [8, "Wartortle"], [19, "Rattata"], [26, "Raichu"],
    [58, "Growlithe"], [59, "Arcanine"], [134, "Vaporeon"], [135, "Jolteon"], [136, "Flareon"],
    [147, "Dratini"], [148, "Dragonair"], [157, "Typhlosion"], [160, "Feraligatr"], [181, "Ampharos"],
    [212, "Scizor"], [248, "Tyranitar"], [254, "Sceptile"], [257, "Blaziken"], [260, "Swampert"],
    [306, "Aggron"], [330, "Flygon"], [359, "Absol"], [373, "Salamence"], [376, "Metagross"],
    [392, "Infernape"], [395, "Empoleon"], [468, "Togekiss"], [473, "Mamoswine"], [609, "Chandelure"],
    [635, "Hydreigon"], [724, "Decidueye"], [727, "Incineroar"], [730, "Primarina"], [812, "Rillaboom"],
    [815, "Cinderace"], [818, "Inteleon"], [906, "Sprigatito"], [909, "Fuecoco"], [912, "Quaxly"],
  ];
  const COLORS = ["#e53935", "#ff7a3d", "#ffd23f", "#7ac74c", "#2e7d32", "#26c6da", "#2f7bff", "#1a237e", "#8e44ff", "#f95587", "#8d6e63", "#5d4037", "#ffffff", "#bdbdbd", "#616161", "#111111"];

  let color = "#e53935", color2 = "#ffd23f", size = 14, tool = "brush";
  let style = "brush", fillMode = "solid", detail = 140, thick = 1, lastImg = null;
  let current = null, barrier = null, undo = [], drawing = false, last = null;
  let cc, lc, cctx, lctx;
  let galleryMode = "coloring";

  function renderGallery() {
    $("cl-gallery").innerHTML = `
      <h2 class="view-title">${L("Kleurplaten", "Coloring pages")}</h2>
      <p class="wt-lead">${L("Kies een kleurplaat en kleur hem op je scherm in, of print hem uit en kleur met potloden.", "Pick a coloring page and color it on screen, or print it and color with pencils.")}</p>
      <div class="cl-grid">${PAGES.map(([id, n]) => `
        <button class="cl-card" data-id="${id}"><div class="cl-thumb"><img loading="lazy" alt="${n}" src="${PK.ART(id)}"></div><b>${n}</b></button>`).join("")}</div>`;
  }

  function renderEditor() {
    $("cl-editor").innerHTML = `
      <button class="back-btn" id="cl-back" style="max-width:none">${L("← Terug naar kleurplaten", "← Back to coloring pages")}</button>
      <div class="cl-layout">
        <div class="cl-tools">
          <div class="cl-row">${["brush", "fill", "eraser"].map((t) => `<button class="wt-chip${tool === t ? " active" : ""}" data-tool="${t}">${{ brush: L("Penseel", "Brush"), fill: L("Vullen", "Fill"), eraser: L("Gum", "Eraser") }[t]}</button>`).join("")}</div>
          <div class="cl-palette">${COLORS.map((c) => `<button class="cl-sw${c === color ? " on" : ""}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}
            <input type="color" id="cl-custom" value="${color}" aria-label="${L("Eigen kleur", "Custom color")}"></div>
          <details class="cl-more"><summary>${L("Meer opties", "More options")}</summary>
          <label class="cl-opt">${L("Tweede kleur (verloop, strepen, stippen)", "Second color (gradient, stripes, dots)")} <input type="color" id="cl-color2" value="${color2}"></label>
          <label class="cl-opt">${L("Stijl van het penseel", "Brush style")}: ${sel("cl-style", style, [["brush", L("Penseel", "Brush")], ["marker", L("Stift (doorzichtig)", "Marker (see-through)")], ["pencil", L("Potlood", "Pencil")], ["crayon", L("Waskrijt", "Crayon")], ["spray", L("Spuitbus", "Spray")]])}</label>
          <label class="cl-opt">${L("Vullen met", "Fill with")}: ${sel("cl-fillmode", fillMode, [["solid", L("Effen kleur", "Solid color")], ["gradient", L("Kleurverloop", "Gradient")], ["stripes", L("Strepen", "Stripes")], ["dots", L("Stippen", "Dots")]])}</label>
          <label class="cl-opt">${L("Detail van de lijnen", "Line detail")}: ${sel("cl-detail", detail, [[300, L("Eenvoudig (voor kleintjes)", "Simple (for little ones)")], [140, L("Normaal", "Normal")], [80, L("Veel detail", "Detailed")]])}</label>
          <label class="cl-opt">${L("Lijndikte", "Line thickness")}: ${sel("cl-thick", thick, [[0, L("Dun", "Thin")], [1, L("Normaal", "Normal")], [2, L("Dik", "Thick")]])}</label>
          </details>
          <label class="cl-size">${L("Dikte", "Size")}: <input type="range" id="cl-size" min="3" max="50" value="${size}"></label>
          <div class="cl-row">
            <button class="wt-chip" id="cl-undo">↶ ${L("Ongedaan", "Undo")}</button>
            <button class="wt-chip" id="cl-clear">${L("Wissen", "Clear")}</button>
          </div>
          <div class="cl-row">
            <button class="big-btn" id="cl-print-blank" style="margin:0">${L("Print kleurplaat", "Print page")}</button>
            <button class="big-btn secondary" id="cl-print-color" style="margin:0">${L("Print mijn kleuring", "Print my coloring")}</button>
            <button class="big-btn secondary" id="cl-save" style="margin:0">${L("Opslaan als afbeelding", "Save as image")}</button>
          </div>
        </div>
        <div class="cl-stage" id="cl-stage"><p class="status">${L("Kleurplaat maken...", "Preparing page...")}</p></div>
      </div>`;
  }

  function showGallery(mode) {
    galleryMode = ["wallpapers", "pokemon-illustrations"].includes(mode) ? mode : "coloring";
    const editing = !$("cl-editor").hidden;
    $("gallery-tabs").hidden = editing;
    $("cl-gallery").hidden = editing || galleryMode !== "coloring";
    $("wallpaper-gallery").hidden = editing || galleryMode !== "wallpapers";
    $("pokemon-art-gallery").hidden = editing || galleryMode !== "pokemon-illustrations";
    document.querySelectorAll("[data-gallery-tab]").forEach((button) => {
      const active = button.dataset.galleryTab === galleryMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.dispatchEvent(new CustomEvent("gallerymodechange", { detail: galleryMode }));
  }

  async function load(id) {
    current = PAGES.find((p) => p[0] === id);
    $("gallery-tabs").hidden = true;
    $("cl-gallery").hidden = true;
    $("wallpaper-gallery").hidden = true;
    $("pokemon-art-gallery").hidden = true;
    $("cl-editor").hidden = false;
    renderEditor();
    window.scrollTo({ top: 0 });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = PK.ART(id);
    try { await img.decode(); } catch { $("cl-stage").innerHTML = `<p class="status">${L("Kon de afbeelding niet laden. Controleer je internetverbinding.", "Could not load the image. Check your internet connection.")}</p>`; return; }
    buildPage(img);
  }

  const sel = (id, cur, opts) => `<select id="${id}">${opts.map(([v, l]) => `<option value="${v}"${String(v) === String(cur) ? " selected" : ""}>${l}</option>`).join("")}</select>`;

  function buildPage(img, keep) {
    lastImg = img;
    const saved = keep && cctx ? cctx.getImageData(0, 0, SIZE, SIZE) : null;
    const t = document.createElement("canvas");
    t.width = t.height = SIZE;
    const tx = t.getContext("2d", { willReadFrequently: true });
    tx.fillStyle = "#fff";
    tx.fillRect(0, 0, SIZE, SIZE);
    const pad = 40, s = Math.min((SIZE - pad * 2) / img.width, (SIZE - pad * 2) / img.height);
    const w = img.width * s, h = img.height * s;
    // alpha apart bepalen via een transparante tekening
    const ac = document.createElement("canvas");
    ac.width = ac.height = SIZE;
    const ax = ac.getContext("2d", { willReadFrequently: true });
    ax.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    tx.drawImage(ac, 0, 0);
    let d;
    try { d = tx.getImageData(0, 0, SIZE, SIZE).data; } catch { $("cl-stage").innerHTML = `<p class="status">${L("Deze afbeelding kan niet bewerkt worden in je browser.", "This image cannot be processed in your browser.")}</p>`; return; }
    const alpha = ax.getImageData(0, 0, SIZE, SIZE).data;
    const N = SIZE * SIZE;
    const lum = new Float32Array(N), blur = new Float32Array(N), inside = new Uint8Array(N);
    for (let i = 0; i < N; i++) { lum[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]; inside[i] = alpha[i * 4 + 3] > 40 ? 1 : 0; }
    for (let y = 1; y < SIZE - 1; y++) for (let x = 1; x < SIZE - 1; x++) {
      const i = y * SIZE + x;
      blur[i] = (lum[i - SIZE - 1] + lum[i - SIZE] + lum[i - SIZE + 1] + lum[i - 1] + lum[i] + lum[i + 1] + lum[i + SIZE - 1] + lum[i + SIZE] + lum[i + SIZE + 1]) / 9;
    }
    const line = new Uint8Array(N);
    for (let y = 2; y < SIZE - 2; y++) for (let x = 2; x < SIZE - 2; x++) {
      const i = y * SIZE + x;
      if (inside[i] !== inside[i - 2] || inside[i] !== inside[i + 2] || inside[i] !== inside[i - 2 * SIZE] || inside[i] !== inside[i + 2 * SIZE]) { if (inside[i]) line[i] = 1; continue; }
      if (!inside[i]) continue;
      const gx = -blur[i - SIZE - 1] - 2 * blur[i - 1] - blur[i + SIZE - 1] + blur[i - SIZE + 1] + 2 * blur[i + 1] + blur[i + SIZE + 1];
      const gy = -blur[i - SIZE - 1] - 2 * blur[i - SIZE] - blur[i - SIZE + 1] + blur[i + SIZE - 1] + 2 * blur[i + SIZE] + blur[i + SIZE + 1];
      if (gx * gx + gy * gy > detail * detail) line[i] = 1;
    }
    let b = line;
    for (let r = 0; r < thick; r++) {
      const nb = new Uint8Array(N);
      for (let y = 1; y < SIZE - 1; y++) for (let x = 1; x < SIZE - 1; x++) {
        const i = y * SIZE + x;
        if (b[i] || b[i - 1] || b[i + 1] || b[i - SIZE] || b[i + SIZE]) nb[i] = 1;
      }
      b = nb;
    }
    barrier = b;

    $("cl-stage").innerHTML = `<canvas id="cl-color" width="${SIZE}" height="${SIZE}"></canvas><canvas id="cl-line" width="${SIZE}" height="${SIZE}"></canvas>`;
    cc = $("cl-color"); lc = $("cl-line");
    cctx = cc.getContext("2d", { willReadFrequently: true });
    lctx = lc.getContext("2d");
    cctx.fillStyle = "#fff";
    cctx.fillRect(0, 0, SIZE, SIZE);
    if (saved) cctx.putImageData(saved, 0, 0);
    const out = lctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < N; i++) if (barrier[i]) out.data[i * 4 + 3] = 255;
    lctx.putImageData(out, 0, 0);
    if (!keep) undo = [];
    bindCanvas();
  }

  const pos = (e) => {
    const r = cc.getBoundingClientRect();
    return [((e.clientX - r.left) * SIZE) / r.width, ((e.clientY - r.top) * SIZE) / r.height];
  };
  const snapshot = () => { undo.push(cctx.getImageData(0, 0, SIZE, SIZE)); if (undo.length > 15) undo.shift(); };

  function fill(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE || barrier[y * SIZE + x]) return;
    snapshot();
    const img = cctx.getImageData(0, 0, SIZE, SIZE), d = img.data;
    const c = parseInt(color.slice(1), 16), r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    const c2 = parseInt(color2.slice(1), 16), r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    const seen = new Uint8Array(SIZE * SIZE);
    const region = [];
    const stack = [y * SIZE + x];
    while (stack.length) {
      const i = stack.pop();
      if (seen[i] || barrier[i]) continue;
      seen[i] = 1;
      region.push(i);
      const px = i % SIZE;
      if (px > 0) stack.push(i - 1);
      if (px < SIZE - 1) stack.push(i + 1);
      if (i >= SIZE) stack.push(i - SIZE);
      if (i < SIZE * (SIZE - 1)) stack.push(i + SIZE);
    }
    let minY = SIZE, maxY = 0;
    if (fillMode === "gradient") region.forEach((i) => { const yy = (i / SIZE) | 0; if (yy < minY) minY = yy; if (yy > maxY) maxY = yy; });
    const span = Math.max(1, maxY - minY);
    region.forEach((i) => {
      const px = i % SIZE, py = (i / SIZE) | 0;
      let t = 0;
      if (fillMode === "gradient") t = (py - minY) / span;
      else if (fillMode === "stripes") t = Math.floor((px + py) / 14) % 2;
      else if (fillMode === "dots") t = Math.hypot((px % 18) - 9, (py % 18) - 9) < 4.5 ? 1 : 0;
      d[i * 4] = r + (r2 - r) * t; d[i * 4 + 1] = g + (g2 - g) * t; d[i * 4 + 2] = b + (b2 - b) * t; d[i * 4 + 3] = 255;
    });
    cctx.putImageData(img, 0, 0);
  }

  function bindCanvas() {
    lc.style.pointerEvents = "none";
    cc.addEventListener("pointerdown", (e) => {
      const [x, y] = pos(e);
      if (tool === "fill") return fill(x, y);
      snapshot();
      drawing = true;
      last = [x, y];
      cc.setPointerCapture(e.pointerId);
      stroke(x, y, x, y);
    });
    cc.addEventListener("pointermove", (e) => {
      if (!drawing) return;
      const [x, y] = pos(e);
      stroke(last[0], last[1], x, y);
      last = [x, y];
    });
    const stop = () => { drawing = false; };
    cc.addEventListener("pointerup", stop);
    cc.addEventListener("pointercancel", stop);
  }

  function stroke(x1, y1, x2, y2) {
    const erase = tool === "eraser";
    if (erase || style === "brush" || style === "marker" || style === "pencil") {
      cctx.globalAlpha = !erase && style === "marker" ? 0.45 : !erase && style === "pencil" ? 0.85 : 1;
      cctx.strokeStyle = erase ? "#fff" : color;
      cctx.lineWidth = !erase && style === "pencil" ? Math.max(2, size / 3) : size;
      cctx.lineCap = cctx.lineJoin = "round";
      cctx.beginPath();
      cctx.moveTo(x1, y1);
      cctx.lineTo(x2, y2 + (x1 === x2 && y1 === y2 ? 0.01 : 0));
      cctx.stroke();
      cctx.globalAlpha = 1;
      return;
    }
    // spuitbus en waskrijt: willekeurige stippen langs de lijn
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / Math.max(2, size / 4)));
    const n = style === "spray" ? Math.ceil(size) : Math.ceil(size * 0.7);
    cctx.fillStyle = color;
    cctx.globalAlpha = style === "spray" ? 0.8 : 0.6;
    for (let s = 0; s <= steps; s++) {
      const cx = x1 + ((x2 - x1) * s) / steps, cy = y1 + ((y2 - y1) * s) / steps;
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * (size / 2);
        const d = style === "spray" ? 1.2 : 2.4;
        cctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, d, d);
      }
    }
    cctx.globalAlpha = 1;
  }

  function composite(withColor) {
    const c = document.createElement("canvas");
    c.width = c.height = SIZE;
    const x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, SIZE, SIZE);
    if (withColor) x.drawImage(cc, 0, 0);
    x.drawImage(lc, 0, 0);
    return c;
  }

  function printIt(withColor) {
    if (!cc) return;
    const area = $("print-area");
    const img = new Image();
    img.onload = () => { window.print(); };
    img.alt = current[1];
    img.src = composite(withColor).toDataURL("image/png");
    area.innerHTML = `<h2>${current[1]}</h2>`;
    area.appendChild(img);
  }

  $("view-coloring").addEventListener("click", (e) => {
    const t = e.target;
    const galleryTab = t.closest("[data-gallery-tab]");
    if (galleryTab) { showGallery(galleryTab.dataset.galleryTab); return; }
    const card = t.closest(".cl-card");
    if (card) return load(Number(card.dataset.id));
    if (t.closest("#cl-back")) { $("cl-editor").hidden = true; showGallery(galleryMode); return; }
    const tl = t.closest("[data-tool]");
    if (tl) { tool = tl.dataset.tool; document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("active", b === tl)); return; }
    const sw = t.closest("[data-color]");
    if (sw) {
      color = sw.dataset.color;
      if (tool === "eraser") { tool = "brush"; document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("active", b.dataset.tool === "brush")); }
      document.querySelectorAll(".cl-sw").forEach((b) => b.classList.toggle("on", b === sw));
      $("cl-custom").value = color;
      return;
    }
    if (t.closest("#cl-undo")) { const s = undo.pop(); if (s) cctx.putImageData(s, 0, 0); return; }
    if (t.closest("#cl-clear")) { if (cc) { snapshot(); cctx.fillStyle = "#fff"; cctx.fillRect(0, 0, SIZE, SIZE); } return; }
    if (t.closest("#cl-print-blank")) return printIt(false);
    if (t.closest("#cl-print-color")) return printIt(true);
    if (t.closest("#cl-save") && cc) {
      const a = document.createElement("a");
      a.download = `${current[1].toLowerCase()}-kleurplaat.png`;
      a.href = composite(true).toDataURL("image/png");
      a.click();
    }
  });
  $("view-coloring").addEventListener("change", (e) => {
    const id = e.target.id, v = e.target.value;
    if (id === "cl-style") style = v;
    else if (id === "cl-fillmode") fillMode = v;
    else if (id === "cl-color2") color2 = v;
    else if (id === "cl-detail" || id === "cl-thick") {
      if (id === "cl-detail") detail = Number(v); else thick = Number(v);
      if (lastImg && cc) buildPage(lastImg, true);
    }
  });
  $("view-coloring").addEventListener("input", (e) => {
    if (e.target.id === "cl-size") size = Number(e.target.value);
    if (e.target.id === "cl-custom") { color = e.target.value; document.querySelectorAll(".cl-sw").forEach((b) => b.classList.remove("on")); }
  });

  document.querySelector('.tab[data-view="coloring"]').addEventListener("click", () => { $("cl-editor").hidden = true; showGallery(galleryMode); });
  document.addEventListener("langchange", () => { renderGallery(); if (!$("cl-editor").hidden && !cc) renderEditor(); });
  renderGallery();
})();
