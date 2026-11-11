/* English texts for the module "kompakt" (ML cheat sheet). Fields replace the German ones when the language is EN. */
LernApp.translate('kompakt', {
  nav: 'Compact',
  title: 'Everything compact',
  kicker: 'Cheat sheet · Modules 2 and 3',
  summary: `Supervised ML, classification, unsupervised and neural networks on one page`,
  html: `
  <p>The cheat sheet over the chapters <a href="index.html#ml">Supervised ML</a>, <a href="index.html#klass">Classification</a>, <a href="index.html#unsup">Unsupervised</a> and <a href="index.html#nn">Neural Networks</a>. The explanations, demos and self-test are in the chapters, profiles of single models in the <a href="index.html#uebersicht">Overview</a>.</p>

  <h3 id="k-ablauf">Supervised ML: workflow and data</h3>
  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Workflow</b></td><td>Look at the data (EDA), split, prepare (missing values, scaling, categories), train, compare on validation, check once on test.</td></tr>
    <tr><td><b>Split</b></td><td><b>train</b> learns the parameters, <b>validation</b> chooses model and hyperparameters, <b>test</b> is used once at the end. With little data, cross-validation replaces the fixed validation set.</td></tr>
    <tr><td><b>Cross-validation</b></td><td>5-fold CV trains 5 models with the same hyperparameters but different parameters. They only measure; what remains is the average. The final model is then retrained on all training data.</td></tr>
    <tr><td><b>Scaling</b></td><td><code>fit</code> on train only, <code>transform</code> on all. Needed for gradient descent, regularisation, kNN, SVM, k-means, PCA and neural networks. Not needed for trees. Plain linear regression (OLS) does not need it, with gradient descent it helps.</td></tr>
    <tr><td><b>Pipeline</b></td><td>Scaling and model as one unit: in every fold it learns from that fold’s training part only. Prevents data leakage.</td></tr>
    <tr><td><b>Data leakage</b></td><td>Test knowledge flows into training: scaling or imputation before the split, feature selection on all data, resampling before the split, features that do not exist at prediction time. Numbers that look too good are suspicious.</td></tr>
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
  </table></div>
  <p class="note"><a href="index.html#nn">To the chapter →</a></p>
`,
});
