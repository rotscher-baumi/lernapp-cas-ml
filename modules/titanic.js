/* Module: Titanic example in full (own page titanic.html). */
(function () {
  LernApp.register({
    id: 'titanic',
    order: 10,
    nav: 'Titanic ausführlich',
    title: 'Titanic: Überlebenschance Schritt für Schritt',
    kicker: 'Beispiel · Supervised Learning',
    summary: `Komplettes Beispiel mit Code, Ausgaben und Grafiken`,
    html: `
  <p>Wer hat den Untergang der Titanic überlebt? Diese Seite rechnet das Beispiel zweimal komplett durch: zuerst mit einem einfachen Modell genau entlang der Ablauf-Grafik, dann ausführlich mit Feature Engineering und Random Forest entlang der Kursaufgabe. Jeder Schritt hat Erklärung, Code und die echte Ausgabe.</p>
  <div class="toc">
    <a href="#tit-einfach"><b>1 · Einfaches Modell</b><span>Logistische Regression, 10 Schritte der Ablauf-Grafik</span></a>
    <a href="#tit-rf"><b>2 · Ausführlich</b><span>Random Forest, 11 Schritte der Kursaufgabe</span></a>
  </div>

  <h3 id="tit-einfach">1 · Einfaches Modell: logistische Regression in 10 Schritten</h3>
  <p>Diese Version folgt genau den 10 Schritten der <a href="index.html#ml-ablauf">Ablauf-Grafik im Kapitel Supervised ML</a>. Daten: Kaggle-Titanic (<code>train.csv</code>, hier unter <code>titanic/data.csv</code>, 891 Passagiere, Ziel <code>Survived</code>). Die Teile laufen nacheinander wie Zellen in einem Notebook. Ausgaben und Bilder stammen aus genau diesem Code (scikit-learn 1.9).</p>
  <div class="box" id="tit-logreg">
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 1 · Rohdaten laden</h4>
    <p>Die Kaggle-Datei <code>train.csv</code> hat 891 Passagiere und 12 Spalten. Am Dateiende steht eine leere Zeile, die <code>dropna(subset=["Survived"])</code> entfernt. Danach liest pandas <code>Pclass</code> und <code>Survived</code> als Kommazahlen, <code>astype(int)</code> macht wieder ganze Zahlen daraus. Schon der erste Blick zeigt die Baustellen: Das Alter fehlt bei 177 Passagieren, die Kabine bei 687, der Einstiegshafen bei 2.</p>
    <pre><code>import pandas as pd, matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, ConfusionMatrixDisplay

# 1 · Rohdaten laden
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})  # 1 leere Zeile
print(df.shape, &quot;| fehlend:&quot;, df[[&quot;Age&quot;, &quot;Cabin&quot;, &quot;Embarked&quot;]].isna().sum().to_dict())</code></pre>
    <pre class="out">(891, 12) | fehlend: {&#x27;Age&#x27;: 177, &#x27;Cabin&#x27;: 687, &#x27;Embarked&#x27;: 2}</pre>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 2 · Aufteilen und Schritt 3 · EDA</h4>
    <p>Bevor irgendetwas ausgewertet wird, kommen 20 % der Passagiere (179) als Testset weg. <code>stratify=y</code> sorgt dafür, dass in beiden Teilen gleich viele Überlebende sind (rund 38 %), <code>random_state=0</code> macht den Split wiederholbar.</p>
    <p>Die EDA läuft nur auf den 712 Trainingspassagieren. <code>assign</code> hängt das Ziel wieder an, damit man Überlebensraten nach Gruppen rechnen kann.</p>
    <pre><code># 2 · Aufteilen: Testset sofort wegsperren
X, y = df.drop(columns=&quot;Survived&quot;), df[&quot;Survived&quot;]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

# 3 · EDA, nur auf den Trainingsdaten
eda = X_tr.assign(Survived=y_tr)
fig, ax = plt.subplots(1, 2, figsize=(9, 3.2))
eda.groupby([&quot;Pclass&quot;, &quot;Sex&quot;])[&quot;Survived&quot;].mean().unstack().plot.bar(ax=ax[0], rot=0, title=&quot;Überlebensrate nach Klasse und Geschlecht&quot;)
eda[&quot;Age&quot;].plot.hist(bins=30, ax=ax[1], title=&quot;Alter (fehlt bei rund 20 %)&quot;)
plt.show()</code></pre>
    <figure class="fig"><img src="assets/img/titanic-sup-1.png" alt="Balkendiagramm Überlebensrate nach Klasse und Geschlecht, Histogramm des Alters" loading="lazy"><figcaption>Frauen und die 1. Klasse überlebten viel häufiger. Das Alter fehlt oft und ist schief verteilt, darum Median statt Mittelwert.</figcaption></figure>
    <p>Daraus folgt die Strategie: Geschlecht und Klasse sind starke Merkmale und müssen ins Modell. Das Alter braucht eine Auffüll-Regel, und weil die Verteilung schief ist, nimmt man den Median.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 4 bis 9 · Merkmale, Pipeline, Training</h4>
    <p><b>Schritt 4, Feature Selection (manuell):</b> <code>PassengerId</code> und <code>Name</code> sind Kennungen, <code>Ticket</code> ist fast für jeden Passagier anders, <code>Cabin</code> fehlt zu 77 %. Diese Spalten bleiben draussen. Übrig sind vier Zahlen und drei Kategorien.</p>
    <p><b>Schritt 5 und 6, Vorverarbeitung und Skalieren:</b> Der <code>ColumnTransformer</code> behandelt Zahlen und Kategorien getrennt. Zahlen: fehlende Werte mit dem Median füllen, dann skalieren. Kategorien: fehlende Werte mit dem häufigsten Wert füllen (betrifft <code>Embarked</code>), dann One-Hot. Weil alles in der Pipeline steckt, lernt jeder Schritt seine Werte (Median, Mittelwert, Kategorien) nur aus den Trainingsdaten des jeweiligen Folds.</p>
    <p><b>Schritt 7, Feature Selection (automatisch):</b> Die L1-Strafe (<code>l1_ratio=1</code>) ist Embedded Feature Selection. Sie drückt die Gewichte unwichtiger Merkmale auf genau 0.</p>
    <p><b>Schritt 8 und 9, Trainieren, validieren, bestes Modell wählen:</b> <code>GridSearchCV</code> probiert vier Werte für <code>C</code> aus. Kleines <code>C</code> heisst starke Strafe, also ein einfacheres Modell. Jeder Wert wird mit 5-facher Cross-Validation bewertet, das sind 20 Trainingsläufe. Danach trainiert <code>GridSearchCV</code> das Modell mit dem besten <code>C</code> automatisch noch einmal auf allen 712 Trainingspassagieren (<code>refit=True</code> ist die Voreinstellung).</p>
    <pre><code># 4 · Feature Selection (manuell): ID, Name, Ticket und fast leere Cabin raus
num, cat = [&quot;Age&quot;, &quot;Fare&quot;, &quot;SibSp&quot;, &quot;Parch&quot;], [&quot;Pclass&quot;, &quot;Sex&quot;, &quot;Embarked&quot;]

# 5 + 6 · Vorverarbeitung und Skalieren, in der Pipeline nur auf Train gelernt
prep = make_column_transformer(
    (make_pipeline(SimpleImputer(strategy=&quot;median&quot;), StandardScaler()), num),
    (make_pipeline(SimpleImputer(strategy=&quot;most_frequent&quot;), OneHotEncoder(handle_unknown=&quot;ignore&quot;)), cat))

# 7 · Feature Selection (automatisch): L1 setzt unwichtige Gewichte auf 0
model = make_pipeline(prep, LogisticRegression(l1_ratio=1, solver=&quot;liblinear&quot;))  # vor sklearn 1.8: penalty=&quot;l1&quot;

# 8 + 9 · Mit 5-facher Cross-Validation trainieren und validieren, bestes C wählen
search = GridSearchCV(model, {&quot;logisticregression__C&quot;: [0.01, 0.1, 1, 10]}, cv=5)
search.fit(X_tr[num + cat], y_tr)
print(&quot;bestes C:&quot;, search.best_params_[&quot;logisticregression__C&quot;], &quot;| CV-Accuracy:&quot;, round(search.best_score_, 3))
coef = search.best_estimator_[-1].coef_[0]
print(&quot;Merkmale mit Gewicht 0:&quot;, (coef == 0).sum(), &quot;von&quot;, len(coef))</code></pre>
    <pre class="out">bestes C: 1 | CV-Accuracy: 0.803
Merkmale mit Gewicht 0: 3 von 12</pre>
    <p>Nach One-Hot sind es 12 Spalten: 4 Zahlen, 3 für <code>Pclass</code>, 2 für <code>Sex</code>, 3 für <code>Embarked</code>. Bei 3 davon hat L1 das Gewicht auf 0 gesetzt, das Modell kommt ohne sie aus. Die CV-Accuracy von 0,803 ist die Schätzung, wie gut das Modell auf neuen Passagieren sein wird.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 10 · Einmal auf dem Testset bewerten</h4>
    <p>Erst jetzt kommen die 179 weggesperrten Passagiere ins Spiel, und zwar genau einmal. <code>predict</code> schickt sie durch dieselbe Pipeline, mit den Werten aus dem Training (<code>transform</code>, kein neues <code>fit</code>).</p>
    <pre><code># 10 · Genau einmal auf dem Testset bewerten
pred = search.predict(X_te[num + cat])
print(&quot;Test-Accuracy:&quot;, round(accuracy_score(y_te, pred), 3))
ConfusionMatrixDisplay.from_predictions(y_te, pred, display_labels=[&quot;gestorben&quot;, &quot;überlebt&quot;])
plt.show()</code></pre>
    <pre class="out">Test-Accuracy: 0.793</pre>
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-sup-2.png" alt="Confusion Matrix auf dem Testset" loading="lazy"><figcaption>Confusion Matrix auf den 179 Testpassagieren. Die Test-Accuracy (0,79) liegt nahe an der CV-Schätzung (0,80): Das Modell ist nicht überangepasst.</figcaption></figure>
    <p class="note">Bewusst weggelassen: Feature Engineering (Familiengrösse, Titel aus dem Namen), andere Modelle und Metriken neben der Accuracy. Das alles zeigt Teil 2.</p>
  </div>

  <h3 id="tit-rf">2 · Ausführlich: Random Forest mit Feature Engineering</h3>
  <p>Diese Version folgt den 11 Schritten der Titanic-Aufgabe aus dem Kurs (Kapitel Klassifikation). Sie baut neue Merkmale, gleicht das Klassenverhältnis aus, misst mehrere Metriken und sucht Hyperparameter für einen Random Forest. Ausgaben und Bilder stammen aus genau diesem Code (scikit-learn 1.9).</p>
  <ol>
    <li>Daten ansehen (Struktur, Verteilungen, Anteil der Klassen).</li>
    <li>Aufräumen und Kategorien in Zahlen umwandeln (One-Hot).</li>
    <li>Neue Merkmale bauen (z. B. Familiengrösse = <code>SibSp + Parch + 1</code>).</li>
    <li>Fehlende Werte füllen (z. B. Alter mit dem Median).</li>
    <li>Merkmale auswählen.</li>
    <li>Klassenverhältnis prüfen, bei Bedarf Resampling oder <code>class_weight</code>.</li>
    <li>Train/Test trennen, Cross-Validation auf dem Training.</li>
    <li>Mit passenden Metriken bewerten (F1, AUC, nicht nur Accuracy).</li>
    <li>Auf Leakage prüfen.</li>
    <li>Regularisierung und Hyperparameter-Suche.</li>
    <li>Bestes Modell <b>einmal</b> auf dem Test-Set prüfen.</li>
  </ol>
  <div class="box" id="tit-forest">
    <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 1 · Daten ansehen</h4>
    <p>Neben der Form zeigt die Ausgabe den Anteil fehlender Werte (Alter 20 %, Kabine 77 %) und das Klassenverhältnis: 62 % sind gestorben, 38 % haben überlebt. Das ist leicht unausgewogen, aber noch kein Problem wie bei 99 zu 1.</p>
    <pre><code>import pandas as pd, matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, RocCurveDisplay

# 1 · Daten ansehen: Struktur, fehlende Werte, Anteil der Klassen
df = pd.read_csv(&quot;titanic/data.csv&quot;).dropna(subset=[&quot;Survived&quot;]).astype({&quot;Pclass&quot;: int, &quot;Survived&quot;: int})
print(df.shape)
print(&quot;fehlend:&quot;, df.isna().mean().round(2)[lambda s: s &gt; 0].to_dict())
print(&quot;überlebt:&quot;, df[&quot;Survived&quot;].value_counts(normalize=True).round(2).to_dict())</code></pre>
    <pre class="out">(891, 12)
fehlend: {&#x27;Age&#x27;: 0.2, &#x27;Cabin&#x27;: 0.77}
überlebt: {0: 0.62, 1: 0.38}</pre>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 2 und 3 · Aufräumen und neue Merkmale bauen</h4>
    <p><b>Feature Engineering:</b> <code>FamilySize</code> fasst Geschwister/Partner und Eltern/Kinder zusammen. Aus dem Namen wird der Titel gelesen («Braund, Mr. Owen» wird zu «Mr»). Seltene Titel wie «Dr» oder «Rev» kommen in die Gruppe «Rare», sonst hätte One-Hot Spalten mit nur einem Passagier.</p>
    <p>Diese neuen Spalten rechnet man Zeile für Zeile aus, ohne Werte aus anderen Zeilen zu lernen. Darum dürfen sie vor dem Split entstehen. Die Auswertung mit <code>groupby</code> schaut dagegen auch auf die späteren Testpassagiere. Sauberer wäre sie nach dem Split nur auf den Trainingsdaten.</p>
    <pre><code># 2 + 3 · Aufräumen und neue Merkmale bauen
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
    <p>Der Titel sagt mehr als das Geschlecht: «Master» sind Jungen, und die überlebten viel häufiger (57 %) als erwachsene Männer («Mr», 16 %). Das Merkmal fasst Geschlecht und Altersgruppe in einer Spalte zusammen.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 4 bis 8 · Merkmale, Split, Pipeline, Cross-Validation</h4>
    <p>Die Nummern im Code folgen der Kursliste oben, darum stehen sie nicht der Reihe nach. Die Reihenfolge im Code ist dieselbe wie in der Ablauf-Grafik: zuerst Merkmale wählen und das Testset abtrennen, dann die Vorverarbeitung in der Pipeline festlegen.</p>
    <p><b>Schritt 5, Merkmale auswählen:</b> <code>Name</code> (steckt jetzt im Titel), <code>Ticket</code>, <code>Cabin</code> und <code>PassengerId</code> bleiben draussen, ebenso <code>SibSp</code> und <code>Parch</code> (stecken in <code>FamilySize</code>).</p>
    <p><b>Schritt 2 und 4, One-Hot und fehlende Werte:</b> gleich wie in Teil 1, aber mit benannten Schritten (<code>Pipeline</code> statt <code>make_pipeline</code>). Die Namen braucht man später für das Grid (<code>clf__max_depth</code>). Ein Random Forest bräuchte keine Skalierung, sie schadet aber nicht.</p>
    <p><b>Schritt 6, Klassenverhältnis:</b> <code>class_weight="balanced"</code> gewichtet die seltenere Klasse (Überlebende) stärker, statt Zeilen zu kopieren oder zu löschen.</p>
    <p><b>Schritt 7 und 8, Cross-Validation mit mehreren Metriken:</b> <code>StratifiedKFold</code> hält den Anteil Überlebender in jedem Fold gleich. <code>cross_validate</code> misst Accuracy, F1 und AUC, jeweils auf dem Trainings- und dem Validierungsteil.</p>
    <pre><code># 5 · Merkmale auswählen (Name, Ticket, Cabin, PassengerId bleiben draussen)
num = [&quot;Age&quot;, &quot;Fare&quot;, &quot;FamilySize&quot;]
cat = [&quot;Pclass&quot;, &quot;Sex&quot;, &quot;Embarked&quot;, &quot;Title&quot;]
X, y = df[num + cat], df[&quot;Survived&quot;]

# 7 · Train/Test trennen, Testset wegsperren (stratify: gleicher Anteil Überlebende)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

# 2 + 4 · One-Hot und fehlende Werte füllen, in der Pipeline nur auf Train gelernt
prep = ColumnTransformer([
    (&quot;num&quot;, Pipeline([(&quot;imp&quot;, SimpleImputer(strategy=&quot;median&quot;)), (&quot;sc&quot;, StandardScaler())]), num),
    (&quot;cat&quot;, Pipeline([(&quot;imp&quot;, SimpleImputer(strategy=&quot;most_frequent&quot;)),
                      (&quot;oh&quot;, OneHotEncoder(handle_unknown=&quot;ignore&quot;))]), cat)])

# 6 · Klassenverhältnis 62:38, leicht unausgewogen: class_weight gleicht es aus
model = Pipeline([(&quot;prep&quot;, prep),
                  (&quot;clf&quot;, RandomForestClassifier(n_estimators=300, class_weight=&quot;balanced&quot;, random_state=0))])

# 7 + 8 · Cross-Validation auf dem Training, mit mehreren Metriken
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
    <p>Auf den Trainingsfolds ist der Wald fast perfekt (Accuracy 0,985), auf den Validierungsfolds nur 0,80. Dieser grosse Abstand ist das typische Zeichen für Overfitting: Die Bäume lernen die Trainingspassagiere auswendig. F1 (0,75) liegt unter der Accuracy, weil die Überlebenden schwerer zu treffen sind als die Gestorbenen.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 9 · Auf Leakage prüfen</h4>
    <p>Leakage zeigt sich oft so: Ein einzelnes Merkmal ist übermächtig, weil es die Antwort schon enthält (zum Beispiel eine Spalte mit der Nummer des Rettungsboots). Darum schaut man die Wichtigkeit der Merkmale an.</p>
    <pre><code># 9 · Auf Leakage prüfen: Train viel besser als CV ist Overfitting; ein einzelnes übermächtiges Merkmal wäre verdächtig
model.fit(X_tr, y_tr)
imp = pd.Series(model[-1].feature_importances_, index=model[0].get_feature_names_out())
imp.sort_values().tail(8).plot.barh(figsize=(6, 3), title=&quot;Wichtigste Merkmale (Random Forest)&quot;)
plt.show()</code></pre>
    <figure class="fig"><img style="max-width:480px;margin:0 auto" src="assets/img/titanic-klass-1.png" alt="Balkendiagramm der acht wichtigsten Merkmale des Random Forest" loading="lazy"><figcaption>Fare und Alter liegen vorne, danach Titel «Mr» und Geschlecht. Kein einzelnes Merkmal dominiert, also kein Hinweis auf Leakage. Vorsicht beim Lesen: Der Random Forest überschätzt Merkmale mit vielen verschiedenen Werten wie Fare und Alter. Das eigentliche Warnsignal steht in der Ausgabe oben: Train-Accuracy 0,985 gegen CV 0,80 ist Overfitting, das Schritt 10 mit grösseren Blättern bremst.</figcaption></figure>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 10 · Regularisierung und Hyperparameter-Suche</h4>
    <p>Gegen das Overfitting helfen flachere Bäume (<code>max_depth</code>) und grössere Blätter (<code>min_samples_leaf</code>: Ein Blatt muss mindestens so viele Passagiere enthalten). Das Grid hat 4 × 3 = 12 Kombinationen, mit 5 Folds sind das 60 Trainingsläufe. Bewertet wird nach AUC.</p>
    <pre><code># 10 · Regularisierung und Hyperparameter-Suche: flachere Bäume, grössere Blätter
grid = {&quot;clf__max_depth&quot;: [4, 6, 8, None], &quot;clf__min_samples_leaf&quot;: [1, 3, 5]}
search = GridSearchCV(model, grid, cv=cv, scoring=&quot;roc_auc&quot;).fit(X_tr, y_tr)
print(search.best_params_, &quot;| CV-AUC:&quot;, round(search.best_score_, 3))</code></pre>
    <pre class="out">{&#x27;clf__max_depth&#x27;: None, &#x27;clf__min_samples_leaf&#x27;: 3} | CV-AUC: 0.88</pre>
    <p>Gewonnen hat «Bäume ohne Tiefenlimit, aber mindestens 3 Passagiere pro Blatt». Die CV-AUC steigt von 0,866 auf 0,88.</p>
        <h4 style="margin:18px 0 4px;font-family:var(--f-display)">Schritt 11 · Bestes Modell genau einmal auf dem Testset prüfen</h4>
    <p><code>predict_proba</code> liefert die Überlebenswahrscheinlichkeit, die braucht man für AUC und ROC-Kurve. <code>classification_report</code> zeigt Precision, Recall und F1 für beide Klassen.</p>
    <pre><code># 11 · Bestes Modell genau einmal auf dem Testset prüfen
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
    <figure class="fig"><img style="max-width:400px;margin:0 auto" src="assets/img/titanic-klass-2.png" alt="ROC-Kurve auf dem Testset" loading="lazy"><figcaption>ROC-Kurve auf den 179 Testpassagieren. Je näher die Kurve an der linken oberen Ecke, desto besser; die Diagonale wäre Zufall.</figcaption></figure>
    <p>Die Test-AUC (0,844) liegt etwas unter der CV-AUC (0,88), die Accuracy (0,80) genau auf der CV-Schätzung. Der Recall für «überlebt» ist 0,72: Gut ein Viertel der Überlebenden sagt das Modell falsch als gestorben voraus. Im Vergleich zu Teil 1 (Test-Accuracy 0,79) bringt der aufwendigere Random Forest hier kaum mehr Accuracy. Bei so wenigen Merkmalen ist das einfache Modell eine gute Wahl.</p>
  </div>
  <p class="note"><code>stratify=y</code> sorgt dafür, dass Train und Test das gleiche Klassenverhältnis haben. Die Pipeline lernt Imputer und Scaler in jedem Fold nur auf dem Trainingsteil und verhindert so Leakage. Die Vorlage des Dozenten liegt im Kursordner unter <code>02 - SUPERVISED-ML/code/CAS_ML_Supervised_Learning_2.ipynb</code>.</p>
`,
  });
})();
