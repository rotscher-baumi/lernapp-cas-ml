/* English texts for the module "nn" (Neural Networks: introduction). Fields replace the German ones when the language is EN. */
LernApp.translate('nn', {
  nav: 'Neural Networks',
  title: `Neural Networks: Introduction`,
  kicker: `Module 3 · Neural Networks (Fri 13 and Sat 14.11.)`,
  summary: `Neuron, activation functions, backpropagation, optimizers, dropout, early stopping`,
  html: `  <p>A neural network is nothing new, but a stack of building blocks you already know: every neuron computes a weighted sum like <a href="#klass-modelle">logistic regression</a>, the weights are learned with <a href="#ml-gd">gradient descent</a>, and as before the validation set decides about success. What is new are the <b>many layers</b> and the question of how the gradient reaches the first layer (backpropagation).</p>
  <p class="note">This chapter covers the introduction (perceptron to regularisation). Images and CNNs follow on the computer vision day (Fri 20.11.). The demos run in the browser with a small, self-computed network; the Keras code blocks at the end do not.</p>

  <h3 id="nn-ablauf">The whole workflow at a glance</h3>
  <p>The workflow is the same as in <a href="#ml-ablauf">supervised learning</a>. What is new is the training loop in the middle: predict, measure the error, compute gradients backwards, adjust the weights, and do that many times.</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="nnFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Workflow of a neural network project: prepare data, choose architecture, set loss and optimizer, then the training loop of forward pass, loss, backpropagation and update, then check validation with a tuning loop and finally test once">
      ${LernApp.nnFlow({
        aria: 'Step %: open explanation',
        steps: [
          ['Prepare the data', 'train, validation, test; scale'],
          ['Choose the architecture', 'hidden layers, neurons, activation'],
          ['Loss and optimizer', 'cross-entropy or MSE, Adam, learning rate'],
          ['Forward pass', 'input through the network to the prediction ŷ'],
          ['Compute the loss', 'distance between ŷ and the correct answer y'],
          ['Backpropagation', 'gradients from back to front'],
          ['Update the parameters', 'w ← w − α · ∂L/∂w'],
          ['Check validation', 'loss curves, overfitting?'],
          ['Test once', 'test set, only at the very end'],
        ],
        loopA: ['per mini-batch,', 'many epochs'],
        loopB: ['Tuning:', 'other architecture,', 'other hyperparameters'],
      })}
    </svg>
    </div>
    <div class="ab-detail" id="nbDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Steps 4 to 7 (orange dashed, inside) run for every mini-batch, all batches together are one epoch. The outer loop is tuning: you compare setups on the validation set. The test set (orange) is not used for choosing.</figcaption>
  </figure>

  <h3 id="nn-konzept">The main concept: input, hidden layers, backpropagation</h3>
  <p>Every neural network consists of <b>three parts</b> and a learning loop. The figure shows a small network with 2 inputs, two hidden layers of 3 neurons each and 2 outputs (after the course slide «Error Analysis»).</p>
  <ul>
    <li><b>Input layer:</b> receives the raw values (pixels, prices, measurements) and passes them on. Nothing is learned here.</li>
    <li><b>Hidden layers:</b> each neuron computes a weighted sum and an activation function. Every layer builds new, more abstract features from those of the previous one (pixels → edges → shapes → digit).</li>
    <li><b>Output layer:</b> delivers the prediction <code>ŷ</code>. It is compared with the correct answer <code>y</code>, and the loss <code>L</code> measures the difference.</li>
    <li><b>Backpropagation:</b> the way back. From the loss it computes for <i>every</i> weight how it influenced the error; then every weight is corrected a little.</li>
  </ul>
  <p class="hint">Click a part of the figure: the explanation opens below it.</p>
  <figure class="fig ab-fig" id="nnConceptFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 760 345" role="img" aria-label="Structure of a neural network: input layer, two hidden layers, output layer with ŷ and y, loss, forward pass to the right and backpropagation to the left">
      ${LernApp.nnConcept({
        aria: 'Part «%»: open explanation',
        parts: { in: 'Input layer', h1: 'Hidden layer 1', h2: 'Hidden layer 2', out: 'Output layer', loss: 'Loss', fw: 'Forward pass', bp: 'Backpropagation' },
        fw: 'Forward pass: x → z1 → a1 → z2 → a2 → z3 → ŷ',
        bp: 'Backpropagation: ∂J/∂W₂ → ∂J/∂W₁ → ∂J/∂W₀',
      })}
    </svg>
    </div>
    <div class="ab-detail" id="nnConDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Blue: the path of the data forwards (forward pass). Orange dashed: the path of the error backwards (backpropagation). The formula at the bottom is the loss over all <code>n</code> examples, <code>W</code> are all weights of the network.</figcaption>
  </figure>
  <p>In formulas, layer by layer (<code>f</code> is the activation function, <code>g</code> the one of the output):</p>
  <pre><code>z1 = W₀·x  + b₀      a1 = f(z1)
z2 = W₁·a1 + b₁      a2 = f(z2)
z3 = W₂·a2 + b₂      ŷ  = g(z3)
J(W) = 1/n · Σ L(ŷᵢ, yᵢ)      # loss over all examples</code></pre>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">A worked example by hand</h4>
  <p>Network with 2 inputs, 2 hidden neurons (ReLU) and 1 output (sigmoid). Input <code>x = (1.0, 0.5)</code>, correct class <code>y = 1</code>, learning rate <code>α = 0.1</code>. Weights: hidden <code>W₀ = [[0.4, 0.2], [−0.3, 0.8]]</code>, <code>b₀ = (0, 0.1)</code>; output <code>W₁ = (0.6, −0.5)</code>, <code>b₁ = 0.1</code>.</p>
  <pre><code># 1 · Forward pass
z1 = (0.4·1.0 + 0.2·0.5 + 0,   −0.3·1.0 + 0.8·0.5 + 0.1) = (0.5, 0.2)
a1 = ReLU(z1) = (0.5, 0.2)
z2 = 0.6·0.5 − 0.5·0.2 + 0.1 = 0.3          ŷ = sigmoid(0.3) = 0.574

# 2 · Loss
L = −log(0.574) = 0.554

# 3 · Backpropagation (chain rule, from back to front)
δ_out = ŷ − y = −0.426                      # sigmoid + cross-entropy
∂L/∂W₁ = δ_out · a1 = (−0.213, −0.085)      ∂L/∂b₁ = −0.426
δ_hid  = δ_out · W₁ · ReLU'(z1) = (−0.255, 0.213)   # error passed backwards
∂L/∂W₀ = δ_hid · xᵀ = [[−0.255, −0.128], [0.213, 0.106]]

# 4 · Update  (w ← w − α · ∂L/∂w)
W₁ = (0.621, −0.491)   b₁ = 0.143
W₀ = [[0.426, 0.213], [−0.321, 0.789]]   b₀ = (0.026, 0.079)

# Forward again: ŷ = 0.602, loss = 0.507  (before: 0.554)</code></pre>
  <p>A single step has lowered the loss. Training repeats exactly this for thousands of mini-batches; the <a href="#nsDemo">demo in section 3</a> lets you click through each phase.</p>
  <div class="merk"><b>Key point</b><p>Forwards the network computes a prediction, the loss measures the error, backwards backpropagation distributes the error as a gradient to every weight, and the optimizer corrects the weights. This loop is all of learning.</p></div>

  <h3 id="nn-neuron">1 · From neuron to network</h3>
  <p>An artificial neuron does two things. It forms a weighted sum of its inputs plus a <b>bias</b>, <code>z = w1·x1 + w2·x2 + … + b</code>, and passes it through an <b>activation function</b>: <code>a = f(z)</code>. Linear regression is a neuron with <code>f(z) = z</code>, logistic regression a neuron with sigmoid.</p>
  <div class="tablewrap"><table>
    <tr><th>activation</th><th>Formula</th><th>Range</th><th>Note</th></tr>
    <tr><td><b>Sigmoid</b></td><td><code>1 / (1 + e^(−z))</code></td><td>0 to 1</td><td>Saturates for large |z| (slope almost 0). Today mostly used in the output for 2 classes.</td></tr>
    <tr><td><b>Tanh</b></td><td><code>tanh(z)</code></td><td>−1 to 1</td><td>Centred on 0, but saturates as well.</td></tr>
    <tr><td><b>ReLU</b></td><td><code>max(0, z)</code></td><td>0 to ∞</td><td>Default in hidden layers: fast, does not saturate for z &gt; 0. For z &lt; 0 the slope is 0, the neuron can «die».</td></tr>
    <tr><td><b>Leaky ReLU</b></td><td><code>z</code>, otherwise <code>0.01·z</code></td><td>−∞ to ∞</td><td>Small slope for z &lt; 0, so the neuron does not die completely.</td></tr>
    <tr><td><b>Linear</b></td><td><code>z</code></td><td>−∞ to ∞</td><td>Output for regression.</td></tr>
    <tr><td><b>Softmax</b></td><td><code>e^(zi) / Σ e^(zj)</code></td><td>0 to 1, sum 1</td><td>Output for several classes: one probability per class.</td></tr>
  </table></div>
  <div class="demo" id="nnActDemo">
    <div class="tag">Demo</div><h4>A neuron and its activation function</h4>
    <p class="hint">Choose an activation function and move input, weight and bias. The orange dot is the neuron: it sits on the curve at <code>z = w·x + b</code>. Dashed is the slope, that is the signal that flows back during training.</p>
    <div class="btnrow" id="nnActBtns" role="group" aria-label="activation function"><button data-a="sigmoid" class="pri" aria-pressed="true">Sigmoid</button><button data-a="tanh" aria-pressed="false">Tanh</button><button data-a="relu" aria-pressed="false">ReLU</button><button data-a="leaky" aria-pressed="false">Leaky ReLU</button><button data-a="linear" aria-pressed="false">Linear</button></div>
    <svg class="plot" id="nnActSvg" viewBox="0 0 320 190" role="img" aria-label="Curve of the chosen activation function with the neuron as a dot"></svg>
    <div class="ctl"><label for="nnActX">Input x</label><input type="range" id="nnActX" min="-3" max="3" step="0.1" value="1"><output id="nnActXO"></output></div>
    <div class="ctl"><label for="nnActW">Weight w</label><input type="range" id="nnActW" min="-3" max="3" step="0.1" value="1.5"><output id="nnActWO"></output></div>
    <div class="ctl"><label for="nnActB">bias b</label><input type="range" id="nnActB" min="-3" max="3" step="0.1" value="0"><output id="nnActBO"></output></div>
    <div class="stats"><span>z = w·x + b <b id="nnActZ"></b></span><span>a = f(z) <b id="nnActA"></b></span><span>Slope f′(z) <b id="nnActD"></b></span></div>
    <p class="hint" id="nnActMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Without non-linear activation functions, a network with any number of layers would be a single linear function, because <code>W2·(W1·x) = (W2·W1)·x</code>. Only non-linearity allows curved boundaries.</p></div>

  <h3 id="nn-arch">2 · Architecture: layers and parameters</h3>
  <p>Neurons side by side form a <b>layer</b>, layers one after another form a network. The input layer only passes the values on, in between are the <b>hidden layers</b>, at the end the output layer. If every neuron of a layer is connected to every neuron of the next, the network is called <i>fully connected</i> or a <i>multilayer perceptron</i> (MLP); in Keras this is <code>Dense</code>.</p>
  <p>Every connection has a weight, every neuron a bias. A <code>Dense</code> layer with <code>n_in</code> inputs and <code>n_out</code> neurons therefore has <code>(n_in + 1) · n_out</code> parameters. The output layer depends on the task:</p>
  <div class="tablewrap"><table>
    <tr><th>Task</th><th>Neurons in the output</th><th>activation</th><th>Loss</th></tr>
    <tr><td>2 classes (fraud yes/no)</td><td>1</td><td>Sigmoid</td><td>Binary cross-entropy</td></tr>
    <tr><td>k classes (digits 0 to 9)</td><td>k</td><td>Softmax</td><td>Cross-entropy</td></tr>
    <tr><td>Number (price)</td><td>1</td><td>Linear</td><td>MSE or MAE</td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Why several neurons and layers?</h4>
  <p>A single neuron with ReLU is a «bend»: flat, then a straight line. A hidden layer with <code>N</code> neurons adds <code>N</code> such bends, each with its own position (bias), slope (weight) and weighting in the output. This lets you approximate any smooth curve as closely as you like (<i>universal approximation theorem</i>). More layers often get there with fewer neurons, because later layers reuse the patterns of earlier ones.</p>
  <div class="demo" id="nuDemo">
    <div class="tag">Demo</div><h4>A curve from ReLU bends</h4>
    <p class="hint">Choose a target curve and increase the number of neurons. The thin orange lines are the contributions of the single neurons, the blue line is their sum, the output of the network. Dashed is the target curve. The output weights are computed exactly here (least squares), not trained: you see what the layer <i>can</i> represent.</p>
    <div class="btnrow" id="nuBtns" role="group" aria-label="target curve"><button data-t="sine" class="pri" aria-pressed="true">Sine</button><button data-t="bump" aria-pressed="false">Bump</button><button data-t="step" aria-pressed="false">Step</button></div>
    <svg class="plot" id="nuSvg" viewBox="0 0 320 190" role="img" aria-label="Target curve and output of a network with one hidden layer of ReLU neurons"></svg>
    <div class="ctl"><label for="nuN">Neurons in the hidden layer</label><input type="range" id="nuN" min="1" max="12" step="1" value="3"><output id="nuNO"></output></div>
    <div class="stats"><span>Neurons <b id="nuK"></b></span><span>Parameters <b id="nuPar"></b></span><span>Error (RMSE) <b id="nuErr"></b></span></div>
    <p class="hint" id="nuMsg"></p>
  </div>
  <div class="demo" id="npDemo">
    <div class="tag">Demo</div><h4>Counting parameters</h4>
    <p class="hint">Build a network. The start values (784 inputs, one hidden layer with 128 neurons, 10 outputs) are a network for 28×28 images of digits as in the Keras examples. The table corresponds to <code>model.summary()</code>.</p>
    <div class="ctl"><label for="npIn">Inputs</label><input type="range" id="npIn" min="1" max="784" step="1" value="784"><output id="npInO"></output></div>
    <div class="ctl"><label for="npL">hidden layers</label><input type="range" id="npL" min="1" max="4" step="1" value="1"><output id="npLO"></output></div>
    <div class="ctl"><label for="npH">Neurons per layer</label><input type="range" id="npH" min="1" max="256" step="1" value="128"><output id="npHO"></output></div>
    <div class="ctl"><label for="npOut">Outputs</label><input type="range" id="npOut" min="1" max="10" step="1" value="10"><output id="npOutO"></output></div>
    <div class="tablewrap"><table id="npTab" style="min-width:0"></table></div>
    <div class="stats"><span>Parameters in total <b id="npTot"></b></span><span><b id="npSplit"></b></span></div>
  </div>
  <div class="falle"><b>Pitfall</b><p>More parameters than training examples means the network can memorise the training data (overfitting). Even the small example above has over 100,000 parameters. How many neurons you need is decided by the validation set, not by intuition.</p></div>

  <h3 id="nn-training">3 · Training: loss, backpropagation, gradient descent</h3>
  <p>Training is the same loop as in linear regression, just with many more parameters:</p>
  <ol>
    <li><b>Forward pass:</b> the input goes through the network layer by layer, <code>z = W·a + b</code>, <code>a = f(z)</code>, and at the end comes the prediction <code>ŷ</code>.</li>
    <li><b>Loss:</b> a number that measures how far <code>ŷ</code> is from the correct answer <code>y</code>. Cross-entropy for classification, MSE or MAE for regression.</li>
    <li><b>Backpropagation:</b> with the chain rule the gradient of the loss with respect to every weight is computed, from the output backwards. The intermediate results of every layer are reused, which is why it is fast.</li>
    <li><b>Update:</b> <code>w ← w − α · ∂L/∂w</code> with the <b>learning rate</b> α, a small step against the gradient.</li>
  </ol>
  <div class="demo" id="nsDemo">
    <div class="tag">Demo</div><h4>One training step in a tiny network</h4>
    <p class="hint">Network with 2 inputs, 2 hidden neurons (sigmoid) and 1 output. Example: <code>x = (1.0, 0.5)</code>, correct class <code>y = 1</code>. Click through the four phases. «Update» really changes the weights; afterwards «1 · Forward» shows the new values.</p>
    <div class="btnrow"><button id="nsB1" class="pri">1 · Forward</button><button id="nsB2">2 · Loss</button><button id="nsB3">3 · Backward</button><button id="nsB4">4 · Update</button></div>
    <pre><code id="nsOut"></code></pre>
    <div class="ctl"><label for="nsLr">learning rate α</label><input type="range" id="nsLr" min="0.1" max="2" step="0.1" value="0.5"><output id="nsLrO"></output></div>
    <div class="btnrow"><button id="nsTen">Train 10 rounds</button><button id="nsReset">Reset</button></div>
    <svg class="plot" id="nsSvg" viewBox="0 0 320 110" role="img" aria-label="Loss per round, falls with every update"></svg>
    <div class="stats"><span>Round <b id="nsN"></b></span><span>Prediction ŷ <b id="nsPred"></b></span><span>Loss <b id="nsLoss"></b></span></div>
    <p class="hint">The gradients are computed by hand with the chain rule and agree with numerically computed gradients. With a sigmoid output and cross-entropy the error at the output is simply <code>δ = ŷ − y</code>.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Backpropagation in detail</h4>
  <p>The loss depends on every weight through many intermediate steps: <code>L(ŷ(z3(a2(z2(a1(z1(W₀)))))))</code>. The <b>chain rule</b> splits the derivative into a product of local derivatives. To avoid computing anything twice, you walk from back to front and pass an error term <code>δ</code> on:</p>
  <pre><code>δ_out = ŷ − y                          # at the output (sigmoid/softmax + cross-entropy)
δ_l   = (W_(l+1)ᵀ · δ_(l+1)) ⊙ f'(z_l)   # one layer back: transposed weights, times slope
∂L/∂W_l = δ_l · a_(l−1)ᵀ                # gradient of the weights of this layer
∂L/∂b_l = δ_l</code></pre>
  <p>Each layer needs its values from the forward pass (<code>z</code> and <code>a</code>) for this, which is why they are stored during training. The cost is about the same as one forward pass.</p>
  <p><b>Vanishing gradients:</b> On the way back, every layer multiplies by <code>f'(z)</code>. Sigmoid has a slope of at most 0.25; after 10 layers less than <code>0.25¹⁰ ≈ 10⁻⁶</code> of δ is left, and the first layers hardly learn. Remedies: ReLU (slope 1 for z &gt; 0), suitable initial weights (Xavier, He) and scaled inputs.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Loss by task</h4>
  <p>In <b>classification</b> the output layer gives probabilities (sigmoid or softmax) and the loss is <b>cross-entropy</b>: <code>L = −[ y·log(ŷ) + (1−y)·log(1−ŷ) ]</code> (mean over all examples). In <b>regression</b> the output is linear (or sigmoid if the range is bounded) and the loss is MSE or MAE. Why cross-entropy suits classification better than MSE is shown by the demo in the chapter <a href="#klass">Classification</a>.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Initial weights</h4>
  <p>The weights start with <b>small random values</b> from a normal distribution around 0, the bias often at 0. Setting them all equal would be wrong: all neurons of a layer would get the same gradients and stay the same. The spread matters so that the signals neither vanish nor explode from layer to layer (vanishing and exploding gradients). Common rules of thumb: <b>Xavier</b> with variance <code>1/n_in</code> (for sigmoid and tanh) and <b>Kaiming (He)</b> with <code>2/n_in</code> (for ReLU). Keras chooses this for you (<code>glorot_uniform</code> by default).</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Why the result differs from run to run</h4>
  <p>The loss surface of a network is strongly curved, with many valleys, plateaus and saddle points. Gradient descent does not guarantee a global minimum, and because the initial weights are random, every run ends up somewhere else. In practice this still works well. Set a <b>seed</b> for comparable runs and repeat important comparisons with several seeds.</p>
  <div class="merk"><b>Key point</b><p>Forward pass, loss, backpropagation, update. The network learns by breaking down the error at the output backwards into one gradient per weight. Scale the inputs (for example <code>StandardScaler</code>, learned on the training data only): otherwise a weight stands for a huge range of numbers and gradient descent makes slow progress.</p></div>

  <h3 id="nn-opt">4 · Optimizers: faster and steadier to the minimum</h3>
  <p>Plain gradient descent computes the gradient over <i>all</i> data before it takes one step. That is slow. With <b>mini-batches</b> the data are shuffled and split into packets of size <code>batch size</code> (for example 32); after every packet there is an update. One pass through all packets is an <b>epoch</b>. The gradient of one packet is a bit noisy, but much cheaper.</p>
  <div class="tablewrap"><table>
    <tr><th>Optimizer</th><th>Idea</th><th>Note</th></tr>
    <tr><td><b>SGD</b></td><td><code>w ← w − α·g</code></td><td>Simple, but the learning rate has to suit the steepest direction: if it is too large, it jumps away.</td></tr>
    <tr><td><b>Momentum</b></td><td>Moving average of the last gradients (factor 0.9)</td><td>Damps the zigzag across the valley and speeds up in directions with a steady gradient.</td></tr>
    <tr><td><b>RMSProp</b></td><td>Step divided by the moving average of <code>g²</code> (decay 0.9)</td><td>Every parameter gets its own step size: large gradients are slowed down, small ones amplified.</td></tr>
    <tr><td><b>Adam</b></td><td>Momentum and RMSProp together</td><td>Usually the default. Defaults from the paper: factors 0.9 and 0.999, learning rate 0.001.</td></tr>
  </table></div>
  <div class="demo" id="noDemo">
    <div class="tag">Demo</div><h4>Optimizers in a narrow valley</h4>
    <p class="hint">All four start at the ring top left and minimise <code>20·x² + 0.5·y²</code>: very steep in x, flat in y, like a narrow valley. Change the learning rate and the number of steps. Paths that jump out of the picture are cut off at the edge.</p>
    <svg class="plot" id="noSvg" viewBox="0 0 320 240" role="img" aria-label="Paths of SGD, momentum, RMSProp and Adam in a narrow valley"></svg>
    <div class="ctl"><label for="noLr">learning rate</label><input type="range" id="noLr" min="0.01" max="0.15" step="0.01" value="0.05"><output id="noLrO"></output></div>
    <div class="ctl"><label for="noSteps">Steps</label><input type="range" id="noSteps" min="5" max="60" step="1" value="40"><output id="noStepsO"></output></div>
    <div class="tablewrap"><table id="noTab" style="min-width:0"></table></div>
    <p class="hint" id="noMsg"></p>
    <p class="hint">With a small learning rate RMSProp and Adam are too slow, because their step stays about as large as the learning rate, however steep it is. With a large one SGD jumps away. No optimizer always wins, but Adam is robust and therefore the default.</p>
  </div>
  <p class="note">The slides write momentum as <code>v = β·v + (1−β)·g</code>, Keras and PyTorch compute <code>v = β·v + g</code> without the factor (1−β). That is the same with a different learning rate, and the demo uses the Keras variant.</p>

  <h3 id="nn-valid">5 · Validation and tuning</h3>
  <p>The split from <a href="#ml-split">supervised learning</a> applies here too: <b>train</b> to learn the weights, <b>validation</b> to compare setups (architecture, hyperparameters) and <b>test</b> once at the very end. Because a network trains for a long time, you look at the loss on train and validation <b>after every epoch</b>:</p>
  <div class="tablewrap"><table>
    <tr><th>Both curves …</th><th>Meaning</th><th>What to do</th></tr>
    <tr><td>high, close together</td><td>underfitting: the network learns too little</td><td>Larger network, train longer, check the learning rate</td></tr>
    <tr><td>Train low, validation far above or rising again</td><td>overfitting: the network memorises the training data</td><td>Early stopping, dropout, smaller network, more data, data augmentation</td></tr>
    <tr><td>low, close together</td><td>good fit</td><td>Confirm once on the test set</td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Regularisation for networks</h4>
  <ul>
    <li><b>Dropout:</b> during training, some activations are set to 0 at random in every step (for example 30 %). The network cannot rely on single neurons. At prediction time all neurons are active; Keras rescales during training so the magnitude stays the same.</li>
    <li><b>Early stopping:</b> you stop when the validation loss no longer falls and keep the model of the best epoch (<code>restore_best_weights=True</code>).</li>
    <li><b>Data augmentation:</b> the existing examples yield shifted, rotated or flipped variants (mostly for images). That is artificially more training data.</li>
    <li><b>L2 (weight decay):</b> penalises large weights, like ridge in <a href="#ml-reg">regularisation</a>.</li>
  </ul>
  <div class="demo" id="nfDemo">
    <div class="tag">Demo</div><h4>Training a network: size, dropout, learning rate</h4>
    <p class="hint">Two interleaved half-moons with noise: 40 training points (circles) and 200 validation points (small squares). The network has one ReLU hidden layer and learns with Adam, mini-batch 10, scaled inputs (from the training data). The black line in the curve is the chosen epoch. Change one slider at a time.</p>
    <svg class="plot" id="nfSvg" viewBox="0 0 320 240" role="img" aria-label="Decision boundary of the network with training and validation points"></svg>
    <svg class="plot" id="nfCurve" viewBox="0 0 320 150" role="img" aria-label="Loss on training and validation per epoch" style="margin-top:10px"></svg>
    <div class="ctl"><label for="nfEp">epoch</label><input type="range" id="nfEp" min="0" max="300" step="1" value="300"><output id="nfEpO"></output></div>
    <div class="ctl"><label for="nfH">Neurons in the hidden layer</label><input type="range" id="nfH" min="1" max="32" step="1" value="32"><output id="nfHO"></output></div>
    <div class="ctl"><label for="nfDrop">Dropout rate</label><input type="range" id="nfDrop" min="0" max="0.7" step="0.1" value="0"><output id="nfDropO"></output></div>
    <div class="ctl"><label for="nfLr">learning rate</label><input type="range" id="nfLr" min="0" max="4" step="1" value="3"><output id="nfLrO"></output></div>
    <div class="stats"><span>Loss training <b id="nfTr"></b></span><span>Loss validation <b id="nfVa"></b></span><span>Accuracy validation <b id="nfAcc"></b></span><span>best minimum at epoch <b id="nfBest"></b></span></div>
    <p class="hint" id="nfMsg"></p>
    <p class="hint">Try: 32 neurons without dropout (overfitting, the boundary jags around single points), then dropout 0.5, then only 4 neurons. With learning rate 0.1 everything happens faster, with 0.001 nothing has been learned after 300 epochs. The numbers come from a real run in the browser with a fixed seed; another seed would give slightly different curves.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Hyperparameters</h4>
  <div class="tablewrap"><table>
    <tr><th>Hyperparameter</th><th>Effect</th><th>Note</th></tr>
    <tr><td><b>learning rate</b></td><td>Step size of the update</td><td>The most important dial. Too large: the loss jumps or explodes. Too small: training crawls. With Adam often 0.001.</td></tr>
    <tr><td><b>batch size</b></td><td>Examples per update</td><td>Small: noisy, cheap. Large: smoother, but more expensive. Typically 16 to 256.</td></tr>
    <tr><td><b>epochs</b></td><td>How often all data are passed through</td><td>With early stopping, set it high and let training end by itself.</td></tr>
    <tr><td><b>Layers and neurons</b></td><td>Capacity of the network</td><td>More capacity learns more complex patterns, but overfits more easily.</td></tr>
    <tr><td><b>Dropout rate</b></td><td>Strength of regularisation</td><td>Typically 0.2 to 0.5.</td></tr>
    <tr><td><b>Optimizer, activation</b></td><td>How it learns, which non-linearity</td><td>Adam and ReLU are sensible starting values.</td></tr>
  </table></div>
  <p>Proceed as before: change one setup, compare on validation, keep the best. Because the initial weights are random, even the same setup fluctuates a little, so only compare clear differences or several seeds.</p>
  <div class="falle"><b>Pitfall (test set)</b><p>If you look at the test set after every change and decide based on it, it is no longer a test set but a second validation set (see <a href="#klass-leakage">data leakage</a>). Early stopping, too, may only decide on the validation set.</p></div>

  <h3 id="nn-keras">6 · Keras in practice</h3>
  <p>In the course you build networks with <b>Keras</b>. The blocks below are <b>not executed</b>, because TensorFlow is not part of the learning app; they show how the terms of this chapter look in code.</p>
  <pre><code>from tensorflow import keras

model = keras.Sequential([
    keras.layers.Input(shape=(784,)),
    keras.layers.Dense(128, activation="relu"),     # hidden layer
    keras.layers.Dropout(0.3),                      # dropout
    keras.layers.Dense(10, activation="softmax"),   # output: 10 classes
])
model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001),
              loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.summary()      # 784*128+128 + 128*10+10 = 101,770 parameters

stop = keras.callbacks.EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True)
history = model.fit(x_train, y_train, validation_split=0.2,
                    epochs=50, batch_size=32, callbacks=[stop])
model.evaluate(x_test, y_test)    # the test set: exactly once</code></pre>
  <div class="tablewrap"><table>
    <tr><th>Keras</th><th>Term from the chapter</th></tr>
    <tr><td><code>Dense(128, activation="relu")</code></td><td>hidden layer with 128 neurons and ReLU, <code>(784+1)·128</code> parameters</td></tr>
    <tr><td><code>Dropout(0.3)</code></td><td>dropout rate 0.3 during training</td></tr>
    <tr><td><code>compile(optimizer, loss)</code></td><td>set optimizer and loss (step 3)</td></tr>
    <tr><td><code>fit(..., validation_split, epochs, batch_size)</code></td><td>training loop (steps 4 to 7) with validation per epoch</td></tr>
    <tr><td><code>EarlyStopping(monitor="val_loss", ...)</code></td><td>early stopping on the validation loss</td></tr>
    <tr><td><code>evaluate(x_test, y_test)</code></td><td>test (step 9)</td></tr>
  </table></div>
  <p>The <b>functional API</b> builds the same network as a graph and allows branches. In a <b>custom training loop</b> you write the four phases of the demo yourself:</p>
  <pre><code># Functional API
inputs = keras.Input(shape=(784,))
x = keras.layers.Dense(128, activation="relu")(inputs)
outputs = keras.layers.Dense(10, activation="softmax")(x)
model = keras.Model(inputs, outputs)

# Custom training loop (TensorFlow)
for x_batch, y_batch in dataset:
    with tf.GradientTape() as tape:
        y_pred = model(x_batch, training=True)                 # forward pass
        loss = loss_fn(y_batch, y_pred)                        # loss
    grads = tape.gradient(loss, model.trainable_weights)       # backpropagation
    optimizer.apply_gradients(zip(grads, model.trainable_weights))   # update</code></pre>
  <h3 id="nn-methoden">7 · Overview: steps and methods</h3>
  <p>All steps of the workflow with the methods you choose there and the matching Keras call. The numbers match the figure «The whole workflow at a glance».</p>
  <div class="tablewrap"><table>
    <tr><th>Step</th><th>Methods to choose from</th><th>When to use which</th><th>Keras</th></tr>
    <tr><td><b>1 · Data</b></td><td>Split train/validation/test, <code>StandardScaler</code> or MinMax, one-hot for categories</td><td>Learn the scaler on train only. Images are often divided by 255.</td><td><code>validation_split</code>, <code>to_categorical</code></td></tr>
    <tr><td><b>2 · Architecture</b></td><td>Dense (MLP), number of layers and neurons, activation: ReLU, leaky ReLU, tanh, sigmoid, softmax, linear</td><td>Hidden: ReLU. Output: sigmoid (2 classes), softmax (k classes), linear (a number). Start small, then grow.</td><td><code>Sequential</code>, <code>Dense</code>, <code>Input</code></td></tr>
    <tr><td><b>3 · Loss, optimizer</b></td><td>Loss: binary and categorical cross-entropy, MSE, MAE. Optimizer: SGD, momentum, RMSProp, Adam</td><td>Classification: cross-entropy. Regression: MSE (MAE is more robust to outliers). Adam with 0.001 as a start.</td><td><code>compile(optimizer, loss, metrics)</code></td></tr>
    <tr><td><b>4 · Forward pass</b></td><td>Mini-batch through the network: <code>z = W·a + b</code>, <code>a = f(z)</code></td><td>batch size 16 to 256, shuffle the data every epoch.</td><td><code>model(x)</code>, <code>predict</code></td></tr>
    <tr><td><b>5 · Compute the loss</b></td><td>Mean of the loss over the mini-batch</td><td>—</td><td><code>loss_fn(y, ŷ)</code></td></tr>
    <tr><td><b>6 · Backpropagation</b></td><td>Chain rule, gradient per weight</td><td>Runs automatically (automatic differentiation).</td><td><code>fit</code>, <code>GradientTape</code></td></tr>
    <tr><td><b>7 · Update</b></td><td><code>w ← w − α·g</code>, refined with momentum or Adam</td><td>Tune the learning rate first. Too large: loss jumps. Too small: crawls.</td><td><code>optimizer.apply_gradients</code></td></tr>
    <tr><td><b>8 · Validation</b></td><td>Loss curves train and validation, dropout, L2, early stopping, data augmentation, another setup</td><td>Curves far apart: overfitting. Both high: underfitting.</td><td><code>history</code>, <code>Dropout</code>, <code>EarlyStopping</code></td></tr>
    <tr><td><b>9 · Test</b></td><td>One-time evaluation with accuracy, loss, confusion matrix</td><td>Only when the setup is fixed.</td><td><code>evaluate</code></td></tr>
  </table></div>
  <p class="note">Steps 4 to 7 run per mini-batch, all batches together are one epoch (<code>fit(epochs=…)</code>). Step 8 after every epoch.</p>
  <div class="merk"><b>Key point</b><p>A neural network is a stack of neurons (weighted sum plus activation function) whose weights are learned with backpropagation and an optimizer such as Adam. It is chosen like any model: on the validation set, with early stopping and dropout against overfitting, and the test set once at the end.</p></div>
`,
  quiz: [
    { q: `Which three parts does a neural network have, and what does each do?`, a: `Input layer: receives the raw values, learns nothing. Hidden layers: weighted sum plus activation function, build features step by step. Output layer: delivers the prediction <code>ŷ</code>, which is compared with <code>y</code> in the loss.` },
    { q: `What does backpropagation compute, and how?`, a: `For every weight the gradient of the loss, with the chain rule from the output backwards. The error term <code>δ</code> is passed back layer by layer (<code>δ_l = (W_(l+1)ᵀ·δ_(l+1)) ⊙ f'(z_l)</code>) and combined with the stored values of the forward pass into the gradient.` },
    { q: `What are vanishing gradients, and what helps?`, a: `On the way back you multiply by <code>f'(z)</code>. With sigmoid (at most 0.25) the gradient shrinks over many layers, the first layers hardly learn. ReLU, Xavier/He initial weights and scaled inputs help.` },
    { q: `Why can one hidden layer represent a curved function?`, a: `Every ReLU neuron is a bend. The sum of many bends with different positions and slopes approximates any smooth curve. More neurons means more exact, but also more parameters and more overfitting risk.` },
    { q: `What happens if all activation functions in the hidden layers are linear?`, a: `The whole network stays a single linear function, however many layers it has (<code>W2·(W1·x) = (W2·W1)·x</code>). Only non-linear activation functions such as ReLU allow curved boundaries.` },
    { q: `How many parameters does a Dense layer with 784 inputs and 128 neurons have?`, a: `<code>(784 + 1) · 128 = 100,480</code>: 784·128 weights plus 128 biases.` },
    { q: `Which activation and which loss do you use in the output for 2 classes, for 10 classes and for a price?`, a: `2 classes: 1 neuron with sigmoid and binary cross-entropy. 10 classes: 10 neurons with softmax and cross-entropy. Price: 1 neuron, linear, MSE or MAE.` },
    { q: `Why do the weights start with random values and not all at 0?`, a: `With equal start values all neurons of a layer would get the same gradients and stay the same. Randomness breaks this symmetry. The spread (Xavier, He) also keeps the signals stable so gradients do not vanish or explode.` },
    { q: `What are mini-batch, batch size and epoch?`, a: `A mini-batch is a subset of the training data after which there is one update. The batch size is its size. An epoch is a pass in which the network has seen all training data once.` },
    { q: `Why momentum or Adam instead of plain SGD?`, a: `Momentum averages the last gradients and damps the zigzag. RMSProp gives every parameter its own step size. Adam combines both and is therefore robust when the loss surface has steep and flat directions.` },
    { q: `The training loss falls, the validation loss has been rising again for a few epochs. What does it mean, what do you do?`, a: `Overfitting. Early stopping (keep the best model at the minimum of the validation loss), dropout, a smaller network, more data or data augmentation.` },
    { q: `How does dropout work, and does it apply at prediction time too?`, a: `During training, activations are set to 0 at random (for example 30 %). The network cannot rely on single neurons. At prediction time all neurons are active.` },
    { q: `Why do you scale the inputs of a network, and what do you learn the scaler on?`, a: `Very different number ranges make gradient descent slow and the initial weights unsuitable. The scaler is learned on the training data only (otherwise data leakage) and then applied to validation and test.` },
    { q: `Why must you not choose hyperparameters on the test set?`, a: `The test set would indirectly learn along. The estimate would be too optimistic. Choose on the validation set, test once at the very end.` },
  ],
});
