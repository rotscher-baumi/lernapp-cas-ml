/* Module: Neural Networks (Modul 3, Einführung). Content lives in the html field; the demos live in assets/demos-nn.js. */
(function () {
  LernApp.register({
    id: 'nn',
    order: 92,
    nav: 'Neural Networks',
    title: `Neural Networks: Einführung`,
    kicker: `Modul 3 · Neural Networks (Fr 13. und Sa 14.11.)`,
    summary: `Neuron, activation functions, Backpropagation, Optimizer, Dropout, Early Stopping`,
    html: `  <p>Ein Neural Network ist nichts Neues, sondern ein Stapel aus Bausteinen, die du schon kennst: Jedes Neuron rechnet wie die <a href="#klass-modelle">logistische Regression</a> eine gewichtete Summe, die Gewichte werden mit <a href="#ml-gd">Gradient Descent</a> gelernt, und über Erfolg entscheidet wie bisher die Validation. Neu sind die <b>vielen Schichten</b> und die Frage, wie der Gradient bis zur ersten Schicht gelangt (Backpropagation).</p>
  <p class="note">Dieses Kapitel deckt die Einführung ab (Perceptron bis Regularisierung). Bilder und CNNs folgen am Computer-Vision-Tag (Fr 20.11.). Die Demos laufen im Browser mit einem kleinen, selbst gerechneten Netz, die Keras-Codeblöcke am Schluss dagegen nicht.</p>

  <h3 id="nn-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#ml-ablauf">Supervised Learning</a>. Neu ist der Trainings-Loop in der Mitte: Vorhersagen, Fehler messen, Gradienten rückwärts berechnen, Gewichte anpassen, und das viele Male.</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines Neural-Network-Projekts: Daten vorbereiten, Architektur wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward pass, Loss, Backpropagation und Update, danach Validation prüfen mit Tuning-Schleife und zum Schluss einmal testen">
      ${LernApp.nnFlow({
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Daten vorbereiten', 'train, validation, test; skalieren'],
          ['Architektur wählen', 'hidden layers, Neuronen, activation'],
          ['Loss und Optimizer', 'Cross-Entropy oder MSE, Adam, learning rate'],
          ['Forward pass', 'Eingabe durch das Netz bis zur Vorhersage ŷ'],
          ['Loss berechnen', 'Abstand zwischen ŷ und der richtigen Antwort y'],
          ['Backpropagation', 'Gradienten von hinten nach vorn'],
          ['Parameter aktualisieren', 'w ← w − α · ∂L/∂w'],
          ['Validation prüfen', 'Loss-Kurven, overfitting?'],
          ['Einmal testen', 'Testset, erst ganz am Schluss'],
        ],
        loopA: ['pro Mini-Batch,', 'viele epochs'],
        loopB: ['Tuning:', 'andere Architektur,', 'andere Hyperparameter'],
      })}
    </svg>
    </div>
    <div class="ab-detail" id="nbDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Schliessen">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Die Schritte 4 bis 7 (orange gestrichelt, innen) laufen für jeden Mini-Batch, alle Batches zusammen sind eine epoch. Der äussere Loop ist das Tuning: Du vergleichst Setups auf der Validation. Das Testset (orange) wird nicht zum Wählen benutzt.</figcaption>
  </figure>

  <h3 id="nn-neuron">1 · Vom Neuron zum Netz</h3>
  <p>Ein künstliches Neuron macht zwei Dinge. Es bildet eine gewichtete Summe seiner Eingaben plus <b>bias</b>, <code>z = w1·x1 + w2·x2 + … + b</code>, und schickt sie durch eine <b>activation function</b>: <code>a = f(z)</code>. Die lineare Regression ist ein Neuron mit <code>f(z) = z</code>, die logistische Regression ein Neuron mit Sigmoid.</p>
  <div class="tablewrap"><table>
    <tr><th>activation</th><th>Formel</th><th>Bereich</th><th>Merke</th></tr>
    <tr><td><b>Sigmoid</b></td><td><code>1 / (1 + e^(−z))</code></td><td>0 bis 1</td><td>Saturiert bei grossem |z| (Steigung fast 0). Heute vor allem in der Ausgabe bei 2 Klassen.</td></tr>
    <tr><td><b>Tanh</b></td><td><code>tanh(z)</code></td><td>−1 bis 1</td><td>Um 0 zentriert, saturiert aber ebenfalls.</td></tr>
    <tr><td><b>ReLU</b></td><td><code>max(0, z)</code></td><td>0 bis ∞</td><td>Standard in hidden layers: schnell, saturiert für z &gt; 0 nicht. Für z &lt; 0 ist die Steigung 0, das Neuron kann «sterben».</td></tr>
    <tr><td><b>Leaky ReLU</b></td><td><code>z</code>, sonst <code>0.01·z</code></td><td>−∞ bis ∞</td><td>Kleine Steigung für z &lt; 0, das Neuron stirbt nicht ganz.</td></tr>
    <tr><td><b>Linear</b></td><td><code>z</code></td><td>−∞ bis ∞</td><td>Ausgabe bei Regression.</td></tr>
    <tr><td><b>Softmax</b></td><td><code>e^(zi) / Σ e^(zj)</code></td><td>0 bis 1, Summe 1</td><td>Ausgabe bei mehreren Klassen: eine Wahrscheinlichkeit pro Klasse.</td></tr>
  </table></div>
  <div class="demo" id="nnActDemo">
    <div class="tag">Demo</div><h4>Ein Neuron und seine activation function</h4>
    <p class="hint">Wähle eine activation function und schiebe Eingabe, Gewicht und bias. Der orange Punkt ist das Neuron: Er sitzt bei <code>z = w·x + b</code> auf der Kurve. Gestrichelt ist die Steigung, also das Signal, das beim Training zurückfliesst.</p>
    <div class="btnrow" id="nnActBtns" role="group" aria-label="activation function"><button data-a="sigmoid" class="pri" aria-pressed="true">Sigmoid</button><button data-a="tanh" aria-pressed="false">Tanh</button><button data-a="relu" aria-pressed="false">ReLU</button><button data-a="leaky" aria-pressed="false">Leaky ReLU</button><button data-a="linear" aria-pressed="false">Linear</button></div>
    <svg class="plot" id="nnActSvg" viewBox="0 0 320 190" role="img" aria-label="Kurve der gewählten activation function mit dem Neuron als Punkt"></svg>
    <div class="ctl"><label for="nnActX">Eingabe x</label><input type="range" id="nnActX" min="-3" max="3" step="0.1" value="1"><output id="nnActXO"></output></div>
    <div class="ctl"><label for="nnActW">Gewicht w</label><input type="range" id="nnActW" min="-3" max="3" step="0.1" value="1.5"><output id="nnActWO"></output></div>
    <div class="ctl"><label for="nnActB">bias b</label><input type="range" id="nnActB" min="-3" max="3" step="0.1" value="0"><output id="nnActBO"></output></div>
    <div class="stats"><span>z = w·x + b <b id="nnActZ"></b></span><span>a = f(z) <b id="nnActA"></b></span><span>Steigung f′(z) <b id="nnActD"></b></span></div>
    <p class="hint" id="nnActMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Ohne nicht-lineare activation functions wäre ein Netz mit beliebig vielen Schichten nur eine einzige lineare Funktion, denn <code>W2·(W1·x) = (W2·W1)·x</code>. Erst die Nicht-Linearität erlaubt gekrümmte Grenzen.</p></div>

  <h3 id="nn-arch">2 · Architektur: Schichten und Parameter</h3>
  <p>Neuronen nebeneinander bilden eine <b>Schicht (layer)</b>, Schichten hintereinander ein Netz. Die Eingabe-Schicht (input layer) reicht nur die Werte weiter, dazwischen liegen die <b>hidden layers</b>, am Ende die Ausgabe-Schicht (output layer). Sind alle Neuronen einer Schicht mit allen der nächsten verbunden, heisst das Netz <i>fully connected</i> oder <i>multilayer perceptron</i> (MLP); in Keras ist das <code>Dense</code>.</p>
  <p>Jede Verbindung hat ein Gewicht, jedes Neuron einen bias. Eine <code>Dense</code>-Schicht mit <code>n_in</code> Eingängen und <code>n_out</code> Neuronen hat daher <code>(n_in + 1) · n_out</code> Parameter. Die Ausgabe-Schicht hängt von der Aufgabe ab:</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Neuronen in der Ausgabe</th><th>activation</th><th>Loss</th></tr>
    <tr><td>2 Klassen (Betrug ja/nein)</td><td>1</td><td>Sigmoid</td><td>Binary Cross-Entropy</td></tr>
    <tr><td>k Klassen (Ziffern 0 bis 9)</td><td>k</td><td>Softmax</td><td>Cross-Entropy</td></tr>
    <tr><td>Zahl (Preis)</td><td>1</td><td>Linear</td><td>MSE oder MAE</td></tr>
  </table></div>
  <div class="demo" id="npDemo">
    <div class="tag">Demo</div><h4>Parameter zählen</h4>
    <p class="hint">Stelle ein Netz zusammen. Die Startwerte (784 Eingänge, eine hidden layer mit 128 Neuronen, 10 Ausgänge) sind ein Netz für 28×28-Bilder von Ziffern wie in den Keras-Beispielen. Die Tabelle entspricht <code>model.summary()</code>.</p>
    <div class="ctl"><label for="npIn">Eingänge</label><input type="range" id="npIn" min="1" max="784" step="1" value="784"><output id="npInO"></output></div>
    <div class="ctl"><label for="npL">hidden layers</label><input type="range" id="npL" min="1" max="4" step="1" value="1"><output id="npLO"></output></div>
    <div class="ctl"><label for="npH">Neuronen je Schicht</label><input type="range" id="npH" min="1" max="256" step="1" value="128"><output id="npHO"></output></div>
    <div class="ctl"><label for="npOut">Ausgänge</label><input type="range" id="npOut" min="1" max="10" step="1" value="10"><output id="npOutO"></output></div>
    <div class="tablewrap"><table id="npTab" style="min-width:0"></table></div>
    <div class="stats"><span>Parameter gesamt <b id="npTot"></b></span><span><b id="npSplit"></b></span></div>
  </div>
  <div class="falle"><b>Falle</b><p>Mehr Parameter als Trainingsbeispiele heisst: Das Netz kann die Trainingsdaten auswendig lernen (overfitting). Das schon kleine Beispiel oben hat über 100'000 Parameter. Wie viele Neuronen es braucht, entscheidest du über die Validation, nicht über die Anschauung.</p></div>

  <h3 id="nn-training">3 · Training: Loss, Backpropagation, Gradient Descent</h3>
  <p>Das Training ist dieselbe Schleife wie bei der linearen Regression, nur mit viel mehr Parametern:</p>
  <ol>
    <li><b>Forward pass:</b> Eingabe Schicht für Schicht durchs Netz, <code>z = W·a + b</code>, <code>a = f(z)</code>, am Ende die Vorhersage <code>ŷ</code>.</li>
    <li><b>Loss:</b> eine Zahl, die misst, wie weit <code>ŷ</code> von der richtigen Antwort <code>y</code> entfernt ist. Bei Klassifikation Cross-Entropy, bei Regression MSE oder MAE.</li>
    <li><b>Backpropagation:</b> Mit der Kettenregel wird der Gradient der Loss nach jedem Gewicht berechnet, von der Ausgabe nach hinten. Die Zwischenergebnisse jeder Schicht werden wiederverwendet, darum ist das schnell.</li>
    <li><b>Update:</b> <code>w ← w − α · ∂L/∂w</code> mit der <b>learning rate</b> α, ein kleiner Schritt gegen den Gradienten.</li>
  </ol>
  <div class="demo" id="nsDemo">
    <div class="tag">Demo</div><h4>Ein Trainingsschritt in einem winzigen Netz</h4>
    <p class="hint">Netz mit 2 Eingängen, 2 hidden Neuronen (Sigmoid) und 1 Ausgang. Beispiel: <code>x = (1.0, 0.5)</code>, richtige Klasse <code>y = 1</code>. Klicke durch die vier Phasen. «Update» ändert die Gewichte wirklich, danach siehst du in «1 · Forward» die neuen Werte.</p>
    <div class="btnrow"><button id="nsB1" class="pri">1 · Forward</button><button id="nsB2">2 · Loss</button><button id="nsB3">3 · Backward</button><button id="nsB4">4 · Update</button></div>
    <pre><code id="nsOut"></code></pre>
    <div class="ctl"><label for="nsLr">learning rate α</label><input type="range" id="nsLr" min="0.1" max="2" step="0.1" value="0.5"><output id="nsLrO"></output></div>
    <div class="btnrow"><button id="nsTen">10 Runden trainieren</button><button id="nsReset">Zurücksetzen</button></div>
    <svg class="plot" id="nsSvg" viewBox="0 0 320 110" role="img" aria-label="Loss pro Runde, sinkt mit jedem Update"></svg>
    <div class="stats"><span>Runde <b id="nsN"></b></span><span>Vorhersage ŷ <b id="nsPred"></b></span><span>Loss <b id="nsLoss"></b></span></div>
    <p class="hint">Die Gradienten sind von Hand nach der Kettenregel gerechnet und stimmen mit numerisch berechneten Gradienten überein. Bei Sigmoid-Ausgabe mit Cross-Entropy ist der Fehler am Ausgang einfach <code>δ = ŷ − y</code>.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Loss je nach Aufgabe</h4>
  <p>Bei <b>Klassifikation</b> gibt die Ausgabe-Schicht Wahrscheinlichkeiten aus (Sigmoid oder Softmax), die Loss ist die <b>Cross-Entropy</b>: <code>L = −[ y·log(ŷ) + (1−y)·log(1−ŷ) ]</code> (Mittel über alle Beispiele). Bei <b>Regression</b> ist die Ausgabe linear (oder Sigmoid, wenn der Bereich begrenzt ist), die Loss ist MSE oder MAE. Warum Cross-Entropy besser zur Klassifikation passt als MSE, zeigt die Demo im Kapitel <a href="#klass">Klassifikation</a>.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Startgewichte</h4>
  <p>Die Gewichte starten mit <b>kleinen Zufallswerten</b> aus einer Normalverteilung um 0, bias oft mit 0. Alle gleich zu setzen wäre falsch: Dann bekämen alle Neuronen einer Schicht dieselben Gradienten und blieben gleich. Die Streuung zählt, damit die Signale von Schicht zu Schicht weder schwinden noch explodieren (vanishing und exploding gradients). Übliche Faustregeln: <b>Xavier</b> mit Varianz <code>1/n_in</code> (für Sigmoid und Tanh) und <b>Kaiming (He)</b> mit <code>2/n_in</code> (für ReLU). Keras wählt das für dich (<code>glorot_uniform</code> als Standard).</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Warum das Ergebnis nicht jedes Mal gleich ist</h4>
  <p>Die Loss-Fläche eines Netzes ist stark gekrümmt, mit vielen Tälern, Plateaus und Sattelpunkten. Gradient Descent garantiert kein globales Minimum, und weil die Startgewichte zufällig sind, landet jeder Lauf woanders. In der Praxis funktioniert das trotzdem gut. Setze für vergleichbare Läufe einen <b>seed</b> und wiederhole wichtige Vergleiche mit mehreren seeds.</p>
  <div class="merk"><b>Merksatz</b><p>Forward pass, Loss, Backpropagation, Update. Das Netz lernt, indem der Fehler am Ausgang rückwärts in einen Gradienten pro Gewicht zerlegt wird. Skaliere die Eingaben (z. B. <code>StandardScaler</code>, nur auf den Trainingsdaten gelernt): Sonst steht ein Gewicht für einen riesigen Zahlenbereich und Gradient Descent kommt nur mühsam voran.</p></div>

  <h3 id="nn-opt">4 · Optimizer: schneller und stabiler zum Minimum</h3>
  <p>Reiner Gradient Descent rechnet den Gradienten über <i>alle</i> Daten, bevor er einen Schritt macht. Das ist langsam. Beim <b>Mini-Batch</b>-Verfahren werden die Daten gemischt und in Päckchen der Grösse <code>batch size</code> (zum Beispiel 32) geteilt; nach jedem Päckchen gibt es ein Update. Einmal alle Päckchen durch ist eine <b>epoch</b>. Der Gradient eines Päckchens ist etwas verrauscht, aber viel billiger.</p>
  <div class="tablewrap"><table>
    <tr><th>Optimizer</th><th>Idee</th><th>Merke</th></tr>
    <tr><td><b>SGD</b></td><td><code>w ← w − α·g</code></td><td>Einfach, aber die learning rate muss zur steilsten Richtung passen: Ist sie zu gross, springt er weg.</td></tr>
    <tr><td><b>Momentum</b></td><td>Gleitender Mittelwert der letzten Gradienten (Faktor 0.9)</td><td>Dämpft das Zickzack quer zum Tal und beschleunigt in Richtungen mit gleichbleibendem Gradienten.</td></tr>
    <tr><td><b>RMSProp</b></td><td>Schritt geteilt durch den gleitenden Mittelwert von <code>g²</code> (decay 0.9)</td><td>Jeder Parameter bekommt seine eigene Schrittgrösse: grosse Gradienten werden gebremst, kleine verstärkt.</td></tr>
    <tr><td><b>Adam</b></td><td>Momentum und RMSProp zusammen</td><td>Meist der Standard. Voreinstellung im Paper: Faktoren 0.9 und 0.999, learning rate 0.001.</td></tr>
  </table></div>
  <div class="demo" id="noDemo">
    <div class="tag">Demo</div><h4>Optimizer im engen Tal</h4>
    <p class="hint">Alle vier starten am Ring links oben und minimieren <code>20·x² + 0.5·y²</code>: sehr steil in x, flach in y, wie ein enges Tal. Verändere die learning rate und die Schritte. Pfade, die aus dem Bild springen, sind am Rand abgeschnitten.</p>
    <svg class="plot" id="noSvg" viewBox="0 0 320 240" role="img" aria-label="Pfade von SGD, Momentum, RMSProp und Adam auf einem engen Tal"></svg>
    <div class="ctl"><label for="noLr">learning rate</label><input type="range" id="noLr" min="0.01" max="0.15" step="0.01" value="0.05"><output id="noLrO"></output></div>
    <div class="ctl"><label for="noSteps">Schritte</label><input type="range" id="noSteps" min="5" max="60" step="1" value="40"><output id="noStepsO"></output></div>
    <div class="tablewrap"><table id="noTab" style="min-width:0"></table></div>
    <p class="hint" id="noMsg"></p>
    <p class="hint">Mit kleiner learning rate sind RMSProp und Adam zu langsam, weil ihr Schritt etwa so gross wie die learning rate bleibt, egal wie steil es ist. Mit grosser springt SGD weg. Es gibt keinen Optimizer, der immer gewinnt, aber Adam ist robust und darum der Standard.</p>
  </div>
  <p class="note">Die Folien schreiben Momentum als <code>v = β·v + (1−β)·g</code>, Keras und PyTorch rechnen <code>v = β·v + g</code> ohne den Faktor (1−β). Das ist dasselbe mit anderer learning rate, und die Demo benutzt die Keras-Variante.</p>

  <h3 id="nn-valid">5 · Validierung und Tuning</h3>
  <p>Auch hier gilt der Split aus dem <a href="#ml-split">Supervised Learning</a>: <b>train</b> zum Lernen der Gewichte, <b>validation</b> zum Vergleichen von Setups (Architektur, Hyperparameter) und <b>test</b> einmal ganz am Schluss. Weil ein Netz lange trainiert, schaust du die Loss auf train und validation <b>nach jeder epoch</b> an:</p>
  <div class="tablewrap"><table>
    <tr><th>Beide Kurven …</th><th>Bedeutung</th><th>Was tun</th></tr>
    <tr><td>hoch, nah beieinander</td><td>underfitting: Das Netz lernt zu wenig</td><td>Grösseres Netz, länger trainieren, learning rate prüfen</td></tr>
    <tr><td>Train tief, Validation weit darüber oder wieder steigend</td><td>overfitting: Das Netz lernt die Trainingsdaten auswendig</td><td>Early Stopping, Dropout, kleineres Netz, mehr Daten, Data Augmentation</td></tr>
    <tr><td>tief, nah beieinander</td><td>gute Anpassung</td><td>Auf dem Testset einmal bestätigen</td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Regularisierung für Netze</h4>
  <ul>
    <li><b>Dropout:</b> Beim Training werden in jedem Schritt zufällig einige Aktivierungen auf 0 gesetzt (zum Beispiel 30 %). Das Netz kann sich nicht auf einzelne Neuronen verlassen. Bei der Vorhersage sind alle Neuronen aktiv; Keras skaliert beim Training, damit die Grössenordnung gleich bleibt.</li>
    <li><b>Early Stopping:</b> Du hörst auf, wenn die Validation-Loss nicht mehr sinkt, und behältst das Modell der besten epoch (<code>restore_best_weights=True</code>).</li>
    <li><b>Data Augmentation:</b> Aus den vorhandenen Beispielen entstehen verschobene, gedrehte oder gespiegelte Varianten (vor allem bei Bildern). Das ist künstlich mehr Trainingsdaten.</li>
    <li><b>L2 (weight decay):</b> bestraft grosse Gewichte, wie Ridge in der <a href="#ml-reg">Regularisierung</a>.</li>
  </ul>
  <div class="demo" id="nfDemo">
    <div class="tag">Demo</div><h4>Ein Netz trainieren: Grösse, Dropout, learning rate</h4>
    <p class="hint">Zwei verschränkte Halbmonde mit Rauschen: 40 Trainingspunkte (Kreise) und 200 Validationspunkte (kleine Quadrate). Das Netz hat eine ReLU-hidden-layer und lernt mit Adam, Mini-Batch 10, skalierte Eingaben (aus den Trainingsdaten). Die schwarze Linie in der Kurve ist die gewählte epoch. Ändere einen Regler nach dem anderen.</p>
    <svg class="plot" id="nfSvg" viewBox="0 0 320 240" role="img" aria-label="Entscheidungsgrenze des Netzes mit Trainings- und Validationspunkten"></svg>
    <svg class="plot" id="nfCurve" viewBox="0 0 320 150" role="img" aria-label="Loss auf Training und Validation je epoch" style="margin-top:10px"></svg>
    <div class="ctl"><label for="nfEp">epoch</label><input type="range" id="nfEp" min="0" max="300" step="1" value="300"><output id="nfEpO"></output></div>
    <div class="ctl"><label for="nfH">Neuronen in der hidden layer</label><input type="range" id="nfH" min="1" max="32" step="1" value="32"><output id="nfHO"></output></div>
    <div class="ctl"><label for="nfDrop">Dropout-Rate</label><input type="range" id="nfDrop" min="0" max="0.7" step="0.1" value="0"><output id="nfDropO"></output></div>
    <div class="ctl"><label for="nfLr">learning rate</label><input type="range" id="nfLr" min="0" max="4" step="1" value="3"><output id="nfLrO"></output></div>
    <div class="stats"><span>Loss Training <b id="nfTr"></b></span><span>Loss Validation <b id="nfVa"></b></span><span>Accuracy Validation <b id="nfAcc"></b></span><span>bestes Minimum bei epoch <b id="nfBest"></b></span></div>
    <p class="hint" id="nfMsg"></p>
    <p class="hint">Probiere: 32 Neuronen ohne Dropout (overfitting, die Grenze zackt um einzelne Punkte), dann Dropout 0.5, dann nur 4 Neuronen. Mit learning rate 0.1 passiert alles schneller, mit 0.001 ist nach 300 epochs noch nichts gelernt. Die Zahlen kommen aus einem echten Lauf im Browser mit festem seed; ein anderer seed gäbe etwas andere Kurven.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Hyperparameter</h4>
  <div class="tablewrap"><table>
    <tr><th>Hyperparameter</th><th>Wirkung</th><th>Hinweis</th></tr>
    <tr><td><b>learning rate</b></td><td>Schrittgrösse beim Update</td><td>Der wichtigste Regler. Zu gross: Loss springt oder explodiert. Zu klein: Training kriecht. Bei Adam oft 0.001.</td></tr>
    <tr><td><b>batch size</b></td><td>Beispiele je Update</td><td>Klein: verrauscht, billig. Gross: ruhiger, aber teurer. Typisch 16 bis 256.</td></tr>
    <tr><td><b>epochs</b></td><td>Wie oft alle Daten durchlaufen werden</td><td>Mit Early Stopping hoch ansetzen und das Training selbst enden lassen.</td></tr>
    <tr><td><b>Layers und Neuronen</b></td><td>Kapazität des Netzes</td><td>Mehr Kapazität lernt komplexere Muster, aber overfittet leichter.</td></tr>
    <tr><td><b>Dropout-Rate</b></td><td>Stärke der Regularisierung</td><td>Typisch 0.2 bis 0.5.</td></tr>
    <tr><td><b>Optimizer, activation</b></td><td>Wie gelernt wird, welche Nicht-Linearität</td><td>Adam und ReLU sind sinnvolle Startwerte.</td></tr>
  </table></div>
  <p>Gehe wie bisher vor: ein Setup ändern, auf der Validation vergleichen, das beste behalten. Weil die Startgewichte zufällig sind, schwankt auch ein gleiches Setup etwas, also vergleiche nur deutliche Unterschiede oder mehrere seeds.</p>
  <div class="falle"><b>Falle (Testset)</b><p>Wenn du nach jeder Änderung das Testset ansiehst und danach entscheidest, ist es kein Testset mehr, sondern eine zweite Validation (siehe <a href="#klass-leakage">Data Leakage</a>). Auch Early Stopping darf nur auf der Validation entscheiden.</p></div>

  <h3 id="nn-keras">6 · Keras in der Praxis</h3>
  <p>Im Kurs baust du die Netze mit <b>Keras</b>. Die Blöcke unten sind <b>nicht ausgeführt</b>, weil TensorFlow nicht Teil der Lernapp ist; sie zeigen, wie die Begriffe dieses Kapitels in Code aussehen.</p>
  <pre><code>from tensorflow import keras

model = keras.Sequential([
    keras.layers.Input(shape=(784,)),
    keras.layers.Dense(128, activation="relu"),     # hidden layer
    keras.layers.Dropout(0.3),                      # Dropout
    keras.layers.Dense(10, activation="softmax"),   # Ausgabe: 10 Klassen
])
model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001),
              loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.summary()      # 784*128+128 + 128*10+10 = 101'770 Parameter

stop = keras.callbacks.EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)
history = model.fit(x_train, y_train, validation_split=0.2,
                    epochs=50, batch_size=32, callbacks=[stop])
model.evaluate(x_test, y_test)    # das Testset: genau einmal</code></pre>
  <div class="tablewrap"><table>
    <tr><th>Keras</th><th>Begriff aus dem Kapitel</th></tr>
    <tr><td><code>Dense(128, activation="relu")</code></td><td>hidden layer mit 128 Neuronen und ReLU, <code>(784+1)·128</code> Parameter</td></tr>
    <tr><td><code>Dropout(0.3)</code></td><td>Dropout-Rate 0.3 beim Training</td></tr>
    <tr><td><code>compile(optimizer, loss)</code></td><td>Optimizer und Loss festlegen (Schritt 3)</td></tr>
    <tr><td><code>fit(..., validation_split, epochs, batch_size)</code></td><td>Trainings-Loop (Schritte 4 bis 7) mit Validation je epoch</td></tr>
    <tr><td><code>EarlyStopping(monitor="val_loss", ...)</code></td><td>Early Stopping auf der Validation-Loss</td></tr>
    <tr><td><code>evaluate(x_test, y_test)</code></td><td>Test (Schritt 9)</td></tr>
  </table></div>
  <p>Die <b>Functional API</b> baut dasselbe Netz als Graph und erlaubt Verzweigungen. Im <b>Custom Training Loop</b> schreibst du die vier Phasen der Demo selbst:</p>
  <pre><code># Functional API
inputs = keras.Input(shape=(784,))
x = keras.layers.Dense(128, activation="relu")(inputs)
outputs = keras.layers.Dense(10, activation="softmax")(x)
model = keras.Model(inputs, outputs)

# Custom Training Loop (TensorFlow)
for x_batch, y_batch in dataset:
    with tf.GradientTape() as tape:
        y_pred = model(x_batch, training=True)                 # forward pass
        loss = loss_fn(y_batch, y_pred)                        # Loss
    grads = tape.gradient(loss, model.trainable_weights)       # Backpropagation
    optimizer.apply_gradients(zip(grads, model.trainable_weights))   # Update</code></pre>
  <div class="merk"><b>Merksatz</b><p>Ein Neural Network ist ein Stapel von Neuronen (gewichtete Summe plus activation function), dessen Gewichte mit Backpropagation und einem Optimizer wie Adam gelernt werden. Gewählt wird es wie jedes Modell: auf der Validation, mit Early Stopping und Dropout gegen overfitting, und das Testset einmal am Schluss.</p></div>
`,
    notebooks: [
      { file: 'beispiele/08_Neuronale_Netze.ipynb', desc: `Netz von Hand in NumPy (Gradienten gegen numerische Gradienten geprüft) und mit scikit-learn: Vergleich mit Baseline und logistischer Regression, Grösse, learning rate, L2, Early Stopping, Loss-Kurven.` },
    ],
    quiz: [
      { q: `Was passiert, wenn alle activation functions in den hidden layers linear sind?`, a: `Das ganze Netz bleibt eine einzige lineare Funktion, egal wie viele Schichten es hat (<code>W2·(W1·x) = (W2·W1)·x</code>). Erst nicht-lineare activation functions wie ReLU erlauben gekrümmte Grenzen.` },
      { q: `Wie viele Parameter hat eine Dense-Schicht mit 784 Eingängen und 128 Neuronen?`, a: `<code>(784 + 1) · 128 = 100'480</code>: 784·128 Gewichte plus 128 bias.` },
      { q: `Welche activation und welche Loss nimmst du in der Ausgabe bei 2 Klassen, bei 10 Klassen und bei einem Preis?`, a: `2 Klassen: 1 Neuron mit Sigmoid und Binary Cross-Entropy. 10 Klassen: 10 Neuronen mit Softmax und Cross-Entropy. Preis: 1 Neuron, linear, MSE oder MAE.` },
      { q: `Warum starten die Gewichte mit Zufallswerten und nicht alle bei 0?`, a: `Bei gleichen Startwerten würden alle Neuronen einer Schicht dieselben Gradienten erhalten und gleich bleiben. Zufall bricht diese Symmetrie. Die Streuung (Xavier, He) hält ausserdem die Signale stabil, damit Gradienten nicht verschwinden oder explodieren.` },
      { q: `Was sind Mini-Batch, batch size und epoch?`, a: `Ein Mini-Batch ist eine Teilmenge der Trainingsdaten, nach der es ein Update gibt. Die batch size ist ihre Grösse. Eine epoch ist ein Durchlauf, in dem das Netz alle Trainingsdaten einmal gesehen hat.` },
      { q: `Warum Momentum oder Adam statt reinem SGD?`, a: `Momentum mittelt die letzten Gradienten und dämpft das Zickzack. RMSProp gibt jedem Parameter eine eigene Schrittgrösse. Adam kombiniert beides und ist darum robust, wenn die Loss-Fläche steile und flache Richtungen hat.` },
      { q: `Die Training-Loss sinkt, die Validation-Loss steigt seit einigen epochs wieder. Was bedeutet das, was tust du?`, a: `overfitting. Early Stopping (bestes Modell beim Minimum der Validation-Loss behalten), Dropout, ein kleineres Netz, mehr Daten oder Data Augmentation.` },
      { q: `Wie arbeitet Dropout, und gilt es auch bei der Vorhersage?`, a: `Beim Training werden zufällig Aktivierungen auf 0 gesetzt (zum Beispiel 30 %). Das Netz kann sich nicht auf einzelne Neuronen verlassen. Bei der Vorhersage sind alle Neuronen aktiv.` },
      { q: `Warum skalierst du die Eingaben eines Netzes, und womit lernst du den Scaler?`, a: `Sehr verschiedene Zahlenbereiche machen Gradient Descent langsam und die Startgewichte unpassend. Der Scaler wird nur auf den Trainingsdaten gelernt (sonst Data Leakage) und danach auf Validation und Test angewendet.` },
      { q: `Warum darfst du Hyperparameter nicht am Testset wählen?`, a: `Das Testset würde indirekt mitlernen. Die Schätzung wäre zu optimistisch. Wähle auf der Validation, teste einmal ganz am Schluss.` },
    ],
    init() {
      LernApp.demos.nn();
      // Workflow figure: click a step to open its explanation (same pattern as the other chapters)
      (function(){
        const fig=document.querySelector('#nn .ab-fig');
        if(!fig)return;
        const panel=fig.querySelector('.ab-detail'),steps=fig.querySelectorAll('.ab-step');
        const t=LernApp.t;
        const S={
          '1':[t('1 · Daten vorbereiten','1 · Prepare the data'),t('Wie beim Supervised Learning: Aufteilen in <b>train</b> (Gewichte lernen), <b>validation</b> (Setups vergleichen) und <b>test</b> (einmal am Schluss). Eingaben skalieren, zum Beispiel mit <code>StandardScaler</code>, nur auf train gelernt. Kategorien als One-Hot. Netze reagieren empfindlich auf sehr verschiedene Zahlenbereiche.','As in supervised learning: split into <b>train</b> (learn the weights), <b>validation</b> (compare setups) and <b>test</b> (once at the end). Scale the inputs, for example with <code>StandardScaler</code>, learned on train only. Categories as one-hot. Networks are sensitive to very different number ranges.'),[[t('Train, Validation, Test','Train, validation, test'),'#ml-split'],[t('Skalieren','Scaling'),'#ml-scaling']]],
          '2':[t('2 · Architektur wählen','2 · Choose the architecture'),t('Wie viele <b>hidden layers</b> und Neuronen, welche <b>activation function</b>: ReLU ist der Standard in hidden layers. Die Ausgabe hängt von der Aufgabe ab: Sigmoid (2 Klassen), Softmax (mehrere Klassen), linear (Zahl). Zähle die Parameter, <code>(n_in + 1) · n_out</code> je Schicht.','How many <b>hidden layers</b> and neurons, which <b>activation function</b>: ReLU is the default in hidden layers. The output depends on the task: sigmoid (2 classes), softmax (several classes), linear (a number). Count the parameters, <code>(n_in + 1) · n_out</code> per layer.'),[[t('Vom Neuron zum Netz','From neuron to network'),'#nn-neuron'],[t('Parameter zählen','Count parameters'),'#nn-arch']]],
          '3':[t('3 · Loss und Optimizer','3 · Loss and optimizer'),t('Die <b>Loss</b> misst den Fehler: Cross-Entropy bei Klassifikation, MSE oder MAE bei Regression. Der <b>Optimizer</b> bestimmt, wie aus dem Gradienten ein Update wird: Adam ist ein guter Start. Dazu die Hyperparameter <b>learning rate</b>, <b>batch size</b> und Zahl der <b>epochs</b>.','The <b>loss</b> measures the error: cross-entropy for classification, MSE or MAE for regression. The <b>optimizer</b> decides how a gradient becomes an update: Adam is a good start. Plus the hyperparameters <b>learning rate</b>, <b>batch size</b> and number of <b>epochs</b>.'),[[t('Loss je Aufgabe','Loss per task'),'#nn-training'],[t('Optimizer','Optimizers'),'#nn-opt']]],
          '4':[t('4 · Forward pass','4 · Forward pass'),t('Ein Mini-Batch geht Schicht für Schicht durchs Netz: <code>z = W·a + b</code>, <code>a = f(z)</code>. Am Ende steht die Vorhersage <code>ŷ</code>. Beim Training merkt sich jede Schicht ihre Zwischenwerte, weil Backpropagation sie braucht.','A mini-batch goes through the network layer by layer: <code>z = W·a + b</code>, <code>a = f(z)</code>. At the end comes the prediction <code>ŷ</code>. During training each layer remembers its intermediate values, because backpropagation needs them.'),[[t('Demo: ein Trainingsschritt','Demo: one training step'),'#nsDemo']]],
          '5':[t('5 · Loss berechnen','5 · Compute the loss'),t('Aus <code>ŷ</code> und der richtigen Antwort <code>y</code> wird eine einzige Zahl: der Fehler dieses Mini-Batches. Je kleiner, desto besser. Das ist die Zahl, die das Training senken will.','From <code>ŷ</code> and the correct answer <code>y</code> comes a single number: the error of this mini-batch. The smaller, the better. This is the number that training wants to lower.'),[[t('Demo: ein Trainingsschritt','Demo: one training step'),'#nsDemo']]],
          '6':[t('6 · Backpropagation','6 · Backpropagation'),t('Mit der <b>Kettenregel</b> wird der Gradient der Loss nach jedem Gewicht berechnet, von der Ausgabe nach hinten: Der Fehler am Ausgang wird auf die Schicht davor zurückgerechnet, dann weiter zurück. Die Zwischenergebnisse werden wiederverwendet, darum ist das schnell. In Keras macht das <code>fit</code> oder <code>GradientTape</code> für dich.','With the <b>chain rule</b> the gradient of the loss with respect to every weight is computed, from the output backwards: the error at the output is passed back to the layer before it, then further back. Intermediate results are reused, which is why it is fast. In Keras, <code>fit</code> or <code>GradientTape</code> does this for you.'),[[t('Demo: ein Trainingsschritt','Demo: one training step'),'#nsDemo'],[t('Ableitung','Derivative'),'mathe-ausfuehrlich.html']]],
          '7':[t('7 · Parameter aktualisieren','7 · Update the parameters'),t('<code>w ← w − α · ∂L/∂w</code>: ein kleiner Schritt gegen den Gradienten, mit der <b>learning rate</b> α. Adam oder Momentum verfeinern diesen Schritt. Die Schritte 4 bis 7 wiederholen sich für jeden Mini-Batch; alle Batches zusammen sind eine <b>epoch</b>, und man trainiert viele epochs.','<code>w ← w − α · ∂L/∂w</code>: a small step against the gradient, with the <b>learning rate</b> α. Adam or momentum refine this step. Steps 4 to 7 repeat for every mini-batch; all batches together are one <b>epoch</b>, and you train many epochs.'),[['Gradient Descent','#ml-gd'],[t('Optimizer','Optimizers'),'#nn-opt']]],
          '8':[t('8 · Validation prüfen','8 · Check validation'),t('Nach jeder epoch den Loss auf train und validation ansehen. Sinkt die Validation-Loss nicht mehr oder steigt sie wieder, ist das <b>overfitting</b>: Early Stopping, Dropout, kleineres Netz, mehr Daten. Bleibt alles hoch, ist es underfitting. Danach zurück zu Schritt 2 oder 3 mit einem anderen Setup.','After every epoch look at the loss on train and validation. If the validation loss stops falling or rises again, that is <b>overfitting</b>: early stopping, dropout, a smaller network, more data. If everything stays high, it is underfitting. Then back to step 2 or 3 with a different setup.'),[[t('Validierung und Tuning','Validation and tuning'),'#nn-valid'],['Bias und Variance','#ml-bv']]],
          '9':[t('9 · Einmal testen','9 · Test once'),t('Das Testset wird genau einmal benutzt, wenn Architektur und Hyperparameter feststehen. Wer danach noch am Setup dreht, benutzt das Testset zum Wählen und bekommt eine zu optimistische Schätzung.','The test set is used exactly once, when architecture and hyperparameters are fixed. Anyone who keeps changing the setup afterwards uses the test set for choosing and gets an overly optimistic estimate.'),[['Data Leakage','#klass-leakage']]],
        };
        let cur=null;
        function close(){
          panel.hidden=true;cur=null;
          steps.forEach(function(g){g.classList.remove('on');g.setAttribute('aria-expanded','false')});
        }
        function open(k){
          if(cur===k){close();return}
          const d=S[k];if(!d)return;
          cur=k;
          panel.querySelector('.ab-dh b').textContent=d[0];
          panel.querySelector('.ab-db').innerHTML=d[1];
          panel.querySelector('.ab-dl').innerHTML=d[2].map(function(l){return '<a href="'+l[1]+'">'+l[0]+' →</a>'}).join('');
          panel.hidden=false;
          steps.forEach(function(g){const on=g.getAttribute('data-s')===k;g.classList.toggle('on',on);g.setAttribute('aria-expanded',on?'true':'false')});
        }
        steps.forEach(function(g){
          g.addEventListener('click',function(){open(g.getAttribute('data-s'))});
          g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(g.getAttribute('data-s'))}});
        });
        panel.querySelector('.ab-x').addEventListener('click',close);
      })();
    },
  });
})();
