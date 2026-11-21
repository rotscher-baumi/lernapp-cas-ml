/* English texts for the module "gen" (Generative Models). Fields replace the German ones when the language is EN. */
(function () {
const F = LernApp.genFig;
LernApp.translate('gen', {
  nav: 'Generative Models',
  title: `Generative Models`,
  kicker: `Module 3 · Generative Models · Sat 21.11.`,
  summary: `Discriminative and generative, taxonomy, autoencoder, VAE (latent space, KL, reparameterization), PixelCNN, GAN (minimax, mode collapse), diffusion (DDPM, noise schedule), conditional diffusion and Stable Diffusion (guidance scale), evaluation (FID)`,
  html: `  <p>So far a model mapped an input to a result: an image to a label, an apartment to a price. A <b>generative model</b> instead learns <b>what the data itself looks like</b> and can then produce new, similar examples: new digits, new faces, a summer picture as a winter picture, an image from a sentence. It needs no labels for this; the images themselves are the target.</p>
  <p>The chapter follows the course day: first the question of what “generative” means exactly, then four model families in the order they appeared: <b>VAE</b> (2013), <b>GAN</b> (2014), <b>PixelCNN</b> (2016) and <b>diffusion</b> (2020), finally text-to-image with Stable Diffusion. For each model there is the idea, the architecture, the loss, the workflow of training and generating, and the typical problems.</p>
  <p class="note">The demos compute in the browser with small examples. The course notebooks (autoencoder and VAE on MNIST, faces with the Stable Diffusion VAE, a GAN with mode collapse, ESRGAN and CycleGAN, diffusion from scratch and text-to-image with Stable Diffusion) run in Jupyter or Colab.</p>

  <h3 id="gen-ablauf">The whole workflow at a glance</h3>
  <p>The workflow is the same as for the <a href="#cnn-ablauf">CNN</a>. What changes: there are no labels, the loss depends on the model type, validation consists mainly of <b>looking at generated samples</b>, and there is an extra step at the end: generating (sampling).</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="genFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Workflow of a generative-models project: data without labels, choose the model, set loss and optimizer, then the training loop of forward pass, loss, backpropagation and update, then check generated samples and finally generate new samples">
      ${LernApp.nnFlow({
        id: 'gn',
        aria: 'Step %: open explanation',
        steps: [
          ['Data', 'images without labels, maybe condition y'],
          ['Choose the model', 'VAE, GAN, PixelCNN, diffusion'],
          ['Loss and optimizer', 'reconstruction + KL, adversarial, MSE on noise'],
          ['Forward pass', 'encoder → z → decoder, G → D, U-Net(x_t, t)'],
          ['Compute the loss', 'distance to image, judgement or noise'],
          ['Backpropagation', 'reparameterization, gradient through D'],
          ['Update the parameters', 'for the GAN: D and G alternately'],
          ['Check samples', 'sharp? diverse? no copies? FID'],
          ['Generate', 'draw z or denoise noise'],
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
    <figcaption>Steps 4 to 7 (orange dashed, inside) run for every mini-batch. The outer loop is tuning. Step 9 (orange) is the goal: new samples.</figcaption>
  </figure>

  <h3 id="gen-was">1 · Discriminative and generative: what is a generative model?</h3>
  <p>All models of the previous chapters are <b>discriminative</b>: they get an example <code>x</code> and predict a label <code>y</code>. Mathematically they learn <code>p(y | x)</code>, and there is <b>one</b> correct answer. A <b>generative</b> model goes the other way: it gets (at most) a description <code>y</code> and produces an example <code>x</code>. It learns <code>p(x | y)</code>, or without a condition <code>p(x)</code>, i.e. the <b>distribution of the data</b>.</p>
  <figure class="fig" style="max-width:640px">${F.discGen()}<figcaption>There are countless images that fit the label “dog”. A generative model returns a different one on every call by drawing from the learned distribution.</figcaption></figure>
  <ul>
    <li><b>Many possible outputs:</b> many results fit one input, some more plausible than others. So you <b>draw</b> an output: <code>x′ ~ p(x | y)</code>. Drawing twice gives two different images.</li>
    <li><b>The output is richer than the input:</b> one word (“dog”) becomes hundreds of thousands of pixels. The model has to fill in all details itself.</li>
    <li><b>Generative can also classify:</b> with Bayes’ rule <code>p(y | x) = p(x | y) · p(y) / p(x)</code> a generative model can be turned into a classifier. Not the other way round.</li>
  </ul>
  <p>A deep generative model always has three parts:</p>
  <div class="steps">
    <div class="st"><b>1 · Representation</b><span>A neural network describes the distribution, often via a small latent space z.</span></div><div class="ar">→</div>
    <div class="st"><b>2 · Training</b><span>A loss that brings the network’s distribution close to the data. The parameters are optimised with backpropagation as always.</span></div><div class="ar">→</div>
    <div class="st"><b>3 · Sampling</b><span>A procedure to draw new examples from the trained model.</span></div>
  </div>
  <h4>Taxonomy: four families</h4>
  <p>The models differ in whether they can compute the probability <code>p(x)</code> of an image (<b>explicit</b> density) or only produce images without knowing a probability (<b>implicit</b> density).</p>
  <figure class="fig" style="max-width:720px">${F.taxonomy()}</figure>
  <div class="tablewrap"><table>
    <tr><th>Year</th><th>Model</th><th>Idea in one sentence</th></tr>
    <tr><td>2013</td><td><b>VAE</b> (Kingma, Welling)</td><td>Map an image to a distribution in latent space and build an image from it again</td></tr>
    <tr><td>2014</td><td><b>GAN</b> (Goodfellow et al.)</td><td>A forger network and a judge network train each other</td></tr>
    <tr><td>2016</td><td><b>PixelCNN</b> (van den Oord et al.)</td><td>Predict an image pixel by pixel, each depending on the previous ones</td></tr>
    <tr><td>2020</td><td><b>Diffusion / DDPM</b> (Ho et al.)</td><td>Learn to remove noise from an image step by step</td></tr>
    <tr><td>2022</td><td><b>Stable Diffusion</b> (Rombach et al.)</td><td>Diffusion in the latent space of a VAE, guided by text</td></tr>
  </table></div>
  <p>No model is good at everything. This is called the <b>trilemma</b> of generative models: high <b>quality</b>, wide <b>diversity</b> and <b>fast</b> sampling at the same time is hard. GANs are sharp and fast, but not very diverse. VAEs are fast and diverse, but blurry. Diffusion is sharp and diverse, but slow.</p>
  <div class="merk"><b>Key point</b><p>Discriminative: <code>x → y</code>, one correct answer, <code>p(y | x)</code>. Generative: <code>y → x</code>, many possible answers, <code>p(x | y)</code>, and you draw from it. Every generative model needs a representation, training and sampling.</p></div>

  <h3 id="gen-ae">2 · Autoencoder: compress and reconstruct</h3>
  <p>The autoencoder is not a generator yet, but it is the building block of the VAE and of Stable Diffusion. It consists of two networks: the <b>encoder</b> <code>f</code> squeezes the image into a small vector <b>z</b> (the <b>code</b> in the <b>latent space</b>), the <b>decoder</b> <code>g</code> rebuilds the image from it. The target is the input itself: <code>g(f(x)) ≈ x</code>.</p>
  <figure class="fig" style="max-width:600px">${F.ae()}</figure>
  <p>Because z is much smaller than the image (e.g. 32 instead of 784 numbers), the network has to keep what matters: a narrow passage, the <b>bottleneck</b>. This is dimensionality reduction like <a href="#unsup-pca">PCA</a>, but non-linear.</p>
  <h4>Training workflow</h4>
  <ol>
    <li>Take a mini-batch of images <code>x</code> (pixels scaled to [0, 1]). No labels needed.</li>
    <li><b>Encoder:</b> <code>z = f(x)</code>, e.g. 784 → 256 → 32.</li>
    <li><b>Decoder:</b> <code>x̂ = g(z)</code>, mirrored 32 → 256 → 784, sigmoid at the output.</li>
    <li><b>Loss:</b> distance between <code>x</code> and <code>x̂</code>, MSE or binary cross-entropy per pixel.</li>
    <li>Backpropagation through decoder <i>and</i> encoder; both are trained together.</li>
  </ol>
  <pre><code>class AutoEncoder(nn.Module):                  # PyTorch, as in the course notebook
    def __init__(self, d=32):
        super().__init__()
        self.enc = nn.Sequential(nn.Flatten(), nn.Linear(784, 256), nn.ReLU(), nn.Linear(256, d))
        self.dec = nn.Sequential(nn.Linear(d, 256), nn.ReLU(), nn.Linear(256, 784), nn.Sigmoid())
    def forward(self, x):
        z = self.enc(x)
        return self.dec(z).view_as(x)

x_hat = model(x)
loss = F.binary_cross_entropy(x_hat, x)        # target = input, no labels</code></pre>
  <p>It is used for <b>compression</b> and as a feature extractor, for <b>denoising</b> (noisy image in, clean one as the target) and for <b>anomaly detection</b> (high reconstruction error = unusual image, because the network can only rebuild “normal” images well). Advantages: simple and stable to train. Limits: encoder and decoder are <b>deterministic</b>, there is no uncertainty and above all no way to draw sensible new images.</p>
  <div class="falle"><b>Pitfall</b><p>A plain autoencoder is <b>not</b> a good generator. The codes of the training images lie as scattered islands in the latent space, with empty, unordered space in between. If you draw a random z, it usually lands in a gap and the decoder builds nonsense. This is exactly the problem the VAE solves.</p></div>

  <h3 id="gen-vae">3 · Variational autoencoder (VAE): a latent space you can sample from</h3>
  <p>The VAE turns the idea around: first there is a simple distribution in latent space, <code>z ~ p(z) = N(0, I)</code>, and the decoder turns it into an image, <code>p_θ(x | z)</code>. For this to work, every point near the origin must lead to a sensible image. The encoder <code>q_φ(z | x)</code> therefore outputs <b>not a point</b> but a <b>distribution</b>: one mean <b>μ</b> and one spread <b>σ</b> per dimension.</p>
  <figure class="fig" style="max-width:600px">${F.vae()}</figure>
  <h4>The loss has two parts</h4>
  <pre><code>loss = reconstruction  +  β · KL( N(μ, σ²) ‖ N(0, I) )
KL per dimension = ½ · (μ² + σ² − ln σ² − 1)          # 0 exactly at μ = 0, σ = 1</code></pre>
  <ul>
    <li><b>Reconstruction:</b> the drawn z should lead back to the input image (MSE or BCE as in the autoencoder). This part alone would push σ to 0, and the VAE would become a plain autoencoder.</li>
    <li><b>KL term</b> (Kullback-Leibler divergence, the regularisation): pulls every distribution N(μ, σ²) towards the standard normal distribution. So the distributions of all images overlap, and the space has <b>no gaps</b>.</li>
    <li><b>β</b> weights the two goals (in the notebook <code>beta=1.0</code>). Larger β: more ordered space, but blurrier images. Smaller β: sharper reconstruction, but gaps in the space.</li>
  </ul>
  <p><b>Reparameterization trick:</b> you cannot differentiate through random sampling. So you write <code>z = μ + σ · ε</code> with <code>ε ~ N(0, I)</code>. The randomness now sits in ε, and backpropagation runs through μ and σ into the encoder. In practice the encoder outputs <code>log σ²</code>, because that may take any value, whereas σ must be positive.</p>
  <div class="demo" id="vaDemo">
    <div class="tag">Demo</div><h4>Latent space with 2 dimensions</h4>
    <p class="hint">The orange point is μ of one image, the blue points are 40 draws z = μ + σ · ε. The dashed circles show N(0, 1) (1 and 2 standard deviations). Move μ to (0, 0) and σ to 1: then the KL term is 0.</p>
    <div class="ctl"><label for="vaM1">μ₁</label><input type="range" id="vaM1" min="-2.5" max="2.5" step="0.1" value="1.2"><output id="vaM1O"></output></div>
    <div class="ctl"><label for="vaM2">μ₂</label><input type="range" id="vaM2" min="-2.5" max="2.5" step="0.1" value="-0.8"><output id="vaM2O"></output></div>
    <div class="ctl"><label for="vaS">σ</label><input type="range" id="vaS" min="0.05" max="1.5" step="0.05" value="0.5"><output id="vaSO"></output></div>
    <svg class="plot" id="vaSvg" viewBox="0 0 300 240" style="max-width:420px" role="img" aria-label="Two-dimensional latent space with mean, 40 drawn points and the standard normal distribution as circles"></svg>
    <div class="stats"><span>KL term <b id="vaKL"></b></span></div>
    <p class="hint" id="vaMsg"></p>
  </div>
  <h4>Training workflow</h4>
  <ol>
    <li>Take a mini-batch <code>x</code>.</li>
    <li><b>Encoder:</b> <code>μ, log σ² = f(x)</code> (two output heads).</li>
    <li><b>Draw:</b> <code>ε ~ N(0, I)</code>, <code>z = μ + σ · ε</code>.</li>
    <li><b>Decoder:</b> <code>x′ = g(z)</code>.</li>
    <li><b>Loss:</b> reconstruction(x, x′) + β · KL(μ, σ), backpropagation, update.</li>
  </ol>
  <pre><code>mu, logvar = model.encode(x)
z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)        # reparameterization
x_rec = model.decode(z)
rec = F.binary_cross_entropy(x_rec, x, reduction="sum")
kl = -0.5 * torch.sum(1 + logvar - mu**2 - logvar.exp())
loss = rec + beta * kl</code></pre>
  <h4>Generating workflow</h4>
  <p>New images need <b>only the decoder</b>: draw <code>z ~ N(0, I)</code>, <code>x = g(z)</code>. The encoder is only needed for training and for encoding real images. With this you can:</p>
  <ul>
    <li><b>Produce new images:</b> decode many random z.</li>
    <li><b>Interpolate:</b> encode two images and decode the points on the line between their codes. The image changes smoothly from A to B (pose, light, expression). With a plain autoencoder you get blends or nonsense in between.</li>
    <li><b>Turn the knobs of the latent space:</b> move along one direction in the space and see what changes (in the notebook as a 2D grid). The network learns which property a direction controls without labels; you have to try it out.</li>
  </ul>
  <h4>Limits</h4>
  <ul>
    <li><b>Blurry images:</b> the decoder is trained with a Gaussian assumption (MSE). If it is unclear where exactly an edge lies, the mean of all possibilities is the best answer, and that is washed out.</li>
    <li><b>Limited expressiveness:</b> a simple latent space (normal distribution) cannot capture all subtleties of complex images.</li>
    <li><b>Missing diversity:</b> rare variants of the data can get lost.</li>
  </ul>
  <p><b>VAEs today:</b> as an image generator of its own the VAE has been superseded, but as a building block it is everywhere. <b>Stable Diffusion</b> uses a VAE that shrinks an image of 512 × 512 × 3 to a latent of 64 × 64 × 4 (48 times fewer numbers); the expensive diffusion then runs in this small space (<a href="#gen-cond">section 7</a>). The notebook loads exactly this VAE (<code>stabilityai/sd-vae-ft-mse</code>), encodes faces, blends them in latent space and adds noise there: a first look at diffusion.</p>
  <div class="merk"><b>Key point</b><p>Autoencoder: image → point → image. VAE: image → distribution (μ, σ) → drawn point → image. The KL term keeps the space ordered and gap-free, the reparameterization trick makes the drawing differentiable. Generating uses only the decoder with z ~ N(0, I).</p></div>

  <h3 id="gen-pixel">4 · PixelCNN: one pixel after the other</h3>
  <p>An <b>autoregressive</b> model breaks the image into a sequence and always predicts the next element, like a language model predicts the next word. By the chain rule of probability the image is a product of probabilities, each pixel depending on all previous ones (row by row, left to right):</p>
  <pre><code>p(image) = p(pixel₁) · p(pixel₂ | pixel₁) · p(pixel₃ | pixel₁, pixel₂) · …</code></pre>
  <p>This makes <code>p(x)</code> exactly computable (explicit, “tractable” density). The <b>PixelCNN</b> implements this with <b>masked convolutions</b>: the filter is covered so that it only sees pixels <i>above and to the left</i> of the current pixel. The first layer (mask <b>A</b>) does not see the current pixel itself, the later ones (mask <b>B</b>) may use the processed information at that position. Without a mask the network could simply copy the pixel it is supposed to predict.</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Training</th><th>Generating</th></tr>
    <tr><td><b>Input</b></td><td>a real image, all pixels known</td><td>empty image</td></tr>
    <tr><td><b>Procedure</b></td><td>One pass predicts the probability for <i>all</i> pixels at once (the mask prevents peeking)</td><td>predict pixel 1, <b>roll</b> it according to its probability, write it into the image, then predict pixel 2 with the new image, and so on</td></tr>
    <tr><td><b>Loss</b></td><td>binary cross-entropy per pixel (black and white) or 256-class softmax (grey levels)</td><td>–</td></tr>
    <tr><td><b>Speed</b></td><td>fast, parallel</td><td>slow: 784 passes for 28 × 28</td></tr>
  </table></div>
  <div class="demo" id="pxDemo">
    <div class="tag">Demo</div><h4>PixelCNN draws a 7 on an 8 × 8 grid</h4>
    <p class="hint">Move the slider: on the left you see which pixels the network may see for the orange pixel (blue, only those before it). On the right the image rolled so far. The probabilities are given and stand for a trained network. “Roll again” gives a different 7.</p>
    <div class="ctl"><label for="pxK">Current pixel</label><input type="range" id="pxK" min="0" max="63" step="1" value="20"><output id="pxKO"></output></div>
    <div class="btnrow"><button id="pxNew">Roll again</button></div>
    <svg class="plot" id="pxSvg" viewBox="0 0 410 200" style="max-width:520px" role="img" aria-label="Left the PixelCNN mask, right the image drawn up to the current pixel"></svg>
    <div class="stats"><span>p(pixel = 1) <b id="pxP"></b></span></div>
    <p class="hint" id="pxMsg"></p>
  </div>
  <p>The same idea is in image transformers that produce an image as a sequence of tokens. It has the advantage of a real probability per image (good for comparing models and for anomalies) and the drawback of slow generation.</p>
  <div class="merk"><b>Key point</b><p>PixelCNN is a classifier for the next pixel. The mask prevents peeking. Training is parallel, generating is pixel by pixel and therefore slow. In return there is a real probability for every image.</p></div>

  <h3 id="gen-gan">5 · GAN: forger against judge</h3>
  <p>A <b>generative adversarial network</b> does not compute a probability (implicit density). It consists of two networks playing against each other:</p>
  <ul>
    <li>The <b>generator</b> G turns random noise <code>z ~ N(0, I)</code> into an image <code>G(z)</code>. It is the forger and never sees a real image.</li>
    <li>The <b>discriminator</b> D gets real and generated images and outputs a probability <code>D(x) ∈ [0, 1]</code> that the image is real. It is the judge, an ordinary binary classifier.</li>
  </ul>
  <figure class="fig" style="max-width:624px">${F.gan()}</figure>
  <h4>The objective: a minimax game</h4>
  <pre><code>min_G  max_D   E_x[ log D(x) ]  +  E_z[ log(1 − D(G(z))) ]</code></pre>
  <p>This is the binary cross-entropy of the discriminator, once maximised and once minimised:</p>
  <ul>
    <li><b>D step</b> (G fixed): D maximises the expression. It pushes <code>D(x)</code> for real images towards 1 and <code>D(G(z))</code> for fakes towards 0.</li>
    <li><b>G step</b> (D fixed): G minimises the expression but can only influence the second part. It wants to push <code>D(G(z))</code> towards 1. In practice you maximise <code>log D(G(z))</code> instead of minimising <code>log(1 − D(G(z)))</code> (<i>non-saturating</i> loss): at the start D recognises every fake, and the original expression would have almost no gradient there.</li>
  </ul>
  <h4>Training workflow</h4>
  <ol>
    <li>Draw a mini-batch of real images <code>x</code> and noise <code>z</code>, produce fakes <code>G(z)</code>.</li>
    <li><b>D step:</b> BCE with target 1 for <code>x</code> and target 0 for <code>G(z)</code>. Update only the weights of D (<code>G(z).detach()</code>).</li>
    <li><b>G step:</b> send new fakes through D, BCE with target <b>1</b> (“take them for real”). The gradient flows through D, but only the weights of G are updated.</li>
    <li>Repeat. After every epoch produce images from <b>the same fixed z</b> and look at them.</li>
  </ol>
  <pre><code>opt_D = torch.optim.Adam(D.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_G = torch.optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))
for x in loader:
    z = torch.randn(len(x), z_dim)
    fake = G(z)
    # D step: real → 1, fake → 0
    loss_D = bce(D(x), ones) + bce(D(fake.detach()), zeros)
    opt_D.zero_grad(); loss_D.backward(); opt_D.step()
    # G step: D should take the fake for real
    loss_G = bce(D(fake), ones)
    opt_G.zero_grad(); loss_G.backward(); opt_G.step()</code></pre>
  <div class="demo" id="gaDemo">
    <div class="tag">Demo</div><h4>A GAN in one dimension</h4>
    <p class="hint">The real data are numbers around 2 (grey, N(2, 0.5²)). The generator turns z into the number a · z + b (orange), the discriminator is a simple curve D(x) (blue, dashed). Every step is one D step and one G step. Compare the three settings.</p>
    <div class="btnrow" id="gaMode" role="group" aria-label="Setting"><button data-v="ok" class="pri" aria-pressed="true">balanced</button><button data-v="weak" aria-pressed="false">discriminator too weak</button><button data-v="fast" aria-pressed="false">generator too fast</button></div>
    <div class="btnrow"><button id="gaOne">1 step</button><button id="gaTen">25 steps</button><button id="gaPlay">Play</button><button id="gaReset">Restart</button></div>
    <svg class="plot" id="gaSvg" viewBox="0 0 400 220" role="img" aria-label="Distribution of the real data, distribution of the generator and curve of the discriminator"></svg>
    <div class="stats"><span>Step <b id="gaStep"></b></span><span>Generator μ <b id="gaMu"></b></span><span>Generator σ <b id="gaSd"></b></span><span>Ø D(real) <b id="gaDr"></b></span><span>Ø D(fake) <b id="gaDf"></b></span></div>
    <p class="hint" id="gaMsg"></p>
  </div>
  <h4>Typical problems</h4>
  <ul>
    <li><b>Mode collapse:</b> G finds a few images that fool D and produces only those. In the notebook the generator then produces almost a single digit. In the demo above σ shrinks to 0.</li>
    <li><b>Balance:</b> if D becomes too strong, <code>D(G(z)) ≈ 0</code> everywhere and G gets no usable gradient. If D is too weak, it does not show G what is wrong. If G learns too fast, the game swings up.</li>
    <li><b>No loss that shows quality:</b> the two losses rise and fall against each other; their values say little about image quality. You have to look at images.</li>
  </ul>
  <p>Proven recipes (DCGAN): strided convolutions instead of pooling, batch normalisation, LeakyReLU in the discriminator, tanh at the generator output (pixels in [−1, 1]), Adam with learning rate 2·10⁻⁴ and β₁ = 0.5. Further tools are label smoothing (real images with target 0.9 instead of 1) and the Wasserstein loss (WGAN).</p>
  <h4>GAN versus VAE</h4>
  <p>Because the generator is only measured by whether D is fooled, there is no incentive to average: GAN images are <b>sharp</b>, VAE images rather soft. On the other hand the GAN has no encoder, no probability and a delicate training. In the GAN too, z controls the image: different z give different images, neighbouring z similar ones.</p>
  <h4>Variants</h4>
  <div class="tablewrap"><table>
    <tr><th>Variant</th><th>Idea</th><th>Application</th></tr>
    <tr><td><b>DCGAN</b></td><td>G and D made of convolution layers</td><td>basis of almost all image GANs</td></tr>
    <tr><td><b>Conditional GAN</b></td><td>G and D additionally get a label y</td><td>produce a specific digit or class on purpose</td></tr>
    <tr><td><b>Pix2Pix</b></td><td>image to image with <i>paired</i> examples</td><td>sketch → photo, map → aerial image</td></tr>
    <tr><td><b>CycleGAN</b></td><td>image to image <i>without</i> pairs; the cycle A → B → A should give the original (cycle consistency)</td><td>summer ↔ winter, horse ↔ zebra (notebook)</td></tr>
    <tr><td><b>ESRGAN</b></td><td>super-resolution with a GAN loss</td><td>4× larger, sharper than bicubic, but with <i>invented</i> details (notebook, see <a href="#cv-restauration">Image Processing</a>)</td></tr>
    <tr><td><b>StyleGAN</b></td><td>z controls the style at every resolution level</td><td>photorealistic faces</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>GAN = minimax game between generator and discriminator, trained alternately. Result: sharp, realistic images in a single pass. Price: unstable training, mode collapse and no loss curve that shows quality.</p></div>

  <h3 id="gen-diff">6 · Diffusion: remove noise step by step</h3>
  <p>Diffusion models are behind Stable Diffusion, DALL·E and Midjourney. The idea: it is hard to produce an image out of nothing. But it is easy to <b>destroy</b> an image with noise. If a network learns to undo every small destruction step, it can start from pure noise and uncover a new image.</p>
  <figure class="fig" style="max-width:640px">${F.diffusion()}</figure>
  <h4>Forward process: add noise (fixed)</h4>
  <ul>
    <li>Over <b>T</b> time steps (typically T = 1000) some Gaussian noise is added in every step: <code>q(x_t | x_{t−1}) = N(√(1−β_t) · x_{t−1}, β_t · I)</code>.</li>
    <li>Each step depends only on the previous one (<b>Markov chain</b>). The small noise amounts <code>β_t</code> form the <b>noise schedule</b>, e.g. linear from 0.0001 to 0.02.</li>
    <li>Thanks to Gaussian properties you can jump <b>directly</b> to any t without computing the steps before:</li>
  </ul>
  <pre><code>x_t = √ᾱ_t · x₀  +  √(1 − ᾱ_t) · ε        with ε ~ N(0, I),   ᾱ_t = (1 − β₁) · (1 − β₂) · … · (1 − β_t)</code></pre>
  <p>At t = 0, ᾱ = 1 (clean image), at t = T, ᾱ ≈ 0 (pure noise). This part is <b>not</b> trained; it is a fixed formula.</p>
  <div class="demo" id="dfDemo">
    <div class="tag">Demo</div><h4>Noising an image: x_t from x₀ and ε</h4>
    <p class="hint">Move t from 0 to 1000. On the right you see ᾱ_t: how much of the image is left. Compare the linear noise schedule (DDPM) with the cosine schedule, which destroys the image more slowly.</p>
    <div class="ctl"><label for="dfT">Time step t</label><input type="range" id="dfT" min="0" max="1000" step="10" value="300"><output id="dfTO"></output></div>
    <div class="btnrow" id="dfKind" role="group" aria-label="Noise schedule"><button data-v="lin" class="pri" aria-pressed="true">linear</button><button data-v="cos" aria-pressed="false">cosine</button><button id="dfPlay">Play forward</button></div>
    <svg class="plot" id="dfSvg" viewBox="0 0 510 150" style="max-width:640px" role="img" aria-label="Clean image, noise and noisy image at the chosen time step, next to it ᾱ over t for both noise schedules"></svg>
    <div class="stats"><span>ᾱ_t <b id="dfAb"></b></span><span>Image share √ᾱ <b id="dfSi"></b></span><span>Noise share √(1−ᾱ) <b id="dfNo"></b></span></div>
    <p class="hint" id="dfMsg"></p>
  </div>
  <h4>Reverse process: remove noise (learned)</h4>
  <p>The way back <code>p_θ(x_{t−1} | x_t)</code> cannot be computed; a neural network learns it. Usually the network <code>ε_θ(x_t, t)</code> does not predict the clean image but <b>the noise contained in x_t</b>. Subtracting part of it brings you one step closer to the image. The network is a <b>U-Net</b> (encoder-decoder with skip connections, as in <a href="#det-seg">segmentation</a>): input and output have the same size. Because the same network serves all 1000 levels, it gets the time step <b>t as an extra input</b> (timestep conditioning, as an embedding in every block).</p>
  <h4>Training workflow (DDPM)</h4>
  <ol>
    <li>Take a real image <code>x₀</code> from the data.</li>
    <li>Draw a random time step <code>t</code> between 1 and T.</li>
    <li>Draw noise <code>ε ~ N(0, I)</code> and compute <code>x_t</code> directly with the formula.</li>
    <li>The U-Net estimates the noise: <code>ε̂ = ε_θ(x_t, t)</code>.</li>
    <li><b>Loss</b> = MSE between ε and ε̂. Backpropagation, update, repeat.</li>
  </ol>
  <pre><code>scheduler = DDPMScheduler(num_train_timesteps=1000)       # diffusers, as in the notebook
for x0 in loader:
    noise = torch.randn_like(x0)
    t = torch.randint(0, 1000, (len(x0),))
    x_t = scheduler.add_noise(x0, noise, t)                 # √ᾱ·x0 + √(1−ᾱ)·ε
    pred = unet(x_t, t).sample                              # U-Net estimates the noise
    loss = F.mse_loss(pred, noise)
    opt.zero_grad(); loss.backward(); opt.step()</code></pre>
  <p>This is perfectly ordinary supervised training with MSE: no opponent, no KL term. That is why it is <b>stable</b>. The notebook “Diffusion from scratch” first builds a simpler version: it mixes image and noise with an amount between 0 and 1 and lets a small U-Net predict the clean image directly. Then it compares this with the real DDPM procedure.</p>
  <h4>Generating workflow (sampling)</h4>
  <ol>
    <li>Start from pure noise: <code>x_T ~ N(0, I)</code>.</li>
    <li>For t = T, T−1, …, 1: estimate the noise <code>ε_θ(x_t, t)</code>, subtract part of it, (except in the last step) add a little fresh noise again → <code>x_{t−1}</code>.</li>
    <li><code>x₀</code> is the new image.</li>
  </ol>
  <p>With DDPM that is 1000 passes through the U-Net, i.e. <b>slow</b>. Newer schedulers (DDIM, DPM-Solver) manage with 20 to 50 steps; in the notebook you can try this with <code>num_inference_steps</code> (5 steps: blurry, 50: done, 100: hardly better).</p>
  <div class="tablewrap"><table>
    <tr><th>Advantages</th><th>Disadvantages</th></tr>
    <tr><td>Very high image quality, often better than GANs<br>Wide diversity, no mode collapse<br>Stable training with a simple MSE loss</td><td>Slow sampling: many passes per image<br>Compute-intensive training, needs a GPU and much data<br>Large memory need at high resolution (hence latent diffusion)</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>Forward: noise the image with a fixed formula in T steps. Reverse: a U-Net learns with MSE to estimate the noise in x_t, for every level t. Generating: start from pure noise and denoise step by step. Stable and diverse, but slow.</p></div>

  <h3 id="gen-cond">7 · Conditional diffusion and text-to-image</h3>
  <p>So far the model produces some image from the data distribution. Usually you want a <b>specific</b> image: a 7, a dog, “a dog on a beach at sunset”. For this the network gets a <b>condition</b> y as an extra input and learns <code>ε_θ(x_t, t, y)</code>.</p>
  <ul>
    <li><b>Class</b> (e.g. digit 0 to 9): a learned embedding of the class, fed into the U-Net blocks like the time step. This way the notebook produces new images of a chosen digit.</li>
    <li><b>Text:</b> a text encoder (for Stable Diffusion 1.5: CLIP) turns the prompt into a sequence of vectors. The U-Net looks at it via <b>cross-attention</b> at every resolution level.</li>
  </ul>
  <h4>Classifier-free guidance: how much does the prompt count?</h4>
  <p>During training the condition is dropped in about 10 % of the cases. The same network can then estimate noise <b>with</b> and <b>without</b> the condition. When sampling you compute both and amplify the difference:</p>
  <pre><code>ε̂ = ε_θ(x_t, t, ∅)  +  w · ( ε_θ(x_t, t, y) − ε_θ(x_t, t, ∅) )        w = guidance scale</code></pre>
  <ul>
    <li><b>w = 1:</b> ordinary conditional model. Diverse, but follows the prompt only loosely.</li>
    <li><b>w ≈ 7.5</b> (default for Stable Diffusion): a good compromise.</li>
    <li><b>Large w</b> (15 and more): follows the prompt very closely, but less diversity, oversaturated colours, artefacts.</li>
  </ul>
  <h4>Latent diffusion: how Stable Diffusion works</h4>
  <p>Diffusion directly on 512 × 512 × 3 pixels would be very expensive. <b>Latent diffusion</b> combines the models of this chapter: a <b>VAE</b> shrinks the image to a latent of 64 × 64 × 4, the diffusion runs only in this small space, and the VAE decoder turns the result back into an image at the end.</p>
  <figure class="fig" style="max-width:880px"><div style="overflow-x:auto">${F.latent()}</div></figure>
  <ol>
    <li>Prompt → text encoder → text embeddings (plus an empty or a <b>negative prompt</b> for the guidance).</li>
    <li>Draw a random latent <code>z_T</code>. The <b>seed</b> fixes it: same seed + same prompt = same image.</li>
    <li>The <b>scheduler</b> runs 20 to 50 steps. In each, the U-Net estimates the noise with and without the text, combines both with the guidance scale and removes part of it.</li>
    <li>The VAE decoder turns the finished latent into the image.</li>
  </ol>
  <pre><code>pipe = StableDiffusionPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5", torch_dtype=torch.float16).to("cuda")
image = pipe("a photo of a dog on a beach at sunset",
             num_inference_steps=50,      # number of denoising steps
             guidance_scale=7.5,          # how strongly the prompt counts
             generator=torch.Generator("cuda").manual_seed(42)).images[0]</code></pre>
  <div class="tablewrap"><table>
    <tr><th>Parameter</th><th>Effect</th></tr>
    <tr><td><code>prompt</code>, <code>negative_prompt</code></td><td>what should be in the image and what not (“blurry, low quality”)</td></tr>
    <tr><td><code>num_inference_steps</code></td><td>few: fast, but unfinished and blurry; 25 to 50: good; more: hardly better, slower</td></tr>
    <tr><td><code>guidance_scale</code></td><td>small: free, follows the prompt little; 7 to 9: default; large: exact, but oversaturated</td></tr>
    <tr><td><code>generator</code> (seed)</td><td>determines the starting noise; fix it for reproducible and comparable images</td></tr>
    <tr><td><code>height</code>, <code>width</code></td><td>multiples of 8 (because of the VAE); ideally the training resolution (512 for SD 1.5)</td></tr>
  </table></div>
  <p>The same machine can do more than text-to-image: <b>image-to-image</b> (noise an existing image only partly and denoise it again; the strength decides how much changes), <b>inpainting</b> (regenerate only a mask), <b>ControlNet</b> (pose or edges as an extra condition) and <b>text-to-video</b>.</p>
  <div class="merk"><b>Key point</b><p>Conditional diffusion = diffusion with a condition y (class, text). Classifier-free guidance amplifies the difference between with and without the condition, the guidance scale trades faithfulness against diversity. Stable Diffusion = text encoder + U-Net diffusion in the latent space of a VAE + VAE decoder.</p></div>

  <h3 id="gen-eval">8 · Evaluation: when is a generative model good?</h3>
  <p>There is no correct answer to compare with. A good model produces images that are <b>realistic</b> (quality), cover the whole range of the data (<b>diversity</b>), are <b>new</b> (no copies) and, if conditioned, <b>match the condition</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Method</th><th>What it measures</th><th>Notes</th></tr>
    <tr><td><b>Look at images</b></td><td>sharpness, errors, diversity at a glance</td><td>always from the same fixed z or seeds, many at once (grid), not only the best</td></tr>
    <tr><td><b>FID</b> (Fréchet Inception Distance)</td><td>distance between the features of real and generated images in a pretrained network (Inception); quality and diversity together</td><td>lower is better; needs thousands of images; only comparable with equal settings</td></tr>
    <tr><td><b>Nearest neighbours</b></td><td>does the model copy training images?</td><td>search the most similar training image for every generated one</td></tr>
    <tr><td><b>CLIP score</b></td><td>does the image match the prompt?</td><td>for text-to-image</td></tr>
    <tr><td><b>Log-likelihood</b></td><td>probability of real test images under the model</td><td>only with explicit density (PixelCNN; for the VAE a bound), not for the GAN</td></tr>
    <tr><td><b>Human rating</b></td><td>what people find more realistic or more fitting</td><td>laborious, but often the measure that counts</td></tr>
  </table></div>
  <div class="falle"><b>Pitfall</b><p>Reading the training loss as a quality measure. In the GAN the two losses swing against each other, in the VAE the loss also falls with washed-out images, and in diffusion the MSE on the noise says little about the finished image. Look at images and measure FID.</p></div>

  <h3 id="gen-methoden">9 · Overview: four ways to new images</h3>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>Idea</th><th>Loss</th><th>Generating</th><th>Strength</th><th>Weakness</th></tr>
    <tr><td><b>Autoencoder</b></td><td>image → z → image</td><td>reconstruction</td><td>–</td><td>compression, denoising, anomalies</td><td>no usable generator</td></tr>
    <tr><td><b>VAE</b></td><td>encoder gives μ, σ; z drawn; decoder</td><td>reconstruction + KL</td><td>fast: one decoder pass</td><td>ordered latent space, interpolation, stable</td><td>blurry images</td></tr>
    <tr><td><b>PixelCNN</b></td><td>pixel by pixel with masked convolution</td><td>cross-entropy per pixel</td><td>very slow: one pass per pixel</td><td>real probability, simple training</td><td>slow, rather small images</td></tr>
    <tr><td><b>GAN</b></td><td>generator against discriminator</td><td>adversarial (minimax)</td><td>fast: one generator pass</td><td>very sharp images, image-to-image</td><td>unstable, mode collapse</td></tr>
    <tr><td><b>Diffusion</b></td><td>remove noise step by step</td><td>MSE on the noise</td><td>slow: 20 to 1000 U-Net passes</td><td>best quality and diversity, stable, text-to-image</td><td>compute-intensive</td></tr>
  </table></div>
  <h4>Which model when?</h4>
  <ul>
    <li><b>Text-to-image, image editing, high quality:</b> take a pretrained diffusion model (Stable Diffusion), do not train one yourself.</li>
    <li><b>Image to image in real time</b> (super-resolution, style transfer): GAN (ESRGAN, CycleGAN).</li>
    <li><b>Compact representation, interpolation, anomalies:</b> VAE or autoencoder.</li>
    <li><b>Probability of an image needed:</b> autoregressive (PixelCNN).</li>
  </ul>
  <div class="merk"><b>Key point</b><p>All of them learn the data distribution without labels. VAE through an ordered latent space, PixelCNN through a pixel sequence, GAN through a contest, diffusion through removing noise step by step. The choice is a trade-off between quality, diversity and speed; Stable Diffusion combines VAE and diffusion.</p></div>

  <h3 id="gen-best">10 · Best practices</h3>
  <p>Generative models have no single correct output. The loss alone therefore says little about quality.</p>
  <div class="bp-check">
    <div><b>Prepare</b><ul>
      <li>First check whether a pretrained model is enough (Stable Diffusion, ESRGAN). Your own diffusion models from scratch need a lot of compute and data.</li>
      <li>Scale pixels to match the output: [0, 1] with sigmoid (autoencoder, VAE), [−1, 1] with tanh (GAN, diffusion).</li>
      <li>Start small: MNIST or 32 × 32, a small latent space, few layers. Scale up only when that works.</li>
    </ul></div>
    <div><b>Training</b><ul>
      <li>VAE: log reconstruction and KL separately. If the KL term goes to 0, the decoder does not use the latent space; adjust β.</li>
      <li>GAN: keep D and G in balance, use DCGAN recipes (Adam 2·10⁻⁴, β₁ = 0.5). If D always wins, G learns nothing any more.</li>
      <li>Diffusion: record the noise schedule and the number of steps; start sampling with 20 to 50 steps.</li>
      <li>Fix seeds and save checkpoints: GAN training can suddenly tip over.</li>
    </ul></div>
    <div><b>Check quality</b><ul>
      <li>Look at generated images regularly, always from the same fixed <code>z</code> vectors or seeds, so that progress is comparable.</li>
      <li>Check diversity: if all images look almost the same, it is mode collapse.</li>
      <li>Search the most similar training image for generated images: the model should create something new, not copy.</li>
      <li>Compare FID only with many images and equal settings; for text-to-image also check whether the image matches the prompt.</li>
    </ul></div>
    <div><b>Responsibility</b><ul>
      <li>Clarify licence and origin of the training images and of the pretrained model.</li>
      <li>Label generated images as such, especially faces (deepfakes).</li>
      <li>Never use invented details (ESRGAN, diffusion) as a measurement, e.g. in medicine or forensics.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Key point</b><p>Pretrained before self-trained, start small, look at images from fixed seeds instead of just the loss, check diversity and copies, compare FID only with equal settings and label generated images.</p></div>
`,
  quiz: [
    { q: `What distinguishes a discriminative from a generative model?`, a: `Discriminative: <code>x → y</code>, learns <code>p(y | x)</code>, there is one correct answer (e.g. a classifier). Generative: learns the data distribution <code>p(x)</code> or <code>p(x | y)</code>, produces new examples, and many outputs fit one input. It needs no labels.` },
    { q: `Which three parts does every deep generative model have?`, a: `A representation of the distribution by a network, a training with a loss that brings the network’s distribution close to the data, and a sampling procedure to draw new examples.` },
    { q: `Place VAE, GAN, PixelCNN and diffusion in the taxonomy.`, a: `Explicit density, exact: PixelCNN (autoregressive). Explicit density, approximate: VAE and diffusion. Implicit density (sampling only, no p(x)): GAN.` },
    { q: `Which two parts make up an autoencoder, and what is its training goal?`, a: `Encoder (image → small code z) and decoder (z → image). The goal is to reconstruct the input: <code>g(f(x)) ≈ x</code>; the loss is the distance between x and x̂.` },
    { q: `Why does a plain autoencoder not produce good images from a random z?`, a: `The codes of the training images form scattered islands; in between the latent space is empty and unordered. A random z usually lands in a gap.` },
    { q: `What does the encoder of a VAE output, and how is z produced?`, a: `One mean μ and one spread σ per dimension (usually as log σ²). Then <code>z = μ + σ · ε</code> with <code>ε ~ N(0, I)</code>.` },
    { q: `What is the reparameterization trick for?`, a: `No gradient flows through random sampling. With z = μ + σ · ε the randomness is in ε; μ and σ are differentiable, so backpropagation works all the way into the encoder.` },
    { q: `What do the two parts of the VAE loss do, and what does β do?`, a: `Reconstruction makes sure the image comes back. The KL term pulls every distribution towards N(0, I) and keeps the latent space ordered and gap-free. β weights the KL term: large = more ordered but blurrier; small = sharper but with gaps.` },
    { q: `How do you produce a new image with a trained VAE?`, a: `Draw z from N(0, I) and apply only the decoder. The encoder is not needed for this.` },
    { q: `Why are VAE images often blurry?`, a: `The decoder is trained with MSE (Gaussian assumption). If an edge is uncertain, the mean of all possibilities is the best answer, and that is washed out.` },
    { q: `What is the VAE for in Stable Diffusion?`, a: `It shrinks the image from 512 × 512 × 3 to a latent of 64 × 64 × 4. The diffusion runs in this small space (much cheaper), and the VAE decoder makes the image from it at the end.` },
    { q: `What is the mask in the PixelCNN for, and why is training fast but generating slow?`, a: `The mask lets the network see only pixels above and to the left, otherwise it would copy the target pixel. In training all pixels are known and predicted in parallel; when generating, every pixel depends on the one just rolled, so 784 steps one after another for 28 × 28.` },
    { q: `Write down the GAN objective and explain the D step and the G step.`, a: `<code>min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]</code>. D step (G fixed): D(x) → 1 for real, D(G(z)) → 0 for fake images. G step (D fixed): change G so that D(G(z)) → 1.` },
    { q: `Why is the generator trained with <code>log D(G(z))</code> instead of <code>log(1 − D(G(z)))</code> in practice?`, a: `At the start D recognises every fake (D(G(z)) ≈ 0). There <code>log(1 − D(G(z)))</code> is almost flat and G would get hardly any gradient. Maximising <code>log D(G(z))</code> has a strong gradient there (non-saturating loss).` },
    { q: `What is mode collapse, and how do you recognise it?`, a: `The generator produces only a few different images that fool the discriminator instead of the whole diversity of the data. Recognise it: look at many generated images side by side; they look almost the same.` },
    { q: `What does CycleGAN do differently from Pix2Pix?`, a: `Pix2Pix needs paired examples (image A and the matching image B). CycleGAN works without pairs: the cycle A → B → A should give the original again (cycle consistency), e.g. summer ↔ winter.` },
    { q: `What happens in the forward and in the reverse process of a diffusion model?`, a: `Forward: in T steps Gaussian noise is added according to a fixed noise schedule until only noise is left; no training. Reverse: a U-Net learns to estimate the noise in x_t and remove it step by step; this turns noise into an image.` },
    { q: `Why do you not have to noise all t steps one after the other during training?`, a: `Because Gaussian noise adds up, there is a closed formula: <code>x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε</code>. You draw a random t and jump there directly.` },
    { q: `Describe one training step of a DDPM.`, a: `Take an image x₀, draw a random t, draw noise ε, compute x_t with the formula, the U-Net estimates ε̂ = ε_θ(x_t, t), loss = MSE(ε, ε̂), backpropagation.` },
    { q: `Why does the U-Net in diffusion get the time step t as an input?`, a: `The same network has to serve all noise levels. At small t only fine grain has to be removed, at large t almost everything. With t the network knows how much noise to expect.` },
    { q: `Why is diffusion slow at generating, and what helps?`, a: `Every image needs many passes through the U-Net (1000 for DDPM). Faster schedulers (DDIM, DPM-Solver) manage with 20 to 50 steps; latent diffusion makes every step cheaper.` },
    { q: `What is classifier-free guidance, and what does the guidance scale do?`, a: `The network learns to estimate noise with and without the condition (the condition is sometimes dropped in training). When sampling: <code>ε̂ = ε_unconditional + w · (ε_conditional − ε_unconditional)</code>. Large w follows the prompt more closely but with less diversity and oversaturated colours; small w is freer.` },
    { q: `Which building blocks does Stable Diffusion have?`, a: `A text encoder (CLIP) for the prompt, a U-Net that denoises in latent space (64 × 64 × 4) in 20 to 50 steps and looks at the text via cross-attention, a scheduler and a VAE decoder that turns the latent into an image.` },
    { q: `Why is a loss curve not enough for validating generative models, and what do you use instead?`, a: `The loss says little about sharpness and diversity (in the GAN two losses swing against each other). You look at images from fixed seeds, measure FID, search nearest neighbours in the training set against copies and, for text-to-image, check whether the image matches the prompt.` },
    { q: `Which model would you choose for a 4× upscaling with sharp details, and what is the catch?`, a: `A GAN such as ESRGAN (or a diffusion model): sharper than bicubic. Catch: the details are invented and do not match reality, which is a risk for measurement images.` },
  ],
});
})();
