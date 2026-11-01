/* English texts for the module "ml" (Supervised Learning: regression). Fields replace the German ones when the language is EN. */
LernApp.translate('ml', {
  nav: 'Supervised ML',
  title: `Supervised Learning: regression`,
  kicker: `Module 2 · Supervised Learning, day 1`,
  summary: `Gradient descent to hyperparameters`,
  html: `  <p>In supervised learning you give the model examples with a known answer. In <b>regression</b> the answer is a number (e.g. a house price). The model should learn from this to make good guesses for <i>new</i> cases. One rule applies: the quality of the data limits the quality of the model (<i>garbage in, garbage out</i>), and this holds for the features just as much as for the labels.</p>

  <p class="note">Prerequisite: the chapter «Maths basics» explains what a derivative and the gradient are. Here we start straight away with learning.</p>

  <h3 id="ml-ablauf">The whole workflow at a glance</h3>
  <p>Every model starts with exploratory data analysis (EDA). It shows which preprocessing is needed and which model makes sense.</p>
  <p class="hint">Click a step in the diagram: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig">
    <div class="ab-scroll">
    <svg viewBox="-50 0 830 858" role="img" aria-label="Workflow of an ML project: raw data, 80/20 split, EDA on the training data, manual feature selection with domain knowledge, compute preprocessing and scaling on the training data only, automatic feature selection in the pipeline, training and validation with a loop over hyperparameters, choose the best model, test data exactly once at the end.">
      <defs>
        <marker id="ab-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/>
        </marker>
        <marker id="ab-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--warn)"/>
        </marker>
      </defs>

      <g class="ab-step" data-s="1" tabindex="0" role="button" aria-expanded="false" aria-label="Step 1: show explanation">
      <rect x="60" y="20" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="42" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">1 · Load raw data</text>
      <text x="210" y="60" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">check rows, columns, data types</text>
      </g>
      <line x1="210" y1="72" x2="210" y2="104" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="2" tabindex="0" role="button" aria-expanded="false" aria-label="Step 2: show explanation">
      <rect x="60" y="104" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="126" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">2 · Split</text>
      <text x="210" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">separate first, before analysing anything</text>
      </g>
      <line x1="360" y1="130" x2="440" y2="130" marker-end="url(#ab-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>
      <text x="400" y="122" text-anchor="middle" style="fill:var(--warn);font-size:11.5px;font-family:var(--f-mono)">20 %</text>
      <g class="ab-step" data-s="t" tabindex="0" role="button" aria-expanded="false" aria-label="Test set: show explanation">
      <rect x="440" y="104" width="240" height="52" rx="6" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4"/>
      <text x="560" y="126" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body);fill:var(--warn)">Test set: locked</text>
      <text x="560" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">don't look, don't touch</text>
      </g>
      <path d="M680,130 H745 V826 H360" marker-end="url(#ab-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>

      <line x1="210" y1="156" x2="210" y2="188" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="222" y="177" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">80 % Train + Val</text>

      <g class="ab-step" data-s="3" tabindex="0" role="button" aria-expanded="false" aria-label="Step 3: show explanation">
      <rect x="60" y="188" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="210" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">3 · Look at the data (EDA)</text>
      <text x="210" y="228" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">only on the 80 %, without a model</text>
      </g>
      <line x1="360" y1="214" x2="410" y2="214" marker-end="url(#ab-a)" style="stroke:var(--accent);stroke-width:1.5;fill:none"/>

      <rect x="410" y="168" width="300" height="130" rx="8" style="fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 4"/>
      <text x="424" y="188" style="fill:var(--accent);font-size:12px;font-weight:600;font-family:var(--f-body)">What you look for</text>

      <g transform="translate(428,200)">
        <rect x="0" y="34" width="9" height="12" style="fill:var(--accent)"/>
        <rect x="11" y="20" width="9" height="26" style="fill:var(--accent)"/>
        <rect x="22" y="4" width="9" height="42" style="fill:var(--accent)"/>
        <rect x="33" y="14" width="9" height="32" style="fill:var(--accent)"/>
        <rect x="44" y="30" width="9" height="16" style="fill:var(--accent)"/>
        <rect x="55" y="42" width="9" height="4" style="fill:var(--accent)"/>
        <line x1="0" y1="46.5" x2="66" y2="46.5" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      </g>
      <text x="461" y="268" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Distributions</text>
      <text x="461" y="283" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Outliers</text>

      <g transform="translate(538,200)">
        <line x1="0" y1="46.5" x2="66" y2="46.5" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
        <line x1="0.5" y1="0" x2="0.5" y2="46" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
        <circle cx="10" cy="38" r="2.5" style="fill:var(--accent)"/><circle cx="18" cy="32" r="2.5" style="fill:var(--accent)"/>
        <circle cx="26" cy="35" r="2.5" style="fill:var(--accent)"/><circle cx="32" cy="24" r="2.5" style="fill:var(--accent)"/>
        <circle cx="42" cy="20" r="2.5" style="fill:var(--accent)"/><circle cx="48" cy="26" r="2.5" style="fill:var(--accent)"/>
        <circle cx="56" cy="10" r="2.5" style="fill:var(--accent)"/><circle cx="62" cy="14" r="2.5" style="fill:var(--accent)"/>
      </g>
      <text x="571" y="268" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Relationship</text>
      <text x="571" y="283" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">feature ↔ target</text>

      <g transform="translate(648,200)">
        <rect x="0" y="0" width="20" height="14" opacity="1" style="fill:var(--accent)"/>
        <rect x="22" y="0" width="20" height="14" opacity="0.2" style="fill:var(--accent)"/>
        <rect x="44" y="0" width="20" height="14" opacity="0.75" style="fill:var(--accent)"/>
        <rect x="0" y="16" width="20" height="14" opacity="0.2" style="fill:var(--accent)"/>
        <rect x="22" y="16" width="20" height="14" opacity="1" style="fill:var(--accent)"/>
        <rect x="44" y="16" width="20" height="14" opacity="0.35" style="fill:var(--accent)"/>
        <rect x="0" y="32" width="20" height="14" opacity="0.75" style="fill:var(--accent)"/>
        <rect x="22" y="32" width="20" height="14" opacity="0.35" style="fill:var(--accent)"/>
        <rect x="44" y="32" width="20" height="14" opacity="1" style="fill:var(--accent)"/>
      </g>
      <text x="680" y="268" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Correlations</text>
      <text x="680" y="283" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Missing values</text>

      <line x1="210" y1="240" x2="210" y2="300" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="222" y="274" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">this sets the strategy</text>

      <g class="ab-step" data-s="4" tabindex="0" role="button" aria-expanded="false" aria-label="Step 4: show explanation">
      <rect x="60" y="300" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="322" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">4 · Feature selection (manual)</text>
      <text x="210" y="340" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">expertise + EDA: drop IDs, leakage, duplicates</text>
      </g>
      <line x1="210" y1="352" x2="210" y2="384" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="5" tabindex="0" role="button" aria-expanded="false" aria-label="Step 5: show explanation">
      <rect x="60" y="384" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="406" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">5 · Define preprocessing</text>
      <text x="210" y="424" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">e.g. median from training data only (fit)</text>
      </g>
      <line x1="210" y1="436" x2="210" y2="468" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="6" tabindex="0" role="button" aria-expanded="false" aria-label="Step 6: show explanation">
      <rect x="60" y="468" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="490" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">6 · Scale</text>
      <text x="210" y="508" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">fit the scaler on training data only, too</text>
      </g>
      <line x1="210" y1="520" x2="210" y2="552" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="7" tabindex="0" role="button" aria-expanded="false" aria-label="Step 7: show explanation">
      <rect x="60" y="552" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="574" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">7 · Feature selection (automatic)</text>
      <text x="210" y="592" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">optional · filter, wrapper, embedded in the pipeline</text>
      </g>
      <line x1="210" y1="604" x2="210" y2="636" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="578" x2="410" y2="578" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <rect x="410" y="560" width="300" height="94" rx="8" style="fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 4;stroke:var(--line)"/>
      <text x="424" y="580" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Filter</text>
      <text x="494" y="580" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">correlation or F-test with target</text>
      <text x="424" y="602" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Wrapper</text>
      <text x="494" y="602" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">RFE: model drops features</text>
      <text x="424" y="624" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Embedded</text>
      <text x="494" y="624" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">L1 (Lasso), tree importance</text>
      <text x="424" y="644" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">not the same: PCA creates new features</text>

      <g class="ab-step" data-s="8" tabindex="0" role="button" aria-expanded="false" aria-label="Step 8: show explanation">
      <rect x="60" y="636" width="300" height="60" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="659" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">8 · Train and validate</text>
      <text x="210" y="677" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">75:25 split or cross-validation</text>
      </g>
      <path d="M60,680 H34 V652 H60" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="26" y="666" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">Hyper-</text>
      <text x="26" y="680" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">parameters</text>
      <line x1="210" y1="696" x2="210" y2="728" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="9" tabindex="0" role="button" aria-expanded="false" aria-label="Step 9: show explanation">
      <rect x="60" y="728" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="750" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">9 · Choose the best model</text>
      <text x="210" y="768" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">based on validation, retrain on the 80 %</text>
      </g>
      <line x1="210" y1="780" x2="210" y2="806" marker-end="url(#ab-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="10" tabindex="0" role="button" aria-expanded="false" aria-label="Step 10: show explanation">
      <rect x="60" y="806" width="300" height="40" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="831" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">10 · Evaluate once on the test set</text>
      </g>
      <text x="738" y="816" text-anchor="end" style="fill:var(--warn);font-size:11.5px;font-family:var(--f-mono)">transform with train median and train scaler</text>
    </svg>
    </div>
    <div class="ab-detail" id="abDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>EDA (blue) comes before preprocessing and the model. The test set (orange) is split off right at the start and only used in the last step, so that the test result is not distorted by knowledge from the test data.</figcaption>
  </figure>
  <div class="merk"><b>Look at the data first</b><p>Without EDA you don't know whether values are missing, whether outliers distort the median or mean, whether you need to scale, or whether the classes are unevenly distributed. The EDA determines steps 4 to 8.</p></div>
  <div class="falle"><b>Data leakage</b><p>Do the EDA on the 80 % only, too. Feature selection, median and scaler are computed, like the model, from the training data only, most safely inside each cross-validation round. Otherwise knowledge from the test data leaks in and the validation is too optimistic.</p></div>

  <h3 id="ml-gd">1 · Gradient descent: how a model «learns»</h3>
  <p>Imagine fog on a mountain. You want to get down to the valley, but you can only see how steep the ground under your feet is. So you keep taking a step downhill. That is exactly what the algorithm does.</p>
  <pre><code>x_neu = x_alt - lernrate * steigung_bei(x_alt)</code></pre>
  <p>The <b>slope</b> (the derivative, see the chapter «Maths basics») tells you the direction. The <b>learning rate</b> sets the step size. Too small: you hardly make progress. Too large: you jump past the valley. Here is the function <code>y = x²</code>, the valley is at 0:</p>

  <div class="demo" id="gdDemo">
    <div class="tag">Demo</div><h4>Gradient descent on y = x²</h4>
    <svg class="plot" id="gdSvg" viewBox="0 0 320 200" role="img" aria-label="Parabola with gradient descent steps"></svg>
    <div class="ctl"><label for="gdLr">Learning rate</label><input type="range" id="gdLr" min="0.05" max="1.1" step="0.05" value="0.2"><output id="gdLrO"></output></div>
    <div class="btnrow"><button class="pri" id="gdStep">1 step</button><button id="gdTen">10 steps</button><button id="gdReset">Reset</button></div>
    <div class="stats"><span>Step <b id="gdN">0</b></span><span>x = <b id="gdX"></b></span><span>y = <b id="gdY"></b></span></div>
    <p class="hint" id="gdMsg"></p>
  </div>
  <p>Try 0.1, 0.5, 1.0 and 1.05. At 1.0 it only jumps back and forth; above that it moves further and further away. Real problems also have many valleys (local minima). One strategy is to reduce the learning rate over time.</p>

  <p class="note"><b>With the 10 apartments:</b> Here we are not looking for x, but for the slope <code>w</code> and the intercept <code>b</code> of the price line <code>price = b + w·m²</code> (we look at <code>w</code>, <code>b</code> moves along). The error (MSE) depends on <code>w</code> the way <code>y = x²</code> depends on x: a valley. If you start at <code>w = 0</code> (a horizontal line at the average price of 1841 CHF), the MSE is about 151,000. Gradient descent pushes <code>w</code> downhill step by step until, at <code>w ≈ 13.6</code> CHF per m², the MSE is only about 10,600.</p>

  <h3 id="ml-linreg">2 · Linear regression: the best line</h3>
  <p>We are looking for the line <code>y = a·x + b</code> that lies as close as possible to all points. How close is measured by the <b>loss function</b>. The deviation of a point from the line is called the <b>residual</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Measure</th><th>Meaning</th></tr>
    <tr><td><b>MAE</b></td><td>mean absolute error: average of the absolute values of the residuals</td></tr>
    <tr><td><b>MSE</b></td><td>mean squared error: punishes large outliers much more (RMSE = its square root, back in the unit of y)</td></tr>
    <tr><td><b>R²</b></td><td>what percentage of the error the regression removes compared with «always guess the mean». 0 = no better than the mean, 1 = perfect. On new data R² can also be negative (worse than the mean)</td></tr>
  </table></div>
  <p class="note"><b>With the 10 apartments:</b> The best line through all 10 apartments is <code>price = 799 + 13.6·m²</code>. Each extra square metre costs 13.6 CHF on average. The errors: <b>R² = 0.93</b>, <b>MAE ≈ 86 CHF</b>, <b>RMSE ≈ 103 CHF</b> (the square root of the MSE of 10,600). Without a model, using the average price of 1841 CHF for all, R² would be 0.</p>
  <div class="demo" id="lrDemo">
    <div class="tag">Demo</div><h4>Fit the line yourself</h4>
    <svg class="plot" id="lrSvg" viewBox="0 0 320 220" role="img" aria-label="Points with regression line and red residuals"></svg>
    <div class="ctl"><label for="lrA">Slope</label><input type="range" id="lrA" min="-1" max="2" step="0.05" value="0"><output id="lrAO"></output></div>
    <div class="ctl"><label for="lrB">Intercept</label><input type="range" id="lrB" min="-2" max="8" step="0.1" value="5"><output id="lrBO"></output></div>
    <div class="btnrow"><button class="pri" id="lrBest">Best line (least squares)</button><button id="lrMean">Mean only</button></div>
    <div class="stats"><span>MAE <b id="lrMae"></b></span><span>MSE <b id="lrMse"></b></span><span>R² <b id="lrR2"></b></span></div>
    <p class="hint">The red lines are the residuals. If you only take the mean, R² is exactly 0. The best line minimises the squared error.</p>
  </div>
  <p>Gradient descent is how a computer finds these values: start with random coefficients, measure the error, change the coefficients slightly, repeat until it stops getting better. <b>Several features</b> simply mean more coefficients. For curves you use <b>polynomial regression</b> (x, x², x³ as features).</p>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">Example: 10 apartments, several features</h4>
  <p>The price is the target <code>y</code>, the features are <code>qm</code> (m²), <code>Zimmer</code> (rooms) and <code>Lage</code> (location, 1 = poor to 5 = top; encoded as a number). You can only draw two axes: here x = m², y = price, the <b>point size</b> shows the rooms and the <b>colour strength</b> the location.</p>
  <div class="demo" id="whDemo">
    <div class="tag">Demo</div><h4>10 apartments: one feature or three</h4>
    <svg class="plot" id="whSvg" viewBox="0 0 320 230" role="img" aria-label="Scatter plot of m² against price with regression line or predictions and residuals"></svg>
    <div class="btnrow"><button class="pri" id="whOne">m² only</button><button id="whAll">m², rooms, location</button></div>
    <div class="stats"><span>R² <b id="whR2"></b></span><span>Error (MAE) <b id="whMae"></b> CHF</span></div>
    <div class="tablewrap"><table id="whTab"></table></div>
    <p class="hint">With one feature this is a line in 2D. With three features there is no longer a line you can draw: the model predicts a price for each apartment (empty circles), and the red lines are the deviations. The table shows the weights after the StandardScaler: the larger the absolute value, the more strongly the feature drives the price. Note: R² is measured on the training data here; with 10 apartments and 4 numbers in the model, this is only a demo.</p>
  </div>

  <p>Take two features (m² and rooms), and each apartment becomes a point in a <b>3D space</b>: one axis per feature, the third axis is the price. The model is no longer a line but a <b>plane</b>.</p>
  <div class="demo" id="r3Demo">
    <div class="tag">Demo</div><h4>3D space: m², rooms, price</h4>
    <svg class="plot" id="r3Svg" viewBox="0 0 320 316" role="img" aria-label="3D view: 10 apartments as points and the regression plane" style="touch-action:none;cursor:grab;max-width:430px;margin:0 auto;position:sticky;top:8px;z-index:1"></svg>
    <div class="ctl"><label for="r3Az">Rotate</label><input type="range" id="r3Az" min="-180" max="180" step="1" value="-35"><output id="r3AzO"></output></div>
    <div class="ctl"><label for="r3El">Tilt</label><input type="range" id="r3El" min="0" max="80" step="1" value="25"><output id="r3ElO"></output></div>
    <div class="btnrow"><button id="r3Top">View m² / price</button><button id="r3Side">View rooms / price</button><button id="r3Reset">Reset</button></div>
    <div class="stats"><span>R² (m² + rooms) <b id="r3R2"></b></span></div>
    <p class="hint">You can also drag in the picture. Filled points are the real prices, the red line is the distance to the plane. The buttons show you the flat 2D views: from the front you see m² against price as in the chart above, from the side rooms against price. The 3D space contains both at once. Location is missing here because a 4th axis could no longer be drawn.</p>
  </div>

  <h4 style="margin:12px 0 4px;font-family:var(--f-display)">What <code>fit()</code> does: learning the weights</h4>
  <p>Many models (e.g. <code>SGDRegressor</code>, neural networks) learn with gradient descent. <code>LinearRegression</code>, by contrast, computes the solution directly, but ends up at the same result. Gradient descent starts with weights at 0, measures the error, pushes each weight a little in the direction that reduces the error (the gradient from the maths chapter), and repeats. Here you see it on the 10 apartments with the <b>scaled</b> features. The price is in 1000 CHF.</p>
  <div class="demo" id="ftDemo">
    <div class="tag">Demo</div><h4>Learning the weights, step by step</h4>
    <svg class="plot" id="ftSvg" viewBox="0 0 320 270" role="img" aria-label="Bars of the three weights and error curve over the learning steps"></svg>
    <div class="ctl"><label for="ftLr">Step size</label><input type="range" id="ftLr" min="0.02" max="0.6" step="0.01" value="0.1"><output id="ftLrO"></output></div>
    <div class="btnrow"><button class="pri" id="ftStep">1 step</button><button id="ftRun">Learn (animation)</button><button id="ftReset">Reset</button></div>
    <div class="stats"><span>Step <b id="ftN"></b></span><span>Error (MSE) <b id="ftMse"></b></span></div>
    <p class="hint" id="ftEq"></p>
    <p class="hint">Bars: current weights. The vertical lines are the values that the exact solution (<code>LinearRegression</code>) finds. <b>So weighting means:</b> each step moves a weight against its gradient until the error stops falling. Steps that are too large overshoot the target (the error explodes), steps that are too small take a very long time. m² and rooms are related, which is why they find their values more slowly.</p>
  </div>

  <h3 id="ml-prep">3 · Preparing the data</h3>
  <h4 id="ml-missing" style="margin:12px 0 4px;font-family:var(--f-display)">Missing values</h4>
  <ul>
    <li><b>Delete</b>: simple, but you lose data.</li>
    <li><b>Fill in (imputation)</b>: mean/median (fast, ignores relationships), mode or constant (also for categories, can distort), k-nearest neighbours (more accurate, expensive), regression or interpolation.</li>
  </ul>
  <p>Missing values may occur in training, validation and test. Important: an imputation rule that is computed from data is <b>learned from the training data only</b>. For example, the imputer computes the median there and then uses exactly this median for validation and test too:</p>
  <pre><code>from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy="median")
X_train_clean = imputer.fit_transform(X_train)  # learns medians and fills training
X_val_clean = imputer.transform(X_val)          # uses the same medians
X_test_clean = imputer.transform(X_test)        # uses the same medians</code></pre>
  <div class="merk"><b>Key takeaway</b><p><code>fit</code> only on training data, <code>transform</code> on all data sets. This way, for example, the test median is not used and data leakage is avoided. The separate notebook shows this with 10 rows and 4 features.</p></div>
  <p class="note"><b>With the 10 apartments:</b> If the m² value is missing for the largest apartment (130 m², 5.5 rooms), the mean of the other nine gives 71 m²: far off, because it ignores the rooms. A regression of m² on rooms estimates 132 m², and k-nearest neighbours (the apartment with the most similar number of rooms, 4.5 rooms) gives 110 m². Both use the relationship between the features.</p>
  <h4 id="ml-scaling" style="margin:12px 0 4px;font-family:var(--f-display)">Scaling</h4>
  <p>Features have very different orders of magnitude (consumption 8 l/100km, engine size 3600 cc). Without scaling, the large numbers dominate. That is why you bring them all onto a comparable scale.</p>
  <div class="tablewrap"><table>
    <tr><th>Method</th><th>Result</th></tr>
    <tr><td>Standard Scaling</td><td>mean 0, standard deviation 1 (shape of the distribution stays)</td></tr>
    <tr><td>Min-Max Scaling</td><td>values between 0 and 1</td></tr>
    <tr><td>Mean Normalization</td><td>mean 0, values between -1 and 1</td></tr>
  </table></div>
  <p class="note"><b>With the 10 apartments:</b> <code>qm</code> lies between 35 and 130, <code>Zimmer</code> between 1.5 and 5.5, <code>Lage</code> between 2 and 5. Without scaling, the m² numbers would dominate every distance-based model (kNN, SVM) and gradient descent. With standard scaling (mean 76.8 m², spread 27.7 m²) the 130 m² apartment becomes <code>(130 − 76.8) / 27.7 ≈ 1.9</code>. With min-max it becomes 1, the 35 m² apartment 0 and the 70 m² apartment 0.37.</p>
  <h4 id="ml-cat" style="margin:12px 0 4px;font-family:var(--f-display)">Categories as numbers</h4>
  <p>Never encode weekdays simply as 1, 2, 3: that would claim «Wednesday is greater than Monday». Use <b>one-hot encoding</b> instead: one column per category with 0 or 1.</p>
  <p class="note"><b>With the 10 apartments:</b> <code>Lage</code> (location) is a rating from 1 to 5 here and therefore already a number with an order, which is fine. If the location were a district (Altstadt, Seefeld, Hardau), there would be no order: then each district gets its own 0/1 column (one-hot), not 1, 2, 3.</p>
  <pre><code>from sklearn.preprocessing import StandardScaler
X = pd.DataFrame(StandardScaler().fit_transform(data), columns=data.columns)

data["einkommen_klasse"] = pd.cut(data["MedInc"], bins=[-1, 3, 6, 16],
                                  labels=["low", "medium", "high"])
data = pd.get_dummies(data, columns=["einkommen_klasse"])   # one-hot</code></pre>
  <div class="falle"><b>Pitfall (data leakage)</b><p>In the slides' example, scaling is done <i>before</i> splitting to keep things simple. The clean way is to fit the scaler on the training data only, because the scaler is also «trained»: it learns the mean and spread. If validation or test data flow in, their information leaks into the model (data leakage). This is exactly what <code>Pipeline</code> is for (see below). More on data leakage comes on the course day on classification.</p></div>

  <h3 id="ml-split">4 · Train, validation, test and cross-validation</h3>
  <p>A model that does well on its training data can still fail on new data. We want to know the performance on <b>unseen</b> data (generalisation). That is why we split the data randomly, e.g. 60/20/20:</p>
  <div class="steps">
    <div class="st"><b>Training (60 %)</b><span>The model learns here.</span></div>
    <div class="st"><b>Validation (20 %)</b><span>Compare models and settings.</span></div>
    <div class="st"><b>Test (20 %)</b><span>At the end, only once.</span></div>
  </div>
  <p>Why not use the test set right away? Because you look at the validation set often while fine-tuning, and so it is indirectly learned too. The test is the exam you only sit at the end. Before that, you retrain the best model on training and validation together (more data helps) and only evaluate this model once on the test set. By the way, 60/20/20 is the same as 80/20 and then 75:25 of that.</p>
  <p><b>Cross-validation (k-fold)</b>: The data is split into k equal parts. k times you train on k−1 parts and test on the remaining one, then you take the average. This uses the data better, but costs k times more computing time. Variants: stratified (same class proportions per part) and leave-one-out.</p>
  <div class="merk"><b>CV produces k different models</b><p>With 5-fold CV you get <b>5 separately trained models</b> with the same settings (algorithm and hyperparameters), but different learned parameters, because each sees different training data. They are only used for measuring and are discarded afterwards. What remains is the average of the k errors as an estimate for this configuration. The final model only comes into being when you retrain the best configuration once on all the training data.</p></div>
  <p class="note"><b>With the 10 apartments:</b> With 10 apartments, 10-fold is the same as <b>leave-one-out</b>: ten times you train on 9 apartments and test on the tenth. The line from above has an RMSE of 103 CHF on the known apartments, and <b>123 CHF</b> on the apartment left out each time. This second value is the more honest number.</p>
  <pre><code>from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

pipe = Pipeline([("scaler", StandardScaler()), ("model", LinearRegression())])
scores = cross_val_score(pipe, X, y, cv=10,    # 10 folds
                         scoring="neg_root_mean_squared_error")   # without scoring: R²
-scores.mean(), scores.std()                   # RMSE (sklearn returns it negative)</code></pre>
  <p><b>How many runs?</b> With k folds there are k runs; each row is validation exactly once and training k−1 times. In each run a <b>new</b> model (and with a pipeline also a new imputer/scaler) is trained from scratch, evaluated and discarded. Nothing is «optimised further 4 times». The mean of the k scores rates the <b>setup</b> (model type, hyperparameters, preprocessing), the spread shows its stability. The test set is not part of the CV. You then train the final model once on all development data (training + validation) and test it once. A search over n candidates means n × k trainings (<code>GridSearchCV</code> with <code>refit=True</code> retrains by itself at the end).</p>
  <div class="demo" id="cvDemo">
    <div class="tag">Demo</div><h4>Cross-validation step by step</h4>
    <p class="hint">30 points (sine curve plus noise). Choose k and the polynomial degree, then step through the runs. In each run a <b>new</b> model (scaler and polynomial) is learned only on the filled points and tested on the hollow points (test fold).</p>
    <svg class="plot" id="cvStrip" viewBox="0 0 320 44" role="img" aria-label="Split of the data into k folds, the test fold is marked"></svg>
    <svg class="plot" id="cvSvg" viewBox="0 0 320 220" role="img" aria-label="Training points, test points and the polynomial learned in this run" style="margin-top:10px"></svg>
    <div class="ctl"><label for="cvK">k (folds)</label><input type="range" id="cvK" min="0" max="2" step="1" value="1"><output id="cvKO"></output></div>
    <div class="ctl"><label for="cvDeg">Degree</label><input type="range" id="cvDeg" min="1" max="9" step="1" value="3"><output id="cvDegO"></output></div>
    <div class="ctl"><label for="cvRun">Run</label><input type="range" id="cvRun" min="1" max="5" step="1" value="1"><output id="cvRunO"></output></div>
    <div class="stats"><span>Scaler (train only): mean <b id="cvMu"></b>, std <b id="cvSd"></b></span><span>Error of this run (MSE) <b id="cvMse"></b></span></div>
    <svg class="plot" id="cvBars" viewBox="0 0 320 150" role="img" aria-label="Error per run and mean" style="margin-top:12px"></svg>
    <div class="stats"><span>CV error (mean) <b id="cvMean"></b></span><span>Spread (std) <b id="cvStd"></b></span></div>
    <p class="hint" id="cvMsg"></p>
    <p class="hint">Bars: error per run, the selected run is blue. Dashed: the mean, which is the CV estimate. Each run has a different scaler mean and a different curve, because it sees different training points. The bars show how much a single split depends on chance.</p>
  </div>
  <div class="merk" id="ml-pipeline"><b>Key takeaway</b><p>Pipeline = steps (scaling, model) are handled together, and in each fold they are learned only from that fold's training part. This prevents leakage and keeps the code clean.</p></div>

  <h3 id="ml-fs">5 · Feature selection</h3>
  <p>More features are not automatically better. With many dimensions, data becomes «sparse» and models become harder to train (<i>curse of dimensionality</i>). Superfluous features raise the risk of overfitting and make the model hard to explain.</p>
  <ul>
    <li><b>Filter</b>: rate features by statistics or correlation (e.g. <code>X.corr()</code>).</li>
    <li><b>Wrapper</b>: try out different sets of features with a model.</li>
    <li><b>Embedded</b>: the selection is built into the model (Lasso, see below).</li>
  </ul>
  <p>In the workflow, feature selection appears twice:</p>
  <ul>
    <li><b>Manual</b> (step 4): Using domain knowledge and EDA, you remove what does not belong in the model: IDs, names, columns with leakage, almost empty columns, duplicates such as <code>qm</code> and <code>Zimmer</code>. This happens before preprocessing.</li>
    <li><b>Automatic</b> (step 7): filter, wrapper or embedded as a step in the <code>Pipeline</code>, after imputing and scaling. This way the selection in each CV fold is computed only from that fold's training data.</li>
  </ul>
  <pre><code>from sklearn.feature_selection import SelectFromModel
pipe = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale", StandardScaler()),
    ("select", SelectFromModel(Lasso(alpha=0.1))),
    ("model", LinearRegression()),
])</code></pre>
  <pre><code>import seaborn as sns
sns.heatmap(data.corr(), annot=True, cmap="Reds")</code></pre>
  <p class="note"><b>With the 10 apartments:</b> The correlation with the price is 0.96 for <code>qm</code>, 0.96 for <code>Zimmer</code> and only 0.52 for <code>Lage</code> (still useful, see regularisation). At the same time, <code>qm</code> and <code>Zimmer</code> correlate with each other at 0.996: they are practically the same feature (large apartments have more rooms). Leaving one of them out costs almost no information.</p>
  <div class="falle"><b>Pitfall</b><p>Correlation is not causation. The slide joke about pirates and global warming shows it: two things can move together without one causing the other.</p></div>

  <h3 id="ml-bv">6 · Bias and variance: underfitting and overfitting</h3>
  <ul>
    <li><b>Underfitting (high bias)</b>: The model is too simple and misses the pattern. Poor on training <i>and</i> test.</li>
    <li><b>Overfitting (high variance)</b>: The model also memorises the noise. Very good on training, poor on test.</li>
  </ul>
  <p>More complex models have less bias but more variance. We are looking for the middle ground. Here is a polynomial of varying degree fitted to points of a sine curve with noise:</p>

  <p class="note"><b>With the 10 apartments:</b> Polynomials of different degrees for the price over m². Each time the RMSE on the known apartments and on the left-out apartment (leave-one-out):</p>
  <div class="tablewrap"><table>
    <tr><th>Degree</th><th class="num">known apartments</th><th class="num">left-out apartment</th></tr>
    <tr><td>1 (line)</td><td class="num">103</td><td class="num">123</td></tr>
    <tr><td>3</td><td class="num">100</td><td class="num">174</td></tr>
    <tr><td>5</td><td class="num">86</td><td class="num">2,652</td></tr>
    <tr><td>9</td><td class="num">0</td><td class="num">several 100,000</td></tr>
  </table></div>
  <p>Degree 9 goes exactly through all 10 points, and the error on the known apartments is 0, but for a new apartment the prediction is useless. That is overfitting in its purest form. Degree 1 is by far the best here, because the data is almost linear.</p>
  <div class="demo" id="bvDemo">
    <div class="tag">Demo</div><h4>Model complexity: polynomial degree</h4>
    <svg class="plot" id="bvSvg" viewBox="0 0 320 220" role="img" aria-label="Data points, true curve and fitted polynomial"></svg>
    <div class="ctl"><label for="bvDeg">Degree</label><input type="range" id="bvDeg" min="1" max="9" step="1" value="1"><output id="bvDegO"></output></div>
    <div class="stats"><span>Training error <b id="bvTr"></b></span><span>Test error <b id="bvTe"></b></span></div>
    <p class="hint" id="bvMsg"></p>
    <svg class="plot" id="bvErr" viewBox="0 0 320 150" role="img" aria-label="Training and test error per polynomial degree" style="margin-top:12px"></svg>
    <p class="hint">Blue: training error. Orange: test error (60 new points the model never saw). The training error keeps falling, the test error has its minimum in the middle. The vertical line shows the chosen degree.</p>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Diagnosis</th><th>Training</th><th>Test</th><th>Remedy</th></tr>
    <tr><td>Underfitting</td><td>poor</td><td>poor (similar)</td><td>more features, higher degree</td></tr>
    <tr><td>Overfitting</td><td>very good</td><td>clearly worse</td><td>fewer features, regularisation, more data</td></tr>
  </table></div>

  <h3 id="ml-reg">7 · Regularisation</h3>
  <p>Regularisation slows down overfitting: a <b>penalty for large coefficients</b> is added to the loss function. A parameter (<code>alpha</code> or λ) sets its strength. Large coefficients are the typical sign of a model that chases the noise.</p>
  <div class="tablewrap"><table>
    <tr><th>Method</th><th>Penalty</th><th>Effect</th></tr>
    <tr><td><b>Ridge</b> (L2)</td><td>sum of the squared coefficients</td><td>makes all coefficients smaller; good with many correlated features</td></tr>
    <tr><td><b>Lasso</b> (L1)</td><td>sum of the absolute values of the coefficients</td><td>sets unimportant coefficients to <b>exactly 0</b> (automatic feature selection)</td></tr>
    <tr><td><b>ElasticNet</b></td><td>L1 and L2 mixed</td><td>compromise, more robust than either alone</td></tr>
  </table></div>
  <p class="note"><b>With the 10 apartments:</b> All three features (m², rooms, location) scaled, weights in CHF per standard deviation. Without regularisation: <code>190 / 157 / 103</code>. With <b>Ridge</b> (alpha = 10) they all shrink: <code>119 / 119 / 67</code>; m² and rooms share the influence because they are almost the same. With <b>Lasso</b> (alpha = 150) only one feature remains: <code>225 / 0 / 0</code>. Rooms are dropped, as explained above. But location is dropped too, even though it is useful (with location, R² rises from 0.93 to 0.99): the alpha is too large. At alpha = 50 location stays in (211 / 96 / 64). That is why you choose alpha by cross-validation, and a low individual correlation does not mean that a feature is unimportant.</p>
  <div class="merk"><b>Key takeaway</b><p>Ridge shrinks, Lasso removes. The larger alpha, the stronger the brake (with a very large alpha there is a risk of underfitting).</p></div>

  <h3 id="ml-hp">8 · Hyperparameters and model selection</h3>
  <p>The model learns <b>parameters</b> by itself (the coefficients). <b>Hyperparameters</b> you set beforehand (learning rate, alpha, polynomial degree). You find good values by searching, each time with cross-validation:</p>
  <ul>
    <li><b>Grid search</b>: try all combinations from your list (thorough, but slow).</li>
    <li><b>Random search</b>: a random selection of the combinations (often almost as good, much faster).</li>
  </ul>
  <pre><code>from sklearn.linear_model import Lasso
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([("scaler", StandardScaler()), ("lasso", Lasso())])
grid = {"lasso__alpha": [0.1, 1, 10], "lasso__max_iter": [100, 1000, 10000]}
search = GridSearchCV(pipe, grid, cv=5, n_jobs=-1)
search.fit(X_trainval, y_trainval)
search.best_params_, search.best_estimator_</code></pre>
  <p>The name before the double underscore (<code>lasso__alpha</code>) is the name of the step in the pipeline.</p>

  <h3 id="ml-titanic">9 · To finish: Titanic in 10 steps</h3>
  <p>Everything from this chapter together, on a real data set: who survived the Titanic? The numbers are the steps of the <a href="#ml-ablauf">workflow diagram</a>. The target is a class (survived yes or no), so this uses logistic regression from the classification chapter instead of linear regression. The workflow stays the same.</p>
  <div class="box">
    <pre><code>import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

# 1 + 2 · Load, lock away the test set immediately
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})
X, y = df.drop(columns=&quot;Survived&quot;), df[&quot;Survived&quot;]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
# 3 · EDA only on X_tr (charts on the detailed page)
# 4 · Feature selection (manual): drop ID, Name, Ticket, Cabin
num, cat = [&quot;Age&quot;, &quot;Fare&quot;, &quot;SibSp&quot;, &quot;Parch&quot;], [&quot;Pclass&quot;, &quot;Sex&quot;, &quot;Embarked&quot;]
# 5 + 6 · Impute, one-hot, scale; 7 · L1 as automatic feature selection
prep = make_column_transformer(
    (make_pipeline(SimpleImputer(strategy=&quot;median&quot;), StandardScaler()), num),
    (make_pipeline(SimpleImputer(strategy=&quot;most_frequent&quot;), OneHotEncoder(handle_unknown=&quot;ignore&quot;)), cat))
model = make_pipeline(prep, LogisticRegression(l1_ratio=1, solver=&quot;liblinear&quot;))  # before sklearn 1.8: penalty=&quot;l1&quot;
# 8 + 9 · Cross-validation, choose the best C, retrain on all 80 %
search = GridSearchCV(model, {&quot;logisticregression__C&quot;: [0.01, 0.1, 1, 10]}, cv=5).fit(X_tr[num + cat], y_tr)
# 10 · Exactly once on the test set
print(&quot;CV-Accuracy:&quot;, round(search.best_score_, 3), &quot;| Test-Accuracy:&quot;, round(search.score(X_te[num + cat], y_te), 3))</code></pre>
    <pre class="out">CV-Accuracy: 0.803 | Test-Accuracy: 0.793</pre>
    <p class="hint">The test accuracy is close to the CV estimate: the model is not overfitted. Every step with explanations, EDA charts, outputs and a second, more detailed version with Random Forest: <a href="titanic.html">Titanic in detail</a>.</p>
  </div>
  <p class="note"><b>With the 10 apartments:</b> The hyperparameters here are the polynomial degree (1 to 9) and, for Ridge/Lasso, the alpha. You try out each setting, measure the error on the left-out apartment each time (cross-validation) and take the best. For the polynomial degree, degree 1 wins (123 CHF), not degree 9 (training 0 CHF, but several 100,000 on the left-out apartment). With real data you would also keep a test set untouched until the end; with only 10 apartments we do without it.</p>`,
  notebooks: [
    { file: 'Fehlende_Werte_Imputation.ipynb', desc: `With a cross-validation example (4 folds, new imputer per fold, final model). Step-by-step example with 10 records, 4 features and SimpleImputer: learn the median on the training data only, then apply it to validation and test.` },
    { file: 'Workflow_Train_Val_Test_CV.ipynb', desc: `The whole workflow with 25 apartments: 60/20/20 split by hand (imputer, scaler, model, validation, final model, test), then the same with cross-validation and GridSearchCV, comparing preprocessing variants (including a leakage mistake), StratifiedKFold and TimeSeriesSplit.` },
    { file: 'Supervised_Learning_1_Uebungen_own.ipynb', desc: `10 exercises with scikit-learn: gradient descent, error measures, train/test, cross-validation, imputation, overfitting, Lasso and Ridge, GridSearch, feature selection.` }
  ],
  quiz: [
    { q: `Your model has a training error of 1 and a test error of 20. What is going on and what do you do?`, a: `Overfitting. Fewer or simpler features, regularisation (Ridge/Lasso), more data.` },
    { q: `Why do you need a validation set in addition to the test set?`, a: `The validation set is used many times while fine-tuning and is indirectly learned too. The test set stays unseen and gives the honest estimate at the end.` },
    { q: `When do you choose Lasso instead of Ridge?`, a: `When you have many features and suspect that some are unimportant: Lasso sets their coefficients to exactly 0.` },
    { q: `With 4-fold cross-validation: how often is a model trained, and is the model optimised further along the way?`, a: `4 times, each time a new model (with a new imputer/scaler) from scratch on 3 folds, evaluated on the 4th fold and discarded. The 4 scores rate the setup. Afterwards the chosen setup is trained once on all development data and tested once on the test set.` },
    { q: `What is <code>Pipeline</code> for?`, a: `It chains steps such as scaling and the model. In cross-validation each step is then learned only from the training data of the respective fold, which prevents leakage.` },
    { q: `What is the difference between grid and random search?`, a: `Grid tries all combinations, random a random selection. Random is often similarly good and much faster.` },
  ],
});
