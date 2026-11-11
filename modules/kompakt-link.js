/* Module: Kompakt teaser in the navigation of the main page; the content lives on its own page kompakt.html. */
(function () {
  LernApp.register({
    id: 'kompakt-link',
    order: 96,
    nav: 'Kompakt',
    title: 'Alles kompakt',
    kicker: 'Spickzettel · Module 2 und 3',
    summary: `Das ganze Material auf einer Seite`,
    html: `
  <p>Supervised ML, Klassifikation, Unsupervised Learning und Neural Networks als Spickzettel auf einer eigenen Seite: pro Kapitel eine Tabelle mit dem, was man behalten muss.</p>
  <div class="toc">
    <a href="kompakt.html"><b>Zum Spickzettel</b><span>Alle Kapitel in Kurzform</span></a>
  </div>
`,
  });
})();
