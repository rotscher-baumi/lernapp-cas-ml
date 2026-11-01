/* Module: Mathe-Grundlagen teaser on the main page; the content lives on two own pages. */
(function () {
  LernApp.register({
    id: 'mathe',
    order: 65,
    nav: 'Mathe-Grundlagen',
    title: 'Mathe-Grundlagen: genau so viel, wie es braucht',
    kicker: 'Grundlagen · Vorbereitung auf Supervised ML',
    summary: `Σ, Ableitung, Gradient, Statistik, StandardScaler`,
    html: `
  <p>Die Mathematik, die der Kurs wirklich braucht, hat zwei eigene Seiten: einen Spickzettel für schnelles Nachschlagen und die ausführliche Erklärung mit Diagrammen zum Ausprobieren (Ableitung, Mittelwert und Std, StandardScaler).</p>
  <div class="toc">
    <a href="mathe-kompakt.html"><b>Kompakt</b><span>Spickzettel mit einer Demo</span></a>
    <a href="mathe-ausfuehrlich.html"><b>Ausführlich</b><span>Alle Erklärungen und Diagramme</span></a>
  </div>
`,
  });
})();
