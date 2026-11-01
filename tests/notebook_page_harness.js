// Runs the inline scripts of notebook.html against a minimal fake DOM and prints what happened as JSON.
// Input on stdin: {scenario: {...}, scripts: [...]}; used by tests/test_notebook_page.py.
const fs = require('fs');
const { scenario, scripts, hiddenIds } = JSON.parse(fs.readFileSync(0, 'utf8'));

class El {
  constructor() {
    this.hidden = false; this.disabled = false; this.children = []; this.attrs = {}; this.listeners = {};
    this.textContent = ''; this.innerHTML = ''; this.title = ''; this.className = ''; this.href = ''; this.src = '';
  }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  click() { (this.listeners.click || []).forEach((fn) => fn()); }
}

const els = {};
const documentStub = {
  documentElement: Object.assign(new El(), { lang: 'de' }),
  getElementById: (id) => (els[id] = els[id] || new El()),
  createElement: () => new El(),
  querySelectorAll: () => [],
};
hiddenIds.forEach((id) => { documentStub.getElementById(id).hidden = true; }); // elements that start hidden in the HTML
const store = Object.assign({}, scenario.storage);
const calls = [];
const fetchStub = (url, opts) => {
  calls.push({ url, method: (opts && opts.method) || 'GET', headers: (opts && opts.headers) || {} });
  if (url.startsWith('/api/jupyter/start')) {
    return Promise.resolve({ status: 200, json: () => Promise.resolve(scenario.startResponse || { status: 'starting' }) });
  }
  return scenario.jupyterUp ? Promise.resolve({ ok: true }) : Promise.reject(new Error('Jupyter is down'));
};

new Function('document', 'location', 'localStorage', 'fetch', 'setTimeout', scripts.join('\n'))(
  documentStub,
  { search: scenario.search || '', hostname: scenario.hostname },
  { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } },
  fetchStub,
  () => 0,
);

const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
(async () => {
  await wait();
  if (scenario.click) { documentStub.getElementById(scenario.click).click(); await wait(); }
  const get = (id) => documentStub.getElementById(id);
  console.log(JSON.stringify({
    paneLocalHidden: get('paneLocal').hidden,
    paneColabHidden: get('paneColab').hidden,
    pressed: { local: get('modeLocal').attrs['aria-pressed'], colab: get('modeColab').attrs['aria-pressed'] },
    localDisabled: get('modeLocal').disabled,
    localTitle: get('modeLocal').title,
    examples: get('listExamples').children.length,
    others: get('listOthers').children.length,
    firstLink: get('listExamples').children[0].children[0].href,
    picked: get('listExamples').children.concat(get('listOthers').children).filter((li) => li.className === 'pick').length,
    pickHidden: get('colabPick').hidden,
    pickHref: get('colabPickLink').href,
    pickText: get('colabPickLink').textContent,
    frameSrc: get('nbframe').src,
    frameHidden: get('nbframe').hidden,
    missHidden: get('nbmiss').hidden,
    startDisabled: get('nbstart').disabled,
    hint: get('modeHint').textContent,
    fetchCalls: calls,
    storage: store,
  }));
})();
