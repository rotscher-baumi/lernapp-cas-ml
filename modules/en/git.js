/* English texts for the module "git" (Git). Fields replace the German ones when the language is EN. */
LernApp.translate('git', {
  nav: 'Git',
  title: `Git: versions of your work`,
  kicker: `Module 1 · Friday 16.10`,
  summary: `3 states, 5 commands`,
  html: `  <p>Git stores a <b>snapshot</b> of your files with every commit. You can go back to an older version, work in parallel with several people and see who changed what, when and why. GitHub and GitLab are just websites that host Git repositories (HSLU uses GitLab, your study repo lives on GitHub).</p>

  <h3>The three states</h3>
  <div class="steps">
    <div class="st"><b>Working directory</b><span>This is where you edit files.</span></div><div class="ar">git add →</div>
    <div class="st"><b>Staging</b><span>Changes that should go into the next snapshot.</span></div><div class="ar">git commit →</div>
    <div class="st"><b>Repository</b><span>The .git folder with the entire history.</span></div>
  </div>
  <p>Think of a photo shoot: you set things up (working directory), choose who should be in the picture (staging) and then press the shutter (commit).</p>
  <pre><code>git clone URL          # get a copy of a repo
git status             # What has changed?
git add datei.py       # mark one file for staging
git add .              # mark everything
git commit -m "Text"   # save a snapshot</code></pre>
  <div class="falle"><b>Pitfall</b><p>A commit only saves what is in staging. If you forgot <code>git add</code>, the file is missing from the snapshot. With <code>git status</code> you see this at once.</p></div>`,
  quiz: [
    { q: `What is the difference between <code>git add</code> and <code>git commit</code>?`, a: `<code>git add</code> puts changes into staging (marks them). <code>git commit</code> saves everything in staging as a snapshot in the history.` },
  ],
});
