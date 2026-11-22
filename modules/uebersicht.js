/*
 * Overview and practice chapter («Übersicht & Praxis»), the last chapter: how to approach a new
 * problem (figure, Do & Don't, checklist), a model in practice (what a model is, where it comes from,
 * saving, drift; demos in assets/demos-modell.js) and the decision tree «Welches Modell wann?».
 * The tree links to the method cards in kompakt.js (#v-<method>); keep the names in both in sync.
 * Translated in place: every text is t('deutsch', 'english') via LernApp.t.
 */
(function () {
  const t = LernApp.t;
  /* «Neues ML-Problem: so gehst du vor»: clickable workflow figure (same pattern as the chapter figures),
     do/don't cards and a checklist whose ticks are kept with LernApp.store under 'cas-ml-checklist'. */
  const SVGT = 'font-family:var(--f-body)';
  function vbox(k, x, y, w, title, sub, kind) {
    const f = kind === 'q' ? 'fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5'
      : kind === 'rare' ? 'fill:var(--bg);stroke:var(--line);stroke-width:1.5;stroke-dasharray:6 4'
        : 'fill:var(--surface);stroke:var(--line);stroke-width:1.5';
    const h = sub ? 52 : 44;
    const cx = x + w / 2;
    const tc = kind === 'q' ? 'var(--accent)' : 'var(--fg)';
    return '<g class="ab-step" data-s="' + k + '" tabindex="0" role="button" aria-expanded="false" aria-label="' + title + t(': Erklärung aufklappen', ': open explanation') + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" style="' + f + '"/>' +
      '<text x="' + cx + '" y="' + (y + (sub ? 22 : 27)) + '" text-anchor="middle" style="fill:' + tc + ';font-size:14px;font-weight:600;' + SVGT + '">' + title + '</text>' +
      (sub ? '<text x="' + cx + '" y="' + (y + 40) + '" text-anchor="middle" style="fill:var(--muted);font-size:12px;' + SVGT + '">' + sub + '</text>' : '') +
      '</g>';
  }
  function vline(d, kind) {
    const c = kind === 'ok' ? 'var(--ok)' : kind === 'warn' ? 'var(--warn)' : 'var(--line)';
    const m = kind === 'ok' ? 'ue-ao' : kind === 'warn' ? 'ue-aw' : 'ue-a';
    const dash = kind ? ';stroke-dasharray:6 4' : '';
    return '<path d="' + d + '" marker-end="url(#' + m + ')" style="stroke:' + c + ';stroke-width:1.5;fill:none' + dash + '"/>';
  }
  function vlabel(x, y, text, anchor, color) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '" style="fill:' + (color || 'var(--muted)') + ';font-size:11.5px;font-family:var(--f-mono)">' + text + '</text>';
  }
  function marker(id, color) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:' + color + '"/></marker>';
  }

  const vorgehenFig = `
  <figure class="fig ab-fig" id="ueFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 790 930" role="img" aria-label="${t('Vorgehen bei einem neuen ML-Problem: Problem und Metrik festlegen, Baseline bauen, dann je nach Daten Gradient Boosting mit Feature Engineering (Tabellen) oder ein vortrainiertes Modell ohne Training testen (Bild, Text, Audio); reicht es nicht, Feature Extraction oder Fine-Tuning, im Sonderfall eine eigene Architektur. Danach Pipeline und Training, einmal testen, Threshold wählen, einsetzen und beobachten; bei Domain Shift nachtrainieren.', 'How to approach a new ML problem: define the problem and metric, build a baseline, then depending on the data gradient boosting with feature engineering (tables) or test a pretrained model without training (image, text, audio); if that is not enough, feature extraction or fine-tuning, in special cases your own architecture. Then pipeline and training, test once, choose the threshold, deploy and monitor; retrain on domain shift.')}">
      <defs>${marker('ue-a', 'var(--line)')}${marker('ue-ao', 'var(--ok)')}${marker('ue-aw', 'var(--warn)')}</defs>
      ${vbox('1', 240, 20, 300, t('1 · Problem und Metrik', '1 · Problem and metric'), t('Input, Output, was heisst «gut genug»?', 'input, output, what is “good enough”?'))}
      ${vline('M390,72 V104')}
      ${vbox('2', 240, 104, 300, t('2 · Baseline bauen', '2 · Build a baseline'), t('einfachstes Modell oder eine Regel', 'simplest model or a rule'))}
      ${vline('M390,156 V188')}
      ${vbox('d', 290, 188, 200, t('Welche Daten?', 'Which data?'), '', 'q')}
      ${vline('M290,210 H170 V270')}
      ${vlabel(160, 248, t('Tabellen', 'Tables'), 'end')}
      ${vline('M490,210 H600 V270')}
      ${vlabel(610, 248, t('Bild · Text · Audio', 'Image · text · audio'))}

      ${vbox('gb', 40, 270, 260, t('3a · Gradient Boosting', '3a · Gradient Boosting'), 'XGBoost, LightGBM, CatBoost')}
      ${vline('M170,322 V354')}
      ${vbox('fe', 40, 354, 260, 'Feature Engineering', t('Merkmale bauen und auswählen', 'build and select features'))}
      ${vline('M170,406 V636 H240')}

      ${vbox('pre', 460, 270, 280, t('3b · Vortrainiert, ohne Training', '3b · Pretrained, no training'), t('zero-shot testen oder LLM mit Prompt', 'test zero-shot or an LLM with a prompt'))}
      ${vline('M600,322 V354')}
      ${vbox('r', 520, 354, 160, t('Reicht das?', 'Good enough?'), '', 'q')}
      ${vline('M680,376 H774 V720 H540', 'ok')}
      ${vlabel(690, 368, t('ja', 'yes'), 'start', 'var(--ok)')}
      <path d="M600,398 V414 M517,414 H682" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      ${vline('M517,414 V430')}
      ${vline('M682,414 V430')}
      ${vlabel(608, 410, t('nein', 'no'), 'start', 'var(--bad)')}
      ${vbox('fx', 440, 430, 155, 'Feature Extraction', t('nur neuen Head', 'new head only'))}
      ${vbox('ft', 605, 430, 155, 'Fine-Tuning', t('obere Layers auftauen', 'unfreeze top layers'))}
      <path d="M517,482 V496 H682 V482" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      ${vline('M517,496 H420 V610')}
      ${vline('M600,496 V514', 'warn')}
      ${vlabel(612, 509, t('nur falls nötig', 'only if needed'), 'start', 'var(--warn)')}
      ${vbox('own', 470, 514, 260, t('Sonderfall: eigene Architektur', 'Special case: own architecture'), t('exotische Daten, Edge, Forschung', 'exotic data, edge, research'), 'rare')}
      ${vline('M600,566 V636 H540')}

      ${vbox('pipe', 240, 610, 300, t('4 · Pipeline und Training', '4 · Pipeline and training'), t('Split, Imputer und Scaler nur auf Train', 'split, imputer and scaler on train only'))}
      ${vline('M390,662 V694')}
      ${vbox('test', 240, 694, 300, t('5 · Einmal testen', '5 · Test once'), t('Testset, Vergleich mit der Baseline', 'test set, compare with the baseline'))}
      ${vline('M390,746 V778')}
      ${vbox('thr', 240, 778, 300, t('6 · Threshold wählen', '6 · Choose the threshold'), t('Precision oder Recall wichtiger?', 'precision or recall more important?'))}
      ${vline('M390,830 V862')}
      ${vbox('ein', 240, 862, 300, t('7 · Einsetzen und beobachten', '7 · Deploy and monitor'), t('speichern, überwachen, Drift', 'save, monitor, drift'))}
      ${vline('M240,888 H200 V650 H240', 'warn')}
      ${vlabel(192, 766, 'Domain Shift:', 'end', 'var(--warn)')}
      ${vlabel(192, 782, t('nachtrainieren', 'retrain'), 'end', 'var(--warn)')}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="${t('Schliessen', 'Close')}">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>${t('Vom Einfachen zum Aufwändigen: Jede Stufe nur nehmen, wenn die vorige auf der Validierung nicht reicht. Grün gestrichelt: Das vortrainierte Modell reicht schon, es muss nur noch auf den eigenen Testdaten bestätigt werden. Orange gestrichelt: nur im Ausnahmefall.', 'From simple to elaborate: take each stage only if the previous one is not enough on the validation set. Green dashed: the pretrained model is already good enough and only needs to be confirmed on your own test data. Orange dashed: exceptions only.')}</figcaption>
  </figure>`;

  /* Explanations of the figure steps: [title, text, [[link text, href], …]] */
  const VS = {
    '1': [t('1 · Problem und Metrik festlegen', '1 · Define the problem and metric'), t('Was ist der Input, was soll herauskommen? Eine Zahl (Regression), eine Klasse (Klassifikation), Gruppen ohne Labels (Unsupervised), Boxen oder Masken (Object Detection, Segmentation)? Lege vor dem ersten Modell fest, woran du Erfolg misst und was «gut genug» ist, zum Beispiel Recall ≥ 0.9 bei höchstens 10 % falschem Alarm.', 'What is the input, what should come out? A number (regression), a class (classification), groups without labels (unsupervised), boxes or masks (object detection, segmentation)? Before the first model, decide how you measure success and what is “good enough”, for example recall ≥ 0.9 with at most 10 % false alarms.'), [[t('Welches Modell wann?', 'Which model when?'), '#ue-wahl'], [t('Metriken', 'Metrics'), '#klass-metriken']]],
    '2': [t('2 · Baseline bauen', '2 · Build a baseline'), t('Das einfachste mögliche Modell: Mittelwert oder häufigste Klasse, lineare oder logistische Regression, bei Super-Resolution bicubic. Ohne Baseline weisst du nicht, ob das grosse Modell überhaupt etwas bringt. Jedes spätere Ergebnis steht neben der Baseline.', 'The simplest possible model: mean or most frequent class, linear or logistic regression, bicubic for super-resolution. Without a baseline you do not know whether the big model helps at all. Every later result is shown next to the baseline.'), [[t('Lineare Regression', 'Linear regression'), '#ml-linreg'], [t('Logistische Regression', 'Logistic regression'), '#klass-logreg']]],
    'd': [t('Welche Daten?', 'Which data?'), t('Die wichtigste Weiche. <b>Tabellen</b> (CSV, Datenbank, Sensorwerte) haben wenige, schon sinnvolle Spalten: Hier gewinnen Baum-Ensembles. <b>Bilder, Text und Audio</b> sind unstrukturiert: Die Features muss ein Netz erst lernen, und dafür gibt es vortrainierte Modelle mit Millionen von Beispielen.', 'The most important fork. <b>Tables</b> (CSV, database, sensor values) have few columns that already mean something: tree ensembles win here. <b>Images, text and audio</b> are unstructured: a network has to learn the features first, and there are pretrained models with millions of examples for that.'), [[t('Welches Modell wann?', 'Which model when?'), '#ue-wahl']]],
    'gb': [t('3a · Gradient Boosting bei Tabellen', '3a · Gradient Boosting on tables'), t('Auf Tabellendaten ist Gradient Boosting (XGBoost, LightGBM, CatBoost, in scikit-learn <code>HistGradientBoostingClassifier</code>) meist das genaueste Modell, oft genauer als jedes Deep-Learning-Modell. Random Forest ist robuster und braucht weniger Tuning. Ein MLP lohnt sich auf Tabellen selten.', 'On tabular data gradient boosting (XGBoost, LightGBM, CatBoost, in scikit-learn <code>HistGradientBoostingClassifier</code>) is usually the most accurate model, often more accurate than any deep learning model. Random Forest is more robust and needs less tuning. An MLP rarely pays off on tables.'), [['Ensembles', '#klass-ens'], [t('Steckbriefe', 'Profiles'), '#ue-ens']]],
    'fe': ['Feature Engineering', t('Bei Tabellen steckt der grösste Hebel in den Merkmalen: sinnvolle neue Spalten (Verhältnisse, Datumsteile, Gruppen), Kategorien kodieren, unnütze oder verräterische Spalten entfernen. «Garbage in, garbage out»: Die Qualität der Features und Labels bestimmt die Qualität des Ergebnisses.', 'With tables, the biggest lever is in the features: meaningful new columns (ratios, date parts, groups), encoding categories, removing useless or revealing columns. “Garbage in, garbage out”: the quality of the features and labels determines the quality of the result.'), [['Feature Selection', '#ml-fs'], ['Data Leakage', '#klass-leakage']]],
    'pre': [t('3b · Vortrainiertes Modell ohne Training', '3b · Pretrained model without training'), t('Bei Bild, Text und Audio zuerst ein fertiges Modell nehmen (Hugging Face, torchvision, Keras Applications, Ultralytics) und auf den <b>eigenen</b> Daten testen, noch ohne Training: zero-shot (zum Beispiel CLIP für Bildklassen, SAM für Masken), ein COCO-Detektor wie YOLO, Stable Diffusion zum Erzeugen von Bildern oder ein LLM mit gutem Prompt. Wertvoll sind die trainierten Gewichte, nicht die Architektur. Prüfe Lizenz (YOLOv8: AGPL), Grösse und Latenz und übernimm die Vorverarbeitung des Modells.', 'With image, text and audio, first take a finished model (Hugging Face, torchvision, Keras Applications, Ultralytics) and test it on your <b>own</b> data, still without training: zero-shot (for example CLIP for image classes, SAM for masks), a COCO detector such as YOLO, Stable Diffusion for generating images, or an LLM with a good prompt. The trained weights are what is valuable, not the architecture. Check the licence (YOLOv8: AGPL), size and latency, and take over the model’s preprocessing.'), [[t('Woher kommt ein Modell?', 'Where does a model come from?'), '#mo-quelle'], ['Faster R-CNN und YOLO', '#det-modelle'], ['U-Net und SAM', '#det-segmodelle'], ['Stable Diffusion', '#gen-cond']]],
    'r': [t('Reicht das?', 'Good enough?'), t('Vergleiche das vortrainierte Modell auf deinen Validierungsdaten mit der Metrik aus Schritt 1 und mit der Baseline. <b>Ja:</b> Kein Training nötig, weiter zum einmaligen Test. <b>Nein:</b> Meist liegt es an Domain Shift: Das Modell kennt Alltagsfotos (COCO, ImageNet), deine Bilder sind aber Röntgenbilder, unscharf oder haben einen Blaustich, oder es fehlen deine Klassen.', 'Compare the pretrained model on your validation data with the metric from step 1 and with the baseline. <b>Yes:</b> no training needed, go on to the one-off test. <b>No:</b> usually because of domain shift: the model knows everyday photos (COCO, ImageNet), but your images are X-rays, blurry or have a blue cast, or your classes are missing.'), [['Best Practices Object Detection', '#det-best']]],
    'fx': ['Feature Extraction', t('Wenig Daten und eine ähnliche Aufgabe: den alten Head entfernen, alle Conv-Layers einfrieren (<code>base.trainable = False</code>), einen neuen Head mit deiner Zahl Klassen aufsetzen und nur diesen trainieren. Die frühen Layers kennen Kanten und Texturen schon.', 'Little data and a similar task: remove the old head, freeze all conv layers (<code>base.trainable = False</code>), put on a new head with your number of classes and train only that. The early layers already know edges and textures.'), [['Transfer Learning', '#cnn-transfer']]],
    'ft': ['Fine-Tuning', t('Mehr Daten oder eine andere Domäne: zuerst den neuen Head trainieren, dann die oberen Layers auftauen und mit kleiner Learning Rate (zum Beispiel 1e-5) weitertrainieren. Die untersten Layers bleiben meist eingefroren. Trainiere mit Daten aus der echten Einsatzumgebung, also auch mit den Störungen, die dort vorkommen.', 'More data or a different domain: first train the new head, then unfreeze the top layers and continue training with a small learning rate (for example 1e-5). The lowest layers usually stay frozen. Train with data from the real deployment environment, including the disturbances that occur there.'), [['Transfer Learning', '#cnn-transfer'], [t('Bildstörungen', 'Image degradations'), '#cv-bild']]],
    'own': [t('Sonderfall: eigene Architektur', 'Special case: own architecture'), t('Ein Netz von Grund auf lohnt sich fast nur bei exotischen Daten ohne passendes vortrainiertes Modell (Radar, spezielle Sensoren), bei harten Hardware-Limits (Mikrocontroller, Edge) oder in der Forschung. Dann klein anfangen (wenige Layers) und nur bei Bedarf tiefer werden.', 'A network from scratch is almost only worth it for exotic data with no suitable pretrained model (radar, special sensors), with hard hardware limits (microcontroller, edge) or in research. Then start small (few layers) and only go deeper if needed.'), [[t('Ein CNN in Keras', 'A CNN in Keras'), '#cnn-keras'], ['Neural Networks', '#nn']]],
    'pipe': [t('4 · Pipeline und Training', '4 · Pipeline and training'), t('Zuerst das Testset abtrennen (zum Beispiel 80 / 20), dann Train und Validation (75 : 25) oder Cross-Validation. Alles, was aus Daten lernt (Imputer, Scaler, Feature Selection, Modell), wird nur auf Train gefittet, am sichersten in einer <code>Pipeline</code>. Hyperparameter auf der Validierung wählen, das beste Setup auf Train + Validation neu trainieren. Der ganze Ablauf mit allen Schritten steht im Kapitel Supervised ML.', 'First split off the test set (for example 80 / 20), then train and validation (75 : 25) or cross-validation. Everything that learns from data (imputer, scaler, feature selection, model) is fitted on train only, safest in a <code>Pipeline</code>. Choose hyperparameters on the validation set, retrain the best setup on train + validation. The whole workflow with all steps is in the Supervised ML chapter.'), [[t('Ablauf Supervised ML', 'Supervised ML workflow'), '#ml-ablauf'], ['Train, Validation, Test', '#ml-split'], [t('Hyperparameter', 'Hyperparameters'), '#ml-hp']]],
    'test': [t('5 · Einmal testen', '5 · Test once'), t('Das Testset geht ganz am Schluss einmal durch dieselbe Pipeline (Imputer, Scaler, Modell, alles mit den Train-Werten). Das Ergebnis schätzt die Leistung auf neuen Daten und steht neben der Baseline. Wer danach noch am Modell dreht, macht das Testset zur zweiten Validierung.', 'At the very end the test set goes once through the same pipeline (imputer, scaler, model, all with the training values). The result estimates the performance on new data and is shown next to the baseline. Whoever keeps tuning the model afterwards turns the test set into a second validation set.'), [['Train, Validation, Test', '#ml-split']]],
    'thr': [t('6 · Threshold wählen', '6 · Choose the threshold'), t('Ein höherer Threshold gibt mehr Precision und weniger Recall, ein tieferer umgekehrt. Was teurer ist, entscheidet die Anwendung: verpasste Fälle (Krankheit, Defekt: Recall zählt) oder falscher Alarm (Spam-Filter, automatisches Sortieren: Precision zählt). Bei Object Detection gibt es zusätzlich den NMS-IoU-Threshold.', 'A higher threshold gives more precision and less recall, a lower one the other way round. The application decides what is more costly: missed cases (illness, defect: recall counts) or false alarms (spam filter, automatic sorting: precision counts). Object detection also has the NMS IoU threshold.'), [[t('Unausgewogene Klassen', 'Imbalanced classes'), '#klass-imbal'], ['Precision, Recall, mAP', '#det-map']]],
    'ein': [t('7 · Einsetzen und beobachten', '7 · Deploy and monitor'), t('Passt das Modell auf die Zielhardware (Grösse, Latenz, Echtzeit), und erlaubt die Lizenz den Einsatz? Die ganze Pipeline mit Metadaten und Version speichern, dazu eine kurze Model Card. Im Betrieb die Eingaben und, sobald bekannt, die Metrik überwachen. Ändern sie sich (Domain Shift, Drift), mit neuen Daten aus der Einsatzumgebung und derselben Pipeline neu trainieren, die neue Version auf festen und aktuellen Testdaten gegen die alte prüfen und erst dann austauschen. Die alte Version bleibt für einen Rollback archiviert.', 'Does the model fit the target hardware (size, latency, real time), and does the licence allow the use? Save the whole pipeline with metadata and a version, plus a short model card. In operation, monitor the inputs and, once known, the metric. If they change (domain shift, drift), retrain with new data from the deployment environment and the same pipeline, check the new version against the old one on fixed and recent test data and only then swap. The old version stays archived for a rollback.'), [[t('Speichern und laden', 'Saving and loading'), '#mo-speichern'], [t('Neu trainieren', 'Retraining'), '#mo-neu'], [t('Checkliste', 'Checklist'), '#ue-check']]],
  };

  const CHECKS = [
    [t('Vor dem Training', 'Before training'), [
      t('Input, Output und Art des Problems festgelegt', 'Input, output and type of problem defined'),
      t('Metrik und Zielwert definiert («gut genug»)', 'Metric and target value defined (“good enough”)'),
      t('Daten angeschaut: fehlende Werte, Ausreisser, Klassenverteilung', 'Data inspected: missing values, outliers, class distribution'),
      t('Testset abgetrennt und weggelegt', 'Test set split off and put aside'),
      t('Baseline gebaut und gemessen', 'Baseline built and measured'),
      t('Vortrainierte Modelle gesucht, Lizenz geprüft', 'Pretrained models searched, licence checked'),
    ]],
    [t('Training und Abschluss', 'Training and wrap-up'), [
      t('Imputer und Scaler in einer Pipeline, nur auf Train gefittet', 'Imputer and scaler in a pipeline, fitted on train only'),
      t('Hyperparameter mit Validation oder Cross-Validation gewählt', 'Hyperparameters chosen with validation or cross-validation'),
      t('Bestes Setup auf Train + Validation neu trainiert', 'Best setup retrained on train + validation'),
      t('Einmal auf dem Testset gemessen, mit der Baseline verglichen', 'Measured once on the test set, compared with the baseline'),
      t('Threshold passend zur Anwendung gewählt', 'Threshold chosen to suit the application'),
      t('Grösse, Latenz und Zielhardware geprüft, Seed notiert', 'Size, latency and target hardware checked, seed noted'),
    ]],
    [t('Einsatz und Betrieb', 'Deployment and operation'), [
      t('Ganze Pipeline mit Metadaten gespeichert (Version, Library-Versionen, Features, Seed, Metriken mit Baseline), Laden getestet', 'Whole pipeline saved with metadata (version, library versions, features, seed, metrics with baseline), loading tested'),
      t('Model Card geschrieben: Zweck, Daten, Metriken, Grenzen, Lizenz', 'Model card written: purpose, data, metrics, limits, licence'),
      t('Eingaben im Einsatz geprüft: fehlende Spalten, unbekannte Kategorien, Werte ausserhalb des Trainingsbereichs', 'Inputs checked in use: missing columns, unknown categories, values outside the training range'),
      t('Verteilung der Eingaben und, sobald bekannt, die Metrik werden überwacht', 'Distribution of the inputs and, once known, the metric are monitored'),
      t('Neue Version auf festen und aktuellen Testdaten gegen die alte geprüft', 'New version checked against the old one on fixed and recent test data'),
      t('Alte Version archiviert, Rollback möglich', 'Old version archived, rollback possible'),
    ]],
  ];
  let ci = 0;
  const checklist = '<div class="ue-checkbar"><span class="ue-prog" id="ueCheckProg"></span><button type="button" class="ue-reset" id="ueCheckReset">' + t('Alle Häkchen entfernen', 'Clear all ticks') + '</button></div>' +
    '<div class="sbgrid" id="ueChecks">' + CHECKS.map(function (g) {
      return '<div class="sb ue-check"><h4>' + g[0] + '</h4>' + g[1].map(function (txt) {
        ci += 1;
        return '<label><input type="checkbox" id="ue-c' + ci + '"><span>' + txt + '</span></label>';
      }).join('') + '</div>';
    }).join('') + '</div>';

  const vorgehen = `
  <h3 id="ue-vorgehen">${t('Neues ML-Problem: So gehst du vor', 'A new ML problem: how to approach it')}</h3>
  <p>${t('Bevor du ein Modell auswählst, kommt die Frage nach dem Vorgehen. Die Faustregel: Bei Bild, Text und Audio fängst du mit einem vortrainierten Modell an und trainierst es höchstens nach. Bei Tabellen fängst du mit Gradient Boosting an. Und vor allem anderen steht eine Baseline.', 'Before you choose a model comes the question of how to proceed. The rule of thumb: with images, text and audio you start with a pretrained model and at most fine-tune it. With tables you start with gradient boosting. And a baseline comes before everything else.')}</p>
  <p class="hint">${t('Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Kapiteln.', 'Click a step in the figure: the explanation opens below, with links to the matching chapters.')}</p>
  ${vorgehenFig}
  <div class="merk">${t('<b>Merksatz</b><p>Vom Einfachen zum Aufwändigen: Baseline, dann fertiges Modell, dann nachtrainieren, und eine eigene Architektur nur im Sonderfall. Gute Labels und Daten aus der echten Einsatzumgebung bringen oft mehr als ein grösseres Modell.</p>', '<b>Key point</b><p>From simple to elaborate: baseline, then a finished model, then fine-tuning, and your own architecture only in special cases. Good labels and data from the real deployment environment often help more than a bigger model.</p>')}</div>

  <h3 id="ue-dodont">Do &amp; Don’t</h3>
  <div class="sbgrid">
    <div class="sb ue-do"><h4>Do</h4><ul>
      <li>${t('Einfach starten (wenige Layers, kleines Modell wie YOLOv8n), Komplexität nur bei Bedarf erhöhen', 'Start simple (few layers, a small model such as YOLOv8n), add complexity only when needed')}</li>
      <li>${t('Bei Bild, Text, Audio: vortrainiertes Modell, zuerst zero-shot testen', 'With images, text, audio: a pretrained model, test it zero-shot first')}</li>
      <li>${t('Bei Tabellen: Gradient Boosting vor Deep Learning', 'With tables: gradient boosting before deep learning')}</li>
      <li>${t('In Datenqualität investieren: saubere Labels, Daten aus der Einsatzumgebung', 'Invest in data quality: clean labels, data from the deployment environment')}</li>
      <li>${t('Alles, was aus Daten lernt, in eine <code>Pipeline</code>', 'Put everything that learns from data in a <code>Pipeline</code>')}</li>
      <li>${t('Lieber in bestehende Prozesse einbauen als neue erfinden', 'Rather build into existing processes than invent new ones')}</li>
      <li>${t('Seed setzen und notieren', 'Set and note the seed')}</li>
      <li>${t('Das Modell auf den eigenen Validierungsdaten wählen, nicht nach Benchmark oder Erscheinungsdatum', 'Choose the model on your own validation data, not by benchmark or release date')}</li>
    </ul><div class="sb-f"><a href="#ml-best">${t('Best Practices Supervised ML →', 'Best practices supervised ML →')}</a><a href="#cnn-best">${t('CNN →', 'CNN →')}</a><a href="#det-best">${t('Detection →', 'Detection →')}</a></div></div>
    <div class="sb ue-dont"><h4>Don’t</h4><ul>
      <li>${t('Imputer oder Scaler auf allen Daten fitten (Data Leakage)', 'Fit the imputer or scaler on all data (data leakage)')}</li>
      <li>${t('Hyperparameter am Testset wählen oder das Testset mehrfach benutzen', 'Choose hyperparameters on the test set or use the test set several times')}</li>
      <li>${t('Testdaten ohne dieselbe Vorverarbeitung ins Modell geben', 'Feed test data to the model without the same preprocessing')}</li>
      <li>${t('Ohne Baseline behaupten, das Modell sei gut', 'Claim the model is good without a baseline')}</li>
      <li>${t('Das grösste Modell nehmen, ohne Latenz und Hardware zu prüfen', 'Take the biggest model without checking latency and hardware')}</li>
      <li>${t('Die Lizenz ignorieren', 'Ignore the licence')}</li>
      <li>${t('Ein schweres Modell zu kurz trainieren: Es bleibt auf dem Niveau der Baseline', 'Train a heavy model too briefly: it stays at the level of the baseline')}</li>
      <li>${t('Mit wenig Daten das ganze Netz fine-tunen: Overfitting oder Catastrophic Forgetting', 'Fine-tune the whole network with little data: overfitting or catastrophic forgetting')}</li>
      <li>${t('Fremde <code>.pkl</code>- oder <code>.joblib</code>-Dateien laden: Sie führen beim Laden Code aus', 'Load someone else’s <code>.pkl</code> or <code>.joblib</code> files: they run code when loaded')}</li>
    </ul><div class="sb-f"><a href="#klass-leakage">Data Leakage →</a><a href="#mo-speichern">${t('Speichern und laden →', 'Saving and loading →')}</a></div></div>
  </div>

  <h3 id="ue-check">${t('Checkliste für ein neues Projekt', 'Checklist for a new project')}</h3>
  <p>${t('Zum Abhaken. Die Häkchen bleiben in diesem Browser gespeichert (mit dem lokalen Server auch browserübergreifend).', 'To tick off. The ticks are kept in this browser (with the local server also across browsers).')}</p>
  ${checklist}
`;

  const praxis = t(`
  <h3 id="ue-praxis">Ein Modell in der Praxis</h3>
  <p>In jedem Kapitel hiess es «das Modell lernt» oder «wir trainieren ein Modell». Die folgenden Abschnitte treten einen Schritt zurück: <b>Was ist ein Modell eigentlich</b>, was steckt in einer Modelldatei, wann nimmt man ein fertiges Modell statt ein eigenes, und was passiert, wenn das Modell im Einsatz langsam schlechter wird? Sie vertiefen die Schritte 3b und 7 der Grafik oben.</p>
  <p class="note">Die Demos rechnen im Browser. Das Beispiel-Notebook am Ende der Seite macht dasselbe mit scikit-learn: Pipeline speichern, laden, Drift simulieren, neu trainieren.</p>
  <h3 id="mo-was">Was ist ein Modell eigentlich?</h3>
  <p>Ein Modell ist eine <b>Funktion mit gelernten Zahlen</b>. Es bekommt eine Eingabe x und gibt eine Vorhersage ŷ aus:</p>
  <pre><code>ŷ = f(x; θ)
f = Architektur (die Form der Funktion)    θ = Parameter (die gelernten Zahlen)</code></pre>
  <p>Ein Modell hat damit drei Teile, die man auseinanderhalten muss:</p>
  <div class="tablewrap"><table>
    <tr><th>Teil</th><th>Was es ist</th><th>Wer es festlegt</th><th>Beispiel lineare Regression</th></tr>
    <tr><td><b>Architektur</b></td><td>Die Form der Funktion: welche Rechenschritte in welcher Reihenfolge</td><td>Du, beim Wählen des Modells</td><td><code>ŷ = w · x + b</code></td></tr>
    <tr><td><b>Parameter</b></td><td>Die Zahlen in der Funktion, die beim Training gefunden werden</td><td>Das Training (<code>fit</code>)</td><td><code>w = 17.2</code>, <code>b = 612</code></td></tr>
    <tr><td><b>Hyperparameter</b></td><td>Einstellungen, die das Training steuern, aber nicht gelernt werden</td><td>Du, gewählt auf der Validation</td><td>Learning Rate, Epochs, Regularisierung <code>alpha</code></td></tr>
  </table></div>
  <p>Dazu kommen zwei Begriffe, die oft verwechselt werden. Der <b>Algorithmus</b> ist das Verfahren, mit dem die Parameter gefunden werden (z. B. Gradient Descent oder die Normalengleichung). Das <b>Modell</b> ist das Ergebnis: Architektur plus gefundene Parameter. Beim <b>Training</b> ändern sich die Parameter; bei der <b>Inferenz</b> (<code>predict</code>) bleiben sie fest, das Modell wird nur noch angewendet.</p>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Architektur</th><th>Parameter</th><th>Grösse (ungefähr)</th></tr>
    <tr><td><b>Lineare Regression</b>, 8 Features</td><td>gewichtete Summe</td><td>8 Gewichte + 1 Bias</td><td>unter 1 KB</td></tr>
    <tr><td><b>Entscheidungsbaum</b></td><td>verschachtelte Wenn-dann-Regeln</td><td>pro Knoten Feature und Threshold, pro Blatt ein Wert</td><td>KB</td></tr>
    <tr><td><b>Random Forest</b>, 100 Bäume</td><td>Mittelwert vieler Bäume</td><td>alle Knoten aller Bäume</td><td>MB bis über 100 MB</td></tr>
    <tr><td><b>kNN</b></td><td>«frag die k nächsten Nachbarn»</td><td>keine im engeren Sinn: Das Modell <i>ist</i> der Trainingsdatensatz</td><td>so gross wie die Trainingsdaten</td></tr>
    <tr><td><b>ResNet-50</b> (CNN)</td><td>50 Schichten mit Convolutions und Skip Connections</td><td>rund 25,6 Mio. Gewichte</td><td>etwa 100 MB (float32)</td></tr>
    <tr><td><b>BERT-base</b> (Transformer)</td><td>12 Transformer-Blöcke</td><td>rund 110 Mio. Gewichte</td><td>etwa 440 MB (float32)</td></tr>
    <tr><td><b>LLM</b> mit 7 Mrd. Parametern</td><td>Dutzende Transformer-Blöcke</td><td>7 Mrd. Gewichte</td><td>etwa 14 GB (16 Bit pro Gewicht)</td></tr>
  </table></div>
  <p>Die Grösse folgt direkt aus der Zahl der Parameter: Anzahl × Bytes pro Zahl. Ein float32 braucht 4 Bytes, 25,6 Mio. × 4 B ≈ 100 MB.</p>
  <div class="demo" id="moFileDemo">
    <div class="tag">Demo</div><h4>Ein Modell ist nur eine Datei mit Zahlen</h4>
    <p class="hint">Zwölf Wohnungen: Wohnfläche gegen Monatsmiete. Trainiere die lineare Regression mit mehr oder weniger Epochs und schau, was in der «Modelldatei» rechts steht. Danach rechnet die Vorhersage unten <b>nur</b> mit dieser Datei. Schalte die Vorverarbeitung aus und sieh, was dann passiert.</p>
    <div class="ctl"><label for="moEp">Epochs (Gradient Descent)</label><input type="range" id="moEp" min="0" max="200" step="5" value="60"><output id="moEpO"></output></div>
    <div class="ctl"><label for="moQ">Vorhersage für Wohnfläche (m²)</label><input type="range" id="moQ" min="30" max="130" step="1" value="85"><output id="moQO"></output></div>
    <div class="btnrow" id="moScl" role="group" aria-label="Vorverarbeitung in der Datei"><button data-v="1" class="pri" aria-pressed="true">Scaler mitgespeichert</button><button data-v="0" aria-pressed="false">nur das Modell gespeichert</button></div>
    <div class="mo-file">
      <svg class="plot" id="moFileSvg" viewBox="0 0 360 240" role="img" aria-label="Streudiagramm Wohnfläche gegen Miete mit der gelernten Geraden"></svg>
      <pre class="mo-json"><code id="moJson"></code></pre>
    </div>
    <div class="stats"><span>MAE <b id="moMae"></b></span><span>Vorhersage <b id="moPred"></b></span></div>
    <p class="hint" id="moFileMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Modell = Architektur + gelernte Parameter. Die Hyperparameter haben bestimmt, <i>wie</i> gelernt wurde, gehören aber nicht zur Rechnung. Zur Vorhersage braucht man ausserdem genau dieselbe Vorverarbeitung wie beim Training: Scaler, Encoder, Spaltenreihenfolge, Bildgrösse.</p></div>
  <div class="falle"><b>Falle</b><p>Nur das Modell speichern und den Scaler vergessen. Das Modell rechnet dann mit unskalierten Zahlen und liefert Unsinn, ohne Fehlermeldung. Darum speichert man in scikit-learn die ganze <code>Pipeline</code>, nicht nur den Schätzer.</p></div>

  <h3 id="mo-quelle">Woher kommt ein Modell? Selbst trainieren, übernehmen, anpassen</h3>
  <p>Ein Modell muss man nicht immer von null trainieren. Für Bilder, Text und Audio gibt es <b>vortrainierte Modelle</b>, die auf riesigen Datensätzen gelernt haben (ImageNet: 1,28 Mio. Bilder in 1000 Klassen). Ihre frühen Schichten erkennen allgemeine Muster (Kanten, Formen, Wortbedeutungen), die auch für deine Aufgabe nützlich sind.</p>
  <div class="tablewrap"><table>
    <tr><th>Weg</th><th>Was du machst</th><th>Wann</th><th>Aufwand</th></tr>
    <tr><td><b>Von null trainieren</b></td><td>Architektur wählen, alle Parameter zufällig starten, alles lernen</td><td>Tabellendaten (fast immer), sehr viele eigene Daten, ganz neue Art von Daten</td><td>hoch bei Netzen, klein bei klassischen Modellen</td></tr>
    <tr><td><b>Fertig übernehmen</b></td><td>Vortrainiertes Modell unverändert verwenden (zero-shot)</td><td>Die Aufgabe ist genau die des Modells (z. B. ImageNet-Klassen, Übersetzung, SAM-Segmentierung)</td><td>fast keiner</td></tr>
    <tr><td><b>Transfer Learning</b></td><td>Basis einfrieren, nur einen neuen Kopf (Output Layer) trainieren</td><td>Wenig eigene Daten (hunderte bis tausende), Aufgabe ähnlich</td><td>klein</td></tr>
    <tr><td><b>Fine-Tuning</b></td><td>Danach auch obere Schichten der Basis mit sehr kleiner Learning Rate weitertrainieren</td><td>Mehr Daten (zehntausende), Aufgabe etwas anders</td><td>mittel</td></tr>
  </table></div>
  <p>Vortrainierte Modelle findest du im <b>Hugging Face Hub</b> (Text, Bild, Audio), in <b>Keras Applications</b> (<code>keras.applications.ResNet50</code>), in <b>torchvision</b> (<code>torchvision.models</code>) und für Bilder in <b>timm</b>. scikit-learn hat keine vortrainierten Modelle: Bei Tabellendaten sind die Spalten jeder Aufgabe anders, darum gibt es dort nichts Allgemeines zu übernehmen.</p>
  <pre><code># Transfer Learning mit Keras (siehe Kapitel CNN)
base = keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")
base.trainable = False                      # Basis einfrieren
model = keras.Sequential([base, keras.layers.Dense(3, activation="softmax")])
model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=5)

base.trainable = True                       # optional: Fine-Tuning
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=3)</code></pre>
  <div class="demo" id="moPickDemo">
    <div class="tag">Demo</div><h4>Welcher Weg passt?</h4>
    <p class="hint">Wähle Datentyp, Datenmenge und wie ähnlich deine Aufgabe der eines vortrainierten Modells ist.</p>
    <div class="btnrow" id="moPType" role="group" aria-label="Datentyp"><button data-v="tab" class="pri" aria-pressed="true">Tabelle</button><button data-v="img" aria-pressed="false">Bilder</button><button data-v="txt" aria-pressed="false">Text</button></div>
    <div class="btnrow" id="moPN" role="group" aria-label="Datenmenge"><button data-v="few" class="pri" aria-pressed="true">einige hundert</button><button data-v="mid" aria-pressed="false">zehntausende</button><button data-v="many" aria-pressed="false">Millionen</button></div>
    <div class="btnrow" id="moPSim" role="group" aria-label="Ähnlichkeit zur Aufgabe des vortrainierten Modells"><button data-v="same" class="pri" aria-pressed="true">gleiche Aufgabe</button><button data-v="near" aria-pressed="false">ähnlich</button><button data-v="far" aria-pressed="false">ganz anders</button></div>
    <div class="mo-rec" id="moPRec" aria-live="polite"></div>
  </div>
  <h4>Vortrainiertes Modell prüfen</h4>
  <ul>
    <li><b>Vorverarbeitung:</b> Ein vortrainiertes Modell erwartet <b>seine</b> Vorverarbeitung: dieselbe Bildgrösse, dieselbe Normalisierung (z. B. <code>keras.applications.resnet50.preprocess_input</code>), denselben Tokenizer und dieselben Klassen-IDs (COCO: 91 gegen 80 IDs).</li>
    <li><b>Lizenz:</b> Nicht jedes Modell ist kommerziell nutzbar (YOLOv8: AGPL).</li>
    <li><b>Domain Shift:</b> Ein Modell kennt nur seine Trainingsdaten. Alltagsfotos (COCO, ImageNet) helfen wenig bei Röntgen- oder Mikroskopbildern, ein Modell für Tageslicht versagt nachts. Dann mit Daten aus der Einsatzumgebung nachtrainieren.</li>
    <li><b>Grösse und Latenz:</b> Läuft es auf der Zielhardware, in Echtzeit? (YOLOv8n gegen YOLOv8x)</li>
    <li><b>Datenqualität:</b> Saubere Labels bringen oft mehr als ein grösseres Modell.</li>
  </ul>

  <h3 id="mo-speichern">Speichern und laden</h3>
  <p>Nach dem Training liegt das Modell im Arbeitsspeicher. Damit es später (oder auf einem anderen Rechner) Vorhersagen machen kann, wird es gespeichert: Architektur und Parameter, bei scikit-learn zusätzlich die ganze Vorverarbeitung.</p>
  <div class="tablewrap"><table>
    <tr><th>Framework</th><th>Speichern</th><th>Laden</th><th>Was drin ist</th></tr>
    <tr><td><b>scikit-learn</b></td><td><code>joblib.dump(pipe, "modell.joblib")</code></td><td><code>joblib.load("modell.joblib")</code></td><td>Das ganze Python-Objekt (Pipeline mit Scaler und Modell)</td></tr>
    <tr><td><b>Keras</b></td><td><code>model.save("modell.keras")</code></td><td><code>keras.models.load_model("modell.keras")</code></td><td>Architektur, Gewichte, Optimizer-Zustand</td></tr>
    <tr><td><b>PyTorch</b></td><td><code>torch.save(model.state_dict(), "modell.pt")</code></td><td><code>model.load_state_dict(torch.load("modell.pt", weights_only=True))</code></td><td>Nur die Gewichte; die Architektur ist dein Python-Code</td></tr>
    <tr><td><b>Hugging Face</b></td><td><code>model.save_pretrained("ordner")</code></td><td><code>AutoModel.from_pretrained("ordner")</code></td><td>Gewichte (<code>.safetensors</code>), Konfiguration, Tokenizer</td></tr>
    <tr><td><b>ONNX</b></td><td>Export aus PyTorch, Keras, scikit-learn</td><td>ONNX Runtime (Python, C#, JavaScript …)</td><td>Rechengraph und Gewichte, unabhängig vom Framework</td></tr>
  </table></div>
  <pre><code>import json, joblib, sklearn
from datetime import date

pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

joblib.dump(pipe, "modell_v1.joblib")                 # ganze Pipeline, nicht nur das Modell
meta = {"version": "v1", "datum": str(date.today()), "sklearn": sklearn.__version__,
        "features": list(X_train.columns), "seed": 42,
        "val_accuracy": 0.87, "baseline_accuracy": 0.61, "n_train": len(X_train)}
json.dump(meta, open("modell_v1.json", "w"), indent=2)  # Metadaten daneben

pipe2 = joblib.load("modell_v1.joblib")
assert (pipe2.predict(X_val) == pipe.predict(X_val)).all()   # Laden prüfen</code></pre>
  <p>Zur Datei gehören <b>Metadaten</b>: Version, Datum, Versionen der Libraries, Feature-Namen in der richtigen Reihenfolge, Seed, Metriken mit Baseline und Datenmenge. Ausführlicher ist eine <b>Model Card</b>: Wofür ist das Modell gedacht und wofür nicht, mit welchen Daten wurde es trainiert, wie gut ist es auf welchen Gruppen, welche Grenzen sind bekannt? Hugging Face zeigt sie auf jeder Modellseite.</p>
  <div class="falle"><b>Falle</b><p><code>pickle</code> und <code>joblib</code> führen beim Laden Code aus. Eine fremde <code>.pkl</code>- oder <code>.joblib</code>-Datei zu laden ist so riskant wie ein fremdes Programm zu starten. Nur eigene oder vertrauenswürdige Dateien laden; für fremde Gewichte gibt es <code>.safetensors</code> und <code>torch.load(…, weights_only=True)</code>. Ausserdem passt eine joblib-Datei nur sicher zur selben scikit-learn-Version (sonst <code>InconsistentVersionWarning</code>), darum die Version in den Metadaten.</p></div>

  <h3 id="mo-neu">Neu trainieren: wann und wie</h3>
  <p>Ein Modell ist eine Momentaufnahme der Trainingsdaten. Die Welt ändert sich danach weiter, und das Modell merkt es nicht. Man spricht von <b>Drift</b>:</p>
  <ul>
    <li><b>Data Drift</b> (Covariate Shift): Die Eingaben verteilen sich anders. Beispiel: Ein neuer Sensor misst systematisch höher, Kunden werden jünger, Fotos kommen von einer anderen Kamera.</li>
    <li><b>Concept Drift</b>: Der Zusammenhang zwischen x und y ändert sich. Beispiel: Nach einer Zinserhöhung bedeuten dieselben Kundendaten ein anderes Kreditrisiko; Spam-Mails ändern ihren Stil.</li>
    <li><b>Neue Klassen oder neue Fragen</b>: Ein neues Produkt soll erkannt werden, das es beim Training nicht gab. Dann muss das Modell (mindestens der Output Layer) angepasst werden.</li>
  </ul>
  <p>Erkennen kann man Drift, indem man im Einsatz die <b>Verteilung der Eingaben</b> mit der der Trainingsdaten vergleicht (Mittelwerte, Histogramme, Anteil unbekannter Kategorien) und, sobald die echten Antworten bekannt sind, die <b>Metrik laufend nachrechnet</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Variante</th><th>Wie</th><th>Gut wenn</th><th>Risiko</th></tr>
    <tr><td><b>Komplett neu</b></td><td>Gleiche Pipeline, auf alten + neuen Daten neu <code>fit</code></td><td>Klassische Modelle, Training dauert Minuten</td><td>Alte Daten, die nicht mehr gelten, ziehen das Modell zurück</td></tr>
    <tr><td><b>Nur auf neuen Daten</b></td><td>Neu <code>fit</code> auf einem aktuellen Zeitfenster</td><td>Starker Concept Drift, alte Daten sind veraltet</td><td>Vergisst seltene Fälle, die nur in alten Daten vorkamen</td></tr>
    <tr><td><b>Weitertrainieren</b></td><td>Vom gespeicherten Modell aus weiter lernen: <code>partial_fit</code>, <code>warm_start=True</code>, bei Netzen <code>fit</code> mit kleiner Learning Rate</td><td>Grosse Netze, laufend neue Daten</td><td><b>Catastrophic Forgetting</b>: Das Netz verlernt Altes, wenn es nur Neues sieht</td></tr>
    <tr><td><b>Nur den Kopf neu</b></td><td>Basis behalten, Output Layer neu (z. B. für eine neue Klasse)</td><td>Neue Klassen, Basis ist gut</td><td>Basis lernt nichts Neues</td></tr>
  </table></div>
  <div class="demo" id="moDriftDemo">
    <div class="tag">Demo</div><h4>Drift: Ein altes Modell wird schlechter</h4>
    <p class="hint">Das Modell (logistische Regression) wurde auf den Daten von «Monat 0» trainiert. Schiebe die Zeit nach rechts: Die Punkte verschieben sich (Data Drift), und die Grenze zwischen den Klassen dreht sich (Concept Drift). Dann trainiere neu und vergleiche.</p>
    <div class="ctl"><label for="moDr">Zeit (Monate seit dem Training)</label><input type="range" id="moDr" min="0" max="12" step="1" value="9"><output id="moDrO"></output></div>
    <div class="btnrow" id="moDrMode" role="group" aria-label="Neu trainieren"><button data-v="old" class="pri" aria-pressed="true">altes Modell behalten</button><button data-v="new" aria-pressed="false">neu trainieren: nur aktuelle Daten</button><button data-v="all" aria-pressed="false">neu trainieren: alte + aktuelle Daten</button></div>
    <svg class="plot" id="moDrSvg" viewBox="0 0 400 300" role="img" aria-label="Punkte zweier Klassen mit der Grenze des alten und des neuen Modells"></svg>
    <div class="stats"><span>Altes Modell, aktuelle Daten <b id="moAccOld"></b></span><span>Gewähltes Modell, aktuelle Daten <b id="moAccNew"></b></span><span>Gewähltes Modell, Daten von Monat 0 <b id="moAccPast"></b></span><span>Baseline <b>0.50</b></span></div>
    <p class="hint" id="moDrMsg"></p>
  </div>
  <p>Beim Vergleich gilt dieselbe Regel wie beim ersten Training: Die neue Version muss auf <b>denselben Testdaten mit derselben Metrik</b> besser sein als die alte, sonst bleibt die alte. Sinnvoll sind zwei Testsets: ein festes, das nie ändert (prüft, ob Altes vergessen wurde), und ein aktuelles aus der jüngsten Zeit (prüft, ob die Drift aufgefangen ist).</p>
  <div class="merk"><b>Merksatz</b><p>Jedes Modell veraltet. Eingaben und Metriken im Einsatz überwachen, bei Drift mit derselben Pipeline neu trainieren, die neue Version auf festen und aktuellen Testdaten gegen die alte prüfen und erst dann austauschen. Die alte Version bleibt gespeichert, damit man zurückwechseln kann (Rollback).</p></div>
  <div class="falle"><b>Falle</b><p>Beim Retraining die Testdaten mit in die Trainingsdaten werfen («wir haben ja jetzt mehr Daten»). Dann hat man keine ehrliche Messung mehr. Ebenso: Feedback Loops. Wenn das Modell entscheidet, welche Fälle überhaupt ein Label bekommen (z. B. nur genehmigte Kredite zeigen, ob sie zurückbezahlt werden), sieht das neue Training nur noch die Fälle, die das alte Modell durchgelassen hat.</p></div>

  <h4>Begriffe</h4>
  <div class="tablewrap"><table>
    <tr><th>Begriff</th><th>Bedeutung</th></tr>
    <tr><td><b>Inferenz</b></td><td>Das fertige Modell anwenden (<code>predict</code>), ohne die Parameter zu ändern</td></tr>
    <tr><td><b>Checkpoint</b></td><td>Zwischenstand der Gewichte während des Trainings, z. B. die beste Epoch (<code>ModelCheckpoint</code>)</td></tr>
    <tr><td><b>Weights</b></td><td>Die Parameter eines Netzes; «vortrainierte Weights» heisst: die gelernten Zahlen eines fremden Trainings</td></tr>
    <tr><td><b>Model Card</b></td><td>Kurzbeschreibung eines Modells: Zweck, Daten, Metriken, Grenzen, Lizenz</td></tr>
    <tr><td><b>Model Registry</b></td><td>Ablage für Modellversionen mit Metadaten und Status (z. B. MLflow): Welche Version läuft, welche ist archiviert</td></tr>
    <tr><td><b>Drift</b></td><td>Daten (Data Drift) oder Zusammenhang (Concept Drift) ändern sich nach dem Training</td></tr>
    <tr><td><b>Rollback</b></td><td>Zur vorherigen Modellversion zurückwechseln, wenn die neue schlechter ist</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Ein Modell ist erst fertig, wenn ein anderer Mensch es laden, verstehen und mit neuen Daten genauso neu trainieren kann. Dafür braucht es Pipeline, Metadaten, Seed, Versionen und eine Model Card, nicht nur eine Datei mit Gewichten.</p></div>`, `
  <h3 id="ue-praxis">A model in practice</h3>
  <p>Every chapter said “the model learns” or “we train a model”. The following sections take a step back: <b>what actually is a model</b>, what is inside a model file, when do you take a ready-made model instead of your own, and what happens when the model slowly gets worse in use? They go deeper into steps 3b and 7 of the figure above.</p>
  <p class="note">The demos compute in the browser. The example notebook at the end of the page does the same with scikit-learn: save a pipeline, load it, simulate drift, retrain.</p>
  <h3 id="mo-was">What actually is a model?</h3>
  <p>A model is a <b>function with learned numbers</b>. It takes an input x and returns a prediction ŷ:</p>
  <pre><code>ŷ = f(x; θ)
f = architecture (the shape of the function)    θ = parameters (the learned numbers)</code></pre>
  <p>So a model has three parts that need to be kept apart:</p>
  <div class="tablewrap"><table>
    <tr><th>Part</th><th>What it is</th><th>Who sets it</th><th>Example linear regression</th></tr>
    <tr><td><b>Architecture</b></td><td>The shape of the function: which computation steps in which order</td><td>You, when choosing the model</td><td><code>ŷ = w · x + b</code></td></tr>
    <tr><td><b>Parameters</b></td><td>The numbers inside the function, found during training</td><td>Training (<code>fit</code>)</td><td><code>w = 17.2</code>, <code>b = 612</code></td></tr>
    <tr><td><b>Hyperparameters</b></td><td>Settings that control training but are not learned</td><td>You, chosen on validation</td><td>learning rate, epochs, regularisation <code>alpha</code></td></tr>
  </table></div>
  <p>Two more terms are often mixed up. The <b>algorithm</b> is the procedure that finds the parameters (e.g. gradient descent or the normal equation). The <b>model</b> is the result: architecture plus the parameters found. During <b>training</b> the parameters change; during <b>inference</b> (<code>predict</code>) they stay fixed and the model is only applied.</p>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>Architecture</th><th>Parameters</th><th>Size (roughly)</th></tr>
    <tr><td><b>Linear regression</b>, 8 features</td><td>weighted sum</td><td>8 weights + 1 bias</td><td>under 1 KB</td></tr>
    <tr><td><b>Decision tree</b></td><td>nested if-then rules</td><td>per node a feature and a threshold, per leaf a value</td><td>KB</td></tr>
    <tr><td><b>Random forest</b>, 100 trees</td><td>average of many trees</td><td>all nodes of all trees</td><td>MB to over 100 MB</td></tr>
    <tr><td><b>kNN</b></td><td>«ask the k nearest neighbours»</td><td>none in the strict sense: the model <i>is</i> the training set</td><td>as large as the training data</td></tr>
    <tr><td><b>ResNet-50</b> (CNN)</td><td>50 layers with convolutions and skip connections</td><td>about 25.6 million weights</td><td>about 100 MB (float32)</td></tr>
    <tr><td><b>BERT-base</b> (transformer)</td><td>12 transformer blocks</td><td>about 110 million weights</td><td>about 440 MB (float32)</td></tr>
    <tr><td><b>LLM</b> with 7 billion parameters</td><td>dozens of transformer blocks</td><td>7 billion weights</td><td>about 14 GB (16 bits per weight)</td></tr>
  </table></div>
  <p>The size follows directly from the number of parameters: count × bytes per number. A float32 takes 4 bytes, 25.6 million × 4 B ≈ 100 MB.</p>
  <div class="demo" id="moFileDemo">
    <div class="tag">Demo</div><h4>A model is just a file of numbers</h4>
    <p class="hint">Twelve flats: living area against monthly rent. Train the linear regression with more or fewer epochs and look at what is in the «model file» on the right. The prediction below then computes <b>only</b> from this file. Switch off the preprocessing and see what happens.</p>
    <div class="ctl"><label for="moEp">Epochs (gradient descent)</label><input type="range" id="moEp" min="0" max="200" step="5" value="60"><output id="moEpO"></output></div>
    <div class="ctl"><label for="moQ">Prediction for living area (m²)</label><input type="range" id="moQ" min="30" max="130" step="1" value="85"><output id="moQO"></output></div>
    <div class="btnrow" id="moScl" role="group" aria-label="Preprocessing in the file"><button data-v="1" class="pri" aria-pressed="true">scaler saved with it</button><button data-v="0" aria-pressed="false">only the model saved</button></div>
    <div class="mo-file">
      <svg class="plot" id="moFileSvg" viewBox="0 0 360 240" role="img" aria-label="Scatter plot of living area against rent with the learned line"></svg>
      <pre class="mo-json"><code id="moJson"></code></pre>
    </div>
    <div class="stats"><span>MAE <b id="moMae"></b></span><span>Prediction <b id="moPred"></b></span></div>
    <p class="hint" id="moFileMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Model = architecture + learned parameters. The hyperparameters decided <i>how</i> it learned but are not part of the computation. To predict, you also need exactly the same preprocessing as in training: scaler, encoder, column order, image size.</p></div>
  <div class="falle"><b>Pitfall</b><p>Saving only the model and forgetting the scaler. The model then computes with unscaled numbers and returns nonsense, without any error message. That is why in scikit-learn you save the whole <code>Pipeline</code>, not just the estimator.</p></div>

  <h3 id="mo-quelle">Where does a model come from? Train it, take it over, adapt it</h3>
  <p>You do not always have to train a model from scratch. For images, text and audio there are <b>pretrained models</b> that learned on huge datasets (ImageNet: 1.28 million images in 1000 classes). Their early layers recognise general patterns (edges, shapes, word meanings) that are useful for your task too.</p>
  <div class="tablewrap"><table>
    <tr><th>Way</th><th>What you do</th><th>When</th><th>Effort</th></tr>
    <tr><td><b>Train from scratch</b></td><td>Choose an architecture, start all parameters at random, learn everything</td><td>Tabular data (almost always), very much own data, a completely new kind of data</td><td>high for networks, small for classical models</td></tr>
    <tr><td><b>Use as it is</b></td><td>Use a pretrained model unchanged (zero-shot)</td><td>The task is exactly the model's (e.g. ImageNet classes, translation, SAM segmentation)</td><td>almost none</td></tr>
    <tr><td><b>Transfer learning</b></td><td>Freeze the base, train only a new head (output layer)</td><td>Little own data (hundreds to thousands), similar task</td><td>small</td></tr>
    <tr><td><b>Fine-tuning</b></td><td>Then also keep training the upper layers of the base with a very small learning rate</td><td>More data (tens of thousands), somewhat different task</td><td>medium</td></tr>
  </table></div>
  <p>You find pretrained models on the <b>Hugging Face Hub</b> (text, image, audio), in <b>Keras Applications</b> (<code>keras.applications.ResNet50</code>), in <b>torchvision</b> (<code>torchvision.models</code>) and for images in <b>timm</b>. scikit-learn has no pretrained models: with tabular data the columns of every task are different, so there is nothing general to take over.</p>
  <pre><code># Transfer learning with Keras (see the CNN chapter)
base = keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")
base.trainable = False                      # freeze the base
model = keras.Sequential([base, keras.layers.Dense(3, activation="softmax")])
model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=5)

base.trainable = True                       # optional: fine-tuning
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=3)</code></pre>
  <div class="demo" id="moPickDemo">
    <div class="tag">Demo</div><h4>Which way fits?</h4>
    <p class="hint">Choose the data type, the amount of data and how similar your task is to that of a pretrained model.</p>
    <div class="btnrow" id="moPType" role="group" aria-label="Data type"><button data-v="tab" class="pri" aria-pressed="true">Table</button><button data-v="img" aria-pressed="false">Images</button><button data-v="txt" aria-pressed="false">Text</button></div>
    <div class="btnrow" id="moPN" role="group" aria-label="Amount of data"><button data-v="few" class="pri" aria-pressed="true">a few hundred</button><button data-v="mid" aria-pressed="false">tens of thousands</button><button data-v="many" aria-pressed="false">millions</button></div>
    <div class="btnrow" id="moPSim" role="group" aria-label="Similarity to the task of the pretrained model"><button data-v="same" class="pri" aria-pressed="true">same task</button><button data-v="near" aria-pressed="false">similar</button><button data-v="far" aria-pressed="false">very different</button></div>
    <div class="mo-rec" id="moPRec" aria-live="polite"></div>
  </div>
  <h4>Checking a pretrained model</h4>
  <ul>
    <li><b>Preprocessing:</b> a pretrained model expects <b>its own</b> preprocessing: the same image size, the same normalisation (e.g. <code>keras.applications.resnet50.preprocess_input</code>), the same tokenizer and the same class IDs (COCO: 91 vs 80 IDs).</li>
    <li><b>Licence:</b> not every model may be used commercially (YOLOv8: AGPL).</li>
    <li><b>Domain shift:</b> a model only knows its training data. Everyday photos (COCO, ImageNet) help little with X-ray or microscope images, a model for daylight fails at night. Then retrain with data from the deployment environment.</li>
    <li><b>Size and latency:</b> does it run on the target hardware, in real time? (YOLOv8n vs YOLOv8x)</li>
    <li><b>Data quality:</b> clean labels often help more than a bigger model.</li>
  </ul>

  <h3 id="mo-speichern">Saving and loading</h3>
  <p>After training the model lives in memory. So that it can make predictions later (or on another computer), it is saved: architecture and parameters, with scikit-learn also the whole preprocessing.</p>
  <div class="tablewrap"><table>
    <tr><th>Framework</th><th>Save</th><th>Load</th><th>What is inside</th></tr>
    <tr><td><b>scikit-learn</b></td><td><code>joblib.dump(pipe, "model.joblib")</code></td><td><code>joblib.load("model.joblib")</code></td><td>The whole Python object (pipeline with scaler and model)</td></tr>
    <tr><td><b>Keras</b></td><td><code>model.save("model.keras")</code></td><td><code>keras.models.load_model("model.keras")</code></td><td>Architecture, weights, optimizer state</td></tr>
    <tr><td><b>PyTorch</b></td><td><code>torch.save(model.state_dict(), "model.pt")</code></td><td><code>model.load_state_dict(torch.load("model.pt", weights_only=True))</code></td><td>Only the weights; the architecture is your Python code</td></tr>
    <tr><td><b>Hugging Face</b></td><td><code>model.save_pretrained("folder")</code></td><td><code>AutoModel.from_pretrained("folder")</code></td><td>Weights (<code>.safetensors</code>), configuration, tokenizer</td></tr>
    <tr><td><b>ONNX</b></td><td>Export from PyTorch, Keras, scikit-learn</td><td>ONNX Runtime (Python, C#, JavaScript …)</td><td>Computation graph and weights, independent of the framework</td></tr>
  </table></div>
  <pre><code>import json, joblib, sklearn
from datetime import date

pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

joblib.dump(pipe, "model_v1.joblib")                  # the whole pipeline, not just the model
meta = {"version": "v1", "date": str(date.today()), "sklearn": sklearn.__version__,
        "features": list(X_train.columns), "seed": 42,
        "val_accuracy": 0.87, "baseline_accuracy": 0.61, "n_train": len(X_train)}
json.dump(meta, open("model_v1.json", "w"), indent=2)  # metadata next to it

pipe2 = joblib.load("model_v1.joblib")
assert (pipe2.predict(X_val) == pipe.predict(X_val)).all()   # check loading</code></pre>
  <p><b>Metadata</b> belong with the file: version, date, library versions, feature names in the right order, seed, metrics with baseline and amount of data. More detailed is a <b>model card</b>: what is the model meant for and what not, which data was it trained on, how good is it on which groups, which limits are known? Hugging Face shows one on every model page.</p>
  <div class="falle"><b>Pitfall</b><p><code>pickle</code> and <code>joblib</code> run code while loading. Loading someone else's <code>.pkl</code> or <code>.joblib</code> file is as risky as starting someone else's program. Only load your own or trusted files; for foreign weights there are <code>.safetensors</code> and <code>torch.load(…, weights_only=True)</code>. Also, a joblib file only reliably fits the same scikit-learn version (otherwise <code>InconsistentVersionWarning</code>), hence the version in the metadata.</p></div>

  <h3 id="mo-neu">Retraining: when and how</h3>
  <p>A model is a snapshot of its training data. The world keeps changing afterwards, and the model does not notice. This is called <b>drift</b>:</p>
  <ul>
    <li><b>Data drift</b> (covariate shift): the inputs are distributed differently. Example: a new sensor measures systematically higher, customers get younger, photos come from another camera.</li>
    <li><b>Concept drift</b>: the relationship between x and y changes. Example: after an interest rate rise, the same customer data mean a different credit risk; spam emails change their style.</li>
    <li><b>New classes or new questions</b>: a new product should be recognised that did not exist at training time. Then the model (at least the output layer) has to be adapted.</li>
  </ul>
  <p>You detect drift by comparing the <b>distribution of the inputs</b> in use with that of the training data (means, histograms, share of unknown categories) and, as soon as the true answers are known, by <b>recomputing the metric</b> continuously.</p>
  <div class="tablewrap"><table>
    <tr><th>Variant</th><th>How</th><th>Good when</th><th>Risk</th></tr>
    <tr><td><b>Completely new</b></td><td>Same pipeline, new <code>fit</code> on old + new data</td><td>Classical models, training takes minutes</td><td>Old data that no longer hold pull the model back</td></tr>
    <tr><td><b>New data only</b></td><td>New <code>fit</code> on a recent time window</td><td>Strong concept drift, old data are outdated</td><td>Forgets rare cases that only occurred in old data</td></tr>
    <tr><td><b>Keep training</b></td><td>Continue from the saved model: <code>partial_fit</code>, <code>warm_start=True</code>, for networks <code>fit</code> with a small learning rate</td><td>Large networks, continuous new data</td><td><b>Catastrophic forgetting</b>: the network unlearns old things when it only sees new ones</td></tr>
    <tr><td><b>New head only</b></td><td>Keep the base, new output layer (e.g. for a new class)</td><td>New classes, the base is good</td><td>The base learns nothing new</td></tr>
  </table></div>
  <div class="demo" id="moDriftDemo">
    <div class="tag">Demo</div><h4>Drift: an old model gets worse</h4>
    <p class="hint">The model (logistic regression) was trained on the data of «month 0». Move time to the right: the points shift (data drift), and the boundary between the classes rotates (concept drift). Then retrain and compare.</p>
    <div class="ctl"><label for="moDr">Time (months since training)</label><input type="range" id="moDr" min="0" max="12" step="1" value="9"><output id="moDrO"></output></div>
    <div class="btnrow" id="moDrMode" role="group" aria-label="Retrain"><button data-v="old" class="pri" aria-pressed="true">keep the old model</button><button data-v="new" aria-pressed="false">retrain: current data only</button><button data-v="all" aria-pressed="false">retrain: old + current data</button></div>
    <svg class="plot" id="moDrSvg" viewBox="0 0 400 300" role="img" aria-label="Points of two classes with the boundary of the old and the new model"></svg>
    <div class="stats"><span>Old model, current data <b id="moAccOld"></b></span><span>Chosen model, current data <b id="moAccNew"></b></span><span>Chosen model, data of month 0 <b id="moAccPast"></b></span><span>Baseline <b>0.50</b></span></div>
    <p class="hint" id="moDrMsg"></p>
  </div>
  <p>The comparison follows the same rule as the first training: the new version must be better on <b>the same test data with the same metric</b> as the old one, otherwise the old one stays. Two test sets make sense: a fixed one that never changes (checks whether old things were forgotten), and a recent one (checks whether the drift is handled).</p>
  <div class="merk"><b>Key point</b><p>Every model ages. Monitor inputs and metrics in use, retrain with the same pipeline on drift, check the new version against the old one on fixed and recent test data and only then swap. The old version stays saved so you can switch back (rollback).</p></div>
  <div class="falle"><b>Pitfall</b><p>Throwing the test data into the training data when retraining («we have more data now»). Then there is no honest measurement left. Likewise: feedback loops. If the model decides which cases get a label at all (e.g. only approved loans show whether they are repaid), the new training only sees the cases the old model let through.</p></div>

  <h4>Terms</h4>
  <div class="tablewrap"><table>
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td><b>Inference</b></td><td>Applying the finished model (<code>predict</code>) without changing the parameters</td></tr>
    <tr><td><b>Checkpoint</b></td><td>Snapshot of the weights during training, e.g. the best epoch (<code>ModelCheckpoint</code>)</td></tr>
    <tr><td><b>Weights</b></td><td>The parameters of a network; «pretrained weights» means the learned numbers of someone else's training</td></tr>
    <tr><td><b>Model card</b></td><td>Short description of a model: purpose, data, metrics, limits, licence</td></tr>
    <tr><td><b>Model registry</b></td><td>Store for model versions with metadata and status (e.g. MLflow): which version runs, which is archived</td></tr>
    <tr><td><b>Drift</b></td><td>The data (data drift) or the relationship (concept drift) change after training</td></tr>
    <tr><td><b>Rollback</b></td><td>Switching back to the previous model version when the new one is worse</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>A model is only finished when another person can load it, understand it and retrain it the same way with new data. That takes pipeline, metadata, seed, versions and a model card, not just a file of weights.</p></div>`);


  LernApp.register({
    id: 'uebersicht',
    order: 95,
    nav: t('Übersicht & Praxis', 'Overview & practice'),
    title: t('Übersicht und Praxis: vom Problem zum Modell im Einsatz', 'Overview and practice: from the problem to a model in use'),
    kicker: t('Zum Schluss · Vorgehen, Praxis, alle Modelle', 'To finish · approach, practice, all models'),
    summary: t('Vorgehen bei einem neuen ML-Problem mit Checkliste, was ein Modell ist, vortrainierte Modelle, speichern und laden, Drift und neu trainieren, Steckbriefe aller Modelle von der linearen Regression bis zu Stable Diffusion, Checklisten der Strategien und eine Entscheidungshilfe', 'How to approach a new ML problem with a checklist, what a model is, pretrained models, saving and loading, drift and retraining, profiles of all models from linear regression to Stable Diffusion, strategy checklists and a decision guide'),
    html: `
  <p>${t('Das letzte Kapitel verbindet alles: zuerst das Vorgehen bei einem neuen ML-Problem mit Ablauf, Do &amp; Don’t und Checkliste, dann die Praxis rund um ein Modell (was ein Modell ist, woher es kommt, speichern und laden, neu trainieren), zum Schluss Steckbriefe aller Modelle und Checklisten der Strategien.', 'The last chapter ties everything together: first how to approach a new ML problem with a workflow, Do &amp; Don’t and a checklist, then the practice around a model (what a model is, where it comes from, saving and loading, retraining), finally profiles of all models and strategy checklists.')}</p>
  <p>${t('Diese Seite fasst die Kapitel <a href="#ml">Supervised ML</a>, <a href="#klass">Klassifikation</a>, <a href="#unsup">Unsupervised</a>, <a href="#nn">Neural Networks</a>, <a href="#cnn">CNN</a>, <a href="#cv">Image Processing</a>, <a href="#det">Object Detection</a> und <a href="#gen">Generative Models</a> zum Lernen zusammen. Zu jedem Modell gibt es einen Steckbrief, zu jeder Strategie eine kurze Checkliste. Über «ausführlich →» kommst du zur Erklärung mit Demo, über «Beispiele →» zu einem Notebook mit lauffähigem Code (lokal mit Jupyter oder in Google Colab), wo es eines gibt.', 'This page summarises the chapters <a href="#ml">Supervised ML</a>, <a href="#klass">Classification</a>, <a href="#unsup">Unsupervised</a>, <a href="#nn">Neural Networks</a>, <a href="#cnn">CNN</a>, <a href="#cv">Image Processing</a>, <a href="#det">Object Detection</a> and <a href="#gen">Generative Models</a> for revision. Each model has a profile, each strategy a short checklist. “in detail →” takes you to the explanation with a demo, “Examples →” to a notebook with runnable code (locally with Jupyter or in Google Colab) where there is one.')}</p>

${vorgehen}
${praxis}
  <h3 id="ue-wahl">${t('Welches Modell wann?', 'Which model when?')}</h3>
  <div class="ue-tree">
    <div class="ue-q">${t('Gibt es eine Zielspalte <code>y</code> mit der richtigen Antwort?', 'Is there a target column <code>y</code> with the right answer?')}</div>
    <div class="ue-branches">
      <div class="ue-b"><b>${t('Ja → Supervised', 'Yes → Supervised')}</b>
        <div class="ue-q">${t('Ist <code>y</code> eine Zahl oder eine Klasse?', 'Is <code>y</code> a number or a class?')}</div>
        <div class="ue-leaf">${t('<b>Zahl → Regression</b>Start: <a href="#v-linreg">Lineare Regression</a>. Overfitting → <a href="#v-ridge">Ridge</a>/<a href="#v-lasso">Lasso</a>. Korrelierte Merkmale und Auswahl → <a href="#v-elastic">ElasticNet</a>. Gebogen → <a href="#v-poly">Polynom</a>, <a href="#v-rf">Random Forest</a>, <a href="#v-gb">Gradient Boosting</a>.', '<b>Number → Regression</b>Start: <a href="#v-linreg">linear regression</a>. Overfitting → <a href="#v-ridge">Ridge</a>/<a href="#v-lasso">Lasso</a>. Correlated features and selection → <a href="#v-elastic">ElasticNet</a>. Curved → <a href="#v-poly">polynomial</a>, <a href="#v-rf">Random Forest</a>, <a href="#v-gb">Gradient Boosting</a>.')}</div>
        <div class="ue-leaf">${t('<b>Klasse → Klassifikation</b>Start: <a href="#v-logreg">Logistische Regression</a>. Erklärbar → <a href="#v-tree">Entscheidungsbaum</a>. Sehr schnell, wenig Daten oder Text → <a href="#v-nb">Naive Bayes</a>. Beste Leistung auf Tabellen → <a href="#v-rf">Random Forest</a>, <a href="#v-gb">Gradient Boosting</a>. Krumme Grenzen → <a href="#v-knn">kNN</a> (wenige Merkmale) oder <a href="#v-svm">SVM</a> mit Kernel (auch viele Merkmale).', '<b>Class → Classification</b>Start: <a href="#v-logreg">logistic regression</a>. Explainable → <a href="#v-tree">decision tree</a>. Very fast, little data or text → <a href="#v-nb">Naive Bayes</a>. Best performance on tables → <a href="#v-rf">Random Forest</a>, <a href="#v-gb">Gradient Boosting</a>. Curved boundaries → <a href="#v-knn">kNN</a> (few features) or <a href="#v-svm">SVM</a> with a kernel (also many features).')}</div>
        <div class="ue-leaf">${t('<b>Bilder statt Tabelle → Deep Learning</b>Bild → Klasse: <a href="#v-transfer">Transfer Learning</a> (ResNet, MobileNet), eigenes <a href="#v-cnn">CNN</a> nur mit vielen Bildern. Bild → besseres Bild: <a href="#v-filter">klassischer Filter</a> als Baseline, dann <a href="#v-unet">U-Net</a> oder vortrainierter Transformer (<a href="#v-restormer">SwinIR, Restormer</a>). Was ist wo: <a href="#v-yolo">YOLO</a> (schnell), <a href="#v-frcnn">Faster R-CNN</a> (genau). Klasse pro Pixel: <a href="#v-unet">U-Net</a> mit eigenen Labels, <a href="#v-sam">SAM</a> ohne Training. Tabellen mit sehr vielen Daten: <a href="#v-mlp">MLP</a> möglich, <a href="#v-gb">Gradient Boosting</a> meist gleich gut.', '<b>Images instead of a table → Deep learning</b>Image → class: transfer learning (ResNet, MobileNet), your own <a href="#v-cnn">CNN</a> only with many images. Image → better image: <a href="#v-filter">classical filter</a> as the baseline, then <a href="#v-unet">U-Net</a> or a pretrained transformer (<a href="#v-restormer">SwinIR, Restormer</a>). What is where: <a href="#v-yolo">YOLO</a> (fast), <a href="#v-frcnn">Faster R-CNN</a> (accurate). Class per pixel: <a href="#v-unet">U-Net</a> with own labels, <a href="#v-sam">SAM</a> without training. Tables with very much data: <a href="#v-mlp">MLP</a> possible, gradient boosting usually as good.')}</div>
      </div>
      <div class="ue-b"><b>${t('Nein → Unsupervised', 'No → Unsupervised')}</b>
        <div class="ue-q">${t('Was willst du finden?', 'What do you want to find?')}</div>
        <div class="ue-leaf">${t('<b>Gruppen → Clustering</b>Runde Gruppen, k bekannt → <a href="#v-kmeans">k-Means</a>. Beliebige Form, Ausreisser → <a href="#v-dbscan">DBSCAN</a>. Struktur auf mehreren Ebenen → <a href="#v-hier">Hierarchisch</a>. Weiche Zuordnung → <a href="#v-gmm">GMM</a>.', '<b>Groups → Clustering</b>Round groups, k known → <a href="#v-kmeans">k-Means</a>. Any shape, outliers → <a href="#v-dbscan">DBSCAN</a>. Structure on several levels → hierarchical. Soft assignment → <a href="#v-gmm">GMM</a>.')}</div>
        <div class="ue-leaf">${t('<b>Ausreisser → Anomalien</b><a href="#v-iforest">Isolation Forest</a> (oder Rauschen bei <a href="#v-dbscan">DBSCAN</a>).', '<b>Outliers → Anomalies</b><a href="#v-iforest">Isolation Forest</a> (or noise in <a href="#v-dbscan">DBSCAN</a>).')}</div>
        <div class="ue-leaf">${t('<b>Weniger Merkmale oder ein 2D-Bild → Dimensionsreduktion</b>Verdichten und weiterrechnen → <a href="#v-pca">PCA</a>. Nur anschauen → <a href="#v-tsne">t-SNE</a>, <a href="#v-umap">UMAP</a>.', '<b>Fewer features or a 2D picture → Dimensionality reduction</b>Compress and keep computing → <a href="#v-pca">PCA</a>. Just look → <a href="#v-tsne">t-SNE</a>, <a href="#v-umap">UMAP</a>.')}</div>
        <div class="ue-leaf">${t('<b>Neue Bilder erzeugen → Generative Models</b>Komprimieren, Anomalien → <a href="#v-ae">Autoencoder</a>. Ziehen und interpolieren, stabil → <a href="#v-vae">VAE</a>. Echte Wahrscheinlichkeit → <a href="#v-pixelcnn">PixelCNN</a>. Scharf und schnell, Bild zu Bild → <a href="#v-gan">GAN</a>. Beste Qualität und Vielfalt → <a href="#v-diffusion">Diffusion</a>. Text zu Bild → vortrainiertes <a href="#v-sd">Stable Diffusion</a>.', '<b>Generate new images → Generative models</b>Compress, anomalies → autoencoder. Sample and interpolate, stable → <a href="#v-vae">VAE</a>. Real probability → <a href="#v-pixelcnn">PixelCNN</a>. Sharp and fast, image to image → <a href="#v-gan">GAN</a>. Best quality and diversity → diffusion. Text to image → pretrained <a href="#v-sd">Stable Diffusion</a>.')}</div>
      </div>
    </div>
  </div>
  <div class="merk">${t('<b>Merksatz</b><p>Beginne immer mit einem einfachen Modell als Baseline. Ein komplexeres Modell lohnt sich nur, wenn es auf der Validierung klar besser ist.</p>', '<b>Key point</b><p>Always start with a simple model as a baseline. A more complex model is only worth it if it is clearly better on the validation set.</p>')}</div>
`,
    notebooks: [
      { file: 'beispiele/09_Modelle_Praxis.ipynb', desc: t(`Pipeline gegen Baseline, speichern mit joblib und Metadaten, laden und prüfen, was ohne Scaler passiert, Drift simulieren, auf drei Arten neu trainieren und auf festen und aktuellen Testdaten vergleichen, Weitertrainieren mit <code>partial_fit</code>, Model Card.`, `Pipeline against a baseline, saving with joblib and metadata, loading and checking, what happens without the scaler, simulating drift, retraining in three ways and comparing on fixed and recent test data, continuing training with <code>partial_fit</code>, model card.`) },
    ],
    init() {
      LernApp.demos.modell();
      // Clickable workflow figure (same pattern as the chapter figures)
      const fig = document.getElementById('ueFlowFig');
      if (fig) {
        const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
        let cur = null;
        const close = function () {
          panel.hidden = true; cur = null;
          steps.forEach(function (g) { g.classList.remove('on'); g.setAttribute('aria-expanded', 'false'); });
        };
        const open = function (k) {
          if (cur === k) { close(); return; }
          const d = VS[k]; if (!d) return;
          cur = k;
          panel.querySelector('.ab-dh b').textContent = d[0];
          panel.querySelector('.ab-db').innerHTML = d[1];
          panel.querySelector('.ab-dl').innerHTML = d[2].map(function (l) { return '<a href="' + l[1] + '">' + l[0] + ' →</a>'; }).join('');
          panel.hidden = false;
          steps.forEach(function (g) { const on = g.getAttribute('data-s') === k; g.classList.toggle('on', on); g.setAttribute('aria-expanded', on ? 'true' : 'false'); });
        };
        steps.forEach(function (g) {
          g.addEventListener('click', function () { open(g.getAttribute('data-s')); });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g.getAttribute('data-s')); } });
        });
        panel.querySelector('.ab-x').addEventListener('click', close);
      }
      // Checklist: ticks kept under 'cas-ml-checklist' as a JSON list of checkbox ids
      const KEY = 'cas-ml-checklist';
      const boxes = Array.prototype.slice.call(document.querySelectorAll('#ueChecks input[type=checkbox]'));
      const prog = document.getElementById('ueCheckProg');
      if (!boxes.length || !prog) return;
      let done = [];
      try { done = JSON.parse(LernApp.store(KEY) || '[]'); } catch (e) { done = []; }
      if (!Array.isArray(done)) done = [];
      const render = function () {
        const n = boxes.filter(function (b) { return b.checked; }).length;
        prog.textContent = t(n + ' von ' + boxes.length + ' erledigt', n + ' of ' + boxes.length + ' done');
      };
      const save = function () {
        LernApp.store(KEY, JSON.stringify(boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.id; })));
        render();
      };
      boxes.forEach(function (b) { b.checked = done.indexOf(b.id) >= 0; b.addEventListener('change', save); });
      document.getElementById('ueCheckReset').addEventListener('click', function () {
        boxes.forEach(function (b) { b.checked = false; });
        save();
      });
      render();
    },
  });
})();
