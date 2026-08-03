// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/chapters.js
// NihongoZen — Chapter Button Metadata (N5 – N1)
//
// Exports: window.NZChapterData
//
// Contains chapter titles, topics, and chapter numbers for N5-N1 textbooks:
//   N5  → Minna no Nihongo I    (Chapters 1–25)
//   N4  → Minna no Nihongo II   (Chapters 1–25)
//   N3  → Minna no Nihongo Chukyu (Chapters 1–12)
//   N2  → Nihongo Sou Matome N2 (Chapters 1–8)
//   N1  → Nihongo Sou Matome N1 (Chapters 1–8)
//
// The `words` arrays in each chapter are empty here.
// Vocabulary data lives in vocabLevel.js (NZChapterVocabWords).
// The vocab module merges them at runtime via mergeVocabWords().
//
// Load order in index.html:
//   <script src="js/chapters.js"></script>
//   <script src="js/vocabLevel.js"></script>
//   <script src="js/nz-vocab-module.js"></script>
// ═══════════════════════════════════════════════════════════════════════════════
'use strict';

const NZChapterData = {

  /* ════════════════════════════════════════════════════════
     N5 — Minna no Nihongo I  (Chapters 1–25)
     ════════════════════════════════════════════════════════ */
  N5: [
    {
      ch: 1, title: 'はじめまして',
      topic: 'Introductions & Occupations',
      words: []
    },
    {
      ch: 2, title: 'これはなんですか',
      topic: 'Things & Objects',
      words: []
    },
    {
      ch: 3, title: 'ここはどこですか',
      topic: 'Places & Locations',
      words: []
    },
    {
      ch: 4, title: 'いまなんじですか',
      topic: 'Time & Daily Schedule',
      words: []
    },
    {
      ch: 5, title: 'いくらですか',
      topic: 'Shopping & Prices',
      words: []
    },
    {
      ch: 6, title: 'まいにちなんじにおきますか',
      topic: 'Daily Routines & Verbs',
      words: []
    },
    {
      ch: 7, title: 'なにをしますか',
      topic: 'Activities & Hobbies',
      words: []
    },
    {
      ch: 8, title: 'にほんごがすきですか',
      topic: 'Likes, Dislikes & Adjectives',
      words: []
    },
    {
      ch: 9, title: 'どこかへいきましたか',
      topic: 'Transportation & Travel',
      words: []
    },
    {
      ch: 10, title: 'どんなまちですか',
      topic: 'Describing a Town',
      words: []
    },
    {
      ch: 11, title: 'このビルのにかいです',
      topic: 'Buildings & Spatial Positions',
      words: []
    },
    {
      ch: 12, title: 'なにをかいましたか',
      topic: 'Shopping & Clothing',
      words: []
    },
    {
      ch: 13, title: 'きのうどこへいきましたか',
      topic: 'Past Tense & Places',
      words: []
    },
    {
      ch: 14, title: 'なにができますか',
      topic: 'Abilities & Can/Cannot',
      words: []
    },
    {
      ch: 15, title: 'たんじょうびはいつですか',
      topic: 'Dates & Months',
      words: []
    },
    {
      ch: 16, title: 'みちをおしえてください',
      topic: 'Giving Directions',
      words: []
    },
    {
      ch: 17, title: 'どうぞよろしく',
      topic: 'Giving & Receiving',
      words: []
    },
    {
      ch: 18, title: 'てんきはどうですか',
      topic: 'Weather & Seasons',
      words: []
    },
    {
      ch: 19, title: 'にほんのたべものがすきです',
      topic: 'Food & Eating Out',
      words: []
    },
    {
      ch: 20, title: 'かぞくのしゃしん',
      topic: 'Family Members',
      words: []
    },
    {
      ch: 21, title: 'びょうきです',
      topic: 'Health & Body',
      words: []
    },
    {
      ch: 22, title: 'わたしのうちにきませんか',
      topic: 'Home & Invitations',
      words: []
    },
    {
      ch: 23, title: 'どんなしごとをしていますか',
      topic: 'Jobs & Workplace',
      words: []
    },
    {
      ch: 24, title: 'もうすぐかんせいします',
      topic: 'Plans & Future',
      words: []
    },
    {
      ch: 25, title: 'これからもよろしく',
      topic: 'Review & Farewells',
      words: []
    },
  ],

  /* ════════════════════════════════════════════════════════
     N4 — Minna no Nihongo II  (Chapters 26–50, labelled 1–25)
     ════════════════════════════════════════════════════════ */
  N4: [
    {
      ch: 1, chBook: 26, title: 'じょうずに なりたいです',
      topic: '〜に なる / Goals & Progress',
      words: []
    },
    {
      ch: 2, chBook: 27, title: 'にほんごが よめます',
      topic: 'Potential Form',
      words: []
    },
    {
      ch: 3, chBook: 28, title: 'なぜ にほんへ きたんですか',
      topic: 'Purpose & Reasons (〜ために)',
      words: []
    },
    {
      ch: 4, chBook: 29, title: 'もし じかんが あれば…',
      topic: 'Conditionals (〜ば / 〜たら / 〜なら)',
      words: []
    },
    {
      ch: 5, chBook: 30, title: '〜といわれています',
      topic: 'Passive Voice',
      words: []
    },
    {
      ch: 6, chBook: 31, title: 'あの えいがを みたことが ありますか',
      topic: 'Causative Form',
      words: []
    },
    {
      ch: 7, chBook: 32, title: 'もっと はやく おきれば よかった',
      topic: 'Expressing Regret (〜ばよかった)',
      words: []
    },
    {
      ch: 8, chBook: 33, title: 'みちを おしえてもらえますか',
      topic: 'Giving / Receiving Favours',
      words: []
    },
    {
      ch: 9, chBook: 34, title: 'どこへ いったら いいですか',
      topic: 'Advice (〜たらどうですか)',
      words: []
    },
    {
      ch: 10, chBook: 35, title: 'うちへ かえったら、すぐ てを あらいます',
      topic: 'Ordering Actions & Sequences',
      words: []
    },
    {
      ch: 11, chBook: 36, title: 'もっと かんがえてみます',
      topic: '〜てみる (Trying Actions)',
      words: []
    },
    {
      ch: 12, chBook: 37, title: 'かいぎは もう はじまっていますか',
      topic: '〜ておく / Preparation',
      words: []
    },
    {
      ch: 13, chBook: 38, title: 'わたしが あのひとを しっています',
      topic: 'Relative Clauses',
      words: []
    },
    {
      ch: 14, chBook: 39, title: 'でんしゃが おくれたので…',
      topic: 'Explanatory Conjunctions',
      words: []
    },
    {
      ch: 15, chBook: 40, title: 'けんこうの ためには こうどう しましょう',
      topic: 'Health & Body',
      words: []
    },
    {
      ch: 16, chBook: 41, title: 'しごとに ついて かんがえています',
      topic: 'Work & Career',
      words: []
    },
    {
      ch: 17, chBook: 42, title: 'テレビを みながら、ごはんを たべています',
      topic: 'Simultaneous Actions (〜ながら)',
      words: []
    },
    {
      ch: 18, chBook: 43, title: 'せんもん は なんですか',
      topic: 'University & Academic Topics',
      words: []
    },
    {
      ch: 19, chBook: 44, title: 'にほんの ぶんかを しょうかいします',
      topic: 'Japanese Culture',
      words: []
    },
    {
      ch: 20, chBook: 45, title: 'かんきょうもんだいに ついて',
      topic: 'Environment & Society',
      words: []
    },
    {
      ch: 21, chBook: 46, title: 'かれに あやまったほうが いいですよ',
      topic: 'Conflict & Resolution',
      words: []
    },
    {
      ch: 22, chBook: 47, title: 'この えいがを みた ことが ありますか',
      topic: 'News & Media',
      words: []
    },
    {
      ch: 23, chBook: 48, title: 'てきとうに やったら だめですよ',
      topic: 'Manner & Attitude',
      words: []
    },
    {
      ch: 24, chBook: 49, title: 'ことばを しらなくても、つたえられます',
      topic: 'Communication',
      words: []
    },
    {
      ch: 25, chBook: 50, title: 'いままで おせわに なりました',
      topic: 'Farewell & Gratitude',
      words: []
    }
  ],

  /* ════════════════════════════════════════════════════════
     N3 — Minna no Nihongo Chukyu  (Chapters 1–12)
     ════════════════════════════════════════════════════════ */
  N3: [
    {
      ch: 1, title: 'なにか かわったことが ありましたか',
      topic: 'Noticing Change & Events',
      words: []
    },
    {
      ch: 2, title: 'ひとに たのむとき',
      topic: 'Making Requests & Seeking Favours',
      words: []
    },
    {
      ch: 3, title: 'じかんの つかいかた',
      topic: 'Time Management',
      words: []
    },
    {
      ch: 4, title: 'ものを たのむ・かす・かりる',
      topic: 'Lending & Borrowing',
      words: []
    },
    {
      ch: 5, title: 'ていねいに ことわる',
      topic: 'Polite Refusals',
      words: []
    },
    {
      ch: 6, title: 'かんじょうを あらわす',
      topic: 'Expressing Emotions',
      words: []
    },
    {
      ch: 7, title: 'いけんを いう',
      topic: 'Expressing & Defending Opinions',
      words: []
    },
    {
      ch: 8, title: 'だれかに つたえる',
      topic: 'Reporting & Quoting',
      words: []
    },
    {
      ch: 9, title: 'ぶんかの ちがい',
      topic: 'Cultural Differences',
      words: []
    },
    {
      ch: 10, title: 'しぜんと かんきょう',
      topic: 'Nature & Environment',
      words: []
    },
    {
      ch: 11, title: 'ニュースを よむ',
      topic: 'Reading News & Headlines',
      words: []
    },
    {
      ch: 12, title: 'まとめ — ふくごうひょうげん',
      topic: 'Review: Complex Expressions',
      words: []
    }
  ],

  /* ════════════════════════════════════════════════════════
     N2 — Nihongo Somatome N2  (8 topic chapters)
     ════════════════════════════════════════════════════════ */
  N2: [
    {
      ch: 1, title: '副詞・接続詞',
      topic: 'Adverbs & Conjunctions',
      words: []
    },
    {
      ch: 2, title: '複合動詞',
      topic: 'Compound Verbs',
      words: []
    },
    {
      ch: 3, title: '文型 — 条件・逆接',
      topic: 'Grammar Patterns: Conditional & Contrast',
      words: []
    },
    {
      ch: 4, title: '文型 — 限定・程度',
      topic: 'Grammar Patterns: Limitation & Degree',
      words: []
    },
    {
      ch: 5, title: '文型 — 変化・様態',
      topic: 'Grammar Patterns: Change & Appearance',
      words: []
    },
    {
      ch: 6, title: '敬語 — 尊敬語・謙譲語',
      topic: 'Keigo: Respectful & Humble Speech',
      words: []
    },
    {
      ch: 7, title: '読解語彙 — 社会・経済',
      topic: 'Reading Vocabulary: Society & Economy',
      words: []
    },
    {
      ch: 8, title: '読解語彙 — 科学・技術',
      topic: 'Reading Vocabulary: Science & Technology',
      words: []
    }
  ],

  /* ════════════════════════════════════════════════════════
     N1 — Nihongo Somatome N1  (8 topic chapters)
     ════════════════════════════════════════════════════════ */
  N1: [
    {
      ch: 1, title: '副詞・文章語',
      topic: 'Advanced Adverbs & Literary Vocabulary',
      words: []
    },
    {
      ch: 2, title: '複合語・派生語',
      topic: 'Compound & Derived Words',
      words: []
    },
    {
      ch: 3, title: '文型 — 強調・主張',
      topic: 'Grammar Patterns: Emphasis & Assertion',
      words: []
    },
    {
      ch: 4, title: '文型 — 理由・原因',
      topic: 'Grammar Patterns: Cause & Reason',
      words: []
    },
    {
      ch: 5, title: '文型 — 評価・判断',
      topic: 'Grammar Patterns: Evaluation & Judgement',
      words: []
    },
    {
      ch: 6, title: '語彙 — 政治・法律',
      topic: 'Vocabulary: Politics & Law',
      words: []
    },
    {
      ch: 7, title: '語彙 — 心理・哲学',
      topic: 'Vocabulary: Psychology & Philosophy',
      words: []
    },
    {
      ch: 8, title: '語彙 — 文学・芸術',
      topic: 'Vocabulary: Literature & Arts',
      words: []
    }
  ]
};

window.NZChapterData = NZChapterData;

/* ─────────────────────────────────────────────────────────────────────────────
   RUNTIME MERGE — injects vocabulary words from vocabLevel.js into each
   chapter object so the rest of the codebase can read chapter.words normally.
   Called automatically once both scripts are loaded.
   ───────────────────────────────────────────────────────────────────────────── */
(function mergeVocabWords() {
  function tryMerge() {
    if (typeof NZChapterVocabWords === 'undefined') {
      setTimeout(tryMerge, 50);
      return;
    }
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
    console.log('[NZ] chapters.js ✓ — vocab words merged from vocabLevel.js');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMerge);
  } else {
    tryMerge();
  }
})();
