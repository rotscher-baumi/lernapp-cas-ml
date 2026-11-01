/* Module: Git: Versionen deiner Arbeit. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  LernApp.register({
    id: 'git',
    order: 20,
    nav: 'Git',
    title: `Git: Versionen deiner Arbeit`,
    kicker: `Modul 1 · Freitag 16.10`,
    summary: `3 Zustände, 5 Befehle`,
    html: `  <p>Git speichert bei jedem Commit einen <b>Schnappschuss</b> deiner Dateien. Du kannst zu einer älteren Version zurück, mit mehreren Leuten parallel arbeiten und siehst, wer wann was warum geändert hat. GitHub und GitLab sind nur Webseiten, die Git-Repositories hosten (HSLU nutzt GitLab, dein Studium-Repo liegt auf GitHub).</p>

  <h3>Die drei Zustände</h3>
  <div class="steps">
    <div class="st"><b>Arbeitsordner</b><span>Hier bearbeitest du Dateien.</span></div><div class="ar">git add →</div>
    <div class="st"><b>Staging</b><span>Änderungen, die in den nächsten Schnappschuss sollen.</span></div><div class="ar">git commit →</div>
    <div class="st"><b>Repository</b><span>Der .git-Ordner mit der gesamten Historie.</span></div>
  </div>
  <p>Stell dir ein Foto-Shooting vor: Du stellst Dinge auf (Arbeitsordner), wählst, wer aufs Bild soll (Staging) und drückst dann den Auslöser (Commit).</p>
  <pre><code>git clone URL          # Kopie eines Repos holen
git status             # Was hat sich geändert?
git add datei.py       # Eine Datei fürs Staging vormerken
git add .              # Alles vormerken
git commit -m "Text"   # Schnappschuss speichern</code></pre>
  <div class="falle"><b>Falle</b><p>Ein Commit speichert nur, was im Staging liegt. Wenn du <code>git add</code> vergessen hast, fehlt die Datei im Schnappschuss. Mit <code>git status</code> siehst du das sofort.</p></div>`,
    quiz: [
      { q: `Was ist der Unterschied zwischen <code>git add</code> und <code>git commit</code>?`, a: `<code>git add</code> legt Änderungen ins Staging (vormerken). <code>git commit</code> speichert alles im Staging als Schnappschuss in der Historie.` },
    ],
  });
})();
