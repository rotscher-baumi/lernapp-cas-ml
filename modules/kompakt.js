/* Module: Kompakt (own page kompakt.html). One-page cheat sheet over the ML chapters; the content is a short form of ml, klass, unsup and nn. */
(function () {
  LernApp.register({
    id: 'kompakt',
    order: 10,
    nav: 'Kompakt',
    title: 'Alles kompakt',
    kicker: 'Spickzettel · Module 2 und 3',
    summary: `Supervised ML, Klassifikation, Unsupervised und Neural Networks auf einer Seite`,
    html: `
  <p>Der Spickzettel über die Kapitel <a href="index.html#ml">Supervised ML</a>, <a href="index.html#klass">Klassifikation</a>, <a href="index.html#unsup">Unsupervised</a> und <a href="index.html#nn">Neural Networks</a>. Die Erklärungen, Demos und der Selbsttest stehen in den Kapiteln, die Steckbriefe einzelner Modelle in der <a href="index.html#uebersicht">Übersicht</a>.</p>

  <h3 id="k-ablauf">Supervised ML: Ablauf und Daten</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Ablauf</b></td><td>Daten anschauen (EDA), aufteilen, vorbereiten (fehlende Werte, Skalieren, Kategorien), Modell trainieren, auf Validation vergleichen, einmal auf test prüfen.</td></tr>
    <tr><td><b>Split</b></td><td><b>train</b> lernt die Parameter, <b>validation</b> wählt Modell und Hyperparameter, <b>test</b> wird einmal am Schluss benutzt. Mit wenig Daten ersetzt Cross-Validation die feste Validation.</td></tr>
    <tr><td><b>Cross-Validation</b></td><td>5-Fold-CV trainiert 5 Modelle mit denselben Hyperparametern, aber anderen Parametern. Sie messen nur; übrig bleibt der Durchschnitt. Das finale Modell wird danach auf allen Trainingsdaten neu trainiert.</td></tr>
    <tr><td><b>Skalieren</b></td><td><code>fit</code> nur auf train, <code>transform</code> auf allen. Nötig für Gradient Descent, Regularisierung, kNN, SVM, k-Means, PCA und Neural Networks. Nicht nötig für Bäume. Die reine lineare Regression (OLS) braucht es nicht, bei Gradient Descent hilft es.</td></tr>
    <tr><td><b>Pipeline</b></td><td>Skalieren und Modell als eine Einheit: in jedem Fold wird nur mit dessen Trainingsteil gelernt. Verhindert Data Leakage.</td></tr>
    <tr><td><b>Data Leakage</b></td><td>Testwissen fliesst ins Training: Skalieren oder Imputation vor dem Split, Feature Selection auf allen Daten, Resampling vor dem Split, Merkmale, die es zum Vorhersagezeitpunkt nicht gibt. Zu gute Zahlen sind verdächtig.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#ml-ablauf">Zum Kapitel →</a></p>

  <h3 id="k-reg">Regression, Bias/Variance, Regularisierung</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Gradient Descent</b></td><td><code>w ← w − lr · Gradient</code>. Zu grosse learning rate: springt oder divergiert. Zu kleine: kriecht. Skalierte Merkmale helfen.</td></tr>
    <tr><td><b>Lineare Regression</b></td><td>Beste Gerade (Ebene) durch die Daten, minimiert MSE. Metriken: MAE (in Einheiten von <code>y</code>, robust), RMSE (bestraft grosse Fehler), R².</td></tr>
    <tr><td><b>Underfitting</b></td><td>Fehler auf train und validation hoch. High bias. Mehr Kapazität (Polynomgrad, Merkmale), weniger Regularisierung.</td></tr>
    <tr><td><b>Overfitting</b></td><td>Train tief, validation deutlich höher. High variance. Mehr Daten, einfacheres Modell, Regularisierung, weniger Merkmale.</td></tr>
    <tr><td><b>Ridge / Lasso</b></td><td>Ridge (L2) schrumpft Koeffizienten. Lasso (L1) setzt manche auf 0 und wählt so Merkmale. ElasticNet mischt beide. Grösseres alpha = stärkere Bremse. Merkmale vorher skalieren.</td></tr>
    <tr><td><b>Hyperparameter</b></td><td>Parameter lernt das Modell, Hyperparameter stellst du ein (alpha, Polynomgrad, learning rate). Suche mit Grid Search oder Random Search, jeweils mit Cross-Validation.</td></tr>
    <tr><td><b>Feature Selection</b></td><td>Filter (Korrelation, Varianz), Wrapper (RFE), Embedded (Lasso, Bäume). Immer nur auf train oder innerhalb der CV. Korrelation ist keine Ursache.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#ml-gd">Zum Kapitel →</a></p>

  <h3 id="k-klass">Klassifikation</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Logistische Regression</b></td><td>Lineare Regression + Sigmoid. Liefert eine Wahrscheinlichkeit; die Klasse entsteht erst durch den <b>threshold</b> (Standard 0.5), und den wählst du. Loss: Cross-Entropy.</td></tr>
    <tr><td><b>Confusion Matrix</b></td><td>TP, FP, FN, TN. <b>Precision</b> = TP/(TP+FP) (wie viele Alarme stimmen). <b>Recall</b> = TP/(TP+FN) (wie viele echte Fälle gefunden). <b>F1</b> = Mittel aus beiden. Accuracy = alle richtigen / alle.</td></tr>
    <tr><td><b>Threshold, ROC, AUC</b></td><td>Tieferer threshold: mehr Recall, weniger Precision (mehr False Alarms). ROC trägt Recall gegen False Alarm Rate über alle thresholds ab, AUC ist die Fläche (0.5 = Zufall, 1 = perfekt). Bei seltenen Klassen zusätzlich Precision-Recall betrachten.</td></tr>
    <tr><td><b>Mehrere Klassen</b></td><td>One-vs-All (ein Modell pro Klasse) oder Softmax (Wahrscheinlichkeiten summieren sich zu 1). Zusammenfassen mit micro, macro (jede Klasse gleich) oder weighted (nach Klassengrösse).</td></tr>
    <tr><td><b>Unausgewogene Klassen</b></td><td>Accuracy täuscht. Auf Recall, Precision, F1, AUC schauen. Optionen: <code>class_weight</code>, Up/Downsampling, SMOTE, threshold anpassen. Resampling nur auf train.</td></tr>
    <tr><td><b>kNN, Naive Bayes, SVM, Baum</b></td><td>kNN: Mehrheit der k Nachbarn, skalieren, k gross = glatt. Naive Bayes: schnell, nimmt unabhängige Merkmale an. SVM: breiteste Grenze, Kernel für Krümmung, skalieren. Baum: Regeln, gut lesbar, neigt zu Overfitting (Tiefe begrenzen), skalieren unnötig.</td></tr>
    <tr><td><b>Ensembles</b></td><td><b>Bagging / Random Forest</b>: viele tiefe Bäume auf Zufallsstichproben, Mittel senkt die Variance. <b>Boosting</b>: Bäume nacheinander, jeder korrigiert die Fehler der vorigen, senkt den Bias, lernt schneller zu viel. Start: Random Forest als Baseline.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#klass">Zum Kapitel →</a></p>

  <h3 id="k-unsup">Unsupervised Learning</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Aufgaben</b></td><td>Clustering (Gruppen finden), Anomalien (Ausreisser finden), Dimensionsreduktion (wenige Merkmale statt vieler). Keine Zielspalte; Labels, falls vorhanden, bleiben ausserhalb des Modells.</td></tr>
    <tr><td><b>Skalieren</b></td><td>Fast alle Verfahren rechnen mit Abständen: vorher skalieren (<code>StandardScaler</code>). Ausnahme: Isolation Forest.</td></tr>
    <tr><td><b>k-Means</b></td><td>Kugelförmige Cluster ähnlicher Grösse, k vorgeben. Elbow (Inertia) und Silhouette helfen bei k; beides sind Vorschläge. Mit <code>n_init</code> mehrmals starten.</td></tr>
    <tr><td><b>Hierarchisch</b></td><td>Dendrogramm, k erst beim Schneiden wählen. Gut bei kleinen Datenmengen, teuer bei grossen.</td></tr>
    <tr><td><b>DBSCAN</b></td><td>Dichte-basiert: beliebige Formen, findet Rauschen (Label −1), k nicht nötig. Parameter <code>eps</code> und <code>min_samples</code>. Mühe bei unterschiedlicher Dichte.</td></tr>
    <tr><td><b>GMM</b></td><td>Ellipsen-Cluster mit weicher Zuordnung (Wahrscheinlichkeit je Cluster). Anzahl über BIC/AIC.</td></tr>
    <tr><td><b>Cluster prüfen</b></td><td>Silhouette, Stabilität (anderer Start, anderes Sample), Cluster-Profile in Originaleinheiten. Gut ist: stabil und fachlich sinnvoll. Mit Labels: ARI als Kontrolle.</td></tr>
    <tr><td><b>Isolation Forest</b></td><td>Zufällige Splits: Auffällige Punkte sind nach wenigen Splits allein. Liefert ein Ranking, kein Urteil. Bei geändertem Normalverhalten neu anpassen.</td></tr>
    <tr><td><b>PCA</b></td><td>Lineare Achsen mit der grössten Varianz. Vorher skalieren. Komponenten über die kumulative explained variance wählen (z. B. 90 %). Für Modelle und Tempo geeignet.</td></tr>
    <tr><td><b>t-SNE, UMAP</b></td><td>Nicht-lineare 2D-Karten zum Erkunden. Nur Nachbarschaft zählt, Abstände und Grössen nicht. Nicht auf der Karte clustern und nicht als Basis für Modelle.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#unsup">Zum Kapitel →</a></p>

  <h3 id="k-nn">Neural Networks</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Neuron</b></td><td><code>z = w·x + b</code>, <code>a = f(z)</code>. Ohne nicht-lineare activation wäre das ganze Netz linear.</td></tr>
    <tr><td><b>activation</b></td><td>ReLU in hidden layers (Standard), Sigmoid bei 2 Klassen in der Ausgabe, Softmax bei mehreren Klassen, linear bei Regression. Sigmoid und Tanh saturieren.</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-Entropy bei Klassifikation, MSE oder MAE bei Regression.</td></tr>
    <tr><td><b>Parameter</b></td><td>Dense-Schicht: <code>(n_in + 1) · n_out</code>. Beispiel 784 → 128 → 10: 101’770.</td></tr>
    <tr><td><b>Training</b></td><td>Forward pass, Loss, Backpropagation (Kettenregel, von hinten), Update <code>w ← w − α·∂L/∂w</code>. Startgewichte zufällig (Xavier, He), nie alle gleich. Eingaben skalieren.</td></tr>
    <tr><td><b>Mini-Batch, epoch</b></td><td>Update nach jedem Mini-Batch (<code>batch size</code>), eine epoch = alle Daten einmal. Typisch batch size 16 bis 256.</td></tr>
    <tr><td><b>Optimizer</b></td><td>SGD, Momentum (dämpft Zickzack), RMSProp (Schrittgrösse pro Parameter), Adam (beides, Standard, learning rate 0.001).</td></tr>
    <tr><td><b>Gegen overfitting</b></td><td>Early Stopping auf der Validation-Loss, Dropout (0.2 bis 0.5, nur beim Training), kleineres Netz, mehr Daten, Data Augmentation, L2.</td></tr>
    <tr><td><b>Loss-Kurven</b></td><td>Beide hoch: underfitting. Train tief, validation steigt wieder: overfitting. Hyperparameter nur auf der Validation wählen, test einmal.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#nn">Zum Kapitel →</a></p>
`,
  });
})();
