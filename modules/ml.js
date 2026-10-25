/* Module: Supervised Learning: Regression. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  function solve(A,b){const n=b.length;const M=A.map((r,i)=>r.concat([b[i]]));
    for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[p][i]))p=r;[M[i],M[p]]=[M[p],M[i]];
      for(let r=i+1;r<n;r++){const f=M[r][i]/M[i][i];for(let c=i;c<=n;c++)M[r][c]-=f*M[i][c]}}
    const x=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let c=i+1;c<n;c++)s-=M[i][c]*x[c];x[i]=s/M[i][i]}return x}
  function polyFit(xs,ys,deg){const n=deg+1;const A=[],b=[];
    for(let i=0;i<n;i++){A.push([]);let sb=0;for(let j=0;j<n;j++){let s=0;for(const x of xs)s+=Math.pow(x,i+j);A[i].push(s+(i===j?1e-9:0))}
      for(let k=0;k<xs.length;k++)sb+=ys[k]*Math.pow(xs[k],i);b.push(sb)}
    return solve(A,b)}
  function polyEval(c,x){let s=0;for(let i=0;i<c.length;i++)s+=c[i]*Math.pow(x,i);return s}
  function mse(c,xs,ys){let s=0;for(let i=0;i<xs.length;i++){const d=polyEval(c,xs[i])-ys[i];s+=d*d}return s/xs.length}
  function lineFit(xs,ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;
    let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2}const a=sxy/sxx;return{a:a,b:my-a*mx,my:my}}

  LernApp.register({
    id: 'ml',
    order: 70,
    nav: 'Supervised ML',
    title: `Supervised Learning: Regression`,
    kicker: `Modul 2 · Supervised Learning, Tag 1`,
    summary: `Gradient Descent bis Hyperparameter`,
    html: `  <p>Beim Supervised Learning gibst du dem Modell Beispiele mit bekannter Antwort. Bei der <b>Regression</b> ist die Antwort eine Zahl (z. B. Hauspreis). Das Modell soll lernen, daraus für <i>neue</i> Fälle gut zu raten. Dabei gilt: Die Qualität der Daten begrenzt die Qualität des Modells (<i>garbage in, garbage out</i>), und das gilt für die Merkmale genauso wie für die Labels.</p>

  <p class="note">Voraussetzung: Das Kapitel «Mathe-Grundlagen» erklärt, was eine Ableitung und der Gradient sind. Hier geht es direkt los mit dem Lernen.</p>

  <h3>1 · Gradient Descent: so «lernt» ein Modell</h3>
  <p>Stell dir einen Nebel auf einem Berg vor. Du willst ins Tal, siehst aber nur, wie steil der Boden unter deinen Füssen ist. Also gehst du immer ein Stück bergab. Genau das macht der Algorithmus.</p>
  <pre><code>x_neu = x_alt - lernrate * steigung_bei(x_alt)</code></pre>
  <p>Die <b>Steigung</b> (die Ableitung, siehe Kapitel «Mathe-Grundlagen») sagt dir die Richtung. Die <b>Lernrate</b> bestimmt die Schrittgrösse. Zu klein: du kommst kaum vorwärts. Zu gross: du springst über das Tal hinaus. Hier ist die Funktion <code>y = x²</code>, das Tal liegt bei 0:</p>

  <div class="demo" id="gdDemo">
    <div class="tag">Demo</div><h4>Gradient Descent auf y = x²</h4>
    <svg class="plot" id="gdSvg" viewBox="0 0 320 200" role="img" aria-label="Parabel mit Gradient-Descent-Schritten"></svg>
    <div class="ctl"><label for="gdLr">Lernrate</label><input type="range" id="gdLr" min="0.05" max="1.1" step="0.05" value="0.2"><output id="gdLrO"></output></div>
    <div class="btnrow"><button class="pri" id="gdStep">1 Schritt</button><button id="gdTen">10 Schritte</button><button id="gdReset">Zurücksetzen</button></div>
    <div class="stats"><span>Schritt <b id="gdN">0</b></span><span>x = <b id="gdX"></b></span><span>y = <b id="gdY"></b></span></div>
    <p class="hint" id="gdMsg"></p>
  </div>
  <p>Probiere 0.1, 0.5, 1.0 und 1.05. Bei 1.0 springt er nur hin und her, darüber entfernt er sich immer weiter. Bei echten Problemen gibt es zusätzlich viele Täler (lokale Minima). Eine Strategie ist, die Lernrate mit der Zeit zu verkleinern.</p>

  <h3>2 · Lineare Regression: die beste Gerade</h3>
  <p>Gesucht ist die Gerade <code>y = a·x + b</code>, die möglichst nahe an allen Punkten liegt. Wie nah, misst die <b>Fehlerfunktion</b> (Loss). Die Abweichung eines Punktes von der Geraden heisst <b>Residuum</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Mass</th><th>Bedeutung</th></tr>
    <tr><td><b>MAE</b></td><td>mittlerer absoluter Fehler: Durchschnitt der Beträge der Residuen</td></tr>
    <tr><td><b>MSE</b></td><td>mittlerer quadrierter Fehler: bestraft grosse Ausreisser viel stärker (RMSE = Wurzel daraus, wieder in der Einheit von y)</td></tr>
    <tr><td><b>R²</b></td><td>wie viel Prozent des Fehlers die Regression gegenüber «immer den Mittelwert raten» beseitigt. 0 = nicht besser als Mittelwert, 1 = perfekt</td></tr>
  </table></div>
  <div class="demo" id="lrDemo">
    <div class="tag">Demo</div><h4>Gerade selbst anpassen</h4>
    <svg class="plot" id="lrSvg" viewBox="0 0 320 220" role="img" aria-label="Punkte mit Regressionsgerade und roten Residuen"></svg>
    <div class="ctl"><label for="lrA">Steigung</label><input type="range" id="lrA" min="-1" max="2" step="0.05" value="0"><output id="lrAO"></output></div>
    <div class="ctl"><label for="lrB">Achsenabschnitt</label><input type="range" id="lrB" min="-2" max="8" step="0.1" value="5"><output id="lrBO"></output></div>
    <div class="btnrow"><button class="pri" id="lrBest">Beste Gerade (Least Squares)</button><button id="lrMean">Nur Mittelwert</button></div>
    <div class="stats"><span>MAE <b id="lrMae"></b></span><span>MSE <b id="lrMse"></b></span><span>R² <b id="lrR2"></b></span></div>
    <p class="hint">Die roten Striche sind die Residuen. Wenn du nur den Mittelwert nimmst, ist R² genau 0. Die beste Gerade minimiert den quadrierten Fehler.</p>
  </div>
  <p>Gradient Descent ist der Weg, wie ein Computer diese Werte findet: mit zufälligen Koeffizienten starten, Fehler messen, Koeffizienten leicht ändern, wiederholen, bis es nicht mehr besser wird. <b>Mehrere Merkmale</b> sind einfach mehr Koeffizienten. Für Kurven nimmt man <b>polynomiale Regression</b> (x, x², x³ als Merkmale).</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Beispiel: 10 Wohnungen, mehrere Merkmale</h4>
  <p>Der Preis ist das Ziel <code>y</code>, die Merkmale sind <code>qm</code>, <code>Zimmer</code> und <code>Lage</code> (1 = schlecht bis 5 = top; als Zahl kodiert). Zeichnen kannst du nur zwei Achsen: Hier ist x = qm, y = Preis, die <b>Punktgrösse</b> zeigt die Zimmer und die <b>Farbstärke</b> die Lage.</p>
  <div class="demo" id="whDemo">
    <div class="tag">Demo</div><h4>10 Wohnungen: ein Merkmal oder drei</h4>
    <svg class="plot" id="whSvg" viewBox="0 0 320 230" role="img" aria-label="Streudiagramm qm gegen Preis mit Regressionsgerade oder Vorhersagen und Residuen"></svg>
    <div class="btnrow"><button class="pri" id="whOne">Nur qm</button><button id="whAll">qm, Zimmer, Lage</button></div>
    <div class="stats"><span>R² <b id="whR2"></b></span><span>Fehler (MAE) <b id="whMae"></b> CHF</span></div>
    <div class="tablewrap"><table id="whTab"></table></div>
    <p class="hint">Mit einem Merkmal ist das eine Gerade in 2D. Mit drei Merkmalen gibt es keine Gerade mehr, die du zeichnen kannst: Das Modell sagt für jede Wohnung einen Preis voraus (leere Kreise), die roten Striche sind die Abweichungen. Die Tabelle zeigt die Gewichte nach dem StandardScaler: Je grösser der Betrag, desto stärker treibt das Merkmal den Preis. Achtung: R² ist hier auf den Trainingsdaten gemessen, bei 10 Wohnungen und 4 Zahlen im Modell ist das nur eine Demo.</p>
  </div>

  <p>Nimm zwei Merkmale (qm und Zimmer), dann gehört zu jeder Wohnung ein Punkt in einem <b>3D-Raum</b>: eine Achse pro Merkmal, die dritte Achse ist der Preis. Das Modell ist keine Gerade mehr, sondern eine <b>Ebene</b>.</p>
  <div class="demo" id="r3Demo">
    <div class="tag">Demo</div><h4>3D-Raum: qm, Zimmer, Preis</h4>
    <svg class="plot" id="r3Svg" viewBox="0 0 320 316" role="img" aria-label="3D-Ansicht: 10 Wohnungen als Punkte und die Regressionsebene" style="touch-action:none;cursor:grab;max-width:430px;margin:0 auto;position:sticky;top:8px;z-index:1"></svg>
    <div class="ctl"><label for="r3Az">Drehen</label><input type="range" id="r3Az" min="-180" max="180" step="1" value="-35"><output id="r3AzO"></output></div>
    <div class="ctl"><label for="r3El">Kippen</label><input type="range" id="r3El" min="0" max="80" step="1" value="25"><output id="r3ElO"></output></div>
    <div class="btnrow"><button id="r3Top">Ansicht qm / Preis</button><button id="r3Side">Ansicht Zimmer / Preis</button><button id="r3Reset">Zurücksetzen</button></div>
    <div class="stats"><span>R² (qm + Zimmer) <b id="r3R2"></b></span></div>
    <p class="hint">Du kannst auch im Bild ziehen. Gefüllte Punkte sind die echten Preise, die rote Linie ist der Abstand zur Ebene. Die Knöpfe zeigen dir die flachen 2D-Ansichten: von vorn siehst du qm gegen Preis wie in der Grafik oben, von der Seite Zimmer gegen Preis. Der 3D-Raum enthält beides gleichzeitig. Lage fehlt hier, weil eine 4. Achse nicht mehr zeichenbar wäre.</p>
  </div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Was <code>fit()</code> macht: die Gewichte lernen</h4>
  <p>Beim Fitten startet das Modell mit Gewichten bei 0, misst den Fehler, schiebt jedes Gewicht ein Stück in die Richtung, die den Fehler verkleinert (der Gradient aus dem Mathe-Kapitel), und wiederholt das. Hier siehst du es an den 10 Wohnungen mit den <b>skalierten</b> Merkmalen. Der Preis ist in 1000 CHF.</p>
  <div class="demo" id="ftDemo">
    <div class="tag">Demo</div><h4>Gewichte lernen, Schritt für Schritt</h4>
    <svg class="plot" id="ftSvg" viewBox="0 0 320 270" role="img" aria-label="Balken der drei Gewichte und Fehlerverlauf über die Lernschritte"></svg>
    <div class="ctl"><label for="ftLr">Schrittgrösse</label><input type="range" id="ftLr" min="0.02" max="0.6" step="0.01" value="0.1"><output id="ftLrO"></output></div>
    <div class="btnrow"><button class="pri" id="ftStep">1 Schritt</button><button id="ftRun">Lernen (Animation)</button><button id="ftReset">Zurücksetzen</button></div>
    <div class="stats"><span>Schritt <b id="ftN"></b></span><span>Fehler (MSE) <b id="ftMse"></b></span></div>
    <p class="hint" id="ftEq"></p>
    <p class="hint">Balken: aktuelle Gewichte. Die senkrechten Striche sind die Werte, die die exakte Lösung (<code>LinearRegression</code>) findet. <b>Gewichtung heisst also:</b> Jeder Schritt verschiebt ein Gewicht entgegen seinem Gradienten, bis der Fehler nicht mehr sinkt. Zu grosse Schritte schiessen über das Ziel (der Fehler explodiert), zu kleine brauchen sehr lange. qm und Zimmer hängen zusammen, darum finden sie ihre Werte langsamer.</p>
  </div>

  <h3>3 · Daten vorbereiten</h3>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Fehlende Werte</h4>
  <ul>
    <li><b>Löschen</b>: einfach, aber du verlierst Daten.</li>
    <li><b>Auffüllen (Imputation)</b>: Mittelwert/Median (schnell, ignoriert Zusammenhänge), Modus oder Konstante (auch für Kategorien, kann verzerren), k-nächste-Nachbarn (genauer, teuer), Regression oder Interpolation.</li>
  </ul>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Skalieren</h4>
  <p>Merkmale haben ganz verschiedene Grössenordnungen (Verbrauch 8 l/100km, Hubraum 3600 cc). Ohne Skalieren dominieren die grossen Zahlen. Darum bringt man alle auf eine vergleichbare Skala.</p>
  <div class="tablewrap"><table>
    <tr><th>Methode</th><th>Ergebnis</th></tr>
    <tr><td>Standard Scaling</td><td>Mittelwert 0, Standardabweichung 1 (Form der Verteilung bleibt)</td></tr>
    <tr><td>Min-Max Scaling</td><td>Werte zwischen 0 und 1</td></tr>
    <tr><td>Mean Normalization</td><td>Mittelwert 0, Werte zwischen -1 und 1</td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Kategorien in Zahlen</h4>
  <p>Wochentage nie einfach als 1, 2, 3 codieren: Das würde «Mittwoch ist grösser als Montag» behaupten. Stattdessen <b>One-Hot-Encoding</b>: pro Kategorie eine Spalte mit 0 oder 1.</p>
  <pre><code>from sklearn.preprocessing import StandardScaler
X = pd.DataFrame(StandardScaler().fit_transform(data), columns=data.columns)

data["einkommen_klasse"] = pd.cut(data["MedInc"], bins=[-1, 3, 6, 16],
                                  labels=["low", "medium", "high"])
data = pd.get_dummies(data, columns=["einkommen_klasse"])   # One-Hot</code></pre>
  <div class="falle"><b>Falle (Data Leakage)</b><p>Im Beispiel der Folien wird zur Vereinfachung <i>vor</i> dem Aufteilen skaliert. Sauber ist, den Scaler nur auf den Trainingsdaten zu lernen, denn auch der Scaler wird «trainiert»: Er lernt Mittelwert und Streuung. Fliessen Validierungs- oder Testdaten ein, sickert deren Information ins Modell (Data Leakage). Genau dafür gibt es <code>Pipeline</code> (siehe unten). Mehr zu Data Leakage kommt am Kurstag zur Klassifikation.</p></div>

  <h3>4 · Train, Validation, Test und Cross-Validation</h3>
  <p>Ein Modell, das auf seinen Trainingsdaten gut ist, kann trotzdem bei neuen Daten versagen. Wir wollen die Leistung auf <b>ungesehenen</b> Daten kennen (Generalisierung). Deshalb teilen wir die Daten zufällig auf, z. B. 60/20/20:</p>
  <div class="steps">
    <div class="st"><b>Training (60 %)</b><span>Modell lernt hier.</span></div>
    <div class="st"><b>Validation (20 %)</b><span>Modelle und Einstellungen vergleichen.</span></div>
    <div class="st"><b>Test (20 %)</b><span>Zum Schluss, nur ein einziges Mal.</span></div>
  </div>
  <p>Warum nicht gleich den Test benutzen? Weil du die Validation beim Feintunen oft ansiehst und sie dadurch indirekt mitlernt. Der Test ist die Prüfung, die du erst am Schluss schreibst. Danach trainierst du das beste Modell nochmals mit Training und Validation zusammen (mehr Daten helfen).</p>
  <p><b>Cross-Validation (k-Fold)</b>: Die Daten werden in k gleich grosse Teile geteilt. k-mal trainierst du auf k−1 Teilen und prüfst auf dem übrigen, dann bildest du den Durchschnitt. Das nutzt die Daten besser, kostet aber k-mal mehr Rechenzeit. Varianten: Stratified (gleiche Klassenanteile pro Teil) und Leave-One-Out.</p>
  <pre><code>from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

pipe = Pipeline([("scaler", StandardScaler()), ("model", LinearRegression())])
scores = cross_val_score(pipe, X, y, cv=10)   # 10 Folds
scores.mean(), scores.std()</code></pre>
  <div class="merk"><b>Merksatz</b><p>Pipeline = Schritte (Skalieren, Modell) werden zusammen behandelt, bei jedem Fold nur mit dessen Trainingsteil gelernt. Das verhindert Leakage und macht den Code sauber.</p></div>

  <h3>5 · Feature Selection</h3>
  <p>Mehr Merkmale sind nicht automatisch besser. Mit vielen Dimensionen werden Daten «dünn» und Modelle schwerer zu trainieren (<i>Curse of Dimensionality</i>). Überflüssige Merkmale erhöhen das Risiko von Overfitting und machen das Modell schwer erklärbar.</p>
  <ul>
    <li><b>Filter</b>: Merkmale nach Statistik oder Korrelation bewerten (z. B. <code>X.corr()</code>).</li>
    <li><b>Wrapper</b>: Mit einem Modell verschiedene Merkmalmengen ausprobieren.</li>
    <li><b>Embedded</b>: Die Auswahl steckt im Modell (Lasso, siehe unten).</li>
  </ul>
  <pre><code>import seaborn as sns
sns.heatmap(data.corr(), annot=True, cmap="Reds")</code></pre>
  <div class="falle"><b>Falle</b><p>Korrelation ist keine Ursache. Der Folienwitz mit Piraten und Erderwärmung zeigt es: Zwei Dinge können zusammen laufen, ohne dass das eine das andere verursacht.</p></div>

  <h3>6 · Bias und Variance: Under- und Overfitting</h3>
  <ul>
    <li><b>Underfitting (hoher Bias)</b>: Das Modell ist zu einfach, es verpasst das Muster. Schlecht auf Training <i>und</i> Test.</li>
    <li><b>Overfitting (hohe Variance)</b>: Das Modell lernt auch das Rauschen auswendig. Sehr gut auf Training, schlecht auf Test.</li>
  </ul>
  <p>Komplexere Modelle haben weniger Bias, aber mehr Variance. Gesucht ist der Mittelweg. Hier ein Polynom verschiedenen Grades, das Punkte einer Sinuskurve mit Rauschen anpasst:</p>

  <div class="demo" id="bvDemo">
    <div class="tag">Demo</div><h4>Modellkomplexität: Polynomgrad</h4>
    <svg class="plot" id="bvSvg" viewBox="0 0 320 220" role="img" aria-label="Datenpunkte, wahre Kurve und angepasstes Polynom"></svg>
    <div class="ctl"><label for="bvDeg">Grad</label><input type="range" id="bvDeg" min="1" max="9" step="1" value="1"><output id="bvDegO"></output></div>
    <div class="stats"><span>Trainingsfehler <b id="bvTr"></b></span><span>Testfehler <b id="bvTe"></b></span></div>
    <p class="hint" id="bvMsg"></p>
    <svg class="plot" id="bvErr" viewBox="0 0 320 150" role="img" aria-label="Trainings- und Testfehler je Polynomgrad" style="margin-top:12px"></svg>
    <p class="hint">Blau: Trainingsfehler. Orange: Testfehler (60 neue Punkte, die das Modell nie sah). Der Trainingsfehler sinkt immer weiter, der Testfehler hat sein Minimum in der Mitte. Der senkrechte Strich zeigt den gewählten Grad.</p>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Diagnose</th><th>Training</th><th>Test</th><th>Gegenmittel</th></tr>
    <tr><td>Underfitting</td><td>schlecht</td><td>schlecht (ähnlich)</td><td>mehr Merkmale, höherer Grad</td></tr>
    <tr><td>Overfitting</td><td>sehr gut</td><td>deutlich schlechter</td><td>weniger Merkmale, Regularisierung, mehr Daten</td></tr>
  </table></div>

  <h3>7 · Regularisierung</h3>
  <p>Regularisierung bremst Overfitting: Zur Fehlerfunktion kommt eine <b>Strafe für grosse Koeffizienten</b>. Die Stärke regelt ein Parameter (<code>alpha</code> bzw. λ). Grosse Koeffizienten sind das typische Zeichen eines Modells, das dem Rauschen nachrennt.</p>
  <div class="tablewrap"><table>
    <tr><th>Methode</th><th>Strafe</th><th>Wirkung</th></tr>
    <tr><td><b>Ridge</b> (L2)</td><td>Summe der quadrierten Koeffizienten</td><td>macht alle Koeffizienten kleiner; gut bei vielen korrelierten Merkmalen</td></tr>
    <tr><td><b>Lasso</b> (L1)</td><td>Summe der Beträge der Koeffizienten</td><td>setzt unwichtige Koeffizienten auf <b>exakt 0</b> (automatische Feature Selection)</td></tr>
    <tr><td><b>ElasticNet</b></td><td>L1 und L2 gemischt</td><td>Kompromiss, robuster als jedes allein</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Ridge schrumpft, Lasso streicht. Je grösser alpha, desto stärker die Bremse (bei sehr grossem alpha droht Underfitting).</p></div>

  <h3>8 · Hyperparameter und Modellwahl</h3>
  <p><b>Parameter</b> lernt das Modell selbst (die Koeffizienten). <b>Hyperparameter</b> stellst du vorher ein (Lernrate, alpha, Polynomgrad). Gute Werte findest du durch Suchen, jeweils mit Cross-Validation:</p>
  <ul>
    <li><b>Grid Search</b>: alle Kombinationen aus deiner Liste durchprobieren (gründlich, aber langsam).</li>
    <li><b>Random Search</b>: zufällige Auswahl der Kombinationen (oft fast so gut, viel schneller).</li>
  </ul>
  <pre><code>from sklearn.linear_model import Lasso
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([("scaler", StandardScaler()), ("lasso", Lasso())])
grid = {"lasso__alpha": [0.1, 1, 10], "lasso__max_iter": [100, 1000, 10000]}
search = GridSearchCV(pipe, grid, cv=5, n_jobs=-1)
search.fit(X_trainval, y_trainval)
search.best_params_, search.best_estimator_</code></pre>
  <p>Der Name vor dem doppelten Unterstrich (<code>lasso__alpha</code>) ist der Name des Schritts in der Pipeline.</p>

  <h3>Der ganze Ablauf auf einen Blick</h3>
  <ol>
    <li>Daten laden, Zielgrösse <code>y</code> von den Merkmalen <code>X</code> trennen.</li>
    <li>Test-Set beiseite legen und nicht mehr anfassen.</li>
    <li>Pipeline bauen (Skalieren, ggf. Features, Modell).</li>
    <li>Mit Cross-Validation und Grid/Random Search Modelle und Hyperparameter vergleichen.</li>
    <li>Bestes Modell auf allen Trainingsdaten neu trainieren.</li>
    <li>Einmal auf dem Test-Set bewerten (MSE, MAE, R²) und fertig.</li>
  </ol>`,
    notebooks: [{ file: 'Supervised_Learning_1_Uebungen_own.ipynb', desc: `10 Aufgaben mit scikit-learn: Gradient Descent, Fehlermasse, Cross-Validation, Imputation, Overfitting, Lasso und Ridge, GridSearch, Feature Selection.` }],
    quiz: [
      { q: `Dein Modell hat Trainingsfehler 1 und Testfehler 20. Was ist los und was tust du?`, a: `Overfitting. Weniger oder einfachere Merkmale, Regularisierung (Ridge/Lasso), mehr Daten.` },
      { q: `Warum braucht man neben dem Test-Set auch ein Validation-Set?`, a: `Die Validation wird beim Feintunen mehrfach benutzt und lernt indirekt mit. Das Test-Set bleibt ungesehen und gibt am Schluss die ehrliche Schätzung.` },
      { q: `Wann nimmst du Lasso statt Ridge?`, a: `Wenn du viele Merkmale hast und vermutest, dass einige unwichtig sind: Lasso setzt deren Koeffizienten auf exakt 0.` },
      { q: `Wozu dient <code>Pipeline</code>?`, a: `Sie verkettet Schritte wie Skalieren und Modell. In der Cross-Validation wird so jeder Schritt nur mit den Trainingsdaten des jeweiligen Folds gelernt, das verhindert Leakage.` },
      { q: `Was ist der Unterschied zwischen Grid und Random Search?`, a: `Grid probiert alle Kombinationen, Random eine zufällige Auswahl. Random ist oft ähnlich gut und deutlich schneller.` },
    ],
    init() {
      (function(){
        const qm=[35,48,55,62,70,78,85,95,110,130],zi=[1.5,2,2.5,2.5,3,3.5,3.5,4,4.5,5.5],la=[2,4,3,5,2,4,3,5,3,4];
        const pr=[1200,1510,1540,1770,1620,1890,1850,2280,2170,2580],n=10;
        const mean=a=>a.reduce((p,c)=>p+c,0)/a.length,sdv=a=>{const m=mean(a);return Math.sqrt(mean(a.map(v=>(v-m)*(v-m))))};
        // Ordinary least squares via normal equations; cols = feature arrays, returns [b, w1, w2, ...]
        function ols(cols){const k=cols.length+1,X=pr.map((_,i)=>[1].concat(cols.map(c=>c[i])));
          const A=[],b=[];for(let r=0;r<k;r++){A.push([]);for(let c=0;c<k;c++){let t=0;for(let i=0;i<n;i++)t+=X[i][r]*X[i][c];A[r].push(t)}let t=0;for(let i=0;i<n;i++)t+=X[i][r]*pr[i];b.push(t)}
          return solve(A,b)}
        const std=c=>{const m=mean(c),d=sdv(c);return c.map(v=>(v-m)/d)};
        const W=320,PX=40,sx=x=>PX+(x-20)/120*(W-PX-12),sy=y=>205-(y-1000)/1700*180;
        function draw(all){
          $('whOne').classList.toggle('pri',!all);$('whAll').classList.toggle('pri',all);
          const cols=all?[qm,zi,la]:[qm],c=ols(cols),pred=pr.map((_,i)=>c[0]+cols.reduce((t,col,j)=>t+c[j+1]*col[i],0));
          const my=mean(pr);let sse=0,sst=0,sae=0;pr.forEach((y,i)=>{sse+=(y-pred[i])**2;sst+=(y-my)**2;sae+=Math.abs(y-pred[i])});
          let s='<line class="ax" x1="'+PX+'" y1="205" x2="'+(W-8)+'" y2="205"/><line class="ax" x1="'+PX+'" y1="15" x2="'+PX+'" y2="205"/>';
          for(let t=1000;t<=2500;t+=500)s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
          for(let t=40;t<=120;t+=40)s+='<text class="lbl" x="'+(sx(t)-6)+'" y="222">'+t+'</text>';
          s+='<text class="lbl" x="'+(W-24)+'" y="222">qm</text><text class="lbl" x="'+(PX+4)+'" y="12">Preis (CHF)</text>';
          if(!all){s+='<line class="ln" x1="'+sx(25)+'" y1="'+sy(c[0]+c[1]*25)+'" x2="'+sx(135)+'" y2="'+sy(c[0]+c[1]*135)+'"/>'}
          pr.forEach((y,i)=>{s+='<line class="res" x1="'+sx(qm[i])+'" y1="'+sy(y)+'" x2="'+sx(qm[i])+'" y2="'+sy(pred[i])+'"/>'});
          pr.forEach((y,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(y)+'" r="'+(2+zi[i]*1.6).toFixed(1)+'" style="fill:var(--accent);opacity:'+(0.2+la[i]*0.16).toFixed(2)+';stroke:var(--accent)"/>'});
          if(all)pred.forEach((q,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(q)+'" r="3.2" style="fill:var(--bg);stroke:var(--fg);stroke-width:1.5"/>'});
          $('whSvg').innerHTML=s;$('whR2').textContent=fmt(1-sse/sst,3);$('whMae').textContent=fmt(sae/n,0);
          const z=ols(cols.map(std)),names=['qm','Zimmer','Lage'];
          let t='<tr><th>Merkmal</th><th>Roh</th><th>Skaliert</th></tr>';
          cols.forEach((_,j)=>{t+='<tr><td>'+names[j]+'</td><td>'+fmt(c[j+1],1)+' CHF/Einh.</td><td><b>'+fmt(z[j+1],0)+'</b></td></tr>'});
          $('whTab').innerHTML=t}
        (function(){
          const c=ols([qm,zi]),pred=pr.map((_,i)=>c[0]+c[1]*qm[i]+c[2]*zi[i]),my=mean(pr);
          let sse=0,sst=0;pr.forEach((y,i)=>{sse+=(y-pred[i])**2;sst+=(y-my)**2});$('r3R2').textContent=fmt(1-sse/sst,3);
          const nx=v=>(v-82)/55,ny=v=>(v-3.5)/2.75,nz=v=>(v-1900)/800,S=91,CX=160,CY=158;
          let az=-35,el=25;
          function P(x,y,z){const a=az*Math.PI/180,e=el*Math.PI/180;
            const xr=x*Math.cos(a)-y*Math.sin(a),d=x*Math.sin(a)+y*Math.cos(a);
            return [CX+S*xr,CY-S*(z*Math.cos(e)+d*Math.sin(e))*1.0,d]}
          const f=(q,z)=>nz(c[0]+c[1]*q+c[2]*z);
          function draw3(){
            $('r3AzO').textContent=az+'°';$('r3ElO').textContent=el+'°';
            $('r3Az').value=az;$('r3El').value=el;
            const q0=30,q1=135,z0=1,z1=6;let s='';
            const box=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]].map(v=>P(v[0],v[1],v[2]));
            s+='<polygon points="'+box.map(b=>b[0].toFixed(1)+','+b[1].toFixed(1)).join(' ')+'" style="fill:none;stroke:var(--line)"/>';
            const o=P(-1,-1,-1);
            [['qm',P(1,-1,-1)],['Zimmer',P(-1,1,-1)],['Preis',P(-1,-1,1)]].forEach(a=>{
              s+='<line class="ax" x1="'+o[0].toFixed(1)+'" y1="'+o[1].toFixed(1)+'" x2="'+a[1][0].toFixed(1)+'" y2="'+a[1][1].toFixed(1)+'"/><text class="lbl" x="'+Math.max(4,Math.min(a[1][0]+4,282)).toFixed(1)+'" y="'+Math.max(12,Math.min(a[1][1]+4,310)).toFixed(1)+'">'+a[0]+'</text>'});
            const k=(q,z)=>{const p=P(nx(q),ny(z),f(q,z));return p[0].toFixed(1)+','+p[1].toFixed(1)};
            s+='<polygon points="'+[k(q0,z0),k(q1,z0),k(q1,z1),k(q0,z1)].join(' ')+'" style="fill:var(--accent);opacity:.18;stroke:var(--accent);stroke-width:1.2"/>';
            for(let i=1;i<4;i++){const q=q0+(q1-q0)*i/4,z=z0+(z1-z0)*i/4;
              s+='<polyline points="'+k(q,z0)+' '+k(q,z1)+'" style="fill:none;stroke:var(--accent);opacity:.35"/><polyline points="'+k(q0,z)+' '+k(q1,z)+'" style="fill:none;stroke:var(--accent);opacity:.35"/>'}
            const pts=pr.map((y,i)=>({p:P(nx(qm[i]),ny(zi[i]),nz(y)),f:P(nx(qm[i]),ny(zi[i]),nz(pred[i]))})).sort((a,b)=>b.p[2]-a.p[2]);
            pts.forEach(t=>{s+='<line class="res" x1="'+t.p[0].toFixed(1)+'" y1="'+t.p[1].toFixed(1)+'" x2="'+t.f[0].toFixed(1)+'" y2="'+t.f[1].toFixed(1)+'"/><circle class="pt" cx="'+t.p[0].toFixed(1)+'" cy="'+t.p[1].toFixed(1)+'" r="4"/>'});
            $('r3Svg').innerHTML=s}
          $('r3Az').addEventListener('input',e=>{az=+e.target.value;draw3()});
          $('r3El').addEventListener('input',e=>{el=+e.target.value;draw3()});
          // Front view = the familiar 2D plot qm vs. Preis; side view = Zimmer vs. Preis
          $('r3Top').addEventListener('click',()=>{az=0;el=0;draw3()});
          $('r3Side').addEventListener('click',()=>{az=90;el=0;draw3()});
          $('r3Reset').addEventListener('click',()=>{az=-35;el=25;draw3()});
          let drag=null;const sv=$('r3Svg');
          sv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,az,el];sv.setPointerCapture(e.pointerId)});
          sv.addEventListener('pointermove',e=>{if(!drag)return;az=Math.round(((drag[2]+(e.clientX-drag[0])*0.6+540)%360)-180);el=Math.max(0,Math.min(80,Math.round(drag[3]+(e.clientY-drag[1])*0.4)));draw3()});
          sv.addEventListener('pointerup',()=>{drag=null});sv.addEventListener('pointercancel',()=>{drag=null});
          draw3()})();
        (function(){
          // Gradient descent on standardized features, price in 1000 CHF
          const X=[qm,zi,la].map(std),y=pr.map(v=>v/1000),names=['qm','Zimmer','Lage'];
          const tgt=ols(X).slice(1).map(v=>v/1000),tb=ols(X)[0]/1000;
          let w,b,hist,timer=null;
          const mseOf=()=>{let t=0;for(let i=0;i<n;i++){let p=b;for(let j=0;j<3;j++)p+=w[j]*X[j][i];t+=(y[i]-p)**2}return t/n};
          function reset(){if(timer){clearInterval(timer);timer=null;$('ftRun').textContent='Lernen (Animation)'}w=[0,0,0];b=0;hist=[mseOf()];draw()}
          function step(){const lr=+$('ftLr').value,g=[0,0,0];let gb=0;
            for(let i=0;i<n;i++){let p=b;for(let j=0;j<3;j++)p+=w[j]*X[j][i];const e=p-y[i];gb+=2*e/n;for(let j=0;j<3;j++)g[j]+=2*e*X[j][i]/n}
            b-=lr*gb;for(let j=0;j<3;j++)w[j]-=lr*g[j];hist.push(mseOf())}
          function draw(){
            $('ftLrO').textContent=fmt(+$('ftLr').value,2);
            const m=hist[hist.length-1],bad=!isFinite(m)||m>1e6;
            $('ftN').textContent=hist.length-1;$('ftMse').textContent=bad?'explodiert':fmt(m,4);
            const Z=195,sc=300,cl=v=>Math.max(-125,Math.min(125,v*sc));let s='';
            s+='<text class="lbl" x="4" y="12">Gewichte (skaliert)</text><line class="ax" x1="'+Z+'" y1="18" x2="'+Z+'" y2="104"/>';
            names.forEach((nm,j)=>{const yy=34+j*28,v=bad?0:w[j];
              s+='<text class="lbl" x="4" y="'+(yy+4)+'">'+nm+'</text>';
              s+='<rect x="'+(v>=0?Z:Z+cl(v))+'" y="'+(yy-8)+'" width="'+Math.abs(cl(v))+'" height="16" style="fill:var(--accent);opacity:.75"/>';
              s+='<line x1="'+(Z+cl(tgt[j]))+'" y1="'+(yy-12)+'" x2="'+(Z+cl(tgt[j]))+'" y2="'+(yy+12)+'" style="stroke:var(--fg);stroke-width:2"/>';
              s+='<text class="lbl" x="'+(Z+cl(Math.max(v,tgt[j]))+6)+'" y="'+(yy+4)+'">'+fmt(v,3)+'</text>'});
            s+='<text class="lbl" x="4" y="136">Fehler (MSE) pro Schritt, Skala gestaucht</text>';
            const x0=30,x1=312,y0=145,y1=252,N=Math.max(hist.length-1,10),top=Math.max(hist[0],1e-9);
            s+='<line class="ax" x1="'+x0+'" y1="'+y1+'" x2="'+x1+'" y2="'+y1+'"/><line class="ax" x1="'+x0+'" y1="'+y0+'" x2="'+x0+'" y2="'+y1+'"/>';
            s+='<text class="lbl" x="2" y="'+(y0+8)+'">'+fmt(top,1)+'</text><text class="lbl" x="12" y="'+(y1)+'">0</text><text class="lbl" x="'+(x1-80)+'" y="'+(y1+14)+'">Schritte: '+N+'</text>';
            let d='';hist.forEach((v,i)=>{const yy=y1-Math.sqrt(Math.min(Math.max(v,0),top*1.05)/top)*(y1-y0);d+=(i?'L':'M')+(x0+i/N*(x1-x0)).toFixed(1)+' '+yy.toFixed(1)});
            s+='<path class="ln" d="'+d+'"/>';
            $('ftSvg').innerHTML=s;
            $('ftEq').innerHTML=bad?'<b>Die Schrittgrösse ist zu gross:</b> Jeder Schritt schiesst über das Minimum hinaus, der Fehler wächst. Setze zurück und wähle einen kleineren Wert.':
              'Aktuell: Preis = <b>'+fmt(b,2)+'</b> + <b>'+fmt(w[0],3)+'</b>·qm + <b>'+fmt(w[1],3)+'</b>·Zimmer + <b>'+fmt(w[2],3)+'</b>·Lage (Merkmale skaliert, Preis in 1000 CHF). Ziel: '+fmt(tb,2)+' + '+fmt(tgt[0],3)+'·qm + '+fmt(tgt[1],3)+'·Zimmer + '+fmt(tgt[2],3)+'·Lage.'}
          $('ftStep').addEventListener('click',()=>{step();draw()});
          $('ftRun').addEventListener('click',()=>{
            if(timer){clearInterval(timer);timer=null;$('ftRun').textContent='Lernen (Animation)';return}
            $('ftRun').textContent='Stopp';
            timer=setInterval(()=>{for(let k=0;k<6;k++)step();draw();
              if(hist.length>4000||!isFinite(hist[hist.length-1])||hist[hist.length-1]>1e6||Math.abs(hist[hist.length-2]-hist[hist.length-1])<1e-11){clearInterval(timer);timer=null;$('ftRun').textContent='Lernen (Animation)'}},40)});
          $('ftReset').addEventListener('click',reset);$('ftLr').addEventListener('input',draw);reset()})();
        $('whOne').addEventListener('click',()=>draw(false));$('whAll').addEventListener('click',()=>draw(true));draw(false)})();
      (function(){
        const W=320,H=200,X0=-5,X1=5,Y1=26;const sx=x=>(x-X0)/(X1-X0)*W,sy=y=>H-14-(y/Y1)*(H-26);
        let x,path,n;
        function reset(){x=-4;path=[x];n=0;draw()}
        function step(){const lr=+$('gdLr').value;x=x-lr*2*x;n++;path.push(x);if(path.length>60)path.shift();draw()}
        function draw(){const lr=+$('gdLr').value;$('gdLrO').textContent=fmt(lr,2);
          let curve='';for(let i=0;i<=100;i++){const xv=X0+i*(X1-X0)/100;curve+=(i?'L':'M')+sx(xv).toFixed(1)+' '+sy(xv*xv).toFixed(1)}
          let s='<line class="ax" x1="0" y1="'+(H-14)+'" x2="'+W+'" y2="'+(H-14)+'"/><line class="ax" x1="'+sx(0)+'" y1="0" x2="'+sx(0)+'" y2="'+H+'"/>';
          s+='<text class="lbl" x="'+(sx(0)+4)+'" y="'+(H-3)+'">Tal bei x=0</text><path class="ln" d="'+curve+'"/>';
          const vis=path.filter(p=>Math.abs(p)<=5);
          for(let i=1;i<vis.length;i++)s+='<line class="dash" x1="'+sx(vis[i-1])+'" y1="'+sy(vis[i-1]**2)+'" x2="'+sx(vis[i])+'" y2="'+sy(vis[i]**2)+'"/>';
          vis.forEach((p,i)=>{const last=(p===x&&i===vis.length-1);s+='<circle cx="'+sx(p)+'" cy="'+sy(p*p)+'" r="'+(last?6:3.5)+'" style="fill:'+(last?'var(--warn)':'var(--fg)')+'"/>'});
          $('gdSvg').innerHTML=s;$('gdN').textContent=n;
          const out=Math.abs(x)>5;$('gdX').textContent=out?(Math.abs(x)>1e4?'sehr gross':fmt(x,2)):fmt(x,3);$('gdY').textContent=Math.abs(x)>1e2?'riesig':fmt(x*x,3);
          let m;if(n===0)m='Start bei x = -4. Orange ist die aktuelle Position.';
          else if(Math.abs(x)>5)m='Der Punkt ist über den Rand hinaus gesprungen: Die Lernrate ist zu gross, die Werte wachsen immer weiter (Divergenz).';
          else if(lr>=0.95&&lr<=1.05)m='Bei Lernrate 1 springt der Punkt immer zwischen -x und +x, ohne anzukommen.';
          else if(Math.abs(x)<0.01)m='Angekommen: x ist praktisch 0, das Minimum ist gefunden (Konvergenz).';
          else m='Jeder Schritt bringt dich näher ans Tal. Bei kleiner Lernrate dauert es länger.';
          $('gdMsg').textContent=m}
        $('gdStep').addEventListener('click',step);$('gdTen').addEventListener('click',()=>{for(let i=0;i<10;i++)step()});
        $('gdReset').addEventListener('click',reset);$('gdLr').addEventListener('input',reset);reset()})();
      (function(){
        const xs=[1,2,3,4,5,6,7,8],ys=[2.1,2.9,4.6,4.8,6.6,6.4,8.3,8.9];
        const W=320,H=220,PX=28,PY=18;const sx=x=>PX+(x/9)*(W-PX-10),sy=y=>H-PY-(y/10)*(H-PY-10);
        const best=lineFit(xs,ys);const n=xs.length;
        function draw(){const a=+$('lrA').value,b=+$('lrB').value;$('lrAO').textContent=fmt(a,2);$('lrBO').textContent=fmt(b,1);
          let s='<line class="ax" x1="'+PX+'" y1="'+(H-PY)+'" x2="'+(W-10)+'" y2="'+(H-PY)+'"/><line class="ax" x1="'+PX+'" y1="10" x2="'+PX+'" y2="'+(H-PY)+'"/>';
          for(let t=0;t<=10;t+=5)s+='<text class="lbl" x="4" y="'+(sy(t)+3)+'">'+t+'</text>';
          for(let t=0;t<=8;t+=4)s+='<text class="lbl" x="'+(sx(t)-3)+'" y="'+(H-4)+'">'+t+'</text>';
          let sse=0,sae=0,sst=0;
          for(let i=0;i<n;i++){const p=a*xs[i]+b,r=ys[i]-p;sse+=r*r;sae+=Math.abs(r);sst+=(ys[i]-best.my)**2;
            s+='<line class="res" x1="'+sx(xs[i])+'" y1="'+sy(ys[i])+'" x2="'+sx(xs[i])+'" y2="'+sy(p)+'"/>'}
          s+='<line class="ln" x1="'+sx(0)+'" y1="'+sy(b)+'" x2="'+sx(9)+'" y2="'+sy(a*9+b)+'"/>';
          for(let i=0;i<n;i++)s+='<circle class="pt" cx="'+sx(xs[i])+'" cy="'+sy(ys[i])+'" r="4"/>';
          $('lrSvg').innerHTML=s;$('lrMae').textContent=fmt(sae/n,2);$('lrMse').textContent=fmt(sse/n,2);$('lrR2').textContent=fmt(1-sse/sst,2)}
        function set(a,b){$('lrA').value=Math.max(-1,Math.min(2,a));$('lrB').value=Math.max(-2,Math.min(8,b));draw()}
        $('lrA').addEventListener('input',draw);$('lrB').addEventListener('input',draw);
        $('lrBest').addEventListener('click',()=>set(Math.round(best.a*20)/20,Math.round(best.b*10)/10));
        $('lrMean').addEventListener('click',()=>set(0,Math.round(best.my*10)/10));draw()})();
      (function(){
        const r=mulberry32(4);const f=x=>Math.sin(2*Math.PI*x);
        const tx=[],ty=[];for(let i=0;i<10;i++){const x=i/9;tx.push(x*2-1);ty.push(f(x)+0.3*gauss(r))}
        const ex=[],ey=[];for(let i=0;i<60;i++){const x=r();ex.push(x*2-1);ey.push(f(x)+0.3*gauss(r))}
        const coefs=[],tr=[],te=[];for(let d=1;d<=9;d++){const c=polyFit(tx,ty,d);coefs.push(c);tr.push(mse(c,tx,ty));te.push(mse(c,ex,ey))}
        const W=320,H=220,YMIN=-2,YMAX=2;const sx=x=>8+((x+1)/2)*(W-16),sy=y=>H-8-((Math.max(YMIN,Math.min(YMAX,y))-YMIN)/(YMAX-YMIN))*(H-16);
        function draw(){const d=+$('bvDeg').value;$('bvDegO').textContent=d;const c=coefs[d-1];
          let s='<line class="ax" x1="0" y1="'+sy(0)+'" x2="'+W+'" y2="'+sy(0)+'"/>';
          let tp='',cp='';for(let i=0;i<=100;i++){const x=-1+i*0.02,xo=(x+1)/2;tp+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(f(xo)).toFixed(1);cp+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(polyEval(c,x)).toFixed(1)}
          s+='<path class="dash" d="'+tp+'"/><path class="ln" d="'+cp+'"/>';
          for(let i=0;i<tx.length;i++)s+='<circle class="pt" cx="'+sx(tx[i])+'" cy="'+sy(ty[i])+'" r="4"/>';
          $('bvSvg').innerHTML=s;$('bvTr').textContent=fmt(tr[d-1],3);$('bvTe').textContent=fmt(te[d-1],3);
          const minTe=Math.min.apply(null,te),bestD=te.indexOf(minTe)+1;let m;
          if(d<bestD&&te[d-1]>2*minTe)m='Zu einfach: Die Kurve verpasst das Muster. Beide Fehler sind hoch (Underfitting, hoher Bias).';
          else if(d>bestD&&te[d-1]>1.5*minTe)m='Zu komplex: Die Kurve folgt dem Rauschen der 10 Punkte. Trainingsfehler tief, Testfehler deutlich höher (Overfitting, hohe Variance).';
          else m='Guter Bereich: Die Kurve fängt das Muster, ohne dem Rauschen nachzulaufen.';
          $('bvMsg').textContent=m+' Gestrichelt: die wahre Sinuskurve (sieht das Modell nicht).';
          const EW=320,EH=150,EM=Math.max.apply(null,te.concat(tr).filter(v=>v<1.0).concat([0.5])),ex2=i=>30+(i/8)*(EW-45),ey2=v=>EH-22-(Math.min(v,EM)/EM)*(EH-36);
          let g='<line class="ax" x1="30" y1="'+(EH-22)+'" x2="'+(EW-10)+'" y2="'+(EH-22)+'"/>';
          for(let k=1;k<=9;k++)g+='<text class="lbl" x="'+(ex2(k-1)-3)+'" y="'+(EH-8)+'">'+k+'</text>';
          g+='<text class="lbl" x="30" y="10">Fehler (MSE), oben abgeschnitten bei '+fmt(EM,2)+'</text>';
          const path=a=>a.map((v,i)=>(i?'L':'M')+ex2(i).toFixed(1)+' '+ey2(v).toFixed(1)).join('');
          g+='<path class="ln" d="'+path(tr)+'"/><path class="ln2" d="'+path(te)+'"/>';
          g+='<line class="dash" x1="'+ex2(d-1)+'" y1="14" x2="'+ex2(d-1)+'" y2="'+(EH-22)+'"/>';
          $('bvErr').innerHTML=g}
        $('bvDeg').addEventListener('input',draw);draw()})();
    },
  });
})();
