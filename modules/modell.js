/* Module: Modelle in der Praxis (cross-cutting chapter). Content lives in the html field; the demos live in assets/demos-modell.js. */
(function () {
  LernApp.register({
    id: 'modell',
    order: 94.7,
    nav: 'Modelle in der Praxis',
    title: `Modelle in der Praxis`,
    kicker: `Querschnitt · Lebenszyklus eines Modells`,
    summary: `Was ein Modell eigentlich ist (Architektur, Parameter, Hyperparameter), fertige Modelle übernehmen, Fine-Tuning, speichern und laden, Drift und neu trainieren, Best Practices`,
    html: `  <p>In jedem Kapitel bisher hiess es «das Modell lernt» oder «wir trainieren ein Modell». Dieses Kapitel tritt einen Schritt zurück: <b>Was ist ein Modell eigentlich</b>, was steckt in einer Modelldatei, wann nimmt man ein fertiges Modell statt ein eigenes, und was passiert, wenn das Modell im Einsatz langsam schlechter wird? Am Schluss stehen die Best Practices für Modellwahl, Speichern und Einsatz; die fachlichen Best Practices stehen jeweils am Ende ihres Kapitels.</p>
  <p class="note">Die Demos rechnen im Browser. Das Beispiel-Notebook am Ende des Kapitels macht dasselbe mit scikit-learn: Pipeline speichern, laden, Drift simulieren, neu trainieren.</p>

  <h3 id="mo-ablauf">Der ganze Ablauf auf einen Blick</h3>
  <p>Ein Modell hat einen Lebenszyklus: Es wird gebaut, geprüft, gespeichert, eingesetzt und irgendwann neu trainiert oder abgelöst. Die Schritte 4 bis 7 wiederholen sich, solange sich die Daten ändern.</p>
  <p class="hint">Klicke auf einen Schritt in der Grafik: Darunter klappt die Erklärung auf, mit Links zu den passenden Stellen im Kapitel.</p>
  <figure class="fig ab-fig" id="moFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Lebenszyklus eines Modells: Problem und Baseline, Modell wählen, Daten und Pipeline, trainieren, bewerten, speichern und versionieren, einsetzen und überwachen, neue gegen alte Version vergleichen, alte Version ablösen. Bei Drift zurück zum Training, bei einer neuen Aufgabe zurück zur Modellwahl">
      ${LernApp.nnFlow({
        id: 'mo',
        aria: 'Schritt %: Erklärung aufklappen',
        steps: [
          ['Problem und Baseline', 'Ziel, Metrik, einfachstes Modell'],
          ['Modell wählen', 'fertig, Fine-Tuning oder eigenes'],
          ['Daten und Pipeline', 'Split, Vorverarbeitung im Modell'],
          ['Trainieren', 'Parameter lernen: fit()'],
          ['Bewerten', 'Validation gegen Baseline'],
          ['Speichern und versionieren', 'Pipeline, Versionen, Model Card'],
          ['Einsetzen und überwachen', 'Inferenz: predict(), Drift messen'],
          ['Neu gegen alt vergleichen', 'gleiche Testdaten, gleiche Metrik'],
          ['Alte Version ablösen', 'archivieren, Rollback möglich'],
        ],
        loopA: ['Drift:', 'neu trainieren'],
        loopB: ['Aufgabe neu:', 'anderes Modell'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Schliessen">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>Der innere Loop (orange gestrichelt) läuft bei jedem Retraining: neue Daten, trainieren, bewerten, speichern, einsetzen. Der äussere Loop führt zurück zur Modellwahl, wenn sich die Aufgabe selbst ändert. Die alte Version (orange) wird erst abgelöst, wenn die neue nachweislich besser ist.</figcaption>
  </figure>

  <h3 id="mo-was">1 · Was ist ein Modell eigentlich?</h3>
  <p>Ein Modell ist eine <b>Funktion mit gelernten Zahlen</b>. Es bekommt eine Eingabe x und gibt eine Vorhersage ŷ aus:</p>
  <pre><code>ŷ = f(x; θ)
f = Architektur (die Form der Funktion)    θ = Parameter (die gelernten Zahlen)</code></pre>
  <p>Ein Modell hat damit drei Teile, die man auseinanderhalten muss:</p>
  <div class="tablewrap"><table>
    <tr><th>Teil</th><th>Was es ist</th><th>Wer es festlegt</th><th>Beispiel lineare Regression</th></tr>
    <tr><td><b>Architektur</b></td><td>Die Form der Funktion: welche Rechenschritte in welcher Reihenfolge</td><td>Du, beim Wählen des Modells</td><td><code>ŷ = w · x + b</code></td></tr>
    <tr><td><b>Parameter</b></td><td>Die Zahlen in der Funktion, die beim Training gefunden werden</td><td>Das Training (<code>fit</code>)</td><td><code>w = 17.2</code>, <code>b = 612</code></td></tr>
    <tr><td><b>Hyperparameter</b></td><td>Einstellungen, die das Training steuern, aber nicht gelernt werden</td><td>Du, gewählt auf der Validation</td><td>Learning Rate, Epochs, Regularisierung <code>alpha</code></td></tr>
  </table></div>
  <p>Dazu kommen zwei Begriffe, die oft verwechselt werden. Der <b>Algorithmus</b> ist das Verfahren, mit dem die Parameter gefunden werden (z. B. Gradient Descent oder die Normalengleichung). Das <b>Modell</b> ist das Ergebnis: Architektur plus gefundene Parameter. Beim <b>Training</b> ändern sich die Parameter; bei der <b>Inferenz</b> (<code>predict</code>) bleiben sie fest, das Modell wird nur noch angewendet.</p>
  <div class="tablewrap"><table>
    <tr><th>Modell</th><th>Architektur</th><th>Parameter</th><th>Grösse (ungefähr)</th></tr>
    <tr><td><b>Lineare Regression</b>, 8 Features</td><td>gewichtete Summe</td><td>8 Gewichte + 1 Bias</td><td>unter 1 KB</td></tr>
    <tr><td><b>Entscheidungsbaum</b></td><td>verschachtelte Wenn-dann-Regeln</td><td>pro Knoten Feature und Threshold, pro Blatt ein Wert</td><td>KB</td></tr>
    <tr><td><b>Random Forest</b>, 100 Bäume</td><td>Mittelwert vieler Bäume</td><td>alle Knoten aller Bäume</td><td>MB bis über 100 MB</td></tr>
    <tr><td><b>kNN</b></td><td>«frag die k nächsten Nachbarn»</td><td>keine im engeren Sinn: Das Modell <i>ist</i> der Trainingsdatensatz</td><td>so gross wie die Trainingsdaten</td></tr>
    <tr><td><b>ResNet-50</b> (CNN)</td><td>50 Schichten mit Convolutions und Skip Connections</td><td>rund 25,6 Mio. Gewichte</td><td>etwa 100 MB (float32)</td></tr>
    <tr><td><b>BERT-base</b> (Transformer)</td><td>12 Transformer-Blöcke</td><td>rund 110 Mio. Gewichte</td><td>etwa 440 MB (float32)</td></tr>
    <tr><td><b>LLM</b> mit 7 Mrd. Parametern</td><td>Dutzende Transformer-Blöcke</td><td>7 Mrd. Gewichte</td><td>etwa 14 GB (16 Bit pro Gewicht)</td></tr>
  </table></div>
  <p>Die Grösse folgt direkt aus der Zahl der Parameter: Anzahl × Bytes pro Zahl. Ein float32 braucht 4 Bytes, 25,6 Mio. × 4 B ≈ 100 MB.</p>
  <div class="demo" id="moFileDemo">
    <div class="tag">Demo</div><h4>Ein Modell ist nur eine Datei mit Zahlen</h4>
    <p class="hint">Zwölf Wohnungen: Wohnfläche gegen Monatsmiete. Trainiere die lineare Regression mit mehr oder weniger Epochs und schau, was in der «Modelldatei» rechts steht. Danach rechnet die Vorhersage unten <b>nur</b> mit dieser Datei. Schalte die Vorverarbeitung aus und sieh, was dann passiert.</p>
    <div class="ctl"><label for="moEp">Epochs (Gradient Descent)</label><input type="range" id="moEp" min="0" max="200" step="5" value="60"><output id="moEpO"></output></div>
    <div class="ctl"><label for="moQ">Vorhersage für Wohnfläche (m²)</label><input type="range" id="moQ" min="30" max="130" step="1" value="85"><output id="moQO"></output></div>
    <div class="btnrow" id="moScl" role="group" aria-label="Vorverarbeitung in der Datei"><button data-v="1" class="pri" aria-pressed="true">Scaler mitgespeichert</button><button data-v="0" aria-pressed="false">nur das Modell gespeichert</button></div>
    <div class="mo-file">
      <svg class="plot" id="moFileSvg" viewBox="0 0 360 240" role="img" aria-label="Streudiagramm Wohnfläche gegen Miete mit der gelernten Geraden"></svg>
      <pre class="mo-json"><code id="moJson"></code></pre>
    </div>
    <div class="stats"><span>MAE <b id="moMae"></b></span><span>Vorhersage <b id="moPred"></b></span></div>
    <p class="hint" id="moFileMsg"></p>
  </div>
  <div class="merk"><b>Merksatz</b><p>Modell = Architektur + gelernte Parameter. Die Hyperparameter haben bestimmt, <i>wie</i> gelernt wurde, gehören aber nicht zur Rechnung. Zur Vorhersage braucht man ausserdem genau dieselbe Vorverarbeitung wie beim Training: Scaler, Encoder, Spaltenreihenfolge, Bildgrösse.</p></div>
  <div class="falle"><b>Falle</b><p>Nur das Modell speichern und den Scaler vergessen. Das Modell rechnet dann mit unskalierten Zahlen und liefert Unsinn, ohne Fehlermeldung. Darum speichert man in scikit-learn die ganze <code>Pipeline</code>, nicht nur den Schätzer.</p></div>

  <h3 id="mo-quelle">2 · Woher kommt ein Modell? Selbst trainieren, übernehmen, anpassen</h3>
  <p>Ein Modell muss man nicht immer von null trainieren. Für Bilder, Text und Audio gibt es <b>vortrainierte Modelle</b>, die auf riesigen Datensätzen gelernt haben (ImageNet: 1,28 Mio. Bilder in 1000 Klassen). Ihre frühen Schichten erkennen allgemeine Muster (Kanten, Formen, Wortbedeutungen), die auch für deine Aufgabe nützlich sind.</p>
  <div class="tablewrap"><table>
    <tr><th>Weg</th><th>Was du machst</th><th>Wann</th><th>Aufwand</th></tr>
    <tr><td><b>Von null trainieren</b></td><td>Architektur wählen, alle Parameter zufällig starten, alles lernen</td><td>Tabellendaten (fast immer), sehr viele eigene Daten, ganz neue Art von Daten</td><td>hoch bei Netzen, klein bei klassischen Modellen</td></tr>
    <tr><td><b>Fertig übernehmen</b></td><td>Vortrainiertes Modell unverändert verwenden (zero-shot)</td><td>Die Aufgabe ist genau die des Modells (z. B. ImageNet-Klassen, Übersetzung, SAM-Segmentierung)</td><td>fast keiner</td></tr>
    <tr><td><b>Transfer Learning</b></td><td>Basis einfrieren, nur einen neuen Kopf (Output Layer) trainieren</td><td>Wenig eigene Daten (hunderte bis tausende), Aufgabe ähnlich</td><td>klein</td></tr>
    <tr><td><b>Fine-Tuning</b></td><td>Danach auch obere Schichten der Basis mit sehr kleiner Learning Rate weitertrainieren</td><td>Mehr Daten (zehntausende), Aufgabe etwas anders</td><td>mittel</td></tr>
  </table></div>
  <p>Vortrainierte Modelle findest du im <b>Hugging Face Hub</b> (Text, Bild, Audio), in <b>Keras Applications</b> (<code>keras.applications.ResNet50</code>), in <b>torchvision</b> (<code>torchvision.models</code>) und für Bilder in <b>timm</b>. scikit-learn hat keine vortrainierten Modelle: Bei Tabellendaten sind die Spalten jeder Aufgabe anders, darum gibt es dort nichts Allgemeines zu übernehmen.</p>
  <pre><code># Transfer Learning mit Keras (siehe Kapitel CNN)
base = keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")
base.trainable = False                      # Basis einfrieren
model = keras.Sequential([base, keras.layers.Dense(3, activation="softmax")])
model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=5)

base.trainable = True                       # optional: Fine-Tuning
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=3)</code></pre>
  <div class="demo" id="moPickDemo">
    <div class="tag">Demo</div><h4>Welcher Weg passt?</h4>
    <p class="hint">Wähle Datentyp, Datenmenge und wie ähnlich deine Aufgabe der eines vortrainierten Modells ist.</p>
    <div class="btnrow" id="moPType" role="group" aria-label="Datentyp"><button data-v="tab" class="pri" aria-pressed="true">Tabelle</button><button data-v="img" aria-pressed="false">Bilder</button><button data-v="txt" aria-pressed="false">Text</button></div>
    <div class="btnrow" id="moPN" role="group" aria-label="Datenmenge"><button data-v="few" class="pri" aria-pressed="true">einige hundert</button><button data-v="mid" aria-pressed="false">zehntausende</button><button data-v="many" aria-pressed="false">Millionen</button></div>
    <div class="btnrow" id="moPSim" role="group" aria-label="Ähnlichkeit zur Aufgabe des vortrainierten Modells"><button data-v="same" class="pri" aria-pressed="true">gleiche Aufgabe</button><button data-v="near" aria-pressed="false">ähnlich</button><button data-v="far" aria-pressed="false">ganz anders</button></div>
    <div class="mo-rec" id="moPRec" aria-live="polite"></div>
  </div>
  <div class="falle"><b>Falle</b><p>Ein vortrainiertes Modell erwartet <b>seine</b> Vorverarbeitung: dieselbe Bildgrösse, dieselbe Normalisierung (z. B. <code>keras.applications.resnet50.preprocess_input</code>), denselben Tokenizer. Ausserdem gelten Lizenz und die Grenzen seiner Trainingsdaten: Ein Modell, das nur Fotos von Tageslicht kennt, versagt nachts.</p></div>

  <h3 id="mo-speichern">3 · Speichern und laden</h3>
  <p>Nach dem Training liegt das Modell im Arbeitsspeicher. Damit es später (oder auf einem anderen Rechner) Vorhersagen machen kann, wird es gespeichert: Architektur und Parameter, bei scikit-learn zusätzlich die ganze Vorverarbeitung.</p>
  <div class="tablewrap"><table>
    <tr><th>Framework</th><th>Speichern</th><th>Laden</th><th>Was drin ist</th></tr>
    <tr><td><b>scikit-learn</b></td><td><code>joblib.dump(pipe, "modell.joblib")</code></td><td><code>joblib.load("modell.joblib")</code></td><td>Das ganze Python-Objekt (Pipeline mit Scaler und Modell)</td></tr>
    <tr><td><b>Keras</b></td><td><code>model.save("modell.keras")</code></td><td><code>keras.models.load_model("modell.keras")</code></td><td>Architektur, Gewichte, Optimizer-Zustand</td></tr>
    <tr><td><b>PyTorch</b></td><td><code>torch.save(model.state_dict(), "modell.pt")</code></td><td><code>model.load_state_dict(torch.load("modell.pt", weights_only=True))</code></td><td>Nur die Gewichte; die Architektur ist dein Python-Code</td></tr>
    <tr><td><b>Hugging Face</b></td><td><code>model.save_pretrained("ordner")</code></td><td><code>AutoModel.from_pretrained("ordner")</code></td><td>Gewichte (<code>.safetensors</code>), Konfiguration, Tokenizer</td></tr>
    <tr><td><b>ONNX</b></td><td>Export aus PyTorch, Keras, scikit-learn</td><td>ONNX Runtime (Python, C#, JavaScript …)</td><td>Rechengraph und Gewichte, unabhängig vom Framework</td></tr>
  </table></div>
  <pre><code>import json, joblib, sklearn
from datetime import date

pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

joblib.dump(pipe, "modell_v1.joblib")                 # ganze Pipeline, nicht nur das Modell
meta = {"version": "v1", "datum": str(date.today()), "sklearn": sklearn.__version__,
        "features": list(X_train.columns), "seed": 42,
        "val_accuracy": 0.87, "baseline_accuracy": 0.61, "n_train": len(X_train)}
json.dump(meta, open("modell_v1.json", "w"), indent=2)  # Metadaten daneben

pipe2 = joblib.load("modell_v1.joblib")
assert (pipe2.predict(X_val) == pipe.predict(X_val)).all()   # Laden prüfen</code></pre>
  <p>Zur Datei gehören <b>Metadaten</b>: Version, Datum, Versionen der Libraries, Feature-Namen in der richtigen Reihenfolge, Seed, Metriken mit Baseline und Datenmenge. Ausführlicher ist eine <b>Model Card</b>: Wofür ist das Modell gedacht und wofür nicht, mit welchen Daten wurde es trainiert, wie gut ist es auf welchen Gruppen, welche Grenzen sind bekannt? Hugging Face zeigt sie auf jeder Modellseite.</p>
  <div class="falle"><b>Falle</b><p><code>pickle</code> und <code>joblib</code> führen beim Laden Code aus. Eine fremde <code>.pkl</code>- oder <code>.joblib</code>-Datei zu laden ist so riskant wie ein fremdes Programm zu starten. Nur eigene oder vertrauenswürdige Dateien laden; für fremde Gewichte gibt es <code>.safetensors</code> und <code>torch.load(…, weights_only=True)</code>. Ausserdem passt eine joblib-Datei nur sicher zur selben scikit-learn-Version (sonst <code>InconsistentVersionWarning</code>), darum die Version in den Metadaten.</p></div>

  <h3 id="mo-neu">4 · Neu trainieren: wann und wie</h3>
  <p>Ein Modell ist eine Momentaufnahme der Trainingsdaten. Die Welt ändert sich danach weiter, und das Modell merkt es nicht. Man spricht von <b>Drift</b>:</p>
  <ul>
    <li><b>Data Drift</b> (Covariate Shift): Die Eingaben verteilen sich anders. Beispiel: Ein neuer Sensor misst systematisch höher, Kunden werden jünger, Fotos kommen von einer anderen Kamera.</li>
    <li><b>Concept Drift</b>: Der Zusammenhang zwischen x und y ändert sich. Beispiel: Nach einer Zinserhöhung bedeuten dieselben Kundendaten ein anderes Kreditrisiko; Spam-Mails ändern ihren Stil.</li>
    <li><b>Neue Klassen oder neue Fragen</b>: Ein neues Produkt soll erkannt werden, das es beim Training nicht gab. Dann muss das Modell (mindestens der Output Layer) angepasst werden.</li>
  </ul>
  <p>Erkennen kann man Drift, indem man im Einsatz die <b>Verteilung der Eingaben</b> mit der der Trainingsdaten vergleicht (Mittelwerte, Histogramme, Anteil unbekannter Kategorien) und, sobald die echten Antworten bekannt sind, die <b>Metrik laufend nachrechnet</b>.</p>
  <div class="tablewrap"><table>
    <tr><th>Variante</th><th>Wie</th><th>Gut wenn</th><th>Risiko</th></tr>
    <tr><td><b>Komplett neu</b></td><td>Gleiche Pipeline, auf alten + neuen Daten neu <code>fit</code></td><td>Klassische Modelle, Training dauert Minuten</td><td>Alte Daten, die nicht mehr gelten, ziehen das Modell zurück</td></tr>
    <tr><td><b>Nur auf neuen Daten</b></td><td>Neu <code>fit</code> auf einem aktuellen Zeitfenster</td><td>Starker Concept Drift, alte Daten sind veraltet</td><td>Vergisst seltene Fälle, die nur in alten Daten vorkamen</td></tr>
    <tr><td><b>Weitertrainieren</b></td><td>Vom gespeicherten Modell aus weiter lernen: <code>partial_fit</code>, <code>warm_start=True</code>, bei Netzen <code>fit</code> mit kleiner Learning Rate</td><td>Grosse Netze, laufend neue Daten</td><td><b>Catastrophic Forgetting</b>: Das Netz verlernt Altes, wenn es nur Neues sieht</td></tr>
    <tr><td><b>Nur den Kopf neu</b></td><td>Basis behalten, Output Layer neu (z. B. für eine neue Klasse)</td><td>Neue Klassen, Basis ist gut</td><td>Basis lernt nichts Neues</td></tr>
  </table></div>
  <div class="demo" id="moDriftDemo">
    <div class="tag">Demo</div><h4>Drift: Ein altes Modell wird schlechter</h4>
    <p class="hint">Das Modell (logistische Regression) wurde auf den Daten von «Monat 0» trainiert. Schiebe die Zeit nach rechts: Die Punkte verschieben sich (Data Drift), und die Grenze zwischen den Klassen dreht sich (Concept Drift). Dann trainiere neu und vergleiche.</p>
    <div class="ctl"><label for="moDr">Zeit (Monate seit dem Training)</label><input type="range" id="moDr" min="0" max="12" step="1" value="9"><output id="moDrO"></output></div>
    <div class="btnrow" id="moDrMode" role="group" aria-label="Neu trainieren"><button data-v="old" class="pri" aria-pressed="true">altes Modell behalten</button><button data-v="new" aria-pressed="false">neu trainieren: nur aktuelle Daten</button><button data-v="all" aria-pressed="false">neu trainieren: alte + aktuelle Daten</button></div>
    <svg class="plot" id="moDrSvg" viewBox="0 0 400 300" role="img" aria-label="Punkte zweier Klassen mit der Grenze des alten und des neuen Modells"></svg>
    <div class="stats"><span>Altes Modell, aktuelle Daten <b id="moAccOld"></b></span><span>Gewähltes Modell, aktuelle Daten <b id="moAccNew"></b></span><span>Gewähltes Modell, Daten von Monat 0 <b id="moAccPast"></b></span><span>Baseline <b>0.50</b></span></div>
    <p class="hint" id="moDrMsg"></p>
  </div>
  <p>Beim Vergleich gilt dieselbe Regel wie beim ersten Training: Die neue Version muss auf <b>denselben Testdaten mit derselben Metrik</b> besser sein als die alte, sonst bleibt die alte. Sinnvoll sind zwei Testsets: ein festes, das nie ändert (prüft, ob Altes vergessen wurde), und ein aktuelles aus der jüngsten Zeit (prüft, ob die Drift aufgefangen ist).</p>
  <div class="merk"><b>Merksatz</b><p>Jedes Modell veraltet. Eingaben und Metriken im Einsatz überwachen, bei Drift mit derselben Pipeline neu trainieren, die neue Version auf festen und aktuellen Testdaten gegen die alte prüfen und erst dann austauschen. Die alte Version bleibt gespeichert, damit man zurückwechseln kann (Rollback).</p></div>
  <div class="falle"><b>Falle</b><p>Beim Retraining die Testdaten mit in die Trainingsdaten werfen («wir haben ja jetzt mehr Daten»). Dann hat man keine ehrliche Messung mehr. Ebenso: Feedback Loops. Wenn das Modell entscheidet, welche Fälle überhaupt ein Label bekommen (z. B. nur genehmigte Kredite zeigen, ob sie zurückbezahlt werden), sieht das neue Training nur noch die Fälle, die das alte Modell durchgelassen hat.</p></div>

  <h3 id="mo-best">5 · Best Practices: Modell wählen, speichern, einsetzen</h3>
  <p>Die allgemeinen Regeln (Baseline, Split, Pipeline, einmal testen) stehen in den <a href="#ml-best">Best Practices aus Supervised ML</a>, die fachlichen in jedem Kapitel am Schluss. Hier geht es um die Modellwahl, das Speichern und den Einsatz.</p>
  <div class="bp-check">
    <div><b>Modell wählen</b><ul>
      <li>Zuerst prüfen, ob es für Bilder, Text oder Audio ein vortrainiertes Modell gibt, und es zero-shot auf den eigenen Daten testen.</li>
      <li>«Das neueste Modell nehmen und fine-tunen» ist kein Rezept für alles: Bei Tabellendaten sind klassische Modelle meist besser, und Rahmenbedingungen (Datenmenge, Hardware, Latenz, Lizenz, Datenschutz) entscheiden mit.</li>
      <li>Fine-Tuning nur mit genug passenden Daten. Mit wenig Daten nur den Kopf trainieren, sonst droht Overfitting oder Catastrophic Forgetting.</li>
      <li>Gewählt wird auf den eigenen Validierungsdaten, nicht nach Benchmark oder Erscheinungsdatum.</li>
    </ul></div>
    <div><b>Speichern</b><ul>
      <li>Die ganze Pipeline mit <b>Metadaten</b> speichern (Version, Datum, Library-Versionen, Features, Seed, Metriken mit Baseline), Laden testen.</li>
      <li>Eine kurze <b>Model Card</b> schreiben: Zweck, Daten, Metriken, Grenzen, Lizenz.</li>
      <li>Fremde Gewichte nur als <code>.safetensors</code> oder mit <code>weights_only=True</code> laden.</li>
    </ul></div>
    <div><b>Im Einsatz</b><ul>
      <li>Eingaben prüfen (fehlende Spalten, unbekannte Kategorien, Werte ausserhalb des Trainingsbereichs).</li>
      <li>Verteilung der Eingaben und, sobald bekannt, die Metrik <b>überwachen</b>.</li>
      <li>Retraining mit derselben Pipeline; neue Version gegen alte auf festen und aktuellen Testdaten.</li>
      <li>Alte Versionen archivieren, damit ein <b>Rollback</b> möglich ist.</li>
    </ul></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Begriff</th><th>Bedeutung</th></tr>
    <tr><td><b>Inferenz</b></td><td>Das fertige Modell anwenden (<code>predict</code>), ohne die Parameter zu ändern</td></tr>
    <tr><td><b>Checkpoint</b></td><td>Zwischenstand der Gewichte während des Trainings, z. B. die beste Epoch (<code>ModelCheckpoint</code>)</td></tr>
    <tr><td><b>Weights</b></td><td>Die Parameter eines Netzes; «vortrainierte Weights» heisst: die gelernten Zahlen eines fremden Trainings</td></tr>
    <tr><td><b>Model Card</b></td><td>Kurzbeschreibung eines Modells: Zweck, Daten, Metriken, Grenzen, Lizenz</td></tr>
    <tr><td><b>Model Registry</b></td><td>Ablage für Modellversionen mit Metadaten und Status (z. B. MLflow): Welche Version läuft, welche ist archiviert</td></tr>
    <tr><td><b>Drift</b></td><td>Daten (Data Drift) oder Zusammenhang (Concept Drift) ändern sich nach dem Training</td></tr>
    <tr><td><b>Rollback</b></td><td>Zur vorherigen Modellversion zurückwechseln, wenn die neue schlechter ist</td></tr>
  </table></div>
  <div class="merk"><b>Merksatz</b><p>Ein Modell ist erst fertig, wenn ein anderer Mensch es laden, verstehen und mit neuen Daten genauso neu trainieren kann. Dafür braucht es Pipeline, Metadaten, Seed, Versionen und eine Model Card, nicht nur eine Datei mit Gewichten.</p></div>
`,
    notebooks: [
      { file: 'beispiele/09_Modelle_Praxis.ipynb', desc: `Pipeline gegen Baseline, speichern mit joblib und Metadaten, laden und prüfen, was ohne Scaler passiert, Drift simulieren, auf drei Arten neu trainieren und auf festen und aktuellen Testdaten vergleichen, Weitertrainieren mit <code>partial_fit</code>, Model Card.` },
    ],
    quiz: [
      { q: `Was sind die drei Teile eines Modells?`, a: `<b>Architektur</b> (Form der Funktion, z. B. <code>ŷ = w·x + b</code> oder ein Netz mit Schichten), <b>Parameter</b> (die beim Training gelernten Zahlen, z. B. Gewichte und Bias) und <b>Hyperparameter</b> (Einstellungen des Trainings, z. B. Learning Rate, Epochs, <code>alpha</code>, die man selbst wählt).` },
      { q: `Was ist der Unterschied zwischen Training und Inferenz?`, a: `Beim Training werden die Parameter angepasst (<code>fit</code>). Bei der Inferenz bleiben sie fest, das Modell wird nur angewendet (<code>predict</code>).` },
      { q: `Warum ist ein kNN-Modell so gross wie seine Trainingsdaten?`, a: `kNN lernt keine Parameter, sondern speichert alle Trainingspunkte und sucht bei jeder Vorhersage die k nächsten davon. Das Modell <i>ist</i> der Datensatz.` },
      { q: `Wie gross ist ein Netz mit 25,6 Mio. Parametern in float32 ungefähr?`, a: `25,6 Mio. × 4 Bytes ≈ 102 MB, also etwa 100 MB.` },
      { q: `Warum speichert man in scikit-learn die ganze Pipeline statt nur das Modell?`, a: `Weil die Vorhersage dieselbe Vorverarbeitung braucht wie das Training (Scaler, Encoder, Spaltenreihenfolge). Ohne den gespeicherten Scaler rechnet das Modell mit falsch skalierten Zahlen und liefert Unsinn, ohne Fehlermeldung.` },
      { q: `Wann trainierst du von null, wann nimmst du Transfer Learning, wann Fine-Tuning?`, a: `Von null: Tabellendaten oder sehr viele eigene Daten einer ganz neuen Art. Transfer Learning (Basis einfrieren, Kopf neu): wenig Daten, ähnliche Aufgabe. Fine-Tuning (zusätzlich obere Schichten mit kleiner Learning Rate): mehr Daten oder etwas andere Aufgabe.` },
      { q: `Warum gibt es für Tabellendaten kaum vortrainierte Modelle?`, a: `Jede Tabelle hat andere Spalten mit anderer Bedeutung. Es gibt keine allgemeinen Muster wie Kanten in Bildern oder Wortbedeutungen in Text, die man übertragen könnte.` },
      { q: `Was gehört neben die Modelldatei?`, a: `Metadaten: Version, Datum, Library-Versionen, Feature-Namen in der richtigen Reihenfolge, Seed, Metriken mit Baseline und Datenmenge. Ausführlicher eine Model Card mit Zweck, Daten, Grenzen und Lizenz.` },
      { q: `Warum ist es gefährlich, eine fremde <code>.pkl</code>-Datei zu laden?`, a: `<code>pickle</code> (und <code>joblib</code>) führen beim Laden Code aus. Eine manipulierte Datei kann beliebige Befehle starten. Fremde Gewichte nur als <code>.safetensors</code> oder mit <code>torch.load(…, weights_only=True)</code> laden.` },
      { q: `Was ist der Unterschied zwischen Data Drift und Concept Drift?`, a: `Data Drift: Die Verteilung der Eingaben x ändert sich (andere Kamera, jüngere Kunden). Concept Drift: Der Zusammenhang zwischen x und y ändert sich (dieselben Daten bedeuten jetzt etwas anderes).` },
      { q: `Was ist Catastrophic Forgetting?`, a: `Ein Netz, das nur auf neuen Daten weitertrainiert wird, verlernt, was es auf den alten Daten konnte. Gegenmittel: alte und neue Daten mischen, kleine Learning Rate, auf einem festen alten Testset prüfen.` },
      { q: `Wann ersetzt eine neu trainierte Version die alte?`, a: `Erst wenn sie auf denselben Testdaten mit derselben Metrik besser ist, idealerweise auf einem festen Testset (nichts vergessen) und einem aktuellen (Drift aufgefangen). Die alte Version bleibt für einen Rollback gespeichert.` },
      { q: `Was ist ein Feedback Loop beim Retraining?`, a: `Das Modell bestimmt, welche Fälle ein Label bekommen (z. B. nur genehmigte Kredite zeigen, ob sie zurückbezahlt werden). Das neue Training sieht dann nur die Fälle, die das alte Modell durchgelassen hat, und kann seine Fehler nicht korrigieren.` },
    ],
    init() {
      LernApp.demos.modell();
    },
  });
})();
