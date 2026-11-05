/* English texts for the module "klass" (Supervised Learning: classification). Fields replace the German ones when the language is EN. */
LernApp.translate('klass', {
  nav: 'Classification',
  title: `Supervised Learning: classification`,
  kicker: `Module 2 · Supervised Learning, day 2 (Fri 30.10.)`,
  summary: `Logistic regression, metrics, imbalance, trees, ensembles, leakage`,
  html: `  <p>Same idea as on day 1 (examples with a known answer), but the answer is now a <b>class</b> instead of a number: fraud yes/no, spam yes/no, cat/dog/bird. Everything from day 1 still applies: train/test, cross-validation, scaling, regularisation, hyperparameter search.</p>
  <div class="grid2">
    <div><h4>Regression</h4><p>Predicts a number (price, temperature). Error: MSE, MAE.</p></div>
    <div><h4>Classification</h4><p>Predicts a class (yes/no, A/B/C). Error: cross-entropy, metrics such as Precision and Recall.</p></div>
  </div>
  <p class="note">Every regression problem can be turned into classes by dividing the target into ranges («bins»), for example blood pressure into normal / raised / high. This simplifies things and makes results easier to explain, but it costs information.</p>

  <h3>1 · Logistic regression</h3>
  <p>Despite the name, a classifier. The idea: compute <code>z = w·x + b</code> as in linear regression. This z can be arbitrarily large or small. The <b>sigmoid function</b> squeezes it into the range 0 to 1 and turns it into a <b>probability</b>:</p>
  <pre><code>p = 1 / (1 + e^(-z))      z = w1*x1 + w2*x2 + ... + b</code></pre>
  <p>A <b>threshold</b> (default 0.5) turns the probability into a class: p above the threshold means «positive», otherwise «negative». The point where p is exactly 0.5 (z = 0) is the <b>decision boundary</b>.</p>
  <div class="demo" id="sgDemo">
    <div class="tag">Demo</div><h4>Sigmoid and decision boundary</h4>
    <svg class="plot" id="sgSvg" viewBox="0 0 320 190" role="img" aria-label="Sigmoid curve with data points of classes 0 and 1"></svg>
    <div class="ctl"><label for="sgW">Steepness w</label><input type="range" id="sgW" min="0.2" max="4" step="0.1" value="1"><output id="sgWO"></output></div>
    <div class="ctl"><label for="sgB">Shift b</label><input type="range" id="sgB" min="-4" max="4" step="0.1" value="0"><output id="sgBO"></output></div>
    <div class="stats"><span>Boundary at x = <b id="sgBd"></b></span><span>correctly classified <b id="sgAcc"></b></span></div>
    <p class="hint">Filled points are class 1, empty ones class 0. The curve is the predicted probability for class 1. A large steepness makes the model more «certain», but also harsher on the two mixed points around x = 0. Training does not use MSE but <b>cross-entropy</b> (it punishes confident wrong answers very hard) and gradient descent as on day 1.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Continued: the 10 apartments from day 1</h4>
  <p>Same apartments, same axis (m²), only the question changes. Day 1: <i>How much does the apartment cost?</i> Now: <i>Is it expensive?</i> For this you set a price threshold, <code>expensive = 1</code> if the price is above it, otherwise 0. Both models compute the same <code>z = b + w·m²</code>. The only difference is what happens to z:</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Linear regression</th><th>Logistic regression</th></tr>
    <tr><td>Question</td><td>How expensive?</td><td>Expensive yes/no?</td></tr>
    <tr><td>Output</td><td><code>price = z</code></td><td><code>P(expensive) = 1 / (1 + e^(-z))</code></td></tr>
    <tr><td>Range of values</td><td>any, including negative</td><td>always between 0 and 1</td></tr>
    <tr><td>Target in the data</td><td>real price</td><td>0 or 1</td></tr>
    <tr><td>Error measure</td><td>MSE (distance to the line)</td><td>Cross-entropy</td></tr>
  </table></div>
  <div class="demo" id="lgDemo">
    <div class="tag">Demo</div><h4>From the price line to a probability</h4>
    <svg class="plot" id="lgSvg" viewBox="0 0 320 230" role="img" aria-label="10 apartments: m² against price with a line, or m² against probability of expensive with a sigmoid curve"></svg>
    <div class="btnrow"><button class="pri" id="lgLin">Price (linear)</button><button id="lgLog">Expensive yes/no (logistic)</button></div>
    <div class="ctl"><label for="lgT">Price threshold «expensive»</label><input type="range" id="lgT" min="1500" max="2300" step="50" value="1800"><output id="lgTO"></output></div>
    <div class="stats"><span id="lgForm"></span></div>
    <div class="stats"><span>Boundary at <b id="lgBd"></b> m²</span><span id="lgOdds"></span></div>
    <p class="hint">Filled points are «expensive». <b>Linear:</b> The line is the model from day 1, the dashed line is the price threshold. Where the line crosses the threshold there is a kind of boundary, but the line only tells you a price, not a probability. <b>Logistic:</b> The same z goes through the sigmoid function, and the curve is P(expensive). The boundary is where P = 0.5 (z = 0). If you move the threshold, classes and boundary move with it. The weights come from gradient descent with light regularisation (without it, w would grow to infinity on cleanly separable data).</p>
  </div>
  <div class="falle"><b>Pitfall (fitting a line to 0/1)</b><p>You could also fit a linear regression directly to the values 0 and 1. It then gives values below 0 and above 1, which cannot be read as a probability, and single extreme apartments pull the line, and with it the boundary, away. The sigmoid curve stays between 0 and 1.</p></div>
  <p><b>What does the weight w mean?</b> In linear regression: «10 m² more, on average w·10 CHF more». In logistic regression, w acts on the <b>log-odds</b>: <code>ln(p / (1 - p)) = z</code>. These are linear in m². 10 m² more increase z by 10·w, and the odds (p against 1-p) are multiplied by the factor <code>e^(10·w)</code>.</p>
  <div class="demo" id="lsDemo">
    <div class="tag">Demo</div><h4>Why cross-entropy instead of MSE?</h4>
    <svg class="plot" id="lsSvg" viewBox="0 0 320 190" role="img" aria-label="Error as a function of the predicted probability for an apartment that really is expensive"></svg>
    <div class="ctl"><label for="lsP">Predicted P(expensive)</label><input type="range" id="lsP" min="1" max="99" step="1" value="10"><output id="lsPO"></output></div>
    <div class="stats"><span>Cross-entropy <b id="lsCE"></b></span><span>MSE <b id="lsMS"></b></span></div>
    <p class="hint">The apartment really is expensive (y = 1). If the model says only 1 % probability, it is confident and wrong. The cross-entropy (−ln p, solid) then shoots up steeply and forces the model to correct itself. The squared error ((1−p)², dashed) stays at most 1. Combined with the sigmoid, its gradient becomes almost 0 for confident wrong predictions, so the model hardly corrects itself.</p>
  </div>
  <pre><code>from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X_train, y_train)
clf.predict(X_test)          # classes (0/1)
clf.predict_proba(X_test)    # probabilities per class</code></pre>
  <div class="merk"><b>Key takeaway</b><p>Logistic regression = linear regression + sigmoid. The model first gives a probability; the class only comes from the threshold. The threshold is your decision, not the model's.</p></div>

  <h3 id="klass-metriken">2 · How good is a classifier? Confusion Matrix and metrics</h3>
  <p>Every prediction falls into one of four boxes. Memory aid: the second letter is what the model says (positive/negative), the first is whether it is correct (True/False).</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Model says positive</th><th>Model says negative</th></tr>
    <tr><td><b>actually positive</b></td><td class="b">TP (correctly detected)</td><td class="r">FN (missed)</td></tr>
    <tr><td><b>actually negative</b></td><td class="r">FP (false alarm)</td><td class="b">TN (correctly rejected)</td></tr>
  </table></div>
  <div class="tablewrap"><table>
    <tr><th>Measure</th><th>Formula</th><th>Question behind it</th></tr>
    <tr><td>Accuracy</td><td><code>(TP+TN) / all</code></td><td>How often am I right overall?</td></tr>
    <tr><td>Precision</td><td><code>TP / (TP+FP)</code></td><td>When I say «positive»: how often is that right?</td></tr>
    <tr><td>Recall (sensitivity)</td><td><code>TP / (TP+FN)</code></td><td>How many of the real positives do I find?</td></tr>
    <tr><td>F1</td><td><code>2·TP / (2·TP+FP+FN)</code></td><td>An average of Precision and Recall</td></tr>
  </table></div>
  <div class="falle"><b>Pitfall (accuracy)</b><p>With rare classes, accuracy is misleading. A model that always says «no fraud» has 99 % accuracy with 1 fraud in 100 cases, but never finds a fraud (Recall 0, F1 0). With imbalanced data, look at Precision, Recall, F1 and AUC.</p></div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Moving the threshold: Precision against Recall</h4>
  <p>If you lower the threshold, the model says «positive» more often: more TP, but also more FP. Recall rises (or stays the same), Precision usually falls. It is a <b>trade-off</b>, and which side matters more depends on the problem. In early cancer detection you hardly want to miss anything (high Recall); in a spam filter you do not want to delete any real mail (high Precision).</p>
  <p>The <b>ROC curve</b> plots, for all thresholds, the hit rate (TPR = Recall) against the false alarm rate (FPR). A perfect model lies at the top left, guessing lies on the diagonal. The <b>AUC</b> is the area under the curve: 1 is perfect, 0.5 is chance.</p>
  <div class="demo" id="thDemo">
    <div class="tag">Demo</div><h4>Threshold, Confusion Matrix and ROC</h4>
    <p class="hint">Choose how many actual positives and negatives there are (sliders are logarithmic, 1 to 1000). The shape of the model probabilities stays the same: most cases are clear-cut, only a few are borderline (exactly 4 at 10 and 10).</p>
    <div class="btnrow"><button class="pri" id="thP1">10 : 10 (balanced)</button><button id="thP2">10 : 1000 (rare)</button><button id="thP3">1 : 1000 (very rare)</button></div>
    <div class="ctl"><label for="thNP">Number of actual positives</label><input type="range" id="thNP" min="0" max="3" step="0.05" value="1"><output id="thNPO"></output></div>
    <div class="ctl"><label for="thNN">Number of actual negatives</label><input type="range" id="thNN" min="0" max="3" step="0.05" value="1"><output id="thNNO"></output></div>
    <svg class="plot" id="thSvg" viewBox="0 0 320 170" role="img" aria-label="Probabilities of all cases on one axis with threshold"></svg>
    <div class="ctl"><label for="thT">Threshold</label><input type="range" id="thT" min="0.02" max="0.98" step="0.01" value="0.5"><output id="thTO"></output></div>
    <div class="tablewrap"><table style="min-width:0">
      <tr><th></th><th class="num">says positive</th><th class="num">says negative</th></tr>
      <tr><td>actually positive</td><td class="num b" id="thTP"></td><td class="num r" id="thFN"></td></tr>
      <tr><td>actually negative</td><td class="num r" id="thFP"></td><td class="num b" id="thTN"></td></tr>
    </table></div>
    <div class="tablewrap"><table style="min-width:0">
      <tr><th>Metric</th><th>Formula</th><th class="num">with numbers</th><th class="num">Value</th></tr>
      <tr><td>Accuracy</td><td><code>(TP+TN) / all</code></td><td class="num" id="thAccF"></td><td class="num b" id="thAcc"></td></tr>
      <tr><td>Precision</td><td><code>TP / (TP+FP)</code></td><td class="num" id="thPreF"></td><td class="num b" id="thPre"></td></tr>
      <tr><td>Recall (TPR)</td><td><code>TP / (TP+FN)</code></td><td class="num" id="thRecF"></td><td class="num b" id="thRec"></td></tr>
      <tr><td>False Alarm Rate (FPR)</td><td><code>FP / (FP+TN)</code></td><td class="num" id="thFprF"></td><td class="num b" id="thFpr"></td></tr>
      <tr><td>F1</td><td><code>2·TP / (2·TP+FP+FN)</code></td><td class="num" id="thF1F"></td><td class="num b" id="thF1"></td></tr>
    </table></div>
    <div class="stats"><span>AUC <b id="thAuc"></b></span><span>Share of positives <b id="thPrev"></b></span><span>Accuracy of «always negative» <b id="thBase"></b></span></div>
    <p class="hint" id="thMsg">&nbsp;</p>
    <svg class="plot" id="thRoc" viewBox="0 0 320 210" role="img" aria-label="ROC curve with the current threshold point" style="margin-top:12px"></svg>
    <p class="hint">Top: circle = actually positive, square = actually negative (with many cases only a selection is drawn). Everything to the right of the line is predicted as positive. Bottom: the orange point moves along the ROC curve as you slide the threshold: a higher threshold (line to the right) moves it down and to the left, a lower threshold up and to the right.</p>
  </div>
  <div class="merk"><b>Summary: threshold, ROC, AUC</b><ul>
    <li><b>Threshold:</b> The model gives probabilities; only the threshold turns them into classes. Lower threshold = more Recall, more false alarms.</li>
    <li><b>ROC:</b> Each threshold gives a point (FPR, TPR). The ROC curve connects all points.</li>
    <li><b>AUC:</b> Area under the ROC curve, independent of the threshold. 1 = perfect, 0.5 = chance. You then choose the threshold based on the costs of the errors.</li>
  </ul></div>

  <h3>3 · More than two classes</h3>
  <ul>
    <li><b>One-vs-All</b>: One two-class model per class («this class against all others»). The class with the highest probability wins.</li>
    <li><b>Softmax</b>: The generalisation of the sigmoid function to several classes. All probabilities are positive and add up to 1.</li>
  </ul>
  <p>Evaluation is per class: you treat each class in turn as «positive» and all others as «negative», and so get TP, FP, FN, TN and Precision/Recall/F1 for each class. You can combine them in two ways:</p>
  <ul>
    <li><b>Micro</b>: First add up all TP, FP, FN over all classes, then compute the measures. If every case has exactly one label (normal multiclass), micro-Precision = micro-Recall = micro-F1 = accuracy.</li>
    <li><b>Macro</b>: Compute the measures per class and average them unweighted; every class counts the same.</li>
    <li><b>Weighted</b>: Like macro, but weighted by class size, so that large classes count more.</li>
  </ul>
  <pre><code>from sklearn.metrics import classification_report, confusion_matrix
print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred))   # Precision, Recall, F1 per class + averages</code></pre>

  <h3>4 · Imbalanced classes</h3>
  <p>Often the interesting thing is rare: fraud, defects, diseases. A model can then ignore the minority and still look «good». Two things need doing: measure correctly (not accuracy) and adjust the data or the training.</p>
  <div class="demo" id="imDemo">
    <div class="tag">Demo</div><h4>Why accuracy deceives</h4>
    <div class="ctl"><label for="imP">Share of positives</label><input type="range" id="imP" min="0.5" max="50" step="0.5" value="1"><output id="imPO"></output></div>
    <p class="hint">1000 cases. Comparison: «Always negative» against a real model with 80 % Recall and 10 % false alarms among the negatives.</p>
    <div class="tablewrap"><table style="min-width:0">
      <tr><th></th><th class="num">Accuracy</th><th class="num">Precision</th><th class="num">Recall</th><th class="num">F1</th></tr>
      <tr><td>Always negative</td><td class="num" id="imA1"></td><td class="num" id="imP1"></td><td class="num" id="imR1"></td><td class="num" id="imF1"></td></tr>
      <tr><td>Real model</td><td class="num" id="imA2"></td><td class="num" id="imP2"></td><td class="num" id="imR2"></td><td class="num" id="imF2"></td></tr>
    </table></div>
    <p class="hint" id="imMsg"></p>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Strategy</th><th>Idea</th><th>Risk</th></tr>
    <tr><td>Downsampling</td><td>Randomly take only as many cases from the majority class as the minority has</td><td>Throws information away</td></tr>
    <tr><td>Upsampling</td><td>Randomly duplicate minority cases (with replacement)</td><td>Overfitting on the duplicates</td></tr>
    <tr><td>SMOTE</td><td>Create new artificial minority cases between real neighbours: <code>s = x + (x' − x) · random</code></td><td>Can create noise; needs <code>imblearn</code></td></tr>
    <tr><td>Cost weighting</td><td>Errors on the minority count more (<code>class_weight="balanced"</code>)</td><td>Probabilities are distorted afterwards (no longer calibrated); otherwise often the simplest choice</td></tr>
  </table></div>
  <div class="falle"><b>Pitfall</b><p>Resampling (up/downsampling, SMOTE) belongs <b>only on the training data</b>, never on the test set. Otherwise you evaluate on artificial data and get numbers that look too good.</p></div>

  <h3 id="klass-modelle">5 · Non-linear classifiers</h3>
  <p>Logistic regression draws a <b>straight</b> boundary. If the classes cannot be separated that cleanly, you need more flexible models.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">What does each model optimise?</h4>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>It optimises …</th><th>How</th></tr>
    <tr><td><b>Logistic regression</b></td><td>Log loss (cross-entropy)</td><td>Gradient descent on the weights, optionally with regularisation</td></tr>
    <tr><td><b>kNN</b></td><td>nothing (no training)</td><td>The data is only stored. You choose k and the distance measure via validation.</td></tr>
    <tr><td><b>Naive Bayes</b></td><td>Likelihood of the training data</td><td>Counting, or mean and spread per class, closed-form formula without iteration</td></tr>
    <tr><td><b>SVM</b></td><td>Hinge loss + wide margin (small ‖w‖²)</td><td>C weighs errors against the margin. The problem is convex, there is one global optimum.</td></tr>
    <tr><td><b>Decision tree</b></td><td>Impurity (Gini or entropy)</td><td>Greedy: at each node the split that lowers the impurity the most</td></tr>
    <tr><td><b>Random Forest</b></td><td>like the tree, per tree</td><td>Bagging: trees on samples, the majority decides. No joint optimisation.</td></tr>
    <tr><td><b>Boosting</b></td><td>Loss (e.g. log loss) over all trees</td><td>Each new tree follows the gradient of the loss, so it corrects the remaining error</td></tr>
    <tr><td><b>Neural network</b></td><td>Cross-entropy</td><td>Backpropagation and gradient descent on all weights</td></tr>
  </table></div>
  <p class="note"><b>Loss and metric are different things:</b> the model optimises a loss that can be differentiated (log loss, hinge, Gini). Afterwards it is judged with precision, recall, F1 or AUC. These are usually not optimised directly during training. You choose the threshold only afterwards.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">What is each model good for, and what not?</h4>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>Good for …</th><th>Less good …</th></tr>
    <tr><td><b>Logistic regression</b></td><td><ul style="margin:0;padding-left:18px"><li>Probabilities and well explainable weights</li><li>a fast, stable starting point (baseline)</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Straight boundaries only: curved shapes need extra features</li><li>Needs scaling, sensitive to outliers</li></ul></td></tr>
    <tr><td><b>kNN</b></td><td><ul style="margin:0;padding-left:18px"><li>Simple, there is no training</li><li>follows curved, local patterns too</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Slow with lots of data: every prediction computes against all points</li><li>Weak with many features and unequal scales</li></ul></td></tr>
    <tr><td><b>Naive Bayes</b></td><td><ul style="margin:0;padding-left:18px"><li>Very fast, even with little data</li><li>Many features, e.g. text and spam</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>The assumption of independent features rarely holds</li><li>Probabilities are often poorly calibrated</li></ul></td></tr>
    <tr><td><b>SVM</b></td><td><ul style="margin:0;padding-left:18px"><li>Strong with small to medium data and many features</li><li>Curved boundaries too with a kernel</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Slow with very many rows</li><li>No direct probabilities; scaling, C and kernel must be tuned</li></ul></td></tr>
    <tr><td><b>Decision tree</b></td><td><ul style="margin:0;padding-left:18px"><li>Easy to read and explain</li><li>No scaling needed, mixes numbers and categories</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Overfitting at large depth</li><li>Unstable: small data changes can give a different tree</li></ul></td></tr>
    <tr><td><b>Random Forest</b></td><td><ul style="margin:0;padding-left:18px"><li>Robust all-rounder with little tuning</li><li>Shows the importance of the features</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Harder to explain than a single tree</li><li>Larger and slower at prediction</li></ul></td></tr>
    <tr><td><b>Boosting</b></td><td><ul style="margin:0;padding-left:18px"><li>Often the best accuracy on tabular data</li><li>Copes well with mixed features and gaps</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>More hyperparameters, can overfit noise</li><li>Trees are built one after the other, not in parallel</li></ul></td></tr>
    <tr><td><b>Neural network</b></td><td><ul style="margin:0;padding-left:18px"><li>Learns very complex patterns, especially in images, text and audio</li><li>Grows with the data: more data, better results</li></ul></td><td><ul style="margin:0;padding-left:18px"><li>Needs lots of data and computing time</li><li>Black box, many settings</li></ul></td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">k-nearest neighbours (kNN)</h4>
  <p>For a new point you look for the k nearest training points and take the majority class (for regression the average). There is no training, but prediction is slow with a lot of data. k controls bias and variance: <b>k = 1</b> follows every point (overfitting), <b>k = N</b> predicts the majority class for everyone (underfitting).</p>
  <div class="demo" id="knDemo">
    <div class="tag">Demo</div><h4>kNN: effect of k</h4>
    <svg class="plot" id="knSvg" viewBox="0 0 320 220" role="img" aria-label="Two groups of training points (blue and orange) and a start point with its k nearest neighbours"></svg>
    <div class="ctl"><label for="knK">k</label><input type="range" id="knK" min="1" max="39" step="2" value="1"><output id="knKO"></output></div>
    <div class="stats"><span>Training accuracy <b id="knTr"></b></span><span>Test accuracy (new points) <b id="knTe"></b></span></div>
    <p class="hint" id="knMsg"></p>
    <p class="hint">The diamond «Start point» = the new point whose class you are looking for (a click into the image moves it). The lines lead to its k nearest neighbours, the dashed circle shows the reach. The diamond takes the colour of the majority.</p>
  </div>
  <p class="note"><b>With the 10 apartments:</b> A new apartment with 76 m². The nearest neighbours on the m² axis are 78 m² (expensive), 70 m² (not expensive) and 85 m² (expensive). With <b>k = 1</b> the 78 m² one decides alone: expensive. With <b>k = 3</b>, 2 out of 3 vote for expensive. With <b>k = 10</b> (all) it is 5 to 5; there is no majority decision any more.</p>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Naive Bayes</h4>
  <p>Uses Bayes' theorem to compute how likely a class is given the observed features, and «naively» pretends the features are independent of each other. Example from the slides: do we play when it is sunny? Out of 14 days, 9 were play days and 5 were sunny; on 3 of the 9 play days the sun was shining.</p>
  <pre><code>P(Ja | sonnig) = P(sonnig | Ja) * P(Ja) / P(sonnig)
               = (3/9) * (9/14) / (5/14) = 0.60</code></pre>
  <p class="note"><b>With the 10 apartments:</b> Feature «large» = more than 74 m². 5 of 10 apartments are expensive, and all 5 are large, none of the other 5. So <code>P(large | expensive) = 5/5 = 1</code> and <code>P(large | not expensive) = 0/5 = 0</code>. This gives <code>P(expensive | large) = 1</code>: certain, only because we have never seen a combination. This is the <b>zero-frequency problem</b>. The remedy is smoothing (Laplace: add 1 to every count): <code>P(large | expensive) = 6/7</code>, <code>P(large | not expensive) = 1/7</code>, so <code>P(expensive | large) = 6/7 ≈ 0.86</code>.</p>
  <div class="demo" id="nbDemo">
    <div class="tag">Demo</div><h4>Naive Bayes: floor area and prior</h4>
    <svg class="plot" id="nbSvg" viewBox="0 0 320 170" role="img" aria-label="Two bell curves for expensive and not expensive flats, with the floor area of the new case"></svg>
    <div class="ctl"><label for="nbX">Floor area of the new case</label><input type="range" id="nbX" min="30" max="150" step="1" value="76"><output id="nbXO"></output></div>
    <div class="ctl"><label for="nbP">Prior P(expensive)</label><input type="range" id="nbP" min="5" max="95" step="5" value="50"><output id="nbPO"></output></div>
    <div class="stats"><span>P(expensive | x) <b id="nbPost"></b></span><span>Likelihood expensive <b id="nbLb"></b></span><span>Likelihood not expensive <b id="nbLa"></b></span></div>
    <p class="hint" id="nbMsg">&nbsp;</p>
    <p class="hint">Blue = expensive, orange = not expensive: one bell curve each, estimated from the 10 flats and weighted by the prior. The line is the new case. The class with the higher curve at that point wins.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Support Vector Machine (SVM)</h4>
  <p>Looks for the dividing line with the <b>widest margin</b> to both classes. Only the points at the edge (support vectors) determine it. With <b>kernels</b> the data are conceptually lifted into a higher space where they can be separated by a straight line. Strong with many features.</p>
  <p class="note"><b>With the 10 apartments:</b> The largest non-expensive apartment has 70 m², the smallest expensive one 78 m². These two are the <b>support vectors</b>. The dividing line with the widest margin lies in the middle at <b>74 m²</b>, 4 m² away from each side. You could delete the other eight apartments and the boundary would stay the same.</p>
  <div class="demo" id="svDemo">
    <div class="tag">Demo</div><h4>SVM: effect of C</h4>
    <svg class="plot" id="svSvg" viewBox="0 0 320 220" role="img" aria-label="Two classes with decision boundary, margin and support vectors"></svg>
    <div class="ctl"><label for="svC">C (penalty for errors)</label><input type="range" id="svC" min="-1" max="2" step="0.25" value="0"><output id="svCO"></output></div>
    <div class="stats"><span>C <b id="svCv"></b></span><span>Support Vectors <b id="svN"></b></span><span>Margin width <b id="svM"></b></span><span>Accuracy <b id="svA"></b></span></div>
    <p class="hint" id="svMsg">&nbsp;</p>
    <p class="hint">Solid line = decision boundary, dashed = edge of the margin. Thick rings = support vectors: only they determine the line.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Decision tree</h4>
  <p>A chain of yes/no questions. At each node the question that best separates the classes is chosen (measure: Gini or information gain), until the leaves are «pure» or the maximum depth is reached. Easy to read, but a deep tree memorises the training data. Countermeasure: limit <code>max_depth</code> or prune.</p>
  <p>A decision tree needs <b>no linear regression</b> and no sigmoid function: it does not estimate weights but splits the data with thresholds on single features. It is therefore an <b>alternative</b> to logistic regression, not a replacement. Advantages: non-linear relationships, no feature scaling needed. Disadvantages: the boundaries are axis-parallel (step-shaped), deep trees overfit quickly, and the probabilities from the leaves are coarse.</p>
  <p class="note"><b>With the 10 apartments:</b> At the start, 5 expensive and 5 non-expensive apartments are mixed (Gini = 0.5, maximally impure). The best question is «More than 74 m²?»: on the left end up 5 non-expensive, on the right 5 expensive; both leaves are pure straight away (Gini = 0). A single split is enough, the tree has depth 1. The SVM also places its boundary exactly in the middle (74 m²), logistic regression roughly there (between 70 and 78 m²), just by a different route.</p>
  <div class="demo" id="dtDemo">
    <div class="tag">Demo</div><h4>Decision tree: effect of depth</h4>
    <svg class="plot" id="dtSvg" viewBox="0 0 320 220" role="img" aria-label="Rectangles of the tree with split lines and training points"></svg>
    <div class="ctl"><label for="dtD">Maximum depth</label><input type="range" id="dtD" min="1" max="8" step="1" value="2"><output id="dtDO"></output></div>
    <svg class="plot" id="dtTree" viewBox="0 0 320 175" role="img" aria-label="The tree as a diagram: questions in the nodes, classes in the leaves" style="margin-top:10px"></svg>
    <svg class="plot" id="dtCurve" viewBox="0 0 320 125" role="img" aria-label="Training and test accuracy for depths 1 to 8" style="margin-top:10px"></svg>
    <div class="stats"><span>Leaves <b id="dtL"></b></span><span>Training accuracy <b id="dtTr"></b></span><span>Test accuracy (new points) <b id="dtTe"></b></span></div>
    <p class="hint" id="dtMsg">&nbsp;</p>
    <p class="hint">Top: every question is a line, every region a leaf. The stronger the colour, the purer the leaf. Middle: the same tree as a diagram (question in the node, square = leaf, complete down to the chosen depth). Bottom: training (blue) always rises, test (orange) does not. Same data as for kNN.</p>
  </div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Neural networks</h4>
  <p>Layers of artificial neurons with weighted connections, trained by backpropagation (gradient descent across all layers). With very many layers it is called deep learning, which comes in the next module.</p>
  <p class="note"><b>With the 10 apartments:</b> A single neuron with sigmoid, <code>P(expensive) = sigmoid(w·m² + b)</code>, <i>is</i> the logistic regression from above. You do not need more layers here, because the classes can be separated by one split at 74 m². More layers only pay off for patterns that no single boundary can describe.</p>

  <div class="demo" id="nnDemo">
    <div class="tag">Demo</div><h4>Neural network: watching it learn neuron by neuron</h4>
    <div class="btnrow"><button class="pri" id="nnD1">Circle</button><button id="nnD2">XOR</button><button id="nnD3">Two groups</button></div>
    <svg class="plot" id="nnSvg" viewBox="0 0 320 220" role="img" aria-label="Decision region of the network with training points"></svg>
    <div class="ctl"><label for="nnH">Neurons in the hidden layer</label><input type="range" id="nnH" min="1" max="8" step="1" value="4"><output id="nnHO"></output></div>
    <div class="btnrow"><button class="pri" id="nnPlay">Start training</button><button id="nnStep">+100 rounds</button><button id="nnReset">Reset</button></div>
    <svg class="plot" id="nnNeu" viewBox="0 0 320 150" role="img" aria-label="Each hidden neuron with its own boundary" style="margin-top:10px"></svg>
    <svg class="plot" id="nnLoss" viewBox="0 0 320 120" role="img" aria-label="Training and test loss over the training rounds" style="margin-top:10px"></svg>
    <div class="stats"><span>Round (epoch) <b id="nnEp"></b></span><span>Training accuracy <b id="nnTr"></b></span><span>Test accuracy (new points) <b id="nnTe"></b></span><span>Loss (Train / Test) <b id="nnLs"></b></span></div>
    <p class="hint" id="nnMsg">&nbsp;</p>
    <p class="hint">Top: the decision region of the whole network. Middle: each neuron looks at the plane on its own (blue = positive activation, orange = negative); in brackets its weight towards the output. The network combines these simple pictures into the shape above. Bottom: the loss (error measure) falls while the network learns. «Two groups» needs just one neuron, «Circle» and XOR need several.</p>
  </div>
  <h3>6 · Ensembles: many weak models make a strong one</h3>
  <p>A single model makes mistakes, and a deep tree even memorises the training data. The idea of ensembles: take <b>many simple trees</b> instead of one big one and combine them. There are two ways, and the difference is the key question of this section: do the trees work <i>side by side</i> or <i>one after another</i>?</p>
  <div class="grid2">
    <div><h4>Bagging (random forest): the jury</h4>
      <p>Many trees are trained <b>independently and at the same time</b>. Each gets a slightly different version of the data and therefore arrives at a slightly different result. At the end they all vote (class) or you take the mean (number).</p>
      <ol>
        <li>Draw a random sample <i>with replacement</i> (some rows twice, some missing).</li>
        <li>Train a tree on it. In a random forest it may only look at a random selection of features at each split.</li>
        <li>Repeat steps 1 and 2 many times (for example 100 trees).</li>
        <li>Ask all trees: majority vote or mean.</li>
      </ol>
      <p><b>Picture:</b> A jury of many experts who each err now and then, but not all in the same place. On average the errors cancel out. This lowers the <b>variance</b>. It does not help against trees that are too simple (high bias).</p></div>
    <div><h4>Boosting (gradient boosting): the tutor</h4>
      <p>The trees are trained <b>one after another</b>. Each new tree only looks at what the previous ones still get wrong, the <b>residual error</b>, and tries to shrink exactly that.</p>
      <ol>
        <li>Start with a rough prediction (regression: the average).</li>
        <li>Compute the residual: true value minus current prediction.</li>
        <li>Train a small tree (often only depth 1 to 3) on these residuals.</li>
        <li>Add only a fraction of it, the <b>learning rate</b> (for example 0.3). Back to step 2 until the chosen number of rounds is reached.</li>
      </ol>
      <p><b>Picture:</b> A student does an exercise, the tutor only marks the mistakes, the student fixes exactly those, and it repeats. This lowers the <b>bias</b>. With too many rounds or too high a learning rate it ends up learning the noise as well.</p></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th></th><th>Bagging</th><th>Boosting</th></tr>
    <tr><td>Order</td><td>parallel, the trees know nothing about each other</td><td>one after another, each builds on the errors of the others</td></tr>
    <tr><td>Trees</td><td>deep and «big» (each overfits on its own)</td><td>shallow and «weak» (too simple on their own)</td></tr>
    <tr><td>Helps against</td><td>high variance (overfitting)</td><td>high bias (underfitting)</td></tr>
    <tr><td>Risk</td><td>low, robust without much tuning</td><td>overfitting with too many rounds or too high a learning rate</td></tr>
  </table></div>
  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Example: the 10 apartments</h4>
  <p>For the class «expensive» the one split at 74 m² is enough; there is nothing for an ensemble to improve. So here we go back to the question from day 1, the <b>price</b> (ensembles exist for regression just the same). The price does not rise cleanly with the m²: the 70 m² apartment (1620) is cheaper than the 62 m² apartment (1770), the 85 m² apartment (1850) cheaper than the 78 m² apartment (1890). A deep tree memorises these outliers.</p>
  <ul>
    <li><b>Single tree:</b> With depth 3 almost every apartment has its own leaf. On the known apartments the error is small (about 35 CHF); if you leave one apartment out, it is much larger (about 240 CHF). This gap is the overfitting.</li>
    <li><b>Bagging:</b> Each tree gets 10 apartments drawn <i>with replacement</i>. Some appear twice, others not at all (on average about 65 % are distinct, with a lot of data 63 %). Each tree errs differently; the mean is smoother and memorises less. With only 10 apartments the error for a left-out apartment still stays similar; the advantage only shows with more data.</li>
    <li><b>Boosting, round by round:</b> The start is the average price, <b>1841 CHF</b> for every apartment. But the smallest apartment (35 m²) costs only 1200, so its residual is <b>−641</b>. Round 1: a depth-1 tree splits at 90 m². On the left (7 apartments) the mean residual is −215, on the right (3 apartments) +502. With learning rate 0.3 only a part is added: the 35 m² apartment does not jump to 1626 but to 1841 − 0.3·215 = <b>1776</b>. Its residual shrinks from −641 to <b>−576</b>. Round 2 splits at 74 m² and corrects the new residuals, round 3 at 58.5 m². After three rounds the 35 m² apartment has a residual of −416. Small steps, many rounds: this is how the line in the demo moves towards the prices round by round.</li>
  </ul>
  <div class="demo" id="enDemo">
    <div class="tag">Demo</div><h4>Single tree, bagging and boosting on the 10 apartments</h4>
    <svg class="plot" id="enSvg" viewBox="0 0 320 230" role="img" aria-label="10 apartments: m² against price with the prediction of a single tree, of bagging or of boosting"></svg>
    <div class="btnrow"><button class="pri" id="enM1">Single tree</button><button id="enM2">Bagging</button><button id="enM3">Boosting</button></div>
    <div class="ctl"><label for="enD">Depth of the trees</label><input type="range" id="enD" min="1" max="4" step="1" value="3"><output id="enDO"></output></div>
    <div class="ctl" id="enNW"><label for="enN">Number of trees</label><input type="range" id="enN" min="1" max="50" step="1" value="20"><output id="enNO"></output></div>
    <div class="ctl" id="enLW"><label for="enL">Learning rate</label><input type="range" id="enL" min="0.05" max="1" step="0.05" value="0.3"><output id="enLO"></output></div>
    <div class="stats"><span>Error on the known apartments <b id="enTr"></b> CHF</span><span>Error when the apartment is left out <b id="enLo"></b> CHF</span></div>
    <p class="hint" id="enMsg"></p>
  </div>
  <p class="hint">The second error is «leave-one-out»: for each apartment the model is retrained without it and then applied to it. It shows how well the model fits a <i>new</i> apartment (RMSE). It stays high everywhere, because no tree can extrapolate beyond the edge apartments (35 and 130 m²): outside the known m² the prediction is simply the last step value. For comparison: the simple line from day 1 has only about 123 CHF error for a left-out apartment. If the data are almost linear, the simpler model wins; ensembles only pay off with more complicated patterns and more data.</p>
  <pre><code>from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
# X = m² of the 10 apartments (column), y = price
rf = RandomForestRegressor(n_estimators=200, random_state=0).fit(X, y)
gb = GradientBoostingRegressor(n_estimators=50, max_depth=1, learning_rate=0.3).fit(X, y)
# For «expensive yes/no»: RandomForestClassifier / GradientBoostingClassifier</code></pre>

  <h3 id="klass-leakage">7 · Data Leakage</h3>
  <p>Leakage means: during training the model sees information it would not have for the real prediction. Result: wonderful test scores and a model that fails in use.</p>
  <ul>
    <li><b>Target leakage</b>: A feature already contains the answer. Example from the lecture: a churn model with 100 % hits, because calls to customer service («I want to cancel») only happen <i>after</i> the cancellation.</li>
    <li><b>Random key</b>: The account number predicts something because it depends on the order of the customers (e.g. new customers have higher numbers).</li>
    <li><b>Preprocessing before the split</b>: Scaling, imputing or feature selection on all data before splitting. Solution: <code>Pipeline</code>.</li>
    <li><b>Time series</b>: Future in the training. Always split by time.</li>
  </ul>
  <div class="merk"><b>Key takeaway</b><p>Distrust numbers that are too good. Ask for every feature: «Would I really have this value at the time of the prediction?» Suspicious signs are strikingly good validation or test scores (which collapse in production) and a single feature with an enormous weight. A large gap between training and validation, on the other hand, is overfitting, not leakage.</p></div>
`,
  quiz: [
    { q: `Why is accuracy a bad measure with 1 % fraud cases?`, a: `A model that never reports fraud has 99 % accuracy and is still useless. Precision, Recall, F1 and AUC show how well the rare class is detected.` },
    { q: `You lower the threshold from 0.5 to 0.2. What happens to Recall and Precision?`, a: `More cases become positive: Recall rises (or stays the same), Precision usually falls, because more false alarms are added.` },
    { q: `What does an AUC of 0.5 mean, and what does 1 mean?`, a: `0.5 is chance (ROC curve on the diagonal), 1 is a perfect classifier (all positives ahead of all negatives).` },
    { q: `What happens in kNN with k = 1 and with k = N?`, a: `k = 1 follows every training point (overfitting, perfect on training). k = N always predicts the majority class (underfitting).` },
    { q: `How do bagging and boosting differ?`, a: `Bagging trains many models in parallel on random samples and averages them (reduces variance). Boosting trains one after another; each model corrects the remaining errors of the overall model so far (reduces bias, more prone to noise).` },
    { q: `How does data leakage arise, and how do you prevent it with scaling and imputation?`, a: `Information from test or future data flows into the training. Fit all learning preprocessing steps only on the training data, most easily with a Pipeline inside the cross-validation.` },
    { q: `When may you apply resampling (e.g. SMOTE)?`, a: `Only on the training data, never on validation or test. Otherwise you evaluate on artificial data.` },
  ],
});
