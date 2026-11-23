/*
 * Quiz chapter: asks the self-test questions of all chapters with spaced repetition (Leitner, five boxes),
 * offers a blank-page recall per chapter and shows the progress. No questions of its own: the cards come
 * from the quiz field of the other chapters. Code: assets/demos-quiz.js (LernApp.demos.quiz).
 * Translated in place: every text is t('deutsch', 'english') via LernApp.t.
 */
(function () {
  const t = LernApp.t;

  LernApp.register({
    id: 'quiz',
    order: 96,
    nav: 'Quiz',
    title: t('Quiz: abfragen, wiederholen, leeres Blatt', 'Quiz: recall, repeat, blank page'),
    kicker: t('Wiederholen · alle Kapitel', 'Revision · all chapters'),
    summary: t('Die Selbsttest-Fragen aller Kapitel gemischt abfragen, mit Wiederholung nach Plan (1, 3, 7, 14, 30 Tage), ein Kapitel aus dem Kopf aufschreiben und vergleichen, Fortschritt pro Kapitel', 'The self-test questions of all chapters mixed, with repetitions on a schedule (1, 3, 7, 14, 30 days), write a chapter down from memory and compare, progress per chapter'),
    html: `
  <p>${t('Am meisten bleibt hängen, wenn du den Stoff aktiv aus dem Kopf holst, statt ihn nochmals zu lesen (Retrieval Practice). Dieses Kapitel fragt dich die Selbsttest-Fragen aller Kapitel ab, gemischt über die Themen, und plant die Wiederholungen: Was du sicher weisst, kommt seltener, was du nicht weisst, bald wieder.', 'What sticks best is what you pull out of your head actively instead of reading it again (retrieval practice). This chapter asks you the self-test questions of all chapters, mixed across topics, and schedules the repetitions: what you know well comes back less often, what you don’t know comes back soon.')}</p>

  <h3 id="quiz-ablauf">${t('Der ganze Ablauf auf einen Blick', 'The whole workflow at a glance')}</h3>
  <div class="steps">
    <div class="st"><b>1 · ${t('Abrufen', 'Recall')}</b><span>${t('Frage lesen, Antwort im Kopf oder ins Feld schreiben.', 'Read the question, answer in your head or type it.')}</span></div>
    <div class="ar">→</div>
    <div class="st"><b>2 · ${t('Aufdecken', 'Reveal')}</b><span>${t('Lösung zeigen und mit deiner Antwort vergleichen.', 'Show the answer and compare it with yours.')}</span></div>
    <div class="ar">→</div>
    <div class="st"><b>3 · ${t('Bewerten', 'Rate')}</b><span>${t('Ehrlich: nicht gewusst, knapp oder sicher.', 'Honestly: didn’t know, barely or knew it.')}</span></div>
    <div class="ar">→</div>
    <div class="st"><b>4 · ${t('Wiederholen', 'Repeat')}</b><span>${t('Die App legt fest, wann die Frage wiederkommt.', 'The app decides when the question comes back.')}</span></div>
  </div>

  <h3 id="quiz-abfrage">${t('Abfrage mit Wiederholung', 'Recall with repetition')}</h3>
  <div class="demo qz" id="qzTrain">
    <div id="qzSetup">
      <p class="qz-summary" id="qzSummary"></p>
      <details class="qz-filter">
        <summary>${t('Kapitel auswählen', 'Choose chapters')}</summary>
        <div class="qz-chips" id="qzChapters"></div>
        <div class="btnrow"><button type="button" id="qzAll">${t('Alle', 'All')}</button><button type="button" id="qzNone">${t('Keine', 'None')}</button></div>
      </details>
      <div class="btnrow">
        <label>${t('Neue Fragen pro Runde', 'New questions per round')}
          <select id="qzNew"><option value="0">0</option><option value="5">5</option><option value="10">10</option><option value="20">20</option><option value="-1">${t('alle', 'all')}</option></select>
        </label>
      </div>
      <div class="btnrow">
        <button type="button" class="pri" id="qzStart"></button>
        <button type="button" id="qzPractice">${t('Freies Üben (20 gemischt)', 'Free practice (20 mixed)')}</button>
      </div>
      <p class="qz-done" id="qzDone" hidden></p>
    </div>
    <div class="qz-card" id="qzCard" hidden>
      <div class="qz-meta" id="qzMeta"></div>
      <div class="qz-track"><div class="qz-bar" id="qzBar"></div></div>
      <p class="qz-box" id="qzBox"></p>
      <div class="qz-q" id="qzQ"></div>
      <textarea id="qzOwn" rows="3" placeholder="${t('Deine Antwort (optional)', 'Your answer (optional)')}" aria-label="${t('Deine Antwort', 'Your answer')}"></textarea>
      <div id="qzChoice" hidden><p class="qor">${t('Oder wähle:', 'Or pick one:')}</p><div class="qopts" id="qzOpts"></div></div>
      <div class="btnrow"><button type="button" class="pri" id="qzShow">${t('Lösung zeigen', 'Show answer')} <kbd>${t('Leertaste', 'Space')}</kbd></button></div>
      <div class="qz-ans" id="qzAns" hidden>
        <div class="qz-mine" id="qzMine" hidden><b>${t('Deine Antwort', 'Your answer')}</b><p id="qzMineText"></p><div id="qzCheck"></div></div>
        <div class="qz-a"><b>${t('Lösung', 'Answer')}</b><div id="qzA"></div></div>
        <p><a id="qzLink" href="#quiz"></a></p>
      </div>
      <div class="qz-rate" id="qzRate" hidden>
        <button type="button" class="qz-again" id="qzRagain"></button>
        <button type="button" class="qz-hard" id="qzRhard"></button>
        <button type="button" class="qz-good" id="qzRgood"></button>
      </div>
      <div class="btnrow"><button type="button" id="qzStop">${t('Runde abbrechen', 'Stop round')}</button></div>
    </div>
  </div>
  <p class="note">${t('Tasten: Leertaste oder Enter zeigt die Lösung (im Antwortfeld Ctrl+Enter), 1, 2, 3 bewerten. Was du nicht wusstest, kommt am Ende der Runde ein zweites Mal.', 'Keys: Space or Enter shows the answer (Ctrl+Enter in the answer field), 1, 2, 3 rate it. What you didn’t know comes once more at the end of the round.')}</p>

  <h3 id="quiz-plan">${t('So plant die App die Wiederholungen', 'How the app schedules repetitions')}</h3>
  <p>${t('Jede Frage liegt in einem von fünf Fächern (Leitner-System). Neue Fragen haben noch kein Fach. Deine Bewertung entscheidet, wohin die Frage wandert und wann sie wieder fällig ist:', 'Every question sits in one of five boxes (Leitner system). New questions have no box yet. Your rating decides where the question goes and when it is due again:')}</p>
  <div class="tablewrap"><table>
    <thead><tr><th>${t('Fach', 'Box')}</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>
    <tbody><tr><td>${t('Wieder fällig nach', 'Due again after')}</td><td>${t('1 Tag', '1 day')}</td><td>${t('3 Tagen', '3 days')}</td><td>${t('7 Tagen', '7 days')}</td><td>${t('14 Tagen', '14 days')}</td><td>${t('30 Tagen', '30 days')}</td></tr></tbody>
  </table></div>
  <ul>
    <li>${t('<b>Nicht gewusst:</b> zurück in Fach 1, morgen wieder fällig.', '<b>Didn’t know:</b> back to box 1, due again tomorrow.')}</li>
    <li>${t('<b>Knapp:</b> bleibt im Fach (eine neue Frage kommt in Fach 1).', '<b>Barely:</b> stays in its box (a new question goes to box 1).')}</li>
    <li>${t('<b>Sicher:</b> ein Fach weiter, also längerer Abstand (eine neue Frage, die du sofort weisst, kommt in Fach 2).', '<b>Knew it:</b> one box up, so a longer gap (a new question you know at once goes to box 2).')}</li>
  </ul>
  <p>${t('Eine Runde enthält alle fälligen Fragen der gewählten Kapitel und dazu einige neue. Die Kapitel kommen gemischt, nie zweimal dasselbe hintereinander, solange andere übrig sind. Gemischtes Üben ist anstrengender, trainiert aber genau das, was die Prüfung verlangt: zu erkennen, welches Verfahren zu einer Frage passt. «Freies Üben» fragt 20 Fragen ausserhalb des Plans ab und ändert die Fächer nicht.', 'A round contains all due questions of the chosen chapters plus a few new ones. The chapters come mixed, never the same twice in a row while others are left. Mixed practice is harder but trains exactly what the exam asks for: recognising which method fits a question. “Free practice” asks 20 questions outside the schedule and does not change the boxes.')}</p>
  <div class="merk"><b>${t('Merksatz', 'Key point')}</b><p>${t('Erst antworten, dann aufdecken, dann ehrlich bewerten. Ein «Sicher», das nur «kommt mir bekannt vor» war, schiebt die Frage zu weit weg.', 'Answer first, then reveal, then rate honestly. A “knew it” that was only “looks familiar” pushes the question too far away.')}</p></div>

  <h3 id="quiz-blatt">${t('Leeres Blatt', 'Blank page')}</h3>
  <p>${t('Wähle ein Kapitel und schreib alles auf, was du dazu weisst, hier im Feld oder auf Papier (Formeln und Skizzen gehen von Hand besser). Dann vergleichst du mit den Abschnitten und Merksätzen des Kapitels und hakst ab, was du hattest. Was fehlt, liest du über den Pfeil nach.', 'Choose a chapter and write down everything you know about it, here in the field or on paper (formulas and sketches work better by hand). Then compare with the chapter’s sections and key points and tick what you had. Follow the arrow to read up on what is missing.')}</p>
  <div class="demo qz" id="qzBlank">
    <div class="btnrow">
      <label>${t('Kapitel', 'Chapter')} <select id="qzBlankCh"></select></label>
      <span class="qz-last" id="qzBlankLast"></span>
    </div>
    <textarea id="qzBlankText" rows="8" placeholder="${t('Alles, was du zu diesem Kapitel weisst …', 'Everything you know about this chapter …')}" aria-label="${t('Dein Blatt', 'Your page')}"></textarea>
    <div class="btnrow">
      <button type="button" class="pri" id="qzBlankCmp">${t('Mit dem Kapitel vergleichen', 'Compare with the chapter')}</button>
      <button type="button" id="qzBlankClear">${t('Blatt leeren', 'Clear page')}</button>
    </div>
    <div class="qz-blanklist" id="qzBlankList" hidden></div>
  </div>

  <h3 id="quiz-fortschritt">${t('Fortschritt', 'Progress')}</h3>
  <p>${t('Pro Kapitel: wie viele Fragen neu sind, wie viele in welchem Fach liegen (F1 bis F5), was heute fällig ist und das letzte Ergebnis mit dem leeren Blatt. Der Fortschritt bleibt in diesem Browser gespeichert, mit dem Server zusätzlich in <code>data/state.json</code>.', 'Per chapter: how many questions are new, how many sit in each box (B1 to B5), what is due today and the last blank-page result. The progress is stored in this browser, with the server also in <code>data/state.json</code>.')}</p>
  <div class="tablewrap qz-prog" id="qzProg"></div>
  <p class="note" id="qzNext"></p>
  <div class="btnrow"><button type="button" id="qzReset">${t('Fortschritt zurücksetzen', 'Reset progress')}</button></div>
`,
    init() { LernApp.demos.quiz(); },
  });
})();
