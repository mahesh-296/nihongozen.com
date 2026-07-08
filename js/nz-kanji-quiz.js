/*==============================================================
  NihongoZen — nz-kanji-quiz.js
  ----------------------------------------------------------------
  Adds a premium "Kanji Quiz" feature INSIDE the existing Kanji
  section. Uses ONLY the design system already defined in
  tokens.css / components.css / layout.css / dashboard.css —
  same colors, same cards, same buttons, same fonts, same dark
  theme that already runs across the app. No new theme, no new
  palette, no separate page.

  DEPENDENCIES (must already be loaded on the page before this file):
    - tokens.css, components.css, layout.css (design system)
    - nz-data.js  (provides `window.kanjiData = { N5:[...], N4:[...], ... }`)

  HOW IT MOUNTS
  ----------------------------------------------------------------
  On DOMContentLoaded this script looks for the existing Kanji
  section using (in order):
    1) document.querySelector('#nz-kanji-quiz-mount')   <- put an empty
       <div id="nz-kanji-quiz-mount"></div> anywhere inside your
       Kanji section's action row for pixel-perfect placement.
    2) document.querySelector('.kanji-section .section-header')
       -> button is appended to the right-side actions area.
    3) document.querySelector('.kanji-section .kanji-tabs')
       -> button is inserted right before the tab row.
    4) document.querySelector('.kanji-section')
       -> button is prepended at the very top of the section.
  If none of these exist, nothing is auto-injected — call
  `NZKanjiQuiz.open()` yourself from any existing button's
  onclick handler instead.
================================================================*/
(function () {
  "use strict";

  /* ============================================================
     0. GUARD / CONFIG
     ============================================================ */
  var QUIZ_LENGTH = 15;
  var LEVELS = ["N5", "N4", "N3", "N2", "N1"];
  var MODES = [
    { id: "meaning_to_kanji", title: "Meaning → Kanji", sub: "See the meaning, pick the kanji" },
    { id: "kanji_to_meaning", title: "Kanji → Meaning", sub: "See the kanji, pick the meaning" },
    { id: "onyomi", title: "Onyomi Reading", sub: "Pick the correct on'yomi" },
    { id: "kunyomi", title: "Kunyomi Reading", sub: "Pick the correct kun'yomi" },
    { id: "mixed", title: "Mixed Quiz", sub: "A bit of everything" },
    { id: "example", title: "Example Sentence", sub: "Match the example usage" },
    { id: "all", title: "All Modes", sub: "The full challenge" }
  ];
  var DIFFICULTIES = ["Easy", "Medium", "Hard", "Adaptive"];
  var RATING_COLOR = { S: "n5", A: "n4", B: "n3", C: "n1" }; // reuse existing JLPT token colors

  var state = {
    cfg: { level: "N5", mode: "mixed", difficulty: "Medium" },
    session: null,
    soundOn: true,
    audioCtx: null,
    progress: loadProgress()
  };

  /* ============================================================
     1. STORAGE (falls back to memory if localStorage is blocked)
     ============================================================ */
  var memStore = {};
  function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return memStore[k] || null; } }
  function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { memStore[k] = v; } }
  function loadProgress() {
    try {
      var raw = storageGet("nz_kanji_quiz_progress");
      return raw ? JSON.parse(raw) : { bestScore: 0, totalXP: 0 };
    } catch (e) { return { bestScore: 0, totalXP: 0 }; }
  }
  function saveProgress() { storageSet("nz_kanji_quiz_progress", JSON.stringify(state.progress)); }

  /* ============================================================
     2. SCOPED STYLE INJECTION
     ----------------------------------------------------------------
     Only layout/animation rules that don't already exist in the
     component library. Every single color below is a var(--token)
     already defined in tokens.css — nothing new is introduced.
     ============================================================ */
  function injectStyles() {
    if (document.getElementById("nz-kanji-quiz-styles")) return;
    var css = ""
      + ".nzq-modal-box{max-width:480px;padding:0;overflow:visible;}"
      + ".nzq-modal-inner{max-height:86vh;overflow-y:auto;padding:22px;}"
      + ".nzq-close-x{position:absolute;top:14px;right:14px;background:var(--card-elevated);border:1px solid var(--border);"
      +   "border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;"
      +   "color:var(--fg-muted);cursor:pointer;transition:all var(--duration-fast);z-index:2;}"
      + ".nzq-close-x:hover{border-color:var(--primary);color:var(--primary);}"
      + ".nzq-screen{display:none;animation:fadeUp 0.35s var(--ease) both;}"
      + ".nzq-screen.active{display:block;}"
      /* launch button */
      + ".nzq-launch-btn{position:relative;}"
      + ".nzq-launch-btn:hover{box-shadow:var(--shadow-glow);}"
      /* mascot */
      + ".nzq-mascot-wrap{display:flex;justify-content:center;margin:4px 0 6px;}"
      + ".nzq-mascot{width:104px;height:112px;animation:nzqFloat 4.2s ease-in-out infinite;filter:drop-shadow(0 14px 18px rgba(0,0,0,0.45));}"
      + "@keyframes nzqFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-8px) rotate(1deg);}}"
      + ".nzq-blink{animation:nzqBlink 4.6s ease-in-out infinite;transform-origin:center;}"
      + "@keyframes nzqBlink{0%,92%,100%{transform:scaleY(1);}95%{transform:scaleY(0.08);}}"
      /* landing text */
      + ".nzq-title{font-family:var(--font-jp);font-size:30px;font-weight:700;text-align:center;color:var(--fg);margin-bottom:8px;}"
      + ".nzq-title .accent{color:var(--primary);}"
      + ".nzq-lead{font-size:13px;line-height:1.65;color:var(--fg-muted);text-align:center;max-width:380px;margin:0 auto 18px;}"
      + ".nzq-lead .hint{color:var(--accent);font-weight:600;}"
      + ".nzq-eyebrow{text-align:center;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);"
      +   "font-family:var(--font-mono);font-weight:700;margin-bottom:8px;}"
      /* level chips (reuse jlpt badge colors) */
      + ".nzq-level-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;}"
      + ".nzq-level-chip{padding:12px 6px;border-radius:var(--radius);text-align:center;cursor:pointer;"
      +   "background:var(--card-elevated);border:1px solid var(--border);transition:all var(--duration-fast) var(--ease);}"
      + ".nzq-level-chip .lv{font-family:var(--font-jp);font-size:16px;font-weight:700;display:block;color:var(--fg);}"
      + ".nzq-level-chip .lvs{font-size:9px;color:var(--fg-muted);font-family:var(--font-mono);}"
      + ".nzq-level-chip.active{border-width:1px;box-shadow:0 6px 16px rgba(0,0,0,0.25);}"
      + ".nzq-level-chip.all{grid-column:1 / -1;}"
      /* mode list (reuse quiz-option) */
      + ".nzq-mode-list{display:flex;flex-direction:column;gap:8px;}"
      + ".nzq-mode-list .quiz-option{flex-direction:column;align-items:flex-start;gap:2px;border-color:var(--border);color:var(--fg);}"
      + ".nzq-mode-list .quiz-option .m-sub{font-size:11px;color:var(--fg-muted);font-weight:400;}"
      + ".nzq-mode-list .quiz-option.selected{border-color:var(--primary);background:var(--primary-dim);}"
      /* game top */
      + ".nzq-game-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}"
      + ".nzq-timer-ring{position:relative;width:64px;height:64px;flex-shrink:0;}"
      + ".nzq-timer-ring svg{width:64px;height:64px;transform:rotate(-90deg);}"
      + ".nzq-timer-ring .bg{stroke:var(--card-elevated);}"
      + ".nzq-timer-ring .fg{stroke:var(--primary);stroke-linecap:round;transition:stroke-dashoffset 1s linear,stroke .3s;}"
      + ".nzq-timer-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"
      +   "font-family:var(--font-mono);font-weight:700;font-size:15px;color:var(--fg);}"
      + ".nzq-hud-pills{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;}"
      + ".nzq-pill{font-size:10.5px;font-weight:600;padding:4px 9px;border-radius:99px;background:var(--card-elevated);"
      +   "border:1px solid var(--border);color:var(--fg-muted);font-family:var(--font-mono);}"
      + ".nzq-pill.xp{color:var(--accent);}"
      + ".nzq-pill.streak{color:var(--primary);}"
      /* flashcard */
      + ".nzq-card-stage{display:flex;justify-content:center;padding:6px 0 14px;perspective:1200px;}"
      + ".nzq-flashcard{width:100%;max-width:280px;aspect-ratio:1/1;border-radius:var(--radius-lg);position:relative;"
      +   "background:linear-gradient(180deg,var(--card-elevated) 0%,var(--card) 100%);border:1px solid var(--border);"
      +   "box-shadow:var(--shadow-lg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;"
      +   "transition:transform .45s var(--ease),opacity .3s;}"
      + ".nzq-flashcard.pop-in{animation:slideUp .4s var(--ease);}"
      + ".nzq-flashcard.swipe-right{transform:translateX(130%) rotate(14deg);opacity:0;}"
      + ".nzq-flashcard.swipe-left{transform:translateX(-130%) rotate(-14deg);opacity:0;}"
      + ".nzq-card-badge{position:absolute;top:12px;left:12px;font-size:10px;font-weight:700;font-family:var(--font-mono);"
      +   "padding:3px 8px;border-radius:99px;}"
      + ".nzq-card-mode-badge{position:absolute;top:12px;right:12px;font-size:9.5px;color:var(--fg-subtle);font-family:var(--font-mono);}"
      + ".nzq-card-label{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-muted);font-weight:600;}"
      + ".nzq-card-kanji{font-family:var(--font-jp);font-size:64px;line-height:1;font-weight:700;color:var(--fg);}"
      + ".nzq-card-meaning{font-family:var(--font-jp-sans);font-size:19px;font-weight:700;text-align:center;padding:0 16px;color:var(--fg);}"
      + ".nzq-hint-btn{font-size:11px;color:var(--accent);background:none;border:1px solid var(--accent-dim);padding:5px 12px;"
      +   "border-radius:99px;cursor:pointer;}"
      + ".nzq-hint-text{font-size:11px;color:var(--fg-muted);min-height:14px;font-family:var(--font-mono);}"
      /* options */
      + ".nzq-options-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}"
      + ".nzq-options-grid .quiz-option{justify-content:center;text-align:center;font-family:var(--font-jp-sans);"
      +   "font-weight:600;font-size:14px;flex-direction:column;gap:2px;border-color:var(--border);color:var(--fg);}"
      + ".nzq-options-grid .quiz-option .kbd{font-size:9px;color:var(--fg-subtle);font-family:var(--font-mono);font-weight:400;}"
      + ".nzq-options-grid .quiz-option.correct{border-color:var(--n5);background:var(--n5-dim);animation:nzqPop .4s var(--ease);}"
      + ".nzq-options-grid .quiz-option.incorrect{border-color:var(--n1);background:var(--n1-dim);animation:nzqShake .4s;}"
      + "@keyframes nzqPop{0%{transform:scale(1);}50%{transform:scale(1.05);}100%{transform:scale(1);}}"
      + "@keyframes nzqShake{0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);}}"
      /* combo toast */
      + ".nzq-combo{position:fixed;top:16%;left:50%;transform:translate(-50%,-6px);z-index:260;pointer-events:none;"
      +   "font-family:var(--font-jp);font-weight:700;font-size:22px;color:var(--accent);opacity:0;"
      +   "text-shadow:0 4px 18px rgba(255,180,84,.5);}"
      + ".nzq-combo.show{animation:nzqComboPop .9s var(--ease);}"
      + "@keyframes nzqComboPop{0%{opacity:0;transform:translate(-50%,10px) scale(.7);}"
      +   "25%{opacity:1;transform:translate(-50%,-6px) scale(1.08);}70%{opacity:1;transform:translate(-50%,-10px) scale(1);}"
      +   "100%{opacity:0;transform:translate(-50%,-24px) scale(1);}}"
      /* results */
      + ".nzq-rating-ring{width:96px;height:96px;margin:6px auto 4px;border-radius:50%;display:flex;align-items:center;"
      +   "justify-content:center;font-family:var(--font-jp);font-size:44px;font-weight:800;color:#fff;position:relative;}"
      + ".nzq-rating-ring::before{content:'';position:absolute;inset:5px;border-radius:50%;background:var(--card);}"
      + ".nzq-rating-ring span{position:relative;z-index:1;}"
      + ".nzq-review-list{display:flex;flex-direction:column;gap:7px;max-height:170px;overflow-y:auto;padding-right:2px;}"
      + ".nzq-review-item{display:flex;align-items:center;gap:10px;}"
      + ".nzq-review-item .rk{font-family:var(--font-jp);font-size:22px;color:var(--primary);width:32px;text-align:center;flex-shrink:0;}"
      + ".nzq-review-item .rm{font-size:11.5px;color:var(--fg-muted);}"
      + ".nzq-review-item .rm strong{color:var(--fg);}"
      /* confetti */
      + ".nzq-confetti{position:fixed;top:-10px;z-index:300;border-radius:2px;pointer-events:none;animation:nzqFall linear forwards;}"
      + "@keyframes nzqFall{to{transform:translateY(110vh) rotate(540deg);opacity:.2;}}"
      + ".nzq-actions{display:flex;flex-direction:column;gap:8px;margin-top:18px;}"
      + ".nzq-divider{height:1px;background:var(--border);margin:16px 0;}"
      + "@media (prefers-reduced-motion:reduce){.nzq-mascot,.nzq-flashcard,.nzq-combo{animation:none !important;}}";
    var style = document.createElement("style");
    style.id = "nz-kanji-quiz-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ============================================================
     3. TOAST (reuse existing #toast-container / .toast system;
        create the container only if the page doesn't have one yet)
     ============================================================ */
  function toast(msg, type) {
    var container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "info");
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .25s";
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 250);
    }, 2200);
  }

  /* ============================================================
     4. AUDIO (WebAudio synth — no external sound files needed)
     ============================================================ */
  function ensureAudio() {
    if (!state.audioCtx) {
      try { state.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
  }
  function beep(freq, dur, type) {
    if (!state.soundOn) return;
    ensureAudio();
    var ctx = state.audioCtx;
    if (!ctx) return;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.13, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  }
  function sfxCorrect() { beep(880, 0.12, "triangle"); setTimeout(function () { beep(1180, 0.16, "triangle"); }, 90); }
  function sfxIncorrect() { beep(180, 0.28, "sawtooth"); }
  function sfxTimeout() { beep(260, 0.22, "sine"); }
  function sfxTick() { beep(1500, 0.03, "square"); }

  /* ============================================================
     5. DATA HELPERS (reads from window.kanjiData — nz-data.js)
     ============================================================ */
  function getKanjiData() { return window.kanjiData || null; }
  function poolForLevel(level) {
    var kd = getKanjiData();
    if (!kd) return [];
    if (level === "ALL") {
      var all = [];
      LEVELS.forEach(function (l) { if (kd[l]) all = all.concat(kd[l]); });
      return all;
    }
    return kd[level] || [];
  }
  function readingOk(item, field) { return item[field] && item[field].trim().length > 0; }

  function pickModeForQuestion(modeCfg) {
    if (modeCfg === "mixed" || modeCfg === "all") {
      var pool = ["meaning_to_kanji", "kanji_to_meaning", "onyomi", "kunyomi"];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return modeCfg;
  }

  function buildQuestion(pool, modeCfg) {
    var mode = pickModeForQuestion(modeCfg);
    var filtered = pool;
    if (mode === "onyomi") filtered = pool.filter(function (k) { return readingOk(k, "on"); });
    if (mode === "kunyomi") filtered = pool.filter(function (k) { return readingOk(k, "kun"); });
    if (mode === "example") filtered = pool.filter(function (k) { return k.example; });
    if (filtered.length < 4) { filtered = pool; if (mode === "onyomi" || mode === "kunyomi" || mode === "example") mode = "kanji_to_meaning"; }

    var correct = filtered[Math.floor(Math.random() * filtered.length)];
    var distractors = [], usedIds = {}; usedIds[correct.id] = true;
    var guard = 0;
    while (distractors.length < 3 && guard < 300) {
      guard++;
      var cand = pool[Math.floor(Math.random() * pool.length)];
      if (usedIds[cand.id]) continue;
      if (mode === "onyomi" && !readingOk(cand, "on")) continue;
      if (mode === "kunyomi" && !readingOk(cand, "kun")) continue;
      usedIds[cand.id] = true;
      distractors.push(cand);
    }
    while (distractors.length < 3) distractors.push(correct);

    var promptLabel, isKanjiPrompt, optionKey, cardMode, promptContent;
    switch (mode) {
      case "meaning_to_kanji":
        promptLabel = "Which kanji means this?"; isKanjiPrompt = false; optionKey = "kanji"; cardMode = "Meaning→Kanji";
        promptContent = correct.meaning; break;
      case "onyomi":
        promptLabel = "Select the correct Onyomi"; isKanjiPrompt = true; optionKey = "on"; cardMode = "Onyomi";
        promptContent = correct.kanji; break;
      case "kunyomi":
        promptLabel = "Select the correct Kunyomi"; isKanjiPrompt = true; optionKey = "kun"; cardMode = "Kunyomi";
        promptContent = correct.kanji; break;
      case "example":
        promptLabel = "Which example uses this kanji?"; isKanjiPrompt = true; optionKey = "example"; cardMode = "Example";
        promptContent = correct.kanji; break;
      default: // kanji_to_meaning
        promptLabel = "What does this kanji mean?"; isKanjiPrompt = true; optionKey = "meaning"; cardMode = "Kanji→Meaning";
        promptContent = correct.kanji;
    }

    var options = [correct].concat(distractors).map(function (k) {
      return { id: k.id, label: k[optionKey] || k.meaning, isCorrect: k.id === correct.id };
    });
    for (var i = options.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = options[i]; options[i] = options[j]; options[j] = tmp;
    }
    return { item: correct, mode: mode, cardMode: cardMode, promptLabel: promptLabel, promptContent: promptContent, isKanjiPrompt: isKanjiPrompt, options: options };
  }

  function difficultyTimer(diff) {
    if (diff === "Easy") return 90;
    if (diff === "Hard") return 30;
    return 60; // Medium + Adaptive base
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ============================================================
     6. MODAL SHELL (reuses .modal-overlay / .modal-box exactly)
     ============================================================ */
  var modalEl = null;

  function buildModalShell() {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "nzqOverlay";
    overlay.innerHTML =
      '<div class="modal-box nzq-modal-box">' +
        '<button class="nzq-close-x" id="nzqCloseBtn" aria-label="Close">✕</button>' +
        '<div class="nzq-modal-inner">' +
          screenLanding() +
          screenConfig() +
          screenGame() +
          screenResults() +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.getElementById("nzqCloseBtn").addEventListener("click", closeModal);
    return overlay;
  }

  function closeModal() {
    if (state.session && state.session.timerId) clearInterval(state.session.timerId);
    if (modalEl) { modalEl.remove(); modalEl = null; }
  }

  function showNzqScreen(id) {
    var all = modalEl.querySelectorAll(".nzq-screen");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("active");
    modalEl.querySelector("#" + id).classList.add("active");
    modalEl.querySelector(".nzq-modal-inner").scrollTop = 0;
  }

  /* ---------- Mascot (Daruma) — reuses brand gradient colors ---------- */
  function mascotSvg() {
    return '' +
      '<div class="nzq-mascot-wrap"><div class="nzq-mascot"><svg viewBox="0 0 140 150">' +
      '<defs><linearGradient id="nzqBrand" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="var(--primary)"/><stop offset="100%" stop-color="#7C4DD8"/></linearGradient></defs>' +
      '<ellipse cx="70" cy="98" rx="58" ry="48" fill="url(#nzqBrand)"/>' +
      '<ellipse cx="70" cy="112" rx="34" ry="26" fill="#F2F2F8"/>' +
      '<circle cx="52" cy="94" r="6" fill="#22222E" class="nzq-blink"/>' +
      '<circle cx="88" cy="94" r="6" fill="#22222E" class="nzq-blink"/>' +
      '<path d="M46 116 Q70 130 94 116" stroke="#22222E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M40 84 Q70 66 100 84" stroke="var(--accent)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<text x="70" y="76" text-anchor="middle" font-size="15" fill="var(--accent)" font-family="serif" font-weight="700">福</text>' +
      '</svg></div></div>';
  }

  /* ---------- Screen 1: Landing ---------- */
  function screenLanding() {
    return '' +
      '<section class="nzq-screen active" id="nzqLanding">' +
        mascotSvg() +
        '<div class="nzq-eyebrow">New Feature</div>' +
        '<h2 class="nzq-title">Kanji <span class="accent">Quiz</span></h2>' +
        '<p class="nzq-lead">Master Japanese Kanji through a fun and interactive quiz experience! Practice meanings, readings, and recognition while earning XP and improving your memory. ' +
        '<span class="hint">New to Kanji? Visit the Study section first before starting the quiz.</span></p>' +
        '<button class="btn btn-primary w-full nzq-launch-btn" id="nzqPlayNowBtn" style="width:100%;padding:13px;font-size:14px;">▶&nbsp; PLAY NOW</button>' +
        '<div class="nzq-divider"></div>' +
        '<div class="section-header"><span class="section-title">Your Progress</span></div>' +
        '<div class="grid-2">' +
          '<div class="stat-card"><div class="stat-value" id="nzqLsBest">—</div><div class="stat-label">Best Score</div></div>' +
          '<div class="stat-card"><div class="stat-value" id="nzqLsXP">0</div><div class="stat-label">Total XP</div></div>' +
        '</div>' +
      '</section>';
  }

  /* ---------- Screen 2: Config ---------- */
  function screenConfig() {
    var levelChips = LEVELS.map(function (l) {
      return '<div class="nzq-level-chip" data-level="' + l + '" style="border-color:var(--' + l.toLowerCase() + ');">' +
        '<span class="lv" style="color:var(--' + l.toLowerCase() + ');">' + l + '</span><span class="lvs">JLPT</span></div>';
    }).join("");

    var modeItems = MODES.map(function (m) {
      return '<button class="quiz-option" data-mode="' + m.id + '">' +
        '<span><strong>' + m.title + '</strong><span class="m-sub" style="display:block;">' + m.sub + '</span></span></button>';
    }).join("");

    var diffTabs = DIFFICULTIES.map(function (d) {
      return '<button class="tab-btn" data-diff="' + d + '">' + d + '</button>';
    }).join("");

    return '' +
      '<section class="nzq-screen" id="nzqConfig">' +
        '<div class="section-header"><span class="section-title">Set Up Your Quiz</span>' +
        '<button class="btn-icon" id="nzqMenuBtn" title="Menu">☰</button></div>' +
        '<div class="section-hint" style="margin-bottom:14px;">Choose a level, mode, and difficulty</div>' +

        '<div class="section-header"><span class="section-title" style="font-size:12px;">JLPT Level</span></div>' +
        '<div class="nzq-level-grid" id="nzqLevelGrid">' + levelChips +
          '<div class="nzq-level-chip all" data-level="ALL" style="border-color:var(--border);">' +
          '<span class="lv" style="color:var(--fg);">All Levels</span><span class="lvs">Full Mix</span></div>' +
        '</div>' +

        '<div class="section-header" style="margin-top:16px;"><span class="section-title" style="font-size:12px;">Quiz Mode</span></div>' +
        '<div class="nzq-mode-list" id="nzqModeList">' + modeItems + '</div>' +

        '<div class="section-header" style="margin-top:16px;"><span class="section-title" style="font-size:12px;">Difficulty</span></div>' +
        '<div class="tabs" id="nzqDiffTabs">' + diffTabs + '</div>' +

        '<div class="nzq-actions">' +
          '<button class="btn btn-primary nzq-launch-btn" id="nzqStartBtn" style="width:100%;padding:13px;">START</button>' +
          '<button class="btn btn-ghost" id="nzqBackToLandingBtn" style="width:100%;">← Back</button>' +
        '</div>' +

        '<div class="user-dropdown" id="nzqMenuDropdown" style="display:none;top:44px;right:0;">' +
          '<div class="user-dropdown-item" data-action="play">▶ Play Now</div>' +
          '<div class="user-dropdown-item" data-action="leaderboard">🏆 Leaderboard <span class="badge badge-primary" style="margin-left:auto;">soon</span></div>' +
          '<div class="user-dropdown-item" data-action="study">📖 Study</div>' +
          '<div class="user-dropdown-item" data-action="daily">🔥 Daily Challenge <span class="badge badge-primary" style="margin-left:auto;">soon</span></div>' +
          '<div class="user-dropdown-item" data-action="achievements">🎖 Achievements <span class="badge badge-primary" style="margin-left:auto;">soon</span></div>' +
          '<div class="divider"></div>' +
          '<div class="user-dropdown-item" data-action="sound">🔊 Sound <span style="margin-left:auto;" id="nzqSoundTag">ON</span></div>' +
          '<div class="user-dropdown-item" data-action="settings">⚙ Settings</div>' +
          '<div class="user-dropdown-item" data-action="about">ℹ About</div>' +
        '</div>' +
      '</section>';
  }

  /* ---------- Screen 3: Gameplay ---------- */
  function screenGame() {
    return '' +
      '<section class="nzq-screen" id="nzqGame">' +
        '<div class="nzq-game-top">' +
          '<div class="nzq-timer-ring">' +
            '<svg><circle class="bg" cx="32" cy="32" r="27" fill="none" stroke-width="5"></circle>' +
            '<circle class="fg" id="nzqTimerRing" cx="32" cy="32" r="27" fill="none" stroke-width="5" stroke-dasharray="169.6"></circle></svg>' +
            '<div class="nzq-timer-num" id="nzqTimerNum">60</div>' +
          '</div>' +
          '<div class="nzq-hud-pills">' +
            '<span class="nzq-pill xp">✦ <span id="nzqStatXP">0</span> XP</span>' +
            '<span class="nzq-pill streak">🔥 <span id="nzqStatStreak">0</span></span>' +
            '<span class="nzq-pill">✓<span id="nzqStatCorrect">0</span> ✕<span id="nzqStatIncorrect">0</span></span>' +
          '</div>' +
        '</div>' +
        '<div class="progress-track" style="margin-bottom:14px;"><div class="progress-fill" id="nzqProgressFill" style="width:0%;background:var(--gradient-brand);"></div></div>' +

        '<div class="nzq-card-stage">' +
          '<div class="nzq-flashcard pop-in" id="nzqFlashcard">' +
            '<span class="nzq-card-badge" id="nzqCardLevelBadge">N5</span>' +
            '<span class="nzq-card-mode-badge" id="nzqCardModeBadge">Kanji→Meaning</span>' +
            '<span class="nzq-card-label" id="nzqCardPromptLabel">What does this kanji mean?</span>' +
            '<div class="nzq-card-kanji" id="nzqCardKanji">人</div>' +
            '<button class="nzq-hint-btn" id="nzqHintBtn">💡 Hint</button>' +
            '<div class="nzq-hint-text" id="nzqHintText"></div>' +
          '</div>' +
        '</div>' +
        '<div class="nzq-options-grid" id="nzqOptionsGrid"></div>' +
      '</section>';
  }

  /* ---------- Screen 4: Results ---------- */
  function screenResults() {
    return '' +
      '<section class="nzq-screen" id="nzqResults">' +
        '<div class="section-header"><span class="section-title">Quiz Complete!</span></div>' +
        '<div class="nzq-rating-ring" id="nzqRatingRing"><span id="nzqRatingLetter">A</span></div>' +
        '<p class="text-center text-muted text-sm" id="nzqRatingCaption" style="margin-bottom:14px;">Great work!</p>' +

        '<div class="profile-stats-grid" style="grid-template-columns:repeat(3,1fr);">' +
          '<div class="profile-stat-card"><div class="profile-stat-val" id="nzqResScore">0</div><div class="profile-stat-lbl">Score</div></div>' +
          '<div class="profile-stat-card"><div class="profile-stat-val" id="nzqResAccuracy">0%</div><div class="profile-stat-lbl">Accuracy</div></div>' +
          '<div class="profile-stat-card"><div class="profile-stat-val" id="nzqResXP">0</div><div class="profile-stat-lbl">XP Earned</div></div>' +
          '<div class="profile-stat-card"><div class="profile-stat-val" id="nzqResStreak">0</div><div class="profile-stat-lbl">Best Streak</div></div>' +
          '<div class="profile-stat-card"><div class="profile-stat-val" id="nzqResTime">0s</div><div class="profile-stat-lbl">Time Taken</div></div>' +
          '<div class="profile-stat-card"><div class="profile-stat-val" id="nzqResLevel">N5</div><div class="profile-stat-lbl">Level</div></div>' +
        '</div>' +

        '<div class="section-header" style="margin-top:16px;"><span class="section-title" style="font-size:12px;">Review — Kanji to Practice</span></div>' +
        '<div class="nzq-review-list" id="nzqReviewList"></div>' +

        '<div class="nzq-actions">' +
          '<button class="btn btn-primary" id="nzqPlayAgainBtn" style="width:100%;">Play Again</button>' +
          '<button class="btn btn-secondary" id="nzqContinueBtn" style="width:100%;">Continue Learning</button>' +
          '<button class="btn btn-ghost" id="nzqBackToStudyBtn" style="width:100%;">Back to Kanji Study</button>' +
        '</div>' +
      '</section>';
  }

  /* ============================================================
     7. CONFIG SCREEN WIRING
     ============================================================ */
  function wireConfigScreen() {
    var levelGrid = modalEl.querySelector("#nzqLevelGrid");
    levelGrid.querySelectorAll(".nzq-level-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        levelGrid.querySelectorAll(".nzq-level-chip").forEach(function (c) { c.classList.remove("active"); c.style.background = "var(--card-elevated)"; });
        chip.classList.add("active");
        chip.style.background = "var(--card)";
        state.cfg.level = chip.dataset.level;
      });
    });
    levelGrid.querySelector('[data-level="' + state.cfg.level + '"]').click();

    var modeList = modalEl.querySelector("#nzqModeList");
    modeList.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        modeList.querySelectorAll(".quiz-option").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        state.cfg.mode = btn.dataset.mode;
      });
    });
    modeList.querySelector('[data-mode="mixed"]').click();

    var diffTabs = modalEl.querySelector("#nzqDiffTabs");
    diffTabs.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        diffTabs.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state.cfg.difficulty = btn.dataset.diff;
      });
    });
    diffTabs.querySelector('[data-diff="Medium"]').classList.add("active");

    modalEl.querySelector("#nzqBackToLandingBtn").addEventListener("click", function () { showNzqScreen("nzqLanding"); });
    modalEl.querySelector("#nzqStartBtn").addEventListener("click", startQuiz);

    var menuBtn = modalEl.querySelector("#nzqMenuBtn");
    var menuDropdown = modalEl.querySelector("#nzqMenuDropdown");
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      menuDropdown.style.display = menuDropdown.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", function () { if (menuDropdown) menuDropdown.style.display = "none"; });
    menuDropdown.querySelectorAll(".user-dropdown-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        var action = item.dataset.action;
        menuDropdown.style.display = "none";
        if (action === "play") { /* already on config */ }
        else if (action === "study") { toast("Returning to Kanji Study…", "info"); closeModal(); }
        else if (action === "sound") {
          state.soundOn = !state.soundOn;
          modalEl.querySelector("#nzqSoundTag").textContent = state.soundOn ? "ON" : "OFF";
          toast("Sound " + (state.soundOn ? "enabled" : "disabled"), "info");
        }
        else toast("Coming soon!", "info");
      });
    });
  }

  /* ============================================================
     8. QUIZ ENGINE
     ============================================================ */
  function startQuiz() {
    var pool = poolForLevel(state.cfg.level);
    if (pool.length < 4) { toast("Not enough kanji data for this level.", "error"); return; }
    var questions = [];
    for (var i = 0; i < QUIZ_LENGTH; i++) questions.push(buildQuestion(pool, state.cfg.mode));

    state.session = {
      pool: pool, questions: questions, index: 0,
      correct: 0, incorrect: 0, skipped: 0,
      xp: 0, streak: 0, bestStreak: 0, combo: 1,
      startedAt: Date.now(),
      baseTimer: difficultyTimer(state.cfg.difficulty),
      timeLeft: difficultyTimer(state.cfg.difficulty),
      timerId: null, wrongItems: [], locked: false
    };
    showNzqScreen("nzqGame");
    renderQuestion();
  }

  function renderQuestion() {
    var session = state.session;
    var q = session.questions[session.index];
    session.locked = false;
    session.timeLeft = adaptiveTimer();

    modalEl.querySelector("#nzqCardLevelBadge").textContent = q.item.id.split("-")[1];
    var lvlKey = q.item.id.split("-")[1].toLowerCase();
    var badgeEl = modalEl.querySelector("#nzqCardLevelBadge");
    badgeEl.style.color = "var(--" + lvlKey + ")";
    badgeEl.style.background = "var(--" + lvlKey + "-dim)";
    modalEl.querySelector("#nzqCardModeBadge").textContent = q.cardMode;
    modalEl.querySelector("#nzqCardPromptLabel").textContent = q.promptLabel;
    modalEl.querySelector("#nzqHintText").textContent = "";

    var kanjiEl = modalEl.querySelector("#nzqCardKanji");
    var flashcard = modalEl.querySelector("#nzqFlashcard");
    var existingMeaningEl = modalEl.querySelector("#nzqCardMeaningPrompt");

    if (q.isKanjiPrompt) {
      kanjiEl.style.display = "block";
      kanjiEl.textContent = q.promptContent;
      if (existingMeaningEl) existingMeaningEl.style.display = "none";
    } else {
      kanjiEl.style.display = "none";
      if (!existingMeaningEl) {
        existingMeaningEl = document.createElement("div");
        existingMeaningEl.id = "nzqCardMeaningPrompt";
        existingMeaningEl.className = "nzq-card-meaning";
        flashcard.insertBefore(existingMeaningEl, modalEl.querySelector("#nzqHintBtn"));
      }
      existingMeaningEl.style.display = "block";
      existingMeaningEl.textContent = q.promptContent;
    }

    flashcard.classList.remove("swipe-left", "swipe-right", "pop-in");
    void flashcard.offsetWidth;
    flashcard.classList.add("pop-in");

    var grid = modalEl.querySelector("#nzqOptionsGrid");
    grid.innerHTML = q.options.map(function (o, i) {
      return '<button class="quiz-option" data-idx="' + i + '">' + escapeHtml(o.label) + '<span class="kbd">Press ' + (i + 1) + '</span></button>';
    }).join("");
    grid.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () { handleAnswer(parseInt(btn.dataset.idx, 10)); });
    });

    updateHUD();
    startTimer();
  }

  function adaptiveTimer() {
    var session = state.session;
    if (state.cfg.difficulty !== "Adaptive") return session.baseTimer;
    var extra = Math.min(session.streak * 2, 20);
    return Math.max(20, 60 - extra);
  }

  function startTimer() {
    var session = state.session;
    clearInterval(session.timerId);
    var total = session.timeLeft;
    var ring = modalEl.querySelector("#nzqTimerRing");
    var circumference = 2 * Math.PI * 27;
    ring.setAttribute("stroke-dasharray", circumference.toFixed(1));
    updateTimerVisual(total, total);
    session.timerId = setInterval(function () {
      session.timeLeft -= 1;
      updateTimerVisual(session.timeLeft, total);
      if (session.timeLeft <= 5 && session.timeLeft > 0) sfxTick();
      if (session.timeLeft <= 0) { clearInterval(session.timerId); onTimeout(); }
    }, 1000);
  }
  function updateTimerVisual(left, total) {
    modalEl.querySelector("#nzqTimerNum").textContent = Math.max(0, left);
    var ring = modalEl.querySelector("#nzqTimerRing");
    var circumference = 2 * Math.PI * 27;
    var ratio = Math.max(0, left / total);
    ring.style.strokeDashoffset = (circumference * (1 - ratio)).toFixed(1);
    ring.style.stroke = ratio < 0.25 ? "var(--n1)" : (ratio < 0.55 ? "var(--accent)" : "var(--n5)");
  }

  function updateHUD() {
    var s = state.session;
    modalEl.querySelector("#nzqStatXP").textContent = s.xp;
    modalEl.querySelector("#nzqStatStreak").textContent = s.streak;
    modalEl.querySelector("#nzqStatCorrect").textContent = s.correct;
    modalEl.querySelector("#nzqStatIncorrect").textContent = s.incorrect;
    modalEl.querySelector("#nzqProgressFill").style.width = (s.index / s.questions.length * 100).toFixed(0) + "%";
  }

  function handleAnswer(idx) {
    var session = state.session;
    if (session.locked) return;
    session.locked = true;
    clearInterval(session.timerId);
    var q = session.questions[session.index];
    var btns = modalEl.querySelectorAll("#nzqOptionsGrid .quiz-option");
    var chosen = q.options[idx];

    btns.forEach(function (b, i) { if (q.options[i].isCorrect) b.classList.add("correct"); });

    if (chosen.isCorrect) {
      session.correct++;
      session.streak++;
      session.bestStreak = Math.max(session.bestStreak, session.streak);
      session.combo = 1 + Math.floor(session.streak / 3) * 0.5;
      var gained = Math.round(10 * session.combo);
      session.xp += gained;
      sfxCorrect();
      modalEl.querySelector("#nzqFlashcard").classList.add("swipe-right");
      if (session.streak > 0 && session.streak % 3 === 0) showCombo("Combo x" + session.combo.toFixed(1) + "!");
    } else {
      btns[idx].classList.add("incorrect");
      session.incorrect++;
      session.streak = 0;
      session.combo = 1;
      session.wrongItems.push(q.item);
      sfxIncorrect();
      modalEl.querySelector("#nzqFlashcard").classList.add("swipe-left");
    }
    updateHUD();
    setTimeout(nextQuestion, 900);
  }

  function onTimeout() {
    var session = state.session;
    if (session.locked) return;
    session.locked = true;
    var q = session.questions[session.index];
    session.skipped++;
    session.streak = 0;
    session.wrongItems.push(q.item);
    sfxTimeout();
    var btns = modalEl.querySelectorAll("#nzqOptionsGrid .quiz-option");
    btns.forEach(function (b, i) { if (q.options[i].isCorrect) b.classList.add("correct"); });
    modalEl.querySelector("#nzqFlashcard").classList.add("swipe-left");
    updateHUD();
    setTimeout(nextQuestion, 900);
  }

  function showCombo(text) {
    var el = modalEl.querySelector("#nzqComboToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "nzqComboToast";
      el.className = "nzq-combo";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }

  function nextQuestion() {
    var session = state.session;
    session.index++;
    if (session.index >= session.questions.length) { finishQuiz(); return; }
    renderQuestion();
  }

  /* ============================================================
     9. RESULTS
     ============================================================ */
  function finishQuiz() {
    var session = state.session;
    var total = session.correct + session.incorrect + session.skipped;
    var accuracy = total > 0 ? Math.round((session.correct / total) * 100) : 0;
    var timeTaken = Math.round((Date.now() - session.startedAt) / 1000);
    var rating = "C";
    if (accuracy >= 90) rating = "S"; else if (accuracy >= 75) rating = "A"; else if (accuracy >= 50) rating = "B";
    var colorToken = RATING_COLOR[rating];

    state.progress.totalXP = (state.progress.totalXP || 0) + session.xp;
    state.progress.bestScore = Math.max(state.progress.bestScore || 0, session.xp);
    saveProgress();

    modalEl.querySelector("#nzqResScore").textContent = session.xp;
    modalEl.querySelector("#nzqResAccuracy").textContent = accuracy + "%";
    modalEl.querySelector("#nzqResXP").textContent = "+" + session.xp;
    modalEl.querySelector("#nzqResStreak").textContent = session.bestStreak;
    modalEl.querySelector("#nzqResTime").textContent = timeTaken + "s";
    modalEl.querySelector("#nzqResLevel").textContent = state.cfg.level;
    modalEl.querySelector("#nzqRatingLetter").textContent = rating;
    var ring = modalEl.querySelector("#nzqRatingRing");
    ring.style.background = "var(--" + colorToken + ")";
    modalEl.querySelector("#nzqRatingLetter").style.color = "var(--" + colorToken + ")";
    modalEl.querySelector("#nzqRatingCaption").textContent = {
      S: "Outstanding mastery!", A: "Great work!", B: "Solid effort — keep practicing.", C: "Keep going, you'll get there!"
    }[rating];

    var uniqueWrong = [], seen = {};
    session.wrongItems.forEach(function (it) { if (!seen[it.id]) { seen[it.id] = true; uniqueWrong.push(it); } });
    var reviewList = modalEl.querySelector("#nzqReviewList");
    reviewList.innerHTML = uniqueWrong.length ? uniqueWrong.slice(0, 10).map(function (it) {
      return '<div class="nzq-review-item"><div class="rk">' + it.kanji + '</div>' +
        '<div class="rm"><strong>' + it.meaning + '</strong><br>on: ' + (it.on || "—") + ' ・ kun: ' + (it.kun || "—") + '</div></div>';
    }).join("") : '<div class="nzq-review-item"><div class="rm">Perfect run — nothing to review! 🎉</div></div>';

    showNzqScreen("nzqResults");
    if (rating === "S" || rating === "A") launchConfetti();

    modalEl.querySelector("#nzqLsBest").textContent = state.progress.bestScore;
    modalEl.querySelector("#nzqLsXP").textContent = state.progress.totalXP;
  }

  function launchConfetti() {
    var colors = ["var(--primary)", "var(--accent)", "var(--n5)", "var(--n2)"];
    for (var i = 0; i < 34; i++) {
      (function () {
        var p = document.createElement("div");
        p.className = "nzq-confetti";
        var size = 6 + Math.random() * 6;
        p.style.width = size + "px";
        p.style.height = (size * 0.4) + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (2.2 + Math.random() * 1.6) + "s";
        p.style.animationDelay = (Math.random() * 0.4) + "s";
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, 4200);
      })();
    }
  }

  /* ============================================================
     10. RESULTS SCREEN WIRING + HINT + KEYBOARD
     ============================================================ */
  function wireResultsScreen() {
    modalEl.querySelector("#nzqPlayAgainBtn").addEventListener("click", function () { showNzqScreen("nzqConfig"); });
    modalEl.querySelector("#nzqContinueBtn").addEventListener("click", function () { showNzqScreen("nzqLanding"); });
    modalEl.querySelector("#nzqBackToStudyBtn").addEventListener("click", function () { toast("Returning to Kanji Study…", "info"); closeModal(); });
  }

  function wireGameScreen() {
    modalEl.querySelector("#nzqHintBtn").addEventListener("click", function () {
      var session = state.session;
      if (!session) return;
      var q = session.questions[session.index];
      var item = q.item;
      var hint = q.mode === "onyomi" ? "Kunyomi: " + (item.kun || "—")
        : q.mode === "kunyomi" ? "Onyomi: " + (item.on || "—")
        : "Reading: " + (item.reading || "—");
      modalEl.querySelector("#nzqHintText").textContent = hint;
    });

    document.addEventListener("keydown", function (e) {
      if (!state.session || !modalEl) return;
      var gameScreen = modalEl.querySelector("#nzqGame");
      if (!gameScreen || !gameScreen.classList.contains("active")) return;
      if (["1", "2", "3", "4"].indexOf(e.key) !== -1) {
        var idx = parseInt(e.key, 10) - 1;
        var btns = modalEl.querySelectorAll("#nzqOptionsGrid .quiz-option");
        if (btns[idx]) handleAnswer(idx);
      }
    });
  }

  /* ============================================================
     11. PUBLIC API — open() builds & wires the whole modal
     ============================================================ */
  function open() {
    if (!getKanjiData()) {
      toast("Kanji data not loaded — make sure nz-data.js is included before nz-kanji-quiz.js.", "error");
      return;
    }
    injectStyles();
    if (modalEl) modalEl.remove();
    modalEl = buildModalShell();
    wireConfigScreen();
    wireGameScreen();
    wireResultsScreen();
    modalEl.querySelector("#nzqPlayNowBtn").addEventListener("click", function () { showNzqScreen("nzqConfig"); });
    modalEl.querySelector("#nzqLsBest").textContent = state.progress.bestScore || "—";
    modalEl.querySelector("#nzqLsXP").textContent = state.progress.totalXP || 0;
  }

  /* ============================================================
     12. AUTO-MOUNT — inject a "Kanji Quiz" launch button into
         the existing Kanji section without touching its markup
     ============================================================ */
  function buildLaunchButton() {
    var btn = document.createElement("button");
    btn.className = "btn btn-primary nzq-launch-btn";
    btn.id = "nzKanjiQuizLaunchBtn";
    btn.innerHTML = "🎮&nbsp; Kanji Quiz";
    btn.addEventListener("click", open);
    return btn;
  }

  function autoMount() {
    injectStyles();

    var explicitMount = document.querySelector("#nz-kanji-quiz-mount");
    if (explicitMount) { explicitMount.appendChild(buildLaunchButton()); return; }

    var section = document.querySelector(".kanji-section") || document.querySelector("#kanji-section");
    if (!section) return; // Kanji section not on this page — nothing to mount

    var header = section.querySelector(".section-header");
    if (header) {
      var actionsWrap = header.querySelector(".flex, .gap-2, .gap-3");
      if (actionsWrap) actionsWrap.appendChild(buildLaunchButton());
      else header.appendChild(buildLaunchButton());
      return;
    }

    var tabs = section.querySelector(".kanji-tabs");
    if (tabs && tabs.parentNode) {
      var wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:10px;";
      wrap.appendChild(buildLaunchButton());
      tabs.parentNode.insertBefore(wrap, tabs);
      return;
    }

    var wrap2 = document.createElement("div");
    wrap2.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:10px;";
    wrap2.appendChild(buildLaunchButton());
    section.insertBefore(wrap2, section.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }

  /* Expose a small public API for manual wiring */
  window.NZKanjiQuiz = { open: open, close: closeModal };

})();
