/* Demos of the «Computer Vision» chapter. modules/cv.js calls LernApp.demos.cv() once the chapter is in the page. */
(function () {
  const { $, fmt } = LernApp;

  // ---- Library (no DOM) ----
  // Test image 16×16 in [0, 1]: a bright ring with a bar, so edges and flat areas both exist.
  function testImage() {
    const n = 16, A = [];
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) {
        const d = Math.hypot(r - 7.5, c - 7.5);
        const ring = d > 3.2 && d < 6.2;
        const bar = r >= 7 && r <= 8 && c >= 2 && c <= 13;
        row.push(ring || bar ? 0.9 : 0.15);
      }
      A.push(row);
    }
    return A;
  }
  // 3×3 neighbourhood with clamped borders; reduce(values) gives the new pixel.
  function filter3(A, reduce) {
    const n = A.length;
    return A.map((row, r) => row.map((_, c) => {
      const v = [];
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) v.push(A[Math.min(n - 1, Math.max(0, r + i))][Math.min(n - 1, Math.max(0, c + j))]);
      return reduce(v);
    }));
  }
  const meanF = (v) => v.reduce((a, b) => a + b, 0) / v.length;
  const medianF = (v) => v.slice().sort((a, b) => a - b)[4];
  // Peak signal-to-noise ratio in dB for images in [0, 1]; higher is closer to the clean image.
  function psnr(A, B) {
    let s = 0, n = 0;
    A.forEach((row, r) => row.forEach((v, c) => { s += (v - B[r][c]) * (v - B[r][c]); n++; }));
    const mse = s / n;
    return mse < 1e-10 ? Infinity : 10 * Math.log10(1 / mse);
  }
  // Intersection over union of two boxes [x0, y0, x1, y1].
  function iou(a, b) {
    const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
    const inter = w > 0 && h > 0 ? w * h : 0;
    const uni = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
    return uni > 0 ? inter / uni : 0;
  }
  // Non-maximum suppression: returns the indices of the kept boxes, highest score first.
  function nms(boxes, scores, tau) {
    let order = scores.map((_, i) => i).sort((i, j) => scores[j] - scores[i]);
    const keep = [];
    while (order.length) {
      const i = order[0];
      keep.push(i);
      order = order.slice(1).filter((j) => iou(boxes[i], boxes[j]) <= tau);
    }
    return keep;
  }
  LernApp.cvLib = { testImage, filter3, meanF, medianF, psnr, iou, nms };

  LernApp.demos.cv = function () {
    const T = LernApp.t;

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('cvFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Bilder und Aufgabe', '1 · Images and task'), T('Zuerst die Aufgabe festlegen: <b>Restauration</b> (denoising, deblurring, super-resolution: Bild rein, Bild raus), <b>Object Detection</b> (Bild rein, Liste aus Box, Klasse, Score) oder <b>Segmentation</b> (Bild rein, Klasse pro Pixel). Daraus folgen die Daten: Bildpaare (verschlechtert, sauber), Bilder mit Boxen oder Bilder mit Masken. Pixel auf 0 bis 1 skalieren.', 'First fix the task: <b>restoration</b> (denoising, deblurring, super-resolution: image in, image out), <b>object detection</b> (image in, list of box, class, score) or <b>segmentation</b> (image in, a class per pixel). The data follows: image pairs (degraded, clean), images with boxes or images with masks. Scale pixels to 0 to 1.'), [['Bildentstehung', '#cv-bild'], ['Denoising, Deblurring, Super-Resolution', '#cv-restauration']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('Restauration: CNN mit <b>Skip Connections</b> (U-Net, DnCNN) oder Transformer (SwinIR, Restormer). Detection: <b>Faster R-CNN</b> (zwei Stufen, genau) oder <b>YOLO</b> (eine Stufe, schnell). Segmentation: <b>U-Net</b> pro Aufgabe trainiert oder das Foundation Model <b>SAM</b> ohne Training.', 'Restoration: CNN with <b>skip connections</b> (U-Net, DnCNN) or transformer (SwinIR, Restormer). Detection: <b>Faster R-CNN</b> (two stages, accurate) or <b>YOLO</b> (one stage, fast). Segmentation: <b>U-Net</b> trained per task or the foundation model <b>SAM</b> without training.'), [['Detection', '#cv-detection'], ['Segmentation', '#cv-seg']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('Passend zur Ausgabe: Restauration mit <b>L1</b> (schärfer als L2), oft plus Perceptual oder GAN-Loss. Detection: Summe aus Klassen-Loss und Box-Loss (IoU-basiert). Segmentation: <b>Cross-Entropy + Dice</b> gegen den Klassen-Imbalance. Optimizer meist Adam.', 'Matching the output: restoration with <b>L1</b> (sharper than L2), often plus a perceptual or GAN loss. Detection: class loss plus box loss (IoU-based). Segmentation: <b>cross-entropy + Dice</b> against class imbalance. Optimizer usually Adam.'), [['Methoden', '#cv-methoden']]],
        '4': [T('4 · Forward pass', '4 · Forward pass'), T('Das Netz berechnet seine Ausgabe: ein Bild gleicher Grösse (Restauration, Segmentation) oder viele Kandidaten-Boxen mit Score (Detection). Bei Detection folgen beim Inferenz-Schritt <b>Score-threshold</b> und <b>NMS</b>.', 'The network computes its output: an image of the same size (restoration, segmentation) or many candidate boxes with scores (detection). For detection, a <b>score threshold</b> and <b>NMS</b> follow at inference.'), [['IoU und NMS', '#cv-iou']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Die Ausgabe wird mit dem Ziel verglichen: sauberes Bild, Ground-Truth-Boxen oder Masken. Detection ordnet zuerst jeder Ground-Truth-Box passende Anker oder Zellen zu (über IoU).', 'The output is compared with the target: clean image, ground-truth boxes or masks. Detection first assigns anchors or cells to every ground-truth box (via IoU).'), [['IoU und NMS', '#cv-iou']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Wie beim <a href="#cnn">CNN</a>: Gradienten für alle filter. Skip Connections helfen, weil der Fehler auf kurzem Weg zu den frühen Schichten zurückfliesst.', 'As for the <a href="#cnn">CNN</a>: gradients for all filters. Skip connections help because the error flows back to the early layers on a short path.'), [['CNN', '#cnn']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Der Optimizer verschiebt die Gewichte gegen den Gradienten. Mit vortrainiertem Backbone (Transfer Learning) startet das Netz nicht bei null.', 'The optimizer moves the weights against the gradient. With a pretrained backbone (transfer learning) the network does not start from scratch.'), [['Transfer Learning', '#cnn-transfer']]],
        '8': [T('8 · Validation prüfen', '8 · Check validation'), T('Metrik je Aufgabe: <b>PSNR</b> und SSIM (Restauration), <b>mAP</b> bei IoU-thresholds (Detection), <b>IoU</b> und Dice pro Klasse (Segmentation). Immer auch Bilder ansehen: Metriken können gut sein, obwohl das Bild unnatürlich glatt wirkt.', 'Metric per task: <b>PSNR</b> and SSIM (restoration), <b>mAP</b> at IoU thresholds (detection), <b>IoU</b> and Dice per class (segmentation). Always look at images too: metrics can be good although the image looks unnaturally smooth.'), [['Methoden', '#cv-methoden']]],
        '9': [T('9 · Einmal testen', '9 · Test once'), T('Das Testset bleibt bis zum Schluss gesperrt. Bei Restauration Bilder aus anderen Kameras oder mit anderem Rauschen testen: Ein Netz, das nur auf künstlichem Rauschen trainiert wurde, versagt oft bei echten Fotos.', 'The test set stays locked until the end. For restoration, test with images from other cameras or with different noise: a network trained only on synthetic noise often fails on real photos.'), [['Bildentstehung', '#cv-bild']]],
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

    // Demo 1: image formation I = blur(f) + noise, then a classical restoration filter
    (function () {
      if (!$('rcvSvg')) return;
      const F = testImage(), n = F.length;
      // Fixed random numbers, so the picture only changes when a control changes.
      const rnd = LernApp.mulberry32(7), G = [], U = [];
      for (let i = 0; i < n * n; i++) {
        G.push(Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd()));
        U.push(rnd());
      }
      let blur = 0, sigma = 0.15, kind = 'gauss', fix = 'none';
      const clip = (v) => Math.min(1, Math.max(0, v));
      function degrade() {
        let I = F;
        for (let k = 0; k < blur; k++) I = filter3(I, meanF);
        return I.map((row, r) => row.map((v, c) => {
          const i = r * n + c;
          if (kind === 'gauss') return clip(v + sigma * G[i]);
          const p = sigma * 0.6; // fraction of destroyed pixels
          return U[i] < p / 2 ? 0 : U[i] < p ? 1 : v;
        }));
      }
      function restore(I) {
        if (fix === 'mean') return filter3(I, meanF);
        if (fix === 'median') return filter3(I, medianF);
        return I;
      }
      const S = 11;
      function panel(A, x, title, extra) {
        let s = '<text class="lbl" x="' + x + '" y="14">' + title + '</text>';
        A.forEach((row, r) => row.forEach((v, c) => { s += '<rect x="' + (x + c * S) + '" y="' + (22 + r * S) + '" width="' + S + '" height="' + S + '" style="fill:var(--fg);fill-opacity:' + v.toFixed(2) + '"/>'; }));
        return s + '<text class="lbl" x="' + x + '" y="' + (22 + n * S + 16) + '">' + extra + '</text>';
      }
      function draw() {
        const D = degrade(), R = restore(D);
        const pd = psnr(F, D), pr = psnr(F, R), f = (v) => (isFinite(v) ? fmt(v, 1) + ' dB' : '∞');
        $('rcvSvg').innerHTML = panel(F, 4, T('Original f', 'Original f'), '') + panel(D, 4 + 196, T('Aufnahme I', 'Captured I'), 'PSNR ' + f(pd)) + panel(R, 4 + 392, T('Restauriert', 'Restored'), 'PSNR ' + f(pr));
        $('rcvBO').textContent = blur; $('rcvSO').textContent = fmt(sigma, 2);
        $('rcvMsg').textContent = pr > pd + 0.05 ? T('Der filter hat das Bild verbessert (PSNR +' + fmt(pr - pd, 1) + ' dB).', 'The filter improved the image (PSNR +' + fmt(pr - pd, 1) + ' dB).')
          : fix === 'none' ? T('Noch nichts restauriert. Wähle einen filter.', 'Nothing restored yet. Choose a filter.')
            : T('Der filter hilft hier nicht (oder schadet): Weichzeichnen verschmiert Kanten, die das Bild braucht.', 'The filter does not help here (or hurts): smoothing blurs edges the image needs.');
      }
      function group(id, set) {
        const g = $(id);
        g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
          g.querySelectorAll('button').forEach((x) => { x.setAttribute('aria-pressed', 'false'); x.classList.remove('pri'); });
          b.setAttribute('aria-pressed', 'true'); b.classList.add('pri');
          set(b.getAttribute('data-v')); draw();
        }));
      }
      $('rcvB').addEventListener('input', (e) => { blur = +e.target.value; draw(); });
      $('rcvS').addEventListener('input', (e) => { sigma = +e.target.value; draw(); });
      group('rcvKind', (v) => { kind = v; });
      group('rcvFix', (v) => { fix = v; });
      draw();
    })();

    // Demo 2: IoU of two boxes
    (function () {
      if (!$('ioSvg')) return;
      const A = [100, 60, 200, 140];
      let dx = 40, dy = 20, sc = 100;
      function draw() {
        const w = 100 * sc / 100, h = 80 * sc / 100;
        const B = [A[0] + dx, A[1] + dy, A[0] + dx + w, A[1] + dy + h];
        const v = iou(A, B);
        const ix0 = Math.max(A[0], B[0]), iy0 = Math.max(A[1], B[1]), ix1 = Math.min(A[2], B[2]), iy1 = Math.min(A[3], B[3]);
        const inter = ix1 > ix0 && iy1 > iy0 ? '<rect x="' + ix0 + '" y="' + iy0 + '" width="' + (ix1 - ix0) + '" height="' + (iy1 - iy0) + '" style="fill:var(--ok);fill-opacity:.35;stroke:none"/>' : '';
        const rect = (b, c) => '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + (b[2] - b[0]) + '" height="' + (b[3] - b[1]) + '" style="fill:none;stroke:' + c + ';stroke-width:2.5"/>';
        $('ioSvg').innerHTML = inter + rect(A, 'var(--accent)') + rect(B, 'var(--warn)') +
          '<text class="lbl" x="104" y="52" style="fill:var(--accent)">' + T('Ground Truth A', 'Ground truth A') + '</text><text class="lbl" x="' + Math.min(B[0], 300) + '" y="' + (B[3] + 14) + '" style="fill:var(--warn)">' + T('Vorhersage B', 'Prediction B') + '</text>';
        const areaI = Math.max(0, ix1 - ix0) * Math.max(0, iy1 - iy0), areaU = 100 * 80 + w * h - areaI;
        $('ioV').textContent = fmt(v, 2);
        $('ioDX').textContent = dx; $('ioDY').textContent = dy; $('ioSC').textContent = sc + ' %';
        $('ioCalc').textContent = 'IoU = ' + fmt(areaI, 0) + ' / ' + fmt(areaU, 0) + ' = ' + fmt(v, 2) + (v >= 0.5 ? '   ' + T('(≥ 0.5: gilt meist als Treffer)', '(≥ 0.5: usually counts as a hit)') : '   ' + T('(< 0.5: kein Treffer)', '(< 0.5: no hit)'));
      }
      [['ioX', (v) => { dx = v; }], ['ioY', (v) => { dy = v; }], ['ioS', (v) => { sc = v; }]].forEach((p) => $(p[0]).addEventListener('input', (e) => { p[1](+e.target.value); draw(); }));
      draw();
    })();

    // Demo 3: non-maximum suppression with a threshold slider
    (function () {
      if (!$('nmSvg')) return;
      // Two objects, each with several overlapping candidate boxes (as an untrained NMS would see them).
      const B = [[30, 30, 120, 120], [40, 38, 132, 126], [24, 44, 114, 134], [96, 50, 176, 130], [104, 44, 188, 122]];
      const P = [0.92, 0.85, 0.7, 0.88, 0.6];
      let tau = 0.5;
      function draw() {
        const keep = nms(B, P, tau);
        let s = '';
        B.forEach((b, i) => {
          const k = keep.indexOf(i) >= 0;
          s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + (b[2] - b[0]) + '" height="' + (b[3] - b[1]) + '" style="fill:none;stroke:' + (k ? 'var(--ok)' : 'var(--muted)') + ';stroke-width:' + (k ? 3 : 1.5) + ';' + (k ? '' : 'stroke-dasharray:5 4') + '"/>' +
            '<text class="lbl" x="' + (b[0] + 3) + '" y="' + (b[1] + 13) + '" style="fill:' + (k ? 'var(--ok)' : 'var(--muted)') + '">' + fmt(P[i], 2) + '</text>';
        });
        $('nmSvg').innerHTML = s;
        $('nmTO').textContent = fmt(tau, 2);
        $('nmN').textContent = keep.length + ' / ' + B.length;
        $('nmMsg').textContent = keep.length > 2 ? T('Zu hoher threshold: Duplikate bleiben stehen (mehr Boxen als Objekte).', 'Threshold too high: duplicates survive (more boxes than objects).')
          : keep.length === 2 ? T('Zwei Objekte, zwei Boxen: das beste Duplikat gewinnt, die anderen werden unterdrückt.', 'Two objects, two boxes: the best candidate wins, the others are suppressed.')
            : T('Zu tiefer threshold: auch das zweite Objekt wird unterdrückt, weil seine Box die erste überlappt.', 'Threshold too low: the second object is suppressed too, because its box overlaps the first.');
      }
      $('nmT').addEventListener('input', (e) => { tau = +e.target.value; draw(); });
      draw();
    })();
  };
})();
