/* Module: Grafiken: Matplotlib und Seaborn. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  LernApp.register({
    id: 'viz',
    order: 50,
    nav: 'Grafiken',
    title: `Grafiken: Matplotlib und Seaborn`,
    kicker: `Modul 1 · Samstag 17.10`,
    summary: `Welcher Chart für welche Frage`,
    html: `  <p>Gute Grafiken beginnen vor dem Code: Zuerst die Frage, dann der Charttyp.</p>

  <div class="demo" id="chartPick">
    <div class="tag">Demo</div><h4>Welcher Chart passt zu meiner Frage?</h4>
    <label for="qsel" class="hint" style="display:block">Meine Frage lautet:</label>
    <select id="qsel" style="max-width:100%">
      <option value="0">Welche Kategorie ist am grössten?</option>
      <option value="1">Wie verändert sich etwas über die Zeit?</option>
      <option value="2">Hängen zwei Zahlen zusammen?</option>
      <option value="3">Wie verteilen sich die Werte einer Variable?</option>
      <option value="4">Wie vergleiche ich Verteilungen mehrerer Gruppen?</option>
      <option value="5">Wie setzt sich ein Ganzes zusammen?</option>
    </select>
    <p id="qout" style="margin-top:12px"></p>
  </div>

  <h3>Matplotlib: Figure und Axes</h3>
  <p>Eine <b>Figure</b> ist die ganze Leinwand. Darauf liegen eine oder mehrere <b>Axes</b>, das sind die einzelnen Diagramme. Du zeichnest immer auf einer bestimmten Axes. Das ist der «objektorientierte Stil», den der Kurs nutzt.</p>
  <pre><code>import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 5))       # Leinwand + ein Diagramm
ax.plot(temps["month"], temps["Luzern"], label="Luzern", marker="o")
ax.set_title("Temperatur Luzern vs Lugano")   # Titel
ax.set_xlabel("Monat")
ax.set_ylabel("Temperatur (°C)")              # Einheit nicht vergessen
ax.legend()
ax.spines[["top", "right"]].set_visible(False)   # Rahmen aufräumen
fig.tight_layout()
fig.savefig("temp.png", dpi=150)
plt.show()</code></pre>
  <p>Mehrere Diagramme: <code>fig, axes = plt.subplots(2, 2)</code> gibt dir ein 2×2-Feld, du zeichnest mit <code>axes[0, 1].bar(...)</code> und so weiter.</p>

  <h3>Typische Befehle pro Charttyp</h3>
  <div class="tablewrap"><table>
    <tr><th>Chart</th><th>Matplotlib</th><th>Seaborn</th></tr>
    <tr><td>Linie</td><td><code>ax.plot(x, y)</code></td><td><code>sns.lineplot(data=df, x=, y=, hue=)</code></td></tr>
    <tr><td>Balken</td><td><code>ax.bar(x, h)</code> / <code>ax.barh</code></td><td><code>sns.barplot(...)</code></td></tr>
    <tr><td>Streuung</td><td><code>ax.scatter(x, y)</code></td><td><code>sns.scatterplot(...)</code></td></tr>
    <tr><td>Histogramm</td><td><code>ax.hist(werte, bins=10)</code></td><td><code>sns.histplot(x=werte, kde=True)</code></td></tr>
    <tr><td>Boxplot</td><td><code>ax.boxplot(...)</code></td><td><code>sns.boxplot(...)</code></td></tr>
    <tr><td>Kuchen</td><td><code>ax.pie(werte)</code></td><td>(absichtlich keiner)</td></tr>
  </table></div>

  <h3>Seaborn: weniger Code, DataFrame direkt</h3>
  <p>Seaborn baut auf Matplotlib auf. Du gibst den DataFrame und Spaltennamen an, <code>hue="stadt"</code> färbt nach Gruppe und erzeugt die Legende. Alles aus Matplotlib (<code>ax.set_title</code> usw.) funktioniert weiterhin.</p>
  <p>Seaborn mag <b>lange (tidy) Daten</b>: eine Zeile pro Beobachtung, eine Spalte pro Variable. Breite Tabellen wandelst du mit <code>melt</code> um:</p>
  <pre><code># breit: month | Luzern | Lugano
lang = temps.melt(id_vars="month", var_name="city", value_name="temperature")
# lang:  month | city | temperature      (24 Zeilen statt 12)
sns.lineplot(data=lang, x="month", y="temperature", hue="city")</code></pre>

  <h3>Wichtigste Gestaltungsregeln</h3>
  <ul>
    <li>Der Titel sagt, <b>was</b> man sieht (am besten die Aussage), die Achsen tragen <b>Einheiten</b>.</li>
    <li>Balken starten bei <b>Null</b>. Eine abgeschnittene Achse lässt 720 gegenüber 290 wie ein Vielfaches wirken.</li>
    <li>Weniger ist mehr: kein 3D, wenig Gitter, wenige Farben, jede mit einer Aufgabe.</li>
    <li>Kuchendiagramme nur bei wenigen Teilen. Zum Vergleichen sind <b>Balken</b> besser, weil wir Längen besser vergleichen als Winkel.</li>
    <li>Rot-Grün vermeiden und Bedeutung nie nur über Farbe zeigen (Linienstil, Marker, Beschriftung).</li>
    <li>Streudiagramm zeigt: Zusammenhang ist nicht Ursache (<i>Korrelation ≠ Kausalität</i>).</li>
    <li>Histogramm: die Zahl der <code>bins</code> verändert die Geschichte, probiere mehrere.</li>
  </ul>

  <div class="merk"><b>Merksatz</b><p>Erst Frage, dann Chart. Danach Titel, Achsen mit Einheit, Null-Basislinie, aufräumen.</p></div>`,
    quiz: [
      { q: `Wann ist ein Kuchendiagramm keine gute Wahl?`, a: `Bei vielen Teilen oder wenn man genau vergleichen oder ranken will. Längen (Balken) lesen wir besser als Winkel.` },
      { q: `Warum sollen Balken bei Null beginnen?`, a: `Eine abgeschnittene Achse übertreibt Unterschiede. Im Kursbeispiel wirkte 720 gegenüber 290 wie das Zwölffache statt wie das 2.5-Fache.` },
    ],
    init() {
      (function(){
        const out=[
          [LernApp.t('Balkendiagramm','bar chart'),LernApp.t('Sortiere die Balken und starte bei Null. Bei langen Beschriftungen waagrecht (barh).','Sort the bars and start at zero. With long labels, go horizontal (barh).')],
          [LernApp.t('Liniendiagramm','line chart'),LernApp.t('Die x-Achse hat eine natürliche Reihenfolge, meist Zeit. Höchstens 4 bis 5 Linien, mit eigenem Marker oder Linienstil.','The x-axis has a natural order, usually time. At most 4 to 5 lines, each with its own marker or line style.')],
          [LernApp.t('Streudiagramm (Scatter)','scatter plot'),LernApp.t('Ein Punkt pro Beobachtung. Achte auf Richtung, Stärke und Ausreisser. Dritte Variable über Farbe oder Grösse. Zusammenhang ist keine Ursache.','One point per observation. Look at direction, strength and outliers. A third variable via colour or size. Correlation is not causation.')],
          [LernApp.t('Histogramm','histogram'),LernApp.t('Zeigt, wie oft welcher Wertebereich vorkommt. Probiere verschiedene bins, sie verändern das Bild.','Shows how often each range of values occurs. Try different bins, they change the picture.')],
          [LernApp.t('Boxplot','boxplot'),LernApp.t('Linie = Median, Box = mittlere 50 Prozent, Striche = bis zum letzten Wert innerhalb von 1,5 × Boxhöhe (IQR), Punkte = Ausreisser jenseits davon. Ideal zum Vergleichen von Gruppen.','Line = median, box = middle 50 percent, whiskers = up to the last value within 1.5 × box height (IQR), points = outliers beyond that. Ideal for comparing groups.')],
          [LernApp.t('Gestapelter Balken oder Kuchen','stacked bar or pie chart'),LernApp.t('Nur wenn die Teile wirklich ein Ganzes ergeben und es wenige sind (höchstens 5 Kuchenstücke). Zum genauen Vergleichen lieber Balken.','Only if the parts really make up a whole and there are few of them (at most 5 pie slices). For precise comparison, bars are better.')]];
        function upd(){const o=out[+$('qsel').value];$('qout').innerHTML=LernApp.t('Nimm ein <b>','Use a <b>')+o[0]+'</b>. '+o[1]}
        $('qsel').addEventListener('change',upd);upd()})();
    },
  });
})();
