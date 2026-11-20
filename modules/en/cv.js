/* English texts for the module "cv" (Computer Vision). Fields replace the German ones when the language is EN. */
LernApp.translate('cv', {
  nav: 'Computer Vision',
  title: `Computer Vision`,
  kicker: `Module 3 · Deep Learning, part 3`,
  summary: `Image formation, pixels and channels (RGB, alpha, dtype, HWC/CHW, file formats), denoising, deblurring, super-resolution, object detection (IoU, NMS, Faster R-CNN, YOLO), semantic segmentation (U-Net, SAM)`,
  html: `  <p>The <a href="#cnn">CNN</a> chapter showed how a network <i>classifies</i> images: one image in, one label out. Computer vision is broader. This chapter covers three tasks where the output itself is spatial: a <b>better image</b> (restoration), a <b>list of boxes</b> (object detection) or a <b>class per pixel</b> (semantic segmentation). The building blocks stay those of the CNN chapter: filters, feature maps, pooling, backpropagation.</p>
  <p class="note">The demos compute in the browser with small sample images. The course notebooks (image basics, denoising, deblurring, super-resolution, detection, segmentation) run in Jupyter or Colab.</p>

  <h3 id="cv-ablauf">The whole workflow at a glance</h3>
  <p>The workflow is the same as for the <a href="#cnn-ablauf">CNN</a>. What changes are the task (step 1), the model (2), the loss (3) and the metric in validation (8).</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="cvFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Workflow of a computer vision project: fix the task and images, choose the model, set loss and optimizer, then the training loop of forward pass, loss, backpropagation and update, then validation with a task-specific metric and finally one test">
      ${LernApp.nnFlow({
        id: 'cv',
        aria: 'Step %: open explanation',
        steps: [
          ['Images and task', 'restoration, detection, segmentation'],
          ['Choose the model', 'U-Net, Faster R-CNN, YOLO, SAM'],
          ['Loss and optimizer', 'L1, IoU loss, cross-entropy + Dice'],
          ['Forward pass', 'image, boxes or pixel classes'],
          ['Compute the loss', 'distance to target (image, box, mask)'],
          ['Backpropagation', 'gradients for all filters'],
          ['Update parameters', 'w ← w − α · ∂L/∂w'],
          ['Check validation', 'PSNR, mAP, IoU / Dice'],
          ['Test once', 'test set, also foreign cameras'],
        ],
        loopA: ['per mini-batch,', 'many epochs'],
        loopB: ['Tuning:', 'model, loss,', 'augmentation'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Steps 4 to 7 (orange dashed, inner) run for every mini-batch. The outer loop is tuning on validation. The test set (orange) is not used for choosing.</figcaption>
  </figure>

  <h3 id="cv-bild">1 · How an image is formed (and why it is never perfect)</h3>
  <p>Light passes through the optics, hits the sensor, is amplified and digitised (light → electrons → voltage → numbers). Every stage degrades the image a little. A simplified model describes this:</p>
  <pre><code>I(x, y) = f(x, y) ⊛ h(x, y) + n(x, y)</code></pre>
  <ul>
    <li><b>f</b> is the ideal image we would like to have.</li>
    <li><b>h</b> is the <b>PSF</b> (point spread function): how the optics smear a point. <code>⊛</code> is convolution, the same operation as a filter. Motion, wrong focus or a shaky hand create <b>blur</b>.</li>
    <li><b>n</b> is <b>noise</b> (sensor, electronics, low light).</li>
    <li><b>I</b> is what we actually capture.</li>
  </ul>
  <p>In the computer an image is a table of numbers; <a href="#cv-pixel">section 2</a> shows exactly what it looks like.</p>
  <p>The three restoration tasks each undo one part: <b>denoising</b> removes n, <b>deblurring</b> undoes the convolution with h, <b>super-resolution</b> reconstructs details lost when shrinking (aliasing). All three are <i>ill-posed</i>: many possible f fit one I. So you need prior knowledge of «what real images look like», classically as filter rules, today learned from data.</p>
  <div class="demo" id="rcvDemo">
    <div class="tag">Demo</div><h4>Degrade an image and repair it with a filter</h4>
    <p class="hint">Degrade the 16 × 16 test image with blur and noise, then choose a restoration filter. PSNR (in dB, higher is better) measures the distance to the original. Try «Salt and pepper» with the median filter.</p>
    <div class="ctl"><label for="rcvB">Blur (passes)</label><input type="range" id="rcvB" min="0" max="3" step="1" value="0"><output id="rcvBO"></output></div>
    <div class="ctl"><label for="rcvS">Noise strength</label><input type="range" id="rcvS" min="0" max="0.5" step="0.05" value="0.15"><output id="rcvSO"></output></div>
    <div class="btnrow" id="rcvKind" role="group" aria-label="Noise type"><button data-v="gauss" class="pri" aria-pressed="true">Gaussian noise</button><button data-v="sp" aria-pressed="false">Salt and pepper</button></div>
    <div class="btnrow" id="rcvFix" role="group" aria-label="Restoration filter"><button data-v="none" class="pri" aria-pressed="true">No filter</button><button data-v="mean" aria-pressed="false">Mean 3×3</button><button data-v="median" aria-pressed="false">Median 3×3</button></div>
    <svg class="plot" id="rcvSvg" viewBox="0 0 590 210" style="max-width:640px" role="img" aria-label="Original image, degraded capture and restored image with PSNR"></svg>
    <p class="hint" id="rcvMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Capture = original, smeared, plus noise. Every filter trades something for something: the mean filter smooths noise but blurs edges. The median filter is better with outliers (salt and pepper) because a single extreme pixel does not move the median.</p></div>

  <h3 id="cv-pixel">2 · What is inside an image: pixels, channels, memory</h3>
  <p>To the computer an image is an array of shape <code>(H, W, C)</code>: H rows, W columns and C channels per pixel. The origin (0, 0) is at the <b>top left</b>, and indexing is row first: <code>img[y, x]</code>. One pixel of a colour photo is three numbers from 0 to 255.</p>
  <div class="demo" id="pxDemo">
    <div class="tag">Demo</div><h4>Pixel inspector</h4>
    <p class="hint">Move the mouse over the image or tap it. The magnifier shows 9 × 9 pixels, the centre is the selected pixel. Next to it are its values in the usual notations.</p>
    <div class="px-stage">
      <div>
        <canvas class="px-scene" id="pxScene" width="160" height="100" aria-label="Sample image: landscape with house, lake and sun, 160 × 100 pixels"></canvas>
        <div class="px-axis"><span>(0, 0) top left</span><span>x → W = 160</span></div>
        <div class="px-axis"><span>y ↓ H = 100</span><span>img.shape = (100, 160, 3)</span></div>
      </div>
      <div>
        <canvas class="px-lens" id="pxLens" width="198" height="198" aria-label="Magnified 9 × 9 pixels around the selected pixel"></canvas>
        <dl class="px-read" id="pxRead"></dl>
      </div>
    </div>
  </div>

  <h4>Channels: a colour image is three greyscale images stacked</h4>
  <p>Each channel is its own H × W matrix. Bright means «a lot of this component». The red roof is bright in the R channel and almost black in the B channel, the lake the other way round.</p>
  <div class="demo" id="pxChDemo">
    <div class="tag">Demo</div><h4>Split an image into its channels</h4>
    <div class="btnrow" id="pxMode" role="group" aria-label="How to show the channels"><button data-v="gray" class="pri" aria-pressed="true">as greyscale</button><button data-v="tint" aria-pressed="false">tinted</button></div>
    <div class="px-ch" id="pxCh"></div>
    <p class="hint">Greyscale is a weighted sum of the three channels (green counts most because the eye is most sensitive there). Hue comes from the HSV colour space. Alpha is a fourth channel for opacity, here a gradient from left to right.</p>
  </div>
  <p>A pixel can hold much more than RGB:</p>
  <div class="tablewrap"><table>
    <tr><th>Type</th><th>C</th><th>Content</th><th>Where</th></tr>
    <tr><td><b>Greyscale</b></td><td>1</td><td>brightness</td><td><code>(H, W)</code>, PIL mode <code>L</code></td></tr>
    <tr><td><b>RGB</b></td><td>3</td><td>red, green, blue</td><td>standard photo, PIL, matplotlib</td></tr>
    <tr><td><b>BGR</b></td><td>3</td><td>the same, reversed order</td><td><code>cv2.imread</code></td></tr>
    <tr><td><b>RGBA</b></td><td>4</td><td>RGB + alpha (opacity)</td><td>PNG with transparency</td></tr>
    <tr><td><b>Palette</b></td><td>1</td><td>index into a colour table (at most 256 colours)</td><td>GIF, PIL mode <code>P</code></td></tr>
    <tr><td><b>RGB-D</b></td><td>4</td><td>RGB + depth (distance to the camera)</td><td>Kinect, RealSense, LiDAR</td></tr>
    <tr><td><b>Multispectral</b></td><td>4–13</td><td>RGB + near infrared and more bands</td><td>satellites (Sentinel-2: 13 bands)</td></tr>
    <tr><td><b>Hyperspectral</b></td><td>100+</td><td>many narrow wavelengths</td><td>agriculture, medicine</td></tr>
    <tr><td><b>Label mask</b></td><td>1</td><td>class ID per pixel</td><td>ground truth for <a href="#cv-seg">segmentation</a></td></tr>
    <tr><td><b>HSV, LAB, YCbCr</b></td><td>3</td><td>the same information in another colour space</td><td>colour segmentation; JPEG works in YCbCr internally</td></tr>
  </table></div>

  <h4>Bit depth and dtype</h4>
  <p>The bit depth says how finely a value is graded. 8 bits per channel give 256 levels, with three channels 256³ ≈ 16.7 million colours.</p>
  <div class="px-levels" id="pxLevels"></div>
  <div class="tablewrap"><table>
    <tr><th>dtype</th><th>Range</th><th>Used for</th></tr>
    <tr><td><code>uint8</code></td><td>0 to 255</td><td>standard for photos and image files</td></tr>
    <tr><td><code>uint16</code></td><td>0 to 65,535</td><td>medicine (DICOM), RAW, scientific cameras</td></tr>
    <tr><td><code>float32</code></td><td>usually 0.0 to 1.0</td><td>input for neural networks, HDR</td></tr>
    <tr><td><code>bool</code></td><td>0 or 1</td><td>binary masks</td></tr>
  </table></div>
  <div class="demo" id="pxCalcDemo">
    <div class="tag">Demo</div><h4>How much memory does an image need?</h4>
    <p class="hint">Uncompressed in RAM: H × W × C × bytes per value. Try a batch of float32 images: that is how fast GPU memory fills up.</p>
    <div class="px-calc">
      <label for="pxH">Height H<input id="pxH" type="number" min="1" value="1080"></label>
      <label for="pxW">Width W<input id="pxW" type="number" min="1" value="1920"></label>
      <label for="pxC">Channels C<select id="pxC"><option value="1">1 · greyscale</option><option value="3" selected>3 · RGB</option><option value="4">4 · RGBA</option><option value="13">13 · Sentinel-2</option></select></label>
      <label for="pxD">dtype<select id="pxD"><option value="1" selected>uint8 · 1 byte</option><option value="2">uint16 · 2 bytes</option><option value="4">float32 · 4 bytes</option></select></label>
    </div>
    <div class="stats"><span>One image <b id="pxM1"></b></span><span>Batch of 32 <b id="pxM32"></b></span></div>
    <pre><code id="pxMCalc"></code></pre>
  </div>

  <h4>Memory layout: HWC or CHW</h4>
  <p>Memory is one-dimensional. A 2 × 2 RGB image takes 12 values, and the only question is the order they are stored in. NumPy, PIL, OpenCV and TensorFlow put the three values of a pixel next to each other (<b>HWC</b>, interleaved). PyTorch stores all R values first, then all G, then all B values (<b>CHW</b>, planar); a mini-batch is <code>[B, C, H, W]</code>.</p>
  <figure class="fig px-layout" id="pxLayout">
    <div class="px-mini" id="pxMini" aria-label="2 × 2 image with four coloured pixels"></div>
    <div class="px-strips">
      <div><b>HWC</b> <span class="muted">NumPy, PIL, OpenCV</span><div class="px-strip" id="pxHWC"></div></div>
      <div><b>CHW</b> <span class="muted">PyTorch</span><div class="px-strip" id="pxCHW"></div></div>
    </div>
    <figcaption>The same twelve numbers in a different order. <code>img.transpose(2, 0, 1)</code> turns HWC into CHW, <code>t.permute(1, 2, 0)</code> turns it back.</figcaption>
  </figure>

  <h4>Image file: signature, header, metadata, pixels</h4>
  <p>On disk the array is not stored raw but compressed, with a header in front. The first bytes are a <b>signature</b> (magic bytes): software recognises the format by them, not by the file extension.</p>
  <div class="px-file">
    <b>PNG</b> <span class="muted">lossless, made of chunks</span>
    <div class="px-bytes">
      <div class="px-seg sig"><code>89 50 4E 47 0D 0A 1A 0A</code><span>signature «‰PNG»</span></div>
      <div class="px-seg"><code>IHDR</code><span>width, height, bit depth, colour type</span></div>
      <div class="px-seg meta"><code>eXIf · iCCP · tEXt</code><span>metadata, colour profile</span></div>
      <div class="px-seg data"><code>IDAT …</code><span>pixels, row filter + Deflate (as in ZIP)</span></div>
      <div class="px-seg"><code>IEND</code><span>end</span></div>
    </div>
    <b>JPEG</b> <span class="muted">lossy, made of markers</span>
    <div class="px-bytes">
      <div class="px-seg sig"><code>FF D8</code><span>SOI, start</span></div>
      <div class="px-seg meta"><code>FF E1 · APP1</code><span>EXIF: camera, GPS, orientation</span></div>
      <div class="px-seg"><code>FF DB · DQT</code><span>quantisation tables (quality)</span></div>
      <div class="px-seg"><code>FF C0 · SOF0</code><span>size, channels, subsampling</span></div>
      <div class="px-seg data"><code>FF DA · SOS …</code><span>YCbCr, 8 × 8 blocks, DCT, Huffman</span></div>
      <div class="px-seg"><code>FF D9</code><span>EOI, end</span></div>
    </div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Format</th><th>Compression</th><th>Channels / bits</th><th>Good for</th></tr>
    <tr><td><b>BMP</b></td><td>none</td><td>RGB(A), 8 bits</td><td>raw pixels, rare today</td></tr>
    <tr><td><b>PNG</b></td><td>lossless</td><td>1–4, 8 or 16 bits</td><td>masks, screenshots, transparency</td></tr>
    <tr><td><b>JPEG</b></td><td>lossy</td><td>1 or 3, 8 bits</td><td>photos; never for masks</td></tr>
    <tr><td><b>WebP, AVIF</b></td><td>both</td><td>up to 4, 8–12 bits</td><td>web, smaller than JPEG</td></tr>
    <tr><td><b>GIF</b></td><td>lossless</td><td>palette, at most 256 colours</td><td>animations, graphics</td></tr>
    <tr><td><b>TIFF</b></td><td>selectable</td><td>any, up to 32-bit float</td><td>satellites (GeoTIFF), microscopy</td></tr>
    <tr><td><b>RAW, DNG</b></td><td>mostly none</td><td>1 (Bayer), 12–14 bits</td><td>photography, full sensor data</td></tr>
    <tr><td><b>DICOM</b></td><td>selectable</td><td>1, 12–16 bits</td><td>CT, MRI, X-ray, with patient data</td></tr>
  </table></div>
  <p>Besides the pixels the file carries <b>metadata</b>: EXIF (camera, exposure, date, GPS, orientation), an ICC colour profile (sRGB, Display P3) and the resolution in DPI.</p>

  <h4>From sensor to array</h4>
  <div class="px-pipe">
    <div><span class="muted">Sensor</span><b>Bayer filter</b><div class="px-bayer" id="pxBayer" aria-label="Bayer pattern RGGB, 6 × 6 cells"></div><span>Each photo cell measures only R, G or B. Green appears twice.</span></div>
    <div><span class="muted">Camera</span><b>Demosaicing</b><span>Interpolate the two missing colours of each pixel from its neighbours: 3 channels.</span></div>
    <div><span class="muted">Camera</span><b>White balance, gamma</b><span>Correct colour casts, map values non-linearly to sRGB.</span></div>
    <div><span class="muted">Encoder</span><b>Compression</b><span>Write JPEG, PNG or HEIC, attach EXIF and ICC profile.</span></div>
    <div><span class="muted">Python</span><b>Decoder</b><span><code>cv2.imread</code> or <code>Image.open</code> unpacks into a <code>uint8</code> array <code>(H, W, C)</code>.</span></div>
  </div>
  <p>This is the same chain as the image formation model of section 1, seen from the data: demosaicing and JPEG compression add errors of their own on top of the noise n.</p>

  <div class="falle"><b>Pitfall</b><ul>
    <li><b>OpenCV loads BGR.</b> In matplotlib the colours then look bluish: <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>.</li>
    <li><b>Row before column.</b> NumPy indexes <code>img[y, x]</code>, but OpenCV functions such as <code>cv2.circle</code> want points as <code>(x, y)</code>.</li>
    <li><b>uint8 overflow.</b> <code>np.uint8(200) + np.uint8(100)</code> gives 44. Before computing: <code>img.astype(np.float32) / 255</code>.</li>
    <li><b>4 instead of 3 channels.</b> A PNG with alpha does not fit a model that expects RGB: <code>Image.open(p).convert("RGB")</code>.</li>
    <li><b>EXIF rotation.</b> Phone photos are displayed rotated, but the pixels are stored unrotated in the file: <code>ImageOps.exif_transpose(img)</code>.</li>
    <li><b>Masks as JPEG.</b> Compression changes label IDs at the edges; always save masks as PNG.</li>
  </ul></div>
  <div class="merk"><b>Key point</b><p>An image is an array <code>(H, W, C)</code> with a dtype. The channels can be colour, opacity, depth or classes. In RAM the layout matters (HWC or CHW), on disk the format (lossless or not) and the metadata. Before any model, look at <code>shape</code>, <code>dtype</code>, <code>min</code> and <code>max</code> first.</p></div>

  <h3 id="cv-restauration">3 · Restoration: denoising, deblurring, super-resolution</h3>
  <p>All three tasks are «image in, image out». Each has classical methods and deep learning.</p>
  <div class="tablewrap"><table>
    <tr><th>Task</th><th>Classical</th><th>Deep learning</th></tr>
    <tr><td><b>denoising</b></td><td>Gaussian filter, bilateral filter (keeps edges), non-local means, BM3D (transform domain)</td><td>CNN with skip connections (U-Net), transformers (SwinIR, Restormer)</td></tr>
    <tr><td><b>deblurring</b></td><td><i>Non-blind</i> (PSF known): inverse filter, Wiener filter, Richardson-Lucy, total variation</td><td><i>Blind</i> (PSF unknown): DeblurGAN (CNN + discriminator), Restormer</td></tr>
    <tr><td><b>super-resolution</b></td><td>Interpolation: bilinear, bicubic, Lanczos; sparse coding</td><td>SRCNN (first CNN, 3 layers), EDSR, transformers (SwinIR, HAT), ESRGAN</td></tr>
  </table></div>
  <h4>How a network learns restoration</h4>
  <p>You need <b>pairs</b> (degraded, clean). They are often made artificially: take clean images and apply noise, blur or shrinking yourself. The network Φ with weights θ then learns</p>
  <pre><code>θ* = argmin_θ  Σᵢ  L( Φ_θ(Iᵢ), fᵢ )</code></pre>
  <p>So it learns implicitly what clean images look like, without having to estimate the PSF or a noise model explicitly.</p>
  <ul>
    <li><b>Skip connections (U-Net):</b> the encoder shrinks, the decoder enlarges again, and connections copy fine detail from the encoder straight to the decoder. Without them edges would be lost in the <i>bottleneck</i>.</li>
    <li><b>Loss:</b> <b>L1</b> (mean absolute error) gives sharper images than <b>L2</b> (MSE), which tends towards the mean of all plausible images and looks washed out. Add a <b>perceptual loss</b> (distance in the features of a pretrained network such as VGG) and a <b>GAN loss</b> (a discriminator penalises unnatural textures, see <a href="#gen">Generative Models</a>).</li>
    <li><b>Transformers:</b> self-attention sees the whole image from the first layer (large blur, distant similar parts). Full attention costs too much on large images; so SwinIR and Restormer work with windows or channels.</li>
  </ul>
  <div class="falle"><b>Pitfall</b><p>PSNR rewards pixel closeness, not good looks. An L2-trained network reaches high PSNR with a soft image; a GAN network looks sharper but has lower PSNR because it <i>invents</i> plausible detail. For medical or forensic images invented detail is a risk.</p></div>

  <h3 id="cv-detection">4 · Object detection: what is where?</h3>
  <p>The output is a <b>set</b> of predictions, and its size is unknown:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = box (x0, y0, x1, y1)    c = class    s = score in [0, 1]    k = unknown</code></pre>
  <p>What makes it hard: 0 to about 100 objects per image, objects overlap, they have very different sizes, and every prediction needs a confidence. There are two designs:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Two stages: Faster R-CNN</th><th>One stage: YOLO (v8)</th></tr>
    <tr><td><b>Flow</b></td><td>1. Backbone makes feature maps. 2. The <b>RPN</b> (region proposal network) proposes candidate regions (~2000, ~300 after NMS). 3. Per candidate: determine the class and refine the box.</td><td>1. Backbone makes feature maps. 2. Heads at several scales. 3. Every grid cell predicts class and box; the cell containing the object centre is responsible.</td></tr>
    <tr><td><b>Anchors</b></td><td>9 <i>anchors</i> per position (3 sizes × 3 aspect ratios); the network predicts offsets from them</td><td>Anchor-free: predicts the box directly</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: objectness + box; head: class + box (trained jointly)</td><td>Class loss (BCE) + box loss (CIoU, DFL)</td></tr>
    <tr><td><b>Strength</b></td><td>Highest accuracy, small objects</td><td>Real time, edge devices</td></tr>
  </table></div>
  <p>Labels in YOLO format are one row per object: <code>class_id cx cy w h</code>, all coordinates normalised to 0 to 1. An anchor is simply a predefined box that the network shifts and stretches slightly; this way it does not have to guess every box from scratch.</p>

  <h3 id="cv-iou">5 · IoU and NMS: counting hits and removing duplicates</h3>
  <p><b>IoU</b> (intersection over union) measures how well two boxes overlap: area of the intersection divided by area of the union. 0 means no contact, 1 means identical. IoU is used in three places: when <b>assigning</b> anchors to ground-truth boxes in training, as a <b>box loss</b>, and in <b>evaluation</b>: a prediction counts as a hit if its IoU with a ground-truth box is above a threshold (usually 0.5).</p>
  <div class="demo" id="ioDemo">
    <div class="tag">Demo</div><h4>IoU of two boxes</h4>
    <p class="hint">Drag the boxes with the mouse (or a finger) to a new place; resize them with the corner handle at the bottom right. The green intersection divided by the union is the IoU. Keyboard: select a box with Tab, arrow keys move it, Shift + arrow keys resize it.</p>
    <svg class="plot" id="ioSvg" viewBox="0 0 400 300" style="max-width:420px" role="group" aria-label="Two draggable boxes with the intersection marked in green"></svg>
    <pre><code id="ioCalc"></code></pre>
    <div class="stats"><span>Intersection <b id="ioI"></b></span><span>Union <b id="ioU"></b></span><span>IoU <b id="ioV"></b></span></div>
  </div>
  <p>A detector first outputs <b>many overlapping boxes</b> for the same object. <b>Non-maximum suppression (NMS)</b> cleans up:</p>
  <pre><code>sort boxes by score
while boxes remain:
    keep the best box
    remove all remaining boxes with IoU &gt; τ to the best one</code></pre>
  <p>Before that a <b>score threshold</b> (e.g. 0.25) removes the uncertain boxes. NMS runs per class: boxes of different classes may overlap freely.</p>
  <div class="demo" id="nmDemo">
    <div class="tag">Demo</div><h4>NMS with a movable threshold τ</h4>
    <p class="hint">Five candidates for two objects (number = score). Green = kept, grey dashed = suppressed.</p>
    <div class="ctl"><label for="nmT">IoU threshold τ</label><input type="range" id="nmT" min="0.05" max="0.95" step="0.05" value="0.5"><output id="nmTO"></output></div>
    <svg class="plot" id="nmSvg" viewBox="0 0 300 150" style="max-width:460px" role="img" aria-label="Five candidate boxes for two objects, kept boxes in green"></svg>
    <div class="stats"><span>Kept <b id="nmN"></b></span></div>
    <p class="hint" id="nmMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Detection = predict boxes, then reduce them to a clean list with a score threshold and NMS. IoU is used for assigning, training and evaluating. The metric <b>mAP</b> averages precision over classes and IoU thresholds.</p></div>

  <h3 id="cv-seg">6 · Semantic segmentation: one class per pixel</h3>
  <p>The output has <b>the same height and width as the input image</b>: every pixel gets exactly one class (<code>y ∈ {1…C}^(H×W)</code>). There are no boxes and no single objects; two cars side by side are the same class «car». Hard parts are precise edges (every wrong border pixel counts), strong <b>class imbalance</b> (background often over 95 % of pixels, a naive network says «background» everywhere), the mix of small and large structures and the cost of pixel-accurate labels (10 to 100 times more expensive than boxes).</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>U-Net</th><th>SAM (Segment Anything)</th></tr>
    <tr><td><b>Idea</b></td><td>Encoder-decoder with skip connections. The encoder understands <i>what</i> is in the image, the decoder turns that back into a full-resolution map, the skips supply the precise edges.</td><td>Foundation model, trained once on a billion masks. You give a <b>prompt</b> (point, box, mask, text) and get the mask of the object.</td></tr>
    <tr><td><b>Training</b></td><td>On your own labels, one model per task</td><td>None needed (zero-shot)</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-entropy + λ · Dice</td><td>–</td></tr>
    <tr><td><b>Limit</b></td><td>Needs labels, transfers poorly</td><td>Knows no class names, only «object»; combine with a classifier for classes</td></tr>
  </table></div>
  <p><b>Dice</b> measures the overlap of predicted and true mask: <code>2·|A∩B| / (|A| + |B|)</code>. As a loss it complements cross-entropy because it does not average rare classes away: a network that says «background» everywhere has high pixel accuracy but Dice 0 for the object. It holds that <code>Dice = 2·IoU / (1 + IoU)</code>, so Dice ≥ IoU. Evaluation uses the <b>IoU</b> per class (averaged: mIoU).</p>
  <div class="falle"><b>Pitfall</b><p>Pixel accuracy is almost worthless in segmentation. With 95 % background «everything background» reaches 95 %. Always report IoU or Dice per class.</p></div>

  <h3 id="cv-methoden">7 · Overview: tasks, models, loss, metric</h3>
  <p>The rows correspond to steps 1 to 3 and 8 of the figure «The whole workflow at a glance».</p>
  <div class="tablewrap"><table>
    <tr><th>Task</th><th>Output</th><th>Models</th><th>Loss</th><th>Metric</th></tr>
    <tr><td><b>denoising</b></td><td>Image</td><td>Gaussian, BM3D; U-Net, SwinIR, Restormer</td><td>L1, perceptual</td><td>PSNR, SSIM</td></tr>
    <tr><td><b>deblurring</b></td><td>Image</td><td>Wiener, Richardson-Lucy; DeblurGAN, Restormer</td><td>L1, frequency loss, GAN</td><td>PSNR, SSIM</td></tr>
    <tr><td><b>super-resolution</b></td><td>Image, larger</td><td>bicubic; SRCNN, EDSR, SwinIR, ESRGAN</td><td>L1 / MSE, GAN</td><td>PSNR, SSIM, appearance</td></tr>
    <tr><td><b>Object detection</b></td><td>Boxes, classes, scores</td><td>Faster R-CNN, YOLO</td><td>Class (BCE/CE) + box (IoU-based)</td><td>mAP@IoU</td></tr>
    <tr><td><b>Semantic segmentation</b></td><td>Class per pixel</td><td>U-Net, SAM</td><td>Cross-entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>Same building blocks, different output: an image for restoration, boxes for detection, a pixel map for segmentation. The task determines model, loss and metric. Skip connections and pretrained backbones appear everywhere.</p></div>

  <h3 id="cv-best">8 · Best practices</h3>
  <p>On top of the <a href="#cnn-best">best practices from CNN</a>, for restoration, detection and segmentation:</p>
  <div class="bp-check">
    <div><b>Baseline and model choice</b><ul>
      <li>First a classical method as the baseline: median filter for salt-and-pepper noise, Gaussian or bilateral filter and NLM for denoising, bicubic for super-resolution. Sometimes that is already enough.</li>
      <li>Test a pretrained model zero-shot on your own images first and fine-tune only if a gap remains and suitable data is available.</li>
      <li>The newest model is not automatically the best: what counts is whether it is built for your task, your images and your hardware.</li>
    </ul></div>
    <div><b>Data and degradation</b><ul>
      <li>Train with realistic degradation: real sensor noise is not Gaussian (Poisson in low light, speckle in ultrasound and radar). Vary the noise level during training.</li>
      <li>Watch for domain shift: a model that learned on photos helps little with X-ray or microscope images.</li>
      <li>For detection and segmentation, check the annotations and split by scene or video, not by single frames.</li>
    </ul></div>
    <div><b>Comparing fairly</b><ul>
      <li>Measure all methods on the same test images with the same metric, plus runtime and number of parameters.</li>
      <li>Look at PSNR and SSIM <b>and</b> image crops: a good number can still look washed out.</li>
      <li>For detection, report mAP with its IoU threshold (mAP@0.5 or mAP@0.5:0.95), for segmentation IoU or Dice per class.</li>
    </ul></div>
    <div><b>Limits</b><ul>
      <li>Super-resolution and generative restoration <b>invent</b> plausible details. In medicine, forensics or metrology such an image must not be used as a measurement.</li>
      <li>Also test on images from other cameras and lighting conditions before the model is deployed.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Key point</b><p>Classical baseline first, test pretrained models zero-shot first, degrade realistically, compare fairly on the same test images and look at images, not just numbers.</p></div>
`,
  quiz: [
    { q: `What is the image formation model, and what do its three parts mean?`, a: `<code>I = f ⊛ h + n</code>. <b>f</b> is the ideal image, <b>h</b> the PSF (smearing by optics, motion, focus, as a convolution), <b>n</b> the noise. I is the capture.` },
    { q: `What does the shape <code>(480, 640, 3)</code> mean, and how do you access the pixel in column 10, row 20?`, a: `480 rows (H), 640 columns (W), 3 channels (RGB). Access is row first: <code>img[20, 10]</code> gives the three values [R, G, B]. The origin is at the top left.` },
    { q: `Why do images from <code>cv2.imread</code> look bluish in matplotlib?`, a: `OpenCV stores the channels in BGR order, matplotlib expects RGB. Red and blue are swapped. Fix: <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>.` },
    { q: `How much memory does a 1920 × 1080 RGB image need as uint8 and as float32?`, a: `H × W × C × bytes: 1080 · 1920 · 3 · 1 ≈ 6.2 MB as uint8, four times as much (≈ 24.9 MB) as float32.` },
    { q: `What is the difference between HWC and CHW?`, a: `The same numbers in a different order. HWC (NumPy, PIL, OpenCV) puts the channels of one pixel side by side, CHW (PyTorch) stores all R, then all G, then all B values. Convert with <code>transpose(2, 0, 1)</code>.` },
    { q: `Why are segmentation masks saved as PNG and not as JPEG?`, a: `JPEG is lossy: compression changes values at edges, class 2 may become 3 or 1. PNG is lossless, the label IDs stay exact.` },
    { q: `What does an image file contain besides the pixels?`, a: `A signature (magic bytes, e.g. <code>FF D8</code> for JPEG), a header with size, bit depth and colour type, metadata (EXIF with camera, GPS, orientation; ICC colour profile) and the compressed pixel data.` },
    { q: `Which restoration task undoes which part of the model?`, a: `<b>denoising</b> removes n, <b>deblurring</b> undoes the convolution with h, <b>super-resolution</b> restores fine detail after shrinking.` },
    { q: `Why are these tasks «ill-posed»?`, a: `Many possible originals f fit one capture I. Without prior knowledge of natural images (filter rules or learned from data) the solution is not unique.` },
    { q: `When is the median filter better than the mean filter?`, a: `With outliers such as salt-and-pepper noise: a single extreme value does not move the median, but moves the mean a lot. The median also preserves edges better.` },
    { q: `Why L1 instead of L2 as the loss in restoration?`, a: `L2 (MSE) tends towards the mean of all plausible images and gives washed-out results; L1 usually gives sharper images.` },
    { q: `What are skip connections in the U-Net for?`, a: `They carry fine detail (edges, textures) from the encoder straight to the decoder, which would be lost in the bottleneck. They also shorten the path for the gradient.` },
    { q: `How does the output of classification differ from object detection?`, a: `Classification: one label per image. Detection: a set of (box, class, score) of unknown size that depends on the image.` },
    { q: `Compute the IoU: box A has area 100, box B area 100, the intersection 50.`, a: `Union = 100 + 100 − 50 = 150, IoU = 50 / 150 = 0.33. At threshold 0.5 that is no hit.` },
    { q: `What does NMS do, and what happens with a threshold τ that is too low?`, a: `Keeps the box with the highest score, removes all others whose IoU with it is above τ, then repeats. With τ too low, boxes of real neighbouring objects are suppressed too; with τ too high, duplicates stay.` },
    { q: `Faster R-CNN or YOLO: when which?`, a: `Faster R-CNN (two stages) when top accuracy and small objects matter. YOLO (one stage, anchor-free) when speed matters, e.g. real time or edge devices.` },
    { q: `What is an anchor?`, a: `A predefined box (size and aspect ratio) at every position of the feature map. The network only predicts whether an object is there and how the box must be shifted and stretched.` },
    { q: `How does semantic segmentation differ from detection?`, a: `The output is a class per pixel at the size of the image, with no boxes and no separation of single objects of the same class.` },
    { q: `Why is pixel accuracy misleading in segmentation, and what is used instead?`, a: `Background often makes up over 95 % of pixels; «all background» would have 95 % accuracy. Better IoU or Dice per class (mIoU), and Dice as a loss next to cross-entropy.` },
    { q: `What is the difference between U-Net and SAM?`, a: `U-Net is trained per task on your own labels. SAM is trained once on very many masks and segments by prompt (point, box) without new training, but knows no class names.` },
  ],
});
