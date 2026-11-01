/*
 * Overview chapter: one card per model and one checklist per strategy, as a
 * study sheet across the Supervised and Unsupervised chapters. Content only
 * summarises what ml.js, klass.js and unsup.js already explain.
 */
(function () {
  /* One model card. rows = [label, text] pairs; sk = sklearn class; href = chapter link. */
  function card(name, idea, rows, sk, href) {
    return '<div class="sb"><h4>' + name + '</h4><p>' + idea + '</p><dl>' +
      rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') +
      '</dl><div class="sb-f"><code>' + sk + '</code><a href="' + href + '">ausführlich →</a></div></div>';
  }

  const reg = [
    card('Lineare Regression', 'Legt eine Gerade (bei mehreren Merkmalen eine Ebene) so durch die Punkte, dass der mittlere quadrierte Fehler (MSE) am kleinsten ist.', [
      ['Wann', 'Zahl vorhersagen, Zusammenhang etwa linear. Gute erste Baseline.'],
      ['Hyperparameter', 'keine wichtigen'],
      ['Skalieren', 'für das Ergebnis nicht nötig, aber für Gradient Descent und um Koeffizienten zu vergleichen'],
      ['+', 'schnell, Koeffizienten direkt deutbar'],
      ['−', 'nur gerade Zusammenhänge, empfindlich auf Ausreisser'],
    ], 'LinearRegression', '#ml-linreg'),
    card('Polynom-Regression', 'Lineare Regression auf zusätzlichen Merkmalen x², x³ …: Die Kurve darf sich biegen, das Modell bleibt linear in den Gewichten.', [
      ['Wann', 'Zusammenhang ist gekrümmt'],
      ['Hyperparameter', '<code>degree</code> (Grad des Polynoms)'],
      ['Skalieren', 'ja, die Potenzen werden sonst riesig'],
      ['+', 'einfache Erweiterung der Geraden'],
      ['−', 'hoher Grad overfittet stark (Musterbeispiel für Bias/Variance)'],
    ], 'PolynomialFeatures + LinearRegression', '#ml-bv'),
    card('Ridge (L2)', 'Lineare Regression plus Strafe für grosse Gewichte (Summe der Quadrate). Alle Gewichte schrumpfen, keines wird genau 0.', [
      ['Wann', 'viele, teils korrelierte Merkmale; Overfitting'],
      ['Hyperparameter', '<code>alpha</code>: grösser = stärkere Strafe = einfacheres Modell'],
      ['Skalieren', 'ja, sonst trifft die Strafe Merkmale ungleich'],
      ['+', 'stabil bei korrelierten Merkmalen'],
      ['−', 'wählt keine Merkmale aus'],
    ], 'Ridge', '#ml-reg'),
    card('Lasso (L1)', 'Strafe für die Summe der Beträge der Gewichte. Unwichtige Gewichte werden genau 0: eingebaute Feature Selection.', [
      ['Wann', 'viele Merkmale, du vermutest, dass nur wenige zählen'],
      ['Hyperparameter', '<code>alpha</code>'],
      ['Skalieren', 'ja'],
      ['+', 'kleines, gut lesbares Modell'],
      ['−', 'bei korrelierten Merkmalen wird eher zufällig eines behalten'],
    ], 'Lasso', '#ml-reg'),
    card('ElasticNet', 'Mischung aus Ridge und Lasso.', [
      ['Wann', 'Lasso-Auswahl gewünscht, aber Merkmale sind korreliert'],
      ['Hyperparameter', '<code>alpha</code>, <code>l1_ratio</code> (0 = Ridge, 1 = Lasso)'],
      ['Skalieren', 'ja'],
      ['+', 'verbindet beide Vorteile'],
      ['−', 'zwei Hyperparameter zu suchen'],
    ], 'ElasticNet', '#ml-reg'),
  ];

  const klass = [
    card('Logistische Regression', 'Gewichtete Summe der Merkmale, durch die Sigmoid-Funktion in eine Wahrscheinlichkeit zwischen 0 und 1 umgerechnet. Ab einer Schwelle (Standard 0,5) gilt «Klasse 1».', [
      ['Wann', 'Ja/Nein-Fragen, erste Baseline für Klassifikation'],
      ['Hyperparameter', '<code>C</code> (klein = stärker regularisiert), <code>class_weight</code>; die Schwelle wählst du danach'],
      ['Skalieren', 'ja'],
      ['+', 'liefert Wahrscheinlichkeiten, Gewichte deutbar'],
      ['−', 'nur gerade Grenzen'],
    ], 'LogisticRegression', '#klass'),
    card('kNN (k-nächste Nachbarn)', 'Schaut die k ähnlichsten Trainingspunkte an und nimmt deren Mehrheit (bei Regression den Mittelwert). Es gibt kein eigentliches Training.', [
      ['Wann', 'wenige Merkmale, Grenzen beliebig geformt'],
      ['Hyperparameter', '<code>n_neighbors</code> (k): k = 1 overfittet, sehr grosses k underfittet'],
      ['Skalieren', 'unbedingt, es rechnet mit Abständen'],
      ['+', 'einfach, flexible Grenzen'],
      ['−', 'Vorhersage langsam bei vielen Daten, schwach bei vielen Merkmalen'],
    ], 'KNeighborsClassifier', '#klass-modelle'),
    card('Naive Bayes', 'Rechnet mit der Bayes-Regel die Wahrscheinlichkeit jeder Klasse aus und tut dabei so, als wären die Merkmale voneinander unabhängig.', [
      ['Wann', 'sehr schnell eine Baseline, wenig Daten, Text (Wortzählungen)'],
      ['Hyperparameter', 'kaum welche'],
      ['Skalieren', 'nein'],
      ['+', 'extrem schnell, braucht wenig Daten'],
      ['−', 'die Unabhängigkeit stimmt selten, die Wahrscheinlichkeiten sind oft zu extrem'],
    ], 'GaussianNB', '#klass-modelle'),
    card('SVM (Support Vector Machine)', 'Sucht die Grenze mit dem grössten Abstand (Margin) zu den nächsten Punkten beider Klassen. Mit einem Kernel werden auch gebogene Grenzen möglich.', [
      ['Wann', 'mittlere Datenmengen, viele Merkmale'],
      ['Hyperparameter', '<code>C</code> (wie streng Fehler bestraft werden), <code>kernel</code>, <code>gamma</code>'],
      ['Skalieren', 'ja'],
      ['+', 'oft sehr genau, robust bei vielen Merkmalen'],
      ['−', 'langsam bei grossen Daten, schwer zu deuten'],
    ], 'SVC', '#klass-modelle'),
    card('Entscheidungsbaum', 'Stellt nacheinander Ja/Nein-Fragen mit Schwellen («mehr als 74 qm?»). Jeder Split macht die Gruppen möglichst rein (Gini, bei Regression MSE).', [
      ['Wann', 'erklärbare Regeln gefragt, gemischte Merkmalstypen'],
      ['Hyperparameter', '<code>max_depth</code>, <code>min_samples_leaf</code>'],
      ['Skalieren', 'nein'],
      ['+', 'als Regeln lesbar, nicht linear'],
      ['−', 'tiefe Bäume overfitten schnell, kleine Datenänderung = anderer Baum'],
    ], 'DecisionTreeClassifier', '#klass-modelle'),
  ];

  const ens = [
    card('Random Forest (Bagging)', 'Viele Bäume parallel, jeder auf einer Zufallsstichprobe mit Zurücklegen und mit zufälliger Merkmalsauswahl pro Split. Mehrheit oder Mittelwert entscheidet. Senkt die <b>Variance</b>.', [
      ['Wann', 'Tabellendaten, gute Leistung ohne viel Tuning'],
      ['Hyperparameter', '<code>n_estimators</code>, <code>max_depth</code>, <code>max_features</code>'],
      ['Skalieren', 'nein'],
      ['+', 'robust, wenig Overfitting, zeigt Merkmalswichtigkeit'],
      ['−', 'kein einzelner lesbarer Baum mehr, grösser und langsamer'],
    ], 'RandomForestClassifier / …Regressor', '#klass-modelle'),
    card('Gradient Boosting', 'Bäume nacheinander: Jeder neue (flache) Baum lernt die Restfehler aller bisherigen, ein Teil davon (Lernrate) wird addiert. Senkt den <b>Bias</b>.', [
      ['Wann', 'maximale Genauigkeit auf Tabellendaten'],
      ['Hyperparameter', '<code>n_estimators</code>, <code>learning_rate</code>, <code>max_depth</code>'],
      ['Skalieren', 'nein'],
      ['+', 'oft das genaueste Modell auf Tabellen'],
      ['−', 'empfindlich auf Rauschen, braucht mehr Tuning, zu viele Runden overfitten'],
    ], 'GradientBoostingClassifier / …Regressor', '#klass-modelle'),
  ];

  const clu = [
    card('k-Means', 'Setzt k Zentren, ordnet jeden Punkt dem nächsten Zentrum zu, verschiebt die Zentren in den Mittelwert ihrer Punkte und wiederholt das, bis sich nichts mehr ändert.', [
      ['Wann', 'kompakte, etwa runde und ähnlich grosse Gruppen'],
      ['Hyperparameter', '<code>n_clusters</code> (k), <code>n_init</code>, <code>random_state</code>'],
      ['k wählen', 'Elbow (Inertia), Silhouette'],
      ['Skalieren', 'ja'],
      ['+', 'schnell, einfach zu erklären'],
      ['−', 'k vorgeben, nur runde Cluster, Ausreisser verziehen die Zentren'],
    ], 'KMeans', '#unsup-kmeans'),
    card('Hierarchisches Clustering', 'Startet mit jedem Punkt als eigenem Cluster und fügt immer die zwei nächsten zusammen. Das Dendrogramm zeigt alle Stufen, k wählst du nachträglich durch einen Schnitt.', [
      ['Wann', 'kleinere Datensätze, Struktur auf mehreren Ebenen'],
      ['Hyperparameter', '<code>n_clusters</code> oder <code>distance_threshold</code>, <code>linkage</code> (z. B. ward)'],
      ['Skalieren', 'ja'],
      ['+', 'Dendrogramm als Bild der ganzen Struktur'],
      ['−', 'langsam und speicherhungrig bei vielen Punkten'],
    ], 'AgglomerativeClustering', '#unsup-hier'),
    card('DBSCAN', 'Findet dichte Regionen: Ein Punkt mit mindestens <code>min_samples</code> Nachbarn im Radius <code>eps</code> ist ein Kernpunkt. Was keiner dichten Region angehört, wird Rauschen (Label −1).', [
      ['Wann', 'Cluster beliebiger Form, Ausreisser erwartet, k unbekannt'],
      ['Hyperparameter', '<code>eps</code>, <code>min_samples</code>'],
      ['Skalieren', 'ja'],
      ['+', 'kein k nötig, markiert Ausreisser'],
      ['−', 'eps schwer zu wählen, versagt bei unterschiedlich dichten Clustern'],
    ], 'DBSCAN', '#unsup-dbscan'),
    card('GMM (Gaussian Mixture)', 'Beschreibt die Daten als Mischung mehrerer Normalverteilungen. Jeder Punkt gehört mit einer Wahrscheinlichkeit zu jedem Cluster (weiche Zuordnung).', [
      ['Wann', 'längliche (elliptische) Cluster, Unsicherheit der Zuordnung interessiert'],
      ['Hyperparameter', '<code>n_components</code>, <code>covariance_type</code>'],
      ['Skalieren', 'ja'],
      ['+', 'flexiblere Formen als k-Means, Wahrscheinlichkeiten'],
      ['−', 'Anzahl vorgeben, Ergebnis hängt vom Start ab'],
    ], 'GaussianMixture', '#unsup-dbscan'),
  ];

  const ano = [
    card('Isolation Forest', 'Teilt die Daten mit zufälligen Schnitten. Ausreisser sind nach wenigen Schnitten allein, normale Punkte brauchen viele. Kurzer Weg = verdächtig.', [
      ['Wann', 'auffällige Fälle finden (Betrug, Defekte), viele Merkmale'],
      ['Hyperparameter', '<code>contamination</code> (erwarteter Anteil Ausreisser), <code>n_estimators</code>'],
      ['Skalieren', 'nein'],
      ['+', 'schnell, braucht keine Labels'],
      ['−', 'der Anteil muss geschätzt werden; ein Score ist ein Hinweis, kein Beweis'],
    ], 'IsolationForest', '#unsup-anomalie'),
  ];

  const dim = [
    card('PCA', 'Dreht das Koordinatensystem so, dass die erste neue Achse die meiste Streuung erklärt, die zweite die meiste vom Rest usw. Man behält nur die ersten Achsen.', [
      ['Wann', 'viele korrelierte Merkmale verdichten, als Vorverarbeitung oder für ein 2D-Bild'],
      ['Hyperparameter', '<code>n_components</code> (Zahl oder Anteil, z. B. 0.95)'],
      ['Skalieren', 'ja, sonst dominieren Merkmale mit grossen Zahlen'],
      ['+', 'schnell, auf neue Daten anwendbar, <code>explained_variance_ratio_</code> zeigt den Informationsanteil'],
      ['−', 'nur linear, die neuen Achsen sind schwer zu deuten'],
    ], 'PCA', '#unsup-pca'),
    card('t-SNE', 'Legt die Punkte in 2D so hin, dass Nachbarn Nachbarn bleiben. Nicht linear, nur zum Anschauen gedacht.', [
      ['Wann', 'Struktur hochdimensionaler Daten sichtbar machen'],
      ['Hyperparameter', '<code>perplexity</code> (etwa: wie viele Nachbarn zählen)'],
      ['Skalieren', 'ja'],
      ['+', 'zeigt Gruppen oft sehr deutlich'],
      ['−', 'langsam; Abstände zwischen Gruppen und Gruppengrössen bedeuten nichts; nicht auf neue Daten anwendbar'],
    ], 'TSNE', '#unsup-tsne'),
    card('UMAP', 'Ähnlich wie t-SNE, aber schneller und erhält die grobe Gesamtstruktur etwas besser.', [
      ['Wann', 'wie t-SNE, auch für grössere Datensätze'],
      ['Hyperparameter', '<code>n_neighbors</code> (lokal ↔ global), <code>min_dist</code>'],
      ['Skalieren', 'ja'],
      ['+', 'schnell, auf neue Daten anwendbar'],
      ['−', 'Abstände trotzdem nur grob deutbar; eigenes Paket <code>umap-learn</code>'],
    ], 'umap.UMAP', '#unsup-tsne'),
  ];

  function grid(cards) { return '<div class="sbgrid">' + cards.join('') + '</div>'; }

  LernApp.register({
    id: 'uebersicht',
    order: 95,
    nav: 'Übersicht',
    title: 'Alle Modelle und Strategien auf einen Blick',
    kicker: 'Zum Lernen · Module 2 und 3',
    summary: 'Steckbriefe aller Modelle, Checklisten der Strategien und eine Entscheidungshilfe',
    html: `
  <p>Diese Seite fasst die Kapitel <a href="#ml">Supervised ML</a>, <a href="#klass">Klassifikation</a> und <a href="#unsup">Unsupervised</a> zum Lernen zusammen. Zu jedem Modell gibt es einen Steckbrief, zu jeder Strategie eine kurze Checkliste. Über «ausführlich →» kommst du zur Erklärung mit Demo.</p>

  <h3 id="ue-wahl">Welches Modell wann?</h3>
  <div class="ue-tree">
    <div class="ue-q">Gibt es eine Zielspalte <code>y</code> mit der richtigen Antwort?</div>
    <div class="ue-branches">
      <div class="ue-b"><b>Ja → Supervised</b>
        <div class="ue-q">Ist <code>y</code> eine Zahl oder eine Klasse?</div>
        <div class="ue-leaf"><b>Zahl → Regression</b>Start: Lineare Regression. Overfitting → Ridge/Lasso. Gebogen → Polynom, Random Forest, Gradient Boosting.</div>
        <div class="ue-leaf"><b>Klasse → Klassifikation</b>Start: Logistische Regression. Erklärbar → Entscheidungsbaum. Beste Leistung auf Tabellen → Random Forest, Gradient Boosting. Wenige Merkmale, krumme Grenzen → kNN, SVM.</div>
      </div>
      <div class="ue-b"><b>Nein → Unsupervised</b>
        <div class="ue-q">Was willst du finden?</div>
        <div class="ue-leaf"><b>Gruppen → Clustering</b>Runde Gruppen, k bekannt → k-Means. Beliebige Form, Ausreisser → DBSCAN. Struktur auf mehreren Ebenen → Hierarchisch. Weiche Zuordnung → GMM.</div>
        <div class="ue-leaf"><b>Ausreisser → Anomalien</b>Isolation Forest (oder Rauschen bei DBSCAN).</div>
        <div class="ue-leaf"><b>Weniger Merkmale oder ein 2D-Bild → Dimensionsreduktion</b>Verdichten und weiterrechnen → PCA. Nur anschauen → t-SNE, UMAP.</div>
      </div>
    </div>
  </div>
  <div class="merk"><b>Merksatz</b><p>Beginne immer mit einem einfachen Modell als Baseline. Ein komplexeres Modell lohnt sich nur, wenn es auf der Validierung klar besser ist.</p></div>

  <h3 id="ue-tabelle">Die Modelle im Vergleich</h3>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Aufgabe</th><th>Skalieren?</th><th>Erklärbar?</th><th>Wichtigster Regler</th></tr>
    <tr><td>Lineare Regression</td><td>Regression</td><td>nein*</td><td>ja</td><td>–</td></tr>
    <tr><td>Ridge / Lasso</td><td>Regression</td><td>ja</td><td>ja</td><td><code>alpha</code></td></tr>
    <tr><td>Logistische Regression</td><td>Klassifikation</td><td>ja</td><td>ja</td><td><code>C</code>, Schwelle</td></tr>
    <tr><td>kNN</td><td>beides</td><td>ja</td><td>mittel</td><td><code>n_neighbors</code></td></tr>
    <tr><td>Naive Bayes</td><td>Klassifikation</td><td>nein</td><td>mittel</td><td>–</td></tr>
    <tr><td>SVM</td><td>beides</td><td>ja</td><td>nein</td><td><code>C</code>, <code>kernel</code></td></tr>
    <tr><td>Entscheidungsbaum</td><td>beides</td><td>nein</td><td>ja</td><td><code>max_depth</code></td></tr>
    <tr><td>Random Forest</td><td>beides</td><td>nein</td><td>teilweise</td><td><code>n_estimators</code>, <code>max_depth</code></td></tr>
    <tr><td>Gradient Boosting</td><td>beides</td><td>nein</td><td>teilweise</td><td><code>learning_rate</code>, <code>n_estimators</code></td></tr>
    <tr><td>k-Means</td><td>Clustering</td><td>ja</td><td>ja</td><td><code>n_clusters</code></td></tr>
    <tr><td>Hierarchisch</td><td>Clustering</td><td>ja</td><td>ja</td><td><code>linkage</code>, Schnitthöhe</td></tr>
    <tr><td>DBSCAN</td><td>Clustering</td><td>ja</td><td>mittel</td><td><code>eps</code>, <code>min_samples</code></td></tr>
    <tr><td>GMM</td><td>Clustering</td><td>ja</td><td>mittel</td><td><code>n_components</code></td></tr>
    <tr><td>Isolation Forest</td><td>Anomalien</td><td>nein</td><td>mittel</td><td><code>contamination</code></td></tr>
    <tr><td>PCA</td><td>Dim.-Reduktion</td><td>ja</td><td>mittel</td><td><code>n_components</code></td></tr>
    <tr><td>t-SNE / UMAP</td><td>Dim.-Reduktion</td><td>ja</td><td>nein</td><td><code>perplexity</code> / <code>n_neighbors</code></td></tr>
  </table></div>
  <p class="note">* Für das Ergebnis nicht nötig, sobald aber regularisiert oder mit Gradient Descent gelernt wird, schon. Faustregel: Alles, was mit Abständen oder Strafen auf Gewichten rechnet, braucht Skalierung. Bäume nicht.</p>

  <h3 id="ue-reg">Regression</h3>
  ${grid(reg)}

  <h3 id="ue-klass">Klassifikation</h3>
  ${grid(klass)}

  <h3 id="ue-ens">Ensembles</h3>
  ${grid(ens)}

  <h3 id="ue-clu">Clustering</h3>
  ${grid(clu)}

  <h3 id="ue-ano">Anomalien</h3>
  ${grid(ano)}

  <h3 id="ue-dim">Dimensionsreduktion</h3>
  ${grid(dim)}

  <h3 id="ue-strat">Strategien</h3>
  <div class="sbgrid">
    <div class="sb"><h4>Daten vorbereiten</h4><ul>
      <li>Fehlende Werte: Zeilen löschen oder ergänzen (Median, Modus) mit <code>SimpleImputer</code></li>
      <li>Kategorien in Zahlen: <code>OneHotEncoder</code></li>
      <li>Skalieren: <code>StandardScaler</code> (Mittel 0, Streuung 1)</li>
      <li>Alles nur auf den Trainingsdaten lernen (<code>fit</code>), auf Test nur anwenden</li>
    </ul><div class="sb-f"><a href="#ml-prep">ausführlich →</a></div></div>
    <div class="sb"><h4>Train, Validation, Test</h4><ul>
      <li>Test-Set zuerst abtrennen und erst ganz am Schluss einmal benutzen</li>
      <li>Modelle und Hyperparameter auf der Validierung vergleichen</li>
      <li>Cross-Validation: k Läufe mit wechselndem Validierungsteil, Mittelwert ist stabiler</li>
      <li>Bei Klassifikation <code>stratify=y</code>, damit die Klassenanteile gleich bleiben</li>
    </ul><div class="sb-f"><a href="#ml-split">ausführlich →</a></div></div>
    <div class="sb"><h4>Feature Selection</h4><ul>
      <li><b>Filter:</b> Merkmale nach Statistik oder Korrelation bewerten</li>
      <li><b>Wrapper:</b> Modell mit verschiedenen Merkmals-Sets trainieren (z. B. RFE)</li>
      <li><b>Embedded:</b> das Modell wählt selbst (Lasso, Wichtigkeit im Random Forest)</li>
    </ul><div class="sb-f"><a href="#ml-fs">ausführlich →</a></div></div>
    <div class="sb"><h4>Under- und Overfitting erkennen</h4><ul>
      <li><b>Underfitting</b> (hoher Bias): Train und Validierung beide schlecht → komplexeres Modell, mehr Merkmale, weniger Regularisierung</li>
      <li><b>Overfitting</b> (hohe Variance): Train gut, Validierung schlecht → einfacheres Modell, mehr Daten, mehr Regularisierung</li>
    </ul><div class="sb-f"><a href="#ml-bv">ausführlich →</a></div></div>
    <div class="sb"><h4>Regularisierung</h4><ul>
      <li>Strafe für grosse Gewichte gegen Overfitting</li>
      <li>L2 (Ridge) schrumpft, L1 (Lasso) setzt auf 0</li>
      <li>Stärke über <code>alpha</code>, bei der logistischen Regression über <code>C</code> (umgekehrt: kleines C = starke Strafe)</li>
    </ul><div class="sb-f"><a href="#ml-reg">ausführlich →</a></div></div>
    <div class="sb"><h4>Hyperparameter suchen</h4><ul>
      <li>Hyperparameter stellst du ein, Gewichte lernt das Modell</li>
      <li><code>GridSearchCV</code> probiert alle Kombinationen mit Cross-Validation</li>
      <li>Danach mit den besten Werten einmal auf dem Test-Set prüfen</li>
    </ul><div class="sb-f"><a href="#ml-hp">ausführlich →</a></div></div>
    <div class="sb"><h4>Metriken</h4><ul>
      <li><b>Regression:</b> MAE (mittlerer Fehler), RMSE (bestraft grosse Fehler), R² (Anteil erklärter Streuung)</li>
      <li><b>Klassifikation:</b> Confusion Matrix, Accuracy, Precision (wie oft stimmt «positiv»?), Recall (wie viele Positive gefunden?), F1, ROC/AUC</li>
      <li><b>Clustering:</b> Inertia (Elbow), Silhouette (−1 bis 1, höher = besser getrennt), danach Cluster inhaltlich deuten</li>
    </ul><div class="sb-f"><a href="#klass-metriken">ausführlich →</a></div></div>
    <div class="sb"><h4>Unausgewogene Klassen</h4><ul>
      <li>Nicht Accuracy anschauen, sondern Precision, Recall, F1</li>
      <li>Einfachste Lösung: <code>class_weight="balanced"</code></li>
      <li>Sonst Down- oder Upsampling, SMOTE</li>
      <li>Resampling nur auf den Trainingsdaten</li>
      <li>Schwelle an die Kosten von falschem Alarm und verpassten Fällen anpassen</li>
    </ul><div class="sb-f"><a href="#klass">ausführlich →</a></div></div>
    <div class="sb"><h4>Data Leakage vermeiden</h4><ul>
      <li>Keine Information aus dem Test-Set ins Training lassen</li>
      <li>Skalieren, Ergänzen und Auswählen erst nach dem Split, nur mit Trainingsdaten</li>
      <li>Am sichersten: alle Schritte in eine <code>Pipeline</code>, dann macht Cross-Validation es automatisch richtig</li>
      <li>Merkmale, die die Antwort schon verraten, entfernen</li>
    </ul><div class="sb-f"><a href="#klass-leakage">ausführlich →</a></div></div>
  </div>
  <div class="falle"><b>Falle</b><p>Das Test-Set mehrfach zum Vergleichen benutzen. Dann wird es zur zweiten Validierung, und die Endzahl ist zu optimistisch.</p></div>
`,
    quiz: [
      { q: `Train-Fehler klein, Validierungsfehler gross. Was liegt vor und was hilft?`, a: `Overfitting (hohe Variance). Einfacheres Modell, mehr Regularisierung, mehr Daten oder weniger Merkmale.` },
      { q: `Ridge oder Lasso, wenn du am Ende nur wenige Merkmale behalten willst?`, a: `Lasso: Die L1-Strafe setzt unwichtige Gewichte genau auf 0. Ridge schrumpft nur.` },
      { q: `Welche Modelle brauchen keine Skalierung, und warum?`, a: `Baum-Modelle (Entscheidungsbaum, Random Forest, Gradient Boosting, Isolation Forest). Sie vergleichen jedes Merkmal nur mit einer Schwelle, die Grössenordnung spielt keine Rolle.` },
      { q: `Was unterscheidet Bagging von Boosting?`, a: `Bagging (Random Forest) trainiert parallel auf Zufallsstichproben und mittelt, das senkt die Variance. Boosting trainiert nacheinander auf den Restfehlern, das senkt den Bias.` },
      { q: `99 % der Fälle sind negativ. Warum ist Accuracy 99 % nichtssagend?`, a: `«Immer negativ» erreicht das auch, findet aber keinen einzigen positiven Fall. Recall, Precision und F1 zeigen das.` },
      { q: `Wann DBSCAN statt k-Means?`, a: `Wenn die Cluster nicht rund sind, du k nicht kennst oder Ausreisser erwartest. DBSCAN markiert sie als Rauschen (−1).` },
      { q: `Wofür PCA, wofür t-SNE?`, a: `PCA zum Verdichten und Weiterrechnen (linear, auf neue Daten anwendbar). t-SNE nur zum Anschauen; Abstände zwischen den Gruppen bedeuten dort nichts.` },
      { q: `Was ist der Unterschied zwischen Hyperparameter und Parameter?`, a: `Parameter (Gewichte) lernt das Modell aus den Daten. Hyperparameter (z. B. alpha, k, max_depth) legst du vorher fest und suchst sie mit der Validierung.` },
      { q: `Warum gehört der Scaler in eine Pipeline?`, a: `Damit er in jedem Cross-Validation-Lauf nur auf dem Trainingsteil gelernt wird. Sonst sickert Information aus dem Validierungsteil ein (Data Leakage).` },
      { q: `Wie wählst du k bei k-Means?`, a: `Elbow-Methode (Knick in der Inertia-Kurve) und Silhouette-Wert vergleichen, dann prüfen, ob die Cluster inhaltlich Sinn ergeben.` },
    ],
  });
})();
