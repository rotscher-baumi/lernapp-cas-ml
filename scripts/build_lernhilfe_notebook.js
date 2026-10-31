// Builds notebooks/Lernapp_Lernhilfe.ipynb: all chapters of index.html as editable markdown cells plus the exercises.
// Diagrams and interactive demos only work on the webpage and are replaced by a short note.
// Running this again overwrites the notebook, so copy it before regenerating if you edited it.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...index.matchAll(/modules\/([\w-]+)\.js/g)].map((m) => m[1]);
const mods = [];
global.window = global;
global.LernApp = { register: (m) => mods.push(m) };
files.forEach((f) => {
  const src = fs.readFileSync(path.join(root, 'modules', f + '.js'), 'utf8');
  const before = mods.length;
  new Function('window', 'LernApp', src)(global, global.LernApp);
  const indented = !/start:\s*`[^`]*\\n/.test(src);
  mods.slice(before).forEach((m) => { m.indented = indented; });
});
mods.sort((a, b) => (a.order || 0) - (b.order || 0));

/* ---------- minimal HTML parser ---------- */
const VOID = new Set(['br', 'hr', 'img', 'input', 'line', 'circle', 'rect', 'path', 'ellipse', 'polyline', 'polygon', 'stop']);
function parse(html) {
  const root = { tag: 'root', attrs: '', kids: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|[^<]+|</g;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[0].startsWith('<!--')) continue;
    if (m[2] === undefined) { top.kids.push({ text: m[0] }); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
    } else {
      const n = { tag, attrs: m[3], kids: [] };
      top.kids.push(n);
      if (!VOID.has(tag) && !/\/\s*$/.test(m[3])) stack.push(n);
    }
  }
  return root;
}
const cls = (n) => ((/class="([^"]*)"/.exec(n.attrs) || [])[1] || '').split(/\s+/);
const rawText = (n) => (n.text !== undefined ? n.text : n.kids.map(rawText).join(''));
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

function inline(n) {
  if (n.text !== undefined) return n.text.replace(/\s+/g, ' ');
  const k = () => n.kids.map(inline).join('');
  switch (n.tag) {
    case 'b': case 'strong': { const t = k().trim(); return t ? '**' + t + '**' : ''; }
    case 'i': case 'em': { const t = k().trim(); return t ? '*' + t + '*' : ''; }
    case 'code': { const t = decode(rawText(n)); return t.includes('`') ? '``' + t + '``' : '`' + t + '`'; }
    case 'a': return '[' + k() + '](' + ((/href="([^"]*)"/.exec(n.attrs) || [])[1] || '') + ')';
    case 'br': return '  \n';
    case 'sup': case 'sub': return '<' + n.tag + '>' + k() + '</' + n.tag + '>';
    case 'svg': case 'figure': case 'button': case 'input': case 'output': case 'select': case 'label': return '';
    case 'ul': case 'ol': return '\n' + list(n, 0);
    default: return k();
  }
}
const tidy = (s) => s.replace(/[ \t]+\n/g, '\n').replace(/ {2,}/g, ' ').trim();

function list(n, depth) {
  let i = 0;
  return n.kids.filter((c) => c.tag === 'li').map((li) => {
    i++;
    const bullet = n.tag === 'ol' ? i + '. ' : '- ';
    const sub = [];
    const text = li.kids.map((c) => {
      if (c.tag === 'ul' || c.tag === 'ol') { sub.push(list(c, depth + 1)); return ''; }
      return inline(c);
    }).join('');
    return '   '.repeat(depth) + bullet + tidy(text) + '\n' + sub.join('');
  }).join('');
}

function table(n) {
  const rows = [];
  (function walk(x) { if (x.tag === 'tr') rows.push(x.kids.filter((c) => c.tag === 'th' || c.tag === 'td')); else (x.kids || []).forEach(walk); })(n);
  if (!rows.length) return '';
  const cell = (c) => tidy(c.kids.map(inline).join('')).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const w = Math.max(...rows.map((r) => r.length));
  const line = (r) => '| ' + Array.from({ length: w }, (_, i) => (r[i] ? cell(r[i]) : '')).join(' | ') + ' |';
  return [line(rows[0]), '|' + ' --- |'.repeat(w), ...rows.slice(1).map(line)].join('\n') + '\n\n';
}

const quote = (label, body) => '> **' + label + '**\n' + body.trim().split('\n').map((l) => '> ' + l).join('\n') + '\n\n';

const INLINE = new Set(['b', 'strong', 'i', 'em', 'code', 'a', 'span', 'sup', 'sub', 'br']);
/* Renders child nodes; runs of text and inline tags become one paragraph. */
function blocks(kids) {
  let out = '';
  let run = [];
  const flush = () => { const t = tidy(run.map(inline).join('')); if (t) out += t + '\n\n'; run = []; };
  kids.forEach((k) => { if (k.text !== undefined || INLINE.has(k.tag)) run.push(k); else { flush(); out += block(k); } });
  flush();
  return out;
}

function block(n) {
  if (n.text !== undefined) { const t = n.text.replace(/\s+/g, ' ').trim(); return t ? t + '\n\n' : ''; }
  const kids = () => blocks(n.kids);
  const c = cls(n);
  switch (n.tag) {
    case 'h3': return '### ' + tidy(n.kids.map(inline).join('')) + '\n\n';
    case 'h4': return '#### ' + tidy(n.kids.map(inline).join('')) + '\n\n';
    case 'p': { const t = tidy(n.kids.map(inline).join('')); return t ? (c.includes('note') ? '*' + t + '*' : t) + '\n\n' : ''; }
    case 'ul': case 'ol': return list(n, 0) + '\n';
    case 'pre': { const t = decode(rawText(n)).replace(/\n+$/, ''); return '```' + (/\b(import|def|print\(|for .* in)\b/.test(t) ? 'python' : '') + '\n' + t + '\n```\n\n'; }
    case 'table': return table(n);
    case 'figure': { const cap = n.kids.find((x) => x.tag === 'figcaption'); return '*[Diagramm' + (cap ? ': ' + tidy(inline({ tag: 'span', kids: cap.kids })) : '') + ' — nur auf der Webseite]*\n\n'; }
    case 'svg': return '';
    case 'details': {
      const s = n.kids.find((x) => x.tag === 'summary');
      return '<details><summary>' + (s ? tidy(s.kids.map(inline).join('')) : '') + '</summary>\n\n' + n.kids.filter((x) => x !== s).map(block).join('') + '</details>\n\n';
    }
    case 'div':
      if (c.includes('demo')) { const tag = n.kids.find((x) => cls(x).includes('tag')); return '*[Interaktive Demo' + (tag ? ': ' + tidy(rawText(tag)) : '') + ' — nur auf der Webseite]*\n\n'; }
      if (c.includes('merk')) return quote('Merksatz', kids().replace(/^\*\*Merksatz\*\*\s*/, ''));
      if (c.includes('falle')) return quote('Falle', kids());
      if (c.includes('steps')) return n.kids.filter((x) => cls(x).includes('st')).map((x) => '- ' + tidy(x.kids.map(inline).join(' '))).join('\n') + '\n\n';
      if (c.includes('btnrow') || c.includes('toc') || c.includes('ctl')) return '';
      return kids();
    case 'button': case 'script': case 'style': return '';
    default: return kids();
  }
}
const toMd = (html) => block(parse(html)).replace(/\n{3,}/g, '\n\n').trim();

/* ---------- notebook ---------- */
const dedent = (s, on) => {
  if (!on) return s;
  const l = s.split('\n');
  const rest = l.slice(1).filter((x) => x.trim());
  const n = rest.length ? Math.min(...rest.map((x) => x.match(/^ */)[0].length)) : 0;
  return [l[0], ...l.slice(1).map((x) => x.slice(Math.min(n, x.match(/^ */)[0].length)))].join('\n');
};
const lines = (s) => s.split('\n').map((x, i, a) => (i < a.length - 1 ? x + '\n' : x));
const md = (s) => ({ cell_type: 'markdown', metadata: {}, source: lines(s) });
const code = (s) => ({ cell_type: 'code', metadata: {}, execution_count: null, outputs: [], source: lines(s) });
const plain = (h) => toMd(h || '');

const cells = [md('# CAS ML Lernhilfe\n\nNotebook-Fassung der Lernseite: Texte lassen sich frei bearbeiten, Code läuft mit echtem Python. Diagramme und interaktive Demos gibt es nur auf der Webseite.')];
mods.forEach((m) => {
  cells.push(md('## ' + m.title + (m.kicker ? '\n\n*' + plain(m.kicker) + '*' : '') + (m.summary ? '\n\n' + plain(m.summary) : '')));
  if (m.html) cells.push(md(toMd(m.html)));
  (m.notebooks || []).forEach((nb) => cells.push(md('> **Übungs-Notebook** `notebooks/' + nb.file + '`\n> ' + plain(nb.desc))));
  if (m.exercises && m.exercises.length) {
    cells.push(md('### Python-Übungen\n\nCode anpassen, ausführen, dann die Prüf-Zelle ausführen. Ein `AssertionError` zeigt, was noch nicht stimmt.'));
    m.exercises.forEach((ex, i) => {
      cells.push(md('#### ' + (i + 1) + ' · ' + ex.t + '\n\n' + plain(ex.task)));
      cells.push(code(dedent(ex.start, m.indented)));
      cells.push(code('# Prüfen\n' + dedent(ex.check, m.indented) + '\nprint("✅ Richtig!")'));
      cells.push(md('<details><summary>Lösung zeigen</summary>\n\n```python\n' + dedent(ex.sol, m.indented) + '\n```\n\n</details>'));
    });
  }
  if (m.quiz && m.quiz.length) {
    cells.push(md('### Selbsttest\n\n' + m.quiz.map((q) => '<details><summary>' + tidy(plain(q.q)) + '</summary>\n\n' + plain(q.a) + '\n\n</details>').join('\n\n')));
  }
});
cells.forEach((c, i) => { c.id = 'c' + i; });
const nb = { cells, metadata: { kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' }, language_info: { name: 'python' } }, nbformat: 4, nbformat_minor: 5 };
const out = path.join(root, 'notebooks', 'Lernapp_Lernhilfe.ipynb');
fs.writeFileSync(out, JSON.stringify(nb, null, 1) + '\n');
console.log('written', out, cells.length, 'cells');
