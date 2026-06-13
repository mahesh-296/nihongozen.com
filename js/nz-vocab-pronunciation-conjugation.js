/* ════════════════════════════════════════════════════════════════
   NZ VOCAB PRONUNCIATION + CONJUGATION MODULE
   発音 & 動詞の活用 — injects two extra panels into the Vocabulary
   page: (1) Pronunciation practice for the learner's current JLPT
   level (sourced from the main vocabulary list when available), and
   (2) a Verb Conjugation explorer with a small conjugation engine.
   Both panels share the daily-practice dot indicator.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function H(s) {
    if (window.H) return window.H(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function jlptColor(lv) {
    if (window.jlptColor) return window.jlptColor(lv);
    return { N5: '#4CAF82', N4: '#5B9BD5', N3: '#C9973A', N2: '#9B6DD5', N1: '#E8446A' }[lv] || 'var(--primary)';
  }
  function $id(id) { return document.getElementById(id); }
  function getUD() { return (window.getUD && window.getUD()) || window._nzUserData || {}; }

  /* ── Determine the learner's current JLPT level from app level ── */
  function getCurrentJLPTLevel() {
    var lvl = (getUD().level) || 1;
    if (lvl <= 3)  return 'N5';
    if (lvl <= 7)  return 'N4';
    if (lvl <= 12) return 'N3';
    if (lvl <= 18) return 'N2';
    return 'N1';
  }

  /* ── Pronunciation fallback vocab (used if VocabPageWords unavailable
        or has no entries for the current level) ────────────────── */
  var PRONUNCIATION_FALLBACK = {
    N5: [
      { jp: '学校', kana: 'がっこう', romaji: 'gakkō',     en: 'school' },
      { jp: '友達', kana: 'ともだち', romaji: 'tomodachi', en: 'friend' },
      { jp: '時間', kana: 'じかん',   romaji: 'jikan',     en: 'time' },
      { jp: '水',   kana: 'みず',     romaji: 'mizu',      en: 'water' },
      { jp: '今日', kana: 'きょう',   romaji: 'kyō',       en: 'today' },
      { jp: '電車', kana: 'でんしゃ', romaji: 'densha',    en: 'train' }
    ],
    N4: [
      { jp: '経験', kana: 'けいけん', romaji: 'keiken',   en: 'experience' },
      { jp: '習慣', kana: 'しゅうかん', romaji: 'shūkan', en: 'habit' },
      { jp: '予定', kana: 'よてい',   romaji: 'yotei',    en: 'plan' },
      { jp: '天気', kana: 'てんき',   romaji: 'tenki',    en: 'weather' },
      { jp: '会議', kana: 'かいぎ',   romaji: 'kaigi',    en: 'meeting' },
      { jp: '近所', kana: 'きんじょ', romaji: 'kinjo',    en: 'neighborhood' }
    ],
    N3: [
      { jp: '環境', kana: 'かんきょう', romaji: 'kankyō', en: 'environment' },
      { jp: '責任', kana: 'せきにん', romaji: 'sekinin', en: 'responsibility' },
      { jp: '影響', kana: 'えいきょう', romaji: 'eikyō',  en: 'influence' },
      { jp: '原因', kana: 'げんいん', romaji: 'gen-in',  en: 'cause' },
      { jp: '状況', kana: 'じょうきょう', romaji: 'jōkyō', en: 'situation' },
      { jp: '対策', kana: 'たいさく', romaji: 'taisaku', en: 'countermeasure' }
    ],
    N2: [
      { jp: '矛盾', kana: 'むじゅん', romaji: 'mujun',   en: 'contradiction' },
      { jp: '傾向', kana: 'けいこう', romaji: 'keikō',   en: 'tendency' },
      { jp: '効果', kana: 'こうか',   romaji: 'kōka',    en: 'effect' },
      { jp: '比較', kana: 'ひかく',   romaji: 'hikaku',  en: 'comparison' },
      { jp: '見解', kana: 'けんかい', romaji: 'kenkai',  en: 'viewpoint' },
      { jp: '改善', kana: 'かいぜん', romaji: 'kaizen',  en: 'improvement' }
    ],
    N1: [
      { jp: '曖昧', kana: 'あいまい', romaji: 'aimai',     en: 'ambiguous' },
      { jp: '顕著', kana: 'けんちょ', romaji: 'kencho',    en: 'remarkable' },
      { jp: '緩和', kana: 'かんわ',   romaji: 'kanwa',     en: 'mitigation' },
      { jp: '概念', kana: 'がいねん', romaji: 'gainen',    en: 'concept' },
      { jp: '潜在', kana: 'せんざい', romaji: 'senzai',    en: 'latent' },
      { jp: '洞察', kana: 'どうさつ', romaji: 'dōsatsu',   en: 'insight' }
    ]
  };

  /* ── Verb conjugation dataset, curated per JLPT level ──────────── */
  var VERB_DATA = {
    N5: [
      { kanji: '食べる', kana: 'たべる', en: 'to eat',    group: 'ichidan' },
      { kanji: '飲む',   kana: 'のむ',   en: 'to drink',  group: 'godan' },
      { kanji: '見る',   kana: 'みる',   en: 'to see',    group: 'ichidan' },
      { kanji: '行く',   kana: 'いく',   en: 'to go',     group: 'godan-iku' },
      { kanji: '話す',   kana: 'はなす', en: 'to speak',  group: 'godan' },
      { kanji: '読む',   kana: 'よむ',   en: 'to read',   group: 'godan' },
      { kanji: 'する',   kana: 'する',   en: 'to do',     group: 'suru' },
      { kanji: '来る',   kana: 'くる',   en: 'to come',   group: 'kuru' }
    ],
    N4: [
      { kanji: '待つ',   kana: 'まつ',   en: 'to wait',   group: 'godan' },
      { kanji: '作る',   kana: 'つくる', en: 'to make',   group: 'godan' },
      { kanji: '開ける', kana: 'あける', en: 'to open',   group: 'ichidan' },
      { kanji: '閉める', kana: 'しめる', en: 'to close',  group: 'ichidan' },
      { kanji: '持つ',   kana: 'もつ',   en: 'to hold',   group: 'godan' },
      { kanji: '教える', kana: 'おしえる', en: 'to teach', group: 'ichidan' },
      { kanji: '泳ぐ',   kana: 'およぐ', en: 'to swim',   group: 'godan' },
      { kanji: '急ぐ',   kana: 'いそぐ', en: 'to hurry',  group: 'godan' }
    ],
    N3: [
      { kanji: '続ける', kana: 'つづける', en: 'to continue', group: 'ichidan' },
      { kanji: '決める', kana: 'きめる', en: 'to decide',  group: 'ichidan' },
      { kanji: '比べる', kana: 'くらべる', en: 'to compare', group: 'ichidan' },
      { kanji: '増える', kana: 'ふえる', en: 'to increase', group: 'ichidan' },
      { kanji: '減る',   kana: 'へる',   en: 'to decrease', group: 'godan' },
      { kanji: '通う',   kana: 'かよう', en: 'to commute', group: 'godan' },
      { kanji: '楽しむ', kana: 'たのしむ', en: 'to enjoy',  group: 'godan' },
      { kanji: '役立つ', kana: 'やくだつ', en: 'to be useful', group: 'godan' }
    ],
    N2: [
      { kanji: '改める', kana: 'あらためる', en: 'to reform',  group: 'ichidan' },
      { kanji: '抱える', kana: 'かかえる', en: 'to carry/hold', group: 'ichidan' },
      { kanji: '諦める', kana: 'あきらめる', en: 'to give up', group: 'ichidan' },
      { kanji: '整える', kana: 'ととのえる', en: 'to arrange', group: 'ichidan' },
      { kanji: '補う',   kana: 'おぎなう', en: 'to compensate', group: 'godan' },
      { kanji: '従う',   kana: 'したがう', en: 'to obey',    group: 'godan' },
      { kanji: '養う',   kana: 'やしなう', en: 'to nurture', group: 'godan' },
      { kanji: '試みる', kana: 'こころみる', en: 'to attempt', group: 'ichidan' }
    ],
    N1: [
      { kanji: '著す',   kana: 'あらわす', en: 'to publish/write', group: 'godan' },
      { kanji: '携わる', kana: 'たずさわる', en: 'to be engaged in', group: 'godan' },
      { kanji: '見なす', kana: 'みなす', en: 'to deem',    group: 'godan' },
      { kanji: '培う',   kana: 'つちかう', en: 'to cultivate', group: 'godan' },
      { kanji: '顧みる', kana: 'かえりみる', en: 'to reflect on', group: 'ichidan' },
      { kanji: '危ぶむ', kana: 'あやぶむ', en: 'to be worried about', group: 'godan' },
      { kanji: '心掛ける', kana: 'こころがける', en: 'to keep in mind', group: 'ichidan' },
      { kanji: '老いる', kana: 'おいる', en: 'to grow old', group: 'ichidan' }
    ]
  };

  /* ── Conjugation engine ────────────────────────────────────────
     Godan row table: u-row ending -> [a, i, e, taTe-base]        */
  var GODAN_ROWS = {
    'う': { a: 'わ', i: 'い', e: 'え', sound: 'っ' },
    'く': { a: 'か', i: 'き', e: 'け', sound: 'い', taSuf: 'た', teSuf: 'て' },
    'ぐ': { a: 'が', i: 'ぎ', e: 'げ', sound: 'い', taSuf: 'だ', teSuf: 'で' },
    'す': { a: 'さ', i: 'し', e: 'せ', sound: 'し', taSuf: 'た', teSuf: 'て' },
    'つ': { a: 'た', i: 'ち', e: 'て', sound: 'っ' },
    'ぬ': { a: 'な', i: 'に', e: 'ね', sound: 'ん' },
    'ぶ': { a: 'ば', i: 'び', e: 'べ', sound: 'ん' },
    'む': { a: 'ま', i: 'み', e: 'め', sound: 'ん' },
    'る': { a: 'ら', i: 'り', e: 'れ', sound: 'っ' }
  };

  var GODAN_O_ROW = { 'う':'お','く':'こ','ぐ':'ご','す':'そ','つ':'と','ぬ':'の','ぶ':'ぼ','む':'も','る':'ろ' };

  function conjugate(v) {
    var kStem = v.kanji.slice(0, -1);
    var lastKana = v.kana.slice(-1);

    if (v.group === 'suru') {
      return {
        dictionary: v.kanji,
        masu: kStem + 'します', polite_neg: kStem + 'しません',
        nai: kStem + 'しない', ta: kStem + 'した', nakatta: kStem + 'しなかった',
        te: kStem + 'して', potential: kStem + 'できる', volitional: kStem + 'しよう',
        polite_past: kStem + 'しました'
      };
    }
    if (v.group === 'kuru') {
      return {
        dictionary: v.kanji,
        masu: kStem + 'きます', polite_neg: kStem + 'きません',
        nai: kStem + 'こない', ta: kStem + 'きた', nakatta: kStem + 'こなかった',
        te: kStem + 'きて', potential: kStem + 'られる', volitional: kStem + 'こよう',
        polite_past: kStem + 'きました'
      };
    }
    if (v.group === 'godan-iku') {
      return {
        dictionary: v.kanji,
        masu: kStem + 'きます', polite_neg: kStem + 'きません',
        nai: kStem + 'かない', ta: kStem + 'った', nakatta: kStem + 'かなかった',
        te: kStem + 'って', potential: kStem + 'ける', volitional: kStem + 'こう',
        polite_past: kStem + 'きました'
      };
    }
    if (v.group === 'ichidan') {
      return {
        dictionary: v.kanji,
        masu: kStem + 'ます', polite_neg: kStem + 'ません',
        nai: kStem + 'ない', ta: kStem + 'た', nakatta: kStem + 'なかった',
        te: kStem + 'て', potential: kStem + 'られる', volitional: kStem + 'よう',
        polite_past: kStem + 'ました'
      };
    }
    /* regular godan */
    var row = GODAN_ROWS[lastKana] || GODAN_ROWS['う'];
    var taTe = row.sound === 'っ' ? { ta: 'った', te: 'って' }
             : row.sound === 'ん' ? { ta: 'んだ', te: 'んで' }
             : { ta: row.sound + (row.taSuf || 'た'), te: row.sound + (row.teSuf || 'て') };
    return {
      dictionary: v.kanji,
      masu: kStem + row.i + 'ます', polite_neg: kStem + row.i + 'ません',
      nai: kStem + row.a + 'ない', ta: kStem + taTe.ta, nakatta: kStem + row.a + 'なかった',
      te: kStem + taTe.te, potential: kStem + row.e + 'る',
      volitional: kStem + (GODAN_O_ROW[lastKana] || 'お') + 'う',
      polite_past: kStem + row.i + 'ました'
    };
  }

  var FORM_LABELS = [
    ['dictionary',  'Dictionary form',        'plain · present affirmative'],
    ['masu',        'Polite present (ます)',   'present affirmative, polite'],
    ['polite_past', 'Polite past (ました)',    'past affirmative, polite'],
    ['nai',         'Negative (ない)',         'plain · present negative'],
    ['nakatta',     'Past negative (なかった)', 'plain · past negative'],
    ['ta',          'Past (た)',               'plain · past affirmative'],
    ['te',          'Te-form (て)',            'used for requests, joining clauses'],
    ['potential',   'Potential',               '"can do" form'],
    ['volitional',  'Volitional (よう/おう)',   '"let\'s ___" form']
  ];

  /* ── Speech helper with selectable rate ────────────────────────── */
  function speakAt(text, rate) {
    if (window.speak) { window.speak(text, rate); return; }
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'ja-JP'; u.rate = rate || 0.85;
    window.speechSynthesis.speak(u);
  }

  /* ── Get pronunciation vocab list for a level ─────────────────── */
  function getPronunciationWords(level) {
    if (typeof VocabPageWords !== 'undefined' && Array.isArray(VocabPageWords)) {
      var list = VocabPageWords.filter(function (w) { return w.level === level; });
      if (list.length) {
        return list.slice(0, 8).map(function (w) {
          return {
            jp: w.word || w.jp || w.kanji || '',
            kana: w.reading || w.kana || '',
            romaji: w.romaji || '',
            en: w.meaning || w.en || ''
          };
        });
      }
    }
    return PRONUNCIATION_FALLBACK[level] || PRONUNCIATION_FALLBACK.N5;
  }

  /* ── Quick links bar: connects Vocabulary ↔ Conversation page ─── */
  function quickLinksHTML(level) {
    var c = jlptColor(level);
    return '<div id="nz-vocab-quicklinks" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;' +
      'padding:12px 16px;margin-bottom:14px;border-radius:12px;background:' + c + '12;border:1px solid ' + c + '40;">' +
      '<span style="font-size:12px;font-weight:700;color:var(--fg-muted);">More practice for ' + level + ':</span>' +
      '<button data-vocab-link="conversation" class="nz-btn nz-btn-pri" style="font-size:12px;padding:6px 14px;">' +
        '💬 Go to Conversation Practice</button>' +
      '<button data-vocab-link="pron" class="nz-btn nz-btn-ghost" style="font-size:12px;padding:6px 14px;">' +
        '🔊 Jump to Pronunciation</button>' +
      '<button data-vocab-link="conj" class="nz-btn nz-btn-ghost" style="font-size:12px;padding:6px 14px;">' +
        '活 Jump to Conjugation</button>' +
    '</div>';
  }

  /* ── Panel renderers ───────────────────────────────────────────── */
  var conjSelected = {}; /* level -> verb index */

  function pronunciationPanelHTML(level) {
    var c = jlptColor(level);
    var words = getPronunciationWords(level);
    return '<div class="card" id="nz-pron-panel" style="padding:20px;margin-bottom:18px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:4px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:10px;font-weight:800;color:' + c + ';background:' + c + '18;' +
            'border:1px solid ' + c + ';padding:2px 8px;border-radius:5px;font-family:\'JetBrains Mono\',monospace;">' + level + '</span>' +
          '<h3 style="font-size:14px;font-weight:700;color:var(--fg);margin:0;">🔊 Pronunciation Practice</h3>' +
        '</div>' +
        '<div data-nz-daily-dots="7" data-nz-daily-title="Streak"></div>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--fg-muted);margin:0 0 14px;">Based on your current level (' + level + '). Tap a word, then play it at different speeds.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:9px;">' +
        words.map(function (w, i) {
          return '<div style="padding:11px 13px;border-radius:10px;background:var(--card-elevated);' +
            'border:1px solid var(--border);">' +
            '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:15px;font-weight:700;color:var(--fg);margin:0 0 1px;">' + H(w.jp) + '</p>' +
            (w.kana ? '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:11px;color:' + c + ';margin:0 0 1px;">' + H(w.kana) + '</p>' : '') +
            '<p style="font-size:11px;color:var(--fg-muted);margin:0 0 8px;">' + H(w.en) + '</p>' +
            '<div style="display:flex;gap:5px;">' +
              '<button data-pron-speak="' + i + '" data-pron-rate="0.6" style="flex:1;font-size:11px;padding:4px 0;border-radius:6px;' +
                'border:1px solid var(--border);background:var(--card);color:var(--fg-muted);cursor:pointer;">🐢 Slow</button>' +
              '<button data-pron-speak="' + i + '" data-pron-rate="0.95" style="flex:1;font-size:11px;padding:4px 0;border-radius:6px;' +
                'border:1px solid ' + c + ';background:' + c + '18;color:' + c + ';cursor:pointer;font-weight:700;">▶ Normal</button>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function conjugationPanelHTML(level) {
    var c = jlptColor(level);
    var verbs = VERB_DATA[level] || VERB_DATA.N5;
    var idx = conjSelected[level] || 0;
    var v = verbs[idx];
    var forms = conjugate(v);

    return '<div class="card" id="nz-conj-panel" style="padding:20px;margin-bottom:18px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:4px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:10px;font-weight:800;color:' + c + ';background:' + c + '18;' +
            'border:1px solid ' + c + ';padding:2px 8px;border-radius:5px;font-family:\'JetBrains Mono\',monospace;">' + level + '</span>' +
          '<h3 style="font-size:14px;font-weight:700;color:var(--fg);margin:0;">活 Verb Conjugation</h3>' +
        '</div>' +
        '<div data-nz-daily-dots="7" data-nz-daily-title="Streak"></div>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--fg-muted);margin:0 0 14px;">Verbs scaled to your current level. Pick one to see all its forms.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">' +
        verbs.map(function (vb, i) {
          var active = i === idx;
          return '<button data-conj-verb="' + i + '" style="padding:7px 13px;border-radius:9px;font-size:13px;font-weight:700;' +
            'font-family:\'Noto Sans JP\',sans-serif;cursor:pointer;transition:all .15s;' +
            'background:' + (active ? c : 'var(--card-elevated)') + ';' +
            'color:' + (active ? '#fff' : 'var(--fg-muted)') + ';' +
            'border:1px solid ' + (active ? c : 'var(--border)') + ';">' + H(vb.kanji) + '</button>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">' +
        '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:20px;font-weight:800;color:var(--fg);">' + H(v.kanji) + '</span>' +
        '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;color:var(--fg-muted);">(' + H(v.kana) + ')</span>' +
        '<span style="font-size:12px;color:var(--fg-subtle);font-style:italic;">' + H(v.en) + '</span>' +
        '<button data-conj-speak="' + H(v.kana) + '" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--primary);font-size:15px;">🔊</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">' +
        FORM_LABELS.map(function (f) {
          var key = f[0], label = f[1], hint = f[2];
          var form = forms[key];
          return '<div style="padding:10px 12px;border-radius:9px;background:var(--card-elevated);border:1px solid var(--border);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">' +
              '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:14px;font-weight:700;color:var(--fg);">' + H(form) + '</span>' +
              '<button data-conj-speak="' + H(form) + '" style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:13px;flex-shrink:0;">🔊</button>' +
            '</div>' +
            '<p style="font-size:10px;font-weight:700;color:' + c + ';margin:4px 0 0;text-transform:uppercase;letter-spacing:.06em;">' + label + '</p>' +
            '<p style="font-size:10px;color:var(--fg-subtle);margin:1px 0 0;">' + hint + '</p>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  /* ── Main injector ─────────────────────────────────────────────── */
  function injectPanels() {
    var page = document.querySelector('#nz-content .nz-page');
    if (!page) return;
    var level = getCurrentJLPTLevel();

    var existing = $id('nz-vocab-level-panels');
    var html = quickLinksHTML(level) + pronunciationPanelHTML(level) + conjugationPanelHTML(level);

    if (existing) {
      existing.innerHTML = html;
    } else {
      var wrap = document.createElement('div');
      wrap.id = 'nz-vocab-level-panels';
      wrap.innerHTML = html;

      var srsRow = $id('nz-vocab-srs-row');
      if (srsRow && srsRow.nextSibling) {
        page.insertBefore(wrap, srsRow.nextSibling);
      } else if (srsRow) {
        page.appendChild(wrap);
      } else {
        page.insertBefore(wrap, page.firstChild);
      }
    }

    wireEvents(level);
    if (window.NzDailyTracker) window.NzDailyTracker.refreshAll();
  }

  function wireEvents(level) {
    var root = $id('nz-vocab-level-panels');
    if (!root) return;
    var words = getPronunciationWords(level);

    root.querySelectorAll('[data-vocab-link]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-vocab-link');
        if (target === 'conversation') {
          if (window.Router && typeof window.Router.go === 'function') {
            window.Router.go('conversation');
          }
        } else if (target === 'pron') {
          var pron = $id('nz-pron-panel');
          if (pron) pron.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (target === 'conj') {
          var conj = $id('nz-conj-panel');
          if (conj) conj.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    root.querySelectorAll('[data-pron-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-pron-speak'), 10);
        var rate = parseFloat(btn.getAttribute('data-pron-rate'));
        var w = words[i];
        speakAt(w.kana || w.jp, rate);
        if (window.NzDailyTracker) window.NzDailyTracker.mark('pronunciation');
      });
    });

    root.querySelectorAll('[data-conj-verb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        conjSelected[level] = parseInt(btn.getAttribute('data-conj-verb'), 10);
        injectPanels();
        if (window.NzDailyTracker) window.NzDailyTracker.mark('conjugation');
      });
    });

    root.querySelectorAll('[data-conj-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        speakAt(btn.getAttribute('data-conj-speak'), 0.85);
      });
    });
  }

  /* ── Hook into Pages.vocab (after SRS-row injection has run) ───── */
  function hookVocabPage() {
    if (!window.Pages || typeof Pages.vocab !== 'function' || Pages.vocab._nzPronConjWrapped) {
      setTimeout(hookVocabPage, 100);
      return;
    }
    var prev = Pages.vocab;
    Pages.vocab = function () {
      prev();
      setTimeout(injectPanels, 40);
    };
    Pages.vocab._nzPronConjWrapped = true;
  }

  hookVocabPage();
})();
