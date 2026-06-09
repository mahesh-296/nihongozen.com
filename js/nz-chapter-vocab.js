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

const NZChapterData = {

  /* ════════════════════════════════════════════════════════
     N5 — Minna no Nihongo I  (Chapters 1–25)
     ════════════════════════════════════════════════════════ */
  N5: [
    {
      ch: 1, title: 'はじめまして',
      topic: 'Introductions & Occupations',
      words: [
        { jp:'わたし',        romaji:'watashi',        en:'I / me' },
        { jp:'あなた',        romaji:'anata',          en:'you' },
        { jp:'かれ',          romaji:'kare',           en:'he' },
        { jp:'かのじょ',      romaji:'kanojo',         en:'she' },
        { jp:'みなさん',      romaji:'minasan',        en:'everyone' },
        { jp:'〜さん',        romaji:'~san',           en:'Mr. / Ms. (honorific)' },
        { jp:'〜ちゃん',      romaji:'~chan',          en:'(affectionate suffix)' },
        { jp:'〜くん',        romaji:'~kun',           en:'(suffix for boys/juniors)' },
        { jp:'せんせい',      romaji:'sensei',         en:'teacher' },
        { jp:'がくせい',      romaji:'gakusei',        en:'student' },
        { jp:'かいしゃいん',  romaji:'kaishain',       en:'company employee' },
        { jp:'いしゃ',        romaji:'isha',           en:'doctor' },
        { jp:'けんきゅうしゃ',romaji:'kenkyuusha',     en:'researcher' },
        { jp:'エンジニア',    romaji:'enjinia',        en:'engineer' },
        { jp:'だいがく',      romaji:'daigaku',        en:'university' },
        { jp:'びょういん',    romaji:'byouin',         en:'hospital' },
        { jp:'にほん',        romaji:'nihon',          en:'Japan' },
        { jp:'なまえ',        romaji:'namae',          en:'name' },
        { jp:'なんさい',      romaji:'nansai',         en:'how old?' },
        { jp:'〜さい',        romaji:'~sai',           en:'... years old' },
      ]
    },
    {
      ch: 2, title: 'これはなんですか',
      topic: 'Things & Objects',
      words: [
        { jp:'これ',    romaji:'kore',     en:'this (near speaker)' },
        { jp:'それ',    romaji:'sore',     en:'that (near listener)' },
        { jp:'あれ',    romaji:'are',      en:'that over there' },
        { jp:'この',    romaji:'kono',     en:'this ~' },
        { jp:'その',    romaji:'sono',     en:'that ~' },
        { jp:'あの',    romaji:'ano',      en:'that ~ over there' },
        { jp:'ほん',    romaji:'hon',      en:'book' },
        { jp:'じしょ',  romaji:'jisho',    en:'dictionary' },
        { jp:'ざっし',  romaji:'zasshi',   en:'magazine' },
        { jp:'しんぶん',romaji:'shinbun',  en:'newspaper' },
        { jp:'ノート',  romaji:'nooto',    en:'notebook' },
        { jp:'てちょう',romaji:'techou',   en:'pocket diary' },
        { jp:'カード',  romaji:'kaado',    en:'card' },
        { jp:'えんぴつ',romaji:'enpitsu',  en:'pencil' },
        { jp:'ボールペン',romaji:'boorupen',en:'ballpoint pen' },
        { jp:'シャープペンシル',romaji:'shaapupenshiru',en:'mechanical pencil' },
        { jp:'かさ',    romaji:'kasa',     en:'umbrella' },
        { jp:'かばん',  romaji:'kaban',    en:'bag' },
        { jp:'くつ',    romaji:'kutsu',    en:'shoes' },
        { jp:'ネクタイ',romaji:'nekutai',  en:'necktie' },
        { jp:'ワイシャツ',romaji:'waishatsu',en:'(white) dress shirt' },
        { jp:'うわぎ',  romaji:'uwagi',    en:'jacket / coat' },
        { jp:'スカート',romaji:'sukaato',  en:'skirt' },
        { jp:'なんですか',romaji:'nan desu ka',en:'What is it?' },
      ]
    },
    {
      ch: 3, title: 'ここはどこですか',
      topic: 'Places & Locations',
      words: [
        { jp:'ここ',      romaji:'koko',      en:'here' },
        { jp:'そこ',      romaji:'soko',      en:'there' },
        { jp:'あそこ',    romaji:'asoko',     en:'over there' },
        { jp:'どこ',      romaji:'doko',      en:'where' },
        { jp:'こちら',    romaji:'kochira',   en:'this way / this person' },
        { jp:'そちら',    romaji:'sochira',   en:'that way' },
        { jp:'あちら',    romaji:'achira',    en:'that way (far)' },
        { jp:'どちら',    romaji:'dochira',   en:'which way / which one' },
        { jp:'うえ',      romaji:'ue',        en:'above / on top' },
        { jp:'した',      romaji:'shita',     en:'below / under' },
        { jp:'まえ',      romaji:'mae',       en:'in front' },
        { jp:'うしろ',    romaji:'ushiro',    en:'behind' },
        { jp:'みぎ',      romaji:'migi',      en:'right' },
        { jp:'ひだり',    romaji:'hidari',    en:'left' },
        { jp:'なか',      romaji:'naka',      en:'inside' },
        { jp:'そと',      romaji:'soto',      en:'outside' },
        { jp:'となり',    romaji:'tonari',    en:'next to' },
        { jp:'ちかく',    romaji:'chikaku',   en:'near' },
        { jp:'あいだ',    romaji:'aida',      en:'between' },
        { jp:'デパート',  romaji:'depaato',   en:'department store' },
        { jp:'スーパー',  romaji:'suupaa',    en:'supermarket' },
        { jp:'ポスト',    romaji:'posuto',    en:'mailbox' },
        { jp:'ATM',       romaji:'ATM',       en:'ATM / cash machine' },
        { jp:'〜かい',    romaji:'~kai',      en:'...th floor' },
      ]
    },
    {
      ch: 4, title: 'いま なんじですか',
      topic: 'Time & Daily Schedules',
      words: [
        { jp:'いま',        romaji:'ima',       en:'now' },
        { jp:'〜じ',        romaji:'~ji',       en:'... o\'clock' },
        { jp:'〜ふん／〜ぷん',romaji:'~fun/pun', en:'... minutes' },
        { jp:'はん',        romaji:'han',       en:'half (past)' },
        { jp:'ごぜん',      romaji:'gozen',     en:'a.m.' },
        { jp:'ごご',        romaji:'gogo',      en:'p.m.' },
        { jp:'あさ',        romaji:'asa',       en:'morning' },
        { jp:'ひる',        romaji:'hiru',      en:'daytime / noon' },
        { jp:'よる',        romaji:'yoru',      en:'night' },
        { jp:'おととい',    romaji:'ototoi',    en:'the day before yesterday' },
        { jp:'きのう',      romaji:'kinou',     en:'yesterday' },
        { jp:'きょう',      romaji:'kyou',      en:'today' },
        { jp:'あした',      romaji:'ashita',    en:'tomorrow' },
        { jp:'あさって',    romaji:'asatte',    en:'the day after tomorrow' },
        { jp:'やすみ',      romaji:'yasumi',    en:'holiday / day off / rest' },
        { jp:'ひるやすみ',  romaji:'hiruyasumi',en:'lunch break' },
        { jp:'なんじ',      romaji:'nanji',     en:'what time?' },
        { jp:'〜から',      romaji:'~kara',     en:'from ~' },
        { jp:'〜まで',      romaji:'~made',     en:'until ~' },
        { jp:'〜かん',      romaji:'~kan',      en:'for ~ hours' },
      ]
    },
    {
      ch: 5, title: 'いくらですか',
      topic: 'Shopping & Numbers',
      words: [
        { jp:'いくら',      romaji:'ikura',     en:'how much?' },
        { jp:'〜えん',      romaji:'~en',       en:'... yen' },
        { jp:'ひゃく',      romaji:'hyaku',     en:'100' },
        { jp:'せん',        romaji:'sen',       en:'1,000' },
        { jp:'まん',        romaji:'man',       en:'10,000' },
        { jp:'りんご',      romaji:'ringo',     en:'apple' },
        { jp:'みかん',      romaji:'mikan',     en:'mandarin orange' },
        { jp:'はな',        romaji:'hana',      en:'flower' },
        { jp:'たまご',      romaji:'tamago',    en:'egg' },
        { jp:'さかな',      romaji:'sakana',    en:'fish' },
        { jp:'にく',        romaji:'niku',      en:'meat' },
        { jp:'おちゃ',      romaji:'ocha',      en:'(green) tea' },
        { jp:'こうちゃ',    romaji:'koucha',    en:'black tea' },
        { jp:'ジュース',    romaji:'juusu',     en:'juice' },
        { jp:'みず',        romaji:'mizu',      en:'water' },
        { jp:'コーヒー',    romaji:'koohii',    en:'coffee' },
        { jp:'〜つ',        romaji:'~tsu',      en:'(counter for general objects)' },
        { jp:'ひとつ',      romaji:'hitotsu',   en:'one (thing)' },
        { jp:'ふたつ',      romaji:'futatsu',   en:'two (things)' },
        { jp:'みっつ',      romaji:'mittsu',    en:'three (things)' },
        { jp:'よっつ',      romaji:'yottsu',    en:'four (things)' },
        { jp:'いつつ',      romaji:'itsutsu',   en:'five (things)' },
        { jp:'ください',    romaji:'kudasai',   en:'please give me' },
      ]
    },
    {
      ch: 6, title: 'まいにち なんじに おきますか',
      topic: 'Daily Routines (Verbs)',
      words: [
        { jp:'おきます',    romaji:'okimasu',       en:'get up / wake up' },
        { jp:'ねます',      romaji:'nemasu',        en:'go to sleep / lie down' },
        { jp:'はたらきます',romaji:'hatarakimasu',  en:'work' },
        { jp:'やすみます',  romaji:'yasumimasu',    en:'rest / take a day off' },
        { jp:'べんきょうします',romaji:'benkyou shimasu',en:'study' },
        { jp:'おわります',  romaji:'owarimasu',     en:'finish / end' },
        { jp:'はじまります',romaji:'hajimarimasu',  en:'begin / start' },
        { jp:'まいにち',    romaji:'mainichi',      en:'every day' },
        { jp:'まいあさ',    romaji:'maiasa',        en:'every morning' },
        { jp:'まいばん',    romaji:'maiban',        en:'every evening' },
        { jp:'たいてい',    romaji:'taitei',        en:'usually' },
        { jp:'よく',        romaji:'yoku',          en:'often' },
        { jp:'ときどき',    romaji:'tokidoki',      en:'sometimes' },
        { jp:'あまり〜ない',romaji:'amari~nai',     en:'not much / not often' },
        { jp:'ぜんぜん〜ない',romaji:'zenzen~nai',  en:'not at all' },
        { jp:'そして',      romaji:'soshite',       en:'and then / also' },
        { jp:'でも',        romaji:'demo',          en:'but' },
        { jp:'だから',      romaji:'dakara',        en:'therefore' },
      ]
    },
    {
      ch: 7, title: 'うちに かえります',
      topic: 'Going & Coming (Verbs of Movement)',
      words: [
        { jp:'いきます',    romaji:'ikimasu',   en:'go' },
        { jp:'きます',      romaji:'kimasu',    en:'come' },
        { jp:'かえります',  romaji:'kaerimasu', en:'return / go home' },
        { jp:'でんしゃ',    romaji:'densha',    en:'electric train' },
        { jp:'ちかてつ',    romaji:'chikatetsu',en:'subway / underground' },
        { jp:'しんかんせん',romaji:'shinkansen',en:'bullet train' },
        { jp:'バス',        romaji:'basu',      en:'bus' },
        { jp:'タクシー',    romaji:'takushii',  en:'taxi' },
        { jp:'ひこうき',    romaji:'hikouki',   en:'airplane' },
        { jp:'ふね',        romaji:'fune',      en:'ship / boat' },
        { jp:'くるま',      romaji:'kuruma',    en:'car' },
        { jp:'じてんしゃ',  romaji:'jitensha',  en:'bicycle' },
        { jp:'あし',        romaji:'ashi',      en:'foot / leg' },
        { jp:'〜で',        romaji:'~de',       en:'by (means of transport)' },
        { jp:'どこか',      romaji:'dokoka',    en:'somewhere' },
        { jp:'ひとりで',    romaji:'hitori de', en:'alone / by oneself' },
        { jp:'いっしょに',  romaji:'issho ni',  en:'together' },
        { jp:'いつ',        romaji:'itsu',      en:'when' },
        { jp:'せんしゅう',  romaji:'senshuu',   en:'last week' },
        { jp:'らいしゅう',  romaji:'raishuu',   en:'next week' },
      ]
    },
    {
      ch: 8, title: 'えを かきます',
      topic: 'Actions & Hobbies',
      words: [
        { jp:'たべます',    romaji:'tabemasu',  en:'eat' },
        { jp:'のみます',    romaji:'nomimasu',  en:'drink' },
        { jp:'すいます',    romaji:'suimasu',   en:'smoke' },
        { jp:'かきます',    romaji:'kakimasu',  en:'write / draw' },
        { jp:'よみます',    romaji:'yomimasu',  en:'read' },
        { jp:'きります',    romaji:'kirimasu',  en:'cut' },
        { jp:'おくります',  romaji:'okurimasu', en:'send' },
        { jp:'あげます',    romaji:'agemasu',   en:'give (to s.o.)' },
        { jp:'もらいます',  romaji:'moraimasu', en:'receive' },
        { jp:'かします',    romaji:'kashimasu', en:'lend' },
        { jp:'かります',    romaji:'karimasu',  en:'borrow' },
        { jp:'おしえます',  romaji:'oshiemasu', en:'teach / tell' },
        { jp:'しょくじ',    romaji:'shokuji',   en:'meal' },
        { jp:'ひるごはん',  romaji:'hirugohan', en:'lunch' },
        { jp:'あさごはん',  romaji:'asagohan',  en:'breakfast' },
        { jp:'ばんごはん',  romaji:'bangohan',  en:'dinner' },
        { jp:'なに',        romaji:'nani',      en:'what' },
        { jp:'なに〜',      romaji:'nani~',     en:'what (before a counter)' },
      ]
    },
    {
      ch: 9, title: 'そこを まがってください',
      topic: 'Requests & Giving Directions',
      words: [
        { jp:'おきてください',    romaji:'okite kudasai',   en:'please wake up' },
        { jp:'ちょっと まって',    romaji:'chotto matte',    en:'wait a moment' },
        { jp:'まがります',        romaji:'magarimasu',      en:'turn' },
        { jp:'わたります',        romaji:'watarimasu',      en:'cross' },
        { jp:'まっすぐ',          romaji:'massugu',         en:'straight ahead' },
        { jp:'みち',              romaji:'michi',           en:'road / way' },
        { jp:'しんごう',          romaji:'shingou',         en:'traffic light' },
        { jp:'かど',              romaji:'kado',            en:'corner' },
        { jp:'はし',              romaji:'hashi',           en:'bridge' },
        { jp:'〜をわたって',      romaji:'~o watatte',      en:'cross ~' },
        { jp:'〜をまがって',      romaji:'~o magatte',      en:'turn at ~' },
        { jp:'どうぞ',            romaji:'douzo',           en:'please (go ahead) / here you are' },
        { jp:'すみません',        romaji:'sumimasen',       en:'excuse me / I\'m sorry' },
        { jp:'ありがとうございます',romaji:'arigatou gozaimasu',en:'thank you' },
        { jp:'おねがいします',    romaji:'onegai shimasu',  en:'please (request)' },
      ]
    },
    {
      ch: 10, title: 'にほんごが すこし わかります',
      topic: 'Abilities & Understanding',
      words: [
        { jp:'わかります',      romaji:'wakarimasu',    en:'understand' },
        { jp:'あります',        romaji:'arimasu',       en:'exist / have (non-living)' },
        { jp:'います',          romaji:'imasu',         en:'exist / be (living)' },
        { jp:'すきです',        romaji:'suki desu',     en:'like' },
        { jp:'きらいです',      romaji:'kirai desu',    en:'dislike' },
        { jp:'じょうずです',    romaji:'jouzu desu',    en:'good at / skilful' },
        { jp:'へたです',        romaji:'heta desu',     en:'bad at / poor at' },
        { jp:'すこし',          romaji:'sukoshi',       en:'a little' },
        { jp:'たくさん',        romaji:'takusan',       en:'a lot / many' },
        { jp:'〜が',            romaji:'~ga',           en:'(subject marker / ability marker)' },
        { jp:'にほんご',        romaji:'nihongo',       en:'Japanese language' },
        { jp:'えいご',          romaji:'eigo',          en:'English' },
        { jp:'ちゅうごくご',    romaji:'chuugokugo',    en:'Chinese (language)' },
        { jp:'スポーツ',        romaji:'supootsu',      en:'sports' },
        { jp:'おんがく',        romaji:'ongaku',        en:'music' },
        { jp:'ダンス',          romaji:'dansu',         en:'dance' },
        { jp:'どんな',          romaji:'donna',         en:'what kind of' },
      ]
    },
    {
      ch: 11, title: 'どんな まちに すんでいますか',
      topic: 'Towns & ~ている (State)',
      words: [
        { jp:'すんでいます',    romaji:'sunde imasu',   en:'living (in)' },
        { jp:'はたらいています',romaji:'hataraite imasu',en:'working' },
        { jp:'けっこんしています',romaji:'kekkon shite imasu',en:'married' },
        { jp:'しっています',    romaji:'shitte imasu',  en:'know' },
        { jp:'しりません',      romaji:'shirimasen',    en:'don\'t know' },
        { jp:'まち',            romaji:'machi',         en:'town' },
        { jp:'むら',            romaji:'mura',          en:'village' },
        { jp:'しぜん',          romaji:'shizen',        en:'nature' },
        { jp:'くうき',          romaji:'kuuki',         en:'air' },
        { jp:'みどり',          romaji:'midori',        en:'greenery / green' },
        { jp:'かわ',            romaji:'kawa',          en:'river' },
        { jp:'うみ',            romaji:'umi',           en:'sea' },
        { jp:'やま',            romaji:'yama',          en:'mountain' },
        { jp:'にぎやか（な）',  romaji:'nigiyaka (na)', en:'lively / bustling' },
        { jp:'しずか（な）',    romaji:'shizuka (na)',  en:'quiet' },
        { jp:'べんり（な）',    romaji:'benri (na)',    en:'convenient' },
        { jp:'ふべん（な）',    romaji:'fuben (na)',    en:'inconvenient' },
      ]
    },
    {
      ch: 12, title: 'もっと ゆっくり はなして ください',
      topic: 'Requests (て-form)',
      words: [
        { jp:'〜てください',    romaji:'~te kudasai',       en:'please do ~' },
        { jp:'〜てもいいです',  romaji:'~te mo ii desu',    en:'may do ~' },
        { jp:'〜てはいけません',romaji:'~te wa ikemasen',   en:'must not do ~' },
        { jp:'ゆっくり',        romaji:'yukkuri',           en:'slowly' },
        { jp:'もう一度',        romaji:'mou ichido',        en:'once more' },
        { jp:'はなします',      romaji:'hanashimasu',       en:'speak' },
        { jp:'かきます',        romaji:'kakimasu',          en:'write' },
        { jp:'みせます',        romaji:'misemasu',          en:'show' },
        { jp:'てつだいます',    romaji:'tetsudaimasu',      en:'help' },
        { jp:'よびます',        romaji:'yobimasu',          en:'call / invite' },
        { jp:'はいります',      romaji:'hairimasu',         en:'enter' },
        { jp:'でます',          romaji:'demasu',            en:'go out / leave' },
        { jp:'けします',        romaji:'keshimasu',         en:'turn off / erase' },
        { jp:'つけます',        romaji:'tsukemasu',         en:'turn on / attach' },
        { jp:'あけます',        romaji:'akemasu',           en:'open' },
        { jp:'しめます',        romaji:'shimemasu',         en:'close' },
        { jp:'コピーします',    romaji:'kopii shimasu',     en:'make a copy' },
        { jp:'れんらくします',  romaji:'renraku shimasu',   en:'contact' },
      ]
    },
    {
      ch: 13, title: 'びじゅつかんで しゃしんを とっても いいですか',
      topic: 'Permission & Prohibition',
      words: [
        { jp:'びじゅつかん',    romaji:'bijutsukan',    en:'art museum' },
        { jp:'きって',          romaji:'kitte',         en:'postage stamp' },
        { jp:'はがき',          romaji:'hagaki',        en:'postcard' },
        { jp:'もうしこみしょ',  romaji:'moushikomisho', en:'application form' },
        { jp:'たてもの',        romaji:'tatemono',      en:'building' },
        { jp:'しゃしん',        romaji:'shashin',       en:'photo / photograph' },
        { jp:'とります',        romaji:'torimasu',      en:'take (a photo)' },
        { jp:'ひきます',        romaji:'hikimasu',      en:'play (stringed/keyboard instrument)' },
        { jp:'うたいます',      romaji:'utaimasu',      en:'sing' },
        { jp:'あつめます',      romaji:'atsumemasu',    en:'collect' },
        { jp:'すわります',      romaji:'suwarimasu',    en:'sit down' },
        { jp:'たちます',        romaji:'tachimasu',     en:'stand up' },
        { jp:'もちます',        romaji:'mochimasu',     en:'hold / carry' },
        { jp:'はいります',      romaji:'hairimasu',     en:'enter' },
        { jp:'〜ても いいですか',romaji:'~te mo ii desu ka',en:'May I ~?' },
        { jp:'〜てもいいです',  romaji:'~te mo ii desu',en:'You may ~.' },
        { jp:'〜てはいけません',romaji:'~te wa ikemasen',en:'You must not ~.' },
      ]
    },
    {
      ch: 14, title: 'この かんじは どう よむんですか',
      topic: 'Explanation & Reason (んです)',
      words: [
        { jp:'〜んです',        romaji:'~n desu',           en:'(explanatory/emphasis ending)' },
        { jp:'どうして',        romaji:'doushite',          en:'why' },
        { jp:'なぜ',            romaji:'naze',              en:'why (formal)' },
        { jp:'〜から',          romaji:'~kara',             en:'because ~' },
        { jp:'かぜ',            romaji:'kaze',              en:'cold (illness)' },
        { jp:'ねつ',            romaji:'netsu',             en:'fever' },
        { jp:'ずつう',          romaji:'zutsuu',            en:'headache' },
        { jp:'はきけ',          romaji:'hakike',            en:'nausea' },
        { jp:'いたい',          romaji:'itai',              en:'painful / it hurts' },
        { jp:'つかれています',  romaji:'tsukarete imasu',   en:'tired' },
        { jp:'のどが いたい',   romaji:'nodo ga itai',      en:'sore throat' },
        { jp:'おなかが いたい', romaji:'onaka ga itai',     en:'stomachache' },
        { jp:'あたまが いたい', romaji:'atama ga itai',     en:'headache' },
        { jp:'びょうき',        romaji:'byouki',            en:'illness' },
        { jp:'くすり',          romaji:'kusuri',            en:'medicine' },
        { jp:'やすみます',      romaji:'yasumimasu',        en:'rest' },
      ]
    },
    {
      ch: 15, title: 'プレゼントに なにが いいですか',
      topic: 'Giving & Receiving',
      words: [
        { jp:'あげます',        romaji:'agemasu',       en:'give (to s.o. else)' },
        { jp:'もらいます',      romaji:'moraimasu',     en:'receive' },
        { jp:'くれます',        romaji:'kuremasu',      en:'give (to me/us)' },
        { jp:'プレゼント',      romaji:'purezento',     en:'present / gift' },
        { jp:'クリスマス',      romaji:'kurisumasu',    en:'Christmas' },
        { jp:'たんじょうび',    romaji:'tanjoubi',      en:'birthday' },
        { jp:'けっこんきねんび',romaji:'kekkon kinenbi',en:'wedding anniversary' },
        { jp:'おみやげ',        romaji:'omiyage',       en:'souvenir' },
        { jp:'にんぎょう',      romaji:'ningyou',       en:'doll' },
        { jp:'アクセサリー',    romaji:'akusesarii',    en:'accessory / jewellery' },
        { jp:'ワイン',          romaji:'wain',          en:'wine' },
        { jp:'ケーキ',          romaji:'keeki',         en:'cake' },
        { jp:'かわいい',        romaji:'kawaii',        en:'cute' },
        { jp:'すてきな',        romaji:'suteki na',     en:'lovely / wonderful' },
        { jp:'おめでとうございます',romaji:'omedetou gozaimasu',en:'Congratulations!' },
      ]
    },
    {
      ch: 16, title: 'たのしみに しています',
      topic: 'Preparations & Looking Forward To',
      words: [
        { jp:'たのしみに しています',romaji:'tanoshimi ni shite imasu',en:'looking forward to' },
        { jp:'〜て います',     romaji:'~te imasu',     en:'(ongoing state / result)' },
        { jp:'じゅんびします',  romaji:'junbi shimasu', en:'prepare' },
        { jp:'よやくします',    romaji:'yoyaku shimasu',en:'reserve / book' },
        { jp:'かえります',      romaji:'kaerimasu',     en:'return' },
        { jp:'もどります',      romaji:'modorimasu',    en:'come back / return' },
        { jp:'でかけます',      romaji:'dekakemasu',    en:'go out' },
        { jp:'りょこう',        romaji:'ryokou',        en:'travel / trip' },
        { jp:'みやげ',          romaji:'miyage',        en:'souvenir' },
        { jp:'パスポート',      romaji:'pasupooto',     en:'passport' },
        { jp:'スーツケース',    romaji:'suutsukeesu',   en:'suitcase' },
        { jp:'よていです',      romaji:'yotei desu',    en:'plan to / scheduled' },
        { jp:'つもりです',      romaji:'tsumori desu',  en:'intend to' },
        { jp:'〜と おもっています',romaji:'~to omotteimasu',en:'thinking of ~ing' },
      ]
    },
    {
      ch: 17, title: 'ちょっと お願いが あるんですが',
      topic: 'Requests & Favours',
      words: [
        { jp:'おねがい',        romaji:'onegai',        en:'request / favour' },
        { jp:'〜ていただけませんか',romaji:'~te itadakemasen ka',en:'Could you please ~?' },
        { jp:'〜てあげます',    romaji:'~te agemasu',   en:'do ~ for someone' },
        { jp:'〜てもらいます',  romaji:'~te moraimasu', en:'have someone do ~' },
        { jp:'〜てくれます',    romaji:'~te kuremasu',  en:'(someone) does ~ for me' },
        { jp:'じゅうしょ',      romaji:'juusho',        en:'address' },
        { jp:'ちず',            romaji:'chizu',         en:'map' },
        { jp:'みちを おしえる', romaji:'michi o oshieru',en:'give directions' },
        { jp:'もって いきます', romaji:'motte ikimasu', en:'take (something)' },
        { jp:'もって きます',   romaji:'motte kimasu',  en:'bring (something)' },
        { jp:'つれて いきます', romaji:'tsurete ikimasu',en:'take (someone)' },
        { jp:'つれて きます',   romaji:'tsurete kimasu',en:'bring (someone)' },
        { jp:'おくります',      romaji:'okurimasu',     en:'accompany / send off' },
        { jp:'むかえます',      romaji:'mukaemasu',     en:'go to meet / pick up' },
      ]
    },
    {
      ch: 18, title: 'すもうを みたことが ありますか',
      topic: 'Experiences (たことがある)',
      words: [
        { jp:'〜た ことが あります',romaji:'~ta koto ga arimasu',en:'have done ~ before' },
        { jp:'〜た ことが ありません',romaji:'~ta koto ga arimasen',en:'have never done ~' },
        { jp:'すもう',          romaji:'sumou',         en:'sumo wrestling' },
        { jp:'かぶき',          romaji:'kabuki',        en:'kabuki (traditional theatre)' },
        { jp:'おんせん',        romaji:'onsen',         en:'hot spring' },
        { jp:'さくら',          romaji:'sakura',        en:'cherry blossom' },
        { jp:'のぼります',      romaji:'noborimasu',    en:'climb' },
        { jp:'まけます',        romaji:'makemasu',      en:'lose (a game)' },
        { jp:'かちます',        romaji:'kachimasu',     en:'win' },
        { jp:'なります',        romaji:'narimasu',      en:'become' },
        { jp:'〜に なります',   romaji:'~ni narimasu',  en:'become ~' },
        { jp:'まだ',            romaji:'mada',          en:'still / not yet' },
        { jp:'もう〜た',        romaji:'mou ~ta',       en:'already done ~' },
        { jp:'はじめて',        romaji:'hajimete',      en:'for the first time' },
      ]
    },
    {
      ch: 19, title: 'もしよければ、いっしょに いかがですか',
      topic: 'Invitations & Suggestions',
      words: [
        { jp:'いかがですか',    romaji:'ikaga desu ka',     en:'How about ~? (polite)' },
        { jp:'どうですか',      romaji:'dou desu ka',       en:'How about ~?' },
        { jp:'〜ませんか',      romaji:'~masen ka',         en:'Why don\'t we ~?' },
        { jp:'〜ましょう',      romaji:'~mashou',           en:'Let\'s ~' },
        { jp:'〜ましょうか',    romaji:'~mashou ka',        en:'Shall we ~?' },
        { jp:'もしよければ',    romaji:'moshi yokereba',    en:'if you like / if it\'s OK' },
        { jp:'ぜひ',            romaji:'zehi',              en:'by all means / definitely' },
        { jp:'またこんど',      romaji:'mata kondo',        en:'another time' },
        { jp:'ざんねんですが',  romaji:'zannen desu ga',    en:'Unfortunately...' },
        { jp:'ちょっと…',      romaji:'chotto...',         en:'a little... (gentle refusal)' },
        { jp:'えいが',          romaji:'eiga',              en:'movie / film' },
        { jp:'コンサート',      romaji:'konsaato',          en:'concert' },
        { jp:'しょくじ',        romaji:'shokuji',           en:'meal / dining' },
        { jp:'のみもの',        romaji:'nomimono',          en:'something to drink' },
        { jp:'いっしょに',      romaji:'issho ni',          en:'together' },
      ]
    },
    {
      ch: 20, title: 'そのかばん、かしてもらえますか',
      topic: 'Conditional & Potential',
      words: [
        { jp:'〜たら',          romaji:'~tara',         en:'if ~ / when ~ (conditional)' },
        { jp:'〜ば',            romaji:'~ba',           en:'if ~ (conditional)' },
        { jp:'〜れば よかった', romaji:'~reba yokatta', en:'should have done ~' },
        { jp:'もし',            romaji:'moshi',         en:'if (hypothetical)' },
        { jp:'できます',        romaji:'dekimasu',      en:'can do / be able to' },
        { jp:'〜ことが できます',romaji:'~koto ga dekimasu',en:'be able to ~' },
        { jp:'はしります',      romaji:'hashirimasu',   en:'run' },
        { jp:' およぎます',     romaji:'oyogimasu',     en:'swim' },
        { jp:'うんてんします',  romaji:'unten shimasu', en:'drive' },
        { jp:'ピアノを ひきます',romaji:'piano o hikimasu',en:'play piano' },
        { jp:'りょうりします',  romaji:'ryouri shimasu',en:'cook' },
        { jp:'かします',        romaji:'kashimasu',     en:'lend' },
        { jp:'かります',        romaji:'karimasu',      en:'borrow' },
        { jp:'たすけます',      romaji:'tasukemasu',    en:'help / save' },
      ]
    },
    {
      ch: 21, title: 'いっしょに くらしたいんですが',
      topic: 'Desires & Wanting',
      words: [
        { jp:'〜たいです',      romaji:'~tai desu',         en:'want to ~' },
        { jp:'〜たがっています',romaji:'~tagatte imasu',    en:'(he/she) wants to ~' },
        { jp:'ほしい',          romaji:'hoshii',            en:'want (something)' },
        { jp:'ほしがっています',romaji:'hoshigatte imasu',  en:'(he/she) wants (something)' },
        { jp:'〜ために',        romaji:'~tame ni',          en:'in order to ~ / for the purpose of ~' },
        { jp:'くらします',      romaji:'kurashimasu',       en:'live / make a living' },
        { jp:'かんがえます',    romaji:'kangaemasu',        en:'think about / consider' },
        { jp:'けつい',          romaji:'ketsui',            en:'decision / determination' },
        { jp:'ゆめ',            romaji:'yume',              en:'dream' },
        { jp:'もくひょう',      romaji:'mokuhyou',          en:'goal / objective' },
        { jp:'しょうらい',      romaji:'shourai',           en:'future' },
        { jp:'〜のために',      romaji:'~no tame ni',       en:'for the sake of ~' },
      ]
    },
    {
      ch: 22, title: 'わたしは あの えが すきです',
      topic: 'Opinions & Quotes (と思う)',
      words: [
        { jp:'〜と おもいます',romaji:'~to omoimasu',   en:'I think that ~' },
        { jp:'〜と いいます',  romaji:'~to iimasu',     en:'(they) say that ~' },
        { jp:'〜そうです',     romaji:'~sou desu',      en:'I hear that ~ / it looks like ~' },
        { jp:'〜らしいです',   romaji:'~rashii desu',   en:'it seems ~ / apparently' },
        { jp:'〜ようです',     romaji:'~you desu',      en:'it appears that ~' },
        { jp:'かのう',         romaji:'kanou',          en:'possibility' },
        { jp:'たぶん',         romaji:'tabun',          en:'probably' },
        { jp:'きっと',         romaji:'kitto',          en:'surely / certainly' },
        { jp:'ぜったいに',     romaji:'zettai ni',      en:'absolutely' },
        { jp:'もしかしたら',   romaji:'moshikashitara', en:'perhaps / maybe' },
        { jp:'はっきり',       romaji:'hakkiri',        en:'clearly' },
        { jp:'よく',           romaji:'yoku',           en:'well / often' },
        { jp:'ふつう',         romaji:'futsuu',         en:'usually / normal' },
      ]
    },
    {
      ch: 23, title: 'あそこに おまわりさんが います',
      topic: 'Describing (〜い adj + noun modifications)',
      words: [
        { jp:'おまわりさん',    romaji:'omawarisan',    en:'police officer' },
        { jp:'こうばん',        romaji:'kouban',        en:'police box' },
        { jp:'みつかります',    romaji:'mitsukarimasu', en:'be found' },
        { jp:'わすれます',      romaji:'wasuremasu',    en:'forget' },
        { jp:'なくします',      romaji:'nakushimasu',   en:'lose (something)' },
        { jp:'〜ている ひと',   romaji:'~te iru hito',  en:'person who is ~ing' },
        { jp:'〜た もの',       romaji:'~ta mono',      en:'thing that has been ~ed' },
        { jp:'めがね',          romaji:'megane',        en:'glasses' },
        { jp:'ぼうし',          romaji:'boushi',        en:'hat' },
        { jp:'ふく',            romaji:'fuku',          en:'clothes' },
        { jp:'くつした',        romaji:'kutsushita',    en:'socks' },
        { jp:'てぶくろ',        romaji:'tebukuro',      en:'gloves' },
        { jp:'さいふ',          romaji:'saifu',         en:'wallet' },
        { jp:'かぎ',            romaji:'kagi',          en:'key' },
        { jp:'おちます',        romaji:'ochimasu',      en:'fall down' },
        { jp:'みつけます',      romaji:'mitsukemasu',   en:'find' },
      ]
    },
    {
      ch: 24, title: 'こっちの ほうが ずっと いいですよ',
      topic: 'Comparisons',
      words: [
        { jp:'〜より',          romaji:'~yori',         en:'than ~ (comparison)' },
        { jp:'〜の ほうが',     romaji:'~no hou ga',    en:'~ is more (comparison)' },
        { jp:'〜と〜と どちら', romaji:'~to~to dochira',en:'between ~ and ~, which?' },
        { jp:'いちばん',        romaji:'ichiban',       en:'most / number one' },
        { jp:'ずっと',          romaji:'zutto',         en:'much more / by far' },
        { jp:'もっと',          romaji:'motto',         en:'more' },
        { jp:'こんな',          romaji:'konna',         en:'this kind of' },
        { jp:'そんな',          romaji:'sonna',         en:'that kind of' },
        { jp:'あんな',          romaji:'anna',          en:'that kind of (far)' },
        { jp:'どんな',          romaji:'donna',         en:'what kind of' },
        { jp:'おなじ',          romaji:'onaji',         en:'same' },
        { jp:'ちがいます',      romaji:'chigaimasu',    en:'different / wrong' },
        { jp:'にています',      romaji:'nite imasu',    en:'resemble / look alike' },
        { jp:'たかい',          romaji:'takai',         en:'expensive / tall / high' },
        { jp:'やすい',          romaji:'yasui',         en:'cheap' },
      ]
    },
    {
      ch: 25, title: 'よく かんがえてから きめます',
      topic: 'Sequential Actions & Decision Making',
      words: [
        { jp:'〜てから',        romaji:'~te kara',          en:'after doing ~' },
        { jp:'〜まえに',        romaji:'~mae ni',           en:'before ~' },
        { jp:'〜あとで',        romaji:'~ato de',           en:'after ~' },
        { jp:'〜あいだに',      romaji:'~aida ni',          en:'while ~ / during ~' },
        { jp:'きめます',        romaji:'kimemasu',          en:'decide' },
        { jp:'はじめます',      romaji:'hajimemasu',        en:'start / begin' },
        { jp:'おわります',      romaji:'owarimasu',         en:'finish / end' },
        { jp:'つづけます',      romaji:'tsuzukemasu',       en:'continue' },
        { jp:'やめます',        romaji:'yamemasu',          en:'stop / quit' },
        { jp:'かんがえます',    romaji:'kangaemasu',        en:'think / consider' },
        { jp:'えらびます',      romaji:'erabimasu',         en:'choose' },
        { jp:'ためします',      romaji:'tameshimasu',       en:'try / test' },
        { jp:'じゅんびします',  romaji:'junbi shimasu',     en:'prepare' },
        { jp:'れんしゅうします',romaji:'renshuu shimasu',   en:'practise' },
        { jp:'もう一度',        romaji:'mou ichido',        en:'once more / again' },
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N4 — Minna no Nihongo II  (Chapters 26–50, labelled 1–25)
     ════════════════════════════════════════════════════════ */
  N4: [
    {
      ch: 1, chBook: 26, title: 'じょうずに なりたいです',
      topic: '〜に なる / Goals & Progress',
      words: [
        { jp:'〜く なります',   romaji:'~ku narimasu',    en:'become ~ (i-adj)' },
        { jp:'〜に なります',   romaji:'~ni narimasu',    en:'become ~ (na-adj / noun)' },
        { jp:'じょうずに',      romaji:'jouzu ni',        en:'skillfully / well' },
        { jp:'べんきょうになります',romaji:'benkyou ni narimasu',en:'study becomes...' },
        { jp:'はやく',          romaji:'hayaku',          en:'quickly / early' },
        { jp:'うまく',          romaji:'umaku',           en:'well / skillfully' },
        { jp:'たいせつ（な）',  romaji:'taisetsu (na)',   en:'important' },
        { jp:'ひつよう（な）',  romaji:'hitsuyou (na)',   en:'necessary' },
        { jp:'むずかしい',      romaji:'muzukashii',      en:'difficult' },
        { jp:'やさしい',        romaji:'yasashii',        en:'easy / kind' },
        { jp:'おもしろい',      romaji:'omoshiroi',       en:'interesting' },
        { jp:'つまらない',      romaji:'tsumaranai',      en:'boring' },
        { jp:'すばらしい',      romaji:'subarashii',      en:'wonderful' },
        { jp:'すごい',          romaji:'sugoi',           en:'amazing' },
      ]
    },
    {
      ch: 2, chBook: 27, title: 'にほんごが よめます',
      topic: 'Potential Form',
      words: [
        { jp:'よめます',        romaji:'yomemasu',        en:'can read' },
        { jp:'かけます',        romaji:'kakemasu',        en:'can write' },
        { jp:'はなせます',      romaji:'hanasemasu',      en:'can speak' },
        { jp:'きけます',        romaji:'kikemasu',        en:'can listen / can hear' },
        { jp:'たべられます',    romaji:'taberaremasu',    en:'can eat' },
        { jp:'のめます',        romaji:'nomemasu',        en:'can drink' },
        { jp:'できます',        romaji:'dekimasu',        en:'can do / able to' },
        { jp:'〜ことが できます',romaji:'~koto ga dekimasu',en:'be able to ~' },
        { jp:'みられます',      romaji:'miraremasu',      en:'can see / can watch' },
        { jp:'〜られます',      romaji:'~raremasu',       en:'potential (ru-verb)' },
        { jp:'〜えます',        romaji:'~emasu',          en:'potential (u-verb)' },
        { jp:'にほんごで',      romaji:'nihongo de',      en:'in Japanese' },
        { jp:'じゆうに',        romaji:'jiyuu ni',        en:'freely / as one pleases' },
      ]
    },
    {
      ch: 3, chBook: 28, title: 'なぜ にほんへ きたんですか',
      topic: 'Purpose & Reasons (〜ために)',
      words: [
        { jp:'〜ために',        romaji:'~tame ni',          en:'in order to ~ / for the purpose of ~' },
        { jp:'〜のために',      romaji:'~no tame ni',       en:'for the sake of ~' },
        { jp:'りゆう',          romaji:'riyuu',             en:'reason' },
        { jp:'もくてき',        romaji:'mokuteki',          en:'purpose / aim' },
        { jp:'きっかけ',        romaji:'kikkake',           en:'opportunity / trigger' },
        { jp:'けいけん',        romaji:'keiken',            en:'experience' },
        { jp:'しかく',          romaji:'shikaku',           en:'qualification' },
        { jp:'にゅうがく',      romaji:'nyuugaku',          en:'school admission' },
        { jp:'そつぎょう',      romaji:'sotsugyou',         en:'graduation' },
        { jp:'はいります',      romaji:'hairimasu',         en:'enter / join' },
        { jp:'やとわれます',    romaji:'yatowa remasu',     en:'be employed' },
        { jp:'しゅうしょく',    romaji:'shuushoku',         en:'finding employment' },
        { jp:'しょうらい',      romaji:'shourai',           en:'future' },
        { jp:'ゆめ',            romaji:'yume',              en:'dream' },
      ]
    },
    {
      ch: 4, chBook: 29, title: 'もし じかんが あれば…',
      topic: 'Conditionals (〜ば / 〜たら / 〜なら)',
      words: [
        { jp:'〜ば',            romaji:'~ba',               en:'if ~ (conditional)' },
        { jp:'〜たら',          romaji:'~tara',             en:'if ~ / once ~ (conditional)' },
        { jp:'〜なら',          romaji:'~nara',             en:'if ~ / in that case' },
        { jp:'もし',            romaji:'moshi',             en:'if (hypothetical)' },
        { jp:'〜のに',          romaji:'~no ni',            en:'although ~ / despite ~' },
        { jp:'〜のに',          romaji:'~no ni',            en:'(purpose) in order to ~' },
        { jp:'きっと',          romaji:'kitto',             en:'certainly / for sure' },
        { jp:'たぶん',          romaji:'tabun',             en:'probably' },
        { jp:'もしかしたら',    romaji:'moshikashitara',    en:'perhaps' },
        { jp:'ぜひ',            romaji:'zehi',              en:'by all means' },
        { jp:'かならず',        romaji:'kanarazu',          en:'without fail / definitely' },
        { jp:'どんなに〜ても',  romaji:'donna ni ~te mo',   en:'no matter how ~' },
      ]
    },
    {
      ch: 5, chBook: 30, title: '〜といわれています',
      topic: 'Passive Voice',
      words: [
        { jp:'〜られます',      romaji:'~raremasu',         en:'(passive, ru-verb)' },
        { jp:'〜われます',      romaji:'~waremasu',         en:'(passive, u-verb)' },
        { jp:'〜に よって',     romaji:'~ni yotte',         en:'by ~ (cause/means)' },
        { jp:'〜と いわれています',romaji:'~to iwarete imasu',en:'it is said that ~' },
        { jp:'つかわれます',    romaji:'tsukawaremasu',     en:'be used' },
        { jp:'つくられます',    romaji:'tsukuraremasu',     en:'be made' },
        { jp:'よばれます',      romaji:'yobaremasu',        en:'be called' },
        { jp:'しられています',  romaji:'shirarete imasu',   en:'be known' },
        { jp:'みとめられます',  romaji:'mitomeraremasu',    en:'be recognized / accepted' },
        { jp:'かんがえられます',romaji:'kangaeraremasu',    en:'be considered' },
        { jp:'〜として',        romaji:'~to shite',         en:'as ~ / in the capacity of ~' },
        { jp:'〜によると',      romaji:'~ni yoru to',       en:'according to ~' },
      ]
    },
    {
      ch: 6, chBook: 31, title: 'あの えいがを みたことが ありますか',
      topic: 'Causative Form',
      words: [
        { jp:'〜させます',      romaji:'~sasemasu',         en:'make/let someone do ~ (causative)' },
        { jp:'〜させてください',romaji:'~sasete kudasai',   en:'please let me ~' },
        { jp:'させられます',    romaji:'saseraremasu',      en:'be made to do ~ (causative-passive)' },
        { jp:'はたらかせます',  romaji:'hatarakasemasu',    en:'make (s.o.) work' },
        { jp:'かんがえさせます',romaji:'kangaesasemasu',    en:'make (s.o.) think' },
        { jp:'いわせます',      romaji:'iwasemasu',         en:'make (s.o.) say' },
        { jp:'みせます',        romaji:'misemasu',          en:'show' },
        { jp:'きかせます',      romaji:'kikasemasu',        en:'let (s.o.) hear' },
        { jp:'たべさせます',    romaji:'tabesasemasu',      en:'make/let (s.o.) eat' },
        { jp:'〜てもらいます',  romaji:'~te moraimasu',     en:'have (s.o.) do ~' },
        { jp:'じゆうに',        romaji:'jiyuu ni',          en:'freely' },
      ]
    },
    {
      ch: 7, chBook: 32, title: 'もっと はやく おきれば よかった',
      topic: 'Expressing Regret (〜ばよかった)',
      words: [
        { jp:'〜ば よかった',   romaji:'~ba yokatta',       en:'I should have ~ / I wish I had ~' },
        { jp:'〜なければ よかった',romaji:'~nakereba yokatta',en:'I shouldn\'t have ~' },
        { jp:'こうかい',        romaji:'koukai',            en:'regret' },
        { jp:'ざんねん（な）',  romaji:'zannen (na)',        en:'unfortunate / disappointing' },
        { jp:'しっぱい',        romaji:'shippai',           en:'failure / mistake' },
        { jp:'まちがい',        romaji:'machigai',          en:'mistake' },
        { jp:'きをつけます',    romaji:'ki o tsukemasu',    en:'be careful' },
        { jp:'〜てしまいます',  romaji:'~te shimaimasu',    en:'end up doing ~ / (regrettably) did ~' },
        { jp:'つい',            romaji:'tsui',              en:'unintentionally / by habit' },
        { jp:'うっかり',        romaji:'ukkari',            en:'carelessly' },
        { jp:'なんで',          romaji:'nande',             en:'why (casual)' },
      ]
    },
    {
      ch: 8, chBook: 33, title: 'みちを おしえてもらえますか',
      topic: 'Giving / Receiving Favours',
      words: [
        { jp:'〜て あげます',   romaji:'~te agemasu',       en:'do ~ for s.o. (outward)' },
        { jp:'〜て もらいます', romaji:'~te moraimasu',     en:'have s.o. do ~ for me' },
        { jp:'〜て くれます',   romaji:'~te kuremasu',      en:'s.o. does ~ for me' },
        { jp:'てつだいます',    romaji:'tetsudaimasu',      en:'help' },
        { jp:'せわを します',   romaji:'sewa o shimasu',    en:'take care of' },
        { jp:'おみまい',        romaji:'omimai',            en:'get-well visit' },
        { jp:'おれい',          romaji:'orei',              en:'thank-you gift / gratitude' },
        { jp:'あいさつ',        romaji:'aisatsu',           en:'greeting' },
        { jp:'かしこまりました',romaji:'kashikomarimashita',en:'Certainly. / Understood. (formal)' },
        { jp:'おきのどくに',    romaji:'oki no doku ni',    en:'I\'m sorry to hear that' },
        { jp:'よろこんで',      romaji:'yorokonde',         en:'with pleasure / gladly' },
      ]
    },
    {
      ch: 9, chBook: 34, title: 'どこへ いったら いいですか',
      topic: 'Advice (〜たらどうですか)',
      words: [
        { jp:'〜たら どうですか',romaji:'~tara dou desu ka',en:'How about doing ~? / Why don\'t you ~?' },
        { jp:'〜ほうがいいです',romaji:'~hou ga ii desu',   en:'It\'s better to ~ / You should ~' },
        { jp:'〜ないほうがいい',romaji:'~nai hou ga ii',    en:'better not to ~' },
        { jp:'かならず',        romaji:'kanarazu',          en:'definitely' },
        { jp:'きをつけて',      romaji:'ki o tsukete',      en:'take care / be careful' },
        { jp:'しんぱいします',  romaji:'shinpai shimasu',   en:'worry' },
        { jp:'こまります',      romaji:'komarimasu',        en:'be troubled / in a bind' },
        { jp:'そうだん',        romaji:'soudan',            en:'consultation / advice' },
        { jp:'そうだんします',  romaji:'soudan shimasu',    en:'consult / seek advice' },
        { jp:'いけん',          romaji:'iken',              en:'opinion' },
        { jp:'ていあん',        romaji:'teian',             en:'suggestion / proposal' },
      ]
    },
    {
      ch: 10, chBook: 35, title: 'うちへ かえったら、すぐ てを あらいます',
      topic: 'Ordering Actions & Sequences',
      words: [
        { jp:'〜たら、すぐ',    romaji:'~tara, sugu',       en:'as soon as ~ / right after ~' },
        { jp:'すぐ',            romaji:'sugu',              en:'immediately / soon' },
        { jp:'やっと',          romaji:'yatto',             en:'finally / at last' },
        { jp:'とうとう',        romaji:'toutou',            en:'at last / in the end' },
        { jp:'けっきょく',      romaji:'kekkyoku',          en:'in the end / eventually' },
        { jp:'ところで',        romaji:'tokoro de',         en:'by the way' },
        { jp:'それで',          romaji:'sorede',            en:'so / therefore' },
        { jp:'それに',          romaji:'soreni',            en:'moreover / besides' },
        { jp:'しかも',          romaji:'shikamo',           en:'moreover / in addition' },
        { jp:'ところが',        romaji:'tokoroga',          en:'however / but (unexpected)' },
        { jp:'なにしろ',        romaji:'nani shiro',        en:'at any rate / above all' },
      ]
    },
    {
      ch: 11, chBook: 36, title: 'もっと かんがえてみます',
      topic: '〜てみる (Trying Actions)',
      words: [
        { jp:'〜てみます',      romaji:'~te mimasu',        en:'try doing ~' },
        { jp:'〜てみましょう',  romaji:'~te mimashou',      en:'let\'s try doing ~' },
        { jp:'やってみます',    romaji:'yatte mimasu',      en:'try doing it / give it a go' },
        { jp:'たべてみます',    romaji:'tabete mimasu',     en:'try eating' },
        { jp:'きいてみます',    romaji:'kiite mimasu',      en:'try asking / try listening' },
        { jp:'さがします',      romaji:'sagashimasu',       en:'look for / search' },
        { jp:'しらべます',      romaji:'shirabemasu',       en:'investigate / look up' },
        { jp:'たしかめます',    romaji:'tashikamemasu',     en:'confirm / verify' },
        { jp:'みつけます',      romaji:'mitsukemasu',       en:'find' },
        { jp:'うまくいきます',  romaji:'umaku ikimasu',     en:'go well / succeed' },
        { jp:'むずかしい',      romaji:'muzukashii',        en:'difficult' },
        { jp:'むり（な）',      romaji:'muri (na)',         en:'impossible / unreasonable' },
      ]
    },
    {
      ch: 12, chBook: 37, title: 'かいぎは もう はじまっていますか',
      topic: '〜ておく / Preparation',
      words: [
        { jp:'〜ておきます',    romaji:'~te okimasu',       en:'do ~ in advance / do ~ for later' },
        { jp:'じゅんびして おきます',romaji:'junbi shite okimasu',en:'prepare in advance' },
        { jp:'よやくして おきます',romaji:'yoyaku shite okimasu',en:'book in advance' },
        { jp:'かいぎ',          romaji:'kaigi',             en:'meeting / conference' },
        { jp:'よこく',          romaji:'yokoku',            en:'advance notice' },
        { jp:'あらかじめ',      romaji:'arakajime',         en:'in advance / beforehand' },
        { jp:'したく',          romaji:'shitaku',           en:'preparation / getting ready' },
        { jp:'てはいを します', romaji:'tehai o shimasu',   en:'make arrangements' },
        { jp:'かくにん',        romaji:'kakunin',           en:'confirmation / check' },
        { jp:'かくにんします',  romaji:'kakunin shimasu',   en:'confirm / check' },
        { jp:'よしゅう',        romaji:'yoshuu',            en:'preview study / preparation' },
        { jp:'ふくしゅう',      romaji:'fukushuu',          en:'review study' },
      ]
    },
    {
      ch: 13, chBook: 38, title: 'わたしが あのひとを しっています',
      topic: 'Relative Clauses',
      words: [
        { jp:'〜ている ひと',   romaji:'~te iru hito',      en:'person who is ~ing' },
        { jp:'〜た もの',       romaji:'~ta mono',          en:'thing that was ~ed' },
        { jp:'〜という〜',      romaji:'~to iu ~',          en:'~ called ~ / ~ that says ~' },
        { jp:'〜ところ',        romaji:'~tokoro',           en:'place where ~ / just about to ~' },
        { jp:'〜とき',          romaji:'~toki',             en:'when ~ / at the time of ~' },
        { jp:'〜まで',          romaji:'~made',             en:'until ~ / as far as ~' },
        { jp:'〜あいだ（に）',  romaji:'~aida (ni)',        en:'while ~ / during ~' },
        { jp:'〜うちに',        romaji:'~uchi ni',          en:'while ~ / before it\'s too late' },
        { jp:'〜かぎり',        romaji:'~kagiri',           en:'as long as ~ / as far as ~' },
        { jp:'〜まま',          romaji:'~mama',             en:'as ~ / leaving ~ as it is' },
      ]
    },
    {
      ch: 14, chBook: 39, title: 'でんしゃが おくれたので…',
      topic: 'Explanatory Conjunctions',
      words: [
        { jp:'〜ので',          romaji:'~node',             en:'because ~ (reason, polite)' },
        { jp:'〜のに',          romaji:'~no ni',            en:'despite ~ / even though ~' },
        { jp:'〜けれど（も）',  romaji:'~keredo(mo)',        en:'although ~ / but ~' },
        { jp:'〜が',            romaji:'~ga',               en:'but ~ / however ~' },
        { jp:'〜ながら',        romaji:'~nagara',           en:'while doing ~ (simultaneous)' },
        { jp:'〜し、〜し',      romaji:'~shi, ~shi',        en:'both ~ and ~ / what\'s more' },
        { jp:'〜て（から）',    romaji:'~te (kara)',        en:'after doing ~' },
        { jp:'〜まま',          romaji:'~mama',             en:'leaving ~ as is' },
        { jp:'〜とたん（に）',  romaji:'~totan (ni)',        en:'as soon as / the moment ~' },
        { jp:'ちょうど',        romaji:'choudo',            en:'exactly / just' },
        { jp:'ようやく',        romaji:'youyaku',           en:'finally / at last' },
      ]
    },
    {
      ch: 15, chBook: 40, title: 'けんこうの ためには こうどう しましょう',
      topic: 'Health & Body',
      words: [
        { jp:'けんこう',        romaji:'kenkou',            en:'health' },
        { jp:'たいちょう',      romaji:'taichou',           en:'physical condition' },
        { jp:'ちょうし',        romaji:'choushi',           en:'condition / tune' },
        { jp:'うんどう',        romaji:'undou',             en:'exercise' },
        { jp:'ダイエット',      romaji:'daietto',           en:'diet' },
        { jp:'ていき けんしん', romaji:'teiki kenshin',     en:'regular health check' },
        { jp:'えいよう',        romaji:'eiyou',             en:'nutrition' },
        { jp:'すいみん',        romaji:'suimin',            en:'sleep' },
        { jp:'ストレス',        romaji:'sutoresu',          en:'stress' },
        { jp:'きゅうけい',      romaji:'kyuukei',           en:'rest / break' },
        { jp:'さんぽ',          romaji:'sanpo',             en:'walk / stroll' },
        { jp:'ヨガ',            romaji:'yoga',              en:'yoga' },
        { jp:'はしります',      romaji:'hashirimasu',       en:'run' },
        { jp:'およぎます',      romaji:'oyogimasu',         en:'swim' },
      ]
    },
    {
      ch: 16, chBook: 41, title: 'しごとに ついて かんがえています',
      topic: 'Work & Career',
      words: [
        { jp:'しごと',          romaji:'shigoto',           en:'work / job' },
        { jp:'きんむ',          romaji:'kinmu',             en:'duty / service' },
        { jp:'どうりょう',      romaji:'douryou',           en:'colleague' },
        { jp:'じょうし',        romaji:'joushi',            en:'superior / boss' },
        { jp:'ぶか',            romaji:'buka',              en:'subordinate' },
        { jp:'かかりちょう',    romaji:'kakarichou',        en:'section chief' },
        { jp:'かちょう',        romaji:'kachou',            en:'section manager' },
        { jp:'しゃちょう',      romaji:'shachou',           en:'company president' },
        { jp:'きゅうりょう',    romaji:'kyuuryou',          en:'salary' },
        { jp:'ざんぎょう',      romaji:'zangyou',           en:'overtime' },
        { jp:'きゅうか',        romaji:'kyuuka',            en:'paid holiday' },
        { jp:'てんきん',        romaji:'tenkin',            en:'job transfer' },
        { jp:'しょうしん',      romaji:'shoushin',          en:'promotion' },
        { jp:'たいしょく',      romaji:'taishoku',          en:'retirement' },
      ]
    },
    {
      ch: 17, chBook: 42, title: 'テレビを みながら、ごはんを たべています',
      topic: 'Simultaneous Actions (〜ながら)',
      words: [
        { jp:'〜ながら',        romaji:'~nagara',           en:'while doing ~ (same time)' },
        { jp:'〜あいだ',        romaji:'~aida',             en:'while / during' },
        { jp:'〜とき',          romaji:'~toki',             en:'when / at the time of' },
        { jp:'テレビ',          romaji:'terebi',            en:'television' },
        { jp:'ラジオ',          romaji:'rajio',             en:'radio' },
        { jp:'おんがく',        romaji:'ongaku',            en:'music' },
        { jp:'うた',            romaji:'uta',               en:'song' },
        { jp:'うたいます',      romaji:'utaimasu',          en:'sing' },
        { jp:'おどります',      romaji:'odorimasu',         en:'dance' },
        { jp:'さんぽします',    romaji:'sanpo shimasu',     en:'take a walk' },
        { jp:'かんがえます',    romaji:'kangaemasu',        en:'think' },
        { jp:'ひとりごと',      romaji:'hitorigoto',        en:'talking to oneself' },
      ]
    },
    {
      ch: 18, chBook: 43, title: 'せんもん は なんですか',
      topic: 'University & Academic Topics',
      words: [
        { jp:'せんもん',        romaji:'senmon',            en:'specialisation / major' },
        { jp:'けんきゅう',      romaji:'kenkyuu',           en:'research' },
        { jp:'ろんぶん',        romaji:'ronbun',            en:'thesis / paper' },
        { jp:'じっけん',        romaji:'jikken',            en:'experiment' },
        { jp:'ぶんがく',        romaji:'bungaku',           en:'literature' },
        { jp:'けいざい',        romaji:'keizai',            en:'economics' },
        { jp:'ほうりつ',        romaji:'houritsu',          en:'law' },
        { jp:'こうがく',        romaji:'kougaku',           en:'engineering' },
        { jp:'いがく',          romaji:'igaku',             en:'medicine (study)' },
        { jp:'しんりがく',      romaji:'shinrigaku',        en:'psychology' },
        { jp:'れきし',          romaji:'rekishi',           en:'history' },
        { jp:'てつがく',        romaji:'tetsugaku',         en:'philosophy' },
        { jp:'そつぎょう',      romaji:'sotsugyou',         en:'graduation' },
        { jp:'にゅうがく',      romaji:'nyuugaku',          en:'admission (to school)' },
      ]
    },
    {
      ch: 19, chBook: 44, title: 'にほんの ぶんかを しょうかいします',
      topic: 'Japanese Culture',
      words: [
        { jp:'ぶんか',          romaji:'bunka',             en:'culture' },
        { jp:'でんとう',        romaji:'dentou',            en:'tradition' },
        { jp:'まつり',          romaji:'matsuri',           en:'festival' },
        { jp:'しきたり',        romaji:'shikitari',         en:'custom / convention' },
        { jp:'れいぎ',          romaji:'reigi',             en:'manners / etiquette' },
        { jp:'おじぎ',          romaji:'ojigi',             en:'bow' },
        { jp:'きもの',          romaji:'kimono',            en:'kimono' },
        { jp:'ゆかた',          romaji:'yukata',            en:'summer yukata' },
        { jp:'おちゃ',          romaji:'ocha',              en:'tea ceremony / tea' },
        { jp:'いけばな',        romaji:'ikebana',           en:'flower arrangement' },
        { jp:'しょどう',        romaji:'shodou',            en:'calligraphy' },
        { jp:'にほんしょく',    romaji:'nihonshoku',        en:'Japanese food' },
        { jp:'うきよえ',        romaji:'ukiyoe',            en:'ukiyo-e woodblock print' },
        { jp:'かぶき',          romaji:'kabuki',            en:'kabuki theatre' },
      ]
    },
    {
      ch: 20, chBook: 45, title: 'かんきょうもんだいに ついて',
      topic: 'Environment & Society',
      words: [
        { jp:'かんきょう',      romaji:'kankyou',           en:'environment' },
        { jp:'おせん',          romaji:'osen',              en:'pollution' },
        { jp:'たいきおせん',    romaji:'taiki osen',        en:'air pollution' },
        { jp:'みずおせん',      romaji:'mizu osen',         en:'water pollution' },
        { jp:'おんだんか',      romaji:'ondanka',           en:'global warming' },
        { jp:'ちきゅう',        romaji:'chikyuu',           en:'earth / globe' },
        { jp:'リサイクル',      romaji:'risaikuru',         en:'recycling' },
        { jp:'エネルギー',      romaji:'enerugii',          en:'energy' },
        { jp:'たいよう',        romaji:'taiyou',            en:'sun' },
        { jp:'しぜん',          romaji:'shizen',            en:'nature' },
        { jp:'もんだい',        romaji:'mondai',            en:'problem / issue' },
        { jp:'かいけつ',        romaji:'kaiketsu',          en:'solution / resolution' },
        { jp:'とりくみます',    romaji:'torikumimasu',      en:'tackle / work on' },
      ]
    },
    {
      ch: 21, chBook: 46, title: 'かれに あやまったほうが いいですよ',
      topic: 'Conflict & Resolution',
      words: [
        { jp:'あやまります',    romaji:'ayamarimasu',       en:'apologize' },
        { jp:'なかなおりします',romaji:'nakanaorimasu',     en:'make up (after a fight)' },
        { jp:'けんかします',    romaji:'kenka shimasu',     en:'quarrel / fight' },
        { jp:'ゆるします',      romaji:'yurushimasu',       en:'forgive / permit' },
        { jp:'しつれい',        romaji:'shitsurei',         en:'rudeness / impoliteness' },
        { jp:'もうしわけ',      romaji:'moushiwake',        en:'excuse / apology' },
        { jp:'こころから',      romaji:'kokoro kara',       en:'from the heart / sincerely' },
        { jp:'しんけんに',      romaji:'shinken ni',        en:'seriously' },
        { jp:'きちんと',        romaji:'kichinto',          en:'properly / neatly' },
        { jp:'ちゃんと',        romaji:'chanto',            en:'properly / correctly' },
        { jp:'すなおに',        romaji:'sunao ni',          en:'honestly / obediently' },
      ]
    },
    {
      ch: 22, chBook: 47, title: 'この えいがを みた ことが ありますか',
      topic: 'News & Media',
      words: [
        { jp:'ニュース',        romaji:'nyuusu',            en:'news' },
        { jp:'じけん',          romaji:'jiken',             en:'incident / case' },
        { jp:'じこ',            romaji:'jiko',              en:'accident' },
        { jp:'じしん',          romaji:'jishin',            en:'earthquake' },
        { jp:'たいふう',        romaji:'taifuu',            en:'typhoon' },
        { jp:'こうずい',        romaji:'kouzui',            en:'flood' },
        { jp:'じんこう',        romaji:'jinkou',            en:'population' },
        { jp:'けいざい',        romaji:'keizai',            en:'economy' },
        { jp:'せいじ',          romaji:'seiji',             en:'politics' },
        { jp:'しゃかい',        romaji:'shakai',            en:'society' },
        { jp:'こくさい',        romaji:'kokusai',           en:'international' },
        { jp:'しんぶんしゃ',    romaji:'shimbunsha',        en:'newspaper company' },
        { jp:'レポーター',      romaji:'repootaa',          en:'reporter' },
        { jp:'ほうどう',        romaji:'houdou',            en:'news report' },
      ]
    },
    {
      ch: 23, chBook: 48, title: 'てきとうに やったら だめですよ',
      topic: 'Manner & Attitude',
      words: [
        { jp:'てきとう（な）',  romaji:'tekitou (na)',       en:'appropriate / halfhearted' },
        { jp:'まじめ（な）',    romaji:'majime (na)',        en:'serious / earnest' },
        { jp:'いいかげん（な）',romaji:'iikagen (na)',       en:'irresponsible / halfhearted' },
        { jp:'ていねい（な）',  romaji:'teinei (na)',        en:'polite / careful' },
        { jp:'らんぼう（な）',  romaji:'ranbou (na)',        en:'rough / violent' },
        { jp:'しんせつ（な）',  romaji:'shinsetsu (na)',     en:'kind / helpful' },
        { jp:'むじゃき（な）',  romaji:'mujaki (na)',        en:'innocent / carefree' },
        { jp:'なまけます',      romaji:'namakemasu',        en:'be lazy' },
        { jp:'がんばります',    romaji:'ganbarimasu',       en:'do one\'s best' },
        { jp:'どりょく',        romaji:'doryoku',           en:'effort' },
        { jp:'こんき',          romaji:'konki',             en:'patience / perseverance' },
        { jp:'つとめます',      romaji:'tsutomemasu',       en:'make an effort / work' },
      ]
    },
    {
      ch: 24, chBook: 49, title: 'ことばを しらなくても、つたえられます',
      topic: 'Communication',
      words: [
        { jp:'つたえます',      romaji:'tsutaemasu',        en:'convey / communicate' },
        { jp:'つたわります',    romaji:'tsutawarimasu',     en:'be conveyed / reach' },
        { jp:'りかいします',    romaji:'rikai shimasu',     en:'understand' },
        { jp:'ごかい',          romaji:'gokai',             en:'misunderstanding' },
        { jp:'ごかいします',    romaji:'gokai shimasu',     en:'misunderstand' },
        { jp:'たしかめます',    romaji:'tashikamemasu',     en:'confirm / make sure' },
        { jp:'はっきり',        romaji:'hakkiri',           en:'clearly' },
        { jp:'ていねいに',      romaji:'teinei ni',         en:'politely / carefully' },
        { jp:'かんたんに',      romaji:'kantan ni',         en:'simply / easily' },
        { jp:'くわしく',        romaji:'kuwashiku',         en:'in detail' },
        { jp:'みじかく',        romaji:'mijikaku',          en:'briefly' },
        { jp:'ことば',          romaji:'kotoba',            en:'word / language' },
        { jp:'ひょうげん',      romaji:'hyougen',           en:'expression' },
      ]
    },
    {
      ch: 25, chBook: 50, title: 'いままで おせわに なりました',
      topic: 'Farewell & Gratitude',
      words: [
        { jp:'おせわに なりました',romaji:'osewa ni narimashita',en:'Thank you for your help (past)' },
        { jp:'おかげさまで',    romaji:'okagesama de',      en:'thanks to you' },
        { jp:'たいへん おせわに なりました',romaji:'taihen osewa ni narimashita',en:'I\'ve been in your debt greatly' },
        { jp:'これからも どうぞ よろしく',romaji:'korekara mo douzo yoroshiku',en:'Please continue to look after me' },
        { jp:'またいつか',      romaji:'mata itsuka',       en:'sometime again' },
        { jp:'おたがいに',      romaji:'otagai ni',         en:'each other / mutually' },
        { jp:'たいせつにします',romaji:'taisetsu ni shimasu',en:'will treasure / will take care' },
        { jp:'わすれません',    romaji:'wasuremasen',       en:'will not forget' },
        { jp:'おもいで',        romaji:'omoide',            en:'memory / recollection' },
        { jp:'かんしゃ',        romaji:'kansha',            en:'gratitude / appreciation' },
        { jp:'えがお',          romaji:'egao',              en:'smiling face' },
        { jp:'さいかい',        romaji:'saikai',            en:'reunion' },
        { jp:'またあう',        romaji:'mata au',           en:'meet again' },
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N3 — Minna no Nihongo Chukyu  (Chapters 1–12)
     ════════════════════════════════════════════════════════ */
  N3: [
    {
      ch: 1, title: 'なにか かわったことが ありましたか',
      topic: 'Noticing Change & Events',
      words: [
        { jp:'かわります',      romaji:'kawarimasu',        en:'change / differ' },
        { jp:'きづきます',      romaji:'kizukimasu',        en:'notice / become aware' },
        { jp:'おどろきます',    romaji:'odorokimasu',       en:'be surprised' },
        { jp:'ふしぎ（な）',    romaji:'fushigi (na)',       en:'strange / mysterious / wonderful' },
        { jp:'きかい',          romaji:'kikai',             en:'opportunity / chance' },
        { jp:'じょうきょう',    romaji:'joukyou',           en:'situation / circumstances' },
        { jp:'じじょう',        romaji:'jijou',             en:'circumstances / reason' },
        { jp:'けいか',          romaji:'keika',             en:'progress / passage (of time)' },
        { jp:'てん',            romaji:'ten',               en:'point / aspect' },
        { jp:'ようす',          romaji:'yousu',             en:'appearance / situation / manner' },
        { jp:'〜らしい',        romaji:'~rashii',           en:'seems like ~ / apparently' },
        { jp:'〜ようだ',        romaji:'~you da',           en:'appears to be ~' },
        { jp:'〜みたいだ',      romaji:'~mitai da',         en:'looks like ~ / seems like ~' },
      ]
    },
    {
      ch: 2, title: 'ひとに たのむとき',
      topic: 'Making Requests & Seeking Favours',
      words: [
        { jp:'たのみます',      romaji:'tanomimasu',        en:'request / ask a favour' },
        { jp:'おねがいします',  romaji:'onegai shimasu',    en:'please (I request)' },
        { jp:'〜ていただけますか',romaji:'~te itadakemasu ka',en:'Would you please ~?' },
        { jp:'〜てくださいませんか',romaji:'~te kudasaimasen ka',en:'Won\'t you please ~?' },
        { jp:'もしよければ',    romaji:'moshi yokereba',    en:'if you don\'t mind' },
        { jp:'ご迷惑を おかけして',romaji:'gomeiwaku o okake shite',en:'causing you trouble' },
        { jp:'こころよく',      romaji:'kokoroyoku',        en:'willingly / cheerfully' },
        { jp:'むり（な）',      romaji:'muri (na)',         en:'impossible / unreasonable' },
        { jp:'えんりょ',        romaji:'enryo',             en:'reserve / restraint / hesitation' },
        { jp:'えんりょします',  romaji:'enryo shimasu',     en:'hold back / hesitate' },
        { jp:'さしつかえない',  romaji:'sashitsukaenai',    en:'no objection / all right' },
        { jp:'かしこまりました',romaji:'kashikomarimashita',en:'Certainly. (very formal)' },
      ]
    },
    {
      ch: 3, title: 'じかんの つかいかた',
      topic: 'Time Management',
      words: [
        { jp:'じかん',          romaji:'jikan',             en:'time' },
        { jp:'かんり',          romaji:'kanri',             en:'management / control' },
        { jp:'ゆうこうに',      romaji:'yuukou ni',         en:'effectively / usefully' },
        { jp:'むだ（な）',      romaji:'muda (na)',         en:'wasteful / pointless' },
        { jp:'わりあい',        romaji:'wariai',            en:'proportion / comparatively' },
        { jp:'わりに',          romaji:'wari ni',           en:'comparatively / for ~' },
        { jp:'〜わりには',      romaji:'~wari ni wa',       en:'for ~ (unexpectedly)' },
        { jp:'きげん',          romaji:'kigen',             en:'deadline / expiry' },
        { jp:'しめきり',        romaji:'shimekiri',         en:'deadline / closing time' },
        { jp:'まにあいます',    romaji:'ma ni aimasu',      en:'be in time / make it' },
        { jp:'おくれます',      romaji:'okuremasu',         en:'be late / delayed' },
        { jp:'あまります',      romaji:'amarimasu',         en:'remain / be left over' },
        { jp:'〜うちに',        romaji:'~uchi ni',          en:'while ~ / before ~' },
      ]
    },
    {
      ch: 4, title: 'ものを たのむ・かす・かりる',
      topic: 'Lending & Borrowing',
      words: [
        { jp:'かします',        romaji:'kashimasu',         en:'lend' },
        { jp:'かります',        romaji:'karimasu',          en:'borrow' },
        { jp:'つかいます',      romaji:'tsukaimasu',        en:'use' },
        { jp:'かえします',      romaji:'kaeshimasu',        en:'return (something)' },
        { jp:'なくします',      romaji:'nakushimasu',       en:'lose' },
        { jp:'こわします',      romaji:'kowashimasu',       en:'break / destroy' },
        { jp:'こわれます',      romaji:'kowaremasu',        en:'break / be broken' },
        { jp:'しゅうり',        romaji:'shuuri',            en:'repair' },
        { jp:'しゅうりします',  romaji:'shuuri shimasu',    en:'repair' },
        { jp:'そっくり',        romaji:'sokkuri',           en:'exactly / as is' },
        { jp:'そのまま',        romaji:'sono mama',         en:'as it is / unchanged' },
        { jp:'べつに',          romaji:'betsu ni',          en:'separately / not particularly' },
        { jp:'くわしい',        romaji:'kuwashii',          en:'detailed / knowledgeable' },
      ]
    },
    {
      ch: 5, title: 'ていねいに ことわる',
      topic: 'Polite Refusals',
      words: [
        { jp:'ことわります',    romaji:'kotowarimasu',      en:'decline / refuse' },
        { jp:'えんりょします',  romaji:'enryo shimasu',     en:'refrain / hold back' },
        { jp:'じつは',          romaji:'jitsu wa',          en:'actually / to tell the truth' },
        { jp:'あいにく',        romaji:'ainiku',            en:'unfortunately / unluckily' },
        { jp:'せっかくですが',  romaji:'sekkaku desu ga',   en:'I appreciate the offer, but...' },
        { jp:'おさしつかえなければ',romaji:'osashitsukae nakereba',en:'if it\'s not too much trouble' },
        { jp:'つごうが わるい', romaji:'tsugou ga warui',   en:'inconvenient / bad timing' },
        { jp:'さしつかえます',  romaji:'sashitsukaeimasu',  en:'be inconvenient / have an objection' },
        { jp:'むりです',        romaji:'muri desu',         en:'it\'s impossible' },
        { jp:'きびしい',        romaji:'kibishii',          en:'strict / harsh / severe' },
        { jp:'やむをえない',    romaji:'yamu o enai',       en:'unavoidable / no choice' },
      ]
    },
    {
      ch: 6, title: 'かんじょうを あらわす',
      topic: 'Expressing Emotions',
      words: [
        { jp:'かんじょう',      romaji:'kanjou',            en:'emotion / feeling' },
        { jp:'よろこびます',    romaji:'yorokobimasu',      en:'be pleased / rejoice' },
        { jp:'かなしみます',    romaji:'kanashimimasu',     en:'feel sad' },
        { jp:'おこります',      romaji:'okorimasu',         en:'get angry' },
        { jp:'こわがります',    romaji:'kowagarimasu',      en:'be afraid' },
        { jp:'はずかしい',      romaji:'hazukashii',        en:'embarrassed / ashamed' },
        { jp:'さびしい',        romaji:'sabishii',          en:'lonely' },
        { jp:'うれしい',        romaji:'ureshii',           en:'happy / glad' },
        { jp:'かなしい',        romaji:'kanashii',          en:'sad' },
        { jp:'つらい',          romaji:'tsurai',            en:'painful / hard' },
        { jp:'たのしい',        romaji:'tanoshii',          en:'fun / enjoyable' },
        { jp:'こうふん',        romaji:'koufun',            en:'excitement' },
        { jp:'あんしん',        romaji:'anshin',            en:'relief / ease of mind' },
        { jp:'ふあん（な）',    romaji:'fuan (na)',         en:'anxiety / unease' },
      ]
    },
    {
      ch: 7, title: 'いけんを いう',
      topic: 'Expressing & Defending Opinions',
      words: [
        { jp:'いけん',          romaji:'iken',              en:'opinion' },
        { jp:'しゅちょう',      romaji:'shuchou',           en:'assertion / claim' },
        { jp:'りゆう',          romaji:'riyuu',             en:'reason' },
        { jp:'こんきょ',        romaji:'konkyo',            en:'grounds / basis' },
        { jp:'さんせい',        romaji:'sansei',            en:'agreement' },
        { jp:'さんせいします',  romaji:'sansei shimasu',    en:'agree' },
        { jp:'はんたい',        romaji:'hantai',            en:'opposition' },
        { jp:'はんたいします',  romaji:'hantai shimasu',    en:'oppose' },
        { jp:'なっとく',        romaji:'nattoku',           en:'understanding / consent' },
        { jp:'なっとくします',  romaji:'nattoku shimasu',   en:'be convinced / agree' },
        { jp:'ぎろん',          romaji:'giron',             en:'argument / discussion' },
        { jp:'とうろん',        romaji:'touron',            en:'debate' },
        { jp:'〜にもかかわらず',romaji:'~ni mo kakawarazu', en:'despite ~ / in spite of ~' },
        { jp:'〜にしたがって',  romaji:'~ni shitagatte',    en:'as ~ / in accordance with ~' },
      ]
    },
    {
      ch: 8, title: 'だれかに つたえる',
      topic: 'Reporting & Quoting',
      words: [
        { jp:'〜といっていました',romaji:'~to itte imashita',en:'was saying that ~' },
        { jp:'〜とのことです',  romaji:'~to no koto desu',  en:'I hear that ~' },
        { jp:'〜によると',      romaji:'~ni yoru to',       en:'according to ~' },
        { jp:'〜そうです',      romaji:'~sou desu',         en:'I heard that ~' },
        { jp:'つたえます',      romaji:'tsutaemasu',        en:'convey / pass on' },
        { jp:'つたわります',    romaji:'tsutawarimasu',     en:'be conveyed / reach' },
        { jp:'ほうこく',        romaji:'houkoku',           en:'report' },
        { jp:'ほうこくします',  romaji:'houkoku shimasu',   en:'report / inform' },
        { jp:'れんらく',        romaji:'renraku',           en:'contact / communication' },
        { jp:'しらせます',      romaji:'shirasemasu',       en:'inform / notify' },
        { jp:'つたえてください',romaji:'tsutaete kudasai',  en:'please tell (s.o.)' },
        { jp:'おつたえします',  romaji:'otsutae shimasu',   en:'I will convey (humble)' },
      ]
    },
    {
      ch: 9, title: 'ぶんかの ちがい',
      topic: 'Cultural Differences',
      words: [
        { jp:'ぶんかてき（な）',romaji:'bunkanteki (na)',    en:'cultural' },
        { jp:'しゅうかん',      romaji:'shuukan',           en:'habit / custom' },
        { jp:'かんしゅう',      romaji:'kanshuu',           en:'custom / convention' },
        { jp:'タブー',          romaji:'tabuu',             en:'taboo' },
        { jp:'ちがい',          romaji:'chigai',            en:'difference' },
        { jp:'きょうつう（な）',romaji:'kyoutsuu (na)',      en:'common / shared' },
        { jp:'こうてい',        romaji:'koutei',            en:'affirmation / positive' },
        { jp:'ひてい',          romaji:'hitei',             en:'negation / denial' },
        { jp:'そんちょう',      romaji:'sonchou',           en:'respect' },
        { jp:'そんちょうします',romaji:'sonchou shimasu',   en:'respect' },
        { jp:'りかい',          romaji:'rikai',             en:'understanding' },
        { jp:'うけいれます',    romaji:'ukeiremasu',        en:'accept / receive' },
        { jp:'てきおう',        romaji:'tekiou',            en:'adaptation' },
        { jp:'てきおうします',  romaji:'tekiou shimasu',    en:'adapt / adjust' },
      ]
    },
    {
      ch: 10, title: 'しぜんと かんきょう',
      topic: 'Nature & Environment',
      words: [
        { jp:'しぜん',          romaji:'shizen',            en:'nature' },
        { jp:'かんきょう',      romaji:'kankyou',           en:'environment' },
        { jp:'せいたい',        romaji:'seitai',            en:'ecosystem' },
        { jp:'タイキ',          romaji:'taiki',             en:'atmosphere / air' },
        { jp:'きこう',          romaji:'kikou',             en:'climate' },
        { jp:'きしょう',        romaji:'kishou',            en:'weather / climate' },
        { jp:'きせつ',          romaji:'kisetsu',           en:'season' },
        { jp:'あたたかい',      romaji:'atatakai',          en:'warm' },
        { jp:'すずしい',        romaji:'suzushii',          en:'cool' },
        { jp:'さむい',          romaji:'samui',             en:'cold' },
        { jp:'おんだんか',      romaji:'ondanka',           en:'global warming' },
        { jp:'ていたんそ',      romaji:'teitanso',          en:'low carbon' },
        { jp:'さいがい',        romaji:'saigai',            en:'disaster' },
        { jp:'ひなん',          romaji:'hinan',             en:'evacuation' },
        { jp:'ひなんします',    romaji:'hinan shimasu',     en:'evacuate' },
      ]
    },
    {
      ch: 11, title: 'ニュースを よむ',
      topic: 'Reading News & Headlines',
      words: [
        { jp:'みだし',          romaji:'midashi',           en:'headline' },
        { jp:'きじ',            romaji:'kiji',              en:'article' },
        { jp:'しゃせつ',        romaji:'shasetsu',          en:'editorial' },
        { jp:'とくしゅう',      romaji:'tokushuu',          en:'special feature' },
        { jp:'ちょうさ',        romaji:'chousa',            en:'survey / research / investigation' },
        { jp:'けっか',          romaji:'kekka',             en:'result / outcome' },
        { jp:'えいきょう',      romaji:'eikyou',            en:'influence / effect' },
        { jp:'たいさく',        romaji:'taisaku',           en:'countermeasure' },
        { jp:'げんいん',        romaji:'genin',             en:'cause' },
        { jp:'かいぜん',        romaji:'kaizen',            en:'improvement' },
        { jp:'かいぜんします',  romaji:'kaizen shimasu',    en:'improve' },
        { jp:'こうか',          romaji:'kouka',             en:'effect / result' },
        { jp:'すいしん',        romaji:'suishin',           en:'promotion / drive' },
        { jp:'もくひょう',      romaji:'mokuhyou',          en:'goal / objective' },
      ]
    },
    {
      ch: 12, title: 'まとめ — ふくごうひょうげん',
      topic: 'Review: Complex Expressions',
      words: [
        { jp:'〜にもかかわらず',romaji:'~ni mo kakawarazu', en:'despite ~ / in spite of ~' },
        { jp:'〜さえ〜ば',      romaji:'~sae ~ba',          en:'if only ~ then ~' },
        { jp:'〜にすぎない',    romaji:'~ni suginai',       en:'nothing but ~ / merely ~' },
        { jp:'〜にちがいない',  romaji:'~ni chigainai',     en:'must be ~ / no doubt' },
        { jp:'〜はずだ',        romaji:'~hazu da',          en:'expected to be ~ / should be ~' },
        { jp:'〜はずがない',    romaji:'~hazu ga nai',      en:'there\'s no way ~' },
        { jp:'〜べきだ',        romaji:'~beki da',          en:'should ~ / ought to ~' },
        { jp:'〜べきではない',  romaji:'~beki de wa nai',   en:'shouldn\'t ~ / ought not to ~' },
        { jp:'〜に反して',      romaji:'~ni hanshite',      en:'contrary to ~' },
        { jp:'〜にともなって',  romaji:'~ni tomonatte',     en:'along with ~ / in accordance with ~' },
        { jp:'〜をもとに',      romaji:'~wo moto ni',       en:'based on ~ / drawing from ~' },
        { jp:'〜において',      romaji:'~ni oite',          en:'in ~ / at ~ (formal)' },
        { jp:'〜に関して',      romaji:'~ni kanshite',      en:'regarding ~ / concerning ~' },
        { jp:'〜にとって',      romaji:'~ni totte',         en:'for ~ / to ~ (from the perspective of)' },
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N2 — Nihongo Somatome N2  (8 topic chapters)
     ════════════════════════════════════════════════════════ */
  N2: [
    {
      ch: 1, title: '副詞・接続詞',
      topic: 'Adverbs & Conjunctions',
      words: [
        { jp:'かえって',        romaji:'kaette',            en:'on the contrary / rather' },
        { jp:'むしろ',          romaji:'mushiro',           en:'rather / instead' },
        { jp:'たしかに',        romaji:'tashika ni',        en:'certainly / admittedly' },
        { jp:'なるほど',        romaji:'naru hodo',         en:'I see / indeed' },
        { jp:'もっとも',        romaji:'mottomo',           en:'however / that said / indeed' },
        { jp:'ところが',        romaji:'tokoroga',          en:'however (unexpected)' },
        { jp:'それどころか',    romaji:'sore dokoro ka',    en:'far from that / on the contrary' },
        { jp:'しかも',          romaji:'shikamo',           en:'moreover / furthermore' },
        { jp:'それに',          romaji:'sore ni',           en:'besides / furthermore' },
        { jp:'ようするに',      romaji:'you suru ni',       en:'in short / to sum up' },
        { jp:'つまり',          romaji:'tsumari',           en:'in other words / that is' },
        { jp:'いわば',          romaji:'iwaba',             en:'so to speak / as it were' },
        { jp:'たとえば',        romaji:'tatoeba',           en:'for example' },
        { jp:'もとより',        romaji:'moto yori',         en:'from the start / of course' },
        { jp:'もちろん',        romaji:'mochiron',          en:'of course / naturally' },
      ]
    },
    {
      ch: 2, title: '複合動詞',
      topic: 'Compound Verbs',
      words: [
        { jp:'やりとげます',    romaji:'yari togemasu',     en:'accomplish / carry through' },
        { jp:'たちあがります',  romaji:'tachi agarimasu',   en:'stand up / rise' },
        { jp:'きりかえます',    romaji:'kiri kaemasu',      en:'switch / change over' },
        { jp:'とりかかります',  romaji:'tori kakarimasu',   en:'get started on / set about' },
        { jp:'もちあげます',    romaji:'mochi agemasu',     en:'lift up / raise' },
        { jp:'ふみこみます',    romaji:'fumi komimasu',     en:'step into / go deep into' },
        { jp:'おしつけます',    romaji:'oshi tsukemasu',    en:'force on / impose' },
        { jp:'うりこみます',    romaji:'uri komimasu',      en:'sell into / push into market' },
        { jp:'よびおこします',  romaji:'yobi okoshimasu',   en:'wake by calling / call up' },
        { jp:'はたらきかけます',romaji:'hataraki kakemasu', en:'approach / work on (s.o.)' },
        { jp:'いいのがします',  romaji:'ii nogashimasu',    en:'miss saying / let slip' },
        { jp:'ひきつけます',    romaji:'hiki tsukemasu',    en:'attract / draw in' },
        { jp:'うちあけます',    romaji:'uchi akemasu',      en:'confide / open up' },
        { jp:'おもいきります',  romaji:'omoi kirimasu',     en:'make up one\'s mind / go for it' },
      ]
    },
    {
      ch: 3, title: '文型 — 条件・逆接',
      topic: 'Grammar Patterns: Conditional & Contrast',
      words: [
        { jp:'〜にしても〜にしても',romaji:'~ni shite mo ~ni shite mo',en:'whether ~ or ~' },
        { jp:'〜としても',      romaji:'~to shite mo',      en:'even if ~ / even assuming ~' },
        { jp:'〜どころか',      romaji:'~doko roku ka',     en:'far from ~ / not only ~ but' },
        { jp:'〜わりに（は）',  romaji:'~wari ni (wa)',      en:'for ~ / considering ~' },
        { jp:'〜とはいえ',      romaji:'~to wa ie',         en:'even so / nevertheless' },
        { jp:'〜くせに',        romaji:'~kuse ni',          en:'even though (disapproving)' },
        { jp:'〜ながら（も）',  romaji:'~nagara (mo)',      en:'while / although' },
        { jp:'〜においても',    romaji:'~ni oite mo',       en:'even in ~ / also in ~' },
        { jp:'〜うえ（に）',    romaji:'~ue (ni)',           en:'in addition / on top of that' },
        { jp:'〜ばかりか',      romaji:'~bakari ka',        en:'not only ~ but also ~' },
        { jp:'〜のみならず',    romaji:'~nomi narazu',      en:'not only ~ (formal)' },
        { jp:'〜はもとより',    romaji:'~wa moto yori',     en:'let alone ~ / not to mention ~' },
      ]
    },
    {
      ch: 4, title: '文型 — 限定・程度',
      topic: 'Grammar Patterns: Limitation & Degree',
      words: [
        { jp:'〜かぎり',        romaji:'~kagiri',           en:'as long as ~ / as far as ~' },
        { jp:'〜にかぎって',    romaji:'~ni kagitte',       en:'precisely when ~ / only ~' },
        { jp:'〜かぎり（では）',romaji:'~kagiri (de wa)',    en:'as far as ~ / within the limits of ~' },
        { jp:'〜にかぎらず',    romaji:'~ni kagirazu',      en:'not limited to ~' },
        { jp:'〜さえ',          romaji:'~sae',              en:'even ~ / only ~' },
        { jp:'〜だけ',          romaji:'~dake',             en:'only ~ / just ~' },
        { jp:'〜だけあって',    romaji:'~dake atte',        en:'just as you would expect from ~' },
        { jp:'〜ほど',          romaji:'~hodo',             en:'to the extent that ~ / as ~ as' },
        { jp:'〜ほど〜ない',    romaji:'~hodo ~nai',        en:'not as ~ as ~' },
        { jp:'〜くらい（ぐらい）',romaji:'~kurai (gurai)',  en:'about ~ / approximately' },
        { jp:'〜ばかり',        romaji:'~bakari',           en:'only ~ / nothing but ~' },
        { jp:'〜のみ',          romaji:'~nomi',             en:'only ~ (formal)' },
      ]
    },
    {
      ch: 5, title: '文型 — 変化・様態',
      topic: 'Grammar Patterns: Change & Appearance',
      words: [
        { jp:'〜にしたがって',  romaji:'~ni shitagatte',    en:'as ~ / following ~ / in accordance with ~' },
        { jp:'〜にともなって',  romaji:'~ni tomonatte',     en:'along with ~ / accompanying ~' },
        { jp:'〜につれて',      romaji:'~ni tsurete',       en:'as ~ / in proportion to ~' },
        { jp:'〜によって',      romaji:'~ni yotte',         en:'depending on ~ / by means of ~' },
        { jp:'〜をつうじて',    romaji:'~wo tsuujite',      en:'through ~ / throughout ~' },
        { jp:'〜にかけて',      romaji:'~ni kakete',        en:'over a period of ~ / throughout ~' },
        { jp:'〜にわたって',    romaji:'~ni watatte',       en:'over ~ / spanning ~' },
        { jp:'〜にそって',      romaji:'~ni sotte',         en:'along ~ / in line with ~' },
        { jp:'〜にしたがい',    romaji:'~ni shitagai',      en:'in accordance with ~ (formal)' },
        { jp:'〜ようになります',romaji:'~you ni narimasu',  en:'come to ~ / reach the point where ~' },
        { jp:'〜ようにします',  romaji:'~you ni shimasu',   en:'make sure to ~ / try to ~' },
      ]
    },
    {
      ch: 6, title: '敬語 — 尊敬語・謙譲語',
      topic: 'Keigo: Respectful & Humble Speech',
      words: [
        { jp:'おっしゃいます',  romaji:'osshaimasu',        en:'say (respectful)' },
        { jp:'おいでになります',romaji:'oide ni narimasu',  en:'be / go / come (respectful)' },
        { jp:'いらっしゃいます',romaji:'irasshaimasu',      en:'be / go / come (respectful)' },
        { jp:'ごらんになります',romaji:'goran ni narimasu', en:'look / see (respectful)' },
        { jp:'めしあがります',  romaji:'meshiagarimasu',    en:'eat / drink (respectful)' },
        { jp:'もうします',      romaji:'moushimasu',        en:'say / am called (humble)' },
        { jp:'まいります',      romaji:'mairimasu',         en:'go / come (humble)' },
        { jp:'おります',        romaji:'orimasu',           en:'be (humble)' },
        { jp:'いたします',      romaji:'itashimasu',        en:'do (humble)' },
        { jp:'はいけんします',  romaji:'haiken shimasu',    en:'look at / see (humble)' },
        { jp:'いただきます',    romaji:'itadakimasu',       en:'receive / eat / drink (humble)' },
        { jp:'さしあげます',    romaji:'sashiagemasu',      en:'give (humble)' },
        { jp:'うかがいます',    romaji:'ukagaimasu',        en:'visit / hear / ask (humble)' },
        { jp:'ぞんじます',      romaji:'zonjimasu',         en:'know (humble)' },
      ]
    },
    {
      ch: 7, title: '読解語彙 — 社会・経済',
      topic: 'Reading Vocabulary: Society & Economy',
      words: [
        { jp:'こうれいか',      romaji:'koureika',          en:'aging / becoming older (society)' },
        { jp:'しょうしか',      romaji:'shoushika',         en:'declining birthrate' },
        { jp:'きんろうしゃ',    romaji:'kinrousha',         en:'worker / working person' },
        { jp:'きんろう',        romaji:'kinrou',            en:'labour / work' },
        { jp:'しつぎょう',      romaji:'shitsugyou',        en:'unemployment' },
        { jp:'こよう',          romaji:'koyou',             en:'employment' },
        { jp:'しょとく',        romaji:'shotoku',           en:'income' },
        { jp:'ぶっか',          romaji:'bukka',             en:'prices of goods' },
        { jp:'けいき',          romaji:'keiki',             en:'economic climate / business conditions' },
        { jp:'ふきょう',        romaji:'fukyou',            en:'recession / depression' },
        { jp:'こうきょう',      romaji:'koukyou',           en:'boom / prosperity' },
        { jp:'ぼうえき',        romaji:'boueki',            en:'trade (import/export)' },
        { jp:'ゆしゅつ',        romaji:'yushutsu',          en:'export' },
        { jp:'ゆにゅう',        romaji:'yunyuu',            en:'import' },
        { jp:'きぎょう',        romaji:'kigyou',            en:'enterprise / company' },
      ]
    },
    {
      ch: 8, title: '読解語彙 — 科学・技術',
      topic: 'Reading Vocabulary: Science & Technology',
      words: [
        { jp:'ぎじゅつ',        romaji:'gijutsu',           en:'technology / technique' },
        { jp:'かがく',          romaji:'kagaku',            en:'science / chemistry' },
        { jp:'じっけん',        romaji:'jikken',            en:'experiment' },
        { jp:'けんきゅう',      romaji:'kenkyuu',           en:'research' },
        { jp:'はっけん',        romaji:'hakken',            en:'discovery' },
        { jp:'はつめい',        romaji:'hatsumei',          en:'invention' },
        { jp:'かいはつ',        romaji:'kaihatsu',          en:'development / R&D' },
        { jp:'じんこうちのう',  romaji:'jinkou chinou',     en:'artificial intelligence (AI)' },
        { jp:'データ',          romaji:'deeta',             en:'data' },
        { jp:'アルゴリズム',    romaji:'arugoritsumu',      en:'algorithm' },
        { jp:'ネットワーク',    romaji:'nettowaaaku',       en:'network' },
        { jp:'デジタル',        romaji:'dejitaru',          en:'digital' },
        { jp:'アナログ',        romaji:'anarogu',           en:'analogue' },
        { jp:'じどうか',        romaji:'jidouka',           en:'automation' },
        { jp:'かくしん',        romaji:'kakushin',          en:'innovation / reform' },
      ]
    }
  ],

  /* ════════════════════════════════════════════════════════
     N1 — Nihongo Somatome N1  (8 topic chapters)
     ════════════════════════════════════════════════════════ */
  N1: [
    {
      ch: 1, title: '副詞・文章語',
      topic: 'Advanced Adverbs & Literary Vocabulary',
      words: [
        { jp:'おのずから',      romaji:'onozukara',         en:'naturally / by itself' },
        { jp:'いたって',        romaji:'itatte',            en:'extremely / very much' },
        { jp:'すこぶる',        romaji:'sukoburu',          en:'greatly / exceedingly' },
        { jp:'あいにく',        romaji:'ainiku',            en:'unfortunately' },
        { jp:'かたや',          romaji:'kata ya',           en:'on the other hand (literary)' },
        { jp:'しかるに',        romaji:'shikaru ni',        en:'however (literary)' },
        { jp:'なお',            romaji:'nao',               en:'furthermore / still / note that' },
        { jp:'ただし',          romaji:'tadashi',           en:'however / provided that' },
        { jp:'もっとも',        romaji:'mottomo',           en:'that said / however / most' },
        { jp:'あるいは',        romaji:'arui wa',           en:'or / perhaps' },
        { jp:'あながち〜ない',  romaji:'anagachi ~nai',     en:'not necessarily ~' },
        { jp:'あながち',        romaji:'anagachi',          en:'altogether / unconditionally' },
        { jp:'かろうじて',      romaji:'karoujite',         en:'barely / narrowly' },
        { jp:'ほうじて',        romaji:'houjite',           en:'duly / as expected' },
      ]
    },
    {
      ch: 2, title: '複合語・派生語',
      topic: 'Compound & Derived Words',
      words: [
        { jp:'むとんちゃく（な）',romaji:'mutonchaku (na)', en:'indifferent / unconcerned' },
        { jp:'ふてぶてしい',    romaji:'futebute shii',     en:'brazen / shameless' },
        { jp:'さしでがましい',  romaji:'sashide gamashii',  en:'presumptuous / meddlesome' },
        { jp:'もったいない',    romaji:'mottainai',         en:'wasteful / too good to waste' },
        { jp:'いたたまれない',  romaji:'ita tamarenai',     en:'can\'t bear to stay / unbearable' },
        { jp:'とりとめない',    romaji:'toritori menai',    en:'incoherent / rambling' },
        { jp:'なおざり（な）',  romaji:'naozari (na)',      en:'neglectful / careless' },
        { jp:'おざなり（な）',  romaji:'ozanari (na)',      en:'perfunctory / half-hearted' },
        { jp:'やむにやまれぬ',  romaji:'yamu ni yamarenou', en:'compelling / unavoidable' },
        { jp:'おもいがけない',  romaji:'omoi ga kenai',     en:'unexpected / unforeseen' },
        { jp:'かけがえのない',  romaji:'kakegae no nai',    en:'irreplaceable / invaluable' },
        { jp:'ゆるぎない',      romaji:'yurugi nai',        en:'unshakeable / firm' },
      ]
    },
    {
      ch: 3, title: '文型 — 強調・主張',
      topic: 'Grammar Patterns: Emphasis & Assertion',
      words: [
        { jp:'〜にほかならない',romaji:'~ni hoka naranai',  en:'nothing but ~ / none other than ~' },
        { jp:'〜にすぎない',    romaji:'~ni suginai',       en:'merely ~ / nothing more than ~' },
        { jp:'〜こそ',          romaji:'~koso',             en:'(emphatic) precisely ~ / it is ~ that' },
        { jp:'〜からこそ',      romaji:'~kara koso',        en:'precisely because ~' },
        { jp:'〜てこそ',        romaji:'~te koso',          en:'only by doing ~ / it is only when ~' },
        { jp:'〜といったらない',romaji:'~to ittara nai',    en:'extremely ~ / cannot be more ~' },
        { jp:'〜というものだ',  romaji:'~to iu mono da',    en:'that\'s the way ~ is / that is what ~ means' },
        { jp:'〜というものではない',romaji:'~to iu mono de wa nai',en:'it\'s not that ~ / that doesn\'t mean ~' },
        { jp:'〜ものだ',        romaji:'~mono da',          en:'(natural) that\'s how it is / used to ~' },
        { jp:'〜ものではない',  romaji:'~mono de wa nai',   en:'one shouldn\'t ~ / it\'s not right to ~' },
        { jp:'〜ものがある',    romaji:'~mono ga aru',      en:'there is a sense that ~ / undeniably ~' },
      ]
    },
    {
      ch: 4, title: '文型 — 理由・原因',
      topic: 'Grammar Patterns: Cause & Reason',
      words: [
        { jp:'〜ゆえに',        romaji:'~yue ni',           en:'therefore ~ / because of ~ (literary)' },
        { jp:'〜がゆえに',      romaji:'~ga yue ni',        en:'precisely because ~ (literary)' },
        { jp:'〜に起因する',    romaji:'~ni kiin suru',      en:'be caused by ~ / stem from ~' },
        { jp:'〜に基づいて',    romaji:'~ni motozu ite',    en:'based on ~ / grounded in ~' },
        { jp:'〜をきっかけに',  romaji:'~wo kikkake ni',    en:'using ~ as a trigger / triggered by ~' },
        { jp:'〜を契機に',      romaji:'~wo keiki ni',      en:'taking ~ as an opportunity' },
        { jp:'〜の末（に）',    romaji:'~no sue (ni)',       en:'after ~ / as a result of ~' },
        { jp:'〜あげく（に）',  romaji:'~ageku (ni)',        en:'after much ~ / in the end (negative)' },
        { jp:'〜てはじめて',    romaji:'~te hajimete',      en:'only after doing ~ / not until ~' },
        { jp:'〜をもとに（して）',romaji:'~wo moto ni shite',en:'based on ~ / drawing from ~' },
        { jp:'〜に照らして',    romaji:'~ni terashite',     en:'in light of ~ / judged by ~' },
      ]
    },
    {
      ch: 5, title: '文型 — 評価・判断',
      topic: 'Grammar Patterns: Evaluation & Judgement',
      words: [
        { jp:'〜にたえない',    romaji:'~ni taenai',        en:'cannot bear ~ / unbearable' },
        { jp:'〜にたえる',      romaji:'~ni taeru',         en:'worth ~ing / stand up to ~' },
        { jp:'〜にたりない',    romaji:'~ni tarinai',       en:'not worth ~ / beneath ~' },
        { jp:'〜にかなう',      romaji:'~ni kanau',         en:'meet ~ / suit ~' },
        { jp:'〜にそわない',    romaji:'~ni sowanai',       en:'not in keeping with ~ / not meet ~' },
        { jp:'〜ざるをえない',  romaji:'~zaru wo enai',     en:'cannot help but ~ / have no choice but ~' },
        { jp:'〜をよぎなくされる',romaji:'~wo yoginaku sareru',en:'be compelled to ~ / be forced to ~' },
        { jp:'〜かねない',      romaji:'~kanenai',          en:'might well ~ / could easily ~' },
        { jp:'〜かねる',        romaji:'~kaneru',           en:'find it difficult to ~ / can\'t bring oneself to ~' },
        { jp:'〜ないではいられない',romaji:'~nai de wa irarenai',en:'cannot help but ~ / can\'t stop ~ing' },
        { jp:'〜ずにはいられない',romaji:'~zu ni wa irarenai',en:'cannot help but ~ (literary)' },
      ]
    },
    {
      ch: 6, title: '語彙 — 政治・法律',
      topic: 'Vocabulary: Politics & Law',
      words: [
        { jp:'こっかい',        romaji:'kokkai',            en:'National Diet / Parliament' },
        { jp:'ぎかい',          romaji:'gikai',             en:'parliament / legislature' },
        { jp:'ないかく',        romaji:'naikaku',           en:'cabinet' },
        { jp:'せいさく',        romaji:'seisaku',           en:'policy / measure' },
        { jp:'はっき',          romaji:'hakki',             en:'display / exercise (of ability)' },
        { jp:'ほうあん',        romaji:'houan',             en:'bill (proposed law)' },
        { jp:'さいばん',        romaji:'saiban',            en:'trial / judicial proceedings' },
        { jp:'はんけつ',        romaji:'hanketsu',          en:'verdict / judgement' },
        { jp:'そしょう',        romaji:'soshou',            en:'lawsuit' },
        { jp:'べんご',          romaji:'bengo',             en:'defence (legal)' },
        { jp:'べんごし',        romaji:'bengoshi',          en:'lawyer / attorney' },
        { jp:'ひこく',          romaji:'hikoku',            en:'defendant' },
        { jp:'げんこく',        romaji:'genkoku',           en:'plaintiff' },
        { jp:'しょうこ',        romaji:'shouko',            en:'evidence / proof' },
        { jp:'むざい',          romaji:'muzai',             en:'not guilty' },
        { jp:'ゆうざい',        romaji:'yuzai',             en:'guilty' },
      ]
    },
    {
      ch: 7, title: '語彙 — 心理・哲学',
      topic: 'Vocabulary: Psychology & Philosophy',
      words: [
        { jp:'こころ',          romaji:'kokoro',            en:'heart / mind / soul' },
        { jp:'いしき',          romaji:'ishiki',            en:'consciousness / awareness' },
        { jp:'むいしき',        romaji:'muishiki',          en:'unconscious / subconscious' },
        { jp:'ほんのう',        romaji:'honnou',            en:'instinct' },
        { jp:'りせい',          romaji:'risei',             en:'reason / rationality' },
        { jp:'かんせい',        romaji:'kansei',            en:'sensibility / sensitivity' },
        { jp:'じゅんすい（な）',romaji:'junsui (na)',        en:'pure / innocent' },
        { jp:'そんざい',        romaji:'sonzai',            en:'existence / being' },
        { jp:'かちかん',        romaji:'kachikan',          en:'values / sense of values' },
        { jp:'せかいかん',      romaji:'sekaikan',          en:'worldview / Weltanschauung' },
        { jp:'じんせいかん',    romaji:'jinseikan',         en:'view of life / philosophy of life' },
        { jp:'ほんしつ',        romaji:'honshitsu',         en:'essence / nature' },
        { jp:'げんしょう',      romaji:'genshou',           en:'phenomenon' },
        { jp:'しかく',          romaji:'shikaku',           en:'perspective / viewpoint' },
      ]
    },
    {
      ch: 8, title: '語彙 — 文学・芸術',
      topic: 'Vocabulary: Literature & Arts',
      words: [
        { jp:'さくひん',        romaji:'sakuhin',           en:'work (of art/literature)' },
        { jp:'げんさく',        romaji:'gensaku',           en:'original work' },
        { jp:'ちょしゃ',        romaji:'chosha',            en:'author / writer' },
        { jp:'ぶんたい',        romaji:'buntai',            en:'writing style' },
        { jp:'ひゆ',            romaji:'hiyu',              en:'metaphor' },
        { jp:'ぎじんほう',      romaji:'gijin hou',         en:'personification' },
        { jp:'ひかく',          romaji:'hikaku',            en:'comparison' },
        { jp:'えんきょく（な）',romaji:'enkyoku (na)',       en:'indirect / euphemistic' },
        { jp:'ちょくせつてき（な）',romaji:'chokusetsuteki (na)',en:'direct' },
        { jp:'ひょうげん',      romaji:'hyougen',           en:'expression' },
        { jp:'かんかく',        romaji:'kankaku',           en:'sense / sensation / feeling' },
        { jp:'びてき（な）',    romaji:'biteki (na)',        en:'aesthetic' },
        { jp:'そうぞう',        romaji:'souzou',            en:'imagination / creation' },
        { jp:'かんどう',        romaji:'kandou',            en:'deep emotion / moving' },
        { jp:'きょうかん',      romaji:'kyoukan',           en:'empathy / sympathy' },
      ]
    }
  ]
};

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
        background:#22c55e; border-radius:2px;
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
      .nzcv-lvl-N5  { color:#22c55e; }
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
    const chapters = NZChapterData[activeLevel] || [];
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
    const chapters = NZChapterData[activeLevel] || [];
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
            ${activeChapter>=(NZChapterData[activeLevel]||[]).length-1?'disabled style="opacity:0.3;pointer-events:none;"':''}>
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
      const chapters = NZChapterData[activeLevel] || [];
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
