/* ================================================================
   NihongoZen — nz-vocab-module.js  (UPDATED)
   N5 Vocabulary from Minna no Nihongo I (Lessons 0–25)
   Chapter 0 has three expandable sub-sections:
     • Classroom Introduction
     • Daily Greetings
     • Numbers
   Lessons 1–25 each appear as a chapter button.
================================================================ */
'use strict';

/* ── NEW N5 DATA from vocab_n5_all ─────────────────────────── */
var NZ_N5_DATA = {
  lessons: [
    {
      lesson: 0,
      title: "予備課 – Preliminary Lesson",
      classroomIntro: [
        { kanji: "始めましょう",          hiragana: "はじめましょう",          en: "Let's begin." },
        { kanji: "終わりましょう",        hiragana: "おわりましょう",          en: "Let's finish the lesson." },
        { kanji: "休みましょう",          hiragana: "やすみましょう",          en: "Let's take a break." },
        { kanji: "分かりますか",          hiragana: "わかりますか",            en: "Do you understand?" },
        { kanji: "はい、分かります",      hiragana: "はい、わかります",        en: "Yes, I do." },
        { kanji: "いいえ、分かりません",  hiragana: "いいえ、わかりません",    en: "No, I don't." },
        { kanji: "もう一度",              hiragana: "もういちど",               en: "Once more." },
        { kanji: "結構です",              hiragana: "けっこうです",             en: "Fine; good." },
        { kanji: "駄目です",              hiragana: "だめです",                 en: "That's not OK; that's wrong." },
        { kanji: "名前",                  hiragana: "なまえ",                   en: "name" },
        { kanji: "試験",                  hiragana: "しけん",                   en: "exam" },
        { kanji: "宿題",                  hiragana: "しゅくだい",               en: "homework" },
        { kanji: "質問",                  hiragana: "しつもん",                 en: "question" },
        { kanji: "答え",                  hiragana: "こたえ",                   en: "answer" },
        { kanji: "例",                    hiragana: "れい",                     en: "example" },
      ],
      dailyGreetings: [
        { kanji: "お早うございます",      hiragana: "おはようございます",       en: "Good morning." },
        { kanji: "今日は",                hiragana: "こんにちは",               en: "Good afternoon." },
        { kanji: "今晩は",                hiragana: "こんばんは",               en: "Good evening." },
        { kanji: "お休みなさい",          hiragana: "おやすみなさい",           en: "Good night." },
        { kanji: "さようなら",            hiragana: "さようなら",               en: "Good-bye." },
        { kanji: "ありがとうございます",  hiragana: "ありがとうございます",     en: "Thank you very much." },
        { kanji: "すみません",            hiragana: "すみません",               en: "Excuse me; I'm sorry." },
        { kanji: "お願いします",          hiragana: "おねがいします",           en: "Please." },
      ],
      numbers: [
        { kanji: "零 / れい",  hiragana: "ぜろ、れい",      en: "0" },
        { kanji: "一",         hiragana: "いち",             en: "1" },
        { kanji: "二",         hiragana: "に",               en: "2" },
        { kanji: "三",         hiragana: "さん",             en: "3" },
        { kanji: "四",         hiragana: "よん、し",         en: "4" },
        { kanji: "五",         hiragana: "ご",               en: "5" },
        { kanji: "六",         hiragana: "ろく",             en: "6" },
        { kanji: "七",         hiragana: "なな、しち",       en: "7" },
        { kanji: "八",         hiragana: "はち",             en: "8" },
        { kanji: "九",         hiragana: "きゅう、く",       en: "9" },
        { kanji: "十",         hiragana: "じゅう",           en: "10" },
      ]
    },
    { lesson: 1,  title: "第1課 – Introductions & People",    vocab: [{ kanji:"わたし",hiragana:"",en:"I" },{ kanji:"わたしたち",hiragana:"",en:"we" },{ kanji:"あなた",hiragana:"",en:"you" },{ kanji:"あの人(あのひと)",hiragana:"",en:"that person; he/she" },{ kanji:"あの方(あのかた)",hiragana:"",en:"that person (polite)" },{ kanji:"皆さん(みなさん)",hiragana:"",en:"everyone; all of you" },{ kanji:"〜さん",hiragana:"",en:"Mr./Ms. (polite title)" },{ kanji:"〜ちゃん",hiragana:"",en:"suffix for children" },{ kanji:"〜くん",hiragana:"",en:"suffix for boys/young males" },{ kanji:"〜人(〜じん)",hiragana:"",en:"nationality suffix" },{ kanji:"先生(せんせい)",hiragana:"",en:"teacher; instructor" },{ kanji:"教師(きょうし)",hiragana:"",en:"teacher (profession)" },{ kanji:"学生(がくせい)",hiragana:"",en:"student" },{ kanji:"会社員(かいしゃいん)",hiragana:"",en:"company employee" },{ kanji:"社員(しゃいん)",hiragana:"",en:"company staff" },{ kanji:"銀行員(ぎんこういん)",hiragana:"",en:"bank employee" },{ kanji:"医者(いしゃ)",hiragana:"",en:"doctor" },{ kanji:"研究者(けんきゅうしゃ)",hiragana:"",en:"researcher" },{ kanji:"エンジニア",hiragana:"",en:"engineer" },{ kanji:"大学(だいがく)",hiragana:"",en:"university" },{ kanji:"病院(びょういん)",hiragana:"",en:"hospital" },{ kanji:"電気(でんき)",hiragana:"",en:"electricity; light" },{ kanji:"誰(だれ)",hiragana:"",en:"who" },{ kanji:"どなた",hiragana:"",en:"who (polite)" },{ kanji:"〜歳(〜さい)",hiragana:"",en:"~ years old" },{ kanji:"何歳(なんさい)",hiragana:"",en:"how old" },{ kanji:"おいくつ",hiragana:"",en:"how old (polite)" },{ kanji:"はい",hiragana:"",en:"yes" },{ kanji:"いいえ",hiragana:"",en:"no" },{ kanji:"失礼ですが(しつれいですが)",hiragana:"",en:"excuse me, but" },{ kanji:"お名前は?(おなまえは)",hiragana:"",en:"what is your name?" },{ kanji:"はじめまして",hiragana:"",en:"nice to meet you" },{ kanji:"どうぞよろしく(お願いします)",hiragana:"",en:"pleased to meet you" },{ kanji:"こちらは〜さんです",hiragana:"",en:"this is Mr./Ms. ~" },{ kanji:"〜から来ました(きました)",hiragana:"",en:"I am from ~" }] },
    { lesson: 2,  title: "第2課 – Objects & Things",          vocab: [{ kanji:"これ",hiragana:"",en:"this (near speaker)" },{ kanji:"それ",hiragana:"",en:"that (near listener)" },{ kanji:"あれ",hiragana:"",en:"that (over there)" },{ kanji:"この〜",hiragana:"",en:"this ~" },{ kanji:"その〜",hiragana:"",en:"that ~" },{ kanji:"あの〜",hiragana:"",en:"that ~ over there" },{ kanji:"本(ほん)",hiragana:"",en:"book" },{ kanji:"辞書(じしょ)",hiragana:"",en:"dictionary" },{ kanji:"雑誌(ざっし)",hiragana:"",en:"magazine" },{ kanji:"新聞(しんぶん)",hiragana:"",en:"newspaper" },{ kanji:"ノート",hiragana:"",en:"notebook" },{ kanji:"手帳(てちょう)",hiragana:"",en:"pocket notebook" },{ kanji:"名刺(めいし)",hiragana:"",en:"business card" },{ kanji:"カード",hiragana:"",en:"card" },{ kanji:"テレホンカード",hiragana:"",en:"telephone card" },{ kanji:"鉛筆(えんぴつ)",hiragana:"",en:"pencil" },{ kanji:"ボールペン",hiragana:"",en:"ballpoint pen" },{ kanji:"シャープペンシル",hiragana:"",en:"mechanical pencil" },{ kanji:"鍵(かぎ)",hiragana:"",en:"key" },{ kanji:"時計(とけい)",hiragana:"",en:"watch; clock" },{ kanji:"傘(かさ)",hiragana:"",en:"umbrella" },{ kanji:"鞄(かばん)",hiragana:"",en:"bag; briefcase" },{ kanji:"テレビ",hiragana:"",en:"television" },{ kanji:"ラジオ",hiragana:"",en:"radio" },{ kanji:"カメラ",hiragana:"",en:"camera" },{ kanji:"コンピューター",hiragana:"",en:"computer" },{ kanji:"自動車(じどうしゃ)",hiragana:"",en:"car; automobile" },{ kanji:"机(つくえ)",hiragana:"",en:"desk" },{ kanji:"椅子(いす)",hiragana:"",en:"chair" },{ kanji:"コーヒー",hiragana:"",en:"coffee" },{ kanji:"英語(えいご)",hiragana:"",en:"English (language)" },{ kanji:"日本語(にほんご)",hiragana:"",en:"Japanese (language)" },{ kanji:"何(なん)",hiragana:"",en:"what" },{ kanji:"そう",hiragana:"",en:"so; that's right" },{ kanji:"違います(ちがいます)",hiragana:"",en:"that is not correct" },{ kanji:"そうですか",hiragana:"",en:"I see; is that so" },{ kanji:"あのう",hiragana:"",en:"well; um (hesitation)" }] },
    { lesson: 3,  title: "第3課 – Places & Shopping",         vocab: [{ kanji:"ここ",hiragana:"",en:"here" },{ kanji:"そこ",hiragana:"",en:"there (near listener)" },{ kanji:"あそこ",hiragana:"",en:"over there" },{ kanji:"どこ",hiragana:"",en:"where" },{ kanji:"こちら",hiragana:"",en:"this way; here (polite)" },{ kanji:"そちら",hiragana:"",en:"that way (polite)" },{ kanji:"あちら",hiragana:"",en:"over there (polite)" },{ kanji:"どちら",hiragana:"",en:"which way; where (polite)" },{ kanji:"教室(きょうしつ)",hiragana:"",en:"classroom" },{ kanji:"食堂(しょくどう)",hiragana:"",en:"dining hall; cafeteria" },{ kanji:"事務所(じむしょ)",hiragana:"",en:"office" },{ kanji:"会議室(かいぎしつ)",hiragana:"",en:"meeting room" },{ kanji:"受付(うけつけ)",hiragana:"",en:"reception desk" },{ kanji:"ロビー",hiragana:"",en:"lobby" },{ kanji:"部屋(へや)",hiragana:"",en:"room" },{ kanji:"トイレ(お手洗い)",hiragana:"",en:"toilet; restroom" },{ kanji:"階段(かいだん)",hiragana:"",en:"stairs" },{ kanji:"エレベーター",hiragana:"",en:"elevator" },{ kanji:"エスカレーター",hiragana:"",en:"escalator" },{ kanji:"会社(かいしゃ)",hiragana:"",en:"company" },{ kanji:"家(うち)",hiragana:"",en:"home; house" },{ kanji:"電話(でんわ)",hiragana:"",en:"telephone" },{ kanji:"靴(くつ)",hiragana:"",en:"shoes" },{ kanji:"ネクタイ",hiragana:"",en:"necktie" },{ kanji:"ワイン",hiragana:"",en:"wine" },{ kanji:"たばこ",hiragana:"",en:"cigarette; tobacco" },{ kanji:"売り場(うりば)",hiragana:"",en:"sales floor; counter" },{ kanji:"地下(ちか)",hiragana:"",en:"basement" },{ kanji:"〜階(〜かい)",hiragana:"",en:"floor (e.g., 2nd floor)" },{ kanji:"何階(なんがい)",hiragana:"",en:"what floor" },{ kanji:"〜円(〜えん)",hiragana:"",en:"yen" },{ kanji:"いくら",hiragana:"",en:"how much" },{ kanji:"百(ひゃく)",hiragana:"",en:"hundred" },{ kanji:"千(せん)",hiragana:"",en:"thousand" },{ kanji:"万(まん)",hiragana:"",en:"ten thousand" },{ kanji:"すみません",hiragana:"",en:"excuse me; sorry" },{ kanji:"見せてください(みせてください)",hiragana:"",en:"please show me" },{ kanji:"じゃ",hiragana:"",en:"well then" },{ kanji:"ください",hiragana:"",en:"please give me" }] },
    { lesson: 4,  title: "第4課 – Time & Daily Routine",      vocab: [{ kanji:"起きます(おきます)",hiragana:"",en:"wake up" },{ kanji:"寝ます(ねます)",hiragana:"",en:"sleep; go to bed" },{ kanji:"働きます(はたらきます)",hiragana:"",en:"work" },{ kanji:"休みます(やすみます)",hiragana:"",en:"rest; take a day off" },{ kanji:"勉強します(べんきょうします)",hiragana:"",en:"study" },{ kanji:"終わります(おわります)",hiragana:"",en:"finish" },{ kanji:"今(いま)",hiragana:"",en:"now" },{ kanji:"〜時(〜じ)",hiragana:"",en:"o'clock" },{ kanji:"〜分(〜ふん)",hiragana:"",en:"minute" },{ kanji:"半(はん)",hiragana:"",en:"half past" },{ kanji:"何時(なんじ)",hiragana:"",en:"what time" },{ kanji:"何分(なんぷん)",hiragana:"",en:"what minute" },{ kanji:"午前(ごぜん)",hiragana:"",en:"a.m." },{ kanji:"午後(ごご)",hiragana:"",en:"p.m." },{ kanji:"朝(あさ)",hiragana:"",en:"morning" },{ kanji:"昼(ひる)",hiragana:"",en:"daytime; noon" },{ kanji:"晩/夜(ばん/よる)",hiragana:"",en:"evening; night" },{ kanji:"おととい",hiragana:"",en:"day before yesterday" },{ kanji:"昨日(きのう)",hiragana:"",en:"yesterday" },{ kanji:"今日(きょう)",hiragana:"",en:"today" },{ kanji:"明日(あした)",hiragana:"",en:"tomorrow" },{ kanji:"明後日(あさって)",hiragana:"",en:"day after tomorrow" },{ kanji:"今朝(けさ)",hiragana:"",en:"this morning" },{ kanji:"今晩(こんばん)",hiragana:"",en:"tonight" },{ kanji:"休み(やすみ)",hiragana:"",en:"holiday; day off" },{ kanji:"毎朝(まいあさ)",hiragana:"",en:"every morning" },{ kanji:"毎晩(まいばん)",hiragana:"",en:"every night" },{ kanji:"毎日(まいにち)",hiragana:"",en:"every day" },{ kanji:"月曜日(げつようび)",hiragana:"",en:"Monday" },{ kanji:"火曜日(かようび)",hiragana:"",en:"Tuesday" },{ kanji:"水曜日(すいようび)",hiragana:"",en:"Wednesday" },{ kanji:"木曜日(もくようび)",hiragana:"",en:"Thursday" },{ kanji:"金曜日(きんようび)",hiragana:"",en:"Friday" },{ kanji:"土曜日(どようび)",hiragana:"",en:"Saturday" },{ kanji:"日曜日(にちようび)",hiragana:"",en:"Sunday" },{ kanji:"〜から",hiragana:"",en:"from ~" },{ kanji:"〜まで",hiragana:"",en:"until ~" },{ kanji:"えーと",hiragana:"",en:"well; let me see" },{ kanji:"かしこまりました",hiragana:"",en:"certainly; understood (polite)" }] },
    { lesson: 5,  title: "第5課 – Movement & Travel",         vocab: [{ kanji:"行きます(いきます)",hiragana:"",en:"go" },{ kanji:"来ます(きます)",hiragana:"",en:"come" },{ kanji:"帰ります(かえります)",hiragana:"",en:"return; go home" },{ kanji:"学校(がっこう)",hiragana:"",en:"school" },{ kanji:"スーパー",hiragana:"",en:"supermarket" },{ kanji:"駅(えき)",hiragana:"",en:"station" },{ kanji:"飛行機(ひこうき)",hiragana:"",en:"airplane" },{ kanji:"船(ふね)",hiragana:"",en:"ship; boat" },{ kanji:"電車(でんしゃ)",hiragana:"",en:"train" },{ kanji:"地下鉄(ちかてつ)",hiragana:"",en:"subway" },{ kanji:"新幹線(しんかんせん)",hiragana:"",en:"Shinkansen; bullet train" },{ kanji:"バス",hiragana:"",en:"bus" },{ kanji:"タクシー",hiragana:"",en:"taxi" },{ kanji:"自転車(じてんしゃ)",hiragana:"",en:"bicycle" },{ kanji:"歩いて(あるいて)",hiragana:"",en:"on foot" },{ kanji:"人(ひと)",hiragana:"",en:"person; people" },{ kanji:"友達(ともだち)",hiragana:"",en:"friend" },{ kanji:"彼(かれ)",hiragana:"",en:"he; boyfriend" },{ kanji:"彼女(かのじょ)",hiragana:"",en:"she; girlfriend" },{ kanji:"家族(かぞく)",hiragana:"",en:"family" },{ kanji:"一人で(ひとりで)",hiragana:"",en:"alone; by oneself" },{ kanji:"先週(せんしゅう)",hiragana:"",en:"last week" },{ kanji:"今週(こんしゅう)",hiragana:"",en:"this week" },{ kanji:"来週(らいしゅう)",hiragana:"",en:"next week" },{ kanji:"去年(きょねん)",hiragana:"",en:"last year" },{ kanji:"今年(ことし)",hiragana:"",en:"this year" },{ kanji:"来年(らいねん)",hiragana:"",en:"next year" },{ kanji:"〜月(〜がつ)",hiragana:"",en:"~ month" },{ kanji:"いつ",hiragana:"",en:"when" },{ kanji:"誕生日(たんじょうび)",hiragana:"",en:"birthday" },{ kanji:"どういたしまして",hiragana:"",en:"you're welcome" }] },
    { lesson: 6,  title: "第6課 – Daily Activities",          vocab: [{ kanji:"食べます(たべます)",hiragana:"",en:"eat" },{ kanji:"飲みます(のみます)",hiragana:"",en:"drink" },{ kanji:"吸います(すいます)",hiragana:"",en:"smoke" },{ kanji:"見ます(みます)",hiragana:"",en:"see; watch" },{ kanji:"聞きます(ききます)",hiragana:"",en:"hear; listen" },{ kanji:"読みます(よみます)",hiragana:"",en:"read" },{ kanji:"書きます(かきます)",hiragana:"",en:"write" },{ kanji:"買います(かいます)",hiragana:"",en:"buy" },{ kanji:"撮ります(とります)",hiragana:"",en:"take (a photo)" },{ kanji:"します",hiragana:"",en:"do" },{ kanji:"会います(あいます)",hiragana:"",en:"meet" },{ kanji:"ご飯(ごはん)",hiragana:"",en:"meal; rice" },{ kanji:"朝ご飯(あさごはん)",hiragana:"",en:"breakfast" },{ kanji:"昼ご飯(ひるごはん)",hiragana:"",en:"lunch" },{ kanji:"晩ご飯(ばんごはん)",hiragana:"",en:"dinner" },{ kanji:"パン",hiragana:"",en:"bread" },{ kanji:"卵(たまご)",hiragana:"",en:"egg" },{ kanji:"肉(にく)",hiragana:"",en:"meat" },{ kanji:"魚(さかな)",hiragana:"",en:"fish" },{ kanji:"野菜(やさい)",hiragana:"",en:"vegetable" },{ kanji:"果物(くだもの)",hiragana:"",en:"fruit" },{ kanji:"水(みず)",hiragana:"",en:"water" },{ kanji:"お茶(おちゃ)",hiragana:"",en:"tea" },{ kanji:"牛乳(ぎゅうにゅう)",hiragana:"",en:"milk" },{ kanji:"ジュース",hiragana:"",en:"juice" },{ kanji:"ビール",hiragana:"",en:"beer" },{ kanji:"お酒(おさけ)",hiragana:"",en:"alcohol; sake" },{ kanji:"映画(えいが)",hiragana:"",en:"movie" },{ kanji:"手紙(てがみ)",hiragana:"",en:"letter" },{ kanji:"写真(しゃしん)",hiragana:"",en:"photograph" },{ kanji:"店(みせ)",hiragana:"",en:"shop" },{ kanji:"レストラン",hiragana:"",en:"restaurant" },{ kanji:"何(なに)",hiragana:"",en:"what" },{ kanji:"一緒に(いっしょに)",hiragana:"",en:"together" },{ kanji:"ちょっと",hiragana:"",en:"a little" },{ kanji:"いつも",hiragana:"",en:"always" },{ kanji:"時々(ときどき)",hiragana:"",en:"sometimes" },{ kanji:"それから",hiragana:"",en:"after that" },{ kanji:"いいですね",hiragana:"",en:"that sounds good" },{ kanji:"分かりました(わかりました)",hiragana:"",en:"I understand" },{ kanji:"じゃ、また",hiragana:"",en:"see you later" }] },
    { lesson: 7,  title: "第7課 – Giving & Receiving",        vocab: [{ kanji:"切ります(きります)",hiragana:"",en:"cut" },{ kanji:"送ります(おくります)",hiragana:"",en:"send" },{ kanji:"あげます",hiragana:"",en:"give" },{ kanji:"もらいます",hiragana:"",en:"receive" },{ kanji:"貸します(かします)",hiragana:"",en:"lend" },{ kanji:"借ります(かります)",hiragana:"",en:"borrow" },{ kanji:"教えます(おしえます)",hiragana:"",en:"teach" },{ kanji:"習います(ならいます)",hiragana:"",en:"learn" },{ kanji:"かけます",hiragana:"",en:"make (a phone call)" },{ kanji:"手(て)",hiragana:"",en:"hand" },{ kanji:"箸(はし)",hiragana:"",en:"chopsticks" },{ kanji:"スプーン",hiragana:"",en:"spoon" },{ kanji:"ナイフ",hiragana:"",en:"knife" },{ kanji:"フォーク",hiragana:"",en:"fork" },{ kanji:"はさみ",hiragana:"",en:"scissors" },{ kanji:"パソコン",hiragana:"",en:"personal computer" },{ kanji:"紙(かみ)",hiragana:"",en:"paper" },{ kanji:"花(はな)",hiragana:"",en:"flower" },{ kanji:"荷物(にもつ)",hiragana:"",en:"luggage" },{ kanji:"お金(おかね)",hiragana:"",en:"money" },{ kanji:"切符(きっぷ)",hiragana:"",en:"ticket" },{ kanji:"父(ちち)",hiragana:"",en:"(my) father" },{ kanji:"母(はは)",hiragana:"",en:"(my) mother" },{ kanji:"お父さん(おとうさん)",hiragana:"",en:"(someone else's) father" },{ kanji:"お母さん(おかあさん)",hiragana:"",en:"(someone else's) mother" },{ kanji:"もう",hiragana:"",en:"already" },{ kanji:"まだ",hiragana:"",en:"not yet" },{ kanji:"旅行(りょこう)",hiragana:"",en:"trip" },{ kanji:"お土産(おみやげ)",hiragana:"",en:"souvenir" },{ kanji:"プレゼント",hiragana:"",en:"present; gift" }] },
    { lesson: 8,  title: "第8課 – Adjectives & Descriptions",  vocab: [{ kanji:"ハンサム[な]",hiragana:"",en:"handsome" },{ kanji:"きれい[な]",hiragana:"",en:"beautiful; clean" },{ kanji:"静か[な](しずか)",hiragana:"",en:"quiet" },{ kanji:"にぎやか[な]",hiragana:"",en:"lively" },{ kanji:"有名[な](ゆうめい)",hiragana:"",en:"famous" },{ kanji:"親切[な](しんせつ)",hiragana:"",en:"kind" },{ kanji:"元気[な](げんき)",hiragana:"",en:"healthy; cheerful" },{ kanji:"暇[な](ひま)",hiragana:"",en:"free (time)" },{ kanji:"便利[な](べんり)",hiragana:"",en:"convenient" },{ kanji:"すてき[な]",hiragana:"",en:"lovely; wonderful" },{ kanji:"大きい(おおきい)",hiragana:"",en:"big" },{ kanji:"小さい(ちいさい)",hiragana:"",en:"small" },{ kanji:"新しい(あたらしい)",hiragana:"",en:"new" },{ kanji:"古い(ふるい)",hiragana:"",en:"old (not for people)" },{ kanji:"いい(よい)",hiragana:"",en:"good" },{ kanji:"悪い(わるい)",hiragana:"",en:"bad" },{ kanji:"暑い/熱い(あつい)",hiragana:"",en:"hot" },{ kanji:"寒い(さむい)",hiragana:"",en:"cold (weather)" },{ kanji:"冷たい(つめたい)",hiragana:"",en:"cold (touch)" },{ kanji:"難しい(むずかしい)",hiragana:"",en:"difficult" },{ kanji:"易しい(やさしい)",hiragana:"",en:"easy" },{ kanji:"高い(たかい)",hiragana:"",en:"expensive; tall" },{ kanji:"安い(やすい)",hiragana:"",en:"cheap" },{ kanji:"低い(ひくい)",hiragana:"",en:"low" },{ kanji:"おもしろい",hiragana:"",en:"interesting" },{ kanji:"おいしい",hiragana:"",en:"delicious" },{ kanji:"忙しい(いそがしい)",hiragana:"",en:"busy" },{ kanji:"楽しい(たのしい)",hiragana:"",en:"fun" },{ kanji:"白い(しろい)",hiragana:"",en:"white" },{ kanji:"黒い(くろい)",hiragana:"",en:"black" },{ kanji:"赤い(あかい)",hiragana:"",en:"red" },{ kanji:"青い(あおい)",hiragana:"",en:"blue" },{ kanji:"桜(さくら)",hiragana:"",en:"cherry blossom" },{ kanji:"山(やま)",hiragana:"",en:"mountain" },{ kanji:"町(まち)",hiragana:"",en:"town; city" },{ kanji:"どう",hiragana:"",en:"how" },{ kanji:"どんな〜",hiragana:"",en:"what kind of" },{ kanji:"とても",hiragana:"",en:"very" },{ kanji:"あまり",hiragana:"",en:"not very (with negative)" },{ kanji:"そして",hiragana:"",en:"and" }] },
    { lesson: 9,  title: "第9課 – Preferences & Skills",      vocab: [{ kanji:"分かります(わかります)",hiragana:"",en:"understand" },{ kanji:"あります",hiragana:"",en:"have; exist (things)" },{ kanji:"好き[な](すき)",hiragana:"",en:"like" },{ kanji:"嫌い[な](きらい)",hiragana:"",en:"dislike" },{ kanji:"上手[な](じょうず)",hiragana:"",en:"good at" },{ kanji:"下手[な](へた)",hiragana:"",en:"poor at" },{ kanji:"料理(りょうり)",hiragana:"",en:"cooking; dish" },{ kanji:"飲み物(のみもの)",hiragana:"",en:"drinks" },{ kanji:"スポーツ",hiragana:"",en:"sports" },{ kanji:"野球(やきゅう)",hiragana:"",en:"baseball" },{ kanji:"ダンス",hiragana:"",en:"dance" },{ kanji:"音楽(おんがく)",hiragana:"",en:"music" },{ kanji:"歌(うた)",hiragana:"",en:"song" },{ kanji:"クラシック",hiragana:"",en:"classical music" },{ kanji:"ジャズ",hiragana:"",en:"jazz" },{ kanji:"コンサート",hiragana:"",en:"concert" },{ kanji:"カラオケ",hiragana:"",en:"karaoke" },{ kanji:"歌舞伎(かぶき)",hiragana:"",en:"Kabuki" },{ kanji:"絵(え)",hiragana:"",en:"picture" },{ kanji:"漢字(かんじ)",hiragana:"",en:"kanji" },{ kanji:"ひらがな",hiragana:"",en:"hiragana" },{ kanji:"カタカナ",hiragana:"",en:"katakana" },{ kanji:"ローマ字(ローマじ)",hiragana:"",en:"Roman alphabet" },{ kanji:"時間(じかん)",hiragana:"",en:"time" },{ kanji:"約束(やくそく)",hiragana:"",en:"appointment" },{ kanji:"子供(こども)",hiragana:"",en:"child" },{ kanji:"よく",hiragana:"",en:"well; often" },{ kanji:"たくさん",hiragana:"",en:"many; much" },{ kanji:"少し(すこし)",hiragana:"",en:"a little" },{ kanji:"全然(ぜんぜん)",hiragana:"",en:"not at all (with negative)" },{ kanji:"早く/速く(はやく)",hiragana:"",en:"early; fast" },{ kanji:"から",hiragana:"",en:"because" },{ kanji:"どうして",hiragana:"",en:"why" },{ kanji:"もしもし",hiragana:"",en:"hello (phone)" }] },
    { lesson: 10, title: "第10課 – Existence & Location",     vocab: [{ kanji:"あります",hiragana:"",en:"exist (things)" },{ kanji:"います",hiragana:"",en:"exist (people/animals)" },{ kanji:"いろいろ[な]",hiragana:"",en:"various" },{ kanji:"男の人(おとこのひと)",hiragana:"",en:"man" },{ kanji:"女の人(おんなのひと)",hiragana:"",en:"woman" },{ kanji:"男の子(おとこのこ)",hiragana:"",en:"boy" },{ kanji:"女の子(おんなのこ)",hiragana:"",en:"girl" },{ kanji:"犬(いぬ)",hiragana:"",en:"dog" },{ kanji:"猫(ねこ)",hiragana:"",en:"cat" },{ kanji:"木(き)",hiragana:"",en:"tree" },{ kanji:"電池(でんち)",hiragana:"",en:"battery" },{ kanji:"箱(はこ)",hiragana:"",en:"box" },{ kanji:"冷蔵庫(れいぞうこ)",hiragana:"",en:"refrigerator" },{ kanji:"テーブル",hiragana:"",en:"table" },{ kanji:"ベッド",hiragana:"",en:"bed" },{ kanji:"棚(たな)",hiragana:"",en:"shelf" },{ kanji:"ドア",hiragana:"",en:"door" },{ kanji:"窓(まど)",hiragana:"",en:"window" },{ kanji:"公園(こうえん)",hiragana:"",en:"park" },{ kanji:"喫茶店(きっさてん)",hiragana:"",en:"coffee shop" },{ kanji:"本屋(ほんや)",hiragana:"",en:"bookstore" },{ kanji:"上(うえ)",hiragana:"",en:"above" },{ kanji:"下(した)",hiragana:"",en:"below" },{ kanji:"前(まえ)",hiragana:"",en:"front" },{ kanji:"後ろ(うしろ)",hiragana:"",en:"behind" },{ kanji:"右(みぎ)",hiragana:"",en:"right" },{ kanji:"左(ひだり)",hiragana:"",en:"left" },{ kanji:"中(なか)",hiragana:"",en:"inside" },{ kanji:"外(そと)",hiragana:"",en:"outside" },{ kanji:"隣(となり)",hiragana:"",en:"next to" },{ kanji:"近く(ちかく)",hiragana:"",en:"near" },{ kanji:"間(あいだ)",hiragana:"",en:"between" },{ kanji:"一番(いちばん)",hiragana:"",en:"the most" }] },
    { lesson: 11, title: "第11課 – Counters & Quantities",    vocab: [{ kanji:"一つ(ひとつ)",hiragana:"",en:"one (thing)" },{ kanji:"二つ(ふたつ)",hiragana:"",en:"two" },{ kanji:"三つ(みっつ)",hiragana:"",en:"three" },{ kanji:"四つ(よっつ)",hiragana:"",en:"four" },{ kanji:"五つ(いつつ)",hiragana:"",en:"five" },{ kanji:"六つ(むっつ)",hiragana:"",en:"six" },{ kanji:"七つ(ななつ)",hiragana:"",en:"seven" },{ kanji:"八つ(やっつ)",hiragana:"",en:"eight" },{ kanji:"九つ(ここのつ)",hiragana:"",en:"nine" },{ kanji:"十(とお)",hiragana:"",en:"ten" },{ kanji:"いくつ",hiragana:"",en:"how many" },{ kanji:"一人(ひとり)",hiragana:"",en:"one person" },{ kanji:"二人(ふたり)",hiragana:"",en:"two people" },{ kanji:"〜人(〜にん)",hiragana:"",en:"~ people" },{ kanji:"〜台(〜だい)",hiragana:"",en:"counter for machines" },{ kanji:"〜枚(〜まい)",hiragana:"",en:"counter for flat objects" },{ kanji:"〜回(〜かい)",hiragana:"",en:"~ times" },{ kanji:"りんご",hiragana:"",en:"apple" },{ kanji:"みかん",hiragana:"",en:"mandarin orange" },{ kanji:"サンドイッチ",hiragana:"",en:"sandwich" },{ kanji:"カレーライス",hiragana:"",en:"curry rice" },{ kanji:"切手(きって)",hiragana:"",en:"stamp" },{ kanji:"葉書(はがき)",hiragana:"",en:"postcard" },{ kanji:"封筒(ふうとう)",hiragana:"",en:"envelope" },{ kanji:"速達(そくたつ)",hiragana:"",en:"express delivery" },{ kanji:"両親(りょうしん)",hiragana:"",en:"parents" },{ kanji:"兄弟(きょうだい)",hiragana:"",en:"siblings" },{ kanji:"兄(あに)",hiragana:"",en:"(my) older brother" },{ kanji:"姉(あね)",hiragana:"",en:"(my) older sister" },{ kanji:"弟(おとうと)",hiragana:"",en:"(my) younger brother" },{ kanji:"妹(いもうと)",hiragana:"",en:"(my) younger sister" },{ kanji:"外国(がいこく)",hiragana:"",en:"foreign country" },{ kanji:"〜時間(〜じかん)",hiragana:"",en:"~ hours" },{ kanji:"〜週間(〜しゅうかん)",hiragana:"",en:"~ weeks" },{ kanji:"〜か月(〜かげつ)",hiragana:"",en:"~ months" },{ kanji:"〜年(〜ねん)",hiragana:"",en:"~ years" },{ kanji:"〜ぐらい",hiragana:"",en:"about" },{ kanji:"どのくらい",hiragana:"",en:"how long" },{ kanji:"全部で(ぜんぶで)",hiragana:"",en:"in total" },{ kanji:"みんな",hiragana:"",en:"everyone" },{ kanji:"だけ",hiragana:"",en:"only" }] },
    { lesson: 12, title: "第12課 – Weather, Seasons & Comparison", vocab: [{ kanji:"簡単[な](かんたん)",hiragana:"",en:"easy; simple" },{ kanji:"近い(ちかい)",hiragana:"",en:"near" },{ kanji:"遠い(とおい)",hiragana:"",en:"far" },{ kanji:"速い/早い(はやい)",hiragana:"",en:"fast; early" },{ kanji:"遅い(おそい)",hiragana:"",en:"slow; late" },{ kanji:"多い(おおい)",hiragana:"",en:"many; much" },{ kanji:"少ない(すくない)",hiragana:"",en:"few; little" },{ kanji:"暖かい(あたたかい)",hiragana:"",en:"warm" },{ kanji:"涼しい(すずしい)",hiragana:"",en:"cool" },{ kanji:"甘い(あまい)",hiragana:"",en:"sweet" },{ kanji:"辛い(からい)",hiragana:"",en:"spicy; hot (taste)" },{ kanji:"重い(おもい)",hiragana:"",en:"heavy" },{ kanji:"軽い(かるい)",hiragana:"",en:"light (weight)" },{ kanji:"季節(きせつ)",hiragana:"",en:"season" },{ kanji:"春(はる)",hiragana:"",en:"spring" },{ kanji:"夏(なつ)",hiragana:"",en:"summer" },{ kanji:"秋(あき)",hiragana:"",en:"autumn" },{ kanji:"冬(ふゆ)",hiragana:"",en:"winter" },{ kanji:"天気(てんき)",hiragana:"",en:"weather" },{ kanji:"雨(あめ)",hiragana:"",en:"rain" },{ kanji:"雪(ゆき)",hiragana:"",en:"snow" },{ kanji:"曇り(くもり)",hiragana:"",en:"cloudy" },{ kanji:"ホテル",hiragana:"",en:"hotel" },{ kanji:"空港(くうこう)",hiragana:"",en:"airport" },{ kanji:"海(うみ)",hiragana:"",en:"sea" },{ kanji:"世界(せかい)",hiragana:"",en:"world" },{ kanji:"パーティー",hiragana:"",en:"party" },{ kanji:"お祭り(おまつり)",hiragana:"",en:"festival" },{ kanji:"試験(しけん)",hiragana:"",en:"exam" },{ kanji:"お寿司(おすし)",hiragana:"",en:"sushi" },{ kanji:"天ぷら(てんぷら)",hiragana:"",en:"tempura" },{ kanji:"紅葉(もみじ)",hiragana:"",en:"autumn leaves" },{ kanji:"どちら",hiragana:"",en:"which (of two)" },{ kanji:"どちらも",hiragana:"",en:"both" },{ kanji:"ずっと",hiragana:"",en:"by far" },{ kanji:"初めて(はじめて)",hiragana:"",en:"for the first time" }] },
    { lesson: 13, title: "第13課 – Activities & Wants",       vocab: [{ kanji:"遊びます(あそびます)",hiragana:"",en:"play; enjoy" },{ kanji:"泳ぎます(およぎます)",hiragana:"",en:"swim" },{ kanji:"迎えます(むかえます)",hiragana:"",en:"go to meet" },{ kanji:"疲れます(つかれます)",hiragana:"",en:"get tired" },{ kanji:"出します(だします)",hiragana:"",en:"send; submit" },{ kanji:"入ります(はいります)",hiragana:"",en:"enter" },{ kanji:"出ます(でます)",hiragana:"",en:"leave" },{ kanji:"結婚します(けっこんします)",hiragana:"",en:"get married" },{ kanji:"買い物します(かいものします)",hiragana:"",en:"shop" },{ kanji:"食事します(しょくじします)",hiragana:"",en:"have a meal" },{ kanji:"散歩します(さんぽします)",hiragana:"",en:"take a walk" },{ kanji:"大変[な](たいへん)",hiragana:"",en:"hard; tough" },{ kanji:"欲しい(ほしい)",hiragana:"",en:"want" },{ kanji:"寂しい(さびしい)",hiragana:"",en:"lonely" },{ kanji:"広い(ひろい)",hiragana:"",en:"wide" },{ kanji:"狭い(せまい)",hiragana:"",en:"narrow" },{ kanji:"市役所(しやくしょ)",hiragana:"",en:"city hall" },{ kanji:"プール",hiragana:"",en:"pool" },{ kanji:"川(かわ)",hiragana:"",en:"river" },{ kanji:"音楽(おんがく)",hiragana:"",en:"music" },{ kanji:"釣り(つり)",hiragana:"",en:"fishing" },{ kanji:"スキー",hiragana:"",en:"skiing" },{ kanji:"週末(しゅうまつ)",hiragana:"",en:"weekend" },{ kanji:"何か(なにか)",hiragana:"",en:"something" },{ kanji:"どこか",hiragana:"",en:"somewhere" },{ kanji:"お腹がすきました(おなか)",hiragana:"",en:"I'm hungry" },{ kanji:"のどが渇きました(かわきました)",hiragana:"",en:"I'm thirsty" },{ kanji:"定食(ていしょく)",hiragana:"",en:"set meal" }] },
    { lesson: 14, title: "第14課 – Requests & Actions",       vocab: [{ kanji:"つけます",hiragana:"",en:"turn on" },{ kanji:"消します(けします)",hiragana:"",en:"turn off" },{ kanji:"開けます(あけます)",hiragana:"",en:"open" },{ kanji:"閉めます(しめます)",hiragana:"",en:"close" },{ kanji:"急ぎます(いそぎます)",hiragana:"",en:"hurry" },{ kanji:"待ちます(まちます)",hiragana:"",en:"wait" },{ kanji:"止めます(とめます)",hiragana:"",en:"stop; park" },{ kanji:"曲がります(まがります)",hiragana:"",en:"turn" },{ kanji:"持ちます(もちます)",hiragana:"",en:"hold" },{ kanji:"取ります(とります)",hiragana:"",en:"take" },{ kanji:"手伝います(てつだいます)",hiragana:"",en:"help" },{ kanji:"呼びます(よびます)",hiragana:"",en:"call" },{ kanji:"話します(はなします)",hiragana:"",en:"speak" },{ kanji:"見せます(みせます)",hiragana:"",en:"show" },{ kanji:"教えます(おしえます)",hiragana:"",en:"tell; teach" },{ kanji:"始めます(はじめます)",hiragana:"",en:"start" },{ kanji:"コピーします",hiragana:"",en:"copy" },{ kanji:"エアコン",hiragana:"",en:"air conditioner" },{ kanji:"パスポート",hiragana:"",en:"passport" },{ kanji:"名前(なまえ)",hiragana:"",en:"name" },{ kanji:"住所(じゅうしょ)",hiragana:"",en:"address" },{ kanji:"地図(ちず)",hiragana:"",en:"map" },{ kanji:"塩(しお)",hiragana:"",en:"salt" },{ kanji:"砂糖(さとう)",hiragana:"",en:"sugar" },{ kanji:"ゆっくり",hiragana:"",en:"slowly" },{ kanji:"すぐ",hiragana:"",en:"immediately" },{ kanji:"また",hiragana:"",en:"again" },{ kanji:"あとで",hiragana:"",en:"later" },{ kanji:"もう少し(もうすこし)",hiragana:"",en:"a little more" },{ kanji:"まっすぐ",hiragana:"",en:"straight" },{ kanji:"お釣り(おつり)",hiragana:"",en:"change" }] },
    { lesson: 15, title: "第15課 – Work & Life",              vocab: [{ kanji:"置きます(おきます)",hiragana:"",en:"put; place" },{ kanji:"作ります(つくります)",hiragana:"",en:"make; produce" },{ kanji:"売ります(うります)",hiragana:"",en:"sell" },{ kanji:"知ります(しります)",hiragana:"",en:"get to know" },{ kanji:"住みます(すみます)",hiragana:"",en:"live; reside" },{ kanji:"研究します(けんきゅうします)",hiragana:"",en:"research" },{ kanji:"資料(しりょう)",hiragana:"",en:"materials; data" },{ kanji:"カタログ",hiragana:"",en:"catalog" },{ kanji:"時刻表(じこくひょう)",hiragana:"",en:"timetable" },{ kanji:"服(ふく)",hiragana:"",en:"clothes" },{ kanji:"製品(せいひん)",hiragana:"",en:"product" },{ kanji:"ソフト",hiragana:"",en:"software" },{ kanji:"専門(せんもん)",hiragana:"",en:"specialty; field" },{ kanji:"歯医者(はいしゃ)",hiragana:"",en:"dentist" },{ kanji:"床屋(とこや)",hiragana:"",en:"barber" },{ kanji:"独身(どくしん)",hiragana:"",en:"single; unmarried" },{ kanji:"特に(とくに)",hiragana:"",en:"especially" },{ kanji:"思い出します(おもいだします)",hiragana:"",en:"remember" },{ kanji:"ご家族(ごかぞく)",hiragana:"",en:"your family" },{ kanji:"いらっしゃいます",hiragana:"",en:"be (honorific)" }] },
    { lesson: 16, title: "第16課 – Movement & Body",          vocab: [{ kanji:"乗ります(のります)",hiragana:"",en:"ride; get on" },{ kanji:"降ります(おります)",hiragana:"",en:"get off" },{ kanji:"乗り換えます(のりかえます)",hiragana:"",en:"transfer" },{ kanji:"浴びます(あびます)",hiragana:"",en:"take (a shower)" },{ kanji:"入れます(いれます)",hiragana:"",en:"put in" },{ kanji:"出します(だします)",hiragana:"",en:"take out" },{ kanji:"入ります(はいります)",hiragana:"",en:"enter" },{ kanji:"出ます(でます)",hiragana:"",en:"leave; graduate" },{ kanji:"やめます",hiragana:"",en:"quit" },{ kanji:"押します(おします)",hiragana:"",en:"push" },{ kanji:"若い(わかい)",hiragana:"",en:"young" },{ kanji:"長い(ながい)",hiragana:"",en:"long" },{ kanji:"短い(みじかい)",hiragana:"",en:"short" },{ kanji:"明るい(あかるい)",hiragana:"",en:"bright" },{ kanji:"暗い(くらい)",hiragana:"",en:"dark" },{ kanji:"背が高い(せがたかい)",hiragana:"",en:"tall" },{ kanji:"頭(あたま)",hiragana:"",en:"head" },{ kanji:"髪(かみ)",hiragana:"",en:"hair" },{ kanji:"顔(かお)",hiragana:"",en:"face" },{ kanji:"目(め)",hiragana:"",en:"eye" },{ kanji:"耳(みみ)",hiragana:"",en:"ear" },{ kanji:"口(くち)",hiragana:"",en:"mouth" },{ kanji:"歯(は)",hiragana:"",en:"tooth" },{ kanji:"お腹(おなか)",hiragana:"",en:"stomach" },{ kanji:"足(あし)",hiragana:"",en:"leg; foot" },{ kanji:"シャワー",hiragana:"",en:"shower" },{ kanji:"緑(みどり)",hiragana:"",en:"green" },{ kanji:"お寺(おてら)",hiragana:"",en:"temple" },{ kanji:"神社(じんじゃ)",hiragana:"",en:"shrine" },{ kanji:"どうやって",hiragana:"",en:"how" },{ kanji:"まず",hiragana:"",en:"first" },{ kanji:"次に(つぎに)",hiragana:"",en:"next" }] },
    { lesson: 17, title: "第17課 – Health & Daily Actions",   vocab: [{ kanji:"覚えます(おぼえます)",hiragana:"",en:"memorize" },{ kanji:"忘れます(わすれます)",hiragana:"",en:"forget" },{ kanji:"なくします",hiragana:"",en:"lose" },{ kanji:"払います(はらいます)",hiragana:"",en:"pay" },{ kanji:"返します(かえします)",hiragana:"",en:"return" },{ kanji:"出かけます(でかけます)",hiragana:"",en:"go out" },{ kanji:"脱ぎます(ぬぎます)",hiragana:"",en:"take off (clothes)" },{ kanji:"持って行きます(もっていきます)",hiragana:"",en:"take" },{ kanji:"持って来ます(もってきます)",hiragana:"",en:"bring" },{ kanji:"心配します(しんぱいします)",hiragana:"",en:"worry" },{ kanji:"残業します(ざんぎょうします)",hiragana:"",en:"work overtime" },{ kanji:"出張します(しゅっちょうします)",hiragana:"",en:"business trip" },{ kanji:"大切[な](たいせつ)",hiragana:"",en:"important" },{ kanji:"大丈夫[な](だいじょうぶ)",hiragana:"",en:"okay" },{ kanji:"危ない(あぶない)",hiragana:"",en:"dangerous" },{ kanji:"問題(もんだい)",hiragana:"",en:"problem" },{ kanji:"禁煙(きんえん)",hiragana:"",en:"no smoking" },{ kanji:"風邪(かぜ)",hiragana:"",en:"cold" },{ kanji:"熱(ねつ)",hiragana:"",en:"fever" },{ kanji:"病気(びょうき)",hiragana:"",en:"illness" },{ kanji:"薬(くすり)",hiragana:"",en:"medicine" },{ kanji:"お風呂(おふろ)",hiragana:"",en:"bath" },{ kanji:"〜までに",hiragana:"",en:"by (time limit)" },{ kanji:"ですから",hiragana:"",en:"therefore" },{ kanji:"どうしましたか",hiragana:"",en:"what's wrong" },{ kanji:"痛い(いたい)",hiragana:"",en:"painful" },{ kanji:"喉(のど)",hiragana:"",en:"throat" },{ kanji:"お大事に(おだいじに)",hiragana:"",en:"take care" }] },
    { lesson: 18, title: "第18課 – Ability & Hobbies",        vocab: [{ kanji:"できます",hiragana:"",en:"can; be able to" },{ kanji:"洗います(あらいます)",hiragana:"",en:"wash" },{ kanji:"弾きます(ひきます)",hiragana:"",en:"play (instrument)" },{ kanji:"歌います(うたいます)",hiragana:"",en:"sing" },{ kanji:"集めます(あつめます)",hiragana:"",en:"collect" },{ kanji:"捨てます(すてます)",hiragana:"",en:"throw away" },{ kanji:"運転します(うんてんします)",hiragana:"",en:"drive" },{ kanji:"予約します(よやくします)",hiragana:"",en:"reserve" },{ kanji:"見学します(けんがくします)",hiragana:"",en:"visit (for study)" },{ kanji:"ピアノ",hiragana:"",en:"piano" },{ kanji:"現金(げんきん)",hiragana:"",en:"cash" },{ kanji:"趣味(しゅみ)",hiragana:"",en:"hobby" },{ kanji:"日記(にっき)",hiragana:"",en:"diary" },{ kanji:"課長(かちょう)",hiragana:"",en:"section chief" },{ kanji:"部長(ぶちょう)",hiragana:"",en:"department head" },{ kanji:"社長(しゃちょう)",hiragana:"",en:"company president" },{ kanji:"動物(どうぶつ)",hiragana:"",en:"animal" },{ kanji:"馬(うま)",hiragana:"",en:"horse" },{ kanji:"ぜひ",hiragana:"",en:"by all means" }] },
    { lesson: 19, title: "第19課 – Lifestyle & Health",       vocab: [{ kanji:"登ります(のぼります)",hiragana:"",en:"climb" },{ kanji:"泊まります(とまります)",hiragana:"",en:"stay" },{ kanji:"掃除します(そうじします)",hiragana:"",en:"clean" },{ kanji:"洗濯します(せんたくします)",hiragana:"",en:"wash clothes" },{ kanji:"練習します(れんしゅうします)",hiragana:"",en:"practice" },{ kanji:"なります",hiragana:"",en:"become" },{ kanji:"眠い(ねむい)",hiragana:"",en:"sleepy" },{ kanji:"強い(つよい)",hiragana:"",en:"strong" },{ kanji:"弱い(よわい)",hiragana:"",en:"weak" },{ kanji:"ゴルフ",hiragana:"",en:"golf" },{ kanji:"相撲(すもう)",hiragana:"",en:"sumo" },{ kanji:"お茶(おちゃ)",hiragana:"",en:"tea ceremony" },{ kanji:"一度(いちど)",hiragana:"",en:"once" },{ kanji:"一度も(いちども)",hiragana:"",en:"never" },{ kanji:"だんだん",hiragana:"",en:"gradually" },{ kanji:"もうすぐ",hiragana:"",en:"soon" },{ kanji:"おかげさまで",hiragana:"",en:"thanks to you" },{ kanji:"乾杯(かんぱい)",hiragana:"",en:"cheers" },{ kanji:"ダイエット",hiragana:"",en:"diet" },{ kanji:"無理[な](むり)",hiragana:"",en:"impossible" }] },
    { lesson: 20, title: "第20課 – Casual Speech",            vocab: [{ kanji:"要ります(いります)",hiragana:"",en:"need" },{ kanji:"調べます(しらべます)",hiragana:"",en:"check" },{ kanji:"直します(なおします)",hiragana:"",en:"fix; cure" },{ kanji:"修理します(しゅうりします)",hiragana:"",en:"repair" },{ kanji:"電話します(でんわします)",hiragana:"",en:"call" },{ kanji:"僕(ぼく)",hiragana:"",en:"I (male informal)" },{ kanji:"君(きみ)",hiragana:"",en:"you (informal)" },{ kanji:"うん",hiragana:"",en:"yes" },{ kanji:"ううん",hiragana:"",en:"no" },{ kanji:"サラリーマン",hiragana:"",en:"office worker" },{ kanji:"言葉(ことば)",hiragana:"",en:"word; language" },{ kanji:"物価(ぶっか)",hiragana:"",en:"prices" },{ kanji:"着物(きもの)",hiragana:"",en:"kimono" },{ kanji:"初め(はじめ)",hiragana:"",en:"beginning" },{ kanji:"終わり(おわり)",hiragana:"",en:"end" },{ kanji:"この間(このあいだ)",hiragana:"",en:"the other day" },{ kanji:"みんなで",hiragana:"",en:"together" }] },
    { lesson: 21, title: "第21課 – Opinions & Society",       vocab: [{ kanji:"思います",hiragana:"おもいます",en:"think" },{ kanji:"言います",hiragana:"いいます",en:"say" },{ kanji:"足ります",hiragana:"たります",en:"be enough, sufficient" },{ kanji:"勝ちます",hiragana:"かちます",en:"win" },{ kanji:"負けます",hiragana:"まけます",en:"lose" },{ kanji:"役に立ちます",hiragana:"やくにたちます",en:"be useful" },{ kanji:"無駄な",hiragana:"むだな",en:"wasteful" },{ kanji:"不便な",hiragana:"ふべんな",en:"inconvenient" },{ kanji:"同じ",hiragana:"おなじ",en:"same" },{ kanji:"すごい",hiragana:"",en:"amazing, great" },{ kanji:"首相",hiragana:"しゅしょう",en:"prime minister" },{ kanji:"政治",hiragana:"せいじ",en:"politics" },{ kanji:"ニュース",hiragana:"",en:"news" },{ kanji:"スピーチ",hiragana:"",en:"speech" },{ kanji:"試合",hiragana:"しあい",en:"match, game" },{ kanji:"アルバイト",hiragana:"",en:"part-time job" },{ kanji:"意見",hiragana:"いけん",en:"opinion" },{ kanji:"交通",hiragana:"こうつう",en:"traffic, transport" },{ kanji:"最近",hiragana:"さいきん",en:"recently" },{ kanji:"多分",hiragana:"たぶん",en:"probably" },{ kanji:"きっと",hiragana:"",en:"surely" },{ kanji:"本当に",hiragana:"ほんとうに",en:"really" },{ kanji:"〜について",hiragana:"",en:"about, concerning" }] },
    { lesson: 22, title: "第22課 – Clothing & Housing",       vocab: [{ kanji:"着ます",hiragana:"きます",en:"wear (upper body)" },{ kanji:"履きます",hiragana:"はきます",en:"wear (shoes/pants)" },{ kanji:"被ります",hiragana:"かぶります",en:"wear (hat)" },{ kanji:"かけます(眼鏡を〜)",hiragana:"",en:"wear glasses" },{ kanji:"生まれます",hiragana:"うまれます",en:"be born" },{ kanji:"コート",hiragana:"",en:"coat" },{ kanji:"セーター",hiragana:"",en:"sweater" },{ kanji:"スーツ",hiragana:"",en:"suit" },{ kanji:"帽子",hiragana:"ぼうし",en:"hat" },{ kanji:"眼鏡",hiragana:"めがね",en:"glasses" },{ kanji:"家賃",hiragana:"やちん",en:"rent" },{ kanji:"和室",hiragana:"わしつ",en:"Japanese-style room" },{ kanji:"押入れ",hiragana:"おしいれ",en:"closet" },{ kanji:"布団",hiragana:"ふとん",en:"futon" },{ kanji:"アパート",hiragana:"",en:"apartment" }] },
    { lesson: 23, title: "第23課 – Instructions & Navigation", vocab: [{ kanji:"聞きます(先生に〜)",hiragana:"ききます",en:"ask" },{ kanji:"回します",hiragana:"まわします",en:"turn" },{ kanji:"引きます",hiragana:"ひきます",en:"pull" },{ kanji:"変えます",hiragana:"かえます",en:"change" },{ kanji:"触ります",hiragana:"さわります",en:"touch" },{ kanji:"動きます",hiragana:"うごきます",en:"move" },{ kanji:"歩きます",hiragana:"あるきます",en:"walk" },{ kanji:"渡ります",hiragana:"わたります",en:"cross" },{ kanji:"気をつけます",hiragana:"きをつけます",en:"be careful" },{ kanji:"引越しします",hiragana:"ひっこしします",en:"move house" },{ kanji:"電気屋",hiragana:"でんきや",en:"electronics shop" },{ kanji:"音",hiragana:"おと",en:"sound" },{ kanji:"機械",hiragana:"きかい",en:"machine" },{ kanji:"道",hiragana:"みち",en:"road" },{ kanji:"交差点",hiragana:"こうさてん",en:"intersection" },{ kanji:"信号",hiragana:"しんごう",en:"traffic light" },{ kanji:"橋",hiragana:"はし",en:"bridge" },{ kanji:"駐車場",hiragana:"ちゅうしゃじょう",en:"parking lot" }] },
    { lesson: 24, title: "第24課 – Giving & Guiding",         vocab: [{ kanji:"くれます",hiragana:"",en:"give (to me)" },{ kanji:"連れて行きます",hiragana:"つれていきます",en:"take someone" },{ kanji:"連れて来ます",hiragana:"つれてきます",en:"bring someone" },{ kanji:"送ります",hiragana:"おくります",en:"escort" },{ kanji:"紹介します",hiragana:"しょうかいします",en:"introduce" },{ kanji:"案内します",hiragana:"あんないします",en:"guide" },{ kanji:"説明します",hiragana:"せつめいします",en:"explain" },{ kanji:"淹れます",hiragana:"いれます",en:"make (coffee)" },{ kanji:"準備します",hiragana:"じゅんびします",en:"prepare" },{ kanji:"意味",hiragana:"いみ",en:"meaning" },{ kanji:"お菓子",hiragana:"おかし",en:"snacks" },{ kanji:"全部",hiragana:"ぜんぶ",en:"all" },{ kanji:"自分で",hiragana:"じぶんで",en:"by oneself" },{ kanji:"お弁当",hiragana:"おべんとう",en:"lunch box" },{ kanji:"母の日",hiragana:"ははのひ",en:"Mother's Day" }] },
    { lesson: 25, title: "第25課 – Future Plans",             vocab: [{ kanji:"考えます",hiragana:"かんがえます",en:"think, consider" },{ kanji:"着きます",hiragana:"つきます",en:"arrive" },{ kanji:"留学します",hiragana:"りゅうがくします",en:"study abroad" },{ kanji:"取ります(年を〜)",hiragana:"とります",en:"grow old" },{ kanji:"田舎",hiragana:"いなか",en:"countryside" },{ kanji:"大使館",hiragana:"たいしかん",en:"embassy" },{ kanji:"グループ",hiragana:"",en:"group" },{ kanji:"チャンス",hiragana:"",en:"chance" },{ kanji:"億",hiragana:"おく",en:"hundred million" },{ kanji:"転勤",hiragana:"てんきん",en:"job transfer" },{ kanji:"事",hiragana:"こと",en:"thing, matter" },{ kanji:"頑張ります",hiragana:"がんばります",en:"do one's best" }] },
  ]
};

/* ── Flatten all words for SRS / legacy compatibility ──────── */
var VocabPageWords = [];
NZ_N5_DATA.lessons.forEach(function(lesson) {
  var words = lesson.vocab || [];
  // For lesson 0, merge all three sub-sections
  if (lesson.lesson === 0) {
    words = (lesson.classroomIntro||[]).concat(lesson.dailyGreetings||[]).concat(lesson.numbers||[]);
  }
  words.forEach(function(w, i) {
    VocabPageWords.push({
      id:      'n5-l' + lesson.lesson + '-' + i,
      jp:      w.kanji || w.jp || '',
      word:    w.kanji || w.jp || '',
      reading: w.hiragana || '',
      meaning: w.en || '',
      en:      w.en || '',
      level:   'N5',
      lesson:  lesson.lesson
    });
  });
});

/* ── VocabPage module ───────────────────────────────────────── */
window.VocabPage = (function() {
  var _rootId      = null;
  var _activeLesson = 'all';
  var _expandedLesson0 = null; // which sub-button is open: 'classroom'|'greetings'|'numbers'|null

  /* HTML escape */
  function H(s) { return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function speak(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'ja-JP'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  function root() { return document.getElementById(_rootId); }

  /* ── Word card HTML ─────────────────────────────────── */
  function wordCard(w) {
    var jp = w.kanji || w.jp || w.word || '';
    var hira = w.hiragana || w.reading || '';
    var en   = w.en || w.meaning || '';
    return '<div style="display:flex;align-items:center;justify-content:space-between;' +
      'padding:11px 14px;border-radius:10px;background:var(--card-elevated);' +
      'border:1px solid var(--border);margin-bottom:6px;gap:8px;">' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-family:\'Noto Sans JP\',sans-serif;font-size:15px;' +
          'font-weight:700;color:var(--fg);margin-bottom:2px;">' + H(jp) + '</div>' +
        (hira ? '<div style="font-size:11px;color:var(--fg-muted);margin-bottom:2px;">' + H(hira) + '</div>' : '') +
        '<div style="font-size:12px;color:var(--fg-subtle);font-style:italic;">' + H(en) + '</div>' +
      '</div>' +
      '<button onclick="window._nzVocabSpeak(\'' + H(jp).replace(/'/g,"&#39;") + '\')" ' +
        'style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:16px;flex-shrink:0;padding:3px 6px;">🔊</button>' +
    '</div>';
  }

  /* ── Lesson 0 sub-button ───────────────────────────── */
  function subBtn(key, label, icon, color) {
    var active = _expandedLesson0 === key;
    return '<button onclick="window._nzVocabSub(\'' + key + '\')" ' +
      'style="flex:1;padding:11px 8px;border-radius:10px;font-size:12px;font-weight:700;' +
      'font-family:inherit;cursor:pointer;border:1.5px solid ' + color + ';' +
      'background:' + (active ? color : 'transparent') + ';' +
      'color:' + (active ? '#fff' : color) + ';' +
      'transition:all .2s;min-width:0;">' +
      '<div style="font-size:18px;margin-bottom:4px;">' + icon + '</div>' +
      '<div>' + label + '</div>' +
    '</button>';
  }

  /* ── Render chapter list ────────────────────────────── */
  function render() {
    var r = root(); if (!r) return;

    var lesson0 = NZ_N5_DATA.lessons[0];
    var isAll   = _activeLesson === 'all';
    var isL0    = _activeLesson === 0;

    var html = '<div class="nz-page nz-fadein">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
        '<span style="font-family:\'Noto Serif JP\',serif;font-size:22px;color:var(--n5);font-weight:700;">語彙</span>' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0;letter-spacing:-.4px;">Vocabulary Study</h1>' +
      '</div>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0 0 18px;">N5 · Minna no Nihongo I — Lessons 0–25</p>' +

      /* chapter buttons */
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">' +
        '<button onclick="window._nzVocabLesson(\'all\')" style="' + chapterBtnStyle(isAll, 'var(--n5)') + '">All</button>' +
        NZ_N5_DATA.lessons.map(function(les) {
          var active = _activeLesson === les.lesson;
          return '<button onclick="window._nzVocabLesson(' + les.lesson + ')" style="' + chapterBtnStyle(active, 'var(--n5)') + '">' +
            (les.lesson === 0 ? '予備' : '第' + les.lesson + '課') +
          '</button>';
        }).join('') +
      '</div>';

    /* ── Chapter 0 special sub-buttons ── */
    if (isL0 || isAll) {
      html += '<div style="margin-bottom:18px;">' +
        '<div style="font-size:12px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">' +
          '予備課 ' + lesson0.title + '</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:14px;">' +
          subBtn('classroom', 'Classroom Introduction', '🏫', 'var(--n4)') +
          subBtn('greetings', 'Daily Greetings',        '👋', 'var(--n5)') +
          subBtn('numbers',   'Numbers',                 '🔢', 'var(--accent)') +
        '</div>';

      if (_expandedLesson0 === 'classroom') {
        html += '<div style="margin-bottom:4px;">' +
          '<div style="font-size:11px;font-weight:700;color:var(--n4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">🏫 Classroom Introduction — ' + lesson0.classroomIntro.length + ' words</div>' +
          lesson0.classroomIntro.map(wordCard).join('') +
        '</div>';
      } else if (_expandedLesson0 === 'greetings') {
        html += '<div style="margin-bottom:4px;">' +
          '<div style="font-size:11px;font-weight:700;color:var(--n5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">👋 Daily Greetings — ' + lesson0.dailyGreetings.length + ' words</div>' +
          lesson0.dailyGreetings.map(wordCard).join('') +
        '</div>';
      } else if (_expandedLesson0 === 'numbers') {
        html += '<div style="margin-bottom:4px;">' +
          '<div style="font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">🔢 Numbers — ' + lesson0.numbers.length + ' entries</div>' +
          lesson0.numbers.map(wordCard).join('') +
        '</div>';
      }

      html += '</div>';
    }

    /* ── Lessons 1–25 or selected lesson ── */
    var lessonList = isAll
      ? NZ_N5_DATA.lessons.filter(function(l){ return l.lesson > 0; })
      : (isL0 ? [] : NZ_N5_DATA.lessons.filter(function(l){ return l.lesson === _activeLesson; }));

    lessonList.forEach(function(les) {
      html += '<div style="margin-bottom:22px;">' +
        '<div style="font-size:12px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">' +
          H(les.title) + ' — ' + (les.vocab||[]).length + ' words</div>' +
        (les.vocab||[]).map(wordCard).join('') +
      '</div>';
    });

    html += '</div>';
    r.innerHTML = html;

    /* expose speak */
    window._nzVocabSpeak = speak;

    /* sub-button toggle */
    window._nzVocabSub = function(key) {
      _expandedLesson0 = (_expandedLesson0 === key) ? null : key;
      render();
    };

    /* lesson selector */
    window._nzVocabLesson = function(les) {
      _activeLesson    = les;
      _expandedLesson0 = null;
      render();
    };
  }

  function chapterBtnStyle(active, color) {
    return 'padding:7px 13px;border-radius:9px;font-size:12px;font-weight:700;' +
      'font-family:inherit;cursor:pointer;transition:all .15s;' +
      'border:1.5px solid ' + color + ';' +
      'background:' + (active ? color : 'transparent') + ';' +
      'color:' + (active ? '#fff' : color) + ';';
  }

  return {
    mount: function(id) {
      _rootId         = id;
      _activeLesson   = 'all';
      _expandedLesson0 = null;
      render();
    },
    cleanup: function() {
      window._nzVocabSpeak  = null;
      window._nzVocabSub    = null;
      window._nzVocabLesson = null;
    }
  };
}());
