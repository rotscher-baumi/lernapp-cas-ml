/* English texts for the module "mathe-kompakt" (maths cheat sheet). Fields replace the German ones when the language is EN. */
LernApp.translate('mathe-kompakt', {
  nav: 'Maths compact',
  title: 'Maths basics compact',
  kicker: 'Cheat sheet · Preparation for supervised ML',
  summary: `The essentials on one page`,
  html: `
  <p>The cheat sheet for quick reference. The derivations and all diagrams are in the <a href="mathe-ausfuehrlich.html">detailed version</a>.</p>

  <div class="tablewrap"><table>
    <tr><th>Topic</th><th>Remember</th></tr>
    <tr><td><b>Function</b></td><td><code>y = a·x + b</code>: <code>a</code> slope, <code>b</code> intercept. Linear regression learns exactly these two numbers.</td></tr>
    <tr><td><b>Sum Σ</b></td><td>A for loop that adds things up. <code>MSE = (1/n)·Σ (y − ŷ)²</code></td></tr>
    <tr><td><b>Derivative</b></td><td>Slope at one point. <code>x²</code> → <code>2x</code>. Positive: the error grows to the right, negative: to the left, zero: valley or peak.</td></tr>
    <tr><td><b>Gradient</b></td><td>All derivatives at once (one per coefficient). Gradient descent goes in the <b>opposite direction</b>: <code>w = w − lr · Gradient</code></td></tr>
    <tr><td><b>Matrix X</b></td><td>One row per observation, one column per feature. <code>y</code> is the target column.</td></tr>
    <tr><td><b>Mean</b></td><td>Sum / count. Gets pulled by outliers.</td></tr>
    <tr><td><b>Median</b></td><td>Middle value of the sorted list. Robust against outliers.</td></tr>
    <tr><td><b>Variance, std</b></td><td>Mean squared deviation from the mean; std is its square root. Example <code>[1,2,3,4,10]</code>: mean 4, median 3, variance 10, std ≈ 3.16.</td></tr>
    <tr><td><b>Correlation r</b></td><td>−1 to +1, measures only <i>linear</i> relationships. Not a cause.</td></tr>
  </table></div>

  <h3>StandardScaler in 4 lines</h3>
  <ul>
    <li><b>Formula (per column):</b> <code>z = (x − mean) / std</code></li>
    <li><b>Result on the training data:</b> mean 0, std 1. The std is computed only once, on the raw values.</li>
    <li><b>Test and new data:</b> only <code>transform</code> with the stored training numbers, never fit again (data leakage).</li>
    <li><b>Why:</b> All features start with equal weight. Outliers stay outliers and distort the mean and std, so check them before the fit.</li>
  </ul>
  <div class="demo" id="ssDemo">
    <div class="tag">Demo</div><h4>StandardScaler step by step</h4>
    <p class="hint">Click through the three steps and move the outlier (orange): in the end it is always mean 0 and std 1.</p>
    <div class="btnrow"><button id="ssB1" class="pri">1 · Raw values</button><button id="ssB2">2 · Subtract mean</button><button id="ssB3">3 · Divide by std</button></div>
    <svg class="plot" id="ssSvg" viewBox="0 0 320 120" role="img" aria-label="Points on a number line in three steps of the StandardScaler"></svg>
    <div class="ctl"><label for="ssOut">Eighth value</label><input type="range" id="ssOut" min="3" max="40" step="0.5" value="30"><output id="ssOutO"></output></div>
    <details><summary>Calculation as a table</summary><div class="tablewrap"><table id="ssTab" style="min-width:0"></table></div></details>
    <div class="stats"><span>Mean <b id="ssM"></b></span><span>Std (n) <b id="ssS"></b></span></div>
    <p class="hint" id="ssNote"></p>
  </div>
`,
  quiz: [
    { q: `What does Σ mean?`, a: `A loop that adds up over all data points.` },
    { q: `Which way does gradient descent go?`, a: `Against the direction of the derivative (hence the minus), towards smaller errors.` },
    { q: `Mean and std after the StandardScaler?`, a: `0 and 1, exactly only on the training data. Test and new data are converted with the stored training numbers.` },
    { q: `Does the StandardScaler remove outliers?`, a: `No. It only rescales. But outliers in the training data distort the mean and std, so check them first or use the RobustScaler.` },
  ],
});
