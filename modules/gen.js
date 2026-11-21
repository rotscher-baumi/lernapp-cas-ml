/* Module: Generative Models (Modul 3, Teil 4). Content lives in the html field; figures and demos live in assets/demos-gen.js. */
(function () {
  const F = LernApp.genFig;
  LernApp.register({
    id: 'gen',
    order: 94.5,
    nav: 'Generative Models',
    title: `Generative Models`,
    kicker: `Modul 3 · Generative Models · Sa 21.11.`,
    summary: `Diskriminativ und generativ, Taxonomie, Autoencoder, VAE (Latent Space, KL, Reparametrisierung), PixelCNN, GAN (Minimax, Mode Collapse), Diffusion (DDPM, Noise Schedule), Conditional Diffusion und Stable Diffusion (Guidance Scale), Bewerten (FID)`,
    html: `  <p>Bisher hat ein Modell eine Eingabe auf ein Ergebnis abgebildet: ein Bild auf ein Label, eine Wohnung auf einen Preis. Ein <b>generatives Modell</b> lernt dagegen, <b>wie die Daten selbst aussehen</b>, und kann danach neue, ähnliche Beispiele erzeugen: neue Ziffern, neue Gesichter, ein Sommerbild als Winterbild, ein Bild aus einem Satz. Dafür braucht es keine Labels; die Bilder selbst sind das Ziel.</p>
  <p>Das Kapitel folgt dem Kurstag: zuerst die Frage, was «generativ» genau heisst, dann vier Modellfamilien in der Reihenfolge, in der sie entstanden sind: <b>VAE</b> (2013), <b>GAN</b> (2014), <b>PixelCNN</b> (2016) und <b>Diffusion</b> (2020), zum Schluss Text-zu-Bild mit Stable Diffusion. Für jedes Modell gibt es Idee, Aufbau, Loss, den Ablauf von Training und Generieren und die typischen Probleme.</p>
  <p class="note">Die Demos rechnen im Browser mit kleinen Beispielen. Die Kurs-Notebooks (Autoencoder und VAE auf MNIST, Gesichter mit dem VAE von Stable Diffusion, GAN mit Mode Collapse, ESRGAN und CycleGAN, Diffusion von Grund auf und Text-zu-Bild mit Stable Diffusion) laufen in Jupyter oder Colab.</p>

  <h3 id="gen-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Der Ablauf ist derselbe wie beim <a href="#cnn-ablauf">CNN</a>. Was sich ändert: Es gibt keine Labels, der Loss hängt vom Modelltyp ab, die Validation besteht vor allem darin, <b>erzeugte Beispiele anzusehen</b>, und am Ende steht ein eigener Schritt: das Generieren (Sampling).</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="genFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Ablauf eines Generative-Models-Projekts: Daten ohne Labels, Modell wählen, Loss und Optimizer festlegen, dann der Trainings-Loop aus Forward Pass, Loss, Backpropagation und Update, danach erzeugte Beispiele prüfen und zum Schluss neue Beispiele generieren">
      ${LernApp.nnFlow({
        id: 'gn',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Daten', 'Bilder ohne Labels, evtl. Bedingung y'],
          ['Modell wählen', 'VAE, GAN, PixelCNN, Diffusion'],
          ['Loss und Optimizer', 'Rekonstruktion + KL, adversarial, MSE auf Rauschen'],
          ['Forward Pass', 'Encoder → z → Decoder, G → D, U-Net(x_t, t)'],
          ['Loss berechnen', 'Abstand zu Bild, Urteil oder Rauschen'],
          ['Backpropagation', 'Reparametrisierung, Gradient durch D'],
          ['Parameter aktualisieren', 'beim GAN: D und G im Wechsel'],
          ['Beispiele prüfen', 'scharf? vielfältig? keine Kopien? FID'],
          ['Generieren', 'z ziehen oder Rauschen entrauschen'],
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

  <h3 id="gen-was">1 · Diskriminativ und generativ: Was ist ein generatives Modell?</h3>
  <p>Alle Modelle der bisherigen Kapitel sind <b>diskriminativ</b>: Sie bekommen ein Beispiel <code>x</code> und sagen ein Label <code>y</code> voraus. Mathematisch lernen sie <code>p(y | x)</code>, und es gibt <b>eine</b> richtige Antwort. Ein <b>generatives</b> Modell geht in die andere Richtung: Es bekommt (höchstens) eine Beschreibung <code>y</code> und erzeugt ein Beispiel <code>x</code>. Es lernt <code>p(x | y)</code> oder ohne Bedingung <code>p(x)</code>, also die <b>Verteilung der Daten</b>.</p>
  <figure class="fig" style="max-width:640px">${F.discGen()}<figcaption>Zum Label «Hund» gibt es unzählige passende Bilder. Ein generatives Modell liefert bei jedem Aufruf ein anderes, indem es aus der gelernten Verteilung zieht.</figcaption></figure>
  <ul>
    <li><b>Viele mögliche Ausgaben:</b> Zu einer Eingabe passen viele Ergebnisse, einige plausibler als andere. Darum <b>zieht</b> man eine Ausgabe: <code>x′ ~ p(x | y)</code>. Zweimal ziehen gibt zwei verschiedene Bilder.</li>
    <li><b>Die Ausgabe ist reicher als die Eingabe:</b> Ein Wort («Hund») wird zu Hunderttausenden Pixeln. Das Modell muss alle Details selbst ergänzen.</li>
    <li><b>Generativ kann auch klassifizieren:</b> Mit der Bayes-Regel <code>p(y | x) = p(x | y) · p(y) / p(x)</code> lässt sich aus einem generativen Modell ein Klassifikator machen. Umgekehrt geht es nicht.</li>
  </ul>
  <p>Ein tiefes generatives Modell hat immer drei Teile:</p>
  <div class="steps">
    <div class="st"><b>1 · Darstellung</b><span>Ein neuronales Netz beschreibt die Verteilung, oft über einen kleinen Latent Space z.</span></div><div class="ar">→</div>
    <div class="st"><b>2 · Training</b><span>Ein Loss, der die Netzverteilung den Daten annähert. Die Parameter werden wie immer mit Backpropagation optimiert.</span></div><div class="ar">→</div>
    <div class="st"><b>3 · Sampling</b><span>Ein Verfahren, um aus dem trainierten Modell neue Beispiele zu ziehen.</span></div>
  </div>
  <h4>Taxonomie: vier Familien</h4>
  <p>Die Modelle unterscheiden sich darin, ob sie die Wahrscheinlichkeit <code>p(x)</code> eines Bildes ausrechnen können (<b>explizite</b> Dichte) oder nur Bilder erzeugen, ohne eine Wahrscheinlichkeit zu kennen (<b>implizite</b> Dichte).</p>
  <figure class="fig" style="max-width:720px">${F.taxonomy()}</figure>
  <div class="tablewrap"><table>
    <tr><th>Jahr</th><th>Modell</th><th>Idee in einem Satz</th></tr>
    <tr><td>2013</td><td><b>VAE</b> (Kingma, Welling)</td><td>Bild auf eine Verteilung im Latent Space abbilden und daraus wieder ein Bild bauen</td></tr>
    <tr><td>2014</td><td><b>GAN</b> (Goodfellow et al.)</td><td>Ein Fälscher-Netz und ein Prüfer-Netz trainieren sich gegenseitig</td></tr>
    <tr><td>2016</td><td><b>PixelCNN</b> (van den Oord et al.)</td><td>Ein Bild Pixel für Pixel vorhersagen, jeder abhängig von den vorherigen</td></tr>
    <tr><td>2020</td><td><b>Diffusion / DDPM</b> (Ho et al.)</td><td>Lernen, Rauschen Schritt für Schritt aus einem Bild zu entfernen</td></tr>
    <tr><td>2022</td><td><b>Stable Diffusion</b> (Rombach et al.)</td><td>Diffusion im Latent Space eines VAE, gesteuert durch Text</td></tr>
  </table></div>
  <p>Kein Modell ist in allem gut. Man spricht vom <b>Trilemma</b> generativer Modelle: hohe <b>Qualität</b>, grosse <b>Vielfalt</b> und <b>schnelles</b> Sampling gleichzeitig ist schwer. GANs sind scharf und schnell, aber wenig vielfältig. VAEs sind schnell und vielfältig, aber unscharf. Diffusion ist scharf und vielfältig, aber langsam.</p>
  <div class="merk"><b>Merksatz</b><p>Diskriminativ: <code>x → y</code>, eine richtige Antwort, <code>p(y | x)</code>. Generativ: <code>y → x</code>, viele mögliche Antworten, <code>p(x | y)</code>, und man zieht daraus. Jedes generative Modell braucht Darstellung, Training und Sampling.</p></div>

  <h3 id="gen-ae">2 · Autoencoder: komprimieren und rekonstruieren</h3>
  <p>Der Autoencoder ist noch kein Generator, aber er ist der Baustein für den VAE und für Stable Diffusion. Er besteht aus zwei Netzen: Der <b>Encoder</b> <code>f</code> presst das Bild auf einen kleinen Vektor <b>z</b> (den <b>Code</b> im <b>Latent Space</b>), der <b>Decoder</b> <code>g</code> baut daraus das Bild wieder auf. Das Ziel ist die Eingabe selbst: <code>g(f(x)) ≈ x</code>.</p>
  <figure class="fig" style="max-width:600px">${F.ae()}</figure>
  <p>Weil z viel kleiner ist als das Bild (z. B. 32 statt 784 Zahlen), muss das Netz das Wesentliche behalten: ein Engpass, der <b>Bottleneck</b>. Das ist Dimensionsreduktion wie <a href="#unsup-pca">PCA</a>, aber nichtlinear.</p>
  <h4>Ablauf des Trainings</h4>
  <ol>
    <li>Einen Mini-Batch Bilder <code>x</code> nehmen (Pixel auf [0, 1] skaliert). Labels braucht es nicht.</li>
    <li><b>Encoder:</b> <code>z = f(x)</code>, z. B. 784 → 256 → 32.</li>
    <li><b>Decoder:</b> <code>x̂ = g(z)</code>, spiegelbildlich 32 → 256 → 784, Sigmoid am Ausgang.</li>
    <li><b>Loss:</b> Abstand zwischen <code>x</code> und <code>x̂</code>, MSE oder Binary Cross-Entropy pro Pixel.</li>
    <li>Backpropagation durch Decoder <i>und</i> Encoder, beide werden gemeinsam trainiert.</li>
  </ol>
  <pre><code>class AutoEncoder(nn.Module):                  # PyTorch, wie im Kurs-Notebook
    def __init__(self, d=32):
        super().__init__()
        self.enc = nn.Sequential(nn.Flatten(), nn.Linear(784, 256), nn.ReLU(), nn.Linear(256, d))
        self.dec = nn.Sequential(nn.Linear(d, 256), nn.ReLU(), nn.Linear(256, 784), nn.Sigmoid())
    def forward(self, x):
        z = self.enc(x)
        return self.dec(z).view_as(x)

x_hat = model(x)
loss = F.binary_cross_entropy(x_hat, x)        # Ziel = Eingabe, keine Labels</code></pre>
  <p>Gebraucht wird er für <b>Kompression</b> und als Feature-Extraktor, für <b>Denoising</b> (verrauschtes Bild rein, sauberes als Ziel) und für die <b>Anomalie-Erkennung</b> (hoher Rekonstruktionsfehler = ungewöhnliches Bild, weil das Netz nur «normale» Bilder gut nachbauen kann). Vorteile: einfach und stabil zu trainieren. Grenzen: Encoder und Decoder sind <b>deterministisch</b>, es gibt keine Unsicherheit und vor allem keine Möglichkeit, sinnvoll neue Bilder zu ziehen.</p>
  <div class="falle"><b>Falle</b><p>Ein normaler Autoencoder ist <b>kein</b> guter Generator. Die Codes der Trainingsbilder liegen als verstreute Inseln im Latent Space, dazwischen ist leer und ungeordnet. Zieht man ein zufälliges z, landet es meist in einer Lücke, und der Decoder baut Unsinn. Genau dieses Problem löst der VAE.</p></div>

  <h3 id="gen-vae">3 · Variational Autoencoder (VAE): ein Latent Space, aus dem man ziehen kann</h3>
  <p>Der VAE dreht die Idee um: Zuerst gibt es eine einfache Verteilung im Latent Space, <code>z ~ p(z) = N(0, I)</code>, und der Decoder macht daraus ein Bild, <code>p_θ(x | z)</code>. Damit das funktioniert, muss jeder Punkt in der Nähe des Ursprungs zu einem sinnvollen Bild führen. Der Encoder <code>q_φ(z | x)</code> gibt darum <b>keinen Punkt</b> aus, sondern eine <b>Verteilung</b>: pro Dimension einen Mittelwert <b>μ</b> und eine Streuung <b>σ</b>.</p>
  <figure class="fig" style="max-width:600px">${F.vae()}</figure>
  <h4>Der Loss hat zwei Teile</h4>
  <pre><code>Loss = Rekonstruktion  +  β · KL( N(μ, σ²) ‖ N(0, I) )
KL pro Dimension = ½ · (μ² + σ² − ln σ² − 1)          # 0 genau bei μ = 0, σ = 1</code></pre>
  <ul>
    <li><b>Rekonstruktion:</b> Das gezogene z soll wieder zum Eingabebild führen (MSE oder BCE wie beim Autoencoder). Dieser Teil allein würde σ gegen 0 drücken, und der VAE würde zum normalen Autoencoder.</li>
    <li><b>KL-Term</b> (Kullback-Leibler-Divergenz, die Regularisierung): zieht jede Verteilung N(μ, σ²) zur Standardnormalverteilung. So überlappen sich die Verteilungen aller Bilder, und der Raum hat <b>keine Lücken</b>.</li>
    <li><b>β</b> gewichtet die beiden Ziele (im Notebook <code>beta=1.0</code>). Grösseres β: geordneterer Raum, aber unschärfere Bilder. Kleineres β: schärfere Rekonstruktion, aber Lücken im Raum.</li>
  </ul>
  <p><b>Reparametrisierungs-Trick:</b> Durch ein Zufallsziehen kann man nicht ableiten. Man schreibt deshalb <code>z = μ + σ · ε</code> mit <code>ε ~ N(0, I)</code>. Der Zufall steckt jetzt in ε, und Backpropagation läuft durch μ und σ in den Encoder. In der Praxis gibt der Encoder <code>log σ²</code> aus, weil das jeden Wert annehmen darf, während σ positiv sein muss.</p>
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
  <h4>Ablauf des Trainings</h4>
  <ol>
    <li>Mini-Batch <code>x</code> nehmen.</li>
    <li><b>Encoder:</b> <code>μ, log σ² = f(x)</code> (zwei Ausgabeköpfe).</li>
    <li><b>Ziehen:</b> <code>ε ~ N(0, I)</code>, <code>z = μ + σ · ε</code>.</li>
    <li><b>Decoder:</b> <code>x′ = g(z)</code>.</li>
    <li><b>Loss:</b> Rekonstruktion(x, x′) + β · KL(μ, σ), Backpropagation, Update.</li>
  </ol>
  <pre><code>mu, logvar = model.encode(x)
z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)        # Reparametrisierung
x_rec = model.decode(z)
rec = F.binary_cross_entropy(x_rec, x, reduction="sum")
kl = -0.5 * torch.sum(1 + logvar - mu**2 - logvar.exp())
loss = rec + beta * kl</code></pre>
  <h4>Ablauf beim Generieren</h4>
  <p>Für neue Bilder braucht es <b>nur den Decoder</b>: <code>z ~ N(0, I)</code> ziehen, <code>x = g(z)</code>. Der Encoder wird nur zum Training und zum Kodieren echter Bilder gebraucht. Damit kann man:</p>
  <ul>
    <li><b>Neue Bilder erzeugen:</b> viele zufällige z dekodieren.</li>
    <li><b>Interpolieren:</b> zwei Bilder kodieren, die Punkte auf der Geraden zwischen ihren Codes dekodieren. Das Bild geht fliessend von A nach B (Pose, Licht, Ausdruck). Bei einem normalen Autoencoder entstehen dazwischen Mischbilder oder Unsinn.</li>
    <li><b>Am Latent Space drehen:</b> eine Richtung im Raum verschieben und sehen, was sich ändert (im Notebook als 2D-Gitter). Welche Eigenschaft eine Richtung steuert, lernt das Netz ohne Labels; man muss es ausprobieren.</li>
  </ul>
  <h4>Grenzen</h4>
  <ul>
    <li><b>Unscharfe Bilder:</b> Der Decoder wird mit einer Gauss-Annahme (MSE) trainiert. Ist unklar, wo genau eine Kante liegt, ist der Mittelwert aller Möglichkeiten die beste Antwort, und der ist verwaschen.</li>
    <li><b>Begrenzte Ausdruckskraft:</b> Ein einfacher Latent Space (Normalverteilung) kann nicht alle Feinheiten komplexer Bilder fassen.</li>
    <li><b>Fehlende Vielfalt:</b> Seltene Varianten der Daten können verloren gehen.</li>
  </ul>
  <p><b>VAEs heute:</b> Als eigener Bildgenerator ist der VAE abgelöst, als Baustein aber überall. <b>Stable Diffusion</b> nutzt einen VAE, der ein Bild von 512 × 512 × 3 auf ein Latent von 64 × 64 × 4 verkleinert (48-mal weniger Zahlen); die teure Diffusion läuft dann in diesem kleinen Raum (<a href="#gen-cond">Abschnitt 7</a>). Das Notebook lädt genau diesen VAE (<code>stabilityai/sd-vae-ft-mse</code>), kodiert Gesichter, mischt sie im Latent Space und fügt dort Rauschen hinzu: ein erster Blick auf die Diffusion.</p>
  <div class="merk"><b>Merksatz</b><p>Autoencoder: Bild → Punkt → Bild. VAE: Bild → Verteilung (μ, σ) → gezogener Punkt → Bild. Der KL-Term hält den Raum geordnet und lückenlos, der Reparametrisierungs-Trick macht das Ziehen ableitbar. Generiert wird nur mit dem Decoder aus z ~ N(0, I).</p></div>

  <h3 id="gen-pixel">4 · PixelCNN: ein Pixel nach dem anderen</h3>
  <p>Ein <b>autoregressives</b> Modell zerlegt das Bild in eine Folge und sagt immer das nächste Element vorher, so wie ein Sprachmodell das nächste Wort. Nach der Kettenregel der Wahrscheinlichkeit ist das Bild ein Produkt von Wahrscheinlichkeiten, jeder Pixel hängt von allen vorherigen ab (Zeile für Zeile, links nach rechts):</p>
  <pre><code>p(Bild) = p(Pixel₁) · p(Pixel₂ | Pixel₁) · p(Pixel₃ | Pixel₁, Pixel₂) · …</code></pre>
  <p>Damit lässt sich <code>p(x)</code> exakt ausrechnen (explizite, «tractable» Dichte). Das <b>PixelCNN</b> setzt das mit <b>maskierten Faltungen</b> um: Der Filter wird so abgedeckt, dass er nur Pixel <i>oberhalb und links</i> des aktuellen Pixels sieht. Die erste Schicht (Maske <b>A</b>) sieht den aktuellen Pixel selbst nicht, die späteren (Maske <b>B</b>) dürfen die verarbeitete Information an dieser Stelle nutzen. Ohne Maske könnte das Netz einfach den Pixel abschreiben, den es vorhersagen soll.</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Training</th><th>Generieren</th></tr>
    <tr><td><b>Eingabe</b></td><td>ein echtes Bild, alle Pixel bekannt</td><td>leeres Bild</td></tr>
    <tr><td><b>Ablauf</b></td><td>Ein Durchlauf sagt für <i>alle</i> Pixel gleichzeitig die Wahrscheinlichkeit voraus (die Maske verhindert Spicken)</td><td>Pixel 1 vorhersagen, nach seiner Wahrscheinlichkeit <b>würfeln</b>, ins Bild schreiben, dann Pixel 2 mit dem neuen Bild vorhersagen und so weiter</td></tr>
    <tr><td><b>Loss</b></td><td>Binary Cross-Entropy pro Pixel (Schwarz-Weiss) oder 256-Klassen-Softmax (Graustufen)</td><td>–</td></tr>
    <tr><td><b>Tempo</b></td><td>schnell, parallel</td><td>langsam: 784 Durchläufe für 28 × 28</td></tr>
  </table></div>
  <div class="demo" id="pxDemo">
    <div class="tag">Demo</div><h4>PixelCNN zeichnet eine 7 auf einem 8 × 8-Raster</h4>
    <p class="hint">Schiebe den Regler: Links siehst du, welche Pixel das Netz für den orangen Pixel sehen darf (blau, nur davor). Rechts das Bild, das bis dahin gewürfelt wurde. Die Wahrscheinlichkeiten sind vorgegeben und stehen für ein trainiertes Netz. «Neu würfeln» ergibt eine andere 7.</p>
    <div class="ctl"><label for="pxK">Aktueller Pixel</label><input type="range" id="pxK" min="0" max="63" step="1" value="20"><output id="pxKO"></output></div>
    <div class="btnrow"><button id="pxNew">Neu würfeln</button></div>
    <svg class="plot" id="pxSvg" viewBox="0 0 410 200" style="max-width:520px" role="img" aria-label="Links die Maske des PixelCNN, rechts das bis zum aktuellen Pixel gezeichnete Bild"></svg>
    <div class="stats"><span>p(Pixel = 1) <b id="pxP"></b></span></div>
    <p class="hint" id="pxMsg"></p>
  </div>
  <p>Dieselbe Idee steckt in Bild-Transformern, die ein Bild als Folge von Tokens erzeugen. Sie hat den Vorteil einer echten Wahrscheinlichkeit pro Bild (gut zum Vergleichen von Modellen und für Anomalien) und den Nachteil des langsamen Generierens.</p>
  <div class="merk"><b>Merksatz</b><p>PixelCNN ist ein Klassifikator für den nächsten Pixel. Die Maske verhindert Spicken. Training ist parallel, Generieren ist Pixel für Pixel und darum langsam. Dafür gibt es eine echte Wahrscheinlichkeit für jedes Bild.</p></div>

  <h3 id="gen-gan">5 · GAN: Fälscher gegen Prüfer</h3>
  <p>Ein <b>Generative Adversarial Network</b> rechnet keine Wahrscheinlichkeit aus (implizite Dichte). Es besteht aus zwei Netzen, die gegeneinander spielen:</p>
  <ul>
    <li>Der <b>Generator</b> G macht aus Zufallsrauschen <code>z ~ N(0, I)</code> ein Bild <code>G(z)</code>. Er ist der Fälscher und sieht nie ein echtes Bild.</li>
    <li>Der <b>Discriminator</b> D bekommt echte und erzeugte Bilder und gibt eine Wahrscheinlichkeit <code>D(x) ∈ [0, 1]</code> aus, dass das Bild echt ist. Er ist der Prüfer, ein ganz normaler binärer Klassifikator.</li>
  </ul>
  <figure class="fig" style="max-width:624px">${F.gan()}</figure>
  <h4>Das Ziel: ein Minimax-Spiel</h4>
  <pre><code>min_G  max_D   E_x[ log D(x) ]  +  E_z[ log(1 − D(G(z))) ]</code></pre>
  <p>Das ist die Binary Cross-Entropy des Discriminators, einmal maximiert und einmal minimiert:</p>
  <ul>
    <li><b>D-Schritt</b> (G fest): D maximiert die Formel. Er drückt <code>D(x)</code> für echte Bilder Richtung 1 und <code>D(G(z))</code> für Fälschungen Richtung 0.</li>
    <li><b>G-Schritt</b> (D fest): G minimiert die Formel, kann aber nur den zweiten Teil beeinflussen. Er will <code>D(G(z))</code> Richtung 1 schieben. In der Praxis maximiert man <code>log D(G(z))</code> statt <code>log(1 − D(G(z)))</code> zu minimieren (<i>non-saturating</i> Loss): Am Anfang erkennt D jede Fälschung, und der ursprüngliche Ausdruck hätte dort fast keinen Gradienten.</li>
  </ul>
  <h4>Ablauf des Trainings</h4>
  <ol>
    <li>Mini-Batch echter Bilder <code>x</code> und Rauschen <code>z</code> ziehen, Fälschungen <code>G(z)</code> erzeugen.</li>
    <li><b>D-Schritt:</b> BCE mit Ziel 1 für <code>x</code> und Ziel 0 für <code>G(z)</code>. Nur die Gewichte von D aktualisieren (<code>G(z).detach()</code>).</li>
    <li><b>G-Schritt:</b> neue Fälschungen durch D schicken, BCE mit Ziel <b>1</b> («halte sie für echt»). Der Gradient fliesst durch D hindurch, aber nur die Gewichte von G werden aktualisiert.</li>
    <li>Wiederholen. Nach jeder Epoch Bilder aus <b>denselben festen z</b> erzeugen und ansehen.</li>
  </ol>
  <pre><code>opt_D = torch.optim.Adam(D.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_G = torch.optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))
for x in loader:
    z = torch.randn(len(x), z_dim)
    fake = G(z)
    # D-Schritt: echt → 1, falsch → 0
    loss_D = bce(D(x), ones) + bce(D(fake.detach()), zeros)
    opt_D.zero_grad(); loss_D.backward(); opt_D.step()
    # G-Schritt: D soll die Fälschung für echt halten
    loss_G = bce(D(fake), ones)
    opt_G.zero_grad(); loss_G.backward(); opt_G.step()</code></pre>
  <div class="demo" id="gaDemo">
    <div class="tag">Demo</div><h4>Ein GAN in einer Dimension</h4>
    <p class="hint">Die echten Daten sind Zahlen um 2 (grau, N(2, 0.5²)). Der Generator macht aus z die Zahl a · z + b (orange), der Discriminator ist eine einfache Kurve D(x) (blau, gestrichelt). Jeder Schritt ist ein D-Schritt und ein G-Schritt. Vergleiche die drei Einstellungen.</p>
    <div class="btnrow" id="gaMode" role="group" aria-label="Einstellung"><button data-v="ok" class="pri" aria-pressed="true">ausgewogen</button><button data-v="weak" aria-pressed="false">Discriminator zu schwach</button><button data-v="fast" aria-pressed="false">Generator zu schnell</button></div>
    <div class="btnrow"><button id="gaOne">1 Schritt</button><button id="gaTen">25 Schritte</button><button id="gaPlay">Abspielen</button><button id="gaReset">Neu starten</button></div>
    <svg class="plot" id="gaSvg" viewBox="0 0 400 220" role="img" aria-label="Verteilung der echten Daten, Verteilung des Generators und Kurve des Discriminators"></svg>
    <div class="stats"><span>Schritt <b id="gaStep"></b></span><span>Generator μ <b id="gaMu"></b></span><span>Generator σ <b id="gaSd"></b></span><span>Ø D(echt) <b id="gaDr"></b></span><span>Ø D(falsch) <b id="gaDf"></b></span></div>
    <p class="hint" id="gaMsg"></p>
  </div>
  <h4>Typische Probleme</h4>
  <ul>
    <li><b>Mode Collapse:</b> G findet ein paar Bilder, die D täuschen, und erzeugt nur noch diese. Im Notebook erzeugt der Generator dann fast nur noch eine einzige Ziffer. In der Demo oben schrumpft σ auf 0.</li>
    <li><b>Gleichgewicht:</b> Wird D zu stark, ist <code>D(G(z)) ≈ 0</code> überall, und G bekommt keinen brauchbaren Gradienten. Wird D zu schwach, zeigt er G nicht, was falsch ist. Lernt G zu schnell, schaukelt sich das Spiel auf.</li>
    <li><b>Kein Loss, der Qualität zeigt:</b> Die beiden Losses steigen und fallen gegeneinander; ihre Werte sagen wenig über die Bildqualität. Man muss Bilder ansehen.</li>
  </ul>
  <p>Bewährte Rezepte (DCGAN): Faltungen mit Stride statt Pooling, Batch Normalization, LeakyReLU im Discriminator, tanh am Ausgang des Generators (Pixel auf [−1, 1]), Adam mit Learning Rate 2·10⁻⁴ und β₁ = 0,5. Weitere Mittel sind Label Smoothing (echte Bilder mit Ziel 0,9 statt 1) und der Wasserstein-Loss (WGAN).</p>
  <h4>GAN gegen VAE</h4>
  <p>Weil der Generator nur daran gemessen wird, ob D sich täuschen lässt, gibt es keinen Anreiz zum Mitteln: GAN-Bilder sind <b>scharf</b>, VAE-Bilder eher weich. Dafür hat der GAN keinen Encoder, keine Wahrscheinlichkeit und ein heikles Training. Auch beim GAN steuert z das Bild: Verschiedene z ergeben verschiedene Bilder, benachbarte z ähnliche.</p>
  <h4>Varianten</h4>
  <div class="tablewrap"><table>
    <tr><th>Variante</th><th>Idee</th><th>Anwendung</th></tr>
    <tr><td><b>DCGAN</b></td><td>G und D aus Faltungsschichten</td><td>Grundlage fast aller Bild-GANs</td></tr>
    <tr><td><b>Conditional GAN</b></td><td>G und D bekommen zusätzlich ein Label y</td><td>gezielt eine bestimmte Ziffer oder Klasse erzeugen</td></tr>
    <tr><td><b>Pix2Pix</b></td><td>Bild zu Bild mit <i>gepaarten</i> Beispielen</td><td>Skizze → Foto, Karte → Luftbild</td></tr>
    <tr><td><b>CycleGAN</b></td><td>Bild zu Bild <i>ohne</i> Paare; der Zyklus A → B → A soll das Original ergeben (Cycle Consistency)</td><td>Sommer ↔ Winter, Pferd ↔ Zebra (Notebook)</td></tr>
    <tr><td><b>ESRGAN</b></td><td>Super-Resolution mit GAN-Loss</td><td>4× grösser, schärfer als Bicubic, aber mit <i>erfundenen</i> Details (Notebook, siehe <a href="#cv-restauration">Image Processing</a>)</td></tr>
    <tr><td><b>StyleGAN</b></td><td>z steuert den Stil auf jeder Auflösungsstufe</td><td>fotorealistische Gesichter</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>GAN = Minimax-Spiel zwischen Generator und Discriminator, im Wechsel trainiert. Ergebnis: scharfe, realistische Bilder in einem einzigen Durchlauf. Preis: instabiles Training, Mode Collapse und keine Loss-Kurve, die die Qualität zeigt.</p></div>

  <h3 id="gen-diff">6 · Diffusion: Rauschen Schritt für Schritt entfernen</h3>
  <p>Diffusionsmodelle stecken hinter Stable Diffusion, DALL·E und Midjourney. Die Idee: Es ist schwer, aus dem Nichts ein Bild zu erzeugen. Es ist aber leicht, ein Bild durch Rauschen zu <b>zerstören</b>. Wenn ein Netz lernt, jeden kleinen Zerstörungsschritt rückgängig zu machen, kann es bei reinem Rauschen beginnen und ein neues Bild freilegen.</p>
  <figure class="fig" style="max-width:640px">${F.diffusion()}</figure>
  <h4>Vorwärtsprozess: Rauschen hinzufügen (fest)</h4>
  <ul>
    <li>Über <b>T</b> Zeitschritte (typisch T = 1000) wird in jedem Schritt etwas Gauss-Rauschen addiert: <code>q(x_t | x_{t−1}) = N(√(1−β_t) · x_{t−1}, β_t · I)</code>.</li>
    <li>Jeder Schritt hängt nur vom vorherigen ab (<b>Markov-Kette</b>). Die kleinen Rauschmengen <code>β_t</code> bilden den <b>Noise Schedule</b>, z. B. linear von 0,0001 auf 0,02.</li>
    <li>Wegen der Gauss-Eigenschaften kann man <b>direkt</b> zu jedem t springen, ohne die Schritte davor zu rechnen:</li>
  </ul>
  <pre><code>x_t = √ᾱ_t · x₀  +  √(1 − ᾱ_t) · ε        mit ε ~ N(0, I),   ᾱ_t = (1 − β₁) · (1 − β₂) · … · (1 − β_t)</code></pre>
  <p>Bei t = 0 ist ᾱ = 1 (sauberes Bild), bei t = T ist ᾱ ≈ 0 (reines Rauschen). Dieser Teil wird <b>nicht</b> trainiert; er ist eine feste Formel.</p>
  <div class="demo" id="dfDemo">
    <div class="tag">Demo</div><h4>Ein Bild verrauschen: x_t aus x₀ und ε</h4>
    <p class="hint">Schiebe t von 0 bis 1000. Rechts siehst du ᾱ_t: wie viel vom Bild noch übrig ist. Vergleiche den linearen Noise Schedule (DDPM) mit dem Cosine-Schedule, der das Bild langsamer zerstört.</p>
    <div class="ctl"><label for="dfT">Zeitschritt t</label><input type="range" id="dfT" min="0" max="1000" step="10" value="300"><output id="dfTO"></output></div>
    <div class="btnrow" id="dfKind" role="group" aria-label="Noise Schedule"><button data-v="lin" class="pri" aria-pressed="true">linear</button><button data-v="cos" aria-pressed="false">Cosine</button><button id="dfPlay">Vorwärts abspielen</button></div>
    <svg class="plot" id="dfSvg" viewBox="0 0 510 150" style="max-width:640px" role="img" aria-label="Sauberes Bild, Rauschen und verrauschtes Bild zum gewählten Zeitschritt, daneben ᾱ über t für beide Noise Schedules"></svg>
    <div class="stats"><span>ᾱ_t <b id="dfAb"></b></span><span>Anteil Bild √ᾱ <b id="dfSi"></b></span><span>Anteil Rauschen √(1−ᾱ) <b id="dfNo"></b></span></div>
    <p class="hint" id="dfMsg"></p>
  </div>
  <h4>Rückwärtsprozess: Rauschen entfernen (gelernt)</h4>
  <p>Den Rückweg <code>p_θ(x_{t−1} | x_t)</code> kann man nicht ausrechnen; ein neuronales Netz lernt ihn. Meist sagt das Netz <code>ε_θ(x_t, t)</code> nicht das saubere Bild voraus, sondern <b>das Rauschen, das in x_t steckt</b>. Zieht man einen Teil davon ab, ist man einen Schritt näher am Bild. Als Netz dient ein <b>U-Net</b> (Encoder-Decoder mit Skip Connections, wie bei der <a href="#det-seg">Segmentation</a>): Ein- und Ausgabe haben dieselbe Grösse. Weil dasselbe Netz alle 1000 Stufen bedient, bekommt es den Zeitschritt <b>t als zusätzliche Eingabe</b> (Timestep Conditioning, als Embedding in jedem Block).</p>
  <h4>Ablauf des Trainings (DDPM)</h4>
  <ol>
    <li>Ein echtes Bild <code>x₀</code> aus den Daten nehmen.</li>
    <li>Einen zufälligen Zeitschritt <code>t</code> zwischen 1 und T ziehen.</li>
    <li>Rauschen <code>ε ~ N(0, I)</code> ziehen und mit der Formel direkt <code>x_t</code> berechnen.</li>
    <li>Das U-Net schätzt das Rauschen: <code>ε̂ = ε_θ(x_t, t)</code>.</li>
    <li><b>Loss</b> = MSE zwischen ε und ε̂. Backpropagation, Update, wiederholen.</li>
  </ol>
  <pre><code>scheduler = DDPMScheduler(num_train_timesteps=1000)       # diffusers, wie im Notebook
for x0 in loader:
    noise = torch.randn_like(x0)
    t = torch.randint(0, 1000, (len(x0),))
    x_t = scheduler.add_noise(x0, noise, t)                 # √ᾱ·x0 + √(1−ᾱ)·ε
    pred = unet(x_t, t).sample                              # U-Net schätzt das Rauschen
    loss = F.mse_loss(pred, noise)
    opt.zero_grad(); loss.backward(); opt.step()</code></pre>
  <p>Das ist ein ganz gewöhnliches überwachtes Training mit MSE: kein Gegenspieler, kein KL-Term. Darum ist es <b>stabil</b>. Das Notebook «Diffusion from Scratch» baut zuerst eine einfachere Version: Es mischt Bild und Rauschen mit einem Anteil zwischen 0 und 1 und lässt ein kleines U-Net direkt das saubere Bild vorhersagen. Danach vergleicht es mit dem echten DDPM-Verfahren.</p>
  <h4>Ablauf beim Generieren (Sampling)</h4>
  <ol>
    <li>Mit reinem Rauschen beginnen: <code>x_T ~ N(0, I)</code>.</li>
    <li>Für t = T, T−1, …, 1: Rauschen schätzen <code>ε_θ(x_t, t)</code>, einen Teil davon abziehen, (ausser im letzten Schritt) wieder etwas frisches Rauschen dazugeben → <code>x_{t−1}</code>.</li>
    <li><code>x₀</code> ist das neue Bild.</li>
  </ol>
  <p>Mit DDPM sind das 1000 Durchläufe durch das U-Net, also <b>langsam</b>. Neuere Scheduler (DDIM, DPM-Solver) kommen mit 20 bis 50 Schritten aus; im Notebook lässt sich das mit <code>num_inference_steps</code> ausprobieren (5 Schritte: verschwommen, 50: fertig, 100: kaum besser).</p>
  <div class="tablewrap"><table>
    <tr><th>Vorteile</th><th>Nachteile</th></tr>
    <tr><td>Sehr hohe Bildqualität, oft besser als GANs<br>Grosse Vielfalt, kein Mode Collapse<br>Stabiles Training mit einfachem MSE-Loss</td><td>Langsames Sampling: viele Durchläufe pro Bild<br>Rechenintensiv beim Training, braucht GPU und viele Daten<br>Grosser Speicherbedarf bei hoher Auflösung (darum Latent Diffusion)</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Vorwärts: das Bild mit einer festen Formel in T Schritten verrauschen. Rückwärts: ein U-Net lernt mit MSE, das Rauschen in x_t zu schätzen, für jede Stufe t. Generieren: bei reinem Rauschen starten und Schritt für Schritt entrauschen. Stabil und vielfältig, aber langsam.</p></div>

  <h3 id="gen-cond">7 · Conditional Diffusion und Text-zu-Bild</h3>
  <p>Bisher erzeugt das Modell irgendein Bild aus der Datenverteilung. Meist will man aber ein <b>bestimmtes</b> Bild: eine 7, einen Hund, «ein Hund am Strand bei Sonnenuntergang». Dafür bekommt das Netz eine <b>Bedingung</b> y als zusätzliche Eingabe und lernt <code>ε_θ(x_t, t, y)</code>.</p>
  <ul>
    <li><b>Klasse</b> (z. B. Ziffer 0 bis 9): ein gelerntes Embedding der Klasse, das wie der Zeitschritt in die Blöcke des U-Nets eingespeist wird. Das Notebook macht so aus einer Ziffer gezielt neue Bilder dieser Ziffer.</li>
    <li><b>Text:</b> ein Text-Encoder (bei Stable Diffusion 1.5: CLIP) macht aus dem Prompt eine Folge von Vektoren. Das U-Net schaut über <b>Cross-Attention</b> in jeder Auflösungsstufe darauf.</li>
  </ul>
  <h4>Classifier-free Guidance: Wie stark zählt der Prompt?</h4>
  <p>Beim Training lässt man die Bedingung in etwa 10 % der Fälle weg. Dasselbe Netz kann dann Rauschen <b>mit</b> und <b>ohne</b> Bedingung schätzen. Beim Sampling rechnet man beides und verstärkt den Unterschied:</p>
  <pre><code>ε̂ = ε_θ(x_t, t, ∅)  +  w · ( ε_θ(x_t, t, y) − ε_θ(x_t, t, ∅) )        w = Guidance Scale</code></pre>
  <ul>
    <li><b>w = 1:</b> normales bedingtes Modell. Vielfältig, aber folgt dem Prompt nur lose.</li>
    <li><b>w ≈ 7,5</b> (Standard bei Stable Diffusion): guter Kompromiss.</li>
    <li><b>w gross</b> (15 und mehr): folgt dem Prompt sehr genau, aber weniger Vielfalt, übersättigte Farben, Artefakte.</li>
  </ul>
  <h4>Latent Diffusion: so funktioniert Stable Diffusion</h4>
  <p>Diffusion direkt auf 512 × 512 × 3 Pixeln wäre sehr teuer. <b>Latent Diffusion</b> verbindet die Modelle dieses Kapitels: Ein <b>VAE</b> verkleinert das Bild auf ein Latent von 64 × 64 × 4, die Diffusion läuft nur in diesem kleinen Raum, und der VAE-Decoder macht am Schluss daraus wieder ein Bild.</p>
  <figure class="fig" style="max-width:880px"><div style="overflow-x:auto">${F.latent()}</div></figure>
  <ol>
    <li>Prompt → Text-Encoder → Text-Embeddings (dazu ein leerer oder ein <b>Negative Prompt</b> für die Guidance).</li>
    <li>Ein zufälliges Latent <code>z_T</code> ziehen. Der <b>Seed</b> legt es fest: gleicher Seed + gleicher Prompt = gleiches Bild.</li>
    <li>Der <b>Scheduler</b> führt 20 bis 50 Schritte aus. In jedem schätzt das U-Net das Rauschen mit und ohne Text, kombiniert beides mit der Guidance Scale und entfernt einen Teil.</li>
    <li>Der VAE-Decoder macht aus dem fertigen Latent das Bild.</li>
  </ol>
  <pre><code>pipe = StableDiffusionPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5", torch_dtype=torch.float16).to("cuda")
image = pipe("a photo of a dog on a beach at sunset",
             num_inference_steps=50,      # Anzahl Entrausch-Schritte
             guidance_scale=7.5,          # wie stark der Prompt zählt
             generator=torch.Generator("cuda").manual_seed(42)).images[0]</code></pre>
  <div class="tablewrap"><table>
    <tr><th>Parameter</th><th>Wirkung</th></tr>
    <tr><td><code>prompt</code>, <code>negative_prompt</code></td><td>was im Bild sein soll und was nicht («blurry, low quality»)</td></tr>
    <tr><td><code>num_inference_steps</code></td><td>wenige: schnell, aber unfertig und verschwommen; 25 bis 50: gut; mehr: kaum besser, langsamer</td></tr>
    <tr><td><code>guidance_scale</code></td><td>klein: frei, folgt dem Prompt wenig; 7 bis 9: Standard; gross: genau, aber übersättigt</td></tr>
    <tr><td><code>generator</code> (Seed)</td><td>bestimmt das Start-Rauschen; für reproduzierbare und vergleichbare Bilder fixieren</td></tr>
    <tr><td><code>height</code>, <code>width</code></td><td>Vielfache von 8 (wegen des VAE); am besten die Trainingsauflösung (512 bei SD 1.5)</td></tr>
  </table></div>
  <p>Dieselbe Maschine kann mehr als Text-zu-Bild: <b>Bild-zu-Bild</b> (ein vorhandenes Bild nur teilweise verrauschen und neu entrauschen, die Stärke bestimmt, wie viel sich ändert), <b>Inpainting</b> (nur eine Maske neu erzeugen), <b>ControlNet</b> (Pose oder Kanten als zusätzliche Bedingung) und <b>Text-zu-Video</b>.</p>
  <div class="merk"><b>Merksatz</b><p>Conditional Diffusion = Diffusion mit Bedingung y (Klasse, Text). Classifier-free Guidance verstärkt den Unterschied zwischen mit und ohne Bedingung, die Guidance Scale regelt Treue gegen Vielfalt. Stable Diffusion = Text-Encoder + U-Net-Diffusion im Latent Space eines VAE + VAE-Decoder.</p></div>

  <h3 id="gen-eval">8 · Bewerten: Wann ist ein generatives Modell gut?</h3>
  <p>Es gibt keine richtige Antwort, mit der man vergleichen könnte. Ein gutes Modell erzeugt Bilder, die <b>realistisch</b> sind (Qualität), die ganze Bandbreite der Daten abdecken (<b>Vielfalt</b>), <b>neu</b> sind (keine Kopien) und, wenn bedingt, zur <b>Bedingung passen</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Methode</th><th>Was sie misst</th><th>Hinweise</th></tr>
    <tr><td><b>Bilder ansehen</b></td><td>Schärfe, Fehler, Vielfalt auf einen Blick</td><td>immer aus denselben festen z oder Seeds, viele auf einmal (Gitter), nicht nur die besten</td></tr>
    <tr><td><b>FID</b> (Fréchet Inception Distance)</td><td>Abstand zwischen den Merkmalen echter und erzeugter Bilder in einem vortrainierten Netz (Inception); Qualität und Vielfalt zusammen</td><td>tiefer ist besser; braucht Tausende Bilder; nur bei gleichen Einstellungen vergleichbar</td></tr>
    <tr><td><b>Nächste Nachbarn</b></td><td>Kopiert das Modell Trainingsbilder?</td><td>zu jedem erzeugten Bild das ähnlichste Trainingsbild suchen</td></tr>
    <tr><td><b>CLIP Score</b></td><td>Passt das Bild zum Prompt?</td><td>für Text-zu-Bild</td></tr>
    <tr><td><b>Log-Likelihood</b></td><td>Wahrscheinlichkeit echter Testbilder unter dem Modell</td><td>nur bei expliziter Dichte (PixelCNN; beim VAE eine Schranke), nicht beim GAN</td></tr>
    <tr><td><b>Menschliche Bewertung</b></td><td>Was Menschen realistischer oder passender finden</td><td>aufwendig, aber oft das Mass, das zählt</td></tr>
  </table></div>
  <div class="falle"><b>Falle</b><p>Die Trainings-Loss als Qualitätsmass lesen. Beim GAN schwanken die beiden Losses gegeneinander, beim VAE sinkt der Loss auch mit verwaschenen Bildern, und bei der Diffusion sagt die MSE auf dem Rauschen wenig über das fertige Bild. Bilder ansehen und FID messen.</p></div>

  <h3 id="gen-methoden">9 · Übersicht: vier Wege zu neuen Bildern</h3>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Idee</th><th>Loss</th><th>Generieren</th><th>Stärke</th><th>Schwäche</th></tr>
    <tr><td><b>Autoencoder</b></td><td>Bild → z → Bild</td><td>Rekonstruktion</td><td>–</td><td>Kompression, Denoising, Anomalien</td><td>kein brauchbarer Generator</td></tr>
    <tr><td><b>VAE</b></td><td>Encoder gibt μ, σ; z gezogen; Decoder</td><td>Rekonstruktion + KL</td><td>schnell: ein Decoder-Durchlauf</td><td>geordneter Latent Space, Interpolation, stabil</td><td>unscharfe Bilder</td></tr>
    <tr><td><b>PixelCNN</b></td><td>Pixel für Pixel mit maskierter Faltung</td><td>Cross-Entropy pro Pixel</td><td>sehr langsam: ein Durchlauf pro Pixel</td><td>echte Wahrscheinlichkeit, einfaches Training</td><td>langsam, eher kleine Bilder</td></tr>
    <tr><td><b>GAN</b></td><td>Generator gegen Discriminator</td><td>adversarial (Minimax)</td><td>schnell: ein Generator-Durchlauf</td><td>sehr scharfe Bilder, Bild-zu-Bild</td><td>instabil, Mode Collapse</td></tr>
    <tr><td><b>Diffusion</b></td><td>Rauschen schrittweise entfernen</td><td>MSE auf dem Rauschen</td><td>langsam: 20 bis 1000 U-Net-Durchläufe</td><td>beste Qualität und Vielfalt, stabil, Text-zu-Bild</td><td>rechenintensiv</td></tr>
  </table></div>
  <h4>Welches Modell wann?</h4>
  <ul>
    <li><b>Text-zu-Bild, Bildbearbeitung, hohe Qualität:</b> ein vortrainiertes Diffusionsmodell (Stable Diffusion) nehmen, nicht selbst trainieren.</li>
    <li><b>Bild zu Bild in Echtzeit</b> (Super-Resolution, Stiltransfer): GAN (ESRGAN, CycleGAN).</li>
    <li><b>Kompakte Darstellung, Interpolation, Anomalien:</b> VAE oder Autoencoder.</li>
    <li><b>Wahrscheinlichkeit eines Bildes gebraucht:</b> autoregressiv (PixelCNN).</li>
  </ul>
  <div class="merk"><b>Merksatz</b><p>Alle lernen die Datenverteilung ohne Labels. VAE über einen geordneten Latent Space, PixelCNN über eine Pixelfolge, GAN über einen Wettstreit, Diffusion über das schrittweise Entfernen von Rauschen. Die Wahl ist ein Kompromiss zwischen Qualität, Vielfalt und Tempo; Stable Diffusion kombiniert VAE und Diffusion.</p></div>

  <h3 id="gen-best">10 · Best Practices</h3>
  <p>Bei generativen Modellen gibt es keine einzelne richtige Ausgabe. Der Loss allein sagt darum wenig über die Qualität.</p>
  <div class="bp-check">
    <div><b>Vorbereiten</b><ul>
      <li>Zuerst prüfen, ob ein vortrainiertes Modell reicht (Stable Diffusion, ESRGAN). Eigene Diffusionsmodelle von null brauchen viel Rechenzeit und Daten.</li>
      <li>Pixel passend zur Ausgabe skalieren: [0, 1] mit Sigmoid (Autoencoder, VAE), [−1, 1] mit tanh (GAN, Diffusion).</li>
      <li>Klein anfangen: MNIST oder 32 × 32, kleiner Latent Space, wenige Schichten. Erst wenn das läuft, vergrössern.</li>
    </ul></div>
    <div><b>Training</b><ul>
      <li>VAE: Rekonstruktion und KL getrennt mitschreiben. Geht der KL-Term gegen 0, nutzt der Decoder den Latent Space nicht; β anpassen.</li>
      <li>GAN: D und G im Gleichgewicht halten, DCGAN-Rezepte nutzen (Adam 2·10⁻⁴, β₁ = 0,5). Gewinnt D immer, lernt G nichts mehr.</li>
      <li>Diffusion: Noise Schedule und Anzahl Schritte festhalten; beim Sampling mit 20 bis 50 Schritten beginnen.</li>
      <li>Seeds fixieren und Checkpoints speichern: GAN-Training kann plötzlich kippen.</li>
    </ul></div>
    <div><b>Qualität prüfen</b><ul>
      <li>Erzeugte Bilder regelmässig ansehen, immer aus denselben festen <code>z</code>-Vektoren oder Seeds, damit der Fortschritt vergleichbar ist.</li>
      <li>Vielfalt prüfen: Sehen alle Bilder fast gleich aus, ist es Mode Collapse.</li>
      <li>Zu erzeugten Bildern das ähnlichste Trainingsbild suchen: Das Modell soll Neues erzeugen, nicht kopieren.</li>
      <li>FID nur mit vielen Bildern und gleichen Einstellungen vergleichen; bei Text-zu-Bild auch prüfen, ob das Bild zum Prompt passt.</li>
    </ul></div>
    <div><b>Verantwortung</b><ul>
      <li>Lizenz und Herkunft der Trainingsbilder und des vortrainierten Modells klären.</li>
      <li>Erzeugte Bilder als solche kennzeichnen, vor allem bei Gesichtern (Deepfakes).</li>
      <li>Erfundene Details (ESRGAN, Diffusion) nie als Messung verwenden, etwa in Medizin oder Forensik.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Merksatz</b><p>Vortrainiert vor selbst trainiert, klein anfangen, Bilder aus festen Seeds ansehen statt nur den Loss, Vielfalt und Kopien prüfen, FID nur gleich eingestellt vergleichen und erzeugte Bilder kennzeichnen.</p></div>
`,
    quiz: [
      { q: `Was unterscheidet ein diskriminatives von einem generativen Modell?`, a: `Diskriminativ: <code>x → y</code>, lernt <code>p(y | x)</code>, es gibt eine richtige Antwort (z. B. Klassifikator). Generativ: lernt die Verteilung der Daten <code>p(x)</code> oder <code>p(x | y)</code>, erzeugt neue Beispiele, und zu einer Eingabe passen viele Ausgaben. Es braucht keine Labels.` },
      { q: `Welche drei Teile hat jedes tiefe generative Modell?`, a: `Eine Darstellung der Verteilung durch ein Netz, ein Training mit einem Loss, der die Netzverteilung den Daten annähert, und ein Sampling-Verfahren, um neue Beispiele zu ziehen.` },
      { q: `Ordne VAE, GAN, PixelCNN und Diffusion in die Taxonomie ein.`, a: `Explizite Dichte, exakt: PixelCNN (autoregressiv). Explizite Dichte, angenähert: VAE und Diffusion. Implizite Dichte (nur Sampling, kein p(x)): GAN.` },
      { q: `Aus welchen zwei Teilen besteht ein Autoencoder, und was ist sein Trainingsziel?`, a: `Encoder (Bild → kleiner Code z) und Decoder (z → Bild). Ziel ist, die Eingabe zu rekonstruieren: <code>g(f(x)) ≈ x</code>; der Loss ist der Abstand zwischen x und x̂.` },
      { q: `Warum erzeugt ein normaler Autoencoder aus einem zufälligen z keine guten Bilder?`, a: `Die Codes der Trainingsbilder bilden verstreute Inseln, dazwischen ist der Latent Space leer und ungeordnet. Ein zufälliges z landet meist in einer Lücke.` },
      { q: `Was gibt der Encoder eines VAE aus, und wie entsteht z?`, a: `Pro Dimension einen Mittelwert μ und eine Streuung σ (meist als log σ²). Dann <code>z = μ + σ · ε</code> mit <code>ε ~ N(0, I)</code>.` },
      { q: `Wozu der Reparametrisierungs-Trick?`, a: `Durch ein Zufallsziehen fliesst kein Gradient. Mit z = μ + σ · ε liegt der Zufall in ε; μ und σ sind ableitbar, also funktioniert Backpropagation bis in den Encoder.` },
      { q: `Was bewirken die beiden Teile des VAE-Loss, und was macht β?`, a: `Die Rekonstruktion sorgt dafür, dass das Bild wieder entsteht. Der KL-Term zieht jede Verteilung zu N(0, I) und hält den Latent Space geordnet und lückenlos. β gewichtet den KL-Term: gross = geordneter, aber unschärfer; klein = schärfer, aber mit Lücken.` },
      { q: `Wie erzeugt man mit einem trainierten VAE ein neues Bild?`, a: `z aus N(0, I) ziehen und nur den Decoder anwenden. Der Encoder wird dafür nicht gebraucht.` },
      { q: `Warum sind VAE-Bilder oft unscharf?`, a: `Der Decoder wird mit MSE (Gauss-Annahme) trainiert. Ist eine Kante unsicher, ist der Mittelwert aller Möglichkeiten die beste Antwort, und der ist verwaschen.` },
      { q: `Wozu dient der VAE in Stable Diffusion?`, a: `Er verkleinert das Bild von 512 × 512 × 3 auf ein Latent von 64 × 64 × 4. Die Diffusion läuft in diesem kleinen Raum (viel billiger), der VAE-Decoder macht am Schluss das Bild daraus.` },
      { q: `Wozu die Maske beim PixelCNN, und warum ist Training schnell, Generieren aber langsam?`, a: `Die Maske lässt das Netz nur Pixel oberhalb und links sehen, sonst würde es den Zielpixel abschreiben. Im Training sind alle Pixel bekannt und werden parallel vorhergesagt; beim Generieren hängt jeder Pixel vom soeben gewürfelten ab, also 784 Schritte nacheinander bei 28 × 28.` },
      { q: `Schreibe das GAN-Ziel auf und erkläre den D- und den G-Schritt.`, a: `<code>min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]</code>. D-Schritt (G fest): D(x) → 1 für echte, D(G(z)) → 0 für falsche Bilder. G-Schritt (D fest): G so ändern, dass D(G(z)) → 1.` },
      { q: `Warum trainiert man den Generator in der Praxis mit <code>log D(G(z))</code> statt <code>log(1 − D(G(z)))</code>?`, a: `Am Anfang erkennt D jede Fälschung (D(G(z)) ≈ 0). Dort ist <code>log(1 − D(G(z)))</code> fast flach, G bekäme kaum Gradient. <code>log D(G(z))</code> zu maximieren hat dort einen starken Gradienten (non-saturating Loss).` },
      { q: `Was ist Mode Collapse, und woran erkennst du es?`, a: `Der Generator erzeugt nur noch wenige verschiedene Bilder, die den Discriminator täuschen, statt die ganze Vielfalt der Daten. Erkennen: viele erzeugte Bilder nebeneinander ansehen; sie sehen fast gleich aus.` },
      { q: `Was macht CycleGAN anders als Pix2Pix?`, a: `Pix2Pix braucht gepaarte Beispiele (Bild A und das passende Bild B). CycleGAN kommt ohne Paare aus: Der Zyklus A → B → A soll wieder das Original ergeben (Cycle Consistency), z. B. Sommer ↔ Winter.` },
      { q: `Was passiert im Vorwärts- und was im Rückwärtsprozess eines Diffusionsmodells?`, a: `Vorwärts: In T Schritten wird nach einem festen Noise Schedule Gauss-Rauschen addiert, bis nur Rauschen übrig ist; kein Training. Rückwärts: Ein U-Net lernt, das Rauschen in x_t zu schätzen und Schritt für Schritt zu entfernen; damit wird aus Rauschen ein Bild.` },
      { q: `Warum muss man beim Training nicht alle t Schritte nacheinander verrauschen?`, a: `Weil Gauss-Rauschen sich addiert, gibt es eine geschlossene Formel: <code>x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε</code>. Man zieht ein zufälliges t und springt direkt dorthin.` },
      { q: `Beschreibe einen Trainingsschritt eines DDPM.`, a: `Bild x₀ nehmen, zufälliges t ziehen, Rauschen ε ziehen, x_t mit der Formel berechnen, das U-Net schätzt ε̂ = ε_θ(x_t, t), Loss = MSE(ε, ε̂), Backpropagation.` },
      { q: `Warum bekommt das U-Net bei der Diffusion den Zeitschritt t als Eingabe?`, a: `Dasselbe Netz muss alle Rauschstufen bedienen. Bei kleinem t ist nur feine Körnung zu entfernen, bei grossem t fast alles. Mit t weiss das Netz, wie viel Rauschen zu erwarten ist.` },
      { q: `Warum ist Diffusion beim Generieren langsam, und was hilft?`, a: `Jedes Bild braucht viele Durchläufe durch das U-Net (bei DDPM 1000). Schnellere Scheduler (DDIM, DPM-Solver) kommen mit 20 bis 50 Schritten aus; Latent Diffusion macht jeden Schritt billiger.` },
      { q: `Was ist Classifier-free Guidance, und was bewirkt die Guidance Scale?`, a: `Das Netz lernt Rauschen mit und ohne Bedingung zu schätzen (die Bedingung wird im Training manchmal weggelassen). Beim Sampling: <code>ε̂ = ε_unbedingt + w · (ε_bedingt − ε_unbedingt)</code>. Grosses w folgt dem Prompt genauer, aber mit weniger Vielfalt und übersättigten Farben; kleines w ist freier.` },
      { q: `Welche Bausteine hat Stable Diffusion?`, a: `Ein Text-Encoder (CLIP) für den Prompt, ein U-Net, das im Latent Space (64 × 64 × 4) in 20 bis 50 Schritten entrauscht und über Cross-Attention auf den Text schaut, ein Scheduler und ein VAE-Decoder, der das Latent in ein Bild verwandelt.` },
      { q: `Warum reicht bei generativen Modellen eine Loss-Kurve zur Validation nicht, und was nimmt man stattdessen?`, a: `Der Loss sagt wenig über Schärfe und Vielfalt (beim GAN schwanken zwei Losses gegeneinander). Man sieht Bilder aus festen Seeds an, misst FID, sucht nächste Nachbarn im Trainingsset gegen Kopien und prüft bei Text-zu-Bild, ob das Bild zum Prompt passt.` },
      { q: `Welches Modell würdest du für ein 4×-Upscaling mit scharfen Details wählen, und was ist der Haken?`, a: `Ein GAN wie ESRGAN (oder ein Diffusionsmodell): schärfer als Bicubic. Haken: Die Details sind erfunden und stimmen nicht mit der Wirklichkeit überein, was bei Messbildern ein Risiko ist.` },
    ],
    init() {
      LernApp.demos.gen();
    },
  });
})();
