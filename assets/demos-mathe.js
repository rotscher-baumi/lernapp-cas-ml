/* Interactive demos for the Mathe pages (shared by mathe-kompakt and mathe-ausfuehrlich). */
(function () {
  const { $, fmt, t: tr } = LernApp;
  window.MatheDemos = {
    deriv: function () {
      (function(){
        const W=320,H=200,X0=-5,X1=7,Y1=50;
        const sx=x=>(x-X0)/(X1-X0)*W,sy=y=>H-14-(y/Y1)*(H-26);
        function draw(){
          const x=+$('dvX').value,h=+$('dvH').value;
          $('dvXO').textContent=fmt(x,1);$('dvHO').textContent=fmt(h,2);
          const f=v=>v*v,slope=(f(x+h)-f(x))/h,der=2*x;
          $('dvSec').textContent=fmt(slope,2);$('dvDer').textContent=fmt(der,2);
          let curve='';for(let i=0;i<=100;i++){const xv=X0+i*(X1-X0)/100;curve+=(i?'L':'M')+sx(xv).toFixed(1)+' '+sy(xv*xv).toFixed(1)}
          const seg=m=>'x1="'+sx(X0)+'" y1="'+sy(f(x)+m*(X0-x))+'" x2="'+sx(X1)+'" y2="'+sy(f(x)+m*(X1-x))+'"';
          let s='<line class="ax" x1="0" y1="'+(H-14)+'" x2="'+W+'" y2="'+(H-14)+'"/><line class="ax" x1="'+sx(0)+'" y1="0" x2="'+sx(0)+'" y2="'+H+'"/>';
          s+='<path class="ln" d="'+curve+'"/>';
          s+='<line class="dash" '+seg(der)+'/><line class="ln2" '+seg(slope)+'/>';
          s+='<circle cx="'+sx(x)+'" cy="'+sy(f(x))+'" r="5" style="fill:var(--fg)"/><text class="lbl" x="'+(sx(x)+7)+'" y="'+(sy(f(x))-7)+'">P</text>';
          s+='<circle cx="'+sx(x+h)+'" cy="'+sy(f(x+h))+'" r="5" style="fill:var(--warn)"/><text class="lbl" x="'+(sx(x+h)+7)+'" y="'+(sy(f(x+h))-7)+'">Q</text>';
          $('dvSvg').innerHTML=s}
        $('dvX').addEventListener('input',draw);$('dvH').addEventListener('input',draw);draw()})();
    },
    stats: function () {
      (function(){
        const W=320,X0=0,X1=42,base=[3,4,5,5,6,7,8],L=14,R=306;
        const sx=x=>L+(x-X0)/(X1-X0)*(R-L),sz=z=>L+(z+3)/6*(R-L);
        const sd=a=>{const m=a.reduce((p,c)=>p+c,0)/a.length;return Math.sqrt(a.reduce((p,c)=>p+(c-m)*(c-m),0)/a.length)};
        function draw(){
          const o=+$('stOut').value;$('stOutO').textContent=fmt(o,1);
          const v=base.concat([o]),n=v.length,m=v.reduce((p,c)=>p+c,0)/n,so=sd(v);
          const srt=v.slice().sort((p,c)=>p-c),med=(srt[n/2-1]+srt[n/2])/2;
          const z=v.map(x=>(x-m)/so),m2=z.reduce((p,c)=>p+c,0)/n,s2=sd(z);
          const z0=v=>Math.abs(v)<1e-9?0:v,zmed=(med-m)/so,last=n-1;
          const sum=v.reduce((p,c)=>p+c,0);
          $('stTab').innerHTML='<tr><th></th><th>'+tr('Rohwerte','Raw values')+'</th><th>'+tr('Nach Scaler','After scaler')+'</th></tr>'+
            '<tr><td><b>'+tr('Mittelwert','Mean')+'</b></td><td>'+fmt(m,2)+'</td><td>'+fmt(z0(m2),2)+'</td></tr>'+
            '<tr><td><b>Median</b></td><td>'+fmt(med,2)+'</td><td>'+fmt(zmed,2)+'</td></tr>'+
            '<tr><td><b>Std</b></td><td>'+fmt(so,2)+'</td><td>'+fmt(s2,2)+'</td></tr>';
          $('stEx').innerHTML=tr('<b>So liest du die Zahlen:</b><br>'+
            '<b>Mittelwert '+fmt(m,2)+'</b>: Summe '+fmt(sum,1)+' geteilt durch '+n+' Werte. Nach dem Scaler ist er 0, weil von jedem Wert '+fmt(m,2)+' abgezogen wurde: Die Abstände nach links und nach rechts heben sich genau auf.<br>'+
            '<b>Std '+fmt(so,2)+'</b>: So weit liegen die Werte typischerweise vom Mittelwert weg. Nach dem Scaler ist sie 1, weil jeder Abstand durch '+fmt(so,2)+' geteilt wurde: Der typische Abstand ist jetzt «1 Einheit».<br>'+
            '<b>Median '+fmt(med,2)+'</b> (Mitte der sortierten Werte) wird nicht 0, sondern '+fmt(zmed,2)+': Der Scaler zentriert auf den Mittelwert, nicht auf den Median. Ist der Median nach dem Scaler weit von 0 weg, haben die Daten Ausreisser oder sind schief.<br>'+
            '<b>Beispiel Ausreisser:</b> z = ('+fmt(v[last],1)+' − '+fmt(m,2)+') / '+fmt(so,2)+' = <b>'+fmt(z[last],2)+'</b>, also '+fmt(z[last],2)+' Std über dem Durchschnitt.',
            '<b>How to read the numbers:</b><br>'+
            '<b>Mean '+fmt(m,2)+'</b>: sum '+fmt(sum,1)+' divided by '+n+' values. After the scaler it is 0, because '+fmt(m,2)+' was subtracted from every value: the distances to the left and to the right cancel out exactly.<br>'+
            '<b>Std '+fmt(so,2)+'</b>: this is how far the values typically lie from the mean. After the scaler it is 1, because every distance was divided by '+fmt(so,2)+': the typical distance is now «1 unit».<br>'+
            '<b>Median '+fmt(med,2)+'</b> (middle of the sorted values) does not become 0, but '+fmt(zmed,2)+': the scaler centres on the mean, not on the median. If the median is far from 0 after the scaler, the data have outliers or are skewed.<br>'+
            '<b>Outlier example:</b> z = ('+fmt(v[last],1)+' − '+fmt(m,2)+') / '+fmt(so,2)+' = <b>'+fmt(z[last],2)+'</b>, i.e. '+fmt(z[last],2)+' std above the average.');
          const y1=90,y2=205;let s='';
          s+='<text class="lbl" x="'+L+'" y="14">'+tr('Rohwerte (100 CHF)','Raw values (100 CHF)')+'</text>';
          s+='<rect x="'+sx(Math.max(m-so,X0))+'" y="30" width="'+(sx(Math.min(m+so,X1))-sx(Math.max(m-so,X0)))+'" height="'+(y1+22-30)+'" style="fill:var(--accent);opacity:.13"/>';
          s+='<line class="ax" x1="'+L+'" y1="'+(y1+22)+'" x2="'+R+'" y2="'+(y1+22)+'"/>';
          for(let t=0;t<=40;t+=10){s+='<text class="lbl" x="'+(sx(t)-4)+'" y="'+(y1+36)+'">'+t+'</text>'}
          s+='<line class="ln" x1="'+sx(m)+'" y1="30" x2="'+sx(m)+'" y2="'+(y1+22)+'"/>';
          s+='<line class="dash" x1="'+sx(med)+'" y1="30" x2="'+sx(med)+'" y2="'+(y1+22)+'"/>';
          v.forEach((x,i)=>{const yy=y1-(i%3)*12;s+='<circle cx="'+sx(x)+'" cy="'+yy+'" r="5" style="fill:'+(i===n-1?'var(--warn)':'var(--fg)')+'"/>'});
          s+='<text class="lbl" x="'+Math.min(sx(m)+4,R-52)+'" y="42">'+tr('Mittel','Mean')+'</text>';
          s+='<text class="lbl" x="'+L+'" y="150">'+tr('nach StandardScaler (z-Werte)','after StandardScaler (z-values)')+'</text>';
          s+='<line class="ax" x1="'+L+'" y1="'+y2+'" x2="'+R+'" y2="'+y2+'"/>';
          for(let t=-3;t<=3;t++){s+='<text class="lbl" x="'+(sz(t)-5)+'" y="'+(y2+16)+'">'+t+'</text><line class="ax" x1="'+sz(t)+'" y1="'+(y2-3)+'" x2="'+sz(t)+'" y2="'+(y2+3)+'"/>'}
          s+='<rect x="'+sz(-1)+'" y="160" width="'+(sz(1)-sz(-1))+'" height="'+(y2-160)+'" style="fill:var(--accent);opacity:.13"/>';
          s+='<line class="ln" x1="'+sz(0)+'" y1="160" x2="'+sz(0)+'" y2="'+y2+'"/>';
          z.forEach((x,i)=>{const yy=y2-12-(i%3)*12;s+='<circle cx="'+sz(x)+'" cy="'+yy+'" r="5" style="fill:'+(i===n-1?'var(--warn)':'var(--fg)')+'"/>'});
          $('stSvg').innerHTML=s}
        $('stOut').addEventListener('input',draw);draw()})();
    },
    scaler: function () {
      (function(){
        const base=[3,4,5,5,6,7,8],L=14,R=306;let step=1;
        const mean=a=>a.reduce((p,c)=>p+c,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(v=>(v-m)*(v-m))))};
        const z0=v=>Math.abs(v)<1e-9?0:v;
        function draw(){
          const o=+$('ssOut').value;$('ssOutO').textContent=fmt(o,1);
          const x=base.concat([o]),n=x.length,m=mean(x),so=sd(x),d=x.map(v=>v-m),z=d.map(v=>v/so);
          const cur=step===1?x:step===2?d:z,lo=step===1?0:step===2?-14:-3,hi=step===1?42:step===2?32:3;
          const sx=v=>L+(v-lo)/(hi-lo)*(R-L),c=step===1?m:0,w=step===3?1:so;
          let s='<rect x="'+sx(Math.max(c-w,lo))+'" y="14" width="'+(sx(Math.min(c+w,hi))-sx(Math.max(c-w,lo)))+'" height="62" style="fill:var(--accent);opacity:.13"/>';
          s+='<line class="ax" x1="'+L+'" y1="82" x2="'+R+'" y2="82"/>';
          const tk=step===1?[0,10,20,30,40]:step===2?[-10,0,10,20,30]:[-3,-2,-1,0,1,2,3];
          tk.forEach(t=>{s+='<line class="ax" x1="'+sx(t)+'" y1="79" x2="'+sx(t)+'" y2="85"/><text class="lbl" x="'+(sx(t)-6)+'" y="98">'+t+'</text>'});
          s+='<line class="ln" x1="'+sx(c)+'" y1="14" x2="'+sx(c)+'" y2="82"/>';
          cur.forEach((v,i)=>{s+='<circle cx="'+sx(v)+'" cy="'+(70-(i%3)*14)+'" r="5" style="fill:'+(i===n-1?'var(--warn)':'var(--fg)')+'"/>'});
          s+='<text class="lbl" x="'+L+'" y="11">'+(step===1?tr('Mittelwert und Band ± Std','Mean and band ± std'):step===2?tr('Mittelwert liegt jetzt bei 0','Mean is now at 0'):tr('Band ± Std ist jetzt genau ± 1','Band ± std is now exactly ± 1'))+'</text>';
          s+='<text class="lbl" x="'+(L+130)+'" y="114">'+(step===1?'x':step===2?tr('x − Mittelwert','x − mean'):tr('z = (x − Mittelwert) / Std','z = (x − mean) / std'))+'</text>';
          $('ssSvg').innerHTML=s;
          let t='<tr><th>x</th><th>'+tr('x − Mittel','x − mean')+'</th><th>z</th>'+(step>=3?'<th>z²</th>':'')+'</tr>';
          x.forEach((v,i)=>{t+='<tr'+(i===n-1?' style="color:var(--warn)"':'')+'><td>'+fmt(v,1)+'</td><td>'+(step>=2?fmt(d[i],2):'')+'</td><td>'+(step>=3?fmt(z[i],2):'')+'</td>'+(step>=3?'<td>'+fmt(z[i]*z[i],2)+'</td>':'')+'</tr>'});
          const ms=[m,0,0][step-1],ss=[so,so,sd(z)][step-1];
          t+='<tr><td><b>'+tr('Mittelwert','Mean')+'</b></td><td><b>'+(step>=2?fmt(z0(mean(d)),2):'')+'</b></td><td><b>'+(step>=3?fmt(z0(mean(z)),2):'')+'</b></td>'+(step>=3?'<td><b>'+fmt(mean(z.map(v=>v*v)),2)+'</b></td>':'')+'</tr>';
          if(step>=3)t+='<tr><td><b>'+tr('Summe','Sum')+'</b></td><td></td><td></td><td><b>'+fmt(z.reduce((q,v)=>q+v*v,0),2)+'</b></td></tr>';
          $('ssTab').innerHTML=t;
          $('ssM').textContent=fmt(z0(mean(cur)),2);$('ssS').textContent=fmt(sd(cur),2);
          $('ssNote').innerHTML=step===1?tr('Mittelwert '+fmt(m,2)+', Std '+fmt(so,2)+': Der Ausreisser vergrössert beide.','Mean '+fmt(m,2)+', std '+fmt(so,2)+': the outlier increases both.'):step===2?tr('Alles um '+fmt(m,2)+' nach links geschoben: Mittelwert 0. Die Std bleibt '+fmt(so,2)+', denn die Abstände zum Mittelwert haben sich nicht geändert.','Everything shifted '+fmt(m,2)+' to the left: mean 0. The std stays '+fmt(so,2)+', because the distances to the mean have not changed.'):tr('Alles durch '+fmt(so,2)+' geteilt: Std 1. Der Ausreisser bleibt der äusserste Punkt (z = '+fmt(z[n-1],2)+'). Probe: Summe der z² = n, Mittelwert der z² = 1. Mit n − 1 (Pandas <code>df.std()</code>) wäre die Std '+fmt(Math.sqrt(n/(n-1)),3)+'.','Everything divided by '+fmt(so,2)+': std 1. The outlier stays the outermost point (z = '+fmt(z[n-1],2)+'). Check: sum of z² = n, mean of z² = 1. With n − 1 (Pandas <code>df.std()</code>) the std would be '+fmt(Math.sqrt(n/(n-1)),3)+'.');
          [1,2,3].forEach(k=>$('ssB'+k).classList.toggle('pri',k===step))}
        [1,2,3].forEach(k=>$('ssB'+k).addEventListener('click',()=>{step=k;draw()}));
        $('ssOut').addEventListener('input',draw);draw()})();
    },
  };
})();
