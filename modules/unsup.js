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
    summary: `Clustering, Anomalien, PCA und t-SNE`,
    html: `  <p>Bisher hatten alle Daten eine Antwort (Preis, Klasse). Beim <b>Unsupervised Learning</b> gibt es keine. Das Modell soll selbst Struktur in den Daten finden. Zwei Hauptaufgaben:</p>
  <div class="grid2">
    <div><h4>Clustering</h4><p>Ähnliche Datenpunkte in Gruppen einteilen. Beispiel: Kundensegmente, Dokumentgruppen.</p></div>
    <div><h4>Dimensionsreduktion</h4><p>Viele Merkmale auf wenige zusammenfassen, zum Beispiel um Daten in 2D zu zeichnen.</p></div>
  </div>
  <p>Der Tag arbeitet mit einem Lego-Datensatz (von der Spielwarenseite gescrapt). Es gibt kein «richtig», nur nützlich oder nicht. Darum gehört die <b>Interpretation</b> zum Ergebnis dazu.</p>

  <h3>1 · Clustering und Anomalien</h3>
  <p>Ziel: Punkte im gleichen Cluster sind einander ähnlicher als Punkten in anderen Clustern. «Ähnlich» wird über einen <b>Abstand</b> gemessen:</p>
  <ul>
    <li><b>Euklidische Distanz</b>: die Luftlinie, <code>√(Σ (a<sub>i</sub> − b<sub>i</sub>)²)</code>. Für Zahlen.</li>
    <li><b>Simple Matching</b>: zählt, bei wie vielen Kategorien zwei Punkte <i>nicht</i> übereinstimmen. Für Kategorien.</li>
    <li><b>Dynamic Time Warping</b>: Abstand zwischen Zeitreihen, die leicht verschoben oder gedehnt sind.</li>
  </ul>
  <p><b>Anomalieerkennung</b> ist die Kehrseite: Nach dem Clustering gelten Punkte, die zu keinem Cluster gut passen oder weit von ihrem Zentrum liegen, als auffällig (z. B. ein Betrugsverdacht).</p>

  <h3>2 · k-Means</h3>
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

  <h3>3 · Wie viele Cluster?</h3>
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

  <h3>4 · Hierarchisches Clustering</h3>
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

  <h3>5 · Cluster verstehen und erklären</h3>
  <p>Die Cluster entstehen auf skalierten Daten, erklären willst du sie aber in den Originaleinheiten. Darum die Clusternummer wieder an die ursprüngliche Tabelle hängen und beschreiben:</p>
  <pre><code>df["cluster"] = labels
df.groupby("cluster").agg(["mean", "median", "count"])   # Profil je Cluster
sns.boxplot(data=df, x="cluster", y="preis")             # Verteilung je Cluster</code></pre>
  <p>Frage dich: Wodurch unterscheiden sich die Gruppen? Welches Merkmal trennt am besten? Kannst du jedem Cluster einen verständlichen Namen geben («günstige Sets für Kinder»)?</p>

  <h3>6 · Dimensionsreduktion</h3>
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

  <h3>7 · PCA (Hauptkomponentenanalyse)</h3>
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
  <p>Mit <code>explained_variance_ratio_</code> siehst du, wie viel Information 2 Komponenten behalten. Die Komponenten sind Mischungen der Originalmerkmale und damit schwerer zu deuten.</p>

  <h3>8 · t-SNE</h3>
  <p>t-SNE ist ein Verfahren fürs <b>Zeichnen</b> in 2D. Es versucht, Nachbarschaften zu erhalten: Punkte, die im hohen Raum nah beieinander liegen, sollen auch im 2D-Bild nah liegen. Dazu werden Ähnlichkeiten als Wahrscheinlichkeiten ausgedrückt und die 2D-Punkte per Gradient Descent so verschoben, dass sie dazu passen.</p>
  <ul>
    <li><b>Perplexity</b>: grob die Zahl der Nachbarn, auf die jeder Punkt achtet (typisch 5 bis 50). Der wichtigste Regler, probiere mehrere Werte.</li>
    <li>Weitere Einstellungen: Anzahl Iterationen, Lernrate.</li>
  </ul>
  <div class="falle"><b>Falle</b><p>In einem t-SNE-Bild sind <b>Abstände zwischen Gruppen und Gruppengrössen nicht aussagekräftig</b>, nur «wer ist mit wem benachbart». Es ist ein Bild zum Erkunden, keine Basis für Modelle, und ein anderer Zufallsstart liefert ein anderes Bild.</p></div>
  <pre><code>from sklearn.manifold import TSNE
Z = TSNE(n_components=2, perplexity=30, random_state=0).fit_transform(X_s)
plt.scatter(Z[:, 0], Z[:, 1], c=labels)</code></pre>
  <div class="tablewrap"><table>
    <tr><th></th><th>PCA</th><th>t-SNE</th></tr>
    <tr><td>Art</td><td>linear, Projektion</td><td>nicht linear, Nachbarschaften</td></tr>
    <tr><td>Tempo</td><td>schnell</td><td>langsam</td></tr>
    <tr><td>Ergebnis</td><td>immer gleich, auf neue Daten anwendbar</td><td>zufallsabhängig, nur für die gegebenen Daten</td></tr>
    <tr><td>Nutzen</td><td>Vorverarbeitung, Rauschen, 2D-Bild</td><td>2D-Bild von Gruppen</td></tr>
  </table></div>

  <h3>9 · Deep Clustering (Ausblick)</h3>
  <p>Klassisches Clustering wird bei sehr vielen Merkmalen (Bilder, Text) schlecht. Beim Deep Clustering lernt ein <b>Autoencoder</b> (ein neuronales Netz, das seine Eingabe durch einen engen Flaschenhals hindurch rekonstruiert) eine kompakte Darstellung. In dieser «latenten» Darstellung wird dann geclustert. Fortgeschrittene Varianten trainieren Darstellung und Clustering gemeinsam. Du musst das hier nur einordnen können.</p>

  <h3>Alles zusammen</h3>
  <div class="steps">
    <div class="st"><b>1 · Skalieren</b><span>StandardScaler</span></div><div class="ar">→</div>
    <div class="st"><b>2 · Clustern</b><span>k-Means oder hierarchisch, k wählen</span></div><div class="ar">→</div>
    <div class="st"><b>3 · Reduzieren</b><span>PCA oder t-SNE zum Zeichnen</span></div><div class="ar">→</div>
    <div class="st"><b>4 · Beschreiben</b><span>Profil je Cluster, benennen</span></div>
  </div>
  <p class="note">Notebooks des Dozenten (Kursordner <code>07 - UNSUPERVISED-LEARNING/code</code>): <code>clustering_k_means</code>, <code>clustering_k_means optimizing</code>, <code>hierarchical_clustering</code>, <code>dimension_reduction_pca</code>, <code>dimension_reduction_tsne</code>, jeweils mit <code>_exercise</code>-Version. Daten: <code>lego_daten_one_hot_encoded_cleaned.csv</code>.</p>
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
    ],
    init() {
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
          let s='<text class="lbl" x="'+(W-110)+'" y="'+(H-3)+'">Merkmal A (gross) →</text><text class="lbl" x="3" y="10">↑ Merkmal B (klein)</text>';
          raw.forEach((p,i)=>{s+=dot(sx(p),sy(p),COL[res.lab[i]],3.5)});
          $('scSvg').innerHTML=s;$('scRaw').className=scaled?'':'pri';$('scStd').className=scaled?'pri':'';
          $('scMsg').textContent=(scaled?'Mit Skalierung: ':'Ohne Skalierung: ')+Math.round(agree*100)+' % der Punkte liegen im «richtigen» Cluster. '+(scaled?'Beide Merkmale zählen gleich, die Gruppen aus B werden gefunden.':'Merkmal A hat Zahlen bis 1000, B nur bis 1: Der Algorithmus schneidet nach A und übersieht die echten Gruppen.')}
        $('scRaw').addEventListener('click',()=>show(false));$('scStd').addEventListener('click',()=>show(true));show(false)})();

      // Demo 3: elbow and silhouette
      (function(){
        const pts=blobs(mulberry32(5)),ks=[1,2,3,4,5,6,7,8],ws=[],ss=[];
        ks.forEach(k=>{const res=kmeans(pts,k,mulberry32(100+k),8);ws.push(res.w);ss.push(k>1?silhouette(pts,res.lab,k):null)});
        const W=320,H=200,PX=34,sx=i=>PX+i*(W-PX-14)/7,wy=v=>H-22-(v/ws[0])*(H-40),sy=v=>H-22-v*(H-40);
        let s='<line class="ax" x1="'+PX+'" y1="'+(H-22)+'" x2="'+(W-10)+'" y2="'+(H-22)+'"/>';
        ks.forEach((k,i)=>{s+='<text class="lbl" x="'+(sx(i)-3)+'" y="'+(H-8)+'">'+k+'</text>'});
        s+='<text class="lbl" x="'+(PX+80)+'" y="'+(H-0)+'">Anzahl Cluster k</text>';
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
    },
  });
})();
