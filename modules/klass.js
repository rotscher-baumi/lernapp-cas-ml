/* Module: Supervised Learning Tag 2: Klassifikation. Content lives in the html field; the demos live in assets/demos-klass.js. */
(function () {
  LernApp.register({
    id: 'klass',
    order: 80,
    nav: 'Klassifikation',
    title: `Supervised Learning: Klassifikation`,
    kicker: `Modul 2 · Supervised Learning, Tag 2 (Fr 30.10.)`,
    summary: `Logistische Regression, Metriken, Ungleichgewicht, Bäume, Ensembles, Leakage`,
    html: `  <p>Gleiche Idee wie am Tag 1 (Beispiele mit bekannter Antwort), aber die Antwort ist jetzt eine <b>Klasse</b> statt einer Zahl: Betrug ja/nein, Spam ja/nein, Katze/Hund/Vogel. Alles von Tag 1 gilt weiter: Train/Test, Cross-Validation, Skalieren, Regularisierung, Hyperparameter-Suche.</p>
  <div class="grid2">
    <div><h4>Regression</h4><p>Vorhersage einer Zahl (Preis, Temperatur). Fehler: MSE, MAE.</p></div>
    <div><h4>Klassifikation</h4><p>Vorhersage einer Klasse (ja/nein, A/B/C). Fehler: Cross-Entropy, Metriken wie Precision und Recall.</p></div>
  </div>
  <p class="note">Jedes Regressionsproblem lässt sich in Klassen umbauen, indem man das Ziel in Bereiche («Bins») einteilt, zum Beispiel Blutdruck in normal / erhöht / hoch. Das vereinfacht und macht Ergebnisse leichter erklärbar, kostet aber Information.</p>

  <h3>1 · Logistische Regression</h3>
  <p>Trotz des Namens ein Klassifikator. Die Idee: Rechne wie bei der linearen Regression <code>z = w·x + b</code>. Dieses z kann beliebig gross oder klein sein. Die <b>Sigmoid-Funktion</b> presst es in den Bereich 0 bis 1 und macht daraus eine <b>Wahrscheinlichkeit</b>:</p>
  <pre><code>p = 1 / (1 + e^(-z))      z = w1*x1 + w2*x2 + ... + b</code></pre>
  <p>Aus der Wahrscheinlichkeit wird eine Klasse über einen <b>Threshold</b> (Standard 0,5): p über dem Threshold heisst «positiv», sonst «negativ». Die Stelle, wo p genau 0,5 ist (z = 0), ist die <b>Entscheidungsgrenze</b>.</p>
  <div class="demo" id="sgDemo">
    <div class="tag">Demo</div><h4>Sigmoid und Entscheidungsgrenze</h4>
    <svg class="plot" id="sgSvg" viewBox="0 0 320 190" role="img" aria-label="Sigmoid-Kurve mit Datenpunkten der Klassen 0 und 1"></svg>
    <div class="ctl"><label for="sgW">Steilheit w</label><input type="range" id="sgW" min="0.2" max="4" step="0.1" value="1"><output id="sgWO"></output></div>
    <div class="ctl"><label for="sgB">Verschiebung b</label><input type="range" id="sgB" min="-4" max="4" step="0.1" value="0"><output id="sgBO"></output></div>
    <div class="stats"><span>Grenze bei x = <b id="sgBd"></b></span><span>richtig klassifiziert <b id="sgAcc"></b></span></div>
    <p class="hint">Gefüllte Punkte sind Klasse 1, leere Klasse 0. Die Kurve ist die vorhergesagte Wahrscheinlichkeit für Klasse 1. Eine grosse Steilheit macht das Modell «sicherer», aber auch härter bei den zwei durchmischten Punkten um x = 0. Trainiert wird nicht mit MSE, sondern mit der <b>Cross-Entropy</b> (bestraft sichere falsche Antworten sehr stark) und Gradient Descent wie am Tag 1.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Weitergeführt: die 10 Wohnungen von Tag 1</h4>
  <p>Gleiche Wohnungen, gleiche Achse (qm), nur die Frage ändert sich. Tag 1: <i>Wie viel kostet die Wohnung?</i> Jetzt: <i>Ist sie teuer?</i> Dazu legst du einen Preis-Threshold fest, <code>teuer = 1</code> wenn der Preis darüber liegt, sonst 0. Beide Modelle rechnen dasselbe <code>z = b + w·qm</code>. Der einzige Unterschied ist, was mit z passiert:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Lineare Regression</th><th>Logistische Regression</th></tr>
    <tr><td>Frage</td><td>Wie teuer?</td><td>Teuer ja/nein?</td></tr>
    <tr><td>Ausgabe</td><td><code>Preis = z</code></td><td><code>P(teuer) = 1 / (1 + e^(-z))</code></td></tr>
    <tr><td>Wertebereich</td><td>beliebig, auch negativ</td><td>immer zwischen 0 und 1</td></tr>
    <tr><td>Ziel in den Daten</td><td>echter Preis</td><td>0 oder 1</td></tr>
    <tr><td>Fehlermass</td><td>MSE (Abstand zur Geraden)</td><td>Cross-Entropy</td></tr>
  </table></div>
  <div class="demo" id="lgDemo">
    <div class="tag">Demo</div><h4>Von der Preisgeraden zur Wahrscheinlichkeit</h4>
    <svg class="plot" id="lgSvg" viewBox="0 0 320 230" role="img" aria-label="10 Wohnungen: qm gegen Preis mit Gerade oder qm gegen Wahrscheinlichkeit teuer mit Sigmoid-Kurve"></svg>
    <div class="btnrow"><button class="pri" id="lgLin">Preis (linear)</button><button id="lgLog">Teuer ja/nein (logistisch)</button></div>
    <div class="ctl"><label for="lgT">Preis-Threshold «teuer»</label><input type="range" id="lgT" min="1500" max="2300" step="50" value="1800"><output id="lgTO"></output></div>
    <div class="stats"><span id="lgForm"></span></div>
    <div class="stats"><span>Grenze bei <b id="lgBd"></b> qm</span><span id="lgOdds"></span></div>
    <p class="hint">Gefüllte Punkte sind «teuer». <b>Linear:</b> Die Gerade ist das Modell von Tag 1, die gestrichelte Linie der Preis-Threshold. Dort, wo die Gerade den Threshold kreuzt, liegt eine Art Grenze, aber die Gerade sagt dir nur einen Preis, keine Wahrscheinlichkeit. <b>Logistisch:</b> Dasselbe z geht durch die Sigmoid-Funktion, und die Kurve ist P(teuer). Die Grenze ist da, wo P = 0,5 ist (z = 0). Verschiebst du den Threshold, wandern Klassen und Grenze mit. Die Gewichte kommen aus Gradient Descent mit leichter Regularisierung (ohne sie würde w bei sauber trennbaren Daten ins Unendliche wachsen).</p>
  </div>
  <div class="falle"><b>Falle (Gerade auf 0/1 legen)</b><p>Man könnte auch eine lineare Regression direkt auf die Werte 0 und 1 legen. Sie liefert dann Werte unter 0 und über 1, die sich nicht als Wahrscheinlichkeit lesen lassen, und einzelne extreme Wohnungen ziehen die Gerade und damit die Grenze weg. Die Sigmoid-Kurve bleibt zwischen 0 und 1.</p></div>
  <p><b>Was bedeutet das Gewicht w?</b> Bei der linearen Regression: «10 qm mehr, im Schnitt w·10 CHF mehr». Bei der logistischen Regression wirkt w auf die <b>Log-Odds</b>: <code>ln(p / (1 - p)) = z</code>. Diese sind linear in qm. 10 qm mehr erhöhen z um 10·w, und die Odds (p gegen 1-p) werden mit dem Faktor <code>e^(10·w)</code> multipliziert.</p>
  <div class="demo" id="lsDemo">
    <div class="tag">Demo</div><h4>Warum Cross-Entropy statt MSE?</h4>
    <svg class="plot" id="lsSvg" viewBox="0 0 320 190" role="img" aria-label="Fehler in Abhängigkeit der vorhergesagten Wahrscheinlichkeit für eine Wohnung, die wirklich teuer ist"></svg>
    <div class="ctl"><label for="lsP">Vorhergesagte P(teuer)</label><input type="range" id="lsP" min="1" max="99" step="1" value="10"><output id="lsPO"></output></div>
    <div class="stats"><span>Cross-Entropy <b id="lsCE"></b></span><span>MSE <b id="lsMS"></b></span></div>
    <p class="hint"><b>Was du siehst:</b> Die Wohnung ist wirklich teuer (y = 1). Mit dem Regler stellst du ein, wie viel Wahrscheinlichkeit das Modell für «teuer» angibt. Die Linien zeigen die Strafe für diese Vorhersage: Je höher die Linie, desto schlechter.</p>
    <p class="hint"><b>Was passiert:</b> Liegt das Modell richtig (p nahe 1), sind beide Strafen klein. Liegt es sicher falsch (p nahe 0), steigt die Cross-Entropy (−ln p, durchgezogen) ohne Grenze, der MSE ((1−p)², gestrichelt) bleibt bei höchstens 1. Probiere p = 0,01: Cross-Entropy 4,6, MSE nur 0,98.</p>
    <p class="hint"><b>Warum das zählt:</b> Das Modell lernt, indem es die Gewichte dorthin schiebt, wo die Strafe kleiner wird. Dafür braucht es eine Steigung. Beim MSE ist sie bei sicher falschen Vorhersagen fast null, weil die Sigmoid-Kurve dort flach ist, und das Modell bleibt im Irrtum stecken. Bei der Cross-Entropy bleibt die Steigung gross, und das Modell korrigiert sich schnell.</p>
  </div>
  <pre><code>from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X_train, y_train)
clf.predict(X_test)          # Klassen (0/1)
clf.predict_proba(X_test)    # Wahrscheinlichkeiten pro Klasse</code></pre>
  <div class="merk"><b>Merksatz</b><p>Logistische Regression = lineare Regression + Sigmoid. Das Modell liefert zuerst eine Wahrscheinlichkeit, die Klasse entsteht erst durch den Threshold. Der Threshold ist deine Entscheidung, nicht die des Modells.</p></div>

  <h3 id="klass-metriken">2 · Wie gut ist ein Klassifikator? Confusion Matrix und Metriken</h3>
  <p>Jede Vorhersage fällt in eines von vier Fächern. Eselsbrücke: Der zweite Buchstabe ist, was das Modell sagt (positiv/negativ), der erste, ob es stimmt (True/False).</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Modell sagt positiv</th><th>Modell sagt negativ</th></tr>
    <tr><td><b>wirklich positiv</b></td><td class="b">TP (richtig erkannt)</td><td class="r">FN (übersehen)</td></tr>
    <tr><td><b>wirklich negativ</b></td><td class="r">FP (falscher Alarm)</td><td class="b">TN (richtig verneint)</td></tr>
  </table></div>
  <div class="tablewrap"><table>
    <tr><th>Mass</th><th>Formel</th><th>Frage dahinter</th></tr>
    <tr><td>Accuracy</td><td><code>(TP+TN) / alle</code></td><td>Wie oft liege ich insgesamt richtig?</td></tr>
    <tr><td>Precision</td><td><code>TP / (TP+FP)</code></td><td>Wenn ich «positiv» sage: wie oft stimmt das?</td></tr>
    <tr><td>Recall (Sensitivität)</td><td><code>TP / (TP+FN)</code></td><td>Wie viele der echten Positiven finde ich?</td></tr>
    <tr><td>F1</td><td><code>2·TP / (2·TP+FP+FN)</code></td><td>Ein Mittelwert aus Precision und Recall</td></tr>
  </table></div>
  <div class="falle"><b>Falle (Accuracy)</b><p>Bei seltenen Klassen ist Accuracy irreführend. Ein Modell, das immer «kein Betrug» sagt, hat bei 1 Betrug auf 100 Fällen 99 % Accuracy, findet aber nie einen Betrug (Recall 0, F1 0). Schau bei unausgewogenen Daten auf Precision, Recall, F1 und AUC.</p></div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Den Threshold verschieben: Precision gegen Recall</h4>
  <p>Senkst du den Threshold, sagt das Modell öfter «positiv»: mehr TP, aber auch mehr FP. Recall steigt (oder bleibt gleich), Precision sinkt meist. Es ist ein <b>Kompromiss</b>, und welche Seite wichtiger ist, hängt vom Problem ab. Bei einer Krebs-Früherkennung willst du kaum etwas übersehen (hoher Recall), bei einer Spam-Sperre willst du keine echte Mail löschen (hohe Precision).</p>
  <p>Die <b>ROC-Kurve</b> trägt für alle Thresholds den Recall (TPR) gegen die False Alarm Rate (FPR) auf. Ein perfektes Modell liegt oben links, Raten liegt auf der Diagonalen. Die <b>AUC</b> ist die Fläche unter der Kurve: 1 ist perfekt, 0,5 ist Zufall.</p>
  <div class="demo" id="thDemo">
    <div class="tag">Demo</div><h4>Threshold, Confusion Matrix und ROC</h4>
    <p class="hint">Wähle, wie viele echte Positive und Negative es gibt (Regler logarithmisch, 1 bis 1000). Die Form der Modell-Wahrscheinlichkeiten bleibt gleich: die meisten Fälle sind eindeutig, nur wenige liegen im Grenzbereich (bei 10 und 10 genau 4).</p>
    <div class="btnrow"><button class="pri" id="thP1">10 : 10 (ausgewogen)</button><button id="thP2">10 : 1000 (selten)</button><button id="thP3">1 : 1000 (sehr selten)</button></div>
    <div class="ctl"><label for="thNP">Anzahl echt positiv</label><input type="range" id="thNP" min="0" max="3" step="0.05" value="1"><output id="thNPO"></output></div>
    <div class="ctl"><label for="thNN">Anzahl echt negativ</label><input type="range" id="thNN" min="0" max="3" step="0.05" value="1"><output id="thNNO"></output></div>
    <svg class="plot" id="thSvg" viewBox="0 0 320 170" role="img" aria-label="Wahrscheinlichkeiten aller Fälle auf einer Achse mit Threshold"></svg>
    <div class="ctl"><label for="thT">Threshold</label><input type="range" id="thT" min="0.02" max="0.98" step="0.01" value="0.5"><output id="thTO"></output></div>
    <div class="tablewrap"><table style="min-width:0">
      <tr><th></th><th class="num">sagt positiv</th><th class="num">sagt negativ</th></tr>
      <tr><td>wirklich positiv</td><td class="num b" id="thTP"></td><td class="num r" id="thFN"></td></tr>
      <tr><td>wirklich negativ</td><td class="num r" id="thFP"></td><td class="num b" id="thTN"></td></tr>
    </table></div>
    <div class="tablewrap"><table style="min-width:0">
      <tr><th>Metric</th><th>Formel</th><th class="num">mit Zahlen</th><th class="num">Wert</th></tr>
      <tr><td>Accuracy</td><td><code>(TP+TN) / alle</code></td><td class="num" id="thAccF"></td><td class="num b" id="thAcc"></td></tr>
      <tr><td>Precision</td><td><code>TP / (TP+FP)</code></td><td class="num" id="thPreF"></td><td class="num b" id="thPre"></td></tr>
      <tr><td>Recall (TPR)</td><td><code>TP / (TP+FN)</code></td><td class="num" id="thRecF"></td><td class="num b" id="thRec"></td></tr>
      <tr><td>False Alarm Rate (FPR)</td><td><code>FP / (FP+TN)</code></td><td class="num" id="thFprF"></td><td class="num b" id="thFpr"></td></tr>
      <tr><td>F1</td><td><code>2·TP / (2·TP+FP+FN)</code></td><td class="num" id="thF1F"></td><td class="num b" id="thF1"></td></tr>
    </table></div>
    <div class="stats"><span>AUC <b id="thAuc"></b></span><span>Anteil Positive <b id="thPrev"></b></span><span>Accuracy von «immer negativ» <b id="thBase"></b></span></div>
    <p class="hint" id="thMsg">&nbsp;</p>
    <svg class="plot" id="thRoc" viewBox="0 0 320 210" role="img" aria-label="ROC-Kurve mit aktuellem Threshold-Punkt" style="margin-top:12px"></svg>
    <p class="hint">Oben: Kreis = echt positiv, Quadrat = echt negativ (bei vielen Fällen wird nur eine Auswahl gezeichnet). Alles rechts der Linie wird als positiv vorhergesagt. Unten: Der orange Punkt wandert beim Schieben des Thresholds auf der ROC-Kurve: Höherer Threshold (Linie nach rechts) bewegt ihn nach links unten, tieferer Threshold nach rechts oben.</p>
  </div>
  <div class="merk"><b>Zusammenfassung: Threshold, ROC, AUC</b><ul>
    <li><b>Threshold:</b> Das Modell liefert Wahrscheinlichkeiten, erst der Threshold macht daraus Klassen. Tieferer Threshold = mehr Recall, mehr falsche Alarme.</li>
    <li><b>ROC:</b> Jeder Threshold ergibt einen Punkt (FPR, TPR). Die ROC-Kurve verbindet alle Punkte.</li>
    <li><b>AUC:</b> Fläche unter der ROC-Kurve, unabhängig vom Threshold. 1 = perfekt, 0,5 = Zufall. Den Threshold wählst du danach nach den Kosten der Fehler.</li>
  </ul></div>

  <h3>3 · Mehr als zwei Klassen</h3>
  <ul>
    <li><b>One-vs-All</b>: Pro Klasse ein Zweiklassen-Modell («diese Klasse gegen alle anderen»). Die Klasse mit der höchsten Wahrscheinlichkeit gewinnt.</li>
    <li><b>Softmax</b>: Die Verallgemeinerung der Sigmoid-Funktion auf mehrere Klassen. Alle Wahrscheinlichkeiten sind positiv und summieren sich zu 1.</li>
  </ul>
  <p>Bewertet wird pro Klasse: Du betrachtest jede Klasse der Reihe nach als «positiv» und alle anderen als «negativ» und bekommst so TP, FP, FN, TN und Precision/Recall/F1 je Klasse. Zusammenfassen kannst du das auf zwei Arten:</p>
  <ul>
    <li><b>Micro</b>: Zuerst alle TP, FP, FN über alle Klassen addieren, dann die Masse berechnen. Hat jeder Fall genau ein Label (normales Multiclass), ist micro-Precision = micro-Recall = micro-F1 = Accuracy.</li>
    <li><b>Macro</b>: Die Masse pro Klasse berechnen und ungewichtet mitteln, jede Klasse zählt gleich.</li>
    <li><b>Weighted</b>: Wie macro, aber gewichtet nach Klassengrösse, damit grosse Klassen mehr zählen.</li>
  </ul>
  <pre><code>from sklearn.metrics import classification_report, confusion_matrix
print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred))   # Precision, Recall, F1 je Klasse + Mittel</code></pre>

  <h3>4 · Unausgewogene Klassen</h3>
  <p>Oft ist das Interessante selten: Betrug, Defekte, Krankheiten. Ein Modell kann dann die Minderheit ignorieren und trotzdem «gut» aussehen. Zwei Dinge sind zu tun: richtig messen (nicht Accuracy) und die Daten oder das Training anpassen.</p>
  <div class="demo" id="imDemo">
    <div class="tag">Demo</div><h4>Warum Accuracy täuscht</h4>
    <div class="ctl"><label for="imP">Anteil Positive</label><input type="range" id="imP" min="0.5" max="50" step="0.5" value="1"><output id="imPO"></output></div>
    <p class="hint">1000 Fälle. Vergleich: «Immer negativ» gegen ein echtes Modell mit 80 % Recall und 10 % falschem Alarm bei den Negativen.</p>
    <div class="tablewrap"><table style="min-width:0">
      <tr><th></th><th class="num">Accuracy</th><th class="num">Precision</th><th class="num">Recall</th><th class="num">F1</th></tr>
      <tr><td>Immer negativ</td><td class="num" id="imA1"></td><td class="num" id="imP1"></td><td class="num" id="imR1"></td><td class="num" id="imF1"></td></tr>
      <tr><td>Echtes Modell</td><td class="num" id="imA2"></td><td class="num" id="imP2"></td><td class="num" id="imR2"></td><td class="num" id="imF2"></td></tr>
    </table></div>
    <p class="hint" id="imMsg"></p>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Strategie</th><th>Idee</th><th>Risiko</th></tr>
    <tr><td>Downsampling</td><td>Von der Mehrheitsklasse zufällig nur so viele nehmen wie die Minderheit hat</td><td>Wirft Information weg</td></tr>
    <tr><td>Upsampling</td><td>Minderheits-Fälle zufällig duplizieren (mit Zurücklegen)</td><td>Overfitting auf die Duplikate</td></tr>
    <tr><td>SMOTE</td><td>Neue künstliche Minderheits-Fälle zwischen echten Nachbarn erzeugen: <code>s = x + (x' − x) · Zufall</code></td><td>Kann Rauschen erzeugen; braucht <code>imblearn</code></td></tr>
    <tr><td>Kostengewichtung</td><td>Fehler bei der Minderheit zählen mehr (<code>class_weight="balanced"</code>)</td><td>Wahrscheinlichkeiten sind danach verzerrt (nicht mehr kalibriert); sonst oft die einfachste Wahl</td></tr>
  </table></div>
  <div class="falle"><b>Falle</b><p>Resampling (Up/Downsampling, SMOTE) gehört <b>nur auf die Trainingsdaten</b>, nie auf das Test-Set. Sonst bewertest du auf künstlichen Daten und bekommst zu schöne Zahlen.</p></div>

  <h3 id="klass-modelle">5 · Nicht-lineare Klassifikatoren</h3>
  <p>Logistische Regression zieht eine <b>gerade</b> Grenze. Wenn die Klassen nicht so sauber trennbar sind, brauchst du flexiblere Modelle.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Wonach optimiert jedes Modell?</h4>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Optimiert wird …</th><th>Wie</th></tr>
    <tr><td><b>Logistische Regression</b></td><td>Log-Loss (Cross-Entropy)</td><td>Gradient Descent auf den Gewichten, optional mit Regularisierung</td></tr>
    <tr><td><b>kNN</b></td><td>nichts (kein Training)</td><td>Daten werden nur gespeichert. k und das Distanzmass wählst du über die Validation.</td></tr>
    <tr><td><b>Naive Bayes</b></td><td>Likelihood der Trainingsdaten</td><td>Zählen bzw. Mittelwert und Streuung je Klasse, geschlossene Formel ohne Iteration</td></tr>
    <tr><td><b>SVM</b></td><td>Hinge Loss + breite Margin (kleines ‖w‖²)</td><td>C gewichtet Fehler gegen Margin. Das Problem ist konvex, es gibt ein globales Optimum.</td></tr>
    <tr><td><b>Entscheidungsbaum</b></td><td>Impurity (Gini oder Entropie)</td><td>Gierig: In jedem Knoten der Split, der die Impurity am stärksten senkt</td></tr>
    <tr><td><b>Random Forest</b></td><td>wie der Baum, je Baum</td><td>Bagging: Bäume auf Stichproben, die Mehrheit entscheidet. Keine gemeinsame Optimierung.</td></tr>
    <tr><td><b>Boosting</b></td><td>Loss (z. B. Log-Loss) über alle Bäume</td><td>Jeder neue Baum folgt dem Gradienten des Loss, korrigiert also den Restfehler</td></tr>
    <tr><td><b>Neuronales Netz</b></td><td>Cross-Entropy</td><td>Backpropagation und Gradient Descent auf allen Gewichten</td></tr>
  </table></div>
  <p class="note"><b>Loss und Metrik sind verschieden:</b> Das Modell optimiert einen Loss, der sich ableiten lässt (Log-Loss, Hinge, Gini). Beurteilt wird es danach mit Precision, Recall, F1 oder AUC. Diese Werte werden beim Training meist nicht direkt optimiert. Den Threshold wählst du erst danach.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Wofür taugt welches Modell, wofür nicht?</h4>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Gut für …</th><th>Weniger gut …</th></tr>
    <tr><td><b>Logistische Regression</b></td><td><ul style="margin:0;padding-left:18px"><li>Wahrscheinlichkeiten und gut erklärbare Gewichte</li><li>schneller, stabiler Startpunkt (Baseline)</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Nur gerade Grenzen: Krummes braucht zusätzliche Merkmale</li><li>Skalieren nötig, empfindlich auf Ausreisser</li></ul></td></tr>
    <tr><td><b>kNN</b></td><td><ul style="margin:0;padding-left:18px"><li>Einfach, es gibt kein Training</li><li>folgt auch krummen, lokalen Mustern</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Langsam bei vielen Daten: jede Vorhersage rechnet gegen alle Punkte</li><li>Schwach bei vielen Merkmalen und ungleichen Skalen</li></ul></td></tr>
    <tr><td><b>Naive Bayes</b></td><td><ul style="margin:0;padding-left:18px"><li>Sehr schnell, auch mit wenigen Daten</li><li>Viele Merkmale, z. B. Text und Spam</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Die Annahme unabhängiger Merkmale stimmt selten</li><li>Wahrscheinlichkeiten sind oft schlecht kalibriert</li></ul></td></tr>
    <tr><td><b>SVM</b></td><td><ul style="margin:0;padding-left:18px"><li>Stark bei kleinen bis mittleren Datenmengen und vielen Merkmalen</li><li>Mit Kernel auch krumme Grenzen</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Langsam bei sehr vielen Zeilen</li><li>Keine direkten Wahrscheinlichkeiten; Skalieren, C und Kernel abstimmen</li></ul></td></tr>
    <tr><td><b>Entscheidungsbaum</b></td><td><ul style="margin:0;padding-left:18px"><li>Leicht zu lesen und zu erklären</li><li>Kein Skalieren nötig, mischt Zahlen und Kategorien</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Overfitting bei grosser Tiefe</li><li>Instabil: Kleine Datenänderungen können einen anderen Baum ergeben</li></ul></td></tr>
    <tr><td><b>Random Forest</b></td><td><ul style="margin:0;padding-left:18px"><li>Robuster Allrounder mit wenig Tuning</li><li>Zeigt die Wichtigkeit der Merkmale</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Schlechter erklärbar als ein einzelner Baum</li><li>Grösser und langsamer in der Vorhersage</li></ul></td></tr>
    <tr><td><b>Boosting</b></td><td><ul style="margin:0;padding-left:18px"><li>Oft die beste Genauigkeit bei Tabellendaten</li><li>Kommt mit gemischten Merkmalen und Lücken gut zurecht</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Mehr Hyperparameter, Overfitting bei Rauschen möglich</li><li>Bäume entstehen nacheinander, nicht parallel</li></ul></td></tr>
    <tr><td><b>Neuronales Netz</b></td><td><ul style="margin:0;padding-left:18px"><li>Lernt sehr komplexe Muster, besonders bei Bildern, Text und Audio</li><li>Wächst mit den Daten: Mehr Daten, bessere Ergebnisse</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Braucht viele Daten und Rechenzeit</li><li>Black Box, viele Einstellungen</li></ul></td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">k-nächste Nachbarn (kNN)</h4>
  <p>Für einen neuen Punkt suchst du die k nächsten Trainingspunkte und nimmst die Mehrheitsklasse (bei Regression den Durchschnitt). Es gibt kein Training, dafür ist die Vorhersage bei vielen Daten langsam. k steuert Bias und Variance: <b>k = 1</b> folgt jedem Punkt (Overfitting), <b>k = N</b> sagt für alle die Mehrheitsklasse (Underfitting).</p>
  <div class="demo" id="knDemo">
    <div class="tag">Demo</div><h4>kNN: Wirkung von k</h4>
    <svg class="plot" id="knSvg" viewBox="0 0 320 220" role="img" aria-label="Zwei Gruppen von Trainingspunkten (blau und orange) und ein Startpunkt mit seinen k nächsten Nachbarn"></svg>
    <div class="ctl"><label for="knK">k</label><input type="range" id="knK" min="1" max="39" step="2" value="1"><output id="knKO"></output></div>
    <div class="stats"><span>Trainings-Accuracy <b id="knTr"></b></span><span>Test-Accuracy (neue Punkte) <b id="knTe"></b></span></div>
    <p class="hint" id="knMsg"></p>
    <p class="hint">Die Raute «Startpunkt» = der neue Punkt, dessen Klasse gesucht ist (Klick ins Bild verschiebt ihn). Die Linien führen zu seinen k nächsten Nachbarn, der gestrichelte Kreis zeigt die Reichweite. Die Raute nimmt die Farbe der Mehrheit an.</p>
  </div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Eine neue Wohnung mit 76 qm. Die nächsten Nachbarn auf der qm-Achse sind 78 qm (teuer), 70 qm (nicht teuer) und 85 qm (teuer). Mit <b>k = 1</b> entscheidet allein die 78er: teuer. Mit <b>k = 3</b> stimmen 2 von 3 für teuer. Mit <b>k = 10</b> (alle) steht es 5 zu 5, es gibt keinen Mehrheitsentscheid mehr.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Naive Bayes</h4>
  <p>Berechnet mit dem Satz von Bayes, wie wahrscheinlich eine Klasse bei den beobachteten Merkmalen ist, und tut «naiv» so, als wären die Merkmale voneinander unabhängig. Beispiel aus den Folien: Spielen wir bei Sonne? Von 14 Tagen waren 9 Spieltage und 5 sonnig; an 3 der 9 Spieltage schien die Sonne.</p>
  <pre><code>P(Ja | sonnig) = P(sonnig | Ja) * P(Ja) / P(sonnig)
               = (3/9) * (9/14) / (5/14) = 0.60</code></pre>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Merkmal «gross» = mehr als 74 qm. 5 von 10 Wohnungen sind teuer, und alle 5 sind gross, keine der 5 anderen. Also <code>P(gross | teuer) = 5/5 = 1</code> und <code>P(gross | nicht teuer) = 0/5 = 0</code>. Das ergibt <code>P(teuer | gross) = 1</code>: sicher, nur weil wir eine Kombination nie gesehen haben. Das ist das <b>Nullfrequenz-Problem</b>. Die Abhilfe ist Glättung (Laplace: überall +1 zählen): <code>P(gross | teuer) = 6/7</code>, <code>P(gross | nicht teuer) = 1/7</code>, also <code>P(teuer | gross) = 6/7 ≈ 0,86</code>.</p>
  <div class="demo" id="nbDemo">
    <div class="tag">Demo</div><h4>Naive Bayes: Wohnfläche und Prior</h4>
    <svg class="plot" id="nbSvg" viewBox="0 0 320 170" role="img" aria-label="Zwei Glockenkurven für teure und nicht teure Wohnungen, mit der Wohnfläche des neuen Falls"></svg>
    <div class="ctl"><label for="nbX">Wohnfläche des neuen Falls</label><input type="range" id="nbX" min="30" max="150" step="1" value="76"><output id="nbXO"></output></div>
    <div class="ctl"><label for="nbP">Prior P(teuer)</label><input type="range" id="nbP" min="5" max="95" step="5" value="50"><output id="nbPO"></output></div>
    <div class="stats"><span>P(teuer | x) <b id="nbPost"></b></span><span>Likelihood teuer <b id="nbLb"></b></span><span>Likelihood nicht teuer <b id="nbLa"></b></span></div>
    <p class="hint" id="nbMsg">&nbsp;</p>
    <p class="hint">Blau = teuer, orange = nicht teuer: je eine Glockenkurve, aus den 10 Wohnungen geschätzt und mit dem Prior gewichtet. Die Linie ist der neue Fall. Die Klasse mit der höheren Kurve an dieser Stelle gewinnt.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Support Vector Machine (SVM)</h4>
  <p>Sucht die Trennlinie mit dem <b>breitesten Abstand</b> zu beiden Klassen. Nur die Punkte am Rand (Support Vectors) bestimmen sie. Mit <b>Kernels</b> werden die Daten gedanklich in einen höheren Raum gehoben, wo sie sich gerade trennen lassen. Stark bei vielen Merkmalen.</p>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Die grösste nicht teure Wohnung hat 70 qm, die kleinste teure 78 qm. Diese zwei sind die <b>Support Vectors</b>. Die Trennlinie mit dem breitesten Abstand liegt in der Mitte bei <b>74 qm</b>, je 4 qm von beiden Seiten entfernt. Die anderen acht Wohnungen könntest du löschen, die Grenze bliebe gleich.</p>
  <p><b>Was macht C?</b> Eine SVM sucht eine Linie mit einer möglichst breiten «Strasse» (Margin) zwischen den Klassen. Bei überlappenden Daten geht das nicht perfekt: Einzelne Punkte liegen in der Strasse oder auf der falschen Seite. <b>C ist das Bussgeld pro solchem Fehler.</b> Formal minimiert die SVM <code>½·‖w‖² + C · Σ Fehler</code>: Der erste Teil will eine breite Margin, der zweite wenige und kleine Verletzungen. Kleines C = billige Fehler, also eine breite Margin, die viele Punkte verletzen darf. Grosses C = teure Fehler, also eine schmale Margin, die kaum Punkte verletzt.</p>
  <div class="demo" id="svDemo">
    <div class="tag">Demo</div><h4>SVM: Wirkung von C</h4>
    <p class="hint">40 Wohnungen mit Wohnfläche und Lage. Blau = teuer, orange = nicht teuer. Der Preis hängt von beiden ab, dazu kommt Rauschen. Schiebe C und beobachte die Strasse (gestrichelt) und die roten Striche: Sie zeigen, wie weit eine Wohnung die Margin verletzt.</p>
    <div class="btnrow"><button class="pri" id="svD0">Saubere Daten</button><button id="svD1">Verrauschte Daten</button></div>
    <svg class="plot" id="svSvg" viewBox="0 0 320 240" role="img" aria-label="Wohnfläche gegen Lage mit Trennlinie, Margin, roten Verletzungen und Support Vectors"></svg>
    <div class="ctl"><label for="svC">C (Bussgeld pro Fehler)</label><input type="range" id="svC" min="-1" max="3" step="0.25" value="0"><output id="svCO"></output></div>
    <div class="stats"><span>Support Vectors <b id="svN"></b></span><span>Verletzungen <b id="svV"></b></span><span>Breite der Margin (Grafikbreite = 100 %) <b id="svM"></b></span></div>
    <div class="stats"><span>Accuracy Training (40) <b id="svTr"></b></span><span>Accuracy Test (2000 neue) <b id="svTe"></b></span></div>
    <p class="hint" id="svMsg">&nbsp;</p>
    <p class="hint">Durchgezogen = Trennlinie, gestrichelt = Rand der Margin. Dicke Ringe = Support Vectors (auf oder in der Margin, nur sie bestimmen die Linie). Rote Striche = Verletzung: der Abstand, den die Wohnung bis zu ihrem Margin-Rand fehlt. Verletzungen zählen auch Wohnungen auf der richtigen Seite, die nur in der Margin liegen. Die Test-Accuracy zeigt, wie gut die Linie auf neuen Wohnungen hält. Bei sauberen Daten hilft ein grosses C, bei verrauschten ist ein mittleres C am besten.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Entscheidungsbaum</h4>
  <p>Eine Kette von Ja/Nein-Fragen. An jedem Knoten wird die Frage gewählt, die die Klassen am besten trennt (Mass: Gini oder Informationsgewinn), bis die Blätter «rein» sind oder die maximale Tiefe erreicht ist. Gut lesbar, aber ein tiefer Baum lernt die Trainingsdaten auswendig. Gegenmittel: <code>max_depth</code> begrenzen oder zurückschneiden.</p>
  <p>Ein Entscheidungsbaum braucht <b>keine lineare Regression</b> und keine Sigmoid-Funktion: Er schätzt keine Gewichte, sondern teilt die Daten mit Thresholds auf einzelne Merkmale auf. Er ist damit eine <b>Alternative</b> zur logistischen Regression, kein Ersatz. Vorteile: nicht lineare Zusammenhänge, kein Skalieren der Merkmale nötig. Nachteile: Die Grenzen verlaufen achsenparallel (treppenförmig), tiefe Bäume overfitten schnell, und die Wahrscheinlichkeiten aus den Blättern sind grob.</p>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Am Anfang sind 5 teure und 5 nicht teure Wohnungen gemischt (Gini = 0,5, maximal unrein). Die beste Frage ist «Mehr als 74 qm?»: Links landen 5 nicht teure, rechts 5 teure, beide Blätter sind sofort rein (Gini = 0). Ein einziger Schnitt genügt, der Baum hat Tiefe 1. Die SVM legt ihre Grenze ebenfalls genau in die Mitte (74 qm), die logistische Regression etwa dorthin (zwischen 70 und 78 qm), nur mit anderem Weg.</p>
  <div class="demo" id="dtDemo">
    <div class="tag">Demo</div><h4>Entscheidungsbaum: Wirkung der Tiefe</h4>
    <svg class="plot" id="dtSvg" viewBox="0 0 320 220" role="img" aria-label="Rechtecke des Baums mit Trennlinien und Trainingspunkten"></svg>
    <div class="ctl"><label for="dtD">Maximale Tiefe</label><input type="range" id="dtD" min="1" max="8" step="1" value="2"><output id="dtDO"></output></div>
    <svg class="plot" id="dtTree" viewBox="0 0 320 175" role="img" aria-label="Der Baum als Diagramm: Fragen in den Knoten, Klassen in den Blättern" style="margin-top:10px"></svg>
    <svg class="plot" id="dtCurve" viewBox="0 0 320 125" role="img" aria-label="Accuracy von Training und Test für die Tiefen 1 bis 8" style="margin-top:10px"></svg>
    <div class="stats"><span>Blätter <b id="dtL"></b></span><span>Trainings-Accuracy <b id="dtTr"></b></span><span>Test-Accuracy (neue Punkte) <b id="dtTe"></b></span></div>
    <p class="hint" id="dtMsg">&nbsp;</p>
    <p class="hint">Oben: Jede Frage ist eine Linie, jede Fläche ein Blatt. Je kräftiger die Farbe, desto reiner das Blatt. Mitte: Derselbe Baum als Diagramm (Frage im Knoten, Quadrat = Blatt, vollständig bis zur gewählten Tiefe). Unten: Training (blau) steigt immer, Test (orange) nicht. Gleiche Daten wie bei kNN.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Neuronale Netze</h4>
  <p>Schichten aus künstlichen Neuronen mit gewichteten Verbindungen, die per Backpropagation trainiert werden (Gradient Descent über alle Schichten). Mit sehr vielen Schichten spricht man von Deep Learning, das kommt im nächsten Modul.</p>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Ein einzelnes Neuron mit Sigmoid, <code>P(teuer) = sigmoid(w·qm + b)</code>, <i>ist</i> die logistische Regression von oben. Weitere Schichten brauchst du hier nicht, denn die Klassen sind mit einem Schnitt bei 74 qm trennbar. Mehr Schichten lohnen sich erst bei Mustern, die keine einzelne Grenze beschreiben kann.</p>

  <div class="demo" id="nnDemo">
    <div class="tag">Demo</div><h4>Neuronales Netz: Neuron für Neuron beim Lernen zusehen</h4>
    <div class="btnrow"><button class="pri" id="nnD1">Kreis</button><button id="nnD2">XOR</button><button id="nnD3">Zwei Gruppen</button></div>
    <svg class="plot" id="nnSvg" viewBox="0 0 320 220" role="img" aria-label="Entscheidungsfläche des Netzes mit Trainingspunkten"></svg>
    <div class="ctl"><label for="nnH">Neuronen in der versteckten Schicht</label><input type="range" id="nnH" min="1" max="8" step="1" value="4"><output id="nnHO"></output></div>
    <div class="btnrow"><button class="pri" id="nnPlay">Training starten</button><button id="nnStep">+100 Runden</button><button id="nnReset">Zurücksetzen</button></div>
    <svg class="plot" id="nnNeu" viewBox="0 0 320 150" role="img" aria-label="Jedes versteckte Neuron mit seiner eigenen Trennlinie" style="margin-top:10px"></svg>
    <svg class="plot" id="nnLoss" viewBox="0 0 320 120" role="img" aria-label="Loss von Training und Test über die Trainingsrunden" style="margin-top:10px"></svg>
    <div class="stats"><span>Runde (Epoche) <b id="nnEp"></b></span><span>Trainings-Accuracy <b id="nnTr"></b></span><span>Test-Accuracy (neue Punkte) <b id="nnTe"></b></span><span>Loss (Train / Test) <b id="nnLs"></b></span></div>
    <p class="hint" id="nnMsg">&nbsp;</p>
    <p class="hint">Oben: die Entscheidungsfläche des ganzen Netzes. Mitte: Jedes Neuron schaut für sich auf die Ebene (blau = Aktivierung positiv, orange = negativ); in Klammern sein Gewicht zur Ausgabe. Das Netz kombiniert diese einfachen Bilder zur Form oben. Unten: Der Loss (Fehlermass) sinkt, solange das Netz lernt. «Zwei Gruppen» braucht nur ein Neuron, «Kreis» und XOR mehrere.</p>
  </div>
  <h3>6 · Ensembles: viele schwache Modelle ergeben ein starkes</h3>
  <p>Ein einzelnes Modell macht Fehler, ein tiefer Baum lernt die Trainingsdaten sogar auswendig. Die Idee der Ensembles: Nimm <b>viele einfache Bäume</b> statt eines grossen und kombiniere sie. Es gibt zwei Wege, und der Unterschied ist die wichtigste Frage dieses Abschnitts: Arbeiten die Bäume <i>nebeneinander</i> oder <i>nacheinander</i>?</p>
  <div class="grid2">
    <div><h4>Bagging (Random Forest): die Jury</h4>
      <p>Viele Bäume werden <b>unabhängig voneinander und gleichzeitig</b> trainiert. Jeder bekommt eine etwas andere Version der Daten und kommt darum zu einem etwas anderen Ergebnis. Am Schluss stimmen alle ab (Klasse) oder man bildet den Mittelwert (Zahl).</p>
      <ol>
        <li>Zufällige Stichprobe ziehen, <i>mit Zurücklegen</i> (manche Zeilen doppelt, manche fehlen).</li>
        <li>Darauf einen Baum trainieren. Beim Random Forest darf er bei jedem Split nur eine zufällige Auswahl der Merkmale ansehen.</li>
        <li>Schritt 1 und 2 viele Male wiederholen (zum Beispiel 100 Bäume).</li>
        <li>Alle Bäume befragen: Mehrheit oder Mittelwert.</li>
      </ol>
      <p><b>Bild:</b> Eine Jury aus vielen Gutachtern, die sich einzeln mal irren, aber nicht alle am selben Ort. Im Mittel heben sich die Fehler auf. Das senkt die <b>Varianz</b>. Gegen zu einfache Bäume (hoher Bias) hilft es nicht.</p></div>
    <div><h4>Boosting (Gradient Boosting): die Nachhilfe</h4>
      <p>Die Bäume werden <b>nacheinander</b> trainiert. Jeder neue Baum schaut nur auf das, was die bisherigen noch falsch machen, den <b>Restfehler</b>, und versucht genau diesen zu verkleinern.</p>
      <ol>
        <li>Start mit einer groben Vorhersage (Regression: der Durchschnitt).</li>
        <li>Restfehler ausrechnen: echter Wert minus bisherige Vorhersage.</li>
        <li>Einen kleinen Baum (oft nur Tiefe 1 bis 3) auf diese Restfehler trainieren.</li>
        <li>Davon nur einen Bruchteil addieren, die <b>Lernrate</b> (zum Beispiel 0,3). Zurück zu Schritt 2, bis die gewählte Rundenzahl erreicht ist.</li>
      </ol>
      <p><b>Bild:</b> Ein Schüler macht eine Übung, der Nachhilfelehrer streicht nur die Fehler an, der Schüler verbessert genau diese, und das Ganze wiederholt sich. Das senkt den <b>Bias</b>. Bei zu vielen Runden oder zu hoher Lernrate lernt es am Ende das Rauschen mit.</p></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th></th><th>Bagging</th><th>Boosting</th></tr>
    <tr><td>Reihenfolge</td><td>parallel, die Bäume wissen nichts voneinander</td><td>nacheinander, jeder baut auf den Fehlern der anderen auf</td></tr>
    <tr><td>Bäume</td><td>tief und «gross» (jeder allein overfittet)</td><td>flach und «schwach» (einzeln zu einfach)</td></tr>
    <tr><td>Hilft gegen</td><td>hohe Varianz (Overfitting)</td><td>hohen Bias (Underfitting)</td></tr>
    <tr><td>Risiko</td><td>wenig, robust ohne viel Einstellen</td><td>Overfitting bei zu vielen Runden oder zu hoher Lernrate</td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Wann nehme ich was?</h4>
  <p>Die erste Frage ist nicht «welches ist besser?», sondern «was fehlt meinem Modell?». Vergleiche dazu den Score auf dem Training mit dem auf der Validierung.</p>
  <div class="grid2">
    <div><h4>Bagging (Random Forest), wenn …</h4>
      <ul>
        <li>der einzelne Baum <b>overfittet</b>: Training sehr gut, Validierung deutlich schlechter.</li>
        <li>du einen <b>starken ersten Wurf ohne viel Einstellen</b> willst. Die Standardwerte reichen oft.</li>
        <li>die Daten <b>verrauscht</b> sind oder Ausreisser haben. Der Mittelwert über viele Bäume glättet das.</li>
        <li>du schnell trainieren willst: Die Bäume sind unabhängig und laufen parallel (<code>n_jobs=-1</code>).</li>
      </ul></div>
    <div><h4>Boosting (Gradient Boosting), wenn …</h4>
      <ul>
        <li>das Modell <b>zu einfach</b> ist: Training und Validierung sind beide schlecht (Underfitting).</li>
        <li>du auf Tabellendaten die <b>bestmögliche Genauigkeit</b> brauchst und Zeit zum Einstellen hast.</li>
        <li>du Lernrate, Rundenzahl und Tiefe mit Validierung abstimmen kannst, am besten mit <i>Early Stopping</i> (aufhören, wenn der Validierungsfehler wieder steigt).</li>
        <li>die Daten sauber sind: Boosting richtet sich nach den Restfehlern und versucht darum auch, falsche Labels und Ausreisser zu lernen.</li>
      </ul></div>
  </div>
  <div class="falle"><b>Wann keines von beiden</b><p>Wenn der Zusammenhang fast linear ist, gewinnt die einfache Gerade oder die logistische Regression. Bei sehr wenigen Zeilen (etwa unter 100) lohnt sich der Aufwand nicht. Wenn du das Ergebnis erklären musst, ist ein einzelner kleiner Baum besser lesbar. Bei Bildern und Text sind neuronale Netze die Wahl.</p></div>
  <div class="merk"><b>Faustregel</b><p>Starte mit einem Random Forest als starker Baseline. Reicht die Genauigkeit nicht, probiere Boosting und stimme es mit der Validierung ab. Diagnose: Training gut und Validierung schlecht → Bagging. Beide schlecht → Boosting.</p></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Beispiel: 100 Wohnungen</h4>
  <p>Die 10 Wohnungen von Tag 1 sind für Ensembles zu wenig: Bei 10 Punkten und einem fast linearen Preis gibt es nichts zu verbessern. Darum nimmt dieses Beispiel <b>100 Wohnungen</b> (erfunden, mit festen Zufallszahlen, es sind immer dieselben). <b>70</b> davon dienen zum Trainieren, <b>30</b> zum Testen: Das Modell sieht sie nie, und der Test-Fehler zeigt, wie gut es auf <i>neue</i> Wohnungen passt. Gesucht ist wieder der <b>Preis</b> aus den qm (Ensembles gibt es genauso für Regression). Der Preis steigt mit den qm und springt ab etwa 85 qm nach oben, weil grosse Wohnungen pro qm teurer sind. Dazu kommt Rauschen (Lage, Zustand), das kein Modell vorhersagen kann.</p>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th class="num">Fehler Training (CHF)</th><th class="num">Fehler Test (CHF)</th></tr>
    <tr><td>Gerade von Tag 1</td><td class="num">131</td><td class="num">154</td></tr>
    <tr><td>Einzelbaum, Tiefe 3</td><td class="num">76</td><td class="num">126</td></tr>
    <tr><td>Einzelbaum, Tiefe 6</td><td class="num">55</td><td class="num">128</td></tr>
    <tr><td>Bagging, 20 Bäume, Tiefe 3</td><td class="num">72</td><td class="num">107</td></tr>
    <tr><td>Boosting, 30 Runden, Tiefe 1, Lernrate 0,3</td><td class="num">70</td><td class="num">104</td></tr>
    <tr><td>Boosting, 50 Runden, Tiefe 3, Lernrate 1</td><td class="num">40</td><td class="num">131</td></tr>
  </table></div>
  <ul>
    <li><b>Einzelbaum:</b> Die Gerade kann den Sprung bei 85 qm nicht abbilden (Bias). Ein tiefer Baum (Tiefe 6) lernt dagegen auch das Rauschen: Auf den 70 Trainings-Wohnungen ist der Fehler klein (55 CHF), auf den 30 neuen deutlich grösser (128 CHF). Dieser Abstand ist das Overfitting.</li>
    <li><b>Bagging:</b> Jeder Baum bekommt 70 Wohnungen, die <i>mit Zurücklegen</i> gezogen werden. Manche kommen doppelt vor, andere gar nicht (im Schnitt sind etwa 63 % verschiedene dabei). Jeder Baum irrt anders, der Mittelwert über 20 Bäume ist glatter und merkt sich weniger Rauschen: Der Test-Fehler sinkt von 126 auf 107 CHF, obwohl die Bäume gleich tief sind (Varianz).</li>
    <li><b>Boosting, Runde für Runde:</b> Start ist der Durchschnittspreis, <b>1480 CHF</b> für jede Wohnung. Die kleinste Wohnung (30 qm) kostet aber nur 940, der Restfehler ist also <b>−540</b>. Runde 1: Ein Baum der Tiefe 1 schneidet bei 86 qm. Links (38 Wohnungen) liegt der mittlere Restfehler bei −396, rechts (32 Wohnungen) bei +470. Mit Lernrate 0,3 wird nur ein Teil addiert: die 30-qm-Wohnung steigt nicht auf 1084, sondern auf 1480 − 0,3·396 ≈ <b>1361</b>. Ihr Restfehler schrumpft von −540 auf etwa <b>−420</b>. Runde 2 schneidet bei 80 qm und korrigiert die neuen Restfehler, Runde 3 bei 90 qm, danach liegt der Restfehler bei etwa −260. Nach 3 Runden ist der Test-Fehler noch hoch (204 CHF, Underfitting), nach 30 Runden sinkt er auf 104 CHF (Bias). Mit Tiefe 3 und Lernrate 1 lernt Boosting dagegen auch das Rauschen: Training 40, Test 131 CHF.</li>
  </ul>
  <div class="demo" id="enDemo">
    <div class="tag">Demo</div><h4>Einzelbaum, Bagging und Boosting auf 100 Wohnungen</h4>
    <svg class="plot" id="enSvg" viewBox="0 0 320 230" role="img" aria-label="100 Wohnungen: qm gegen Preis mit der Vorhersage eines Einzelbaums, von Bagging oder von Boosting. Gefüllte Punkte sind Trainings-, leere Testwohnungen"></svg>
    <div class="btnrow"><button class="pri" id="enM1">Einzelbaum</button><button id="enM2">Bagging</button><button id="enM3">Boosting</button></div>
    <div class="ctl"><label for="enD">Tiefe der Bäume</label><input type="range" id="enD" min="1" max="4" step="1" value="3"><output id="enDO"></output></div>
    <div class="ctl" id="enNW"><label for="enN">Anzahl Bäume</label><input type="range" id="enN" min="1" max="50" step="1" value="20"><output id="enNO"></output></div>
    <div class="ctl" id="enLW"><label for="enL">Lernrate</label><input type="range" id="enL" min="0.05" max="1" step="0.05" value="0.3"><output id="enLO"></output></div>
    <div class="stats"><span>Fehler Training (70, gefüllt) <b id="enTr"></b> CHF</span><span>Fehler Test (30, leer) <b id="enLo"></b> CHF</span></div>
    <p class="hint" id="enMsg"></p>
  </div>
  <p class="hint">Der Test-Fehler ist der ehrliche: Er misst, wie gut das Modell auf Wohnungen passt, die es nie gesehen hat (RMSE). Er kann nicht unter das Rauschen in den Daten sinken (hier etwa 90 CHF). Die Gerade von Tag 1 liegt bei 154 CHF, die Ensembles schlagen sie, weil der Preis einen Sprung hat. Wäre der Zusammenhang fast linear, würde das einfachere Modell gewinnen. Mit 30 Test-Wohnungen schwanken die Werte etwas, achte auf den Abstand zwischen Training und Test.</p>
  <pre><code>from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
# X = qm der Trainings-Wohnungen (Spalte), y = Preis
rf = RandomForestRegressor(n_estimators=200, random_state=0).fit(X, y)
gb = GradientBoostingRegressor(n_estimators=50, max_depth=1, learning_rate=0.3).fit(X, y)
# Für «teuer ja/nein»: RandomForestClassifier / GradientBoostingClassifier</code></pre>

  <h3 id="klass-leakage">7 · Data Leakage</h3>
  <p>Leakage heisst: Das Modell sieht beim Training Information, die es bei der echten Vorhersage nicht hätte. Folge: wunderbare Testwerte und ein Modell, das im Einsatz versagt.</p>
  <ul>
    <li><b>Target Leakage</b>: Ein Merkmal enthält die Antwort schon. Beispiel aus der Vorlesung: Ein Kündigungsmodell mit 100 % Treffer, weil Anrufe beim Kundendienst («ich möchte kündigen») erst <i>nach</i> der Kündigung entstehen.</li>
    <li><b>Zufälliger Schlüssel</b>: Die Kontonummer sagt etwas voraus, weil sie von der Reihenfolge der Kunden abhängt (z. B. Neukunden haben höhere Nummern).</li>
    <li><b>Vorverarbeitung vor dem Split</b>: Skalieren, Imputieren oder Feature-Auswahl auf allen Daten, bevor getrennt wird. Lösung: <code>Pipeline</code>.</li>
    <li><b>Zeitreihen</b>: Zukunft im Training. Immer nach Zeit trennen.</li>
  </ul>
  <div class="merk"><b>Merksatz</b><p>Misstraue zu guten Zahlen. Frage bei jedem Merkmal: «Hätte ich diesen Wert zum Zeitpunkt der Vorhersage wirklich?» Verdächtig sind auffällig gute Validierungs- oder Testwerte (die im Einsatz einbrechen) und ein einzelnes Merkmal mit enormem Gewicht. Ein grosser Abstand Training zu Validation ist dagegen Overfitting, nicht Leakage.</p></div>
`,
    exercises: [
      {
        t: 'Metriken aus der Confusion Matrix',
        task: `Ein Betrugsmodell hat auf 1000 Fällen: TP=40, FP=10, FN=20, TN=930. Berechne <code>precision</code>, <code>recall</code>, <code>f1</code> und <code>accuracy</code> (als Zahlen zwischen 0 und 1).`,
        start: `tp, fp, fn, tn = 40, 10, 20, 930\nprecision = None  # TODO\nrecall = None  # TODO\nf1 = None  # TODO\naccuracy = None  # TODO\nprint(precision, recall, f1, accuracy)`,
        check: `assert abs(precision - 0.8) < 1e-6, "precision = tp / (tp + fp)"\nassert abs(recall - 40/60) < 1e-6, "recall = tp / (tp + fn)"\nassert abs(f1 - 80/110) < 1e-6, "f1 = 2*tp / (2*tp + fp + fn)"\nassert abs(accuracy - 0.97) < 1e-6, "accuracy = (tp + tn) / alle"`,
        sol: `precision = tp / (tp + fp)\nrecall = tp / (tp + fn)\nf1 = 2 * tp / (2 * tp + fp + fn)\naccuracy = (tp + tn) / (tp + fp + fn + tn)`,
      },
      {
        t: 'Sigmoid selbst schreiben',
        task: `Schreibe die Funktion <code>sigmoid(z)</code> mit <code>math.exp</code>: <code>1 / (1 + e^(-z))</code>. Bei z = 0 muss 0.5 herauskommen.`,
        start: `import math\n\ndef sigmoid(z):\n    return None  # TODO\n\nprint(sigmoid(0), sigmoid(4), sigmoid(-4))`,
        check: `assert abs(sigmoid(0) - 0.5) < 1e-9, "sigmoid(0) muss 0.5 sein"\nassert sigmoid(4) > 0.98 and sigmoid(-4) < 0.02`,
        sol: `import math\n\ndef sigmoid(z):\n    return 1 / (1 + math.exp(-z))`,
      },
      {
        t: 'Threshold anwenden',
        task: `Das Modell liefert Wahrscheinlichkeiten. Mach daraus eine Liste <code>labels</code> aus 0 und 1: 1, wenn die Wahrscheinlichkeit <b>mindestens</b> <code>threshold</code> ist. Zähle dann mit <code>tp</code>, wie viele Positive du richtig erkannt hast.`,
        start: `probs = [0.9, 0.4, 0.65, 0.2, 0.55, 0.1]\nechte = [1, 1, 1, 0, 0, 0]\nthreshold = 0.5\nlabels = []  # TODO: Liste mit 0/1\ntp = 0  # TODO\nprint(labels, tp)`,
        check: `assert labels == [1, 0, 1, 0, 1, 0], "labels stimmt nicht"\nassert tp == 2, "tp: Positive, die richtig als 1 vorhergesagt wurden"`,
        sol: `labels = [1 if p >= threshold else 0 for p in probs]\ntp = sum(1 for l, e in zip(labels, echte) if l == 1 and e == 1)`,
      },
    ],
    quiz: [
      { q: `Warum ist Accuracy bei 1 % Betrugsfällen ein schlechtes Mass?`, a: `Ein Modell, das nie Betrug meldet, hat 99 % Accuracy und ist trotzdem nutzlos. Precision, Recall, F1 und AUC zeigen, wie gut die seltene Klasse erkannt wird.` },
      { q: `Du senkst den Threshold von 0,5 auf 0,2. Was passiert mit Recall und Precision?`, a: `Mehr Fälle werden positiv: Recall steigt (oder bleibt gleich), Precision sinkt meist, weil mehr falsche Alarme dazukommen.` },
      { q: `Was bedeutet eine AUC von 0,5, was von 1?`, a: `0,5 ist Zufall (ROC-Kurve auf der Diagonalen), 1 ist ein perfekter Klassifikator (alle Positiven vor allen Negativen).` },
      { q: `Was passiert bei kNN mit k = 1 und mit k = N?`, a: `k = 1 folgt jedem Trainingspunkt (Overfitting, trainings-perfekt). k = N sagt immer die Mehrheitsklasse (Underfitting).` },
      { q: `Worin unterscheiden sich Bagging und Boosting?`, a: `Bagging trainiert viele Modelle parallel auf Zufallsstichproben und mittelt (senkt Varianz). Boosting trainiert nacheinander, jedes Modell korrigiert die Restfehler des bisherigen Gesamtmodells (senkt Bias, anfälliger für Rauschen).` },
      { q: `Wie entsteht Data Leakage, und wie verhinderst du es bei Skalierung und Imputation?`, a: `Information aus Test- oder Zukunftsdaten fliesst ins Training. Alle lernenden Vorverarbeitungsschritte nur auf den Trainingsdaten fitten, am einfachsten mit einer Pipeline in der Cross-Validation.` },
      { q: `Wann darfst du ein Resampling (z. B. SMOTE) anwenden?`, a: `Nur auf die Trainingsdaten, nie auf Validation oder Test. Sonst wird auf künstlichen Daten bewertet.` },
    ],
    init() { LernApp.demos.klass(); },
  });
})();
