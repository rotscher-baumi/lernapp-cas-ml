// Loads chapter files with a stub LernApp and checks the self-test items that have keyword groups (k) and choices (c):
// the model answer must contain every keyword group, and there must be at least three choices. Prints one line per problem.
const fs = require('fs');
const norm = (x) => String(x).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9α-ω]+/g, ' ').trim();
const deep = new Proxy(function () { return ''; }, { get: () => deep, apply: () => '' });
let cap = null;
const base = { t: (d) => d, register: (o) => { cap = o; }, translate: (id, o) => { cap = o; }, demos: {}, $: () => null, fmt: (x) => x };
global.LernApp = new Proxy(base, { get: (o, k) => (k in o ? o[k] : deep) });
global.window = global;
global.document = {};
let checked = 0;
for (const f of process.argv.slice(2)) {
  cap = null;
  new Function(fs.readFileSync(f, 'utf8')).call(global);
  for (const it of (cap && cap.quiz) || []) {
    if (!it.k && !it.c) continue;
    checked++;
    const a = ' ' + norm(it.a.replace(/<[^>]+>/g, ' ')) + ' ';
    const miss = (it.k || []).filter((g) => !g.some((x) => a.includes(norm(x)))).map((g) => g[0]);
    if (miss.length) console.log(f + ' | ' + it.q.slice(0, 50) + ' | model answer lacks: ' + miss.join('; '));
    if (it.c && it.c.length < 3) console.log(f + ' | ' + it.q.slice(0, 50) + ' | fewer than 3 choices');
  }
}
console.log('checked ' + checked);
