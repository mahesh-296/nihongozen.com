/* ════════════════════════════════════════════════════════════════
   NihongoZen — Kanji Quiz  (js/nz-kanji-quiz.js)
   ------------------------------------------------------------------
   Premium, game-inspired Kanji Quiz — INSIDE the existing Kanji
   section. No new page, no new route, no new theme, no dark-mode
   toggle. Everything below reads its colors, radii, shadows and
   fonts from the SAME CSS variables already defined in tokens.css
   (var(--bg), var(--card), var(--primary), var(--n5)…var(--n1) etc),
   and reuses the SAME classes already used across the app
   (.nz-btn / .nz-btn-pri / .nz-btn-ghost / .nz-cardu / .q-opt /
   .kj-cell / .nz-overlay-bg / .nz-modal-box …). Whatever theme is
   currently active on the site is automatically the theme the quiz
   uses — this file never sets a fixed light/dark mode itself.

   Data: reuses the existing `kanjiData` from nz-data.js. No kanji
   data is duplicated here.

   Load order: include this file with `defer`, AFTER core.js,
   nz-data.js and the big inlined nz-pages script, e.g. right
   before </body>:
       <script src="js/nz-kanji-quiz.js" defer></script>
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window._nzKQLoaded) return;
  window._nzKQLoaded = true;

  /* ────────────────────────────────────────────────────────────
     0. Small helpers (reuse globals already defined by nz-pages;
        fall back gracefully if something isn't loaded yet)
  ──────────────────────────────────────────────────────────── */
  function H(s) {
    if (typeof window.H === 'function') return window.H(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function jc(lv) { return typeof window.jlptColor === 'function' ? window.jlptColor(lv) : 'var(--primary)'; }
  function ji(lv) { return typeof window.jlptIcon  === 'function' ? window.jlptIcon(lv)  : '📘'; }
  function speakJP(t) { if (typeof window.speak === 'function') window.speak(t); }
  function toast(msg) { if (typeof window.nzShowToast === 'function') window.nzShowToast(msg); }
  function notify(type, title, body) { if (typeof window.nzAddNotif === 'function') window.nzAddNotif(type, title, body); }
  function addAppXP(n) { if (typeof window._nzAddXP === 'function') window._nzAddXP(n); }
  function $(id) { return document.getElementById(id); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) { return H(s); }

  /* ────────────────────────────────────────────────────────────
     1. Inject styles ONCE — pure extension of the existing design
        system, no overrides of existing rules, no new color palette.
  ──────────────────────────────────────────────────────────── */
  function injectStyles() {
    if ($('nz-kq-styles')) return;
    var css = ''
    + '#nz-kq-launch-row{margin-bottom:16px;}'
    + '#nz-kq-launch-btn{position:relative;overflow:hidden;display:flex;align-items:center;gap:13px;'
      + 'width:100%;padding:15px 18px;border:1px solid var(--border-strong);border-radius:var(--radius-xl);'
      + 'background:linear-gradient(135deg, rgba(255,77,126,.14), rgba(124,77,216,.12)), var(--card);'
      + 'background-blend-mode:normal;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);'
      + 'cursor:pointer;text-align:left;font-family:inherit;'
      + 'box-shadow:var(--shadow);animation:nzKQFloat 3.8s ease-in-out infinite;'
      + 'transition:transform .18s var(--ease),box-shadow .18s var(--ease),border-color .18s var(--ease);}'
    + '#nz-kq-launch-btn:hover{transform:translateY(-3px);box-shadow:var(--shadow-glow);border-color:var(--primary);}'
    + '#nz-kq-launch-btn:active{transform:translateY(-1px) scale(.98);}'
    + '#nz-kq-launch-btn:focus-visible{outline:2px solid var(--primary);outline-offset:3px;}'
    + '@keyframes nzKQFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}'
    + '.nz-kq-icowrap{width:44px;height:44px;flex-shrink:0;border-radius:13px;display:flex;align-items:center;'
      + 'justify-content:center;font-size:21px;background:var(--gradient-brand);'
      + 'box-shadow:0 4px 14px rgba(255,77,126,.35);}'
    + '.nz-kq-title{font-size:14px;font-weight:800;color:var(--fg);letter-spacing:-.2px;}'
    + '.nz-kq-sub{font-size:11px;color:var(--fg-muted);font-weight:600;margin-top:1px;}'
    + '.nz-kq-chev{margin-left:auto;color:var(--fg-muted);font-size:17px;transition:transform .18s var(--ease),color .18s;flex-shrink:0;}'
    + '#nz-kq-launch-btn:hover .nz-kq-chev{transform:translateX(3px);color:var(--primary);}'
    + '.nz-kq-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.35);'
      + 'transform:scale(0);pointer-events:none;animation:nzKQRipple .6s var(--ease);}'
    + '@keyframes nzKQRipple{to{transform:scale(3.2);opacity:0;}}'
    /* overlay / shell */
    + '.nz-kq-overlay{position:fixed;inset:0;z-index:950;background:rgba(0,0,0,.86);display:flex;'
      + 'align-items:center;justify-content:center;padding:14px;animation:fadeIn var(--duration-fast) var(--ease);}'
    + '.nz-kq-box{width:100%;max-width:640px;max-height:92vh;overflow-y:auto;background:var(--card);'
      + 'border:1px solid var(--border-strong);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);'
      + 'position:relative;animation:slideUp var(--duration) var(--ease);}'
    + '.nz-kq-close{position:absolute;top:12px;right:12px;z-index:6;width:32px;height:32px;border-radius:50%;'
      + 'display:flex;align-items:center;justify-content:center;background:var(--card-elevated);'
      + 'border:1px solid var(--border);color:var(--fg-muted);cursor:pointer;font-size:17px;transition:all .15s var(--ease);}'
    + '.nz-kq-close:hover{color:#fff;border-color:var(--primary);background:var(--primary);}'
    + '.nz-kq-screen{padding:30px 26px 26px;}'
    + '@media (max-width:560px){.nz-kq-screen{padding:24px 16px 20px;}}'
    /* mascot */
    + '.nz-kq-mascot{width:112px;height:112px;margin:0 auto 14px;animation:nzKQMascotFloat 3.2s ease-in-out infinite;}'
    + '@keyframes nzKQMascotFloat{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-9px) rotate(2deg);}}'
    + '.nz-kq-eye{animation:nzKQBlink 4.6s ease-in-out infinite;transform-origin:center;}'
    + '@keyframes nzKQBlink{0%,90%,100%{transform:scaleY(1);}94%{transform:scaleY(.12);}}'
    /* play now cta */
    + '.nz-kq-cta{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:8px;'
      + 'width:100%;padding:16px;border:none;border-radius:var(--radius-lg);font-size:16px;font-weight:800;'
      + 'font-family:inherit;color:#fff;cursor:pointer;background:var(--gradient-brand);'
      + 'box-shadow:0 8px 26px rgba(255,77,126,.38);transition:transform .16s var(--ease),box-shadow .16s var(--ease);}'
    + '.nz-kq-cta:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(255,77,126,.5);filter:brightness(1.06);}'
    + '.nz-kq-cta:active{transform:translateY(0) scale(.98);}'
    /* segmented level selector */
    + '.nz-kq-seg{display:flex;flex-wrap:wrap;gap:7px;}'
    + '.nz-kq-seg-btn{padding:9px 15px;border-radius:10px;border:1px solid var(--border);background:var(--card-elevated);'
      + 'color:var(--fg-muted);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;'
      + 'transition:all .15s var(--ease);}'
    + '.nz-kq-seg-btn.active{color:#fff;border-color:transparent;}'
    /* mode / difficulty cards */
    + '.nz-kq-cardgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:9px;}'
    + '.nz-kq-modecard{padding:13px 12px;border-radius:var(--radius);border:1px solid var(--border);'
      + 'background:var(--card-elevated);cursor:pointer;text-align:left;transition:all .15s var(--ease);}'
    + '.nz-kq-modecard:hover{border-color:var(--primary);}'
    + '.nz-kq-modecard.active{border-color:var(--primary);background:var(--primary-dim);box-shadow:0 0 0 1px var(--primary) inset;}'
    + '.nz-kq-modecard .mc-ic{font-size:18px;margin-bottom:5px;}'
    + '.nz-kq-modecard .mc-t{font-size:12.5px;font-weight:700;color:var(--fg);}'
    + '.nz-kq-modecard .mc-d{font-size:10.5px;color:var(--fg-muted);margin-top:2px;line-height:1.3;}'
    /* menu slide panel */
    + '.nz-kq-menu-bg{position:fixed;inset:0;z-index:970;background:rgba(0,0,0,.55);'
      + '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:fadeIn var(--duration-fast) var(--ease);}'
    + '.nz-kq-menu-panel{position:absolute;top:0;right:0;height:100%;width:100%;max-width:300px;background:var(--card);'
      + 'border-left:1px solid var(--border-strong);box-shadow:var(--shadow-xl);padding:22px 18px;overflow-y:auto;'
      + 'animation:nzKQSlideIn .28s var(--ease);}'
    + '@keyframes nzKQSlideIn{from{transform:translateX(100%);}to{transform:translateX(0);}}'
    + '.nz-kq-menu-item{display:flex;align-items:center;gap:10px;width:100%;padding:12px 12px;border-radius:var(--radius);'
      + 'background:transparent;border:1px solid transparent;color:var(--fg);font-size:13px;font-weight:600;'
      + 'font-family:inherit;cursor:pointer;text-align:left;margin-bottom:5px;transition:all .15s var(--ease);}'
    + '.nz-kq-menu-item:hover{background:var(--card-elevated);border-color:var(--border);}'
    /* flashcard */
    + '.nz-kq-card{position:relative;padding:30px 22px;border-radius:var(--radius-xl);background:var(--card-elevated);'
      + 'border:1px solid var(--border);text-align:center;transition:box-shadow .18s var(--ease),border-color .18s var(--ease),'
      + 'transform .28s var(--ease),opacity .28s var(--ease);}'
    + '.nz-kq-card.correct{border-color:var(--n5);box-shadow:0 0 0 2px var(--n5) inset,0 10px 30px rgba(76,175,130,.25);}'
    + '.nz-kq-card.incorrect{border-color:var(--n1);box-shadow:0 0 0 2px var(--n1) inset,0 10px 30px rgba(232,68,106,.25);}'
    + '.nz-kq-card.fly-right{transform:translateX(140%) rotate(10deg);opacity:0;}'
    + '.nz-kq-card.fly-left{transform:translateX(-140%) rotate(-10deg);opacity:0;}'
    + '.nz-kq-glyph{font-family:"Noto Serif JP",serif;font-size:76px;line-height:1;color:var(--fg);}'
    /* Maru / Batsu feedback overlay (Flip Quiz mode) */
    + '.nz-kq-marubatsu{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.3);'
      + 'width:104px;height:104px;pointer-events:none;opacity:0;z-index:5;'
      + 'display:flex;align-items:center;justify-content:center;}'
    + '.nz-kq-marubatsu.show{animation:nzKQMaruBatsu .55s cubic-bezier(.2,1.4,.4,1) forwards;}'
    + '@keyframes nzKQMaruBatsu{0%{opacity:0;transform:translate(-50%,-50%) scale(0.3);}'
      + '55%{opacity:1;transform:translate(-50%,-50%) scale(1.12);}'
      + '75%{transform:translate(-50%,-50%) scale(0.96);}'
      + '100%{opacity:1;transform:translate(-50%,-50%) scale(1);}}'
    + '.nz-kq-marubatsu svg{width:100%;height:100%;filter:drop-shadow(0 4px 14px rgba(0,0,0,.25));}'
    /* Flip Quiz — 3D card flip + toggle pills */
    + '.nz-kq-flip-outer{perspective:1400px;}'
    + '.nz-kq-flip-inner{position:relative;width:100%;min-height:150px;transition:transform .6s cubic-bezier(.4,.2,.2,1);'
      + 'transform-style:preserve-3d;}'
    + '.nz-kq-flip-inner.flipped{transform:rotateY(180deg);}'
    + '.nz-kq-flip-face{backface-visibility:hidden;-webkit-backface-visibility:hidden;width:100%;display:flex;'
      + 'flex-direction:column;align-items:center;justify-content:center;text-align:center;}'
    + '.nz-kq-flip-front{position:relative;}'
    + '.nz-kq-flip-back{position:absolute;inset:0;transform:rotateY(180deg);}'
    + '.nz-kq-fieldpills{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap;}'
    + '.nz-kq-fieldpill{font-size:11.5px;font-weight:700;padding:6px 14px;border-radius:999px;cursor:pointer;'
      + 'background:var(--card-elevated);border:1px solid var(--border);color:var(--fg-muted);transition:all .15s;}'
    + '.nz-kq-fieldpill.active{background:var(--primary);border-color:var(--primary);color:#fff;}'
    + '.nz-kq-fieldpill-label{font-size:9.5px;font-weight:800;color:var(--fg-subtle);text-transform:uppercase;'
      + 'letter-spacing:.06em;text-align:center;margin-bottom:6px;}'
    + '.nz-kq-autoswitch{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;'
      + 'color:var(--fg-muted);cursor:pointer;padding:5px 10px;border-radius:999px;background:var(--card-elevated);'
      + 'border:1px solid var(--border);}'
    + '.nz-kq-autoswitch .sw{width:28px;height:16px;border-radius:999px;background:var(--border);position:relative;'
      + 'transition:background .2s;flex-shrink:0;}'
    + '.nz-kq-autoswitch .sw::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;'
      + 'border-radius:50%;background:#fff;transition:left .2s;}'
    + '.nz-kq-autoswitch.on .sw{background:var(--primary);}'
    + '.nz-kq-autoswitch.on .sw::after{left:14px;}'
    /* stats bar */
    + '.nz-kq-statbar{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:16px;}'
    + '@media (max-width:480px){.nz-kq-statbar{grid-template-columns:repeat(3,1fr);}}'
    + '.nz-kq-stat{background:var(--card-elevated);border:1px solid var(--border);border-radius:var(--radius);'
      + 'padding:8px 6px;text-align:center;}'
    + '.nz-kq-stat .v{font-size:14px;font-weight:800;color:var(--fg);font-family:var(--font-mono);}'
    + '.nz-kq-stat .l{font-size:9px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.05em;margin-top:1px;}'
    /* combo badge */
    + '.nz-kq-combo{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;'
      + 'font-size:11px;font-weight:800;color:var(--accent);background:var(--accent-dim);'
      + 'animation:nzKQPop .3s var(--ease);}'
    + '@keyframes nzKQPop{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}'
    /* results */
    + '.nz-kq-rating{font-size:52px;font-weight:900;font-family:var(--font-mono);'
      + 'background:var(--gradient-brand);-webkit-background-clip:text;background-clip:text;color:transparent;'
      + 'line-height:1;}'
    + '.nz-kq-resgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin:16px 0;}'
    + '@media (max-width:480px){.nz-kq-resgrid{grid-template-columns:1fr 1fr;}}'
    /* misc */
    + '.nz-kq-hintbtn{background:none;border:1px solid var(--border);border-radius:8px;color:var(--fg-muted);'
      + 'font-size:11px;font-weight:700;padding:6px 11px;cursor:pointer;transition:all .15s var(--ease);}'
    + '.nz-kq-hintbtn:hover{border-color:var(--accent);color:var(--accent);}'
    + '.nz-kq-input{width:100%;padding:13px 14px;border-radius:var(--radius);border:1px solid var(--border);'
      + 'background:var(--input);color:var(--fg);font-size:15px;font-family:inherit;outline:none;box-sizing:border-box;'
      + 'transition:border-color .15s var(--ease);text-align:center;}'
    + '.nz-kq-input:focus{border-color:var(--primary);}'
    + '.nz-kq-skel{background:linear-gradient(90deg,var(--card-elevated) 25%,var(--border) 50%,var(--card-elevated) 75%);'
      + 'background-size:400% 100%;animation:nzShimmer 1.4s ease-in-out infinite;border-radius:var(--radius);}';

    var s = document.createElement('style');
    s.id = 'nz-kq-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ────────────────────────────────────────────────────────────
     2. Hook into the existing Kanji page — inject the launch button
        (same integration pattern already used elsewhere in this app
        for SRS buttons / writing canvas).
  ──────────────────────────────────────────────────────────── */
  var _origKanjiPage = window.Pages && window.Pages.kanji;
  function hookPages() {
    if (!window.Pages || typeof window.Pages.kanji !== 'function' || window.Pages.kanji._nzKQWrapped) {
      return false;
    }
    var orig = window.Pages.kanji;
    var wrapped = function () {
      orig();
      setTimeout(injectLaunchButton, 20);
    };
    wrapped._nzKQWrapped = true;
    window.Pages.kanji = wrapped;
    return true;
  }
  // Pages may not exist yet at parse time in some load orders — retry briefly.
  (function tryHook(attempts) {
    if (hookPages()) return;
    if (attempts <= 0) return;
    setTimeout(function () { tryHook(attempts - 1); }, 200);
  })(25);

  function injectLaunchButton() {
    injectStyles();
    var page = document.querySelector('#nz-content .nz-page');
    if (!page || $('nz-kq-launch-row')) return;

    var row = document.createElement('div');
    row.id = 'nz-kq-launch-row';
    row.innerHTML =
      '<button id="nz-kq-launch-btn" onclick="window.nzOpenKanjiQuiz(event)" ' +
        'aria-label="Play Kanji Quiz — a game mode inside Kanji Study">' +
        '<span class="nz-kq-icowrap">🎮</span>' +
        '<span>' +
          '<span class="nz-kq-title">Kanji Quiz</span>' +
          '<div class="nz-kq-sub">Play a fast round &amp; earn XP</div>' +
        '</span>' +
        '<span class="nz-kq-chev">→</span>' +
      '</button>';

    var header = page.children[0];
    if (header && header.nextSibling) page.insertBefore(row, header.nextSibling);
    else page.insertBefore(row, page.firstChild);
  }

  /* ────────────────────────────────────────────────────────────
     3. Quiz state
  ──────────────────────────────────────────────────────────── */
  var LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1', 'All'];
  var MODES = [
    { id: 'kanji2mean', icon: '漢', title: 'Kanji → Meaning', desc: 'See the kanji, type the meaning' },
    { id: 'mean2kanji', icon: '💭', title: 'Meaning → Kanji', desc: 'Pick the matching kanji' },
    { id: 'onyomi',     icon: '音', title: 'Onyomi Reading',  desc: 'Type the on-reading' },
    { id: 'kunyomi',    icon: '訓', title: 'Kunyomi Reading', desc: 'Type the kun-reading' },
    { id: 'mixed',      icon: '🔀', title: 'Mixed Quiz',      desc: 'A blend of question types' },
    { id: 'example',    icon: '📝', title: 'Example Sentence',desc: 'Guess meaning in context' },
    { id: 'flip-quiz',  icon: '🔁', title: 'Flip Quiz',       desc: 'Choose Kanji/Kana/Meaning for card & options — flips to reveal details' },
    { id: 'all',        icon: '✨', title: 'All Modes',       desc: 'Everything, fully randomized' }
  ];
  var DIFFICULTIES = [
    { id: 'easy',     label: 'Easy',     sub: '75s · multi-choice' },
    { id: 'medium',   label: 'Medium',   sub: '60s · mixed input' },
    { id: 'hard',     label: 'Hard',     sub: '45s · typed answers' },
    { id: 'adaptive', label: 'Adaptive', sub: 'Adjusts to you' }
  ];
  var QUESTIONS_PER_ROUND = 12;
  var STORAGE_KEY = 'nz-kq-stats';

  var KQ = null; // active session state, created on start

  function loadStats() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveStats(patch) {
    var s = loadStats();
    Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  function soundOn() {
    try { return localStorage.getItem('nz-kq-sound') !== 'off'; } catch (e) { return true; }
  }
  function setSoundOn(v) {
    try { localStorage.setItem('nz-kq-sound', v ? 'on' : 'off'); } catch (e) {}
  }

  function baseTimeFor(diff) {
    return { easy: 75, medium: 60, hard: 45, adaptive: 60 }[diff] || 60;
  }

  function newSession(level, mode, difficulty) {
    return {
      screen: 'landing',
      level: level || 'N5',
      mode: mode || 'mixed',
      difficulty: difficulty || 'medium',
      idx: 0,
      total: QUESTIONS_PER_ROUND,
      correct: 0, incorrect: 0, skipped: 0,
      streak: 0, bestStreak: 0,
      combo: 1,
      xp: 0,
      startedAt: 0,
      timeLeft: 60,
      timerId: null,
      currentQ: null,
      wrongList: [],
      order: [],
      answering: false,
      // Flip Quiz mode state
      flipCardField: 'kanji',
      flipOptionField: 'meaning',
      autoSwitch: true,
      cardFlipped: false
    };
  }

  /* ────────────────────────────────────────────────────────────
     4. Question engine — built on the existing kanjiData
  ──────────────────────────────────────────────────────────── */
  function poolForLevel(level) {
    var kd = window.kanjiData || {};
    if (level === 'All') {
      return ['N5', 'N4', 'N3', 'N2', 'N1'].reduce(function (acc, lv) {
        return acc.concat(kd[lv] || []);
      }, []);
    }
    return (kd[level] || []).slice();
  }

  function levelOf(k) {
    var kd = window.kanjiData || {};
    var lv = ['N5', 'N4', 'N3', 'N2', 'N1'].filter(function (l) {
      return (kd[l] || []).indexOf(k) !== -1;
    })[0];
    return lv || KQ.level;
  }

  function pickQType(mode) {
    var pool = ['kanji2mean', 'mean2kanji', 'onyomi', 'kunyomi'];
    if (mode === 'mixed') return pool[Math.floor(Math.random() * pool.length)];
    if (mode === 'all') return ['kanji2mean', 'mean2kanji', 'onyomi', 'kunyomi', 'example'][Math.floor(Math.random() * 5)];
    return mode;
  }

  function buildOrder() {
    var pool = poolForLevel(KQ.level);
    if (!pool.length) return [];
    var shuffled = shuffle(pool);
    var order = [];
    for (var i = 0; i < KQ.total; i++) {
      order.push(shuffled[i % shuffled.length]);
    }
    return shuffle(order);
  }

  function distractorsFor(field, correctKanji, n) {
    var kd = window.kanjiData || {};
    var samePool = (kd[levelOf(correctKanji)] || []);
    var others = samePool.filter(function (k) { return k.id !== correctKanji.id && k[field]; });
    var chosen = shuffle(others).slice(0, n).map(function (k) { return k[field]; });
    while (chosen.length < n) chosen.push('—');
    return chosen;
  }

  /* ────────────────────────────────────────────────────────────
     Flip Quiz mode — the card and the answer options can each
     independently be set to show Kanji, Kana (reading), or English
     Meaning. The two can never both show the same thing (that would
     make the question trivial), so picking one auto-shifts the other
     away from a collision. No icons anywhere in this mode — every
     option is real text. After answering, the card flips to reveal
     its Meaning / On'yomi / Kun'yomi / Example on the back.
  ──────────────────────────────────────────────────────────── */
  var FLIP_FIELDS = ['kanji', 'reading', 'meaning'];
  var FLIP_FIELD_LABEL = { kanji: 'Kanji', reading: 'Kana', meaning: 'English' };

  function otherFlipField(taken) {
    return FLIP_FIELDS.filter(function (f) { return f !== taken; })[0];
  }

  window.nzKQSetCardField = function (field) {
    if (!KQ || FLIP_FIELDS.indexOf(field) === -1) return;
    KQ.flipCardField = field;
    if (KQ.flipOptionField === field) KQ.flipOptionField = otherFlipField(field);
    loadQuestion();
    render();
  };
  window.nzKQSetOptionField = function (field) {
    if (!KQ || FLIP_FIELDS.indexOf(field) === -1) return;
    KQ.flipOptionField = field;
    if (KQ.flipCardField === field) KQ.flipCardField = otherFlipField(field);
    loadQuestion();
    render();
  };
  window.nzKQToggleAutoSwitch = function () {
    if (!KQ) return;
    KQ.autoSwitch = !KQ.autoSwitch;
    render();
  };

  function buildQuestion(kanjiEntry) {

    var qType = pickQType(KQ.mode);
    // kunyomi needs a kun reading — fall back to onyomi if missing
    if (qType === 'kunyomi' && (!kanjiEntry.kun || kanjiEntry.kun === '—')) qType = 'onyomi';

    var mc = (KQ.difficulty === 'easy') || qType === 'mean2kanji' || qType === 'flip-quiz';
    var q = { type: qType, kanji: kanjiEntry, mc: mc, options: null, prompt: '', answerField: '' };

    switch (qType) {
      case 'kanji2mean':
        q.prompt = 'What does this kanji mean?';
        q.answerField = 'meaning';
        if (mc) q.options = shuffle(distractorsFor('meaning', kanjiEntry, 3).concat([kanjiEntry.meaning]));
        break;
      case 'mean2kanji':
        q.prompt = 'Which kanji means “' + kanjiEntry.meaning.split('/')[0] + '”?';
        q.answerField = 'kanji';
        q.options = shuffle(distractorsFor('kanji', kanjiEntry, 3).concat([kanjiEntry.kanji]));
        break;
      case 'onyomi':
        q.prompt = 'Type the ON reading (音読み)';
        q.answerField = 'on';
        if (mc) q.options = shuffle(distractorsFor('on', kanjiEntry, 3).concat([kanjiEntry.on]));
        break;
      case 'kunyomi':
        q.prompt = 'Type the KUN reading (訓読み)';
        q.answerField = 'kun';
        if (mc) q.options = shuffle(distractorsFor('kun', kanjiEntry, 3).concat([kanjiEntry.kun]));
        break;
      case 'example':
        q.prompt = 'What does the highlighted kanji mean here?';
        q.answerField = 'meaning';
        if (mc) q.options = shuffle(distractorsFor('meaning', kanjiEntry, 3).concat([kanjiEntry.meaning]));
        break;
      case 'flip-quiz':
        var cardField = KQ.flipCardField || 'kanji';
        var optField  = KQ.flipOptionField || 'meaning';
        q.cardField = cardField;
        q.optField  = optField;
        q.prompt = 'Pick the matching ' + FLIP_FIELD_LABEL[optField];
        q.answerField = optField;
        q.options = shuffle(distractorsFor(optField, kanjiEntry, 5).concat([kanjiEntry[optField]]));
        q.mc = true;
        break;
    }
    return q;
  }

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[・･\/,、。\s]+/g, '').trim();
  }
  function answerMatches(userInput, correctRaw) {
    var u = normalize(userInput);
    if (!u) return false;
    var parts = String(correctRaw || '').split(/[・\/]/).map(normalize).filter(Boolean);
    return parts.indexOf(u) !== -1 || parts.some(function (p) {
      return p.length > 1 && (p.indexOf(u) !== -1 || u.indexOf(p) !== -1);
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. Overlay shell + router-free "screens"
  ──────────────────────────────────────────────────────────── */
  function ensureOverlay() {
    var ov = $('nz-kq-overlay');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'nz-kq-overlay';
    ov.className = 'nz-kq-overlay';
    ov.innerHTML =
      '<div class="nz-kq-box" id="nz-kq-box" role="dialog" aria-modal="true" aria-label="Kanji Quiz">' +
        '<button class="nz-kq-close" onclick="window.nzKQClose()" aria-label="Close Kanji Quiz">×</button>' +
        '<div id="nz-kq-body"></div>' +
      '</div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) window.nzKQClose(); });
    document.body.appendChild(ov);
    document.addEventListener('keydown', kqKeyHandler);
    return ov;
  }

  function kqKeyHandler(e) {
    if (!$('nz-kq-overlay')) return;
    if (e.key === 'Escape') window.nzKQClose();
    if (e.key === 'Enter' && KQ && KQ.screen === 'play' && !KQ.currentQ.mc) {
      var inp = $('nz-kq-answer-input');
      if (inp && document.activeElement === inp) window.nzKQSubmitAnswer();
    }
  }

  window.nzOpenKanjiQuiz = function (e) {
    if (e && e.currentTarget) {
      spawnRipple(e.currentTarget, e);
    }
    injectStyles();
    if (!window.kanjiData) { toast('Kanji data isn\'t loaded yet — try again in a moment.'); return; }
    KQ = newSession('N5', 'mixed', 'medium');
    ensureOverlay();
    render();
  };

  window.nzKQClose = function () {
    if (KQ && KQ.timerId) clearInterval(KQ.timerId);
    var ov = $('nz-kq-overlay');
    if (ov) ov.remove();
    document.removeEventListener('keydown', kqKeyHandler);
    KQ = null;
  };

  function spawnRipple(btn, e) {
    try {
      var r = document.createElement('span');
      r.className = 'nz-kq-ripple';
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + 'px';
      r.style.left = ((e.clientX || rect.left + rect.width / 2) - rect.left - size / 2) + 'px';
      r.style.top  = ((e.clientY || rect.top + rect.height / 2) - rect.top - size / 2) + 'px';
      btn.appendChild(r);
      setTimeout(function () { r.remove(); }, 650);
    } catch (err) {}
  }

  function render() {
    var body = $('nz-kq-body');
    if (!body) return;
    if (KQ.screen === 'landing')  return renderLanding(body);
    if (KQ.screen === 'config')   return renderConfig(body);
    if (KQ.screen === 'play')     return renderPlay(body);
    if (KQ.screen === 'results')  return renderResults(body);
  }

  /* ---------- PAGE 1 — Landing ---------- */
  function renderLanding(body) {
    var stats = loadStats();
    body.innerHTML =
      '<div class="nz-kq-screen" style="text-align:center;">' +
        mascotSVG() +
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 8px;letter-spacing:-.4px;">Kanji Quiz</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);line-height:1.6;max-width:440px;margin:0 auto 22px;">' +
          'Master Japanese Kanji through a fun and interactive quiz experience! Practice meanings, readings, ' +
          'and recognition while earning XP and improving your memory. New to Kanji? Visit the Study section ' +
          'first before starting the quiz.' +
        '</p>' +
        (stats.totalPlayed ? statsPeek(stats) : '') +
        '<button class="nz-kq-cta" onclick="window.nzKQGoConfig(event)">🎮 PLAY NOW</button>' +
      '</div>';
  }

  function statsPeek(stats) {
    return '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:18px;flex-wrap:wrap;">' +
      pill('🏆 Best streak', stats.bestStreak || 0) +
      pill('✨ Total XP', stats.totalXP || 0) +
      pill('🎯 Best acc.', (stats.bestAccuracy || 0) + '%') +
    '</div>';
  }
  function pill(label, val) {
    return '<span style="display:inline-flex;gap:5px;align-items:center;padding:5px 11px;border-radius:999px;' +
      'background:var(--card-elevated);border:1px solid var(--border);font-size:11px;color:var(--fg-muted);font-weight:600;">' +
      label + ': <b style="color:var(--fg);">' + esc(val) + '</b></span>';
  }

  function mascotSVG() {
    return '<div class="nz-kq-mascot">' +
      '<svg viewBox="0 0 120 120" width="112" height="112" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="60" cy="68" rx="40" ry="36" style="fill:var(--card-elevated);stroke:var(--border-strong);stroke-width:2;"/>' +
        '<path d="M28 46 L20 14 L46 38 Z" style="fill:var(--primary);"/>' +
        '<path d="M92 46 L100 14 L74 38 Z" style="fill:var(--primary);"/>' +
        '<path d="M30 44 L25 22 L44 40 Z" style="fill:var(--accent);opacity:.7;"/>' +
        '<path d="M90 44 L95 22 L76 40 Z" style="fill:var(--accent);opacity:.7;"/>' +
        '<ellipse cx="42" cy="70" rx="6" ry="7" class="nz-kq-eye" style="fill:var(--fg);"/>' +
        '<ellipse cx="78" cy="70" rx="6" ry="7" class="nz-kq-eye" style="fill:var(--fg);"/>' +
        '<circle cx="30" cy="82" r="6" style="fill:var(--primary);opacity:.35;"/>' +
        '<circle cx="90" cy="82" r="6" style="fill:var(--primary);opacity:.35;"/>' +
        '<path d="M50 90 Q60 98 70 90" style="fill:none;stroke:var(--fg);stroke-width:3;stroke-linecap:round;"/>' +
      '</svg>' +
    '</div>';
  }

  /* ---------- PAGE 2 — Config ---------- */
  window.nzKQGoConfig = function (e) {
    if (e && e.currentTarget) spawnRipple(e.currentTarget, e);
    KQ.screen = 'config';
    render();
  };
  window.nzKQGoLanding = function () { KQ.screen = 'landing'; render(); };

  window.nzKQSetLevel = function (lv) { KQ.level = lv; render(); };
  window.nzKQSetMode  = function (m)  { KQ.mode  = m;  render(); };
  window.nzKQSetDifficulty = function (d) { KQ.difficulty = d; render(); };

  function renderConfig(body) {
    body.innerHTML =
      '<div class="nz-kq-screen">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">' +
          '<h2 style="font-size:18px;font-weight:800;color:var(--fg);margin:0;">Set Up Your Quiz</h2>' +
          '<button class="nz-kq-hintbtn" onclick="window.nzKQToggleMenu()">☰ Menu</button>' +
        '</div>' +

        sectionLabel('JLPT Level') +
        '<div class="nz-kq-seg" style="margin-bottom:20px;">' +
          LEVELS.map(function (lv) {
            var c = lv === 'All' ? 'var(--primary)' : jc(lv);
            var active = KQ.level === lv;
            return '<button class="nz-kq-seg-btn' + (active ? ' active' : '') + '" ' +
              'style="' + (active ? 'background:' + c + ';border-color:' + c + ';' : '') + '" ' +
              'onclick="window.nzKQSetLevel(\'' + lv + '\')">' + (lv === 'All' ? '✨ All Levels' : ji(lv) + ' ' + lv) + '</button>';
          }).join('') +
        '</div>' +

        sectionLabel('Quiz Mode') +
        '<div class="nz-kq-cardgrid" style="margin-bottom:20px;">' +
          MODES.map(function (m) {
            var active = KQ.mode === m.id;
            return '<button class="nz-kq-modecard' + (active ? ' active' : '') + '" onclick="window.nzKQSetMode(\'' + m.id + '\')">' +
              '<div class="mc-ic">' + m.icon + '</div>' +
              '<div class="mc-t">' + esc(m.title) + '</div>' +
              '<div class="mc-d">' + esc(m.desc) + '</div>' +
            '</button>';
          }).join('') +
        '</div>' +

        sectionLabel('Difficulty') +
        '<div class="nz-kq-seg" style="margin-bottom:26px;">' +
          DIFFICULTIES.map(function (d) {
            var active = KQ.difficulty === d.id;
            return '<button class="nz-kq-seg-btn' + (active ? ' active' : '') + '" ' +
              'style="' + (active ? 'background:var(--primary);border-color:var(--primary);' : '') + '" ' +
              'title="' + esc(d.sub) + '" onclick="window.nzKQSetDifficulty(\'' + d.id + '\')">' + esc(d.label) + '</button>';
          }).join('') +
        '</div>' +

        '<button class="nz-kq-cta" onclick="window.nzKQStart(event)">▶ START</button>' +
      '</div>';
  }
  function sectionLabel(t) {
    return '<div style="font-size:11px;font-weight:800;color:var(--fg-muted);text-transform:uppercase;' +
      'letter-spacing:.07em;margin-bottom:9px;">' + esc(t) + '</div>';
  }

  /* menu slide panel */
  window.nzKQToggleMenu = function () {
    var existing = $('nz-kq-menu-bg');
    if (existing) { existing.remove(); return; }
    var bg = document.createElement('div');
    bg.id = 'nz-kq-menu-bg';
    bg.className = 'nz-kq-menu-bg';
    bg.innerHTML =
      '<div class="nz-kq-menu-panel">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<span style="font-size:15px;font-weight:800;color:var(--fg);">Quiz Menu</span>' +
          '<button class="nz-kq-close" style="position:static;" onclick="window.nzKQToggleMenu()" aria-label="Close menu">×</button>' +
        '</div>' +
        menuItem('🎮', 'Play Now', "window.nzKQStart(event)") +
        menuItem('🏆', 'Leaderboard', "window.nzKQMenuSoon('Leaderboard')") +
        menuItem('📚', 'Study', "window.nzKQMenuStudy()") +
        menuItem('🔥', 'Daily Challenge', "window.nzKQMenuSoon('Daily Challenge')") +
        menuItem('🏅', 'Achievements', "window.nzKQMenuAchievements()") +
        menuItem(soundOn() ? '🔊' : '🔇', 'Sound: ' + (soundOn() ? 'On' : 'Off'), "window.nzKQToggleSound()") +
        menuItem('⚙️', 'Settings', "window.nzKQMenuSoon('Settings')") +
        menuItem('ℹ️', 'About', "window.nzKQMenuAbout()") +
      '</div>';
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); });
    document.getElementById('nz-kq-box').appendChild(bg);
  };
  function menuItem(icon, label, onclick) {
    return '<button class="nz-kq-menu-item" onclick="' + onclick + '">' +
      '<span style="font-size:16px;">' + icon + '</span>' + esc(label) + '</button>';
  }
  window.nzKQMenuSoon = function (name) { toast(name + ' is coming in a future update! 🎮'); };
  window.nzKQMenuStudy = function () {
    var bg = $('nz-kq-menu-bg'); if (bg) bg.remove();
    window.nzKQClose();
  };
  window.nzKQToggleSound = function () {
    setSoundOn(!soundOn());
    var bg = $('nz-kq-menu-bg'); if (bg) bg.remove();
    window.nzKQToggleMenu();
  };
  window.nzKQMenuAbout = function () {
    toast('Kanji Quiz — practice meanings & readings, earn XP, and build your streak. Have fun! 🎌');
  };
  window.nzKQMenuAchievements = function () {
    var s = loadStats();
    var bg = $('nz-kq-menu-bg'); if (bg) bg.remove();
    var box = $('nz-kq-box');
    var panel = document.createElement('div');
    panel.className = 'nz-kq-menu-bg';
    panel.id = 'nz-kq-menu-bg';
    panel.innerHTML =
      '<div class="nz-kq-menu-panel">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<span style="font-size:15px;font-weight:800;color:var(--fg);">Achievements</span>' +
          '<button class="nz-kq-close" style="position:static;" onclick="window.nzKQToggleMenu()" aria-label="Close">×</button>' +
        '</div>' +
        achRow('🌱', 'First Round', 'Play your first quiz', (s.totalPlayed || 0) >= 1) +
        achRow('🔥', 'On a Roll', '5-answer streak', (s.bestStreak || 0) >= 5) +
        achRow('🎯', 'Sharp Shooter', '90%+ accuracy in a round', (s.bestAccuracy || 0) >= 90) +
        achRow('🌟', 'XP Grinder', 'Earn 200+ quiz XP total', (s.totalXP || 0) >= 200) +
      '</div>';
    panel.addEventListener('click', function (e) { if (e.target === panel) panel.remove(); });
    box.appendChild(panel);
  };
  function achRow(icon, title, desc, earned) {
    return '<div class="nz-cardu" style="display:flex;align-items:center;gap:10px;padding:11px;margin-bottom:8px;' +
      'opacity:' + (earned ? '1' : '.45') + ';">' +
      '<span style="font-size:20px;">' + icon + '</span>' +
      '<div><div style="font-size:12.5px;font-weight:700;color:var(--fg);">' + esc(title) + '</div>' +
      '<div style="font-size:10.5px;color:var(--fg-muted);">' + esc(desc) + '</div></div>' +
      (earned ? '<span style="margin-left:auto;color:var(--n5);font-size:15px;">✓</span>' : '') +
    '</div>';
  }

  /* ---------- PAGE 3 — Gameplay ---------- */
  window.nzKQStart = function (e) {
    if (e && e.currentTarget) spawnRipple(e.currentTarget, e);
    var bg = $('nz-kq-menu-bg'); if (bg) bg.remove();
    KQ.order = buildOrder();
    if (!KQ.order.length) { toast('No kanji found for that level yet.'); return; }
    KQ.idx = 0;
    KQ.correct = 0; KQ.incorrect = 0; KQ.skipped = 0;
    KQ.streak = 0; KQ.bestStreak = 0; KQ.combo = 1; KQ.xp = 0;
    KQ.wrongList = [];
    KQ.startedAt = Date.now();
    KQ.screen = 'play';
    loadQuestion();
    render();
  };

  function loadQuestion() {
    var kEntry = KQ.order[KQ.idx];
    KQ.currentQ = buildQuestion(kEntry);
    KQ.answering = true;
    var t = baseTimeFor(KQ.difficulty);
    if (KQ.difficulty === 'adaptive') {
      var acc = (KQ.correct + KQ.incorrect) ? KQ.correct / (KQ.correct + KQ.incorrect) : 0.5;
      t = Math.max(30, Math.min(75, Math.round(60 - (acc - 0.5) * 40)));
    }
    KQ.timeLeft = t;
    startTimer();
  }

  function startTimer() {
    if (KQ.timerId) clearInterval(KQ.timerId);
    KQ.timerId = setInterval(function () {
      KQ.timeLeft -= 1;
      updateTimerUI();
      if (KQ.timeLeft <= 0) {
        clearInterval(KQ.timerId);
        handleTimeout();
      }
    }, 1000);
  }
  function updateTimerUI() {
    var ring = $('nz-kq-timer-ring');
    var label = $('nz-kq-timer-label');
    if (!ring) return;
    var total = baseTimeFor(KQ.difficulty);
    var pct = Math.max(0, KQ.timeLeft / total);
    var circumference = 2 * Math.PI * 26;
    ring.style.strokeDashoffset = circumference * (1 - pct);
    ring.style.stroke = pct < 0.25 ? 'var(--n1)' : (pct < 0.5 ? 'var(--accent)' : 'var(--primary)');
    if (label) label.textContent = KQ.timeLeft;
  }

  function renderPlay(body) {
    var q = KQ.currentQ;
    var k = q.kanji;
    var color = jc(levelOf(k));
    var total = baseTimeFor(KQ.difficulty);
    var circumference = 2 * Math.PI * 26;
    var isFlip = q.type === 'flip-quiz';

    body.innerHTML =
      '<div class="nz-kq-screen">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<button class="nz-kq-hintbtn" onclick="window.nzKQQuit()">✕ Quit</button>' +
          '<span style="font-size:11px;font-weight:700;color:var(--fg-muted);">Q ' + (KQ.idx + 1) + ' / ' + KQ.total + '</span>' +
          '<svg width="60" height="60" viewBox="0 0 60 60" style="flex-shrink:0;">' +
            '<circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" stroke-width="5"/>' +
            '<circle id="nz-kq-timer-ring" class="timer-ring" cx="30" cy="30" r="26" fill="none" ' +
              'stroke="var(--primary)" stroke-width="5" stroke-linecap="round" ' +
              'stroke-dasharray="' + circumference + '" stroke-dashoffset="0" ' +
              'transform="rotate(-90 30 30)"/>' +
            '<text x="30" y="35" text-anchor="middle" id="nz-kq-timer-label" ' +
              'style="font-family:var(--font-mono);font-size:15px;font-weight:800;fill:var(--fg);">' + KQ.timeLeft + '</text>' +
          '</svg>' +
        '</div>' +

        (isFlip ?
          '<div style="text-align:center;margin-bottom:12px;">' +
            '<span class="nz-kq-autoswitch' + (KQ.autoSwitch ? ' on' : '') + '" onclick="window.nzKQToggleAutoSwitch()">' +
              '<span class="sw"></span> Auto-advance ' + (KQ.autoSwitch ? 'ON' : 'OFF — swipe card to continue') +
            '</span>' +
          '</div>'
        : '') +

        '<div class="nz-kq-statbar">' +
          statChip(KQ.correct, 'Correct') +
          statChip(KQ.incorrect, 'Wrong') +
          statChip(KQ.streak, 'Streak') +
          statChip(KQ.xp, 'XP') +
        '</div>' +

        '<div class="nz-bartr" style="height:5px;margin-bottom:20px;">' +
          '<div class="nz-barfi" style="width:' + Math.round(KQ.idx / KQ.total * 100) + '%;background:var(--gradient-brand);"></div>' +
        '</div>' +

        '<div class="nz-kq-card" id="nz-kq-flashcard">' +
          '<span style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;color:' + color + ';' +
            'background:' + color + '18;border:1px solid ' + color + ';padding:2px 9px;border-radius:5px;' +
            'font-family:var(--font-mono);margin-bottom:14px;">' + ji(levelOf(k)) + ' ' + esc(levelOf(k)) + '</span>' +
          renderPrompt(q) +
          '<div id="nz-kq-feedback" style="min-height:20px;margin-top:12px;font-size:12.5px;font-weight:700;"></div>' +
        '</div>' +

        (isFlip ? fieldPillsRow('Card shows', KQ.flipCardField, 'nzKQSetCardField') : '') +

        '<div style="margin-top:16px;">' + renderAnswerArea(q) + '</div>' +

        (isFlip ? fieldPillsRow('Options show', KQ.flipOptionField, 'nzKQSetOptionField') : '') +

        '<div style="display:flex;gap:8px;margin-top:14px;">' +
          '<button class="nz-kq-hintbtn" style="flex:1;" onclick="window.nzKQHint()">💡 Hint</button>' +
          '<button class="nz-kq-hintbtn" style="flex:1;" onclick="window.nzKQSkip()">⏭ Skip</button>' +
        '</div>' +
      '</div>';

    updateTimerUI();
    var inp = $('nz-kq-answer-input');
    if (inp) inp.focus();
    if (isFlip) wireSwipeAdvance();
  }

  function fieldPillsRow(label, current, setter) {
    return '<div style="text-align:center;margin:14px 0;">' +
      '<div class="nz-kq-fieldpill-label">' + esc(label) + '</div>' +
      '<div class="nz-kq-fieldpills">' +
        FLIP_FIELDS.map(function (f) {
          return '<button class="nz-kq-fieldpill' + (current === f ? ' active' : '') + '" ' +
            'onclick="window.' + setter + '(\'' + f + '\')">' + esc(FLIP_FIELD_LABEL[f]) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function statChip(val, label) {
    return '<div class="nz-kq-stat"><div class="v">' + esc(val) + '</div><div class="l">' + esc(label) + '</div></div>';
  }

  function renderPrompt(q) {
    var k = q.kanji;
    if (q.type === 'flip-quiz') {
      var frontContent;
      if (q.cardField === 'kanji') {
        frontContent = '<div class="nz-kq-glyph">' + esc(k.kanji) + '</div>';
      } else if (q.cardField === 'reading') {
        frontContent = '<div style="font-family:\'Noto Sans JP\',sans-serif;font-size:36px;color:var(--fg);font-weight:700;">' + esc(k.reading) + '</div>';
      } else {
        frontContent = '<div style="font-size:21px;font-weight:800;color:var(--fg);padding:0 6px;">' + esc(k.meaning) + '</div>';
      }
      return (
        '<div class="nz-kq-flip-outer">' +
          '<div class="nz-kq-flip-inner' + (KQ.cardFlipped ? ' flipped' : '') + '" id="nz-kq-flip-inner">' +
            '<div class="nz-kq-flip-face nz-kq-flip-front">' +
              frontContent +
              '<div style="font-size:11px;color:var(--fg-muted);margin-top:10px;">' + esc(q.prompt) + '</div>' +
            '</div>' +
            '<div class="nz-kq-flip-face nz-kq-flip-back">' +
              '<div class="nz-kq-glyph" style="font-size:42px;margin-bottom:6px;">' + esc(k.kanji) + '</div>' +
              '<div style="font-size:15px;font-weight:800;color:var(--fg);margin-bottom:8px;">' + esc(k.meaning) + '</div>' +
              '<div style="display:flex;gap:14px;justify-content:center;font-size:12px;color:var(--fg-muted);margin-bottom:8px;">' +
                '<span><b style="color:var(--fg);">On</b> ' + esc(k.on || '—') + '</span>' +
                '<span><b style="color:var(--fg);">Kun</b> ' + esc(k.kun || '—') + '</span>' +
              '</div>' +
              (k.example ?
                '<div style="font-family:\'Noto Sans JP\',sans-serif;font-size:12.5px;color:var(--fg-muted);border-top:1px dashed var(--border);padding-top:8px;max-width:260px;">' + esc(k.example) + '</div>' +
                '<div style="font-size:10.5px;color:var(--fg-subtle);margin-top:2px;">' + esc(k.exampleMeaning || '') + '</div>'
              : '') +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }
    if (q.type === 'mean2kanji') {
      return '<div style="font-size:15px;font-weight:700;color:var(--fg);margin-bottom:4px;">' + esc(q.prompt) + '</div>';
    }
    if (q.type === 'example') {
      var sentence = esc(k.example).replace(esc(k.kanji), '<span style="color:var(--primary);font-weight:800;">' + esc(k.kanji) + '</span>');
      return '<div style="font-family:\'Noto Sans JP\',sans-serif;font-size:20px;color:var(--fg);margin-bottom:8px;">' + sentence + '</div>' +
        '<div style="font-size:11px;color:var(--fg-muted);margin-bottom:6px;">' + esc(q.prompt) + '</div>';
    }
    return '<div class="nz-kq-glyph" style="margin-bottom:10px;">' + esc(k.kanji) + '</div>' +
      '<div style="font-size:12px;color:var(--fg-muted);">' + esc(q.prompt) + '</div>';
  }

  function renderAnswerArea(q) {
    if (q.mc && q.options) {
      var isKanjiOpt = q.answerField === 'kanji';
      return '<div class="nz-kq-cardgrid" id="nz-kq-options" style="grid-template-columns:repeat(2,1fr);">' +
        q.options.map(function (opt, i) {
          return '<button class="q-opt" style="' + (isKanjiOpt ? 'font-family:\'Noto Serif JP\',serif;font-size:24px;justify-content:center;padding:16px;' : '') + '" ' +
            'data-opt="' + esc(opt) + '" onclick="window.nzKQSelectOption(' + i + ')">' + esc(opt) + '</button>';
        }).join('') +
      '</div>';
    }
    return '<div style="display:flex;gap:8px;">' +
      '<input id="nz-kq-answer-input" class="nz-kq-input" type="text" placeholder="Type your answer" autocomplete="off" ' +
        'aria-label="Your answer" />' +
      '<button class="nz-btn nz-btn-pri" onclick="window.nzKQSubmitAnswer()">Go</button>' +
    '</div>';
  }

  window.nzKQSelectOption = function (i) {
    if (!KQ.answering) return;
    var q = KQ.currentQ;
    var chosen = q.options[i];
    evaluate(chosen === q.kanji[q.answerField], chosen);
  };
  window.nzKQSubmitAnswer = function () {
    if (!KQ.answering) return;
    var inp = $('nz-kq-answer-input');
    var val = inp ? inp.value : '';
    var q = KQ.currentQ;
    evaluate(answerMatches(val, q.kanji[q.answerField]), val);
  };
  window.nzKQHint = function () {
    if (!KQ.answering) return;
    var fb = $('nz-kq-feedback');
    var k = KQ.currentQ.kanji;
    if (fb) {
      fb.style.color = 'var(--accent)';
      fb.textContent = 'Hint: ' + (KQ.currentQ.answerField === 'kanji' ? k.reading : k.reading.split('・')[0]);
    }
  };
  window.nzKQSkip = function () {
    if (!KQ.answering) return;
    if (KQ.timerId) clearInterval(KQ.timerId);
    KQ.skipped++;
    KQ.streak = 0;
    KQ.wrongList.push({ kanji: KQ.currentQ.kanji, your: '(skipped)', correct: correctAnswerText(KQ.currentQ) });
    advance();
  };

  function handleTimeout() {
    if (!KQ.answering) return;
    KQ.skipped++;
    KQ.streak = 0;
    KQ.wrongList.push({ kanji: KQ.currentQ.kanji, your: '(timed out)', correct: correctAnswerText(KQ.currentQ) });
    flashCard('incorrect', 'fly-left');
    setTimeout(advance, 420);
  }

  function correctAnswerText(q) {
    var raw = q.kanji[q.answerField];
    return String(raw || '').split(/[・\/]/)[0];
  }

  function evaluate(isCorrect, userVal) {
    if (!KQ.answering) return;
    KQ.answering = false;
    if (KQ.timerId) clearInterval(KQ.timerId);

    var isFlip = KQ.currentQ.type === 'flip-quiz';
    var fb = $('nz-kq-feedback');
    if (isCorrect) {
      KQ.correct++;
      KQ.streak++;
      KQ.bestStreak = Math.max(KQ.bestStreak, KQ.streak);
      KQ.combo = 1 + Math.floor(KQ.streak / 3);
      var gained = 4 * KQ.combo;
      KQ.xp += gained;
      if (fb) fb.innerHTML = '✓ Correct! <span class="nz-kq-combo">+' + gained + ' XP ×' + KQ.combo + '</span>';
    } else {
      KQ.incorrect++;
      KQ.streak = 0;
      KQ.combo = 1;
      KQ.wrongList.push({ kanji: KQ.currentQ.kanji, your: String(userVal || '—'), correct: correctAnswerText(KQ.currentQ) });
      if (fb) { fb.style.color = 'var(--n1)'; fb.textContent = '✕ Correct answer: ' + correctAnswerText(KQ.currentQ); }
    }
    refreshStatChips();

    if (isFlip) {
      // Flip the card in place (no full re-render yet, so the CSS
      // transition actually plays) and show the Maru/Batsu mark.
      KQ.cardFlipped = true;
      var inner = $('nz-kq-flip-inner');
      if (inner) inner.classList.add('flipped');
      showMaruBatsu(isCorrect);
      if (KQ.autoSwitch) {
        setTimeout(advance, 1700);
      }
      // else: stays flipped until the user swipes the card (see
      // wireSwipeAdvance, attached in renderPlay for this mode).
    } else {
      flashCard(isCorrect ? 'correct' : 'incorrect', isCorrect ? 'fly-right' : 'fly-left');
      setTimeout(advance, 620);
    }
  }

  /* Maru (○ correct) / Batsu (✕ wrong) — the classic Japanese quiz-show
     mark, shown for Flip Quiz answers. */
  function showMaruBatsu(isCorrect) {
    var card = $('nz-kq-flashcard');
    if (!card) return;
    var wrap = document.createElement('div');
    wrap.className = 'nz-kq-marubatsu';
    wrap.innerHTML = isCorrect
      ? '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="var(--n5)" stroke-width="10"/></svg>'
      : '<svg viewBox="0 0 100 100">' +
          '<line x1="24" y1="24" x2="76" y2="76" stroke="var(--n1)" stroke-width="10" stroke-linecap="round"/>' +
          '<line x1="76" y1="24" x2="24" y2="76" stroke="var(--n1)" stroke-width="10" stroke-linecap="round"/>' +
        '</svg>';
    card.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('show'); });
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 950);
  }

  function refreshStatChips() {
    var bar = document.querySelector('.nz-kq-statbar');
    if (!bar) return;
    bar.innerHTML = statChip(KQ.correct, 'Correct') + statChip(KQ.incorrect, 'Wrong') +
      statChip(KQ.streak, 'Streak') + statChip(KQ.xp, 'XP');
  }

  function flashCard(cls, flyCls) {
    var card = $('nz-kq-flashcard');
    if (!card) return;
    card.classList.add(cls);
    setTimeout(function () { if (card) card.classList.add(flyCls); }, 280);
  }

  /* Swipe-to-advance — only active for Flip Quiz once the card has been
     flipped, and only when Auto-Switch is turned off. Any direction of
     swipe counts. */
  function wireSwipeAdvance() {
    var card = $('nz-kq-flashcard');
    if (!card || card._nzSwipeWired) return;
    card._nzSwipeWired = true;
    var startX = 0, startY = 0, tracking = false;
    function onStart(e) {
      if (!KQ || !KQ.cardFlipped || KQ.autoSwitch) return;
      var t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY; tracking = true;
    }
    function onEnd(e) {
      if (!tracking) return;
      tracking = false;
      var t = (e.changedTouches && e.changedTouches[0]) || e;
      var dx = t.clientX - startX, dy = t.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > 40) advance();
    }
    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchend', onEnd);
    card.addEventListener('mousedown', onStart);
    card.addEventListener('mouseup', onEnd);
  }

  function advance() {
    KQ.idx++;
    KQ.cardFlipped = false;
    if (KQ.idx >= KQ.total) {
      finishRound();
    } else {
      loadQuestion();
      render();
    }
  }

  window.nzKQQuit = function () {
    if (KQ.timerId) clearInterval(KQ.timerId);
    finishRound(true);
  };

  /* ---------- Results ---------- */
  function finishRound(quit) {
    if (KQ.timerId) clearInterval(KQ.timerId);
    var answered = KQ.correct + KQ.incorrect;
    var accuracy = answered ? Math.round((KQ.correct / (KQ.correct + KQ.incorrect + KQ.skipped)) * 100) : 0;
    var timeTaken = Math.round((Date.now() - KQ.startedAt) / 1000);

    addAppXP(KQ.xp);
    var prevStats = loadStats();
    saveStats({
      totalPlayed: (prevStats.totalPlayed || 0) + 1,
      totalXP: (prevStats.totalXP || 0) + KQ.xp,
      bestStreak: Math.max(prevStats.bestStreak || 0, KQ.bestStreak),
      bestAccuracy: Math.max(prevStats.bestAccuracy || 0, accuracy)
    });

    KQ._accuracy = accuracy;
    KQ._timeTaken = timeTaken;
    KQ._quit = !!quit;
    KQ.screen = 'results';
    render();

    var rating = ratingFor(accuracy);
    if (rating === 'S' || rating === 'A') {
      setTimeout(confettiBurst, 250);
      notify('xp', '🎉 Great round!', 'Rating ' + rating + ' · ' + accuracy + '% accuracy');
    }
  }

  function ratingFor(acc) {
    if (acc >= 90) return 'S';
    if (acc >= 75) return 'A';
    if (acc >= 55) return 'B';
    return 'C';
  }

  function renderResults(body) {
    var acc = KQ._accuracy;
    var rating = ratingFor(acc);
    var recs = shuffle(KQ.wrongList.map(function (w) { return w.kanji; })).slice(0, 6);
    if (!recs.length) recs = shuffle(poolForLevel(KQ.level)).slice(0, 4);

    body.innerHTML =
      '<div class="nz-kq-screen" style="text-align:center;">' +
        '<div class="nz-kq-rating">' + rating + '</div>' +
        '<div style="font-size:14px;font-weight:700;color:var(--fg);margin:4px 0 20px;">' +
          (KQ._quit ? 'Round ended early' : 'Round complete!') + '</div>' +

        '<div class="nz-kq-resgrid" style="text-align:left;">' +
          resCell('XP Earned', '+' + KQ.xp, 'var(--primary)') +
          resCell('Accuracy', acc + '%', 'var(--n5)') +
          resCell('Best Streak', KQ.bestStreak, 'var(--accent)') +
          resCell('Time Taken', KQ._timeTaken + 's', 'var(--n4)') +
          resCell('Correct / Wrong / Skip', KQ.correct + ' / ' + KQ.incorrect + ' / ' + KQ.skipped, 'var(--fg)') +
          resCell('Level Played', KQ.level, 'var(--fg)') +
        '</div>' +

        (KQ.wrongList.length ? (
          '<div style="text-align:left;margin-bottom:18px;">' +
            sectionLabel('Review') +
            '<div style="max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">' +
              KQ.wrongList.slice(0, 8).map(function (w) {
                return '<div class="nz-cardu" style="display:flex;align-items:center;gap:10px;padding:9px 11px;">' +
                  '<span style="font-family:\'Noto Serif JP\',serif;font-size:20px;color:var(--fg);">' + esc(w.kanji.kanji) + '</span>' +
                  '<div style="font-size:11px;color:var(--fg-muted);flex:1;">' +
                    'You: <span style="color:var(--n1);">' + esc(w.your) + '</span> · Correct: ' +
                    '<span style="color:var(--n5);">' + esc(w.correct) + '</span>' +
                  '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>'
        ) : '') +

        (recs.length ? (
          '<div style="text-align:left;margin-bottom:22px;">' +
            sectionLabel('Recommended to Practice') +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
              recs.map(function (k) {
                return '<button class="kj-cell" style="width:60px;height:60px;padding:8px 4px;" onclick="window.nzKQSpeak(\'' + esc(k.kanji) + '\')" title="' + esc(k.meaning) + '">' +
                  '<span style="font-family:\'Noto Serif JP\',serif;font-size:20px;color:' + jc(levelOf(k)) + ';">' + esc(k.kanji) + '</span>' +
                '</button>';
              }).join('') +
            '</div>' +
          '</div>'
        ) : '') +

        '<div style="display:flex;flex-direction:column;gap:9px;">' +
          '<button class="nz-kq-cta" onclick="window.nzKQPlayAgain(event)">🔁 Play Again</button>' +
          '<button class="nz-btn nz-btn-ghost" style="justify-content:center;" onclick="window.nzKQClose()">📖 Continue Learning</button>' +
          '<button class="nz-btn nz-btn-ghost" style="justify-content:center;" onclick="window.nzKQClose()">← Back to Kanji Study</button>' +
        '</div>' +
      '</div>';
  }
  function resCell(label, val, color) {
    return '<div class="nz-cardu" style="padding:12px;">' +
      '<div style="font-size:10px;color:var(--fg-muted);margin-bottom:3px;">' + esc(label) + '</div>' +
      '<div style="font-size:16px;font-weight:800;color:' + color + ';font-family:var(--font-mono);">' + esc(val) + '</div>' +
    '</div>';
  }
  window.nzKQSpeak = function (k) { speakJP(k); };
  window.nzKQPlayAgain = function (e) {
    if (e && e.currentTarget) spawnRipple(e.currentTarget, e);
    var lv = KQ.level, m = KQ.mode, d = KQ.difficulty;
    KQ = newSession(lv, m, d);
    KQ.screen = 'config';
    render();
  };

  /* ────────────────────────────────────────────────────────────
     6. Decorative confetti removed per UI/UX update — kept as a
        safe no-op so existing call sites don't break. Perfect-score
        feedback still shows via the results screen itself.
  ──────────────────────────────────────────────────────────── */
  function confettiBurst() {}
})();
