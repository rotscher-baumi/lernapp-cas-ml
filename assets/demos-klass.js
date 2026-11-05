/* Demos of the «Klassifikation» chapter. modules/klass.js calls LernApp.demos.klass() once the chapter is in the page. */
(function () {
  const { $, fmt, mulberry32, gauss } = LernApp;
  const sigmoid=z=>1/(1+Math.exp(-z));
  function gridSvg(W,H,G,GY,f){let s='';const cw=W/G,ch=H/GY;for(let i=0;i<G;i++)for(let j=0;j<GY;j++){const x=(i+0.5)/G,y=1-(j+0.5)/GY;s+='<rect x="'+(i*cw)+'" y="'+(j*ch)+'" width="'+(cw+0.5)+'" height="'+(ch+0.5)+'" style="fill:'+(f(x,y)?'var(--accent)':'var(--warn)')+';opacity:.25"/>'}return s}

  LernApp.demos.klass = function () {
      const MU='−';
      // Demo 1: sigmoid
      (function(){
        const xs=[-4,-3,-2.5,-1.5,-0.5,0.5,1,2,3,4.5],ys=[0,0,0,0,1,0,1,1,1,1];
        const W=320,H=190,PX=30,PY=20,sx=x=>PX+((x+6)/12)*(W-PX-10),sy=p=>H-PY-p*(H-PY-12);
        function draw(){const w=+$('sgW').value,b=+$('sgB').value;$('sgWO').textContent=fmt(w,1);$('sgBO').textContent=fmt(b,1);
          let s='<line class="ax" x1="'+PX+'" y1="'+sy(0)+'" x2="'+(W-10)+'" y2="'+sy(0)+'"/><line class="ax" x1="'+PX+'" y1="'+sy(1)+'" x2="'+(W-10)+'" y2="'+sy(1)+'"/>';
          s+='<line class="dash" x1="'+PX+'" y1="'+sy(0.5)+'" x2="'+(W-10)+'" y2="'+sy(0.5)+'"/>';
          for(const t of[0,0.5,1])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
          for(let t=-6;t<=6;t+=3)s+='<text class="lbl" x="'+(sx(t)-4)+'" y="'+(H-4)+'">'+t+'</text>';
          let p='';for(let i=0;i<=120;i++){const x=-6+i*0.1;p+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(sigmoid(w*x+b)).toFixed(1)}
          s+='<path class="ln" d="'+p+'"/>';
          const bd=-b/w;if(bd>-6&&bd<6)s+='<line class="res" x1="'+sx(bd)+'" y1="12" x2="'+sx(bd)+'" y2="'+sy(0)+'"/>';
          let ok=0;xs.forEach((x,i)=>{const pr=sigmoid(w*x+b);if((pr>=0.5?1:0)===ys[i])ok++;
            s+='<circle cx="'+sx(x)+'" cy="'+sy(ys[i])+'" r="5" style="fill:'+(ys[i]?'var(--accent)':'var(--surface)')+';stroke:var(--accent);stroke-width:2"/>'});
          $('sgSvg').innerHTML=s;$('sgBd').textContent=fmt(bd,2).replace('-',MU);$('sgAcc').textContent=ok+LernApp.t(' von ',' of ')+xs.length}
        $('sgW').addEventListener('input',draw);$('sgB').addEventListener('input',draw);draw()})();

      // Demo 1b: 10 apartments, linear price vs. logistic P(expensive), same z = b + w*qm
      (function(){
        const qm=[35,48,55,62,70,78,85,95,110,130],pr=[1200,1510,1540,1770,1620,1890,1850,2280,2170,2580],n=10;
        const W=320,H=230,PX=40,PY=22,XA=25,XB=140;
        const sx=x=>PX+((x-XA)/(XB-XA))*(W-PX-12);
        const mean=a=>a.reduce((p,c)=>p+c,0)/a.length;
        let mode='lin';
        function ols(){const mx=mean(qm),my=mean(pr);let sxy=0,sxx=0;qm.forEach((x,i)=>{sxy+=(x-mx)*(pr[i]-my);sxx+=(x-mx)*(x-mx)});const w=sxy/sxx;return{w,b:my-w*mx}}
        function logfit(y){const mx=mean(qm),sd=Math.sqrt(mean(qm.map(x=>(x-mx)*(x-mx)))),xs=qm.map(x=>(x-mx)/sd);
          let w=0,b=0;const lam=0.05,lr=0.5;
          for(let k=0;k<3000;k++){let gw=lam*w,gb=0;xs.forEach((x,i)=>{const e=sigmoid(w*x+b)-y[i];gw+=e*x/n;gb+=e/n});w-=lr*gw;b-=lr*gb}
          return{w:w/sd,b:b-w*mx/sd}}
        function draw(){
          const T=+$('lgT').value;$('lgTO').textContent=T+' CHF';
          const y=pr.map(p=>p>=T?1:0),ln=ols(),lg=logfit(y),lin=mode==='lin';
          $('lgLin').className=lin?'pri':'';$('lgLog').className=lin?'':'pri';
          const sy=lin?(v=>H-PY-((v-1000)/(2800-1000))*(H-PY-12)):(p=>H-PY-p*(H-PY-12));
          let s='<line class="ax" x1="'+PX+'" y1="'+(H-PY)+'" x2="'+(W-8)+'" y2="'+(H-PY)+'"/>';
          for(let t=40;t<=140;t+=20)s+='<text class="lbl" x="'+(sx(t)-8)+'" y="'+(H-6)+'">'+t+'</text>';
          s+='<text class="lbl" x="'+(W-24)+'" y="'+(H-PY-4)+'">'+LernApp.t('qm','m²')+'</text>';
          let bd;
          if(lin){
            for(const t of[1000,1500,2000,2500])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
            s+='<line class="dash" x1="'+PX+'" y1="'+sy(T)+'" x2="'+(W-8)+'" y2="'+sy(T)+'"/>';
            s+='<path class="ln" d="M'+sx(XA)+' '+sy(ln.b+ln.w*XA)+'L'+sx(XB)+' '+sy(ln.b+ln.w*XB)+'"/>';
            bd=(T-ln.b)/ln.w;
            pr.forEach((p,i)=>{s+='<line class="res" x1="'+sx(qm[i])+'" y1="'+sy(p)+'" x2="'+sx(qm[i])+'" y2="'+sy(ln.b+ln.w*qm[i])+'"/>'});
            pr.forEach((p,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(p)+'" r="4.5" style="fill:'+(y[i]?'var(--accent)':'var(--surface)')+';stroke:var(--accent);stroke-width:2"/>'});
            $('lgForm').innerHTML=LernApp.t('Preis = z = <b>','Price = z = <b>')+fmt(ln.b,0)+'</b> + <b>'+fmt(ln.w,1)+LernApp.t('</b>·qm','</b>·m²');
            $('lgOdds').innerHTML=LernApp.t('10 qm mehr = <b>+','10 m² more = <b>+')+fmt(ln.w*10,0)+'</b> CHF';
          }else{
            for(const t of[0,0.5,1])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
            s+='<line class="dash" x1="'+PX+'" y1="'+sy(0.5)+'" x2="'+(W-8)+'" y2="'+sy(0.5)+'"/>';
            let p='';for(let i=0;i<=115;i++){const x=XA+i;p+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(sigmoid(lg.b+lg.w*x)).toFixed(1)}
            s+='<path class="ln" d="'+p+'"/>';
            bd=-lg.b/lg.w;
            pr.forEach((q,i)=>{s+='<circle cx="'+sx(qm[i])+'" cy="'+sy(y[i])+'" r="4.5" style="fill:'+(y[i]?'var(--accent)':'var(--surface)')+';stroke:var(--accent);stroke-width:2"/>'});
            $('lgForm').innerHTML='z = <b>'+fmt(lg.b,2).replace('-',MU)+'</b> + <b>'+fmt(lg.w,3)+LernApp.t('</b>·qm &nbsp;→&nbsp; P(teuer) = 1/(1+e<sup>−z</sup>)','</b>·m² &nbsp;→&nbsp; P(expensive) = 1/(1+e<sup>−z</sup>)');
            $('lgOdds').innerHTML=LernApp.t('10 qm mehr = Odds ×<b>','10 m² more = odds ×<b>')+fmt(Math.exp(lg.w*10),1)+'</b>';
          }
          if(bd>XA&&bd<XB)s+='<line class="res" x1="'+sx(bd)+'" y1="12" x2="'+sx(bd)+'" y2="'+(H-PY)+'"/>';
          $('lgSvg').innerHTML=s;$('lgBd').textContent=fmt(bd,0);
        }
        $('lgLin').addEventListener('click',()=>{mode='lin';draw()});
        $('lgLog').addEventListener('click',()=>{mode='log';draw()});
        $('lgT').addEventListener('input',draw);draw()})();

      // Demo 1c: cross-entropy vs. MSE for a true positive
      (function(){
        const W=320,H=190,PX=30,PY=20,sx=p=>PX+p*(W-PX-10),sy=v=>H-PY-Math.min(v,5)/5*(H-PY-12);
        function draw(){
          const p=+$('lsP').value/100;$('lsPO').textContent=fmt(p,2);
          let s='<line class="ax" x1="'+PX+'" y1="'+sy(0)+'" x2="'+(W-10)+'" y2="'+sy(0)+'"/>';
          for(const t of[0,1,2,3,4,5])s+='<text class="lbl" x="6" y="'+(sy(t)+3)+'">'+t+'</text>';
          for(const t of[0,0.5,1])s+='<text class="lbl" x="'+(sx(t)-6)+'" y="'+(H-4)+'">'+t+'</text>';
          let a='',b='';for(let i=0;i<=100;i++){const q=Math.max(i/100,0.007);a+=(i?'L':'M')+sx(i/100).toFixed(1)+' '+sy(-Math.log(q)).toFixed(1);b+=(i?'L':'M')+sx(i/100).toFixed(1)+' '+sy((1-i/100)*(1-i/100)).toFixed(1)}
          s+='<path class="ln" d="'+a+'"/><path class="ln2" d="'+b+'" style="stroke-dasharray:5 4"/>';
          s+='<circle cx="'+sx(p)+'" cy="'+sy(-Math.log(p))+'" r="5" style="fill:var(--accent)"/><circle cx="'+sx(p)+'" cy="'+sy((1-p)*(1-p))+'" r="5" style="fill:var(--warn)"/>';
          $('lsSvg').innerHTML=s;$('lsCE').textContent=fmt(-Math.log(p),2);$('lsMS').textContent=fmt((1-p)*(1-p),2)}
        $('lsP').addEventListener('input',draw);draw()})();

      // Demo 2: threshold, confusion matrix, ROC (class sizes adjustable; the score shape comes from a 10 + 10 template)
      (function(){
        const TPL_P=[0.42,0.58,0.74,0.78,0.82,0.85,0.88,0.91,0.94,0.97],TPL_N=[0.03,0.06,0.10,0.14,0.18,0.22,0.26,0.30,0.52,0.62];
        function scores(T,n){const o=[];for(let i=0;i<n;i++){const u=Math.min(9,Math.max(0,(i+0.5)/n*10-0.5)),a=Math.floor(u),b=Math.min(9,a+1);o.push(T[a]+(T[b]-T[a])*(u-a))}return o}
        const ge=(arr,t)=>{let lo=0,hi=arr.length;while(lo<hi){const m=(lo+hi)>>1;if(arr[m]>=t)hi=m;else lo=m+1}return arr.length-lo};
        let pos=[],neg=[],roc=[],auc=0;
        function counts(t){const tp=ge(pos,t),fp=ge(neg,t);return{tp:tp,fn:pos.length-tp,fp:fp,tn:neg.length-fp}}
        function prep(){pos=scores(TPL_P,Math.round(Math.pow(10,+$('thNP').value)));neg=scores(TPL_N,Math.round(Math.pow(10,+$('thNN').value)));
          const ths=[1.01].concat(pos.concat(neg).sort((a,b)=>b-a)).concat([0]);roc=ths.map(t=>{const c=counts(t);return[c.fp/neg.length,c.tp/pos.length]});
          auc=0;for(let i=1;i<roc.length;i++)auc+=(roc[i][0]-roc[i-1][0])*(roc[i][1]+roc[i-1][1])/2;
          $('thNPO').textContent=pos.length;$('thNNO').textContent=neg.length}
        const W=320,PX=10,sx=p=>PX+p*(W-2*PX);
        const RW=320,RH=210,RX=34,RY=14,rx=v=>RX+v*(RW-RX-14),ry=v=>RH-24-v*(RH-24-RY);
        function show(arr,max){const st=Math.max(1,Math.ceil(arr.length/max)),o=[];for(let i=0;i<arr.length;i+=st)o.push(arr[i]);return o}
        function draw(){const t=+$('thT').value;$('thTO').textContent=fmt(t,2);const c=counts(t),total=pos.length+neg.length;
          const sp=show(pos,200),sn=show(neg,200),many=sp.length>20||sn.length>20,R=many?6:3,sep=many?5:10,rad=many?2.5:5;
          let s='<line class="ax" x1="'+PX+'" y1="85" x2="'+(W-PX)+'" y2="85"/>';
          for(const v of[0,0.5,1])s+='<text class="lbl" x="'+(sx(v)-6)+'" y="165">'+v+'</text>';
          sp.forEach((p,i)=>{const col=p>=t?'var(--ok)':'var(--bad)';s+='<circle cx="'+sx(p)+'" cy="'+((many?34:40)+(i%R)*sep)+'" r="'+rad+'" style="fill:'+col+';stroke:var(--fg);stroke-width:'+(many?0.5:1)+'"/>'});
          sn.forEach((p,i)=>{const col=p>=t?'var(--bad)':'var(--ok)',y=(many?112:112)+(i%R)*sep;s+='<rect x="'+(sx(p)-rad)+'" y="'+(y-rad)+'" width="'+(2*rad)+'" height="'+(2*rad)+'" style="fill:'+col+';stroke:var(--fg);stroke-width:'+(many?0.5:1)+'"/>'});
          s+='<text class="lbl" x="'+PX+'" y="18">'+LernApp.t('echt positiv (Kreis): ','actually positive (circle): ')+pos.length+'</text><text class="lbl" x="'+PX+'" y="150">'+LernApp.t('echt negativ (Quadrat): ','actually negative (square): ')+neg.length+'</text>';
          s+='<line class="ln2" x1="'+sx(t)+'" y1="24" x2="'+sx(t)+'" y2="148"/>';
          $('thSvg').innerHTML=s;
          $('thTP').textContent=c.tp;$('thFN').textContent=c.fn;$('thFP').textContent=c.fp;$('thTN').textContent=c.tn;
          const pre=c.tp+c.fp?c.tp/(c.tp+c.fp):0,rec=c.tp/(c.tp+c.fn),f1=(2*c.tp+c.fp+c.fn)?2*c.tp/(2*c.tp+c.fp+c.fn):0,fpr=c.fp/(c.fp+c.tn);
          $('thAcc').textContent=fmt((c.tp+c.tn)/total,3);$('thPre').textContent=c.tp+c.fp?fmt(pre,3):'–';$('thRec').textContent=fmt(rec,3);$('thF1').textContent=fmt(f1,3);$('thFpr').textContent=fmt(fpr,3);
          $('thAccF').textContent='('+c.tp+'+'+c.tn+') / '+total;$('thPreF').textContent=c.tp+' / ('+c.tp+'+'+c.fp+')';$('thRecF').textContent=c.tp+' / ('+c.tp+'+'+c.fn+')';$('thFprF').textContent=c.fp+' / ('+c.fp+'+'+c.tn+')';$('thF1F').textContent='2·'+c.tp+' / (2·'+c.tp+'+'+c.fp+'+'+c.fn+')';
          $('thAuc').textContent=fmt(auc,3);$('thPrev').textContent=fmt(100*pos.length/total,1)+' %';$('thBase').textContent=fmt(neg.length/total,3);
          const stp=Math.max(1,Math.ceil(roc.length/300));let g='<line class="ax" x1="'+RX+'" y1="'+ry(0)+'" x2="'+rx(1)+'" y2="'+ry(0)+'"/><line class="ax" x1="'+RX+'" y1="'+ry(0)+'" x2="'+RX+'" y2="'+ry(1)+'"/>';
          g+='<line class="dash" x1="'+rx(0)+'" y1="'+ry(0)+'" x2="'+rx(1)+'" y2="'+ry(1)+'"/>';
          const pts=roc.filter((p,i)=>i%stp===0||i===roc.length-1);g+='<path class="ln" d="'+pts.map((p,i)=>(i?'L':'M')+rx(p[0]).toFixed(1)+' '+ry(p[1]).toFixed(1)).join('')+'"/>';
          g+='<text class="lbl" x="'+(RX+60)+'" y="'+(RH-6)+'">'+LernApp.t('Rate falscher Alarme (FPR)','False alarm rate (FPR)')+'</text><text class="lbl" x="2" y="10">Recall (TPR)</text>';
          g+='<text class="lbl" x="'+(RX-14)+'" y="'+(ry(0)+4)+'">0</text><text class="lbl" x="'+(RX-14)+'" y="'+(ry(1)+4)+'">1</text><text class="lbl" x="'+(rx(0)-3)+'" y="'+(ry(0)+13)+'">0</text><text class="lbl" x="'+(rx(1)-3)+'" y="'+(ry(0)+13)+'">1</text>';
          g+='<circle cx="'+rx(c.fp/neg.length)+'" cy="'+ry(c.tp/pos.length)+'" r="6" style="fill:var(--warn)"/>';
          $('thRoc').innerHTML=g;
          const ratio=neg.length/pos.length;
          $('thMsg').textContent=ratio>=50?LernApp.t('Seltene Positive: Die AUC bleibt hoch, weil die ROC nur Raten kennt. Die Precision aber bricht ein: Schon eine kleine False Alarm Rate ergibt mehr FP als TP, denn es gibt so viele Negative. Die Accuracy von «immer negativ» ist fast 1.','Rare positives: the AUC stays high, because the ROC only knows rates. The precision collapses though: even a small false alarm rate gives more FP than TP, because there are so many negatives. The accuracy of «always negative» is almost 1.'):ratio<=1/50?LernApp.t('Fast nur Positive: Die Precision ist leicht hoch, die False Alarm Rate wird aus sehr wenigen Negativen berechnet und schwankt stark.','Almost only positives: precision is easily high, the false alarm rate is computed from very few negatives and varies a lot.'):LernApp.t('Ausgewogen: Accuracy, Precision und Recall erzählen etwa dieselbe Geschichte. Setze die Negativen auf 1000 und schau, was passiert.','Balanced: accuracy, precision and recall tell about the same story. Set the negatives to 1000 and watch what happens.')}
        const act=(a,b)=>{$('thNP').value=a;$('thNN').value=b;[['thP1'],['thP2'],['thP3']].forEach(x=>{$(x[0]).className=''});prep();draw()};
        ['thNP','thNN'].forEach(id=>$(id).addEventListener('input',()=>{[['thP1'],['thP2'],['thP3']].forEach(x=>{$(x[0]).className=''});prep();draw()}));
        [['thP1',1,1],['thP2',1,3],['thP3',0,3]].forEach(b=>$(b[0]).addEventListener('click',()=>{act(b[1],b[2]);$(b[0]).className='pri'}));
        $('thT').addEventListener('input',draw);prep();draw()})();

      // Demo 3: imbalance
      (function(){
        function draw(){const pp=+$('imP').value;$('imPO').textContent=fmt(pp,1)+' %';
          const P=1000*pp/100,N=1000-P;
          const a1=N/1000;
          const tp=0.8*P,fn=P-tp,fp=0.1*N,tn=N-fp;
          const pre=tp/(tp+fp),f2=2*tp/(2*tp+fp+fn);
          $('imA1').textContent=fmt(a1,3);$('imP1').textContent='–';$('imR1').textContent='0.000';$('imF1').textContent='0.000';
          $('imA2').textContent=fmt((tp+tn)/1000,3);$('imP2').textContent=fmt(pre,3);$('imR2').textContent=fmt(0.8,3);$('imF2').textContent=fmt(f2,3);
          $('imMsg').textContent=LernApp.t('Bei ','With ')+fmt(pp,1)+LernApp.t(' % Positiven hat «Immer negativ» ',' % positives, «Always negative» has ')+fmt(a1*100,1)+LernApp.t(' % Accuracy und findet nichts. ',' % accuracy and finds nothing. ')+((tp+tn)/1000<a1?LernApp.t('Das echte Modell hat eine tiefere Accuracy, ist aber das nützliche. ','The real model has a lower accuracy, but it is the useful one. '):LernApp.t('Hier sind die Klassen ausgeglichen genug, dass Accuracy das bessere Modell auch zeigt. ','Here the classes are balanced enough for accuracy to show the better model too. '))+LernApp.t('Beachte auch: Bei seltener Klasse sinkt die Precision des echten Modells, weil die vielen Negativen auch bei 10 % falschem Alarm viele FP liefern.','Note also: with a rare class the precision of the real model drops, because the many negatives produce many FP even at 10 % false alarms.')}
        $('imP').addEventListener('input',draw);draw()})();

      // Demo 4: kNN (two simple groups, no background colouring)
      (function(){
        const r=mulberry32(11);
        function make(n){const a=[];for(let i=0;i<n;i++){const c=r()<0.65?0:1;a.push({x:(c?0.65:0.35)+0.17*gauss(r),y:(c?0.6:0.4)+0.17*gauss(r),c:c})}return a}
        const tr=make(40),te=make(400),q={x:0.5,y:0.5};
        const W=320,H=220,sx=x=>x*W,sy=y=>H-y*H;
        const col=c=>c?'var(--accent)':'var(--warn)';
        function dist(ax,ay,bx,by){return Math.hypot((ax-bx)*W,(ay-by)*H)} // in drawn pixels: what you see is what kNN measures
        function near(x,y,k){return tr.map(p=>({p:p,d:dist(p.x,p.y,x,y)})).sort((u,v)=>u.d-v.d).slice(0,k)}
        function pred(x,y,k){const n=near(x,y,k);let s=0;n.forEach(e=>s+=e.p.c);return s*2>k?1:0}
        function draw(){const k=+$('knK').value;$('knKO').textContent=k;
          const nb=near(q.x,q.y,k),dk=nb[nb.length-1].d,v1=nb.filter(e=>e.p.c).length,v0=k-v1,cls=v1>v0?1:0;
          let s='';
          s+='<circle cx="'+sx(q.x)+'" cy="'+sy(q.y)+'" r="'+dk+'" style="fill:none;stroke:var(--fg);stroke-width:1;stroke-dasharray:4 3"/>';
          nb.forEach(e=>{s+='<line x1="'+sx(q.x)+'" y1="'+sy(q.y)+'" x2="'+sx(e.p.x)+'" y2="'+sy(e.p.y)+'" style="stroke:var(--fg);stroke-width:1;opacity:.5"/>'});
          tr.forEach(p=>{s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="4.5" style="fill:'+col(p.c)+';stroke:var(--fg);stroke-width:1"/>'});
          s+='<path d="M'+sx(q.x)+' '+(sy(q.y)-10)+' L'+(sx(q.x)+10)+' '+sy(q.y)+' L'+sx(q.x)+' '+(sy(q.y)+10)+' L'+(sx(q.x)-10)+' '+sy(q.y)+' Z" style="fill:'+col(cls)+';stroke:var(--fg);stroke-width:2"/>';
          s+='<text x="'+(sx(q.x)+13)+'" y="'+(sy(q.y)-12)+'" style="fill:var(--fg);font-size:13px;font-weight:700;paint-order:stroke;stroke:var(--bg);stroke-width:3px">'+LernApp.t('Startpunkt','Start point')+'</text>';
          $('knSvg').innerHTML=s;
          const acc=set=>set.filter(p=>pred(p.x,p.y,k)===p.c).length/set.length;
          $('knTr').textContent=fmt(acc(tr),2);$('knTe').textContent=fmt(acc(te),2);
          const vote=LernApp.t('Von den '+k+' nächsten Nachbarn sind '+v1+' blau und '+v0+' orange: Der Startpunkt wird '+(cls?'blau':'orange')+'. ','Of the '+k+' nearest neighbours, '+v1+' are blue and '+v0+' orange: the start point becomes '+(cls?'blue':'orange')+'. ');
          $('knMsg').textContent=vote+(k===1?LernApp.t('k = 1: Ein einzelner Nachbar entscheidet. Training perfekt, auf neuen Punkten schlechter (Overfitting).','k = 1: A single neighbour decides. Training is perfect, but worse on new points (overfitting).'):k>=29?LernApp.t('Sehr grosses k: Fast alle Punkte stimmen mit, das Modell ignoriert die Struktur (Underfitting).','Very large k: Almost all points vote, the model ignores the structure (underfitting).'):k<9?LernApp.t('Kleines k: Wenige Nachbarn, einzelne Ausreisser können kippen (noch etwas Overfitting).','Small k: Few neighbours, single outliers can flip the result (still some overfitting).'):LernApp.t('Mittleres k: Training und Test liegen nah beisammen (gute Balance).','Medium k: Training and test are close together (good balance).'));}
        $('knK').addEventListener('input',draw);
        $('knSvg').addEventListener('click',e=>{const b=e.currentTarget.getBoundingClientRect();q.x=Math.min(1,Math.max(0,(e.clientX-b.left)/b.width));q.y=Math.min(1,Math.max(0,1-(e.clientY-b.top)/b.height));draw()});
        draw()})();

      // Demo 5a: Naive Bayes, one feature (qm), Gaussian per class
      (function(){
        const a=[35,48,55,62,70],b=[78,85,95,110,130],qa=a.concat(b);
        const mean=v=>v.reduce((s,x)=>s+x,0)/v.length,sd=v=>{const m=mean(v);return Math.sqrt(v.reduce((s,x)=>s+(x-m)*(x-m),0)/(v.length-1))};
        const ma=mean(a),sa=sd(a),mb=mean(b),sb=sd(b),pdf=(x,m,s)=>Math.exp(-0.5*((x-m)/s)*((x-m)/s))/(s*Math.sqrt(2*Math.PI));
        const W=320,P=12,X0=20,X1=150,sx=x=>P+(x-X0)/(X1-X0)*(W-2*P);
        function draw(){const x=+$('nbX').value,pi=+$('nbP').value/100;$('nbXO').textContent=x+' qm';$('nbPO').textContent=Math.round(pi*100)+' %';
          const fa=v=>pdf(v,ma,sa)*(1-pi),fb=v=>pdf(v,mb,sb)*pi;let mx=0;for(let v=X0;v<=X1;v++)mx=Math.max(mx,fa(v),fb(v));
          const sy=v=>135-v/mx*100;let s='<line class="ax" x1="'+P+'" y1="135" x2="'+(W-P)+'" y2="135"/>',pa='',pb='';
          for(const t of[40,60,80,100,120,140])s+='<text class="lbl" x="'+(sx(t)-8)+'" y="165">'+t+'</text>';
          for(let v=X0;v<=X1;v++){pa+=(v>X0?'L':'M')+sx(v).toFixed(1)+' '+sy(fa(v)).toFixed(1);pb+=(v>X0?'L':'M')+sx(v).toFixed(1)+' '+sy(fb(v)).toFixed(1)}
          s+='<path class="ln2" d="'+pa+'"/><path class="ln" d="'+pb+'"/>';
          qa.forEach((q,i)=>{s+='<circle cx="'+sx(q)+'" cy="148" r="3.5" style="fill:'+(i<5?'var(--warn)':'var(--accent)')+';stroke:var(--fg);stroke-width:1"/>'});
          s+='<line x1="'+sx(x)+'" y1="20" x2="'+sx(x)+'" y2="140" style="stroke:var(--fg);stroke-width:1.5"/><circle cx="'+sx(x)+'" cy="'+sy(fa(x))+'" r="4" style="fill:var(--warn)"/><circle cx="'+sx(x)+'" cy="'+sy(fb(x))+'" r="4" style="fill:var(--accent)"/>';
          $('nbSvg').innerHTML=s;const post=fb(x)/(fa(x)+fb(x));
          $('nbPost').textContent=fmt(post,2);$('nbLb').textContent=fmt(fb(x)*1000,2);$('nbLa').textContent=fmt(fa(x)*1000,2);
          $('nbMsg').textContent=post>0.5?LernApp.t('Die blaue Kurve liegt hier höher: Vorhersage «teuer».','The blue curve is higher here: prediction «expensive».'):LernApp.t('Die orange Kurve liegt hier höher: Vorhersage «nicht teuer».','The orange curve is higher here: prediction «not expensive».')}
        $('nbX').addEventListener('input',draw);$('nbP').addEventListener('input',draw);draw()})();

      // Demo 5b: linear soft-margin SVM on 40 apartments (qm and location score), slider C.
      // Solver: dual coordinate descent (Hsieh et al. 2008) with the bias as a third weight.
      (function(){
        const t=LernApp.t,NOISE=[0.03,0.07],KEEP=2000;
        const apt=(r,noise)=>{const u=r(),v=r(),s=0.5*u+0.5*v+noise*gauss(r);return{u:u-0.5,v:v-0.5,y2:s>0.5?1:-1}};
        // The same 40 apartments in both data sets, only the price noise differs (so a few labels change).
        const make=(n,seed,noise)=>{const r=mulberry32(seed);return[...Array(n)].map(()=>apt(r,noise))};
        const sets=NOISE.map(nz=>({tr:make(40,3,nz),te:make(KEEP,999,nz)}));
        const cache={};
        function fit(pts,key,C){if(cache[key+C])return cache[key+C];
          const w=[0,0,0],al=pts.map(()=>0),Q=pts.map(p=>p.u*p.u+p.v*p.v+1);
          for(let ep=0;ep<20000;ep++){let ch=0;
            pts.forEach((p,i)=>{const G=p.y2*(w[0]*p.u+w[1]*p.v+w[2])-1,an=Math.min(C,Math.max(0,al[i]-G/Q[i])),d=(an-al[i])*p.y2;
              w[0]+=d*p.u;w[1]+=d*p.v;w[2]+=d;ch=Math.max(ch,Math.abs(an-al[i]));al[i]=an});
            if(ch<1e-7)break}
          return cache[key+C]={w:[w[0],w[1]],b:w[2]}}
        const f=(m,p)=>m.w[0]*p.u+m.w[1]*p.v+m.b,acc=(m,ps)=>ps.filter(p=>p.y2*f(m,p)>0).length/ps.length;
        // Plot: x = living area (30 to 140 m²), y = location score (1 to 10).
        const W=320,H=240,PX=36,PY=30,sx=u=>PX+(u+0.5)*(W-PX-14),sy=v=>H-PY-(v+0.5)*(H-PY-8);
        const QM=u=>Math.round(30+110*(u+0.5)),LG=v=>1+9*(v+0.5);
        // Line n·p + c = 0 as a long segment (clipped to the plot).
        const seg=(m,off,style)=>{const n=Math.hypot(...m.w),c=m.b-off,px=-c*m.w[0]/(n*n),py=-c*m.w[1]/(n*n),dx=-m.w[1]/n*3,dy=m.w[0]/n*3;
          return'<line x1="'+sx(px-dx)+'" y1="'+sy(py-dy)+'" x2="'+sx(px+dx)+'" y2="'+sy(py+dy)+'" style="'+style+'"/>'};
        function axes(){let a='<line class="ax" x1="'+PX+'" y1="'+sy(-0.5)+'" x2="'+sx(0.5)+'" y2="'+sy(-0.5)+'"/><line class="ax" x1="'+PX+'" y1="'+sy(-0.5)+'" x2="'+PX+'" y2="'+sy(0.5)+'"/>';
          [30,60,90,120,140].forEach(q=>{a+='<text class="lbl" x="'+sx((q-30)/110-0.5)+'" y="'+(sy(-0.5)+14)+'" text-anchor="middle">'+q+'</text>'});
          [1,4,7,10].forEach(l=>{a+='<text class="lbl" x="'+(PX-5)+'" y="'+(sy((l-1)/9-0.5)+3.5)+'" text-anchor="end">'+l+'</text>'});
          return a+'<text class="lbl" x="'+(PX+(W-PX-14)/2)+'" y="'+(H-3)+'" text-anchor="middle">'+t('Wohnfläche (qm)','Living area (m²)')+'</text><text class="lbl" transform="rotate(-90 9 '+sy(0)+')" x="9" y="'+sy(0)+'" text-anchor="middle">'+t('Lage (1 bis 10)','Location (1 to 10)')+'</text>'}
        let ds=0;
        function draw(){
          const C=Math.pow(10,+$('svC').value),tr=sets[ds].tr,m=fit(tr,'d'+ds+'_',C),nw=Math.hypot(...m.w);
          $('svD0').className=ds===0?'pri':'';$('svD1').className=ds===1?'pri':'';
          const margin=tr.filter(p=>p.y2*f(m,p)<1-1e-6),sv=tr.filter(p=>p.y2*f(m,p)<=1+1e-6);
          let s='<defs><clipPath id="svClip"><rect x="'+PX+'" y="'+sy(0.5)+'" width="'+(sx(0.5)-PX)+'" height="'+(sy(-0.5)-sy(0.5))+'"/></clipPath></defs><g clip-path="url(#svClip)">';
          // The two dashed margin edges and the separating line.
          s+=seg(m,1,'stroke:var(--fg);stroke-width:1.2;stroke-dasharray:5 4')+seg(m,-1,'stroke:var(--fg);stroke-width:1.2;stroke-dasharray:5 4')+seg(m,0,'stroke:var(--fg);stroke-width:2.2');
          // Slack: a short red line from each point that violates the margin to the margin edge it should be behind.
          margin.forEach(p=>{const k=(1-p.y2*f(m,p))/(nw*nw);s+='<line x1="'+sx(p.u)+'" y1="'+sy(p.v)+'" x2="'+sx(p.u+p.y2*m.w[0]*k)+'" y2="'+sy(p.v+p.y2*m.w[1]*k)+'" style="stroke:var(--bad);stroke-width:1.6"/>'});
          s+='</g>';
          tr.forEach(p=>{const isSv=sv.indexOf(p)>=0;
            s+='<circle cx="'+sx(p.u)+'" cy="'+sy(p.v)+'" r="'+(isSv?5.5:3.5)+'" style="fill:'+(p.y2>0?'var(--accent)':'var(--warn)')+';stroke:var(--fg);stroke-width:'+(isSv?2.2:1)+'"/>'});
          $('svSvg').innerHTML=s+axes();
          $('svCO').textContent=fmt(C,C<10?2:0);
          $('svN').textContent=sv.length;$('svV').textContent=margin.length;
          $('svM').textContent=fmt(2/nw*100,0)+' %';$('svTr').textContent=fmt(acc(m,tr)*100,0)+' %';$('svTe').textContent=fmt(acc(m,sets[ds].te)*100,1)+' %';
          $('svMsg').textContent=C<0.5?t('Sehr kleines C: Fehler kosten fast nichts, die Margin ist riesig (breiter als die Grafik), fast jede Wohnung verletzt sie. Die Linie ist grob und die Genauigkeit schlecht (Underfitting).','Very small C: errors cost almost nothing, the margin is huge (wider than the plot), almost every apartment violates it. The line is crude and the accuracy poor (underfitting).')
            :C>200?t('Sehr grosses C: Jede Verletzung ist teuer, die Margin wird schmal und die Linie richtet sich nach einzelnen Wohnungen. Bei verrauschten Daten sinkt dadurch die Test-Accuracy wieder (Overfitting).','Very large C: every violation is expensive, the margin gets narrow and the line follows single apartments. With noisy data the test accuracy falls again (overfitting).')
            :t('Mittleres C: Ein Kompromiss. Einige Wohnungen dürfen die Margin verletzen, die Margin bleibt breit genug, um auf neuen Wohnungen zu halten.','Medium C: a compromise. Some apartments may violate the margin, and the margin stays wide enough to hold on new apartments.')}
        $('svC').addEventListener('input',draw);[0,1].forEach(i=>$('svD'+i).addEventListener('click',()=>{ds=i;draw()}));draw()})();

      // Demo 5c: decision tree (CART, Gini): regions, tree diagram and accuracy by depth
      (function(){
        const r=mulberry32(11);function make(n){const a=[];for(let i=0;i<n;i++){const c=i%2;a.push({x:(c?0.6:0.4)+0.2*gauss(r),y:(c?0.55:0.45)+0.2*gauss(r),c:c})}return a}
        const tr=make(60),te=make(200),W=320,H=220,PX=36,PY=30,sx=x=>PX+x*(W-PX-14),sy=y=>H-PY-y*(H-PY-8),DD=99,cl=c=>c?'var(--accent)':'var(--warn)';
        const gini=s=>{const n=s.length;if(!n)return 0;const p=s.filter(q=>q.c).length/n;return 2*p*(1-p)};
        function build(s,d,md,b){const n1=s.filter(q=>q.c).length,n0=s.length-n1,base={n0:n0,n1:n1,g:gini(s),c:n1*2>=s.length?1:0,b:b};
          if(d>=md||n1===0||n0===0||s.length<2)return Object.assign(base,{leaf:1});
          let best=null;['x','y'].forEach(f=>{const v=s.map(q=>q[f]).sort((a,c)=>a-c);for(let i=1;i<v.length;i++){if(v[i]===v[i-1])continue;const t=(v[i]+v[i-1])/2,L=s.filter(q=>q[f]<=t),R=s.filter(q=>q[f]>t),g=(L.length*gini(L)+R.length*gini(R))/s.length;if(!best||g<best.g)best={f:f,t:t,g:g,L:L,R:R}}});
          if(!best)return Object.assign(base,{leaf:1});
          const bl=best.f==='x'?[b[0],b[1],best.t,b[3]]:[b[0],b[1],b[2],best.t],br=best.f==='x'?[best.t,b[1],b[2],b[3]]:[b[0],best.t,b[2],b[3]];
          return Object.assign(base,{f:best.f,t:best.t,l:build(best.L,d+1,md,bl),r:build(best.R,d+1,md,br)})}
        const pred=(n,x,y)=>n.leaf?n.c:((n.f==='x'?x:y)<=n.t?pred(n.l,x,y):pred(n.r,x,y)),cnt=n=>n.leaf?1:cnt(n.l)+cnt(n.r);
        const acc=(t,set)=>set.filter(p=>pred(t,p.x,p.y)===p.c).length/set.length,CUR=[];
        for(let d=1;d<=8;d++){const t=build(tr,0,d,[0,0,1,1]);CUR.push([acc(t,tr),acc(t,te)])}
        function regions(t){let s='';(function walk(n,d){if(n.leaf){const pur=Math.max(n.n0,n.n1)/(n.n0+n.n1);s+='<rect x="'+sx(n.b[0])+'" y="'+sy(n.b[3])+'" width="'+(sx(n.b[2])-sx(n.b[0]))+'" height="'+(sy(n.b[1])-sy(n.b[3]))+'" style="fill:'+cl(n.c)+';opacity:'+(0.12+0.5*(2*pur-1))+'"/>';return}
          const b=n.b,w=Math.max(1,2.8-0.55*d);s+=n.f==='x'?'<line x1="'+sx(n.t)+'" y1="'+sy(b[1])+'" x2="'+sx(n.t)+'" y2="'+sy(b[3])+'" style="stroke:var(--fg);stroke-width:'+w+'"/>':'<line x1="'+sx(b[0])+'" y1="'+sy(n.t)+'" x2="'+sx(b[2])+'" y2="'+sy(n.t)+'" style="stroke:var(--fg);stroke-width:'+w+'"/>';walk(n.l,d+1);walk(n.r,d+1)})(t,0);return s}
        function diagram(t){let k=0;(function lay(n,d){if(n.leaf||d===DD){n.xi=k++;return}lay(n.l,d+1);lay(n.r,d+1);n.xi=(n.l.xi+n.r.xi)/2})(t,0);
          const dep=n=>n.leaf?0:1+Math.max(dep(n.l),dep(n.r)),D=Math.max(1,dep(t)),px=n=>k>1?14+n.xi*(292/(k-1)):160,py=d=>20+d*Math.min(34,128/D);let e='',v='';
          (function walk(n,d){if(n.leaf||d===DD)return;[n.l,n.r].forEach(c=>{e+='<line x1="'+px(n)+'" y1="'+py(d)+'" x2="'+px(c)+'" y2="'+py(d+1)+'" style="stroke:var(--muted);stroke-width:1.2"/>'});walk(n.l,d+1);walk(n.r,d+1)})(t,0);
          (function walk(n,d){const x=px(n),y=py(d);
            if(n.leaf){const pur=Math.max(n.n0,n.n1)/(n.n0+n.n1);v+='<rect x="'+(x-6)+'" y="'+(y-6)+'" width="12" height="12" style="fill:'+cl(n.c)+';fill-opacity:'+(0.35+0.65*(2*pur-1))+';stroke:var(--fg);stroke-width:1"/>';return}
            if(d===DD){v+='<circle cx="'+x+'" cy="'+y+'" r="6" style="fill:var(--bg);stroke:var(--muted);stroke-width:1.2;stroke-dasharray:2 2"/><text class="lbl" x="'+(x-4)+'" y="'+(y+9)+'">…</text>';return}
            v+='<circle cx="'+x+'" cy="'+y+'" r="6" style="fill:var(--bg);stroke:var(--fg);stroke-width:1.5"/>';
            if(d<=2)v+='<text class="lbl" x="'+(x-17)+'" y="'+(y-10)+'">'+n.f+'≤'+fmt(n.t,2)+'</text>';
            walk(n.l,d+1);walk(n.r,d+1)})(t,0);
          return e+v+'<text class="lbl" x="2" y="170">Gini '+fmt(t.g,2)+' → 0</text>'}
        function curve(md){const x0=34,x1=308,yt=12,yb=96,sxx=d=>x0+(d-1)/7*(x1-x0),syy=a=>yb-(a-0.4)/0.6*(yb-yt);let s='';
          for(const g of[0.5,0.75,1])s+='<line x1="'+x0+'" y1="'+syy(g)+'" x2="'+x1+'" y2="'+syy(g)+'" style="stroke:var(--line);stroke-width:1"/><text class="lbl" x="2" y="'+(syy(g)+4)+'">'+g+'</text>';
          for(let d=1;d<=8;d++)s+='<text class="lbl" x="'+(sxx(d)-3)+'" y="112">'+d+'</text>';
          s+='<path class="ln" d="'+CUR.map((c,i)=>(i?'L':'M')+sxx(i+1)+' '+syy(c[0])).join('')+'"/><path class="ln2" d="'+CUR.map((c,i)=>(i?'L':'M')+sxx(i+1)+' '+syy(c[1])).join('')+'"/>';
          s+='<line x1="'+sxx(md)+'" y1="'+yt+'" x2="'+sxx(md)+'" y2="'+yb+'" style="stroke:var(--fg);stroke-width:1;stroke-dasharray:4 3"/><circle cx="'+sxx(md)+'" cy="'+syy(CUR[md-1][0])+'" r="4.5" style="fill:var(--accent)"/><circle cx="'+sxx(md)+'" cy="'+syy(CUR[md-1][1])+'" r="4.5" style="fill:var(--warn)"/>';
          return s+'<text class="lbl" x="'+(x0+4)+'" y="'+(yt+10)+'" style="fill:var(--accent)">Train</text><text class="lbl" x="'+(x0+50)+'" y="'+(yt+10)+'" style="fill:var(--warn)">Test</text>'}
        // Axes with values at 0, 0.25, 0.5, 0.75 and 1, and the names x and y.
        function axes(){let a='<line class="ax" x1="'+PX+'" y1="'+sy(0)+'" x2="'+sx(1)+'" y2="'+sy(0)+'"/><line class="ax" x1="'+PX+'" y1="'+sy(0)+'" x2="'+PX+'" y2="'+sy(1)+'"/>';
          for(const v of[0,0.25,0.5,0.75,1])a+='<text class="lbl" x="'+sx(v)+'" y="'+(sy(0)+14)+'" text-anchor="middle">'+v+'</text><text class="lbl" x="'+(PX-5)+'" y="'+(sy(v)+3.5)+'" text-anchor="end">'+v+'</text>';
          return a+'<text class="lbl" x="'+(PX+(W-PX-14)/2)+'" y="'+(H-3)+'" text-anchor="middle">x</text><text class="lbl" transform="rotate(-90 9 '+(sy(0.5))+')" x="9" y="'+sy(0.5)+'" text-anchor="middle">y</text>'}
        function draw(){const md=+$('dtD').value;$('dtDO').textContent=md;const t=build(tr,0,md,[0,0,1,1]);
          let s=regions(t);tr.forEach(p=>{s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="3.5" style="fill:'+cl(p.c)+';stroke:var(--fg);stroke-width:1"/>'});
          $('dtSvg').innerHTML=s+axes();$('dtTree').innerHTML=diagram(t);$('dtCurve').innerHTML=curve(md);
          $('dtL').textContent=cnt(t);$('dtTr').textContent=fmt(CUR[md-1][0],2);$('dtTe').textContent=fmt(CUR[md-1][1],2);
          $('dtMsg').textContent=md===1?LernApp.t('Tiefe 1: nur eine Frage, die Fläche hat zwei Rechtecke (Stumpf). Das ist zu einfach.','Depth 1: only one question, the region has two rectangles (a stump). That is too simple.'):md>=6?LernApp.t('Tiefer Baum: Fast jeder Trainingspunkt bekommt sein eigenes Rechteck. Die Trainingskurve steigt weiter, die Testkurve fällt (Overfitting).','Deep tree: almost every training point gets its own rectangle. The training curve keeps rising, the test curve falls (overfitting).'):LernApp.t('Mittlere Tiefe: die groben Bereiche sind erkannt. Beobachte in der Kurve, ab wann die Test-Accuracy nicht mehr steigt.','Medium depth: the rough areas are found. Watch in the curve from which depth the test accuracy stops rising.')}
        $('dtD').addEventListener('input',draw);draw()})();

      // Demo 5d: small neural network (1 hidden layer, tanh), trained step by step in the browser
      (function(){
        const W=320,H=220,sx=x=>x*W,sy=y=>H-y*H,f=v=>(v-0.5)*3,MAXE=2000,cl=c=>c?'var(--accent)':'var(--warn)';
        function gen(kind,n,r){const a=[];for(let i=0;i<n;i++){let x,y,c;
          if(kind==='blobs'){c=i%2;x=Math.min(1,Math.max(0,(c?0.68:0.32)+0.13*gauss(r)));y=Math.min(1,Math.max(0,(c?0.65:0.35)+0.13*gauss(r)))}
          else{x=r();y=r();c=kind==='xor'?((x>0.5)!==(y>0.5)?1:0):(Math.hypot(x-0.5,y-0.5)<0.3?1:0);if(r()<0.05)c=1-c}
          a.push({x:x,y:y,c:c})}return a}
        let kind='circle',tr,te,net,playing=false;
        const act=(p,j)=>Math.tanh(net.w1[j][0]*f(p.x)+net.w1[j][1]*f(p.y)+net.b1[j]);
        const z=p=>{let s=net.b2;for(let j=0;j<net.h;j++)s+=act(p,j)*net.w2[j];return s};
        const loss=set=>set.reduce((s,p)=>{const o=Math.min(1-1e-9,Math.max(1e-9,sigmoid(z(p))));return s-(p.c?Math.log(o):Math.log(1-o))},0)/set.length;
        const acc=set=>set.filter(p=>(z(p)>0?1:0)===p.c).length/set.length;
        function record(){net.L.push({e:net.ep,tr:loss(tr),te:loss(te)})}
        function reset(){playing=false;const r=mulberry32(7);tr=gen(kind,80,r);te=gen(kind,200,r);const h=+$('nnH').value,q=mulberry32(3);net={h:h,w1:[],b1:[],w2:[],b2:0,ep:0,L:[]};
          for(let j=0;j<h;j++){net.w1.push([gauss(q)*0.8,gauss(q)*0.8]);net.b1.push(0);net.w2.push(gauss(q)*0.8)}record();draw()}
        function adv(E){const n=tr.length,h=net.h,lr=0.4;E=Math.min(E,MAXE-net.ep);
          for(let e=0;e<E;e++){const g1=net.w1.map(()=>[0,0]),gb1=net.w1.map(()=>0),g2=net.w2.map(()=>0);let gb2=0;
            tr.forEach(p=>{const u=f(p.x),v=f(p.y),a=[];for(let j=0;j<h;j++)a.push(act(p,j));const d=sigmoid(a.reduce((s,aj,j)=>s+aj*net.w2[j],net.b2))-p.c;
              gb2+=d;a.forEach((aj,j)=>{g2[j]+=d*aj;const dh=d*net.w2[j]*(1-aj*aj);g1[j][0]+=dh*u;g1[j][1]+=dh*v;gb1[j]+=dh})});
            for(let j=0;j<h;j++){net.w1[j][0]-=lr*g1[j][0]/n;net.w1[j][1]-=lr*g1[j][1]/n;net.b1[j]-=lr*gb1[j]/n;net.w2[j]-=lr*g2[j]/n}net.b2-=lr*gb2/n;net.ep++;
            if(net.ep%10===0)record()}
          if(net.L[net.L.length-1].e!==net.ep)record()}
        function neurons(){let s='';for(let j=0;j<net.h;j++){const ox=(j%4)*80+5,oy=Math.floor(j/4)*75+3,cw=7,ch=7.25;
            for(let a=0;a<10;a++)for(let b=0;b<8;b++){const v=act({x:(a+0.5)/10,y:1-(b+0.5)/8},j);s+='<rect x="'+(ox+a*cw)+'" y="'+(oy+b*ch)+'" width="'+(cw+0.4)+'" height="'+(ch+0.4)+'" style="fill:'+cl(v>0)+';opacity:'+Math.abs(v)*0.85+'"/>'}
            s+='<rect x="'+ox+'" y="'+oy+'" width="70" height="58" style="fill:none;stroke:var(--line);stroke-width:1"/><text class="lbl" x="'+ox+'" y="'+(oy+69)+'">N'+(j+1)+' ('+(net.w2[j]>=0?'+':'−')+fmt(Math.abs(net.w2[j]),1)+')</text>'}return s}
        function lossSvg(){const x0=34,x1=312,yt=12,yb=96,ymax=Math.max(0.8,net.L[0].tr,net.L[0].te),X=e=>x0+e/MAXE*(x1-x0),Y=v=>yb-Math.min(v,ymax)/ymax*(yb-yt);
          let s='<line class="ax" x1="'+x0+'" y1="'+yb+'" x2="'+x1+'" y2="'+yb+'"/><line class="ax" x1="'+x0+'" y1="'+yt+'" x2="'+x0+'" y2="'+yb+'"/><text class="lbl" x="'+(x0-4)+'" y="112">0</text><text class="lbl" x="'+(x1-24)+'" y="112">'+MAXE+'</text><text class="lbl" x="2" y="'+(yt+4)+'">'+fmt(ymax,1)+'</text><text class="lbl" x="2" y="'+(yb+4)+'">0</text>';
          s+='<path class="ln" d="'+net.L.map((p,i)=>(i?'L':'M')+X(p.e).toFixed(1)+' '+Y(p.tr).toFixed(1)).join('')+'"/><path class="ln2" d="'+net.L.map((p,i)=>(i?'L':'M')+X(p.e).toFixed(1)+' '+Y(p.te).toFixed(1)).join('')+'"/>';
          return s+'<text class="lbl" x="'+(x0+6)+'" y="'+(yt+10)+'" style="fill:var(--accent)">Train</text><text class="lbl" x="'+(x0+52)+'" y="'+(yt+10)+'" style="fill:var(--warn)">Test</text>'}
        function draw(){$('nnHO').textContent=net.h;let s=gridSvg(W,H,32,22,(x,y)=>z({x:x,y:y})>0?1:0);tr.forEach(p=>{s+='<circle cx="'+sx(p.x)+'" cy="'+sy(p.y)+'" r="3.2" style="fill:'+cl(p.c)+';stroke:var(--fg);stroke-width:1"/>'});
          $('nnSvg').innerHTML=s;$('nnNeu').innerHTML=neurons();$('nnLoss').innerHTML=lossSvg();
          const a=acc(tr),b=acc(te),L=net.L[net.L.length-1];$('nnEp').textContent=net.ep;$('nnTr').textContent=fmt(a,2);$('nnTe').textContent=fmt(b,2);$('nnLs').textContent=fmt(L.tr,2)+' / '+fmt(L.te,2);
          $('nnPlay').textContent=playing?LernApp.t('Pause','Pause'):LernApp.t('Training starten','Start training');
          $('nnMsg').textContent=net.ep===0?LernApp.t('Start: Die Gewichte sind zufällig, die Fläche sagt nichts. Drücke «Training starten» und schau den Neuronen zu.','Start: the weights are random, the region means nothing. Press «Start training» and watch the neurons.'):net.ep<200&&a<0.85?LernApp.t('Das Netz lernt noch: Der Loss sinkt, die Neuronen drehen ihre Linien in die richtige Richtung.','The network is still learning: the loss falls, the neurons turn their lines into the right direction.'):kind!=='blobs'&&net.h<=2&&net.ep>=300?LernApp.t('Mit 1 bis 2 Neuronen reicht die Form nicht: Zwei Linien können keine geschlossene Form ergeben. Der Loss bleibt hoch.','With 1 to 2 neurons the shape is not enough: two lines cannot make a closed shape. The loss stays high.'):a>=0.85?LernApp.t('Das Netz hat die Form gefunden: Jedes Neuron liefert eine Linie, die Ausgabe kombiniert sie.','The network found the shape: each neuron supplies a line, the output combines them.'):LernApp.t('Weiter trainieren: Der Loss sinkt noch.','Keep training: the loss is still falling.')}
        function loop(){if(!playing)return;adv(10);draw();if(net.ep>=MAXE){playing=false;draw()}else requestAnimationFrame(loop)}
        $('nnPlay').addEventListener('click',()=>{if(playing){playing=false;draw();return}if(net.ep>=MAXE)reset();if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){adv(MAXE);draw();return}playing=true;draw();loop()});
        $('nnStep').addEventListener('click',()=>{playing=false;adv(100);draw()});
        $('nnReset').addEventListener('click',reset);$('nnH').addEventListener('input',reset);
        [['nnD1','circle'],['nnD2','xor'],['nnD3','blobs']].forEach(d=>{$(d[0]).addEventListener('click',()=>{kind=d[1];[['nnD1'],['nnD2'],['nnD3']].forEach(x=>{$(x[0]).className=x[0]===d[0]?'pri':''});reset()})});
        reset()})();

      // Demo 6: 100 generated apartments (70 train, 30 test), single tree vs bagging vs boosting (price regression on qm)
      (function(){
        const NTR=70,rg=mulberry32(42),all=[];
        for(let i=0;i<100;i++){const q=Math.round(30+110*rg());all.push({q:q,p:Math.round((700+6*q+600/(1+Math.exp(-(q-85)/3))+90*gauss(rg))/10)*10})}
        const qm=all.slice(0,NTR).map(a=>a.q),pr=all.slice(0,NTR).map(a=>a.p),qt=all.slice(NTR).map(a=>a.q),pt2=all.slice(NTR).map(a=>a.p);
        const W=320,H=230,PX=40,PY=22,XA=25,XB=145,YA=600,YB=2400;
        const sx=x=>PX+((x-XA)/(XB-XA))*(W-PX-12),sy=v=>H-PY-((v-YA)/(YB-YA))*(H-PY-12);
        const mean=a=>a.reduce((p,c)=>p+c,0)/a.length;
        function fit(xs,ys,d){
          if(d===0||xs.length<2)return{v:mean(ys)};
          const o=xs.map((x,i)=>i).sort((a,b)=>xs[a]-xs[b]);let best=null;
          for(let k=1;k<o.length;k++){const a=xs[o[k-1]],b=xs[o[k]];if(a===b)continue;
            const L=o.slice(0,k).map(i=>ys[i]),R=o.slice(k).map(i=>ys[i]),ml=mean(L),mr=mean(R);
            const e=L.reduce((p,c)=>p+(c-ml)*(c-ml),0)+R.reduce((p,c)=>p+(c-mr)*(c-mr),0);
            if(!best||e<best.e)best={e:e,t:(a+b)/2}}
          if(!best)return{v:mean(ys)};
          const li=xs.map((x,i)=>i).filter(i=>xs[i]<=best.t),ri=xs.map((x,i)=>i).filter(i=>xs[i]>best.t);
          return{t:best.t,l:fit(li.map(i=>xs[i]),li.map(i=>ys[i]),d-1),r:fit(ri.map(i=>xs[i]),ri.map(i=>ys[i]),d-1)}}
        const pt=(nd,x)=>nd.t===undefined?nd.v:pt(x<=nd.t?nd.l:nd.r,x);
        function boot(xs,ys,b){const r=mulberry32(100+b),ix=[];for(let i=0;i<xs.length;i++)ix.push(Math.floor(r()*xs.length));return[ix.map(i=>xs[i]),ix.map(i=>ys[i])]}
        function model(xs,ys,mode,d,n,lr){
          if(mode===1){const t=fit(xs,ys,d);return{f:x=>pt(t,x),parts:[]}}
          if(mode===2){const ts=[];for(let b=0;b<n;b++){const bs=boot(xs,ys,b);ts.push(fit(bs[0],bs[1],d))}
            return{f:x=>mean(ts.map(t=>pt(t,x))),parts:ts}}
          const base=mean(ys),ts=[];let res=ys.map(y=>y-base);
          for(let m=0;m<n;m++){const t=fit(xs,res,d);ts.push(t);res=res.map((r,i)=>r-lr*pt(t,xs[i]))}
          return{f:x=>base+lr*ts.reduce((p,t)=>p+pt(t,x),0),parts:[]}}
        let mode=1;
        function rmse(e){return Math.sqrt(mean(e.map(v=>v*v)))}
        function draw(){
          const d=+$('enD').value,n=+$('enN').value,lr=+$('enL').value;
          $('enDO').textContent=d;$('enNO').textContent=n;$('enLO').textContent=fmt(lr,2);
          [1,2,3].forEach(k=>{$('enM'+k).className=k===mode?'pri':''});
          $('enNW').style.display=mode===1?'none':'';$('enLW').style.display=mode===3?'':'none';
          const m=model(qm,pr,mode,d,n,lr);
          let s='<line class="ax" x1="'+PX+'" y1="'+(H-PY)+'" x2="'+(W-8)+'" y2="'+(H-PY)+'"/>';
          for(let t=40;t<=140;t+=20)s+='<text class="lbl" x="'+(sx(t)-8)+'" y="'+(H-6)+'">'+t+'</text>';
          for(const t of[1000,1500,2000])s+='<text class="lbl" x="2" y="'+(sy(t)+3)+'">'+t+'</text>';
          s+='<text class="lbl" x="'+(W-24)+'" y="'+(H-PY-4)+'">'+LernApp.t('qm','m²')+'</text>';
          const path=f=>{let q='';for(let x=XA;x<=XB;x+=0.5)q+=(x===XA?'M':'L')+sx(x).toFixed(1)+' '+sy(f(x)).toFixed(1);return q};
          m.parts.slice(0,20).forEach(t=>{s+='<path d="'+path(x=>pt(t,x))+'" style="fill:none;stroke:var(--warn);stroke-width:1;opacity:.3"/>'});
          s+='<path class="ln" d="'+path(m.f)+'"/>';
          qm.forEach((x,i)=>{s+='<circle cx="'+sx(x)+'" cy="'+sy(pr[i])+'" r="3" style="fill:var(--fg)"/>'});
          qt.forEach((x,i)=>{s+='<circle cx="'+sx(x)+'" cy="'+sy(pt2[i])+'" r="3" style="fill:none;stroke:var(--fg);stroke-width:1.5"/>'});
          $('enSvg').innerHTML=s;
          const tr=qm.map((x,i)=>m.f(x)-pr[i]);
          const lo=qt.map((x,i)=>m.f(x)-pt2[i]);
          $('enTr').textContent=fmt(rmse(tr),0);$('enLo').textContent=fmt(rmse(lo),0);
          $('enMsg').textContent=mode===1?(d>=3?LernApp.t('Tiefer Einzelbaum: Er folgt auch dem Rauschen. Der Fehler im Training ist klein, auf den leeren Test-Wohnungen deutlich grösser (Overfitting).','Deep single tree: It also follows the noise. The error in training is small, on the empty test apartments clearly larger (overfitting).'):LernApp.t('Flacher Einzelbaum: Wenige grobe Stufen. Der Fehler ist schon im Training hoch (Underfitting).','Shallow single tree: A few coarse steps. The error is already high in training (underfitting).'))
            :mode===2?LernApp.t('Bagging: Die orangen Linien sind einzelne Bäume (je auf einer anderen Stichprobe der 70 Trainings-Wohnungen), die blaue Linie ist ihr Mittelwert. Sie ist glatter als ein Einzelbaum, und der Test-Fehler ist tiefer als beim Einzelbaum gleicher Tiefe: Bagging senkt die Varianz. Stelle die Anzahl Bäume auf 1, dann hast du wieder einen einzelnen Baum auf einer Stichprobe.','Bagging: The orange lines are single trees (each on a different sample of the 70 training apartments), the blue line is their mean. It is smoother than a single tree, and the test error is lower than for a single tree of the same depth: bagging lowers the variance. Set the number of trees to 1 and you have a single tree on one sample again.')
            :LernApp.t('Boosting: Die Linie startet beim Durchschnitt (1480 CHF) und nähert sich pro Runde den Preisen. Mit Tiefe 1 und wenigen Runden ist sie grob und im Training noch weit weg. Mit mehr Runden sinkt der Test-Fehler zuerst deutlich. Mit tieferen Bäumen und hoher Lernrate sinkt der Training-Fehler weiter, der Test-Fehler steigt aber wieder: Boosting lernt dann das Rauschen (Overfitting).','Boosting: The line starts at the average (1480 CHF) and gets closer to the prices with each round. With depth 1 and few rounds it is coarse and still far off in training. With more rounds the test error first falls clearly. With deeper trees and a high learning rate the training error keeps falling, but the test error rises again: boosting then learns the noise (overfitting).')}
        [1,2,3].forEach(k=>{$('enM'+k).addEventListener('click',()=>{mode=k;$('enD').value=k===3?1:3;$('enN').value=k===3?30:20;draw()})});
        ['enD','enN','enL'].forEach(id=>$(id).addEventListener('input',draw));draw()})();
  };
})();
