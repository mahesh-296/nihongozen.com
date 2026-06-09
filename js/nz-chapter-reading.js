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
