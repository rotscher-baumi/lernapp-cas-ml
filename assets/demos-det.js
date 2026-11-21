/* Demos of the «Object Detection & Segmentation» chapter. modules/det.js calls LernApp.demos.det() once the chapter is in the page.
   IoU and NMS come from LernApp.cvLib in assets/demos-cv.js, which index.html loads first. */
(function () {
  const { $, fmt } = LernApp;
  const { iou, nms } = LernApp.cvLib;

  LernApp.demos.det = function () {
    const T = LernApp.t;

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('detFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Bilder und Labels', '1 · Images and labels'), T('Zuerst die Aufgabe festlegen: <b>Object Detection</b> (Bild rein, Liste aus Box, Klasse, Score) oder <b>Semantic Segmentation</b> (Bild rein, Klasse pro Pixel). Daraus folgen die Labels: Boxen (z. B. YOLO-Format) oder Masken als PNG. Nach Szene oder Video splitten, nicht nach Frames.', 'First fix the task: <b>object detection</b> (image in, list of box, class, score) or <b>semantic segmentation</b> (image in, a class per pixel). The labels follow: boxes (e.g. YOLO format) or masks as PNG. Split by scene or video, not by frame.'), [['Object Detection', '#det-detection'], ['Segmentation', '#det-seg']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('Detection: <b>Faster R-CNN</b> (zwei Stufen, genau) oder <b>YOLO</b> (eine Stufe, schnell), beide aus Backbone, Neck, Head und Post-Processing. Segmentation: <b>U-Net</b> pro Aufgabe trainiert oder das Foundation Model <b>SAM</b> ohne Training.', 'Detection: <b>Faster R-CNN</b> (two stages, accurate) or <b>YOLO</b> (one stage, fast), both built from backbone, neck, head and post-processing. Segmentation: <b>U-Net</b> trained per task or the foundation model <b>SAM</b> without training.'), [[T('Aufbau eines Detectors', 'Structure of a detector'), '#det-aufbau'], ['Segmentation', '#det-seg']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('Detection: Summe aus Klassen-Loss (BCE) und Box-Loss (IoU-basiert, z. B. CIoU). Segmentation: <b>Cross-Entropy + Dice</b> gegen die Klassen-Imbalance. Optimizer meist Adam oder SGD.', 'Detection: class loss (BCE) plus box loss (IoU-based, e.g. CIoU). Segmentation: <b>cross-entropy + Dice</b> against class imbalance. Optimizer usually Adam or SGD.'), [[T('Übersicht', 'Overview'), '#det-methoden']]],
        '4': [T('4 · Forward Pass', '4 · Forward pass'), T('Detection: Der Head gibt viele Kandidaten-Boxen mit Score aus; bei der Inferenz folgen <b>Score-Threshold</b> und <b>NMS</b>. Segmentation: eine Karte mit Klassen-Scores pro Pixel.', 'Detection: the head outputs many candidate boxes with scores; at inference a <b>score threshold</b> and <b>NMS</b> follow. Segmentation: a map of class scores per pixel.'), [[T('Aufbau eines Detectors', 'Structure of a detector'), '#det-aufbau'], ['IoU und NMS', '#det-iou']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Detection ordnet zuerst jeder Ground-Truth-Box passende Anker oder Zellen zu (über IoU), dann Klasse und Box vergleichen. Segmentation vergleicht Pixel für Pixel mit der Maske.', 'Detection first assigns anchors or cells to every ground-truth box (via IoU), then compares class and box. Segmentation compares pixel by pixel with the mask.'), [['IoU und NMS', '#det-iou']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Wie beim <a href="#cnn">CNN</a>: Gradienten für alle Filter in Head, Neck und Backbone.', 'As for the <a href="#cnn">CNN</a>: gradients for all filters in head, neck and backbone.'), [['CNN', '#cnn']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Der Optimizer verschiebt die Gewichte gegen den Gradienten. Mit vortrainiertem Backbone (Transfer Learning) startet das Netz nicht bei null; oft wird das Backbone zuerst eingefroren.', 'The optimizer moves the weights against the gradient. With a pretrained backbone (transfer learning) the network does not start from scratch; often the backbone is frozen first.'), [['Transfer Learning', '#cnn-transfer']]],
        '8': [T('8 · Validation prüfen', '8 · Check validation'), T('Detection: <b>mAP</b> bei IoU-Thresholds (mAP@0.5, mAP@0.5:0.95). Segmentation: <b>IoU</b> und Dice pro Klasse (mIoU). Score-Threshold und τ hier wählen. Immer auch Boxen und Masken ansehen.', 'Detection: <b>mAP</b> at IoU thresholds (mAP@0.5, mAP@0.5:0.95). Segmentation: <b>IoU</b> and Dice per class (mIoU). Choose the score threshold and τ here. Always look at boxes and masks too.'), [[T('Übersicht', 'Overview'), '#det-methoden'], ['Best Practices', '#det-best']]],
        '9': [T('9 · Einmal testen', '9 · Test once'), T('Das Testset bleibt bis zum Schluss gesperrt. Auf neuen Szenen, Kameras und Lichtverhältnissen testen, nicht auf Frames aus denselben Videos wie im Training.', 'The test set stays locked until the end. Test on new scenes, cameras and lighting, not on frames from the same videos as in training.'), [['Best Practices', '#det-best']]],
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

    // Demo 1: IoU of two boxes. Both boxes are dragged with the mouse (or finger); the corner handle resizes.
    // Keyboard: Tab to a box, arrows move it, Shift + arrows resize it.
    (function () {
      const svg = $('ioSvg');
      if (!svg) return;
      const VW = 400, VH = 300, MIN = 20, NS = 'http://www.w3.org/2000/svg';
      const boxes = [[100, 60, 200, 140], [140, 80, 240, 160]]; // A = ground truth, B = prediction
      const colors = ['var(--accent)', 'var(--warn)'];
      const names = [T('Ground Truth A', 'Ground truth A'), T('Vorhersage B', 'Prediction B')];
      const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k])); return e; };
      svg.innerHTML = '';
      svg.style.touchAction = 'none';
      const inter = el('rect', { style: 'fill:var(--ok);fill-opacity:.35;stroke:none;pointer-events:none' });
      svg.appendChild(inter);
      const parts = boxes.map((_, i) => {
        const g = el('g', { tabindex: '0', role: 'button', 'aria-label': names[i] + T(': ziehen zum Verschieben, Ecke ziehen für die Grösse; Pfeiltasten verschieben, Shift + Pfeiltasten ändern die Grösse', ': drag to move, drag the corner to resize; arrow keys move, Shift + arrow keys resize') });
        const body = el('rect', { style: 'fill:' + colors[i] + ';fill-opacity:.08;stroke:' + colors[i] + ';stroke-width:2.5;cursor:move' });
        const handle = el('rect', { width: 12, height: 12, style: 'fill:' + colors[i] + ';stroke:var(--bg);stroke-width:1.5;cursor:nwse-resize' });
        const label = el('text', { class: 'lbl', style: 'fill:' + colors[i] + ';pointer-events:none' });
        label.textContent = names[i];
        g.append(body, handle, label);
        svg.appendChild(g);
        return { g, body, handle, label };
      });
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      function draw() {
        boxes.forEach((b, i) => {
          const p = parts[i];
          p.body.setAttribute('x', b[0]); p.body.setAttribute('y', b[1]);
          p.body.setAttribute('width', b[2] - b[0]); p.body.setAttribute('height', b[3] - b[1]);
          p.handle.setAttribute('x', b[2] - 6); p.handle.setAttribute('y', b[3] - 6);
          // Label above the box, or below it when there is no room at the top
          p.label.setAttribute('x', clamp(b[0] + 2, 2, VW - 110));
          p.label.setAttribute('y', b[1] > 18 ? b[1] - 6 : b[3] + 16);
        });
        const [A, B] = boxes;
        const ix0 = Math.max(A[0], B[0]), iy0 = Math.max(A[1], B[1]), ix1 = Math.min(A[2], B[2]), iy1 = Math.min(A[3], B[3]);
        const iw = Math.max(0, ix1 - ix0), ih = Math.max(0, iy1 - iy0);
        inter.setAttribute('x', ix0); inter.setAttribute('y', iy0); inter.setAttribute('width', iw); inter.setAttribute('height', ih);
        const area = (b) => (b[2] - b[0]) * (b[3] - b[1]);
        const areaI = iw * ih, areaU = area(A) + area(B) - areaI, v = iou(A, B);
        $('ioV').textContent = fmt(v, 2);
        $('ioI').textContent = fmt(areaI, 0);
        $('ioU').textContent = fmt(areaU, 0);
        $('ioCalc').textContent = 'IoU = ' + fmt(areaI, 0) + ' / ' + fmt(areaU, 0) + ' = ' + fmt(v, 2) + (v >= 0.5 ? '   ' + T('(≥ 0.5: gilt meist als Treffer)', '(≥ 0.5: usually counts as a hit)') : '   ' + T('(< 0.5: kein Treffer)', '(< 0.5: no hit)'));
      }
      // Move keeps the size; resize moves the bottom-right corner. Both stay inside the plot.
      function move(b, dx, dy) {
        const w = b[2] - b[0], h = b[3] - b[1];
        b[0] = clamp(b[0] + dx, 0, VW - w); b[1] = clamp(b[1] + dy, 0, VH - h);
        b[2] = b[0] + w; b[3] = b[1] + h;
      }
      function resize(b, x, y) {
        b[2] = clamp(x, b[0] + MIN, VW); b[3] = clamp(y, b[1] + MIN, VH);
      }
      function toSvg(e) {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        return [Math.round(p.x), Math.round(p.y)]; // whole pixels, so the areas in the calculation stay integers
      }
      let drag = null;
      parts.forEach((p, i) => {
        [[p.body, 'move'], [p.handle, 'resize']].forEach(([target, mode]) => target.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const [x, y] = toSvg(e), b = boxes[i];
          // Remember where the drag started, so the box stays under the pointer even after hitting the border
          drag = { i, mode, x, y, start: b.slice(), ox: b[2] - x, oy: b[3] - y };
          svg.setPointerCapture(e.pointerId);
          svg.appendChild(p.g); // the active box goes on top, so it stays grabbable when the boxes overlap
          p.g.focus({ preventScroll: true });
        }));
        p.g.addEventListener('keydown', (e) => {
          const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
          if (!d) return;
          e.preventDefault();
          const b = boxes[i], step = 5;
          if (e.shiftKey) resize(b, b[2] + d[0] * step, b[3] + d[1] * step); else move(b, d[0] * step, d[1] * step);
          draw();
        });
      });
      svg.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const [x, y] = toSvg(e), b = boxes[drag.i];
        if (drag.mode === 'move') { for (let k = 0; k < 4; k++) b[k] = drag.start[k]; move(b, x - drag.x, y - drag.y); }
        else resize(b, x + drag.ox, y + drag.oy);
        draw();
      });
      const end = () => { drag = null; };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
      draw();
    })();

    // Demo 2: non-maximum suppression with a threshold slider
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
        $('nmMsg').textContent = keep.length > 2 ? T('Zu hoher Threshold: Duplikate bleiben stehen (mehr Boxen als Objekte).', 'Threshold too high: duplicates survive (more boxes than objects).')
          : keep.length === 2 ? T('Zwei Objekte, zwei Boxen: Das beste Duplikat gewinnt, die anderen werden unterdrückt.', 'Two objects, two boxes: the best candidate wins, the others are suppressed.')
            : T('Zu tiefer Threshold: Auch das zweite Objekt wird unterdrückt, weil seine Box die erste überlappt.', 'Threshold too low: the second object is suppressed too, because its box overlaps the first.');
      }
      $('nmT').addEventListener('input', (e) => { tau = +e.target.value; draw(); });
      draw();
    })();
  };
})();
