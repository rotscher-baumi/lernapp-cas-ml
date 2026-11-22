// Loads assets/demos-quiz.js without a DOM and runs one call of LernApp.quizLogic; prints the result as JSON.
// Input on stdin: {fn: 'name', args: [...], seed?: number}; used by tests/test_quiz.py.
// A seed replaces the random source (last argument of interleave, opts.rnd of queue) with a fixed sequence.
const fs = require('fs');
const path = require('path');
const { fn, args, seed } = JSON.parse(fs.readFileSync(0, 'utf8'));
global.window = global;
global.LernApp = { demos: {} };
eval(fs.readFileSync(path.join(__dirname, '..', 'assets', 'demos-quiz.js'), 'utf8')); // eslint-disable-line no-eval
const Q = global.LernApp.quizLogic;
const rnd = (a) => () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; };
if (seed !== undefined) {
  if (fn === 'interleave') args[1] = rnd(seed);
  if (fn === 'queue') args[3].rnd = rnd(seed);
}
if (fn === 'parse' && args[0] !== null && typeof args[0] !== 'string') args[0] = JSON.stringify(args[0]);
process.stdout.write(JSON.stringify(Q[fn].apply(null, args)));
