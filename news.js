// Nieuws & agenda: aangekondigde Pokémon-releases en evenementen.
// Alleen items die officieel zijn aangekondigd (Pokémon Presents 27-02-2026). Check altijd pokemon.com voor actuele data.
(() => {
  const $ = (id) => document.getElementById(id);
  const L = (nl, en) => I18N.L(nl, en);
  const esc = PK.esc;

  const EVENTS = [
    { start: "2026-02-27", nl: "Pokémon Presents – Pokémon Day (30 jaar)", en: "Pokémon Presents – Pokémon Day (30 years)", dnl: "Onthulling van Pokémon Winds en Pokémon Waves, plus nieuws over Champions, Pokopia en meer.", den: "Reveal of Pokémon Winds and Pokémon Waves, plus news on Champions, Pokopia and more.", tag: "news" },
    { start: "2026-03-01", end: "2026-03-31", label: ["maart 2026", "March 2026"], nl: "Pokémon XD: Gale of Darkness op GameCube – Nintendo Classics", en: "Pokémon XD: Gale of Darkness on GameCube – Nintendo Classics", dnl: "De GameCube-klassieker uit 2005 komt naar Nintendo Classics.", den: "The 2005 GameCube classic comes to Nintendo Classics.", tag: "game" },
    { start: "2026-03-07", end: "2026-03-09", nl: "Pokémon GO – 30-jarig jubileumevent 'All Out'", en: "Pokémon GO – 30th anniversary event 'All Out'", dnl: "Een groot aantal Pokémon uit Pokémon GO keert terug.", den: "A huge range of Pokémon from Pokémon GO returns.", tag: "event" },
    { year: 2026, nl: "Nieuwe Pokémon TCG-uitbreiding met wereldwijde lancering", en: "New Pokémon TCG expansion with global launch", dnl: "De eerste uitbreiding die tegelijk wereldwijd uitkomt, als onderdeel van het 30-jarig jubileum.", den: "The first expansion to launch simultaneously worldwide, as part of the 30th anniversary.", tag: "tcg" },
    { year: 2026, nl: "Pokémon Champions", en: "Pokémon Champions", dnl: "Aangekondigd voor 2026.", den: "Announced for 2026.", tag: "game" },
    { year: 2027, nl: "Pokémon Winds & Pokémon Waves (generatie 10)", en: "Pokémon Winds & Pokémon Waves (generation 10)", dnl: "De nieuwe hoofdgames voor Nintendo Switch 2, met wereldwijde simultane release in 2027.", den: "The new mainline games for Nintendo Switch 2, with a worldwide simultaneous launch in 2027.", tag: "game" },
  ];

  const TAGS = { news: ["Nieuws", "News"], game: ["Game", "Game"], event: ["Evenement", "Event"], tcg: ["Kaartspel", "Card game"] };
  const today = () => new Date().toISOString().slice(0, 10);
  const endOf = (e) => e.end || e.start || `${e.year}-12-31`;
  const startOf = (e) => e.start || `${e.year}-01-01`;
  const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString(I18N.lang === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  function when(e) {
    if (e.label) return L(...e.label);
    if (e.year) return String(e.year);
    if (e.end && e.end !== e.start) return `${fmtDate(e.start)} – ${fmtDate(e.end)}`;
    return fmtDate(e.start);
  }

  const item = (e) => `<article class="nw-item"><div class="nw-body">
      <div class="nw-top"><span class="nw-tag">${L(...TAGS[e.tag])}</span><time>${esc(when(e))}</time></div>
      <h3>${esc(L(e.nl, e.en))}</h3><p>${esc(L(e.dnl, e.den))}</p></div></article>`;

  // Voor de homepage: eerstvolgende aankomende items
  function upcoming(n = 3) {
    return EVENTS.filter((e) => endOf(e) >= today()).sort((a, b) => startOf(a).localeCompare(startOf(b))).slice(0, n);
  }

  function render() {
    const t = today();
    const next = EVENTS.filter((e) => endOf(e) >= t).sort((a, b) => startOf(a).localeCompare(startOf(b)));
    const past = EVENTS.filter((e) => endOf(e) < t).sort((a, b) => endOf(b).localeCompare(endOf(a)));
    $("news-body").innerHTML = `
      <p class="nw-intro">${L("Een overzicht van aangekondigde Pokémon-games, kaartsets en evenementen. Data kunnen veranderen: kijk voor de actuele stand op", "An overview of announced Pokémon games, card sets and events. Dates can change: check")} <a href="https://www.pokemon.com/us/news" target="_blank" rel="noopener noreferrer">pokemon.com</a>.</p>
      <h3 class="tcg-h">${L("Aankomend", "Upcoming")}</h3>
      ${next.length ? `<div class="nw-list">${next.map(item).join("")}</div>` : `<p class="status">${L("Geen aankomende items.", "No upcoming items.")}</p>`}
      <h3 class="tcg-h">${L("Eerder", "Earlier")}</h3>
      <div class="nw-list">${past.map(item).join("")}</div>
      <div class="nw-card"><b>Pokémon Day</b><p>${L("Elk jaar op 27 februari viert Pokémon zijn verjaardag, meestal met een Pokémon Presents.", "Every year on 27 February Pokémon celebrates its anniversary, usually with a Pokémon Presents.")}</p></div>`;
  }

  window.News = { upcoming, when, item, L: (e) => L(e.nl, e.en) };
  document.querySelector('.tab[data-view="news"]').addEventListener("click", render);
  document.addEventListener("langchange", () => { if (!$("view-news").hidden) render(); });
})();
