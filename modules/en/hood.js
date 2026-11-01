/* English texts for the module "hood" (Pandas under the hood). Fields replace the German ones when the language is EN. */
LernApp.translate('hood', {
  nav: 'Under the hood',
  title: `Pandas under the hood`,
  kicker: `Module 1 · Deep dive`,
  summary: `NumPy, view and copy, Arrow`,
  html: `  <p>This chapter explains <i>why</i> Pandas is fast and why some error messages appear. It is a deep dive: if you have enough to do otherwise, skip it for now.</p>

  <h3>A column is an array in memory</h3>
  <p>A numeric column is a <b>NumPy array</b>: many numbers of the same type, stored right next to each other in memory. A Python list, by contrast, only contains references (pointers) to individual objects scattered somewhere.</p>
  <div class="grid2">
    <div><h4>Python list</h4><p>Each element is its own object (around 28 bytes per number). Flexible, but slow and heavy.</p></div>
    <div><h4>NumPy array</h4><p>Raw numbers, one type, packed without gaps (e.g. 8 bytes per <code>int64</code>). Fast and compact.</p></div>
  </div>
  <p>NumPy is fast for three reasons: a compiled C loop instead of a Python loop, contiguous memory with a fixed type, and SIMD (the CPU computes several numbers at once with one instruction). In the course example, <code>x * 2</code> was around 70 times faster than the list loop (measured on one computer, yours will give different numbers).</p>
  <div class="merk"><b>Key takeaway</b><p>«Vectorised» (<code>x * 2</code>) is fast, <code>.apply()</code> and Python loops are slow.</p></div>

  <h3>dtype: the type determines the size</h3>
  <pre><code>a = np.array([1, 2, 3, 4, 5])   # int64: 8 bytes per value = 40 bytes
a.astype(np.int8)               # 1 byte per value = 5 bytes, but only -128 to 127!</code></pre>

  <h3>Broadcasting</h3>
  <p>Arrays with different shapes are «stretched» to fit, without copying. Rule: align the shapes from the right, each dimension must be equal or 1.</p>
  <pre><code>col = np.array([[0], [10], [20]])   # shape (3, 1)
row = np.array([1, 2, 3])           # shape (3,)
col + row   # [[ 1, 2, 3],
            #  [11,12,13],
            #  [21,22,23]]</code></pre>

  <h3>View or copy?</h3>
  <p>A <b>view</b> is a new window onto the same data: if you change the view, the original changes. A <b>copy</b> has its own data.</p>
  <div class="tablewrap"><table>
    <tr><th>Code</th><th>Result</th><th>Why</th></tr>
    <tr><td><code>a[1:4]</code></td><td>View</td><td>normal slice</td></tr>
    <tr><td><code>a[::2]</code></td><td>View</td><td>a step size is also a slice</td></tr>
    <tr><td><code>a[[0, 2, 4]]</code></td><td>Copy</td><td>an index list (fancy indexing) always copies, whatever the positions</td></tr>
    <tr><td><code>a[a &gt; 2]</code></td><td>Copy</td><td>a mask collects the values anew</td></tr>
    <tr><td><code>a[:4].reshape(2, 2)</code></td><td>View</td><td>just a different shape, same bytes (if possible, otherwise a copy)</td></tr>
  </table></div>
  <p>Pandas 3 uses <b>Copy-on-Write</b>: every result behaves like a copy. That is why chained assignment such as <code>df["preis"][0] = 100</code> no longer changes <code>df</code>. Write with a single <code>loc</code>:</p>
  <pre><code>df.loc[0, "preis"] = 100</code></pre>

  <h3>Strings and Arrow</h3>
  <p>Text columns used to be <code>object</code>: a list of pointers to individual Python strings (slow, lots of memory). Pandas 3 stores text (if pyarrow is installed) with <b>Apache Arrow</b> in three blocks: a bit field for «missing», positions where each text starts, and all the characters one after another. In the course example, one million strings needed 13.5 MB instead of 58.3 MB.</p>
  <p><b>Parquet</b> is the matching file format on disk: stored column by column, compressed, with a schema. You only read the columns you need.</p>`,
  quiz: [
    { q: `Why is <code>x * 2</code> on a NumPy array so much faster than a Python loop?`, a: `A compiled loop, contiguous memory with a fixed type, and SIMD. There are no objects and no type check per element.` },
    { q: `Is <code>a[[0, 2, 4]]</code> a view or a copy?`, a: `A copy: indexing with a list (fancy indexing) always copies, even if the positions are evenly spaced. <code>a[::2]</code>, on the other hand, is a view.` },
  ],
});
