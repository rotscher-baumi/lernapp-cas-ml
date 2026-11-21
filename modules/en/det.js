/* English texts for the module "det" (Object Detection & Segmentation). Fields replace the German ones when the language is EN.
   The figures come from LernApp.detFig (assets/demos-det.js) and pick their language through LernApp.t. */
(function () {
const F = LernApp.detFig;
LernApp.translate('det', {
  nav: `Object Detection & Segmentation`,
  title: `Object Detection & Segmentation`,
  kicker: `Module 3 · Computer Vision · Fri 20.11.`,
  summary: `Four tasks (classification to instance segmentation), box formats and labels, structure of a detector, Faster R-CNN, YOLO, IoU, NMS, mAP, semantic segmentation, U-Net, SAM`,
  html: `  <p>The chapter <a href="#cv">Image Processing</a> showed tasks where an image goes in and an image comes out. Here the question is <i>what is where</i> in the image. The output is spatial: a <b>list of boxes</b> (object detection), a <b>class per pixel</b> (semantic segmentation) or a <b>mask per object</b> (instance segmentation). The building blocks stay those of the chapter <a href="#cnn">CNN</a>: filters, feature maps, pooling, backpropagation, plus pretrained backbones.</p>
  <p class="note">The demos compute in the browser. The course notebooks (detection with YOLOv8, segmentation) run in Jupyter or Colab.</p>

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

  <h3 id="det-aufgaben">1 · Four tasks: from a label to a mask</h3>
  <p>The same street scene, four questions. From top left to bottom right the output gets finer: one word, then rectangles, then a colour for every pixel, finally a mask of its own for every single object.</p>
  <figure class="fig" style="max-width:640px">${F.tasks()}<figcaption>Classification only says <i>what</i> is in the image. Detection also says <i>where</i>, but only as a rectangle. Semantic segmentation assigns every pixel to a class but does not tell the two people apart. Instance segmentation separates them and usually leaves out background such as road and tree.</figcaption></figure>
  <div class="tablewrap"><table>
    <tr><th>Task</th><th>Question</th><th>Output</th><th>Labels</th><th>Typical models</th></tr>
    <tr><td><b>Classification</b></td><td>What is in the image?</td><td>one label (+ score)</td><td>one class per image</td><td>ResNet, EfficientNet (<a href="#cnn">CNN</a>)</td></tr>
    <tr><td><b>Object detection</b></td><td>What is where?</td><td>boxes with class and score</td><td>boxes, e.g. YOLO <code>.txt</code></td><td>Faster R-CNN, YOLO</td></tr>
    <tr><td><b>Semantic segmentation</b></td><td>Which class does every pixel have?</td><td>map H × W with class IDs</td><td>mask as PNG</td><td>U-Net, DeepLab</td></tr>
    <tr><td><b>Instance segmentation</b></td><td>Which pixels belong to which object?</td><td>box + mask per object</td><td>polygon or mask per object</td><td>Mask R-CNN, YOLOv8-seg</td></tr>
  </table></div>
  <p>There is also <b>panoptic segmentation</b> (semantic and instance together: every pixel gets a class, countable objects also get a number) and class-agnostic masks on request with <a href="#det-sam">SAM</a>. The finer the output, the more expensive the labels: a box is drawn in seconds, a pixel-exact mask takes many times longer.</p>
  <div class="merk"><b>Key point</b><p>The task determines output, labels, model and metric. First decide what you really need: for “how many cars?” boxes are enough; for “which area is road?” you need a mask.</p></div>

  <h3 id="det-detection">2 · Object detection: output, labels, structure</h3>
  <p>The output is a <b>set</b> of predictions, and its size is unknown:</p>
  <pre><code>y = { (b₁, c₁, s₁), (b₂, c₂, s₂), … (bₖ, cₖ, sₖ) }
b = box (x0, y0, x1, y1)    c = class    s = score in [0, 1]    k = unknown</code></pre>
  <p>What makes it hard: 0 to about 100 objects per image, objects overlap, they have very different sizes, and every prediction needs a confidence. A normal network, however, has a fixed number of outputs. The solution of all modern detectors: predict very many candidates at fixed places and then throw away the bad ones.</p>

  <h4 id="det-labels">Box formats and labels</h4>
  <p>A box has four numbers, but every library writes them differently. Mixed-up formats are one of the most common mistakes: training runs, but the boxes end up in the wrong place.</p>
  <div class="demo" id="bfDemo">
    <div class="tag">Demo</div><h4>One box, three formats</h4>
    <p class="hint">Drag the orange box to another place or change its size at the corner handle bottom right. Below it is the same box in the three usual formats. Keyboard: choose the box with Tab, arrow keys move it, Shift + arrow keys change its size.</p>
    <svg class="plot" id="bfSvg" viewBox="0 0 320 240" style="max-width:420px" role="group" aria-label="Street scene with a movable box around the car"></svg>
    <pre><code id="bfOut"></code></pre>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Format</th><th>Numbers</th><th>Unit</th><th>Where</th></tr>
    <tr><td><b>xyxy</b></td><td>top-left and bottom-right corner</td><td>pixels</td><td>Pascal VOC, torchvision, output of <code>boxes.xyxy</code></td></tr>
    <tr><td><b>xywh</b></td><td>top-left corner, width, height</td><td>pixels</td><td>COCO JSON</td></tr>
    <tr><td><b>YOLO</b></td><td>class, centre, width, height</td><td>0 to 1 (divided by image width or height)</td><td>one <code>.txt</code> per image, one line per object</td></tr>
  </table></div>
  <p>A YOLO dataset consists of two parallel folders and a description. <code>images/train/bild001.jpg</code> goes with <code>labels/train/bild001.txt</code>; an image without objects gets an empty file.</p>
  <pre><code># labels/train/bild001.txt     class cx cy w h  (one line per object)
2 0.300 0.675 0.425 0.317
0 0.609 0.593 0.073 0.387

# data.yaml
path: datasets/strasse
train: images/train
val: images/val
names: {0: person, 1: bicycle, 2: car}</code></pre>
  <div class="merk"><b>How does the model know that 2 means “car”?</b><p>It does not. The network only outputs numbers: output 2 has the highest score. The translation into a name is done by the list <code>names</code>, which was fixed when labelling and is saved with the model (in YOLO in the <code>.pt</code> file as <code>model.names</code>, in torchvision in <code>weights.meta["categories"]</code>, in Keras usually only in your own code). The <i>knowledge</i> of what a car looks like sits in the weights; the labels are only needed in training as the target answer for the loss. Swap the list and the model still recognises correctly but labels wrongly.</p></div>

  <h4 id="det-aufbau">Structure of a detector: backbone, neck, head, post-processing</h4>
  <p>Almost every modern detector consists of four parts that run one after the other. Each one only processes what the previous one delivers. The numbers apply to a YOLO-like detector with a 640 × 640 pixel input.</p>
  <figure class="fig" id="detArch" style="max-width:900px"><div style="overflow-x:auto"><svg viewBox="0 0 1080 510" style="min-width:720px" role="img" aria-label="Structure of a detector: the backbone shrinks the image to feature maps C3, C4 and C5. The neck combines them top-down and bottom-up into P3, P4 and P5. Per level a head predicts box, objectness and class, 8400 candidates in total. Post-processing reduces them with a score threshold and NMS to a few boxes."><rect x="30" y="10" width="90" height="4" rx="2" style="fill:var(--muted)"/><rect x="190" y="10" width="120" height="4" rx="2" style="fill:var(--accent)"/><rect x="430" y="10" width="190" height="4" rx="2" style="fill:var(--ok)"/><rect x="700" y="10" width="120" height="4" rx="2" style="fill:var(--warn)"/><rect x="885" y="10" width="170" height="4" rx="2" style="fill:var(--bad)"/><text class="d-tb" x="75" y="34" style="font-size:16px">Input</text><text class="d-m" x="75" y="54">pixels</text><text class="d-tb" x="250" y="34" style="font-size:16px">Backbone</text><text class="d-m" x="250" y="54">pixels → features</text><text class="d-tb" x="525" y="34" style="font-size:16px">Neck</text><text class="d-m" x="525" y="54">combine small + large</text><text class="d-tb" x="760" y="34" style="font-size:16px">Head</text><text class="d-m" x="760" y="54">features → numbers</text><text class="d-tb" x="970" y="34" style="font-size:16px">Post-processing</text><text class="d-m" x="970" y="54">clean up</text><rect class="d-box" x="30" y="345" width="90" height="90" rx="4"/><circle class="d-pg" cx="75" cy="370" r="9"/><path class="d-pg" d="M60 425Q60 385 75 385Q90 385 90 425z"/><text class="d-tm" x="75" y="452" style="font-size:11px">640×640×3</text><line class="d-arr" x1="122" y1="390" x2="202" y2="390"/><text class="d-m" x="162" y="376">conv stages</text><rect class="d-box" x="214" y="342" width="84" height="84" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="208" y="348" width="84" height="84" rx="3"/><text class="d-tb" x="250" y="382" style="font-size:13px">C3</text><text class="d-tm" x="250" y="400" style="font-size:11px">80×80</text><rect class="d-box" x="224" y="212" width="64" height="64" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="218" y="218" width="64" height="64" rx="3"/><text class="d-tb" x="250" y="242" style="font-size:13px">C4</text><text class="d-tm" x="250" y="260" style="font-size:11px">40×40</text><rect class="d-box" x="232" y="80" width="48" height="48" rx="3" style="stroke:var(--accent)"/><rect class="d-hl" x="226" y="86" width="48" height="48" rx="3"/><text class="d-tb" x="250" y="102" style="font-size:13px">C5</text><text class="d-tm" x="250" y="120" style="font-size:11px">20×20</text><line class="d-arr" x1="250" y1="346" x2="250" y2="288"/><line class="d-arr" x1="250" y1="216" x2="250" y2="140"/><text class="d-m" x="242" y="318" style="text-anchor:end">stride 2</text><text class="d-m" x="242" y="178" style="text-anchor:end">stride 2</text><text class="d-m" x="250" y="452">resolution ↓, channels ↑</text><line class="d-arr" x1="284" y1="110" x2="438" y2="110"/><line class="d-arr" x1="292" y1="250" x2="438" y2="250"/><line class="d-arr" x1="302" y1="390" x2="438" y2="390"/><text class="d-m" x="362" y="96">coarse, much meaning</text><text class="d-m" x="362" y="376">fine, many details</text><text class="d-tm" x="470" y="78" style="font-size:11px">top-down</text><text class="d-tm" x="580" y="78" style="font-size:11px">bottom-up</text><rect class="d-ok" x="442" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="110" style="font-size:13px">T5</text><line class="d-arr" x1="500" y1="110" x2="548" y2="110"/><rect class="d-ok" x="552" y="93" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="110" style="font-size:13px">P5</text><line class="d-arr" x1="610" y1="110" x2="696" y2="110"/><rect class="d-ok" x="442" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="250" style="font-size:13px">T4</text><line class="d-arr" x1="500" y1="250" x2="548" y2="250"/><rect class="d-ok" x="552" y="233" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="250" style="font-size:13px">P4</text><line class="d-arr" x1="610" y1="250" x2="696" y2="250"/><rect class="d-ok" x="442" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="470" y="390" style="font-size:13px">T3</text><line class="d-arr" x1="500" y1="390" x2="548" y2="390"/><rect class="d-ok" x="552" y="373" width="56" height="34" rx="6"/><text class="d-tb" x="580" y="390" style="font-size:13px">P3</text><line class="d-arr" x1="610" y1="390" x2="696" y2="390"/><line class="d-arr" x1="470" y1="129" x2="470" y2="229"/><line class="d-arr" x1="470" y1="269" x2="470" y2="369"/><line class="d-arr" x1="580" y1="371" x2="580" y2="271"/><line class="d-arr" x1="580" y1="231" x2="580" y2="131"/><text class="d-m" x="462" y="180" style="text-anchor:end">upsample</text><text class="d-m d-ml" x="588" y="180">downsample</text><text class="d-m" x="462" y="320" style="text-anchor:end">upsample</text><text class="d-m d-ml" x="588" y="320">downsample</text><rect class="d-warn" x="700" y="85" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="101" style="font-size:13px">Head</text><text class="d-tm" x="760" y="120" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="150">400 · large objects</text><rect class="d-warn" x="700" y="225" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="241" style="font-size:13px">Head</text><text class="d-tm" x="760" y="260" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="290">1600 · medium</text><rect class="d-warn" x="700" y="365" width="120" height="50" rx="6"/><text class="d-tb" x="760" y="381" style="font-size:13px">Head</text><text class="d-tm" x="760" y="400" style="font-size:11px">Box · Obj · Cls</text><text class="d-m" x="760" y="430">6400 · small objects</text><polyline class="d-ln" points="820,390 850,390 850,110"/><line class="d-ln" x1="820" y1="250" x2="850" y2="250"/><line class="d-arr" x1="820" y1="110" x2="881" y2="110"/><rect x="885" y="88" width="170" height="44" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="101" style="font-size:13px">8400 candidates</text><text class="d-tm" x="970" y="120" style="font-size:11px">many overlapping</text><rect x="885" y="190" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="206" style="font-size:13px">Score threshold</text><text class="d-tm" x="970" y="225" style="font-size:11px">score &lt; 0.25 → drop</text><rect x="885" y="292" width="170" height="50" rx="6" style="fill:var(--surface);stroke:var(--bad);stroke-width:1.5"/><text class="d-tb" x="970" y="308" style="font-size:13px">NMS</text><text class="d-tm" x="970" y="327" style="font-size:11px">IoU &gt; τ → best stays</text><rect x="885" y="394" width="170" height="50" rx="6" style="fill:var(--bad)"/><text class="d-tb" x="970" y="410" style="font-size:13px;fill:var(--surface)">Result</text><text class="d-tm" x="970" y="429" style="font-size:11px;fill:var(--surface)">(box, class, score)</text><line class="d-arr" x1="970" y1="132" x2="970" y2="188"/><text class="d-m d-ml" x="980" y="160">8400 boxes</text><line class="d-arr" x1="970" y1="240" x2="970" y2="290"/><text class="d-m d-ml" x="980" y="265">≈ 40 boxes</text><line class="d-arr" x1="970" y1="342" x2="970" y2="392"/><text class="d-m d-ml" x="980" y="367">3 boxes</text><path class="d-ln" d="M190 470V480H830V470"/><path class="d-ln" d="M885 470V480H1055V470"/><text class="d-m" x="510" y="498">learns in training: the loss on the head output updates all weights</text><text class="d-m" x="970" y="498">fixed rules, no training</text></svg></div><figcaption>The deeper in the backbone, the smaller the feature map and the more meaning per pixel. The neck passes this meaning top-down to the fine maps and the details bottom-up back. Per grid cell the head outputs one box: 80² + 40² + 20² = 8400 candidates. Faster R-CNN has the same parts, only its head works in two stages.</figcaption></figure>
  <ul>
    <li><b>Backbone</b> (e.g. ResNet, CSPDarknet): turns pixels into feature maps, first edges and textures, deeper shapes and object parts. Usually pretrained and taken over by transfer learning.</li>
    <li><b>Neck</b> (e.g. FPN, PAN): combines fine and coarse feature maps. Small objects need detail (P3), large ones need context (P5).</li>
    <li><b>Head</b>: predicts per grid cell a box (x, y, w, h), objectness and class scores. The loss is computed on its output.</li>
    <li><b>Post-processing</b>: a score threshold removes uncertain boxes, NMS removes duplicates (see <a href="#det-iou">section 4</a>). This part is not trained; threshold and τ are hyperparameters.</li>
  </ul>

  <h3 id="det-modelle">3 · Faster R-CNN and YOLO: two stages or one</h3>
  <p>The two best-known detector families differ above all in <i>how often</i> they look at the image. Faster R-CNN first proposes regions and then checks each one. YOLO (“You Only Look Once”) predicts everything in a single forward pass.</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Two stages: Faster R-CNN</th><th>One stage: YOLO (v8)</th></tr>
    <tr><td><b>Flow</b></td><td>1. Backbone + FPN produce feature maps. 2. The <b>RPN</b> (region proposal network) proposes candidate regions. 3. Per candidate: cut out the features (RoI Align), determine the class and refine the box.</td><td>1. Backbone produces feature maps. 2. The neck combines three scales. 3. Per grid point the head directly predicts box and class scores.</td></tr>
    <tr><td><b>Anchors</b></td><td>Predefined boxes (9 per position in the original); the network predicts deviations from them</td><td>Anchor-free: predicts per grid point the distances to the four box edges</td></tr>
    <tr><td><b>Loss</b></td><td>RPN: objectness + box; head: class + box (trained together)</td><td>class loss (BCE) + box loss (CIoU, DFL)</td></tr>
    <tr><td><b>Speed</b></td><td>slower: typically a few to 20 images per second on the GPU</td><td>dozens to hundreds of images per second, also on edge devices</td></tr>
    <tr><td><b>Strength</b></td><td>Accurate, good with small and densely packed objects</td><td>Real time, video, easy to train and export</td></tr>
    <tr><td><b>Library</b></td><td><code>torchvision.models.detection</code>, Detectron2</td><td><code>ultralytics</code></td></tr>
  </table></div>

  <h4 id="det-rcnn">Faster R-CNN: propose first, then check</h4>
  <figure class="fig" style="max-width:900px"><div style="overflow-x:auto">${F.rcnn()}</div><figcaption>Stage 1 only asks: “is there any object here?” Stage 2 takes a closer look at the best proposals. The head knows C classes plus “background”, so it can reject a wrong proposal.</figcaption></figure>
  <p>The <b>region proposal network</b> (RPN) is a small conv network that slides over all feature maps. At every position there are <b>anchors</b>: predefined boxes in several sizes and aspect ratios. For every anchor the RPN predicts two things: how likely an object is there (objectness) and how the anchor has to be shifted and stretched. The best proposals (a few hundred to 2000) survive a first NMS.</p>
  <div class="grid2">
    <figure class="fig" style="margin:0">${F.anchors()}<figcaption>In training the anchor with the highest IoU to the ground-truth box (and every one above about 0.7) learns this object; anchors below about 0.3 learn “background”. With FPN there is only one size and three aspect ratios per level; the size comes from the level.</figcaption></figure>
    <div>
      <p><b>RoI Align</b> cuts out the matching part of the feature map for every proposal and brings it to a fixed size (7 × 7). So a normal head with a fixed input can classify every region, however large it is in the image. “Align” means the coordinates are not rounded to whole pixels but interpolated bilinearly; that makes the boxes more accurate.</p>
      <p>The <b>head</b> outputs per region C + 1 class scores (including background) and a fine correction of the box per class. At the end NMS runs per class.</p>
      <p><b>Mask R-CNN</b> is Faster R-CNN with a third output: a small mask (28 × 28) per region. That turns the detector into a model for instance segmentation.</p>
    </div>
  </div>
  <pre><code>from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2, FasterRCNN_ResNet50_FPN_V2_Weights
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

w = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT           # pretrained on COCO
model = fasterrcnn_resnet50_fpn_v2(weights=w).eval()
out = model([w.transforms()(img)])[0]                     # dict: boxes (xyxy), labels, scores
names = w.meta["categories"]                              # index → name

# Fine-tuning on 3 own classes: only replace the head (+ 1 for the background)
n_in = model.roi_heads.box_predictor.cls_score.in_features
model.roi_heads.box_predictor = FastRCNNPredictor(n_in, 3 + 1)</code></pre>

  <h4 id="det-yolo">YOLO: one look, one grid</h4>
  <p>YOLO lays grids in three scales over the image: at 640 × 640 pixels 80 × 80 (stride 8, P3), 40 × 40 (stride 16, P4) and 20 × 20 (stride 32, P5). Every cell has an <b>anchor point</b> in its centre, and for every anchor point the head predicts a box and the class scores. That gives the 8400 candidates of the figure above.</p>
  <p>Who learns which object? In the early versions (YOLOv1 to v3) the cell with the object centre was responsible. YOLOv8 takes all anchor points that lie <i>inside</i> the ground-truth box and picks the best of them (task-aligned assigner: high class score <i>and</i> high IoU). A small object only has anchor points inside its box on the fine grid; that is why P3 takes the small and P5 the large objects.</p>
  <div class="demo" id="ygDemo">
    <div class="tag">Demo</div><h4>Grid, stride and anchor points</h4>
    <p class="hint">Choose a level and drag the green box (object) around; the corner handle changes its size. Orange: the cell with the centre. Blue: all anchor points inside the box, the candidates for this object. Make the box small and switch to P5.</p>
    <div class="btnrow" id="ygLv" role="group" aria-label="Level"><button data-v="8" aria-pressed="false">P3 · 80 × 80</button><button data-v="16" class="pri" aria-pressed="true">P4 · 40 × 40</button><button data-v="32" aria-pressed="false">P5 · 20 × 20</button></div>
    <svg class="plot" id="ygSvg" viewBox="0 0 320 320" style="max-width:380px" role="group" aria-label="Image 640 × 640 with a grid and a movable object box"></svg>
    <div class="stats"><span>Grid <b id="ygG"></b></span><span>Stride <b id="ygS"></b></span><span>Box <b id="ygB"></b></span><span>Centre <b id="ygC"></b></span><span>Anchor points in the box <b id="ygN"></b></span></div>
    <p class="hint" id="ygMsg"></p>
  </div>
  <p>For every anchor point the head predicts four distances: how far the left, top, right and bottom edge of the box are away (in multiples of the stride). That gives the box. The <b>loss</b> has three parts: class loss (BCE, yes/no per class), box loss with <b>CIoU</b> (IoU plus penalties for shifted centres and wrong aspect ratio) and <b>DFL</b> (distribution focal loss, makes the edges more accurate).</p>
  <div class="tablewrap"><table>
    <tr><th>YOLOv8</th><th>Parameters</th><th>mAP@0.5:0.95 (COCO)</th><th>Use</th></tr>
    <tr><td><b>n</b> (nano)</td><td>3.2 M</td><td>37.3</td><td>Raspberry Pi, smartphone, quick experiments</td></tr>
    <tr><td><b>s</b> (small)</td><td>11.2 M</td><td>44.9</td><td>edge with an accelerator</td></tr>
    <tr><td><b>m</b> (medium)</td><td>25.9 M</td><td>50.2</td><td>good compromise on the GPU</td></tr>
    <tr><td><b>l</b> / <b>x</b></td><td>43.7 / 68.2 M</td><td>52.9 / 53.9</td><td>highest accuracy, server GPU</td></tr>
  </table></div>
  <p class="note">Values according to Ultralytics for 640 × 640 pixels on COCO val2017. Newer versions (YOLO11 etc.) shift the numbers; the principle stays.</p>
  <pre><code>from ultralytics import YOLO

model = YOLO("yolov8n.pt")                                # pretrained on COCO (80 classes)
res = model("strasse.jpg", conf=0.25, iou=0.7)[0]         # score threshold and NMS τ
for b in res.boxes:
    print(model.names[int(b.cls)], round(float(b.conf), 2), b.xyxy[0].tolist())

model.train(data="data.yaml", epochs=50, imgsz=640)       # fine-tuning: the head adapts to names
metrics = model.val()                                     # metrics.box.map50, metrics.box.map</code></pre>
  <div class="falle"><b>Pitfall</b><p>YOLO scales every image to <code>imgsz</code> (default 640). A photo 4000 pixels wide with a 40-pixel object is shrunk by a factor of 6; the object is then barely 7 pixels large and falls through all grids. Remedy: a larger <code>imgsz</code> or cutting the image into tiles.</p></div>

  <h3 id="det-iou">4 · IoU and NMS: counting hits and removing duplicates</h3>
  <p><b>IoU</b> (intersection over union) measures how well two boxes overlap: area of the intersection divided by area of the union. 0 means no contact, 1 means identical. IoU is needed in three places: when <b>assigning</b> anchors to ground-truth boxes in training, as the <b>box loss</b>, and in <b>evaluation</b>: a prediction counts as a hit if its IoU with a ground-truth box lies above a threshold (usually 0.5).</p>
  <pre><code>IoU = |A ∩ B| / |A ∪ B| = intersection / (area A + area B − intersection)</code></pre>
  <div class="demo" id="ioDemo">
    <div class="tag">Demo</div><h4>IoU of two boxes</h4>
    <p class="hint">Drag the boxes with the mouse (or your finger) to a new place; change the size at the corner handle bottom right. The green intersection divided by the union is the IoU. Keyboard: choose a box with Tab, arrow keys move it, Shift + arrow keys change its size.</p>
    <svg class="plot" id="ioSvg" viewBox="0 0 400 300" style="max-width:420px" role="group" aria-label="Two movable boxes with the intersection marked green"></svg>
    <pre><code id="ioCalc"></code></pre>
    <div class="stats"><span>Intersection <b id="ioI"></b></span><span>Union <b id="ioU"></b></span><span>IoU <b id="ioV"></b></span></div>
  </div>
  <p>IoU is stricter than it looks: two boxes of the same size, shifted by a third of their width, only have IoU 0.5. A detector first outputs <b>many overlapping boxes</b> for the same object. <b>Non-maximum suppression (NMS)</b> cleans up:</p>
  <pre><code>sort the boxes by score
while boxes are left:
    keep the best box
    remove all other boxes with IoU &gt; τ to the best one</code></pre>
  <p>Before that, a <b>score threshold</b> (e.g. 0.25) filters out the uncertain boxes. NMS runs per class: boxes of different classes may overlap as much as they like.</p>
  <div class="demo" id="nmDemo">
    <div class="tag">Demo</div><h4>NMS with a movable threshold τ</h4>
    <p class="hint">Five candidates for two objects (number = score). Green = kept, grey dashed = suppressed.</p>
    <div class="ctl"><label for="nmT">IoU threshold τ</label><input type="range" id="nmT" min="0.05" max="0.95" step="0.05" value="0.5"><output id="nmTO"></output></div>
    <svg class="plot" id="nmSvg" viewBox="0 0 300 150" style="max-width:460px" role="img" aria-label="Five candidate boxes for two objects, kept boxes green"></svg>
    <div class="stats"><span>Kept <b id="nmN"></b></span></div>
    <p class="hint" id="nmMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Detection = predict many boxes, then reduce them to a clean list with a score threshold and NMS. IoU is used to assign, to train and to evaluate.</p></div>

  <h3 id="det-map">5 · Evaluation: precision, recall, mAP</h3>
  <p>In detection there is no fixed number of predictions, so counting works differently from <a href="#klass">classification</a>. Per class the predictions are sorted by score and matched one after the other to the ground-truth boxes:</p>
  <ul>
    <li><b>TP</b> (true positive): IoU with a still free ground-truth box ≥ threshold (e.g. 0.5).</li>
    <li><b>FP</b> (false positive): no matching box, or the box was already claimed by a better prediction (a duplicate).</li>
    <li><b>FN</b> (false negative): a ground-truth box that no prediction hit. There are no TN: the places without an object cannot be counted.</li>
  </ul>
  <p>From that follow <b>precision</b> = TP / (TP + FP) (how many boxes are right?) and <b>recall</b> = TP / (TP + FN) (how many objects were found?). Both depend on the score threshold. The <b>average precision (AP)</b> takes all thresholds at once: it is the area under the precision-recall curve.</p>
  <div class="demo" id="apDemo">
    <div class="tag">Demo</div><h4>Precision, recall and AP</h4>
    <p class="hint">An image with 6 people; the detector delivers 10 boxes, sorted by score. Move the score threshold: only the boxes above it count (top of the table). The orange ring shows where you are on the curve; the blue area is the AP.</p>
    <div class="ctl"><label for="apT">Score threshold</label><input type="range" id="apT" min="0.05" max="0.95" step="0.05" value="0.5"><output id="apTO"></output></div>
    <svg class="plot" id="apSvg" viewBox="0 0 320 232" style="max-width:420px" role="img" aria-label="Precision-recall curve with the area AP and the point of the chosen score threshold"></svg>
    <div class="stats"><span>TP <b id="apTP"></b></span><span>FP <b id="apFP"></b></span><span>FN <b id="apFN"></b></span><span>Precision <b id="apP"></b></span><span>Recall <b id="apR"></b></span><span>AP <b id="apAP"></b></span></div>
    <p class="hint" id="apMsg"></p>
    <div class="tablewrap"><table id="apTab"></table></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Metric</th><th>Meaning</th><th>Where</th></tr>
    <tr><td><b>AP</b></td><td>area under the precision-recall curve of one class (precision is smoothed from the right: highest precision at equal or higher recall)</td><td>per class</td></tr>
    <tr><td><b>mAP</b></td><td>mean of the AP over all classes</td><td>standard metric</td></tr>
    <tr><td><b>mAP@0.5</b></td><td>hit from IoU 0.5; forgives inaccurate boxes</td><td>Pascal VOC, YOLO output <code>mAP50</code></td></tr>
    <tr><td><b>mAP@0.5:0.95</b></td><td>mean over 10 IoU thresholds 0.5, 0.55, … 0.95; rewards accurate boxes</td><td>COCO, YOLO output <code>mAP50-95</code></td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>Precision and recall hold for one threshold, AP for all of them together. An mAP number without an IoU threshold is worthless: 0.65 at mAP@0.5 can be 0.40 at mAP@0.5:0.95.</p></div>

  <h3 id="det-seg">6 · Semantic segmentation: one class per pixel</h3>
  <p>The output has <b>the same height and width as the input image</b>: every pixel gets exactly one class (<code>y ∈ {1…C}^(H×W)</code>). There are no boxes and no individual objects; two cars side by side are the same class “car”. Hard parts are exact edges (every wrong border pixel counts), strong <b>class imbalance</b> (background often over 95 % of the pixels, a naive network says “background” everywhere), the mix of small and large structures, and the cost of pixel-exact labels (10 to 100 times more expensive than boxes).</p>
  <figure class="fig" style="max-width:760px"><div style="overflow-x:auto">${F.mask()}</div><figcaption>A mask is an image itself: one channel, a class ID in every pixel. It is saved as PNG, because JPEG would change the values at the edges (class 2 would become 1 or 3). The colours are only for humans; the network sees the numbers.</figcaption></figure>
  <p>The network outputs C scores per pixel, so a tensor H × W × C. Softmax turns them into probabilities, <code>argmax</code> over the channels into the mask. The loss is the cross-entropy averaged pixel by pixel, usually complemented by Dice.</p>
  <p><b>Dice</b> measures the overlap of the predicted and the true mask: <code>2·|A∩B| / (|A| + |B|)</code>. As a loss it complements cross-entropy, because it does not average rare classes away: a network that says “background” everywhere has a high pixel accuracy but Dice 0 for the object. It holds that <code>Dice = 2·IoU / (1 + IoU)</code>, so Dice ≥ IoU. Evaluation uses the <b>IoU</b> per class (averaged: mIoU).</p>
  <div class="demo" id="smDemo">
    <div class="tag">Demo</div><h4>Pixel accuracy, IoU and Dice</h4>
    <p class="hint">A mask of 20 × 14 pixels; the object is small. Choose a prediction or click pixels to switch them. Green = correctly object (TP), orange = too much (FP), red = missed (FN), white = correctly background.</p>
    <div class="btnrow" id="smPre" role="group" aria-label="Prediction"><button data-v="good" class="pri" aria-pressed="true">Good</button><button data-v="big" aria-pressed="false">Too large</button><button data-v="shift" aria-pressed="false">Shifted</button><button data-v="empty" aria-pressed="false">All background</button></div>
    <svg class="plot" id="smSvg" viewBox="0 0 320 224" style="max-width:420px" role="img" aria-label="Mask of 20 × 14 pixels, coloured by TP, FP, FN and TN"></svg>
    <div class="stats"><span>Pixel accuracy <b id="smAcc"></b></span><span>IoU object <b id="smIoU"></b></span><span>Dice object <b id="smDice"></b></span><span>IoU background <b id="smIoB"></b></span><span>mIoU <b id="smM"></b></span></div>
    <p class="hint" id="smMsg"></p>
  </div>
  <div class="falle"><b>Pitfall</b><p>Pixel accuracy is almost worthless for segmentation. With 95 % background, “all background” reaches 95 %. Always report IoU or Dice per class.</p></div>

  <h3 id="det-segmodelle">7 · U-Net and SAM: train or ask</h3>
  <p>There are two ways to segment. With <b>U-Net</b> you train a network of your own on your own masks, for exactly one task. With <b>SAM</b> you take a finished foundation model and tell it with a click which object you want.</p>

  <h4 id="det-unet">U-Net: encoder, decoder, skip connections</h4>
  <figure class="fig" style="max-width:860px"><div style="overflow-x:auto">${F.unet()}</div><figcaption>The encoder is a normal CNN: it shrinks the image and learns <i>what</i> is in it. The decoder enlarges it again up to the full resolution. Without the skip connections (blue dashed) the edges would be blurred, because the exact position is lost in the bottleneck.</figcaption></figure>
  <p>U-Net was developed in 2015 for medical images and learns good masks with only a few hundred images, because the skip connections do not have to learn the fine detail first. The same architecture also serves <a href="#cv-restauration">restoration</a> (denoising, deblurring): then the output is an image instead of a class map. The image size must be divisible by 2<sup>depth</sup> (here 16), otherwise encoder and decoder maps do not fit together when concatenated.</p>
  <pre><code>def conv_block(x, f):                                    # 2× conv 3 × 3 with ReLU
    x = layers.Conv2D(f, 3, padding="same", activation="relu")(x)
    return layers.Conv2D(f, 3, padding="same", activation="relu")(x)

inputs = keras.Input((256, 256, 3)); x = inputs; skips = []
for f in [64, 128, 256, 512]:                            # encoder
    x = conv_block(x, f); skips.append(x)
    x = layers.MaxPooling2D()(x)
x = conv_block(x, 1024)                                  # bottleneck
for f, s in zip([512, 256, 128, 64], reversed(skips)):   # decoder
    x = layers.Conv2DTranspose(f, 2, strides=2)(x)
    x = conv_block(layers.Concatenate()([x, s]), f)      # skip connection
outputs = layers.Conv2D(C, 1, activation="softmax")(x)   # C classes per pixel</code></pre>

  <h4 id="det-sam">SAM: segment anything by prompt</h4>
  <figure class="fig" style="max-width:900px"><div style="overflow-x:auto">${F.sam()}</div><figcaption>The expensive part (image encoder) runs once per image. Every further click only needs the light mask decoder; that is why SAM reacts almost instantly when labelling.</figcaption></figure>
  <p><b>SAM</b> (Segment Anything Model, Meta 2023) was trained on the dataset SA-1B: 11 million images with 1.1 billion masks. That is why it knows object boundaries almost everywhere, even on kinds of images it has never seen (zero-shot). You give a <b>prompt</b>: one or more points (foreground or background), a box or a rough mask. A point is ambiguous (shirt, person or group?), so SAM returns three masks with an estimated IoU score.</p>
  <p>SAM knows <b>no class names</b>: it says “here is an object”, not “here is a car”. For classes you combine it with a detector: the boxes of YOLO or of a text-driven detector (e.g. Grounding DINO) serve as prompts, SAM turns them into exact masks. SAM is also very useful for <b>labelling</b>: one click instead of a tediously drawn polygon; afterwards you train a small, fast model such as U-Net or YOLOv8-seg on these masks.</p>
  <pre><code>from segment_anything import sam_model_registry, SamPredictor

sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")
predictor = SamPredictor(sam)
predictor.set_image(img)                                 # image encoder: once per image (RGB, HWC)
masks, scores, _ = predictor.predict(
    point_coords=np.array([[320, 240]]),                 # one click (x, y)
    point_labels=np.array([1]),                          # 1 = foreground, 0 = background
    multimask_output=True)                               # three masks with a score
best = masks[scores.argmax()]</code></pre>
  <div class="tablewrap"><table>
    <tr><th></th><th>U-Net</th><th>SAM (Segment Anything)</th></tr>
    <tr><td><b>Idea</b></td><td>Encoder-decoder with skip connections. The encoder understands <i>what</i> is in the image; the decoder turns it back into a map at full resolution, the skips provide the exact edges.</td><td>Foundation model, trained once on a billion masks. You give a <b>prompt</b> (point, box, mask) and get the mask of the object.</td></tr>
    <tr><td><b>Training</b></td><td>On your own labels, one model per task</td><td>None needed (zero-shot)</td></tr>
    <tr><td><b>Output</b></td><td>class per pixel</td><td>masks without class names, per prompt</td></tr>
    <tr><td><b>Loss</b></td><td>cross-entropy + λ · Dice</td><td>–</td></tr>
    <tr><td><b>Size</b></td><td>small, also runs on edge devices</td><td>large (ViT-B to ViT-H, about 90 to 640 M parameters)</td></tr>
    <tr><td><b>Limit</b></td><td>Needs labels, transfers poorly</td><td>Knows no classes; combine with a detector or classifier for classes</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>You train U-Net for one task; you ask SAM by prompt. In practice they complement each other: SAM creates the masks quickly, a small network learns the task from them.</p></div>

  <h3 id="det-methoden">8 · Overview: tasks, models, loss, metric</h3>
  <p>The rows correspond to steps 1 to 3 and 8 of the figure “The whole workflow at a glance”.</p>
  <div class="tablewrap"><table>
    <tr><th>Task</th><th>Output</th><th>Models</th><th>Loss</th><th>Metric</th></tr>
    <tr><td><b>Object detection</b></td><td>boxes, classes, scores</td><td>Faster R-CNN, YOLO</td><td>class (BCE/CE) + box (IoU-based)</td><td>mAP@0.5, mAP@0.5:0.95</td></tr>
    <tr><td><b>Semantic segmentation</b></td><td>class per pixel</td><td>U-Net, DeepLab</td><td>cross-entropy + Dice</td><td>IoU, Dice, mIoU</td></tr>
    <tr><td><b>Instance segmentation</b></td><td>box + mask per object</td><td>Mask R-CNN, YOLOv8-seg</td><td>detection loss + mask loss (BCE)</td><td>mask mAP</td></tr>
    <tr><td><b>Masks by prompt</b></td><td>mask without class</td><td>SAM</td><td>– (already trained)</td><td>IoU to the reference mask</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>Detection outputs boxes, segmentation a map with one class per pixel. Both are measured with IoU: detection per box (mAP@IoU), segmentation per class (mIoU). Pretrained backbones show up everywhere.</p></div>

  <h3 id="det-best">9 · Best practices</h3>
  <p>In addition to the <a href="#cnn-best">best practices from CNN</a>, for detection and segmentation:</p>
  <div class="bp-check">
    <div><b>Baseline and model choice</b><ul>
      <li>First test a pretrained model zero-shot on your own images and fine-tune only if a gap remains and suitable data is available.</li>
      <li>Start with the smallest model (YOLOv8n): it trains in minutes and shows whether data and labels are right. Only then go bigger.</li>
      <li>The newest model is not automatically the best: what counts is whether it is built for your task, your images and your hardware.</li>
    </ul></div>
    <div><b>Data and labels</b><ul>
      <li>Check the annotations: look at a few images with the boxes or masks drawn in before training starts. A wrong box format or swapped class IDs show up at once.</li>
      <li>Split by scene or video, not by single frames: nearly identical frames in train and test make the mAP too good.</li>
      <li>Adapt the training images to the place of use: finished models and datasets mostly consist of clean images. If the images in use are blurred, noisy or have a blue cast, alter the clean images in exactly that way (blur, noise, colour cast) and fine-tune with them.</li>
      <li>Watch for domain shift: a model that learned on photos helps little with X-ray or microscope images.</li>
      <li>Small objects: raise <code>imgsz</code> or work in tiles instead of shrinking large images to 640 pixels.</li>
      <li>For segmentation watch the class imbalance: strengthen rare classes with Dice loss or weights. Pre-labelling masks with SAM saves a lot of time.</li>
    </ul></div>
    <div><b>Compare fairly</b><ul>
      <li>Measure all methods on the same test images with the same metric, plus run time and number of parameters.</li>
      <li>For detection state mAP with the IoU threshold (mAP@0.5 or mAP@0.5:0.95), for segmentation IoU or Dice per class.</li>
      <li>Look at boxes and masks on example images: a good mAP can hide systematic errors, e.g. with small or occluded objects.</li>
    </ul></div>
    <div><b>Limits</b><ul>
      <li>Choose the score threshold and the NMS threshold τ on validation, not on the test set.</li>
      <li>Also test on images from other cameras and lighting conditions before the model is used.</li>
    </ul></div>
  </div>
  <div class="merk"><b>Key point</b><p>Check pretrained models zero-shot first, start small, check the annotations and split by scene, always state mAP with its IoU threshold and choose thresholds on validation.</p></div>
`,
  quiz: [
    { q: `What separates semantic segmentation from instance segmentation?`, a: `Semantic segmentation gives every pixel a class; two people side by side are the same area “person”. Instance segmentation gives every object a mask of its own and separates the two people.` },
    { q: `What do backbone, neck, head and post-processing do in a detector?`, a: `<b>Backbone:</b> turns pixels into feature maps. <b>Neck:</b> combines fine and coarse feature maps for small and large objects. <b>Head:</b> predicts per grid cell box, objectness and class. <b>Post-processing:</b> score threshold and NMS remove uncertain boxes and duplicates; this part is not trained.` },
    { q: `What is the difference between classification and object detection in the output?`, a: `Classification: one label per image. Detection: a set of (box, class, score) of unknown size that depends on the image.` },
    { q: `An image is 640 × 480 pixels, the box goes from (64, 120) to (320, 360). What is the YOLO line for class 2?`, a: `Width 256, height 240, centre (192, 240). Normalised: cx = 192 / 640 = 0.3, cy = 240 / 480 = 0.5, w = 256 / 640 = 0.4, h = 240 / 480 = 0.5. Line: <code>2 0.3 0.5 0.4 0.5</code>.` },
    { q: `How does a YOLO model know that output 2 means “car”?`, a: `The network knows no names, it only outputs scores per output. The list <code>names</code> from <code>data.yaml</code> is saved with the model (<code>model.names</code>) and translates the index into the name.` },
    { q: `Compute the IoU: box A has area 100, box B area 100, the intersection 50.`, a: `Union = 100 + 100 − 50 = 150, IoU = 50 / 150 = 0.33. With a threshold of 0.5 this would not be a hit.` },
    { q: `What does NMS do, and what happens with a threshold τ that is too low?`, a: `NMS keeps the box with the highest score, removes all others that have an IoU above τ with it, and repeats this with the remaining boxes. With τ too low, boxes of real neighbouring objects are suppressed too; with τ too high, duplicates remain.` },
    { q: `Faster R-CNN or YOLO: when which?`, a: `Faster R-CNN (two stages) when the highest accuracy and small, densely packed objects matter. YOLO (one stage, anchor-free) when speed matters, e.g. real time, video or edge devices.` },
    { q: `What is an anchor, and which anchor learns an object?`, a: `A predefined box (size and aspect ratio) at every position of the feature map. The network only predicts whether there is an object and how the box has to be shifted and stretched. In training the anchor with the highest IoU to the ground-truth box (and every one above about 0.7) learns the object.` },
    { q: `What is RoI Align for in Faster R-CNN?`, a: `It cuts out the matching part of the feature map for every proposal and brings it to a fixed size (e.g. 7 × 7) without rounding the coordinates. So a head with a fixed input can classify regions of any size.` },
    { q: `Why does YOLO have grids in three scales?`, a: `A small object only has anchor points inside its box on the fine grid (stride 8); a large one needs the context of the coarse grid (stride 32). So the model covers small, medium and large objects.` },
    { q: `Why does the AP not change when you move the score threshold?`, a: `AP is the area under the whole precision-recall curve, which arises from all thresholds. The threshold only picks one point on this curve, i.e. one pair of precision and recall.` },
    { q: `What is the difference between mAP@0.5 and mAP@0.5:0.95?`, a: `mAP@0.5 counts a box as a hit from IoU 0.5 and forgives inaccurate boxes. mAP@0.5:0.95 averages over ten IoU thresholds from 0.5 to 0.95 and rewards accurate boxes; the number is therefore lower.` },
    { q: `How does semantic segmentation differ from detection?`, a: `The output is one class per pixel at the size of the image, without boxes and without telling apart individual objects of the same class.` },
    { q: `Why is pixel accuracy misleading for segmentation, and what do you use instead?`, a: `The background often makes up over 95 % of the pixels; “all background” would have 95 % accuracy. Better IoU or Dice per class (mIoU), and Dice as a loss next to the cross-entropy.` },
    { q: `What are the skip connections in U-Net for?`, a: `They lead the finely resolved feature maps of the encoder directly to the decoder. There they are concatenated, so the exact edges do not have to be reconstructed from the coarse bottleneck.` },
    { q: `What is the difference between U-Net and SAM?`, a: `U-Net is trained on your own labels per task and outputs classes per pixel. SAM is trained once on very many masks and segments by prompt (point, box) without new training, but knows no class names.` },
    { q: `Why does SAM return three masks for a single click?`, a: `A point is ambiguous: it can mean a part (shirt), the whole object (person) or a group. SAM returns three masks with an estimated IoU score; you pick the fitting one.` },
  ],
});
})();
