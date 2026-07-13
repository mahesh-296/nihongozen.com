/* ════════════════════════════════════════════════════════════════
   NZ VERB GROUP MODULE  v2.0 — 動詞グループ
   Nihon Gozen — Verb Group Quiz System

   HOW IT WORKS:
   • Reads the CURRENTLY SELECTED level from the Vocabulary page DOM
   • Pulls verbs from existing NZChapterVocabWords[level] data
   • Auto-detects verb group from Japanese word patterns
   • Injects a "📝 Verb Groups" button into the Vocabulary page
   • Registers the 'verb-group' route in the NZ router

   INSTALL:
     1. Save as js/nz-verb-group-module.js
     2. In index.html add ONE line after nz-vocab-module.js:
        <script src="js/nz-verb-group-module.js" defer></script>
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONSTANTS ───────────────────────────────────────────── */
  var LEVEL_COLORS = {
    N5: '#22c55e', N4: '#06b6d4', N3: '#eab308', N2: '#a855f7', N1: '#ef4444'
  };
  var LEVEL_ICONS = { N5: '🌱', N4: '🍃', N3: '🌳', N2: '🏢', N1: '⛰️' };
  var LEVELS = ['N5','N4','N3','N2','N1'];

  /* ── STATE ───────────────────────────────────────────────── */
  var S = {
    level:   'N5',
    queue:   [],
    idx:     0,
    screen:  'quiz',   // 'quiz' | 'result'
    chosen:  null,
    stats:   { total:0, correct:0, wrong:0 },
    streak:  0,
    xp:      0,
    badges:  []
  };

  /* ── HELPERS ─────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function $id(id) { return document.getElementById(id); }
  function col(lv)  { return LEVEL_COLORS[lv] || '#22c55e'; }
  function icon(lv) { return LEVEL_ICONS[lv]  || '📚'; }

  /* ── READ ACTIVE LEVEL FROM VOCAB PAGE DOM ───────────────── */
  function getActiveLevelFromDOM() {
    // Try reading the active pill/tab on the vocab page
    var active = document.querySelector('[class*="srs-pill-"].active, [data-level].active');
    if (active && active.dataset && active.dataset.level) return active.dataset.level;
    // Fallback: check all level tabs
    var tabs = document.querySelectorAll('[data-level]');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      if (t.classList.contains('active') || t.style.background.indexOf('transparent') === -1) {
        var lv = t.dataset.level;
        if (LEVELS.indexOf(lv) !== -1) return lv;
      }
    }
    return S.level || 'N5';
  }

  /* ── VERB GROUP AUTO-DETECTION ───────────────────────────── */
  // Detect verb group from Japanese word patterns
  var GROUP3_WORDS = ['する','くる','来る','為る'];
  var GROUP3_ENDINGS = ['する','来る'];

  function detectVerbGroup(jp, romaji, en) {
    var raw = jp || '';
    // Strip furigana in parentheses e.g. "食べます(たべます)" → "食べます",
    // and trailing punctuation.
    var word = raw.replace(/[（(][^）)]*[）)]/g, '').replace(/[。、！？…]/g, '').trim();
    if (!word) return null;

    // Known godan verbs whose masu-stem happens to end in し, so they'd
    // otherwise be mistaken for a Xします suru-compound (e.g. 話します
    // is godan 話す "hanasu", not an irregular verb).
    var GODAN_SHI_STEMS = ['話','貸','返','直','消','出','渡','探','壊','写','通','許','冷や','増','燃や','記','押','足'];

    var masuMatch = word.match(/^(.*?)(ませんでした|ましたら|ました|ません|ます)$/);
    var core     = masuMatch ? masuMatch[1] : word; // masu-stem, or the raw word if not ます-form
    var wasMasu  = !!masuMatch;

    // ── Group 3: irregular (する / 来る) ──────────────────────────
    if (word === 'する' || word === 'します') return 'Group 3';
    if (word === 'くる' || word === '来る' || word === '来ます' || word === 'きます') return 'Group 3';
    if (word.endsWith('する')) return 'Group 3';
    if (word.endsWith('来る') || (wasMasu && core.endsWith('来'))) return 'Group 3';
    if (wasMasu && core.endsWith('し')) {
      var stemBeforeShi = core.slice(0, -1);
      var isKnownGodanShi = GODAN_SHI_STEMS.indexOf(stemBeforeShi) !== -1;
      if (!isKnownGodanShi && core.length >= 2) return 'Group 3'; // e.g. 勉強+します → 勉強する
    }

    // ── Figure out which kana we classify on: the masu-stem's last
    //    kana, or (for dictionary-form words) the kana just before る ──
    var endChar = null, isDictionaryRu = false;
    if (wasMasu) {
      endChar = core.slice(-1);
    } else if (word.endsWith('る')) {
      endChar = word.slice(-2, -1);
      isDictionaryRu = true;
    }

    var kanjiIchidanStems = ['見','寝','出','得','経','射','居'];

    if (endChar) {
      // e-row is unambiguous: every masu-stem/dict-stem ending in an
      // e-row kana is Ichidan (Group 2) — no known exceptions.
      var eRow = 'えけせてねへめれげぜでべぺ';
      if (eRow.indexOf(endChar) !== -1) return 'Group 2';

      // i-row is genuinely ambiguous between Godan (う→い masu-stem) and
      // Ichidan (dictionary form ends in -iru). Resolve with a whitelist
      // of the common ichidan verbs that show up in JLPT course vocab.
      var iRow = 'いきぎしちにひびみり';
      if (iRow.indexOf(endChar) !== -1) {
        var ICHIDAN_WHITELIST = ['見','起き','でき','借り','足り','降り','浴び','信じ','生き','用い','煮','似','干','着','過ぎ','落ち','閉じ','伸び','延び','率い'];
        var stemForCheck = wasMasu ? core : word.slice(0, -1);
        var isIchidan = ICHIDAN_WHITELIST.some(function (w2) { return stemForCheck.endsWith(w2); });
        return isIchidan ? 'Group 2' : 'Group 1';
      }

      // Dictionary-form single-kanji ichidan stem (見る,寝る,出る…)
      if (isDictionaryRu && kanjiIchidanStems.indexOf(endChar) !== -1) return 'Group 2';
      if (isDictionaryRu) return 'Group 1';
    }

    // Masu-stem is a bare kanji with no kana before ます (見ます,寝ます…)
    if (wasMasu && kanjiIchidanStems.indexOf(core) !== -1) return 'Group 2';

    // ── Dictionary-form godan endings (う,く,ぐ,す,つ,ぬ,ぶ,む) ─────
    if (!wasMasu) {
      var lastChar = word.slice(-1);
      var godanEndings = 'うくぐすつぬぶむ';
      if (godanEndings.indexOf(lastChar) !== -1) return 'Group 1';
    } else if (core && 'いきぎしちにひびみり'.indexOf(core.slice(-1)) !== -1) {
      return 'Group 1';
    }

    return null; // Not confidently detected as a verb
  }

  function verbTypeLabel(group) {
    if (group === 'Group 1') return 'Godan Verb (五段動詞)';
    if (group === 'Group 2') return 'Ichidan Verb (一段動詞)';
    if (group === 'Group 3') return 'Irregular Verb (不規則動詞)';
    return group;
  }

  /* ── EXTRACT VERBS FROM EXISTING VOCAB DATA ─────────────── */
  function extractVerbs(level) {
    var verbs = [];
    var chapterData = (window.NZChapterVocabWords && window.NZChapterVocabWords[level]) || [];

    chapterData.forEach(function(chapter) {
      var words = Array.isArray(chapter) ? chapter : (chapter.words || []);
      words.forEach(function(w) {
        var jp = w.jp || w.kanji || '';
        var romaji = w.romaji || w.r || '';
        var en = w.en || '';

        // Only process words that look like verbs. Strip furigana in
        // parens first — e.g. "食べます(たべます)" — otherwise the last
        // character is ")" and every masu-form verb gets silently
        // skipped here before detectVerbGroup ever sees it.
        var core = jp.replace(/[（(][^）)]*[）)]/g, '').trim();
        var lastChar = core.slice(-1);
        var verbEndChars = 'うくぐすつぬぶむる';
        var hasSuru   = core.includes('する') || core.includes('くる') || core.includes('来る') ||
                         core.includes('します') || core.includes('きます');
        var endsMasu  = /ます$|ました$|ません$|ませんでした$/.test(core);

        if (!hasSuru && !endsMasu && verbEndChars.indexOf(lastChar) === -1) return;

        // Skip very short words (particles, etc.)
        if (core.length < 2) return;

        var group = detectVerbGroup(jp, romaji, en);
        if (!group) return; // Not detected as verb

        // Avoid duplicates
        var already = verbs.some(function(v) { return v.jp === jp; });
        if (already) return;

        verbs.push({
          jp:     jp,
          romaji: romaji,
          en:     en,
          group:  group
        });
      });
    });

    return verbs;
  }

  /* ── SHUFFLE ─────────────────────────────────────────────── */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ── BUILD QUEUE ─────────────────────────────────────────── */
  function buildQueue(level) {
    S.level  = level || getActiveLevelFromDOM() || 'N5';
    var verbs = extractVerbs(S.level);
    S.queue  = shuffle(verbs);
    S.idx    = 0;
    S.screen = 'quiz';
    S.chosen = null;
  }

  /* ── AUDIO ───────────────────────────────────────────────── */
  function speak(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.82;
    var voices = window.speechSynthesis.getVoices();
    var jpv = voices.find(function(v){ return v.lang && v.lang.startsWith('ja'); });
    if (jpv) u.voice = jpv;
    window.speechSynthesis.speak(u);
  }

  /* ── PERSIST PROGRESS ────────────────────────────────────── */
  function loadProgress() {
    try {
      var raw = localStorage.getItem('nz_vg_progress');
      if (raw) {
        var p = JSON.parse(raw);
        S.stats  = p.stats  || S.stats;
        S.streak = p.streak || 0;
        S.xp     = p.xp     || 0;
        S.badges = p.badges || [];
      }
    } catch(e) {}
  }
  function saveProgress() {
    try {
      localStorage.setItem('nz_vg_progress', JSON.stringify({
        stats: S.stats, streak: S.streak, xp: S.xp, badges: S.badges
      }));
    } catch(e) {}
  }

  /* ── BADGES ──────────────────────────────────────────────── */
  var BADGES = [
    { id:'beginner', label:'Verb Beginner',  emoji:'🏅', req:5   },
    { id:'explorer', label:'Verb Explorer',  emoji:'🎖️', req:20  },
    { id:'expert',   label:'Verb Expert',    emoji:'🥈', req:50  },
    { id:'master',   label:'Verb Master',    emoji:'🥇', req:100 },
    { id:'sensei',   label:'Verb Sensei',    emoji:'👑', req:200 }
  ];
  function checkBadges() {
    var gained = [];
    BADGES.forEach(function(b) {
      if (S.stats.total >= b.req && S.badges.indexOf(b.id) === -1) {
        S.badges.push(b.id);
        gained.push(b);
      }
    });
    return gained;
  }

  /* ═══════════════════════════════════════════════════════════
     CSS  — matches Nihon Gozen design tokens exactly
  ═══════════════════════════════════════════════════════════ */
  function injectCSS() {
    if ($id('nz-vg-css')) return;
    var el = document.createElement('style');
    el.id  = 'nz-vg-css';
    el.textContent = `
/* ── Page shell ── */
.vg-wrap   { max-width:580px;margin:0 auto;padding:0 2px; }
.vg-hdr    { display:flex;align-items:center;gap:12px;margin-bottom:22px; }
.vg-back   { background:var(--card);border:1px solid var(--border);border-radius:var(--radius);
             padding:8px 15px;color:var(--fg-muted);font-size:13px;font-weight:700;
             font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:6px;
             transition:all var(--duration-fast) var(--ease);box-shadow:var(--shadow-sm); }
.vg-back:hover { background:var(--card-elevated);color:var(--fg);border-color:var(--border-strong);transform:translateX(-2px); }
.vg-hdr-icon  { width:38px;height:38px;border-radius:var(--radius);background:linear-gradient(135deg,var(--primary-dim),var(--accent-dim));
                border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
.vg-hdr-title { font-size:18px;font-weight:800;color:var(--fg);letter-spacing:-.3px;font-family:var(--font-jp-sans); }
.vg-hdr-sub   { font-size:12px;color:var(--fg-muted);margin-top:2px;font-weight:500; }

/* ── Level pills ── */
.vg-lvl-bar  { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px; }
.vg-lvl-pill { padding:7px 16px;border-radius:var(--radius-full);font-size:12px;font-weight:800;
               border:1.5px solid;background:var(--card);cursor:pointer;
               font-family:inherit;transition:all var(--duration-fast) var(--ease);
               letter-spacing:.02em; }
.vg-lvl-pill:hover { transform:translateY(-1px); }
.vg-lvl-pill.on { color:#fff !important;box-shadow:0 4px 14px -4px currentColor; }

/* ── Progress bar card ── */
.vg-prog { background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);
           padding:16px 20px;margin-bottom:14px;display:flex;gap:16px;
           align-items:center;flex-wrap:wrap;box-shadow:var(--shadow-sm); }
.vg-ps   { text-align:center;flex:1;min-width:54px; }
.vg-pv   { font-size:23px;font-weight:800;font-family:var(--font-mono);line-height:1;letter-spacing:-.02em; }
.vg-pl   { font-size:10px;color:var(--fg-muted);font-weight:700;
           text-transform:uppercase;letter-spacing:.07em;margin-top:4px; }
.vg-pdiv { width:1px;height:32px;background:var(--border); }
.vg-streak { display:flex;align-items:center;gap:6px;
             background:linear-gradient(135deg,var(--accent-dim),rgba(201,151,58,.05));
             border:1px solid var(--accent);border-radius:var(--radius);padding:6px 13px;
             font-size:13px;font-weight:800;color:var(--accent);margin-left:auto;white-space:nowrap; }

/* ── Badges row ── */
.vg-badges  { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px; }
.vg-badge   { display:inline-flex;align-items:center;gap:5px;background:var(--card);
              border:1px solid var(--border);border-radius:var(--radius);padding:5px 11px;
              font-size:11px;font-weight:700;color:var(--fg-subtle);transition:all var(--duration-fast) var(--ease); }
.vg-badge.on{ border-color:var(--accent);color:var(--accent);background:var(--accent-dim); }

/* ── Quiz card ── */
.vg-qcard  { background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl);
             padding:36px 26px 30px;margin-bottom:16px;text-align:center;
             position:relative;overflow:hidden;animation:vgUp .35s var(--ease) both;
             box-shadow:var(--shadow); }
.vg-qcard::before { content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 50% -10%,var(--primary-dim) 0%,transparent 60%);pointer-events:none; }
.vg-qcard::after { content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--primary),var(--accent));opacity:.7; }
.vg-kanji  { font-family:var(--font-jp);font-size:80px;font-weight:700;color:var(--fg);line-height:1.05;
             margin-bottom:12px;animation:vgUp .35s var(--ease) both;position:relative;letter-spacing:-.01em; }
@media(max-width:480px){ .vg-kanji{font-size:60px;} }
.vg-en     { font-size:18px;font-weight:600;color:var(--fg-muted);margin-bottom:6px;
             animation:vgUp .35s .05s var(--ease) both;position:relative; }
.vg-kana   { font-family:var(--font-jp-sans);font-size:20px;color:var(--fg);margin-bottom:0;
             animation:vgUp .35s .1s var(--ease) both;position:relative;font-weight:500; }
.vg-ico    { font-size:30px;margin:20px 0 14px;animation:vgUp .35s .12s var(--ease) both;
             position:relative;opacity:.85; }
.vg-romaji { font-size:13px;color:var(--fg-subtle);margin-top:5px;
             font-family:var(--font-mono);opacity:.8;position:relative; }

/* ── Audio button ── */
.vg-audio  { display:inline-flex;align-items:center;gap:8px;
             background:var(--card-elevated);border:1px solid var(--border);
             border-radius:var(--radius-full);padding:10px 24px;font-size:13px;font-weight:700;
             color:var(--fg-muted);font-family:inherit;cursor:pointer;
             transition:all var(--duration-fast) var(--ease);margin:6px 0 26px;
             animation:vgUp .35s .15s var(--ease) both;position:relative;
             box-shadow:var(--shadow-sm); }
.vg-audio:hover {
  border-color:var(--primary);color:var(--primary);
  background:var(--primary-dim);transform:translateY(-1px); }
.vg-audio.on { border-color:var(--primary);color:var(--primary);background:var(--primary-dim); }

/* ── Group buttons ── */
.vg-groups { display:flex;flex-direction:column;gap:11px;
             animation:vgUp .35s .18s var(--ease) both;position:relative; }
.vg-gbtn   { width:100%;padding:17px 22px;border-radius:var(--radius-lg);font-size:15px;
             font-weight:700;font-family:inherit;cursor:pointer;
             border:1.5px solid var(--border);background:var(--card-elevated);color:var(--fg);
             display:flex;align-items:center;justify-content:space-between;
             transition:all var(--duration-fast) var(--ease);position:relative;overflow:hidden; }
.vg-gbtn::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
             background:var(--primary);transform:scaleY(0);transition:transform var(--duration-fast) var(--ease); }
.vg-gbtn:hover { border-color:var(--primary);
                 background:var(--primary-dim);color:var(--primary);
                 transform:translateX(4px);box-shadow:var(--shadow-sm); }
.vg-gbtn:hover::before { transform:scaleY(1); }
.vg-gbtn:active { transform:scale(.98) translateX(2px); }
.vg-gnum   { display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;
             border-radius:50%;background:var(--bg);border:1px solid var(--border);
             font-size:11px;font-weight:800;margin-right:10px;flex-shrink:0; }
.vg-gleft  { display:flex;align-items:center; }
.vg-gbadge { font-size:11px;font-weight:600;padding:4px 11px;border-radius:var(--radius-full);
             background:var(--bg);color:var(--fg-muted);border:1px solid var(--border); }

/* ── Result card ── */
.vg-rcard  { border-radius:var(--radius-xl);padding:28px 24px;margin-bottom:16px;text-align:center;
             border:1.5px solid;animation:vgPop .35s var(--ease) both;position:relative;overflow:hidden; }
.vg-rcard.ok  { background:linear-gradient(180deg,rgba(76,175,130,.1),rgba(76,175,130,.02));border-color:rgba(76,175,130,.4);box-shadow:0 8px 30px -10px rgba(76,175,130,.25); }
.vg-rcard.bad { background:linear-gradient(180deg,var(--primary-dim),rgba(232,68,106,.02)); border-color:rgba(232,68,106,.35);box-shadow:0 8px 30px -10px rgba(232,68,106,.25); }
.vg-rico   { font-size:48px;margin-bottom:10px;display:inline-block; }
.vg-rtitle { font-size:27px;font-weight:800;margin-bottom:6px;letter-spacing:-.3px; }
.vg-rcard.ok  .vg-rtitle { color:#4CAF82; }
.vg-rcard.bad .vg-rtitle { color:var(--primary); }
.vg-rsub   { font-size:14px;color:var(--fg-muted);font-weight:500; }
.vg-rsub strong { color:var(--fg);font-weight:700; }
.vg-xpbadge { display:inline-flex;align-items:center;gap:6px;
              background:var(--accent-dim);border:1px solid var(--accent);
              border-radius:var(--radius-full);padding:6px 18px;font-size:13px;font-weight:800;
              color:var(--accent);margin-top:12px;animation:vgPop .4s .12s var(--ease) both; }

/* ── Detail card ── */
.vg-dcard  { background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl);
             overflow:hidden;margin-bottom:16px;animation:vgUp .35s .1s var(--ease) both;
             box-shadow:var(--shadow-sm); }
.vg-dhdr   { background:var(--card-elevated);border-bottom:1px solid var(--border);
             padding:18px 22px;display:flex;align-items:center;gap:14px; }
.vg-dk     { font-family:var(--font-jp);font-size:46px;font-weight:700;color:var(--fg);line-height:1; }
.vg-dinfo  { flex:1;min-width:0; }
.vg-dkana  { font-family:var(--font-jp-sans);font-size:17px;color:var(--fg);font-weight:500; }
.vg-drom   { font-family:var(--font-mono);font-size:12px;
             color:var(--fg-subtle);opacity:.85;margin-top:3px; }
.vg-dlevel { background:var(--bg);border:1.5px solid;border-radius:var(--radius);
             padding:5px 12px;font-size:11px;font-weight:800;flex-shrink:0;letter-spacing:.02em; }
.vg-dbody  { padding:18px 22px;display:grid;grid-template-columns:1fr 1fr;gap:14px; }
@media(max-width:400px){ .vg-dbody{grid-template-columns:1fr;} }
.vg-dr     { display:flex;flex-direction:column;gap:4px; }
.vg-dr.full{ grid-column:1/-1; }
.vg-dl     { font-size:10px;font-weight:700;text-transform:uppercase;
             letter-spacing:.08em;color:var(--fg-subtle); }
.vg-dv     { font-size:14.5px;font-weight:600;color:var(--fg); }
.vg-dv.jp  { font-family:var(--font-jp-sans);font-size:15px; }
.vg-dv.accent { font-weight:800; }

/* ── Continue button ── */
.vg-cont   { width:100%;padding:17px;border-radius:var(--radius-lg);font-size:16px;font-weight:800;
             font-family:inherit;cursor:pointer;background:linear-gradient(135deg,var(--primary),var(--primary-hover));
             color:#fff;border:none;display:flex;align-items:center;
             justify-content:center;gap:8px;letter-spacing:.01em;
             transition:all var(--duration-fast) var(--ease);animation:vgUp .35s .18s var(--ease) both;
             box-shadow:0 6px 24px -4px rgba(232,68,106,.45); }
.vg-cont:hover { transform:translateY(-2px);box-shadow:0 10px 32px -4px rgba(232,68,106,.55); }
.vg-cont:active{ transform:scale(.98) translateY(0); }

/* ── Empty state ── */
.vg-empty  { text-align:center;padding:56px 24px;color:var(--fg-muted);
             background:var(--card);border:1px solid var(--border);border-radius:var(--radius-xl); }
.vg-empty-ico { font-size:50px;margin-bottom:14px; }

/* ── Vocab page inject button ── */
.nz-vg-inject-btn {
  display:inline-flex;align-items:center;gap:7px;
  padding:8px 18px;border-radius:var(--radius);font-size:13px;font-weight:800;
  font-family:inherit;cursor:pointer;letter-spacing:.02em;
  border:1.5px solid var(--primary);background:var(--primary-dim);
  color:var(--primary);transition:all var(--duration-fast) var(--ease);
}
.nz-vg-inject-btn:hover { background:var(--primary);color:#fff;transform:translateY(-1px);box-shadow:0 4px 14px -3px rgba(232,68,106,.5); }
.nz-vg-sep { font-size:18px;color:var(--border-strong);line-height:1;margin:0 3px;align-self:center; }

/* ── Keyframes ── */
@keyframes vgUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
@keyframes vgPop { 0%{opacity:0;transform:scale(.85)} 65%{transform:scale(1.05)} 100%{opacity:1;transform:none} }
@keyframes vgShake { 0%,100%{transform:none} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
@keyframes vgPulse { 0%{box-shadow:0 0 0 0 rgba(76,175,130,.5)} 70%{box-shadow:0 0 0 14px rgba(76,175,130,0)} 100%{box-shadow:0 0 0 0 rgba(76,175,130,0)} }
.vg-shake { animation:vgShake .4s var(--ease); }
.vg-pulse { animation:vgPulse .7s var(--ease); }
    `;
    document.head.appendChild(el);
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER HELPERS
  ═══════════════════════════════════════════════════════════ */
  function renderLevelBar() {
    return '<div class="vg-lvl-bar">' +
      LEVELS.map(function(lv){
        var c = col(lv);
        var on = lv === S.level;
        return '<button class="vg-lvl-pill'+(on?' on':'')+'" '+
          'style="border-color:'+c+';color:'+(on?'#fff':c)+';background:'+(on?c:'transparent')+';" '+
          'onclick="window.NZVerbGroup.setLevel(\''+lv+'\')">' +
          icon(lv) + ' ' + lv +
        '</button>';
      }).join('') +
    '</div>';
  }

  function renderProgress() {
    var s = S.stats;
    var acc = s.total > 0 ? Math.round(s.correct/s.total*100) : 0;
    return '<div class="vg-prog">'+
      '<div class="vg-ps"><div class="vg-pv" style="color:var(--fg)">'+s.total+'</div><div class="vg-pl">Total</div></div>'+
      '<div class="vg-pdiv"></div>'+
      '<div class="vg-ps"><div class="vg-pv" style="color:#4CAF82">'+s.correct+'</div><div class="vg-pl">Correct</div></div>'+
      '<div class="vg-pdiv"></div>'+
      '<div class="vg-ps"><div class="vg-pv" style="color:var(--primary)">'+s.wrong+'</div><div class="vg-pl">Wrong</div></div>'+
      '<div class="vg-pdiv"></div>'+
      '<div class="vg-ps"><div class="vg-pv" style="color:var(--accent)">'+acc+'%</div><div class="vg-pl">Accuracy</div></div>'+
      '<div class="vg-streak">🔥 '+S.streak+' Streak</div>'+
    '</div>';
  }

  function renderBadges() {
    if (!S.badges.length) return '';
    return '<div class="vg-badges">'+
      BADGES.map(function(b){
        var on = S.badges.indexOf(b.id) !== -1;
        return '<div class="vg-badge'+(on?' on':'')+'">'+b.emoji+' '+b.label+'</div>';
      }).join('')+
    '</div>';
  }

  function renderQuiz() {
    var v = S.queue[S.idx];
    if (!v) return (
      '<div class="vg-empty">'+
        '<div class="vg-empty-ico">🎉</div>'+
        '<div style="font-size:16px;font-weight:700;color:var(--fg);margin-bottom:8px">All verbs done!</div>'+
        '<div style="font-size:14px">Switch level or continue practicing 🔄</div>'+
      '</div>'
    );

    var groups = [
      { n:'1', g:'Group 1', lbl:'Godan — 五段動詞' },
      { n:'2', g:'Group 2', lbl:'Ichidan — 一段動詞' },
      { n:'3', g:'Group 3', lbl:'Irregular — 不規則' }
    ];

    return (
      '<div class="vg-qcard" id="vg-qcard">'+
        '<div class="vg-kanji">'+esc(v.jp)+'</div>'+
        '<div class="vg-en">('+esc(v.en)+')</div>'+
        (v.romaji ? '<div class="vg-romaji">'+esc(v.romaji)+'</div>' : '')+
        '<div class="vg-ico">📖</div>'+
        '<button class="vg-audio" id="vg-audio-btn" onclick="window.NZVerbGroup.playAudio()">'+
          '🔊 Listen Pronunciation'+
        '</button>'+
        '<div class="vg-groups">'+
          groups.map(function(x){
            return '<button class="vg-gbtn" onclick="window.NZVerbGroup.answer(\''+x.g+'\')">'+
              '<span class="vg-gleft"><span class="vg-gnum">'+x.n+'</span>'+x.g+'</span>'+
              '<span class="vg-gbadge">'+x.lbl+'</span>'+
            '</button>';
          }).join('')+
        '</div>'+
      '</div>'
    );
  }

  function renderResult() {
    var v   = S.queue[S.idx];
    var ok  = S.chosen === v.group;
    var c   = col(S.level);

    return (
      /* ── Feedback ── */
      '<div class="vg-rcard '+(ok?'ok':'bad')+'" id="vg-rcard">'+
        '<div class="vg-rico">'+(ok?'✅':'❌')+'</div>'+
        '<div class="vg-rtitle">'+(ok?'Correct!':'Incorrect')+'</div>'+
        '<div class="vg-rsub">You selected <strong>'+esc(S.chosen)+'</strong>'+
          (!ok ? ' &nbsp;·&nbsp; Correct: <strong>'+esc(v.group)+'</strong>' : '')+
        '</div>'+
        (ok ? '<div class="vg-xpbadge">⚡ +10 XP</div>' : '')+
      '</div>'+

      /* ── Detail card ── */
      '<div class="vg-dcard">'+
        '<div class="vg-dhdr">'+
          '<div class="vg-dk">'+esc(v.jp)+'</div>'+
          '<div class="vg-dinfo">'+
            '<div class="vg-dkana">'+(v.romaji ? esc(v.romaji) : '')+'</div>'+
            '<div class="vg-drom">'+esc(v.en)+'</div>'+
          '</div>'+
          '<span class="vg-dlevel" style="border-color:'+c+';color:'+c+';">'+
            icon(S.level)+' '+S.level+
          '</span>'+
        '</div>'+
        '<div class="vg-dbody">'+
          '<div class="vg-dr"><div class="vg-dl">Meaning</div><div class="vg-dv">'+esc(v.en)+'</div></div>'+
          '<div class="vg-dr"><div class="vg-dl">Group</div>'+
            '<div class="vg-dv accent" style="color:'+(ok?'#4CAF82':'var(--primary)')+'">'+esc(v.group)+'</div>'+
          '</div>'+
          '<div class="vg-dr full"><div class="vg-dl">Verb Type</div>'+
            '<div class="vg-dv accent" style="color:'+(ok?'#4CAF82':'var(--primary)')+'">'+verbTypeLabel(v.group)+'</div>'+
          '</div>'+
          (v.romaji ? '<div class="vg-dr full"><div class="vg-dl">Romaji</div><div class="vg-dv" style="font-family:var(--font-mono)">'+esc(v.romaji)+'</div></div>' : '')+
        '</div>'+
      '</div>'+

      /* ── Continue ── */
      '<button class="vg-cont" onclick="window.NZVerbGroup.next()">Continue →</button>'
    );
  }

  /* ── FULL PAGE RENDER ──────────────────────────────────── */
  function render() {
    var root = $id('nz-vg-root');
    if (!root) return;
    root.innerHTML = (
      '<div class="vg-wrap">'+
        /* Header */
        '<div class="vg-hdr">'+
          '<button class="vg-back" onclick="window.nzGo && window.nzGo(\'vocab\')">← Vocabulary</button>'+
          '<div class="vg-hdr-icon">📖</div>'+
          '<div>'+
            '<div class="vg-hdr-title">動詞グループ · Verb Groups</div>'+
            '<div class="vg-hdr-sub">'+icon(S.level)+' '+S.level+' — Classify the verb correctly</div>'+
          '</div>'+
        '</div>'+
        /* Level bar */
        renderLevelBar()+
        /* Progress */
        renderProgress()+
        /* Badges */
        renderBadges()+
        /* Screen */
        '<div id="vg-screen">'+
          (S.screen === 'quiz' ? renderQuiz() : renderResult())+
        '</div>'+
      '</div>'
    );
  }

  /* ═══════════════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════════════ */
  window.NZVerbGroup = {

    setLevel: function(lv) {
      buildQueue(lv);
      render();
    },

    playAudio: function() {
      var v = S.queue[S.idx];
      if (!v) return;
      speak(v.jp);
      var btn = $id('vg-audio-btn');
      if (btn) {
        btn.classList.add('on');
        btn.textContent = '🔊 Playing…';
        setTimeout(function(){ btn.classList.remove('on'); btn.innerHTML='🔊 Listen Pronunciation'; }, 2400);
      }
    },

    answer: function(chosen) {
      var v  = S.queue[S.idx];
      if (!v) return;
      var ok = chosen === v.group;

      S.chosen = chosen;
      S.screen = 'result';
      S.stats.total++;

      if (ok) { S.stats.correct++; S.streak++; S.xp += 10; }
      else    { S.stats.wrong++;   S.streak = 0; }

      var gained = checkBadges();
      saveProgress();

      render();

      // Animate
      setTimeout(function(){
        var card = $id('vg-rcard');
        if (card) card.classList.add(ok ? 'vg-pulse' : 'vg-shake');

        // Toast badges
        gained.forEach(function(b){
          if (window.nzShowToast) window.nzShowToast(b.emoji+' Badge: '+b.label, 'success');
        });
        if (ok && window.nzShowToast) window.nzShowToast('⚡ +10 XP — Correct!', 'success');
      }, 40);
    },

    next: function() {
      S.idx++;
      if (S.idx >= S.queue.length) {
        S.queue = shuffle(S.queue);
        S.idx   = 0;
      }
      S.screen = 'quiz';
      S.chosen = null;

      // Fade transition
      var root = $id('nz-vg-root');
      if (root) {
        root.style.opacity = '0';
        setTimeout(function(){
          render();
          var r = $id('nz-vg-root');
          if (r) { r.style.transition='opacity .2s'; r.style.opacity='1'; }
        }, 110);
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════
     MOUNT PAGE
  ═══════════════════════════════════════════════════════════ */
  function mountPage() {
    loadProgress();
    injectCSS();

    // Read current level from vocab page if possible
    var domLevel = getActiveLevelFromDOM();
    buildQueue(domLevel);

    // Set HTML
    var setHTMLFn = window.setHTML || function(h){
      var el = document.getElementById('nz-content');
      if (el) el.innerHTML = h;
    };
    setHTMLFn('<div id="nz-vg-root" style="min-height:60vh;padding:0;"></div>');

    render();
  }

  /* ═══════════════════════════════════════════════════════════
     INJECT "📝 Verb Groups" BUTTON INTO VOCABULARY PAGE
  ═══════════════════════════════════════════════════════════ */
  function injectButton() {
    if ($id('nz-vg-btn')) return; // Already injected

    // Find the SRS pills row — that's where we add our button
    var pillsWrap = $id('vocab-srs-pills');
    if (!pillsWrap) return;

    var parent = pillsWrap.parentElement;
    if (!parent) return;

    // Create separator + button
    var sep = document.createElement('span');
    sep.className = 'nz-vg-sep';
    sep.textContent = '|';

    var btn = document.createElement('button');
    btn.id  = 'nz-vg-btn';
    btn.className = 'nz-vg-inject-btn';
    btn.innerHTML = '📝 Verb Groups';
    btn.onclick = function(){
      // Grab the current active level from vocab page before navigating
      var lv = getActiveLevelFromDOM();
      S.level = (lv && LEVELS.indexOf(lv) !== -1) ? lv : 'N5';
      if (window.nzGo) window.nzGo('verb-group');
    };

    parent.appendChild(sep);
    parent.appendChild(btn);
  }

  /* ═══════════════════════════════════════════════════════════
     REGISTER ROUTE + PATCH VOCAB PAGE
  ═══════════════════════════════════════════════════════════ */
  function registerRoute() {
    if (window.Pages)    window.Pages['verb-group'] = mountPage;
    if (window.NzRouter && window.NzRouter.register) window.NzRouter.register('verb-group', mountPage);
    if (window.Router   && window.Router.register)   window.Router.register('verb-group', mountPage);
  }

  function patchVocabPage() {
    if (!window.Pages || !window.Pages.vocab) {
      setTimeout(patchVocabPage, 150);
      return;
    }
    var _orig = window.Pages.vocab;
    window.Pages.vocab = function() {
      _orig.apply(this, arguments);
      setTimeout(injectButton, 60);
    };
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════ */
  function boot() {
    injectCSS();
    registerRoute();
    patchVocabPage();

    document.addEventListener('nz:pageChange', function(e){
      if (e && e.detail && e.detail.route === 'vocab') setTimeout(injectButton, 80);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('nz:userReady', function(){
    registerRoute();
    setTimeout(injectButton, 100);
  });

})();
