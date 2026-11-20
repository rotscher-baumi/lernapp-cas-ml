/* Module: Computer Vision (Modul 3, Teil 3). Content lives in the html field; the demos live in assets/demos-cv.js. */
(function () {
  LernApp.register({
    id: 'cv',
    order: 94,
    nav: 'Computer Vision',
    title: `Computer Vision`,
    kicker: `Modul 3 · Deep Learning, Teil 3`,
    summary: `Bildentstehung, Pixel und Channels (RGB, Alpha, dtype, HWC/CHW, Dateiformate), Denoising, Deblurring, Super-Resolution, Object Detection (IoU, NMS, Faster R-CNN, YOLO), Semantic Segmentation (U-Net, SAM)`,
    html: `  <p>Das Kapitel <a href="#cnn">CNN</a> hat gezeigt, wie ein Netz Bilder <i>klassifiziert</i>: ein Bild rein, ein Label raus. Computer Vision umfasst mehr. Hier geht es um drei Aufgaben, bei denen die Ausgabe selbst räumlich ist: ein <b>besseres Bild</b> (Restauration), eine <b>Liste von Boxen</b> (Object Detection) oder eine <b>Klasse pro Pixel</b> (Semantic Segmentation). Die Bausteine bleiben die aus dem CNN-Kapitel: Filter, Feature Maps, Pooling, Backpropagation.</p>
  <p class="note">Die Demos rechnen im Browser mit kleinen Beispielbildern. Die Kurs-Notebooks (Bildgrundlagen, Denoising, Deblurring, Super-Resolution, Detection, Segmentation) laufen in Jupyter oder Colab.</p>

  <h3 id="cv-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#cnn-ablauf">CNN</a>. Was sich ändert, sind die Aufgabe (Schritt 1), das Modell (2), der Loss (3) und die Metrik in der Validation (8).</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="cvFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines Computer-Vision-Projekts: Aufgabe und Bilder festlegen, Modell wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward Pass, Loss, Backpropagation und Update, danach Validation mit aufgabenspezifischer Metrik und zum Schluss einmal testen">
      ${LernApp.nnFlow({
        id: 'cv',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Bilder und Aufgabe', 'Restauration, Detection, Segmentation'],
          ['Modell wählen', 'U-Net, Faster R-CNN, YOLO, SAM'],
          ['Loss und Optimizer', 'L1, IoU-Loss, Cross-Entropy + Dice'],
          ['Forward Pass', 'Bild, Boxen oder Pixel-Klassen'],
          ['Loss berechnen', 'Abstand zum Ziel (Bild, Box, Maske)'],
          ['Backpropagation', 'Gradienten für alle Filter'],
          ['Parameter aktualisieren', 'w ← w − α · ∂L/∂w'],
          ['Validation prüfen', 'PSNR, mAP, IoU / Dice'],
          ['Einmal testen', 'Testset, auch fremde Kameras'],
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

  <h3 id="cv-bild">1 · Wie ein Bild entsteht (und warum es nie perfekt ist)</h3>
  <p>Licht geht durch die Optik, trifft den Sensor, wird verstärkt und digitalisiert (Licht → Elektronen → Spannung → Zahlen). Jede Stufe verschlechtert das Bild ein wenig. Vereinfacht beschreibt das ein Modell:</p>
  <pre><code>I(x, y) = f(x, y) ⊛ h(x, y) + n(x, y)</code></pre>
  <ul>
    <li><b>f</b> ist das ideale Bild, das wir gerne hätten.</li>
    <li><b>h</b> ist die <b>PSF</b> (point spread function): wie die Optik einen Punkt verschmiert. <code>⊛</code> ist die Faltung, also dieselbe Operation wie bei einem Filter. Bewegung, falscher Fokus oder eine zittrige Hand erzeugen <b>Unschärfe</b>.</li>
    <li><b>n</b> ist <b>Rauschen</b> (Sensor, Elektronik, wenig Licht).</li>
    <li><b>I</b> ist das, was wir tatsächlich aufnehmen.</li>
  </ul>
  <p>Im Rechner ist ein Bild eine Zahlentabelle; wie sie genau aussieht, zeigt <a href="#cv-pixel">Abschnitt 2</a>.</p>
  <p>Die drei Restaurationsaufgaben kehren je einen Teil davon um: <b>Denoising</b> entfernt n, <b>Deblurring</b> macht die Faltung mit h rückgängig, <b>Super-Resolution</b> rekonstruiert Details, die beim Verkleinern verloren gingen (Aliasing). Alle drei sind <i>schlecht gestellt</i>: Aus I gibt es viele mögliche f. Darum braucht man Vorwissen über «wie sehen echte Bilder aus», klassisch als Filterregeln, heute aus Daten gelernt.</p>
  <div class="demo" id="rcvDemo">
    <div class="tag">Demo</div><h4>Ein Bild verschlechtern und mit einem Filter reparieren</h4>
    <p class="hint">Verschlechtere das 16 × 16-Testbild mit Unschärfe und Rauschen, dann wähle einen Restaurationsfilter. PSNR (in dB, höher ist besser) misst den Abstand zum Original. Probiere «Salz und Pfeffer» mit dem Medianfilter.</p>
    <div class="ctl"><label for="rcvB">Unschärfe (Durchgänge)</label><input type="range" id="rcvB" min="0" max="3" step="1" value="0"><output id="rcvBO"></output></div>
    <div class="ctl"><label for="rcvS">Rauschstärke</label><input type="range" id="rcvS" min="0" max="0.5" step="0.05" value="0.15"><output id="rcvSO"></output></div>
    <div class="btnrow" id="rcvKind" role="group" aria-label="Rauschart"><button data-v="gauss" class="pri" aria-pressed="true">Gauss-Rauschen</button><button data-v="sp" aria-pressed="false">Salz und Pfeffer</button></div>
    <div class="btnrow" id="rcvFix" role="group" aria-label="Restaurationsfilter"><button data-v="none" class="pri" aria-pressed="true">Kein Filter</button><button data-v="mean" aria-pressed="false">Mittelwert 3×3</button><button data-v="median" aria-pressed="false">Median 3×3</button></div>
    <svg class="plot" id="rcvSvg" viewBox="0 0 590 210" style="max-width:640px" role="img" aria-label="Originalbild, verschlechterte Aufnahme und restauriertes Bild mit PSNR"></svg>
    <p class="hint" id="rcvMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Aufnahme = Original, verschmiert, plus Rauschen. Jeder Filter tauscht etwas gegen etwas: Der Mittelwertfilter glättet Rauschen, verschmiert aber Kanten. Der Medianfilter ist bei Ausreissern (Salz und Pfeffer) besser, weil ein einzelner extremer Pixel den Median nicht verschiebt.</p></div>

  <h3 id="cv-pixel">2 · Was in einem Bild steckt: Pixel, Channels, Speicher</h3>
  <p>Für den Rechner ist ein Bild ein Array mit der Form <code>(H, W, C)</code>: H Zeilen, W Spalten und C Channels pro Pixel. Der Ursprung (0, 0) liegt <b>oben links</b>, und indexiert wird Zeile zuerst: <code>img[y, x]</code>. Ein Pixel eines Farbfotos besteht aus drei Zahlen von 0 bis 255.</p>
  <div class="demo" id="pxDemo">
    <div class="tag">Demo</div><h4>Pixel-Inspektor</h4>
    <p class="hint">Fahre mit der Maus über das Bild oder tippe darauf. Die Lupe zeigt 9 × 9 Pixel, die Mitte ist der gewählte Pixel. Daneben stehen seine Werte in den üblichen Schreibweisen.</p>
    <div class="px-stage">
      <div>
        <canvas class="px-scene" id="pxScene" width="160" height="100" aria-label="Beispielbild: Landschaft mit Haus, See und Sonne, 160 × 100 Pixel"></canvas>
        <div class="px-axis"><span>(0, 0) oben links</span><span>x → W = 160</span></div>
        <div class="px-axis"><span>y ↓ H = 100</span><span>img.shape = (100, 160, 3)</span></div>
      </div>
      <div>
        <canvas class="px-lens" id="pxLens" width="198" height="198" aria-label="Vergrösserung von 9 × 9 Pixeln um den gewählten Pixel"></canvas>
        <dl class="px-read" id="pxRead"></dl>
      </div>
    </div>
  </div>

  <h4>Channels: Ein Farbbild besteht aus drei Graustufenbildern</h4>
  <p>Jeder Channel ist eine eigene Matrix H × W. Hell heisst «viel von diesem Anteil». Das rote Dach ist im R-Channel hell und im B-Channel fast schwarz, der See umgekehrt.</p>
  <div class="demo" id="pxChDemo">
    <div class="tag">Demo</div><h4>Ein Bild in seine Channels zerlegen</h4>
    <div class="btnrow" id="pxMode" role="group" aria-label="Darstellung der Channels"><button data-v="gray" class="pri" aria-pressed="true">als Graustufen</button><button data-v="tint" aria-pressed="false">eingefärbt</button></div>
    <div class="px-ch" id="pxCh"></div>
    <p class="hint">Graustufen werden aus den drei Channels gewichtet berechnet (Grün zählt am meisten, weil das Auge dort am empfindlichsten ist). Hue stammt aus dem Farbraum HSV. Alpha ist ein vierter Channel für die Deckkraft, hier als Verlauf von links nach rechts.</p>
  </div>
  <p>Ein Pixel kann viel mehr enthalten als RGB:</p>
  <div class="tablewrap"><table>
    <tr><th>Typ</th><th>C</th><th>Inhalt</th><th>Wo</th></tr>
    <tr><td><b>Graustufen</b></td><td>1</td><td>Helligkeit</td><td><code>(H, W)</code>, PIL-Mode <code>L</code></td></tr>
    <tr><td><b>RGB</b></td><td>3</td><td>Rot, Grün, Blau</td><td>Standardfoto, PIL, matplotlib</td></tr>
    <tr><td><b>BGR</b></td><td>3</td><td>gleich, umgekehrte Reihenfolge</td><td><code>cv2.imread</code></td></tr>
    <tr><td><b>RGBA</b></td><td>4</td><td>RGB + Alpha (Deckkraft)</td><td>PNG mit Transparenz</td></tr>
    <tr><td><b>Palette</b></td><td>1</td><td>Index in eine Farbtabelle (höchstens 256 Farben)</td><td>GIF, PIL-Mode <code>P</code></td></tr>
    <tr><td><b>RGB-D</b></td><td>4</td><td>RGB + Tiefe (Distanz zur Kamera)</td><td>Kinect, RealSense, LiDAR</td></tr>
    <tr><td><b>Multispektral</b></td><td>4–13</td><td>RGB + Nahinfrarot und weitere Bänder</td><td>Satelliten (Sentinel-2: 13 Bänder)</td></tr>
    <tr><td><b>Hyperspektral</b></td><td>100+</td><td>viele schmale Wellenlängen</td><td>Landwirtschaft, Medizin</td></tr>
    <tr><td><b>Label-Maske</b></td><td>1</td><td>Klassen-ID pro Pixel</td><td>Ground Truth für <a href="#cv-seg">Segmentation</a></td></tr>
    <tr><td><b>HSV, LAB, YCbCr</b></td><td>3</td><td>dieselbe Information in einem anderen Farbraum</td><td>Farbsegmentierung; JPEG rechnet intern in YCbCr</td></tr>
  </table></div>

  <h4>Bit-Tiefe und dtype</h4>
  <p>Die Bit-Tiefe sagt, wie fein ein Wert abgestuft ist. 8 Bit pro Channel ergeben 256 Stufen, bei drei Channels 256³ ≈ 16,7 Mio. Farben.</p>
  <div class="px-levels" id="pxLevels"></div>
  <div class="tablewrap"><table>
    <tr><th>dtype</th><th>Wertebereich</th><th>Wofür</th></tr>
    <tr><td><code>uint8</code></td><td>0 bis 255</td><td>Standard für Fotos und Bilddateien</td></tr>
    <tr><td><code>uint16</code></td><td>0 bis 65 535</td><td>Medizin (DICOM), RAW, wissenschaftliche Kameras</td></tr>
    <tr><td><code>float32</code></td><td>meist 0.0 bis 1.0</td><td>Eingabe für neuronale Netze, HDR</td></tr>
    <tr><td><code>bool</code></td><td>0 oder 1</td><td>Binärmasken</td></tr>
  </table></div>
  <div class="demo" id="pxCalcDemo">
    <div class="tag">Demo</div><h4>Wie viel Speicher braucht ein Bild?</h4>
    <p class="hint">Unkomprimiert im RAM gilt: H × W × C × Bytes pro Wert. Probiere ein Batch aus float32-Bildern: So schnell ist der GPU-Speicher voll.</p>
    <div class="px-calc">
      <label for="pxH">Höhe H<input id="pxH" type="number" min="1" value="1080"></label>
      <label for="pxW">Breite W<input id="pxW" type="number" min="1" value="1920"></label>
      <label for="pxC">Channels C<select id="pxC"><option value="1">1 · Graustufen</option><option value="3" selected>3 · RGB</option><option value="4">4 · RGBA</option><option value="13">13 · Sentinel-2</option></select></label>
      <label for="pxD">dtype<select id="pxD"><option value="1" selected>uint8 · 1 Byte</option><option value="2">uint16 · 2 Byte</option><option value="4">float32 · 4 Byte</option></select></label>
    </div>
    <div class="stats"><span>Ein Bild <b id="pxM1"></b></span><span>Batch von 32 <b id="pxM32"></b></span></div>
    <pre><code id="pxMCalc"></code></pre>
  </div>

  <h4>Speicherlayout: HWC oder CHW</h4>
  <p>Der Speicher ist eindimensional. Ein 2 × 2-RGB-Bild belegt 12 Werte, und die Frage ist nur, in welcher Reihenfolge sie hintereinander liegen. NumPy, PIL, OpenCV und TensorFlow legen die drei Werte eines Pixels nebeneinander (<b>HWC</b>, interleaved). PyTorch legt zuerst alle R-Werte ab, dann alle G-, dann alle B-Werte (<b>CHW</b>, planar), ein Mini-Batch ist <code>[B, C, H, W]</code>.</p>
  <figure class="fig px-layout" id="pxLayout">
    <div class="px-mini" id="pxMini" aria-label="2 × 2-Bild mit vier farbigen Pixeln"></div>
    <div class="px-strips">
      <div><b>HWC</b> <span class="muted">NumPy, PIL, OpenCV</span><div class="px-strip" id="pxHWC"></div></div>
      <div><b>CHW</b> <span class="muted">PyTorch</span><div class="px-strip" id="pxCHW"></div></div>
    </div>
    <figcaption>Gleiche zwölf Zahlen, andere Reihenfolge. <code>img.transpose(2, 0, 1)</code> macht aus HWC CHW, <code>t.permute(1, 2, 0)</code> wieder HWC.</figcaption>
  </figure>

  <h4>Bilddatei: Signatur, Header, Metadaten, Pixel</h4>
  <p>Auf der Festplatte liegt das Array nicht roh, sondern komprimiert mit einem Kopf davor. Die ersten Bytes sind eine <b>Signatur</b> (Magic Bytes): Daran erkennt die Software das Format, nicht an der Dateiendung.</p>
  <div class="px-file">
    <b>PNG</b> <span class="muted">verlustfrei, aus Chunks</span>
    <div class="px-bytes">
      <div class="px-seg sig"><code>89 50 4E 47 0D 0A 1A 0A</code><span>Signatur «‰PNG»</span></div>
      <div class="px-seg"><code>IHDR</code><span>Breite, Höhe, Bit-Tiefe, Farbtyp</span></div>
      <div class="px-seg meta"><code>eXIf · iCCP · tEXt</code><span>Metadaten, Farbprofil</span></div>
      <div class="px-seg data"><code>IDAT …</code><span>Pixel, Zeilenfilter + Deflate (wie ZIP)</span></div>
      <div class="px-seg"><code>IEND</code><span>Ende</span></div>
    </div>
    <b>JPEG</b> <span class="muted">verlustbehaftet, aus Markern</span>
    <div class="px-bytes">
      <div class="px-seg sig"><code>FF D8</code><span>SOI, Start</span></div>
      <div class="px-seg meta"><code>FF E1 · APP1</code><span>EXIF: Kamera, GPS, Orientation</span></div>
      <div class="px-seg"><code>FF DB · DQT</code><span>Quantisierungstabellen (Qualität)</span></div>
      <div class="px-seg"><code>FF C0 · SOF0</code><span>Grösse, Channels, Subsampling</span></div>
      <div class="px-seg data"><code>FF DA · SOS …</code><span>YCbCr, 8 × 8-Blöcke, DCT, Huffman</span></div>
      <div class="px-seg"><code>FF D9</code><span>EOI, Ende</span></div>
    </div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Format</th><th>Kompression</th><th>Channels / Bit</th><th>Gut für</th></tr>
    <tr><td><b>BMP</b></td><td>keine</td><td>RGB(A), 8 Bit</td><td>rohe Pixel, heute selten</td></tr>
    <tr><td><b>PNG</b></td><td>verlustfrei</td><td>1–4, 8 oder 16 Bit</td><td>Masken, Screenshots, Transparenz</td></tr>
    <tr><td><b>JPEG</b></td><td>verlustbehaftet</td><td>1 oder 3, 8 Bit</td><td>Fotos; nie für Masken</td></tr>
    <tr><td><b>WebP, AVIF</b></td><td>beides</td><td>bis 4, 8–12 Bit</td><td>Web, kleiner als JPEG</td></tr>
    <tr><td><b>GIF</b></td><td>verlustfrei</td><td>Palette, höchstens 256 Farben</td><td>Animationen, Grafiken</td></tr>
    <tr><td><b>TIFF</b></td><td>wählbar</td><td>beliebig, bis 32-Bit-Float</td><td>Satelliten (GeoTIFF), Mikroskopie</td></tr>
    <tr><td><b>RAW, DNG</b></td><td>meist keine</td><td>1 (Bayer), 12–14 Bit</td><td>Fotografie, volle Sensordaten</td></tr>
    <tr><td><b>DICOM</b></td><td>wählbar</td><td>1, 12–16 Bit</td><td>CT, MRT, Röntgen, mit Patientendaten</td></tr>
  </table></div>
  <p>Neben den Pixeln trägt die Datei <b>Metadaten</b>: EXIF (Kamera, Belichtung, Datum, GPS, Orientation), ein ICC-Farbprofil (sRGB, Display P3) und die Auflösung in DPI.</p>

  <h4>Vom Sensor zum Array</h4>
  <div class="px-pipe">
    <div><span class="muted">Sensor</span><b>Bayer-Filter</b><div class="px-bayer" id="pxBayer" aria-label="Bayer-Muster RGGB, 6 × 6 Zellen"></div><span>Jede Fotozelle misst nur R, G oder B. Grün kommt doppelt vor.</span></div>
    <div><span class="muted">Kamera</span><b>Demosaicing</b><span>Die zwei fehlenden Farben jedes Pixels aus den Nachbarn interpolieren: 3 Channels.</span></div>
    <div><span class="muted">Kamera</span><b>Weissabgleich, Gamma</b><span>Farbstich korrigieren, Werte nichtlinear auf sRGB abbilden.</span></div>
    <div><span class="muted">Encoder</span><b>Kompression</b><span>JPEG, PNG oder HEIC schreiben, EXIF und ICC-Profil anhängen.</span></div>
    <div><span class="muted">Python</span><b>Decoder</b><span><code>cv2.imread</code> oder <code>Image.open</code> entpackt zu einem <code>uint8</code>-Array <code>(H, W, C)</code>.</span></div>
  </div>
  <p>Das ist dieselbe Kette wie im Bildentstehungsmodell aus Abschnitt 1, nur aus Sicht der Daten: Demosaicing und JPEG-Kompression erzeugen eigene Fehler, die zum Rauschen n dazukommen.</p>

  <div class="falle"><b>Falle</b><ul>
    <li><b>OpenCV lädt BGR.</b> In matplotlib wirken die Farben dann blaustichig: <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>.</li>
    <li><b>Zeile vor Spalte.</b> NumPy indexiert <code>img[y, x]</code>, OpenCV-Funktionen wie <code>cv2.circle</code> wollen aber Punkte als <code>(x, y)</code>.</li>
    <li><b>uint8-Überlauf.</b> <code>np.uint8(200) + np.uint8(100)</code> ergibt 44. Vor dem Rechnen <code>img.astype(np.float32) / 255</code>.</li>
    <li><b>4 statt 3 Channels.</b> Ein PNG mit Alpha passt nicht in ein Modell, das RGB erwartet: <code>Image.open(p).convert("RGB")</code>.</li>
    <li><b>EXIF-Rotation.</b> Handyfotos werden gedreht angezeigt, die Pixel liegen aber ungedreht in der Datei: <code>ImageOps.exif_transpose(img)</code>.</li>
    <li><b>Masken als JPEG.</b> Die Kompression verändert Label-IDs an den Kanten; Masken immer als PNG speichern.</li>
  </ul></div>
  <div class="merk"><b>Merksatz</b><p>Ein Bild ist ein Array <code>(H, W, C)</code> mit einem dtype. Die Channels können Farbe, Deckkraft, Tiefe oder Klassen sein. Im RAM entscheidet das Layout (HWC oder CHW), auf der Platte das Format (verlustfrei oder nicht) und die Metadaten. Vor jedem Modell zuerst <code>shape</code>, <code>dtype</code>, <code>min</code> und <code>max</code> anschauen.</p></div>

  <h3 id="cv-restauration">3 · Restauration: Denoising, Deblurring, Super-Resolution</h3>
  <p>Alle drei Aufgaben sind «Bild rein, Bild raus». Pro Aufgabe gibt es klassische Methoden und Deep Learning.</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Klassisch</th><th>Deep Learning</th></tr>
    <tr><td><b>Denoising</b></td><td>Gauss-Filter, Bilateral-Filter (erhält Kanten), Non-Local Means, BM3D (Transform-Domäne)</td><td>CNN mit Skip Connections (U-Net), Transformer (SwinIR, Restormer)</td></tr>
    <tr><td><b>Deblurring</b></td><td><i>Non-blind</i> (PSF bekannt): inverser Filter, Wiener-Filter, Richardson-Lucy, Total Variation</td><td><i>Blind</i> (PSF unbekannt): DeblurGAN (CNN + Discriminator), Restormer</td></tr>
    <tr><td><b>Super-Resolution</b></td><td>Interpolation: bilinear, bicubic, Lanczos; Sparse Coding</td><td>SRCNN (erstes CNN, 3 Schichten), EDSR, Transformer (SwinIR, HAT), ESRGAN</td></tr>
  </table></div>
  <h4>Wie ein Netz Restauration lernt</h4>
  <p>Man braucht <b>Paare</b> (verschlechtert, sauber). Oft entstehen sie künstlich: saubere Bilder nehmen und selbst Rauschen, Unschärfe oder Verkleinern anwenden. Das Netz Φ mit Gewichten θ lernt dann</p>
  <pre><code>θ* = argmin_θ  Σᵢ  L( Φ_θ(Iᵢ), fᵢ )</code></pre>
  <p>Es lernt also implizit, wie saubere Bilder aussehen, ohne dass man PSF oder Rauschmodell explizit schätzen muss.</p>
  <ul>
    <li><b>Skip Connections (U-Net):</b> Encoder verkleinert, Decoder vergrössert wieder, und Verbindungen kopieren feine Details vom Encoder direkt zum Decoder. Ohne sie gingen Kanten im Engpass (<i>Bottleneck</i>) verloren.</li>
    <li><b>Loss:</b> <b>L1</b> (mittlerer absoluter Fehler) ergibt schärfere Bilder als <b>L2</b> (MSE), der zum Mittelwert aller plausiblen Bilder neigt und damit verwaschen wirkt. Dazu kommen <b>Perceptual Loss</b> (Abstand in den Features eines vortrainierten Netzes wie VGG) und ein <b>GAN-Loss</b> (ein Discriminator bestraft unnatürliche Texturen, siehe <a href="#gen">Generative Models</a>).</li>
    <li><b>Transformer:</b> Self-Attention sieht von der ersten Schicht an das ganze Bild (grosse Unschärfe, entfernte ähnliche Bildteile). Volle Attention kostet bei grossen Bildern zu viel; darum arbeiten SwinIR und Restormer mit Fenstern (Windows) oder Channel-weiser Attention.</li>
  </ul>
  <div class="falle"><b>Falle</b><p>PSNR belohnt Pixel-Nähe, nicht gutes Aussehen. Ein L2-trainiertes Netz erreicht hohe PSNR mit einem weichen Bild; ein GAN-Netz sieht schärfer aus, hat aber tiefere PSNR, weil es plausible Details <i>erfindet</i>. Bei medizinischen oder forensischen Bildern ist erfundenes Detail ein Risiko.</p></div>

  <h3 id="cv-detection">4 · Object Detection: was ist wo?</h3>
  <p>Die Ausgabe ist eine <b>Menge</b> von Vorhersagen, und ihre Grösse ist unbekannt:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = Box (x0, y0, x1, y1)    c = Klasse    s = Score in [0, 1]    k = unbekannt</code></pre>
  <p>Schwierig daran: 0 bis etwa 100 Objekte pro Bild, Objekte überlappen sich, sie haben sehr verschiedene Grössen, und jede Vorhersage braucht eine Konfidenz. Es gibt zwei Bauarten:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Zwei Stufen: Faster R-CNN</th><th>Eine Stufe: YOLO (v8)</th></tr>
    <tr><td><b>Ablauf</b></td><td>1. Backbone erzeugt Feature Maps. 2. Das <b>RPN</b> (Region Proposal Network) schlägt Kandidaten-Regionen vor (~2000, nach NMS ~300). 3. Pro Kandidat: Klasse bestimmen und Box verfeinern.</td><td>1. Backbone erzeugt Feature Maps. 2. Köpfe auf mehreren Massstäben. 3. Jede Gitterzelle sagt Klasse und Box voraus; die Zelle mit dem Objektmittelpunkt ist zuständig.</td></tr>
    <tr><td><b>Anker</b></td><td>Pro Position 9 <i>Anker</i> (3 Grössen × 3 Seitenverhältnisse); das Netz sagt Abweichungen davon voraus</td><td>Anchor-free: sagt die Box direkt voraus</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: Objectness + Box; Kopf: Klasse + Box (gemeinsam trainiert)</td><td>Klassen-Loss (BCE) + Box-Loss (CIoU, DFL)</td></tr>
    <tr><td><b>Stärke</b></td><td>Höchste Accuracy, kleine Objekte</td><td>Echtzeit, Edge-Geräte</td></tr>
  </table></div>
  <p>Die Labels im YOLO-Format sind eine Zeile pro Objekt: <code>class_id cx cy w h</code>, alle Koordinaten auf 0 bis 1 normiert. Ein Anker ist nichts anderes als eine vorgegebene Box, die das Netz leicht verschiebt und streckt; so muss es nicht jede Box von Grund auf raten.</p>

  <h3 id="cv-iou">5 · IoU und NMS: Treffer zählen und Duplikate entfernen</h3>
  <p><b>IoU</b> (intersection over union) misst, wie gut sich zwei Boxen decken: Fläche des Schnitts geteilt durch Fläche der Vereinigung. 0 heisst kein Kontakt, 1 heisst identisch. IoU wird an drei Stellen gebraucht: beim <b>Zuordnen</b> von Ankern zu Ground-Truth-Boxen im Training, als <b>Box-Loss</b>, und bei der <b>Auswertung</b>: Eine Vorhersage zählt als Treffer, wenn ihre IoU mit einer Ground-Truth-Box über einem Threshold liegt (meist 0.5).</p>
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

  <h3 id="cv-seg">6 · Semantic Segmentation: eine Klasse pro Pixel</h3>
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

  <h3 id="cv-methoden">7 · Übersicht: Aufgaben, Modelle, Loss, Metrik</h3>
  <p>Die Zeilen entsprechen den Schritten 1 bis 3 und 8 der Grafik «Der ganze Ablauf auf einen Blick».</p>
  <div class="tablewrap"><table>
    <tr><th>Aufgabe</th><th>Ausgabe</th><th>Modelle</th><th>Loss</th><th>Metrik</th></tr>
    <tr><td><b>Denoising</b></td><td>Bild</td><td>Gauss, BM3D; U-Net, SwinIR, Restormer</td><td>L1, Perceptual</td><td>PSNR, SSIM</td></tr>
    <tr><td><b>Deblurring</b></td><td>Bild</td><td>Wiener, Richardson-Lucy; DeblurGAN, Restormer</td><td>L1, Frequenz-Loss, GAN</td><td>PSNR, SSIM</td></tr>
    <tr><td><b>Super-Resolution</b></td><td>Bild, grösser</td><td>Bicubic; SRCNN, EDSR, SwinIR, ESRGAN</td><td>L1 / MSE, GAN</td><td>PSNR, SSIM, Aussehen</td></tr>
    <tr><td><b>Object Detection</b></td><td>Boxen, Klassen, Scores</td><td>Faster R-CNN, YOLO</td><td>Klasse (BCE/CE) + Box (IoU-basiert)</td><td>mAP@IoU</td></tr>
    <tr><td><b>Semantic Segmentation</b></td><td>Klasse pro Pixel</td><td>U-Net, SAM</td><td>Cross-Entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Gleiche Bausteine, andere Ausgabe: Bild für Restauration, Boxen für Detection, Pixel-Karte für Segmentation. Die Aufgabe bestimmt Modell, Loss und Metrik. Skip Connections und vortrainierte Backbones tauchen überall auf.</p></div>
`,
    quiz: [
      { q: `Wie lautet das Bildentstehungsmodell, und was bedeuten die drei Teile?`, a: `<code>I = f ⊛ h + n</code>. <b>f</b> ist das ideale Bild, <b>h</b> die PSF (Verschmierung durch Optik, Bewegung, Fokus, als Faltung), <b>n</b> das Rauschen. I ist die Aufnahme.` },
      { q: `Was bedeutet <code>img.shape == (480, 640, 3)</code>, und wie greifst du auf den Pixel in Spalte 10, Zeile 20 zu?`, a: `480 Zeilen (H), 640 Spalten (W), 3 Channels (RGB). Zugriff mit Zeile zuerst: <code>img[20, 10]</code> liefert die drei Werte [R, G, B]. Der Ursprung liegt oben links.` },
      { q: `Warum sehen Bilder aus <code>cv2.imread</code> in matplotlib blaustichig aus?`, a: `OpenCV speichert die Channels in der Reihenfolge BGR, matplotlib erwartet RGB. Rot und Blau sind vertauscht. Lösung: <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>.` },
      { q: `Wie viel Speicher braucht ein RGB-Bild 1920 × 1080 als uint8 und als float32?`, a: `H × W × C × Bytes: 1080 · 1920 · 3 · 1 ≈ 6,2 MB als uint8, viermal so viel (≈ 24,9 MB) als float32.` },
      { q: `Was ist der Unterschied zwischen HWC und CHW?`, a: `Dieselben Zahlen in anderer Reihenfolge. HWC (NumPy, PIL, OpenCV) legt die Channels eines Pixels nebeneinander, CHW (PyTorch) legt zuerst alle R-, dann alle G-, dann alle B-Werte ab. Umwandeln mit <code>transpose(2, 0, 1)</code>.` },
      { q: `Warum speichert man Segmentierungsmasken als PNG und nicht als JPEG?`, a: `JPEG ist verlustbehaftet: Die Kompression verändert Werte an Kanten, aus Klasse 2 wird z. B. 3 oder 1. PNG ist verlustfrei, die Label-IDs bleiben exakt.` },
      { q: `Was steht ausser den Pixeln in einer Bilddatei?`, a: `Eine Signatur (Magic Bytes, z. B. <code>FF D8</code> für JPEG), ein Header mit Grösse, Bit-Tiefe und Farbtyp, Metadaten (EXIF mit Kamera, GPS, Orientation; ICC-Farbprofil) und die komprimierten Pixeldaten.` },
      { q: `Welche Restaurationsaufgabe kehrt welchen Teil des Modells um?`, a: `<b>Denoising</b> entfernt n, <b>Deblurring</b> macht die Faltung mit h rückgängig, <b>Super-Resolution</b> stellt feine Details nach dem Verkleinern wieder her.` },
      { q: `Warum sind diese Aufgaben «schlecht gestellt»?`, a: `Aus der Aufnahme I gibt es viele mögliche Originale f. Ohne Vorwissen über natürliche Bilder (Filterregeln oder aus Daten gelernt) ist die Lösung nicht eindeutig.` },
      { q: `Wann ist der Medianfilter besser als der Mittelwertfilter?`, a: `Bei Ausreissern wie Salz-und-Pfeffer-Rauschen: Ein einzelner extremer Wert verschiebt den Median nicht, den Mittelwert aber stark. Der Median erhält zudem Kanten besser.` },
      { q: `Warum L1 statt L2 als Loss bei der Restauration?`, a: `L2 (MSE) neigt zum Mittelwert aller plausiblen Bilder und ergibt verwaschene Resultate; L1 liefert meist schärfere Bilder.` },
      { q: `Wozu dienen Skip Connections im U-Net?`, a: `Sie führen feine Details (Kanten, Texturen) vom Encoder direkt zum Decoder, die im Engpass verloren gingen. Dazu verkürzen sie den Weg für den Gradienten.` },
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
      LernApp.demos.cv();
    },
  });
})();
