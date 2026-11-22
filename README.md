# Lernapp CAS ML

Lernseite zum Kursstoff: Erklärungen, Diagramme, Demos und Selbsttest, auf Deutsch und Englisch, hell und dunkel. Alles Selbsterstellte liegt in diesem Ordner, getrennt von den Kursunterlagen.

Öffnen: `index.html` per Doppelklick im Browser. Es braucht Internet für die Schrift (Google Fonts).

Oben rechts: **DE / EN** schaltet die Sprache um, **Hell / Dunkel / Auto** das Farbschema (Auto folgt dem System). Beides merkt sich der Browser; mit Server auch über Browser hinweg. Für Links und Tests: `?lang=en`, `?theme=dark`.

Architektur, Diagramme (PlantUML) und Datenobjektmodell: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) und [docs/DESIGN.md](docs/DESIGN.md).

## Aufbau

```
lernapp/
  index.html        Kern: Kopf, Überblick, Liste der Module
  notebook.html     Übungs-Notebook (lokal mit Jupyter oder in Colab)
  titanic.html      Titanic-Seite
  mathe-kompakt.html, mathe-ausfuehrlich.html   eigene Mathe-Seiten
  kompakt.html      Spickzettel über Supervised ML, Klassifikation, Unsupervised, Neural Networks, CNN, Image Processing, Object Detection & Segmentation, Generative Models und die Praxis aus Übersicht & Praxis (Modell, Speichern, Drift)
  server.py         lokaler Server (Zustand, Jupyter-Start, Proxy)
  run.sh            Jupyter und Server unter Linux/macOS starten
  requirements.txt, requirements-dev.txt   Laufzeit- und Entwicklungspakete
  assets/
    style.css       Design (hell und dunkel)
    core.js         Navigation, Sprache, Theme, Selbsttest; gemeinsame Helfer (mulberry32, gauss, drag, setRange)
    demos-<id>.js   Demo-Code der grossen Kapitel (ml, klass, unsup, nn, cnn, cv, det, gen; `demos-modell.js` für den Praxis-Teil von `uebersicht.js`), das Kapitel in modules/ ruft ihn in init() auf
                    (`demos-nn.js` liefert auch die zwei klickbaren SVG-Grafiken des Kapitels Neural Networks: `LernApp.nnFlow` Ablauf, `LernApp.nnConcept` Hauptkonzept; die Kapitel CNN, Image Processing, Object Detection & Segmentation und Generative Models nutzen `nnFlow` mit eigenem `id` für die Pfeil-Marker; `demos-det.js` liefert zusätzlich `LernApp.detFig` mit den statischen SVG-Grafiken des Kapitels Object Detection & Segmentation, die `modules/det.js` und `modules/en/det.js` in ihrem `html` aufrufen; ebenso `demos-gen.js` mit `LernApp.genFig` für Generative Models)
    demos-quiz.js   Kapitel Quiz: Wiederholung nach Plan (Leitner), leeres Blatt, Fortschritt; reine Logik in `LernApp.quizLogic`
    demos-*.js      geteilte Demos (Mathe, k-Means)
    search.js       Volltextsuche der Hauptseite: klebende Leiste über den Kapitel-Chips, Trefferliste, ▲▼, Markierung (CSS Custom Highlight API)
    notebook-data.js  aus den Notebooks erzeugt (nicht von Hand ändern)
  modules/          ein Kapitel pro Datei
    ds.js git.js python.js pandas.js viz.js hood.js mathe*.js ml.js klass.js unsup.js nn.js cnn.js cv.js det.js gen.js uebersicht.js quiz.js kompakt.js titanic.js
    en/             englische Texte je Kapitel
    _vorlage.js     Vorlage für ein neues Kapitel
  notebooks/        Übungs-Notebooks (Jupyter / VS Code)
    beispiele/      Beispiel-Notebooks zu allen Modellen und Strategien (01 bis 09)
  tools/            build_notebook_exercises.py
  scripts/          Node-Skripte, die Notebooks erzeugen
  tests/            pytest-Tests
  docs/             Architektur, PlantUML-Diagramme, Design-Dokument
```

## Navigation

Die Hauptseite zeigt immer ein Kapitel aufs Mal: Ein Chip oben, ein Link oder Zurück/Weiter am Ende des Kapitels wechselt es; die Zurück-Taste des Browsers funktioniert. Die Adresse sagt, was zu sehen ist: `index.html` oder `#ueberblick` die Übersicht, `#cv` das Kapitel, `#cv-pixel` ein Abschnitt darin. Unter dem Titel jedes Kapitels steht «Auf dieser Seite» mit allen Abschnitten (h3); ab 1280 px Breite fest rechts neben dem Text, mit Markierung des aktuellen Abschnitts. Code: `wireRouter()` in `assets/core.js`.

## Suche

Oben in der klebenden Leiste über den Kapiteln steht ein Suchfeld (Taste `/` oder `Ctrl+K`). Gesucht wird im Text der gewählten Sprache in allen Kapiteln, auch in den gerade ausgeblendeten (ein Treffer dort öffnet sein Kapitel), auch in den zugeklappten Antworten des Selbsttests; Gross- und Kleinschreibung und Akzente zählen nicht, «groesse» findet «Grösse». Die Liste zeigt Kapitel › Abschnitt und einen Ausschnitt; Enter und ▼ springen zum nächsten Treffer, Shift+Enter und ▲ zum vorherigen, Esc schliesst. Die Markierung im Text braucht die CSS Custom Highlight API (Chrome, Edge, Safari 17.2+, Firefox 140+); ohne sie funktionieren Liste und Springen trotzdem. Code: `assets/search.js`, nur auf `index.html` eingebunden.

## Quiz

Das letzte Kapitel (`#quiz`) fragt die Selbsttest-Fragen aller Kapitel der Hauptseite ab. Eigene Fragen hat es nicht: Neue Fragen im Feld `quiz` eines Kapitels erscheinen dort automatisch. Eine Runde enthält alle fälligen Fragen der gewählten Kapitel und eine wählbare Zahl neuer Fragen, gemischt über die Kapitel. Nach dem Aufdecken bewertest du dich: «Nicht gewusst» schickt die Frage zurück in Fach 1, «Knapp» lässt sie im Fach, «Sicher» schiebt sie ein Fach weiter. Die Fächer 1 bis 5 sind nach 1, 3, 7, 14 und 30 Tagen wieder fällig. Dazu kommen das leere Blatt (Kapitel aus dem Kopf aufschreiben, dann mit den Abschnitten und Merksätzen vergleichen) und eine Fortschrittstabelle. Der Zustand liegt unter `cas-ml-quiz` (Browser und mit Server in `data/state.json`). Die ID einer Frage entsteht aus Kapitel und deutschem Fragetext: Wer eine Frage umformuliert, setzt ihren Fortschritt zurück. Code: `assets/demos-quiz.js`, Tests: `tests/test_quiz.py`.

## Neues Kapitel hinzufügen

1. `modules/_vorlage.js` nach `modules/<name>.js` kopieren.
2. `id`, `order`, `nav`, `title`, `kicker`, `summary` und `html` ausfüllen. Optional `quiz` (Selbsttest), `notebooks` und `init()` für Demos. Bei grösseren Kapiteln liegt der Demo-Code in `assets/demos-<name>.js` (`LernApp.demos.<name> = function () {...}`), `init()` ruft nur `LernApp.demos.<name>()` auf; die Datei vor dem Kapitel in `index.html` einbinden.
3. In `index.html` unten eine Zeile ergänzen: `<script src="modules/<name>.js"></script>`. Für Englisch `modules/en/<name>.js` mit `LernApp.translate('<name>', {...})` anlegen und nach den Kapiteln einbinden.

Navigation, Übersichtskarte und Selbsttest erscheinen automatisch. Die Reihenfolge bestimmt `order`.

Die Kapitel sind JavaScript-Dateien (mit dem HTML als Text), weil Browser beim Öffnen per Doppelklick keine zusätzlichen HTML-Dateien nachladen dürfen. Es gibt keinen Build-Schritt.

## Notebooks

Die Übungs-Notebooks liegen in `notebooks/` (u. a. `Lernapp_Uebungen`, `Lernapp_Lernhilfe`, `Workflow_Train_Val_Test_CV`, `Supervised_Learning_1_Uebungen_own`, `PCA_gewichtete_Summen_own`, `Python_Pandas_Uebungen_own`). Sie brauchen `pandas`, `numpy`, `matplotlib` und `scikit-learn`. Das Notebook `Fehlende_Werte_Imputation.ipynb` zeigt separat, wie fehlende Werte ohne Data Leakage anhand der Trainingsmediane ergänzt werden. Die Kursunterlagen in den Modulordnern werden nicht verändert.

### Beispiel-Notebooks

`notebooks/beispiele/` hat ein eigenständiges Notebook pro Thema der Übersicht: `01_Regression`, `02_Klassifikation`, `03_Ensembles`, `04_Clustering_Anomalien`, `05_Dimensionsreduktion`, `06_Strategien`, `07_Titanic` (der ganze Ablauf an einem echten Datensatz, derselbe Code wie auf `titanic.html`) `08_Neuronale_Netze` (Backpropagation von Hand mit Gradient-Check, dann `MLPClassifier`; ohne Keras/TensorFlow) und `09_Modelle_Praxis` (Pipeline speichern und laden mit Metadaten, Drift simulieren, neu trainieren, `partial_fit`, Model Card; speichert nur in einen temporären Ordner). Jedes lädt seine Daten selbst (scikit-learn-Datensätze oder erzeugte Daten, nur Titanic nimmt `../../../titanic/data.csv`, falls vorhanden, sonst die öffentliche Kaggle-Kopie aus dem Netz) und hängt von keinem anderen ab. Die Steckbriefe der Übersicht verlinken mit «Beispiele →» darauf (die Steckbriefe zu CNN, Computer Vision und Generative Models haben noch kein Beispiel-Notebook und zeigen nur «ausführlich →»), `notebook.html?nb=beispiele/01_Regression.ipynb` öffnet ein Notebook direkt.

**Auf einem anderen PC:** Repo klonen, dann im Lernapp-Ordner `py -3.12 -m venv .venv`, `.venv\Scripts\python -m pip install -r requirements.txt`, `.venv\Scripts\python server.py` (Linux/macOS: `./run.sh`). Der Knopf «Jupyter starten» nimmt automatisch das Python aus `.venv`. Ohne Installation geht es im Browser mit Google Colab: Jedes Beispiel-Notebook hat oben den Link «In Colab öffnen»; ein Google-Konto genügt, solange das Repo öffentlich ist (ist es privat, in Colab mit GitHub anmelden und «Include private repos» anhaken). Die Setup-Zelle installiert dort `umap-learn` und `imbalanced-learn` bei Bedarf selbst.

### Übungen in der App und im Notebook

Die Übungen gibt es zweimal, bewusst identisch: im Notebook und am Ende des Kapitels in der Webseite. Die Notebooks sind die Quelle. `assets/notebook-data.js` wird daraus erzeugt (nicht von Hand ändern):

```
python tools/build_notebook_exercises.py            # neu erzeugen
python tools/build_notebook_exercises.py --check    # prüft, ob die Datei aktuell ist
python tools/build_notebook_exercises.py --verify   # alle Lösungen gegen ihre Prüfung laufen lassen
```

Ein Kapitel zeigt die Übungen mit `nbExercises: '<datei>.ipynb'` im Modul. Die Webseite führt den Code mit Pyodide aus (echtes pandas und scikit-learn im Browser, der erste Start lädt einige zehn MB).

### Lokale Jupyter-Umgebung unter Windows

Im gemeinsamen HSLU-Ordner liegt eine isolierte Python-3.12-Umgebung
für JupyterLab und die grundlegenden Python-, Pandas- und ML-Übungen.
Die folgenden Befehle werden im übergeordneten HSLU-Ordner ausgeführt:

```powershell
powershell -ExecutionPolicy Bypass -File .\Setup-Jupyter.ps1
powershell -ExecutionPolicy Bypass -File .\Start-Jupyter.ps1
.\.venv\Scripts\python.exe .\check_sources.py
```

Die lokalen Hilfsdateien liegen neben den beiden Repositories, nicht im
Lernapp-Repository; sie sind daher nicht Teil eines eigenständigen Lernapp-Klons.
Die benötigten Pakete stehen in `..\requirements-jupyter.txt`.
In Jupyter den Kernel **HSLU CAS ML (Python 3.12)** auswählen; in VS Code
den Interpreter `..\.venv\Scripts\python.exe`.
Der Server hört nur auf `127.0.0.1` und behält die Token-Anmeldung bei.
Beenden mit `Ctrl+C` im Serverterminal oder aus dem HSLU-Ordner mit
`.\.venv\Scripts\python.exe -m jupyter server stop 8888`.

Die Prüfung kompiliert Python-Dateien und Python-Codezellen (einschliesslich
IPython-Magics), validiert Notebook-Strukturen und prüft JavaScript mit Node.js.
Sie führt keine Kurszellen, Trainingsläufe oder Downloads aus. Ergebnisse und
Python-Bytecode liegen unter `..\.build`; Fehler führen zu einem Exitcode ungleich null.
PDFs, Bilder und andere Unterlagen benötigen keinen Compiler.

Die Basisumgebung deckt nicht sämtliche Spezialmodule ab. Computer Vision,
Deep Learning und Timeseries benötigen zusätzliche, teilweise inkompatible
Abhängigkeiten aus ihren Modulordnern (z. B. NumPy 2 für Computer Vision,
NumPy 1.26 für Timeseries). Diese in getrennten Umgebungen installieren,
nicht sämtliche Requirements in die Jupyter-Basisumgebung mischen.

## Eigene Seiten (Sub Pages)

Ein Thema kann zusätzlich eigene Seiten haben, z. B. `mathe-kompakt.html` (Spickzettel) und `mathe-ausfuehrlich.html` (alle Erklärungen und Diagramme). Eine Seite ist eine Kopie von `mathe-kompakt.html`: `core.js`, dann die Demo-Datei und ein Modul. Die Hauptseite verweist über ein kleines Teaser-Modul (`modules/mathe.js`) darauf. Eine Seite ohne eigenes Kapitel auf der Hauptseite (z. B. der Spickzettel `kompakt.html`) bekommt stattdessen nur einen Knopf in der Linkleiste oben in `index.html` (`<a class="linkbtn">`). Gemeinsame Demos liegen in `assets/demos-mathe.js` (`MatheDemos.deriv()`, `.stats()`, `.scaler()`), damit beide Seiten denselben Code nutzen.

## Mit Server (Eingaben dauerhaft speichern)

`python server.py` startet die App auf http://localhost:8765. Eingaben (Übungscode) werden zusätzlich in `data/state.json` gespeichert (nicht in git). Ohne Server speichert die App nur im Browser (localStorage).

Das Übungs-Notebook (`notebook.html`) braucht JupyterLab hinter `/jupyter/` auf Port 8899. Läuft es nicht, startet der Knopf «Jupyter starten» es über den Server (`POST /api/jupyter/start`, nur von 127.0.0.1). Der Server nimmt dafür das Python aus `.venv` im Lernapp-Ordner (sonst sein eigenes) und den Lernapp-Ordner als Startordner; das Log landet in `data/jupyter.log`. Jupyter läuft danach unabhängig weiter, auch wenn der Server neu startet. Beenden mit `jupyter server stop 8899`. Der Proxy weist Anfragen anderer Webseiten ab (403): Origin und Host müssen zusammenpassen, und bei Bindung an localhost muss der Host-Name `localhost`, `127.0.0.1` oder `::1` sein. Weitere Namen, etwa hinter einem Reverse-Proxy, trägt man mit `ALLOWED_HOSTS=name1,name2` ein. Mit `HOST=0.0.0.0` ist JupyterLab für jeden erreichbar, der den Port erreicht (fester Token); der Server warnt dann beim Start.

## Entwicklung und Prüfung

Einmal einrichten (Python 3.12): `py -3.12 -m venv .venv`, dann `.venv\Scripts\python -m pip install -r requirements-dev.txt` (Linux/macOS: `python3 -m venv .venv` und `.venv/bin/python -m pip install -r requirements-dev.txt`). Prüfen, alles über die `.venv`:

```
.venv\Scripts\ruff check .
.venv\Scripts\ruff format --check server.py tools tests
.venv\Scripts\pyright
.venv\Scripts\pytest              # etwa 15 s
.venv\Scripts\pytest -m slow      # führt alle Beispiel-Notebooks aus, etwa 2 Minuten
```

Die Tests decken `server.py` (Dateien, Zustandsspeicher, Jupyter-Start, Proxy), die Planung des Quiz (`LernApp.quizLogic` über Node), die Notebooks (gültig, ohne gespeicherte Ausgaben, Kernel `python3`, Colab-Link), die Links der Übersicht und die Syntax aller JavaScript-Module ab. Das Aussehen im Browser prüft keiner dieser Tests.

