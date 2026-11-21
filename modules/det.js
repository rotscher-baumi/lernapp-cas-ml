/* Module: Object Detection & Segmentation (module 3, Computer Vision part I, Fri 20.11., second half; part II is gen.js). Content lives in the html field; the figures (LernApp.detFig) and demos live in assets/demos-det.js. */
(function () {
  const F = LernApp.detFig;
  LernApp.register({
    id: 'det',
    order: 94.2,
    nav: `Object Detection & Segmentation`,
    title: `Object Detection & Segmentation`,
    kicker: `Modul 3 · Computer Vision · Fr 20.11.`,
    summary: `Vier Aufgaben (Klassifikation bis Instance Segmentation), Box-Formate und Labels, Aufbau eines Detectors, Faster R-CNN, YOLO, IoU, NMS, mAP, Semantic Segmentation, U-Net, SAM`,
    html: `  <p>Das Kapitel <a href="#cv">Image Processing</a> hat Aufgaben gezeigt, bei denen ein Bild rein- und ein Bild rauskommt. Hier will man wissen, <i>was wo</i> im Bild ist. Die Ausgabe ist räumlich: eine <b>Liste von Boxen</b> (Object Detection), eine <b>Klasse pro Pixel</b> (Semantic Segmentation) oder eine <b>Maske pro Objekt</b> (Instance Segmentation). Die Bausteine bleiben die aus dem Kapitel <a href="#cnn">CNN</a>: Filter, Feature Maps, Pooling, Backpropagation, dazu vortrainierte Backbones.</p>
  <p class="note">Die Demos rechnen im Browser. Die Kurs-Notebooks (Detection mit YOLOv8, Segmentation) laufen in Jupyter oder Colab.</p>

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

  <h3 id="det-aufgaben">1 · Vier Aufgaben: vom Label zur Maske</h3>
  <p>Dieselbe Strassenszene, vier Fragen. Von links oben nach rechts unten wird die Ausgabe immer feiner: ein Wort, dann Rechtecke, dann eine Farbe für jeden Pixel, zuletzt eine eigene Maske für jedes einzelne Objekt.</p>
  <figure class="fig" style="max-width:640px">${F.tasks()}<figcaption>Klassifikation sagt nur, <i>was</i> im Bild ist. Detection sagt zusätzlich, <i>wo</i>, aber nur als Rechteck. Semantic Segmentation ordnet jeden Pixel einer Klasse zu, unterscheidet aber die zwei Personen nicht. Instance Segmentation trennt sie und lässt dafür Hintergrund wie Strasse und Baum meist weg.</figcaption></figure>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Frage</th><th>Ausgabe</th><th>Labels</th><th>Typische Modelle</th></tr>
    <tr><td><b>Klassifikation</b></td><td>Was ist im Bild?</td><td>ein Label (+ Score)</td><td>eine Klasse pro Bild</td><td>ResNet, EfficientNet (<a href="#cnn">CNN</a>)</td></tr>
    <tr><td><b>Object Detection</b></td><td>Was ist wo?</td><td>Boxen mit Klasse und Score</td><td>Boxen, z. B. YOLO-<code>.txt</code></td><td>Faster R-CNN, YOLO</td></tr>
    <tr><td><b>Semantic Segmentation</b></td><td>Welche Klasse hat jeder Pixel?</td><td>Karte H × W mit Klassen-IDs</td><td>Maske als PNG</td><td>U-Net, DeepLab</td></tr>
    <tr><td><b>Instance Segmentation</b></td><td>Welche Pixel gehören zu welchem Objekt?</td><td>Box + Maske pro Objekt</td><td>Polygon oder Maske pro Objekt</td><td>Mask R-CNN, YOLOv8-seg</td></tr>
  </table></div>
  <p>Daneben gibt es <b>Panoptic Segmentation</b> (Semantic und Instance zusammen: jeder Pixel bekommt eine Klasse, zählbare Objekte zusätzlich eine Nummer) und klassenlose Masken auf Zuruf mit <a href="#det-sam">SAM</a>. Je feiner die Ausgabe, desto teurer die Labels: Eine Box ist in Sekunden gezogen, eine pixelgenaue Maske braucht ein Vielfaches.</p>
  <div class="merk"><b>Merksatz</b><p>Die Aufgabe bestimmt Ausgabe, Labels, Modell und Metrik. Erst festlegen, was man wirklich braucht: Für «wie viele Autos?» reichen Boxen; für «welche Fläche ist Strasse?» braucht es eine Maske.</p></div>

  <h3 id="det-detection">2 · Object Detection: Ausgabe, Labels, Aufbau</h3>
  <p>Die Ausgabe ist eine <b>Menge</b> von Vorhersagen, und ihre Grösse ist unbekannt:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = Box (x0, y0, x1, y1)    c = Klasse    s = Score in [0, 1]    k = unbekannt</code></pre>
  <p>Schwierig daran: 0 bis etwa 100 Objekte pro Bild, Objekte überlappen sich, sie haben sehr verschiedene Grössen, und jede Vorhersage braucht eine Konfidenz. Ein normales Netz hat aber eine feste Zahl von Ausgängen. Die Lösung aller modernen Detectors: sehr viele Kandidaten an festen Stellen vorhersagen und danach die schlechten wegwerfen.</p>

  <h4 id="det-labels">Box-Formate und Labels</h4>
  <p>Eine Box hat vier Zahlen, aber jede Bibliothek schreibt sie anders. Verwechselte Formate sind einer der häufigsten Fehler: Das Training läuft, aber die Boxen landen daneben.</p>
  <div class="demo" id="bfDemo">
    <div class="tag">Demo</div><h4>Eine Box, drei Formate</h4>
    <p class="hint">Ziehe die orange Box an eine andere Stelle oder ändere ihre Grösse am Eckgriff unten rechts. Darunter steht dieselbe Box in den drei üblichen Formaten. Tastatur: Box mit Tab wählen, Pfeiltasten verschieben, Shift + Pfeiltasten ändern die Grösse.</p>
    <svg class="plot" id="bfSvg" viewBox="0 0 320 240" style="max-width:420px" role="group" aria-label="Strassenszene mit einer verschiebbaren Box um das Auto"></svg>
    <pre><code id="bfOut"></code></pre>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Format</th><th>Zahlen</th><th>Einheit</th><th>Wo</th></tr>
    <tr><td><b>xyxy</b></td><td>linke obere und rechte untere Ecke</td><td>Pixel</td><td>Pascal VOC, torchvision, Ausgabe von <code>boxes.xyxy</code></td></tr>
    <tr><td><b>xywh</b></td><td>linke obere Ecke, Breite, Höhe</td><td>Pixel</td><td>COCO-JSON</td></tr>
    <tr><td><b>YOLO</b></td><td>Klasse, Mittelpunkt, Breite, Höhe</td><td>0 bis 1 (geteilt durch Bildbreite bzw. -höhe)</td><td>eine <code>.txt</code> pro Bild, eine Zeile pro Objekt</td></tr>
  </table></div>
  <p>Ein YOLO-Datensatz besteht aus zwei parallelen Ordnern und einer Beschreibung. Zu <code>images/train/bild001.jpg</code> gehört <code>labels/train/bild001.txt</code>; ein Bild ohne Objekte bekommt eine leere Datei.</p>
  <pre><code># labels/train/bild001.txt     class cx cy w h  (eine Zeile pro Objekt)
2 0.300 0.675 0.425 0.317
0 0.609 0.593 0.073 0.387

# data.yaml
path: datasets/strasse
train: images/train
val: images/val
names: {0: person, 1: bicycle, 2: car}</code></pre>
  <div class="merk"><b>Woher weiss das Modell, dass 2 «car» heisst?</b><p>Gar nicht. Das Netz gibt nur Zahlen aus: Ausgang 2 hat den höchsten Score. Die Übersetzung in einen Namen macht die Liste <code>names</code>, die beim Labeln festgelegt wurde und mit dem Modell gespeichert wird (bei YOLO in der <code>.pt</code>-Datei als <code>model.names</code>, bei torchvision in <code>weights.meta["categories"]</code>, bei Keras meist nur im eigenen Code). Das <i>Wissen</i>, wie ein Auto aussieht, steckt in den Gewichten; die Labels braucht man nur im Training als Sollantwort für den Loss. Vertauscht man die Liste, erkennt das Modell weiterhin richtig, beschriftet aber falsch.</p></div>

  <h4 id="det-aufbau">Aufbau eines Detectors: Backbone, Neck, Head, Post-Processing</h4>
  <p>Fast jeder moderne Detector besteht aus vier Teilen, die hintereinander laufen. Jeder verarbeitet nur, was der vorherige liefert. Die Zahlen gelten für einen YOLO-artigen Detector mit 640 × 640 Pixel Input.</p>
  <figure class="fig" id="detArch" style="max-width:900px"><div style="overflow-x:auto"><svg viewBox="0 0 1080 510" style="min-width:720px" role="img" aria-label="Aufbau eines Detectors: Das Backbone verkleinert das Bild zu Feature Maps C3, C4 und C5. Der Neck kombiniert sie top-down und bottom-up zu P3, P4 und P5. Pro Ebene sagt ein Head Box, Objectness und Klasse voraus, zusammen 8400 Kandidaten. Post-Processing reduziert sie mit Score-Threshold und NMS auf wenige Boxen."><rect x="30" y="10" width="90" height="4" rx="2" style="fill:var(--muted)"/><rect x="190" y="10" width="120" height="4" rx="2" style="fill:var(--accent)"/><rect x="430" y="10" width="190" height="4" rx="2" style="fill:var(--ok)"/><rect x="700" y="10" width="120" height="4" rx="2" style="fill:var(--warn)"/><rect x="885" y="10" width="170" height="4" rx="2" style="fill:var(--bad)"/><text class="d-tb" x="75" y="34" style="font-size:16px">Input</text><text class="d-m" x="75" y="54">Pixel</text><text class="d-tb" x="250" y="34" style="font-size:16px">Backbone</text><text class="d-m" x="250" y="54">Pixel → Features</text><text class="d-tb" x="525" y="34" style="font-size:16px">Neck</text><text class="d-m" x="525" y="54">klein + gross kombinieren</text><text class="d-tb" x="760" y="34" style="font-size:16px">Head</text><text class="d-m" x="760" y="54">Features → Zahlen</text><text class="d-tb" x="970" y="34" style="font-size:16px">Post-Processing</text><text class="d-m" x="970" y="54">aufräumen</text><rect class="d-box" x="30" y="345" width="90" height="90" rx="4"/><circle class="d-pg" cx="75" cy="370" r="9"/><path class="d-pg" d="M60 425Q60 385 75 385Q90 385 90 425z"/><text class="d-tm" x="75" y="452" style="font-size:11px">640×640×3</text><line class="d-arr" x1="122" y1="390" x2="202" y2="390"/><text class="d-m" x="162" y="376">Conv-Stufen</text><rect class="d-box" x="214" y="342" width="84" height="84" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="208" y="348" width="84" height="84" rx="3"/><text class="d-tb" x="250" y="382" style="font-size:13px">C3</text><text class="d-tm" x="250" y="400" style="font-size:11px">80×80</text><rect class="d-box" x="224" y="212" width="64" height="64" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="218" y="218" width="64" height="64" rx="3"/><text class="d-tb" x="250" y="242" style="font-size:13px">C4</text><text class="d-tm" x="250" y="260" style="font-size:11px">40×40</text><rect class="d-box" x="232" y="80" width="48" height="48" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="226" y="86" width="48" height="48" rx="3"/><text class="d-tb" x="250" y="102" style="font-size:13px">C5</text><text class="d-tm" x="250" y="120" style="font-size:11px">20×20</text><line class="d-arr" x1="250" y1="346" x2="250" y2="288"/><line class="d-arr" x1="250" y1="216" x2="250" y2="140"/><text class="d-m" x="242" y="318" style="text-anchor:end">stride 2</text><text class="d-m" x="242" y="178" style="text-anchor:end">stride 2</text><text class="d-m" x="250" y="452">Auflösung ↓, Channels ↑</text><line class="d-arr" x1="284" y1="110" x2="438" y2="110"/><line class="d-arr" x1="292" y1="250" x2="438" y2="250"/><line class="d-arr" x1="302" y1="390" x2="438" y2="390"/><text class="d-m" x="362" y="96">grob, viel Bedeutung</text><text class="d-m" x="362" y="376">fein, viele Details</text><text class="d-tm" x="470" y="78" style="font-size:11px">top-down</text><text class="d-tm" x="580" y="78" style="font-size:11px">bottom-up</text><rect class="d-ok" x="442" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="110" style="font-size:13px">T5</text><line class="d-arr" x1="500" y1="110" x2="548" y2="110"/><rect class="d-ok" x="552" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="110" style="font-size:13px">P5</text><line class="d-arr" x1="610" y1="110" x2="696" y2="110"/><rect class="d-ok" x="442" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="250" style="font-size:13px">T4</text><line class="d-arr" x1="500" y1="250" x2="548" y2="250"/><rect class="d-ok" x="552" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="250" style="font-size:13px">P4</text><line class="d-arr" x1="610" y1="250" x2="696" y2="250"/><rect class="d-ok" x="442" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="390" style="font-size:13px">T3</text><line class="d-arr" x1="500" y1="390" x2="548" y2="390"/><rect class="d-ok" x="552" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="390" style="font-size:13px">P3</text><line class="d-arr" x1="610" y1="390" x2="696" y2="390"/><line class="d-arr" x1="470" y1="129" x2="470" y2="229"/><line class="d-arr" x1="470" y1="269" x2="470" y2="369"/><line class="d-arr" x1="580" y1="371" x2="580" y2="271"/><line class="d-arr" x1="580" y1="231" x2="580" y2="131"/><text class="d-m" x="462" y="180" style="text-anchor:end">Upsample</text><text class="d-m d-ml" x="588" y="180">Downsample</text><text class="d-m" x="462" y="320" style="text-anchor:end">Upsample</text><text class="d-m d-ml" x="588" y="320">Downsample</text><rect class="d-warn" x="700" y="85" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="101" style="font-size:13px">Head</text><text class="d-tm" x="760" y="120" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="150">400 · grosse Objekte</text><rect class="d-warn" x="700" y="225" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="241" style="font-size:13px">Head</text><text class="d-tm" x="760" y="260" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="290">1600 · mittlere</text><rect class="d-warn" x="700" y="365" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="381" style="font-size:13px">Head</text><text class="d-tm" x="760" y="400" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="430">6400 · kleine Objekte</text><polyline class="d-ln" points="820,390 850,390 850,110"/><line class="d-ln" x1="820" y1="250" x2="850" y2="250"/><line class="d-arr" x1="820" y1="110" x2="881" y2="110"/><rect x="885" y="88" width="170" height="44" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="101" style="font-size:13px">8400 Kandidaten</text><text class="d-tm" x="970" y="120" style="font-size:11px">viele überlappend</text><rect x="885" y="190" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="206" style="font-size:13px">Score-Threshold</text><text class="d-tm" x="970" y="225" style="font-size:11px">Score &lt; 0.25 → weg</text><rect x="885" y="292" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="308" style="font-size:13px">NMS</text><text class="d-tm" x="970" y="327" style="font-size:11px">IoU &gt; τ → beste bleibt</text><rect x="885" y="394" width="170" height="50" rx="6" style="fill:var(--bad)"/><text class="d-tb" x="970" y="410" style="font-size:13px;fill:var(--surface)">Resultat</text><text class="d-tm" x="970" y="429" style="font-size:11px;fill:var(--surface)">(Box, Klasse, Score)</text><line class="d-arr" x1="970" y1="132" x2="970" y2="188"/><text class="d-m d-ml" x="980" y="160">8400 Boxen</text><line class="d-arr" x1="970" y1="240" x2="970" y2="290"/><text class="d-m d-ml" x="980" y="265">≈ 40 Boxen</text><line class="d-arr" x1="970" y1="342" x2="970" y2="392"/><text class="d-m d-ml" x="980" y="367">3 Boxen</text><path class="d-ln" d="M190 470V480H830V470"/><path class="d-ln" d="M885 470V480H1055V470"/><text class="d-m" x="510" y="498">lernt im Training: Loss auf dem Head-Output passt alle Gewichte an</text><text class="d-m" x="970" y="498">feste Regeln, kein Training</text></svg></div><figcaption>Je tiefer im Backbone, desto kleiner die Feature Map und desto mehr Bedeutung pro Pixel. Der Neck gibt diese Bedeutung top-down an die feinen Maps weiter und die Details bottom-up zurück. Pro Gitterzelle gibt der Head eine Box aus: 80² + 40² + 20² = 8400 Kandidaten. Faster R-CNN hat dieselben Teile, nur arbeitet sein Head in zwei Stufen.</figcaption></figure>
  <ul>
    <li><b>Backbone</b> (z. B. ResNet, CSPDarknet): macht aus Pixeln Feature Maps, zuerst Kanten und Texturen, tiefer Formen und Objektteile. Meist vortrainiert und per Transfer Learning übernommen.</li>
    <li><b>Neck</b> (z. B. FPN, PAN): kombiniert feine und grobe Feature Maps. Kleine Objekte brauchen Details (P3), grosse brauchen Kontext (P5).</li>
    <li><b>Head</b>: sagt pro Gitterzelle Box (x, y, w, h), Objectness und Klassen-Scores voraus. Auf seinem Output wird der Loss berechnet.</li>
    <li><b>Post-Processing</b>: Ein Score-Threshold entfernt unsichere Boxen, NMS die Duplikate (siehe <a href="#det-iou">Abschnitt 4</a>). Dieser Teil wird nicht trainiert; Threshold und τ sind Hyperparameter.</li>
  </ul>

  <h3 id="det-modelle">3 · Faster R-CNN und YOLO: zwei Stufen oder eine</h3>
  <p>Die beiden bekanntesten Detector-Familien unterscheiden sich vor allem darin, <i>wie oft</i> sie auf das Bild schauen. Faster R-CNN schlägt zuerst Regionen vor und prüft dann jede einzeln. YOLO («You Only Look Once») sagt alles in einem einzigen Forward Pass voraus.</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Zwei Stufen: Faster R-CNN</th><th>Eine Stufe: YOLO (v8)</th></tr>
    <tr><td><b>Ablauf</b></td><td>1. Backbone + FPN erzeugen Feature Maps. 2. Das <b>RPN</b> (Region Proposal Network) schlägt Kandidaten-Regionen vor. 3. Pro Kandidat: Features ausschneiden (RoI Align), Klasse bestimmen und Box verfeinern.</td><td>1. Backbone erzeugt Feature Maps. 2. Der Neck kombiniert drei Massstäbe. 3. Pro Gitterpunkt sagt der Head direkt Box und Klassen-Scores voraus.</td></tr>
    <tr><td><b>Anker</b></td><td>Vorgegebene Boxen (im Original 9 pro Position); das Netz sagt Abweichungen davon voraus</td><td>Anchor-free: sagt pro Gitterpunkt die Abstände zu den vier Box-Kanten voraus</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: Objectness + Box; Head: Klasse + Box (gemeinsam trainiert)</td><td>Klassen-Loss (BCE) + Box-Loss (CIoU, DFL)</td></tr>
    <tr><td><b>Tempo</b></td><td>langsamer: typisch einige bis 20 Bilder pro Sekunde auf der GPU</td><td>Dutzende bis Hunderte Bilder pro Sekunde, auch auf Edge-Geräten</td></tr>
    <tr><td><b>Stärke</b></td><td>Genau, gut bei kleinen und dicht gedrängten Objekten</td><td>Echtzeit, Video, einfach zu trainieren und zu exportieren</td></tr>
    <tr><td><b>Bibliothek</b></td><td><code>torchvision.models.detection</code>, Detectron2</td><td><code>ultralytics</code></td></tr>
  </table></div>

  <h4 id="det-rcnn">Faster R-CNN: erst vorschlagen, dann prüfen</h4>
  <figure class="fig" style="max-width:900px"><div style="overflow-x:auto">${F.rcnn()}</div><figcaption>Stufe 1 fragt nur: «Ist hier irgendein Objekt?» Stufe 2 schaut sich die besten Vorschläge genauer an. Der Head kennt C Klassen plus «Hintergrund», damit er einen falschen Vorschlag verwerfen kann.</figcaption></figure>
  <p>Das <b>Region Proposal Network</b> (RPN) ist ein kleines Conv-Netz, das über alle Feature Maps gleitet. An jeder Position liegen <b>Anker</b>: vorgegebene Boxen in mehreren Grössen und Seitenverhältnissen. Für jeden Anker sagt das RPN zwei Dinge voraus: wie wahrscheinlich dort ein Objekt ist (Objectness) und wie der Anker verschoben und gestreckt werden muss. Die besten Vorschläge (einige hundert bis 2000) überleben eine erste NMS.</p>
  <div class="grid2">
    <figure class="fig" style="margin:0">${F.anchors()}<figcaption>Im Training lernt der Anker mit der höchsten IoU zur Ground-Truth-Box (und jeder über etwa 0.7) dieses Objekt; Anker unter etwa 0.3 lernen «Hintergrund». Mit FPN gibt es pro Ebene nur eine Grösse und drei Seitenverhältnisse; die Grösse kommt von der Ebene.</figcaption></figure>
    <div>
      <p><b>RoI Align</b> schneidet für jeden Vorschlag den passenden Teil der Feature Map aus und bringt ihn auf eine feste Grösse (7 × 7). So kann ein normaler Head mit fester Eingabe jede Region klassifizieren, egal wie gross sie im Bild ist. «Align» heisst: Die Koordinaten werden nicht auf ganze Pixel gerundet, sondern bilinear interpoliert; das macht die Boxen genauer.</p>
      <p>Der <b>Head</b> gibt pro Region C + 1 Klassen-Scores (inklusive Hintergrund) und eine Feinkorrektur der Box pro Klasse aus. Zum Schluss läuft NMS pro Klasse.</p>
      <p><b>Mask R-CNN</b> ist Faster R-CNN mit einem dritten Ausgang: einer kleinen Maske (28 × 28) pro Region. So wird aus dem Detector ein Modell für Instance Segmentation.</p>
    </div>
  </div>
  <pre><code>from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2, FasterRCNN_ResNet50_FPN_V2_Weights
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

w = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT           # vortrainiert auf COCO
model = fasterrcnn_resnet50_fpn_v2(weights=w).eval()
out = model([w.transforms()(img)])[0]                     # dict: boxes (xyxy), labels, scores
names = w.meta["categories"]                              # Index → Name

# Fine-Tuning auf 3 eigene Klassen: nur den Head ersetzen (+ 1 für den Hintergrund)
n_in = model.roi_heads.box_predictor.cls_score.in_features
model.roi_heads.box_predictor = FastRCNNPredictor(n_in, 3 + 1)</code></pre>

  <h4 id="det-yolo">YOLO: ein Blick, ein Gitter</h4>
  <p>YOLO legt über das Bild Gitter in drei Massstäben: bei 640 × 640 Pixeln 80 × 80 (Stride 8, P3), 40 × 40 (Stride 16, P4) und 20 × 20 (Stride 32, P5). Jede Zelle hat einen <b>Ankerpunkt</b> in ihrer Mitte, und für jeden Ankerpunkt sagt der Head eine Box und die Klassen-Scores voraus. Das ergibt die 8400 Kandidaten aus der Grafik oben.</p>
  <p>Wer lernt welches Objekt? In den frühen Versionen (YOLOv1 bis v3) war die Zelle mit dem Objektmittelpunkt zuständig. YOLOv8 nimmt alle Ankerpunkte, die <i>in</i> der Ground-Truth-Box liegen, und wählt davon die besten aus (Task-Aligned Assigner: hoher Klassen-Score <i>und</i> hohe IoU). Ein kleines Objekt hat nur auf dem feinen Gitter Ankerpunkte in seiner Box; darum übernimmt P3 die kleinen und P5 die grossen Objekte.</p>
  <div class="demo" id="ygDemo">
    <div class="tag">Demo</div><h4>Gitter, Stride und Ankerpunkte</h4>
    <p class="hint">Wähle eine Ebene und ziehe die grüne Box (Objekt) herum, am Eckgriff änderst du die Grösse. Orange: die Zelle mit dem Mittelpunkt. Blau: alle Ankerpunkte in der Box, die Kandidaten für dieses Objekt. Mach die Box klein und wechsle auf P5.</p>
    <div class="btnrow" id="ygLv" role="group" aria-label="Ebene"><button data-v="8" aria-pressed="false">P3 · 80 × 80</button><button data-v="16" class="pri" aria-pressed="true">P4 · 40 × 40</button><button data-v="32" aria-pressed="false">P5 · 20 × 20</button></div>
    <svg class="plot" id="ygSvg" viewBox="0 0 320 320" style="max-width:380px" role="group" aria-label="Bild 640 × 640 mit Gitter und einer verschiebbaren Objekt-Box"></svg>
    <div class="stats"><span>Gitter <b id="ygG"></b></span><span>Stride <b id="ygS"></b></span><span>Box <b id="ygB"></b></span><span>Mittelpunkt <b id="ygC"></b></span><span>Ankerpunkte in der Box <b id="ygN"></b></span></div>
    <p class="hint" id="ygMsg"></p>
  </div>
  <p>Für jeden Ankerpunkt sagt der Head vier Abstände voraus: wie weit die linke, obere, rechte und untere Kante der Box entfernt sind (in Vielfachen des Strides). Daraus wird die Box. Der <b>Loss</b> hat drei Teile: Klassen-Loss (BCE, pro Klasse ja/nein), Box-Loss mit <b>CIoU</b> (IoU plus Strafen für verschobene Mittelpunkte und falsches Seitenverhältnis) und <b>DFL</b> (Distribution Focal Loss, macht die Kanten genauer).</p>
  <div class="tablewrap"><table>
    <tr><th>YOLOv8</th><th>Parameter</th><th>mAP@0.5:0.95 (COCO)</th><th>Einsatz</th></tr>
    <tr><td><b>n</b> (nano)</td><td>3.2 Mio.</td><td>37.3</td><td>Raspberry Pi, Smartphone, schnelle Versuche</td></tr>
    <tr><td><b>s</b> (small)</td><td>11.2 Mio.</td><td>44.9</td><td>Edge mit Beschleuniger</td></tr>
    <tr><td><b>m</b> (medium)</td><td>25.9 Mio.</td><td>50.2</td><td>guter Kompromiss auf der GPU</td></tr>
    <tr><td><b>l</b> / <b>x</b></td><td>43.7 / 68.2 Mio.</td><td>52.9 / 53.9</td><td>höchste Accuracy, Server-GPU</td></tr>
  </table></div>
  <p class="note">Werte laut Ultralytics für 640 × 640 Pixel auf COCO val2017. Neuere Versionen (YOLO11 usw.) verschieben die Zahlen, das Prinzip bleibt.</p>
  <pre><code>from ultralytics import YOLO

model = YOLO("yolov8n.pt")                                # vortrainiert auf COCO (80 Klassen)
res = model("strasse.jpg", conf=0.25, iou=0.7)[0]         # Score-Threshold und NMS-τ
for b in res.boxes:
    print(model.names[int(b.cls)], round(float(b.conf), 2), b.xyxy[0].tolist())

model.train(data="data.yaml", epochs=50, imgsz=640)       # Fine-Tuning: Head passt sich an names an
metrics = model.val()                                     # metrics.box.map50, metrics.box.map</code></pre>
  <div class="falle"><b>Falle</b><p>YOLO skaliert jedes Bild auf <code>imgsz</code> (Standard 640). Ein 4000 Pixel breites Foto mit einem 40 Pixel grossen Objekt wird um den Faktor 6 verkleinert; das Objekt ist danach kaum 7 Pixel gross und fällt durch alle Gitter. Abhilfe: grösseres <code>imgsz</code> oder das Bild in Kacheln (Tiles) zerlegen.</p></div>

  <h3 id="det-iou">4 · IoU und NMS: Treffer zählen und Duplikate entfernen</h3>
  <p><b>IoU</b> (Intersection over Union) misst, wie gut sich zwei Boxen decken: Fläche des Schnitts geteilt durch Fläche der Vereinigung. 0 heisst kein Kontakt, 1 heisst identisch. IoU wird an drei Stellen gebraucht: beim <b>Zuordnen</b> von Ankern zu Ground-Truth-Boxen im Training, als <b>Box-Loss</b>, und bei der <b>Auswertung</b>: Eine Vorhersage zählt als Treffer, wenn ihre IoU mit einer Ground-Truth-Box über einem Threshold liegt (meist 0.5).</p>
  <pre><code>IoU = |A ∩ B| / |A ∪ B| = Schnitt / (Fläche A + Fläche B − Schnitt)</code></pre>
  <div class="demo" id="ioDemo">
    <div class="tag">Demo</div><h4>IoU von zwei Boxen</h4>
    <p class="hint">Ziehe die Boxen mit der Maus (oder dem Finger) an eine neue Stelle, die Grösse änderst du am Eckgriff unten rechts. Der grüne Schnitt geteilt durch die Vereinigung ist die IoU. Tastatur: Box mit Tab wählen, Pfeiltasten verschieben, Shift + Pfeiltasten ändern die Grösse.</p>
    <svg class="plot" id="ioSvg" viewBox="0 0 400 300" style="max-width:420px" role="group" aria-label="Zwei verschiebbare Boxen mit grün markiertem Schnitt"></svg>
    <pre><code id="ioCalc"></code></pre>
    <div class="stats"><span>Schnitt <b id="ioI"></b></span><span>Vereinigung <b id="ioU"></b></span><span>IoU <b id="ioV"></b></span></div>
  </div>
  <p>IoU ist strenger, als es aussieht: Zwei gleich grosse Boxen, die um ein Drittel ihrer Breite verschoben sind, haben nur noch IoU 0.5. Ein Detector gibt zunächst <b>viele überlappende Boxen</b> für dasselbe Objekt aus. <b>Non-Maximum Suppression (NMS)</b> räumt auf:</p>
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
  <div class="merk"><b>Merksatz</b><p>Detection = viele Boxen vorhersagen, dann mit einem Score-Threshold und NMS auf eine saubere Liste reduzieren. Mit IoU wird zugeordnet, trainiert und ausgewertet.</p></div>

  <h3 id="det-map">5 · Auswertung: Precision, Recall, mAP</h3>
  <p>Bei Detection gibt es keine feste Zahl von Vorhersagen, darum zählt man anders als bei der <a href="#klass">Klassifikation</a>. Pro Klasse werden die Vorhersagen nach Score sortiert und der Reihe nach den Ground-Truth-Boxen zugeordnet:</p>
  <ul>
    <li><b>TP</b> (True Positive): IoU mit einer noch freien Ground-Truth-Box ≥ Threshold (z. B. 0.5).</li>
    <li><b>FP</b> (False Positive): keine passende Box, oder die Box wurde schon von einer besseren Vorhersage beansprucht (ein Duplikat).</li>
    <li><b>FN</b> (False Negative): eine Ground-Truth-Box, die keine Vorhersage getroffen hat. TN gibt es nicht: Man kann die Stellen ohne Objekt nicht zählen.</li>
  </ul>
  <p>Daraus folgen <b>Precision</b> = TP / (TP + FP) (wie viele Boxen stimmen?) und <b>Recall</b> = TP / (TP + FN) (wie viele Objekte wurden gefunden?). Beide hängen vom Score-Threshold ab. Die <b>Average Precision (AP)</b> nimmt alle Thresholds auf einmal: Sie ist die Fläche unter der Precision-Recall-Kurve.</p>
  <div class="demo" id="apDemo">
    <div class="tag">Demo</div><h4>Precision, Recall und AP</h4>
    <p class="hint">Ein Bild mit 6 Personen, der Detector liefert 10 Boxen, nach Score sortiert. Verschiebe den Score-Threshold: Nur die Boxen darüber zählen (oben in der Tabelle). Der orange Ring zeigt, wo du auf der Kurve stehst; die blaue Fläche ist die AP.</p>
    <div class="ctl"><label for="apT">Score-Threshold</label><input type="range" id="apT" min="0.05" max="0.95" step="0.05" value="0.5"><output id="apTO"></output></div>
    <svg class="plot" id="apSvg" viewBox="0 0 320 232" style="max-width:420px" role="img" aria-label="Precision-Recall-Kurve mit der Fläche AP und dem Punkt des gewählten Score-Thresholds"></svg>
    <div class="stats"><span>TP <b id="apTP"></b></span><span>FP <b id="apFP"></b></span><span>FN <b id="apFN"></b></span><span>Precision <b id="apP"></b></span><span>Recall <b id="apR"></b></span><span>AP <b id="apAP"></b></span></div>
    <p class="hint" id="apMsg"></p>
    <div class="tablewrap"><table id="apTab"></table></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Kennzahl</th><th>Bedeutung</th><th>Wo</th></tr>
    <tr><td><b>AP</b></td><td>Fläche unter der Precision-Recall-Kurve einer Klasse (die Precision wird von rechts her geglättet: höchste Precision bei gleichem oder höherem Recall)</td><td>pro Klasse</td></tr>
    <tr><td><b>mAP</b></td><td>Mittelwert der AP über alle Klassen</td><td>Standard-Kennzahl</td></tr>
    <tr><td><b>mAP@0.5</b></td><td>Treffer ab IoU 0.5; verzeiht ungenaue Boxen</td><td>Pascal VOC, YOLO-Ausgabe <code>mAP50</code></td></tr>
    <tr><td><b>mAP@0.5:0.95</b></td><td>Mittel über 10 IoU-Thresholds 0.5, 0.55, … 0.95; belohnt genaue Boxen</td><td>COCO, YOLO-Ausgabe <code>mAP50-95</code></td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Precision und Recall gelten für einen Threshold, AP für alle zusammen. Eine mAP-Zahl ohne IoU-Threshold ist nichts wert: 0.65 bei mAP@0.5 kann 0.40 bei mAP@0.5:0.95 sein.</p></div>

  <h3 id="det-seg">6 · Semantic Segmentation: eine Klasse pro Pixel</h3>
  <p>Die Ausgabe hat <b>dieselbe Höhe und Breite wie das Eingabebild</b>: Jeder Pixel bekommt genau eine Klasse (<code>y ∈ {1…C}^(H×W)</code>). Es gibt keine Boxen und keine Einzelobjekte; zwei Autos nebeneinander sind dieselbe Klasse «Auto». Schwierig sind genaue Kanten (jeder falsche Randpixel zählt), starke <b>Klassen-Imbalance</b> (Hintergrund oft über 95 % der Pixel, ein naives Netz sagt überall «Hintergrund»), die Mischung kleiner und grosser Strukturen und die Kosten pixelgenauer Labels (10- bis 100-mal teurer als Boxen).</p>
  <figure class="fig" style="max-width:760px"><div style="overflow-x:auto">${F.mask()}</div><figcaption>Eine Maske ist selbst ein Bild: ein Channel, in jedem Pixel eine Klassen-ID. Sie wird als PNG gespeichert, weil JPEG die Werte an den Kanten verändern würde (aus Klasse 2 würde 1 oder 3). Die Farben sind nur für Menschen; das Netz sieht die Zahlen.</figcaption></figure>
  <p>Das Netz gibt pro Pixel C Scores aus, also einen Tensor H × W × C. Softmax macht daraus Wahrscheinlichkeiten, <code>argmax</code> über die Channels die Maske. Der Loss ist die Cross-Entropy, Pixel für Pixel gemittelt, meist ergänzt durch Dice.</p>
  <p><b>Dice</b> misst die Überlappung von vorhergesagter und wahrer Maske: <code>2·|A∩B| / (|A| + |B|)</code>. Als Loss ergänzt er die Cross-Entropy, weil er seltene Klassen nicht wegmittelt: Ein Netz, das überall «Hintergrund» sagt, hat hohe Pixel-Accuracy, aber Dice 0 für das Objekt. Es gilt <code>Dice = 2·IoU / (1 + IoU)</code>, also Dice ≥ IoU. Ausgewertet wird mit der <b>IoU</b> pro Klasse (gemittelt: mIoU).</p>
  <div class="demo" id="smDemo">
    <div class="tag">Demo</div><h4>Pixel-Accuracy, IoU und Dice</h4>
    <p class="hint">Eine Maske mit 20 × 14 Pixeln, das Objekt ist klein. Wähle eine Vorhersage oder klicke Pixel an, um sie umzuschalten. Grün = richtig als Objekt (TP), orange = zu viel (FP), rot = verpasst (FN), weiss = richtig Hintergrund.</p>
    <div class="btnrow" id="smPre" role="group" aria-label="Vorhersage"><button data-v="good" class="pri" aria-pressed="true">Gut</button><button data-v="big" aria-pressed="false">Zu gross</button><button data-v="shift" aria-pressed="false">Verschoben</button><button data-v="empty" aria-pressed="false">Alles Hintergrund</button></div>
    <svg class="plot" id="smSvg" viewBox="0 0 320 224" style="max-width:420px" role="img" aria-label="Maske mit 20 × 14 Pixeln, eingefärbt nach TP, FP, FN und TN"></svg>
    <div class="stats"><span>Pixel-Accuracy <b id="smAcc"></b></span><span>IoU Objekt <b id="smIoU"></b></span><span>Dice Objekt <b id="smDice"></b></span><span>IoU Hintergrund <b id="smIoB"></b></span><span>mIoU <b id="smM"></b></span></div>
    <p class="hint" id="smMsg"></p>
  </div>
  <div class="falle"><b>Falle</b><p>Pixel-Accuracy ist bei Segmentation fast wertlos. Bei 95 % Hintergrund erreicht «alles Hintergrund» 95 %. Immer IoU oder Dice pro Klasse berichten.</p></div>

  <h3 id="det-segmodelle">7 · U-Net und SAM: trainieren oder fragen</h3>
  <p>Für Segmentation gibt es zwei Wege. Mit <b>U-Net</b> trainiert man ein eigenes Netz auf eigenen Masken, genau für eine Aufgabe. Mit <b>SAM</b> nimmt man ein fertiges Foundation Model und sagt ihm per Klick, welches Objekt man will.</p>

  <h4 id="det-unet">U-Net: Encoder, Decoder, Skip Connections</h4>
  <figure class="fig" style="max-width:860px"><div style="overflow-x:auto">${F.unet()}</div><figcaption>Der Encoder ist ein normales CNN: Er verkleinert das Bild und lernt, <i>was</i> darin ist. Der Decoder vergrössert wieder bis zur vollen Auflösung. Ohne die Skip Connections (blau gestrichelt) wären die Kanten verschwommen, weil die genaue Lage im Engpass verloren geht.</figcaption></figure>
  <p>U-Net wurde 2015 für medizinische Bilder entwickelt und lernt schon mit wenigen hundert Bildern gute Masken, weil die Skip Connections die feinen Details nicht erst lernen müssen. Dieselbe Architektur dient auch der <a href="#cv-restauration">Restauration</a> (Denoising, Deblurring): Dann ist die Ausgabe ein Bild statt einer Klassenkarte. Die Bildgrösse muss durch 2<sup>Tiefe</sup> teilbar sein (hier 16), sonst passen Encoder- und Decoder-Maps beim Anhängen nicht zusammen.</p>
  <pre><code>def conv_block(x, f):                                    # 2× Conv 3 × 3 mit ReLU
    x = layers.Conv2D(f, 3, padding="same", activation="relu")(x)
    return layers.Conv2D(f, 3, padding="same", activation="relu")(x)

inputs = keras.Input((256, 256, 3)); x = inputs; skips = []
for f in [64, 128, 256, 512]:                            # Encoder
    x = conv_block(x, f); skips.append(x)
    x = layers.MaxPooling2D()(x)
x = conv_block(x, 1024)                                  # Engpass
for f, s in zip([512, 256, 128, 64], reversed(skips)):   # Decoder
    x = layers.Conv2DTranspose(f, 2, strides=2)(x)
    x = conv_block(layers.Concatenate()([x, s]), f)      # Skip Connection
outputs = layers.Conv2D(C, 1, activation="softmax")(x)   # C Klassen pro Pixel</code></pre>

  <h4 id="det-sam">SAM: Segment Anything per Prompt</h4>
  <figure class="fig" style="max-width:900px"><div style="overflow-x:auto">${F.sam()}</div><figcaption>Der teure Teil (Image Encoder) läuft einmal pro Bild. Jeder weitere Klick braucht nur den leichten Mask Decoder; darum reagiert SAM beim Labeln fast sofort.</figcaption></figure>
  <p><b>SAM</b> (Segment Anything Model, Meta 2023) wurde auf dem Datensatz SA-1B trainiert: 11 Millionen Bilder mit 1.1 Milliarden Masken. Es kennt dadurch Objektgrenzen fast überall, auch auf Bildarten, die es nie gesehen hat (zero-shot). Man gibt einen <b>Prompt</b>: einen oder mehrere Punkte (Vordergrund oder Hintergrund), eine Box oder eine grobe Maske. Ein Punkt ist mehrdeutig (Hemd, Person oder Gruppe?), darum liefert SAM drei Masken mit einem geschätzten IoU-Score.</p>
  <p>SAM kennt <b>keine Klassennamen</b>: Es sagt «hier ist ein Objekt», nicht «hier ist ein Auto». Für Klassen kombiniert man es mit einem Detector: Die Boxen von YOLO oder einem Text-Detector (z. B. Grounding DINO) dienen als Prompts, SAM macht daraus genaue Masken. Sehr nützlich ist SAM auch zum <b>Labeln</b>: Ein Klick statt eines mühsam gezeichneten Polygons, danach trainiert man ein kleines, schnelles Modell wie U-Net oder YOLOv8-seg auf diesen Masken.</p>
  <pre><code>from segment_anything import sam_model_registry, SamPredictor

sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")
predictor = SamPredictor(sam)
predictor.set_image(img)                                 # Image Encoder: einmal pro Bild (RGB, HWC)
masks, scores, _ = predictor.predict(
    point_coords=np.array([[320, 240]]),                 # ein Klick (x, y)
    point_labels=np.array([1]),                          # 1 = Vordergrund, 0 = Hintergrund
    multimask_output=True)                               # drei Masken mit Score
best = masks[scores.argmax()]</code></pre>
  <div class="tablewrap"><table>
    <tr><th></th><th>U-Net</th><th>SAM (Segment Anything)</th></tr>
    <tr><td><b>Idee</b></td><td>Encoder-Decoder mit Skip Connections. Der Encoder versteht, <i>was</i> im Bild ist; der Decoder macht daraus wieder eine Karte in voller Auflösung, die Skips liefern die genauen Kanten.</td><td>Foundation Model, einmal auf einer Milliarde Masken trainiert. Man gibt einen <b>Prompt</b> (Punkt, Box, Maske) und bekommt die Maske des Objekts.</td></tr>
    <tr><td><b>Training</b></td><td>Auf den eigenen Labels, ein Modell pro Aufgabe</td><td>Keines nötig (zero-shot)</td></tr>
    <tr><td><b>Ausgabe</b></td><td>Klasse pro Pixel</td><td>Masken ohne Klassennamen, pro Prompt</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-Entropy + λ · Dice</td><td>–</td></tr>
    <tr><td><b>Grösse</b></td><td>klein, läuft auch auf Edge-Geräten</td><td>gross (ViT-B bis ViT-H, rund 90 bis 640 Mio. Parameter)</td></tr>
    <tr><td><b>Grenze</b></td><td>Braucht Labels, wenig übertragbar</td><td>Kennt keine Klassen; für Klassen mit einem Detector oder Klassifikator kombinieren</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>U-Net trainiert man für eine Aufgabe, SAM fragt man per Prompt. In der Praxis ergänzen sie sich: SAM erstellt schnell die Masken, ein kleines Netz lernt daraus die Aufgabe.</p></div>

  <h3 id="det-methoden">8 · Übersicht: Aufgaben, Modelle, Loss, Metrik</h3>
  <p>Die Zeilen entsprechen den Schritten 1 bis 3 und 8 der Grafik «Der ganze Ablauf auf einen Blick».</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Ausgabe</th><th>Modelle</th><th>Loss</th><th>Metrik</th></tr>
    <tr><td><b>Object Detection</b></td><td>Boxen, Klassen, Scores</td><td>Faster R-CNN, YOLO</td><td>Klasse (BCE/CE) + Box (IoU-basiert)</td><td>mAP@0.5, mAP@0.5:0.95</td></tr>
    <tr><td><b>Semantic Segmentation</b></td><td>Klasse pro Pixel</td><td>U-Net, DeepLab</td><td>Cross-Entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
    <tr><td><b>Instance Segmentation</b></td><td>Box + Maske pro Objekt</td><td>Mask R-CNN, YOLOv8-seg</td><td>Detection-Loss + Masken-Loss (BCE)</td><td>Mask-mAP</td></tr>
    <tr><td><b>Masken per Prompt</b></td><td>Maske ohne Klasse</td><td>SAM</td><td>– (fertig trainiert)</td><td>IoU zur Referenzmaske</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Detection gibt Boxen aus, Segmentation eine Karte mit einer Klasse pro Pixel. Beide werden mit IoU gemessen: Detection pro Box (mAP@IoU), Segmentation pro Klasse (mIoU). Vortrainierte Backbones tauchen überall auf.</p></div>

  <h3 id="det-best">9 · Best Practices</h3>
  <p>Ergänzend zu den <a href="#cnn-best">Best Practices aus CNN</a> gilt bei Detection und Segmentation:</p>
  <div class="bp-check">
    <div><b>Baseline und Modellwahl</b><ul>
      <li>Ein vortrainiertes Modell zuerst zero-shot auf den eigenen Bildern testen und erst fine-tunen, wenn eine Lücke bleibt und passende Daten da sind.</li>
      <li>Mit dem kleinsten Modell anfangen (YOLOv8n): Es trainiert in Minuten und zeigt, ob Daten und Labels stimmen. Erst dann grösser werden.</li>
      <li>Das neueste Modell ist nicht automatisch das beste: Es zählt, ob es für deine Aufgabe, deine Bilder und deine Hardware gebaut ist.</li>
    </ul></div>
    <div><b>Daten und Labels</b><ul>
      <li>Annotationen prüfen: einige Bilder mit eingezeichneten Boxen oder Masken ansehen, bevor das Training startet. Falsches Box-Format oder vertauschte Klassen-IDs fallen so sofort auf.</li>
      <li>Nach Szene oder Video splitten, nicht nach einzelnen Frames: Fast gleiche Frames in Train und Test machen die mAP zu gut.</li>
      <li>Trainingsbilder an den Einsatzort anpassen: Fertige Modelle und Datensätze bestehen meist aus sauberen Bildern. Sind die Bilder im Einsatz unscharf, verrauscht oder haben sie einen Blaustich, die sauberen Bilder genau so verändern (Blur, Rauschen, Farbstich) und damit fine-tunen.</li>
      <li>Domain Shift beachten: Ein Modell, das auf Fotos gelernt hat, hilft bei Röntgen- oder Mikroskopbildern wenig.</li>
      <li>Kleine Objekte: <code>imgsz</code> erhöhen oder in Kacheln arbeiten, statt grosse Bilder auf 640 Pixel zu verkleinern.</li>
      <li>Bei Segmentation auf Klassen-Imbalance achten: seltene Klassen mit Dice-Loss oder Gewichten stärken. Masken mit SAM vorlabeln spart viel Zeit.</li>
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
  <div class="merk"><b>Merksatz</b><p>Vortrainierte Modelle zuerst zero-shot prüfen, klein anfangen, Annotationen kontrollieren und nach Szene splitten, mAP immer mit IoU-Threshold angeben und Thresholds auf der Validation wählen.</p></div>
`,
    quiz: [
      { q: `Was unterscheidet Semantic Segmentation von Instance Segmentation?`, a: `Semantic Segmentation gibt jedem Pixel eine Klasse; zwei Personen nebeneinander sind dieselbe Fläche «Person». Instance Segmentation gibt jedem Objekt eine eigene Maske und trennt die beiden Personen.` },
      { q: `Welche Aufgabe haben Backbone, Neck, Head und Post-Processing in einem Detector?`, a: `<b>Backbone:</b> macht aus Pixeln Feature Maps. <b>Neck:</b> kombiniert feine und grobe Feature Maps für kleine und grosse Objekte. <b>Head:</b> sagt pro Gitterzelle Box, Objectness und Klasse voraus. <b>Post-Processing:</b> Score-Threshold und NMS entfernen unsichere Boxen und Duplikate; dieser Teil wird nicht trainiert.` },
      { q: `Was ist der Unterschied zwischen Klassifikation und Object Detection bei der Ausgabe?`, a: `Klassifikation: ein Label pro Bild. Detection: eine Menge von (Box, Klasse, Score) mit unbekannter Anzahl, die vom Bild abhängt.` },
      { q: `Ein Bild ist 640 × 480 Pixel gross, die Box geht von (64, 120) bis (320, 360). Wie lautet die YOLO-Zeile für Klasse 2?`, a: `Breite 256, Höhe 240, Mittelpunkt (192, 240). Normiert: cx = 192 / 640 = 0.3, cy = 240 / 480 = 0.5, w = 256 / 640 = 0.4, h = 240 / 480 = 0.5. Zeile: <code>2 0.3 0.5 0.4 0.5</code>.` },
      { q: `Woher weiss ein YOLO-Modell, dass Ausgang 2 «car» bedeutet?`, a: `Das Netz kennt keine Namen, es gibt nur Scores pro Ausgang aus. Die Liste <code>names</code> aus <code>data.yaml</code> wird mit dem Modell gespeichert (<code>model.names</code>) und übersetzt den Index in den Namen.` },
      { q: `Berechne die IoU: Box A hat Fläche 100, Box B Fläche 100, der Schnitt 50.`, a: `Vereinigung = 100 + 100 − 50 = 150, IoU = 50 / 150 = 0.33. Bei einem Threshold von 0.5 wäre das kein Treffer.` },
      { q: `Was macht NMS, und was passiert bei einem zu tiefen Threshold τ?`, a: `NMS behält die Box mit dem höchsten Score, entfernt alle anderen, die mit ihr eine IoU über τ haben, und wiederholt das mit den übrigen Boxen. Bei zu tiefem τ werden auch Boxen echter Nachbarobjekte unterdrückt; bei zu hohem bleiben Duplikate.` },
      { q: `Faster R-CNN oder YOLO: wann welches?`, a: `Faster R-CNN (zwei Stufen), wenn höchste Accuracy und kleine, dicht gedrängte Objekte zählen. YOLO (eine Stufe, anchor-free), wenn Geschwindigkeit zählt, z. B. Echtzeit, Video oder Edge-Geräte.` },
      { q: `Was ist ein Anker, und welcher Anker lernt ein Objekt?`, a: `Eine vorgegebene Box (Grösse und Seitenverhältnis) an jeder Position der Feature Map. Das Netz sagt nur voraus, ob dort ein Objekt ist und wie die Box verschoben und gestreckt werden muss. Im Training lernt der Anker mit der höchsten IoU zur Ground-Truth-Box (und jeder über etwa 0.7) das Objekt.` },
      { q: `Wozu dient RoI Align in Faster R-CNN?`, a: `Es schneidet für jeden Vorschlag den passenden Teil der Feature Map aus und bringt ihn auf eine feste Grösse (z. B. 7 × 7), ohne die Koordinaten zu runden. So kann ein Head mit fester Eingabe Regionen jeder Grösse klassifizieren.` },
      { q: `Warum hat YOLO Gitter in drei Massstäben?`, a: `Ein kleines Objekt hat nur auf dem feinen Gitter (Stride 8) Ankerpunkte in seiner Box, ein grosses braucht den Kontext des groben Gitters (Stride 32). So deckt das Modell kleine, mittlere und grosse Objekte ab.` },
      { q: `Warum ändert sich die AP nicht, wenn man den Score-Threshold verschiebt?`, a: `AP ist die Fläche unter der ganzen Precision-Recall-Kurve, die aus allen Thresholds entsteht. Der Threshold wählt nur einen Punkt auf dieser Kurve, also ein Paar aus Precision und Recall.` },
      { q: `Was ist der Unterschied zwischen mAP@0.5 und mAP@0.5:0.95?`, a: `mAP@0.5 zählt eine Box ab IoU 0.5 als Treffer und verzeiht ungenaue Boxen. mAP@0.5:0.95 mittelt über zehn IoU-Thresholds von 0.5 bis 0.95 und belohnt genaue Boxen; die Zahl ist darum tiefer.` },
      { q: `Wie unterscheidet sich Semantic Segmentation von Detection?`, a: `Die Ausgabe ist eine Klasse pro Pixel in der Grösse des Bildes, ohne Boxen und ohne Unterscheidung von Einzelobjekten derselben Klasse.` },
      { q: `Warum ist Pixel-Accuracy bei Segmentation irreführend, und was nimmt man stattdessen?`, a: `Der Hintergrund macht oft über 95 % der Pixel aus; «alles Hintergrund» hätte 95 % Accuracy. Besser IoU oder Dice pro Klasse (mIoU), und Dice als Loss neben der Cross-Entropy.` },
      { q: `Wozu dienen die Skip Connections im U-Net?`, a: `Sie führen die fein aufgelösten Feature Maps des Encoders direkt zum Decoder. Dort werden sie angehängt, damit die genauen Kanten nicht aus dem groben Engpass rekonstruiert werden müssen.` },
      { q: `Was ist der Unterschied zwischen U-Net und SAM?`, a: `U-Net wird auf eigenen Labels pro Aufgabe trainiert und gibt Klassen pro Pixel aus. SAM ist einmal auf sehr vielen Masken trainiert und segmentiert per Prompt (Punkt, Box) ohne neues Training, kennt aber keine Klassennamen.` },
      { q: `Warum gibt SAM bei einem einzigen Klick drei Masken zurück?`, a: `Ein Punkt ist mehrdeutig: Er kann einen Teil (Hemd), das ganze Objekt (Person) oder eine Gruppe meinen. SAM gibt drei Masken mit einem geschätzten IoU-Score zurück; man nimmt die passende.` },
      { q: `Ein vortrainierter Detektor (COCO) erkennt deine Fabrikteile schlecht. Warum, und was tust du?`, a: `Domain Shift: Das Modell kennt Alltagsfotos, nicht deine Teile und deine Bedingungen. Eigene Bilder aus der Einsatzumgebung labeln und das Modell nachtrainieren, mit wenig Daten nur den Head (Feature Extraction), mit mehr Daten Fine-Tuning mit kleiner Learning Rate.` },
    ],
    init() {
      LernApp.demos.det();
    },
  });
})();
