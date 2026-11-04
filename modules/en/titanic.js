/* English texts for the module "titanic" (Titanic example in full, own page titanic.html). Fields replace the German ones when the language is EN. */
LernApp.translate('titanic', {
  nav: 'Titanic in full',
  title: 'Titanic: chance of survival step by step',
  kicker: 'Example · Supervised Learning',
  summary: `Complete example with code, outputs and figures`,
  html: `
  <p>Who survived the sinking of the Titanic? This page works through the example twice in full, each time with explanations, code, real output and figures. Part 1 uses a simple model and follows exactly the workflow figure from the chapter Supervised ML, with a thorough EDA. Part 2 builds on it: new features, Random Forest, several metrics, following the Titanic exercise from the course. The short version is <a href="index.html#ml-titanic">at the end of Supervised ML</a>.</p>
  <div class="toc">
    <a href="#tit-einfach"><b>1 · Simple model</b><span>Logistic regression, 10 steps of the workflow figure</span></a>
    <a href="#tit-rf"><b>2 · In full</b><span>Random Forest, 11 steps of the course exercise</span></a>
  </div>

  <h3 id="tit-einfach">1 · Simple model: logistic regression in 10 steps</h3>
  <p>This version follows exactly the 10 steps of the <a href="index.html#ml-ablauf">workflow figure in the chapter Supervised ML</a>. Data: Kaggle Titanic (<code>train.csv</code>, here as <code>titanic/data.csv</code>, 891 passengers, target <code>Survived</code>). The parts run one after the other, like cells in a notebook. Outputs and images come from exactly this code (scikit-learn 1.9).</p>
  <div class="box" id="tit-logreg">
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 1 · Load the raw data</h4>
    <p>The Kaggle file <code>train.csv</code> has 891 passengers and 12 columns. At the end of the file there is an empty row, which <code>dropna(subset=["Survived"])</code> removes. Because of it, pandas reads <code>Pclass</code> and <code>Survived</code> as decimal numbers, and <code>astype(int)</code> turns them back into whole numbers. The first look already shows the problem areas: age is missing for 177 passengers, the cabin for 687, the port of embarkation for 2.</p>
    <pre><code>import pandas as pd, matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, ConfusionMatrixDisplay

# 1 · Load the raw data
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})  # 1 empty row
print(df.shape, &quot;| fehlend:&quot;, df[[&quot;Age&quot;, &quot;Cabin&quot;, &quot;Embarked&quot;]].isna().sum().to_dict())</code></pre>
    <pre class="out">(891, 12) | fehlend: {&#x27;Age&#x27;: 177, &#x27;Cabin&#x27;: 687, &#x27;Embarked&#x27;: 2}</pre>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 2 · Split and step 3 · EDA</h4>
    <p>Before anything is analysed, 20 % of the passengers (179) are set aside as the test set. <code>stratify=y</code> makes sure both parts have the same share of survivors (about 38 %), <code>random_state=0</code> makes the split repeatable.</p>
    <p>The EDA runs only on the 712 training passengers. <code>assign</code> attaches the target again, so you can compute survival rates by group.</p>
    <pre><code># 2 · Split: lock the test set away immediately
X, y = df.drop(columns=&quot;Survived&quot;), df[&quot;Survived&quot;]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

# 3 · EDA, on the training data only
eda = X_tr.assign(Survived=y_tr)
fig, ax = plt.subplots(1, 2, figsize=(9, 3.2))
eda.groupby([&quot;Pclass&quot;, &quot;Sex&quot;])[&quot;Survived&quot;].mean().unstack().plot.bar(ax=ax[0], rot=0, title=&quot;Überlebensrate nach Klasse und Geschlecht&quot;)
eda[&quot;Age&quot;].plot.hist(bins=30, ax=ax[1], title=&quot;Alter (fehlt bei rund 20 %)&quot;)
plt.show()</code></pre>
    <figure class="fig"><img src="assets/img/titanic-sup-1.png" alt="Bar chart of survival rate by class and sex, histogram of age" loading="lazy"><figcaption>Women and 1st class survived much more often. Age is often missing and skewed, so median instead of mean.</figcaption></figure>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 3 in depth · Look at the data thoroughly</h4>
    <p>The figure above is only the first look. A thorough EDA goes through every column: What is missing, how are the values distributed, what is related to survival, and what is related to each other? Everything still only on the 712 training passengers.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">3a · Overview</h4>
    <pre><code># 3a · Overview: the numeric columns summarised
import numpy as np, seaborn as sns
eda = eda.astype({&quot;SibSp&quot;: int, &quot;Parch&quot;: int})  # read as decimal numbers because of the empty row
print(len(eda), &quot;Trainingspassagiere, Überlebensrate:&quot;, round(eda[&quot;Survived&quot;].mean(), 3))
print(eda[[&quot;Age&quot;, &quot;Fare&quot;, &quot;SibSp&quot;, &quot;Parch&quot;]].describe().round(1))</code></pre>
    <pre class="out">712 Trainingspassagiere, Überlebensrate: 0.383
         Age   Fare  SibSp  Parch
count  566.0  712.0  712.0  712.0
mean    29.5   33.1    0.5    0.4
std     14.4   52.8    1.1    0.8
min      0.4    0.0    0.0    0.0
25%     20.0    7.9    0.0    0.0
50%     28.0   14.5    0.0    0.0
75%     38.0   30.5    1.0    0.0
max     80.0  512.3    8.0    6.0</pre>
    <p><code>describe()</code> summarises every numeric column. Notable: <code>Age</code> has only 566 of 712 values (<code>count</code>). For <code>Fare</code> the mean (33.1) is far above the median (14.5), and the maximum is 512: a few passengers paid a lot, the distribution is skewed. <code>SibSp</code> and <code>Parch</code> are mostly 0, most people travelled alone.</p>
    <p>The survival rate of 38 % is the benchmark for every model: if you stubbornly predict «died» for everyone, you already get 62 % accuracy. A model has to be clearly better.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">3b · Missing values</h4>
    <pre><code># 3b · Missing values: where and how many?
fehlend = eda.isna().mean().sort_values(ascending=False)
print((fehlend[fehlend &gt; 0] * 100).round(1))
fig, ax = plt.subplots(figsize=(9, 3))
sns.heatmap(eda.isna().T, cbar=False, cmap=&quot;Greys&quot;, xticklabels=False, ax=ax)
ax.set_title(&quot;Fehlende Werte: schwarz = fehlt (eine Spalte pro Passagier)&quot;)
plt.show()</code></pre>
    <pre class="out">Cabin       77.5
Age         20.5
Embarked     0.3
dtype: float64</pre>
    <figure class="fig"><img src="assets/img/titanic-eda-1.png" alt="Heatmap of missing values: Cabin black almost everywhere, Age with many lines, Embarked with two" loading="lazy"><figcaption>Every black line is a missing value. Cabin is missing almost always, Age often, Embarked only twice. All other columns are complete.</figcaption></figure>
    <p>This leads to three different decisions. <code>Cabin</code> is missing for 77.5 %: that is too much to fill in, so the column stays out (step 4). <code>Age</code> is missing for 20.5 %, but it is too important to drop: fill it in. <code>Embarked</code> is missing for only 2 passengers: fill it with the most frequent port.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">3c · Distributions and outliers</h4>
    <pre><code># 3c · Distributions and outliers: Fare
fig, ax = plt.subplots(1, 3, figsize=(12, 3.2))
eda[&quot;Fare&quot;].plot.hist(bins=40, ax=ax[0], title=&quot;Fare: stark schief&quot;)
np.log1p(eda[&quot;Fare&quot;]).plot.hist(bins=40, ax=ax[1], title=&quot;log(1 + Fare): ausgeglichener&quot;)
sns.boxplot(data=eda, x=&quot;Pclass&quot;, y=&quot;Fare&quot;, ax=ax[2]).set_title(&quot;Fare nach Klasse&quot;)
plt.show()
print(&quot;Median-Fare nach Klasse:&quot;, eda.groupby(&quot;Pclass&quot;)[&quot;Fare&quot;].median().round(1).to_dict())
print(&quot;Fare über 200:&quot;, (eda[&quot;Fare&quot;] &gt; 200).sum(), &quot;Passagiere&quot;)</code></pre>
    <pre class="out">Median-Fare nach Klasse: {1: 66.6, 2: 14.5, 3: 8.0}
Fare über 200: 19 Passagiere</pre>
    <figure class="fig"><img src="assets/img/titanic-eda-2.png" alt="Histogram of Fare, histogram of log(1+Fare) and box plot of Fare per class" loading="lazy"><figcaption>Left: Fare is strongly right-skewed. Middle: the logarithm compresses the large values. Right: almost all expensive tickets belong to 1st class.</figcaption></figure>
    <p>The outliers in <code>Fare</code> (19 passengers above 200) are not typos: the box plot shows that they belong to 1st class, whose median price of 66.6 is eight times as high as in 3rd class (8.0). You keep real outliers. <code>log1p</code> computes log(1 + x), so tickets with price 0 (the bar on the far left in the middle) cause no problem. Important: the <code>StandardScaler</code> only shifts and compresses, the skewed shape stays. For a linear model <code>log(Fare)</code> can therefore be better; a tree does not need it.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">3d · Survival rate per feature</h4>
    <pre><code># 3d · Survival rate per feature
fig, ax = plt.subplots(1, 4, figsize=(12, 3), sharey=True)
for a, col in zip(ax, [&quot;Sex&quot;, &quot;Pclass&quot;, &quot;Embarked&quot;, &quot;SibSp&quot;]):
    eda.groupby(col)[&quot;Survived&quot;].mean().plot.bar(ax=a, rot=0, title=col)
ax[0].set_ylabel(&quot;Überlebensrate&quot;)
plt.show()
print(eda.groupby(&quot;Embarked&quot;)[&quot;Pclass&quot;].value_counts(normalize=True).unstack().round(2))</code></pre>
    <pre class="out">Pclass       1     2     3
Embarked                  
C         0.51  0.12  0.37
Q         0.02  0.05  0.93
S         0.20  0.25  0.55</pre>
    <figure class="fig"><img src="assets/img/titanic-eda-3.png" alt="Four bar charts: survival rate by sex, class, port of embarkation and number of siblings/spouses" loading="lazy"><figcaption>Sex and class separate most strongly. The port and SibSp show weaker differences.</figcaption></figure>
    <p><b>Sex</b> is the strongest feature: 75 % of the women, but only 19 % of the men survived («women and children first»). Next comes <b>class</b>: 63 % in 1st, 49 % in 2nd, 23 % in 3rd class.</p>
    <p>For the <b>port of embarkation</b>, Cherbourg (C, 53 %) looks better than Southampton (S, 35 %). The table shows why: just over half of the passengers from Cherbourg travelled 1st class, almost all from Queenstown (Q) 3rd class. So the port acts mainly through the class. Such a third variable in the background is called a <i>confounder</i>: the port itself saved nobody.</p>
    <p>For <b>SibSp</b> the relationship is not linear: with one sibling or spouse the rate was highest (55 %), alone (34 %) and in large families it was lower. For 5 and 8 there are only 4 passengers each, all died, which is why the bars are missing there. Such small groups say very little statistically.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">3e · Age and survival</h4>
    <pre><code># 3e · Age by survival
fig, ax = plt.subplots(figsize=(7, 3))
for s, name in [(0, &quot;gestorben&quot;), (1, &quot;überlebt&quot;)]:
    eda.loc[eda[&quot;Survived&quot;] == s, &quot;Age&quot;].plot.hist(bins=30, alpha=0.5, ax=ax, label=name)
ax.set_xlabel(&quot;Alter&quot;); ax.set_title(&quot;Alter nach Überleben&quot;); ax.legend()
plt.show()
print(&quot;Überlebensrate unter 10 Jahren:&quot;, round(eda.loc[eda[&quot;Age&quot;] &lt; 10, &quot;Survived&quot;].mean(), 2))</code></pre>
    <pre class="out">Überlebensrate unter 10 Jahren: 0.57</pre>
    <figure class="fig"><img style="max-width:560px;margin:0 auto" src="assets/img/titanic-eda-4.png" alt="Two overlaid histograms of age: died and survived" loading="lazy"><figcaption>Among small children the survivors outnumber the dead, among 20- to 30-year-olds the dead outnumber the survivors.</figcaption></figure>
    <p>Children under 10 survived at 57 %, clearly more than the average (38 %). Between 20 and 30 the dead outnumber the survivors; these are mainly young men in 3rd class. Across all ages, however, the relationship is not a straight line: a linear model can only poorly represent «under 10 is good», a tree learns such a threshold directly.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">3f · Correlation heatmap</h4>
    <pre><code># 3f · Correlation heatmap (sex as 0/1)
num_eda = eda[[&quot;Survived&quot;, &quot;Pclass&quot;, &quot;Age&quot;, &quot;SibSp&quot;, &quot;Parch&quot;, &quot;Fare&quot;]].assign(Frau=(eda[&quot;Sex&quot;] == &quot;female&quot;).astype(int))
plt.figure(figsize=(6.5, 5))
sns.heatmap(num_eda.corr().round(2), annot=True, cmap=&quot;RdBu_r&quot;, vmin=-1, vmax=1)
plt.title(&quot;Korrelationen (nur Trainingsdaten)&quot;)
plt.show()</code></pre>
    <figure class="fig"><img style="max-width:480px;margin:0 auto" src="assets/img/titanic-eda-5.png" alt="Correlation heatmap of Survived, Pclass, Age, SibSp, Parch, Fare and Frau (woman)" loading="lazy"><figcaption>Red: rise together. Blue: one rises, the other falls. White: no linear relationship.</figcaption></figure>
    <p>The strongest relationships with the target <code>Survived</code> are: <code>Frau</code> (woman, +0.55), <code>Pclass</code> (−0.35, a higher class number means fewer survivors) and <code>Fare</code> (+0.27). This confirms the bar charts.</p>
    <p>Among the features, <code>Pclass</code> against <code>Fare</code> stands out (−0.55): expensive tickets are 1st class, so the two columns partly carry the same information. <code>SibSp</code> and <code>Parch</code> are related (+0.43), which suggests combining them into a family size (part 2).</p>
    <div class="falle"><b>Limits of the heatmap</b><p>Correlation only measures straight-line relationships. For age it shows −0.06, although children clearly survived more often (3e). For categories such as <code>Pclass</code> it is only a rough approximation. And correlation is not causation, see the port of embarkation.</p></div>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">What follows from the EDA</h4>
    <div class="tablewrap"><table>
      <tr><th>Finding</th><th>Consequence</th><th>Step</th></tr>
      <tr><td><code>Cabin</code> missing for 77 %</td><td>drop</td><td>4</td></tr>
      <tr><td><code>PassengerId</code>, <code>Name</code>, <code>Ticket</code> are identifiers</td><td>drop (the title in the name comes in part 2)</td><td>4</td></tr>
      <tr><td><code>Age</code> missing for 20 %, skewed</td><td>fill with the median</td><td>5</td></tr>
      <tr><td><code>Embarked</code> missing twice</td><td>fill with the most frequent value</td><td>5</td></tr>
      <tr><td><code>Sex</code>, <code>Pclass</code>, <code>Embarked</code> are categories</td><td>One-Hot</td><td>5</td></tr>
      <tr><td>Age up to 80, Fare up to 512: different orders of magnitude</td><td>scale</td><td>6</td></tr>
      <tr><td>Fare outliers are real (1st class)</td><td>keep</td><td>5</td></tr>
      <tr><td>62 % died, 38 % survived</td><td>accuracy must be clearly above 62 %; <code>stratify</code> in the split</td><td>2, 8</td></tr>
    </table></div>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Steps 4 to 9 · Features, pipeline, training</h4>
    <p><b>Step 4, feature selection (manual):</b> <code>PassengerId</code> and <code>Name</code> are identifiers, <code>Ticket</code> is different for almost every passenger, <code>Cabin</code> is missing for 77 %. These columns stay out. What remains are four numeric and three categorical columns.</p>
    <p><b>Steps 5 and 6, preprocessing and scaling:</b> the <code>ColumnTransformer</code> treats numbers and categories separately. Numbers: fill missing values with the median, then scale. Categories: fill missing values with the most frequent value (affects <code>Embarked</code>), then One-Hot. Because everything is inside the pipeline, each step learns its values (median, mean, categories) only from the training data of the current fold.</p>
    <p><b>Step 7, feature selection (automatic):</b> the L1 penalty (<code>l1_ratio=1</code>) is embedded feature selection. It pushes the weights of unimportant features to exactly 0.</p>
    <p><b>Steps 8 and 9, train, validate, choose the best model:</b> <code>GridSearchCV</code> tries four values for <code>C</code>. A small <code>C</code> means a strong penalty, so a simpler model. Each value is evaluated with 5-fold cross-validation, which makes 20 training runs. Afterwards <code>GridSearchCV</code> automatically trains the model with the best <code>C</code> once more on all 712 training passengers (<code>refit=True</code> is the default).</p>
    <pre><code># 4 · Feature selection (manual): drop ID, Name, Ticket and the almost empty Cabin
num, cat = [&quot;Age&quot;, &quot;Fare&quot;, &quot;SibSp&quot;, &quot;Parch&quot;], [&quot;Pclass&quot;, &quot;Sex&quot;, &quot;Embarked&quot;]

# 5 + 6 · Preprocessing and scaling, learned in the pipeline on train only
prep = make_column_transformer(
    (make_pipeline(SimpleImputer(strategy=&quot;median&quot;), StandardScaler()), num),
    (make_pipeline(SimpleImputer(strategy=&quot;most_frequent&quot;), OneHotEncoder(handle_unknown=&quot;ignore&quot;)), cat))

# 7 · Feature selection (automatic): L1 sets unimportant weights to 0
model = make_pipeline(prep, LogisticRegression(l1_ratio=1, solver=&quot;liblinear&quot;))  # before sklearn 1.8: penalty=&quot;l1&quot;

# 8 + 9 · Train and validate with 5-fold cross-validation, choose the best C
search = GridSearchCV(model, {&quot;logisticregression__C&quot;: [0.01, 0.1, 1, 10]}, cv=5)
search.fit(X_tr[num + cat], y_tr)
print(&quot;bestes C:&quot;, search.best_params_[&quot;logisticregression__C&quot;], &quot;| CV-Accuracy:&quot;, round(search.best_score_, 3))
coef = search.best_estimator_[-1].coef_[0]
print(&quot;Merkmale mit Gewicht 0:&quot;, (coef == 0).sum(), &quot;von&quot;, len(coef))</code></pre>
    <pre class="out">bestes C: 1 | CV-Accuracy: 0.803
Merkmale mit Gewicht 0: 3 von 12</pre>
    <p>After One-Hot there are 12 columns: 4 numeric, 3 for <code>Pclass</code>, 2 for <code>Sex</code>, 3 for <code>Embarked</code>. For 3 of them L1 has set the weight to 0, the model does without them. The CV accuracy of 0.803 is the estimate of how well the model will do on new passengers.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 10 · Evaluate once on the test set</h4>
    <p>Only now do the 179 locked-away passengers come into play, and exactly once. <code>predict</code> sends them through the same pipeline, with the values from training (<code>transform</code>, no new <code>fit</code>).</p>
    <pre><code># 10 · Evaluate exactly once on the test set
pred = search.predict(X_te[num + cat])
print(&quot;Test-Accuracy:&quot;, round(accuracy_score(y_te, pred), 3))
ConfusionMatrixDisplay.from_predictions(y_te, pred, display_labels=[&quot;gestorben&quot;, &quot;überlebt&quot;])
plt.show()</code></pre>
    <pre class="out">Test-Accuracy: 0.793</pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-sup-2.png" alt="Confusion matrix on the test set" loading="lazy"><figcaption>Confusion matrix on the 179 test passengers. The test accuracy (0.79) is close to the CV estimate (0.80): the CV was reliable, no test knowledge leaked in. That the model is not overfitted is shown by the comparison with training (accuracy 0.805 versus CV 0.803).</figcaption></figure>
    <p class="note">Deliberately left out: feature engineering (family size, title from the name), other models, and metrics besides accuracy. Part 2 shows all of this.</p>
  </div>

  <h3 id="tit-rf">2 · In full: Random Forest with feature engineering</h3>
  <p>This version follows the 11 steps of the Titanic exercise from the course (chapter Classification). It builds new features, balances the class ratio, measures several metrics and searches hyperparameters for a Random Forest. Outputs and images come from exactly this code (scikit-learn 1.9).</p>
  <ol>
    <li>Look at the data (structure, distributions, share of the classes).</li>
    <li>Clean up and turn categories into numbers (One-Hot).</li>
    <li>Build new features (e.g. family size = <code>SibSp + Parch + 1</code>).</li>
    <li>Fill missing values (e.g. age with the median).</li>
    <li>Select features.</li>
    <li>Check the class ratio, use resampling or <code>class_weight</code> if needed.</li>
    <li>Split train/test, cross-validation on the training data.</li>
    <li>Evaluate with suitable metrics (F1, AUC, not just accuracy).</li>
    <li>Check for leakage.</li>
    <li>Regularisation and hyperparameter search.</li>
    <li>Check the best model <b>once</b> on the test set.</li>
  </ol>
  <div class="box" id="tit-forest">
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 1 · Look at the data</h4>
    <p>Besides the shape, the output shows the share of missing values (age 20 %, cabin 77 %) and the class ratio: 62 % died, 38 % survived. That is slightly imbalanced, but not yet a problem as with 99 to 1.</p>
    <pre><code>import pandas as pd, matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, RocCurveDisplay

# 1 · Look at the data: structure, missing values, share of the classes
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})
print(df.shape)
print(&quot;fehlend:&quot;, df.isna().mean().round(2)[lambda s: s &gt; 0].to_dict())
print(&quot;überlebt:&quot;, df[&quot;Survived&quot;].value_counts(normalize=True).round(2).to_dict())</code></pre>
    <pre class="out">(891, 12)
fehlend: {&#x27;Age&#x27;: 0.2, &#x27;Cabin&#x27;: 0.77}
überlebt: {0: 0.62, 1: 0.38}</pre>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Steps 2 and 3 · Clean up and build new features</h4>
    <p><b>Feature engineering:</b> <code>FamilySize</code> combines siblings/spouses and parents/children. The title is read from the name («Braund, Mr. Owen» becomes «Mr»). Rare titles such as «Dr» or «Rev» go into the group «Rare», otherwise One-Hot would produce columns with only one passenger.</p>
    <p>These new columns are computed row by row, without learning values from other rows. That is why they may be created before the split. The analysis with <code>groupby</code>, on the other hand, also looks at the later test passengers. The clean analysis on the training data only follows further down, directly after the split.</p>
    <pre><code># 2 + 3 · Clean up and build new features
df[&quot;FamilySize&quot;] = df[&quot;SibSp&quot;] + df[&quot;Parch&quot;] + 1
df[&quot;Title&quot;] = df[&quot;Name&quot;].str.split(&quot;, &quot;).str[1].str.split(&quot;.&quot;).str[0]        # &quot;Braund, Mr. Owen&quot; -&gt; &quot;Mr&quot;
df[&quot;Title&quot;] = df[&quot;Title&quot;].where(df[&quot;Title&quot;].isin([&quot;Mr&quot;, &quot;Mrs&quot;, &quot;Miss&quot;, &quot;Master&quot;]), &quot;Rare&quot;)
print(df.groupby(&quot;Title&quot;)[&quot;Survived&quot;].agg([&quot;mean&quot;, &quot;size&quot;]).round(2))</code></pre>
    <pre class="out">        mean  size
Title             
Master  0.57    40
Miss    0.70   182
Mr      0.16   517
Mrs     0.79   125
Rare    0.44    27</pre>
    <p>The title says more than sex: «Master» are boys, and they survived much more often (57 %) than adult men («Mr», 16 %). The feature combines sex and age group in one column.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Steps 4 to 8 · Features, split, pipeline, cross-validation</h4>
    <p>The numbers in the code follow the course list above, which is why they are not in order. The order in the code is the same as in the workflow figure: first select features and split off the test set, then define the preprocessing in the pipeline.</p>
    <p><b>Step 5, select features:</b> <code>Name</code> (now contained in the title), <code>Ticket</code>, <code>Cabin</code> and <code>PassengerId</code> stay out, as do <code>SibSp</code> and <code>Parch</code> (contained in <code>FamilySize</code>).</p>
    <pre><code># 5 · Select features (Name, Ticket, Cabin, PassengerId stay out)
num = [&quot;Age&quot;, &quot;Fare&quot;, &quot;FamilySize&quot;]
cat = [&quot;Pclass&quot;, &quot;Sex&quot;, &quot;Embarked&quot;, &quot;Title&quot;]
X, y = df[num + cat], df[&quot;Survived&quot;]

# 7 · Split train/test, lock the test set away (stratify: same share of survivors)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)</code></pre>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Look at the new features, on the training data only</h4>
    <p>Now, after the split, the clean analysis of the new features: only on the 712 training passengers.</p>
    <pre><code># 1 (continued) · Look at the new features, on the training data only
import seaborn as sns
tr = X_tr.assign(Survived=y_tr, FamilySize=X_tr[&quot;FamilySize&quot;].astype(int))
fig, ax = plt.subplots(1, 2, figsize=(11, 3.2))
tr.groupby(&quot;Title&quot;)[&quot;Survived&quot;].mean().sort_values().plot.barh(ax=ax[0], title=&quot;Überlebensrate nach Titel&quot;)
tr.groupby(&quot;FamilySize&quot;)[&quot;Survived&quot;].mean().plot.bar(ax=ax[1], rot=0, title=&quot;Überlebensrate nach Familiengrösse&quot;)
plt.show()
print(tr.groupby(&quot;FamilySize&quot;)[&quot;Survived&quot;].agg([&quot;mean&quot;, &quot;size&quot;]).round(2))</code></pre>
    <pre class="out">            mean  size
FamilySize            
1           0.30   431
2           0.56   133
3           0.58    76
4           0.74    23
5           0.23    13
6           0.12    17
7           0.30    10
8           0.00     5
11          0.00     4</pre>
    <figure class="fig"><img src="assets/img/titanic-fe-1.png" alt="Survival rate by title (horizontal bars) and by family size (columns)" loading="lazy"><figcaption>Left: the title separates boys (Master) from men (Mr). Right: families with 2 to 4 people survived most often.</figcaption></figure>
    <p>For the <b>title</b>, Mrs (80 %) and Miss (70 %) lead, Mr is far behind with 15 %. Master, i.e. boys, is far above Mr with 57 %: the title separates boys from men, which sex alone cannot do.</p>
    <p><b>Family size</b> shows a hump: people travelling alone 30 %, families with 2 to 4 people 56 to 74 %, from 5 people on clearly less. A linear model cannot represent such a hump, a Random Forest can. But the table also shows: the large families are few (for example 4 passengers with family size 11), so their rates are uncertain.</p>
    <pre><code># Heatmap with the new features (categories as 0/1 columns)
dummies = pd.get_dummies(tr[[&quot;Survived&quot;, &quot;Age&quot;, &quot;Fare&quot;, &quot;FamilySize&quot;, &quot;Pclass&quot;, &quot;Sex&quot;, &quot;Title&quot;]],
                         columns=[&quot;Sex&quot;, &quot;Title&quot;], dtype=int).drop(columns=&quot;Sex_male&quot;)
plt.figure(figsize=(8, 6.5))
sns.heatmap(dummies.corr().round(2), annot=True, fmt=&quot;.2f&quot;, cmap=&quot;RdBu_r&quot;, vmin=-1, vmax=1, annot_kws={&quot;size&quot;: 8})
plt.title(&quot;Korrelationen mit den neuen Merkmalen (nur Trainingsdaten)&quot;)
plt.show()</code></pre>
    <figure class="fig"><img style="max-width:560px;margin:0 auto" src="assets/img/titanic-fe-2.png" alt="Correlation heatmap with Survived, Age, Fare, FamilySize, Pclass, Sex_female and the title columns" loading="lazy"><figcaption>The title columns are strongly related to sex, Title_Mr almost completely.</figcaption></figure>
    <p><code>Title_Mr</code> and <code>Sex_female</code> are almost completely related at −0.86: anyone who is «Mr» is a man. The two columns carry largely the same information. For a Random Forest this is not a problem. In a linear model it would make the weights uncertain (<i>multicollinearity</i>); there you would drop one of the two or regularise.</p>
    <p><code>Title_Master</code> correlates with age (−0.42) and family size (+0.41): boys travelled with their families. <code>FamilySize</code> itself hardly correlates with survival at all (0.02), although the bar chart shows a clear relationship. The hump is not a straight line, and correlation does not see it. So always look at both: the figure and the number.</p>
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Pipeline, class ratio and cross-validation</h4>
    <p><b>Steps 2 and 4, One-Hot and missing values:</b> the same as in part 1, but with named steps (<code>Pipeline</code> instead of <code>make_pipeline</code>). You need the names later for the grid (<code>clf__max_depth</code>). A Random Forest would not need scaling, but it does no harm.</p>
    <p><b>Step 6, class ratio:</b> <code>class_weight="balanced"</code> gives the rarer class (survivors) more weight, instead of copying or deleting rows.</p>
    <p><b>Steps 7 and 8, cross-validation with several metrics:</b> <code>StratifiedKFold</code> keeps the share of survivors the same in every fold. <code>cross_validate</code> measures accuracy, F1 and AUC, each on the training part and the validation part.</p>
    <pre><code># 2 + 4 · One-Hot and fill missing values, learned in the pipeline on train only
prep = ColumnTransformer([
    (&quot;num&quot;, Pipeline([(&quot;imp&quot;, SimpleImputer(strategy=&quot;median&quot;)), (&quot;sc&quot;, StandardScaler())]), num),
    (&quot;cat&quot;, Pipeline([(&quot;imp&quot;, SimpleImputer(strategy=&quot;most_frequent&quot;)),
                      (&quot;oh&quot;, OneHotEncoder(handle_unknown=&quot;ignore&quot;))]), cat)])

# 6 · Class ratio 62:38, slightly imbalanced: class_weight balances it
model = Pipeline([(&quot;prep&quot;, prep),
                  (&quot;clf&quot;, RandomForestClassifier(n_estimators=300, class_weight=&quot;balanced&quot;, random_state=0))])

# 7 + 8 · Cross-validation on the training data, with several metrics
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
res = cross_validate(model, X_tr, y_tr, cv=cv, scoring=[&quot;accuracy&quot;, &quot;f1&quot;, &quot;roc_auc&quot;], return_train_score=True)
print(pd.DataFrame(res).filter(regex=&quot;test|train&quot;).mean().round(3))</code></pre>
    <pre class="out">test_accuracy     0.801
train_accuracy    0.985
test_f1           0.748
train_f1          0.981
test_roc_auc      0.866
train_roc_auc     0.998
dtype: float64</pre>
    <p>On the training folds the forest is almost perfect (accuracy 0.985), on the validation folds only 0.80. This large gap is the typical sign of overfitting: the trees learn the training passengers by heart. F1 (0.75) is below the accuracy, because the survivors are harder to hit than those who died.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 9 · Check for leakage</h4>
    <p>Leakage often shows up like this: a single feature is overly powerful because it already contains the answer (for example a column with the number of the lifeboat). That is why you look at the importance of the features.</p>
    <pre><code># 9 · Check for leakage: train much better than CV is overfitting; a single overly powerful feature would be suspicious
model.fit(X_tr, y_tr)
imp = pd.Series(model[-1].feature_importances_, index=model[0].get_feature_names_out())
imp.sort_values().tail(8).plot.barh(figsize=(6, 3), title=&quot;Wichtigste Merkmale (Random Forest)&quot;)
plt.show()</code></pre>
    <figure class="fig"><img style="max-width:480px;margin:0 auto" src="assets/img/titanic-klass-1.png" alt="Bar chart of the eight most important features of the Random Forest" loading="lazy"><figcaption>Fare and age lead, followed by the title «Mr» and sex. No single feature dominates, so no sign of leakage. Be careful when reading this: the Random Forest overrates features with many different values, such as Fare and age. The real warning sign is in the output above: train accuracy 0.985 against CV 0.80 is overfitting, which step 10 slows down with larger leaves.</figcaption></figure>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 10 · Regularisation and hyperparameter search</h4>
    <p>Shallower trees (<code>max_depth</code>) and larger leaves (<code>min_samples_leaf</code>: a leaf must contain at least this many passengers) help against overfitting. The grid has 4 × 3 = 12 combinations; with 5 folds that makes 60 training runs. The ranking is by AUC.</p>
    <pre><code># 10 · Regularisation and hyperparameter search: shallower trees, larger leaves
grid = {&quot;clf__max_depth&quot;: [4, 6, 8, None], &quot;clf__min_samples_leaf&quot;: [1, 3, 5]}
search = GridSearchCV(model, grid, cv=cv, scoring=&quot;roc_auc&quot;).fit(X_tr, y_tr)
print(search.best_params_, &quot;| CV-AUC:&quot;, round(search.best_score_, 3))</code></pre>
    <pre class="out">{&#x27;clf__max_depth&#x27;: None, &#x27;clf__min_samples_leaf&#x27;: 3} | CV-AUC: 0.88</pre>
    <p>The winner is «trees without a depth limit, but at least 3 passengers per leaf». The CV AUC rises from 0.866 to 0.88.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Step 11 · Check the best model exactly once on the test set</h4>
    <p><code>predict_proba</code> returns the probability of survival, which you need for the AUC and the ROC curve. <code>classification_report</code> shows Precision, Recall and F1 for both classes.</p>
    <pre><code># 11 · Check the best model exactly once on the test set
proba = search.predict_proba(X_te)[:, 1]
print(classification_report(y_te, search.predict(X_te), target_names=[&quot;gestorben&quot;, &quot;überlebt&quot;], digits=2))
print(&quot;Test-AUC:&quot;, round(roc_auc_score(y_te, proba), 3))
RocCurveDisplay.from_predictions(y_te, proba)
plt.show()</code></pre>
    <pre class="out">              precision    recall  f1-score   support

   gestorben       0.83      0.85      0.84       110
    überlebt       0.75      0.72      0.74        69

    accuracy                           0.80       179
   macro avg       0.79      0.79      0.79       179
weighted avg       0.80      0.80      0.80       179

Test-AUC: 0.844</pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-klass-2.png" alt="ROC curve on the test set" loading="lazy"><figcaption>ROC curve on the 179 test passengers. The closer the curve is to the top left corner, the better; the diagonal would be chance.</figcaption></figure>
    <p>The test AUC (0.844) is somewhat below the CV AUC (0.88). The test accuracy (0.80) matches the CV value of the untuned forest (0.80); the tuned model reached about 0.82 accuracy in CV, so the test is slightly below that. The recall for «überlebt» (survived) is 0.72: the model wrongly predicts just over a quarter of the survivors as died. Compared with part 1 (test accuracy 0.79), the more elaborate Random Forest brings hardly any extra accuracy here. With so few features, the simple model is a good choice.</p>
  </div>
  <p class="note"><code>stratify=y</code> makes sure that train and test have the same class ratio. The pipeline learns the imputer and scaler in each fold on the training part only and so prevents leakage. The lecturer's template is in the course folder under <code>02 - SUPERVISED-ML/code/CAS_ML_Supervised_Learning_2.ipynb</code>.</p>
`,
});
