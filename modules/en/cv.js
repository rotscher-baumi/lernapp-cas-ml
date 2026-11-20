/* English texts for the module "cv" (Computer Vision). Fields replace the German ones when the language is EN. */
LernApp.translate('cv', {
  nav: 'Computer Vision',
  title: `Computer Vision`,
  kicker: `Module 3 · Deep Learning, part 3`,
  summary: `Image formation, denoising, deblurring, super-resolution, object detection (IoU, NMS, Faster R-CNN, YOLO), semantic segmentation (U-Net, SAM)`,
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
  <p>In the computer an image is a table of numbers: a greyscale image is an H × W matrix with values from 0 to 1 (or 0 to 255), a colour image has three channels (RGB). PyTorch expects <code>[C, H, W]</code>, a mini-batch <code>[B, C, H, W]</code>.</p>
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

  <h3 id="cv-restauration">2 · Restoration: denoising, deblurring, super-resolution</h3>
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

  <h3 id="cv-detection">3 · Object detection: what is where?</h3>
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

  <h3 id="cv-iou">4 · IoU and NMS: counting hits and removing duplicates</h3>
  <p><b>IoU</b> (intersection over union) measures how well two boxes overlap: area of the intersection divided by area of the union. 0 means no contact, 1 means identical. IoU is used in three places: when <b>assigning</b> anchors to ground-truth boxes in training, as a <b>box loss</b>, and in <b>evaluation</b>: a prediction counts as a hit if its IoU with a ground-truth box is above a threshold (usually 0.5).</p>
  <div class="demo" id="ioDemo">
    <div class="tag">Demo</div><h4>IoU of two boxes</h4>
    <p class="hint">Shift and scale the orange prediction against the blue ground truth. The green intersection divided by the union is the IoU.</p>
    <div class="ctl"><label for="ioX">Shift x</label><input type="range" id="ioX" min="-80" max="100" step="2" value="40"><output id="ioDX"></output></div>
    <div class="ctl"><label for="ioY">Shift y</label><input type="range" id="ioY" min="-60" max="80" step="2" value="20"><output id="ioDY"></output></div>
    <div class="ctl"><label for="ioS">Size of the prediction</label><input type="range" id="ioS" min="40" max="160" step="5" value="100"><output id="ioSC"></output></div>
    <svg class="plot" id="ioSvg" viewBox="0 0 400 300" style="max-width:420px" role="img" aria-label="Two boxes with the intersection marked in green"></svg>
    <pre><code id="ioCalc"></code></pre>
    <div class="stats"><span>IoU <b id="ioV"></b></span></div>
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

  <h3 id="cv-seg">5 · Semantic segmentation: one class per pixel</h3>
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

  <h3 id="cv-methoden">6 · Overview: tasks, models, loss, metric</h3>
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
`,
  quiz: [
    { q: `What is the image formation model, and what do its three parts mean?`, a: `<code>I = f ⊛ h + n</code>. <b>f</b> is the ideal image, <b>h</b> the PSF (smearing by optics, motion, focus, as a convolution), <b>n</b> the noise. I is the capture.` },
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
