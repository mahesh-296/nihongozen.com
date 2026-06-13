/* ════════════════════════════════════════════════════════════════
   NZ PRONUNCIATION MODULE
   発音 — Pronunciation Practice
   Sidebar page (placed directly below "Conversation"). Lets the
   learner pick a JLPT level (with theme icons: N5🌱 N4🍃 N3🌳 N2🏢 N1⛰),
   flip through flashcards for vocabulary or verb-conjugation forms,
   hear them via speechSynthesis at adjustable speed, and practice
   speaking them back via the microphone (SpeechRecognition).
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
    return { N5: 'var(--n5)', N4: 'var(--n4)', N3: 'var(--n3)', N2: 'var(--n2)', N1: 'var(--n1)' }[lv] || 'var(--primary)';
  }
  function $id(id) { return document.getElementById(id); }
  function getUD() { return (window.getUD && window.getUD()) || window._nzUserData || {}; }

  /* Theme-consistent level icons, shared with SRS Review pills */
  var LEVEL_ICON = { N5: '🌱', N4: '🍃', N3: '🌳', N2: '🏢', N1: '⛰️' };
  var LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

  function getCurrentJLPTLevel() {
    var lvl = (getUD().level) || 1;
    if (lvl <= 3)  return 'N5';
    if (lvl <= 7)  return 'N4';
    if (lvl <= 12) return 'N3';
    if (lvl <= 18) return 'N2';
    return 'N1';
  }

  /* ── Vocabulary flashcard data (per level) ─────────────────────── */
  var VOCAB_DATA = {
    N5: [
      { jp: '学校', kana: 'がっこう', romaji: 'gakkō',  en: 'school' },
      { jp: '友達', kana: 'ともだち', romaji: 'tomodachi', en: 'friend' },
      { jp: '時間', kana: 'じかん',   romaji: 'jikan',  en: 'time' },
      { jp: '水',   kana: 'みず',     romaji: 'mizu',   en: 'water' },
      { jp: '今日', kana: 'きょう',   romaji: 'kyō',    en: 'today' },
      { jp: '電車', kana: 'でんしゃ', romaji: 'densha', en: 'train' }
    ],
    N4: [
      { jp: '経験', kana: 'けいけん', romaji: 'keiken',  en: 'experience' },
      { jp: '習慣', kana: 'しゅうかん', romaji: 'shūkan', en: 'habit' },
      { jp: '予定', kana: 'よてい',   romaji: 'yotei',   en: 'plan' },
      { jp: '天気', kana: 'てんき',   romaji: 'tenki',   en: 'weather' },
      { jp: '会議', kana: 'かいぎ',   romaji: 'kaigi',   en: 'meeting' },
      { jp: '近所', kana: 'きんじょ', romaji: 'kinjo',   en: 'neighborhood' }
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
      { jp: '矛盾', kana: 'むじゅん', romaji: 'mujun',  en: 'contradiction' },
      { jp: '傾向', kana: 'けいこう', romaji: 'keikō',  en: 'tendency' },
      { jp: '効果', kana: 'こうか',   romaji: 'kōka',   en: 'effect' },
      { jp: '比較', kana: 'ひかく',   romaji: 'hikaku', en: 'comparison' },
      { jp: '見解', kana: 'けんかい', romaji: 'kenkai', en: 'viewpoint' },
      { jp: '改善', kana: 'かいぜん', romaji: 'kaizen', en: 'improvement' }
    ],
    N1: [
      { jp: '曖昧', kana: 'あいまい', romaji: 'aimai',   en: 'ambiguous' },
      { jp: '顕著', kana: 'けんちょ', romaji: 'kencho',  en: 'remarkable' },
      { jp: '緩和', kana: 'かんわ',   romaji: 'kanwa',   en: 'mitigation' },
      { jp: '概念', kana: 'がいねん', romaji: 'gainen',  en: 'concept' },
      { jp: '潜在', kana: 'せんざい', romaji: 'senzai',  en: 'latent' },
      { jp: '洞察', kana: 'どうさつ', romaji: 'dōsatsu', en: 'insight' }
    ]
  };

  /* ── Verb conjugation flashcard data (per level) ───────────────── */
  var VERB_DATA = {
    N5: [
      { kanji: '食べる', kana: 'たべる', en: 'to eat',   group: 'ichidan' },
      { kanji: '飲む',   kana: 'のむ',   en: 'to drink', group: 'godan' },
      { kanji: '見る',   kana: 'みる',   en: 'to see',   group: 'ichidan' },
      { kanji: '行く',   kana: 'いく',   en: 'to go',    group: 'godan-iku' },
      { kanji: '話す',   kana: 'はなす', en: 'to speak', group: 'godan' },
      { kanji: 'する',   kana: 'する',   en: 'to do',    group: 'suru' },
      { kanji: '来る',   kana: 'くる',   en: 'to come',  group: 'kuru' }
    ],
    N4: [
      { kanji: '待つ',   kana: 'まつ',   en: 'to wait',  group: 'godan' },
      { kanji: '作る',   kana: 'つくる', en: 'to make',  group: 'godan' },
      { kanji: '開ける', kana: 'あける', en: 'to open',  group: 'ichidan' },
      { kanji: '閉める', kana: 'しめる', en: 'to close', group: 'ichidan' },
      { kanji: '教える', kana: 'おしえる', en: 'to teach', group: 'ichidan' },
      { kanji: '泳ぐ',   kana: 'およぐ', en: 'to swim',  group: 'godan' }
    ],
    N3: [
      { kanji: '続ける', kana: 'つづける', en: 'to continue', group: 'ichidan' },
      { kanji: '決める', kana: 'きめる', en: 'to decide',  group: 'ichidan' },
      { kanji: '比べる', kana: 'くらべる', en: 'to compare', group: 'ichidan' },
      { kanji: '増える', kana: 'ふえる', en: 'to increase', group: 'ichidan' },
      { kanji: '減る',   kana: 'へる',   en: 'to decrease', group: 'godan' },
      { kanji: '通う',   kana: 'かよう', en: 'to commute', group: 'godan' }
    ],
    N2: [
      { kanji: '改める', kana: 'あらためる', en: 'to reform',  group: 'ichidan' },
      { kanji: '抱える', kana: 'かかえる', en: 'to carry/hold', group: 'ichidan' },
      { kanji: '諦める', kana: 'あきらめる', en: 'to give up', group: 'ichidan' },
      { kanji: '補う',   kana: 'おぎなう', en: 'to compensate', group: 'godan' },
      { kanji: '従う',   kana: 'したがう', en: 'to obey',    group: 'godan' },
      { kanji: '試みる', kana: 'こころみる', en: 'to attempt', group: 'ichidan' }
    ],
    N1: [
      { kanji: '著す',   kana: 'あらわす', en: 'to publish/write', group: 'godan' },
      { kanji: '携わる', kana: 'たずさわる', en: 'to be engaged in', group: 'godan' },
      { kanji: '見なす', kana: 'みなす', en: 'to deem',    group: 'godan' },
      { kanji: '培う',   kana: 'つちかう', en: 'to cultivate', group: 'godan' },
      { kanji: '顧みる', kana: 'かえりみる', en: 'to reflect on', group: 'ichidan' },
      { kanji: '老いる', kana: 'おいる', en: 'to grow old', group: 'ichidan' }
    ]
  };

  /* ── Conjugation engine (godan/ichidan/irregular) ──────────────── */
  var GODAN_ROWS = {
    'う': { a:'わ', i:'い', e:'え', sound:'っ' },
    'く': { a:'か', i:'き', e:'け', sound:'い', taSuf:'た', teSuf:'て' },
    'ぐ': { a:'が', i:'ぎ', e:'げ', sound:'い', taSuf:'だ', teSuf:'で' },
    'す': { a:'さ', i:'し', e:'せ', sound:'し', taSuf:'た', teSuf:'て' },
    'つ': { a:'た', i:'ち', e:'て', sound:'っ' },
    'ぬ': { a:'な', i:'に', e:'ね', sound:'ん' },
    'ぶ': { a:'ば', i:'び', e:'べ', sound:'ん' },
    'む': { a:'ま', i:'み', e:'め', sound:'ん' },
    'る': { a:'ら', i:'り', e:'れ', sound:'っ' }
  };
  var GODAN_O_ROW = { 'う':'お','く':'こ','ぐ':'ご','す':'そ','つ':'と','ぬ':'の','ぶ':'ぼ','む':'も','る':'ろ' };

  function conjugate(v) {
    var kStem = v.kanji.slice(0, -1);
    var lastKana = v.kana.slice(-1);
    if (v.group === 'suru') {
      return { masu: kStem+'します', nai: kStem+'しない', ta: kStem+'した', te: kStem+'して' };
    }
    if (v.group === 'kuru') {
      return { masu: kStem+'きます', nai: kStem+'こない', ta: kStem+'きた', te: kStem+'きて' };
    }
    if (v.group === 'godan-iku') {
      return { masu: kStem+'きます', nai: kStem+'かない', ta: kStem+'った', te: kStem+'って' };
    }
    if (v.group === 'ichidan') {
      return { masu: kStem+'ます', nai: kStem+'ない', ta: kStem+'た', te: kStem+'て' };
    }
    var row = GODAN_ROWS[lastKana] || GODAN_ROWS['う'];
    var taTe = row.sound === 'っ' ? { ta:'った', te:'って' }
             : row.sound === 'ん' ? { ta:'んだ', te:'んで' }
             : { ta: row.sound + (row.taSuf||'た'), te: row.sound + (row.teSuf||'て') };
    return { masu: kStem+row.i+'ます', nai: kStem+row.a+'ない', ta: kStem+taTe.ta, te: kStem+taTe.te };
  }

  /* ── State ──────────────────────────────────────────────────────── */
  var state = { level: 'N5', deck: 'vocab', index: 0, flipped: false, feedback: '', listening: false };
  var recognizer = null;

  /* ── Speech synthesis ───────────────────────────────────────────── */
  function speakAt(text, rate) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'ja-JP'; u.rate = rate || 0.85;
    window.speechSynthesis.speak(u);
  }

  /* ── Microphone (SpeechRecognition) ────────────────────────────── */
  function micSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  function normalize(s) {
    return String(s || '').replace(/[\s。、.!?！？ー]/g, '').toLowerCase();
  }
  function startMic(root, target) {
    var Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      state.feedback = '🎤 Speech recognition isn\'t supported in this browser.';
      renderFeedback(root);
      return;
    }
    if (state.listening) { stopMic(); return; }
    recognizer = new Ctor();
    recognizer.lang = 'ja-JP';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    state.listening = true;
    state.feedback = '🎤 Listening… say the word aloud';
    renderFeedback(root);

    recognizer.onresult = function (e) {
      var heard = e.results[0][0].transcript;
      var match = normalize(heard) === normalize(target);
      state.feedback = match
        ? '✅ Great! Heard: "' + heard + '"'
        : '🔁 Heard "' + heard + '" — try again for "' + target + '"';
      if (match && window.NzDailyTracker) window.NzDailyTracker.mark('pronunciation');
      renderFeedback(root);
    };
    recognizer.onerror = function () {
      state.feedback = '🎤 Couldn\'t hear you clearly — try again.';
      renderFeedback(root);
    };
    recognizer.onend = function () {
      state.listening = false;
      updateMicButton(root);
    };
    try { recognizer.start(); } catch (e) { state.listening = false; }
    updateMicButton(root);
  }
  function stopMic() {
    if (recognizer) { try { recognizer.stop(); } catch (e) {} }
    state.listening = false;
  }
  function updateMicButton(root) {
    var btn = root.querySelector('[data-pron-mic]');
    if (btn) btn.textContent = state.listening ? '⏹ Stop' : '🎤 Speak';
  }
  function renderFeedback(root) {
    var el = root.querySelector('#pron-feedback');
    if (el) el.textContent = state.feedback;
    updateMicButton(root);
  }

  /* ── Card data accessor ─────────────────────────────────────────── */
  function getDeck() {
    return state.deck === 'vocab' ? (VOCAB_DATA[state.level] || []) : (VERB_DATA[state.level] || []);
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  function render(root) {
    var c = jlptColor(state.level);
    var deck = getDeck();
    if (state.index >= deck.length) state.index = 0;
    var card = deck[state.index] || {};
    var isVocab = state.deck === 'vocab';
    var forms = !isVocab ? conjugate(card) : null;

    root.innerHTML =
      '<div class="nz-page nz-fadein">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:18px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
              '<span style="font-family:\'Noto Serif JP\',serif;font-size:22px;color:var(--fg);font-weight:700;letter-spacing:-.3px;">発音</span>' +
              '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0;letter-spacing:-.4px;">Pronunciation Practice</h1>' +
            '</div>' +
            '<p style="font-size:13px;color:var(--fg-muted);margin:0;">Flip flashcards, listen, and practice speaking with the microphone</p>' +
          '</div>' +
          '<div data-nz-daily-dots="7" data-nz-daily-title="This week" ' +
            'style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 14px;"></div>' +
        '</div>' +

        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">' +
          LEVELS.map(function (lv) {
            var active = lv === state.level;
            var lc = jlptColor(lv);
            return '<button data-pron-level="' + lv + '" ' +
              'style="display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;font-size:13px;' +
              'font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s;' +
              'background:' + (active ? lc : 'var(--card-elevated)') + ';' +
              'color:' + (active ? '#fff' : 'var(--fg-muted)') + ';' +
              'border:1px solid ' + (active ? lc : 'var(--border)') + ';">' +
              '<span>' + LEVEL_ICON[lv] + '</span>' + lv + '</button>';
          }).join('') +
        '</div>' +

        '<div style="display:flex;gap:8px;margin-bottom:18px;">' +
          ['vocab', 'verbs'].map(function (d) {
            var active = d === state.deck;
            return '<button data-pron-deck="' + d + '" ' +
              'style="padding:8px 16px;border-radius:9px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;' +
              'background:' + (active ? c : 'var(--card-elevated)') + ';' +
              'color:' + (active ? '#fff' : 'var(--fg-muted)') + ';' +
              'border:1px solid ' + (active ? c : 'var(--border)') + ';">' +
              (d === 'vocab' ? '📖 Vocabulary' : '活 Verb Conjugation') + '</button>';
          }).join('') +
        '</div>' +

        '<div class="card" style="padding:0;overflow:hidden;max-width:560px;margin:0 auto 16px;">' +
          '<div id="pron-flip-card" data-pron-flip ' +
            'style="padding:36px 28px;min-height:200px;display:flex;flex-direction:column;align-items:center;' +
            'justify-content:center;text-align:center;cursor:pointer;background:linear-gradient(135deg,' + c + '14,transparent);">' +
            (state.flipped
              ? (isVocab
                  ? '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:16px;color:' + c + ';margin:0 0 6px;">' + H(card.kana || '') + '</p>' +
                    (card.romaji ? '<p style="font-family:var(--font-mono);font-size:13px;color:var(--fg-muted);margin:0 0 10px;">' + H(card.romaji) + '</p>' : '') +
                    '<p style="font-size:14px;color:var(--fg);font-style:italic;margin:0;">' + H(card.en || '') + '</p>'
                  : '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;color:' + c + ';margin:0 0 10px;">' + H(card.en || '') + '</p>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:340px;">' +
                      ['masu','nai','ta','te'].map(function (k) {
                        var lbl = { masu: 'ます', nai: 'ない', ta: 'た', te: 'て' }[k];
                        return '<div style="padding:8px;border-radius:8px;background:var(--card-elevated);border:1px solid var(--border);">' +
                          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:14px;font-weight:700;color:var(--fg);margin:0;">' + H(forms[k]) + '</p>' +
                          '<p style="font-size:10px;color:' + c + ';margin:2px 0 0;font-weight:700;">' + lbl + '</p>' +
                        '</div>';
                      }).join('') +
                    '</div>')
              : '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:34px;font-weight:800;color:var(--fg);margin:0;">' +
                  H(isVocab ? card.jp : card.kanji) + '</p>' +
                '<p style="font-size:12px;color:var(--fg-subtle);margin:10px 0 0;">Tap to flip</p>') +
          '</div>' +
        '</div>' +

        '<div style="display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">' +
          '<button data-pron-nav="prev" class="nz-btn nz-btn-ghost">◀ Prev</button>' +
          '<button data-pron-speak="0.6" class="nz-btn nz-btn-ghost">🐢 Slow</button>' +
          '<button data-pron-speak="0.95" class="nz-btn nz-btn-pri">▶ Listen</button>' +
          (micSupported()
            ? '<button data-pron-mic class="nz-btn nz-btn-ghost" style="color:' + c + ';border-color:' + c + ';">🎤 Speak</button>'
            : '') +
          '<button data-pron-nav="next" class="nz-btn nz-btn-ghost">Next ▶</button>' +
        '</div>' +

        '<p id="pron-feedback" style="text-align:center;font-size:13px;color:var(--fg-muted);min-height:20px;margin:0 0 16px;">' + H(state.feedback) + '</p>' +

        '<p style="text-align:center;font-size:12px;color:var(--fg-subtle);">Card ' + (state.index + 1) + ' of ' + deck.length + '</p>' +
      '</div>';

    /* events */
    root.querySelectorAll('[data-pron-level]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopMic();
        state.level = btn.getAttribute('data-pron-level');
        state.index = 0; state.flipped = false; state.feedback = '';
        render(root);
      });
    });
    root.querySelectorAll('[data-pron-deck]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopMic();
        state.deck = btn.getAttribute('data-pron-deck');
        state.index = 0; state.flipped = false; state.feedback = '';
        render(root);
      });
    });
    root.querySelector('[data-pron-flip]').addEventListener('click', function () {
      state.flipped = !state.flipped;
      render(root);
    });
    root.querySelectorAll('[data-pron-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopMic();
        var d = getDeck();
        if (btn.getAttribute('data-pron-nav') === 'next') {
          state.index = (state.index + 1) % d.length;
        } else {
          state.index = (state.index - 1 + d.length) % d.length;
        }
        state.flipped = false; state.feedback = '';
        render(root);
      });
    });
    root.querySelectorAll('[data-pron-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rate = parseFloat(btn.getAttribute('data-pron-speak'));
        var d = getDeck();
        var c2 = d[state.index];
        var text = isVocab ? (c2.kana || c2.jp) : c2.kana;
        speakAt(text, rate);
        if (window.NzDailyTracker) window.NzDailyTracker.mark('pronunciation');
      });
    });
    var micBtn = root.querySelector('[data-pron-mic]');
    if (micBtn) {
      micBtn.addEventListener('click', function () {
        var d = getDeck();
        var c2 = d[state.index];
        var target = isVocab ? (c2.kana || c2.jp) : c2.kana;
        startMic(root, target);
      });
    }

    if (window.NzDailyTracker) window.NzDailyTracker.refreshAll();
  }

  /* ── Public module API ─────────────────────────────────────────── */
  window.PronunciationPage = {
    mount: function (rootId) {
      var root = $id(rootId);
      if (!root) return;
      state.level = getCurrentJLPTLevel();
      state.deck = 'vocab';
      state.index = 0;
      state.flipped = false;
      state.feedback = '';
      render(root);
    },
    cleanup: function () {
      stopMic();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  };
})();
