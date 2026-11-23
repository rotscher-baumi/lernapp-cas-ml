/*
 * Quiz chapter (modules/quiz.js): the self-test questions of all chapters as cards with spaced repetition
 * (Leitner, five boxes), a blank-page recall per chapter and a progress table.
 *
 *   LernApp.quizLogic   pure functions without DOM (dates, card ids, rating, queue, statistics); tested in
 *                       tests/test_quiz.py through tests/quiz_harness.js
 *   LernApp.demos.quiz  the user interface, called from init() of modules/quiz.js
 *
 * State: one JSON text under the key 'cas-ml-quiz' (LernApp.store, so also in data/state.json with the server):
 *   { v: 1, cards: { <cardId>: { box: 1..5, due: 'YYYY-MM-DD', seen: n, last: 'YYYY-MM-DD' } },
 *     filter: [chapter ids] | null (null = all), newMax: number (-1 = all),
 *     blank: { <chapterId>: { date, got, total } }, drafts: { <chapterId>: text }, blankCh: chapter id last chosen }
 * A card id is '<chapter id>:<hash of the German question text>', so it is the same in German and English and
 * survives reordering; rewording a question starts its card again in box 0 (new).
 */
(function () {
  'use strict';
  const L = window.LernApp;
  const KEY = 'cas-ml-quiz';
  const INTERVALS = [1, 3, 7, 14, 30]; // days until the next repetition from box 1 … 5

  /* ---------- Pure logic ---------- */
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function addDays(s, n) {
    const p = s.split('-').map(Number);
    return dayStr(new Date(p[0], p[1] - 1, p[2] + n));
  }
  function daysBetween(a, b) {
    const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }
  // Text of an HTML snippet, whitespace collapsed (the basis of the card id)
  const plain = (html) => String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }

  // All cards of the chapters in course order: { id, ch, nav, i, q, a, k, c } (k, c: optional keyword groups and choices)
  function collect(mods) {
    const cards = [];
    mods.forEach(function (m) {
      const qs = m.quiz || [], de = m.quizDe || qs, used = {};
      qs.forEach(function (it, i) {
        let id = m.id + ':' + hash(plain((de[i] || it).q));
        if (used[id]) id += '-' + (++used[id]); else used[id] = 1;
        cards.push({ id: id, ch: m.id, nav: plain(m.nav || m.title), i: i, q: it.q, a: it.a, k: it.k, c: it.c });
      });
    });
    return cards;
  }

  function parse(text) {
    let s = null;
    try { s = JSON.parse(text || 'null'); } catch (e) { s = null; }
    if (!s || typeof s !== 'object' || s.v !== 1) s = { v: 1 };
    const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
    s.cards = obj(s.cards);
    s.blank = obj(s.blank);
    s.drafts = obj(s.drafts);
    s.filter = Array.isArray(s.filter) ? s.filter : null;
    s.newMax = typeof s.newMax === 'number' ? s.newMax : 10;
    s.blankCh = typeof s.blankCh === 'string' ? s.blankCh : '';
    return s;
  }

  // New state of a card after a rating: 'again' back to box 1, 'hard' stays in its box, 'good' one box up.
  // A new card starts in box 1, or in box 2 when it is known at once.
  function rate(card, grade, today) {
    const box = card ? card.box : 0;
    const nb = grade === 'again' ? 1 : grade === 'hard' ? Math.max(1, box) : Math.min(5, Math.max(2, box + 1));
    return { box: nb, due: addDays(today, INTERVALS[nb - 1]), seen: (card ? card.seen || 0 : 0) + 1, last: today };
  }

  function shuffle(a, rnd) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  // Mix the topics: shuffle within each chapter, then take one card per chapter in turn, so the same chapter
  // does not come twice in a row while others are left
  function interleave(list, rnd) {
    const groups = {}, order = [];
    list.forEach(function (c) { if (!groups[c.ch]) { groups[c.ch] = []; order.push(c.ch); } groups[c.ch].push(c); });
    const gs = shuffle(order, rnd).map(function (ch) { return shuffle(groups[ch], rnd); });
    const out = [];
    let last = null;
    while (out.length < list.length) {
      // the chapter with most cards left goes first (ties in the shuffled order), but never the one just shown
      let best = -1;
      gs.forEach(function (g, k) { if (g.length && g[0].ch !== last && (best < 0 || g.length > gs[best].length)) best = k; });
      if (best < 0) best = gs.findIndex(function (g) { return g.length; });
      const c = gs[best].shift();
      out.push(c);
      last = c.ch;
    }
    return out;
  }

  // Cards for one round: everything due in the chosen chapters plus up to newMax new cards (-1 = all new),
  // the new ones taken in turn from the chapters in course order
  function queue(cards, state, today, opts) {
    const sel = opts.chapters;
    const inSel = cards.filter(function (c) { return !sel || sel.indexOf(c.ch) >= 0; });
    const due = inSel.filter(function (c) { const s = state.cards[c.id]; return s && s.due <= today; });
    const byCh = {}, chs = [];
    inSel.forEach(function (c) { if (!state.cards[c.id]) { if (!byCh[c.ch]) { byCh[c.ch] = []; chs.push(c.ch); } byCh[c.ch].push(c); } });
    const fresh = [], max = opts.newMax < 0 ? Infinity : opts.newMax;
    for (let k = 0; fresh.length < max && chs.some(function (ch) { return byCh[ch].length; }); k++) {
      const g = byCh[chs[k % chs.length]];
      if (g.length) fresh.push(g.shift());
    }
    return interleave(due.concat(fresh), opts.rnd || Math.random);
  }

  // Per chapter (in course order) and in total: questions, new, per box, due today
  function stats(cards, state, today) {
    const rows = [], by = {};
    const total = { ch: '', nav: '', n: 0, neu: 0, box: [0, 0, 0, 0, 0], due: 0 };
    cards.forEach(function (c) {
      let r = by[c.ch];
      if (!r) { r = by[c.ch] = { ch: c.ch, nav: c.nav, n: 0, neu: 0, box: [0, 0, 0, 0, 0], due: 0 }; rows.push(r); }
      const s = state.cards[c.id];
      [r, total].forEach(function (x) {
        x.n++;
        if (!s) x.neu++;
        else { x.box[s.box - 1]++; if (s.due <= today) x.due++; }
      });
    });
    return { rows: rows, total: total };
  }

  // How many known cards fall due on each of the next days (index 0 = tomorrow)
  function upcoming(cards, state, today, days) {
    const out = new Array(days).fill(0);
    cards.forEach(function (c) {
      const s = state.cards[c.id];
      if (!s || s.due <= today) return;
      const d = daysBetween(today, s.due);
      if (d >= 1 && d <= days) out[d - 1]++;
    });
    return out;
  }

  L.quizLogic = { KEY: KEY, INTERVALS: INTERVALS, dayStr: dayStr, addDays: addDays, daysBetween: daysBetween, plain: plain, hash: hash,
    collect: collect, parse: parse, rate: rate, interleave: interleave, queue: queue, stats: stats, upcoming: upcoming };

  /* ---------- User interface ---------- */
  L.demos.quiz = function () {
    const $ = L.$, t = L.t, Q = L.quizLogic;
    const sec = $('quiz');
    if (!sec) return;
    const mods = L.modules.slice().sort(function (a, b) { return (a.order || 100) - (b.order || 100); });
    const cards = collect(mods.filter(function (m) { return m.id !== 'quiz'; }));
    const chapters = [];
    cards.forEach(function (c) { if (!chapters.some(function (x) { return x.ch === c.ch; })) chapters.push({ ch: c.ch, nav: c.nav }); });
    let state = parse(L.store(KEY));
    const save = function () { L.store(KEY, JSON.stringify(state)); };
    const today = function () { return dayStr(new Date()); };
    const fmtDay = function (s) { const p = s.split('-'); return p[2] + '.' + p[1] + '.'; };
    const inDays = function (n) { return n === 1 ? t('morgen', 'tomorrow') : t('in ' + n + ' Tagen', 'in ' + n + ' days'); };
    const visible = function () { return !sec.classList.contains('off'); };

    /* Chapter filter */
    const selected = function () { return state.filter ? state.filter.filter(function (ch) { return chapters.some(function (x) { return x.ch === ch; }); }) : null; };
    function drawFilter() {
      const sel = selected();
      $('qzChapters').innerHTML = chapters.map(function (c) {
        const on = !sel || sel.indexOf(c.ch) >= 0;
        return '<label class="qz-chip"><input type="checkbox" value="' + c.ch + '"' + (on ? ' checked' : '') + '> ' + c.nav + '</label>';
      }).join('');
    }
    $('qzChapters').addEventListener('change', function () {
      const on = Array.prototype.filter.call($('qzChapters').querySelectorAll('input'), function (i) { return i.checked; }).map(function (i) { return i.value; });
      state.filter = on.length === chapters.length ? null : on;
      save();
      drawSummary();
    });
    $('qzAll').addEventListener('click', function () { state.filter = null; save(); drawFilter(); drawSummary(); });
    $('qzNone').addEventListener('click', function () { state.filter = []; save(); drawFilter(); drawSummary(); });
    $('qzNew').value = String(state.newMax);
    if ($('qzNew').value !== String(state.newMax)) $('qzNew').value = '10';
    $('qzNew').addEventListener('change', function () { state.newMax = +$('qzNew').value; save(); drawSummary(); });

    function drawSummary() {
      const sel = selected(), d = today();
      const q = queue(cards, state, d, { chapters: sel, newMax: state.newMax });
      const due = q.filter(function (c) { return state.cards[c.id]; }).length;
      const chosen = sel ? sel.length : chapters.length;
      $('qzSummary').innerHTML = chosen === 0
        ? t('Kein Kapitel gewählt.', 'No chapter selected.')
        : '<b>' + due + '</b> ' + t('fällig', 'due') + ' · <b>' + (q.length - due) + '</b> ' + t('neu', 'new') + ' · ' +
          chosen + ' ' + t(chosen === 1 ? 'Kapitel' : 'Kapitel', chosen === 1 ? 'chapter' : 'chapters');
      $('qzStart').disabled = q.length === 0;
      $('qzStart').textContent = q.length ? t('Runde starten', 'Start round') + ' (' + q.length + ')' : t('Heute nichts fällig', 'Nothing due today');
      $('qzPractice').disabled = chosen === 0;
    }

    /* A round */
    let round = null; // { list, pos, practice, again: {id: true}, counts }
    function start(practice) {
      const sel = selected(), d = today();
      let list;
      if (practice) list = interleave(cards.filter(function (c) { return !sel || sel.indexOf(c.ch) >= 0; }), Math.random).slice(0, 20);
      else list = queue(cards, state, d, { chapters: sel, newMax: state.newMax });
      if (!list.length) return;
      round = { list: list, pos: 0, practice: practice, again: {}, counts: { again: 0, hard: 0, good: 0 } };
      $('qzSetup').hidden = true;
      $('qzDone').hidden = true;
      $('qzCard').hidden = false;
      drawCard();
      $('qzCard').scrollIntoView({ block: 'nearest' });
    }
    function drawCard() {
      const c = round.list[round.pos], s = state.cards[c.id];
      $('qzMeta').innerHTML = '<span>' + c.nav + '</span><span>' + (round.pos + 1) + ' / ' + round.list.length +
        (round.practice ? ' · ' + t('freies Üben', 'free practice') : '') + '</span>';
      $('qzBar').style.width = (100 * round.pos / round.list.length) + '%';
      $('qzBox').textContent = s ? t('Fach ', 'Box ') + s.box : t('neu', 'new');
      $('qzQ').innerHTML = c.q;
      $('qzOwn').value = '';
      $('qzOwn').hidden = false;
      drawChoices(c);
      $('qzAns').hidden = true;
      $('qzRate').hidden = true;
      $('qzShow').hidden = false;
      ['again', 'hard', 'good'].forEach(function (g) { $('qzR' + g).classList.remove('sug'); });
      // labels with the next interval of each choice
      const d = today();
      [['again', 'Nicht gewusst', 'Didn’t know'], ['hard', 'Knapp', 'Barely'], ['good', 'Sicher', 'Knew it']].forEach(function (g, k) {
        const n = rate(s, g[0], d), b = $('qzR' + g[0]);
        b.innerHTML = '<kbd>' + (k + 1) + '</kbd> ' + t(g[1], g[2]) + (round.practice ? '' : '<small>' + inDays(daysBetween(d, n.due)) + '</small>');
      });
    }
    // Multiple choice (items with c): correct choice first in the data, shuffled here; a click reveals the answer
    function drawChoices(c) {
      const box = $('qzChoice');
      box.hidden = !(c.c && c.c.length);
      $('qzOpts').innerHTML = '';
      if (box.hidden) return;
      const opts = c.c.map(function (txt, i) { return { txt: txt, ok: i === 0 }; });
      for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = opts[i]; opts[i] = opts[j]; opts[j] = x; }
      opts.forEach(function (o) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'qopt';
        b.innerHTML = o.txt;
        b.addEventListener('click', function () {
          const all = $('qzOpts').querySelectorAll('.qopt');
          b.classList.add(o.ok ? 'ok' : 'no');
          if (!o.ok) opts.forEach(function (p, i) { if (p.ok) all[i].classList.add('ok'); });
          reveal(o.ok ? 'good' : 'again');
        });
        $('qzOpts').appendChild(b);
      });
    }
    function reveal(picked) {
      const c = round.list[round.pos], own = $('qzOwn').value.trim();
      $('qzA').innerHTML = c.a;
      $('qzMine').hidden = !own;
      $('qzMineText').textContent = own;
      // keyword check of the typed answer (items with k); suggests, but does not set, the rating
      let sug = picked === 'again' || picked === 'good' ? picked : 'good';
      const chk = $('qzCheck');
      chk.className = 'qres';
      chk.innerHTML = '';
      if (picked === 'good' || picked === 'again') {
        chk.className = 'qres ' + (picked === 'good' ? 'ok' : 'no');
        chk.innerHTML = '<b>' + (picked === 'good' ? t('Richtig gewählt.', 'Correct choice.') : t('Nicht ganz. Die richtige Antwort ist grün markiert.', 'Not quite. The correct answer is marked green.')) + '</b>';
        $('qzR' + sug).classList.add('sug');
      } else if (own && c.k && c.k.length) {
        const r = L.checkAnswer(own, c.k);
        chk.className = 'qres ' + r.level;
        chk.innerHTML = L.checkHtml(r);
        sug = r.all ? 'good' : r.level === 'part' ? 'hard' : 'again';
        $('qzR' + sug).classList.add('sug');
      }
      $('qzLink').href = '#' + c.ch;
      $('qzLink').textContent = t('Im Kapitel nachlesen', 'Read up in the chapter') + ': ' + c.nav + ' →';
      $('qzOpts').querySelectorAll('.qopt').forEach(function (x) { x.disabled = true; });
      $('qzChoice').hidden = !(c.c && c.c.length); // choices stay visible with the marked result
      $('qzOwn').hidden = true; // shown again as «Deine Antwort» next to the solution
      $('qzAns').hidden = false;
      $('qzRate').hidden = false;
      $('qzShow').hidden = true;
      $('qzR' + sug).focus({ preventScroll: true });
    }
    function grade(g) {
      const c = round.list[round.pos];
      round.counts[g]++;
      if (!round.practice) {
        state.cards[c.id] = rate(state.cards[c.id], g, today());
        save();
      }
      // not known: once more at the end of this round
      if (g === 'again' && !round.again[c.id]) { round.again[c.id] = true; round.list.push(c); }
      round.pos++;
      if (round.pos < round.list.length) { drawCard(); $('qzShow').focus({ preventScroll: true }); return; }
      finish();
    }
    function finish() {
      const k = round.counts;
      $('qzCard').hidden = true;
      $('qzSetup').hidden = false;
      $('qzDone').hidden = false;
      $('qzDone').innerHTML = '<b>' + t('Runde fertig.', 'Round complete.') + '</b> ' +
        k.good + ' ' + t('sicher', 'knew it') + ' · ' + k.hard + ' ' + t('knapp', 'barely') + ' · ' + k.again + ' ' + t('nicht gewusst', 'didn’t know') +
        (round.practice ? ' · ' + t('Freies Üben ändert den Plan nicht.', 'Free practice does not change the schedule.') : '');
      round = null;
      drawSummary();
      drawProgress();
    }
    function stop() {
      if (!round) return;
      round = null;
      $('qzCard').hidden = true;
      $('qzSetup').hidden = false;
      drawSummary();
      drawProgress();
    }
    $('qzStart').addEventListener('click', function () { start(false); });
    $('qzPractice').addEventListener('click', function () { start(true); });
    $('qzShow').addEventListener('click', function () { reveal(); });
    $('qzStop').addEventListener('click', stop);
    ['again', 'hard', 'good'].forEach(function (g) { $('qzR' + g).addEventListener('click', function () { grade(g); }); });
    document.addEventListener('keydown', function (e) {
      if (!round || !visible() || e.ctrlKey || e.metaKey || e.altKey) return;
      const typing = /^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName);
      if (!$('qzShow').hidden) {
        if (e.target.classList && e.target.classList.contains('qopt')) return;
        if ((e.key === 'Enter' && (e.ctrlKey || !typing)) || (e.key === ' ' && !typing)) { e.preventDefault(); reveal(); }
        return;
      }
      if (typing) return;
      const g = { 1: 'again', 2: 'hard', 3: 'good' }[e.key];
      if (g) { e.preventDefault(); grade(g); }
    });

    /* Blank page: what the chapter covers (section headings and key points), to compare with what you wrote */
    const blankMods = mods.filter(function (m) { return m.id !== 'quiz' && $(m.id) && items(m.id).length >= 2; });
    function items(id) {
      const s = $(id), out = [];
      if (!s) return out;
      const selftest = t('Selbsttest', 'Self-test');
      let head = null;
      s.querySelectorAll('h3, .merk').forEach(function (el) {
        if (el.closest('details, .demo, .box, nav')) return;
        if (el.tagName === 'H3') {
          if (el.textContent.trim() === selftest) return;
          head = el;
          out.push({ kind: 'h', text: el.textContent.trim(), at: el });
        } else {
          if (el.querySelector('.nbfile')) return; // notebook hint, not a key point
          const p = el.querySelector('p');
          if (p) out.push({ kind: 'm', text: p.innerHTML, at: el.id ? el : head });
        }
      });
      return out;
    }
    $('qzBlankCh').innerHTML = blankMods.map(function (m) { return '<option value="' + m.id + '">' + plain(m.nav || m.title) + '</option>'; }).join('');
    if (blankMods.some(function (m) { return m.id === state.blankCh; })) $('qzBlankCh').value = state.blankCh;
    function blankChapter() { return $('qzBlankCh').value; }
    function drawBlank() {
      const ch = blankChapter(), r = state.blank[ch];
      $('qzBlankText').value = state.drafts[ch] || '';
      $('qzBlankList').hidden = true;
      $('qzBlankList').innerHTML = '';
      $('qzBlankLast').textContent = r ? t('Letztes Mal', 'Last time') + ' (' + fmtDay(r.date) + '): ' + r.got + ' / ' + r.total : '';
    }
    let draftT = null;
    $('qzBlankText').addEventListener('input', function () {
      clearTimeout(draftT);
      draftT = setTimeout(function () {
        const ch = blankChapter(), v = $('qzBlankText').value;
        if (v) state.drafts[ch] = v; else delete state.drafts[ch];
        save();
      }, 400);
    });
    $('qzBlankCh').addEventListener('change', function () { state.blankCh = blankChapter(); save(); drawBlank(); });
    $('qzBlankCmp').addEventListener('click', function () {
      const ch = blankChapter(), its = items(ch);
      $('qzBlankList').hidden = false;
      $('qzBlankList').innerHTML = '<p class="hint">' + t('Hake ab, was du auf deinem Blatt hattest. Der Rest ist das, was du nachlesen solltest.', 'Tick what was on your page. The rest is what to read up on.') + '</p>' +
        its.map(function (it, i) {
          const href = it.at && it.at.id ? ' <a href="#' + it.at.id + '">→</a>' : '';
          return '<label class="qz-item' + (it.kind === 'm' ? ' qz-key' : '') + '"><input type="checkbox" data-i="' + i + '"><span>' +
            (it.kind === 'm' ? '<b>' + t('Merksatz', 'Key point') + ':</b> ' + it.text : '<b>' + it.text + '</b>') + href + '</span></label>';
        }).join('') + '<p class="qz-blankres" id="qzBlankRes"></p>';
      const boxes = $('qzBlankList').querySelectorAll('input');
      const upd = function () {
        const got = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).length;
        state.blank[ch] = { date: today(), got: got, total: boxes.length };
        save();
        $('qzBlankRes').textContent = got + ' / ' + boxes.length + ' ' + t('gewusst', 'recalled');
        drawProgress();
      };
      boxes.forEach(function (b) { b.addEventListener('change', upd); });
      upd();
    });
    $('qzBlankClear').addEventListener('click', function () { delete state.drafts[blankChapter()]; save(); drawBlank(); });

    /* Progress */
    function drawProgress() {
      const d = today(), st = stats(cards, state, d), up = upcoming(cards, state, d, 7);
      const row = function (r, isTotal) {
        const b = state.blank[r.ch];
        return '<tr' + (isTotal ? ' class="qz-total"' : '') + '><td>' + (isTotal ? t('Total', 'Total') : '<a href="#' + r.ch + '">' + r.nav + '</a>') + '</td><td>' + r.n + '</td><td>' + r.neu + '</td>' +
          r.box.map(function (x) { return '<td>' + (x || '·') + '</td>'; }).join('') +
          '<td class="qz-due">' + (r.due || '·') + '</td><td>' + (isTotal ? '' : b ? b.got + '/' + b.total : '·') + '</td></tr>';
      };
      $('qzProg').innerHTML = '<table><thead><tr><th>' + t('Kapitel', 'Chapter') + '</th><th>' + t('Fragen', 'Questions') + '</th><th>' + t('Neu', 'New') + '</th>' +
        [1, 2, 3, 4, 5].map(function (k) { return '<th>' + t('F', 'B') + k + '</th>'; }).join('') +
        '<th>' + t('Fällig', 'Due') + '</th><th>' + t('Leeres Blatt', 'Blank page') + '</th></tr></thead><tbody>' +
        st.rows.map(function (r) { return row(r, false); }).join('') + row(st.total, true) + '</tbody></table>';
      const week = up.reduce(function (a, b) { return a + b; }, 0);
      $('qzNext').textContent = t('Morgen fällig: ', 'Due tomorrow: ') + up[0] + ' · ' + t('in den nächsten 7 Tagen: ', 'in the next 7 days: ') + week;
    }
    let resetT = null;
    $('qzReset').addEventListener('click', function () {
      const b = $('qzReset');
      if (!b.classList.contains('armed')) {
        b.classList.add('armed');
        b.textContent = t('Wirklich alles zurücksetzen?', 'Really reset everything?');
        resetT = setTimeout(function () { b.classList.remove('armed'); b.textContent = t('Fortschritt zurücksetzen', 'Reset progress'); }, 4000);
        return;
      }
      clearTimeout(resetT);
      state = parse(JSON.stringify({ v: 1, filter: state.filter, newMax: state.newMax, blankCh: state.blankCh }));
      save();
      b.classList.remove('armed');
      b.textContent = t('Fortschritt zurücksetzen', 'Reset progress');
      stop();
      drawSummary(); drawProgress(); drawBlank();
    });

    drawFilter();
    drawSummary();
    drawBlank();
    drawProgress();
    // the date changes while the page stays open: refresh the counts when the chapter is shown again
    // (after the router has switched the chapter, hence the timeout)
    window.addEventListener('hashchange', function () { setTimeout(function () { if (visible() && !round) { drawSummary(); drawProgress(); } }, 0); });
  };
})();
