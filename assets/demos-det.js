/* Demos and figures of the «Object Detection & Segmentation» chapter.
   LernApp.detFig builds the static SVG figures; modules/det.js and modules/en/det.js call it inside their html (this file
   loads before the modules, and LernApp.t already knows the language). LernApp.demos.det() wires the demos once the
   chapter is in the page. IoU and NMS come from LernApp.cvLib in assets/demos-cv.js, which index.html loads first. */
(function () {
  const { $, fmt } = LernApp;
  const { iou, nms } = LernApp.cvLib;
  const T = LernApp.t;

  /* ---------- Shared street scene (tile 220 × 150): road, car, two people, tree ---------- */
  // mode: 'plain' (photo-like), 'sem' (one colour per class), 'inst' (one colour per object, background not labelled)
  const SC = { car: [18, 76, 112, 124], p1: [126, 60, 142, 118], p2: [148, 60, 164, 118] };
  function car(f, plain) {
    return '<g style="fill:' + f + '"><path d="M38 92L50 78H86L98 92Z"/><rect x="20" y="92" width="90" height="22" rx="5"/><circle cx="40" cy="114" r="8"/><circle cx="90" cy="114" r="8"/></g>' +
      (plain ? '<path d="M50 81H66V91H42Z M70 81H86L95 91H70Z" style="fill:var(--surface);opacity:.85"/><circle cx="40" cy="114" r="3" style="fill:var(--surface)"/><circle cx="90" cy="114" r="3" style="fill:var(--surface)"/>' : '');
  }
  function person(cx, f) {
    return '<g style="fill:' + f + '"><circle cx="' + cx + '" cy="68" r="6"/><rect x="' + (cx - 6) + '" y="76" width="12" height="24" rx="4"/>' +
      '<rect x="' + (cx - 5) + '" y="98" width="4" height="18" rx="2"/><rect x="' + (cx + 1) + '" y="98" width="4" height="18" rx="2"/></g>';
  }
  function scene(mode) {
    const plain = mode === 'plain';
    let s = '<rect width="220" height="105" style="fill:' + (plain ? 'var(--accent-soft)' : 'var(--bg)') + '"/>' +
      '<rect y="105" width="220" height="45" style="fill:' + (plain ? 'var(--line)' : mode === 'sem' ? 'var(--muted)' : 'var(--bg)') + '"/>';
    if (plain) s += '<path d="M0 132H220" style="stroke:var(--surface);stroke-width:2;stroke-dasharray:14 10"/>';
    if (mode !== 'inst') {
      s += '<g' + (plain ? ' opacity=".55"' : '') + '><rect x="181" y="62" width="8" height="48" style="fill:' + (plain ? 'var(--warn)' : 'var(--ok)') + '"/><circle cx="185" cy="52" r="22" style="fill:var(--ok)"/></g>';
    }
    if (plain) return s + '<g opacity=".7">' + car('var(--accent)', true) + '</g><g opacity=".6">' + person(134, 'var(--fg)') + '</g><g opacity=".45">' + person(156, 'var(--fg)') + '</g>';
    if (mode === 'sem') return s + car('var(--accent)') + person(134, 'var(--bad)') + person(156, 'var(--bad)');
    return s + car('var(--accent)') + person(134, 'var(--bad)') + person(156, 'var(--warn)');
  }
  // Class of the scene at point (x, y): 0 background, 1 road, 2 car, 3 person, 4 tree (same geometry as scene())
  function sceneClass(x, y) {
    const d = (cx, cy) => Math.hypot(x - cx, y - cy);
    const k = 12 / 14;
    const isCar = (x >= 20 && x <= 110 && y >= 92 && y <= 114) || (y >= 78 && y <= 92 && x >= 50 - (y - 78) * k && x <= 86 + (y - 78) * k) || d(40, 114) <= 8 || d(90, 114) <= 8;
    const isPerson = (cx) => d(cx, 68) <= 6 || (x >= cx - 6 && x <= cx + 6 && y >= 76 && y <= 100) || (y >= 98 && y <= 116 && ((x >= cx - 5 && x <= cx - 1) || (x >= cx + 1 && x <= cx + 5)));
    if (isCar) return 2;
    if (isPerson(134) || isPerson(156)) return 3;
    if (d(185, 52) <= 22 || (x >= 181 && x <= 189 && y >= 62 && y <= 110)) return 4;
    return y >= 105 ? 1 : 0;
  }
  const CLS = ['var(--bg)', 'var(--muted)', 'var(--accent)', 'var(--bad)', 'var(--ok)'];
  const rect = (b, style) => '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + (b[2] - b[0]) + '" height="' + (b[3] - b[1]) + '" style="' + style + '"/>';
  const frame = '<rect width="220" height="150" rx="4" style="fill:none;stroke:var(--line);stroke-width:1.5"/>';
  // Box with a few short lines of text: [title, line 1, line 2], class of the box
  function block(x, y, w, h, cls, lines) {
    let s = '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>';
    lines.forEach((l, i) => {
      if (!l) return;
      s += '<text class="' + (i ? 'd-m' : 'd-tb') + '" x="' + (x + w / 2) + '" y="' + (y + 18 + i * 18) + '"' + (i ? '' : ' style="font-size:13px"') + '>' + l + '</text>';
    });
    return s;
  }
  const arrow = (x1, y1, x2, y2, cls) => '<line class="' + (cls || 'd-arr') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';

  LernApp.detFig = {
    // Four tasks on the same scene
    tasks() {
      const P = [
        ['cls', T('Klassifikation', 'Classification'), T('ein Label für das ganze Bild', 'one label for the whole image')],
        ['det', 'Object Detection', T('Box, Klasse und Score pro Objekt', 'box, class and score per object')],
        ['sem', 'Semantic Segmentation', T('Klasse pro Pixel; beide Personen gleich', 'class per pixel; both people alike')],
        ['inst', 'Instance Segmentation', T('eigene Maske pro Objekt', 'own mask per object')],
      ];
      let s = '';
      P.forEach((p, i) => {
        const x = (i % 2) * 250, y = Math.floor(i / 2) * 200;
        s += '<text class="d-tb" x="' + (x + 110) + '" y="' + (y + 12) + '" style="text-anchor:middle">' + p[1] + '</text>' +
          '<g transform="translate(' + x + ',' + (y + 22) + ')">' + scene(p[0] === 'cls' || p[0] === 'det' ? 'plain' : p[0]);
        if (p[0] === 'cls') {
          s += '<rect x="8" y="8" width="104" height="24" rx="5" style="fill:var(--surface);stroke:var(--accent);stroke-width:1.5"/><text class="d-t d-ml" x="16" y="20">' + T('«Auto» 0.91', '“car” 0.91') + '</text>';
        }
        if (p[0] === 'det') {
          s += rect(SC.car, 'fill:none;stroke:var(--accent);stroke-width:2.5') + rect(SC.p1, 'fill:none;stroke:var(--bad);stroke-width:2') + rect(SC.p2, 'fill:none;stroke:var(--bad);stroke-width:2') +
            '<text class="lbl" x="18" y="71" style="fill:var(--accent);font-size:11px">car 0.94</text>' +
            '<text class="lbl" x="112" y="55" style="fill:var(--bad);font-size:11px">person 0.88</text>' +
            '<text class="lbl" x="142" y="130" style="fill:var(--bad);font-size:11px">person 0.81</text>';
        }
        s += frame + '</g><text class="d-m" x="' + (x + 110) + '" y="' + (y + 186) + '">' + p[2] + '</text>';
      });
      return '<svg viewBox="0 0 470 395" role="img" aria-label="' + T('Dieselbe Strassenszene viermal: Klassifikation gibt ein Label, Object Detection Boxen, Semantic Segmentation färbt jeden Pixel nach Klasse, Instance Segmentation färbt jedes Objekt einzeln', 'The same street scene four times: classification gives one label, object detection boxes, semantic segmentation colours every pixel by class, instance segmentation colours every object separately') + '">' + s + '</svg>';
    },

    // Faster R-CNN pipeline: two stages
    rcnn() {
      const B = [
        ['d-box', [T('Bild', 'Image'), T('beliebig gross', 'any size'), 'RGB']],
        ['d-hl', ['Backbone', 'z. B. ResNet-50', T('vortrainiert', 'pretrained')]],
        ['d-hl', ['FPN', 'Feature Maps', T('5 Massstäbe', '5 scales')]],
        ['d-hl', ['RPN', 'Objectness', T('+ Box pro Anker', '+ box per anchor')]],
        ['d-hl', ['Proposals', 'Top-k + NMS', T('viele Regionen', 'many regions')]],
        ['d-warn', ['RoI Align', T('jede Region', 'each region'), T('→ 7 × 7 Features', '→ 7 × 7 features')]],
        ['d-warn', ['Head', T('Klasse (C + 1)', 'class (C + 1)'), T('+ Box-Korrektur', '+ box refinement')]],
        ['d-ok', [T('Ergebnis', 'Result'), T('NMS pro Klasse', 'NMS per class'), T('Box, Klasse, Score', 'box, class, score')]],
      ];
      let s = '';
      B.forEach((b, i) => {
        const x = 12 + i * 120;
        s += block(x, 40, 100, 84, b[0], b[1]);
        if (i < B.length - 1) s += arrow(x + 102, 82, x + 118, 82);
      });
      s += '<path class="d-ln" d="M132 136V146H568V136"/><path class="d-ln" d="M612 136V146H808V136"/>' +
        '<text class="d-tb" x="350" y="168" style="text-anchor:middle;font-size:13px">' + T('Stufe 1: Wo könnte ein Objekt sein?', 'Stage 1: where could an object be?') + '</text>' +
        '<text class="d-m" x="350" y="188">' + T('klassenlos: nur «Objekt» oder «Hintergrund»', 'class-agnostic: only “object” or “background”') + '</text>' +
        '<text class="d-tb" x="710" y="168" style="text-anchor:middle;font-size:13px">' + T('Stufe 2: Was ist es genau?', 'Stage 2: what exactly is it?') + '</text>' +
        '<text class="d-m" x="710" y="188">' + T('pro Region: Klasse und genaue Box', 'per region: class and exact box') + '</text>' +
        '<text class="d-m" x="902" y="146">' + T('feste Regel', 'fixed rule') + '</text>' +
        '<text class="d-m" x="470" y="222">' + T('Backbone, RPN und Head werden gemeinsam trainiert: Der Loss ist RPN-Loss + Head-Loss.', 'Backbone, RPN and head are trained together: the loss is RPN loss + head loss.') + '</text>';
      return '<svg viewBox="0 0 960 236" style="min-width:680px" role="img" aria-label="' + T('Faster R-CNN: Bild, Backbone, FPN, Region Proposal Network mit Ankern, Proposals, RoI Align, Head für Klasse und Box, NMS. Stufe 1 schlägt Regionen vor, Stufe 2 klassifiziert sie.', 'Faster R-CNN: image, backbone, FPN, region proposal network with anchors, proposals, RoI Align, head for class and box, NMS. Stage 1 proposes regions, stage 2 classifies them.') + '">' + s + '</svg>';
    },

    // Nine anchors at one position and the one that fits the ground-truth box best
    anchors() {
      const cx = 160, cy = 115, gt = [139, 66, 189, 170];
      const sizes = [48, 84, 120], ratios = [0.5, 1, 2], col = ['var(--muted)', 'var(--accent)', 'var(--warn)'];
      let s = '<rect width="320" height="230" style="fill:var(--surface)"/>';
      for (let x = 0; x <= 320; x += 32) s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="230" style="stroke:var(--line);stroke-width:.8"/>';
      for (let y = 3; y <= 230; y += 32) s += '<line x1="0" y1="' + y + '" x2="320" y2="' + y + '" style="stroke:var(--line);stroke-width:.8"/>';
      let best = null, bestV = -1;
      const all = [];
      sizes.forEach((sz, i) => ratios.forEach((r) => {
        const w = sz / Math.sqrt(r), h = sz * Math.sqrt(r), b = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
        const v = iou(b, gt);
        all.push([b, i]);
        if (v > bestV) { bestV = v; best = b; }
      }));
      all.forEach(([b, i]) => { if (b !== best) s += rect(b.map((v) => v.toFixed(1)), 'fill:none;stroke:' + col[i] + ';stroke-width:1.3;stroke-dasharray:5 4'); });
      s += rect(gt, 'fill:var(--ok);fill-opacity:.18;stroke:var(--ok);stroke-width:2.5') +
        rect(best.map((v) => v.toFixed(1)), 'fill:none;stroke:var(--accent);stroke-width:3') +
        '<circle cx="' + cx + '" cy="' + cy + '" r="4" style="fill:var(--fg)"/>' +
        '<text class="lbl" x="193" y="80" style="fill:var(--ok);font-size:11px">Ground Truth</text>' +
        '<text class="lbl" x="8" y="16" style="font-size:11px">' + T('3 Grössen × 3 Seitenverhältnisse = 9 Anker', '3 sizes × 3 aspect ratios = 9 anchors') + '</text>' +
        '<text class="lbl" x="8" y="222" style="fill:var(--accent);font-size:11px">' + T('bester Anker: IoU = ', 'best anchor: IoU = ') + fmt(bestV, 2) + T(' → er lernt dieses Objekt', ' → it learns this object') + '</text>';
      return '<svg viewBox="0 0 320 230" role="img" aria-label="' + T('Neun gestrichelte Anker um einen Punkt der Feature Map, dazu die grüne Ground-Truth-Box einer Person. Der hohe, schmale Anker mittlerer Grösse deckt sie am besten.', 'Nine dashed anchors around one point of the feature map, plus the green ground-truth box of a person. The tall, narrow medium anchor covers it best.') + '">' + s + '</svg>';
    },

    // Image, mask as colours, zoomed mask as numbers
    mask() {
      const C = 5, NX = 44, NY = 30, Z = [21, 15, 8, 7]; // cell size, raster, zoom window (x, y, w, h in cells)
      let m = '';
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
        m += '<rect x="' + i * C + '" y="' + j * C + '" width="' + C + '" height="' + C + '" style="fill:' + CLS[sceneClass(i * C + C / 2, j * C + C / 2)] + '"/>';
      }
      const zr = '<rect x="' + Z[0] * C + '" y="' + Z[1] * C + '" width="' + Z[2] * C + '" height="' + Z[3] * C + '" style="fill:none;stroke:var(--fg);stroke-width:1.5;stroke-dasharray:4 3"/>';
      let z = '';
      const zw = 220 / Z[2], zh = 150 / Z[3];
      for (let j = 0; j < Z[3]; j++) for (let i = 0; i < Z[2]; i++) {
        const k = sceneClass((Z[0] + i) * C + C / 2, (Z[1] + j) * C + C / 2);
        z += '<rect x="' + (i * zw).toFixed(1) + '" y="' + (j * zh).toFixed(1) + '" width="' + zw.toFixed(1) + '" height="' + zh.toFixed(1) + '" style="fill:' + CLS[k] + ';fill-opacity:.35;stroke:var(--line)"/>' +
          '<text class="d-t" x="' + ((i + 0.5) * zw).toFixed(1) + '" y="' + ((j + 0.5) * zh).toFixed(1) + '" style="text-anchor:middle">' + k + '</text>';
      }
      const names = [T('Hintergrund', 'background'), T('Strasse', 'road'), T('Auto', 'car'), 'Person', T('Baum', 'tree')];
      let leg = '';
      names.forEach((n, k) => {
        leg += '<rect x="' + (60 + k * 125) + '" y="186" width="12" height="12" rx="2" style="fill:' + CLS[k] + ';stroke:var(--line)"/><text class="d-t d-ml" x="' + (78 + k * 125) + '" y="192" style="font-size:12px">' + k + ' ' + n + '</text>';
      });
      const title = (x, t) => '<text class="d-tb" x="' + (x + 110) + '" y="12" style="text-anchor:middle">' + t + '</text>';
      return '<svg viewBox="0 0 720 205" style="min-width:560px" role="img" aria-label="' + T('Links das Bild, in der Mitte die Maske mit einer Farbe pro Klasse, rechts ein vergrösserter Ausschnitt der Maske mit der Klassen-ID in jedem Pixel', 'Left the image, in the middle the mask with one colour per class, right a zoomed part of the mask with the class ID in every pixel') + '">' +
        title(0, T('Bild', 'Image')) + title(250, T('Maske (Klasse pro Pixel)', 'Mask (class per pixel)')) + title(500, T('Ausschnitt mit Klassen-IDs', 'Zoom with class IDs')) +
        '<g transform="translate(0,22)">' + scene('plain') + zr + frame + '</g>' +
        '<g transform="translate(250,22)">' + m + zr + frame + '</g>' +
        '<g transform="translate(500,22)">' + z + frame + '</g>' + leg + '</svg>';
    },

    // U-Net: encoder down, decoder up, skip connections across
    unet() {
      const yk = (k) => 40 + 62 * k, ex = (k) => 20 + 72 * k, dx = (k) => 636 - 72 * k;
      const sub = ['H × W · 64', 'H/2 · 128', 'H/4 · 256', 'H/8 · 512'];
      const blk = (x, y, cls, a, b) => '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="64" height="40" rx="5"/><text class="d-tb" x="' + (x + 32) + '" y="' + (y + 16) + '" style="text-anchor:middle;font-size:12px">' + a + '</text><text class="d-tm" x="' + (x + 32) + '" y="' + (y + 31) + '" style="text-anchor:middle;font-size:9.5px">' + b + '</text>';
      let s = '<text class="d-tb" x="150" y="16" style="text-anchor:middle">' + T('Encoder: Was ist im Bild?', 'Encoder: what is in the image?') + '</text>' +
        '<text class="d-tb" x="570" y="16" style="text-anchor:middle">' + T('Decoder: Wo genau?', 'Decoder: where exactly?') + '</text>';
      for (let k = 0; k < 4; k++) {
        s += arrow(ex(k) + 66, yk(k) + 20, dx(k) - 4, yk(k) + 20, 'd-arrb" style="stroke-dasharray:6 4');
        s += blk(ex(k), yk(k), 'd-hl', '2× Conv', sub[k]) + blk(dx(k), yk(k), 'd-ok', '2× Conv', sub[k]);
        if (k < 3) {
          s += arrow(ex(k) + 32, yk(k) + 42, ex(k + 1) + 30, yk(k + 1) - 2) + arrow(dx(k + 1) + 34, yk(k + 1) - 2, dx(k) + 32, yk(k) + 42);
        }
      }
      s += '<text class="d-m" x="360" y="' + (yk(0) + 10) + '">' + T('Skip Connection: Feature Map kopieren und anhängen (concat)', 'skip connection: copy the feature map and concatenate it') + '</text>' +
        '<text class="d-m" x="' + (ex(0) + 40) + '" y="' + (yk(0) + 64) + '" style="text-anchor:end">MaxPool ↓2</text>' +
        '<text class="d-m d-ml" x="' + (dx(0) + 30) + '" y="' + (yk(0) + 64) + '">↑2 Up-Conv</text>' +
        arrow(ex(3) + 32, yk(3) + 42, 340, 286) + arrow(380, 286, dx(3) + 32, yk(3) + 42) +
        blk(328, 288, 'd-warn', T('Engpass', 'Bottleneck'), 'H/16 · 1024') +
        arrow(dx(0) + 66, yk(0) + 20, 722, yk(0) + 20) +
        '<rect class="d-box" x="724" y="' + yk(0) + '" width="100" height="40" rx="5" style="stroke:var(--accent)"/><text class="d-tb" x="774" y="' + (yk(0) + 16) + '" style="text-anchor:middle;font-size:12px">1 × 1 Conv</text><text class="d-tm" x="774" y="' + (yk(0) + 31) + '" style="text-anchor:middle;font-size:10.5px">H × W × C</text>' +
        '<text class="d-m" x="774" y="' + (yk(0) + 56) + '">' + T('Klasse pro Pixel', 'class per pixel') + '</text>' +
        '<text class="d-m" x="774" y="' + (yk(0) + 72) + '">(Softmax)</text>';
      return '<svg viewBox="0 0 840 340" style="min-width:620px" role="img" aria-label="' + T('U-Net: Der Encoder halbiert die Auflösung viermal und verdoppelt die Channels, der Decoder baut die Auflösung wieder auf. Skip Connections verbinden jede Encoder-Stufe mit der Decoder-Stufe gleicher Grösse. Am Ende gibt eine 1 × 1-Convolution C Klassen-Scores pro Pixel aus.', 'U-Net: the encoder halves the resolution four times and doubles the channels, the decoder restores the resolution. Skip connections join each encoder stage with the decoder stage of the same size. At the end a 1 × 1 convolution outputs C class scores per pixel.') + '">' + s + '</svg>';
    },

    // SAM: heavy image encoder once per image, light prompt encoder and mask decoder per prompt, three masks
    sam() {
      let s = '<g transform="translate(10,60) scale(.6)">' + scene('plain') + frame + '</g>' +
        '<circle cx="90" cy="113" r="6" style="fill:var(--warn);stroke:var(--surface);stroke-width:2"/>' +
        '<text class="d-m" x="76" y="164">' + T('Klick als Prompt', 'click as prompt') + '</text>' +
        block(170, 36, 130, 72, 'd-hl', ['Image Encoder', T('ViT, gross', 'ViT, large'), T('einmal pro Bild', 'once per image')]) +
        block(340, 36, 130, 72, 'd-hl', ['Embedding', '64 × 64 × 256', T('wird gespeichert', 'is cached')]) +
        block(170, 150, 130, 72, 'd-box', ['Prompt', T('Punkt, Box, Maske', 'point, box, mask'), '']) +
        block(340, 150, 130, 72, 'd-warn', ['Prompt Encoder', T('klein', 'small'), T('pro Prompt', 'per prompt')]) +
        block(510, 93, 130, 72, 'd-warn', ['Mask Decoder', T('leicht, schnell', 'light, fast'), T('pro Prompt', 'per prompt')]) +
        arrow(144, 90, 166, 72) + arrow(302, 72, 336, 72) + arrow(100, 118, 166, 178) + arrow(302, 186, 336, 186) +
        arrow(472, 72, 508, 116) + arrow(472, 186, 508, 142) +
        arrow(642, 129, 686, 60) + arrow(642, 129, 686, 129) + arrow(642, 129, 686, 198);
      [[T('Maske 1: Oberkörper', 'Mask 1: upper body'), '0.71', 'd-box'], [T('Maske 2: ganze Person', 'Mask 2: whole person'), '0.95', 'd-ok'], [T('Maske 3: beide Personen', 'Mask 3: both people'), '0.62', 'd-box']].forEach((o, i) => {
        const y = 38 + i * 69;
        s += '<rect class="' + o[2] + '" x="690" y="' + y + '" width="182" height="46" rx="6"/><text class="d-t d-ml" x="700" y="' + (y + 15) + '" style="font-size:12px">' + o[0] + '</text><text class="d-tm d-ml" x="700" y="' + (y + 32) + '" style="font-size:12px">Score ' + o[1] + '</text>';
      });
      s += '<text class="d-m" x="440" y="246">' + T('Ein Punkt ist mehrdeutig: SAM gibt drei Masken mit Score zurück, man nimmt die passende.', 'One point is ambiguous: SAM returns three masks with a score, you pick the fitting one.') + '</text>';
      return '<svg viewBox="0 0 880 256" style="min-width:660px" role="img" aria-label="' + T('SAM: Der grosse Image Encoder rechnet einmal pro Bild ein Embedding. Pro Prompt (Punkt, Box) rechnen der kleine Prompt Encoder und der leichte Mask Decoder drei Masken mit Score.', 'SAM: the large image encoder computes one embedding per image. Per prompt (point, box) the small prompt encoder and the light mask decoder compute three masks with a score.') + '">' + s + '</svg>';
    },
  };

  LernApp.demos.det = function () {
    const NS = 'http://www.w3.org/2000/svg';
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // Button group with data-v values: marks the chosen button and calls cb(value)
    function choice(id, cb) {
      const root = $(id);
      if (!root) return;
      root.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        root.querySelectorAll('button').forEach((x) => { const on = x === b; x.classList.toggle('pri', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        cb(b.getAttribute('data-v'));
      }));
    }
    function unpress(id) {
      const root = $(id);
      if (root) root.querySelectorAll('button').forEach((x) => { x.classList.remove('pri'); x.setAttribute('aria-pressed', 'false'); });
    }

    // One draggable box b = [x0, y0, x1, y1] in SVG units (changed in place). The body moves it, the corner handle
    // resizes it; Tab focuses it, arrows move, Shift + arrows resize. o: { W, H, min, color, label, change }
    function dragBox(svg, b, o) {
      const el = (tag, a) => { const e = document.createElementNS(NS, tag); Object.keys(a).forEach((k) => e.setAttribute(k, a[k])); return e; };
      const g = el('g', { tabindex: '0', role: 'button', 'aria-label': o.label + T(': ziehen zum Verschieben, Ecke ziehen für die Grösse; Pfeiltasten verschieben, Shift + Pfeiltasten ändern die Grösse', ': drag to move, drag the corner to resize; arrow keys move, Shift + arrow keys resize') });
      const body = el('rect', { style: 'fill:' + o.color + ';fill-opacity:.12;stroke:' + o.color + ';stroke-width:2.5;cursor:move' });
      const handle = el('rect', { width: 12, height: 12, style: 'fill:' + o.color + ';stroke:var(--bg);stroke-width:1.5;cursor:nwse-resize' });
      g.append(body, handle);
      svg.appendChild(g);
      svg.style.touchAction = 'none';
      function draw() {
        body.setAttribute('x', b[0]); body.setAttribute('y', b[1]);
        body.setAttribute('width', b[2] - b[0]); body.setAttribute('height', b[3] - b[1]);
        handle.setAttribute('x', b[2] - 6); handle.setAttribute('y', b[3] - 6);
        o.change();
      }
      function move(dx, dy) {
        const w = b[2] - b[0], h = b[3] - b[1];
        b[0] = clamp(b[0] + dx, 0, o.W - w); b[1] = clamp(b[1] + dy, 0, o.H - h);
        b[2] = b[0] + w; b[3] = b[1] + h;
      }
      function resize(x, y) { b[2] = clamp(x, b[0] + o.min, o.W); b[3] = clamp(y, b[1] + o.min, o.H); }
      function toSvg(e) {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        return [Math.round(p.x), Math.round(p.y)];
      }
      let drag = null;
      [[body, 'move'], [handle, 'resize']].forEach(([t, mode]) => t.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const [x, y] = toSvg(e);
        drag = { mode, x, y, start: b.slice(), ox: b[2] - x, oy: b[3] - y };
        svg.setPointerCapture(e.pointerId);
        g.focus({ preventScroll: true });
      }));
      svg.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const [x, y] = toSvg(e);
        if (drag.mode === 'move') { for (let k = 0; k < 4; k++) b[k] = drag.start[k]; move(x - drag.x, y - drag.y); }
        else resize(x + drag.ox, y + drag.oy);
        draw();
      });
      const end = () => { drag = null; };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
      g.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (!d) return;
        e.preventDefault();
        if (e.shiftKey) resize(b[2] + d[0] * 4, b[3] + d[1] * 4); else move(d[0] * 4, d[1] * 4);
        draw();
      });
      draw();
    }

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('detFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Bilder und Labels', '1 · Images and labels'), T('Zuerst die Aufgabe festlegen: <b>Object Detection</b> (Bild rein, Liste aus Box, Klasse, Score), <b>Semantic Segmentation</b> (Klasse pro Pixel) oder <b>Instance Segmentation</b> (Maske pro Objekt). Daraus folgen die Labels: Boxen (z. B. YOLO-Format) oder Masken als PNG. Nach Szene oder Video splitten, nicht nach Frames.', 'First fix the task: <b>object detection</b> (image in, list of box, class, score), <b>semantic segmentation</b> (class per pixel) or <b>instance segmentation</b> (mask per object). The labels follow: boxes (e.g. YOLO format) or masks as PNG. Split by scene or video, not by frame.'), [[T('Vier Aufgaben', 'Four tasks'), '#det-aufgaben'], [T('Box-Formate und Labels', 'Box formats and labels'), '#det-labels']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('Detection: <b>Faster R-CNN</b> (zwei Stufen, genau) oder <b>YOLO</b> (eine Stufe, schnell), beide aus Backbone, Neck, Head und Post-Processing. Segmentation: <b>U-Net</b> pro Aufgabe trainiert oder das Foundation Model <b>SAM</b> ohne Training.', 'Detection: <b>Faster R-CNN</b> (two stages, accurate) or <b>YOLO</b> (one stage, fast), both built from backbone, neck, head and post-processing. Segmentation: <b>U-Net</b> trained per task or the foundation model <b>SAM</b> without training.'), [['Faster R-CNN, YOLO', '#det-modelle'], ['U-Net, SAM', '#det-segmodelle']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('Detection: Summe aus Klassen-Loss (BCE) und Box-Loss (IoU-basiert, z. B. CIoU). Segmentation: <b>Cross-Entropy + Dice</b> gegen die Klassen-Imbalance. Optimizer meist Adam oder SGD.', 'Detection: class loss (BCE) plus box loss (IoU-based, e.g. CIoU). Segmentation: <b>cross-entropy + Dice</b> against class imbalance. Optimizer usually Adam or SGD.'), [[T('Übersicht', 'Overview'), '#det-methoden']]],
        '4': [T('4 · Forward Pass', '4 · Forward pass'), T('Detection: Der Head gibt viele Kandidaten-Boxen mit Score aus; bei der Inferenz folgen <b>Score-Threshold</b> und <b>NMS</b>. Segmentation: eine Karte mit Klassen-Scores pro Pixel, <code>argmax</code> ergibt die Maske.', 'Detection: the head outputs many candidate boxes with scores; at inference a <b>score threshold</b> and <b>NMS</b> follow. Segmentation: a map of class scores per pixel, <code>argmax</code> gives the mask.'), [[T('Aufbau eines Detectors', 'Structure of a detector'), '#det-aufbau'], ['IoU und NMS', '#det-iou']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Detection ordnet zuerst jeder Ground-Truth-Box passende Anker oder Ankerpunkte zu (über IoU), dann werden Klasse und Box verglichen. Segmentation vergleicht Pixel für Pixel mit der Maske.', 'Detection first assigns anchors or anchor points to every ground-truth box (via IoU), then class and box are compared. Segmentation compares pixel by pixel with the mask.'), [['Anker', '#det-rcnn'], [T('YOLO-Gitter', 'YOLO grid'), '#det-yolo']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Wie beim <a href="#cnn">CNN</a>: Gradienten für alle Filter in Head, Neck und Backbone.', 'As for the <a href="#cnn">CNN</a>: gradients for all filters in head, neck and backbone.'), [['CNN', '#cnn']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Der Optimizer verschiebt die Gewichte gegen den Gradienten. Mit vortrainiertem Backbone (Transfer Learning) startet das Netz nicht bei null; oft wird das Backbone zuerst eingefroren.', 'The optimizer moves the weights against the gradient. With a pretrained backbone (transfer learning) the network does not start from scratch; often the backbone is frozen first.'), [['Transfer Learning', '#cnn-transfer']]],
        '8': [T('8 · Validation prüfen', '8 · Check validation'), T('Detection: <b>mAP</b> bei IoU-Thresholds (mAP@0.5, mAP@0.5:0.95). Segmentation: <b>IoU</b> und Dice pro Klasse (mIoU). Score-Threshold und τ hier wählen. Immer auch Boxen und Masken ansehen.', 'Detection: <b>mAP</b> at IoU thresholds (mAP@0.5, mAP@0.5:0.95). Segmentation: <b>IoU</b> and Dice per class (mIoU). Choose the score threshold and τ here. Always look at boxes and masks too.'), [['mAP', '#det-map'], ['Dice, IoU', '#det-seg']]],
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

    // Demo: one box in three formats (image 640 × 480 shown at half size)
    (function () {
      const svg = $('bfSvg');
      if (!svg) return;
      svg.innerHTML = '<g transform="scale(' + (320 / 220).toFixed(4) + ',1.6)">' + scene('plain') + '</g>';
      const b = [28, 124, 164, 200], K = 2;
      const r3 = (v) => v.toFixed(3);
      dragBox(svg, b, {
        W: 320, H: 240, min: 10, color: 'var(--warn)', label: T('Box um das Auto', 'Box around the car'),
        change() {
          const x0 = b[0] * K, y0 = b[1] * K, x1 = b[2] * K, y1 = b[3] * K, w = x1 - x0, h = y1 - y0;
          $('bfOut').textContent = T('Bild 640 × 480 Pixel · Klasse 2 = car', 'Image 640 × 480 pixels · class 2 = car') + '\n\n' +
            'xyxy (x0, y0, x1, y1)  ' + [x0, y0, x1, y1].join(', ') + T('   Pixel · Pascal VOC, torchvision', '   pixels · Pascal VOC, torchvision') + '\n' +
            'xywh (x, y, w, h)      ' + [x0, y0, w, h].join(', ') + T('   Pixel · COCO', '   pixels · COCO') + '\n' +
            'YOLO class cx cy w h   2 ' + [r3((x0 + w / 2) / 640), r3((y0 + h / 2) / 480), r3(w / 640), r3(h / 480)].join(' ') + T('   auf 0 bis 1 normiert', '   normalised to 0 to 1');
        },
      });
    })();

    // Demo: YOLO grid, stride and the anchor points inside a box (image 640 × 640 shown at half size)
    (function () {
      const svg = $('ygSvg');
      if (!svg) return;
      const bg = document.createElementNS(NS, 'g');
      svg.innerHTML = '';
      svg.appendChild(bg);
      const b = [180, 96, 226, 212];
      let stride = 16;
      function render() {
        const cell = stride / 2, S = 640 / stride; // cell size in SVG units, cells per side
        // Anchor point i sits at the cell centre (i + 0.5) · cell; it counts when it lies strictly inside the box
        const span = (lo, hi) => { const a = Math.floor(lo / cell - 0.5) + 1, z = Math.ceil(hi / cell - 0.5) - 1; return [Math.max(0, a), Math.min(S - 1, z)]; };
        const [ax, zx] = span(b[0], b[2]), [ay, zy] = span(b[1], b[3]);
        const nx = Math.max(0, zx - ax + 1), ny = Math.max(0, zy - ay + 1), n = nx * ny;
        let s = '<rect width="320" height="320" style="fill:var(--surface)"/>';
        if (n) s += '<rect x="' + ax * cell + '" y="' + ay * cell + '" width="' + nx * cell + '" height="' + ny * cell + '" style="fill:var(--accent-soft)"/>';
        const ci = Math.min(S - 1, Math.floor((b[0] + b[2]) / 2 / cell)), cj = Math.min(S - 1, Math.floor((b[1] + b[3]) / 2 / cell));
        s += '<rect x="' + ci * cell + '" y="' + cj * cell + '" width="' + cell + '" height="' + cell + '" style="fill:var(--warn);fill-opacity:.55"/>';
        let p = '';
        for (let k = 1; k < S; k++) p += 'M' + k * cell + ' 0V320M0 ' + k * cell + 'H320';
        s += '<path d="' + p + '" style="stroke:var(--line);stroke-width:' + (cell < 6 ? 0.5 : 1) + '"/>';
        if (n && n <= 400) {
          const r = Math.min(2.2, cell * 0.2);
          for (let j = ay; j <= zy; j++) for (let i = ax; i <= zx; i++) s += '<circle cx="' + (i + 0.5) * cell + '" cy="' + (j + 0.5) * cell + '" r="' + r + '" style="fill:var(--accent)"/>';
        }
        bg.innerHTML = s;
        $('ygG').textContent = S + ' × ' + S;
        $('ygS').textContent = stride + ' px';
        $('ygB').textContent = (b[2] - b[0]) * 2 + ' × ' + (b[3] - b[1]) * 2 + ' px';
        $('ygC').textContent = T('Zeile ', 'row ') + cj + ', ' + T('Spalte ', 'column ') + ci;
        $('ygN').textContent = n;
        $('ygMsg').textContent = n === 0 ? T('Kein Ankerpunkt liegt in der Box: Auf dieser Ebene kann das Objekt nicht gelernt werden. Eine feinere Ebene (kleinerer Stride) übernimmt.', 'No anchor point lies inside the box: this level cannot learn the object. A finer level (smaller stride) takes over.')
          : n <= 3 ? T('Nur wenige Ankerpunkte in der Box: Für dieses Objekt ist die Ebene grob. Eine feinere Ebene sieht es besser.', 'Only a few anchor points inside the box: this level is coarse for the object. A finer level sees it better.')
            : n > 400 ? T('Sehr viele Ankerpunkte: Für ein so grosses Objekt passt eine gröbere Ebene mit mehr Kontext.', 'Very many anchor points: a coarser level with more context fits such a large object.')
              : T('Passend: Mehrere Ankerpunkte liegen in der Box. YOLOv8 wählt unter ihnen die besten aus (nach Klassen-Score und IoU); die übrigen lernen «kein Objekt».', 'A good fit: several anchor points lie inside the box. YOLOv8 picks the best of them (by class score and IoU); the rest learn “no object”.');
      }
      choice('ygLv', (v) => { stride = +v; render(); });
      dragBox(svg, b, { W: 320, H: 320, min: 4, color: 'var(--ok)', label: T('Objekt-Box', 'Object box'), change: render });
    })();

    // Demo: precision, recall and AP from ten detections sorted by score (6 objects in the ground truth)
    (function () {
      if (!$('apSvg')) return;
      const SCORE = [0.95, 0.91, 0.84, 0.78, 0.71, 0.63, 0.55, 0.42, 0.33, 0.21];
      const TP = [1, 1, 0, 1, 1, 0, 0, 1, 0, 0];
      const GT = 6;
      let c = 0;
      const P = [], R = [];
      TP.forEach((t, i) => { c += t; P.push(c / (i + 1)); R.push(c / GT); });
      // All-point interpolation: precision at recall r = best precision at any recall ≥ r; AP = area under that curve
      const levels = [];
      R.forEach((r, i) => { if (TP[i]) levels.push(r); });
      const pAt = (r) => Math.max.apply(null, P.filter((_, i) => R[i] >= r - 1e-9));
      let AP = 0, prev = 0;
      levels.forEach((r) => { AP += (r - prev) * pAt(r); prev = r; });
      const X = (r) => 44 + 256 * r, Y = (p) => 196 - 176 * p;
      let area = 'M' + X(0) + ' ' + Y(0);
      prev = 0;
      levels.forEach((r) => { area += 'L' + X(prev) + ' ' + Y(pAt(r)) + 'L' + X(r) + ' ' + Y(pAt(r)); prev = r; });
      area += 'L' + X(prev) + ' ' + Y(0) + 'Z';
      const base = '<path d="M44 20V196H300" class="d-ln"/>' +
        [0, 0.5, 1].map((v) => '<text class="lbl" x="' + X(v) + '" y="210" style="text-anchor:middle">' + v + '</text><text class="lbl" x="38" y="' + (Y(v) + 3) + '" style="text-anchor:end">' + v + '</text>').join('') +
        '<text class="lbl" x="172" y="226" style="text-anchor:middle;font-size:11px">Recall</text>' +
        '<text class="lbl" x="12" y="108" style="text-anchor:middle;font-size:11px" transform="rotate(-90 12 108)">Precision</text>' +
        '<path d="' + area + '" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5"/>' +
        '<polyline points="' + R.map((r, i) => X(r) + ',' + Y(P[i])).join(' ') + '" style="fill:none;stroke:var(--muted);stroke-width:1.2;stroke-dasharray:4 3"/>' +
        R.map((r, i) => '<circle cx="' + X(r) + '" cy="' + Y(P[i]) + '" r="2.5" style="fill:' + (TP[i] ? 'var(--ok)' : 'var(--bad)') + '"/>').join('') +
        '<text class="lbl" x="' + X(0.3) + '" y="' + Y(0.35) + '" style="fill:var(--accent);font-size:11px">AP = ' + fmt(AP, 2) + T(' (Fläche)', ' (area)') + '</text>';
      let rows = '<tr><th>#</th><th>Score</th><th>' + T('Treffer?', 'Hit?') + '</th><th>Precision</th><th>Recall</th></tr>';
      SCORE.forEach((s, i) => {
        rows += '<tr id="apRow' + i + '"><td>' + (i + 1) + '</td><td>' + fmt(s, 2) + '</td><td style="color:' + (TP[i] ? 'var(--ok)' : 'var(--bad)') + '">' + (TP[i] ? 'TP' : 'FP') + '</td><td>' + fmt(P[i], 2) + '</td><td>' + fmt(R[i], 2) + '</td></tr>';
      });
      $('apTab').innerHTML = rows;
      let thr = 0.5;
      function draw() {
        const k = SCORE.filter((s) => s >= thr - 1e-9).length;
        const tp = TP.slice(0, k).reduce((a, v) => a + v, 0), fp = k - tp;
        SCORE.forEach((_, i) => { $('apRow' + i).style.opacity = i < k ? '1' : '.4'; });
        $('apSvg').innerHTML = base + (k ? '<circle cx="' + X(R[k - 1]) + '" cy="' + Y(P[k - 1]) + '" r="6" style="fill:none;stroke:var(--warn);stroke-width:2.5"/>' : '');
        $('apTO').textContent = fmt(thr, 2);
        $('apTP').textContent = tp;
        $('apFP').textContent = fp;
        $('apFN').textContent = GT - tp;
        $('apP').textContent = k ? fmt(tp / k, 2) : '–';
        $('apR').textContent = fmt(tp / GT, 2);
        $('apAP').textContent = fmt(AP, 2);
        $('apMsg').textContent = (k <= 2 ? T('Hoher Threshold: wenige, aber sichere Boxen. Precision hoch, Recall tief. ', 'High threshold: few but confident boxes. High precision, low recall. ')
          : k >= 8 ? T('Tiefer Threshold: Fast alles ist gefunden, dafür viele False Positives. Recall hoch, Precision tiefer. ', 'Low threshold: almost everything is found, but with many false positives. High recall, lower precision. ')
            : T('Mittlerer Threshold: ein Kompromiss zwischen Precision und Recall. ', 'Medium threshold: a compromise between precision and recall. ')) +
          T('AP bleibt gleich: Es fasst alle Thresholds in einer Zahl zusammen. Ein Objekt findet der Detector nie, darum erreicht der Recall höchstens 5 / 6.', 'AP stays the same: it sums up all thresholds in one number. The detector never finds one object, so recall reaches at most 5 / 6.');
      }
      $('apT').addEventListener('input', (e) => { thr = +e.target.value; draw(); });
      draw();
    })();

    // Demo: segmentation metrics on a 20 × 14 mask; presets or click pixels
    (function () {
      const svg = $('smSvg');
      if (!svg) return;
      const NX = 20, NY = 14, C = 16, N = NX * NY;
      const ell = (cx, cy, rx, ry) => { const m = []; for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) m.push(((i + 0.5 - cx) / rx) ** 2 + ((j + 0.5 - cy) / ry) ** 2 <= 1); return m; };
      const truth = ell(12.5, 7, 3.4, 2.6);
      const PRE = { good: () => ell(12.8, 7.3, 3.1, 2.4), big: () => ell(12.5, 7, 5, 3.8), shift: () => ell(9.6, 6, 3.4, 2.6), empty: () => truth.map(() => false) };
      let pred = PRE.good();
      const nObj = truth.filter(Boolean).length;
      function draw() {
        let tp = 0, fp = 0, fn = 0, tn = 0, s = '';
        for (let k = 0; k < N; k++) {
          const t = truth[k], p = pred[k];
          const col = t && p ? 'var(--ok)' : p ? 'var(--warn)' : t ? 'var(--bad)' : 'var(--surface)';
          if (t && p) tp++; else if (p) fp++; else if (t) fn++; else tn++;
          s += '<rect data-k="' + k + '" x="' + (k % NX) * C + '" y="' + Math.floor(k / NX) * C + '" width="' + C + '" height="' + C + '" style="fill:' + col + ';fill-opacity:' + (t || p ? '.7' : '1') + ';stroke:var(--line);cursor:pointer"/>';
        }
        svg.innerHTML = s;
        const acc = (tp + tn) / N, iouO = tp + fp + fn ? tp / (tp + fp + fn) : 1, dice = 2 * tp + fp + fn ? (2 * tp) / (2 * tp + fp + fn) : 1, iouB = tn / (tn + fp + fn);
        $('smAcc').textContent = fmt(acc * 100, 1) + ' %';
        $('smIoU').textContent = fmt(iouO, 2);
        $('smDice').textContent = fmt(dice, 2);
        $('smIoB').textContent = fmt(iouB, 2);
        $('smM').textContent = fmt((iouO + iouB) / 2, 2);
        $('smMsg').textContent = !tp && !fp ? T('Alles Hintergrund: Die Pixel-Accuracy sieht mit ' + fmt(acc * 100, 1) + ' % gut aus, aber IoU und Dice für das Objekt sind 0. Das ist die Falle der Klassen-Imbalance.', 'All background: pixel accuracy looks good at ' + fmt(acc * 100, 1) + ' %, but IoU and Dice for the object are 0. That is the class-imbalance trap.')
          : fp > tp ? T('Mehr False Positives (orange) als richtige Pixel: Die Maske ist zu gross oder verschoben. IoU und Dice fallen stark, die Pixel-Accuracy kaum.', 'More false positives (orange) than correct pixels: the mask is too large or shifted. IoU and Dice drop sharply, pixel accuracy hardly.')
            : T('Das Objekt hat nur ' + nObj + ' von ' + N + ' Pixeln. Darum ändert sich die Pixel-Accuracy kaum, IoU und Dice reagieren stark: Sie messen, wie gut das Objekt getroffen ist.', 'The object has only ' + nObj + ' of ' + N + ' pixels. So pixel accuracy hardly changes, while IoU and Dice react strongly: they measure how well the object is hit.');
      }
      svg.addEventListener('click', (e) => {
        const k = e.target.getAttribute && e.target.getAttribute('data-k');
        if (k === null || k === undefined) return;
        pred[+k] = !pred[+k];
        unpress('smPre');
        draw();
      });
      choice('smPre', (v) => { pred = PRE[v](); draw(); });
      draw();
    })();

    // Demo: IoU of two boxes. Both boxes are dragged with the mouse (or finger); the corner handle resizes.
    // Keyboard: Tab to a box, arrows move it, Shift + arrows resize it.
    (function () {
      const svg = $('ioSvg');
      if (!svg) return;
      const VW = 400, VH = 300, MIN = 20;
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

    // Demo: non-maximum suppression with a threshold slider
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
