/* Module: Generative Models (Modul 3, Teil 4). Content lives in the html field; the demos live in assets/demos-gen.js. */
(function () {
  LernApp.register({
    id: 'gen',
    order: 94.5,
    nav: 'Generative Models',
    title: `Generative Models`,
    kicker: `Modul 3 · Deep Learning, Teil 4`,
    summary: `Autoencoder, VAE (Latent Space, KL, Reparametrisierung), PixelCNN, GAN (Generator gegen Discriminator)`,
    html: `  <p>Bisher hat ein Modell eine Eingabe auf ein Ergebnis abgebildet (Label, Zahl, Box). Ein <b>generatives Modell</b> lernt dagegen, <b>wie die Daten selbst aussehen</b>, und kann danach neue, ähnliche Beispiele erzeugen: neue Ziffern, neue Gesichter, ein Sommerbild als Winterbild. Es braucht dafür keine Labels. Das Kapitel zeigt vier Wege: Autoencoder, VAE, PixelCNN und GAN.</p>
  <p class="note">Die Demos rechnen im Browser mit kleinen Beispielen. Die Kurs-Notebooks (PixelCNN auf MNIST, VAE mit Gesichtern, CycleGAN und ESRGAN) laufen in Jupyter oder Colab.</p>

  <h3 id="gen-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#cnn-ablauf">CNN</a>. Was sich ändert: Es gibt keine Labels, der Loss hängt vom Modelltyp ab, und die Validation besteht vor allem darin, <b>erzeugte Beispiele anzusehen</b>.</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="genFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines Generative-Models-Projekts: Daten ohne Labels, Modell wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward pass, Loss, Backpropagation und Update, danach erzeugte Beispiele prüfen und zum Schluss neue Beispiele generieren">
      ${LernApp.nnFlow({
        id: 'gn',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Daten', 'Bilder, keine Labels'],
          ['Modell wählen', 'Autoencoder, VAE, PixelCNN, GAN'],
          ['Loss und Optimizer', 'Rekonstruktion + KL, BCE, adversarial'],
          ['Forward Pass', 'Encoder → z → Decoder (oder Generator)'],
          ['Loss berechnen', 'Abstand zum Eingabebild / Urteil'],
          ['Backpropagation', 'Reparametrisierungs-Trick beim VAE'],
          ['Parameter aktualisieren', 'w ← w − α · ∂L/∂w'],
          ['Beispiele prüfen', 'scharf? vielfältig? sinnvoll?'],
          ['Generieren', 'z ziehen, interpolieren'],
        ],
        loopA: ['pro Mini-Batch,', 'viele Epochs'],
        loopB: ['Tuning:', 'Grösse von z,', 'Architektur, Loss'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Schliessen">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Die Schritte 4 bis 7 (orange gestrichelt, innen) laufen für jeden Mini-Batch. Der äussere Loop ist das Tuning. Schritt 9 (orange) ist das Ziel: neue Beispiele.</figcaption>
  </figure>

  <h3 id="gen-ae">1 · Autoencoder: komprimieren und rekonstruieren</h3>
  <p>Ein <b>Autoencoder</b> besteht aus zwei Netzen. Der <b>Encoder</b> presst das Bild auf einen kleinen Vektor <b>z</b> (den <b>Code</b> im <b>Latent Space</b>), der <b>Decoder</b> baut daraus das Bild wieder auf. Das Ziel ist die Eingabe selbst:</p>
  <pre><code>Bild x  →  Encoder  →  z (z. B. 32 Zahlen)  →  Decoder  →  x̂
Loss = Abstand(x, x̂)       # MSE oder Binary Cross-Entropy</code></pre>
  <p>Weil z viel kleiner ist als das Bild, muss das Netz das Wesentliche behalten (ein Engpass, <i>Bottleneck</i>). Das ist Dimensionsreduktion wie <a href="#unsup">PCA</a>, aber nichtlinear. Gebraucht wird er für Kompression, Denoising (verrauschtes Bild rein, sauberes als Ziel) und Anomalie-Erkennung (hoher Rekonstruktionsfehler = ungewöhnliches Bild).</p>
  <div class="falle"><b>Falle</b><p>Ein normaler Autoencoder ist <b>kein</b> guter Generator. Die Codes der Trainingsbilder liegen als verstreute Inseln im Latent Space, dazwischen ist leer. Zieht man ein zufälliges z, dekodiert der Decoder Unsinn. Genau dieses Problem löst der VAE.</p></div>

  <h3 id="gen-vae">2 · Variational Autoencoder (VAE): ein Latent Space, aus dem man ziehen kann</h3>
  <p>Der Encoder des VAE gibt <b>keinen Punkt</b> aus, sondern eine <b>Verteilung</b>: pro Dimension einen Mittelwert <b>μ</b> und eine Streuung <b>σ</b>. Daraus wird z gezogen, und der Decoder baut das Bild aus diesem z. Zwei Dinge sorgen dafür, dass der Raum nutzbar wird:</p>
  <ul>
    <li><b>Der Loss hat zwei Teile:</b> <code>Loss = Rekonstruktion + KL</code>. Die Rekonstruktion verlangt, dass das Bild wieder entsteht. Der <b>KL-Term</b> (Kullback-Leibler-Divergenz) zieht jede Verteilung N(μ, σ²) zur Standardnormalverteilung N(0, 1). Pro Dimension: <code>½ (μ² + σ² − ln σ² − 1)</code>; er ist 0 bei μ = 0 und σ = 1.</li>
    <li><b>Reparametrisierungs-Trick:</b> Durch ein Zufallsziehen kann man nicht ableiten. Man schreibt deshalb <code>z = μ + σ · ε</code> mit <code>ε ~ N(0, 1)</code>. Der Zufall steckt jetzt in ε, und Backpropagation läuft durch μ und σ.</li>
  </ul>
  <div class="demo" id="vaDemo">
    <div class="tag">Demo</div><h4>Latent Space mit 2 Dimensionen</h4>
    <p class="hint">Der orange Punkt ist μ eines Bildes, die blauen Punkte sind 40 Ziehungen z = μ + σ · ε. Die gestrichelten Kreise zeigen N(0, 1) (1 und 2 Standardabweichungen). Bringe μ nach (0, 0) und σ auf 1: Dann ist der KL-Term 0.</p>
    <div class="ctl"><label for="vaM1">μ₁</label><input type="range" id="vaM1" min="-2.5" max="2.5" step="0.1" value="1.2"><output id="vaM1O"></output></div>
    <div class="ctl"><label for="vaM2">μ₂</label><input type="range" id="vaM2" min="-2.5" max="2.5" step="0.1" value="-0.8"><output id="vaM2O"></output></div>
    <div class="ctl"><label for="vaS">σ</label><input type="range" id="vaS" min="0.05" max="1.5" step="0.05" value="0.5"><output id="vaSO"></output></div>
    <svg class="plot" id="vaSvg" viewBox="0 0 300 240" style="max-width:420px" role="img" aria-label="Zweidimensionaler Latent Space mit Mittelwert, 40 gezogenen Punkten und Standardnormalverteilung als Kreisen"></svg>
    <div class="stats"><span>KL-Term <b id="vaKL"></b></span></div>
    <p class="hint" id="vaMsg"></p>
  </div>
  <p>Weil alle Verteilungen nahe bei N(0, 1) liegen und sich überlappen, ist der Raum <b>ohne Lücken</b> gefüllt. Danach kann man:</p>
  <ul>
    <li><b>Neue Bilder erzeugen:</b> z ~ N(0, 1) ziehen, nur den Decoder anwenden.</li>
    <li><b>Interpolieren:</b> zwei Bilder kodieren, z auf der Geraden dazwischen dekodieren; das Bild geht fliessend von A nach B (Pose, Licht, Ausdruck).</li>
    <li><b>Latente Dimensionen verändern:</b> eine Richtung im Raum verschieben und sehen, was sich ändert. Welche Eigenschaft eine Richtung steuert, lernt das Netz ohne Labels; man muss es ausprobieren.</li>
  </ul>
  <p>Der Preis: VAE-Bilder sind oft etwas <b>unscharf</b>, weil der Rekonstruktions-Loss auf Mittelwerte zielt. Ein Gewicht vor dem KL-Term steuert den Kompromiss zwischen scharfen Rekonstruktionen und einem sauberen Raum.</p>
  <div class="merk"><b>Merksatz</b><p>Autoencoder: Bild → Punkt → Bild. VAE: Bild → Verteilung → gezogener Punkt → Bild, und der KL-Term hält den Raum geordnet, sodass man aus N(0, 1) ziehen und Bilder neu erzeugen kann.</p></div>

  <h3 id="gen-pixel">3 · PixelCNN: ein Pixel nach dem anderen</h3>
  <p>Ein <b>autoregressives</b> Modell zerlegt das Bild in eine Folge: Das Bild ist ein Produkt von Wahrscheinlichkeiten, jeder Pixel hängt von allen vorherigen ab (Zeile für Zeile, links nach rechts):</p>
  <pre><code>p(Bild) = p(Pixel₁) · p(Pixel₂ | Pixel₁) · p(Pixel₃ | Pixel₁, Pixel₂) · …</code></pre>
  <p>Das <b>PixelCNN</b> setzt das mit <b>maskierten Faltungen</b> um: Der Filter wird so abgedeckt, dass er nur Pixel <i>oberhalb und links</i> des aktuellen Pixels sieht. Die erste Schicht (Maske <b>A</b>) sieht den aktuellen Pixel selbst nicht, die späteren (Maske <b>B</b>) dürfen die verarbeitete Information darüber nutzen. Ohne Maske könnte das Netz einfach den Pixel abschreiben, den es vorhersagen soll.</p>
  <ul>
    <li><b>Training:</b> Alle Pixel eines echten Bildes werden gleichzeitig vorhergesagt (schnell, parallel). Loss: Binary Cross-Entropy pro Pixel bei Schwarz-Weiss (MNIST), 256-Klassen-Softmax bei Graustufen.</li>
    <li><b>Generieren:</b> Man startet mit leerem Bild, sagt Pixel 1 voraus, <b>würfelt</b> ihn nach seiner Wahrscheinlichkeit, schreibt ihn ins Bild und macht mit dem nächsten weiter: 784 Durchläufe für ein 28 × 28-Bild. Das ist langsam.</li>
  </ul>
  <div class="demo" id="pxDemo">
    <div class="tag">Demo</div><h4>PixelCNN zeichnet eine 7 auf einem 8 × 8-Raster</h4>
    <p class="hint">Schiebe den Regler: Links siehst du, welche Pixel das Netz für den orangen Pixel sehen darf (blau, nur davor). Rechts das Bild, das bis dahin gewürfelt wurde. Die Wahrscheinlichkeiten sind vorgegeben und stehen für ein trainiertes Netz. «Neu würfeln» ergibt eine andere 7.</p>
    <div class="ctl"><label for="pxK">Aktueller Pixel</label><input type="range" id="pxK" min="0" max="63" step="1" value="20"><output id="pxKO"></output></div>
    <div class="btnrow"><button id="pxNew">Neu würfeln</button></div>
    <svg class="plot" id="pxSvg" viewBox="0 0 410 200" style="max-width:520px" role="img" aria-label="Links die Maske des PixelCNN, rechts das bis zum aktuellen Pixel gezeichnete Bild"></svg>
    <div class="stats"><span>p(Pixel = 1) <b id="pxP"></b></span></div>
    <p class="hint" id="pxMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>PixelCNN ist ein Klassifikator, der den nächsten Pixel vorhersagt. Die Maske verhindert Spicken. Training ist parallel, Generieren ist Pixel für Pixel und darum langsam. Dafür gibt es eine echte Wahrscheinlichkeit für jedes Bild.</p></div>

  <h3 id="gen-gan">4 · GAN: Fälscher gegen Prüfer</h3>
  <p>Ein <b>Generative Adversarial Network</b> besteht aus zwei Netzen, die gegeneinander trainiert werden:</p>
  <ul>
    <li>Der <b>Generator</b> G macht aus Zufallsrauschen <code>z</code> ein Bild (der Fälscher).</li>
    <li>Der <b>Discriminator</b> D bekommt echte und erzeugte Bilder und sagt, ob sie echt sind (der Prüfer; eine binäre Klassifikation).</li>
  </ul>
  <pre><code>D lernt:  echte Bilder → 1,  G(z) → 0
G lernt:  D soll G(z) für echt (1) halten</code></pre>
  <p>Beide verbessern sich gegenseitig: Je besser der Prüfer, desto besser muss der Fälscher werden. Es gibt keinen Rekonstruktions-Loss; der Generator wird nur daran gemessen, ob D sich täuschen lässt. Das ergibt <b>sehr scharfe</b> Bilder, aber das Training ist heikel:</p>
  <ul>
    <li><b>Gleichgewicht:</b> Wird D zu stark, bekommt G keinen brauchbaren Gradienten; wird D zu schwach, lernt G nichts.</li>
    <li><b>Mode Collapse:</b> G findet ein paar Bilder, die D täuschen, und erzeugt nur noch diese.</li>
    <li><b>Kein Loss, der Qualität zeigt:</b> Die Kurven sagen wenig; man muss Bilder ansehen.</li>
  </ul>
  <p>Wichtige Varianten aus dem Kurs: <b>CycleGAN</b> übersetzt ein Bild in einen anderen Stil ohne gepaarte Beispiele (Sommer ↔ Winter; der Zyklus A → B → A soll das Original ergeben). <b>ESRGAN</b> ist ein GAN für Super-Resolution (4× grösser): schärfer als Bicubic, aber mit <i>erfundenen</i> Details. <b>DeblurGAN</b> nutzt dasselbe Prinzip zum Entschärfen von Unschärfe (siehe <a href="#cv-restauration">Computer Vision</a>).</p>
  <div class="merk"><b>Merksatz</b><p>GAN = Wettlauf zwischen Generator und Discriminator. Ergebnis: scharfe, realistische Bilder; Preis: instabiles Training und Mode Collapse.</p></div>

  <h3 id="gen-methoden">5 · Übersicht: vier Wege zu neuen Bildern</h3>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Idee</th><th>Loss</th><th>Stärke</th><th>Schwäche</th></tr>
    <tr><td><b>Autoencoder</b></td><td>Bild → z → Bild</td><td>Rekonstruktion</td><td>Kompression, Denoising, Anomalien</td><td>Kein brauchbarer Generator</td></tr>
    <tr><td><b>VAE</b></td><td>Encoder gibt μ, σ; z gezogen; Decoder</td><td>Rekonstruktion + KL</td><td>Geordneter Latent Space, Interpolation, stabil</td><td>Etwas unscharfe Bilder</td></tr>
    <tr><td><b>PixelCNN</b></td><td>Pixel für Pixel mit maskierter Faltung</td><td>BCE / Cross-Entropy pro Pixel</td><td>Echte Wahrscheinlichkeit, einfaches Training</td><td>Generieren sehr langsam</td></tr>
    <tr><td><b>GAN</b></td><td>Generator gegen Discriminator</td><td>adversarial (zwei Losses)</td><td>Sehr scharfe Bilder, Bild-zu-Bild</td><td>Instabil, Mode Collapse</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Alle vier lernen die Datenverteilung ohne Labels. Autoencoder und VAE gehen über einen komprimierten Latent Space, PixelCNN über eine Pixelfolge, GAN über einen Wettstreit. Die Wahl ist ein Kompromiss zwischen Schärfe, Stabilität und Geschwindigkeit.</p></div>

  <h3 id="gen-best">6 · Best Practices</h3>
  <p>Bei generativen Modellen gibt es keine einzelne richtige Ausgabe. Die Loss allein sagt darum wenig über die Qualität.</p>
  <div class="bp-check">
    <div><b>Qualität prüfen</b><ul>
      <li>Erzeugte Bilder regelmässig ansehen, am besten immer aus denselben festen <code>z</code>-Vektoren, damit man den Fortschritt vergleichen kann.</li>
      <li>Vielfalt prüfen: Sehen alle Bilder fast gleich aus, ist es Mode Collapse.</li>
      <li>Zu jedem erzeugten Bild das ähnlichste Trainingsbild suchen: Das Modell soll neue Bilder erzeugen, nicht Trainingsbilder kopieren.</li>
      <li>Kennzahlen wie FID nur mit vielen Beispielen und gleichen Einstellungen vergleichen.</li>
    </ul></div>
    <div><b>Training</b><ul>
      <li>Autoencoder und VAE: mit kleinem Latent Space anfangen. Beim VAE das Gewicht der KL-Divergenz im Blick behalten (zu gross: unscharf, zu klein: kein brauchbarer Latent Space).</li>
      <li>GAN: Generator und Discriminator im Gleichgewicht halten. Gewinnt der Discriminator immer, lernt der Generator nichts mehr.</li>
      <li>Seeds fixieren und Checkpoints speichern: GAN-Training kann plötzlich kippen.</li>
    </ul></div>
    <div><b>Verantwortung</b><ul>
      <li>Lizenz und Herkunft der Trainingsbilder klären.</li>
      <li>Erzeugte Bilder als solche kennzeichnen, vor allem bei Gesichtern (Deepfakes).</li>
    </ul></div>
  </div>
  <div class="merk"><b>Merksatz</b><p>Bilder ansehen statt nur der Loss, Vielfalt und Kopien prüfen, Kennzahlen nur gleich eingestellt vergleichen und erzeugte Bilder kennzeichnen.</p></div>
`,
    quiz: [
      { q: `Was unterscheidet ein generatives Modell von einem Klassifikator?`, a: `Der Klassifikator bildet ein Bild auf ein Label ab. Ein generatives Modell lernt, wie die Daten selbst aussehen, und kann neue Beispiele erzeugen. Es braucht keine Labels.` },
      { q: `Aus welchen zwei Teilen besteht ein Autoencoder, und was ist sein Trainingsziel?`, a: `Encoder (Bild → kleiner Code z) und Decoder (z → Bild). Ziel ist, die Eingabe wieder zu rekonstruieren; der Loss ist der Abstand zwischen x und x̂.` },
      { q: `Warum erzeugt ein normaler Autoencoder aus einem zufälligen z keine guten Bilder?`, a: `Die Codes der Trainingsbilder bilden verstreute Inseln, dazwischen ist der Latent Space leer und ungeordnet. Ein zufälliges z landet meist in einer Lücke.` },
      { q: `Was gibt der Encoder eines VAE aus, und wie entsteht z?`, a: `Pro Dimension einen Mittelwert μ und eine Streuung σ. Dann wird <code>z = μ + σ · ε</code> mit <code>ε ~ N(0, 1)</code> gezogen.` },
      { q: `Wozu der Reparametrisierungs-Trick?`, a: `Durch ein Zufallsziehen fliesst kein Gradient. Mit z = μ + σ · ε liegt der Zufall in ε; μ und σ sind ableitbar, also funktioniert Backpropagation.` },
      { q: `Was bewirkt der KL-Term im VAE-Loss, und wann ist er 0?`, a: `Er zieht jede Verteilung N(μ, σ²) in Richtung N(0, 1) und hält den Latent Space geordnet und lückenlos. Er ist 0 bei μ = 0 und σ = 1.` },
      { q: `Wie erzeugt man mit einem trainierten VAE ein neues Bild, und was bedeutet Interpolation?`, a: `z aus N(0, 1) ziehen und nur den Decoder anwenden. Interpolation: zwei Bilder kodieren und die Punkte auf der Geraden zwischen ihren Codes dekodieren; das Bild geht fliessend von A nach B.` },
      { q: `Wozu die Maske beim PixelCNN, und was ist der Unterschied zwischen Maske A und B?`, a: `Das Netz darf für einen Pixel nur Pixel oberhalb und links sehen, sonst würde es den Zielpixel abschreiben. Maske A (erste Schicht) blendet auch den aktuellen Pixel aus, Maske B (spätere Schichten) lässt die bereits verarbeitete Information darüber zu.` },
      { q: `Warum ist Training beim PixelCNN schnell, das Generieren aber langsam?`, a: `Training: Alle Pixel eines echten Bildes sind bekannt und werden parallel vorhergesagt. Generieren: Jeder Pixel hängt vom soeben gewürfelten ab, also 784 Schritte nacheinander bei 28 × 28.` },
      { q: `Wie funktioniert ein GAN?`, a: `Der Generator macht aus Rauschen ein Bild, der Discriminator unterscheidet echte von erzeugten Bildern. Beide werden im Wechsel trainiert; der Generator wird besser, wenn der Discriminator sich täuschen lässt.` },
      { q: `Nenne zwei typische Probleme beim GAN-Training.`, a: `Mode Collapse (nur wenige verschiedene Bilder), unausgewogener Discriminator (zu stark: kein Gradient für den Generator), keine aussagekräftige Loss-Kurve für die Bildqualität.` },
      { q: `Welches Modell würdest du für ein 4×-Upscaling mit scharfen Details wählen, und was ist der Haken?`, a: `Ein GAN wie ESRGAN: schärfer als Bicubic. Haken: Die Details sind erfunden und stimmen nicht mit der Wirklichkeit überein, was bei Messbildern ein Risiko ist.` },
      { q: `Warum reicht bei generativen Modellen eine Loss-Kurve zur Validation nicht?`, a: `Der Loss sagt wenig über Schärfe und Vielfalt. Man muss erzeugte Beispiele ansehen (oder Metriken wie FID nutzen) und auf Unschärfe, Mode Collapse und Fehler achten.` },
    ],
    init() {
      LernApp.demos.gen();
    },
  });
})();
