/* Module: Mathe-Grundlagen kompakt (own page mathe-kompakt.html). One-screen cheat sheet. */
(function () {
  LernApp.register({
    id: 'mathe-kompakt',
    order: 10,
    nav: 'Mathe kompakt',
    title: 'Mathe-Grundlagen kompakt',
    kicker: 'Spickzettel · Vorbereitung auf Supervised ML',
    summary: `Das Wichtigste auf einer Seite`,
    html: `
  <p>Der Spickzettel zum Nachschlagen. Die Herleitungen und alle Diagramme stehen in der <a href="mathe-ausfuehrlich.html">ausführlichen Version</a>.</p>

  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Funktion</b></td><td><code>y = a·x + b</code>: <code>a</code> Steigung, <code>b</code> Achsenabschnitt. Die lineare Regression lernt genau diese zwei Zahlen.</td></tr>
    <tr><td><b>Summe Σ</b></td><td>Eine for-Schleife mit Aufsummieren. <code>MSE = (1/n)·Σ (y − ŷ)²</code></td></tr>
    <tr><td><b>Ableitung</b></td><td>Steigung an einem Punkt. <code>x²</code> → <code>2x</code>. Positiv: Fehler wächst nach rechts, negativ: nach links, null: Tal oder Gipfel.</td></tr>
    <tr><td><b>Gradient</b></td><td>Alle Ableitungen auf einmal (pro Koeffizient eine). Gradient Descent geht in die <b>Gegenrichtung</b>: <code>w = w − lr · Gradient</code></td></tr>
    <tr><td><b>Matrix X</b></td><td>Eine Zeile pro Beobachtung, eine Spalte pro Merkmal. <code>y</code> ist die Zielspalte.</td></tr>
    <tr><td><b>Mittelwert</b></td><td>Summe / Anzahl. Wird von Ausreissern gezogen.</td></tr>
    <tr><td><b>Median</b></td><td>Mittlerer Wert der sortierten Liste. Robust gegen Ausreisser.</td></tr>
    <tr><td><b>Varianz, Std</b></td><td>Mittlere quadrierte Abweichung vom Mittelwert; Std ist ihre Wurzel. Beispiel <code>[1,2,3,4,10]</code>: Mittelwert 4, Median 3, Varianz 10, Std ≈ 3.16.</td></tr>
    <tr><td><b>Korrelation r</b></td><td>−1 bis +1, misst nur <i>lineare</i> Zusammenhänge. Keine Ursache.</td></tr>
  </table></div>

  <h3>StandardScaler in 4 Zeilen</h3>
  <ul>
    <li><b>Formel (pro Spalte):</b> <code>z = (x − Mittelwert) / Std</code></li>
    <li><b>Ergebnis auf dem Training:</b> Mittelwert 0, Std 1. Std wird nur einmal berechnet, auf den Rohwerten.</li>
    <li><b>Test- und neue Daten:</b> nur <code>transform</code> mit den gemerkten Trainingszahlen, nie neu fitten (Data Leakage).</li>
    <li><b>Warum:</b> Alle Merkmale starten gleich gewichtet. Ausreisser bleiben Ausreisser und verzerren Mittelwert und Std, also vor dem Fit prüfen.</li>
  </ul>
  <div class="demo" id="ssDemo">
    <div class="tag">Demo</div><h4>StandardScaler Schritt für Schritt</h4>
    <p class="hint">Klick durch die drei Schritte und schiebe den Ausreisser (orange): Am Ende ist es immer Mittelwert 0 und Std 1.</p>
    <div class="btnrow"><button id="ssB1" class="pri">1 · Rohwerte</button><button id="ssB2">2 · Mittelwert abziehen</button><button id="ssB3">3 · Durch Std teilen</button></div>
    <svg class="plot" id="ssSvg" viewBox="0 0 320 120" role="img" aria-label="Punkte auf einer Zahlengeraden in drei Schritten des StandardScalers"></svg>
    <div class="ctl"><label for="ssOut">Achter Wert</label><input type="range" id="ssOut" min="3" max="40" step="0.5" value="30"><output id="ssOutO"></output></div>
    <details><summary>Rechnung als Tabelle</summary><div class="tablewrap"><table id="ssTab" style="min-width:0"></table></div></details>
    <div class="stats"><span>Mittelwert <b id="ssM"></b></span><span>Std (n) <b id="ssS"></b></span></div>
    <p class="hint" id="ssNote"></p>
  </div>
`,
    quiz: [
      { q: `Was bedeutet Σ?`, a: `Eine Schleife mit Aufsummieren über alle Datenpunkte.` },
      { q: `Wohin geht Gradient Descent?`, a: `Gegen die Richtung der Ableitung (daher das Minus), in Richtung kleinerer Fehler.` },
      { q: `Mittelwert und Std nach dem StandardScaler?`, a: `0 und 1, exakt nur auf den Trainingsdaten. Test- und neue Daten werden mit den gemerkten Trainingszahlen umgerechnet.` },
      { q: `Entfernt der StandardScaler Ausreisser?`, a: `Nein. Er rechnet nur um. Ausreisser im Training verzerren aber Mittelwert und Std, also vorher prüfen oder den RobustScaler nehmen.` },
    ],
    init() { MatheDemos.scaler(); },
  });
})();
