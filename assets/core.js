/*
 * LernApp core. Modules register themselves with LernApp.register({...}) and
 * this file renders navigation, overview cards, chapters, self-test questions.
 *
 * Module fields:
 *   id        unique id, used as anchor (#id)
 *   order     sort position (smaller = earlier)
 *   nav       short label for the top navigation
 *   title     chapter heading (HTML allowed)
 *   kicker    small line above the heading, e.g. "Modul 1 · Freitag 16.10"
 *   summary   one short line for the overview card
 *   html      chapter content (HTML string)
 *   quiz      optional [{ q, a, k?, c? }] self-test questions (HTML allowed); register() keeps the German list as quizDe,
 *             the quiz chapter (modules/quiz.js) asks them all with spaced repetition.
 *             k = keyword groups and c = answer choices add the answer check
 *   notebooks optional [{ file, desc }] files in lernapp/notebooks
 *   init()    optional, called once after the chapter is in the page; the larger chapters only call
 *             their demos from assets/demos-<id>.js (LernApp.demos.<id>()), so modules stay content only
 *
 * Language: LernApp.lang is 'de' (default) or 'en', chosen with the DE/EN switch in the
 * header. English texts live in modules/en/<id>.js and call LernApp.translate(id, {...})
 * with the fields to replace (nav, title, kicker, summary, html, quiz, notebooks). Demo code picks its strings with
 * LernApp.t('deutsch', 'english'). Static page text uses a data-en attribute.
 *
 * Theme: 'light', 'dark' or 'auto' (follows the system), chosen with the switch in the
 * header and stored under cas-ml-theme. It is applied as data-theme on <html>; the pages
 * also set it in a tiny inline script in <head> so the first paint has the right colours.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fmt = (v, d) => Number(v).toFixed(d);
  const modules = [];
  const EN = {};
  let LANG = 'de';
  const t = (de, en) => (LANG === 'en' && en !== undefined ? en : de);
  // Seeded random numbers and a normal draw, shared by all demos (same data on every load).
  const mulberry32 = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const gauss = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  window.LernApp = {
    $: $,
    fmt: fmt,
    mulberry32: mulberry32,
    gauss: gauss,
    demos: {},
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
      // The German questions stay available after the English overlay: the quiz chapter derives stable card ids from them
      if (mod.quiz) mod.quizDe = mod.quiz;
      modules.push(mod);
    },
    translate: function (id, fields) { EN[id] = fields; },
    t: t,
    // store(key) reads, store(key, text) writes localStorage (and the server copy); errors return null
    store: function (key, val) { return store(key, val); },
    lang: 'de',
    // Set a range slider from a demo (drag in a plot): clamp, snap to its step, then fire 'input'
    // so the demo redraws through its normal slider listener and the shown value follows.
    setRange: function (id, v) {
      const el = typeof id === 'string' ? $(id) : id;
      if (!el || !isFinite(v)) return;
      const min = +el.min, max = +el.max, step = +el.step || 1;
      const dec = (String(el.step).split('.')[1] || '').length;
      const snapped = +(min + Math.round((Math.max(min, Math.min(max, v)) - min) / step) * step).toFixed(dec);
      if (+el.value === snapped) return;
      el.value = snapped;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    // Inverse of a linear scale such as sx = (x) => L + x * k: maps a plot coordinate back to a data value.
    invert: function (scale) { const a = scale(0), k = scale(1) - a; return (p) => (p - a) / k; },
    // Drag with mouse, pen or finger in an SVG plot. The SVG may be redrawn with innerHTML while dragging,
    // because the pointer is captured on the SVG element itself, not on a child.
    //   pick(x, y)    key of the handle under the pointer, or null (then the press is ignored);
    //                 omitted: every press in the plot counts (the plot works like one big slider)
    //   move(key, x, y, first)  called on press (first = true) and while dragging, in viewBox coordinates
    //   axis 'x'      only horizontal dragging: on touch the page can still scroll vertically over the plot
    //   hint [de, en] short line under the plot that tells the reader what to drag
    drag: function (svg, opts) {
      svg = typeof svg === 'string' ? $(svg) : svg;
      if (!svg) return;
      const pick = opts.pick || (() => 'all');
      svg.classList.add('dragplot');
      svg.style.touchAction = opts.axis === 'x' ? 'pan-y' : 'none';
      if (opts.hint && !svg.nextElementSibling?.classList.contains('drag-hint')) {
        const p = document.createElement('p');
        p.className = 'hint drag-hint';
        p.textContent = t(opts.hint[0], opts.hint[1]);
        svg.after(p);
      }
      const at = (e) => {
        const m = svg.getScreenCTM();
        if (!m) return [0, 0];
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        return [p.x, p.y];
      };
      let key = null;
      svg.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const [x, y] = at(e), k = pick(x, y);
        if (k === null || k === undefined) return;
        e.preventDefault();
        key = k;
        try { svg.setPointerCapture(e.pointerId); } catch (err) {}
        svg.classList.add('dragging');
        opts.move(key, x, y, true);
      });
      svg.addEventListener('pointermove', (e) => {
        const [x, y] = at(e);
        if (key === null) { if (opts.pick) svg.style.cursor = pick(x, y) === null ? '' : 'grab'; return; }
        opts.move(key, x, y, false);
      });
      const end = () => { key = null; svg.classList.remove('dragging'); };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
    },
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

  // ?theme=dark|light|auto in the address wins over the stored choice (for links and tests)
  let THEME = (location.search.match(/[?&]theme=(light|dark|auto)\b/) || [])[1] || 'auto';
  try { const th = localStorage.getItem('cas-ml-theme'); if (!/[?&]theme=/.test(location.search) && (th === 'light' || th === 'dark')) THEME = th; } catch (e) {}
  function applyTheme(th) {
    THEME = th;
    if (th === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', th);
  }
  applyTheme(THEME);

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

  /* ---------- Rendering ---------- */
  function buildSection(m) {
    const sec = document.createElement('section');
    sec.id = m.id;
    let html = '<div class="kicker">' + (m.kicker || '') + '</div><h2>' + m.title + '</h2>' +
      (LANG === 'en' && !EN[m.id] ? '<p class="note">This chapter is not available in English yet. It is shown in German.</p>' : '') + (m.html || '');

    (m.notebooks || []).forEach(function (nb) {
      html += '<div class="merk"><b>' + t('Übungs-Notebook', 'Exercise notebook') + '</b><p><code class="nbfile">lernapp/notebooks/' + nb.file + '</code><br>' + nb.desc + '</p></div>';
    });
    if (m.quiz && m.quiz.length) {
      html += '<h3>' + t('Selbsttest', 'Self-test') + '</h3><p class="note">' + t('Tippe deine Antwort und lass sie prüfen, oder wähle eine Antwort. Ohne Eingabe kannst du auch nur aufklappen.', 'Type your answer and have it checked, or pick an answer. Without input you can also just open the question.') + '</p>' +
        m.quiz.map(function (it) { return quizItem(it); }).join('');
    }
    sec.innerHTML = html;
    sec.querySelectorAll('details.q[data-check]').forEach(wireQuiz);
    return sec;
  }

  // Self-test items: { q, a } as before; optional k (keyword groups) and c (answer choices) add the check.
  //   k: [['label shown when missing', 'variant', 'variant'], ...]  every group needs one variant in the typed text
  //   c: ['correct answer', 'wrong 1', 'wrong 2', ...]              shown in random order
  function norm(x) {
    return String(x).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\u03b1-\u03c9]+/g, ' ').trim();
  }
  function quizItem(it) {
    const check = !!(it.k && it.k.length) || !!(it.c && it.c.length);
    const kAttr = it.k && it.k.length ? ' data-k="' + esc(JSON.stringify(it.k)) + '"' : '';
    let h = '<details class="q"' + (check ? ' data-check="1"' + kAttr : '') + '><summary>' + it.q + '</summary>';
    if (check) {
      h += '<div class="qa">';
      if (it.k && it.k.length) {
        h += '<textarea class="qin" rows="3" placeholder="' + t('Deine Antwort in eigenen Worten …', 'Your answer in your own words …') + '" aria-label="' + t('Deine Antwort', 'Your answer') + '"></textarea>' +
          '<button type="button" class="qchk">' + t('Antwort prüfen', 'Check answer') + '</button><div class="qres" aria-live="polite"></div>';
      }
      if (it.c && it.c.length) {
        const opts = it.c.map(function (txt, i) { return { txt: txt, ok: i === 0 }; });
        for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = opts[i]; opts[i] = opts[j]; opts[j] = x; }
        h += '<p class="qor">' + (it.k && it.k.length ? t('Oder wähle:', 'Or pick one:') : t('Wähle:', 'Pick one:')) + '</p><div class="qopts">' +
          opts.map(function (o) { return '<button type="button" class="qopt" data-ok="' + (o.ok ? 1 : 0) + '">' + o.txt + '</button>'; }).join('') + '</div><div class="qcres" aria-live="polite"></div>';
      }
      h += '<button type="button" class="qshow">' + t('Musterantwort zeigen', 'Show model answer') + '</button></div>';
    }
    return h + '<div class="a">' + it.a + '</div></details>';
  }
  function wireQuiz(d) {
    const groups = JSON.parse(d.getAttribute('data-k') || '[]');
    const btn = d.querySelector('.qchk');
    if (btn) {
      btn.addEventListener('click', function () {
        const text = ' ' + norm(d.querySelector('.qin').value) + ' ';
        const res = d.querySelector('.qres');
        if (text.trim() === '') { res.className = 'qres'; res.textContent = t('Schreibe zuerst etwas.', 'Write something first.'); return; }
        const rows = groups.map(function (g) {
          const hit = g.some(function (alt) { return text.indexOf(norm(alt)) >= 0; });
          return { label: g[0], hit: hit };
        });
        const n = rows.filter(function (r) { return r.hit; }).length;
        const all = n === rows.length;
        res.className = 'qres ' + (all ? 'ok' : n * 2 >= rows.length ? 'part' : 'no');
        res.innerHTML = '<b>' + (all ? t('Vollständig: alle Kernbegriffe sind drin.', 'Complete: all key terms are there.')
          : n * 2 >= rows.length ? t('Teilweise: ', 'Partly: ') + n + ' / ' + rows.length
          : t('Es fehlt noch viel: ', 'Much is missing: ') + n + ' / ' + rows.length) + '</b><ul>' +
          rows.map(function (r) { return '<li class="' + (r.hit ? 'ok' : 'no') + '">' + (r.hit ? '✓ ' : '✗ ' + t('fehlt: ', 'missing: ')) + esc(r.label) + '</li>'; }).join('') + '</ul>' +
          '<p class="hint">' + t('Der Check sucht Begriffe, nicht Sinn. Vergleiche mit der Musterantwort unten.', 'The check looks for terms, not meaning. Compare with the model answer below.') + '</p>';
        d.classList.add('checked');
      });
    }
    d.querySelector('.qshow').addEventListener('click', function () { d.classList.add('checked'); });
    d.querySelectorAll('.qopt').forEach(function (b) {
      b.addEventListener('click', function () {
        const right = b.getAttribute('data-ok') === '1';
        d.querySelectorAll('.qopt').forEach(function (o) { o.disabled = true; o.classList.toggle('ok', o.getAttribute('data-ok') === '1'); });
        if (!right) b.classList.add('no');
        const res = d.querySelector('.qcres');
        res.className = 'qcres ' + (right ? 'ok' : 'no');
        res.textContent = right ? t('Richtig.', 'Correct.') : t('Nicht ganz. Die richtige Antwort ist grün markiert.', 'Not quite. The correct answer is marked green.');
        d.classList.add('checked');
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

  /* ---------- Chapter view (main page only) ----------
   * index.html shows one chapter at a time. The address decides: #<chapter id> or #<element inside a chapter>
   * shows that chapter, an empty hash or #ueberblick the overview. All chapters stay in the DOM (init() runs once for
   * all of them, the search indexes all of them); the inactive ones only get the class "off" (display: none). */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // "On this page": links to the h3 headings of a chapter (not those inside demos, boxes or self-test answers)
  function chapterToc(sec, m) {
    const hs = Array.prototype.filter.call(sec.querySelectorAll('h3'), function (h) { return !h.closest('details, .demo, .box'); });
    if (hs.length < 2) return;
    hs.forEach(function (h, i) { if (!h.id) h.id = m.id + '-h' + (i + 1); });
    const label = t('Auf dieser Seite', 'On this page');
    const nav = document.createElement('nav');
    nav.className = 'ctoc';
    nav.setAttribute('aria-label', label);
    nav.innerHTML = '<details><summary>' + label + '</summary><div>' +
      hs.map(function (h) { return '<a href="#' + h.id + '">' + esc(h.textContent.trim()) + '</a>'; }).join('') + '</div></details>';
    nav.querySelector('details').open = window.matchMedia('(min-width: 1280px)').matches;
    sec.querySelector('h2').after(nav);
  }

  function pager(sec, prev, next) {
    const link = function (m, cls, dir) {
      return m ? '<a class="' + cls + '" href="#' + m.id + '"><span>' + dir + '</span><b>' + (m.nav || m.title) + '</b></a>' : '<span></span>';
    };
    sec.insertAdjacentHTML('beforeend', '<nav class="pager" aria-label="' + t('Kapitel blättern', 'Chapter navigation') + '">' +
      link(prev, 'prev', '← ' + t('Zurück', 'Previous')) + link(next, 'next', t('Weiter', 'Next') + ' →') + '</nav>');
  }

  function wireRouter(mods) {
    const over = $('ueberblick'), chips = $('chips'), baseTitle = document.title;
    const secs = mods.map(function (m) { return $(m.id); }).filter(Boolean);
    const navOf = {};
    mods.forEach(function (m) { navOf[m.id] = m.nav || m.title; });
    let current = null;

    mods.forEach(function (m, i) {
      const sec = $(m.id);
      if (!sec) return;
      chapterToc(sec, m);
      pager(sec, i ? mods[i - 1] : { id: 'ueberblick', nav: t('Überblick', 'Overview') }, mods[i + 1]);
    });

    const barH = function () {
      const bar = document.querySelector('.topbar') || chips;
      const h = Math.round(bar.getBoundingClientRect().height) + 12;
      document.documentElement.style.setProperty('--barh', h + 'px');
      return h;
    };
    const chapterOf = function (el) { return (el && el.closest('#modules > section')) || over; };

    // Highlight the heading of the "On this page" list that is being read
    function spy() {
      const nav = current && current !== over ? current.querySelector('.ctoc') : null;
      if (!nav) return;
      const y = barH() + Math.min(160, window.innerHeight / 4), links = nav.querySelectorAll('a');
      let on = -1;
      links.forEach(function (a, i) { const h = $(a.getAttribute('href').slice(1)); if (h && h.getBoundingClientRect().top <= y) on = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === on); });
    }

    function show(id, scroll) {
      const target = id ? document.getElementById(id) : null;
      const sec = chapterOf(target);
      const changed = sec !== current;
      [over].concat(secs).forEach(function (s) { s.classList.toggle('off', s !== sec); });
      current = sec;
      document.title = sec === over ? baseTitle : navOf[sec.id] + ' · ' + baseTitle;
      chips.querySelectorAll('a').forEach(function (a) {
        const on = a.getAttribute('href') === '#' + sec.id;
        a.classList.toggle('on', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        if (on) {
          const r = a.getBoundingClientRect(), cr = chips.getBoundingClientRect();
          if (r.left < cr.left || r.right > cr.right) chips.scrollLeft += r.left - cr.left - 16;
        }
      });
      if (scroll !== false) {
        barH();
        // A new chapter jumps at once (the page has changed anyway); within a chapter the CSS smooth scrolling applies
        const how = changed ? { behavior: 'instant' } : {};
        if (target && target !== sec && target !== over) target.scrollIntoView(how);
        else if (changed) { if (sec === over) window.scrollTo({ top: 0, behavior: 'instant' }); else sec.scrollIntoView(how); }
      }
      spy();
    }

    // For the search: open the chapter of a match without scrolling (the search scrolls to the match itself)
    LernApp.showChapter = function (id) {
      if ('#' + id !== location.hash) history.pushState(null, '', '#' + id);
      show(id, false);
    };
    window.addEventListener('hashchange', function () { show(decodeURIComponent(location.hash.slice(1))); });
    window.addEventListener('scroll', spy, { passive: true });
    const first = decodeURIComponent(location.hash.slice(1));
    show(first, false);
    // Jump to a deep link only when the page has its final height: after the search has built the sticky bar (its
    // height is the offset under the bar), the load event and the web fonts (they reflow the text above the target)
    if (first) {
      const loaded = new Promise(function (r) { if (document.readyState === 'complete') r(); else window.addEventListener('load', r); });
      Promise.all([loaded, document.fonts ? document.fonts.ready : null]).then(function () { show(first, true); });
    }
  }

  function applyEn(m, e) {
    Object.keys(e).forEach(function (k) {
      m[k] = e[k];
    });
  }

  function wireLang() {
    const head = document.querySelector('header.top');
    if (head) {
      head.insertAdjacentHTML('afterbegin', '<div class="hdrsw">' +
        '<div class="langsw" role="group" aria-label="Sprache / Language">' +
        '<button type="button" data-l="de" lang="de">DE</button><button type="button" data-l="en" lang="en">EN</button></div>' +
        '<div class="langsw themesw" role="group" aria-label="' + t('Farbschema', 'Colour scheme') + '">' +
        '<button type="button" data-th="light">' + t('Hell', 'Light') + '</button>' +
        '<button type="button" data-th="dark">' + t('Dunkel', 'Dark') + '</button>' +
        '<button type="button" data-th="auto">Auto</button></div></div>');
      const thBtns = head.querySelectorAll('.themesw button');
      function markTheme() {
        thBtns.forEach(function (b) { const on = b.dataset.th === THEME; b.className = on ? 'pri' : ''; b.setAttribute('aria-pressed', on); });
      }
      thBtns.forEach(function (b) {
        b.addEventListener('click', function () { applyTheme(b.dataset.th); store('cas-ml-theme', b.dataset.th); markTheme(); });
      });
      markTheme();
      head.querySelectorAll('.langsw:not(.themesw) button').forEach(function (b) {
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

    // Sub pages (e.g. mathe-kompakt.html) have no overview section.
    const hasOverview = !!$('ueberblick');
    $('chips').innerHTML =
      (hasOverview ? '<a href="#ueberblick">' + t('Überblick', 'Overview') + '</a>' : '') +
      mods.map(function (m) { return '<a href="#' + m.id + '">' + (m.nav || m.title) + '</a>'; }).join('');

    if ($('toc')) {
      $('toc').innerHTML =
        mods.map(function (m) { return '<a href="#' + m.id + '"><b>' + (m.nav || m.title) + '</b><span>' + (m.summary || '') + '</span></a>'; }).join('');
    }

    const host = $('modules');
    mods.forEach(function (m) { host.appendChild(buildSection(m)); });
    mods.forEach(function (m) {
      try {
        if (typeof m.init === 'function') m.init();
      } catch (e) {
        console.error('Module "' + m.id + '" failed to start', e);
        const sec = $(m.id);
        if (sec) sec.insertAdjacentHTML('beforeend', '<div class="falle"><b>' + t('Fehler', 'Error') + '</b><p>' + t('Dieses Kapitel konnte nicht vollständig geladen werden', 'This chapter could not be loaded completely') + ' (' + m.id + ').</p></div>');
      }
    });

    if (hasOverview) { wireRouter(mods); return; }
    wireNav();
    if (location.hash.length > 1) {
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
