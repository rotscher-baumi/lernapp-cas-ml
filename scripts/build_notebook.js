// Builds notebooks/Lernapp_Uebungen.ipynb from the exercises in modules/*.js.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mods = [];
global.window = global;
global.LernApp = { register: (m) => mods.push(m) };
fs.readdirSync(path.join(root, 'modules')).filter((f) => f.endsWith('.js') && !f.startsWith('_')).forEach((f) => {
  const src = fs.readFileSync(path.join(root, 'modules', f), 'utf8');
  const before = mods.length;
  new Function('window', 'LernApp', src)(global, global.LernApp);
  // Modules written with real line breaks inside template literals carry the file's 2-space indent; \n-escaped ones do not.
  const indented = !/start:\s*`[^`]*\\n/.test(src);
  mods.slice(before).forEach((m) => { m.indented = indented; });
});
mods.sort((a, b) => (a.order || 0) - (b.order || 0));

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

const cells = [md('# Lernapp CAS ML: Python-Übungen\n\nGenerierte Notebook-Fassung der Übungen aus der Lernapp. Pro Aufgabe: Code anpassen, ausführen, dann die Prüf-Zelle ausführen. Ein `AssertionError` zeigt, was noch nicht stimmt. Neu erzeugen: `node scripts/build_notebook.js`.')];
mods.filter((m) => m.exercises && m.exercises.length).forEach((m) => {
  cells.push(md('## ' + m.title));
  m.exercises.forEach((ex, i) => {
    cells.push(md('### ' + (i + 1) + ' · ' + ex.t + '\n\n' + ex.task));
    cells.push(code(dedent(ex.start, m.indented)));
    cells.push(code('# Prüfen\n' + dedent(ex.check, m.indented) + '\nprint("✅ Richtig!")'));
    cells.push(md('<details><summary>Lösung zeigen</summary>\n\n```python\n' + dedent(ex.sol, m.indented) + '\n```\n\n</details>'));
  });
});
const nb = { cells, metadata: { kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' }, language_info: { name: 'python' } }, nbformat: 4, nbformat_minor: 5 };
cells.forEach((c, i) => { c.id = 'c' + i; });
const out = path.join(root, 'notebooks', 'Lernapp_Uebungen.ipynb');
fs.writeFileSync(out, JSON.stringify(nb, null, 1) + '\n');
console.log('written', out, cells.length, 'cells');
