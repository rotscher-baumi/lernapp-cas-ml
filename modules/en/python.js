/* English texts for the module "python" (Python basics). Fields replace the German ones when the language is EN. */
LernApp.translate('python', {
  nav: 'Python',
  title: `Python basics`,
  kicker: `Module 1 · Friday 16.10`,
  summary: `Data types, functions, comprehensions`,
  html: `  <p>Python is readable, quick to learn and has huge libraries for data and ML. That is why the whole course uses it.</p>

  <h3>Syntax in three rules</h3>
  <ul>
    <li>Blocks are formed by <b>indentation</b>, not by brackets.</li>
    <li>Variables need no type (<i>dynamically typed</i>): <code>x = 3.5</code> is enough.</li>
    <li>Comments start with <code>#</code>.</li>
  </ul>
  <pre><code>zahl = 7
if zahl &gt; 5:
    print("gross")      # indentation = belongs to the if
else:
    print("klein")</code></pre>

  <h3>The four containers</h3>
  <div class="tablewrap"><table>
    <tr><th>Type</th><th>Notation</th><th>Property</th></tr>
    <tr><td>List</td><td><code>[1, 2, 3]</code></td><td>ordered, mutable, duplicates allowed</td></tr>
    <tr><td>Tuple</td><td><code>(1, 2, 3)</code></td><td>ordered, <b>not</b> mutable</td></tr>
    <tr><td>Dict</td><td><code>{"a": 1}</code></td><td>access via a unique key</td></tr>
    <tr><td>Set</td><td><code>{1, 2, 3}</code></td><td>no duplicates, no fixed order</td></tr>
  </table></div>
  <figure class="fig"><svg viewBox="0 0 360 218" role="img" aria-label="Four containers compared: list, tuple, dict and set"><rect class="d-box" x="6" y="6" width="170" height="104" rx="8"/><rect class="d-box" x="184" y="6" width="170" height="104" rx="8"/><rect class="d-box" x="6" y="118" width="170" height="104" rx="8"/><rect class="d-box" x="184" y="118" width="170" height="104" rx="8"/><text class="d-tb" x="91" y="24">List  [ ]</text><rect class="d-hl" x="18" y="40" width="34" height="30" rx="6"/><text class="d-t" x="35.0" y="55.0">1</text><rect class="d-hl" x="56" y="40" width="34" height="30" rx="6"/><text class="d-t" x="73.0" y="55.0">2</text><rect class="d-hl" x="94" y="40" width="34" height="30" rx="6"/><text class="d-t" x="111.0" y="55.0">3</text><rect class="d-hl" x="132" y="40" width="34" height="30" rx="6"/><text class="d-t" x="149.0" y="55.0">2</text><text class="d-m" x="91" y="88">ordered · mutable</text><text class="d-m" x="91" y="101">duplicates allowed</text><text class="d-tb" x="269" y="24">Tuple  ( )</text><rect class="d-hl" x="200" y="40" width="34" height="30" rx="6"/><text class="d-t" x="217.0" y="55.0">1</text><rect class="d-hl" x="238" y="40" width="34" height="30" rx="6"/><text class="d-t" x="255.0" y="55.0">2</text><rect class="d-hl" x="276" y="40" width="34" height="30" rx="6"/><text class="d-t" x="293.0" y="55.0">3</text><rect class="d-warn" x="323" y="54" width="16" height="13" rx="2"/><path class="d-ln" d="M326 54v-4a5 5 0 0 1 10 0v4"/><text class="d-m" x="269" y="88">ordered · fixed</text><text class="d-m" x="269" y="101">not mutable</text><text class="d-tb" x="91" y="136">Dict  { }</text><rect class="d-warn" x="16" y="148" width="28" height="24" rx="6"/><text class="d-t" x="30.0" y="160.0">a</text><line class="d-arr" x1="46" y1="160" x2="62" y2="160"/><rect class="d-hl" x="64" y="148" width="28" height="24" rx="6"/><text class="d-t" x="78.0" y="160.0">1</text><rect class="d-warn" x="98" y="148" width="28" height="24" rx="6"/><text class="d-t" x="112.0" y="160.0">b</text><line class="d-arr" x1="128" y1="160" x2="144" y2="160"/><rect class="d-hl" x="146" y="148" width="28" height="24" rx="6"/><text class="d-t" x="160.0" y="160.0">2</text><text class="d-m" x="91" y="196">access via key</text><text class="d-m" x="91" y="209">keys are unique</text><text class="d-tb" x="269" y="136">Set  { }</text><ellipse class="d-hl" cx="269" cy="165" rx="60" ry="19"/><text class="d-t" x="239" y="161">3</text><text class="d-t" x="269" y="168">1</text><text class="d-t" x="299" y="161">2</text><text class="d-m" x="269" y="196">no duplicates</text><text class="d-m" x="269" y="209">no fixed order</text></svg><figcaption>The four containers at a glance. Orange marks what is locked in the tuple and what the key is in the dict.</figcaption></figure>

  <h3>Lists: index and slicing</h3>
  <p>Counting starts at <b>0</b>. With <code>[from:to]</code> you cut out a piece; the end is <i>not</i> included.</p>
  <figure class="fig"><svg viewBox="0 0 360 150" role="img" aria-label="List with indices from 0 to 4 and from minus 5 to minus 1, the elements 20 and 30 are highlighted"><text class="d-m" x="90" y="8">from (included)</text><text class="d-m" x="210" y="8">to (not included)</text><line class="d-ln" x1="90" y1="20" x2="90" y2="52"/><line class="d-ln" x1="210" y1="20" x2="210" y2="52"/><rect class="d-box" x="32" y="54" width="56" height="40" rx="6"/><text class="d-t" x="60.0" y="74.0">10</text><text class="d-m" x="60" y="46">0</text><text class="d-m" x="60" y="110">-5</text><rect class="d-hl" x="92" y="54" width="56" height="40" rx="6"/><text class="d-t" x="120.0" y="74.0">20</text><text class="d-m" x="120" y="46">1</text><text class="d-m" x="120" y="110">-4</text><rect class="d-hl" x="152" y="54" width="56" height="40" rx="6"/><text class="d-t" x="180.0" y="74.0">30</text><text class="d-m" x="180" y="46">2</text><text class="d-m" x="180" y="110">-3</text><rect class="d-box" x="212" y="54" width="56" height="40" rx="6"/><text class="d-t" x="240.0" y="74.0">40</text><text class="d-m" x="240" y="46">3</text><text class="d-m" x="240" y="110">-2</text><rect class="d-box" x="272" y="54" width="56" height="40" rx="6"/><text class="d-t" x="300.0" y="74.0">50</text><text class="d-m" x="300" y="46">4</text><text class="d-m" x="300" y="110">-1</text><path class="d-ln" d="M94 116v8h112v-8"/><text class="d-t" x="150" y="140">l[1:3]  →  [20, 30]</text></svg><figcaption>At the top are the positions from 0, at the bottom the positions from the end. <code>l[1:3]</code> takes positions 1 and 2, the 3 is no longer included.</figcaption></figure>
  <pre><code>l = [10, 20, 30, 40, 50]
l[0]        # 10   (first element)
l[-1]       # 50   (last element)
l[1:3]      # [20, 30]   (index 1 and 2)
l[::-1]     # [50, 40, 30, 20, 10]   (step -1 = reverse)
l.append(60)        # add at the end
l.sort()            # sort
"a,b,c".split(",")  # ['a','b','c']  (text to list)
"-".join(["a","b"]) # 'a-b'          (list to text)</code></pre>

  <h3>Loops and conditions</h3>
  <pre><code>for x in [1, 2, 3]:          # over the elements
    print(x)
for i in range(len(l)):      # over the index
    print(i, l[i])

if x &lt; 0:   print("negativ")
elif x == 0: print("null")
else:        print("positiv")</code></pre>

  <h3>Functions</h3>
  <p>A function packages code you need more than once. <code>def</code> defines it, <code>return</code> gives back the result.</p>
  <figure class="fig"><svg viewBox="0 0 360 108" role="img" aria-label="A function takes parameters and returns a result with return"><rect class="d-box" x="6" y="18" width="100" height="28" rx="6"/><text class="d-t" style="font-size:12px" x="56.0" y="32.0">preis = 100</text><rect class="d-box" x="6" y="58" width="100" height="28" rx="6"/><text class="d-t" style="font-size:12px" x="56.0" y="72.0">satz = 0.081</text><line class="d-arr" x1="108" y1="32" x2="130" y2="44"/><line class="d-arr" x1="108" y1="72" x2="130" y2="60"/><rect class="d-hl" x="134" y="14" width="140" height="76" rx="8"/><text class="d-tb" x="204" y="36" style="font-size:12.5px">preis_mit_mwst()</text><text class="d-t" x="204" y="64" style="font-size:10.5px">return preis*(1+satz)</text><line class="d-arrb" x1="276" y1="52" x2="292" y2="52"/><rect class="d-ok" x="294" y="36" width="58" height="32" rx="6"/><text class="d-t" x="323.0" y="52.0">108.1</text><text class="d-m d-ml" x="6" y="104">Input (parameters)</text><text class="d-m" x="323" y="84">Output</text><text class="d-m" x="323" y="97">(return)</text></svg><figcaption>A function is a box: values in, result out. Without <code>return</code> you get <code>None</code> back.</figcaption></figure>
  <pre><code>def preis_mit_mwst(preis, satz=0.081):
    return preis * (1 + satz)

preis_mit_mwst(100)    # 108.1</code></pre>

  <h3>Imports</h3>
  <pre><code>import numpy                  # whole library
import pandas as pd           # with a short name (convention)
from sklearn import metrics   # only one part</code></pre>

  <h3>The «functional» tools</h3>
  <p>These are the things that confuse at first. Really they are just shortcuts for loops.</p>
  <div class="tablewrap"><table>
    <tr><th>Tool</th><th>What it does</th><th>Example</th></tr>
    <tr><td><code>lambda</code></td><td>mini function without a name</td><td><code>lambda x: x * 2</code></td></tr>
    <tr><td><code>map(f, liste)</code></td><td>applies <code>f</code> to every element</td><td><code>list(map(lambda x: x*2, [1,2,3]))</code> → <code>[2,4,6]</code></td></tr>
    <tr><td><code>filter(f, liste)</code></td><td>keeps elements for which <code>f</code> gives <code>True</code></td><td><code>list(filter(lambda x: x&gt;1, [1,2,3]))</code> → <code>[2,3]</code></td></tr>
    <tr><td><code>zip(a, b)</code></td><td>pairs up elements from two lists</td><td><code>list(zip([1,2],["a","b"]))</code> → <code>[(1,'a'),(2,'b')]</code></td></tr>
  </table></div>
  <figure class="fig"><svg viewBox="0 0 360 224" role="img" aria-label="Three tools: map applies, filter keeps, zip pairs"><rect class="d-box" x="14" y="14" width="28" height="26" rx="6"/><text class="d-t" x="28.0" y="27.0">1</text><rect class="d-box" x="46" y="14" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="27.0">2</text><rect class="d-box" x="78" y="14" width="28" height="26" rx="6"/><text class="d-t" x="92.0" y="27.0">3</text><line class="d-arrb" x1="116" y1="27" x2="208" y2="27"/><text class="d-m" x="162" y="17">map(× 2)</text><rect class="d-ok" x="214" y="14" width="28" height="26" rx="6"/><text class="d-t" x="228.0" y="27.0">2</text><rect class="d-ok" x="246" y="14" width="28" height="26" rx="6"/><text class="d-t" x="260.0" y="27.0">4</text><rect class="d-ok" x="278" y="14" width="28" height="26" rx="6"/><text class="d-t" x="292.0" y="27.0">6</text><rect class="d-dim" x="14" y="90" width="28" height="26" rx="6"/><text class="d-tm" x="28.0" y="103.0">1</text><rect class="d-box" x="46" y="90" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="103.0">2</text><rect class="d-box" x="78" y="90" width="28" height="26" rx="6"/><text class="d-t" x="92.0" y="103.0">3</text><line class="d-arrb" x1="116" y1="103" x2="208" y2="103"/><text class="d-m" x="162" y="93">filter(&gt; 1)</text><rect class="d-ok" x="214" y="90" width="28" height="26" rx="6"/><text class="d-t" x="228.0" y="103.0">2</text><rect class="d-ok" x="246" y="90" width="28" height="26" rx="6"/><text class="d-t" x="260.0" y="103.0">3</text><rect class="d-box" x="14" y="162" width="28" height="26" rx="6"/><text class="d-t" x="28.0" y="175.0">1</text><rect class="d-box" x="46" y="162" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="175.0">2</text><rect class="d-warn" x="14" y="192" width="28" height="26" rx="6"/><text class="d-t" x="28.0" y="205.0">a</text><rect class="d-warn" x="46" y="192" width="28" height="26" rx="6"/><text class="d-t" x="60.0" y="205.0">b</text><line class="d-arrb" x1="116" y1="190" x2="198" y2="190"/><text class="d-m" x="157" y="180">zip(…)</text><rect class="d-ok" x="206" y="177" width="62" height="26" rx="6"/><text class="d-t" x="237.0" y="190.0">(1,a)</text><rect class="d-ok" x="274" y="177" width="62" height="26" rx="6"/><text class="d-t" x="305.0" y="190.0">(2,b)</text></svg><figcaption><code>map</code> changes every element, <code>filter</code> throws some out (the dashed box drops away), <code>zip</code> puts two lists side by side in pairs.</figcaption></figure>

  <h3>Comprehensions: the loop in one line</h3>
  <pre><code># long:
quadrate = []
for x in range(5):
    if x % 2 == 0:
        quadrate.append(x * x)

# short (list comprehension):  [expression  for x in ...  if condition]
quadrate = [x * x for x in range(5) if x % 2 == 0]   # [0, 4, 16]

# Dictionary comprehension
{x: x * x for x in range(3)}                          # {0:0, 1:1, 2:4}</code></pre>
    <figure class="fig"><svg viewBox="0 0 360 176" role="img" aria-label="A list comprehension in three steps: source, filter, compute"><text class="d-m d-ml" x="6" y="24">Source</text><text class="d-t d-ml" style="font-size:11px" x="6" y="38">range(5)</text><text class="d-m d-ml" x="6" y="80">Filter</text><text class="d-t d-ml" style="font-size:11px" x="6" y="94">if x % 2 == 0</text><text class="d-m d-ml" x="6" y="136">Compute</text><text class="d-t d-ml" style="font-size:11px" x="6" y="150">x * x</text><rect class="d-box" x="96" y="14" width="42" height="28" rx="6"/><text class="d-t" x="117.0" y="28.0">0</text><rect class="d-hl" x="96" y="70" width="42" height="28" rx="6"/><text class="d-t" x="117.0" y="84.0">0</text><line class="d-arr" x1="117" y1="44" x2="117" y2="68"/><line class="d-arr" x1="117" y1="100" x2="117" y2="124"/><rect class="d-ok" x="96" y="126" width="42" height="28" rx="6"/><text class="d-t" x="117.0" y="140.0">0</text><rect class="d-box" x="148" y="14" width="42" height="28" rx="6"/><text class="d-t" x="169.0" y="28.0">1</text><rect class="d-dim" x="148" y="70" width="42" height="28" rx="6"/><text class="d-tm" x="169.0" y="84.0">1</text><line class="d-arr" x1="169" y1="44" x2="169" y2="68"/><rect class="d-box" x="200" y="14" width="42" height="28" rx="6"/><text class="d-t" x="221.0" y="28.0">2</text><rect class="d-hl" x="200" y="70" width="42" height="28" rx="6"/><text class="d-t" x="221.0" y="84.0">2</text><line class="d-arr" x1="221" y1="44" x2="221" y2="68"/><line class="d-arr" x1="221" y1="100" x2="221" y2="124"/><rect class="d-ok" x="200" y="126" width="42" height="28" rx="6"/><text class="d-t" x="221.0" y="140.0">4</text><rect class="d-box" x="252" y="14" width="42" height="28" rx="6"/><text class="d-t" x="273.0" y="28.0">3</text><rect class="d-dim" x="252" y="70" width="42" height="28" rx="6"/><text class="d-tm" x="273.0" y="84.0">3</text><line class="d-arr" x1="273" y1="44" x2="273" y2="68"/><rect class="d-box" x="304" y="14" width="42" height="28" rx="6"/><text class="d-t" x="325.0" y="28.0">4</text><rect class="d-hl" x="304" y="70" width="42" height="28" rx="6"/><text class="d-t" x="325.0" y="84.0">4</text><line class="d-arr" x1="325" y1="44" x2="325" y2="68"/><line class="d-arr" x1="325" y1="100" x2="325" y2="124"/><rect class="d-ok" x="304" y="126" width="42" height="28" rx="6"/><text class="d-t" x="325.0" y="140.0">16</text><text class="d-m" x="223" y="170">Result: [0, 4, 16]</text></svg><figcaption>The comprehension is a conveyor belt: numbers come out of <code>range(5)</code>, the filter only lets even ones through, and at the end they are squared.</figcaption></figure>
  <p>Reading from back to front helps: «For every x in range(5), if even, take x times x.»</p>

  <h3>Files</h3>
  <pre><code>with open("file.txt", "r") as f:   # r = read, w = write, a = append
    text = f.read()</code></pre>

  <h3>Catching errors: try and except</h3>
  <p>When code can go wrong (file missing, division by 0, text instead of a number), Python stops with an error. With <code>try</code>/<code>except</code> you catch the error and react, instead of crashing.</p>
  <pre><code>try:
    zahl = int("abc")        # this goes wrong
except ValueError:
    print("Das war keine Zahl")   # execution continues here</code></pre>

  <h3>Environments: where your packages live</h3>
  <p>You do not install packages like Pandas «into Python», but into an <b>environment</b> per project. That way projects with different versions do not get in each other's way. Presented in the course: Anaconda/Miniconda, <code>pip</code> with <code>venv</code>, and the newer <code>uv</code>.</p>
  <pre><code>python -m venv .venv            # create the environment (once)
.venv\Scripts\activate          # activate (Windows)
pip install pandas matplotlib   # install packages into this environment</code></pre>
  <div class="merk"><b>For this repo</b><p>The environment lives as <code>.venv</code> in the repo (kernel «CAS ML HS26»). In VS Code, choose this kernel at the top right when you open a notebook; the packages are listed in <code>requirements.txt</code>.</p></div>
  <div class="merk"><b>Key takeaway</b><p>Lists are mutable, tuples are not. You find things in dicts by key, not by position. You will need this all the time later, because at its core a DataFrame is a dict of columns.</p></div>`,
  quiz: [
    { q: `What does <code>l[1:3]</code> return if <code>l = [10, 20, 30, 40]</code>?`, a: `<code>[20, 30]</code>. Counting starts at 0, and the end (index 3) is not included.` },
    { q: `What is the difference between a list and a tuple?`, a: `A list is mutable, a tuple is not. Both are ordered.` },
    { q: `What does <code>[x * x for x in range(5) if x % 2 == 0]</code> give?`, a: `<code>[0, 4, 16]</code>: the squares of the even numbers 0, 2 and 4.` },
  ],
});
