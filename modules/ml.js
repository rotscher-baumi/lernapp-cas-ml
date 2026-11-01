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

  <h3 id="ml-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Vor jedem Modell steht die explorative Datenanalyse (EDA). Sie zeigt, welche Vorverarbeitung nötig ist und welches Modell sinnvoll ist.</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig">
    <div class="ab-scroll">
    <svg viewBox="-50 0 830 858" role="img" aria-label="Ablauf eines ML-Projekts: Rohdaten, Split 80/20, EDA auf den Trainingsdaten, manuelle Feature Selection mit Fachwissen, Vorverarbeitung und Skalierung nur auf Trainingsdaten berechnen, automatische Feature Selection in der Pipeline, Training und Validierung mit Schleife über Hyperparameter, bestes Modell wählen, Testdaten genau einmal am Ende.">
      <defs>
        <marker id="ab-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/>
        </marker>
        <marker id="ab-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--warn)"/>
        </marker>
      </defs>

      <g class="ab-step" data-s="1" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 1: Erklärung aufklappen">
      <rect x="60" y="20" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="42" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">1 · Rohdaten laden</text>
      <text x="210" y="60" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Zeilen, Spalten, Datentypen prüfen</text>
      </g>
      <line x1="210" y1="72" x2="210" y2="104" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="2" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 2: Erklärung aufklappen">
      <rect x="60" y="104" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="126" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">2 · Aufteilen</text>
      <text x="210" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">zuerst trennen, bevor man etwas auswertet</text>
      </g>
      <line x1="360" y1="130" x2="440" y2="130" marker-end="url(#ab-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>
      <text x="400" y="122" text-anchor="middle" style="fill:var(--warn);font-size:11.5px;font-family:var(--f-mono)">20 %</text>
      <g class="ab-step" data-s="t" tabindex="0" role="button" aria-expanded="false" aria-label="Testset: Erklärung aufklappen">
      <rect x="440" y="104" width="240" height="52" rx="6" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4"/>
      <text x="560" y="126" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body);fill:var(--warn)">Testset: gesperrt</text>
      <text x="560" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">nicht ansehen, nicht anfassen</text>
      </g>
      <path d="M680,130 H745 V826 H360" marker-end="url(#ab-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>

      <line x1="210" y1="156" x2="210" y2="188" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="222" y="177" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">80 % Train + Val</text>

      <g class="ab-step" data-s="3" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 3: Erklärung aufklappen">
      <rect x="60" y="188" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="210" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">3 · Daten ansehen (EDA)</text>
      <text x="210" y="228" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">nur auf den 80 %, ohne Modell</text>
      </g>
      <line x1="360" y1="214" x2="410" y2="214" marker-end="url(#ab-a)" style="stroke:var(--accent);stroke-width:1.5;fill:none"/>

      <rect x="410" y="168" width="300" height="130" rx="8" style="fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 4"/>
      <text x="424" y="188" style="fill:var(--accent);font-size:12px;font-weight:600;font-family:var(--f-body)">Was man dabei sucht</text>

      <g transform="translate(428,200)">
        <rect x="0" y="34" width="9" height="12" style="fill:var(--accent)"/>
        <rect x="11" y="20" width="9" height="26" style="fill:var(--accent)"/>
        <rect x="22" y="4" width="9" height="42" style="fill:var(--accent)"/>
        <rect x="33" y="14" width="9" height="32" style="fill:var(--accent)"/>
        <rect x="44" y="30" width="9" height="16" style="fill:var(--accent)"/>
        <rect x="55" y="42" width="9" height="4" style="fill:var(--accent)"/>
        <line x1="0" y1="46.5" x2="66" y2="46.5" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      </g>
      <text x="461" y="268" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Verteilungen</text>
      <text x="461" y="283" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Ausreisser</text>

      <g transform="translate(538,200)">
        <line x1="0" y1="46.5" x2="66" y2="46.5" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
        <line x1="0.5" y1="0" x2="0.5" y2="46" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
        <circle cx="10" cy="38" r="2.5" style="fill:var(--accent)"/><circle cx="18" cy="32" r="2.5" style="fill:var(--accent)"/>
        <circle cx="26" cy="35" r="2.5" style="fill:var(--accent)"/><circle cx="32" cy="24" r="2.5" style="fill:var(--accent)"/>
        <circle cx="42" cy="20" r="2.5" style="fill:var(--accent)"/><circle cx="48" cy="26" r="2.5" style="fill:var(--accent)"/>
        <circle cx="56" cy="10" r="2.5" style="fill:var(--accent)"/><circle cx="62" cy="14" r="2.5" style="fill:var(--accent)"/>
      </g>
      <text x="571" y="268" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Zusammenhang</text>
      <text x="571" y="283" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Merkmal ↔ Ziel</text>

      <g transform="translate(648,200)">
        <rect x="0" y="0" width="20" height="14" opacity="1" style="fill:var(--accent)"/>
        <rect x="22" y="0" width="20" height="14" opacity="0.2" style="fill:var(--accent)"/>
        <rect x="44" y="0" width="20" height="14" opacity="0.75" style="fill:var(--accent)"/>
        <rect x="0" y="16" width="20" height="14" opacity="0.2" style="fill:var(--accent)"/>
        <rect x="22" y="16" width="20" height="14" opacity="1" style="fill:var(--accent)"/>
        <rect x="44" y="16" width="20" height="14" opacity="0.35" style="fill:var(--accent)"/>
        <rect x="0" y="32" width="20" height="14" opacity="0.75" style="fill:var(--accent)"/>
        <rect x="22" y="32" width="20" height="14" opacity="0.35" style="fill:var(--accent)"/>
        <rect x="44" y="32" width="20" height="14" opacity="1" style="fill:var(--accent)"/>
      </g>
      <text x="680" y="268" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Korrelationen</text>
      <text x="680" y="283" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Fehlende Werte</text>

      <line x1="210" y1="240" x2="210" y2="300" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="222" y="274" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">daraus folgt die Strategie</text>

      <g class="ab-step" data-s="4" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 4: Erklärung aufklappen">
      <rect x="60" y="300" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="322" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">4 · Feature Selection (manuell)</text>
      <text x="210" y="340" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Fachwissen + EDA: IDs, Leakage, Dubletten raus</text>
      </g>
      <line x1="210" y1="352" x2="210" y2="384" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="5" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 5: Erklärung aufklappen">
      <rect x="60" y="384" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="406" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">5 · Vorverarbeitung festlegen</text>
      <text x="210" y="424" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">z. B. Median nur aus Trainingsdaten (fit)</text>
      </g>
      <line x1="210" y1="436" x2="210" y2="468" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="6" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 6: Erklärung aufklappen">
      <rect x="60" y="468" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="490" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">6 · Skalieren</text>
      <text x="210" y="508" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Skaler ebenfalls nur auf Training anpassen</text>
      </g>
      <line x1="210" y1="520" x2="210" y2="552" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="7" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 7: Erklärung aufklappen">
      <rect x="60" y="552" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="574" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">7 · Feature Selection (automatisch)</text>
      <text x="210" y="592" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">optional · Filter, Wrapper, Embedded in der Pipeline</text>
      </g>
      <line x1="210" y1="604" x2="210" y2="636" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="578" x2="410" y2="578" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <rect x="410" y="560" width="300" height="94" rx="8" style="fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 4;stroke:var(--line)"/>
      <text x="424" y="580" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Filter</text>
      <text x="494" y="580" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Korrelation oder F-Test mit Ziel</text>
      <text x="424" y="602" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Wrapper</text>
      <text x="494" y="602" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">RFE: Modell wirft Merkmale raus</text>
      <text x="424" y="624" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Embedded</text>
      <text x="494" y="624" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">L1 (Lasso), Baum-Wichtigkeit</text>
      <text x="424" y="644" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">nicht dasselbe: PCA bildet neue Merkmale</text>

      <g class="ab-step" data-s="8" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 8: Erklärung aufklappen">
      <rect x="60" y="636" width="300" height="60" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="659" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">8 · Trainieren und validieren</text>
      <text x="210" y="677" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Split 75:25 oder Cross-Validation</text>
      </g>
      <path d="M60,680 H34 V652 H60" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="26" y="666" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">Hyper-</text>
      <text x="26" y="680" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">parameter</text>
      <line x1="210" y1="696" x2="210" y2="728" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="9" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 9: Erklärung aufklappen">
      <rect x="60" y="728" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="750" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">9 · Bestes Modell wählen</text>
      <text x="210" y="768" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">anhand der Validierung, neu auf 80 % trainieren</text>
      </g>
      <line x1="210" y1="780" x2="210" y2="806" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="10" tabindex="0" role="button" aria-expanded="false" aria-label="Schritt 10: Erklärung aufklappen">
      <rect x="60" y="806" width="300" height="40" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="831" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">10 · Einmal auf Testset bewerten</text>
      </g>
      <text x="738" y="816" text-anchor="end" style="fill:var(--warn);font-size:11.5px;font-family:var(--f-mono)">transform mit Train-Median und Train-Skaler</text>
    </svg>
    </div>
    <div class="ab-detail" id="abDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Schliessen">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Die EDA (blau) kommt vor Vorverarbeitung und Modell. Das Testset (orange) wird gleich zu Beginn abgetrennt und erst im letzten Schritt benutzt, damit das Testergebnis nicht durch Wissen aus den Testdaten verfälscht wird.</figcaption>
  </figure>
  <div class="merk"><b>Erst Daten anschauen</b><p>Ohne EDA weiss man nicht, ob Werte fehlen, ob Ausreisser Median oder Mittelwert verzerren, ob skaliert werden muss oder ob die Klassen ungleich verteilt sind. Die EDA bestimmt Schritt 4 bis 8.</p></div>
  <div class="falle"><b>Data Leakage</b><p>Auch die EDA nur auf den 80 % machen. Merkmalsauswahl, Median und Skaler werden wie das Modell nur mit den Trainingsdaten berechnet, am sichersten innerhalb jedes Cross-Validation-Durchgangs. Sonst fliesst Testwissen ein und die Validierung ist zu optimistisch.</p></div>

  <h3 id="ml-gd">1 · Gradient Descent: so «lernt» ein Modell</h3>
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

  <p class="note"><b>Mit den 10 Wohnungen:</b> Gesucht sind hier nicht x, sondern Steigung <code>w</code> und Achsenabschnitt <code>b</code> der Preisgeraden <code>Preis = b + w·qm</code> (wir schauen auf <code>w</code>, <code>b</code> wandert mit). Der Fehler (MSE) hängt von <code>w</code> ab wie <code>y = x²</code> von x: ein Tal. Startest du bei <code>w = 0</code> (waagrechte Gerade auf dem Durchschnittspreis 1841 CHF), ist der MSE etwa 151 000. Gradient Descent schiebt <code>w</code> Schritt für Schritt bergab, bis der MSE bei <code>w ≈ 13,6</code> CHF pro qm nur noch etwa 10 600 beträgt.</p>

  <h3 id="ml-linreg">2 · Lineare Regression: die beste Gerade</h3>
  <p>Gesucht ist die Gerade <code>y = a·x + b</code>, die möglichst nahe an allen Punkten liegt. Wie nah, misst die <b>Fehlerfunktion</b> (Loss). Die Abweichung eines Punktes von der Geraden heisst <b>Residuum</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Mass</th><th>Bedeutung</th></tr>
    <tr><td><b>MAE</b></td><td>mittlerer absoluter Fehler: Durchschnitt der Beträge der Residuen</td></tr>
    <tr><td><b>MSE</b></td><td>mittlerer quadrierter Fehler: bestraft grosse Ausreisser viel stärker (RMSE = Wurzel daraus, wieder in der Einheit von y)</td></tr>
    <tr><td><b>R²</b></td><td>wie viel Prozent des Fehlers die Regression gegenüber «immer den Mittelwert raten» beseitigt. 0 = nicht besser als Mittelwert, 1 = perfekt. Auf neuen Daten kann R² auch negativ sein (schlechter als der Mittelwert)</td></tr>
  </table></div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Die beste Gerade durch alle 10 Wohnungen ist <code>Preis = 799 + 13,6·qm</code>. Jeder Quadratmeter mehr kostet im Schnitt 13,6 CHF. Die Fehler: <b>R² = 0,93</b>, <b>MAE ≈ 86 CHF</b>, <b>RMSE ≈ 103 CHF</b> (die Wurzel aus dem MSE von 10 600). Ohne Modell, mit dem Durchschnittspreis 1841 CHF für alle, wäre R² = 0.</p>
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
  <p>Viele Modelle (z. B. <code>SGDRegressor</code>, neuronale Netze) lernen mit Gradient Descent. <code>LinearRegression</code> rechnet die Lösung dagegen direkt aus, landet aber am selben Ziel. Gradient Descent startet mit Gewichten bei 0, misst den Fehler, schiebt jedes Gewicht ein Stück in die Richtung, die den Fehler verkleinert (der Gradient aus dem Mathe-Kapitel), und wiederholt das. Hier siehst du es an den 10 Wohnungen mit den <b>skalierten</b> Merkmalen. Der Preis ist in 1000 CHF.</p>
  <div class="demo" id="ftDemo">
    <div class="tag">Demo</div><h4>Gewichte lernen, Schritt für Schritt</h4>
    <svg class="plot" id="ftSvg" viewBox="0 0 320 270" role="img" aria-label="Balken der drei Gewichte und Fehlerverlauf über die Lernschritte"></svg>
    <div class="ctl"><label for="ftLr">Schrittgrösse</label><input type="range" id="ftLr" min="0.02" max="0.6" step="0.01" value="0.1"><output id="ftLrO"></output></div>
    <div class="btnrow"><button class="pri" id="ftStep">1 Schritt</button><button id="ftRun">Lernen (Animation)</button><button id="ftReset">Zurücksetzen</button></div>
    <div class="stats"><span>Schritt <b id="ftN"></b></span><span>Fehler (MSE) <b id="ftMse"></b></span></div>
    <p class="hint" id="ftEq"></p>
    <p class="hint">Balken: aktuelle Gewichte. Die senkrechten Striche sind die Werte, die die exakte Lösung (<code>LinearRegression</code>) findet. <b>Gewichtung heisst also:</b> Jeder Schritt verschiebt ein Gewicht entgegen seinem Gradienten, bis der Fehler nicht mehr sinkt. Zu grosse Schritte schiessen über das Ziel (der Fehler explodiert), zu kleine brauchen sehr lange. qm und Zimmer hängen zusammen, darum finden sie ihre Werte langsamer.</p>
  </div>

  <h3 id="ml-prep">3 · Daten vorbereiten</h3>
  <h4 id="ml-missing" style="margin:12px 0 4px;font-family:var(--f-display)">Fehlende Werte</h4>
  <ul>
    <li><b>Löschen</b>: einfach, aber du verlierst Daten.</li>
    <li><b>Auffüllen (Imputation)</b>: Mittelwert/Median (schnell, ignoriert Zusammenhänge), Modus oder Konstante (auch für Kategorien, kann verzerren), k-nächste-Nachbarn (genauer, teuer), Regression oder Interpolation.</li>
  </ul>
  <p>Fehlende Werte in Training, Validation und Test dürfen vorkommen. Wichtig: Eine Imputationsregel, die aus Daten berechnet wird, wird <b>nur mit dem Training gelernt</b>. Zum Beispiel berechnet der Imputer dort den Median und verwendet genau diesen Median anschliessend auch für Validation und Test:</p>
  <pre><code>from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy="median")
X_train_clean = imputer.fit_transform(X_train)  # lernt Mediane und füllt Training
X_val_clean = imputer.transform(X_val)          # verwendet dieselben Mediane
X_test_clean = imputer.transform(X_test)        # verwendet dieselben Mediane</code></pre>
  <div class="merk"><b>Merksatz</b><p><code>fit</code> nur auf Trainingsdaten, <code>transform</code> auf allen Datensätzen. So wird zum Beispiel nicht der Testmedian verwendet und Data Leakage vermieden. Das separate Notebook zeigt das mit 10 Zeilen und 4 Merkmalen.</p></div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Fehlt bei der grössten Wohnung (130 qm, 5,5 Zimmer) die qm-Angabe, ergibt der Mittelwert der übrigen neun 71 qm: weit daneben, weil er die Zimmer ignoriert. Eine Regression von qm auf Zimmer schätzt 132 qm, und k-nächste-Nachbarn (die Wohnung mit den ähnlichsten Zimmern, 4,5 Zimmer) liefert 110 qm. Beide nutzen den Zusammenhang der Merkmale.</p>
  <h4 id="ml-scaling" style="margin:12px 0 4px;font-family:var(--f-display)">Skalieren</h4>
  <p>Merkmale haben ganz verschiedene Grössenordnungen (Verbrauch 8 l/100km, Hubraum 3600 cc). Ohne Skalieren dominieren die grossen Zahlen. Darum bringt man alle auf eine vergleichbare Skala.</p>
  <div class="tablewrap"><table>
    <tr><th>Methode</th><th>Ergebnis</th></tr>
    <tr><td>Standard Scaling</td><td>Mittelwert 0, Standardabweichung 1 (Form der Verteilung bleibt)</td></tr>
    <tr><td>Min-Max Scaling</td><td>Werte zwischen 0 und 1</td></tr>
    <tr><td>Mean Normalization</td><td>Mittelwert 0, Werte zwischen -1 und 1</td></tr>
  </table></div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> <code>qm</code> liegt zwischen 35 und 130, <code>Zimmer</code> zwischen 1,5 und 5,5, <code>Lage</code> zwischen 2 und 5. Ohne Skalieren würden die qm-Zahlen jedes abstandsbasierte Modell (kNN, SVM) und Gradient Descent dominieren. Mit Standard Scaling (Mittelwert 76,8 qm, Streuung 27,7 qm) wird die 130-qm-Wohnung zu <code>(130 − 76,8) / 27,7 ≈ 1,9</code>. Mit Min-Max wird sie zu 1, die 35-qm-Wohnung zu 0 und die 70-qm-Wohnung zu 0,37.</p>
  <h4 id="ml-cat" style="margin:12px 0 4px;font-family:var(--f-display)">Kategorien in Zahlen</h4>
  <p>Wochentage nie einfach als 1, 2, 3 codieren: Das würde «Mittwoch ist grösser als Montag» behaupten. Stattdessen <b>One-Hot-Encoding</b>: pro Kategorie eine Spalte mit 0 oder 1.</p>
  <p class="note"><b>Mit den 10 Wohnungen:</b> <code>Lage</code> ist hier eine Note von 1 bis 5 und damit schon eine Zahl mit Reihenfolge, das ist in Ordnung. Wäre die Lage ein Quartier (Altstadt, Seefeld, Hardau), gäbe es keine Reihenfolge: Dann bekommt jedes Quartier eine eigene 0/1-Spalte (One-Hot), und nicht 1, 2, 3.</p>
  <pre><code>from sklearn.preprocessing import StandardScaler
X = pd.DataFrame(StandardScaler().fit_transform(data), columns=data.columns)

data["einkommen_klasse"] = pd.cut(data["MedInc"], bins=[-1, 3, 6, 16],
                                  labels=["low", "medium", "high"])
data = pd.get_dummies(data, columns=["einkommen_klasse"])   # One-Hot</code></pre>
  <div class="falle"><b>Falle (Data Leakage)</b><p>Im Beispiel der Folien wird zur Vereinfachung <i>vor</i> dem Aufteilen skaliert. Sauber ist, den Scaler nur auf den Trainingsdaten zu lernen, denn auch der Scaler wird «trainiert»: Er lernt Mittelwert und Streuung. Fliessen Validierungs- oder Testdaten ein, sickert deren Information ins Modell (Data Leakage). Genau dafür gibt es <code>Pipeline</code> (siehe unten). Mehr zu Data Leakage kommt am Kurstag zur Klassifikation.</p></div>

  <h3 id="ml-split">4 · Train, Validation, Test und Cross-Validation</h3>
  <p>Ein Modell, das auf seinen Trainingsdaten gut ist, kann trotzdem bei neuen Daten versagen. Wir wollen die Leistung auf <b>ungesehenen</b> Daten kennen (Generalisierung). Deshalb teilen wir die Daten zufällig auf, z. B. 60/20/20:</p>
  <div class="steps">
    <div class="st"><b>Training (60 %)</b><span>Modell lernt hier.</span></div>
    <div class="st"><b>Validation (20 %)</b><span>Modelle und Einstellungen vergleichen.</span></div>
    <div class="st"><b>Test (20 %)</b><span>Zum Schluss, nur ein einziges Mal.</span></div>
  </div>
  <p>Warum nicht gleich den Test benutzen? Weil du die Validation beim Feintunen oft ansiehst und sie dadurch indirekt mitlernt. Der Test ist die Prüfung, die du erst am Schluss schreibst. Davor trainierst du das beste Modell nochmals mit Training und Validation zusammen (mehr Daten helfen) und bewertest erst dieses einmal auf dem Test. 60/20/20 entspricht übrigens 80/20 und davon nochmals 75:25.</p>
  <p><b>Cross-Validation (k-Fold)</b>: Die Daten werden in k gleich grosse Teile geteilt. k-mal trainierst du auf k−1 Teilen und prüfst auf dem übrigen, dann bildest du den Durchschnitt. Das nutzt die Daten besser, kostet aber k-mal mehr Rechenzeit. Varianten: Stratified (gleiche Klassenanteile pro Teil) und Leave-One-Out.</p>
  <div class="merk"><b>CV erzeugt k verschiedene Modelle</b><p>Bei 5-Fold-CV entstehen <b>5 getrennt trainierte Modelle</b> mit denselben Einstellungen (Algorithmus und Hyperparameter), aber unterschiedlichen gelernten Parametern, weil jedes andere Trainingsdaten sieht. Sie dienen nur zum Messen und werden danach verworfen. Übrig bleibt der Durchschnitt der k Fehler als Schätzung für diese Konfiguration. Das fertige Modell entsteht erst, wenn du die beste Konfiguration einmal auf allen Trainingsdaten neu trainierst.</p></div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Bei 10 Wohnungen ist 10-Fold gleich <b>Leave-One-Out</b>: Zehnmal trainierst du auf 9 Wohnungen und prüfst auf der zehnten. Die Gerade von oben hat auf den bekannten Wohnungen einen RMSE von 103 CHF, bei der jeweils fehlenden Wohnung <b>123 CHF</b>. Dieser zweite Wert ist die ehrlichere Zahl.</p>
  <pre><code>from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

pipe = Pipeline([("scaler", StandardScaler()), ("model", LinearRegression())])
scores = cross_val_score(pipe, X, y, cv=10,    # 10 Folds
                         scoring="neg_root_mean_squared_error")   # ohne scoring: R²
-scores.mean(), scores.std()                   # RMSE (sklearn liefert negativ)</code></pre>
  <p><b>Wie viele Durchläufe?</b> Bei k Folds gibt es k Durchläufe, jede Zeile ist genau einmal Validierung und k−1 Mal Training. Pro Durchlauf wird ein <b>neues</b> Modell (und bei einer Pipeline auch ein neuer Imputer/Scaler) von Grund auf trainiert, bewertet und verworfen. Nichts wird «4 Mal weiter optimiert». Der Mittelwert der k Scores bewertet das <b>Setup</b> (Modelltyp, Hyperparameter, Vorverarbeitung), die Streuung zeigt die Stabilität. Das Testset ist nicht Teil der CV. Das endgültige Modell trainierst du danach einmal auf allen Entwicklungsdaten (Training + Validation) und testest es einmal. Bei einer Suche über n Kandidaten sind es n × k Trainings (<code>GridSearchCV</code> trainiert mit <code>refit=True</code> am Ende selbst nach).</p>
  <div class="demo" id="cvDemo">
    <div class="tag">Demo</div><h4>Cross-Validation Schritt für Schritt</h4>
    <p class="hint">30 Punkte (Sinuskurve plus Rauschen). Wähle k und den Polynomgrad, dann steppe durch die Läufe. In jedem Lauf wird ein <b>neues</b> Modell (Scaler und Polynom) nur auf den ausgefüllten Punkten gelernt und auf den hohlen Punkten (Test-Fold) geprüft.</p>
    <svg class="plot" id="cvStrip" viewBox="0 0 320 44" role="img" aria-label="Aufteilung der Daten in k Folds, der Test-Fold ist markiert"></svg>
    <svg class="plot" id="cvSvg" viewBox="0 0 320 220" role="img" aria-label="Trainingspunkte, Testpunkte und das in diesem Lauf gelernte Polynom" style="margin-top:10px"></svg>
    <div class="ctl"><label for="cvK">k (Folds)</label><input type="range" id="cvK" min="0" max="2" step="1" value="1"><output id="cvKO"></output></div>
    <div class="ctl"><label for="cvDeg">Grad</label><input type="range" id="cvDeg" min="1" max="9" step="1" value="3"><output id="cvDegO"></output></div>
    <div class="ctl"><label for="cvRun">Lauf</label><input type="range" id="cvRun" min="1" max="5" step="1" value="1"><output id="cvRunO"></output></div>
    <div class="stats"><span>Scaler (nur Train): Mittelwert <b id="cvMu"></b>, Std <b id="cvSd"></b></span><span>Fehler dieses Laufs (MSE) <b id="cvMse"></b></span></div>
    <svg class="plot" id="cvBars" viewBox="0 0 320 150" role="img" aria-label="Fehler pro Lauf und Mittelwert" style="margin-top:12px"></svg>
    <div class="stats"><span>CV-Fehler (Mittelwert) <b id="cvMean"></b></span><span>Streuung (Std) <b id="cvStd"></b></span></div>
    <p class="hint" id="cvMsg"></p>
    <p class="hint">Balken: Fehler je Lauf, der gewählte Lauf ist blau. Gestrichelt: der Mittelwert, das ist die CV-Schätzung. Jeder Lauf hat einen anderen Scaler-Mittelwert und eine andere Kurve, weil er andere Trainingspunkte sieht. Die Balken zeigen, wie stark ein einzelner Split vom Zufall abhängt.</p>
  </div>
  <div class="merk" id="ml-pipeline"><b>Merksatz</b><p>Pipeline = Schritte (Skalieren, Modell) werden zusammen behandelt, bei jedem Fold nur mit dessen Trainingsteil gelernt. Das verhindert Leakage und macht den Code sauber.</p></div>

  <h3 id="ml-fs">5 · Feature Selection</h3>
  <p>Mehr Merkmale sind nicht automatisch besser. Mit vielen Dimensionen werden Daten «dünn» und Modelle schwerer zu trainieren (<i>Curse of Dimensionality</i>). Überflüssige Merkmale erhöhen das Risiko von Overfitting und machen das Modell schwer erklärbar.</p>
  <ul>
    <li><b>Filter</b>: Merkmale nach Statistik oder Korrelation bewerten (z. B. <code>X.corr()</code>).</li>
    <li><b>Wrapper</b>: Mit einem Modell verschiedene Merkmalmengen ausprobieren.</li>
    <li><b>Embedded</b>: Die Auswahl steckt im Modell (Lasso, siehe unten).</li>
  </ul>
  <p>Im Ablauf kommt Feature Selection zweimal vor:</p>
  <ul>
    <li><b>Manuell</b> (Schritt 4): Du streichst mit Fachwissen und EDA, was nicht ins Modell gehört: IDs, Namen, Spalten mit Leakage, fast leere Spalten, Dubletten wie <code>qm</code> und <code>Zimmer</code>. Das geht vor der Vorverarbeitung.</li>
    <li><b>Automatisch</b> (Schritt 7): Filter, Wrapper oder Embedded als Schritt in der <code>Pipeline</code>, nach Auffüllen und Skalieren. So wird die Auswahl in jedem CV-Fold nur aus dessen Trainingsdaten berechnet.</li>
  </ul>
  <pre><code>from sklearn.feature_selection import SelectFromModel
pipe = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale", StandardScaler()),
    ("select", SelectFromModel(Lasso(alpha=0.1))),
    ("model", LinearRegression()),
])</code></pre>
  <pre><code>import seaborn as sns
sns.heatmap(data.corr(), annot=True, cmap="Reds")</code></pre>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Die Korrelation mit dem Preis ist bei <code>qm</code> 0,96, bei <code>Zimmer</code> 0,96 und bei <code>Lage</code> nur 0,52 (trotzdem nützlich, siehe Regularisierung). Zugleich korrelieren <code>qm</code> und <code>Zimmer</code> untereinander mit 0,996: Sie sind praktisch dasselbe Merkmal (grosse Wohnungen haben mehr Zimmer). Eines davon wegzulassen kostet fast keine Information.</p>
  <div class="falle"><b>Falle</b><p>Korrelation ist keine Ursache. Der Folienwitz mit Piraten und Erderwärmung zeigt es: Zwei Dinge können zusammen laufen, ohne dass das eine das andere verursacht.</p></div>

  <h3 id="ml-bv">6 · Bias und Variance: Under- und Overfitting</h3>
  <ul>
    <li><b>Underfitting (hoher Bias)</b>: Das Modell ist zu einfach, es verpasst das Muster. Schlecht auf Training <i>und</i> Test.</li>
    <li><b>Overfitting (hohe Variance)</b>: Das Modell lernt auch das Rauschen auswendig. Sehr gut auf Training, schlecht auf Test.</li>
  </ul>
  <p>Komplexere Modelle haben weniger Bias, aber mehr Variance. Gesucht ist der Mittelweg. Hier ein Polynom verschiedenen Grades, das Punkte einer Sinuskurve mit Rauschen anpasst:</p>

  <p class="note"><b>Mit den 10 Wohnungen:</b> Polynome verschiedenen Grades für den Preis über den qm. Jeweils RMSE auf den bekannten Wohnungen und bei fehlender Wohnung (Leave-One-Out):</p>
  <div class="tablewrap"><table>
    <tr><th>Grad</th><th class="num">bekannte Wohnungen</th><th class="num">fehlende Wohnung</th></tr>
    <tr><td>1 (Gerade)</td><td class="num">103</td><td class="num">123</td></tr>
    <tr><td>3</td><td class="num">100</td><td class="num">174</td></tr>
    <tr><td>5</td><td class="num">86</td><td class="num">2 652</td></tr>
    <tr><td>9</td><td class="num">0</td><td class="num">mehrere 100 000</td></tr>
  </table></div>
  <p>Grad 9 geht exakt durch alle 10 Punkte, der Fehler auf den bekannten Wohnungen ist 0, aber für eine neue Wohnung ist die Vorhersage unbrauchbar. Das ist Overfitting in Reinform. Grad 1 ist hier mit Abstand am besten, weil die Daten fast linear sind.</p>
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

  <h3 id="ml-reg">7 · Regularisierung</h3>
  <p>Regularisierung bremst Overfitting: Zur Fehlerfunktion kommt eine <b>Strafe für grosse Koeffizienten</b>. Die Stärke regelt ein Parameter (<code>alpha</code> bzw. λ). Grosse Koeffizienten sind das typische Zeichen eines Modells, das dem Rauschen nachrennt.</p>
  <div class="tablewrap"><table>
    <tr><th>Methode</th><th>Strafe</th><th>Wirkung</th></tr>
    <tr><td><b>Ridge</b> (L2)</td><td>Summe der quadrierten Koeffizienten</td><td>macht alle Koeffizienten kleiner; gut bei vielen korrelierten Merkmalen</td></tr>
    <tr><td><b>Lasso</b> (L1)</td><td>Summe der Beträge der Koeffizienten</td><td>setzt unwichtige Koeffizienten auf <b>exakt 0</b> (automatische Feature Selection)</td></tr>
    <tr><td><b>ElasticNet</b></td><td>L1 und L2 gemischt</td><td>Kompromiss, robuster als jedes allein</td></tr>
  </table></div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Alle drei Merkmale (qm, Zimmer, Lage) skaliert, Gewichte in CHF pro Standardabweichung. Ohne Regularisierung: <code>190 / 157 / 103</code>. Mit <b>Ridge</b> (alpha = 10) schrumpfen alle: <code>119 / 119 / 67</code>, qm und Zimmer teilen sich den Einfluss, weil sie fast dasselbe sind. Mit <b>Lasso</b> (alpha = 150) bleibt nur ein Merkmal: <code>225 / 0 / 0</code>. Zimmer fliegt raus, wie oben begründet. Aber auch Lage fällt weg, obwohl sie nützlich ist (mit Lage steigt R² von 0,93 auf 0,99): Das alpha ist zu gross. Bei alpha = 50 bleibt Lage drin (211 / 96 / 64). alpha wählst du deshalb per Cross-Validation, und eine tiefe Einzelkorrelation heisst nicht, dass ein Merkmal unwichtig ist.</p>
  <div class="merk"><b>Merksatz</b><p>Ridge schrumpft, Lasso streicht. Je grösser alpha, desto stärker die Bremse (bei sehr grossem alpha droht Underfitting).</p></div>

  <h3 id="ml-hp">8 · Hyperparameter und Modellwahl</h3>
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

  <h3 id="ml-titanic">9 · Zum Schluss: Titanic in 10 Schritten</h3>
  <p>Alles aus diesem Kapitel zusammen, an einem echten Datensatz: Wer hat die Titanic überlebt? Die Nummern sind die Schritte der <a href="#ml-ablauf">Ablauf-Grafik</a>. Das Ziel ist eine Klasse (überlebt ja oder nein), darum steht hier die logistische Regression aus dem Kapitel Klassifikation statt der linearen Regression. Der Ablauf bleibt derselbe.</p>
  <div class="box">
    <pre><code>import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

# 1 + 2 · Laden, Testset sofort wegsperren
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})
X, y = df.drop(columns=&quot;Survived&quot;), df[&quot;Survived&quot;]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
# 3 · EDA nur auf X_tr (Grafiken auf der ausführlichen Seite)
# 4 · Feature Selection (manuell): ID, Name, Ticket, Cabin raus
num, cat = [&quot;Age&quot;, &quot;Fare&quot;, &quot;SibSp&quot;, &quot;Parch&quot;], [&quot;Pclass&quot;, &quot;Sex&quot;, &quot;Embarked&quot;]
# 5 + 6 · Auffüllen, One-Hot, Skalieren; 7 · L1 als automatische Feature Selection
prep = make_column_transformer(
    (make_pipeline(SimpleImputer(strategy=&quot;median&quot;), StandardScaler()), num),
    (make_pipeline(SimpleImputer(strategy=&quot;most_frequent&quot;), OneHotEncoder(handle_unknown=&quot;ignore&quot;)), cat))
model = make_pipeline(prep, LogisticRegression(l1_ratio=1, solver=&quot;liblinear&quot;))  # vor sklearn 1.8: penalty=&quot;l1&quot;
# 8 + 9 · Cross-Validation, bestes C wählen, neu auf allen 80 % trainieren
search = GridSearchCV(model, {&quot;logisticregression__C&quot;: [0.01, 0.1, 1, 10]}, cv=5).fit(X_tr[num + cat], y_tr)
# 10 · Genau einmal auf dem Testset
print(&quot;CV-Accuracy:&quot;, round(search.best_score_, 3), &quot;| Test-Accuracy:&quot;, round(search.score(X_te[num + cat], y_te), 3))</code></pre>
    <pre class="out">CV-Accuracy: 0.803 | Test-Accuracy: 0.793</pre>
    <p class="hint">Die Test-Accuracy liegt nahe an der CV-Schätzung: Das Modell ist nicht überangepasst. Jeder Schritt mit Erklärung, EDA-Grafiken, Ausgaben und einer zweiten, ausführlicheren Version mit Random Forest: <a href="titanic.html">Titanic ausführlich</a>.</p>
  </div>
  <p class="note"><b>Mit den 10 Wohnungen:</b> Hyperparameter sind hier der Polynomgrad (1 bis 9) und bei Ridge/Lasso das alpha. Du probierst jede Einstellung aus, misst jeweils den Fehler bei fehlender Wohnung (Cross-Validation) und nimmst die beste. Beim Polynomgrad gewinnt Grad 1 (123 CHF), nicht Grad 9 (Training 0 CHF, aber mehrere 100 000 bei fehlender Wohnung). Bei echten Daten bliebe zusätzlich ein Test-Set bis zum Schluss unberührt, bei nur 10 Wohnungen verzichten wir darauf.</p>`,
    nbExercises: 'Supervised_Learning_1_Uebungen_own.ipynb',
    notebooks: [
      { file: 'Fehlende_Werte_Imputation.ipynb', desc: `Mit Cross-Validation-Beispiel (4 Folds, Imputer pro Fold neu, finales Modell). Schritt-für-Schritt-Beispiel mit 10 Datensätzen, 4 Features und SimpleImputer: Median nur am Training lernen und dann auf Validation und Test anwenden.` },
      { file: 'Workflow_Train_Val_Test_CV.ipynb', desc: `Der ganze Ablauf mit 25 Wohnungen: Split 60/20/20 von Hand (Imputer, Scaler, Modell, Validation, finales Modell, Test), danach dasselbe mit Cross-Validation und GridSearchCV, Vorverarbeitungen vergleichen (inklusive Leakage-Fehler), StratifiedKFold und TimeSeriesSplit.` },
      { file: 'Supervised_Learning_1_Uebungen_own.ipynb', desc: `10 Aufgaben mit scikit-learn: Gradient Descent, Fehlermasse, Train/Test, Cross-Validation, Imputation, Overfitting, Lasso und Ridge, GridSearch, Feature Selection.` }
    ],
    quiz: [
      { q: `Dein Modell hat Trainingsfehler 1 und Testfehler 20. Was ist los und was tust du?`, a: `Overfitting. Weniger oder einfachere Merkmale, Regularisierung (Ridge/Lasso), mehr Daten.` },
      { q: `Warum braucht man neben dem Test-Set auch ein Validation-Set?`, a: `Die Validation wird beim Feintunen mehrfach benutzt und lernt indirekt mit. Das Test-Set bleibt ungesehen und gibt am Schluss die ehrliche Schätzung.` },
      { q: `Wann nimmst du Lasso statt Ridge?`, a: `Wenn du viele Merkmale hast und vermutest, dass einige unwichtig sind: Lasso setzt deren Koeffizienten auf exakt 0.` },
      { q: `Bei 4-fold Cross-Validation: Wie oft wird trainiert, und wird das Modell dabei weiter optimiert?`, a: `4 Mal, jeweils ein neues Modell (mit neuem Imputer/Scaler) von Grund auf auf 3 Folds, bewertet auf dem 4. Fold und verworfen. Die 4 Scores bewerten das Setup. Danach wird das gewählte Setup einmal auf allen Entwicklungsdaten trainiert und einmal auf dem Test-Set geprüft.` },
      { q: `Wozu dient <code>Pipeline</code>?`, a: `Sie verkettet Schritte wie Skalieren und Modell. In der Cross-Validation wird so jeder Schritt nur mit den Trainingsdaten des jeweiligen Folds gelernt, das verhindert Leakage.` },
      { q: `Was ist der Unterschied zwischen Grid und Random Search?`, a: `Grid probiert alle Kombinationen, Random eine zufällige Auswahl. Random ist oft ähnlich gut und deutlich schneller.` },
    ],
    init() {
      (function(){
        const fig=document.querySelector('#ml .ab-fig');
        if(!fig)return;
        const panel=fig.querySelector('.ab-detail'),steps=fig.querySelectorAll('.ab-step');
        const S={
          '1':[LernApp.t('1 · Rohdaten laden','1 · Load raw data'),LernApp.t('Zuerst prüfst du, was du überhaupt hast: Zeilen und Spalten (<code>df.shape</code>), Datentypen (<code>df.info()</code>) und die ersten Zeilen (<code>df.head()</code>). Zahlen, die als Text eingelesen wurden, oder Fremdzeilen am Dateiende fallen schon hier auf.','First you check what you actually have: rows and columns (<code>df.shape</code>), data types (<code>df.info()</code>) and the first rows (<code>df.head()</code>). Numbers read in as text, or stray rows at the end of the file, already show up here.'),[[LernApp.t('Pandas-Grundlagen','Pandas basics'),'#pandas']]],
          '2':[LernApp.t('2 · Aufteilen','2 · Split'),LernApp.t('Bevor du irgendetwas auswertest, trennst du Trainings- und Testdaten (zum Beispiel 80 zu 20, bei Klassifikation mit <code>stratify</code>). Aus den 80 % werden später Training und Validierung. Der Test bleibt gesperrt, sonst fliesst sein Wissen in jede Entscheidung.','Before you analyse anything, you separate training and test data (for example 80 to 20, with <code>stratify</code> for classification). The 80 % later become training and validation. The test set stays locked, otherwise its knowledge flows into every decision.'),[['Train, Validation, Test','#ml-split'],['Data Leakage','#klass-leakage']]],
          't':[LernApp.t('Testset: gesperrt','Test set: locked'),LernApp.t('Der abgetrennte Teil (hier 20 %) wird nicht angesehen und nicht zum Entscheiden benutzt. Erst in Schritt 10 wird er genau einmal gebraucht. So bleibt das Ergebnis eine ehrliche Schätzung für neue Daten.','The separated part (here 20 %) is not looked at and not used for decisions. It is used exactly once, in step 10. That way the result stays an honest estimate for new data.'),[['Train, Validation, Test','#ml-split'],['Data Leakage','#klass-leakage']]],
          '3':[LernApp.t('3 · Daten ansehen (EDA)','3 · Explore the data (EDA)'),LernApp.t('Verteilungen und Ausreisser, Zusammenhang zwischen Merkmal und Ziel, Korrelationen, fehlende Werte. Nur auf den 80 % und ohne Modell. Daraus folgt die Strategie: Was muss gefüllt, skaliert oder umgebaut werden, welches Modell passt?','Distributions and outliers, relationship between feature and target, correlations, missing values. Only on the 80 % and without a model. This gives you the strategy: what needs to be filled, scaled or restructured, and which model fits?'),[[LernApp.t('Visualisieren','Visualisation'),'#viz'],[LernApp.t('Pandas-Grundlagen','Pandas basics'),'#pandas'],[LernApp.t('Korrelation ist keine Ursache','Correlation is not causation'),'#ml-fs']]],
          '4':[LernApp.t('4 · Feature Selection (manuell)','4 · Feature Selection (manual)'),LernApp.t('Du entscheidest selbst, mit Fachwissen und dem, was die EDA zeigt: IDs und Namen raus, Spalten raus, die das Ziel verraten (Leakage, z. B. Werte, die es erst nach dem Ereignis gibt), fast leere Spalten raus, und von zwei fast gleichen Merkmalen nur eines behalten (z. B. <code>qm</code> und <code>Zimmer</code>). Dafür braucht es noch keine aufbereiteten Daten. Vorsicht: Wer Merkmale wegen tiefer Korrelation mit dem Ziel streicht, nutzt Zielwissen, die CV-Scores werden dadurch etwas zu optimistisch.','You decide yourself, using domain knowledge and what the EDA shows: drop IDs and names, drop columns that give away the target (leakage, e.g. values that only exist after the event), drop almost empty columns, and of two almost identical features keep only one (e.g. <code>qm</code> and <code>Zimmer</code>). This does not need prepared data yet. Careful: if you drop features because of a low correlation with the target, you are using knowledge of the target, and the CV scores become somewhat too optimistic.'),[['Feature Selection','#ml-fs'],['Data Leakage','#klass-leakage']]],
          '5':[LernApp.t('5 · Vorverarbeitung festlegen','5 · Define preprocessing'),LernApp.t('Fehlende Werte füllen (Median, Mittelwert, Modus, kNN) und Kategorien in Zahlen umwandeln (One-Hot). Die Werte dafür (z. B. der Median) lernst du nur aus dem Training (<code>fit</code>) und setzt sie bei Validation und Test nur ein (<code>transform</code>).','Fill missing values (median, mean, mode, kNN) and convert categories into numbers (One-Hot). You learn the values for this (e.g. the median) from the training data only (<code>fit</code>) and just apply them to validation and test (<code>transform</code>).'),[[LernApp.t('Fehlende Werte','Missing values'),'#ml-missing'],[LernApp.t('Kategorien in Zahlen','Categories as numbers'),'#ml-cat'],['Data Leakage','#klass-leakage']]],
          '6':[LernApp.t('6 · Skalieren','6 · Scale'),LernApp.t('Standard Scaling oder Min-Max, damit Merkmale in vergleichbaren Grössenordnungen liegen. Wichtig für Gradient Descent, kNN, SVM und Regularisierung, unnötig für Bäume. Auch der Skaler wird nur auf den Trainingsdaten angepasst.','Standard Scaling or Min-Max, so that features are on comparable scales. Important for Gradient Descent, kNN, SVM and regularisation, unnecessary for trees. The scaler is also fitted on the training data only.'),[[LernApp.t('Skalieren','Scaling'),'#ml-scaling'],['Pipeline','#ml-pipeline']]],
          '7':[LernApp.t('7 · Feature Selection (automatisch, optional)','7 · Feature Selection (automatic, optional)'),LernApp.t('Optional: Bei wenigen Merkmalen, bei Bäumen oder mit Lasso (wählt selbst aus) kannst du den Schritt weglassen. Mehr Merkmale sind nicht automatisch besser (Curse of Dimensionality). Hier entscheidet ein Verfahren: <b>Filter</b> bewerten Merkmale per Statistik, z. B. Korrelation oder F-Test mit dem Ziel (ein Varianz-Filter gehört vor das Skalieren, danach hat jedes Merkmal Varianz 1), <b>Wrapper</b> probieren Merkmalmengen mit einem Modell aus (RFE), <b>Embedded</b> steckt im Modell (Lasso, Baum-Wichtigkeit). Das kommt nach Auffüllen und Skalieren: Die meisten Verfahren laufen nicht mit fehlenden Werten, und Lasso bestraft unskalierte Merkmale ungleich. Als Schritt in der <code>Pipeline</code> wird die Auswahl in jedem CV-Fold nur aus dessen Trainingsdaten berechnet.','Optional: with few features, with trees or with Lasso (which selects by itself) you can skip this step. More features are not automatically better (Curse of Dimensionality). Here a method decides: <b>Filter</b> methods rate features by statistics, e.g. correlation or F-test with the target (a variance filter belongs before scaling, after it every feature has variance 1), <b>Wrapper</b> methods try out feature sets with a model (RFE), <b>Embedded</b> selection is built into the model (Lasso, tree importance). This comes after filling and scaling: most methods do not run with missing values, and Lasso penalises unscaled features unequally. As a step in the <code>Pipeline</code>, the selection is computed in each CV fold from that fold\'s training data only.'),[['Feature Selection','#ml-fs'],[LernApp.t('Lasso und Ridge','Lasso and Ridge'),'#ml-reg'],['Pipeline','#ml-pipeline']]],
          '8':[LernApp.t('8 · Trainieren und validieren','8 · Train and validate'),LernApp.t('Das Modell lernt auf dem Training und wird auf der Validierung gemessen, entweder mit einem Split (75 zu 25) oder mit k-facher Cross-Validation. In der Schleife probierst du Hyperparameter durch. Ein grosser Abstand zwischen Training und Validierung zeigt Overfitting.','The model learns on the training data and is measured on the validation data, either with a split (75 to 25) or with k-fold Cross-Validation. In the loop you try out hyperparameters. A large gap between training and validation shows Overfitting.'),[['Cross-Validation','#ml-split'],[LernApp.t('Bias und Variance','Bias and Variance'),'#ml-bv'],[LernApp.t('Hyperparameter','Hyperparameters'),'#ml-hp'],[LernApp.t('Klassifikations-Modelle','Classification models'),'#klass-modelle']]],
          '9':[LernApp.t('9 · Bestes Modell wählen','9 · Choose the best model'),LernApp.t('Gewählt wird nach der Validierung, nie nach dem Test. Danach trainierst du das beste Modell mit den besten Einstellungen noch einmal auf allen 80 % (Training und Validierung zusammen), weil mehr Daten helfen.','You choose based on the validation, never on the test. Then you train the best model with the best settings once more on all 80 % (training and validation together), because more data helps.'),[[LernApp.t('Hyperparameter und Modellwahl','Hyperparameters and model choice'),'#ml-hp'],['Train, Validation, Test','#ml-split']]],
          '10':[LernApp.t('10 · Einmal auf Testset bewerten','10 · Evaluate once on the test set'),LernApp.t('Genau ein einziges Mal, mit den Werten aus dem Training (<code>transform</code>, kein neues <code>fit</code>). Das Ergebnis ist die ehrliche Schätzung für neue Daten. Bei Klassifikation schaust du Accuracy, Precision, Recall und ROC an. Wird danach nochmal getunt, ist der Test verbraucht.','Exactly once, with the values from training (<code>transform</code>, no new <code>fit</code>). The result is the honest estimate for new data. For classification you look at Accuracy, Precision, Recall and ROC. If you tune again afterwards, the test set is used up.'),[[LernApp.t('Metriken und ROC','Metrics and ROC'),'#klass-metriken'],['Data Leakage','#klass-leakage'],[LernApp.t('Titanic ausführlich','Titanic in detail'),'titanic.html']]]
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
          s+='<text class="lbl" x="'+(W-24)+'" y="222">'+LernApp.t('qm','m²')+'</text><text class="lbl" x="'+(PX+4)+'" y="12">'+LernApp.t('Preis (CHF)','Price (CHF)')+'</text>';
          if(!all){s+='<line class="ln" x1="'+sx(25)+'" y1="'+sy(c[0]+c[1]*25)+'" x2="'+sx(135)+'" y2="'+sy(c[0]+c[1]*135)+'"/>'}
          pr.forEach((y,i)=>{s+='<line class="res" x1="'+sx(qm[i])+'" y1="'+sy(y)+'" x2="'+sx(qm[i])+'" y2="'+sy(pred[i])+'"/>'});
          pr.forEach((y,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(y)+'" r="'+(2+zi[i]*1.6).toFixed(1)+'" style="fill:var(--accent);opacity:'+(0.2+la[i]*0.16).toFixed(2)+';stroke:var(--accent)"/>'});
          if(all)pred.forEach((q,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(q)+'" r="3.2" style="fill:var(--bg);stroke:var(--fg);stroke-width:1.5"/>'});
          $('whSvg').innerHTML=s;$('whR2').textContent=fmt(1-sse/sst,3);$('whMae').textContent=fmt(sae/n,0);
          const z=ols(cols.map(std)),names=[LernApp.t('qm','m²'),LernApp.t('Zimmer','rooms'),LernApp.t('Lage','location')];
          let t=LernApp.t('<tr><th>Merkmal</th><th>Roh</th><th>Skaliert</th></tr>','<tr><th>Feature</th><th>Raw</th><th>Scaled</th></tr>');
          cols.forEach((_,j)=>{t+='<tr><td>'+names[j]+'</td><td>'+fmt(c[j+1],1)+LernApp.t(' CHF/Einh.</td><td><b>',' CHF/unit</td><td><b>')+fmt(z[j+1],0)+'</b></td></tr>'});
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
            [[LernApp.t('qm','m²'),P(1,-1,-1)],[LernApp.t('Zimmer','rooms'),P(-1,1,-1)],[LernApp.t('Preis','price'),P(-1,-1,1)]].forEach(a=>{
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
          const X=[qm,zi,la].map(std),y=pr.map(v=>v/1000),names=[LernApp.t('qm','m²'),LernApp.t('Zimmer','rooms'),LernApp.t('Lage','location')];
          const tgt=ols(X).slice(1).map(v=>v/1000),tb=ols(X)[0]/1000;
          let w,b,hist,timer=null;
          const mseOf=()=>{let t=0;for(let i=0;i<n;i++){let p=b;for(let j=0;j<3;j++)p+=w[j]*X[j][i];t+=(y[i]-p)**2}return t/n};
          function reset(){if(timer){clearInterval(timer);timer=null;$('ftRun').textContent=LernApp.t('Lernen (Animation)','Learn (animation)')}w=[0,0,0];b=0;hist=[mseOf()];draw()}
          function step(){const lr=+$('ftLr').value,g=[0,0,0];let gb=0;
            for(let i=0;i<n;i++){let p=b;for(let j=0;j<3;j++)p+=w[j]*X[j][i];const e=p-y[i];gb+=2*e/n;for(let j=0;j<3;j++)g[j]+=2*e*X[j][i]/n}
            b-=lr*gb;for(let j=0;j<3;j++)w[j]-=lr*g[j];hist.push(mseOf())}
          function draw(){
            $('ftLrO').textContent=fmt(+$('ftLr').value,2);
            const m=hist[hist.length-1],bad=!isFinite(m)||m>1e6;
            $('ftN').textContent=hist.length-1;$('ftMse').textContent=bad?LernApp.t('explodiert','exploded'):fmt(m,4);
            const Z=195,sc=300,cl=v=>Math.max(-125,Math.min(125,v*sc));let s='';
            s+=LernApp.t('<text class="lbl" x="4" y="12">Gewichte (skaliert)</text><line class="ax" x1="','<text class="lbl" x="4" y="12">Weights (scaled)</text><line class="ax" x1="')+Z+'" y1="18" x2="'+Z+'" y2="104"/>';
            names.forEach((nm,j)=>{const yy=34+j*28,v=bad?0:w[j];
              s+='<text class="lbl" x="4" y="'+(yy+4)+'">'+nm+'</text>';
              s+='<rect x="'+(v>=0?Z:Z+cl(v))+'" y="'+(yy-8)+'" width="'+Math.abs(cl(v))+'" height="16" style="fill:var(--accent);opacity:.75"/>';
              s+='<line x1="'+(Z+cl(tgt[j]))+'" y1="'+(yy-12)+'" x2="'+(Z+cl(tgt[j]))+'" y2="'+(yy+12)+'" style="stroke:var(--fg);stroke-width:2"/>';
              s+='<text class="lbl" x="'+(Z+cl(Math.max(v,tgt[j]))+6)+'" y="'+(yy+4)+'">'+fmt(v,3)+'</text>'});
            s+=LernApp.t('<text class="lbl" x="4" y="136">Fehler (MSE) pro Schritt, Skala gestaucht</text>','<text class="lbl" x="4" y="136">Error (MSE) per step, compressed scale</text>');
            const x0=30,x1=312,y0=145,y1=252,N=Math.max(hist.length-1,10),top=Math.max(hist[0],1e-9);
            s+='<line class="ax" x1="'+x0+'" y1="'+y1+'" x2="'+x1+'" y2="'+y1+'"/><line class="ax" x1="'+x0+'" y1="'+y0+'" x2="'+x0+'" y2="'+y1+'"/>';
            s+='<text class="lbl" x="2" y="'+(y0+8)+'">'+fmt(top,1)+'</text><text class="lbl" x="12" y="'+(y1)+'">0</text><text class="lbl" x="'+(x1-80)+'" y="'+(y1+14)+LernApp.t('">Schritte: ','">Steps: ')+N+'</text>';
            let d='';hist.forEach((v,i)=>{const yy=y1-Math.sqrt(Math.min(Math.max(v,0),top*1.05)/top)*(y1-y0);d+=(i?'L':'M')+(x0+i/N*(x1-x0)).toFixed(1)+' '+yy.toFixed(1)});
            s+='<path class="ln" d="'+d+'"/>';
            $('ftSvg').innerHTML=s;
            $('ftEq').innerHTML=bad?LernApp.t('<b>Die Schrittgrösse ist zu gross:</b> Jeder Schritt schiesst über das Minimum hinaus, der Fehler wächst. Setze zurück und wähle einen kleineren Wert.','<b>The step size is too large:</b> every step overshoots the minimum, the error grows. Reset and choose a smaller value.'):
              LernApp.t('Aktuell: Preis = <b>','Current: price = <b>')+fmt(b,2)+'</b> + <b>'+fmt(w[0],3)+LernApp.t('</b>·qm + <b>','</b>·m² + <b>')+fmt(w[1],3)+LernApp.t('</b>·Zimmer + <b>','</b>·rooms + <b>')+fmt(w[2],3)+LernApp.t('</b>·Lage (Merkmale skaliert, Preis in 1000 CHF). Ziel: ','</b>·location (features scaled, price in 1000 CHF). Target: ')+fmt(tb,2)+' + '+fmt(tgt[0],3)+LernApp.t('·qm + ','·m² + ')+fmt(tgt[1],3)+LernApp.t('·Zimmer + ','·rooms + ')+fmt(tgt[2],3)+LernApp.t('·Lage.','·location.')}
          $('ftStep').addEventListener('click',()=>{step();draw()});
          $('ftRun').addEventListener('click',()=>{
            if(timer){clearInterval(timer);timer=null;$('ftRun').textContent=LernApp.t('Lernen (Animation)','Learn (animation)');return}
            $('ftRun').textContent=LernApp.t('Stopp','Stop');
            timer=setInterval(()=>{for(let k=0;k<6;k++)step();draw();
              if(hist.length>4000||!isFinite(hist[hist.length-1])||hist[hist.length-1]>1e6||Math.abs(hist[hist.length-2]-hist[hist.length-1])<1e-11){clearInterval(timer);timer=null;$('ftRun').textContent=LernApp.t('Lernen (Animation)','Learn (animation)')}},40)});
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
          s+='<text class="lbl" x="'+(sx(0)+4)+'" y="'+(H-3)+LernApp.t('">Tal bei x=0</text><path class="ln" d="','">valley at x=0</text><path class="ln" d="')+curve+'"/>';
          const vis=path.filter(p=>Math.abs(p)<=5);
          for(let i=1;i<vis.length;i++)s+='<line class="dash" x1="'+sx(vis[i-1])+'" y1="'+sy(vis[i-1]**2)+'" x2="'+sx(vis[i])+'" y2="'+sy(vis[i]**2)+'"/>';
          vis.forEach((p,i)=>{const last=(p===x&&i===vis.length-1);s+='<circle cx="'+sx(p)+'" cy="'+sy(p*p)+'" r="'+(last?6:3.5)+'" style="fill:'+(last?'var(--warn)':'var(--fg)')+'"/>'});
          $('gdSvg').innerHTML=s;$('gdN').textContent=n;
          const out=Math.abs(x)>5;$('gdX').textContent=out?(Math.abs(x)>1e4?LernApp.t('sehr gross','very large'):fmt(x,2)):fmt(x,3);$('gdY').textContent=Math.abs(x)>1e2?LernApp.t('riesig','huge'):fmt(x*x,3);
          let m;if(n===0)m=LernApp.t('Start bei x = -4. Orange ist die aktuelle Position.','Start at x = -4. Orange is the current position.');
          else if(Math.abs(x)>5)m=LernApp.t('Der Punkt ist über den Rand hinaus gesprungen: Die Lernrate ist zu gross, die Werte wachsen immer weiter (Divergenz).','The point has jumped past the edge: the learning rate is too large, the values keep growing (divergence).');
          else if(lr===1)m=LernApp.t('Bei Lernrate 1 springt der Punkt immer zwischen -x und +x, ohne anzukommen.','With learning rate 1 the point keeps jumping between -x and +x without arriving.');
          else if(Math.abs(x)<0.01)m=LernApp.t('Angekommen: x ist praktisch 0, das Minimum ist gefunden (Konvergenz).','Arrived: x is practically 0, the minimum has been found (convergence).');
          else m=LernApp.t('Jeder Schritt bringt dich näher ans Tal. Bei kleiner Lernrate dauert es länger.','Every step brings you closer to the valley. With a small learning rate it takes longer.');
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
          if(d<bestD&&te[d-1]>2*minTe)m=LernApp.t('Zu einfach: Die Kurve verpasst das Muster. Beide Fehler sind hoch (Underfitting, hoher Bias).','Too simple: the curve misses the pattern. Both errors are high (Underfitting, high bias).');
          else if(d>bestD&&te[d-1]>1.5*minTe)m=LernApp.t('Zu komplex: Die Kurve folgt dem Rauschen der 10 Punkte. Trainingsfehler tief, Testfehler deutlich höher (Overfitting, hohe Variance).','Too complex: the curve follows the noise of the 10 points. Training error low, test error clearly higher (Overfitting, high variance).');
          else m=LernApp.t('Guter Bereich: Die Kurve fängt das Muster, ohne dem Rauschen nachzulaufen.','Good range: the curve captures the pattern without chasing the noise.');
          $('bvMsg').textContent=m+LernApp.t(' Gestrichelt: die wahre Sinuskurve (sieht das Modell nicht).',' Dashed: the true sine curve (the model does not see it).');
          const EW=320,EH=150,EM=Math.max.apply(null,te.concat(tr).filter(v=>v<1.0).concat([0.5])),ex2=i=>30+(i/8)*(EW-45),ey2=v=>EH-22-(Math.min(v,EM)/EM)*(EH-36);
          let g='<line class="ax" x1="30" y1="'+(EH-22)+'" x2="'+(EW-10)+'" y2="'+(EH-22)+'"/>';
          for(let k=1;k<=9;k++)g+='<text class="lbl" x="'+(ex2(k-1)-3)+'" y="'+(EH-8)+'">'+k+'</text>';
          g+=LernApp.t('<text class="lbl" x="30" y="10">Fehler (MSE), oben abgeschnitten bei ','<text class="lbl" x="30" y="10">Error (MSE), cut off at the top at ')+fmt(EM,2)+'</text>';
          const path=a=>a.map((v,i)=>(i?'L':'M')+ex2(i).toFixed(1)+' '+ey2(v).toFixed(1)).join('');
          g+='<path class="ln" d="'+path(tr)+'"/><path class="ln2" d="'+path(te)+'"/>';
          g+='<line class="dash" x1="'+ex2(d-1)+'" y1="14" x2="'+ex2(d-1)+'" y2="'+(EH-22)+'"/>';
          $('bvErr').innerHTML=g}
        $('bvDeg').addEventListener('input',draw);draw()})();
      (function(){
        const r=mulberry32(11),f=x=>Math.sin(Math.PI*(x+1)),N=30,KS=[3,5,10];
        const px=[],py=[];for(let i=0;i<N;i++){const x=r()*2-1;px.push(x);py.push(f(x)+0.3*gauss(r))}
        const perm=[...Array(N).keys()];for(let i=N-1;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
        const fold=new Array(N);perm.forEach((idx,pos)=>{fold[idx]=pos});
        const W=320,H=220,YMIN=-2,YMAX=2,sx=x=>8+((x+1)/2)*(W-16),sy=y=>H-8-((Math.max(YMIN,Math.min(YMAX,y))-YMIN)/(YMAX-YMIN))*(H-16);
        const avg=a=>a.reduce((p,c)=>p+c,0)/a.length;
        // One CV run: new scaler and new polynomial, learned on the training points only
        function run(k,deg,i){const tr=[],te=[];for(let j=0;j<N;j++)((fold[j]%k)===i?te:tr).push(j);
          const m=avg(tr.map(j=>px[j])),sd=Math.sqrt(avg(tr.map(j=>(px[j]-m)**2))),z=x=>(x-m)/sd;
          const c=polyFit(tr.map(j=>z(px[j])),tr.map(j=>py[j]),deg);
          const err=te.reduce((t,j)=>t+(polyEval(c,z(px[j]))-py[j])**2,0)/te.length;
          return{tr:tr,te:te,m:m,sd:sd,c:c,z:z,err:err}}
        function draw(){const k=KS[+$('cvK').value],deg=+$('cvDeg').value;
          $('cvRun').max=k;if(+$('cvRun').value>k)$('cvRun').value=k;const sel=+$('cvRun').value-1;
          $('cvKO').textContent=k;$('cvDegO').textContent=deg;$('cvRunO').textContent=(sel+1)+' / '+k;
          const runs=[];for(let i=0;i<k;i++)runs.push(run(k,deg,i));const R=runs[sel];
          let a='';const bw=(W-16)/k;
          for(let i=0;i<k;i++){a+='<rect x="'+(8+i*bw).toFixed(1)+'" y="6" width="'+(bw-2).toFixed(1)+'" height="24" rx="3" style="fill:'+(i===sel?'var(--warn-soft)':'var(--accent-soft)')+';stroke:'+(i===sel?'var(--warn)':'var(--accent)')+'"/>';
            if(k<=5)a+='<text class="lbl" x="'+(8+i*bw+bw/2-10).toFixed(1)+'" y="22">'+(i===sel?'Test':'Train')+'</text>'}
          a+='<text class="lbl" x="8" y="40">Fold '+(sel+1)+LernApp.t(' von ',' of ')+k+LernApp.t(' ist der Test-Fold (orange), alle anderen trainieren.</text>',' is the test fold (orange), all others train.</text>');
          $('cvStrip').innerHTML=a;
          let g='<line class="ax" x1="0" y1="'+sy(0)+'" x2="'+W+'" y2="'+sy(0)+'"/>';
          let tp='',cp='';for(let i=0;i<=100;i++){const x=-1+i*0.02;tp+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(f(x)).toFixed(1);cp+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(polyEval(R.c,R.z(x))).toFixed(1)}
          g+='<path class="dash" d="'+tp+'"/><path class="ln" d="'+cp+'"/>';
          R.tr.forEach(j=>{g+='<circle class="pt" cx="'+sx(px[j])+'" cy="'+sy(py[j])+'" r="4"/>'});
          R.te.forEach(j=>{g+='<circle cx="'+sx(px[j])+'" cy="'+sy(py[j])+'" r="5" style="fill:var(--bg);stroke:var(--warn);stroke-width:2"/>'});
          $('cvSvg').innerHTML=g;
          $('cvMu').textContent=fmt(R.m,2);$('cvSd').textContent=fmt(R.sd,2);$('cvMse').textContent=fmt(R.err,3);
          const errs=runs.map(q=>q.err),mean=avg(errs),sdv=Math.sqrt(avg(errs.map(v=>(v-mean)**2)));
          const EH=150,top=Math.max.apply(null,errs.concat([mean*1.2,0.1])),by=v=>EH-24-(v/top)*(EH-44),bw2=(W-30)/k;
          let b='<line class="ax" x1="20" y1="'+(EH-24)+'" x2="'+(W-8)+'" y2="'+(EH-24)+LernApp.t('"/><text class="lbl" x="20" y="10">Fehler (MSE) je Lauf, max ','"/><text class="lbl" x="20" y="10">Error (MSE) per run, max ')+fmt(top,2)+'</text>';
          errs.forEach((v,i)=>{b+='<rect x="'+(22+i*bw2).toFixed(1)+'" y="'+by(v).toFixed(1)+'" width="'+(bw2-3).toFixed(1)+'" height="'+(EH-24-by(v)).toFixed(1)+'" style="fill:'+(i===sel?'var(--accent)':'var(--accent-soft)')+';stroke:var(--accent)"/>';
            if(k<=5)b+='<text class="lbl" x="'+(22+i*bw2+bw2/2-3).toFixed(1)+'" y="'+(EH-10)+'">'+(i+1)+'</text>'});
          b+='<line class="dash" x1="20" y1="'+by(mean)+'" x2="'+(W-8)+'" y2="'+by(mean)+'"/>';
          $('cvBars').innerHTML=b;$('cvMean').textContent=fmt(mean,3);$('cvStd').textContent=fmt(sdv,3);
          $('cvMsg').textContent=LernApp.t('Bester Lauf: Fehler ','Best run: error ')+fmt(Math.min.apply(null,errs),3)+LernApp.t(', schlechtester: ',', worst: ')+fmt(Math.max.apply(null,errs),3)+LernApp.t('. Mit nur einem Split hättest du je nach Glück irgendeinen dieser Werte erhalten. Der Mittelwert ','. With a single split you would have got any one of these values, depending on luck. The mean ')+fmt(mean,3)+LernApp.t(' ist die stabilere Aussage. Probiere Grad 1, 3 und 9: Bei hohem Grad wird der CV-Fehler gross und die Läufe streuen stark (Overfitting).',' is the more stable statement. Try degree 1, 3 and 9: at a high degree the CV error gets large and the runs vary a lot (Overfitting).')}
        ['cvK','cvDeg','cvRun'].forEach(id=>$(id).addEventListener('input',draw));draw()})();
    },
  });
})();
