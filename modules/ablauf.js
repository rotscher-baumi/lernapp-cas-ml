/* Module: Übersicht Ablauf eines Trainings. Pure content, no demos. */
(function () {
  LernApp.register({
    id: 'ablauf',
    order: 72,
    nav: 'Ablauf Training',
    title: `Übersicht: Ablauf eines Trainings`,
    kicker: `Modul 2 · Supervised Learning`,
    summary: `Von den Rohdaten bis zum Test: die Schritte in der richtigen Reihenfolge`,
    html: `  <p>Ein Modell zu trainieren ist nur ein Schritt von neun. Davor muss man die Daten verstehen und aufbereiten. Die Reihenfolge ist wichtig, weil das Testset sonst unbemerkt in die Entscheidungen einfliesst (<i>Data Leakage</i>).</p>

  <figure class="fig" style="max-width:640px"><svg viewBox="0 0 372 520" role="img" aria-label="Ablauf eines Trainings in neun Schritten: Rohdaten laden, aufteilen in Train und Test, Daten ansehen, Merkmale auswählen, fehlende Werte füllen, skalieren, trainieren und validieren mit Hyperparameter-Schleife, bestes Modell wählen, einmal auf dem Testset bewerten. Das Testset ist ab dem Aufteilen gesperrt.">
    <rect class="d-box" x="8" y="8" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="20">1 · Rohdaten laden</text><text class="d-m" x="103" y="35">Form, Datentypen prüfen</text>
    <line class="d-arr" x1="103" y1="44" x2="103" y2="66"/>

    <rect class="d-box" x="8" y="66" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="78">2 · Aufteilen</text><text class="d-m" x="103" y="93">80 % Train + Val, 20 % Test</text>
    <line class="d-dash" style="stroke:var(--warn)" marker-end="url(#mk-grey)" x1="198" y1="84" x2="214" y2="84"/>
    <rect class="d-warn" x="214" y="66" width="138" height="36" rx="8"/><text class="d-tb" x="283" y="78" style="font-size:13px">Testset 20 %</text><text class="d-m" x="283" y="93">gesperrt, nicht ansehen</text>
    <line class="d-arr" x1="103" y1="102" x2="103" y2="124"/>

    <rect class="d-hl" x="8" y="124" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="136">3 · Daten ansehen (EDA)</text><text class="d-m" x="103" y="151">nur auf den 80 %, ohne Modell</text>
    <text class="d-m d-ml" x="214" y="136">Verteilungen, Ausreisser</text><text class="d-m d-ml" x="214" y="151">Merkmal ↔ Ziel, Lücken</text>
    <line class="d-arr" x1="103" y1="160" x2="103" y2="182"/>

    <rect class="d-box" x="8" y="182" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="194">4 · Merkmale auswählen</text><text class="d-m" x="103" y="209">was bringt etwas für das Ziel?</text>
    <text class="d-m d-ml" x="214" y="194">Filter, RFE, Lasso</text><text class="d-m d-ml" x="214" y="209">nur auf Train berechnen</text>
    <line class="d-arr" x1="103" y1="218" x2="103" y2="240"/>

    <rect class="d-box" x="8" y="240" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="252">5 · Fehlende Werte füllen</text><text class="d-m" x="103" y="267">Strategie aus der EDA</text>
    <text class="d-m d-ml" x="214" y="252">Median aus Train (fit),</text><text class="d-m d-ml" x="214" y="267">dann überall anwenden</text>
    <line class="d-arr" x1="103" y1="276" x2="103" y2="298"/>

    <rect class="d-box" x="8" y="298" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="310">6 · Skalieren</text><text class="d-m" x="103" y="325">Merkmale vergleichbar machen</text>
    <text class="d-m d-ml" x="214" y="310">Skaler aus Train (fit),</text><text class="d-m d-ml" x="214" y="325">dann überall anwenden</text>
    <line class="d-arr" x1="103" y1="334" x2="103" y2="356"/>

    <rect class="d-hl" x="8" y="356" width="190" height="40" rx="8"/><text class="d-tb" x="103" y="369">7 · Trainieren, validieren</text><text class="d-m" x="103" y="385">Split 75:25 oder Cross-Validation</text>
    <path class="d-arrb" d="M198 388 H208 V364 H198"/>
    <text class="d-m d-ml" x="214" y="369">Hyperparameter</text><text class="d-m d-ml" x="214" y="384">ändern, wiederholen</text>
    <line class="d-arr" x1="103" y1="396" x2="103" y2="418"/>

    <rect class="d-box" x="8" y="418" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="430">8 · Bestes Modell wählen</text><text class="d-m" x="103" y="445">neu auf allen 80 % trainieren</text>
    <line class="d-arr" x1="103" y1="454" x2="103" y2="476"/>

    <path class="d-dash" style="stroke:var(--warn)" marker-end="url(#mk-grey)" d="M352 84 H364 V494 H198"/>
    <text class="d-m d-ml" x="214" y="470">Testset durch dieselbe</text><text class="d-m d-ml" x="214" y="483">Pipeline (nur transform)</text>
    <rect class="d-ok" x="8" y="476" width="190" height="36" rx="8"/><text class="d-tb" x="103" y="488">9 · Einmal testen</text><text class="d-m" x="103" y="503">ehrliche Note auf neuen Daten</text>
  </svg><figcaption>Blau: Daten ansehen (vor jedem Modell) und die Trainingsschleife (Hyperparameter ändern, erneut validieren). Orange gestrichelt: das Testset. Es wird beim Aufteilen weggelegt und erst in Schritt 9 benutzt.</figcaption></figure>

  <h3>Warum diese Reihenfolge?</h3>
  <ul>
    <li><b>Zuerst aufteilen (2), dann ansehen (3):</b> Alles, was du aus den Daten lernst, beeinflusst deine Entscheidungen. Das Testset soll davon nichts wissen.</li>
    <li><b>EDA vor Modell (3):</b> Sie zeigt, ob Werte fehlen, ob Ausreisser den Mittelwert verzerren, ob die Skalen sehr verschieden sind und ob die Klassen ungleich verteilt sind. Daraus folgen die Schritte 4 bis 7.</li>
    <li><b>Merkmalsauswahl (4):</b> Sie nutzt oft das Ziel (Korrelation, Lasso). Darum gilt sie wie Median und Skaler: nur auf den Trainingsdaten berechnen, am sichersten in jedem Cross-Validation-Durchgang neu.</li>
    <li><b>fit nur auf Train, transform überall (5, 6):</b> Median und Skaler werden aus den Trainingsdaten berechnet und dann auf Validierung und Test angewendet. Sonst fliessen deren Statistiken ins Modell.</li>
    <li><b>Validierung (7):</b> Hier vergleichst du Einstellungen und Modelle. Das Testset bleibt dabei unberührt.</li>
    <li><b>Test (9):</b> Genau einmal, mit dem fertigen Modell und der unveränderten Pipeline.</li>
  </ul>

  <div class="merk"><b>Merksatz</b><p>Alles, was aus Daten gelernt wird (Median, Skaler, Merkmalsauswahl, Modell), wird nur aus den Trainingsdaten gelernt. Das Testset wird einmal am Ende benutzt.</p></div>
  <div class="falle"><b>Falle</b><p>Merkmale oder Skaler auf allen Daten bestimmen und erst danach aufteilen. Die Validierung und der Test sehen dann besser aus, als das Modell wirklich ist.</p></div>
`,

    quiz: [
      { q: 'Warum schaut man die Daten an, bevor man ein Modell trainiert?', a: 'Die EDA zeigt fehlende Werte, Ausreisser, Skalen, Zusammenhänge und Klassenverteilung. Davon hängen Merkmalsauswahl, Vorverarbeitung und Modellwahl ab.' },
      { q: 'Auf welchen Daten macht man die EDA?', a: 'Nur auf den Trainings- und Validierungsdaten (80 %). Das Testset bleibt gesperrt, sonst fliesst Testwissen in die Entscheidungen.' },
      { q: 'Was heisst «fit nur auf Train, transform überall»?', a: 'Median, Skaler und Merkmalsauswahl werden aus den Trainingsdaten berechnet. Mit diesen Werten werden dann auch Validierungs- und Testdaten umgewandelt.' },
      { q: 'Wann darf man das Testset benutzen?', a: 'Genau einmal am Ende, mit dem besten Modell und der fertigen Pipeline.' },
    ],

    notebooks: [{ file: 'Workflow_Train_Val_Test_CV.ipynb', desc: 'Der Ablauf als Code: Split, Pipeline, Cross-Validation' }],
  });
})();
