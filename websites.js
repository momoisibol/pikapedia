(() => {
  const $ = (id) => document.getElementById(id);

  const groups = [
    {
      title: "Officieel",
      sites: [
        { name: "Pokemon.com", url: "https://www.pokemon.com", desc: "De officiële Pokémon-website met nieuws, spellen en de Pokédex." },
        { name: "Pokémon GO", url: "https://pokemongolive.com", desc: "Nieuws en evenementen van Pokémon GO." },
        { name: "Pokémon Home", url: "https://home.pokemon.com", desc: "Bewaar en ruil je Pokémon tussen spellen." },
        { name: "Pokémon TCG", url: "https://www.pokemon.com/nl/pokemon-tcg", desc: "Alles over het officiële kaartspel." },
        { name: "Pokémon Center", url: "https://www.pokemoncenter.com", desc: "De officiële webshop met knuffels en kaarten." },
      ],
    },
    {
      title: "Pokédex & informatie",
      sites: [
        { name: "Bulbapedia", url: "https://bulbapedia.bulbagarden.net", desc: "De grootste Pokémon-encyclopedie, gemaakt door fans." },
        { name: "Serebii", url: "https://www.serebii.net", desc: "Nieuws, Pokédex en uitgebreide spelgidsen." },
        { name: "PokémonDB", url: "https://pokemondb.net", desc: "Statistieken, aanvallen, types en evoluties." },
        { name: "Pokémon Wiki (Fandom)", url: "https://pokemon.fandom.com", desc: "Een wiki met artikelen over de Pokémon-wereld." },
        { name: "PokéAPI", url: "https://pokeapi.co", desc: "De gratis API waar deze Pokédex gebruik van maakt." },
      ],
    },
    {
      title: "Strategie & gevechten",
      sites: [
        { name: "Smogon", url: "https://www.smogon.com", desc: "Strategiegidsen en de competitieve gevechtsgemeenschap." },
        { name: "Pokémon Showdown", url: "https://play.pokemonshowdown.com", desc: "Gratis online Pokémon-gevechten in je browser." },
        { name: "Victory Road", url: "https://victoryroad.pro", desc: "Nieuws en teams voor het officiële competitieve spel." },
        { name: "Pikalytics", url: "https://www.pikalytics.com", desc: "Statistieken over populaire Pokémon en teams." },
      ],
    },
    {
      title: "Kaarten (TCG)",
      sites: [
        { name: "TCGdex", url: "https://tcgdex.dev", desc: "Database van kaarten, gebruikt in het menu Kaartwaarde." },
        { name: "Cardmarket", url: "https://www.cardmarket.com/en/Pokemon", desc: "Europese markt om kaarten te kopen en verkopen." },
        { name: "TCGplayer", url: "https://www.tcgplayer.com/categories/trading-and-collectible-card-games/pokemon", desc: "Kaartprijzen en een grote marktplaats." },
        { name: "Limitless TCG", url: "https://limitlesstcg.com", desc: "Decklijsten en toernooiresultaten." },
        { name: "PSA", url: "https://www.psacard.com", desc: "Laat kaarten beoordelen en bekijk de waarde van gegradeerde kaarten." },
      ],
    },
    {
      title: "Spellen & tools",
      sites: [
        { name: "Nintendo", url: "https://www.nintendo.com", desc: "De maker van de consoles waarop Pokémon-spellen uitkomen." },
        { name: "Pokémon Database Type Chart", url: "https://pokemondb.net/type", desc: "Handig overzicht van sterke en zwakke types." },
        { name: "Pokémon Go Hub", url: "https://db.pokemongohub.net", desc: "Gidsen, aanvallen en raid-informatie voor Pokémon GO." },
        { name: "The Silph Road", url: "https://thesilphroad.com", desc: "Community voor Pokémon GO-spelers." },
      ],
    },
    {
      title: "Kijken & community",
      sites: [
        { name: "Pokémon TV", url: "https://watch.pokemon.com", desc: "Kijk afleveringen en films van Pokémon." },
        { name: "Pokémon op YouTube", url: "https://www.youtube.com/@Pokemon", desc: "Het officiële kanaal met trailers en nieuws." },
        { name: "Reddit r/pokemon", url: "https://www.reddit.com/r/pokemon", desc: "Fans delen nieuws, tekeningen en tips." },
        { name: "Bulbagarden Forums", url: "https://forums.bulbagarden.net", desc: "Een grote forumgemeenschap over Pokémon." },
      ],
    },
  ];

  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function render(q = "") {
    const term = q.trim().toLowerCase();
    const html = groups
      .map((g) => {
        const sites = g.sites.filter((s) => !term || (s.name + " " + s.desc).toLowerCase().includes(term));
        if (!sites.length) return "";
        return `
        <h3 class="tcg-h">${g.title}</h3>
        <div class="site-grid">
          ${sites
            .map(
              (s) => `
            <a class="site-card" href="${s.url}" target="_blank" rel="noopener noreferrer">
              <b>${escape(s.name)}</b>
              <span>${escape(s.desc)}</span>
            </a>`
            )
            .join("")}
        </div>`;
      })
      .join("");
    $("site-groups").innerHTML = html || '<p class="status">Geen websites gevonden.</p>';
  }

  $("site-search").addEventListener("input", (e) => render(e.target.value));
  render();
})();
