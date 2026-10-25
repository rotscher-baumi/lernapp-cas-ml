/*
 * Template for a new chapter. Copy this file to modules/<name>.js, fill it in
 * and add one line to index.html:
 *   <script src="modules/<name>.js"></script>
 * Everything except id, title and html is optional.
 */
(function () {
  const { $, fmt } = LernApp;

  LernApp.register({
    id: 'neu', // unique, used as anchor (#neu)
    order: 80, // position in the navigation (smaller = earlier)
    nav: 'Neu', // short label in the top bar
    title: 'Titel des Kapitels',
    kicker: 'Modul 3 · Datum', // small line above the title
    summary: 'Ein Satz für die Übersichtskarte',

    // Chapter content. CSS classes available: .merk (tip), .falle (pitfall),
    // .demo, .grid2, .steps, .tablewrap, .fig (diagram). See assets/style.css.
    html: `
  <p>Erklärung in einfachen Worten.</p>
  <div class="merk"><b>Merksatz</b><p>Das Wichtigste in einem Satz.</p></div>
  <div class="falle"><b>Falle</b><p>Der häufigste Fehler.</p></div>
`,

    // Optional: Python exercises with check (assert) and solution.
    exercises: [
      {
        t: 'Erste Aufgabe',
        task: 'Setze <code>x</code> auf 5.',
        start: 'x = None  # TODO',
        check: 'assert x == 5, "x soll 5 sein"',
        sol: 'x = 5',
      },
    ],

    // Optional: self-test questions (click to reveal the answer).
    quiz: [{ q: 'Frage?', a: 'Antwort.' }],

    // Optional: notebooks that belong to this chapter (files in lernapp/notebooks).
    // notebooks: [{ file: 'Name.ipynb', desc: 'Worum es geht' }],

    // Optional: runs once after the chapter is in the page (wire demos here).
    init() {},
  });
})();
