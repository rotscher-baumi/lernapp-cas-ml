/* English texts for the module "gen" (Generative Models). Fields replace the German ones when the language is EN. */
LernApp.translate('gen', {
  nav: 'Generative Models',
  title: `Generative Models`,
  kicker: `Module 3 · Deep Learning, part 4`,
  summary: `Autoencoder, VAE (latent space, KL, reparameterization), PixelCNN, GAN (generator against discriminator)`,
  html: `  <p>So far a model mapped an input to a result (label, number, box). A <b>generative model</b> instead learns <b>what the data itself looks like</b> and can then produce new, similar examples: new digits, new faces, a summer picture as a winter picture. It needs no labels for this. The chapter shows four ways: autoencoder, VAE, PixelCNN and GAN.</p>
  <p class="note">The demos compute in the browser with small examples. The course notebooks (PixelCNN on MNIST, VAE with faces, CycleGAN and ESRGAN) run in Jupyter or Colab.</p>

  <h3 id="gen-ablauf">The whole workflow at a glance</h3>
  <p>The workflow is the same as for the <a href="#cnn-ablauf">CNN</a>. What changes: there are no labels, the loss depends on the model type, and validation consists mainly of <b>looking at generated examples</b>.</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="genFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Workflow of a generative models project: data without labels, choose the model, set loss and optimizer, then the training loop of forward pass, loss, backpropagation and update, then check generated examples and finally generate new examples">
      ${LernApp.nnFlow({
        id: 'gn',
        aria: 'Step %: open explanation',
        steps: [
          ['Data', 'images, no labels'],
          ['Choose the model', 'autoencoder, VAE, PixelCNN, GAN'],
          ['Loss and optimizer', 'reconstruction + KL, BCE, adversarial'],
          ['Forward pass', 'encoder → z → decoder (or generator)'],
          ['Compute the loss', 'distance to input image / verdict'],
          ['Backpropagation', 'reparameterization trick in the VAE'],
          ['Update parameters', 'w ← w − α · ∂L/∂w'],
          ['Check examples', 'sharp? diverse? sensible?'],
          ['Generate', 'draw z, interpolate'],
        ],
        loopA: ['per mini-batch,', 'many epochs'],
        loopB: ['Tuning:', 'size of z,', 'architecture, loss'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Steps 4 to 7 (orange dashed, inner) run for every mini-batch. The outer loop is tuning. Step 9 (orange) is the goal: new examples.</figcaption>
  </figure>

  <h3 id="gen-ae">1 · Autoencoder: compress and reconstruct</h3>
  <p>An <b>autoencoder</b> consists of two networks. The <b>encoder</b> squeezes the image into a small vector <b>z</b> (the <b>code</b> in the <b>latent space</b>), the <b>decoder</b> rebuilds the image from it. The target is the input itself:</p>
  <pre><code>image x  →  encoder  →  z (e.g. 32 numbers)  →  decoder  →  x̂
loss = distance(x, x̂)       # MSE or binary cross-entropy</code></pre>
  <p>Because z is much smaller than the image, the network has to keep the essentials (a <i>bottleneck</i>). This is dimensionality reduction like <a href="#unsup">PCA</a>, but nonlinear. It is used for compression, denoising (noisy image in, clean one as target) and anomaly detection (high reconstruction error = unusual image).</p>
  <div class="falle"><b>Pitfall</b><p>A plain autoencoder is <b>not</b> a good generator. The codes of the training images lie as scattered islands in the latent space, with empty space in between. Draw a random z and the decoder produces nonsense. This is exactly the problem the VAE solves.</p></div>

  <h3 id="gen-vae">2 · Variational autoencoder (VAE): a latent space you can sample from</h3>
  <p>The encoder of the VAE does <b>not</b> output a point but a <b>distribution</b>: a mean <b>μ</b> and a spread <b>σ</b> per dimension. z is drawn from it, and the decoder builds the image from this z. Two things make the space usable:</p>
  <ul>
    <li><b>The loss has two parts:</b> <code>loss = reconstruction + KL</code>. The reconstruction demands that the image is rebuilt. The <b>KL term</b> (Kullback-Leibler divergence) pulls every distribution N(μ, σ²) towards the standard normal N(0, 1). Per dimension: <code>½ (μ² + σ² − ln σ² − 1)</code>; it is 0 at μ = 0 and σ = 1.</li>
    <li><b>Reparameterization trick:</b> you cannot differentiate through random drawing. So you write <code>z = μ + σ · ε</code> with <code>ε ~ N(0, 1)</code>. The randomness now sits in ε, and backpropagation runs through μ and σ.</li>
  </ul>
  <div class="demo" id="vaDemo">
    <div class="tag">Demo</div><h4>Latent space with 2 dimensions</h4>
    <p class="hint">The orange point is μ of one image, the blue points are 40 draws z = μ + σ · ε. The dashed circles show N(0, 1) (1 and 2 standard deviations). Move μ to (0, 0) and σ to 1: then the KL term is 0.</p>
    <div class="ctl"><label for="vaM1">μ₁</label><input type="range" id="vaM1" min="-2.5" max="2.5" step="0.1" value="1.2"><output id="vaM1O"></output></div>
    <div class="ctl"><label for="vaM2">μ₂</label><input type="range" id="vaM2" min="-2.5" max="2.5" step="0.1" value="-0.8"><output id="vaM2O"></output></div>
    <div class="ctl"><label for="vaS">σ</label><input type="range" id="vaS" min="0.05" max="1.5" step="0.05" value="0.5"><output id="vaSO"></output></div>
    <svg class="plot" id="vaSvg" viewBox="0 0 300 240" style="max-width:420px" role="img" aria-label="Two-dimensional latent space with the mean, 40 drawn points and the standard normal distribution as circles"></svg>
    <div class="stats"><span>KL term <b id="vaKL"></b></span></div>
    <p class="hint" id="vaMsg"></p>
  </div>
  <p>Because all distributions lie close to N(0, 1) and overlap, the space is filled <b>without gaps</b>. Then you can:</p>
  <ul>
    <li><b>Generate new images:</b> draw z ~ N(0, 1), apply only the decoder.</li>
    <li><b>Interpolate:</b> encode two images, decode z on the line between them; the image changes smoothly from A to B (pose, light, expression).</li>
    <li><b>Change latent dimensions:</b> move along one direction in the space and see what changes. Which property a direction controls is learned without labels; you have to try it out.</li>
  </ul>
  <p>The price: VAE images are often somewhat <b>blurry</b> because the reconstruction loss aims at averages. A weight on the KL term controls the compromise between sharp reconstructions and a tidy space.</p>
  <div class="merk"><b>Key point</b><p>Autoencoder: image → point → image. VAE: image → distribution → drawn point → image, and the KL term keeps the space ordered so that you can draw from N(0, 1) and create new images.</p></div>

  <h3 id="gen-pixel">3 · PixelCNN: one pixel after the other</h3>
  <p>An <b>autoregressive</b> model splits the image into a sequence: the image is a product of probabilities, every pixel depends on all previous ones (row by row, left to right):</p>
  <pre><code>p(image) = p(pixel₁) · p(pixel₂ | pixel₁) · p(pixel₃ | pixel₁, pixel₂) · …</code></pre>
  <p>The <b>PixelCNN</b> implements this with <b>masked convolutions</b>: the filter is covered so that it only sees pixels <i>above and to the left</i> of the current pixel. The first layer (mask <b>A</b>) does not see the current pixel itself, later layers (mask <b>B</b>) may use the processed information about it. Without a mask the network could simply copy the pixel it is supposed to predict.</p>
  <ul>
    <li><b>Training:</b> all pixels of a real image are predicted at once (fast, parallel). Loss: binary cross-entropy per pixel for black and white (MNIST), a 256-class softmax for greyscale.</li>
    <li><b>Generating:</b> start with an empty image, predict pixel 1, <b>roll a die</b> according to its probability, write it into the image and continue with the next: 784 passes for a 28 × 28 image. That is slow.</li>
  </ul>
  <div class="demo" id="pxDemo">
    <div class="tag">Demo</div><h4>A PixelCNN draws a 7 on an 8 × 8 grid</h4>
    <p class="hint">Move the slider: on the left you see which pixels the network may look at for the orange pixel (blue, only earlier ones). On the right the image rolled so far. The probabilities are fixed and stand for a trained network. «Roll again» gives a different 7.</p>
    <div class="ctl"><label for="pxK">Current pixel</label><input type="range" id="pxK" min="0" max="63" step="1" value="20"><output id="pxKO"></output></div>
    <div class="btnrow"><button id="pxNew">Roll again</button></div>
    <svg class="plot" id="pxSvg" viewBox="0 0 410 200" style="max-width:520px" role="img" aria-label="Left the PixelCNN mask, right the image drawn up to the current pixel"></svg>
    <div class="stats"><span>p(pixel = 1) <b id="pxP"></b></span></div>
    <p class="hint" id="pxMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>PixelCNN is a classifier that predicts the next pixel. The mask prevents peeking. Training is parallel, generating is pixel by pixel and therefore slow. In return you get a real probability for every image.</p></div>

  <h3 id="gen-gan">4 · GAN: forger against inspector</h3>
  <p>A <b>generative adversarial network</b> consists of two networks trained against each other:</p>
  <ul>
    <li>The <b>generator</b> G turns random noise <code>z</code> into an image (the forger).</li>
    <li>The <b>discriminator</b> D gets real and generated images and says whether they are real (the inspector; a binary classification).</li>
  </ul>
  <pre><code>D learns:  real images → 1,  G(z) → 0
G learns:  D should take G(z) for real (1)</code></pre>
  <p>Both improve each other: the better the inspector, the better the forger has to become. There is no reconstruction loss; the generator is only measured by whether D can be fooled. This gives <b>very sharp</b> images, but training is delicate:</p>
  <ul>
    <li><b>Balance:</b> if D becomes too strong, G gets no useful gradient; if D is too weak, G learns nothing.</li>
    <li><b>Mode collapse:</b> G finds a few images that fool D and only produces those.</li>
    <li><b>No loss that shows quality:</b> the curves say little; you have to look at images.</li>
  </ul>
  <p>Important variants from the course: <b>CycleGAN</b> translates an image into another style without paired examples (summer ↔ winter; the cycle A → B → A should give back the original). <b>ESRGAN</b> is a GAN for super-resolution (4× larger): sharper than bicubic, but with <i>invented</i> details. <b>DeblurGAN</b> uses the same principle to remove blur (see <a href="#cv-restauration">Computer Vision</a>).</p>
  <div class="merk"><b>Key point</b><p>GAN = race between generator and discriminator. Result: sharp, realistic images; price: unstable training and mode collapse.</p></div>

  <h3 id="gen-methoden">5 · Overview: four ways to new images</h3>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>Idea</th><th>Loss</th><th>Strength</th><th>Weakness</th></tr>
    <tr><td><b>Autoencoder</b></td><td>image → z → image</td><td>Reconstruction</td><td>Compression, denoising, anomalies</td><td>No usable generator</td></tr>
    <tr><td><b>VAE</b></td><td>Encoder gives μ, σ; z drawn; decoder</td><td>Reconstruction + KL</td><td>Ordered latent space, interpolation, stable</td><td>Somewhat blurry images</td></tr>
    <tr><td><b>PixelCNN</b></td><td>Pixel by pixel with masked convolution</td><td>BCE / cross-entropy per pixel</td><td>Real probability, simple training</td><td>Generating very slow</td></tr>
    <tr><td><b>GAN</b></td><td>Generator against discriminator</td><td>adversarial (two losses)</td><td>Very sharp images, image-to-image</td><td>Unstable, mode collapse</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>All four learn the data distribution without labels. Autoencoder and VAE go through a compressed latent space, PixelCNN through a pixel sequence, GAN through a contest. The choice is a trade-off between sharpness, stability and speed.</p></div>

  <h3 id="gen-best">6 · Best practices</h3>
  <p>Generative models have no single correct output. The loss alone therefore says little about the quality.</p>
  <div class="bp-check">
    <div><b>Checking quality</b><ul>
      <li>Look at generated images regularly, ideally always from the same fixed <code>z</code> vectors, so you can compare the progress.</li>
      <li>Check diversity: if all images look almost the same, it is mode collapse.</li>
      <li>Find the most similar training image for each generated one: the model should create new images, not copy training images.</li>
      <li>Compare scores like FID only with many samples and the same settings.</li>
    </ul></div>
    <div><b>Training</b><ul>
      <li>Autoencoder and VAE: start with a small latent space. With the VAE, keep an eye on the weight of the KL divergence (too large: blurry, too small: no usable latent space).</li>
      <li>GAN: keep generator and discriminator in balance. If the discriminator always wins, the generator stops learning.</li>
      <li>Fix seeds and save checkpoints: GAN training can collapse suddenly.</li>
    </ul></div>
    <div><b>Responsibility</b><ul>
      <li>Clarify licence and origin of the training images.</li>
      <li>Label generated images as such, especially faces (deepfakes).</li>
    </ul></div>
  </div>
  <div class="merk"><b>Key point</b><p>Look at images, not just the loss, check diversity and copies, compare scores only with the same settings and label generated images.</p></div>
`,
  quiz: [
    { q: `What distinguishes a generative model from a classifier?`, a: `The classifier maps an image to a label. A generative model learns what the data itself looks like and can create new examples. It needs no labels.` },
    { q: `What two parts does an autoencoder have, and what is its training goal?`, a: `Encoder (image → small code z) and decoder (z → image). The goal is to reconstruct the input; the loss is the distance between x and x̂.` },
    { q: `Why does a plain autoencoder produce poor images from a random z?`, a: `The codes of the training images form scattered islands, with the latent space empty and unordered in between. A random z mostly lands in a gap.` },
    { q: `What does the encoder of a VAE output, and how is z created?`, a: `A mean μ and a spread σ per dimension. Then <code>z = μ + σ · ε</code> with <code>ε ~ N(0, 1)</code> is drawn.` },
    { q: `What is the reparameterization trick for?`, a: `No gradient flows through random drawing. With z = μ + σ · ε the randomness sits in ε; μ and σ are differentiable, so backpropagation works.` },
    { q: `What does the KL term in the VAE loss do, and when is it 0?`, a: `It pulls every distribution N(μ, σ²) towards N(0, 1) and keeps the latent space ordered and gap-free. It is 0 at μ = 0 and σ = 1.` },
    { q: `How do you create a new image with a trained VAE, and what does interpolation mean?`, a: `Draw z from N(0, 1) and apply only the decoder. Interpolation: encode two images and decode the points on the line between their codes; the image changes smoothly from A to B.` },
    { q: `Why the mask in the PixelCNN, and what is the difference between mask A and B?`, a: `For a pixel the network may only see pixels above and to the left, otherwise it would copy the target pixel. Mask A (first layer) also hides the current pixel, mask B (later layers) allows the already processed information about it.` },
    { q: `Why is PixelCNN training fast but generating slow?`, a: `Training: all pixels of a real image are known and predicted in parallel. Generating: every pixel depends on the one just rolled, so 784 steps in a row for 28 × 28.` },
    { q: `How does a GAN work?`, a: `The generator turns noise into an image, the discriminator tells real from generated images. Both are trained in alternation; the generator improves when the discriminator can be fooled.` },
    { q: `Name two typical problems in GAN training.`, a: `Mode collapse (only a few different images), an unbalanced discriminator (too strong: no gradient for the generator), no meaningful loss curve for image quality.` },
    { q: `Which model would you choose for 4× upscaling with sharp details, and what is the catch?`, a: `A GAN such as ESRGAN: sharper than bicubic. Catch: the details are invented and do not match reality, which is a risk for measurement images.` },
    { q: `Why is a loss curve not enough to validate generative models?`, a: `The loss says little about sharpness and diversity. You have to look at generated examples (or use metrics such as FID) and watch for blur, mode collapse and errors.` },
  ],
});
