/* Demos of the «Image Processing» chapter. modules/cv.js calls LernApp.demos.cv() once the chapter is in the page.
   LernApp.cvLib (IoU, NMS, filters) is shared with assets/demos-det.js. */
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
  // Luma weights of ITU-R BT.601 (what OpenCV uses for BGR2GRAY).
  const gray = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  // Hue in degrees 0..360 of an RGB colour, -1 for grey (no hue).
  function hue(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d === 0) return -1;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }
  // Order of the values of an H × W × C image in memory: [channel, y, x] per position.
  function layout(H, W, C, order) {
    const out = [];
    if (order === 'hwc') { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let c = 0; c < C; c++) out.push([c, y, x]); }
    else { for (let c = 0; c < C; c++) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.push([c, y, x]); }
    return out;
  }
  LernApp.cvLib = { testImage, filter3, meanF, medianF, psnr, iou, nms, gray, hue, layout };

  LernApp.demos.cv = function () {
    const T = LernApp.t;

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('cvFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Bildpaare und Aufgabe', '1 · Image pairs and task'), T('Zuerst festlegen, welche Verschlechterung rückgängig gemacht werden soll: <b>Denoising</b> (Rauschen), <b>Deblurring</b> (Unschärfe) oder <b>Super-Resolution</b> (zu wenige Pixel). Daraus folgen die Daten: Bildpaare (verschlechtert, sauber), oft künstlich erzeugt. Pixel auf 0 bis 1 skalieren.', 'First decide which degradation to undo: <b>denoising</b> (noise), <b>deblurring</b> (blur) or <b>super-resolution</b> (too few pixels). The data follows: image pairs (degraded, clean), often generated synthetically. Scale pixels to 0 to 1.'), [['Bildentstehung', '#cv-bild'], [T('Pixel und Channels', 'Pixels and channels'), '#cv-pixel'], ['Denoising, Deblurring, Super-Resolution', '#cv-restauration']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('Zuerst eine klassische Baseline (Median, Gauss, Bicubic). Gelernt: CNN mit <b>Skip Connections</b> (U-Net, DnCNN) oder Transformer (SwinIR, Restormer).', 'First a classical baseline (median, Gaussian, bicubic). Learned: CNN with <b>skip connections</b> (U-Net, DnCNN) or transformer (SwinIR, Restormer).'), [['Restauration', '#cv-restauration']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('Meist <b>L1</b> (schärfer als L2), oft plus Perceptual oder GAN-Loss. Optimizer meist Adam.', 'Usually <b>L1</b> (sharper than L2), often plus a perceptual or GAN loss. Optimizer usually Adam.'), [[T('Übersicht', 'Overview'), '#cv-methoden']]],
        '4': [T('4 · Forward Pass', '4 · Forward pass'), T('Das Netz berechnet aus dem verschlechterten Bild ein restauriertes Bild, bei Super-Resolution in grösserer Auflösung.', 'The network computes a restored image from the degraded one, larger for super-resolution.'), [['Restauration', '#cv-restauration']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Das restaurierte Bild wird Pixel für Pixel mit dem sauberen Bild verglichen (L1), beim Perceptual Loss in den Features eines vortrainierten Netzes.', 'The restored image is compared pixel by pixel with the clean image (L1); for the perceptual loss in the features of a pretrained network.'), [['Restauration', '#cv-restauration']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Wie beim <a href="#cnn">CNN</a>: Gradienten für alle Filter. Skip Connections helfen, weil der Fehler auf kurzem Weg zu den frühen Schichten zurückfliesst.', 'As for the <a href="#cnn">CNN</a>: gradients for all filters. Skip connections help because the error flows back to the early layers on a short path.'), [['CNN', '#cnn']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Der Optimizer verschiebt die Gewichte gegen den Gradienten. Mit vortrainierten Gewichten startet das Netz nicht bei null.', 'The optimizer moves the weights against the gradient. With pretrained weights the network does not start from scratch.'), [['Transfer Learning', '#cnn-transfer']]],
        '8': [T('8 · Validation prüfen', '8 · Check validation'), T('<b>PSNR</b> und SSIM gegen das saubere Bild, verglichen mit der klassischen Baseline. Immer auch Bilder ansehen: Metriken können gut sein, obwohl das Bild unnatürlich glatt wirkt.', '<b>PSNR</b> and SSIM against the clean image, compared with the classical baseline. Always look at images too: metrics can be good although the image looks unnaturally smooth.'), [[T('Übersicht', 'Overview'), '#cv-methoden'], ['Best Practices', '#cv-best']]],
        '9': [T('9 · Einmal testen', '9 · Test once'), T('Das Testset bleibt bis zum Schluss gesperrt. Bilder aus anderen Kameras oder mit anderem Rauschen testen: Ein Netz, das nur auf künstlichem Rauschen trainiert wurde, versagt oft bei echten Fotos.', 'The test set stays locked until the end. Test with images from other cameras or with different noise: a network trained only on synthetic noise often fails on real photos.'), [['Bildentstehung', '#cv-bild']]],
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
        $('rcvMsg').textContent = pr > pd + 0.05 ? T('Der Filter hat das Bild verbessert (PSNR +' + fmt(pr - pd, 1) + ' dB).', 'The filter improved the image (PSNR +' + fmt(pr - pd, 1) + ' dB).')
          : fix === 'none' ? T('Noch nichts restauriert. Wähle einen Filter.', 'Nothing restored yet. Choose a filter.')
            : T('Der Filter hilft hier nicht (oder schadet): Weichzeichnen verschmiert Kanten, die das Bild braucht.', 'The filter does not help here (or hurts): smoothing blurs edges the image needs.');
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

    // Demo: pixel inspector, channel split, bit depth, memory, layout, Bayer (section «Was in einem Bild steckt»)
    (function () {
      const scene = $('pxScene');
      if (!scene) return;
      const W = scene.width, H = scene.height;
      const c = scene.getContext('2d', { willReadFrequently: true });
      // Sample scene in fixed photo colours (an image, not page chrome, so it is the same in both themes).
      const sky = c.createLinearGradient(0, 0, 0, 62);
      sky.addColorStop(0, '#2f6fd0'); sky.addColorStop(1, '#f7c873');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(124, 22, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3c9a5f'; c.beginPath(); c.moveTo(0, 62); c.quadraticCurveTo(50, 36, 100, 60); c.quadraticCurveTo(135, 46, 160, 58); c.lineTo(160, 100); c.lineTo(0, 100); c.fill();
      c.fillStyle = '#23633b'; c.beginPath(); c.moveTo(0, 78); c.quadraticCurveTo(70, 60, 160, 80); c.lineTo(160, 100); c.lineTo(0, 100); c.fill();
      c.fillStyle = '#1e64d8'; c.beginPath(); c.ellipse(112, 86, 34, 8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#f2efe6'; c.fillRect(30, 56, 26, 20);
      c.fillStyle = '#d62828'; c.beginPath(); c.moveTo(26, 57); c.lineTo(43, 42); c.lineTo(60, 57); c.fill();
      c.fillStyle = '#5a3a22'; c.fillRect(39, 66, 7, 10);
      c.fillStyle = '#7fc8f8'; c.fillRect(32, 59, 6, 5); c.fillRect(48, 59, 6, 5);
      const data = c.getImageData(0, 0, W, H).data;
      const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
      const hex2 = (v) => v.toString(16).padStart(2, '0').toUpperCase();

      // Inspector: 9 × 9 magnifier and the values of the centre pixel
      const lens = $('pxLens'), lc = lens.getContext('2d'), N = 9, S = lens.width / N, h = (N - 1) / 2;
      function inspect(x, y) {
        x = Math.max(0, Math.min(W - 1, x)); y = Math.max(0, Math.min(H - 1, y));
        lc.clearRect(0, 0, lens.width, lens.height);
        for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
          const xx = x + i - h, yy = y + j - h;
          lc.fillStyle = xx < 0 || yy < 0 || xx >= W || yy >= H ? 'rgba(128,128,128,0.2)' : 'rgb(' + px(xx, yy).join(',') + ')';
          lc.fillRect(i * S, j * S, S, S);
        }
        lc.strokeStyle = 'rgba(0,0,0,0.18)'; lc.lineWidth = 1; lc.beginPath();
        for (let k = 1; k < N; k++) { lc.moveTo(k * S + 0.5, 0); lc.lineTo(k * S + 0.5, lens.height); lc.moveTo(0, k * S + 0.5); lc.lineTo(lens.width, k * S + 0.5); }
        lc.stroke();
        lc.lineWidth = 3; lc.strokeStyle = '#fff'; lc.strokeRect(h * S + 1.5, h * S + 1.5, S - 3, S - 3);
        lc.lineWidth = 1; lc.strokeStyle = '#000'; lc.strokeRect(h * S, h * S, S, S);
        const [r, g, b] = px(x, y), off = (y * W + x) * 3;
        $('pxRead').innerHTML =
          '<dt>' + T('Index', 'Index') + '</dt><dd>img[' + y + ', ' + x + ']</dd>' +
          '<dt>RGB</dt><dd><span class="px-sw" style="background:rgb(' + r + ',' + g + ',' + b + ')"></span>[<span class="px-r">' + r + '</span>, <span class="px-g">' + g + '</span>, <span class="px-b">' + b + '</span>]</dd>' +
          '<dt>OpenCV</dt><dd>BGR [' + b + ', ' + g + ', ' + r + ']</dd>' +
          '<dt>Hex</dt><dd>#' + hex2(r) + hex2(g) + hex2(b) + '</dd>' +
          '<dt>float32</dt><dd>[' + [r, g, b].map((v) => (v / 255).toFixed(3)).join(', ') + ']</dd>' +
          '<dt>' + T('Grau', 'Grey') + '</dt><dd>' + Math.round(gray(r, g, b)) + '</dd>' +
          '<dt>Bytes</dt><dd>' + T('Offset ', 'offset ') + off + '…' + (off + 2) + ' (HWC)</dd>';
      }
      function at(e) {
        const rc = scene.getBoundingClientRect();
        inspect(Math.floor((e.clientX - rc.left) / rc.width * W), Math.floor((e.clientY - rc.top) / rc.height * H));
      }
      scene.addEventListener('pointermove', at);
      scene.addEventListener('pointerdown', at);
      inspect(36, 48); // start on the edge of the red roof, so the magnifier shows two colours

      // Channel split
      const defs = [
        ['R · ' + T('Rot', 'red'), 'img[:, :, 0]', (r, g, b) => [r, r, r], (r) => [r, 0, 0]],
        ['G · ' + T('Grün', 'green'), 'img[:, :, 1]', (r, g) => [g, g, g], (r, g) => [0, g, 0]],
        ['B · ' + T('Blau', 'blue'), 'img[:, :, 2]', (r, g, b) => [b, b, b], (r, g, b) => [0, 0, b]],
        [T('Graustufen', 'Greyscale'), '.299R + .587G + .114B', (r, g, b) => { const v = gray(r, g, b); return [v, v, v]; }, (r, g, b) => { const v = gray(r, g, b); return [v, v, v]; }],
        ['Hue (HSV)', T('Winkel 0–360°', 'angle 0–360°'), (r, g, b) => { const t = hue(r, g, b); const v = t < 0 ? 128 : t / 360 * 255; return [v, v, v]; },
          (r, g, b) => { const t = hue(r, g, b); if (t < 0) return [128, 128, 128]; const f = (n) => { const k = (n + t / 30) % 12; return 255 * (0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1))); }; return [f(0), f(8), f(4)]; }],
        ['Alpha (RGBA)', T('4. Channel: Deckkraft', '4th channel: opacity'), null, null],
      ];
      const wrap = $('pxCh');
      wrap.innerHTML = '';
      const cvs = defs.map((d) => {
        const box = document.createElement('div');
        const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        cv.setAttribute('aria-label', d[0]);
        box.append(cv);
        box.insertAdjacentHTML('beforeend', '<b>' + d[0] + '</b><code>' + d[1] + '</code>');
        wrap.append(box);
        return cv;
      });
      function channels(tint) {
        defs.forEach((d, k) => {
          const cx = cvs[k].getContext('2d'), out = cx.createImageData(W, H), o = out.data;
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4, r = data[i], g = data[i + 1], b = data[i + 2];
            let v;
            if (!d[2]) { // alpha: linear ramp, tinted = composited over a checkerboard
              const a = Math.min(1, Math.max(0, (x - 10) / (W - 20)));
              if (tint) { const ch = ((x >> 3) + (y >> 3)) % 2 ? 200 : 245; v = [r * a + ch * (1 - a), g * a + ch * (1 - a), b * a + ch * (1 - a)]; }
              else v = [a * 255, a * 255, a * 255];
            } else v = (tint ? d[3] : d[2])(r, g, b);
            o[i] = v[0]; o[i + 1] = v[1]; o[i + 2] = v[2]; o[i + 3] = 255;
          }
          cx.putImageData(out, 0, 0);
        });
      }
      const mode = $('pxMode');
      mode.querySelectorAll('button').forEach((bt) => bt.addEventListener('click', () => {
        mode.querySelectorAll('button').forEach((x) => { x.setAttribute('aria-pressed', 'false'); x.classList.remove('pri'); });
        bt.setAttribute('aria-pressed', 'true'); bt.classList.add('pri');
        channels(bt.getAttribute('data-v') === 'tint');
      }));
      channels(false);

      // Bit depth: the same ramp quantised to 2, 4, 16 and 256 levels
      $('pxLevels').innerHTML = [1, 2, 4, 8].map((bits) => '<div><span>' + bits + ' Bit · ' + (2 ** bits) + T(' Stufen', ' levels') + '</span><canvas width="256" height="1" data-bits="' + bits + '" aria-hidden="true"></canvas></div>').join('');
      $('pxLevels').querySelectorAll('canvas').forEach((cv) => {
        const lv = 2 ** +cv.dataset.bits, cx = cv.getContext('2d');
        for (let x = 0; x < 256; x++) { const q = Math.round(Math.floor(x / 256 * lv) / (lv - 1) * 255); cx.fillStyle = 'rgb(' + q + ',' + q + ',' + q + ')'; cx.fillRect(x, 0, 1, 1); }
      });

      // Memory calculator
      const loc = T('de-CH', 'en-US');
      function size(bytes) {
        const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0;
        while (bytes >= 1000 && i < u.length - 1) { bytes /= 1000; i++; }
        return bytes.toLocaleString(loc, { maximumFractionDigits: 1 }) + ' ' + u[i];
      }
      const ins = ['pxH', 'pxW', 'pxC', 'pxD'].map((id) => $(id));
      function calc() {
        const [hh, ww, cc, dd] = ins.map((e) => Math.max(0, Math.floor(+e.value) || 0));
        const bytes = hh * ww * cc * dd;
        $('pxM1').textContent = size(bytes);
        $('pxM32').textContent = size(bytes * 32);
        $('pxMCalc').textContent = hh.toLocaleString(loc) + ' × ' + ww.toLocaleString(loc) + ' × ' + cc + ' × ' + dd + ' B = ' + bytes.toLocaleString(loc) + ' Bytes';
      }
      ins.forEach((e) => e.addEventListener('input', calc));
      calc();

      // HWC vs CHW for a 2 × 2 image
      const P = [[[214, 60, 60], [40, 160, 90]], [[50, 90, 220], [235, 190, 40]]];
      $('pxMini').innerHTML = P.map((row, y) => row.map((p, x) => '<div style="background:rgb(' + p.join(',') + ')">' + y + ',' + x + '</div>').join('')).join('');
      const names = ['R', 'G', 'B'];
      const strip = (order) => layout(2, 2, 3, order).map((q, i) => '<span class="px-cell px-c' + names[q[0]] + '" title="' + T('Position ', 'position ') + i + ': ' + names[q[0]] + T(' von Pixel [', ' of pixel [') + q[1] + ', ' + q[2] + ']">' + names[q[0]] + q[1] + q[2] + '</span>').join('');
      $('pxHWC').innerHTML = strip('hwc');
      $('pxCHW').innerHTML = strip('chw');

      // Bayer pattern RGGB
      let bay = '';
      for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { const k = y % 2 === 0 ? (x % 2 === 0 ? 'R' : 'G') : (x % 2 === 0 ? 'G' : 'B'); bay += '<span class="px-c' + k + '">' + k + '</span>'; }
      $('pxBayer').innerHTML = bay;
    })();
  };
})();
