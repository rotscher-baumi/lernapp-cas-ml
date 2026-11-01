/* Module: Unsupervised Learning (Clustering, Dimensionsreduktion). Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  const COL=['var(--accent)','var(--warn)','var(--ok)','var(--bad)','#8A5CD0','#C0527A','#3A9AA8','#8A8A3A'];
  const d2=(a,b)=>(a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]);
  // One k-means iteration: assign to nearest centre, then move centres to the mean. Returns true if labels changed.
  function assign(pts,cent,lab){let ch=false;pts.forEach((p,i)=>{let b=0,bd=Infinity;cent.forEach((c,j)=>{const d=d2(p,c);if(d<bd){bd=d;b=j}});if(lab[i]!==b){lab[i]=b;ch=true}});return ch}
  function update(pts,cent,lab){cent.forEach((c,j)=>{let sx=0,sy=0,n=0;pts.forEach((p,i)=>{if(lab[i]===j){sx+=p[0];sy+=p[1];n++}});if(n){c[0]=sx/n;c[1]=sy/n}})}
  function wss(pts,cent,lab){let s=0;pts.forEach((p,i)=>{s+=d2(p,cent[lab[i]])});return s}
  function kmeans(pts,k,r,tries){let best=null;
    for(let t=0;t<(tries||1);t++){const idx=[];while(idx.length<k){const i=Math.floor(r()*pts.length);if(idx.indexOf(i)<0)idx.push(i)}
      const cent=idx.map(i=>pts[i].slice(0,2)),lab=new Array(pts.length).fill(-1);
      for(let it=0;it<100;it++){const ch=assign(pts,cent,lab);update(pts,cent,lab);if(!ch)break}
      const w=wss(pts,cent,lab);if(!best||w<best.w)best={cent:cent,lab:lab,w:w}}
    return best}
  function silhouette(pts,lab,k){let tot=0;
    pts.forEach((p,i)=>{const sum=new Array(k).fill(0),cnt=new Array(k).fill(0);
      pts.forEach((q,j)=>{if(i!==j){sum[lab[j]]+=Math.sqrt(d2(p,q));cnt[lab[j]]++}});
      const a=cnt[lab[i]]?sum[lab[i]]/cnt[lab[i]]:0;let b=Infinity;
      for(let c=0;c<k;c++)if(c!==lab[i]&&cnt[c])b=Math.min(b,sum[c]/cnt[c]);
      tot+=Math.max(a,b)?(b-a)/Math.max(a,b):0});
    return tot/pts.length}
  function blobs(r){const pts=[];[[0.2,0.25],[0.75,0.3],[0.5,0.8]].forEach(c=>{for(let i=0;i<30;i++)pts.push([c[0]+0.07*gauss(r),c[1]+0.07*gauss(r)])});return pts}
  function dot(x,y,c,rad){return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(rad||3.5)+'" style="fill:'+c+';stroke:var(--fg);stroke-width:.8"/>'}

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
  <p>Der Tag arbeitet mit einem Lego-Datensatz (von der Spielwarenseite gescrapt), die Labs mit Wein-Messwerten, simulierten Zahlungen und handgeschriebenen Ziffern. Es gibt kein «richtig», nur nützlich oder nicht. Darum gehört die <b>Interpretation</b> zum Ergebnis dazu.</p>

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
    <figcaption>Skalieren (blau) ist Pflicht, weil fast alle Verfahren mit Abständen rechnen. Es gibt kein Testset (orange): Statt mit der richtigen Antwort prüfst du mit Silhouette, Stabilität und Fachwissen. Die Schleifen zeigen, dass du Einstellungen und Vorverarbeitung mehrmals anpasst.</figcaption>
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
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-unsup-2.png" alt="PCA-Streudiagramm der Passagiere, nach sechs Clustern eingefärbt" loading="lazy"><figcaption>Die PCA-Karte zeigt 67 % der Varianz. Die Cluster überlappen in 2D teilweise, getrennt sind sie in allen 5 Merkmalen.</figcaption></figure>
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

  <h3 id="unsup-dbscan">6 · Andere Clusterformen: DBSCAN und GMM</h3>
  <p>k-Means und Ward suchen runde, ähnlich grosse Gruppen. Sind die Gruppen gekrümmt (Monde in der Demo oben), verschieden dicht oder gibt es Rauschen, helfen andere Verfahren.</p>
  <h4>DBSCAN: Gruppen über die Dichte</h4>
  <p>Ein Punkt mit mindestens <code>min_samples</code> Nachbarn im Umkreis <code>eps</code> ist ein <b>Kernpunkt</b>. Kernpunkte, die nahe beieinander liegen, bilden zusammen einen Cluster, Punkte am Rand gehören dazu. Alles andere ist <b>Rauschen</b> (Label <code>-1</code>).</p>
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
  <p class="note">Die Silhouette lässt Rauschpunkte weg. Gib darum immer auch an, wie viele Punkte überhaupt einem Cluster zugeordnet wurden.</p>
  <h4 id="unsup-gmm">Gaussian Mixture Model (GMM): Wahrscheinlichkeiten statt fester Zuordnung</h4>
  <p>Ein GMM beschreibt jeden Cluster als Glockenkurve, im 2D-Bild als Ellipse. Jeder Punkt bekommt eine <b>Wahrscheinlichkeit pro Cluster</b>, die Werte einer Zeile ergeben zusammen 1. Eine Zeile wie 0,60 / 0,35 / 0,05 zeigt: Der Punkt liegt zwischen zwei Gruppen, die Zuordnung ist unsicher. Die Anzahl Komponenten wählst du zum Beispiel mit dem <b>BIC</b> (tiefer ist besser).</p>
  <pre><code>from sklearn.mixture import GaussianMixture
gmm = GaussianMixture(n_components=3, covariance_type="full", n_init=5, random_state=0).fit(X_s)
gmm.predict_proba(X_s)     # Wahrscheinlichkeit je Cluster, Zeilensumme 1
gmm.bic(X_s)               # für mehrere n_components vergleichen</code></pre>
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
  <div class="falle"><b>Falle</b><p>Die «Top 20» liefern immer 20 Fälle, auch an einem Tag ohne echte Auffälligkeit. Und wenn sich das normale Verhalten ändert (alle Zahlungen werden grösser oder später), meldet das alte Modell plötzlich viele Fehlalarme. Referenzwerte und Modell regelmässig neu anpassen.</p></div>

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
    <li><b>Zum Weiterrechnen</b>: so viele, dass die <b>kumulierte</b> erklärte Varianz eine Schwelle erreicht, zum Beispiel 90 %. Oder dort, wo die Kurve abflacht (wie beim Ellbogen).</li>
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

  <p class="note">Notebooks des Dozenten (Kursordner <code>07 - UNSUPERVISED-LEARNING/code</code>): <code>clustering_k_means</code>, <code>clustering_k_means optimizing</code>, <code>hierarchical_clustering</code>, <code>dimension_reduction_pca</code>, <code>dimension_reduction_tsne</code>, jeweils mit <code>_exercise</code>-Version. Daten: <code>lego_daten_one_hot_encoded_cleaned.csv</code>. Labs (Ordner <code>notebooks</code>): <code>01_clustering_lab</code> (Wein: Skalierung, k, DBSCAN, GMM, ARI), <code>02_anomaly_detection_lab</code> (Isolation Forest), <code>03_pca_lab</code> (Komponenten, Rekonstruktion), <code>04_embeddings_lab</code> (t-SNE und UMAP).</p>
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
      { q: `Wie wählst du die Anzahl PCA-Komponenten?`, a: `Für ein Bild 2. Zum Weiterrechnen so viele, bis die kumulierte erklärte Varianz eine Schwelle wie 90 % erreicht (PCA(n_components=0.90)) oder die Kurve abflacht.` },
    ],
    init() {
      // Workflow figure: click a step to open its explanation (same pattern as the ml chapter)
      (function(){
        const fig=document.querySelector('#unsup .ab-fig');
        if(!fig)return;
        const panel=fig.querySelector('.ab-detail'),steps=fig.querySelectorAll('.ab-step');
        const t=LernApp.t;
        const S={
          '1':[t('1 · Frage klären','1 · Clarify the question'),t('Bevor du rechnest: Was willst du am Ende in der Hand haben? <b>Gruppen</b> (Clustering), eine <b>Rangliste auffälliger Fälle</b> (Anomalien) oder ein <b>Bild</b> der Daten (Dimensionsreduktion)? Und wer braucht das Ergebnis wofür? Die Frage bestimmt Verfahren, Merkmale und wie du das Ergebnis prüfst.','Before you compute anything: what do you want to have in your hands at the end? <b>Groups</b> (Clustering), a <b>ranked list of unusual cases</b> (anomalies) or a <b>picture</b> of the data (dimensionality reduction)? And who needs the result, and for what? The question decides the method, the features and how you check the result.'),[[t('Supervised oder Unsupervised?','Supervised or Unsupervised?'),'#unsup-vs'],[t('Clustering und Anomalien','Clustering and anomalies'),'#unsup-dist']]],
          'y':[t('Zielspalte y vorhanden?','Target column y present?'),t('Gibt es eine Spalte mit der gesuchten Antwort, und ist sie für genug Zeilen bekannt? Dann ist es ein Supervised-Problem (Regression oder Klassifikation) mit eigenem Ablauf. Ohne Zielspalte geht es hier weiter. Vorhandene Labels kommen nicht ins Modell, du kannst sie erst am Schluss zum Vergleich nutzen.','Is there a column with the answer you are looking for, and is it known for enough rows? Then it is a supervised problem (regression or classification) with its own workflow. Without a target column you continue here. Existing labels do not go into the model; you can only use them at the end for comparison.'),[[t('Supervised oder Unsupervised?','Supervised or Unsupervised?'),'#unsup-vs'],[t('Ablauf Supervised','Supervised workflow'),'#ml-ablauf']]],
          '2':[t('2 · Daten laden und ansehen','2 · Load and inspect the data'),t('Zeilen, Spalten und Datentypen prüfen (<code>df.info()</code>, <code>df.describe()</code>), fehlende Werte zählen, Verteilungen und Ausreisser ansehen, Korrelationen suchen. Stark korrelierte Merkmale zählen beim Abstand doppelt. Die EDA zeigt, was in Schritt 3 und 4 nötig ist.','Check rows, columns and data types (<code>df.info()</code>, <code>df.describe()</code>), count missing values, look at distributions and outliers, look for correlations. Strongly correlated features count twice in the distance. The EDA shows what is needed in steps 3 and 4.'),[[t('Pandas-Grundlagen','Pandas basics'),'#pandas'],[t('Visualisieren','Visualisation'),'#viz']]],
          't':[t('Kein Testset','No test set'),t('Es gibt keine richtige Antwort, mit der du vergleichen könntest. Darum fällt das Aufteilen in Train und Test meist weg, und du arbeitest mit allen Daten. Bewertet wird mit Silhouette, Stabilität und Fachwissen. Ausnahme: Soll das Modell später <b>neue</b> Daten einordnen (z. B. neue Kunden einem Segment zuweisen), lernst du Scaler und Modell auf einem Teil und prüfst auf dem Rest.','There is no correct answer you could compare with. So splitting into train and test usually falls away, and you work with all the data. You evaluate with Silhouette, stability and domain knowledge. Exception: if the model is later meant to place <b>new</b> data (e.g. assign new customers to a segment), you fit the scaler and model on one part and check on the rest.'),[[t('Wie viele Cluster?','How many clusters?'),'#unsup-k'],[t('Cluster prüfen','Checking clusters'),'#unsup-profil']]],
          '3':[t('3 · Vorverarbeiten','3 · Preprocess'),t('Abstände brauchen Zahlen: Kategorien in 0/1-Spalten umwandeln (One-Hot, wie beim Lego-Datensatz), fehlende Werte füllen oder Zeilen entfernen. Merkmale bewusst auswählen: Jedes Merkmal bestimmt mit, was «ähnlich» heisst. IDs oder Spalten wie «hat gekündigt» gehören nicht hinein.','Distances need numbers: turn categories into 0/1 columns (One-Hot, as with the Lego dataset), fill missing values or remove rows. Choose features deliberately: every feature helps decide what «similar» means. IDs or columns like «has cancelled» do not belong in it.'),[[t('Fehlende Werte','Missing values'),'#ml-missing'],[t('Kategorien in Zahlen','Categories to numbers'),'#ml-cat'],[t('Abstandsmasse','Distance measures'),'#unsup-dist']]],
          '4':[t('4 · Skalieren','4 · Scale'),t('Fast alle Verfahren hier rechnen mit Abständen (k-Means, hierarchisch, DBSCAN, PCA, t-SNE). Ohne Skalieren entscheidet das Merkmal mit den grössten Zahlen. <code>StandardScaler</code> ist der Normalfall, <code>RobustScaler</code> bei vielen Ausreissern.','Almost all methods here work with distances (k-Means, hierarchical, DBSCAN, PCA, t-SNE). Without scaling, the feature with the largest numbers decides. <code>StandardScaler</code> is the normal case, <code>RobustScaler</code> when there are many outliers.'),[[t('Ohne und mit Skalierung (Demo)','Without and with scaling (demo)'),'#scDemo'],[t('Skalieren','Scaling'),'#ml-scaling']]],
          '5':[t('5 · Dimensionen reduzieren (optional)','5 · Reduce dimensions (optional)'),t('Bei sehr vielen Merkmalen werden Abstände unzuverlässig (Fluch der Dimensionen). PCA vor dem Clustern fasst korrelierte Merkmale zusammen und entfernt Rauschen. Wähle so viele Komponenten, dass zum Beispiel 90 % der Varianz bleiben. Bei wenigen Merkmalen kannst du den Schritt weglassen.','With very many features, distances become unreliable (curse of dimensionality). PCA before clustering combines correlated features and removes noise. Choose enough components to keep, for example, 90 % of the variance. With few features you can skip this step.'),[[t('Dimensionsreduktion','Dimensionality reduction'),'#unsup-dimred'],['PCA','#unsup-pca'],[t('Wie viele Komponenten?','How many components?'),'#unsup-pca-k']]],
          '6':[t('6 · Verfahren wählen','6 · Choose a method'),t('<b>k-Means</b> für runde, ähnlich grosse Gruppen und als schneller Start. <b>Hierarchisch</b>, wenn du den Baum sehen und k später wählen willst. <b>DBSCAN/HDBSCAN</b> bei gekrümmten Gruppen und Rauschen. <b>GMM</b>, wenn unsichere Zuordnungen sichtbar sein sollen. <b>Isolation Forest</b>, wenn du Ausreisser suchst statt Gruppen.','<b>k-Means</b> for round groups of similar size and as a quick start. <b>Hierarchical</b> if you want to see the tree and choose k later. <b>DBSCAN/HDBSCAN</b> for curved groups and noise. <b>GMM</b> if uncertain assignments should be visible. <b>Isolation Forest</b> if you are looking for outliers instead of groups.'),[['k-Means','#unsup-kmeans'],[t('Hierarchisch','Hierarchical'),'#unsup-hier'],[t('DBSCAN und GMM','DBSCAN and GMM'),'#unsup-dbscan'],['Isolation Forest','#unsup-anomalie']]],
          '7':[t('7 · Parameter wählen','7 · Choose parameters'),t('Jedes Verfahren hat Regler: k bei k-Means und GMM, <code>eps</code> und <code>min_samples</code> bei DBSCAN, Linkage und Schnitthöhe beim Dendrogramm. Mehrere Werte durchprobieren und vergleichen: Elbow (WSS), Silhouette, Gap, BIC. Die Masse liefern Vorschläge, keine Wahrheit. Ändere jeweils nur eine Einstellung.','Every method has settings: k for k-Means and GMM, <code>eps</code> and <code>min_samples</code> for DBSCAN, linkage and cut height for the dendrogram. Try out and compare several values: Elbow (WSS), Silhouette, Gap, BIC. The measures give suggestions, not the truth. Change only one setting at a time.'),[[t('Wie viele Cluster?','How many clusters?'),'#unsup-k'],[t('Dendrogramm','Dendrogram'),'#unsup-hier'],['DBSCAN','#unsup-dbscan']]],
          '8':[t('8 · Stabilität prüfen','8 · Check stability'),t('Kommt mit anderem <code>random_state</code>, mehr <code>n_init</code> oder 80 % der Zeilen dasselbe heraus? Vergleiche die Einteilungen mit dem ARI (1 = gleich). Instabile Cluster sind oft Zufall oder ein falsches k. Gibt es bekannte Labels, kannst du sie hier zur Kontrolle danebenlegen.','Do you get the same result with a different <code>random_state</code>, more <code>n_init</code> or 80 % of the rows? Compare the partitions with the ARI (1 = identical). Unstable clusters are often chance or a wrong k. If there are known labels, you can put them alongside here as a check.'),[[t('Ist das Ergebnis stabil?','Is the result stable?'),'#unsup-stabil']]],
          '9':[t('9 · Visualisieren','9 · Visualise'),t('Die Daten mit PCA, t-SNE oder UMAP auf 2D bringen und nach Cluster einfärben. Bei PCA die erklärte Varianz dazuschreiben. Bei t-SNE und UMAP zählen nur die Nachbarschaften, nicht Abstände oder Grössen der Gruppen. Mehrere Einstellungen (Perplexity, <code>n_neighbors</code>) ausprobieren.','Bring the data down to 2D with PCA, t-SNE or UMAP and colour it by cluster. For PCA, state the explained variance. For t-SNE and UMAP only the neighbourhoods count, not distances or sizes of the groups. Try several settings (Perplexity, <code>n_neighbors</code>).'),[['PCA','#unsup-pca'],[t('t-SNE und UMAP','t-SNE and UMAP'),'#unsup-tsne']]],
          '10':[t('10 · Interpretieren und benennen','10 · Interpret and name'),t('Clusternummer an die Originaltabelle hängen und je Cluster Mittelwert, Median und Anzahl ansehen, in Originaleinheiten. Jedem Cluster einen verständlichen Namen geben. Passt etwas fachlich nicht, zurück zur Vorverarbeitung (Schritt 3): andere Merkmale, anderes Skalieren, anderes Verfahren.','Attach the cluster number to the original table and look at mean, median and count per cluster, in original units. Give each cluster an understandable name. If something does not make sense in domain terms, go back to preprocessing (step 3): other features, different scaling, a different method.'),[[t('Cluster beschreiben','Describing clusters'),'#unsup-profil'],[t('Visualisieren','Visualisation'),'#viz']]]
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

      // Self-test: supervised or unsupervised?
      (function(){
        const t=LernApp.t;
        const C=[
          [t('Hauspreis schätzen','Estimate house price'),t('Supervised, Regression: Die Zielspalte «Preis» ist bekannt und eine Zahl.','Supervised, regression: the target column «price» is known and is a number.')],
          [t('Kundentypen finden','Find customer types'),t('Unsupervised, Clustering: Es gibt keine Zielspalte, gesucht sind Gruppen ähnlicher Kunden.','Unsupervised, Clustering: there is no target column; you are looking for groups of similar customers.')],
          [t('Spam erkennen','Detect spam'),t('Supervised, Klassifikation: Für alte Mails ist bekannt, ob sie Spam waren (Label ja/nein).','Supervised, classification: for old emails it is known whether they were spam (label yes/no).')],
          [t('Auffällige Zahlungen','Unusual payments'),t('Unsupervised, Anomalieerkennung: Betrugsfälle sind meist nicht markiert, gesucht ist das Ungewöhnliche (Isolation Forest).','Unsupervised, anomaly detection: fraud cases are usually not marked; you are looking for the unusual (Isolation Forest).')],
          [t('13 Messwerte in 2D','13 measurements in 2D'),t('Unsupervised, Dimensionsreduktion: PCA, t-SNE oder UMAP machen aus vielen Merkmalen ein Bild.','Unsupervised, dimensionality reduction: PCA, t-SNE or UMAP turn many features into a picture.')],
          [t('Kündigung vorhersagen','Predict cancellation'),t('Supervised, Klassifikation: Die Spalte «hat gekündigt» ist für frühere Kunden bekannt.','Supervised, classification: the column «has cancelled» is known for past customers.')],
          [t('Wenige Bilder beschriftet','Few images labelled'),t('Semi-supervised: Erst clustern oder Labels übertragen, dann mit den beschrifteten Beispielen supervised weiterlernen.','Semi-supervised: first cluster or transfer labels, then continue learning supervised with the labelled examples.')]
        ];
        const box=$('pvBtns'),msg=$('pvMsg');
        box.innerHTML=C.map((c,i)=>'<button data-i="'+i+'">'+c[0]+'</button>').join('');
        box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
          box.querySelectorAll('button').forEach(x=>x.className=x===b?'pri':'');msg.textContent=C[+b.dataset.i][1]});
      })();

      // Demo 1: k-means step by step (shared code in assets/demos-kmeans.js)
      KMeansDemo.init('km');

      // Demo 2: effect of scaling
      (function(){
        const r=mulberry32(21),raw=[],truth=[];
        for(let i=0;i<80;i++){const g=i%2;raw.push([r()*1000,(g?0.8:0.2)+0.06*gauss(r)]);truth.push(g)}
        const mean=j=>raw.reduce((s,p)=>s+p[j],0)/raw.length,sd=j=>{const m=mean(j);return Math.sqrt(raw.reduce((s,p)=>s+(p[j]-m)*(p[j]-m),0)/raw.length)};
        const sc=raw.map(p=>[(p[0]-mean(0))/sd(0),(p[1]-mean(1))/sd(1)]);
        const lo=[Math.min.apply(null,raw.map(p=>p[0])),Math.min.apply(null,raw.map(p=>p[1]))],hi=[Math.max.apply(null,raw.map(p=>p[0])),Math.max.apply(null,raw.map(p=>p[1]))];
        const W=320,H=200,sx=p=>14+(p[0]-lo[0])/(hi[0]-lo[0])*(W-28),sy=p=>H-14-(p[1]-lo[1])/(hi[1]-lo[1])*(H-28);
        function show(scaled){const res=kmeans(scaled?sc:raw,2,mulberry32(3),10);
          let same=0;res.lab.forEach((l,i)=>{if(l===truth[i])same++});const agree=Math.max(same,raw.length-same)/raw.length;
          let s='<text class="lbl" x="'+(W-110)+'" y="'+(H-3)+'">'+LernApp.t('Merkmal A (gross) →','Feature A (large) →')+'</text><text class="lbl" x="3" y="10">'+LernApp.t('↑ Merkmal B (klein)','↑ Feature B (small)')+'</text>';
          raw.forEach((p,i)=>{s+=dot(sx(p),sy(p),COL[res.lab[i]],3.5)});
          $('scSvg').innerHTML=s;$('scRaw').className=scaled?'':'pri';$('scStd').className=scaled?'pri':'';
          $('scMsg').textContent=(scaled?LernApp.t('Mit Skalierung: ','With scaling: '):LernApp.t('Ohne Skalierung: ','Without scaling: '))+Math.round(agree*100)+LernApp.t(' % der Punkte liegen im «richtigen» Cluster. ',' % of the points are in the «right» cluster. ')+(scaled?LernApp.t('Beide Merkmale zählen gleich, die Gruppen aus B werden gefunden.','Both features count equally; the groups in B are found.'):LernApp.t('Merkmal A hat Zahlen bis 1000, B nur bis 1: Der Algorithmus schneidet nach A und übersieht die echten Gruppen.','Feature A has numbers up to 1000, B only up to 1: the algorithm cuts along A and misses the real groups.'))}
        $('scRaw').addEventListener('click',()=>show(false));$('scStd').addEventListener('click',()=>show(true));show(false)})();

      // Demo 3: elbow and silhouette
      (function(){
        const pts=blobs(mulberry32(5)),ks=[1,2,3,4,5,6,7,8],ws=[],ss=[];
        ks.forEach(k=>{const res=kmeans(pts,k,mulberry32(100+k),8);ws.push(res.w);ss.push(k>1?silhouette(pts,res.lab,k):null)});
        const W=320,H=200,PX=34,sx=i=>PX+i*(W-PX-14)/7,wy=v=>H-22-(v/ws[0])*(H-40),sy=v=>H-22-v*(H-40);
        let s='<line class="ax" x1="'+PX+'" y1="'+(H-22)+'" x2="'+(W-10)+'" y2="'+(H-22)+'"/>';
        ks.forEach((k,i)=>{s+='<text class="lbl" x="'+(sx(i)-3)+'" y="'+(H-8)+'">'+k+'</text>'});
        s+='<text class="lbl" x="'+(PX+80)+'" y="'+(H-0)+'">'+LernApp.t('Anzahl Cluster k','Number of clusters k')+'</text>';
        s+='<path class="ln" d="'+ws.map((v,i)=>(i?'L':'M')+sx(i).toFixed(1)+' '+wy(v).toFixed(1)).join('')+'"/>';
        ws.forEach((v,i)=>{s+=dot(sx(i),wy(v),'var(--accent)',3.5)});
        let p2='';ss.forEach((v,i)=>{if(v!==null){p2+=(p2?'L':'M')+sx(i).toFixed(1)+' '+sy(v).toFixed(1)}});
        s+='<path class="ln2" d="'+p2+'"/>';ss.forEach((v,i)=>{if(v!==null)s+=dot(sx(i),sy(v),'var(--warn)',3.5)});
        let bi=1;ss.forEach((v,i)=>{if(v!==null&&v>ss[bi])bi=i});
        s+='<line class="dash" x1="'+sx(bi)+'" y1="10" x2="'+sx(bi)+'" y2="'+(H-22)+'"/>';
        $('elSvg').innerHTML=s;$('elBest').textContent=ks[bi]+' (Silhouette '+fmt(ss[bi],2)+')'})();

      // Demo 4: PCA
      (function(){
        const r=mulberry32(8),pts=[];for(let i=0;i<60;i++){const a=gauss(r),b=0.35*gauss(r);pts.push([1.15*a-0.35*b,0.6*a+0.8*b])}
        const mx=pts.reduce((s,p)=>s+p[0],0)/pts.length,my=pts.reduce((s,p)=>s+p[1],0)/pts.length;
        const P=pts.map(p=>[p[0]-mx,p[1]-my]);
        let sxx=0,syy=0,sxy=0;P.forEach(p=>{sxx+=p[0]*p[0];syy+=p[1]*p[1];sxy+=p[0]*p[1]});sxx/=P.length;syy/=P.length;sxy/=P.length;
        const total=sxx+syy,bestRad=0.5*Math.atan2(2*sxy,sxx-syy);let bestDeg=Math.round(((bestRad*180/Math.PI)+180)%180);
        const W=320,H=240,sc=48,sx=x=>W/2+x*sc,sy=y=>H/2-y*sc;
        function draw(){const deg=+$('pcA').value;$('pcAO').textContent=deg+'°';const a=deg*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a);
          let s='<line class="dash" x1="'+sx(-3.2*ux)+'" y1="'+sy(-3.2*uy)+'" x2="'+sx(3.2*ux)+'" y2="'+sy(3.2*uy)+'" style="stroke:var(--accent);stroke-width:2"/>';
          P.forEach(p=>{const t=p[0]*ux+p[1]*uy,qx=t*ux,qy=t*uy;
            s+='<line class="res" x1="'+sx(p[0])+'" y1="'+sy(p[1])+'" x2="'+sx(qx)+'" y2="'+sy(qy)+'"/>'});
          P.forEach(p=>{const t=p[0]*ux+p[1]*uy;s+=dot(sx(p[0]),sy(p[1]),'var(--surface)',3);s+='<circle cx="'+sx(t*ux)+'" cy="'+sy(t*uy)+'" r="2.5" style="fill:var(--accent)"/>'});
          $('pcSvg').innerHTML=s;
          const v=ux*ux*sxx+2*ux*uy*sxy+uy*uy*syy;$('pcV').textContent=fmt(v/total*100,0)+' %';$('pcL').textContent=fmt((1-v/total)*100,0)+' %'}
        $('pcA').addEventListener('input',draw);$('pcBest').addEventListener('click',()=>{$('pcA').value=bestDeg;draw()});draw()})();

      // Demo 5: why the PCA output is not rescaled (whitening flattens the variance per direction)
      (function(){
        const r=mulberry32(12),grp=[],raw=[],rot=35*Math.PI/180;
        for(let i=0;i<80;i++){const g=i%2,a=(g?1.2:-1.2)+0.35*gauss(r),b=0.25*gauss(r);grp.push(g);raw.push([a*Math.cos(rot)-b*Math.sin(rot),a*Math.sin(rot)+b*Math.cos(rot)])}
        const cov=P=>{let a=0,b=0,c=0;P.forEach(p=>{a+=p[0]*p[0];b+=p[1]*p[1];c+=p[0]*p[1]});return[a/P.length,b/P.length,c/P.length]};
        const m=[0,1].map(j=>raw.reduce((s,p)=>s+p[j],0)/raw.length);
        // Stage 0: standardised features; stage 1: PCA scores; stage 2: PCA scores divided by their sd (whitening).
        const sd=[0,1].map(j=>Math.sqrt(raw.reduce((s,p)=>s+(p[j]-m[j])*(p[j]-m[j]),0)/raw.length));
        const S0=raw.map(p=>[(p[0]-m[0])/sd[0],(p[1]-m[1])/sd[1]]);
        const C0=cov(S0),th=0.5*Math.atan2(2*C0[2],C0[0]-C0[1]),u1=[Math.cos(th),Math.sin(th)],u2=[-Math.sin(th),Math.cos(th)];
        const S1=S0.map(p=>[p[0]*u1[0]+p[1]*u1[1],p[0]*u2[0]+p[1]*u2[1]]),C1=cov(S1);
        const S2=S1.map(p=>[p[0]/Math.sqrt(C1[0]),p[1]/Math.sqrt(C1[1])]);
        const stages=[S0,S1,S2],W=320,H=240,sc=40,sx=x=>W/2+x*sc,sy=y=>H/2-y*sc;
        const vAt=(C,deg)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return c*c*C[0]+2*c*s*C[2]+s*s*C[1]};
        const vmax=Math.max.apply(null,stages.map(S=>{const C=cov(S);let v=0;for(let d=0;d<180;d++)v=Math.max(v,vAt(C,d));return v}))*1.1;
        const MSG=[LernApp.t('Start: Beide Merkmale haben Varianz 1. Die Wolke streut stark entlang der Diagonale (PC1, Linie) und kaum quer dazu (PC2, gestrichelt). Unten: Die Streuung je Richtung hat einen klaren Gipfel.','Start: both features have variance 1. The cloud spreads strongly along the diagonal (PC1, line) and hardly across it (PC2, dashed). Below: the spread per direction has a clear peak.'),
          LernApp.t('Nach der PCA: dieselben Punkte, nur gedreht. PC1 liegt waagrecht und trägt fast die ganze Streuung, auch den Abstand der zwei Gruppen. PC2 ist fast nur Rauschen. Lässt du PC2 weg, verlierst du wenig.','After PCA: the same points, only rotated. PC1 lies horizontally and carries almost all of the spread, including the gap between the two groups. PC2 is almost only noise. If you drop PC2, you lose little.'),
          LernApp.t('Neu skaliert: Das Rauschen in PC2 wurde auf Varianz 1 aufgeblasen und zählt jetzt gleich viel wie PC1. Die Gruppen wirken weniger getrennt. Unten ist die Kurve flach: Jede Richtung streut gleich, eine zweite PCA fände keine beste Richtung mehr.','Rescaled: the noise in PC2 has been blown up to variance 1 and now counts as much as PC1. The groups look less separated. Below, the curve is flat: every direction spreads equally, so a second PCA would no longer find a best direction.')];
        function draw(st){const S=stages[st],C=cov(S);let s='';
          s+='<line class="dash" x1="0" y1="'+sy(0)+'" x2="'+W+'" y2="'+sy(0)+'" style="opacity:.4"/><line class="dash" x1="'+sx(0)+'" y1="0" x2="'+sx(0)+'" y2="'+H+'" style="opacity:.4"/>';
          if(st===0){s+='<line x1="'+sx(-3.6*u1[0])+'" y1="'+sy(-3.6*u1[1])+'" x2="'+sx(3.6*u1[0])+'" y2="'+sy(3.6*u1[1])+'" style="stroke:var(--accent);stroke-width:2"/>';
            s+='<line class="dash" x1="'+sx(-2*u2[0])+'" y1="'+sy(-2*u2[1])+'" x2="'+sx(2*u2[0])+'" y2="'+sy(2*u2[1])+'" style="stroke:var(--accent);stroke-width:2"/>';
            s+='<text class="lbl" x="'+(W-110)+'" y="'+(H-4)+'">'+LernApp.t('Merkmal 1 →','Feature 1 →')+'</text><text class="lbl" x="4" y="12">'+LernApp.t('↑ Merkmal 2','↑ Feature 2')+'</text>'}
          else s+='<text class="lbl" x="'+(W-60)+'" y="'+(sy(0)-5)+'">PC1 →</text><text class="lbl" x="'+(sx(0)+5)+'" y="12">↑ PC2</text>';
          S.forEach((p,i)=>{s+=dot(sx(p[0]),sy(p[1]),COL[grp[i]],3)});
          $('rsSvg').innerHTML=s;
          // Variance per direction: what a (second) PCA looks at.
          const cw=320,ch=130,l=34,b=ch-22,cx=d=>l+d/180*(cw-l-8),cy=v=>b-v/vmax*(b-10);let c='',path='',best=0,bv=-1,lo=Infinity;
          for(let d=0;d<=180;d+=2){const v=vAt(C,d);path+=(d?'L':'M')+cx(d).toFixed(1)+' '+cy(v).toFixed(1);if(v>bv){bv=v;best=d}lo=Math.min(lo,v)}
          c+='<line x1="'+l+'" y1="'+b+'" x2="'+(cw-8)+'" y2="'+b+'" style="stroke:var(--line)"/><line x1="'+l+'" y1="10" x2="'+l+'" y2="'+b+'" style="stroke:var(--line)"/>';
          c+='<text class="lbl" x="'+(cw-142)+'" y="'+(ch-4)+'">'+LernApp.t('Richtung 0° bis 180° →','Direction 0° to 180° →')+'</text><text class="lbl" x="2" y="10">'+LernApp.t('Varianz','Variance')+'</text>';
          c+='<path d="'+path+'" style="fill:none;stroke:var(--accent);stroke-width:2"/>';
          c+=bv/lo<1.1?'<text class="lbl" x="'+(cx(60))+'" y="'+(cy(bv)-6)+'">'+LernApp.t('überall gleich, kein Gipfel','equal everywhere, no peak')+'</text>'
            :dot(cx(best),cy(bv),'var(--warn)',4)+'<text class="lbl" x="'+Math.min(cx(best)+6,cw-120)+'" y="'+(cy(bv)+4)+'">'+LernApp.t('Gipfel = PC1','peak = PC1')+'</text>';
          $('rsCurve').innerHTML=c;
          const V=st===0?C1:C;   // stage 0 has the same component variances as the PCA scores
          $('rsV1').textContent=fmt(V[0],2);$('rsV2').textContent=fmt(V[1],2);$('rsP').textContent=fmt(V[0]/(V[0]+V[1])*100,0)+' %';
          $('rsMsg').textContent=MSG[st];
          $('rsStage').querySelectorAll('button').forEach(bt=>{const on=+bt.dataset.v===st;bt.className=on?'pri':'';bt.setAttribute('aria-pressed',on)})}
        $('rsStage').addEventListener('click',e=>{const bt=e.target.closest('button');if(bt)draw(+bt.dataset.v)});draw(0)})();
      // Demo 6: PCA, t-SNE and UMAP on data of different difficulty, with adjustable number of features
      (function(){
        const N=300,DMAX=50;
        const MSG=[LernApp.t('Einfach: drei weit getrennte Gruppen. Alle drei Verfahren zeigen sie, egal wie viele Dimensionen. Bei so einfachen Daten reicht PCA.','Easy: three widely separated groups. All three methods show them, no matter how many dimensions. For data this simple, PCA is enough.'),
          LernApp.t('Mittel: sechs Gruppen, je zwei liegen nah beieinander. Die Struktur braucht 4 Richtungen. Mit 2 oder 3 Dimensionen fehlt eine davon, und die Paare liegen schon im Original übereinander. Ab 4 Dimensionen trennen t-SNE und UMAP alle sechs Gruppen. PCA zeigt nur 2 Richtungen und legt die Paare übereinander.','Medium: six groups, two at a time lie close together. The structure needs 4 directions. With 2 or 3 dimensions one of them is missing, and the pairs already overlap in the original. From 4 dimensions on, t-SNE and UMAP separate all six groups. PCA shows only 2 directions and puts the pairs on top of each other.'),
          LernApp.t('Schwer: eine aufgerollte Fläche (Swiss Roll), die Farbe ist die Position entlang der Rolle. Bei 2 Dimensionen ist es eine flache Spirale. Ab 3 Dimensionen schaut PCA von der Seite auf die Rolle: Die Lagen liegen übereinander, die Farben mischen sich. t-SNE und UMAP folgen den Nachbarn entlang der Fläche und halten die Farben in ihrer Reihenfolge, wickeln die Rolle aber nicht immer sauber ab.','Hard: a rolled-up surface (Swiss Roll); the colour is the position along the roll. With 2 dimensions it is a flat spiral. From 3 dimensions on, PCA looks at the roll from the side: the layers lie on top of each other and the colours mix. t-SNE and UMAP follow the neighbours along the surface and keep the colours in order, but do not always unroll the roll cleanly.'),
          LernApp.t('Keine Struktur: reines Rauschen, die Farben sind zufällig verteilt. Es gibt nichts zu finden. Trotzdem zeichnen t-SNE (kleine Perplexity) und UMAP (wenige Nachbarn) oft Grüppchen. Nicht jedes Muster in einer solchen Karte ist echt.','No structure: pure noise, the colours are randomly distributed. There is nothing to find. Even so, t-SNE (small Perplexity) and UMAP (few neighbours) often draw little clusters. Not every pattern in such a map is real.')];
        // Low-dimensional structure; lab is the true group and is never used by PCA or t-SNE
        function latent(ds,D,r){const Z=[],lab=[];
          for(let i=0;i<N;i++){
            if(ds===0){const g=i%3,a=g*2*Math.PI/3;Z.push([4*Math.cos(a)+0.6*gauss(r),4*Math.sin(a)+0.6*gauss(r)]);lab.push(g)}
            else if(ds===1){const g=i%6,p=Math.floor(g/2),a=p*2*Math.PI/3,s=g%2?1:-1;
              Z.push([4.5*Math.cos(a)+0.5*gauss(r),4.5*Math.sin(a)+0.5*gauss(r),(p===0?s:0)*1.1+0.5*gauss(r),(p>0?s*(p===1?1:-1):0)*1.1+0.5*gauss(r)]);lab.push(g)}
            else if(ds===2){const u=r(),t=1.5*Math.PI*(1+2*u);lab.push(Math.min(5,Math.floor(u*6)));
              Z.push(D<3?[0.4*t*Math.cos(t),0.4*t*Math.sin(t)]:[0.4*t*Math.cos(t),0.4*t*Math.sin(t),12*(r()-0.5)])}
            else{Z.push([]);lab.push(Math.floor(r()*3))}}
          return{Z:Z,lab:lab}}
        // Spread the structure over all features with random orthonormal directions, then add noise in every feature
        function makeData(ds,D){const r=mulberry32(31+ds),L=latent(ds,D,r),k=Math.min(L.Z[0].length,D),Q=[];
          for(let j=0;j<k;j++){let q=[];for(let d=0;d<D;d++)q.push(gauss(r));
            Q.forEach(p=>{const c=p.reduce((s,v,d)=>s+v*q[d],0);q=q.map((v,d)=>v-c*p[d])});
            const n=Math.sqrt(q.reduce((s,v)=>s+v*v,0));Q.push(q.map(v=>v/n))}
          const sd=ds===3?1:0.35,rn=mulberry32(77+ds);
          const X=L.Z.map(z=>{const x=new Array(D).fill(0);for(let j=0;j<k;j++)for(let d=0;d<D;d++)x[d]+=z[j]*Q[j][d];
            for(let d=0;d<DMAX;d++){const e=gauss(rn);if(d<D)x[d]+=sd*e}return x});
          return{X:X,lab:L.lab}}
        function dist2(X){const n=X.length,M=new Float64Array(n*n);
          for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){let s=0;for(let d=0;d<X[i].length;d++){const v=X[i][d]-X[j][d];s+=v*v}M[i*n+j]=M[j*n+i]=s}return M}
        function pca2(X){const n=X.length,D=X[0].length,m=new Array(D).fill(0);X.forEach(x=>x.forEach((v,d)=>m[d]+=v/n));
          const C=X.map(x=>x.map((v,d)=>v-m[d])),S=[];for(let a=0;a<D;a++){S.push([]);for(let b=0;b<D;b++){let s=0;C.forEach(c=>s+=c[a]*c[b]);S[a].push(s/n)}}
          const V=[];for(let k=0;k<2;k++){let v=S.map((_,d)=>Math.cos(d+k));   // power iteration, second vector orthogonal to the first
            for(let it=0;it<200;it++){let w=S.map(row=>row.reduce((s,x,d)=>s+x*v[d],0));V.forEach(p=>{const c=p.reduce((s,x,d)=>s+x*w[d],0);w=w.map((x,d)=>x-c*p[d])});
              const nn=Math.sqrt(w.reduce((s,x)=>s+x*x,0))||1;v=w.map(x=>x/nn)}V.push(v)}
          return C.map(c=>V.map(v=>c.reduce((s,x,d)=>s+x*v[d],0)))}
        // Share of the 10 nearest neighbours that belong to the same group
        function same(M,lab){const n=lab.length;let s=0;
          for(let i=0;i<n;i++){const o=[];for(let j=0;j<n;j++)if(j!==i)o.push(j);o.sort((a,b)=>M[i*n+a]-M[i*n+b]);for(let k=0;k<10;k++)if(lab[o[k]]===lab[i])s++}
          return s/(n*10)}
        // Exact t-SNE (as in tsne.js): P calibrated to the perplexity, gains, momentum, early exaggeration
        function tsneInit(Dh,perp,seed){const n=N,P=new Float64Array(n*n),H=Math.log(perp),row=new Float64Array(n);
          for(let i=0;i<n;i++){let lo=-Infinity,hi=Infinity,beta=1;
            for(let t=0;t<50;t++){let s=0;for(let j=0;j<n;j++){row[j]=j===i?0:Math.exp(-Dh[i*n+j]*beta);s+=row[j]}
              let h=0;for(let j=0;j<n;j++){const p=s?row[j]/s:0;row[j]=p;if(p>1e-7)h-=p*Math.log(p)}
              if(Math.abs(h-H)<1e-5)break;if(h>H){lo=beta;beta=hi===Infinity?beta*2:(beta+hi)/2}else{hi=beta;beta=lo===-Infinity?beta/2:(beta+lo)/2}}
            for(let j=0;j<n;j++)P[i*n+j]=row[j]}
          for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const v=Math.max((P[i*n+j]+P[j*n+i])/(2*n),1e-100);P[i*n+j]=P[j*n+i]=v}
          const r=mulberry32(seed),Y=[],st=[],g=[];for(let i=0;i<n;i++){Y.push([1e-4*gauss(r),1e-4*gauss(r)]);st.push([0,0]);g.push([1,1])}
          return{P:P,Y:Y,st:st,g:g,it:0,W:new Float64Array(n*n)}}
        function tsneStep(T){const n=N,Y=T.Y,W=T.W,ex=T.it<100?4:1,mom=T.it<250?0.5:0.8;let Z=0;
          for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const dx=Y[i][0]-Y[j][0],dy=Y[i][1]-Y[j][1],q=1/(1+dx*dx+dy*dy);W[i*n+j]=W[j*n+i]=q;Z+=2*q}
          for(let i=0;i<n;i++){let gx=0,gy=0;
            for(let j=0;j<n;j++){if(j===i)continue;const q=W[i*n+j],f=4*(ex*T.P[i*n+j]-q/Z)*q;gx+=f*(Y[i][0]-Y[j][0]);gy+=f*(Y[i][1]-Y[j][1])}
            [gx,gy].forEach((gd,d)=>{const s=T.st[i][d];let ga=Math.sign(gd)===Math.sign(s)?T.g[i][d]*0.8:T.g[i][d]+0.2;if(ga<0.01)ga=0.01;
              T.g[i][d]=ga;T.st[i][d]=mom*s-10*ga*gd})}
          const my=[0,0];for(let i=0;i<n;i++){Y[i][0]+=T.st[i][0];Y[i][1]+=T.st[i][1];my[0]+=Y[i][0]/n;my[1]+=Y[i][1]/n}
          Y.forEach(y=>{y[0]-=my[0];y[1]-=my[1]});T.it++}
        // Simplified UMAP (as in umap-learn): fuzzy kNN graph, then attract along edges and push random pairs apart (min_dist 0.1)
        function umapInit(Dh,k,Y0,seed){const n=N,E=[],w=new Map(),A=1.577,B=0.895;
          for(let i=0;i<n;i++){const o=[];for(let j=0;j<n;j++)if(j!==i)o.push(j);o.sort((a,b)=>Dh[i*n+a]-Dh[i*n+b]);
            const nb=o.slice(0,k),d=nb.map(j=>Math.sqrt(Dh[i*n+j])),rho=d[0],target=Math.log2(k);let lo=0,hi=Infinity,sig=1;
            for(let t=0;t<64;t++){let s=0;d.forEach(x=>{s+=Math.exp(-Math.max(0,x-rho)/sig)});
              if(Math.abs(s-target)<1e-5)break;if(s>target){hi=sig;sig=(lo+hi)/2}else{lo=sig;sig=hi===Infinity?sig*2:(lo+hi)/2}}
            nb.forEach((j,m)=>{const key=Math.min(i,j)*n+Math.max(i,j),v=Math.exp(-Math.max(0,d[m]-rho)/sig),old=w.get(key);
              w.set(key,old===undefined?v:old+v-old*v)})}   // fuzzy union of both directions
          let wmax=0;w.forEach(v=>{wmax=Math.max(wmax,v)});w.forEach((v,key)=>E.push([Math.floor(key/n),key%n,v/wmax]));
          let x0=Infinity,x1=-Infinity;Y0.forEach(p=>{x0=Math.min(x0,p[0],p[1]);x1=Math.max(x1,p[0],p[1])});
          const sc=20/Math.max(x1-x0,1e-9);   // start from the PCA map, scaled to about 20 units
          return{E:E,Y:Y0.map(p=>[p[0]*sc,p[1]*sc]),r:mulberry32(seed),it:0,A:A,B:B}}
        function umapStep(U,epochs){const Y=U.Y,A=U.A,B=U.B,clip=v=>Math.max(-4,Math.min(4,v));
          const alpha=1-U.it/epochs;
          U.E.forEach(e=>{if(U.r()>e[2])return;const i=e[0],j=e[1];
            let dx=Y[i][0]-Y[j][0],dy=Y[i][1]-Y[j][1],d2=dx*dx+dy*dy;
            if(d2>0){const c=-2*A*B*Math.pow(d2,B-1)/(1+A*Math.pow(d2,B)),gx=clip(c*dx)*alpha,gy=clip(c*dy)*alpha;
              Y[i][0]+=gx;Y[i][1]+=gy;Y[j][0]-=gx;Y[j][1]-=gy}
            for(let s=0;s<5;s++){const m=Math.floor(U.r()*N);if(m===i)continue;
              dx=Y[i][0]-Y[m][0];dy=Y[i][1]-Y[m][1];d2=dx*dx+dy*dy;
              const c=2*B/((0.001+d2)*(1+A*Math.pow(d2,B)));
              Y[i][0]+=(d2>0?clip(c*dx):4)*alpha;Y[i][1]+=(d2>0?clip(c*dy):4)*alpha}});
          U.it++}
        function plot(id,Y,lab){let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
          Y.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
          const sc=216/Math.max(x1-x0,y1-y0,1e-9),ox=120-sc*(x0+x1)/2,oy=120+sc*(y0+y1)/2;let s='';
          Y.forEach((p,i)=>{s+='<circle cx="'+(ox+sc*p[0]).toFixed(1)+'" cy="'+(oy-sc*p[1]).toFixed(1)+'" r="2.6" style="fill:'+COL[lab[i]]+';stroke:var(--fg);stroke-width:.3"/>'});
          $(id).innerHTML=s}
        const pct=v=>fmt(v*100,0)+' %';
        let ds=0,data=null,Dh=null,P2=null,runT=0,runU=0,seed=1;
        function startT(){const perp=+$('tsP').value;$('tsPO').textContent=perp;$('tsNT').textContent='…';
          const T=tsneInit(Dh,perp,seed),my=++runT;
          (function frame(){if(my!==runT)return;for(let k=0;k<10;k++)tsneStep(T);plot('tsTsne',T.Y,data.lab);
            if(T.it<500)requestAnimationFrame(frame);else $('tsNT').textContent=pct(same(dist2(T.Y),data.lab))})()}
        function startU(){const k=+$('tsK').value;$('tsKO').textContent=k;$('tsNU').textContent='…';
          const U=umapInit(Dh,k,P2,seed),my=++runU;
          (function frame(){if(my!==runU)return;for(let e=0;e<10;e++)umapStep(U,300);plot('tsUmap',U.Y,data.lab);
            if(U.it<300)requestAnimationFrame(frame);else $('tsNU').textContent=pct(same(dist2(U.Y),data.lab))})()}
        function start(){const D=+$('tsD').value;$('tsDO').textContent=D;
          data=makeData(ds,D);Dh=dist2(data.X);P2=pca2(data.X);plot('tsPca',P2,data.lab);
          $('tsNO').textContent=pct(same(Dh,data.lab));$('tsNP').textContent=pct(same(dist2(P2),data.lab));startT();startU()}
        function setDs(v){ds=v;$('tsMsg').textContent=MSG[v];
          $('tsData').querySelectorAll('button').forEach(bt=>{const on=+bt.dataset.v===v;bt.className=on?'pri':'';bt.setAttribute('aria-pressed',on)});start()}
        $('tsData').addEventListener('click',e=>{const bt=e.target.closest('button');if(bt)setDs(+bt.dataset.v)});
        $('tsD').addEventListener('input',start);$('tsP').addEventListener('input',startT);$('tsK').addEventListener('input',startU);
        $('tsRun').addEventListener('click',()=>{seed++;startT();startU()});
        setDs(0)})();
    },
  });
})();
