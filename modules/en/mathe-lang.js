/* English texts for the module "mathe-lang" (maths basics in detail). Fields replace the German ones when the language is EN. */
LernApp.translate('mathe-lang', {
  nav: 'Maths in detail',
  title: 'Maths basics in detail',
  kicker: 'Basics · Preparation for supervised ML',
  summary: `Σ notation, derivative, gradient, statistics basics`,
  html: `
  <p>This chapter collects the maths the course really needs, in simple words: functions and the summation sign, the derivative, the gradient, a little about vectors and the most important statistics terms. You can look up everything else when it comes up.</p>

  <h3>Functions and the summation sign</h3>
  <p>A <b>function</b> is a calculation rule: <code>f(x)</code> takes an <code>x</code> and returns a <code>y</code>. The line <code>y = a·x + b</code> has two adjusting knobs: <code>a</code> is the slope (how steep), <code>b</code> the intercept (where it crosses the y-axis). Linear regression learns exactly these two numbers.</p>
  <p>The <b>summation sign Σ</b> (sigma) puts many people off, but it is just a for loop. «Σ from i = 1 to n» means: compute the expression for every i and add everything up. The MSE formula and its code say the same thing:</p>
  <pre><code># Formula:  MSE = (1/n) · Σ (y_i − ŷ_i)²     (ŷ = prediction, read "y-hat")
summe = 0
for i in range(n):
    summe = summe + (y[i] - y_vorhersage[i]) ** 2
mse = summe / n</code></pre>
  <div class="merk"><b>Key takeaway</b><p>Reading Σ means: «loop over all data points, then add up.» If a formula looks intimidating, translate it into code.</p></div>

  <h3>The derivative</h3>
  <p>You need the derivative in the next chapter for gradient descent. The idea is simple: it tells you <b>how steep a curve is at a particular point</b>. Or put differently: how much does <code>y</code> change when you move <code>x</code> a tiny bit?</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">For a straight line it is easy</h4>
  <p>A straight line has the same slope everywhere: <code>change in height / step size</code>, in short <code>Δy / Δx</code>. If a road climbs 8 m over 100 m, that is 8 percent. No matter where you measure.</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">On a curve the slope changes</h4>
  <p>A parabola falls steeply on the left, is flat at the bottom and rises steeply on the right. For a single point there is no «Δ» between two points. The trick: take two points, at <code>x</code> and at <code>x + h</code>, and compute the slope of the connecting line (<b>secant</b>). Then make <code>h</code> smaller and smaller. As <code>h</code> goes to 0, the secant becomes the <b>tangent</b>, a line that touches the curve at this point and has the same slope there. Its slope is the derivative.</p>
  <pre><code>f'(x) = (f(x + h) - f(x)) / h      # for very small h</code></pre>

  <div class="demo" id="dvDemo">
    <div class="tag">Demo</div><h4>From secant to tangent (y = x²)</h4>
    <svg class="plot" id="dvSvg" viewBox="0 0 320 200" role="img" aria-label="Parabola with secant and tangent"></svg>
    <div class="ctl"><label for="dvX">Point x</label><input type="range" id="dvX" min="-4" max="4" step="0.1" value="1.5"><output id="dvXO"></output></div>
    <div class="ctl"><label for="dvH">Distance h</label><input type="range" id="dvH" min="0.01" max="3" step="0.01" value="2"><output id="dvHO"></output></div>
    <div class="stats"><span>Slope of the secant <b id="dvSec"></b></span><span>Derivative 2x <b id="dvDer"></b></span></div>
    <p class="hint">Blue: the curve. Orange: secant through the points P (at x) and Q (at x + h). Dashed: the tangent, i.e. the exact slope at x. Move h towards 0, then orange and dashed coincide. Move x to the left and right and watch the sign.</p>
  </div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Worked example</h4>
  <p>For <code>f(x) = x²</code> the derivative is <code>f'(x) = 2x</code>. At <code>x = 3</code> it is 6. Check with <code>h = 0.01</code>: <code>(3.01² − 3²) / 0.01 = (9.0601 − 9) / 0.01 = 6.01</code>. Already almost 6, and with an even smaller <code>h</code> it gets more accurate.</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">What the sign tells you</h4>
  <div class="tablewrap"><table>
    <tr><th>Derivative</th><th>The curve …</th><th>Way to the valley</th></tr>
    <tr><td>positive (&gt; 0)</td><td>rises</td><td>to the left</td></tr>
    <tr><td>negative (&lt; 0)</td><td>falls</td><td>to the right</td></tr>
    <tr><td>zero</td><td>is flat (valley, peak or saddle)</td><td>a minimum is possible here</td></tr>
  </table></div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">The most important rules</h4>
  <p>In the course the computer calculates the derivative for you. These rules are enough to follow the idea:</p>
  <div class="tablewrap"><table>
    <tr><th>Function</th><th>Derivative</th><th>Example</th></tr>
    <tr><td>Constant <code>c</code></td><td>0</td><td>7 → 0</td></tr>
    <tr><td><code>x</code></td><td>1</td><td></td></tr>
    <tr><td><code>x<sup>n</sup></code></td><td><code>n · x<sup>n−1</sup></code></td><td>x² → 2x, x³ → 3x²</td></tr>
    <tr><td><code>c · f(x)</code></td><td><code>c · f'(x)</code></td><td>3x² → 6x</td></tr>
    <tr><td><code>f(x) + g(x)</code></td><td><code>f'(x) + g'(x)</code></td><td>x² + 3x → 2x + 3</td></tr>
  </table></div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Why this matters in machine learning</h4>
  <p>The error function (for example the MSE) depends on the coefficients of the model. Its derivative with respect to one coefficient tells you: does the error get bigger or smaller if I increase this coefficient? If you go in the opposite direction, the error drops. If the model has several coefficients, you take the derivative with respect to each one separately (holding the others fixed, which is called a <i>partial derivative</i>) and put all the values into a vector. This vector is the <b>gradient</b>. Hence the name gradient descent.</p>
  <div class="merk"><b>Key takeaway</b><p>The derivative is the slope at a point. Positive means: to the left towards the valley. Negative: to the right. Zero: flat. Gradient descent always goes against the slope.</p></div>
  <div class="falle"><b>Pitfall</b><p>A derivative of 0 only means «it is flat here». That can be a local minimum and not the deepest valley.</p></div>

  <h3>Vectors and matrices in one minute</h3>
  <p>A <b>vector</b> is a list of numbers, a <b>matrix</b> a table of them. In machine learning there is always the same picture behind it: the data matrix <code>X</code> has <b>one row per observation</b> (a flat) and <b>one column per feature</b> (floor area, rooms, …). The target vector <code>y</code> holds the correct answer for each row (the rent). Linear regression with several features simply computes <code>w1·x1 + w2·x2 + … + b</code> per row: each feature times its weight, all summed up. That too is just a Σ.</p>

  <h3>Statistics terms that come up all the time</h3>
  <p>Example values: <code>[1, 2, 3, 4, 10]</code></p>
  <div class="tablewrap"><table>
    <tr><th>Term</th><th>Idea</th><th>Example</th></tr>
    <tr><td><b>Mean</b></td><td>sum divided by count</td><td>20 / 5 = <b>4</b></td></tr>
    <tr><td><b>Median</b></td><td>the middle value after sorting</td><td><b>3</b> — the outlier 10 does not affect it</td></tr>
    <tr><td><b>Variance</b></td><td>mean squared deviation from the mean</td><td>(9+4+1+0+36)/5 = <b>10</b></td></tr>
    <tr><td><b>Standard deviation</b></td><td>square root of the variance, back in the unit of the data</td><td>√10 ≈ <b>3.16</b></td></tr>
  </table></div>
  <p>The std tells you how widely the values spread around the mean. The <code>StandardScaler</code> uses exactly these two numbers, and <code>df.describe()</code> shows them for every column.</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">What the StandardScaler does</h4>
  <ul>
    <li><b>Per column:</b> <code>z = (x − mean) / std</code>. First subtract the mean (zero point in the middle), then divide by the std (unit = 1 std).</li>
    <li><b>The std is computed only once:</b> it measures the distances to the mean, not the values themselves. Subtracting shifts all values together with the mean, the distances stay the same, so the std stays the same too. That is why one calculation on the raw values is enough. After dividing, it is 1 by construction, without being recomputed.</li>
    <li><b>Two different stds:</b> the std of the <i>raw values</i> (e.g. 8.26) stays stored in the scaler (<code>scaler.scale_</code>, mean in <code>scaler.mean_</code>) and is the divisor. The std of the <i>scaled</i> values is 1. With the stored numbers you get back: <code>x = z · std + mean</code> (<code>inverse_transform</code>). It is not an optimisation, but a direct calculation without a loop.</li>
    <li><b>Outliers in the training data distort the scaler:</b> they inflate the mean and std, the normal values then get squeezed into a narrow window, and this wrong scale later applies to all test data too. So check before the <code>fit</code>: correct or remove measurement and typing errors, keep real extreme values (or use <code>RobustScaler</code>). Remove them <b>only from the training data</b>, never from the test data.</li>
    <li><b>Outliers in the test data:</b> the std stays the one from training. The value gets an extreme z-value (e.g. 15), the model extrapolates, and the test error honestly shows that it handles such cases badly. Extreme z-values (|z| &gt; 4) are a warning sign.</li>
    <li><b>Result on the training data:</b> mean 0, std 1. A z-value says: «this many stds above (+) or below (−) the average».</li>
    <li><b>Test and new data:</b> only convert them with the stored numbers from training (<code>transform</code>), which is why they are only roughly at 0 and 1.</li>
    <li><b>Stays the same:</b> order, distances, shape, outliers too. <b>Changes:</b> only the zero point and the unit.</li>
  </ul>
  <pre><code>scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)  # learns mean and std
X_test_s  = scaler.transform(X_test)       # uses the same numbers</code></pre>
  <div class="merk"><b>Why?</b><p>So that all features <b>start with equal weight</b>: without scaling, square metres (30 to 150) dominate the feature rooms (1 to 6). That disturbs gradient descent, k-NN and regularisation.</p></div>

  <p><b>Is «mean 0, std 1» really reached?</b> On the <b>training data</b> always exactly, because the scaler subtracts exactly their mean and divides by exactly their std. On <b>test and new data</b> only roughly (e.g. mean 0.1, std 0.9), because they are scaled with the numbers from training. That is intended: the model should see new data the way it will see it later in practice. «0 ± 1» also does not mean that all values lie between −1 and +1; most lie between −2 and +2, outliers beyond that too.</p>
  <div class="demo" id="stDemo">
    <div class="tag">Demo</div><h4>Seeing statistics and the StandardScaler</h4>
    <p class="hint">Seven rents (in 100 CHF) plus an eighth value that you move. At the top the raw values, at the bottom the same points after the StandardScaler.</p>
    <svg class="plot" id="stSvg" viewBox="0 0 320 250" role="img" aria-label="Top: raw values with mean, median and standard deviation band; bottom: the standardised values"></svg>
    <div class="ctl"><label for="stOut">Eighth value</label><input type="range" id="stOut" min="3" max="40" step="0.5" value="8"><output id="stOutO"></output></div>
    <div class="tablewrap"><table id="stTab" style="min-width:0"></table></div>
    <p class="hint" id="stEx"></p>
    <p class="hint">Blue line: mean, dashed: median, band: mean ± 1 std. Move the value to the right: the mean moves with it, the median hardly at all. At the bottom it always stays at mean 0 and std 1; only the distances change. Formula: <code>z = (x − mean) / std</code>.</p>
  </div>
  <div class="demo" id="ssDemo">
    <div class="tag">Demo</div><h4>StandardScaler step by step, with outlier</h4>
    <p class="hint">Eight rents, the last one (orange) is an outlier. Click through the three steps and move it: in the end it is always mean 0 and std 1.</p>
    <div class="btnrow"><button id="ssB1" class="pri">1 · Raw values</button><button id="ssB2">2 · Subtract mean</button><button id="ssB3">3 · Divide by std</button></div>
    <svg class="plot" id="ssSvg" viewBox="0 0 320 120" role="img" aria-label="Points on a number line in three steps of the StandardScaler"></svg>
    <div class="ctl"><label for="ssOut">Eighth value</label><input type="range" id="ssOut" min="3" max="40" step="0.5" value="30"><output id="ssOutO"></output></div>
    <details><summary>Calculation as a table</summary><div class="tablewrap"><table id="ssTab" style="min-width:0"></table></div></details>
    <div class="stats"><span>Mean <b id="ssM"></b></span><span>Std (n) <b id="ssS"></b></span></div>
    <p class="hint" id="ssNote"></p>
  </div>
  <div class="falle"><b>Pitfall</b><p>You learn the scaler's mean and std only on the <b>training data</b> (<code>fit</code>). On validation and test data you merely apply them (<code>transform</code>). Otherwise test information flows into training: data leakage.</p></div>

  <h3>Correlation</h3>
  <p>The <b>correlation</b> r measures how strongly two variables move together <i>linearly</i>, on a scale from −1 to +1: +1 means perfectly rising together, −1 perfectly opposite, 0 no linear relationship. In Pandas: <code>df.corr()</code>. In feature selection you pick features with a high correlation to the target, positive or negative (high absolute value |r|).</p>
  <div class="falle"><b>Pitfall</b><p>Correlation is not causation (pirates and global warming!), and r measures only <i>linear</i> relationships: a perfect U-curve can have r ≈ 0.</p></div>
`,
  quiz: [
    { q: `Why do you scale features, and are mean 0 and std 1 reached exactly on the test data afterwards?`, a: `So that no feature dominates just because of large numbers (important for gradient descent, k-NN, regularisation). 0 and 1 hold exactly only on the training data; test data are scaled with the training values and are only roughly there.` },
    { q: `What are the mean and standard deviation after the StandardScaler?`, a: `Mean 0 and standard deviation 1. Each value becomes z = (x − mean) / std; the shape of the distribution stays, only location and scale change.` },
    { q: `What does the derivative of a function at a point tell you?`, a: `The slope of the curve at this point, i.e. how much y changes when x grows a tiny bit. Positive means: the curve rises, negative: it falls, zero: it is flat.` },
    { q: `What is the derivative of <code>x²</code>, and how large is it at <code>x = -3</code>?`, a: `<code>2x</code>, so -6 at x = -3. The minus shows: the curve falls there, the valley lies to the right of it.` },
    { q: `Why is there a minus in gradient descent: <code>x_neu = x_alt - lernrate * steigung</code>?`, a: `The derivative points uphill. You want to go into the valley, so you go in the opposite direction.` },
    { q: `What does the summation sign Σ mean in a formula?`, a: `A loop that adds up: compute the expression for every index and add all the results together.` },
    { q: `What is the gradient?`, a: `The vector of all partial derivatives: one number per coefficient that says how much the error grows when you increase this coefficient. Gradient descent goes in the opposite direction.` },
    { q: `Values [1, 2, 3, 4, 10]: why do the mean (4) and median (3) differ?`, a: `The outlier 10 pulls the mean up. The median only looks at the middle value and stays stable.` },
    { q: `Two variables have correlation r = −0.9. What does that mean?`, a: `A strong opposite linear relationship: when one rises, the other usually falls. It says nothing about the cause.` },
  ],
});
