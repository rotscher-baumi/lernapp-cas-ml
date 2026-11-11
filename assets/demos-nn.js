/* Demos of the «Neural Networks» chapter. modules/nn.js calls LernApp.demos.nn() once the chapter is in the page. */
(function () {
  const { $, fmt, mulberry32, gauss } = LernApp;
  const MU = '−';
  const sg = (z) => 1 / (1 + Math.exp(-z));

  // ---- Library (no DOM): activations, a small MLP with backpropagation, optimizers, data ----
  const ACT = {
    sigmoid: { f: sg, d: (z) => sg(z) * (1 - sg(z)) },
    tanh: { f: Math.tanh, d: (z) => 1 - Math.tanh(z) ** 2 },
    relu: { f: (z) => (z > 0 ? z : 0), d: (z) => (z > 0 ? 1 : 0) },
    leaky: { f: (z) => (z > 0 ? z : 0.01 * z), d: (z) => (z > 0 ? 1 : 0.01) },
    linear: { f: (z) => z, d: () => 1 },
  };

  // Layers with sizes like [2, 8, 1]: hidden layers use `act`, the output is a sigmoid (binary classification).
  // Weights: zero-mean Gaussian, Xavier (1/n_in) for sigmoid/tanh, Kaiming (2/n_in) for ReLU.
  function makeNet(sizes, act, seed) {
    const r = mulberry32(seed), W = [], B = [];
    for (let l = 0; l < sizes.length - 1; l++) {
      const nin = sizes[l], nout = sizes[l + 1];
      const sd = Math.sqrt((act === 'relu' || act === 'leaky' ? 2 : 1) / nin);
      W.push(Array.from({ length: nout }, () => Array.from({ length: nin }, () => gauss(r) * sd)));
      B.push(new Array(nout).fill(0));
    }
    return { sizes: sizes, act: act, W: W, B: B, L: sizes.length - 1 };
  }
  const cloneNet = (n) => ({ sizes: n.sizes, act: n.act, L: n.L, W: n.W.map((w) => w.map((row) => row.slice())), B: n.B.map((b) => b.slice()) });

  // Forward pass. p = dropout rate on hidden activations (inverted dropout), only while training.
  function forward(net, x, p, r) {
    const A = [x], Z = [null], M = [null], f = ACT[net.act].f;
    for (let l = 0; l < net.L; l++) {
      const a = A[l], W = net.W[l], b = net.B[l], z = new Array(W.length), last = l === net.L - 1;
      for (let j = 0; j < W.length; j++) { let s = b[j]; const w = W[j]; for (let i = 0; i < a.length; i++) s += w[i] * a[i]; z[j] = s; }
      let out = z.map(last ? sg : f), m = null;
      if (!last && p > 0) { m = out.map(() => (r() < p ? 0 : 1 / (1 - p))); out = out.map((v, j) => v * m[j]); }
      Z.push(z); A.push(out); M.push(m);
    }
    return { A: A, Z: Z, M: M };
  }
  const predict = (net, x) => forward(net, x, 0, null).A[net.L][0];
  const bce = (p, y) => -(y * Math.log(Math.max(p, 1e-12)) + (1 - y) * Math.log(Math.max(1 - p, 1e-12)));
  function meanLoss(net, X, Y) { let s = 0; for (let n = 0; n < X.length; n++) s += bce(predict(net, X[n]), Y[n]); return s / X.length; }
  function accuracy(net, X, Y) { let k = 0; for (let n = 0; n < X.length; n++) if ((predict(net, X[n]) >= 0.5 ? 1 : 0) === Y[n]) k++; return k / X.length; }

  // Backpropagation for sigmoid output + cross-entropy: delta at the output is (y_hat - y); then chain rule backwards.
  function grads(net, X, Y, p, r) {
    const gW = net.W.map((w) => w.map((row) => row.map(() => 0))), gB = net.B.map((b) => b.map(() => 0));
    const fd = ACT[net.act].d;
    let loss = 0;
    for (let n = 0; n < X.length; n++) {
      const { A, Z, M } = forward(net, X[n], p, r), yh = A[net.L][0];
      loss += bce(yh, Y[n]);
      let delta = [yh - Y[n]];
      for (let l = net.L - 1; l >= 0; l--) {
        const a = A[l];
        for (let j = 0; j < delta.length; j++) { gB[l][j] += delta[j]; for (let i = 0; i < a.length; i++) gW[l][j][i] += delta[j] * a[i]; }
        if (l > 0) {
          const prev = new Array(net.sizes[l]);
          for (let i = 0; i < prev.length; i++) {
            let s = 0;
            for (let j = 0; j < delta.length; j++) s += net.W[l][j][i] * delta[j];
            prev[i] = s * fd(Z[l][i]) * (M[l] ? M[l][i] : 1);
          }
          delta = prev;
        }
      }
    }
    const k = 1 / X.length;
    gW.forEach((w) => w.forEach((row) => row.forEach((v, i) => { row[i] = v * k; })));
    gB.forEach((b) => b.forEach((v, i) => { b[i] = v * k; }));
    return { gW: gW, gB: gB, loss: loss * k };
  }

  // Adam on all parameters of a net (defaults of the paper: beta1 0.9, beta2 0.999, eps 1e-8).
  function adamState(net) {
    const z = () => ({ W: net.W.map((w) => w.map((row) => row.map(() => 0))), B: net.B.map((b) => b.map(() => 0)) });
    return { m: z(), v: z(), t: 0 };
  }
  function adamStep(net, g, st, lr) {
    const b1 = 0.9, b2 = 0.999, eps = 1e-8;
    st.t++;
    const c1 = 1 - Math.pow(b1, st.t), c2 = 1 - Math.pow(b2, st.t);
    const upd = (arr, gar, m, v) => { for (let i = 0; i < arr.length; i++) {
      m[i] = b1 * m[i] + (1 - b1) * gar[i]; v[i] = b2 * v[i] + (1 - b2) * gar[i] * gar[i];
      arr[i] -= lr * (m[i] / c1) / (Math.sqrt(v[i] / c2) + eps);
    } };
    for (let l = 0; l < net.L; l++) {
      for (let j = 0; j < net.W[l].length; j++) upd(net.W[l][j], g.gW[l][j], st.m.W[l][j], st.v.W[l][j]);
      upd(net.B[l], g.gB[l], st.m.B[l], st.v.B[l]);
    }
  }

  // Two interleaving half circles («moons») with Gaussian noise; returns points and 0/1 labels.
  function makeMoons(n, noise, r) {
    const X = [], Y = [];
    for (let i = 0; i < n; i++) {
      const c = i % 2, th = Math.PI * r();
      const x = c === 0 ? Math.cos(th) : 1 - Math.cos(th), y = c === 0 ? Math.sin(th) : 0.5 - Math.sin(th);
      X.push([x + noise * gauss(r), y + noise * gauss(r)]); Y.push(c);
    }
    return { X: X, Y: Y };
  }

  // Optimizers on f(x, y) = 20 x^2 + 0.5 y^2 (a narrow valley: steep in x, flat in y). Returns the path of each optimizer.
  const SURF = { f: (p) => 20 * p[0] * p[0] + 0.5 * p[1] * p[1], g: (p) => [40 * p[0], p[1]] };
  function race(start, lr, steps) {
    const names = ['sgd', 'momentum', 'rmsprop', 'adam'], out = {};
    names.forEach((nm) => {
      let p = start.slice(), v = [0, 0], s = [0, 0], m = [0, 0], w = [0, 0];
      const path = [p.slice()];
      for (let t = 1; t <= steps; t++) {
        const g = SURF.g(p), q = p.slice();
        for (let i = 0; i < 2; i++) {
          if (nm === 'sgd') q[i] = p[i] - lr * g[i];
          else if (nm === 'momentum') { v[i] = 0.9 * v[i] + g[i]; q[i] = p[i] - lr * v[i]; }
          else if (nm === 'rmsprop') { s[i] = 0.9 * s[i] + 0.1 * g[i] * g[i]; q[i] = p[i] - lr * g[i] / (Math.sqrt(s[i]) + 1e-8); }
          else { m[i] = 0.9 * m[i] + 0.1 * g[i]; w[i] = 0.999 * w[i] + 0.001 * g[i] * g[i]; q[i] = p[i] - lr * (m[i] / (1 - Math.pow(0.9, t))) / (Math.sqrt(w[i] / (1 - Math.pow(0.999, t))) + 1e-8); }
        }
        p = q; path.push(p.slice());
      }
      out[nm] = path;
    });
    return out;
  }

  // SVG of the clickable workflow figure (nine steps, a training loop and a tuning loop). The texts come from the
  // chapter files (DE and EN), so both languages share one geometry. c = { aria, steps: [[title, subtitle] x 9], loopA: [lines], loopB: [lines] }.
  LernApp.nnFlow = function (c) {
    const Y = (i) => 20 + i * 70, line = 'stroke:var(--line);stroke-width:1.5;fill:none', warn = 'stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none';
    let s = '<defs><marker id="nb-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/></marker>' +
      '<marker id="nb-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--warn)"/></marker></defs>';
    c.steps.forEach((st, i) => {
      const y = Y(i), test = i === 8;
      s += '<g class="ab-step" data-s="' + (i + 1) + '" tabindex="0" role="button" aria-expanded="false" aria-label="' + c.aria.replace('%', i + 1) + '">' +
        '<rect x="60" y="' + y + '" width="300" height="52" rx="6" style="fill:' + (test ? 'var(--warn-soft)' : 'var(--surface)') + ';stroke:' + (test ? 'var(--warn)' : 'var(--line)') + ';stroke-width:1.5"/>' +
        '<text x="210" y="' + (y + 22) + '" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">' + (i + 1) + ' · ' + st[0] + '</text>' +
        '<text x="210" y="' + (y + 40) + '" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">' + st[1] + '</text></g>';
      if (i < 8) s += '<line x1="210" y1="' + (y + 52) + '" x2="210" y2="' + (y + 70) + '" marker-end="url(#nb-a)" style="' + line + '"/>';
    });
    s += '<path d="M360,' + (Y(6) + 26) + ' H410 V' + (Y(3) + 26) + ' H362" marker-end="url(#nb-al)" style="' + warn + '"/>';
    c.loopA.forEach((l, k) => { s += '<text x="418" y="' + (Y(4) + 26 + k * 15) + '" style="fill:var(--warn);font-size:12px;font-family:var(--f-body)">' + l + '</text>'; });
    s += '<path d="M360,' + (Y(7) + 26) + ' H540 V' + (Y(1) + 26) + ' H362" marker-end="url(#nb-al)" style="' + warn + '"/>';
    c.loopB.forEach((l, k) => { s += '<text x="548" y="' + (Y(4) + 40 + k * 15) + '" style="fill:var(--warn);font-size:12px;font-family:var(--f-body)">' + l + '</text>'; });
    return s;
  };

  LernApp.nnLib = { ACT: ACT, makeNet: makeNet, cloneNet: cloneNet, forward: forward, predict: predict, meanLoss: meanLoss, accuracy: accuracy, grads: grads, adamState: adamState, adamStep: adamStep, makeMoons: makeMoons, race: race, SURF: SURF };

  // ---- Demos (DOM) ----
  LernApp.demos.nn = function () {
    const T = LernApp.t;
    const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, T('’', ','));
    const sgn = (v, d) => fmt(v, d).replace('-', MU);

    // Demo 1: one neuron and its activation function
    (function () {
      if (!$('nnActSvg')) return;
      let act = 'sigmoid';
      const info = {
        sigmoid: [T('Sigmoid: presst jede Zahl in den Bereich 0 bis 1. Bei grossem |z| ist die Kurve flach, die Steigung fast 0: Es fliesst kaum Signal zurück (die Neuronen «saturieren»).', 'Sigmoid: squashes every number into the range 0 to 1. For large |z| the curve is flat and the slope almost 0: hardly any signal flows back (the neurons «saturate»).')],
        tanh: [T('Tanh: wie Sigmoid, aber von −1 bis 1 und um 0 zentriert. Saturiert ebenfalls, wird aber der Sigmoid meist vorgezogen.', 'Tanh: like sigmoid, but from −1 to 1 and centred on 0. It saturates too, but is usually preferred to sigmoid.')],
        relu: [T('ReLU: max(0, z). Schnell zu rechnen, saturiert für z > 0 nicht und beschleunigt das Training. Für z < 0 ist die Steigung 0: Das Neuron kann «sterben».', 'ReLU: max(0, z). Fast to compute, does not saturate for z > 0 and speeds up training. For z < 0 the slope is 0: the neuron can «die».')],
        leaky: [T('Leaky ReLU: wie ReLU, aber mit kleiner Steigung (hier 0,01) für z < 0. Das Neuron stirbt nicht ganz.', 'Leaky ReLU: like ReLU, but with a small slope (here 0.01) for z < 0. The neuron does not die completely.')],
        linear: [T('Linear: Ausgabe = Eingabe. Gehört in die Ausgabeschicht bei Regression. In den versteckten Schichten bleibt das ganze Netz nur eine lineare Funktion.', 'Linear: output = input. Belongs in the output layer for regression. In the hidden layers the whole network stays just one linear function.')],
      };
      const W = 320, H = 190, PX = 30, PY = 20, ZMIN = -4, ZMAX = 4, YMIN = -1.5, YMAX = 4;
      const sx = (z) => PX + ((z - ZMIN) / (ZMAX - ZMIN)) * (W - PX - 10), sy = (y) => H - PY - ((Math.max(YMIN, Math.min(YMAX, y)) - YMIN) / (YMAX - YMIN)) * (H - PY - 10);
      function draw() {
        const x = +$('nnActX').value, w = +$('nnActW').value, b = +$('nnActB').value;
        $('nnActXO').textContent = sgn(x, 1); $('nnActWO').textContent = sgn(w, 1); $('nnActBO').textContent = sgn(b, 1);
        const z = w * x + b, f = ACT[act].f, d = ACT[act].d;
        let s = '<line class="ax" x1="' + PX + '" y1="' + sy(0) + '" x2="' + (W - 10) + '" y2="' + sy(0) + '"/><line class="ax" x1="' + sx(0) + '" y1="10" x2="' + sx(0) + '" y2="' + (H - PY) + '"/>';
        for (let t = -4; t <= 4; t += 2) s += '<text class="lbl" x="' + (sx(t) - 4) + '" y="' + (H - 4) + '">' + String(t).replace('-', MU) + '</text>';
        for (const t of [0, 1, 2, 3]) s += '<text class="lbl" x="4" y="' + (sy(t) + 3) + '">' + t + '</text>';
        let p = '', q = '';
        for (let i = 0; i <= 100; i++) { const zz = ZMIN + (i * (ZMAX - ZMIN)) / 100; p += (i ? 'L' : 'M') + sx(zz).toFixed(1) + ' ' + sy(f(zz)).toFixed(1); q += (i ? 'L' : 'M') + sx(zz).toFixed(1) + ' ' + sy(d(zz)).toFixed(1); }
        s += '<path class="dash" d="' + q + '"/><path class="ln" d="' + p + '"/>';
        s += '<text class="lbl" x="' + (W - 98) + '" y="22">' + T('durchgezogen: f(z)', 'solid: f(z)') + '</text><text class="lbl" x="' + (W - 98) + '" y="36">' + T('gestrichelt: Steigung', 'dashed: slope') + '</text>';
        if (z >= ZMIN && z <= ZMAX) s += '<line class="res" x1="' + sx(z) + '" y1="' + sy(0) + '" x2="' + sx(z) + '" y2="' + sy(f(z)) + '"/><circle cx="' + sx(z) + '" cy="' + sy(f(z)) + '" r="5" style="fill:var(--warn)"/>';
        $('nnActSvg').innerHTML = s;
        $('nnActZ').textContent = sgn(z, 2); $('nnActA').textContent = sgn(f(z), 3); $('nnActD').textContent = fmt(d(z), 3);
        $('nnActMsg').textContent = info[act][0] + (z < ZMIN || z > ZMAX ? T(' (z liegt ausserhalb des Bildes)', ' (z is outside the picture)') : '');
      }
      $('nnActBtns').querySelectorAll('button').forEach((bt) => bt.addEventListener('click', () => {
        act = bt.dataset.a;
        $('nnActBtns').querySelectorAll('button').forEach((o) => { o.className = o === bt ? 'pri' : ''; o.setAttribute('aria-pressed', o === bt); });
        draw();
      }));
      ['nnActX', 'nnActW', 'nnActB'].forEach((id) => $(id).addEventListener('input', draw));
      draw();
    })();

    // Demo 2: count the parameters of a fully connected network
    (function () {
      if (!$('npTab')) return;
      function draw() {
        const nin = +$('npIn').value, nl = +$('npL').value, nh = +$('npH').value, nout = +$('npOut').value;
        $('npInO').textContent = num(nin); $('npLO').textContent = nl; $('npHO').textContent = num(nh); $('npOutO').textContent = num(nout);
        const sizes = [nin]; for (let i = 0; i < nl; i++) sizes.push(nh); sizes.push(nout);
        let tot = 0, rows = '<tr><th>' + T('Schicht', 'Layer') + '</th><th>' + T('Ausgabeform', 'Output shape') + '</th><th>' + T('Rechnung', 'Calculation') + '</th><th>' + T('Parameter', 'Parameters') + '</th></tr>';
        rows += '<tr><td>Input</td><td>(' + num(nin) + ')</td><td>–</td><td>0</td></tr>';
        for (let l = 1; l < sizes.length; l++) {
          const p = (sizes[l - 1] + 1) * sizes[l]; tot += p;
          rows += '<tr><td>Dense ' + l + (l === sizes.length - 1 ? ' (' + T('Ausgabe', 'output') + ')' : '') + '</td><td>(' + num(sizes[l]) + ')</td><td>(' + num(sizes[l - 1]) + ' + 1) · ' + num(sizes[l]) + '</td><td>' + num(p) + '</td></tr>';
        }
        $('npTab').innerHTML = rows; $('npTot').textContent = num(tot);
        let w = 0, b = 0; for (let l = 1; l < sizes.length; l++) { w += sizes[l - 1] * sizes[l]; b += sizes[l]; }
        $('npSplit').textContent = num(w) + ' ' + T('Gewichte', 'weights') + ' + ' + num(b) + ' bias';
      }
      ['npIn', 'npL', 'npH', 'npOut'].forEach((id) => $(id).addEventListener('input', draw));
      draw();
    })();

    // Demo 3: one training step in a tiny 2-2-1 network, with all numbers visible
    (function () {
      if (!$('nsOut')) return;
      const X = [1.0, 0.5], Y = 1, W1_0 = [[0.5, -0.4], [0.3, 0.8]], B1_0 = [0.1, -0.1], W2_0 = [0.7, -0.6], B2_0 = 0.2;
      let W1, B1, W2, B2, n, hist, stage = 1, applied = false, before = null;
      const v = (a, d) => '(' + a.map((q) => sgn(q, d || 3)).join(', ') + ')';
      function reset() { W1 = W1_0.map((r) => r.slice()); B1 = B1_0.slice(); W2 = W2_0.slice(); B2 = B2_0; n = 0; stage = 1; applied = false; before = null; hist = [fwd().loss]; }
      function fwd() {
        const z1 = W1.map((r, j) => r[0] * X[0] + r[1] * X[1] + B1[j]), a1 = z1.map(sg), z2 = W2[0] * a1[0] + W2[1] * a1[1] + B2, yh = sg(z2);
        return { z1: z1, a1: a1, z2: z2, yh: yh, loss: bce(yh, Y) };
      }
      function back() {
        const f = fwd(), d2 = f.yh - Y, gW2 = [d2 * f.a1[0], d2 * f.a1[1]], d1 = [W2[0] * d2 * f.a1[0] * (1 - f.a1[0]), W2[1] * d2 * f.a1[1] * (1 - f.a1[1])];
        return { f: f, d2: d2, gW2: gW2, gB2: d2, d1: d1, gW1: d1.map((q) => [q * X[0], q * X[1]]), gB1: d1 };
      }
      function update() {
        const lr = +$('nsLr').value, g = back();
        W2 = W2.map((q, i) => q - lr * g.gW2[i]); B2 -= lr * g.gB2;
        W1 = W1.map((r, j) => r.map((q, i) => q - lr * g.gW1[j][i])); B1 = B1.map((q, j) => q - lr * g.d1[j]);
        n++; hist.push(fwd().loss);
      }
      function show() {
        const lr = +$('nsLr').value; $('nsLrO').textContent = fmt(lr, 1);
        const f = fwd(), L = T;
        let s = '';
        if (stage === 1) {
          s = L('Eingabe        x  = ', 'Input          x  = ') + v(X, 1) + '\n' + L('Hidden         z1 = W1·x + b1 = ', 'Hidden         z1 = W1·x + b1 = ') + v(f.z1) + '\n' +
            '               a1 = sigmoid(z1)   = ' + v(f.a1) + '\n' + L('Ausgabe        z2 = W2·a1 + b2 = ', 'Output         z2 = W2·a1 + b2 = ') + sgn(f.z2, 3) + '\n' +
            '               ŷ  = sigmoid(z2)   = ' + sgn(f.yh, 3) + '   ' + L('(Wahrscheinlichkeit für Klasse 1)', '(probability of class 1)');
        } else if (stage === 2) {
          s = L('Richtige Klasse  y = ', 'True class      y = ') + Y + '\n' + L('Vorhersage       ŷ = ', 'Prediction      ŷ = ') + sgn(f.yh, 3) + '\n' +
            'L = −[ y·log(ŷ) + (1−y)·log(1−ŷ) ]\n    = ' + sgn(f.loss, 4) + '   ' + L('(0 wäre perfekt, je grösser desto schlechter)', '(0 would be perfect, the larger the worse)');
        } else if (stage === 3) {
          const g = back();
          s = L('Rückwärts, von der Ausgabe zum Eingang (Kettenregel):', 'Backwards, from the output to the input (chain rule):') + '\n' +
            'δ2 = ŷ − y = ' + sgn(g.d2, 3) + '   ' + L('(Sigmoid + Cross-Entropy)', '(sigmoid + cross-entropy)') + '\n' +
            '∂L/∂W2 = δ2·a1 = ' + v(g.gW2) + '   ∂L/∂b2 = ' + sgn(g.gB2, 3) + '\n' +
            'δ1 = W2·δ2 ⊙ a1 ⊙ (1−a1) = ' + v(g.d1, 4) + '\n' +
            '∂L/∂W1 = δ1·xᵀ = ' + v(g.gW1[0], 4) + ' / ' + v(g.gW1[1], 4) + '\n' + '∂L/∂b1 = ' + v(g.gB1, 4);
        } else {
          if (!applied) { before = { W1: W1.map((r) => r.slice()), W2: W2.slice(), B2: B2, loss: f.loss }; update(); applied = true; }
          const f2 = fwd();
          s = 'w ← w − α·∂L/∂w   (α = ' + fmt(lr, 1) + ')\n' + 'W2: ' + v(before.W2) + ' → ' + v(W2) + '\n' +
            'W1: ' + v(before.W1[0]) + ' / ' + v(before.W1[1]) + '\n' + '    → ' + v(W1[0]) + ' / ' + v(W1[1]) + '\n' +
            L('Loss: ', 'Loss: ') + sgn(before.loss, 4) + ' → ' + sgn(f2.loss, 4) + '   ' + L('(Runde ', '(round ') + n + ')';
        }
        $('nsOut').textContent = s;
        for (let i = 1; i <= 4; i++) $('nsB' + i).className = i === stage ? 'pri' : '';
        const now = fwd();
        $('nsN').textContent = n; $('nsLoss').textContent = fmt(now.loss, 4); $('nsPred').textContent = fmt(now.yh, 3);
        const Wd = 320, Hd = 110, PX = 34, PY = 18, mx = Math.max(hist.length - 1, 10), top = Math.max.apply(null, hist) * 1.05;
        const px = (i) => PX + (i / mx) * (Wd - PX - 10), py = (q) => Hd - PY - (q / top) * (Hd - PY - 14);
        let g = '<line class="ax" x1="' + PX + '" y1="' + (Hd - PY) + '" x2="' + (Wd - 10) + '" y2="' + (Hd - PY) + '"/><text class="lbl" x="4" y="' + (py(0) + 3) + '">0</text><text class="lbl" x="4" y="' + (py(top) + 10) + '">' + fmt(top, 2) + '</text>';
        g += '<text class="lbl" x="' + PX + '" y="12">' + T('Loss je Runde', 'Loss per round') + '</text><text class="lbl" x="' + (Wd - 60) + '" y="' + (Hd - 4) + '">' + T('Runde', 'round') + '</text>';
        g += '<path class="ln" d="' + hist.map((q, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(q).toFixed(1)).join('') + '"/>';
        hist.forEach((q, i) => { g += '<circle cx="' + px(i).toFixed(1) + '" cy="' + py(q).toFixed(1) + '" r="2.5" style="fill:var(--accent)"/>'; });
        $('nsSvg').innerHTML = g;
      }
      [1, 2, 3, 4].forEach((i) => $('nsB' + i).addEventListener('click', () => { if (i !== 4) applied = false; stage = i; show(); }));
      $('nsTen').addEventListener('click', () => { for (let i = 0; i < 10; i++) update(); stage = 1; applied = false; show(); });
      $('nsReset').addEventListener('click', () => { reset(); show(); });
      $('nsLr').addEventListener('input', show);
      reset(); show();
    })();

    // Demo 4: optimizers on a narrow valley
    (function () {
      if (!$('noSvg')) return;
      const W = 320, H = 240, X0 = -2, X1 = 2, Y0 = -2, Y1 = 2, start = [1.5, 1.8];
      const sx = (x) => 8 + ((x - X0) / (X1 - X0)) * (W - 16), sy = (y) => H - 8 - ((y - Y0) / (Y1 - Y0)) * (H - 16);
      const STY = {
        sgd: ['SGD', 'var(--muted)', '3 3'], momentum: ['Momentum', 'var(--accent)', ''], rmsprop: ['RMSProp', 'var(--ok)', '7 3'], adam: ['Adam', 'var(--warn)', ''],
      };
      function draw() {
        const lr = +$('noLr').value, steps = +$('noSteps').value;
        $('noLrO').textContent = fmt(lr, 2); $('noStepsO').textContent = steps;
        const res = race(start, lr, steps);
        let s = '';
        for (const lv of [0.1, 0.5, 1.5, 4, 10, 25, 45]) {
          // level line of 20x^2 + 0.5y^2 = lv: an ellipse with semi-axes sqrt(lv/20) and sqrt(lv/0.5)
          s += '<ellipse cx="' + sx(0) + '" cy="' + sy(0) + '" rx="' + ((Math.sqrt(lv / 20) / (X1 - X0)) * (W - 16)).toFixed(1) + '" ry="' + ((Math.sqrt(lv / 0.5) / (Y1 - Y0)) * (H - 16)).toFixed(1) + '" style="fill:none;stroke:var(--line);stroke-width:1"/>';
        }
        s += '<line class="ax" x1="0" y1="' + sy(0) + '" x2="' + W + '" y2="' + sy(0) + '"/><line class="ax" x1="' + sx(0) + '" y1="0" x2="' + sx(0) + '" y2="' + H + '"/>';
        let rows = '';
        Object.keys(STY).forEach((k, idx) => {
          const path = res[k].map((p) => [Math.max(X0, Math.min(X1, p[0])), Math.max(Y0, Math.min(Y1, p[1]))]);
          s += '<path d="' + path.map((p, i) => (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join('') + '" style="fill:none;stroke:' + STY[k][1] + ';stroke-width:2;stroke-dasharray:' + (STY[k][2] || 'none') + '"/>';
          const e = path[path.length - 1];
          s += '<circle cx="' + sx(e[0]).toFixed(1) + '" cy="' + sy(e[1]).toFixed(1) + '" r="4" style="fill:' + STY[k][1] + '"/>';
          s += '<text class="lbl" x="' + (W - 78) + '" y="' + (16 + idx * 14) + '" style="fill:' + STY[k][1] + '">' + (idx + 1) + ' ' + STY[k][0] + '</text>';
          const last = res[k][res[k].length - 1];
          rows += '<tr><td>' + STY[k][0] + '</td><td>' + fmt(SURF.f(last), 4) + '</td></tr>';
        });
        s += '<circle cx="' + sx(start[0]) + '" cy="' + sy(start[1]) + '" r="5" style="fill:none;stroke:var(--fg);stroke-width:2"/>';
        $('noSvg').innerHTML = s;
        $('noTab').innerHTML = '<tr><th>Optimizer</th><th>' + T('Loss nach ', 'Loss after ') + steps + T(' Schritten', ' steps') + '</th></tr>' + rows;
        const fin = Object.keys(res).map((k) => [k, SURF.f(res[k][res[k].length - 1])]).sort((a, b) => a[1] - b[1]);
        const jumped = Object.keys(res).filter((k) => res[k].some((p) => Math.abs(p[0]) > X1 || Math.abs(p[1]) > Y1)).map((k) => STY[k][0]);
        $('noMsg').textContent = T('Bestes Ergebnis nach ', 'Best result after ') + steps + T(' Schritten: ', ' steps: ') + STY[fin[0][0]][0] + T(' (Loss ', ' (loss ') + fmt(fin[0][1], 4) + T('), schlechtestes: ', '), worst: ') + STY[fin[3][0]][0] + T(' (Loss ', ' (loss ') + fmt(fin[3][1], 4) + ').' +
          (jumped.length ? ' ' + jumped.join(', ') + T(' springt aus dem Bild: Die Schritte sind für die steile Richtung zu gross.', ' jumps out of the picture: the steps are too large for the steep direction.') : '');
      }
      ['noLr', 'noSteps'].forEach((id) => $(id).addEventListener('input', draw));
      draw();
    })();

    // Demo 5: train a network on two moons; dropout, size, learning rate; loss curves and early stopping
    (function () {
      if (!$('nfSvg')) return;
      const EPOCHS = 300, BATCH = 10, LRS = [0.001, 0.003, 0.01, 0.03, 0.1];
      const r0 = mulberry32(2), tr = makeMoons(40, 0.35, r0), va = makeMoons(200, 0.35, r0);
      // Scaling: mean and std from the training points only
      const mu = [0, 1].map((j) => tr.X.reduce((a, p) => a + p[j], 0) / tr.X.length), sd = [0, 1].map((j) => Math.sqrt(tr.X.reduce((a, p) => a + (p[j] - mu[j]) ** 2, 0) / tr.X.length));
      const sc = (p) => [(p[0] - mu[0]) / sd[0], (p[1] - mu[1]) / sd[1]], Xtr = tr.X.map(sc), Xva = va.X.map(sc);
      const W = 320, H = 240, XL = [-2.4, 2.4];
      const sx = (x) => 8 + ((x - XL[0]) / (XL[1] - XL[0])) * (W - 16), sy = (y) => H - 8 - ((y - XL[0]) / (XL[1] - XL[0])) * (H - 16);
      let run = null;
      function train(h, p, lr) {
        const net = makeNet([2, h, 1], 'relu', 7), st = adamState(net), r = mulberry32(11), snaps = [cloneNet(net)];
        const idx = [...Array(Xtr.length).keys()], curve = { tr: [meanLoss(net, Xtr, tr.Y)], va: [meanLoss(net, Xva, va.Y)], acc: [accuracy(net, Xva, va.Y)] };
        for (let e = 1; e <= EPOCHS; e++) {
          for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
          for (let b = 0; b < idx.length; b += BATCH) {
            const part = idx.slice(b, b + BATCH), g = grads(net, part.map((i) => Xtr[i]), part.map((i) => tr.Y[i]), p, r);
            adamStep(net, g, st, lr);
          }
          snaps.push(cloneNet(net)); curve.tr.push(meanLoss(net, Xtr, tr.Y)); curve.va.push(meanLoss(net, Xva, va.Y)); curve.acc.push(accuracy(net, Xva, va.Y));
        }
        return { snaps: snaps, curve: curve, best: curve.va.indexOf(Math.min.apply(null, curve.va)) };
      }
      function retrain() { run = train(+$('nfH').value, +$('nfDrop').value, LRS[+$('nfLr').value]); draw(); }
      function draw() {
        const h = +$('nfH').value, p = +$('nfDrop').value, lr = LRS[+$('nfLr').value], e = Math.min(+$('nfEp').value, EPOCHS);
        $('nfHO').textContent = h; $('nfDropO').textContent = fmt(p, 1); $('nfLrO').textContent = lr; $('nfEpO').textContent = e;
        const net = run.snaps[e], G = 22, cw = (W - 16) / G, ch = (H - 16) / G;
        let s = '';
        for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
          const x = XL[0] + ((i + 0.5) / G) * (XL[1] - XL[0]), y = XL[1] - ((j + 0.5) / G) * (XL[1] - XL[0]), pr = predict(net, [x, y]);
          s += '<rect x="' + (8 + i * cw).toFixed(1) + '" y="' + (8 + j * ch).toFixed(1) + '" width="' + (cw + 0.5).toFixed(1) + '" height="' + (ch + 0.5).toFixed(1) + '" style="fill:' + (pr >= 0.5 ? 'var(--accent)' : 'var(--warn)') + ';fill-opacity:' + (0.06 + 0.3 * Math.abs(2 * pr - 1)).toFixed(2) + '"/>';
        }
        Xva.forEach((q, i) => { s += '<rect x="' + (sx(q[0]) - 2.5).toFixed(1) + '" y="' + (sy(q[1]) - 2.5).toFixed(1) + '" width="5" height="5" style="fill:' + (va.Y[i] ? 'var(--accent)' : 'var(--warn)') + ';opacity:.55"/>'; });
        Xtr.forEach((q, i) => { s += '<circle cx="' + sx(q[0]).toFixed(1) + '" cy="' + sy(q[1]).toFixed(1) + '" r="4.5" style="fill:' + (tr.Y[i] ? 'var(--accent)' : 'var(--surface)') + ';stroke:' + (tr.Y[i] ? 'var(--accent)' : 'var(--warn)') + ';stroke-width:2"/>'; });
        $('nfSvg').innerHTML = s;
        const c = run.curve, top = Math.min(1.5, Math.max.apply(null, c.tr.concat(c.va))), CH = 150, PX = 30, PY = 22, px = (i) => PX + (i / EPOCHS) * (W - PX - 10), py = (q) => CH - PY - (Math.min(q, top) / top) * (CH - PY - 16);
        let g = '<line class="ax" x1="' + PX + '" y1="' + (CH - PY) + '" x2="' + (W - 10) + '" y2="' + (CH - PY) + '"/>';
        g += '<text class="lbl" x="4" y="' + (py(0) + 3) + '">0</text><text class="lbl" x="4" y="' + (py(top) + 8) + '">' + fmt(top, 1) + '</text>';
        for (const t of [0, 100, 200, 300]) g += '<text class="lbl" x="' + (px(t) - 8) + '" y="' + (CH - 8) + '">' + t + '</text>';
        g += '<text class="lbl" x="' + PX + '" y="12">' + T('Loss: Training (blau), Validation (orange)', 'Loss: training (blue), validation (orange)') + '</text>';
        const path = (a) => a.map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1)).join('');
        g += '<path class="ln" d="' + path(c.tr) + '"/><path class="ln2" d="' + path(c.va) + '"/>';
        g += '<line class="dash" x1="' + px(run.best) + '" y1="' + (CH - PY) + '" x2="' + px(run.best) + '" y2="16"/><text class="lbl" x="' + Math.min(px(run.best) + 3, W - 90) + '" y="' + (CH - PY - 6) + '">' + T('Minimum Validation', 'validation minimum') + '</text>';
        g += '<line x1="' + px(e) + '" y1="' + (CH - PY) + '" x2="' + px(e) + '" y2="16" style="stroke:var(--fg);stroke-width:1.5"/>';
        $('nfCurve').innerHTML = g;
        $('nfTr').textContent = fmt(c.tr[e], 3); $('nfVa').textContent = fmt(c.va[e], 3); $('nfAcc').textContent = fmt(100 * c.acc[e], 0) + ' %'; $('nfBest').textContent = run.best;
        const gap = c.va[e] - c.tr[e];
        $('nfMsg').textContent = T('epoch ', 'Epoch ') + e + T(': Training-Loss ', ': training loss ') + fmt(c.tr[e], 3) + T(', Validation-Loss ', ', validation loss ') + fmt(c.va[e], 3) + '. ' +
          (e > run.best + 15 && c.va[e] > c.va[run.best] * 1.05 ? T('Die Validation-Loss steigt seit epoch ' + run.best + ' wieder: overfitting. Early Stopping hätte bei epoch ' + run.best + ' gestoppt.', 'The validation loss has been rising again since epoch ' + run.best + ': overfitting. Early stopping would have stopped at epoch ' + run.best + '.')
            : gap > 0.15 ? T('Training und Validation laufen auseinander.', 'Training and validation are drifting apart.')
              : e < 20 ? T('Das Netz lernt noch, beide Kurven sinken.', 'The network is still learning, both curves are falling.') : T('Beide Kurven liegen nah beieinander: kein klares overfitting.', 'Both curves are close together: no clear overfitting.'));
      }
      ['nfH', 'nfDrop', 'nfLr'].forEach((id) => $(id).addEventListener('input', retrain));
      $('nfEp').addEventListener('input', draw);
      retrain();
    })();
  };
})();
