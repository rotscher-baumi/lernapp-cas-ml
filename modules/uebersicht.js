/*
 * Overview and practice chapter («Übersicht & Praxis»), the last chapter: how to approach a new
 * problem (figure, Do & Don't, checklist), a model in practice (what a model is, where it comes from,
 * saving, drift; demos in assets/demos-modell.js), one card per model and one checklist per strategy.
 * The cards only summarise what ml.js, klass.js, unsup.js, nn.js, cnn.js, cv.js, det.js and gen.js explain.
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
      '</dl><div class="sb-f"><code>' + sk + '</code><span><a href="' + href + '">' + MEHR + '</a>' + (NB ? ' ' + bsp(NB) : '') + '</span></div></div>';
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
    card(t('Logistische Regression', 'Logistic regression'), t('Gewichtete Summe der Merkmale, durch die Sigmoid-Funktion in eine Wahrscheinlichkeit zwischen 0 und 1 umgerechnet. Ab einem Threshold (Standard 0,5) gilt «Klasse 1».', 'Weighted sum of the features, converted by the sigmoid function into a probability between 0 and 1. Above a threshold (default 0.5) it counts as “class 1”.'), [
      [WANN, t('Ja/Nein-Fragen, erste Baseline für Klassifikation', 'yes/no questions, first baseline for classification')],
      [HP, t('<code>C</code> (klein = stärker regularisiert), <code>class_weight</code>; den Threshold wählst du danach', '<code>C</code> (small = stronger regularisation), <code>class_weight</code>; you choose the threshold afterwards')],
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
    card(t('Entscheidungsbaum', 'Decision tree'), t('Stellt nacheinander Ja/Nein-Fragen mit Thresholds («mehr als 74 qm?»). Jeder Split macht die Gruppen möglichst rein (Gini, bei Regression MSE).', 'Asks yes/no questions with thresholds one after another (“more than 74 m²?”). Each split makes the groups as pure as possible (Gini, MSE for regression).'), [
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
      [HP, t('<code>n_estimators</code>; <code>contamination</code> setzt nur den Threshold für <code>predict</code>, die Rangliste der Scores ändert sich nicht', '<code>n_estimators</code>; <code>contamination</code> only sets the threshold for <code>predict</code>, the ranking of the scores does not change')],
      [SKAL, NEIN],
      ['+', t('schnell, braucht keine Labels', 'fast, needs no labels')],
      ['−', t('Threshold oder Prüf-Budget (Top-N) musst du selbst festlegen; ein Score ist ein Hinweis, kein Beweis', 'you have to set the threshold or review budget (top N) yourself; a score is a hint, not proof')],
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

  /* Deep learning: Neural Networks, CNN, Image Processing, Object Detection & Segmentation, Generative Models (summarise nn.js, cnn.js, cv.js, det.js, gen.js). */
  const EING = t('Eingaben', 'Inputs');
  NB = '08_Neuronale_Netze';
  const dl = [
    card(t('MLP (Dense-Netz)', 'MLP (dense network)'), t('Schichten von Neuronen: gewichtete Summe plus Activation Function. Die Gewichte lernt Backpropagation mit einem Optimizer wie Adam.', 'Layers of neurons: weighted sum plus activation function. Backpropagation learns the weights with an optimizer such as Adam.'), [
      [WANN, t('Klassifikation oder Regression mit vielen Daten und nicht-linearen Zusammenhängen. Bei Tabellen meist nicht besser als Gradient Boosting.', 'classification or regression with lots of data and non-linear relationships. On tables usually not better than gradient boosting.')],
      [HP, t('Schichten und Neuronen, Learning Rate, Batch Size, Epochs, Dropout', 'layers and neurons, learning rate, batch size, epochs, dropout')],
      [EING, t('skalieren, Scaler nur auf Train', 'scale, scaler on training data only')],
      ['+', t('lernt beliebige Zusammenhänge, Grundbaustein aller Netze', 'learns any relationship, building block of all networks')],
      ['−', t('braucht viele Daten und Tuning, kaum erklärbar, streut von Lauf zu Lauf', 'needs lots of data and tuning, hardly explainable, varies from run to run')],
    ], 'keras.layers.Dense / MLPClassifier', '#nn-arch'),
  ];
  NB = '';
  const cnn = [
    card(t('CNN (eigenes Netz)', 'CNN (your own network)'), t('Filter gleiten über das Bild und erzeugen Feature Maps. Pooling verkleinert, am Schluss entscheiden Dense-Schichten. Dieselben Gewichte an jeder Stelle: viel weniger Parameter als ein Dense-Netz.', 'Filters slide over the image and produce feature maps. Pooling shrinks, dense layers decide at the end. The same weights at every position: far fewer parameters than a dense network.'), [
      [WANN, t('Bilder klassifizieren, wenn es viele eigene Bilder gibt oder kein passendes vortrainiertes Netz', 'classifying images when there are many own images or no suitable pretrained network')],
      [HP, t('Zahl der Filter und Blöcke, Kernel-Grösse, Padding, Learning Rate, Augmentation', 'number of filters and blocks, kernel size, padding, learning rate, augmentation')],
      [EING, t('Pixel durch 255 teilen', 'divide pixels by 255')],
      ['+', t('erkennt Muster unabhängig von ihrer Lage', 'recognises patterns regardless of their position')],
      ['−', t('braucht viele Bilder, sonst Overfitting', 'needs many images, otherwise overfitting')],
    ], 'keras.layers.Conv2D', '#cnn-keras'),
    card('Transfer Learning', t('Ein auf ImageNet vortrainiertes Netz (ResNet, MobileNet, EfficientNet) als Basis einfrieren, nur einen neuen Kopf trainieren. Für Fine-Tuning danach obere Schichten mit kleiner Learning Rate freigeben.', 'Freeze a network pretrained on ImageNet (ResNet, MobileNet, EfficientNet) as the base and train only a new head. For fine-tuning, unfreeze the upper layers afterwards with a small learning rate.'), [
      [WANN, t('wenige hundert bis tausend Bilder, Aufgabe ähnlich wie Fotos', 'a few hundred to a few thousand images, task similar to photos')],
      [HP, t('welche Schichten frei, Learning Rate (Fine-Tuning etwa 1e-5)', 'which layers are unfrozen, learning rate (fine-tuning about 1e-5)')],
      [EING, t('genau die Vorverarbeitung des Netzes (<code>preprocess_input</code>, Bildgrösse)', 'exactly the network’s preprocessing (<code>preprocess_input</code>, image size)')],
      ['+', t('gute Ergebnisse mit wenig Daten und kurzem Training', 'good results with little data and short training')],
      ['−', t('hilft wenig bei ganz anderen Bildern (Röntgen, Mikroskop), Lizenz beachten', 'helps little with very different images (X-ray, microscope), mind the licence')],
    ], 'keras.applications.ResNet50', '#cnn-transfer'),
  ];
  const cv = [
    card(t('Klassische Bildfilter', 'Classical image filters'), t('Feste Rechenregeln ohne Training: Gauss-, Median- und bilateraler Filter, Non-Local Means und BM3D gegen Rauschen, Wiener-Filter gegen bekannte Unschärfe, bicubic zum Vergrössern.', 'Fixed rules without training: Gaussian, median and bilateral filter, non-local means and BM3D against noise, Wiener filter against known blur, bicubic for upscaling.'), [
      [WANN, t('Baseline für jede Restauration, wenig Rechenleistung, bekanntes Rauschmodell', 'baseline for any restoration, little compute, known noise model')],
      [HP, t('Fenstergrösse, σ des Filters', 'window size, σ of the filter')],
      [EING, t('Werte auf 0 bis 1', 'values in 0 to 1')],
      ['+', t('schnell, nachvollziehbar, erfindet nichts', 'fast, traceable, invents nothing')],
      ['−', t('verwischt Kanten und feine Details stärker als gelernte Modelle', 'blurs edges and fine detail more than learned models')],
    ], 'scipy.ndimage, cv2', '#cv-restauration'),
    card(t('Restaurations-Transformer', 'Restoration transformer'), t('SwinIR und Restormer: Self-Attention in Fenstern oder über Channels sieht grosse Bildteile auf einmal und nutzt ähnliche Stellen im ganzen Bild.', 'SwinIR and Restormer: self-attention in windows or across channels sees large image regions at once and uses similar places across the whole image.'), [
      [WANN, t('beste Bildqualität bei Denoising, Deblurring, Super-Resolution, meist vortrainiert übernommen', 'best image quality for denoising, deblurring, super-resolution, usually taken over pretrained')],
      [HP, t('Variante wählen (Aufgabe, Rauschstärke, Vergrösserung)', 'choose the variant (task, noise level, scale factor)')],
      [EING, t('wie beim Training des Modells (RGB, Wertebereich)', 'as in the model’s training (RGB, value range)')],
      ['+', t('Stand der Technik auf Benchmarks', 'state of the art on benchmarks')],
      ['−', t('gross und langsam, kann Details erfinden, nur für die trainierte Degradation gut', 'large and slow, can invent details, only good for the degradation it was trained on')],
    ], 'transformers.Swin2SRForImageSuperResolution', '#cv-restauration'),
  ];
  const det = [
    card('U-Net', t('Encoder-Decoder mit Skip Connections: Der Encoder versteht, was im Bild ist, der Decoder baut die volle Auflösung wieder auf, die Skips liefern die Kanten.', 'Encoder-decoder with skip connections: the encoder understands what is in the image, the decoder rebuilds full resolution, the skips provide the edges.'), [
      [WANN, t('Bild zu Bild: Denoising, Deblurring, Segmentation mit eigenen Labels', 'image to image: denoising, deblurring, segmentation with own labels')],
      [HP, t('Tiefe, Zahl der Channels, Loss (L1, Cross-Entropy + Dice)', 'depth, number of channels, loss (L1, cross-entropy + Dice)')],
      [EING, t('Pixel skalieren, Bildgrösse durch 2<sup>Tiefe</sup> teilbar', 'scale pixels, image size divisible by 2<sup>depth</sup>')],
      ['+', t('genaue Kanten, auch mit wenigen Bildern trainierbar', 'precise edges, trainable even with few images')],
      ['−', t('ein Modell pro Aufgabe, braucht pixelgenaue Labels oder saubere Zielbilder', 'one model per task, needs pixel-exact labels or clean target images')],
    ], 'keras.Model (Encoder-Decoder)', '#det-unet'),
    card('Faster R-CNN', t('Detection in zwei Stufen: Ein Region Proposal Network schlägt Kandidaten vor, ein Kopf bestimmt pro Kandidat Klasse und genaue Box.', 'Two-stage detection: a region proposal network suggests candidates, a head determines class and exact box for each.'), [
      [WANN, t('höchste Genauigkeit, kleine Objekte, Zeit spielt keine Rolle', 'highest accuracy, small objects, time does not matter')],
      [HP, t('Score-Threshold, NMS-IoU-Threshold, Anker', 'score threshold, NMS IoU threshold, anchors')],
      [EING, t('wie der vortrainierte Backbone', 'as the pretrained backbone')],
      ['+', t('genau, gut für kleine Objekte', 'accurate, good for small objects')],
      ['−', t('langsamer als YOLO, komplexer', 'slower than YOLO, more complex')],
    ], 'torchvision.models.detection', '#det-rcnn'),
    card('YOLO', t('Detection in einer Stufe: Das Netz sagt auf einem Gitter direkt Klassen und Boxen voraus (anchor-free ab v8), NMS räumt Duplikate weg.', 'One-stage detection: the network predicts classes and boxes directly on a grid (anchor-free from v8), NMS removes duplicates.'), [
      [WANN, t('Echtzeit, Video, Edge-Geräte', 'real time, video, edge devices')],
      [HP, t('Modellgrösse (n, s, m, l, x), Score- und NMS-Threshold, Bildgrösse', 'model size (n, s, m, l, x), score and NMS threshold, image size')],
      [EING, t('Labels als <code>class cx cy w h</code>, auf 0 bis 1 normiert', 'labels as <code>class cx cy w h</code>, normalised to 0 to 1')],
      ['+', t('schnell, einfach zu fine-tunen', 'fast, easy to fine-tune')],
      ['−', t('etwas schwächer bei sehr kleinen, dicht gedrängten Objekten', 'somewhat weaker on very small, densely packed objects')],
    ], 'ultralytics.YOLO', '#det-yolo'),
    card('SAM (Segment Anything)', t('Foundation Model für Segmentation, auf einer Milliarde Masken trainiert. Ein Prompt (Punkt, Box) genügt, und es liefert die Maske des Objekts.', 'Foundation model for segmentation, trained on a billion masks. A prompt (point, box) is enough and it returns the object’s mask.'), [
      [WANN, t('Masken ohne eigenes Training (zero-shot), Labels schneller erstellen', 'masks without own training (zero-shot), creating labels faster')],
      [HP, t('Prompt, Modellgrösse', 'prompt, model size')],
      [EING, t('RGB-Bild, Prompt-Koordinaten', 'RGB image, prompt coordinates')],
      ['+', t('kein Training, funktioniert auf sehr vielen Bildarten', 'no training, works on very many kinds of images')],
      ['−', t('kennt keine Klassennamen, gross; für Klassen mit einem Klassifikator kombinieren', 'knows no class names, large; combine with a classifier for classes')],
    ], 'segment_anything.SamPredictor', '#det-sam'),
  ];
  const gen = [
    card('Autoencoder', t('Encoder drückt das Bild in einen kleinen Code <code>z</code>, der Decoder rekonstruiert es daraus. Gelernt wird nur mit der Rekonstruktion, ohne Labels.', 'The encoder squeezes the image into a small code <code>z</code>, the decoder reconstructs it. It learns only from the reconstruction, without labels.'), [
      [WANN, t('Kompression, Denoising, Anomalien (grosser Rekonstruktionsfehler)', 'compression, denoising, anomalies (large reconstruction error)')],
      [HP, t('Grösse von <code>z</code>, Architektur', 'size of <code>z</code>, architecture')],
      [EING, t('Pixel auf 0 bis 1', 'pixels in 0 to 1')],
      ['+', t('einfach, stabil, kein Label nötig', 'simple, stable, no labels needed')],
      ['−', t('kein brauchbarer Generator: zufällige <code>z</code> ergeben Unsinn', 'no usable generator: random <code>z</code> give nonsense')],
    ], 'keras.Model', '#gen-ae'),
    card(t('VAE (Variational Autoencoder)', 'VAE (variational autoencoder)'), t('Der Encoder gibt Mittelwert und Streuung aus, <code>z</code> wird daraus gezogen. Die KL-Divergenz ordnet den Latent Space, so dass man neue Bilder ziehen und interpolieren kann.', 'The encoder outputs mean and spread, <code>z</code> is sampled from them. The KL divergence orders the latent space so you can sample and interpolate new images.'), [
      [WANN, t('neue Bilder erzeugen, glatte Übergänge zwischen Bildern', 'generating new images, smooth transitions between images')],
      [HP, t('Grösse von <code>z</code>, Gewicht der KL-Divergenz', 'size of <code>z</code>, weight of the KL divergence')],
      [EING, t('Pixel auf 0 bis 1', 'pixels in 0 to 1')],
      ['+', t('stabiles Training, geordneter Latent Space', 'stable training, ordered latent space')],
      ['−', t('etwas unscharfe Bilder', 'somewhat blurry images')],
    ], 'keras.Model', '#gen-vae'),
    card('PixelCNN', t('Erzeugt ein Bild Pixel für Pixel. Maskierte Faltungen sorgen dafür, dass jeder Pixel nur die schon erzeugten sieht.', 'Generates an image pixel by pixel. Masked convolutions make sure each pixel only sees those already generated.'), [
      [WANN, t('wenn eine echte Wahrscheinlichkeit pro Bild gebraucht wird', 'when a real probability per image is needed')],
      [HP, t('Tiefe, Zahl der Filter', 'depth, number of filters')],
      [EING, t('Pixel als Klassen (z. B. 0 bis 255 oder binär)', 'pixels as classes (e.g. 0 to 255 or binary)')],
      ['+', t('einfaches, stabiles Training, exakte Likelihood', 'simple, stable training, exact likelihood')],
      ['−', t('Generieren sehr langsam (ein Durchlauf pro Pixel)', 'generation very slow (one pass per pixel)')],
    ], 'keras.layers.Conv2D (maskiert)', '#gen-pixel'),
    card('GAN', t('Ein Generator macht aus Zufall Bilder, ein Discriminator unterscheidet echte von gefälschten. Beide lernen gegeneinander.', 'A generator turns noise into images, a discriminator tells real from fake. Both learn against each other.'), [
      [WANN, t('sehr scharfe Bilder, Bild-zu-Bild-Übersetzung, Super-Resolution (ESRGAN)', 'very sharp images, image-to-image translation, super-resolution (ESRGAN)')],
      [HP, t('Learning Rates von Generator und Discriminator, Grösse von <code>z</code>', 'learning rates of generator and discriminator, size of <code>z</code>')],
      [EING, t('Pixel skalieren, passend zur Output-Activation des Generators', 'scale pixels to match the generator’s output activation')],
      ['+', t('sehr scharfe Bilder in einem einzigen Durchlauf', 'very sharp images in a single pass')],
      ['−', t('instabil, Mode Collapse, Loss sagt wenig über die Qualität', 'unstable, mode collapse, the loss says little about quality')],
    ], 'keras.Model', '#gen-gan'),
    card(t('Diffusion (DDPM)', 'Diffusion (DDPM)'), t('Ein Bild wird in vielen kleinen Schritten verrauscht (fest, ohne Training). Ein U-Net lernt mit MSE, das Rauschen in jeder Stufe zu schätzen. Generiert wird von reinem Rauschen aus, Schritt für Schritt entrauscht.', 'An image is noised in many small steps (fixed, no training). A U-Net learns with MSE to estimate the noise at every level. Generating starts from pure noise and denoises step by step.'), [
      [WANN, t('beste Qualität und Vielfalt, Bild-zu-Bild, Inpainting; selbst trainieren nur für eigene, kleine Bildarten', 'best quality and diversity, image-to-image, inpainting; train yourself only for your own small image types')],
      [HP, t('Noise Schedule (linear, Cosine), Zahl der Schritte T, Grösse des U-Nets', 'noise schedule (linear, cosine), number of steps T, size of the U-Net')],
      [EING, t('Pixel auf −1 bis 1', 'pixels in −1 to 1')],
      ['+', t('stabiles Training, kein Mode Collapse, sehr gute Bilder', 'stable training, no mode collapse, very good images')],
      ['−', t('Generieren langsam (20 bis 1000 U-Net-Durchläufe), rechenintensiv', 'generation slow (20 to 1000 U-Net passes), compute-intensive')],
    ], 'diffusers.UNet2DModel + DDPMScheduler', '#gen-diff'),
    card('Stable Diffusion', t('Latent Diffusion: Ein VAE verkleinert das Bild auf 64 × 64 × 4, ein U-Net entrauscht dort in 20 bis 50 Schritten, gesteuert vom Prompt (Text-Encoder CLIP, Classifier-free Guidance), der VAE-Decoder macht das Bild daraus.', 'Latent diffusion: a VAE shrinks the image to 64 × 64 × 4, a U-Net denoises there in 20 to 50 steps, guided by the prompt (text encoder CLIP, classifier-free guidance), the VAE decoder makes the image from it.'), [
      [WANN, t('Text-zu-Bild, Bild-zu-Bild, Inpainting mit einem vortrainierten Modell', 'text-to-image, image-to-image, inpainting with a pretrained model')],
      [HP, t('Prompt und Negative Prompt, <code>num_inference_steps</code>, <code>guidance_scale</code> (≈ 7,5), Seed', 'prompt and negative prompt, <code>num_inference_steps</code>, <code>guidance_scale</code> (≈ 7.5), seed')],
      [EING, t('Text; Bildgrösse Vielfache von 8, am besten 512', 'text; image size multiples of 8, ideally 512')],
      ['+', t('fertig vortrainiert, sehr vielseitig', 'pretrained and ready, very versatile')],
      ['−', t('braucht GPU, Lizenz beachten, erfindet Details; erzeugte Bilder kennzeichnen', 'needs a GPU, mind the licence, invents details; label generated images')],
    ], 'diffusers.StableDiffusionPipeline', '#gen-cond'),
  ];

  /* «Neues ML-Problem: so gehst du vor»: clickable workflow figure (same pattern as the chapter figures),
     do/don't cards and a checklist whose ticks are kept with LernApp.store under 'cas-ml-checklist'. */
  const SVGT = 'font-family:var(--f-body)';
  function vbox(k, x, y, w, title, sub, kind) {
    const f = kind === 'q' ? 'fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5'
      : kind === 'rare' ? 'fill:var(--bg);stroke:var(--line);stroke-width:1.5;stroke-dasharray:6 4'
        : 'fill:var(--surface);stroke:var(--line);stroke-width:1.5';
    const h = sub ? 52 : 44;
    const cx = x + w / 2;
    const tc = kind === 'q' ? 'var(--accent)' : 'var(--fg)';
    return '<g class="ab-step" data-s="' + k + '" tabindex="0" role="button" aria-expanded="false" aria-label="' + title + t(': Erklärung aufklappen', ': open explanation') + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" style="' + f + '"/>' +
      '<text x="' + cx + '" y="' + (y + (sub ? 22 : 27)) + '" text-anchor="middle" style="fill:' + tc + ';font-size:14px;font-weight:600;' + SVGT + '">' + title + '</text>' +
      (sub ? '<text x="' + cx + '" y="' + (y + 40) + '" text-anchor="middle" style="fill:var(--muted);font-size:12px;' + SVGT + '">' + sub + '</text>' : '') +
      '</g>';
  }
  function vline(d, kind) {
    const c = kind === 'ok' ? 'var(--ok)' : kind === 'warn' ? 'var(--warn)' : 'var(--line)';
    const m = kind === 'ok' ? 'ue-ao' : kind === 'warn' ? 'ue-aw' : 'ue-a';
    const dash = kind ? ';stroke-dasharray:6 4' : '';
    return '<path d="' + d + '" marker-end="url(#' + m + ')" style="stroke:' + c + ';stroke-width:1.5;fill:none' + dash + '"/>';
  }
  function vlabel(x, y, text, anchor, color) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '" style="fill:' + (color || 'var(--muted)') + ';font-size:11.5px;font-family:var(--f-mono)">' + text + '</text>';
  }
  function marker(id, color) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:' + color + '"/></marker>';
  }

  const vorgehenFig = `
  <figure class="fig ab-fig" id="ueFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 790 930" role="img" aria-label="${t('Vorgehen bei einem neuen ML-Problem: Problem und Metrik festlegen, Baseline bauen, dann je nach Daten Gradient Boosting mit Feature Engineering (Tabellen) oder ein vortrainiertes Modell ohne Training testen (Bild, Text, Audio); reicht es nicht, Feature Extraction oder Fine-Tuning, im Sonderfall eine eigene Architektur. Danach Pipeline und Training, einmal testen, Threshold wählen, einsetzen und beobachten; bei Domain Shift nachtrainieren.', 'How to approach a new ML problem: define the problem and metric, build a baseline, then depending on the data gradient boosting with feature engineering (tables) or test a pretrained model without training (image, text, audio); if that is not enough, feature extraction or fine-tuning, in special cases your own architecture. Then pipeline and training, test once, choose the threshold, deploy and monitor; retrain on domain shift.')}">
      <defs>${marker('ue-a', 'var(--line)')}${marker('ue-ao', 'var(--ok)')}${marker('ue-aw', 'var(--warn)')}</defs>
      ${vbox('1', 240, 20, 300, t('1 · Problem und Metrik', '1 · Problem and metric'), t('Input, Output, was heisst «gut genug»?', 'input, output, what is “good enough”?'))}
      ${vline('M390,72 V104')}
      ${vbox('2', 240, 104, 300, t('2 · Baseline bauen', '2 · Build a baseline'), t('einfachstes Modell oder eine Regel', 'simplest model or a rule'))}
      ${vline('M390,156 V188')}
      ${vbox('d', 290, 188, 200, t('Welche Daten?', 'Which data?'), '', 'q')}
      ${vline('M290,210 H170 V270')}
      ${vlabel(160, 248, t('Tabellen', 'Tables'), 'end')}
      ${vline('M490,210 H600 V270')}
      ${vlabel(610, 248, t('Bild · Text · Audio', 'Image · text · audio'))}

      ${vbox('gb', 40, 270, 260, t('3a · Gradient Boosting', '3a · Gradient Boosting'), 'XGBoost, LightGBM, CatBoost')}
      ${vline('M170,322 V354')}
      ${vbox('fe', 40, 354, 260, 'Feature Engineering', t('Merkmale bauen und auswählen', 'build and select features'))}
      ${vline('M170,406 V636 H240')}

      ${vbox('pre', 460, 270, 280, t('3b · Vortrainiert, ohne Training', '3b · Pretrained, no training'), t('zero-shot testen oder LLM mit Prompt', 'test zero-shot or an LLM with a prompt'))}
      ${vline('M600,322 V354')}
      ${vbox('r', 520, 354, 160, t('Reicht das?', 'Good enough?'), '', 'q')}
      ${vline('M680,376 H774 V720 H540', 'ok')}
      ${vlabel(690, 368, t('ja', 'yes'), 'start', 'var(--ok)')}
      <path d="M600,398 V414 M517,414 H682" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      ${vline('M517,414 V430')}
      ${vline('M682,414 V430')}
      ${vlabel(608, 410, t('nein', 'no'), 'start', 'var(--bad)')}
      ${vbox('fx', 440, 430, 155, 'Feature Extraction', t('nur neuen Head', 'new head only'))}
      ${vbox('ft', 605, 430, 155, 'Fine-Tuning', t('obere Layers auftauen', 'unfreeze top layers'))}
      <path d="M517,482 V496 H682 V482" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      ${vline('M517,496 H420 V610')}
      ${vline('M600,496 V514', 'warn')}
      ${vlabel(612, 509, t('nur falls nötig', 'only if needed'), 'start', 'var(--warn)')}
      ${vbox('own', 470, 514, 260, t('Sonderfall: eigene Architektur', 'Special case: own architecture'), t('exotische Daten, Edge, Forschung', 'exotic data, edge, research'), 'rare')}
      ${vline('M600,566 V636 H540')}

      ${vbox('pipe', 240, 610, 300, t('4 · Pipeline und Training', '4 · Pipeline and training'), t('Split, Imputer und Scaler nur auf Train', 'split, imputer and scaler on train only'))}
      ${vline('M390,662 V694')}
      ${vbox('test', 240, 694, 300, t('5 · Einmal testen', '5 · Test once'), t('Testset, Vergleich mit der Baseline', 'test set, compare with the baseline'))}
      ${vline('M390,746 V778')}
      ${vbox('thr', 240, 778, 300, t('6 · Threshold wählen', '6 · Choose the threshold'), t('Precision oder Recall wichtiger?', 'precision or recall more important?'))}
      ${vline('M390,830 V862')}
      ${vbox('ein', 240, 862, 300, t('7 · Einsetzen und beobachten', '7 · Deploy and monitor'), t('speichern, überwachen, Drift', 'save, monitor, drift'))}
      ${vline('M240,888 H200 V650 H240', 'warn')}
      ${vlabel(192, 766, 'Domain Shift:', 'end', 'var(--warn)')}
      ${vlabel(192, 782, t('nachtrainieren', 'retrain'), 'end', 'var(--warn)')}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="${t('Schliessen', 'Close')}">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>${t('Vom Einfachen zum Aufwändigen: Jede Stufe nur nehmen, wenn die vorige auf der Validierung nicht reicht. Grün gestrichelt: Das vortrainierte Modell reicht schon, es muss nur noch auf den eigenen Testdaten bestätigt werden. Orange gestrichelt: nur im Ausnahmefall.', 'From simple to elaborate: take each stage only if the previous one is not enough on the validation set. Green dashed: the pretrained model is already good enough and only needs to be confirmed on your own test data. Orange dashed: exceptions only.')}</figcaption>
  </figure>`;

  /* Explanations of the figure steps: [title, text, [[link text, href], …]] */
  const VS = {
    '1': [t('1 · Problem und Metrik festlegen', '1 · Define the problem and metric'), t('Was ist der Input, was soll herauskommen? Eine Zahl (Regression), eine Klasse (Klassifikation), Gruppen ohne Labels (Unsupervised), Boxen oder Masken (Object Detection, Segmentation)? Lege vor dem ersten Modell fest, woran du Erfolg misst und was «gut genug» ist, zum Beispiel Recall ≥ 0.9 bei höchstens 10 % falschem Alarm.', 'What is the input, what should come out? A number (regression), a class (classification), groups without labels (unsupervised), boxes or masks (object detection, segmentation)? Before the first model, decide how you measure success and what is “good enough”, for example recall ≥ 0.9 with at most 10 % false alarms.'), [[t('Welches Modell wann?', 'Which model when?'), '#ue-wahl'], [t('Metriken', 'Metrics'), '#klass-metriken']]],
    '2': [t('2 · Baseline bauen', '2 · Build a baseline'), t('Das einfachste mögliche Modell: Mittelwert oder häufigste Klasse, lineare oder logistische Regression, bei Super-Resolution bicubic. Ohne Baseline weisst du nicht, ob das grosse Modell überhaupt etwas bringt. Jedes spätere Ergebnis steht neben der Baseline.', 'The simplest possible model: mean or most frequent class, linear or logistic regression, bicubic for super-resolution. Without a baseline you do not know whether the big model helps at all. Every later result is shown next to the baseline.'), [[t('Lineare Regression', 'Linear regression'), '#ml-linreg'], [t('Logistische Regression', 'Logistic regression'), '#klass-logreg']]],
    'd': [t('Welche Daten?', 'Which data?'), t('Die wichtigste Weiche. <b>Tabellen</b> (CSV, Datenbank, Sensorwerte) haben wenige, schon sinnvolle Spalten: Hier gewinnen Baum-Ensembles. <b>Bilder, Text und Audio</b> sind unstrukturiert: Die Features muss ein Netz erst lernen, und dafür gibt es vortrainierte Modelle mit Millionen von Beispielen.', 'The most important fork. <b>Tables</b> (CSV, database, sensor values) have few columns that already mean something: tree ensembles win here. <b>Images, text and audio</b> are unstructured: a network has to learn the features first, and there are pretrained models with millions of examples for that.'), [[t('Welches Modell wann?', 'Which model when?'), '#ue-wahl']]],
    'gb': [t('3a · Gradient Boosting bei Tabellen', '3a · Gradient Boosting on tables'), t('Auf Tabellendaten ist Gradient Boosting (XGBoost, LightGBM, CatBoost, in scikit-learn <code>HistGradientBoostingClassifier</code>) meist das genaueste Modell, oft genauer als jedes Deep-Learning-Modell. Random Forest ist robuster und braucht weniger Tuning. Ein MLP lohnt sich auf Tabellen selten.', 'On tabular data gradient boosting (XGBoost, LightGBM, CatBoost, in scikit-learn <code>HistGradientBoostingClassifier</code>) is usually the most accurate model, often more accurate than any deep learning model. Random Forest is more robust and needs less tuning. An MLP rarely pays off on tables.'), [['Ensembles', '#klass-ens'], [t('Steckbriefe', 'Profiles'), '#ue-ens']]],
    'fe': ['Feature Engineering', t('Bei Tabellen steckt der grösste Hebel in den Merkmalen: sinnvolle neue Spalten (Verhältnisse, Datumsteile, Gruppen), Kategorien kodieren, unnütze oder verräterische Spalten entfernen. «Garbage in, garbage out»: Die Qualität der Features und Labels bestimmt die Qualität des Ergebnisses.', 'With tables, the biggest lever is in the features: meaningful new columns (ratios, date parts, groups), encoding categories, removing useless or revealing columns. “Garbage in, garbage out”: the quality of the features and labels determines the quality of the result.'), [['Feature Selection', '#ml-fs'], ['Data Leakage', '#klass-leakage']]],
    'pre': [t('3b · Vortrainiertes Modell ohne Training', '3b · Pretrained model without training'), t('Bei Bild, Text und Audio zuerst ein fertiges Modell nehmen (Hugging Face, torchvision, Keras Applications, Ultralytics) und auf den <b>eigenen</b> Daten testen, noch ohne Training: zero-shot (zum Beispiel CLIP für Bildklassen, SAM für Masken), ein COCO-Detektor wie YOLO, Stable Diffusion zum Erzeugen von Bildern oder ein LLM mit gutem Prompt. Wertvoll sind die trainierten Gewichte, nicht die Architektur. Prüfe Lizenz (YOLOv8: AGPL), Grösse und Latenz und übernimm die Vorverarbeitung des Modells.', 'With image, text and audio, first take a finished model (Hugging Face, torchvision, Keras Applications, Ultralytics) and test it on your <b>own</b> data, still without training: zero-shot (for example CLIP for image classes, SAM for masks), a COCO detector such as YOLO, Stable Diffusion for generating images, or an LLM with a good prompt. The trained weights are what is valuable, not the architecture. Check the licence (YOLOv8: AGPL), size and latency, and take over the model’s preprocessing.'), [[t('Woher kommt ein Modell?', 'Where does a model come from?'), '#mo-quelle'], ['Faster R-CNN und YOLO', '#det-modelle'], ['U-Net und SAM', '#det-segmodelle'], ['Stable Diffusion', '#gen-cond']]],
    'r': [t('Reicht das?', 'Good enough?'), t('Vergleiche das vortrainierte Modell auf deinen Validierungsdaten mit der Metrik aus Schritt 1 und mit der Baseline. <b>Ja:</b> Kein Training nötig, weiter zum einmaligen Test. <b>Nein:</b> Meist liegt es an Domain Shift: Das Modell kennt Alltagsfotos (COCO, ImageNet), deine Bilder sind aber Röntgenbilder, unscharf oder haben einen Blaustich, oder es fehlen deine Klassen.', 'Compare the pretrained model on your validation data with the metric from step 1 and with the baseline. <b>Yes:</b> no training needed, go on to the one-off test. <b>No:</b> usually because of domain shift: the model knows everyday photos (COCO, ImageNet), but your images are X-rays, blurry or have a blue cast, or your classes are missing.'), [['Best Practices Object Detection', '#det-best']]],
    'fx': ['Feature Extraction', t('Wenig Daten und eine ähnliche Aufgabe: den alten Head entfernen, alle Conv-Layers einfrieren (<code>base.trainable = False</code>), einen neuen Head mit deiner Zahl Klassen aufsetzen und nur diesen trainieren. Die frühen Layers kennen Kanten und Texturen schon.', 'Little data and a similar task: remove the old head, freeze all conv layers (<code>base.trainable = False</code>), put on a new head with your number of classes and train only that. The early layers already know edges and textures.'), [['Transfer Learning', '#cnn-transfer']]],
    'ft': ['Fine-Tuning', t('Mehr Daten oder eine andere Domäne: zuerst den neuen Head trainieren, dann die oberen Layers auftauen und mit kleiner Learning Rate (zum Beispiel 1e-5) weitertrainieren. Die untersten Layers bleiben meist eingefroren. Trainiere mit Daten aus der echten Einsatzumgebung, also auch mit den Störungen, die dort vorkommen.', 'More data or a different domain: first train the new head, then unfreeze the top layers and continue training with a small learning rate (for example 1e-5). The lowest layers usually stay frozen. Train with data from the real deployment environment, including the disturbances that occur there.'), [['Transfer Learning', '#cnn-transfer'], [t('Bildstörungen', 'Image degradations'), '#cv-bild']]],
    'own': [t('Sonderfall: eigene Architektur', 'Special case: own architecture'), t('Ein Netz von Grund auf lohnt sich fast nur bei exotischen Daten ohne passendes vortrainiertes Modell (Radar, spezielle Sensoren), bei harten Hardware-Limits (Mikrocontroller, Edge) oder in der Forschung. Dann klein anfangen (wenige Layers) und nur bei Bedarf tiefer werden.', 'A network from scratch is almost only worth it for exotic data with no suitable pretrained model (radar, special sensors), with hard hardware limits (microcontroller, edge) or in research. Then start small (few layers) and only go deeper if needed.'), [[t('Ein CNN in Keras', 'A CNN in Keras'), '#cnn-keras'], ['Neural Networks', '#nn']]],
    'pipe': [t('4 · Pipeline und Training', '4 · Pipeline and training'), t('Zuerst das Testset abtrennen (zum Beispiel 80 / 20), dann Train und Validation (75 : 25) oder Cross-Validation. Alles, was aus Daten lernt (Imputer, Scaler, Feature Selection, Modell), wird nur auf Train gefittet, am sichersten in einer <code>Pipeline</code>. Hyperparameter auf der Validierung wählen, das beste Setup auf Train + Validation neu trainieren. Der ganze Ablauf mit allen Schritten steht im Kapitel Supervised ML.', 'First split off the test set (for example 80 / 20), then train and validation (75 : 25) or cross-validation. Everything that learns from data (imputer, scaler, feature selection, model) is fitted on train only, safest in a <code>Pipeline</code>. Choose hyperparameters on the validation set, retrain the best setup on train + validation. The whole workflow with all steps is in the Supervised ML chapter.'), [[t('Ablauf Supervised ML', 'Supervised ML workflow'), '#ml-ablauf'], ['Train, Validation, Test', '#ml-split'], [t('Hyperparameter', 'Hyperparameters'), '#ml-hp']]],
    'test': [t('5 · Einmal testen', '5 · Test once'), t('Das Testset geht ganz am Schluss einmal durch dieselbe Pipeline (Imputer, Scaler, Modell, alles mit den Train-Werten). Das Ergebnis schätzt die Leistung auf neuen Daten und steht neben der Baseline. Wer danach noch am Modell dreht, macht das Testset zur zweiten Validierung.', 'At the very end the test set goes once through the same pipeline (imputer, scaler, model, all with the training values). The result estimates the performance on new data and is shown next to the baseline. Whoever keeps tuning the model afterwards turns the test set into a second validation set.'), [['Train, Validation, Test', '#ml-split']]],
    'thr': [t('6 · Threshold wählen', '6 · Choose the threshold'), t('Ein höherer Threshold gibt mehr Precision und weniger Recall, ein tieferer umgekehrt. Was teurer ist, entscheidet die Anwendung: verpasste Fälle (Krankheit, Defekt: Recall zählt) oder falscher Alarm (Spam-Filter, automatisches Sortieren: Precision zählt). Bei Object Detection gibt es zusätzlich den NMS-IoU-Threshold.', 'A higher threshold gives more precision and less recall, a lower one the other way round. The application decides what is more costly: missed cases (illness, defect: recall counts) or false alarms (spam filter, automatic sorting: precision counts). Object detection also has the NMS IoU threshold.'), [[t('Unausgewogene Klassen', 'Imbalanced classes'), '#klass-imbal'], ['Precision, Recall, mAP', '#det-map']]],
    'ein': [t('7 · Einsetzen und beobachten', '7 · Deploy and monitor'), t('Passt das Modell auf die Zielhardware (Grösse, Latenz, Echtzeit), und erlaubt die Lizenz den Einsatz? Die ganze Pipeline mit Metadaten und Version speichern, dazu eine kurze Model Card. Im Betrieb die Eingaben und, sobald bekannt, die Metrik überwachen. Ändern sie sich (Domain Shift, Drift), mit neuen Daten aus der Einsatzumgebung und derselben Pipeline neu trainieren, die neue Version auf festen und aktuellen Testdaten gegen die alte prüfen und erst dann austauschen. Die alte Version bleibt für einen Rollback archiviert.', 'Does the model fit the target hardware (size, latency, real time), and does the licence allow the use? Save the whole pipeline with metadata and a version, plus a short model card. In operation, monitor the inputs and, once known, the metric. If they change (domain shift, drift), retrain with new data from the deployment environment and the same pipeline, check the new version against the old one on fixed and recent test data and only then swap. The old version stays archived for a rollback.'), [[t('Speichern und laden', 'Saving and loading'), '#mo-speichern'], [t('Neu trainieren', 'Retraining'), '#mo-neu'], [t('Checkliste', 'Checklist'), '#ue-check']]],
  };

  const CHECKS = [
    [t('Vor dem Training', 'Before training'), [
      t('Input, Output und Art des Problems festgelegt', 'Input, output and type of problem defined'),
      t('Metrik und Zielwert definiert («gut genug»)', 'Metric and target value defined (“good enough”)'),
      t('Daten angeschaut: fehlende Werte, Ausreisser, Klassenverteilung', 'Data inspected: missing values, outliers, class distribution'),
      t('Testset abgetrennt und weggelegt', 'Test set split off and put aside'),
      t('Baseline gebaut und gemessen', 'Baseline built and measured'),
      t('Vortrainierte Modelle gesucht, Lizenz geprüft', 'Pretrained models searched, licence checked'),
    ]],
    [t('Training und Abschluss', 'Training and wrap-up'), [
      t('Imputer und Scaler in einer Pipeline, nur auf Train gefittet', 'Imputer and scaler in a pipeline, fitted on train only'),
      t('Hyperparameter mit Validation oder Cross-Validation gewählt', 'Hyperparameters chosen with validation or cross-validation'),
      t('Bestes Setup auf Train + Validation neu trainiert', 'Best setup retrained on train + validation'),
      t('Einmal auf dem Testset gemessen, mit der Baseline verglichen', 'Measured once on the test set, compared with the baseline'),
      t('Threshold passend zur Anwendung gewählt', 'Threshold chosen to suit the application'),
      t('Grösse, Latenz und Zielhardware geprüft, Seed notiert', 'Size, latency and target hardware checked, seed noted'),
    ]],
    [t('Einsatz und Betrieb', 'Deployment and operation'), [
      t('Ganze Pipeline mit Metadaten gespeichert (Version, Library-Versionen, Features, Seed, Metriken mit Baseline), Laden getestet', 'Whole pipeline saved with metadata (version, library versions, features, seed, metrics with baseline), loading tested'),
      t('Model Card geschrieben: Zweck, Daten, Metriken, Grenzen, Lizenz', 'Model card written: purpose, data, metrics, limits, licence'),
      t('Eingaben im Einsatz geprüft: fehlende Spalten, unbekannte Kategorien, Werte ausserhalb des Trainingsbereichs', 'Inputs checked in use: missing columns, unknown categories, values outside the training range'),
      t('Verteilung der Eingaben und, sobald bekannt, die Metrik werden überwacht', 'Distribution of the inputs and, once known, the metric are monitored'),
      t('Neue Version auf festen und aktuellen Testdaten gegen die alte geprüft', 'New version checked against the old one on fixed and recent test data'),
      t('Alte Version archiviert, Rollback möglich', 'Old version archived, rollback possible'),
    ]],
  ];
  let ci = 0;
  const checklist = '<div class="ue-checkbar"><span class="ue-prog" id="ueCheckProg"></span><button type="button" class="ue-reset" id="ueCheckReset">' + t('Alle Häkchen entfernen', 'Clear all ticks') + '</button></div>' +
    '<div class="sbgrid" id="ueChecks">' + CHECKS.map(function (g) {
      return '<div class="sb ue-check"><h4>' + g[0] + '</h4>' + g[1].map(function (txt) {
        ci += 1;
        return '<label><input type="checkbox" id="ue-c' + ci + '"><span>' + txt + '</span></label>';
      }).join('') + '</div>';
    }).join('') + '</div>';

  const vorgehen = `
  <h3 id="ue-vorgehen">${t('Neues ML-Problem: So gehst du vor', 'A new ML problem: how to approach it')}</h3>
  <p>${t('Bevor du ein Modell auswählst, kommt die Frage nach dem Vorgehen. Die Faustregel: Bei Bild, Text und Audio fängst du mit einem vortrainierten Modell an und trainierst es höchstens nach. Bei Tabellen fängst du mit Gradient Boosting an. Und vor allem anderen steht eine Baseline.', 'Before you choose a model comes the question of how to proceed. The rule of thumb: with images, text and audio you start with a pretrained model and at most fine-tune it. With tables you start with gradient boosting. And a baseline comes before everything else.')}</p>
  <p class="hint">${t('Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Kapiteln.', 'Click a step in the figure: the explanation opens below, with links to the matching chapters.')}</p>
  ${vorgehenFig}
  <div class="merk">${t('<b>Merksatz</b><p>Vom Einfachen zum Aufwändigen: Baseline, dann fertiges Modell, dann nachtrainieren, und eine eigene Architektur nur im Sonderfall. Gute Labels und Daten aus der echten Einsatzumgebung bringen oft mehr als ein grösseres Modell.</p>', '<b>Key point</b><p>From simple to elaborate: baseline, then a finished model, then fine-tuning, and your own architecture only in special cases. Good labels and data from the real deployment environment often help more than a bigger model.</p>')}</div>

  <h3 id="ue-dodont">Do &amp; Don’t</h3>
  <div class="sbgrid">
    <div class="sb ue-do"><h4>Do</h4><ul>
      <li>${t('Einfach starten (wenige Layers, kleines Modell wie YOLOv8n), Komplexität nur bei Bedarf erhöhen', 'Start simple (few layers, a small model such as YOLOv8n), add complexity only when needed')}</li>
      <li>${t('Bei Bild, Text, Audio: vortrainiertes Modell, zuerst zero-shot testen', 'With images, text, audio: a pretrained model, test it zero-shot first')}</li>
      <li>${t('Bei Tabellen: Gradient Boosting vor Deep Learning', 'With tables: gradient boosting before deep learning')}</li>
      <li>${t('In Datenqualität investieren: saubere Labels, Daten aus der Einsatzumgebung', 'Invest in data quality: clean labels, data from the deployment environment')}</li>
      <li>${t('Alles, was aus Daten lernt, in eine <code>Pipeline</code>', 'Put everything that learns from data in a <code>Pipeline</code>')}</li>
      <li>${t('Lieber in bestehende Prozesse einbauen als neue erfinden', 'Rather build into existing processes than invent new ones')}</li>
      <li>${t('Seed setzen und notieren', 'Set and note the seed')}</li>
      <li>${t('Das Modell auf den eigenen Validierungsdaten wählen, nicht nach Benchmark oder Erscheinungsdatum', 'Choose the model on your own validation data, not by benchmark or release date')}</li>
    </ul><div class="sb-f"><a href="#ml-best">${t('Best Practices Supervised ML →', 'Best practices supervised ML →')}</a><a href="#cnn-best">${t('CNN →', 'CNN →')}</a><a href="#det-best">${t('Detection →', 'Detection →')}</a></div></div>
    <div class="sb ue-dont"><h4>Don’t</h4><ul>
      <li>${t('Imputer oder Scaler auf allen Daten fitten (Data Leakage)', 'Fit the imputer or scaler on all data (data leakage)')}</li>
      <li>${t('Hyperparameter am Testset wählen oder das Testset mehrfach benutzen', 'Choose hyperparameters on the test set or use the test set several times')}</li>
      <li>${t('Testdaten ohne dieselbe Vorverarbeitung ins Modell geben', 'Feed test data to the model without the same preprocessing')}</li>
      <li>${t('Ohne Baseline behaupten, das Modell sei gut', 'Claim the model is good without a baseline')}</li>
      <li>${t('Das grösste Modell nehmen, ohne Latenz und Hardware zu prüfen', 'Take the biggest model without checking latency and hardware')}</li>
      <li>${t('Die Lizenz ignorieren', 'Ignore the licence')}</li>
      <li>${t('Ein schweres Modell zu kurz trainieren: Es bleibt auf dem Niveau der Baseline', 'Train a heavy model too briefly: it stays at the level of the baseline')}</li>
      <li>${t('Mit wenig Daten das ganze Netz fine-tunen: Overfitting oder Catastrophic Forgetting', 'Fine-tune the whole network with little data: overfitting or catastrophic forgetting')}</li>
      <li>${t('Fremde <code>.pkl</code>- oder <code>.joblib</code>-Dateien laden: Sie führen beim Laden Code aus', 'Load someone else’s <code>.pkl</code> or <code>.joblib</code> files: they run code when loaded')}</li>
    </ul><div class="sb-f"><a href="#klass-leakage">Data Leakage →</a><a href="#mo-speichern">${t('Speichern und laden →', 'Saving and loading →')}</a></div></div>
  </div>

  <h3 id="ue-check">${t('Checkliste für ein neues Projekt', 'Checklist for a new project')}</h3>
  <p>${t('Zum Abhaken. Die Häkchen bleiben in diesem Browser gespeichert (mit dem lokalen Server auch browserübergreifend).', 'To tick off. The ticks are kept in this browser (with the local server also across browsers).')}</p>
  ${checklist}
`;

  const praxis = t(`
  <h3 id="ue-praxis">Ein Modell in der Praxis</h3>
  <p>In jedem Kapitel hiess es «das Modell lernt» oder «wir trainieren ein Modell». Die folgenden Abschnitte treten einen Schritt zurück: <b>Was ist ein Modell eigentlich</b>, was steckt in einer Modelldatei, wann nimmt man ein fertiges Modell statt ein eigenes, und was passiert, wenn das Modell im Einsatz langsam schlechter wird? Sie vertiefen die Schritte 3b und 7 der Grafik oben.</p>
  <p class="note">Die Demos rechnen im Browser. Das Beispiel-Notebook am Ende der Seite macht dasselbe mit scikit-learn: Pipeline speichern, laden, Drift simulieren, neu trainieren.</p>
  <h3 id="mo-was">Was ist ein Modell eigentlich?</h3>
  <p>Ein Modell ist eine <b>Funktion mit gelernten Zahlen</b>. Es bekommt eine Eingabe x und gibt eine Vorhersage ŷ aus:</p>
  <pre><code>ŷ = f(x; θ)
f = Architektur (die Form der Funktion)    θ = Parameter (die gelernten Zahlen)</code></pre>
  <p>Ein Modell hat damit drei Teile, die man auseinanderhalten muss:</p>
  <div class="tablewrap"><table>
    <tr><th>Teil</th><th>Was es ist</th><th>Wer es festlegt</th><th>Beispiel lineare Regression</th></tr>
    <tr><td><b>Architektur</b></td><td>Die Form der Funktion: welche Rechenschritte in welcher Reihenfolge</td><td>Du, beim Wählen des Modells</td><td><code>ŷ = w · x + b</code></td></tr>
    <tr><td><b>Parameter</b></td><td>Die Zahlen in der Funktion, die beim Training gefunden werden</td><td>Das Training (<code>fit</code>)</td><td><code>w = 17.2</code>, <code>b = 612</code></td></tr>
    <tr><td><b>Hyperparameter</b></td><td>Einstellungen, die das Training steuern, aber nicht gelernt werden</td><td>Du, gewählt auf der Validation</td><td>Learning Rate, Epochs, Regularisierung <code>alpha</code></td></tr>
  </table></div>
  <p>Dazu kommen zwei Begriffe, die oft verwechselt werden. Der <b>Algorithmus</b> ist das Verfahren, mit dem die Parameter gefunden werden (z. B. Gradient Descent oder die Normalengleichung). Das <b>Modell</b> ist das Ergebnis: Architektur plus gefundene Parameter. Beim <b>Training</b> ändern sich die Parameter; bei der <b>Inferenz</b> (<code>predict</code>) bleiben sie fest, das Modell wird nur noch angewendet.</p>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Architektur</th><th>Parameter</th><th>Grösse (ungefähr)</th></tr>
    <tr><td><b>Lineare Regression</b>, 8 Features</td><td>gewichtete Summe</td><td>8 Gewichte + 1 Bias</td><td>unter 1 KB</td></tr>
    <tr><td><b>Entscheidungsbaum</b></td><td>verschachtelte Wenn-dann-Regeln</td><td>pro Knoten Feature und Threshold, pro Blatt ein Wert</td><td>KB</td></tr>
    <tr><td><b>Random Forest</b>, 100 Bäume</td><td>Mittelwert vieler Bäume</td><td>alle Knoten aller Bäume</td><td>MB bis über 100 MB</td></tr>
    <tr><td><b>kNN</b></td><td>«frag die k nächsten Nachbarn»</td><td>keine im engeren Sinn: Das Modell <i>ist</i> der Trainingsdatensatz</td><td>so gross wie die Trainingsdaten</td></tr>
    <tr><td><b>ResNet-50</b> (CNN)</td><td>50 Schichten mit Convolutions und Skip Connections</td><td>rund 25,6 Mio. Gewichte</td><td>etwa 100 MB (float32)</td></tr>
    <tr><td><b>BERT-base</b> (Transformer)</td><td>12 Transformer-Blöcke</td><td>rund 110 Mio. Gewichte</td><td>etwa 440 MB (float32)</td></tr>
    <tr><td><b>LLM</b> mit 7 Mrd. Parametern</td><td>Dutzende Transformer-Blöcke</td><td>7 Mrd. Gewichte</td><td>etwa 14 GB (16 Bit pro Gewicht)</td></tr>
  </table></div>
  <p>Die Grösse folgt direkt aus der Zahl der Parameter: Anzahl × Bytes pro Zahl. Ein float32 braucht 4 Bytes, 25,6 Mio. × 4 B ≈ 100 MB.</p>
  <div class="demo" id="moFileDemo">
    <div class="tag">Demo</div><h4>Ein Modell ist nur eine Datei mit Zahlen</h4>
    <p class="hint">Zwölf Wohnungen: Wohnfläche gegen Monatsmiete. Trainiere die lineare Regression mit mehr oder weniger Epochs und schau, was in der «Modelldatei» rechts steht. Danach rechnet die Vorhersage unten <b>nur</b> mit dieser Datei. Schalte die Vorverarbeitung aus und sieh, was dann passiert.</p>
    <div class="ctl"><label for="moEp">Epochs (Gradient Descent)</label><input type="range" id="moEp" min="0" max="200" step="5" value="60"><output id="moEpO"></output></div>
    <div class="ctl"><label for="moQ">Vorhersage für Wohnfläche (m²)</label><input type="range" id="moQ" min="30" max="130" step="1" value="85"><output id="moQO"></output></div>
    <div class="btnrow" id="moScl" role="group" aria-label="Vorverarbeitung in der Datei"><button data-v="1" class="pri" aria-pressed="true">Scaler mitgespeichert</button><button data-v="0" aria-pressed="false">nur das Modell gespeichert</button></div>
    <div class="mo-file">
      <svg class="plot" id="moFileSvg" viewBox="0 0 360 240" role="img" aria-label="Streudiagramm Wohnfläche gegen Miete mit der gelernten Geraden"></svg>
      <pre class="mo-json"><code id="moJson"></code></pre>
    </div>
    <div class="stats"><span>MAE <b id="moMae"></b></span><span>Vorhersage <b id="moPred"></b></span></div>
    <p class="hint" id="moFileMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Modell = Architektur + gelernte Parameter. Die Hyperparameter haben bestimmt, <i>wie</i> gelernt wurde, gehören aber nicht zur Rechnung. Zur Vorhersage braucht man ausserdem genau dieselbe Vorverarbeitung wie beim Training: Scaler, Encoder, Spaltenreihenfolge, Bildgrösse.</p></div>
  <div class="falle"><b>Falle</b><p>Nur das Modell speichern und den Scaler vergessen. Das Modell rechnet dann mit unskalierten Zahlen und liefert Unsinn, ohne Fehlermeldung. Darum speichert man in scikit-learn die ganze <code>Pipeline</code>, nicht nur den Schätzer.</p></div>

  <h3 id="mo-quelle">Woher kommt ein Modell? Selbst trainieren, übernehmen, anpassen</h3>
  <p>Ein Modell muss man nicht immer von null trainieren. Für Bilder, Text und Audio gibt es <b>vortrainierte Modelle</b>, die auf riesigen Datensätzen gelernt haben (ImageNet: 1,28 Mio. Bilder in 1000 Klassen). Ihre frühen Schichten erkennen allgemeine Muster (Kanten, Formen, Wortbedeutungen), die auch für deine Aufgabe nützlich sind.</p>
  <div class="tablewrap"><table>
    <tr><th>Weg</th><th>Was du machst</th><th>Wann</th><th>Aufwand</th></tr>
    <tr><td><b>Von null trainieren</b></td><td>Architektur wählen, alle Parameter zufällig starten, alles lernen</td><td>Tabellendaten (fast immer), sehr viele eigene Daten, ganz neue Art von Daten</td><td>hoch bei Netzen, klein bei klassischen Modellen</td></tr>
    <tr><td><b>Fertig übernehmen</b></td><td>Vortrainiertes Modell unverändert verwenden (zero-shot)</td><td>Die Aufgabe ist genau die des Modells (z. B. ImageNet-Klassen, Übersetzung, SAM-Segmentierung)</td><td>fast keiner</td></tr>
    <tr><td><b>Transfer Learning</b></td><td>Basis einfrieren, nur einen neuen Kopf (Output Layer) trainieren</td><td>Wenig eigene Daten (hunderte bis tausende), Aufgabe ähnlich</td><td>klein</td></tr>
    <tr><td><b>Fine-Tuning</b></td><td>Danach auch obere Schichten der Basis mit sehr kleiner Learning Rate weitertrainieren</td><td>Mehr Daten (zehntausende), Aufgabe etwas anders</td><td>mittel</td></tr>
  </table></div>
  <p>Vortrainierte Modelle findest du im <b>Hugging Face Hub</b> (Text, Bild, Audio), in <b>Keras Applications</b> (<code>keras.applications.ResNet50</code>), in <b>torchvision</b> (<code>torchvision.models</code>) und für Bilder in <b>timm</b>. scikit-learn hat keine vortrainierten Modelle: Bei Tabellendaten sind die Spalten jeder Aufgabe anders, darum gibt es dort nichts Allgemeines zu übernehmen.</p>
  <pre><code># Transfer Learning mit Keras (siehe Kapitel CNN)
base = keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")
base.trainable = False                      # Basis einfrieren
model = keras.Sequential([base, keras.layers.Dense(3, activation="softmax")])
model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=5)

base.trainable = True                       # optional: Fine-Tuning
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=3)</code></pre>
  <div class="demo" id="moPickDemo">
    <div class="tag">Demo</div><h4>Welcher Weg passt?</h4>
    <p class="hint">Wähle Datentyp, Datenmenge und wie ähnlich deine Aufgabe der eines vortrainierten Modells ist.</p>
    <div class="btnrow" id="moPType" role="group" aria-label="Datentyp"><button data-v="tab" class="pri" aria-pressed="true">Tabelle</button><button data-v="img" aria-pressed="false">Bilder</button><button data-v="txt" aria-pressed="false">Text</button></div>
    <div class="btnrow" id="moPN" role="group" aria-label="Datenmenge"><button data-v="few" class="pri" aria-pressed="true">einige hundert</button><button data-v="mid" aria-pressed="false">zehntausende</button><button data-v="many" aria-pressed="false">Millionen</button></div>
    <div class="btnrow" id="moPSim" role="group" aria-label="Ähnlichkeit zur Aufgabe des vortrainierten Modells"><button data-v="same" class="pri" aria-pressed="true">gleiche Aufgabe</button><button data-v="near" aria-pressed="false">ähnlich</button><button data-v="far" aria-pressed="false">ganz anders</button></div>
    <div class="mo-rec" id="moPRec" aria-live="polite"></div>
  </div>
  <h4>Vortrainiertes Modell prüfen</h4>
  <ul>
    <li><b>Vorverarbeitung:</b> Ein vortrainiertes Modell erwartet <b>seine</b> Vorverarbeitung: dieselbe Bildgrösse, dieselbe Normalisierung (z. B. <code>keras.applications.resnet50.preprocess_input</code>), denselben Tokenizer und dieselben Klassen-IDs (COCO: 91 gegen 80 IDs).</li>
    <li><b>Lizenz:</b> Nicht jedes Modell ist kommerziell nutzbar (YOLOv8: AGPL).</li>
    <li><b>Domain Shift:</b> Ein Modell kennt nur seine Trainingsdaten. Alltagsfotos (COCO, ImageNet) helfen wenig bei Röntgen- oder Mikroskopbildern, ein Modell für Tageslicht versagt nachts. Dann mit Daten aus der Einsatzumgebung nachtrainieren.</li>
    <li><b>Grösse und Latenz:</b> Läuft es auf der Zielhardware, in Echtzeit? (YOLOv8n gegen YOLOv8x)</li>
    <li><b>Datenqualität:</b> Saubere Labels bringen oft mehr als ein grösseres Modell.</li>
  </ul>

  <h3 id="mo-speichern">Speichern und laden</h3>
  <p>Nach dem Training liegt das Modell im Arbeitsspeicher. Damit es später (oder auf einem anderen Rechner) Vorhersagen machen kann, wird es gespeichert: Architektur und Parameter, bei scikit-learn zusätzlich die ganze Vorverarbeitung.</p>
  <div class="tablewrap"><table>
    <tr><th>Framework</th><th>Speichern</th><th>Laden</th><th>Was drin ist</th></tr>
    <tr><td><b>scikit-learn</b></td><td><code>joblib.dump(pipe, "modell.joblib")</code></td><td><code>joblib.load("modell.joblib")</code></td><td>Das ganze Python-Objekt (Pipeline mit Scaler und Modell)</td></tr>
    <tr><td><b>Keras</b></td><td><code>model.save("modell.keras")</code></td><td><code>keras.models.load_model("modell.keras")</code></td><td>Architektur, Gewichte, Optimizer-Zustand</td></tr>
    <tr><td><b>PyTorch</b></td><td><code>torch.save(model.state_dict(), "modell.pt")</code></td><td><code>model.load_state_dict(torch.load("modell.pt", weights_only=True))</code></td><td>Nur die Gewichte; die Architektur ist dein Python-Code</td></tr>
    <tr><td><b>Hugging Face</b></td><td><code>model.save_pretrained("ordner")</code></td><td><code>AutoModel.from_pretrained("ordner")</code></td><td>Gewichte (<code>.safetensors</code>), Konfiguration, Tokenizer</td></tr>
    <tr><td><b>ONNX</b></td><td>Export aus PyTorch, Keras, scikit-learn</td><td>ONNX Runtime (Python, C#, JavaScript …)</td><td>Rechengraph und Gewichte, unabhängig vom Framework</td></tr>
  </table></div>
  <pre><code>import json, joblib, sklearn
from datetime import date

pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

joblib.dump(pipe, "modell_v1.joblib")                 # ganze Pipeline, nicht nur das Modell
meta = {"version": "v1", "datum": str(date.today()), "sklearn": sklearn.__version__,
        "features": list(X_train.columns), "seed": 42,
        "val_accuracy": 0.87, "baseline_accuracy": 0.61, "n_train": len(X_train)}
json.dump(meta, open("modell_v1.json", "w"), indent=2)  # Metadaten daneben

pipe2 = joblib.load("modell_v1.joblib")
assert (pipe2.predict(X_val) == pipe.predict(X_val)).all()   # Laden prüfen</code></pre>
  <p>Zur Datei gehören <b>Metadaten</b>: Version, Datum, Versionen der Libraries, Feature-Namen in der richtigen Reihenfolge, Seed, Metriken mit Baseline und Datenmenge. Ausführlicher ist eine <b>Model Card</b>: Wofür ist das Modell gedacht und wofür nicht, mit welchen Daten wurde es trainiert, wie gut ist es auf welchen Gruppen, welche Grenzen sind bekannt? Hugging Face zeigt sie auf jeder Modellseite.</p>
  <div class="falle"><b>Falle</b><p><code>pickle</code> und <code>joblib</code> führen beim Laden Code aus. Eine fremde <code>.pkl</code>- oder <code>.joblib</code>-Datei zu laden ist so riskant wie ein fremdes Programm zu starten. Nur eigene oder vertrauenswürdige Dateien laden; für fremde Gewichte gibt es <code>.safetensors</code> und <code>torch.load(…, weights_only=True)</code>. Ausserdem passt eine joblib-Datei nur sicher zur selben scikit-learn-Version (sonst <code>InconsistentVersionWarning</code>), darum die Version in den Metadaten.</p></div>

  <h3 id="mo-neu">Neu trainieren: wann und wie</h3>
  <p>Ein Modell ist eine Momentaufnahme der Trainingsdaten. Die Welt ändert sich danach weiter, und das Modell merkt es nicht. Man spricht von <b>Drift</b>:</p>
  <ul>
    <li><b>Data Drift</b> (Covariate Shift): Die Eingaben verteilen sich anders. Beispiel: Ein neuer Sensor misst systematisch höher, Kunden werden jünger, Fotos kommen von einer anderen Kamera.</li>
    <li><b>Concept Drift</b>: Der Zusammenhang zwischen x und y ändert sich. Beispiel: Nach einer Zinserhöhung bedeuten dieselben Kundendaten ein anderes Kreditrisiko; Spam-Mails ändern ihren Stil.</li>
    <li><b>Neue Klassen oder neue Fragen</b>: Ein neues Produkt soll erkannt werden, das es beim Training nicht gab. Dann muss das Modell (mindestens der Output Layer) angepasst werden.</li>
  </ul>
  <p>Erkennen kann man Drift, indem man im Einsatz die <b>Verteilung der Eingaben</b> mit der der Trainingsdaten vergleicht (Mittelwerte, Histogramme, Anteil unbekannter Kategorien) und, sobald die echten Antworten bekannt sind, die <b>Metrik laufend nachrechnet</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Variante</th><th>Wie</th><th>Gut wenn</th><th>Risiko</th></tr>
    <tr><td><b>Komplett neu</b></td><td>Gleiche Pipeline, auf alten + neuen Daten neu <code>fit</code></td><td>Klassische Modelle, Training dauert Minuten</td><td>Alte Daten, die nicht mehr gelten, ziehen das Modell zurück</td></tr>
    <tr><td><b>Nur auf neuen Daten</b></td><td>Neu <code>fit</code> auf einem aktuellen Zeitfenster</td><td>Starker Concept Drift, alte Daten sind veraltet</td><td>Vergisst seltene Fälle, die nur in alten Daten vorkamen</td></tr>
    <tr><td><b>Weitertrainieren</b></td><td>Vom gespeicherten Modell aus weiter lernen: <code>partial_fit</code>, <code>warm_start=True</code>, bei Netzen <code>fit</code> mit kleiner Learning Rate</td><td>Grosse Netze, laufend neue Daten</td><td><b>Catastrophic Forgetting</b>: Das Netz verlernt Altes, wenn es nur Neues sieht</td></tr>
    <tr><td><b>Nur den Kopf neu</b></td><td>Basis behalten, Output Layer neu (z. B. für eine neue Klasse)</td><td>Neue Klassen, Basis ist gut</td><td>Basis lernt nichts Neues</td></tr>
  </table></div>
  <div class="demo" id="moDriftDemo">
    <div class="tag">Demo</div><h4>Drift: Ein altes Modell wird schlechter</h4>
    <p class="hint">Das Modell (logistische Regression) wurde auf den Daten von «Monat 0» trainiert. Schiebe die Zeit nach rechts: Die Punkte verschieben sich (Data Drift), und die Grenze zwischen den Klassen dreht sich (Concept Drift). Dann trainiere neu und vergleiche.</p>
    <div class="ctl"><label for="moDr">Zeit (Monate seit dem Training)</label><input type="range" id="moDr" min="0" max="12" step="1" value="9"><output id="moDrO"></output></div>
    <div class="btnrow" id="moDrMode" role="group" aria-label="Neu trainieren"><button data-v="old" class="pri" aria-pressed="true">altes Modell behalten</button><button data-v="new" aria-pressed="false">neu trainieren: nur aktuelle Daten</button><button data-v="all" aria-pressed="false">neu trainieren: alte + aktuelle Daten</button></div>
    <svg class="plot" id="moDrSvg" viewBox="0 0 400 300" role="img" aria-label="Punkte zweier Klassen mit der Grenze des alten und des neuen Modells"></svg>
    <div class="stats"><span>Altes Modell, aktuelle Daten <b id="moAccOld"></b></span><span>Gewähltes Modell, aktuelle Daten <b id="moAccNew"></b></span><span>Gewähltes Modell, Daten von Monat 0 <b id="moAccPast"></b></span><span>Baseline <b>0.50</b></span></div>
    <p class="hint" id="moDrMsg"></p>
  </div>
  <p>Beim Vergleich gilt dieselbe Regel wie beim ersten Training: Die neue Version muss auf <b>denselben Testdaten mit derselben Metrik</b> besser sein als die alte, sonst bleibt die alte. Sinnvoll sind zwei Testsets: ein festes, das nie ändert (prüft, ob Altes vergessen wurde), und ein aktuelles aus der jüngsten Zeit (prüft, ob die Drift aufgefangen ist).</p>
  <div class="merk"><b>Merksatz</b><p>Jedes Modell veraltet. Eingaben und Metriken im Einsatz überwachen, bei Drift mit derselben Pipeline neu trainieren, die neue Version auf festen und aktuellen Testdaten gegen die alte prüfen und erst dann austauschen. Die alte Version bleibt gespeichert, damit man zurückwechseln kann (Rollback).</p></div>
  <div class="falle"><b>Falle</b><p>Beim Retraining die Testdaten mit in die Trainingsdaten werfen («wir haben ja jetzt mehr Daten»). Dann hat man keine ehrliche Messung mehr. Ebenso: Feedback Loops. Wenn das Modell entscheidet, welche Fälle überhaupt ein Label bekommen (z. B. nur genehmigte Kredite zeigen, ob sie zurückbezahlt werden), sieht das neue Training nur noch die Fälle, die das alte Modell durchgelassen hat.</p></div>

  <h4>Begriffe</h4>
  <div class="tablewrap"><table>
    <tr><th>Begriff</th><th>Bedeutung</th></tr>
    <tr><td><b>Inferenz</b></td><td>Das fertige Modell anwenden (<code>predict</code>), ohne die Parameter zu ändern</td></tr>
    <tr><td><b>Checkpoint</b></td><td>Zwischenstand der Gewichte während des Trainings, z. B. die beste Epoch (<code>ModelCheckpoint</code>)</td></tr>
    <tr><td><b>Weights</b></td><td>Die Parameter eines Netzes; «vortrainierte Weights» heisst: die gelernten Zahlen eines fremden Trainings</td></tr>
    <tr><td><b>Model Card</b></td><td>Kurzbeschreibung eines Modells: Zweck, Daten, Metriken, Grenzen, Lizenz</td></tr>
    <tr><td><b>Model Registry</b></td><td>Ablage für Modellversionen mit Metadaten und Status (z. B. MLflow): Welche Version läuft, welche ist archiviert</td></tr>
    <tr><td><b>Drift</b></td><td>Daten (Data Drift) oder Zusammenhang (Concept Drift) ändern sich nach dem Training</td></tr>
    <tr><td><b>Rollback</b></td><td>Zur vorherigen Modellversion zurückwechseln, wenn die neue schlechter ist</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Ein Modell ist erst fertig, wenn ein anderer Mensch es laden, verstehen und mit neuen Daten genauso neu trainieren kann. Dafür braucht es Pipeline, Metadaten, Seed, Versionen und eine Model Card, nicht nur eine Datei mit Gewichten.</p></div>`, `
  <h3 id="ue-praxis">A model in practice</h3>
  <p>Every chapter said “the model learns” or “we train a model”. The following sections take a step back: <b>what actually is a model</b>, what is inside a model file, when do you take a ready-made model instead of your own, and what happens when the model slowly gets worse in use? They go deeper into steps 3b and 7 of the figure above.</p>
  <p class="note">The demos compute in the browser. The example notebook at the end of the page does the same with scikit-learn: save a pipeline, load it, simulate drift, retrain.</p>
  <h3 id="mo-was">What actually is a model?</h3>
  <p>A model is a <b>function with learned numbers</b>. It takes an input x and returns a prediction ŷ:</p>
  <pre><code>ŷ = f(x; θ)
f = architecture (the shape of the function)    θ = parameters (the learned numbers)</code></pre>
  <p>So a model has three parts that need to be kept apart:</p>
  <div class="tablewrap"><table>
    <tr><th>Part</th><th>What it is</th><th>Who sets it</th><th>Example linear regression</th></tr>
    <tr><td><b>Architecture</b></td><td>The shape of the function: which computation steps in which order</td><td>You, when choosing the model</td><td><code>ŷ = w · x + b</code></td></tr>
    <tr><td><b>Parameters</b></td><td>The numbers inside the function, found during training</td><td>Training (<code>fit</code>)</td><td><code>w = 17.2</code>, <code>b = 612</code></td></tr>
    <tr><td><b>Hyperparameters</b></td><td>Settings that control training but are not learned</td><td>You, chosen on validation</td><td>learning rate, epochs, regularisation <code>alpha</code></td></tr>
  </table></div>
  <p>Two more terms are often mixed up. The <b>algorithm</b> is the procedure that finds the parameters (e.g. gradient descent or the normal equation). The <b>model</b> is the result: architecture plus the parameters found. During <b>training</b> the parameters change; during <b>inference</b> (<code>predict</code>) they stay fixed and the model is only applied.</p>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>Architecture</th><th>Parameters</th><th>Size (roughly)</th></tr>
    <tr><td><b>Linear regression</b>, 8 features</td><td>weighted sum</td><td>8 weights + 1 bias</td><td>under 1 KB</td></tr>
    <tr><td><b>Decision tree</b></td><td>nested if-then rules</td><td>per node a feature and a threshold, per leaf a value</td><td>KB</td></tr>
    <tr><td><b>Random forest</b>, 100 trees</td><td>average of many trees</td><td>all nodes of all trees</td><td>MB to over 100 MB</td></tr>
    <tr><td><b>kNN</b></td><td>«ask the k nearest neighbours»</td><td>none in the strict sense: the model <i>is</i> the training set</td><td>as large as the training data</td></tr>
    <tr><td><b>ResNet-50</b> (CNN)</td><td>50 layers with convolutions and skip connections</td><td>about 25.6 million weights</td><td>about 100 MB (float32)</td></tr>
    <tr><td><b>BERT-base</b> (transformer)</td><td>12 transformer blocks</td><td>about 110 million weights</td><td>about 440 MB (float32)</td></tr>
    <tr><td><b>LLM</b> with 7 billion parameters</td><td>dozens of transformer blocks</td><td>7 billion weights</td><td>about 14 GB (16 bits per weight)</td></tr>
  </table></div>
  <p>The size follows directly from the number of parameters: count × bytes per number. A float32 takes 4 bytes, 25.6 million × 4 B ≈ 100 MB.</p>
  <div class="demo" id="moFileDemo">
    <div class="tag">Demo</div><h4>A model is just a file of numbers</h4>
    <p class="hint">Twelve flats: living area against monthly rent. Train the linear regression with more or fewer epochs and look at what is in the «model file» on the right. The prediction below then computes <b>only</b> from this file. Switch off the preprocessing and see what happens.</p>
    <div class="ctl"><label for="moEp">Epochs (gradient descent)</label><input type="range" id="moEp" min="0" max="200" step="5" value="60"><output id="moEpO"></output></div>
    <div class="ctl"><label for="moQ">Prediction for living area (m²)</label><input type="range" id="moQ" min="30" max="130" step="1" value="85"><output id="moQO"></output></div>
    <div class="btnrow" id="moScl" role="group" aria-label="Preprocessing in the file"><button data-v="1" class="pri" aria-pressed="true">scaler saved with it</button><button data-v="0" aria-pressed="false">only the model saved</button></div>
    <div class="mo-file">
      <svg class="plot" id="moFileSvg" viewBox="0 0 360 240" role="img" aria-label="Scatter plot of living area against rent with the learned line"></svg>
      <pre class="mo-json"><code id="moJson"></code></pre>
    </div>
    <div class="stats"><span>MAE <b id="moMae"></b></span><span>Prediction <b id="moPred"></b></span></div>
    <p class="hint" id="moFileMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Model = architecture + learned parameters. The hyperparameters decided <i>how</i> it learned but are not part of the computation. To predict, you also need exactly the same preprocessing as in training: scaler, encoder, column order, image size.</p></div>
  <div class="falle"><b>Pitfall</b><p>Saving only the model and forgetting the scaler. The model then computes with unscaled numbers and returns nonsense, without any error message. That is why in scikit-learn you save the whole <code>Pipeline</code>, not just the estimator.</p></div>

  <h3 id="mo-quelle">Where does a model come from? Train it, take it over, adapt it</h3>
  <p>You do not always have to train a model from scratch. For images, text and audio there are <b>pretrained models</b> that learned on huge datasets (ImageNet: 1.28 million images in 1000 classes). Their early layers recognise general patterns (edges, shapes, word meanings) that are useful for your task too.</p>
  <div class="tablewrap"><table>
    <tr><th>Way</th><th>What you do</th><th>When</th><th>Effort</th></tr>
    <tr><td><b>Train from scratch</b></td><td>Choose an architecture, start all parameters at random, learn everything</td><td>Tabular data (almost always), very much own data, a completely new kind of data</td><td>high for networks, small for classical models</td></tr>
    <tr><td><b>Use as it is</b></td><td>Use a pretrained model unchanged (zero-shot)</td><td>The task is exactly the model's (e.g. ImageNet classes, translation, SAM segmentation)</td><td>almost none</td></tr>
    <tr><td><b>Transfer learning</b></td><td>Freeze the base, train only a new head (output layer)</td><td>Little own data (hundreds to thousands), similar task</td><td>small</td></tr>
    <tr><td><b>Fine-tuning</b></td><td>Then also keep training the upper layers of the base with a very small learning rate</td><td>More data (tens of thousands), somewhat different task</td><td>medium</td></tr>
  </table></div>
  <p>You find pretrained models on the <b>Hugging Face Hub</b> (text, image, audio), in <b>Keras Applications</b> (<code>keras.applications.ResNet50</code>), in <b>torchvision</b> (<code>torchvision.models</code>) and for images in <b>timm</b>. scikit-learn has no pretrained models: with tabular data the columns of every task are different, so there is nothing general to take over.</p>
  <pre><code># Transfer learning with Keras (see the CNN chapter)
base = keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")
base.trainable = False                      # freeze the base
model = keras.Sequential([base, keras.layers.Dense(3, activation="softmax")])
model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=5)

base.trainable = True                       # optional: fine-tuning
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=3)</code></pre>
  <div class="demo" id="moPickDemo">
    <div class="tag">Demo</div><h4>Which way fits?</h4>
    <p class="hint">Choose the data type, the amount of data and how similar your task is to that of a pretrained model.</p>
    <div class="btnrow" id="moPType" role="group" aria-label="Data type"><button data-v="tab" class="pri" aria-pressed="true">Table</button><button data-v="img" aria-pressed="false">Images</button><button data-v="txt" aria-pressed="false">Text</button></div>
    <div class="btnrow" id="moPN" role="group" aria-label="Amount of data"><button data-v="few" class="pri" aria-pressed="true">a few hundred</button><button data-v="mid" aria-pressed="false">tens of thousands</button><button data-v="many" aria-pressed="false">millions</button></div>
    <div class="btnrow" id="moPSim" role="group" aria-label="Similarity to the task of the pretrained model"><button data-v="same" class="pri" aria-pressed="true">same task</button><button data-v="near" aria-pressed="false">similar</button><button data-v="far" aria-pressed="false">very different</button></div>
    <div class="mo-rec" id="moPRec" aria-live="polite"></div>
  </div>
  <h4>Checking a pretrained model</h4>
  <ul>
    <li><b>Preprocessing:</b> a pretrained model expects <b>its own</b> preprocessing: the same image size, the same normalisation (e.g. <code>keras.applications.resnet50.preprocess_input</code>), the same tokenizer and the same class IDs (COCO: 91 vs 80 IDs).</li>
    <li><b>Licence:</b> not every model may be used commercially (YOLOv8: AGPL).</li>
    <li><b>Domain shift:</b> a model only knows its training data. Everyday photos (COCO, ImageNet) help little with X-ray or microscope images, a model for daylight fails at night. Then retrain with data from the deployment environment.</li>
    <li><b>Size and latency:</b> does it run on the target hardware, in real time? (YOLOv8n vs YOLOv8x)</li>
    <li><b>Data quality:</b> clean labels often help more than a bigger model.</li>
  </ul>

  <h3 id="mo-speichern">Saving and loading</h3>
  <p>After training the model lives in memory. So that it can make predictions later (or on another computer), it is saved: architecture and parameters, with scikit-learn also the whole preprocessing.</p>
  <div class="tablewrap"><table>
    <tr><th>Framework</th><th>Save</th><th>Load</th><th>What is inside</th></tr>
    <tr><td><b>scikit-learn</b></td><td><code>joblib.dump(pipe, "model.joblib")</code></td><td><code>joblib.load("model.joblib")</code></td><td>The whole Python object (pipeline with scaler and model)</td></tr>
    <tr><td><b>Keras</b></td><td><code>model.save("model.keras")</code></td><td><code>keras.models.load_model("model.keras")</code></td><td>Architecture, weights, optimizer state</td></tr>
    <tr><td><b>PyTorch</b></td><td><code>torch.save(model.state_dict(), "model.pt")</code></td><td><code>model.load_state_dict(torch.load("model.pt", weights_only=True))</code></td><td>Only the weights; the architecture is your Python code</td></tr>
    <tr><td><b>Hugging Face</b></td><td><code>model.save_pretrained("folder")</code></td><td><code>AutoModel.from_pretrained("folder")</code></td><td>Weights (<code>.safetensors</code>), configuration, tokenizer</td></tr>
    <tr><td><b>ONNX</b></td><td>Export from PyTorch, Keras, scikit-learn</td><td>ONNX Runtime (Python, C#, JavaScript …)</td><td>Computation graph and weights, independent of the framework</td></tr>
  </table></div>
  <pre><code>import json, joblib, sklearn
from datetime import date

pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

joblib.dump(pipe, "model_v1.joblib")                  # the whole pipeline, not just the model
meta = {"version": "v1", "date": str(date.today()), "sklearn": sklearn.__version__,
        "features": list(X_train.columns), "seed": 42,
        "val_accuracy": 0.87, "baseline_accuracy": 0.61, "n_train": len(X_train)}
json.dump(meta, open("model_v1.json", "w"), indent=2)  # metadata next to it

pipe2 = joblib.load("model_v1.joblib")
assert (pipe2.predict(X_val) == pipe.predict(X_val)).all()   # check loading</code></pre>
  <p><b>Metadata</b> belong with the file: version, date, library versions, feature names in the right order, seed, metrics with baseline and amount of data. More detailed is a <b>model card</b>: what is the model meant for and what not, which data was it trained on, how good is it on which groups, which limits are known? Hugging Face shows one on every model page.</p>
  <div class="falle"><b>Pitfall</b><p><code>pickle</code> and <code>joblib</code> run code while loading. Loading someone else's <code>.pkl</code> or <code>.joblib</code> file is as risky as starting someone else's program. Only load your own or trusted files; for foreign weights there are <code>.safetensors</code> and <code>torch.load(…, weights_only=True)</code>. Also, a joblib file only reliably fits the same scikit-learn version (otherwise <code>InconsistentVersionWarning</code>), hence the version in the metadata.</p></div>

  <h3 id="mo-neu">Retraining: when and how</h3>
  <p>A model is a snapshot of its training data. The world keeps changing afterwards, and the model does not notice. This is called <b>drift</b>:</p>
  <ul>
    <li><b>Data drift</b> (covariate shift): the inputs are distributed differently. Example: a new sensor measures systematically higher, customers get younger, photos come from another camera.</li>
    <li><b>Concept drift</b>: the relationship between x and y changes. Example: after an interest rate rise, the same customer data mean a different credit risk; spam emails change their style.</li>
    <li><b>New classes or new questions</b>: a new product should be recognised that did not exist at training time. Then the model (at least the output layer) has to be adapted.</li>
  </ul>
  <p>You detect drift by comparing the <b>distribution of the inputs</b> in use with that of the training data (means, histograms, share of unknown categories) and, as soon as the true answers are known, by <b>recomputing the metric</b> continuously.</p>
  <div class="tablewrap"><table>
    <tr><th>Variant</th><th>How</th><th>Good when</th><th>Risk</th></tr>
    <tr><td><b>Completely new</b></td><td>Same pipeline, new <code>fit</code> on old + new data</td><td>Classical models, training takes minutes</td><td>Old data that no longer hold pull the model back</td></tr>
    <tr><td><b>New data only</b></td><td>New <code>fit</code> on a recent time window</td><td>Strong concept drift, old data are outdated</td><td>Forgets rare cases that only occurred in old data</td></tr>
    <tr><td><b>Keep training</b></td><td>Continue from the saved model: <code>partial_fit</code>, <code>warm_start=True</code>, for networks <code>fit</code> with a small learning rate</td><td>Large networks, continuous new data</td><td><b>Catastrophic forgetting</b>: the network unlearns old things when it only sees new ones</td></tr>
    <tr><td><b>New head only</b></td><td>Keep the base, new output layer (e.g. for a new class)</td><td>New classes, the base is good</td><td>The base learns nothing new</td></tr>
  </table></div>
  <div class="demo" id="moDriftDemo">
    <div class="tag">Demo</div><h4>Drift: an old model gets worse</h4>
    <p class="hint">The model (logistic regression) was trained on the data of «month 0». Move time to the right: the points shift (data drift), and the boundary between the classes rotates (concept drift). Then retrain and compare.</p>
    <div class="ctl"><label for="moDr">Time (months since training)</label><input type="range" id="moDr" min="0" max="12" step="1" value="9"><output id="moDrO"></output></div>
    <div class="btnrow" id="moDrMode" role="group" aria-label="Retrain"><button data-v="old" class="pri" aria-pressed="true">keep the old model</button><button data-v="new" aria-pressed="false">retrain: current data only</button><button data-v="all" aria-pressed="false">retrain: old + current data</button></div>
    <svg class="plot" id="moDrSvg" viewBox="0 0 400 300" role="img" aria-label="Points of two classes with the boundary of the old and the new model"></svg>
    <div class="stats"><span>Old model, current data <b id="moAccOld"></b></span><span>Chosen model, current data <b id="moAccNew"></b></span><span>Chosen model, data of month 0 <b id="moAccPast"></b></span><span>Baseline <b>0.50</b></span></div>
    <p class="hint" id="moDrMsg"></p>
  </div>
  <p>The comparison follows the same rule as the first training: the new version must be better on <b>the same test data with the same metric</b> as the old one, otherwise the old one stays. Two test sets make sense: a fixed one that never changes (checks whether old things were forgotten), and a recent one (checks whether the drift is handled).</p>
  <div class="merk"><b>Key point</b><p>Every model ages. Monitor inputs and metrics in use, retrain with the same pipeline on drift, check the new version against the old one on fixed and recent test data and only then swap. The old version stays saved so you can switch back (rollback).</p></div>
  <div class="falle"><b>Pitfall</b><p>Throwing the test data into the training data when retraining («we have more data now»). Then there is no honest measurement left. Likewise: feedback loops. If the model decides which cases get a label at all (e.g. only approved loans show whether they are repaid), the new training only sees the cases the old model let through.</p></div>

  <h4>Terms</h4>
  <div class="tablewrap"><table>
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td><b>Inference</b></td><td>Applying the finished model (<code>predict</code>) without changing the parameters</td></tr>
    <tr><td><b>Checkpoint</b></td><td>Snapshot of the weights during training, e.g. the best epoch (<code>ModelCheckpoint</code>)</td></tr>
    <tr><td><b>Weights</b></td><td>The parameters of a network; «pretrained weights» means the learned numbers of someone else's training</td></tr>
    <tr><td><b>Model card</b></td><td>Short description of a model: purpose, data, metrics, limits, licence</td></tr>
    <tr><td><b>Model registry</b></td><td>Store for model versions with metadata and status (e.g. MLflow): which version runs, which is archived</td></tr>
    <tr><td><b>Drift</b></td><td>The data (data drift) or the relationship (concept drift) change after training</td></tr>
    <tr><td><b>Rollback</b></td><td>Switching back to the previous model version when the new one is worse</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>A model is only finished when another person can load it, understand it and retrain it the same way with new data. That takes pipeline, metadata, seed, versions and a model card, not just a file of weights.</p></div>`);

  function grid(cards) { return '<div class="sbgrid">' + cards.join('') + '</div>'; }

  LernApp.register({
    id: 'uebersicht',
    order: 95,
    nav: t('Übersicht & Praxis', 'Overview & practice'),
    title: t('Übersicht und Praxis: vom Problem zum Modell im Einsatz', 'Overview and practice: from the problem to a model in use'),
    kicker: t('Zum Schluss · Vorgehen, Praxis, alle Modelle', 'To finish · approach, practice, all models'),
    summary: t('Vorgehen bei einem neuen ML-Problem mit Checkliste, was ein Modell ist, vortrainierte Modelle, speichern und laden, Drift und neu trainieren, Steckbriefe aller Modelle von der linearen Regression bis zu Stable Diffusion, Checklisten der Strategien und eine Entscheidungshilfe', 'How to approach a new ML problem with a checklist, what a model is, pretrained models, saving and loading, drift and retraining, profiles of all models from linear regression to Stable Diffusion, strategy checklists and a decision guide'),
    html: `
  <p>${t('Das letzte Kapitel verbindet alles: zuerst das Vorgehen bei einem neuen ML-Problem mit Ablauf, Do &amp; Don’t und Checkliste, dann die Praxis rund um ein Modell (was ein Modell ist, woher es kommt, speichern und laden, neu trainieren), zum Schluss Steckbriefe aller Modelle und Checklisten der Strategien.', 'The last chapter ties everything together: first how to approach a new ML problem with a workflow, Do &amp; Don’t and a checklist, then the practice around a model (what a model is, where it comes from, saving and loading, retraining), finally profiles of all models and strategy checklists.')}</p>
  <p>${t('Diese Seite fasst die Kapitel <a href="#ml">Supervised ML</a>, <a href="#klass">Klassifikation</a>, <a href="#unsup">Unsupervised</a>, <a href="#nn">Neural Networks</a>, <a href="#cnn">CNN</a>, <a href="#cv">Image Processing</a>, <a href="#det">Object Detection</a> und <a href="#gen">Generative Models</a> zum Lernen zusammen. Zu jedem Modell gibt es einen Steckbrief, zu jeder Strategie eine kurze Checkliste. Über «ausführlich →» kommst du zur Erklärung mit Demo, über «Beispiele →» zu einem Notebook mit lauffähigem Code (lokal mit Jupyter oder in Google Colab), wo es eines gibt.', 'This page summarises the chapters <a href="#ml">Supervised ML</a>, <a href="#klass">Classification</a>, <a href="#unsup">Unsupervised</a>, <a href="#nn">Neural Networks</a>, <a href="#cnn">CNN</a>, <a href="#cv">Image Processing</a>, <a href="#det">Object Detection</a> and <a href="#gen">Generative Models</a> for revision. Each model has a profile, each strategy a short checklist. “in detail →” takes you to the explanation with a demo, “Examples →” to a notebook with runnable code (locally with Jupyter or in Google Colab) where there is one.')}</p>

${vorgehen}
${praxis}
  <h3 id="ue-begriffe">${t('Die Begriffe in Kürze', 'The terms in brief')}</h3>
  <ul>
    <li><b>Supervised:</b> ${t('Zu den Trainingsdaten ist das Ergebnis (Label) bekannt. Das Modell soll für neue, ungesehene Daten eine Prediction liefern.', 'The result (label) is known for the training data. The model should make a prediction for new, unseen data.')} <a href="#ml">→</a></li>
    <li><b>Classification:</b> ${t('Supervised mit vorgegebenen Klassen: Jedes Beispiel wird einer Klasse zugeordnet.', 'Supervised with given classes: every example is assigned to one class.')} <a href="#klass">→</a></li>
    <li><b>Unsupervised:</b> ${t('Es gibt keine Zielspalte. Man sucht Struktur und Zusammenhänge in den Daten (Clustering, Dimensionsreduktion, Anomalien).', 'There is no target column. You look for structure and relationships in the data (clustering, dimensionality reduction, anomalies).')} <a href="#unsup">→</a></li>
    <li><b>Neural Network:</b> ${t('Viele gewichtete Summen (wie lineare Regressionen), jeweils mit nichtlinearer Activation Function, in Schichten zu einem Netz verknüpft.', 'Many weighted sums (like linear regressions), each with a nonlinear activation function, linked in layers to form a network.')} <a href="#nn">→</a></li>
    <li><b>CNN:</b> ${t('Neural Network für Bilder. Die Pixel werden nicht zu einem Vektor abgeflacht. Ein Filter mit geteilten Gewichten gleitet über das Bild, darum bleibt die Nachbarschaft erhalten.', 'Neural network for images. The pixels are not flattened into a vector. A filter with shared weights slides over the image, so the neighbourhood is preserved.')} <a href="#cnn">→</a></li>
    <li><b>Image Processing:</b> ${t('Bilder verarbeiten oder reparieren, z. B. Blurring, Denoising, Deblurring, Super-Resolution.', 'Process or repair images, e.g. blurring, denoising, deblurring, super-resolution.')} <a href="#cv">→</a></li>
    <li><b>Object Detection:</b> ${t('Objekte in einem Bild finden: Box, Klasse und Score pro Objekt (z. B. YOLO, Faster R-CNN).', 'Find objects in an image: box, class and score per object (e.g. YOLO, Faster R-CNN).')} <a href="#det-detection">→</a></li>
    <li><b>Segmentation:</b> ${t('Jeder Pixel bekommt eine Klasse (Semantic Segmentation), z. B. mit U-Net. SAM trennt ein Objekt per Prompt ab.', 'Every pixel gets a class (semantic segmentation), e.g. with a U-Net. SAM cuts out one object by prompt.')} <a href="#det-seg">→</a></li>
  </ul>

  <h3 id="ue-wahl">${t('Welches Modell wann?', 'Which model when?')}</h3>
  <div class="ue-tree">
    <div class="ue-q">${t('Gibt es eine Zielspalte <code>y</code> mit der richtigen Antwort?', 'Is there a target column <code>y</code> with the right answer?')}</div>
    <div class="ue-branches">
      <div class="ue-b"><b>${t('Ja → Supervised', 'Yes → Supervised')}</b>
        <div class="ue-q">${t('Ist <code>y</code> eine Zahl oder eine Klasse?', 'Is <code>y</code> a number or a class?')}</div>
        <div class="ue-leaf">${t('<b>Zahl → Regression</b>Start: Lineare Regression. Overfitting → Ridge/Lasso. Gebogen → Polynom, Random Forest, Gradient Boosting.', '<b>Number → Regression</b>Start: linear regression. Overfitting → Ridge/Lasso. Curved → polynomial, Random Forest, Gradient Boosting.')}</div>
        <div class="ue-leaf">${t('<b>Klasse → Klassifikation</b>Start: Logistische Regression. Erklärbar → Entscheidungsbaum. Beste Leistung auf Tabellen → Random Forest, Gradient Boosting. Krumme Grenzen → kNN (wenige Merkmale) oder SVM mit Kernel (auch viele Merkmale).', '<b>Class → Classification</b>Start: logistic regression. Explainable → decision tree. Best performance on tables → Random Forest, Gradient Boosting. Curved boundaries → kNN (few features) or SVM with a kernel (also many features).')}</div>
        <div class="ue-leaf">${t('<b>Bilder statt Tabelle → Deep Learning</b>Bild → Klasse: Transfer Learning (ResNet, MobileNet), eigenes CNN nur mit vielen Bildern. Bild → besseres Bild: klassischer Filter als Baseline, dann U-Net oder vortrainierter Transformer (SwinIR, Restormer). Was ist wo: YOLO (schnell), Faster R-CNN (genau). Klasse pro Pixel: U-Net mit eigenen Labels, SAM ohne Training. Tabellen mit sehr vielen Daten: MLP möglich, Gradient Boosting meist gleich gut.', '<b>Images instead of a table → Deep learning</b>Image → class: transfer learning (ResNet, MobileNet), your own CNN only with many images. Image → better image: classical filter as the baseline, then U-Net or a pretrained transformer (SwinIR, Restormer). What is where: YOLO (fast), Faster R-CNN (accurate). Class per pixel: U-Net with own labels, SAM without training. Tables with very much data: MLP possible, gradient boosting usually as good.')}</div>
      </div>
      <div class="ue-b"><b>${t('Nein → Unsupervised', 'No → Unsupervised')}</b>
        <div class="ue-q">${t('Was willst du finden?', 'What do you want to find?')}</div>
        <div class="ue-leaf">${t('<b>Gruppen → Clustering</b>Runde Gruppen, k bekannt → k-Means. Beliebige Form, Ausreisser → DBSCAN. Struktur auf mehreren Ebenen → Hierarchisch. Weiche Zuordnung → GMM.', '<b>Groups → Clustering</b>Round groups, k known → k-Means. Any shape, outliers → DBSCAN. Structure on several levels → hierarchical. Soft assignment → GMM.')}</div>
        <div class="ue-leaf">${t('<b>Ausreisser → Anomalien</b>Isolation Forest (oder Rauschen bei DBSCAN).', '<b>Outliers → Anomalies</b>Isolation Forest (or noise in DBSCAN).')}</div>
        <div class="ue-leaf">${t('<b>Weniger Merkmale oder ein 2D-Bild → Dimensionsreduktion</b>Verdichten und weiterrechnen → PCA. Nur anschauen → t-SNE, UMAP.', '<b>Fewer features or a 2D picture → Dimensionality reduction</b>Compress and keep computing → PCA. Just look → t-SNE, UMAP.')}</div>
        <div class="ue-leaf">${t('<b>Neue Bilder erzeugen → Generative Models</b>Komprimieren, Anomalien → Autoencoder. Ziehen und interpolieren, stabil → VAE. Echte Wahrscheinlichkeit → PixelCNN. Scharf und schnell, Bild zu Bild → GAN. Beste Qualität und Vielfalt → Diffusion. Text zu Bild → vortrainiertes Stable Diffusion.', '<b>Generate new images → Generative models</b>Compress, anomalies → autoencoder. Sample and interpolate, stable → VAE. Real probability → PixelCNN. Sharp and fast, image to image → GAN. Best quality and diversity → diffusion. Text to image → pretrained Stable Diffusion.')}</div>
      </div>
    </div>
  </div>
  <div class="merk">${t('<b>Merksatz</b><p>Beginne immer mit einem einfachen Modell als Baseline. Ein komplexeres Modell lohnt sich nur, wenn es auf der Validierung klar besser ist.</p>', '<b>Key point</b><p>Always start with a simple model as a baseline. A more complex model is only worth it if it is clearly better on the validation set.</p>')}</div>

  <h3 id="ue-tabelle">${t('Die Modelle im Vergleich', 'The models compared')}</h3>
  <div class="tablewrap"><table>
    <tr>${t('<th>Modell</th><th>Aufgabe</th><th>Skalieren?</th><th>Erklärbar?</th><th>Wichtigster Regler</th>', '<th>Model</th><th>Task</th><th>Scaling?</th><th>Explainable?</th><th>Most important knob</th>')}</tr>
    <tr><td>${t('Lineare Regression', 'Linear regression')}</td><td>${REGR}</td><td>${NEIN}*</td><td>${JA}</td><td>–</td></tr>
    <tr><td>Ridge / Lasso</td><td>${REGR}</td><td>${JA}</td><td>${JA}</td><td><code>alpha</code></td></tr>
    <tr><td>${t('Logistische Regression', 'Logistic regression')}</td><td>${KLASS}</td><td>${JA}</td><td>${JA}</td><td><code>C</code>, ${t('Threshold', 'threshold')}</td></tr>
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
    <tr><td>MLP</td><td>${BEIDES}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Learning Rate, Schichten', 'learning rate, layers')}</td></tr>
    <tr><td>CNN</td><td>${t('Bildklassifikation', 'Image classification')}</td><td>${t('ja (/255)', 'yes (/255)')}</td><td>${NEIN}</td><td>${t('Filter, Blöcke, Learning Rate', 'filters, blocks, learning rate')}</td></tr>
    <tr><td>Transfer Learning</td><td>${t('Bildklassifikation', 'Image classification')}</td><td>${t('wie das Netz', 'as the network')}</td><td>${NEIN}</td><td>${t('freie Schichten, Learning Rate', 'unfrozen layers, learning rate')}</td></tr>
    <tr><td>${t('Klassische Bildfilter', 'Classical image filters')}</td><td>${t('Restauration', 'Restoration')}</td><td>${t('0 bis 1', '0 to 1')}</td><td>${JA}</td><td>${t('Fenstergrösse, σ', 'window size, σ')}</td></tr>
    <tr><td>U-Net</td><td>${t('Restauration, Segmentation', 'Restoration, segmentation')}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Tiefe, Loss', 'depth, loss')}</td></tr>
    <tr><td>SwinIR / Restormer</td><td>${t('Restauration', 'Restoration')}</td><td>${t('wie das Modell', 'as the model')}</td><td>${NEIN}</td><td>${t('Variante (Aufgabe, Rauschstärke)', 'variant (task, noise level)')}</td></tr>
    <tr><td>Faster R-CNN</td><td>Object Detection</td><td>${t('wie der Backbone', 'as the backbone')}</td><td>${NEIN}</td><td>${t('Score- und NMS-Threshold', 'score and NMS threshold')}</td></tr>
    <tr><td>YOLO</td><td>Object Detection</td><td>${t('wie das Modell', 'as the model')}</td><td>${NEIN}</td><td>${t('Modellgrösse, Score- und NMS-Threshold', 'model size, score and NMS threshold')}</td></tr>
    <tr><td>SAM</td><td>Segmentation</td><td>${t('wie das Modell', 'as the model')}</td><td>${NEIN}</td><td>Prompt</td></tr>
    <tr><td>Autoencoder</td><td>${t('Kompression, Anomalien', 'Compression, anomalies')}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Grösse von <code>z</code>', 'size of <code>z</code>')}</td></tr>
    <tr><td>VAE</td><td>${t('Generieren', 'Generating')}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Grösse von <code>z</code>, KL-Gewicht', 'size of <code>z</code>, KL weight')}</td></tr>
    <tr><td>PixelCNN</td><td>${t('Generieren', 'Generating')}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Tiefe, Filter', 'depth, filters')}</td></tr>
    <tr><td>GAN</td><td>${t('Generieren', 'Generating')}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Learning Rates G und D', 'learning rates G and D')}</td></tr>
    <tr><td>Diffusion</td><td>${t('Generieren', 'Generating')}</td><td>${JA}</td><td>${NEIN}</td><td>${t('Noise Schedule, Zahl der Schritte', 'noise schedule, number of steps')}</td></tr>
    <tr><td>Stable Diffusion</td><td>${t('Text zu Bild', 'Text to image')}</td><td>${t('wie das Modell', 'as the model')}</td><td>${NEIN}</td><td>${t('Schritte, Guidance Scale, Seed', 'steps, guidance scale, seed')}</td></tr>
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

  <h3 id="ue-nn">Neural Networks</h3>
  ${grid(dl)}

  <h3 id="ue-cnn">CNN</h3>
  ${grid(cnn)}

  <h3 id="ue-cv">Image Processing</h3>
  ${grid(cv)}

  <h3 id="ue-det">Object Detection &amp; Segmentation</h3>
  ${grid(det)}

  <h3 id="ue-gen">Generative Models</h3>
  ${grid(gen)}

  <h3 id="ue-strat">${t('Strategien', 'Strategies')}</h3>
  <div class="sbgrid">
    <div class="sb"><h4>${t('Daten vorbereiten', 'Preparing the data')}</h4><ul>
      <li>${t('Fehlende Werte: Zeilen löschen oder ergänzen (Median, Modus) mit <code>SimpleImputer</code>', 'Missing values: drop rows or fill them in (median, mode) with <code>SimpleImputer</code>')}</li>
      <li>${t('Kategorien in Zahlen: <code>OneHotEncoder</code>', 'Categories into numbers: <code>OneHotEncoder</code>')}</li>
      <li>${t('Skalieren: <code>StandardScaler</code> (Mittel 0, Streuung 1)', 'Scaling: <code>StandardScaler</code> (mean 0, spread 1)')}</li>
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
      <li>${t('<b>Embedded:</b> Das Modell wählt selbst (Lasso, Wichtigkeit im Random Forest)', '<b>Embedded:</b> the model chooses itself (Lasso, importance in the Random Forest)')}</li>
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
      <li>${t('<code>GridSearchCV</code> probiert alle Kombinationen mit Cross-Validation', '<code>GridSearchCV</code> tries all combinations with Cross-Validation')}</li>
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
      <li>${t('Threshold an die Kosten von falschem Alarm und verpassten Fällen anpassen', 'Adjust the threshold to the cost of false alarms and missed cases')}</li>
    </ul><div class="sb-f"><a href="#klass">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Data Leakage vermeiden', 'Avoiding data leakage')}</h4><ul>
      <li>${t('Keine Information aus dem Test-Set ins Training lassen', 'Let no information from the test set into training')}</li>
      <li>${t('Skalieren, Ergänzen und Auswählen erst nach dem Split, nur mit Trainingsdaten', 'Scale, fill in and select only after the split, using training data only')}</li>
      <li>${t('Am sichersten: alle Schritte in eine <code>Pipeline</code>, dann macht Cross-Validation es automatisch richtig', 'Safest: put all steps in a <code>Pipeline</code>, then Cross-Validation does it right automatically')}</li>
      <li>${t('Merkmale, die die Antwort schon verraten, entfernen', 'Remove features that already give away the answer')}</li>
    </ul><div class="sb-f"><a href="#klass-leakage">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Formeln zum Merken', 'Formulas to remember')}</h4><ul>
      <li><code>Precision = TP / (TP + FP)</code></li>
      <li><code>Recall = TP / (TP + FN)</code></li>
      <li><code>F1 = 2·P·R / (P + R)</code></li>
      <li>${t('<code>IoU = Schnittfläche / Vereinigungsfläche</code>, vergleicht immer zwei Boxen: Vorhersage gegen Ground Truth (Treffer ab IoU ≥ 0.5), Box gegen Box (NMS) oder zwei Detektoren untereinander', '<code>IoU = intersection / union</code>, always compares two boxes: prediction vs ground truth (hit from IoU ≥ 0.5), box vs box (NMS) or two detectors with each other')}</li>
      <li>${t('Threshold hoch: Precision ↑, Recall ↓; tief: umgekehrt', 'High threshold: precision ↑, recall ↓; low: the other way round')}</li>
    </ul><div class="sb-f"><a href="#det-iou">${MEHR}</a></div></div>
  </div>
`,
    notebooks: [
      { file: 'beispiele/09_Modelle_Praxis.ipynb', desc: t(`Pipeline gegen Baseline, speichern mit joblib und Metadaten, laden und prüfen, was ohne Scaler passiert, Drift simulieren, auf drei Arten neu trainieren und auf festen und aktuellen Testdaten vergleichen, Weitertrainieren mit <code>partial_fit</code>, Model Card.`, `Pipeline against a baseline, saving with joblib and metadata, loading and checking, what happens without the scaler, simulating drift, retraining in three ways and comparing on fixed and recent test data, continuing training with <code>partial_fit</code>, model card.`) },
    ],
    init() {
      LernApp.demos.modell();
      // Clickable workflow figure (same pattern as the chapter figures)
      const fig = document.getElementById('ueFlowFig');
      if (fig) {
        const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
        let cur = null;
        const close = function () {
          panel.hidden = true; cur = null;
          steps.forEach(function (g) { g.classList.remove('on'); g.setAttribute('aria-expanded', 'false'); });
        };
        const open = function (k) {
          if (cur === k) { close(); return; }
          const d = VS[k]; if (!d) return;
          cur = k;
          panel.querySelector('.ab-dh b').textContent = d[0];
          panel.querySelector('.ab-db').innerHTML = d[1];
          panel.querySelector('.ab-dl').innerHTML = d[2].map(function (l) { return '<a href="' + l[1] + '">' + l[0] + ' →</a>'; }).join('');
          panel.hidden = false;
          steps.forEach(function (g) { const on = g.getAttribute('data-s') === k; g.classList.toggle('on', on); g.setAttribute('aria-expanded', on ? 'true' : 'false'); });
        };
        steps.forEach(function (g) {
          g.addEventListener('click', function () { open(g.getAttribute('data-s')); });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g.getAttribute('data-s')); } });
        });
        panel.querySelector('.ab-x').addEventListener('click', close);
      }
      // Checklist: ticks kept under 'cas-ml-checklist' as a JSON list of checkbox ids
      const KEY = 'cas-ml-checklist';
      const boxes = Array.prototype.slice.call(document.querySelectorAll('#ueChecks input[type=checkbox]'));
      const prog = document.getElementById('ueCheckProg');
      if (!boxes.length || !prog) return;
      let done = [];
      try { done = JSON.parse(LernApp.store(KEY) || '[]'); } catch (e) { done = []; }
      if (!Array.isArray(done)) done = [];
      const render = function () {
        const n = boxes.filter(function (b) { return b.checked; }).length;
        prog.textContent = t(n + ' von ' + boxes.length + ' erledigt', n + ' of ' + boxes.length + ' done');
      };
      const save = function () {
        LernApp.store(KEY, JSON.stringify(boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.id; })));
        render();
      };
      boxes.forEach(function (b) { b.checked = done.indexOf(b.id) >= 0; b.addEventListener('change', save); });
      document.getElementById('ueCheckReset').addEventListener('click', function () {
        boxes.forEach(function (b) { b.checked = false; });
        save();
      });
      render();
    },
  });
})();
