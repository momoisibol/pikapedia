// Original type-inspired desktop wallpapers for the combined gallery.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const esc = PK.esc;
  const POKEMON_WALLPAPER_ART = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  const WALLPAPERS = [
    { id: "emberfall", title: ["Vuurtype - Emberfall", "Fire Type - Emberfall"], desc: ["Vlamboog en sintels in vurige rood- en goudtinten.", "A sweeping flame and embers in fiery red and gold."], style: "fire", colors: ["#210b18", "#a9272b", "#ff642f", "#ffd477"] },
    { id: "solar-flare", title: ["Vuurtype - Solar Flare", "Fire Type - Solar Flare"], desc: ["Golvende hitte en zonnegloed in koper, oranje en crème.", "Heat waves and a solar glow in copper, orange, and cream."], style: "fire", colors: ["#2b1020", "#c44b32", "#ff9b38", "#fff0b5"] },
    { id: "abyssal-current", title: ["Watertype - Abyssal Current", "Water Type - Abyssal Current"], desc: ["Diepe golven en schuimlicht in oceaanblauw en cyaan.", "Deep waves and foam-light in ocean blue and cyan."], style: "water", colors: ["#07182c", "#07568a", "#12aeb9", "#c7f5ff"] },
    { id: "tidal-glass", title: ["Watertype - Tidal Glass", "Water Type - Tidal Glass"], desc: ["Glasheldere getijden met turquoise reflecties.", "Crystal-clear tides with turquoise reflections."], style: "water", colors: ["#092440", "#2477a0", "#4ed8c2", "#d5ffe9"] },
    { id: "verdant-canopy", title: ["Grastype - Verdant Canopy", "Grass Type - Verdant Canopy"], desc: ["Bladnerven en weelderige lagen in smaragdgroen.", "Leaf-vein patterns and lush layers in emerald green."], style: "grass", colors: ["#08251f", "#16704f", "#56b66d", "#d9ed9b"] },
    { id: "blooming-meadow", title: ["Grastype - Blooming Meadow", "Grass Type - Blooming Meadow"], desc: ["Zachte bladeren en bloeiende accenten in lentegroen.", "Soft leaves and blooming accents in spring green."], style: "grass", colors: ["#102d2b", "#318665", "#a4c95c", "#ffe4a3"] },
    { id: "volt-surge", title: ["Elektrotype - Volt Surge", "Electric Type - Volt Surge"], desc: ["Bliksemvormen en energielijnen in neonblauw en geel.", "Lightning shapes and energy lines in neon blue and yellow."], style: "electric", colors: ["#08152d", "#2358c9", "#33d5e8", "#ffe36e"] },
    { id: "neon-thunder", title: ["Elektrotype - Neon Thunder", "Electric Type - Neon Thunder"], desc: ["Elektrische flitsen over een diep indigoraster.", "Electric flashes over a deep indigo grid."], style: "electric", colors: ["#100d35", "#6a43d6", "#f04fa8", "#a9f5ff"] },
    { id: "glacier-crown", title: ["IJstype - Glacier Crown", "Ice Type - Glacier Crown"], desc: ["Scherpe gletsjerkristallen met ijzige lichtreflecties.", "Sharp glacier crystals with icy light reflections."], style: "ice", colors: ["#071a35", "#227aa5", "#73d4e4", "#e3fbff"] },
    { id: "aurora-frost", title: ["IJstype - Aurora Frost", "Ice Type - Aurora Frost"], desc: ["Bevroren facetten met een zachte violetblauwe gloed.", "Frozen facets with a soft violet-blue glow."], style: "ice", colors: ["#111b43", "#526dc4", "#98c8e8", "#f1e7ff"] },
    { id: "astral-mind", title: ["Psychisch type - Astral Mind", "Psychic Type - Astral Mind"], desc: ["Orbitale banen en een dromerige paarse nevel.", "Orbital paths and a dreamy violet haze."], style: "psychic", colors: ["#170e38", "#5944bd", "#cb63cf", "#ffd0ed"] },
    { id: "prism-dream", title: ["Psychisch type - Prism Dream", "Psychic Type - Prism Dream"], desc: ["Lichtgevende ringen en prismakleuren in roze en blauw.", "Luminous rings and prismatic colors in pink and blue."], style: "psychic", colors: ["#1d173e", "#7458bd", "#ee88b1", "#b9f1e8"] },
    { id: "umbral-eclipse", title: ["Donkertype - Umbral Eclipse", "Dark Type - Umbral Eclipse"], desc: ["Een eclips boven donkere lagen met violet randlicht.", "An eclipse above dark layers with a violet rim of light."], style: "dark", colors: ["#080b1b", "#26234d", "#69519b", "#d7b6ff"] },
    { id: "midnight-veil", title: ["Donkertype - Midnight Veil", "Dark Type - Midnight Veil"], desc: ["Fluisterzachte nachtnevel in inktblauw en nachtroze.", "Quiet night mist in ink blue and midnight rose."], style: "dark", colors: ["#0b1221", "#203e59", "#745071", "#d6a2bc"] },
    { id: "starlit-garden", title: ["Feeëntype - Starlit Garden", "Fairy Type - Starlit Garden"], desc: ["Sprankelende lichtjes en zachte pastelkleurige bogen.", "Glittering lights and soft pastel arcs."], style: "fairy", colors: ["#261337", "#ac5eae", "#ef91c0", "#fff0bc"] },
    { id: "moonpetal", title: ["Feeëntype - Moonpetal", "Fairy Type - Moonpetal"], desc: ["Maanlicht, lichte bloemblaadjes en lavendelkleurige gloed.", "Moonlight, light petals, and a lavender glow."], style: "fairy", colors: ["#1e2249", "#657fc1", "#d39ad1", "#f7e9c8"] },
    { id: "tempest-core", title: ["Drakentype - Tempest Core", "Dragon Type - Tempest Core"], desc: ["Hoekige energiebanen en stormkleuren in indigo en teal.", "Angular energy trails and storm colors in indigo and teal."], style: "dragon", colors: ["#10132e", "#3443a0", "#16a5a2", "#e5d58b"] },
    { id: "ancient-scale", title: ["Drakentype - Ancient Scale", "Dragon Type - Ancient Scale"], desc: ["Gelaagde schubachtige vormen in robijnrood en goud.", "Layered scale-like geometry in ruby red and gold."], style: "dragon", colors: ["#281126", "#8a294b", "#db684a", "#f5ca75"] },
    { id: "basalt-peaks", title: ["Rotstype - Basalt Peaks", "Rock Type - Basalt Peaks"], desc: ["Monumentale steenlagen met grijze en koperen facetten.", "Monumental stone layers with gray and copper facets."], style: "rock", colors: ["#17191f", "#4e555b", "#9c7554", "#e3c9a1"] },
    { id: "crystal-fault", title: ["Rotstype - Crystal Fault", "Rock Type - Crystal Fault"], desc: ["Gebroken rotsvlakken met amethist- en zandkleurige randen.", "Fractured rock planes edged in amethyst and sand."], style: "rock", colors: ["#19172e", "#5c4d78", "#a87968", "#e0c49d"] },
    { id: "dune-horizon", title: ["Grondtype - Dune Horizon", "Ground Type - Dune Horizon"], desc: ["Brede zandduinen in warm oker en woestijnroze.", "Broad sand dunes in warm ochre and desert rose."], style: "ground", colors: ["#2a1835", "#a35452", "#e1a45c", "#f4d49b"] },
    { id: "canyon-drift", title: ["Grondtype - Canyon Drift", "Ground Type - Canyon Drift"], desc: ["Gelaagde canyonlijnen in terracotta, bruin en goud.", "Layered canyon lines in terracotta, brown, and gold."], style: "ground", colors: ["#271922", "#934333", "#cc7445", "#f0bf74"] },
    { id: "chrome-pulse", title: ["Staaltype - Chrome Pulse", "Steel Type - Chrome Pulse"], desc: ["Strakke metalen banen met koele zilverblauwe accenten.", "Clean metallic bands with cool silver-blue accents."], style: "steel", colors: ["#101a2d", "#3e617a", "#9fc4d3", "#eaf7f7"] },
    { id: "iron-nebula", title: ["Staaltype - Iron Nebula", "Steel Type - Iron Nebula"], desc: ["Gefacetteerd staal met een subtiele koperkleurige gloed.", "Faceted steel with a subtle copper glow."], style: "steel", colors: ["#191c2d", "#505a76", "#b07163", "#f1d7b1"] },
    { id: "skybound", title: ["Vliegtype - Skybound", "Flying Type - Skybound"], desc: ["Gestileerde windstromen en wolken in luchtig blauw.", "Stylized wind currents and clouds in airy blue."], style: "flying", colors: ["#10244b", "#4382bf", "#96d4de", "#f2f4d5"] },
    { id: "jade-lattice", title: ["Insecttype - Jade Lattice", "Bug Type - Jade Lattice"], desc: ["Geometrische zeshoeken en jadegroene lichtpunten.", "Geometric hexagons and jade-green points of light."], style: "bug", colors: ["#10251e", "#3d7950", "#a0b94d", "#e9e9a1"] },
    { id: "wisped-moon", title: ["Spooktype - Wisped Moon", "Ghost Type - Wisped Moon"], desc: ["Zwevende lichtslierten en maanlicht in paarsblauw.", "Floating wisps and moonlight in blue-violet."], style: "ghost", colors: ["#10132e", "#424d91", "#8a72bd", "#d9d4ff"] },
    { id: "venom-bloom", title: ["Giftype - Venom Bloom", "Poison Type - Venom Bloom"], desc: ["Abstracte dampkrullen en lichtbellen in giftig groen.", "Abstract vapor curls and glowing bubbles in vivid green."], style: "poison", colors: ["#17152e", "#603b91", "#a7c848", "#e3f598"] },
    { id: "crimson-momentum", title: ["Vechttype - Crimson Momentum", "Fighting Type - Crimson Momentum"], desc: ["Dynamische diagonale energiestrepen in rood en amber.", "Dynamic diagonal energy streaks in red and amber."], style: "fighting", colors: ["#241329", "#9e3346", "#ed7448", "#ffdc8a"] },
    { id: "open-sky", title: ["Normaal type - Open Sky", "Normal Type - Open Sky"], desc: ["Zachte wolkenlagen en ochtendlicht in perzik en hemelsblauw.", "Soft cloud layers and morning light in peach and sky blue."], style: "normal", colors: ["#243250", "#6b9ebd", "#f0ac86", "#fff0c8"] },
  ];
  const POKEMON_WALLPAPERS = [
    { id: "charizard-ember", pokemon: 6, name: ["Charizard", "Charizard"], type: ["VUUR / VLIEGEN", "FIRE / FLYING"], desc: ["Vurige gloed, gloeiende sintels en een dramatische avondlucht.", "Fiery glow, glowing embers, and a dramatic evening sky."], motif: "fire", side: "right", colors: ["#210b18", "#8e2638", "#ff6d36", "#ffc76a"] },
    { id: "mewtwo-psychic", pokemon: 150, name: ["Mewtwo", "Mewtwo"], type: ["PSYCHISCH", "PSYCHIC"], desc: ["Kosmische paarse lichtbanen rond een intense aura.", "Cosmic violet light trails around an intense aura."], motif: "psychic", side: "left", colors: ["#100d2b", "#3b277f", "#a46eff", "#e7bbff"] },
    { id: "rayquaza-storm", pokemon: 384, name: ["Rayquaza", "Rayquaza"], type: ["DRAAK / VLIEGEN", "DRAGON / FLYING"], desc: ["Smaragdgroene stormenergie en diepe wolkenlagen.", "Emerald storm energy and deep cloud layers."], motif: "dragon", side: "right", colors: ["#071b25", "#087d77", "#29d6a0", "#d9f57a"] },
    { id: "lugia-tide", pokemon: 249, name: ["Lugia", "Lugia"], type: ["PSYCHISCH / VLIEGEN", "PSYCHIC / FLYING"], desc: ["Maanlicht boven een glinsterende oceaan in zilverblauw.", "Moonlight over a shimmering silver-blue ocean."], motif: "water", side: "left", colors: ["#07182c", "#255991", "#8bbde0", "#e2f5ff"] },
    { id: "arceus-prismatic", pokemon: 493, name: ["Arceus", "Arceus"], type: ["NORMAAL", "NORMAL"], desc: ["Gouden lichtcirkels en parelmoeren prisma-accenten.", "Golden halos and pearlescent prism accents."], motif: "psychic", side: "right", colors: ["#19172e", "#6e4a77", "#dfb557", "#fff0b8"] },
    { id: "pikachu-voltage", pokemon: 25, name: ["Pikachu", "Pikachu"], type: ["ELEKTRISCH", "ELECTRIC"], desc: ["Elektrische gele flitsen tegen een diepblauwe nacht.", "Electric yellow flashes against a deep blue night."], motif: "electric", side: "left", colors: ["#07152c", "#2451a6", "#ffd83e", "#fff4a8"] },
    { id: "greninja-tide", pokemon: 658, name: ["Greninja", "Greninja"], type: ["WATER / DONKER", "WATER / DARK"], desc: ["Scherpe waterbogen en koele cyaanaccenten.", "Sharp water arcs and cool cyan accents."], motif: "water", side: "right", colors: ["#071426", "#174778", "#18b9ce", "#c1f7ff"] },
    { id: "garchomp-desert", pokemon: 445, name: ["Garchomp", "Garchomp"], type: ["DRAAK / GROND", "DRAGON / GROUND"], desc: ["Ruwe zandsteen, gloeiende lijnen en een stormachtige horizon.", "Rugged sandstone, glowing lines, and a stormy horizon."], motif: "ground", side: "left", colors: ["#1d1223", "#5a3448", "#ce704a", "#f6ca7b"] },
    { id: "gengar-haunted", pokemon: 94, name: ["Gengar", "Gengar"], type: ["SPOOK / GIF", "GHOST / POISON"], desc: ["Spookachtige violette nevel en mysterieuze lichtbollen.", "Eerie violet mist and mysterious orbs of light."], motif: "ghost", side: "right", colors: ["#100d29", "#382369", "#9d63d9", "#d9b6ff"] },
    { id: "lucario-aura", pokemon: 448, name: ["Lucario", "Lucario"], type: ["VECHT / STAAL", "FIGHTING / STEEL"], desc: ["Blauwe auragolven met strakke metalen accenten.", "Blue aura waves with crisp metallic accents."], motif: "steel", side: "left", colors: ["#0b172a", "#214d80", "#50b6de", "#e0f6ff"] },
    { id: "zoroark-shadow", pokemon: 571, name: ["Zoroark", "Zoroark"], type: ["DONKER", "DARK"], desc: ["Rode schaduwbanen en een dramatische zwarte eclips.", "Red shadow trails and a dramatic black eclipse."], motif: "dark", side: "right", colors: ["#100b20", "#4b1836", "#cb3e53", "#ffa36d"] },
    { id: "snorlax-night", pokemon: 143, name: ["Snorlax", "Snorlax"], type: ["NORMAAL", "NORMAL"], desc: ["Rustige nachtblauwe tinten met zachte maanlichtgloed.", "Calm midnight blues with a soft moonlit glow."], motif: "normal", side: "left", colors: ["#101b38", "#315681", "#78b6bb", "#e1dbac"] },
    { id: "umbreon-moon", pokemon: 197, name: ["Umbreon", "Umbreon"], type: ["DONKER", "DARK"], desc: ["Gouden maanringen in diep indigo en nachtblauw.", "Golden moon rings in deep indigo and midnight blue."], motif: "dark", side: "right", colors: ["#080e20", "#182d4e", "#c9a83b", "#fff0a0"] },
    { id: "suicune-glacier", pokemon: 245, name: ["Suicune", "Suicune"], type: ["WATER", "WATER"], desc: ["IJzige watervallen en glinsterende blauwe mist.", "Icy waterfalls and shimmering blue mist."], motif: "ice", side: "left", colors: ["#071d38", "#176d9b", "#69d8e6", "#e5ffff"] },
    { id: "gardevoir-starlight", pokemon: 282, name: ["Gardevoir", "Gardevoir"], type: ["PSYCHISCH / FEE", "PSYCHIC / FAIRY"], desc: ["Lavendelkleurige sterrenstof en elegante lichtbogen.", "Lavender stardust and elegant arcs of light."], motif: "fairy", side: "right", colors: ["#1a1236", "#574294", "#d37cc4", "#ffe4ee"] },
    { id: "dragapult-nebula", pokemon: 887, name: ["Dragapult", "Dragapult"], type: ["DRAAK / SPOOK", "DRAGON / GHOST"], desc: ["Teal nevel, sterrenstof en snelle lichtsporen.", "Teal nebula, stardust, and swift streaks of light."], motif: "dragon", side: "left", colors: ["#081b2d", "#155e72", "#42d5c1", "#d7f5cf"] },
    { id: "koraidon-dawn", pokemon: 1007, name: ["Koraidon", "Koraidon"], type: ["VECHT / DRAAK", "FIGHTING / DRAGON"], desc: ["Koraalrode energie tegen een warme, gouden dageraad.", "Coral-red energy against a warm golden dawn."], motif: "fighting", side: "right", colors: ["#25101c", "#a3383e", "#f17a4c", "#ffe09a"] },
    { id: "miraidon-circuit", pokemon: 1008, name: ["Miraidon", "Miraidon"], type: ["ELEKTRISCH / DRAAK", "ELECTRIC / DRAGON"], desc: ["Futuristische paarse energiebanen met cyanflitsen.", "Futuristic violet energy trails with cyan flashes."], motif: "electric", side: "left", colors: ["#10102d", "#393e9c", "#5cdbeb", "#d2a9ff"] },
    { id: "eevee-prism", pokemon: 133, name: ["Eevee", "Eevee"], type: ["NORMAAL", "NORMAL"], desc: ["Warme amberkleuren met zachte prisma's en lichtdeeltjes.", "Warm amber tones with soft prisms and flecks of light."], motif: "fairy", side: "right", colors: ["#25172a", "#80523c", "#e1a35c", "#ffe3ac"] },
    { id: "lapras-ocean", pokemon: 131, name: ["Lapras", "Lapras"], type: ["WATER / IJS", "WATER / ICE"], desc: ["Poolblauwe golven onder een stille sterrenhemel.", "Polar-blue waves beneath a quiet starry sky."], motif: "water", side: "left", colors: ["#081c37", "#236493", "#58c4d2", "#dff9f3"] },
  ];
  const RESOLUTIONS = [
    { id: "1920x1080", label: ["Full HD - 1920 x 1080", "Full HD - 1920 x 1080"], width: 1920, height: 1080 },
    { id: "2560x1440", label: ["QHD - 2560 x 1440", "QHD - 2560 x 1440"], width: 2560, height: 1440 },
    { id: "3840x2160", label: ["4K UHD - 3840 x 2160", "4K UHD - 3840 x 2160"], width: 3840, height: 2160 },
    { id: "1920x1200", label: ["WUXGA - 1920 x 1200", "WUXGA - 1920 x 1200"], width: 1920, height: 1200 },
    { id: "1080x1920", label: ["Telefoon - 1080 x 1920", "Phone - 1080 x 1920"], width: 1080, height: 1920 },
  ];
  let wallpaperCollection = "types";
  let selectedResolution = RESOLUTIONS[0].id;

  function svgFor(wallpaper, index) {
    const [a, b, c, d] = wallpaper.colors;
    const prefix = `wp-${index}`;
    const stars = Array.from({ length: 44 }, (_, i) => {
      const x = (i * 197 + index * 83) % 1920;
      const y = (i * 131 + index * 211) % 1080;
      const r = i % 9 === 0 ? 3.2 : 1.3 + (i % 3) * .45;
      const opacity = .24 + (i % 5) * .12;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${d}" opacity="${opacity.toFixed(2)}"/>`;
    }).join("");
    const shapes = {
      fire: `
        <circle cx="1430" cy="410" r="300" fill="url(#${prefix}-glow)" opacity=".8"/>
        <path d="M0 1080V830c145-118 180-266 342-397-5 170 63 220 79 333 109-116 169-288 206-478 188 208 169 405 302 528 104-133 121-271 213-395 118 160 162 310 304 449 86-109 179-194 294-267v477Z" fill="url(#${prefix}-flame)" opacity=".68"/>
        <path d="M0 1000q260-150 520 0t520 0 520 0 360-30v110H0Z" fill="${a}" opacity=".7"/>
        <path d="M180 800q180-110 360 0m420-90q190-130 380 0m220 80q110-90 220-20" fill="none" stroke="${d}" stroke-width="6" stroke-linecap="round" opacity=".68"/>
      `,
      water: `
        <circle cx="1490" cy="330" r="280" fill="url(#${prefix}-glow)" opacity=".38"/>
        <path d="M0 520c220-110 390 100 620 0s420-92 650 8 430 100 650-8v560H0Z" fill="${b}" opacity=".72"/>
        <path d="M0 665c240-110 410 98 650 0s415-75 630 22 430 88 640-18v411H0Z" fill="${c}" opacity=".58"/>
        <path d="M0 820c250-105 435 78 660 4s410-45 620 30 430 71 640-28v254H0Z" fill="${d}" opacity=".32"/>
        <path d="M0 617q180-68 360 0t360 0 360 0 360 0 360 0 360 0" fill="none" stroke="${d}" stroke-width="5" opacity=".72"/>
        ${Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 127 + index * 59) % 1880 + 20}" cy="${540 + (i * 73) % 430}" r="${5 + (i % 4) * 3}" fill="${d}" opacity=".34"/>`).join("")}
      `,
      grass: `
        <path d="M0 760q240-180 480 0t480 0 480 0 480 0v320H0Z" fill="${b}" opacity=".64"/>
        <path d="M0 900q260-140 520 0t520 0 520 0 360-20v200H0Z" fill="${c}" opacity=".54"/>
        ${Array.from({ length: 17 }, (_, i) => {
          const x = 70 + i * 112, y = 880 - (i * 79 % 260), lean = i % 2 ? 52 : -46;
          return `<path d="M${x} 1080Q${x - lean} ${y + 130} ${x} ${y}m0 118q${lean} -92 ${lean + 72} -74m${-lean} 10q${-lean} -86 ${-lean - 66} -70" fill="none" stroke="${d}" stroke-width="6" stroke-linecap="round" opacity=".65"/>`;
        }).join("")}
        <circle cx="1440" cy="300" r="190" fill="url(#${prefix}-glow)" opacity=".36"/>
      `,
      electric: `
        <path d="M0 0h1920v1080H0Z" fill="url(#${prefix}-grid)" opacity=".42"/>
        <path d="m1220 80-330 470h242l-260 480 580-620h-278l290-330Z" fill="${d}" opacity=".76"/>
        <path d="M0 300h350l105 105h220m-675 450h290l150-150h280m720-470h180v190h300M1030 1080V890l130-130h260" fill="none" stroke="${b}" stroke-width="8" stroke-linejoin="round" opacity=".7"/>
        <path d="M0 340h330m-325 530h320m1130-500h180m-620 560h280" fill="none" stroke="${d}" stroke-width="3" opacity=".6"/>
        <circle cx="960" cy="530" r="360" fill="url(#${prefix}-glow)" opacity=".28"/>
      `,
      ice: `
        <path d="m120 1080 180-430 180 430Zm260 0 330-800 330 800Zm480 0 220-560 220 560Zm410 0 190-700 190 700Z" fill="${b}" opacity=".38"/>
        <path d="m300 650 260-430 250 430-250-118Zm590 120 210-520 210 520-210-160Zm470-10 170-390 170 390-170-112Z" fill="${c}" opacity=".3"/>
        <path d="M0 950 300 650l260 90 250-120 280 135 210-95 310 150 310-140v410H0Z" fill="${a}" opacity=".54"/>
        <path d="M300 650 560 220l250 430M800 810l300-560 210 520m-40 0 220-450 170 390" fill="none" stroke="${d}" stroke-width="5" opacity=".78"/>
      `,
      psychic: `
        <circle cx="1370" cy="520" r="310" fill="url(#${prefix}-glow)" opacity=".8"/>
        <circle cx="1370" cy="520" r="175" fill="${c}" opacity=".24"/>
        <ellipse cx="1370" cy="520" rx="500" ry="170" fill="none" stroke="${d}" stroke-width="4" opacity=".7" transform="rotate(-18 1370 520)"/>
        <ellipse cx="1370" cy="520" rx="610" ry="245" fill="none" stroke="${b}" stroke-width="3" opacity=".66" transform="rotate(23 1370 520)"/>
        <ellipse cx="930" cy="540" rx="740" ry="350" fill="none" stroke="${c}" stroke-width="2" opacity=".4" transform="rotate(-10 930 540)"/>
        <circle cx="902" cy="365" r="12" fill="${d}"/><circle cx="1784" cy="690" r="9" fill="${d}"/><circle cx="1440" cy="285" r="7" fill="${d}"/>
        <path d="M0 880q360-130 720 0t720 0 480-15v215H0Z" fill="${a}" opacity=".52"/>
      `,
      dark: `
        <circle cx="1390" cy="410" r="250" fill="url(#${prefix}-glow)" opacity=".62"/>
        <circle cx="1390" cy="410" r="150" fill="${a}" opacity=".82"/>
        <circle cx="1450" cy="365" r="148" fill="${d}" opacity=".76"/>
        <path d="M0 660q260-190 520 0t520 0 520 0 360-30v450H0Z" fill="${b}" opacity=".7"/>
        <path d="M0 820q320-140 640 0t640 0 640-18v278H0Z" fill="${a}" opacity=".8"/>
        <path d="M-40 600q280-210 560 0t560 0 560 0 360-20" fill="none" stroke="${c}" stroke-width="4" opacity=".48"/>
      `,
      fairy: `
        <circle cx="1360" cy="460" r="290" fill="url(#${prefix}-glow)" opacity=".74"/>
        <ellipse cx="1360" cy="500" rx="520" ry="190" fill="none" stroke="${d}" stroke-width="5" opacity=".52" transform="rotate(-18 1360 500)"/>
        ${Array.from({ length: 13 }, (_, i) => {
          const x = (i * 173 + index * 61) % 1800 + 60, y = (i * 101 + 135) % 850 + 70, r = 9 + (i % 4) * 8;
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="${d}" opacity=".28"/><circle cx="${x}" cy="${y}" r="${r + 10}" fill="none" stroke="${c}" stroke-width="2" opacity=".46"/>`;
        }).join("")}
        <path d="M0 850q260-130 520 0t520 0 520 0 360-10v240H0Z" fill="${b}" opacity=".46"/>
      `,
      dragon: `
        <path d="m0 700 260-200 250 120 260-260 300 230 280-310 260 180 310-200v820H0Z" fill="${b}" opacity=".55"/>
        <path d="m0 850 260-150 270 120 240-180 280 150 300-185 270 160 300-175v490H0Z" fill="${c}" opacity=".42"/>
        <path d="M120 210h390l90 90h-250l90 90h470l90 90h-650l-90-90h-90m760-310h270l90 90h-180l90 90h270m-1330 400h310l90 90h-220" fill="none" stroke="${d}" stroke-width="5" opacity=".62"/>
        <circle cx="1430" cy="340" r="230" fill="url(#${prefix}-glow)" opacity=".34"/>
      `,
      rock: `
        <path d="m0 750 260-310 210 150 240-390 250 480 230-260 280 330 230-230 220 180v380H0Z" fill="${b}" opacity=".72"/>
        <path d="m0 900 260-180 260 120 230-180 250 210 260-165 250 160 220-130 190 100v245H0Z" fill="${a}" opacity=".76"/>
        <path d="m260 440 210 150 240-390 250 480-250-170-240 90Zm700 70 230-260 280 330-280-145Zm510 60 230-230 220 180" fill="none" stroke="${d}" stroke-width="5" opacity=".64"/>
        <path d="M0 1010q260-60 520 0t520 0 520 0 360-8" fill="none" stroke="${c}" stroke-width="12" opacity=".5"/>
      `,
      ground: `
        <circle cx="1430" cy="360" r="250" fill="url(#${prefix}-glow)" opacity=".7"/>
        <path d="M0 650q230-190 470-15t480 30 480-15 490 20v410H0Z" fill="${b}" opacity=".72"/>
        <path d="M0 800q290-170 580-5t580 5 480-15 280 25v270H0Z" fill="${c}" opacity=".62"/>
        <path d="M0 940q280-105 560 0t560 0 520 0 280-20v160H0Z" fill="${a}" opacity=".72"/>
        <path d="M0 710q260-170 520 0t520 0 520 0 360 0M0 850q280-140 560 0t560 0 520 0 280-10" fill="none" stroke="${d}" stroke-width="5" opacity=".55"/>
      `,
      steel: `
        <path d="M0 0h1920v1080H0Z" fill="url(#${prefix}-grid)" opacity=".52"/>
        <path d="m0 250 650-190 350 90 430-110 490 150v160l-490-150-430 110-350-90L0 410Zm0 600 490-150 430 110 430-120 570 160v150l-570-160-430 120-430-110L0 1000Z" fill="${b}" opacity=".48"/>
        <path d="M0 490h1920M0 620h1920M420 0v1080m540-1080v1080m480-1080v1080" fill="none" stroke="${d}" stroke-width="3" opacity=".46"/>
        <path d="m120 180 250-75 150 45-250 75Zm1050 670 270-80 190 55-270 80Z" fill="${c}" opacity=".56"/>
        <circle cx="1480" cy="320" r="230" fill="url(#${prefix}-glow)" opacity=".26"/>
      `,
      flying: `
        <circle cx="1420" cy="310" r="210" fill="url(#${prefix}-glow)" opacity=".5"/>
        <path d="M-80 440c300-240 550 160 850-30s520-250 800-40 300 180 450 90M-80 610c300-240 550 160 850-30s520-250 800-40 300 180 450 90M-80 780c300-240 550 160 850-30s520-250 800-40 300 180 450 90" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round" opacity=".56"/>
        <path d="M0 790q250-140 500 0t500 0 500 0 420-20v310H0Z" fill="${b}" opacity=".52"/>
        <path d="M0 900q170-90 340 0t340 0 340 0 340 0 340 0 220-15v195H0Z" fill="${c}" opacity=".42"/>
        <path d="M210 310q95-110 190 0-95 110-190 0m810-130q85-95 170 0-85 95-170 0" fill="none" stroke="${d}" stroke-width="5" opacity=".65"/>
      `,
      bug: `
        <path d="M0 0h1920v1080H0Z" fill="url(#${prefix}-grid)" opacity=".28"/>
        ${Array.from({ length: 30 }, (_, i) => {
          const col = i % 6, row = Math.floor(i / 6), x = 160 + col * 310 + (row % 2) * 150, y = 105 + row * 210;
          return `<path d="m${x} ${y - 72} 63 36v72l-63 36-63-36v-72Z" fill="${i % 3 ? b : c}" fill-opacity=".12" stroke="${d}" stroke-opacity=".38" stroke-width="3"/>`;
        }).join("")}
        <path d="M0 850q260-130 520 0t520 0 520 0 360-10v240H0Z" fill="${a}" opacity=".62"/>
        <circle cx="1450" cy="420" r="210" fill="url(#${prefix}-glow)" opacity=".28"/>
      `,
      ghost: `
        <circle cx="1440" cy="350" r="230" fill="url(#${prefix}-glow)" opacity=".58"/>
        <path d="M0 480c180-160 230 140 390-10s225-180 360 0 230 150 380-20 240-150 390 20 230 120 480-60M-20 650c180-160 230 140 390-10s225-180 360 0 230 150 380-20 240-150 390 20 230 120 480-60" fill="none" stroke="${d}" stroke-width="10" stroke-linecap="round" opacity=".42"/>
        <path d="M0 830q250-140 500 0t500 0 500 0 420-20v270H0Z" fill="${b}" opacity=".58"/>
        <ellipse cx="560" cy="390" rx="190" ry="100" fill="none" stroke="${c}" stroke-width="4" opacity=".42"/>
        <ellipse cx="560" cy="390" rx="250" ry="140" fill="none" stroke="${d}" stroke-width="2" opacity=".3"/>
      `,
      poison: `
        <path d="M0 670c190-160 320-60 440 0s210 80 340-50 255-130 390 0 230 110 360-30 255-110 390 10v480H0Z" fill="${b}" opacity=".42"/>
        <path d="M0 820c210-120 360-30 500 30s220 15 340-90 260-90 390 15 240 90 360-30 240-70 330 0v335H0Z" fill="${c}" opacity=".38"/>
        ${Array.from({ length: 16 }, (_, i) => {
          const x = (i * 139 + index * 71) % 1840 + 40, y = 180 + (i * 97) % 700, r = 12 + (i % 5) * 10;
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="${d}" fill-opacity=".12" stroke="${d}" stroke-opacity=".52" stroke-width="3"/>`;
        }).join("")}
        <circle cx="1440" cy="350" r="240" fill="url(#${prefix}-glow)" opacity=".24"/>
      `,
      fighting: `
        <path d="m-100 820 780-920h210L110 1080Zm590 260 780-920h210l-780 920Zm590 0 780-920h160l-780 920Z" fill="${b}" opacity=".3"/>
        <path d="m-100 690 690-820m-90 1130 790-940m-120 940 740-880" fill="none" stroke="${d}" stroke-width="12" stroke-linecap="round" opacity=".58"/>
        <path d="M0 900q280-110 560 0t560 0 520 0 280-10v190H0Z" fill="${a}" opacity=".66"/>
        <circle cx="1430" cy="360" r="220" fill="url(#${prefix}-glow)" opacity=".34"/>
      `,
      normal: `
        <circle cx="1430" cy="340" r="230" fill="url(#${prefix}-glow)" opacity=".7"/>
        <path d="M0 610c170 0 170-170 340-170 120 0 180 75 200 160 40-90 135-150 245-150 145 0 240 100 255 220 60-110 170-180 300-180 185 0 300 130 310 285 65-95 170-155 290-155v460H0Z" fill="${b}" opacity=".64"/>
        <path d="M0 800c190 0 220-135 390-135 140 0 205 105 205 205 45-115 145-190 275-190 150 0 245 105 265 230 65-95 160-150 280-150 160 0 250 100 280 210 70-60 145-90 225-90v200H0Z" fill="${c}" opacity=".5"/>
        <path d="M0 980q260-80 520 0t520 0 520 0 360-10v110H0Z" fill="${a}" opacity=".66"/>
      `,
    }[wallpaper.style];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" role="img" aria-label="${esc(L(wallpaper.title[0], wallpaper.title[1]))}">
      <title>${esc(L(wallpaper.title[0], wallpaper.title[1]))}</title>
      <defs>
        <linearGradient id="${prefix}-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".52" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient>
        <linearGradient id="${prefix}-flame" x1="0" y1="1" x2="0" y2="0"><stop stop-color="${b}"/><stop offset=".58" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient>
        <radialGradient id="${prefix}-glow"><stop stop-color="${d}" stop-opacity=".85"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
        <pattern id="${prefix}-grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0v72" fill="none" stroke="${d}" stroke-width="1" opacity=".28"/></pattern>
        <filter id="${prefix}-blur"><feGaussianBlur stdDeviation="72"/></filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#${prefix}-bg)"/>
      <ellipse cx="420" cy="240" rx="560" ry="350" fill="${c}" opacity=".24" filter="url(#${prefix}-blur)"/>
      <g>${stars}</g>
      ${shapes}
      <rect width="1920" height="1080" fill="none" stroke="${d}" stroke-opacity=".15" stroke-width="2"/>
    </svg>`;
  }

  function drawWallpaperBackdrop(ctx, width, height, wallpaper, index, scale, focalX, focalY) {
    const [base, secondary, accent, glow] = wallpaper.colors;
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, base);
    background.addColorStop(.55, secondary);
    background.addColorStop(1, base);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const halo = ctx.createRadialGradient(focalX, focalY, 0, focalX, focalY, Math.max(width, height) * .55);
    halo.addColorStop(0, glow);
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = .17;
    ctx.strokeStyle = glow;
    ctx.lineWidth = Math.max(1, 2 * scale);
    for (let ring = 0; ring < 5; ring++) {
      ctx.beginPath();
      ctx.ellipse(focalX, focalY, (220 + ring * 82) * scale, (170 + ring * 66) * scale, -.24, -.1, Math.PI * 1.65);
      ctx.stroke();
    }

    if (wallpaper.motif === "water" || wallpaper.motif === "ice") {
      for (let row = 0; row < 7; row++) {
        const y = height * (.18 + row * .12);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(width * .24, y - 90 * scale, width * .32, y + 100 * scale, width * .55, y);
        ctx.bezierCurveTo(width * .76, y - 90 * scale, width * .84, y + 100 * scale, width, y);
        ctx.stroke();
      }
    } else if (wallpaper.motif === "electric" || wallpaper.motif === "fighting") {
      for (let ray = 0; ray < 7; ray++) {
        const x = width * (.12 + ray * .13);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 58 * scale, height * .32);
        ctx.lineTo(x + 24 * scale, height * .32);
        ctx.lineTo(x - 70 * scale, height * .7);
        ctx.stroke();
      }
    } else if (wallpaper.motif === "grass" || wallpaper.motif === "fairy") {
      for (let leaf = 0; leaf < 15; leaf++) {
        const x = width * ((leaf * 47 + index * 19) % 97) / 100;
        const y = height * (.24 + (leaf % 5) * .13);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((leaf % 2 ? 1 : -1) * .55);
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 * scale, 56 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (wallpaper.motif === "fire" || wallpaper.motif === "dragon") {
      for (let flame = 0; flame < 6; flame++) {
        const x = width * (.12 + flame * .15);
        const top = height * (.24 + (flame % 3) * .1);
        ctx.beginPath();
        ctx.moveTo(x - 45 * scale, height);
        ctx.bezierCurveTo(x - 90 * scale, top + 90 * scale, x + 45 * scale, top + 40 * scale, x, top);
        ctx.bezierCurveTo(x + 90 * scale, top + 95 * scale, x + 60 * scale, height * .82, x + 110 * scale, height);
        ctx.stroke();
      }
    } else if (wallpaper.motif === "dark" || wallpaper.motif === "psychic" || wallpaper.motif === "ghost") {
      for (let orbit = 0; orbit < 6; orbit++) {
        ctx.beginPath();
        ctx.ellipse(width * (.18 + orbit * .14), height * (.2 + (orbit % 3) * .2), (70 + orbit * 24) * scale, (34 + orbit * 12) * scale, -.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      for (let plate = 0; plate < 8; plate++) {
        const x = width * (plate / 7);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + width * .18, height);
        ctx.stroke();
      }
    }
    ctx.restore();

    ctx.save();
    for (let particle = 0; particle < 72; particle++) {
      const x = (particle * 197 + index * 83) % width;
      const y = (particle * 131 + index * 211) % height;
      const radius = (particle % 8 === 0 ? 2.4 : 1.1) * scale;
      ctx.globalAlpha = .18 + (particle % 5) * .08;
      ctx.fillStyle = particle % 3 === 0 ? accent : glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function paintPokemonWallpaper(ctx, width, height, wallpaper, index, image) {
    const scale = Math.min(width, height) / 1080;
    const landscape = width >= height;
    const focalX = landscape ? width * (wallpaper.side === "right" ? .72 : .28) : width / 2;
    const focalY = landscape ? height * .48 : height * .42;
    drawWallpaperBackdrop(ctx, width, height, wallpaper, index, scale, focalX, focalY);

    const maxWidth = width * (landscape ? .56 : .88);
    const maxHeight = height * (landscape ? .72 : .62);
    const imageScale = Math.min(maxWidth / image.width, maxHeight / image.height);
    const imageWidth = image.width * imageScale;
    const imageHeight = image.height * imageScale;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "contrast(1.08) saturate(1.04)";
    ctx.shadowColor = wallpaper.colors[3];
    ctx.shadowBlur = 34 * scale;
    ctx.drawImage(image, focalX - imageWidth / 2, focalY - imageHeight / 2, imageWidth, imageHeight);
    ctx.restore();

    const [base, , accent] = wallpaper.colors;
    const textX = landscape
      ? width * (wallpaper.side === "right" ? .075 : .59)
      : width / 2;
    const textY = landscape ? height * .73 : height * .8;
    const textWidth = landscape ? width * .34 : width * .84;
    const align = landscape ? "left" : "center";
    ctx.save();
    ctx.textAlign = align;
    ctx.shadowColor = base;
    ctx.shadowBlur = 18 * scale;
    ctx.fillStyle = accent;
    ctx.fillRect(landscape && wallpaper.side === "left" ? width * .59 : landscape ? width * .075 : width * .42, textY - 48 * scale, 62 * scale, 4 * scale);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(72 * scale)}px Arial, sans-serif`;
    ctx.fillText(L(wallpaper.name[0], wallpaper.name[1]).toUpperCase(), textX, textY + 52 * scale, textWidth);
    ctx.restore();
  }

  async function downloadPokemonWallpaper(wallpaper, index) {
    const resolution = RESOLUTIONS.find((item) => item.id === selectedResolution);
    if (!resolution) throw new Error("The selected wallpaper resolution is unavailable");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = POKEMON_WALLPAPER_ART(wallpaper.pokemon);
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create a wallpaper canvas");
    paintPokemonWallpaper(context, canvas.width, canvas.height, wallpaper, index, image);
    const png = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("Could not encode the Pokémon wallpaper as PNG");
    download(png, `pokemon-${wallpaper.id}-${resolution.id}.png`);
  }

  function render() {
    $("wallpaper-gallery").innerHTML = `
      <div class="wp-collection-tabs wt-chips" role="tablist" aria-label="${L("Wallpapercategorieën", "Wallpaper collections")}">
        <button id="wp-tab-types" class="wt-chip${wallpaperCollection === "types" ? " active" : ""}" type="button" role="tab" aria-selected="${wallpaperCollection === "types"}" aria-controls="wp-panel-types" data-wallpaper-collection="types">${L("Type-wallpapers", "Type-inspired")}</button>
        <button id="wp-tab-pokemon" class="wt-chip${wallpaperCollection === "pokemon" ? " active" : ""}" type="button" role="tab" aria-selected="${wallpaperCollection === "pokemon"}" aria-controls="wp-panel-pokemon" data-wallpaper-collection="pokemon">${L("Pokémon-wallpapers", "Pokémon wallpapers")}</button>
      </div>
      <section id="wp-panel-types" role="tabpanel" aria-labelledby="wp-tab-types"${wallpaperCollection === "types" ? "" : " hidden"}>
        <header class="wp-heading">
          <p class="wp-eyebrow">${L("Geïnspireerd op Pokémon-types", "Inspired by Pokémon types")}</p>
          <h2 class="view-title">${L("Wallpapers voor je bureaublad", "Desktop wallpapers")}</h2>
          <p>${L(`Kies uit ${WALLPAPERS.length} originele wallpapers in 1920 x 1080, met kleuren en elementen van Pokémon-types als inspiratie. Download als scherpe PNG of schaalbare SVG. Zonder personages of logo's.`, `Choose from ${WALLPAPERS.length} original 1920 x 1080 wallpapers inspired by the colors and elements of Pokémon types. Download a crisp PNG or scalable SVG. No characters or logos.`)}</p>
        </header>
        <div class="wp-grid">${WALLPAPERS.map((wallpaper, index) => `
          <article class="wp-card">
            <div class="wp-preview">${svgFor(wallpaper, index)}</div>
            <div class="wp-card-body">
              <div class="wp-title-row"><h3>${L(wallpaper.title[0], wallpaper.title[1])}</h3><span>1920 x 1080</span></div>
              <p>${L(wallpaper.desc[0], wallpaper.desc[1])}</p>
              <div class="wp-actions">
                <button type="button" class="wt-chip wp-download" data-wallpaper-png="${index}">${L("Download PNG", "Download PNG")}</button>
                <button type="button" class="wt-chip wp-download secondary" data-wallpaper-svg="${index}">SVG</button>
              </div>
            </div>
          </article>`).join("")}</div>
      </section>
      <section id="wp-panel-pokemon" role="tabpanel" aria-labelledby="wp-tab-pokemon"${wallpaperCollection === "pokemon" ? "" : " hidden"}>
        <header class="wp-heading">
          <p class="wp-eyebrow">${L("Pokémon in de hoofdrol", "Pokémon in the spotlight")}</p>
          <h2 class="view-title">${L("Pokémon-wallpapers", "Pokémon wallpapers")}</h2>
          <p>${L(`20 kleurrijke composities met Pokémon-illustraties. Kies een resolutie: van Full HD en 4K tot een verticaal telefoonformaat.`, `20 colorful compositions featuring Pokémon artwork. Choose a resolution from Full HD and 4K to a vertical phone format.`)}</p>
          <div class="wp-resolution-control">
            <label for="wp-resolution">${L("Downloadresolutie", "Download resolution")}</label>
            <select id="wp-resolution">${RESOLUTIONS.map((resolution) => `<option value="${resolution.id}"${resolution.id === selectedResolution ? " selected" : ""}>${L(resolution.label[0], resolution.label[1])}</option>`).join("")}</select>
          </div>
        </header>
        <div class="wp-grid">${POKEMON_WALLPAPERS.map((wallpaper, index) => `
          <article class="wp-card wp-pokemon-card">
            <div class="pkwp-preview" data-side="${wallpaper.side}" style="--pkwp-base:${wallpaper.colors[0]};--pkwp-secondary:${wallpaper.colors[1]};--pkwp-accent:${wallpaper.colors[2]};--pkwp-glow:${wallpaper.colors[3]}">
              <div class="pkwp-orbit"></div>
              <img class="pkwp-art" loading="lazy" src="${POKEMON_WALLPAPER_ART(wallpaper.pokemon)}" alt="">
              <div class="pkwp-copy"><strong>${L(wallpaper.name[0], wallpaper.name[1])}</strong></div>
            </div>
            <div class="wp-card-body">
              <div class="wp-title-row"><h3>${L(wallpaper.name[0], wallpaper.name[1])}</h3><span>${L(wallpaper.type[0], wallpaper.type[1])}</span></div>
              <p>${L(wallpaper.desc[0], wallpaper.desc[1])}</p>
              <div class="wp-actions"><button type="button" class="wt-chip wp-download" data-pokemon-wallpaper="${index}">${L("Download PNG", "Download PNG")}</button></div>
            </div>
          </article>`).join("")}</div>
      </section>
      <p id="wp-status" class="wp-status" role="status" aria-live="polite"></p>`;
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadPng(wallpaper, index) {
    const source = URL.createObjectURL(new Blob([svgFor(wallpaper, index)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not create a wallpaper canvas");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const png = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!png) throw new Error("Could not encode the wallpaper as PNG");
      download(png, `${wallpaper.id}-1920x1080.png`);
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  $("wallpaper-gallery").addEventListener("click", async (event) => {
    const collectionTab = event.target.closest("[data-wallpaper-collection]");
    if (collectionTab) {
      wallpaperCollection = collectionTab.dataset.wallpaperCollection;
      $("wp-panel-types").hidden = wallpaperCollection !== "types";
      $("wp-panel-pokemon").hidden = wallpaperCollection !== "pokemon";
      document.querySelectorAll("[data-wallpaper-collection]").forEach((tab) => {
        const active = tab === collectionTab;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      return;
    }

    const button = event.target.closest("[data-wallpaper-png], [data-wallpaper-svg], [data-pokemon-wallpaper]");
    if (!button) return;
    const isPokemonWallpaper = button.hasAttribute("data-pokemon-wallpaper");
    const index = Number(isPokemonWallpaper
      ? button.dataset.pokemonWallpaper
      : button.dataset.wallpaperPng ?? button.dataset.wallpaperSvg);
    const wallpaper = isPokemonWallpaper ? POKEMON_WALLPAPERS[index] : WALLPAPERS[index];
    if (!wallpaper) return;
    const status = $("wp-status");
    const buttons = $("wallpaper-gallery").querySelectorAll(".wp-download");
    buttons.forEach((item) => { item.disabled = true; });
    status.textContent = L("Wallpaper voorbereiden...", "Preparing wallpaper...");
    try {
      if (isPokemonWallpaper) await downloadPokemonWallpaper(wallpaper, index);
      else if (button.hasAttribute("data-wallpaper-png")) await downloadPng(wallpaper, index);
      else download(new Blob([svgFor(wallpaper, index)], { type: "image/svg+xml;charset=utf-8" }), `${wallpaper.id}.svg`);
      status.textContent = L("Download gestart.", "Download started.");
    } catch (error) {
      console.error("Could not create or download wallpaper:", error);
      status.textContent = L("De wallpaper kon niet worden gemaakt. Probeer het opnieuw.", "The wallpaper could not be created. Please try again.");
    } finally {
      buttons.forEach((item) => { item.disabled = false; });
    }
  });

  $("wallpaper-gallery").addEventListener("change", (event) => {
    if (event.target.id === "wp-resolution") selectedResolution = event.target.value;
  });

  document.addEventListener("langchange", render);
  render();
})();
