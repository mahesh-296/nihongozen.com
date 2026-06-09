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
