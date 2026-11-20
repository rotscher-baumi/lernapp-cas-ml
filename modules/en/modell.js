/* English texts for the module "modell" (Models in practice). Fields replace the German ones when the language is EN. */
LernApp.translate('modell', {
  nav: 'Models in practice',
  title: `Models in practice`,
  kicker: `Cross-cutting · Lifecycle of a model`,
  summary: `What a model actually is (architecture, parameters, hyperparameters), taking over pretrained models, fine-tuning, saving and loading, drift and retraining, best practices`,
  html: `  <p>Every chapter so far said «the model learns» or «we train a model». This chapter takes a step back: <b>what actually is a model</b>, what is inside a model file, when do you take a ready-made model instead of your own, and what happens when a model in use slowly gets worse? At the end are the best practices for choosing, saving and running a model; the subject-specific best practices are at the end of each chapter.</p>
  <p class="note">The demos compute in the browser. The example notebook at the end of the chapter does the same with scikit-learn: save a pipeline, load it, simulate drift, retrain.</p>

  <h3 id="mo-ablauf">The whole workflow at a glance</h3>
  <p>A model has a life cycle: it is built, checked, saved, deployed and at some point retrained or retired. Steps 4 to 7 repeat as long as the data keep changing.</p>
  <p class="hint">Click a step in the figure: the explanation opens below it, with links to the matching places in the chapter.</p>
  <figure class="fig ab-fig" id="moFlowFig">
    <div class="ab-scroll">
    <svg viewBox="0 0 680 650" role="img" aria-label="Life cycle of a model: problem and baseline, choose the model, data and pipeline, train, evaluate, save and version, deploy and monitor, compare the new with the old version, retire the old version. On drift back to training, on a new task back to choosing the model">
      ${LernApp.nnFlow({
        id: 'mo',
        aria: 'Step %: open explanation',
        steps: [
          ['Problem and baseline', 'goal, metric, simplest model'],
          ['Choose the model', 'ready-made, fine-tuned or own'],
          ['Data and pipeline', 'split, preprocessing inside the model'],
          ['Train', 'learn the parameters: fit()'],
          ['Evaluate', 'validation against the baseline'],
          ['Save and version', 'pipeline, versions, model card'],
          ['Deploy and monitor', 'inference: predict(), measure drift'],
          ['Compare new with old', 'same test data, same metric'],
          ['Retire the old version', 'archive it, rollback possible'],
        ],
        loopA: ['Drift:', 'retrain'],
        loopB: ['New task:', 'other model'],
      })}
    </svg>
    </div>
    <div class="ab-detail" role="region" aria-live="polite" hidden>
      <div class="ab-dh"><b></b><button type="button" class="ab-x" aria-label="Close">✕</button></div>
      <div class="ab-db"></div>
      <div class="ab-dl"></div>
    </div>
    <figcaption>The inner loop (orange dashed) runs on every retraining: new data, train, evaluate, save, deploy. The outer loop leads back to choosing the model when the task itself changes. The old version (orange) is only retired once the new one is shown to be better.</figcaption>
  </figure>

  <h3 id="mo-was">1 · What actually is a model?</h3>
  <p>A model is a <b>function with learned numbers</b>. It takes an input x and returns a prediction ŷ:</p>
  <pre><code>ŷ = f(x; θ)
f = architecture (the shape of the function)    θ = parameters (the learned numbers)</code></pre>
  <p>So a model has three parts that need to be kept apart:</p>
  <div class="tablewrap"><table>
    <tr><th>Part</th><th>What it is</th><th>Who sets it</th><th>Example linear regression</th></tr>
    <tr><td><b>Architecture</b></td><td>The shape of the function: which computation steps in which order</td><td>You, when choosing the model</td><td><code>ŷ = w · x + b</code></td></tr>
    <tr><td><b>Parameters</b></td><td>The numbers inside the function, found during training</td><td>Training (<code>fit</code>)</td><td><code>w = 17.2</code>, <code>b = 612</code></td></tr>
    <tr><td><b>Hyperparameters</b></td><td>Settings that control training but are not learned</td><td>You, chosen on validation</td><td>learning rate, epochs, regularisation <code>alpha</code></td></tr>
  </table></div>
  <p>Two more terms are often mixed up. The <b>algorithm</b> is the procedure that finds the parameters (e.g. gradient descent or the normal equation). The <b>model</b> is the result: architecture plus the parameters found. During <b>training</b> the parameters change; during <b>inference</b> (<code>predict</code>) they stay fixed and the model is only applied.</p>
  <div class="tablewrap"><table>
    <tr><th>Model</th><th>Architecture</th><th>Parameters</th><th>Size (roughly)</th></tr>
    <tr><td><b>Linear regression</b>, 8 features</td><td>weighted sum</td><td>8 weights + 1 bias</td><td>under 1 KB</td></tr>
    <tr><td><b>Decision tree</b></td><td>nested if-then rules</td><td>per node a feature and a threshold, per leaf a value</td><td>KB</td></tr>
    <tr><td><b>Random forest</b>, 100 trees</td><td>average of many trees</td><td>all nodes of all trees</td><td>MB to over 100 MB</td></tr>
    <tr><td><b>kNN</b></td><td>«ask the k nearest neighbours»</td><td>none in the strict sense: the model <i>is</i> the training set</td><td>as large as the training data</td></tr>
    <tr><td><b>ResNet-50</b> (CNN)</td><td>50 layers with convolutions and skip connections</td><td>about 25.6 million weights</td><td>about 100 MB (float32)</td></tr>
    <tr><td><b>BERT-base</b> (transformer)</td><td>12 transformer blocks</td><td>about 110 million weights</td><td>about 440 MB (float32)</td></tr>
    <tr><td><b>LLM</b> with 7 billion parameters</td><td>dozens of transformer blocks</td><td>7 billion weights</td><td>about 14 GB (16 bits per weight)</td></tr>
  </table></div>
  <p>The size follows directly from the number of parameters: count × bytes per number. A float32 takes 4 bytes, 25.6 million × 4 B ≈ 100 MB.</p>
  <div class="demo" id="moFileDemo">
    <div class="tag">Demo</div><h4>A model is just a file of numbers</h4>
    <p class="hint">Twelve flats: living area against monthly rent. Train the linear regression with more or fewer epochs and look at what is in the «model file» on the right. The prediction below then computes <b>only</b> from this file. Switch off the preprocessing and see what happens.</p>
    <div class="ctl"><label for="moEp">Epochs (gradient descent)</label><input type="range" id="moEp" min="0" max="200" step="5" value="60"><output id="moEpO"></output></div>
    <div class="ctl"><label for="moQ">Prediction for living area (m²)</label><input type="range" id="moQ" min="30" max="130" step="1" value="85"><output id="moQO"></output></div>
    <div class="btnrow" id="moScl" role="group" aria-label="Preprocessing in the file"><button data-v="1" class="pri" aria-pressed="true">scaler saved with it</button><button data-v="0" aria-pressed="false">only the model saved</button></div>
    <div class="mo-file">
      <svg class="plot" id="moFileSvg" viewBox="0 0 360 240" role="img" aria-label="Scatter plot of living area against rent with the learned line"></svg>
      <pre class="mo-json"><code id="moJson"></code></pre>
    </div>
    <div class="stats"><span>MAE <b id="moMae"></b></span><span>Prediction <b id="moPred"></b></span></div>
    <p class="hint" id="moFileMsg"></p>
  </div>
  <div class="merk"><b>Key point</b><p>Model = architecture + learned parameters. The hyperparameters decided <i>how</i> it learned but are not part of the computation. To predict, you also need exactly the same preprocessing as in training: scaler, encoder, column order, image size.</p></div>
  <div class="falle"><b>Pitfall</b><p>Saving only the model and forgetting the scaler. The model then computes with unscaled numbers and returns nonsense, without any error message. That is why in scikit-learn you save the whole <code>Pipeline</code>, not just the estimator.</p></div>

  <h3 id="mo-quelle">2 · Where does a model come from? Train it, take it over, adapt it</h3>
  <p>You do not always have to train a model from scratch. For images, text and audio there are <b>pretrained models</b> that learned on huge datasets (ImageNet: 1.28 million images in 1000 classes). Their early layers recognise general patterns (edges, shapes, word meanings) that are useful for your task too.</p>
  <div class="tablewrap"><table>
    <tr><th>Way</th><th>What you do</th><th>When</th><th>Effort</th></tr>
    <tr><td><b>Train from scratch</b></td><td>Choose an architecture, start all parameters at random, learn everything</td><td>Tabular data (almost always), very much own data, a completely new kind of data</td><td>high for networks, small for classical models</td></tr>
    <tr><td><b>Use as it is</b></td><td>Use a pretrained model unchanged (zero-shot)</td><td>The task is exactly the model's (e.g. ImageNet classes, translation, SAM segmentation)</td><td>almost none</td></tr>
    <tr><td><b>Transfer learning</b></td><td>Freeze the base, train only a new head (output layer)</td><td>Little own data (hundreds to thousands), similar task</td><td>small</td></tr>
    <tr><td><b>Fine-tuning</b></td><td>Then also keep training the upper layers of the base with a very small learning rate</td><td>More data (tens of thousands), somewhat different task</td><td>medium</td></tr>
  </table></div>
  <p>You find pretrained models on the <b>Hugging Face Hub</b> (text, image, audio), in <b>Keras Applications</b> (<code>keras.applications.ResNet50</code>), in <b>torchvision</b> (<code>torchvision.models</code>) and for images in <b>timm</b>. scikit-learn has no pretrained models: with tabular data the columns of every task are different, so there is nothing general to take over.</p>
  <pre><code># Transfer learning with Keras (see the CNN chapter)
base = keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")
base.trainable = False                      # freeze the base
model = keras.Sequential([base, keras.layers.Dense(3, activation="softmax")])
model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=5)

base.trainable = True                       # optional: fine-tuning
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss="sparse_categorical_crossentropy")
model.fit(train_ds, validation_data=val_ds, epochs=3)</code></pre>
  <div class="demo" id="moPickDemo">
    <div class="tag">Demo</div><h4>Which way fits?</h4>
    <p class="hint">Choose the data type, the amount of data and how similar your task is to that of a pretrained model.</p>
    <div class="btnrow" id="moPType" role="group" aria-label="Data type"><button data-v="tab" class="pri" aria-pressed="true">Table</button><button data-v="img" aria-pressed="false">Images</button><button data-v="txt" aria-pressed="false">Text</button></div>
    <div class="btnrow" id="moPN" role="group" aria-label="Amount of data"><button data-v="few" class="pri" aria-pressed="true">a few hundred</button><button data-v="mid" aria-pressed="false">tens of thousands</button><button data-v="many" aria-pressed="false">millions</button></div>
    <div class="btnrow" id="moPSim" role="group" aria-label="Similarity to the task of the pretrained model"><button data-v="same" class="pri" aria-pressed="true">same task</button><button data-v="near" aria-pressed="false">similar</button><button data-v="far" aria-pressed="false">very different</button></div>
    <div class="mo-rec" id="moPRec" aria-live="polite"></div>
  </div>
  <div class="falle"><b>Pitfall</b><p>A pretrained model expects <b>its own</b> preprocessing: the same image size, the same normalisation (e.g. <code>keras.applications.resnet50.preprocess_input</code>), the same tokenizer. Its licence and the limits of its training data apply too: a model that only knows daylight photos fails at night.</p></div>

  <h3 id="mo-speichern">3 · Saving and loading</h3>
  <p>After training the model lives in memory. So that it can make predictions later (or on another computer), it is saved: architecture and parameters, with scikit-learn also the whole preprocessing.</p>
  <div class="tablewrap"><table>
    <tr><th>Framework</th><th>Save</th><th>Load</th><th>What is inside</th></tr>
    <tr><td><b>scikit-learn</b></td><td><code>joblib.dump(pipe, "model.joblib")</code></td><td><code>joblib.load("model.joblib")</code></td><td>The whole Python object (pipeline with scaler and model)</td></tr>
    <tr><td><b>Keras</b></td><td><code>model.save("model.keras")</code></td><td><code>keras.models.load_model("model.keras")</code></td><td>Architecture, weights, optimizer state</td></tr>
    <tr><td><b>PyTorch</b></td><td><code>torch.save(model.state_dict(), "model.pt")</code></td><td><code>model.load_state_dict(torch.load("model.pt", weights_only=True))</code></td><td>Only the weights; the architecture is your Python code</td></tr>
    <tr><td><b>Hugging Face</b></td><td><code>model.save_pretrained("folder")</code></td><td><code>AutoModel.from_pretrained("folder")</code></td><td>Weights (<code>.safetensors</code>), configuration, tokenizer</td></tr>
    <tr><td><b>ONNX</b></td><td>Export from PyTorch, Keras, scikit-learn</td><td>ONNX Runtime (Python, C#, JavaScript …)</td><td>Computation graph and weights, independent of the framework</td></tr>
  </table></div>
  <pre><code>import json, joblib, sklearn
from datetime import date

pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)

joblib.dump(pipe, "model_v1.joblib")                  # the whole pipeline, not just the model
meta = {"version": "v1", "date": str(date.today()), "sklearn": sklearn.__version__,
        "features": list(X_train.columns), "seed": 42,
        "val_accuracy": 0.87, "baseline_accuracy": 0.61, "n_train": len(X_train)}
json.dump(meta, open("model_v1.json", "w"), indent=2)  # metadata next to it

pipe2 = joblib.load("model_v1.joblib")
assert (pipe2.predict(X_val) == pipe.predict(X_val)).all()   # check loading</code></pre>
  <p><b>Metadata</b> belong with the file: version, date, library versions, feature names in the right order, seed, metrics with baseline and amount of data. More detailed is a <b>model card</b>: what is the model meant for and what not, which data was it trained on, how good is it on which groups, which limits are known? Hugging Face shows one on every model page.</p>
  <div class="falle"><b>Pitfall</b><p><code>pickle</code> and <code>joblib</code> run code while loading. Loading someone else's <code>.pkl</code> or <code>.joblib</code> file is as risky as starting someone else's program. Only load your own or trusted files; for foreign weights there are <code>.safetensors</code> and <code>torch.load(…, weights_only=True)</code>. Also, a joblib file only reliably fits the same scikit-learn version (otherwise <code>InconsistentVersionWarning</code>), hence the version in the metadata.</p></div>

  <h3 id="mo-neu">4 · Retraining: when and how</h3>
  <p>A model is a snapshot of its training data. The world keeps changing afterwards, and the model does not notice. This is called <b>drift</b>:</p>
  <ul>
    <li><b>Data drift</b> (covariate shift): the inputs are distributed differently. Example: a new sensor measures systematically higher, customers get younger, photos come from another camera.</li>
    <li><b>Concept drift</b>: the relationship between x and y changes. Example: after an interest rate rise, the same customer data mean a different credit risk; spam emails change their style.</li>
    <li><b>New classes or new questions</b>: a new product should be recognised that did not exist at training time. Then the model (at least the output layer) has to be adapted.</li>
  </ul>
  <p>You detect drift by comparing the <b>distribution of the inputs</b> in use with that of the training data (means, histograms, share of unknown categories) and, as soon as the true answers are known, by <b>recomputing the metric</b> continuously.</p>
  <div class="tablewrap"><table>
    <tr><th>Variant</th><th>How</th><th>Good when</th><th>Risk</th></tr>
    <tr><td><b>Completely new</b></td><td>Same pipeline, new <code>fit</code> on old + new data</td><td>Classical models, training takes minutes</td><td>Old data that no longer hold pull the model back</td></tr>
    <tr><td><b>New data only</b></td><td>New <code>fit</code> on a recent time window</td><td>Strong concept drift, old data are outdated</td><td>Forgets rare cases that only occurred in old data</td></tr>
    <tr><td><b>Keep training</b></td><td>Continue from the saved model: <code>partial_fit</code>, <code>warm_start=True</code>, for networks <code>fit</code> with a small learning rate</td><td>Large networks, continuous new data</td><td><b>Catastrophic forgetting</b>: the network unlearns old things when it only sees new ones</td></tr>
    <tr><td><b>New head only</b></td><td>Keep the base, new output layer (e.g. for a new class)</td><td>New classes, the base is good</td><td>The base learns nothing new</td></tr>
  </table></div>
  <div class="demo" id="moDriftDemo">
    <div class="tag">Demo</div><h4>Drift: an old model gets worse</h4>
    <p class="hint">The model (logistic regression) was trained on the data of «month 0». Move time to the right: the points shift (data drift), and the boundary between the classes rotates (concept drift). Then retrain and compare.</p>
    <div class="ctl"><label for="moDr">Time (months since training)</label><input type="range" id="moDr" min="0" max="12" step="1" value="9"><output id="moDrO"></output></div>
    <div class="btnrow" id="moDrMode" role="group" aria-label="Retrain"><button data-v="old" class="pri" aria-pressed="true">keep the old model</button><button data-v="new" aria-pressed="false">retrain: current data only</button><button data-v="all" aria-pressed="false">retrain: old + current data</button></div>
    <svg class="plot" id="moDrSvg" viewBox="0 0 400 300" role="img" aria-label="Points of two classes with the boundary of the old and the new model"></svg>
    <div class="stats"><span>Old model, current data <b id="moAccOld"></b></span><span>Chosen model, current data <b id="moAccNew"></b></span><span>Chosen model, data of month 0 <b id="moAccPast"></b></span><span>Baseline <b>0.50</b></span></div>
    <p class="hint" id="moDrMsg"></p>
  </div>
  <p>The comparison follows the same rule as the first training: the new version must be better on <b>the same test data with the same metric</b> as the old one, otherwise the old one stays. Two test sets make sense: a fixed one that never changes (checks whether old things were forgotten), and a recent one (checks whether the drift is handled).</p>
  <div class="merk"><b>Key point</b><p>Every model ages. Monitor inputs and metrics in use, retrain with the same pipeline on drift, check the new version against the old one on fixed and recent test data and only then swap. The old version stays saved so you can switch back (rollback).</p></div>
  <div class="falle"><b>Pitfall</b><p>Throwing the test data into the training data when retraining («we have more data now»). Then there is no honest measurement left. Likewise: feedback loops. If the model decides which cases get a label at all (e.g. only approved loans show whether they are repaid), the new training only sees the cases the old model let through.</p></div>

  <h3 id="mo-best">5 · Best practices: choosing, saving, running a model</h3>
  <p>The general rules (baseline, split, pipeline, test once) are in the <a href="#ml-best">best practices from Supervised ML</a>, the subject-specific ones at the end of each chapter. This one is about choosing, saving and running a model.</p>
  <div class="bp-check">
    <div><b>Choosing a model</b><ul>
      <li>First check whether a pretrained model exists for images, text or audio, and test it zero-shot on your own data.</li>
      <li>«Take the newest model and fine-tune it» is not a recipe for everything: on tabular data classical models are usually better, and constraints (amount of data, hardware, latency, licence, privacy) decide as well.</li>
      <li>Fine-tune only with enough suitable data. With little data train only the head, otherwise overfitting or catastrophic forgetting threatens.</li>
      <li>Choose on your own validation data, not by benchmark or release date.</li>
    </ul></div>
    <div><b>Saving</b><ul>
      <li>Save the whole pipeline with <b>metadata</b> (version, date, library versions, features, seed, metrics with baseline), test loading.</li>
      <li>Write a short <b>model card</b>: purpose, data, metrics, limits, licence.</li>
      <li>Load foreign weights only as <code>.safetensors</code> or with <code>weights_only=True</code>.</li>
    </ul></div>
    <div><b>In use</b><ul>
      <li>Check inputs (missing columns, unknown categories, values outside the training range).</li>
      <li><b>Monitor</b> the distribution of the inputs and, once known, the metric.</li>
      <li>Retrain with the same pipeline; new version against old on fixed and recent test data.</li>
      <li>Archive old versions so a <b>rollback</b> is possible.</li>
    </ul></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td><b>Inference</b></td><td>Applying the finished model (<code>predict</code>) without changing the parameters</td></tr>
    <tr><td><b>Checkpoint</b></td><td>Snapshot of the weights during training, e.g. the best epoch (<code>ModelCheckpoint</code>)</td></tr>
    <tr><td><b>Weights</b></td><td>The parameters of a network; «pretrained weights» means the learned numbers of someone else's training</td></tr>
    <tr><td><b>Model card</b></td><td>Short description of a model: purpose, data, metrics, limits, licence</td></tr>
    <tr><td><b>Model registry</b></td><td>Store for model versions with metadata and status (e.g. MLflow): which version runs, which is archived</td></tr>
    <tr><td><b>Drift</b></td><td>The data (data drift) or the relationship (concept drift) change after training</td></tr>
    <tr><td><b>Rollback</b></td><td>Switching back to the previous model version when the new one is worse</td></tr>
  </table></div>
  <div class="merk"><b>Key point</b><p>A model is only finished when another person can load it, understand it and retrain it the same way with new data. That takes pipeline, metadata, seed, versions and a model card, not just a file of weights.</p></div>
`,
  notebooks: [
    { file: 'beispiele/09_Modelle_Praxis.ipynb', desc: `Pipeline against a baseline, saving with joblib and metadata, loading and checking, what happens without the scaler, simulating drift, retraining in three ways and comparing on fixed and recent test data, continuing training with <code>partial_fit</code>, model card.` },
  ],
  quiz: [
    { q: `What are the three parts of a model?`, a: `<b>Architecture</b> (the shape of the function, e.g. <code>ŷ = w·x + b</code> or a network with layers), <b>parameters</b> (the numbers learned in training, e.g. weights and bias) and <b>hyperparameters</b> (settings of the training, e.g. learning rate, epochs, <code>alpha</code>, which you choose yourself).` },
    { q: `What is the difference between training and inference?`, a: `During training the parameters are adjusted (<code>fit</code>). During inference they stay fixed and the model is only applied (<code>predict</code>).` },
    { q: `Why is a kNN model as large as its training data?`, a: `kNN learns no parameters; it stores all training points and searches the k nearest of them for every prediction. The model <i>is</i> the dataset.` },
    { q: `Roughly how large is a network with 25.6 million parameters in float32?`, a: `25.6 million × 4 bytes ≈ 102 MB, so about 100 MB.` },
    { q: `Why do you save the whole pipeline in scikit-learn instead of only the model?`, a: `Because prediction needs the same preprocessing as training (scaler, encoder, column order). Without the saved scaler the model computes with wrongly scaled numbers and returns nonsense, without an error message.` },
    { q: `When do you train from scratch, when use transfer learning, when fine-tuning?`, a: `From scratch: tabular data or very much own data of a completely new kind. Transfer learning (freeze the base, new head): little data, similar task. Fine-tuning (also the upper layers with a small learning rate): more data or a somewhat different task.` },
    { q: `Why are there hardly any pretrained models for tabular data?`, a: `Every table has different columns with a different meaning. There are no general patterns like edges in images or word meanings in text that could be transferred.` },
    { q: `What belongs next to the model file?`, a: `Metadata: version, date, library versions, feature names in the right order, seed, metrics with baseline and amount of data. In more detail a model card with purpose, data, limits and licence.` },
    { q: `Why is it dangerous to load someone else's <code>.pkl</code> file?`, a: `<code>pickle</code> (and <code>joblib</code>) run code while loading. A manipulated file can start any command. Load foreign weights only as <code>.safetensors</code> or with <code>torch.load(…, weights_only=True)</code>.` },
    { q: `What is the difference between data drift and concept drift?`, a: `Data drift: the distribution of the inputs x changes (another camera, younger customers). Concept drift: the relationship between x and y changes (the same data now mean something else).` },
    { q: `What is catastrophic forgetting?`, a: `A network that keeps training on new data only unlearns what it could do on the old data. Remedies: mix old and new data, a small learning rate, check on a fixed old test set.` },
    { q: `When does a retrained version replace the old one?`, a: `Only when it is better on the same test data with the same metric, ideally on a fixed test set (nothing forgotten) and a recent one (drift handled). The old version stays saved for a rollback.` },
    { q: `What is a feedback loop in retraining?`, a: `The model decides which cases get a label (e.g. only approved loans show whether they are repaid). The new training then only sees the cases the old model let through and cannot correct its errors.` },
  ],
});
