/* Module: Pandas: Excel, aber programmierbar. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  function mergeRows(how){const L=[["A","SOHO"],["B","HARLEM"],["C","BUSHWICK"],["D","ASTORIA"]];const R=[["C",850000],["D",1200000],["E",640000],["F",2300000]];
    const keys=[];const lk=L.map(r=>r[0]),rk=R.map(r=>r[0]);
    const all=how==="inner"?lk.filter(k=>rk.includes(k)):how==="left"?lk:how==="right"?rk:Array.from(new Set(lk.concat(rk))).sort();
    return all.map(k=>{const l=L.find(r=>r[0]===k),r=R.find(r=>r[0]===k);return{key:k,hood:l?l[1]:null,price:r?r[1]:null,src:l&&r?"both":l?"left_only":"right_only"}})}

  LernApp.register({
    id: 'pandas',
    order: 40,
    nav: 'Pandas',
    title: `Pandas: Excel, aber programmierbar`,
    kicker: `Modul 1 · Freitag 16.10 und Samstag 17.10`,
    summary: `DataFrame, Filter, groupby, merge`,
    html: `  <p>Pandas ist die Bibliothek für Tabellen. Zeilen sind Beobachtungen (ein Kunde, ein Verkauf), Spalten sind Variablen (Alter, Preis). Sie ist das wichtigste Werkzeug zum Aufräumen und Vorbereiten von Daten.</p>

  <h3>Series und DataFrame</h3>
  <ul>
    <li><b>Series</b>: eine einzelne Spalte, eindimensional, mit Index (Beschriftung links).</li>
    <li><b>DataFrame</b>: die ganze Tabelle. Jede Spalte ist eine Series.</li>
  </ul>
  <pre><code>import pandas as pd

s  = pd.Series([10, 34, 623, 32])
df = pd.read_csv("customers.csv")      # Datei laden
df2 = pd.DataFrame({"name": ["Ana", "Ben"], "alter": [31, 45]})</code></pre>

  <h3>Erst anschauen, dann arbeiten</h3>
  <pre><code>df.head()       # erste 5 Zeilen
df.shape        # (Zeilen, Spalten)
df.info()       # Spalten, Typen, Anzahl nicht-leerer Werte
df.describe()   # Min, Max, Mittelwert, Quartile
df.sample(10, random_state=42)   # 10 zufällige Zeilen, reproduzierbar</code></pre>
  <div class="falle"><b>Falle</b><p><code>head()</code> zeigt oft nur eine Ecke der Daten (z. B. alles aus demselben Quartier). <code>sample()</code> ist ehrlicher.</p></div>

  <h3>Auswählen und filtern</h3>
  <pre><code>df["alter"]                 # eine Spalte (Series)
df[["name", "alter"]]       # mehrere Spalten (DataFrame)
df.loc[0, "name"]           # nach Label: Zeile 0, Spalte "name"
df.iloc[0, 1]               # nach Position: 1. Zeile, 2. Spalte

maske = df["alter"] &gt; 40    # True/False pro Zeile = "Boolean Mask"
df[maske]                   # nur die Zeilen mit True
df_gross = df[df["alter"] &gt; 40].copy()   # .copy() = eigene, unabhängige Tabelle</code></pre>
  <p><code>loc</code> fragt nach <b>Namen</b>, <code>iloc</code> nach <b>Positionen</b>. Die Maske ist wie ein Sieb: Nur was <code>True</code> hat, geht durch.</p>

  <h3>Neue Spalten, Typen, Sortieren</h3>
  <pre><code>df["preis_pro_m2"] = df["preis"] / df["flaeche"]     # neue Spalte aus Rechnung
df["datum"] = pd.to_datetime(df["datum"])            # Text in echtes Datum
df["monat"] = df["datum"].dt.month                   # Teil eines Datums
df.sort_values("preis", ascending=False)             # sortieren
df["stadt"].value_counts()                           # wie oft kommt jeder Wert vor?</code></pre>

  <h3>Fehlende Werte</h3>
  <pre><code>df.isna().sum()                     # leere Werte pro Spalte
df = df.dropna(subset=["preis"])    # Zeilen löschen, wo "preis" fehlt
df["alter"] = df["alter"].fillna(df["alter"].median())   # auffüllen (Ergebnis zuweisen!)</code></pre>
  <div class="falle"><b>Falle aus dem NYC-Notebook</b><p>In jeder Spalte fehlen nur etwa 5 Prozent. Aber in <i>verschiedenen</i> Zeilen. Ein pauschales <code>dropna()</code> wirft dadurch rund 43 Prozent aller Zeilen weg. Besser: nur dort löschen, wo die Spalte wirklich nötig ist.</p></div>

  <h3>groupby: Gruppieren und Zusammenfassen</h3>
  <p>Idee in drei Schritten: <b>aufteilen</b> nach einer Spalte, <b>rechnen</b> pro Gruppe, <b>zusammensetzen</b>.</p>
  <pre><code>df.groupby("stadt")["preis"].mean()                    # Durchschnitt pro Stadt
df.groupby("jahr")["preis"].agg(["count", "sum", "mean", "median"])</code></pre>
  <div class="falle"><b>Falle</b><p><code>df.groupby("jahr").sum()</code> addiert <i>alle</i> Spalten, auch Postleitzahlen. Wähle zuerst die Spalte, die du wirklich meinst.</p></div>

  <h3>merge: Tabellen verbinden</h3>
  <p>Zwei Tabellen haben eine gemeinsame Spalte (den Schlüssel). Mit <code>pd.merge(a, b, on="schluessel", how=...)</code> führst du sie zusammen. Das Argument <code>how</code> entscheidet, was mit Schlüsseln passiert, die nur in einer Tabelle vorkommen. Probier es aus:</p>

  <div class="demo" id="mergeDemo">
    <div class="tag">Demo</div><h4>Merge-Arten</h4>
    <div id="mergeTables"></div>
    <div class="btnrow" id="mergeBtns" role="group" aria-label="Merge-Art">
      <button data-how="inner" class="pri">inner</button><button data-how="left">left</button><button data-how="right">right</button><button data-how="outer">outer</button>
    </div>
    <p class="hint" id="mergeText"></p>
    <div class="tablewrap"><table id="mergeResult"></table></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>how=</th><th>Behält</th><th>Wann nehmen?</th></tr>
    <tr><td><code>inner</code></td><td>nur Schlüssel aus beiden</td><td>Zeile nützt nur mit beiden Infos</td></tr>
    <tr><td><code>left</code></td><td>alle aus der linken Tabelle</td><td>Haupttabelle anreichern (am häufigsten)</td></tr>
    <tr><td><code>right</code></td><td>alle aus der rechten Tabelle</td><td>wie left, nur vertauscht</td></tr>
    <tr><td><code>outer</code></td><td>alle aus beiden</td><td>alles sehen, z. B. beim Debuggen</td></tr>
  </table></div>
  <pre><code>pd.merge(df1, df2, on="property_id", how="inner", validate="one_to_one")
# indicator=True fügt Spalte _merge hinzu: both / left_only / right_only</code></pre>
  <p>Nützlich: <code>validate="one_to_one"</code> bricht ab, falls ein Schlüssel doppelt vorkommt. <code>indicator=True</code> zeigt, woher jede Zeile kam.</p>

  <h3>Eigene Kategorien: map und pd.cut</h3>
  <pre><code>bins   = [-float("inf"), 500, 3500, 10000, float("inf")]
labels = ["cheap", "normal", "expensive", "super expensive"]
df["kategorie"] = pd.cut(df["preis_pro_sqft"], bins=bins, labels=labels)</code></pre>
  <p><code>pd.cut</code> sortiert Zahlen in Fächer. Ergebnis ist eine <i>geordnete</i> Kategorie, Grafiken folgen also der richtigen Reihenfolge.</p>

  <h3>Was man aus der NYC-Analyse lernt</h3>
  <p>Das Live-Coding war nicht nur Technik, sondern auch Denkschulung. Diese vier Lektionen sind mindestens so wichtig wie die Befehle:</p>
  <ol>
    <li><b>Mittelwert gegen Median:</b> In Manhattan lag der Durchschnittspreis bei etwa 15.8 Mio., der Median bei 5.65 Mio. Ein paar Riesendeals ziehen den Mittelwert hoch. Bei schiefen Daten ist der Median das typische «Normal».</li>
    <li><b>Platzhalter-Nullen:</b> <code>YEAR BUILT = 0</code> heisst «unbekannt», nicht «Jahr null». <code>describe()</code> zeigt das in der Min-Zeile.</li>
    <li><b>Proxy ist nicht Wahrheit:</b> Verkaufspreis 0 Dollar wurde als «Eltern an Kinder» gedeutet. Das ist eine Annahme, es können auch Scheidung oder Nachlass sein.</li>
    <li><b>Fairer Vergleich:</b> 2017 «gewann», weil es 8 Monate in den Daten hatte, 2016 nur 4. Pro Monat gerechnet dreht das Bild.</li>
  </ol>
  <div class="merk"><b>Merksatz</b><p>Zuerst die Frage, dann die Daten prüfen (<code>info</code>, <code>describe</code>, <code>isna</code>), dann rechnen. Ein sauberer Code mit falscher Annahme liefert trotzdem ein falsches Resultat.</p></div>`,
    notebooks: [{ file: 'Python_Pandas_Uebungen_own.ipynb', desc: `12 Aufgaben mit echtem Pandas: Listen, Comprehensions, Filter, groupby, merge, Datum, pd.cut und eine Grafik.` }],
    quiz: [
      { q: `Was ist der Unterschied zwischen <code>loc</code> und <code>iloc</code>?`, a: `<code>loc</code> wählt nach Labels (Index- und Spaltennamen), <code>iloc</code> nach Positionen (0, 1, 2 …).` },
      { q: `Du verbindest zwei Tabellen und willst keine Zeile der Haupttabelle verlieren. Welches <code>how</code>?`, a: `<code>left</code>, mit der Haupttabelle links. Fehlende Partner werden NaN.` },
      { q: `Warum ist der Median bei Hauspreisen oft besser als der Mittelwert?`, a: `Ein paar sehr teure Objekte ziehen den Mittelwert nach oben. Der Median ist unempfindlich gegen Ausreisser.` },
      { q: `Warum gibt <code>df.groupby("jahr").sum()</code> oft Unsinn?`, a: `Es summiert alle Spalten, auch sinnlose wie Postleitzahlen. Wähle vorher die gewünschte Spalte: <code>df.groupby("jahr")["preis"].sum()</code>.` },
    ],
    init() {
      (function(){
        $('mergeTables').innerHTML='<div class="grid2"><div><h4>buildings (links)</h4><div class="tablewrap"><table style="min-width:0"><tr><th>property_id</th><th>NEIGHBORHOOD</th></tr><tr><td>A</td><td>SOHO</td></tr><tr><td>B</td><td>HARLEM</td></tr><tr><td>C</td><td>BUSHWICK</td></tr><tr><td>D</td><td>ASTORIA</td></tr></table></div></div><div><h4>sales (rechts)</h4><div class="tablewrap"><table style="min-width:0"><tr><th>property_id</th><th>SALE PRICE</th></tr><tr><td>C</td><td class="num">850&#8217;000</td></tr><tr><td>D</td><td class="num">1&#8217;200&#8217;000</td></tr><tr><td>E</td><td class="num">640&#8217;000</td></tr><tr><td>F</td><td class="num">2&#8217;300&#8217;000</td></tr></table></div></div></div>';
        const txt={inner:'Nur C und D sind in beiden Tabellen. Alles andere fällt weg (4 Zeilen auf 2).',
          left:'Alle Zeilen der linken Tabelle bleiben. A und B haben keinen Preis (NaN). E und F fallen weg.',
          right:'Alle Zeilen der rechten Tabelle bleiben. E und F haben keinen Stadtteil (NaN). A und B fallen weg.',
          outer:'Alles bleibt, was fehlt, wird NaN. Gut, um Lücken zu finden.'};
        const cls={both:'b',left_only:'l',right_only:'r'};
        function show(how){const rows=mergeRows(how);
          $('mergeText').textContent="how='"+how+"': "+rows.length+" Zeilen. "+txt[how]+" Farbe: grün = in beiden, blau = nur links, orange = nur rechts.";
          $('mergeResult').innerHTML='<tr><th>property_id</th><th>NEIGHBORHOOD</th><th>SALE PRICE</th><th>_merge</th></tr>'+
            rows.map(r=>{const c=cls[r.src];return '<tr><td class="'+c+'">'+r.key+'</td><td class="'+c+'">'+(r.hood===null?'NaN':r.hood)+'</td><td class="'+c+' num">'+(r.price===null?'NaN':r.price.toLocaleString('de-CH'))+'</td><td class="'+c+'">'+r.src+'</td></tr>'}).join('');
          document.querySelectorAll('#mergeBtns button').forEach(b=>b.classList.toggle('pri',b.dataset.how===how))}
        document.querySelectorAll('#mergeBtns button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.how)));show('inner')})();
    },
  });
})();
