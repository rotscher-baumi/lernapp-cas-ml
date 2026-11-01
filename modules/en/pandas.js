/* English texts for the module "pandas" (Pandas). Fields replace the German ones when the language is EN. */
LernApp.translate('pandas', {
  nav: 'Pandas',
  title: `Pandas: Excel, but programmable`,
  kicker: `Module 1 · Friday 16.10 and Saturday 17.10`,
  summary: `DataFrame, filters, groupby, merge`,
  html: `  <p>Pandas is the library for tables. Rows are observations (a customer, a sale), columns are variables (age, price). It is the most important tool for cleaning and preparing data.</p>

  <h3>Series and DataFrame</h3>
  <ul>
    <li><b>Series</b>: a single column, one-dimensional, with an index (the labels on the left).</li>
    <li><b>DataFrame</b>: the whole table. Every column is a Series.</li>
  </ul>
  <pre><code>import pandas as pd

s  = pd.Series([10, 34, 623, 32])
df = pd.read_csv("customers.csv")      # load a file
df2 = pd.DataFrame({"name": ["Ana", "Ben"], "alter": [31, 45]})</code></pre>

  <h3>Look first, then work</h3>
  <pre><code>df.head()       # first 5 rows
df.shape        # (rows, columns)
df.info()       # columns, types, number of non-empty values
df.describe()   # min, max, mean, quartiles
df.sample(10, random_state=42)   # 10 random rows, reproducible</code></pre>
  <div class="falle"><b>Pitfall</b><p><code>head()</code> often shows only one corner of the data (e.g. everything from the same neighbourhood). <code>sample()</code> is more honest.</p></div>

  <h3>Selecting and filtering</h3>
  <pre><code>df["alter"]                 # one column (Series)
df[["name", "alter"]]       # several columns (DataFrame)
df.loc[0, "name"]           # by label: row 0, column "name"
df.iloc[0, 1]               # by position: 1st row, 2nd column

maske = df["alter"] &gt; 40    # True/False per row = "Boolean Mask"
df[maske]                   # only the rows with True
df_gross = df[df["alter"] &gt; 40].copy()   # .copy() = its own, independent table</code></pre>
  <p><code>loc</code> asks for <b>names</b>, <code>iloc</code> for <b>positions</b>. The mask is like a sieve: only what is <code>True</code> gets through.</p>

  <h3>New columns, types, sorting</h3>
  <pre><code>df["preis_pro_m2"] = df["preis"] / df["flaeche"]     # new column from a calculation
df["datum"] = pd.to_datetime(df["datum"])            # text to a real date
df["monat"] = df["datum"].dt.month                   # part of a date
df.sort_values("preis", ascending=False)             # sort
df["stadt"].value_counts()                           # how often does each value occur?</code></pre>

  <h3>Missing values</h3>
  <pre><code>df.isna().sum()                     # empty values per column
df = df.dropna(subset=["preis"])    # drop rows where "preis" is missing
df["alter"] = df["alter"].fillna(df["alter"].median())   # fill in (assign the result!)</code></pre>
  <div class="falle"><b>Pitfall from the NYC notebook</b><p>Each column is missing only about 5 percent. But in <i>different</i> rows. A blanket <code>dropna()</code> therefore throws away around 43 percent of all rows. Better: only drop where the column is really needed.</p></div>

  <h3>groupby: grouping and summarising</h3>
  <p>The idea in three steps: <b>split</b> by a column, <b>compute</b> per group, <b>combine</b>.</p>
  <pre><code>df.groupby("stadt")["preis"].mean()                    # average per city
df.groupby("jahr")["preis"].agg(["count", "sum", "mean", "median"])</code></pre>
  <div class="falle"><b>Pitfall</b><p><code>df.groupby("jahr").sum()</code> adds up <i>all</i> columns, postcodes too. Select the column you really mean first.</p></div>

  <h3>merge: joining tables</h3>
  <p>Two tables share a column (the key). With <code>pd.merge(a, b, on="schluessel", how=...)</code> you join them. The argument <code>how</code> decides what happens to keys that occur in only one table. Try it out:</p>

  <div class="demo" id="mergeDemo">
    <div class="tag">Demo</div><h4>Types of merge</h4>
    <div id="mergeTables"></div>
    <div class="btnrow" id="mergeBtns" role="group" aria-label="Type of merge">
      <button data-how="inner" class="pri">inner</button><button data-how="left">left</button><button data-how="right">right</button><button data-how="outer">outer</button>
    </div>
    <p class="hint" id="mergeText"></p>
    <div class="tablewrap"><table id="mergeResult"></table></div>
  </div>
  <div class="tablewrap"><table>
    <tr><th>how=</th><th>Keeps</th><th>When to use?</th></tr>
    <tr><td><code>inner</code></td><td>only keys from both</td><td>a row is only useful with both pieces of information</td></tr>
    <tr><td><code>left</code></td><td>all from the left table</td><td>enrich the main table (most common)</td></tr>
    <tr><td><code>right</code></td><td>all from the right table</td><td>like left, just swapped</td></tr>
    <tr><td><code>outer</code></td><td>all from both</td><td>see everything, e.g. when debugging</td></tr>
  </table></div>
  <pre><code>pd.merge(df1, df2, on="property_id", how="inner", validate="one_to_one")
# indicator=True adds a column _merge: both / left_only / right_only</code></pre>
  <p>Useful: <code>validate="one_to_one"</code> stops if a key occurs twice. <code>indicator=True</code> shows where each row came from.</p>

  <h3>Your own categories: map and pd.cut</h3>
  <pre><code>bins   = [-float("inf"), 500, 3500, 10000, float("inf")]
labels = ["cheap", "normal", "expensive", "super expensive"]
df["kategorie"] = pd.cut(df["preis_pro_sqft"], bins=bins, labels=labels)</code></pre>
  <p><code>pd.cut</code> sorts numbers into bins. The result is an <i>ordered</i> category, so charts follow the right order.</p>

  <h3>What the NYC analysis teaches you</h3>
  <p>The live coding was not just technique, but also training in thinking. These four lessons are at least as important as the commands:</p>
  <ol>
    <li><b>Mean versus median:</b> in Manhattan the average price was about 15.8 million, the median 5.65 million. A few huge deals pull the mean up. With skewed data, the median is the typical «normal».</li>
    <li><b>Placeholder zeros:</b> <code>YEAR BUILT = 0</code> means «unknown», not «year zero». <code>describe()</code> shows this in the min row.</li>
    <li><b>A proxy is not the truth:</b> a sale price of 0 dollars was interpreted as «parents to children». That is an assumption; it could also be a divorce or an estate.</li>
    <li><b>Fair comparison:</b> 2017 «won» because it had 8 months in the data, 2016 only 4. Calculated per month, the picture flips.</li>
  </ol>
  <div class="merk"><b>Key takeaway</b><p>First the question, then check the data (<code>info</code>, <code>describe</code>, <code>isna</code>), then compute. Clean code with a wrong assumption still gives a wrong result.</p></div>`,
  notebooks: [{ file: 'Python_Pandas_Uebungen_own.ipynb', desc: `12 exercises with real Pandas: lists, comprehensions, filters, groupby, merge, dates, pd.cut and a chart.` }],
  quiz: [
    { q: `What is the difference between <code>loc</code> and <code>iloc</code>?`, a: `<code>loc</code> selects by labels (index and column names), <code>iloc</code> by positions (0, 1, 2 …).` },
    { q: `You join two tables and do not want to lose any row of the main table. Which <code>how</code>?`, a: `<code>left</code>, with the main table on the left. Missing partners become NaN.` },
    { q: `Why is the median often better than the mean for house prices?`, a: `A few very expensive properties pull the mean up. The median is robust against outliers.` },
    { q: `Why does <code>df.groupby("jahr").sum()</code> often give nonsense?`, a: `It sums all columns, including meaningless ones such as postcodes. Select the column you want first: <code>df.groupby("jahr")["preis"].sum()</code>.` },
  ],
});
