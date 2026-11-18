// Stap-voor-stap uitleg om geheimen te ontgrendelen. [NL, EN] per titel en stap.
(() => {
  const K = [
    {
      t: ["Mewtwo vangen in Cerulean Cave", "Catching Mewtwo in Cerulean Cave"],
      s: [
        ["Verslaat de Elite Four en de kampioen en laat je team in de Hall of Fame vastleggen.", "Beat the Elite Four and the champion and enter the Hall of Fame."],
        ["Ga naar Cerulean City. De ingang van Cerulean Cave ligt bij het water bij de stad en is alleen met Surf te bereiken.", "Go to Cerulean City. The entrance to Cerulean Cave sits by the water near the city and can only be reached with Surf."],
        ["Neem je sterkste team mee: in de grot zitten wilde Pokémon van level 50 tot 70, dus veel Hyper Potions en Full Heals.", "Bring your strongest team: wild Pokémon in the cave are level 50-70, so pack Hyper Potions and Full Heals."],
        ["Loop naar de laagste verdieping. Daar wacht Mewtwo (level 70). Verzwak hem, zet hem in slaap of verlamming en gooi Ultra Balls. Sla eerst op!", "Head to the lowest floor, where Mewtwo (level 70) waits. Weaken it, use sleep or paralysis and throw Ultra Balls. Save first!"],
      ],
    },
    {
      t: ["De drie legendarische vogels", "The three legendary birds"],
      s: [
        ["<b>Articuno</b>: Seafoam Islands. Gebruik Strength om de stenen in de stromingen te duwen, zodat je naar de diepste verdieping kunt (level 50).", "<b>Articuno</b>: Seafoam Islands. Use Strength to push the boulders into the currents so you can reach the deepest floor (level 50)."],
        ["<b>Zapdos</b>: Power Plant. Surf vanaf Route 10 (bij de Rock Tunnel) naar de centrale en loop naar het einde van het gebouw (level 50).", "<b>Zapdos</b>: Power Plant. Surf from Route 10 (by Rock Tunnel) to the plant and walk to the far end of the building (level 50)."],
        ["<b>Moltres</b>: in Red/Blue/Yellow op Victory Road, in FireRed/LeafGreen op Mt. Ember (Sevii Islands).", "<b>Moltres</b>: in Red/Blue/Yellow on Victory Road, in FireRed/LeafGreen on Mt. Ember (Sevii Islands)."],
        ["Alle drie zijn Level 50 en maar één keer te vangen. Sla vooraf op en neem Ultra Balls mee.", "All three are level 50 and can only be caught once. Save beforehand and bring Ultra Balls."],
      ],
    },
    {
      t: ["Snorlax wakker maken (Poké Flute)", "Waking Snorlax (Poké Flute)"],
      s: [
        ["Ga naar de Rocket Hideout onder de Game Corner in Celadon City en versla Team Rocket om de Silph Scope te krijgen.", "Go to the Rocket Hideout under the Celadon Game Corner and defeat Team Rocket to get the Silph Scope."],
        ["Reis naar Pokémon Tower in Lavender Town. Met de Silph Scope kun je de Marowak-geest zien en verslaan.", "Travel to Pokémon Tower in Lavender Town. With the Silph Scope you can see and defeat the Marowak ghost."],
        ["Boven redt je Mr. Fuji. Hij geeft je de Poké Flute.", "At the top you rescue Mr. Fuji, who gives you the Poké Flute."],
        ["Gebruik de Poké Flute in je tas voor Snorlax op Route 12 of 16 en win het gevecht om te passeren of hem te vangen.", "Use the Poké Flute from your bag in front of Snorlax on Route 12 or 16 and win the battle to pass or catch it."],
      ],
    },
    {
      t: ["Fossielen en Safari Zone", "Fossils and the Safari Zone"],
      s: [
        ["Kies in Mt. Moon een van de twee fossielen: Helix Fossil (Omanyte) of Dome Fossil (Kabuto).", "In Mt. Moon pick one of the two fossils: Helix Fossil (Omanyte) or Dome Fossil (Kabuto)."],
        ["Breng het fossiel naar het laboratorium op Cinnabar Island om het te laten herleven.", "Take the fossil to the lab on Cinnabar Island to be revived."],
        ["Voor Old Amber (Aerodactyl) ga je naar het museum in Pewter City. Je hebt Cut nodig.", "For Old Amber (Aerodactyl) visit the museum in Pewter City. You need Cut."],
        ["In de Safari Zone in Fuchsia City betaal je entree voor een beperkt aantal stappen. Zoek de Gold Teeth en geef ze aan de Warden voor Strength; in het geheime huis vind je Surf.", "In the Safari Zone in Fuchsia City you pay an entry fee for a limited number of steps. Find the Gold Teeth and give them to the Warden for Strength; the secret house holds Surf."],
      ],
    },
  ];

  const J = [
    {
      t: ["Red verslaan op Mt. Silver", "Beating Red on Mt. Silver"],
      s: [
        ["Haal alle 8 badges van Johto en versla de Elite Four en Lance.", "Collect all 8 Johto badges and beat the Elite Four and Lance."],
        ["Reis naar Kanto en haal ook alle 8 badges daar.", "Travel to Kanto and collect all 8 badges there too."],
        ["Ga vanaf Indigo Plateau via Route 28 naar Mt. Silver. Neem veel items mee: de grot zit vol sterke wilde Pokémon.", "From Indigo Plateau head through Route 28 to Mt. Silver. Bring plenty of items: the cave is full of strong wild Pokémon."],
        ["Klim naar de top. Red heeft Pikachu, Espeon, Snorlax, Venusaur, Charizard en Blastoise. Train je team voor het gevecht op ongeveer level 80+.", "Climb to the summit. Red uses Pikachu, Espeon, Snorlax, Venusaur, Charizard and Blastoise. Train your team to about level 80+ first."],
      ],
    },
    {
      t: ["De Legendary Beasts vinden", "Finding the Legendary Beasts"],
      s: [
        ["Ga in Ecruteak City naar de Burned Tower en kom in de kelder terecht, waar de drie Beasts verschijnen.", "In Ecruteak City enter the Burned Tower and fall into the basement, where the three Beasts appear."],
        ["Raikou en Entei vluchten en zwerven door Johto. Gebruik de Pokégear/radio of de Pokédex om te zien waar ze zijn.", "Raikou and Entei flee and roam Johto. Use the Pokégear/radio or the Pokédex to see where they are."],
        ["Verzwak ze. Gebruik Mean Look of Block-aanvallen om vluchten te voorkomen, en een Ultra Ball.", "Weaken them. Use Mean Look or other trapping moves to prevent fleeing, plus an Ultra Ball."],
        ["Suicune vang je later via zijn eigen verhaallijn (in Crystal bij Tin Tower, in HeartGold/SoulSilver in Cianwood en Tin Tower).", "Suicune comes later through its own storyline (in Crystal at Tin Tower, in HeartGold/SoulSilver around Cianwood and Tin Tower)."],
      ],
    },
    {
      t: ["Bug-Catching Contest", "Bug-Catching Contest"],
      s: [
        ["Ga op dinsdag, donderdag of zaterdag naar het National Park.", "Go to the National Park on a Tuesday, Thursday or Saturday."],
        ["Praat met de man bij de ingang en doe mee. Je krijgt een aantal Park Balls en een tijdslimiet.", "Talk to the man at the entrance and enter. You get a set of Park Balls and a time limit."],
        ["Vang één Pokémon die zo sterk mogelijk is: een hoog level en veel HP geeft meer punten.", "Catch a single Pokémon that is as strong as possible: a high level and good HP earns more points."],
        ["Win je de wedstrijd? Dan krijg je een Sun Stone als eerste prijs.", "If you win the contest you receive a Sun Stone as first prize."],
      ],
    },
  ];

  const H = [
    {
      t: ["Secret Base maken", "Making a Secret Base"],
      s: [
        ["Vind een boom, rots of grotwand met een lege opening, bijvoorbeeld op Route 111.", "Find a tree, rock or cave wall with an opening, for example on Route 111."],
        ["Gebruik de aanval <b>Secret Power</b> op die plek. Die leer je van een Move Tutor of TM.", "Use <b>Secret Power</b> on that spot. You learn it from a TM or Move Tutor."],
        ["Je krijgt een eigen basis die je mag inrichten met items van de Decoratie-winkel.", "You get your own base that you can decorate with items from the decoration shops."],
        ["Via ruilen of verbindingen kun je je basis delen met vrienden.", "Through trading or connectivity you can share your base with friends."],
      ],
    },
    {
      t: ["Regirock, Regice en Registeel", "Regirock, Regice and Registeel"],
      s: [
        ["Haal Dive en ga naar Route 134 om in het Sealed Chamber de Braille te lezen.", "Get Dive and go to Route 134 to read the Braille in the Sealed Chamber."],
        ["Volg daarna de aanwijzingen in de drie bijbehorende kamers: Desert Ruins (Route 111), Island Cave (Route 105) en Ancient Tomb (Route 120).", "Then follow the clues in the three chambers: Desert Ruins (Route 111), Island Cave (Route 105) and Ancient Tomb (Route 120)."],
        ["Elke Regi staat als vaste Pokémon op level 40; sla vooraf op en neem Ultra Balls mee.", "Each Regi is a fixed level 40 Pokémon; save beforehand and bring Ultra Balls."],
      ],
    },
    {
      t: ["Rayquaza op Sky Pillar", "Rayquaza at Sky Pillar"],
      s: [
        ["Rond het hoofdverhaal met Groudon en Kyogre af.", "Finish the main story with Groudon and Kyogre."],
        ["Ga naar Route 131 bij Pacifidlog Town naar Sky Pillar. Je hebt Surf en de Mach Bike nodig voor de gebarsten vloeren.", "Go to Route 131 near Pacifidlog Town to Sky Pillar. You need Surf and the Mach Bike for the cracked floors."],
        ["Klim helemaal naar de top. Rayquaza (level 70) wacht daar op je.", "Climb all the way up. Rayquaza (level 70) is waiting at the top."],
      ],
    },
  ];

  const S = [
    {
      t: ["Honey Trees voor Munchlax", "Honey Trees for Munchlax"],
      s: [
        ["Koop Honey bij de Honey Shop in Floaroma Town.", "Buy Honey at the Honey shop in Floaroma Town."],
        ["Smeer honing op een Honey Tree (bomen met een zoet gelaagde stam) in de routes van Sinnoh.", "Slather Honey on a Honey Tree (trees with a shiny honey patch) on Sinnoh routes."],
        ["Wacht ongeveer 6 uur (echte tijd) en keer terug. Dan zit er een Pokémon, zoals Munchlax, Combee of Aipom.", "Wait about 6 hours (real time) and return. A Pokémon such as Munchlax, Combee or Aipom will be there."],
        ["Munchlax verschijnt alleen op bepaalde Honey Trees; vergelijk bomen en probeer ze allemaal.", "Munchlax only appears on certain Honey Trees; compare trees and try them all."],
      ],
    },
    {
      t: ["Uxie, Mesprit en Azelf", "Uxie, Mesprit and Azelf"],
      s: [
        ["Volg het verhaal van Team Galactic tot je de drie meren bezoekt: Verity, Valor en Acuity.", "Follow the Team Galactic story until you visit the three lakes: Verity, Valor and Acuity."],
        ["Uxie zit in de grot bij Lake Acuity, Azelf in de grot bij Lake Valor. Beide zijn vaste Pokémon.", "Uxie is in the cave at Lake Acuity and Azelf in the cave at Lake Valor. Both are fixed encounters."],
        ["Mesprit zwerft rond. Zoek hem op en gebruik Mean Look of een Ultra Ball om te voorkomen dat hij vlucht.", "Mesprit roams. Track it down and use Mean Look or an Ultra Ball to stop it fleeing."],
      ],
    },
  ];

  const A = [
    {
      t: ["Mega Ring en Mega-evolutie", "Mega Ring and Mega Evolution"],
      s: [
        ["Haal de Mega Ring van Korrina in Shalour City. Hij hoort bij de Mega-evolutie-opdracht.", "Get the Mega Ring from Korrina in Shalour City. It comes with the Mega Evolution tutorial."],
        ["Je krijgt Lucarionite voor Mega Lucario. Zoek verder Mega Stones in grotten, via Gym-opdrachten en in winkels.", "You receive Lucarionite for Mega Lucario. Look for more Mega Stones in caves, via Gym tasks and in shops."],
        ["Geef de Mega Stone aan de Pokémon en kies tijdens het gevecht voor Mega-evolutie. Dit kan één keer per gevecht.", "Give the Mega Stone to the Pokémon and choose Mega Evolution during battle. You can do this once per battle."],
      ],
    },
  ];

  const P = [
    {
      t: ["De vier Ruinous Pokémon", "The four Ruinous Pokémon"],
      s: [
        ["Praat met de kinderen en lees de aanwijzingen in Paldea: de Treasures of Ruin-opdracht.", "Talk to the kids and follow the clues in Paldea: the Treasures of Ruin quest."],
        ["Zoek bij elke Pokémon acht gele stakes en trek ze uit de grond. In totaal zijn dat 32 stakes.", "For each Pokémon find eight yellow stakes and pull them from the ground, 32 stakes in total."],
        ["Pas als alle acht stakes weg zijn, kun je tegen Wo-Chien, Chien-Pao, Ting-Lu of Chi-Yu vechten (level 45).", "Only when all eight stakes are gone can you fight Wo-Chien, Chien-Pao, Ting-Lu or Chi-Yu (level 45)."],
      ],
    },
    {
      t: ["Path of Legends: de Titans", "Path of Legends: the Titans"],
      s: [
        ["Start de storyline Path of Legends en praat met Arven.", "Start the Path of Legends storyline and talk to Arven."],
        ["Versla de vijf Herba Mystica-bazen (Titan Pokémon): in elk gebied wacht een grote tegenstander.", "Defeat the five Herba Mystica Titan Pokémon: each area has a large opponent."],
        ["Na elke Titan leert je rijdier (Koraidon of Miraidon) een nieuwe vaardigheid, zoals zweven en klimmen.", "After each Titan your ride (Koraidon or Miraidon) learns a new ability, such as gliding and climbing."],
      ],
    },
  ];

  const U = [
    {
      t: ["Z-Ring en Z-Crystals", "Z-Ring and Z-Crystals"],
      s: [
        ["Begin de Island Challenge op Melemele Island.", "Start the Island Challenge on Melemele Island."],
        ["Kahuna Hala geeft je de Z-Ring nadat je de eerste proef afrondt.", "Kahuna Hala gives you the Z-Ring after you complete the first trial."],
        ["Verdien meer Z-Crystals door Island Trials te voltooien en Totem Pokémon te verslaan. Geef de Z-Crystal aan je Pokémon met een passende aanval.", "Earn more Z-Crystals by completing Island Trials and beating Totem Pokémon. Give the Z-Crystal to a Pokémon with a matching move."],
      ],
    },
  ];

  const MAP = {
    rb: K, yellow: K, frlg: K, lgpe: K,
    gs: J, crystal: J, hgss: J,
    rs: H, emerald: H, oras: H,
    dp: S, platinum: S, bdsp: S,
    xy: A, sm: U, usum: U, sv: P,
  };
  window.SECRET_GUIDES = MAP;
})();
