# Lernapp CAS ML

Lernseite zum Kursstoff: Erklärungen, Diagramme, Demos und Selbsttest, auf Deutsch und Englisch, hell und dunkel. Alles Selbsterstellte liegt in diesem Ordner, getrennt von den Kursunterlagen.

Öffnen: `index.html` per Doppelklick im Browser. Es braucht Internet für die Schrift (Google Fonts) und für den Python-Interpreter der Spielwiese (Skulpt über jsDelivr).

Oben rechts: **DE / EN** schaltet die Sprache um, **Hell / Dunkel / Auto** das Farbschema (Auto folgt dem System). Beides merkt sich der Browser; mit Server auch über Browser hinweg. Für Links und Tests: `?lang=en`, `?theme=dark`.

Architektur, Diagramme (PlantUML) und Datenobjektmodell: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) und [docs/DESIGN.md](docs/DESIGN.md).

## Aufbau

```
lernapp/
  index.html        Kern: Kopf, Überblick, Spielwiese, Liste der Module
  assets/
    style.css       Design (hell und dunkel)
    core.js         Navigation, Sprache, Theme, Selbsttest, Spielwiese
    demos-*.js      geteilte Demos (Mathe, k-Means)
  modules/          ein Kapitel pro Datei
    ds.js git.js python.js pandas.js viz.js hood.js mathe*.js ml.js klass.js unsup.js uebersicht.js titanic.js
    en/             englische Texte je Kapitel
    _vorlage.js     Vorlage für ein neues Kapitel
  notebooks/        Übungs-Notebooks (Jupyter / VS Code)
    beispiele/      Beispiel-Notebooks zu allen Modellen und Strategien (01 bis 07)
  docs/             Architektur, PlantUML-Diagramme, Design-Dokument
```

## Neues Kapitel hinzufügen

1. `modules/_vorlage.js` nach `modules/<name>.js` kopieren.
2. `id`, `order`, `nav`, `title`, `kicker`, `summary` und `html` ausfüllen. Optional `quiz` (Selbsttest), `notebooks` und `init()` für Demos.
3. In `index.html` unten eine Zeile ergänzen: `<script src="modules/<name>.js"></script>`. Für Englisch `modules/en/<name>.js` mit `LernApp.translate('<name>', {...})` anlegen und nach den Kapiteln einbinden.

Navigation, Übersichtskarte und Selbsttest erscheinen automatisch. Die Reihenfolge bestimmt `order`.

Die Kapitel sind JavaScript-Dateien (mit dem HTML als Text), weil Browser beim Öffnen per Doppelklick keine zusätzlichen HTML-Dateien nachladen dürfen. Es gibt keinen Build-Schritt.

## Notebooks

Die Übungs-Notebooks liegen in `notebooks/`. Sie brauchen `pandas`, `numpy`, `matplotlib` und `scikit-learn`. Das Notebook `Fehlende_Werte_Imputation.ipynb` zeigt separat, wie fehlende Werte ohne Data Leakage anhand der Trainingsmediane ergänzt werden. Die Kursunterlagen in den Modulordnern werden nicht verändert.

### Beispiel-Notebooks

`notebooks/beispiele/` hat ein eigenständiges Notebook pro Thema der Übersicht: `01_Regression`, `02_Klassifikation`, `03_Ensembles`, `04_Clustering_Anomalien`, `05_Dimensionsreduktion`, `06_Strategien` und `07_Titanic` (der ganze Ablauf an einem echten Datensatz, derselbe Code wie auf `titanic.html`). Jedes lädt seine Daten selbst (scikit-learn-Datensätze oder erzeugte Daten, nur Titanic nimmt `../../../titanic/data.csv`, falls vorhanden, sonst die öffentliche Kaggle-Kopie aus dem Netz) und hängt von keinem anderen ab. Die Steckbriefe der Übersicht verlinken mit «Beispiele →» darauf, `notebook.html?nb=beispiele/01_Regression.ipynb` öffnet ein Notebook direkt.

**Auf einem anderen PC:** Repo klonen, dann im Lernapp-Ordner `python -m venv .venv`, `.venv\Scripts\pip install -r requirements.txt`, `python server.py`. Der Knopf «Jupyter starten» nimmt automatisch das Python aus `.venv`. Ohne Installation geht es im Browser mit Google Colab: Jedes Beispiel-Notebook hat oben den Link «In Colab öffnen»; ein Google-Konto genügt, solange das Repo öffentlich ist (ist es privat, in Colab mit GitHub anmelden und «Include private repos» anhaken). Die Setup-Zelle installiert dort `umap-learn` und `imbalanced-learn` bei Bedarf selbst.

### Übungen in der App und im Notebook

Die Übungen gibt es zweimal, bewusst identisch: im Notebook und am Ende des Kapitels in der Webseite. Die Notebooks sind die Quelle. `assets/notebook-data.js` wird daraus erzeugt (nicht von Hand ändern):

```
python tools/build_notebook_exercises.py            # neu erzeugen
python tools/build_notebook_exercises.py --check    # prüft, ob die Datei aktuell ist
python tools/build_notebook_exercises.py --verify   # alle Lösungen gegen ihre Prüfung laufen lassen
```

Ein Kapitel zeigt die Übungen mit `nbExercises: '<datei>.ipynb'` im Modul. Die Webseite führt den Code mit Pyodide aus (echtes pandas und scikit-learn im Browser, der erste Start lädt einige zehn MB).

### Lokale Jupyter-Umgebung unter Windows

Im gemeinsamen HSLU-Ordner liegt eine isolierte Python-3.11-Umgebung
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
In Jupyter den Kernel **HSLU CAS ML (Python 3.11)** auswählen; in VS Code
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

Ein Thema kann zusätzlich eigene Seiten haben, z. B. `mathe-kompakt.html` (Spickzettel) und `mathe-ausfuehrlich.html` (alle Erklärungen und Diagramme). Eine Seite ist eine Kopie von `mathe-kompakt.html`: `core.js`, dann die Demo-Datei und ein Modul. Die Hauptseite verweist über ein kleines Teaser-Modul (`modules/mathe.js`) darauf. Gemeinsame Demos liegen in `assets/demos-mathe.js` (`MatheDemos.deriv()`, `.stats()`, `.scaler()`), damit beide Seiten denselben Code nutzen.

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

Die Tests decken `server.py` (Dateien, Zustandsspeicher, Jupyter-Start, Proxy), die Notebooks (gültig, ohne gespeicherte Ausgaben, Kernel `python3`, Colab-Link), die Links der Übersicht und die Syntax aller JavaScript-Module ab. Das Aussehen im Browser prüft keiner dieser Tests.

