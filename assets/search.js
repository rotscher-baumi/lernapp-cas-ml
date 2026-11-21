/*
 * Full-text search for the main page. Builds a sticky bar around the chapter navigation (nav.chips) with a search field,
 * a result list (chapter › section, snippet) and previous/next buttons. Searches the visible text of the current language,
 * ignores case and accents and treats ä/ö/ü/ß like ae/oe/ue/ss. Matches are marked with the CSS Custom Highlight API
 * (no DOM changes, so demos keep working); browsers without it still get the result list and jumping.
 * Keys: / or Ctrl+K focus the field, Enter / Shift+Enter next / previous, ↓ into the list, Esc clears.
 * Runs after core.js has rendered the chapters (DOMContentLoaded listener registered later). Hidden chapters (class "off",
 * one chapter view) are searched too; jumping to a match there opens its chapter through LernApp.showChapter.
 */
(function () {
  'use strict';
  const MAX_LIST = 12, MIN_LEN = 2;
  const SKIP = 'script,style,svg,canvas,input,select,textarea,button,nav,.srch,header.top,.hdrsw,[hidden],[aria-hidden="true"]';
  const BLOCK = 'p,li,td,th,h1,h2,h3,h4,h5,summary,div,pre,dt,dd,figcaption,label,section,details,table,tr,ul,ol';
  const FOLD = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'æ': 'ae', 'œ': 'oe' };
  const hasHL = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight === 'function';

  // Lower-case, umlauts to two letters, other accents removed. Returns the folded string and, for every folded
  // character, the index of the original character it came from.
  function fold(str) {
    let out = '';
    const map = [];
    for (let i = 0; i < str.length; i++) {
      const ch = str[i].toLowerCase();
      const f = FOLD[ch] || ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
      for (let k = 0; k < f.length; k++) { out += f[k]; map.push(i); }
    }
    return { s: out, map: map };
  }

  function start() {
    const T = window.LernApp ? window.LernApp.t : (de) => de;
    const chips = document.getElementById('chips');
    if (!chips) return;

    // Sticky bar: search row above the chapter chips
    const bar = document.createElement('div');
    bar.className = 'topbar';
    chips.parentNode.insertBefore(bar, chips);
    bar.innerHTML = '<div class="srch" role="search">' +
      '<input type="search" id="srchIn" autocomplete="off" spellcheck="false" placeholder="' + T('Suchen … (Taste /)', 'Search … (key /)') + '" aria-label="' + T('Im Lernstoff suchen', 'Search the material') + '" aria-controls="srchList" aria-expanded="false">' +
      '<span class="srch-n" id="srchN" aria-live="polite"></span>' +
      '<button type="button" id="srchPrev" aria-label="' + T('Vorheriger Treffer', 'Previous match') + '" disabled>▲</button>' +
      '<button type="button" id="srchNext" aria-label="' + T('Nächster Treffer', 'Next match') + '" disabled>▼</button>' +
      '<button type="button" id="srchX" aria-label="' + T('Suche schliessen', 'Close search') + '" hidden>✕</button>' +
      '<div class="srch-list" id="srchList" role="listbox" aria-label="' + T('Treffer', 'Matches') + '" hidden></div></div>';
    bar.appendChild(chips);

    const input = document.getElementById('srchIn'), list = document.getElementById('srchList'), count = document.getElementById('srchN');
    const prev = document.getElementById('srchPrev'), next = document.getElementById('srchNext'), clear = document.getElementById('srchX');
    let hits = [], cur = -1, timer = null;

    // Index: all visible text nodes of the overview and the chapters, joined to one folded string
    function buildIndex() {
      const roots = [document.getElementById('ueberblick'), document.getElementById('modules')].filter(Boolean);
      const nodes = [];
      let text = '', lastBlock = null;
      roots.forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => (!n.nodeValue.trim() || n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
        });
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const block = n.parentElement.closest(BLOCK);
          if (lastBlock && block !== lastBlock) text += ' ';
          lastBlock = block;
          const f = fold(n.nodeValue);
          nodes.push({ node: n, start: text.length, map: f.map });
          text += f.s;
        }
      });
      return { text: text, nodes: nodes };
    }
    // Folded position → (text node, offset in the original string)
    function locate(idx, pos, end) {
      let lo = 0, hi = idx.nodes.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (idx.nodes[mid].start <= pos) lo = mid; else hi = mid - 1; }
      const e = idx.nodes[lo], k = Math.min(pos - e.start, e.map.length - 1);
      if (k < 0) return { node: e.node, offset: 0 };
      return { node: e.node, offset: end ? e.map[k] + 1 : e.map[k] };
    }
    function context(node) {
      const el = node.parentElement, sec = el.closest('section');
      let head = null;
      if (sec) {
        const hs = sec.querySelectorAll('h3, h4');
        for (let i = 0; i < hs.length; i++) {
          if (hs[i].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING || hs[i].contains(el)) head = hs[i];
        }
      }
      const chip = sec ? chips.querySelector('a[href="#' + sec.id + '"]') : null;
      return { chapter: chip ? chip.textContent : (sec && sec.querySelector('h2') ? sec.querySelector('h2').textContent : ''), section: head ? head.textContent : '' };
    }
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    function search(q) {
      hits = []; cur = -1;
      const fq = fold(q.trim()).s.replace(/\s+/g, ' ');
      if (fq.length >= MIN_LEN) {
        const idx = buildIndex();
        let p = idx.text.indexOf(fq);
        while (p !== -1 && hits.length < 2000) {
          const a = locate(idx, p, false), b = locate(idx, p + fq.length - 1, true);
          const r = document.createRange();
          try { r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset); } catch (e) { p = idx.text.indexOf(fq, p + 1); continue; }
          hits.push({ range: r, node: a.node });
          p = idx.text.indexOf(fq, p + fq.length);
        }
      }
      paint();
      renderList(q);
    }
    function paint() {
      if (!hasHL) return;
      CSS.highlights.delete('srch'); CSS.highlights.delete('srch-cur');
      if (!hits.length) return;
      CSS.highlights.set('srch', new Highlight(...hits.map((h) => h.range)));
      if (cur >= 0) CSS.highlights.set('srch-cur', new Highlight(hits[cur].range));
    }
    // Snippet from the text of the whole paragraph (or cell, list item …) around the match, not only its text node
    function snippet(h) {
      const blk = h.node.parentElement.closest('p,li,td,th,h3,h4,summary,dd,dt,figcaption,pre,label,div') || h.node.parentElement;
      const before = document.createRange();
      before.setStart(blk, 0);
      before.setEnd(h.range.startContainer, h.range.startOffset);
      const v = blk.textContent, s = before.toString().length, e = s + h.range.toString().length;
      const a = Math.max(0, s - 45), b = Math.min(v.length, e + 60);
      return (a > 0 ? '…' : '') + esc(v.slice(a, s)) + '<mark>' + esc(v.slice(s, e)) + '</mark>' + esc(v.slice(e, b)) + (b < v.length ? '…' : '');
    }
    function renderList(q) {
      const on = q.trim().length >= MIN_LEN;
      clear.hidden = !q;
      prev.disabled = next.disabled = !hits.length;
      count.textContent = !on ? '' : hits.length ? (cur >= 0 ? (cur + 1) + ' / ' : '') + hits.length : T('kein Treffer', 'no match');
      if (!on || !hits.length) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); list.innerHTML = ''; return; }
      list.innerHTML = hits.slice(0, MAX_LIST).map((h, i) => {
        const c = context(h.node);
        return '<button type="button" role="option" data-i="' + i + '"><span class="srch-where">' + esc(c.chapter) + (c.section ? ' › ' + esc(c.section) : '') + '</span><span class="srch-snip">' + snippet(h) + '</span></button>';
      }).join('') + (hits.length > MAX_LIST ? '<div class="srch-more">' + T('Weitere ' + (hits.length - MAX_LIST) + ' Treffer mit ▼ oder Enter', (hits.length - MAX_LIST) + ' more matches with ▼ or Enter') + '</div>' : '');
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
    function go(i) {
      if (!hits.length) return;
      cur = (i + hits.length) % hits.length;
      const h = hits[cur];
      // index.html shows one chapter at a time: a match in a hidden chapter (class "off") opens that chapter first
      const off = h.node.parentElement.closest('section.off');
      if (off && window.LernApp && window.LernApp.showChapter) window.LernApp.showChapter(off.id);
      // Matches inside a closed self-test answer or a collapsed block: open it first
      for (let d = h.node.parentElement.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
      const el = h.node.parentElement;
      const r = h.range.getBoundingClientRect(), barH = bar.getBoundingClientRect().bottom;
      if (r.height) window.scrollTo({ top: window.scrollY + r.top - barH - Math.max(60, (window.innerHeight - barH) / 3), behavior: 'smooth' });
      else el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      paint();
      count.textContent = (cur + 1) + ' / ' + hits.length;
      if (!hasHL) { el.classList.add('srch-flash'); setTimeout(() => el.classList.remove('srch-flash'), 1500); }
    }
    function closeList() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    function reset() {
      input.value = ''; hits = []; cur = -1; paint(); renderList('');
    }

    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => search(input.value), 150); });
    input.addEventListener('focus', () => { if (hits.length && input.value) { list.hidden = false; input.setAttribute('aria-expanded', 'true'); } });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); if (!hits.length) search(input.value); go(cur + (e.shiftKey ? -1 : 1)); closeList(); }
      else if (e.key === 'ArrowDown' && !list.hidden) { e.preventDefault(); const b = list.querySelector('button'); if (b) b.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); if (!list.hidden) closeList(); else { reset(); input.blur(); } }
    });
    list.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) { go(+b.dataset.i); closeList(); } });
    list.addEventListener('keydown', (e) => {
      const bs = Array.prototype.slice.call(list.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (bs[i + 1]) bs[i + 1].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (i > 0) bs[i - 1].focus(); else input.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeList(); input.focus(); }
    });
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    clear.addEventListener('click', () => { reset(); input.focus(); });
    document.addEventListener('click', (e) => { if (!bar.contains(e.target)) closeList(); });
    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); input.focus(); input.select(); }
    });
  }

  window.LernAppSearch = { fold: fold };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
