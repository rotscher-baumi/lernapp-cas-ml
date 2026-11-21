/* English texts for the module "kompakt" (ML cheat sheet). Fields replace the German ones when the language is EN. */
LernApp.translate('kompakt', {
  nav: 'Compact',
  title: 'Everything compact',
  kicker: 'Cheat sheet · Modules 2 and 3',
  summary: `Supervised ML, classification, unsupervised, neural networks, CNN, computer vision, generative models and models in practice on one page`,
  html: `
  <p>The cheat sheet over the chapters <a href="index.html#ml">Supervised ML</a>, <a href="index.html#klass">Classification</a>, <a href="index.html#unsup">Unsupervised</a>, <a href="index.html#nn">Neural Networks</a>, <a href="index.html#cnn">CNN</a>, <a href="index.html#cv">Image Processing</a>, <a href="index.html#det">Object Detection &amp; Segmentation</a>, <a href="index.html#gen">Generative Models</a> and <a href="index.html#modell">Models in practice</a>. The explanations, demos and self-test are in the chapters, profiles of single models in the <a href="index.html#uebersicht">Overview</a>.</p>

  <h3 id="k-ablauf">Supervised ML: workflow and data</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Workflow</b></td><td>Look at the data (EDA), split, prepare (missing values, scaling, categories), train, compare on validation, check once on test.</td></tr>
    <tr><td><b>Split</b></td><td><b>train</b> learns the parameters, <b>validation</b> chooses model and hyperparameters, <b>test</b> is used once at the end. With little data, cross-validation replaces the fixed validation set.</td></tr>
    <tr><td><b>Cross-validation</b></td><td>5-fold CV trains 5 models with the same hyperparameters but different parameters. They only measure; what remains is the average. The final model is then retrained on all training data.</td></tr>
    <tr><td><b>Scaling</b></td><td><code>fit</code> on train only, <code>transform</code> on all. Needed for gradient descent, regularisation, kNN, SVM, k-means, PCA and neural networks. Not needed for trees. Plain linear regression (OLS) does not need it, with gradient descent it helps.</td></tr>
    <tr><td><b>Pipeline</b></td><td>Scaling and model as one unit: in every fold it learns from that fold’s training part only. Prevents data leakage.</td></tr>
    <tr><td><b>Data leakage</b></td><td>Test knowledge flows into training: scaling or imputation before the split, feature selection on all data, resampling before the split, features that do not exist at prediction time. Numbers that look too good are suspicious.</td></tr>
    <tr><td><b>Best practices</b></td><td>Baseline first, split before anything else, everything in one pipeline, choose on validation, test exactly once. Following these five rules avoids most mistakes. <a href="index.html#ml-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#ml-ablauf">To the chapter →</a></p>

  <h3 id="k-reg">Regression, bias/variance, regularisation</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Gradient descent</b></td><td><code>w ← w − lr · gradient</code>. Learning rate too large: jumps or diverges. Too small: crawls. Scaled features help.</td></tr>
    <tr><td><b>Linear regression</b></td><td>Best line (plane) through the data, minimises MSE. Metrics: MAE (in units of <code>y</code>, robust), RMSE (punishes large errors), R².</td></tr>
    <tr><td><b>Underfitting</b></td><td>Error high on train and validation. High bias. More capacity (polynomial degree, features), less regularisation.</td></tr>
    <tr><td><b>Overfitting</b></td><td>Train low, validation clearly higher. High variance. More data, simpler model, regularisation, fewer features.</td></tr>
    <tr><td><b>Ridge / lasso</b></td><td>Ridge (L2) shrinks coefficients. Lasso (L1) sets some to 0 and so selects features. ElasticNet mixes both. Larger alpha = stronger brake. Scale features first.</td></tr>
    <tr><td><b>Hyperparameters</b></td><td>The model learns parameters, you set hyperparameters (alpha, polynomial degree, learning rate). Search with grid search or random search, each with cross-validation.</td></tr>
    <tr><td><b>Feature selection</b></td><td>Filter (correlation, variance), wrapper (RFE), embedded (lasso, trees). Always on train only or inside the CV. Correlation is not causation.</td></tr>
  </table></div>
  <p class="note"><a href="index.html#ml-gd">To the chapter →</a></p>

  <h3 id="k-klass">Classification</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Logistic regression</b></td><td>Linear regression + sigmoid. Returns a probability; the class only comes from the <b>threshold</b> (default 0.5), and you choose it. Loss: cross-entropy.</td></tr>
    <tr><td><b>Confusion matrix</b></td><td>TP, FP, FN, TN. <b>Precision</b> = TP/(TP+FP) (how many alarms are right). <b>Recall</b> = TP/(TP+FN) (how many real cases found). <b>F1</b> = mean of both. Accuracy = all correct / all.</td></tr>
    <tr><td><b>Threshold, ROC, AUC</b></td><td>Lower threshold: more recall, less precision (more false alarms). ROC plots recall against false alarm rate over all thresholds, AUC is the area (0.5 = chance, 1 = perfect). For rare classes also look at precision-recall.</td></tr>
    <tr><td><b>Several classes</b></td><td>One-vs-all (one model per class) or softmax (probabilities sum to 1). Summarise with micro, macro (every class equal) or weighted (by class size).</td></tr>
    <tr><td><b>Imbalanced classes</b></td><td>Accuracy misleads. Look at recall, precision, F1, AUC. Options: <code>class_weight</code>, up/downsampling, SMOTE, adjust threshold. Resampling on train only.</td></tr>
    <tr><td><b>kNN, naive Bayes, SVM, tree</b></td><td>kNN: majority of the k neighbours, scale, large k = smooth. Naive Bayes: fast, assumes independent features. SVM: widest margin, kernel for curvature, scale. Tree: rules, easy to read, tends to overfit (limit depth), no scaling needed.</td></tr>
    <tr><td><b>Ensembles</b></td><td><b>Bagging / random forest</b>: many deep trees on random samples, averaging lowers variance. <b>Boosting</b>: trees one after another, each corrects the errors of the previous, lowers bias, overfits more easily. Start: random forest as baseline.</td></tr>
    <tr><td><b>Best practices</b></td><td>Choose the metric by the cost of errors, set the threshold on validation, compare against the most frequent class and resample only in training. <a href="index.html#klass-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#klass">To the chapter →</a></p>

  <h3 id="k-unsup">Unsupervised learning</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Tasks</b></td><td>Clustering (find groups), anomalies (find outliers), dimensionality reduction (few features instead of many). No target column; labels, if present, stay outside the model.</td></tr>
    <tr><td><b>Scaling</b></td><td>Almost all methods work with distances: scale first (<code>StandardScaler</code>). Exception: isolation forest.</td></tr>
    <tr><td><b>k-means</b></td><td>Round clusters of similar size, set k. Elbow (inertia) and silhouette help choose k; both are suggestions. Start several times with <code>n_init</code>.</td></tr>
    <tr><td><b>Hierarchical</b></td><td>Dendrogram, choose k only when cutting. Good for small data, expensive for large.</td></tr>
    <tr><td><b>DBSCAN</b></td><td>Density-based: arbitrary shapes, finds noise (label −1), no k needed. Parameters <code>eps</code> and <code>min_samples</code>. Struggles with varying density.</td></tr>
    <tr><td><b>GMM</b></td><td>Elliptical clusters with soft assignment (probability per cluster). Number via BIC/AIC.</td></tr>
    <tr><td><b>Checking clusters</b></td><td>Silhouette, stability (other start, other sample), cluster profiles in original units. Good means: stable and sensible for the subject. With labels: ARI as a check.</td></tr>
    <tr><td><b>Isolation forest</b></td><td>Random splits: suspicious points are alone after few splits. Gives a ranking, not a verdict. Refit when normal behaviour changes.</td></tr>
    <tr><td><b>PCA</b></td><td>Linear axes with the largest variance. Scale first. Choose components via cumulative explained variance (e.g. 90 %). Suitable for models and speed.</td></tr>
    <tr><td><b>t-SNE, UMAP</b></td><td>Non-linear 2D maps for exploring. Only neighbourhood counts, not distances or sizes. Do not cluster on the map and do not use it as a basis for models.</td></tr>
    <tr><td><b>Best practices</b></td><td>Scale, choose the method by the cluster shape, fix k with criteria and domain knowledge, check stability and be able to explain every cluster. <a href="index.html#unsup-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#unsup">To the chapter →</a></p>

  <h3 id="k-nn">Neural networks</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Neuron</b></td><td><code>z = w·x + b</code>, <code>a = f(z)</code>. Without a non-linear activation the whole network would be linear.</td></tr>
    <tr><td><b>Activation</b></td><td>ReLU in hidden layers (default), sigmoid in the output for 2 classes, softmax for several classes, linear for regression. Sigmoid and tanh saturate.</td></tr>
    <tr><td><b>Loss</b></td><td>Cross-entropy for classification, MSE or MAE for regression.</td></tr>
    <tr><td><b>Parameters</b></td><td>Dense layer: <code>(n_in + 1) · n_out</code>. Example 784 → 128 → 10: 101,770.</td></tr>
    <tr><td><b>Training</b></td><td>Forward pass, loss, backpropagation (chain rule, from the back), update <code>w ← w − α·∂L/∂w</code>. Random initial weights (Xavier, He), never all equal. Scale the inputs.</td></tr>
    <tr><td><b>Mini-batch, epoch</b></td><td>Update after every mini-batch (<code>batch size</code>), one epoch = all data once. Typical batch size 16 to 256.</td></tr>
    <tr><td><b>Optimizers</b></td><td>SGD, momentum (damps zigzag), RMSProp (step size per parameter), Adam (both, default, learning rate 0.001).</td></tr>
    <tr><td><b>Against overfitting</b></td><td>Early stopping on the validation loss, dropout (0.2 to 0.5, training only), smaller network, more data, data augmentation, L2.</td></tr>
    <tr><td><b>Loss curves</b></td><td>Both high: underfitting. Train low, validation rising again: overfitting. Choose hyperparameters on validation only, test once.</td></tr>
    <tr><td><b>Best practices</b></td><td>Baseline first, start small, overfit one batch, tune the learning rate first, look at the curves and keep the best model with early stopping. <a href="index.html#nn-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#nn">To the chapter →</a></p>

  <h3 id="k-cnn">CNN</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Why not dense?</b></td><td>Too many parameters (32 × 32 × 3 with 512 neurons: about 1.6 million), flattening loses the neighbourhood of the pixels, and a pattern would have to be learned again at every position.</td></tr>
    <tr><td><b>Convolution</b></td><td>A small filter (e.g. 3 × 3) slides over the image and computes a weighted sum at every position. Result: a feature map, high where the pattern fits. Local connections and shared weights.</td></tr>
    <tr><td><b>Output size</b></td><td><code>⌊(n + 2p − k) / s⌋ + 1</code>. <code>padding='valid'</code>: p = 0, the map shrinks. <code>padding='same'</code>: the size stays (with stride 1). Stride 2 roughly halves it.</td></tr>
    <tr><td><b>Pooling</b></td><td>MaxPooling 2 × 2 halves height and width, has no weights and enlarges the field of view of the following layers.</td></tr>
    <tr><td><b>Parameters</b></td><td>Conv2D: <code>(k · k · C_in + 1) · C_out</code>. Example <code>Conv2D(32, (3, 3))</code> on RGB: (3·3·3 + 1) · 32 = 896. The image size does not appear.</td></tr>
    <tr><td><b>Architecture</b></td><td>Conv + pooling blocks, double the filters per block (32, 64, 128), then Flatten or GlobalAveragePooling and Dense with softmax. Loss: (sparse) categorical cross-entropy, Adam.</td></tr>
    <tr><td><b>Against overfitting</b></td><td>Data augmentation (flip, rotate, zoom; only in training, suited to the task), dropout, batch normalization, early stopping.</td></tr>
    <tr><td><b>Transfer learning</b></td><td>Freeze a pretrained network (e.g. from <code>keras.applications</code>), train a new head. Then fine-tune the upper layers with a very small learning rate. First choice with few images.</td></tr>
    <tr><td><b>Best practices</b></td><td>Transfer learning first, take over the network's preprocessing, only realistic augmentation, split by source and look at the misclassified images. <a href="index.html#cnn-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#cnn">To the chapter →</a></p>

  <h3 id="k-cv">Image Processing</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Image formation</b></td><td>The measured image is the true image, blurred by the optics (PSF), plus noise, then demosaicing and compression. That is why no image is perfect.</td></tr>
    <tr><td><b>Pixels and channels</b></td><td>An image is an array (H, W, C): greyscale C = 1, RGB 3, RGBA 4 (alpha = opacity). Access <code>img[y, x]</code>, row before column. OpenCV loads BGR instead of RGB.</td></tr>
    <tr><td><b>dtype and memory</b></td><td><code>uint8</code>: 0 to 255, 1 byte. For networks <code>float32</code> 0.0 to 1.0, 4 bytes. Memory = H · W · C · bytes: 224 × 224 × 3 in float32 ≈ 0.6 MB, a batch of 32 about 19 MB.</td></tr>
    <tr><td><b>HWC or CHW</b></td><td>NumPy, PIL, OpenCV and TensorFlow: HWC (channels last). PyTorch: CHW. The wrong order gives errors or nonsense.</td></tr>
    <tr><td><b>File formats</b></td><td>PNG lossless, good for masks and graphics. JPEG lossy, small, for photos; never for label masks. Metadata (EXIF) can hold the orientation.</td></tr>
    <tr><td><b>Restoration</b></td><td>Denoising, deblurring, super-resolution: image in, image out. Classical (Gaussian, median, Wiener, bicubic) or learned (U-Net, SwinIR, Restormer). Loss L1 or perceptual, metric PSNR and SSIM.</td></tr>
    <tr><td><b>Best practices</b></td><td>Classical baseline first, test pretrained models zero-shot first, degrade realistically (alter clean training images to look like the images at the deployment site: blur, noise, colour cast), compare fairly on the same test images (a few hundredths of a dB PSNR are chance, good networks are 2 to 4 dB above bicubic) and look at images, not just numbers. <a href="index.html#cv-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#cv">To the chapter →</a></p>

  <h3 id="k-det">Object Detection &amp; Segmentation</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Four tasks</b></td><td>Classification (one label), object detection (boxes), semantic segmentation (class per pixel), instance segmentation (mask per object). The finer the output, the more expensive the labels.</td></tr>
    <tr><td><b>Box formats</b></td><td>xyxy (corners, pixels; VOC, torchvision), xywh (corner + size, pixels; COCO), YOLO <code>class cx cy w h</code> normalised to 0 to 1, one <code>.txt</code> per image. Index → name via <code>names</code> (<code>model.names</code>).</td></tr>
    <tr><td><b>Object detection</b></td><td>Boxes, classes, scores. Structure: backbone → neck → head → post-processing (score threshold + NMS). <b>IoU</b> = intersection / union. <b>NMS</b> removes duplicate boxes.</td></tr>
    <tr><td><b>Faster R-CNN</b></td><td>Two stages: the RPN proposes regions with anchors, RoI Align cuts out 7 × 7 features, the head determines class (C + 1 with background) and box. Accurate, slower. Mask R-CNN adds a mask per region.</td></tr>
    <tr><td><b>YOLO</b></td><td>One stage, anchor-free from v8: grids 80 / 40 / 20 (stride 8 / 16 / 32) at 640 px, per anchor point box + class scores, 8400 candidates. Small objects on P3, large ones on P5. Loss BCE + CIoU + DFL. Sizes n to x.</td></tr>
    <tr><td><b>mAP</b></td><td>TP: IoU ≥ threshold with a free ground-truth box; FP: none or already taken; FN: missed. AP = area under the precision-recall curve (all score thresholds), mAP = mean over classes. mAP@0.5 (VOC) or mAP@0.5:0.95 (COCO, 10 thresholds).</td></tr>
    <tr><td><b>Semantic segmentation</b></td><td>One class per pixel; the mask is a PNG with one class ID per pixel. Output H × W × C, <code>argmax</code> gives the mask. Loss cross-entropy + Dice, metric IoU, Dice, mIoU; pixel accuracy deceives under class imbalance.</td></tr>
    <tr><td><b>U-Net and SAM</b></td><td>U-Net: the encoder shrinks, the decoder enlarges, skip connections concatenate the fine maps; image size divisible by 2<sup>depth</sup>, trained per task. SAM: foundation model (SA-1B, 1.1 billion masks), image encoder once per image, prompt (point, box) → three masks with a score, knows no class names; good for labelling.</td></tr>
    <tr><td><b>Best practices</b></td><td>Test pretrained models zero-shot first, start small (YOLOv8n), check the annotations and split by scene or video, always report mAP with its IoU threshold (mAP@0.5 or mAP@0.5:0.95), choose the score threshold and τ on validation and look at boxes and masks. <a href="index.html#det-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#det">To the chapter →</a></p>

  <h3 id="k-gen">Generative models</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Idea</b></td><td>A generative model learns the distribution of the data (without labels) and creates new examples that look like the real ones.</td></tr>
    <tr><td><b>Autoencoder</b></td><td>Encoder → latent space <code>z</code> (small) → decoder. Loss: reconstruction. Good for compression, denoising, anomalies (high reconstruction error). Not a usable generator, because the latent space has gaps.</td></tr>
    <tr><td><b>VAE</b></td><td>The encoder outputs μ and σ, <code>z = μ + σ · ε</code> (reparameterization trick, so backpropagation can pass). Loss: reconstruction + KL to N(0, 1). Ordered latent space, stable, images somewhat blurry.</td></tr>
    <tr><td><b>PixelCNN</b></td><td>Creates pixel by pixel, each depending on the previous ones (masked convolution). True likelihood, simple training, very slow generation.</td></tr>
    <tr><td><b>GAN</b></td><td>Generator against discriminator, two losses in turn. Very sharp images, but unstable training and mode collapse (only a few images left). Variants: CycleGAN (style without paired examples), ESRGAN (super-resolution), DeblurGAN.</td></tr>
    <tr><td><b>Choice</b></td><td>A trade-off between sharpness (GAN), stability and latent space (VAE) and likelihood (PixelCNN).</td></tr>
    <tr><td><b>Best practices</b></td><td>Look at images, not just the loss, check diversity and copies, compare scores only with the same settings and label generated images. <a href="index.html#gen-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#gen">To the chapter →</a></p>

  <h3 id="k-modell">Models in practice</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>What is a model?</b></td><td><code>ŷ = f(x; θ)</code>: architecture (shape of the function, you choose it), parameters θ (learned by training), hyperparameters (steer the training, you choose them on validation). Training changes the parameters, inference (<code>predict</code>) does not.</td></tr>
    <tr><td><b>Where from?</b></td><td>Train yourself (tabular data, your own task), take a finished one (zero-shot), transfer learning (freeze the base, new head; little data) or fine-tuning (upper layers with a small learning rate; more data).</td></tr>
    <tr><td><b>Saving</b></td><td>Save the whole pipeline, not only the estimator: without the scaler the loaded model computes nonsense, with no error message. Add metadata (version, date, metric, library versions) and a model card.</td></tr>
    <tr><td><b>Formats</b></td><td>scikit-learn: joblib. Keras: <code>.keras</code>. PyTorch: <code>state_dict</code>. Exchange: ONNX. Careful: pickle and joblib run code when loading; load foreign files only as <code>.safetensors</code> or with <code>weights_only=True</code>.</td></tr>
    <tr><td><b>Drift</b></td><td>Data drift: the inputs are distributed differently. Concept drift: the relationship between x and y changes. Detect it by monitoring inputs and the metric in production.</td></tr>
    <tr><td><b>Retraining</b></td><td>Completely new (old + new data), only on new data (forgets rare old cases), continue training (<code>partial_fit</code>, risk: catastrophic forgetting) or only a new head. The new version must be better on fixed and current test data, otherwise the old one stays. Never put test data into training.</td></tr>
    <tr><td><b>Best practices</b></td><td>Test pretrained models zero-shot on your own data first, choose by constraints rather than release date, fine-tune only with enough suitable data. Save the pipeline with metadata and a model card, monitor inputs and metric in use, keep the old version for a rollback. <a href="index.html#mo-best">→</a></td></tr>
  </table></div>
  <p class="note"><a href="index.html#modell">To the chapter →</a></p>
`,
});
