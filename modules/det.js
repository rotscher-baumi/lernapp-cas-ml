/* Module: Object Detection & Segmentation (module 3, Computer Vision part I, Fri 20.11., second half; part II is gen.js). Content lives in the html field; the demos live in assets/demos-det.js. */
(function () {
  LernApp.register({
    id: 'det',
    order: 94.2,
    nav: `Object Detection & Segmentation`,
    title: `Object Detection & Segmentation`,
    kicker: `Modul 3 · Computer Vision · Fr 20.11.`,
    summary: `Aufbau eines Detectors (Backbone, Neck, Head, Post-Processing), Faster R-CNN, YOLO, IoU, NMS, Semantic Segmentation (U-Net, SAM)`,
    html: `  <p>Das Kapitel <a href="#cv">Image Processing</a> hat Aufgaben gezeigt, bei denen ein Bild rein- und ein Bild rauskommt. Hier will man wissen, <i>was wo</i> im Bild ist. Es geht um zwei Aufgaben mit räumlicher Ausgabe: eine <b>Liste von Boxen</b> (Object Detection) oder eine <b>Klasse pro Pixel</b> (Semantic Segmentation). Die Bausteine bleiben die aus dem Kapitel <a href="#cnn">CNN</a>: Filter, Feature Maps, Pooling, Backpropagation, dazu vortrainierte Backbones.</p>
  <p class="note">Die Demos rechnen im Browser. Die Kurs-Notebooks (Detection, Segmentation) laufen in Jupyter oder Colab.</p>

  <h3 id="det-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#cnn-ablauf">CNN</a>. Was sich ändert, sind die Aufgabe (Schritt 1), das Modell (2), der Loss (3) und die Metrik in der Validation (8).</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="detFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines Detection- oder Segmentation-Projekts: Bilder und Labels festlegen, Modell wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward Pass, Loss, Backpropagation und Update, danach Validation mit mAP oder IoU und zum Schluss einmal testen">
      ${LernApp.nnFlow({
        id: 'det',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Bilder und Labels', 'Boxen oder Masken'],
          ['Modell wählen', 'Faster R-CNN, YOLO, U-Net, SAM'],
          ['Loss und Optimizer', 'Klasse + Box, CE + Dice'],
          ['Forward Pass', 'Boxen oder Pixel-Klassen'],
          ['Loss berechnen', 'Zuordnung über IoU'],
          ['Backpropagation', 'Gradienten für alle Filter'],
          ['Parameter aktualisieren', 'w ← w − α · ∂L/∂w'],
          ['Validation prüfen', 'mAP, IoU / Dice'],
          ['Einmal testen', 'Testset, neue Szenen'],
        ],
        loopA: ['pro Mini-Batch,', 'viele Epochs'],
        loopB: ['Tuning:', 'Modell, Loss,', 'Augmentation'],
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

  <h3 id="det-detection">1 · Object Detection: Was ist wo?</h3>
  <p>Die Ausgabe ist eine <b>Menge</b> von Vorhersagen, und ihre Grösse ist unbekannt:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = Box (x0, y0, x1, y1)    c = Klasse    s = Score in [0, 1]    k = unbekannt</code></pre>
  <h4 id="det-aufbau">Aufbau eines Detectors: Backbone, Neck, Head, Post-Processing</h4>
  <p>Fast jeder moderne Detector besteht aus vier Teilen, die hintereinander laufen. Jeder verarbeitet nur, was der vorherige liefert. Die Zahlen gelten für einen YOLO-artigen Detector mit 640 × 640 Pixel Input.</p>
  <figure class="fig" id="detArch" style="max-width:900px"><div style="overflow-x:auto"><svg viewBox="0 0 1080 510" style="min-width:720px" role="img" aria-label="Aufbau eines Detectors: Das Backbone verkleinert das Bild zu Feature Maps C3, C4 und C5. Der Neck kombiniert sie top-down und bottom-up zu P3, P4 und P5. Pro Ebene sagt ein Head Box, Objectness und Klasse voraus, zusammen 8400 Kandidaten. Post-Processing reduziert sie mit Score-Threshold und NMS auf wenige Boxen."><rect x="30" y="10" width="90" height="4" rx="2" style="fill:var(--muted)"/><rect x="190" y="10" width="120" height="4" rx="2" style="fill:var(--accent)"/><rect x="430" y="10" width="190" height="4" rx="2" style="fill:var(--ok)"/><rect x="700" y="10" width="120" height="4" rx="2" style="fill:var(--warn)"/><rect x="885" y="10" width="170" height="4" rx="2" style="fill:var(--bad)"/><text class="d-tb" x="75" y="34" style="font-size:16px">Input</text><text class="d-m" x="75" y="54">Pixel</text><text class="d-tb" x="250" y="34" style="font-size:16px">Backbone</text><text class="d-m" x="250" y="54">Pixel → Features</text><text class="d-tb" x="525" y="34" style="font-size:16px">Neck</text><text class="d-m" x="525" y="54">klein + gross kombinieren</text><text class="d-tb" x="760" y="34" style="font-size:16px">Head</text><text class="d-m" x="760" y="54">Features → Zahlen</text><text class="d-tb" x="970" y="34" style="font-size:16px">Post-Processing</text><text class="d-m" x="970" y="54">aufräumen</text><rect class="d-box" x="30" y="345" width="90" height="90" rx="4"/><circle class="d-pg" cx="75" cy="370" r="9"/><path class="d-pg" d="M60 425Q60 385 75 385Q90 385 90 425z"/><text class="d-tm" x="75" y="452" style="font-size:11px">640×640×3</text><line class="d-arr" x1="122" y1="390" x2="202" y2="390"/><text class="d-m" x="162" y="376">Conv-Stufen</text><rect class="d-box" x="214" y="342" width="84" height="84" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="208" y="348" width="84" height="84" rx="3"/><text class="d-tb" x="250" y="382" style="font-size:13px">C3</text><text class="d-tm" x="250" y="400" style="font-size:11px">80×80</text><rect class="d-box" x="224" y="212" width="64" height="64" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="218" y="218" width="64" height="64" rx="3"/><text class="d-tb" x="250" y="242" style="font-size:13px">C4</text><text class="d-tm" x="250" y="260" style="font-size:11px">40×40</text><rect class="d-box" x="232" y="80" width="48" height="48" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="226" y="86" width="48" height="48" rx="3"/><text class="d-tb" x="250" y="102" style="font-size:13px">C5</text><text class="d-tm" x="250" y="120" style="font-size:11px">20×20</text><line class="d-arr" x1="250" y1="346" x2="250" y2="288"/><line class="d-arr" x1="250" y1="216" x2="250" y2="140"/><text class="d-m" x="242" y="318" style="text-anchor:end">stride 2</text><text class="d-m" x="242" y="178" style="text-anchor:end">stride 2</text><text class="d-m" x="250" y="452">Auflösung ↓, Channels ↑</text><line class="d-arr" x1="284" y1="110" x2="438" y2="110"/><line class="d-arr" x1="292" y1="250" x2="438" y2="250"/><line class="d-arr" x1="302" y1="390" x2="438" y2="390"/><text class="d-m" x="362" y="96">grob, viel Bedeutung</text><text class="d-m" x="362" y="376">fein, viele Details</text><text class="d-tm" x="470" y="78" style="font-size:11px">top-down</text><text class="d-tm" x="580" y="78" style="font-size:11px">bottom-up</text><rect class="d-ok" x="442" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="110" style="font-size:13px">T5</text><line class="d-arr" x1="500" y1="110" x2="548" y2="110"/><rect class="d-ok" x="552" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="110" style="font-size:13px">P5</text><line class="d-arr" x1="610" y1="110" x2="696" y2="110"/><rect class="d-ok" x="442" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="250" style="font-size:13px">T4</text><line class="d-arr" x1="500" y1="250" x2="548" y2="250"/><rect class="d-ok" x="552" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="250" style="font-size:13px">P4</text><line class="d-arr" x1="610" y1="250" x2="696" y2="250"/><rect class="d-ok" x="442" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="390" style="font-size:13px">T3</text><line class="d-arr" x1="500" y1="390" x2="548" y2="390"/><rect class="d-ok" x="552" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="390" style="font-size:13px">P3</text><line class="d-arr" x1="610" y1="390" x2="696" y2="390"/><line class="d-arr" x1="470" y1="129" x2="470" y2="229"/><line class="d-arr" x1="470" y1="269" x2="470" y2="369"/><line class="d-arr" x1="580" y1="371" x2="580" y2="271"/><line class="d-arr" x1="580" y1="231" x2="580" y2="131"/><text class="d-m" x="462" y="180" style="text-anchor:end">Upsample</text><text class="d-m d-ml" x="588" y="180">Downsample</text><text class="d-m" x="462" y="320" style="text-anchor:end">Upsample</text><text class="d-m d-ml" x="588" y="320">Downsample</text><rect class="d-warn" x="700" y="85" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="101" style="font-size:13px">Head</text><text class="d-tm" x="760" y="120" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="150">400 · grosse Objekte</text><rect class="d-warn" x="700" y="225" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="241" style="font-size:13px">Head</text><text class="d-tm" x="760" y="260" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="290">1600 · mittlere</text><rect class="d-warn" x="700" y="365" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="381" style="font-size:13px">Head</text><text class="d-tm" x="760" y="400" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="430">6400 · kleine Objekte</text><polyline class="d-ln" points="820,390 850,390 850,110"/><line class="d-ln" x1="820" y1="250" x2="850" y2="250"/><line class="d-arr" x1="820" y1="110" x2="881" y2="110"/><rect x="885" y="88" width="170" height="44" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="101" style="font-size:13px">8400 Kandidaten</text><text class="d-tm" x="970" y="120" style="font-size:11px">viele überlappend</text><rect x="885" y="190" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="206" style="font-size:13px">Score-Threshold</text><text class="d-tm" x="970" y="225" style="font-size:11px">Score &lt; 0.25 → weg</text><rect x="885" y="292" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="308" style="font-size:13px">NMS</text><text class="d-tm" x="970" y="327" style="font-size:11px">IoU &gt; τ → beste bleibt</text><rect x="885" y="394" width="170" height="50" rx="6" style="fill:var(--bad)"/><text class="d-tb" x="970" y="410" style="font-size:13px;fill:var(--surface)">Resultat</text><text class="d-tm" x="970" y="429" style="font-size:11px;fill:var(--surface)">(Box, Klasse, Score)</text><line class="d-arr" x1="970" y1="132" x2="970" y2="188"/><text class="d-m d-ml" x="980" y="160">8400 Boxen</text><line class="d-arr" x1="970" y1="240" x2="970" y2="290"/><text class="d-m d-ml" x="980" y="265">≈ 40 Boxen</text><line class="d-arr" x1="970" y1="342" x2="970" y2="392"/><text class="d-m d-ml" x="980" y="367">3 Boxen</text><path class="d-ln" d="M190 470V480H830V470"/><path class="d-ln" d="M885 470V480H1055V470"/><text class="d-m" x="510" y="498">lernt im Training: Loss auf dem Head-Output passt alle Gewichte an</text><text class="d-m" x="970" y="498">feste Regeln, kein Training</text></svg></div><figcaption>Je tiefer im Backbone, desto kleiner die Feature Map und desto mehr Bedeutung pro Pixel. Der Neck gibt diese Bedeutung top-down an die feinen Maps weiter und die Details bottom-up zurück. Pro Gitterzelle gibt der Head eine Box aus: 80² + 40² + 20² = 8400 Kandidaten. Faster R-CNN hat dieselben Teile, nur arbeitet sein Head in zwei Stufen.</figcaption></figure>
  <ul>
    <li><b>Backbone</b> (z. B. ResNet, CSPDarknet): macht aus Pixeln Feature Maps, zuerst Kanten und Texturen, tiefer Formen und Objektteile. Meist vortrainiert und per Transfer Learning übernommen.</li>
    <li><b>Neck</b> (z. B. FPN, PAN): kombiniert feine und grobe Feature Maps. Kleine Objekte brauchen Details (P3), grosse brauchen Kontext (P5).</li>
    <li><b>Head</b>: sagt pro Gitterzelle Box (x, y, w, h), Objectness und Klassen-Scores voraus. Auf seinem Output wird der Loss berechnet.</li>
    <li><b>Post-Processing</b>: Ein Score-Threshold entfernt unsichere Boxen, NMS die Duplikate (siehe <a href="#det-iou">Abschnitt 2</a>). Dieser Teil wird nicht trainiert; Threshold und τ sind Hyperparameter.</li>
  </ul>
  <p>Schwierig daran: 0 bis etwa 100 Objekte pro Bild, Objekte überlappen sich, sie haben sehr verschiedene Grössen, und jede Vorhersage braucht eine Konfidenz. Es gibt zwei Bauarten:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Zwei Stufen: Faster R-CNN</th><th>Eine Stufe: YOLO (v8)</th></tr>
    <tr><td><b>Ablauf</b></td><td>1. Backbone erzeugt Feature Maps. 2. Das <b>RPN</b> (Region Proposal Network) schlägt Kandidaten-Regionen vor (~2000, nach NMS ~300). 3. Pro Kandidat: Klasse bestimmen und Box verfeinern.</td><td>1. Backbone erzeugt Feature Maps. 2. Köpfe auf mehreren Massstäben. 3. Jede Gitterzelle sagt Klasse und Box voraus; die Zelle mit dem Objektmittelpunkt ist zuständig.</td></tr>
    <tr><td><b>Anker</b></td><td>Pro Position 9 <i>Anker</i> (3 Grössen × 3 Seitenverhältnisse); das Netz sagt Abweichungen davon voraus</td><td>Anchor-free: sagt die Box direkt voraus</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: Objectness + Box; Kopf: Klasse + Box (gemeinsam trainiert)</td><td>Klassen-Loss (BCE) + Box-Loss (CIoU, DFL)</td></tr>
    <tr><td><b>Stärke</b></td><td>Höchste Accuracy, kleine Objekte</td><td>Echtzeit, Edge-Geräte</td></tr>
  </table></div>
  <p>Die Labels im YOLO-Format sind eine Zeile pro Objekt: <code>class_id cx cy w h</code>, alle Koordinaten auf 0 bis 1 normiert. Ein Anker ist nichts anderes als eine vorgegebene Box, die das Netz leicht verschiebt und streckt; so muss es nicht jede Box von Grund auf raten.</p>

  <h3 id="det-iou">2 · IoU und NMS: Treffer zählen und Duplikate entfernen</h3>
  <p><b>IoU</b> (Intersection over Union) misst, wie gut sich zwei Boxen decken: Fläche des Schnitts geteilt durch Fläche der Vereinigung. 0 heisst kein Kontakt, 1 heisst identisch. IoU wird an drei Stellen gebraucht: beim <b>Zuordnen</b> von Ankern zu Ground-Truth-Boxen im Training, als <b>Box-Loss</b>, und bei der <b>Auswertung</b>: Eine Vorhersage zählt als Treffer, wenn ihre IoU mit einer Ground-Truth-Box über einem Threshold liegt (meist 0.5).</p>
  <div class="demo" id="ioDemo">
    <div class="tag">Demo</div><h4>IoU von zwei Boxen</h4>
    <p class="hint">Ziehe die Boxen mit der Maus (oder dem Finger) an eine neue Stelle, die Grösse änderst du am Eckgriff unten rechts. Der grüne Schnitt geteilt durch die Vereinigung ist die IoU. Tastatur: Box mit Tab wählen, Pfeiltasten verschieben, Shift + Pfeiltasten ändern die Grösse.</p>
    <svg class="plot" id="ioSvg" viewBox="0 0 400 300" style="max-width:420px" role="group" aria-label="Zwei verschiebbare Boxen mit grün markiertem Schnitt"></svg>
    <pre><code id="ioCalc"></code></pre>
    <div class="stats"><span>Schnitt <b id="ioI"></b></span><span>Vereinigung <b id="ioU"></b></span><span>IoU <b id="ioV"></b></span></div>
  </div>
  <p>Ein Detector gibt zunächst <b>viele überlappende Boxen</b> für dasselbe Objekt aus. <b>Non-Maximum Suppression (NMS)</b> räumt auf:</p>
  <pre><code>Boxen nach Score sortieren
solange Boxen übrig:
    beste Box behalten
    alle übrigen Boxen mit IoU &gt; τ zur besten entfernen</code></pre>
  <p>Vorher filtert ein <b>Score-Threshold</b> (z. B. 0.25) die unsicheren Boxen weg. NMS läuft pro Klasse: Boxen verschiedener Klassen dürfen sich beliebig überlappen.</p>
  <div class="demo" id="nmDemo">
    <div class="tag">Demo</div><h4>NMS mit verschiebbarem Threshold τ</h4>
    <p class="hint">Fünf Kandidaten für zwei Objekte (Zahl = Score). Grün = behalten, grau gestrichelt = unterdrückt.</p>
    <div class="ctl"><label for="nmT">IoU-Threshold τ</label><input type="range" id="nmT" min="0.05" max="0.95" step="0.05" value="0.5"><output id="nmTO"></output></div>
    <svg class="plot" id="nmSvg" viewBox="0 0 300 150" style="max-width:460px" role="img" aria-label="Fünf Kandidaten-Boxen für zwei Objekte, behaltene Boxen grün"></svg>
    <div class="stats"><span>Behalten <b id="nmN"></b></span></div>
    <p class="hint" id="nmMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Detection = Boxen vorhersagen, dann mit einem Score-Threshold und NMS auf eine saubere Liste reduzieren. Mit IoU wird zugeordnet, trainiert und ausgewertet. Die Metrik <b>mAP</b> mittelt die Precision über Klassen und IoU-Thresholds.</p></div>

  <h3 id="det-seg">3 · Semantic Segmentation: eine Klasse pro Pixel</h3>
  <p>Die Ausgabe hat <b>dieselbe Höhe und Breite wie das Eingabebild</b>: Jeder Pixel bekommt genau eine Klasse (<code>y ∈ {1…C}^(H×W)</code>). Es gibt keine Boxen und keine Einzelobjekte; zwei Autos nebeneinander sind dieselbe Klasse «Auto». Schwierig sind genaue Kanten (jeder falsche Randpixel zählt), starke <b>Klassen-Imbalance</b> (Hintergrund oft über 95 % der Pixel, ein naives Netz sagt überall «Hintergrund»), die Mischung kleiner und grosser Strukturen und die Kosten pixelgenauer Labels (10- bis 100-mal teurer als Boxen).</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>U-Net</th><th>SAM (Segment Anything)</th></tr>
    <tr><td><b>Idee</b></td><td>Encoder-Decoder mit Skip Connections. Der Encoder versteht, <i>was</i> im Bild ist; der Decoder macht daraus wieder eine Karte in voller Auflösung, die Skips liefern die genauen Kanten.</td><td>Foundation Model, einmal auf einer Milliarde Masken trainiert. Man gibt einen <b>Prompt</b> (Punkt, Box, Maske, Text) und bekommt die Maske des Objekts.</td></tr>
    <tr><td><b>Training</b></td><td>Auf den eigenen Labels, ein Modell pro Aufgabe</td><td>Keines nötig (zero-shot)</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-Entropy + λ · Dice</td><td>–</td></tr>
    <tr><td><b>Grenze</b></td><td>Braucht Labels, wenig übertragbar</td><td>Kennt keine Klassennamen, nur «Objekt»; für Klassen mit einem Klassifikator kombinieren</td></tr>
  </table></div>
  <p><b>Dice</b> misst die Überlappung von vorhergesagter und wahrer Maske: <code>2·|A∩B| / (|A| + |B|)</code>. Als Loss ergänzt er die Cross-Entropy, weil er seltene Klassen nicht wegmittelt: Ein Netz, das überall «Hintergrund» sagt, hat hohe Pixel-Accuracy, aber Dice 0 für das Objekt. Es gilt <code>Dice = 2·IoU / (1 + IoU)</code>, also Dice ≥ IoU. Ausgewertet wird mit der <b>IoU</b> pro Klasse (gemittelt: mIoU).</p>
  <div class="falle"><b>Falle</b><p>Pixel-Accuracy ist bei Segmentation fast wertlos. Bei 95 % Hintergrund erreicht «alles Hintergrund» 95 %. Immer IoU oder Dice pro Klasse berichten.</p></div>

  <h3 id="det-methoden">4 · Übersicht: Aufgaben, Modelle, Loss, Metrik</h3>
  <p>Die Zeilen entsprechen den Schritten 1 bis 3 und 8 der Grafik «Der ganze Ablauf auf einen Blick».</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Ausgabe</th><th>Modelle</th><th>Loss</th><th>Metrik</th></tr>
    <tr><td><b>Object Detection</b></td><td>Boxen, Klassen, Scores</td><td>Faster R-CNN, YOLO</td><td>Klasse (BCE/CE) + Box (IoU-basiert)</td><td>mAP@IoU</td></tr>
    <tr><td><b>Semantic Segmentation</b></td><td>Klasse pro Pixel</td><td>U-Net, SAM</td><td>Cross-Entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Detection gibt Boxen aus, Segmentation eine Karte mit einer Klasse pro Pixel. Beide werden mit IoU gemessen: Detection pro Box (mAP@IoU), Segmentation pro Klasse (mIoU). Vortrainierte Backbones tauchen überall auf.</p></div>

  <h3 id="det-best">5 · Best Practices</h3>
  <p>Ergänzend zu den <a href="#cnn-best">Best Practices aus CNN</a> gilt bei Detection und Segmentation:</p>
  <div class="bp-check">
    <div><b>Baseline und Modellwahl</b><ul>
      <li>Ein vortrainiertes Modell zuerst zero-shot auf den eigenen Bildern testen und erst fine-tunen, wenn eine Lücke bleibt und passende Daten da sind.</li>
      <li>Das neueste Modell ist nicht automatisch das beste: Es zählt, ob es für deine Aufgabe, deine Bilder und deine Hardware gebaut ist.</li>
    </ul></div>
    <div><b>Daten und Labels</b><ul>
      <li>Bei Detection und Segmentation die Annotationen prüfen und nach Szene oder Video splitten, nicht nach einzelnen Frames.</li>
      <li>Trainingsbilder an den Einsatzort anpassen: Fertige Modelle und Datensätze bestehen meist aus sauberen Bildern. Sind die Bilder im Einsatz unscharf, verrauscht oder haben sie einen Blaustich, die sauberen Bilder genau so verändern (Blur, Rauschen, Farbstich) und damit fine-tunen.</li>
      <li>Domain Shift beachten: Ein Modell, das auf Fotos gelernt hat, hilft bei Röntgen- oder Mikroskopbildern wenig.</li>
      <li>Bei Segmentation auf Klassen-Imbalance achten: seltene Klassen mit Dice-Loss oder Gewichten stärken.</li>
    </ul></div>
    <div><b>Fair vergleichen</b><ul>
      <li>Alle Verfahren auf denselben Testbildern mit derselben Metrik messen, dazu Laufzeit und Zahl der Parameter.</li>
      <li>Bei Detection mAP mit dem IoU-Threshold angeben (mAP@0.5 oder mAP@0.5:0.95), bei Segmentation IoU oder Dice pro Klasse.</li>
      <li>Boxen und Masken auf Beispielbildern ansehen: Eine gute mAP kann systematische Fehler verbergen, z. B. bei kleinen oder verdeckten Objekten.</li>
    </ul></div>
    <div><b>Grenzen</b><ul>
      <li>Score-Threshold und NMS-Threshold τ auf der Validation wählen, nicht auf dem Testset.</li>
      <li>Auch auf Bildern anderer Kameras und Lichtverhältnisse testen, bevor das Modell eingesetzt wird.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Merksatz</b><p>Vortrainierte Modelle zuerst zero-shot prüfen, Annotationen kontrollieren und nach Szene splitten, mAP immer mit IoU-Threshold angeben und Thresholds auf der Validation wählen.</p></div>
`,
    quiz: [
      { q: `Welche Aufgabe haben Backbone, Neck, Head und Post-Processing in einem Detector?`, a: `<b>Backbone:</b> macht aus Pixeln Feature Maps. <b>Neck:</b> kombiniert feine und grobe Feature Maps für kleine und grosse Objekte. <b>Head:</b> sagt pro Gitterzelle Box, Objectness und Klasse voraus. <b>Post-Processing:</b> Score-Threshold und NMS entfernen unsichere Boxen und Duplikate; dieser Teil wird nicht trainiert.` },
      { q: `Was ist der Unterschied zwischen Klassifikation und Object Detection bei der Ausgabe?`, a: `Klassifikation: ein Label pro Bild. Detection: eine Menge von (Box, Klasse, Score) mit unbekannter Anzahl, die vom Bild abhängt.` },
      { q: `Berechne die IoU: Box A hat Fläche 100, Box B Fläche 100, der Schnitt 50.`, a: `Vereinigung = 100 + 100 − 50 = 150, IoU = 50 / 150 = 0.33. Bei einem Threshold von 0.5 wäre das kein Treffer.` },
      { q: `Was macht NMS, und was passiert bei einem zu tiefen Threshold τ?`, a: `NMS behält die Box mit dem höchsten Score, entfernt alle anderen, die mit ihr eine IoU über τ haben, und wiederholt das mit den übrigen Boxen. Bei zu tiefem τ werden auch Boxen echter Nachbarobjekte unterdrückt; bei zu hohem bleiben Duplikate.` },
      { q: `Faster R-CNN oder YOLO: wann welches?`, a: `Faster R-CNN (zwei Stufen), wenn höchste Accuracy und kleine Objekte zählen. YOLO (eine Stufe, anchor-free), wenn Geschwindigkeit zählt, z. B. Echtzeit oder Edge-Geräte.` },
      { q: `Was ist ein Anker?`, a: `Eine vorgegebene Box (Grösse und Seitenverhältnis) an jeder Position der Feature Map. Das Netz sagt nur voraus, ob dort ein Objekt ist und wie die Box verschoben und gestreckt werden muss.` },
      { q: `Wie unterscheidet sich Semantic Segmentation von Detection?`, a: `Die Ausgabe ist eine Klasse pro Pixel in der Grösse des Bildes, ohne Boxen und ohne Unterscheidung von Einzelobjekten derselben Klasse.` },
      { q: `Warum ist Pixel-Accuracy bei Segmentation irreführend, und was nimmt man stattdessen?`, a: `Der Hintergrund macht oft über 95 % der Pixel aus; «alles Hintergrund» hätte 95 % Accuracy. Besser IoU oder Dice pro Klasse (mIoU), und Dice als Loss neben der Cross-Entropy.` },
      { q: `Was ist der Unterschied zwischen U-Net und SAM?`, a: `U-Net wird auf eigenen Labels pro Aufgabe trainiert. SAM ist einmal auf sehr vielen Masken trainiert und segmentiert per Prompt (Punkt, Box) ohne neues Training, kennt aber keine Klassennamen.` },
    ],
    init() {
      LernApp.demos.det();
    },
  });
})();
