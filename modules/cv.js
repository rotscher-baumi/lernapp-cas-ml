/* Module: Computer Vision (Modul 3, Teil 3). Content lives in the html field; the demos live in assets/demos-cv.js. */
(function () {
  LernApp.register({
    id: 'cv',
    order: 94,
    nav: 'Computer Vision',
    title: `Computer Vision`,
    kicker: `Modul 3 · Deep Learning, Teil 3`,
    summary: `Bildentstehung, denoising, deblurring, super-resolution, Object Detection (IoU, NMS, Faster R-CNN, YOLO), Semantic Segmentation (U-Net, SAM)`,
    html: `  <p>Das Kapitel <a href="#cnn">CNN</a> hat gezeigt, wie ein Netz Bilder <i>klassifiziert</i>: ein Bild rein, ein Label raus. Computer Vision umfasst mehr. Hier geht es um drei Aufgaben, bei denen die Ausgabe selbst räumlich ist: ein <b>besseres Bild</b> (Restauration), eine <b>Liste von Boxen</b> (Object Detection) oder eine <b>Klasse pro Pixel</b> (Semantic Segmentation). Die Bausteine bleiben die aus dem CNN-Kapitel: filter, feature maps, Pooling, Backpropagation.</p>
  <p class="note">Die Demos rechnen im Browser mit kleinen Beispielbildern. Die Kurs-Notebooks (Bildgrundlagen, denoising, deblurring, super-resolution, Detection, Segmentation) laufen in Jupyter oder Colab.</p>

  <h3 id="cv-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#cnn-ablauf">CNN</a>. Was sich ändert, sind die Aufgabe (Schritt 1), das Modell (2), der Loss (3) und die Metrik in der Validation (8).</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="cvFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines Computer-Vision-Projekts: Aufgabe und Bilder festlegen, Modell wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward pass, Loss, Backpropagation und Update, danach Validation mit aufgabenspezifischer Metrik und zum Schluss einmal testen">
      ${LernApp.nnFlow({
        id: 'cv',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Bilder und Aufgabe', 'Restauration, Detection, Segmentation'],
          ['Modell wählen', 'U-Net, Faster R-CNN, YOLO, SAM'],
          ['Loss und Optimizer', 'L1, IoU-Loss, Cross-Entropy + Dice'],
          ['Forward pass', 'Bild, Boxen oder Pixel-Klassen'],
          ['Loss berechnen', 'Abstand zum Ziel (Bild, Box, Maske)'],
          ['Backpropagation', 'Gradienten für alle filter'],
          ['Parameter aktualisieren', 'w ← w − α · ∂L/∂w'],
          ['Validation prüfen', 'PSNR, mAP, IoU / Dice'],
          ['Einmal testen', 'Testset, auch fremde Kameras'],
        ],
        loopA: ['pro Mini-Batch,', 'viele epochs'],
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

  <h3 id="cv-bild">1 · Wie ein Bild entsteht (und warum es nie perfekt ist)</h3>
  <p>Licht geht durch die Optik, trifft den Sensor, wird verstärkt und digitalisiert (Licht → Elektronen → Spannung → Zahlen). Jede Stufe verschlechtert das Bild ein wenig. Vereinfacht beschreibt das ein Modell:</p>
  <pre><code>I(x, y) = f(x, y) ⊛ h(x, y) + n(x, y)</code></pre>
  <ul>
    <li><b>f</b> ist das ideale Bild, das wir gerne hätten.</li>
    <li><b>h</b> ist die <b>PSF</b> (point spread function): wie die Optik einen Punkt verschmiert. <code>⊛</code> ist die Faltung, also dieselbe Operation wie bei einem filter. Bewegung, falscher Fokus oder eine zittrige Hand erzeugen <b>Unschärfe</b>.</li>
    <li><b>n</b> ist <b>Rauschen</b> (Sensor, Elektronik, wenig Licht).</li>
    <li><b>I</b> ist das, was wir tatsächlich aufnehmen.</li>
  </ul>
  <p>Im Rechner ist ein Bild eine Zahlentabelle: ein Graustufenbild eine Matrix H × W mit Werten von 0 bis 1 (oder 0 bis 255), ein Farbbild hat drei channels (RGB). PyTorch erwartet <code>[C, H, W]</code>, ein Mini-Batch <code>[B, C, H, W]</code>.</p>
  <p>Die drei Restaurationsaufgaben kehren je einen Teil davon um: <b>denoising</b> entfernt n, <b>deblurring</b> macht die Faltung mit h rückgängig, <b>super-resolution</b> rekonstruiert Details, die beim Verkleinern verloren gingen (aliasing). Alle drei sind <i>schlecht gestellt</i>: Aus I gibt es viele mögliche f. Darum braucht man Vorwissen über «wie sehen echte Bilder aus», klassisch als filter-Regeln, heute aus Daten gelernt.</p>
  <div class="demo" id="rcvDemo">
    <div class="tag">Demo</div><h4>Ein Bild verschlechtern und mit einem filter reparieren</h4>
    <p class="hint">Verschlechtere das 16 × 16-Testbild mit Unschärfe und Rauschen, dann wähle einen Restaurations-filter. PSNR (in dB, höher ist besser) misst den Abstand zum Original. Probiere «Salz und Pfeffer» mit dem Median-filter.</p>
    <div class="ctl"><label for="rcvB">Unschärfe (Durchgänge)</label><input type="range" id="rcvB" min="0" max="3" step="1" value="0"><output id="rcvBO"></output></div>
    <div class="ctl"><label for="rcvS">Rauschstärke</label><input type="range" id="rcvS" min="0" max="0.5" step="0.05" value="0.15"><output id="rcvSO"></output></div>
    <div class="btnrow" id="rcvKind" role="group" aria-label="Rauschart"><button data-v="gauss" class="pri" aria-pressed="true">Gauss-Rauschen</button><button data-v="sp" aria-pressed="false">Salz und Pfeffer</button></div>
    <div class="btnrow" id="rcvFix" role="group" aria-label="Restaurations-filter"><button data-v="none" class="pri" aria-pressed="true">Kein filter</button><button data-v="mean" aria-pressed="false">Mittelwert 3×3</button><button data-v="median" aria-pressed="false">Median 3×3</button></div>
    <svg class="plot" id="rcvSvg" viewBox="0 0 590 210" style="max-width:640px" role="img" aria-label="Originalbild, verschlechterte Aufnahme und restauriertes Bild mit PSNR"></svg>
    <p class="hint" id="rcvMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Aufnahme = Original, verschmiert, plus Rauschen. Jeder filter tauscht etwas gegen etwas: Der Mittelwert-filter glättet Rauschen, verschmiert aber Kanten. Der Median-filter ist bei Ausreissern (Salz und Pfeffer) besser, weil ein einzelner extremer Pixel den Median nicht verschiebt.</p></div>

  <h3 id="cv-restauration">2 · Restauration: denoising, deblurring, super-resolution</h3>
  <p>Alle drei Aufgaben sind «Bild rein, Bild raus». Pro Aufgabe gibt es klassische Methoden und Deep Learning.</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Klassisch</th><th>Deep Learning</th></tr>
    <tr><td><b>denoising</b></td><td>Gauss-filter, Bilateral-filter (erhält Kanten), Non-Local Means, BM3D (Transform-Domäne)</td><td>CNN mit Skip Connections (U-Net), Transformer (SwinIR, Restormer)</td></tr>
    <tr><td><b>deblurring</b></td><td><i>Non-blind</i> (PSF bekannt): Inverse filter, Wiener-filter, Richardson-Lucy, Total Variation</td><td><i>Blind</i> (PSF unbekannt): DeblurGAN (CNN + Discriminator), Restormer</td></tr>
    <tr><td><b>super-resolution</b></td><td>Interpolation: bilinear, bicubic, Lanczos; Sparse Coding</td><td>SRCNN (erstes CNN, 3 Schichten), EDSR, Transformer (SwinIR, HAT), ESRGAN</td></tr>
  </table></div>
  <h4>Wie ein Netz Restauration lernt</h4>
  <p>Man braucht <b>Paare</b> (verschlechtert, sauber). Oft entstehen sie künstlich: saubere Bilder nehmen und selbst Rauschen, Unschärfe oder Verkleinern anwenden. Das Netz Φ mit Gewichten θ lernt dann</p>
  <pre><code>θ* = argmin_θ  Σᵢ  L( Φ_θ(Iᵢ), fᵢ )</code></pre>
  <p>Es lernt also implizit, wie saubere Bilder aussehen, ohne dass man PSF oder Rauschmodell explizit schätzen muss.</p>
  <ul>
    <li><b>Skip Connections (U-Net):</b> Encoder verkleinert, Decoder vergrössert wieder, und Verbindungen kopieren feine Details vom Encoder direkt zum Decoder. Ohne sie gingen Kanten im Engpass (<i>bottleneck</i>) verloren.</li>
    <li><b>Loss:</b> <b>L1</b> (mittlerer absoluter Fehler) ergibt schärfere Bilder als <b>L2</b> (MSE), der zum Mittelwert aller plausiblen Bilder neigt und damit verwaschen wirkt. Dazu kommen <b>Perceptual Loss</b> (Abstand in den features eines vortrainierten Netzes wie VGG) und ein <b>GAN-Loss</b> (ein Discriminator bestraft unnatürliche Texturen, siehe <a href="#gen">Generative Models</a>).</li>
    <li><b>Transformer:</b> Self-Attention sieht von der ersten Schicht an das ganze Bild (grosse Unschärfe, entfernte ähnliche Bildteile). Volle Attention kostet bei grossen Bildern zu viel; darum arbeiten SwinIR und Restormer mit Fenstern (windows) oder channel-weiser Attention.</li>
  </ul>
  <div class="falle"><b>Falle</b><p>PSNR belohnt Pixel-Nähe, nicht gutes Aussehen. Ein L2-trainiertes Netz erreicht hohe PSNR mit einem weichen Bild; ein GAN-Netz sieht schärfer aus, hat aber tiefere PSNR, weil es plausible Details <i>erfindet</i>. Bei medizinischen oder forensischen Bildern ist erfundenes Detail ein Risiko.</p></div>

  <h3 id="cv-detection">3 · Object Detection: was ist wo?</h3>
  <p>Die Ausgabe ist eine <b>Menge</b> von Vorhersagen, und ihre Grösse ist unbekannt:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = Box (x0, y0, x1, y1)    c = Klasse    s = Score in [0, 1]    k = unbekannt</code></pre>
  <p>Schwierig daran: 0 bis etwa 100 Objekte pro Bild, Objekte überlappen sich, sie haben sehr verschiedene Grössen, und jede Vorhersage braucht eine Konfidenz. Es gibt zwei Bauarten:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Zwei Stufen: Faster R-CNN</th><th>Eine Stufe: YOLO (v8)</th></tr>
    <tr><td><b>Ablauf</b></td><td>1. Backbone erzeugt feature maps. 2. Das <b>RPN</b> (region proposal network) schlägt Kandidaten-Regionen vor (~2000, nach NMS ~300). 3. Pro Kandidat: Klasse bestimmen und Box verfeinern.</td><td>1. Backbone erzeugt feature maps. 2. Köpfe auf mehreren Massstäben. 3. Jede Gitterzelle sagt Klasse und Box voraus; die Zelle mit dem Objektmittelpunkt ist zuständig.</td></tr>
    <tr><td><b>Anker</b></td><td>Pro Position 9 <i>Anker</i> (3 Grössen × 3 Seitenverhältnisse); das Netz sagt Abweichungen davon voraus</td><td>Anchor-free: sagt die Box direkt voraus</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: objectness + Box; Kopf: Klasse + Box (gemeinsam trainiert)</td><td>Klassen-Loss (BCE) + Box-Loss (CIoU, DFL)</td></tr>
    <tr><td><b>Stärke</b></td><td>Höchste accuracy, kleine Objekte</td><td>Echtzeit, Edge-Geräte</td></tr>
  </table></div>
  <p>Die Labels im YOLO-Format sind eine Zeile pro Objekt: <code>class_id cx cy w h</code>, alle Koordinaten auf 0 bis 1 normiert. Ein Anker ist nichts anderes als eine vorgegebene Box, die das Netz leicht verschiebt und streckt; so muss es nicht jede Box von null raten.</p>

  <h3 id="cv-iou">4 · IoU und NMS: Treffer zählen und Duplikate entfernen</h3>
  <p><b>IoU</b> (intersection over union) misst, wie gut sich zwei Boxen decken: Fläche des Schnitts geteilt durch Fläche der Vereinigung. 0 heisst kein Kontakt, 1 heisst identisch. IoU wird an drei Stellen gebraucht: beim <b>Zuordnen</b> von Ankern zu Ground-Truth-Boxen im Training, als <b>Box-Loss</b>, und bei der <b>Auswertung</b>: Eine Vorhersage zählt als Treffer, wenn ihre IoU mit einer Ground-Truth-Box über einem threshold liegt (meist 0.5).</p>
  <div class="demo" id="ioDemo">
    <div class="tag">Demo</div><h4>IoU von zwei Boxen</h4>
    <p class="hint">Verschiebe und skaliere die orange Vorhersage gegen die blaue Ground Truth. Der grüne Schnitt geteilt durch die Vereinigung ist die IoU.</p>
    <div class="ctl"><label for="ioX">Verschiebung x</label><input type="range" id="ioX" min="-80" max="100" step="2" value="40"><output id="ioDX"></output></div>
    <div class="ctl"><label for="ioY">Verschiebung y</label><input type="range" id="ioY" min="-60" max="80" step="2" value="20"><output id="ioDY"></output></div>
    <div class="ctl"><label for="ioS">Grösse der Vorhersage</label><input type="range" id="ioS" min="40" max="160" step="5" value="100"><output id="ioSC"></output></div>
    <svg class="plot" id="ioSvg" viewBox="0 0 400 300" style="max-width:420px" role="img" aria-label="Zwei Boxen mit grün markiertem Schnitt"></svg>
    <pre><code id="ioCalc"></code></pre>
    <div class="stats"><span>IoU <b id="ioV"></b></span></div>
  </div>
  <p>Ein Detector gibt zunächst <b>viele überlappende Boxen</b> für dasselbe Objekt aus. <b>Non-Maximum Suppression (NMS)</b> räumt auf:</p>
  <pre><code>Boxen nach Score sortieren
solange Boxen übrig:
    beste Box behalten
    alle übrigen Boxen mit IoU &gt; τ zur besten entfernen</code></pre>
  <p>Vorher filtert ein <b>Score-threshold</b> (z. B. 0.25) die unsicheren Boxen weg. NMS läuft pro Klasse: Boxen verschiedener Klassen dürfen sich beliebig überlappen.</p>
  <div class="demo" id="nmDemo">
    <div class="tag">Demo</div><h4>NMS mit verschiebbarem threshold τ</h4>
    <p class="hint">Fünf Kandidaten für zwei Objekte (Zahl = Score). Grün = behalten, grau gestrichelt = unterdrückt.</p>
    <div class="ctl"><label for="nmT">IoU-threshold τ</label><input type="range" id="nmT" min="0.05" max="0.95" step="0.05" value="0.5"><output id="nmTO"></output></div>
    <svg class="plot" id="nmSvg" viewBox="0 0 300 150" style="max-width:460px" role="img" aria-label="Fünf Kandidaten-Boxen für zwei Objekte, behaltene Boxen grün"></svg>
    <div class="stats"><span>Behalten <b id="nmN"></b></span></div>
    <p class="hint" id="nmMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Detection = Boxen vorhersagen, dann mit einem Score-threshold und NMS auf eine saubere Liste reduzieren. Mit IoU wird zugeordnet, trainiert und ausgewertet. Die Metrik <b>mAP</b> mittelt die precision über Klassen und IoU-thresholds.</p></div>

  <h3 id="cv-seg">5 · Semantic Segmentation: eine Klasse pro Pixel</h3>
  <p>Die Ausgabe hat <b>dieselbe Höhe und Breite wie das Eingabebild</b>: jeder Pixel bekommt genau eine Klasse (<code>y ∈ {1…C}^(H×W)</code>). Es gibt keine Boxen und keine Einzelobjekte; zwei Autos nebeneinander sind dieselbe Klasse «Auto». Schwierig sind genaue Kanten (jeder falsche Randpixel zählt), starkes <b>Klassen-Imbalance</b> (Hintergrund oft über 95 % der Pixel, ein naives Netz sagt überall «Hintergrund»), die Mischung kleiner und grosser Strukturen und die Kosten pixelgenauer Labels (10 bis 100 mal teurer als Boxen).</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>U-Net</th><th>SAM (Segment Anything)</th></tr>
    <tr><td><b>Idee</b></td><td>Encoder-Decoder mit Skip Connections. Der Encoder versteht <i>was</i> im Bild ist, der Decoder macht daraus wieder eine Karte in voller Auflösung, die Skips liefern die genauen Kanten.</td><td>Foundation Model, einmal auf einer Milliarde Masken trainiert. Man gibt einen <b>Prompt</b> (Punkt, Box, Maske, Text) und bekommt die Maske des Objekts.</td></tr>
    <tr><td><b>Training</b></td><td>Auf den eigenen Labels, ein Modell pro Aufgabe</td><td>Keines nötig (zero-shot)</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-Entropy + λ · Dice</td><td>–</td></tr>
    <tr><td><b>Grenze</b></td><td>Braucht Labels, wenig übertragbar</td><td>Kennt keine Klassennamen, nur «Objekt»; für Klassen mit einem Klassifikator kombinieren</td></tr>
  </table></div>
  <p><b>Dice</b> misst die Überlappung von vorhergesagter und wahrer Maske: <code>2·|A∩B| / (|A| + |B|)</code>. Als Loss ergänzt er die Cross-Entropy, weil er seltene Klassen nicht wegmittelt: Ein Netz, das überall «Hintergrund» sagt, hat hohe Pixel-Accuracy, aber Dice 0 für das Objekt. Es gilt <code>Dice = 2·IoU / (1 + IoU)</code>, also Dice ≥ IoU. Ausgewertet wird mit der <b>IoU</b> pro Klasse (gemittelt: mIoU).</p>
  <div class="falle"><b>Falle</b><p>Pixel-Accuracy ist bei Segmentation fast wertlos. Bei 95 % Hintergrund erreicht «alles Hintergrund» 95 %. Immer IoU oder Dice pro Klasse berichten.</p></div>

  <h3 id="cv-methoden">6 · Übersicht: Aufgaben, Modelle, Loss, Metrik</h3>
  <p>Die Zeilen entsprechen den Schritten 1 bis 3 und 8 der Grafik «Der ganze Ablauf auf einen Blick».</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Ausgabe</th><th>Modelle</th><th>Loss</th><th>Metrik</th></tr>
    <tr><td><b>denoising</b></td><td>Bild</td><td>Gauss, BM3D; U-Net, SwinIR, Restormer</td><td>L1, Perceptual</td><td>PSNR, SSIM</td></tr>
    <tr><td><b>deblurring</b></td><td>Bild</td><td>Wiener, Richardson-Lucy; DeblurGAN, Restormer</td><td>L1, Frequenz-Loss, GAN</td><td>PSNR, SSIM</td></tr>
    <tr><td><b>super-resolution</b></td><td>Bild, grösser</td><td>bicubic; SRCNN, EDSR, SwinIR, ESRGAN</td><td>L1 / MSE, GAN</td><td>PSNR, SSIM, Aussehen</td></tr>
    <tr><td><b>Object Detection</b></td><td>Boxen, Klassen, Scores</td><td>Faster R-CNN, YOLO</td><td>Klasse (BCE/CE) + Box (IoU-basiert)</td><td>mAP@IoU</td></tr>
    <tr><td><b>Semantic Segmentation</b></td><td>Klasse pro Pixel</td><td>U-Net, SAM</td><td>Cross-Entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Gleiche Bausteine, andere Ausgabe: Bild für Restauration, Boxen für Detection, Pixel-Karte für Segmentation. Die Aufgabe bestimmt Modell, Loss und Metrik. Skip Connections und vortrainierte Backbones tauchen überall auf.</p></div>
`,
    quiz: [
      { q: `Wie lautet das Bildentstehungsmodell, und was bedeuten die drei Teile?`, a: `<code>I = f ⊛ h + n</code>. <b>f</b> ist das ideale Bild, <b>h</b> die PSF (Verschmierung durch Optik, Bewegung, Fokus, als Faltung), <b>n</b> das Rauschen. I ist die Aufnahme.` },
      { q: `Welche Restaurationsaufgabe kehrt welchen Teil des Modells um?`, a: `<b>denoising</b> entfernt n, <b>deblurring</b> macht die Faltung mit h rückgängig, <b>super-resolution</b> stellt feine Details nach dem Verkleinern wieder her.` },
      { q: `Warum sind diese Aufgaben «schlecht gestellt»?`, a: `Aus der Aufnahme I gibt es viele mögliche Originale f. Ohne Vorwissen über natürliche Bilder (filter-Regeln oder aus Daten gelernt) ist die Lösung nicht eindeutig.` },
      { q: `Wann ist der Median-filter besser als der Mittelwert-filter?`, a: `Bei Ausreissern wie Salz-und-Pfeffer-Rauschen: Ein einzelner extremer Wert verschiebt den Median nicht, den Mittelwert aber stark. Der Median erhält zudem Kanten besser.` },
      { q: `Warum L1 statt L2 als Loss bei der Restauration?`, a: `L2 (MSE) neigt zum Mittelwert aller plausiblen Bilder und ergibt verwaschene Resultate; L1 liefert meist schärfere Bilder.` },
      { q: `Wozu dienen Skip Connections im U-Net?`, a: `Sie führen feine Details (Kanten, Texturen) vom Encoder direkt zum Decoder, die im Engpass verloren gingen. Dazu verkürzen sie den Weg für den Gradienten.` },
      { q: `Was ist der Unterschied zwischen Klassifikation und Object Detection bei der Ausgabe?`, a: `Klassifikation: ein Label pro Bild. Detection: eine Menge von (Box, Klasse, Score) mit unbekannter Anzahl, die vom Bild abhängt.` },
      { q: `Berechne die IoU: Box A hat Fläche 100, Box B Fläche 100, der Schnitt 50.`, a: `Vereinigung = 100 + 100 − 50 = 150, IoU = 50 / 150 = 0.33. Bei threshold 0.5 wäre das kein Treffer.` },
      { q: `Was macht NMS, und was passiert bei einem zu tiefen threshold τ?`, a: `Behält die Box mit dem höchsten Score und entfernt alle anderen, die mit ihr eine IoU über τ haben, dann wiederholt. Bei zu tiefem τ werden auch Boxen echter Nachbarobjekte unterdrückt; bei zu hohem bleiben Duplikate.` },
      { q: `Faster R-CNN oder YOLO: wann welches?`, a: `Faster R-CNN (zwei Stufen) wenn höchste accuracy und kleine Objekte zählen. YOLO (eine Stufe, anchor-free) wenn Geschwindigkeit zählt, z. B. Echtzeit oder Edge-Geräte.` },
      { q: `Was ist ein Anker?`, a: `Eine vorgegebene Box (Grösse und Seitenverhältnis) an jeder Position der feature map. Das Netz sagt nur voraus, ob dort ein Objekt ist und wie die Box verschoben und gestreckt werden muss.` },
      { q: `Wie unterscheidet sich Semantic Segmentation von Detection?`, a: `Ausgabe ist eine Klasse pro Pixel in der Grösse des Bildes, ohne Boxen und ohne Unterscheidung von Einzelobjekten derselben Klasse.` },
      { q: `Warum ist Pixel-Accuracy bei Segmentation irreführend, und was nimmt man stattdessen?`, a: `Der Hintergrund macht oft über 95 % der Pixel aus; «alles Hintergrund» hätte 95 % Accuracy. Besser IoU oder Dice pro Klasse (mIoU), und Dice als Loss neben der Cross-Entropy.` },
      { q: `Was ist der Unterschied zwischen U-Net und SAM?`, a: `U-Net wird auf eigenen Labels pro Aufgabe trainiert. SAM ist einmal auf sehr vielen Masken trainiert und segmentiert per Prompt (Punkt, Box) ohne neues Training, kennt aber keine Klassennamen.` },
    ],
    init() {
      LernApp.demos.cv();
    },
  });
})();
