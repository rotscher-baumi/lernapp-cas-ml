/* Module: Mathe-Grundlagen ausführlich (own page mathe-ausfuehrlich.html). */
(function () {
  const { $, fmt } = LernApp;

  LernApp.register({
    id: 'mathe-lang',
    order: 10,
    nav: 'Mathe ausführlich',
    title: 'Mathe-Grundlagen ausführlich',
    kicker: 'Grundlagen · Vorbereitung auf Supervised ML',
    summary: `Σ-Notation, Ableitung, Gradient, Statistik-Basics`,
    html: `
  <p>Dieses Kapitel sammelt die Mathematik, die der Kurs wirklich braucht, in einfachen Worten: Funktionen und das Summenzeichen, die Ableitung, der Gradient, ein wenig Vektoren und die wichtigsten Statistik-Begriffe. Alles andere kannst du nachschlagen, wenn es auftaucht.</p>

  <h3>Funktionen und das Summenzeichen</h3>
  <p>Eine <b>Funktion</b> ist eine Rechenvorschrift: <code>f(x)</code> nimmt ein <code>x</code> und gibt ein <code>y</code> zurück. Die Gerade <code>y = a·x + b</code> hat zwei Stellschrauben: <code>a</code> ist die Steigung (wie steil), <code>b</code> der Achsenabschnitt (wo sie die y-Achse schneidet). Genau diese zwei Zahlen lernt die lineare Regression.</p>
  <p>Das <b>Summenzeichen Σ</b> (Sigma) schreckt viele ab, ist aber nur eine for-Schleife. «Σ von i = 1 bis n» heisst: rechne den Ausdruck für jedes i aus und zähle alles zusammen. Die MSE-Formel und ihr Code sagen dasselbe:</p>
  <pre><code># Formel:  MSE = (1/n) · Σ (y_i − ŷ_i)²     (ŷ = Vorhersage, sprich "y-Dach")
summe = 0
for i in range(n):
    summe = summe + (y[i] - y_vorhersage[i]) ** 2
mse = summe / n</code></pre>
  <div class="merk"><b>Merksatz</b><p>Σ lesen heisst: «Schleife über alle Datenpunkte, dann aufsummieren.» Wenn eine Formel einschüchtert, übersetze sie in Code.</p></div>

  <h3>Die Ableitung</h3>
  <p>Die Ableitung brauchst du im nächsten Kapitel für Gradient Descent. Die Idee ist einfach: Sie sagt dir, <b>wie steil eine Kurve an einer bestimmten Stelle ist</b>. Oder anders gefragt: Wie stark ändert sich <code>y</code>, wenn du <code>x</code> ein winziges Stück verschiebst?</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Bei der Geraden ist es leicht</h4>
  <p>Eine Gerade hat überall dieselbe Steigung: <code>Höhenänderung / Schrittweite</code>, kurz <code>Δy / Δx</code>. Steigt eine Strasse auf 100 m um 8 m, sind das 8 Prozent. Egal, wo du misst.</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Bei einer Kurve ändert sich die Steigung</h4>
  <p>Eine Parabel fällt links steil ab, ist unten flach und steigt rechts steil an. Für einen einzelnen Punkt gibt es kein «Δ» zwischen zwei Punkten. Der Trick: Nimm zwei Punkte, bei <code>x</code> und bei <code>x + h</code>, und rechne die Steigung der Verbindungslinie (<b>Sekante</b>). Dann machst du <code>h</code> immer kleiner. Wenn <code>h</code> gegen 0 geht, wird aus der Sekante die <b>Tangente</b>, eine Gerade, die die Kurve nur in diesem einen Punkt berührt. Ihre Steigung ist die Ableitung.</p>
  <pre><code>f'(x) = (f(x + h) - f(x)) / h      # für sehr kleines h</code></pre>

  <div class="demo" id="dvDemo">
    <div class="tag">Demo</div><h4>Von der Sekante zur Tangente (y = x²)</h4>
    <svg class="plot" id="dvSvg" viewBox="0 0 320 200" role="img" aria-label="Parabel mit Sekante und Tangente"></svg>
    <div class="ctl"><label for="dvX">Stelle x</label><input type="range" id="dvX" min="-4" max="4" step="0.1" value="1.5"><output id="dvXO"></output></div>
    <div class="ctl"><label for="dvH">Abstand h</label><input type="range" id="dvH" min="0.01" max="3" step="0.01" value="2"><output id="dvHO"></output></div>
    <div class="stats"><span>Steigung der Sekante <b id="dvSec"></b></span><span>Ableitung 2x <b id="dvDer"></b></span></div>
    <p class="hint">Blau: die Kurve. Orange: Sekante durch die Punkte P (bei x) und Q (bei x + h). Gestrichelt: die Tangente, also die exakte Steigung bei x. Schiebe h gegen 0, dann fallen Orange und Gestrichelt zusammen. Schiebe x nach links und rechts und beobachte das Vorzeichen.</p>
  </div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Rechenbeispiel</h4>
  <p>Für <code>f(x) = x²</code> ist die Ableitung <code>f'(x) = 2x</code>. Bei <code>x = 3</code> ist sie 6. Probe mit <code>h = 0.01</code>: <code>(3.01² − 3²) / 0.01 = (9.0601 − 9) / 0.01 = 6.01</code>. Schon fast 6, und mit noch kleinerem <code>h</code> wird es genauer.</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Was das Vorzeichen verrät</h4>
  <div class="tablewrap"><table>
    <tr><th>Ableitung</th><th>Die Kurve …</th><th>Weg zum Tal</th></tr>
    <tr><td>positiv (&gt; 0)</td><td>steigt</td><td>nach links</td></tr>
    <tr><td>negativ (&lt; 0)</td><td>fällt</td><td>nach rechts</td></tr>
    <tr><td>null</td><td>ist flach (Tal, Gipfel oder Sattel)</td><td>hier ist ein Tiefpunkt möglich</td></tr>
  </table></div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Die wichtigsten Regeln</h4>
  <p>Im Kurs rechnet der Computer die Ableitung für dich. Diese Regeln reichen, um die Idee nachzuvollziehen:</p>
  <div class="tablewrap"><table>
    <tr><th>Funktion</th><th>Ableitung</th><th>Beispiel</th></tr>
    <tr><td>Konstante <code>c</code></td><td>0</td><td>7 → 0</td></tr>
    <tr><td><code>x</code></td><td>1</td><td></td></tr>
    <tr><td><code>x<sup>n</sup></code></td><td><code>n · x<sup>n−1</sup></code></td><td>x² → 2x, x³ → 3x²</td></tr>
    <tr><td><code>c · f(x)</code></td><td><code>c · f'(x)</code></td><td>3x² → 6x</td></tr>
    <tr><td><code>f(x) + g(x)</code></td><td><code>f'(x) + g'(x)</code></td><td>x² + 3x → 2x + 3</td></tr>
  </table></div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Warum das im Machine Learning wichtig ist</h4>
  <p>Die Fehlerfunktion (zum Beispiel der MSE) hängt von den Koeffizienten des Modells ab. Ihre Ableitung nach einem Koeffizienten sagt dir: Wird der Fehler grösser oder kleiner, wenn ich diesen Koeffizienten erhöhe? Gehst du in die Gegenrichtung, sinkt der Fehler. Hat das Modell mehrere Koeffizienten, leitest du nach jedem einzeln ab (die anderen hältst du fest, das heisst <i>partielle Ableitung</i>) und legst alle Werte in einen Vektor. Dieser Vektor ist der <b>Gradient</b>. Daher der Name Gradient Descent.</p>
  <div class="merk"><b>Merksatz</b><p>Die Ableitung ist die Steigung an einem Punkt. Positiv heisst: nach links zum Tal. Negativ: nach rechts. Null: flach. Gradient Descent geht immer entgegen der Steigung.</p></div>
  <div class="falle"><b>Falle</b><p>Eine Ableitung von 0 heisst nur «hier ist es flach». Das kann ein lokales Minimum sein und nicht das tiefste Tal.</p></div>

  <h3>Vektoren und Matrizen in einer Minute</h3>
  <p>Ein <b>Vektor</b> ist eine Liste von Zahlen, eine <b>Matrix</b> eine Tabelle davon. Im Machine Learning steckt dahinter immer dasselbe Bild: Die Datenmatrix <code>X</code> hat eine <b>Zeile pro Beobachtung</b> (eine Wohnung) und eine <b>Spalte pro Merkmal</b> (Fläche, Zimmer, …). Der Zielvektor <code>y</code> enthält pro Zeile die richtige Antwort (die Miete). Die lineare Regression mit mehreren Merkmalen rechnet pro Zeile einfach <code>w1·x1 + w2·x2 + … + b</code>: jedes Merkmal mal sein Gewicht, alles summiert. Auch das ist nur ein Σ.</p>

  <h3>Statistik-Begriffe, die ständig vorkommen</h3>
  <p>Beispielwerte: <code>[1, 2, 3, 4, 10]</code></p>
  <div class="tablewrap"><table>
    <tr><th>Begriff</th><th>Idee</th><th>Beispiel</th></tr>
    <tr><td><b>Mittelwert</b></td><td>Summe geteilt durch Anzahl</td><td>20 / 5 = <b>4</b></td></tr>
    <tr><td><b>Median</b></td><td>der mittlere Wert nach dem Sortieren</td><td><b>3</b> — der Ausreisser 10 stört ihn nicht</td></tr>
    <tr><td><b>Varianz</b></td><td>mittlere quadrierte Abweichung vom Mittelwert</td><td>(9+4+1+0+36)/5 = <b>10</b></td></tr>
    <tr><td><b>Standardabweichung</b></td><td>Wurzel der Varianz, wieder in der Einheit der Daten</td><td>√10 ≈ <b>3.16</b></td></tr>
  </table></div>
  <p>Die Std sagt, wie breit die Werte um den Mittelwert streuen. Genau diese zwei Zahlen benutzt der <code>StandardScaler</code>, und <code>df.describe()</code> zeigt sie dir für jede Spalte.</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Was der StandardScaler macht</h4>
  <ul>
    <li><b>Pro Spalte:</b> <code>z = (x − Mittelwert) / Std</code>. Erst Mittelwert abziehen (Nullpunkt in die Mitte), dann durch Std teilen (Einheit = 1 Std).</li>
    <li><b>Std wird nur einmal berechnet:</b> Sie misst die Abstände zum Mittelwert, nicht die Werte selbst. Abziehen verschiebt alle Werte samt Mittelwert, die Abstände bleiben gleich, also bleibt auch die Std gleich. Darum reicht eine Rechnung auf den Rohwerten. Nach dem Teilen ist sie durch die Konstruktion 1, ohne neu gerechnet zu werden.</li>
    <li><b>Zwei verschiedene Std:</b> Die Std der <i>Rohwerte</i> (z. B. 8.26) bleibt im Scaler gespeichert (<code>scaler.scale_</code>, Mittelwert in <code>scaler.mean_</code>) und ist der Teiler. Die Std der <i>skalierten</i> Werte ist 1. Mit den gespeicherten Zahlen kommst du zurück: <code>x = z · Std + Mittelwert</code> (<code>inverse_transform</code>). Es ist keine Optimierung, sondern eine direkte Rechnung ohne Schleife.</li>
    <li><b>Ausreisser im Training verzerren den Scaler:</b> Sie blähen Mittelwert und Std auf, die normalen Werte werden danach auf ein enges Fenster gequetscht, und diese falsche Skala gilt später auch für alle Testdaten. Darum vor dem <code>fit</code> prüfen: Mess- und Tippfehler korrigieren oder entfernen, echte Extremwerte behalten (oder <code>RobustScaler</code> nehmen). <b>Nur aus den Trainingsdaten</b> entfernen, nie aus den Testdaten.</li>
    <li><b>Ausreisser in den Testdaten:</b> Die Std bleibt die aus dem Training. Der Wert bekommt einen extremen z-Wert (z. B. 15), das Modell extrapoliert, und der Testfehler zeigt ehrlich, dass es mit solchen Fällen schlecht umgeht. Extreme z-Werte (|z| &gt; 4) sind ein Warnsignal.</li>
    <li><b>Ergebnis auf den Trainingsdaten:</b> Mittelwert 0, Std 1. Ein z-Wert sagt: «so viele Std über (+) oder unter (−) dem Schnitt».</li>
    <li><b>Test- und neue Daten:</b> nur mit den gemerkten Zahlen aus dem Training umrechnen (<code>transform</code>), darum liegen sie nur ungefähr bei 0 und 1.</li>
    <li><b>Bleibt gleich:</b> Reihenfolge, Abstände, Form, auch Ausreisser. <b>Ändert sich:</b> nur Nullpunkt und Einheit.</li>
  </ul>
  <pre><code>scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)  # lernt Mittelwert und Std
X_test_s  = scaler.transform(X_test)       # nutzt dieselben Zahlen</code></pre>
  <div class="merk"><b>Warum?</b><p>Damit alle Merkmale <b>gleich gewichtet starten</b>: Ohne Skalierung dominiert qm (30 bis 150) das Merkmal Zimmer (1 bis 6). Das stört Gradient Descent, k-NN und Regularisierung.</p></div>

  <p><b>Wird «Mittelwert 0, Std 1» wirklich erreicht?</b> Auf den <b>Trainingsdaten</b> immer exakt, denn der Scaler zieht genau deren Mittelwert ab und teilt durch deren Std. Auf <b>Test- und neuen Daten</b> nur ungefähr (z. B. Mittelwert 0.1, Std 0.9), weil sie mit den Zahlen aus dem Training skaliert werden. Das ist gewollt: Das Modell soll neue Daten so sehen, wie es sie später in der Praxis sieht. «0 ± 1» heisst ausserdem nicht, dass alle Werte zwischen −1 und +1 liegen; die meisten liegen zwischen −2 und +2, Ausreisser auch darüber.</p>
  <div class="demo" id="stDemo">
    <div class="tag">Demo</div><h4>Statistik und StandardScaler sehen</h4>
    <p class="hint">Sieben Mieten (in 100 CHF) plus ein achter Wert, den du verschiebst. Oben die Rohwerte, unten dieselben Punkte nach dem StandardScaler.</p>
    <svg class="plot" id="stSvg" viewBox="0 0 320 250" role="img" aria-label="Oben Rohwerte mit Mittelwert, Median und Standardabweichungsband, unten die standardisierten Werte"></svg>
    <div class="ctl"><label for="stOut">Achter Wert</label><input type="range" id="stOut" min="3" max="40" step="0.5" value="8"><output id="stOutO"></output></div>
    <div class="tablewrap"><table id="stTab" style="min-width:0"></table></div>
    <p class="hint" id="stEx"></p>
    <p class="hint">Blaue Linie: Mittelwert, gestrichelt: Median, Band: Mittelwert ± 1 Std. Schiebe den Wert nach rechts: Der Mittelwert wandert mit, der Median kaum. Unten bleibt es immer bei Mittelwert 0 und Std 1; nur die Abstände ändern sich. Formel: <code>z = (x − Mittelwert) / Std</code>.</p>
  </div>
  <div class="demo" id="ssDemo">
    <div class="tag">Demo</div><h4>StandardScaler Schritt für Schritt, mit Ausreisser</h4>
    <p class="hint">Acht Mieten, der letzte (orange) ist ein Ausreisser. Klick durch die drei Schritte und schiebe ihn: Am Ende ist es immer Mittelwert 0 und Std 1.</p>
    <div class="btnrow"><button id="ssB1" class="pri">1 · Rohwerte</button><button id="ssB2">2 · Mittelwert abziehen</button><button id="ssB3">3 · Durch Std teilen</button></div>
    <svg class="plot" id="ssSvg" viewBox="0 0 320 120" role="img" aria-label="Punkte auf einer Zahlengeraden in drei Schritten des StandardScalers"></svg>
    <div class="ctl"><label for="ssOut">Achter Wert</label><input type="range" id="ssOut" min="3" max="40" step="0.5" value="30"><output id="ssOutO"></output></div>
    <details><summary>Rechnung als Tabelle</summary><div class="tablewrap"><table id="ssTab" style="min-width:0"></table></div></details>
    <div class="stats"><span>Mittelwert <b id="ssM"></b></span><span>Std (n) <b id="ssS"></b></span></div>
    <p class="hint" id="ssNote"></p>
  </div>
  <div class="falle"><b>Falle</b><p>Mittelwert und Std des Scalers lernst du nur auf den <b>Trainingsdaten</b> (<code>fit</code>). Auf Validierungs- und Testdaten wendest du sie bloss an (<code>transform</code>). Sonst fliessen Testinformationen ins Training: Data Leakage.</p></div>

  <h3>Korrelation</h3>
  <p>Die <b>Korrelation</b> r misst, wie stark zwei Variablen <i>linear</i> zusammen laufen, auf einer Skala von −1 bis +1: +1 heisst perfekt gemeinsam steigend, −1 perfekt gegenläufig, 0 kein linearer Zusammenhang. In Pandas: <code>df.corr()</code>. Bei der Feature Selection wählt man Merkmale mit hoher Korrelation zum Ziel.</p>
  <div class="falle"><b>Falle</b><p>Korrelation ist keine Ursache (Piraten und Erderwärmung!), und r misst nur <i>lineare</i> Zusammenhänge: Eine perfekte U-Kurve kann r ≈ 0 haben.</p></div>
`,
    exercises: [
      {
        t: 'Mittelwert und Median von Hand',
        task: 'Berechne Mittelwert und Median von <code>werte</code> ohne fertige Funktionen: Mittelwert = Summe / Anzahl, Median = mittlerer Wert der sortierten Liste.',
        start: `werte = [1, 2, 10, 4, 3]
mittelwert = None   # sum(...) / len(...)
median = None       # sorted(...), dann das mittlere Element
print(mittelwert, median)`,
        check: `assert mittelwert == 4, "Mittelwert: sum(werte) / len(werte) = 20 / 5"
assert median == 3, "Median: Liste sortieren, dann Element mit Index len(werte) // 2"`,
        sol: `werte = [1, 2, 10, 4, 3]
mittelwert = sum(werte) / len(werte)
median = sorted(werte)[len(werte) // 2]
print(mittelwert, median)`,
      },
      {
        t: 'Numerische Ableitung',
        task: 'Schreibe <code>ableitung(f, x)</code>, die die Steigung von <code>f</code> an der Stelle <code>x</code> näherungsweise berechnet: <code>(f(x + h) − f(x)) / h</code> mit kleinem <code>h</code>. Teste sie an <code>x²</code> bei x = 3 (erwartet: ungefähr 6).',
        start: `def ableitung(f, x, h=0.0001):
    pass  # TODO: (f(x + h) - f(x)) / h


def quadrat(x):
    return x * x

print(ableitung(quadrat, 3))`,
        check: `assert ableitung(quadrat, 3) is not None, "return nicht vergessen"
assert abs(ableitung(quadrat, 3) - 6) < 0.01, "Bei x = 3 soll ungefähr 6 herauskommen (2x)"
assert abs(ableitung(quadrat, -2) + 4) < 0.01, "Bei x = -2 soll ungefähr -4 herauskommen"`,
        sol: `def ableitung(f, x, h=0.0001):
    return (f(x + h) - f(x)) / h


def quadrat(x):
    return x * x

print(ableitung(quadrat, 3))`,
      },
    ],
    quiz: [
      { q: `Warum skaliert man Merkmale, und ist danach auf den Testdaten Mittelwert 0 und Std 1 exakt erreicht?`, a: `Damit kein Merkmal nur wegen grosser Zahlen dominiert (wichtig für Gradient Descent, k-NN, Regularisierung). Exakt gilt 0 und 1 nur auf den Trainingsdaten; Testdaten werden mit den Trainingswerten skaliert und liegen nur ungefähr dort.` },
      { q: `Was haben Mittelwert und Standardabweichung nach dem StandardScaler?`, a: `Mittelwert 0 und Standardabweichung 1. Jeder Wert wird zu z = (x − Mittelwert) / Std; die Form der Verteilung bleibt, nur Lage und Massstab ändern sich.` },
      { q: `Was sagt die Ableitung einer Funktion an einer Stelle aus?`, a: `Die Steigung der Kurve an dieser Stelle, also wie stark sich y ändert, wenn x ein winziges Stück wächst. Positiv heisst: die Kurve steigt, negativ: sie fällt, null: sie ist flach.` },
      { q: `Wie lautet die Ableitung von <code>x²</code>, und wie gross ist sie bei <code>x = -3</code>?`, a: `<code>2x</code>, also -6 bei x = -3. Das Minus zeigt: Die Kurve fällt dort, das Tal liegt rechts davon.` },
      { q: `Warum steht bei Gradient Descent ein Minus: <code>x_neu = x_alt - lernrate * steigung</code>?`, a: `Die Ableitung zeigt bergauf. Du willst ins Tal, also gehst du in die Gegenrichtung.` },
      { q: `Was bedeutet das Summenzeichen Σ in einer Formel?`, a: `Eine Schleife mit Aufsummieren: Rechne den Ausdruck für jeden Index aus und zähle alle Ergebnisse zusammen.` },
      { q: `Was ist der Gradient?`, a: `Der Vektor aller partiellen Ableitungen: pro Koeffizient eine Zahl, die sagt, wie stark der Fehler wächst, wenn man diesen Koeffizienten erhöht. Gradient Descent geht in die Gegenrichtung.` },
      { q: `Werte [1, 2, 3, 4, 10]: Warum unterscheiden sich Mittelwert (4) und Median (3)?`, a: `Der Ausreisser 10 zieht den Mittelwert nach oben. Der Median schaut nur auf den mittleren Wert und bleibt stabil.` },
      { q: `Zwei Variablen haben Korrelation r = −0.9. Was heisst das?`, a: `Ein starker gegenläufiger linearer Zusammenhang: Steigt die eine, sinkt die andere meist. Über die Ursache sagt das nichts.` },
    ],
    init() {
      MatheDemos.deriv();
      MatheDemos.stats();
      MatheDemos.scaler();
    },
  });
})();
