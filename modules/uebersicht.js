/*
 * Overview chapter: one card per model and one checklist per strategy, as a
 * study sheet across the Supervised and Unsupervised chapters. Content only
 * summarises what ml.js, klass.js and unsup.js already explain.
 * Translated in place: every text is t('deutsch', 'english') via LernApp.t.
 */
(function () {
  const t = LernApp.t;
  const WANN = t('Wann', 'When');
  const HP = 'Hyperparameter';
  const SKAL = t('Skalieren', 'Scaling');
  const JA = t('ja', 'yes');
  const NEIN = t('nein', 'no');
  const BEIDES = t('beides', 'both');
  const MITTEL = t('mittel', 'moderately');
  const TEILS = t('teilweise', 'partly');
  const REGR = 'Regression';
  const KLASS = t('Klassifikation', 'Classification');
  const MEHR = t('ausführlich →', 'in detail →');
  /* Link to the runnable example notebook of a topic (notebooks/beispiele/<file>.ipynb). */
  function bsp(file) {
    return '<a href="notebook.html?nb=beispiele/' + file + '.ipynb">' + t('Beispiele →', 'Examples →') + '</a>';
  }
  let NB = '';

  /* One model card. rows = [label, text] pairs; sk = sklearn class; href = chapter link; NB = example notebook. */
  function card(name, idea, rows, sk, href) {
    return '<div class="sb"><h4>' + name + '</h4><p>' + idea + '</p><dl>' +
      rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') +
      '</dl><div class="sb-f"><code>' + sk + '</code><span><a href="' + href + '">' + MEHR + '</a> ' + bsp(NB) + '</span></div></div>';
  }

  NB = '01_Regression';
  const reg = [
    card(t('Lineare Regression', 'Linear regression'), t('Legt eine Gerade (bei mehreren Merkmalen eine Ebene) so durch die Punkte, dass der mittlere quadrierte Fehler (MSE) am kleinsten ist.', 'Fits a straight line (a plane with several features) through the points so that the mean squared error (MSE) is as small as possible.'), [
      [WANN, t('Zahl vorhersagen, Zusammenhang etwa linear. Gute erste Baseline.', 'Predict a number, relationship roughly linear. Good first baseline.')],
      [HP, t('keine wichtigen', 'none that matter')],
      [SKAL, t('für das Ergebnis nicht nötig, aber für Gradient Descent und um Koeffizienten zu vergleichen', 'not needed for the result, but for gradient descent and to compare coefficients')],
      ['+', t('schnell, Koeffizienten direkt deutbar', 'fast, coefficients directly interpretable')],
      ['−', t('nur gerade Zusammenhänge, empfindlich auf Ausreisser', 'straight-line relationships only, sensitive to outliers')],
    ], 'LinearRegression', '#ml-linreg'),
    card(t('Polynom-Regression', 'Polynomial regression'), t('Lineare Regression auf zusätzlichen Merkmalen x², x³ …: Die Kurve darf sich biegen, das Modell bleibt linear in den Gewichten.', 'Linear regression on extra features x², x³ …: the curve may bend, the model stays linear in the weights.'), [
      [WANN, t('Zusammenhang ist gekrümmt', 'the relationship is curved')],
      [HP, t('<code>degree</code> (Grad des Polynoms)', '<code>degree</code> (degree of the polynomial)')],
      [SKAL, t('ja, die Potenzen werden sonst riesig', 'yes, otherwise the powers become huge')],
      ['+', t('einfache Erweiterung der Geraden', 'simple extension of the straight line')],
      ['−', t('hoher Grad overfittet stark (Musterbeispiel für Bias/Variance)', 'a high degree overfits badly (textbook example of bias/variance)')],
    ], 'PolynomialFeatures + LinearRegression', '#ml-bv'),
    card('Ridge (L2)', t('Lineare Regression plus Strafe für grosse Gewichte (Summe der Quadrate). Alle Gewichte schrumpfen, keines wird genau 0.', 'Linear regression plus a penalty on large weights (sum of squares). All weights shrink, none becomes exactly 0.'), [
      [WANN, t('viele, teils korrelierte Merkmale; Overfitting', 'many, partly correlated features; overfitting')],
      [HP, t('<code>alpha</code>: grösser = stärkere Strafe = einfacheres Modell', '<code>alpha</code>: larger = stronger penalty = simpler model')],
      [SKAL, t('ja, sonst trifft die Strafe Merkmale ungleich', 'yes, otherwise the penalty hits features unequally')],
      ['+', t('stabil bei korrelierten Merkmalen', 'stable with correlated features')],
      ['−', t('wählt keine Merkmale aus', 'does not select features')],
    ], 'Ridge', '#ml-reg'),
    card('Lasso (L1)', t('Strafe für die Summe der Beträge der Gewichte. Unwichtige Gewichte werden genau 0: eingebaute Feature Selection.', 'Penalty on the sum of the absolute values of the weights. Unimportant weights become exactly 0: built-in feature selection.'), [
      [WANN, t('viele Merkmale, du vermutest, dass nur wenige zählen', 'many features, you suspect only a few matter')],
      [HP, '<code>alpha</code>'],
      [SKAL, JA],
      ['+', t('kleines, gut lesbares Modell', 'small, easy-to-read model')],
      ['−', t('bei korrelierten Merkmalen wird eher zufällig eines behalten', 'with correlated features, which one is kept is rather random')],
    ], 'Lasso', '#ml-reg'),
    card('ElasticNet', t('Mischung aus Ridge und Lasso.', 'Mix of Ridge and Lasso.'), [
      [WANN, t('Lasso-Auswahl gewünscht, aber Merkmale sind korreliert', 'Lasso selection wanted, but features are correlated')],
      [HP, '<code>alpha</code>, <code>l1_ratio</code> (0 = Ridge, 1 = Lasso)'],
      [SKAL, JA],
      ['+', t('verbindet beide Vorteile', 'combines the advantages of both')],
      ['−', t('zwei Hyperparameter zu suchen', 'two hyperparameters to search')],
    ], 'ElasticNet', '#ml-reg'),
  ];

  NB = '02_Klassifikation';
  const klass = [
    card(t('Logistische Regression', 'Logistic regression'), t('Gewichtete Summe der Merkmale, durch die Sigmoid-Funktion in eine Wahrscheinlichkeit zwischen 0 und 1 umgerechnet. Ab einer Schwelle (Standard 0,5) gilt «Klasse 1».', 'Weighted sum of the features, converted by the sigmoid function into a probability between 0 and 1. Above a threshold (default 0.5) it counts as “class 1”.'), [
      [WANN, t('Ja/Nein-Fragen, erste Baseline für Klassifikation', 'yes/no questions, first baseline for classification')],
      [HP, t('<code>C</code> (klein = stärker regularisiert), <code>class_weight</code>; die Schwelle wählst du danach', '<code>C</code> (small = stronger regularisation), <code>class_weight</code>; you choose the threshold afterwards')],
      [SKAL, JA],
      ['+', t('liefert Wahrscheinlichkeiten, Gewichte deutbar', 'gives probabilities, weights interpretable')],
      ['−', t('nur gerade Grenzen', 'straight boundaries only')],
    ], 'LogisticRegression', '#klass'),
    card(t('kNN (k-nächste Nachbarn)', 'kNN (k-nearest neighbours)'), t('Schaut die k ähnlichsten Trainingspunkte an und nimmt deren Mehrheit (bei Regression den Mittelwert). Es gibt kein eigentliches Training.', 'Looks at the k most similar training points and takes their majority (the mean for regression). There is no actual training.'), [
      [WANN, t('wenige Merkmale, Grenzen beliebig geformt', 'few features, boundaries of any shape')],
      [HP, t('<code>n_neighbors</code> (k): k = 1 overfittet, sehr grosses k underfittet', '<code>n_neighbors</code> (k): k = 1 overfits, a very large k underfits')],
      [SKAL, t('unbedingt, es rechnet mit Abständen', 'absolutely, it works with distances')],
      ['+', t('einfach, flexible Grenzen', 'simple, flexible boundaries')],
      ['−', t('Vorhersage langsam bei vielen Daten, schwach bei vielen Merkmalen', 'prediction slow with lots of data, weak with many features')],
    ], 'KNeighborsClassifier', '#klass-modelle'),
    card('Naive Bayes', t('Rechnet mit der Bayes-Regel die Wahrscheinlichkeit jeder Klasse aus und tut dabei so, als wären die Merkmale voneinander unabhängig.', 'Uses Bayes’ rule to compute the probability of each class, pretending the features are independent of each other.'), [
      [WANN, t('sehr schnell eine Baseline, wenig Daten, Text (Wortzählungen)', 'a baseline very quickly, little data, text (word counts)')],
      [HP, t('kaum welche', 'hardly any')],
      [SKAL, NEIN],
      ['+', t('extrem schnell, braucht wenig Daten', 'extremely fast, needs little data')],
      ['−', t('die Unabhängigkeit stimmt selten, die Wahrscheinlichkeiten sind oft zu extrem', 'independence rarely holds, the probabilities are often too extreme')],
    ], 'GaussianNB', '#klass-modelle'),
    card('SVM (Support Vector Machine)', t('Sucht die Grenze mit dem grössten Abstand (Margin) zu den nächsten Punkten beider Klassen. Mit einem Kernel werden auch gebogene Grenzen möglich.', 'Looks for the boundary with the largest distance (margin) to the nearest points of both classes. With a kernel, curved boundaries become possible too.'), [
      [WANN, t('mittlere Datenmengen, viele Merkmale', 'medium amounts of data, many features')],
      [HP, t('<code>C</code> (wie streng Fehler bestraft werden), <code>kernel</code>, <code>gamma</code>', '<code>C</code> (how strictly errors are penalised), <code>kernel</code>, <code>gamma</code>')],
      [SKAL, JA],
      ['+', t('oft sehr genau, robust bei vielen Merkmalen', 'often very accurate, robust with many features')],
      ['−', t('langsam bei grossen Daten, schwer zu deuten', 'slow with large data, hard to interpret')],
    ], 'SVC', '#klass-modelle'),
    card(t('Entscheidungsbaum', 'Decision tree'), t('Stellt nacheinander Ja/Nein-Fragen mit Schwellen («mehr als 74 qm?»). Jeder Split macht die Gruppen möglichst rein (Gini, bei Regression MSE).', 'Asks yes/no questions with thresholds one after another (“more than 74 m²?”). Each split makes the groups as pure as possible (Gini, MSE for regression).'), [
      [WANN, t('erklärbare Regeln gefragt, gemischte Merkmalstypen', 'explainable rules needed, mixed feature types')],
      [HP, '<code>max_depth</code>, <code>min_samples_leaf</code>'],
      [SKAL, NEIN],
      ['+', t('als Regeln lesbar, nicht linear', 'readable as rules, non-linear')],
      ['−', t('tiefe Bäume overfitten schnell, kleine Datenänderung = anderer Baum', 'deep trees overfit quickly, small change in the data = different tree')],
    ], 'DecisionTreeClassifier', '#klass-modelle'),
  ];

  NB = '03_Ensembles';
  const ens = [
    card('Random Forest (Bagging)', t('Viele Bäume parallel, jeder auf einer Zufallsstichprobe mit Zurücklegen und mit zufälliger Merkmalsauswahl pro Split. Mehrheit oder Mittelwert entscheidet. Senkt die <b>Variance</b>.', 'Many trees in parallel, each on a random sample with replacement and with a random choice of features per split. Majority or mean decides. Lowers the <b>variance</b>.'), [
      [WANN, t('Tabellendaten, gute Leistung ohne viel Tuning', 'tabular data, good performance without much tuning')],
      [HP, '<code>n_estimators</code>, <code>max_depth</code>, <code>max_features</code>'],
      [SKAL, NEIN],
      ['+', t('robust, wenig Overfitting, zeigt Merkmalswichtigkeit', 'robust, little overfitting, shows feature importance')],
      ['−', t('kein einzelner lesbarer Baum mehr, grösser und langsamer', 'no single readable tree any more, larger and slower')],
    ], 'RandomForestClassifier / …Regressor', '#klass-modelle'),
    card('Gradient Boosting', t('Bäume nacheinander: Jeder neue (flache) Baum lernt die Restfehler aller bisherigen, ein Teil davon (Lernrate) wird addiert. Senkt den <b>Bias</b>.', 'Trees one after another: each new (shallow) tree learns the remaining errors of all previous ones, and a fraction of it (learning rate) is added. Lowers the <b>bias</b>.'), [
      [WANN, t('maximale Genauigkeit auf Tabellendaten', 'maximum accuracy on tabular data')],
      [HP, '<code>n_estimators</code>, <code>learning_rate</code>, <code>max_depth</code>'],
      [SKAL, NEIN],
      ['+', t('oft das genaueste Modell auf Tabellen', 'often the most accurate model on tables')],
      ['−', t('empfindlich auf Rauschen, braucht mehr Tuning, zu viele Runden overfitten', 'sensitive to noise, needs more tuning, too many rounds overfit')],
    ], 'GradientBoostingClassifier / …Regressor', '#klass-modelle'),
  ];

  NB = '04_Clustering_Anomalien';
  const clu = [
    card('k-Means', t('Setzt k Zentren, ordnet jeden Punkt dem nächsten Zentrum zu, verschiebt die Zentren in den Mittelwert ihrer Punkte und wiederholt das, bis sich nichts mehr ändert.', 'Places k centres, assigns each point to the nearest centre, moves the centres to the mean of their points and repeats until nothing changes any more.'), [
      [WANN, t('kompakte, etwa runde und ähnlich grosse Gruppen', 'compact, roughly round groups of similar size')],
      [HP, '<code>n_clusters</code> (k), <code>n_init</code>, <code>random_state</code>'],
      [t('k wählen', 'Choosing k'), 'Elbow (Inertia), Silhouette'],
      [SKAL, JA],
      ['+', t('schnell, einfach zu erklären', 'fast, easy to explain')],
      ['−', t('k vorgeben, nur runde Cluster, Ausreisser verziehen die Zentren', 'k must be given, round clusters only, outliers pull the centres')],
    ], 'KMeans', '#unsup-kmeans'),
    card(t('Hierarchisches Clustering', 'Hierarchical clustering'), t('Startet mit jedem Punkt als eigenem Cluster und fügt immer die zwei nächsten zusammen. Das Dendrogramm zeigt alle Stufen, k wählst du nachträglich durch einen Schnitt.', 'Starts with each point as its own cluster and always merges the two closest. The dendrogram shows all levels; you choose k afterwards with a cut.'), [
      [WANN, t('kleinere Datensätze, Struktur auf mehreren Ebenen', 'smaller datasets, structure on several levels')],
      [HP, t('<code>n_clusters</code> oder <code>distance_threshold</code>, <code>linkage</code> (z. B. ward)', '<code>n_clusters</code> or <code>distance_threshold</code>, <code>linkage</code> (e.g. ward)')],
      [SKAL, JA],
      ['+', t('Dendrogramm als Bild der ganzen Struktur', 'dendrogram as a picture of the whole structure')],
      ['−', t('langsam und speicherhungrig bei vielen Punkten', 'slow and memory-hungry with many points')],
    ], 'AgglomerativeClustering', '#unsup-hier'),
    card('DBSCAN', t('Findet dichte Regionen: Ein Punkt, in dessen Radius <code>eps</code> mindestens <code>min_samples</code> Punkte liegen (er selbst mitgezählt), ist ein Kernpunkt. Was keiner dichten Region angehört, wird Rauschen (Label −1).', 'Finds dense regions: a point with at least <code>min_samples</code> points within radius <code>eps</code> (counting itself) is a core point. Whatever belongs to no dense region becomes noise (label −1).'), [
      [WANN, t('Cluster beliebiger Form, Ausreisser erwartet, k unbekannt', 'clusters of any shape, outliers expected, k unknown')],
      [HP, '<code>eps</code>, <code>min_samples</code>'],
      [SKAL, JA],
      ['+', t('kein k nötig, markiert Ausreisser', 'no k needed, marks outliers')],
      ['−', t('eps schwer zu wählen, versagt bei unterschiedlich dichten Clustern', 'eps hard to choose, fails with clusters of different density')],
    ], 'DBSCAN', '#unsup-dbscan'),
    card('GMM (Gaussian Mixture)', t('Beschreibt die Daten als Mischung mehrerer Normalverteilungen. Jeder Punkt gehört mit einer Wahrscheinlichkeit zu jedem Cluster (weiche Zuordnung).', 'Describes the data as a mixture of several normal distributions. Each point belongs to each cluster with a probability (soft assignment).'), [
      [WANN, t('längliche (elliptische) Cluster, Unsicherheit der Zuordnung interessiert', 'elongated (elliptical) clusters, the uncertainty of the assignment matters')],
      [HP, '<code>n_components</code>, <code>covariance_type</code>'],
      [SKAL, JA],
      ['+', t('flexiblere Formen als k-Means, Wahrscheinlichkeiten', 'more flexible shapes than k-Means, probabilities')],
      ['−', t('Anzahl vorgeben, Ergebnis hängt vom Start ab', 'number must be given, result depends on the start')],
    ], 'GaussianMixture', '#unsup-dbscan'),
  ];

  NB = '04_Clustering_Anomalien';
  const ano = [
    card('Isolation Forest', t('Teilt die Daten mit zufälligen Schnitten. Ausreisser sind nach wenigen Schnitten allein, normale Punkte brauchen viele. Kurzer Weg = verdächtig.', 'Splits the data with random cuts. Outliers are isolated after a few cuts, normal points need many. Short path = suspicious.'), [
      [WANN, t('auffällige Fälle finden (Betrug, Defekte), viele Merkmale', 'finding unusual cases (fraud, defects), many features')],
      [HP, t('<code>n_estimators</code>; <code>contamination</code> setzt nur die Schwelle für <code>predict</code>, die Rangliste der Scores ändert sich nicht', '<code>n_estimators</code>; <code>contamination</code> only sets the threshold for <code>predict</code>, the ranking of the scores does not change')],
      [SKAL, NEIN],
      ['+', t('schnell, braucht keine Labels', 'fast, needs no labels')],
      ['−', t('Schwelle oder Prüf-Budget (Top-N) musst du selbst festlegen; ein Score ist ein Hinweis, kein Beweis', 'you have to set the threshold or review budget (top N) yourself; a score is a hint, not proof')],
    ], 'IsolationForest', '#unsup-anomalie'),
  ];

  NB = '05_Dimensionsreduktion';
  const dim = [
    card('PCA', t('Dreht das Koordinatensystem so, dass die erste neue Achse die meiste Streuung erklärt, die zweite die meiste vom Rest usw. Man behält nur die ersten Achsen.', 'Rotates the coordinate system so that the first new axis explains the most spread, the second the most of the rest, and so on. You keep only the first axes.'), [
      [WANN, t('viele korrelierte Merkmale verdichten, als Vorverarbeitung oder für ein 2D-Bild', 'compress many correlated features, as preprocessing or for a 2D picture')],
      [HP, t('<code>n_components</code> (Zahl oder Anteil, z. B. 0.95)', '<code>n_components</code> (number or share, e.g. 0.95)')],
      [SKAL, t('ja, sonst dominieren Merkmale mit grossen Zahlen', 'yes, otherwise features with large numbers dominate')],
      ['+', t('schnell, auf neue Daten anwendbar, <code>explained_variance_ratio_</code> zeigt den Informationsanteil', 'fast, applicable to new data, <code>explained_variance_ratio_</code> shows the share of information')],
      ['−', t('nur linear, die neuen Achsen sind schwer zu deuten', 'linear only, the new axes are hard to interpret')],
    ], 'PCA', '#unsup-pca'),
    card('t-SNE', t('Legt die Punkte in 2D so hin, dass Nachbarn Nachbarn bleiben. Nicht linear, nur zum Anschauen gedacht.', 'Lays the points out in 2D so that neighbours stay neighbours. Non-linear, meant only for looking.'), [
      [WANN, t('Struktur hochdimensionaler Daten sichtbar machen', 'make the structure of high-dimensional data visible')],
      [HP, t('<code>perplexity</code> (etwa: wie viele Nachbarn zählen)', '<code>perplexity</code> (roughly: how many neighbours count)')],
      [SKAL, JA],
      ['+', t('zeigt Gruppen oft sehr deutlich', 'often shows groups very clearly')],
      ['−', t('langsam; Abstände zwischen Gruppen und Gruppengrössen bedeuten nichts; nicht auf neue Daten anwendbar', 'slow; distances between groups and group sizes mean nothing; not applicable to new data')],
    ], 'TSNE', '#unsup-tsne'),
    card('UMAP', t('Ähnlich wie t-SNE, aber schneller und erhält die grobe Gesamtstruktur etwas besser.', 'Similar to t-SNE, but faster, and preserves the rough overall structure somewhat better.'), [
      [WANN, t('wie t-SNE, auch für grössere Datensätze', 'like t-SNE, also for larger datasets')],
      [HP, t('<code>n_neighbors</code> (lokal ↔ global), <code>min_dist</code>', '<code>n_neighbors</code> (local ↔ global), <code>min_dist</code>')],
      [SKAL, JA],
      ['+', t('schnell, auf neue Daten anwendbar', 'fast, applicable to new data')],
      ['−', t('Abstände trotzdem nur grob deutbar; eigenes Paket <code>umap-learn</code>', 'distances still only roughly interpretable; separate package <code>umap-learn</code>')],
    ], 'umap.UMAP', '#unsup-tsne'),
  ];

  function grid(cards) { return '<div class="sbgrid">' + cards.join('') + '</div>'; }

  LernApp.register({
    id: 'uebersicht',
    order: 95,
    nav: t('Übersicht', 'Overview'),
    title: t('Alle Modelle und Strategien auf einen Blick', 'All models and strategies at a glance'),
    kicker: t('Zum Lernen · Module 2 und 3', 'For revision · Modules 2 and 3'),
    summary: t('Steckbriefe aller Modelle, Checklisten der Strategien und eine Entscheidungshilfe', 'Profiles of all models, strategy checklists and a decision guide'),
    html: `
  <p>${t('Diese Seite fasst die Kapitel <a href="#ml">Supervised ML</a>, <a href="#klass">Klassifikation</a> und <a href="#unsup">Unsupervised</a> zum Lernen zusammen. Zu jedem Modell gibt es einen Steckbrief, zu jeder Strategie eine kurze Checkliste. Über «ausführlich →» kommst du zur Erklärung mit Demo, über «Beispiele →» zu einem Notebook mit lauffähigem Code (lokal mit Jupyter oder in Google Colab).', 'This page summarises the chapters <a href="#ml">Supervised ML</a>, <a href="#klass">Classification</a> and <a href="#unsup">Unsupervised</a> for revision. Each model has a profile, each strategy a short checklist. “in detail →” takes you to the explanation with a demo, “Examples →” to a notebook with runnable code (locally with Jupyter or in Google Colab).')}</p>

  <h3 id="ue-wahl">${t('Welches Modell wann?', 'Which model when?')}</h3>
  <div class="ue-tree">
    <div class="ue-q">${t('Gibt es eine Zielspalte <code>y</code> mit der richtigen Antwort?', 'Is there a target column <code>y</code> with the right answer?')}</div>
    <div class="ue-branches">
      <div class="ue-b"><b>${t('Ja → Supervised', 'Yes → Supervised')}</b>
        <div class="ue-q">${t('Ist <code>y</code> eine Zahl oder eine Klasse?', 'Is <code>y</code> a number or a class?')}</div>
        <div class="ue-leaf">${t('<b>Zahl → Regression</b>Start: Lineare Regression. Overfitting → Ridge/Lasso. Gebogen → Polynom, Random Forest, Gradient Boosting.', '<b>Number → Regression</b>Start: linear regression. Overfitting → Ridge/Lasso. Curved → polynomial, Random Forest, Gradient Boosting.')}</div>
        <div class="ue-leaf">${t('<b>Klasse → Klassifikation</b>Start: Logistische Regression. Erklärbar → Entscheidungsbaum. Beste Leistung auf Tabellen → Random Forest, Gradient Boosting. Krumme Grenzen → kNN (wenige Merkmale) oder SVM mit Kernel (auch viele Merkmale).', '<b>Class → Classification</b>Start: logistic regression. Explainable → decision tree. Best performance on tables → Random Forest, Gradient Boosting. Curved boundaries → kNN (few features) or SVM with a kernel (also many features).')}</div>
      </div>
      <div class="ue-b"><b>${t('Nein → Unsupervised', 'No → Unsupervised')}</b>
        <div class="ue-q">${t('Was willst du finden?', 'What do you want to find?')}</div>
        <div class="ue-leaf">${t('<b>Gruppen → Clustering</b>Runde Gruppen, k bekannt → k-Means. Beliebige Form, Ausreisser → DBSCAN. Struktur auf mehreren Ebenen → Hierarchisch. Weiche Zuordnung → GMM.', '<b>Groups → Clustering</b>Round groups, k known → k-Means. Any shape, outliers → DBSCAN. Structure on several levels → hierarchical. Soft assignment → GMM.')}</div>
        <div class="ue-leaf">${t('<b>Ausreisser → Anomalien</b>Isolation Forest (oder Rauschen bei DBSCAN).', '<b>Outliers → Anomalies</b>Isolation Forest (or noise in DBSCAN).')}</div>
        <div class="ue-leaf">${t('<b>Weniger Merkmale oder ein 2D-Bild → Dimensionsreduktion</b>Verdichten und weiterrechnen → PCA. Nur anschauen → t-SNE, UMAP.', '<b>Fewer features or a 2D picture → Dimensionality reduction</b>Compress and keep computing → PCA. Just look → t-SNE, UMAP.')}</div>
      </div>
    </div>
  </div>
  <div class="merk">${t('<b>Merksatz</b><p>Beginne immer mit einem einfachen Modell als Baseline. Ein komplexeres Modell lohnt sich nur, wenn es auf der Validierung klar besser ist.</p>', '<b>Key takeaway</b><p>Always start with a simple model as a baseline. A more complex model is only worth it if it is clearly better on the validation set.</p>')}</div>

  <h3 id="ue-tabelle">${t('Die Modelle im Vergleich', 'The models compared')}</h3>
  <div class="tablewrap"><table>
    <tr>${t('<th>Modell</th><th>Aufgabe</th><th>Skalieren?</th><th>Erklärbar?</th><th>Wichtigster Regler</th>', '<th>Model</th><th>Task</th><th>Scaling?</th><th>Explainable?</th><th>Most important knob</th>')}</tr>
    <tr><td>${t('Lineare Regression', 'Linear regression')}</td><td>${REGR}</td><td>${NEIN}*</td><td>${JA}</td><td>–</td></tr>
    <tr><td>Ridge / Lasso</td><td>${REGR}</td><td>${JA}</td><td>${JA}</td><td><code>alpha</code></td></tr>
    <tr><td>${t('Logistische Regression', 'Logistic regression')}</td><td>${KLASS}</td><td>${JA}</td><td>${JA}</td><td><code>C</code>, ${t('Schwelle', 'threshold')}</td></tr>
    <tr><td>kNN</td><td>${BEIDES}</td><td>${JA}</td><td>${MITTEL}</td><td><code>n_neighbors</code></td></tr>
    <tr><td>Naive Bayes</td><td>${KLASS}</td><td>${NEIN}</td><td>${MITTEL}</td><td>–</td></tr>
    <tr><td>SVM</td><td>${BEIDES}</td><td>${JA}</td><td>${NEIN}</td><td><code>C</code>, <code>kernel</code></td></tr>
    <tr><td>${t('Entscheidungsbaum', 'Decision tree')}</td><td>${BEIDES}</td><td>${NEIN}</td><td>${JA}</td><td><code>max_depth</code></td></tr>
    <tr><td>Random Forest</td><td>${BEIDES}</td><td>${NEIN}</td><td>${TEILS}</td><td><code>n_estimators</code>, <code>max_depth</code></td></tr>
    <tr><td>Gradient Boosting</td><td>${BEIDES}</td><td>${NEIN}</td><td>${TEILS}</td><td><code>learning_rate</code>, <code>n_estimators</code></td></tr>
    <tr><td>k-Means</td><td>Clustering</td><td>${JA}</td><td>${JA}</td><td><code>n_clusters</code></td></tr>
    <tr><td>${t('Hierarchisch', 'Hierarchical')}</td><td>Clustering</td><td>${JA}</td><td>${JA}</td><td><code>linkage</code>, ${t('Schnitthöhe', 'cut height')}</td></tr>
    <tr><td>DBSCAN</td><td>Clustering</td><td>${JA}</td><td>${MITTEL}</td><td><code>eps</code>, <code>min_samples</code></td></tr>
    <tr><td>GMM</td><td>Clustering</td><td>${JA}</td><td>${MITTEL}</td><td><code>n_components</code></td></tr>
    <tr><td>Isolation Forest</td><td>${t('Anomalien', 'Anomalies')}</td><td>${NEIN}</td><td>${MITTEL}</td><td>${t('Prüf-Budget (Top-N)', 'review budget (top N)')}</td></tr>
    <tr><td>PCA</td><td>${t('Dim.-Reduktion', 'Dim. reduction')}</td><td>${JA}</td><td>${MITTEL}</td><td><code>n_components</code></td></tr>
    <tr><td>t-SNE / UMAP</td><td>${t('Dim.-Reduktion', 'Dim. reduction')}</td><td>${JA}</td><td>${NEIN}</td><td><code>perplexity</code> / <code>n_neighbors</code></td></tr>
  </table></div>
  <p class="note">${t('* Für das Ergebnis nicht nötig, sobald aber regularisiert oder mit Gradient Descent gelernt wird, schon. Faustregel: Alles, was mit Abständen oder Strafen auf Gewichten rechnet, braucht Skalierung. Bäume nicht.', '* Not needed for the result, but needed as soon as you regularise or train with gradient descent. Rule of thumb: anything that works with distances or penalties on weights needs scaling. Trees do not.')}</p>

  <h3 id="ue-reg">Regression</h3>
  ${grid(reg)}

  <h3 id="ue-klass">${KLASS}</h3>
  ${grid(klass)}

  <h3 id="ue-ens">Ensembles</h3>
  ${grid(ens)}

  <h3 id="ue-clu">Clustering</h3>
  ${grid(clu)}

  <h3 id="ue-ano">${t('Anomalien', 'Anomalies')}</h3>
  ${grid(ano)}

  <h3 id="ue-dim">${t('Dimensionsreduktion', 'Dimensionality reduction')}</h3>
  ${grid(dim)}

  <h3 id="ue-strat">${t('Strategien', 'Strategies')}</h3>
  <div class="sbgrid">
    <div class="sb"><h4>${t('Daten vorbereiten', 'Preparing the data')}</h4><ul>
      <li>${t('Fehlende Werte: Zeilen löschen oder ergänzen (Median, Modus) mit <code>SimpleImputer</code>', 'Missing values: drop rows or fill them in (median, mode) with <code>SimpleImputer</code>')}</li>
      <li>${t('Kategorien in Zahlen: <code>OneHotEncoder</code>', 'Categories into numbers: <code>OneHotEncoder</code>')}</li>
      <li>${t('Skalieren: <code>StandardScaler</code> (Mittel 0, Streuung 1)', 'Scaling: <code>StandardScaler</code> (mean 0, spread 1)')}</li>
      <li>${t('Alles nur auf den Trainingsdaten lernen (<code>fit</code>), auf Test nur anwenden', 'Learn everything on the training data only (<code>fit</code>), only apply it to test')}</li>
    </ul><div class="sb-f"><a href="#ml-prep">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>Train, Validation, Test</h4><ul>
      <li>${t('Test-Set zuerst abtrennen und erst ganz am Schluss einmal benutzen', 'Split off the test set first and use it only once, at the very end')}</li>
      <li>${t('Modelle und Hyperparameter auf der Validierung vergleichen', 'Compare models and hyperparameters on the validation set')}</li>
      <li>${t('Cross-Validation: k Läufe mit wechselndem Validierungsteil, Mittelwert ist stabiler', 'Cross-Validation: k runs with a changing validation part, the mean is more stable')}</li>
      <li>${t('Bei Klassifikation <code>stratify=y</code>, damit die Klassenanteile gleich bleiben', 'For classification <code>stratify=y</code>, so the class proportions stay the same')}</li>
    </ul><div class="sb-f"><a href="#ml-split">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>Feature Selection</h4><ul>
      <li>${t('<b>Filter:</b> Merkmale nach Statistik oder Korrelation bewerten', '<b>Filter:</b> rate features by statistics or correlation')}</li>
      <li>${t('<b>Wrapper:</b> Modell mit verschiedenen Merkmals-Sets trainieren (z. B. RFE)', '<b>Wrapper:</b> train the model with different feature sets (e.g. RFE)')}</li>
      <li>${t('<b>Embedded:</b> das Modell wählt selbst (Lasso, Wichtigkeit im Random Forest)', '<b>Embedded:</b> the model chooses itself (Lasso, importance in the Random Forest)')}</li>
    </ul><div class="sb-f"><a href="#ml-fs">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Under- und Overfitting erkennen', 'Spotting underfitting and overfitting')}</h4><ul>
      <li>${t('<b>Underfitting</b> (hoher Bias): Train und Validierung beide schlecht → komplexeres Modell, mehr Merkmale, weniger Regularisierung', '<b>Underfitting</b> (high bias): train and validation both poor → more complex model, more features, less regularisation')}</li>
      <li>${t('<b>Overfitting</b> (hohe Variance): Train gut, Validierung schlecht → einfacheres Modell, mehr Daten, mehr Regularisierung', '<b>Overfitting</b> (high variance): train good, validation poor → simpler model, more data, more regularisation')}</li>
    </ul><div class="sb-f"><a href="#ml-bv">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Regularisierung', 'Regularisation')}</h4><ul>
      <li>${t('Strafe für grosse Gewichte gegen Overfitting', 'Penalty on large weights against overfitting')}</li>
      <li>${t('L2 (Ridge) schrumpft, L1 (Lasso) setzt auf 0', 'L2 (Ridge) shrinks, L1 (Lasso) sets to 0')}</li>
      <li>${t('Stärke über <code>alpha</code>, bei der logistischen Regression über <code>C</code> (umgekehrt: kleines C = starke Strafe)', 'Strength via <code>alpha</code>, for logistic regression via <code>C</code> (reversed: small C = strong penalty)')}</li>
    </ul><div class="sb-f"><a href="#ml-reg">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Hyperparameter suchen', 'Searching hyperparameters')}</h4><ul>
      <li>${t('Hyperparameter stellst du ein, Gewichte lernt das Modell', 'You set the hyperparameters, the model learns the weights')}</li>
      <li>${t('<code>GridSearchCV</code> probiert alle Kombinationen mit Cross-Validation', '<code>GridSearchCV</code> tries all combinations with Cross-Validation')}</li>
      <li>${t('Danach mit den besten Werten einmal auf dem Test-Set prüfen', 'Then check once on the test set with the best values')}</li>
    </ul><div class="sb-f"><a href="#ml-hp">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Metriken', 'Metrics')}</h4><ul>
      <li>${t('<b>Regression:</b> MAE (mittlerer Fehler), RMSE (bestraft grosse Fehler), R² (Anteil erklärter Streuung)', '<b>Regression:</b> MAE (mean error), RMSE (penalises large errors), R² (share of explained spread)')}</li>
      <li>${t('<b>Klassifikation:</b> Confusion Matrix, Accuracy, Precision (wie oft stimmt «positiv»?), Recall (wie viele Positive gefunden?), F1, ROC/AUC', '<b>Classification:</b> confusion matrix, accuracy, precision (how often is “positive” right?), recall (how many positives found?), F1, ROC/AUC')}</li>
      <li>${t('<b>Clustering:</b> Inertia (Elbow), Silhouette (−1 bis 1, höher = besser getrennt), danach Cluster inhaltlich deuten', '<b>Clustering:</b> inertia (elbow), silhouette (−1 to 1, higher = better separated), then interpret the clusters by content')}</li>
    </ul><div class="sb-f"><a href="#klass-metriken">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Unausgewogene Klassen', 'Imbalanced classes')}</h4><ul>
      <li>${t('Nicht Accuracy anschauen, sondern Precision, Recall, F1', 'Do not look at accuracy, but at precision, recall, F1')}</li>
      <li>${t('Einfachste Lösung: <code>class_weight="balanced"</code>', 'Simplest solution: <code>class_weight="balanced"</code>')}</li>
      <li>${t('Sonst Down- oder Upsampling, SMOTE', 'Otherwise downsampling or upsampling, SMOTE')}</li>
      <li>${t('Resampling nur auf den Trainingsdaten', 'Resampling only on the training data')}</li>
      <li>${t('Schwelle an die Kosten von falschem Alarm und verpassten Fällen anpassen', 'Adjust the threshold to the cost of false alarms and missed cases')}</li>
    </ul><div class="sb-f"><a href="#klass">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Data Leakage vermeiden', 'Avoiding data leakage')}</h4><ul>
      <li>${t('Keine Information aus dem Test-Set ins Training lassen', 'Let no information from the test set into training')}</li>
      <li>${t('Skalieren, Ergänzen und Auswählen erst nach dem Split, nur mit Trainingsdaten', 'Scale, fill in and select only after the split, using training data only')}</li>
      <li>${t('Am sichersten: alle Schritte in eine <code>Pipeline</code>, dann macht Cross-Validation es automatisch richtig', 'Safest: put all steps in a <code>Pipeline</code>, then Cross-Validation does it right automatically')}</li>
      <li>${t('Merkmale, die die Antwort schon verraten, entfernen', 'Remove features that already give away the answer')}</li>
    </ul><div class="sb-f"><a href="#klass-leakage">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
  </div>
  <p class="note">${t('Alles zusammen an einem echten Datensatz: <a href="notebook.html?nb=beispiele/07_Titanic.ipynb">Titanic-Notebook</a> (einfaches Modell und Random Forest, mit EDA und Feature Engineering), dazu die Seite <a href="titanic.html">Titanic in der Lernapp</a>.', 'Everything together on a real dataset: <a href="notebook.html?nb=beispiele/07_Titanic.ipynb">Titanic notebook</a> (simple model and random forest, with EDA and feature engineering), plus the page <a href="titanic.html">Titanic in the study app</a>.')}</p>
  <div class="falle">${t('<b>Falle</b><p>Das Test-Set mehrfach zum Vergleichen benutzen. Dann wird es zur zweiten Validierung, und die Endzahl ist zu optimistisch.</p>', '<b>Pitfall</b><p>Using the test set several times for comparisons. It then becomes a second validation set, and the final number is too optimistic.</p>')}</div>
`,
    quiz: [
      { q: t(`Train-Fehler klein, Validierungsfehler gross. Was liegt vor und was hilft?`, `Training error small, validation error large. What is going on and what helps?`), a: t(`Overfitting (hohe Variance). Einfacheres Modell, mehr Regularisierung, mehr Daten oder weniger Merkmale.`, `Overfitting (high variance). Simpler model, more regularisation, more data or fewer features.`) },
      { q: t(`Ridge oder Lasso, wenn du am Ende nur wenige Merkmale behalten willst?`, `Ridge or Lasso, if you want to keep only a few features in the end?`), a: t(`Lasso: Die L1-Strafe setzt unwichtige Gewichte genau auf 0. Ridge schrumpft nur.`, `Lasso: the L1 penalty sets unimportant weights to exactly 0. Ridge only shrinks.`) },
      { q: t(`Welche Modelle brauchen keine Skalierung, und warum?`, `Which models need no scaling, and why?`), a: t(`Baum-Modelle (Entscheidungsbaum, Random Forest, Gradient Boosting, Isolation Forest). Sie vergleichen jedes Merkmal nur mit einer Schwelle, die Grössenordnung spielt keine Rolle.`, `Tree models (decision tree, Random Forest, Gradient Boosting, Isolation Forest). They only compare each feature with a threshold, so the order of magnitude does not matter.`) },
      { q: t(`Was unterscheidet Bagging von Boosting?`, `What distinguishes bagging from boosting?`), a: t(`Bagging (Random Forest) trainiert parallel auf Zufallsstichproben und mittelt, das senkt die Variance. Boosting trainiert nacheinander auf den Restfehlern, das senkt den Bias.`, `Bagging (Random Forest) trains in parallel on random samples and averages, which lowers the variance. Boosting trains one after another on the remaining errors, which lowers the bias.`) },
      { q: t(`99 % der Fälle sind negativ. Warum ist Accuracy 99 % nichtssagend?`, `99 % of the cases are negative. Why is an accuracy of 99 % meaningless?`), a: t(`«Immer negativ» erreicht das auch, findet aber keinen einzigen positiven Fall. Recall, Precision und F1 zeigen das.`, `“Always negative” achieves that too, but finds not a single positive case. Recall, precision and F1 show this.`) },
      { q: t(`Wann DBSCAN statt k-Means?`, `When DBSCAN instead of k-Means?`), a: t(`Wenn die Cluster nicht rund sind, du k nicht kennst oder Ausreisser erwartest. DBSCAN markiert sie als Rauschen (−1).`, `When the clusters are not round, you do not know k or you expect outliers. DBSCAN marks them as noise (−1).`) },
      { q: t(`Wofür PCA, wofür t-SNE?`, `What is PCA for, what is t-SNE for?`), a: t(`PCA zum Verdichten und Weiterrechnen (linear, auf neue Daten anwendbar). t-SNE nur zum Anschauen; Abstände zwischen den Gruppen bedeuten dort nichts.`, `PCA for compressing and further computation (linear, applicable to new data). t-SNE only for looking; distances between the groups mean nothing there.`) },
      { q: t(`Was ist der Unterschied zwischen Hyperparameter und Parameter?`, `What is the difference between a hyperparameter and a parameter?`), a: t(`Parameter (Gewichte) lernt das Modell aus den Daten. Hyperparameter (z. B. alpha, k, max_depth) legst du vorher fest und suchst sie mit der Validierung.`, `The model learns parameters (weights) from the data. You fix hyperparameters (e.g. alpha, k, max_depth) beforehand and search for them with the validation set.`) },
      { q: t(`Warum gehört der Scaler in eine Pipeline?`, `Why does the scaler belong in a pipeline?`), a: t(`Damit er in jedem Cross-Validation-Lauf nur auf dem Trainingsteil gelernt wird. Sonst sickert Information aus dem Validierungsteil ein (Data Leakage).`, `So that in every Cross-Validation run it is learned on the training part only. Otherwise information leaks in from the validation part (data leakage).`) },
      { q: t(`Wie wählst du k bei k-Means?`, `How do you choose k for k-Means?`), a: t(`Elbow-Methode (Knick in der Inertia-Kurve) und Silhouette-Wert vergleichen, dann prüfen, ob die Cluster inhaltlich Sinn ergeben.`, `Compare the elbow method (bend in the inertia curve) and the silhouette score, then check whether the clusters make sense in terms of content.`) },
    ],
  });
})();
