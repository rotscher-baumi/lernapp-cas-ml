/* Module: Kompakt (own page kompakt.html). One-page cheat sheet over the ML chapters; the content is a short form of ml, klass, unsup, nn, cnn, cv, gen and modell.
 * Rule (AGENTS.project.md): whenever one of these chapters changes in content, update the matching table here and in modules/en/kompakt.js. */
(function () {
  LernApp.register({
    id: 'kompakt',
    order: 10,
    nav: 'Kompakt',
    title: 'Alles kompakt',
    kicker: 'Spickzettel · Module 2 und 3',
    summary: `Supervised ML, Klassifikation, Unsupervised, Neural Networks, CNN, Computer Vision, Generative Models und Modelle in der Praxis auf einer Seite`,
    html: `
  <p>Der Spickzettel über die Kapitel <a href="index.html#ml">Supervised ML</a>, <a href="index.html#klass">Klassifikation</a>, <a href="index.html#unsup">Unsupervised</a>, <a href="index.html#nn">Neural Networks</a>, <a href="index.html#cnn">CNN</a>, <a href="index.html#cv">Computer Vision</a>, <a href="index.html#gen">Generative Models</a> und <a href="index.html#modell">Modelle in der Praxis</a>. Die Erklärungen, Demos und der Selbsttest stehen in den Kapiteln, die Steckbriefe einzelner Modelle in der <a href="index.html#uebersicht">Übersicht</a>.</p>

  <h3 id="k-ablauf">Supervised ML: Ablauf und Daten</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Ablauf</b></td><td>Daten anschauen (EDA), aufteilen, vorbereiten (fehlende Werte, Skalieren, Kategorien), Modell trainieren, auf Validation vergleichen, einmal auf Test prüfen.</td></tr>
    <tr><td><b>Split</b></td><td><b>Train</b> lernt die Parameter, <b>Validation</b> wählt Modell und Hyperparameter, <b>Test</b> wird einmal am Schluss benutzt. Mit wenig Daten ersetzt Cross-Validation die feste Validation.</td></tr>
    <tr><td><b>Cross-Validation</b></td><td>5-Fold-CV trainiert 5 Modelle mit denselben Hyperparametern, aber anderen Parametern. Sie messen nur; übrig bleibt der Durchschnitt. Das finale Modell wird danach auf allen Trainingsdaten neu trainiert.</td></tr>
    <tr><td><b>Skalieren</b></td><td><code>fit</code> nur auf Train, <code>transform</code> auf allen. Nötig für Gradient Descent, Regularisierung, kNN, SVM, k-Means, PCA und Neural Networks. Nicht nötig für Bäume. Die reine lineare Regression (OLS) braucht es nicht, bei Gradient Descent hilft es.</td></tr>
    <tr><td><b>Pipeline</b></td><td>Skalieren und Modell als eine Einheit: In jedem Fold wird nur mit dessen Trainingsteil gelernt. Verhindert Data Leakage.</td></tr>
    <tr><td><b>Data Leakage</b></td><td>Testwissen fliesst ins Training: Skalieren oder Imputation vor dem Split, Feature Selection auf allen Daten, Resampling vor dem Split, Merkmale, die es zum Vorhersagezeitpunkt nicht gibt. Zu gute Zahlen sind verdächtig.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#ml-ablauf">Zum Kapitel →</a></p>

  <h3 id="k-reg">Regression, Bias/Variance, Regularisierung</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Gradient Descent</b></td><td><code>w ← w − lr · Gradient</code>. Zu grosse Learning Rate: springt oder divergiert. Zu kleine: kriecht. Skalierte Merkmale helfen.</td></tr>
    <tr><td><b>Lineare Regression</b></td><td>Beste Gerade (Ebene) durch die Daten, minimiert MSE. Metriken: MAE (in Einheiten von <code>y</code>, robust), RMSE (bestraft grosse Fehler), R².</td></tr>
    <tr><td><b>Underfitting</b></td><td>Fehler auf Train und Validation hoch. High Bias. Mehr Kapazität (Polynomgrad, Merkmale), weniger Regularisierung.</td></tr>
    <tr><td><b>Overfitting</b></td><td>Train tief, Validation deutlich höher. High Variance. Mehr Daten, einfacheres Modell, Regularisierung, weniger Merkmale.</td></tr>
    <tr><td><b>Ridge / Lasso</b></td><td>Ridge (L2) schrumpft Koeffizienten. Lasso (L1) setzt manche auf 0 und wählt so Merkmale. ElasticNet mischt beide. Grösseres alpha = stärkere Bremse. Merkmale vorher skalieren.</td></tr>
    <tr><td><b>Hyperparameter</b></td><td>Parameter lernt das Modell, Hyperparameter stellst du ein (alpha, Polynomgrad, Learning Rate). Suche mit Grid Search oder Random Search, jeweils mit Cross-Validation.</td></tr>
    <tr><td><b>Feature Selection</b></td><td>Filter (Korrelation, Varianz), Wrapper (RFE), Embedded (Lasso, Bäume). Immer nur auf Train oder innerhalb der CV. Korrelation ist keine Ursache.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#ml-gd">Zum Kapitel →</a></p>

  <h3 id="k-klass">Klassifikation</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Logistische Regression</b></td><td>Lineare Regression + Sigmoid. Liefert eine Wahrscheinlichkeit; die Klasse entsteht erst durch den <b>Threshold</b> (Standard 0.5), und den wählst du. Loss: Cross-Entropy.</td></tr>
    <tr><td><b>Confusion Matrix</b></td><td>TP, FP, FN, TN. <b>Precision</b> = TP/(TP+FP) (wie viele Alarme stimmen). <b>Recall</b> = TP/(TP+FN) (wie viele echte Fälle gefunden). <b>F1</b> = Mittel aus beiden. Accuracy = alle richtigen / alle.</td></tr>
    <tr><td><b>Threshold, ROC, AUC</b></td><td>Tieferer Threshold: mehr Recall, weniger Precision (mehr False Alarms). ROC trägt Recall gegen False Alarm Rate über alle Thresholds ab, AUC ist die Fläche (0.5 = Zufall, 1 = perfekt). Bei seltenen Klassen zusätzlich Precision-Recall betrachten.</td></tr>
    <tr><td><b>Mehrere Klassen</b></td><td>One-vs-All (ein Modell pro Klasse) oder Softmax (Wahrscheinlichkeiten summieren sich zu 1). Zusammenfassen mit Micro, Macro (jede Klasse gleich) oder Weighted (nach Klassengrösse).</td></tr>
    <tr><td><b>Unausgewogene Klassen</b></td><td>Accuracy täuscht. Auf Recall, Precision, F1, AUC schauen. Optionen: <code>class_weight</code>, Up/Downsampling, SMOTE, Threshold anpassen. Resampling nur auf Train.</td></tr>
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
    <tr><td><b>PCA</b></td><td>Lineare Achsen mit der grössten Varianz. Vorher skalieren. Komponenten über die kumulative Explained Variance wählen (z. B. 90 %). Für Modelle und Tempo geeignet.</td></tr>
    <tr><td><b>t-SNE, UMAP</b></td><td>Nicht-lineare 2D-Karten zum Erkunden. Nur Nachbarschaft zählt, Abstände und Grössen nicht. Nicht auf der Karte clustern und nicht als Basis für Modelle.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#unsup">Zum Kapitel →</a></p>

  <h3 id="k-nn">Neural Networks</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Neuron</b></td><td><code>z = w·x + b</code>, <code>a = f(z)</code>. Ohne nicht-lineare Activation wäre das ganze Netz linear.</td></tr>
    <tr><td><b>Activation</b></td><td>ReLU in Hidden Layers (Standard), Sigmoid bei 2 Klassen in der Ausgabe, Softmax bei mehreren Klassen, linear bei Regression. Sigmoid und Tanh saturieren.</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-Entropy bei Klassifikation, MSE oder MAE bei Regression.</td></tr>
    <tr><td><b>Parameter</b></td><td>Dense-Schicht: <code>(n_in + 1) · n_out</code>. Beispiel 784 → 128 → 10: 101’770.</td></tr>
    <tr><td><b>Training</b></td><td>Forward Pass, Loss, Backpropagation (Kettenregel, von hinten), Update <code>w ← w − α·∂L/∂w</code>. Startgewichte zufällig (Xavier, He), nie alle gleich. Eingaben skalieren.</td></tr>
    <tr><td><b>Mini-Batch, Epoch</b></td><td>Update nach jedem Mini-Batch (<code>batch size</code>), eine Epoch = alle Daten einmal. Typisch Batch Size 16 bis 256.</td></tr>
    <tr><td><b>Optimizer</b></td><td>SGD, Momentum (dämpft Zickzack), RMSProp (Schrittgrösse pro Parameter), Adam (beides, Standard, Learning Rate 0.001).</td></tr>
    <tr><td><b>Gegen Overfitting</b></td><td>Early Stopping auf der Validation-Loss, Dropout (0.2 bis 0.5, nur beim Training), kleineres Netz, mehr Daten, Data Augmentation, L2.</td></tr>
    <tr><td><b>Loss-Kurven</b></td><td>Beide hoch: Underfitting. Train tief, Validation steigt wieder: Overfitting. Hyperparameter nur auf der Validation wählen, Test einmal.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#nn">Zum Kapitel →</a></p>

  <h3 id="k-cnn">CNN</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Warum nicht Dense?</b></td><td>Zu viele Parameter (32 × 32 × 3 mit 512 Neuronen: rund 1.6 Mio.), die Nachbarschaft der Pixel geht beim Flatten verloren, und ein Muster müsste an jeder Stelle neu gelernt werden.</td></tr>
    <tr><td><b>Convolution</b></td><td>Ein kleiner Filter (z. B. 3 × 3) gleitet über das Bild und rechnet an jeder Stelle eine gewichtete Summe. Ergebnis: eine Feature Map, hoch dort, wo das Muster passt. Lokale Verbindungen und geteilte Gewichte.</td></tr>
    <tr><td><b>Ausgabegrösse</b></td><td><code>⌊(n + 2p − k) / s⌋ + 1</code>. <code>padding='valid'</code>: p = 0, die Map schrumpft. <code>padding='same'</code>: Grösse bleibt (bei Stride 1). Stride 2 halbiert etwa.</td></tr>
    <tr><td><b>Pooling</b></td><td>MaxPooling 2 × 2 halbiert Höhe und Breite, hat keine Gewichte und vergrössert das Sichtfeld der folgenden Schichten.</td></tr>
    <tr><td><b>Parameter</b></td><td>Conv2D: <code>(k · k · C_in + 1) · C_out</code>. Beispiel <code>Conv2D(32, (3, 3))</code> auf RGB: (3·3·3 + 1) · 32 = 896. Die Bildgrösse kommt nicht vor.</td></tr>
    <tr><td><b>Architektur</b></td><td>Conv + Pooling-Blöcke, Filter pro Block verdoppeln (32, 64, 128), dann Flatten oder GlobalAveragePooling und Dense mit Softmax. Loss: (Sparse) Categorical Cross-Entropy, Adam.</td></tr>
    <tr><td><b>Gegen Overfitting</b></td><td>Data Augmentation (spiegeln, drehen, zoomen; nur beim Training, passend zur Aufgabe), Dropout, Batch Normalization, Early Stopping.</td></tr>
    <tr><td><b>Transfer Learning</b></td><td>Vortrainiertes Netz (z. B. aus <code>keras.applications</code>) einfrieren, neuen Kopf trainieren. Danach Fine-Tuning der oberen Schichten mit sehr kleiner Learning Rate. Erste Wahl bei wenigen Bildern.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#cnn">Zum Kapitel →</a></p>

  <h3 id="k-cv">Computer Vision</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Bildentstehung</b></td><td>Das gemessene Bild ist das echte Bild, verschmiert durch die Optik (PSF), plus Rauschen, dazu Demosaicing und Kompression. Darum ist kein Bild perfekt.</td></tr>
    <tr><td><b>Pixel und Channels</b></td><td>Ein Bild ist ein Array (H, W, C): Graustufen C = 1, RGB 3, RGBA 4 (Alpha = Deckkraft). Zugriff <code>img[y, x]</code>, Zeile vor Spalte. OpenCV lädt BGR statt RGB.</td></tr>
    <tr><td><b>dtype und Speicher</b></td><td><code>uint8</code>: 0 bis 255, 1 Byte. Für Netze <code>float32</code> 0.0 bis 1.0, 4 Byte. Speicher = H · W · C · Bytes: 224 × 224 × 3 in float32 ≈ 0.6 MB, ein Batch von 32 rund 19 MB.</td></tr>
    <tr><td><b>HWC oder CHW</b></td><td>NumPy, PIL, OpenCV und TensorFlow: HWC (Channels zuletzt). PyTorch: CHW. Falsche Reihenfolge gibt Fehler oder Unsinn.</td></tr>
    <tr><td><b>Dateiformate</b></td><td>PNG verlustfrei, gut für Masken und Grafiken. JPEG verlustbehaftet, klein, für Fotos; nie für Label-Masken. Metadaten (EXIF) können die Orientation enthalten.</td></tr>
    <tr><td><b>Restauration</b></td><td>Denoising, Deblurring, Super-Resolution: Bild rein, Bild raus. Klassisch (Gauss, Median, Wiener, Bicubic) oder gelernt (U-Net, SwinIR, Restormer). Loss L1 oder Perceptual, Metrik PSNR und SSIM.</td></tr>
    <tr><td><b>Object Detection</b></td><td>Boxen, Klassen, Scores. Two-Stage (Faster R-CNN, genauer) oder One-Stage (YOLO, schnell). <b>IoU</b> = Schnitt / Vereinigung. <b>NMS</b> entfernt doppelte Boxen. Metrik mAP@IoU.</td></tr>
    <tr><td><b>Semantic Segmentation</b></td><td>Eine Klasse pro Pixel. U-Net (Encoder, Decoder, Skip Connections), SAM (Segment Anything) liefert per Prompt (Punkt, Box) Masken ohne eigenes Training, aber ohne Klassennamen. Loss Cross-Entropy + Dice, Metrik IoU, Dice, mIoU.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#cv">Zum Kapitel →</a></p>

  <h3 id="k-gen">Generative Models</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Idee</b></td><td>Ein generatives Modell lernt die Verteilung der Daten (ohne Labels) und erzeugt neue Beispiele, die aussehen wie die echten.</td></tr>
    <tr><td><b>Autoencoder</b></td><td>Encoder → Latent Space <code>z</code> (klein) → Decoder. Loss: Rekonstruktion. Gut für Kompression, Denoising, Anomalien (hoher Rekonstruktionsfehler). Kein brauchbarer Generator, weil der Latent Space Lücken hat.</td></tr>
    <tr><td><b>VAE</b></td><td>Encoder gibt μ und σ, <code>z = μ + σ · ε</code> (Reparametrisierungs-Trick, damit Backpropagation durchläuft). Loss: Rekonstruktion + KL zu N(0, 1). Geordneter Latent Space, stabil, Bilder etwas unscharf.</td></tr>
    <tr><td><b>PixelCNN</b></td><td>Erzeugt Pixel für Pixel, jedes abhängig von den vorherigen (maskierte Faltung). Echte Wahrscheinlichkeit, einfaches Training, Generieren sehr langsam.</td></tr>
    <tr><td><b>GAN</b></td><td>Generator gegen Discriminator, zwei Losses im Wechsel. Sehr scharfe Bilder, aber instabiles Training und Mode Collapse (nur noch wenige Bilder). Varianten: CycleGAN (Stil ohne gepaarte Beispiele), ESRGAN (Super-Resolution), DeblurGAN.</td></tr>
    <tr><td><b>Wahl</b></td><td>Kompromiss zwischen Schärfe (GAN), Stabilität und Latent Space (VAE) und Wahrscheinlichkeit (PixelCNN).</td></tr>
  </table></div>
  <p class="note"><a href="index.html#gen">Zum Kapitel →</a></p>

  <h3 id="k-modell">Modelle in der Praxis</h3>
  <div class="tablewrap"><table>
    <tr><th>Thema</th><th>Merke</th></tr>
    <tr><td><b>Was ist ein Modell?</b></td><td><code>ŷ = f(x; θ)</code>: Architektur (Form der Funktion, wählst du), Parameter θ (lernt das Training), Hyperparameter (steuern das Training, wählst du auf der Validation). Training ändert die Parameter, Inferenz (<code>predict</code>) nicht.</td></tr>
    <tr><td><b>Woher?</b></td><td>Selbst trainieren (Tabellendaten, eigene Aufgabe), fertig übernehmen (zero-shot), Transfer Learning (Basis einfrieren, neuer Kopf; wenig Daten) oder Fine-Tuning (obere Schichten mit kleiner Learning Rate; mehr Daten).</td></tr>
    <tr><td><b>Speichern</b></td><td>Die ganze Pipeline speichern, nicht nur den Schätzer: Ohne den Scaler rechnet das geladene Modell Unsinn, ohne Fehlermeldung. Dazu Metadaten (Version, Datum, Metrik, Library-Versionen) und eine Model Card.</td></tr>
    <tr><td><b>Formate</b></td><td>scikit-learn: joblib. Keras: <code>.keras</code>. PyTorch: <code>state_dict</code>. Austausch: ONNX. Achtung: pickle und joblib führen beim Laden Code aus; fremde Dateien nur als <code>.safetensors</code> oder mit <code>weights_only=True</code>.</td></tr>
    <tr><td><b>Drift</b></td><td>Data Drift: Die Eingaben verteilen sich anders. Concept Drift: Der Zusammenhang zwischen x und y ändert sich. Erkennen: Eingaben und Metrik im Einsatz überwachen.</td></tr>
    <tr><td><b>Neu trainieren</b></td><td>Komplett neu (alte + neue Daten), nur auf neuen Daten (vergisst seltene alte Fälle), weitertrainieren (<code>partial_fit</code>, Gefahr: Catastrophic Forgetting) oder nur den Kopf neu. Die neue Version muss auf festen und aktuellen Testdaten besser sein, sonst bleibt die alte. Testdaten nie ins Training.</td></tr>
    <tr><td><b>Checkliste</b></td><td>Baseline, Split vor der Vorverarbeitung, Pipeline, Seed und Versionen, Hyperparameter nur auf der Validation, einmal testen, Fehler ansehen, Pipeline mit Metadaten speichern, alte Version für den Rollback behalten.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#modell">Zum Kapitel →</a></p>
`,
  });
})();
