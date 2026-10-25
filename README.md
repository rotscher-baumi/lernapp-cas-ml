# Lernapp CAS ML

Einzelne HTML-Datei mit dem Kursstoff (Python, Pandas, Grafiken, Supervised Learning Tag 1), Demos, Python-Übungen und Selbsttest.

Öffnen: `index.html` per Doppelklick im Browser. Es braucht Internet für die Schrift (Google Fonts) und den Python-Interpreter der Übungen (Skulpt über jsDelivr).

Die Übungs-Notebooks liegen in `notebooks/`.

## Bezug zum Schulstoff

Inhalt basiert auf dem CAS Machine Learning @ HSLU (HS26), Modul 01 (Python/Pandas) und Modul 02 (Supervised Learning). Die Kursunterlagen selbst sind nicht Teil dieses Repos; sie liegen im privaten Kursrepo `cas-ml-hs26` und sind nicht frei verteilbar. Darum dieses Repo privat halten, solange die App Kursinhalte zusammenfasst.

## Mit Server (Eingaben dauerhaft speichern)

`python server.py` startet die App auf http://localhost:8765. Eingaben (Übungscode) werden zusätzlich in `data/state.json` gespeichert (nicht in git; Pfad per `STATE_FILE`). Ohne Server speichert die App nur im Browser (localStorage).


## Deployment

Nur Python-Standardbibliothek, keine Abhängigkeiten. Konfiguration über Umgebungsvariablen:

```
HOST=0.0.0.0 PORT=8080 STATE_FILE=/data/state.json python server.py
```

Für persistente Eingaben `STATE_FILE` auf ein gemountetes Volume legen. Der Endpunkt `/api/state` hat keine Authentifizierung: nur hinter einem Login/Reverse-Proxy öffentlich betreiben.
