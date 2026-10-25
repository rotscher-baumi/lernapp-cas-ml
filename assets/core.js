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
 *   init()    optional, called once after the chapter is in the page
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fmt = (v, d) => Number(v).toFixed(d);
  const modules = [];
  const SKULPT = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/';

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
  };

  /* Optional persistence: when served over http(s) by server.py, mirror localStorage to /api/state */
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
        bad(new Error('Der Python-Interpreter konnte nicht geladen werden. Prüfe die Internetverbindung und versuche es nochmals.'));
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

  function formatErr(err, userLines) {
    let m = String(err && err.toString ? err.toString() : err);
    m = m.replace(/^AssertionError:\s*/, '');
    m = m.replace(/\s+on line (\d+)(\s+of\s+\S+)?\.?$/, function (all, n) {
      return Number(n) <= userLines ? ' (Zeile ' + n + ')' : '';
    });
    return m || 'Unbekannter Fehler';
  }

  function runPy(code, userLines) {
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
        function (err) { return { ok: false, out: buf, err: formatErr(err, userLines) }; }
      );
  }

  /* ---------- Rendering ---------- */
  function buildSection(m) {
    const sec = document.createElement('section');
    sec.id = m.id;
    let html = '<div class="kicker">' + (m.kicker || '') + '</div><h2>' + m.title + '</h2>' + (m.html || '');

    (m.notebooks || []).forEach(function (nb) {
      html += '<div class="merk"><b>Übungs-Notebook</b><p><code class="nbfile">lernapp/notebooks/' + nb.file + '</code><br>' + nb.desc + '</p></div>';
    });
    if (m.exercises && m.exercises.length) {
      html += '<h3>Python-Übungen <span class="prog" id="prog-' + m.id + '"></span></h3>' +
        '<p class="note">Code ändern, «Ausführen» drücken, mit «Prüfen» kontrollieren. Beim ersten Ausführen lädt die Seite einmalig den Python-Interpreter (Skulpt, rund 1 MB). Er versteht die Grundlagen aus dem Kurs, aber nicht jede neue Python-Funktion.</p>' +
        '<div class="exlist" id="ex-' + m.id + '"></div>';
    }
    if (m.quiz && m.quiz.length) {
      html += '<h3>Selbsttest</h3><p class="note">Antworte zuerst im Kopf, dann klappe auf.</p>' +
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
      if (el) el.textContent = n + ' von ' + total + ' gelöst';
    }

    m.exercises.forEach(function (ex, i) {
      const id = 'ex-' + m.id + '-' + (i + 1);
      const key = 'cas-ml-' + m.id + '-' + (i + 1);
      const card = document.createElement('div');
      card.className = 'ex';
      card.innerHTML =
        '<h4>' + (i + 1) + ' · ' + ex.t + '<span class="done"></span></h4><div class="task">' + ex.task + '</div>' +
        '<label for="' + id + '" style="display:block;font-size:13px;color:var(--muted)">Dein Code</label>' +
        '<textarea id="' + id + '" class="code" rows="' + (ex.start.split('\n').length + 1) + '" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>' +
        '<div class="btnrow"><button class="pri" data-a="run">Ausführen</button><button data-a="chk">Prüfen</button><button data-a="rst">Zurücksetzen</button><button data-a="sol">Lösung zeigen</button></div>' +
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
        vd.textContent = 'Läuft …';
        out.hidden = true;
        const user = ta.value;
        const lines = user.split('\n').length;
        runPy(withCheck ? user + '\n\n' + ex.check + '\n' : user + '\n', lines).then(function (r) {
          out.hidden = !r.out;
          out.textContent = r.out.replace(/\n$/, '');
          if (r.ok) {
            if (withCheck) {
              vd.className = 'verdict good';
              vd.textContent = '✅ Richtig!';
              store(key + '-ok', '1');
              done.textContent = ' ✓';
              updateProgress();
            } else {
              vd.className = 'verdict info';
              vd.textContent = r.out
                ? 'Fertig. Mit «Prüfen» kontrollierst du die Lösung.'
                : 'Fertig, aber es wurde nichts ausgegeben. Mit «Prüfen» kontrollierst du die Lösung.';
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
            vd.textContent = '';
            vd.className = 'verdict';
          } else {
            sb.hidden = !sb.hidden;
            b.textContent = sb.hidden ? 'Lösung zeigen' : 'Lösung verbergen';
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
      o.textContent = 'Läuft …';
      runPy(code + '\n', code.split('\n').length).then(function (r) {
        o.textContent = (r.out.replace(/\n$/, '') + (r.ok ? '' : (r.out ? '\n' : '') + '❌ ' + r.err)) || '(keine Ausgabe)';
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

  function start() {
    const mods = modules.slice().sort(function (a, b) { return (a.order || 100) - (b.order || 100); });

    // Sub pages (e.g. mathe-kompakt.html) have no overview and no playground section.
    const hasOverview = !!$('ueberblick'), hasPlay = !!$('spielwiese');
    $('chips').innerHTML =
      (hasOverview ? '<a href="#ueberblick">Überblick</a>' : '') +
      mods.map(function (m) { return '<a href="#' + m.id + '">' + (m.nav || m.title) + '</a>'; }).join('') +
      (hasPlay ? '<a href="#spielwiese">Üben</a>' : '');

    if ($('toc')) {
      $('toc').innerHTML =
        mods.map(function (m) { return '<a href="#' + m.id + '"><b>' + (m.nav || m.title) + '</b><span>' + (m.summary || '') + '</span></a>'; }).join('') +
        '<a href="#spielwiese"><b>Üben</b><span>Spielwiese und Notebooks</span></a>';
    }

    const host = $('modules');
    mods.forEach(function (m) { host.appendChild(buildSection(m)); });
    mods.forEach(function (m) {
      try {
        if (m.exercises && m.exercises.length) renderExercises(m);
        if (typeof m.init === 'function') m.init();
      } catch (e) {
        console.error('Module "' + m.id + '" failed to start', e);
        const sec = $(m.id);
        if (sec) sec.insertAdjacentHTML('beforeend', '<div class="falle"><b>Fehler</b><p>Dieses Kapitel konnte nicht vollständig geladen werden (' + m.id + ').</p></div>');
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
