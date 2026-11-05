/* Demos of the «Unsupervised» chapter. modules/unsup.js calls LernApp.demos.unsup() once the chapter is in the page. */
(function () {
  const { $, fmt, mulberry32, gauss } = LernApp;
  const { COL, d2, assign, update, wss, dot } = KMeansDemo.lib;
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

  LernApp.demos.unsup = function () {
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
          '3':[t('3 · Vorverarbeiten','3 · Preprocess'),t('Abstände brauchen Zahlen: Kategorien in 0/1-Spalten umwandeln (One-Hot), fehlende Werte füllen oder Zeilen entfernen. Merkmale bewusst auswählen: Jedes Merkmal bestimmt mit, was «ähnlich» heisst. IDs oder Spalten wie «hat gekündigt» gehören nicht hinein.','Distances need numbers: turn categories into 0/1 columns (One-Hot), fill missing values or remove rows. Choose features deliberately: every feature helps decide what «similar» means. IDs or columns like «has cancelled» do not belong in it.'),[[t('Fehlende Werte','Missing values'),'#ml-missing'],[t('Kategorien in Zahlen','Categories to numbers'),'#ml-cat'],[t('Abstandsmasse','Distance measures'),'#unsup-dist']]],
          '4':[t('4 · Skalieren','4 · Scale'),t('Fast alle Verfahren hier rechnen mit Abständen (k-Means, hierarchisch, DBSCAN, PCA, t-SNE). Ohne Skalieren entscheidet das Merkmal mit den grössten Zahlen. <code>StandardScaler</code> ist der Normalfall, <code>RobustScaler</code> bei vielen Ausreissern.','Almost all methods here work with distances (k-Means, hierarchical, DBSCAN, PCA, t-SNE). Without scaling, the feature with the largest numbers decides. <code>StandardScaler</code> is the normal case, <code>RobustScaler</code> when there are many outliers.'),[[t('Ohne und mit Skalierung (Demo)','Without and with scaling (demo)'),'#scDemo'],[t('Skalieren','Scaling'),'#ml-scaling']]],
          '5':[t('5 · Dimensionen reduzieren (optional)','5 · Reduce dimensions (optional)'),t('Bei sehr vielen Merkmalen werden Abstände unzuverlässig (Fluch der Dimensionen). PCA vor dem Clustern fasst korrelierte Merkmale zusammen und entfernt Rauschen. Wähle so viele Komponenten, dass zum Beispiel 90 % der Varianz bleiben. Bei wenigen Merkmalen kannst du den Schritt weglassen.','With very many features, distances become unreliable (curse of dimensionality). PCA before clustering combines correlated features and removes noise. Choose enough components to keep, for example, 90 % of the variance. With few features you can skip this step.'),[[t('Dimensionsreduktion','Dimensionality reduction'),'#unsup-dimred'],['PCA','#unsup-pca'],[t('Wie viele Komponenten?','How many components?'),'#unsup-pca-k']]],
          '6':[t('6 · Verfahren wählen','6 · Choose a method'),t('<b>k-Means</b> für runde, ähnlich grosse Gruppen und als schneller Start. <b>Hierarchisch</b>, wenn du den Baum sehen und k später wählen willst. <b>DBSCAN/HDBSCAN</b> bei gekrümmten Gruppen und Rauschen. <b>GMM</b>, wenn unsichere Zuordnungen sichtbar sein sollen. <b>Isolation Forest</b>, wenn du Ausreisser suchst statt Gruppen.','<b>k-Means</b> for round groups of similar size and as a quick start. <b>Hierarchical</b> if you want to see the tree and choose k later. <b>DBSCAN/HDBSCAN</b> for curved groups and noise. <b>GMM</b> if uncertain assignments should be visible. <b>Isolation Forest</b> if you are looking for outliers instead of groups.'),[[t('Welches Verfahren wofür?','Which method for what?'),'#unsup-wahl'],['k-Means','#unsup-kmeans'],[t('Hierarchisch','Hierarchical'),'#unsup-hier'],[t('DBSCAN und GMM','DBSCAN and GMM'),'#unsup-dbscan'],['Isolation Forest','#unsup-anomalie']]],
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

      // Demo 5: hierarchical clustering, linkage and cut (agglomerative, computed in the browser)
      (function(){
        const r=mulberry32(4),pts=[];const blob=(cx,cy,sx,sy,n)=>{for(let i=0;i<n;i++)pts.push([cx+sx*gauss(r),cy+sy*gauss(r)])};
        blob(0.2,0.3,0.05,0.05,8);blob(0.7,0.3,0.05,0.05,8);blob(0.45,0.78,0.13,0.035,8);
        const n=pts.length,px=p=>30+p[0]*250,py=p=>212-p[1]*250;
        const dd=(a,b)=>Math.sqrt(d2(a,b));
        function merges(link){let cl=pts.map((p,i)=>({m:[i],c:[p[0],p[1]]}));const out=[];
          const dist=(A,B)=>{if(link==='ward'){const k=A.m.length*B.m.length/(A.m.length+B.m.length);return Math.sqrt(2*k*d2(A.c,B.c))}
            let mn=1e9,mx=0,sm=0;A.m.forEach(i=>B.m.forEach(j=>{const d=dd(pts[i],pts[j]);mn=Math.min(mn,d);mx=Math.max(mx,d);sm+=d}));return link==='single'?mn:link==='complete'?mx:sm/(A.m.length*B.m.length)};
          while(cl.length>1){let b=null;for(let i=0;i<cl.length;i++)for(let j=i+1;j<cl.length;j++){const d=dist(cl[i],cl[j]);if(!b||d<b.d)b={i:i,j:j,d:d}}
            const A=cl[b.i],B=cl[b.j],m=A.m.concat(B.m),c=[0,0];m.forEach(i=>{c[0]+=pts[i][0]/m.length;c[1]+=pts[i][1]/m.length});cl.splice(b.j,1);cl.splice(b.i,1,{m:m,c:c});out.push({d:b.d,cl:cl.map(x=>x.m.slice())})}
          return out}
        const names=['single','complete','average','ward'],M={};names.forEach(k=>{M[k]=merges(k)});let link='ward';
        function draw(){const k=+$('hcK').value;$('hcKO').textContent=k;const mg=M[link];
          const part=k>=n?pts.map((p,i)=>[i]):mg[n-k-1].cl;part.sort((a,b)=>b.length-a.length);const lab=new Array(n);part.forEach((c,ci)=>c.forEach(i=>{lab[i]=ci}));
          let s='';pts.forEach((p,i)=>{s+='<circle cx="'+px(p)+'" cy="'+py(p)+'" r="5" style="fill:'+COL[lab[i]%COL.length]+';stroke:var(--fg);stroke-width:1"/>'});
          $('hcSvg').innerHTML=s;$('hcN').textContent=k;
          $('hcLast').textContent=k>=n?'–':fmt(mg[n-k-1].d,2);$('hcNext').textContent=k>1?fmt(mg[n-k].d,2):'–';
          const jump=k>1&&k<n?mg[n-k].d/mg[n-k-1].d:0;
          $('hcMsg').textContent=k===1?LernApp.t('Ein Cluster: alles ist verschmolzen. Die letzte Verschmelzung kostet den grössten Abstand.','One cluster: everything is merged. The last merge costs the largest distance.'):jump>1.6?LernApp.t('Die nächste Verschmelzung ist viel teurer als die letzte: Hier liegt eine natürliche Grenze, k = '+k+' ist plausibel.','The next merge is much more expensive than the last: there is a natural boundary here, k = '+k+' is plausible.'):LernApp.t('Die Abstände wachsen hier kaum: Der Schnitt trennt Punkte, die eigentlich zusammengehören.','The distances hardly grow here: the cut separates points that belong together.')}
        names.forEach((nm,i)=>{$('hcL'+(i+1)).addEventListener('click',()=>{link=nm;names.forEach((_,j)=>{$('hcL'+(j+1)).className=j===i?'pri':''});draw()})});
        $('hcK').addEventListener('input',draw);draw()})();

      // Demo 6a: DBSCAN on two moons with noise
      (function(){
        const r=mulberry32(9),pts=[];for(let i=0;i<80;i++){const t=Math.PI*i/79;pts.push([Math.cos(t)+0.05*gauss(r),Math.sin(t)+0.05*gauss(r)]);pts.push([1-Math.cos(t)+0.05*gauss(r),0.5-Math.sin(t)+0.05*gauss(r)])}
        for(let i=0;i<10;i++)pts.push([-1.2+3.4*r(),-0.7+1.9*r()]);
        const n=pts.length,sc=300/3.4,px=p=>10+(p[0]+1.2)*sc,py=p=>210-(p[1]+0.7)*sc;
        function run(eps,ms){const nb=pts.map((p,i)=>{const a=[];pts.forEach((q,j)=>{if(Math.sqrt(d2(p,q))<=eps)a.push(j)});return a}),core=nb.map(a=>a.length>=ms),lab=new Array(n).fill(-1);let c=0;
          for(let i=0;i<n;i++){if(!core[i]||lab[i]>=0)continue;const st=[i];lab[i]=c;while(st.length){const u=st.pop();if(!core[u])continue;nb[u].forEach(v=>{if(lab[v]<0){lab[v]=c;st.push(v)}})}c++}
          return{lab:lab,core:core,c:c}}
        function draw(){const eps=+$('dbE').value,ms=+$('dbM').value;$('dbEO').textContent=fmt(eps,2);$('dbMO').textContent=ms;const m=run(eps,ms);let s='';
          s+='<circle cx="'+px(pts[0])+'" cy="'+py(pts[0])+'" r="'+(eps*sc)+'" style="fill:none;stroke:var(--fg);stroke-width:1;stroke-dasharray:4 3"/>';
          let noise=0,cores=0;pts.forEach((p,i)=>{if(m.lab[i]<0){noise++;s+='<path d="M'+(px(p)-3.5)+' '+(py(p)-3.5)+' L'+(px(p)+3.5)+' '+(py(p)+3.5)+' M'+(px(p)+3.5)+' '+(py(p)-3.5)+' L'+(px(p)-3.5)+' '+(py(p)+3.5)+'" style="stroke:var(--muted);stroke-width:1.8"/>'}
            else{if(m.core[i])cores++;s+='<circle cx="'+px(p)+'" cy="'+py(p)+'" r="3.8" style="fill:'+COL[m.lab[i]%COL.length]+';fill-opacity:'+(m.core[i]?1:0.4)+';stroke:var(--fg);stroke-width:1"/>'}});
          $('dbSvg').innerHTML=s;$('dbN').textContent=m.c;$('dbNoise').textContent=noise;$('dbCore').textContent=cores;
          $('dbMsg').textContent=m.c===0?LernApp.t('Alles ist Rauschen: eps ist zu klein oder min_samples zu gross, kein Punkt hat genug Nachbarn.','Everything is noise: eps is too small or min_samples too large, no point has enough neighbours.'):m.c===1&&noise<12?LernApp.t('Ein einziger Cluster: eps ist so gross, dass die beiden Monde zusammenwachsen.','A single cluster: eps is so large that the two moons grow together.'):m.c>2?LernApp.t('Zu viele kleine Cluster: eps ist zu klein oder min_samples zu gross, die Monde zerfallen in Stücke.','Too many small clusters: eps is too small or min_samples too large, the moons break into pieces.'):LernApp.t('Zwei Monde gefunden, einzelne Streupunkte sind als Rauschen markiert.','Two moons found, single stray points are marked as noise.')}
        $('dbE').addEventListener('input',draw);$('dbM').addEventListener('input',draw);draw()})();

      // Demo 6b: Gaussian mixture model fitted with EM for k = 1..5 (computed once)
      (function(){
        const r=mulberry32(12),pts=[];function blob(cx,cy,a,b,ang,n){for(let i=0;i<n;i++){const u=a*gauss(r),v=b*gauss(r);pts.push([cx+u*Math.cos(ang)-v*Math.sin(ang),cy+u*Math.sin(ang)+v*Math.cos(ang)])}}
        blob(0.25,0.3,0.1,0.035,0.5,20);blob(0.72,0.32,0.09,0.04,-0.6,20);blob(0.5,0.75,0.11,0.035,0.05,20);
        const n=pts.length,SC=215,sx=x=>50+x*SC,sy=y=>212-y*SC;
        function pdf(p,m,c){const a=c[0]+1e-4,b=c[1],d=c[2]+1e-4,det=a*d-b*b,dx=p[0]-m[0],dy=p[1]-m[1],q=(d*dx*dx-2*b*dx*dy+a*dy*dy)/det;return Math.exp(-0.5*q)/(2*Math.PI*Math.sqrt(det))}
        function fit(k){const mu=[pts[0].slice()];while(mu.length<k){let bi=0,bd=-1;pts.forEach((p,i)=>{const d=Math.min.apply(null,mu.map(m=>d2(p,m)));if(d>bd){bd=d;bi=i}});mu.push(pts[bi].slice())}
          const cov=mu.map(()=>[0.02,0,0.02]),w=mu.map(()=>1/k);let R=null,ll=0;
          for(let it=0;it<80;it++){ll=0;R=pts.map(p=>{const pr=mu.map((m,j)=>w[j]*pdf(p,m,cov[j])),s=pr.reduce((a,b)=>a+b,0)||1e-300;ll+=Math.log(s);return pr.map(v=>v/s)});
            for(let j=0;j<k;j++){let nj=0,mx=0,my=0;R.forEach((q,i)=>{nj+=q[j];mx+=q[j]*pts[i][0];my+=q[j]*pts[i][1]});nj=Math.max(nj,1e-9);mx/=nj;my/=nj;let a=0,b=0,d=0;R.forEach((q,i)=>{const dx=pts[i][0]-mx,dy=pts[i][1]-my;a+=q[j]*dx*dx;b+=q[j]*dx*dy;d+=q[j]*dy*dy});mu[j]=[mx,my];cov[j]=[a/nj,b/nj,d/nj];w[j]=nj/n}}
          return{mu:mu,cov:cov,R:R,ll:ll,bic:(6*k-1)*Math.log(n)-2*ll}}
        const F=[null,1,2,3,4,5].map((k,i)=>i?fit(k):null);let best=1;for(let k=2;k<=5;k++)if(F[k].bic<F[best].bic)best=k;
        function draw(){const k=+$('gmK').value;$('gmKO').textContent=k;const m=F[k];let s='';
          m.cov.forEach((c,j)=>{const a=c[0]+1e-4,b=c[1],d=c[2]+1e-4,h=(a+d)/2,q=Math.sqrt(((a-d)/2)*((a-d)/2)+b*b),l1=h+q,l2=Math.max(h-q,1e-8),ang=0.5*Math.atan2(2*b,a-d)*180/Math.PI,cx=sx(m.mu[j][0]),cy=sy(m.mu[j][1]);
            s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(2*Math.sqrt(l1)*SC)+'" ry="'+(2*Math.sqrt(l2)*SC)+'" transform="rotate('+(-ang)+' '+cx+' '+cy+')" style="fill:'+COL[j%COL.length]+';fill-opacity:.12;stroke:'+COL[j%COL.length]+';stroke-width:2"/>'});
          pts.forEach((p,i)=>{let bj=0;m.R[i].forEach((v,j)=>{if(v>m.R[i][bj])bj=j});s+='<circle cx="'+sx(p[0])+'" cy="'+sy(p[1])+'" r="3.8" style="fill:'+COL[bj%COL.length]+';fill-opacity:'+(0.25+0.75*m.R[i][bj])+';stroke:var(--fg);stroke-width:.8"/>'});
          $('gmSvg').innerHTML=s;$('gmN').textContent=k;$('gmLL').textContent=fmt(m.ll,1);$('gmBic').textContent=fmt(m.bic,1);
          $('gmMsg').textContent=k===best?LernApp.t('Kleinster BIC bei '+k+' Komponenten: Hier passt das Modell am besten, ohne unnötig komplex zu sein.','Smallest BIC at '+k+' components: here the model fits best without being needlessly complex.'):k<best?LernApp.t('Zu wenige Komponenten: eine Ellipse muss mehrere Gruppen abdecken. Der BIC ist deutlich schlechter.','Too few components: one ellipse has to cover several groups. The BIC is clearly worse.'):LernApp.t('Mehr Komponenten steigern die Log-Likelihood, aber der BIC bestraft die zusätzlichen Parameter.','More components raise the log-likelihood, but the BIC punishes the extra parameters.')}
        $('gmK').addEventListener('input',draw);draw()})();

      // Demo 8: Isolation Forest (100 random trees built once; the slider uses the first T)
      (function(){
        const r=mulberry32(2),P=[];for(let i=0;i<120;i++)P.push([0.5+0.09*gauss(r),0.5+0.09*gauss(r)]);
        const out=[[0.1,0.9],[0.92,0.12],[0.9,0.85],[0.12,0.12],[0.78,0.97],[0.2,0.55]];out.forEach(o=>P.push(o));
        const n=P.length,W=320,H=220,sx=x=>10+x*300,sy=y=>H-10-y*200,psi=64,cf=m=>m>2?2*(Math.log(m-1)+0.5772)-2*(m-1)/m:m===2?1:0;
        function itree(idx,d,q){if(d>=6||idx.length<=1)return{n:idx.length};const f=q()<0.5?0:1;let lo=1e9,hi=-1e9;idx.forEach(i=>{lo=Math.min(lo,P[i][f]);hi=Math.max(hi,P[i][f])});if(lo===hi)return{n:idx.length};
          const t=lo+q()*(hi-lo);return{f:f,t:t,l:itree(idx.filter(i=>P[i][f]<t),d+1,q),r:itree(idx.filter(i=>P[i][f]>=t),d+1,q)}}
        const len=(nd,p,d)=>nd.f===undefined?d+cf(nd.n):len(p[nd.f]<nd.t?nd.l:nd.r,p,d+1);
        const PL=[];for(let t=0;t<100;t++){const q=mulberry32(500+t),all=P.map((_,i)=>i);for(let i=all.length-1;i>0;i--){const j=Math.floor(q()*(i+1));const x=all[i];all[i]=all[j];all[j]=x}
          const tree=itree(all.slice(0,psi),0,q);PL.push(P.map(p=>len(tree,p,0)))}
        function draw(){const T=+$('ifT').value,C=+$('ifC').value;$('ifTO').textContent=T;$('ifCO').textContent=C+' %';
          const sc=P.map((_,i)=>{let m=0;for(let t=0;t<T;t++)m+=PL[t][i];return Math.pow(2,-(m/T)/cf(psi))}),order=sc.map((v,i)=>i).sort((a,b)=>sc[b]-sc[a]),k=Math.max(1,Math.round(n*C/100)),flag=new Set(order.slice(0,k));
          let s='',hits=0,mx=0;sc.forEach(v=>{mx=Math.max(mx,v)});const lo=Math.min.apply(null,sc);
          P.forEach((p,i)=>{const z=(sc[i]-lo)/(mx-lo+1e-9),fl=flag.has(i);if(fl&&i>=120)hits++;s+='<circle cx="'+sx(p[0])+'" cy="'+sy(p[1])+'" r="'+(2.5+4.5*z)+'" style="fill:'+(fl?'var(--bad)':'var(--accent)')+';fill-opacity:'+(0.35+0.5*z)+';stroke:'+(fl?'var(--bad)':'var(--fg)')+';stroke-width:'+(fl?2:0.6)+'"/>'});
          $('ifSvg').innerHTML=s;$('ifF').textContent=k;$('ifH').textContent=hits;$('ifS').textContent=fmt(mx,2);
          $('ifMsg').textContent=T<5?LernApp.t('Mit so wenigen Bäumen ist der Score fast Zufall: Die Markierung wechselt, wenn du den Regler bewegst.','With so few trees the score is almost random: the flagged points change when you move the slider.'):C<4?LernApp.t('Contamination klein: Es werden nur die auffälligsten Punkte markiert, echte Ausreisser können fehlen.','Small contamination: only the most striking points are flagged, real outliers may be missing.'):C>9?LernApp.t('Contamination gross: Es werden viele normale Punkte aus der Wolke mitmarkiert (False Alarms).','Large contamination: many normal points from the cloud are flagged too (false alarms).'):LernApp.t('Die markierten Punkte liegen weit vom dichten Kern. Contamination legt fest, wie viele du prüfst.','The flagged points lie far from the dense core. Contamination sets how many you check.')}
        $('ifT').addEventListener('input',draw);$('ifC').addEventListener('input',draw);draw()})();

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
  };
})();
