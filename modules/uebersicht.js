/*
 * Overview chapter: one card per model and one checklist per strategy, as a
 * study sheet across all ML chapters. Content only summarises what ml.js,
 * klass.js, unsup.js, nn.js, cnn.js, cv.js, det.js and gen.js already explain.
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
      ${vbox('ein', 240, 862, 300, t('7 · Einsetzen und beobachten', '7 · Deploy and monitor'), t('Latenz, Lizenz, Domain Shift', 'latency, licence, domain shift'))}
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
    'ein': [t('7 · Einsetzen und beobachten', '7 · Deploy and monitor'), t('Passt das Modell auf die Zielhardware (Grösse, Latenz, Echtzeit)? Ist die Lizenz für den Einsatz erlaubt? Modell mit Vorverarbeitung und Metadaten speichern. Im Betrieb die Eingaben beobachten: Ändern sie sich (Domain Shift, Drift), wird die Leistung schlechter, dann mit neuen Daten aus der Einsatzumgebung nachtrainieren.', 'Does the model fit the target hardware (size, latency, real time)? Does the licence allow the use? Save the model with its preprocessing and metadata. In operation, watch the inputs: if they change (domain shift, drift), performance drops, and you retrain with new data from the deployment environment.'), [[t('Speichern und laden', 'Saving and loading'), '#mo-speichern'], [t('Neu trainieren', 'Retraining'), '#mo-neu']]],
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
    </ul><div class="sb-f"><a href="#ml-best">${t('Best Practices Supervised ML →', 'Best practices supervised ML →')}</a><a href="#cnn-best">${t('CNN →', 'CNN →')}</a><a href="#det-best">${t('Detection →', 'Detection →')}</a></div></div>
    <div class="sb ue-dont"><h4>Don’t</h4><ul>
      <li>${t('Imputer oder Scaler auf allen Daten fitten (Data Leakage)', 'Fit the imputer or scaler on all data (data leakage)')}</li>
      <li>${t('Hyperparameter am Testset wählen oder das Testset mehrfach benutzen', 'Choose hyperparameters on the test set or use the test set several times')}</li>
      <li>${t('Testdaten ohne dieselbe Vorverarbeitung ins Modell geben', 'Feed test data to the model without the same preprocessing')}</li>
      <li>${t('Ohne Baseline behaupten, das Modell sei gut', 'Claim the model is good without a baseline')}</li>
      <li>${t('Das grösste Modell nehmen, ohne Latenz und Hardware zu prüfen', 'Take the biggest model without checking latency and hardware')}</li>
      <li>${t('Die Lizenz ignorieren', 'Ignore the licence')}</li>
      <li>${t('Ein schweres Modell zu kurz trainieren: Es bleibt auf dem Niveau der Baseline', 'Train a heavy model too briefly: it stays at the level of the baseline')}</li>
    </ul><div class="sb-f"><a href="#klass-leakage">Data Leakage →</a><a href="#mo-best">${t('Modell einsetzen →', 'Deploying a model →')}</a></div></div>
  </div>

  <h3 id="ue-check">${t('Checkliste für ein neues Projekt', 'Checklist for a new project')}</h3>
  <p>${t('Zum Abhaken. Die Häkchen bleiben in diesem Browser gespeichert (mit dem lokalen Server auch browserübergreifend).', 'To tick off. The ticks are kept in this browser (with the local server also across browsers).')}</p>
  ${checklist}
`;

  function grid(cards) { return '<div class="sbgrid">' + cards.join('') + '</div>'; }

  LernApp.register({
    id: 'uebersicht',
    order: 95,
    nav: t('Übersicht', 'Overview'),
    title: t('Alle Modelle und Strategien auf einen Blick', 'All models and strategies at a glance'),
    kicker: t('Zum Lernen · Module 2 und 3', 'For revision · Modules 2 and 3'),
    summary: t('Vorgehen bei einem neuen ML-Problem mit Checkliste, Steckbriefe aller Modelle von der linearen Regression bis zu Stable Diffusion, Checklisten der Strategien und eine Entscheidungshilfe', 'How to approach a new ML problem with a checklist, profiles of all models from linear regression to Stable Diffusion, strategy checklists and a decision guide'),
    html: `
  <p>${t('Diese Seite fasst die Kapitel <a href="#ml">Supervised ML</a>, <a href="#klass">Klassifikation</a>, <a href="#unsup">Unsupervised</a>, <a href="#nn">Neural Networks</a>, <a href="#cnn">CNN</a>, <a href="#cv">Image Processing</a>, <a href="#det">Object Detection</a> und <a href="#gen">Generative Models</a> zum Lernen zusammen. Zu jedem Modell gibt es einen Steckbrief, zu jeder Strategie eine kurze Checkliste. Über «ausführlich →» kommst du zur Erklärung mit Demo, über «Beispiele →» zu einem Notebook mit lauffähigem Code (lokal mit Jupyter oder in Google Colab), wo es eines gibt.', 'This page summarises the chapters <a href="#ml">Supervised ML</a>, <a href="#klass">Classification</a>, <a href="#unsup">Unsupervised</a>, <a href="#nn">Neural Networks</a>, <a href="#cnn">CNN</a>, <a href="#cv">Image Processing</a>, <a href="#det">Object Detection</a> and <a href="#gen">Generative Models</a> for revision. Each model has a profile, each strategy a short checklist. “in detail →” takes you to the explanation with a demo, “Examples →” to a notebook with runnable code (locally with Jupyter or in Google Colab) where there is one.')}</p>

${vorgehen}
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
      <li>${t('Threshold an die Kosten von falschem Alarm und verpassten Fällen anpassen', 'Adjust the threshold to the cost of false alarms and missed cases')}</li>
    </ul><div class="sb-f"><a href="#klass">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Data Leakage vermeiden', 'Avoiding data leakage')}</h4><ul>
      <li>${t('Keine Information aus dem Test-Set ins Training lassen', 'Let no information from the test set into training')}</li>
      <li>${t('Skalieren, Ergänzen und Auswählen erst nach dem Split, nur mit Trainingsdaten', 'Scale, fill in and select only after the split, using training data only')}</li>
      <li>${t('Am sichersten: alle Schritte in eine <code>Pipeline</code>, dann macht Cross-Validation es automatisch richtig', 'Safest: put all steps in a <code>Pipeline</code>, then Cross-Validation does it right automatically')}</li>
      <li>${t('Merkmale, die die Antwort schon verraten, entfernen', 'Remove features that already give away the answer')}</li>
    </ul><div class="sb-f"><a href="#klass-leakage">${MEHR}</a> ${bsp('06_Strategien')}</div></div>
    <div class="sb"><h4>${t('Vortrainiertes Modell prüfen', 'Checking a pretrained model')}</h4><ul>
      <li>${t('<b>Lizenz:</b> nicht jedes Modell ist kommerziell nutzbar (YOLOv8: AGPL)', '<b>Licence:</b> not every model may be used commercially (YOLOv8: AGPL)')}</li>
      <li>${t('<b>Domain Shift:</b> Trainiert auf Alltagsfotos (COCO, ImageNet)? Bei Röntgen, Mikroskop oder Blaustich mehr Fine-Tuning nötig', '<b>Domain shift:</b> trained on everyday photos (COCO, ImageNet)? X-ray, microscope or a blue cast need more fine-tuning')}</li>
      <li>${t('<b>Grösse und Latenz:</b> Läuft es auf der Zielhardware, in Echtzeit? (YOLOv8n gegen YOLOv8x)', '<b>Size and latency:</b> does it run on the target hardware, in real time? (YOLOv8n vs YOLOv8x)')}</li>
      <li>${t('<b>Vorverarbeitung:</b> Grösse, Normalisierung und Klassen-IDs des Modells übernehmen (COCO: 91 gegen 80 IDs)', '<b>Preprocessing:</b> take over the model’s size, normalisation and class IDs (COCO: 91 vs 80 IDs)')}</li>
      <li>${t('<b>Datenqualität:</b> saubere Labels bringen oft mehr als ein grösseres Modell', '<b>Data quality:</b> clean labels often help more than a bigger model')}</li>
    </ul><div class="sb-f"><a href="#mo-quelle">${MEHR}</a></div></div>
    <div class="sb"><h4>${t('Formeln zum Merken', 'Formulas to remember')}</h4><ul>
      <li><code>Precision = TP / (TP + FP)</code></li>
      <li><code>Recall = TP / (TP + FN)</code></li>
      <li><code>F1 = 2·P·R / (P + R)</code></li>
      <li>${t('<code>IoU = Schnittfläche / Vereinigungsfläche</code>, vergleicht immer zwei Boxen: Vorhersage gegen Ground Truth (Treffer ab IoU ≥ 0.5), Box gegen Box (NMS) oder zwei Detektoren untereinander', '<code>IoU = intersection / union</code>, always compares two boxes: prediction vs ground truth (hit from IoU ≥ 0.5), box vs box (NMS) or two detectors with each other')}</li>
      <li>${t('Threshold hoch: Precision ↑, Recall ↓; tief: umgekehrt', 'High threshold: precision ↑, recall ↓; low: the other way round')}</li>
    </ul><div class="sb-f"><a href="#det-iou">${MEHR}</a></div></div>
  </div>
  <div class="falle">${t('<b>Falle</b><p>Das Test-Set mehrfach zum Vergleichen benutzen. Dann wird es zur zweiten Validierung, und die Endzahl ist zu optimistisch.</p>', '<b>Pitfall</b><p>Using the test set several times for comparisons. It then becomes a second validation set, and the final number is too optimistic.</p>')}</div>
`,
    quiz: [
      { q: t(`Train-Fehler klein, Validierungsfehler gross. Was liegt vor und was hilft?`, `Training error small, validation error large. What is going on and what helps?`), a: t(`Overfitting (hohe Variance). Einfacheres Modell, mehr Regularisierung, mehr Daten oder weniger Merkmale.`, `Overfitting (high variance). Simpler model, more regularisation, more data or fewer features.`) },
      { q: t(`Ridge oder Lasso, wenn du am Ende nur wenige Merkmale behalten willst?`, `Ridge or Lasso, if you want to keep only a few features in the end?`), a: t(`Lasso: Die L1-Strafe setzt unwichtige Gewichte genau auf 0. Ridge schrumpft nur.`, `Lasso: the L1 penalty sets unimportant weights to exactly 0. Ridge only shrinks.`) },
      { q: t(`Welche Modelle brauchen keine Skalierung, und warum?`, `Which models need no scaling, and why?`), a: t(`Baum-Modelle (Entscheidungsbaum, Random Forest, Gradient Boosting, Isolation Forest). Sie vergleichen jedes Merkmal nur mit einem Threshold, die Grössenordnung spielt keine Rolle.`, `Tree models (decision tree, Random Forest, Gradient Boosting, Isolation Forest). They only compare each feature with a threshold, so the order of magnitude does not matter.`) },
      { q: t(`Was unterscheidet Bagging von Boosting?`, `What distinguishes bagging from boosting?`), a: t(`Bagging (Random Forest) trainiert parallel auf Zufallsstichproben und mittelt, das senkt die Variance. Boosting trainiert nacheinander auf den Restfehlern, das senkt den Bias.`, `Bagging (Random Forest) trains in parallel on random samples and averages, which lowers the variance. Boosting trains one after another on the remaining errors, which lowers the bias.`) },
      { q: t(`99 % der Fälle sind negativ. Warum ist Accuracy 99 % nichtssagend?`, `99 % of the cases are negative. Why is an accuracy of 99 % meaningless?`), a: t(`«Immer negativ» erreicht das auch, findet aber keinen einzigen positiven Fall. Recall, Precision und F1 zeigen das.`, `“Always negative” achieves that too, but finds not a single positive case. Recall, precision and F1 show this.`) },
      { q: t(`Wann DBSCAN statt k-Means?`, `When DBSCAN instead of k-Means?`), a: t(`Wenn die Cluster nicht rund sind, du k nicht kennst oder Ausreisser erwartest. DBSCAN markiert sie als Rauschen (−1).`, `When the clusters are not round, you do not know k or you expect outliers. DBSCAN marks them as noise (−1).`) },
      { q: t(`Wofür PCA, wofür t-SNE?`, `What is PCA for, what is t-SNE for?`), a: t(`PCA zum Verdichten und Weiterrechnen (linear, auf neue Daten anwendbar). t-SNE nur zum Anschauen; Abstände zwischen den Gruppen bedeuten dort nichts.`, `PCA for compressing and further computation (linear, applicable to new data). t-SNE only for looking; distances between the groups mean nothing there.`) },
      { q: t(`Was ist der Unterschied zwischen Hyperparameter und Parameter?`, `What is the difference between a hyperparameter and a parameter?`), a: t(`Parameter (Gewichte) lernt das Modell aus den Daten. Hyperparameter (z. B. alpha, k, max_depth) legst du vorher fest und suchst sie mit der Validierung.`, `The model learns parameters (weights) from the data. You fix hyperparameters (e.g. alpha, k, max_depth) beforehand and search for them with the validation set.`) },
      { q: t(`Warum gehört der Scaler in eine Pipeline?`, `Why does the scaler belong in a pipeline?`), a: t(`Damit er in jedem Cross-Validation-Lauf nur auf dem Trainingsteil gelernt wird. Sonst sickert Information aus dem Validierungsteil ein (Data Leakage).`, `So that in every Cross-Validation run it is learned on the training part only. Otherwise information leaks in from the validation part (data leakage).`) },
      { q: t(`Wie wählst du k bei k-Means?`, `How do you choose k for k-Means?`), a: t(`Elbow-Methode (Knick in der Inertia-Kurve) und Silhouette-Wert vergleichen, dann prüfen, ob die Cluster inhaltlich Sinn ergeben.`, `Compare the elbow method (bend in the inertia curve) and the silhouette score, then check whether the clusters make sense in terms of content.`) },
      { q: t(`Du hast 800 Fotos in 3 Klassen. Eigenes CNN oder Transfer Learning?`, `You have 800 photos in 3 classes. Your own CNN or transfer learning?`), a: t(`Transfer Learning: Basis (z. B. ResNet oder MobileNet) einfrieren, neuen Kopf trainieren, dabei die Vorverarbeitung des Netzes übernehmen. Ein eigenes CNN würde mit 800 Bildern stark overfitten.`, `Transfer learning: freeze the base (e.g. ResNet or MobileNet), train a new head and take over the network’s preprocessing. Your own CNN would overfit badly with 800 images.`) },
      { q: t(`YOLO oder Faster R-CNN?`, `YOLO or Faster R-CNN?`), a: t(`YOLO (eine Stufe) für Echtzeit, Video und Edge-Geräte. Faster R-CNN (zwei Stufen) für höchste Genauigkeit und kleine Objekte, wenn die Zeit keine Rolle spielt.`, `YOLO (one stage) for real time, video and edge devices. Faster R-CNN (two stages) for the highest accuracy and small objects when time does not matter.`) },
      { q: t(`Wann U-Net, wann SAM für Segmentation?`, `When U-Net, when SAM for segmentation?`), a: t(`U-Net, wenn es eigene pixelgenaue Labels gibt und feste Klassen gebraucht werden. SAM ohne Training (zero-shot) mit einem Prompt; es kennt keine Klassennamen und wird dafür mit einem Klassifikator kombiniert.`, `U-Net when there are own pixel-exact labels and fixed classes are needed. SAM without training (zero-shot) with a prompt; it knows no class names and is combined with a classifier for that.`) },
      { q: t(`Ist das neueste vortrainierte Modell plus Fine-Tuning immer die beste Wahl?`, `Is the newest pretrained model plus fine-tuning always the best choice?`), a: t(`Nein. Zuerst eine einfache Baseline und das vortrainierte Modell zero-shot auf den eigenen Daten testen. Fine-Tuning nur mit genug passenden Daten. Bei Tabellendaten sind klassische Modelle meist besser, und Rahmenbedingungen (Hardware, Latenz, Lizenz, Domain Shift, erfundene Details) entscheiden mit.`, `No. First test a simple baseline and the pretrained model zero-shot on your own data. Fine-tune only with enough suitable data. On tabular data classical models are usually better, and constraints (hardware, latency, licence, domain shift, invented details) decide as well.`) },
      { q: t(`VAE oder GAN, um neue Bilder zu erzeugen?`, `VAE or GAN to generate new images?`), a: t(`VAE für stabiles Training und einen geordneten Latent Space zum Ziehen und Interpolieren, dafür etwas unscharf. GAN für sehr scharfe Bilder, dafür instabil und mit Gefahr von Mode Collapse.`, `VAE for stable training and an ordered latent space for sampling and interpolating, but somewhat blurry. GAN for very sharp images, but unstable and at risk of mode collapse.`) },
      { q: t(`Neues Problem mit Tabellendaten (CSV). Womit fängst du an?`, `A new problem with tabular data (CSV). What do you start with?`), a: t(`Mit einer Baseline (Mittelwert oder logistische Regression), dann Gradient Boosting oder Random Forest. Deep Learning bringt auf Tabellen selten mehr; der grösste Hebel liegt im Feature Engineering.`, `With a baseline (mean or logistic regression), then gradient boosting or Random Forest. Deep learning rarely helps more on tables; the biggest lever is feature engineering.`) },
      { q: t(`Ein vortrainierter Detektor (COCO) erkennt deine Fabrikteile schlecht. Warum, und was tust du?`, `A pretrained detector (COCO) recognises your factory parts poorly. Why, and what do you do?`), a: t(`Domain Shift: Das Modell kennt Alltagsfotos, nicht deine Teile und deine Bedingungen. Eigene Bilder aus der Einsatzumgebung labeln und das Modell nachtrainieren, mit wenig Daten nur den Head (Feature Extraction), mit mehr Daten Fine-Tuning mit kleiner Learning Rate.`, `Domain shift: the model knows everyday photos, not your parts and your conditions. Label your own images from the deployment environment and retrain the model, with little data only the head (feature extraction), with more data fine-tuning with a small learning rate.`) },
      { q: t(`Wann lohnt sich eine eigene Architektur statt eines vortrainierten Modells?`, `When is your own architecture worth it instead of a pretrained model?`), a: t(`Fast nur bei exotischen Daten ohne passendes Modell (Radar, spezielle Sensoren), bei harten Hardware-Limits (Mikrocontroller) oder in der Forschung. Dann klein anfangen und nur bei Bedarf tiefer werden.`, `Almost only for exotic data without a suitable model (radar, special sensors), with hard hardware limits (microcontroller) or in research. Then start small and only go deeper if needed.`) },
    ],
    init() {
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
