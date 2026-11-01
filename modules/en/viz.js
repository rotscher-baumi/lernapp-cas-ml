/* English texts for the module "viz" (Charts). Fields replace the German ones when the language is EN. */
LernApp.translate('viz', {
  nav: 'Charts',
  title: `Charts: Matplotlib and Seaborn`,
  kicker: `Module 1 · Saturday 17.10`,
  summary: `Which chart for which question`,
  html: `  <p>Good charts start before the code: first the question, then the chart type.</p>

  <div class="demo" id="chartPick">
    <div class="tag">Demo</div><h4>Which chart fits my question?</h4>
    <label for="qsel" class="hint" style="display:block">My question is:</label>
    <select id="qsel" style="max-width:100%">
      <option value="0">Which category is the largest?</option>
      <option value="1">How does something change over time?</option>
      <option value="2">Are two numbers related?</option>
      <option value="3">How are the values of one variable distributed?</option>
      <option value="4">How do I compare the distributions of several groups?</option>
      <option value="5">How is a whole made up?</option>
    </select>
    <p id="qout" style="margin-top:12px"></p>
  </div>

  <h3>Matplotlib: Figure and Axes</h3>
  <p>A <b>Figure</b> is the whole canvas. On it sit one or more <b>Axes</b>, which are the individual plots. You always draw on a specific Axes. This is the «object-oriented style» the course uses.</p>
  <pre><code>import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 5))       # canvas + one plot
ax.plot(temps["month"], temps["Luzern"], label="Luzern", marker="o")
ax.set_title("Temperatur Luzern vs Lugano")   # title
ax.set_xlabel("Monat")
ax.set_ylabel("Temperatur (°C)")              # do not forget the unit
ax.legend()
ax.spines[["top", "right"]].set_visible(False)   # tidy up the frame
fig.tight_layout()
fig.savefig("temp.png", dpi=150)
plt.show()</code></pre>
  <p>Several plots: <code>fig, axes = plt.subplots(2, 2)</code> gives you a 2×2 grid, and you draw with <code>axes[0, 1].bar(...)</code> and so on.</p>

  <h3>Typical commands per chart type</h3>
  <div class="tablewrap"><table>
    <tr><th>Chart</th><th>Matplotlib</th><th>Seaborn</th></tr>
    <tr><td>Line</td><td><code>ax.plot(x, y)</code></td><td><code>sns.lineplot(data=df, x=, y=, hue=)</code></td></tr>
    <tr><td>Bar</td><td><code>ax.bar(x, h)</code> / <code>ax.barh</code></td><td><code>sns.barplot(...)</code></td></tr>
    <tr><td>Scatter</td><td><code>ax.scatter(x, y)</code></td><td><code>sns.scatterplot(...)</code></td></tr>
    <tr><td>Histogram</td><td><code>ax.hist(werte, bins=10)</code></td><td><code>sns.histplot(x=werte, kde=True)</code></td></tr>
    <tr><td>Boxplot</td><td><code>ax.boxplot(...)</code></td><td><code>sns.boxplot(...)</code></td></tr>
    <tr><td>Pie</td><td><code>ax.pie(werte)</code></td><td>(deliberately none)</td></tr>
  </table></div>

  <h3>Seaborn: less code, DataFrame directly</h3>
  <p>Seaborn builds on Matplotlib. You pass the DataFrame and column names; <code>hue="stadt"</code> colours by group and creates the legend. Everything from Matplotlib (<code>ax.set_title</code> etc.) still works.</p>
  <p>Seaborn likes <b>long (tidy) data</b>: one row per observation, one column per variable. You convert wide tables with <code>melt</code>:</p>
  <pre><code># wide: month | Luzern | Lugano
lang = temps.melt(id_vars="month", var_name="city", value_name="temperature")
# long:  month | city | temperature      (24 rows instead of 12)
sns.lineplot(data=lang, x="month", y="temperature", hue="city")</code></pre>

  <h3>The most important design rules</h3>
  <ul>
    <li>The title says <b>what</b> you see (ideally the message), the axes carry <b>units</b>.</li>
    <li>Bars start at <b>zero</b>. A truncated axis makes 720 versus 290 look like a multiple.</li>
    <li>Less is more: no 3D, little grid, few colours, each with a job.</li>
    <li>Pie charts only for a few parts. For comparing, <b>bars</b> are better, because we compare lengths better than angles.</li>
    <li>Avoid red-green and never show meaning through colour alone (line style, marker, label).</li>
    <li>A scatter plot shows: relationship is not cause (<i>correlation ≠ causation</i>).</li>
    <li>Histogram: the number of <code>bins</code> changes the story, try several.</li>
  </ul>

  <div class="merk"><b>Key takeaway</b><p>Question first, then chart. After that: title, axes with units, zero baseline, tidy up.</p></div>`,
  quiz: [
    { q: `When is a pie chart not a good choice?`, a: `With many parts, or when you want to compare or rank precisely. We read lengths (bars) better than angles.` },
    { q: `Why should bars start at zero?`, a: `A truncated axis exaggerates differences. In the course example, 720 versus 290 looked like twelve times as much instead of 2.5 times.` },
  ],
});
