/* Module: Convolutional Neural Networks (Modul 3, Teil 2). Content lives in the html field; the demos live in assets/demos-cnn.js. */
(function () {
  LernApp.register({
    id: 'cnn',
    order: 93,
    nav: 'CNN',
    title: `Convolutional Neural Networks`,
    kicker: `Modul 3 · Deep Learning, Teil 2`,
    summary: `Convolution, Filter, Feature Map, Padding, Stride, Pooling, Data Augmentation, Transfer Learning`,
    html: `  <p>Ein Convolutional Neural Network (CNN) ist ein <a href="#nn">Neural Network</a> mit einem anderen Baustein für Bilder: Statt dass jedes Neuron alle Pixel sieht, gleitet ein kleiner <b>Filter</b> über das Bild und sucht überall dasselbe Muster. Training, Loss, Backpropagation und Optimizer bleiben genau gleich.</p>
  <p class="note">Die Demos rechnen im Browser mit kleinen Beispielbildern. Die Keras-Codeblöcke laufen hier nicht, sondern in Jupyter oder Colab (die Kurs-Notebooks zu CIFAR-10 und SVHN).</p>

  <h3 id="cnn-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#nn-ablauf">Neural Network</a>. Neu sind die Daten (Bilder als Arrays) und die Architektur (Conv- und Pooling-Blöcke vor dem Dense-Teil). In der Validation kommen Data Augmentation und Transfer Learning dazu.</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="cnnFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines CNN-Projekts: Bilder vorbereiten, Architektur aus Conv- und Pooling-Blöcken wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward pass, Loss, Backpropagation und Update, danach Validation prüfen mit Tuning-Schleife und zum Schluss einmal testen">
      ${LernApp.nnFlow({
        id: 'cb',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Bilder vorbereiten', '(Höhe, Breite, Kanäle), /255, One-Hot'],
          ['Architektur wählen', 'Conv2D + Pooling, dann Dense'],
          ['Loss und Optimizer', 'Cross-Entropy, Adam, Learning Rate'],
          ['Forward Pass', 'Filter → Feature Maps → Softmax'],
          ['Loss berechnen', 'Abstand zwischen ŷ und y'],
          ['Backpropagation', 'Gradienten auch für die filter'],
          ['Parameter aktualisieren', 'w ← w − α · ∂L/∂w'],
          ['Validation prüfen', 'Overfitting? Augmentation, Dropout'],
          ['Einmal testen', 'Testset, erst ganz am Schluss'],
        ],
        loopA: ['pro Mini-Batch,', 'viele Epochs'],
        loopB: ['Tuning:', 'filter, Blöcke,', 'Augmentation'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Schliessen">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Die Schritte 4 bis 7 (orange gestrichelt, innen) laufen für jeden Mini-Batch. Der äussere Loop ist das Tuning auf der Validation. Das Testset (orange) wird nicht zum Wählen benutzt.</figcaption>
  </figure>

  <h3 id="cnn-warum">1 · Warum nicht einfach ein Dense-Netz?</h3>
  <p>Ein Farbbild aus CIFAR-10 hat 32 × 32 Pixel mit je 3 Kanälen (Rot, Grün, Blau), also 3'072 Zahlen. Ein Dense-Netz macht daraus mit <code>Flatten</code> einen langen Vektor. Das hat drei Nachteile:</p>
  <ul>
    <li><b>Zu viele Parameter:</b> Schon eine Hidden Layer mit 512 Neuronen hat <code>(3072 + 1) · 512 ≈ 1.6 Mio.</code> Gewichte. Bei 224 × 224-Fotos wären es über 77 Mio. für eine Schicht. Das Netz neigt schnell zu Overfitting.</li>
    <li><b>Die Nachbarschaft geht verloren:</b> Nach <code>Flatten</code> weiss das Netz nicht mehr, welche Pixel nebeneinander liegen. Kanten und Formen bestehen aber aus Nachbarpixeln.</li>
    <li><b>Kein Wiedererkennen an anderer Stelle:</b> Ein Neuron, das eine Katze oben links gelernt hat, hilft nicht für eine Katze unten rechts. Jede Position muss neu gelernt werden.</li>
  </ul>
  <p>Ein CNN löst alle drei Probleme mit zwei Ideen: <b>lokale Verbindungen</b> (ein Neuron sieht nur einen kleinen Ausschnitt, zum Beispiel 3 × 3 Pixel) und <b>geteilte Gewichte</b> (derselbe Filter wird an jeder Position benutzt).</p>

  <h3 id="cnn-conv">2 · Convolution: ein Filter gleitet über das Bild</h3>
  <p>Ein <b>Filter</b> (auch <b>Kernel</b>) ist eine kleine Gewichtsmatrix, typisch 3 × 3. Er wird auf jede Position des Bildes gelegt; dort werden die Pixel mit den Filtergewichten multipliziert und summiert, plus Bias. Das Ergebnis jeder Position ist ein Wert der <b>Feature Map</b>. Ein hoher Wert heisst: Hier sieht das Bild aus wie das Muster im Filter.</p>
  <pre><code>z[r, c] = Σᵢ Σⱼ Bild[r+i, c+j] · K[i, j] + b      # i, j = 0..2 bei 3 × 3
a[r, c] = ReLU(z[r, c])</code></pre>
  <p>Das ist dasselbe wie ein Neuron (gewichtete Summe plus Activation Function), nur dass es nur 9 Pixel sieht und dieselben 9 Gewichte an jeder Position verwendet. Ein 3 × 3-Filter hat darum nur <b>10 Parameter</b>, egal wie gross das Bild ist. Im Training lernt das Netz die Filtergewichte selbst; die handgemachten Filter in der Demo zeigen nur, was solche Filter typischerweise finden.</p>
  <div class="demo" id="ccDemo">
    <div class="tag">Demo</div><h4>Ein Filter auf einem 8 × 8-Bild</h4>
    <p class="hint">Wähle Bild und Filter. Der orange Rahmen links ist das aktuelle Fenster, rechts daneben sein Wert in der Feature Map. Klicke auf ein Feld der Feature Map oder schiebe das Fenster mit den Pfeilen. Ganz rechts: Feature Map nach ReLU und 2 × 2-Pooling.</p>
    <div class="btnrow" id="ccImg" role="group" aria-label="Bild"><button data-v="seven" class="pri" aria-pressed="true">Ziffer 7</button><button data-v="square" aria-pressed="false">Quadrat</button><button data-v="cross" aria-pressed="false">Kreuz</button></div>
    <div class="btnrow" id="ccKer" role="group" aria-label="filter"><button data-v="vert" class="pri" aria-pressed="true">Vertikale Kante</button><button data-v="horiz" aria-pressed="false">Horizontale Kante</button><button data-v="diag" aria-pressed="false">Diagonale</button><button data-v="blur" aria-pressed="false">Weichzeichner</button></div>
    <svg class="plot" id="ccSvg" viewBox="0 0 490 190" style="max-width:560px" role="img" aria-label="8 × 8-Bild mit Fenster, 3 × 3-Filter, 6 × 6-Feature-Map und 3 × 3-Ergebnis nach Pooling"></svg>
    <div class="btnrow"><button id="ccPrev" aria-label="Fenster zurück">◀ Fenster</button><button id="ccNext" aria-label="Fenster weiter">Fenster ▶</button></div>
    <div class="btnrow" id="ccMode" role="group" aria-label="Pooling"><button data-v="max" class="pri" aria-pressed="true">Max-Pooling</button><button data-v="avg" aria-pressed="false">Average-Pooling</button></div>
    <pre><code id="ccCalc"></code></pre>
    <div class="stats"><span>z an dieser Stelle <b id="ccZ"></b></span><span>Pooling-Feld <b id="ccPool"></b></span><span>Parameter des Filters <b>9 + 1 Bias</b></span></div>
    <p class="hint" id="ccMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Convolution = dasselbe kleine Neuron an jeder Bildposition. Die Ausgabe ist eine Feature Map, die zeigt, <i>wo</i> im Bild das Muster des Filters vorkommt.</p></div>
  <p class="note">Mathematisch rechnen Keras und PyTorch eine <i>Cross-Correlation</i> (der Filter wird nicht gespiegelt). Weil die Gewichte ohnehin gelernt werden, spielt das keine Rolle; der Name «Convolution» ist geblieben.</p>

  <h3 id="cnn-pad">3 · Padding und Stride: Wie gross wird die Feature Map?</h3>
  <p>Ohne Rand passt ein 3 × 3-Filter auf ein 8 × 8-Bild nur an 6 × 6 Positionen: Jede Schicht verliert <code>k − 1</code> Pixel. <b>Padding</b> legt einen Rand aus Nullen um das Bild, damit die Grösse erhalten bleibt und auch die Randpixel in genug Fenstern vorkommen. <b>Stride</b> ist die Schrittweite des Filters; mit Stride 2 wird jede zweite Position übersprungen und die Feature Map etwa halb so gross.</p>
  <pre><code>Ausgabe = ⌊(n + 2p − k) / s⌋ + 1        # n Eingabe, k kernel, p padding, s stride

Conv2D(32, (3, 3), padding='valid')   # p = 0: 32 → 30
Conv2D(32, (3, 3), padding='same')    # p = 1: 32 → 32 (bei stride 1)</code></pre>
  <div class="demo" id="csDemo">
    <div class="tag">Demo</div><h4>Ausgabegrösse ausrechnen</h4>
    <p class="hint">Eine Zeile des Bildes. Die orangen Klammern sind die Positionen des Filters, unten die Felder der Ausgabe. Die Formel gilt für Höhe und Breite getrennt.</p>
    <svg class="plot" id="csSvg" viewBox="0 0 420 135" role="img" aria-label="Eine Bildzeile mit Padding, die Positionen des Filters und die Ausgabefelder"></svg>
    <div class="ctl"><label for="csN">Eingabe n</label><input type="range" id="csN" min="3" max="12" step="1" value="8"><output id="csNO"></output></div>
    <div class="ctl"><label for="csK">Kernel Size k</label><input type="range" id="csK" min="1" max="5" step="2" value="3"><output id="csKO"></output></div>
    <div class="ctl"><label for="csS">Stride s</label><input type="range" id="csS" min="1" max="3" step="1" value="1"><output id="csSO"></output></div>
    <div class="ctl"><label for="csP">Padding p</label><input type="range" id="csP" min="0" max="2" step="1" value="0"><output id="csPO"></output></div>
    <div class="stats"><span>Formel <b id="csF"></b></span><span>Keras <b id="csKeras"></b></span></div>
    <p class="hint" id="csMsg"></p>
  </div>

  <h3 id="cnn-pool">4 · Pooling: verkleinern ohne Gewichte</h3>
  <p><b>Pooling</b> fasst kleine Fenster zusammen, meist 2 × 2 mit Stride 2. <b>Max-Pooling</b> nimmt den grössten Wert («irgendwo hier ist das Muster»), <b>Average-Pooling</b> den Mittelwert. Höhe und Breite halbieren sich, die Zahl der Kanäle bleibt.</p>
  <ul>
    <li><b>Weniger Rechenaufwand und Parameter</b> in den folgenden Schichten.</li>
    <li><b>Robust gegen kleine Verschiebungen:</b> Rückt das Muster um ein Pixel, bleibt das Maximum im selben Fenster.</li>
    <li><b>Grösseres Sichtfeld:</b> Ein 3 × 3-Filter nach einem Pooling deckt 6 × 6 Pixel des Originals ab. So sehen spätere Schichten immer grössere Ausschnitte (<i>Receptive Field</i>).</li>
  </ul>
  <p>Pooling hat <b>keine Parameter</b>. Am Ende eines CNN ersetzt <code>GlobalAveragePooling2D</code> oft das <code>Flatten</code>: Es mittelt jede Feature Map zu einer einzigen Zahl und spart so die meisten Dense-Gewichte.</p>
  <div class="falle"><b>Falle</b><p>Pooling und Stride werfen Information über die genaue Lage weg. Für Klassifikation («ist eine Katze im Bild?») ist das gewollt. Für Aufgaben, die Pixel genau zuordnen (Segmentierung), braucht es andere Architekturen.</p></div>

  <h3 id="cnn-kanal">5 · Mehrere Filter und Kanäle: Parameter zählen</h3>
  <p>Eine Conv-Schicht hat nicht einen, sondern viele Filter (32, 64, …). Jeder liefert eine eigene Feature Map; zusammen bilden sie die Ausgabe der Form <code>(Höhe, Breite, Anzahl filter)</code>. Diese Kanäle sind die Eingabe der nächsten Schicht. Darum reicht jeder Filter durch <b>alle</b> Eingabekanäle: Ein 3 × 3-Filter auf einem RGB-Bild hat <code>3 · 3 · 3 = 27</code> Gewichte plus Bias.</p>
  <pre><code>Parameter Conv2D = (k · k · C_in + 1) · C_out
Beispiel:  Conv2D(32, (3, 3)) auf 32 × 32 × 3   → (3·3·3 + 1) · 32  =    896
           Conv2D(64, (3, 3)) auf 16 × 16 × 32  → (3·3·32 + 1) · 64 = 18'496</code></pre>
  <p>Die Bildgrösse kommt in der Formel nicht vor: Das sind die <b>geteilten Gewichte</b>. Darum sind Conv-Schichten billig, und die meisten Parameter eines kleinen CNN stecken in der ersten Dense-Schicht nach <code>Flatten</code>.</p>
  <div class="demo" id="cpDemo">
    <div class="tag">Demo</div><h4>Ein CNN zusammenstellen</h4>
    <p class="hint">Startwerte ähnlich wie im Kurs-Beispiel zu CIFAR-10: drei Blöcke mit je zwei Conv-Schichten (erste <code>same</code>, zweite <code>valid</code>) und Max-Pooling, dann Dense 512. Die Filter verdoppeln sich hier pro Block (im Kurs-Beispiel bleibt der dritte Block bei 64). Die Tabelle entspricht <code>model.summary()</code> (ohne Dropout, das keine Parameter hat).</p>
    <div class="btnrow" id="cpIn" role="group" aria-label="Eingabe"><button data-v="cifar" class="pri" aria-pressed="true">CIFAR-10 (32×32×3)</button><button data-v="mnist" aria-pressed="false">MNIST (28×28×1)</button></div>
    <div class="btnrow" id="cpPad" role="group" aria-label="padding"><button data-v="mixed" class="pri" aria-pressed="true">same, dann valid</button><button data-v="same" aria-pressed="false">immer same</button><button data-v="valid" aria-pressed="false">immer valid</button></div>
    <div class="ctl"><label for="cpB">Blöcke</label><input type="range" id="cpB" min="1" max="4" step="1" value="3"><output id="cpBO"></output></div>
    <div class="ctl"><label for="cpC">Conv-Schichten je Block</label><input type="range" id="cpC" min="1" max="2" step="1" value="2"><output id="cpCO"></output></div>
    <div class="ctl"><label for="cpF">Filter im ersten Block</label><input type="range" id="cpF" min="8" max="64" step="8" value="32"><output id="cpFO"></output></div>
    <div class="ctl"><label for="cpK">Kernel Size</label><input type="range" id="cpK" min="3" max="5" step="2" value="3"><output id="cpKO"></output></div>
    <div class="ctl"><label for="cpD">Dense Hidden</label><input type="range" id="cpD" min="0" max="512" step="64" value="512"><output id="cpDO"></output></div>
    <div class="tablewrap"><table id="cpTab" style="min-width:0"></table></div>
    <div class="stats"><span>CNN gesamt <b id="cpTot"></b></span><span>davon Conv <b id="cpConv"></b></span><span>Dense-Netz auf den Pixeln <b id="cpDense"></b></span></div>
    <p class="hint" id="cpMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Conv-Parameter = <code>(k·k·C_in + 1) · C_out</code>, unabhängig von der Bildgrösse. Pooling hat keine Parameter. Der grosse Brocken ist die Dense-Schicht nach <code>Flatten</code>.</p></div>

  <h3 id="cnn-keras">6 · Ein CNN in Keras</h3>
  <p>Ein typisches kleines CNN stapelt Blöcke aus Conv-Schichten und Pooling. Mit jedem Block wird das Bild kleiner und die Zahl der Filter grösser: Die frühen Filter finden <b>Kanten und Farben</b>, mittlere <b>Texturen und Teile</b> (Auge, Rad), späte ganze <b>Objektteile</b>. Der Dense-Teil am Schluss entscheidet daraus die Klasse.</p>
  <pre><code>import keras
from keras import layers

model = keras.Sequential([
    keras.Input(shape=(32, 32, 3)),
    layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
    layers.MaxPooling2D((2, 2)),                     # 32 → 16
    layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
    layers.MaxPooling2D((2, 2)),                     # 16 → 8
    layers.Conv2D(128, (3, 3), padding="same", activation="relu"),
    layers.MaxPooling2D((2, 2)),                     # 8 → 4
    layers.Flatten(),
    layers.Dropout(0.5),
    layers.Dense(10, activation="softmax"),
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.summary()

x_train = x_train / 255.0                            # Pixel 0..255 → 0..1
history = model.fit(x_train, y_train, epochs=20, batch_size=64, validation_split=0.1)</code></pre>
  <p><code>sparse_categorical_crossentropy</code> nimmt Klassennummern (0 bis 9) direkt; mit <code>to_categorical</code> und One-Hot-Labels heisst sie <code>categorical_crossentropy</code>. Für Graustufenbilder wie MNIST ist die Eingabe <code>(28, 28, 1)</code>: Auch ein einziger Kanal braucht die dritte Achse.</p>
  <div class="falle"><b>Falle</b><p>Viele Beispiel-Notebooks geben <code>validation_data=(x_test, y_test)</code> an. Dann wählst du Epochen und Architektur am Testset, und die Test-Accuracy ist zu optimistisch. Nimm <code>validation_split</code> oder einen eigenen Validation-Teil und das Testset einmal am Schluss.</p></div>
  <p><b>Batch Normalization</b> (<code>layers.BatchNormalization()</code>, nach Conv und vor der Activation oder direkt danach) normiert die Ausgaben einer Schicht pro Mini-Batch auf Mittelwert 0 und Streuung 1. Das stabilisiert und beschleunigt das Training tiefer Netze und erlaubt grössere Learning Rates.</p>

  <h3 id="cnn-aug">7 · Overfitting bei Bildern: Data Augmentation</h3>
  <p>CNNs haben auch mit geteilten Gewichten viele Parameter, und gute Bilddaten sind teuer. <b>Data Augmentation</b> erzeugt beim Training aus jedem Bild zufällig leicht veränderte Varianten: spiegeln, drehen, verschieben, zoomen, Helligkeit ändern. Das Netz sieht so jede Epoch etwas andere Bilder und lernt, dass eine leicht gedrehte Katze immer noch eine Katze ist.</p>
  <pre><code>augment = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),          # bis ±10 % einer vollen Drehung
    layers.RandomZoom(0.1),
    layers.RandomTranslation(0.1, 0.1),
])
model = keras.Sequential([keras.Input(shape=(32, 32, 3)), augment, layers.Rescaling(1 / 255), ...])</code></pre>
  <p>Die Random-Schichten sind nur beim Training aktiv; bei <code>evaluate</code> und <code>predict</code> lassen sie das Bild unverändert. Validation und Test werden also nicht verändert.</p>
  <div class="falle"><b>Falle</b><p>Augmentation muss zur Aufgabe passen. Horizontal spiegeln ist bei Tieren und Autos harmlos, bei Ziffern und Text falsch (eine gespiegelte 2 ist keine 2), und eine 180°-Drehung macht aus einer 6 eine 9.</p></div>
  <p>Weitere Mittel aus dem Kapitel <a href="#nn-valid">Neural Networks</a> gelten genauso: <b>Dropout</b> (meist vor den Dense-Schichten), <b>Early Stopping</b> auf der Validation-Loss und ein kleineres Netz.</p>

  <h3 id="cnn-transfer">8 · Transfer Learning: auf einem fertigen Netz aufbauen</h3>
  <p>Grosse CNNs (zum Beispiel MobileNet, ResNet, EfficientNet) wurden auf ImageNet mit über einer Million Fotos trainiert. Ihre frühen und mittleren Schichten sind allgemeine Detektoren für Kanten, Texturen und Formen, die auch für <i>deine</i> Bilder taugen. Bei <b>Transfer Learning</b> übernimmst du diesen Teil und trainierst nur einen neuen Kopf für deine Klassen. Das braucht viel weniger Bilder und Rechenzeit.</p>
  <ol>
    <li><b>Basis laden</b> ohne ihren Klassifikations-Kopf (<code>include_top=False</code>), mit den ImageNet-Gewichten.</li>
    <li><b>Basis einfrieren</b> (<code>base.trainable = False</code>), damit die grossen Gradienten des zufälligen neuen Kopfs die gelernten Filter nicht zerstören.</li>
    <li><b>Neuen Kopf trainieren:</b> Pooling, Dropout, Dense mit deinen Klassen.</li>
    <li>Optional <b>Fine-Tuning:</b> die obersten Schichten der Basis wieder freigeben und mit sehr kleiner Learning Rate (etwa 1e-5) weitertrainieren.</li>
  </ol>
  <pre><code>base = keras.applications.MobileNetV2(input_shape=(160, 160, 3), include_top=False, weights="imagenet")
base.trainable = False                                  # 2 · einfrieren

inputs = keras.Input(shape=(160, 160, 3))
x = keras.applications.mobilenet_v2.preprocess_input(inputs)   # dieselbe Vorverarbeitung wie beim Vortraining
x = base(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(n_classes, activation="softmax")(x)
model = keras.Model(inputs, outputs)                    # 3 · nur der Kopf lernt</code></pre>
  <div class="merk"><b>Merksatz</b><p>Wenige Bilder? Nicht von null trainieren, sondern ein vortrainiertes Netz einfrieren, einen neuen Kopf trainieren und erst dann vorsichtig fine-tunen. Die Eingaben müssen so vorverarbeitet werden wie beim Vortraining.</p></div>

  <h3 id="cnn-methoden">9 · Übersicht: Schritte und Methoden</h3>
  <p>Die Nummern entsprechen der Grafik «Der ganze Ablauf auf einen Blick». Was hier fehlt (Optimizer, Backpropagation im Detail), steht im Kapitel <a href="#nn-methoden">Neural Networks</a>.</p>
  <div class="tablewrap"><table>
    <tr><th>Schritt</th><th>Methoden zur Wahl</th><th>Wann welche</th><th>Keras</th></tr>
    <tr><td><b>1 · Bilder</b></td><td>Form <code>(H, W, C)</code>, Pixel /255, One-Hot oder Klassennummern, Split</td><td>Graustufen: C = 1. Gleiche Bildgrösse für alle Bilder.</td><td><code>Rescaling</code>, <code>to_categorical</code></td></tr>
    <tr><td><b>2 · Architektur</b></td><td>Conv2D (Filter, Kernel Size, Padding, Stride), MaxPooling oder AveragePooling, Flatten oder GlobalAveragePooling, Dense</td><td>3 × 3-Filter, Padding same, Filter pro Block verdoppeln. Wenige Bilder: Transfer Learning.</td><td><code>Conv2D</code>, <code>MaxPooling2D</code>, <code>keras.applications</code></td></tr>
    <tr><td><b>3 · Loss, Optimizer</b></td><td>(Sparse) Categorical Cross-Entropy, Adam</td><td>Wie beim Dense-Netz.</td><td><code>compile</code></td></tr>
    <tr><td><b>4–7 · Training</b></td><td>Forward Pass, Loss, Backpropagation, Update je Mini-Batch</td><td>Batch Size 32 bis 256; GPU hilft stark.</td><td><code>fit</code></td></tr>
    <tr><td><b>8 · Validation</b></td><td>Data Augmentation, Dropout, Batch Normalization, Early Stopping, kleineres Netz, Fine-Tuning</td><td>Kurven weit auseinander: Overfitting. Augmentation passend zur Aufgabe wählen.</td><td><code>RandomFlip</code>, <code>Dropout</code>, <code>EarlyStopping</code></td></tr>
    <tr><td><b>9 · Test</b></td><td>Accuracy, Confusion Matrix, falsch klassierte Bilder ansehen</td><td>Einmal, wenn das Setup feststeht.</td><td><code>evaluate</code></td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Ein CNN ersetzt die ersten Dense-Schichten durch Conv- und Pooling-Blöcke: lokale Filter mit geteilten Gewichten finden Muster überall im Bild, Pooling verkleinert und vergrössert das Sichtfeld. Gegen Overfitting helfen Data Augmentation, Dropout und Transfer Learning.</p></div>

  <h3 id="cnn-best">10 · Best Practices</h3>
  <p>Ergänzend zu den <a href="#nn-best">Best Practices aus Neural Networks</a> gilt bei Bildern:</p>
  <div class="bp-check">
    <div><b>Vortrainiert oder eigenes Netz?</b><ul>
      <li>Bei wenigen tausend Bildern schlägt Transfer Learning fast immer ein eigenes Netz.</li>
      <li>Das Netz nach Aufgabe und Rahmenbedingungen wählen (Genauigkeit, Grösse, Latenz, Lizenz), nicht nach dem Erscheinungsjahr. MobileNet für Handy und Edge, ResNet oder EfficientNet für den Server.</li>
      <li>Erst den neuen Kopf mit eingefrorener Basis trainieren, dann für Fine-Tuning obere Schichten mit kleiner Learning Rate (etwa 1e-5) freigeben. Batch Normalization dabei im Inferenzmodus lassen (<code>base(x, training=False)</code>).</li>
    </ul></div>
    <div><b>Daten</b><ul>
      <li>Die Vorverarbeitung des vortrainierten Netzes genau übernehmen: Bildgrösse, Normalisierung (<code>preprocess_input</code>), Reihenfolge der Kanäle.</li>
      <li>Augmentation nur im Training, und nur Veränderungen, die es in echt gibt (kein vertikaler Flip bei Ziffern: 6 wird 9).</li>
      <li>Nach Quelle splitten: Bilder derselben Person, desselben Objekts oder derselben Serie gehören alle in denselben Teil.</li>
    </ul></div>
    <div><b>Auswerten</b><ul>
      <li>Falsch klassifizierte Bilder ansehen: Oft zeigen sie Fehler in den Labels oder eine Abkürzung (das Netz erkennt den Hintergrund statt des Objekts).</li>
      <li>Parameter zählen und die Feature-Map-Grössen prüfen, bevor man lange trainiert.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Merksatz</b><p>Zuerst Transfer Learning, die Vorverarbeitung des Netzes übernehmen, nur realistische Augmentation, nach Quelle splitten und die Fehlbilder ansehen.</p></div>
`,
    quiz: [
      { q: `Welche zwei Ideen unterscheiden eine Conv-Schicht von einer Dense-Schicht?`, a: `<b>Lokale Verbindungen:</b> Jedes Neuron sieht nur einen kleinen Ausschnitt (z. B. 3 × 3). <b>Geteilte Gewichte:</b> Derselbe Filter wird an jeder Position verwendet. Dadurch wenige Parameter, Nachbarschaft bleibt erhalten, ein Muster wird überall erkannt.` },
      { q: `Was ist eine Feature Map?`, a: `Die Ausgabe eines Filters über das ganze Bild: an jeder Position die gewichtete Summe aus Fenster und Filter (plus Bias, dann ReLU). Hohe Werte zeigen, wo das Muster des Filters vorkommt.` },
      { q: `Ein 32 × 32-Bild, 3 × 3-Filter, Padding 'valid', Stride 1. Wie gross ist die Ausgabe, und mit 'same'?`, a: `'valid': <code>(32 − 3)/1 + 1 = 30</code>, also 30 × 30. 'same': 32 × 32 (Padding 1 auf jeder Seite).` },
      { q: `Wie viele Parameter hat <code>Conv2D(64, (3, 3))</code> auf einer Eingabe mit 32 Kanälen?`, a: `<code>(3 · 3 · 32 + 1) · 64 = 18'496</code>. Die Höhe und Breite der Eingabe spielen keine Rolle.` },
      { q: `Was macht Max-Pooling 2 × 2, und wie viele Parameter hat es?`, a: `Es nimmt aus jedem 2 × 2-Fenster den grössten Wert: Höhe und Breite halbieren sich, die Kanäle bleiben. Keine Parameter. Es macht das Netz robuster gegen kleine Verschiebungen und vergrössert das Sichtfeld der folgenden Schichten.` },
      { q: `Warum steigt die Zahl der Filter typischerweise von Block zu Block (32 → 64 → 128)?`, a: `Das Bild wird durch Pooling kleiner, die Muster werden komplexer und zahlreicher (Kanten → Texturen → Objektteile). Mehr Filter bei kleinerer Fläche hält den Rechenaufwand pro Schicht etwa gleich.` },
      { q: `Wo stecken bei einem kleinen CNN die meisten Parameter, und wie spart man sie?`, a: `In der ersten Dense-Schicht nach <code>Flatten</code>. <code>GlobalAveragePooling2D</code> statt <code>Flatten</code> oder ein Pooling mehr verkleinern ihre Eingabe stark.` },
      { q: `Was ist Data Augmentation, und wann ist sie aktiv?`, a: `Zufällige Veränderungen der Trainingsbilder (spiegeln, drehen, zoomen, verschieben), damit das Netz robuste Merkmale lernt und weniger overfittet. Nur beim Training; Validation und Test bleiben unverändert.` },
      { q: `Warum ist horizontales Spiegeln bei Ziffern eine schlechte Augmentation?`, a: `Gespiegelte Ziffern sind keine gültigen Ziffern mehr (eine gespiegelte 2 oder 7). Augmentation darf nur Veränderungen erzeugen, nach denen die Klasse dieselbe bleibt.` },
      { q: `Was ist Transfer Learning, und warum friert man die Basis zuerst ein?`, a: `Ein auf vielen Bildern vortrainiertes CNN übernehmen und nur einen neuen Kopf trainieren. Eingefroren, weil die zufälligen Gewichte des neuen Kopfs anfangs grosse Gradienten erzeugen, die die gelernten Filter zerstören würden. Danach optional Fine-Tuning mit sehr kleiner Learning Rate.` },
      { q: `Ein Notebook trainiert mit <code>validation_data=(x_test, y_test)</code>. Was ist das Problem?`, a: `Epochen und Setup werden am Testset gewählt; die Test-Accuracy ist dann keine ehrliche Schätzung mehr. Besser <code>validation_split</code> oder ein eigener Validation-Teil, Test einmal am Schluss.` },
      { q: `Welche Form hat die Eingabe für MNIST-Bilder in einem CNN, und warum?`, a: `<code>(28, 28, 1)</code>. Conv2D erwartet immer eine Kanal-Achse, auch bei Graustufen.` },
    ],
    init() {
      LernApp.demos.cnn();
    },
  });
})();
