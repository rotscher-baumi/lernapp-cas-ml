/* English texts for the module "cnn" (Convolutional Neural Networks). Fields replace the German ones when the language is EN. */
LernApp.translate('cnn', {
  nav: 'CNN',
  title: `Convolutional Neural Networks`,
  kicker: `Module 3 · Deep Learning, part 2`,
  summary: `Convolution, filter, feature map, padding, stride, pooling, data augmentation, transfer learning`,
  html: `  <p>A convolutional neural network (CNN) is a <a href="#nn">neural network</a> with a different building block for images: instead of every neuron seeing all pixels, a small <b>filter</b> slides over the image and looks for the same pattern everywhere. Training, loss, backpropagation and optimizer stay exactly the same.</p>
  <p class="note">The demos compute in the browser with small sample images. The Keras code blocks do not run here, but in Jupyter or Colab (the course notebooks on CIFAR-10 and SVHN).</p>

  <h3 id="cnn-ablauf">The whole workflow at a glance</h3>
  <p>The workflow is the same as for the <a href="#nn-ablauf">neural network</a>. What is new is the data (images as arrays) and the architecture (conv and pooling blocks before the dense part). Validation adds data augmentation and transfer learning.</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="cnnFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Workflow of a CNN project: prepare images, choose an architecture of conv and pooling blocks, set loss and optimizer, then the training loop of forward pass, loss, backpropagation and update, then check validation with a tuning loop and finally test once">
      ${LernApp.nnFlow({
        id: 'cb',
        aria: 'Step %: open explanation',
        steps: [
          ['Prepare the images', '(height, width, channels), /255, one-hot'],
          ['Choose the architecture', 'Conv2D + pooling, then dense'],
          ['Loss and optimizer', 'cross-entropy, Adam, learning rate'],
          ['Forward pass', 'filters → feature maps → softmax'],
          ['Compute the loss', 'distance between ŷ and y'],
          ['Backpropagation', 'gradients for the filters too'],
          ['Update the parameters', 'w ← w − α · ∂L/∂w'],
          ['Check validation', 'overfitting? augmentation, dropout'],
          ['Test once', 'test set, only at the very end'],
        ],
        loopA: ['per mini-batch,', 'many epochs'],
        loopB: ['Tuning:', 'filters, blocks,', 'augmentation'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Steps 4 to 7 (orange dashed, inner) run for every mini-batch. The outer loop is tuning on the validation set. The test set (orange) is not used for choosing.</figcaption>
  </figure>

  <h3 id="cnn-warum">1 · Why not just a dense network?</h3>
  <p>A colour image from CIFAR-10 has 32 × 32 pixels with 3 channels each (red, green, blue), so 3,072 numbers. A dense network turns this into one long vector with <code>Flatten</code>. That has three drawbacks:</p>
  <ul>
    <li><b>Too many parameters:</b> a single hidden layer with 512 neurons already has <code>(3072 + 1) · 512 ≈ 1.6 million</code> weights. For 224 × 224 photos it would be over 77 million for one layer. The network overfits quickly.</li>
    <li><b>The neighbourhood is lost:</b> after <code>Flatten</code> the network no longer knows which pixels are next to each other. But edges and shapes consist of neighbouring pixels.</li>
    <li><b>No recognition at another position:</b> a neuron that learned a cat at the top left does not help for a cat at the bottom right. Every position has to be learned again.</li>
  </ul>
  <p>A CNN solves all three problems with two ideas: <b>local connections</b> (a neuron sees only a small patch, for example 3 × 3 pixels) and <b>shared weights</b> (the same filter is used at every position).</p>

  <h3 id="cnn-conv">2 · Convolution: a filter slides over the image</h3>
  <p>A <b>filter</b> (also <b>kernel</b>) is a small weight matrix, typically 3 × 3. It is placed on every position of the image; there the pixels are multiplied by the filter weights and summed, plus bias. The result at each position is one value of the <b>feature map</b>. A high value means: here the image looks like the pattern in the filter.</p>
  <pre><code>z[r, c] = Σᵢ Σⱼ image[r+i, c+j] · K[i, j] + b     # i, j = 0..2 for 3 × 3
a[r, c] = ReLU(z[r, c])</code></pre>
  <p>This is the same as a neuron (weighted sum plus activation function), except that it sees only 9 pixels and uses the same 9 weights at every position. A 3 × 3 filter therefore has only <b>10 parameters</b>, however large the image is. During training the network learns the filter weights itself; the hand-made filters in the demo only show what such filters typically find.</p>
  <div class="demo" id="ccDemo">
    <div class="tag">Demo</div><h4>A filter on an 8 × 8 image</h4>
    <p class="hint">Choose image and filter. The orange frame on the left is the current window, its value in the feature map is next to it. Click a cell of the feature map or move the window with the arrows. Far right: the feature map after ReLU and 2 × 2 pooling.</p>
    <div class="btnrow" id="ccImg" role="group" aria-label="Image"><button data-v="seven" class="pri" aria-pressed="true">Digit 7</button><button data-v="square" aria-pressed="false">Square</button><button data-v="cross" aria-pressed="false">Cross</button></div>
    <div class="btnrow" id="ccKer" role="group" aria-label="filter"><button data-v="vert" class="pri" aria-pressed="true">Vertical edge</button><button data-v="horiz" aria-pressed="false">Horizontal edge</button><button data-v="diag" aria-pressed="false">Diagonal</button><button data-v="blur" aria-pressed="false">Blur</button></div>
    <svg class="plot" id="ccSvg" viewBox="0 0 490 190" style="max-width:560px" role="img" aria-label="8 × 8 image with window, 3 × 3 filter, 6 × 6 feature map and 3 × 3 result after pooling"></svg>
    <div class="btnrow"><button id="ccPrev" aria-label="Previous window">◀ Window</button><button id="ccNext" aria-label="Next window">Window ▶</button></div>
    <div class="btnrow" id="ccMode" role="group" aria-label="Pooling"><button data-v="max" class="pri" aria-pressed="true">Max pooling</button><button data-v="avg" aria-pressed="false">Average pooling</button></div>
    <pre><code id="ccCalc"></code></pre>
    <div class="stats"><span>z at this position <b id="ccZ"></b></span><span>Pooling cell <b id="ccPool"></b></span><span>Filter parameters <b>9 + 1 bias</b></span></div>
    <p class="hint" id="ccMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Convolution = the same small neuron at every image position. The output is a feature map that shows <i>where</i> in the image the filter's pattern occurs.</p></div>
  <p class="note">Mathematically Keras and PyTorch compute a <i>cross-correlation</i> (the filter is not flipped). Since the weights are learned anyway, this does not matter; the name «convolution» stuck.</p>

  <h3 id="cnn-pad">3 · Padding and stride: how large is the feature map?</h3>
  <p>Without a border, a 3 × 3 filter fits on an 8 × 8 image at only 6 × 6 positions: every layer loses <code>k − 1</code> pixels. <b>Padding</b> puts a border of zeros around the image so the size is kept and the border pixels also appear in enough windows. <b>Stride</b> is the step size of the filter; with stride 2 every second position is skipped and the feature map is about half as large.</p>
  <pre><code>output = ⌊(n + 2p − k) / s⌋ + 1         # n input, k kernel, p padding, s stride

Conv2D(32, (3, 3), padding='valid')   # p = 0: 32 → 30
Conv2D(32, (3, 3), padding='same')    # p = 1: 32 → 32 (with stride 1)</code></pre>
  <div class="demo" id="csDemo">
    <div class="tag">Demo</div><h4>Compute the output size</h4>
    <p class="hint">One row of the image. The orange brackets are the positions of the filter, below are the output cells. The formula applies to height and width separately.</p>
    <svg class="plot" id="csSvg" viewBox="0 0 420 135" role="img" aria-label="One image row with padding, the filter positions and the output cells"></svg>
    <div class="ctl"><label for="csN">Input n</label><input type="range" id="csN" min="3" max="12" step="1" value="8"><output id="csNO"></output></div>
    <div class="ctl"><label for="csK">kernel size k</label><input type="range" id="csK" min="1" max="5" step="2" value="3"><output id="csKO"></output></div>
    <div class="ctl"><label for="csS">stride s</label><input type="range" id="csS" min="1" max="3" step="1" value="1"><output id="csSO"></output></div>
    <div class="ctl"><label for="csP">padding p</label><input type="range" id="csP" min="0" max="2" step="1" value="0"><output id="csPO"></output></div>
    <div class="stats"><span>Formula <b id="csF"></b></span><span>Keras <b id="csKeras"></b></span></div>
    <p class="hint" id="csMsg"></p>
  </div>

  <h3 id="cnn-pool">4 · Pooling: shrinking without weights</h3>
  <p><b>Pooling</b> summarises small windows, usually 2 × 2 with stride 2. <b>Max pooling</b> takes the largest value («the pattern is somewhere here»), <b>average pooling</b> the mean. Height and width are halved, the number of channels stays.</p>
  <ul>
    <li><b>Less computation and fewer parameters</b> in the following layers.</li>
    <li><b>Robust to small shifts:</b> if the pattern moves by one pixel, the maximum stays in the same window.</li>
    <li><b>Larger field of view:</b> a 3 × 3 filter after one pooling covers 6 × 6 pixels of the original. That way later layers see ever larger patches (<i>receptive field</i>).</li>
  </ul>
  <p>Pooling has <b>no parameters</b>. At the end of a CNN, <code>GlobalAveragePooling2D</code> often replaces <code>Flatten</code>: it averages every feature map to a single number and so saves most of the dense weights.</p>
  <div class="falle"><b>Pitfall</b><p>Pooling and stride throw away information about the exact position. For classification («is there a cat in the image?») that is intended. For tasks that assign individual pixels (segmentation), other architectures are needed.</p></div>

  <h3 id="cnn-kanal">5 · Several filters and channels: counting parameters</h3>
  <p>A conv layer has not one but many filters (32, 64, …). Each produces its own feature map; together they form the output of shape <code>(height, width, number of filters)</code>. These channels are the input of the next layer. That is why every filter reaches through <b>all</b> input channels: a 3 × 3 filter on an RGB image has <code>3 · 3 · 3 = 27</code> weights plus bias.</p>
  <pre><code>Parameters Conv2D = (k · k · C_in + 1) · C_out
Example:   Conv2D(32, (3, 3)) on 32 × 32 × 3   → (3·3·3 + 1) · 32  =    896
           Conv2D(64, (3, 3)) on 16 × 16 × 32  → (3·3·32 + 1) · 64 = 18,496</code></pre>
  <p>The image size does not appear in the formula: those are the <b>shared weights</b>. That is why conv layers are cheap, and most parameters of a small CNN sit in the first dense layer after <code>Flatten</code>.</p>
  <div class="demo" id="cpDemo">
    <div class="tag">Demo</div><h4>Build a CNN</h4>
    <p class="hint">Start values similar to the course example on CIFAR-10: three blocks with two conv layers each (first <code>same</code>, second <code>valid</code>) and max pooling, then dense 512. The filters double per block here (in the course example the third block stays at 64). The table matches <code>model.summary()</code> (without dropout, which has no parameters).</p>
    <div class="btnrow" id="cpIn" role="group" aria-label="Input"><button data-v="cifar" class="pri" aria-pressed="true">CIFAR-10 (32×32×3)</button><button data-v="mnist" aria-pressed="false">MNIST (28×28×1)</button></div>
    <div class="btnrow" id="cpPad" role="group" aria-label="padding"><button data-v="mixed" class="pri" aria-pressed="true">same, then valid</button><button data-v="same" aria-pressed="false">always same</button><button data-v="valid" aria-pressed="false">always valid</button></div>
    <div class="ctl"><label for="cpB">Blocks</label><input type="range" id="cpB" min="1" max="4" step="1" value="3"><output id="cpBO"></output></div>
    <div class="ctl"><label for="cpC">Conv layers per block</label><input type="range" id="cpC" min="1" max="2" step="1" value="2"><output id="cpCO"></output></div>
    <div class="ctl"><label for="cpF">Filters in the first block</label><input type="range" id="cpF" min="8" max="64" step="8" value="32"><output id="cpFO"></output></div>
    <div class="ctl"><label for="cpK">kernel size</label><input type="range" id="cpK" min="3" max="5" step="2" value="3"><output id="cpKO"></output></div>
    <div class="ctl"><label for="cpD">Dense hidden</label><input type="range" id="cpD" min="0" max="512" step="64" value="512"><output id="cpDO"></output></div>
    <div class="tablewrap"><table id="cpTab" style="min-width:0"></table></div>
    <div class="stats"><span>CNN total <b id="cpTot"></b></span><span>of which conv <b id="cpConv"></b></span><span>Dense network on the pixels <b id="cpDense"></b></span></div>
    <p class="hint" id="cpMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Conv parameters = <code>(k·k·C_in + 1) · C_out</code>, independent of the image size. Pooling has no parameters. The big chunk is the dense layer after <code>Flatten</code>.</p></div>

  <h3 id="cnn-keras">6 · A CNN in Keras</h3>
  <p>A typical small CNN stacks blocks of conv layers and pooling. With every block the image gets smaller and the number of filters larger: early filters find <b>edges and colours</b>, middle ones <b>textures and parts</b> (eye, wheel), late ones whole <b>object parts</b>. The dense part at the end decides the class from this.</p>
  <pre><code>import keras
from keras import layers

model = keras.Sequential([
    keras.Input(shape=(32, 32, 3)),
    layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
    layers.MaxPooling2D((2, 2)),                     # 32 → 16
    layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
    layers.MaxPooling2D((2, 2)),                     # 16 → 8
    layers.Conv2D(128, (3, 3), padding="same", activation="relu"),
    layers.MaxPooling2D((2, 2)),                     # 8 → 4
    layers.Flatten(),
    layers.Dropout(0.5),
    layers.Dense(10, activation="softmax"),
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.summary()

x_train = x_train / 255.0                            # pixels 0..255 → 0..1
history = model.fit(x_train, y_train, epochs=20, batch_size=64, validation_split=0.1)</code></pre>
  <p><code>sparse_categorical_crossentropy</code> takes class numbers (0 to 9) directly; with <code>to_categorical</code> and one-hot labels it is called <code>categorical_crossentropy</code>. For greyscale images like MNIST the input is <code>(28, 28, 1)</code>: even a single channel needs the third axis.</p>
  <div class="falle"><b>Pitfall</b><p>Many example notebooks pass <code>validation_data=(x_test, y_test)</code>. Then you choose epochs and architecture on the test set, and the test accuracy is too optimistic. Use <code>validation_split</code> or a separate validation part, and the test set once at the end.</p></div>
  <p><b>Batch normalisation</b> (<code>layers.BatchNormalization()</code>, after conv and before the activation or right after it) normalises a layer's outputs per mini-batch to mean 0 and spread 1. This stabilises and speeds up the training of deep networks and allows larger learning rates.</p>

  <h3 id="cnn-aug">7 · Overfitting with images: data augmentation</h3>
  <p>Even with shared weights CNNs have many parameters, and good image data is expensive. <b>Data augmentation</b> creates randomly altered variants of every image during training: flip, rotate, shift, zoom, change brightness. The network sees slightly different images every epoch and learns that a slightly rotated cat is still a cat.</p>
  <pre><code>augment = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),          # up to ±10 % of a full turn
    layers.RandomZoom(0.1),
    layers.RandomTranslation(0.1, 0.1),
])
model = keras.Sequential([keras.Input(shape=(32, 32, 3)), augment, layers.Rescaling(1 / 255), ...])</code></pre>
  <p>The random layers are only active during training; with <code>evaluate</code> and <code>predict</code> they leave the image unchanged. So validation and test are not altered.</p>
  <div class="falle"><b>Pitfall</b><p>Augmentation has to fit the task. Flipping horizontally is harmless for animals and cars, wrong for digits and text (a mirrored 2 is not a 2), and a 180° rotation turns a 6 into a 9.</p></div>
  <p>Further tools from the <a href="#nn-valid">neural networks</a> chapter apply just the same: <b>dropout</b> (usually before the dense layers), <b>early stopping</b> on the validation loss and a smaller network.</p>

  <h3 id="cnn-transfer">8 · Transfer learning: building on a finished network</h3>
  <p>Large CNNs (for example MobileNet, ResNet, EfficientNet) were trained on ImageNet with over a million photos. Their early and middle layers are general detectors for edges, textures and shapes that also work for <i>your</i> images. With <b>transfer learning</b> you take over this part and only train a new head for your classes. That needs far fewer images and less compute.</p>
  <ol>
    <li><b>Load the base</b> without its classification head (<code>include_top=False</code>), with the ImageNet weights.</li>
    <li><b>Freeze the base</b> (<code>base.trainable = False</code>) so the large gradients of the random new head do not destroy the learned filters.</li>
    <li><b>Train a new head:</b> pooling, dropout, dense with your classes.</li>
    <li>Optional <b>fine-tuning:</b> unfreeze the top layers of the base again and keep training with a very small learning rate (about 1e-5).</li>
  </ol>
  <pre><code>base = keras.applications.MobileNetV2(input_shape=(160, 160, 3), include_top=False, weights="imagenet")
base.trainable = False                                  # 2 · freeze

inputs = keras.Input(shape=(160, 160, 3))
x = keras.applications.mobilenet_v2.preprocess_input(inputs)   # same preprocessing as in pre-training
x = base(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(n_classes, activation="softmax")(x)
model = keras.Model(inputs, outputs)                    # 3 · only the head learns</code></pre>
  <div class="merk"><b>Key point</b><p>Few images? Do not train from scratch, but freeze a pre-trained network, train a new head and only then fine-tune carefully. The inputs must be preprocessed as in pre-training.</p></div>

  <h3 id="cnn-methoden">9 · Overview: steps and methods</h3>
  <p>The numbers match the figure «The whole workflow at a glance». What is missing here (optimizers, backpropagation in detail) is in the <a href="#nn-methoden">neural networks</a> chapter.</p>
  <div class="tablewrap"><table>
    <tr><th>Step</th><th>Methods to choose from</th><th>When which</th><th>Keras</th></tr>
    <tr><td><b>1 · Images</b></td><td>Shape <code>(H, W, C)</code>, pixels /255, one-hot or class numbers, split</td><td>Greyscale: C = 1. Same image size for all images.</td><td><code>Rescaling</code>, <code>to_categorical</code></td></tr>
    <tr><td><b>2 · Architecture</b></td><td>Conv2D (filters, kernel size, padding, stride), max or average pooling, Flatten or GlobalAveragePooling, Dense</td><td>3 × 3 filters, padding same, double the filters per block. Few images: transfer learning.</td><td><code>Conv2D</code>, <code>MaxPooling2D</code>, <code>keras.applications</code></td></tr>
    <tr><td><b>3 · Loss, optimizer</b></td><td>(Sparse) categorical cross-entropy, Adam</td><td>As for the dense network.</td><td><code>compile</code></td></tr>
    <tr><td><b>4–7 · Training</b></td><td>Forward pass, loss, backpropagation, update per mini-batch</td><td>batch size 32 to 256; a GPU helps a lot.</td><td><code>fit</code></td></tr>
    <tr><td><b>8 · Validation</b></td><td>Data augmentation, dropout, batch normalisation, early stopping, smaller network, fine-tuning</td><td>Curves far apart: overfitting. Choose augmentation to fit the task.</td><td><code>RandomFlip</code>, <code>Dropout</code>, <code>EarlyStopping</code></td></tr>
    <tr><td><b>9 · Test</b></td><td>Accuracy, confusion matrix, look at misclassified images</td><td>Once, when the setup is fixed.</td><td><code>evaluate</code></td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>A CNN replaces the first dense layers with conv and pooling blocks: local filters with shared weights find patterns anywhere in the image, pooling shrinks it and enlarges the field of view. Data augmentation, dropout and transfer learning help against overfitting.</p></div>
`,
  quiz: [
    { q: `Which two ideas distinguish a conv layer from a dense layer?`, a: `<b>Local connections:</b> every neuron sees only a small patch (e.g. 3 × 3). <b>Shared weights:</b> the same filter is used at every position. Hence few parameters, the neighbourhood is kept, and a pattern is recognised everywhere.` },
    { q: `What is a feature map?`, a: `The output of one filter over the whole image: at every position the weighted sum of window and filter (plus bias, then ReLU). High values show where the filter's pattern occurs.` },
    { q: `A 32 × 32 image, 3 × 3 filter, padding 'valid', stride 1. How large is the output, and with 'same'?`, a: `'valid': <code>(32 − 3)/1 + 1 = 30</code>, so 30 × 30. 'same': 32 × 32 (padding 1 on each side).` },
    { q: `How many parameters does <code>Conv2D(64, (3, 3))</code> have on an input with 32 channels?`, a: `<code>(3 · 3 · 32 + 1) · 64 = 18,496</code>. The height and width of the input do not matter.` },
    { q: `What does 2 × 2 max pooling do, and how many parameters does it have?`, a: `It takes the largest value from every 2 × 2 window: height and width are halved, the channels stay. No parameters. It makes the network more robust to small shifts and enlarges the field of view of the following layers.` },
    { q: `Why does the number of filters typically grow from block to block (32 → 64 → 128)?`, a: `Pooling makes the image smaller, the patterns become more complex and more numerous (edges → textures → object parts). More filters on a smaller area keeps the computation per layer roughly constant.` },
    { q: `Where are most parameters of a small CNN, and how do you save them?`, a: `In the first dense layer after <code>Flatten</code>. <code>GlobalAveragePooling2D</code> instead of <code>Flatten</code>, or one more pooling, shrinks its input a lot.` },
    { q: `What is data augmentation, and when is it active?`, a: `Random changes to the training images (flip, rotate, zoom, shift) so the network learns robust features and overfits less. Only during training; validation and test stay unchanged.` },
    { q: `Why is horizontal flipping a bad augmentation for digits?`, a: `Mirrored digits are no longer valid digits (a mirrored 2 or 7). Augmentation may only produce changes after which the class stays the same.` },
    { q: `What is transfer learning, and why do you freeze the base first?`, a: `Taking over a CNN pre-trained on many images and only training a new head. Frozen because the random weights of the new head produce large gradients at first, which would destroy the learned filters. Then optionally fine-tuning with a very small learning rate.` },
    { q: `A notebook trains with <code>validation_data=(x_test, y_test)</code>. What is the problem?`, a: `Epochs and setup are chosen on the test set; the test accuracy is then no longer an honest estimate. Better <code>validation_split</code> or a separate validation part, test once at the end.` },
    { q: `What shape does the input for MNIST images have in a CNN, and why?`, a: `<code>(28, 28, 1)</code>. Conv2D always expects a channel axis, even for greyscale.` },
  ],
});
