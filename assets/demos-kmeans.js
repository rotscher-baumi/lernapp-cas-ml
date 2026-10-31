/* Interactive k-means demo (shared by the Unsupervised and Grafiken chapters).
 * KMeansDemo.html(p) returns the markup, KMeansDemo.init(p) wires it; p is the id prefix, so several copies can live on one page. */
(function () {
  const { $, fmt } = LernApp;

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  const COL=['var(--accent)','var(--warn)','var(--ok)','var(--bad)','#8A5CD0','#C0527A','#3A9AA8','#8A8A3A'];
  const d2=(a,b)=>(a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]);
  // One k-means half-step each: assign to nearest centre (returns true if labels changed), move centres to the mean.
  function assign(pts,cent,lab){let ch=false;pts.forEach((p,i)=>{let b=0,bd=Infinity;cent.forEach((c,j)=>{const d=d2(p,c);if(d<bd){bd=d;b=j}});if(lab[i]!==b){lab[i]=b;ch=true}});return ch}
  function update(pts,cent,lab){cent.forEach((c,j)=>{let sx=0,sy=0,n=0;pts.forEach((p,i)=>{if(lab[i]===j){sx+=p[0];sy+=p[1];n++}});if(n){c[0]=sx/n;c[1]=sy/n}})}
  function wss(pts,cent,lab){let s=0;pts.forEach((p,i)=>{s+=d2(p,cent[lab[i]])});return s}
  function dot(x,y,c,rad){return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(rad||3.5)+'" style="fill:'+c+';stroke:var(--fg);stroke-width:.8"/>'}

  const LBL='<span style="align-self:center;font-size:14px;min-width:5.5em">';
  const DONE={gauss:'Klar getrennte, runde Haufen sind der Idealfall. Probiere «Neuer Start» mit «Zufällig»: Manchmal landen zwei Zentren im selben Haufen.',
    circles:'Die Kreise sind verschieden gross. k-Means bevorzugt ähnlich grosse Cluster und schneidet darum oft durch den grossen Kreis.',
    smiley:'Gesicht, Augen und Mund sind für dich klare Gruppen. k-Means zieht aber nur gerade Grenzen und zerschneidet den Ring.',
    moons:'k-Means sucht runde Gruppen und trennt mit geraden Linien. Die Monde werden darum zerschnitten. Hier hilft DBSCAN.',
    rings:'Beide Ringe haben dasselbe Zentrum. k-Means kann sie nicht trennen und schneidet sie wie eine Torte.',
    uniform:'Es gibt keine echten Gruppen, trotzdem liefert k-Means k Cluster. Das Ergebnis allein beweist nicht, dass Gruppen existieren.',
    draw:'Probiere «Neuer Start» oder eine andere Startmethode: Kommt dasselbe heraus?'};

  // Data lives in x ∈ [-1.4, 1.4], y ∈ [-1, 1] so distances look the same as on screen.
  function gen(s,r){const p=[],g=(cx,cy,sd,m)=>{for(let i=0;i<m;i++)p.push([cx+sd*gauss(r),cy+sd*gauss(r)])},
      ring=(cx,cy,R,m,a0,a1,nz)=>{for(let i=0;i<m;i++){const a=a0+(a1-a0)*r(),rr=R+nz*gauss(r);p.push([cx+rr*Math.cos(a),cy+rr*Math.sin(a)])}};
    if(s==='gauss'){g(-0.8,0.45,0.18,50);g(0.75,0.4,0.18,50);g(0,-0.55,0.18,50)}
    else if(s==='circles'){[[-0.7,0.3,0.55],[0.6,0.45,0.42],[0.15,-0.55,0.38],[-0.95,-0.65,0.25],[1.05,-0.55,0.28]].forEach(c=>{const m=Math.round(260*c[2]*c[2]);for(let i=0;i<m;i++){const a=2*Math.PI*r(),rr=c[2]*Math.sqrt(r());p.push([c[0]+rr*Math.cos(a),c[1]+rr*Math.sin(a)])}})}
    else if(s==='smiley'){ring(0,0,0.92,130,0,2*Math.PI,0.03);g(-0.33,0.32,0.07,25);g(0.33,0.32,0.07,25);ring(0,0.05,0.52,50,Math.PI*1.15,Math.PI*1.85,0.03)}
    else if(s==='moons'){for(let i=0;i<150;i++){const t=Math.PI*r(),up=i%2===0,x=up?Math.cos(t):1-Math.cos(t),y=up?Math.sin(t):0.5-Math.sin(t);p.push([(x-0.5)*0.85+0.05*gauss(r),(y-0.25)*0.85+0.05*gauss(r)])}}
    else if(s==='rings'){ring(0,0,0.35,60,0,2*Math.PI,0.05);ring(0,0,0.9,120,0,2*Math.PI,0.05)}
    else if(s==='uniform'){for(let i=0;i<200;i++)p.push([2.6*r()-1.3,1.9*r()-0.95])}
    return p}

  window.KMeansDemo = {
    html: function (p) {
      return `<p class="hint">Wähle die Form der Daten, k und wie die Startzentren gesetzt werden. «Bis fertig» lässt den Algorithmus laufen, bis sich nichts mehr ändert.</p>
    <div class="btnrow" id="${p}Shape" role="group" aria-label="Datenform">${LBL}Daten</span><button data-v="gauss">3 Haufen</button><button data-v="circles">Gepackte Kreise</button><button data-v="smiley">Smiley</button><button data-v="moons">Monde</button><button data-v="rings">Ringe</button><button data-v="uniform">Gleichverteilt</button><button data-v="draw">Selber zeichnen</button></div>
    <div class="btnrow" id="${p}Ks" role="group" aria-label="Anzahl Cluster k">${LBL}k</span><button data-v="1">1</button><button data-v="2">2</button><button data-v="3">3</button><button data-v="4">4</button><button data-v="5">5</button><button data-v="6">6</button></div>
    <div class="btnrow" id="${p}Init" role="group" aria-label="Startmethode">${LBL}Start</span><button data-v="random">Zufällig</button><button data-v="far">Am weitesten weg</button><button data-v="pick">Selber setzen</button></div>
    <svg class="plot" id="${p}Svg" viewBox="0 0 320 240" role="img" aria-label="Datenpunkte mit k-Means-Zentren; Hintergrund zeigt das nächste Zentrum"></svg>
    <div class="btnrow"><button id="${p}Step">1 Schritt</button><button class="pri" id="${p}Run">Bis fertig</button><button id="${p}New">Neuer Start</button></div>
    <div class="stats"><span>Schritt <b id="${p}N"></b></span><span>Als Nächstes <b id="${p}Nx"></b></span><span>WSS <b id="${p}W"></b></span></div>
    <p class="hint" id="${p}Msg"></p>`;
    },
    init: function (p) {
      const W=320,H=240,sx=q=>160+100*q[0],sy=q=>120-100*q[1],el=s=>$(p+s);
      let shape='gauss',k=3,init='random',seed=1,pts=[],cent=[],lab=[],ready=false,picking=false,n=0,next='assign',done=false,timer=null,note='';
      function newData(){pts=shape==='draw'?[]:gen(shape,mulberry32(seed*104729+7));restart()}
      function restart(){stop();note='';cent=[];lab=new Array(pts.length).fill(-1);n=0;next='assign';done=false;ready=false;picking=false;
        if(pts.length>=k)placeCentres();draw()}
      function placeCentres(){
        if(init==='pick'){picking=true;return}
        const r=mulberry32(seed*7919+k);
        if(init==='random'){const idx=[];while(idx.length<k){const i=Math.floor(r()*pts.length);if(idx.indexOf(i)<0)idx.push(i)}cent=idx.map(i=>pts[i].slice())}
        else{cent=[pts[Math.floor(r()*pts.length)].slice()];
          while(cent.length<k){let bi=0,bd=-1;pts.forEach((q,i)=>{const d=Math.min.apply(null,cent.map(c=>d2(q,c)));if(d>bd){bd=d;bi=i}});cent.push(pts[bi].slice())}}
        ready=true}
      // One half-step (assign or move centres). Returns false when there is nothing more to run.
      function step(){note='';
        if(done){draw();return false}
        if(!ready){
          if(picking)note='Setze zuerst die Startzentren: Klicke noch '+(k-cent.length)+'-mal ins Feld.';
          else if(pts.length<k)note='Zeichne zuerst Punkte: mindestens '+k+'.';
          else placeCentres();
          draw();return ready}
        if(next==='assign'){const ch=assign(pts,cent,lab);if(!ch&&n>0)done=true;else next='update'}
        else{update(pts,cent,lab);next='assign'}
        n++;draw();return !done}
      function stop(){if(timer){clearInterval(timer);timer=null}el('Run').textContent='Bis fertig'}
      function run(){if(timer){stop();return}
        if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){for(let i=0;i<500&&step();i++);return}
        if(!step())return;timer=setInterval(()=>{if(!step())stop()},400);el('Run').textContent='Stopp'}
      function cross(c,col){const x=sx(c),y=sy(c),d='M'+(x-8)+' '+y+'H'+(x+8)+'M'+x+' '+(y-8)+'V'+(y+8);
        return '<path d="'+d+'" style="stroke:'+col+';stroke-width:5;fill:none"/><path d="'+d+'" style="stroke:var(--fg);stroke-width:1.4;fill:none"/>'}
      function draw(){let s='';
        if(cent.length){const g=5;s+='<g shape-rendering="crispEdges">';
          for(let y=0;y<H;y+=g)for(let x=0;x<W;x+=g){const q=[(x+g/2-160)/100,(120-y-g/2)/100];let b=0,bd=Infinity;cent.forEach((c,j)=>{const d=d2(q,c);if(d<bd){bd=d;b=j}});
            s+='<rect x="'+x+'" y="'+y+'" width="'+g+'" height="'+g+'" style="fill:'+COL[b%COL.length]+';fill-opacity:.13"/>'}
          s+='</g>'}
        pts.forEach((q,i)=>{s+=dot(sx(q),sy(q),lab[i]<0?'var(--muted)':COL[lab[i]%COL.length],2.6)});
        cent.forEach((c,j)=>{s+=cross(c,COL[j%COL.length])});
        el('Svg').innerHTML=s;el('Svg').style.cursor=picking||(shape==='draw'&&n===0)?'crosshair':'';
        el('N').textContent=n;el('Nx').textContent=!ready||done?'–':next==='assign'?'Zuordnen':'Zentren verschieben';
        el('W').textContent=lab.length&&lab.every(l=>l>=0)?fmt(wss(pts,cent,lab),2):'–';
        el('Msg').textContent=note?note
          :picking?'Klicke ins Feld, um die Startzentren zu setzen. Noch '+(k-cent.length)+'.'
          :!ready?(pts.length?'Klicke weiter, um mehr Punkte zu sprühen. Dann «1 Schritt» oder «Bis fertig».':'Klicke ins Feld: Jeder Klick sprüht ein paar Punkte. Dann «1 Schritt» oder «Bis fertig».')
          :done?'Fertig nach '+n+' Schritten: Die Zuordnung ändert sich nicht mehr. '+DONE[shape]
          :n===0?'Startzentren gesetzt (Kreuze). Die Hintergrundfarbe zeigt, welches Zentrum am nächsten ist. Als Nächstes wird jeder Punkt dem nächsten Zentrum zugeordnet.'+(shape==='draw'?' Du kannst noch Punkte dazuklicken.':'')
          :next==='update'?'Zugeordnet: Jeder Punkt hat die Farbe seines nächsten Zentrums. Als Nächstes wandert jedes Zentrum in die Mitte seiner Punkte.'
          :'Verschoben: Jedes Zentrum sitzt jetzt im Mittelwert seiner Punkte. Als Nächstes werden die Punkte neu zugeordnet.'}
      el('Svg').addEventListener('click',e=>{const b=el('Svg').getBoundingClientRect(),q=[((e.clientX-b.left)/b.width*W-160)/100,(120-(e.clientY-b.top)/b.height*H)/100];note='';
        if(picking){cent.push(q);if(cent.length>=k){picking=false;ready=true}draw()}
        else if(shape==='draw'&&n===0){for(let i=0;i<8;i++){pts.push([q[0]+0.07*gauss(Math.random),q[1]+0.07*gauss(Math.random)]);lab.push(-1)}draw()}});
      function seg(id,cur,fn){const grp=el(id),mark=v=>grp.querySelectorAll('button').forEach(b=>{const on=b.dataset.v===String(v);b.className=on?'pri':'';b.setAttribute('aria-pressed',on)});
        grp.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mark(b.dataset.v);fn(b.dataset.v)});mark(cur)}
      seg('Shape',shape,v=>{shape=v;seed++;newData()});
      seg('Ks',k,v=>{k=+v;restart()});
      seg('Init',init,v=>{init=v;restart()});
      el('Step').addEventListener('click',()=>{stop();step()});
      el('Run').addEventListener('click',run);
      el('New').addEventListener('click',()=>{seed++;restart()});
      newData();
    },
  };
})();
