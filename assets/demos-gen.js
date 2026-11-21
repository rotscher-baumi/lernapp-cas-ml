/* Demos and figures of the «Generative Models» chapter.
   LernApp.genFig builds the static SVG figures; modules/gen.js and modules/en/gen.js call it inside their html (this file
   loads before the modules, and LernApp.t already knows the language). LernApp.demos.gen() wires the demos once the
   chapter is in the page. */
(function () {
  const { $, fmt } = LernApp;
  const T = LernApp.t;

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

  // Diffusion noise schedules with T = 1000 steps. alphaBar[t] = Π_{s ≤ t} (1 − β_s); alphaBar[0] = 1 (clean image).
  // linear: β from 1e-4 to 0.02 (DDPM, Ho et al. 2020). cosine: Nichol & Dhariwal 2021, s = 0.008.
  const TT = 1000;
  function alphaBars(kind) {
    const a = [1];
    if (kind === 'cos') {
      const f = (t) => Math.cos(((t / TT + 0.008) / 1.008) * Math.PI / 2) ** 2;
      for (let t = 1; t <= TT; t++) a.push(Math.max(f(t) / f(0), 1e-5));
    } else {
      let p = 1;
      for (let t = 1; t <= TT; t++) { p *= 1 - (1e-4 + (0.02 - 1e-4) * (t - 1) / (TT - 1)); a.push(p); }
    }
    return a;
  }
  // Direct jump from x0 to x_t: x_t = √ᾱ_t · x0 + √(1 − ᾱ_t) · ε
  const noisy = (x0, eps, ab) => x0.map((v, i) => Math.sqrt(ab) * v + Math.sqrt(1 - ab) * eps[i]);
  // 16 × 16 test image in [−1, 1]: a ring with a dot (a simple «object» that clearly fades into noise)
  function testImg(n) {
    const out = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const dx = (x + 0.5) / n - 0.5, dy = (y + 0.5) / n - 0.5, r = Math.hypot(dx, dy);
      out.push((r > 0.26 && r < 0.4) || r < 0.1 ? 1 : -1);
    }
    return out;
  }
  function noiseVec(n, seed) {
    const r = LernApp.mulberry32(seed), out = [];
    for (let i = 0; i < n; i++) out.push(LernApp.gauss(r));
    return out;
  }

  // 1D GAN with exact expectations (quadrature over z ~ N(0, 1)), so the demo is deterministic.
  // Data: N(2, 0.5²). Generator: G(z) = a·z + b, i.e. N(b, a²). Discriminator: D(x) = σ(w0 + w1·x + w2·x²).
  // D step: gradient ascent on E log D(x_real) + E log(1 − D(G(z))). G step (non-saturating): ascent on E log D(G(z)).
  const QZ = [], QW = [];
  (function () { let s = 0; for (let i = 0; i <= 60; i++) { const z = -3 + i * 0.1; QZ.push(z); QW.push(Math.exp(-z * z / 2)); s += QW[i]; } for (let i = 0; i <= 60; i++) QW[i] /= s; })();
  const sig = (u) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, u))));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const DATA = { mu: 2, sd: 0.5 };
  function ganInit() { return { a: 1, b: -2, w: [0, 0, 0], step: 0 }; }
  function dOf(st, x) { return sig(st.w[0] + st.w[1] * x + st.w[2] * x * x); }
  function ganStep(st, lrD, lrG) {
    const g = [0, 0, 0];
    QZ.forEach((z, i) => {
      const p = QW[i];
      let x = DATA.mu + DATA.sd * z, d = dOf(st, x);
      g[0] += p * (1 - d); g[1] += p * (1 - d) * x; g[2] += p * (1 - d) * x * x;
      x = st.a * z + st.b; d = dOf(st, x);
      g[0] -= p * d; g[1] -= p * d * x; g[2] -= p * d * x * x;
    });
    st.w = st.w.map((v, i) => clamp(v + lrD * g[i], -25, 25));
    let ga = 0, gb = 0;
    QZ.forEach((z, i) => {
      const x = st.a * z + st.b, d = dOf(st, x), up = st.w[1] + 2 * st.w[2] * x;
      ga += QW[i] * (1 - d) * up * z; gb += QW[i] * (1 - d) * up;
    });
    st.a = clamp(st.a + lrG * ga, -6, 6); st.b = clamp(st.b + lrG * gb, -8, 8);
    st.step++;
    return st;
  }
  function ganMeans(st) {
    let r = 0, f = 0;
    QZ.forEach((z, i) => { r += QW[i] * dOf(st, DATA.mu + DATA.sd * z); f += QW[i] * dOf(st, st.a * z + st.b); });
    return [r, f];
  }
  LernApp.genLib = { klDiv, sampleImage, probOf, alphaBars, noisy, ganInit, ganStep, ganMeans };

  // ---- Static figures ----
  function block(x, y, w, h, cls, lines) {
    let s = '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>';
    const top = y + h / 2 - (lines.length - 1) * 9;
    lines.forEach((l, i) => {
      if (l) s += '<text class="' + (i ? 'd-m' : 'd-tb') + '" x="' + (x + w / 2) + '" y="' + (top + i * 18) + '"' + (i ? '' : ' style="font-size:13px"') + '>' + l + '</text>';
    });
    return s;
  }
  const arrow = (x1, y1, x2, y2, cls) => '<line class="' + (cls || 'd-arr') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
  const txt = (x, y, t, cls, st) => '<text class="' + (cls || 'd-m') + '" x="' + x + '" y="' + y + '"' + (st ? ' style="' + st + '"' : '') + '>' + t + '</text>';
  // Small grey-scale image from values in [−1, 1] (n × n), drawn at (x, y) with side length size
  function pix(x, y, size, vals, n) {
    const c = size / n;
    let s = '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" style="fill:var(--bg);stroke:var(--line)"/>';
    vals.forEach((v, i) => {
      const o = clamp((v + 1) / 2, 0, 1);
      if (o > 0.03) s += '<rect x="' + fmt(x + (i % n) * c, 1) + '" y="' + fmt(y + Math.floor(i / n) * c, 1) + '" width="' + fmt(c + 0.2, 1) + '" height="' + fmt(c + 0.2, 1) + '" style="fill:var(--fg);fill-opacity:' + fmt(o, 2) + '"/>';
    });
    return s;
  }
  // Tiny «dog» pictogram variants for the discriminative/generative figure (8 × 8 patterns)
  const DOGS = [
    ['00000000', '01000010', '01111110', '01011010', '01111110', '00111100', '00100100', '00000000'],
    ['00000000', '11000011', '11111111', '01011010', '01111110', '00111100', '00011000', '00000000'],
    ['00000000', '00100100', '00111100', '01011010', '01111110', '01111110', '00100100', '00000000'],
  ].map((rows) => rows.join('').split('').map((c) => (c === '1' ? 0.9 : -1)));

  LernApp.genFig = {
    // Discriminative x → y versus generative y → many x
    discGen() {
      let s = txt(160, 14, T('Diskriminativ: x → y', 'Discriminative: x → y'), 'd-tb') + txt(500, 14, T('Generativ: y → x', 'Generative: y → x'), 'd-tb');
      s += pix(20, 60, 64, DOGS[0], 8) + arrow(88, 92, 112, 92) + block(116, 64, 110, 56, 'd-hl', [T('Modell', 'Model'), 'p(y | x)']) + arrow(230, 92, 254, 92) +
        block(258, 72, 60, 40, 'd-ok', [T('«Hund»', '“dog”')]);
      s += txt(160, 150, T('eine gewünschte Ausgabe', 'one desired output')) + txt(160, 168, T('Bild → Label', 'image → label'));
      s += block(352, 72, 60, 40, 'd-ok', [T('«Hund»', '“dog”')]) + arrow(416, 92, 440, 92) + block(444, 64, 110, 56, 'd-warn', [T('Modell', 'Model'), 'p(x | y)']) +
        arrow(558, 80, 578, 56) + arrow(558, 92, 578, 92) + arrow(558, 104, 578, 128);
      s += pix(582, 30, 40, DOGS[0], 8) + pix(582, 72, 40, DOGS[1], 8) + pix(582, 114, 40, DOGS[2], 8);
      s += txt(500, 170, T('viele mögliche Ausgaben, gezogen: x′ ~ p(x | y)', 'many possible outputs, sampled: x′ ~ p(x | y)'));
      return '<svg viewBox="0 0 640 184" role="img" aria-label="' + T('Links: Ein diskriminatives Modell bildet ein Hundebild auf das Label Hund ab. Rechts: Ein generatives Modell macht aus dem Label Hund mehrere verschiedene Hundebilder.', 'Left: a discriminative model maps a dog image to the label dog. Right: a generative model turns the label dog into several different dog images.') + '">' + s + '</svg>';
    },

    // Taxonomy after the course slide
    taxonomy() {
      let s = block(290, 8, 180, 40, 'd-box', ['Generative Models']);
      s += '<path class="d-ln" d="M380 48V62H190V76 M380 62H610V76"/>';
      s += block(100, 76, 180, 46, 'd-box', [T('Explizite Dichte', 'Explicit density'), T('p(x) als Formel', 'p(x) as a formula')]);
      s += block(520, 76, 180, 46, 'd-box', [T('Implizite Dichte', 'Implicit density'), T('nur Sampling, kein p(x)', 'sampling only, no p(x)')]);
      s += '<path class="d-ln" d="M190 122V136H90V150 M190 136H290V150 M610 122V150"/>';
      s += block(10, 150, 160, 46, 'd-box', [T('exakt (tractable)', 'exact (tractable)'), T('p(x) direkt berechenbar', 'p(x) computable directly')]);
      s += block(210, 150, 160, 46, 'd-box', [T('angenähert', 'approximate'), T('Schranke für log p(x)', 'bound on log p(x)')]);
      s += '<path class="d-ln" d="M90 196V214 M290 196V214"/>';
      s += block(10, 214, 160, 54, 'd-hl', [T('Autoregressiv', 'Autoregressive'), 'PixelCNN (2016)', 'Normalizing Flows']);
      s += block(210, 214, 160, 54, 'd-hl', ['VAE (2013)', 'Diffusion / DDPM (2020)', '']);
      s += block(520, 214, 180, 54, 'd-warn', ['GAN (2014)', T('Generator gegen', 'generator against'), 'Discriminator']);
      return '<svg viewBox="0 0 720 280" role="img" aria-label="' + T('Taxonomie: Generative Modelle mit expliziter Dichte, exakt (autoregressive Modelle wie PixelCNN, Normalizing Flows) oder angenähert (VAE, Diffusion), und mit impliziter Dichte (GAN).', 'Taxonomy: generative models with explicit density, exact (autoregressive models such as PixelCNN, normalizing flows) or approximate (VAE, diffusion), and with implicit density (GAN).') + '">' + s + '</svg>';
    },

    // Autoencoder: hourglass
    ae() {
      let s = pix(32, 50, 70, DOGS[0], 8) + txt(67, 136, T('Bild x (784 Werte)', 'image x (784 values)'));
      s += '<path class="d-hl" d="M122 40 L252 70 L252 110 L122 140 Z"/>' + txt(187, 90, 'Encoder f', 'd-tb') + txt(187, 156, T('verkleinert', 'shrinks'));
      s += block(266, 70, 60, 40, 'd-warn', ['z', T('z. B. 32', 'e.g. 32')]) + txt(296, 128, 'Latent Space');
      s += '<path class="d-hl" d="M340 70 L470 40 L470 140 L340 110 Z"/>' + txt(405, 90, 'Decoder g', 'd-tb') + txt(405, 156, T('vergrössert', 'enlarges'));
      s += pix(490, 50, 70, DOGS[0].map((v) => v * 0.8), 8) + txt(525, 136, T('Rekonstruktion x̂', 'reconstruction x̂'));
      s += arrow(104, 90, 120, 90) + arrow(472, 90, 488, 90);
      s += '<path class="d-dash" d="M67 166V182H525V166"/>' + txt(296, 196, T('Loss = Abstand(x, x̂), z. B. MSE: Das Ziel ist die Eingabe selbst, g(f(x)) ≈ x', 'loss = distance(x, x̂), e.g. MSE: the target is the input itself, g(f(x)) ≈ x'));
      return '<svg viewBox="0 0 592 206" role="img" aria-label="' + T('Autoencoder: Bild x geht durch den Encoder auf einen kleinen Code z und durch den Decoder zurück zur Rekonstruktion. Der Loss vergleicht Eingabe und Rekonstruktion.', 'Autoencoder: image x goes through the encoder to a small code z and through the decoder back to the reconstruction. The loss compares input and reconstruction.') + '">' + s + '</svg>';
    },

    // VAE: encoder gives μ and σ, reparameterization, decoder, two loss terms
    vae() {
      let s = pix(8, 60, 60, DOGS[0], 8) + txt(38, 136, 'x');
      s += '<path class="d-hl" d="M80 46 L190 72 L190 120 L80 146 Z"/>' + txt(135, 96, 'Encoder', 'd-tb') + txt(135, 162, 'q_φ(z | x)');
      s += block(206, 52, 54, 34, 'd-box', ['μ']) + block(206, 106, 54, 34, 'd-box', ['σ']);
      s += arrow(192, 84, 204, 72) + arrow(192, 108, 204, 122);
      s += block(292, 76, 92, 40, 'd-warn', ['z = μ + σ·ε']) + arrow(262, 69, 290, 88) + arrow(262, 123, 290, 104);
      s += block(300, 150, 76, 30, 'd-box', ['ε ~ N(0, I)']) + arrow(338, 148, 338, 118);
      s += '<path class="d-hl" d="M400 72 L510 46 L510 146 L400 120 Z"/>' + txt(455, 96, 'Decoder', 'd-tb') + txt(455, 162, 'p_θ(x | z)');
      s += arrow(386, 96, 398, 96) + arrow(512, 96, 524, 96) + pix(528, 66, 60, DOGS[0].map((v) => v * 0.7), 8) + txt(558, 136, "x′");
      s += '<path class="d-dash" d="M233 44V22H470"/>' + txt(470, 14, T('KL-Term: N(μ, σ²) nahe bei N(0, I) halten', 'KL term: keep N(μ, σ²) close to N(0, I)'), 'd-m', 'text-anchor:middle');
      s += '<path class="d-dash" d="M38 190V204H558V190"/>' + txt(298, 218, T('Rekonstruktion: x′ soll wie x aussehen', 'reconstruction: x′ should look like x'));
      s += txt(298, 240, T('Generieren: nur der Decoder, mit z ~ N(0, I)', 'generating: decoder only, with z ~ N(0, I)'), 'd-tb', 'font-size:12.5px');
      return '<svg viewBox="0 0 600 252" role="img" aria-label="' + T('VAE: Der Encoder liefert μ und σ, z wird als μ plus σ mal ε gezogen, der Decoder baut daraus x Strich. Der Loss besteht aus Rekonstruktion und KL-Term. Zum Generieren braucht es nur den Decoder.', 'VAE: the encoder gives μ and σ, z is drawn as μ plus σ times ε, the decoder builds x prime from it. The loss consists of reconstruction and KL term. Generating needs only the decoder.') + '">' + s + '</svg>';
    },

    // GAN: generator, discriminator, real images, the two steps
    gan() {
      let s = block(8, 40, 86, 44, 'd-box', ['z ~ N(0, I)', T('Rauschen', 'noise')]) + arrow(96, 62, 116, 62);
      s += block(120, 34, 120, 56, 'd-hl', ['Generator G', T('Fälscher', 'forger')]) + arrow(242, 62, 262, 62);
      s += pix(266, 36, 52, DOGS[1].map((v) => v * 0.75), 8) + txt(292, 102, T('G(z): falsch', 'G(z): fake'));
      s += pix(266, 128, 52, DOGS[0], 8) + txt(292, 194, T('x: echt (Daten)', 'x: real (data)'));
      s += arrow(320, 62, 372, 96) + arrow(320, 154, 372, 120);
      s += block(376, 78, 132, 60, 'd-warn', ['Discriminator D', T('Prüfer', 'judge')]) + arrow(510, 108, 530, 108);
      s += block(534, 86, 80, 44, 'd-ok', ['D(·) ∈ [0, 1]', T('«echt?»', '“real?”')]);
      s += '<path class="d-dash" d="M574 132V214H180V92"/>' + txt(380, 228, T('G-Schritt: D fest, G so ändern, dass D(G(z)) → 1', 'G step: D fixed, change G so that D(G(z)) → 1'));
      s += txt(442, 30, T('D-Schritt: G fest, D(x) → 1, D(G(z)) → 0', 'D step: G fixed, D(x) → 1, D(G(z)) → 0'), 'd-m');
      return '<svg viewBox="0 0 624 240" role="img" aria-label="' + T('GAN: Der Generator macht aus Rauschen z ein falsches Bild. Der Discriminator bekommt falsche und echte Bilder und gibt eine Wahrscheinlichkeit für echt aus. Im D-Schritt lernt D, echt von falsch zu trennen, im G-Schritt lernt G, D zu täuschen.', 'GAN: the generator turns noise z into a fake image. The discriminator gets fake and real images and outputs a probability of real. In the D step D learns to separate real from fake, in the G step G learns to fool D.') + '">' + s + '</svg>';
    },

    // Diffusion: forward chain (fixed noise) and reverse chain (learned denoising)
    diffusion() {
      const n = 16, x0 = testImg(n), eps = noiseVec(n * n, 5), ab = alphaBars('lin');
      const ts = [0, 150, 350, 600, 1000], lab = ['x₀', 'x₁₅₀', 'x₃₅₀', 'x₆₀₀', 'x_T'];
      let s = '';
      ts.forEach((t, i) => {
        const x = 30 + i * 128;
        s += pix(x, 62, 76, noisy(x0, eps, ab[t]), n) + txt(x + 38, 154, lab[i], 'd-t');
        if (i < 4) {
          s += '<line class="d-arr" x1="' + (x + 80) + '" y1="80" x2="' + (x + 124) + '" y2="80" style="stroke:var(--warn)"/>';
          s += '<line class="d-arrb" x1="' + (x + 124) + '" y1="120" x2="' + (x + 80) + '" y2="120"/>';
        }
      });
      s += txt(320, 20, T('Vorwärts q(x_t | x_{t−1}): Rauschen hinzufügen. Fest, ohne Training.', 'Forward q(x_t | x_{t−1}): add noise. Fixed, no training.'), 'd-tb', 'font-size:13px;fill:var(--warn)');
      s += txt(320, 40, T('in T = 1000 kleinen Schritten, am Ende reines Rauschen N(0, I)', 'in T = 1000 small steps, ending in pure noise N(0, I)'));
      s += txt(320, 184, T('Rückwärts p_θ(x_{t−1} | x_t): Rauschen entfernen. Das lernt das Netz (U-Net).', 'Reverse p_θ(x_{t−1} | x_t): remove noise. This is what the network (U-Net) learns.'), 'd-tb', 'font-size:13px;fill:var(--accent)');
      s += txt(320, 204, T('Generieren: bei reinem Rauschen starten und Schritt für Schritt entrauschen', 'generating: start from pure noise and denoise step by step'));
      return '<svg viewBox="0 0 640 216" role="img" aria-label="' + T('Diffusion: Oben wird ein Bild in vielen Schritten verrauscht, bis nur Rauschen bleibt. Unten lernt ein Netz, jeden Schritt rückwärts zu gehen und so aus Rauschen ein Bild zu machen.', 'Diffusion: at the top an image is noised in many steps until only noise remains. At the bottom a network learns to go each step backwards and so to turn noise into an image.') + '">' + s + '</svg>';
    },

    // Reverse process seen as distributions: from N(0, 1) at x_T to the multi-peaked data distribution at x₀.
    // Data: mixture of three Gaussians. Because x_t = √ᾱ·x₀ + √(1−ᾱ)·ε, the density of x_t is again a mixture
    // with means √ᾱ·μ_k and variances ᾱ·σ_k² + (1 − ᾱ), so every panel is computed exactly.
    diffDist() {
      const MIX = [[0.3, -2.2, 0.35], [0.45, 0.3, 0.45], [0.25, 2.4, 0.3]];
      const dens = (x, ab) => MIX.reduce((s, m) => {
        const mu = Math.sqrt(ab) * m[1], v = ab * m[2] * m[2] + (1 - ab);
        return s + m[0] * Math.exp(-0.5 * (x - mu) ** 2 / v) / Math.sqrt(2 * Math.PI * v);
      }, 0);
      const P = [[0, 'x_T', T('reines Rauschen N(0, I)', 'pure noise N(0, I)')], [0.25, 'x_t', T('grob, ein breiter Hügel', 'coarse, one broad hill')], [0.65, 'x_{t−1}', T('Gruppen trennen sich', 'groups separate')], [1, 'x₀', T('Daten: drei Gipfel', 'data: three peaks')]];
      const n = 16, img = testImg(n), eps = noiseVec(n * n, 5);
      let s = '', top = 0;
      P.forEach((p) => { for (let k = 0; k <= 80; k++) top = Math.max(top, dens(-4 + 8 * k / 80, p[0])); });
      P.forEach((p, i) => {
        const x0 = 12 + i * 158, w = 136, base = 196, hgt = 96;
        let d = '';
        for (let k = 0; k <= 80; k++) { const x = -4 + 8 * k / 80; d += (k ? 'L' : 'M') + fmt(x0 + w * k / 80, 1) + ' ' + fmt(base - dens(x, p[0]) / top * hgt, 1); }
        s += '<path d="' + d + 'L' + (x0 + w) + ' ' + base + 'L' + x0 + ' ' + base + 'Z" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.8"/>';
        s += '<line class="ax" x1="' + x0 + '" y1="' + base + '" x2="' + (x0 + w) + '" y2="' + base + '"/>';
        s += pix(x0 + w / 2 - 22, 14, 44, noisy(img, eps, p[0]), n);
        s += txt(x0 + w / 2, 74, p[1], 'd-t') + txt(x0 + w / 2, 212, p[2]);
        if (i < 3) s += '<line class="d-arrb" x1="' + (x0 + w + 2) + '" y1="36" x2="' + (x0 + 156) + '" y2="36"/>';
      });
      s += txt(317, 58, 'p_θ(x_{t−1} | x_t)', 'd-m', 'fill:var(--accent)');
      s += '<rect x="12" y="226" width="610" height="24" rx="4" class="d-hl"/>' + txt(317, 238, T('Rückwärtsprozess: Schritt für Schritt von N(0, I) zur Datenverteilung', 'Reverse process: step by step from N(0, I) to the data distribution'), 'd-tb', 'font-size:12px');
      return '<svg viewBox="0 0 640 258" role="img" aria-label="' + T('Rückwärtsprozess als Verteilungen: Bei x_T eine einfache Glockenkurve, bei x_t ein breiter Hügel, bei x_{t−1} trennen sich Gruppen, bei x₀ die Datenverteilung mit drei Gipfeln. Darüber die passenden Bilder vom Rauschen bis zum sauberen Bild.', 'Reverse process as distributions: at x_T a simple bell curve, at x_t one broad hill, at x_{t−1} groups separate, at x₀ the data distribution with three peaks. Above them the matching images from noise to the clean image.') + '">' + s + '</svg>';
    },

    // Latent diffusion (Stable Diffusion): text encoder, U-Net loop in latent space, VAE decoder
    latent() {
      let s = block(8, 70, 128, 56, 'd-box', ['Prompt', T('«ein Hund am Strand»', '“a dog on a beach”')]) + arrow(138, 98, 156, 98);
      s += block(160, 70, 104, 56, 'd-hl', [T('Text-Encoder', 'Text encoder'), 'CLIP']) + arrow(266, 98, 286, 98);
      s += '<rect class="d-dim" x="290" y="30" width="316" height="170" rx="8"/>' + txt(448, 48, T('Latent Space 64 × 64 × 4', 'Latent space 64 × 64 × 4'), 'd-tb', 'font-size:12.5px');
      s += block(304, 62, 112, 44, 'd-box', ['z_T ~ N(0, I)', T('Start: Rauschen', 'start: noise')]) + arrow(418, 84, 444, 84);
      s += block(448, 62, 144, 44, 'd-warn', ['U-Net', 'ε_θ(z_t, t, Text)']);
      s += '<path class="d-dash" d="M520 108V134H360V110" style="stroke:var(--warn)"/>';
      s += txt(448, 156, T('Scheduler: 20–50 Schritte,', 'scheduler: 20–50 steps,')) + txt(448, 171, T('je Schritt etwas Rauschen weg', 'a bit of noise removed per step'));
      s += txt(448, 188, T('Guidance Scale w: wie stark der Prompt zählt', 'guidance scale w: how much the prompt counts'));
      s += arrow(608, 98, 628, 98) + block(632, 70, 104, 56, 'd-hl', ['VAE-Decoder', '64² → 512²']) + arrow(738, 98, 756, 98);
      s += block(760, 70, 96, 56, 'd-ok', [T('Bild', 'Image'), '512 × 512 × 3']);
      return '<svg viewBox="0 0 864 208" style="min-width:680px" role="img" aria-label="' + T('Stable Diffusion: Der Prompt geht durch einen Text-Encoder. Im Latent Space startet ein U-Net bei Rauschen und entrauscht in 20 bis 50 Schritten, gesteuert vom Text. Der VAE-Decoder macht aus dem Latent ein Bild mit 512 mal 512 Pixeln.', 'Stable Diffusion: the prompt goes through a text encoder. In the latent space a U-Net starts from noise and denoises in 20 to 50 steps, guided by the text. The VAE decoder turns the latent into an image of 512 by 512 pixels.') + '">' + s + '</svg>';
    },
  };

  LernApp.demos.gen = function () {
    // Clickable workflow figure: same pattern as the other chapters
    (function () {
      const fig = $('genFlowFig');
      if (!fig) return;
      const panel = fig.querySelector('.ab-detail'), steps = fig.querySelectorAll('.ab-step');
      const S = {
        '1': [T('1 · Daten', '1 · Data'), T('Generative Modelle brauchen <b>keine Labels</b>: Die Bilder selbst sind das Ziel. Pixel auf [0, 1] (Sigmoid-Ausgabe) oder [−1, 1] (tanh-Ausgabe, Diffusion) skalieren. Soll das Modell auf Wunsch erzeugen (Klasse, Text), kommt die <b>Bedingung y</b> dazu: dann lernt es p(x | y) statt p(x).', 'Generative models need <b>no labels</b>: the images themselves are the target. Scale pixels to [0, 1] (sigmoid output) or [−1, 1] (tanh output, diffusion). If the model should generate on request (class, text), the <b>condition y</b> is added: then it learns p(x | y) instead of p(x).'), [[T('Diskriminativ und generativ', 'Discriminative and generative'), '#gen-was'], ['Conditional Diffusion', '#gen-cond']]],
        '2': [T('2 · Modell wählen', '2 · Choose the model'), T('<b>VAE</b>: schnell und stabil, geordneter Latent Space, eher unscharf. <b>GAN</b>: sehr scharf und schnell beim Erzeugen, aber heikles Training. <b>PixelCNN</b>: echte Wahrscheinlichkeit, sehr langsam beim Erzeugen. <b>Diffusion</b>: beste Qualität und Vielfalt, stabiles Training, langsames Sampling. Für Text-zu-Bild: ein vortrainiertes Latent-Diffusion-Modell nehmen.', '<b>VAE</b>: fast and stable, ordered latent space, rather blurry. <b>GAN</b>: very sharp and fast at generating, but delicate training. <b>PixelCNN</b>: real probability, very slow at generating. <b>Diffusion</b>: best quality and diversity, stable training, slow sampling. For text-to-image: take a pretrained latent diffusion model.'), [[T('Übersicht', 'Overview'), '#gen-methoden'], [T('Taxonomie', 'Taxonomy'), '#gen-was']]],
        '3': [T('3 · Loss und Optimizer', '3 · Loss and optimizer'), T('VAE: Rekonstruktion <b>plus KL-Term</b>. PixelCNN: Cross-Entropy pro Pixel. GAN: zwei Losses im Wechsel (adversarial). Diffusion: MSE zwischen echtem und vorhergesagtem Rauschen. Optimizer fast immer Adam; beim GAN oft Learning Rate 2·10⁻⁴.', 'VAE: reconstruction <b>plus KL term</b>. PixelCNN: cross-entropy per pixel. GAN: two losses in alternation (adversarial). Diffusion: MSE between the true and the predicted noise. Optimizer almost always Adam; for GANs often learning rate 2·10⁻⁴.'), [['VAE', '#gen-vae'], ['GAN', '#gen-gan'], ['Diffusion', '#gen-diff']]],
        '4': [T('4 · Forward Pass', '4 · Forward pass'), T('VAE: Encoder → μ, σ → z ziehen → Decoder. PixelCNN: maskierte Faltung gibt für jeden Pixel eine Wahrscheinlichkeit. GAN: Generator macht aus Rauschen ein Bild, der Discriminator beurteilt echte und falsche Bilder. Diffusion: Bild verrauschen auf eine zufällige Stufe t, das U-Net schätzt das Rauschen.', 'VAE: encoder → μ, σ → draw z → decoder. PixelCNN: masked convolution gives a probability for every pixel. GAN: the generator turns noise into an image, the discriminator judges real and fake images. Diffusion: noise the image to a random level t, the U-Net estimates the noise.'), [['PixelCNN', '#gen-pixel'], ['Diffusion', '#gen-diff']]],
        '5': [T('5 · Loss berechnen', '5 · Compute the loss'), T('Vergleich mit dem Ziel: beim VAE das Eingabebild selbst (plus KL), beim PixelCNN jeder echte Pixel, beim GAN das Urteil des Discriminators, bei der Diffusion das Rauschen ε, das man selbst hinzugefügt hat.', 'Comparison with the target: for the VAE the input image itself (plus KL), for the PixelCNN every real pixel, for the GAN the judgement of the discriminator, for diffusion the noise ε you added yourself.'), [['Autoencoder', '#gen-ae']]],
        '6': [T('6 · Backpropagation', '6 · Backpropagation'), T('Durch ein Zufallsziehen fliesst kein Gradient. Der VAE löst das mit dem <b>Reparametrisierungs-Trick</b> z = μ + σ · ε. Beim GAN fliesst der Gradient für G <i>durch</i> den Discriminator hindurch, dessen Gewichte dabei fest bleiben.', 'No gradient flows through random sampling. The VAE solves this with the <b>reparameterization trick</b> z = μ + σ · ε. In the GAN, the gradient for G flows <i>through</i> the discriminator, whose weights stay fixed meanwhile.'), [['VAE', '#gen-vae'], ['GAN', '#gen-gan']]],
        '7': [T('7 · Parameter aktualisieren', '7 · Update the parameters'), T('Wie überall: Optimizer, Learning Rate. Beim GAN abwechselnd: erst Discriminator, dann Generator, und beide müssen im Gleichgewicht bleiben. Bei der Diffusion pro Bild eine neue Stufe t und neues Rauschen: Das Netz lernt alle Stufen zugleich.', 'As everywhere: optimizer, learning rate. For the GAN alternately: first the discriminator, then the generator, and both must stay in balance. For diffusion a new level t and new noise per image: the network learns all levels at once.'), [['GAN', '#gen-gan']]],
        '8': [T('8 · Beispiele prüfen', '8 · Check samples'), T('Die Loss-Kurven sagen wenig über die Bildqualität. <b>Beispiele ansehen</b>, immer aus denselben festen Zufallswerten: scharf, vielfältig, sinnvoll? Typische Fehler: verwaschene Bilder (VAE), immer dieselben Bilder (GAN, <i>Mode Collapse</i>), kaputte Struktur (PixelCNN), Kopien von Trainingsbildern. Quantitativ: FID.', 'The loss curves say little about image quality. <b>Look at samples</b>, always from the same fixed random values: sharp, diverse, sensible? Typical failures: blurry images (VAE), always the same images (GAN, <i>mode collapse</i>), broken structure (PixelCNN), copies of training images. Quantitatively: FID.'), [[T('Bewerten', 'Evaluate'), '#gen-eval']]],
        '9': [T('9 · Generieren', '9 · Generate'), T('VAE: z aus N(0, I) ziehen und decodieren. GAN: Rauschen durch den Generator schicken (ein Durchlauf). PixelCNN: Pixel für Pixel würfeln. Diffusion: bei Rauschen starten und 20 bis 1000 Mal entrauschen, bei Text-zu-Bild mit Prompt und Guidance Scale.', 'VAE: draw z from N(0, I) and decode. GAN: send noise through the generator (one pass). PixelCNN: roll pixel by pixel. Diffusion: start from noise and denoise 20 to 1000 times, for text-to-image with prompt and guidance scale.'), [['VAE', '#gen-vae'], ['Conditional Diffusion', '#gen-cond']]],
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
      // Click or drag over either grid: that pixel becomes the current one
      const cell = (x, y) => {
        for (const x0 of [8, 240]) {
          const c = Math.floor((x - x0) / C), r = Math.floor((y - 30) / C);
          if (c >= 0 && c < 8 && r >= 0 && r < 8) return r * 8 + c;
        }
        return null;
      };
      LernApp.drag('pxSvg', { pick: (x, y) => (cell(x, y) === null ? null : 'k'), move: (key, x, y) => { const i = cell(x, y); if (i !== null) LernApp.setRange('pxK', i); },
        hint: ['Klicke auf einen Pixel oder fahre mit gedrückter Maus über das Raster.', 'Click a pixel or move over the grid with the button held down.'] });
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
        s += '<circle cx="' + (CX + m1 * SC) + '" cy="' + (CY - m2 * SC) + '" r="' + sg * SC + '" style="fill:none;stroke:var(--warn);stroke-width:1.5"/>';
        s += '<circle class="dh" cx="' + (CX + m1 * SC) + '" cy="' + (CY - m2 * SC) + '" r="6" style="stroke:var(--warn)"/>';
        $('vaSvg').innerHTML = s;
        $('vaM1O').textContent = fmt(m1, 1); $('vaM2O').textContent = fmt(m2, 1); $('vaSO').textContent = fmt(sg, 2);
        const kl = klDiv([m1, m2], [sg, sg]);
        $('vaKL').textContent = fmt(kl, 2);
        $('vaMsg').textContent = kl < 0.3 ? T('Fast N(0, 1): Der Latent Space ist gut gefüllt, ein zufälliger Punkt daraus ergibt ein sinnvolles Bild.', 'Almost N(0, 1): the latent space is well filled, a random point from it gives a sensible image.')
          : sg < 0.25 ? T('σ klein: fast ein Punkt wie beim normalen Autoencoder. Rekonstruktion wäre scharf, aber die Umgebung des Punktes ist leer und der KL-Term hoch.', 'σ small: almost a point as in the plain autoencoder. Reconstruction would be sharp, but the surroundings of the point are empty and the KL term is high.')
            : T('Weit weg von N(0, 1): Der KL-Term zieht μ zum Ursprung und σ Richtung 1.', 'Far from N(0, 1): the KL term pulls μ to the origin and σ towards 1.');
      }
      [['vaM1', (v) => { m1 = v; }], ['vaM2', (v) => { m2 = v; }], ['vaS', (v) => { sg = v; }]].forEach((p) => $(p[0]).addEventListener('input', (e) => { p[1](+e.target.value); draw(); }));
      // Drag: the orange centre moves μ, anywhere else sets σ = distance to the centre (the orange ring is 1 σ)
      LernApp.drag('vaSvg', {
        pick: (x, y) => (Math.hypot(x - (CX + m1 * SC), y - (CY - m2 * SC)) < 14 ? 'mu' : 'sigma'),
        move: (k, x, y) => {
          if (k === 'mu') { LernApp.setRange('vaM1', (x - CX) / SC); LernApp.setRange('vaM2', (CY - y) / SC); }
          else LernApp.setRange('vaS', Math.hypot(x - (CX + m1 * SC), y - (CY - m2 * SC)) / SC);
        },
        hint: ['Ziehe den orangen Mittelpunkt für μ. Ziehen ausserhalb ändert σ (oranger Ring = 1 σ).', 'Drag the orange centre for μ. Dragging elsewhere changes σ (orange ring = 1 σ).'] });
      draw();
    })();

    // Demo 3: 1D GAN. Data N(2, 0.5²), generator N(b, a²), discriminator σ(w0 + w1 x + w2 x²)
    (function () {
      if (!$('gaSvg')) return;
      const MODES = {
        ok: [0.5, 0.1, T('Ausgewogen: Der Discriminator lernt schnell genug, der Generator folgt ihm.', 'Balanced: the discriminator learns fast enough, the generator follows it.')],
        weak: [0.05, 0.1, T('Discriminator zu schwach: Er merkt nicht, dass alle Fälschungen gleich aussehen.', 'Discriminator too weak: it does not notice that all fakes look alike.')],
        fast: [0.5, 0.8, T('Generator zu schnell: Er springt über das Ziel hinaus, das Spiel schaukelt sich auf.', 'Generator too fast: it overshoots the target, the game swings up.')],
      };
      let mode = 'ok', st = ganInit(), timer = null;
      const X0 = -4, X1 = 5, W = 400, H = 220, PX = (x) => 30 + (x - X0) / (X1 - X0) * (W - 40), PY = (v) => H - 28 - v * (H - 60);
      const npdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
      function curve(fn, style, fill) {
        let d = '';
        for (let i = 0; i <= 180; i++) { const x = X0 + (X1 - X0) * i / 180; d += (i ? 'L' : 'M') + fmt(PX(x), 1) + ' ' + fmt(PY(fn(x)), 1); }
        if (fill) d += 'L' + PX(X1) + ' ' + PY(0) + 'L' + PX(X0) + ' ' + PY(0) + 'Z';
        return '<path d="' + d + '" style="' + style + '"/>';
      }
      function draw() {
        const sa = Math.abs(st.a), peak = npdf(DATA.mu, DATA.mu, DATA.sd), scale = (v) => Math.min(v / peak, 1.15);
        let s = '<line class="ax" x1="30" y1="' + PY(0) + '" x2="' + (W - 10) + '" y2="' + PY(0) + '"/>';
        for (let x = -4; x <= 5; x += 1) s += '<text class="lbl" x="' + PX(x) + '" y="' + (H - 12) + '" text-anchor="middle">' + x + '</text>';
        s += curve((x) => scale(npdf(x, DATA.mu, DATA.sd)), 'fill:var(--muted);fill-opacity:.25;stroke:var(--muted);stroke-width:1.5', true);
        if (sa > 0.04) s += curve((x) => scale(npdf(x, st.b, sa)), 'fill:none;stroke:var(--warn);stroke-width:2.5');
        else s += '<line x1="' + PX(st.b) + '" y1="' + PY(0) + '" x2="' + PX(st.b) + '" y2="' + PY(1.15) + '" style="stroke:var(--warn);stroke-width:3"/>';
        s += curve((x) => dOf(st, x), 'fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:6 4');
        s += '<text class="lbl" x="34" y="18" style="fill:var(--muted)">' + T('grau: echte Daten', 'grey: real data') + '</text><text class="lbl" x="150" y="18" style="fill:var(--warn)">' + T('orange: Generator', 'orange: generator') + '</text><text class="lbl" x="270" y="18" style="fill:var(--accent)">' + T('blau: D(x)', 'blue: D(x)') + '</text>';
        $('gaSvg').innerHTML = s;
        const m = ganMeans(st);
        $('gaStep').textContent = st.step; $('gaMu').textContent = fmt(st.b, 2); $('gaSd').textContent = fmt(sa, 2);
        $('gaDr').textContent = fmt(m[0], 2); $('gaDf').textContent = fmt(m[1], 2);
        let msg = MODES[mode][2] + ' ';
        if (st.step === 0) msg += T('Starte das Training. Der Generator beginnt bei N(−2, 1), die Daten liegen bei N(2, 0.5²).', 'Start the training. The generator starts at N(−2, 1), the data lies at N(2, 0.5²).');
        else if (sa < 0.08) msg += T('Mode Collapse: Der Generator erzeugt fast nur noch einen einzigen Wert. Die Lage stimmt, die Vielfalt fehlt.', 'Mode collapse: the generator produces almost a single value. The location is right, the diversity is missing.');
        else if (Math.abs(st.b - DATA.mu) < 0.15 && Math.abs(sa - DATA.sd) < 0.1) msg += T('Gleichgewicht: Die Fälschungen verteilen sich wie die echten Daten. D gibt echten und falschen Zahlen fast denselben Wert, er kann sie nicht mehr unterscheiden.', 'Equilibrium: the fakes are distributed like the real data. D gives real and fake numbers almost the same value; it can no longer tell them apart.');
        else if (Math.abs(st.b) > 7 || sa > 5) msg += T('Instabil: Der Generator ist weit weggesprungen. Mit kleinerer Learning Rate neu starten.', 'Unstable: the generator jumped far away. Restart with a smaller learning rate.');
        else msg += T('Noch unterwegs: D zeigt dem Generator, wo echte Daten liegen (dort ist D hoch).', 'Still on the way: D shows the generator where real data lies (D is high there).');
        $('gaMsg').textContent = msg;
      }
      function step(n) { for (let i = 0; i < n; i++) ganStep(st, MODES[mode][0], MODES[mode][1]); draw(); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } $('gaPlay').textContent = T('Abspielen', 'Play'); }
      $('gaOne').addEventListener('click', () => { stop(); step(1); });
      $('gaTen').addEventListener('click', () => { stop(); step(25); });
      $('gaPlay').addEventListener('click', () => {
        if (timer) { stop(); return; }
        $('gaPlay').textContent = T('Stopp', 'Stop');
        timer = setInterval(() => { step(3); if (st.step >= 600) stop(); }, 60);
      });
      $('gaReset').addEventListener('click', () => { stop(); st = ganInit(); draw(); });
      $('gaMode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        stop(); mode = b.dataset.v; st = ganInit();
        $('gaMode').querySelectorAll('button').forEach((x) => { const on = x === b; x.classList.toggle('pri', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        draw();
      }));
      draw();
    })();

    // Demo 4: diffusion forward process with a linear or cosine schedule
    (function () {
      if (!$('dfSvg')) return;
      const n = 16, x0 = testImg(n), eps = noiseVec(n * n, 3), AB = { lin: alphaBars('lin'), cos: alphaBars('cos') };
      let t = 300, kind = 'lin', timer = null;
      function draw() {
        const ab = AB[kind][t], xt = noisy(x0, eps, ab);
        let s = pix(10, 30, 96, x0, n) + pix(122, 30, 96, eps.map((v) => v / 2), n) + pix(234, 30, 96, xt, n);
        s += '<text class="lbl" x="58" y="20" text-anchor="middle">x₀</text><text class="lbl" x="170" y="20" text-anchor="middle">' + T('Rauschen ε', 'noise ε') + '</text><text class="lbl" x="282" y="20" text-anchor="middle">x_t, t = ' + t + '</text>';
        s += '<text class="lbl" x="116" y="80" text-anchor="middle">·√ᾱ +</text><text class="lbl" x="228" y="80" text-anchor="middle">·√(1−ᾱ)</text>';
        // ᾱ_t over t for both schedules, with a marker at t
        const gx = (v) => 350 + v / TT * 150, gy = (v) => 126 - v * 96;
        s += '<line class="ax" x1="350" y1="126" x2="500" y2="126"/><line class="ax" x1="350" y1="30" x2="350" y2="126"/>';
        ['lin', 'cos'].forEach((k) => {
          let d = '';
          for (let i = 0; i <= TT; i += 20) d += (i ? 'L' : 'M') + fmt(gx(i), 1) + ' ' + fmt(gy(AB[k][i]), 1);
          s += '<path d="' + d + '" style="fill:none;stroke:' + (k === kind ? 'var(--accent)' : 'var(--line)') + ';stroke-width:' + (k === kind ? 2.2 : 1.5) + '"/>';
        });
        s += '<circle cx="' + gx(t) + '" cy="' + gy(ab) + '" r="5" style="fill:var(--warn)"/>';
        s += '<text class="lbl" x="354" y="24">ᾱ_t</text><text class="lbl" x="500" y="140" text-anchor="end">t = 1000</text><text class="lbl" x="350" y="140">0</text>';
        $('dfSvg').innerHTML = s;
        $('dfTO').textContent = t;
        $('dfAb').textContent = fmt(ab, 3); $('dfSi').textContent = fmt(Math.sqrt(ab), 2); $('dfNo').textContent = fmt(Math.sqrt(1 - ab), 2);
        $('dfMsg').textContent = t === 0 ? T('t = 0: das saubere Bild.', 't = 0: the clean image.')
          : ab > 0.6 ? T('Wenig Rauschen: Das Netz muss nur feine Körnung entfernen. Hier lernt es Details.', 'Little noise: the network only has to remove fine grain. Here it learns details.')
            : ab > 0.05 ? T('Mittlere Stufe: Die Form ist noch zu ahnen. Hier lernt das Netz die grobe Struktur.', 'Middle level: the shape can still be guessed. Here the network learns the coarse structure.')
              : T('Fast reines Rauschen: Von hier startet das Generieren. Beim linearen Schedule ist schon lange vor t = 1000 kaum noch Signal übrig, beim Cosine-Schedule erst später.', 'Almost pure noise: generating starts from here. With the linear schedule hardly any signal is left long before t = 1000, with the cosine schedule later.');
      }
      $('dfT').addEventListener('input', (e) => { t = +e.target.value; draw(); });
      $('dfKind').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        kind = b.dataset.v;
        $('dfKind').querySelectorAll('button').forEach((x) => { const on = x === b; x.classList.toggle('pri', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        draw();
      }));
      $('dfPlay').addEventListener('click', () => {
        if (timer) { clearInterval(timer); timer = null; $('dfPlay').textContent = T('Vorwärts abspielen', 'Play forward'); return; }
        t = 0; $('dfPlay').textContent = T('Stopp', 'Stop');
        timer = setInterval(() => { t = Math.min(TT, t + 20); LernApp.setRange('dfT', t); if (t >= TT) { clearInterval(timer); timer = null; $('dfPlay').textContent = T('Vorwärts abspielen', 'Play forward'); } }, 50);
      });
      draw();
    })();
  };
})();
