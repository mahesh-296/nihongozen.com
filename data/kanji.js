/* =====================================================================
   data/kanji.js  —  NihongoZen Kanji Data
   Extracted from page.tsx — Vanilla JS (no React, no imports)
   Structure: { id, kanji, reading, meaning, kun, on, example, exampleMeaning, learned }
   Loaded by index.html BEFORE js/core.js
   ===================================================================== */

const kanjiData = {
  N5: [
    { id: 'k-n5-001', kanji: '日', reading: 'にち・ひ',    meaning: 'Sun / Day',           kun: 'ひ、か',      on: 'ニチ、ジツ',    example: '今日は晴れです。',        exampleMeaning: 'Today is sunny.',                   learned: true  },
    { id: 'k-n5-002', kanji: '月', reading: 'つき・げつ',  meaning: 'Moon / Month',         kun: 'つき',        on: 'ゲツ、ガツ',    example: '月曜日に会います。',      exampleMeaning: 'We meet on Monday.',                learned: true  },
    { id: 'k-n5-003', kanji: '山', reading: 'やま・さん',  meaning: 'Mountain',             kun: 'やま',        on: 'サン',          example: '富士山は美しい。',        exampleMeaning: 'Mt. Fuji is beautiful.',             learned: true  },
    { id: 'k-n5-004', kanji: '川', reading: 'かわ・せん',  meaning: 'River',                kun: 'かわ',        on: 'セン',          example: '川で泳ぎます。',          exampleMeaning: 'I swim in the river.',              learned: false },
    { id: 'k-n5-005', kanji: '木', reading: 'き・もく',    meaning: 'Tree / Wood',          kun: 'き、こ',      on: 'モク、ボク',    example: '木の下で休む。',          exampleMeaning: 'Rest under the tree.',              learned: true  },
    { id: 'k-n5-006', kanji: '火', reading: 'ひ・か',      meaning: 'Fire',                 kun: 'ひ',          on: 'カ',            example: '火曜日は忙しい。',        exampleMeaning: 'Tuesday is busy.',                  learned: true  },
    { id: 'k-n5-007', kanji: '水', reading: 'みず・すい',  meaning: 'Water',                kun: 'みず',        on: 'スイ',          example: '水を飲んでください。',    exampleMeaning: 'Please drink water.',               learned: false },
    { id: 'k-n5-008', kanji: '土', reading: 'つち・ど',    meaning: 'Earth / Soil',         kun: 'つち',        on: 'ド、ト',        example: '土曜日に遊ぶ。',          exampleMeaning: 'Play on Saturday.',                 learned: true  },
    { id: 'k-n5-009', kanji: '人', reading: 'ひと・じん',  meaning: 'Person',               kun: 'ひと',        on: 'ジン、ニン',    example: 'あの人は先生です。',      exampleMeaning: 'That person is a teacher.',         learned: true  },
    { id: 'k-n5-010', kanji: '大', reading: 'おお・だい',  meaning: 'Big / Large',          kun: 'おお',        on: 'ダイ、タイ',    example: '大きな犬がいる。',        exampleMeaning: 'There is a big dog.',               learned: false },
    { id: 'k-n5-011', kanji: '小', reading: 'ちい・しょう',meaning: 'Small',                kun: 'ちい、こ',    on: 'ショウ',        example: '小さい猫が好き。',        exampleMeaning: 'I like small cats.',                learned: true  },
    { id: 'k-n5-012', kanji: '上', reading: 'うえ・じょう',meaning: 'Above / Up',           kun: 'うえ、のぼ',  on: 'ジョウ',        example: '机の上にある。',          exampleMeaning: 'It is on the desk.',                learned: true  },
    { id: 'k-n5-013', kanji: '下', reading: 'した・か',    meaning: 'Below / Down',         kun: 'した、くだ',  on: 'カ、ゲ',        example: '机の下にある。',          exampleMeaning: 'It is under the desk.',             learned: true  },
    { id: 'k-n5-014', kanji: '中', reading: 'なか・ちゅう',meaning: 'Middle / Inside',      kun: 'なか',        on: 'チュウ',        example: '箱の中に入れる。',        exampleMeaning: 'Put it inside the box.',            learned: false },
    { id: 'k-n5-015', kanji: '国', reading: 'くに・こく',  meaning: 'Country',              kun: 'くに',        on: 'コク',          example: '日本は美しい国です。',    exampleMeaning: 'Japan is a beautiful country.',     learned: true  },
    { id: 'k-n5-016', kanji: '年', reading: 'とし・ねん',  meaning: 'Year',                 kun: 'とし',        on: 'ネン',          example: '今年は何年ですか。',      exampleMeaning: 'What year is this year?',           learned: true  },
    { id: 'k-n5-017', kanji: '生', reading: 'い・せい',    meaning: 'Life / Birth',         kun: 'い、う',      on: 'セイ、ショウ',  example: '学生です。',              exampleMeaning: 'I am a student.',                   learned: false },
    { id: 'k-n5-018', kanji: '先', reading: 'さき・せん',  meaning: 'Before / Previous',    kun: 'さき',        on: 'セン',          example: '先生に聞く。',            exampleMeaning: 'Ask the teacher.',                  learned: true  },
    { id: 'k-n5-019', kanji: '学', reading: 'まな・がく',  meaning: 'Study / Learn',        kun: 'まな',        on: 'ガク',          example: '日本語を学ぶ。',          exampleMeaning: 'Study Japanese.',                   learned: true  },
    { id: 'k-n5-020', kanji: '校', reading: 'こう',        meaning: 'School',               kun: '',            on: 'コウ',          example: '学校に行く。',            exampleMeaning: 'Go to school.',                     learned: true  },
  ],
  N4: [
    { id: 'k-n4-001', kanji: '駅', reading: 'えき',        meaning: 'Station',              kun: '',            on: 'エキ',          example: '駅まで歩きます。',        exampleMeaning: 'I walk to the station.',            learned: true  },
    { id: 'k-n4-002', kanji: '映', reading: 'えい',        meaning: 'Reflect / Movie',      kun: 'うつ',        on: 'エイ',          example: '映画を見ました。',        exampleMeaning: 'I watched a movie.',                learned: false },
    { id: 'k-n4-003', kanji: '運', reading: 'うん・はこ',  meaning: 'Transport / Luck',     kun: 'はこ',        on: 'ウン',          example: '運動が好きです。',        exampleMeaning: 'I like exercise.',                  learned: true  },
    { id: 'k-n4-004', kanji: '開', reading: 'ひら・かい',  meaning: 'Open',                 kun: 'ひら、あ',    on: 'カイ',          example: 'ドアを開けてください。',  exampleMeaning: 'Please open the door.',             learned: false },
    { id: 'k-n4-005', kanji: '去', reading: 'さ・きょ',    meaning: 'Past / Leave',         kun: 'さ',          on: 'キョ、コ',      example: '去年日本に行った。',      exampleMeaning: 'I went to Japan last year.',        learned: true  },
    { id: 'k-n4-006', kanji: '急', reading: 'いそ・きゅう',meaning: 'Hurry / Sudden',       kun: 'いそ',        on: 'キュウ',        example: '急いでください！',        exampleMeaning: 'Please hurry!',                     learned: true  },
    { id: 'k-n4-007', kanji: '近', reading: 'ちか・きん',  meaning: 'Near / Close',         kun: 'ちか',        on: 'キン',          example: '駅の近くに住む。',        exampleMeaning: 'Live near the station.',            learned: false },
    { id: 'k-n4-008', kanji: '強', reading: 'つよ・きょう',meaning: 'Strong',               kun: 'つよ',        on: 'キョウ',        example: '強い風が吹く。',          exampleMeaning: 'A strong wind blows.',              learned: true  },
    { id: 'k-n4-009', kanji: '教', reading: 'おし・きょう',meaning: 'Teach',                kun: 'おし',        on: 'キョウ',        example: '英語を教える。',          exampleMeaning: 'Teach English.',                    learned: true  },
    { id: 'k-n4-010', kanji: '銀', reading: 'ぎん',        meaning: 'Silver / Bank',        kun: '',            on: 'ギン',          example: '銀行に行く。',            exampleMeaning: 'Go to the bank.',                   learned: false },
    { id: 'k-n4-011', kanji: '計', reading: 'はか・けい',  meaning: 'Measure / Plan',       kun: 'はか',        on: 'ケイ',          example: '時計を見る。',            exampleMeaning: 'Look at the clock.',                learned: true  },
    { id: 'k-n4-012', kanji: '建', reading: 'た・けん',    meaning: 'Build / Construct',    kun: 'た',          on: 'ケン',          example: '建物が高い。',            exampleMeaning: 'The building is tall.',             learned: false },
  ],
  N3: [
    { id: 'k-n3-001', kanji: '影', reading: 'かげ・えい',  meaning: 'Shadow / Influence',   kun: 'かげ',        on: 'エイ',          example: '影響を受けました。',      exampleMeaning: 'I was influenced.',                 learned: false },
    { id: 'k-n3-002', kanji: '演', reading: 'えん',        meaning: 'Perform / Demonstrate',kun: '',            on: 'エン',          example: '演劇を楽しんだ。',        exampleMeaning: 'Enjoyed the play.',                 learned: false },
    { id: 'k-n3-003', kanji: '応', reading: 'おう',        meaning: 'Answer / Respond',     kun: 'こた',        on: 'オウ',          example: '応援してください。',      exampleMeaning: 'Please cheer for me.',              learned: true  },
    { id: 'k-n3-004', kanji: '横', reading: 'よこ・おう',  meaning: 'Side / Horizontal',    kun: 'よこ',        on: 'オウ',          example: '横断歩道を渡る。',        exampleMeaning: 'Cross the crosswalk.',              learned: false },
    { id: 'k-n3-005', kanji: '温', reading: 'あたた・おん',meaning: 'Warm / Temperature',   kun: 'あたた',      on: 'オン',          example: '温かいお茶を飲む。',      exampleMeaning: 'Drink warm tea.',                   learned: true  },
    { id: 'k-n3-006', kanji: '化', reading: 'か',          meaning: 'Change / Transform',   kun: 'ば',          on: 'カ、ケ',        example: '文化を学ぶ。',            exampleMeaning: 'Learn about culture.',              learned: false },
    { id: 'k-n3-007', kanji: '価', reading: 'か',          meaning: 'Value / Price',        kun: 'ね',          on: 'カ',            example: '価格が高い。',            exampleMeaning: 'The price is high.',                learned: false },
    { id: 'k-n3-008', kanji: '果', reading: 'は・か',      meaning: 'Fruit / Result',       kun: 'は',          on: 'カ',            example: '結果を見る。',            exampleMeaning: 'See the result.',                   learned: true  },
  ],
  N2: [
    { id: 'k-n2-001', kanji: '握', reading: 'にぎ',        meaning: 'Grip / Hold',          kun: 'にぎ',        on: 'アク',          example: '手を握る。',              exampleMeaning: 'Grip the hand.',                    learned: false },
    { id: 'k-n2-002', kanji: '威', reading: 'い',          meaning: 'Dignity / Authority',  kun: '',            on: 'イ',            example: '威厳がある。',            exampleMeaning: 'Has dignity.',                      learned: false },
    { id: 'k-n2-003', kanji: '慰', reading: 'なぐさ',      meaning: 'Comfort / Console',    kun: 'なぐさ',      on: 'イ',            example: '慰める言葉。',            exampleMeaning: 'Words of comfort.',                 learned: false },
    { id: 'k-n2-004', kanji: '維', reading: 'い',          meaning: 'Maintain / Fiber',     kun: '',            on: 'イ',            example: '維持する。',              exampleMeaning: 'Maintain.',                         learned: false },
  ],
  N1: [
    { id: 'k-n1-001', kanji: '曖', reading: 'あい',        meaning: 'Vague / Ambiguous',    kun: '',            on: 'アイ',          example: '曖昧な返事。',            exampleMeaning: 'An ambiguous answer.',              learned: false },
    { id: 'k-n1-002', kanji: '彙', reading: 'い',          meaning: 'Vocabulary / Collect', kun: '',            on: 'イ',            example: '語彙を増やす。',          exampleMeaning: 'Expand vocabulary.',                learned: false },
    { id: 'k-n1-003', kanji: '韻', reading: 'いん',        meaning: 'Rhyme / Echo',         kun: '',            on: 'イン',          example: '韻を踏む。',              exampleMeaning: 'Rhyme.',                            learned: false },
    { id: 'k-n1-004', kanji: '淫', reading: 'いん',        meaning: 'Lewd / Excessive',     kun: 'みだ',        on: 'イン',          example: '淫らな行為。',            exampleMeaning: 'Lewd behavior.',                    learned: false },
  ],
};

/* ─── Global expose — pages.js uses window.kanjiData ─── */
window.kanjiData = kanjiData;
