/* Module: Python Grundlagen. Content lives in the html field; demos are wired in init(). */
(function () {
  const { $, fmt } = LernApp;

  LernApp.register({
    id: 'python',
    order: 30,
    nav: 'Python',
    title: `Python Grundlagen`,
    kicker: `Modul 1 · Freitag 16.10`,
    summary: `Datentypen, Funktionen, Comprehensions`,
    html: `  <p>Python ist lesbar, schnell zu lernen und hat riesige Bibliotheken für Daten und ML. Darum nutzt der ganze Kurs es.</p>

  <h3>Syntax in drei Regeln</h3>
  <ul>
    <li>Blöcke werden durch <b>Einrückung</b> gebildet, nicht durch Klammern.</li>
    <li>Variablen brauchen keinen Typ (<i>dynamisch typisiert</i>): <code>x = 3.5</code> reicht.</li>
    <li>Kommentare beginnen mit <code>#</code>.</li>
  </ul>
  <pre><code>zahl = 7
if zahl &gt; 5:
    print("gross")      # Einrückung = gehört zum if
else:
    print("klein")</code></pre>

  <h3>Die vier Behälter</h3>
  <div class="tablewrap"><table>
    <tr><th>Typ</th><th>Schreibweise</th><th>Eigenschaft</th></tr>
    <tr><td>List</td><td><code>[1, 2, 3]</code></td><td>geordnet, veränderbar, Duplikate erlaubt</td></tr>
    <tr><td>Tuple</td><td><code>(1, 2, 3)</code></td><td>geordnet, <b>nicht</b> veränderbar</td></tr>
    <tr><td>Dict</td><td><code>{"a": 1}</code></td><td>Zugriff über einen eindeutigen Schlüssel</td></tr>
    <tr><td>Set</td><td><code>{1, 2, 3}</code></td><td>keine Duplikate, keine feste Reihenfolge</td></tr>
  </table></div>
  <figure class="fig"><svg viewBox="0 0 360 218" role="img" aria-label="Vier Behälter im Vergleich: List, Tuple, Dict und Set"><rect class="d-box" x="6" y="6" width="170" height="104" rx="8"/><rect class="d-box" x="184" y="6" width="170" height="104" rx="8"/><rect class="d-box" x="6" y="118" width="170" height="104" rx="8"/><rect class="d-box" x="184" y="118" width="170" height="104" rx="8"/><text class="d-tb" x="91" y="24">List  [ ]</text><rect class="d-hl" x="18" y="40" width="34" height="30" rx="6"/><text class="d-t" x="35.0" y="55.0">1</text><rect class="d-hl" x="56" y="40" width="34" height="30" rx="6"/><text class="d-t" x="73.0" y="55.0">2</text><rect class="d-hl" x="94" y="40" width="34" height="30" rx="6"/><text class="d-t" x="111.0" y="55.0">3</text><rect class="d-hl" x="132" y="40" width="34" height="30" rx="6"/><text class="d-t" x="149.0" y="55.0">2</text><text class="d-m" x="91" y="88">geordnet · veränderbar</text><text class="d-m" x="91" y="101">Duplikate erlaubt</text><text class="d-tb" x="269" y="24">Tuple  ( )</text><rect class="d-hl" x="200" y="40" width="34" height="30" rx="6"/><text class="d-t" x="217.0" y="55.0">1</text><rect class="d-hl" x="238" y="40" width="34" height="30" rx="6"/><text class="d-t" x="255.0" y="55.0">2</text><rect class="d-hl" x="276" y="40" width="34" height="30" rx="6"/><text class="d-t" x="293.0" y="55.0">3</text><rect class="d-warn" x="323" y="54" width="16" height="13" rx="2"/><path class="d-ln" d="M326 54v-4a5 5 0 0 1 10 0v4"/><text class="d-m" x="269" y="88">geordnet · fix</text><text class="d-m" x="269" y="101">nicht veränderbar</text><text class="d-tb" x="91" y="136">Dict  { }</text><rect class="d-warn" x="16" y="148" width="28" height="24" rx="6"/><text class="d-t" x="30.0" y="160.0">a</text><line class="d-arr" x1="46" y1="160" x2="62" y2="160"/><rect class="d-hl" x="64" y="148" width="28" height="24" rx="6"/><text class="d-t" x="78.0" y="160.0">1</text><rect class="d-warn" x="98" y="148" width="28" height="24" rx="6"/><text class="d-t" x="112.0" y="160.0">b</text><line class="d-arr" x1="128" y1="160" x2="144" y2="160"/><rect class="d-hl" x="146" y="148" width="28" height="24" rx="6"/><text class="d-t" x="160.0" y="160.0">2</text><text class="d-m" x="91" y="196">Zugriff über Schlüssel</text><text class="d-m" x="91" y="209">Schlüssel sind eindeutig</text><text class="d-tb" x="269" y="136">Set  { }</text><ellipse class="d-hl" cx="269" cy="165" rx="60" ry="19"/><text class="d-t" x="239" y="161">3</text><text class="d-t" x="269" y="168">1</text><text class="d-t" x="299" y="161">2</text><text class="d-m" x="269" y="196">keine Duplikate</text><text class="d-m" x="269" y="209">keine feste Reihenfolge</text></svg><figcaption>Die vier Behälter auf einen Blick. Orange markiert, was beim Tuple gesperrt ist und was beim Dict der Schlüssel ist.</figcaption></figure>

  <h3>Listen: Index und Slicing</h3>
  <p>Gezählt wird ab <b>0</b>. Mit <code>[von:bis]</code> schneidest du ein Stück heraus; das Ende ist <i>nicht</i> dabei.</p>
  <figure class="fig"><svg viewBox="0 0 360 150" role="img" aria-label="Liste mit Indizes von 0 bis 4 und von minus 5 bis minus 1, die Elemente 20 und 30 sind markiert"><text class="d-m" x="90" y="8">von (dabei)</text><text class="d-m" x="210" y="8">bis (nicht dabei)</text><line class="d-ln" x1="90" y1="20" x2="90" y2="52"/><line class="d-ln" x1="210" y1="20" x2="210" y2="52"/><rect class="d-box" x="32" y="54" width="56" height="40" rx="6"/><text class="d-t" x="60.0" y="74.0">10</text><text class="d-m" x="60" y="46">0</text><text class="d-m" x="60" y="110">-5</text><rect class="d-hl" x="92" y="54" width="56" height="40" rx="6"/><text class="d-t" x="120.0" y="74.0">20</text><text class="d-m" x="120" y="46">1</text><text class="d-m" x="120" y="110">-4</text><rect class="d-hl" x="152" y="54" width="56" height="40" rx="6"/><text class="d-t" x="180.0" y="74.0">30</text><text class="d-m" x="180" y="46">2</text><text class="d-m" x="180" y="110">-3</text><rect class="d-box" x="212" y="54" width="56" height="40" rx="6"/><text class="d-t" x="240.0" y="74.0">40</text><text class="d-m" x="240" y="46">3</text><text class="d-m" x="240" y="110">-2</text><rect class="d-box" x="272" y="54" width="56" height="40" rx="6"/><text class="d-t" x="300.0" y="74.0">50</text><text class="d-m" x="300" y="46">4</text><text class="d-m" x="300" y="110">-1</text><path class="d-ln" d="M94 116v8h112v-8"/><text class="d-t" x="150" y="140">l[1:3]  →  [20, 30]</text></svg><figcaption>Oben stehen die Positionen ab 0, unten die Positionen von hinten. <code>l[1:3]</code> nimmt Position 1 und 2, die 3 ist nicht mehr dabei.</figcaption></figure>
  <pre><code>l = [10, 20, 30, 40, 50]
l[0]        # 10   (erstes Element)
l[-1]       # 50   (letztes Element)
l[1:3]      # [20, 30]   (Index 1 und 2)
l[::-1]     # [50, 40, 30, 20, 10]   (Schritt -1 = umdrehen)
l.append(60)        # hinten anhängen
l.sort()            # sortieren
"a,b,c".split(",")  # ['a','b','c']  (Text in Liste)
"-".join(["a","b"]) # 'a-b'          (Liste in Text)</code></pre>

  <h3>Schleifen und Bedingungen</h3>
  <pre><code>for x in [1, 2, 3]:          # über die Elemente
    print(x)
for i in range(len(l)):      # über den Index
    print(i, l[i])

if x &lt; 0:   print("negativ")
elif x == 0: print("null")
else:        print("positiv")</code></pre>

  <h3>Funktionen</h3>
  <p>Eine Funktion verpackt Code, den du mehrfach brauchst. <code>def</code> definiert sie, <code>return</code> gibt das Ergebnis zurück.</p>
  <figure class="fig"><svg viewBox="0 0 360 108" role="img" aria-label="Eine Funktion nimmt Parameter entgegen und gibt mit return ein Ergebnis zurück"><rect class="d-box" x="6" y="18" width="100" height="28" rx="6"/><text class="d-t" style="font-size:12px" x="56.0" y="32.0">preis = 100</text><rect class="d-box" x="6" y="58" width="100" height="28" rx="6"/><text class="d-t" style="font-size:12px" x="56.0" y="72.0">satz = 0.081</text><line class="d-arr" x1="108" y1="32" x2="130" y2="44"/><line class="d-arr" x1="108" y1="72" x2="130" y2="60"/><rect class="d-hl" x="134" y="14" width="140" height="76" rx="8"/><text class="d-tb" x="204" y="36" style="font-size:12.5px">preis_mit_mwst()</text><text class="d-t" x="204" y="64" style="font-size:10.5px">return preis*(1+satz)</text><line class="d-arrb" x1="276" y1="52" x2="292" y2="52"/><rect class="d-ok" x="294" y="36" width="58" height="32" rx="6"/><text class="d-t" x="323.0" y="52.0">108.1</text><text class="d-m d-ml" x="6" y="104">Eingabe (Parameter)</text><text class="d-m" x="323" y="84">Ausgabe</text><text class="d-m" x="323" y="97">(return)</text></svg><figcaption>Eine Funktion ist eine Box: Werte rein, Ergebnis raus. Ohne <code>return</code> kommt <code>None</code> zurück.</figcaption></figure>
  <pre><code>def preis_mit_mwst(preis, satz=0.081):
    return preis * (1 + satz)

preis_mit_mwst(100)    # 108.1</code></pre>

  <h3>Imports</h3>
  <pre><code>import numpy                  # ganze Bibliothek
import pandas as pd           # mit Kurzname (Konvention)
from sklearn import metrics   # nur ein Teil</code></pre>

  <h3>Die «Funktionalen» Werkzeuge</h3>
  <p>Das sind die Dinge, die am Anfang verwirren. Eigentlich sind es nur Abkürzungen für Schleifen.</p>
  <div class="tablewrap"><table>
    <tr><th>Werkzeug</th><th>Was es tut</th><th>Beispiel</th></tr>
    <tr><td><code>lambda</code></td><td>Mini-Funktion ohne Namen</td><td><code>lambda x: x * 2</code></td></tr>
    <tr><td><code>map(f, liste)</code></td><td>wendet <code>f</code> auf jedes Element an</td><td><code>list(map(lambda x: x*2, [1,2,3]))</code> → <code>[2,4,6]</code></td></tr>
    <tr><td><code>filter(f, liste)</code></td><td>behält Elemente, bei denen <code>f</code> <code>True</code> ergibt</td><td><code>list(filter(lambda x: x&gt;1, [1,2,3]))</code> → <code>[2,3]</code></td></tr>
    <tr><td><code>zip(a, b)</code></td><td>paart Elemente aus zwei Listen</td><td><code>list(zip([1,2],["a","b"]))</code> → <code>[(1,'a'),(2,'b')]</code></td></tr>
  </table></div>
  <figure class="fig"><svg viewBox="0 0 360 224" role="img" aria-label="Drei Werkzeuge: map wendet an, filter behält, zip paart"><rect class="d-box" x="14" y="14" width="28" height="26" rx="6"/><text class="d-t" x="28.0" y="27.0">1</text><rect class="d-box" x="46" y="14" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="27.0">2</text><rect class="d-box" x="78" y="14" width="28" height="26" rx="6"/><text class="d-t" x="92.0" y="27.0">3</text><line class="d-arrb" x1="116" y1="27" x2="208" y2="27"/><text class="d-m" x="162" y="17">map(× 2)</text><rect class="d-ok" x="214" y="14" width="28" height="26" rx="6"/><text class="d-t" x="228.0" y="27.0">2</text><rect class="d-ok" x="246" y="14" width="28" height="26" rx="6"/><text class="d-t" x="260.0" y="27.0">4</text><rect class="d-ok" x="278" y="14" width="28" height="26" rx="6"/><text class="d-t" x="292.0" y="27.0">6</text><rect class="d-dim" x="14" y="90" width="28" height="26" rx="6"/><text class="d-tm" x="28.0" y="103.0">1</text><rect class="d-box" x="46" y="90" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="103.0">2</text><rect class="d-box" x="78" y="90" width="28" height="26" rx="6"/><text class="d-t" x="92.0" y="103.0">3</text><line class="d-arrb" x1="116" y1="103" x2="208" y2="103"/><text class="d-m" x="162" y="93">filter(&gt; 1)</text><rect class="d-ok" x="214" y="90" width="28" height="26" rx="6"/><text class="d-t" x="228.0" y="103.0">2</text><rect class="d-ok" x="246" y="90" width="28" height="26" rx="6"/><text class="d-t" x="260.0" y="103.0">3</text><rect class="d-box" x="14" y="162" width="28" height="26" rx="6"/><text class="d-t" x="28.0" y="175.0">1</text><rect class="d-box" x="46" y="162" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="175.0">2</text><rect class="d-warn" x="14" y="192" width="28" height="26" rx="6"/><text class="d-t" x="28.0" y="205.0">a</text><rect class="d-warn" x="46" y="192" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="205.0">b</text><line class="d-arrb" x1="116" y1="190" x2="198" y2="190"/><text class="d-m" x="157" y="180">zip(…)</text><rect class="d-ok" x="206" y="177" width="62" height="26" rx="6"/><text class="d-t" x="237.0" y="190.0">(1,a)</text><rect class="d-ok" x="274" y="177" width="62" height="26" rx="6"/><text class="d-t" x="305.0" y="190.0">(2,b)</text></svg><figcaption><code>map</code> verändert jedes Element, <code>filter</code> wirft aus (das gestrichelte Feld fällt weg), <code>zip</code> legt zwei Listen paarweise nebeneinander.</figcaption></figure>

  <h3>Comprehensions: die Schleife in einer Zeile</h3>
  <pre><code># lang:
quadrate = []
for x in range(5):
    if x % 2 == 0:
        quadrate.append(x * x)

# kurz (List Comprehension):  [Ausdruck  for x in ...  if Bedingung]
quadrate = [x * x for x in range(5) if x % 2 == 0]   # [0, 4, 16]

# Dictionary Comprehension
{x: x * x for x in range(3)}                          # {0:0, 1:1, 2:4}</code></pre>
    <figure class="fig"><svg viewBox="0 0 360 176" role="img" aria-label="Eine List Comprehension in drei Schritten: Quelle, Filter, Rechnen"><text class="d-m d-ml" x="6" y="24">Quelle</text><text class="d-t d-ml" style="font-size:11px" x="6" y="38">range(5)</text><text class="d-m d-ml" x="6" y="80">Filter</text><text class="d-t d-ml" style="font-size:11px" x="6" y="94">if x % 2 == 0</text><text class="d-m d-ml" x="6" y="136">Rechnen</text><text class="d-t d-ml" style="font-size:11px" x="6" y="150">x * x</text><rect class="d-box" x="96" y="14" width="42" height="28" rx="6"/><text class="d-t" x="117.0" y="28.0">0</text><rect class="d-hl" x="96" y="70" width="42" height="28" rx="6"/><text class="d-t" x="117.0" y="84.0">0</text><line class="d-arr" x1="117" y1="44" x2="117" y2="68"/><line class="d-arr" x1="117" y1="100" x2="117" y2="124"/><rect class="d-ok" x="96" y="126" width="42" height="28" rx="6"/><text class="d-t" x="117.0" y="140.0">0</text><rect class="d-box" x="148" y="14" width="42" height="28" rx="6"/><text class="d-t" x="169.0" y="28.0">1</text><rect class="d-dim" x="148" y="70" width="42" height="28" rx="6"/><text class="d-tm" x="169.0" y="84.0">1</text><line class="d-arr" x1="169" y1="44" x2="169" y2="68"/><rect class="d-box" x="200" y="14" width="42" height="28" rx="6"/><text class="d-t" x="221.0" y="28.0">2</text><rect class="d-hl" x="200" y="70" width="42" height="28" rx="6"/><text class="d-t" x="221.0" y="84.0">2</text><line class="d-arr" x1="221" y1="44" x2="221" y2="68"/><line class="d-arr" x1="221" y1="100" x2="221" y2="124"/><rect class="d-ok" x="200" y="126" width="42" height="28" rx="6"/><text class="d-t" x="221.0" y="140.0">4</text><rect class="d-box" x="252" y="14" width="42" height="28" rx="6"/><text class="d-t" x="273.0" y="28.0">3</text><rect class="d-dim" x="252" y="70" width="42" height="28" rx="6"/><text class="d-tm" x="273.0" y="84.0">3</text><line class="d-arr" x1="273" y1="44" x2="273" y2="68"/><rect class="d-box" x="304" y="14" width="42" height="28" rx="6"/><text class="d-t" x="325.0" y="28.0">4</text><rect class="d-hl" x="304" y="70" width="42" height="28" rx="6"/><text class="d-t" x="325.0" y="84.0">4</text><line class="d-arr" x1="325" y1="44" x2="325" y2="68"/><line class="d-arr" x1="325" y1="100" x2="325" y2="124"/><rect class="d-ok" x="304" y="126" width="42" height="28" rx="6"/><text class="d-t" x="325.0" y="140.0">16</text><text class="d-m" x="223" y="170">Ergebnis: [0, 4, 16]</text></svg><figcaption>Die Comprehension ist ein Fliessband: Zahlen kommen aus <code>range(5)</code>, der Filter lässt nur gerade durch, am Ende wird quadriert.</figcaption></figure>
  <p>Lesen von hinten nach vorn hilft: «Für jedes x in range(5), falls gerade, nimm x mal x.»</p>

  <h3>Dateien</h3>
  <pre><code>with open("file.txt", "r") as f:   # r = lesen, w = schreiben, a = anhängen
    text = f.read()</code></pre>

  <h3>Fehler abfangen: try und except</h3>
  <p>Wenn Code schiefgehen kann (Datei fehlt, Division durch 0, Text statt Zahl), bricht Python mit einem Fehler ab. Mit <code>try</code>/<code>except</code> fängst du den Fehler ab und reagierst, statt abzustürzen.</p>
  <pre><code>try:
    zahl = int("abc")        # das geht schief
except ValueError:
    print("Das war keine Zahl")   # hier geht es weiter</code></pre>

  <h3>Umgebungen: wo deine Pakete leben</h3>
  <p>Pakete wie Pandas installierst du nicht «in Python», sondern in eine <b>Umgebung</b> pro Projekt. So kommen sich Projekte mit verschiedenen Versionen nicht in die Quere. Im Kurs vorgestellt: Anaconda/Miniconda, <code>pip</code> mit <code>venv</code> und das neuere <code>uv</code>.</p>
  <pre><code>python -m venv .venv            # Umgebung anlegen (einmalig)
.venv\Scripts\activate          # aktivieren (Windows)
pip install pandas matplotlib   # Pakete in diese Umgebung installieren</code></pre>
  <div class="merk"><b>Für dieses Repo</b><p>Die Umgebung liegt als <code>.venv</code> im Repo (Kernel «CAS ML HS26»). In VS Code beim Öffnen eines Notebooks oben rechts diesen Kernel wählen; die Pakete stehen in <code>requirements.txt</code>.</p></div>
  <div class="merk"><b>Merksatz</b><p>Listen sind veränderbar, Tuples nicht. Dicts findest du über Schlüssel, nicht über Positionen. Das brauchst du später ständig, weil ein DataFrame im Kern ein Dict von Spalten ist.</p></div>`,
    exercises: [
     {t:'Variablen und print',task:'Lege <code>name</code> (Text) und <code>alter</code> (ganze Zahl) an und gib mit <code>print</code> einen Satz aus, der beides enthält.',
      start:`name = None   # TODO: ein Text in Anführungszeichen
  alter = None  # TODO: eine ganze Zahl
  print()       # TODO: Satz mit name und alter`,
      check:`assert isinstance(name, str) and name != "", "name muss ein Text sein (in Anführungszeichen)"
  assert isinstance(alter, int), "alter muss eine ganze Zahl sein"`,
      sol:`name = "Ana"
  alter = 30
  print("Ich bin", name, "und", alter, "Jahre alt")`},
     {t:'Slicing',task:'Schneide mit Slicing die Buchstaben <code>c, d, e</code> heraus (<code>mitte</code>) und jeden zweiten Buchstaben ab dem ersten (<code>jeder_zweite</code>). Denk daran: Gezählt wird ab 0 und das Ende ist nicht dabei.',
      start:`buchstaben = ["a", "b", "c", "d", "e", "f"]
  mitte = None         # ["c", "d", "e"]
  jeder_zweite = None  # ["a", "c", "e"]
  print(mitte, jeder_zweite)`,
      check:`assert mitte == ["c", "d", "e"], "mitte: Index 2 bis 4, das Ende beim Slicing ist nicht dabei"
  assert jeder_zweite == ["a", "c", "e"], "jeder_zweite: Schrittweite 2 mit [::2]"`,
      sol:`buchstaben = ["a", "b", "c", "d", "e", "f"]
  mitte = buchstaben[2:5]
  jeder_zweite = buchstaben[::2]
  print(mitte, jeder_zweite)`},
     {t:'Dict aus zwei Listen',task:'Baue aus den beiden Listen mit <code>zip</code> ein Dictionary, das jeder Stadt ihre Einwohnerzahl zuordnet.',
      start:`staedte = ["Luzern", "Zug", "Bern"]
  einwohner = [82000, 30000, 134000]
  lexikon = None   # TODO: dict(zip(...))
  print(lexikon)`,
      check:`assert isinstance(lexikon, dict), "lexikon muss ein dict sein"
  assert lexikon == {"Luzern": 82000, "Zug": 30000, "Bern": 134000}, "Die Paare stimmen noch nicht"`,
      sol:`staedte = ["Luzern", "Zug", "Bern"]
  einwohner = [82000, 30000, 134000]
  lexikon = dict(zip(staedte, einwohner))
  print(lexikon)`},
     {t:'Funktion mit Standardwert',task:'Schreibe die Funktion <code>flaeche_rechteck(breite, hoehe=1)</code>, die die Fläche zurückgibt. Wenn keine Höhe angegeben wird, gilt 1.',
      start:`def flaeche_rechteck(breite, hoehe=1):
      pass  # TODO: return ...
  
  
  print(flaeche_rechteck(3, 4))`,
      check:`assert flaeche_rechteck(3, 4) == 12, "flaeche_rechteck(3, 4) soll 12 ergeben (return nicht vergessen)"
  assert flaeche_rechteck(5) == 5, "Ohne Höhe soll hoehe = 1 gelten"`,
      sol:`def flaeche_rechteck(breite, hoehe=1):
      return breite * hoehe
  
  
  print(flaeche_rechteck(3, 4))`},
     {t:'Schleife und Bedingung',task:'Addiere alle Zahlen von 1 bis 100, die durch 3 teilbar sind. Hinweis: <code>zahl % 3</code> liefert den Rest der Division.',
      start:`summe = 0
  for zahl in range(1, 101):
      # TODO: zahl zur summe addieren, wenn sie durch 3 teilbar ist
      pass
  print(summe)`,
      check:`assert summe == 1683, "Erwartet wird 1683, also 3 + 6 + 9 + ... + 99"`,
      sol:`summe = 0
  for zahl in range(1, 101):
      if zahl % 3 == 0:
          summe = summe + zahl
  print(summe)`},
     {t:'List Comprehension',task:'Erzeuge mit einer List Comprehension die Quadrate aller <b>ungeraden</b> Zahlen von 0 bis 9. Form: <code>[Ausdruck for x in ... if Bedingung]</code>.',
      start:`quadrate_ungerade = None   # [1, 9, 25, 49, 81]
  print(quadrate_ungerade)`,
      check:`assert quadrate_ungerade == [1, 9, 25, 49, 81], "Erwartet: [1, 9, 25, 49, 81]"`,
      sol:`quadrate_ungerade = [x * x for x in range(10) if x % 2 == 1]
  print(quadrate_ungerade)`},
     {t:'map, filter und lambda',task:'Behalte aus <code>zahlen</code> mit <code>filter</code> nur die geraden Zahlen und verdopple sie dann mit <code>map</code>. Verpacke das Ergebnis in <code>list(...)</code>.',
      start:`zahlen = [1, 2, 3, 4, 5, 6]
  ergebnis = None   # [4, 8, 12]
  print(ergebnis)`,
      check:`assert ergebnis == [4, 8, 12], "Erwartet: [4, 8, 12]. Ist alles in list(...) verpackt?"`,
      sol:`zahlen = [1, 2, 3, 4, 5, 6]
  ergebnis = list(map(lambda x: x * 2, filter(lambda x: x % 2 == 0, zahlen)))
  print(ergebnis)`},
     {t:'Dictionary Comprehension',task:'Behalte aus <code>preise</code> nur die Produkte, die mehr als 3 kosten. Form: <code>{schluessel: wert for schluessel, wert in d.items() if ...}</code>.',
      start:`preise = {"brot": 4, "kaese": 12, "milch": 2}
  teuer = None   # TODO
  print(teuer)`,
      check:`assert teuer == {"brot": 4, "kaese": 12}, "Erwartet: {'brot': 4, 'kaese': 12}"`,
      sol:`preise = {"brot": 4, "kaese": 12, "milch": 2}
  teuer = {name: preis for name, preis in preise.items() if preis > 3}
  print(teuer)`},
     {t:'Fehler suchen',task:'Diese Funktion soll den Durchschnitt der Noten berechnen (erwartet: 4.5), liefert aber etwas anderes. Finde den Fehler und behebe ihn. Hinweis: Welche Elemente durchläuft die Schleife?',
      start:`def durchschnitt(werte):
      summe = 0
      for w in werte[1:]:
          summe = summe + w
      return summe / len(werte)
  
  
  noten = [4, 5, 6, 3]
  print(durchschnitt(noten))`,
      check:`assert durchschnitt([4, 5, 6, 3]) == 4.5, "durchschnitt([4, 5, 6, 3]) soll 4.5 ergeben"`,
      sol:`def durchschnitt(werte):
      summe = 0
      for w in werte:
          summe = summe + w
      return summe / len(werte)
  
  
  noten = [4, 5, 6, 3]
  print(durchschnitt(noten))`}
    ],
    quiz: [
      { q: `Was gibt <code>l[1:3]</code> zurück, wenn <code>l = [10, 20, 30, 40]</code>?`, a: `<code>[20, 30]</code>. Gezählt wird ab 0, und das Ende (Index 3) ist nicht dabei.` },
      { q: `Was ist der Unterschied zwischen List und Tuple?`, a: `Eine List ist veränderbar, ein Tuple nicht. Beide sind geordnet.` },
      { q: `Was ergibt <code>[x * x for x in range(5) if x % 2 == 0]</code>?`, a: `<code>[0, 4, 16]</code>: die Quadrate der geraden Zahlen 0, 2 und 4.` },
    ],
  });
})();
