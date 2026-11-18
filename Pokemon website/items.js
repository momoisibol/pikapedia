(() => {
  const $ = (id) => document.getElementById(id);
  const API = "https://pokeapi.co/api/v2";
  const SPRITE = (name) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;
  const PAGE = 72;

  const ITEM_NAMES_NL = {
    "master-ball": "Meesterbal", "ultra-ball": "Hyperbal", "great-ball": "Superbal",
    "poke-ball": "Pokébal", "safari-ball": "Safaribal", "net-ball": "Netbal",
    "dive-ball": "Duikbal", "nest-ball": "Nestbal", "repeat-ball": "Herhaalbal",
    "timer-ball": "Tijdbal", "luxury-ball": "Luxe bal", "premier-ball": "Premierbal",
    "dusk-ball": "Nachtbal", "heal-ball": "Geneesbal", "quick-ball": "Snelbal",
    "dusk-stone": "Duistersteen", "dawn-stone": "Dageraadsteen",
    "fire-stone": "Vuursteen", "water-stone": "Watersteen",
    "thunder-stone": "Donnersteen", "leaf-stone": "Bladsteen",
    "moon-stone": "Maansteen", "sun-stone": "Zonsteen",
    "shiny-stone": "Schittersteen", "ice-stone": "IJssteen",
    "oval-stone": "Ovale steen", "everstone": "Eeuwsteen",
    "potion": "Potion", "super-potion": "Superpotion", "hyper-potion": "Hyperpotion",
    "max-potion": "Max Potion", "full-restore": "Volledig herstel",
    "antidote": "Tegengif", "burn-heal": "Brandwondgenezer",
    "ice-heal": "IJs-genezer", "awakening": "Ontwaakmiddel",
    "paralyze-heal": "Verlammingsgenezer", "full-heal": "Volledige genezing",
    "revive": "Herstelmiddel", "max-revive": "Maximaal herstel",
    "ether": "Ether", "max-ether": "Max Ether", "elixir": "Elixer",
    "max-elixir": "Max Elixer", "pp-up": "PP-omhoog", "pp-max": "PP-max",
    "escape-rope": "Ontsnappingskoord", "repel": "Weren", "super-repel": "Superweren",
    "max-repel": "Maximaal weren", "rare-candy": "Zeldzaam snoepje",
    "ability-capsule": "Vaardigheidscapsule", "ability-patch": "Vaardigheidspatch",
    "exp-share": "Ervaringsdelen", "lucky-egg": "Geluksei",
    "choice-band": "Keuzeband", "choice-specs": "Keuzelens",
    "choice-scarf": "Keuzesjaal", "focus-sash": "Focusband",
    "leftovers": "Restjes", "assault-vest": "Aanvalsvest",
    "life-orb": "Levensbol", "quick-claw": "Snelklauw",
    "muscle-band": "Spierband", "wise-glasses": "Wijze bril",
    "black-belt": "Zwarte band", "amulet-coin": "Amuletmunt",
    "oval-charm": "Ovale bedel", "shiny-charm": "Shiny-bedel",
    "exp-charm": "Ervaringsbedel", "tera-shard": "Tera-scherf",
    "cheri-berry": "Kersbes", "chesto-berry": "Wakkermakende bes",
    "pecha-berry": "Perzikbes",
    "aspear-berry": "Appelbes", "leppa-berry": "Leppabes",
    "oran-berry": "Oranbes", "sitrus-berry": "Sitrusbes",
    "lum-berry": "Lum-bes", "enigma-berry": "Enigmabes",
  };
  const ITEM_CATEGORIES_NL = {
    "stat-boosters": "Statistiekverhogers", "effort-drop": "EV-verlagers",
    medicine: "Medicijnen", other: "Overig", "in-a-pinch": "Noodherstel",
    "picky-healing": "Selectieve genezing", "type-protection": "Typebescherming",
    "standard-balls": "Standaard Pokéballen", "special-balls": "Speciale Pokéballen",
    "healing": "Geneesmiddelen", "status-cures": "Statusherstel",
    "pp-recovery": "PP-herstel", "revival": "Herstelmiddelen",
    "vitamins": "Vitamines", "stat-boosts": "Statistiekverhogers",
    "flutes": "Fluiten", "spelunking": "Grotverkenning", "collectibles": "Verzamelobjecten",
    "evolution": "Evolutie", "evolution-stones": "Evolutiestenen",
    "held-items": "Vastgehouden voorwerpen", "choice": "Keuzevoorwerpen",
    "bad-held-items": "Nadelig vastgehouden voorwerpen", "effort-training": "EV-training",
    "all-mail": "Brieven", "baking-only": "Bakbenodigdheden",
    "unused": "Ongebruikte voorwerpen", "loot": "Buit", "jewels": "Edelstenen",
    "mulch": "Mest", "mega-stones": "Mega-stenen", "z-crystals": "Z-kristallen",
    "dynamax-crystals": "Dynamax-kristallen", "tera-shards": "Tera-scherven",
    "picnic": "Picknick", "curry-ingredients": "Curry-ingrediënten",
    "curry": "Curry", "sandwich-ingredients": "Sandwich-ingrediënten",
    "event-items": "Evenementvoorwerpen", "key-items": "Belangrijke voorwerpen",
    "all-machines": "Technische machines", "tm-materials": "TM-materialen",
    "all-berries": "Bessen", "all-items": "Alle voorwerpen",
    training: "Training", plates: "Platen", "species-specific": "Pokémon-specifiek",
    "type-enhancement": "Typeversterking", gameplay: "Spelvoorwerpen",
    "plot-advancement": "Verhaalvoorwerpen", "dex-completion": "Pokédex-voltooiing",
    scarves: "Sjaals", "apricorn-balls": "Apricornballen",
    "apricorn-box": "Apricornkist", "data-cards": "Datakaarten",
    "miracle-shooter": "Miracle Shooter", memories: "Herinneringen",
    "species-candies": "Pokémon-snoepjes", "catching-bonus": "Vangstbonus",
    "nature-mints": "Natuur-mints", "tera-shard": "Tera-scherven",
  };
  const ITEM_ATTRIBUTES_NL = {
    countable: "Stapelbaar", consumable: "Verbruikbaar",
    "usable-in-battle": "Te gebruiken in gevechten",
    "usable-overworld": "Te gebruiken buiten gevechten",
    holdable: "Vast te houden", "holdable-active": "Actief bij vasthouden",
    "holdable-passive": "Passief bij vasthouden",
    "usable-in-pokemon-menu": "Te gebruiken vanuit het Pokémon-menu",
    "usable-on-pokemon": "Te gebruiken op een Pokémon",
    "usable-on-opponent": "Te gebruiken op een tegenstander",
    "underground": "Ondergronds te gebruiken",
    "in-a-pokemon-mart": "Te koop in een Pokémon-winkel",
  };
  const ITEM_EFFECTS_NL = {
    "master-ball": "Vangt een wilde Pokémon gegarandeerd.",
    "ultra-ball": "Heeft een hogere vangkans dan een Superbal.",
    "great-ball": "Heeft een hogere vangkans dan een Pokébal.",
    "poke-ball": "Een standaardbal om wilde Pokémon te vangen.",
    potion: "Herstelt 20 HP van een Pokémon.",
    "super-potion": "Herstelt 60 HP van een Pokémon.",
    "hyper-potion": "Herstelt 120 HP van een Pokémon.",
    "max-potion": "Herstelt alle HP van een Pokémon.",
    "full-restore": "Herstelt alle HP en geneest alle statusproblemen van een Pokémon.",
    antidote: "Geneest vergiftiging.",
    "burn-heal": "Geneest brandwonden.",
    "ice-heal": "Geneest bevriezing.",
    awakening: "Maakt een slapende Pokémon wakker.",
    "paralyze-heal": "Geneest verlamming.",
    "full-heal": "Geneest alle statusproblemen van een Pokémon.",
    revive: "Wekt een flauwgevallen Pokémon en herstelt de helft van zijn maximale HP.",
    "max-revive": "Wekt een flauwgevallen Pokémon en herstelt al zijn HP.",
    "rare-candy": "Verhoogt het level van een Pokémon met één.",
    "escape-rope": "Brengt je naar de ingang van de grot of kerker waar je bent.",
    repel: "Houdt zwakke wilde Pokémon tijdelijk op afstand.",
    "super-repel": "Houdt zwakke wilde Pokémon langer op afstand.",
    "max-repel": "Houdt zwakke wilde Pokémon het langst op afstand.",
    "fire-stone": "Laat bepaalde Pokémon evolueren.",
    "water-stone": "Laat bepaalde Pokémon evolueren.",
    "thunder-stone": "Laat bepaalde Pokémon evolueren.",
    "leaf-stone": "Laat bepaalde Pokémon evolueren.",
    "moon-stone": "Laat bepaalde Pokémon evolueren.",
    "sun-stone": "Laat bepaalde Pokémon evolueren.",
    "dusk-stone": "Laat bepaalde Pokémon evolueren.",
    "dawn-stone": "Laat bepaalde Pokémon evolueren.",
    "shiny-stone": "Laat bepaalde Pokémon evolueren.",
    "ice-stone": "Laat bepaalde Pokémon evolueren.",
    "ability-capsule": "Verandert de vaardigheid van een Pokémon in een andere gewone vaardigheid die deze Pokémon kan hebben.",
    "ability-patch": "Verandert de vaardigheid van een Pokémon in zijn verborgen vaardigheid.",
    "exp-share": "Deelt ervaringspunten met de Pokémon die dit voorwerp vasthoudt.",
    "lucky-egg": "Verhoogt de ervaringspunten die de Pokémon die dit voorwerp vasthoudt verdient.",
    "choice-band": "Verhoogt de aanval, maar de Pokémon kan na het kiezen van een aanval alleen die aanval blijven gebruiken.",
    "choice-specs": "Verhoogt de speciale aanval, maar de Pokémon kan na het kiezen van een aanval alleen die aanval blijven gebruiken.",
    "choice-scarf": "Verhoogt de snelheid, maar de Pokémon kan na het kiezen van een aanval alleen die aanval blijven gebruiken.",
    "focus-sash": "Laat een Pokémon met volle HP een aanval overleven die hem anders zou uitschakelen. Wordt daarna verbruikt.",
    leftovers: "Herstelt aan het einde van elke beurt een klein deel van de HP van de Pokémon die dit voorwerp vasthoudt.",
    "assault-vest": "Verhoogt de speciale verdediging, maar de Pokémon kan geen statusaanvallen gebruiken.",
    "life-orb": "Verhoogt de schade van aanvallen, maar kost de Pokémon na een treffer een beetje HP.",
    "quick-claw": "Geeft de Pokémon soms de kans om eerder aan te vallen.",
    "muscle-band": "Verhoogt de kracht van fysieke aanvallen.",
    "wise-glasses": "Verhoogt de kracht van speciale aanvallen.",
    "black-belt": "Verhoogt de kracht van vecht-type-aanvallen.",
    "amulet-coin": "Verdubbelt het prijzengeld na een gevecht waaraan de Pokémon met dit voorwerp meedoet.",
    "oval-charm": "Vergroot de kans dat er eieren verschijnen in de Pokémon-opvang.",
    "shiny-charm": "Vergroot de kans om shiny Pokémon tegen te komen.",
    "exp-charm": "Verhoogt de ervaringspunten die Pokémon in je team verdienen.",
    "tera-shard": "Verandert het Tera-type van een Pokémon naar het type van de scherf.",
    "cheri-berry": "Geneest verlamming wanneer een Pokémon deze bes eet of vasthoudt.",
    "chesto-berry": "Geneest slaap wanneer een Pokémon deze bes eet of vasthoudt.",
    "pecha-berry": "Geneest vergiftiging wanneer een Pokémon deze bes eet of vasthoudt.",
    "aspear-berry": "Geneest bevriezing wanneer een Pokémon deze bes eet of vasthoudt.",
    "leppa-berry": "Herstelt 10 PP van een aanval wanneer een Pokémon deze bes eet of vasthoudt.",
    "oran-berry": "Herstelt 10 HP wanneer een Pokémon deze bes eet of vasthoudt.",
    "sitrus-berry": "Herstelt een deel van de HP wanneer een Pokémon deze bes eet of vasthoudt.",
    "lum-berry": "Geneest elk statusprobleem wanneer een Pokémon deze bes eet of vasthoudt.",
  };
  const CATEGORY_NAMES_EN = {
    "standard-balls": "Standard balls", "special-balls": "Special balls",
    medicine: "Medicine", healing: "Healing", "status-cures": "Status cures",
    "pp-recovery": "PP recovery", revival: "Revival", vitamins: "Vitamins",
    "stat-boosts": "Stat boosts", collectibles: "Collectibles", evolution: "Evolution",
    "evolution-stones": "Evolution stones", "held-items": "Held items",
    "bad-held-items": "Bad held items", "effort-training": "Effort training",
    "all-mail": "Mail", spelunking: "Spelunking", "all-berries": "Berries",
    "all-items": "All items", "all-machines": "Technical machines",
    "tm-materials": "TM materials", "event-items": "Event items",
    "key-items": "Key items", "curry-ingredients": "Curry ingredients",
    "sandwich-ingredients": "Sandwich ingredients", "mega-stones": "Mega stones",
    "z-crystals": "Z crystals", "tera-shards": "Tera shards",
  };
  const CATEGORY_GROUPS = [
    { nl: "Pokéballen", en: "Poké Balls", categories: ["standard-balls", "special-balls", "apricorn-balls"] },
    { nl: "Genezing en training", en: "Healing and training", categories: ["medicine", "healing", "status-cures", "pp-recovery", "revival", "vitamins", "stat-boosts", "stat-boosters", "effort-training", "effort-drop", "in-a-pinch", "picky-healing", "type-protection"] },
    { nl: "Voor je Pokémon", en: "For your Pokémon", categories: ["held-items", "choice", "bad-held-items", "type-enhancement", "species-specific", "nature-mints", "species-candies", "scarves"] },
    { nl: "Evolutie en voortgang", en: "Evolution and progress", categories: ["evolution", "evolution-stones", "key-items", "plot-advancement", "dex-completion", "mega-stones", "z-crystals", "dynamax-crystals", "tera-shards"] },
    { nl: "Bessen en verzamelobjecten", en: "Berries and collectibles", categories: ["all-berries", "collectibles", "jewels", "plates", "all-mail", "memories", "data-cards"] },
    { nl: "Machines en ingrediënten", en: "Machines and ingredients", categories: ["all-machines", "tm-materials", "curry-ingredients", "sandwich-ingredients", "baking-only", "picnic", "mulch"] },
  ];

  let all = [];        // [{name}]
  let catSet = null;   // Set of names in selected category
  let shown = 0;
  let loaded = false;
  let openedItem = null;
  let detailRequest = 0;
  let itemListPromise = null;
  const detailCache = {};
  const translateToDutch = (text) => I18N.translate(text, "en", "nl");

  const pretty = (n) => n.replace(/-/g, " ");
  const L = (nl, en) => I18N.L(nl, en);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const itemName = (name) => I18N.lang === "nl" ? ITEM_NAMES_NL[name] || pretty(name) : pretty(name);
  const categoryName = (name) => I18N.lang === "nl"
    ? ITEM_CATEGORIES_NL[name] || pretty(name)
    : CATEGORY_NAMES_EN[name] || pretty(name);
  const attributeName = (name) => I18N.lang === "nl" ? ITEM_ATTRIBUTES_NL[name] || pretty(name) : pretty(name);

  async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  function loadItemList() {
    if (!itemListPromise) {
      itemListPromise = getJSON(`${API}/item?limit=3000`).catch((error) => {
        itemListPromise = null;
        throw error;
      });
    }
    return itemListPromise;
  }

  function imgTag(name, alt) {
    return `<img loading="lazy" alt="${esc(alt)}" src="${SPRITE(name)}" onerror="this.outerHTML='<div class=&quot;item-ph&quot;>${L("Geen afbeelding", "No image")}</div>'">`;
  }

  async function init() {
    if (loaded) return;
    loaded = true;
    $("item-status").textContent = L("Laden...", "Loading...");
    try {
      const [items, cats] = await Promise.all([
        loadItemList(),
        getJSON(`${API}/item-category?limit=200`),
      ]);
      all = items.results;
      const categories = new Map(cats.results.map((category) => [category.name, category]));
      const select = $("item-cat");
      CATEGORY_GROUPS.forEach((group) => {
        const options = group.categories.map((name) => categories.get(name)).filter(Boolean);
        if (!options.length) return;
        const optgroup = document.createElement("optgroup");
        optgroup.dataset.group = String(CATEGORY_GROUPS.indexOf(group));
        optgroup.label = L(group.nl, group.en);
        options.sort((a, b) => categoryName(a.name).localeCompare(categoryName(b.name)));
        options.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.name;
          option.textContent = categoryName(category.name);
          optgroup.appendChild(option);
          categories.delete(category.name);
        });
        select.appendChild(optgroup);
      });
      const remaining = [...categories.values()].sort((a, b) => categoryName(a.name).localeCompare(categoryName(b.name)));
      if (remaining.length) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = L("Overige categorieën", "Other categories");
        remaining.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.name;
          option.textContent = categoryName(category.name);
          optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
      }
      render();
    } catch {
      loaded = false;
      $("item-status").textContent = L("Kon de items niet laden. Controleer je internetverbinding.", "Could not load the items. Check your internet connection.");
    }
  }

  function filtered() {
    const q = $("item-search").value.trim().toLowerCase().replace(/\s+/g, "-");
    return all.filter((i) => {
      const localizedName = itemName(i.name).toLowerCase().replace(/\s+/g, "-");
      return (!q || i.name.includes(q) || localizedName.includes(q)) && (!catSet || catSet.has(i.name));
    });
  }

  let current = [];
  function render() {
    current = filtered();
    shown = 0;
    $("item-grid").innerHTML = "";
    $("item-status").textContent = current.length
      ? L(`${current.length} voorwerp${current.length === 1 ? "" : "en"}`, `${current.length} item${current.length === 1 ? "" : "s"}`)
      : L("Geen items gevonden.", "No items found.");
    more();
  }

  function more() {
    const slice = current.slice(shown, shown + PAGE);
    shown += slice.length;
    $("item-grid").insertAdjacentHTML(
      "beforeend",
      slice.map((i) => `<div class="item-card" data-name="${esc(i.name)}">${imgTag(i.name, itemName(i.name))}${esc(itemName(i.name))}</div>`).join("")
    );
    $("item-more").hidden = shown >= current.length;
  }

  async function openItem(name) {
    const modal = $("modal");
    const body = $("modal-body");
    openedItem = name;
    const request = ++detailRequest;
    modal.hidden = false;
    body.innerHTML = `<p style='text-align:center'>${L("Laden...", "Loading...")}</p>`;
    try {
      const it = detailCache[name] || (detailCache[name] = await getJSON(`${API}/item/${name}`));
      if (request !== detailRequest || modal.hidden) return;
      const nl = I18N.lang === "nl";
      const eff = it.effect_entries.find((e) => e.language.name === (nl ? "nl" : "en")) ||
        it.effect_entries.find((e) => e.language.name === "en");
      const flavors = [...it.flavor_text_entries].reverse();
      const flavor = flavors.find((f) => f.language.name === (nl ? "nl" : "en")) ||
        (nl ? flavors.find((f) => f.language.name === "en") : null);
      const clean = (t) => esc(t.replace(/[\f\n]/g, " ").replace(/\s+/g, " ").trim());
      const localizedEffect = nl && ITEM_EFFECTS_NL[it.name];
      const shortEffect = eff && (eff.short_effect || eff.effect);
      const hasMore = eff && eff.effect && eff.short_effect && eff.effect !== eff.short_effect;
      const attributes = await Promise.all(it.attributes.map((a) =>
        nl && !ITEM_ATTRIBUTES_NL[a.name] ? translateToDutch(pretty(a.name)) : Promise.resolve(attributeName(a.name))
      ));
      const [displayName, displayCategory, translatedShort, translatedMore, translatedFlavor] = await Promise.all([
        nl && !ITEM_NAMES_NL[it.name] ? translateToDutch(pretty(it.name)) : Promise.resolve(itemName(it.name)),
        nl && !ITEM_CATEGORIES_NL[it.category.name] ? translateToDutch(pretty(it.category.name)) : Promise.resolve(categoryName(it.category.name)),
        nl && !localizedEffect && shortEffect && eff.language.name !== "nl" ? translateToDutch(shortEffect) : Promise.resolve(shortEffect),
        nl && hasMore && eff.language.name !== "nl" ? translateToDutch(eff.effect) : Promise.resolve(hasMore ? eff.effect : ""),
        nl && flavor && flavor.language.name !== "nl" ? translateToDutch(flavor.text) : Promise.resolve(flavor ? flavor.text : ""),
      ]);
      if (request !== detailRequest || modal.hidden) return;
      const effectText = localizedEffect ? esc(localizedEffect)
        : translatedShort ? clean(translatedShort)
          : L("Geen uitleg beschikbaar.", "No description available.");

      const tags = [];
      if (it.cost) tags.push(`${L("Prijs", "Price")}: ${it.cost}`);
      if (it.fling_power) tags.push(`${L("Gooi-kracht", "Fling power")}: ${it.fling_power}`);
      attributes.forEach((attribute) => tags.push(attribute));

      body.innerHTML = `
        <div class="item-detail">
          ${imgTag(it.name, displayName)}
          <h2>${esc(displayName)}</h2>
          <span class="cat">${esc(displayCategory)}</span>
          <div class="effect">
            <b>${L("Wat doet dit item?", "What does this item do?")}</b>
            ${effectText}
          </div>
          ${translatedFlavor ? `<p class="desc">${clean(translatedFlavor)}</p>` : ""}
          ${hasMore ? `<div class="effect"><b>${L("Meer uitleg", "More details")}</b>${clean(translatedMore)}</div>` : ""}
          ${nl ? `<small class="item-translation-note">${L("Automatisch vertaald vanuit de Engelse databron.", "Automatically translated from the English source.")}</small>` : ""}
          <div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div>`;
    } catch (error) {
      console.error("Could not load or translate item details:", error);
      if (request === detailRequest && !modal.hidden) {
        body.innerHTML = `<p style='text-align:center'>${L("De itemdetails of Nederlandse vertaling konden niet worden geladen. Probeer het opnieuw.", "The item details or Dutch translation could not be loaded. Please try again.")}</p>`;
      }
    }
  }

  document.querySelector('.tab[data-view="items"]')?.addEventListener("click", init);
  document.addEventListener("navview", (e) => { if (e.detail.view === "items") init(); });
  $("item-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".item-card");
    if (card) openItem(card.dataset.name);
  });
  $("item-more").addEventListener("click", more);

  let timer;
  $("item-search").addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 150);
  });
  $("item-cat").addEventListener("change", async () => {
    const cat = $("item-cat").value;
    if (!cat) { catSet = null; return render(); }
    $("item-status").textContent = L("Laden...", "Loading...");
    try {
      const data = await getJSON(`${API}/item-category/${cat}`);
      catSet = new Set(data.items.map((i) => i.name));
    } catch { catSet = null; }
    render();
  });
  document.addEventListener("langchange", () => {
    if (!loaded) return;
    [...$("item-cat").options].forEach((option) => {
      if (option.value) option.textContent = categoryName(option.value);
    });
    [...$("item-cat").querySelectorAll("optgroup")].forEach((group) => {
      const configured = CATEGORY_GROUPS[Number(group.dataset.group)];
      group.label = configured ? L(configured.nl, configured.en) : L("Overige categorieën", "Other categories");
    });
    render();
    if (!$("modal").hidden && openedItem) openItem(openedItem);
  });

  window.ITEM_SEARCH = {
    async find(query) {
      const normalize = (value) => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      const q = normalize(query);
      if (q.length < 2) return [];
      const entries = all.length ? all : (await loadItemList()).results;
      return entries
        .map((item) => ({ name: item.name, label: itemName(item.name) }))
        .filter((item) => normalize(`${item.name} ${item.label}`).includes(q))
        .slice(0, 5)
        .map((item) => ({ ...item, sub: L("Itemgids", "Item guide") }));
    },
    open(name) {
      NAV.go("items");
      const field = $("item-search");
      field.value = name;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    },
  };
})();
