/* Module: Unsupervised Learning (Clustering, Dimensionsreduktion). Content lives in the html field; the demos live in assets/demos-unsup.js. */
(function () {
  LernApp.register({
    id: 'unsup',
    order: 90,
    nav: 'Unsupervised',
    title: `Unsupervised Learning`,
    kicker: `Modul 3 · Unsupervised Learning (Sa 31.10.)`,
    summary: `Supervised oder Unsupervised, Clustering, Anomalien, PCA, t-SNE und UMAP`,
    html: `  <p>Bisher hatten alle Daten eine Antwort (Preis, Klasse). Beim <b>Unsupervised Learning</b> gibt es keine. Das Modell soll selbst Struktur in den Daten finden. Drei Hauptaufgaben:</p>
  <div class="grid2">
    <div><h4>Clustering</h4><p>Ähnliche Datenpunkte in Gruppen einteilen. Beispiel: Kundensegmente, Dokumentgruppen.</p></div>
    <div><h4>Anomalien finden</h4><p>Punkte finden, die nicht zum Rest passen. Beispiel: auffällige Zahlungen.</p></div>
    <div><h4>Dimensionsreduktion</h4><p>Viele Merkmale auf wenige zusammenfassen, zum Beispiel um Daten in 2D zu zeichnen.</p></div>
  </div>
  <p>Die Labs arbeiten mit Wein-Messwerten, simulierten Zahlungen und handgeschriebenen Ziffern. Es gibt kein «richtig», nur nützlich oder nicht. Darum gehört die <b>Interpretation</b> zum Ergebnis dazu.</p>

  <h3 id="unsup-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Beim Unsupervised Learning gibt es keine richtige Antwort zum Vergleichen. Darum ist der Ablauf eine Schleife aus Ausprobieren, Prüfen und Deuten, nicht ein gerader Weg zum Testergebnis wie beim <a href="#ml-ablauf">Supervised Learning</a>.</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig">
    <div class="ab-scroll">
    <svg viewBox="-60 0 790 850" role="img" aria-label="Ablauf eines Unsupervised-Projekts: Frage klären, Daten ansehen, vorverarbeiten, skalieren, optional Dimensionen reduzieren, Verfahren wählen, Parameter wählen mit Schleife, Stabilität prüfen, visualisieren, interpretieren und bei Bedarf zurück zur Vorverarbeitung. Es gibt kein Testset.">
      <defs>
        <marker id="ub-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/>
        </marker>
        <marker id="ub-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--warn)"/>
        </marker>
      </defs>

      <g class="ab-step" data-s="1" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 1: Erklärung aufklappen">
      <rect x="60" y="20" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="42" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">1 · Frage klären</text>
      <text x="210" y="60" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Gruppen, Ausreisser oder ein 2D-Bild?</text>
      </g>
      <line x1="210" y1="72" x2="210" y2="104" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="46" x2="440" y2="46" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <g class="ab-step" data-s="y" tabindex="0" role="button" aria-expanded="false" aria-label="Zielspalte y vorhanden?: Erklärung aufklappen">
      <rect x="440" y="20" width="270" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="575" y="42" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">Zielspalte y vorhanden?</text>
      <text x="575" y="60" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">ja → Supervised · nein → hier weiter</text>
      </g>

      <g class="ab-step" data-s="2" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 2: Erklärung aufklappen">
      <rect x="60" y="104" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="126" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">2 · Daten laden und ansehen</text>
      <text x="210" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Typen, fehlende Werte, Ausreisser (EDA)</text>
      </g>
      <line x1="210" y1="156" x2="210" y2="188" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="130" x2="440" y2="130" marker-end="url(#ub-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>
      <g class="ab-step" data-s="t" tabindex="0" role="button" aria-expanded="false" aria-label="Kein Testset: Erklärung aufklappen">
      <rect x="440" y="104" width="270" height="52" rx="6" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4"/>
      <text x="575" y="126" text-anchor="middle" style="fill:var(--warn);font-size:14px;font-weight:600;font-family:var(--f-body)">Kein Testset</text>
      <text x="575" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">keine richtige Antwort zum Vergleichen</text>
      </g>

      <g class="ab-step" data-s="3" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 3: Erklärung aufklappen">
      <rect x="60" y="188" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="210" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">3 · Vorverarbeiten</text>
      <text x="210" y="228" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">One-Hot, fehlende Werte, Merkmale wählen</text>
      </g>
      <line x1="210" y1="240" x2="210" y2="272" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="4" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 4: Erklärung aufklappen">
      <rect x="60" y="272" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="294" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">4 · Skalieren</text>
      <text x="210" y="312" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">StandardScaler, bei Ausreissern RobustScaler</text>
      </g>
      <line x1="210" y1="324" x2="210" y2="356" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="5" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 5: Erklärung aufklappen">
      <rect x="60" y="356" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="378" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">5 · Dimensionen reduzieren</text>
      <text x="210" y="396" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">optional: PCA, z. B. 90 % Varianz behalten</text>
      </g>
      <line x1="210" y1="408" x2="210" y2="440" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="6" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 6: Erklärung aufklappen">
      <rect x="60" y="440" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="462" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">6 · Verfahren wählen</text>
      <text x="210" y="480" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">passend zu Frage und Form der Daten</text>
      </g>
      <line x1="210" y1="492" x2="210" y2="524" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="466" x2="410" y2="466" marker-end="url(#ub-a)" style="stroke:var(--accent);stroke-width:1.5;fill:none"/>
      <rect x="410" y="414" width="300" height="146" rx="8" style="fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 4"/>
      <text x="424" y="434" style="fill:var(--accent);font-size:12px;font-weight:600;font-family:var(--f-body)">Welches Verfahren wofür?</text>
      <text x="424" y="458" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">k-Means</text><text x="534" y="458" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">rund, ähnlich gross</text>
      <text x="424" y="480" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Hierarchisch</text><text x="534" y="480" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Baum, k danach wählen</text>
      <text x="424" y="502" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">DBSCAN</text><text x="534" y="502" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">beliebige Form, Rauschen</text>
      <text x="424" y="524" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">GMM</text><text x="534" y="524" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Wahrscheinlichkeiten</text>
      <text x="424" y="546" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Isolation Forest</text><text x="534" y="546" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Ausreisser-Rangliste</text>

      <g class="ab-step" data-s="7" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 7: Erklärung aufklappen">
      <rect x="60" y="524" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="546" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">7 · Parameter wählen</text>
      <text x="210" y="564" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">k, eps, Linkage: Elbow, Silhouette, BIC</text>
      </g>
      <line x1="210" y1="576" x2="210" y2="608" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <path d="M60,564 H34 V538 H60" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="26" y="548" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">anders</text>
      <text x="26" y="562" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">probieren</text>

      <g class="ab-step" data-s="8" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 8: Erklärung aufklappen">
      <rect x="60" y="608" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="630" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">8 · Stabilität prüfen</text>
      <text x="210" y="648" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">anderer Seed, Teilstichprobe, ARI</text>
      </g>
      <line x1="210" y1="660" x2="210" y2="692" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="9" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 9: Erklärung aufklappen">
      <rect x="60" y="692" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="714" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">9 · Visualisieren</text>
      <text x="210" y="732" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">PCA, t-SNE oder UMAP in 2D</text>
      </g>
      <line x1="210" y1="744" x2="210" y2="776" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="718" x2="410" y2="718" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <rect x="410" y="682" width="300" height="72" rx="8" style="fill:none;stroke:var(--line);stroke-width:1.5;stroke-dasharray:3 4"/>
      <text x="424" y="702" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Karte richtig lesen</text>
      <text x="424" y="722" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">PCA: linear, erklärte Varianz angeben</text>
      <text x="424" y="740" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">t-SNE/UMAP: nur Nachbarschaften zählen</text>

      <g class="ab-step" data-s="10" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 10: Erklärung aufklappen">
      <rect x="60" y="776" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="798" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">10 · Interpretieren und benennen</text>
      <text x="210" y="816" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Profil in Originaleinheiten, fachlich ok?</text>
      </g>

      <path d="M60,808 H-38 V220 H60" marker-end="url(#ub-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>
      <text x="-44" y="514" text-anchor="middle" transform="rotate(-90 -44 514)" style="fill:var(--warn);font-size:11.5px;font-family:var(--f-mono)">passt fachlich nicht: zurück zu Schritt 3</text>
    </svg>
    </div>
    <div class="ab-detail" id="ubDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Schliessen">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Skalieren ist (ausser bei Baumverfahren wie dem Isolation Forest) Pflicht, weil fast alle Verfahren mit Abständen rechnen. Es gibt kein Testset (orange): Statt mit der richtigen Antwort prüfst du mit Silhouette, Stabilität und Fachwissen. Die Schleifen zeigen, dass du Einstellungen und Vorverarbeitung mehrmals anpasst.</figcaption>
  </figure>
  <div class="box" id="unsup-titanic">
    <h4>Komplettes Beispiel: Titanic ohne Zielspalte</h4>
    <p class="hint">Stark gekürzt. Dieselben Passagiere wie im <a href="titanic.html">Supervised-Beispiel</a>, aber die Frage ist eine andere: Welche Passagiertypen gab es? <code>Survived</code> geht nicht ins Modell, erst am Schluss zum Vergleich. Die Nummern sind die Schritte der Grafik oben; die Teile laufen nacheinander wie Zellen in einem Notebook.</p>
    <pre><code>import numpy as np, pandas as pd, matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, adjusted_rand_score

# 1 · Frage: Welche Passagiertypen gab es? Survived bleibt draussen.
# 2 · Daten laden und ansehen
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})  # 1 leere Zeile

# 3 · Vorverarbeiten: alles in Zahlen, Alter mit Median füllen, schiefe Fare logarithmieren
X = pd.DataFrame({&quot;Klasse&quot;: df[&quot;Pclass&quot;], &quot;Frau&quot;: (df[&quot;Sex&quot;] == &quot;female&quot;).astype(int),
                  &quot;Alter&quot;: df[&quot;Age&quot;].fillna(df[&quot;Age&quot;].median()),
                  &quot;Familie&quot;: df[&quot;SibSp&quot;] + df[&quot;Parch&quot;], &quot;logFare&quot;: np.log1p(df[&quot;Fare&quot;])})

# 4 · Skalieren (k-Means rechnet mit Abständen)
X_s = StandardScaler().fit_transform(X)

# 5 · Dimensionen reduzieren: hier nicht nötig, nur 5 Merkmale
# 6 + 7 · k-Means wählen, k mit der Silhouette bestimmen
ks = range(2, 9)
sil = [silhouette_score(X_s, KMeans(k, n_init=10, random_state=0).fit_predict(X_s)) for k in ks]
plt.figure(figsize=(4.5, 3)); plt.plot(ks, sil, &quot;o-&quot;); plt.xlabel(&quot;k&quot;); plt.ylabel(&quot;Silhouette&quot;); plt.show()
k = ks[int(np.argmax(sil))]</code></pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-unsup-1.png" alt="Silhouette für k gleich 2 bis 8, Maximum bei k gleich 6" loading="lazy"><figcaption>Die Silhouette ist bei k = 6 am höchsten. Der Unterschied zu k = 5 und 7 ist klein, darum folgt die Stabilitätsprüfung.</figcaption></figure>
    <pre><code># 8 · Stabilität: anderer Zufallsstart, gleiche Gruppen?
labels = KMeans(k, n_init=10, random_state=0).fit_predict(X_s)
other = KMeans(k, n_init=10, random_state=1).fit_predict(X_s)
print(&quot;k =&quot;, k, &quot;| ARI zwischen zwei Läufen:&quot;, round(adjusted_rand_score(labels, other), 2))</code></pre>
    <pre class="out">k = 6 | ARI zwischen zwei Läufen: 0.83</pre>
    <pre><code># 9 · Visualisieren: PCA auf 2D, nach Cluster eingefärbt
pca = PCA(2).fit(X_s)
Z = pca.transform(X_s)
plt.figure(figsize=(4.5, 3.5)); plt.scatter(Z[:, 0], Z[:, 1], c=labels, s=8, cmap=&quot;tab10&quot;)
plt.title(f&quot;PCA, {pca.explained_variance_ratio_.sum():.0%} der Varianz&quot;); plt.show()</code></pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-unsup-2.png" alt="PCA-Streudiagramm der Passagiere, nach sechs Clustern eingefärbt" loading="lazy"><figcaption>Die PCA-Karte zeigt 67 % der Varianz. Die Cluster überlappen in 2D teilweise; im vollen 5-dimensionalen Raum sind sie besser getrennt, aber nicht scharf (Silhouette 0,41: mässig deutliche Struktur).</figcaption></figure>
    <pre><code># 10 · Interpretieren in Originaleinheiten; Survived erst jetzt zum Vergleich
print(X.assign(Cluster=labels, Survived=df[&quot;Survived&quot;]).groupby(&quot;Cluster&quot;).mean().round(2).assign(n=np.bincount(labels)))</code></pre>
    <pre class="out">         Klasse  Frau  Alter  Familie  logFare  Survived    n
Cluster                                                      
0          2.83  0.00  27.70     0.24     2.27      0.13  373
1          1.35  0.00  25.75     0.92     3.87      0.41   98
2          2.64  1.00  24.84     0.84     2.68      0.71  184
3          1.40  0.04  53.58     0.48     3.47      0.23   81
4          2.98  0.50  17.79     5.80     3.55      0.11   56
5          1.06  1.00  34.31     1.11     4.45      0.97   99</pre>
    <p>So liest man die Tabelle: Cluster 0 sind allein reisende Männer der 3. Klasse (373, nur 13 % überlebt). Cluster 5 sind Frauen der 1. Klasse (97 % überlebt), Cluster 4 grosse Familien der 3. Klasse (11 %). Die Cluster kennen <code>Survived</code> nicht und trennen die Überlebenschancen trotzdem deutlich, weil Klasse, Geschlecht und Familie sie bestimmt haben.</p>
    <p class="note">Ein ARI von 0,83 zwischen zwei Läufen heisst: Die Gruppen sind weitgehend, aber nicht ganz stabil. Mit k = 6 nicht als «die Wahrheit» rechnen, sondern als eine nützliche Einteilung.</p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Skalieren, mehrere Einstellungen vergleichen, Stabilität prüfen und die Cluster in Originaleinheiten erklären. Ein Ergebnis ist gut, wenn es stabil ist und fachlich Sinn ergibt.</p></div>

  <h3 id="unsup-wahl">Welches Verfahren wofür?</h3>
  <p>Wähle zuerst das <b>Ziel</b>, dann das Verfahren. Die Tabelle zeigt, wann welches passt und worauf du achten musst.</p>
  <div class="tablewrap"><table>
    <tr><th>Ziel</th><th>Verfahren</th><th>Passt, wenn …</th><th>Vorsicht</th></tr>
    <tr><td rowspan="4"><b>Gruppen finden</b></td><td><a href="#unsup-kmeans">k-Means</a></td><td>die Gruppen rund und ähnlich gross sind, k ungefähr bekannt ist, viele Zeilen vorliegen; schneller Start</td><td>Jeder Punkt muss in eine Gruppe, Ausreisser ziehen die Zentren; k muss vorgegeben werden</td></tr>
    <tr><td><a href="#unsup-hier">Hierarchisch</a> (Ward)</td><td>wenige bis einige tausend Zeilen vorliegen und du den Baum (Dendrogramm) sehen und k erst danach wählen willst</td><td>Speicher und Rechenzeit wachsen quadratisch; Linkage <code>single</code> bildet Ketten</td></tr>
    <tr><td><a href="#unsup-dbscan">DBSCAN / HDBSCAN</a></td><td>die Gruppen beliebig geformt sind, k unbekannt ist und Rauschen als solches erkannt werden soll (Label −1)</td><td><code>eps</code> ist heikel; bei unterschiedlicher Dichte besser HDBSCAN; schwach bei sehr vielen Merkmalen</td></tr>
    <tr><td><a href="#unsup-dbscan">GMM</a></td><td>die Gruppen elliptisch sind oder sich überlappen und du Wahrscheinlichkeiten statt einer harten Zuordnung brauchst (k per BIC)</td><td>mehr Parameter als k-Means, braucht genug Zeilen pro Gruppe</td></tr>
    <tr><td><b>Auffälliges finden</b></td><td><a href="#unsup-anomalie">Isolation Forest</a></td><td>du eine Rangliste auffälliger Zeilen willst, auch bei vielen Merkmalen und grossen Daten</td><td><code>contamination</code> ist eine Annahme, kein Messwert; Skalieren nicht nötig</td></tr>
    <tr><td rowspan="3"><b>Merkmale verkleinern oder zeigen</b></td><td><a href="#unsup-pca">PCA</a></td><td>du weiterrechnen willst (vor dem Clustern, Rauschen entfernen) oder die Achsen erklären musst</td><td>nur lineare Zusammenhänge; vorher skalieren</td></tr>
    <tr><td><a href="#unsup-tsne">t-SNE</a></td><td>du ein 2D-Bild der Nachbarschaften willst</td><td>Abstände und Gruppengrössen im Bild bedeuten nichts; nicht als Eingabe für ein Modell</td></tr>
    <tr><td><a href="#unsup-tsne">UMAP</a></td><td>wie t-SNE, aber schneller, mit besser erhaltener Grobstruktur; neue Punkte lassen sich mit <code>transform</code> einordnen</td><td>das Bild hängt von den Einstellungen ab</td></tr>
  </table></div>
  <p><b>Sechs Fragen, die auswählen:</b></p>
  <ol>
    <li>Was will ich am Ende: Gruppen, auffällige Fälle oder ein Bild?</li>
    <li>Kenne ich k ungefähr? Wenn nein: hierarchisch (Dendrogramm), DBSCAN oder GMM mit BIC.</li>
    <li>Sind die Gruppen rund, elliptisch oder krumm?</li>
    <li>Gibt es Rauschen oder Ausreisser, die nicht in eine Gruppe gezwungen werden sollen? Dann DBSCAN.</li>
    <li>Brauche ich Wahrscheinlichkeiten statt einer harten Zuordnung? Dann GMM.</li>
    <li>Wie viele Zeilen und Merkmale habe ich? Viele Zeilen: k-Means. Sehr viele Merkmale: zuerst PCA.</li>
  </ol>
  <div class="merk"><b>Merksatz</b><p>Erst das Ziel, dann die Gruppenform, dann die Datenmenge. Skalieren brauchen alle Verfahren hier ausser dem Isolation Forest.</p></div>

  <h3 id="unsup-vs">1 · Supervised oder Unsupervised?</h3>
  <p>Die Problemart hängt nicht vom Verfahren ab, sondern von den <b>Daten und der Frage</b>. Entscheidend ist: Gibt es eine Spalte mit der gesuchten Antwort (Zielspalte <code>y</code>, Label)?</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Supervised</th><th>Unsupervised</th></tr>
    <tr><td>Daten</td><td>Merkmale <code>X</code> <b>und</b> Zielspalte <code>y</code></td><td>nur Merkmale <code>X</code></td></tr>
    <tr><td>Frage</td><td>«Was ist <code>y</code> für einen neuen Fall?»</td><td>«Welche Struktur steckt in <code>X</code>?»</td></tr>
    <tr><td>Aufgaben</td><td>Regression (Zahl), Klassifikation (Klasse)</td><td>Clustering, Anomalien, Dimensionsreduktion</td></tr>
    <tr><td>Beispiele</td><td>Wohnungspreis, Spam ja/nein, überlebt auf der Titanic</td><td>Kundensegmente, auffällige Zahlungen, 13 Messwerte in 2D zeichnen</td></tr>
    <tr><td>Bewertung</td><td>Vergleich mit der richtigen Antwort (MSE, Accuracy, ROC)</td><td>keine richtige Antwort: Silhouette, Stabilität, Fachwissen</td></tr>
    <tr><td>Aufteilen</td><td>Train, Validation, Test zwingend</td><td>meist alle Daten; ein Testset nur, wenn das Modell später neue Daten einordnet</td></tr>
    <tr><td>Ergebnis</td><td>Modell, das Vorhersagen macht</td><td>Gruppen, Scores oder neue Koordinaten, die du deuten musst</td></tr>
    <tr><td>Verfahren</td><td>Lineare und logistische Regression, kNN, Bäume</td><td>k-Means, hierarchisch, DBSCAN, GMM, Isolation Forest, PCA, t-SNE, UMAP</td></tr>
  </table></div>
  <p><b>Woran erkennst du die Problemart?</b></p>
  <ol>
    <li>Gibt es eine Zielspalte, und ist sie für genug Zeilen bekannt? Dann <b>Supervised</b>: Zahl → Regression, Kategorie → Klassifikation.</li>
    <li>Gibt es keine Zielspalte, und du suchst Gruppen, Ausreisser oder eine Übersicht? Dann <b>Unsupervised</b>.</li>
    <li>Nur wenige Zeilen haben ein Label, viele nicht? Dann <b>Semi-supervised</b>: zum Beispiel clustern, die Gruppen von Hand benennen und danach supervised weiterlernen.</li>
  </ol>
  <div class="demo" id="pvDemo">
    <div class="tag">Selbsttest</div><h4>Welche Problemart ist das?</h4>
    <p class="hint">Wähle eine Aufgabe und überlege zuerst selbst.</p>
    <div class="btnrow" id="pvBtns"></div>
    <p id="pvMsg"></p>
  </div>
  <div class="merk"><b>Gleiche Daten, andere Frage</b><p>Kundendaten mit einer Spalte «hat gekündigt»: «Wer kündigt als Nächstes?» ist Klassifikation (supervised). «Welche Kundentypen gibt es?» ist Clustering (unsupervised), die Spalte «hat gekündigt» bleibt dabei draussen.</p></div>
  <div class="falle"><b>Falle</b><p>Sind Labels vorhanden (zum Beispiel die Weinsorten im Lab), dürfen sie beim Unsupervised Learning <b>nicht ins Modell</b>. Du kannst sie erst danach zur Kontrolle neben die Cluster legen (ARI, siehe <a href="#unsup-profil">Cluster prüfen</a>).</p></div>

  <h3 id="unsup-dist">2 · Clustering und Anomalien</h3>
  <p>Ziel: Punkte im gleichen Cluster sind einander ähnlicher als Punkten in anderen Clustern. «Ähnlich» wird über einen <b>Abstand</b> gemessen:</p>
  <ul>
    <li><b>Euklidische Distanz</b>: die Luftlinie, <code>√(Σ (a<sub>i</sub> − b<sub>i</sub>)²)</code>. Für Zahlen.</li>
    <li><b>Simple Matching</b>: zählt, bei wie vielen Kategorien zwei Punkte <i>nicht</i> übereinstimmen. Für Kategorien.</li>
    <li><b>Dynamic Time Warping</b>: Abstand zwischen Zeitreihen, die leicht verschoben oder gedehnt sind.</li>
  </ul>
  <p><b>Anomalieerkennung</b> ist die Kehrseite: Nach dem Clustering gelten Punkte, die zu keinem Cluster gut passen oder weit von ihrem Zentrum liegen, als auffällig (z. B. ein Betrugsverdacht). Ein eigenes Verfahren dafür ist der <a href="#unsup-anomalie">Isolation Forest</a>.</p>

  <h3 id="unsup-kmeans">3 · k-Means</h3>
  <p>Du legst die Anzahl Cluster <b>k</b> selbst fest. Dann wiederholt der Algorithmus zwei Schritte, bis sich nichts mehr ändert:</p>
  <ol>
    <li>Jeden Punkt dem <b>nächsten Zentrum</b> zuordnen.</li>
    <li>Jedes Zentrum auf den <b>Mittelwert</b> seiner Punkte setzen.</li>
  </ol>
  <p>Das Ziel dahinter: die Summe der quadrierten Abstände innerhalb der Cluster (<b>WSS</b>, within-cluster sum of squares) möglichst klein machen. Der Start ist zufällig, deshalb kann ein anderer Start ein anderes Ergebnis geben.</p>
  <div class="demo" id="kmDemo">
    <div class="tag">Demo</div><h4>k-Means Schritt für Schritt</h4>
    ${KMeansDemo.html('km')}
  </div>
  <div class="falle"><b>Falle (Skalierung)</b><p>k-Means rechnet mit Abständen. Hat ein Merkmal grosse Zahlen (Preis in Franken) und ein anderes kleine (Bewertung 1 bis 5), entscheidet fast nur das grosse. Darum <b>vorher skalieren</b> (<code>StandardScaler</code>).</p></div>
  <div class="demo" id="scDemo">
    <div class="tag">Demo</div><h4>Ohne und mit Skalierung</h4>
    <p class="hint">Zwei echte Gruppen unterscheiden sich im kleinen Merkmal B (0,2 gegen 0,8). Das grosse Merkmal A (0 bis 1000) ist nur Streuung.</p>
    <svg class="plot" id="scSvg" viewBox="0 0 320 200" role="img" aria-label="Punkte nach Merkmal A und B, nach k-Means eingefärbt"></svg>
    <div class="btnrow"><button id="scRaw" class="pri">Ohne Skalieren</button><button id="scStd">Mit Skalieren</button></div>
    <p class="hint" id="scMsg"></p>
  </div>
  <pre><code>from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

X_s = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X_s)
labels = km.labels_            # Cluster pro Zeile
km.cluster_centers_            # Zentren (im skalierten Raum)
km.inertia_                    # WSS</code></pre>

  <h3 id="unsup-k">4 · Wie viele Cluster?</h3>
  <p>Die Methoden aus dem Supervised Learning (Test-Set, Accuracy) gehen nicht, es gibt ja keine richtige Antwort. Drei übliche Hilfen:</p>
  <ul>
    <li><b>Elbow-Methode</b>: WSS für k = 1, 2, 3 … zeichnen. WSS sinkt mit wachsendem k (bei guter Lösung), aber ab dem «Ellbogen» nur noch wenig. Dort wählst du k.</li>
    <li><b>Silhouette</b>: Pro Punkt: <code>s = (b − a) / max(a, b)</code>, mit a = mittlerer Abstand zu den Punkten im <i>eigenen</i> Cluster, b = mittlerer Abstand zum <i>nächsten fremden</i> Cluster. Nahe 1 passt gut, nahe 0 liegt zwischen zwei Clustern, negativ ist falsch zugeordnet. Du nimmst das k mit dem höchsten Durchschnitt.</li>
    <li><b>Gap-Statistik</b>: Vergleicht log(WSS) deiner Daten mit log(WSS) von Zufallsdaten im gleichen Wertebereich. Der Abstand heisst «Gap». Gewählt wird das kleinste k, ab dem der Gap kaum mehr wächst (vereinfacht: das k mit dem grössten Gap).</li>
  </ul>
  <div class="demo" id="elDemo">
    <div class="tag">Demo</div><h4>Ellbogen und Silhouette für die Punkte oben</h4>
    <svg class="plot" id="elSvg" viewBox="0 0 320 200" role="img" aria-label="WSS und Silhouette für k gleich 1 bis 8"></svg>
    <div class="stats"><span>bestes k nach Silhouette <b id="elBest"></b></span></div>
    <p class="hint">Blau: WSS (links, sinkt mit k). Orange: Silhouette (je höher, desto besser, ab k = 2). Die Daten haben drei Gruppen: Der Ellbogen und das Silhouette-Maximum zeigen auf k = 3.</p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Die Methoden liefern Vorschläge, keine Wahrheit. Entscheidend ist am Ende, ob die Cluster fachlich Sinn ergeben und sich beschreiben lassen.</p></div>

  <h3 id="unsup-hier">5 · Hierarchisches Clustering</h3>
  <p>Hier musst du k nicht vorher wählen. Jeder Punkt startet als eigenes Cluster, dann werden immer die zwei <b>ähnlichsten</b> Cluster verschmolzen, bis alles ein Baum ist, das <b>Dendrogramm</b>. Wo du den Baum waagrecht «durchschneidest», bestimmt die Clusterzahl: Je höher der Schnitt, desto weniger Cluster. Die Höhe einer Verbindung zeigt, wie unähnlich die verschmolzenen Gruppen waren.</p>
  <p>Wie der Abstand zwischen <i>Gruppen</i> gemessen wird, bestimmt die <b>Linkage</b>:</p>
  <div class="tablewrap"><table>
    <tr><th>Linkage</th><th>Abstand zweier Gruppen</th><th>Tendenz</th></tr>
    <tr><td>Single</td><td>kleinster Abstand zwischen zwei Punkten</td><td>Ketten, lange dünne Cluster</td></tr>
    <tr><td>Complete</td><td>grösster Abstand zwischen zwei Punkten</td><td>kompakte, ähnlich grosse Cluster</td></tr>
    <tr><td>Average</td><td>Mittel aller Punktpaare</td><td>Kompromiss</td></tr>
    <tr><td>Ward</td><td>so, dass die WSS am wenigsten wächst</td><td>kompakt, ähnlich k-Means (häufige Wahl)</td></tr>
  </table></div>
  <pre><code>from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
Z = linkage(X_s, method="ward")
dendrogram(Z)
labels = fcluster(Z, t=3, criterion="maxclust")   # 3 Cluster</code></pre>
  <p class="note">Kleine Entscheide mit grossen Folgen: Standardisieren, Distanzmass, Linkage und Clusterzahl. Ändere jeweils nur eines und vergleiche.</p>

  <div class="demo" id="hcDemo">
    <div class="tag">Demo</div><h4>Hierarchisches Clustering: Linkage und Schnitt</h4>
    <svg class="plot" id="hcSvg" viewBox="0 0 320 220" role="img" aria-label="24 Punkte in Gruppen, gefärbt nach der Zahl der gewählten Cluster"></svg>
    <div class="btnrow"><button id="hcL1">Single</button><button id="hcL2">Complete</button><button id="hcL3">Average</button><button class="pri" id="hcL4">Ward</button></div>
    <div class="ctl"><label for="hcK">Anzahl Cluster (Schnitt)</label><input type="range" id="hcK" min="1" max="8" step="1" value="3"><output id="hcKO"></output></div>
    <div class="stats"><span>Cluster <b id="hcN"></b></span><span>letzte Verschmelzung bei <b id="hcLast"></b></span><span>nächste bei <b id="hcNext"></b></span></div>
    <p class="hint" id="hcMsg">&nbsp;</p>
    <p class="hint">Die Zahlen sind Abstände im Bild (Einheit: 1 = Breite). Springt der Abstand der nächsten Verschmelzung stark, ist der Schnitt davor sinnvoll: genau das zeigt die Lücke im Dendrogramm.</p>
  </div>
  <h3 id="unsup-dbscan">6 · Andere Clusterformen: DBSCAN und GMM</h3>
  <p>k-Means und Ward suchen runde, ähnlich grosse Gruppen. Sind die Gruppen gekrümmt (Monde in der Demo oben), verschieden dicht oder gibt es Rauschen, helfen andere Verfahren.</p>
  <h4>DBSCAN: Gruppen über die Dichte</h4>
  <p>Ein Punkt, in dessen Umkreis <code>eps</code> mindestens <code>min_samples</code> Punkte liegen (er selbst mitgezählt), ist ein <b>Kernpunkt</b>. Kernpunkte, die nahe beieinander liegen, bilden zusammen einen Cluster, Punkte am Rand gehören dazu. Alles andere ist <b>Rauschen</b> (Label <code>-1</code>).</p>
  <ul>
    <li>k musst du nicht vorgeben, und die Cluster dürfen jede Form haben.</li>
    <li>Ausreisser werden als Rauschen markiert, statt ein Zentrum zu verziehen.</li>
    <li>Schwierig: <code>eps</code> passend wählen. Zu klein gibt viel Rauschen, zu gross verschmilzt alles. Bei Gruppen mit unterschiedlicher Dichte passt kein einzelnes <code>eps</code>. Dann hilft <b>HDBSCAN</b>, das mit verschiedenen Dichten umgehen kann.</li>
    <li>Auch DBSCAN rechnet mit Abständen: vorher skalieren.</li>
  </ul>
  <pre><code>from sklearn.cluster import DBSCAN, HDBSCAN
labels = DBSCAN(eps=0.2, min_samples=5).fit_predict(X_s)   # -1 = Rauschen
(labels == -1).mean()                                        # Anteil Rauschen
labels = HDBSCAN(min_cluster_size=15, min_samples=5).fit_predict(X_s)</code></pre>
  <p class="note">Achtung: <code>silhouette_score</code> behandelt Rauschpunkte (Label −1) wie einen eigenen Cluster. Lass sie vorher weg (<code>m = labels != -1; silhouette_score(X_s[m], labels[m])</code>) und gib immer auch an, wie viele Punkte überhaupt einem Cluster zugeordnet wurden.</p>
  <div class="demo" id="dbDemo">
    <div class="tag">Demo</div><h4>DBSCAN: eps und min_samples</h4>
    <svg class="plot" id="dbSvg" viewBox="0 0 320 220" role="img" aria-label="Zwei Monde mit Rauschen, gefärbt nach DBSCAN-Cluster"></svg>
    <div class="ctl"><label for="dbE">eps</label><input type="range" id="dbE" min="0.05" max="0.5" step="0.01" value="0.2"><output id="dbEO"></output></div>
    <div class="ctl"><label for="dbM">min_samples</label><input type="range" id="dbM" min="2" max="12" step="1" value="5"><output id="dbMO"></output></div>
    <div class="stats"><span>Cluster <b id="dbN"></b></span><span>Rauschpunkte <b id="dbNoise"></b></span><span>Core-Punkte <b id="dbCore"></b></span></div>
    <p class="hint" id="dbMsg">&nbsp;</p>
    <p class="hint">Voller Punkt = Core, blasser Punkt = Rand (Border), graues Kreuz = Rauschen (Label −1). Der gestrichelte Kreis zeigt, wie weit eps reicht.</p>
  </div>
  <h4 id="unsup-gmm">Gaussian Mixture Model (GMM): Wahrscheinlichkeiten statt fester Zuordnung</h4>
  <p>Ein GMM beschreibt jeden Cluster als Glockenkurve, im 2D-Bild als Ellipse. Jeder Punkt bekommt eine <b>Wahrscheinlichkeit pro Cluster</b>, die Werte einer Zeile ergeben zusammen 1. Eine Zeile wie 0,60 / 0,35 / 0,05 zeigt: Der Punkt liegt zwischen zwei Gruppen, die Zuordnung ist unsicher. Die Anzahl Komponenten wählst du zum Beispiel mit dem <b>BIC</b> (tiefer ist besser).</p>
  <pre><code>from sklearn.mixture import GaussianMixture
gmm = GaussianMixture(n_components=3, covariance_type="full", n_init=5, random_state=0).fit(X_s)
gmm.predict_proba(X_s)     # Wahrscheinlichkeit je Cluster, Zeilensumme 1
gmm.bic(X_s)               # für mehrere n_components vergleichen</code></pre>
  <div class="demo" id="gmDemo">
    <div class="tag">Demo</div><h4>GMM: Anzahl Komponenten</h4>
    <svg class="plot" id="gmSvg" viewBox="0 0 320 220" role="img" aria-label="60 Punkte mit Ellipsen der Gauss-Komponenten"></svg>
    <div class="ctl"><label for="gmK">Komponenten (n_components)</label><input type="range" id="gmK" min="1" max="5" step="1" value="3"><output id="gmKO"></output></div>
    <div class="stats"><span>Komponenten <b id="gmN"></b></span><span>Log-Likelihood <b id="gmLL"></b></span><span>BIC <b id="gmBic"></b></span></div>
    <p class="hint" id="gmMsg">&nbsp;</p>
    <p class="hint">Die Ellipsen umfassen je etwa 95 % einer Komponente. Blasse Punkte liegen zwischen zwei Komponenten: das Modell ist unsicher. Der BIC bestraft zu viele Komponenten, kleiner ist besser.</p>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Verfahren</th><th>k vorgeben?</th><th>Clusterform</th><th>Rauschen</th><th>Gut für</th></tr>
    <tr><td>k-Means</td><td>ja</td><td>rund, ähnlich gross</td><td>nein</td><td>schneller Start, grosse Daten</td></tr>
    <tr><td>Hierarchisch (Ward)</td><td>später, im Dendrogramm</td><td>kompakt</td><td>nein</td><td>kleinere Daten, Baum ansehen</td></tr>
    <tr><td>DBSCAN / HDBSCAN</td><td>nein</td><td>beliebig</td><td>ja (<code>-1</code>)</td><td>gekrümmte Gruppen, Ausreisser</td></tr>
    <tr><td>GMM</td><td>ja (BIC hilft)</td><td>Ellipsen</td><td>nein</td><td>unsichere Zuordnung sichtbar machen</td></tr>
  </table></div>

  <h3 id="unsup-profil">7 · Cluster prüfen und erklären</h3>
  <h4 id="unsup-stabil">Ist das Ergebnis stabil?</h4>
  <p>Ein gutes Clustering bleibt ähnlich, wenn du kleine Dinge änderst: anderer <code>random_state</code>, mehr <code>n_init</code>, eine Teilstichprobe von 80 % der Zeilen oder ein anderes Skalieren. Zwei Einteilungen vergleichst du mit dem <b>Adjusted Rand Index (ARI)</b>: 1 heisst gleiche Einteilung, um 0 heisst nicht besser als Zufall. Die Nummern der Cluster spielen dabei keine Rolle.</p>
  <pre><code>from sklearn.metrics import adjusted_rand_score
a = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X_s)
b = KMeans(n_clusters=3, n_init=10, random_state=1).fit_predict(X_s)
adjusted_rand_score(a, b)      # nahe 1 = stabil</code></pre>
  <p class="note">Gibt es bekannte Labels (die Weinsorten im Lab 1), kannst du sie <b>nach</b> der Wahl mit dem ARI neben die Cluster legen. Weicht das Ergebnis ab, ist es nicht automatisch falsch: Die Cluster können eine andere, ebenfalls sinnvolle Struktur zeigen.</p>
  <h4>Cluster beschreiben</h4>
  <p>Die Cluster entstehen auf skalierten Daten, erklären willst du sie aber in den Originaleinheiten. Darum die Clusternummer wieder an die ursprüngliche Tabelle hängen und beschreiben:</p>
  <pre><code>df["cluster"] = labels
df.groupby("cluster").agg(["mean", "median", "count"])   # Profil je Cluster
sns.boxplot(data=df, x="cluster", y="preis")             # Verteilung je Cluster</code></pre>
  <p>Frage dich: Wodurch unterscheiden sich die Gruppen? Welches Merkmal trennt am besten? Kannst du jedem Cluster einen verständlichen Namen geben («günstige Sets für Kinder»)? Ein sehr kleiner Cluster besteht oft nur aus Ausreissern.</p>

  <h3 id="unsup-anomalie">8 · Anomalien finden: Isolation Forest</h3>
  <p>Idee: Ungewöhnliche Punkte lassen sich schnell <b>isolieren</b>. Der Isolation Forest teilt die Daten immer wieder mit zufälligen Fragen («Betrag grösser als das Doppelte des Üblichen?»). Ein normaler Punkt steckt mitten in der Menge und braucht viele solche Splits, bis er allein ist. Ein auffälliger Punkt ist schon nach wenigen Splits allein. Viele zufällige Bäume zusammen ergeben einen <b>Anomalie-Score</b>.</p>
  <pre><code>from sklearn.ensemble import IsolationForest
model = IsolationForest(n_estimators=200, contamination="auto", random_state=42).fit(X)
score = -model.score_samples(X)          # grösser = ungewöhnlicher
top20 = score.argsort()[::-1][:20]       # so viele, wie geprüft werden können</code></pre>
  <ul>
    <li><b>Merkmale mit Kontext</b> schlagen Rohwerte: «Betrag im Vergleich zum Üblichen dieses Kontos» findet mehr als «grösster Betrag».</li>
    <li>Das Ergebnis ist eine <b>Rangliste für Menschen</b>, kein automatisches Urteil. Wer prüft, braucht Betrag, Verlauf und den Grund, warum der Fall auffällt.</li>
    <li>Werden später echte Befunde bekannt, misst du die <b>Precision</b> bei deinem Prüf-Budget (von 20 geprüften Fällen, wie viele waren echt?).</li>
  </ul>
  <div class="falle"><b>Falle</b><p>Die «Top 20» liefern immer 20 Fälle, auch an einem Tag ohne echte Auffälligkeit. Und wenn sich das normale Verhalten ändert (alle Zahlungen werden grösser oder später), meldet das alte Modell plötzlich viele False Alarms. Referenzwerte und Modell regelmässig neu anpassen.</p></div>

  <div class="demo" id="ifDemo">
    <div class="tag">Demo</div><h4>Isolation Forest: Bäume und Contamination</h4>
    <svg class="plot" id="ifSvg" viewBox="0 0 320 220" role="img" aria-label="Punktwolke mit einzelnen Ausreissern, grösser = ungewöhnlicher"></svg>
    <div class="ctl"><label for="ifT">Anzahl Bäume (n_estimators)</label><input type="range" id="ifT" min="1" max="100" step="1" value="25"><output id="ifTO"></output></div>
    <div class="ctl"><label for="ifC">contamination</label><input type="range" id="ifC" min="1" max="15" step="1" value="5"><output id="ifCO"></output></div>
    <div class="stats"><span>Markiert <b id="ifF"></b></span><span>Davon echte Ausreisser (von 6) <b id="ifH"></b></span><span>höchster Score <b id="ifS"></b></span></div>
    <p class="hint" id="ifMsg">&nbsp;</p>
    <p class="hint">Ein grosser Punkt hat einen hohen Score, er liess sich mit wenigen zufälligen Schnitten isolieren. Roter Ring = markiert. Mit wenigen Bäumen schwanken die Scores noch stark.</p>
  </div>
  <h3 id="unsup-dimred">9 · Dimensionsreduktion</h3>
  <p>Echte Datensätze haben oft Hunderte Merkmale. Das macht Training langsam, Interpretation schwer und führt zum <b>Fluch der Dimensionen</b>: In vielen Dimensionen liegen alle Punkte weit auseinander, der Raum ist «leer», und Vorhersagen für neue Punkte werden unzuverlässig.</p>
  <div class="tablewrap"><table>
    <tr><th>Zwei Zufallspunkte im Einheits-…</th><th class="num">mittlerer Abstand</th></tr>
    <tr><td>Quadrat (2 Dimensionen)</td><td class="num">0,52</td></tr>
    <tr><td>Würfel (3 Dimensionen)</td><td class="num">0,66</td></tr>
    <tr><td>Hyperwürfel (1 000 000 Dimensionen)</td><td class="num">408,25</td></tr>
  </table></div>
  <p>Zum Glück liegen die Daten meist nicht gleichmässig im Raum, sondern nahe an einem viel kleineren Unterraum (viele Merkmale sind konstant oder stark korreliert). Zwei Wege:</p>
  <ul>
    <li><b>Projektion</b>: Die Daten auf eine Ebene oder Achse «fallen lassen» (PCA).</li>
    <li><b>Manifold Learning</b>: Die Daten liegen auf einer gebogenen Fläche (wie eine aufgerollte Schweizer Rolle), die man gedanklich glättet (t-SNE).</li>
  </ul>
  <div class="falle"><b>Falle</b><p>Jede Reduktion verliert Information. Probiere zuerst mit den Originaldaten, und reduziere nur, wenn es Tempo, Visualisierung oder Rauschen rechtfertigt.</p></div>

  <h3 id="unsup-pca">10 · PCA (Hauptkomponentenanalyse)</h3>
  <p>PCA sucht die Richtung, in der die Daten am <b>stärksten streuen</b> (die erste Hauptkomponente), dann die nächste Richtung, die darauf senkrecht steht und die restliche Streuung am besten erfasst, usw. Behältst du nur die ersten paar Komponenten, behältst du den grössten Teil der Information in weniger Dimensionen.</p>
  <div class="demo" id="pcDemo">
    <div class="tag">Demo</div><h4>Die beste Achse finden</h4>
    <svg class="plot" id="pcSvg" viewBox="0 0 320 240" role="img" aria-label="Punktwolke mit drehbarer Achse und Projektionen"></svg>
    <div class="ctl"><label for="pcA">Winkel</label><input type="range" id="pcA" min="0" max="179" step="1" value="90"><output id="pcAO"></output></div>
    <div class="btnrow"><button class="pri" id="pcBest">Beste Achse (PC1)</button></div>
    <div class="stats"><span>Varianz auf der Achse <b id="pcV"></b></span><span>verloren <b id="pcL"></b></span></div>
    <p class="hint">Die roten Striche zeigen, was beim Projizieren verloren geht (Abstand zur Achse). Dreh die Achse: Die beste Richtung hat die grösste erhaltene Varianz und gleichzeitig den kleinsten Verlust. Die zweite Komponente steht senkrecht dazu.</p>
  </div>
  <pre><code>from sklearn.decomposition import PCA
pca = PCA(n_components=2).fit(X_s)       # vorher skalieren
Z = pca.transform(X_s)                    # neue 2D-Koordinaten
pca.explained_variance_ratio_             # Anteil Varianz je Komponente</code></pre>
  <p>Mit <code>explained_variance_ratio_</code> siehst du, wie viel Information 2 Komponenten behalten. Die Komponenten sind Mischungen der Originalmerkmale und damit schwerer zu deuten: <code>pca.components_</code> zeigt, wie stark jedes skalierte Merkmal in eine Komponente eingeht.</p>
  <div class="falle"><b>Falle (Skalierung)</b><p>PCA zieht den Mittelwert ab, gleicht die Streuung aber nicht an. Ohne Skalieren gewinnt das Merkmal mit den grössten Zahlen (beim Wein: Prolin in Hunderten gegen Alkohol um 13), und PC1 ist fast nur dieses Merkmal.</p></div>
  <div class="demo" id="rsDemo">
    <div class="tag">Demo</div><h4>Nach der PCA nochmals skalieren?</h4>
    <p class="hint">Zwei Gruppen, zwei standardisierte Merkmale. Klick dich durch die drei Stufen.</p>
    <div class="btnrow" id="rsStage" role="group" aria-label="Stufe"><button data-v="0">1 · Start (skaliert)</button><button data-v="1">2 · Nach PCA</button><button data-v="2">3 · PCA-Ausgabe neu skaliert</button></div>
    <svg class="plot" id="rsSvg" viewBox="0 0 320 240" role="img" aria-label="Punktwolke zweier Gruppen in der gewählten Stufe"></svg>
    <svg class="plot" id="rsCurve" viewBox="0 0 320 130" role="img" aria-label="Streuung der Punkte je Richtung, 0 bis 180 Grad" style="margin-top:8px"></svg>
    <div class="stats"><span>Varianz PC1 <b id="rsV1"></b></span><span>Varianz PC2 <b id="rsV2"></b></span><span>Anteil PC1 <b id="rsP"></b></span></div>
    <p class="hint" id="rsMsg"></p>
  </div>
  <h4 id="unsup-pca-k">Wie viele Komponenten?</h4>
  <ul>
    <li><b>Für ein Bild</b>: 2 Komponenten. Schreib dazu, wie viel Varianz fehlt.</li>
    <li><b>Zum Weiterrechnen</b>: so viele, dass die <b>kumulierte</b> erklärte Varianz einen Threshold erreicht, zum Beispiel 90 %. Oder dort, wo die Kurve abflacht (wie beim Ellbogen).</li>
  </ul>
  <p><b>Rekonstruktion</b>: Mit <code>inverse_transform</code> baust du aus den behaltenen Komponenten eine Näherung der Originaldaten. Je weniger Komponenten, desto grösser der Unterschied zum Original. So siehst du direkt, was verloren geht (im Lab: Ziffernbilder mit 2, 10 und 30 Komponenten).</p>
  <pre><code>import numpy as np
pca = PCA().fit(X_s)
np.cumsum(pca.explained_variance_ratio_)    # kumulierte Varianz
pca90 = PCA(n_components=0.90).fit(X_s)     # so viele Komponenten wie für 90 % nötig
X_back = pca90.inverse_transform(pca90.transform(X_s))   # Näherung im skalierten Raum</code></pre>

  <h3 id="unsup-tsne">11 · t-SNE und UMAP</h3>
  <p>t-SNE ist ein Verfahren fürs <b>Zeichnen</b> in 2D. Es versucht, Nachbarschaften zu erhalten: Punkte, die im hohen Raum nah beieinander liegen, sollen auch im 2D-Bild nah liegen. Dazu werden Ähnlichkeiten als Wahrscheinlichkeiten ausgedrückt und die 2D-Punkte per Gradient Descent so verschoben, dass sie dazu passen.</p>
  <ul>
    <li><b>Perplexity</b>: grob die Zahl der Nachbarn, auf die jeder Punkt achtet (typisch 5 bis 50). Der wichtigste Regler, probiere mehrere Werte.</li>
    <li>Weitere Einstellungen: Anzahl Iterationen, Lernrate.</li>
  </ul>
  <div class="falle"><b>Falle</b><p>In einem t-SNE-Bild sind <b>Abstände zwischen Gruppen und Gruppengrössen nicht aussagekräftig</b>, nur «wer ist mit wem benachbart». Es ist ein Bild zum Erkunden, keine Basis für Modelle, und ein anderer Zufallsstart liefert ein anderes Bild.</p></div>
  <pre><code>from sklearn.manifold import TSNE
Z = TSNE(n_components=2, perplexity=30, random_state=0).fit_transform(X_s)
plt.scatter(Z[:, 0], Z[:, 1], c=labels)</code></pre>
  <div class="demo" id="tsDemo">
    <div class="tag">Demo</div><h4>PCA, t-SNE und UMAP bei einfachen und schwierigen Daten</h4>
    <p class="hint">300 Punkte mit einstellbar vielen Merkmalen (Dimensionen). Die Farbe zeigt die wahre Gruppe; keines der drei Verfahren sieht sie.</p>
    <div class="btnrow" id="tsData" role="group" aria-label="Datensatz"><button data-v="0">Einfach: 3 Gruppen</button><button data-v="1">Mittel: 6 Gruppen, paarweise nah</button><button data-v="2">Schwer: Swiss Roll</button><button data-v="3">Keine Struktur</button></div>
    <div class="ctl"><label for="tsD">Dimensionen</label><input type="range" id="tsD" min="2" max="50" step="1" value="10"><output id="tsDO"></output></div>
    <div class="ctl"><label for="tsP">Perplexity (t-SNE)</label><input type="range" id="tsP" min="2" max="50" step="1" value="20"><output id="tsPO"></output></div>
    <div class="ctl"><label for="tsK">n_neighbors (UMAP)</label><input type="range" id="tsK" min="2" max="50" step="1" value="15"><output id="tsKO"></output></div>
    <div class="grid2">
      <div><h4>PCA (linear, 2 Komponenten)</h4><svg class="plot" id="tsPca" viewBox="0 0 240 240" role="img" aria-label="PCA-Karte der Punkte"></svg></div>
      <div><h4>t-SNE</h4><svg class="plot" id="tsTsne" viewBox="0 0 240 240" role="img" aria-label="t-SNE-Karte der Punkte"></svg></div>
      <div><h4>UMAP</h4><svg class="plot" id="tsUmap" viewBox="0 0 240 240" role="img" aria-label="UMAP-Karte der Punkte"></svg></div>
    </div>
    <div class="stats"><span>Nachbarn mit gleicher Farbe: Original <b id="tsNO"></b></span><span>PCA <b id="tsNP"></b></span><span>t-SNE <b id="tsNT"></b></span><span>UMAP <b id="tsNU"></b></span></div>
    <div class="btnrow"><button id="tsRun">t-SNE und UMAP neu starten (anderer Zufall)</button></div>
    <p class="hint" id="tsMsg"></p>
    <p class="hint">«Nachbarn mit gleicher Farbe» zählt bei den 10 nächsten Nachbarn jedes Punktes, wie viele zur selben Gruppe gehören. Zufall wäre etwa 33 % (3 Gruppen) oder 17 % (6 Gruppen). Eine Karte kann die Gruppen kaum besser zeigen, als sie im Original getrennt sind.</p>
  </div>
  <p><b>UMAP</b> macht ebenfalls eine Karte der Nachbarschaften, ist meist schneller und behält etwas mehr von der groben Gesamtstruktur. Zwei Regler:</p>
  <ul>
    <li><code>n_neighbors</code> (Standard 15): klein betont die lokale Nachbarschaft, gross mehr das Gesamtbild.</li>
    <li><code>min_dist</code> (Standard 0,1): wie eng die Punkte in der Karte zusammenrücken dürfen.</li>
  </ul>
  <pre><code>import umap                              # Paket umap-learn, separat installieren
Z = umap.UMAP(n_neighbors=15, min_dist=0.1, random_state=0).fit_transform(X_s)

from sklearn.manifold import trustworthiness
trustworthiness(X_s, Z, n_neighbors=10)  # 1 = Nachbarn gut erhalten</code></pre>
  <p>Ob eine Karte taugt, prüfst du an den Nachbarn: Liegen die Punkte, die im Original am nächsten sind, auch auf der Karte nahe? Das misst die <b>Trustworthiness</b>. Am besten schaust du für einzelne Punkte auch die Originale an (im Lab: die Ziffernbilder neben einem Punkt).</p>
  <div class="falle"><b>Falle</b><p>Nicht auf der t-SNE- oder UMAP-Karte clustern und dann die hohe Silhouette als Beweis nehmen. Die Karte zieht Gruppen künstlich auseinander. Die Silhouette auf der Karte sagt wenig über die Originaldaten.</p></div>
  <div class="tablewrap"><table>
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Art</td><td>linear, Projektion</td><td>nicht linear, Nachbarschaften</td><td>nicht linear, Nachbarschaften</td></tr>
    <tr><td>Tempo</td><td>schnell</td><td>langsam</td><td>mittel</td></tr>
    <tr><td>Wichtigste Regler</td><td><code>n_components</code></td><td><code>perplexity</code></td><td><code>n_neighbors</code>, <code>min_dist</code></td></tr>
    <tr><td>Ergebnis</td><td>immer gleich, auf neue Daten anwendbar</td><td>zufallsabhängig, nur für die gegebenen Daten</td><td>zufallsabhängig, neue Daten mit <code>transform</code> möglich</td></tr>
    <tr><td>Nutzen</td><td>Vorverarbeitung, Rauschen, 2D-Bild</td><td>2D-Bild von Gruppen</td><td>2D-Bild, auch grössere Daten</td></tr>
  </table></div>

  <h3 id="unsup-deep">12 · Deep Clustering (Ausblick)</h3>
  <p>Klassisches Clustering wird bei sehr vielen Merkmalen (Bilder, Text) schlecht. Beim Deep Clustering lernt ein <b>Autoencoder</b> (ein neuronales Netz, das seine Eingabe durch einen engen Flaschenhals hindurch rekonstruiert) eine kompakte Darstellung. In dieser «latenten» Darstellung wird dann geclustert. Fortgeschrittene Varianten trainieren Darstellung und Clustering gemeinsam. Du musst das hier nur einordnen können.</p>

  <p class="note">Notebooks des Dozenten (Kursordner <code>07 - UNSUPERVISED-LEARNING/code</code>): <code>clustering_k_means</code>, <code>clustering_k_means optimizing</code>, <code>hierarchical_clustering</code>, <code>dimension_reduction_pca</code>, <code>dimension_reduction_tsne</code>, jeweils mit <code>_exercise</code>-Version. Labs (Ordner <code>notebooks</code>): <code>01_clustering_lab</code> (Wein: Skalierung, k, DBSCAN, GMM, ARI), <code>02_anomaly_detection_lab</code> (Isolation Forest), <code>03_pca_lab</code> (Komponenten, Rekonstruktion), <code>04_embeddings_lab</code> (t-SNE und UMAP).</p>
`,
    exercises: [
      {
        t: 'Euklidische Distanz',
        task: `Schreibe <code>distanz(a, b)</code> für zwei Punkte <code>(x, y)</code>: die Wurzel aus der Summe der quadrierten Differenzen. Nimm <code>math.sqrt</code>.`,
        start: `import math\n\ndef distanz(a, b):\n    return None  # TODO\n\nprint(distanz((0, 0), (3, 4)))`,
        check: `assert abs(distanz((0, 0), (3, 4)) - 5) < 1e-9, "(0,0) zu (3,4) ist 5"\nassert distanz((1, 1), (1, 1)) == 0`,
        sol: `import math\n\ndef distanz(a, b):\n    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)`,
      },
      {
        t: 'k-Means Schritt 1: nächstes Zentrum',
        task: `Gib mit <code>naechstes(p, zentren)</code> den <b>Index</b> des Zentrums zurück, das dem Punkt <code>p</code> am nächsten liegt (Vergleich der quadrierten Abstände reicht).`,
        start: `def naechstes(p, zentren):\n    best, best_d = 0, None\n    # TODO: Schleife über zentren mit enumerate\n    return best\n\nzentren = [(0, 0), (10, 10)]\nprint(naechstes((2, 1), zentren), naechstes((9, 8), zentren))`,
        check: `zentren = [(0, 0), (10, 10)]\nassert naechstes((2, 1), zentren) == 0\nassert naechstes((9, 8), zentren) == 1\nassert naechstes((1, 1), [(5, 5), (0, 0), (9, 9)]) == 1`,
        sol: `def naechstes(p, zentren):\n    best, best_d = 0, None\n    for j, c in enumerate(zentren):\n        d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2\n        if best_d is None or d < best_d:\n            best, best_d = j, d\n    return best`,
      },
      {
        t: 'k-Means Schritt 2: Zentrum verschieben',
        task: `Berechne <code>neues_zentrum</code> als Mittelwert (x und y getrennt) der Punkte des Clusters.`,
        start: `punkte = [(1, 2), (3, 4), (5, 9)]\nneues_zentrum = (None, None)  # TODO\nprint(neues_zentrum)`,
        check: `assert abs(neues_zentrum[0] - 3) < 1e-9, "Mittelwert der x-Werte"\nassert abs(neues_zentrum[1] - 5) < 1e-9, "Mittelwert der y-Werte"`,
        sol: `n = len(punkte)\nneues_zentrum = (sum(p[0] for p in punkte) / n, sum(p[1] for p in punkte) / n)`,
      },
    ],
    quiz: [
      { q: `Was ist der Unterschied zwischen Supervised und Unsupervised Learning?`, a: `Supervised lernt aus Beispielen mit bekannter Antwort. Unsupervised hat keine Antwort und sucht selbst Struktur (Gruppen, wichtige Richtungen).` },
      { q: `Welche zwei Schritte wiederholt k-Means?`, a: `Punkte dem nächsten Zentrum zuordnen, dann jedes Zentrum auf den Mittelwert seiner Punkte setzen. Bis sich die Zuordnung nicht mehr ändert.` },
      { q: `Warum musst du vor k-Means skalieren?`, a: `Der Algorithmus rechnet mit Abständen. Ein Merkmal mit grossen Zahlen würde die anderen übertönen.` },
      { q: `Wie findest du die passende Clusterzahl?`, a: `Elbow (WSS gegen k, Knick suchen), Silhouette (höchster Durchschnitt) oder Gap-Statistik. Zusätzlich zählt, ob die Cluster fachlich Sinn ergeben.` },
      { q: `Was ist der Vorteil des hierarchischen Clusterings gegenüber k-Means?`, a: `k muss nicht vorher feststehen: Das Dendrogramm zeigt alle Stufen, und du schneidest auf der gewünschten Höhe. Dafür ist es bei sehr vielen Punkten langsamer.` },
      { q: `Wofür steht die erste Hauptkomponente in PCA?`, a: `Für die Richtung mit der grössten Streuung der Daten. Sie behält am meisten Information, wenn du auf eine Achse reduzierst.` },
      { q: `Was darfst du aus einem t-SNE-Bild nicht ablesen?`, a: `Die Abstände zwischen Gruppen und die Gruppengrössen. Aussagekräftig ist nur, welche Punkte benachbart sind. Zudem hängt das Bild von Perplexity und Zufallsstart ab.` },
      { q: `Woran erkennst du, ob ein Problem supervised oder unsupervised ist?`, a: `An der Zielspalte: Gibt es eine bekannte Antwort (Label) für genug Zeilen, ist es supervised (Zahl → Regression, Kategorie → Klassifikation). Ohne Zielspalte, wenn du Gruppen, Ausreisser oder eine Übersicht suchst, ist es unsupervised.` },
      { q: `Warum gibt es beim Clustering meist kein Testset?`, a: `Es gibt keine richtige Antwort, mit der man vergleichen könnte. Geprüft wird mit Silhouette, Stabilität (ARI zwischen Läufen) und Fachwissen. Ein Testset braucht es nur, wenn das Modell später neue Daten einordnen soll.` },
      { q: `Wann ist DBSCAN besser als k-Means?`, a: `Bei gekrümmten oder unregelmässigen Gruppen und wenn es Rauschen gibt. DBSCAN braucht kein k und markiert Ausreisser mit -1. Dafür muss eps passen, und bei sehr unterschiedlicher Dichte hilft eher HDBSCAN.` },
      { q: `Was liefert ein GMM, was k-Means nicht liefert?`, a: `Eine Wahrscheinlichkeit pro Cluster für jeden Punkt (Zeilensumme 1). So sieht man, welche Zuordnungen unsicher sind. Die Cluster dürfen zudem elliptisch sein.` },
      { q: `Wie findet der Isolation Forest Ausreisser?`, a: `Er teilt die Daten mit zufälligen Splits. Auffällige Punkte sind schon nach wenigen Splits allein, normale brauchen viele. Kurzer Weg heisst hoher Anomalie-Score. Das Ergebnis ist eine Rangliste zum Prüfen, kein Urteil.` },
      { q: `Wie wählst du die Anzahl PCA-Komponenten?`, a: `Für ein Bild 2. Zum Weiterrechnen so viele, bis die kumulierte erklärte Varianz einen Threshold wie 90 % erreicht (PCA(n_components=0.90)) oder die Kurve abflacht.` },
    ],
    init() { LernApp.demos.unsup(); },
  });
})();
