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
