/* Module: Supervised Learning Tag 2: Klassifikation. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  const sigmoid=z=>1/(1+Math.exp(-z));
  function gridSvg(W,H,G,GY,f){let s='';const cw=W/G,ch=H/GY;for(let i=0;i<G;i++)for(let j=0;j<GY;j++){const x=(i+0.5)/G,y=1-(j+0.5)/GY;s+='<rect x="'+(i*cw)+'" y="'+(j*ch)+'" width="'+(cw+0.5)+'" height="'+(ch+0.5)+'" style="fill:'+(f(x,y)?'var(--accent)':'var(--warn)')+';opacity:.25"/>'}return s}

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
  <p>Aus der Wahrscheinlichkeit wird eine Klasse über eine <b>Schwelle</b> (Standard 0,5): p über der Schwelle heisst «positiv», sonst «negativ». Die Stelle, wo p genau 0,5 ist (z = 0), ist die <b>Entscheidungsgrenze</b>.</p>
  <div class="demo" id="sgDemo">
    <div class="tag">Demo</div><h4>Sigmoid und Entscheidungsgrenze</h4>
    <svg class="plot" id="sgSvg" viewBox="0 0 320 190" role="img" aria-label="Sigmoid-Kurve mit Datenpunkten der Klassen 0 und 1"></svg>
    <div class="ctl"><label for="sgW">Steilheit w</label><input type="range" id="sgW" min="0.2" max="4" step="0.1" value="1"><output id="sgWO"></output></div>
    <div class="ctl"><label for="sgB">Verschiebung b</label><input type="range" id="sgB" min="-4" max="4" step="0.1" value="0"><output id="sgBO"></output></div>
    <div class="stats"><span>Grenze bei x = <b id="sgBd"></b></span><span>richtig klassifiziert <b id="sgAcc"></b></span></div>
    <p class="hint">Gefüllte Punkte sind Klasse 1, leere Klasse 0. Die Kurve ist die vorhergesagte Wahrscheinlichkeit für Klasse 1. Eine grosse Steilheit macht das Modell «sicherer», aber auch härter bei den zwei durchmischten Punkten um x = 0. Trainiert wird nicht mit MSE, sondern mit der <b>Cross-Entropy</b> (bestraft sichere falsche Antworten sehr stark) und Gradient Descent wie am Tag 1.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Weitergeführt: die 10 Wohnungen von Tag 1</h4>
  <p>Gleiche Wohnungen, gleiche Achse (qm), nur die Frage ändert sich. Tag 1: <i>Wie viel kostet die Wohnung?</i> Jetzt: <i>Ist sie teuer?</i> Dazu legst du eine Preisschwelle fest, <code>teuer = 1</code> wenn der Preis darüber liegt, sonst 0. Beide Modelle rechnen dasselbe <code>z = b + w·qm</code>. Der einzige Unterschied ist, was mit z passiert:</p>
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
    <div class="ctl"><label for="lgT">Preisschwelle «teuer»</label><input type="range" id="lgT" min="1500" max="2300" step="50" value="1800"><output id="lgTO"></output></div>
    <div class="stats"><span id="lgForm"></span></div>
    <div class="stats"><span>Grenze bei <b id="lgBd"></b> qm</span><span id="lgOdds"></span></div>
    <p class="hint">Gefüllte Punkte sind «teuer». <b>Linear:</b> Die Gerade ist das Modell von Tag 1, die gestrichelte Linie die Preisschwelle. Dort, wo die Gerade die Schwelle kreuzt, liegt eine Art Grenze, aber die Gerade sagt dir nur einen Preis, keine Wahrscheinlichkeit. <b>Logistisch:</b> Dasselbe z geht durch die Sigmoid-Funktion, und die Kurve ist P(teuer). Die Grenze ist da, wo P = 0,5 ist (z = 0). Verschiebst du die Schwelle, wandern Klassen und Grenze mit. Die Gewichte kommen aus Gradient Descent mit leichter Regularisierung (ohne sie würde w bei sauber trennbaren Daten ins Unendliche wachsen).</p>
  </div>
  <div class="falle"><b>Falle (Gerade auf 0/1 legen)</b><p>Man könnte auch eine lineare Regression direkt auf die Werte 0 und 1 legen. Sie liefert dann Werte unter 0 und über 1, die sich nicht als Wahrscheinlichkeit lesen lassen, und einzelne extreme Wohnungen ziehen die Gerade und damit die Grenze weg. Die Sigmoid-Kurve bleibt zwischen 0 und 1.</p></div>
  <p><b>Was bedeutet das Gewicht w?</b> Bei der linearen Regression: «10 qm mehr, im Schnitt w·10 CHF mehr». Bei der logistischen Regression wirkt w auf die <b>Log-Odds</b>: <code>ln(p / (1 - p)) = z</code>. Diese sind linear in qm. 10 qm mehr erhöhen z um 10·w, und die Odds (p gegen 1-p) werden mit dem Faktor <code>e^(10·w)</code> multipliziert.</p>
  <div class="demo" id="lsDemo">
    <div class="tag">Demo</div><h4>Warum Cross-Entropy statt MSE?</h4>
    <svg class="plot" id="lsSvg" viewBox="0 0 320 190" role="img" aria-label="Fehler in Abhängigkeit der vorhergesagten Wahrscheinlichkeit für eine Wohnung, die wirklich teuer ist"></svg>
    <div class="ctl"><label for="lsP">Vorhergesagte P(teuer)</label><input type="range" id="lsP" min="1" max="99" step="1" value="10"><output id="lsPO"></output></div>
    <div class="stats"><span>Cross-Entropy <b id="lsCE"></b></span><span>MSE <b id="lsMS"></b></span></div>
    <p class="hint">Die Wohnung ist wirklich teuer (y = 1). Sagt das Modell nur 1 % Wahrscheinlichkeit, ist es sicher und falsch. Die Cross-Entropy (−ln p, durchgezogen) schiesst dann steil nach oben und zwingt das Modell zur Korrektur. Der quadratische Fehler ((1−p)², gestrichelt) bleibt bei maximal 1. Zusammen mit der Sigmoid wird sein Gradient bei sicher falschen Vorhersagen fast 0, das Modell korrigiert kaum.</p>
  </div>
  <pre><code>from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X_train, y_train)
clf.predict(X_test)          # Klassen (0/1)
clf.predict_proba(X_test)    # Wahrscheinlichkeiten pro Klasse</code></pre>
  <div class="merk"><b>Merksatz</b><p>Logistische Regression = lineare Regression + Sigmoid. Das Modell liefert zuerst eine Wahrscheinlichkeit, die Klasse entsteht erst durch die Schwelle. Die Schwelle ist deine Entscheidung, nicht die des Modells.</p></div>

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

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Die Schwelle verschieben: Precision gegen Recall</h4>
  <p>Senkst du die Schwelle, sagt das Modell öfter «positiv»: mehr TP, aber auch mehr FP. Recall steigt (oder bleibt gleich), Precision sinkt meist. Es ist ein <b>Kompromiss</b>, und welche Seite wichtiger ist, hängt vom Problem ab. Bei einer Krebs-Früherkennung willst du kaum etwas übersehen (hoher Recall), bei einer Spam-Sperre willst du keine echte Mail löschen (hohe Precision).</p>
  <p>Die <b>ROC-Kurve</b> trägt für alle Schwellen die Trefferquote (TPR = Recall) gegen die Rate falscher Alarme (FPR) auf. Ein perfektes Modell liegt oben links, Raten liegt auf der Diagonalen. Die <b>AUC</b> ist die Fläche unter der Kurve: 1 ist perfekt, 0,5 ist Zufall.</p>
  <div class="demo" id="thDemo">
    <div class="tag">Demo</div><h4>Schwelle, Confusion Matrix und ROC</h4>
    <p class="hint">Wähle, wie viele echte Positive und Negative es gibt (Regler logarithmisch, 1 bis 1000). Die Form der Modell-Wahrscheinlichkeiten bleibt gleich: die meisten Fälle sind eindeutig, nur wenige liegen im Grenzbereich (bei 10 und 10 genau 4).</p>
    <div class="btnrow"><button class="pri" id="thP1">10 : 10 (ausgewogen)</button><button id="thP2">10 : 1000 (selten)</button><button id="thP3">1 : 1000 (sehr selten)</button></div>
    <div class="ctl"><label for="thNP">Anzahl echt positiv</label><input type="range" id="thNP" min="0" max="3" step="0.05" value="1"><output id="thNPO"></output></div>
    <div class="ctl"><label for="thNN">Anzahl echt negativ</label><input type="range" id="thNN" min="0" max="3" step="0.05" value="1"><output id="thNNO"></output></div>
    <svg class="plot" id="thSvg" viewBox="0 0 320 170" role="img" aria-label="Wahrscheinlichkeiten aller Fälle auf einer Achse mit Schwelle"></svg>
    <div class="ctl"><label for="thT">Schwelle</label><input type="range" id="thT" min="0.02" max="0.98" step="0.01" value="0.5"><output id="thTO"></output></div>
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
    <svg class="plot" id="thRoc" viewBox="0 0 320 210" role="img" aria-label="ROC-Kurve mit aktuellem Schwellenpunkt" style="margin-top:12px"></svg>
    <p class="hint">Oben: Kreis = echt positiv, Quadrat = echt negativ (bei vielen Fällen wird nur eine Auswahl gezeichnet). Alles rechts der Linie wird als positiv vorhergesagt. Unten: Der orange Punkt wandert beim Schieben der Schwelle auf der ROC-Kurve: Höhere Schwelle (Linie nach rechts) bewegt ihn nach links unten, tiefere Schwelle nach rechts oben.</p>
  </div>
  <div class="merk"><b>Zusammenfassung: Schwelle, ROC, AUC</b><ul>
    <li><b>Schwelle:</b> Das Modell liefert Wahrscheinlichkeiten, erst die Schwelle macht daraus Klassen. Tiefere Schwelle = mehr Recall, mehr falsche Alarme.</li>
    <li><b>ROC:</b> Jede Schwelle ergibt einen Punkt (FPR, TPR). Die ROC-Kurve verbindet alle Punkte.</li>
    <li><b>AUC:</b> Fläche unter der ROC-Kurve, unabhängig von der Schwelle. 1 = perfekt, 0,5 = Zufall. Die Schwelle wählst du danach nach den Kosten der Fehler.</li>
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
    <svg class="plot" id="knSvg" viewBox="0 0 320 220" role="img" aria-label="Entscheidungsflächen von kNN mit Trainingspunkten"></svg>
    <div class="ctl"><label for="knK">k</label><input type="range" id="knK" min="1" max="59" step="2" value="1"><output id="knKO"></output></div>
    <div class="stats"><span>Trainings-Accuracy <b id="knTr"></b></span><span>Test-Accuracy (neue Punkte) <b id="knTe"></b></span></div>
    <p class="hint" id="knMsg"></p>
    <p class="hint">Die Raute «Startpunkt» = der neue Punkt, dessen Klasse gesucht ist (Klick ins Bild verschiebt ihn). Die Linien führen zu seinen k nächsten Nachbarn, der gestrichelte Kreis zeigt die Reichweite.</p>
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
  <div class="demo" id="svDemo">
    <div class="tag">Demo</div><h4>SVM: Wirkung von C</h4>
    <svg class="plot" id="svSvg" viewBox="0 0 320 220" role="img" aria-label="Zwei Klassen mit Trennlinie, Margin und Support Vectors"></svg>
    <div class="ctl"><label for="svC">C (Strafe für Fehler)</label><input type="range" id="svC" min="-1" max="2" step="0.25" value="0"><output id="svCO"></output></div>
    <div class="stats"><span>C <b id="svCv"></b></span><span>Support Vectors <b id="svN"></b></span><span>Breite der Margin <b id="svM"></b></span><span>Accuracy <b id="svA"></b></span></div>
    <p class="hint" id="svMsg">&nbsp;</p>
    <p class="hint">Durchgezogene Linie = Trennlinie, gestrichelt = Rand der Margin. Dicke Ringe = Support Vectors: nur sie bestimmen die Linie.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Entscheidungsbaum</h4>
  <p>Eine Kette von Ja/Nein-Fragen. An jedem Knoten wird die Frage gewählt, die die Klassen am besten trennt (Mass: Gini oder Informationsgewinn), bis die Blätter «rein» sind oder die maximale Tiefe erreicht ist. Gut lesbar, aber ein tiefer Baum lernt die Trainingsdaten auswendig. Gegenmittel: <code>max_depth</code> begrenzen oder zurückschneiden.</p>
  <p>Ein Entscheidungsbaum braucht <b>keine lineare Regression</b> und keine Sigmoid-Funktion: Er schätzt keine Gewichte, sondern teilt die Daten mit Schwellen auf einzelne Merkmale auf. Er ist damit eine <b>Alternative</b> zur logistischen Regression, kein Ersatz. Vorteile: nicht lineare Zusammenhänge, kein Skalieren der Merkmale nötig. Nachteile: Die Grenzen verlaufen achsenparallel (treppenförmig), tiefe Bäume overfitten schnell, und die Wahrscheinlichkeiten aus den Blättern sind grob.</p>
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
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Beispiel: die 10 Wohnungen</h4>
  <p>Bei der Klasse «teuer» reicht der eine Schnitt bei 74 qm, da gibt es für ein Ensemble nichts zu verbessern. Deshalb gehen wir hier zurück zur Frage von Tag 1, dem <b>Preis</b> (Ensembles gibt es genauso für Regression). Der Preis steigt nicht sauber mit den qm: die 70-qm-Wohnung (1620) ist billiger als die 62-qm-Wohnung (1770), die 85-qm-Wohnung (1850) billiger als die 78-qm-Wohnung (1890). Ein tiefer Baum lernt diese Ausreisser auswendig.</p>
  <ul>
    <li><b>Einzelbaum:</b> Mit Tiefe 3 hat fast jede Wohnung ihr eigenes Blatt. Auf den bekannten Wohnungen ist der Fehler klein (etwa 35 CHF), lässt du eine Wohnung weg, ist er viel grösser (etwa 240 CHF). Dieser Abstand ist das Overfitting.</li>
    <li><b>Bagging:</b> Jeder Baum bekommt 10 Wohnungen, die <i>mit Zurücklegen</i> gezogen werden. Manche kommen doppelt vor, andere gar nicht (im Schnitt sind etwa 65 % verschiedene dabei, bei vielen Daten 63 %). Jeder Baum irrt anders, der Mittelwert ist glatter und merkt sich weniger auswendig. Bei nur 10 Wohnungen bleibt der Fehler bei einer fehlenden Wohnung trotzdem ähnlich, der Vorteil zeigt sich erst bei mehr Daten.</li>
    <li><b>Boosting, Runde für Runde:</b> Start ist der Durchschnittspreis, <b>1841 CHF</b> für jede Wohnung. Die kleinste Wohnung (35 qm) kostet aber nur 1200, der Restfehler ist also <b>−641</b>. Runde 1: Ein Baum der Tiefe 1 schneidet bei 90 qm. Links (7 Wohnungen) liegt der mittlere Restfehler bei −215, rechts (3 Wohnungen) bei +502. Mit Lernrate 0,3 wird nur ein Teil addiert: die 35-qm-Wohnung steigt nicht auf 1626, sondern auf 1841 − 0,3·215 = <b>1776</b>. Ihr Restfehler schrumpft von −641 auf <b>−576</b>. Runde 2 schneidet bei 74 qm und korrigiert die neuen Restfehler, Runde 3 bei 58,5 qm. Nach drei Runden steht die 35-qm-Wohnung bei einem Restfehler von −416. Kleine Schritte, viele Runden: Die Linie in der Demo wandert dadurch Runde für Runde auf die Preise zu.</li>
  </ul>
  <div class="demo" id="enDemo">
    <div class="tag">Demo</div><h4>Einzelbaum, Bagging und Boosting auf den 10 Wohnungen</h4>
    <svg class="plot" id="enSvg" viewBox="0 0 320 230" role="img" aria-label="10 Wohnungen: qm gegen Preis mit der Vorhersage eines Einzelbaums, von Bagging oder von Boosting"></svg>
    <div class="btnrow"><button class="pri" id="enM1">Einzelbaum</button><button id="enM2">Bagging</button><button id="enM3">Boosting</button></div>
    <div class="ctl"><label for="enD">Tiefe der Bäume</label><input type="range" id="enD" min="1" max="4" step="1" value="3"><output id="enDO"></output></div>
    <div class="ctl" id="enNW"><label for="enN">Anzahl Bäume</label><input type="range" id="enN" min="1" max="50" step="1" value="20"><output id="enNO"></output></div>
    <div class="ctl" id="enLW"><label for="enL">Lernrate</label><input type="range" id="enL" min="0.05" max="1" step="0.05" value="0.3"><output id="enLO"></output></div>
    <div class="stats"><span>Fehler auf den bekannten Wohnungen <b id="enTr"></b> CHF</span><span>Fehler, wenn die Wohnung fehlt <b id="enLo"></b> CHF</span></div>
    <p class="hint" id="enMsg"></p>
  </div>
  <p class="hint">Der zweite Fehler ist «Leave-one-out»: Für jede Wohnung wird das Modell ohne sie neu trainiert und dann auf sie angewendet. Er zeigt, wie gut das Modell auf eine <i>neue</i> Wohnung passt (RMSE). Er bleibt überall hoch, weil kein Baum über die Randwohnungen (35 und 130 qm) hinaus extrapolieren kann: ausserhalb der bekannten qm ist die Vorhersage einfach der letzte Stufenwert. Zum Vergleich: Die einfache Gerade von Tag 1 hat bei fehlender Wohnung nur etwa 123 CHF Fehler. Sind die Daten fast linear, gewinnt das einfachere Modell, Ensembles lohnen sich erst bei komplizierteren Mustern und mehr Daten.</p>
  <pre><code>from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
# X = qm der 10 Wohnungen (Spalte), y = Preis
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
        t: 'Schwelle anwenden',
        task: `Das Modell liefert Wahrscheinlichkeiten. Mach daraus eine Liste <code>labels</code> aus 0 und 1: 1, wenn die Wahrscheinlichkeit <b>mindestens</b> <code>schwelle</code> ist. Zähle dann mit <code>tp</code>, wie viele Positive du richtig erkannt hast.`,
        start: `probs = [0.9, 0.4, 0.65, 0.2, 0.55, 0.1]\nechte = [1, 1, 1, 0, 0, 0]\nschwelle = 0.5\nlabels = []  # TODO: Liste mit 0/1\ntp = 0  # TODO\nprint(labels, tp)`,
        check: `assert labels == [1, 0, 1, 0, 1, 0], "labels stimmt nicht"\nassert tp == 2, "tp: Positive, die richtig als 1 vorhergesagt wurden"`,
        sol: `labels = [1 if p >= schwelle else 0 for p in probs]\ntp = sum(1 for l, e in zip(labels, echte) if l == 1 and e == 1)`,
      },
    ],
    quiz: [
      { q: `Warum ist Accuracy bei 1 % Betrugsfällen ein schlechtes Mass?`, a: `Ein Modell, das nie Betrug meldet, hat 99 % Accuracy und ist trotzdem nutzlos. Precision, Recall, F1 und AUC zeigen, wie gut die seltene Klasse erkannt wird.` },
      { q: `Du senkst die Schwelle von 0,5 auf 0,2. Was passiert mit Recall und Precision?`, a: `Mehr Fälle werden positiv: Recall steigt (oder bleibt gleich), Precision sinkt meist, weil mehr falsche Alarme dazukommen.` },
      { q: `Was bedeutet eine AUC von 0,5, was von 1?`, a: `0,5 ist Zufall (ROC-Kurve auf der Diagonalen), 1 ist ein perfekter Klassifikator (alle Positiven vor allen Negativen).` },
      { q: `Was passiert bei kNN mit k = 1 und mit k = N?`, a: `k = 1 folgt jedem Trainingspunkt (Overfitting, trainings-perfekt). k = N sagt immer die Mehrheitsklasse (Underfitting).` },
      { q: `Worin unterscheiden sich Bagging und Boosting?`, a: `Bagging trainiert viele Modelle parallel auf Zufallsstichproben und mittelt (senkt Varianz). Boosting trainiert nacheinander, jedes Modell korrigiert die Restfehler des bisherigen Gesamtmodells (senkt Bias, anfälliger für Rauschen).` },
      { q: `Wie entsteht Data Leakage, und wie verhinderst du es bei Skalierung und Imputation?`, a: `Information aus Test- oder Zukunftsdaten fliesst ins Training. Alle lernenden Vorverarbeitungsschritte nur auf den Trainingsdaten fitten, am einfachsten mit einer Pipeline in der Cross-Validation.` },
      { q: `Wann darfst du ein Resampling (z. B. SMOTE) anwenden?`, a: `Nur auf die Trainingsdaten, nie auf Validation oder Test. Sonst wird auf künstlichen Daten bewertet.` },
    ],
    init() {
      const MU='−';
      // Demo 1: sigmoid
      (function(){
        const xs=[-4,-3,-2.5,-1.5,-0.5,0.5,1,2,3,4.5],ys=[0,0,0,0,1,0,1,1,1,1];
        const W=320,H=190,PX=30,PY=20,sx=x=>PX+((x+6)/12)*(W-PX-10),sy=p=>H-PY-p*(H-PY-12);
        function draw(){const w=+$('sgW').value,b=+$('sgB').value;$('sgWO').textContent=fmt(w,1);$('sgBO').textContent=fmt(b,1);
          let s='<line class="ax" x1="'+PX+'" y1="'+sy(0)+'" x2="'+(W-10)+'" y2="'+sy(0)+'"/><line class="ax" x1="'+PX+'" y1="'+sy(1)+'" x2="'+(W-10)+'" y2="'+sy(1)+'"/>';
          s+='<line class="dash" x1="'+PX+'" y1="'+sy(0.5)+'" x2="'+(W-10)+'" y2="'+sy(0.5)+'"/>';
          for(const t of[0,0.5,1])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
          for(let t=-6;t<=6;t+=3)s+='<text class="lbl" x="'+(sx(t)-4)+'" y="'+(H-4)+'">'+t+'</text>';
          let p='';for(let i=0;i<=120;i++){const x=-6+i*0.1;p+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(sigmoid(w*x+b)).toFixed(1)}
          s+='<path class="ln" d="'+p+'"/>';
          const bd=-b/w;if(bd>-6&&bd<6)s+='<line class="res" x1="'+sx(bd)+'" y1="12" x2="'+sx(bd)+'" y2="'+sy(0)+'"/>';
          let ok=0;xs.forEach((x,i)=>{const pr=sigmoid(w*x+b);if((pr>=0.5?1:0)===ys[i])ok++;
            s+='<circle cx="'+sx(x)+'" cy="'+sy(ys[i])+'" r="5" style="fill:'+(ys[i]?'var(--accent)':'var(--surface)')+';stroke:var(--accent);stroke-width:2"/>'});
          $('sgSvg').innerHTML=s;$('sgBd').textContent=fmt(bd,2).replace('-',MU);$('sgAcc').textContent=ok+LernApp.t(' von ',' of ')+xs.length}
        $('sgW').addEventListener('input',draw);$('sgB').addEventListener('input',draw);draw()})();

      // Demo 1b: 10 apartments, linear price vs. logistic P(expensive), same z = b + w*qm
      (function(){
        const qm=[35,48,55,62,70,78,85,95,110,130],pr=[1200,1510,1540,1770,1620,1890,1850,2280,2170,2580],n=10;
        const W=320,H=230,PX=40,PY=22,XA=25,XB=140;
        const sx=x=>PX+((x-XA)/(XB-XA))*(W-PX-12);
        const mean=a=>a.reduce((p,c)=>p+c,0)/a.length;
        let mode='lin';
        function ols(){const mx=mean(qm),my=mean(pr);let sxy=0,sxx=0;qm.forEach((x,i)=>{sxy+=(x-mx)*(pr[i]-my);sxx+=(x-mx)*(x-mx)});const w=sxy/sxx;return{w,b:my-w*mx}}
        function logfit(y){const mx=mean(qm),sd=Math.sqrt(mean(qm.map(x=>(x-mx)*(x-mx)))),xs=qm.map(x=>(x-mx)/sd);
          let w=0,b=0;const lam=0.05,lr=0.5;
          for(let k=0;k<3000;k++){let gw=lam*w,gb=0;xs.forEach((x,i)=>{const e=sigmoid(w*x+b)-y[i];gw+=e*x/n;gb+=e/n});w-=lr*gw;b-=lr*gb}
          return{w:w/sd,b:b-w*mx/sd}}
        function draw(){
          const T=+$('lgT').value;$('lgTO').textContent=T+' CHF';
          const y=pr.map(p=>p>=T?1:0),ln=ols(),lg=logfit(y),lin=mode==='lin';
          $('lgLin').className=lin?'pri':'';$('lgLog').className=lin?'':'pri';
          const sy=lin?(v=>H-PY-((v-1000)/(2800-1000))*(H-PY-12)):(p=>H-PY-p*(H-PY-12));
          let s='<line class="ax" x1="'+PX+'" y1="'+(H-PY)+'" x2="'+(W-8)+'" y2="'+(H-PY)+'"/>';
          for(let t=40;t<=140;t+=20)s+='<text class="lbl" x="'+(sx(t)-8)+'" y="'+(H-6)+'">'+t+'</text>';
          s+='<text class="lbl" x="'+(W-24)+'" y="'+(H-PY-4)+'">'+LernApp.t('qm','m²')+'</text>';
          let bd;
          if(lin){
            for(const t of[1000,1500,2000,2500])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
            s+='<line class="dash" x1="'+PX+'" y1="'+sy(T)+'" x2="'+(W-8)+'" y2="'+sy(T)+'"/>';
            s+='<path class="ln" d="M'+sx(XA)+' '+sy(ln.b+ln.w*XA)+'L'+sx(XB)+' '+sy(ln.b+ln.w*XB)+'"/>';
            bd=(T-ln.b)/ln.w;
            pr.forEach((p,i)=>{s+='<line class="res" x1="'+sx(qm[i])+'" y1="'+sy(p)+'" x2="'+sx(qm[i])+'" y2="'+sy(ln.b+ln.w*qm[i])+'"/>'});
            pr.forEach((p,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(p)+'" r="4.5" style="fill:'+(y[i]?'var(--accent)':'var(--surface)')+';stroke:var(--accent);stroke-width:2"/>'});
            $('lgForm').innerHTML=LernApp.t('Preis = z = <b>','Price = z = <b>')+fmt(ln.b,0)+'</b> + <b>'+fmt(ln.w,1)+LernApp.t('</b>·qm','</b>·m²');
            $('lgOdds').innerHTML=LernApp.t('10 qm mehr = <b>+','10 m² more = <b>+')+fmt(ln.w*10,0)+'</b> CHF';
          }else{
            for(const t of[0,0.5,1])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
            s+='<line class="dash" x1="'+PX+'" y1="'+sy(0.5)+'" x2="'+(W-8)+'" y2="'+sy(0.5)+'"/>';
            let p='';for(let i=0;i<=115;i++){const x=XA+i;p+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(sigmoid(lg.b+lg.w*x)).toFixed(1)}
            s+='<path class="ln" d="'+p+'"/>';
            bd=-lg.b/lg.w;
            pr.forEach((q,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(y[i])+'" r="4.5" style="fill:'+(y[i]?'var(--accent)':'var(--surface)')+';stroke:var(--accent);stroke-width:2"/>'});
            $('lgForm').innerHTML='z = <b>'+fmt(lg.b,2).replace('-',MU)+'</b> + <b>'+fmt(lg.w,3)+LernApp.t('</b>·qm &nbsp;→&nbsp; P(teuer) = 1/(1+e<sup>−z</sup>)','</b>·m² &nbsp;→&nbsp; P(expensive) = 1/(1+e<sup>−z</sup>)');
            $('lgOdds').innerHTML=LernApp.t('10 qm mehr = Odds ×<b>','10 m² more = odds ×<b>')+fmt(Math.exp(lg.w*10),1)+'</b>';
          }
          if(bd>XA&&bd<XB)s+='<line class="res" x1="'+sx(bd)+'" y1="12" x2="'+sx(bd)+'" y2="'+(H-PY)+'"/>';
          $('lgSvg').innerHTML=s;$('lgBd').textContent=fmt(bd,0);
        }
        $('lgLin').addEventListener('click',()=>{mode='lin';draw()});
        $('lgLog').addEventListener('click',()=>{mode='log';draw()});
        $('lgT').addEventListener('input',draw);draw()})();

      // Demo 1c: cross-entropy vs. MSE for a true positive
      (function(){
        const W=320,H=190,PX=30,PY=20,sx=p=>PX+p*(W-PX-10),sy=v=>H-PY-Math.min(v,5)/5*(H-PY-12);
        function draw(){
          const p=+$('lsP').value/100;$('lsPO').textContent=fmt(p,2);
          let s='<line class="ax" x1="'+PX+'" y1="'+sy(0)+'" x2="'+(W-10)+'" y2="'+sy(0)+'"/>';
          for(const t of[0,1,2,3,4,5])s+='<text class="lbl" x="6" y="'+(sy(t)+3)+'">'+t+'</text>';
          for(const t of[0,0.5,1])s+='<text class="lbl" x="'+(sx(t)-6)+'" y="'+(H-4)+'">'+t+'</text>';
          let a='',b='';for(let i=0;i<=100;i++){const q=Math.max(i/100,0.007);a+=(i?'L':'M')+sx(i/100).toFixed(1)+' '+sy(-Math.log(q)).toFixed(1);b+=(i?'L':'M')+sx(i/100).toFixed(1)+' '+sy((1-i/100)*(1-i/100)).toFixed(1)}
          s+='<path class="ln" d="'+a+'"/><path class="ln2" d="'+b+'" style="stroke-dasharray:5 4"/>';
          s+='<circle cx="'+sx(p)+'" cy="'+sy(-Math.log(p))+'" r="5" style="fill:var(--accent)"/><circle cx="'+sx(p)+'" cy="'+sy((1-p)*(1-p))+'" r="5" style="fill:var(--warn)"/>';
          $('lsSvg').innerHTML=s;$('lsCE').textContent=fmt(-Math.log(p),2);$('lsMS').textContent=fmt((1-p)*(1-p),2)}
        $('lsP').addEventListener('input',draw);draw()})();

      // Demo 2: threshold, confusion matrix, ROC (class sizes adjustable; the score shape comes from a 10 + 10 template)
      (function(){
        const TPL_P=[0.42,0.58,0.74,0.78,0.82,0.85,0.88,0.91,0.94,0.97],TPL_N=[0.03,0.06,0.10,0.14,0.18,0.22,0.26,0.30,0.52,0.62];
        function scores(T,n){const o=[];for(let i=0;i<n;i++){const u=Math.min(9,Math.max(0,(i+0.5)/n*10-0.5)),a=Math.floor(u),b=Math.min(9,a+1);o.push(T[a]+(T[b]-T[a])*(u-a))}return o}
        const ge=(arr,t)=>{let lo=0,hi=arr.length;while(lo<hi){const m=(lo+hi)>>1;if(arr[m]>=t)hi=m;else lo=m+1}return arr.length-lo};
        let pos=[],neg=[],roc=[],auc=0;
        function counts(t){const tp=ge(pos,t),fp=ge(neg,t);return{tp:tp,fn:pos.length-tp,fp:fp,tn:neg.length-fp}}
        function prep(){pos=scores(TPL_P,Math.round(Math.pow(10,+$('thNP').value)));neg=scores(TPL_N,Math.round(Math.pow(10,+$('thNN').value)));
          const ths=[1.01].concat(pos.concat(neg).sort((a,b)=>b-a)).concat([0]);roc=ths.map(t=>{const c=counts(t);return[c.fp/neg.length,c.tp/pos.length]});
          auc=0;for(let i=1;i<roc.length;i++)auc+=(roc[i][0]-roc[i-1][0])*(roc[i][1]+roc[i-1][1])/2;
          $('thNPO').textContent=pos.length;$('thNNO').textContent=neg.length}
        const W=320,PX=10,sx=p=>PX+p*(W-2*PX);
        const RW=320,RH=210,RX=34,RY=14,rx=v=>RX+v*(RW-RX-14),ry=v=>RH-24-v*(RH-24-RY);
        function show(arr,max){const st=Math.max(1,Math.ceil(arr.length/max)),o=[];for(let i=0;i<arr.length;i+=st)o.push(arr[i]);return o}
        function draw(){const t=+$('thT').value;$('thTO').textContent=fmt(t,2);const c=counts(t),total=pos.length+neg.length;
          const sp=show(pos,200),sn=show(neg,200),many=sp.length>20||sn.length>20,R=many?6:3,sep=many?5:10,rad=many?2.5:5;
          let s='<line class="ax" x1="'+PX+'" y1="85" x2="'+(W-PX)+'" y2="85"/>';
          for(const v of[0,0.5,1])s+='<text class="lbl" x="'+(sx(v)-6)+'" y="165">'+v+'</text>';
          sp.forEach((p,i)=>{const col=p>=t?'var(--ok)':'var(--bad)';s+='<circle cx="'+sx(p)+'" cy="'+((many?34:40)+(i%R)*sep)+'" r="'+rad+'" style="fill:'+col+';stroke:var(--fg);stroke-width:'+(many?0.5:1)+'"/>'});
          sn.forEach((p,i)=>{const col=p>=t?'var(--bad)':'var(--ok)',y=(many?112:112)+(i%R)*sep;s+='<rect x="'+(sx(p)-rad)+'" y="'+(y-rad)+'" width="'+(2*rad)+'" height="'+(2*rad)+'" style="fill:'+col+';stroke:var(--fg);stroke-width:'+(many?0.5:1)+'"/>'});
          s+='<text class="lbl" x="'+PX+'" y="18">'+LernApp.t('echt positiv (Kreis): ','actually positive (circle): ')+pos.length+'</text><text class="lbl" x="'+PX+'" y="150">'+LernApp.t('echt negativ (Quadrat): ','actually negative (square): ')+neg.length+'</text>';
          s+='<line class="ln2" x1="'+sx(t)+'" y1="24" x2="'+sx(t)+'" y2="148"/>';
          $('thSvg').innerHTML=s;
          $('thTP').textContent=c.tp;$('thFN').textContent=c.fn;$('thFP').textContent=c.fp;$('thTN').textContent=c.tn;
          const pre=c.tp+c.fp?c.tp/(c.tp+c.fp):0,rec=c.tp/(c.tp+c.fn),f1=(2*c.tp+c.fp+c.fn)?2*c.tp/(2*c.tp+c.fp+c.fn):0,fpr=c.fp/(c.fp+c.tn);
          $('thAcc').textContent=fmt((c.tp+c.tn)/total,3);$('thPre').textContent=c.tp+c.fp?fmt(pre,3):'–';$('thRec').textContent=fmt(rec,3);$('thF1').textContent=fmt(f1,3);$('thFpr').textContent=fmt(fpr,3);
          $('thAccF').textContent='('+c.tp+'+'+c.tn+') / '+total;$('thPreF').textContent=c.tp+' / ('+c.tp+'+'+c.fp+')';$('thRecF').textContent=c.tp+' / ('+c.tp+'+'+c.fn+')';$('thFprF').textContent=c.fp+' / ('+c.fp+'+'+c.tn+')';$('thF1F').textContent='2·'+c.tp+' / (2·'+c.tp+'+'+c.fp+'+'+c.fn+')';
          $('thAuc').textContent=fmt(auc,3);$('thPrev').textContent=fmt(100*pos.length/total,1)+' %';$('thBase').textContent=fmt(neg.length/total,3);
          const stp=Math.max(1,Math.ceil(roc.length/300));let g='<line class="ax" x1="'+RX+'" y1="'+ry(0)+'" x2="'+rx(1)+'" y2="'+ry(0)+'"/><line class="ax" x1="'+RX+'" y1="'+ry(0)+'" x2="'+RX+'" y2="'+ry(1)+'"/>';
          g+='<line class="dash" x1="'+rx(0)+'" y1="'+ry(0)+'" x2="'+rx(1)+'" y2="'+ry(1)+'"/>';
          const pts=roc.filter((p,i)=>i%stp===0||i===roc.length-1);g+='<path class="ln" d="'+pts.map((p,i)=>(i?'L':'M')+rx(p[0]).toFixed(1)+' '+ry(p[1]).toFixed(1)).join('')+'"/>';
          g+='<text class="lbl" x="'+(RX+60)+'" y="'+(RH-6)+'">'+LernApp.t('Rate falscher Alarme (FPR)','False alarm rate (FPR)')+'</text><text class="lbl" x="2" y="10">Recall (TPR)</text>';
          g+='<text class="lbl" x="'+(RX-14)+'" y="'+(ry(0)+4)+'">0</text><text class="lbl" x="'+(RX-14)+'" y="'+(ry(1)+4)+'">1</text><text class="lbl" x="'+(rx(0)-3)+'" y="'+(ry(0)+13)+'">0</text><text class="lbl" x="'+(rx(1)-3)+'" y="'+(ry(0)+13)+'">1</text>';
          g+='<circle cx="'+rx(c.fp/neg.length)+'" cy="'+ry(c.tp/pos.length)+'" r="6" style="fill:var(--warn)"/>';
          $('thRoc').innerHTML=g;
          const ratio=neg.length/pos.length;
          $('thMsg').textContent=ratio>=50?LernApp.t('Seltene Positive: Die AUC bleibt hoch, weil die ROC nur Raten kennt. Die Precision aber bricht ein: Schon eine kleine False Alarm Rate ergibt mehr FP als TP, denn es gibt so viele Negative. Die Accuracy von «immer negativ» ist fast 1.','Rare positives: the AUC stays high, because the ROC only knows rates. The precision collapses though: even a small false alarm rate gives more FP than TP, because there are so many negatives. The accuracy of «always negative» is almost 1.'):ratio<=1/50?LernApp.t('Fast nur Positive: Die Precision ist leicht hoch, die False Alarm Rate wird aus sehr wenigen Negativen berechnet und schwankt stark.','Almost only positives: precision is easily high, the false alarm rate is computed from very few negatives and varies a lot.'):LernApp.t('Ausgewogen: Accuracy, Precision und Recall erzählen etwa dieselbe Geschichte. Setze die Negativen auf 1000 und schau, was passiert.','Balanced: accuracy, precision and recall tell about the same story. Set the negatives to 1000 and watch what happens.')}
        const act=(a,b)=>{$('thNP').value=a;$('thNN').value=b;[['thP1'],['thP2'],['thP3']].forEach(x=>{$(x[0]).className=''});prep();draw()};
        ['thNP','thNN'].forEach(id=>$(id).addEventListener('input',()=>{[['thP1'],['thP2'],['thP3']].forEach(x=>{$(x[0]).className=''});prep();draw()}));
        [['thP1',1,1],['thP2',1,3],['thP3',0,3]].forEach(b=>$(b[0]).addEventListener('click',()=>{act(b[1],b[2]);$(b[0]).className='pri'}));
        $('thT').addEventListener('input',draw);prep();draw()})();

      // Demo 3: imbalance
      (function(){
        function draw(){const pp=+$('imP').value;$('imPO').textContent=fmt(pp,1)+' %';
          const P=1000*pp/100,N=1000-P;
          const a1=N/1000;
          const tp=0.8*P,fn=P-tp,fp=0.1*N,tn=N-fp;
          const pre=tp/(tp+fp),f2=2*tp/(2*tp+fp+fn);
          $('imA1').textContent=fmt(a1,3);$('imP1').textContent='–';$('imR1').textContent='0.000';$('imF1').textContent='0.000';
          $('imA2').textContent=fmt((tp+tn)/1000,3);$('imP2').textContent=fmt(pre,3);$('imR2').textContent=fmt(0.8,3);$('imF2').textContent=fmt(f2,3);
          $('imMsg').textContent=LernApp.t('Bei ','With ')+fmt(pp,1)+LernApp.t(' % Positiven hat «Immer negativ» ',' % positives, «Always negative» has ')+fmt(a1*100,1)+LernApp.t(' % Accuracy und findet nichts. ',' % accuracy and finds nothing. ')+((tp+tn)/1000<a1?LernApp.t('Das echte Modell hat eine tiefere Accuracy, ist aber das nützliche. ','The real model has a lower accuracy, but it is the useful one. '):LernApp.t('Hier sind die Klassen ausgeglichen genug, dass Accuracy das bessere Modell auch zeigt. ','Here the classes are balanced enough for accuracy to show the better model too. '))+LernApp.t('Beachte auch: Bei seltener Klasse sinkt die Precision des echten Modells, weil die vielen Negativen auch bei 10 % falschem Alarm viele FP liefern.','Note also: with a rare class the precision of the real model drops, because the many negatives produce many FP even at 10 % false alarms.')}
        $('imP').addEventListener('input',draw);draw()})();

      // Demo 4: kNN
      (function(){
        const r=mulberry32(11);
        function make(n){const a=[];for(let i=0;i<n;i++){const c=i%2;const cx=c?0.6:0.4,cy=c?0.55:0.45;a.push({x:cx+0.2*gauss(r),y:cy+0.2*gauss(r),c:c})}return a}
        const tr=make(60),te=make(200),q={x:0.5,y:0.5};
        const W=320,H=220,sx=x=>x*W,sy=y=>H-y*H,G=32,GY=22;
        function dist(ax,ay,bx,by){return Math.hypot((ax-bx)*W,(ay-by)*H)} // distance in drawn pixels: what you see is what kNN measures
        function pred(x,y,k){const d=tr.map(p=>({d:dist(p.x,p.y,x,y),c:p.c})).sort((a,b)=>a.d-b.d);let s=0;for(let i=0;i<k;i++)s+=d[i].c;return s*2>k?1:0}
        function draw(){const k=+$('knK').value;$('knKO').textContent=k;
          let s='';const cw=W/G,ch=H/GY;
          for(let i=0;i<G;i++)for(let j=0;j<GY;j++){const x=(i+0.5)/G,y=1-(j+0.5)/GY;s+='<rect x="'+(i*cw)+'" y="'+(j*ch)+'" width="'+(cw+0.5)+'" height="'+(ch+0.5)+'" style="fill:'+(pred(x,y,k)?'var(--accent)':'var(--warn)')+';opacity:.25"/>'}
          tr.forEach(p=>{s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="3.5" style="fill:'+(p.c?'var(--accent)':'var(--warn)')+';stroke:var(--fg);stroke-width:1"/>'});
          const nb=tr.map(p=>({p:p,d:dist(p.x,p.y,q.x,q.y)})).sort((u,v)=>u.d-v.d).slice(0,k);
          const dk=nb[nb.length-1].d;
          s+='<circle cx="'+sx(q.x)+'" cy="'+sy(q.y)+'" r="'+dk+'" style="fill:none;stroke:var(--fg);stroke-width:1;stroke-dasharray:4 3"/>';
          nb.forEach(n=>{s+='<line x1="'+sx(q.x)+'" y1="'+sy(q.y)+'" x2="'+sx(n.p.x)+'" y2="'+sy(n.p.y)+'" style="stroke:var(--fg);stroke-width:1;opacity:.5"/>'});
          s+='<path d="M'+sx(q.x)+' '+(sy(q.y)-9)+' L'+(sx(q.x)+9)+' '+sy(q.y)+' L'+sx(q.x)+' '+(sy(q.y)+9)+' L'+(sx(q.x)-9)+' '+sy(q.y)+' Z" style="fill:var(--fg);stroke:var(--bg);stroke-width:2"/>';
          s+='<text x="'+(sx(q.x)+12)+'" y="'+(sy(q.y)-12)+'" style="fill:var(--fg);font-size:13px;font-weight:700;paint-order:stroke;stroke:var(--bg);stroke-width:3px">'+LernApp.t('Startpunkt','Start point')+'</text>';
          $('knSvg').innerHTML=s;
          const acc=set=>set.filter(p=>pred(p.x,p.y,k)===p.c).length/set.length;
          const a=acc(tr),b=acc(te);$('knTr').textContent=fmt(a,2);$('knTe').textContent=fmt(b,2);
          $('knMsg').textContent=k===1?LernApp.t('k = 1: Jeder Punkt zieht seine eigene Insel. Trainings-Accuracy ist perfekt, aber auf neuen Punkten schlechter (Overfitting).','k = 1: Every point draws its own island. Training accuracy is perfect, but worse on new points (overfitting).'):k>=55?LernApp.t('Sehr grosses k: Die Fläche wird fast einfarbig, das Modell ignoriert die Struktur (Underfitting).','Very large k: The area becomes almost one colour, the model ignores the structure (underfitting).'):k<15?LernApp.t('Kleines k: Die Grenze ist noch zackig, Training ist deutlich besser als Test (noch etwas Overfitting).','Small k: The boundary is still jagged, training is clearly better than test (still some overfitting).'):LernApp.t('Mittleres k: Eine glatte Grenze, Training und Test liegen nahe beieinander.','Medium k: A smooth boundary, training and test are close together.')}
        $('knK').addEventListener('input',draw);
        $('knSvg').addEventListener('click',e=>{const b=e.currentTarget.getBoundingClientRect();q.x=Math.min(1,Math.max(0,(e.clientX-b.left)/b.width));q.y=Math.min(1,Math.max(0,1-(e.clientY-b.top)/b.height));draw()});
        draw()})();

      // Demo 5a: Naive Bayes, one feature (qm), Gaussian per class
      (function(){
        const a=[35,48,55,62,70],b=[78,85,95,110,130],qa=a.concat(b);
        const mean=v=>v.reduce((s,x)=>s+x,0)/v.length,sd=v=>{const m=mean(v);return Math.sqrt(v.reduce((s,x)=>s+(x-m)*(x-m),0)/(v.length-1))};
        const ma=mean(a),sa=sd(a),mb=mean(b),sb=sd(b),pdf=(x,m,s)=>Math.exp(-0.5*((x-m)/s)*((x-m)/s))/(s*Math.sqrt(2*Math.PI));
        const W=320,P=12,X0=20,X1=150,sx=x=>P+(x-X0)/(X1-X0)*(W-2*P);
        function draw(){const x=+$('nbX').value,pi=+$('nbP').value/100;$('nbXO').textContent=x+' qm';$('nbPO').textContent=Math.round(pi*100)+' %';
          const fa=v=>pdf(v,ma,sa)*(1-pi),fb=v=>pdf(v,mb,sb)*pi;let mx=0;for(let v=X0;v<=X1;v++)mx=Math.max(mx,fa(v),fb(v));
          const sy=v=>135-v/mx*100;let s='<line class="ax" x1="'+P+'" y1="135" x2="'+(W-P)+'" y2="135"/>',pa='',pb='';
          for(const t of[40,60,80,100,120,140])s+='<text class="lbl" x="'+(sx(t)-8)+'" y="165">'+t+'</text>';
          for(let v=X0;v<=X1;v++){pa+=(v>X0?'L':'M')+sx(v).toFixed(1)+' '+sy(fa(v)).toFixed(1);pb+=(v>X0?'L':'M')+sx(v).toFixed(1)+' '+sy(fb(v)).toFixed(1)}
          s+='<path class="ln2" d="'+pa+'"/><path class="ln" d="'+pb+'"/>';
          qa.forEach((q,i)=>{s+='<circle cx="'+sx(q)+'" cy="148" r="3.5" style="fill:'+(i<5?'var(--warn)':'var(--accent)')+';stroke:var(--fg);stroke-width:1"/>'});
          s+='<line x1="'+sx(x)+'" y1="20" x2="'+sx(x)+'" y2="140" style="stroke:var(--fg);stroke-width:1.5"/><circle cx="'+sx(x)+'" cy="'+sy(fa(x))+'" r="4" style="fill:var(--warn)"/><circle cx="'+sx(x)+'" cy="'+sy(fb(x))+'" r="4" style="fill:var(--accent)"/>';
          $('nbSvg').innerHTML=s;const post=fb(x)/(fa(x)+fb(x));
          $('nbPost').textContent=fmt(post,2);$('nbLb').textContent=fmt(fb(x)*1000,2);$('nbLa').textContent=fmt(fa(x)*1000,2);
          $('nbMsg').textContent=post>0.5?LernApp.t('Die blaue Kurve liegt hier höher: Vorhersage «teuer».','The blue curve is higher here: prediction «expensive».'):LernApp.t('Die orange Kurve liegt hier höher: Vorhersage «nicht teuer».','The orange curve is higher here: prediction «not expensive».')}
        $('nbX').addEventListener('input',draw);$('nbP').addEventListener('input',draw);draw()})();

      // Demo 5b: linear SVM (soft margin, subgradient descent), slider C
      (function(){
        const r=mulberry32(5),pts=[];for(let i=0;i<30;i++){const c=i%2;pts.push({x:(c?0.62:0.38)+0.11*gauss(r),y:(c?0.58:0.42)+0.11*gauss(r),c:c,y2:c?1:-1})}
        pts.forEach(p=>{p.u=p.x-0.5;p.v=p.y-0.5});
        const W=320,H=220,sx=x=>x*W,sy=y=>H-y*H;
        function fit(C){let w=[0,0],b=0;const lr=1/(1+C*pts.length);
          for(let t=0;t<4000;t++){let gw=[w[0],w[1]],gb=0;pts.forEach(p=>{if(p.y2*(w[0]*p.u+w[1]*p.v+b)<1){gw[0]-=C*p.y2*p.u;gw[1]-=C*p.y2*p.v;gb-=C*p.y2}});w=[w[0]-lr*gw[0],w[1]-lr*gw[1]];b-=lr*gb}
          return{w:w,b:b}}
        function line(m,off,main){const a=m.w[0],bb=m.w[1],c=m.b-off;if(Math.abs(bb)<1e-6)return'';const y=x=>-(a*(x-0.5)+c)/bb+0.5;
          return'<line x1="'+sx(-1)+'" y1="'+sy(y(-1))+'" x2="'+sx(2)+'" y2="'+sy(y(2))+'" style="stroke:var(--fg);stroke-width:'+(main?2:1.2)+(main?'':';stroke-dasharray:5 4')+'"/>'}
        function draw(){const e=+$('svC').value,C=Math.pow(10,e);$('svCO').textContent=fmt(C,2);const m=fit(C);
          const f=p=>m.w[0]*p.u+m.w[1]*p.v+m.b;let s=line(m,0,true)+line(m,1,false)+line(m,-1,false);
          let sv=0,ok=0;pts.forEach(p=>{const isSv=p.y2*f(p)<=1.02;if(isSv)sv++;if(p.y2*f(p)>0)ok++;
            s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="'+(isSv?5.5:3.5)+'" style="fill:'+(p.c?'var(--accent)':'var(--warn)')+';stroke:var(--fg);stroke-width:'+(isSv?2.5:1)+'"/>'});
          $('svSvg').innerHTML=s;const nw=Math.hypot(m.w[0],m.w[1]);
          $('svCv').textContent=fmt(C,2);$('svN').textContent=sv;$('svM').textContent=nw>0?fmt(2/nw,2):'–';$('svA').textContent=fmt(ok/pts.length,2);
          $('svMsg').textContent=C<0.5?LernApp.t('Kleines C: breite Margin, einzelne Fehler sind erlaubt. Viele Punkte stützen die Linie. Das Modell ist einfach (Underfitting-Risiko).','Small C: wide margin, single errors are allowed. Many points support the line. The model is simple (underfitting risk).'):C>20?LernApp.t('Grosses C: Fehler sind teuer, die Margin wird schmal und folgt einzelnen Punkten (Overfitting-Risiko).','Large C: errors are expensive, the margin becomes narrow and follows single points (overfitting risk).'):LernApp.t('Mittleres C: ein Kompromiss zwischen breiter Margin und wenigen Fehlern.','Medium C: a compromise between a wide margin and few errors.')}
        $('svC').addEventListener('input',draw);draw()})();

      // Demo 5c: decision tree (CART, Gini): regions, tree diagram and accuracy by depth
      (function(){
        const r=mulberry32(11);function make(n){const a=[];for(let i=0;i<n;i++){const c=i%2;a.push({x:(c?0.6:0.4)+0.2*gauss(r),y:(c?0.55:0.45)+0.2*gauss(r),c:c})}return a}
        const tr=make(60),te=make(200),W=320,H=220,sx=x=>x*W,sy=y=>H-y*H,DD=99,cl=c=>c?'var(--accent)':'var(--warn)';
        const gini=s=>{const n=s.length;if(!n)return 0;const p=s.filter(q=>q.c).length/n;return 2*p*(1-p)};
        function build(s,d,md,b){const n1=s.filter(q=>q.c).length,n0=s.length-n1,base={n0:n0,n1:n1,g:gini(s),c:n1*2>=s.length?1:0,b:b};
          if(d>=md||n1===0||n0===0||s.length<2)return Object.assign(base,{leaf:1});
          let best=null;['x','y'].forEach(f=>{const v=s.map(q=>q[f]).sort((a,c)=>a-c);for(let i=1;i<v.length;i++){if(v[i]===v[i-1])continue;const t=(v[i]+v[i-1])/2,L=s.filter(q=>q[f]<=t),R=s.filter(q=>q[f]>t),g=(L.length*gini(L)+R.length*gini(R))/s.length;if(!best||g<best.g)best={f:f,t:t,g:g,L:L,R:R}}});
          if(!best)return Object.assign(base,{leaf:1});
          const bl=best.f==='x'?[b[0],b[1],best.t,b[3]]:[b[0],b[1],b[2],best.t],br=best.f==='x'?[best.t,b[1],b[2],b[3]]:[b[0],best.t,b[2],b[3]];
          return Object.assign(base,{f:best.f,t:best.t,l:build(best.L,d+1,md,bl),r:build(best.R,d+1,md,br)})}
        const pred=(n,x,y)=>n.leaf?n.c:((n.f==='x'?x:y)<=n.t?pred(n.l,x,y):pred(n.r,x,y)),cnt=n=>n.leaf?1:cnt(n.l)+cnt(n.r);
        const acc=(t,set)=>set.filter(p=>pred(t,p.x,p.y)===p.c).length/set.length,CUR=[];
        for(let d=1;d<=8;d++){const t=build(tr,0,d,[0,0,1,1]);CUR.push([acc(t,tr),acc(t,te)])}
        function regions(t){let s='';(function walk(n,d){if(n.leaf){const pur=Math.max(n.n0,n.n1)/(n.n0+n.n1);s+='<rect x="'+sx(n.b[0])+'" y="'+sy(n.b[3])+'" width="'+(sx(n.b[2])-sx(n.b[0]))+'" height="'+(sy(n.b[1])-sy(n.b[3]))+'" style="fill:'+cl(n.c)+';opacity:'+(0.12+0.5*(2*pur-1))+'"/>';return}
          const b=n.b,w=Math.max(1,2.8-0.55*d);s+=n.f==='x'?'<line x1="'+sx(n.t)+'" y1="'+sy(b[1])+'" x2="'+sx(n.t)+'" y2="'+sy(b[3])+'" style="stroke:var(--fg);stroke-width:'+w+'"/>':'<line x1="'+sx(b[0])+'" y1="'+sy(n.t)+'" x2="'+sx(b[2])+'" y2="'+sy(n.t)+'" style="stroke:var(--fg);stroke-width:'+w+'"/>';walk(n.l,d+1);walk(n.r,d+1)})(t,0);return s}
        function diagram(t){let k=0;(function lay(n,d){if(n.leaf||d===DD){n.xi=k++;return}lay(n.l,d+1);lay(n.r,d+1);n.xi=(n.l.xi+n.r.xi)/2})(t,0);
          const dep=n=>n.leaf?0:1+Math.max(dep(n.l),dep(n.r)),D=Math.max(1,dep(t)),px=n=>k>1?14+n.xi*(292/(k-1)):160,py=d=>20+d*Math.min(34,128/D);let e='',v='';
          (function walk(n,d){if(n.leaf||d===DD)return;[n.l,n.r].forEach(c=>{e+='<line x1="'+px(n)+'" y1="'+py(d)+'" x2="'+px(c)+'" y2="'+py(d+1)+'" style="stroke:var(--muted);stroke-width:1.2"/>'});walk(n.l,d+1);walk(n.r,d+1)})(t,0);
          (function walk(n,d){const x=px(n),y=py(d);
            if(n.leaf){const pur=Math.max(n.n0,n.n1)/(n.n0+n.n1);v+='<rect x="'+(x-6)+'" y="'+(y-6)+'" width="12" height="12" style="fill:'+cl(n.c)+';fill-opacity:'+(0.35+0.65*(2*pur-1))+';stroke:var(--fg);stroke-width:1"/>';return}
            if(d===DD){v+='<circle cx="'+x+'" cy="'+y+'" r="6" style="fill:var(--bg);stroke:var(--muted);stroke-width:1.2;stroke-dasharray:2 2"/><text class="lbl" x="'+(x-4)+'" y="'+(y+9)+'">…</text>';return}
            v+='<circle cx="'+x+'" cy="'+y+'" r="6" style="fill:var(--bg);stroke:var(--fg);stroke-width:1.5"/>';
            if(d<=2)v+='<text class="lbl" x="'+(x-17)+'" y="'+(y-10)+'">'+n.f+'≤'+fmt(n.t,2)+'</text>';
            walk(n.l,d+1);walk(n.r,d+1)})(t,0);
          return e+v+'<text class="lbl" x="2" y="170">Gini '+fmt(t.g,2)+' → 0</text>'}
        function curve(md){const x0=34,x1=308,yt=12,yb=96,sxx=d=>x0+(d-1)/7*(x1-x0),syy=a=>yb-(a-0.4)/0.6*(yb-yt);let s='';
          for(const g of[0.5,0.75,1])s+='<line x1="'+x0+'" y1="'+syy(g)+'" x2="'+x1+'" y2="'+syy(g)+'" style="stroke:var(--line);stroke-width:1"/><text class="lbl" x="2" y="'+(syy(g)+4)+'">'+g+'</text>';
          for(let d=1;d<=8;d++)s+='<text class="lbl" x="'+(sxx(d)-3)+'" y="112">'+d+'</text>';
          s+='<path class="ln" d="'+CUR.map((c,i)=>(i?'L':'M')+sxx(i+1)+' '+syy(c[0])).join('')+'"/><path class="ln2" d="'+CUR.map((c,i)=>(i?'L':'M')+sxx(i+1)+' '+syy(c[1])).join('')+'"/>';
          s+='<line x1="'+sxx(md)+'" y1="'+yt+'" x2="'+sxx(md)+'" y2="'+yb+'" style="stroke:var(--fg);stroke-width:1;stroke-dasharray:4 3"/><circle cx="'+sxx(md)+'" cy="'+syy(CUR[md-1][0])+'" r="4.5" style="fill:var(--accent)"/><circle cx="'+sxx(md)+'" cy="'+syy(CUR[md-1][1])+'" r="4.5" style="fill:var(--warn)"/>';
          return s+'<text class="lbl" x="'+(x0+4)+'" y="'+(yt+10)+'" style="fill:var(--accent)">Train</text><text class="lbl" x="'+(x0+50)+'" y="'+(yt+10)+'" style="fill:var(--warn)">Test</text>'}
        function draw(){const md=+$('dtD').value;$('dtDO').textContent=md;const t=build(tr,0,md,[0,0,1,1]);
          let s=regions(t);tr.forEach(p=>{s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="3.5" style="fill:'+cl(p.c)+';stroke:var(--fg);stroke-width:1"/>'});
          $('dtSvg').innerHTML=s;$('dtTree').innerHTML=diagram(t);$('dtCurve').innerHTML=curve(md);
          $('dtL').textContent=cnt(t);$('dtTr').textContent=fmt(CUR[md-1][0],2);$('dtTe').textContent=fmt(CUR[md-1][1],2);
          $('dtMsg').textContent=md===1?LernApp.t('Tiefe 1: nur eine Frage, die Fläche hat zwei Rechtecke (Stumpf). Das ist zu einfach.','Depth 1: only one question, the region has two rectangles (a stump). That is too simple.'):md>=6?LernApp.t('Tiefer Baum: Fast jeder Trainingspunkt bekommt sein eigenes Rechteck. Die Trainingskurve steigt weiter, die Testkurve fällt (Overfitting).','Deep tree: almost every training point gets its own rectangle. The training curve keeps rising, the test curve falls (overfitting).'):LernApp.t('Mittlere Tiefe: die groben Bereiche sind erkannt. Beobachte in der Kurve, ab wann die Test-Accuracy nicht mehr steigt.','Medium depth: the rough areas are found. Watch in the curve from which depth the test accuracy stops rising.')}
        $('dtD').addEventListener('input',draw);draw()})();

      // Demo 5d: small neural network (1 hidden layer, tanh), trained step by step in the browser
      (function(){
        const W=320,H=220,sx=x=>x*W,sy=y=>H-y*H,f=v=>(v-0.5)*3,MAXE=2000,cl=c=>c?'var(--accent)':'var(--warn)';
        function gen(kind,n,r){const a=[];for(let i=0;i<n;i++){let x,y,c;
          if(kind==='blobs'){c=i%2;x=Math.min(1,Math.max(0,(c?0.68:0.32)+0.13*gauss(r)));y=Math.min(1,Math.max(0,(c?0.65:0.35)+0.13*gauss(r)))}
          else{x=r();y=r();c=kind==='xor'?((x>0.5)!==(y>0.5)?1:0):(Math.hypot(x-0.5,y-0.5)<0.3?1:0);if(r()<0.05)c=1-c}
          a.push({x:x,y:y,c:c})}return a}
        let kind='circle',tr,te,net,playing=false;
        const act=(p,j)=>Math.tanh(net.w1[j][0]*f(p.x)+net.w1[j][1]*f(p.y)+net.b1[j]);
        const z=p=>{let s=net.b2;for(let j=0;j<net.h;j++)s+=act(p,j)*net.w2[j];return s};
        const loss=set=>set.reduce((s,p)=>{const o=Math.min(1-1e-9,Math.max(1e-9,sigmoid(z(p))));return s-(p.c?Math.log(o):Math.log(1-o))},0)/set.length;
        const acc=set=>set.filter(p=>(z(p)>0?1:0)===p.c).length/set.length;
        function record(){net.L.push({e:net.ep,tr:loss(tr),te:loss(te)})}
        function reset(){playing=false;const r=mulberry32(7);tr=gen(kind,80,r);te=gen(kind,200,r);const h=+$('nnH').value,q=mulberry32(3);net={h:h,w1:[],b1:[],w2:[],b2:0,ep:0,L:[]};
          for(let j=0;j<h;j++){net.w1.push([gauss(q)*0.8,gauss(q)*0.8]);net.b1.push(0);net.w2.push(gauss(q)*0.8)}record();draw()}
        function adv(E){const n=tr.length,h=net.h,lr=0.4;E=Math.min(E,MAXE-net.ep);
          for(let e=0;e<E;e++){const g1=net.w1.map(()=>[0,0]),gb1=net.w1.map(()=>0),g2=net.w2.map(()=>0);let gb2=0;
            tr.forEach(p=>{const u=f(p.x),v=f(p.y),a=[];for(let j=0;j<h;j++)a.push(act(p,j));const d=sigmoid(a.reduce((s,aj,j)=>s+aj*net.w2[j],net.b2))-p.c;
              gb2+=d;a.forEach((aj,j)=>{g2[j]+=d*aj;const dh=d*net.w2[j]*(1-aj*aj);g1[j][0]+=dh*u;g1[j][1]+=dh*v;gb1[j]+=dh})});
            for(let j=0;j<h;j++){net.w1[j][0]-=lr*g1[j][0]/n;net.w1[j][1]-=lr*g1[j][1]/n;net.b1[j]-=lr*gb1[j]/n;net.w2[j]-=lr*g2[j]/n}net.b2-=lr*gb2/n;net.ep++;
            if(net.ep%10===0)record()}
          if(net.L[net.L.length-1].e!==net.ep)record()}
        function neurons(){let s='';for(let j=0;j<net.h;j++){const ox=(j%4)*80+5,oy=Math.floor(j/4)*75+3,cw=7,ch=7.25;
            for(let a=0;a<10;a++)for(let b=0;b<8;b++){const v=act({x:(a+0.5)/10,y:1-(b+0.5)/8},j);s+='<rect x="'+(ox+a*cw)+'" y="'+(oy+b*ch)+'" width="'+(cw+0.4)+'" height="'+(ch+0.4)+'" style="fill:'+cl(v>0)+';opacity:'+Math.abs(v)*0.85+'"/>'}
            s+='<rect x="'+ox+'" y="'+oy+'" width="70" height="58" style="fill:none;stroke:var(--line);stroke-width:1"/><text class="lbl" x="'+ox+'" y="'+(oy+69)+'">N'+(j+1)+' ('+(net.w2[j]>=0?'+':'−')+fmt(Math.abs(net.w2[j]),1)+')</text>'}return s}
        function lossSvg(){const x0=34,x1=312,yt=12,yb=96,ymax=Math.max(0.8,net.L[0].tr,net.L[0].te),X=e=>x0+e/MAXE*(x1-x0),Y=v=>yb-Math.min(v,ymax)/ymax*(yb-yt);
          let s='<line class="ax" x1="'+x0+'" y1="'+yb+'" x2="'+x1+'" y2="'+yb+'"/><line class="ax" x1="'+x0+'" y1="'+yt+'" x2="'+x0+'" y2="'+yb+'"/><text class="lbl" x="'+(x0-4)+'" y="112">0</text><text class="lbl" x="'+(x1-24)+'" y="112">'+MAXE+'</text><text class="lbl" x="2" y="'+(yt+4)+'">'+fmt(ymax,1)+'</text><text class="lbl" x="2" y="'+(yb+4)+'">0</text>';
          s+='<path class="ln" d="'+net.L.map((p,i)=>(i?'L':'M')+X(p.e).toFixed(1)+' '+Y(p.tr).toFixed(1)).join('')+'"/><path class="ln2" d="'+net.L.map((p,i)=>(i?'L':'M')+X(p.e).toFixed(1)+' '+Y(p.te).toFixed(1)).join('')+'"/>';
          return s+'<text class="lbl" x="'+(x0+6)+'" y="'+(yt+10)+'" style="fill:var(--accent)">Train</text><text class="lbl" x="'+(x0+52)+'" y="'+(yt+10)+'" style="fill:var(--warn)">Test</text>'}
        function draw(){$('nnHO').textContent=net.h;let s=gridSvg(W,H,32,22,(x,y)=>z({x:x,y:y})>0?1:0);tr.forEach(p=>{s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="3.2" style="fill:'+cl(p.c)+';stroke:var(--fg);stroke-width:1"/>'});
          $('nnSvg').innerHTML=s;$('nnNeu').innerHTML=neurons();$('nnLoss').innerHTML=lossSvg();
          const a=acc(tr),b=acc(te),L=net.L[net.L.length-1];$('nnEp').textContent=net.ep;$('nnTr').textContent=fmt(a,2);$('nnTe').textContent=fmt(b,2);$('nnLs').textContent=fmt(L.tr,2)+' / '+fmt(L.te,2);
          $('nnPlay').textContent=playing?LernApp.t('Pause','Pause'):LernApp.t('Training starten','Start training');
          $('nnMsg').textContent=net.ep===0?LernApp.t('Start: Die Gewichte sind zufällig, die Fläche sagt nichts. Drücke «Training starten» und schau den Neuronen zu.','Start: the weights are random, the region means nothing. Press «Start training» and watch the neurons.'):net.ep<200&&a<0.85?LernApp.t('Das Netz lernt noch: Der Loss sinkt, die Neuronen drehen ihre Linien in die richtige Richtung.','The network is still learning: the loss falls, the neurons turn their lines into the right direction.'):kind!=='blobs'&&net.h<=2&&net.ep>=300?LernApp.t('Mit 1 bis 2 Neuronen reicht die Form nicht: Zwei Linien können keine geschlossene Form ergeben. Der Loss bleibt hoch.','With 1 to 2 neurons the shape is not enough: two lines cannot make a closed shape. The loss stays high.'):a>=0.85?LernApp.t('Das Netz hat die Form gefunden: Jedes Neuron liefert eine Linie, die Ausgabe kombiniert sie.','The network found the shape: each neuron supplies a line, the output combines them.'):LernApp.t('Weiter trainieren: Der Loss sinkt noch.','Keep training: the loss is still falling.')}
        function loop(){if(!playing)return;adv(10);draw();if(net.ep>=MAXE){playing=false;draw()}else requestAnimationFrame(loop)}
        $('nnPlay').addEventListener('click',()=>{if(playing){playing=false;draw();return}if(net.ep>=MAXE)reset();if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){adv(MAXE);draw();return}playing=true;draw();loop()});
        $('nnStep').addEventListener('click',()=>{playing=false;adv(100);draw()});
        $('nnReset').addEventListener('click',reset);$('nnH').addEventListener('input',reset);
        [['nnD1','circle'],['nnD2','xor'],['nnD3','blobs']].forEach(d=>{$(d[0]).addEventListener('click',()=>{kind=d[1];[['nnD1'],['nnD2'],['nnD3']].forEach(x=>{$(x[0]).className=x[0]===d[0]?'pri':''});reset()})});
        reset()})();

      // Demo 6: 10 apartments, single tree vs bagging vs boosting (price regression on qm)
      (function(){
        const qm=[35,48,55,62,70,78,85,95,110,130],pr=[1200,1510,1540,1770,1620,1890,1850,2280,2170,2580];
        const W=320,H=230,PX=40,PY=22,XA=25,XB=140,YA=1000,YB=2800;
        const sx=x=>PX+((x-XA)/(XB-XA))*(W-PX-12),sy=v=>H-PY-((v-YA)/(YB-YA))*(H-PY-12);
        const mean=a=>a.reduce((p,c)=>p+c,0)/a.length;
        function fit(xs,ys,d){
          if(d===0||xs.length<2)return{v:mean(ys)};
          const o=xs.map((x,i)=>i).sort((a,b)=>xs[a]-xs[b]);let best=null;
          for(let k=1;k<o.length;k++){const a=xs[o[k-1]],b=xs[o[k]];if(a===b)continue;
            const L=o.slice(0,k).map(i=>ys[i]),R=o.slice(k).map(i=>ys[i]),ml=mean(L),mr=mean(R);
            const e=L.reduce((p,c)=>p+(c-ml)*(c-ml),0)+R.reduce((p,c)=>p+(c-mr)*(c-mr),0);
            if(!best||e<best.e)best={e:e,t:(a+b)/2}}
          if(!best)return{v:mean(ys)};
          const li=xs.map((x,i)=>i).filter(i=>xs[i]<=best.t),ri=xs.map((x,i)=>i).filter(i=>xs[i]>best.t);
          return{t:best.t,l:fit(li.map(i=>xs[i]),li.map(i=>ys[i]),d-1),r:fit(ri.map(i=>xs[i]),ri.map(i=>ys[i]),d-1)}}
        const pt=(nd,x)=>nd.t===undefined?nd.v:pt(x<=nd.t?nd.l:nd.r,x);
        function boot(xs,ys,b){const r=mulberry32(100+b),ix=[];for(let i=0;i<xs.length;i++)ix.push(Math.floor(r()*xs.length));return[ix.map(i=>xs[i]),ix.map(i=>ys[i])]}
        function model(xs,ys,mode,d,n,lr){
          if(mode===1){const t=fit(xs,ys,d);return{f:x=>pt(t,x),parts:[]}}
          if(mode===2){const ts=[];for(let b=0;b<n;b++){const bs=boot(xs,ys,b);ts.push(fit(bs[0],bs[1],d))}
            return{f:x=>mean(ts.map(t=>pt(t,x))),parts:ts}}
          const base=mean(ys),ts=[];let res=ys.map(y=>y-base);
          for(let m=0;m<n;m++){const t=fit(xs,res,d);ts.push(t);res=res.map((r,i)=>r-lr*pt(t,xs[i]))}
          return{f:x=>base+lr*ts.reduce((p,t)=>p+pt(t,x),0),parts:[]}}
        let mode=1;
        function rmse(e){return Math.sqrt(mean(e.map(v=>v*v)))}
        function draw(){
          const d=+$('enD').value,n=+$('enN').value,lr=+$('enL').value;
          $('enDO').textContent=d;$('enNO').textContent=n;$('enLO').textContent=fmt(lr,2);
          [1,2,3].forEach(k=>{$('enM'+k).className=k===mode?'pri':''});
          $('enNW').style.display=mode===1?'none':'';$('enLW').style.display=mode===3?'':'none';
          const m=model(qm,pr,mode,d,n,lr);
          let s='<line class="ax" x1="'+PX+'" y1="'+(H-PY)+'" x2="'+(W-8)+'" y2="'+(H-PY)+'"/>';
          for(let t=40;t<=140;t+=20)s+='<text class="lbl" x="'+(sx(t)-8)+'" y="'+(H-6)+'">'+t+'</text>';
          for(const t of[1000,1500,2000,2500])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
          s+='<text class="lbl" x="'+(W-24)+'" y="'+(H-PY-4)+'">'+LernApp.t('qm','m²')+'</text>';
          const path=f=>{let q='';for(let x=XA;x<=XB;x+=0.5)q+=(x===XA?'M':'L')+sx(x).toFixed(1)+' '+sy(f(x)).toFixed(1);return q};
          m.parts.slice(0,20).forEach(t=>{s+='<path d="'+path(x=>pt(t,x))+'" style="fill:none;stroke:var(--warn);stroke-width:1;opacity:.3"/>'});
          s+='<path class="ln" d="'+path(m.f)+'"/>';
          qm.forEach((x,i)=>{s+='<circle cx="'+sx(x)+'" cy="'+sy(pr[i])+'" r="4" style="fill:var(--fg)"/>'});
          $('enSvg').innerHTML=s;
          const tr=qm.map((x,i)=>m.f(x)-pr[i]);
          const lo=qm.map((x,i)=>{const xs=qm.filter((v,j)=>j!==i),ys=pr.filter((v,j)=>j!==i);return model(xs,ys,mode,d,n,lr).f(x)-pr[i]});
          $('enTr').textContent=fmt(rmse(tr),0);$('enLo').textContent=fmt(rmse(lo),0);
          $('enMsg').textContent=mode===1?(d>=3?LernApp.t('Tiefer Einzelbaum: Fast jede Wohnung hat ihr eigenes Blatt, die Stufen folgen den Ausreissern. Der Fehler auf bekannten Wohnungen ist klein, der Fehler bei fehlender Wohnung viel grösser (Overfitting).','Deep single tree: Almost every apartment has its own leaf, the steps follow the outliers. The error on known apartments is small, the error for a left-out apartment much larger (overfitting).'):LernApp.t('Flacher Einzelbaum: Wenige grobe Stufen. Der Fehler ist schon auf den bekannten Wohnungen hoch (Underfitting).','Shallow single tree: A few coarse steps. The error is already high on the known apartments (underfitting).'))
            :mode===2?LernApp.t('Bagging: Die orangen Linien sind einzelne Bäume (je auf einer anderen Stichprobe der 10 Wohnungen), die blaue Linie ist ihr Mittelwert. Mit mehr Bäumen wird sie glatter. Bei flachen Bäumen (Tiefe 1 und 2) senkt Bagging beide Fehler etwas. Ab Tiefe 3 steigt der Fehler auf bekannten Wohnungen gegenüber dem Einzelbaum (weniger Auswendiglernen), der Fehler bei fehlender Wohnung bleibt bei nur 10 Wohnungen etwa gleich.','Bagging: The orange lines are single trees (each on a different sample of the 10 apartments), the blue line is their mean. With more trees it gets smoother. With shallow trees (depth 1 and 2) bagging lowers both errors a little. From depth 3 the error on known apartments rises compared with the single tree (less memorising), the error for a left-out apartment stays about the same with only 10 apartments.')
            :LernApp.t('Boosting: Die Linie startet beim Durchschnitt (1841 CHF) und nähert sich pro Runde den Preisen. Mit Tiefe 1 und wenigen Runden ist sie grob. Mit mehr Runden oder höherer Lernrate liegt sie näher an den Preisen (Fehler auf bekannten Wohnungen sinkt), lernt aber irgendwann nur noch die Ausreisser: Der Fehler bei fehlender Wohnung sinkt anfangs deutlich, bleibt dann aber bei rund 230 CHF stehen.','Boosting: The line starts at the average (1841 CHF) and gets closer to the prices with each round. With depth 1 and few rounds it is coarse. With more rounds or a higher learning rate it lies closer to the prices (error on known apartments falls), but at some point it only learns the outliers: the error for a left-out apartment falls clearly at first, then levels off at about 230 CHF.')}
        [1,2,3].forEach(k=>{$('enM'+k).addEventListener('click',()=>{mode=k;$('enD').value=k===3?1:3;$('enN').value=k===3?30:20;draw()})});
        ['enD','enN','enL'].forEach(id=>$(id).addEventListener('input',draw));draw()})();
    },
  });
})();
