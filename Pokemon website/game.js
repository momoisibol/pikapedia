(() => {
  const $ = (id) => document.getElementById(id);
  const NAME_API = "https://pokeapi.co/api/v2";
  const ART = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const MAX_LIVES = 3;
  const L = (nl, en) => I18N.L(nl, en);
  const MODES = ["silhouette", "cry"];
  const GENS = [
    ["1", "Kanto"], ["2", "Johto"], ["3", "Hoenn"], ["4", "Sinnoh"], ["5", "Unova"],
    ["6", "Kalos"], ["7", "Alola"], ["8", "Galar"], ["9", "Paldea"],
  ];

  // --- Game state ---
  let pool = [];
  let score, lives, streak, current, answered;
  let mode = localStorage.getItem("quizMode") || "silhouette";
  if (!MODES.includes(mode)) mode = "silhouette";
  let cryUrl = "";
  let roundToken = 0;
  let best = Number(localStorage.getItem("quizBest") || 0);
  let selected = new Set(JSON.parse(localStorage.getItem("quizGens") || "null") || GENS.map(([g]) => g));
  const poolCache = {};
  const detailCache = {};

  const show = (name) => {
    ["game-start", "game-round", "game-over"].forEach((id) => ($(id).hidden = id !== name));
  };
  const pretty = PK.pretty;
  const idFromUrl = (u) => Number(u.split("/").filter(Boolean).pop());

  function saveGens() { localStorage.setItem("quizGens", JSON.stringify([...selected])); }

  function renderGens() {
    $("game-gens").innerHTML = GENS.map(
      ([g, r]) => `<label class="gen-pick${selected.has(g) ? " on" : ""}"><input type="checkbox" class="gen-check" value="${g}" ${selected.has(g) ? "checked" : ""}>
        <b>${L("Generatie", "Generation")} ${g}</b><small>${r}</small></label>`
    ).join("");
    $("game-play").disabled = selected.size === 0;
    $("game-sel-count").textContent = selected.size ? `${selected.size} / ${GENS.length}` : L("Kies minstens één generatie", "Pick at least one generation");
  }

  async function loadGen(gen) {
    if (poolCache[gen]) return poolCache[gen];
    const data = await getJSON(`${NAME_API}/generation/${gen}`);
    return (poolCache[gen] = data.pokemon_species.map((s) => ({ id: idFromUrl(s.url), name: s.name })));
  }

  async function getJSON(url) {
    if (!detailCache[url]) {
      detailCache[url] = fetch(url).then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      });
    }
    return detailCache[url];
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateHud() {
    $("g-score").textContent = score;
    $("g-streak").textContent = streak;
    $("g-lives").textContent = L(`Levens: ${lives}/${MAX_LIVES}`, `Lives: ${lives}/${MAX_LIVES}`);
  }

  async function startGame() {
    const btn = $("game-play");
    const label = btn.textContent;
    mode = $("game-mode").value;
    localStorage.setItem("quizMode", mode);
    btn.disabled = true;
    btn.textContent = L("Laden...", "Loading...");
    try {
      pool = (await Promise.all([...selected].map(loadGen))).flat();
    } catch {
      btn.disabled = false;
      btn.textContent = label;
      alert(L("Kon de Pokémon niet laden. Controleer je internetverbinding.", "Could not load the Pokémon. Check your internet connection."));
      return;
    }
    btn.disabled = false;
    btn.textContent = label;
    score = 0; lives = MAX_LIVES; streak = 0;
    show("game-round");
    nextRound();
  }

  function preload(id) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = ART(id);
    });
  }

  async function nextRound() {
    const request = ++roundToken;
    answered = false;
    updateHud();
    $("g-next").hidden = true;
    $("g-msg").textContent = L("Laden...", "Loading...");
    $("g-options").innerHTML = "";

    current = pool[Math.floor(Math.random() * pool.length)];
    const others = shuffle(pool.filter((p) => p.id !== current.id)).slice(0, 3);
    const options = shuffle([current, ...others]);

    const img = $("g-img");
    const cryButton = $("g-cry-play");
    cryButton.hidden = true;
    img.hidden = mode === "cry";
    img.classList.toggle("silhouette", mode === "silhouette");
    img.style.visibility = mode === "silhouette" ? "hidden" : "";
    $("g-msg").textContent = L("Wie is deze Pokémon?", "Who's that Pokémon?");

    try {
      if (mode === "silhouette") {
        img.style.transition = "none";
        img.src = ART(current.id);
        await preload(current.id);
        if (request !== roundToken) return;
        img.getBoundingClientRect();
        img.style.visibility = "";
        img.style.transition = "";
      } else if (mode === "cry") {
        const pokemon = await getJSON(`${NAME_API}/pokemon/${current.id}`);
        if (request !== roundToken) return;
        cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy || "";
        cryButton.hidden = !cryUrl;
        $("g-msg").textContent = cryUrl
          ? L("Luister naar de cry en raad de Pokémon.", "Listen to the cry and guess the Pokémon.")
          : L("Voor deze Pokémon is geen cry beschikbaar.", "No cry is available for this Pokémon.");
      }
    } catch (error) {
      console.error("Could not load quiz clue:", error);
      if (request === roundToken) {
        $("g-msg").textContent = L("De vraag kon niet worden geladen. Probeer het opnieuw.", "Could not load the question. Try again.");
        $("g-next").textContent = L("Opnieuw proberen", "Try again");
        $("g-next").hidden = false;
      }
      return;
    }

    options.forEach((o) => {
      const b = document.createElement("button");
      b.className = "option";
      b.textContent = pretty(o.name);
      b.dataset.id = o.id;
      b.addEventListener("click", () => answer(b));
      $("g-options").appendChild(b);
    });
  }

  function answer(btn) {
    if (answered) return;
    answered = true;
    const correct = Number(btn.dataset.id) === current.id;

    $("g-img").classList.remove("silhouette");
    document.querySelectorAll(".option").forEach((b) => {
      b.disabled = true;
      if (Number(b.dataset.id) === current.id) b.classList.add("correct");
    });

    if (correct) {
      streak++;
      score += 10 + Math.min(streak - 1, 5) * 2;
      $("g-msg").textContent = L(`Goed! Het is ${pretty(current.name)}!`, `Correct! It's ${pretty(current.name)}!`);
    } else {
      btn.classList.add("wrong");
      streak = 0;
      lives--;
      $("g-msg").textContent = L(`Helaas! Het was ${pretty(current.name)}.`, `Too bad! It was ${pretty(current.name)}.`);
    }
    updateHud();

    const next = $("g-next");
    next.hidden = false;
    next.textContent = lives > 0 ? L("Volgende", "Next") : L("Bekijk resultaat", "See result");
    next.focus();
  }

  function endGame() {
    $("o-score").textContent = score;
    const rec = $("o-record");
    if (score > best) {
      best = score;
      localStorage.setItem("quizBest", String(best));
      rec.textContent = L("Nieuw record!", "New record!");
    } else {
      rec.textContent = L(`Highscore: ${best}`, `High score: ${best}`);
    }
    $("best-start").textContent = best;
    show("game-over");
  }

  $("game-gens").addEventListener("change", (e) => {
    if (!e.target.matches(".gen-check")) return;
    e.target.checked ? selected.add(e.target.value) : selected.delete(e.target.value);
    saveGens();
    renderGens();
  });
  $("gens-all").addEventListener("click", () => { selected = new Set(GENS.map(([g]) => g)); saveGens(); renderGens(); });
  $("gens-none").addEventListener("click", () => { selected = new Set(); saveGens(); renderGens(); });
  document.addEventListener("langchange", renderGens);
  renderGens();

  $("best-start").textContent = best;
  $("game-mode").value = mode;
  $("game-mode").addEventListener("change", () => {
    mode = $("game-mode").value;
    localStorage.setItem("quizMode", mode);
  });
  $("g-cry-play").addEventListener("click", () => {
    if (!cryUrl) return;
    const audio = new Audio(cryUrl);
    audio.play().catch((error) => {
      console.error("Could not play Pokémon cry:", error);
      $("g-msg").textContent = L("De cry kon niet worden afgespeeld.", "Could not play the cry.");
    });
  });
  $("game-play").addEventListener("click", startGame);
  $("game-again").addEventListener("click", startGame);
  $("game-menu").addEventListener("click", () => show("game-start"));
  $("g-next").addEventListener("click", () => (lives > 0 ? nextRound() : endGame()));
})();
