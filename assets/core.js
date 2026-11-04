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
 *   quiz      optional [{ q, a }] self-test questions (HTML allowed)
 *   notebooks optional [{ file, desc }] files in lernapp/notebooks
 *   init()    optional, called once after the chapter is in the page
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
      html += '<h3>' + t('Selbsttest', 'Self-test') + '</h3><p class="note">' + t('Antworte zuerst im Kopf, dann klappe auf.', 'Answer in your head first, then open the answer.') + '</p>' +
        m.quiz.map(function (it) {
          return '<details class="q"><summary>' + it.q + '</summary><div class="a">' + it.a + '</div></details>';
        }).join('');
    }
    sec.innerHTML = html;
    return sec;
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

    wireNav();
    if (location.hash.length > 1) {
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) t.scrollIntoView();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
