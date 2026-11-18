(() => {
  const $ = (id) => document.getElementById(id);
  const ART = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const SHINY = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
  let personalityCatalogPromise = null;

  function idFromApiUrl(url) {
    return Number(url.replace(/\/+$/, "").split("/").pop());
  }

  function loadPersonalityCatalog() {
    if (!personalityCatalogPromise) {
      personalityCatalogPromise = (async () => {
        const [dex, typeIndexes, generationIndexes] = await Promise.all([
          PK.dex(),
          Promise.all(PK.allTypes().map(async (type) => {
            const response = await fetch(`https://pokeapi.co/api/v2/type/${encodeURIComponent(type)}`);
            if (!response.ok) throw new Error(`PokéAPI type ${type}: HTTP ${response.status}`);
            return { type, data: await response.json() };
          })),
          Promise.all(Array.from({ length: 9 }, async (_, index) => {
            const generation = index + 1;
            const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`);
            if (!response.ok) throw new Error(`PokéAPI generation ${generation}: HTTP ${response.status}`);
            return { generation, data: await response.json() };
          })),
        ]);
        const species = Object.entries(dex)
          .map(([name, id]) => ({ id, name }))
          .filter((pokemon) => Number.isInteger(pokemon.id) && pokemon.id > 0)
          .sort((a, b) => a.id - b.id);
        if (!species.length) throw new Error("The Pokémon species index is unavailable.");

        const speciesIds = new Set(species.map((pokemon) => pokemon.id));
        const typesById = new Map();
        typeIndexes.forEach(({ type, data }) => {
          data.pokemon.forEach(({ pokemon }) => {
            const id = idFromApiUrl(pokemon.url);
            if (!speciesIds.has(id)) return;
            if (!typesById.has(id)) typesById.set(id, []);
            typesById.get(id).push(type);
          });
        });
        const generationById = new Map();
        generationIndexes.forEach(({ generation, data }) => {
          data.pokemon_species.forEach((entry) => generationById.set(idFromApiUrl(entry.url), generation));
        });
        const missing = species.filter((pokemon) => !typesById.has(pokemon.id) || !generationById.has(pokemon.id));
        if (missing.length) throw new Error(`${missing.length} Pokémon are missing type or generation data.`);
        return species.map((pokemon) => ({
          ...pokemon,
          types: typesById.get(pokemon.id),
          generation: generationById.get(pokemon.id),
        }));
      })().catch((error) => {
        personalityCatalogPromise = null;
        throw error;
      });
    }
    return personalityCatalogPromise;
  }

  const PERSONALITY_QUESTIONS = [
    {
      question: "Welke rol neem jij het liefst in een team?",
      options: [
        { label: "Ik sta vooraan en neem initiatief", types: ["fighting", "fire", "dragon"] },
        { label: "Ik denk vooruit en lees de situatie", types: ["psychic", "steel", "ghost"] },
        { label: "Ik bescherm de rest en houd vol", types: ["rock", "ground", "steel"] },
        { label: "Ik ondersteun en pas me aan", types: ["fairy", "grass", "water"] },
      ],
    },
    {
      question: "In welke omgeving voel jij je het meest thuis?",
      options: [
        { label: "Een dicht bos vol verborgen paden", types: ["grass", "bug"] },
        { label: "Een kust, meer of diepe oceaan", types: ["water", "ice"] },
        { label: "Een grot of ruig berggebied", types: ["rock", "ground", "dark"] },
        { label: "Een hoge skyline met bliksem en wind", types: ["flying", "electric"] },
      ],
    },
    {
      question: "Welk Pokémon-type past het meest bij jouw stijl?",
      options: PK.allTypes().map((type) => ({ label: PK.typeName(type), types: [type] }))
        .concat({ label: "Ik sta open voor elk type" }),
    },
    {
      question: "Hoe pak jij een lastige uitdaging aan?",
      options: [
        { label: "Ik ga er direct en vol energie op af", types: ["fire", "fighting"] },
        { label: "Ik zoek eerst een slimme opening", types: ["psychic", "ghost"] },
        { label: "Ik blijf flexibel en verander van aanpak", types: ["water", "flying", "normal"] },
        { label: "Ik houd stand tot ik de beste kans zie", types: ["rock", "steel", "ground"] },
      ],
    },
    {
      question: "Welke sfeer spreekt jou het meest aan?",
      options: [
        { label: "Vrolijk, warm en hoopvol", types: ["fairy", "electric"] },
        { label: "Mysterieus en een beetje duister", types: ["ghost", "dark", "poison"] },
        { label: "Wild, natuurlijk en ongetemd", types: ["grass", "bug", "dragon"] },
        { label: "Bijzonder, zeldzaam en bijna mythisch", types: ["psychic", "dragon"] },
      ],
    },
    {
      question: "Welke eigenschap waardeer je het meest in een partner?",
      options: [
        { label: "Trouw en betrouwbaar", types: ["normal", "fairy"] },
        { label: "Moedig en niet bang om te vechten", types: ["fighting", "fire"] },
        { label: "Rustig, wijs en opmerkzaam", types: ["psychic", "water"] },
        { label: "Onafhankelijk en onvoorspelbaar", types: ["dark", "ghost"] },
      ],
    },
    {
      question: "Welke gevechtsaanpak past het beste bij jou?",
      options: [
        { label: "Snel toeslaan voordat de ander reageert", types: ["electric", "flying"] },
        { label: "Tegenaanvallen en de verdediging openbreken", types: ["fighting", "ground"] },
        { label: "De tegenstander afremmen met slimme effecten", types: ["poison", "ghost"] },
        { label: "Beschermen, volhouden en kansen afwachten", types: ["steel", "rock"] },
      ],
    },
    {
      question: "Welke Pokémon-generatie zou je het liefst verkennen?",
      options: [
        ...["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"]
          .map((region, index) => ({ label: `Generatie ${index + 1} · ${region}`, generation: index + 1 })),
        { label: "Geen voorkeur voor een bepaalde generatie" },
      ],
    },
    {
      question: "Kies het avontuur dat je het liefst beleeft.",
      options: [
        { label: "Een vulkaan beklimmen en de hitte trotseren", types: ["fire", "rock"] },
        { label: "Een geheime tuin midden in de natuur vinden", types: ["grass", "fairy"] },
        { label: "Een onbekende wereld onder water ontdekken", types: ["water", "ice"] },
        { label: "Een storm volgen tot boven de wolken", types: ["electric", "dragon", "flying"] },
      ],
    },
    {
      question: "Welke rol vind je het leukst om in een gevecht te spelen?",
      options: [
        { label: "Razendsnelle aanvaller", types: ["electric", "flying"] },
        { label: "Krachtige aanvaller", types: ["fighting", "fire", "ground"] },
        { label: "Specialist met verrassende aanvallen", types: ["psychic", "ghost"] },
        { label: "Stevige verdediger", types: ["steel", "rock"] },
      ],
    },
    {
      question: "Welk ontwerp spreekt je het meest aan?",
      options: [
        { label: "Klein, schattig en vriendelijk", types: ["fairy", "normal"] },
        { label: "Elegant en verbonden met water of ijs", types: ["water", "ice"] },
        { label: "Gepantserd en onverzettelijk", types: ["steel", "rock"] },
        { label: "Magisch, vreemd of ongrijpbaar", types: ["psychic", "ghost"] },
      ],
    },
    {
      question: "Wat voeg jij het liefst aan een groep toe?",
      options: [
        { label: "Bescherming en stabiliteit", types: ["rock", "steel", "ground"] },
        { label: "Steun, herstel en samenwerking", types: ["fairy", "grass", "water"] },
        { label: "Slimme trucs en status-effecten", types: ["poison", "dark", "ghost"] },
        { label: "Een sterke start en veel initiatief", types: ["fighting", "fire", "electric"] },
      ],
    },
    {
      question: "Welke kleurwereld voelt het meest als jouw wereld?",
      options: [
        { label: "Groen: natuur en groei", types: ["grass", "bug"] },
        { label: "Blauw: rust, water en kou", types: ["water", "ice"] },
        { label: "Paars: mysterie en gedachten", types: ["psychic", "poison", "ghost"] },
        { label: "Rood: warmte, lef en actie", types: ["fire", "fighting"] },
      ],
    },
    {
      question: "Wat doe je als een plan ineens niet meer werkt?",
      options: [
        { label: "Ik bedenk direct een andere aanpak", types: ["water", "flying", "normal"] },
        { label: "Ik zoek uit waarom het misging", types: ["psychic", "steel"] },
        { label: "Ik zet door en geef niet op", types: ["fighting", "rock"] },
        { label: "Ik verras iedereen met iets onverwachts", types: ["ghost", "dark", "bug"] },
      ],
    },
    {
      question: "Wat wil je vooral uit een Pokémon-avontuur halen?",
      options: [
        { label: "Ruïnes en verborgen schatten ontdekken", types: ["ground", "rock", "psychic"] },
        { label: "Vrij kunnen reizen door de lucht", types: ["flying", "dragon"] },
        { label: "Een plek of groep helpen beschermen", types: ["grass", "fairy", "steel"] },
        { label: "Geheimen ontrafelen en het onbekende vinden", types: ["ghost", "dark", "psychic"] },
      ],
    },
  ];

  const articles = [
    {
      id: "geschiedenis",
      tag: "Geschiedenis",
      title: "Hoe Pokémon begon",
      intro: "Van insecten verzamelen in de wijk tot een wereldwijd fenomeen.",
      img: ART(1), c1: "#56ab2f", c2: "#a8e063",
      body: `
        <p>Pokémon is bedacht door <b>Satoshi Tajiri</b>, die als kind in een buitenwijk van Tokio graag insecten en kikkervisjes ving. Toen die natuur door steden en gebouwen verdween, wilde hij dat gevoel van verzamelen terugbrengen in een spel.</p>
        <h4>De eerste spellen</h4>
        <p>Samen met zijn bedrijf <b>Game Freak</b> maakte hij <i>Pocket Monsters Red en Green</i>, die op 27 februari 1996 in Japan uitkwamen voor de Game Boy. De naam <i>Pocket Monsters</i> werd later ingekort tot <b>Pokémon</b>. In 1998 kwamen <i>Red</i> en <i>Blue</i> naar Amerika en Europa.</p>
        <h4>De ontwerpen</h4>
        <p>Veel van de eerste Pokémon zijn getekend door <b>Ken Sugimori</b>. Het eerste spel had 151 Pokémon; inmiddels zijn het er meer dan 1000.</p>
        <div class="fact"><b>Wist je dat?</b> Het idee van twee versies van hetzelfde spel (zoals Red en Blue) is bedoeld om spelers met elkaar te laten ruilen, net als Tajiri vroeger insecten ruilde.</div>
        <h4>Van spel naar wereldwijd fenomeen</h4>
        <p>Na de spellen kwamen er een tekenfilmserie, een kaartspel, speelgoed en films. In 2016 verscheen <i>Pokémon GO</i>, waarmee miljoenen mensen buiten Pokémon gingen vangen.</p>`,
    },
    {
      id: "pikachu",
      tag: "Pokémon in de spotlight",
      title: "Pikachu: de beroemdste muis ter wereld",
      intro: "Waarom dit gele elektrische beestje het gezicht van Pokémon werd.",
      img: ART(25), c1: "#f7971e", c2: "#ffd200",
      body: `
        <p>Pikachu is nummer <b>#25</b> in de Pokédex en een Pokémon van het type <b>Elektrisch</b>. Zijn naam komt van het Japanse <i>pika</i> (het geluid van een vonk) en <i>chu</i> (het piepgeluid van een muis).</p>
        <h4>Evoluties</h4>
        <p>Pikachu ontwikkelt zich uit <b>Pichu</b> wanneer die genoeg vriendschap met zijn trainer heeft. Met een <b>Thunder Stone</b> (Donderssteen) verandert Pikachu in <b>Raichu</b>.</p>
        <h4>Waarom Pikachu?</h4>
        <p>In de tekenfilmserie kreeg Ash een Pikachu als eerste Pokémon, in plaats van een van de drie starters. Daardoor werd Pikachu het gezicht van de hele serie. Het ontwerp is van <b>Atsuko Nishida</b>.</p>
        <div class="fact"><b>Wist je dat?</b> Pikachu heeft zakjes in zijn wangen waarin hij elektriciteit opslaat.</div>`,
    },
    {
      id: "types",
      tag: "Strategie",
      title: "De 18 types en hun sterke en zwakke punten",
      intro: "Water verslaat vuur, vuur verslaat gras… maar er is veel meer.",
      img: ART(493), c1: "#ee0979", c2: "#ff6a00",
      body: `
        <p>Elke Pokémon en elke aanval heeft een type. Er zijn er 18: Normaal, Vuur, Water, Elektrisch, Gras, IJs, Vechten, Gif, Grond, Vliegend, Psychisch, Insect, Gesteente, Spook, Draak, Duister, Staal en Fee.</p>
        <h4>Het basisprincipe</h4>
        <ul>
          <li><b>Water</b> is sterk tegen Vuur.</li>
          <li><b>Vuur</b> is sterk tegen Gras.</li>
          <li><b>Gras</b> is sterk tegen Water.</li>
          <li><b>Elektrisch</b> is sterk tegen Water en Vliegend.</li>
        </ul>
        <h4>Immuniteiten</h4>
        <p>Sommige types kunnen helemaal niet geraakt worden door bepaalde aanvallen. Een Pokémon van het type <b>Grond</b> is immuun voor Elektrisch, en een <b>Spook</b> is immuun voor Normaal en Vechten.</p>
        <h4>Nieuwe types</h4>
        <p>In het begin waren er 15 types. <b>Duister</b> en <b>Staal</b> kwamen erbij in Generatie 2 en <b>Fee</b> in Generatie 6. Fee is bijvoorbeeld immuun voor Draak-aanvallen.</p>
        <div class="fact"><b>Tip:</b> Pokémon kunnen twee types hebben. Dat kan hen extra sterk maken, maar ook extra zwak.</div>`,
    },
    {
      id: "eevee",
      tag: "Pokémon in de spotlight",
      title: "Eevee en zijn acht evoluties",
      intro: "Eén Pokémon, acht mogelijkheden.",
      img: ART(133), c1: "#8e6e53", c2: "#e0c3a3",
      body: `
        <p>Eevee (#133) is bijzonder omdat hij zich in meer verschillende Pokémon kan ontwikkelen dan welke andere Pokémon ook. Het hangt af van wat je hem geeft of hoe je hem traint.</p>
        <h4>De evoluties</h4>
        <ul>
          <li><b>Vaporeon</b> (Water), <b>Jolteon</b> (Elektrisch) en <b>Flareon</b> (Vuur) zijn de eerste drie, uit Generatie 1.</li>
          <li><b>Espeon</b> (Psychisch) en <b>Umbreon</b> (Duister) kwamen in Generatie 2.</li>
          <li><b>Leafeon</b> (Gras) en <b>Glaceon</b> (IJs) kwamen in Generatie 4.</li>
          <li><b>Sylveon</b> (Fee) kwam in Generatie 6.</li>
        </ul>
        <p>Samen heten ze de <i>Eeveelutions</i>. Hoe je ze precies krijgt, verschilt per spel: soms met een steen, soms door vriendschap of door het moment van de dag.</p>
        <div class="fact"><b>Wist je dat?</b> Eevee is een van de populairste Pokémon van de fans. Als er een nieuwe Eeveelution komt, is dat altijd groot nieuws.</div>`,
    },
    {
      id: "shiny",
      tag: "Zeldzaam",
      title: "Shiny Pokémon: de zeldzame kleurvariant",
      intro: "Een gekleurde Pokémon vinden is een flinke prestatie.",
      img: SHINY(130), c1: "#4568dc", c2: "#b06ab3",
      body: `
        <p>Een <b>Shiny Pokémon</b> is een Pokémon met een andere kleur dan normaal. Een shiny Charizard is bijvoorbeeld zwart in plaats van oranje. Ze hebben dezelfde krachten, maar zijn vooral heel zeldzaam en daardoor erg gewild.</p>
        <h4>Hoe zeldzaam?</h4>
        <p>Shiny's kwamen voor het eerst voor in <i>Pokémon Gold en Silver</i> (Generatie 2). Daar was de kans <b>1 op 8192</b>. Vanaf Generatie 6 is dat in de meeste gevallen verbeterd tot <b>1 op 4096</b>, en er zijn trucjes om de kans te vergroten.</p>
        <h4>De rode Gyarados</h4>
        <p>In <i>Gold en Silver</i> was er een speciale, gegarandeerd shiny Gyarados bij het Lake of Rage. Zo konden spelers meteen zien hoe zo'n bijzondere Pokémon eruitziet.</p>
        <div class="fact"><b>Probeer het zelf:</b> In de Pokédex kun je in het detailvenster op "Shiny" klikken om de shiny versie van elke Pokémon te zien.</div>`,
    },
    {
      id: "krachten",
      tag: "Strijd",
      title: "Mega's, Z-moves, Dynamax en Terastal",
      intro: "Elke nieuwe generatie heeft een eigen speciale krachtbron.",
      img: ART(448), c1: "#0f2027", c2: "#2c5364",
      body: `
        <p>Verschillende generaties introduceerden tijdelijke of nieuwe gevechtsmechanieken. Ze werken per spel anders en zijn niet allemaal in elke latere generatie beschikbaar:</p>
        <ul>
          <li><b>Mega-evolutie</b> (Generatie 6, <i>X en Y</i>): bepaalde Pokémon veranderen tijdelijk in een sterkere vorm, bijvoorbeeld Mega Charizard X.</li>
          <li><b>Z-moves</b> (Generatie 7, <i>Sun en Moon</i>): een Pokémon gebruikt één keer een extra krachtige aanval met een Z-Crystal.</li>
          <li><b>Dynamax</b> (Generatie 8, <i>Sword en Shield</i>): een Pokémon groeit enorm en gebruikt een paar beurten Max Moves.</li>
          <li><b>Terastalliseren</b> (Generatie 9, <i>Scarlet en Violet</i>): een Pokémon neemt een kristallen vorm aan en kan van type veranderen.</li>
        </ul>
        <div class="fact"><b>Wist je dat?</b> Deze mechanieken kun je ook terugvinden in de Items-pagina, zoals de Mega Stones en Z-Crystals.</div>`,
    },
    {
      id: "weetjes",
      tag: "Weetjes",
      title: "Verrassende weetjes over Pokémon",
      intro: "Dingen die je misschien nog niet wist.",
      img: ART(151), c1: "#ff9a9e", c2: "#fad0c4",
      body: `
        <ul>
          <li>Er zijn inmiddels <b>meer dan 1000 Pokémon</b>. In het eerste spel waren het er 151.</li>
          <li><b>Mew</b> (#151) werd vlak voor de release in het geheim door een programmeur aan het eerste spel toegevoegd en stond niet in de officiële plannen.</li>
          <li>De Pokémon-spellen horen bij de best verkochte videogameseries ter wereld.</li>
          <li>Het Pokémon-kaartspel (TCG) kwam in 1996 uit in Japan en wordt nog steeds gespeeld en verzameld.</li>
          <li>De tekenfilmserie begon in 1997 in Japan, met Ash Ketchum als hoofdpersoon.</li>
          <li>De spellen spelen zich af in verschillende regio's, zoals Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar en Paldea.</li>
        </ul>
        <div class="fact"><b>Test jezelf:</b> Ken je al deze Pokémon? Probeer het spel "Wie is deze Pokémon?" in het menu links!</div>`,
    },
    {
      id: "starters",
      tag: "Pokémon in de spotlight",
      title: "De starters: Bulbasaur, Charmander en Squirtle",
      intro: "De eerste keuze van elke trainer, en waarom die zo moeilijk is.",
      img: ART(4), c1: "#f12711", c2: "#f5af19",
      body: `
        <p>Aan het begin van bijna elk Pokémon-spel mag je kiezen uit drie <b>starter-Pokémon</b>, één van het type Gras, één van Vuur en één van Water. Het zijn de eerste partner van je avontuur.</p>
        <h4>De Kanto-starters</h4>
        <ul>
          <li><b>Bulbasaur</b> (#1, Gras/Gif) ontwikkelt zich tot Ivysaur en Venusaur.</li>
          <li><b>Charmander</b> (#4, Vuur) ontwikkelt zich tot Charmeleon en Charizard.</li>
          <li><b>Squirtle</b> (#7, Water) ontwikkelt zich tot Wartortle en Blastoise.</li>
        </ul>
        <h4>Steen, papier, schaar</h4>
        <p>De drie starters werken als een cirkel: Water is sterk tegen Vuur, Vuur tegen Gras en Gras tegen Water. Dat geldt in elke generatie, ook al zijn de Pokémon zelf telkens anders.</p>
        <h4>Andere regio's, nieuwe starters</h4>
        <p>In Johto kies je tussen <b>Chikorita, Cyndaquil en Totodile</b>, in Hoenn tussen <b>Treecko, Torchic en Mudkip</b>. Elke generatie heeft zijn eigen trio.</p>
        <div class="fact"><b>Wist je dat?</b> In de eerste spellen kreeg je je starter van Professor Oak. Je rivaal kiest daarna de Pokémon die sterk is tegen die van jou.</div>`,
    },
    {
      id: "legendarisch",
      tag: "Zeldzaam",
      title: "Legendarische Pokémon",
      intro: "Eén van een soort, en vaak met een eigen verhaal.",
      img: ART(150), c1: "#7f00ff", c2: "#e100ff",
      body: `
        <p>Legendarische Pokémon zijn bijzonder sterk en komen in een spel meestal maar één keer voor. Vaak spelen ze een grote rol in het verhaal van de regio.</p>
        <h4>De legendarische vogels</h4>
        <p>In Kanto leven drie vogels: <b>Articuno</b> (IJs/Vliegend), <b>Zapdos</b> (Elektrisch/Vliegend) en <b>Moltres</b> (Vuur/Vliegend). Ze staan in de Pokédex als #144, #145 en #146.</p>
        <h4>Mewtwo en Mew</h4>
        <p><b>Mewtwo</b> (#150) is een Psychische Pokémon die door wetenschappers is gemaakt uit het DNA van <b>Mew</b> (#151). Mewtwo wordt vaak gezien als een van de sterkste Pokémon uit de eerste generatie.</p>
        <h4>Meer dan alleen legendarisch</h4>
        <p>Naast legendarische Pokémon zijn er ook <b>mythische Pokémon</b> zoals Mew en Celebi. Die kon je lange tijd alleen krijgen via speciale evenementen.</p>
        <div class="fact"><b>Tip:</b> Zoek in de Pokédex maar eens naar #144 tot en met #151 om ze allemaal te zien.</div>`,
    },
    {
      id: "evolutie",
      tag: "Strategie",
      title: "Evolutie: zo ontwikkelen Pokémon zich",
      intro: "Level, steen, ruilen of vriendschap: er zijn veel manieren.",
      img: ART(94), c1: "#41295a", c2: "#2f0743",
      body: `
        <p>Veel Pokémon kunnen <b>evolueren</b>, waarna ze een andere vorm krijgen met meestal betere eigenschappen. Hoe dat gebeurt, verschilt per Pokémon.</p>
        <h4>Een bepaald level</h4>
        <p>De meeste Pokémon evolueren door te vechten en te groeien. Charmander wordt bijvoorbeeld Charmeleon op level 16 en Charizard op level 36.</p>
        <h4>Evolutiestenen</h4>
        <p>Sommige Pokémon hebben een steen nodig, zoals een <b>Vuursteen</b>, <b>Watersteen</b> of <b>Donderssteen</b>. Zo wordt Pikachu Raichu.</p>
        <h4>Ruilen</h4>
        <p>Een paar Pokémon evolueren alleen als je ze ruilt met een andere speler, zoals <b>Haunter</b> in <b>Gengar</b> en <b>Machoke</b> in <b>Machamp</b>.</p>
        <h4>Vriendschap en andere voorwaarden</h4>
        <p>Pichu, Eevee en andere Pokémon hebben genoeg vriendschap met hun trainer nodig. Bij sommige speelt ook het moment van de dag of een bepaald item mee.</p>
        <div class="fact"><b>Wist je dat?</b> Je kunt een evolutie stoppen door op B te drukken. Dat doen trainers soms om een Pokémon eerder een aanval te laten leren.</div>`,
    },
    {
      id: "regios",
      tag: "Geschiedenis",
      title: "De regio's: van Kanto tot Paldea",
      intro: "Elke generatie speelt zich af op een nieuwe plek, vaak gebaseerd op een echt land.",
      img: ART(384), c1: "#00b09b", c2: "#96c93d",
      body: `
        <p>Elke generatie Pokémon-spellen speelt zich af in een eigen regio. Veel regio's zijn gebaseerd op een echt deel van de wereld.</p>
        <ul>
          <li><b>Kanto</b> (Gen 1, <i>Red/Blue</i>): gebaseerd op de Kanto-regio in Japan.</li>
          <li><b>Johto</b> (Gen 2, <i>Gold/Silver</i>): gebaseerd op het Japanse Kansai-gebied.</li>
          <li><b>Hoenn</b> (Gen 3, <i>Ruby/Sapphire</i>): geïnspireerd door het Japanse eiland Kyushu.</li>
          <li><b>Sinnoh</b> (Gen 4, <i>Diamond/Pearl</i>): geïnspireerd door Hokkaido.</li>
          <li><b>Unova</b> (Gen 5, <i>Black/White</i>): gebaseerd op New York en omgeving.</li>
          <li><b>Kalos</b> (Gen 6, <i>X/Y</i>): geïnspireerd door Frankrijk.</li>
          <li><b>Alola</b> (Gen 7, <i>Sun/Moon</i>): geïnspireerd door Hawaï.</li>
          <li><b>Galar</b> (Gen 8, <i>Sword/Shield</i>): geïnspireerd door het Verenigd Koninkrijk.</li>
          <li><b>Paldea</b> (Gen 9, <i>Scarlet/Violet</i>): geïnspireerd door Spanje en Portugal.</li>
        </ul>
        <div class="fact"><b>Probeer het zelf:</b> Met het generatie-menu in de Pokédex zie je welke Pokémon bij welke regio horen.</div>`,
    },
    {
      id: "pokemon-go",
      tag: "Spellen",
      title: "Pokémon GO: Pokémon vangen in het echt",
      intro: "Wandelen, vangen en samen raids doen.",
      img: ART(129), c1: "#1c92d2", c2: "#f2fcfe",
      body: `
        <p><b>Pokémon GO</b> verscheen in 2016 voor smartphones en is gemaakt door <b>Niantic</b>. Je ziet Pokémon via je telefoon in de echte wereld en loopt rond om ze te vangen.</p>
        <h4>Hoe het werkt</h4>
        <ul>
          <li>Pokémon verschijnen op de kaart op de plek waar jij bent.</li>
          <li>Bij <b>PokéStops</b> krijg je items zoals Poké Balls.</li>
          <li>In <b>gyms</b> en <b>raids</b> vecht je tegen andere trainers of sterke Pokémon, vaak samen met anderen.</li>
          <li>Door te wandelen kun je eieren uitbroeden en snoepjes verzamelen voor je Pokémon.</li>
        </ul>
        <div class="fact"><b>Wist je dat?</b> Op de pagina Websites vind je een link naar de officiële Pokémon GO-website.</div>`,
    },
    {
      id: "kaartspel",
      tag: "Verzamelen",
      title: "Het Pokémon-kaartspel (TCG)",
      intro: "Spelen, ruilen en verzamelen sinds de jaren 90.",
      img: ART(6), c1: "#cb2d3e", c2: "#ef473a",
      body: `
        <p>Het <b>Pokémon Trading Card Game</b> kwam in 1996 uit in Japan en een paar jaar later ook in de rest van de wereld. Je bouwt een deck van 60 kaarten en vecht tegen een tegenstander.</p>
        <h4>Soorten kaarten</h4>
        <ul>
          <li><b>Pokémon-kaarten</b>: de Pokémon waarmee je speelt.</li>
          <li><b>Energiekaarten</b>: nodig om aanvallen te kunnen gebruiken.</li>
          <li><b>Trainerkaarten</b>: items, supporters en stadions met speciale effecten.</li>
        </ul>
        <h4>Waarom zijn sommige kaarten zoveel waard?</h4>
        <p>Zeldzame kaarten, zoals holografische kaarten uit de eerste sets of kaarten in perfecte staat, kunnen veel geld waard zijn. De bekendste is de Charizard uit de <b>Base Set</b>.</p>
        <div class="fact"><b>Tip:</b> In het menu Kaartwaarde kun je kaarten opzoeken en de actuele prijs bekijken.</div>`,
    },
    {
      id: "tcg-beginner",
      tag: "TCG voor beginners",
      title: "Beginnen met Pokémon-kaarten verzamelen",
      intro: "Kies een doel, houd je budget in de gaten en bouw rustig je collectie op.",
      img: ART(52), c1: "#f7971e", c2: "#ffd200",
      body: `
        <p>Je hoeft niet meteen zeldzame of dure kaarten te kopen. Bedenk eerst wat je leuk vindt: kaarten van één Pokémon, een bepaalde set, illustraties, of kaarten waarmee je daadwerkelijk wilt spelen.</p>
        <h4>Een eenvoudige start</h4>
        <ol>
          <li>Kies een onderwerp of set en bekijk welke kaarten daarin zitten.</li>
          <li>Stel vooraf een bedrag vast dat je aan kaarten wilt uitgeven.</li>
          <li>Koop bij voorkeur een product van een betrouwbare winkel of verzamelaar.</li>
          <li>Stop kaarten die je wilt bewaren direct in een passende sleeve.</li>
          <li>Noteer welke kaarten je zoekt en wat je al hebt, bijvoorbeeld in het Kaartalbum.</li>
        </ol>
        <h4>Boosters of losse kaarten?</h4>
        <p>Een booster openen is leuk en verrassend, maar je weet niet welke kaarten erin zitten. Als je een specifieke kaart zoekt, is die los kopen vaak gerichter: vergelijk de prijs, conditie en taal en controleer de verkoper. Zie boosters vooral als entertainment, niet als een manier om gegarandeerd winst te maken.</p>
        <h4>Verzamelen of spelen?</h4>
        <p>Voor een speelbaar deck gelden andere keuzes dan voor een collectie. Controleer bij het bouwen van een deck de spelregels en welke kaarten op dat moment toegestaan zijn in het formaat dat je speelt.</p>
        <div class="fact"><b>Tip:</b> Laat je niet opjagen door hype of claims dat een pak gegarandeerd waardevolle kaarten bevat. Verzamel op je eigen tempo.</div>`,
    },
    {
      id: "tcg-rarity",
      tag: "TCG uitgelegd",
      title: "Zeldzaamheid van Pokémon-kaarten uitgelegd",
      intro: "Van Common en Rare tot Illustration Rare en Secret Rare: zo lees je de aanduidingen.",
      img: ART(249), c1: "#654ea3", c2: "#eaafc8",
      body: `
        <p>De zeldzaamheid vertelt hoe een kaart in een set is ingedeeld, maar zegt niet automatisch hoeveel de kaart waard is. De populariteit, speelbaarheid, conditie, taal en oplage kunnen de marktprijs ook beïnvloeden.</p>
        <h4>Veelvoorkomende aanduidingen</h4>
        <ul>
          <li><b>Common</b>: doorgaans herkenbaar aan een cirkel bij het kaartnummer.</li>
          <li><b>Uncommon</b>: doorgaans herkenbaar aan een ruitje.</li>
          <li><b>Rare</b>: doorgaans herkenbaar aan een ster. De kaart kan bijvoorbeeld een holo-afwerking hebben.</li>
          <li><b>Illustration Rare (IR)</b>: een speciale kaart met een uitgebreide illustratie, vaak met een enkele Pokémon.</li>
          <li><b>Special Illustration Rare (SIR)</b>: een zeer opvallende illustratievariant, vaak voor Pokémon ex of Supporter-kaarten.</li>
          <li><b>Secret Rare</b>: een informele, veelgebruikte naam voor kaarten met een kaartnummer dat hoger is dan het officiële aantal kaarten in de set.</li>
        </ul>
        <h4>En Alternate Art?</h4>
        <p><b>Alternate Art</b> (alt art) is een verzamelterm voor een alternatieve illustratie en niet altijd een aparte, officiële zeldzaamheidscategorie. De officiële naam en symbolen verschillen per serie en set. Controleer daarom het kaartnummer en de setinformatie op de kaart in plaats van alleen op de glans of het artwork af te gaan.</p>
        <div class="fact"><b>Onthoud:</b> Zeldzaamheid is niet hetzelfde als marktwaarde. Vergelijk dezelfde kaart, in dezelfde taal en conditie, en kijk ook naar recente verkopen.</div>`,
    },
    {
      id: "tcg-grading",
      tag: "TCG beoordelen",
      title: "Kaarten laten graden: PSA, Beckett en AP Grading",
      intro: "Wat grading inhoudt, waar beoordelaars op letten en wanneer de kosten kunnen opwegen tegen de opbrengst.",
      img: ART(146), c1: "#1d976c", c2: "#93f9b9",
      body: `
        <p>Bij grading beoordeelt een bedrijf een kaart op onder meer centrering, hoeken, randen en oppervlak. De kaart wordt daarna in een verzegelde houder geplaatst met een label en cijfer. Een hoge score is niet gegarandeerd: kleine beschadigingen of afwijkingen kunnen de beoordeling beïnvloeden.</p>
        <h4>Bekende gradingbedrijven</h4>
        <ul>
          <li><b>PSA</b>: een internationaal bekende grader met een cijferbeoordeling en verzegelde slab.</li>
          <li><b>Beckett (BGS)</b>: geeft een eindscore en kan ook subscores voor onderdelen van de conditie tonen.</li>
          <li><b>AP Grading</b>: een andere aanbieder. Bekijk vooraf de actuele beoordelingsmethode, voorwaarden en acceptatie bij kopers.</li>
        </ul>
        <p>Prijzen, diensten, doorlooptijden en verzendvoorwaarden kunnen veranderen. Controleer die rechtstreeks bij de grader voordat je iets opstuurt.</p>
        <h4>Is graden de moeite waard?</h4>
        <p>Vergelijk eerst de waarde van de kaart on-gegradeerd met realistische verkoopprijzen van dezelfde kaart in vergelijkbare grades. Reken vervolgens alle kosten mee: beoordeling, verzending, verzekering, eventuele invoer- of afhandelingskosten en verkoopkosten. Een kaart graden kan interessant zijn voor bescherming of presentatie, maar is geen garantie op winst of een hogere verkoopprijs.</p>
        <h4>Voor je de kaart verstuurt</h4>
        <ol>
          <li>Bekijk de kaart onder goed licht zonder hem onnodig aan te raken.</li>
          <li>Controleer voor- en achterkant op krassen, whitening, vouwen en centrering.</li>
          <li>Lees de actuele instructies van de grader voor verpakking en verzending.</li>
          <li>Maak foto's en bewaar verzend- en verzekeringsinformatie.</li>
        </ol>
        <div class="fact"><b>Tip:</b> Stuur geen kaart op alleen omdat die zeldzaam is. Conditie, totale kosten en jouw eigen doel bepalen of grading bij je past.</div>`,
    },
    {
      id: "tcg-storage",
      tag: "Kaarten beschermen",
      title: "Pokémon-kaarten veilig bewaren",
      intro: "Sleeves, toploaders en binders gebruiken om slijtage en schade te helpen voorkomen.",
      img: ART(143), c1: "#36d1dc", c2: "#5b86e5",
      body: `
        <p>Een kaart blijft het best in conditie als je hem zo min mogelijk aanraakt en beschermt tegen krassen, vuil, vocht en direct zonlicht. Gebruik schone, droge handen en pak kaarten bij voorkeur aan de randen vast.</p>
        <h4>Welke bescherming gebruik je?</h4>
        <ul>
          <li><b>Penny sleeve</b>: een dunne, zachte sleeve voor dagelijkse bescherming. Kies een maat waarin de kaart niet wordt geklemd.</li>
          <li><b>Toploader</b>: een stevige houder voor extra bescherming. Doe de kaart eerst in een passende zachte sleeve.</li>
          <li><b>Binder</b>: handig om een collectie te bekijken. Kies bij voorkeur een ringloze binder met zij-invoer en geschikte, PVC-vrije pagina's.</li>
          <li><b>Deck sleeves</b>: geschikt om kaarten tijdens het spelen te beschermen; controleer de maat en vervang versleten sleeves.</li>
        </ul>
        <h4>Bewaarplek en gewoontes</h4>
        <ul>
          <li>Bewaar kaarten koel en droog, uit direct zonlicht en weg van sterke temperatuurschommelingen.</li>
          <li>Leg zware spullen niet op kaarten of binders en prop pagina's niet te vol.</li>
          <li>Gebruik geen elastiekjes, plakband of lijm rechtstreeks op kaarten.</li>
          <li>Maak kaarten niet schoon met water, alcohol of schoonmaakmiddelen; dat kan de afwerking beschadigen.</li>
          <li>Bewaar extra waardevolle kaarten apart en controleer af en toe op vocht of vervorming.</li>
        </ul>
        <div class="fact"><b>Basisregel:</b> Sleeve eerst, daarna eventueel een toploader. Een houder beschermt tegen slijtage, maar maakt een kaart niet onverwoestbaar.</div>`,
    },
    {
      id: "tcg-authenticity",
      tag: "Echtheids-check",
      title: "Zo controleer je Pokémon-kaarten op echtheid",
      intro: "Controleer herkomst, drukwerk, kaartgegevens en vergelijk met een betrouwbare referentie.",
      img: ART(132), c1: "#654ea3", c2: "#eaafc8",
      body: `
        <p>Een foto of één snelle test kan echtheid niet altijd bewijzen. Namaak kan overtuigend lijken en echte kaarten kunnen door licht, slijtage of een afwijkende druk misleidend ogen. Gebruik daarom meerdere controles en vraag bij twijfel advies aan een ervaren verzamelaar.</p>
        <h4>Checklist bij een losse kaart</h4>
        <ol>
          <li><b>Vergelijk de kaart:</b> zoek dezelfde taal, set, kaartnummer en versie op in de officiële kaartendatabase of een betrouwbare catalogus.</li>
          <li><b>Controleer tekst en symbolen:</b> let op spelfouten, vreemde lettertypes, onjuiste HP, aanvalskosten, set-symbolen en kaartnummers.</li>
          <li><b>Bekijk de druk:</b> vergelijk kleuren, scherpte, randen en de holo-afwerking met een betrouwbare referentiekaart. Foto's kunnen kleuren vertekenen.</li>
          <li><b>Let op formaat en afwerking:</b> een afwijkende maat, slordige snijrand of ongebruikelijke achterkant kan een waarschuwing zijn, maar is op zichzelf geen sluitend bewijs.</li>
          <li><b>Vraag naar herkomst:</b> bewaarbonnen, duidelijke foto's en een redelijke prijs helpen je risico beter in te schatten.</li>
        </ol>
        <h4>Niet doen: de kaart beschadigen</h4>
        <p>Snijd, scheur, buig of beschadig een kaart niet om een vermeende laag of lichteffect te testen. Zulke thuistests zijn niet betrouwbaar en maken een echte kaart kapot. Ook een QR-code of hologram alleen is geen garantie.</p>
        <h4>Koop veilig</h4>
        <p>Koop bij voorkeur bij een betrouwbare winkel of verkoper met duidelijke retourvoorwaarden. Wees voorzichtig met grote kortingen, druk om snel te betalen, onduidelijke foto's en aanbiedingen van ongeopende producten voor een onwaarschijnlijk lage prijs.</p>
        <div class="fact"><b>Vergelijkingsbeelden:</b> gebruik de kaartafbeeldingen in de Kaartwaarde-pagina als referentie voor kaartindeling en tekst. Die digitale beelden tonen niet betrouwbaar de fysieke textuur of echtheid van een exemplaar.</div>`,
    },
    {
      id: "tcg-sets",
      tag: "Set-overzichten",
      title: "Nieuwe Pokémon TCG-sets bekijken",
      intro: "Gebruik de setverkenner om recente uitbreidingen, kaarten en opvallende zeldzaamheden op te zoeken.",
      img: ART(282), c1: "#ee0979", c2: "#ff6a00",
      body: `
        <p>De Kaartwaarde-pagina haalt sets en kaartgegevens op uit TCGdex. Kies daar een set om de checklist en beschikbare kaartinformatie te bekijken. De nieuwste set kan per taal of markt een andere releasedatum hebben.</p>
        <h4>Zo vergelijk je een set</h4>
        <ul>
          <li>Bekijk de totale setgrootte en hoeveel kaarten je nog zoekt.</li>
          <li>Zoek op zeldzaamheid of Pokémon-naam om illustraties en varianten te vergelijken.</li>
          <li>Open een kaart om beschikbare prijsinformatie en bronvermelding te zien.</li>
          <li>Vergelijk dezelfde taal, conditie en kaartvariant; prijzen verschillen per markt.</li>
        </ul>
        <p>De site presenteert zeldzame kaarten als verzamel- of zoekkandidaten, niet als gegarandeerde waardevolle pulls. Een setoverzicht is geen financieel advies en een booster garandeert geen specifieke kaart.</p>
        <div class="fact"><b>Open Kaartwaarde</b> en kies een set om de actuele database-inhoud te bekijken. De setlijst is afhankelijk van de beschikbaarheid van de gegevensbron.</div>`,
    },
    {
      id: "tcg-top-cards",
      tag: "Verzamelaarslijst",
      title: "10 iconische Pokémon-kaarten om te kennen",
      intro: "Een startlijst met populaire en historisch opvallende kaarten — geen actuele prijsranglijst.",
      img: ART(384), c1: "#f7971e", c2: "#ffd200",
      body: `
        <p>Er bestaat geen universele top 10: prijzen verschillen per taal, conditie, grading en verkoopmoment. Deze lijst is daarom een selectie van bekende verzamelkaarten, niet een rangschikking op actuele marktwaarde.</p>
        <ol>
          <li><b>Charizard — Base Set</b>: een van de bekendste kaarten uit de eerste Engelstalige set.</li>
          <li><b>Pikachu Illustrator</b>: een uitzonderlijke Japanse prijskaart uit een illustratiewedstrijd.</li>
          <li><b>1st Edition Shadowless Charizard</b>: een specifieke, gewilde drukvariant; controleer editie en schaduw goed.</li>
          <li><b>Umbreon VMAX — Alternate Art</b>: een opvallende moderne Eeveelution-kaart.</li>
          <li><b>Gengar & Mimikyu-GX — Alternate Art</b>: geliefd om het duo en de illustratie.</li>
          <li><b>Rayquaza Gold Star</b>: een oudere shiny-kaart die verzamelaars vaak zoeken.</li>
          <li><b>Shining Charizard</b>: een bijzondere shiny Charizard uit de Neo-era.</li>
          <li><b>Magikarp & Wailord-GX — Alternate Art</b>: een opvallende duo-kaart.</li>
          <li><b>Lugia V — Alternate Art</b>: een moderne illustratiekaart met een populaire Legendary.</li>
          <li><b>Speciale promotiekaarten</b>: bijvoorbeeld kaarten met beperkte distributie of unieke illustraties; controleer altijd de specifieke editie.</li>
        </ol>
        <p>Zoek de exacte kaart op in Kaartwaarde en vergelijk recente transacties, niet alleen vraagprijzen. Een kaartnaam alleen is onvoldoende: setnummer, taal, editie en conditie moeten overeenkomen.</p>
        <div class="fact"><b>Waarden veranderen.</b> Deze lijst bevat bewust geen eurobedragen of claim over de duurste kaart. Raadpleeg de prijsbron op de kaartdetailpagina voor actuele gegevens.</div>`,
    },
    {
      id: "tcg-market",
      tag: "Marktinzicht",
      title: "Kaartprijzen lezen zonder je te laten misleiden",
      intro: "Vraagprijs, verkoopprijs, conditie en markttrend zijn niet hetzelfde.",
      img: ART(54), c1: "#1d976c", c2: "#93f9b9",
      body: `
        <p>Een online vraagprijs laat zien wat een verkoper hoopt te krijgen; het is geen bewijs dat kopers dat bedrag betalen. Een verkoopprijs is nuttiger, maar moet wel bij dezelfde kaart, taal, conditie en variant horen.</p>
        <h4>Vergelijk zorgvuldig</h4>
        <ul>
          <li>Vergelijk dezelfde set, hetzelfde kaartnummer, dezelfde taal en foil-variant.</li>
          <li>Houd rekening met conditie, grading, verzendkosten en verkoopplatformkosten.</li>
          <li>Bekijk meerdere recente verkopen; één uitzonderlijke verkoop is geen stabiele marktprijs.</li>
          <li>Let op dat trendgrafieken oude of beperkte gegevens kunnen tonen.</li>
        </ul>
        <p>De prijsweergave op deze site gebruikt gegevens die TCGdex beschikbaar stelt van externe marktplaatsen. Beschikbaarheid en actualiteit kunnen per kaart verschillen; prijzen zijn indicatief en geen aanbod of financieel advies.</p>
        <div class="fact"><b>Let op:</b> betaal nooit meer dan je budget en koop niet alleen op basis van voorspellingen over toekomstige waardestijging.</div>`,
    },
    {
      id: "pokemon-go-guide",
      tag: "Mobiele games",
      title: "Pokémon GO: raids, counters en Rocket-bazen",
      intro: "Een praktische basis voor voorbereiding — controleer in-game welke Boss en events nu actief zijn.",
      img: ART(94), c1: "#1c92d2", c2: "#f2fcfe",
      body: `
        <p>Raidbazen, Rocket-opstellingen en bonussen wisselen regelmatig. Deze gids legt uit hoe je zelf een passend team kiest; controleer de actuele tegenstander en eventtijden in de game of via de officiële Pokémon GO-kanalen.</p>
        <h4>Raidteam kiezen</h4>
        <ol>
          <li>Bekijk het type van de raidbaas en kies aanvallen die daar super effectief tegen zijn.</li>
          <li>Kies Pokémon met sterke aanvallen van hetzelfde type als hun eigen type voor de STAB-bonus.</li>
          <li>Verbeter eerst de aanvallen en Pokémon die je vaak gebruikt; je hoeft niet elk teamlid maximaal te versterken.</li>
          <li>Werk samen met andere trainers en gebruik aanbevolen counters als startpunt, niet als vaste regel.</li>
        </ol>
        <h4>Team GO Rocket</h4>
        <p>Let op de Pokémon die de Grunt of leider inzet. Wissel naar counters voor de bekende typen, gebruik Protect Shields verstandig en zorg dat je Charged Attacks snel kunt inzetten om tegenstanders tijdelijk te laten pauzeren.</p>
        <h4>Giovanni en events</h4>
        <p>Giovanni's team en de beschikbare Shadow Legendary kunnen veranderen. Gebruik de Super Rocket Radar pas als je klaar bent voor de huidige encounter. Eventkalenders en Raid Bosses zijn tijdgebonden; deze pagina belooft geen vaste huidige line-up.</p>
        <div class="fact"><b>Actuele informatie:</b> kijk voor live eventdata en huidige raidbazen op de officiële Pokémon GO-website via de pagina Websites.</div>`,
    },
    {
      id: "tcg-pocket-guide",
      tag: "Mobiele games",
      title: "Pokémon TCG Pocket: packs en decktips",
      intro: "Een beginnersaanpak voor dagelijkse packs, deckbouw en het slim gebruiken van middelen.",
      img: ART(700), c1: "#36d1dc", c2: "#5b86e5",
      body: `
        <p>Pokémon TCG Pocket is een digitale kaart- en spelervaring met eigen regels en kaartsets. De inhoud, events, decks en beloningen veranderen door updates. Controleer in de app welke kaarten en regels momenteel beschikbaar zijn.</p>
        <h4>Begin zonder je middelen te verspillen</h4>
        <ul>
          <li>Open je beschikbare dagelijkse packs en kies op basis van kaarten die je leuk vindt of voor een deck nodig hebt.</li>
          <li>Bewaar pack points en andere schaarse middelen tot je weet welke kaart je echt wilt aanvullen.</li>
          <li>Gebruik de deckbuilder en test een deck voordat je zeldzame kaarten probeert te verzamelen.</li>
          <li>Combineer aanvallers met passende energiebehoeften en kaarten die helpen zoeken, trekken of terugtrekken.</li>
        </ul>
        <h4>Deck en events</h4>
        <p>Een deck dat sterk is in één event kan minder goed werken in een ander formaat. Kijk welke regels en kaarten zijn toegestaan, pas je counters aan en leer van een paar testpotjes. Er bestaat niet één beste deck voor elke speler of update.</p>
        <div class="fact"><b>Tip:</b> geef geen geld uit met de verwachting dat een bepaalde zeldzame kaart gegarandeerd uit een pack komt.</div>`,
    },
    {
      id: "competitive-basics",
      tag: "Gevechtsstrategie",
      title: "Competitieve Pokémon-gevechten: een basisgids",
      intro: "Bouw een team met een plan, rolverdeling en antwoorden op veelvoorkomende bedreigingen.",
      img: ART(445), c1: "#41295a", c2: "#8e44ff",
      body: `
        <p>Een competitief team bestaat niet alleen uit zes sterke Pokémon. Je hebt een plan nodig: hoe win je, welke Pokémon helpen dat plan uitvoeren en hoe voorkom je dat één tegenstander je hele team stopt?</p>
        <h4>Begin met een teamkern</h4>
        <ul>
          <li>Kies een win condition, zoals een aanvaller die na één boost kan opruimen.</li>
          <li>Voeg Pokémon toe die elkaar aanvullen en belangrijke typezwaktes opvangen.</li>
          <li>Neem rollen mee zoals fysieke of speciale aanvallers, een defensieve pivot en waar het formaat dat vereist hazard control.</li>
          <li>Kies moves, abilities en held items die bij de rol passen; test voordat je EV's of resources definitief investeert.</li>
        </ul>
        <h4>Wat moet je controleren?</h4>
        <p>Gebruik alleen Pokémon, moves en items die zijn toegestaan in het gekozen formaat en de huidige regels. Smogon- en officiële VGC-formaten verschillen. Populariteitsstatistieken zijn nuttige signalen, maar geen garantie dat een team bij jouw speelstijl past.</p>
        <div class="fact"><b>Probeer het team eerst</b> in een simulator zoals Pokémon Showdown en pas één onderdeel tegelijk aan op basis van je wedstrijden.</div>`,
    },
    {
      id: "sv-team",
      tag: "Beste teams per game",
      title: "Een gebalanceerd verhaalteam voor Scarlet & Violet",
      intro: "Een voorbeeldteam met brede type-dekking voor Paldea — geen verplicht of universeel 'beste' team.",
      img: ART(911), c1: "#41295a", c2: "#8e44ff",
      body: `
        <p>Deze voorbeeldselectie kiest Fuecoco als starter en combineert zes Pokémon met verschillende rollen. Je kunt het verhaal met veel andere teams uitspelen; kies gerust Pokémon die je zelf leuk vindt.</p>
        <ul>
          <li><b>Skeledirge</b> (Vuur/Spook): Torch Song, Shadow Ball, Earth Power, Slack Off.</li>
          <li><b>Kilowattrel</b> (Elektrisch/Vliegend): Thunderbolt, Air Slash, Volt Switch, Roost.</li>
          <li><b>Clodsire</b> (Gif/Grond): Earthquake, Poison Jab, Recover, Toxic.</li>
          <li><b>Tinkaton</b> (Fee/Staal): Gigaton Hammer, Play Rough, Knock Off, Flash Cannon.</li>
          <li><b>Annihilape</b> (Vechten/Spook): Rage Fist, Close Combat, Bulk Up, U-turn.</li>
          <li><b>Baxcalibur</b> (Draak/IJs): Glaive Rush, Icicle Crash, Earthquake, Ice Shard.</li>
        </ul>
        <h4>Zo gebruik je het team</h4>
        <p>Wissel op basis van de tegenstander en gebruik de Terastal-mogelijkheid om een aanval te versterken of een kwetsbaarheid te veranderen. Moves, TM's en vangstlocaties kunnen afhangen van voortgang en DLC; behandel deze set als einddoel en gebruik onderweg beschikbare alternatieven.</p>
        <p>Als je liever Sprigatito of Quaxly kiest, vervang dan Skeledirge door Meowscarada of Quaquaval en pas de rest aan zodat je team nog steeds antwoorden heeft op Water, Vuur, Vliegend, Fee en Draak.</p>
        <div class="fact"><b>Voor het verhaal:</b> je hoeft geen competitieve EV-training of perfecte natuur te hebben. Houd je team ongeveer op het level van de uitdagingen die je kiest.</div>`,
    },
    {
      id: "sv-legendary-locations",
      tag: "Locatiegidsen",
      title: "Legendarische Pokémon vinden in Scarlet & Violet",
      intro: "Waar je het verhaal, de ruïnes en de DLC-legendary's kunt zoeken.",
      img: ART(1007), c1: "#b31217", c2: "#e52d27",
      body: `
        <p>De beschikbaarheid hangt af van je spelversie, verhaalvoortgang en eventuele DLC. Sla op voordat je een eenmalige ontmoeting start en neem genoeg Poké Balls mee.</p>
        <h4>Koraidon of Miraidon</h4>
        <p>Je versie-exclusieve partner is onderdeel van het hoofdverhaal. Na afronding van het verhaal kun je in Area Zero ook de tweede exemplaar van je versie vinden en vangen.</p>
        <h4>De Schat van de Ruïne</h4>
        <p>Wo-Chien, Chien-Pao, Ting-Lu en Chi-Yu zijn verbonden aan vier heiligdommen in Paldea. Zoek de gekleurde inzetten in de regio om elk heiligdom te ontgrendelen. De bijpassende kleur van de inzetten helpt je de juiste groep te herkennen; controleer je kaart en verzamel ze allemaal voordat je naar het heiligdom gaat.</p>
        <h4>DLC-Pokémon</h4>
        <p>Pokémon zoals Ogerpon en Terapagos horen bij het verhaal van <i>The Teal Mask</i> en <i>The Indigo Disk</i>. Je hebt de bijbehorende DLC en voortgang nodig; ze zijn niet beschikbaar in alleen het basisspel.</p>
        <div class="fact"><b>Versiecheck:</b> controleer of een Pokémon exclusief is voor Scarlet of Violet en of ruilen of DLC nodig is voordat je een locatie volgt.</div>`,
    },
    {
      id: "evolution-methods",
      tag: "Evolutie-gids",
      title: "Speciale evoluties: vriendschap, items, ruilen en meer",
      intro: "Een checklist om evolutievoorwaarden te herkennen en ze per game te controleren.",
      img: ART(133), c1: "#8e6e53", c2: "#e0c3a3",
      body: `
        <p>Niet elke Pokémon evolueert door alleen een level omhoog te gaan. De Pokédex-detailpagina toont voor veel soorten de evolutielijn en voorwaarden; controleer de specifieke game, want regels kunnen per versie verschillen.</p>
        <h4>Veelvoorkomende voorwaarden</h4>
        <ul>
          <li><b>Vriendschap:</b> maak de Pokémon blij met verzorging, wandelen of levelen. Sommige evoluties vragen ook een bepaald moment van de dag of een bekende aanval.</li>
          <li><b>Evolutiesteen of item:</b> gebruik het juiste voorwerp op de Pokémon. Niet elke soort kan met elk item evolueren.</li>
          <li><b>Ruilen:</b> sommige Pokémon evolueren bij ruil; bepaalde soorten moeten daarbij ook een specifiek item vasthouden.</li>
          <li><b>Locatie, weer of tijd:</b> level op een bepaalde plek, overdag/'s nachts of onder specifieke weersomstandigheden.</li>
          <li><b>Speciale actie:</b> voorbeelden zijn een bepaald aantal stappen, schade oplopen, een aanval gebruiken of een specifieke Pokémon in je team hebben.</li>
        </ul>
        <h4>Als de evolutie niet start</h4>
        <ol>
          <li>Controleer de exacte soort en eventuele regionale vorm.</li>
          <li>Lees de voorwaarde voor jouw spelversie en huidige gamevoortgang.</li>
          <li>Controleer of de Pokémon een Everstone vasthoudt of dat evolutie is geannuleerd.</li>
          <li>Probeer de voorwaarde opnieuw en level indien nodig nogmaals.</li>
        </ol>
        <div class="fact">Open een Pokémon in de Pokédex en bekijk de evolutielijn voor voorwaarden zoals vriendschap, items, ruilen en tijdstip.</div>`,
    },
    {
      id: "anime-watch-order",
      tag: "Anime & films",
      title: "Pokémon-anime en films: waar begin je?",
      intro: "Een spoilerarme kijkwijzer voor nieuwe kijkers en fans die een regio willen volgen.",
      img: ART(25), c1: "#f7971e", c2: "#ffd200",
      body: `
        <p>De eenvoudigste route is de anime per serie/regio bekijken in uitzendvolgorde. Zo volg je hoe Ash en zijn vrienden reizen, nieuwe Pokémon ontmoeten en aan competities deelnemen. De beschikbaarheid verschilt per land en streamingdienst.</p>
        <h4>Een laagdrempelige volgorde</h4>
        <ol>
          <li>Begin met <i>Pokémon: Indigo League</i> als introductie tot Ash, Pikachu en Kanto.</li>
          <li>Ga verder met Johto, Hoenn, Sinnoh, Unova, Kalos, Alola en daarna de overige series in de volgorde waarin ze uitkwamen.</li>
          <li>De meeste films zijn losse avonturen. Voor een doorlopende ervaring kun je ze kijken rond de periode waarin ze oorspronkelijk verschenen.</li>
          <li><i>Pokémon Horizons</i> heeft nieuwe hoofdpersonages en is een apart instappunt; je hoeft de eerdere serie niet te kennen.</li>
        </ol>
        <h4>Welke versie van de films?</h4>
        <p>De films kunnen los van de hoofdserie worden bekeken, maar bij sommige sluiten personages en Pokémon aan op een bepaald tijdperk. Kijk voor de actuele beschikbaarheid bij officiële aanbieders; releases en catalogi wisselen per regio.</p>
        <div class="fact"><b>Tip:</b> kies een regio of personage dat je leuk vindt en volg die serie; er is geen verplichte kijkvolgorde voor elke film.</div>`,
    },
    {
      id: "pokemon-news",
      tag: "Nieuws & events",
      title: "Pokémon-nieuws en evenementen volgen",
      intro: "Handige officiële bronnen voor aankondigingen over games, kaarten, GO en merchandise.",
      img: ART(479), c1: "#ff9a9e", c2: "#fad0c4",
      body: `
        <p>Game-releases, kaartsets, toernooien en mobiele events worden op verschillende momenten aangekondigd. Controleer altijd de bron en datum van een bericht; geruchten en lekken zijn geen officiële bevestiging.</p>
        <h4>Waar kijk je?</h4>
        <ul>
          <li><b>Pokémon.com</b> en officiële Pokémon Presents-uitzendingen voor grote aankondigingen.</li>
          <li><b>Pokémon TCG</b> voor kaartproducten, setinformatie en officiële spelregels.</li>
          <li><b>Pokémon GO Live</b> voor mobiele events, raids en seizoensupdates.</li>
          <li><b>Nintendo</b> en de officiële gamepagina's voor platform- en releasedetails.</li>
        </ul>
        <p>Deze gids verwijst naar de nieuwsbronnen en is geen live nieuwsstroom. Controleer de officiële pagina voor de nieuwste datum, regio, beschikbaarheid en voorwaarden.</p>
        <div class="fact"><b>Betrouwbaarheid:</b> deel geen onbevestigde eventcodes of links die om je accountgegevens vragen.</div>`,
    },
    {
      id: "pokemon-merch",
      tag: "Merchandise & popcultuur",
      title: "Pokémon-merchandise verzamelen",
      intro: "Van knuffels en figuren tot samenwerkingen: koop bewust en controleer de herkomst.",
      img: ART(197), c1: "#8e6e53", c2: "#e0c3a3",
      body: `
        <p>Pokémon-merchandise verschijnt als knuffels, kleding, figuren, spellen en tijdelijke samenwerkingen. Een gelimiteerde release is niet automatisch zeldzaam of waardevol op de tweedehandsmarkt.</p>
        <h4>Waar let je op?</h4>
        <ul>
          <li>Controleer fabrikant, officiële labels, productfoto's en de verkoper.</li>
          <li>Vergelijk maat, materiaal, verpakking en productnummer met officiële informatie.</li>
          <li>Bekijk retourvoorwaarden en totale verzendkosten voordat je bestelt.</li>
          <li>Wees kritisch bij extreem lage prijzen, namaaklogo's en druk om buiten een veilig platform te betalen.</li>
        </ul>
        <p>Voor bijzondere samenwerkingen, zoals Pokémon x Van Gogh Museum, controleer je de officiële aankondiging en eventuele voorwaarden rechtstreeks bij de betrokken organisatie.</p>
        <div class="fact"><b>Verzamel wat je leuk vindt.</b> Bewaar aankoopbewijzen en laat je niet leiden door een onbevestigde claim over toekomstige doorverkoopwaarde.</div>`,
    },
    {
      id: "community-guide",
      tag: "Community",
      title: "Veilig Pokémon-kaarten ruilen",
      intro: "Een checklist voor eerlijke afspraken, verzending en bescherming van je gegevens.",
      img: ART(333), c1: "#1c92d2", c2: "#f2fcfe",
      body: `
        <p>Een openbaar ruilforum vereist moderatie en een server om berichten en accounts veilig met andere bezoekers te delen. Deze statische site biedt daarom geen gedeeld forum of accountregistratie. Gebruik een bestaande community met duidelijke regels en moderatie.</p>
        <h4>Veilig ruilen</h4>
        <ul>
          <li>Maak actuele foto's van voor- en achterkant en bespreek de conditie eerlijk.</li>
          <li>Spreek vooraf af wie verzendt, welke verpakking wordt gebruikt en hoe problemen worden opgelost.</li>
          <li>Gebruik waar mogelijk een platform met kopersbescherming en controleer de ruilgeschiedenis.</li>
          <li>Deel geen wachtwoorden, verificatiecodes, adresgegevens openbaar of accounttokens.</li>
          <li>Wees voorzichtig met transacties buiten het platform en met aanbiedingen die te mooi lijken.</li>
        </ul>
        <div class="fact"><b>Tip:</b> bekijk de communityregels en rapporteer verdachte accounts aan de moderators van het platform.</div>`,
    },
    {
      id: "fan-creativity",
      tag: "Fan Art & Creativiteit",
      title: "Pokémon-fancreaties: kaarten, knuffels en 3D-prints",
      intro: "Een startgids voor creatieve projecten en het verantwoord delen van fanwerken.",
      img: ART(778), c1: "#8e6e53", c2: "#e0c3a3",
      body: `
        <p>Fans geven hun liefde voor Pokémon op allerlei manieren vorm: met custom kaartontwerpen, gehaakte of gebreide knuffels en 3D-geprinte figuren. Gebruik dit als inspiratie en ontdek makers via hun eigen openbare kanalen; deze site toont geen werk van makers zonder hun toestemming.</p>
        <h4>Custom kaarten maken</h4>
        <ul>
          <li>Ontwerp een eigen illustratie of proxy voor persoonlijk, informeel gebruik.</li>
          <li>Maak duidelijk dat het geen officiële kaart is en gebruik het niet om anderen te misleiden.</li>
          <li>Deel geen scans of ontwerpen van andere kunstenaars zonder toestemming; vermeld maker en bron als die delen toestaan.</li>
        </ul>
        <h4>Haken en breien</h4>
        <p>Zoek naar amigurumi- of breipatronen van makers die hun patronen zelf publiceren. Controleer of een patroon gratis of betaald is en of commercieel gebruik is toegestaan. Begin met een eenvoudig patroon, kies passend garen en houd kleine onderdelen buiten bereik van jonge kinderen.</p>
        <h4>3D-printen</h4>
        <p>Bekijk de licentie van elk model voordat je het downloadt of print. Sommige makers staan alleen persoonlijk gebruik toe. Houd rekening met printerveiligheid, ventilatie, materiaalinstructies en kleine onderdelen. Verkoop geen fanprints zonder de benodigde rechten.</p>
        <h4>Een maker onder de aandacht brengen</h4>
        <p>Vraag toestemming voordat je kunst, foto's of patronen opnieuw publiceert. Link bij voorkeur naar de oorspronkelijke maker, geef correcte credits en respecteer verzoeken om werk te verwijderen.</p>
        <p>Ontdek makers via hun eigen portfolio's en creatieve platforms:
          <a href="https://www.deviantart.com/search?q=pokemon%20custom%20card" target="_blank" rel="noopener noreferrer">custom kaartkunst op DeviantArt</a>,
          <a href="https://www.ravelry.com/patterns/search#query=pokemon%20crochet" target="_blank" rel="noopener noreferrer">haakpatronen op Ravelry</a> en
          <a href="https://www.printables.com/search/models?q=pokemon" target="_blank" rel="noopener noreferrer">3D-modellen op Printables</a>.
          Controleer altijd de licentie en de voorwaarden van de maker.</p>
        <div class="fact"><b>Maak het herkenbaar als fanwerk:</b> presenteer zelfgemaakte projecten niet als officiële Pokémon-producten.</div>`,
    },
    {
      id: "glitches-myths",
      tag: "Glitches & Mythen",
      title: "Pokémon-glitches en bekende fanmythen",
      intro: "Wat er achter MissingNo. en het verhaal over de vrachtwagen bij de S.S. Anne zit.",
      img: ART(132), c1: "#232526", c2: "#414345",
      body: `
        <p>Oude Pokémon-games bevatten soms onverwachte effecten door bugs of bijzondere speltoestanden. Online verhalen mengen zulke echte glitches geregeld met geruchten. De uitleg hieronder gaat over spelgeschiedenis; experimenteer niet op je enige savebestand.</p>
        <h4>MissingNo. in Red, Blue en Yellow</h4>
        <p>MissingNo. is een bekende foutverschijning uit de eerste generatie. Door een ongebruikelijke combinatie van speltoestanden kan het spel gegevens als een Pokémon-gevecht interpreteren. Afhankelijk van de versie kan een ontmoeting vreemde sprites tonen en een itemaantal veranderen. Dat is geen normale Pokémon of officiële vangst.</p>
        <p>Glitches kunnen onverwachte effecten hebben op je team, Hall of Fame-gegevens of opgeslagen spel. Maak eerst een aparte back-up als je emulator of platform dat ondersteunt, en gebruik geen belangrijke save als proef.</p>
        <h4>De vrachtwagen bij de S.S. Anne</h4>
        <p>In Red en Blue staat bij de haven een vrachtwagen die spelers normaal gesproken nauwelijks kunnen bereiken. Het verhaal dat daar een Mew onder zit, is een mythe: de vrachtwagen bevat geen verborgen Mew. Mew werd in de oorspronkelijke games via officiële distributies beschikbaar gemaakt.</p>
        <h4>Waarom zulke verhalen blijven bestaan</h4>
        <p>Verborgen gebieden, ongewone graphics en glitches waren moeilijk te controleren voordat er betrouwbare online gidsen waren. Spelers vulden ontbrekende informatie aan met geruchten. Daardoor werden sommige verhalen onderdeel van de Pokémon-folklore.</p>
        <div class="fact"><b>Veilig spelen:</b> glitches zijn onvoorspelbaar. Gebruik een reserve-save en volg geen stappen die je voortgang of opslag kunnen beschadigen.</div>`,
    },
    {
      id: "printable-checklists",
      tag: "Downloadbare checklists",
      title: "Printbare Pokémon-checklists",
      intro: "Vink Pokémon en TCG-kaarten af, en gebruik Afdrukken → Opslaan als PDF.",
      img: ART(386), c1: "#1c92d2", c2: "#f2fcfe",
      body: `
        <p>Kies een checklist, vink items af en druk op <b>Afdrukken / Opslaan als PDF</b>. In het afdrukvenster van je browser kies je <b>Opslaan als PDF</b> als bestemming. Je afvinkvoortgang wordt lokaal in deze browser bewaard.</p>
        <h4>TCG-masterset checklist</h4>
        <p>Kies een set om de beschikbare kaarten uit de TCGdex-database op te halen. De lijst volgt de database-inhoud en kan parallelle varianten of promotiekaarten niet altijd als aparte masterset-items weergeven.</p>
        <div id="tcg-checklist-tool" class="checklist-tool">
          <label for="tcg-checklist-set">Kaartenset</label>
          <select id="tcg-checklist-set"><option value="">Sets laden...</option></select>
          <p id="tcg-checklist-status" class="status" aria-live="polite"></p>
          <div class="checklist-actions"><button type="button" class="big-btn" id="tcg-checklist-print">Afdrukken / Opslaan als PDF</button><button type="button" class="wt-chip" id="tcg-checklist-clear">Voortgang wissen</button></div>
          <div id="tcg-checklist-list" class="checklist-list"></div>
        </div>
        <h4>Pokédex-checklist</h4>
        <p>Kies een generatie, zoek op naam of nummer en vink gevangen Pokémon af. Afdrukken bevat de volledige gekozen generatie, niet alleen de zichtbare pagina.</p>
        <div id="dex-checklist-tool" class="checklist-tool">
          <label for="dex-checklist-gen">Generatie</label>
          <select id="dex-checklist-gen">
            <option value="1">1 · Kanto</option><option value="2">2 · Johto</option><option value="3">3 · Hoenn</option>
            <option value="4">4 · Sinnoh</option><option value="5">5 · Unova</option><option value="6">6 · Kalos</option>
            <option value="7">7 · Alola</option><option value="8">8 · Galar</option><option value="9">9 · Paldea</option>
          </select>
          <input id="dex-checklist-search" type="search" placeholder="Zoek Pokémon..." autocomplete="off">
          <p id="dex-checklist-status" class="status" aria-live="polite"></p>
          <div class="checklist-actions"><button type="button" class="big-btn" id="dex-checklist-print">Afdrukken / Opslaan als PDF</button><button type="button" class="wt-chip" id="dex-checklist-clear">Voortgang wissen</button></div>
          <div id="dex-checklist-list" class="checklist-list"></div>
          <div class="checklist-actions"><button type="button" class="wt-chip" id="dex-checklist-prev">← Vorige</button><button type="button" class="wt-chip" id="dex-checklist-next">Volgende →</button></div>
        </div>
        <p class="tcg-note">De databasechecklists zijn bedoeld als hulpmiddel. Controleer bij mastersets welke reverse-holo, parallelle en promotievarianten jij persoonlijk wilt verzamelen.</p>`,
    },
    {
      id: "type-calculator",
      tag: "Interactieve tool",
      title: "Type-chart en zwakheden-calculator",
      intro: "Kies een aanvalstype en de types van de tegenstander om de schadevermenigvuldiger te zien.",
      img: ART(65), c1: "#0f2027", c2: "#2c5364",
      body: `
        <p>De calculator combineert de type-effectiviteit voor één of twee verdedigingstypes. Vaardigheden, voorwerpen en speciale gevechtseffecten zijn niet meegerekend.</p>
        <div class="items-controls">
          <label>Aanvalstype <select id="type-attack"></select></label>
          <label>Verdediger type 1 <select id="type-defender"></select></label>
          <label>Verdediger type 2 (optioneel) <select id="type-defender2"></select></label>
        </div>
        <p id="type-result" class="fact" aria-live="polite"></p>`,
    },
    {
      id: "shiny-comparer",
      tag: "Interactieve tool",
      title: "Shiny-vergelijker",
      intro: "Zoek door Pokémon en alternatieve vormen uit alle generaties en vergelijk de artwork.",
      img: SHINY(196), c1: "#4568dc", c2: "#b06ab3",
      body: `
        <p>Zoek in alle Pokémon en vormen die in de PokéAPI-index staan, uit generatie 1 tot en met 9. Sommige vormen of Pokémon hebben geen aparte artworkbestanden; in dat geval meldt de vergelijker dat de afbeelding ontbreekt. Shiny-kleuren zijn cosmetisch en veranderen de basisstats niet.</p>
        <label for="shiny-search"><b>Zoek op Pokémon of vorm</b></label>
        <input id="shiny-search" type="search" placeholder="Bijvoorbeeld Pikachu, Charizard of Meowth Galar" autocomplete="off">
        <label for="shiny-choice"><b>Pokémon</b></label>
        <select id="shiny-choice" aria-describedby="shiny-status"><option value="">Pokémon laden...</option></select>
        <p id="shiny-status" class="tcg-note" aria-live="polite">Pokémon laden...</p>
        <div class="shiny-compare">
          <figure><img id="shiny-normal" alt="Normale versie" hidden><div class="shiny-placeholder">Artwork verschijnt hier</div><figcaption>Normaal</figcaption></figure>
          <figure><img id="shiny-variant" alt="Shiny-versie" hidden><div class="shiny-placeholder">Artwork verschijnt hier</div><figcaption>Shiny</figcaption></figure>
        </div>`,
    },
    {
      id: "personality-quiz",
      tag: "Interactieve quiz",
      title: "Welke Pokémon past bij jouw stijl?",
      intro: "Beantwoord 15 vragen één voor één en ontdek welke Pokémon het beste bij jouw keuzes passen.",
      img: ART(133), c1: "#f7971e", c2: "#ffd200",
      body: `
        <p>Beantwoord 15 specifieke vragen. Klik na elke keuze op <b>Volgende</b>. Daarna zie je alle Pokémon gerangschikt op basis van jouw antwoorden. De uitslag is een speelse match op type en generatie, geen vaste persoonlijkheidstest.</p>
        <div id="personality-quiz">
          <div id="quiz-flow">
            <div class="personality-progress">
              <span id="quiz-question-count">Vraag 1 van 15</span>
              <progress id="quiz-progress" max="15" value="1" aria-label="Voortgang van de quiz"></progress>
            </div>
            <div id="quiz-question" aria-live="polite"></div>
            <div class="personality-actions">
              <button id="quiz-previous" class="wt-chip" type="button" disabled>Vorige</button>
              <button id="quiz-next" class="big-btn" type="button" disabled>Volgende</button>
            </div>
          </div>
          <section id="quiz-results" hidden aria-labelledby="quiz-results-title">
            <h3 id="quiz-results-title">Jouw Pokémon-matches</h3>
            <p class="personality-result-note">Je allerbeste match wordt uitgelicht; daaronder staan de overige Pokémon op volgorde. De matchscore vergelijkt jouw keuzes met type en generatie.</p>
            <p id="quiz-result-status" role="status" aria-live="polite">De Pokémonlijst wordt geladen...</p>
            <div class="personality-result-filters">
              <label for="quiz-result-search">Zoek in jouw resultaten
                <input id="quiz-result-search" type="search" placeholder="Naam of Pokédexnummer" autocomplete="off">
              </label>
              <label for="quiz-result-type">Filter op type
                <select id="quiz-result-type"><option value="">Alle types</option>${PK.allTypes().map((type) => `<option value="${PK.esc(type)}">${PK.esc(PK.typeName(type))}</option>`).join("")}</select>
              </label>
            </div>
            <div id="quiz-best-match" class="personality-best-match"></div>
            <div id="quiz-result-grid" class="personality-result-grid"></div>
            <button id="quiz-results-more" class="big-btn more-btn" type="button" hidden>Meer resultaten</button>
            <div class="personality-actions">
              <button id="quiz-edit" class="wt-chip" type="button">Antwoorden aanpassen</button>
              <button id="quiz-restart" class="wt-chip" type="button">Opnieuw beginnen</button>
              <button id="quiz-results-retry" class="wt-chip" type="button" hidden>Pokémon opnieuw laden</button>
            </div>
          </section>
        </div>`,
    },
  ];

  const bg =  (a) => `--c1:${a.c1};--c2:${a.c2}`;
  window.SITE_ARTICLES = articles;

  $("article-grid").innerHTML = articles
    .map(
      (a) => `
      <div class="article-card" data-id="${a.id}">
        <div class="art-img" style="${bg(a)}"><img loading="lazy" alt="" src="${a.img}"></div>
        <div class="art-body">
          <div class="tag">${a.tag}</div>
          <h3>${a.title}</h3>
          <p>${a.intro}</p>
        </div>
      </div>`
    )
    .join("");

  function open(id) {
    const a = articles.find((x) => x.id === id);
    $("article-list").hidden = true;
    const r = $("article-reader");
    r.hidden = false;
    r.innerHTML = `
      <div class="art-img" style="${bg(a)}"><img alt="" src="${a.img}"></div>
      <div class="art-text">
        <div class="tag" style="color:#8e44ff;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:.75rem">${a.tag}</div>
        <h2>${a.title}</h2>
        ${a.body}
        ${window.ARTICLES_MORE?.[a.id] || ""}
      </div>`;
    mountArticleTool(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function mountArticleTool(id) {
    if (id === "printable-checklists") {
      const TCG_API = "https://api.tcgdex.net/v2/en";
      const tcgSet = $("tcg-checklist-set");
      const tcgStatus = $("tcg-checklist-status");
      const tcgList = $("tcg-checklist-list");
      let setCards = [];
      let setToken = 0;
      const setKey = (setId) => `tcg-master-checklist-${setId}`;
      const captureSetState = () => new Set(JSON.parse(localStorage.getItem(setKey(tcgSet.value)) || "[]"));
      const renderSetCards = () => {
        const checked = captureSetState();
        tcgList.innerHTML = setCards.map((card) => `
          <label class="checklist-row">
            <input type="checkbox" data-card="${PK.esc(card.id)}" ${checked.has(card.id) ? "checked" : ""}>
            ${card.image ? `<img loading="lazy" src="${PK.esc(card.image)}/low.webp" alt="">` : ""}
            <span>#${PK.esc(card.localId)} · ${PK.esc(card.name)}</span>
          </label>`).join("");
      };
      const loadSetCards = async () => {
        const token = ++setToken;
        const setId = tcgSet.value;
        tcgList.innerHTML = "";
        if (!setId) {
          tcgStatus.textContent = "Kies een set om de checklist te laden.";
          return;
        }
        tcgStatus.textContent = "Kaarten laden...";
        try {
          const response = await fetch(`${TCG_API}/sets/${encodeURIComponent(setId)}`);
          if (!response.ok) throw new Error(`TCGdex HTTP ${response.status}`);
          const data = await response.json();
          if (token !== setToken) return;
          setCards = (data.cards || []).slice().sort((a, b) => String(a.localId).localeCompare(String(b.localId), undefined, { numeric: true }));
          tcgStatus.textContent = `${setCards.length} kaarten in ${data.name || setId}.`;
          renderSetCards();
        } catch (error) {
          if (token !== setToken) return;
          console.error("Could not load TCG checklist set.", error);
          tcgStatus.textContent = "De setchecklist kon niet worden geladen. Controleer je internetverbinding en probeer opnieuw.";
        }
      };
      fetch(`${TCG_API}/sets`)
        .then((response) => {
          if (!response.ok) throw new Error(`TCGdex HTTP ${response.status}`);
          return response.json();
        })
        .then((sets) => {
          tcgSet.innerHTML = `<option value="">Kies een set...</option>${sets.map((set) => `<option value="${PK.esc(set.id)}">${PK.esc(set.name)}</option>`).join("")}`;
        })
        .catch((error) => {
          console.error("Could not load TCG checklist sets.", error);
          tcgSet.innerHTML = `<option value="">Sets niet beschikbaar</option>`;
          tcgStatus.textContent = "De setlijst kon niet worden geladen. Probeer het later opnieuw.";
        });
      tcgSet.addEventListener("change", loadSetCards);
      tcgList.addEventListener("change", (event) => {
        const checkbox = event.target.closest("input[data-card]");
        if (!checkbox) return;
        const checked = captureSetState();
        checkbox.checked ? checked.add(checkbox.dataset.card) : checked.delete(checkbox.dataset.card);
        localStorage.setItem(setKey(tcgSet.value), JSON.stringify([...checked]));
      });
      $("tcg-checklist-clear").addEventListener("click", () => {
        if (!tcgSet.value) return;
        localStorage.removeItem(setKey(tcgSet.value));
        renderSetCards();
      });
      $("tcg-checklist-print").addEventListener("click", () => printChecklist("Pokémon TCG checklist", null, "tcg-checklist-tool"));

      const genSelect = $("dex-checklist-gen");
      const dexSearch = $("dex-checklist-search");
      const dexStatus = $("dex-checklist-status");
      const dexList = $("dex-checklist-list");
      const pageSize = 40;
      let generationMons = [];
      let currentPage = 0;
      let genToken = 0;
      const caughtKey = (gen) => `caught-checklist-gen-${gen}`;
      const captureCaught = () => new Set(JSON.parse(localStorage.getItem(caughtKey(genSelect.value)) || "[]"));
      const filteredMons = () => {
        const query = dexSearch.value.trim().toLowerCase();
        return generationMons.filter((mon) => !query || mon.name.includes(query) || String(mon.id) === query);
      };
      const renderDexPage = () => {
        const matching = filteredMons();
        const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
        currentPage = Math.min(currentPage, pageCount - 1);
        const checked = captureCaught();
        dexList.innerHTML = matching.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((mon) => `
          <label class="checklist-row">
            <input type="checkbox" data-dex="${mon.id}" ${checked.has(mon.id) ? "checked" : ""}>
            <img loading="lazy" src="${ART(mon.id)}" alt="">
            <span>#${String(mon.id).padStart(4, "0")} · ${PK.esc(PK.pretty(mon.name))}</span>
          </label>`).join("");
        const caughtCount = generationMons.filter((mon) => checked.has(mon.id)).length;
        dexStatus.textContent = `${caughtCount}/${generationMons.length} gevangen · ${matching.length} resultaten · pagina ${currentPage + 1}/${pageCount}`;
        $("dex-checklist-prev").disabled = currentPage === 0;
        $("dex-checklist-next").disabled = currentPage >= pageCount - 1;
      };
      const loadGeneration = async () => {
        const token = ++genToken;
        const gen = genSelect.value;
        currentPage = 0;
        dexList.innerHTML = "";
        dexStatus.textContent = "Pokédex laden...";
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
          if (!response.ok) throw new Error(`PokéAPI HTTP ${response.status}`);
          const data = await response.json();
          if (token !== genToken) return;
          generationMons = data.pokemon_species
            .map((species) => ({ name: species.name, id: Number(species.url.split("/").filter(Boolean).pop()) }))
            .sort((a, b) => a.id - b.id);
          renderDexPage();
        } catch (error) {
          if (token !== genToken) return;
          console.error("Could not load Pokédex checklist.", error);
          dexStatus.textContent = "De Pokédex-checklist kon niet worden geladen. Controleer je internetverbinding en probeer opnieuw.";
        }
      };
      dexList.addEventListener("change", (event) => {
        const checkbox = event.target.closest("input[data-dex]");
        if (!checkbox) return;
        const caught = captureCaught();
        const pokemonId = Number(checkbox.dataset.dex);
        checkbox.checked ? caught.add(pokemonId) : caught.delete(pokemonId);
        localStorage.setItem(caughtKey(genSelect.value), JSON.stringify([...caught]));
        renderDexPage();
      });
      genSelect.addEventListener("change", loadGeneration);
      dexSearch.addEventListener("input", () => { currentPage = 0; renderDexPage(); });
      $("dex-checklist-prev").addEventListener("click", () => { currentPage--; renderDexPage(); });
      $("dex-checklist-next").addEventListener("click", () => { currentPage++; renderDexPage(); });
      $("dex-checklist-clear").addEventListener("click", () => {
        localStorage.removeItem(caughtKey(genSelect.value));
        renderDexPage();
      });
      $("dex-checklist-print").addEventListener("click", () => {
        const previousSearch = dexSearch.value;
        const previousPage = currentPage;
        dexSearch.value = "";
        currentPage = 0;
        const checked = captureCaught();
        dexList.innerHTML = generationMons.map((mon) => `
          <label class="checklist-row">
            <input type="checkbox" ${checked.has(mon.id) ? "checked" : ""}>
            <img src="${ART(mon.id)}" alt="">
            <span>#${String(mon.id).padStart(4, "0")} · ${PK.esc(PK.pretty(mon.name))}</span>
          </label>`).join("");
        printChecklist(`Pokédex generatie ${genSelect.value}`, () => {
          dexSearch.value = previousSearch;
          currentPage = previousPage;
          renderDexPage();
        }, "dex-checklist-tool");
      });
      loadGeneration();
    }

    if (id === "type-calculator") {
      const attack = $("type-attack");
      const defender = $("type-defender");
      const defender2 = $("type-defender2");
      const options = PK.allTypes().map((type) => `<option value="${type}">${PK.typeName(type)}</option>`).join("");
      attack.innerHTML = options;
      defender.innerHTML = options;
      defender2.innerHTML = `<option value="">Geen tweede type</option>${options}`;
      attack.value = "water";
      defender.value = "fire";
      const update = () => {
        const types = [defender.value, defender2.value].filter(Boolean);
        const multiplier = PK.mult(attack.value, types);
        const text = multiplier === 0
          ? "Geen effect (×0)"
          : multiplier > 1
            ? `Super effectief: ×${multiplier}`
            : multiplier < 1
              ? `Niet erg effectief: ×${multiplier}`
              : "Normale effectiviteit (×1)";
        $("type-result").innerHTML = `<b>${PK.typeName(attack.value)} → ${types.map(PK.typeName).join(" / ")}:</b> ${text}`;
      };
      [attack, defender, defender2].forEach((select) => select.addEventListener("change", update));
      update();
    }

    function printChecklist(title, afterPrint, targetId) {
      const previousTitle = document.title;
      document.title = title;
      document.getElementById(targetId).dataset.printTitle = title;
      document.body.dataset.printTarget = targetId;
      document.body.classList.add("print-checklist");
      const restore = () => {
        document.body.classList.remove("print-checklist");
        delete document.body.dataset.printTarget;
        delete document.getElementById(targetId).dataset.printTitle;
        document.title = previousTitle;
        window.removeEventListener("afterprint", restore);
        afterPrint?.();
      };
      window.addEventListener("afterprint", restore, { once: true });
      window.print();
    }

    if (id === "shiny-comparer") {
      const select = $("shiny-choice");
      const search = $("shiny-search");
      const status = $("shiny-status");
      let pokemon = [];
      let loadToken = 0;
      const formatName = (name) => PK.pretty(name).replace(/\bMega\b/g, "Mega").replace(/\bGmax\b/g, "Gigantamax");
      const renderOptions = (query = "") => {
        const term = query.trim().toLowerCase().replace(/\s+/g, "-");
        const parts = term.split("-").filter(Boolean);
        const matches = pokemon.filter((entry) => !term || parts.every((part) => entry.name.includes(part)) || String(entry.id) === term);
        const previous = select.value;
        select.innerHTML = matches.map((entry) =>
          `<option value="${PK.esc(entry.name)}">#${entry.id} · ${PK.esc(formatName(entry.name))}</option>`
        ).join("");
        if (matches.some((entry) => entry.name === previous)) select.value = previous;
        status.textContent = `${matches.length} van ${pokemon.length} Pokémon en vormen`;
        if (matches.length && select.value !== previous) loadArtwork();
        if (!matches.length) {
          loadToken++;
          status.textContent = "Geen Pokémon of vormen gevonden.";
          setArtworkMessage("Geen resultaat");
        }
      };
      const setArtworkMessage = (message) => {
        ["shiny-normal", "shiny-variant"].forEach((imageId) => {
          const image = $(imageId);
          image.hidden = true;
          image.removeAttribute("src");
          image.nextElementSibling.textContent = message;
          image.nextElementSibling.hidden = false;
        });
      };
      const loadArtwork = async () => {
        const entry = pokemon.find((item) => item.name === select.value);
        if (!entry) return;
        const token = ++loadToken;
        const label = formatName(entry.name);
        status.textContent = `Artwork voor ${label} laden...`;
        setArtworkMessage("Laden...");
        try {
          const response = await fetch(entry.url);
          if (!response.ok) throw new Error(`PokéAPI HTTP ${response.status}`);
          const data = await response.json();
          if (token !== loadToken) return;
          const artwork = data.sprites?.other?.["official-artwork"];
          const images = [
            [ $("shiny-normal"), artwork?.front_default || data.sprites?.front_default ],
            [ $("shiny-variant"), artwork?.front_shiny || data.sprites?.front_shiny ],
          ];
          let completed = 0;
          let failures = 0;
          const recordImageResult = (failed) => {
            if (token !== loadToken) return;
            completed++;
            if (failed) failures++;
            if (completed === images.length) {
              status.textContent = failures
                ? `${label}: niet voor beide versies is artwork beschikbaar.`
                : `${label}: normale en shiny artwork geladen.`;
            }
          };
          images.forEach(([image, source]) => {
            image.alt = `${label} ${image.id === "shiny-normal" ? "normaal" : "shiny"}`;
            if (!source) {
              image.hidden = true;
              image.nextElementSibling.textContent = "Geen artwork beschikbaar";
              image.nextElementSibling.hidden = false;
              recordImageResult(true);
              return;
            }
            image.onload = () => {
              image.hidden = false;
              image.nextElementSibling.hidden = true;
              recordImageResult(false);
            };
            image.onerror = () => {
              image.hidden = true;
              image.nextElementSibling.textContent = "Artwork kon niet worden geladen";
              image.nextElementSibling.hidden = false;
              recordImageResult(true);
            };
            image.src = source;
          });
        } catch (error) {
          if (token !== loadToken) return;
          console.error(`Could not load shiny comparison for ${entry.name}.`, error);
          status.textContent = `Artwork voor ${label} kon niet worden geladen. Controleer je internetverbinding en probeer opnieuw.`;
          setArtworkMessage("Artwork niet beschikbaar");
        }
      };
      search.addEventListener("input", () => renderOptions(search.value));
      select.addEventListener("change", loadArtwork);
      status.textContent = "Volledige Pokémon-index laden...";
      fetch("https://pokeapi.co/api/v2/pokemon?limit=2000")
        .then((response) => {
          if (!response.ok) throw new Error(`PokéAPI HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => {
          pokemon = data.results
            .map((entry) => ({
              name: entry.name,
              url: entry.url,
              id: Number(entry.url.split("/").filter(Boolean).pop()),
            }))
            .sort((a, b) => a.id - b.id);
          renderOptions();
          const pikachu = pokemon.find((entry) => entry.name === "pikachu");
          if (pikachu) select.value = pikachu.name;
          if (select.value) loadArtwork();
        })
        .catch((error) => {
          console.error("Could not load the complete Pokémon index for the shiny comparer.", error);
          select.innerHTML = `<option value="">Pokémon niet beschikbaar</option>`;
          status.textContent = "De Pokémonlijst kon niet worden geladen. Controleer je internetverbinding en open de vergelijker opnieuw.";
          setArtworkMessage("Pokémonlijst niet beschikbaar");
        });
    }

    if (id === "personality-quiz") {
      const quiz = $("personality-quiz");
      const flow = $("quiz-flow");
      const results = $("quiz-results");
      const questionArea = $("quiz-question");
      const next = $("quiz-next");
      const previous = $("quiz-previous");
      const resultStatus = $("quiz-result-status");
      const bestMatchCard = $("quiz-best-match");
      const resultGrid = $("quiz-result-grid");
      const more = $("quiz-results-more");
      const retry = $("quiz-results-retry");
      const answers = Array(PERSONALITY_QUESTIONS.length).fill(null);
      let questionIndex = 0;
      let quizCatalog = null;
      let quizError = "";
      let rankedResults = [];
      let visibleResults = 24;

      const renderQuestion = () => {
        const question = PERSONALITY_QUESTIONS[questionIndex];
        $("quiz-question-count").textContent = `Vraag ${questionIndex + 1} van ${PERSONALITY_QUESTIONS.length}`;
        $("quiz-progress").value = questionIndex + 1;
        previous.disabled = questionIndex === 0;
        next.textContent = questionIndex === PERSONALITY_QUESTIONS.length - 1 ? "Bekijk resultaten" : "Volgende";
        next.disabled = answers[questionIndex] === null;
        questionArea.innerHTML = `
          <fieldset class="personality-question">
            <legend>${PK.esc(question.question)}</legend>
            <div class="personality-choices${question.options.length > 10 ? " many" : ""}">
              ${question.options.map((option, index) => `
                <label class="personality-choice${answers[questionIndex] === index ? " selected" : ""}">
                  <input type="radio" name="personality-answer" value="${index}" ${answers[questionIndex] === index ? "checked" : ""}>
                  <span>${PK.esc(option.label)}</span>
                </label>`).join("")}
            </div>
          </fieldset>`;
      };

      const calculateResults = () => {
        const selected = answers.map((answer, index) => PERSONALITY_QUESTIONS[index].options[answer]).filter(Boolean);
        const scored = quizCatalog.map((pokemon) => {
          let score = 0;
          let scoredQuestions = 0;
          selected.forEach((option) => {
            const dimensions = Number(Boolean(option.types?.length)) + Number(Boolean(option.generation));
            if (!dimensions) return;
            let matched = 0;
            if (option.types?.length && pokemon.types.some((type) => option.types.includes(type))) matched++;
            if (option.generation && pokemon.generation === option.generation) matched++;
            score += matched / dimensions;
            scoredQuestions++;
          });
          return {
            ...pokemon,
            match: scoredQuestions ? Math.round((score / scoredQuestions) * 100) : 0,
          };
        });
        rankedResults = scored.sort((a, b) => b.match - a.match || a.id - b.id);
      };

      const renderResults = () => {
        retry.hidden = !quizError;
        if (!quizCatalog) {
          resultStatus.textContent = quizError
            ? `De Pokémonlijst kon niet worden geladen (${quizError}). Probeer het opnieuw.`
            : "Alle Pokémon worden geladen...";
          bestMatchCard.innerHTML = "";
          resultGrid.innerHTML = "";
          more.hidden = true;
          return;
        }
        const query = $("quiz-result-search").value.trim().toLowerCase().replace(/\s+/g, "-");
        const type = $("quiz-result-type").value;
        const matches = rankedResults.filter((pokemon) =>
          (!query || pokemon.name.includes(query) || String(pokemon.id) === query) &&
          (!type || pokemon.types.includes(type))
        );
        const bestMatch = matches[0];
        const otherMatches = matches.slice(1);
        const shown = otherMatches.slice(0, visibleResults);
        resultStatus.textContent = bestMatch
          ? `${matches.length} Pokémon · ${PK.pretty(bestMatch.name)} is jouw allerbeste match · ${shown.length} overige getoond.`
          : "Geen Pokémon gevonden met deze zoekopdracht of dit type.";
        bestMatchCard.innerHTML = bestMatch ? `
          <article class="personality-best-match-card" aria-label="Jouw allerbeste match: ${PK.esc(PK.pretty(bestMatch.name))}">
            <img src="${ART(bestMatch.id)}" alt="${PK.esc(PK.pretty(bestMatch.name))}">
            <div class="personality-best-match-copy">
              <span class="personality-best-match-label">Jouw allerbeste match</span>
              <h4>${PK.esc(PK.pretty(bestMatch.name))}</h4>
              <small>#${String(bestMatch.id).padStart(4, "0")} · generatie ${bestMatch.generation}</small>
              <div class="personality-result-types">${bestMatch.types.map((pokemonType) => PK.typeBadge(pokemonType)).join("")}</div>
            </div>
            <span class="personality-match personality-best-match-score">${bestMatch.match}% match</span>
          </article>` : "";
        resultGrid.innerHTML = shown.map((pokemon) => `
          <article class="personality-result-card">
            <img loading="lazy" src="${ART(pokemon.id)}" alt="${PK.esc(PK.pretty(pokemon.name))}">
            <div class="personality-result-copy">
              <b>${PK.esc(PK.pretty(pokemon.name))}</b>
              <small>#${String(pokemon.id).padStart(4, "0")} · generatie ${pokemon.generation}</small>
              <div class="personality-result-types">${pokemon.types.map((pokemonType) => PK.typeBadge(pokemonType)).join("")}</div>
            </div>
            <span class="personality-match">${pokemon.match}%</span>
          </article>`).join("");
        more.hidden = otherMatches.length <= shown.length;
      };

      const showResults = () => {
        flow.hidden = true;
        results.hidden = false;
        if (quizCatalog) calculateResults();
        renderResults();
      };

      const startCatalogLoad = () => {
        quizError = "";
        renderResults();
        loadPersonalityCatalog()
          .then((catalog) => {
            quizCatalog = catalog;
            if (!results.hidden) {
              calculateResults();
              renderResults();
            }
          })
          .catch((error) => {
            console.error("Could not load all Pokémon for the personality quiz.", error);
            quizError = error.message;
            if (!results.hidden) renderResults();
          });
      };

      quiz.addEventListener("change", (event) => {
        if (event.target.name === "personality-answer") {
          answers[questionIndex] = Number(event.target.value);
          quiz.querySelectorAll(".personality-choice").forEach((choice) => {
            choice.classList.toggle("selected", choice.querySelector("input").checked);
          });
          next.disabled = false;
        } else if (event.target.id === "quiz-result-type") {
          visibleResults = 24;
          renderResults();
        }
      });
      quiz.addEventListener("input", (event) => {
        if (event.target.id === "quiz-result-search") {
          visibleResults = 24;
          renderResults();
        }
      });
      quiz.addEventListener("click", (event) => {
        if (event.target.closest("#quiz-next")) {
          if (answers[questionIndex] === null) return;
          if (questionIndex === PERSONALITY_QUESTIONS.length - 1) showResults();
          else {
            questionIndex++;
            renderQuestion();
          }
        } else if (event.target.closest("#quiz-previous")) {
          if (questionIndex > 0) {
            questionIndex--;
            renderQuestion();
          }
        } else if (event.target.closest("#quiz-results-more")) {
          visibleResults += 24;
          renderResults();
        } else if (event.target.closest("#quiz-results-retry")) {
          startCatalogLoad();
        } else if (event.target.closest("#quiz-edit")) {
          results.hidden = true;
          flow.hidden = false;
          questionIndex = PERSONALITY_QUESTIONS.length - 1;
          renderQuestion();
        } else if (event.target.closest("#quiz-restart")) {
          answers.fill(null);
          questionIndex = 0;
          visibleResults = 24;
          $("quiz-result-search").value = "";
          $("quiz-result-type").value = "";
          results.hidden = true;
          flow.hidden = false;
          renderQuestion();
        }
      });

      renderQuestion();
      startCatalogLoad();
    }
  }

  function back() {
    $("article-reader").hidden = true;
    $("back-btn")?.remove();
    $("article-list").hidden = false;
  }

  // The back button sits above the reader, so it is inserted when an article is opened
  $("article-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".article-card");
    if (!card) return;
    open(card.dataset.id);
    const btn = document.createElement("button");
    btn.id = "back-btn";
    btn.className = "back-btn";
    btn.textContent = "← Terug naar artikelen";
    btn.addEventListener("click", back);
    $("article-reader").before(btn);
  });

  document.querySelector('.tab[data-view="articles"]').addEventListener("click", back);
})();
