/*
 * LernApp core. Modules register themselves with LernApp.register({...}) and
 * this file renders navigation, overview cards, chapters, Python exercises,
 * self-test questions and the free Python playground.
 *
 * Module fields:
 *   id        unique id, used as anchor (#id)
 *   order     sort position (smaller = earlier)
 *   nav       short label for the top navigation
 *   title     chapter heading (HTML allowed)
 *   kicker    small line above the heading, e.g. "Modul 1 · Freitag 16.10"
 *   summary   one short line for the overview card
 *   html      chapter content (HTML string)
 *   exercises optional [{ t, task, start, check, sol }] Python exercises
 *   quiz      optional [{ q, a }] self-test questions (HTML allowed)
 *   notebooks optional [{ file, desc }] files in lernapp/notebooks
 *   nbExercises optional notebook file name; its exercises (assets/notebook-data.js,
 *             generated from the notebook) are shown at the end of the chapter and run
 *             with Pyodide (real pandas / scikit-learn)
 *   init()    optional, called once after the chapter is in the page
 *
 * Language: LernApp.lang is 'de' (default) or 'en', chosen with the DE/EN switch in the
 * header. English texts live in modules/en/<id>.js and call LernApp.translate(id, {...})
 * with the fields to replace (nav, title, kicker, summary, html, quiz, notebooks,
 * exercises as [{ t, task, ... }] merged by position). Demo code picks its strings with
 * LernApp.t('deutsch', 'english'). Static page text uses a data-en attribute.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fmt = (v, d) => Number(v).toFixed(d);
  const modules = [];
  const EN = {};
  let LANG = 'de';
  const t = (de, en) => (LANG === 'en' && en !== undefined ? en : de);
  const SKULPT = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/';
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';

  window.LernApp = {
    $: $,
    fmt: fmt,
    modules: modules,
    register: function (mod) {
      if (!mod || !mod.id || !mod.title) {
        console.error('LernApp.register: id and title are required', mod);
        return;
      }
      if (modules.some((m) => m.id === mod.id)) {
        console.error('LernApp.register: duplicate module id', mod.id);
        return;
      }
      modules.push(mod);
    },
    translate: function (id, fields) { EN[id] = fields; },
    t: t,
    lang: 'de',
  };

  const SRV = location.protocol.startsWith('http');
  let saveT = null;
  function srvPush() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try {
        const o = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          o[k] = localStorage.getItem(k);
        }
        fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).catch(() => {});
      } catch (e) {}
    }, 500);
  }
  if (SRV) {
    try {
      const x = new XMLHttpRequest();
      x.open('GET', '/api/state', false);
      x.send();
      if (x.status === 200) {
        const o = JSON.parse(x.responseText);
        for (const k in o) localStorage.setItem(k, o[k]);
      }
    } catch (e) {}
  }

  // ?lang=en or ?lang=de in the address wins over the stored choice (for links and tests)
  const qLang = (location.search.match(/[?&]lang=(de|en)\b/) || [])[1];
  try { if ((qLang || localStorage.getItem('cas-ml-lang')) === 'en') LANG = 'en'; } catch (e) { if (qLang === 'en') LANG = 'en'; }
  LernApp.lang = LANG;
  document.documentElement.lang = LANG;

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
      if (SRV) srvPush();
    } catch (e) {
      return null;
    }
    return null;
  }

  /* ---------- Python runner (Skulpt, loaded on first use) ---------- */
  let skPromise = null;

  function loadScript(src) {
    return new Promise(function (ok, bad) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = function () {
        bad(new Error(t('Der Python-Interpreter konnte nicht geladen werden. Prüfe die Internetverbindung und versuche es nochmals.', 'The Python interpreter could not be loaded. Check your internet connection and try again.')));
      };
      document.head.appendChild(s);
    });
  }

  function loadSk() {
    if (!skPromise) {
      skPromise = loadScript(SKULPT + 'skulpt.min.js').then(function () {
        return loadScript(SKULPT + 'skulpt-stdlib.js');
      });
      skPromise.catch(function () {
        skPromise = null;
      });
    }
    return skPromise;
  }

  function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) throw "File not found: '" + x + "'";
    return Sk.builtinFiles['files'][x];
  }

  const ERR_HINTS = [
    [/^SyntaxError|^IndentationError|^ParseError/, 'Der Code ist grammatisch nicht korrekt. Prüfe Doppelpunkte nach if/for/def, Klammern, Anführungszeichen und die Einrückung.', 'The code is not valid Python. Check the colons after if/for/def, brackets, quotes and indentation.'],
    [/^NameError/, 'Ein Name ist unbekannt. Tippfehler? Variable vor der Verwendung zuweisen? Modul mit import geladen?', 'A name is unknown. A typo? Was the variable assigned before use? Was the module imported?'],
    [/^TypeError/, 'Ein Wert hat nicht den passenden Typ, zum Beispiel Text plus Zahl, oder eine Funktion bekommt falsche Argumente.', 'A value has the wrong type, for example text plus a number, or a function gets the wrong arguments.'],
    [/^IndexError/, 'Der Index liegt ausserhalb der Liste. Der erste Eintrag hat Index 0, der letzte len(liste) - 1.', 'The index is outside the list. The first item has index 0, the last one len(list) - 1.'],
    [/^KeyError/, 'Dieser Schlüssel existiert nicht im Dictionary oder DataFrame. Gross-/Kleinschreibung prüfen.', 'This key does not exist in the dictionary or DataFrame. Check upper and lower case.'],
    [/^ValueError/, 'Der Typ des Werts stimmt, der Inhalt aber nicht, zum Beispiel int("abc").', 'The value has the right type but the wrong content, for example int("abc").'],
    [/^ZeroDivisionError/, 'Division durch 0. Prüfe den Nenner.', 'Division by 0. Check the denominator.'],
    [/^AttributeError/, 'Dieses Objekt hat diese Methode oder dieses Attribut nicht. Tippfehler oder falscher Typ?', 'This object has no such method or attribute. A typo or the wrong type?'],
    [/^ImportError|^ModuleNotFoundError/, 'Dieses Modul gibt es im Browser-Interpreter nicht. Die Übungen laufen nur mit den Grundlagen von Python.', 'This module is not available in the browser interpreter. The exercises only use basic Python.'],
    [/^TimeLimitError|execution/i, 'Das Programm läuft zu lange, vermutlich eine Endlosschleife.', 'The program runs too long, probably an endless loop.']
  ];

  /* Returns {title, msg, line, src, hint, check} for a Skulpt exception. `check` is true when the
     failure comes from the appended check code (the task is not solved yet), not from the user's code. */
  function formatErr(err, userLines, userCode) {
    const raw = String(err && err.toString ? err.toString() : err);
    let type = (err && err.tp$name) || '';
    let msg = raw;
    const head = raw.match(/^([A-Za-z]+(?:Error|Exception|Exit)):\s*([\s\S]*)$/);
    if (head) { type = type || head[1]; msg = head[2]; }
    let line = null;
    const tb = err && err.traceback;
    if (tb && tb.length) {
      for (let i = tb.length - 1; i >= 0; i--) {
        if (tb[i] && tb[i].lineno && /stdin/.test(String(tb[i].filename || '<stdin>'))) { line = Number(tb[i].lineno); break; }
      }
    }
    msg = msg.replace(/\s+on line (\d+)(\s+of\s+\S+)?\.?$/, function (all, n) {
      if (line === null) line = Number(n);
      return '';
    });
    if (type === 'AssertionError' && (line === null || line > userLines)) {
      return { check: true, title: t('Noch nicht richtig', 'Not right yet'), msg: msg || t('Das Ergebnis stimmt noch nicht mit der Aufgabe überein.', 'The result does not match the task yet.') };
    }
    const inUser = line !== null && line <= userLines;
    const lines = (userCode || '').split('\n');
    const full = (type ? type : t('Fehler', 'Error')) + (msg ? ': ' + msg : '');
    let hint = '';
    for (let i = 0; i < ERR_HINTS.length; i++) if (ERR_HINTS[i][0].test(full)) { hint = t(ERR_HINTS[i][1], ERR_HINTS[i][2]); break; }
    return {
      check: false,
      title: type || t('Fehler', 'Error'),
      msg: msg || t('Unbekannter Fehler', 'Unknown error'),
      line: inUser ? line : null,
      src: inUser ? lines[line - 1] : null,
      hint: hint
    };
  }

  function renderErr(e) {
    const esc = function (t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
    if (e.check) return '<b>❌ ' + esc(e.title) + '</b><div class="errmsg">' + esc(e.msg) + '</div>';
    return '<b>❌ ' + esc(e.title) + (e.line ? t(' in Zeile ', ' in line ') + e.line : '') + '</b>' +
      '<div class="errmsg">' + esc(e.msg) + '</div>' +
      (e.src !== null && e.src !== undefined ? '<pre class="errsrc">' + e.line + ' │ ' + esc(e.src) + '</pre>' : '') +
      (e.hint ? '<div class="errhint">💡 ' + esc(e.hint) + '</div>' : '');
  }

  function runPy(code, userLines, userCode) {
    let buf = '';
    return loadSk()
      .then(function () {
        Sk.configure({ output: function (t) { buf += t; }, read: builtinRead, __future__: Sk.python3, execLimit: 5000 });
        return Sk.misceval.asyncToPromise(function () {
          return Sk.importMainWithBody('<stdin>', false, code, true);
        });
      })
      .then(
        function () { return { ok: true, out: buf }; },
        function (err) { return { ok: false, out: buf, err: formatErr(err, userLines, userCode) }; }
      );
  }

  /* ---------- Pyodide runner for notebook exercises (real pandas / scikit-learn) ---------- */
  let pyPromise = null;
  let pyQueue = Promise.resolve();
  let pyOut = '';

  const PY_HELPER = [
    'import ast, base64, io',
    'import matplotlib',
    'matplotlib.use("agg")',
    '_nb_shown = []',
    'def _nb_display(*objs):',
    '    for o in objs:',
    '        if hasattr(o, "_repr_html_") and o._repr_html_():',
    '            _nb_shown.append(("html", o._repr_html_()))',
    '        else:',
    '            _nb_shown.append(("text", repr(o)))',
    'def _nb_run(src, ns):',
    '    del _nb_shown[:]',
    '    ns["display"] = _nb_display',
    '    tree = ast.parse(src)',
    '    last = None',
    '    if tree.body and isinstance(tree.body[-1], ast.Expr):',
    '        last = ast.Expression(tree.body.pop().value)',
    '    exec(compile(tree, "<cell>", "exec"), ns)',
    '    if last is not None:',
    '        val = eval(compile(last, "<cell>", "eval"), ns)',
    '        if val is not None:',
    '            _nb_display(val)',
    'def _nb_figs():',
    '    import matplotlib.pyplot as plt',
    '    res = []',
    '    for num in plt.get_fignums():',
    '        buf = io.BytesIO()',
    '        plt.figure(num).savefig(buf, format="png", dpi=100, bbox_inches="tight")',
    '        res.append(base64.b64encode(buf.getvalue()).decode())',
    '    plt.close("all")',
    '    return res',
  ].join('\n');

  function loadPy() {
    if (!pyPromise) {
      pyPromise = loadScript(PYODIDE + 'pyodide.js')
        .then(function () { return window.loadPyodide({ indexURL: PYODIDE }); })
        .then(function (py) {
          py.setStdout({ batched: function (t) { pyOut += t + '\n'; } });
          py.setStderr({ batched: function (t) { pyOut += t + '\n'; } });
          return py;
        });
      pyPromise.catch(function () { pyPromise = null; });
    }
    return pyPromise;
  }

  function pyErr(e) {
    const lines = String(e && e.message ? e.message : e).trim().split('\n');
    return lines[lines.length - 1].replace(/^AssertionError:\s*/, '') || t('Unbekannter Fehler', 'Unknown error');
  }

  // One shared namespace per notebook (like a kernel); runs are queued one after the other.
  function runNb(nbKey, setup, code, status) {
    const job = pyQueue.then(function () {
      status(t('Python wird geladen (beim ersten Mal rund 1 Minute, danach schnell) …', 'Loading Python (about 1 minute the first time, fast afterwards) …'));
      return loadPy().then(function (py) {
        const nb = (runNb.spaces = runNb.spaces || {});
        let ready = Promise.resolve();
        if (!nb[nbKey]) {
          status(t('Pakete werden geladen …', 'Loading packages …'));
          ready = py.loadPackagesFromImports(setup).then(function () {
            py.runPython(PY_HELPER);
            nb[nbKey] = py.globals.get('dict')();
            pyOut = '';
            py.globals.get('_nb_run')(setup, nb[nbKey]);
          });
        }
        return ready.then(function () {
          status(t('Läuft …', 'Running …'));
          pyOut = '';
          const res = { ok: true, out: '', shown: [], figs: [] };
          try {
            py.globals.get('_nb_run')(code, nb[nbKey]);
            res.shown = py.globals.get('_nb_shown').toJs().map(function (t) { return { kind: t[0], val: t[1] }; });
          } catch (e) {
            res.ok = false;
            res.err = pyErr(e);
          }
          res.figs = py.globals.get('_nb_figs')().toJs();
          res.out = pyOut;
          return res;
        });
      });
    });
    pyQueue = job.catch(function () {});
    return job.catch(function (e) {
      return { ok: false, out: '', shown: [], figs: [], err: pyErr(e) };
    });
  }

  /* ---------- Rendering ---------- */
  function buildSection(m) {
    const sec = document.createElement('section');
    sec.id = m.id;
    let html = '<div class="kicker">' + (m.kicker || '') + '</div><h2>' + m.title + '</h2>' +
      (LANG === 'en' && !EN[m.id] ? '<p class="note">This chapter is not available in English yet. It is shown in German.</p>' : '') + (m.html || '');

    (m.notebooks || []).forEach(function (nb) {
      html += '<div class="merk"><b>' + t('Übungs-Notebook', 'Exercise notebook') + '</b><p><code class="nbfile">lernapp/notebooks/' + nb.file + '</code><br>' + nb.desc + '</p></div>';
    });
    if (m.exercises && m.exercises.length) {
      html += '<h3>' + t('Python-Übungen', 'Python exercises') + ' <span class="prog" id="prog-' + m.id + '"></span></h3>' +
        '<p class="note">' + t('Code ändern, «Ausführen» drücken, mit «Prüfen» kontrollieren. Beim ersten Ausführen lädt die Seite einmalig den Python-Interpreter (Skulpt, rund 1 MB). Er versteht die Grundlagen aus dem Kurs, aber nicht jede neue Python-Funktion.',
          'Change the code, press «Run», then «Check». The first run loads the Python interpreter once (Skulpt, about 1 MB). It understands the basics from the course, but not every newer Python feature.') + '</p>' +
        '<div class="exlist" id="ex-' + m.id + '"></div>';
    }
    if (m.nbExercises && window.NbData && window.NbData[m.nbExercises]) {
      const nbd = window.NbData[m.nbExercises];
      const nbf = '<code class="nbfile">lernapp/notebooks/' + m.nbExercises + '</code>';
      html += '<h3>' + t('Übungen', 'Exercises') + ' <span class="prog" id="prog-nb-' + m.id + '"></span></h3>' +
        '<p class="note">' + t('Dieselben ' + nbd.exercises.length + ' Aufgaben wie im Notebook ' + nbf + ': Code ändern (ersetze <code>...</code>), «Ausführen», dann «Prüfen». Die Aufgaben bauen aufeinander auf, am besten der Reihe nach lösen. Läuft im Browser mit echtem Python (Pyodide, einmalig grosser Download).',
          'The same ' + nbd.exercises.length + ' tasks as in the notebook ' + nbf + ' (task texts in German, as in the notebook): change the code (replace <code>...</code>), «Run», then «Check». The tasks build on each other, so solve them in order. Runs in the browser with real Python (Pyodide, one large download).') +
        ' <button data-a="reset-env" id="env-' + m.id + '">' + t('Umgebung neu starten', 'Restart environment') + '</button></p>' +
        '<div class="exlist" id="nbex-' + m.id + '"></div>';
    }
    if (m.quiz && m.quiz.length) {
      html += '<h3>' + t('Selbsttest', 'Self-test') + '</h3><p class="note">' + t('Antworte zuerst im Kopf, dann klappe auf.', 'Answer in your head first, then open the answer.') + '</p>' +
        m.quiz.map(function (it) {
          return '<details class="q"><summary>' + it.q + '</summary><div class="a">' + it.a + '</div></details>';
        }).join('');
    }
    sec.innerHTML = html;
    return sec;
  }

  function renderExercises(m) {
    const list = $('ex-' + m.id);
    if (!list) return;
    const total = m.exercises.length;

    function updateProgress() {
      let n = 0;
      for (let i = 0; i < total; i++) if (store('cas-ml-' + m.id + '-' + (i + 1) + '-ok') === '1') n++;
      const el = $('prog-' + m.id);
      if (el) el.textContent = t(n + ' von ' + total + ' gelöst', n + ' of ' + total + ' solved');
    }

    m.exercises.forEach(function (ex, i) {
      const id = 'ex-' + m.id + '-' + (i + 1);
      const key = 'cas-ml-' + m.id + '-' + (i + 1);
      const card = document.createElement('div');
      card.className = 'ex';
      card.innerHTML =
        '<h4>' + (i + 1) + ' · ' + ex.t + '<span class="done"></span></h4><div class="task">' + ex.task + '</div>' +
        '<label for="' + id + '" style="display:block;font-size:13px;color:var(--muted)">' + t('Dein Code', 'Your code') + '</label>' +
        '<textarea id="' + id + '" class="code" rows="' + (ex.start.split('\n').length + 1) + '" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>' +
        '<div class="btnrow"><button class="pri" data-a="run">' + t('Ausführen', 'Run') + '</button><button data-a="chk">' + t('Prüfen', 'Check') + '</button><button data-a="rst">' + t('Zurücksetzen', 'Reset') + '</button><button data-a="sol">' + t('Lösung zeigen', 'Show solution') + '</button></div>' +
        '<pre class="out" hidden></pre><div class="verdict" aria-live="polite"></div><div class="solbox" hidden><pre><code></code></pre></div>';
      const ta = card.querySelector('textarea');
      const out = card.querySelector('.out');
      const vd = card.querySelector('.verdict');
      const sb = card.querySelector('.solbox');
      const done = card.querySelector('.done');
      ta.value = store(key) || ex.start;
      sb.querySelector('code').textContent = ex.sol;
      if (store(key + '-ok') === '1') done.textContent = ' ✓';
      ta.addEventListener('input', function () { store(key, ta.value); });

      function exec(withCheck) {
        vd.className = 'verdict info';
        vd.textContent = t('Läuft …', 'Running …');
        out.hidden = true;
        const user = ta.value;
        const lines = user.split('\n').length;
        runPy(withCheck ? user + '\n\n' + ex.check + '\n' : user + '\n', lines, user).then(function (r) {
          out.hidden = !r.out;
          out.textContent = r.out.replace(/\n$/, '');
          if (r.ok) {
            if (withCheck) {
              vd.className = 'verdict good';
              vd.textContent = t('✅ Richtig!', '✅ Correct!');
              store(key + '-ok', '1');
              done.textContent = ' ✓';
              updateProgress();
            } else {
              vd.className = 'verdict info';
              vd.textContent = r.out
                ? t('Fertig. Mit «Prüfen» kontrollierst du die Lösung.', 'Done. Use «Check» to test your solution.')
                : t('Fertig, aber es wurde nichts ausgegeben. Mit «Prüfen» kontrollierst du die Lösung.', 'Done, but nothing was printed. Use «Check» to test your solution.');
            }
          } else {
            vd.className = 'verdict bad';
            vd.innerHTML = renderErr(r.err);
          }
        });
      }

      card.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          const a = b.dataset.a;
          if (a === 'run') exec(false);
          else if (a === 'chk') exec(true);
          else if (a === 'rst') {
            ta.value = ex.start;
            store(key, ex.start);
            out.hidden = true;
            vd.textContent = '';
            vd.className = 'verdict';
          } else {
            sb.hidden = !sb.hidden;
            b.textContent = sb.hidden ? t('Lösung zeigen', 'Show solution') : t('Lösung verbergen', 'Hide solution');
          }
        });
      });
      list.appendChild(card);
    });
    updateProgress();
  }

  function renderNbExercises(m) {
    const list = $('nbex-' + m.id);
    if (!list) return;
    const nbd = window.NbData[m.nbExercises];
    const nbKey = m.nbExercises;
    const total = nbd.exercises.length;

    function updateProgress() {
      let n = 0;
      for (let i = 0; i < total; i++) if (store('cas-ml-' + m.id + '-nb-' + (i + 1) + '-ok') === '1') n++;
      const el = $('prog-nb-' + m.id);
      if (el) el.textContent = t(n + ' von ' + total + ' gelöst', n + ' of ' + total + ' solved');
    }

    $('env-' + m.id).addEventListener('click', function () {
      if (runNb.spaces) delete runNb.spaces[nbKey];
      this.textContent = t('Umgebung neu gestartet ✓', 'Environment restarted ✓');
    });

    nbd.exercises.forEach(function (ex, i) {
      const id = 'nbex-' + m.id + '-' + (i + 1);
      const key = 'cas-ml-' + m.id + '-nb-' + (i + 1);
      const card = document.createElement('div');
      card.className = 'ex';
      card.innerHTML =
        '<h4>' + t('Aufgabe ', 'Task ') + (i + 1) + ' · ' + ex.t + '<span class="done"></span></h4><div class="task">' + ex.task + '</div>' +
        '<label for="' + id + '" style="display:block;font-size:13px;color:var(--muted)">' + t('Dein Code', 'Your code') + '</label>' +
        '<textarea id="' + id + '" class="code" rows="' + (ex.start.split('\n').length + 1) + '" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>' +
        '<div class="btnrow"><button class="pri" data-a="run">' + t('Ausführen', 'Run') + '</button><button data-a="chk">' + t('Prüfen', 'Check') + '</button><button data-a="rst">' + t('Zurücksetzen', 'Reset') + '</button><button data-a="sol">' + t('Lösung zeigen', 'Show solution') + '</button></div>' +
        '<pre class="out" hidden></pre><div class="rich"></div><div class="verdict" aria-live="polite"></div><div class="solbox" hidden><pre><code></code></pre></div>';
      const ta = card.querySelector('textarea');
      const out = card.querySelector('.out');
      const rich = card.querySelector('.rich');
      const vd = card.querySelector('.verdict');
      const sb = card.querySelector('.solbox');
      const done = card.querySelector('.done');
      ta.value = store(key) || ex.start;
      sb.querySelector('code').textContent = ex.sol;
      if (store(key + '-ok') === '1') done.textContent = ' ✓';
      ta.addEventListener('input', function () { store(key, ta.value); });

      function exec(withCheck) {
        vd.className = 'verdict info';
        out.hidden = true;
        rich.innerHTML = '';
        const code = withCheck ? ta.value + '\n\n' + ex.check + '\n' : ta.value + '\n';
        runNb(nbKey, nbd.setup, code, function (t) { vd.textContent = t; }).then(function (r) {
          out.hidden = !r.out;
          out.textContent = r.out.replace(/\n$/, '');
          r.shown.forEach(function (s) {
            const d = document.createElement(s.kind === 'html' ? 'div' : 'pre');
            if (s.kind === 'html') { d.className = 'tablewrap'; d.innerHTML = s.val; }
            else { d.className = 'out'; d.textContent = s.val; }
            rich.appendChild(d);
          });
          r.figs.forEach(function (b64) {
            const img = document.createElement('img');
            img.className = 'plot';
            img.alt = t('Diagramm', 'Chart');
            img.src = 'data:image/png;base64,' + b64;
            rich.appendChild(img);
          });
          if (r.ok) {
            if (withCheck) {
              vd.className = 'verdict good';
              vd.textContent = t('✅ Richtig!', '✅ Correct!');
              store(key + '-ok', '1');
              done.textContent = ' ✓';
              updateProgress();
            } else {
              vd.className = 'verdict info';
              vd.textContent = t('Fertig. Mit «Prüfen» kontrollierst du die Lösung.', 'Done. Use «Check» to test your solution.');
            }
          } else {
            vd.className = 'verdict bad';
            vd.textContent = '❌ ' + r.err;
          }
        });
      }

      card.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          const a = b.dataset.a;
          if (a === 'run') exec(false);
          else if (a === 'chk') exec(true);
          else if (a === 'rst') {
            ta.value = ex.start;
            store(key, ex.start);
            out.hidden = true;
            rich.innerHTML = '';
            vd.textContent = '';
            vd.className = 'verdict';
          } else {
            sb.hidden = !sb.hidden;
            b.textContent = sb.hidden ? t('Lösung zeigen', 'Show solution') : t('Lösung verbergen', 'Hide solution');
          }
        });
      });
      list.appendChild(card);
    });
    updateProgress();
  }

  function wirePlayground() {
    const btn = $('freeRun');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const o = $('freeOut');
      const code = $('freeCode').value;
      o.hidden = false;
      o.textContent = t('Läuft …', 'Running …');
      runPy(code + '\n', code.split('\n').length, code).then(function (r) {
        o.textContent = r.out.replace(/\n$/, '');
        if (!r.ok) {
          const e = r.err;
          o.textContent += (r.out ? '\n' : '') + '❌ ' + e.title + (e.line ? t(' in Zeile ', ' in line ') + e.line : '') + ': ' + e.msg +
            (e.src !== null && e.src !== undefined ? '\n  ' + e.line + ' │ ' + e.src : '') + (e.hint ? '\n💡 ' + e.hint : '');
        }
        if (!o.textContent) o.textContent = t('(keine Ausgabe)', '(no output)');
      });
    });
  }

  function wireNav() {
    const chips = $('chips');
    const links = Array.prototype.slice.call(chips.querySelectorAll('a'));
    const secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    function update() {
      let cur = 0;
      const y = window.scrollY + 120;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
      const on = links[cur];
      if (on) {
        const r = on.getBoundingClientRect();
        const cr = chips.getBoundingClientRect();
        if (r.left < cr.left || r.right > cr.right) chips.scrollLeft += r.left - cr.left - 16;
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function applyEn(m, e) {
    Object.keys(e).forEach(function (k) {
      if (k === 'exercises' && m.exercises) m.exercises = m.exercises.map(function (ex, i) { return Object.assign({}, ex, e.exercises[i] || {}); });
      else m[k] = e[k];
    });
  }

  function wireLang() {
    const head = document.querySelector('header.top');
    if (head) {
      head.insertAdjacentHTML('afterbegin', '<div class="langsw" role="group" aria-label="Sprache / Language">' +
        '<button type="button" data-l="de" lang="de">DE</button><button type="button" data-l="en" lang="en">EN</button></div>');
      head.querySelectorAll('.langsw button').forEach(function (b) {
        const on = b.dataset.l === LANG;
        b.className = on ? 'pri' : '';
        b.setAttribute('aria-pressed', on);
        b.addEventListener('click', function () {
          if (b.dataset.l === LANG) return;
          store('cas-ml-lang', b.dataset.l);
          location.reload();
        });
      });
    }
    if (LANG !== 'en') return;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.tagName === 'TEXTAREA') el.value = el.getAttribute('data-en');
      else el.innerHTML = el.getAttribute('data-en');
    });
    document.querySelectorAll('[data-en-label]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-en-label')); });
  }

  function start() {
    wireLang();
    if (LANG === 'en') modules.forEach(function (m) { if (EN[m.id]) applyEn(m, EN[m.id]); });
    const mods = modules.slice().sort(function (a, b) { return (a.order || 100) - (b.order || 100); });

    // Sub pages (e.g. mathe-kompakt.html) have no overview and no playground section.
    const hasOverview = !!$('ueberblick'), hasPlay = !!$('spielwiese');
    $('chips').innerHTML =
      (hasOverview ? '<a href="#ueberblick">' + t('Überblick', 'Overview') + '</a>' : '') +
      mods.map(function (m) { return '<a href="#' + m.id + '">' + (m.nav || m.title) + '</a>'; }).join('') +
      (hasPlay ? '<a href="#spielwiese">' + t('Üben', 'Practice') + '</a>' : '');

    if ($('toc')) {
      $('toc').innerHTML =
        mods.map(function (m) { return '<a href="#' + m.id + '"><b>' + (m.nav || m.title) + '</b><span>' + (m.summary || '') + '</span></a>'; }).join('') +
        '<a href="#spielwiese"><b>' + t('Üben', 'Practice') + '</b><span>' + t('Spielwiese und Notebooks', 'Playground and notebooks') + '</span></a>';
    }

    const host = $('modules');
    mods.forEach(function (m) { host.appendChild(buildSection(m)); });
    mods.forEach(function (m) {
      try {
        if (m.exercises && m.exercises.length) renderExercises(m);
        if (m.nbExercises) renderNbExercises(m);
        if (typeof m.init === 'function') m.init();
      } catch (e) {
        console.error('Module "' + m.id + '" failed to start', e);
        const sec = $(m.id);
        if (sec) sec.insertAdjacentHTML('beforeend', '<div class="falle"><b>' + t('Fehler', 'Error') + '</b><p>' + t('Dieses Kapitel konnte nicht vollständig geladen werden', 'This chapter could not be loaded completely') + ' (' + m.id + ').</p></div>');
      }
    });

    wirePlayground();
    wireNav();
    if (location.hash.length > 1) {
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
