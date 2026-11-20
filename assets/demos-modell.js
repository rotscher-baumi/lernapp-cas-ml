/* Demos of the «Modelle in der Praxis» chapter. modules/modell.js calls LernApp.demos.modell() once the chapter is in the page. */
(function () {
  const { $, fmt } = LernApp;

  // ---- Library (no DOM) ----
  // Twelve flats: living area in m² and monthly rent in CHF (rent = 600 + 17 · area + noise, fixed seed).
  function flats() {
    const rnd = LernApp.mulberry32(11), X = [35, 42, 50, 55, 60, 68, 75, 80, 90, 100, 110, 120];
    return X.map((x) => [x, Math.round(600 + 17 * x + 90 * LernApp.gauss(rnd))]);
  }
  // Linear regression on standardised x with batch gradient descent (MSE), started at w = b = 0.
  function fitLinear(D, epochs, lr) {
    const n = D.length, mu = D.reduce((s, d) => s + d[0], 0) / n;
    const sd = Math.sqrt(D.reduce((s, d) => s + (d[0] - mu) * (d[0] - mu), 0) / n);
    let w = 0, b = 0;
    for (let e = 0; e < epochs; e++) {
      let gw = 0, gb = 0;
      D.forEach((d) => { const xs = (d[0] - mu) / sd, r = w * xs + b - d[1]; gw += 2 * r * xs / n; gb += 2 * r / n; });
      w -= lr * gw; b -= lr * gb;
    }
    return { w, b, mu, sd };
  }
  // Two Gaussian classes at month m (0..12): the class centres rotate (concept drift) and move up (data drift).
  function driftData(month, n, seed) {
    const rnd = LernApp.mulberry32(seed), th = month / 12 * Math.PI / 2, sh = month / 12 * 1.2;
    const c = [Math.cos(th), Math.sin(th)], out = [];
    for (let i = 0; i < n; i++) {
      const y = i % 2, s = y ? 1 : -1;
      out.push([s * c[0] * 1.1 + 0.75 * LernApp.gauss(rnd), s * c[1] * 1.1 + sh + 0.75 * LernApp.gauss(rnd), y]);
    }
    return out;
  }
  // Logistic regression p = σ(w0 + w1·x1 + w2·x2) with gradient descent on the log loss.
  function fitLogistic(D, iters) {
    let w = [0, 0, 0];
    for (let k = 0; k < iters; k++) {
      const g = [0, 0, 0];
      D.forEach((d) => { const p = 1 / (1 + Math.exp(-(w[0] + w[1] * d[0] + w[2] * d[1]))), r = p - d[2]; g[0] += r; g[1] += r * d[0]; g[2] += r * d[1]; });
      w = w.map((v, i) => v - 0.5 * g[i] / D.length);
    }
    return w;
  }
  const accuracy = (w, D) => D.filter((d) => ((w[0] + w[1] * d[0] + w[2] * d[1]) > 0 ? 1 : 0) === d[2]).length / D.length;
  LernApp.modellLib = { flats, fitLinear, driftData, fitLogistic, accuracy };

  LernApp.demos.modell = function () {
    const T = LernApp.t;

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('moFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Problem und Baseline', '1 · Problem and baseline'), T('Was soll vorhergesagt werden, und welcher Fehler kostet wie viel? Daraus folgt die <b>Metrik</b>. Dann die <b>Baseline</b>: häufigste Klasse, Mittelwert oder eine einfache Regel. Jedes Modell muss sie deutlich schlagen.', 'What should be predicted, and what does each error cost? That gives the <b>metric</b>. Then the <b>baseline</b>: most frequent class, mean or a simple rule. Every model must beat it clearly.'), [[T('Checkliste', 'Checklist'), '#mo-best']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('Drei Wege: <b>von null</b> trainieren (Tabellen fast immer), ein <b>vortrainiertes</b> Modell unverändert nehmen, oder es mit <b>Transfer Learning</b> und <b>Fine-Tuning</b> anpassen (Bilder, Text, Audio).', 'Three ways: train <b>from scratch</b> (almost always for tables), take a <b>pretrained</b> model as it is, or adapt it with <b>transfer learning</b> and <b>fine-tuning</b> (images, text, audio).'), [[T('Woher kommt ein Modell?', 'Where does a model come from?'), '#mo-quelle']]],
        '3': [T('3 · Daten und Pipeline', '3 · Data and pipeline'), T('Zuerst splitten, dann Vorverarbeitung und Modell in <b>eine Pipeline</b> packen. So wird der Scaler nur auf den Trainingsdaten gelernt, und beim Speichern ist alles in einer Datei.', 'Split first, then put preprocessing and model into <b>one pipeline</b>. That way the scaler is learned on the training data only, and saving puts everything into one file.'), [[T('Was ist ein Modell?', 'What is a model?'), '#mo-was']]],
        '4': [T('4 · Trainieren', '4 · Train'), T('<code>fit</code> sucht die <b>Parameter</b>: Gewichte, Bias, Splits. Die <b>Hyperparameter</b> legst du vorher fest. Seed fixieren, damit der Lauf wiederholbar ist.', '<code>fit</code> searches for the <b>parameters</b>: weights, bias, splits. You set the <b>hyperparameters</b> beforehand. Fix the seed so the run can be repeated.'), [[T('Architektur, Parameter, Hyperparameter', 'Architecture, parameters, hyperparameters'), '#mo-was']]],
        '5': [T('5 · Bewerten', '5 · Evaluate'), T('Auf der Validation messen, immer neben der Baseline und mit der Zahl der Beispiele. Fehler ansehen: Welche Fälle gehen schief?', 'Measure on validation, always next to the baseline and with the number of examples. Look at errors: which cases go wrong?'), [[T('Checkliste', 'Checklist'), '#mo-best']]],
        '6': [T('6 · Speichern und versionieren', '6 · Save and version'), T('Die ganze Pipeline speichern (<code>joblib</code>, <code>.keras</code>, <code>state_dict</code>), dazu Metadaten: Version, Datum, Library-Versionen, Features, Seed, Metriken. Laden einmal testen.', 'Save the whole pipeline (<code>joblib</code>, <code>.keras</code>, <code>state_dict</code>) plus metadata: version, date, library versions, features, seed, metrics. Test loading once.'), [[T('Speichern und laden', 'Save and load'), '#mo-speichern']]],
        '7': [T('7 · Einsetzen und überwachen', '7 · Deploy and monitor'), T('Im Einsatz macht das Modell nur noch Inferenz (<code>predict</code>). Eingaben prüfen und ihre Verteilung mit den Trainingsdaten vergleichen. Wird die Metrik schlechter: <b>Drift</b>, zurück zu Schritt 4.', 'In use the model only does inference (<code>predict</code>). Check the inputs and compare their distribution with the training data. If the metric gets worse: <b>drift</b>, back to step 4.'), [[T('Neu trainieren', 'Retrain'), '#mo-neu']]],
        '8': [T('8 · Neu gegen alt vergleichen', '8 · Compare new with old'), T('Die neue Version muss auf <b>denselben Testdaten mit derselben Metrik</b> besser sein: auf einem festen Testset (nichts vergessen) und auf aktuellen Daten (Drift aufgefangen). Hat sich die Aufgabe geändert, zurück zur Modellwahl.', 'The new version must be better on <b>the same test data with the same metric</b>: on a fixed test set (nothing forgotten) and on recent data (drift handled). If the task itself has changed, go back to choosing the model.'), [[T('Neu trainieren', 'Retrain'), '#mo-neu']]],
        '9': [T('9 · Alte Version ablösen', '9 · Retire the old version'), T('Erst wenn die neue Version nachweislich besser ist, wird sie eingesetzt. Die alte bleibt archiviert (Model Registry), damit ein <b>Rollback</b> möglich ist.', 'Only when the new version is shown to be better is it deployed. The old one stays archived (model registry) so a <b>rollback</b> is possible.'), [[T('Begriffe', 'Terms'), '#mo-best']]],
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

    // Button group helper: one pressed button, set(value) on click
    function group(id, set, draw) {
      const g = $(id);
      g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        g.querySelectorAll('button').forEach((x) => { x.setAttribute('aria-pressed', 'false'); x.classList.remove('pri'); });
        b.setAttribute('aria-pressed', 'true'); b.classList.add('pri');
        set(b.getAttribute('data-v')); draw();
      }));
    }
    const chf = (v) => 'CHF ' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, T('’', ','));

    // Demo 1: a model is a file of numbers
    (function () {
      if (!$('moFileSvg')) return;
      const D = flats();
      let ep = 60, q = 85, scl = true;
      const X0 = 20, X1 = 140, Y0 = 800, Y1 = 3000, W = 360, H = 240, L = 46, B = 30;
      const sx = (x) => L + (x - X0) / (X1 - X0) * (W - L - 10), sy = (y) => H - B - (y - Y0) / (Y1 - Y0) * (H - B - 12);
      function draw() {
        const m = fitLinear(D, ep, 0.1);
        const f = (x) => m.w * (x - m.mu) / m.sd + m.b;
        const mae = D.reduce((s, d) => s + Math.abs(f(d[0]) - d[1]), 0) / D.length;
        let s = '<line class="ax" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - 6) + '" y2="' + (H - B) + '"/><line class="ax" x1="' + L + '" y1="10" x2="' + L + '" y2="' + (H - B) + '"/>';
        [40, 60, 80, 100, 120].forEach((x) => { s += '<text class="lbl" x="' + sx(x) + '" y="' + (H - B + 14) + '" text-anchor="middle">' + x + '</text>'; });
        [1000, 1500, 2000, 2500, 3000].forEach((y) => { s += '<text class="lbl" x="' + (L - 5) + '" y="' + (sy(y) + 3) + '" text-anchor="end">' + y + '</text>'; });
        s += '<text class="lbl" x="' + (W - 8) + '" y="' + (H - B - 6) + '" text-anchor="end">m²</text><text class="lbl" x="' + (L + 4) + '" y="18">CHF</text>';
        const clampY = (y) => Math.max(Y0, Math.min(Y1, y));
        s += '<line class="ln" x1="' + sx(X0) + '" y1="' + sy(clampY(f(X0))) + '" x2="' + sx(X1) + '" y2="' + sy(clampY(f(X1))) + '"/>';
        D.forEach((d) => { s += '<circle class="pt" cx="' + sx(d[0]) + '" cy="' + sy(d[1]) + '" r="4"/>'; });
        // Prediction computed only from the «file»: with or without the saved scaler
        const pred = scl ? m.w * (q - m.mu) / m.sd + m.b : m.w * q + m.b;
        if (scl) s += '<circle cx="' + sx(q) + '" cy="' + sy(clampY(pred)) + '" r="6" style="fill:var(--warn);stroke:var(--surface);stroke-width:2"/>';
        $('moFileSvg').innerHTML = s;
        const file = { [T('architektur', 'architecture')]: scl ? 'y = w · (x − x_mean) / x_std + b' : 'y = w · x + b' };
        if (scl) file[T('vorverarbeitung', 'preprocessing')] = { scaler: 'StandardScaler', x_mean: +m.mu.toFixed(2), x_std: +m.sd.toFixed(2) };
        file.parameter = { w: +m.w.toFixed(2), b: +m.b.toFixed(2) };
        file.hyperparameter = { learning_rate: 0.1, epochs: ep };
        file[T('metadaten', 'metadata')] = { n_train: D.length, MAE: +mae.toFixed(0), version: 'v1' };
        $('moJson').textContent = JSON.stringify(file, null, 2);
        $('moEpO').textContent = ep; $('moQO').textContent = q + ' m²';
        $('moMae').textContent = chf(mae);
        $('moPred').textContent = chf(pred);
        $('moFileMsg').textContent = !scl
          ? T('Ohne gespeicherten Scaler rechnet das Modell mit ' + q + ' statt mit dem skalierten Wert ' + fmt((q - m.mu) / m.sd, 2) + ': Die Vorhersage ist Unsinn, und nichts meldet einen Fehler.', 'Without the saved scaler the model computes with ' + q + ' instead of the scaled value ' + fmt((q - m.mu) / m.sd, 2) + ': the prediction is nonsense, and nothing reports an error.')
          : ep < 15 ? T('Kaum trainiert: Die Parameter sind noch weit weg vom Optimum, der MAE ist gross.', 'Barely trained: the parameters are still far from the optimum, the MAE is large.')
            : T('Die Datei enthält alles für die Vorhersage: Architektur, Vorverarbeitung und die zwei gelernten Zahlen w und b. Die Hyperparameter stehen nur zur Dokumentation darin.', 'The file holds everything needed to predict: architecture, preprocessing and the two learned numbers w and b. The hyperparameters are in it for documentation only.');
      }
      $('moEp').addEventListener('input', (e) => { ep = +e.target.value; draw(); });
      $('moQ').addEventListener('input', (e) => { q = +e.target.value; draw(); });
      // Drag: the orange prediction point follows the pointer along the floor area
      const ix = LernApp.invert(sx);
      LernApp.drag('moFileSvg', { axis: 'x', move: (k, x) => LernApp.setRange('moQ', ix(x)),
        hint: ['Ziehe im Plot nach links oder rechts: Die Wohnfläche der Vorhersage (oranger Punkt) folgt.', 'Drag left or right in the plot: the floor area of the prediction (orange point) follows.'] });
      group('moScl', (v) => { scl = v === '1'; }, draw);
      draw();
    })();

    // Demo 2: which way to a model fits?
    (function () {
      if (!$('moPRec')) return;
      let type = 'tab', n = 'few', sim = 'same';
      function rec() {
        if (type === 'tab') {
          return [T('Von null trainieren', 'Train from scratch'), n === 'many'
            ? T('Bei Tabellen gibt es kaum vortrainierte Modelle, weil jede Tabelle andere Spalten hat. Mit Millionen Zeilen: Baseline, dann Gradient Boosting (LightGBM, XGBoost) oder ein Neural Network.', 'For tables there are hardly any pretrained models, because every table has different columns. With millions of rows: baseline, then gradient boosting (LightGBM, XGBoost) or a neural network.')
            : T('Bei Tabellen gibt es kaum vortrainierte Modelle, weil jede Tabelle andere Spalten hat. Baseline, dann logistische Regression oder Random Forest, mit Cross-Validation.', 'For tables there are hardly any pretrained models, because every table has different columns. Baseline, then logistic regression or random forest, with cross-validation.')];
        }
        const what = type === 'img' ? T('ein CNN wie ResNet oder EfficientNet', 'a CNN such as ResNet or EfficientNet') : T('ein Transformer wie BERT', 'a transformer such as BERT');
        if (sim === 'same') return [T('Fertig übernehmen', 'Use as it is'), T('Die Aufgabe ist die des vortrainierten Modells: ' + what + ' direkt einsetzen (zero-shot) und auf deinen Daten nur messen. Training ist nicht nötig.', 'The task is the one of the pretrained model: use ' + what + ' directly (zero-shot) and only measure it on your data. No training needed.')];
        if (n === 'few') return [T('Transfer Learning', 'Transfer learning'), T('Mit wenig Daten ' + what + ' nehmen, die Basis einfrieren und nur einen neuen Output Layer trainieren. Data Augmentation hilft zusätzlich.' + (sim === 'far' ? ' Auch bei einer ganz anderen Aufgabe ist das meist besser als von null, weil die frühen Schichten allgemeine Muster kennen.' : ''), 'With little data take ' + what + ', freeze the base and train only a new output layer. Data augmentation helps as well.' + (sim === 'far' ? ' Even for a very different task this is usually better than from scratch, because the early layers know general patterns.' : ''))];
        if (n === 'mid') return [T('Fine-Tuning', 'Fine-tuning'), T('Zuerst den neuen Kopf mit eingefrorener Basis trainieren, dann die oberen Schichten freigeben und mit sehr kleiner Learning Rate (etwa 1e-5) weitertrainieren.', 'First train the new head with a frozen base, then unfreeze the upper layers and keep training with a very small learning rate (about 1e-5).')];
        return sim === 'far'
          ? [T('Fine-Tuning des ganzen Netzes oder von null', 'Fine-tune the whole network or train from scratch'), T('Mit Millionen eigener Beispiele einer ganz anderen Art (z. B. Röntgen- oder Satellitenbilder) lohnt sich das ganze Netz oder ein Training von null. Vortrainierte Weights als Start sind trotzdem selten schlechter.', 'With millions of examples of a very different kind (e.g. X-ray or satellite images) the whole network or training from scratch pays off. Pretrained weights as a start are still rarely worse.')]
          : [T('Fine-Tuning des ganzen Netzes', 'Fine-tune the whole network'), T('Mit sehr vielen Daten alle Schichten mit kleiner Learning Rate weitertrainieren. Die vortrainierten Weights sind ein guter Startpunkt und sparen viel Rechenzeit.', 'With a lot of data, keep training all layers with a small learning rate. The pretrained weights are a good starting point and save a lot of compute.')];
      }
      function draw() {
        const r = rec();
        $('moPRec').innerHTML = '<b>' + r[0] + '</b><p>' + r[1] + '</p>';
        // Similarity only matters for images and text
        $('moPSim').querySelectorAll('button').forEach((b) => { b.disabled = type === 'tab'; });
      }
      group('moPType', (v) => { type = v; }, draw);
      group('moPN', (v) => { n = v; }, draw);
      group('moPSim', (v) => { sim = v; }, draw);
      draw();
    })();

    // Demo 3: drift and retraining
    (function () {
      if (!$('moDrSvg')) return;
      const past = driftData(0, 160, 1), oldW = fitLogistic(past, 300);
      let month = 9, mode = 'old';
      const W = 400, H = 300, xr = [-3.2, 3.2], yr = [-2.6, 3.4];
      const sx = (x) => (x - xr[0]) / (xr[1] - xr[0]) * W, sy = (y) => H - (y - yr[0]) / (yr[1] - yr[0]) * H;
      // Decision line w0 + w1·x + w2·y = 0, clipped to the plot
      function line(w, style) {
        const pts = [];
        if (Math.abs(w[2]) > 1e-6) [xr[0], xr[1]].forEach((x) => pts.push([x, -(w[0] + w[1] * x) / w[2]]));
        if (Math.abs(w[1]) > 1e-6) [yr[0], yr[1]].forEach((y) => pts.push([-(w[0] + w[2] * y) / w[1], y]));
        const inside = pts.filter((p) => p[0] >= xr[0] - 1e-9 && p[0] <= xr[1] + 1e-9 && p[1] >= yr[0] - 1e-9 && p[1] <= yr[1] + 1e-9);
        if (inside.length < 2) return '';
        return '<line x1="' + sx(inside[0][0]) + '" y1="' + sy(inside[0][1]) + '" x2="' + sx(inside[1][0]) + '" y2="' + sy(inside[1][1]) + '" style="' + style + '"/>';
      }
      function draw() {
        const now = driftData(month, 160, 100 + month), test = driftData(month, 400, 500 + month), pastTest = driftData(0, 400, 900);
        const w = mode === 'old' ? oldW : fitLogistic(mode === 'new' ? now : past.concat(now), 300);
        let s = '';
        now.forEach((d) => { s += '<circle cx="' + sx(d[0]).toFixed(1) + '" cy="' + sy(d[1]).toFixed(1) + '" r="3.2" style="fill:' + (d[2] ? 'var(--accent)' : 'var(--warn)') + ';fill-opacity:.75"/>'; });
        s += line(oldW, 'stroke:var(--muted);stroke-width:2;stroke-dasharray:6 4');
        if (mode !== 'old') s += line(w, 'stroke:var(--ok);stroke-width:3');
        s += '<text class="lbl" x="8" y="16">' + T('gestrichelt: altes Modell (Monat 0)', 'dashed: old model (month 0)') + '</text>' + (mode !== 'old' ? '<text class="lbl" x="8" y="30" style="fill:var(--ok)">' + T('grün: neu trainiert', 'green: retrained') + '</text>' : '');
        $('moDrSvg').innerHTML = s;
        const aOld = accuracy(oldW, test), aNew = accuracy(w, test), aPast = accuracy(w, pastTest);
        $('moDrO').textContent = month;
        $('moAccOld').textContent = fmt(aOld, 2); $('moAccNew').textContent = fmt(aNew, 2); $('moAccPast').textContent = fmt(aPast, 2);
        $('moDrMsg').textContent = mode === 'old'
          ? (month === 0 ? T('Monat 0: Das Modell passt zu den Daten, mit denen es trainiert wurde.', 'Month 0: the model fits the data it was trained on.')
            : T('Nach ' + month + ' Monaten liegt die alte Grenze schief zu den Daten. Die Accuracy auf aktuellen Daten ist gesunken, ohne dass sich am Modell etwas geändert hat.', 'After ' + month + ' months the old boundary no longer fits the data. Accuracy on current data has dropped without anything changing in the model.'))
          : mode === 'new' ? T('Nur auf aktuellen Daten trainiert: gut für heute, aber auf den Daten von Monat 0 schlechter (vergessen). Das ist gewollt, wenn die alten Daten nicht mehr gelten.', 'Trained on current data only: good for today, but worse on the data of month 0 (forgotten). That is intended if the old data no longer apply.')
            : T('Alte und aktuelle Daten gemischt: ein Kompromiss. Bei starkem Concept Drift zieht der alte Teil das Modell in die falsche Richtung.', 'Old and current data mixed: a compromise. With strong concept drift the old part pulls the model in the wrong direction.');
      }
      $('moDr').addEventListener('input', (e) => { month = +e.target.value; draw(); });
      group('moDrMode', (v) => { mode = v; }, draw);
      draw();
    })();
  };
})();
