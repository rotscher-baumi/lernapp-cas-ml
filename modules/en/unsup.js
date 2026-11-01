/* English texts for the module "unsup" (Unsupervised Learning: clustering, dimensionality reduction). Fields replace the German ones when the language is EN. */
LernApp.translate('unsup', {
  nav: 'Unsupervised',
  title: `Unsupervised Learning`,
  kicker: `Module 3 · Unsupervised Learning (Sat 31.10.)`,
  summary: `Supervised or unsupervised, clustering, anomalies, PCA, t-SNE and UMAP`,
  html: `  <p>So far, all data had an answer (price, class). In <b>Unsupervised Learning</b> there is none. The model has to find structure in the data on its own. Three main tasks:</p>
  <div class="grid2">
    <div><h4>Clustering</h4><p>Divide similar data points into groups. Example: customer segments, groups of documents.</p></div>
    <div><h4>Finding anomalies</h4><p>Find points that do not fit the rest. Example: suspicious payments.</p></div>
    <div><h4>Dimensionality reduction</h4><p>Summarise many features in a few, for example to plot data in 2D.</p></div>
  </div>
  <p>The course day works with a Lego dataset (scraped from the toy shop's website), the labs with wine measurements, simulated payments and handwritten digits. There is no «right», only useful or not. That is why the <b>interpretation</b> is part of the result.</p>

  <h3 id="unsup-ablauf">The whole workflow at a glance</h3>
  <p>In Unsupervised Learning there is no right answer to compare against. So the workflow is a loop of trying, checking and interpreting, not a straight path to a test result as in <a href="#ml-ablauf">Supervised Learning</a>.</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig">
    <div class="ab-scroll">
    <svg viewBox="-60 0 790 850" role="img" aria-label="Workflow of an unsupervised project: clarify the question, look at the data, preprocess, scale, optionally reduce dimensions, choose a method, choose parameters with a loop, check stability, visualise, interpret and if needed go back to preprocessing. There is no test set.">
      <defs>
        <marker id="ub-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--line)"/>
        </marker>
        <marker id="ub-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" style="fill:var(--warn)"/>
        </marker>
      </defs>

      <g class="ab-step" data-s="1" tabindex="0" role="button" aria-expanded="false" aria-label="Step 1: open explanation">
      <rect x="60" y="20" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="42" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">1 · Clarify the question</text>
      <text x="210" y="60" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Groups, outliers or a 2D picture?</text>
      </g>
      <line x1="210" y1="72" x2="210" y2="104" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="46" x2="440" y2="46" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <g class="ab-step" data-s="y" tabindex="0" role="button" aria-expanded="false" aria-label="Target column y available?: open explanation">
      <rect x="440" y="20" width="270" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="575" y="42" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">Target column y available?</text>
      <text x="575" y="60" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">yes → Supervised · no → continue here</text>
      </g>

      <g class="ab-step" data-s="2" tabindex="0" role="button" aria-expanded="false" aria-label="Step 2: open explanation">
      <rect x="60" y="104" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="126" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">2 · Load and inspect data</text>
      <text x="210" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Types, missing values, outliers (EDA)</text>
      </g>
      <line x1="210" y1="156" x2="210" y2="188" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="130" x2="440" y2="130" marker-end="url(#ub-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>
      <g class="ab-step" data-s="t" tabindex="0" role="button" aria-expanded="false" aria-label="No test set: open explanation">
      <rect x="440" y="104" width="270" height="52" rx="6" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4"/>
      <text x="575" y="126" text-anchor="middle" style="fill:var(--warn);font-size:14px;font-weight:600;font-family:var(--f-body)">No test set</text>
      <text x="575" y="144" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">no right answer to compare against</text>
      </g>

      <g class="ab-step" data-s="3" tabindex="0" role="button" aria-expanded="false" aria-label="Step 3: open explanation">
      <rect x="60" y="188" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="210" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">3 · Preprocess</text>
      <text x="210" y="228" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">One-hot, missing values, select features</text>
      </g>
      <line x1="210" y1="240" x2="210" y2="272" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="4" tabindex="0" role="button" aria-expanded="false" aria-label="Step 4: open explanation">
      <rect x="60" y="272" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="294" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">4 · Scale</text>
      <text x="210" y="312" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">StandardScaler, RobustScaler for outliers</text>
      </g>
      <line x1="210" y1="324" x2="210" y2="356" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="5" tabindex="0" role="button" aria-expanded="false" aria-label="Step 5: open explanation">
      <rect x="60" y="356" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="378" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">5 · Reduce dimensions</text>
      <text x="210" y="396" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">optional: PCA, e.g. keep 90 % of variance</text>
      </g>
      <line x1="210" y1="408" x2="210" y2="440" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="6" tabindex="0" role="button" aria-expanded="false" aria-label="Step 6: open explanation">
      <rect x="60" y="440" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="462" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">6 · Choose a method</text>
      <text x="210" y="480" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">to fit the question and shape of the data</text>
      </g>
      <line x1="210" y1="492" x2="210" y2="524" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="466" x2="410" y2="466" marker-end="url(#ub-a)" style="stroke:var(--accent);stroke-width:1.5;fill:none"/>
      <rect x="410" y="414" width="300" height="146" rx="8" style="fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 4"/>
      <text x="424" y="434" style="fill:var(--accent);font-size:12px;font-weight:600;font-family:var(--f-body)">Which method for what?</text>
      <text x="424" y="458" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">k-Means</text><text x="534" y="458" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">round, similar size</text>
      <text x="424" y="480" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Hierarchical</text><text x="534" y="480" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">tree, choose k later</text>
      <text x="424" y="502" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">DBSCAN</text><text x="534" y="502" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">any shape, noise</text>
      <text x="424" y="524" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">GMM</text><text x="534" y="524" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">probabilities</text>
      <text x="424" y="546" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Isolation Forest</text><text x="534" y="546" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">outlier ranking</text>

      <g class="ab-step" data-s="7" tabindex="0" role="button" aria-expanded="false" aria-label="Step 7: open explanation">
      <rect x="60" y="524" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="546" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">7 · Choose parameters</text>
      <text x="210" y="564" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">k, eps, linkage: elbow, silhouette, BIC</text>
      </g>
      <line x1="210" y1="576" x2="210" y2="608" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <path d="M60,564 H34 V538 H60" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <text x="26" y="548" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">try</text>
      <text x="26" y="562" text-anchor="end" style="fill:var(--muted);font-size:11.5px;font-family:var(--f-mono)">other</text>

      <g class="ab-step" data-s="8" tabindex="0" role="button" aria-expanded="false" aria-label="Step 8: open explanation">
      <rect x="60" y="608" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="630" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">8 · Check stability</text>
      <text x="210" y="648" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">other seed, subsample, ARI</text>
      </g>
      <line x1="210" y1="660" x2="210" y2="692" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>

      <g class="ab-step" data-s="9" tabindex="0" role="button" aria-expanded="false" aria-label="Step 9: open explanation">
      <rect x="60" y="692" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="714" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">9 · Visualise</text>
      <text x="210" y="732" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">PCA, t-SNE or UMAP in 2D</text>
      </g>
      <line x1="210" y1="744" x2="210" y2="776" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <line x1="360" y1="718" x2="410" y2="718" marker-end="url(#ub-a)" style="stroke:var(--line);stroke-width:1.5;fill:none"/>
      <rect x="410" y="682" width="300" height="72" rx="8" style="fill:none;stroke:var(--line);stroke-width:1.5;stroke-dasharray:3 4"/>
      <text x="424" y="702" style="fill:var(--muted);font-size:12px;font-family:var(--f-body);font-weight:600">Reading the map correctly</text>
      <text x="424" y="722" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">PCA: linear, state explained variance</text>
      <text x="424" y="740" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">t-SNE/UMAP: only neighbourhoods count</text>

      <g class="ab-step" data-s="10" tabindex="0" role="button" aria-expanded="false" aria-label="Step 10: open explanation">
      <rect x="60" y="776" width="300" height="52" rx="6" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>
      <text x="210" y="798" text-anchor="middle" style="fill:var(--fg);font-size:14px;font-weight:600;font-family:var(--f-body)">10 · Interpret and name</text>
      <text x="210" y="816" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-family:var(--f-body)">Profile in original units, makes sense?</text>
      </g>

      <path d="M60,808 H-38 V220 H60" marker-end="url(#ub-al)" style="stroke:var(--warn);stroke-width:1.5;stroke-dasharray:6 4;fill:none"/>
      <text x="-44" y="514" text-anchor="middle" transform="rotate(-90 -44 514)" style="fill:var(--warn);font-size:11.5px;font-family:var(--f-mono)">does not make sense: back to step 3</text>
    </svg>
    </div>
    <div class="ab-detail" id="ubDetail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Scaling (blue) is a must, because almost all methods compute distances. There is no test set (orange): instead of the right answer, you check with the silhouette, stability and domain knowledge. The loops show that you adjust settings and preprocessing several times.</figcaption>
  </figure>
  <div class="box" id="unsup-titanic">
    <h4>Complete example: Titanic without a target column</h4>
    <p class="hint">Heavily shortened. The same passengers as in the <a href="titanic.html">supervised example</a>, but the question is a different one: which types of passengers were there? <code>Survived</code> does not go into the model, only at the end for comparison. The numbers are the steps of the figure above; the parts run one after another like cells in a notebook.</p>
    <pre><code>import numpy as np, pandas as pd, matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, adjusted_rand_score

# 1 · Question: which types of passengers were there? Survived stays out.
# 2 · Load and inspect data
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})  # 1 empty row

# 3 · Preprocess: everything into numbers, fill age with the median, take the log of the skewed Fare
X = pd.DataFrame({&quot;Klasse&quot;: df[&quot;Pclass&quot;], &quot;Frau&quot;: (df[&quot;Sex&quot;] == &quot;female&quot;).astype(int),
                  &quot;Alter&quot;: df[&quot;Age&quot;].fillna(df[&quot;Age&quot;].median()),
                  &quot;Familie&quot;: df[&quot;SibSp&quot;] + df[&quot;Parch&quot;], &quot;logFare&quot;: np.log1p(df[&quot;Fare&quot;])})

# 4 · Scale (k-Means computes distances)
X_s = StandardScaler().fit_transform(X)

# 5 · Reduce dimensions: not needed here, only 5 features
# 6 + 7 · Choose k-Means, determine k with the silhouette
ks = range(2, 9)
sil = [silhouette_score(X_s, KMeans(k, n_init=10, random_state=0).fit_predict(X_s)) for k in ks]
plt.figure(figsize=(4.5, 3)); plt.plot(ks, sil, &quot;o-&quot;); plt.xlabel(&quot;k&quot;); plt.ylabel(&quot;Silhouette&quot;); plt.show()
k = ks[int(np.argmax(sil))]</code></pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-unsup-1.png" alt="Silhouette for k equal to 2 to 8, maximum at k equal to 6" loading="lazy"><figcaption>The silhouette is highest at k = 6. The difference to k = 5 and 7 is small, so the stability check follows.</figcaption></figure>
    <pre><code># 8 · Stability: different random start, same groups?
labels = KMeans(k, n_init=10, random_state=0).fit_predict(X_s)
other = KMeans(k, n_init=10, random_state=1).fit_predict(X_s)
print(&quot;k =&quot;, k, &quot;| ARI zwischen zwei Läufen:&quot;, round(adjusted_rand_score(labels, other), 2))</code></pre>
    <pre class="out">k = 6 | ARI zwischen zwei Läufen: 0.83</pre>
    <pre><code># 9 · Visualise: PCA to 2D, coloured by cluster
pca = PCA(2).fit(X_s)
Z = pca.transform(X_s)
plt.figure(figsize=(4.5, 3.5)); plt.scatter(Z[:, 0], Z[:, 1], c=labels, s=8, cmap=&quot;tab10&quot;)
plt.title(f&quot;PCA, {pca.explained_variance_ratio_.sum():.0%} der Varianz&quot;); plt.show()</code></pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-unsup-2.png" alt="PCA scatter plot of the passengers, coloured by six clusters" loading="lazy"><figcaption>The PCA map shows 67 % of the variance. The clusters partly overlap in 2D; they are separated in all 5 features.</figcaption></figure>
    <pre><code># 10 · Interpret in original units; Survived only now for comparison
print(X.assign(Cluster=labels, Survived=df[&quot;Survived&quot;]).groupby(&quot;Cluster&quot;).mean().round(2).assign(n=np.bincount(labels)))</code></pre>
    <pre class="out">         Klasse  Frau  Alter  Familie  logFare  Survived    n
Cluster                                                      
0          2.83  0.00  27.70     0.24     2.27      0.13  373
1          1.35  0.00  25.75     0.92     3.87      0.41   98
2          2.64  1.00  24.84     0.84     2.68      0.71  184
3          1.40  0.04  53.58     0.48     3.47      0.23   81
4          2.98  0.50  17.79     5.80     3.55      0.11   56
5          1.06  1.00  34.31     1.11     4.45      0.97   99</pre>
    <p>How to read the table: cluster 0 are men in 3rd class travelling alone (373, only 13 % survived). Cluster 5 are women in 1st class (97 % survived), cluster 4 large families in 3rd class (11 %). The clusters do not know <code>Survived</code> and still separate the chances of survival clearly, because class, sex and family determined them.</p>
    <p class="note">An ARI of 0.83 between two runs means: the groups are largely, but not completely, stable. Do not treat k = 6 as «the truth», but as one useful partition.</p>
  </div>
  <div class="merk"><b>Key takeaway</b><p>Scale, compare several settings, check stability and explain the clusters in original units. A result is good if it is stable and makes sense in the domain.</p></div>

  <h3 id="unsup-vs">1 · Supervised or unsupervised?</h3>
  <p>The type of problem does not depend on the method, but on the <b>data and the question</b>. What matters is: is there a column with the answer you are looking for (target column <code>y</code>, label)?</p>
  <div class="tablewrap"><table>
    <tr><th></th><th>Supervised</th><th>Unsupervised</th></tr>
    <tr><td>Data</td><td>features <code>X</code> <b>and</b> target column <code>y</code></td><td>only features <code>X</code></td></tr>
    <tr><td>Question</td><td>«What is <code>y</code> for a new case?»</td><td>«What structure is in <code>X</code>?»</td></tr>
    <tr><td>Tasks</td><td>regression (number), classification (class)</td><td>clustering, anomalies, dimensionality reduction</td></tr>
    <tr><td>Examples</td><td>apartment price, spam yes/no, survived on the Titanic</td><td>customer segments, suspicious payments, plotting 13 measurements in 2D</td></tr>
    <tr><td>Evaluation</td><td>comparison with the right answer (MSE, accuracy, ROC)</td><td>no right answer: silhouette, stability, domain knowledge</td></tr>
    <tr><td>Splitting</td><td>train, validation, test required</td><td>usually all data; a test set only if the model later assigns new data</td></tr>
    <tr><td>Result</td><td>a model that makes predictions</td><td>groups, scores or new coordinates that you have to interpret</td></tr>
    <tr><td>Methods</td><td>linear and logistic regression, kNN, trees</td><td>k-Means, hierarchical, DBSCAN, GMM, Isolation Forest, PCA, t-SNE, UMAP</td></tr>
  </table></div>
  <p><b>How do you recognise the type of problem?</b></p>
  <ol>
    <li>Is there a target column, and is it known for enough rows? Then <b>supervised</b>: number → regression, category → classification.</li>
    <li>Is there no target column, and you are looking for groups, outliers or an overview? Then <b>unsupervised</b>.</li>
    <li>Only a few rows have a label, many do not? Then <b>semi-supervised</b>: for example, cluster, name the groups by hand and then continue learning supervised.</li>
  </ol>
  <div class="demo" id="pvDemo">
    <div class="tag">Self-test</div><h4>Which type of problem is this?</h4>
    <p class="hint">Choose a task and think about it yourself first.</p>
    <div class="btnrow" id="pvBtns"></div>
    <p id="pvMsg"></p>
  </div>
  <div class="merk"><b>Same data, different question</b><p>Customer data with a column «has cancelled»: «Who cancels next?» is classification (supervised). «Which types of customers are there?» is clustering (unsupervised); the column «has cancelled» stays out.</p></div>
  <div class="falle"><b>Pitfall</b><p>If labels are available (for example the wine varieties in the lab), they must <b>not go into the model</b> in Unsupervised Learning. You can only put them next to the clusters afterwards as a check (ARI, see <a href="#unsup-profil">Checking clusters</a>).</p></div>

  <h3 id="unsup-dist">2 · Clustering and anomalies</h3>
  <p>Goal: points in the same cluster are more similar to each other than to points in other clusters. «Similar» is measured by a <b>distance</b>:</p>
  <ul>
    <li><b>Euclidean distance</b>: the straight line, <code>√(Σ (a<sub>i</sub> − b<sub>i</sub>)²)</code>. For numbers.</li>
    <li><b>Simple matching</b>: counts in how many categories two points do <i>not</i> agree. For categories.</li>
    <li><b>Dynamic Time Warping</b>: distance between time series that are slightly shifted or stretched.</li>
  </ul>
  <p><b>Anomaly detection</b> is the other side of the coin: after clustering, points that fit no cluster well or lie far from their centre count as suspicious (e.g. suspected fraud). A dedicated method for this is the <a href="#unsup-anomalie">Isolation Forest</a>.</p>

  <h3 id="unsup-kmeans">3 · k-Means</h3>
  <p>You set the number of clusters <b>k</b> yourself. Then the algorithm repeats two steps until nothing changes any more:</p>
  <ol>
    <li>Assign each point to the <b>nearest centre</b>.</li>
    <li>Move each centre to the <b>mean</b> of its points.</li>
  </ol>
  <p>The goal behind it: make the sum of squared distances within the clusters (<b>WSS</b>, within-cluster sum of squares) as small as possible. The start is random, so a different start can give a different result.</p>
  <div class="demo" id="kmDemo">
    <div class="tag">Demo</div><h4>k-Means step by step</h4>
    ${KMeansDemo.html('km')}
  </div>
  <div class="falle"><b>Pitfall (scaling)</b><p>k-Means computes distances. If one feature has large numbers (price in francs) and another small ones (rating 1 to 5), almost only the large one decides. So <b>scale first</b> (<code>StandardScaler</code>).</p></div>
  <div class="demo" id="scDemo">
    <div class="tag">Demo</div><h4>Without and with scaling</h4>
    <p class="hint">Two real groups differ in the small feature B (0.2 versus 0.8). The large feature A (0 to 1000) is only noise.</p>
    <svg class="plot" id="scSvg" viewBox="0 0 320 200" role="img" aria-label="Points by feature A and B, coloured by k-Means"></svg>
    <div class="btnrow"><button id="scRaw" class="pri">Without scaling</button><button id="scStd">With scaling</button></div>
    <p class="hint" id="scMsg"></p>
  </div>
  <pre><code>from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

X_s = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X_s)
labels = km.labels_            # cluster per row
km.cluster_centers_            # centres (in the scaled space)
km.inertia_                    # WSS</code></pre>

  <h3 id="unsup-k">4 · How many clusters?</h3>
  <p>The methods from Supervised Learning (test set, accuracy) do not work, as there is no right answer. Three common aids:</p>
  <ul>
    <li><b>Elbow method</b>: plot WSS for k = 1, 2, 3 … WSS falls as k grows (for a good solution), but after the «elbow» only a little. That is where you choose k.</li>
    <li><b>Silhouette</b>: per point: <code>s = (b − a) / max(a, b)</code>, with a = mean distance to the points in its <i>own</i> cluster, b = mean distance to the <i>nearest other</i> cluster. Close to 1 fits well, close to 0 lies between two clusters, negative is wrongly assigned. You take the k with the highest average.</li>
    <li><b>Gap statistic</b>: compares log(WSS) of your data with log(WSS) of random data in the same value range. The difference is called the «gap». You choose the smallest k after which the gap hardly grows any more (simplified: the k with the largest gap).</li>
  </ul>
  <div class="demo" id="elDemo">
    <div class="tag">Demo</div><h4>Elbow and silhouette for the points above</h4>
    <svg class="plot" id="elSvg" viewBox="0 0 320 200" role="img" aria-label="WSS and silhouette for k equal to 1 to 8"></svg>
    <div class="stats"><span>best k by silhouette <b id="elBest"></b></span></div>
    <p class="hint">Blue: WSS (left, falls with k). Orange: silhouette (the higher, the better, from k = 2). The data has three groups: the elbow and the silhouette maximum point to k = 3.</p>
  </div>
  <div class="merk"><b>Key takeaway</b><p>The methods give suggestions, not the truth. In the end, what matters is whether the clusters make sense in the domain and can be described.</p></div>

  <h3 id="unsup-hier">5 · Hierarchical clustering</h3>
  <p>Here you do not have to choose k in advance. Each point starts as its own cluster, then the two <b>most similar</b> clusters are always merged until everything forms a tree, the <b>dendrogram</b>. Where you «cut» the tree horizontally determines the number of clusters: the higher the cut, the fewer clusters. The height of a link shows how dissimilar the merged groups were.</p>
  <p>How the distance between <i>groups</i> is measured is set by the <b>linkage</b>:</p>
  <div class="tablewrap"><table>
    <tr><th>Linkage</th><th>Distance between two groups</th><th>Tendency</th></tr>
    <tr><td>Single</td><td>smallest distance between two points</td><td>chains, long thin clusters</td></tr>
    <tr><td>Complete</td><td>largest distance between two points</td><td>compact clusters of similar size</td></tr>
    <tr><td>Average</td><td>mean of all pairs of points</td><td>compromise</td></tr>
    <tr><td>Ward</td><td>such that the WSS grows the least</td><td>compact, similar to k-Means (common choice)</td></tr>
  </table></div>
  <pre><code>from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
Z = linkage(X_s, method="ward")
dendrogram(Z)
labels = fcluster(Z, t=3, criterion="maxclust")   # 3 clusters</code></pre>
  <p class="note">Small decisions with big consequences: standardising, distance measure, linkage and number of clusters. Change only one at a time and compare.</p>

  <h3 id="unsup-dbscan">6 · Other cluster shapes: DBSCAN and GMM</h3>
  <p>k-Means and Ward look for round groups of similar size. If the groups are curved (moons in the demo above), have different densities or there is noise, other methods help.</p>
  <h4>DBSCAN: groups by density</h4>
  <p>A point with at least <code>min_samples</code> neighbours within the radius <code>eps</code> is a <b>core point</b>. Core points that lie close together form a cluster, and points at the edge belong to it. Everything else is <b>noise</b> (label <code>-1</code>).</p>
  <ul>
    <li>You do not have to specify k, and the clusters may have any shape.</li>
    <li>Outliers are marked as noise instead of pulling a centre away.</li>
    <li>Difficult: choosing a suitable <code>eps</code>. Too small gives a lot of noise, too large merges everything. For groups with different densities, no single <code>eps</code> fits. Then <b>HDBSCAN</b> helps, which can handle different densities.</li>
    <li>DBSCAN also computes distances: scale first.</li>
  </ul>
  <pre><code>from sklearn.cluster import DBSCAN, HDBSCAN
labels = DBSCAN(eps=0.2, min_samples=5).fit_predict(X_s)   # -1 = noise
(labels == -1).mean()                                        # share of noise
labels = HDBSCAN(min_cluster_size=15, min_samples=5).fit_predict(X_s)</code></pre>
  <p class="note">The silhouette leaves out noise points. So always also state how many points were assigned to a cluster at all.</p>
  <h4 id="unsup-gmm">Gaussian Mixture Model (GMM): probabilities instead of a fixed assignment</h4>
  <p>A GMM describes each cluster as a bell curve, in the 2D picture as an ellipse. Each point gets a <b>probability per cluster</b>; the values of a row add up to 1. A row like 0.60 / 0.35 / 0.05 shows: the point lies between two groups, the assignment is uncertain. You choose the number of components, for example, with the <b>BIC</b> (lower is better).</p>
  <pre><code>from sklearn.mixture import GaussianMixture
gmm = GaussianMixture(n_components=3, covariance_type="full", n_init=5, random_state=0).fit(X_s)
gmm.predict_proba(X_s)     # probability per cluster, row sum 1
gmm.bic(X_s)               # compare for several n_components</code></pre>
  <div class="tablewrap"><table>
    <tr><th>Method</th><th>Specify k?</th><th>Cluster shape</th><th>Noise</th><th>Good for</th></tr>
    <tr><td>k-Means</td><td>yes</td><td>round, similar size</td><td>no</td><td>quick start, large data</td></tr>
    <tr><td>Hierarchical (Ward)</td><td>later, in the dendrogram</td><td>compact</td><td>no</td><td>smaller data, looking at the tree</td></tr>
    <tr><td>DBSCAN / HDBSCAN</td><td>no</td><td>any</td><td>yes (<code>-1</code>)</td><td>curved groups, outliers</td></tr>
    <tr><td>GMM</td><td>yes (BIC helps)</td><td>ellipses</td><td>no</td><td>making uncertain assignments visible</td></tr>
  </table></div>

  <h3 id="unsup-profil">7 · Checking and explaining clusters</h3>
  <h4 id="unsup-stabil">Is the result stable?</h4>
  <p>A good clustering stays similar when you change small things: a different <code>random_state</code>, more <code>n_init</code>, a subsample of 80 % of the rows or a different scaling. You compare two partitions with the <b>Adjusted Rand Index (ARI)</b>: 1 means the same partition, around 0 means no better than chance. The cluster numbers do not matter.</p>
  <pre><code>from sklearn.metrics import adjusted_rand_score
a = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X_s)
b = KMeans(n_clusters=3, n_init=10, random_state=1).fit_predict(X_s)
adjusted_rand_score(a, b)      # close to 1 = stable</code></pre>
  <p class="note">If there are known labels (the wine varieties in lab 1), you can put them next to the clusters with the ARI <b>after</b> making your choice. If the result differs, it is not automatically wrong: the clusters can show a different structure that also makes sense.</p>
  <h4>Describing clusters</h4>
  <p>The clusters are formed on scaled data, but you want to explain them in the original units. So attach the cluster number back to the original table and describe it:</p>
  <pre><code>df["cluster"] = labels
df.groupby("cluster").agg(["mean", "median", "count"])   # profile per cluster
sns.boxplot(data=df, x="cluster", y="preis")             # distribution per cluster</code></pre>
  <p>Ask yourself: how do the groups differ? Which feature separates best? Can you give each cluster an understandable name («cheap sets for children»)? A very small cluster often consists only of outliers.</p>

  <h3 id="unsup-anomalie">8 · Finding anomalies: Isolation Forest</h3>
  <p>Idea: unusual points can be <b>isolated</b> quickly. The Isolation Forest splits the data again and again with random questions («amount larger than twice the usual?»). A normal point sits in the middle of the crowd and needs many such splits until it is alone. A suspicious point is alone after only a few splits. Many random trees together give an <b>anomaly score</b>.</p>
  <pre><code>from sklearn.ensemble import IsolationForest
model = IsolationForest(n_estimators=200, contamination="auto", random_state=42).fit(X)
score = -model.score_samples(X)          # larger = more unusual
top20 = score.argsort()[::-1][:20]       # as many as can be checked</code></pre>
  <ul>
    <li><b>Features with context</b> beat raw values: «amount compared with what is usual for this account» finds more than «largest amount».</li>
    <li>The result is a <b>ranking for people</b>, not an automatic verdict. Whoever checks needs the amount, the history and the reason why the case stands out.</li>
    <li>If real findings become known later, you measure the <b>Precision</b> at your checking budget (of 20 checked cases, how many were real?).</li>
  </ul>
  <div class="falle"><b>Pitfall</b><p>The «top 20» always deliver 20 cases, even on a day without any real anomaly. And when normal behaviour changes (all payments become larger or later), the old model suddenly reports many false alarms. Readjust reference values and model regularly.</p></div>

  <h3 id="unsup-dimred">9 · Dimensionality reduction</h3>
  <p>Real datasets often have hundreds of features. This makes training slow and interpretation hard, and leads to the <b>curse of dimensionality</b>: in many dimensions all points lie far apart, the space is «empty», and predictions for new points become unreliable.</p>
  <div class="tablewrap"><table>
    <tr><th>Two random points in the unit …</th><th class="num">mean distance</th></tr>
    <tr><td>square (2 dimensions)</td><td class="num">0.52</td></tr>
    <tr><td>cube (3 dimensions)</td><td class="num">0.66</td></tr>
    <tr><td>hypercube (1,000,000 dimensions)</td><td class="num">408.25</td></tr>
  </table></div>
  <p>Fortunately, the data usually does not lie evenly in the space, but close to a much smaller subspace (many features are constant or strongly correlated). Two approaches:</p>
  <ul>
    <li><b>Projection</b>: «drop» the data onto a plane or axis (PCA).</li>
    <li><b>Manifold learning</b>: the data lies on a curved surface (like a rolled-up Swiss roll) that you flatten out in your mind (t-SNE).</li>
  </ul>
  <div class="falle"><b>Pitfall</b><p>Every reduction loses information. Try with the original data first, and only reduce if speed, visualisation or noise justify it.</p></div>

  <h3 id="unsup-pca">10 · PCA (principal component analysis)</h3>
  <p>PCA looks for the direction in which the data <b>spreads most</b> (the first principal component), then the next direction that is perpendicular to it and best captures the remaining spread, and so on. If you keep only the first few components, you keep most of the information in fewer dimensions.</p>
  <div class="demo" id="pcDemo">
    <div class="tag">Demo</div><h4>Finding the best axis</h4>
    <svg class="plot" id="pcSvg" viewBox="0 0 320 240" role="img" aria-label="Point cloud with rotatable axis and projections"></svg>
    <div class="ctl"><label for="pcA">Angle</label><input type="range" id="pcA" min="0" max="179" step="1" value="90"><output id="pcAO"></output></div>
    <div class="btnrow"><button class="pri" id="pcBest">Best axis (PC1)</button></div>
    <div class="stats"><span>Variance on the axis <b id="pcV"></b></span><span>lost <b id="pcL"></b></span></div>
    <p class="hint">The red lines show what is lost in the projection (distance to the axis). Rotate the axis: the best direction has the largest retained variance and at the same time the smallest loss. The second component is perpendicular to it.</p>
  </div>
  <pre><code>from sklearn.decomposition import PCA
pca = PCA(n_components=2).fit(X_s)       # scale first
Z = pca.transform(X_s)                    # new 2D coordinates
pca.explained_variance_ratio_             # share of variance per component</code></pre>
  <p>With <code>explained_variance_ratio_</code> you see how much information 2 components keep. The components are mixtures of the original features and therefore harder to interpret: <code>pca.components_</code> shows how strongly each scaled feature goes into a component.</p>
  <div class="falle"><b>Pitfall (scaling)</b><p>PCA subtracts the mean, but does not equalise the spread. Without scaling, the feature with the largest numbers wins (for the wine: proline in the hundreds versus alcohol around 13), and PC1 is almost only this feature.</p></div>
  <div class="demo" id="rsDemo">
    <div class="tag">Demo</div><h4>Scale again after the PCA?</h4>
    <p class="hint">Two groups, two standardised features. Click through the three stages.</p>
    <div class="btnrow" id="rsStage" role="group" aria-label="Stage"><button data-v="0">1 · Start (scaled)</button><button data-v="1">2 · After PCA</button><button data-v="2">3 · PCA output rescaled</button></div>
    <svg class="plot" id="rsSvg" viewBox="0 0 320 240" role="img" aria-label="Point cloud of two groups in the selected stage"></svg>
    <svg class="plot" id="rsCurve" viewBox="0 0 320 130" role="img" aria-label="Spread of the points per direction, 0 to 180 degrees" style="margin-top:8px"></svg>
    <div class="stats"><span>Variance PC1 <b id="rsV1"></b></span><span>Variance PC2 <b id="rsV2"></b></span><span>Share PC1 <b id="rsP"></b></span></div>
    <p class="hint" id="rsMsg"></p>
  </div>
  <h4 id="unsup-pca-k">How many components?</h4>
  <ul>
    <li><b>For a picture</b>: 2 components. State how much variance is missing.</li>
    <li><b>For further computation</b>: as many as needed for the <b>cumulative</b> explained variance to reach a threshold, for example 90 %. Or where the curve flattens out (as with the elbow).</li>
  </ul>
  <p><b>Reconstruction</b>: with <code>inverse_transform</code> you build an approximation of the original data from the components you kept. The fewer components, the larger the difference to the original. This shows you directly what is lost (in the lab: digit images with 2, 10 and 30 components).</p>
  <pre><code>import numpy as np
pca = PCA().fit(X_s)
np.cumsum(pca.explained_variance_ratio_)    # cumulative variance
pca90 = PCA(n_components=0.90).fit(X_s)     # as many components as needed for 90 %
X_back = pca90.inverse_transform(pca90.transform(X_s))   # approximation in the scaled space</code></pre>

  <h3 id="unsup-tsne">11 · t-SNE and UMAP</h3>
  <p>t-SNE is a method for <b>plotting</b> in 2D. It tries to preserve neighbourhoods: points that lie close together in the high-dimensional space should also lie close together in the 2D picture. To do this, similarities are expressed as probabilities, and the 2D points are moved by gradient descent so that they match.</p>
  <ul>
    <li><b>Perplexity</b>: roughly the number of neighbours each point pays attention to (typically 5 to 50). The most important setting; try several values.</li>
    <li>Other settings: number of iterations, learning rate.</li>
  </ul>
  <div class="falle"><b>Pitfall</b><p>In a t-SNE picture, <b>distances between groups and group sizes are not meaningful</b>, only «who is next to whom». It is a picture for exploring, not a basis for models, and a different random start gives a different picture.</p></div>
  <pre><code>from sklearn.manifold import TSNE
Z = TSNE(n_components=2, perplexity=30, random_state=0).fit_transform(X_s)
plt.scatter(Z[:, 0], Z[:, 1], c=labels)</code></pre>
  <div class="demo" id="tsDemo">
    <div class="tag">Demo</div><h4>PCA, t-SNE and UMAP on simple and difficult data</h4>
    <p class="hint">300 points with an adjustable number of features (dimensions). The colour shows the true group; none of the three methods sees it.</p>
    <div class="btnrow" id="tsData" role="group" aria-label="Dataset"><button data-v="0">Easy: 3 groups</button><button data-v="1">Medium: 6 groups, close in pairs</button><button data-v="2">Hard: Swiss roll</button><button data-v="3">No structure</button></div>
    <div class="ctl"><label for="tsD">Dimensions</label><input type="range" id="tsD" min="2" max="50" step="1" value="10"><output id="tsDO"></output></div>
    <div class="ctl"><label for="tsP">Perplexity (t-SNE)</label><input type="range" id="tsP" min="2" max="50" step="1" value="20"><output id="tsPO"></output></div>
    <div class="ctl"><label for="tsK">n_neighbors (UMAP)</label><input type="range" id="tsK" min="2" max="50" step="1" value="15"><output id="tsKO"></output></div>
    <div class="grid2">
      <div><h4>PCA (linear, 2 components)</h4><svg class="plot" id="tsPca" viewBox="0 0 240 240" role="img" aria-label="PCA map of the points"></svg></div>
      <div><h4>t-SNE</h4><svg class="plot" id="tsTsne" viewBox="0 0 240 240" role="img" aria-label="t-SNE map of the points"></svg></div>
      <div><h4>UMAP</h4><svg class="plot" id="tsUmap" viewBox="0 0 240 240" role="img" aria-label="UMAP map of the points"></svg></div>
    </div>
    <div class="stats"><span>Neighbours with the same colour: original <b id="tsNO"></b></span><span>PCA <b id="tsNP"></b></span><span>t-SNE <b id="tsNT"></b></span><span>UMAP <b id="tsNU"></b></span></div>
    <div class="btnrow"><button id="tsRun">Restart t-SNE and UMAP (different random start)</button></div>
    <p class="hint" id="tsMsg"></p>
    <p class="hint">«Neighbours with the same colour» counts, among the 10 nearest neighbours of each point, how many belong to the same group. Chance would be about 33 % (3 groups) or 17 % (6 groups). A map can hardly show the groups better than they are separated in the original.</p>
  </div>
  <p><b>UMAP</b> also makes a map of the neighbourhoods, is usually faster and keeps a bit more of the rough overall structure. Two settings:</p>
  <ul>
    <li><code>n_neighbors</code> (default 15): small emphasises the local neighbourhood, large more the overall picture.</li>
    <li><code>min_dist</code> (default 0.1): how close together the points may move in the map.</li>
  </ul>
  <pre><code>import umap                              # package umap-learn, install separately
Z = umap.UMAP(n_neighbors=15, min_dist=0.1, random_state=0).fit_transform(X_s)

from sklearn.manifold import trustworthiness
trustworthiness(X_s, Z, n_neighbors=10)  # 1 = neighbours well preserved</code></pre>
  <p>Whether a map is any good, you check with the neighbours: do the points that are closest in the original also lie close on the map? This is measured by the <b>trustworthiness</b>. Ideally, also look at the originals for individual points (in the lab: the digit images next to a point).</p>
  <div class="falle"><b>Pitfall</b><p>Do not cluster on the t-SNE or UMAP map and then take the high silhouette as proof. The map pulls groups apart artificially. The silhouette on the map says little about the original data.</p></div>
  <div class="tablewrap"><table>
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Type</td><td>linear, projection</td><td>non-linear, neighbourhoods</td><td>non-linear, neighbourhoods</td></tr>
    <tr><td>Speed</td><td>fast</td><td>slow</td><td>medium</td></tr>
    <tr><td>Most important settings</td><td><code>n_components</code></td><td><code>perplexity</code></td><td><code>n_neighbors</code>, <code>min_dist</code></td></tr>
    <tr><td>Result</td><td>always the same, applicable to new data</td><td>depends on chance, only for the given data</td><td>depends on chance, new data possible with <code>transform</code></td></tr>
    <tr><td>Use</td><td>preprocessing, noise, 2D picture</td><td>2D picture of groups</td><td>2D picture, also larger data</td></tr>
  </table></div>

  <h3 id="unsup-deep">12 · Deep clustering (outlook)</h3>
  <p>Classical clustering works poorly with very many features (images, text). In deep clustering, an <b>autoencoder</b> (a neural network that reconstructs its input through a narrow bottleneck) learns a compact representation. Clustering is then done in this «latent» representation. Advanced variants train representation and clustering together. Here you only need to be able to place it.</p>

  <p class="note">Lecturer's notebooks (course folder <code>07 - UNSUPERVISED-LEARNING/code</code>): <code>clustering_k_means</code>, <code>clustering_k_means optimizing</code>, <code>hierarchical_clustering</code>, <code>dimension_reduction_pca</code>, <code>dimension_reduction_tsne</code>, each with an <code>_exercise</code> version. Data: <code>lego_daten_one_hot_encoded_cleaned.csv</code>. Labs (folder <code>notebooks</code>): <code>01_clustering_lab</code> (wine: scaling, k, DBSCAN, GMM, ARI), <code>02_anomaly_detection_lab</code> (Isolation Forest), <code>03_pca_lab</code> (components, reconstruction), <code>04_embeddings_lab</code> (t-SNE and UMAP).</p>
`,
  quiz: [
    { q: `What is the difference between Supervised and Unsupervised Learning?`, a: `Supervised learns from examples with a known answer. Unsupervised has no answer and finds structure on its own (groups, important directions).` },
    { q: `Which two steps does k-Means repeat?`, a: `Assign points to the nearest centre, then move each centre to the mean of its points. Until the assignment no longer changes.` },
    { q: `Why do you have to scale before k-Means?`, a: `The algorithm computes distances. A feature with large numbers would drown out the others.` },
    { q: `How do you find the right number of clusters?`, a: `Elbow (WSS against k, look for the bend), silhouette (highest average) or gap statistic. It also matters whether the clusters make sense in the domain.` },
    { q: `What is the advantage of hierarchical clustering over k-Means?`, a: `k does not have to be fixed in advance: the dendrogram shows all levels, and you cut at the height you want. On the other hand, it is slower with very many points.` },
    { q: `What does the first principal component in PCA stand for?`, a: `For the direction with the largest spread of the data. It keeps the most information when you reduce to one axis.` },
    { q: `What must you not read from a t-SNE picture?`, a: `The distances between groups and the group sizes. Only which points are neighbours is meaningful. In addition, the picture depends on the perplexity and the random start.` },
    { q: `How do you recognise whether a problem is supervised or unsupervised?`, a: `By the target column: if there is a known answer (label) for enough rows, it is supervised (number → regression, category → classification). Without a target column, when you are looking for groups, outliers or an overview, it is unsupervised.` },
    { q: `Why is there usually no test set in clustering?`, a: `There is no right answer to compare against. You check with the silhouette, stability (ARI between runs) and domain knowledge. A test set is only needed if the model is later meant to assign new data.` },
    { q: `When is DBSCAN better than k-Means?`, a: `With curved or irregular groups and when there is noise. DBSCAN needs no k and marks outliers with -1. On the other hand, eps has to fit, and with very different densities HDBSCAN is the better choice.` },
    { q: `What does a GMM give you that k-Means does not?`, a: `A probability per cluster for each point (row sum 1). This shows which assignments are uncertain. The clusters may also be elliptical.` },
    { q: `How does the Isolation Forest find outliers?`, a: `It splits the data with random splits. Suspicious points are alone after only a few splits, normal ones need many. A short path means a high anomaly score. The result is a ranking to check, not a verdict.` },
    { q: `How do you choose the number of PCA components?`, a: `For a picture, 2. For further computation, as many as needed for the cumulative explained variance to reach a threshold such as 90 % (PCA(n_components=0.90)), or until the curve flattens out.` },
  ],
});
