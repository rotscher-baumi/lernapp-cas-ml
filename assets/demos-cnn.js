/* Demos of the «Convolutional Neural Networks» chapter. modules/cnn.js calls LernApp.demos.cnn() once the chapter is in the page. */
(function () {
  const { $, fmt } = LernApp;
  const MU = '−';
  const sgn = (v, d) => fmt(v, d).replace('-', MU);

  // ---- Library (no DOM): 2D convolution, ReLU, pooling, output size, layer shapes ----
  // Valid convolution with stride 1 (cross-correlation, as in Keras): out[r][c] = Σ img[r+i][c+j] · k[i][j] + b.
  function conv2d(img, k, b) {
    const n = img.length, m = k.length, o = n - m + 1, out = [];
    for (let r = 0; r < o; r++) {
      const row = [];
      for (let c = 0; c < o; c++) {
        let s = b;
        for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) s += img[r + i][c + j] * k[i][j];
        row.push(s);
      }
      out.push(row);
    }
    return out;
  }
  const relu = (A) => A.map((row) => row.map((v) => (v > 0 ? v : 0)));
  // Pooling with a 2×2 window and stride 2; a trailing odd row or column is dropped, as in Keras.
  function pool(A, mode) {
    const o = Math.floor(A.length / 2), out = [];
    for (let r = 0; r < o; r++) {
      const row = [];
      for (let c = 0; c < o; c++) {
        const v = [A[2 * r][2 * c], A[2 * r][2 * c + 1], A[2 * r + 1][2 * c], A[2 * r + 1][2 * c + 1]];
        row.push(mode === 'max' ? Math.max.apply(null, v) : (v[0] + v[1] + v[2] + v[3]) / 4);
      }
      out.push(row);
    }
    return out;
  }
  // Output size along one axis: floor((n + 2p − k) / s) + 1, or 0 when the kernel does not fit.
  const outSize = (n, k, s, p) => (n + 2 * p < k ? 0 : Math.floor((n + 2 * p - k) / s) + 1);
  // Layers of a CNN like the course example: blocks of Conv2D layers followed by MaxPooling2D(2), then Flatten,
  // an optional Dense hidden layer and the softmax output. In each block only the first conv keeps the size when
  // padding is 'mixed' (same, then valid), as in the course notebook. Returns [{ name, shape: [h, w, c] | [n], params }].
  function cnnLayers(o) {
    let h = o.h, w = o.w, c = o.c;
    const L = [{ name: 'Input', shape: [h, w, c], params: 0 }];
    for (let b = 0; b < o.blocks; b++) {
      const f = o.f * Math.pow(2, b);
      for (let k = 0; k < o.convs; k++) {
        const same = o.pad === 'same' || (o.pad === 'mixed' && k === 0);
        if (!same) { h -= o.k - 1; w -= o.k - 1; }
        if (h < 1 || w < 1) return { layers: L, error: true };
        L.push({ name: 'Conv2D ' + f + ' (' + o.k + '×' + o.k + (same ? ', same' : ', valid') + ')', shape: [h, w, f], params: (o.k * o.k * c + 1) * f });
        c = f;
      }
      h = Math.floor(h / 2); w = Math.floor(w / 2);
      if (h < 1 || w < 1) return { layers: L, error: true };
      L.push({ name: 'MaxPooling2D (2×2)', shape: [h, w, c], params: 0 });
    }
    let n = h * w * c;
    L.push({ name: 'Flatten', shape: [n], params: 0 });
    if (o.dense > 0) { L.push({ name: 'Dense ' + o.dense + ' (ReLU)', shape: [o.dense], params: (n + 1) * o.dense }); n = o.dense; }
    L.push({ name: 'Dense ' + o.classes + ' (Softmax)', shape: [o.classes], params: (n + 1) * o.classes });
    return { layers: L, error: false };
  }

  LernApp.cnnLib = { conv2d: conv2d, relu: relu, pool: pool, outSize: outSize, cnnLayers: cnnLayers };

  // ---- Demos (DOM) ----
  LernApp.demos.cnn = function () {
    const T = LernApp.t;
    const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, T('’', ','));

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('cnnFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Bilder vorbereiten', '1 · Prepare the images'), T('Ein Bild ist ein Array der Form <code>(Höhe, Breite, Kanäle)</code>: 32×32×3 bei CIFAR-10 (RGB), 28×28×1 bei MNIST (Graustufen). Pixelwerte durch 255 teilen, damit sie zwischen 0 und 1 liegen. Labels als One-Hot (<code>to_categorical</code>) für <code>categorical_crossentropy</code>. Aufteilen in Train, Validation und Test.', 'An image is an array of shape <code>(height, width, channels)</code>: 32×32×3 for CIFAR-10 (RGB), 28×28×1 for MNIST (greyscale). Divide pixel values by 255 so they lie between 0 and 1. Labels as one-hot (<code>to_categorical</code>) for <code>categorical_crossentropy</code>. Split into train, validation and test.'), [[T('Warum nicht Dense?', 'Why not Dense?'), '#cnn-warum'], ['Keras', '#cnn-keras']]],
        '2': [T('2 · Architektur wählen', '2 · Choose the architecture'), T('Mehrere Blöcke aus <b>Conv2D</b> (Filter lernen Muster) und <b>MaxPooling2D</b> (verkleinert die Feature Maps). Pro Block meist mehr Filter (32 → 64 → 128). Dann <code>Flatten</code> und eine oder zwei <code>Dense</code>-Schichten bis zur Softmax-Ausgabe. Wichtige Wahl: Zahl der Filter, Kernel Size, Padding.', 'Several blocks of <b>Conv2D</b> (filters learn patterns) and <b>MaxPooling2D</b> (shrinks the feature maps). Usually more filters per block (32 → 64 → 128). Then <code>Flatten</code> and one or two <code>Dense</code> layers up to the softmax output. Key choices: number of filters, kernel size, padding.'), [['Convolution', '#cnn-conv'], ['Pooling', '#cnn-pool'], [T('Parameter zählen', 'Counting parameters'), '#cnn-kanal']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('Wie beim Dense-Netz: <code>categorical_crossentropy</code> mit One-Hot-Labels (oder <code>sparse_categorical_crossentropy</code> mit Klassennummern), Adam mit Learning Rate 0.001 als Start, dazu Batch Size und Epochs.', 'As for the dense network: <code>categorical_crossentropy</code> with one-hot labels (or <code>sparse_categorical_crossentropy</code> with class numbers), Adam with learning rate 0.001 as a start, plus batch size and epochs.'), [['Optimizer', '#nn-opt']]],
        '4': [T('4 · Forward Pass', '4 · Forward pass'), T('Jeder Filter gleitet über das Bild und erzeugt eine <b>Feature Map</b>: hohe Werte dort, wo sein Muster vorkommt. ReLU, dann Pooling. Spätere Schichten sehen grössere Bildausschnitte und erkennen zusammengesetzte Muster. Am Ende macht der Dense-Teil daraus Klassenwahrscheinlichkeiten.', 'Each filter slides over the image and produces a <b>feature map</b>: high values where its pattern occurs. ReLU, then pooling. Later layers see larger parts of the image and detect composite patterns. At the end the dense part turns this into class probabilities.'), [['Convolution', '#cnn-conv'], [T('Merkmals-Hierarchie', 'Feature hierarchy'), '#cnn-keras']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Die Softmax-Ausgabe wird mit dem richtigen Label verglichen (Cross-Entropy) und über den Mini-Batch gemittelt.', 'The softmax output is compared with the correct label (cross-entropy) and averaged over the mini-batch.'), [['Training', '#nn-training']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Gleich wie beim Dense-Netz, nur dass die <b>Filtergewichte</b> an jeder Bildposition benutzt werden. Ihr Gradient ist darum die Summe der Beiträge aller Positionen. Pooling-Schichten haben keine Gewichte; Max-Pooling reicht den Fehler nur an das Maximum seines Fensters zurück.', 'The same as in a dense network, except that the <b>filter weights</b> are used at every image position. Their gradient is therefore the sum of the contributions of all positions. Pooling layers have no weights; max pooling passes the error back only to the maximum of its window.'), [['Backpropagation', '#nn-training']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Der Optimizer verschiebt alle Filtergewichte, Bias und Dense-Gewichte gegen ihren Gradienten. Die Filter beginnen zufällig und werden im Lauf des Trainings zu Kanten-, Farb- und Texturdetektoren.', 'The optimizer moves all filter weights, biases and dense weights against their gradient. The filters start random and become edge, colour and texture detectors during training.'), [['Optimizer', '#nn-opt']]],
        '8': [T('8 · Validation prüfen', '8 · Check validation'), T('Loss-Kurven von Train und Validation nach jeder Epoch. Bilder-Netze haben viele Parameter und überanpassen schnell: <b>Data Augmentation</b>, Dropout, Batch Normalization, Early Stopping. Mit wenigen Bildern: <b>Transfer Learning</b> statt von null trainieren.', 'Loss curves of train and validation after every epoch. Image networks have many parameters and overfit quickly: <b>data augmentation</b>, dropout, batch normalisation, early stopping. With few images: <b>transfer learning</b> instead of training from scratch.'), [['Data Augmentation', '#cnn-aug'], ['Transfer Learning', '#cnn-transfer'], ['Validation', '#nn-valid']]],
        '9': [T('9 · Einmal testen', '9 · Test once'), T('Das Testset bleibt bis zum Schluss gesperrt, auch für Early Stopping und Augmentation-Entscheide. Danach Accuracy und Confusion Matrix: Welche Klassen verwechselt das Netz (bei CIFAR-10 oft Katze und Hund)?', 'The test set stays locked until the end, also for early stopping and augmentation decisions. Then accuracy and confusion matrix: which classes does the network confuse (for CIFAR-10 often cat and dog)?'), [[T('Übersicht', 'Overview'), '#cnn-methoden']]],
      };
      let cur = null;
      function close() {
        panel.hidden = true; cur = null;
        steps.forEach((g) => { g.classList.remove('on'); g.setAttribute('aria-expanded', 'false'); });
      }
      function open(k) {
        if (cur === k) { close(); return; }
        const d = S[k]; if (!d) return;
        cur = k;
        panel.querySelector('.ab-dh b').textContent = d[0];
        panel.querySelector('.ab-db').innerHTML = d[1];
        panel.querySelector('.ab-dl').innerHTML = d[2].map((l) => '<a href="' + l[1] + '">' + l[0] + ' →</a>').join('');
        panel.hidden = false;
        steps.forEach((g) => { const on = g.getAttribute('data-s') === k; g.classList.toggle('on', on); g.setAttribute('aria-expanded', on ? 'true' : 'false'); });
      }
      steps.forEach((g) => {
        g.addEventListener('click', () => open(g.getAttribute('data-s')));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g.getAttribute('data-s')); } });
      });
      panel.querySelector('.ab-x').addEventListener('click', close);
    })();

    // Demo 1: a 3×3 filter slides over an 8×8 image, then ReLU and 2×2 pooling
    (function () {
      if (!$('ccSvg')) return;
      const IMG = {
        seven: ['01111110', '00000110', '00001100', '00011000', '00010000', '00110000', '00100000', '00100000'],
        square: ['00000000', '01111110', '01000010', '01000010', '01000010', '01000010', '01111110', '00000000'],
        cross: ['10000001', '01000010', '00100100', '00011000', '00011000', '00100100', '01000010', '10000001'],
      };
      const K = {
        vert: { k: [[1, 0, -1], [1, 0, -1], [1, 0, -1]], de: 'Vertikale Kante: links hell, rechts dunkel ergibt einen hohen Wert, umgekehrt einen negativen. Gleichmässige Flächen ergeben 0.', en: 'Vertical edge: bright on the left and dark on the right gives a high value, the other way round a negative one. Uniform areas give 0.' },
        horiz: { k: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]], de: 'Horizontale Kante: oben hell, unten dunkel ergibt einen hohen Wert. Senkrechte Linien bleiben fast unsichtbar.', en: 'Horizontal edge: bright above and dark below gives a high value. Vertical lines stay almost invisible.' },
        diag: { k: [[2, -1, -1], [-1, 2, -1], [-1, -1, 2]], de: 'Diagonale «\\»: reagiert auf Linien von oben links nach unten rechts. Probiere ihn am Kreuz: Nur einer der beiden Striche leuchtet.', en: 'Diagonal «\\»: responds to lines from top left to bottom right. Try it on the cross: only one of the two strokes lights up.' },
        blur: { k: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], de: 'Weichzeichner: der Mittelwert der 9 Pixel. Alle Gewichte positiv, darum gibt es keine negativen Werte.', en: 'Blur: the mean of the 9 pixels. All weights are positive, so there are no negative values.' },
      };
      let img = 'seven', ker = 'vert', mode = 'max', pos = 0;
      const C = 18, GX = [6, 172, 250, 386], GY = 34;
      const cell = (x, y, size, fill, op, extra) => '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" style="fill:' + fill + ';fill-opacity:' + op.toFixed(2) + ';stroke:var(--line);stroke-width:.5"' + (extra || '') + '/>';
      const lbl = (x, y, t) => '<text class="lbl" x="' + x + '" y="' + y + '">' + t + '</text>';
      function data() {
        const A = IMG[img].map((r) => r.split('').map(Number)), k = K[ker].k;
        const F = conv2d(A, k, 0), R = relu(F), P = pool(R, mode);
        return { A: A, k: k, F: F, R: R, P: P };
      }
      function draw() {
        const d = data(), r0 = Math.floor(pos / 6), c0 = pos % 6;
        let fmax = 0; d.F.forEach((row) => row.forEach((v) => { fmax = Math.max(fmax, Math.abs(v)); }));
        let pmax = 0; d.P.forEach((row) => row.forEach((v) => { pmax = Math.max(pmax, v); }));
        let s = lbl(GX[0], 22, T('Bild 8×8', 'Image 8×8')) + lbl(GX[1], 22, 'Filter 3×3') + lbl(GX[2], 22, 'Feature map 6×6') + lbl(GX[3], 22, T('ReLU + Pool → 3×3', 'ReLU + pool → 3×3'));
        d.A.forEach((row, r) => row.forEach((v, c) => { s += cell(GX[0] + c * C, GY + r * C, C, 'var(--fg)', v ? 0.85 : 0.04); }));
        s += '<rect x="' + (GX[0] + c0 * C) + '" y="' + (GY + r0 * C) + '" width="' + 3 * C + '" height="' + 3 * C + '" style="fill:none;stroke:var(--warn);stroke-width:2.5"/>';
        d.k.forEach((row, r) => row.forEach((v, c) => {
          s += cell(GX[1] + c * 22, GY + 18 + r * 22, 22, v >= 0 ? 'var(--accent)' : 'var(--warn)', Math.min(1, Math.abs(v) / 2) * 0.6 + 0.05);
          s += '<text x="' + (GX[1] + c * 22 + 11) + '" y="' + (GY + 18 + r * 22 + 15) + '" text-anchor="middle" style="fill:var(--fg);font-size:10px;font-family:var(--f-mono)">' + (ker === 'blur' ? '⅑' : String(v).replace('-', MU)) + '</text>';
        }));
        d.F.forEach((row, r) => row.forEach((v, c) => {
          const op = fmax ? Math.abs(v) / fmax * 0.85 : 0;
          s += cell(GX[2] + c * C, GY + 18 + r * C, C, v >= 0 ? 'var(--accent)' : 'var(--warn)', op + 0.03, ' data-p="' + (r * 6 + c) + '" class="cc-f" role="presentation"');
        }));
        s += '<rect x="' + (GX[2] + c0 * C) + '" y="' + (GY + 18 + r0 * C) + '" width="' + C + '" height="' + C + '" style="fill:none;stroke:var(--warn);stroke-width:2.5;pointer-events:none"/>';
        d.P.forEach((row, r) => row.forEach((v, c) => { s += cell(GX[3] + c * 30, GY + 27 + r * 30, 30, 'var(--accent)', (pmax ? v / pmax * 0.85 : 0) + 0.03); }));
        s += '<rect x="' + (GX[3] + Math.floor(c0 / 2) * 30) + '" y="' + (GY + 27 + Math.floor(r0 / 2) * 30) + '" width="30" height="30" style="fill:none;stroke:var(--warn);stroke-width:2;stroke-dasharray:4 3"/>';
        s += lbl(GX[1], GY + 110, T('blau +, orange −', 'blue +, orange −'));
        $('ccSvg').innerHTML = s;
        $('ccSvg').querySelectorAll('.cc-f').forEach((el) => el.addEventListener('click', () => { pos = +el.getAttribute('data-p'); draw(); }));
        const parts = [];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const kv = d.k[i][j]; if (kv !== 0 && d.A[r0 + i][c0 + j] !== 0) parts.push(d.A[r0 + i][c0 + j] + '·' + (ker === 'blur' ? '⅑' : '(' + String(kv).replace('-', MU) + ')')); }
        const z = d.F[r0][c0];
        $('ccCalc').textContent = T('Fenster Zeile ', 'Window row ') + (r0 + 1) + T(', Spalte ', ', column ') + (c0 + 1) + ':  Σ ' + T('Pixel', 'pixel') + ' · Filter = ' + (parts.length ? parts.join(' + ') : '0') + ' = ' + sgn(z, 2) + '   →  ReLU: ' + fmt(Math.max(0, z), 2);
        $('ccZ').textContent = sgn(z, 2);
        $('ccPool').textContent = fmt(d.P[Math.min(2, Math.floor(r0 / 2))][Math.min(2, Math.floor(c0 / 2))], 2);
        $('ccMsg').textContent = T(K[ker].de, K[ker].en);
      }
      function group(id, set) {
        $(id).querySelectorAll('button').forEach((bt) => bt.addEventListener('click', () => {
          set(bt.dataset.v);
          $(id).querySelectorAll('button').forEach((o) => { o.className = o === bt ? 'pri' : ''; o.setAttribute('aria-pressed', o === bt); });
          draw();
        }));
      }
      group('ccImg', (v) => { img = v; });
      group('ccKer', (v) => { ker = v; });
      group('ccMode', (v) => { mode = v; });
      $('ccPrev').addEventListener('click', () => { pos = (pos + 35) % 36; draw(); });
      $('ccNext').addEventListener('click', () => { pos = (pos + 1) % 36; draw(); });
      draw();
    })();

    // Demo 2: output size with kernel, stride and padding (one row of the image)
    (function () {
      if (!$('csSvg')) return;
      function draw() {
        const n = +$('csN').value, k = +$('csK').value, s = +$('csS').value, p = +$('csP').value;
        $('csNO').textContent = n; $('csKO').textContent = k; $('csSO').textContent = s; $('csPO').textContent = p;
        const o = outSize(n, k, s, p), W = 22, tot = n + 2 * p, x0 = Math.max(4, (420 - tot * W) / 2);
        let svg = '<text class="lbl" x="4" y="14">' + T('Eingabe (eine Zeile), gestrichelt: Padding', 'Input (one row), dashed: padding') + '</text>';
        for (let i = 0; i < tot; i++) {
          const pad = i < p || i >= p + n;
          svg += '<rect x="' + (x0 + i * W) + '" y="22" width="' + (W - 2) + '" height="' + (W - 2) + '" rx="3" style="fill:' + (pad ? 'none' : 'var(--accent-soft)') + ';stroke:' + (pad ? 'var(--muted)' : 'var(--accent)') + ';stroke-width:1.2' + (pad ? ';stroke-dasharray:3 2' : '') + '"/>';
          if (pad) svg += '<text x="' + (x0 + i * W + 10) + '" y="36" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-family:var(--f-mono)">0</text>';
        }
        for (let j = 0; j < o; j++) {
          const y = 50 + (j % 3) * 9;
          svg += '<path d="M' + (x0 + j * s * W + 2) + ',' + y + ' v4 H' + (x0 + (j * s + k) * W - 4) + ' v-4" style="fill:none;stroke:var(--warn);stroke-width:1.5"/>';
        }
        svg += '<text class="lbl" x="4" y="100">' + T('Ausgabe', 'Output') + ': ' + o + '</text>';
        const ox = Math.max(4, (420 - o * W) / 2);
        for (let j = 0; j < o; j++) svg += '<rect x="' + (ox + j * W) + '" y="108" width="' + (W - 2) + '" height="' + (W - 2) + '" rx="3" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.2"/>';
        $('csSvg').innerHTML = svg;
        $('csF').textContent = o ? '⌊(' + n + ' + 2·' + p + ' − ' + k + ') / ' + s + '⌋ + 1 = ' + o : T('Filter grösser als die Eingabe', 'filter larger than the input');
        $('csKeras').textContent = p === 0 ? "padding='valid'" : s === 1 && 2 * p === k - 1 ? "padding='same'" : T('kein Keras-Standard', 'no Keras preset');
        let msg = '';
        if (s === 1 && 2 * p === k - 1) msg = T('Mit Padding (k−1)/2 und Stride 1 bleibt die Grösse gleich: Das ist padding=\'same\'.', 'With padding (k−1)/2 and stride 1 the size stays the same: that is padding=\'same\'.');
        else if (p === 0 && s === 1) msg = T('Ohne Padding verliert jede Schicht k−1 Pixel; die Randpixel kommen in weniger Fenstern vor.', 'Without padding every layer loses k−1 pixels; border pixels appear in fewer windows.');
        else if (s > 1) msg = T('Stride ' + s + ' überspringt Positionen: Die Ausgabe schrumpft etwa um den Faktor ' + s + '. Pooling macht dasselbe ohne Gewichte.', 'Stride ' + s + ' skips positions: the output shrinks by about a factor of ' + s + '. Pooling does the same without weights.');
        if (o && s > 1 && (n + 2 * p - k) % s !== 0) msg += T(' Am Ende bleiben Pixel übrig, die kein Fenster mehr erreicht.', ' At the end some pixels are left over that no window reaches.');
        $('csMsg').textContent = msg;
      }
      ['csN', 'csK', 'csS', 'csP'].forEach((id) => $(id).addEventListener('input', draw));
      draw();
    })();

    // Demo 3: build a CNN and count its parameters, compared with a dense network on the raw pixels
    (function () {
      if (!$('cpTab')) return;
      let inp = 'cifar', pad = 'mixed';
      function draw() {
        const o = { h: inp === 'cifar' ? 32 : 28, w: inp === 'cifar' ? 32 : 28, c: inp === 'cifar' ? 3 : 1, blocks: +$('cpB').value, convs: +$('cpC').value, f: +$('cpF').value, k: +$('cpK').value, dense: +$('cpD').value, classes: 10, pad: pad };
        $('cpBO').textContent = o.blocks; $('cpCO').textContent = o.convs; $('cpFO').textContent = o.f; $('cpKO').textContent = o.k + '×' + o.k; $('cpDO').textContent = o.dense || T('keine', 'none');
        const res = cnnLayers(o);
        let rows = '<tr><th>' + T('Schicht', 'Layer') + '</th><th>' + T('Ausgabeform', 'Output shape') + '</th><th>' + T('Parameter', 'Parameters') + '</th></tr>', tot = 0, conv = 0;
        res.layers.forEach((l) => { tot += l.params; if (l.name.indexOf('Conv2D') === 0) conv += l.params; rows += '<tr><td>' + l.name + '</td><td>(' + l.shape.join(', ') + ')</td><td>' + num(l.params) + '</td></tr>'; });
        if (res.error) rows += '<tr><td colspan="3" class="res-bad">' + T('Das Bild ist hier schon kleiner als 1×1: weniger Blöcke oder Padding \'same\'.', 'The image is already smaller than 1×1 here: fewer blocks or padding \'same\'.') + '</td></tr>';
        $('cpTab').innerHTML = rows;
        const nin = o.h * o.w * o.c, hid = o.dense || 512, dense = (nin + 1) * hid + (hid + 1) * o.classes;
        $('cpTot').textContent = res.error ? '–' : num(tot);
        $('cpConv').textContent = res.error ? '–' : num(conv);
        $('cpDense').textContent = num(dense);
        $('cpMsg').textContent = res.error ? '' : T('Die Conv-Schichten haben zusammen nur ' + num(conv) + ' Parameter, obwohl sie die ganze Arbeit am Bild machen: Ein 3×3-Filter hat überall im Bild dieselben Gewichte. Die meisten Parameter stecken in der ersten Dense-Schicht nach Flatten.', 'The conv layers have only ' + num(conv) + ' parameters together, although they do all the work on the image: a 3×3 filter has the same weights everywhere in the image. Most parameters sit in the first dense layer after Flatten.');
      }
      function group(id, set) {
        $(id).querySelectorAll('button').forEach((bt) => bt.addEventListener('click', () => {
          set(bt.dataset.v);
          $(id).querySelectorAll('button').forEach((x) => { x.className = x === bt ? 'pri' : ''; x.setAttribute('aria-pressed', x === bt); });
          draw();
        }));
      }
      group('cpIn', (v) => { inp = v; });
      group('cpPad', (v) => { pad = v; });
      ['cpB', 'cpC', 'cpF', 'cpK', 'cpD'].forEach((id) => $(id).addEventListener('input', draw));
      draw();
    })();
  };
})();
