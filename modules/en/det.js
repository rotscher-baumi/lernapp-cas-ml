/* English texts for the module "det" (Object Detection & Segmentation). Fields replace the German ones when the language is EN. */
LernApp.translate('det', {
  nav: `Detection & Segmentation`,
  title: `Object Detection & Segmentation`,
  kicker: `Module 3 · Computer Vision · Fri 20.11.`,
  summary: `Structure of a detector (backbone, neck, head, post-processing), Faster R-CNN, YOLO, IoU, NMS, semantic segmentation (U-Net, SAM)`,
  html: `  <p>The chapter <a href="#cv">Image Processing</a> showed tasks where an image goes in and an image comes out. Here the question is <i>what is where</i> in the image. Two tasks have a spatial output: a <b>list of boxes</b> (object detection) or a <b>class per pixel</b> (semantic segmentation). The building blocks stay those of the <a href="#cnn">CNN</a> chapter: filters, feature maps, pooling, backpropagation, plus pretrained backbones.</p>
  <p class="note">The demos compute in the browser. The course notebooks (detection, segmentation) run in Jupyter or Colab.</p>

  <h3 id="det-ablauf">The whole workflow at a glance</h3>
  <p>The workflow is the same as for the <a href="#cnn-ablauf">CNN</a>. What changes are the task (step 1), the model (2), the loss (3) and the metric in validation (8).</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="detFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Workflow of a detection or segmentation project: fix images and labels, choose the model, set loss and optimizer, then the training loop of forward pass, loss, backpropagation and update, then validation with mAP or IoU and finally one test">
      ${LernApp.nnFlow({
        id: 'det',
        aria: 'Step %: open explanation',
        steps: [
          ['Images and labels', 'boxes or masks'],
          ['Choose the model', 'Faster R-CNN, YOLO, U-Net, SAM'],
          ['Loss and optimizer', 'class + box, CE + Dice'],
          ['Forward pass', 'boxes or pixel classes'],
          ['Compute the loss', 'matching via IoU'],
          ['Backpropagation', 'gradients for all filters'],
          ['Update parameters', 'w ← w − α · ∂L/∂w'],
          ['Check validation', 'mAP, IoU / Dice'],
          ['Test once', 'test set, new scenes'],
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

  <h3 id="det-detection">1 · Object detection: what is where?</h3>
  <p>The output is a <b>set</b> of predictions, and its size is unknown:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = box (x0, y0, x1, y1)    c = class    s = score in [0, 1]    k = unknown</code></pre>
  <h4 id="det-aufbau">Structure of a detector: backbone, neck, head, post-processing</h4>
  <p>Almost every modern detector consists of four parts that run one after the other. Each one only processes what the previous one delivers. The numbers are for a YOLO-style detector with a 640 × 640 pixel input.</p>
  <figure class="fig" id="detArch" style="max-width:900px"><div style="overflow-x:auto"><svg viewBox="0 0 1080 510" style="min-width:720px" role="img" aria-label="Structure of a detector: the backbone shrinks the image to feature maps C3, C4 and C5. The neck combines them top-down and bottom-up into P3, P4 and P5. Per level a head predicts box, objectness and class, 8400 candidates in total. Post-processing reduces them with a score threshold and NMS to a few boxes."><rect x="30" y="10" width="90" height="4" rx="2" style="fill:var(--muted)"/><rect x="190" y="10" width="120" height="4" rx="2" style="fill:var(--accent)"/><rect x="430" y="10" width="190" height="4" rx="2" style="fill:var(--ok)"/><rect x="700" y="10" width="120" height="4" rx="2" style="fill:var(--warn)"/><rect x="885" y="10" width="170" height="4" rx="2" style="fill:var(--bad)"/><text class="d-tb" x="75" y="34" style="font-size:16px">Input</text><text class="d-m" x="75" y="54">pixels</text><text class="d-tb" x="250" y="34" style="font-size:16px">Backbone</text><text class="d-m" x="250" y="54">pixels → features</text><text class="d-tb" x="525" y="34" style="font-size:16px">Neck</text><text class="d-m" x="525" y="54">combine small + large</text><text class="d-tb" x="760" y="34" style="font-size:16px">Head</text><text class="d-m" x="760" y="54">features → numbers</text><text class="d-tb" x="970" y="34" style="font-size:16px">Post-processing</text><text class="d-m" x="970" y="54">clean up</text><rect class="d-box" x="30" y="345" width="90" height="90" rx="4"/><circle class="d-pg" cx="75" cy="370" r="9"/><path class="d-pg" d="M60 425Q60 385 75 385Q90 385 90 425z"/><text class="d-tm" x="75" y="452" style="font-size:11px">640×640×3</text><line class="d-arr" x1="122" y1="390" x2="202" y2="390"/><text class="d-m" x="162" y="376">conv stages</text><rect class="d-box" x="214" y="342" width="84" height="84" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="208" y="348" width="84" height="84" rx="3"/><text class="d-tb" x="250" y="382" style="font-size:13px">C3</text><text class="d-tm" x="250" y="400" style="font-size:11px">80×80</text><rect class="d-box" x="224" y="212" width="64" height="64" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="218" y="218" width="64" height="64" rx="3"/><text class="d-tb" x="250" y="242" style="font-size:13px">C4</text><text class="d-tm" x="250" y="260" style="font-size:11px">40×40</text><rect class="d-box" x="232" y="80" width="48" height="48" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="226" y="86" width="48" height="48" rx="3"/><text class="d-tb" x="250" y="102" style="font-size:13px">C5</text><text class="d-tm" x="250" y="120" style="font-size:11px">20×20</text><line class="d-arr" x1="250" y1="346" x2="250" y2="288"/><line class="d-arr" x1="250" y1="216" x2="250" y2="140"/><text class="d-m" x="242" y="318" style="text-anchor:end">stride 2</text><text class="d-m" x="242" y="178" style="text-anchor:end">stride 2</text><text class="d-m" x="250" y="452">resolution ↓, channels ↑</text><line class="d-arr" x1="284" y1="110" x2="438" y2="110"/><line class="d-arr" x1="292" y1="250" x2="438" y2="250"/><line class="d-arr" x1="302" y1="390" x2="438" y2="390"/><text class="d-m" x="362" y="96">coarse, much meaning</text><text class="d-m" x="362" y="376">fine, many details</text><text class="d-tm" x="470" y="78" style="font-size:11px">top-down</text><text class="d-tm" x="580" y="78" style="font-size:11px">bottom-up</text><rect class="d-ok" x="442" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="110" style="font-size:13px">T5</text><line class="d-arr" x1="500" y1="110" x2="548" y2="110"/><rect class="d-ok" x="552" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="110" style="font-size:13px">P5</text><line class="d-arr" x1="610" y1="110" x2="696" y2="110"/><rect class="d-ok" x="442" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="250" style="font-size:13px">T4</text><line class="d-arr" x1="500" y1="250" x2="548" y2="250"/><rect class="d-ok" x="552" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="250" style="font-size:13px">P4</text><line class="d-arr" x1="610" y1="250" x2="696" y2="250"/><rect class="d-ok" x="442" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="390" style="font-size:13px">T3</text><line class="d-arr" x1="500" y1="390" x2="548" y2="390"/><rect class="d-ok" x="552" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="390" style="font-size:13px">P3</text><line class="d-arr" x1="610" y1="390" x2="696" y2="390"/><line class="d-arr" x1="470" y1="129" x2="470" y2="229"/><line class="d-arr" x1="470" y1="269" x2="470" y2="369"/><line class="d-arr" x1="580" y1="371" x2="580" y2="271"/><line class="d-arr" x1="580" y1="231" x2="580" y2="131"/><text class="d-m" x="462" y="180" style="text-anchor:end">upsample</text><text class="d-m d-ml" x="588" y="180">downsample</text><text class="d-m" x="462" y="320" style="text-anchor:end">upsample</text><text class="d-m d-ml" x="588" y="320">downsample</text><rect class="d-warn" x="700" y="85" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="101" style="font-size:13px">Head</text><text class="d-tm" x="760" y="120" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="150">400 · large objects</text><rect class="d-warn" x="700" y="225" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="241" style="font-size:13px">Head</text><text class="d-tm" x="760" y="260" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="290">1600 · medium</text><rect class="d-warn" x="700" y="365" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="381" style="font-size:13px">Head</text><text class="d-tm" x="760" y="400" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="430">6400 · small objects</text><polyline class="d-ln" points="820,390 850,390 850,110"/><line class="d-ln" x1="820" y1="250" x2="850" y2="250"/><line class="d-arr" x1="820" y1="110" x2="881" y2="110"/><rect x="885" y="88" width="170" height="44" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="101" style="font-size:13px">8400 candidates</text><text class="d-tm" x="970" y="120" style="font-size:11px">many overlapping</text><rect x="885" y="190" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="206" style="font-size:13px">Score threshold</text><text class="d-tm" x="970" y="225" style="font-size:11px">score &lt; 0.25 → drop</text><rect x="885" y="292" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="308" style="font-size:13px">NMS</text><text class="d-tm" x="970" y="327" style="font-size:11px">IoU &gt; τ → best stays</text><rect x="885" y="394" width="170" height="50" rx="6" style="fill:var(--bad)"/><text class="d-tb" x="970" y="410" style="font-size:13px;fill:var(--surface)">Result</text><text class="d-tm" x="970" y="429" style="font-size:11px;fill:var(--surface)">(box, class, score)</text><line class="d-arr" x1="970" y1="132" x2="970" y2="188"/><text class="d-m d-ml" x="980" y="160">8400 boxes</text><line class="d-arr" x1="970" y1="240" x2="970" y2="290"/><text class="d-m d-ml" x="980" y="265">≈ 40 boxes</text><line class="d-arr" x1="970" y1="342" x2="970" y2="392"/><text class="d-m d-ml" x="980" y="367">3 boxes</text><path class="d-ln" d="M190 470V480H830V470"/><path class="d-ln" d="M885 470V480H1055V470"/><text class="d-m" x="510" y="498">learns in training: the loss on the head output updates all weights</text><text class="d-m" x="970" y="498">fixed rules, no training</text></svg></div><figcaption>The deeper in the backbone, the smaller the feature map and the more meaning per pixel. The neck passes this meaning top-down to the fine maps and the details bottom-up back. Per grid cell the head outputs one box: 80² + 40² + 20² = 8400 candidates. Faster R-CNN has the same parts, only its head works in two stages.</figcaption></figure>
  <ul>
    <li><b>Backbone</b> (e.g. ResNet, CSPDarknet): turns pixels into feature maps, first edges and textures, deeper shapes and object parts. Usually pretrained and reused via transfer learning.</li>
    <li><b>Neck</b> (e.g. FPN, PAN): combines fine and coarse feature maps. Small objects need details (P3), large ones need context (P5).</li>
    <li><b>Head</b>: predicts per grid cell a box (x, y, w, h), objectness and class scores. The loss is computed on its output.</li>
    <li><b>Post-processing</b>: a score threshold removes uncertain boxes, NMS removes duplicates (see <a href="#det-iou">section 2</a>). This part is not trained; the threshold and τ are hyperparameters.</li>
  </ul>
  <p>What makes it hard: 0 to about 100 objects per image, objects overlap, they have very different sizes, and every prediction needs a confidence. There are two designs:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Two stages: Faster R-CNN</th><th>One stage: YOLO (v8)</th></tr>
    <tr><td><b>Flow</b></td><td>1. Backbone makes feature maps. 2. The <b>RPN</b> (region proposal network) proposes candidate regions (~2000, ~300 after NMS). 3. Per candidate: determine the class and refine the box.</td><td>1. Backbone makes feature maps. 2. Heads at several scales. 3. Every grid cell predicts class and box; the cell containing the object centre is responsible.</td></tr>
    <tr><td><b>Anchors</b></td><td>9 <i>anchors</i> per position (3 sizes × 3 aspect ratios); the network predicts offsets from them</td><td>Anchor-free: predicts the box directly</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: objectness + box; head: class + box (trained jointly)</td><td>Class loss (BCE) + box loss (CIoU, DFL)</td></tr>
    <tr><td><b>Strength</b></td><td>Highest accuracy, small objects</td><td>Real time, edge devices</td></tr>
  </table></div>
  <p>Labels in YOLO format are one row per object: <code>class_id cx cy w h</code>, all coordinates normalised to 0 to 1. An anchor is simply a predefined box that the network shifts and stretches slightly; this way it does not have to guess every box from scratch.</p>

  <h3 id="det-iou">2 · IoU and NMS: counting hits and removing duplicates</h3>
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

  <h3 id="det-seg">3 · Semantic segmentation: one class per pixel</h3>
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

  <h3 id="det-methoden">4 · Overview: tasks, models, loss, metric</h3>
  <p>The rows correspond to steps 1 to 3 and 8 of the figure «The whole workflow at a glance».</p>
  <div class="tablewrap"><table>
    <tr><th>Task</th><th>Output</th><th>Models</th><th>Loss</th><th>Metric</th></tr>
    <tr><td><b>Object detection</b></td><td>Boxes, classes, scores</td><td>Faster R-CNN, YOLO</td><td>Class (BCE/CE) + box (IoU-based)</td><td>mAP@IoU</td></tr>
    <tr><td><b>Semantic segmentation</b></td><td>Class per pixel</td><td>U-Net, SAM</td><td>Cross-entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>Detection outputs boxes, segmentation a map with one class per pixel. Both are measured with IoU: detection per box (mAP@IoU), segmentation per class (mIoU). Pretrained backbones appear everywhere.</p></div>

  <h3 id="det-best">5 · Best practices</h3>
  <p>On top of the <a href="#cnn-best">best practices from CNN</a>, for detection and segmentation:</p>
  <div class="bp-check">
    <div><b>Baseline and model choice</b><ul>
      <li>Test a pretrained model zero-shot on your own images first and fine-tune only if a gap remains and suitable data is available.</li>
      <li>The newest model is not automatically the best: what counts is whether it is built for your task, your images and your hardware.</li>
    </ul></div>
    <div><b>Data and labels</b><ul>
      <li>For detection and segmentation, check the annotations and split by scene or video, not by single frames.</li>
      <li>Adapt the training images to the deployment site: ready-made models and datasets mostly consist of clean images. If the images in use are blurry, noisy or have a blue tint, alter the clean images in exactly that way (blur, noise, colour cast) and fine-tune on them.</li>
      <li>Watch for domain shift: a model that learned on photos helps little with X-ray or microscope images.</li>
      <li>For segmentation, watch for class imbalance: strengthen rare classes with a Dice loss or weights.</li>
    </ul></div>
    <div><b>Comparing fairly</b><ul>
      <li>Measure all methods on the same test images with the same metric, plus runtime and number of parameters.</li>
      <li>For detection, report mAP with its IoU threshold (mAP@0.5 or mAP@0.5:0.95), for segmentation IoU or Dice per class.</li>
      <li>Look at boxes and masks on sample images: a good mAP can hide systematic errors, e.g. with small or occluded objects.</li>
    </ul></div>
    <div><b>Limits</b><ul>
      <li>Choose the score threshold and the NMS threshold τ on validation, not on the test set.</li>
      <li>Also test on images from other cameras and lighting conditions before the model is deployed.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Key point</b><p>Test pretrained models zero-shot first, check the annotations and split by scene, always report mAP with its IoU threshold and choose thresholds on validation.</p></div>
`,
  quiz: [
    { q: `What do backbone, neck, head and post-processing do in a detector?`, a: `<b>Backbone:</b> turns pixels into feature maps. <b>Neck:</b> combines fine and coarse feature maps for small and large objects. <b>Head:</b> predicts box, objectness and class per grid cell. <b>Post-processing:</b> a score threshold and NMS remove uncertain boxes and duplicates; this part is not trained.` },
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
