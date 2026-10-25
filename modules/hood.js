/* Module: Pandas unter der Haube. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  LernApp.register({
    id: 'hood',
    order: 60,
    nav: 'Unter der Haube',
    title: `Pandas unter der Haube`,
    kicker: `Modul 1 · Vertiefung`,
    summary: `NumPy, View und Copy, Arrow`,
    html: `  <p>Dieses Kapitel erklärt, <i>warum</i> Pandas schnell ist und warum manche Fehlermeldungen auftauchen. Es ist Vertiefung: Wenn du sonst genug zu tun hast, überspringe es zuerst.</p>

  <h3>Eine Spalte ist ein Array im Speicher</h3>
  <p>Eine numerische Spalte ist ein <b>NumPy-Array</b>: viele Zahlen vom gleichen Typ, direkt hintereinander im Speicher. Eine Python-Liste dagegen enthält nur Verweise (Pointer) auf einzelne Objekte, die irgendwo verstreut liegen.</p>
  <div class="grid2">
    <div><h4>Python-Liste</h4><p>Jedes Element ist ein eigenes Objekt (rund 28 Byte pro Zahl). Flexibel, aber langsam und schwer.</p></div>
    <div><h4>NumPy-Array</h4><p>Rohe Zahlen, ein Typ, lückenlos gepackt (z. B. 8 Byte pro <code>int64</code>). Schnell und kompakt.</p></div>
  </div>
  <p>Schnell ist NumPy aus drei Gründen: eine kompilierte C-Schleife statt Python-Schleife, zusammenhängender Speicher mit festem Typ und SIMD (die CPU rechnet mit einem Befehl mehrere Zahlen gleichzeitig). Im Kursbeispiel war <code>x * 2</code> rund 70-mal schneller als die Listen-Schleife (Messung auf einem Rechner, deiner liefert andere Zahlen).</p>
  <div class="merk"><b>Merksatz</b><p>«Vektorisiert» (<code>x * 2</code>) ist schnell, <code>.apply()</code> und Python-Schleifen sind langsam.</p></div>

  <h3>dtype: der Typ bestimmt die Grösse</h3>
  <pre><code>a = np.array([1, 2, 3, 4, 5])   # int64: 8 Byte pro Wert = 40 Byte
a.astype(np.int8)               # 1 Byte pro Wert = 5 Byte, aber nur -128 bis 127!</code></pre>

  <h3>Broadcasting</h3>
  <p>Arrays mit verschiedener Form werden passend «gestreckt», ohne zu kopieren. Regel: Formen von rechts anlegen, jede Dimension muss gleich oder 1 sein.</p>
  <pre><code>col = np.array([[0], [10], [20]])   # Form (3, 1)
row = np.array([1, 2, 3])           # Form (3,)
col + row   # [[ 1, 2, 3],
            #  [11,12,13],
            #  [21,22,23]]</code></pre>

  <h3>View oder Copy?</h3>
  <p>Ein <b>View</b> ist ein neues Fenster auf dieselben Daten: ändert man den View, ändert sich das Original. Eine <b>Copy</b> hat eigene Daten.</p>
  <div class="tablewrap"><table>
    <tr><th>Code</th><th>Ergebnis</th><th>Warum</th></tr>
    <tr><td><code>a[1:4]</code></td><td>View</td><td>normaler Ausschnitt</td></tr>
    <tr><td><code>a[::2]</code></td><td>View</td><td>Schrittweite ist auch ein Ausschnitt</td></tr>
    <tr><td><code>a[[0, 2, 4]]</code></td><td>Copy</td><td>Indexliste, kein einheitlicher Abstand</td></tr>
    <tr><td><code>a[a &gt; 2]</code></td><td>Copy</td><td>Maske sammelt Werte neu ein</td></tr>
    <tr><td><code>a.reshape(2, 3)</code></td><td>View</td><td>nur andere Form, gleiche Bytes</td></tr>
  </table></div>
  <p>In Pandas 3 gilt <b>Copy-on-Write</b>: Jedes Ergebnis verhält sich wie eine Kopie. Darum ändert verkettetes Zuweisen wie <code>df["preis"][0] = 100</code> das <code>df</code> nicht mehr. Schreibe mit einem einzigen <code>loc</code>:</p>
  <pre><code>df.loc[0, "preis"] = 100</code></pre>

  <h3>Strings und Arrow</h3>
  <p>Früher waren Textspalten <code>object</code>: eine Liste von Pointern auf einzelne Python-Strings (langsam, viel Speicher). Pandas 3 speichert Text mit <b>Apache Arrow</b> in drei Blöcken: ein Bitfeld für «fehlt», Positionen, wo jeder Text beginnt, und alle Buchstaben hintereinander. Im Kursbeispiel brauchte das für eine Million Strings 13.5 MB statt 58.3 MB.</p>
  <p><b>Parquet</b> ist das passende Dateiformat auf der Festplatte: spaltenweise gespeichert, komprimiert, mit Schema. Man liest nur die Spalten, die man braucht.</p>`,
    quiz: [
      { q: `Warum ist <code>x * 2</code> auf einem NumPy-Array so viel schneller als eine Python-Schleife?`, a: `Kompilierte Schleife, zusammenhängender Speicher mit festem Typ und SIMD. Es gibt keine Objekte und keine Typprüfung pro Element.` },
      { q: `Ist <code>a[[0, 2, 4]]</code> ein View oder eine Copy?`, a: `Eine Copy, weil eine Indexliste keinen einheitlichen Abstand beschreibt. <code>a[::2]</code> dagegen ist ein View.` },
    ],
  });
})();
