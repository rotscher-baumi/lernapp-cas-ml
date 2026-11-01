# Design-Dokument Lernapp CAS ML

Stand: 2026-11-01. Ergänzt [ARCHITECTURE.md](ARCHITECTURE.md) um Ziele, Entscheidungen und das Datenobjektmodell.

## 1. Ziele

- Den Kursstoff des CAS Machine Learning (HSLU) in einfachen Worten erklären, mit interaktiven Demos, Grafiken und Selbsttest.
- Überall laufen: Doppelklick auf `index.html` reicht, auch ohne Server und ohne Installation.
- Zweisprachig (Deutsch als Quelle, Englisch als Überlagerung), hell und dunkel.
- Alle Zahlen, Ausgaben und Grafiken stammen aus echten Läufen mit den Kursdaten und sind nachrechenbar.

## 2. Nicht-Ziele

- Kein Ersatz für die Kursunterlagen; Folien und Dozenten-Notebooks werden nicht kopiert (Repository bleibt privat).
- Kein Nutzerkonto, keine Mehrbenutzer-Synchronisation, kein Deployment im Internet.
- Keine Code-Übungen mehr in der Seite (entfernt am 2026-11-01); Übungen laufen in den Jupyter-Notebooks.

## 3. Architekturentscheidungen

| Nr. | Entscheidung | Begründung | Folge |
|---|---|---|---|
| D1 | Kein Build-Schritt, reines HTML/CSS/JS | Doppelklick muss reichen; keine Toolchain für ein Lernprojekt | Keine Module (ESM), keine Abhängigkeiten; Kapitel registrieren sich über ein globales Objekt |
| D2 | Kapitel als JavaScript-Dateien mit HTML als Text | Per `file://` darf eine Seite keine weiteren HTML-Dateien nachladen; `<script src>` geht | Inhalt steht in Template-Strings; Backticks und `${` im Inhalt müssen maskiert werden |
| D3 | Ein Kern (`core.js`), der alles aus den Modul-Objekten baut | Navigation, Übersicht, Selbsttest sollen in jedem Kapitel gleich aussehen, ohne Wiederholung | Neue Kapitel brauchen nur Daten, keinen Rendering-Code |
| D4 | Englisch als Überlagerung (`translate`) statt zweiter Seiten | Eine Struktur, eine Navigation, ein Satz IDs; Demos bleiben gemeinsam | Englische Datei muss dieselben Element-IDs enthalten, sonst findet `init()` seine Elemente nicht; Prüfung per Skript |
| D5 | Demo-Texte im Code mit `LernApp.t('de', 'en')` | Demo-Code soll nicht doppelt existieren | Kapitel, die nur so übersetzt sind, hinterlegen ein leeres `translate`-Objekt |
| D6 | Theming über CSS-Tokens und `data-theme` auf `<html>` | Demos und SVG benutzen dieselben Farben; Systemeinstellung soll ohne Wahl funktionieren | Drei Stellungen Hell/Dunkel/Auto; Inline-Skript im `<head>` gegen Aufblitzen |
| D7 | Persistenz-Kaskade: `localStorage` zuerst, Server-Kopie optional | Ohne Server soll alles funktionieren; mit Server sollen Einstellungen Browser-übergreifend bleiben | `state.json` ist eine flache Kopie aller Schlüssel; der Server kennt keine Struktur |
| D8 | Server nur mit Standardbibliothek | Keine Installation ausser Python | Proxy und JSON-Endpunkt sind von Hand geschrieben, kein Framework |
| D9 | Unterseiten für lange Beispiele (Titanic, Mathe) | Hauptseite bleibt lesbar; Beispiel darf wirklich ausführlich sein | Hauptseite verlinkt mit Kurzversion oder Teaser-Modul |
| D10 | Grafiken als PNG aus echten Läufen, Code und Ausgabe daneben | Lernende sollen den Code nachspielen und dasselbe sehen | Code im Kapitel darf nicht ohne neuen Lauf geändert werden; Ausgaben sind byte-identisch zu halten |
| D11 | Workflow-Übersicht am Kapitelanfang | Erst der Ablauf, dann die Teile (Projektregel) | Klickbare SVG-Grafik mit Erklärungen pro Schritt |

## 4. Theming

- Tokens in `:root` (hell). Dunkler Satz gilt bei `prefers-color-scheme: dark`, ausser `<html data-theme="light">`, und immer bei `<html data-theme="dark">`.
- Schalter im Kopf: Hell · Dunkel · Auto. Auto entfernt das Attribut und folgt dem System.
- Gespeichert unter `cas-ml-theme`. `?theme=dark|light|auto` in der Adresse gewinnt, ohne zu speichern.
- Das Inline-Skript im `<head>` liest Adresse und `localStorage` und setzt das Attribut vor dem ersten Zeichnen. Mit Server kann der `localStorage` beim allerersten Besuch noch leer sein; dann setzt der Kern das Theme kurz danach.
- Das Jupyter-iframe hat sein eigenes Theme und wird nicht umgeschaltet.

## 5. Sprache

- Quelle ist Deutsch. Englisch ersetzt Felder pro Kapitel; statischer Seitentext trägt `data-en`.
- Umschalten lädt die Seite neu, weil die Kapitel neu aufgebaut werden.
- Code, Variablennamen und Ausgaben bleiben in beiden Sprachen gleich; nur Kommentare werden übersetzt. Deutsche Spaltennamen in Ausgaben (z. B. `Frau`) bleiben darum auch auf Englisch stehen.

## 6. Datenobjektmodell

Diagramm: [data-object-model.puml](data-object-model.puml).

### 6.1 Module (Kapitel)

Objekt, das `LernApp.register` übergeben wird.

| Feld | Typ | Pflicht | Bedeutung |
|---|---|---|---|
| `id` | string | ja | eindeutig; Anker `#id`, Schlüssel für `translate` |
| `title` | string (HTML) | ja | Kapitelüberschrift |
| `order` | number | nein (100) | Sortierung in Leiste und Seite, klein = früh |
| `nav` | string | nein (= title) | Kurzname in der Kapitel-Leiste |
| `kicker` | string | nein | kleine Zeile über dem Titel, z. B. Modul und Datum |
| `summary` | string | nein | ein Satz für die Übersichtskarte |
| `html` | string (HTML) | nein | Inhalt; CSS-Klassen `.merk`, `.falle`, `.demo`, `.fig`, `.box`, `.tablewrap`, `.steps`, `.grid2`, `.toc` |
| `quiz` | QuizItem[] | nein | Selbsttest am Kapitelende |
| `notebooks` | NotebookRef[] | nein | Hinweiskasten auf Übungs-Notebooks |
| `init` | function | nein | wird einmal nach dem Einfügen aufgerufen; Demos verdrahten |
| `exercises` | Exercise[] | veraltet | wird nicht mehr gerendert; noch von `scripts/build_notebook.js` gelesen |
| `nbExercises` | string | veraltet | Notebook-Dateiname; wird nicht mehr gerendert |

Invarianten: `id` ist über alle geladenen Kapitel eindeutig (der Kern weist Doppelte ab). Element-IDs in `html` sind seitenweit eindeutig; Demos mit mehreren Instanzen bekommen ein Präfix (`KMeansDemo.html('km')`).

### 6.2 QuizItem

| Feld | Typ | Bedeutung |
|---|---|---|
| `q` | string (HTML) | Frage, als `<summary>` |
| `a` | string (HTML) | Antwort, aufklappbar |

### 6.3 NotebookRef

| Feld | Typ | Bedeutung |
|---|---|---|
| `file` | string | Dateiname in `notebooks/` |
| `desc` | string | Beschreibung im Hinweiskasten |

### 6.4 Exercise (veraltet)

Format der früheren Browser-Übungen; identisch in `exercises` und in `notebook-data.js`.

| Feld | Typ | Bedeutung |
|---|---|---|
| `t` | string | Titel |
| `task` | string (HTML) | Aufgabe |
| `start` | string | Startcode |
| `check` | string | `assert`-Zeilen zur Prüfung |
| `sol` | string | Lösung |

### 6.5 Translation

Objekt, das `LernApp.translate(id, …)` übergeben wird. Erlaubt sind die Felder `nav`, `title`, `kicker`, `summary`, `html`, `quiz`, `notebooks`; jedes angegebene ersetzt das deutsche vollständig. Ein leeres Objekt markiert ein Kapitel, das im Code selbst zweisprachig ist.

Invariante: Die Menge der `id="…"` in `html` ist in Deutsch und Englisch gleich, `quiz` hat gleich viele Einträge, `<pre class="out">`-Blöcke sind byte-identisch, Code-Blöcke unterscheiden sich nur in Kommentaren.

### 6.6 BrowserState (`localStorage`)

| Schlüssel | Werte | Vorgabe |
|---|---|---|
| `cas-ml-lang` | `de`, `en` | `de` |
| `cas-ml-theme` | `light`, `dark`, `auto` | `auto` |

Ältere Schlüssel aus den entfernten Übungen können in bestehenden Browsern noch liegen; der Kern liest sie nicht mehr.

### 6.7 ServerState (`data/state.json`)

Flaches JSON-Objekt: jeder `localStorage`-Schlüssel als Text. Der Server prüft nur, dass es ein Objekt ist. Beim Laden werden alle Schlüssel in den `localStorage` übernommen, nach jeder Änderung wird die komplette Kopie zurückgeschrieben (500 ms gebündelt). Die Datei ist nicht in git.

### 6.8 NbData (`assets/notebook-data.js`, veraltet)

`window.NbData[dateiname] = { setup, exercises }` mit `setup` als Python-Vorspann (Imports, Daten, Hilfsfunktion `ok()`) und `exercises` als Liste von Exercise. Generiert, nicht von Hand ändern.

## 7. Qualitätssicherung

Es gibt keine automatischen Tests. Geprüft wird so:

- `node --check` für jede JS-Datei.
- Jede Seite auf Deutsch und Englisch in Chrome headless laden: keine Konsolenfehler, kein Kapitel mit Fehlerhinweis.
- Skript-Vergleich Deutsch/Englisch: gleiche Element-IDs, gleiche Quiz-Anzahl, identische Ausgabeblöcke.
- Zahlen in Beispielen werden mit den echten Daten nachgerechnet (`requirements.txt`, Titanic-Daten ausserhalb des Repos).
- Mobile: Layout von 320 px bis 1440 px ohne horizontales Scrollen; die Kopf-Schalter rutschen unter 700 px über den Titel.

## 8. Offene Punkte

- `assets/notebook-data.js` und das Feld `exercises` sind Altlasten der entfernten Browser-Übungen. Entfernen, sobald `scripts/build_notebook.js` nicht mehr gebraucht wird.
- Die Kurstermine im Überblick sind von Hand gepflegt (Stand Juni 2026) und müssen gegen den Stundenplan geprüft werden.
