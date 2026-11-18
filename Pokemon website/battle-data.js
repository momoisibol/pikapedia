// Gym leaders, Elite Four en kampioenen per game. Levels zijn bij benadering en kunnen per versie of moeilijkheid verschillen.
window.BATTLES = (() => {
  // "geodude:12 onix:14" -> [["geodude",12],["onix",14]]
  const T = (s) => s.trim().split(/\s+/).map((x) => { const [n, l] = x.split(":"); return [n, Number(l)]; });
  const G = (slug, city, leader, type, team) => ({ slug, city, leader, type, team: team ? T(team) : [] });
  const M = (name, type, team) => ({ name, type, team: T(team) });

  const kantoGyms = [
    G("pewter-city", "Pewter City", "Brock", "rock", "geodude:12 onix:14"),
    G("cerulean-city", "Cerulean City", "Misty", "water", "staryu:18 starmie:21"),
    G("vermilion-city", "Vermilion City", "Lt. Surge", "electric", "voltorb:21 pikachu:18 raichu:24"),
    G("celadon-city", "Celadon City", "Erika", "grass", "victreebel:29 tangela:24 vileplume:29"),
    G("fuchsia-city", "Fuchsia City", "Koga", "poison", "koffing:37 muk:39 koffing:37 weezing:43"),
    G("saffron-city", "Saffron City", "Sabrina", "psychic", "kadabra:38 mr-mime:37 venomoth:38 alakazam:43"),
    G("cinnabar-island", "Cinnabar Island", "Blaine", "fire", "growlithe:42 ponyta:40 rapidash:42 arcanine:47"),
    G("viridian-city", "Viridian City", "Giovanni", "ground", "rhyhorn:45 dugtrio:42 nidoqueen:44 nidoking:45 rhydon:50"),
  ];
  const kantoE4 = [
    M("Lorelei", "ice", "dewgong:54 cloyster:53 slowbro:54 jynx:56 lapras:56"),
    M("Bruno", "fighting", "onix:53 hitmonchan:55 hitmonlee:55 onix:56 machamp:58"),
    M("Agatha", "ghost", "gengar:56 golbat:56 haunter:55 arbok:58 gengar:60"),
    M("Lance", "dragon", "gyarados:58 dragonair:56 dragonair:56 aerodactyl:60 dragonite:62"),
  ];
  const johtoGyms = [
    G("violet-city", "Violet City", "Falkner", "flying", "pidgey:7 pidgeotto:9"),
    G("azalea-town", "Azalea Town", "Bugsy", "bug", "metapod:14 kakuna:14 scyther:16"),
    G("goldenrod-city", "Goldenrod City", "Whitney", "normal", "clefairy:17 miltank:19"),
    G("ecruteak-city", "Ecruteak City", "Morty", "ghost", "gastly:21 haunter:21 haunter:23 gengar:25"),
    G("cianwood-city", "Cianwood City", "Chuck", "fighting", "primeape:27 poliwrath:30"),
    G("olivine-city", "Olivine City", "Jasmine", "steel", "magnemite:30 magnemite:30 steelix:35"),
    G("mahogany-town", "Mahogany Town", "Pryce", "ice", "seel:27 dewgong:29 piloswine:31"),
    G("blackthorn-city", "Blackthorn City", "Clair", "dragon", "dragonair:37 dragonair:37 dragonair:37 kingdra:40"),
  ];
  const johtoE4 = [
    M("Will", "psychic", "xatu:40 jynx:41 exeggutor:41 slowbro:41 xatu:42"),
    M("Koga", "poison", "ariados:40 venomoth:41 forretress:43 muk:42 crobat:44"),
    M("Bruno", "fighting", "hitmontop:42 hitmonlee:42 hitmonchan:42 onix:43 machamp:46"),
    M("Karen", "dark", "umbreon:42 vileplume:42 murkrow:44 gengar:45 houndoom:47"),
  ];
  const lance = M("Lance", "dragon", "gyarados:44 dragonite:49 charizard:46 aerodactyl:46 dragonite:47 dragonite:50");
  const hoennGyms = [
    G("rustboro-city", "Rustboro City", "Roxanne", "rock", "geodude:14 nosepass:15"),
    G("dewford-town", "Dewford Town", "Brawly", "fighting", "machop:16 makuhita:18"),
    G("mauville-city", "Mauville City", "Wattson", "electric", "voltorb:20 electrike:20 magneton:22 manectric:24"),
    G("lavaridge-town", "Lavaridge Town", "Flannery", "fire", "numel:26 slugma:28 camerupt:29 torkoal:29"),
    G("petalburg-city", "Petalburg City", "Norman", "normal", "slaking:28 vigoroth:30 slaking:31"),
    G("fortree-city", "Fortree City", "Winona", "flying", "swellow:29 pelipper:30 skarmory:31 altaria:33"),
    G("mossdeep-city", "Mossdeep City", "Tate & Liza", "psychic", "claydol:41 xatu:41 lunatone:42 solrock:42"),
    G("sootopolis-city", "Sootopolis City", "Wallace", "water", "luvdisc:42 whiscash:42 sealeo:40 seaking:42 milotic:43"),
  ];
  const hoennE4 = [
    M("Sidney", "dark", "mightyena:46 shiftry:48 cacturne:46 crawdaunt:48 absol:49"),
    M("Phoebe", "ghost", "dusclops:48 banette:49 banette:49 sableye:50 dusclops:51"),
    M("Glacia", "ice", "glalie:50 sealeo:50 sealeo:52 glalie:52 walrein:53"),
    M("Drake", "dragon", "shelgon:52 altaria:54 flygon:53 flygon:53 salamence:55"),
  ];
  const sinnohGyms = [
    G("oreburgh-city", "Oreburgh City", "Roark", "rock", "geodude:12 onix:12 cranidos:14"),
    G("eterna-city", "Eterna City", "Gardenia", "grass", "cherubi:19 turtwig:19 roserade:22"),
    G("veilstone-city", "Veilstone City", "Maylene", "fighting", "meditite:27 machoke:27 lucario:30"),
    G("pastoria-city", "Pastoria City", "Crasher Wake", "water", "gyarados:33 quagsire:34 floatzel:37"),
    G("hearthome-city", "Hearthome City", "Fantina", "ghost", "drifblim:24 gengar:25 mismagius:26"),
    G("canalave-city", "Canalave City", "Byron", "steel", "bronzor:37 steelix:38 bastiodon:39"),
    G("snowpoint-city", "Snowpoint City", "Candice", "ice", "medicham:38 snover:38 sneasel:40 abomasnow:42"),
    G("sunyshore-city", "Sunyshore City", "Volkner", "electric", "jolteon:46 raichu:46 luxray:48 electivire:50"),
  ];
  const sinnohE4 = [
    M("Aaron", "bug", "dustox:53 beautifly:53 vespiquen:54 heracross:54 drapion:57"),
    M("Bertha", "ground", "whiscash:55 gliscor:56 hippowdon:55 golem:56 rhyperior:59"),
    M("Flint", "fire", "houndoom:52 flareon:55 rapidash:53 infernape:55 magmortar:57"),
    M("Lucian", "psychic", "mr-mime:53 espeon:55 bronzong:54 alakazam:56 gallade:59"),
  ];
  const cynthia = M("Cynthia", "dragon", "spiritomb:61 roserade:60 togekiss:60 lucario:63 milotic:63 garchomp:66");

  const B = {
    rb: {
      region: "kanto", gyms: kantoGyms, e4: kantoE4,
      champion: M("Blue", "mixed", "pidgeot:61 alakazam:59 rhydon:61 gyarados:61 exeggutor:61 blastoise:63"),
      champTip: {
        nl: "Blue past zijn laatste Pokémon aan op jouw starter: let op zijn starter-evolutie. Zijn Alakazam is gevaarlijk, dus gebruik Bug- of Ghost-aanvallen (let op: Ghost doet het in Red/Blue slecht tegen Psychic door een bug, Bug is beter). Neem veel Full Restores mee.",
        en: "Blue adapts his last Pokémon to your starter, so check his starter evolution. His Alakazam is dangerous; use strong physical hits (Bug works best in Red/Blue since Ghost is bugged). Bring plenty of Full Restores.",
      },
      note: { nl: "Teams en levels kunnen per versie en starter iets verschillen.", en: "Teams and levels may differ slightly per version and starter." },
    },
    yellow: {
      region: "kanto", gyms: kantoGyms, e4: kantoE4,
      champion: M("Blue", "mixed", "pidgeot:61 alakazam:59 rhydon:61 exeggutor:61 gyarados:61 vaporeon:63"),
      champTip: {
        nl: "In Yellow krijgt Blue een Eeveelution (Vaporeon, Jolteon of Flareon), afhankelijk van je rivaal-keuze. Verwacht Alakazam en Rhydon: Water/Grass/Ice-aanvallen doen veel schade.",
        en: "In Yellow Blue ends with an Eeveelution that depends on earlier events. Expect Alakazam and Rhydon: Water, Grass and Ice moves do a lot of damage.",
      },
      note: { nl: "In Yellow zijn de Gym-teams iets anders dan in Red/Blue; de levels zijn indicatief.", en: "Gym teams differ slightly in Yellow compared to Red/Blue; levels are indicative." },
    },
    gs: {
      region: "johto", gyms: johtoGyms, e4: johtoE4, champion: lance,
      champTip: {
        nl: "Lance gebruikt Dragon-types met veel Ice-zwakte. Neem Ice-aanvallen (Ice Beam) of Rock-aanvallen mee tegen Charizard en Aerodactyl. Zijn Dragonites zijn ook zwak voor Ice (4x).",
        en: "Lance uses Dragon-types that are weak to Ice. Bring Ice Beam, plus Rock moves for Charizard and Aerodactyl. His Dragonites take 4x damage from Ice.",
      },
      note: { nl: "Kanto-gyms komen na de Elite Four (zie Red/Blue).", en: "Kanto's gyms come after the Elite Four (see Red/Blue)." },
    },
    crystal: null, // gevuld hieronder
    rs: {
      region: "hoenn", gyms: hoennGyms, e4: hoennE4,
      champion: M("Steven Stone", "steel", "skarmory:57 claydol:55 aggron:56 cradily:56 armaldo:56 metagross:58"),
      champTip: {
        nl: "Steven gebruikt Steel/Ground/Rock. Vuur-, Water-, Grond- en Vecht-aanvallen werken uitstekend. Zijn Metagross sluit af; die is ook zwak voor Fire en Ground.",
        en: "Steven uses Steel/Ground/Rock. Fire, Water, Ground and Fighting moves work great. His Metagross is the closer and is weak to Fire and Ground.",
      },
    },
    emerald: {
      region: "hoenn", e4: hoennE4,
      gyms: [
        G("rustboro-city", "Rustboro City", "Roxanne", "rock", "geodude:14 geodude:14 nosepass:15"),
        G("dewford-town", "Dewford Town", "Brawly", "fighting", "machop:16 meditite:16 makuhita:19"),
        G("mauville-city", "Mauville City", "Wattson", "electric", "voltorb:20 electrike:20 magneton:22 manectric:24"),
        G("lavaridge-town", "Lavaridge Town", "Flannery", "fire", "numel:24 slugma:24 camerupt:26 torkoal:29"),
        G("petalburg-city", "Petalburg City", "Norman", "normal", "spinda:27 vigoroth:27 linoone:29 slaking:31"),
        G("fortree-city", "Fortree City", "Winona", "flying", "swablu:29 tropius:29 pelipper:30 skarmory:31 altaria:33"),
        G("mossdeep-city", "Mossdeep City", "Tate & Liza", "psychic", "claydol:41 xatu:41 lunatone:42 solrock:42"),
        G("sootopolis-city", "Sootopolis City", "Juan", "water", "luvdisc:41 whiscash:41 sealeo:43 crawdaunt:43 kingdra:46"),
      ],
      champion: M("Wallace", "water", "wailord:57 tentacruel:55 ludicolo:56 whiscash:56 gyarados:56 milotic:58"),
      champTip: {
        nl: "Wallace speelt met Water-types. Gras- en Elektrisch-aanvallen doen veel schade; Milotic sluit af en heeft Recover, dus pak hem snel.",
        en: "Wallace relies on Water-types. Grass and Electric moves hit hard; Milotic closes with Recover, so take it down fast.",
      },
    },
    frlg: {
      region: "kanto", gyms: kantoGyms,
      e4: [
        M("Lorelei", "ice", "dewgong:54 cloyster:53 slowbro:52 jynx:54 lapras:56"),
        M("Bruno", "fighting", "onix:53 hitmonchan:55 hitmonlee:55 onix:56 machamp:58"),
        M("Agatha", "ghost", "gengar:54 golbat:54 haunter:53 arbok:56 gengar:58"),
        M("Lance", "dragon", "gyarados:56 dragonair:54 dragonair:54 aerodactyl:58 dragonite:60"),
      ],
      champion: M("Blue", "mixed", "pidgeot:59 alakazam:57 rhydon:59 gyarados:59 exeggutor:61 blastoise:63"),
      champTip: {
        nl: "Het laatste team-lid is de evolutie van de starter die sterk is tegen die van jou. Alakazam is snel en breekbaar: sla eerst met Bug/Ghost/Dark of een sterke fysieke aanval.",
        en: "His last Pokémon is the evolved starter that counters yours. Alakazam is fast and fragile: hit it first with Bug, Ghost, Dark or a strong physical move.",
      },
    },
    dp: {
      region: "sinnoh", gyms: sinnohGyms, e4: sinnohE4, champion: cynthia,
      champTip: {
        nl: "Cynthia's Garchomp is het gevaarlijkst (Ice 4x). Spiritomb heeft geen zwaktes behalve Fairy (niet in deze game). Neem Ice-aanvallen mee, bijv. via Glaceon of Mamoswine, en Levellen op ~65.",
        en: "Cynthia's Garchomp is the most dangerous (4x weak to Ice). Spiritomb has no weaknesses in this generation. Bring Ice moves, e.g. Mamoswine or Glaceon, and be around level 65.",
      },
    },
    platinum: {
      region: "sinnoh",
      gyms: [
        G("oreburgh-city", "Oreburgh City", "Roark", "rock", "geodude:12 onix:12 cranidos:14"),
        G("eterna-city", "Eterna City", "Gardenia", "grass", "turtwig:20 cherubi:20 roserade:22"),
        G("veilstone-city", "Veilstone City", "Maylene", "fighting", "meditite:29 machoke:28 lucario:32"),
        G("pastoria-city", "Pastoria City", "Crasher Wake", "water", "gyarados:33 quagsire:34 floatzel:37"),
        G("hearthome-city", "Hearthome City", "Fantina", "ghost", "drifblim:32 gengar:34 mismagius:36"),
        G("canalave-city", "Canalave City", "Byron", "steel", "bronzor:36 steelix:36 bastiodon:39"),
        G("snowpoint-city", "Snowpoint City", "Candice", "ice", "snover:38 sneasel:38 medicham:40 abomasnow:42"),
        G("sunyshore-city", "Sunyshore City", "Volkner", "electric", "raichu:46 ambipom:47 octillery:46 luxray:49"),
      ],
      e4: [
        M("Aaron", "bug", "yanmega:49 scizor:49 vespiquen:50 heracross:51 drapion:53"),
        M("Bertha", "ground", "sudowoodo:48 golem:49 whiscash:50 hippowdon:52 rhyperior:55"),
        M("Flint", "fire", "houndoom:52 flareon:50 rapidash:53 infernape:55 magmortar:57"),
        M("Lucian", "psychic", "mr-mime:49 espeon:50 bronzong:52 alakazam:53 gallade:55"),
      ],
      champion: M("Cynthia", "dragon", "spiritomb:58 roserade:58 togekiss:60 lucario:60 milotic:58 garchomp:62"),
      champTip: {
        nl: "Garchomp is zwak voor Ice (4x) en Dragon. Houd een snelle Ice-aanvaller klaar en hou Revives bij de hand: Cynthia heeft zes sterke Pokémon.",
        en: "Garchomp is 4x weak to Ice and weak to Dragon. Keep a fast Ice attacker ready and carry Revives: Cynthia has six strong Pokémon.",
      },
    },
    hgss: {
      region: "johto", gyms: johtoGyms, e4: johtoE4, champion: lance,
      champTip: {
        nl: "Lance's Dragonites en Gyarados zijn zwak voor Ice en Rock. Zorg voor een Rock/Ice-aanval en neem Full Restores mee. Daarna wacht Red op Mt. Silver.",
        en: "Lance's Dragonites and Gyarados are weak to Ice and Rock. Bring a Rock or Ice move and Full Restores. Red awaits afterwards on Mt. Silver.",
      },
      note: { nl: "Na de League kun je naar Kanto; Red wacht op Mt. Silver met Pikachu op level 88.", en: "After the League you can go to Kanto; Red waits on Mt. Silver with Pikachu at level 88." },
    },
    bw: {
      region: "unova",
      gyms: [
        G("striaton-city", "Striaton City", "Cilan / Chili / Cress", "grass", "lillipup:12 pansage:14"),
        G("nacrene-city", "Nacrene City", "Lenora", "normal", "herdier:18 watchog:20"),
        G("castelia-city", "Castelia City", "Burgh", "bug", "whirlipede:21 dwebble:21 leavanny:23"),
        G("nimbasa-city", "Nimbasa City", "Elesa", "electric", "emolga:25 emolga:25 zebstrika:27"),
        G("driftveil-city", "Driftveil City", "Clay", "ground", "krokorok:29 palpitoad:29 excadrill:31"),
        G("mistralton-city", "Mistralton City", "Skyla", "flying", "swoobat:33 swanna:33 swanna:35"),
        G("icirrus-city", "Icirrus City", "Brycen", "ice", "vanillish:37 cryogonal:37 beartic:39"),
        G("opelucid-city", "Opelucid City", "Drayden", "dragon", "fraxure:41 druddigon:41 haxorus:43"),
      ],
      e4: [
        M("Shauntal", "ghost", "cofagrigus:48 jellicent:48 golurk:48 chandelure:50"),
        M("Grimsley", "dark", "scrafty:48 krookodile:48 liepard:48 bisharp:50"),
        M("Caitlin", "psychic", "musharna:48 sigilyph:48 gothitelle:48 reuniclus:50"),
        M("Marshal", "fighting", "throh:48 sawk:48 conkeldurr:48 mienshao:50"),
      ],
      champion: M("N", "mixed", "zoroark:48 carracosta:49 archeops:49 vanilluxe:50 klinklang:50 reshiram:52"),
      champTip: {
        nl: "N gebruikt de legendarische draak (Reshiram in Black / Zekrom in White): Ground, Rock of Dragon is sterk tegen Reshiram; Ground, Ice of Dragon tegen Zekrom. Daarna volgt nog Ghetsis, dus bewaar Revives.",
        en: "N uses the legendary dragon (Reshiram in Black / Zekrom in White): Ground, Rock or Dragon works on Reshiram; Ground, Ice or Dragon on Zekrom. Ghetsis follows, so save your Revives.",
      },
    },
    bw2: {
      region: "unova",
      gyms: [
        G("aspertia-city", "Aspertia City", "Cheren", "normal"),
        G("virbank-city", "Virbank City", "Roxie", "poison", "koffing:22 whirlipede:22"),
        G("castelia-city", "Castelia City", "Burgh", "bug"),
        G("nimbasa-city", "Nimbasa City", "Elesa", "electric"),
        G("driftveil-city", "Driftveil City", "Clay", "ground"),
        G("mistralton-city", "Mistralton City", "Skyla", "flying"),
        G("opelucid-city", "Opelucid City", "Drayden", "dragon"),
        G("humilau-city", "Humilau City", "Marlon", "water"),
      ],
      e4: [
        M("Shauntal", "ghost", "cofagrigus:56 jellicent:56 golurk:56 chandelure:58"),
        M("Grimsley", "dark", "scrafty:56 krookodile:56 liepard:56 bisharp:58"),
        M("Caitlin", "psychic", "musharna:56 sigilyph:56 gothitelle:56 reuniclus:58"),
        M("Marshal", "fighting", "throh:56 sawk:56 conkeldurr:56 mienshao:58"),
      ],
      champion: M("Iris", "dragon", "hydreigon:57 archeops:57 aggron:57 lapras:57 druddigon:57 haxorus:59"),
      champTip: {
        nl: "Iris gebruikt vooral Dragon-types: Ice (Lapras/Weavile) en Fairy ontbreken, maar Ice Beam/Ice Shard werken geweldig tegen Haxorus en Hydreigon. Haar Aggron is zwak voor Fighting en Ground.",
        en: "Iris relies on Dragon-types. Ice Beam/Ice Shard destroys Haxorus and Druddigon, and Fighting works on Hydreigon and Aggron.",
      },
      note: { nl: "Van de Gym-teams in Black 2/White 2 zijn alleen enkele teams opgenomen.", en: "Only some Gym teams from Black 2/White 2 are listed." },
    },
    xy: {
      region: "kalos",
      gyms: [
        G("santalune-city", "Santalune City", "Viola", "bug", "surskit:10 vivillon:12"),
        G("cyllage-city", "Cyllage City", "Grant", "rock", "amaura:25 tyrunt:25"),
        G("shalour-city", "Shalour City", "Korrina", "fighting", "mienfoo:29 machoke:28 hawlucha:32"),
        G("coumarine-city", "Coumarine City", "Ramos", "grass", "jumpluff:30 weepinbell:31 gogoat:34"),
        G("lumiose-city", "Lumiose City", "Clemont", "electric", "emolga:35 magneton:35 heliolisk:37"),
        G("laverre-city", "Laverre City", "Valerie", "fairy", "mawile:38 mr-mime:39 sylveon:42"),
        G("anistar-city", "Anistar City", "Olympia", "psychic", "sigilyph:44 slowking:45 meowstic:48"),
        G("snowbelle-city", "Snowbelle City", "Wulfric", "ice", "abomasnow:56 cryogonal:55 avalugg:59"),
      ],
      e4: [
        M("Malva", "fire", "pyroar:63 torkoal:63 chandelure:63 talonflame:65"),
        M("Siebold", "water", "clawitzer:63 gyarados:63 starmie:63 barbaracle:65"),
        M("Wikstrom", "steel", "klefki:63 probopass:63 scizor:63 aegislash:65"),
        M("Drasna", "dragon", "dragalge:63 altaria:63 druddigon:63 noivern:65"),
      ],
      champion: M("Diantha", "fairy", "hawlucha:64 tyrantrum:65 aurorus:65 gourgeist:65 goodra:66 gardevoir:68"),
      champTip: {
        nl: "Diantha's Mega Gardevoir (Psychic/Fairy) is zwak voor Steel en Poison; Goodra is zwak voor Ice/Fairy/Dragon. Gourgeist is zwak voor Ghost en Dark. Neem Full Restores mee.",
        en: "Diantha's Mega Gardevoir (Psychic/Fairy) is weak to Steel and Poison; Goodra to Ice, Fairy and Dragon; Gourgeist to Ghost and Dark. Bring Full Restores.",
      },
    },
    oras: null,
    sm: {
      region: "alola",
      gyms: [
        G("melemele-island", "Melemele Island", "Kahuna Hala", "fighting", "mankey:16 makuhita:16 crabrawler:17"),
        G("akala-island", "Akala Island", "Kahuna Olivia", "rock", "nosepass:26 boldore:26 lycanroc:27"),
        G("ulaula-island", "Ula'ula Island", "Kahuna Nanu", "dark", "krokorok:43 persian:43"),
        G("poni-island", "Poni Island", "Kahuna Hapu", "ground", "gastrodon:47 flygon:47 mudsdale:49"),
      ],
      e4: [
        M("Hala", "fighting", "hariyama:54 primeape:54 bewear:55 poliwrath:54 crabominable:55"),
        M("Olivia", "rock", "relicanth:54 carbink:54 golem:54 probopass:54 lycanroc:55"),
        M("Acerola", "ghost", "sableye:54 drifblim:54 dhelmise:54 froslass:54 palossand:55"),
        M("Kahili", "flying", "skarmory:54 crobat:54 oricorio:54 mandibuzz:54 toucannon:55"),
      ],
      champion: M("Professor Kukui", "mixed", "lycanroc:57 braviary:56 magnezone:56 snorlax:56 ninetales:56 incineroar:58"),
      champTip: {
        nl: "De laatste Pokémon van Kukui hangt af van jouw starter. Ninetales (Alola) is Ice/Fairy: Steel en Fire doen veel schade. Lycanroc is Rock: Water, Grass, Fighting, Steel en Ground.",
        en: "Kukui's final Pokémon depends on your starter. Alolan Ninetales is Ice/Fairy: Steel and Fire do major damage. Lycanroc is Rock: Water, Grass, Fighting, Steel and Ground work.",
      },
      note: { nl: "Alola heeft geen Gyms maar Kahuna's en eilandproeven. Dit zijn de vier Kahuna's.", en: "Alola has no Gyms but Kahunas and island trials. These are the four Kahunas." },
    },
    usum: null,
    lgpe: null,
    swsh: {
      region: "galar",
      gyms: [
        G("turffield", "Turffield", "Milo", "grass", "gossifleur:19 eldegoss:20"),
        G("hulbury", "Hulbury", "Nessa", "water", "goldeen:22 arrokuda:23 drednaw:24"),
        G("motostoke", "Motostoke", "Kabu", "fire", "ninetales:25 arcanine:25 centiskorch:27"),
        G("stow-on-side", "Stow-on-Side", "Bea / Allister", "fighting", "hitmontop:34 pangoro:34 sirfetchd:35 machamp:36"),
        G("ballonlea", "Ballonlea", "Opal", "fairy", "weezing:36 mawile:38 togekiss:37 alcremie:38"),
        G("circhester", "Circhester", "Gordie / Melony", "rock", "barbaracle:40 shuckle:40 stonjourner:41 coalossal:42"),
        G("spikemuth", "Spikemuth", "Piers", "dark", "scrafty:44 malamar:45 skuntank:45 obstagoon:46"),
        G("hammerlocke", "Hammerlocke", "Raihan", "dragon", "gigalith:46 flygon:47 sandaconda:46 duraludon:48"),
      ],
      e4: [],
      champion: M("Leon", "mixed", "aegislash:62 dragapult:62 haxorus:63 seismitoad:64 mr-rime:64 charizard:65"),
      champTip: {
        nl: "Leon's Charizard is Gigantamax: gebruik Rock-aanvallen (4x) of Water/Electric. Dragapult en Haxorus zijn zwak voor Ice en Fairy, Aegislash voor Ghost/Dark/Fire. Neem Max Revives mee.",
        en: "Leon's Charizard is Gigantamax: use Rock moves (4x), Water or Electric. Dragapult and Haxorus are weak to Ice and Fairy; Aegislash to Ghost, Dark and Fire. Bring Max Revives.",
      },
      note: { nl: "Galar heeft geen Elite Four: je speelt de Champion Cup en verslaat Leon als kampioen.", en: "Galar has no Elite Four: you play the Champion Cup and beat Leon as champion." },
    },
    pla: {
      region: "hisui", gyms: [], e4: [], champion: null,
      note: { nl: "Legends: Arceus heeft geen Gyms of Elite Four. In plaats daarvan versla je Noble Pokémon: Kleavor, Lilligant, Arcanine, Electrode en Avalugg. Daarna volgt Dialga/Palkia en Arceus.", en: "Legends: Arceus has no Gyms or Elite Four. Instead you defeat Noble Pokémon: Kleavor, Lilligant, Arcanine, Electrode and Avalugg. Dialga/Palkia and Arceus follow." },
    },
    sv: {
      region: "paldea",
      gyms: [
        G("cortondo", "Cortondo", "Katy", "bug", "nymble:14 tarountula:14 teddiursa:15"),
        G("artazon", "Artazon", "Brassius", "grass", "petilil:16 smoliv:16 sudowoodo:17"),
        G("levincia", "Levincia", "Iono", "electric", "wattrel:23 bellibolt:23 luxio:23 mismagius:24"),
        G("cascarrafa", "Cascarrafa", "Kofu", "water", "veluza:29 wugtrio:29 crabominable:30"),
        G("medali", "Medali", "Larry", "normal", "komala:35 dudunsparce:35 staraptor:36"),
        G("montenevera", "Montenevera", "Ryme", "ghost", "toxtricity:41 sinistcha:41 mimikyu:41 houndstone:42"),
        G("alfornada", "Alfornada", "Tulip", "psychic", "farigiraf:44 gardevoir:44 espathra:44 florges:45"),
        G("glaseado-mountain", "Glaseado Mountain", "Grusha", "ice", "frosmoth:47 beartic:47 cetitan:47 altaria:48"),
      ],
      e4: [
        M("Rika", "ground", "whiscash:57 camerupt:57 donphan:57 dugtrio:57 clodsire:58"),
        M("Poppy", "steel", "copperajah:58 magnezone:58 bronzong:58 corviknight:58 tinkaton:59"),
        M("Larry", "flying", "flamigo:59 tropius:59 oricorio:59 altaria:59 staraptor:60"),
        M("Hassel", "dragon", "noivern:60 dragalge:60 flapple:60 haxorus:60 baxcalibur:61"),
      ],
      champion: M("Geeta", "mixed", "espathra:61 gogoat:61 veluza:61 avalugg:61 kingambit:61 glimmora:62"),
      champTip: {
        nl: "Geeta's Glimmora is Rock/Poison: Ground en Psychic werken goed. Kingambit (Dark/Steel) is zwak voor Fighting en Fire (4x Fighting). Espathra is Psychic: gebruik Dark, Bug, Ghost.",
        en: "Geeta's Glimmora is Rock/Poison: Ground and Psychic work well. Kingambit (Dark/Steel) is 4x weak to Fighting. Espathra is Psychic: use Dark, Bug or Ghost.",
      },
      note: { nl: "Na de Elite Four wacht Nemona als eindbaas van de Champion-test (Terastal Pokémon).", en: "After the Elite Four, Nemona awaits as the final Champion test (Terastal Pokémon)." },
    },
    plza: {
      region: "kalos", gyms: [], e4: [], champion: null,
      note: { nl: "Legends: Z-A werkt met Z-A Royale-rangen in Lumiose City in plaats van Gyms en Elite Four.", en: "Legends: Z-A uses Z-A Royale ranks in Lumiose City instead of Gyms and an Elite Four." },
    },
    bdsp: null,
  };
  B.crystal = { ...B.gs, note: { nl: "Teams zijn vrijwel gelijk aan Gold/Silver; Crystal heeft wat andere levels.", en: "Teams are nearly identical to Gold/Silver; Crystal has slightly different levels." } };
  B.oras = { ...B.rs, region: "hoenn", note: { nl: "In Omega Ruby/Alpha Sapphire zijn de teams grotendeels gelijk aan Ruby/Sapphire; Steven en Mega-evoluties komen in het Delta-verhaal.", en: "Teams are largely the same as Ruby/Sapphire; Steven and Mega evolutions appear in the Delta Episode." } };
  B.usum = { ...B.sm, note: { nl: "Gelijkaardig aan Sun/Moon; in Ultra Sun/Moon zijn extra trainers en de Totem-teams anders.", en: "Similar to Sun/Moon; Ultra Sun/Moon adds trainers and different Totem battles." } };
  B.lgpe = { ...B.rb, note: { nl: "In Let's Go zijn de Gym-teams hetzelfde als in Red/Blue/Yellow, met Mega-evoluties bij Blue en de Master Trainers na het verhaal.", en: "Gym teams match Red/Blue/Yellow; Blue has Mega Evolution, and Master Trainers appear post-game." } };
  B.bdsp = { ...B.dp, note: { nl: "Brilliant Diamond/Shining Pearl volgt Diamond/Pearl met hogere levels op sommige trainers.", en: "BDSP follows Diamond/Pearl with somewhat higher levels on some trainers." } };
  return B;
})();
