/* Demos of the «Supervised ML» chapter. modules/ml.js calls LernApp.demos.ml() once the chapter is in the page. */
(function () {
  const { $, fmt, mulberry32, gauss } = LernApp;
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

  LernApp.demos.ml = function () {
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
        const big=v=>v<1000?fmt(v,3):fmt(v,0);
        // All three messages sit on top of each other so the box keeps the height of the longest one and nothing below it jumps.
        const SUFFIX=LernApp.t(' Gestrichelt: die wahre Sinuskurve (sieht das Modell nicht).',' Dashed: the true sine curve (the model does not see it).');
        const msgs=[LernApp.t('Zu einfach: Die Kurve verpasst das Muster. Beide Fehler sind hoch (Underfitting, hoher Bias).','Too simple: the curve misses the pattern. Both errors are high (Underfitting, high bias).'),LernApp.t('Zu komplex: Die Kurve folgt dem Rauschen der 10 Punkte. Trainingsfehler tief, Testfehler deutlich höher (Overfitting, hohe Variance).','Too complex: the curve follows the noise of the 10 points. Training error low, test error clearly higher (Overfitting, high variance).'),LernApp.t('Guter Bereich: Die Kurve fängt das Muster, ohne dem Rauschen nachzulaufen.','Good range: the curve captures the pattern without chasing the noise.')].map(x=>x+SUFFIX);
        $('bvMsg').style.display='grid';$('bvMsg').innerHTML=msgs.map(()=>'<span style="grid-area:1/1"></span>').join('');
        const msgEls=[].slice.call($('bvMsg').children);msgEls.forEach((el,i)=>{el.textContent=msgs[i]});
        $('bvLeg').innerHTML='<span><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4" style="fill:var(--fg)"/></svg> '+LernApp.t('Training (10 Punkte)','Training (10 points)')+'</span><span><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="3" style="fill:var(--warn);opacity:.7"/></svg> '+LernApp.t('Test (60 neue Punkte, orange)','Test (60 new points, orange)')+'</span><span><svg width="22" height="12" aria-hidden="true"><line class="dash" x1="0" y1="6" x2="22" y2="6"/></svg> '+LernApp.t('wahre Kurve','true curve')+'</span>';
        const W=320,H=220,YMIN=-2,YMAX=2;const sx=x=>8+((x+1)/2)*(W-16),sy=y=>H-8-((Math.max(YMIN,Math.min(YMAX,y))-YMIN)/(YMAX-YMIN))*(H-16);
        function draw(){const d=+$('bvDeg').value;$('bvDegO').textContent=d;const c=coefs[d-1];
          let s='<line class="ax" x1="0" y1="'+sy(0)+'" x2="'+W+'" y2="'+sy(0)+'"/>';
          let tp='',cp='';for(let i=0;i<=100;i++){const x=-1+i*0.02,xo=(x+1)/2;tp+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(f(xo)).toFixed(1);cp+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(polyEval(c,x)).toFixed(1)}
          s+='<path class="dash" d="'+tp+'"/><path class="ln" d="'+cp+'"/>';
          for(let i=0;i<ex.length;i++)s+='<circle cx="'+sx(ex[i])+'" cy="'+sy(ey[i])+'" r="2.5" style="fill:var(--warn);opacity:.6"/>';
          for(let i=0;i<tx.length;i++)s+='<circle class="pt" cx="'+sx(tx[i])+'" cy="'+sy(ty[i])+'" r="4"/>';
          $('bvSvg').innerHTML=s;$('bvTr').textContent=big(tr[d-1]);$('bvTe').textContent=big(te[d-1]);
          const minTe=Math.min.apply(null,te),bestD=te.indexOf(minTe)+1;
          const k=d<bestD&&te[d-1]>2*minTe?0:d>bestD&&te[d-1]>1.5*minTe?1:2;
          msgEls.forEach((el,i)=>{el.style.visibility=i===k?'visible':'hidden'});
          const EW=320,EH=150,EM=Math.max.apply(null,te.concat(tr).filter(v=>v<1.0).concat([0.5])),ex2=i=>30+(i/8)*(EW-45),ey2=v=>EH-22-(Math.min(v,EM)/EM)*(EH-36);
          let g='<line class="ax" x1="30" y1="'+(EH-22)+'" x2="'+(EW-10)+'" y2="'+(EH-22)+'"/>';
          for(let k=1;k<=9;k++)g+='<text class="lbl" x="'+(ex2(k-1)-3)+'" y="'+(EH-8)+'">'+k+'</text>';
          g+=LernApp.t('<text class="lbl" x="30" y="10">Fehler (MSE), oben abgeschnitten bei ','<text class="lbl" x="30" y="10">Error (MSE), cut off at the top at ')+fmt(EM,2)+'</text>';
          const path=a=>a.map((v,i)=>(i?'L':'M')+ex2(i).toFixed(1)+' '+ey2(v).toFixed(1)).join('');
          g+='<path class="ln" d="'+path(tr)+'"/><path class="ln2" d="'+path(te)+'"/>';
          g+='<line class="dash" x1="'+ex2(d-1)+'" y1="14" x2="'+ex2(d-1)+'" y2="'+(EH-22)+'"/>';
          $('bvErr').innerHTML=g}
        $('bvDeg').addEventListener('input',draw);draw()})();
      // Cross-validation: 10 fixed test points that stay locked, the other 30 are split into k folds.
      // Every run learns a new scaler and polynomial on k-1 folds and measures the error on the remaining fold (validation).
      (function(){
        const t=LernApp.t,f=x=>Math.sin(Math.PI*(x+1)),r=mulberry32(11),KS=[3,5,10],NTEST=10;
        const pts=[...Array(40)].map(()=>{const x=r()*2-1;return{x:x,y:f(x)+0.3*gauss(r)}});
        const test=pts.slice(0,NTEST),dev=pts.slice(NTEST);
        const W=320,H=220,YMAX=2,sx=x=>8+((x+1)/2)*(W-16),sy=y=>H-8-((Math.max(-YMAX,Math.min(YMAX,y))+YMAX)/(2*YMAX))*(H-16);
        const avg=a=>a.reduce((p,c)=>p+c,0)/a.length;
        // New scaler and polynomial, learned on `train` only.
        function fitOn(train,deg){
          const m=avg(train.map(p=>p.x)),sd=Math.sqrt(avg(train.map(p=>(p.x-m)**2))),z=x=>(x-m)/sd;
          const c=polyFit(train.map(p=>z(p.x)),train.map(p=>p.y),deg),at=x=>polyEval(c,z(x));
          return{m:m,sd:sd,at:at,mse:ps=>avg(ps.map(p=>(at(p.x)-p.y)**2))}}
        function run(k,deg,i){
          const val=dev.filter((p,j)=>j%k===i),model=fitOn(dev.filter((p,j)=>j%k!==i),deg);
          return{val:val,model:model,err:model.mse(val)}}
        const box=(x,w,c,label,dash,y,h,op)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="3" style="fill:var(--'+c+'-soft);stroke:var(--'+c+')'+(dash?';stroke-dasharray:4 3':'')+(op<1?';opacity:'+op:'')+'"/>'
          +(label?'<text class="lbl" x="'+(x+w/2)+'" y="'+(y+h/2+3.5)+'" text-anchor="middle"'+(op<1?' style="opacity:'+op+'"':'')+'>'+label+'</text>':'');
        const circle=(p,style,rad)=>'<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="'+rad+'" style="'+style+'"/>';
        const curve=g=>{let d='';for(let i=0;i<=100;i++){const x=-1+i*0.02;d+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(g(x)).toFixed(1)}return d};
        const swatch=svg=>'<svg width="22" height="12" aria-hidden="true">'+svg+'</svg> ';
        $('cvLeg').innerHTML='<span>'+swatch('<circle cx="11" cy="6" r="4" style="fill:var(--fg)"/>')+t('Training','Training')+'</span>'
          +'<span>'+swatch('<circle cx="11" cy="6" r="4.5" style="fill:none;stroke:var(--ok);stroke-width:2"/>')+t('Validierung (dieser Lauf)','Validation (this run)')+'</span>'
          +'<span>'+swatch('<circle cx="11" cy="6" r="3" style="fill:var(--warn);opacity:.7"/>')+t('Test (fest, gesperrt)','Test (fixed, locked)')+'</span>';
        function draw(){
          const k=KS[+$('cvK').value],deg=+$('cvDeg').value;
          $('cvRun').max=k;if(+$('cvRun').value>k)$('cvRun').value=k;
          const sel=+$('cvRun').value-1,last=sel===k-1,runs=[...Array(k).keys()].map(i=>run(k,deg,i)),R=runs[sel];
          $('cvKO').textContent=k;$('cvDegO').textContent=deg;$('cvRunO').textContent=(sel+1)+' / '+k;
          // Overview like in the scikit-learn guide: all data = training part (k folds) + locked test part;
          // one row per run with its validation fold, the current run in full colour; the test is evaluated once at the end.
          const TW=64,bw=(W-16-TW-8)/k,RH=k>5?13:18,y0=26,yEnd=y0+k*RH+4,tx=W-8-TW,nums=k<=5;
          $('cvStrip').setAttribute('viewBox','0 0 '+W+' '+(yEnd+22));
          $('cvStrip').innerHTML=box(8,k*bw-2,'accent','Training + Validation (30)',0,4,16)+box(tx,TW,'warn','Test (10)',true,4,16)
            +runs.map((q,i)=>[...Array(k).keys()].map(j=>box(8+j*bw,bw-2,j===i?'ok':'accent',nums?(j===i?'Val ':'Fold ')+(j+1):j+1,0,y0+i*RH,RH-3,i===sel?1:0.3)).join('')).join('')
            +'<text class="lbl" x="8" y="'+(yEnd+15)+'">'+t('Endauswertung, einmal','Final evaluation, once')+'</text>'+box(tx,TW,'warn','Test',true,yEnd,18,last?1:0.3);
          $('cvStripMsg').textContent=t('Lauf '+(sel+1)+' von '+k+': Fold '+(sel+1)+' ist die Validierung (grün), die anderen Folds trainieren. Der Test (orange) bleibt in jedem Lauf gleich und gesperrt.',
            'Run '+(sel+1)+' of '+k+': fold '+(sel+1)+' is the validation (green), the other folds train. The test (orange) stays the same in every run and stays locked.');
          let g='<line class="ax" x1="0" y1="'+sy(0)+'" x2="'+W+'" y2="'+sy(0)+'"/><path class="dash" d="'+curve(f)+'"/><path class="ln" d="'+curve(R.model.at)+'"/>';
          test.forEach(p=>{g+=circle(p,'fill:var(--warn);opacity:.7',3)});
          dev.forEach((p,j)=>{g+=j%k===sel?circle(p,'fill:none;stroke:var(--ok);stroke-width:2',5):circle(p,'fill:var(--fg)',4)});
          $('cvSvg').innerHTML=g;
          $('cvMu').textContent=fmt(R.model.m,2);$('cvSd').textContent=fmt(R.model.sd,2);$('cvMse').textContent=fmt(R.err,3);
          // Bars: runs up to the selected one are done; later runs are still open (faint).
          const done=runs.slice(0,sel+1).map(q=>q.err),mean=avg(done),sdv=Math.sqrt(avg(done.map(v=>(v-mean)**2)));
          const EH=150,top=Math.max(...runs.map(q=>q.err),0.1),by=v=>EH-24-(v/top)*(EH-44),bw2=(W-30)/k;
          let b='<line class="ax" x1="20" y1="'+(EH-24)+'" x2="'+(W-8)+'" y2="'+(EH-24)+'"/><text class="lbl" x="20" y="10">'+t('Validierungsfehler (MSE) je Lauf, max ','Validation error (MSE) per run, max ')+fmt(top,2)+'</text>';
          runs.forEach((q,i)=>{const x=22+i*bw2,open=i>sel;
            b+='<rect x="'+x.toFixed(1)+'" y="'+by(q.err).toFixed(1)+'" width="'+(bw2-3).toFixed(1)+'" height="'+(EH-24-by(q.err)).toFixed(1)+'" style="fill:'+(i===sel?'var(--accent)':'var(--accent-soft)')+';stroke:var(--accent);opacity:'+(open?0.3:1)+(open?';stroke-dasharray:3 3':'')+'"/>';
            if(k<=5)b+='<text class="lbl" x="'+(x+bw2/2-3).toFixed(1)+'" y="'+(EH-10)+'">'+(i+1)+'</text>'});
          b+='<line class="dash" x1="20" y1="'+by(mean)+'" x2="'+(W-8)+'" y2="'+by(mean)+'"/>';
          $('cvBars').innerHTML=b;
          $('cvMean').textContent=fmt(mean,3);$('cvStd').textContent=sel?fmt(sdv,3):'–';
          // The test is used once, after the last run: final model on all 30 development points.
          $('cvTest').textContent=last?fmt(fitOn(dev,deg).mse(test),3):t('gesperrt','locked');
          $('cvMsg').textContent=last
            ?t('Alle '+k+' Läufe sind fertig. Der CV-Fehler '+fmt(mean,3)+' bewertet diese Einstellung (Grad '+deg+'). Erst jetzt wird das Endmodell, neu auf allen 30 Punkten trainiert, einmal auf dem Test geprüft. Mit dem Test-Fehler wählst du nicht mehr aus, du berichtest ihn nur.',
              'All '+k+' runs are done. The CV error '+fmt(mean,3)+' rates this setting (degree '+deg+'). Only now is the final model, retrained on all 30 points, checked once on the test. You no longer choose with the test error, you only report it.')
            :t('Nach Lauf '+(sel+1)+' von '+k+': Mittelwert der bisherigen Validierungsfehler '+fmt(mean,3)+'. Der Test bleibt gesperrt, bis alle '+k+' Läufe gemacht sind.',
              'After run '+(sel+1)+' of '+k+': mean of the validation errors so far '+fmt(mean,3)+'. The test stays locked until all '+k+' runs are done.');
        }
        ['cvK','cvDeg','cvRun'].forEach(id=>$(id).addEventListener('input',draw));draw()})();
  };
})();
