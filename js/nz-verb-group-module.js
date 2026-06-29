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
    var word = jp || '';
    // Remove trailing punctuation
    word = word.replace(/[。、！？…]/g, '').trim();

    // Group 3: irregular
    if (word === 'する' || word === 'くる' || word === '来る' || word === '為る') return 'Group 3';
    if (word.endsWith('する')) return 'Group 3';
    if (word.endsWith('くる') || word.endsWith('来る')) return 'Group 3';

    // Must end in -ru sound to possibly be Group 2
    if (word.endsWith('る')) {
      // Group 2 (Ichidan): stem ends in -e or -i sound before る
      // Check romaji for eru/iru endings
      if (romaji) {
        var r = romaji.toLowerCase().replace(/[^a-z]/g,'');
        if (r.endsWith('eru') || r.endsWith('iru')) return 'Group 2';
      }
      // Check character before る
      var beforeRu = word.slice(-2, -1);
      var ichidanChars = 'いきしちにひみりぎじびぴえけせてねへめれげぜでべぺ見起食寝着得出来';
      if (ichidanChars.indexOf(beforeRu) !== -1) return 'Group 2';
      return 'Group 1'; // e.g. 帰る、走る、知る
    }

    // Ends in u-row kana → Group 1
    var godanEndings = 'くぐすつぬぶむうく';
    var lastChar = word.slice(-1);
    if (godanEndings.indexOf(lastChar) !== -1) return 'Group 1';

    // Default to Group 1 for nouns/adjectives that slip through
    return null; // Not a verb
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

        // Only process words that look like verbs
        // Verbs in Japanese typically: end in -u sound kana or contain する/くる
        var lastChar = jp.slice(-1);
        var verbEndChars = 'うくぐすつぬぶむるる';
        var hasSuru = jp.includes('する') || jp.includes('くる') || jp.includes('来る');

        if (!hasSuru && verbEndChars.indexOf(lastChar) === -1) return;

        // Skip very short words (particles, etc.)
        if (jp.length < 2 && !hasSuru) return;

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
.vg-wrap   { max-width:560px;margin:0 auto;padding:0 2px; }
.vg-hdr    { display:flex;align-items:center;gap:10px;margin-bottom:20px; }
.vg-back   { background:none;border:1px solid var(--border);border-radius:10px;
             padding:7px 14px;color:var(--fg-muted);font-size:13px;font-weight:700;
             font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:5px;
             transition:all .15s; }
.vg-back:hover { background:var(--card-elevated);color:var(--fg); }
.vg-hdr-title { font-size:17px;font-weight:800;color:var(--fg);letter-spacing:-.3px; }
.vg-hdr-sub   { font-size:11px;color:var(--fg-muted);margin-top:1px; }

/* ── Level pills ── */
.vg-lvl-bar  { display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px; }
.vg-lvl-pill { padding:6px 15px;border-radius:50px;font-size:12px;font-weight:700;
               border:1.5px solid;background:transparent;cursor:pointer;
               font-family:inherit;transition:all .15s; }
.vg-lvl-pill.on { color:#fff !important; }

/* ── Progress bar card ── */
.vg-prog { background:var(--card);border:1px solid var(--border);border-radius:14px;
           padding:14px 18px;margin-bottom:14px;display:flex;gap:14px;
           align-items:center;flex-wrap:wrap; }
.vg-ps   { text-align:center;flex:1;min-width:52px; }
.vg-pv   { font-size:22px;font-weight:800;font-family:var(--font-mono,monospace);line-height:1; }
.vg-pl   { font-size:10px;color:var(--fg-muted);font-weight:700;
           text-transform:uppercase;letter-spacing:.06em;margin-top:2px; }
.vg-pdiv { width:1px;height:34px;background:var(--border); }
.vg-streak { display:flex;align-items:center;gap:5px;background:var(--card-elevated);
             border:1px solid var(--border);border-radius:8px;padding:5px 12px;
             font-size:13px;font-weight:800;margin-left:auto;white-space:nowrap; }

/* ── Badges row ── */
.vg-badges  { display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px; }
.vg-badge   { display:inline-flex;align-items:center;gap:4px;background:var(--card);
              border:1px solid var(--border);border-radius:8px;padding:4px 10px;
              font-size:11px;font-weight:700;color:var(--fg-muted); }
.vg-badge.on{ border-color:var(--accent,#c9973a);color:var(--accent,#c9973a); }

/* ── Quiz card ── */
.vg-qcard  { background:var(--card);border:1px solid var(--border);border-radius:20px;
             padding:30px 24px 26px;margin-bottom:14px;text-align:center;
             position:relative;overflow:hidden;animation:vgUp .3s ease both; }
.vg-qcard::before { content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(34,197,94,.04) 0%,transparent 55%);pointer-events:none; }
.vg-kanji  { font-size:76px;font-weight:700;color:var(--fg);line-height:1.05;
             margin-bottom:10px;animation:vgUp .3s ease both; }
@media(max-width:480px){ .vg-kanji{font-size:58px;} }
.vg-en     { font-size:18px;font-weight:600;color:var(--fg-muted);margin-bottom:5px;
             animation:vgUp .3s .04s ease both; }
.vg-kana   { font-size:20px;color:var(--fg);margin-bottom:0;
             animation:vgUp .3s .08s ease both; }
.vg-ico    { font-size:34px;margin:16px 0 10px;animation:vgUp .3s .1s ease both; }
.vg-romaji { font-size:13px;color:var(--fg-subtle,var(--fg-muted));margin-top:4px;
             font-family:var(--font-mono,monospace);opacity:.7; }

/* ── Audio button ── */
.vg-audio  { display:inline-flex;align-items:center;gap:7px;
             background:var(--card-elevated);border:1px solid var(--border);
             border-radius:50px;padding:9px 22px;font-size:13px;font-weight:600;
             color:var(--fg-muted);font-family:inherit;cursor:pointer;
             transition:all .15s;margin:4px 0 22px;animation:vgUp .3s .12s ease both; }
.vg-audio:hover,.vg-audio.on {
  border-color:var(--primary,#e8446a);color:var(--primary,#e8446a);
  background:rgba(232,68,106,.08); }

/* ── Group buttons ── */
.vg-groups { display:flex;flex-direction:column;gap:10px;
             animation:vgUp .3s .15s ease both; }
.vg-gbtn   { width:100%;padding:16px 20px;border-radius:14px;font-size:15px;
             font-weight:700;font-family:inherit;cursor:pointer;
             border:1.5px solid var(--border);background:var(--card-elevated);color:var(--fg);
             display:flex;align-items:center;justify-content:space-between;
             transition:all .15s; }
.vg-gbtn:hover { border-color:var(--primary,#e8446a);
                 background:rgba(232,68,106,.07);color:var(--primary,#e8446a);
                 transform:translateX(3px); }
.vg-gbtn:active { transform:scale(.98); }
.vg-gbadge { font-size:11px;font-weight:600;padding:3px 10px;border-radius:50px;
             background:var(--bg,#111);color:var(--fg-muted);border:1px solid var(--border); }

/* ── Result card ── */
.vg-rcard  { border-radius:20px;padding:24px;margin-bottom:14px;text-align:center;
             border:1.5px solid;animation:vgPop .3s ease both; }
.vg-rcard.ok  { background:rgba(74,222,128,.06);border-color:rgba(74,222,128,.35); }
.vg-rcard.bad { background:rgba(232,68,106,.06); border-color:rgba(232,68,106,.25); }
.vg-rico   { font-size:46px;margin-bottom:8px; }
.vg-rtitle { font-size:26px;font-weight:800;margin-bottom:4px; }
.vg-rcard.ok  .vg-rtitle { color:#4ade80; }
.vg-rcard.bad .vg-rtitle { color:var(--primary,#e8446a); }
.vg-rsub   { font-size:14px;color:var(--fg-muted); }
.vg-rsub strong { color:var(--fg); }
.vg-xpbadge { display:inline-flex;align-items:center;gap:5px;
              background:rgba(201,151,58,.13);border:1px solid rgba(201,151,58,.3);
              border-radius:50px;padding:5px 16px;font-size:13px;font-weight:700;
              color:#c9973a;margin-top:10px;animation:vgPop .4s .1s ease both; }

/* ── Detail card ── */
.vg-dcard  { background:var(--card);border:1px solid var(--border);border-radius:20px;
             overflow:hidden;margin-bottom:14px;animation:vgUp .3s .08s ease both; }
.vg-dhdr   { background:var(--card-elevated);border-bottom:1px solid var(--border);
             padding:16px 20px;display:flex;align-items:center;gap:12px; }
.vg-dk     { font-size:44px;font-weight:700;color:var(--fg);line-height:1; }
.vg-dinfo  { flex:1; }
.vg-dkana  { font-size:17px;color:var(--fg-muted); }
.vg-drom   { font-family:var(--font-mono,monospace);font-size:12px;
             color:var(--fg-subtle,var(--fg-muted));opacity:.7;margin-top:2px; }
.vg-dbody  { padding:16px 20px;display:grid;grid-template-columns:1fr 1fr;gap:12px; }
@media(max-width:400px){ .vg-dbody{grid-template-columns:1fr;} }
.vg-dr     { display:flex;flex-direction:column;gap:3px; }
.vg-dr.full{ grid-column:1/-1; }
.vg-dl     { font-size:10px;font-weight:700;text-transform:uppercase;
             letter-spacing:.08em;color:var(--fg-subtle,var(--fg-muted)); }
.vg-dv     { font-size:14px;font-weight:600;color:var(--fg); }
.vg-dv.jp  { font-size:15px; }

/* ── Continue button ── */
.vg-cont   { width:100%;padding:16px;border-radius:14px;font-size:16px;font-weight:800;
             font-family:inherit;cursor:pointer;background:var(--primary,#e8446a);
             color:#fff;border:none;display:flex;align-items:center;
             justify-content:center;gap:8px;
             transition:all .15s;animation:vgUp .3s .15s ease both;
             box-shadow:0 4px 20px rgba(232,68,106,.3); }
.vg-cont:hover { transform:translateY(-2px);box-shadow:0 6px 28px rgba(232,68,106,.45); }
.vg-cont:active{ transform:scale(.98); }

/* ── Empty state ── */
.vg-empty  { text-align:center;padding:52px 24px;color:var(--fg-muted); }
.vg-empty-ico { font-size:48px;margin-bottom:12px; }

/* ── Vocab page inject button ── */
.nz-vg-inject-btn {
  display:inline-flex;align-items:center;gap:7px;
  padding:7px 16px;border-radius:10px;font-size:13px;font-weight:800;
  font-family:inherit;cursor:pointer;letter-spacing:.02em;
  border:1.5px solid var(--primary,#e8446a);background:transparent;
  color:var(--primary,#e8446a);transition:all .15s;
}
.nz-vg-inject-btn:hover { background:var(--primary,#e8446a);color:#fff; }

/* ── Keyframes ── */
@keyframes vgUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes vgPop { 0%{opacity:0;transform:scale(.86)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:none} }
@keyframes vgShake { 0%,100%{transform:none} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
@keyframes vgPulse { 0%{box-shadow:0 0 0 0 rgba(74,222,128,.45)} 70%{box-shadow:0 0 0 12px rgba(74,222,128,0)} 100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }
.vg-shake { animation:vgShake .4s ease; }
.vg-pulse { animation:vgPulse .6s ease; }
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
      '<div class="vg-ps"><div class="vg-pv" style="color:#4ade80">'+s.correct+'</div><div class="vg-pl">Correct</div></div>'+
      '<div class="vg-pdiv"></div>'+
      '<div class="vg-ps"><div class="vg-pv" style="color:var(--primary,#e8446a)">'+s.wrong+'</div><div class="vg-pl">Wrong</div></div>'+
      '<div class="vg-pdiv"></div>'+
      '<div class="vg-ps"><div class="vg-pv" style="color:#c9973a">'+acc+'%</div><div class="vg-pl">Accuracy</div></div>'+
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
      { g:'Group 1', lbl:'Godan — 五段動詞' },
      { g:'Group 2', lbl:'Ichidan — 一段動詞' },
      { g:'Group 3', lbl:'Irregular — 不規則' }
    ];

    return (
      '<div class="vg-qcard" id="vg-qcard">'+
        '<div class="vg-kanji">'+esc(v.jp)+'</div>'+
        '<div class="vg-en">('+esc(v.en)+')</div>'+
        (v.romaji ? '<div class="vg-romaji">'+esc(v.romaji)+'</div>' : '')+
        '<div class="vg-ico">📝</div>'+
        '<button class="vg-audio" id="vg-audio-btn" onclick="window.NZVerbGroup.playAudio()">'+
          '🔊 Listen Pronunciation'+
        '</button>'+
        '<div class="vg-groups">'+
          groups.map(function(x){
            return '<button class="vg-gbtn" onclick="window.NZVerbGroup.answer(\''+x.g+'\')">'+
              '<span>'+x.g+'</span>'+
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
          '<span style="background:var(--card);border:1px solid '+c+';border-radius:8px;'+
            'padding:4px 10px;font-size:11px;font-weight:700;color:'+c+';">'+
            icon(S.level)+' '+S.level+
          '</span>'+
        '</div>'+
        '<div class="vg-dbody">'+
          '<div class="vg-dr"><div class="vg-dl">Meaning</div><div class="vg-dv">'+esc(v.en)+'</div></div>'+
          '<div class="vg-dr"><div class="vg-dl">Group</div>'+
            '<div class="vg-dv" style="color:'+(ok?'#4ade80':'var(--primary,#e8446a)')+'">'+esc(v.group)+'</div>'+
          '</div>'+
          '<div class="vg-dr full"><div class="vg-dl">Verb Type</div>'+
            '<div class="vg-dv" style="color:'+(ok?'#4ade80':'var(--primary,#e8446a)')+'">'+verbTypeLabel(v.group)+'</div>'+
          '</div>'+
          (v.romaji ? '<div class="vg-dr full"><div class="vg-dl">Romaji</div><div class="vg-dv" style="font-family:var(--font-mono,monospace)">'+esc(v.romaji)+'</div></div>' : '')+
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
    sep.style.cssText = 'font-size:18px;color:var(--border);line-height:1;margin:0 2px;align-self:center;';
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
