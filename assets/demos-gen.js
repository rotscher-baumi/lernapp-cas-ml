/* Demos of the «Generative Models» chapter. modules/gen.js calls LernApp.demos.gen() once the chapter is in the page. */
(function () {
  const { $, fmt } = LernApp;

  // ---- Library (no DOM) ----
  // KL divergence of N(mu, sigma²) from N(0, 1), summed over the latent dimensions:
  // ½ Σ (μ² + σ² − ln σ² − 1). Zero exactly when mu = 0 and sigma = 1.
  function klDiv(mu, sigma) {
    return 0.5 * mu.reduce((s, m, i) => s + m * m + sigma[i] * sigma[i] - Math.log(sigma[i] * sigma[i]) - 1, 0);
  }
  // Probability map of an 8×8 «7»: high on the strokes, low elsewhere (stands for what a trained PixelCNN would output).
  const SEVEN = ['01111110', '00000110', '00001100', '00011000', '00010000', '00110000', '00100000', '00100000'];
  const probOf = (idx) => (SEVEN[Math.floor(idx / 8)][idx % 8] === '1' ? 0.93 : 0.04);
  // Draws an 8×8 image pixel by pixel in raster order: every pixel is a Bernoulli draw from its own probability.
  function sampleImage(seed) {
    const rnd = LernApp.mulberry32(seed), out = [];
    for (let i = 0; i < 64; i++) out.push(rnd() < probOf(i) ? 1 : 0);
    return out;
  }
  LernApp.genLib = { klDiv, sampleImage, probOf };

  LernApp.demos.gen = function () {
    const T = LernApp.t;

    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('genFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Daten', '1 · Data'), T('Generative Modelle brauchen <b>keine Labels</b>: Die Bilder selbst sind das Ziel (unsupervised). Pixel auf 0 bis 1 oder −1 bis 1 skalieren. Gesucht wird die Verteilung der Daten, aus der man später neue Beispiele ziehen kann.', 'Generative models need <b>no labels</b>: the images themselves are the target (unsupervised). Scale pixels to 0 to 1 or −1 to 1. The goal is the distribution of the data, from which new examples can be drawn later.'), [['Autoencoder', '#gen-ae']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('<b>Autoencoder</b>: komprimieren und rekonstruieren. <b>VAE</b>: wie Autoencoder, aber mit geordnetem latent space, aus dem man ziehen kann. <b>PixelCNN</b>: ein Pixel nach dem anderen. <b>GAN</b>: Generator gegen Discriminator.', '<b>Autoencoder</b>: compress and reconstruct. <b>VAE</b>: like an autoencoder, but with an ordered latent space you can sample from. <b>PixelCNN</b>: one pixel after the other. <b>GAN</b>: generator against discriminator.'), [['Übersicht', '#gen-methoden']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('Autoencoder: Rekonstruktionsfehler. VAE: Rekonstruktion <b>plus KL-Term</b>. PixelCNN: Binary Cross-Entropy pro Pixel. GAN: zwei Losses im Wechsel (adversarial).', 'Autoencoder: reconstruction error. VAE: reconstruction <b>plus KL term</b>. PixelCNN: binary cross-entropy per pixel. GAN: two losses in alternation (adversarial).'), [['VAE', '#gen-vae'], ['GAN', '#gen-gan']]],
        '4': [T('4 · Forward pass', '4 · Forward pass'), T('Autoencoder: Encoder → Code z → Decoder. VAE: Encoder liefert μ und σ, daraus wird z gezogen, dann Decoder. PixelCNN: maskierte Faltung sagt für jeden Pixel die Wahrscheinlichkeit voraus. GAN: Generator macht aus Zufallsrauschen ein Bild, der Discriminator beurteilt echt oder falsch.', 'Autoencoder: encoder → code z → decoder. VAE: the encoder gives μ and σ, z is drawn from them, then the decoder. PixelCNN: a masked convolution predicts a probability for every pixel. GAN: the generator turns random noise into an image, the discriminator judges real or fake.'), [['PixelCNN', '#gen-pixel']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Vergleich mit dem Ziel: beim Autoencoder das Eingabebild selbst, beim PixelCNN jeder echte Pixel, beim GAN das Urteil des Discriminators.', 'Comparison with the target: for the autoencoder the input image itself, for the PixelCNN every real pixel, for the GAN the judgement of the discriminator.'), [['Autoencoder', '#gen-ae']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Das Ziehen von z im VAE ist zufällig, durch Zufall fliesst kein Gradient. Der <b>Reparametrisierungs-Trick</b> schreibt z = μ + σ · ε mit ε aus N(0, 1): Der Zufall steckt in ε, μ und σ bleiben ableitbar.', 'Drawing z in the VAE is random and no gradient flows through chance. The <b>reparameterization trick</b> writes z = μ + σ · ε with ε from N(0, 1): the randomness sits in ε, so μ and σ stay differentiable.'), [['VAE', '#gen-vae']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Wie überall: Optimizer, learning rate. Beim GAN abwechselnd: erst Discriminator, dann Generator, und beide müssen im Gleichgewicht bleiben.', 'As everywhere: optimizer, learning rate. For the GAN alternately: first the discriminator, then the generator, and both must stay in balance.'), [['GAN', '#gen-gan']]],
        '8': [T('8 · Validation prüfen', '8 · Check validation'), T('Kurven allein sagen wenig. <b>Beispiele ansehen</b>: Sind die Bilder scharf, vielfältig, sinnvoll? Typische Fehler: verwaschene Bilder (VAE), immer dieselben Bilder (GAN, <i>mode collapse</i>), Fehler im Muster (PixelCNN). Quantitativ z. B. FID.', 'Curves alone say little. <b>Look at samples</b>: are the images sharp, diverse, sensible? Typical failures: blurry images (VAE), always the same images (GAN, <i>mode collapse</i>), broken structure (PixelCNN). Quantitatively e.g. FID.'), [['Übersicht', '#gen-methoden']]],
        '9': [T('9 · Generieren', '9 · Generate'), T('Zum Schluss neue Beispiele erzeugen: z aus N(0, 1) ziehen und decodieren (VAE), Pixel für Pixel samplen (PixelCNN), Rauschen durch den Generator schicken (GAN). Dazu <b>interpolieren</b>: zwei Codes mischen und die Zwischenbilder ansehen.', 'Finally, generate new examples: draw z from N(0, 1) and decode (VAE), sample pixel by pixel (PixelCNN), send noise through the generator (GAN). Also <b>interpolate</b>: mix two codes and look at the images in between.'), [['VAE', '#gen-vae']]],
      };
      let cur = null;
      function close() {
        panel.hidden = true; cur = null;
        steps.forEach((g) => { g.classList.remove('on'); g.setAttribute('aria-expanded', 'false'); });
      }
      function open(k) {
        if (cur === k) { close(); return; }
        const d = S[k]; if (!d) return;
        cur = k;
        panel.querySelector('.ab-dh b').textContent = d[0];
        panel.querySelector('.ab-db').innerHTML = d[1];
        panel.querySelector('.ab-dl').innerHTML = d[2].map((l) => '<a href="' + l[1] + '">' + l[0] + ' →</a>').join('');
        panel.hidden = false;
        steps.forEach((g) => { const on = g.getAttribute('data-s') === k; g.classList.toggle('on', on); g.setAttribute('aria-expanded', on ? 'true' : 'false'); });
      }
      steps.forEach((g) => {
        g.addEventListener('click', () => open(g.getAttribute('data-s')));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g.getAttribute('data-s')); } });
      });
      panel.querySelector('.ab-x').addEventListener('click', close);
    })();

    // Demo 1: PixelCNN reads only pixels above and to the left; sampling fills the canvas in raster order
    (function () {
      if (!$('pxSvg')) return;
      let k = 20, seed = 1;
      const C = 20;
      function grid(x0, y0, fn) {
        let s = '';
        for (let i = 0; i < 64; i++) {
          const f = fn(i);
          s += '<rect x="' + (x0 + (i % 8) * C) + '" y="' + (y0 + Math.floor(i / 8) * C) + '" width="' + C + '" height="' + C + '" style="fill:' + f[0] + ';fill-opacity:' + f[1] + ';stroke:var(--line);stroke-width:1"/>';
        }
        return s;
      }
      function draw() {
        const img = sampleImage(seed);
        const mask = grid(8, 30, (i) => (i < k ? ['var(--accent)', 0.55] : i === k ? ['var(--warn)', 0.85] : ['var(--fg)', 0.04]));
        const canvas = grid(240, 30, (i) => (i < k ? ['var(--fg)', img[i] ? 0.85 : 0.04] : i === k ? ['var(--warn)', 0.35] : ['var(--fg)', 0.02]));
        $('pxSvg').innerHTML = '<text class="lbl" x="8" y="20">' + T('Was das Netz sieht (blau)', 'What the network sees (blue)') + '</text><text class="lbl" x="240" y="20">' + T('Bis jetzt gezeichnet', 'Drawn so far') + '</text>' + mask + canvas;
        $('pxKO').textContent = k + ' / 63';
        const p = probOf(k);
        $('pxP').textContent = fmt(p, 2);
        $('pxMsg').textContent = T('Pixel ' + k + ' (orange): Das Netz sieht nur die ' + k + ' blauen Pixel davor und sagt p(Pixel = 1) = ' + fmt(p, 2) + ' voraus. Dann wird gewürfelt: ' + (img[k] ? 'schwarz' : 'weiss') + '.',
          'Pixel ' + k + ' (orange): the network sees only the ' + k + ' blue pixels before it and predicts p(pixel = 1) = ' + fmt(p, 2) + '. Then a die is rolled: ' + (img[k] ? 'dark' : 'white') + '.');
      }
      $('pxK').addEventListener('input', (e) => { k = +e.target.value; draw(); });
      $('pxNew').addEventListener('click', () => { seed++; draw(); });
      draw();
    })();

    // Demo 2: VAE latent distribution, sampling with the reparameterization trick and the KL term
    (function () {
      if (!$('vaSvg')) return;
      const rnd = LernApp.mulberry32(11), E = [];
      for (let i = 0; i < 40; i++) E.push([LernApp.gauss(rnd), LernApp.gauss(rnd)]);
      let m1 = 1.2, m2 = -0.8, sg = 0.5;
      const SC = 36, CX = 150, CY = 120;
      function draw() {
        let s = '<line x1="10" y1="' + CY + '" x2="290" y2="' + CY + '" style="stroke:var(--line)"/><line x1="' + CX + '" y1="10" x2="' + CX + '" y2="230" style="stroke:var(--line)"/>';
        [1, 2].forEach((r) => { s += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r * SC + '" style="fill:none;stroke:var(--muted);stroke-width:1.2;stroke-dasharray:4 4"/>'; });
        s += '<text class="lbl" x="' + (CX + 4) + '" y="' + (CY - SC - 3) + '">N(0, 1)</text>';
        E.forEach((e) => { s += '<circle cx="' + (CX + (m1 + sg * e[0]) * SC) + '" cy="' + (CY - (m2 + sg * e[1]) * SC) + '" r="3.5" style="fill:var(--accent);fill-opacity:.7"/>'; });
        s += '<circle cx="' + (CX + m1 * SC) + '" cy="' + (CY - m2 * SC) + '" r="5" style="fill:var(--warn)"/>';
        $('vaSvg').innerHTML = s;
        $('vaM1O').textContent = fmt(m1, 1); $('vaM2O').textContent = fmt(m2, 1); $('vaSO').textContent = fmt(sg, 2);
        const kl = klDiv([m1, m2], [sg, sg]);
        $('vaKL').textContent = fmt(kl, 2);
        $('vaMsg').textContent = kl < 0.3 ? T('Fast N(0, 1): Der latent space ist gut gefüllt, ein zufälliger Punkt daraus ergibt ein sinnvolles Bild.', 'Almost N(0, 1): the latent space is well filled, a random point from it gives a sensible image.')
          : sg < 0.25 ? T('σ klein: fast ein Punkt wie beim normalen Autoencoder. Rekonstruktion wäre scharf, aber die Umgebung des Punktes ist leer und der KL-Term hoch.', 'σ small: almost a point as in the plain autoencoder. Reconstruction would be sharp, but the surroundings of the point are empty and the KL term is high.')
            : T('Weit weg von N(0, 1): Der KL-Term zieht μ zum Ursprung und σ Richtung 1.', 'Far from N(0, 1): the KL term pulls μ to the origin and σ towards 1.');
      }
      [['vaM1', (v) => { m1 = v; }], ['vaM2', (v) => { m2 = v; }], ['vaS', (v) => { sg = v; }]].forEach((p) => $(p[0]).addEventListener('input', (e) => { p[1](+e.target.value); draw(); }));
      draw();
    })();
  };
})();
