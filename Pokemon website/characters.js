// Bekende verhaalpersonages uit de hoofdgames, met voorbeeldteams.
(() => {
  const $ = (id) => document.getElementById(id);
  const text = (nl, en) => Array.isArray(nl) ? I18N.L(nl[0], nl[1]) : I18N.L(nl, en);

  const CHARACTERS = [
    { gen: 1, region: "Kanto", name: "Red", role: ["Stille held", "Silent hero"], games: ["Red, Blue, Yellow, Gold, Silver, Crystal", "Red, Blue, Yellow, Gold, Silver, Crystal"], story: ["Red begint als beginnende trainer in Pallet Town en groeit uit tot de kampioen van Kanto. In Gold, Silver en Crystal trekt hij zich terug op Mt. Silver, waar hij als stille einduitdaging wacht.", "Red starts as a young trainer in Pallet Town and becomes Kanto's champion. In Gold, Silver, and Crystal, he retreats to Mt. Silver, where he waits as a quiet final challenge."], team: [["Pikachu",25],["Charizard",6],["Snorlax",143],["Venusaur",3]], color: "#e63950" },
    { gen: 1, region: "Kanto", name: "Blue", role: ["Rivaal en kampioen", "Rival and champion"], games: ["Red, Blue, Yellow en remakes", "Red, Blue, Yellow, and remakes"], story: ["Blue is de zelfverzekerde kleinzoon van Professor Oak en de eerste grote rivaal van de speler. Hij verslaat de Elite Four voordat de speler dat doet, maar moet zijn kampioenstitel daarna meteen verdedigen.", "Blue is Professor Oak's confident grandson and the player's first major rival. He beats the Elite Four before the player does, but must defend his new Champion title straight away."], team: [["Pidgeot",18],["Alakazam",65],["Rhydon",112],["Arcanine",59]], color: "#4776c5" },
    { gen: 1, region: "Kanto", name: "Professor Oak", role: ["Pokémon-onderzoeker", "Pokémon researcher"], games: ["Red, Blue, Yellow en remakes", "Red, Blue, Yellow, and remakes"], story: ["Oak geeft de speler de eerste Pokédex en helpt bij het onderzoek naar Pokémon. Hij is ook de grootvader van Blue; hun vriendelijke competitie verklaart waarom Oak zijn kleinzoon vaak met de speler vergelijkt.", "Oak gives the player their first Pokédex and helps research Pokémon. He is also Blue's grandfather; their friendly rivalry explains why Oak often compares his grandson with the player."], team: [["Bulbasaur",1],["Charmander",4],["Squirtle",7]], color: "#459b72" },
    { gen: 1, region: "Kanto", name: "Giovanni", role: ["Leider van Team Rocket", "Leader of Team Rocket"], games: ["Red, Blue, Yellow en remakes", "Red, Blue, Yellow, and remakes"], story: ["Giovanni leidt Team Rocket en gebruikt zijn positie als Gym Leader van Viridian City als dekmantel. Na zijn nederlaag ontbindt hij de organisatie en verdwijnt hij, maar in Johto probeert Team Rocket zijn macht zonder hem terug te krijgen.", "Giovanni leads Team Rocket and uses his position as Viridian City's Gym Leader as a cover. After his defeat he disbands the organization and disappears, though Team Rocket later tries to regain power in Johto without him."], team: [["Persian",53],["Nidoking",34],["Rhydon",112]], color: "#6d4c41" },
    { gen: 1, region: "Kanto", name: "Brock", role: ["Gym Leader van Pewter City", "Pewter City Gym Leader"], games: ["Red, Blue, Yellow en remakes", "Red, Blue, Yellow, and remakes"], story: ["Brock is de standvastige Rock-type Gym Leader van Pewter City en een van de eerste trainers die de speler uitdaagt. Buiten de Gym zorgt hij voor zijn grote familie; in latere ontmoetingen laat hij zien hoe sterk zijn band met zijn Pokémon is geworden.", "Brock is Pewter City's steady Rock-type Gym Leader and one of the first trainers to challenge the player. Outside the Gym he cares for his large family; later encounters show how strong his bond with his Pokémon has become."], team: [["Onix",95],["Geodude",74],["Rhyhorn",111]], color: "#ad8050" },
    { gen: 1, region: "Kanto", name: "Misty", role: ["Gym Leader van Cerulean City", "Cerulean City Gym Leader"], games: ["Red, Blue, Yellow en remakes", "Red, Blue, Yellow, and remakes"], story: ["Misty is de energieke Water-type Gym Leader van Cerulean City en een van de eerste grote uitdagingen in Kanto. In latere games blijft ze trainen en verschijnt ze opnieuw als een sterkere tegenstander.", "Misty is Cerulean City's energetic Water-type Gym Leader and one of Kanto's first major challenges. In later games she keeps training and returns as a stronger opponent."], team: [["Starmie",121],["Golduck",55],["Gyarados",130]], color: "#438bd1" },
    { gen: 2, region: "Johto", name: "Silver", role: ["Rivaal", "Rival"], games: ["Gold, Silver, Crystal en remakes", "Gold, Silver, Crystal, and remakes"], story: ["Silver is een harde, afstandelijke rivaal die Pokémon aanvankelijk vooral als gereedschap voor de overwinning ziet. Door herhaalde ontmoetingen leert hij dat vertrouwen en samenwerking een trainer sterker maken; hij blijkt de zoon van Giovanni te zijn.", "Silver is a harsh, distant rival who initially treats Pokémon mainly as tools for victory. Through repeated encounters he learns that trust and cooperation make a trainer stronger; he is revealed to be Giovanni's son."], team: [["Typhlosion",157],["Crobat",169],["Sneasel",215],["Gengar",94]], color: "#924c9f" },
    { gen: 2, region: "Johto", name: "Ethan / Lyra", role: ["Hoofdpersonage", "Player character"], games: ["Gold, Silver, Crystal en HeartGold/SoulSilver", "Gold, Silver, Crystal, and HeartGold/SoulSilver"], story: ["Ethan of Lyra verlaat New Bark Town om Pokémon te onderzoeken en de Johto League uit te dagen. De gekozen naam en het uiterlijk hangen af van de speler; hun avontuur draait om het verzamelen van badges en het stoppen van Team Rocket.", "Ethan or Lyra leaves New Bark Town to study Pokémon and challenge the Johto League. Their name and appearance depend on the player's choice; the adventure follows their badge quest and effort to stop Team Rocket."], team: [["Typhlosion",157],["Feraligatr",160],["Meganium",154]], color: "#5b9c68" },
    { gen: 2, region: "Johto", name: "Lance", role: ["Kampioen en drakentrainer", "Champion and Dragon trainer"], games: ["Gold, Silver, Crystal en remakes", "Gold, Silver, Crystal, and remakes"], story: ["Lance is de Dragon-type specialist die na de Elite Four de kampioen van Johto wordt. Hij helpt de speler Team Rocket in Mahogany Town te stoppen en keert later terug als een van de machtigste trainers van de regio.", "Lance is the Dragon-type specialist who becomes Johto's Champion after the Elite Four. He helps the player stop Team Rocket in Mahogany Town and later returns as one of the region's strongest trainers."], team: [["Dragonite",149],["Gyarados",130],["Charizard",6]], color: "#a44a50" },
    { gen: 3, region: "Hoenn", name: "Brendan / May", role: ["Hoofdpersonage", "Player character"], games: ["Ruby, Sapphire, Emerald en remakes", "Ruby, Sapphire, Emerald, and remakes"], story: ["Brendan of May verhuist naar Littleroot Town en helpt Professor Birch met veldonderzoek. Afhankelijk van de gekozen versie wordt de andere trainer je rivaal; samen raken ze betrokken bij de strijd tussen Team Magma en Team Aqua.", "Brendan or May moves to Littleroot Town and helps Professor Birch with field research. The other trainer becomes your rival, and both are drawn into the conflict between Team Magma and Team Aqua."], team: [["Sceptile",254],["Blaziken",257],["Swampert",260]], color: "#499c79" },
    { gen: 3, region: "Hoenn", name: "Wally", role: ["Vriend en rivaal", "Friend and rival"], games: ["Ruby, Sapphire, Emerald en remakes", "Ruby, Sapphire, Emerald, and remakes"], story: ["Wally begint als een verlegen jongen die voor het eerst alleen op reis gaat en een Ralts vangt. Door zijn ontmoetingen met de speler groeit hij uit tot een vastberaden trainer die uiteindelijk op eigen kracht de Battle Maison bereikt.", "Wally begins as a shy boy setting out on his own for the first time, catching a Ralts. His encounters with the player help him grow into a determined trainer who eventually reaches the Battle Maison on his own."], team: [["Gardevoir",282],["Gallade",475],["Altaria",334]], color: "#58a69a" },
    { gen: 3, region: "Hoenn", name: "Steven", role: ["Kampioen en stenenverzamelaar", "Champion and stone collector"], games: ["Ruby, Sapphire, Emerald en remakes", "Ruby, Sapphire, Emerald, and remakes"], story: ["Steven Stone is een kalme kampioen met een grote belangstelling voor zeldzame stenen en fossielen. Hij onderzoekt de ontwakende legendarische Pokémon en helpt de speler Team Magma of Aqua tegen te houden; in Emerald neemt Wallace de kampioenstitel over.", "Steven Stone is a composed Champion with a deep interest in rare stones and fossils. He investigates the awakening Legendary Pokémon and helps stop Team Magma or Aqua; in Emerald, Wallace takes the Champion title."], team: [["Metagross",376],["Aggron",306],["Skarmory",227],["Armaldo",348]], color: "#657d96" },
    { gen: 3, region: "Hoenn", name: "Maxie / Archie", role: ["Leiders van Team Magma en Team Aqua", "Leaders of Team Magma and Team Aqua"], games: ["Ruby, Sapphire, Emerald en remakes", "Ruby, Sapphire, Emerald, and remakes"], story: ["Maxie wil het land uitbreiden en Archie wil de zee vergroten; beiden denken dat hun plan de wereld zal verbeteren. Door Groudon of Kyogre te wekken, veroorzaken ze juist een gevaarlijke klimaatcrisis en moeten ze hun vergissing onder ogen zien.", "Maxie wants to expand the land while Archie wants to expand the sea; each believes their plan will improve the world. Awakening Groudon or Kyogre instead causes a dangerous climate crisis, forcing them to face their mistake."], team: [["Camerupt",323],["Mightyena",262],["Groudon",383],["Kyogre",382]], color: "#bd5943" },
    { gen: 4, region: "Sinnoh", name: "Dawn / Lucas", role: ["Hoofdpersonage", "Player character"], games: ["Diamond, Pearl, Platinum en Brilliant Diamond/Shining Pearl", "Diamond, Pearl, Platinum, and Brilliant Diamond/Shining Pearl"], story: ["Dawn of Lucas begint in Twinleaf Town en reist door Sinnoh om de Pokédex te vullen en de League te bereiken. Professor Rowan begeleidt hun onderzoek naar evolutie, terwijl Team Galactic de energie van de legendarische Pokémon probeert te gebruiken.", "Dawn or Lucas starts in Twinleaf Town and travels across Sinnoh to complete the Pokédex and reach the League. Professor Rowan guides their research into evolution while Team Galactic tries to harness the power of Legendary Pokémon."], team: [["Infernape",392],["Empoleon",395],["Torterra",389]], color: "#529a72" },
    { gen: 4, region: "Sinnoh", name: "Barry", role: ["Rivaal", "Rival"], games: ["Diamond, Pearl en Platinum", "Diamond, Pearl, and Platinum"], story: ["Barry is de razendsnelle jeugdvriend en rivaal van de speler. Hij wil koste wat kost de sterkste trainer worden, maar leert door zijn nederlagen geduldiger te plannen; zijn vader Palmer is de sterke leider van de Battle Tower.", "Barry is the player's fast-moving childhood friend and rival. He is determined to become the strongest trainer, but his losses teach him to plan more carefully; his father Palmer is the formidable Battle Tower leader."], team: [["Staraptor",398],["Heracross",214],["Snorlax",143],["Empoleon",395]], color: "#4b79cb" },
    { gen: 4, region: "Sinnoh", name: "Cynthia", role: ["Kampioen en onderzoeker", "Champion and researcher"], games: ["Diamond, Pearl, Platinum en remakes", "Diamond, Pearl, Platinum, and remakes"], story: ["Cynthia is de bedachtzame kampioen van Sinnoh, die oude ruïnes en de mythologie van de regio bestudeert. Ze helpt de speler Team Galactic te dwarsbomen en verschijnt later in andere regio's als een uitzonderlijk sterke uitdager.", "Cynthia is Sinnoh's thoughtful Champion, studying ancient ruins and the region's mythology. She helps the player thwart Team Galactic and later appears in other regions as an exceptionally strong challenger."], team: [["Garchomp",445],["Lucario",448],["Milotic",350],["Spiritomb",442]], color: "#c56d9c" },
    { gen: 4, region: "Sinnoh", name: "Cyrus", role: ["Leider van Team Galactic", "Leader of Team Galactic"], games: ["Diamond, Pearl en Platinum", "Diamond, Pearl, and Platinum"], story: ["Cyrus is de kille leider van Team Galactic, die emoties als een zwakte beschouwt. Hij probeert met Dialga en Palkia een nieuwe wereld zonder menselijke gevoelens te scheppen; in Platinum wordt zijn plan in de Distortion World ontmaskerd.", "Cyrus is the cold leader of Team Galactic, viewing emotion as a weakness. He tries to create a new world without human spirit using Dialga and Palkia; in Platinum, his plan is exposed in the Distortion World."], team: [["Weavile",461],["Honchkrow",430],["Crobat",169],["Dialga",483]], color: "#52526f" },
    { gen: 5, region: "Unova", name: "Hilbert / Hilda", role: ["Hoofdpersonage", "Player character"], games: ["Black, White, Black 2 en White 2", "Black, White, Black 2, and White 2"], story: ["Hilbert of Hilda vertrekt uit Nuvema Town met vrienden Cheren en Bianca om Unova te verkennen. Hun avontuur stelt de vraag of mensen en Pokémon samen horen te leven, terwijl Team Plasma de waarheid achter zijn bevrijdingsleus verbergt.", "Hilbert or Hilda leaves Nuvema Town with friends Cheren and Bianca to explore Unova. Their adventure questions how people and Pokémon should live together, while Team Plasma hides the truth behind its call for liberation."], team: [["Serperior",497],["Emboar",500],["Samurott",503]], color: "#4f78b9" },
    { gen: 5, region: "Unova", name: "N", role: ["Rivaal en koning van Team Plasma", "Rival and king of Team Plasma"], games: ["Black, White, Black 2 en White 2", "Black, White, Black 2, and White 2"], story: ["N kan met Pokémon communiceren en is opgevoed door Ghetsis om Team Plasma's leider te worden. Hij gelooft oprecht dat Pokémon bevrijd moeten worden, maar ontdekt dat Ghetsis hem manipuleerde; na de confrontatie kiest N zijn eigen weg.", "N can understand Pokémon and was raised by Ghetsis to lead Team Plasma. He sincerely believes Pokémon should be liberated, but discovers Ghetsis manipulated him; after the confrontation, N chooses his own path."], team: [["Zekrom",644],["Reshiram",643],["Zoroark",571],["Vanilluxe",584]], color: "#4c8f9e" },
    { gen: 5, region: "Unova", name: "Cheren en Bianca", role: ["Vrienden en rivalen", "Friends and rivals"], games: ["Black, White, Black 2 en White 2", "Black, White, Black 2, and White 2"], story: ["Cheren en Bianca vertrekken met de speler uit Nuvema Town, maar ontwikkelen zich heel anders. Cheren zoekt naar de betekenis van kracht en wordt later Gym Leader; Bianca vindt haar eigen tempo en wordt onderzoeksassistent van Professor Juniper.", "Cheren and Bianca leave Nuvema Town with the player, but grow in very different ways. Cheren searches for the meaning of strength and later becomes a Gym Leader; Bianca finds her own pace and becomes Professor Juniper's research assistant."], team: [["Stoutland",508],["Musharna",518],["Unfezant",521],["Serperior",497]], color: "#c27b48" },
    { gen: 5, region: "Unova", name: "Ghetsis", role: ["Leider van Team Plasma", "Leader of Team Plasma"], games: ["Black, White, Black 2 en White 2", "Black, White, Black 2, and White 2"], story: ["Ghetsis gebruikt N's overtuiging en Team Plasma's publieke idealen om zelf de macht over Unova te grijpen. Wanneer zijn plan mislukt, laat hij zijn ware ambitie en minachting voor anderen zien; in Black 2 en White 2 probeert hij opnieuw de regio te onderwerpen.", "Ghetsis exploits N's beliefs and Team Plasma's public ideals to seize power over Unova for himself. When his plan fails, his true ambition and contempt for others are revealed; in Black 2 and White 2 he tries again to dominate the region."], team: [["Hydreigon",635],["Bisharp",625],["Eelektross",604],["Cofagrigus",563]], color: "#4b596a" },
    { gen: 6, region: "Kalos", name: "Calem / Serena", role: ["Hoofdpersonage en rivaal", "Player character and rival"], games: ["X en Y", "X and Y"], story: ["Calem of Serena verhuist naar Vaniville Town en raakt bevriend met een groep jonge trainers die samen Kalos ontdekken. De niet-gekozen trainer wordt je rivaal; onderweg bepalen Mega-evolutie en Team Flare's plannen het lot van de regio.", "Calem or Serena moves to Vaniville Town and befriends a group of young trainers exploring Kalos together. The unchosen trainer becomes your rival; Mega Evolution and Team Flare's plans shape the region's fate."], team: [["Greninja",658],["Chesnaught",652],["Delphox",655],["Absol",359]], color: "#4779b5" },
    { gen: 6, region: "Kalos", name: "Diantha", role: ["Kampioen en filmster", "Champion and movie star"], games: ["X en Y", "X and Y"], story: ["Diantha is zowel een gevierde actrice als de kampioen van Kalos. Ze moedigt de speler aan om sterker te worden en helpt bij de crisis rond Team Flare; achter haar publieke uitstraling schuilt een trainer die gevechten serieus neemt.", "Diantha is both a celebrated actress and Kalos's Champion. She encourages the player to grow stronger and helps during Team Flare's crisis; behind her public image is a trainer who takes battles seriously."], team: [["Gardevoir",282],["Goodra",706],["Tyrantrum",697],["Aurorus",698]], color: "#bc6d9c" },
    { gen: 6, region: "Kalos", name: "Lysandre", role: ["Leider van Team Flare", "Leader of Team Flare"], games: ["X en Y", "X and Y"], story: ["Lysandre is een invloedrijke uitvinder die beweert de schoonheid van de wereld te willen beschermen. Zijn obsessie met een perfecte wereld verandert in een plan om bijna al het leven uit te wissen; de speler moet hem en Team Flare stoppen.", "Lysandre is an influential inventor who claims to want to preserve the world's beauty. His obsession with a perfect world becomes a plan to erase almost all life, and the player must stop him and Team Flare."], team: [["Pyroar",668],["Gyarados",130],["Mienshao",620],["Mega Gyarados",130]], color: "#cd4d36" },
    { gen: 7, region: "Alola", name: "Elio / Selene", role: ["Hoofdpersonage", "Player character"], games: ["Sun, Moon, Ultra Sun en Ultra Moon", "Sun, Moon, Ultra Sun, and Ultra Moon"], story: ["Elio of Selene verhuist naar Alola en neemt deel aan de eilandchallenge in plaats van een traditionele Gym League. Hun tocht raakt verweven met de Ultra Beasts, de Ultra Wormholes en de familieproblemen van Lillie.", "Elio or Selene moves to Alola and takes part in the island challenge rather than a traditional Gym League. Their journey becomes entangled with the Ultra Beasts, Ultra Wormholes, and Lillie's family troubles."], team: [["Decidueye",724],["Incineroar",727],["Primarina",730]], color: "#419879" },
    { gen: 7, region: "Alola", name: "Lillie", role: ["Reisgenoot", "Traveling companion"], games: ["Sun, Moon, Ultra Sun en Ultra Moon", "Sun, Moon, Ultra Sun, and Ultra Moon"], story: ["Lillie reist met Nebby, een Cosmog die ze tegen de wensen van haar moeder in beschermt. Ze begint onzeker en afhankelijk, maar leert zelf beslissingen te nemen en haar moeder Lusamine te confronteren; Nebby evolueert later afhankelijk van de versie.", "Lillie travels with Nebby, a Cosmog she protects against her mother's wishes. She starts out unsure of herself, but learns to make her own choices and confront Lusamine; Nebby later evolves differently depending on the version."], team: [["Cosmog",789],["Clefairy",35],["Alolan Ninetales",38]], color: "#b186c9" },
    { gen: 7, region: "Alola", name: "Gladion", role: ["Rivaal en beschermheer", "Rival and protector"], games: ["Sun, Moon, Ultra Sun en Ultra Moon", "Sun, Moon, Ultra Sun, and Ultra Moon"], story: ["Gladion loopt weg uit de Aether Foundation met Type: Null om het Pokémon te beschermen tegen experimenten. Zijn harde houding verbergt zijn zorg voor Lillie; samen met de speler probeert hij Lusamine en de Ultra Beasts te stoppen.", "Gladion runs away from the Aether Foundation with Type: Null to protect the Pokémon from experimentation. His tough manner hides his concern for Lillie; together with the player, he tries to stop Lusamine and the Ultra Beasts."], team: [["Silvally",773],["Crobat",169],["Umbreon",197],["Lucario",448]], color: "#656279" },
    { gen: 7, region: "Alola", name: "Professor Kukui", role: ["Pokémon-professor", "Pokémon professor"], games: ["Sun en Moon", "Sun and Moon"], story: ["Kukui onderzoekt Pokémon-aanvallen en droomt ervan een officiële Pokémon League op Alola te stichten. Hij begeleidt de speler tijdens de eilandchallenge en verschijnt uiteindelijk zelf als verrassende eindtegenstander van de eerste Alola League.", "Kukui researches Pokémon moves and dreams of founding an official Pokémon League in Alola. He guides the player through the island challenge and eventually appears as the surprise final opponent of Alola's first League."], team: [["Incineroar",727],["Braviary",628],["Lycanroc",745],["Snorlax",143]], color: "#5b8c91" },
    { gen: 7, region: "Alola", name: "Lusamine", role: ["Directeur van de Aether Foundation", "Director of the Aether Foundation"], games: ["Sun, Moon, Ultra Sun en Ultra Moon", "Sun, Moon, Ultra Sun, and Ultra Moon"], story: ["Lusamine leidt de Aether Foundation, die Pokémon zegt te beschermen, maar haar angst om dierbaren te verliezen beheerst haar keuzes. Haar obsessie met de Ultra Beasts beschadigt haar band met Lillie en Gladion; de precieze gebeurtenissen verschillen tussen Sun/Moon en Ultra Sun/Ultra Moon.", "Lusamine leads the Aether Foundation, which claims to protect Pokémon, but fear of losing loved ones drives her choices. Her obsession with Ultra Beasts damages her relationship with Lillie and Gladion; events differ between Sun/Moon and Ultra Sun/Ultra Moon."], team: [["Clefable",36],["Lilligant",549],["Bewear",760],["Nihilego",793]], color: "#db7094" },
    { gen: 7, region: "Alola", name: "Guzma", role: ["Leider van Team Skull", "Leader of Team Skull"], games: ["Sun, Moon, Ultra Sun en Ultra Moon", "Sun, Moon, Ultra Sun, and Ultra Moon"], story: ["Guzma is de luidruchtige leider van Team Skull en een mislukte kandidaat voor de eilandchallenge. Zijn frustratie maakt hem vatbaar voor Lusamine's plannen; uiteindelijk moet hij kiezen tussen haar volgen en de mensen van Alola helpen.", "Guzma is the boisterous leader of Team Skull and a failed island challenge candidate. His frustration makes him vulnerable to Lusamine's plans; eventually he must choose between following her and helping Alola's people."], team: [["Golisopod",768],["Masquerain",284],["Pinsir",127],["Scizor",212]], color: "#7251a3" },
    { gen: 8, region: "Galar", name: "Victor / Gloria", role: ["Hoofdpersonage", "Player character"], games: ["Sword en Shield", "Sword and Shield"], story: ["Victor of Gloria reist door Galar om Gym badges te verdienen en mee te doen aan het grote stadiontoernooi. De zoektocht naar de oorsprong van Dynamax leidt naar een crisis rond de legendarische Pokémon en de toekomst van de regio.", "Victor or Gloria travels through Galar to earn Gym badges and compete in the stadium tournament. Investigating the origin of Dynamax leads to a crisis involving Legendary Pokémon and the region's future."], team: [["Rillaboom",812],["Cinderace",815],["Inteleon",818]], color: "#4977ba" },
    { gen: 8, region: "Galar", name: "Hop", role: ["Rivaal en broer van Leon", "Rival and Leon's brother"], games: ["Sword en Shield", "Sword and Shield"], story: ["Hop is de enthousiaste jongere broer van kampioen Leon en wil net zo beroemd worden. Zijn eerste zelfvertrouwen krijgt een deuk door zijn nederlagen; gaandeweg ontdekt hij dat hij liever Pokémon bestudeert en zijn eigen toekomst kiest.", "Hop is the enthusiastic younger brother of Champion Leon and wants to become just as famous. Early defeats shake his confidence; over time he discovers he would rather study Pokémon and choose his own future."], team: [["Dubwool",832],["Corviknight",823],["Snorlax",143],["Rillaboom",812]], color: "#d1a342" },
    { gen: 8, region: "Galar", name: "Leon", role: ["Kampioen van Galar", "Champion of Galar"], games: ["Sword en Shield", "Sword and Shield"], story: ["Leon staat bekend als de ongeslagen kampioen en als de grote held van Galar. Hij probeert de speler en Hop te beschermen door de crisis rond Eternatus zelf aan te pakken, maar leert dat hij anderen niet altijd buiten gevaar kan houden.", "Leon is known as Galar's undefeated Champion and its great hero. He tries to protect the player and Hop by handling the Eternatus crisis himself, but learns he cannot always keep others away from danger."], team: [["Charizard",6],["Dragapult",887],["Aegislash",681],["Haxorus",612]], color: "#c55b3d" },
    { gen: 8, region: "Galar", name: "Marnie", role: ["Rivaal en uitdager", "Rival and challenger"], games: ["Sword en Shield", "Sword and Shield"], story: ["Marnie komt uit Spikemuth en wil kampioen worden om haar woonplaats nieuw leven in te blazen. Team Yell, haar luidruchtige supporters, hindert andere uitdagers in haar naam; Marnie zelf bewijst dat ze op eigen kracht kan winnen.", "Marnie comes from Spikemuth and wants to become Champion to give her hometown a future. Team Yell, her noisy supporters, obstructs other challengers on her behalf; Marnie herself proves she can win through her own skill."], team: [["Morpeko",877],["Grimmsnarl",861],["Toxicroak",454],["Scrafty",560]], color: "#b85b90" },
    { gen: 9, region: "Paldea", name: "Florian / Juliana", role: ["Hoofdpersonage", "Player character"], games: ["Scarlet en Violet", "Scarlet and Violet"], story: ["Florian of Juliana begint aan een vrije schoolreis door Paldea en kan drie verhaallijnen in eigen volgorde volgen. Samen met Nemona, Arven en Penny ontdekt de speler de geheimen van Area Zero en de reden achter de vreemde Pokémon daar.", "Florian or Juliana begins an open-ended school journey across Paldea and can follow three storylines in any order. With Nemona, Arven, and Penny, the player uncovers Area Zero's secrets and the reason for the strange Pokémon found there."], team: [["Meowscarada",908],["Skeledirge",911],["Quaquaval",914]], color: "#4d79b8" },
    { gen: 9, region: "Paldea", name: "Nemona", role: ["Rivaal en kampioensrank-trainer", "Rival and Champion-ranked trainer"], games: ["Scarlet en Violet", "Scarlet and Violet"], story: ["Nemona is een energieke, ervaren trainer die eindelijk een rivaal op haar eigen niveau wil. Ze begeleidt de speler tijdens de Victory Road-route en leert gaandeweg dat plezier in Pokémon-gevechten belangrijker is dan alleen winnen.", "Nemona is an energetic, experienced trainer eager to find a rival at her own level. She guides the player through the Victory Road route and gradually learns that enjoying Pokémon battles matters more than simply winning."], team: [["Pawmot",923],["Lycanroc",745],["Goodra",706],["Meowscarada",908]], color: "#4d9d73" },
    { gen: 9, region: "Paldea", name: "Arven", role: ["Reisgenoot en kok", "Traveling companion and cook"], games: ["Scarlet en Violet", "Scarlet and Violet"], story: ["Arven vraagt de speler te helpen bij het zoeken naar Herba Mystica, zeldzame planten die zijn gewonde Mabosstiff kunnen helpen. Zijn zoektocht verandert in een persoonlijk verhaal over verlies, familie en de waarheid over de professor in Area Zero.", "Arven asks the player to help find Herba Mystica, rare plants that may help his injured Mabosstiff. His quest becomes a personal story about loss, family, and the truth about the professor in Area Zero."], team: [["Mabosstiff",943],["Greedent",820],["Toedscruel",949],["Scovillain",952]], color: "#b68442" },
    { gen: 9, region: "Paldea", name: "Penny", role: ["Student en Team Star-bondgenoot", "Student and Team Star ally"], games: ["Scarlet en Violet", "Scarlet and Violet"], story: ["Penny is een teruggetrokken leerling die de speler helpt Team Star te onderzoeken. In de Starfall Street-verhaallijn wordt duidelijk dat ze achter de groep zit en dat Team Star ooit ontstond uit een poging om pesten op school te stoppen.", "Penny is a withdrawn student who helps the player investigate Team Star. The Starfall Street storyline reveals she is behind the group and that Team Star began as an effort to stop bullying at school."], team: [["Umbreon",197],["Sylveon",700],["Leafeon",470],["Flareon",136]], color: "#986ab1" },
    { gen: 9, region: "Paldea", name: "Geeta", role: ["Voorzitter van de Pokémon League", "Chairwoman of the Pokémon League"], games: ["Scarlet en Violet", "Scarlet and Violet"], story: ["Geeta leidt de Paldea Pokémon League en beoordeelt trainers die de Champion Assessment doen. Haar beheerste optreden maakt indruk, maar ze erkent ook dat ze haar Pokémon tijdens gevechten beter had kunnen inzetten; later nodigt ze de speler uit Gym Leaders te beoordelen.", "Geeta heads the Paldea Pokémon League and evaluates trainers taking the Champion Assessment. Her composed manner is imposing, but she also admits she could have used her Pokémon better in battle; later she asks the player to assess the Gym Leaders."], team: [["Glimmora",970],["Gogoat",673],["Espathra",956],["Kingambit",983]], color: "#7782a1" },
    { gen: 9, region: "Paldea", name: "Kieran en Carmine", role: ["Rivalen uit Kitakami", "Rivals from Kitakami"], games: ["The Hidden Treasure of Area Zero: The Teal Mask en The Indigo Disk", "The Hidden Treasure of Area Zero: The Teal Mask and The Indigo Disk"], story: ["De broer en zus Carmine en Kieran ontmoeten de speler tijdens een schooluitwisseling in Kitakami. Kieran raakt gefascineerd door Ogerpon en wordt jaloers wanneer de speler dichter bij haar komt; in The Indigo Disk moet hij omgaan met de gevolgen van zijn obsessie met sterker worden.", "Siblings Carmine and Kieran meet the player during a school exchange in Kitakami. Kieran becomes fascinated by Ogerpon and jealous when the player grows closer to her; in The Indigo Disk, he faces the consequences of his obsession with becoming stronger."], team: [["Ogerpon",1017],["Poliwrath",62],["Sinistcha",1013],["Dragonite",149]], color: "#7b589c" },
  ];

  const TRAINER_SPRITE_BASE = "https://play.pokemonshowdown.com/sprites/trainers/";
  const sprite = (file, artist = "") => ({ file, artist });
  const PORTRAITS = {
    Red: [sprite("red.png")],
    Blue: [sprite("blue.png")],
    "Professor Oak": [sprite("oak-gen1.png")],
    Giovanni: [sprite("giovanni.png")],
    Brock: [sprite("brock.png")],
    Misty: [sprite("misty.png")],
    Silver: [sprite("silver-gen2.png")],
    "Ethan / Lyra": [sprite("ethan.png"), sprite("lyra.png")],
    Lance: [sprite("lance-gen2.png")],
    "Brendan / May": [sprite("brendan-gen3.png"), sprite("may-gen3.png")],
    Wally: [sprite("wally-gen3.png")],
    Steven: [sprite("steven-gen3.png")],
    "Maxie / Archie": [sprite("maxie-gen3.png"), sprite("archie-gen3.png")],
    "Dawn / Lucas": [sprite("dawn-gen4pt.png"), sprite("lucas-gen4pt.png")],
    Barry: [sprite("barry.png")],
    Cynthia: [sprite("cynthia-gen4.png")],
    Cyrus: [sprite("cyrus.png")],
    "Hilbert / Hilda": [sprite("hilbert.png"), sprite("hilda.png")],
    N: [sprite("n.png")],
    "Cheren en Bianca": [sprite("cheren-gen5bw2.png"), sprite("bianca.png")],
    Ghetsis: [sprite("ghetsis-gen5bw.png")],
    "Calem / Serena": [sprite("calem.png", "Brumirage"), sprite("serena.png", "kyledove")],
    Diantha: [sprite("diantha.png", "Brumirage")],
    Lysandre: [sprite("lysandre.png", "kyledove")],
    "Elio / Selene": [sprite("elio.png", "Beliot419"), sprite("selene.png", "Beliot419")],
    Lillie: [sprite("lillie.png", "Beliot419")],
    Gladion: [sprite("gladion.png", "Beliot419")],
    "Professor Kukui": [sprite("kukui.png", "Beliot419")],
    Lusamine: [sprite("lusamine.png", "Beliot419")],
    Guzma: [sprite("guzma.png", "Gnomowladny")],
    "Victor / Gloria": [sprite("victor.png", "Brumirage"), sprite("gloria.png", "Brumirage")],
    Hop: [sprite("hop.png", "Brumirage")],
    Leon: [sprite("leon.png", "Brumirage")],
    Marnie: [sprite("marnie.png", "Brumirage")],
    "Florian / Juliana": [sprite("florian-s.png", "kyledove"), sprite("juliana-s.png", "kyledove")],
    Nemona: [sprite("nemona-v.png", "kyledove")],
    Arven: [sprite("arven-v.png", "ZacWeavile")],
    Penny: [sprite("penny.png", "ZacWeavile")],
    Geeta: [sprite("geeta.png", "kyledove")],
    "Kieran en Carmine": [sprite("kieran.png", "kyledove"), sprite("carmine.png", "kyledove")],
  };
  function render() {
    const query = $("character-search").value.trim().toLocaleLowerCase();
    const generation = $("character-gen").value;
    const matches = CHARACTERS.filter((character) => {
      if (generation !== "all" && String(character.gen) !== generation) return false;
      const searchable = [
        character.name, character.region, text(character.role), text(character.games),
        text(character.story), ...character.team.map(([name]) => name),
      ].join(" ").toLocaleLowerCase();
      return searchable.includes(query);
    });

    $("character-status").textContent = text(
      `${matches.length} van ${CHARACTERS.length} personages`,
      `${matches.length} of ${CHARACTERS.length} characters`
    );
    $("character-grid").innerHTML = matches.length
      ? matches.map((character) => {
        const portraits = (PORTRAITS[character.name] || []).map(({ file, artist }) => {
          const source = `${TRAINER_SPRITE_BASE}${file}`;
          const artistCredit = artist
            ? `<a href="${TRAINER_SPRITE_BASE}?view=sprites&amp;filter=credited#${encodeURIComponent(file)}" target="_blank" rel="noopener">${PK.esc(artist)}</a>`
            : "";
          return `
          <figure class="character-portrait-figure">
            <button type="button" class="character-portrait-frame" data-character-zoom="${source}" data-character-name="${PK.esc(character.name)}" aria-label="${PK.esc(text(`Vergroot portret: ${character.name}`, `Enlarge portrait: ${character.name}`))}">
              <img class="character-portrait" src="${source}" alt="${PK.esc(character.name)}" loading="lazy" decoding="async">
            </button>
            <figcaption class="character-portrait-credit">${artist
              ? `${text("Art:", "Art by")} ${artistCredit}`
              : text("Gamesprite", "Game sprite")}
              · <a href="${source}" target="_blank" rel="noopener">Pokémon Showdown</a>
            </figcaption>
          </figure>`;
        }).join("");
        const firstPortrait = PORTRAITS[character.name]?.[0];
        const firstPortraitUrl = firstPortrait ? `${TRAINER_SPRITE_BASE}${firstPortrait.file}` : "";
        return `
        <article class="character-card" style="--character-color:${character.color}">
          <div class="character-art-row"><div class="character-portraits">${portraits}</div></div>
          <h3><button type="button" class="character-title-button" data-character-zoom="${firstPortraitUrl}" data-character-name="${PK.esc(character.name)}" aria-label="${PK.esc(text(`Vergroot portret: ${character.name}`, `Enlarge portrait: ${character.name}`))}">${PK.esc(character.name)}</button></h3>
          <small class="character-meta">${PK.esc(text(character.role))} · ${PK.esc(character.region)} · ${text(`Generatie ${character.gen}`, `Generation ${character.gen}`)}</small>
          <small class="character-meta">${PK.esc(text(character.games))}</small>
          <p>${PK.esc(text(character.story))}</p>
          <b>${text("Bekende Pokémon (voorbeelden):", "Notable Pokémon (examples):")}</b>
          <div class="character-team">${character.team.map(([name, id]) => `
            <button type="button" class="character-pokemon" data-pokemon-zoom="${PK.ART(id)}" data-pokemon-name="${PK.esc(name)}" aria-label="${PK.esc(text(`Vergroot ${name}`, `Enlarge ${name}`))}">
              <img src="${PK.ART(id)}" alt="" loading="lazy"><span>${PK.esc(name)}</span>
            </button>
          `).join("")}</div>
        </article>`;
      }).join("")
      : `<p class="status">${text("Geen personages gevonden. Probeer een andere zoekopdracht of generatie.", "No characters found. Try another search or generation.")}</p>`;
  }

  let zoomTrigger = null;
  const modal = $("modal");
  const modalBody = $("modal-body");
  const closeButton = $("close");

  function openZoom(image, name, meta, trigger, isPokemon) {
    zoomTrigger = trigger;
    modalBody.innerHTML = `
      <div class="character-zoom-detail">
        <img class="character-zoom-image${isPokemon ? " pokemon" : ""}" src="${PK.esc(image)}" alt="${PK.esc(name)}">
        <h2>${PK.esc(name)}</h2>
        ${meta ? `<p class="character-zoom-meta">${PK.esc(meta)}</p>` : ""}
      </div>`;
    modal.hidden = false;
    closeButton.focus();
  }

  function restoreZoomFocus() {
    if (!zoomTrigger) return;
    zoomTrigger.focus();
    zoomTrigger = null;
  }

  $("character-grid").addEventListener("click", (event) => {
    const pokemon = event.target.closest("[data-pokemon-zoom]");
    if (pokemon) {
      return openZoom(pokemon.dataset.pokemonZoom, pokemon.dataset.pokemonName, "", pokemon, true);
    }

    const portrait = event.target.closest("[data-character-zoom]");
    if (!portrait) return;
    const character = CHARACTERS.find((item) => item.name === portrait.dataset.characterName);
    if (!character) return;
    openZoom(
      portrait.dataset.characterZoom,
      character.name,
      `${text(character.role)} · ${character.region} · ${text(`Generatie ${character.gen}`, `Generation ${character.gen}`)}`,
      portrait,
      false
    );
  });
  closeButton.addEventListener("click", restoreZoomFocus);
  modal.addEventListener("click", (event) => { if (event.target === modal) restoreZoomFocus(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") restoreZoomFocus(); });

  $("character-search").addEventListener("input", render);
  $("character-gen").addEventListener("change", render);
  document.addEventListener("langchange", () => {
    zoomTrigger = null;
    render();
  });
  render();
})();
