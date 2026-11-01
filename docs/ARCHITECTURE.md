# Architektur der Lernapp CAS ML

Stand: 2026-11-01. Diagramme liegen daneben als PlantUML-Quellen (`*.puml`); Vorschau mit der VS-Code-Erweiterung `jebbs.plantuml` oder mit `plantuml.jar`.

| Diagramm | Datei | Zeigt |
|---|---|---|
| Komponenten | [architecture-components.puml](architecture-components.puml) | Seiten, Kern, Kapitel, Server, Werkzeuge, externe Dienste |
| Ablauf beim Laden | [page-load-sequence.puml](page-load-sequence.puml) | Von `<head>` bis `init()`; Sprache, Theme, Speicher |
| Datenobjektmodell | [data-object-model.puml](data-object-model.puml) | Modul, Übersetzung, gespeicherter Zustand |

Entscheidungen und Begründungen: [DESIGN.md](DESIGN.md).

## Grundidee

Eine statische Website ohne Build-Schritt. Jede HTML-Seite lädt `assets/core.js` (den Kern) und danach ein oder mehrere Kapitel aus `modules/`. Ein Kapitel ist eine JavaScript-Datei, die sich mit `LernApp.register({...})` anmeldet und ihren Inhalt als HTML-Text mitbringt. Der Kern baut daraus Navigation, Übersicht, Kapitel und Selbsttest. Ein kleiner Python-Server ist optional: Er liefert die Dateien aus, speichert Einstellungen in `data/state.json` und tunnelt JupyterLab.

## Ordnerstruktur

```
lernapp-cas-ml/
  index.html                 Hauptseite: Kopf, Überblick, alle Kapitel, Spielwiese
  titanic.html               Unterseite: Titanic-Beispiel ausführlich
  mathe-kompakt.html         Unterseite: Mathe-Spickzettel
  mathe-ausfuehrlich.html    Unterseite: Mathe ausführlich
  notebook.html              JupyterLab im iframe (nur mit Server)
  assets/
    core.js                  Kern: LernApp-API, Sprache, Theme, Speicher, Rendern, Spielwiese
    style.css                Design-Tokens hell/dunkel und alle Komponenten
    demos-mathe.js           MatheDemos: Demos, die beide Mathe-Seiten teilen
    demos-kmeans.js          KMeansDemo: k-Means-Demo
    img/                     Grafiken, aus echten Läufen erzeugt (Titanic)
    notebook-data.js         generiert aus den Notebooks (zurzeit von keiner Seite geladen)
  modules/
    <id>.js                  ein Kapitel pro Datei (deutsch)
    en/<id>.js               englische Texte desselben Kapitels
    _vorlage.js              Vorlage für ein neues Kapitel
  notebooks/                 Jupyter-Notebooks (Übungen, Lernhilfe)
  tools/                     build_notebook_exercises.py: Notebooks → notebook-data.js
  scripts/                   build_notebook.js, build_lernhilfe_notebook.js: Module → Notebooks
  server.py                  statischer Server, /api/state, Proxy /jupyter/*
  data/state.json            Kopie des Browser-Speichers (nicht in git)
  docs/                      diese Dokumentation
```

## Bausteine

### Seiten

- **index.html** ist die Hauptseite. Sie enthält den Kopf, den Abschnitt «Überblick» mit Übersichtskarten (`#toc`), den leeren Container `#modules`, den die Kapitel füllen, und die Spielwiese. Unten lädt sie alle Kapitel und danach alle englischen Dateien.
- **Unterseiten** (`titanic.html`, `mathe-*.html`) sind Kopien desselben Gerüsts mit genau einem Kapitel. Sie haben keinen Überblick und keine Spielwiese; der Kern erkennt das an den fehlenden Elementen `#ueberblick` und `#spielwiese`.
- **notebook.html** lädt den Kern nicht. Sie zeigt JupyterLab über den Proxy des Servers in einem iframe und hat ein eigenes kleines Skript für Sprache und Theme.

Jede Seite setzt im `<head>` mit einem Inline-Skript das Theme, bevor der Browser zeichnet, damit beim Laden nichts hell aufblitzt.

### Kern (`assets/core.js`)

Der Kern stellt das globale Objekt `LernApp` bereit:

| Member | Zweck |
|---|---|
| `register(modul)` | Kapitel anmelden; `id` und `title` sind Pflicht, doppelte `id` werden abgewiesen |
| `translate(id, felder)` | englische Felder für ein Kapitel hinterlegen |
| `t(de, en)` | Text je nach Sprache wählen, für Demo-Code und Beschriftungen |
| `$(id)`, `fmt(v, d)` | Helfer für Demos |
| `modules`, `lang` | angemeldete Kapitel, aktuelle Sprache |

Beim Start läuft `start()`: Schalter einfügen, bei EN die Übersetzungen überlagern, Kapitel nach `order` sortieren, Leiste und Übersicht füllen, pro Kapitel den Abschnitt bauen (`buildSection`), dann pro Kapitel `init()` aufrufen. Ein Fehler in einem `init()` wird abgefangen und als Hinweis im Kapitel angezeigt; die anderen Kapitel laufen weiter.

Der Kern enthält ausserdem den Python-Runner der Spielwiese. Skulpt wird erst beim ersten Klick auf «Ausführen» von jsDelivr geladen; Fehlermeldungen werden in verständliche Hinweise übersetzt.

### Kapitel (`modules/`)

Ein Kapitel ist eine sofort ausgeführte Funktion, die `LernApp.register` mit einem Objekt aufruft (Felder: siehe [Datenobjektmodell](data-object-model.puml) und [DESIGN.md](DESIGN.md)). Der Inhalt steht als Template-String in `html`. Demos stehen in `init()` und greifen über `LernApp.$` auf ihre Elemente zu. Geteilte Demos liegen in `assets/demos-*.js` und werden aus `html` mit `${KMeansDemo.html('km')}` eingebettet und in `init()` mit `KMeansDemo.init('km')` verdrahtet.

Die englische Fassung eines Kapitels liegt in `modules/en/<id>.js` und ruft `LernApp.translate(id, {...})` auf. Jedes angegebene Feld ersetzt das deutsche; das ganze `html` wird ausgetauscht. Kapitel, deren Text schon im Code mit `LernApp.t('de', 'en')` zweisprachig ist, hinterlegen ein leeres Objekt.

### Design (`assets/style.css`)

Alle Farben sind Tokens auf `:root` (`--bg`, `--fg`, `--accent`, ...). Der dunkle Satz gilt bei `prefers-color-scheme: dark`, solange `<html>` kein `data-theme="light"` trägt, und immer bei `data-theme="dark"`. Demos und SVG-Grafiken benutzen dieselben Tokens, darum passen sie sich automatisch an.

### Server (`server.py`)

Nur Standardbibliothek. Drei Aufgaben:

1. Statische Dateien aus dem Projektordner ausliefern (`http://127.0.0.1:8765`).
2. `GET /api/state` liefert `data/state.json`, `PUT /api/state` ersetzt sie atomar (Schreiben in `.tmp`, dann umbenennen). Der Kern lädt den Zustand beim Start synchron in den `localStorage` und schickt nach jeder Änderung eine Kopie aller Schlüssel zurück.
3. `/jupyter/*` wird als Tunnel (HTTP und WebSocket) an JupyterLab auf Port 8899 weitergereicht, damit nur ein Port offen sein muss.

Konfiguration über Umgebungsvariablen: `HOST`, `PORT`, `STATE_FILE`, `JUPYTER_HOST`, `JUPYTER_PORT`.

### Werkzeuge

- `tools/build_notebook_exercises.py` erzeugt `assets/notebook-data.js` aus den Übungs-Notebooks (`--check` prüft, `--verify` lässt alle Lösungen gegen ihre Prüfung laufen). Seit die Code-Übungen aus der App entfernt sind, lädt keine Seite diese Datei mehr; das Werkzeug bleibt für die Notebooks.
- `scripts/build_notebook.js` und `scripts/build_lernhilfe_notebook.js` laufen mit Node und erzeugen aus den Modulen die Notebooks `Lernapp_Uebungen.ipynb` und `Lernapp_Lernhilfe.ipynb`.

## Zustand und Persistenz

| Was | Wo | Schlüssel |
|---|---|---|
| Sprache | `localStorage` | `cas-ml-lang` = `de` oder `en` |
| Farbschema | `localStorage` | `cas-ml-theme` = `light`, `dark` oder `auto` |
| Kopie aller Schlüssel | `data/state.json` (nur mit Server) | flaches Objekt Schlüssel → Text |

In der Adresse gewinnen `?lang=en` und `?theme=dark` über den gespeicherten Wert, ohne ihn zu ändern; das dient Links und Tests. Die Sprache wird mit `location.reload()` umgeschaltet, weil sie die Kapitel neu aufbaut. Das Theme wechselt sofort über das Attribut `data-theme`.

## Externe Abhängigkeiten

- Google Fonts (Schriften), zur Laufzeit.
- Skulpt über jsDelivr (Python in der Spielwiese), erst beim ersten Ausführen.
- JupyterLab lokal, nur für `notebook.html`.
- Zum Erzeugen der Grafiken und Ausgaben: Python mit pandas, scikit-learn, matplotlib, seaborn (siehe `requirements.txt`). Zur Laufzeit der Seite ist kein Python nötig.

## Ein Kapitel hinzufügen

1. `modules/_vorlage.js` nach `modules/<id>.js` kopieren und ausfüllen.
2. Optional `modules/en/<id>.js` mit `LernApp.translate('<id>', {...})` anlegen.
3. In `index.html` beide Dateien per `<script>` einbinden, das deutsche Kapitel vor den englischen Dateien.
4. Seite laden: Kapitel erscheint in Leiste und Übersicht, die Konsole bleibt leer.
