# Lernapp CAS ML

Lernseite zum Kursstoff: Erklärungen, Diagramme, Demos, Python-Übungen im Browser und Selbsttest. Alles Selbsterstellte liegt in diesem Ordner, getrennt von den Kursunterlagen.

Öffnen: `index.html` per Doppelklick im Browser. Es braucht Internet für die Schrift (Google Fonts) und für den Python-Interpreter der Übungen (Skulpt über jsDelivr).

## Aufbau

```
lernapp/
  index.html        Kern: Kopf, Überblick, Spielwiese, Liste der Module
  assets/
    style.css       Design (hell und dunkel)
    core.js         Navigation, Übungen, Selbsttest, Python-Ausführung
  modules/          ein Kapitel pro Datei
    ds.js git.js python.js pandas.js viz.js hood.js ml.js
    _vorlage.js     Vorlage für ein neues Kapitel
  notebooks/        Übungs-Notebooks (Jupyter / VS Code)
```

## Neues Kapitel hinzufügen

1. `modules/_vorlage.js` nach `modules/<name>.js` kopieren.
2. `id`, `order`, `nav`, `title`, `kicker`, `summary` und `html` ausfüllen. Optional `exercises` (Python-Aufgaben), `quiz` (Selbsttest), `notebooks` und `init()` für Demos.
3. In `index.html` unten eine Zeile ergänzen: `<script src="modules/<name>.js"></script>`.

Navigation, Übersichtskarte, Übungen, Fortschrittsanzeige und Selbsttest erscheinen automatisch. Die Reihenfolge bestimmt `order`.

Die Kapitel sind JavaScript-Dateien (mit dem HTML als Text), weil Browser beim Öffnen per Doppelklick keine zusätzlichen HTML-Dateien nachladen dürfen. Es gibt keinen Build-Schritt.

## Notebooks

Die Übungs-Notebooks liegen in `notebooks/`. Sie brauchen `pandas`, `numpy`, `matplotlib` und `scikit-learn`. Die Kursunterlagen in den Modulordnern werden nicht verändert.

## Eigene Seiten (Sub Pages)

Ein Thema kann zusätzlich eigene Seiten haben, z. B. `mathe-kompakt.html` (Spickzettel) und `mathe-ausfuehrlich.html` (alle Erklärungen und Diagramme). Eine Seite ist eine Kopie von `mathe-kompakt.html`: `core.js`, dann die Demo-Datei und ein Modul. Die Hauptseite verweist über ein kleines Teaser-Modul (`modules/mathe.js`) darauf. Gemeinsame Demos liegen in `assets/demos-mathe.js` (`MatheDemos.deriv()`, `.stats()`, `.scaler()`), damit beide Seiten denselben Code nutzen.

## Mit Server (Eingaben dauerhaft speichern)

`python server.py` startet die App auf http://localhost:8765. Eingaben (Übungscode) werden zusätzlich in `data/state.json` gespeichert (nicht in git). Ohne Server speichert die App nur im Browser (localStorage).
