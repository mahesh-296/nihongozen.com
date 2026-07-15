// ============================================================
// FILE: js/nz-vocab-module.js
// NihongoZen — Vocabulary Module (Core logic — data-free)
//
// DATA DEPENDENCIES (auto-loaded below if not already present):
//   js/chapters.js     → window.NZChapterData        (chapter metadata N5-N1)
//   js/vocabLevel.js   → window.NZChapterVocabWords  (word arrays N5-N1)
//
// RECOMMENDED explicit load order in index.html (avoids the dynamic loader):
//   <script src="js/chapters.js"></script>
//   <script src="js/vocabLevel.js"></script>
//   <script src="js/nz-vocab-module.js"></script>
//
// If this file is loaded standalone (e.g. lazy bundle), the dynamic loader
// at the top of this file will inject the two data scripts automatically,
// resolve the merge, and then init the UI — no manual intervention needed.
//
// All styling uses existing CSS variables (--bg, --fg, --primary, --border …)
// No new CSS classes introduced beyond those in the original module.
// ============================================================

/* ─────────────────────────────────────────────────────────────────────────────
   DATA IMPORT BOOTSTRAP
   Ensures chapters.js and vocabLevel.js are on the page before any UI code
   in this module tries to read window.NZChapterData or NZChapterVocabWords.

   Resolution order:
     1. Both already on window  → merge already done by chapters.js, proceed.
     2. One or both missing     → inject their <script> tags, wait for load,
                                   then trigger the merge manually and proceed.
   ───────────────────────────────────────────────────────────────────────────── */
(function NZDataBootstrap() {
  'use strict';

  /* Paths relative to this script's own location.
     Adjust if your repository uses a different folder structure.          */
  const BASE_PATH   = (function() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src && s.src.includes('nz-vocab-module')) {
        return s.src.replace(/nz-vocab-module[^/]*\.js[^/]*$/, '');
      }
    }
    return 'js/';   // fallback: assume scripts live in js/
  })();

  const CHAPTERS_URL   = BASE_PATH + 'chapters.js';
  const VOCAB_LVL_URL  = BASE_PATH + 'vocabLevel.js';

  /* ── Helper: inject a <script> tag and resolve when loaded ── */
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve(); return;           // already in DOM — script ran or is running
      }
      const s = document.createElement('script');
      s.src   = url;
      s.async = false;               // preserve execution order
      s.onload  = resolve;
      s.onerror = () => {
        console.warn('[NZ] Could not load ' + url + ' — chapter vocab will be empty.');
        resolve();                   // don't block the whole module on a 404
      };
      document.head.appendChild(s);
    });
  }

  /* ── Merge: copy word arrays from NZChapterVocabWords into NZChapterData ── */
  function runMerge() {
    if (typeof NZChapterVocabWords === 'undefined' ||
        typeof NZChapterData       === 'undefined') return;
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    levels.forEach(lvl => {
      const chaps = NZChapterData[lvl] || [];
      const words = NZChapterVocabWords[lvl] || [];
      chaps.forEach((ch, i) => {
        if (!ch.words || ch.words.length === 0) {
          ch.words = words[i] || [];
        }
      });
    });
    console.log('[NZ] nz-vocab-module.js ✓ — NZChapterData fully hydrated.');
  }

  /* ── Main: load missing scripts then merge ── */
  const needsChapters  = (typeof NZChapterData       === 'undefined');
  const needsVocabLvl  = (typeof NZChapterVocabWords === 'undefined');

  if (!needsChapters && !needsVocabLvl) {
    // Both already present — chapters.js merge() already ran; nothing to do.
    return;
  }

  const loads = [];
  if (needsChapters) loads.push(loadScript(CHAPTERS_URL));
  if (needsVocabLvl) loads.push(loadScript(VOCAB_LVL_URL));

  Promise.all(loads).then(runMerge);
})();

// ============================================================
// Source: nz-chapter-reading.js
// ============================================================
'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/nz-chapter-reading.js
// NihongoZen — Chapter-Wise Reading Passages
//
// Structure per passage:
//   { ch, title, topic, level, difficulty, passage[], vocab[], quiz[] }
//   passage[]: { jp, en }   (furigana can be added as jp)
//   quiz[]:    { q, opts[], ans }  (ans = 0-based index)
// ═══════════════════════════════════════════════════════════════════════════════

const NZChapterReading = {

  /* ════════════════════════════════════════════════════════
     N5 — Minna no Nihongo I  (selected chapters)
     ════════════════════════════════════════════════════════ */
  N5: [
    {
      ch: 1, title: 'はじめまして', level: 'N5', difficulty: 'Beginner',
      topic: 'Self-Introduction',
      passage: [
        { jp: 'はじめまして。わたしはキムです。', en: 'Nice to meet you. I am Kim.' },
        { jp: 'かんこくからきました。', en: 'I came from Korea.' },
        { jp: 'スミスだいがくのがくせいです。', en: 'I am a student at Smith University.' },
        { jp: 'どうぞよろしくおねがいします。', en: 'Nice to meet you.' }
      ],
      vocab: [
        { jp: 'はじめまして', en: 'Nice to meet you (first meeting)' },
        { jp: 'がくせい', en: 'student' },
        { jp: 'よろしくおねがいします', en: 'please treat me well' }
      ],
      quiz: [
        { q: 'Where is Kim from?', opts: ['Japan', 'Korea', 'China', 'America'], ans: 1 },
        { q: 'What is Kim\'s occupation?', opts: ['Teacher', 'Engineer', 'Student', 'Doctor'], ans: 2 }
      ]
    },
    {
      ch: 4, title: 'まいにちのせいかつ', level: 'N5', difficulty: 'Beginner',
      topic: 'Daily Schedule',
      passage: [
        { jp: 'わたしはまいあさ7じにおきます。', en: 'I wake up at 7 every morning.' },
        { jp: 'かおをあらって、はをみがきます。', en: 'I wash my face and brush my teeth.' },
        { jp: 'あさごはんはトーストとコーヒーです。', en: 'Breakfast is toast and coffee.' },
        { jp: '8じはんにうちをでます。', en: 'I leave home at 8:30.' },
        { jp: 'でんしゃでかいしゃにいきます。', en: 'I go to work by train.' },
        { jp: 'しごとは9じからごごの6じまでです。', en: 'Work is from 9 in the morning until 6 in the evening.' },
        { jp: 'よるはにほんごをべんきょうします。', en: 'In the evening, I study Japanese.' }
      ],
      vocab: [
        { jp: 'まいあさ', en: 'every morning' },
        { jp: 'でんしゃ', en: 'train' },
        { jp: 'しごと', en: 'work / job' }
      ],
      quiz: [
        { q: 'What time does the person wake up?', opts: ['6:00', '7:00', '8:00', '9:00'], ans: 1 },
        { q: 'How does the person commute?', opts: ['By car', 'By bus', 'By train', 'On foot'], ans: 2 },
        { q: 'What does the person do in the evening?', opts: ['Watch TV', 'Exercise', 'Study Japanese', 'Cook dinner'], ans: 2 }
      ]
    },
    {
      ch: 7, title: 'きょうのよてい', level: 'N5', difficulty: 'Beginner',
      topic: 'Plans & Transport',
      passage: [
        { jp: 'きょうはともだちとかいものにいきます。', en: 'Today I will go shopping with a friend.' },
        { jp: 'おおさかのデパートにいきます。', en: 'We are going to a department store in Osaka.' },
        { jp: 'でんしゃでいきます。', en: 'We will go by train.' },
        { jp: 'ひるごはんはデパートのレストランでたべます。', en: 'We will have lunch at the department store restaurant.' },
        { jp: 'かいもののあとで、コーヒーをのみます。', en: 'After shopping, we will drink coffee.' },
        { jp: 'ゆうがた5じにうちへかえります。', en: 'We will return home at 5 in the evening.' }
      ],
      vocab: [
        { jp: 'よてい', en: 'plan / schedule' },
        { jp: 'かいもの', en: 'shopping' },
        { jp: 'ゆうがた', en: 'late afternoon / evening' }
      ],
      quiz: [
        { q: 'Who does the person go shopping with?', opts: ['Family', 'Alone', 'A friend', 'A colleague'], ans: 2 },
        { q: 'Where will they have lunch?', opts: ['At home', 'In a café', 'At a restaurant in the department store', 'At a convenience store'], ans: 2 },
        { q: 'What time do they return home?', opts: ['3:00', '4:00', '5:00', '6:00'], ans: 2 }
      ]
    },
    {
      ch: 11, title: 'わたしのまち', level: 'N5', difficulty: 'Beginner',
      topic: 'Describing a Town',
      passage: [
        { jp: 'わたしはとうきょうにすんでいます。', en: 'I live in Tokyo.' },
        { jp: 'とうきょうはとてもにぎやかなまちです。', en: 'Tokyo is a very lively city.' },
        { jp: 'でんしゃやバスがたくさんあって、べんりです。', en: 'There are many trains and buses, so it is convenient.' },
        { jp: 'でも、うちのちかくにみどりがすくないです。', en: 'However, there is not much greenery near my house.' },
        { jp: 'こうえんはひとつありますが、ちいさいです。', en: 'There is one park, but it is small.' },
        { jp: 'しずかなまちにすみたいとおもいます。', en: 'I think I want to live in a quiet town.' }
      ],
      vocab: [
        { jp: 'にぎやか（な）', en: 'lively / bustling' },
        { jp: 'べんり（な）', en: 'convenient' },
        { jp: 'みどり', en: 'greenery / green' }
      ],
      quiz: [
        { q: 'Where does the writer live?', opts: ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], ans: 2 },
        { q: 'What is NOT good about the writer\'s area?', opts: ['Not convenient', 'Not lively', 'Little greenery', 'No trains'], ans: 2 },
        { q: 'What kind of town does the writer want to live in?', opts: ['Lively', 'Quiet', 'Big', 'Near the sea'], ans: 1 }
      ]
    },
    {
      ch: 18, title: 'はじめてのにほん', level: 'N5', difficulty: 'Elementary',
      topic: 'First Experiences in Japan',
      passage: [
        { jp: 'わたしはにほんにきて、もう2ねんになります。', en: 'It has already been two years since I came to Japan.' },
        { jp: 'にほんへくるまえに、おすしはたべたことがありませんでした。', en: 'Before coming to Japan, I had never eaten sushi.' },
        { jp: 'はじめてたべたとき、とてもおいしかったです。', en: 'When I ate it for the first time, it was very delicious.' },
        { jp: 'かぶきもみたことがありませんでしたが、さくねんみました。', en: 'I had also never seen kabuki, but I saw it last year.' },
        { jp: 'むずかしかったですが、おもしろかったです。', en: 'It was difficult, but interesting.' },
        { jp: 'これからもにほんのぶんかをたくさんけいけんしたいです。', en: 'I want to continue experiencing Japanese culture a lot in the future.' }
      ],
      vocab: [
        { jp: 'はじめて', en: 'for the first time' },
        { jp: 'かぶき', en: 'kabuki (traditional theatre)' },
        { jp: 'けいけん', en: 'experience' }
      ],
      quiz: [
        { q: 'How long has the writer been in Japan?', opts: ['1 year', '2 years', '3 years', '5 years'], ans: 1 },
        { q: 'When did the writer first try sushi?', opts: ['In their home country', 'After coming to Japan', 'They have never tried it', 'As a child'], ans: 1 },
        { q: 'What was the writer\'s reaction to kabuki?', opts: ['Boring', 'Scary', 'Difficult but interesting', 'Too long'], ans: 2 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N4 — Minna no Nihongo II
     ════════════════════════════════════════════════════════ */
  N4: [
    {
      ch: 1, chBook: 26, title: 'にほんごがじょうずになりたい', level: 'N4', difficulty: 'Elementary',
      topic: 'Language Learning Goals',
      passage: [
        { jp: 'わたしはにほんごがじょうずになりたいです。', en: 'I want to become good at Japanese.' },
        { jp: 'そのために、まいにちにほんごのドラマをみます。', en: 'For that purpose, I watch Japanese dramas every day.' },
        { jp: 'はじめはぜんぜんわかりませんでしたが、だんだんわかるようになりました。', en: 'At first I understood nothing at all, but gradually I have come to understand.' },
        { jp: 'りすにんぐがとくいになりましたが、かんじはまだむずかしいです。', en: 'I have become good at listening, but kanji is still difficult.' },
        { jp: 'らいねんのJLPTN3に合格できるようにがんばります。', en: 'I will work hard so that I can pass the JLPT N3 next year.' }
      ],
      vocab: [
        { jp: 'だんだん', en: 'gradually' },
        { jp: 'とくい（な）', en: 'good at / strong point' },
        { jp: 'がんばります', en: 'do one\'s best' }
      ],
      quiz: [
        { q: 'What does the writer do every day to improve?', opts: ['Read books', 'Watch dramas', 'Go to school', 'Write letters'], ans: 1 },
        { q: 'What is still difficult for the writer?', opts: ['Listening', 'Speaking', 'Kanji', 'Grammar'], ans: 2 },
        { q: 'What is the writer\'s goal for next year?', opts: ['Visit Japan', 'Pass JLPT N4', 'Pass JLPT N3', 'Get a job'], ans: 2 }
      ]
    },
    {
      ch: 5, chBook: 30, title: 'にほんのおまつり', level: 'N4', difficulty: 'Elementary',
      topic: 'Japanese Festivals',
      passage: [
        { jp: 'にほんにはたくさんのおまつりがあります。', en: 'Japan has many festivals.' },
        { jp: 'はなびたいかいはなつのおまつりとしてよくしられています。', en: 'Fireworks displays are well known as summer festivals.' },
        { jp: 'おおぜいのひとがゆかたをきて、はなびをみにいきます。', en: 'Many people put on yukata and go to watch the fireworks.' },
        { jp: 'きおんさいはきょうとのゆうめいなおまつりです。', en: 'The Gion Festival is a famous festival in Kyoto.' },
        { jp: 'まちには大きなやまぼこがあらわれ、とてもにぎやかになります。', en: 'Large floats appear in the streets and it becomes very lively.' },
        { jp: 'まつりはにほんのぶんかにとってとてもたいせつなものです。', en: 'Festivals are very important to Japanese culture.' }
      ],
      vocab: [
        { jp: 'はなびたいかい', en: 'fireworks display' },
        { jp: 'ゆかた', en: 'summer yukata kimono' },
        { jp: 'やまぼこ', en: 'festival float' }
      ],
      quiz: [
        { q: 'What do many people wear to summer festivals?', opts: ['Suits', 'Yukata', 'School uniforms', 'Western clothes'], ans: 1 },
        { q: 'Where is the Gion Festival held?', opts: ['Tokyo', 'Osaka', 'Kyoto', 'Nara'], ans: 2 },
        { q: 'What appears in the streets during the Gion Festival?', opts: ['Fireworks', 'Large floats', 'Sumo wrestlers', 'Dragons'], ans: 1 }
      ]
    },
    {
      ch: 9, chBook: 34, title: 'けんこうのために', level: 'N4', difficulty: 'Elementary',
      topic: 'Health Advice',
      passage: [
        { jp: 'けんこうのために、まいにちうんどうしたほうがいいです。', en: 'For your health, it\'s better to exercise every day.' },
        { jp: 'むりをしすぎると、からだをこわしてしまいます。', en: 'If you overdo things, you will damage your health.' },
        { jp: 'はやねはやおきは、からだにとてもいいです。', en: 'Early to bed and early to rise is very good for the body.' },
        { jp: 'やさいやくだものをたくさんたべるようにしましょう。', en: 'Let\'s make sure to eat plenty of vegetables and fruit.' },
        { jp: 'タバコはからだによくないので、すわないほうがいいです。', en: 'Cigarettes are bad for you, so it\'s better not to smoke.' },
        { jp: 'ストレスもけんこうにわるいので、きゅうけいも大切です。', en: 'Stress is also bad for health, so rest is also important.' }
      ],
      vocab: [
        { jp: 'けんこう', en: 'health' },
        { jp: 'うんどう', en: 'exercise' },
        { jp: 'きゅうけい', en: 'rest / break' }
      ],
      quiz: [
        { q: 'What does "hayane hayaoki" mean?', opts: ['Eat vegetables', 'Early to bed, early to rise', 'Exercise daily', 'Avoid stress'], ans: 1 },
        { q: 'Why is it better not to smoke?', opts: ['It is expensive', 'It is bad for health', 'It is not allowed', 'It smells bad'], ans: 1 },
        { q: 'What else is bad for your health?', opts: ['Fruit', 'Sleep', 'Stress', 'Rest'], ans: 2 }
      ]
    },
    {
      ch: 14, chBook: 39, title: 'りゅうがくのけいけん', level: 'N4', difficulty: 'Elementary',
      topic: 'Study Abroad Experience',
      passage: [
        { jp: 'わたしは去年、にほんにりゅうがくしました。', en: 'Last year, I studied abroad in Japan.' },
        { jp: 'でんしゃがおくれたので、じゅぎょうにちこくしてしまいました。', en: 'Because the train was late, I ended up being late to class.' },
        { jp: 'にほんのでんしゃはふつうじかんどおりにきますが、たまにおくれることもあります。', en: 'Japanese trains usually run on time, but they are sometimes late.' },
        { jp: 'りゅうがく中に、にほんじんのともだちができました。', en: 'During my time abroad, I made Japanese friends.' },
        { jp: 'かれらのおかげで、にほんごがずいぶんうまくなりました。', en: 'Thanks to them, my Japanese improved considerably.' },
        { jp: 'りゅうがくはほんとうにいいけいけんでした。', en: 'Studying abroad was a truly wonderful experience.' }
      ],
      vocab: [
        { jp: 'りゅうがく', en: 'studying abroad' },
        { jp: 'ちこく', en: 'being late' },
        { jp: 'ずいぶん', en: 'considerably / quite' }
      ],
      quiz: [
        { q: 'Why was the writer late to class?', opts: ['Overslept', 'Train was late', 'Got lost', 'Forgot the time'], ans: 1 },
        { q: 'What helped the writer improve their Japanese?', opts: ['Watching dramas', 'Studying textbooks', 'Japanese friends', 'Online lessons'], ans: 2 },
        { q: 'How does the writer describe the study abroad experience?', opts: ['Disappointing', 'OK', 'Wonderful', 'Too hard'], ans: 2 }
      ]
    },
    {
      ch: 20, chBook: 45, title: 'かんきょうをまもるために', level: 'N4', difficulty: 'Intermediate',
      topic: 'Protecting the Environment',
      passage: [
        { jp: '近ごろ、かんきょうもんだいがよく話しあわれています。', en: 'Recently, environmental problems are often discussed.' },
        { jp: 'おんだんかによって、きこうがかわりつつあります。', en: 'Due to global warming, the climate is in the process of changing.' },
        { jp: 'わたしたちができることから始めましょう。', en: 'Let\'s start from what we can do.' },
        { jp: 'でんきをたいせつにつかったり、ゴミをへらしたりすることが大切です。', en: 'It is important to use electricity carefully and reduce rubbish.' },
        { jp: 'また、リサイクルにきょうりょくすることも、かんきょうをまもることになります。', en: 'Also, cooperating with recycling also helps protect the environment.' },
        { jp: 'ちいさなこうどうが、大きなちがいをうみます。', en: 'Small actions make a big difference.' }
      ],
      vocab: [
        { jp: 'かんきょう', en: 'environment' },
        { jp: 'おんだんか', en: 'global warming' },
        { jp: 'リサイクル', en: 'recycling' }
      ],
      quiz: [
        { q: 'What is causing climate change according to the passage?', opts: ['Earthquakes', 'Global warming', 'Pollution', 'Deforestation'], ans: 1 },
        { q: 'Which of these is mentioned as something we can do?', opts: ['Plant trees', 'Use less electricity', 'Stop driving cars', 'Move to the countryside'], ans: 1 },
        { q: 'What does the writer say about small actions?', opts: ['They don\'t help much', 'They make a big difference', 'They are too difficult', 'They need government support'], ans: 1 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N3 — Minna no Nihongo Chukyu
     ════════════════════════════════════════════════════════ */
  N3: [
    {
      ch: 1, title: 'へんかにきづく', level: 'N3', difficulty: 'Intermediate',
      topic: 'Noticing Change',
      passage: [
        { jp: '最近、町の様子がずいぶん変わったようです。', en: 'Recently, the appearance of the town seems to have changed considerably.' },
        { jp: '駅の近くに大きなショッピングモールができていました。', en: 'A large shopping mall had been built near the station.' },
        { jp: '以前は田んぼがあったところに、高いビルが立ち並んでいます。', en: 'Where there were once rice paddies, tall buildings now stand in a row.' },
        { jp: '便利になった反面、昔ながらの風景が失われてしまいました。', en: 'While it has become convenient, the scenery of days gone by has been lost.' },
        { jp: '変化を受け入れることは大切ですが、残すべきものも大切にしたいです。', en: 'Accepting change is important, but I also want to cherish what should be preserved.' }
      ],
      vocab: [
        { jp: '様子', en: 'appearance / situation' },
        { jp: '反面', en: 'on the other hand' },
        { jp: '失われる', en: 'to be lost' }
      ],
      quiz: [
        { q: 'What was built near the station?', opts: ['Hospital', 'School', 'Shopping mall', 'Park'], ans: 2 },
        { q: 'What did the area look like before?', opts: ['Forest', 'Rice paddies', 'Park', 'Factory'], ans: 1 },
        { q: 'What is the writer\'s feeling about the changes?', opts: ['Purely positive', 'Purely negative', 'Mixed feelings', 'Indifferent'], ans: 2 }
      ]
    },
    {
      ch: 5, title: 'ことわり方のアート', level: 'N3', difficulty: 'Intermediate',
      topic: 'The Art of Refusing Politely',
      passage: [
        { jp: '日本では、相手を傷つけないようにことわることが大切にされています。', en: 'In Japan, it is valued to decline without hurting the other person.' },
        { jp: '「ちょっと…」という言い方は、直接「いいえ」と言わずにことわる表現です。', en: '"Chotto..." is an expression that declines without directly saying "no".' },
        { jp: 'あいまいな返事は、時に誤解を招くこともあります。', en: 'Ambiguous answers can sometimes lead to misunderstandings.' },
        { jp: 'しかし、相手への配慮から生まれたコミュニケーション方法でもあります。', en: 'However, it is also a communication style born out of consideration for the other person.' },
        { jp: '異文化交流の際には、このような違いを理解することが重要です。', en: 'When engaging in cross-cultural exchange, understanding such differences is important.' }
      ],
      vocab: [
        { jp: 'ことわる', en: 'to decline / refuse' },
        { jp: 'あいまい（な）', en: 'vague / ambiguous' },
        { jp: '配慮', en: 'consideration / thoughtfulness' }
      ],
      quiz: [
        { q: 'What is "Chotto..." used for?', opts: ['A direct yes', 'A direct no', 'An indirect refusal', 'A greeting'], ans: 2 },
        { q: 'What is one potential problem with ambiguous replies?', opts: ['They are rude', 'They may cause misunderstandings', 'They are too formal', 'They are hard to understand'], ans: 1 },
        { q: 'What is the origin of this communication style?', opts: ['Western influence', 'Consideration for others', 'Legal requirements', 'School education'], ans: 1 }
      ]
    },
    {
      ch: 9, title: '日本とほかの国のちがい', level: 'N3', difficulty: 'Intermediate',
      topic: 'Japan vs. Other Cultures',
      passage: [
        { jp: '文化の違いを理解することは、国際交流の第一歩です。', en: 'Understanding cultural differences is the first step in international exchange.' },
        { jp: '日本では、初対面の人に対して深くおじぎをすることが一般的です。', en: 'In Japan, it is common to bow deeply to someone you meet for the first time.' },
        { jp: '一方、西洋ではハグや握手があいさつの基本です。', en: 'On the other hand, in the West, hugging and handshakes are the basis of greetings.' },
        { jp: 'どちらのやり方も、相手への敬意を示すという点では同じです。', en: 'Both methods are the same in that they show respect for the other person.' },
        { jp: '大切なのは、違いを批判するのではなく、理解しようとする姿勢です。', en: 'What is important is not to criticise differences but to have the attitude of trying to understand.' }
      ],
      vocab: [
        { jp: '初対面', en: 'meeting for the first time' },
        { jp: '敬意', en: 'respect' },
        { jp: '姿勢', en: 'attitude / posture' }
      ],
      quiz: [
        { q: 'What is typical in Japan when meeting someone for the first time?', opts: ['Hugging', 'Shaking hands', 'Bowing deeply', 'Waving'], ans: 2 },
        { q: 'What is common in Western countries as a greeting?', opts: ['Bowing', 'Hugging and handshakes', 'Gift-giving', 'Singing'], ans: 1 },
        { q: 'What does the writer say is most important?', opts: ['Following Japanese customs', 'Criticising differences', 'Trying to understand differences', 'Adopting Western customs'], ans: 2 }
      ]
    },
    {
      ch: 12, title: 'ことばの力', level: 'N3', difficulty: 'Upper-intermediate',
      topic: 'The Power of Words',
      passage: [
        { jp: 'ことばには人を傷つける力も、癒す力もあります。', en: 'Words have the power to both hurt people and to heal them.' },
        { jp: '「ありがとう」という一言が、誰かの一日を変えることがあります。', en: 'A single word of "thank you" can sometimes change someone\'s entire day.' },
        { jp: '反対に、何気ない一言が長い間、心に残ることもあります。', en: 'On the other hand, a casual remark can sometimes linger in the heart for a long time.' },
        { jp: 'ことばを使うときは、相手の気持ちを考えることが大切です。', en: 'When using words, it is important to consider the other person\'s feelings.' },
        { jp: 'また、言葉だけでなく、表情や声のトーンも大切なコミュニケーションの要素です。', en: 'Also, not just words, but facial expressions and tone of voice are important elements of communication.' }
      ],
      vocab: [
        { jp: '癒す', en: 'to heal / comfort' },
        { jp: '何気ない', en: 'casual / unthinking' },
        { jp: '要素', en: 'element / factor' }
      ],
      quiz: [
        { q: 'According to the passage, what can a single "thank you" do?', opts: ['Cause misunderstanding', 'Change someone\'s day', 'Start a conversation', 'End an argument'], ans: 1 },
        { q: 'What should you consider when using words?', opts: ['Grammar rules', 'The listener\'s feelings', 'Your vocabulary level', 'The time of day'], ans: 1 },
        { q: 'What else is mentioned as important in communication?', opts: ['Gifts', 'Facial expressions and tone', 'Writing letters', 'Formal speech'], ans: 1 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N2 — Nihongo Somatome N2
     ════════════════════════════════════════════════════════ */
  N2: [
    {
      ch: 3, title: '少子高齢化社会', level: 'N2', difficulty: 'Advanced',
      topic: 'Aging Society',
      passage: [
        { jp: '日本は現在、世界でも有数の少子高齢化社会です。', en: 'Japan is currently one of the world\'s leading aging societies with a declining birthrate.' },
        { jp: '65歳以上の人口が全体の約3割を占め、その割合は年々増加しています。', en: 'People aged 65 and over account for about 30% of the total population, and this proportion increases year by year.' },
        { jp: '一方、出生率は低下し続けており、労働力不足が深刻な課題となっています。', en: 'On the other hand, the birthrate continues to decline, and labour shortage has become a serious challenge.' },
        { jp: 'この問題に対処するため、政府は移民政策や女性の社会進出支援を推進しています。', en: 'To address this problem, the government is promoting immigration policies and support for women\'s participation in society.' },
        { jp: 'テクノロジーの活用による生産性向上も、解決策の一つとして注目されています。', en: 'Improving productivity through the use of technology is also being noted as one of the solutions.' }
      ],
      vocab: [
        { jp: '少子高齢化', en: 'declining birthrate and aging population' },
        { jp: '労働力不足', en: 'labour shortage' },
        { jp: '生産性', en: 'productivity' }
      ],
      quiz: [
        { q: 'What percentage of Japan\'s population is aged 65 or over?', opts: ['About 10%', 'About 20%', 'About 30%', 'About 40%'], ans: 2 },
        { q: 'What serious challenge is mentioned?', opts: ['Housing shortage', 'Labour shortage', 'Food shortage', 'Education shortage'], ans: 1 },
        { q: 'What solution involving technology is mentioned?', opts: ['Online education', 'Medical AI', 'Productivity improvement', 'Robot workers'], ans: 2 }
      ]
    },
    {
      ch: 7, title: 'AI時代の働き方', level: 'N2', difficulty: 'Advanced',
      topic: 'Working in the AI Era',
      passage: [
        { jp: '人工知能の急速な発展が、労働市場に大きな変革をもたらしています。', en: 'The rapid development of artificial intelligence is bringing major transformation to the labour market.' },
        { jp: '単純作業の多くが自動化され、人間にしかできない創造的な仕事の重要性が高まっています。', en: 'Many simple tasks have been automated, and the importance of creative work that only humans can do is increasing.' },
        { jp: '一方で、AIの普及により新たな職種が生まれており、継続的な学習が不可欠です。', en: 'On the other hand, new occupations are being created through the spread of AI, and continuous learning is indispensable.' },
        { jp: '企業も従業員の再教育に積極的に取り組み始めています。', en: 'Companies have also started to actively work on re-educating their employees.' },
        { jp: '変化の激しい時代において、柔軟な思考と適応力が求められています。', en: 'In an era of rapid change, flexible thinking and adaptability are required.' }
      ],
      vocab: [
        { jp: '変革', en: 'transformation / reform' },
        { jp: '自動化', en: 'automation' },
        { jp: '適応力', en: 'adaptability' }
      ],
      quiz: [
        { q: 'What type of work\'s importance is growing?', opts: ['Physical labour', 'Simple tasks', 'Creative work', 'Administrative work'], ans: 2 },
        { q: 'What do companies need to do for employees?', opts: ['Reduce working hours', 'Re-educate them', 'Increase salaries', 'Provide better equipment'], ans: 1 },
        { q: 'What qualities are needed in this era?', opts: ['Speed and accuracy', 'Flexible thinking and adaptability', 'Obedience and loyalty', 'Technical skills only'], ans: 1 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N1 — Nihongo Somatome N1
     ════════════════════════════════════════════════════════ */
  N1: [
    {
      ch: 4, title: '言語と思考の関係', level: 'N1', difficulty: 'Advanced',
      topic: 'Language and Thought',
      passage: [
        { jp: '言語は単なるコミュニケーションの道具ではなく、思考そのものを形成するとも言われています。', en: 'Language is said to be not merely a tool for communication but something that shapes thought itself.' },
        { jp: '異なる言語を話す人々は、同じ現象を異なる視点で認識する場合があるという研究もあります。', en: 'There is also research suggesting that people who speak different languages may perceive the same phenomenon from different perspectives.' },
        { jp: '例えば、色の分類や時間の概念が言語によって異なることが指摘されています。', en: 'For example, it has been pointed out that the classification of colours and the concept of time differ across languages.' },
        { jp: 'このことから、多言語を習得することは、世界を多角的に理解する力を高める可能性があります。', en: 'From this, acquiring multiple languages may enhance the ability to understand the world from multiple angles.' },
        { jp: '言語の習得は、単に語彙や文法を覚えることを超えた、深い認知的プロセスなのです。', en: 'The acquisition of language is a deep cognitive process that goes beyond merely memorising vocabulary and grammar.' }
      ],
      vocab: [
        { jp: '思考', en: 'thought / thinking' },
        { jp: '認識', en: 'recognition / perception' },
        { jp: '多角的', en: 'from multiple angles / multifaceted' }
      ],
      quiz: [
        { q: 'What does the passage say about language?', opts: ['It is only for communication', 'It shapes thought itself', 'It is less important than gestures', 'It is universal'], ans: 1 },
        { q: 'What example is given of differences across languages?', opts: ['Word order', 'Writing systems', 'Colour classification and time concepts', 'Politeness levels'], ans: 2 },
        { q: 'What might acquiring multiple languages enhance?', opts: ['Memory capacity', 'Speed of speech', 'Understanding the world from multiple angles', 'Social popularity'], ans: 2 }
      ]
    },
    {
      ch: 7, title: '美の相対性', level: 'N1', difficulty: 'Advanced',
      topic: 'The Relativity of Beauty',
      passage: [
        { jp: '「美しい」という概念は、文化や時代によって大きく異なります。', en: 'The concept of "beautiful" varies greatly across cultures and eras.' },
        { jp: '西洋絵画が写実的な表現を重視した時代があった一方、日本の水墨画は余白の美を大切にしてきました。', en: 'While there was an era in Western painting that emphasised realistic expression, Japanese ink painting has valued the beauty of empty space.' },
        { jp: '美の基準は絶対的なものではなく、社会的・歴史的な文脈の中で形成されるものです。', en: 'Standards of beauty are not absolute but are formed within social and historical contexts.' },
        { jp: 'しかし、「心を動かされる」という体験は、文化を超えて共通しているかもしれません。', en: 'However, the experience of "being moved emotionally" may be something that transcends cultures.' },
        { jp: 'だとすれば、美の普遍性は感動という感情の中にこそあるのではないでしょうか。', en: 'If so, perhaps the universality of beauty lies precisely in the emotion of being moved.' }
      ],
      vocab: [
        { jp: '余白', en: 'blank space / margin' },
        { jp: '絶対的', en: 'absolute' },
        { jp: '普遍性', en: 'universality' }
      ],
      quiz: [
        { q: 'What does Japanese ink painting value?', opts: ['Realistic expression', 'Vivid colours', 'The beauty of empty space', 'Complex patterns'], ans: 2 },
        { q: 'How does the writer describe standards of beauty?', opts: ['Universal and absolute', 'Formed within social and historical contexts', 'Determined by science', 'Unchanging'], ans: 1 },
        { q: 'Where does the writer suggest universal beauty may lie?', opts: ['In mathematical proportions', 'In cultural traditions', 'In the emotion of being moved', 'In artistic technique'], ans: 2 }
      ]
    }
  ]
};

window.NZChapterReading = NZChapterReading;

// ============================================================
// Source: nz-chapter-grammar.js
// ============================================================
'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/nz-chapter-grammar.js
// NihongoZen — Chapter-Wise Grammar Data
//
//  • N5  → Minna no Nihongo I    (Chapters 1–25)
//  • N4  → Minna no Nihongo II   (Chapters 1–25)
//  • N3  → Minna no Nihongo Chukyu (Chapters 1–12)
//  • N2  → Nihongo Somatome N2   (Chapters 1–8)
//  • N1  → Nihongo Somatome N1   (Chapters 1–8)
//
// Integrates with NZChapterVocab module — same overlay, same style tokens.
// Each grammar point: { pattern, romaji, usage, example, translation, more_examples[] }
// ═══════════════════════════════════════════════════════════════════════════════

const NZChapterGrammar = {

  /* ════════════════════════════════════════════════════════
     N5 — Minna no Nihongo I
     ════════════════════════════════════════════════════════ */
  N5: [
    {
      ch: 1, title: 'はじめまして',
      points: [
        {
          pattern: 'AはBです',
          romaji: 'A wa B desu',
          usage: 'States that A is B. The topic marker は (wa) introduces what is being talked about.',
          example: 'わたしはマリアです。',
          translation: 'I am Maria.',
          more_examples: [
            { jp: 'かれはがくせいです。', en: 'He is a student.' },
            { jp: 'これはほんです。', en: 'This is a book.' }
          ]
        },
        {
          pattern: 'AはBではありません',
          romaji: 'A wa B de wa arimasen',
          usage: 'Negative form of A は B です. States that A is NOT B.',
          example: 'わたしはせんせいではありません。',
          translation: 'I am not a teacher.',
          more_examples: [
            { jp: 'これはざっしではありません。', en: 'This is not a magazine.' }
          ]
        },
        {
          pattern: 'AはBですか',
          romaji: 'A wa B desu ka',
          usage: 'Yes/No question form. Rising intonation with か at the end.',
          example: 'あなたはがくせいですか。',
          translation: 'Are you a student?',
          more_examples: [
            { jp: 'これはえんぴつですか。', en: 'Is this a pencil?' }
          ]
        },
        {
          pattern: '〜さん',
          romaji: '~san',
          usage: 'Honorific title added to someone\'s name. Do not use it with your own name.',
          example: 'やまださん、おはようございます。',
          translation: 'Good morning, Mr/Ms Yamada.',
          more_examples: []
        }
      ]
    },
    {
      ch: 2, title: 'これはなんですか',
      points: [
        {
          pattern: 'これ／それ／あれはなんですか',
          romaji: 'Kore / Sore / Are wa nan desu ka',
          usage: 'Asks what this/that thing is. これ=near speaker, それ=near listener, あれ=far from both.',
          example: 'これはなんですか。',
          translation: 'What is this?',
          more_examples: [
            { jp: 'あれはなんですか。', en: 'What is that (over there)?' }
          ]
        },
        {
          pattern: 'この／その／あの＋名詞',
          romaji: 'Kono / Sono / Ano + noun',
          usage: 'Demonstrative adjectives. Used directly before a noun, unlike これ/それ/あれ.',
          example: 'このほんはわたしのです。',
          translation: 'This book is mine.',
          more_examples: [
            { jp: 'そのかばんはだれのですか。', en: 'Whose bag is that?' }
          ]
        },
        {
          pattern: '〜の',
          romaji: '~no',
          usage: 'Possessive particle. Connects nouns. A の B = B of A, or A\'s B.',
          example: 'これはわたしのほんです。',
          translation: 'This is my book.',
          more_examples: [
            { jp: 'にほんごのきょうかしょ', en: 'Japanese textbook' }
          ]
        }
      ]
    },
    {
      ch: 3, title: 'ここはどこですか',
      points: [
        {
          pattern: 'ここ／そこ／あそこ／どこ',
          romaji: 'Koko / Soko / Asoko / Doko',
          usage: 'Location pronouns. ここ=here, そこ=there, あそこ=over there, どこ=where.',
          example: 'トイレはどこですか。',
          translation: 'Where is the toilet?',
          more_examples: [
            { jp: 'エレベーターはあそこです。', en: 'The elevator is over there.' }
          ]
        },
        {
          pattern: 'Nounは〔場所〕にあります／います',
          romaji: 'Noun wa [place] ni arimasu / imasu',
          usage: 'あります=exists (things), います=exists (people/animals). に marks location.',
          example: 'ぎんこうはえきのちかくにあります。',
          translation: 'The bank is near the station.',
          more_examples: [
            { jp: 'ねこはいすのしたにいます。', en: 'The cat is under the chair.' }
          ]
        },
        {
          pattern: '〔場所〕に〜があります／います',
          romaji: '[place] ni ~ ga arimasu / imasu',
          usage: 'Introduces the existence of something at a location.',
          example: 'つくえのうえにほんがあります。',
          translation: 'There is a book on the desk.',
          more_examples: [
            { jp: 'こうえんにこどもがいます。', en: 'There are children in the park.' }
          ]
        }
      ]
    },
    {
      ch: 4, title: 'いまなんじですか',
      points: [
        {
          pattern: '〜から〜まで',
          romaji: '~kara ~made',
          usage: 'Indicates a span of time or place. から=from, まで=until/to.',
          example: 'ぎんこうはくじからさんじまでです。',
          translation: 'The bank is open from 9 to 3.',
          more_examples: [
            { jp: 'とうきょうからおおさかまでしんかんせんでいきます。', en: 'I go from Tokyo to Osaka by Shinkansen.' }
          ]
        },
        {
          pattern: '〜ごろ',
          romaji: '~goro',
          usage: 'Approximate time marker. About / around a time.',
          example: 'しちじごろうちへかえります。',
          translation: 'I return home around 7 o\'clock.',
          more_examples: []
        },
        {
          pattern: 'なんじに〜ますか',
          romaji: 'Nanji ni ~masu ka',
          usage: 'Asks at what time someone does something. に marks a specific point in time.',
          example: 'なんじにおきますか。',
          translation: 'What time do you wake up?',
          more_examples: [
            { jp: 'くじにかいしゃへいきます。', en: 'I go to work at 9 o\'clock.' }
          ]
        }
      ]
    },
    {
      ch: 5, title: 'いくらですか',
      points: [
        {
          pattern: '〜を ください',
          romaji: '~wo kudasai',
          usage: 'Politely asks for something in a shop or restaurant. を marks the object.',
          example: 'このりんごをみっつください。',
          translation: 'Please give me three of these apples.',
          more_examples: [
            { jp: 'コーヒーをふたつください。', en: 'Two coffees, please.' }
          ]
        },
        {
          pattern: '〜と〜',
          romaji: '~to ~',
          usage: 'Lists items exhaustively (A and B). Similar to "and" between nouns.',
          example: 'ほんとノートをかいました。',
          translation: 'I bought a book and a notebook.',
          more_examples: []
        }
      ]
    },
    {
      ch: 6, title: 'まいにちなんじにおきますか',
      points: [
        {
          pattern: '〜ます／〜ません／〜ました／〜ませんでした',
          romaji: '~masu / ~masen / ~mashita / ~masen deshita',
          usage: 'Polite verb endings. ます=present/future, ません=negative, ました=past, ませんでした=past negative.',
          example: 'まいあさしちじにおきます。',
          translation: 'I wake up at 7 every morning.',
          more_examples: [
            { jp: 'きのうはがっこうへいきませんでした。', en: 'I did not go to school yesterday.' }
          ]
        },
        {
          pattern: '〜に〜回',
          romaji: '~ni ~kai',
          usage: 'Expresses frequency: ~ times per (period). に marks the period.',
          example: 'いっしゅうかんにいっかいおよぎます。',
          translation: 'I swim once a week.',
          more_examples: [
            { jp: 'にちようびにいっかいえいがをみます。', en: 'I watch a movie once on Sunday.' }
          ]
        }
      ]
    },
    {
      ch: 7, title: 'うちにかえります',
      points: [
        {
          pattern: '〜で（交通手段）',
          romaji: '~de (transport)',
          usage: 'で marks the means or tool used. By + transport.',
          example: 'でんしゃでかいしゃへいきます。',
          translation: 'I go to work by train.',
          more_examples: [
            { jp: 'じてんしゃでがっこうへいきます。', en: 'I go to school by bicycle.' }
          ]
        },
        {
          pattern: 'どこかへ〜',
          romaji: 'Dokoka e ~',
          usage: 'Somewhere. どこか=somewhere, なにか=something, だれか=someone.',
          example: 'きのうどこかへいきましたか。',
          translation: 'Did you go somewhere yesterday?',
          more_examples: []
        },
        {
          pattern: '〜と いっしょに',
          romaji: '~to issho ni',
          usage: 'Together with someone. と indicates the companion.',
          example: 'ともだちといっしょにえいがをみました。',
          translation: 'I watched a movie together with a friend.',
          more_examples: []
        }
      ]
    },
    {
      ch: 8, title: 'えをかきます',
      points: [
        {
          pattern: '〜を〜',
          romaji: '~wo ~',
          usage: 'Object marker を marks the direct object of a transitive verb.',
          example: 'まいにちしんぶんをよみます。',
          translation: 'I read the newspaper every day.',
          more_examples: [
            { jp: 'コーヒーをのみました。', en: 'I drank coffee.' }
          ]
        },
        {
          pattern: '〜に（ひと）〜を あげます／もらいます',
          romaji: '~ni (person) ~wo agemasu / moraimasu',
          usage: 'Giving and receiving. に marks the recipient (agemasu) or giver (moraimasu).',
          example: 'ともだちにほんをあげました。',
          translation: 'I gave a book to my friend.',
          more_examples: [
            { jp: 'せんせいにプレゼントをもらいました。', en: 'I received a gift from my teacher.' }
          ]
        }
      ]
    },
    {
      ch: 9, title: 'そこをまがってください',
      points: [
        {
          pattern: '〜てください',
          romaji: '~te kudasai',
          usage: 'Polite request form. Take the て-form of the verb + ください.',
          example: 'ここになまえをかいてください。',
          translation: 'Please write your name here.',
          more_examples: [
            { jp: 'もうすこしゆっくりはなしてください。', en: 'Please speak a little more slowly.' }
          ]
        },
        {
          pattern: '〜ないでください',
          romaji: '~nai de kudasai',
          usage: 'Polite negative request. Please do not ~.',
          example: 'ここでたばこをすわないでください。',
          translation: 'Please do not smoke here.',
          more_examples: []
        }
      ]
    },
    {
      ch: 10, title: 'にほんごがすこしわかります',
      points: [
        {
          pattern: '〜が わかります／できます',
          romaji: '~ga wakarimasu / dekimasu',
          usage: 'が marks the object of understanding or ability. Wakarimasu=understand, dekimasu=can do.',
          example: 'にほんごがすこしわかります。',
          translation: 'I understand a little Japanese.',
          more_examples: [
            { jp: 'ピアノがひけます。', en: 'I can play the piano.' }
          ]
        },
        {
          pattern: '〜が すきです／きらいです／じょうずです／へたです',
          romaji: '~ga suki desu / kirai desu / jouzu desu / heta desu',
          usage: 'が marks the object of likes, dislikes, and skill evaluation.',
          example: 'スポーツがすきです。',
          translation: 'I like sports.',
          more_examples: [
            { jp: 'にほんごがあまりじょうずじゃないです。', en: 'My Japanese is not very good.' }
          ]
        }
      ]
    },
    {
      ch: 11, title: 'どんなまちにすんでいますか',
      points: [
        {
          pattern: '〜ている（状態）',
          romaji: '~te iru (state)',
          usage: 'Expresses an ongoing state resulting from a past action. Not same as progressive.',
          example: 'けっこんしています。',
          translation: 'I am married.',
          more_examples: [
            { jp: 'かれはとうきょうにすんでいます。', en: 'He lives in Tokyo.' }
          ]
        },
        {
          pattern: 'どんな〜',
          romaji: 'donna ~',
          usage: 'What kind of ~? Used to ask about the nature or type of something.',
          example: 'どんなおんがくがすきですか。',
          translation: 'What kind of music do you like?',
          more_examples: []
        }
      ]
    },
    {
      ch: 12, title: 'もっとゆっくりはなしてください',
      points: [
        {
          pattern: '〜てもいいです',
          romaji: '~te mo ii desu',
          usage: 'Expresses permission. It is OK to ~.',
          example: 'ここにすわってもいいです。',
          translation: 'You may sit here.',
          more_examples: []
        },
        {
          pattern: '〜てはいけません',
          romaji: '~te wa ikemasen',
          usage: 'Expresses prohibition. You must not ~.',
          example: 'ここでたばこをすってはいけません。',
          translation: 'You must not smoke here.',
          more_examples: []
        },
        {
          pattern: '〜なければなりません',
          romaji: '~nakereba narimasen',
          usage: 'Expresses obligation. Must ~ / have to ~.',
          example: 'くすりをのまなければなりません。',
          translation: 'I must take the medicine.',
          more_examples: [
            { jp: 'しゅくだいをしなければなりません。', en: 'I have to do my homework.' }
          ]
        }
      ]
    },
    {
      ch: 13, title: 'びじゅつかんでしゃしんをとってもいいですか',
      points: [
        {
          pattern: '〜てもいいですか',
          romaji: '~te mo ii desu ka',
          usage: 'Asks for permission. May I ~?',
          example: 'しゃしんをとってもいいですか。',
          translation: 'May I take a photo?',
          more_examples: [
            { jp: 'トイレにいってもいいですか。', en: 'May I go to the toilet?' }
          ]
        },
        {
          pattern: 'て-form review',
          romaji: 'te-kei mとkuri naoshi',
          usage: 'Group 1: ~って/~んで/~いて/~いで. Group 2: ~て. Group 3: してきて.',
          example: 'かいて、よんで、たべて、きて、して',
          translation: 'write (te), read (te), eat (te), come (te), do (te)',
          more_examples: []
        }
      ]
    },
    {
      ch: 14, title: 'このかんじはどうよむんですか',
      points: [
        {
          pattern: '〜んです / 〜のです',
          romaji: '~n desu / ~no desu',
          usage: 'Explanatory or emphatic ending. Conveys that a statement is an explanation or justification.',
          example: 'あたまがいたいんです。',
          translation: 'The thing is, I have a headache.',
          more_examples: [
            { jp: 'どうしてやすんだんですか。', en: 'Why did you take the day off?' }
          ]
        },
        {
          pattern: '〜から（理由）',
          romaji: '~kara (reason)',
          usage: 'Because ~. Gives a reason. Comes after the reason clause.',
          example: 'かぜをひいたから、がっこうをやすみました。',
          translation: 'Because I caught a cold, I took a day off school.',
          more_examples: []
        }
      ]
    },
    {
      ch: 15, title: 'プレゼントになにがいいですか',
      points: [
        {
          pattern: '〜に なにが いいですか',
          romaji: '~ni nani ga ii desu ka',
          usage: 'What would be good for ~? Asking for a recommendation.',
          example: 'プレゼントになにがいいですか。',
          translation: 'What would be good as a present?',
          more_examples: []
        },
        {
          pattern: '〜は〜に します',
          romaji: '~wa ~ni shimasu',
          usage: 'Deciding on something. I will go with / I will have ~ (when ordering/choosing).',
          example: 'わたしはコーヒーにします。',
          translation: 'I will have coffee.',
          more_examples: []
        }
      ]
    },
    {
      ch: 16, title: 'たのしみにしています',
      points: [
        {
          pattern: '〜て います（進行中）',
          romaji: '~te imasu (in progress)',
          usage: 'Expresses an action currently in progress. Similar to English -ing.',
          example: 'いまてがみをかいています。',
          translation: 'I am writing a letter now.',
          more_examples: [
            { jp: 'こどもたちがこうえんであそんでいます。', en: 'The children are playing in the park.' }
          ]
        },
        {
          pattern: '〜と おもっています',
          romaji: '~to omotteimasu',
          usage: 'I am thinking of / I am planning to. Expresses an ongoing intention.',
          example: 'らいねんにほんへいこうとおもっています。',
          translation: 'I am thinking of going to Japan next year.',
          more_examples: []
        }
      ]
    },
    {
      ch: 17, title: 'ちょっとお願いがあるんですが',
      points: [
        {
          pattern: '〜ていただけませんか',
          romaji: '~te itadakemasen ka',
          usage: 'Very polite request. Could you please ~? More formal than てください.',
          example: 'もういちどせつめいしていただけませんか。',
          translation: 'Could you please explain once more?',
          more_examples: []
        },
        {
          pattern: '〜てあげます／もらいます／くれます',
          romaji: '~te agemasu / moraimasu / kuremasu',
          usage: 'Doing favours. あげ=I do for s.o., もらい=s.o. does for me (I receive), くれ=s.o. does for me.',
          example: 'ともだちにえいごをおしえてあげました。',
          translation: 'I taught English to my friend (as a favour).',
          more_examples: [
            { jp: 'おかあさんがべんとうをつくってくれました。', en: 'My mother made a lunch box for me.' }
          ]
        }
      ]
    },
    {
      ch: 18, title: 'すもうをみたことがありますか',
      points: [
        {
          pattern: '〜た ことが あります',
          romaji: '~ta koto ga arimasu',
          usage: 'Expresses experience: I have (done something) before.',
          example: 'にほんにいったことがあります。',
          translation: 'I have been to Japan before.',
          more_examples: [
            { jp: 'すしをたべたことがありますか。', en: 'Have you ever eaten sushi?' }
          ]
        },
        {
          pattern: '〜た ことが ありません',
          romaji: '~ta koto ga arimasen',
          usage: 'I have never done ~.',
          example: 'スキーをしたことがありません。',
          translation: 'I have never skied.',
          more_examples: []
        }
      ]
    },
    {
      ch: 19, title: 'もしよければいっしょにいかがですか',
      points: [
        {
          pattern: '〜ませんか',
          romaji: '~masen ka',
          usage: 'Polite invitation: Won\'t you ~? / Would you like to ~?',
          example: 'いっしょにひるごはんをたべませんか。',
          translation: 'Won\'t you eat lunch with me?',
          more_examples: []
        },
        {
          pattern: '〜ましょう',
          romaji: '~mashou',
          usage: 'Suggests doing something together: Let\'s ~!',
          example: 'いっしょにいきましょう。',
          translation: 'Let\'s go together.',
          more_examples: []
        },
        {
          pattern: '〜ましょうか',
          romaji: '~mashou ka',
          usage: 'Offers to do something: Shall I ~? / Shall we ~?',
          example: 'にもつをもちましょうか。',
          translation: 'Shall I carry your luggage?',
          more_examples: []
        }
      ]
    },
    {
      ch: 20, title: 'そのかばん、かしてもらえますか',
      points: [
        {
          pattern: '〜たら',
          romaji: '~tara',
          usage: 'Conditional: When/If ~ happens. Describes a condition or sequence.',
          example: 'うちへかえったら、すぐてをあらいます。',
          translation: 'When I get home, I wash my hands immediately.',
          more_examples: [
            { jp: 'あめがふったら、いえにいます。', en: 'If it rains, I will stay home.' }
          ]
        },
        {
          pattern: '〜ことが できます',
          romaji: '~koto ga dekimasu',
          usage: 'Expresses ability using the plain/dictionary form + こと が できます.',
          example: 'にほんごをはなすことができます。',
          translation: 'I can speak Japanese.',
          more_examples: []
        }
      ]
    },
    {
      ch: 21, title: 'いっしょにくらしたいんですが',
      points: [
        {
          pattern: '〜たいです',
          romaji: '~tai desu',
          usage: 'Expresses the speaker\'s desire to do something. Verb stem + たい。',
          example: 'にほんへいきたいです。',
          translation: 'I want to go to Japan.',
          more_examples: [
            { jp: 'なにかたべたいです。', en: 'I want to eat something.' }
          ]
        },
        {
          pattern: '〜ために',
          romaji: '~tame ni',
          usage: 'In order to ~ / For the purpose of ~. Expresses purpose.',
          example: 'けんこうのためにまいにちはしります。',
          translation: 'I run every day for the sake of my health.',
          more_examples: []
        }
      ]
    },
    {
      ch: 22, title: 'わたしはあのえがすきです',
      points: [
        {
          pattern: '〜と おもいます',
          romaji: '~to omoimasu',
          usage: 'I think that ~. Expresses a personal opinion or conjecture.',
          example: 'あしたはあめがふるとおもいます。',
          translation: 'I think it will rain tomorrow.',
          more_examples: [
            { jp: 'かれはやさしいとおもいます。', en: 'I think he is kind.' }
          ]
        },
        {
          pattern: '〜でしょう',
          romaji: '~deshou',
          usage: 'Probably ~ / I suppose ~. Expresses conjecture or probability.',
          example: 'あしたはいいてんきでしょう。',
          translation: 'It will probably be good weather tomorrow.',
          more_examples: []
        }
      ]
    },
    {
      ch: 23, title: 'あそこにおまわりさんがいます',
      points: [
        {
          pattern: '名詞＋修飾節（普通形）',
          romaji: 'Noun + modification clause (plain form)',
          usage: 'A clause in plain form directly modifies a noun. The verb comes before the noun.',
          example: 'きのうかったほんはおもしろいです。',
          translation: 'The book I bought yesterday is interesting.',
          more_examples: [
            { jp: 'あそこにすわっているひとはだれですか。', en: 'Who is the person sitting over there?' }
          ]
        }
      ]
    },
    {
      ch: 24, title: 'こっちのほうがずっといいですよ',
      points: [
        {
          pattern: 'AよりBのほうが〜',
          romaji: 'A yori B no hou ga ~',
          usage: 'B is more ~ than A. Used for direct comparison between two things.',
          example: 'バスよりでんしゃのほうがはやいです。',
          translation: 'The train is faster than the bus.',
          more_examples: []
        },
        {
          pattern: '〜のなかで〜がいちばん〜',
          romaji: '~no naka de ~ ga ichiban ~',
          usage: 'Among ~, ~ is the most ~. Superlative comparison.',
          example: 'くだもののなかでりんごがいちばんすきです。',
          translation: 'Among fruits, I like apples the most.',
          more_examples: []
        },
        {
          pattern: '〜と〜と どちらが〜',
          romaji: '~to ~to dochira ga ~',
          usage: 'Between ~ and ~, which is more ~? Comparison of two options.',
          example: 'すしとてんぷらとどちらがすきですか。',
          translation: 'Do you prefer sushi or tempura?',
          more_examples: []
        }
      ]
    },
    {
      ch: 25, title: 'よくかんがえてからきめます',
      points: [
        {
          pattern: '〜てから',
          romaji: '~te kara',
          usage: 'After doing ~, then ~. Indicates a sequence: first A, then B.',
          example: 'てをあらってから、たべます。',
          translation: 'After washing my hands, I eat.',
          more_examples: []
        },
        {
          pattern: '〜まえに',
          romaji: '~mae ni',
          usage: 'Before ~ing. The verb is in dictionary form before まえに.',
          example: 'ねるまえに、はをみがきます。',
          translation: 'I brush my teeth before going to bed.',
          more_examples: []
        },
        {
          pattern: '〜あとで',
          romaji: '~ato de',
          usage: 'After ~ing. The verb is in plain past form before あとで.',
          example: 'ひるごはんをたべたあとで、さんぽします。',
          translation: 'After eating lunch, I take a walk.',
          more_examples: []
        }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N4 — Minna no Nihongo II  (Chapters 1–25)
     ════════════════════════════════════════════════════════ */
  N4: [
    {
      ch: 1, chBook: 26, title: 'じょうずになりたいです',
      points: [
        {
          pattern: '〜く なります / 〜に なります',
          romaji: '~ku narimasu / ~ni narimasu',
          usage: 'Become ~. い-adj: drop い→く+なる. な-adj/noun: +に+なる.',
          example: 'にほんごがじょうずになりました。',
          translation: 'My Japanese has gotten better.',
          more_examples: [
            { jp: 'そとがくらくなりました。', en: 'It has gotten dark outside.' }
          ]
        },
        {
          pattern: '〜く します / 〜に します',
          romaji: '~ku shimasu / ~ni shimasu',
          usage: 'Make ~ (intentional). The subject causes a change.',
          example: 'テレビのおとをおおきくしてください。',
          translation: 'Please turn up the TV.',
          more_examples: []
        }
      ]
    },
    {
      ch: 2, chBook: 27, title: 'にほんごがよめます',
      points: [
        {
          pattern: '可能形（〜られる／〜える）',
          romaji: 'Potential form (~rareru / ~eru)',
          usage: 'Expresses ability. Group 1: ~u→~eru. Group 2: ~ru→~rareru. Group 3: できる/こられる.',
          example: 'かんじがよめます。',
          translation: 'I can read kanji.',
          more_examples: [
            { jp: 'このプールではおよげません。', en: 'I cannot swim in this pool.' }
          ]
        }
      ]
    },
    {
      ch: 3, chBook: 28, title: 'なぜにほんへきたんですか',
      points: [
        {
          pattern: '〜ために（目的）',
          romaji: '~tame ni (purpose)',
          usage: 'In order to ~. Used with dictionary form verb for purposeful action.',
          example: 'にほんごをべんきょうするためにきました。',
          translation: 'I came in order to study Japanese.',
          more_examples: []
        },
        {
          pattern: '〜のに（目的）',
          romaji: '~no ni (purpose)',
          usage: 'For doing ~ / needed for ~. Used when expressing what something is used for.',
          example: 'このチケットはびじゅつかんにはいるのにつかいます。',
          translation: 'This ticket is used for entering the art museum.',
          more_examples: []
        }
      ]
    },
    {
      ch: 4, chBook: 29, title: 'もしじかんがあれば…',
      points: [
        {
          pattern: '〜ば',
          romaji: '~ba',
          usage: 'Conditional: if ~. い-adj: drop い→ければ. Verb: ~u→~eba / ~ru→~reba.',
          example: 'もしひまならば、いっしょにいきませんか。',
          translation: 'If you are free, won\'t you come with me?',
          more_examples: [
            { jp: 'はやくおきれば、まにあいます。', en: 'If you wake up early, you will be in time.' }
          ]
        },
        {
          pattern: '〜なら',
          romaji: '~nara',
          usage: 'If (given that) ~. Based on information just received or assumed.',
          example: 'とうきょうへいくなら、しんかんせんがべんりです。',
          translation: 'If you\'re going to Tokyo, the Shinkansen is convenient.',
          more_examples: []
        }
      ]
    },
    {
      ch: 5, chBook: 30, title: '〜といわれています',
      points: [
        {
          pattern: '受け身（〜られる）',
          romaji: 'Passive (~rareru)',
          usage: 'The passive voice. Subject receives the action. Group 1: ~u→~areru. Group 2: ~rareru.',
          example: 'このじだいにつくられたものです。',
          translation: 'It is something made in this era.',
          more_examples: [
            { jp: 'せんせいにほめられました。', en: 'I was praised by the teacher.' }
          ]
        },
        {
          pattern: '〜と いわれています',
          romaji: '~to iwarete imasu',
          usage: 'It is said that ~. Commonly used to report general beliefs or common knowledge.',
          example: 'にほんのみずはきれいだといわれています。',
          translation: 'It is said that Japan\'s water is clean.',
          more_examples: []
        }
      ]
    },
    {
      ch: 6, chBook: 31, title: 'あのえいがをみたことがありますか',
      points: [
        {
          pattern: '使役形（〜させる）',
          romaji: 'Causative form (~saseru)',
          usage: 'Make or let someone do something. Group 1: ~u→~aseru. Group 2: ~saseru.',
          example: 'こどもにやさいをたべさせます。',
          translation: 'I make my child eat vegetables.',
          more_examples: [
            { jp: 'せんせいはがくせいにほんをよませました。', en: 'The teacher made the students read the book.' }
          ]
        },
        {
          pattern: '〜させてください',
          romaji: '~sasete kudasai',
          usage: 'Please let me ~. Humbly asking for permission to do something.',
          example: 'わたしにやらせてください。',
          translation: 'Please let me do it.',
          more_examples: []
        }
      ]
    },
    {
      ch: 7, chBook: 32, title: 'もっとはやくおきればよかった',
      points: [
        {
          pattern: '〜ばよかった',
          romaji: '~ba yokatta',
          usage: 'I should have ~. Expresses regret about something not done.',
          example: 'もっとべんきょうすればよかった。',
          translation: 'I should have studied more.',
          more_examples: []
        },
        {
          pattern: '〜てしまいます',
          romaji: '~te shimaimasu',
          usage: 'End up doing ~ (unintentionally) / finish doing ~. Can express regret.',
          example: 'かぎをわすれてしまいました。',
          translation: 'I ended up forgetting my key.',
          more_examples: []
        }
      ]
    },
    {
      ch: 8, chBook: 33, title: 'みちをおしえてもらえますか',
      points: [
        {
          pattern: '〜てもらえますか / 〜ていただけますか',
          romaji: '~te moraemasu ka / ~te itadakemasu ka',
          usage: 'Can you do ~ for me? Polite request using the receiving pattern.',
          example: 'ちずをかいてもらえますか。',
          translation: 'Could you draw me a map?',
          more_examples: []
        }
      ]
    },
    {
      ch: 9, chBook: 34, title: 'どこへいったらいいですか',
      points: [
        {
          pattern: '〜たら どうですか',
          romaji: '~tara dou desu ka',
          usage: 'Why don\'t you ~? / How about ~ing? Advice pattern.',
          example: 'いちどいってみたらどうですか。',
          translation: 'Why don\'t you try going once?',
          more_examples: []
        },
        {
          pattern: '〜ほうが いいです',
          romaji: '~hou ga ii desu',
          usage: 'It\'s better to ~. Advice or recommendation.',
          example: 'はやくねたほうがいいですよ。',
          translation: 'You should go to sleep early.',
          more_examples: [
            { jp: 'むりをしないほうがいいです。', en: 'It\'s better not to overdo it.' }
          ]
        }
      ]
    },
    {
      ch: 10, chBook: 35, title: 'うちへかえったら、すぐてをあらいます',
      points: [
        {
          pattern: '〜とたんに',
          romaji: '~to tan ni',
          usage: 'The moment ~ / As soon as ~. Expresses that B happened immediately after A.',
          example: 'ドアをあけたとたんに、ねこがとびだしました。',
          translation: 'The moment I opened the door, the cat jumped out.',
          more_examples: []
        },
        {
          pattern: '〜うちに',
          romaji: '~uchi ni',
          usage: 'While ~ / before ~ changes. Act before the window closes.',
          example: 'わかいうちにたくさんりょこうしたいです。',
          translation: 'I want to travel a lot while I\'m young.',
          more_examples: []
        }
      ]
    },
    {
      ch: 11, chBook: 36, title: 'もっとかんがえてみます',
      points: [
        {
          pattern: '〜て みます',
          romaji: '~te mimasu',
          usage: 'Try doing ~. Indicates an attempt or experiment.',
          example: 'このりょうりをつくってみます。',
          translation: 'I\'ll try making this dish.',
          more_examples: [
            { jp: 'きいてみましょう。', en: 'Let\'s try asking.' }
          ]
        }
      ]
    },
    {
      ch: 12, chBook: 37, title: 'かいぎはもうはじまっていますか',
      points: [
        {
          pattern: '〜ておきます',
          romaji: '~te okimasu',
          usage: 'Do ~ in advance for future use. Prepares the situation for later.',
          example: 'パーティーのまえに、たべものをかっておきます。',
          translation: 'Before the party, I will buy food in advance.',
          more_examples: []
        }
      ]
    },
    {
      ch: 13, chBook: 38, title: 'わたしがあのひとをしっています',
      points: [
        {
          pattern: '普通形＋名詞（関係節）',
          romaji: 'Plain form + noun (relative clause)',
          usage: 'A clause modifies a noun. The modifying clause comes before the noun it modifies.',
          example: 'きのうあったひとはやまださんです。',
          translation: 'The person I met yesterday is Mr Yamada.',
          more_examples: [
            { jp: 'わたしがかいたえをみてください。', en: 'Please look at the picture I drew.' }
          ]
        },
        {
          pattern: '〜という〜',
          romaji: '~to iu ~',
          usage: 'Called ~ / named ~ / which says ~.',
          example: '「さくら」というえいがをみました。',
          translation: 'I watched a movie called "Sakura".',
          more_examples: []
        }
      ]
    },
    {
      ch: 14, chBook: 39, title: 'でんしゃがおくれたので…',
      points: [
        {
          pattern: '〜ので',
          romaji: '~node',
          usage: 'Because ~. Softer and more objective than から. Polite in tone.',
          example: 'でんしゃがおくれたので、ちこくしました。',
          translation: 'Because the train was late, I was late.',
          more_examples: []
        },
        {
          pattern: '〜のに（逆接）',
          romaji: '~no ni (contrast)',
          usage: 'Despite ~ / Although ~. Expresses surprise or disappointment at an unexpected result.',
          example: 'あんなにべんきょうしたのに、しけんにおちました。',
          translation: 'Despite studying so hard, I failed the exam.',
          more_examples: []
        }
      ]
    },
    {
      ch: 15, chBook: 40, title: 'けんこうのためにはこうどうしましょう',
      points: [
        {
          pattern: '〜ながら',
          romaji: '~nagara',
          usage: 'While doing ~. Two actions performed by the same subject simultaneously.',
          example: 'おんがくをきながら、べんきょうします。',
          translation: 'I study while listening to music.',
          more_examples: []
        }
      ]
    },
    {
      ch: 16, chBook: 41, title: 'しごとについてかんがえています',
      points: [
        {
          pattern: '〜について',
          romaji: '~ni tsuite',
          usage: 'About ~ / Concerning ~. Used to introduce a topic.',
          example: 'にほんのぶんかについてはなしましょう。',
          translation: 'Let\'s talk about Japanese culture.',
          more_examples: []
        },
        {
          pattern: '〜に関して',
          romaji: '~ni kanshite',
          usage: 'Regarding ~ / With respect to ~. More formal than について.',
          example: 'この問題に関してご意見をください。',
          translation: 'Please give your opinion regarding this matter.',
          more_examples: []
        }
      ]
    },
    {
      ch: 17, chBook: 42, title: 'テレビをみながら、ごはんをたべています',
      points: [
        {
          pattern: '〜し、〜し',
          romaji: '~shi, ~shi',
          usage: 'Both ~ and ~. Lists multiple reasons or features.',
          example: 'このまちはきれいだし、べんりだし、すきです。',
          translation: 'I like this town because it\'s beautiful and convenient.',
          more_examples: []
        }
      ]
    },
    {
      ch: 18, chBook: 43, title: 'せんもんはなんですか',
      points: [
        {
          pattern: '〜によると',
          romaji: '~ni yoru to',
          usage: 'According to ~. Used to cite a source of information.',
          example: 'てんきよほうによると、あしたはあめです。',
          translation: 'According to the weather forecast, it will rain tomorrow.',
          more_examples: []
        }
      ]
    },
    {
      ch: 19, chBook: 44, title: 'にほんのぶんかをしょうかいします',
      points: [
        {
          pattern: '〜として',
          romaji: '~to shite',
          usage: 'As ~ / In the capacity of ~. States the role or capacity of the subject.',
          example: 'せんせいとして、せいとをたいせつにします。',
          translation: 'As a teacher, I cherish my students.',
          more_examples: []
        }
      ]
    },
    {
      ch: 20, chBook: 45, title: 'かんきょうもんだいについて',
      points: [
        {
          pattern: '〜によって',
          romaji: '~ni yotte',
          usage: 'Depending on ~ / By means of ~ / Due to ~. Multi-use particle phrase.',
          example: 'ひとによってかんがえかたがちがいます。',
          translation: 'Ways of thinking differ depending on the person.',
          more_examples: []
        },
        {
          pattern: '〜にともなって',
          romaji: '~ni tomonatte',
          usage: 'Along with ~ / As ~ progresses. Simultaneous change.',
          example: 'ぎじゅつのはってんにともなって、せいかつがかわりました。',
          translation: 'As technology advanced, lifestyles changed.',
          more_examples: []
        }
      ]
    },
    {
      ch: 21, chBook: 46, title: 'かれにあやまったほうがいいですよ',
      points: [
        {
          pattern: '〜ても／〜でも',
          romaji: '~te mo / ~de mo',
          usage: 'Even if ~ / Even though ~. Concessive: the result is the same regardless.',
          example: 'どんなにいそいでも、まにあいません。',
          translation: 'No matter how much I hurry, I won\'t make it.',
          more_examples: []
        }
      ]
    },
    {
      ch: 22, chBook: 47, title: 'このえいがをみたことがありますか',
      points: [
        {
          pattern: '〜そうです（様態）',
          romaji: '~sou desu (appearance)',
          usage: 'Looks like ~ / Seems ~. Based on direct observation. Adj stem + そう.',
          example: 'このケーキはおいしそうです。',
          translation: 'This cake looks delicious.',
          more_examples: []
        },
        {
          pattern: '〜そうです（伝聞）',
          romaji: '~sou desu (hearsay)',
          usage: 'I heard that ~. Based on secondhand information. Plain form + そう.',
          example: 'あしたはあめがふるそうです。',
          translation: 'I heard it will rain tomorrow.',
          more_examples: []
        }
      ]
    },
    {
      ch: 23, chBook: 48, title: 'てきとうにやったらだめですよ',
      points: [
        {
          pattern: '〜ようだ / 〜みたいだ',
          romaji: '~you da / ~mitai da',
          usage: 'It appears that ~ / It seems like ~. Based on evidence or observation.',
          example: 'かれはかぜをひいたようです。',
          translation: 'It appears that he has caught a cold.',
          more_examples: []
        }
      ]
    },
    {
      ch: 24, chBook: 49, title: 'ことばをしらなくても、つたえられます',
      points: [
        {
          pattern: '〜ことにします',
          romaji: '~koto ni shimasu',
          usage: 'Decide to ~. The speaker makes a decision.',
          example: 'まいあさはしることにしました。',
          translation: 'I have decided to run every morning.',
          more_examples: []
        },
        {
          pattern: '〜ことになります',
          romaji: '~koto ni narimasu',
          usage: 'It has been decided that ~ (by circumstance, not personal choice).',
          example: 'らいげつ、おおさかへてんきんすることになりました。',
          translation: 'It has been decided that I will transfer to Osaka next month.',
          more_examples: []
        }
      ]
    },
    {
      ch: 25, chBook: 50, title: 'いままでおせわになりました',
      points: [
        {
          pattern: '〜ていただく',
          romaji: '~te itadaku',
          usage: 'Humble form of てもらう. Receive the favour of someone doing ~.',
          example: 'せんせいにせつめいしていただきました。',
          translation: 'I had the teacher explain it to me (humble).',
          more_examples: []
        },
        {
          pattern: 'お〜します / ご〜します',
          romaji: 'o~shimasu / go~shimasu',
          usage: 'Humble verb forms. Shows respect to the listener by lowering yourself.',
          example: 'のちほどおでんわします。',
          translation: 'I will call you later (humble).',
          more_examples: []
        }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N3 — Minna no Nihongo Chukyu  (Chapters 1–12)
     ════════════════════════════════════════════════════════ */
  N3: [
    {
      ch: 1, title: 'なにかかわったことがありましたか',
      points: [
        {
          pattern: '〜らしい',
          romaji: '~rashii',
          usage: 'It seems ~ / apparently ~. Based on indirect evidence or information.',
          example: 'かれはかぜをひいたらしいです。',
          translation: 'He apparently has a cold.',
          more_examples: []
        },
        {
          pattern: '〜ようだ',
          romaji: '~you da',
          usage: 'It appears that ~. Based on direct perception or evidence.',
          example: 'たれかがくるようです。',
          translation: 'It seems like someone is coming.',
          more_examples: []
        }
      ]
    },
    {
      ch: 2, title: 'ひとにたのむとき',
      points: [
        {
          pattern: '〜ていただけますか',
          romaji: '~te itadakemasu ka',
          usage: 'Would you be able to ~ for me? Very polite request form.',
          example: 'しょるいをかくにんしていただけますか。',
          translation: 'Would you be able to check the documents?',
          more_examples: []
        },
        {
          pattern: '〜てくださいませんか',
          romaji: '~te kudasaimasen ka',
          usage: 'Won\'t you please ~? More polite than てください.',
          example: 'もうすこしまってくださいませんか。',
          translation: 'Won\'t you please wait a little longer?',
          more_examples: []
        }
      ]
    },
    {
      ch: 3, title: 'じかんのつかいかた',
      points: [
        {
          pattern: '〜うちに',
          romaji: '~uchi ni',
          usage: 'While ~ / While there\'s still time. Urgency to act before conditions change.',
          example: 'わかいうちに、たくさんけいけんしたい。',
          translation: 'While I\'m young, I want to experience many things.',
          more_examples: []
        },
        {
          pattern: '〜たびに',
          romaji: '~tabi ni',
          usage: 'Every time ~ / Whenever ~.',
          example: 'にほんへくるたびに、このみせにきます。',
          translation: 'Every time I come to Japan, I come to this shop.',
          more_examples: []
        }
      ]
    },
    {
      ch: 4, title: 'ものをたのむ・かす・かりる',
      points: [
        {
          pattern: '〜まま',
          romaji: '~mama',
          usage: 'Leaving ~ as it is / While still ~. State is unchanged.',
          example: 'くつをはいたまま、へやにはいらないでください。',
          translation: 'Please don\'t enter the room with your shoes on.',
          more_examples: []
        }
      ]
    },
    {
      ch: 5, title: 'ていねいにことわる',
      points: [
        {
          pattern: 'せっかく〜が〜',
          romaji: 'sekkaku ~ ga ~',
          usage: 'Despite the special effort/opportunity ~, unfortunately ~. Used in polite refusals.',
          example: 'せっかくですが、その日はつごうがわるいんです。',
          translation: 'I appreciate the offer, but I\'m afraid I\'m busy that day.',
          more_examples: []
        },
        {
          pattern: 'あいにく〜',
          romaji: 'ainiku ~',
          usage: 'Unfortunately ~. Used at the start of a polite refusal.',
          example: 'あいにく、その日はよていがありまして。',
          translation: 'Unfortunately, I have plans that day.',
          more_examples: []
        }
      ]
    },
    {
      ch: 6, title: 'かんじょうをあらわす',
      points: [
        {
          pattern: '〜て たまらない',
          romaji: '~te tamaranai',
          usage: 'Can\'t stand ~ing / ~ to an unbearable degree. Strong feeling.',
          example: 'ねむくてたまりません。',
          translation: 'I am unbearably sleepy.',
          more_examples: []
        },
        {
          pattern: '〜てしかたがない',
          romaji: '~te shikata ga nai',
          usage: 'Can\'t help feeling ~ / It can\'t be helped. Uncontrollable feeling.',
          example: 'むすこのことがしんぱいでしかたがありません。',
          translation: 'I can\'t help worrying about my son.',
          more_examples: []
        }
      ]
    },
    {
      ch: 7, title: 'いけんをいう',
      points: [
        {
          pattern: '〜にもかかわらず',
          romaji: '~ni mo kakawarazu',
          usage: 'Despite ~ / In spite of ~. Formal contrast expression.',
          example: 'あめにもかかわらず、おおぜいのひとがあつまりました。',
          translation: 'Despite the rain, a large crowd gathered.',
          more_examples: []
        },
        {
          pattern: '〜わりに（は）',
          romaji: '~wari ni (wa)',
          usage: 'For ~ / Considering ~. Unexpected result given the circumstances.',
          example: 'ねだんのわりにはおいしいです。',
          translation: 'It\'s delicious for the price.',
          more_examples: []
        }
      ]
    },
    {
      ch: 8, title: 'だれかにつたえる',
      points: [
        {
          pattern: '〜とのことです',
          romaji: '~to no koto desu',
          usage: 'I hear that ~ / It seems that ~. Formal way to report what was said.',
          example: 'やまださんはあしたくるとのことです。',
          translation: 'I hear that Mr Yamada will come tomorrow.',
          more_examples: []
        },
        {
          pattern: '〜によると〜そうです',
          romaji: '~ni yoru to ~ sou desu',
          usage: 'According to ~ it is said that ~. Citing a source for hearsay information.',
          example: 'てんきよほうによると、あしたはゆきがふるそうです。',
          translation: 'According to the weather forecast, it will snow tomorrow.',
          more_examples: []
        }
      ]
    },
    {
      ch: 9, title: 'ぶんかのちがい',
      points: [
        {
          pattern: '〜にたいして',
          romaji: '~ni taishite',
          usage: 'Towards ~ / In contrast to ~ / Against ~.',
          example: 'わかいひとにたいして、おとしよりのかずがふえています。',
          translation: 'Compared to young people, the number of elderly is increasing.',
          more_examples: []
        }
      ]
    },
    {
      ch: 10, title: 'しぜんとかんきょう',
      points: [
        {
          pattern: '〜にしたがって',
          romaji: '~ni shitagatte',
          usage: 'As ~ / Following ~ / In accordance with ~. Gradual change.',
          example: 'じだいのへんかにしたがって、ことばもかわります。',
          translation: 'As times change, language changes too.',
          more_examples: []
        },
        {
          pattern: '〜につれて',
          romaji: '~ni tsurete',
          usage: 'As ~ / In proportion to ~. Both things change together.',
          example: 'きおんがさがるにつれて、はっぱのいろがかわります。',
          translation: 'As the temperature drops, the color of the leaves changes.',
          more_examples: []
        }
      ]
    },
    {
      ch: 11, title: 'ニュースをよむ',
      points: [
        {
          pattern: '〜をもとに（して）',
          romaji: '~wo moto ni (shite)',
          usage: 'Based on ~ / Drawing from ~.',
          example: 'このえいがは実際のじけんをもとにしています。',
          translation: 'This film is based on a real incident.',
          more_examples: []
        },
        {
          pattern: '〜において',
          romaji: '~ni oite',
          usage: 'In ~ / At ~ / In the context of ~. Formal location/context marker.',
          example: 'このぶんやにおいて、にほんはせかいをリードしています。',
          translation: 'In this field, Japan leads the world.',
          more_examples: []
        }
      ]
    },
    {
      ch: 12, title: 'まとめ — ふくごうひょうげん',
      points: [
        {
          pattern: '〜はずだ',
          romaji: '~hazu da',
          usage: 'Expected to be ~ / Should be ~. Based on reasoning or expectation.',
          example: 'かれはもうきているはずです。',
          translation: 'He should already be here.',
          more_examples: []
        },
        {
          pattern: '〜べきだ',
          romaji: '~beki da',
          usage: 'Should ~ / Ought to ~. Moral obligation or strong advice.',
          example: 'こどもにはにほんごをおしえるべきです。',
          translation: 'You should teach children Japanese.',
          more_examples: []
        },
        {
          pattern: '〜にちがいない',
          romaji: '~ni chigainai',
          usage: 'Must be ~ / There is no doubt that ~. Strong conviction.',
          example: 'かれはうそをついているにちがいない。',
          translation: 'He must be lying.',
          more_examples: []
        }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N2 — Nihongo Somatome N2  (Chapters 1–8)
     ════════════════════════════════════════════════════════ */
  N2: [
    {
      ch: 1, title: '副詞・接続詞',
      points: [
        {
          pattern: '〜どころか',
          romaji: '~doko roku ka',
          usage: 'Far from ~ / Not only ~, but ~. Something is the opposite of expected.',
          example: 'べんきょうするどころか、まいにちあそんでいる。',
          translation: 'Far from studying, he plays every day.',
          more_examples: []
        },
        {
          pattern: '〜うえ（に）',
          romaji: '~ue (ni)',
          usage: 'In addition to ~ / On top of that ~. Accumulation of related facts.',
          example: 'かれはあたまがいいうえに、スポーツもできる。',
          translation: 'In addition to being smart, he is also good at sports.',
          more_examples: []
        }
      ]
    },
    {
      ch: 2, title: '複合動詞',
      points: [
        {
          pattern: '〜きる / 〜きれない',
          romaji: '~kiru / ~kirenai',
          usage: 'Finish ~ing completely / Can\'t finish ~ing. Completion or impossibility of completion.',
          example: 'このしごとはひとりではでききれない。',
          translation: 'This work cannot be completed alone.',
          more_examples: []
        },
        {
          pattern: '〜だす',
          romaji: '~dasu',
          usage: 'Suddenly start ~ing / begin to ~. Sudden or unexpected start.',
          example: 'あかちゃんがなきだしました。',
          translation: 'The baby suddenly started crying.',
          more_examples: []
        }
      ]
    },
    {
      ch: 3, title: '文型 — 条件・逆接',
      points: [
        {
          pattern: '〜とはいえ',
          romaji: '~to wa ie',
          usage: 'Even so / That said / Even though ~. Acknowledges a fact then counters it.',
          example: 'むずかしいとはいえ、あきらめないでください。',
          translation: 'Even though it\'s difficult, please don\'t give up.',
          more_examples: []
        },
        {
          pattern: '〜くせに',
          romaji: '~kuse ni',
          usage: 'Even though ~ (critical/disapproving). Shows the speaker\'s negative feeling.',
          example: 'しらないくせに、わかったふりをするな。',
          translation: 'Don\'t pretend to know when you don\'t.',
          more_examples: []
        }
      ]
    },
    {
      ch: 4, title: '文型 — 限定・程度',
      points: [
        {
          pattern: '〜だけあって',
          romaji: '~dake atte',
          usage: 'As you would expect from ~ / Worthy of ~. The result justifies the reason.',
          example: 'プロだけあって、えんそうがすばらしかった。',
          translation: 'As you would expect from a professional, the performance was wonderful.',
          more_examples: []
        },
        {
          pattern: '〜にかぎって',
          romaji: '~ni kagitte',
          usage: 'Precisely when ~ / It\'s always the case with ~. Often ironic.',
          example: 'いそがしいときにかぎって、でんわがくる。',
          translation: 'It\'s always when I\'m busy that the phone rings.',
          more_examples: []
        }
      ]
    },
    {
      ch: 5, title: '文型 — 変化・様態',
      points: [
        {
          pattern: '〜をつうじて',
          romaji: '~wo tsuujite',
          usage: 'Through ~ / Throughout ~ / By means of ~.',
          example: 'ゆうじんをつうじてしごとをみつけました。',
          translation: 'I found a job through a friend.',
          more_examples: []
        },
        {
          pattern: '〜にわたって',
          romaji: '~ni watatte',
          usage: 'Over ~ / Spanning ~ (time or area). Covers a range.',
          example: 'さんねんにわたるけんきゅうがやっとおわった。',
          translation: 'The research spanning three years is finally over.',
          more_examples: []
        }
      ]
    },
    {
      ch: 6, title: '敬語 — 尊敬語・謙譲語',
      points: [
        {
          pattern: 'お〜になります（尊敬）',
          romaji: 'o~ni narimasu (respectful)',
          usage: 'Respectful form of verbs. The subject (superiors/customers) does something.',
          example: 'しゃちょうはもうおかえりになりました。',
          translation: 'The president has already left (respectful).',
          more_examples: []
        },
        {
          pattern: 'お〜します（謙譲）',
          romaji: 'o~shimasu (humble)',
          usage: 'Humble form. Lowers the speaker\'s action to show respect to the listener.',
          example: 'のちほどおでんわします。',
          translation: 'I will call you later (humble).',
          more_examples: []
        }
      ]
    },
    {
      ch: 7, title: '読解語彙 — 社会・経済',
      points: [
        {
          pattern: '〜にともなう変化',
          romaji: '~ni tomonau henka',
          usage: 'Change accompanying ~. Used to describe social/economic trends.',
          example: 'こうれいかにともなう社会問題がふえています。',
          translation: 'Social problems accompanying the aging of society are increasing.',
          more_examples: []
        }
      ]
    },
    {
      ch: 8, title: '読解語彙 — 科学・技術',
      points: [
        {
          pattern: '〜によりもたらされる',
          romaji: '~ni yori motarasareru',
          usage: 'Brought about by ~ / Caused by ~. Formal written expression.',
          example: 'ぎじゅつかいはつによりもたらされるえいきょう',
          translation: 'Effects brought about by technological development.',
          more_examples: []
        }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N1 — Nihongo Somatome N1  (Chapters 1–8)
     ════════════════════════════════════════════════════════ */
  N1: [
    {
      ch: 1, title: '副詞・文章語',
      points: [
        {
          pattern: '〜いかん（によって）',
          romaji: '~ikan (ni yotte)',
          usage: 'Depending on ~ / According to how ~. Formal written style.',
          example: 'やりかたいかんによっては、うまくいくこともある。',
          translation: 'Depending on how you do it, it may well succeed.',
          more_examples: []
        },
        {
          pattern: '〜をおいて〜ない',
          romaji: '~wo oite ~nai',
          usage: 'There is no one/nothing other than ~. Emphatic: only ~.',
          example: 'このしごとができるのは、かれをおいていない。',
          translation: 'There is no one other than him who can do this job.',
          more_examples: []
        }
      ]
    },
    {
      ch: 2, title: '複合語・派生語',
      points: [
        {
          pattern: '〜をきっかけとして',
          romaji: '~wo kikkake to shite',
          usage: 'Using ~ as a trigger / Taking ~ as an opportunity.',
          example: 'このじけんをきっかけとして、せいさくがかわった。',
          translation: 'Using this incident as a trigger, the policy changed.',
          more_examples: []
        }
      ]
    },
    {
      ch: 3, title: '文型 — 強調・主張',
      points: [
        {
          pattern: '〜にほかならない',
          romaji: '~ni hoka naranai',
          usage: 'Nothing but ~ / None other than ~. Strong emphasis on what something truly is.',
          example: 'それはうそにほかならない。',
          translation: 'That is nothing but a lie.',
          more_examples: []
        },
        {
          pattern: '〜というものだ',
          romaji: '~to iu mono da',
          usage: 'That is what ~ means / That\'s the nature of ~. General truth statement.',
          example: 'それが人生というものだ。',
          translation: 'That\'s what life is.',
          more_examples: []
        }
      ]
    },
    {
      ch: 4, title: '文型 — 理由・原因',
      points: [
        {
          pattern: '〜ゆえに',
          romaji: '~yue ni',
          usage: 'Therefore ~ / Because of ~ (literary/formal).',
          example: 'わかさゆえに、おおくのまちがいをおかした。',
          translation: 'Because of my youth, I made many mistakes.',
          more_examples: []
        },
        {
          pattern: '〜の末（に）',
          romaji: '~no sue (ni)',
          usage: 'After much ~ / As a result of prolonged ~.',
          example: 'ながいとうろんのすえ、けつろんにたっした。',
          translation: 'After much discussion, they reached a conclusion.',
          more_examples: []
        }
      ]
    },
    {
      ch: 5, title: '文型 — 評価・判断',
      points: [
        {
          pattern: '〜ざるをえない',
          romaji: '~zaru wo enai',
          usage: 'Cannot help but ~ / Have no choice but ~. Compelled despite preference.',
          example: 'じじょうがじじょうだから、ことわらざるをえない。',
          translation: 'Given the circumstances, I have no choice but to decline.',
          more_examples: []
        },
        {
          pattern: '〜かねない',
          romaji: '~kanenai',
          usage: 'Might well ~ / Could easily lead to ~. Negative possibility warning.',
          example: 'そんなことをいうと、きずつけかねない。',
          translation: 'Saying something like that might well hurt them.',
          more_examples: []
        }
      ]
    },
    {
      ch: 6, title: '語彙 — 政治・法律',
      points: [
        {
          pattern: '〜に照らして',
          romaji: '~ni terashite',
          usage: 'In light of ~ / Judged by ~. Formal, used in legal/academic contexts.',
          example: 'ほうりつにてらして、このこうどうはふてきせつだ。',
          translation: 'In light of the law, this behaviour is inappropriate.',
          more_examples: []
        }
      ]
    },
    {
      ch: 7, title: '語彙 — 心理・哲学',
      points: [
        {
          pattern: '〜にたえる / 〜にたえない',
          romaji: '~ni taeru / ~ni taenai',
          usage: 'Worth ~ing / Cannot bear to ~. Evaluates whether something is worthy.',
          example: 'このさくひんはかんしょうにたえる。',
          translation: 'This work is worth appreciating.',
          more_examples: [
            { jp: 'なさけなくて、みるにたえない。', en: 'It\'s so pathetic that I can\'t bear to watch.' }
          ]
        }
      ]
    },
    {
      ch: 8, title: '語彙 — 文学・芸術',
      points: [
        {
          pattern: '〜をもって',
          romaji: '~wo motte',
          usage: 'With ~ / By means of ~ / As of ~. Formal closing/instrumental expression.',
          example: 'ほんじつをもちまして、えいぎょうをしゅうりょうします。',
          translation: 'As of today, we will conclude business operations.',
          more_examples: []
        },
        {
          pattern: '〜ならでは（の）',
          romaji: '~nara de wa (no)',
          usage: 'Only possible with ~ / Unique to ~. Something special only ~ can provide.',
          example: 'にほんならではのぶんかをたいけんしたい。',
          translation: 'I want to experience culture unique to Japan.',
          more_examples: []
        }
      ]
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────────────────
   NZChapterGrammarPage — Adds a "Grammar" sub-tab to the Chapter Vocab modal
   ────────────────────────────────────────────────────────────────────────────── */
window.NZChapterGrammar = NZChapterGrammar;

// ============================================================
// Source: nz-chapter-vocab.js
// ============================================================
'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/nz-chapter-vocab.js
// NihongoZen — Chapter-Wise Vocabulary Module
//
//  • N5  → Minna no Nihongo I    (Chapters 1–25)
//  • N4  → Minna no Nihongo II   (Chapters 26–50, shown as Ch 1–25 of Book II)
//  • N3  → Minna no Nihongo Chukyu (Chapters 1–12)
//  • N2  → Nihongo Somatome N2   (Chapters 1–8)
//  • N1  → Nihongo Somatome N1   (Chapters 1–8)
//
// Drop-in addition to the existing VocabPage module.
// Adds a "📖 Chapters" button alongside the existing "📚 Basic Vocab" button.
// All styling strictly follows the existing NihongoZen CSS variable system.
// ═══════════════════════════════════════════════════════════════════════════════

/* ──────────────────────────────────────────────────────────────────────────────
   CHAPTER VOCABULARY DATA
   Each chapter follows its textbook's actual lesson vocabulary.
   ────────────────────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────────────────
   CHAPTER DATA — sourced from chapters.js + vocabLevel.js
   NZChapterData is populated by chapters.js (chapter metadata) and
   vocabLevel.js (word arrays). Both files must be loaded before this module.
   The merge happens automatically in chapters.js via mergeVocabWords().
   ────────────────────────────────────────────────────────────────────────────── */


/* ──────────────────────────────────────────────────────────────────────────────
   NZChapterVocab MODULE
   ────────────────────────────────────────────────────────────────────────────── */
const NZChapterVocab = (() => {

  /* ── State ────────────────────────────────────────────── */
  let activeLevel   = 'N5';
  let activeChapter = 0;          // index into NZChapterData[level]
  let mode          = 'grid';
  let cardIndex     = 0;
  let flipped       = false;
  let speakingId    = null;
  let speakTimer    = null;
  let keyHandler    = null;
  let searchQuery   = '';

  /* ── CSS (injected once) ─────────────────────────────── */
  (function injectStyles() {
    if (document.getElementById('nz-chapter-vocab-styles')) return;
    const s = document.createElement('style');
    s.id = 'nz-chapter-vocab-styles';
    s.textContent = `
      /* Overlay */
      #nzcv-overlay {
        display:none; position:fixed; inset:0;
        background:rgba(0,0,0,0.72);
        z-index:1000; backdrop-filter:blur(4px);
      }
      #nzcv-overlay.open { display:flex; align-items:center; justify-content:center; }
      #nzcv-modal {
        width:min(98vw,1100px); max-height:92vh;
        background:var(--bg,#0f0f0f);
        border:1px solid var(--border,#333);
        border-radius:20px; overflow:hidden;
        display:flex; flex-direction:column;
      }
      /* Chapter sidebar */
      #nzcv-sidebar {
        width:210px; flex-shrink:0;
        border-right:1px solid var(--border,#2a2a2a);
        overflow-y:auto; padding:12px 0;
        scrollbar-width:thin;
        scrollbar-color:var(--border) transparent;
      }
      .nzcv-ch-btn {
        width:100%; padding:9px 16px;
        background:transparent; border:none;
        text-align:left; cursor:pointer;
        font-family:inherit; font-size:12px;
        color:var(--fg-muted,#888);
        transition:background 0.12s, color 0.12s;
        border-left:3px solid transparent;
        line-height:1.4;
      }
      .nzcv-ch-btn:hover { background:rgba(255,255,255,0.04); color:var(--fg,#f0f0f0); }
      .nzcv-ch-btn.active {
        background:rgba(232,68,106,0.1);
        color:var(--fg,#f0f0f0);
        border-left-color:var(--primary,#e8446a);
        font-weight:700;
      }
      /* Chapter pill badge */
      .nzcv-ch-num {
        display:inline-block;
        padding:1px 6px; border-radius:4px;
        font-size:10px; font-weight:700;
        background:var(--card-elevated,#1a1a1a);
        color:var(--fg-muted); margin-right:6px;
        font-family:'JetBrains Mono',monospace;
      }
      /* Level tab active underline */
      .nzcv-lvl-tab { position:relative; }
      .nzcv-lvl-tab.active::after {
        content:''; position:absolute;
        bottom:-2px; left:50%; transform:translateX(-50%);
        width:70%; height:2px;
        background:var(--success); border-radius:2px;
      }
      /* Vocab word card */
      .nzcv-word-card {
        border-radius:12px; border:1px solid var(--border,#2a2a2a);
        background:var(--card,#141414);
        padding:16px; cursor:pointer; position:relative;
        transition:transform 0.18s, box-shadow 0.18s;
      }
      .nzcv-word-card:hover {
        transform:translateY(-3px);
        box-shadow:0 8px 28px rgba(0,0,0,0.5);
      }
      /* Level colors */
      .nzcv-lvl-N5  { color:var(--success); }
      .nzcv-lvl-N4  { color:#06b6d4; }
      .nzcv-lvl-N3  { color:#eab308; }
      .nzcv-lvl-N2  { color:#a855f7; }
      .nzcv-lvl-N1  { color:#ef4444; }
      /* Scrollbar */
      #nzcv-sidebar::-webkit-scrollbar { width:4px; }
      #nzcv-sidebar::-webkit-scrollbar-thumb { background:var(--border,#333); border-radius:4px; }
      /* Flip */
      #nzcv-flip-inner.flipped { transform:rotateY(180deg); }
      /* Equalizer */
      .nzcv-eq { display:flex; align-items:flex-end; gap:2px; height:14px; }
      .nzcv-eq-bar {
        width:3px; border-radius:2px;
        background:var(--primary,#e8446a);
        animation:nzcvEqBounce 0.8s ease-in-out infinite;
      }
      .nzcv-eq-bar:nth-child(1){animation-delay:0s;    height:6px;}
      .nzcv-eq-bar:nth-child(2){animation-delay:0.15s; height:12px;}
      .nzcv-eq-bar:nth-child(3){animation-delay:0.3s;  height:8px;}
      @keyframes nzcvEqBounce {
        0%,100%{transform:scaleY(0.4);}
        50%    {transform:scaleY(1);}
      }
      /* Search bar */
      .nzcv-search-wrap {
        display:flex; align-items:center; gap:8px;
        background:var(--card-elevated,#1a1a1a);
        border:1px solid var(--border,#2a2a2a);
        border-radius:12px; padding:0 14px; height:38px;
      }
      .nzcv-search-wrap input {
        flex:1; background:transparent; border:none; outline:none;
        color:var(--fg,#f0f0f0); font-size:13px; font-family:inherit;
      }
      .nzcv-search-wrap input::placeholder { color:var(--fg-muted,#666); }
      /* Open button */
      #nzcv-open-btn {
        background:linear-gradient(135deg,#e8446a,#c0304f);
        color:#fff; border:none;
        padding:8px 18px; border-radius:10px;
        font-size:13px; font-weight:700;
        cursor:pointer; font-family:inherit;
        transition:opacity 0.15s, transform 0.15s;
        letter-spacing:0.3px;
      }
      #nzcv-open-btn:hover { opacity:0.88; transform:translateY(-1px); }
      /* Chapter header */
      .nzcv-ch-header {
        padding:16px 20px 12px;
        border-bottom:1px solid var(--border,#2a2a2a);
      }
      .nzcv-ch-title {
        font-size:18px; font-weight:800; color:var(--fg);
        letter-spacing:-0.3px; margin-bottom:2px;
        font-family:'Noto Sans JP', sans-serif;
      }
      .nzcv-ch-topic {
        font-size:12px; color:var(--fg-muted); margin-bottom:10px;
      }
      /* Nav button hover */
      .nzcv-nav-btn:hover { border-color:var(--primary,#e8446a) !important; }
    `;
    document.head.appendChild(s);
  })();

  /* ── Colours per level ───────────────────────────────── */
  const COLORS = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };

  /* ── Audio ───────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang=lang; u.rate=rate;
    window.speechSynthesis.speak(u);
  }
  function speakWord(jp, en) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const j = new SpeechSynthesisUtterance(jp);
    j.lang='ja-JP'; j.rate=0.8;
    j.onend = () => setTimeout(() => {
      const e = new SpeechSynthesisUtterance(en);
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    }, 600);
    window.speechSynthesis.speak(j);
  }

  /* ── Escape ──────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Speaker icon ────────────────────────────────────── */
  function speakerIcon(size=15) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>`;
  }

  /* ── Current chapter data ────────────────────────────── */
  function getCurrentChapter() {
    const chapters = (window.NZChapterData && window.NZChapterData[activeLevel]) || [];
    return chapters[activeChapter] || chapters[0];
  }

  /* ── Filtered words ──────────────────────────────────── */
  function getFiltered() {
    const ch = getCurrentChapter();
    if (!ch) return [];
    let words = ch.words || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(w =>
        w.jp.includes(q) ||
        (w.romaji && w.romaji.toLowerCase().includes(q)) ||
        w.en.toLowerCase().includes(q)
      );
    }
    return words;
  }

  /* ── Speaking state ──────────────────────────────────── */
  function handleSpeakBtn(e, word) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId = word.jp;
    speakWord(word.jp, word.en);
    updateSpeakBtns();
    speakTimer = setTimeout(() => { speakingId = null; updateSpeakBtns(); }, 3500);
  }
  function updateSpeakBtns() {
    document.querySelectorAll('.nzcv-speak-btn').forEach(btn => {
      const playing = btn.dataset.jp === speakingId;
      btn.style.background = playing ? 'var(--primary-dim,rgba(232,68,106,0.15))' : 'transparent';
      btn.style.color       = playing ? 'var(--primary,#e8446a)' : 'var(--fg-muted,#888)';
      btn.innerHTML = playing
        ? `<div class="nzcv-eq"><div class="nzcv-eq-bar"></div><div class="nzcv-eq-bar"></div><div class="nzcv-eq-bar"></div></div>`
        : speakerIcon(14);
    });
  }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode !== 'flashcard') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
      else if (e.key === ' ') { e.preventDefault(); flipCard(); }
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler=null; }
  }

  /* ── Flashcard controls ──────────────────────────────── */
  function nextCard() {
    flipped=false; updateFlipEl();
    setTimeout(() => { cardIndex=(cardIndex+1)%Math.max(1,getFiltered().length); renderFCContent(); }, 150);
  }
  function prevCard() {
    flipped=false; updateFlipEl();
    setTimeout(() => { const f=getFiltered(); cardIndex=(cardIndex-1+Math.max(1,f.length))%Math.max(1,f.length); renderFCContent(); }, 150);
  }
  function flipCard() { flipped=!flipped; updateFlipEl(); }
  function updateFlipEl() {
    const el = document.getElementById('nzcv-flip-inner');
    if (el) el.classList.toggle('flipped', flipped);
  }

  /* ── Render: sidebar ─────────────────────────────────── */
  function renderSidebar() {
    const sb = document.getElementById('nzcv-sidebar');
    if (!sb) return;
    const chapters = (window.NZChapterData && window.NZChapterData[activeLevel]) || [];
    const color = COLORS[activeLevel];
    sb.innerHTML = chapters.map((ch, i) => {
      const label = activeLevel === 'N4'
        ? `Ch ${ch.ch} <span style="font-size:9px;opacity:0.6;">(Bk II)</span>`
        : `Ch ${ch.ch}`;
      return `<button class="nzcv-ch-btn ${i===activeChapter?'active':''}" data-idx="${i}">
        <span class="nzcv-ch-num" style="color:${color};background:${color}18;">${ch.ch}</span>
        <span style="font-size:11px;">${esc(ch.title)}</span>
      </button>`;
    }).join('');
    sb.querySelectorAll('.nzcv-ch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChapter = parseInt(btn.dataset.idx);
        cardIndex=0; flipped=false; searchQuery='';
        const si = document.getElementById('nzcv-search');
        if (si) si.value='';
        renderAll();
      });
    });
  }

  /* ── Render: level tabs ──────────────────────────────── */
  function renderLevelTabs() {
    const wrap = document.getElementById('nzcv-level-tabs');
    if (!wrap) return;
    wrap.innerHTML = ['N5','N4','N3','N2','N1'].map(lvl => `
      <button class="nzcv-lvl-tab ${activeLevel===lvl?'active':''}" data-level="${lvl}"
        style="padding:9px 16px;font-size:13px;font-weight:700;
               background:transparent;border:none;
               color:${activeLevel===lvl?'var(--fg)':'var(--fg-muted)'};
               cursor:pointer;font-family:inherit;transition:color 0.15s;">
        <span class="nzcv-lvl-${lvl}">${lvl}</span>
      </button>`).join('');
    wrap.querySelectorAll('.nzcv-lvl-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLevel = btn.dataset.level;
        activeChapter = 0; cardIndex=0; flipped=false; searchQuery='';
        const si = document.getElementById('nzcv-search');
        if (si) si.value='';
        renderAll();
      });
    });
  }

  /* ── Render: mode buttons ────────────────────────────── */
  function renderModeBtns() {
    const wrap = document.getElementById('nzcv-mode-btns');
    if (!wrap) return;
    wrap.innerHTML = ['grid','flashcard'].map(m => `
      <button class="nzcv-mode-btn" data-mode="${m}"
        style="padding:7px 13px;border-radius:8px;font-size:12px;font-weight:600;
               border:1px solid ${mode===m?'var(--primary)':'var(--border)'};
               background:${mode===m?'var(--primary)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};
               cursor:pointer;font-family:inherit;transition:all 0.15s;">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.nzcv-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        detachKeys();
        mode = btn.dataset.mode;
        flipped = false;
        renderModeBtns();
        renderContent();
      });
    });
  }

  /* ── Render: chapter header ──────────────────────────── */
  function renderChapterHeader() {
    const wrap = document.getElementById('nzcv-ch-header');
    if (!wrap) return;
    const ch = getCurrentChapter();
    if (!ch) { wrap.innerHTML=''; return; }
    const color = COLORS[activeLevel];
    const bookLabel = activeLevel==='N4' ? `Minna no Nihongo II — Ch ${ch.chBook||ch.ch}` :
                      activeLevel==='N5' ? `Minna no Nihongo I — Ch ${ch.ch}` :
                      activeLevel==='N3' ? `Minna no Nihongo Chukyu — Ch ${ch.ch}` :
                      `Nihongo Somatome ${activeLevel} — Ch ${ch.ch}`;
    wrap.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;
                         background:${color}22;color:${color};">${esc(activeLevel)}</span>
            <span style="font-size:11px;color:var(--fg-muted);">${esc(bookLabel)}</span>
          </div>
          <div class="nzcv-ch-title">${esc(ch.title)}</div>
          <div class="nzcv-ch-topic">${esc(ch.topic)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:11px;color:var(--fg-muted);">${ch.words.length} words</span>
          <button id="nzcv-prev-ch" class="nzcv-nav-btn"
            style="padding:7px;border-radius:10px;background:var(--card-elevated);
                   border:1px solid var(--border);cursor:pointer;color:var(--fg);transition:border-color 0.15s;"
            ${activeChapter===0?'disabled style="opacity:0.3;pointer-events:none;"':''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button id="nzcv-next-ch" class="nzcv-nav-btn"
            style="padding:7px;border-radius:10px;background:var(--card-elevated);
                   border:1px solid var(--border);cursor:pointer;color:var(--fg);transition:border-color 0.15s;"
            ${activeChapter>=((window.NZChapterData && window.NZChapterData[activeLevel])||[]).length-1?'disabled style="opacity:0.3;pointer-events:none;"':''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>`;

    document.getElementById('nzcv-prev-ch')?.addEventListener('click', () => {
      if (activeChapter > 0) {
        activeChapter--; cardIndex=0; flipped=false;
        renderSidebar(); renderAll();
      }
    });
    document.getElementById('nzcv-next-ch')?.addEventListener('click', () => {
      const chapters = (window.NZChapterData && window.NZChapterData[activeLevel]) || [];
      if (activeChapter < chapters.length-1) {
        activeChapter++; cardIndex=0; flipped=false;
        renderSidebar(); renderAll();
      }
    });
  }

  /* ── Render: grid ────────────────────────────────────── */
  function renderGrid() {
    const area = document.getElementById('nzcv-main-area');
    if (!area) return;
    const filtered = getFiltered();
    const color = COLORS[activeLevel];
    if (!filtered.length) {
      area.innerHTML = `<p style="color:var(--fg-muted);text-align:center;padding:40px;">No words found.</p>`;
      return;
    }
    area.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;padding:16px;">
      ${filtered.map(word => `
        <div class="nzcv-word-card" data-jp="${esc(word.jp)}"
          style="border-left:3px solid ${color};">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
            <div>
              <div style="font-family:'Noto Sans JP',sans-serif;font-size:20px;font-weight:700;
                          color:var(--fg);margin-bottom:2px;">${esc(word.jp)}</div>
              <p style="font-family:'JetBrains Mono',monospace;font-size:10px;
                        color:var(--fg-muted);font-style:italic;">${esc(word.romaji||'')}</p>
            </div>
            <button class="nzcv-speak-btn" data-jp="${esc(word.jp)}" data-en="${esc(word.en)}"
              style="padding:5px;border-radius:8px;border:none;background:transparent;
                     color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;">
              ${speakerIcon(14)}
            </button>
          </div>
          <p style="font-size:12px;color:var(--fg);margin:0;">${esc(word.en)}</p>
        </div>`).join('')}
    </div>`;

    area.querySelectorAll('.nzcv-word-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.nzcv-speak-btn')) return;
        speak(card.dataset.jp);
      });
    });
    area.querySelectorAll('.nzcv-speak-btn').forEach(btn => {
      btn.addEventListener('click', e => handleSpeakBtn(e, { jp:btn.dataset.jp, en:btn.dataset.en }));
    });
  }

  /* ── Render: flashcard ───────────────────────────────── */
  function renderFlashcard() {
    const area = document.getElementById('nzcv-main-area');
    if (!area) return;
    area.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;max-width:380px;margin:20px auto 0;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → to navigate · Space to flip
  </p>
  <div id="nzcv-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="nzcv-flip-inner"
      style="width:100%;height:220px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="nzcv-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
      <div id="nzcv-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="nzcv-fc-prev" class="nzcv-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg);transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="nzcv-fc-counter" style="font-family:'JetBrains Mono',monospace;font-size:13px;
                                       color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="nzcv-fc-next" class="nzcv-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg);transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="nzcv-fc-reset" class="nzcv-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg-muted);transition:border-color 0.15s;margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
      </svg>
    </button>
  </div>
  <div id="nzcv-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('nzcv-fc-wrap').addEventListener('click', flipCard);
    document.getElementById('nzcv-fc-prev').addEventListener('click', prevCard);
    document.getElementById('nzcv-fc-next').addEventListener('click', nextCard);
    document.getElementById('nzcv-fc-reset').addEventListener('click', () => {
      cardIndex=0; flipped=false; updateFlipEl(); renderFCContent();
    });
    renderFCContent();
    attachKeys();
  }

  /* ── Render: flashcard content ───────────────────────── */
  function renderFCContent() {
    const filtered = getFiltered();
    if (!filtered.length) return;
    if (cardIndex >= filtered.length) cardIndex = 0;
    const word  = filtered[cardIndex];
    const color = COLORS[activeLevel];
    const front = document.getElementById('nzcv-fc-front');
    const back  = document.getElementById('nzcv-fc-back');
    const counter = document.getElementById('nzcv-fc-counter');
    updateFlipEl();

    if (front) front.innerHTML = `
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:48px;font-weight:700;color:var(--fg);">${esc(word.jp)}</div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--fg-muted);">${esc(word.romaji||'')}</p>
      <button id="nzcv-fc-speak-front"
        style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
               border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
               color:var(--primary);font-size:12px;cursor:pointer;margin-top:8px;font-family:inherit;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to reveal meaning</p>`;

    if (back) back.innerHTML = `
      <p style="font-size:22px;font-weight:700;color:var(--fg);text-align:center;margin-bottom:10px;">${esc(word.en)}</p>
      <span style="padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;
                   background:${color}22;color:${color};margin-bottom:10px;">${esc(activeLevel)}</span>
      <button id="nzcv-fc-speak-back"
        style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
               border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
               color:var(--primary);font-size:12px;cursor:pointer;font-family:inherit;">
        ${speakerIcon(12)} Hear both
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to flip back</p>`;

    document.getElementById('nzcv-fc-speak-front')?.addEventListener('click', e => {
      e.stopPropagation(); speak(word.jp);
    });
    document.getElementById('nzcv-fc-speak-back')?.addEventListener('click', e => {
      e.stopPropagation(); speakWord(word.jp, word.en);
    });
    if (counter) counter.textContent = `${cardIndex+1} / ${filtered.length}`;

    const dots = document.getElementById('nzcv-fc-dots');
    if (dots) {
      const shown = filtered.slice(0, Math.min(filtered.length, 20));
      dots.innerHTML = shown.map((_,i) => `
        <button class="nzcv-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.nzcv-dot').forEach(d => d.addEventListener('click', () => {
        cardIndex=parseInt(d.dataset.i); flipped=false; updateFlipEl(); renderFCContent();
      }));
    }
  }

  /* ── Render: content area ────────────────────────────── */
  function renderContent() {
    if (mode === 'grid') { detachKeys(); renderGrid(); }
    else renderFlashcard();
  }

  /* ── Full re-render ──────────────────────────────────── */
  function renderAll() {
    renderLevelTabs();
    renderSidebar();
    renderChapterHeader();
    renderModeBtns();
    renderContent();
    // scroll active chapter into view in sidebar
    const activeSbBtn = document.querySelector('.nzcv-ch-btn.active');
    activeSbBtn?.scrollIntoView({ block:'nearest', behavior:'smooth' });
  }

  /* ── Build modal ─────────────────────────────────────── */
  function buildModal() {
    const ov = document.createElement('div');
    ov.id = 'nzcv-overlay';
    ov.innerHTML = `
<div id="nzcv-modal">
  <!-- Top bar -->
  <div style="display:flex;align-items:center;justify-content:space-between;
              padding:16px 20px;border-bottom:1px solid var(--border,#2a2a2a);flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <h2 style="font-size:18px;font-weight:800;color:var(--fg);letter-spacing:-0.3px;white-space:nowrap;">
        📖 Chapter Vocabulary
      </h2>
      <!-- Level tabs -->
      <div id="nzcv-level-tabs"
        style="display:flex;align-items:center;background:var(--card-elevated,#1a1a1a);
               border:1px solid var(--border,#2a2a2a);border-radius:12px;padding:3px;"></div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div id="nzcv-mode-btns" style="display:flex;gap:8px;"></div>
      <button id="nzcv-close-btn"
        style="padding:8px;border-radius:10px;background:var(--card-elevated);
               border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);
               font-size:18px;line-height:1;transition:border-color 0.15s;">✕</button>
    </div>
  </div>

  <!-- Body: sidebar + content -->
  <div style="display:flex;flex:1;overflow:hidden;min-height:0;">
    <!-- Sidebar -->
    <div id="nzcv-sidebar"></div>

    <!-- Right panel -->
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;">
      <!-- Chapter header -->
      <div id="nzcv-ch-header" class="nzcv-ch-header" style="flex-shrink:0;"></div>

      <!-- Search bar -->
      <div style="padding:10px 16px;flex-shrink:0;border-bottom:1px solid var(--border,#2a2a2a);">
        <div class="nzcv-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input id="nzcv-search" type="text" placeholder="Search Japanese, romaji, English…" />
        </div>
      </div>

      <!-- Main vocab area -->
      <div id="nzcv-main-area" style="flex:1;overflow-y:auto;"></div>
    </div>
  </div>
</div>`;
    document.body.appendChild(ov);

    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.getElementById('nzcv-close-btn').addEventListener('click', close);
    document.getElementById('nzcv-search').addEventListener('input', e => {
      searchQuery = e.target.value;
      cardIndex = 0;
      renderContent();
    });

    ov.classList.add('open');
    renderAll();
  }

  /* ── Open / close ────────────────────────────────────── */
  function open() {
    const existing = document.getElementById('nzcv-overlay');
    if (!existing) buildModal();
    else {
      existing.classList.add('open');
      renderAll();
    }
  }
  function close() {
    detachKeys();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const ov = document.getElementById('nzcv-overlay');
    if (ov) ov.classList.remove('open');
  }

  /* ── Inject button into vocab page ──────────────────── */
  function injectButton() {
    // Wait for the vocab page button container to exist
    const tryInject = () => {
      const bvBtn = document.getElementById('bv-open-btn');
      if (!bvBtn) { setTimeout(tryInject, 300); return; }
      if (document.getElementById('nzcv-open-btn')) return; // already injected
      const btn = document.createElement('button');
      btn.id = 'nzcv-open-btn';
      btn.innerHTML = '📖 Chapters';
      btn.addEventListener('click', open);
      bvBtn.parentNode.insertBefore(btn, bvBtn);
    };
    tryInject();
  }

  /* ── Public API ──────────────────────────────────────── */
  return { open, close, injectButton };
})();

window.NZChapterVocab = NZChapterVocab;

// Auto-inject the button once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NZChapterVocab.injectButton());
} else {
  NZChapterVocab.injectButton();
}

// ============================================================
// Source: nz-vocab-module__10_.js
// ============================================================
'use strict';
/**
 * NihongoZen — Vocabulary Page (Rebuilt)
 * Matches reference UI: 語彙 Vocabulary Study header, SRS level buttons,
 * N5/N4/N3/N2/N1 tabs with green underline active, search bar,
 * + "Basic Vocab" button housing 2,156 words × 20 categories.
 */

/* =========================================================
   VOCAB PAGE CSS
   ========================================================= */
(function injectVocabStyles() {
  if (document.getElementById('vocab-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'vocab-page-styles';
  style.textContent = `
    /* ── Scrollbar hide ─────────────────────────────────── */
    #vocab-cat-tabs::-webkit-scrollbar,
    #vocab-level-tabs::-webkit-scrollbar,
    #bv-cat-tabs::-webkit-scrollbar { display: none; }

    /* ── Flip card ──────────────────────────────────────── */
    #vocab-flip-inner.flipped,
    #bv-flip-inner.flipped { transform: rotateY(180deg); }

    /* ── Equalizer animation ────────────────────────────── */
    .nz-eq { display:flex; align-items:flex-end; gap:2px; height:14px; }
    .nz-eq-bar {
      width:3px; border-radius:2px;
      background:var(--primary);
      animation:nzEqBounce 0.8s ease-in-out infinite;
    }
    .nz-eq-bar:nth-child(1) { animation-delay:0s;    height:6px; }
    .nz-eq-bar:nth-child(2) { animation-delay:0.15s; height:12px; }
    .nz-eq-bar:nth-child(3) { animation-delay:0.3s;  height:8px; }
    @keyframes nzEqBounce {
      0%,100% { transform:scaleY(0.4); }
      50%      { transform:scaleY(1); }
    }

    /* ── Card hover ─────────────────────────────────────── */
    .vocab-card:hover, .bv-card:hover {
      transform:translateY(-3px);
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
    }

    /* ── Level tab active underline (green like reference) ─ */
    .nz-lvl-tab { position:relative; }
    .nz-lvl-tab.active::after {
      content:'';
      position:absolute;
      bottom:-2px; left:50%; transform:translateX(-50%);
      width:70%; height:2px;
      background:var(--success);
      border-radius:2px;
    }

    /* ── SRS level pill colors ──────────────────────────── */
    .srs-pill-N5 { color:var(--success); border-color:var(--success); }
    .srs-pill-N4 { color:#06b6d4; border-color:#06b6d4; }
    .srs-pill-N3 { color:#eab308; border-color:#eab308; }
    .srs-pill-N2 { color:#a855f7; border-color:#a855f7; }
    .srs-pill-N1 { color:#ef4444; border-color:#ef4444; }

    /* ── Basic Vocab button highlight ───────────────────── */
    #bv-open-btn {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff;
      border:none;
      padding:8px 18px;
      border-radius:10px;
      font-size:13px;
      font-weight:700;
      cursor:pointer;
      font-family:inherit;
      transition:opacity 0.15s,transform 0.15s;
      letter-spacing:0.3px;
    }
    #bv-open-btn:hover { opacity:0.88; transform:translateY(-1px); }

    /* ── Basic Vocab overlay ────────────────────────────── */
    #bv-overlay {
      display:none;
      position:fixed; inset:0;
      background:rgba(0,0,0,0.7);
      z-index:999;
      backdrop-filter:blur(4px);
    }
    #bv-overlay.open { display:flex; align-items:center; justify-content:center; }
    #bv-modal {
      width:min(96vw,960px);
      max-height:88vh;
      background:var(--bg,#0f0f0f);
      border:1px solid var(--border,#333);
      border-radius:20px;
      overflow:hidden;
      display:flex;
      flex-direction:column;
    }

    /* ── Search bar ─────────────────────────────────────── */
    .nz-search-wrap {
      flex:1;
      display:flex; align-items:center; gap:8px;
      background:var(--card-elevated,#1a1a1a);
      border:1px solid var(--border,#2a2a2a);
      border-radius:12px;
      padding:0 14px;
      height:40px;
    }
    .nz-search-wrap input {
      flex:1; background:transparent; border:none; outline:none;
      color:var(--fg,#f0f0f0); font-size:13px; font-family:inherit;
    }
    .nz-search-wrap input::placeholder { color:var(--fg-muted,#666); }

    /* ── Mode toggle ─────────────────────────────────────── */
    .vocab-mode-btn, .bv-mode-btn {
      padding:7px 14px; border-radius:8px; font-size:13px; font-weight:600;
      cursor:pointer; font-family:inherit; transition:all 0.15s;
    }

    /* ── Nav button hover ───────────────────────────────── */
    .nz-nav-btn:hover { border-color:var(--primary,#e8446a) !important; }

    /* ══════════════════════════════════════════════════════
       STEP-FLOW UI — Level Select → Chapter Cards → List → Detail
       Shared by Vocabulary and Grammar sections only.
       ══════════════════════════════════════════════════════ */

    /* Breadcrumb row */
    .nz-flow-crumbs { display:flex; align-items:center; gap:6px; flex-wrap:wrap;
      font-size:12px; color:var(--fg-muted); margin-bottom:14px; }
    .nz-flow-crumb-btn { background:transparent; border:none; color:var(--fg-muted);
      font-family:inherit; font-size:12px; cursor:pointer; padding:2px 4px; border-radius:4px;
      transition:color .15s; }
    .nz-flow-crumb-btn:hover { color:var(--primary); }
    .nz-flow-crumb-current { color:var(--fg); font-weight:700; }

    /* Back button */
    .nz-flow-back { display:inline-flex; align-items:center; gap:6px; background:transparent;
      border:none; color:var(--fg-muted); cursor:pointer; font-family:inherit; font-size:13px;
      font-weight:600; padding:0; margin-bottom:16px; transition:color .15s; }
    .nz-flow-back:hover { color:var(--primary); }

    /* Large level-select cards */
    .nz-level-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr));
      gap:16px; }
    .nz-level-card { position:relative; border-radius:var(--radius-lg); border:1px solid var(--border);
      background:var(--card); padding:26px 20px; cursor:pointer; overflow:hidden;
      transition:transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease),
        border-color var(--duration) var(--ease); }
    .nz-level-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); }
    .nz-level-card .nz-level-icon { font-size:34px; margin-bottom:14px; display:block; }
    .nz-level-card .nz-level-name { font-family:var(--font-sans); font-size:22px; font-weight:800;
      color:var(--fg); letter-spacing:-0.3px; margin-bottom:4px; }
    .nz-level-card .nz-level-meta { font-size:12px; color:var(--fg-muted); }
    .nz-level-card .nz-level-bar { position:absolute; top:0; left:0; right:0; height:4px; }

    /* Large chapter cards */
    .nz-chapter-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr));
      gap:14px; }
    .nz-chapter-card { position:relative; border-radius:var(--radius-lg); border:1px solid var(--border);
      background:var(--card); padding:20px; cursor:pointer; text-align:left;
      transition:transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease); }
    .nz-chapter-card:hover { transform:translateY(-3px); box-shadow:var(--shadow); }
    .nz-chapter-card .nz-ch-num { display:inline-block; font-family:var(--font-mono); font-size:11px;
      font-weight:700; padding:3px 9px; border-radius:6px; margin-bottom:12px; }
    .nz-chapter-card .nz-ch-title { font-family:var(--font-jp-sans); font-size:17px; font-weight:700;
      color:var(--fg); margin-bottom:4px; line-height:1.4; }
    .nz-chapter-card .nz-ch-topic { font-size:12px; color:var(--fg-muted); margin-bottom:12px;
      line-height:1.5; min-height:18px; }
    .nz-chapter-card .nz-ch-footer { display:flex; align-items:center; justify-content:space-between;
      font-size:11px; color:var(--fg-subtle); }
    .nz-ch-complete-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px;
      font-weight:700; padding:2px 8px; border-radius:999px; background:var(--success-dim);
      color:var(--success); }

    /* List step */
    .nz-list-toparea { display:flex; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap; }

    /* Detail page */
    .nz-detail-wrap { max-width:640px; margin:0 auto; }
    .nz-detail-card { border-radius:var(--radius-lg); border:1px solid var(--border);
      background:var(--card); padding:32px; }
    .nz-detail-jp { font-family:var(--font-jp-sans); font-size:40px; font-weight:800; color:var(--fg);
      margin-bottom:6px; line-height:1.25; }
    .nz-detail-romaji { font-family:var(--font-mono); font-size:14px; color:var(--fg-muted);
      font-style:italic; margin-bottom:18px; }
    .nz-detail-row { padding:14px 0; border-top:1px solid var(--border); }
    .nz-detail-label { font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase;
      color:var(--fg-subtle); margin-bottom:6px; }
    .nz-detail-value { font-size:15px; color:var(--fg); line-height:1.6; }
    .nz-detail-value.nz-unavailable { color:var(--fg-subtle); font-style:italic; font-size:13px; }
    .nz-detail-nav { display:flex; align-items:center; justify-content:space-between; margin-top:22px; }
    .nz-detail-audio-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px;
      border-radius:var(--radius); border:1px solid var(--primary-dim); background:var(--primary-dim);
      color:var(--primary); font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;
      transition:opacity .15s; }
    .nz-detail-audio-btn:hover { opacity:0.85; }

    /* Chapter/level search bar (instant filter) */
    .nz-flow-search { flex:1; min-width:200px; }

    @media (max-width:560px){
      .nz-level-grid, .nz-chapter-grid { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); }
      .nz-detail-card { padding:22px; }
      .nz-detail-jp { font-size:32px; }
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   BASIC VOCAB MODULE  (2,156 words · 20 categories)
   ========================================================= */
var BasicVocabPage = (() => {
  let mode           = 'grid';
  let activeCategory = 'All';
  let cardIndex      = 0;
  let flipped        = false;
  let speakingId     = null;
  let speakTimer     = null;
  let keyHandler     = null;
  let searchQuery    = '';

  /* ── Audio ───────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate;
    window.speechSynthesis.speak(u);
  }
  function speakWord(jp, en) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const j = new SpeechSynthesisUtterance(jp);
    j.lang='ja-JP'; j.rate=0.8;
    j.onend = () => setTimeout(() => {
      const e = new SpeechSynthesisUtterance(en);
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    }, 600);
    window.speechSynthesis.speak(j);
  }

  /* ── Filter ──────────────────────────────────────────── */
  function getFiltered() {
    let words = activeCategory === 'All' ? VocabPageWords : VocabPageWords.filter(w => w.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(w =>
        w.jp.includes(q) ||
        (w.romaji && w.romaji.toLowerCase().includes(q)) ||
        w.en.toLowerCase().includes(q)
      );
    }
    return words;
  }

  /* ── Flashcard nav ───────────────────────────────────── */
  function nextCard() {
    flipped = false; updateFlip();
    setTimeout(() => { cardIndex = (cardIndex + 1) % getFiltered().length; renderFCContent(); }, 150);
  }
  function prevCard() {
    flipped = false; updateFlip();
    setTimeout(() => { const f=getFiltered(); cardIndex=(cardIndex-1+f.length)%f.length; renderFCContent(); }, 150);
  }
  function flipCard() { flipped=!flipped; updateFlip(); }
  function updateFlip() {
    const el = document.getElementById('bv-flip-inner');
    if (el) el.classList.toggle('flipped', flipped);
  }
  function goToCard(i) { cardIndex=i; flipped=false; updateFlip(); renderFCContent(); }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode !== 'flashcard') return;
      if (e.key==='ArrowRight') { e.preventDefault(); nextCard(); }
      else if (e.key==='ArrowLeft') { e.preventDefault(); prevCard(); }
      else if (e.key===' ') { e.preventDefault(); flipCard(); }
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler=null; }
  }

  /* ── Speak button ────────────────────────────────────── */
  function handleSpeakBtn(e, word) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId = word.id;
    speakWord(word.jp, word.en);
    updateSpeakBtns();
    speakTimer = setTimeout(() => { speakingId=null; updateSpeakBtns(); }, 3000);
  }
  function updateSpeakBtns() {
    document.querySelectorAll('.bv-speak-btn').forEach(btn => {
      const playing = btn.dataset.id === speakingId;
      btn.style.background = playing ? 'var(--primary-dim)' : 'transparent';
      btn.style.color       = playing ? 'var(--primary)'    : 'var(--fg-muted)';
      btn.innerHTML = playing
        ? `<div class="nz-eq"><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div></div>`
        : speakerIcon(15);
    });
  }

  /* ── Security ────────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Icons ───────────────────────────────────────────── */
  function speakerIcon(size=15) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }

  /* ── Category tabs ───────────────────────────────────── */
  function renderCatTabs() {
    const c = document.getElementById('bv-cat-tabs');
    if (!c) return;
    c.innerHTML = VocabPageCategories.map(cat => {
      const active = cat === activeCategory;
      const count  = cat==='All' ? VocabPageWords.length : VocabPageWords.filter(w=>w.category===cat).length;
      return `<button class="vocab-cat-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
        data-cat="${esc(cat)}"
        style="background:${active?'var(--primary)':'var(--card-elevated)'};
               color:${active?'#fff':'var(--fg-muted)'};
               border:1px solid ${active?'var(--primary)':'var(--border)'};
               white-space:nowrap;flex-shrink:0;padding:5px 12px;border-radius:20px;
               font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;">
        ${esc(cat)} <span style="opacity:0.7;font-size:9px;">${count}</span>
      </button>`;
    }).join('');
    c.querySelectorAll('.vocab-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        cardIndex=0; flipped=false; searchQuery='';
        const si = document.getElementById('bv-search-input');
        if (si) si.value = '';
        render();
      });
    });
  }

  /* ── Grid ────────────────────────────────────────────── */
  function renderGrid() {
    const filtered = getFiltered();
    const area = document.getElementById('bv-main-area');
    if (!area) return;
    if (!filtered.length) {
      area.innerHTML = `<p style="color:var(--fg-muted);text-align:center;padding:40px;">No words found.</p>`;
      return;
    }
    area.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;">
  ${filtered.map(word => `
    <div class="bv-card"
      data-id="${esc(word.id)}"
      style="border-radius:12px;border:1px solid var(--border);background:var(--card);
             padding:16px;cursor:pointer;border-left:3px solid ${word.color};
             position:relative;transition:transform 0.2s,box-shadow 0.2s;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div style="font-family:'Noto Sans JP',sans-serif;font-size:20px;font-weight:700;
                      color:var(--fg);margin-bottom:2px;">${esc(word.jp)}</div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;
                    color:var(--fg-muted);font-style:italic;">${esc(word.romaji||'')}</p>
        </div>
        <button class="bv-speak-btn" data-id="${esc(word.id)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;">
          ${speakerIcon(15)}
        </button>
      </div>
      <p style="font-size:13px;color:var(--fg);margin-bottom:12px;">${esc(word.en)}</p>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;
                     background:${word.color}22;color:${word.color};">${esc(word.category)}</span>
      </div>
    </div>
  `).join('')}
</div>`;

    area.querySelectorAll('.bv-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.bv-speak-btn')) return;
        const w = VocabPageWords.find(x=>x.id===card.dataset.id);
        if (w) speak(w.jp);
      });
    });
    area.querySelectorAll('.bv-speak-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const w = VocabPageWords.find(x=>x.id===btn.dataset.id);
        if (w) handleSpeakBtn(e,w);
      });
    });
  }

  /* ── Flashcard content ───────────────────────────────── */
  function renderFCContent() {
    const filtered = getFiltered();
    if (!filtered.length) return;
    const word = filtered[cardIndex] || filtered[0];
    const front   = document.getElementById('bv-fc-front');
    const back    = document.getElementById('bv-fc-back');
    const counter = document.getElementById('bv-fc-counter');
    const inner   = document.getElementById('bv-flip-inner');
    if (inner) inner.classList.toggle('flipped', flipped);
    if (front) front.innerHTML = `
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:48px;font-weight:700;color:var(--fg);">${esc(word.jp)}</div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);">${esc(word.romaji||'')}</p>
      <button id="bv-fc-speak-front" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;margin-top:8px;font-family:inherit;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to reveal meaning</p>`;
    if (back) back.innerHTML = `
      <p style="font-size:22px;font-weight:700;color:var(--fg);text-align:center;margin-bottom:10px;">${esc(word.en)}</p>
      <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
                   background:${word.color}22;color:${word.color};margin-bottom:10px;">${esc(word.category)}</span>
      <button id="bv-fc-speak-back" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;font-family:inherit;">
        ${speakerIcon(12)} Hear both
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to flip back</p>`;
    const ff = document.getElementById('bv-fc-speak-front');
    if (ff) ff.addEventListener('click', e => { e.stopPropagation(); speak(word.jp); });
    const fb = document.getElementById('bv-fc-speak-back');
    if (fb) fb.addEventListener('click', e => { e.stopPropagation(); speakWord(word.jp, word.en); });
    if (counter) counter.textContent = `${cardIndex+1} / ${filtered.length}`;
    const dots = document.getElementById('bv-fc-dots');
    if (dots) {
      const shown = filtered.slice(0, Math.min(filtered.length, 20));
      dots.innerHTML = shown.map((_,i) => `
        <button class="bv-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.bv-dot').forEach(d => d.addEventListener('click', ()=>goToCard(parseInt(d.dataset.i))));
    }
  }

  /* ── Flashcard wrapper ───────────────────────────────── */
  function renderFlashcard() {
    const area = document.getElementById('bv-main-area');
    if (!area) return;
    area.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;max-width:380px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → keys to navigate · Space to flip
  </p>
  <div id="bv-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="bv-flip-inner"
      style="width:100%;height:220px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="bv-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
      <div id="bv-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="bv-fc-prev" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg);transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="bv-fc-counter" style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="bv-fc-next" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg);transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="bv-fc-reset" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg-muted);transition:border-color 0.15s;margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </div>
  <div id="bv-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('bv-fc-wrap').addEventListener('click', flipCard);
    document.getElementById('bv-fc-prev').addEventListener('click', prevCard);
    document.getElementById('bv-fc-next').addEventListener('click', nextCard);
    document.getElementById('bv-fc-reset').addEventListener('click', ()=>{cardIndex=0;flipped=false;updateFlip();renderFCContent();});
    renderFCContent();
    attachKeys();
  }

  /* ── Mode buttons ────────────────────────────────────── */
  function renderModeBtns() {
    const wrap = document.getElementById('bv-mode-btns');
    if (!wrap) return;
    wrap.innerHTML = ['grid','flashcard'].map(m => `
      <button class="bv-mode-btn" data-mode="${m}"
        style="padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;
               border:1px solid ${mode===m?'var(--primary)':'var(--border)'};
               background:${mode===m?'var(--primary)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};cursor:pointer;transition:all 0.15s;">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.bv-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => { detachKeys(); mode=btn.dataset.mode; flipped=false; render(); });
    });
  }

  /* ── Full render ─────────────────────────────────────── */
  function render() {
    renderModeBtns();
    renderCatTabs();
    const lbl = document.getElementById('bv-count-label');
    if (lbl) lbl.textContent = `${VocabPageWords.length} words · ${VocabPageCategories.length-1} categories`;
    if (mode==='grid') { detachKeys(); renderGrid(); }
    else renderFlashcard();
  }

  /* ── Open / close modal ──────────────────────────────── */
  function open() {
    const ov = document.getElementById('bv-overlay');
    if (!ov) { buildModal(); } else { ov.classList.add('open'); render(); }
  }
  function close() {
    detachKeys();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const ov = document.getElementById('bv-overlay');
    if (ov) ov.classList.remove('open');
  }

  function buildModal() {
    const ov = document.createElement('div');
    ov.id = 'bv-overlay';
    ov.innerHTML = `
<div id="bv-modal">
  <!-- Modal header -->
  <div style="display:flex;align-items:center;justify-content:space-between;
              padding:20px 24px 0;border-bottom:1px solid var(--border,#2a2a2a);padding-bottom:16px;">
    <div>
      <h2 style="font-size:20px;font-weight:800;color:var(--fg);margin-bottom:3px;letter-spacing:-0.3px;">
        📚 Basic Vocab
      </h2>
      <p id="bv-count-label" style="font-size:12px;color:var(--fg-muted);"></p>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div id="bv-mode-btns" style="display:flex;gap:8px;"></div>
      <button id="bv-close-btn"
        style="padding:8px;border-radius:10px;background:var(--card-elevated);
               border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);
               font-size:18px;line-height:1;transition:border-color 0.15s;">✕</button>
    </div>
  </div>

  <!-- Search + cats -->
  <div style="padding:14px 24px 0;">
    <!-- Search -->
    <div class="nz-search-wrap" style="margin-bottom:12px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="bv-search-input" type="text" placeholder="Search vocab, meaning, romaji…" />
    </div>
    <!-- Category tabs -->
    <div id="bv-cat-tabs"
      style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;"></div>
  </div>

  <!-- Main content -->
  <div id="bv-main-area" style="flex:1;overflow-y:auto;padding:16px 24px 24px;"></div>
</div>`;
    document.body.appendChild(ov);

    ov.addEventListener('click', e => { if (e.target===ov) close(); });
    document.getElementById('bv-close-btn').addEventListener('click', close);
    document.getElementById('bv-search-input').addEventListener('input', e => {
      searchQuery = e.target.value;
      cardIndex = 0;
      if (mode==='grid') renderGrid();
      else renderFCContent();
    });

    ov.classList.add('open');
    render();
  }

  /* ── Dedicated page mount (replaces modal as the primary entry
     point) — reuses the exact same render/grid/flashcard/search
     logic above, just laid out as a full page instead of an
     overlay. No data duplicated: still reads from VocabPageWords. */
  function mount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    detachKeys();
    mode = 'grid'; cardIndex = 0; flipped = false; searchQuery = '';
    container.innerHTML = `
<div style="max-width:1400px;margin:0 auto;padding:24px 16px;">
  <button id="bv-back-btn" style="display:flex;align-items:center;gap:6px;background:none;border:none;
    color:var(--fg-muted);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;padding:0;margin-bottom:18px;">
    ← Back to Vocabulary
  </button>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:22px;font-weight:800;color:var(--fg);margin-bottom:3px;letter-spacing:-0.3px;">📚 Basic Vocab</h1>
      <p id="bv-count-label" style="font-size:13px;color:var(--fg-muted);"></p>
    </div>
    <div id="bv-mode-btns" style="display:flex;gap:8px;"></div>
  </div>
  <div class="nz-search-wrap" style="margin-bottom:12px;max-width:420px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input id="bv-search-input" type="text" placeholder="Search vocab, meaning, romaji…" />
  </div>
  <div id="bv-cat-tabs" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;margin-bottom:16px;"></div>
  <div id="bv-main-area"></div>
</div>`;
    const backBtn = document.getElementById('bv-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => { detachKeys(); if (window.nzGo) window.nzGo('vocab'); });
    const searchInput = document.getElementById('bv-search-input');
    if (searchInput) searchInput.addEventListener('input', e => {
      searchQuery = e.target.value; cardIndex = 0;
      if (mode==='grid') renderGrid(); else renderFCContent();
    });
    render();
  }
  function cleanup() {
    detachKeys();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { open, close, mount, cleanup };
})();

/* =========================================================
   MAIN VOCAB PAGE  (JLPT N5–N1 words from existing data)
   ========================================================= */
var VocabPage = (() => {
  let mode           = 'grid';
  let activeLevel    = 'N5';
  let activeChapter  = 0;
  let cardIndex      = 0;
  let flipped        = false;
  let speakingId     = null;
  let speakTimer     = null;
  let keyHandler     = null;
  let searchQuery    = '';

  /* ── Step-flow state (Level Select → Chapter Cards → List → Detail) ── */
  let step             = 'levels';   // 'levels' | 'chapters' | 'list' | 'detail'
  let chapterSearch    = '';
  let detailWordIdx    = 0;

  /* ── Audio ───────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang=lang; u.rate=rate;
    window.speechSynthesis.speak(u);
  }
  function speakWord(jp, en) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const j = new SpeechSynthesisUtterance(jp);
    j.lang='ja-JP'; j.rate=0.8;
    j.onend = () => setTimeout(()=>{
      const e = new SpeechSynthesisUtterance(en);
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    },600);
    window.speechSynthesis.speak(j);
  }

  /* ── Filter ──────────────────────────────────────────── */
  function getCurrentChapterData() {
    const chapters = (typeof NZChapterData !== 'undefined' && NZChapterData[activeLevel]) || [];
    return chapters[activeChapter] || chapters[0] || { ch:1, title:'', topic:'', words:[] };
  }
  function getFiltered() {
    let words = getCurrentChapterData().words || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(w =>
        w.jp.includes(q) ||
        (w.romaji && w.romaji.toLowerCase().includes(q)) ||
        w.en.toLowerCase().includes(q)
      );
    }
    return words;
  }

  /* ── Flashcard nav ───────────────────────────────────── */
  function nextCard() {
    flipped=false; updateFlip();
    setTimeout(()=>{ cardIndex=(cardIndex+1)%getFiltered().length; renderFCContent(); },150);
  }
  function prevCard() {
    flipped=false; updateFlip();
    setTimeout(()=>{ const f=getFiltered(); cardIndex=(cardIndex-1+f.length)%f.length; renderFCContent(); },150);
  }
  function flipCard() { flipped=!flipped; updateFlip(); }
  function updateFlip() {
    const el=document.getElementById('vocab-flip-inner');
    if(el) el.classList.toggle('flipped',flipped);
  }
  function goToCard(i) { cardIndex=i; flipped=false; updateFlip(); renderFCContent(); }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode!=='flashcard') return;
      if (e.key==='ArrowRight'){e.preventDefault();nextCard();}
      else if(e.key==='ArrowLeft'){e.preventDefault();prevCard();}
      else if(e.key===' '){e.preventDefault();flipCard();}
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler){window.removeEventListener('keydown',keyHandler);keyHandler=null;}
  }

  /* ── Speak btn ───────────────────────────────────────── */
  function handleSpeakBtn(e, word) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId=word.jp;
    speakWord(word.jp, word.en);
    updateSpeakBtns();
    speakTimer=setTimeout(()=>{speakingId=null;updateSpeakBtns();},3000);
  }
  function updateSpeakBtns() {
    document.querySelectorAll('.vocab-speak-btn').forEach(btn=>{
      const playing=btn.dataset.jp===speakingId;
      btn.style.background=playing?'var(--primary-dim)':'transparent';
      btn.style.color=playing?'var(--primary)':'var(--fg-muted)';
      btn.innerHTML=playing
        ?`<div class="nz-eq"><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div></div>`
        :speakerIcon(15);
    });
  }

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function speakerIcon(size=15){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }

  /* ── Level colors (matching reference photo exactly) ─── */
  const LEVEL_COLORS = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };

  /* ── Theme-consistent level icons (shared with Pronunciation page) ── */
  const LEVEL_ICONS = { N5:'🌱', N4:'🍃', N3:'🌳', N2:'🏢', N1:'⛰️' };

  /* ── SRS level pills ─────────────────────────────────── */
  function renderSRSPills() {
    const wrap = document.getElementById('vocab-srs-pills');
    if (!wrap) return;
    wrap.innerHTML = ['N5','N4','N3','N2','N1'].map(lvl => {
      const active = activeLevel === lvl;
      const col = LEVEL_COLORS[lvl];
      return `
      <button class="srs-pill-${lvl} ${active?'active':''}"
        data-level="${lvl}"
        style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;
               font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;
               background:${active ? col : 'transparent'};border:1px solid ${col};
               color:${active ? '#fff' : col};transition:all 0.15s;">
        <span>${LEVEL_ICONS[lvl]}</span>${lvl}
      </button>`;
    }).join('');
    wrap.querySelectorAll('button').forEach(btn=>{
      const lvl = btn.dataset.level;
      const col = LEVEL_COLORS[lvl];
      btn.addEventListener('mouseenter',()=>{ if(activeLevel!==lvl) btn.style.background=col+'22'; });
      btn.addEventListener('mouseleave',()=>{ if(activeLevel!==lvl) btn.style.background='transparent'; });
      btn.addEventListener('click',()=>{
        activeLevel=lvl; activeChapter=0; cardIndex=0; flipped=false; searchQuery=''; mode='grid';
        const si=document.getElementById('vocab-search-input'); if(si) si.value='';
        render();
      });
    });
  }

  /* ── Level tabs (N5 N4 N3 N2 N1 row with green underline) */
  function renderLevelTabs() {
    const wrap = document.getElementById('vocab-level-tabs');
    if (!wrap) return;
    wrap.innerHTML = ['N5','N4','N3','N2','N1'].map(lvl => `
      <button class="nz-lvl-tab ${activeLevel===lvl?'active':''}"
        data-level="${lvl}"
        style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;font-size:14px;font-weight:700;
               background:transparent;border:none;
               color:${activeLevel===lvl?'var(--fg)':'var(--fg-muted)'};
               cursor:pointer;font-family:inherit;transition:color 0.15s;">
        <span>${LEVEL_ICONS[lvl]}</span>${lvl}
      </button>`).join('');
    wrap.querySelectorAll('.nz-lvl-tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        activeLevel=btn.dataset.level; activeChapter=0; cardIndex=0; flipped=false;
        searchQuery=''; const si=document.getElementById('vocab-search-input'); if(si) si.value='';
        render();
      });
    });
  }

  /* ── Chapter navigation buttons ──────────────────────── */
  const BOOK_LABELS = {
    N5: 'Minna no Nihongo I',
    N4: 'Minna no Nihongo II',
    N3: 'Minna no Nihongo Chukyu',
    N2: 'Nihongo Sou Matome N2',
    N1: 'Nihongo Sou Matome N1',
  };
  function renderChapterBtns() {
    const c = document.getElementById('vocab-ch-btns');
    if (!c) return;
    const chapters = (typeof NZChapterData !== 'undefined' && NZChapterData[activeLevel]) || [];
    const color = LEVEL_COLORS[activeLevel] || 'var(--primary)';
    const bookLabel = BOOK_LABELS[activeLevel] || activeLevel;
    if (!chapters.length) {
      c.innerHTML = `<span style="font-size:12px;color:var(--fg-muted);padding:6px 0;">No chapter data available for ${activeLevel} yet.</span>`;
      return;
    }
    c.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;
                     background:${color}22;color:${color};white-space:nowrap;flex-shrink:0;">
          📖 ${bookLabel}
        </span>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${chapters.map((ch, i) => `
            <button class="vocab-ch-btn" data-idx="${i}"
              style="padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600;
                     font-family:inherit;cursor:pointer;transition:all 0.15s;
                     border:1px solid ${i===activeChapter ? color : 'var(--border)'};
                     background:${i===activeChapter ? color : 'var(--card-elevated)'};
                     color:${i===activeChapter ? '#fff' : 'var(--fg-muted)'};"
              title="Ch ${ch.ch}: ${ch.title||''} — ${ch.topic||''}">
              Ch ${ch.ch}
            </button>`).join('')}
        </div>
      </div>`;
    c.querySelectorAll('.vocab-ch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChapter = parseInt(btn.dataset.idx);
        cardIndex = 0; flipped = false;
        renderChapterBtns();
        updateChapterInfo();
        if (mode === 'grid') renderGrid();
        else renderFCContent();
      });
    });
  }

  function updateChapterInfo() {
    const ch = getCurrentChapterData();
    const lbl = document.getElementById('vocab-count-label');
    if (lbl && ch) {
      lbl.textContent = ch.topic
        ? `Ch ${ch.ch}: ${ch.title} — ${ch.topic} · ${(ch.words||[]).length} words`
        : `Ch ${ch.ch}: ${ch.title} · ${(ch.words||[]).length} words`;
    }
  }

  /* ── Grid ────────────────────────────────────────────── */
  function renderGrid() {
    const filtered=getFiltered();
    const area=document.getElementById('vocab-main-area');
    if(!area) return;
    const color = LEVEL_COLORS[activeLevel] || '#22c55e';
    if(!filtered.length){
      area.innerHTML=`<p style="color:var(--fg-muted);text-align:center;padding:40px;">No words found. Try selecting a different chapter or clearing the search.</p>`;
      return;
    }
    area.innerHTML=`
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
  ${filtered.map(word=>`
    <div class="vocab-card" data-jp="${esc(word.jp)}"
      style="border-radius:12px;border:1px solid var(--border);background:var(--card);
             padding:16px;cursor:pointer;border-left:3px solid ${color};
             position:relative;transition:transform 0.2s,box-shadow 0.2s;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div style="font-family:'Noto Sans JP',sans-serif;font-size:22px;font-weight:700;
                      color:var(--fg);margin-bottom:2px;">${esc(word.jp)}</div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;
                    color:var(--fg-muted);font-style:italic;">${esc(word.romaji||'')}</p>
        </div>
        <button class="vocab-speak-btn" data-jp="${esc(word.jp)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;">
          ${speakerIcon(15)}
        </button>
      </div>
      <p style="font-size:13px;color:var(--fg);margin-bottom:4px;">${esc(word.en)}</p>
    </div>
  `).join('')}
</div>`;
    area.querySelectorAll('.vocab-card').forEach(card=>{
      card.addEventListener('click',e=>{
        if(e.target.closest('.vocab-speak-btn, .nz-adv-status-btn, [id^="nz-adv"]')) return;
        openDetail(card.dataset.jp);
      });
    });
    area.querySelectorAll('.vocab-speak-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const jp=btn.dataset.jp;
        const word=getFiltered().find(w=>w.jp===jp);
        if(word) handleSpeakBtn(e,word);
      });
    });
  }

  /* ── Flashcard content ───────────────────────────────── */
  function renderFCContent() {
    const filtered=getFiltered();
    if(!filtered.length) return;
    const word=filtered[cardIndex]||filtered[0];
    const front=document.getElementById('vocab-fc-front');
    const back=document.getElementById('vocab-fc-back');
    const counter=document.getElementById('vocab-fc-counter');
    const inner=document.getElementById('vocab-flip-inner');
    if(inner) inner.classList.toggle('flipped',flipped);
    const col = LEVEL_COLORS[activeLevel] || '#22c55e';
    if(front) front.innerHTML=`
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:52px;font-weight:700;color:var(--fg);">${esc(word.jp)}</div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);">${esc(word.romaji||'')}</p>
      <button id="fc-speak-front" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;margin-top:8px;font-family:inherit;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to reveal meaning</p>`;
    if(back) back.innerHTML=`
      <p style="font-size:22px;font-weight:700;color:var(--fg);text-align:center;margin-bottom:10px;">${esc(word.en)}</p>
      <button id="fc-speak-back" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;font-family:inherit;">
        ${speakerIcon(12)} Hear both
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to flip back</p>`;
    const ff=document.getElementById('fc-speak-front');
    if(ff) ff.addEventListener('click',e=>{e.stopPropagation();speak(word.jp);});
    const fb=document.getElementById('fc-speak-back');
    if(fb) fb.addEventListener('click',e=>{e.stopPropagation();speakWord(word.jp,word.en);});
    if(counter) counter.textContent=`${cardIndex+1} / ${filtered.length}`;
    const dots=document.getElementById('vocab-fc-dots');
    if(dots){
      const shown=filtered.slice(0,Math.min(filtered.length,20));
      dots.innerHTML=shown.map((_,i)=>`
        <button class="vocab-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.vocab-dot').forEach(d=>d.addEventListener('click',()=>goToCard(parseInt(d.dataset.i))));
    }
  }

  /* ── Flashcard wrapper ───────────────────────────────── */
  function renderFlashcard() {
    const area=document.getElementById('vocab-main-area');
    if(!area) return;
    area.innerHTML=`
<div style="display:flex;flex-direction:column;align-items:center;max-width:380px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → keys to navigate · Space to flip
  </p>
  <div id="vocab-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="vocab-flip-inner"
      style="width:100%;height:220px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="vocab-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
      <div id="vocab-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="vocab-fc-prev" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="vocab-fc-counter" style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="vocab-fc-next" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="vocab-fc-reset" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </div>
  <div id="vocab-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('vocab-fc-wrap').addEventListener('click',flipCard);
    document.getElementById('vocab-fc-prev').addEventListener('click',prevCard);
    document.getElementById('vocab-fc-next').addEventListener('click',nextCard);
    document.getElementById('vocab-fc-reset').addEventListener('click',()=>{cardIndex=0;flipped=false;updateFlip();renderFCContent();});
    renderFCContent();
    attachKeys();
  }

  /* ── Mode buttons ────────────────────────────────────── */
  function renderModeBtns() {
    const wrap=document.getElementById('vocab-mode-btns');
    if(!wrap) return;
    wrap.innerHTML=['grid','flashcard'].map(m=>`
      <button class="vocab-mode-btn" data-mode="${m}"
        style="padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;
               border:1px solid ${mode===m?'var(--primary)':'var(--border)'};
               background:${mode===m?'var(--primary)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};cursor:pointer;transition:all 0.15s;">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.vocab-mode-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if (btn.dataset.mode === 'flashcard') {
          if (window.nzGo) window.nzGo('vocab-flashcards');
          return;
        }
        detachKeys();mode=btn.dataset.mode;flipped=false;render();
      });
    });
  }

  /* ── Full render (kept for external callers; now just refreshes
     whichever step is currently showing) ─────────────────────── */
  function render() { renderStepArea(); }

  /* ═══════════════════════════════════════════════════════════
     STEP-FLOW HELPERS
     ═══════════════════════════════════════════════════════════ */
  function levelStats(lvl) {
    const chapters = (typeof NZChapterData !== 'undefined' && NZChapterData[lvl]) || [];
    const words = chapters.reduce((sum, ch) => sum + ((ch.words || []).length), 0);
    return { chapterCount: chapters.length, wordCount: words };
  }

  function crumbsHtml(parts) {
    // parts: [{label, onClick} ...] last part is current (non-clickable)
    return `<div class="nz-flow-crumbs">` + parts.map((p, i) => {
      const isLast = i === parts.length - 1;
      return isLast
        ? `<span class="nz-flow-crumb-current">${esc(p.label)}</span>`
        : `<button class="nz-flow-crumb-btn" data-crumb="${i}">${esc(p.label)}</button><span>›</span>`;
    }).join('') + `</div>`;
  }

  function backArrowSvg() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
  }

  /* ── STEP 1: Level Selection ─────────────────────────────── */
  function renderLevelCardsScreen(area) {
    const lbl = document.getElementById('vocab-count-label');
    if (lbl) lbl.textContent = 'Choose a JLPT level to begin';
    area.innerHTML = `
      <div class="nz-level-grid">
        ${['N5','N4','N3','N2','N1'].map(lvl => {
          const col = LEVEL_COLORS[lvl];
          const stats = levelStats(lvl);
          return `
          <button class="nz-level-card" data-level="${lvl}" style="border-color:${col}33;">
            <div class="nz-level-bar" style="background:${col};"></div>
            <span class="nz-level-icon">${LEVEL_ICONS[lvl]}</span>
            <div class="nz-level-name" style="color:${col};">${lvl}</div>
            <div class="nz-level-meta">${stats.chapterCount} chapters · ${stats.wordCount} words</div>
          </button>`;
        }).join('')}
      </div>`;
    area.querySelectorAll('.nz-level-card').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLevel = btn.dataset.level;
        activeChapter = 0; chapterSearch = '';
        goToChapters();
      });
    });
  }

  /* ── STEP 2: Chapter Cards ────────────────────────────────── */
  function renderChapterCardsScreen(area) {
    const col = LEVEL_COLORS[activeLevel] || 'var(--primary)';
    const bookLabel = BOOK_LABELS[activeLevel] || activeLevel;
    const allChapters = (typeof NZChapterData !== 'undefined' && NZChapterData[activeLevel]) || [];
    const lbl = document.getElementById('vocab-count-label');
    if (lbl) lbl.textContent = `${bookLabel} · ${allChapters.length} chapters`;

    const q = chapterSearch.trim().toLowerCase();
    const chapters = q
      ? allChapters.filter((ch, i) =>
          String(ch.ch).includes(q) ||
          (ch.title || '').toLowerCase().includes(q) ||
          (ch.topic || '').toLowerCase().includes(q))
      : allChapters;

    area.innerHTML = `
      <button class="nz-flow-back" id="vocab-back-levels">${backArrowSvg()} Back to Levels</button>
      ${crumbsHtml([{ label: '語彙 Vocabulary' }, { label: activeLevel }])}
      <div class="nz-list-toparea">
        <div class="nz-search-wrap nz-flow-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="vocab-chapter-search" type="text" placeholder="Search chapters…" value="${esc(chapterSearch)}" />
        </div>
      </div>
      ${!chapters.length
        ? `<p style="color:var(--fg-muted);text-align:center;padding:40px;">No chapters match “${esc(chapterSearch)}”.</p>`
        : `<div class="nz-chapter-grid">
            ${chapters.map(ch => {
              const idx = allChapters.indexOf(ch);
              const completed = typeof ch.completed === 'boolean' ? ch.completed : null;
              return `
              <button class="nz-chapter-card" data-idx="${idx}">
                <span class="nz-ch-num" style="background:${col}1e;color:${col};">CH ${ch.ch}</span>
                <div class="nz-ch-title">${esc(ch.title)}</div>
                <div class="nz-ch-topic">${esc(ch.topic || '')}</div>
                <div class="nz-ch-footer">
                  <span>${(ch.words || []).length} words</span>
                  ${completed === true ? `<span class="nz-ch-complete-badge">✓ Completed</span>` : ''}
                </div>
              </button>`;
            }).join('')}
          </div>`}
    `;

    document.getElementById('vocab-back-levels')?.addEventListener('click', goToLevels);
    document.getElementById('vocab-chapter-search')?.addEventListener('input', e => {
      chapterSearch = e.target.value;
      renderChapterCardsScreen(area);
    });
    area.querySelectorAll('.nz-chapter-card').forEach(card => {
      card.addEventListener('click', () => {
        activeChapter = parseInt(card.dataset.idx);
        goToList();
      });
    });
  }

  /* ── STEP 3: Vocabulary List (per chapter) ───────────────── */
  function renderListScreen(area) {
    const ch = getCurrentChapterData();
    const col = LEVEL_COLORS[activeLevel] || 'var(--primary)';
    area.innerHTML = `
      <button class="nz-flow-back" id="vocab-back-chapters">${backArrowSvg()} Back to Chapters</button>
      ${crumbsHtml([{ label:'語彙 Vocabulary' }, { label: activeLevel }, { label: `Ch ${ch.ch}` }])}
      <div class="nz-list-toparea">
        <!-- Hidden-ish breadcrumb pill kept for compatibility with existing
             progress/filter features that read the active level from here. -->
        <div id="vocab-level-tabs" style="display:none;">
          <button class="nz-lvl-tab active" data-level="${activeLevel}">${activeLevel}</button>
        </div>
        <div class="nz-search-wrap nz-flow-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="vocab-search-input" type="text" placeholder="Search vocab, meaning…" value="${esc(searchQuery)}" />
        </div>
        <div id="vocab-mode-btns" style="display:flex;gap:8px;"></div>
      </div>
      <div id="vocab-main-area"></div>
    `;
    document.getElementById('vocab-back-chapters')?.addEventListener('click', goToChapters);
    document.getElementById('vocab-search-input')?.addEventListener('input', e => {
      searchQuery = e.target.value; cardIndex = 0;
      if (mode === 'grid') renderGrid(); else renderFCContent();
    });
    renderModeBtns();
    updateChapterInfo();
    if (mode === 'grid') { detachKeys(); renderGrid(); } else renderFlashcard();
  }

  /* ── STEP 4: Vocabulary Detail Page ──────────────────────── */
  function openDetail(jp) {
    const list = getFiltered();
    const idx = list.findIndex(w => w.jp === jp);
    detailWordIdx = idx === -1 ? 0 : idx;
    step = 'detail';
    renderStepArea();
  }

  function renderDetailScreen(area) {
    const list = getFiltered();
    if (!list.length) { step = 'list'; renderStepArea(); return; }
    if (detailWordIdx >= list.length) detailWordIdx = 0;
    const word = list[detailWordIdx];
    const ch = getCurrentChapterData();
    const col = LEVEL_COLORS[activeLevel] || 'var(--primary)';

    area.innerHTML = `
      <button class="nz-flow-back" id="vocab-back-list">${backArrowSvg()} Back to List</button>
      ${crumbsHtml([{ label:'語彙 Vocabulary' }, { label: activeLevel }, { label:`Ch ${ch.ch}` }, { label: word.jp }])}
      <div class="nz-detail-wrap">
        <div class="nz-detail-card">
          <span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;
            background:${col}1e;color:${col};margin-bottom:16px;">${activeLevel} · Ch ${ch.ch}</span>
          <div class="nz-detail-jp">${esc(word.jp)}</div>
          <div class="nz-detail-romaji">${esc(word.romaji || '')}</div>

          <div class="nz-detail-row">
            <div class="nz-detail-label">Kana Reading</div>
            <div class="nz-detail-value nz-unavailable">Not available in current data</div>
          </div>
          <div class="nz-detail-row">
            <div class="nz-detail-label">Romaji</div>
            <div class="nz-detail-value">${esc(word.romaji || '—')}</div>
          </div>
          <div class="nz-detail-row">
            <div class="nz-detail-label">English Meaning</div>
            <div class="nz-detail-value">${esc(word.en)}</div>
          </div>
          <div class="nz-detail-row">
            <div class="nz-detail-label">Example Sentence</div>
            <div class="nz-detail-value nz-unavailable">No example sentence in the dataset for this word yet</div>
          </div>

          <button class="nz-detail-audio-btn" id="vocab-detail-speak">${speakerIcon(14)} Play Pronunciation</button>

          <div class="nz-detail-nav">
            <button class="nz-nav-btn" id="vocab-detail-prev" style="padding:8px 14px;border-radius:10px;
              background:var(--card-elevated);border:1px solid var(--border);color:var(--fg);cursor:pointer;">← Previous</button>
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--fg-muted);">${detailWordIdx+1} / ${list.length}</span>
            <button class="nz-nav-btn" id="vocab-detail-next" style="padding:8px 14px;border-radius:10px;
              background:var(--card-elevated);border:1px solid var(--border);color:var(--fg);cursor:pointer;">Next →</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('vocab-back-list')?.addEventListener('click', () => { step='list'; renderStepArea(); });
    document.getElementById('vocab-detail-speak')?.addEventListener('click', () => speak(word.jp));
    document.getElementById('vocab-detail-prev')?.addEventListener('click', () => {
      detailWordIdx = (detailWordIdx - 1 + list.length) % list.length; renderStepArea();
    });
    document.getElementById('vocab-detail-next')?.addEventListener('click', () => {
      detailWordIdx = (detailWordIdx + 1) % list.length; renderStepArea();
    });
  }

  /* ── Step router ──────────────────────────────────────────── */
  function renderStepArea() {
    const area = document.getElementById('vocab-step-area');
    if (!area) return;
    detachKeys();
    switch (step) {
      case 'levels':   renderLevelCardsScreen(area); break;
      case 'chapters': renderChapterCardsScreen(area); break;
      case 'list':     renderListScreen(area); break;
      case 'detail':   renderDetailScreen(area); break;
    }
  }

  function goToLevels()   { step = 'levels';   renderStepArea(); }
  function goToChapters() { step = 'chapters'; renderStepArea(); }
  function goToList()     { step = 'list'; cardIndex = 0; flipped = false; searchQuery = ''; renderStepArea(); }

  /* ── Mount ───────────────────────────────────────────── */
  function mount(containerId, initialLevel) {
    const container=document.getElementById(containerId);
    if(!container) return;
    detachKeys();
    mode = 'grid'; cardIndex = 0; flipped = false; searchQuery = '';
    step = 'levels'; chapterSearch = ''; detailWordIdx = 0;
    if (initialLevel && LEVEL_COLORS[initialLevel]) {
      activeLevel = initialLevel; activeChapter = 0;
      step = 'chapters';
    }

    container.innerHTML=`
<div style="max-width:1280px;margin:0 auto;padding:24px 16px;">

  <!-- ═══ Header: title + Basic Vocab button ═══ -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;
              margin-bottom:20px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:24px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">
        語彙 Vocabulary Study
      </h1>
      <p id="vocab-count-label" style="font-size:13px;color:var(--fg-muted);">
        Master vocabulary from N5 to N1 level
      </p>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <!-- Basic Vocab button -->
      <button id="bv-open-btn">📚 Basic Vocab</button>
    </div>
  </div>

  <!-- ═══ Step area: Level Select → Chapter Cards → List → Detail ═══ -->
  <div id="vocab-step-area"></div>
</div>`;

    /* Basic Vocab button */
    document.getElementById('bv-open-btn').addEventListener('click',()=>{ if (window.nzGo) window.nzGo('basic-vocab'); });

    renderStepArea();
  }

  /* ── Cleanup ─────────────────────────────────────────── */
  function cleanup() {
    detachKeys();
    if(speakTimer) clearTimeout(speakTimer);
    if(window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* ── Dedicated Flashcards page (not a modal, not an inline mode
     toggle) — reuses all existing flashcard state/logic above so
     there is zero duplicated data or rendering code. ─────────── */
  function mountFlashcardsPage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    mode = 'flashcard';
    flipped = false;
    container.innerHTML = `
<div style="max-width:900px;margin:0 auto;padding:24px 16px;">
  <button id="vocab-fc-back" style="display:flex;align-items:center;gap:6px;background:none;border:none;
    color:var(--fg-muted);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;padding:0;margin-bottom:18px;">
    ← Back to Vocabulary
  </button>
  <div style="margin-bottom:16px;">
    <h1 style="font-size:22px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">🃏 Flashcards</h1>
    <p id="vocab-count-label" style="font-size:13px;color:var(--fg-muted);"></p>
  </div>
  <div id="vocab-level-tabs" style="margin-bottom:12px;"></div>
  <div id="vocab-ch-btns" style="margin-bottom:20px;"></div>
  <div id="vocab-main-area"></div>
</div>`;
    const back = document.getElementById('vocab-fc-back');
    if (back) back.addEventListener('click', () => { detachKeys(); if (window.nzGo) window.nzGo('vocab'); });
    renderLevelTabs();
    renderChapterBtns();
    updateChapterInfo();
    renderFlashcard();
  }

  return { mount, cleanup, render, mountFlashcardsPage };
})();

/* =========================================================
   GRAMMAR PAGE CSS
   (reuses the shared .nz-level-*, .nz-chapter-*, .nz-detail-*,
   .nz-flow-* classes injected by injectVocabStyles() above —
   no new visual language, just Grammar-specific bits below)
   ========================================================= */
(function injectGrammarStyles() {
  if (document.getElementById('grammar-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'grammar-page-styles';
  style.textContent = `
    .nz-gpoint-card { border-radius:var(--radius); border:1px solid var(--border);
      background:var(--card); overflow:hidden; }
    .nz-gpoint-header { display:flex; align-items:center; justify-content:space-between;
      padding:16px 20px; cursor:pointer; gap:12px; }
    .nz-gpoint-pattern { font-family:var(--font-jp-sans); font-size:17px; font-weight:700; color:var(--fg); }
    .nz-gpoint-romaji { font-size:11px; color:var(--fg-muted); font-style:italic; }
    .nz-gpoint-body { padding:0 20px 18px; }
    .nz-gpoint-usage { font-size:13px; color:var(--fg-muted); line-height:1.6; margin-bottom:12px; }
    .nz-gpoint-example { background:var(--card-elevated); border-radius:8px; padding:12px 14px; margin-bottom:8px; }
    .nz-gpoint-example-jp { font-family:var(--font-jp-sans); font-size:15px; color:var(--fg); }
    .nz-gpoint-example-en { font-size:12px; color:var(--fg-muted); margin-top:4px; }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   GRAMMAR PAGE
   Mirrors VocabPage's navigation flow exactly:
     Grammar → JLPT Level Selection → Large Chapter Cards
             → Grammar List → Grammar Detail Page
   Data source: NZChapterGrammar (js/nz-chapter-grammar.js),
   already loaded above — chapter metadata (title/topic) is
   shared with Vocabulary via NZChapterData/chapters.js so the
   two sections always describe the same textbook chapters.
   Does not read/write any Vocabulary, Kanji, Reading, Listening,
   Quiz, Audio, Database or Auth state.
   ========================================================= */
var GrammarPage = (() => {
  let activeLevel   = 'N5';
  let activeChapter = 0;
  let step          = 'levels';   // 'levels' | 'chapters' | 'list' | 'detail'
  let chapterSearch = '';
  let listSearch    = '';
  let detailIdx     = 0;
  let openPointIdx   = null;      // which point is expanded in the list (accordion)

  const LEVEL_COLORS = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };
  const LEVEL_ICONS  = { N5:'🌱', N4:'🍃', N3:'🌳', N2:'🏢', N1:'⛰️' };
  const BOOK_LABELS  = {
    N5: 'Minna no Nihongo I', N4: 'Minna no Nihongo II', N3: 'Minna no Nihongo Chukyu',
    N2: 'Nihongo Sou Matome N2', N1: 'Nihongo Sou Matome N1',
  };

  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function speakerIcon(size=15){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }
  function backArrowSvg() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
  }
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate;
    window.speechSynthesis.speak(u);
  }

  function crumbsHtml(parts) {
    return `<div class="nz-flow-crumbs">` + parts.map((p, i) => {
      const isLast = i === parts.length - 1;
      return isLast
        ? `<span class="nz-flow-crumb-current">${esc(p.label)}</span>`
        : `<button class="nz-flow-crumb-btn" data-crumb="${i}">${esc(p.label)}</button><span>›</span>`;
    }).join('') + `</div>`;
  }

  /* ── Data access ─────────────────────────────────────────── */
  function chaptersFor(level) {
    return (typeof NZChapterGrammar !== 'undefined' && NZChapterGrammar[level]) || [];
  }
  function currentChapter() {
    const chs = chaptersFor(activeLevel);
    return chs[activeChapter] || chs[0] || null;
  }
  function levelStats(lvl) {
    const chs = chaptersFor(lvl);
    const points = chs.reduce((sum, ch) => sum + ((ch.points || []).length), 0);
    return { chapterCount: chs.length, pointCount: points };
  }
  function filteredPoints() {
    const ch = currentChapter();
    if (!ch) return [];
    let pts = ch.points || [];
    const q = listSearch.trim().toLowerCase();
    if (q) {
      pts = pts.filter(p =>
        (p.pattern||'').toLowerCase().includes(q) ||
        (p.romaji||'').toLowerCase().includes(q) ||
        (p.usage||'').toLowerCase().includes(q));
    }
    return pts;
  }

  /* ── STEP 1: Level Selection ──────────────────────────────── */
  function renderLevelCardsScreen(area) {
    const lbl = document.getElementById('grammar-count-label');
    if (lbl) lbl.textContent = 'Choose a JLPT level to begin';
    area.innerHTML = `
      <div class="nz-level-grid">
        ${['N5','N4','N3','N2','N1'].map(lvl => {
          const col = LEVEL_COLORS[lvl];
          const stats = levelStats(lvl);
          return `
          <button class="nz-level-card" data-level="${lvl}" style="border-color:${col}33;">
            <div class="nz-level-bar" style="background:${col};"></div>
            <span class="nz-level-icon">${LEVEL_ICONS[lvl]}</span>
            <div class="nz-level-name" style="color:${col};">${lvl}</div>
            <div class="nz-level-meta">${stats.chapterCount} chapters · ${stats.pointCount} grammar points</div>
          </button>`;
        }).join('')}
      </div>`;
    area.querySelectorAll('.nz-level-card').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLevel = btn.dataset.level; activeChapter = 0; chapterSearch = '';
        goToChapters();
      });
    });
  }

  /* ── STEP 2: Chapter Cards ─────────────────────────────────── */
  function renderChapterCardsScreen(area) {
    const col = LEVEL_COLORS[activeLevel] || 'var(--primary)';
    const bookLabel = BOOK_LABELS[activeLevel] || activeLevel;
    const allChapters = chaptersFor(activeLevel);
    const lbl = document.getElementById('grammar-count-label');
    if (lbl) lbl.textContent = `${bookLabel} · ${allChapters.length} chapters`;

    const q = chapterSearch.trim().toLowerCase();
    const chapters = q
      ? allChapters.filter(ch =>
          String(ch.ch).includes(q) ||
          (ch.title || '').toLowerCase().includes(q))
      : allChapters;

    area.innerHTML = `
      <button class="nz-flow-back" id="grammar-back-levels">${backArrowSvg()} Back to Levels</button>
      ${crumbsHtml([{ label:'文 Grammar' }, { label: activeLevel }])}
      <div class="nz-list-toparea">
        <div class="nz-search-wrap nz-flow-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="grammar-chapter-search" type="text" placeholder="Search chapters…" value="${esc(chapterSearch)}" />
        </div>
      </div>
      ${!chapters.length
        ? `<p style="color:var(--fg-muted);text-align:center;padding:40px;">No chapters match “${esc(chapterSearch)}”.</p>`
        : `<div class="nz-chapter-grid">
            ${chapters.map(ch => {
              const idx = allChapters.indexOf(ch);
              const completed = typeof ch.completed === 'boolean' ? ch.completed : null;
              return `
              <button class="nz-chapter-card" data-idx="${idx}">
                <span class="nz-ch-num" style="background:${col}1e;color:${col};">CH ${ch.ch}</span>
                <div class="nz-ch-title">${esc(ch.title)}</div>
                <div class="nz-ch-topic">${(ch.points||[]).length} grammar points</div>
                <div class="nz-ch-footer">
                  <span>&nbsp;</span>
                  ${completed === true ? `<span class="nz-ch-complete-badge">✓ Completed</span>` : ''}
                </div>
              </button>`;
            }).join('')}
          </div>`}
    `;
    document.getElementById('grammar-back-levels')?.addEventListener('click', goToLevels);
    document.getElementById('grammar-chapter-search')?.addEventListener('input', e => {
      chapterSearch = e.target.value;
      renderChapterCardsScreen(area);
    });
    area.querySelectorAll('.nz-chapter-card').forEach(card => {
      card.addEventListener('click', () => {
        activeChapter = parseInt(card.dataset.idx);
        goToList();
      });
    });
  }

  /* ── STEP 3: Grammar List (per chapter, accordion + search) ─── */
  function renderListScreen(area) {
    const ch = currentChapter();
    const col = LEVEL_COLORS[activeLevel] || 'var(--primary)';
    if (!ch || !(ch.points||[]).length) {
      area.innerHTML = `
        <button class="nz-flow-back" id="grammar-back-chapters">${backArrowSvg()} Back to Chapters</button>
        ${crumbsHtml([{label:'文 Grammar'},{label:activeLevel},{label:ch?`Ch ${ch.ch}`:''}])}
        <div style="text-align:center;padding:3rem;color:var(--fg-muted);">
          <div style="font-size:2.5rem;">文</div>
          <p>Grammar content for this chapter is coming soon.</p>
        </div>`;
      document.getElementById('grammar-back-chapters')?.addEventListener('click', goToChapters);
      return;
    }
    const pts = filteredPoints();
    area.innerHTML = `
      <button class="nz-flow-back" id="grammar-back-chapters">${backArrowSvg()} Back to Chapters</button>
      ${crumbsHtml([{ label:'文 Grammar' }, { label: activeLevel }, { label:`Ch ${ch.ch}` }])}
      <div class="nz-list-toparea">
        <div class="nz-search-wrap nz-flow-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="grammar-list-search" type="text" placeholder="Search grammar patterns…" value="${esc(listSearch)}" />
        </div>
      </div>
      ${!pts.length
        ? `<p style="color:var(--fg-muted);text-align:center;padding:40px;">No grammar points match “${esc(listSearch)}”.</p>`
        : `<div style="display:flex;flex-direction:column;gap:10px;">
            ${pts.map((p) => {
              const realIdx = (ch.points||[]).indexOf(p);
              return `
              <div class="nz-gpoint-card">
                <div class="nz-gpoint-header" data-idx="${realIdx}">
                  <div>
                    <div class="nz-gpoint-pattern">${esc(p.pattern)}</div>
                    <div class="nz-gpoint-romaji">${esc(p.romaji||'')}</div>
                  </div>
                  <button class="nz-detail-audio-btn nz-gpoint-detail-btn" data-idx="${realIdx}"
                    style="padding:7px 14px;font-size:12px;">View Detail →</button>
                </div>
              </div>`;
            }).join('')}
          </div>`}
    `;
    document.getElementById('grammar-back-chapters')?.addEventListener('click', goToChapters);
    document.getElementById('grammar-list-search')?.addEventListener('input', e => {
      listSearch = e.target.value; renderListScreen(area);
    });
    area.querySelectorAll('.nz-gpoint-header, .nz-gpoint-detail-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetail(parseInt(el.dataset.idx));
      });
    });
  }

  /* ── STEP 4: Grammar Detail Page ───────────────────────────── */
  function openDetail(pointIdx) {
    detailIdx = pointIdx;
    step = 'detail';
    renderStepArea();
  }

  function renderDetailScreen(area) {
    const ch = currentChapter();
    const points = (ch && ch.points) || [];
    if (!points.length) { step = 'list'; renderStepArea(); return; }
    if (detailIdx >= points.length) detailIdx = 0;
    const p = points[detailIdx];
    const col = LEVEL_COLORS[activeLevel] || 'var(--primary)';

    area.innerHTML = `
      <button class="nz-flow-back" id="grammar-back-list">${backArrowSvg()} Back to List</button>
      ${crumbsHtml([{label:'文 Grammar'},{label:activeLevel},{label:`Ch ${ch.ch}`},{label:p.pattern}])}
      <div class="nz-detail-wrap">
        <div class="nz-detail-card">
          <span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;
            background:${col}1e;color:${col};margin-bottom:16px;">${activeLevel} · Ch ${ch.ch}</span>
          <div class="nz-detail-jp" style="font-size:30px;">${esc(p.pattern)}</div>
          <div class="nz-detail-romaji">${esc(p.romaji||'')}</div>

          <div class="nz-detail-row">
            <div class="nz-detail-label">Usage</div>
            <div class="nz-detail-value">${esc(p.usage||'')}</div>
          </div>
          ${p.example ? `
          <div class="nz-detail-row">
            <div class="nz-detail-label">Example Sentence</div>
            <div class="nz-gpoint-example" style="margin-top:6px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="nz-gpoint-example-jp">${esc(p.example)}</span>
                <button class="nz-gp-exspk" data-text="${esc(p.example)}" style="border:none;background:transparent;color:var(--fg-muted);cursor:pointer;padding:2px;">${speakerIcon(13)}</button>
              </div>
              ${p.translation ? `<div class="nz-gpoint-example-en">${esc(p.translation)}</div>` : ''}
            </div>
          </div>` : ''}
          ${(p.more_examples||[]).length ? `
          <div class="nz-detail-row">
            <div class="nz-detail-label">English Translation &amp; More Examples</div>
            ${(p.more_examples||[]).map(ex => `
              <div class="nz-gpoint-example" style="margin-top:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="nz-gpoint-example-jp" style="font-size:14px;">${esc(ex.jp)}</span>
                  <button class="nz-gp-exspk" data-text="${esc(ex.jp)}" style="border:none;background:transparent;color:var(--fg-muted);cursor:pointer;padding:2px;">${speakerIcon(12)}</button>
                </div>
                ${ex.en ? `<div class="nz-gpoint-example-en">${esc(ex.en)}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}

          <button class="nz-detail-audio-btn" id="grammar-detail-speak" style="margin-top:16px;">${speakerIcon(14)} Play Pronunciation</button>

          <div class="nz-detail-nav">
            <button class="nz-nav-btn" id="grammar-detail-prev" style="padding:8px 14px;border-radius:10px;
              background:var(--card-elevated);border:1px solid var(--border);color:var(--fg);cursor:pointer;">← Previous</button>
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--fg-muted);">${detailIdx+1} / ${points.length}</span>
            <button class="nz-nav-btn" id="grammar-detail-next" style="padding:8px 14px;border-radius:10px;
              background:var(--card-elevated);border:1px solid var(--border);color:var(--fg);cursor:pointer;">Next →</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('grammar-back-list')?.addEventListener('click', () => { step='list'; renderStepArea(); });
    document.getElementById('grammar-detail-speak')?.addEventListener('click', () => speak(p.pattern));
    area.querySelectorAll('.nz-gp-exspk').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); speak(b.dataset.text);
    }));
    document.getElementById('grammar-detail-prev')?.addEventListener('click', () => {
      detailIdx = (detailIdx - 1 + points.length) % points.length; renderStepArea();
    });
    document.getElementById('grammar-detail-next')?.addEventListener('click', () => {
      detailIdx = (detailIdx + 1) % points.length; renderStepArea();
    });
  }

  /* ── Step router ──────────────────────────────────────────── */
  function renderStepArea() {
    const area = document.getElementById('grammar-step-area');
    if (!area) return;
    switch (step) {
      case 'levels':   renderLevelCardsScreen(area); break;
      case 'chapters': renderChapterCardsScreen(area); break;
      case 'list':     renderListScreen(area); break;
      case 'detail':   renderDetailScreen(area); break;
    }
  }
  function goToLevels()   { step = 'levels';   renderStepArea(); }
  function goToChapters() { step = 'chapters'; renderStepArea(); }
  function goToList()     { step = 'list'; listSearch = ''; renderStepArea(); }
  function render()       { renderStepArea(); }

  /* ── Mount / Cleanup ──────────────────────────────────────── */
  function mount(containerId, initialLevel) {
    const container = document.getElementById(containerId);
    if (!container) return;
    step = 'levels'; chapterSearch = ''; listSearch = ''; detailIdx = 0; activeChapter = 0;
    if (initialLevel && LEVEL_COLORS[initialLevel]) {
      activeLevel = initialLevel;
      step = 'chapters';
    }
    container.innerHTML = `
<div style="max-width:1280px;margin:0 auto;padding:24px 16px;">
  <div style="margin-bottom:20px;">
    <h1 style="font-size:24px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">
      文法 Grammar Study
    </h1>
    <p id="grammar-count-label" style="font-size:13px;color:var(--fg-muted);">
      Master grammar patterns from N5 to N1 level
    </p>
  </div>
  <div id="grammar-step-area"></div>
</div>`;
    renderStepArea();
  }
  function cleanup() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { mount, cleanup, render };
})();

// ============================================================
'use strict';
/**
 * NihongoZen — Kanji Page Module
 * Precisely mirrors the reference UI:
 *   漢字 Kanji Study  header
 *   SRS Review by Level: N5 N4 N3 N2 N1 (colored pills)
 *   N5 | N4 | N3 | N2 | N1  tabs (active = green underline, matching photo)
 *   Search bar
 *   Grid / Flashcard modes
 */

/* =========================================================
   CSS — injected once
   ========================================================= */
(function injectKanjiStyles() {
  if (document.getElementById('kanji-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'kanji-page-styles';
  style.textContent = `
    /* ── Scrollbar hide ─── */
    #kanji-level-tabs::-webkit-scrollbar,
    #kanji-cat-tabs::-webkit-scrollbar { display:none; }

    /* ── Level tab active underline (green, matches photo) ─── */
    .knj-lvl-tab { position:relative; transition:color 0.15s; }
    .knj-lvl-tab.active::after {
      content:'';
      position:absolute;
      bottom:-2px; left:50%; transform:translateX(-50%);
      width:70%; height:2px;
      background:var(--success);
      border-radius:2px;
    }

    /* ── SRS pill colors ─── */
    .knj-srs-N5 { color:var(--success); border-color:var(--success) !important; }
    .knj-srs-N4 { color:#06b6d4; border-color:#06b6d4 !important; }
    .knj-srs-N3 { color:#eab308; border-color:#eab308 !important; }
    .knj-srs-N2 { color:#a855f7; border-color:#a855f7 !important; }
    .knj-srs-N1 { color:#ef4444; border-color:#ef4444 !important; }

    /* ── Kanji card ─── */
    .knj-card {
      border-radius:12px;
      border:1px solid var(--border,#2a2a2a);
      background:var(--card,#141414);
      padding:18px;
      cursor:pointer;
      transition:transform 0.2s, box-shadow 0.2s;
      position:relative;
    }
    .knj-card:hover {
      transform:translateY(-3px);
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
    }

    /* ── Flip card ─── */
    #knj-flip-inner.flipped { transform:rotateY(180deg); }

    /* ── Equalizer ─── */
    .knj-eq { display:flex;align-items:flex-end;gap:2px;height:14px; }
    .knj-eq-bar {
      width:3px;border-radius:2px;
      background:var(--primary,#e8446a);
      animation:knjEqBounce 0.8s ease-in-out infinite;
    }
    .knj-eq-bar:nth-child(1){animation-delay:0s;   height:6px;}
    .knj-eq-bar:nth-child(2){animation-delay:0.15s;height:12px;}
    .knj-eq-bar:nth-child(3){animation-delay:0.3s; height:8px;}
    @keyframes knjEqBounce {
      0%,100%{transform:scaleY(0.4);}
      50%    {transform:scaleY(1);}
    }

    /* ── Search bar ─── */
    .knj-search-wrap {
      flex:1; display:flex;align-items:center;gap:8px;
      background:var(--card-elevated,#1a1a1a);
      border:1px solid var(--border,#2a2a2a);
      border-radius:12px;
      padding:0 14px; height:40px;
    }
    .knj-search-wrap input {
      flex:1;background:transparent;border:none;outline:none;
      color:var(--fg,#f0f0f0);font-size:13px;font-family:inherit;
    }
    .knj-search-wrap input::placeholder{color:var(--fg-muted,#666);}

    /* ── Learned badge ─── */
    .knj-learned-badge {
      position:absolute;top:10px;right:10px;
      background:rgba(34,197,94,0.15);
      color:#22c55e;
      border:1px solid rgba(34,197,94,0.3);
      border-radius:6px;
      font-size:9px;font-weight:700;
      padding:2px 6px;
      letter-spacing:0.5px;
    }

    /* ── Nav button hover ─── */
    .knj-nav-btn:hover { border-color:var(--primary,#e8446a) !important; }

    /* ── Mode button ─── */
    .knj-mode-btn {
      padding:7px 14px;border-radius:8px;
      font-size:13px;font-weight:600;
      cursor:pointer;font-family:inherit;
      transition:all 0.15s;
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   KANJI PAGE
   ========================================================= */
var KanjiPage = (() => {
  let mode        = 'grid';
  let activeLevel = 'N5';
  let cardIndex   = 0;
  let flipped     = false;
  let speakingId  = null;
  let speakTimer  = null;
  let keyHandler  = null;
  let searchQuery = '';

  /* ── Level accent colors ────────────────────────────── */
  const LEVEL_COLORS = {
    N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444'
  };

  /* ── Audio ──────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang=lang; u.rate=rate;
    window.speechSynthesis.speak(u);
  }
  function speakKanji(kanji, meaning) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const j = new SpeechSynthesisUtterance(kanji);
    j.lang='ja-JP'; j.rate=0.75;
    j.onend = () => setTimeout(()=>{
      const e = new SpeechSynthesisUtterance(meaning);
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    }, 700);
    window.speechSynthesis.speak(j);
  }

  /* ── Filter ─────────────────────────────────────────── */
  function getFiltered() {
    if (typeof kanjiData === 'undefined') return [];
    let list = kanjiData[activeLevel] || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(k =>
        k.kanji.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.reading.toLowerCase().includes(q) ||
        (k.kun && k.kun.toLowerCase().includes(q)) ||
        (k.on  && k.on.toLowerCase().includes(q))
      );
    }
    return list;
  }

  /* ── Total count per level ──────────────────────────── */
  function levelCount(lvl) {
    if (typeof kanjiData === 'undefined') return 0;
    return (kanjiData[lvl]||[]).length;
  }

  /* ── Flashcard nav ──────────────────────────────────── */
  function nextCard() {
    flipped=false; updateFlip();
    setTimeout(()=>{ cardIndex=(cardIndex+1)%getFiltered().length; renderFCContent(); },150);
  }
  function prevCard() {
    flipped=false; updateFlip();
    setTimeout(()=>{ const f=getFiltered(); cardIndex=(cardIndex-1+f.length)%f.length; renderFCContent(); },150);
  }
  function flipCard() { flipped=!flipped; updateFlip(); }
  function updateFlip() {
    const el=document.getElementById('knj-flip-inner');
    if(el) el.classList.toggle('flipped',flipped);
  }
  function goToCard(i) { cardIndex=i; flipped=false; updateFlip(); renderFCContent(); }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode!=='flashcard') return;
      if (e.key==='ArrowRight'){e.preventDefault();nextCard();}
      else if (e.key==='ArrowLeft'){e.preventDefault();prevCard();}
      else if (e.key===' '){e.preventDefault();flipCard();}
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler){window.removeEventListener('keydown',keyHandler);keyHandler=null;}
  }

  /* ── Speak btn update ────────────────────────────────── */
  function updateSpeakBtns() {
    document.querySelectorAll('.knj-speak-btn').forEach(btn=>{
      const playing=btn.dataset.id===speakingId;
      btn.style.background=playing?'var(--primary-dim,rgba(232,68,106,0.15))':'transparent';
      btn.style.color=playing?'var(--primary,#e8446a)':'var(--fg-muted,#666)';
      btn.innerHTML=playing
        ?`<div class="knj-eq"><div class="knj-eq-bar"></div><div class="knj-eq-bar"></div><div class="knj-eq-bar"></div></div>`
        :speakerIcon(14);
    });
  }
  function handleSpeakBtn(e, kanji) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId=kanji.id;
    speakKanji(kanji.kanji, kanji.meaning);
    updateSpeakBtns();
    speakTimer=setTimeout(()=>{speakingId=null;updateSpeakBtns();},3000);
  }

  /* ── Toggle learned ─────────────────────────────────── */
  function toggleLearned(id) {
    if (typeof kanjiData==='undefined') return;
    for (const lvl of Object.keys(kanjiData)) {
      const k = kanjiData[lvl].find(x=>x.id===id);
      if (k) { k.learned=!k.learned; break; }
    }
    if (mode==='grid') renderGrid();
    else renderFCContent();
  }

  /* ── Helpers ─────────────────────────────────────────── */
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function speakerIcon(size=14){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }

  /* ── Level tabs ─────────────────────────────────────── */
  function renderLevelTabs() {
    const wrap=document.getElementById('kanji-level-tabs');
    if(!wrap) return;
    const col=LEVEL_COLORS[activeLevel];
    wrap.innerHTML=['N5','N4','N3','N2','N1'].map(lvl=>`
      <button class="knj-lvl-tab ${activeLevel===lvl?'active':''}" data-level="${lvl}"
        style="padding:10px 18px;font-size:14px;font-weight:700;
               background:transparent;border:none;
               color:${activeLevel===lvl?'var(--fg)':'var(--fg-muted)'};
               cursor:pointer;font-family:inherit;">
        ${lvl}
      </button>`).join('');
    wrap.querySelectorAll('.knj-lvl-tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        activeLevel=btn.dataset.level; cardIndex=0; flipped=false;
        searchQuery=''; const si=document.getElementById('kanji-search-input'); if(si) si.value='';
        render();
      });
    });
  }

  /* ── Grid ────────────────────────────────────────────── */
  function renderGrid() {
    const filtered=getFiltered();
    const area=document.getElementById('kanji-main-area');
    if(!area) return;
    const col=LEVEL_COLORS[activeLevel];

    if(!filtered.length){
      area.innerHTML=`<p style="color:var(--fg-muted);text-align:center;padding:48px 0;">No kanji found.</p>`;
      return;
    }

    area.innerHTML=`
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
  ${filtered.map(k=>`
    <div class="knj-card" data-id="${esc(k.id)}"
      style="border-left:3px solid ${col};">
      ${k.learned?`<span class="knj-learned-badge">✓ LEARNED</span>`:''}
      <!-- Kanji + speak -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
        <div style="font-family:'Noto Sans JP',sans-serif;font-size:44px;font-weight:900;
                    color:var(--fg);line-height:1;">${esc(k.kanji)}</div>
        <button class="knj-speak-btn" data-id="${esc(k.id)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;margin-top:4px;">
          ${speakerIcon(14)}
        </button>
      </div>
      <!-- Meaning -->
      <p style="font-size:13px;font-weight:700;color:var(--fg);margin-bottom:6px;">${esc(k.meaning)}</p>
      <!-- Readings -->
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
        ${k.kun?`<span style="padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;
                              background:rgba(34,197,94,0.12);color:#22c55e;font-family:'Noto Sans JP',sans-serif;">
                   kun: ${esc(k.kun)}</span>`:''}
        ${k.on ?`<span style="padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;
                              background:rgba(6,182,212,0.12);color:#06b6d4;font-family:'Noto Sans JP',sans-serif;">
                   on: ${esc(k.on)}</span>`:''}
      </div>
      <!-- Example -->
      <p style="font-size:11px;color:var(--fg-muted);font-family:'Noto Sans JP',sans-serif;
                border-top:1px solid var(--border);padding-top:8px;margin-bottom:8px;">${esc(k.example)}</p>
      <!-- Learned toggle -->
      <button class="knj-learned-btn" data-id="${esc(k.id)}"
        style="width:100%;padding:5px 0;border-radius:7px;border:1px solid ${k.learned?'rgba(34,197,94,0.4)':'var(--border)'};
               background:${k.learned?'rgba(34,197,94,0.1)':'transparent'};
               color:${k.learned?'#22c55e':'var(--fg-muted)'};font-size:11px;font-weight:600;
               cursor:pointer;font-family:inherit;transition:all 0.15s;">
        ${k.learned?'✓ Learned':'Mark as Learned'}
      </button>
    </div>
  `).join('')}
</div>`;

    area.querySelectorAll('.knj-speak-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const k=(kanjiData[activeLevel]||[]).find(x=>x.id===btn.dataset.id);
        if(k) handleSpeakBtn(e,k);
      });
    });
    area.querySelectorAll('.knj-learned-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{ e.stopPropagation(); toggleLearned(btn.dataset.id); });
    });
    area.querySelectorAll('.knj-card').forEach(card=>{
      card.addEventListener('click',e=>{
        if(e.target.closest('.knj-speak-btn')||e.target.closest('.knj-learned-btn')) return;
        const k=(kanjiData[activeLevel]||[]).find(x=>x.id===card.dataset.id);
        if(k) speak(k.kanji);
      });
    });
  }

  /* ── Flashcard content ──────────────────────────────── */
  function renderFCContent() {
    const filtered=getFiltered();
    if(!filtered.length) return;
    const k=filtered[cardIndex]||filtered[0];
    const col=LEVEL_COLORS[activeLevel];
    const front=document.getElementById('knj-fc-front');
    const back=document.getElementById('knj-fc-back');
    const counter=document.getElementById('knj-fc-counter');
    const inner=document.getElementById('knj-flip-inner');
    if(inner) inner.classList.toggle('flipped',flipped);

    if(front) front.innerHTML=`
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:80px;font-weight:900;
                  color:var(--fg);line-height:1;margin-bottom:8px;">${esc(k.kanji)}</div>
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        ${k.kun?`<span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;
                              background:rgba(34,197,94,0.12);color:#22c55e;">kun: ${esc(k.kun)}</span>`:''}
        ${k.on ?`<span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;
                              background:rgba(6,182,212,0.12);color:#06b6d4;">on: ${esc(k.on)}</span>`:''}
      </div>
      <button id="knj-fc-speak-front"
        style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
               border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
               color:var(--primary,#e8446a);font-size:12px;cursor:pointer;font-family:inherit;margin-top:4px;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:8px;">Click to reveal meaning</p>`;

    if(back) back.innerHTML=`
      <p style="font-size:26px;font-weight:800;color:var(--fg);text-align:center;margin-bottom:8px;">${esc(k.meaning)}</p>
      <p style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg-muted);
                text-align:center;margin-bottom:12px;">${esc(k.example)}</p>
      <span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;
                   background:${col}18;color:${col};margin-bottom:12px;">${esc(activeLevel)}</span>
      <div style="display:flex;gap:8px;">
        <button id="knj-fc-speak-back"
          style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
                 border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
                 color:var(--primary,#e8446a);font-size:12px;cursor:pointer;font-family:inherit;">
          ${speakerIcon(12)} Hear kanji
        </button>
        <button id="knj-fc-learned-btn"
          style="display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;
                 border:1px solid ${k.learned?'rgba(34,197,94,0.4)':'var(--border)'};
                 background:${k.learned?'rgba(34,197,94,0.12)':'transparent'};
                 color:${k.learned?'#22c55e':'var(--fg-muted)'};font-size:12px;cursor:pointer;font-family:inherit;">
          ${k.learned?'✓ Learned':'Mark Learned'}
        </button>
      </div>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:8px;">Click to flip back</p>`;

    const ff=document.getElementById('knj-fc-speak-front');
    if(ff) ff.addEventListener('click',e=>{e.stopPropagation();speak(k.kanji);});
    const fb=document.getElementById('knj-fc-speak-back');
    if(fb) fb.addEventListener('click',e=>{e.stopPropagation();speakKanji(k.kanji,k.meaning);});
    const lb=document.getElementById('knj-fc-learned-btn');
    if(lb) lb.addEventListener('click',e=>{e.stopPropagation();toggleLearned(k.id);});

    if(counter) counter.textContent=`${cardIndex+1} / ${filtered.length}`;
    const dots=document.getElementById('knj-fc-dots');
    if(dots){
      const shown=filtered.slice(0,Math.min(filtered.length,20));
      dots.innerHTML=shown.map((_,i)=>`
        <button class="knj-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.knj-dot').forEach(d=>d.addEventListener('click',()=>goToCard(parseInt(d.dataset.i))));
    }
  }

  /* ── Flashcard wrapper ──────────────────────────────── */
  function renderFlashcard() {
    const area=document.getElementById('kanji-main-area');
    if(!area) return;
    area.innerHTML=`
<div style="display:flex;flex-direction:column;align-items:center;max-width:400px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → keys to navigate · Space to flip
  </p>
  <div id="knj-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="knj-flip-inner"
      style="width:100%;height:260px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="knj-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;
               gap:6px;padding:24px;"></div>
      <div id="knj-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary,#e8446a);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;
               gap:6px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="knj-fc-prev" class="knj-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="knj-fc-counter"
      style="font-family:'JetBrains Mono',monospace;font-size:13px;
             color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="knj-fc-next" class="knj-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="knj-fc-reset" class="knj-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </div>
  <div id="knj-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('knj-fc-wrap').addEventListener('click',flipCard);
    document.getElementById('knj-fc-prev').addEventListener('click',prevCard);
    document.getElementById('knj-fc-next').addEventListener('click',nextCard);
    document.getElementById('knj-fc-reset').addEventListener('click',()=>{cardIndex=0;flipped=false;updateFlip();renderFCContent();});
    renderFCContent();
    attachKeys();
  }

  /* ── Mode buttons ────────────────────────────────────── */
  function renderModeBtns() {
    const wrap=document.getElementById('kanji-mode-btns');
    if(!wrap) return;
    wrap.innerHTML=['grid','flashcard'].map(m=>`
      <button class="knj-mode-btn" data-mode="${m}"
        style="border:1px solid ${mode===m?'var(--primary,#e8446a)':'var(--border)'};
               background:${mode===m?'var(--primary,#e8446a)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.knj-mode-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{detachKeys();mode=btn.dataset.mode;flipped=false;render();});
    });
  }

  /* ── Full render ─────────────────────────────────────── */
  function render() {
    renderModeBtns();
    renderLevelTabs();
    // Update subtitle count
    const sub=document.getElementById('kanji-count-label');
    if(sub){
      const total = Object.values(kanjiData||{}).reduce((a,b)=>a+b.length,0);
      const lvlCount = levelCount(activeLevel);
      sub.textContent=`${lvlCount} kanji in ${activeLevel} · ${total} total`;
    }
    if(mode==='grid'){detachKeys();renderGrid();}
    else renderFlashcard();
  }

  /* ── Mount ───────────────────────────────────────────── */
  function mount(containerId) {
    const container=document.getElementById(containerId);
    if(!container) return;

    container.innerHTML=`
<div style="max-width:1600px;margin:0 auto;padding:24px 16px;">

  <!-- ═══ Header ═══ -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;
              margin-bottom:20px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:24px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">
        漢字 Kanji Study
      </h1>
      <p id="kanji-count-label" style="font-size:13px;color:var(--fg-muted);">
        Master kanji from N5 to N1 level
      </p>
    </div>
    <div id="kanji-mode-btns" style="display:flex;gap:8px;"></div>
  </div>

  <!-- ═══ SRS Review row (exact reference photo layout) ═══ -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
    <span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--fg-muted);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      SRS Review by Level:
    </span>
    <div id="kanji-srs-pills" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
  </div>

  <!-- ═══ Level tabs + Search (matches reference photo) ═══ -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
    <!-- Level tab row -->
    <div id="kanji-level-tabs"
      style="display:flex;align-items:center;
             background:var(--card-elevated,#1a1a1a);
             border:1px solid var(--border,#2a2a2a);
             border-radius:12px;padding:4px;
             overflow-x:auto;scrollbar-width:none;flex-shrink:0;">
    </div>
    <!-- Search bar -->
    <div class="knj-search-wrap" style="min-width:200px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input id="kanji-search-input" type="text" placeholder="Search kanji, meaning, reading…" />
    </div>
  </div>

  <!-- ═══ Stats strip ═══ -->
  <div id="kanji-stats-strip"
    style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;"></div>

  <!-- ═══ Main content area ═══ -->
  <div id="kanji-main-area"></div>
</div>`;

    /* SRS pills */
    const srsWrap=document.getElementById('kanji-srs-pills');
    if(srsWrap){
      srsWrap.innerHTML=['N5','N4','N3','N2','N1'].map(lvl=>`
        <button class="knj-srs-${lvl}" data-level="${lvl}"
          style="padding:6px 14px;border-radius:8px;font-size:13px;font-weight:700;
                 background:transparent;border:1px solid currentColor;
                 cursor:pointer;font-family:inherit;transition:background 0.15s;">
          ${lvl}
        </button>`).join('');
      srsWrap.querySelectorAll('button').forEach(btn=>{
        btn.addEventListener('mouseenter',()=>{btn.style.background='rgba(255,255,255,0.07)';});
        btn.addEventListener('mouseleave',()=>{btn.style.background='transparent';});
        btn.addEventListener('click',()=>{
          activeLevel=btn.dataset.level; cardIndex=0; flipped=false; searchQuery='';
          const si=document.getElementById('kanji-search-input'); if(si) si.value='';
          render();
        });
      });
    }

    /* Search */
    container.querySelector('#kanji-search-input').addEventListener('input',e=>{
      searchQuery=e.target.value; cardIndex=0;
      if(mode==='grid') renderGrid();
      else renderFCContent();
    });

    /* Stats strip */
    function buildStats() {
      const strip=document.getElementById('kanji-stats-strip');
      if(!strip||typeof kanjiData==='undefined') return;
      strip.innerHTML=['N5','N4','N3','N2','N1'].map(lvl=>{
        const total=(kanjiData[lvl]||[]).length;
        const learned=(kanjiData[lvl]||[]).filter(k=>k.learned).length;
        const pct=total?Math.round(learned/total*100):0;
        const col=LEVEL_COLORS[lvl];
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;
                             border-radius:10px;border:1px solid var(--border);
                             background:var(--card-elevated);">
          <span style="font-size:12px;font-weight:700;color:${col};">${lvl}</span>
          <div style="width:80px;height:4px;border-radius:4px;background:var(--border);overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${col};border-radius:4px;transition:width 0.4s;"></div>
          </div>
          <span style="font-size:11px;color:var(--fg-muted);">${learned}/${total}</span>
        </div>`;
      }).join('');
    }
    buildStats();

    render();
  }

  /* ── Cleanup ─────────────────────────────────────────── */
  function cleanup() {
    detachKeys();
    if(speakTimer) clearTimeout(speakTimer);
    if(window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { mount, cleanup, render };
})();

// ============================================================
// Source: nz-chapter-controller.js
// ============================================================
'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/nz-chapter-controller.js
// NihongoZen — Chapter Module Integration Controller
//
// Responsibilities:
//   1. Deduplicates vocab inside the existing VocabPage before it renders
//   2. Injects "📖 Chapters" button next to "📚 Basic Vocab" button
//   3. Adds chapter-wise Grammar / Reading / Listening tabs inside the
//      chapter overlay modal (reuses NZChapterVocab's overlay infrastructure)
//   4. Wires chapter sidebar navigation across all four content types
//   5. Plugs into existing NZGrammar / NZReading / NZListening render helpers
//      so all styling (CSS vars, card classes, quiz HTML) exactly matches the
//      live site — zero new style classes introduced except those already
//      defined in nz-chapter-vocab.js
//
// LOAD ORDER (add to index.html before </body>):
//   <script src="js/nz-chapter-vocab.js"></script>
//   <script src="js/nz-chapter-grammar.js"></script>
//   <script src="js/nz-chapter-reading.js"></script>
//   <script src="js/nz-chapter-listening.js"></script>
//   <script src="js/nz-chapter-controller.js"></script>  ← this file
// ═══════════════════════════════════════════════════════════════════════════════

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 1 — VOCAB DEDUPLICATION
   Patches the existing NZVocabPage / NZData objects to remove duplicate words
   before they are rendered, without touching the original data arrays.
   ───────────────────────────────────────────────────────────────────────────── */
(function deduplicateVocab() {
  // Wait until data objects are ready then patch
  const tryPatch = () => {
    // Support both common export names
    const dataObj = window.NZData || window.VocabPageWords || window.NihongoZenData;
    if (!dataObj) { setTimeout(tryPatch, 200); return; }

    const levels = ['n5', 'n4', 'n3', 'n2', 'n1', 'N5', 'N4', 'N3', 'N2', 'N1'];
    levels.forEach(lvl => {
      const arr = dataObj[lvl] || dataObj[lvl.toLowerCase()] || dataObj[lvl.toUpperCase()];
      if (!Array.isArray(arr)) return;
      const seen = new Set();
      const deduped = arr.filter(w => {
        // Normalise key: trim + lowercase the Japanese
        const key = (w.jp || w.word || w.kanji || '').trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      // Replace in-place so existing references still work
      arr.length = 0;
      deduped.forEach(w => arr.push(w));
    });
    console.log('[NZChapter] Vocab deduplication complete.');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPatch);
  } else {
    tryPatch();
  }
})();


/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2 — CHAPTER CONTROLLER SINGLETON
   ───────────────────────────────────────────────────────────────────────────── */
const NZChapterController = (() => {

  /* ── State ─────────────────────────────────────────────── */
  let activeLevel   = 'N5';
  let activeChapter = 0;      // index into the active level's chapter array
  let activeTab     = 'vocab'; // 'vocab' | 'grammar' | 'reading' | 'listening'
  let quizState     = { active:false, idx:0, score:0, answered:false };
  let passageState  = { open:false, passageIdx:0, showTrans:false, reading:false };
  let dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };

  /* ── Colour map ────────────────────────────────────────── */
  const COLORS = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };

  /* ── Level → textbook label ────────────────────────────── */
  function bookLabel(level, ch) {
    const c = ch.chBook || ch.ch;
    const map = {
      N5: `Minna no Nihongo I — Ch ${c}`,
      N4: `Minna no Nihongo II — Ch ${c}`,
      N3: `Minna no Nihongo Chukyu — Ch ${c}`,
      N2: `Nihongo Somatome N2 — Ch ${c}`,
      N1: `Nihongo Somatome N1 — Ch ${c}`,
    };
    return map[level] || `Ch ${c}`;
  }

  /* ── Get chapter data ──────────────────────────────────── */
  function chapterList(tab) {
    const src = {
      vocab:     window.NZChapterData,
      grammar:   window.NZChapterGrammar,
      reading:   window.NZChapterReading,
      listening: window.NZChapterListening,
    }[tab];
    return (src && src[activeLevel]) || [];
  }

  function currentChapter(tab) {
    const list = chapterList(tab);
    return list[activeChapter] || list[0] || null;
  }

  /* ── Escape ────────────────────────────────────────────── */
  function esc(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Speaker icon SVG ──────────────────────────────────── */
  function spk(sz=14){
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>`;
  }

  /* ── TTS ───────────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate;
    window.speechSynthesis.speak(u);
  }

  /* ═══════════════════════════════════════════════════════
     MODAL SHELL (tab bar upgrade)
     Extends the existing NZChapterVocab overlay by adding
     four content-type tabs to the top bar.
     ═══════════════════════════════════════════════════════ */
  function ensureTabBar() {
    // The tab bar lives inside #nzcv-modal's top bar
    const modal = document.getElementById('nzcv-modal');
    if (!modal || document.getElementById('nzcc-tab-bar')) return;

    // Find the first child div (top bar) — inject tab bar after the heading group
    const topBar = modal.querySelector('div');
    if (!topBar) return;

    const tabBar = document.createElement('div');
    tabBar.id = 'nzcc-tab-bar';
    tabBar.style.cssText =
      'display:flex;gap:4px;padding:0 20px 0;border-bottom:1px solid var(--border,#2a2a2a);flex-shrink:0;';
    topBar.insertAdjacentElement('afterend', tabBar);
    renderTabBar();
  }

  function renderTabBar() {
    const bar = document.getElementById('nzcc-tab-bar');
    if (!bar) return;
    const tabs = [
      { id:'vocab',     label:'📚 Vocabulary' },
      { id:'grammar',   label:'文 Grammar'     },
      { id:'reading',   label:'📖 Reading'     },
      { id:'listening', label:'🎧 Listening'   },
    ];
    bar.innerHTML = tabs.map(t => `
      <button data-tab="${t.id}" style="
        padding:10px 15px; background:transparent; border:none;
        border-bottom:2px solid ${activeTab===t.id?'var(--primary,#e8446a)':'transparent'};
        color:${activeTab===t.id?'var(--fg,#f0f0f0)':'var(--fg-muted,#888)'};
        font-size:12px; font-weight:${activeTab===t.id?700:500};
        cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap;">
        ${t.label}
      </button>`).join('');
    bar.querySelectorAll('button[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        quizState = { active:false, idx:0, score:0, answered:false };
        passageState = { open:false, passageIdx:0, showTrans:false, reading:false };
        dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
        renderTabBar();
        syncSidebar();
        renderChapterHeader();
        renderMainArea();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     SIDEBAR SYNC
     Overrides NZChapterVocab's sidebar to show chapters
     for the currently active tab's data source.
     ═══════════════════════════════════════════════════════ */
  function syncSidebar() {
    const sb = document.getElementById('nzcv-sidebar');
    if (!sb) return;
    const chapters = chapterList(activeTab);
    const color    = COLORS[activeLevel];
    sb.innerHTML = chapters.map((ch, i) => `
      <button class="nzcv-ch-btn ${i===activeChapter?'active':''}" data-idx="${i}"
        style="width:100%;padding:9px 16px;background:transparent;border:none;
               text-align:left;cursor:pointer;font-family:inherit;font-size:12px;
               color:${i===activeChapter?'var(--fg)':'var(--fg-muted,#888)'};
               border-left:3px solid ${i===activeChapter?color:'transparent'};
               font-weight:${i===activeChapter?700:400};
               transition:background 0.12s,color 0.12s;line-height:1.4;">
        <span style="display:inline-block;padding:1px 6px;border-radius:4px;
                     font-size:10px;font-weight:700;margin-right:6px;
                     background:${color}18;color:${color};
                     font-family:'JetBrains Mono',monospace;">${ch.ch}</span>
        <span style="font-size:11px;">${esc(ch.title)}</span>
      </button>`).join('');
    sb.querySelectorAll('.nzcv-ch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChapter = parseInt(btn.dataset.idx);
        quizState = { active:false, idx:0, score:0, answered:false };
        passageState = { open:false, passageIdx:0, showTrans:false, reading:false };
        dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
        syncSidebar();
        renderChapterHeader();
        renderMainArea();
        btn.scrollIntoView({ block:'nearest', behavior:'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     CHAPTER HEADER
     ═══════════════════════════════════════════════════════ */
  function renderChapterHeader() {
    const wrap = document.getElementById('nzcv-ch-header');
    if (!wrap) return;
    const ch    = currentChapter(activeTab);
    if (!ch) { wrap.innerHTML = ''; return; }
    const color = COLORS[activeLevel];
    const list  = chapterList(activeTab);

    wrap.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;
                  flex-wrap:wrap;gap:8px;padding:16px 20px 12px;
                  border-bottom:1px solid var(--border,#2a2a2a);">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;
                         background:${color}22;color:${color};">${esc(activeLevel)}</span>
            <span style="font-size:11px;color:var(--fg-muted);">${esc(bookLabel(activeLevel,ch))}</span>
          </div>
          <div style="font-size:18px;font-weight:800;color:var(--fg);letter-spacing:-0.3px;margin-bottom:2px;
                      font-family:'Noto Sans JP',sans-serif;">${esc(ch.title)}</div>
          <div style="font-size:12px;color:var(--fg-muted);">${esc(ch.topic||'')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button id="nzcc-prev-ch" style="padding:7px;border-radius:10px;background:var(--card-elevated);
            border:1px solid var(--border);cursor:pointer;color:var(--fg);transition:border-color 0.15s;"
            ${activeChapter===0?'disabled style="opacity:0.3;pointer-events:none;"':''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button id="nzcc-next-ch" style="padding:7px;border-radius:10px;background:var(--card-elevated);
            border:1px solid var(--border);cursor:pointer;color:var(--fg);transition:border-color 0.15s;"
            ${activeChapter>=list.length-1?'disabled style="opacity:0.3;pointer-events:none;"':''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>`;

    document.getElementById('nzcc-prev-ch')?.addEventListener('click', () => {
      if (activeChapter > 0) { activeChapter--; refresh(); }
    });
    document.getElementById('nzcc-next-ch')?.addEventListener('click', () => {
      if (activeChapter < list.length - 1) { activeChapter++; refresh(); }
    });
  }

  function refresh() {
    quizState = { active:false, idx:0, score:0, answered:false };
    passageState = { open:false, passageIdx:0, showTrans:false, reading:false };
    dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
    syncSidebar();
    renderChapterHeader();
    renderMainArea();
  }

  /* ═══════════════════════════════════════════════════════
     MAIN AREA ROUTER
     ═══════════════════════════════════════════════════════ */
  function renderMainArea() {
    const area = document.getElementById('nzcv-main-area');
    if (!area) return;
    switch (activeTab) {
      case 'vocab':     renderVocabArea(area);     break;
      case 'grammar':   renderGrammarArea(area);   break;
      case 'reading':   renderReadingArea(area);   break;
      case 'listening': renderListeningArea(area); break;
    }
    // Hide search bar when not on vocab tab
    const searchWrap = document.querySelector('.nzcv-search-wrap')?.parentElement;
    if (searchWrap) searchWrap.style.display = activeTab === 'vocab' ? '' : 'none';
    // Hide mode buttons (grid/flashcard) when not on vocab tab
    const modeBtns = document.getElementById('nzcv-mode-btns');
    if (modeBtns) modeBtns.style.display = activeTab === 'vocab' ? '' : 'none';
  }

  /* ─── VOCAB ─────────────────────────────────────────── */
  function renderVocabArea(area) {
    // Delegate to NZChapterVocab's own render (it controls mode/flashcard/search)
    // We just trigger its internal render cycle by calling the public method it
    // exposes via renderAll() – however since NZChapterVocab is a closure we
    // cannot call renderAll() directly.  Instead we fire a synthetic click on
    // the active sidebar button which triggers NZChapterVocab's own handlers.
    // Simpler: just re-use NZChapterVocab data and render grid here ourselves.
    const ch = currentChapter('vocab');
    if (!ch) { area.innerHTML = '<p style="color:var(--fg-muted);padding:24px;">No vocabulary for this chapter.</p>'; return; }
    const color = COLORS[activeLevel];
    area.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
                                   gap:10px;padding:16px;">
      ${(ch.words||[]).map(w=>`
        <div class="nzcv-word-card" style="border-radius:12px;border:1px solid var(--border,#2a2a2a);
             background:var(--card,#141414);padding:16px;cursor:pointer;
             border-left:3px solid ${color};transition:transform 0.18s,box-shadow 0.18s;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
            <div>
              <div style="font-family:'Noto Sans JP',sans-serif;font-size:20px;font-weight:700;
                          color:var(--fg);margin-bottom:2px;">${esc(w.jp)}</div>
              <p style="font-family:'JetBrains Mono',monospace;font-size:10px;
                        color:var(--fg-muted);font-style:italic;">${esc(w.romaji||'')}</p>
            </div>
            <button class="nzcc-spk" data-jp="${esc(w.jp)}"
              style="padding:5px;border-radius:8px;border:none;background:transparent;
                     color:var(--fg-muted);cursor:pointer;">${spk(14)}</button>
          </div>
          <p style="font-size:12px;color:var(--fg);margin:0;">${esc(w.en)}</p>
        </div>`).join('')}
    </div>`;
    area.querySelectorAll('.nzcc-spk').forEach(b=>b.addEventListener('click',e=>{
      e.stopPropagation(); speak(b.dataset.jp);
    }));
  }

  /* ─── GRAMMAR ────────────────────────────────────────── */
  function renderGrammarArea(area) {
    const ch = currentChapter('grammar');
    if (!ch || !ch.points || !ch.points.length) {
      area.innerHTML = `<div class="nz-empty-state" style="text-align:center;padding:3rem;">
        <div style="font-size:2.5rem;">文</div>
        <p style="color:var(--fg-muted);">Grammar content for this chapter is coming soon.</p>
      </div>`; return;
    }
    area.innerHTML = `<div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
      ${ch.points.map((g,i)=>`
        <div class="nz-grammar-card" id="nzcc-gc-${i}"
          style="border-radius:12px;border:1px solid var(--border);background:var(--card);">
          <div class="nz-grammar-header" data-gi="${i}"
            style="display:flex;align-items:center;justify-content:space-between;
                   padding:14px 18px;cursor:pointer;gap:12px;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <span class="nz-grammar-pattern"
                  style="font-family:'Noto Sans JP',sans-serif;font-size:16px;font-weight:700;
                         color:var(--fg);">${esc(g.pattern)}</span>
                <span style="font-size:11px;color:var(--fg-muted);font-style:italic;">
                  ${esc(g.romaji||'')}</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
              <button class="nz-speak-btn nzcc-gspk" data-text="${esc(g.pattern)}"
                style="padding:4px;border:none;background:transparent;cursor:pointer;
                       color:var(--fg-muted);">${spk(13)}</button>
              <span class="nz-grammar-chevron" style="color:var(--fg-muted);font-size:14px;">▾</span>
            </div>
          </div>
          <div id="nzcc-gb-${i}" style="display:none;padding:0 18px 16px;">
            <p style="font-size:13px;color:var(--fg-muted);margin-bottom:12px;line-height:1.6;">
              ${esc(g.usage||'')}</p>
            ${g.example?`<div class="nz-grammar-example"
              style="background:var(--card-elevated);border-radius:8px;padding:12px 14px;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-family:'Noto Sans JP',sans-serif;font-size:15px;color:var(--fg);">
                  ${esc(g.example)}</span>
                <button class="nzcc-exspk" data-text="${esc(g.example)}"
                  style="padding:4px;border:none;background:transparent;cursor:pointer;
                         color:var(--fg-muted);flex-shrink:0;">${spk(12)}</button>
              </div>
              ${g.translation?`<div style="font-size:12px;color:var(--fg-muted);margin-top:4px;">
                ${esc(g.translation)}</div>`:''}
            </div>`:''}
            ${(g.more_examples||[]).map(ex=>`
              <div class="nz-grammar-example nz-grammar-example-more"
                style="background:var(--card-elevated);border-radius:8px;padding:10px 14px;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg);">
                    ${esc(ex.jp)}</span>
                  <button class="nzcc-exspk" data-text="${esc(ex.jp)}"
                    style="padding:4px;border:none;background:transparent;cursor:pointer;
                           color:var(--fg-muted);flex-shrink:0;">${spk(11)}</button>
                </div>
                ${ex.en?`<div style="font-size:11px;color:var(--fg-muted);margin-top:3px;">
                  ${esc(ex.en)}</div>`:''}
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;

    // Expand/collapse
    area.querySelectorAll('.nz-grammar-header[data-gi]').forEach(hdr=>{
      hdr.addEventListener('click', e=>{
        if (e.target.closest('.nz-speak-btn, .nzcc-gspk')) return;
        const i = hdr.dataset.gi;
        const body = document.getElementById(`nzcc-gb-${i}`);
        const chev = hdr.querySelector('.nz-grammar-chevron');
        const open = body.style.display!=='none';
        body.style.display = open?'none':'block';
        if (chev) chev.textContent = open?'▾':'▴';
      });
    });
    area.querySelectorAll('.nzcc-gspk,.nzcc-exspk').forEach(b=>{
      b.addEventListener('click', e=>{ e.stopPropagation(); speak(decodeURIComponent(b.dataset.text)); });
    });
  }

  /* ─── READING ────────────────────────────────────────── */
  function renderReadingArea(area) {
    if (passageState.open) { renderPassageView(area); return; }

    const ch = currentChapter('reading');
    if (!ch) {
      area.innerHTML=`<div style="text-align:center;padding:3rem;color:var(--fg-muted);">
        <div style="font-size:2.5rem;margin-bottom:1rem">📖</div>
        <p>No reading passage for this chapter yet.</p></div>`; return;
    }
    // Single passage per chapter — show info card then "Start Reading" button
    area.innerHTML = `
      <div style="padding:20px;max-width:680px;margin:0 auto;">
        <div class="nz-reading-card" style="border-radius:16px;border:1px solid var(--border);
             background:var(--card);padding:20px;margin-bottom:16px;">
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            <span class="nz-rc-level" style="padding:2px 8px;border-radius:6px;font-size:11px;
              font-weight:700;background:${COLORS[activeLevel]}22;color:${COLORS[activeLevel]};">
              ${esc(ch.level||activeLevel)}</span>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;
              background:var(--card-elevated);color:var(--fg-muted);">${esc(ch.difficulty||'')}</span>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;
              background:var(--card-elevated);color:var(--fg-muted);">${esc(ch.topic||'')}</span>
          </div>
          <h3 style="font-size:18px;font-weight:800;color:var(--fg);margin-bottom:8px;
                     font-family:'Noto Sans JP',sans-serif;">${esc(ch.title)}</h3>
          <p style="font-size:13px;color:var(--fg-muted);margin-bottom:16px;line-height:1.6;">
            ${esc(ch.passage?.[0]?.en||'')}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button id="nzcc-read-start"
              style="padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;
                     border:none;background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                     font-family:inherit;transition:opacity 0.15s;">
              📖 Start Reading →
            </button>
            ${(ch.quiz||[]).length?`<button id="nzcc-quiz-start"
              style="padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;
                     border:1px solid var(--border);background:var(--card-elevated);
                     color:var(--fg);cursor:pointer;font-family:inherit;transition:opacity 0.15s;">
              📝 Jump to Quiz
            </button>`:''}
          </div>
        </div>
        ${(ch.vocab||[]).length?`
          <div class="nz-vocab-section" style="border-radius:12px;border:1px solid var(--border);
               background:var(--card);padding:16px;">
            <h4 style="font-size:13px;font-weight:700;color:var(--fg-muted);margin-bottom:10px;">
              Key Vocabulary</h4>
            <div class="nz-vocab-chips" style="display:flex;flex-wrap:wrap;gap:8px;">
              ${(ch.vocab).map(v=>`
                <div class="nz-vocab-chip"
                  style="padding:5px 10px;border-radius:8px;background:var(--card-elevated);
                         border:1px solid var(--border);display:flex;align-items:center;gap:6px;">
                  <span style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg);">
                    ${esc(v.jp)}</span>
                  <span style="font-size:11px;color:var(--fg-muted);">${esc(v.en)}</span>
                  <button class="nzcc-vspk" data-jp="${esc(v.jp)}"
                    style="padding:3px;border:none;background:transparent;cursor:pointer;
                           color:var(--fg-muted);">${spk(11)}</button>
                </div>`).join('')}
            </div>
          </div>`:''}
      </div>`;

    document.getElementById('nzcc-read-start')?.addEventListener('click', ()=>{
      passageState.open=true; passageState.showTrans=false;
      quizState={ active:false, idx:0, score:0, answered:false };
      renderPassageView(area);
    });
    document.getElementById('nzcc-quiz-start')?.addEventListener('click', ()=>{
      passageState.open=true; quizState={ active:true, idx:0, score:0, answered:false };
      renderPassageView(area);
    });
    area.querySelectorAll('.nzcc-vspk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(b.dataset.jp);
    }));
  }

  function renderPassageView(area) {
    const ch = currentChapter('reading');
    if (!ch) return;

    if (quizState.active) { renderReadingQuiz(area, ch); return; }

    const lines = (ch.passage||[]).map((line,li)=>`
      <div class="nz-passage-line" id="nzcc-pl-${li}"
        style="padding:12px 0;border-bottom:1px solid var(--border,#1e1e1e);">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <div style="flex:1;">
            <div class="nz-line-jp"
              style="font-family:'Noto Sans JP',sans-serif;font-size:16px;color:var(--fg);
                     line-height:1.8;margin-bottom:2px;">${esc(line.jp)}</div>
            <div class="nz-line-en" id="nzcc-le-${li}"
              style="${passageState.showTrans?'':'display:none'};font-size:12px;
                     color:var(--fg-muted);margin-top:2px;">${esc(line.en)}</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;padding-top:2px;">
            <button class="nzcc-lspk" data-jp="${esc(line.jp)}"
              style="padding:5px;border-radius:8px;border:1px solid var(--border);
                     background:var(--card-elevated);cursor:pointer;color:var(--fg-muted);">
              ${spk(13)}
            </button>
            <button class="nzcc-ltoggle" data-li="${li}"
              style="padding:5px 8px;border-radius:8px;border:1px solid var(--border);
                     background:var(--card-elevated);cursor:pointer;color:var(--fg-muted);font-size:13px;">
              ${passageState.showTrans?'🙈':'👁'}
            </button>
          </div>
        </div>
      </div>`).join('');

    area.innerHTML = `
      <div class="nz-passage-wrap" style="padding:16px;max-width:720px;margin:0 auto;">
        <button id="nzcc-pass-back" class="nz-back-btn"
          style="margin-bottom:12px;padding:7px 14px;border-radius:8px;
                 border:1px solid var(--border);background:var(--card-elevated);
                 color:var(--fg-muted);cursor:pointer;font-size:12px;font-family:inherit;">
          ← Back to passage info
        </button>
        <div class="nz-reading-controls"
          style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <button id="nzcc-read-aloud"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;
                   border:1px solid var(--border);background:var(--card-elevated);
                   color:var(--fg);cursor:pointer;font-size:12px;font-family:inherit;">
            ${spk(14)} Read Aloud
          </button>
          <button id="nzcc-stop-aloud" style="display:none;padding:8px 14px;border-radius:10px;
            border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.1);
            color:#ef4444;cursor:pointer;font-size:12px;font-family:inherit;">
            ⏹ Stop
          </button>
          <div style="flex:1;"></div>
          <button id="nzcc-toggle-all"
            style="padding:8px 14px;border-radius:10px;border:1px solid var(--border);
                   background:var(--card-elevated);color:var(--fg-muted);cursor:pointer;
                   font-size:12px;font-family:inherit;">
            👁 ${passageState.showTrans?'Hide':'Show'} Translations
          </button>
        </div>
        <div id="nzcc-passage-body">${lines}</div>
        ${(ch.quiz||[]).length?`
          <button id="nzcc-to-quiz" class="nz-quiz-start-btn"
            style="display:block;width:100%;margin-top:20px;padding:12px;border-radius:12px;
                   border:none;background:linear-gradient(135deg,#e8446a,#c0304f);
                   color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">
            📝 Take Comprehension Quiz
          </button>`:''}
      </div>`;

    document.getElementById('nzcc-pass-back')?.addEventListener('click', ()=>{
      passageState.open=false; window.speechSynthesis?.cancel(); renderReadingArea(area);
    });
    document.getElementById('nzcc-to-quiz')?.addEventListener('click', ()=>{
      quizState={ active:true, idx:0, score:0, answered:false };
      renderReadingQuiz(area, ch);
    });
    document.getElementById('nzcc-toggle-all')?.addEventListener('click', ()=>{
      passageState.showTrans = !passageState.showTrans;
      area.querySelectorAll('[id^="nzcc-le-"]').forEach(el=>
        el.style.display = passageState.showTrans?'':'none');
      area.querySelectorAll('.nzcc-ltoggle').forEach(b=>
        b.textContent = passageState.showTrans?'🙈':'👁');
      const btn = document.getElementById('nzcc-toggle-all');
      if (btn) btn.textContent = `👁 ${passageState.showTrans?'Hide':'Show'} Translations`;
    });
    area.querySelectorAll('.nzcc-ltoggle').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const li  = btn.dataset.li;
        const el  = document.getElementById(`nzcc-le-${li}`);
        if (!el) return;
        const vis = el.style.display!=='none';
        el.style.display = vis?'none':'';
        btn.textContent  = vis?'👁':'🙈';
      });
    });
    area.querySelectorAll('.nzcc-lspk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(decodeURIComponent(b.dataset.jp));
    }));

    // Read aloud
    const raBtn   = document.getElementById('nzcc-read-aloud');
    const stopBtn = document.getElementById('nzcc-stop-aloud');
    raBtn?.addEventListener('click', ()=>{
      if (passageState.reading) return;
      passageState.reading=true;
      raBtn.style.display='none'; stopBtn.style.display='';
      const lines = ch.passage||[];
      let li=0;
      const next=()=>{
        if (!passageState.reading||li>=lines.length){
          passageState.reading=false;
          raBtn.style.display=''; stopBtn.style.display='none';
          area.querySelectorAll('.nz-passage-line.reading').forEach(e=>e.classList.remove('reading'));
          return;
        }
        area.querySelectorAll('.nz-passage-line.reading').forEach(e=>e.classList.remove('reading'));
        const el=document.getElementById(`nzcc-pl-${li}`);
        el?.classList.add('reading');
        el?.scrollIntoView({behavior:'smooth',block:'nearest'});
        const u=new SpeechSynthesisUtterance(lines[li].jp);
        u.lang='ja-JP'; u.rate=0.85;
        u.onend=()=>{ li++; setTimeout(next,900); };
        window.speechSynthesis?.cancel();
        window.speechSynthesis?.speak(u);
      };
      next();
    });
    stopBtn?.addEventListener('click', ()=>{
      passageState.reading=false;
      window.speechSynthesis?.cancel();
      raBtn.style.display=''; stopBtn.style.display='none';
      area.querySelectorAll('.nz-passage-line.reading').forEach(e=>e.classList.remove('reading'));
    });
  }

  function renderReadingQuiz(area, ch) {
    const qs = ch.quiz||[];
    if (quizState.idx >= qs.length) { renderQuizResult(area, qs.length, 'reading'); return; }
    const q = qs[quizState.idx];
    area.innerHTML = `
      <div class="nz-quiz-wrap" style="padding:24px;max-width:560px;margin:0 auto;">
        <div class="nz-quiz-progress"
          style="display:flex;justify-content:space-between;margin-bottom:16px;
                 font-size:12px;color:var(--fg-muted);">
          <span>Question ${quizState.idx+1} / ${qs.length}</span>
          <span class="nz-quiz-score">Score: ${quizState.score}</span>
        </div>
        <div class="nz-quiz-q"
          style="font-size:16px;font-weight:700;color:var(--fg);margin-bottom:16px;line-height:1.5;">
          ${esc(q.q)}</div>
        <div class="nz-quiz-opts" style="display:flex;flex-direction:column;gap:8px;">
          ${q.opts.map((o,i)=>`
            <button class="nz-quiz-opt nzcc-qopt" data-idx="${i}"
              style="padding:12px 16px;border-radius:10px;border:1px solid var(--border);
                     background:var(--card-elevated);color:var(--fg);text-align:left;
                     cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.15s;">
              ${esc(o)}
            </button>`).join('')}
        </div>
        <div id="nzcc-qfb" style="margin-top:12px;font-size:13px;font-weight:700;"></div>
      </div>`;
    area.querySelectorAll('.nzcc-qopt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if (quizState.answered) return;
        quizState.answered=true;
        const chosen=parseInt(btn.dataset.idx);
        const fb=document.getElementById('nzcc-qfb');
        if (chosen===q.ans){
          btn.style.background='rgba(34,197,94,0.15)'; btn.style.borderColor='#22c55e';
          quizState.score++;
          if (fb){ fb.textContent='✓ Correct!'; fb.style.color='#22c55e'; }
          speak('正解！','ja-JP',0.9);
        } else {
          btn.style.background='rgba(239,68,68,0.1)'; btn.style.borderColor='#ef4444';
          area.querySelectorAll('.nzcc-qopt')[q.ans].style.background='rgba(34,197,94,0.15)';
          area.querySelectorAll('.nzcc-qopt')[q.ans].style.borderColor='#22c55e';
          if (fb){ fb.textContent=`✗ Correct: ${esc(q.opts[q.ans])}`; fb.style.color='#ef4444'; }
        }
        setTimeout(()=>{
          quizState.idx++; quizState.answered=false;
          renderReadingQuiz(area, ch);
        }, 1400);
      });
    });
  }

  /* ─── LISTENING ──────────────────────────────────────── */
  function renderListeningArea(area) {
    if (dialogueState.open) { renderDialogueView(area); return; }

    const ch = currentChapter('listening');
    if (!ch) {
      area.innerHTML=`<div style="text-align:center;padding:3rem;color:var(--fg-muted);">
        <div style="font-size:2.5rem;margin-bottom:1rem">🎧</div>
        <p>No listening exercise for this chapter yet.</p></div>`; return;
    }
    area.innerHTML = `
      <div style="padding:20px;max-width:680px;margin:0 auto;">
        <div class="nz-listen-card" style="border-radius:16px;border:1px solid var(--border);
             background:var(--card);padding:20px;margin-bottom:16px;">
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;
              background:${COLORS[activeLevel]}22;color:${COLORS[activeLevel]};">
              ${esc(ch.level||activeLevel)}</span>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;
              background:var(--card-elevated);color:var(--fg-muted);">
              🎙️ ${(ch.script||[]).length} lines</span>
          </div>
          <h3 style="font-size:18px;font-weight:800;color:var(--fg);margin-bottom:6px;
                     font-family:'Noto Sans JP',sans-serif;">${esc(ch.title)}</h3>
          <p style="font-size:13px;color:var(--fg-muted);margin-bottom:16px;">
            ${esc(ch.script?.[0]?.en||'')}</p>
          <button id="nzcc-dial-start"
            style="padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;
                   border:none;background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                   font-family:inherit;">
            🎧 Start Listening →
          </button>
        </div>
        ${(ch.key_phrases||[]).length?`
          <div style="border-radius:12px;border:1px solid var(--border);
               background:var(--card);padding:16px;">
            <h4 style="font-size:13px;font-weight:700;color:var(--fg-muted);margin-bottom:10px;">
              Key Phrases</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${(ch.key_phrases).map(p=>`
                <div style="padding:5px 10px;border-radius:8px;background:var(--card-elevated);
                            border:1px solid var(--border);display:flex;align-items:center;gap:6px;">
                  <span style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg);">
                    ${esc(p.jp)}</span>
                  <span style="font-size:11px;color:var(--fg-muted);">${esc(p.en)}</span>
                  <button class="nzcc-pkspk" data-jp="${esc(p.jp)}"
                    style="padding:3px;border:none;background:transparent;cursor:pointer;
                           color:var(--fg-muted);">${spk(11)}</button>
                </div>`).join('')}
            </div>
          </div>`:''}
      </div>`;

    document.getElementById('nzcc-dial-start')?.addEventListener('click', ()=>{
      dialogueState.open=true; dialogueState.scriptVisible=false;
      quizState={ active:false, idx:0, score:0, answered:false };
      renderDialogueView(area);
    });
    area.querySelectorAll('.nzcc-pkspk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(b.dataset.jp);
    }));
  }

  function renderDialogueView(area) {
    const ch = currentChapter('listening');
    if (!ch) return;
    if (quizState.active) { renderListeningQuiz(area, ch); return; }

    const scriptHTML = (ch.script||[]).map(line=>`
      <div class="nz-script-line"
        style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border,#1e1e1e);">
        <span class="nz-script-speaker"
          style="min-width:70px;font-size:11px;font-weight:700;padding:2px 8px;
                 border-radius:6px;background:var(--card-elevated);color:var(--fg-muted);
                 height:fit-content;margin-top:3px;white-space:nowrap;">${esc(line.speaker)}</span>
        <div class="nz-script-text" style="flex:1;">
          <div class="nz-script-jp"
            style="font-family:'Noto Sans JP',sans-serif;font-size:15px;
                   color:var(--fg);margin-bottom:3px;">${esc(line.jp)}</div>
          <div class="nz-script-en"
            style="font-size:12px;color:var(--fg-muted);">${esc(line.en)}</div>
        </div>
        <button class="nzcc-sline-spk" data-jp="${esc(line.jp)}"
          style="padding:5px;border:1px solid var(--border);border-radius:8px;
                 background:var(--card-elevated);cursor:pointer;color:var(--fg-muted);flex-shrink:0;
                 align-self:flex-start;">${spk(12)}</button>
      </div>`).join('');

    area.innerHTML = `
      <div class="nz-listen-wrap" style="padding:16px;max-width:720px;margin:0 auto;">
        <button id="nzcc-dial-back"
          style="margin-bottom:12px;padding:7px 14px;border-radius:8px;
                 border:1px solid var(--border);background:var(--card-elevated);
                 color:var(--fg-muted);cursor:pointer;font-size:12px;font-family:inherit;">
          ← Back to dialogue info
        </button>

        <!-- Audio player (ready for real .mp3 files) -->
        <div class="nz-audio-player"
          style="display:flex;align-items:center;gap:12px;padding:14px;
                 border-radius:14px;border:1px solid var(--border);
                 background:var(--card);margin-bottom:16px;flex-wrap:wrap;">
          <div style="font-size:24px;">🎵</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:700;color:var(--fg);">${esc(ch.title)}</div>
            <div style="font-size:11px;color:var(--fg-muted);">
              Japanese Conversation • ${esc(ch.level||activeLevel)}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="nzcc-audio-play"
              style="padding:8px 16px;border-radius:10px;border:none;
                     background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                     font-family:inherit;font-size:13px;font-weight:700;">▶ Play</button>
            <button id="nzcc-audio-replay"
              style="padding:8px 14px;border-radius:10px;border:1px solid var(--border);
                     background:var(--card-elevated);color:var(--fg);cursor:pointer;
                     font-family:inherit;font-size:13px;">↺</button>
          </div>
          <audio id="nzcc-audio-el" src="${esc(ch.audio||'')}" preload="none"></audio>
          <div id="nzcc-audio-note"
            style="width:100%;font-size:11px;color:var(--fg-muted);margin-top:4px;">
            🎧 ${esc(ch.audio||'')}</div>
        </div>

        <!-- TTS read-all button -->
        <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <button id="nzcc-tts-dial"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;
                   border-radius:10px;border:1px solid var(--border);
                   background:var(--card-elevated);color:var(--fg);cursor:pointer;
                   font-size:12px;font-family:inherit;">
            ${spk(13)} Read Dialogue (TTS)
          </button>
        </div>

        <!-- Script toggle -->
        <button id="nzcc-script-toggle" class="nz-script-toggle"
          style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);
                 background:var(--card-elevated);color:var(--fg-muted);cursor:pointer;
                 font-size:13px;font-family:inherit;margin-bottom:8px;">
          👁️ ${dialogueState.scriptVisible?'Hide':'Show'} Script
        </button>
        <div id="nzcc-script-wrap" class="nz-script-wrap"
          style="${dialogueState.scriptVisible?'':'display:none;'}padding:0 0 12px;">
          ${scriptHTML}
        </div>

        ${(ch.questions||[]).length?`
          <button id="nzcc-lquiz-start"
            style="display:block;width:100%;margin-top:16px;padding:12px;border-radius:12px;
                   border:none;background:linear-gradient(135deg,#e8446a,#c0304f);
                   color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">
            📝 Take Comprehension Quiz
          </button>`:''}
      </div>`;

    document.getElementById('nzcc-dial-back')?.addEventListener('click', ()=>{
      dialogueState.open=false; window.speechSynthesis?.cancel();
      const audioEl=document.getElementById('nzcc-audio-el');
      if (audioEl) audioEl.pause();
      renderListeningArea(area);
    });

    // Real audio playback
    const audioEl = document.getElementById('nzcc-audio-el');
    document.getElementById('nzcc-audio-play')?.addEventListener('click', ()=>{
      if (!audioEl) return;
      if (audioEl.paused){
        audioEl.play().catch(()=>{
          const note=document.getElementById('nzcc-audio-note');
          if (note){ note.textContent='⚠️ Audio file not found. Add .mp3 to audio/ folder.'; note.style.color='#eab308'; }
        });
        document.getElementById('nzcc-audio-play').textContent='⏸ Pause';
      } else {
        audioEl.pause();
        document.getElementById('nzcc-audio-play').textContent='▶ Play';
      }
    });
    audioEl?.addEventListener('ended', ()=>{
      const pb=document.getElementById('nzcc-audio-play');
      if (pb) pb.textContent='▶ Play';
    });
    document.getElementById('nzcc-audio-replay')?.addEventListener('click', ()=>{
      if (!audioEl) return;
      audioEl.currentTime=0; audioEl.play().catch(()=>{});
      document.getElementById('nzcc-audio-play').textContent='⏸ Pause';
    });

    // TTS read dialogue
    document.getElementById('nzcc-tts-dial')?.addEventListener('click', ()=>{
      const lines=ch.script||[]; let i=0;
      const next=()=>{
        if (i>=lines.length) return;
        const u=new SpeechSynthesisUtterance(lines[i].jp);
        u.lang='ja-JP'; u.rate=0.85;
        u.onend=()=>{ i++; setTimeout(next, 800); };
        window.speechSynthesis?.cancel();
        window.speechSynthesis?.speak(u);
      };
      next();
    });

    // Script toggle
    document.getElementById('nzcc-script-toggle')?.addEventListener('click', ()=>{
      dialogueState.scriptVisible=!dialogueState.scriptVisible;
      const wrap=document.getElementById('nzcc-script-wrap');
      const btn=document.getElementById('nzcc-script-toggle');
      if (wrap) wrap.style.display=dialogueState.scriptVisible?'':'none';
      if (btn) btn.textContent=`${dialogueState.scriptVisible?'🙈 Hide':'👁️ Show'} Script`;
    });

    area.querySelectorAll('.nzcc-sline-spk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(decodeURIComponent(b.dataset.jp));
    }));

    document.getElementById('nzcc-lquiz-start')?.addEventListener('click', ()=>{
      quizState={ active:true, idx:0, score:0, answered:false };
      renderListeningQuiz(area, ch);
    });
  }

  function renderListeningQuiz(area, ch) {
    const qs=ch.questions||[];
    if (quizState.idx>=qs.length){ renderQuizResult(area, qs.length,'listening'); return; }
    const q=qs[quizState.idx];
    area.innerHTML=`
      <div class="nz-quiz-wrap" style="padding:24px;max-width:560px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;
                    font-size:12px;color:var(--fg-muted);">
          <span>Question ${quizState.idx+1} / ${qs.length}</span>
          <span>Score: ${quizState.score}</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--fg);
                    margin-bottom:16px;line-height:1.5;">${esc(q.q)}</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${q.opts.map((o,i)=>`
            <button class="nz-quiz-opt nzcc-lqopt" data-idx="${i}"
              style="padding:12px 16px;border-radius:10px;border:1px solid var(--border);
                     background:var(--card-elevated);color:var(--fg);text-align:left;
                     cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.15s;">
              ${esc(o)}
            </button>`).join('')}
        </div>
        <div id="nzcc-lfb" style="margin-top:12px;font-size:13px;font-weight:700;"></div>
      </div>`;
    area.querySelectorAll('.nzcc-lqopt').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if (quizState.answered) return;
        quizState.answered=true;
        const chosen=parseInt(btn.dataset.idx);
        const fb=document.getElementById('nzcc-lfb');
        if (chosen===q.ans){
          btn.style.background='rgba(34,197,94,0.15)'; btn.style.borderColor='#22c55e';
          quizState.score++;
          if (fb){ fb.textContent='✓ Correct!'; fb.style.color='#22c55e'; }
        } else {
          btn.style.background='rgba(239,68,68,0.1)'; btn.style.borderColor='#ef4444';
          area.querySelectorAll('.nzcc-lqopt')[q.ans].style.background='rgba(34,197,94,0.15)';
          area.querySelectorAll('.nzcc-lqopt')[q.ans].style.borderColor='#22c55e';
          if (fb){ fb.textContent=`✗ Correct: ${esc(q.opts[q.ans])}`; fb.style.color='#ef4444'; }
        }
        setTimeout(()=>{ quizState.idx++; quizState.answered=false; renderListeningQuiz(area,ch); },1400);
      });
    });
  }

  /* ─── SHARED QUIZ RESULT ─────────────────────────────── */
  function renderQuizResult(area, total, type) {
    const pct=Math.round(quizState.score/total*100);
    const msg=pct===100?'🏆 Perfect! 完璧!':pct>=70?'⭐ Well done!':'📚 Keep studying!';
    area.innerHTML=`
      <div class="nz-result-wrap"
        style="text-align:center;padding:40px 20px;max-width:420px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:12px;">${pct>=70?'🎉':'📖'}</div>
        <h2 style="font-size:22px;font-weight:800;color:var(--fg);margin-bottom:12px;">${msg}</h2>
        <div style="font-size:40px;font-weight:800;color:var(--primary,#e8446a);margin-bottom:4px;">
          ${quizState.score} / ${total}</div>
        <div style="font-size:14px;color:var(--fg-muted);margin-bottom:24px;">${pct}% accuracy</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button id="nzcc-retry"
            style="padding:10px 20px;border-radius:10px;border:1px solid var(--border);
                   background:var(--card-elevated);color:var(--fg);cursor:pointer;
                   font-size:13px;font-weight:700;font-family:inherit;">
            ↺ Try Again
          </button>
          <button id="nzcc-back-to-content"
            style="padding:10px 20px;border-radius:10px;border:none;
                   background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                   font-size:13px;font-weight:700;font-family:inherit;">
            ← Back
          </button>
        </div>
      </div>`;
    document.getElementById('nzcc-retry')?.addEventListener('click',()=>{
      quizState={ active:true, idx:0, score:0, answered:false };
      renderMainArea();
    });
    document.getElementById('nzcc-back-to-content')?.addEventListener('click',()=>{
      quizState={ active:false, idx:0, score:0, answered:false };
      if (type==='reading')   passageState.open=true;
      if (type==='listening') dialogueState.open=true;
      renderMainArea();
    });
  }

  /* ═══════════════════════════════════════════════════════
     LEVEL TAB OVERRIDE
     Syncs level changes across all four data sources
     ═══════════════════════════════════════════════════════ */
  function patchLevelTabs() {
    const wrap = document.getElementById('nzcv-level-tabs');
    if (!wrap) return;
    wrap.querySelectorAll('button[data-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLevel   = btn.dataset.level;
        activeChapter = 0;
        quizState     = { active:false, idx:0, score:0, answered:false };
        passageState  = { open:false, passageIdx:0, showTrans:false, reading:false };
        dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
        syncSidebar();
        renderChapterHeader();
        renderMainArea();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     OPEN HOOK
     Called after NZChapterVocab.open() builds the modal DOM
     ═══════════════════════════════════════════════════════ */
  function onModalOpen() {
    ensureTabBar();
    // Give the vocab overlay a tick to finish its DOM setup
    setTimeout(() => {
      patchLevelTabs();
      // Mirror whatever level NZChapterVocab has active
      syncSidebar();
      renderChapterHeader();
      renderMainArea();
      renderTabBar();
    }, 50);
  }

  /* ═══════════════════════════════════════════════════════
     INJECT BUTTON — wraps NZChapterVocab.open()
     ═══════════════════════════════════════════════════════ */
  function injectButton() {
    const tryInject = () => {
      // Ensure NZChapterVocab is loaded
      if (!window.NZChapterVocab) { setTimeout(tryInject, 200); return; }

      // Look for the button container area in the vocab page
      // Support two common patterns: id="bv-open-btn" or class containing vocab
      const marker = document.getElementById('bv-open-btn') ||
                     document.querySelector('[id*="vocab"][id*="btn"]') ||
                     document.querySelector('.nz-vocab-header-btn');

      if (document.getElementById('nzcc-open-btn')) return; // already injected

      const btn = document.createElement('button');
      btn.id = 'nzcc-open-btn';
      btn.style.cssText =
        'background:linear-gradient(135deg,#e8446a,#c0304f);color:#fff;border:none;' +
        'padding:8px 18px;border-radius:10px;font-size:13px;font-weight:700;' +
        'cursor:pointer;font-family:inherit;transition:opacity 0.15s,transform 0.15s;' +
        'letter-spacing:0.3px;margin-right:8px;';
      btn.textContent = '📖 Chapters';
      btn.addEventListener('click', () => {
        window.NZChapterVocab.open();
        // Hook into the modal after it renders
        const waitForModal = setInterval(() => {
          if (document.getElementById('nzcv-overlay')?.classList.contains('open')) {
            clearInterval(waitForModal);
            onModalOpen();
          }
        }, 60);
      });

      if (marker) {
        marker.parentNode.insertBefore(btn, marker);
      } else {
        // Fallback: append to the vocab section header if it exists
        const vocabSection = document.querySelector('#vocab-section, .nz-vocab-section-wrap, [id*="vocab"]');
        if (vocabSection) vocabSection.prepend(btn);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryInject);
    } else {
      tryInject();
    }
  }

  /* ═══════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════ */
  return { injectButton, onModalOpen };

})();

window.NZChapterController = NZChapterController;
NZChapterController.injectButton();

// ============================================================
// Source: nz-chapter-listening.js
// ============================================================
'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/nz-chapter-listening.js
// NihongoZen — Chapter-Wise Listening Dialogues
//
// Structure per dialogue:
//   { ch, title, topic, level, script[], key_phrases[], questions[] }
//   script[]:    { speaker, jp, en }
//   key_phrases[]: { jp, en }
//   questions[]:  { q, opts[], ans }
//
// Audio file paths follow the pattern:  audio/listening/{level}/ch{ch:02d}.mp3
// ═══════════════════════════════════════════════════════════════════════════════

const NZChapterListening = {

  /* ════════════════════════════════════════════════════════
     N5 — Minna no Nihongo I
     ════════════════════════════════════════════════════════ */
  N5: [
    {
      ch: 1, title: 'はじめまして', level: 'N5',
      topic: 'First Meeting',
      audio: 'audio/listening/n5/ch01.mp3',
      script: [
        { speaker: 'マリア', jp: 'はじめまして。わたしはマリアです。', en: 'Nice to meet you. I am Maria.' },
        { speaker: 'マリア', jp: 'ブラジルからきました。', en: 'I came from Brazil.' },
        { speaker: 'マリア', jp: 'どうぞよろしくおねがいします。', en: 'Pleased to meet you.' },
        { speaker: 'やまだ', jp: 'はじめまして。やまだです。', en: 'Nice to meet you too. I am Yamada.' },
        { speaker: 'やまだ', jp: 'こちらこそよろしくおねがいします。', en: 'Pleased to meet you too.' },
        { speaker: 'やまだ', jp: 'おしごとはなんですか。', en: 'What is your job?' },
        { speaker: 'マリア', jp: 'IMCのエンジニアです。', en: 'I am an engineer at IMC.' }
      ],
      key_phrases: [
        { jp: 'はじめまして', en: 'Nice to meet you (first meeting)' },
        { jp: 'どうぞよろしくおねがいします', en: 'Pleased to meet you' },
        { jp: 'こちらこそ', en: 'Likewise / The pleasure is mine' }
      ],
      questions: [
        { q: 'Where is Maria from?', opts: ['Mexico', 'Brazil', 'Spain', 'Argentina'], ans: 1 },
        { q: 'What is Maria\'s job?', opts: ['Doctor', 'Teacher', 'Engineer', 'Researcher'], ans: 2 },
        { q: 'Which company does Maria work for?', opts: ['ABC', 'IMC', 'XYZ', 'NHK'], ans: 1 }
      ]
    },
    {
      ch: 3, title: 'ちかくにコンビニがありますか', level: 'N5',
      topic: 'Asking for Directions',
      audio: 'audio/listening/n5/ch03.mp3',
      script: [
        { speaker: 'カリナ', jp: 'すみません。ちかくにコンビニはありますか。', en: 'Excuse me. Is there a convenience store nearby?' },
        { speaker: 'つうこうにん', jp: 'ええ、あそこのかどをみぎにまがると、すぐありますよ。', en: 'Yes, if you turn right at that corner, it\'s right there.' },
        { speaker: 'カリナ', jp: 'ありがとうございます。あるいて、なんぷんぐらいかかりますか。', en: 'Thank you. About how many minutes does it take on foot?' },
        { speaker: 'つうこうにん', jp: 'そうですね…3ふんくらいですよ。', en: 'Let me think... about 3 minutes.' },
        { speaker: 'カリナ', jp: 'そうですか。ありがとうございます。', en: 'I see. Thank you very much.' }
      ],
      key_phrases: [
        { jp: 'みぎにまがる', en: 'turn right' },
        { jp: 'あるいて', en: 'on foot / walking' },
        { jp: '〜ふんくらい', en: 'about ~ minutes' }
      ],
      questions: [
        { q: 'What is Karina looking for?', opts: ['A pharmacy', 'A post office', 'A convenience store', 'A bank'], ans: 2 },
        { q: 'Which direction should she turn?', opts: ['Left', 'Right', 'Straight ahead', 'Back'], ans: 1 },
        { q: 'How long does it take on foot?', opts: ['1 minute', '3 minutes', '5 minutes', '10 minutes'], ans: 1 }
      ]
    },
    {
      ch: 6, title: 'まいにちのせいかつ', level: 'N5',
      topic: 'Daily Routine Conversation',
      audio: 'audio/listening/n5/ch06.mp3',
      script: [
        { speaker: 'ワン', jp: 'やまださん、まいにちなんじにおきますか。', en: 'Mr Yamada, what time do you get up every day?' },
        { speaker: 'やまだ', jp: '6じにおきます。ワンさんは？', en: 'I get up at 6. What about you, Wang?' },
        { speaker: 'ワン', jp: 'わたしは7じごろです。おそいですね。', en: 'I\'m around 7. That\'s late, isn\'t it.' },
        { speaker: 'やまだ', jp: 'なんじにかいしゃへいきますか。', en: 'What time do you go to work?' },
        { speaker: 'ワン', jp: '8じはんのでんしゃにのります。やまださんは？', en: 'I take the 8:30 train. And you, Mr Yamada?' },
        { speaker: 'やまだ', jp: 'わたしはあるいていきます。じゅっぷんですよ。', en: 'I walk. It\'s 10 minutes.' },
        { speaker: 'ワン', jp: 'いいですね！かいしゃはとおいですか。', en: 'That\'s nice! Is the company far?' }
      ],
      key_phrases: [
        { jp: 'なんじにおきますか', en: 'What time do you get up?' },
        { jp: 'でんしゃにのります', en: 'take the train' },
        { jp: 'あるいていきます', en: 'go on foot / walk there' }
      ],
      questions: [
        { q: 'What time does Yamada get up?', opts: ['5:00', '6:00', '7:00', '8:00'], ans: 1 },
        { q: 'How does Yamada go to work?', opts: ['By bus', 'By car', 'By train', 'On foot'], ans: 3 },
        { q: 'How long does Yamada\'s commute take?', opts: ['5 minutes', '10 minutes', '20 minutes', '30 minutes'], ans: 1 }
      ]
    },
    {
      ch: 10, title: 'どんなスポーツがすきですか', level: 'N5',
      topic: 'Likes and Preferences',
      audio: 'audio/listening/n5/ch10.mp3',
      script: [
        { speaker: 'さくら', jp: 'サントスさんは、どんなスポーツがすきですか。', en: 'Santos, what kind of sports do you like?' },
        { speaker: 'サントス', jp: 'サッカーがだいすきです。ブラジルではみんなサッカーをします。', en: 'I love football. In Brazil everyone plays football.' },
        { speaker: 'さくら', jp: 'そうですか。じょうずですか。', en: 'Is that so? Are you good at it?' },
        { speaker: 'サントス', jp: 'ええ、すこしじょうずです。さくらさんはどうですか。', en: 'Yes, a little. What about you, Sakura?' },
        { speaker: 'さくら', jp: 'わたしはスポーツがあまりすきじゃないです。', en: 'I don\'t really like sports much.' },
        { speaker: 'さくら', jp: 'おんがくのほうがすきです。', en: 'I prefer music.' },
        { speaker: 'サントス', jp: 'そうですか。どんなおんがくですか。', en: 'Is that so? What kind of music?' }
      ],
      key_phrases: [
        { jp: 'だいすきです', en: 'love / really like' },
        { jp: 'あまりすきじゃない', en: 'don\'t really like' },
        { jp: '〜のほうがすき', en: 'prefer ~' }
      ],
      questions: [
        { q: 'What sport does Santos love?', opts: ['Baseball', 'Tennis', 'Football', 'Swimming'], ans: 2 },
        { q: 'Is Santos good at football?', opts: ['No, not at all', 'A little', 'Very good', 'Never played'], ans: 1 },
        { q: 'What does Sakura prefer to sports?', opts: ['Reading', 'Cooking', 'Music', 'Art'], ans: 2 }
      ]
    },
    {
      ch: 15, title: 'プレゼントをえらぶ', level: 'N5',
      topic: 'Choosing a Gift',
      audio: 'audio/listening/n5/ch15.mp3',
      script: [
        { speaker: 'ミラー', jp: 'やまださんのたんじょうびに、なにをあげようかな。', en: 'I wonder what to give Mr Yamada for his birthday.' },
        { speaker: 'さくら', jp: 'やまださんはなにがすきですか。', en: 'What does Mr Yamada like?' },
        { speaker: 'ミラー', jp: 'おちゃがすきですよ。', en: 'He likes tea.' },
        { speaker: 'さくら', jp: 'じゃあ、おいしいおちゃはどうですか。', en: 'Then how about some delicious tea?' },
        { speaker: 'ミラー', jp: 'いいですね！でも、どこでかいますか。', en: 'That\'s good! But where do we buy it?' },
        { speaker: 'さくら', jp: 'えきのちかくにいいおみせがありますよ。', en: 'There\'s a nice shop near the station.' },
        { speaker: 'ミラー', jp: 'そうですか。いっしょにいってくれますか。', en: 'Really? Will you come with me?' }
      ],
      key_phrases: [
        { jp: 'たんじょうびに', en: 'for (someone\'s) birthday' },
        { jp: 'なにをあげようかな', en: 'I wonder what to give' },
        { jp: '〜はどうですか', en: 'How about ~?' }
      ],
      questions: [
        { q: 'Whose birthday is it?', opts: ['Miller\'s', 'Sakura\'s', 'Yamada\'s', 'Wang\'s'], ans: 2 },
        { q: 'What does Yamada like?', opts: ['Coffee', 'Tea', 'Cake', 'Wine'], ans: 1 },
        { q: 'Where is the shop?', opts: ['At the station', 'Near the station', 'In the park', 'At school'], ans: 1 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N4 — Minna no Nihongo II
     ════════════════════════════════════════════════════════ */
  N4: [
    {
      ch: 1, chBook: 26, title: 'にほんごのれんしゅう', level: 'N4',
      topic: 'Discussing Language Learning',
      audio: 'audio/listening/n4/ch01.mp3',
      script: [
        { speaker: 'カルロス', jp: 'にほんごがうまくなりたいけど、なかなかじょうずにならないですね。', en: 'I want to get better at Japanese, but it\'s hard to improve, isn\'t it.' },
        { speaker: 'さくら', jp: 'どんな勉強をしていますか。', en: 'What kind of studying are you doing?' },
        { speaker: 'カルロス', jp: 'まいにちきょうかしょをよんでいます。', en: 'I read the textbook every day.' },
        { speaker: 'さくら', jp: 'それだけじゃ足りないかもしれませんよ。日本語で話すれんしゅうをしたほうがいいです。', en: 'That alone might not be enough. It\'s better to practise speaking Japanese.' },
        { speaker: 'カルロス', jp: 'そうですね。にほんじんのともだちをつくれたらいいんですが。', en: 'That\'s right. I wish I could make Japanese friends.' },
        { speaker: 'さくら', jp: 'じゃあ、らいしゅうのかいわクラスにきてみませんか。', en: 'Then why don\'t you come try our conversation class next week?' }
      ],
      key_phrases: [
        { jp: 'なかなか〜ない', en: 'can\'t easily ~ / ~ is hard to do' },
        { jp: '〜したほうがいい', en: 'it\'s better to ~' },
        { jp: '〜れたらいいんですが', en: 'I wish I could ~' }
      ],
      questions: [
        { q: 'What does Carlos do every day to study?', opts: ['Watch dramas', 'Read the textbook', 'Write letters', 'Listen to music'], ans: 1 },
        { q: 'What does Sakura suggest?', opts: ['Study more grammar', 'Practise speaking Japanese', 'Go to Japan', 'Get a tutor'], ans: 1 },
        { q: 'What does Sakura invite Carlos to?', opts: ['A dinner party', 'A writing class', 'A conversation class', 'A karaoke night'], ans: 2 }
      ]
    },
    {
      ch: 5, chBook: 30, title: 'じどうしゃじこにあいました', level: 'N4',
      topic: 'Describing a Car Accident (Passive)',
      audio: 'audio/listening/n4/ch05.mp3',
      script: [
        { speaker: 'きむら', jp: 'きのうじどうしゃじこにあいました。', en: 'I was in a car accident yesterday.' },
        { speaker: 'なかむら', jp: 'えっ！だいじょうぶですか。', en: 'What! Are you all right?' },
        { speaker: 'きむら', jp: 'はい、けがはしませんでした。でも、くるまがこわされてしまいました。', en: 'Yes, I wasn\'t hurt. But my car was damaged.' },
        { speaker: 'なかむら', jp: 'それはたいへんでしたね。だれにぶつけられたんですか。', en: 'That must have been terrible. Who hit you?' },
        { speaker: 'きむら', jp: 'うしろから、ほかのくるまにぶつけられました。', en: 'I was hit from behind by another car.' },
        { speaker: 'なかむら', jp: 'けいさつにとどけましたか。', en: 'Did you report it to the police?' },
        { speaker: 'きむら', jp: 'はい、もちろん。ほけんがいしゃにもれんらくしました。', en: 'Yes, of course. I also contacted my insurance company.' }
      ],
      key_phrases: [
        { jp: 'じどうしゃじこにあう', en: 'be involved in a car accident' },
        { jp: 'ぶつけられる', en: 'be hit (passive)' },
        { jp: 'とどける', en: 'report / deliver' }
      ],
      questions: [
        { q: 'Was Kimura hurt in the accident?', opts: ['Yes, seriously', 'Yes, slightly', 'No', 'Unknown'], ans: 2 },
        { q: 'How was Kimura hit?', opts: ['From the front', 'From the side', 'From behind', 'From above'], ans: 2 },
        { q: 'Who did Kimura contact besides the police?', opts: ['The hospital', 'The insurance company', 'The city hall', 'A lawyer'], ans: 1 }
      ]
    },
    {
      ch: 9, chBook: 34, title: 'おいしゃさんへのそうだん', level: 'N4',
      topic: 'Consulting a Doctor',
      audio: 'audio/listening/n4/ch09.mp3',
      script: [
        { speaker: 'かんじゃ', jp: 'さいきん、あたまがよくいたいんです。', en: 'I have been getting frequent headaches lately.' },
        { speaker: 'いしゃ', jp: 'いつごろからですか。', en: 'Since when?' },
        { speaker: 'かんじゃ', jp: '1かげつくらいまえからです。まいにちではないですが、しゅうに2、3かいくらいです。', en: 'From about a month ago. Not every day, but about 2 or 3 times a week.' },
        { speaker: 'いしゃ', jp: 'ねむれていますか。', en: 'Are you sleeping well?' },
        { speaker: 'かんじゃ', jp: 'あまりよくねむれていないです。ストレスもおおいと思います。', en: 'I\'m not sleeping well. I think I also have a lot of stress.' },
        { speaker: 'いしゃ', jp: 'そうですか。いちどけんさをしましょう。それから、できるだけやすむようにしてください。', en: 'I see. Let\'s do some tests once. And after that, please try to rest as much as possible.' }
      ],
      key_phrases: [
        { jp: 'あたまがいたい', en: 'headache' },
        { jp: 'ねむれていない', en: 'not sleeping well' },
        { jp: 'できるだけ', en: 'as much as possible' }
      ],
      questions: [
        { q: 'What symptom does the patient have?', opts: ['Stomachache', 'Headache', 'Backache', 'Sore throat'], ans: 1 },
        { q: 'How often do the headaches occur?', opts: ['Every day', '2-3 times a week', 'Once a week', 'Rarely'], ans: 1 },
        { q: 'What does the doctor recommend?', opts: ['Take medicine and rest', 'Do tests and rest more', 'Change diet', 'Stop working'], ans: 1 }
      ]
    },
    {
      ch: 14, chBook: 39, title: 'りょこうのけいかく', level: 'N4',
      topic: 'Planning a Trip',
      audio: 'audio/listening/n4/ch14.mp3',
      script: [
        { speaker: 'はな', jp: 'ゴールデンウィークにどこかへいくつもりですか。', en: 'Do you intend to go somewhere during Golden Week?' },
        { speaker: 'けん', jp: 'ええ、おきなわへいこうとおもっているんだけど、まだひこうきのよやくをしていないんです。', en: 'Yes, I\'m thinking of going to Okinawa, but I haven\'t booked the flight yet.' },
        { speaker: 'はな', jp: 'はやくしたほうがいいですよ。ゴールデンウィークはひこうきがすぐうれてしまうので。', en: 'You should do it quickly. During Golden Week, flights sell out quickly.' },
        { speaker: 'けん', jp: 'そうですね。きょうのよるやってみます。', en: 'You\'re right. I\'ll try it tonight.' },
        { speaker: 'はな', jp: 'おきなわはどのくらいいくつもりですか。', en: 'How long do you intend to stay in Okinawa?' },
        { speaker: 'けん', jp: '4はくいつかかな、と思っています。', en: 'I\'m thinking of 4 nights and 5 days.' }
      ],
      key_phrases: [
        { jp: '〜つもりです', en: 'intend to ~' },
        { jp: 'よやくをする', en: 'make a reservation' },
        { jp: '〜はく〜か', en: '~ nights ~ days' }
      ],
      questions: [
        { q: 'When does Ken plan to travel?', opts: ['New Year\'s', 'Golden Week', 'Summer', 'Autumn'], ans: 1 },
        { q: 'Where does Ken want to go?', opts: ['Hokkaido', 'Kyoto', 'Okinawa', 'Tokyo'], ans: 2 },
        { q: 'How long does Ken plan to stay?', opts: ['3 nights 4 days', '4 nights 5 days', '5 nights 6 days', '1 week'], ans: 1 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N3 — Minna no Nihongo Chukyu
     ════════════════════════════════════════════════════════ */
  N3: [
    {
      ch: 1, title: 'まちのへんか', level: 'N3',
      topic: 'Changes in the Town',
      audio: 'audio/listening/n3/ch01.mp3',
      script: [
        { speaker: 'たなか', jp: 'このへん、ずいぶんかわりましたね。', en: 'This area has changed quite a bit, hasn\'t it.' },
        { speaker: 'やまぐち', jp: 'そうですね。10年前とくらべると、全然ちがいます。', en: 'That\'s right. Compared to 10 years ago, it\'s completely different.' },
        { speaker: 'たなか', jp: 'えきのちかくにあったふるいおみせが、いつのまにかなくなってしまいましたね。', en: 'The old shops that used to be near the station have disappeared before I knew it.' },
        { speaker: 'やまぐち', jp: 'かわりに、おおきなマンションがたちました。べんりになった反面、ちょっとさびしい気もします。', en: 'In their place, large apartment buildings have been built. On the one hand it\'s become convenient, but I also feel a little lonely.' },
        { speaker: 'たなか', jp: 'わかります。でも、じだいのながれだから、しかたないですよね。', en: 'I understand. But it\'s the flow of the times, so there\'s nothing to be done.' }
      ],
      key_phrases: [
        { jp: 'くらべると', en: 'compared to' },
        { jp: 'いつのまにか', en: 'before one knows it' },
        { jp: '反面', en: 'on the other hand' }
      ],
      questions: [
        { q: 'How many years ago is Yamaguchi comparing to?', opts: ['5 years', '10 years', '20 years', '30 years'], ans: 1 },
        { q: 'What replaced the old shops near the station?', opts: ['Parks', 'Supermarkets', 'Large apartment buildings', 'Offices'], ans: 2 },
        { q: 'How does Yamaguchi feel about the changes?', opts: ['Very happy', 'Purely sad', 'Mixed — convenient but a little lonely', 'Angry'], ans: 2 }
      ]
    },
    {
      ch: 6, title: 'かいしゃでのそうだん', level: 'N3',
      topic: 'Workplace Consultation',
      audio: 'audio/listening/n3/ch06.mp3',
      script: [
        { speaker: 'おかもと', jp: 'かちょう、ちょっとおねがいがあるんですが。', en: 'Manager, I have a small request.' },
        { speaker: 'かちょう', jp: 'なんですか。', en: 'What is it?' },
        { speaker: 'おかもと', jp: 'らいしゅうのすいようびに、ちょうしをみてもらいたいんです。', en: 'I\'d like to have my condition checked next Wednesday.' },
        { speaker: 'かちょう', jp: 'はんにちやすめばいいですか。', en: 'Would half a day off be enough?' },
        { speaker: 'おかもと', jp: 'はい、ごごいっぱいあればじゅうぶんだとおもいます。', en: 'Yes, I think having the whole afternoon will be sufficient.' },
        { speaker: 'かちょう', jp: 'わかりました。かいぎがあるのでごぜんはでてきてくれると助かります。', en: 'Understood. There is a meeting so it would help if you could come in the morning.' },
        { speaker: 'おかもと', jp: 'もちろんです。ありがとうございます。', en: 'Of course. Thank you very much.' }
      ],
      key_phrases: [
        { jp: 'ちょうしをみてもらう', en: 'have one\'s condition checked' },
        { jp: 'はんにち', en: 'half a day' },
        { jp: '〜ばじゅうぶん', en: '~ will be sufficient' }
      ],
      questions: [
        { q: 'What day does Okamoto want time off?', opts: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], ans: 2 },
        { q: 'How much time off does Okamoto need?', opts: ['All day', 'Morning only', 'Afternoon only', 'Two days'], ans: 2 },
        { q: 'Why does the manager ask Okamoto to come in the morning?', opts: ['There is a deadline', 'There is a meeting', 'The boss is visiting', 'There is training'], ans: 1 }
      ]
    },
    {
      ch: 10, title: 'かんきょう問題について', level: 'N3',
      topic: 'Discussing Environmental Issues',
      audio: 'audio/listening/n3/ch10.mp3',
      script: [
        { speaker: 'すずき', jp: 'さいきん、てんきがおかしいですね。', en: 'The weather has been strange lately, hasn\'t it.' },
        { speaker: 'リー', jp: 'そうですね。おんだんかのえいきょうでしょうか。', en: 'That\'s right. Could it be the influence of global warming?' },
        { speaker: 'すずき', jp: 'きっとそうだとおもいます。CO₂がふえるにつれて、きおんがあがっているそうですから。', en: 'I think it must be. I hear that as CO₂ increases, temperatures are rising.' },
        { speaker: 'リー', jp: 'こじんでできることには、かぎりがありますが、わたしたちもできるかぎりとりくもうとしています。', en: 'There is a limit to what individuals can do, but we are also trying to engage as much as possible.' },
        { speaker: 'すずき', jp: 'そうですね。ちいさなことでも、つみかさねればたいせつですよね。', en: 'That\'s right. Even small things, if they accumulate, are important.' }
      ],
      key_phrases: [
        { jp: 'おんだんかのえいきょう', en: 'influence of global warming' },
        { jp: '〜につれて', en: 'as ~ / in proportion to ~' },
        { jp: 'つみかさねる', en: 'accumulate / pile up' }
      ],
      questions: [
        { q: 'What do the speakers think is causing the strange weather?', opts: ['El Niño', 'Pollution', 'Global warming', 'Deforestation'], ans: 2 },
        { q: 'According to Suzuki, what is rising as CO₂ increases?', opts: ['Sea levels', 'Rainfall', 'Temperatures', 'Storms'], ans: 2 },
        { q: 'What do the speakers agree about small actions?', opts: ['They are useless', 'They are important if they accumulate', 'Only governments can make a difference', 'They are enough on their own'], ans: 1 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N2 — Nihongo Somatome N2
     ════════════════════════════════════════════════════════ */
  N2: [
    {
      ch: 1, title: 'テレビのインタビュー', level: 'N2',
      topic: 'TV Interview: Social Issues',
      audio: 'audio/listening/n2/ch01.mp3',
      script: [
        { speaker: 'アナウンサー', jp: 'ただいまのアンケートによると、20代の若者の半数以上が、しょうらいにふあんをかんじているそうです。', en: 'According to the recent survey, more than half of young people in their 20s apparently feel anxious about the future.' },
        { speaker: 'せんもんか', jp: 'そうですね。しゅうしょくのふあんや、けっこん・こそだてにかかるひようのもんだいが大きいようです。', en: 'That\'s right. Anxiety about employment and the costs of marriage and child-raising appear to be major issues.' },
        { speaker: 'アナウンサー', jp: 'せいふはどのようなたいさくをとるべきだとおもいますか。', en: 'What measures do you think the government should take?' },
        { speaker: 'せんもんか', jp: 'こそだてしえんをじゅうじつさせるとともに、わかいひとがしごとをえやすいかんきょうをつくることが急務です。', en: 'Along with strengthening childcare support, creating an environment in which young people can easily find work is an urgent matter.' }
      ],
      key_phrases: [
        { jp: '〜によると', en: 'according to ~' },
        { jp: '急務', en: 'urgent task / pressing matter' },
        { jp: '〜とともに', en: 'together with ~ / along with ~' }
      ],
      questions: [
        { q: 'What do more than half of young people in their 20s feel?', opts: ['Satisfied', 'Happy', 'Anxious about the future', 'Content with their jobs'], ans: 2 },
        { q: 'Which two issues are mentioned?', opts: ['Housing and food', 'Employment and childcare costs', 'Education and healthcare', 'Transport and environment'], ans: 1 },
        { q: 'What does the expert call an urgent matter?', opts: ['Reducing taxes', 'Building more houses', 'Creating an environment for young people to find work', 'Expanding public transport'], ans: 2 }
      ]
    },
    {
      ch: 5, title: 'けいごのつかいかた', level: 'N2',
      topic: 'Using Keigo Correctly',
      audio: 'audio/listening/n2/ch05.mp3',
      script: [
        { speaker: 'かちょう', jp: 'きむらくん、さっきのきゃくさまへのたいおう、ちょっとよくなかったよ。', en: 'Kimura, your handling of the customer earlier was not quite right.' },
        { speaker: 'きむら', jp: 'えっ、そうですか。どのあたりがよくなかったでしょうか。', en: 'Really? Which part was not right?' },
        { speaker: 'かちょう', jp: '「わかりました」じゃなく、「かしこまりました」と言わなきゃ。きゃくさまにはけんじょうごをつかうんだよ。', en: 'Instead of "wakarimashita", you should say "kashikomarimashita". You need to use humble speech with customers.' },
        { speaker: 'きむら', jp: 'あ、すみません。けんじょうごとそんけいごのつかいわけがまだむずかしくて。', en: 'Oh, I\'m sorry. Distinguishing between humble and respectful speech is still difficult for me.' },
        { speaker: 'かちょう', jp: 'わかった。あとでいっしょにれんしゅうしよう。けいごはたいせつだから、しっかりおぼえてね。', en: 'I understand. Let\'s practise together later. Keigo is important, so learn it properly.' }
      ],
      key_phrases: [
        { jp: 'かしこまりました', en: 'Certainly (very formal/humble)' },
        { jp: 'けんじょうご', en: 'humble speech' },
        { jp: 'そんけいご', en: 'respectful speech' }
      ],
      questions: [
        { q: 'What did Kimura say that was wrong?', opts: ['"Sumimasen"', '"Wakarimashita"', '"Onegaishimasu"', '"Arigatou"'], ans: 1 },
        { q: 'What should be used with customers?', opts: ['Casual speech', 'Respectful speech', 'Humble speech', 'Plain form'], ans: 2 },
        { q: 'What does the manager offer to do?', opts: ['Write Kimura notes', 'Give Kimura a book', 'Practise together later', 'Ask another colleague to help'], ans: 2 }
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N1 — Nihongo Somatome N1
     ════════════════════════════════════════════════════════ */
  N1: [
    {
      ch: 3, title: 'ぼうえきまさつについて', level: 'N1',
      topic: 'Trade Disputes',
      audio: 'audio/listening/n1/ch03.mp3',
      script: [
        { speaker: 'ファシリテーター', jp: '今日は、ぼうえきまさつの問題について、おふたりのいけんをうかがいたいと思います。', en: 'Today I would like to hear the opinions of both of you on the issue of trade disputes.' },
        { speaker: 'やまもと', jp: 'じゆうぼうえきをすすめることが、ながいめでみれば、どちらのくににとっても利益になると考えます。', en: 'I believe that promoting free trade will, in the long run, benefit both countries.' },
        { speaker: 'なかにし', jp: 'おっしゃることはわかりますが、じつさいには自国のさんぎょうをまもるためにかんぜいをもうけることもやむをえないことがあります。', en: 'I understand what you say, but in reality there are times when it is unavoidable to impose tariffs to protect domestic industries.' },
        { speaker: 'やまもと', jp: 'たしかに。ただ、かんぜいをかけることで、ひょうか品のねだんがあがり、しょうひしゃがこうむるふたんがおおきくなることも、かんがえなければなりません。', en: 'That is true. However, we must also consider that imposing tariffs raises the prices of goods and increases the burden on consumers.' }
      ],
      key_phrases: [
        { jp: 'ぼうえきまさつ', en: 'trade dispute / friction' },
        { jp: 'やむをえない', en: 'unavoidable / no choice' },
        { jp: 'しょうひしゃ', en: 'consumer' }
      ],
      questions: [
        { q: 'What is Yamamoto\'s position on free trade?', opts: ['Opposed', 'In favour for long-term mutual benefit', 'Neutral', 'Uncertain'], ans: 1 },
        { q: 'Why does Nakanishi defend tariffs?', opts: ['To raise government revenue', 'To protect domestic industries', 'To reduce imports', 'To help consumers'], ans: 1 },
        { q: 'What negative effect of tariffs does Yamamoto mention?', opts: ['Job losses', 'Inflation', 'Higher goods prices burdening consumers', 'Reduced exports'], ans: 2 }
      ]
    },
    {
      ch: 7, title: 'しぜんとにんげんのきょうせい', level: 'N1',
      topic: 'Coexistence of Nature and Humans',
      audio: 'audio/listening/n1/ch07.mp3',
      script: [
        { speaker: 'きょうじゅ', jp: 'ちきゅうのかんきょうが急速にかわりつつあるなかで、にんげんとしぜんのきょうせいをどうじつげんするかが、われわれにとって最大のかだいです。', en: 'In a situation where the earth\'s environment is rapidly changing, how to realise the coexistence of humans and nature is the greatest challenge facing us.' },
        { speaker: 'きょうじゅ', jp: 'てくのろじーのかつようだけでなく、ひとりひとりのいしきかいかくが不可欠です。', en: 'Not only the utilisation of technology, but a change in consciousness by each individual is indispensable.' },
        { speaker: 'がくせい', jp: 'せんせい、こじんのりょくには限りがあるようにおもうのですが、そのてんはいかがでしょうか。', en: 'Professor, I feel the power of individuals is limited — what do you think about that point?' },
        { speaker: 'きょうじゅ', jp: 'その通りです。だからこそ、こじんのこうどうをしえんするせいさくてきなしくみと、きょういくがひつようなんです。', en: 'That is exactly right. That is precisely why we need policy frameworks and education that support individual action.' }
      ],
      key_phrases: [
        { jp: 'きょうせい', en: 'coexistence' },
        { jp: 'いしきかいかく', en: 'change of consciousness' },
        { jp: 'だからこそ', en: 'that is precisely why' }
      ],
      questions: [
        { q: 'What does the professor call the greatest challenge?', opts: ['Reducing CO₂', 'Realising coexistence of humans and nature', 'Developing clean energy', 'Conserving biodiversity'], ans: 1 },
        { q: 'What does the professor say is indispensable besides technology?', opts: ['Government funding', 'Individual change of consciousness', 'International agreements', 'Scientific research'], ans: 1 },
        { q: 'What does the professor say supports individual action?', opts: ['Social media', 'Religious organisations', 'Policy frameworks and education', 'Economic incentives'], ans: 2 }
      ]
    }
  ]
};

window.NZChapterListening = NZChapterListening;

