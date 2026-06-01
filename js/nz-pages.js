'use strict';
/* ================================================================
   NihongoZen — nz-pages.js
   Full SPA renderer: Shell, Router, all Pages.
   
   Loaded after (in order):
     js/core.js          — project core (State, etc.)
     nz-data.js          — kanjiData, grammarPoints, VocabPageWords,
                           VocabPageCategories, dialogues, passages
     nz-kana.js          — kanaChart IIFE + window._nzKanaInit
     nz-vocab-module.js  — VocabPage IIFE (mount/cleanup)
     js/pomodoro.js      — pomodoro helpers
   
   Provides to index.html:
     window.renderShell   — called once by _nzBootstrap
     window.Router        — Router.register / Router.go
     window.Pages         — all page functions
     window.speak         — global TTS helper
================================================================ */

/* ────────────────────────────────────────────────────────────────
   UTILITIES
──────────────────────────────────────────────────────────────── */
function H(s) {
  /* HTML-escape to prevent XSS */
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jlptColor(lv) {
  return { N5: 'var(--jlpt-n5)', N4: 'var(--jlpt-n4)', N3: 'var(--jlpt-n3)',
           N2: 'var(--jlpt-n2)', N1: 'var(--jlpt-n1)' }[lv] || 'var(--primary)';
}

function speak(text, rate) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(String(text));
  u.lang = 'ja-JP';
  u.rate = rate || 0.85;
  window.speechSynthesis.speak(u);
}

function $id(id) { return document.getElementById(id); }

function setHTML(html) {
  var el = $id('nz-content');
  if (el) el.innerHTML = html;
}

function getUD() { return window._nzUserData || {}; }
function getU()  { return window._nzUser     || {}; }

function makeAvatar(photo, name, size, fontSize) {
  if (photo) {
    return '<img src="' + H(photo) + '" alt="' + H(name) +
      '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
      'object-fit:cover;border:2px solid var(--primary);flex-shrink:0;">';
  }
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
    'background:linear-gradient(135deg,var(--primary),#B02050);display:flex;' +
    'align-items:center;justify-content:center;font-size:' + fontSize + 'px;' +
    'font-weight:800;color:#fff;flex-shrink:0;">' +
    H(name.charAt(0).toUpperCase()) + '</div>';
}

function pctBar(val, max, color, height) {
  var p = Math.min(100, Math.round(val / Math.max(max, 1) * 100));
  height = height || 6;
  return '<div style="height:' + height + 'px;background:var(--card-elevated);' +
    'border-radius:' + Math.floor(height / 2) + 'px;overflow:hidden;">' +
    '<div style="height:100%;width:' + p + '%;background:' + color + ';' +
    'border-radius:' + Math.floor(height / 2) + 'px;transition:width .6s;"></div></div>';
}

/* ────────────────────────────────────────────────────────────────
   ROUTER
──────────────────────────────────────────────────────────────── */
var Router = (function () {
  var _routes = {};
  return {
    register: function (name, fn) { _routes[name] = fn; },
    go: function (name) {
      /* Cancel any running audio */
      if (window.speechSynthesis) window.speechSynthesis.cancel();

      /* Clean up vocab module keyboard/timers */
      if (window.VocabPage && typeof VocabPage.cleanup === 'function') {
        try { VocabPage.cleanup(); } catch (e) {}
      }

      /* Update nav active state */
      document.querySelectorAll('[data-route]').forEach(function (el) {
        el.classList.toggle('nz-active', el.dataset.route === name);
      });

      /* Push history without re-triggering popstate */
      if (window.location.hash !== '#' + name)
        history.pushState(null, '', '#' + name);

      /* Run the page */
      if (_routes[name]) {
        _routes[name]();
      } else {
        setHTML('<div style="padding:48px;text-align:center;' +
          'color:var(--muted-foreground);">Page not found.</div>');
      }
    }
  };
}());

/* ────────────────────────────────────────────────────────────────
   STYLES  (injected once into <head>)
──────────────────────────────────────────────────────────────── */
var NZ_CSS = [
/* Reset */
'*,*::before,*::after{box-sizing:border-box;}',

/* Sidebar */
'#nz-sb{position:fixed;top:0;left:0;bottom:0;width:250px;background:var(--background-secondary);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:200;overflow-y:auto;transition:transform .25s ease;}',
'#nz-main{margin-left:250px;min-height:100vh;background:var(--background);}',
'#nz-topbar{display:none;position:sticky;top:0;z-index:100;height:54px;background:var(--background-secondary);border-bottom:1px solid var(--border);padding:0 16px;align-items:center;justify-content:space-between;}',
'#nz-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:199;}',
'@media(max-width:768px){#nz-sb{transform:translateX(-100%);}#nz-sb.open{transform:translateX(0);}#nz-main{margin-left:0!important;}#nz-topbar{display:flex!important;}#nz-overlay.open{display:block!important;}}',

/* Logo */
'.nz-sb-top{display:flex;align-items:center;gap:10px;padding:18px 18px 14px;border-bottom:1px solid var(--border);flex-shrink:0;}',
'.nz-logomark{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--primary),#B02050);display:flex;align-items:center;justify-content:center;font-family:"Noto Serif JP",serif;font-size:15px;color:#fff;font-weight:700;box-shadow:0 0 16px rgba(232,68,106,.35);flex-shrink:0;}',
'.nz-logoname{font-weight:800;font-size:16px;color:var(--foreground);letter-spacing:-.3px;}',

/* User card */
'.nz-sb-user{padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;}',
'.nz-sb-uname{font-size:13px;font-weight:700;color:var(--foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.nz-sb-uemail{font-size:11px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}',
'.nz-sb-stats3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:12px;}',
'.nz-sb-stat{background:var(--card-elevated);border:1px solid var(--border);border-radius:8px;padding:8px 5px;text-align:center;}',
'.nz-sb-stat-v{font-size:13px;font-weight:800;display:block;}',
'.nz-sb-stat-l{font-size:9px;color:var(--muted-foreground);display:block;margin-top:1px;}',

/* Nav */
'.nz-sb-nav{padding:10px;flex:1;}',
'.nz-sb-sect{font-size:10px;font-weight:700;color:var(--foreground-subtle);text-transform:uppercase;letter-spacing:.08em;padding:0 8px;margin-bottom:5px;display:block;}',
'.nz-navlink{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;text-decoration:none;margin-bottom:2px;transition:background .15s;}',
'.nz-navlink:hover{background:var(--card-elevated);}',
'.nz-navlink.nz-active{background:var(--card-elevated);}',
'.nz-navlink.nz-active .nz-navlabel{color:var(--foreground)!important;}',
'.nz-navicon{font-size:17px;line-height:1;width:22px;text-align:center;flex-shrink:0;}',
'.nz-navlabel{font-size:13px;font-weight:600;color:var(--muted-foreground);}',
'.nz-jbadge{font-size:10px;font-weight:800;padding:2px 6px;border-radius:5px;font-family:"JetBrains Mono",monospace;flex-shrink:0;}',

/* Footer */
'.nz-sb-foot{padding:12px 16px;border-top:1px solid var(--border);flex-shrink:0;}',
'.nz-signout-btn{width:100%;padding:9px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--muted-foreground);font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;}',
'.nz-signout-btn:hover{background:var(--card-elevated);color:var(--foreground);}',
'.nz-menu-btn{background:none;border:none;color:var(--foreground);cursor:pointer;font-size:20px;padding:4px;}',

/* Pages */
'.nz-page{max-width:1400px;margin:0 auto;padding:28px 24px;}',
'@media(max-width:768px){.nz-page{padding:18px 14px;}}',
'.nz-fadein{opacity:0;animation:nzFadeIn .35s ease forwards;}',
'@keyframes nzFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}',

/* Cards */
'.nz-card{background:var(--card);border:1px solid var(--border);border-radius:14px;}',
'.nz-cardu{background:var(--card-elevated);border:1px solid var(--border);border-radius:10px;}',
'.nz-hoverable{transition:transform .2s,box-shadow .2s;cursor:pointer;}',
'.nz-hoverable:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.35);}',

/* Buttons */
'.nz-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;border:none;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s;}',
'.nz-btn:active{transform:scale(.97);}',
'.nz-btn:disabled{opacity:.45;cursor:not-allowed;}',
'.nz-btn-pri{background:var(--primary);color:#fff;}',
'.nz-btn-pri:hover{opacity:.88;}',
'.nz-btn-ghost{background:var(--card-elevated);color:var(--foreground);border:1px solid var(--border);}',
'.nz-btn-ghost:hover{border-color:var(--primary);color:var(--primary);}',

/* Kanji grid cells */
'.kj-cell{background:var(--card);border:1px solid var(--border);border-radius:12px;' +
  'padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;' +
  'cursor:pointer;position:relative;transition:all .15s;}',
'.kj-cell:hover{transform:translateY(-2px);border-color:var(--primary);box-shadow:0 4px 16px rgba(232,68,106,.18);}',

/* Grammar accordion */
'.gr-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:10px;}',
'.gr-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:none;border:none;cursor:pointer;text-align:left;transition:background .15s;}',
'.gr-toggle:hover{background:var(--card-elevated);}',
'.gr-body{padding:0 20px 20px;border-top:1px solid var(--border);}',

/* Script / reading lines */
'.sc-line{display:flex;gap:10px;padding:12px;border-radius:10px;background:var(--card-elevated);border-left:3px solid transparent;transition:all .2s;}',
'.sc-line.active{background:var(--primary-dim);border-left-color:var(--primary);}',

/* Quiz options */
'.q-opt{padding:11px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card-elevated);color:var(--foreground);font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;text-align:left;display:flex;align-items:center;gap:7px;transition:all .15s;width:100%;}',
'.q-opt:not([disabled]):hover{border-color:var(--primary);color:var(--primary);}',

/* Kanji modal */
'.nz-overlay-bg{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.82);}',
'.nz-modal-box{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:24px;width:100%;max-width:400px;position:relative;animation:nzFadeIn .2s ease;max-height:90vh;overflow-y:auto;}',

/* Timer ring */
'.timer-ring{transition:stroke-dashoffset .8s ease;}',

/* CSS variable aliases for VocabPage IIFE which uses --fg / --fg-muted */
':root{--fg:var(--foreground);--fg-muted:var(--muted-foreground);--fg-subtle:var(--foreground-subtle);}'
].join('\n');

/* ────────────────────────────────────────────────────────────────
   SHELL — renderShell()
   Builds the full sidebar + main area using real Firebase user data.
   Called once by window._nzBootstrap() in index.html.
──────────────────────────────────────────────────────────────── */
function renderShell() {
  var u    = getU();
  var d    = getUD();
  var name  = d.displayName || u.displayName || 'Learner';
  var email = d.email       || u.email       || '';
  var photo = d.photoURL    || u.photoURL    || '';
  var level  = d.level  || 1;
  var xp     = d.xp     || 0;
  var streak = d.streak || 1;

  var ava38 = makeAvatar(photo, name, 38, 16);

  document.body.innerHTML =
    /* ── Sidebar ── */
    '<aside id="nz-sb">' +
      '<div class="nz-sb-top">' +
        '<div class="nz-logomark">禅</div>' +
        '<span class="nz-logoname">NihongoZen</span>' +
      '</div>' +
      '<div class="nz-sb-user">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:13px;">' +
          ava38 +
          '<div style="min-width:0;">' +
            '<div class="nz-sb-uname">' + H(name) + '</div>' +
            '<div class="nz-sb-uemail">' + H(email) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="nz-sb-stats3">' +
          '<div class="nz-sb-stat">' +
            '<span class="nz-sb-stat-v" style="color:var(--foreground)">Lv.' + level + '</span>' +
            '<span class="nz-sb-stat-l">Level</span>' +
          '</div>' +
          '<div class="nz-sb-stat">' +
            '<span class="nz-sb-stat-v" style="color:var(--primary)">' + xp + '</span>' +
            '<span class="nz-sb-stat-l">XP</span>' +
          '</div>' +
          '<div class="nz-sb-stat">' +
            '<span class="nz-sb-stat-v" style="color:var(--accent)">🔥' + streak + '</span>' +
            '<span class="nz-sb-stat-l">Streak</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<nav class="nz-sb-nav">' +
        '<span class="nz-sb-sect">Study</span>' +
        navLink('dashboard', '🏠', 'Dashboard') +
        navLink('kanji',     '漢', 'Kanji') +
        navLink('vocab',     '語', 'Vocabulary') +
        navLink('grammar',   '文', 'Grammar') +
        navLink('listening', '🎧', 'Listening') +
        navLink('reading',   '📖', 'Reading') +
        navLink('kana',      'あ', 'Kana Chart') +
        '<span class="nz-sb-sect" style="margin-top:14px;">JLPT Practice</span>' +
        jlptLink('jlpt-n5', 'N5') +
        jlptLink('jlpt-n4', 'N4') +
        jlptLink('jlpt-n3', 'N3') +
        jlptLink('jlpt-n2', 'N2') +
        jlptLink('jlpt-n1', 'N1') +
        '<span class="nz-sb-sect" style="margin-top:14px;">Tools</span>' +
        navLink('timer',    '⏱', 'Focus Timer') +
        navLink('progress', '📊', 'Progress') +
        navLink('profile',  '👤', 'Profile') +
      '</nav>' +
      '<div class="nz-sb-foot">' +
        '<button class="nz-signout-btn" ' +
          'onclick="window._nzSignOut && window._nzSignOut()">← Sign Out</button>' +
      '</div>' +
    '</aside>' +

    /* ── Main area ── */
    '<div id="nz-main">' +
      '<div id="nz-topbar">' +
        '<button class="nz-menu-btn" onclick="nzToggleSidebar()">☰</button>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<div class="nz-logomark" ' +
            'style="width:28px;height:28px;border-radius:7px;font-size:13px;">禅</div>' +
          '<span style="font-weight:700;font-size:15px;' +
            'color:var(--foreground);">NihongoZen</span>' +
        '</div>' +
        makeAvatar(photo, name, 32, 13) +
      '</div>' +
      '<div id="nz-content"></div>' +
    '</div>' +

    /* ── Mobile overlay ── */
    '<div id="nz-overlay" onclick="nzToggleSidebar()"></div>';

  /* Inject styles once */
  if (!$id('nz-page-styles')) {
    var s = document.createElement('style');
    s.id  = 'nz-page-styles';
    s.textContent = Array.isArray(NZ_CSS) ? NZ_CSS.join('\n') : NZ_CSS;
    document.head.appendChild(s);
  }

  /* Single delegated nav-click handler */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-route]');
    if (!el) return;
    e.preventDefault();
    if (window.innerWidth < 769) nzToggleSidebar();
    Router.go(el.dataset.route);
  });
}

/* Sidebar nav helpers */
function navLink(route, icon, label) {
  return '<a href="#' + route + '" data-route="' + route + '" class="nz-navlink">' +
    '<span class="nz-navicon">' + icon + '</span>' +
    '<span class="nz-navlabel">' + label + '</span>' +
    '</a>';
}
function jlptLink(route, lv) {
  var c = jlptColor(lv);
  return '<a href="#' + route + '" data-route="' + route + '" class="nz-navlink">' +
    '<span class="nz-jbadge" style="color:' + c + ';background:' + c + '18;' +
      'border:1px solid ' + c + ';">' + lv + '</span>' +
    '<span class="nz-navlabel">' + lv + ' Practice</span>' +
    '</a>';
}

/* Mobile sidebar toggle */
window.nzToggleSidebar = function () {
  $id('nz-sb').classList.toggle('open');
  $id('nz-overlay').classList.toggle('open');
};

/* ────────────────────────────────────────────────────────────────
   PAGE: DASHBOARD
──────────────────────────────────────────────────────────────── */
var Pages = {};

Pages.dashboard = function () {
  var u = getU(), d = getUD();
  var name   = d.displayName || u.displayName || 'Learner';
  var photo  = d.photoURL    || u.photoURL    || '';
  var level  = d.level  || 1;
  var xp     = d.xp     || 0;
  var xpGoal = d.xpGoal || 500;
  var streak = d.streak || 1;
  var lvXP   = d.levelXP          || 0;
  var lvReq  = d.levelXPRequired  || 200;
  var xpPct  = Math.min(100, Math.round(xp   / xpGoal * 100));
  var lvPct  = Math.min(100, Math.round(lvXP / lvReq  * 100));

  var tKanji = Object.values(kanjiData).reduce(function (s, a) { return s + a.length; }, 0);
  var tVocab = VocabPageWords.length;
  var tGram  = grammarPoints.length;

  var ava = makeAvatar(photo, name, 56, 24);

  setHTML(
    '<div class="nz-page nz-fadein">' +

    /* Welcome row */
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:26px;flex-wrap:wrap;">' +
      ava +
      '<div style="flex:1;min-width:0;">' +
        '<h1 style="font-size:24px;font-weight:800;color:var(--foreground);margin:0 0 5px;' +
          'letter-spacing:-.5px;">Welcome back, ' + H(name) + ' 👋</h1>' +
        '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
          'Level ' + level + ' · ' + xp + ' XP · ' + streak + ' day streak 🔥</p>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="nz-btn nz-btn-pri" onclick="Router.go(\'kanji\')">漢 Study Kanji</button>' +
        '<button class="nz-btn nz-btn-ghost" onclick="Router.go(\'vocab\')">語 Vocabulary</button>' +
      '</div>' +
    '</div>' +

    /* XP card */
    '<div class="nz-card" style="padding:20px;margin-bottom:18px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
        '<span style="font-size:13px;font-weight:700;color:var(--foreground);">Daily XP Goal</span>' +
        '<span style="font-size:13px;color:var(--muted-foreground);">' + xp + ' / ' + xpGoal + ' XP</span>' +
      '</div>' +
      pctBar(xp, xpGoal, 'linear-gradient(90deg,var(--primary),#F05578)', 8) +
      '<div style="margin-top:10px;">' +
        '<div style="font-size:11px;color:var(--muted-foreground);margin-bottom:4px;">' +
          'Level ' + level + ' progress · ' + lvXP + ' / ' + lvReq + ' XP' +
        '</div>' +
        pctBar(lvXP, lvReq, 'var(--accent)', 5) +
      '</div>' +
    '</div>' +

    /* Stats grid */
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));' +
      'gap:11px;margin-bottom:24px;">' +
      dashStat('🔥', 'Streak',   streak + ' days',           'var(--accent)') +
      dashStat('漢', 'Kanji',    (d.kanjiCount||0)+'/'+tKanji,'var(--jlpt-n4)') +
      dashStat('語', 'Vocab',    (d.vocabMastered||0)+'/'+tVocab,'var(--jlpt-n5)') +
      dashStat('📝', 'Lessons',  (d.lessonsCompleted||0)+' done','var(--jlpt-n3)') +
      dashStat('🎯', 'Accuracy', (d.quizAccuracy||0)+'%',    'var(--jlpt-n2)') +
      dashStat('文', 'Grammar',  tGram+' patterns',           'var(--jlpt-n1)') +
    '</div>' +

    /* Study modules */
    '<h2 style="font-size:15px;font-weight:700;color:var(--foreground);margin:0 0 13px;">' +
      'Study Modules</h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));' +
      'gap:11px;margin-bottom:24px;">' +
      dashMod('漢','Kanji',    'kanji',    tKanji+' characters · N5–N1', 'var(--jlpt-n4)') +
      dashMod('語','Vocabulary','vocab',   tVocab+' words · 77 categories','var(--jlpt-n5)') +
      dashMod('文','Grammar',  'grammar',  tGram+' patterns · N5–N3',   'var(--jlpt-n3)') +
      dashMod('🎧','Listening','listening',dialogues.length+' dialogues','var(--jlpt-n2)') +
      dashMod('📖','Reading',  'reading',  passages.length+' passages',  'var(--jlpt-n1)') +
      dashMod('あ','Kana Chart','kana',    'Hiragana · Katakana · Combinations','var(--primary)') +
    '</div>' +

    /* JLPT buttons */
    '<h2 style="font-size:15px;font-weight:700;color:var(--foreground);margin:0 0 13px;">' +
      'JLPT Practice</h2>' +
    '<div style="display:flex;gap:9px;flex-wrap:wrap;">' +
      ['N5','N4','N3','N2','N1'].map(function (lv) {
        var c  = jlptColor(lv);
        var lb = {N5:'Beginner',N4:'Elementary',N3:'Intermediate',
                  N2:'Upper-Int.',N1:'Advanced'}[lv];
        return '<button class="nz-btn" onclick="Router.go(\'jlpt-' + lv.toLowerCase() + '\')" ' +
          'style="background:' + c + '18;color:' + c + ';border:1px solid ' + c + ';' +
          'font-weight:800;">' + lv + ' — ' + lb + '</button>';
      }).join('') +
    '</div>' +

    '</div>'
  );
};

function dashStat(icon, label, value, color) {
  return '<div class="nz-card" style="padding:16px;display:flex;align-items:center;gap:12px;">' +
    '<div style="width:40px;height:40px;border-radius:11px;background:' + color + '18;' +
      'border:1px solid ' + color + '40;display:flex;align-items:center;justify-content:center;' +
      'font-size:17px;font-family:\'Noto Serif JP\',serif;color:' + color + ';flex-shrink:0;">' +
      icon + '</div>' +
    '<div>' +
      '<div style="font-size:17px;font-weight:800;color:var(--foreground);letter-spacing:-.3px;">' +
        value + '</div>' +
      '<div style="font-size:11px;color:var(--muted-foreground);margin-top:1px;">' +
        label + '</div>' +
    '</div>' +
    '</div>';
}

function dashMod(icon, title, route, sub, color) {
  return '<div class="nz-card nz-hoverable" style="padding:20px;border-top:3px solid ' +
    color + ';" onclick="Router.go(\'' + route + '\')">' +
    '<div style="font-size:27px;color:' + color + ';font-family:\'Noto Serif JP\',serif;' +
      'margin-bottom:9px;">' + icon + '</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--foreground);margin-bottom:4px;">' +
      title + '</div>' +
    '<div style="font-size:12px;color:var(--muted-foreground);">' + sub + '</div>' +
    '</div>';
}

/* ────────────────────────────────────────────────────────────────
   PAGE: KANJI
──────────────────────────────────────────────────────────────── */
Pages.kanji = function () {
  var activeTab = 'N5';
  var searchVal = '';
  var learned   = new Set();
  var TABS      = ['N5','N4','N3','N2','N1'];

  function getFiltered() {
    var list = kanjiData[activeTab] || [];
    if (!searchVal) return list;
    var s = searchVal.toLowerCase();
    return list.filter(function (k) {
      return k.kanji.includes(s) ||
             k.meaning.toLowerCase().includes(s) ||
             k.reading.toLowerCase().includes(s);
    });
  }

  function renderGrid() {
    var f     = getFiltered();
    var color = jlptColor(activeTab);
    var grid  = $id('kj-grid');
    if (!grid) return;

    grid.innerHTML = f.map(function (k) {
      var isL = learned.has(k.id);
      return '<button class="kj-cell" data-id="' + k.id + '" ' +
        'style="border-color:' + (isL ? color + '55' : 'var(--border)') + ';">' +
        (isL ? '<span style="position:absolute;top:4px;right:4px;width:6px;height:6px;' +
          'border-radius:50%;background:' + color + ';"></span>' : '') +
        '<span style="font-family:\'Noto Serif JP\',serif;font-size:27px;line-height:1;' +
          'color:' + color + ';">' + H(k.kanji) + '</span>' +
        '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;' +
          'color:var(--muted-foreground);text-align:center;">' +
          H(k.reading.split('・')[0]) + '</span>' +
        '<span style="font-size:9px;color:var(--foreground-subtle);text-align:center;">' +
          H(k.meaning.split('/')[0]) + '</span>' +
        '</button>';
    }).join('');

    var cnt = $id('kj-cnt');
    if (cnt) cnt.textContent = f.length + ' shown · ' + learned.size + ' learned';

    grid.querySelectorAll('.kj-cell').forEach(function (btn) {
      btn.addEventListener('click', function () { openKanjiModal(btn.dataset.id); });
    });
  }

  function openKanjiModal(id) {
    var all = Object.values(kanjiData).flat();
    var k   = all.find(function (x) { return x.id === id; });
    if (!k) return;
    speak(k.kanji);

    var color = jlptColor(activeTab);
    var isL   = learned.has(k.id);

    var modal = document.createElement('div');
    modal.className = 'nz-overlay-bg';
    modal.innerHTML =
      '<div class="nz-modal-box">' +
        '<button onclick="this.closest(\'.nz-overlay-bg\').remove()" ' +
          'style="position:absolute;top:12px;right:14px;background:none;border:none;' +
          'color:var(--muted-foreground);cursor:pointer;font-size:22px;line-height:1;">×</button>' +

        /* Kanji + reading + meaning */
        '<div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:18px;">' +
          '<button onclick="speak(\'' + H(k.kanji) + '\')" ' +
            'style="font-family:\'Noto Serif JP\',serif;font-size:72px;line-height:1;' +
            'color:' + color + ';background:none;border:none;cursor:pointer;padding:0;" ' +
            'title="Hear pronunciation">' + H(k.kanji) + '</button>' +
          '<div>' +
            '<span style="display:inline-block;font-size:10px;font-weight:800;color:' + color + ';' +
              'background:' + color + '18;border:1px solid ' + color + ';padding:2px 8px;' +
              'border-radius:5px;font-family:\'JetBrains Mono\',monospace;margin-bottom:6px;">' +
              H(activeTab) + '</span>' +
            '<p style="font-family:\'JetBrains Mono\',monospace;font-size:13px;' +
              'color:var(--muted-foreground);margin:0 0 4px;">' + H(k.reading) + '</p>' +
            '<p style="font-size:14px;font-weight:700;color:var(--foreground);margin:0;">' +
              H(k.meaning) + '</p>' +
          '</div>' +
        '</div>' +

        /* On / Kun / Meaning / JLPT grid */
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:13px;">' +
          kanjiCell('On 音',   k.on,         true) +
          kanjiCell('Kun 訓',  k.kun || '—', true) +
          kanjiCell('Meaning', k.meaning,    false) +
          kanjiCell('JLPT',    activeTab,    false) +
        '</div>' +

        /* Example */
        '<div class="nz-cardu" style="padding:12px;margin-bottom:13px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;' +
            'margin-bottom:7px;">' +
            '<span style="font-size:10px;color:var(--muted-foreground);' +
              'text-transform:uppercase;letter-spacing:.06em;">Example</span>' +
            '<button onclick="speak(\'' + H(k.example) + '\')" ' +
              'style="background:none;border:none;cursor:pointer;font-size:12px;' +
              'color:var(--primary);">🔊 Read aloud</button>' +
          '</div>' +
          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:14px;' +
            'color:var(--foreground);margin:0 0 4px;">' + H(k.example) + '</p>' +
          '<p style="font-size:12px;color:var(--muted-foreground);font-style:italic;margin:0;">' +
            H(k.exampleMeaning) + '</p>' +
        '</div>' +

        /* Actions */
        '<div style="display:flex;gap:10px;">' +
          '<button id="kj-lbtn" ' +
            'style="flex:1;padding:11px;border-radius:10px;font-size:13px;font-weight:700;' +
            'font-family:inherit;cursor:pointer;transition:all .15s;' +
            'background:' + (isL ? 'var(--card-elevated)' : color) + ';' +
            'color:' + (isL ? color : '#fff') + ';border:1px solid ' + color + ';" ' +
            'onclick="nzToggleLearned(\'' + H(k.id) + '\')">' +
            (isL ? '✓ Learned' : 'Mark as Learned') +
          '</button>' +
          '<button onclick="this.closest(\'.nz-overlay-bg\').remove()" ' +
            'class="nz-btn nz-btn-ghost">Close</button>' +
        '</div>' +
      '</div>';

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);

    window.nzToggleLearned = function (kid) {
      if (learned.has(kid)) learned.delete(kid); else learned.add(kid);
      var btn = $id('kj-lbtn');
      if (btn) {
        btn.textContent  = learned.has(kid) ? '✓ Learned' : 'Mark as Learned';
        btn.style.background = learned.has(kid) ? 'var(--card-elevated)' : color;
        btn.style.color      = learned.has(kid) ? color : '#fff';
      }
      renderGrid();
    };
  }

  function kanjiCell(label, val, canSpeak) {
    return '<div class="nz-cardu" style="padding:11px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">' +
        '<span style="font-size:10px;color:var(--muted-foreground);">' + label + '</span>' +
        (canSpeak && val && val !== '—'
          ? '<button onclick="speak(\'' + H(val) + '\')" ' +
            'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
            'font-size:11px;">🔊</button>'
          : '') +
      '</div>' +
      '<span style="font-family:\'JetBrains Mono\',monospace;font-size:12px;' +
        'color:var(--foreground);">' + H(val) + '</span>' +
      '</div>';
  }

  function switchTab(t) {
    activeTab = t;
    searchVal = '';
    var inp = $id('kj-search');
    if (inp) inp.value = '';
    TABS.forEach(function (tab) {
      var btn = $id('kj-tab-' + tab);
      if (!btn) return;
      var c   = jlptColor(tab);
      var act = tab === t;
      btn.style.background   = act ? c + '18' : 'transparent';
      btn.style.color        = act ? c : 'var(--muted-foreground)';
      btn.style.borderBottom = act ? '2px solid ' + c : '2px solid transparent';
    });
    renderGrid();
  }

  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
        'letter-spacing:-.4px;">漢字 Kanji Study</h1>' +
      '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
        'Master kanji characters from N5 to N1 level</p>' +
    '</div>' +

    /* Tabs + search */
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:11px;margin-bottom:16px;">' +
      '<div style="display:flex;border:1px solid var(--border);border-radius:12px;' +
        'overflow:hidden;background:var(--card);">' +
        TABS.map(function (t) {
          var c   = jlptColor(t);
          var act = t === 'N5';
          return '<button id="kj-tab-' + t + '" onclick="nzKanjiTab(\'' + t + '\')" ' +
            'style="padding:10px 15px;font-size:13px;font-weight:700;font-family:inherit;' +
            'cursor:pointer;border:none;' +
            'border-bottom:2px solid ' + (act ? c : 'transparent') + ';' +
            'background:' + (act ? c + '18' : 'transparent') + ';' +
            'color:' + (act ? c : 'var(--muted-foreground)') + ';' +
            'transition:all .15s;">' + t + '</button>';
        }).join('') +
      '</div>' +

      '<div style="position:relative;flex:1;max-width:270px;">' +
        '<span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);' +
          'color:var(--muted-foreground);font-size:13px;pointer-events:none;">🔍</span>' +
        '<input id="kj-search" type="text" placeholder="Search kanji, meaning…" ' +
          'oninput="nzKanjiSearch(this.value)" ' +
          'style="width:100%;padding:10px 14px 10px 34px;border-radius:10px;' +
          'border:1px solid var(--border);background:var(--card);color:var(--foreground);' +
          'font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;" ' +
          'onfocus="this.style.borderColor=\'var(--primary)\'" ' +
          'onblur="this.style.borderColor=\'var(--border)\'">' +
      '</div>' +
      '<span id="kj-cnt" style="font-size:12px;color:var(--muted-foreground);' +
        'margin-left:auto;"></span>' +
    '</div>' +

    '<div id="kj-grid" style="display:grid;' +
      'grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;"></div>' +
    '</div>'
  );

  window.nzKanjiTab    = switchTab;
  window.nzKanjiSearch = function (v) { searchVal = v; renderGrid(); };
  renderGrid();
};

/* ────────────────────────────────────────────────────────────────
   PAGE: VOCABULARY  (delegates entirely to VocabPage IIFE)
──────────────────────────────────────────────────────────────── */
Pages.vocab = function () {
  setHTML('<div id="nz-vocab-root" style="min-height:60vh;"></div>');
  if (window.VocabPage && typeof VocabPage.mount === 'function') {
    VocabPage.mount('nz-vocab-root');
  } else {
    $id('nz-vocab-root').innerHTML =
      '<div style="padding:40px;text-align:center;color:var(--muted-foreground);">' +
      'Vocabulary module loading…</div>';
  }
};

/* ────────────────────────────────────────────────────────────────
   PAGE: GRAMMAR
──────────────────────────────────────────────────────────────── */
Pages.grammar = function () {
  var activeLv  = 'All';
  var expanded  = new Set(['g-001']);
  var LEVELS    = ['All', 'N5', 'N4', 'N3'];

  function getFiltered() {
    if (activeLv === 'All') return grammarPoints;
    return grammarPoints.filter(function (g) { return g.level === activeLv; });
  }

  function renderCards() {
    var container = $id('gr-list');
    if (!container) return;

    container.innerHTML = getFiltered().map(function (g) {
      var color  = jlptColor(g.level);
      var isOpen = expanded.has(g.id);

      var body = '';
      if (isOpen) {
        body =
          '<div class="gr-body">' +
            '<p style="font-size:13px;color:var(--muted-foreground);line-height:1.65;' +
              'margin:16px 0 12px;">' + H(g.explanation) + '</p>' +
            '<div class="nz-cardu" style="padding:12px;margin-bottom:13px;">' +
              '<p style="font-size:10px;color:var(--muted-foreground);' +
                'text-transform:uppercase;letter-spacing:.06em;margin:0 0 5px;">Structure</p>' +
              '<p style="font-family:\'JetBrains Mono\',monospace;font-size:13px;' +
                'color:var(--foreground);margin:0;">' + H(g.structure) + '</p>' +
            '</div>' +
            '<p style="font-size:10px;font-weight:700;color:var(--muted-foreground);' +
              'text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">Examples</p>' +
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
              g.examples.map(function (ex) {
                return '<div style="display:flex;align-items:flex-start;gap:10px;padding:12px;' +
                  'border-radius:10px;background:var(--card-elevated);' +
                  'border:1px solid var(--border);">' +
                  '<div style="flex:1;">' +
                    '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;' +
                      'color:var(--foreground);margin:0 0 3px;">' + H(ex.jp) + '</p>' +
                    '<p style="font-size:12px;color:var(--muted-foreground);' +
                      'font-style:italic;margin:0;">' + H(ex.en) + '</p>' +
                  '</div>' +
                  '<button onclick="speak(\'' + H(ex.jp) + '\')" ' +
                    'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                    'font-size:14px;flex-shrink:0;padding:2px 4px;">🔊</button>' +
                  '</div>';
              }).join('') +
            '</div>' +
          '</div>';
      }

      return '<div class="gr-card">' +
        '<button class="gr-toggle" data-gid="' + g.id + '">' +
          '<div style="display:flex;align-items:center;gap:11px;">' +
            '<span style="font-size:10px;font-weight:800;color:' + color + ';' +
              'background:' + color + '18;border:1px solid ' + color + ';' +
              'padding:2px 7px;border-radius:5px;font-family:\'JetBrains Mono\',monospace;' +
              'flex-shrink:0;">' + H(g.level) + '</span>' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:8px;">' +
                '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:16px;' +
                  'font-weight:700;color:var(--foreground);">' + H(g.pattern) + '</span>' +
                '<button onclick="event.stopPropagation();speak(\'' + H(g.pattern) + '\')" ' +
                  'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                  'font-size:12px;padding:2px 4px;">🔊</button>' +
              '</div>' +
              '<p style="font-size:11px;color:var(--muted-foreground);margin:0;">' +
                H(g.title) + '</p>' +
            '</div>' +
          '</div>' +
          '<span style="color:var(--muted-foreground);font-size:15px;flex-shrink:0;">' +
            (isOpen ? '▲' : '▼') + '</span>' +
        '</button>' +
        body +
        '</div>';
    }).join('');

    /* Accordion delegation */
    container.querySelectorAll('.gr-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var gid = btn.dataset.gid;
        if (expanded.has(gid)) expanded.delete(gid); else expanded.add(gid);
        renderCards();
      });
    });
  }

  function switchLevel(lv) {
    activeLv = lv;
    expanded.clear();
    LEVELS.forEach(function (l) {
      var btn = $id('gr-lv-' + l);
      if (!btn) return;
      var c   = l === 'All' ? 'var(--primary)' : jlptColor(l);
      var act = l === lv;
      btn.style.background  = act ? (l === 'All' ? 'var(--primary)' : c + '18') : 'var(--card-elevated)';
      btn.style.color       = act ? (l === 'All' ? '#fff' : c) : 'var(--muted-foreground)';
      btn.style.borderColor = act ? (l === 'All' ? 'var(--primary)' : c) : 'var(--border)';
    });
    renderCards();
  }

  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
        'letter-spacing:-.4px;">文法 Grammar</h1>' +
      '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
        'Master Japanese grammar patterns from N5 to N1</p>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">' +
      LEVELS.map(function (lv) {
        var act = lv === 'All';
        var c   = lv === 'All' ? 'var(--primary)' : jlptColor(lv);
        return '<button id="gr-lv-' + lv + '" onclick="nzGrLevel(\'' + lv + '\')" ' +
          'style="padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;' +
          'font-family:inherit;cursor:pointer;transition:all .15s;' +
          'background:' + (act ? 'var(--primary)' : 'var(--card-elevated)') + ';' +
          'color:' + (act ? '#fff' : 'var(--muted-foreground)') + ';' +
          'border:1px solid ' + (act ? 'var(--primary)' : 'var(--border)') + ';">' +
          lv + '</button>';
      }).join('') +
    '</div>' +
    '<div id="gr-list"></div>' +
    '</div>'
  );
  window.nzGrLevel = switchLevel;
  renderCards();
};

/* ────────────────────────────────────────────────────────────────
   PAGE: LISTENING
──────────────────────────────────────────────────────────────── */
Pages.listening = function () {
  var selected    = null;
  var isPlaying   = false;
  var quizAns     = {};
  var showResults = false;

  function renderList() {
    setHTML(
      '<div class="nz-page nz-fadein">' +
      '<div style="margin-bottom:20px;">' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
          'letter-spacing:-.4px;">聴解 Listening</h1>' +
        '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
          'Practice listening comprehension with real dialogues</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(265px,1fr));' +
        'gap:13px;">' +
        dialogues.map(function (dlg, i) {
          var c = jlptColor(dlg.level);
          return '<div class="nz-card nz-hoverable" style="padding:20px;' +
            'border-top:3px solid ' + c + ';" onclick="nzOpenDlg(' + i + ')">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;' +
              'margin-bottom:9px;">' +
              '<span style="font-size:10px;font-weight:800;color:' + c + ';' +
                'background:' + c + '18;border:1px solid ' + c + ';' +
                'padding:2px 8px;border-radius:5px;' +
                'font-family:\'JetBrains Mono\',monospace;">' + dlg.level + '</span>' +
              '<span style="font-size:11px;color:var(--muted-foreground);">' +
                dlg.lineCount + ' lines</span>' +
            '</div>' +
            '<h3 style="font-size:15px;font-weight:700;color:var(--foreground);' +
              'margin:0 0 3px;">' + H(dlg.topic) + '</h3>' +
            '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
              'color:var(--muted-foreground);margin:0 0 7px;">' + H(dlg.topicJp) + '</p>' +
            '<p style="font-size:12px;color:var(--foreground-subtle);margin:0 0 15px;">' +
              H(dlg.preview) + '</p>' +
            '<button class="nz-btn" style="width:100%;justify-content:center;' +
              'background:' + c + ';color:#fff;">🎧 Start Listening</button>' +
            '</div>';
        }).join('') +
      '</div></div>'
    );
    window.nzOpenDlg = function (i) {
      selected    = dialogues[i];
      quizAns     = {};
      showResults = false;
      renderDetail();
    };
  }

  function renderDetail() {
    var dlg        = selected;
    var c          = jlptColor(dlg.level);
    var score      = dlg.quiz.filter(function (q) { return quizAns[q.id] === q.answer; }).length;
    var allAnswered = Object.keys(quizAns).length >= dlg.quiz.length;

    setHTML(
      '<div class="nz-page nz-fadein">' +
      backBtn('nzLiBack', 'Back to dialogues') +

      /* Header */
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
        lvBadge(c, dlg.level) +
        '<div>' +
          '<h1 style="font-size:20px;font-weight:800;color:var(--foreground);margin:0 0 2px;">' +
            H(dlg.topic) + '</h1>' +
          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
            'color:var(--muted-foreground);margin:0;">' + H(dlg.topicJp) + '</p>' +
        '</div>' +
      '</div>' +

      /* Script card */
      '<div class="nz-card" style="padding:20px;margin-bottom:13px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;' +
          'margin-bottom:15px;">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:32px;height:32px;border-radius:8px;' +
              'background:var(--primary-dim);display:flex;align-items:center;' +
              'justify-content:center;font-size:15px;">🎙️</div>' +
            '<div>' +
              '<p style="font-size:13px;font-weight:700;color:var(--foreground);margin:0;">' +
                'Dialogue Script</p>' +
              '<p style="font-size:11px;color:var(--muted-foreground);margin:0;">' +
                'Web Speech API</p>' +
            '</div>' +
          '</div>' +
          '<button id="li-play-btn" onclick="nzLiPlay()" ' +
            'class="nz-btn nz-btn-pri">▶ Play Dialogue</button>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          dlg.script.map(function (ln) {
            return '<div id="sc-' + H(ln.id) + '" class="sc-line">' +
              '<div style="flex-shrink:0;padding-top:1px;">' +
                '<span style="font-size:10px;font-weight:600;padding:2px 8px;' +
                  'border-radius:20px;background:var(--card);border:1px solid var(--border);' +
                  'color:var(--muted-foreground);">' + H(ln.speaker) + '</span>' +
              '</div>' +
              '<div style="flex:1;min-width:0;">' +
                '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;' +
                  'color:var(--foreground);margin:0 0 3px;">' + H(ln.jp) + '</p>' +
                '<p style="font-size:12px;color:var(--muted-foreground);' +
                  'font-style:italic;margin:0;">' + H(ln.en) + '</p>' +
              '</div>' +
              '<button onclick="speak(\'' + H(ln.jp) + '\')" ' +
                'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                'font-size:14px;flex-shrink:0;padding:2px 4px;">🔊</button>' +
              '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      /* Key phrases */
      '<div class="nz-card" style="padding:20px;margin-bottom:13px;">' +
        '<h3 style="font-size:13px;font-weight:700;color:var(--foreground);' +
          'margin:0 0 11px;">Key Phrases</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));' +
          'gap:9px;">' +
          dlg.phrases.map(function (p) {
            return phraseCard(p);
          }).join('') +
        '</div>' +
      '</div>' +

      /* Quiz */
      quizBlock(dlg.quiz, quizAns, showResults, score,
        'nzLiAns', 'nzLiCheck', 'nzLiRetry') +

      '</div>'
    );

    window.nzLiBack   = function () { isPlaying = false; if (window.speechSynthesis) window.speechSynthesis.cancel(); renderList(); };
    window.nzLiAns    = function (qid, i) { quizAns[qid] = i; renderDetail(); };
    window.nzLiCheck  = function () { showResults = true;  renderDetail(); };
    window.nzLiRetry  = function () { quizAns = {}; showResults = false; renderDetail(); };

    window.nzLiPlay = async function () {
      if (isPlaying) {
        isPlaying = false;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        var btn = $id('li-play-btn');
        if (btn) { btn.textContent = '▶ Play Dialogue'; btn.style.background = 'var(--primary)'; }
        dlg.script.forEach(function (ln) {
          var el = $id('sc-' + ln.id);
          if (el) el.classList.remove('active');
        });
        return;
      }
      isPlaying = true;
      var btn = $id('li-play-btn');
      if (btn) { btn.textContent = '⏹ Stop'; btn.style.background = 'var(--jlpt-n3)'; }

      for (var i = 0; i < dlg.script.length; i++) {
        if (!isPlaying) break;
        var ln = dlg.script[i];
        var el = $id('sc-' + ln.id);
        if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        await speakAsync(ln.jp, 0.82, 600);
        if (el) el.classList.remove('active');
      }
      isPlaying = false;
      if (btn) { btn.textContent = '▶ Play Dialogue'; btn.style.background = 'var(--primary)'; }
    };
  }

  renderList();
};

/* ────────────────────────────────────────────────────────────────
   PAGE: READING
──────────────────────────────────────────────────────────────── */
Pages.reading = function () {
  var selected     = null;
  var isPlaying    = false;
  var showAllTrans = false;
  var visLines     = new Set();
  var quizAns      = {};
  var showResults  = false;

  function renderList() {
    setHTML(
      '<div class="nz-page nz-fadein">' +
      '<div style="margin-bottom:20px;">' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
          'letter-spacing:-.4px;">読解 Reading</h1>' +
        '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
          'Improve reading comprehension with graded passages</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(265px,1fr));' +
        'gap:13px;">' +
        passages.map(function (p, i) {
          var c = jlptColor(p.level);
          return '<div class="nz-card nz-hoverable" style="padding:20px;' +
            'border-top:3px solid ' + c + ';" onclick="nzOpenPassage(' + i + ')">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;' +
              'margin-bottom:9px;">' +
              '<span style="font-size:10px;font-weight:800;color:' + c + ';' +
                'background:' + c + '18;border:1px solid ' + c + ';' +
                'padding:2px 8px;border-radius:5px;' +
                'font-family:\'JetBrains Mono\',monospace;">' + p.level + '</span>' +
              '<span style="font-size:11px;color:var(--muted-foreground);">' +
                p.wordCount + ' words</span>' +
            '</div>' +
            '<h3 style="font-size:15px;font-weight:700;color:var(--foreground);' +
              'margin:0 0 3px;">' + H(p.title) + '</h3>' +
            '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
              'color:var(--muted-foreground);margin:0 0 7px;">' + H(p.titleJp) + '</p>' +
            '<p style="font-size:12px;color:var(--foreground-subtle);margin:0 0 15px;">' +
              p.difficulty + ' · ' + p.lines.length + ' sentences</p>' +
            '<button class="nz-btn" style="width:100%;justify-content:center;' +
              'background:' + c + ';color:#fff;">📖 Start Reading</button>' +
            '</div>';
        }).join('') +
      '</div></div>'
    );
    window.nzOpenPassage = function (i) {
      selected     = passages[i];
      quizAns      = {};
      showResults  = false;
      visLines     = new Set();
      showAllTrans = false;
      renderDetail();
    };
  }

  function renderDetail() {
    var p          = selected;
    var c          = jlptColor(p.level);
    var score      = p.quiz.filter(function (q) { return quizAns[q.id] === q.answer; }).length;
    var allAnswered = Object.keys(quizAns).length >= p.quiz.length;

    setHTML(
      '<div class="nz-page nz-fadein">' +
      backBtn('nzRdBack', 'Back to passages') +

      /* Header */
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
        lvBadge(c, p.level) +
        '<div>' +
          '<h1 style="font-size:20px;font-weight:800;color:var(--foreground);margin:0 0 2px;">' +
            H(p.title) + '</h1>' +
          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
            'color:var(--muted-foreground);margin:0;">' + H(p.titleJp) + '</p>' +
        '</div>' +
      '</div>' +

      /* Controls */
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:13px;">' +
        '<button id="rd-play-btn" onclick="nzRdPlay()" class="nz-btn nz-btn-pri">' +
          '▶ Read Aloud</button>' +
        '<button onclick="nzRdToggleTrans()" class="nz-btn nz-btn-ghost">' +
          (showAllTrans ? '🙈 Hide' : '👁 Show') + ' Translations</button>' +
      '</div>' +

      /* Passage lines */
      '<div class="nz-card" style="padding:20px;margin-bottom:13px;">' +
        p.lines.map(function (ln) {
          var vis = showAllTrans || visLines.has(ln.id);
          return '<div id="rd-' + H(ln.id) + '" ' +
            'style="display:flex;gap:10px;padding:12px;border-radius:10px;' +
            'margin-bottom:6px;border-left:3px solid transparent;transition:all .2s;">' +
            '<div style="flex:1;">' +
              '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:15px;' +
                'color:var(--foreground);line-height:1.7;margin:0 0 3px;">' +
                H(ln.jp) + '</p>' +
              (vis ? '<p style="font-size:12px;color:var(--muted-foreground);' +
                'font-style:italic;margin:0;">' + H(ln.en) + '</p>' : '') +
            '</div>' +
            '<div style="display:flex;gap:3px;flex-shrink:0;margin-top:2px;">' +
              '<button onclick="nzRdToggleLine(\'' + H(ln.id) + '\')" ' +
                'style="background:none;border:none;cursor:pointer;' +
                'color:var(--muted-foreground);font-size:13px;padding:3px 5px;" ' +
                'title="Toggle translation">' +
                (visLines.has(ln.id) ? '🙈' : '👁') + '</button>' +
              '<button onclick="speak(\'' + H(ln.jp) + '\')" ' +
                'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                'font-size:14px;padding:3px 5px;">🔊</button>' +
            '</div>' +
            '</div>';
        }).join('') +
      '</div>' +

      /* Key vocabulary */
      '<div class="nz-card" style="padding:20px;margin-bottom:13px;">' +
        '<h3 style="font-size:13px;font-weight:700;color:var(--foreground);' +
          'margin:0 0 11px;">Key Vocabulary</h3>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          p.vocab.map(function (v) {
            return '<button onclick="speak(\'' + H(v.jp) + '\')" ' +
              'style="display:flex;align-items:center;gap:8px;padding:9px 13px;' +
              'border-radius:10px;background:var(--card-elevated);' +
              'border:1px solid var(--border);cursor:pointer;font-family:inherit;' +
              'transition:all .15s;" ' +
              'onmouseover="this.style.borderColor=\'var(--primary)\'" ' +
              'onmouseout="this.style.borderColor=\'var(--border)\'">' +
              '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;' +
                'font-weight:700;color:var(--foreground);">' + H(v.jp) + '</span>' +
              '<span style="font-size:11px;color:var(--muted-foreground);">' +
                H(v.en) + '</span>' +
              '<span style="color:var(--primary);font-size:12px;">🔊</span>' +
              '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      /* Quiz */
      quizBlock(p.quiz, quizAns, showResults, score,
        'nzRdAns', 'nzRdCheck', 'nzRdRetry') +

      '</div>'
    );

    window.nzRdBack        = function () { isPlaying = false; if (window.speechSynthesis) window.speechSynthesis.cancel(); renderList(); };
    window.nzRdToggleLine  = function (id) { if (visLines.has(id)) visLines.delete(id); else visLines.add(id); renderDetail(); };
    window.nzRdToggleTrans = function () { showAllTrans = !showAllTrans; renderDetail(); };
    window.nzRdAns         = function (qid, i) { quizAns[qid] = i; renderDetail(); };
    window.nzRdCheck       = function () { showResults = true;  renderDetail(); };
    window.nzRdRetry       = function () { quizAns = {}; showResults = false; renderDetail(); };

    window.nzRdPlay = async function () {
      if (isPlaying) {
        isPlaying = false;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        var btn = $id('rd-play-btn');
        if (btn) { btn.textContent = '▶ Read Aloud'; btn.style.background = 'var(--primary)'; }
        p.lines.forEach(function (ln) {
          var el = $id('rd-' + ln.id);
          if (el) { el.style.background = 'transparent'; el.style.borderLeftColor = 'transparent'; }
        });
        return;
      }
      isPlaying = true;
      var btn = $id('rd-play-btn');
      if (btn) { btn.textContent = '⏹ Stop'; btn.style.background = 'var(--jlpt-n3)'; }

      for (var i = 0; i < p.lines.length; i++) {
        if (!isPlaying) break;
        var ln = p.lines[i];
        var el = $id('rd-' + ln.id);
        if (el) {
          el.style.background      = 'var(--primary-dim)';
          el.style.borderLeftColor = 'var(--primary)';
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        await speakAsync(ln.jp, 0.82, 700);
        if (el) { el.style.background = 'transparent'; el.style.borderLeftColor = 'transparent'; }
      }
      isPlaying = false;
      if (btn) { btn.textContent = '▶ Read Aloud'; btn.style.background = 'var(--primary)'; }
    };
  }

  renderList();
};

/* ────────────────────────────────────────────────────────────────
   PAGE: KANA CHART  (delegates to nz-kana.js _nzKanaInit)
──────────────────────────────────────────────────────────────── */
Pages.kana = function () {
  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
        'letter-spacing:-.4px;">かな Kana Chart</h1>' +
      '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
        'Hiragana · Katakana · Dakuten · Combinations — ' +
        'click any character to hear it</p>' +
    '</div>' +
    '<div id="kana-chart" style="background:var(--card);border:1px solid var(--border);' +
      'border-radius:16px;padding:8px;"></div>' +
    '</div>'
  );
  /* nz-kana.js exposed window._nzKanaInit from inside its IIFE */
  if (typeof window._nzKanaInit === 'function') {
    window._nzKanaInit();
  }
};

/* ────────────────────────────────────────────────────────────────
   PAGE: JLPT LEVEL
──────────────────────────────────────────────────────────────── */
Pages.jlptLevel = function (lvl) {
  var lv    = lvl.toUpperCase();
  var color = jlptColor(lv);
  var desc  = {
    N5: 'Beginner · Basic expressions and vocabulary',
    N4: 'Elementary · Everyday topics and grammar',
    N3: 'Intermediate · Complex sentence structures',
    N2: 'Upper-Intermediate · Broad vocabulary range',
    N1: 'Advanced · Near-native comprehension'
  }[lv] || '';

  var kList  = kanjiData[lv]   || [];
  var gList  = grammarPoints.filter(function (g) { return g.level === lv; });
  var rList  = passages.filter(function (p) { return p.level === lv; });
  var liList = dialogues.filter(function (d) { return d.level === lv; });

  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">' +
        '<span style="font-size:13px;font-weight:800;color:' + color + ';' +
          'background:' + color + '18;border:1px solid ' + color + ';' +
          'padding:4px 14px;border-radius:8px;' +
          'font-family:\'JetBrains Mono\',monospace;">' + lv + '</span>' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);' +
          'margin:0;letter-spacing:-.4px;">JLPT ' + lv + ' Practice</h1>' +
      '</div>' +
      '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' + H(desc) + '</p>' +
    '</div>' +

    /* Section cards */
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));' +
      'gap:13px;margin-bottom:24px;">' +
      jlptSect('漢', 'Kanji',     kList.length    + ' characters', 'kanji',     color) +
      jlptSect('語', 'Vocabulary', VocabPageWords.length + ' words','vocab',     color) +
      jlptSect('文', 'Grammar',   gList.length    + ' patterns',   'grammar',   color) +
      jlptSect('📖', 'Reading',   rList.length    + ' passages',   'reading',   color) +
      jlptSect('🎧', 'Listening', liList.length   + ' dialogues',  'listening', color) +
    '</div>' +

    /* Kanji preview */
    (kList.length ?
      '<h2 style="font-size:15px;font-weight:700;color:var(--foreground);' +
        'margin:0 0 11px;">Kanji Preview</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:22px;">' +
        kList.slice(0, 32).map(function (k) {
          return '<button onclick="Router.go(\'kanji\')" ' +
            'style="width:50px;height:50px;border-radius:10px;background:var(--card);' +
            'border:1px solid var(--border);cursor:pointer;display:flex;' +
            'flex-direction:column;align-items:center;justify-content:center;' +
            'gap:2px;transition:all .15s;" ' +
            'onmouseover="this.style.borderColor=\'' + color + '\';' +
              'this.style.transform=\'translateY(-2px)\'" ' +
            'onmouseout="this.style.borderColor=\'var(--border)\';' +
              'this.style.transform=\'\'">' +
            '<span style="font-family:\'Noto Serif JP\',serif;font-size:20px;color:' +
              color + ';">' + H(k.kanji) + '</span>' +
            '<span style="font-size:8px;color:var(--muted-foreground);">' +
              H(k.reading.split('・')[0]) + '</span>' +
            '</button>';
        }).join('') +
        (kList.length > 32
          ? '<button onclick="Router.go(\'kanji\')" ' +
            'style="width:50px;height:50px;border-radius:10px;background:var(--card);' +
            'border:1px dashed var(--border);cursor:pointer;font-size:11px;' +
            'color:var(--muted-foreground);">+' + (kList.length - 32) + '</button>'
          : '') +
      '</div>'
    : '') +

    /* Grammar preview */
    (gList.length ?
      '<h2 style="font-size:15px;font-weight:700;color:var(--foreground);' +
        'margin:0 0 11px;">Grammar Patterns</h2>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:22px;">' +
        gList.map(function (g) {
          return '<div style="display:flex;align-items:center;gap:12px;padding:13px 16px;' +
            'border-radius:10px;background:var(--card);border:1px solid var(--border);' +
            'cursor:pointer;transition:all .15s;" ' +
            'onclick="Router.go(\'grammar\')" ' +
            'onmouseover="this.style.borderColor=\'' + color + '\'" ' +
            'onmouseout="this.style.borderColor=\'var(--border)\'">' +
            '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:15px;' +
              'font-weight:700;color:' + color + ';">' + H(g.pattern) + '</span>' +
            '<span style="font-size:12px;color:var(--muted-foreground);flex:1;">' +
              H(g.title) + '</span>' +
            '<button onclick="event.stopPropagation();speak(\'' + H(g.pattern) + '\')" ' +
              'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
              'font-size:14px;padding:2px 4px;">🔊</button>' +
            '</div>';
        }).join('') +
      '</div>'
    : '') +

    '</div>'
  );
};

function jlptSect(icon, title, sub, route, color) {
  return '<div class="nz-card nz-hoverable" style="padding:20px;" ' +
    'onclick="Router.go(\'' + route + '\')">' +
    '<div style="font-size:26px;color:' + color + ';font-family:\'Noto Serif JP\',serif;' +
      'margin-bottom:9px;">' + icon + '</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--foreground);' +
      'margin-bottom:4px;">' + title + '</div>' +
    '<div style="font-size:12px;color:var(--muted-foreground);">' + sub + '</div>' +
    '</div>';
}

/* ────────────────────────────────────────────────────────────────
   PAGE: FOCUS TIMER
──────────────────────────────────────────────────────────────── */
Pages.timer = function () {
  var mode     = 'focus';
  var MODES    = { focus: 1500, short: 300, long: 900 };
  var duration = 1500;
  var remaining = 1500;
  var running  = false;
  var interval = null;

  function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' +
           String(s % 60).padStart(2, '0');
  }

  function renderTimer() {
    var circ = 283;                              /* 2π × 45 */
    var pct  = 1 - (remaining / duration);
    var off  = circ * (1 - pct);

    setHTML(
      '<div class="nz-page nz-fadein" style="max-width:480px;">' +
      '<div style="margin-bottom:20px;">' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
          'letter-spacing:-.4px;">⏱ Focus Timer</h1>' +
        '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
          'Pomodoro-style study sessions</p>' +
      '</div>' +

      /* Mode buttons */
      '<div style="display:flex;gap:8px;margin-bottom:30px;flex-wrap:wrap;">' +
        Object.keys(MODES).map(function (m) {
          var act = m === mode;
          return '<button onclick="nzTimerMode(\'' + m + '\')" ' +
            'style="padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;' +
            'font-family:inherit;cursor:pointer;transition:all .15s;' +
            'background:' + (act ? 'var(--primary)' : 'var(--card-elevated)') + ';' +
            'color:' + (act ? '#fff' : 'var(--muted-foreground)') + ';' +
            'border:1px solid ' + (act ? 'var(--primary)' : 'var(--border)') + ';">' +
            (m === 'focus' ? '🎯 Focus 25m' : m === 'short' ? '☕ Short 5m' : '🌿 Long 15m') +
            '</button>';
        }).join('') +
      '</div>' +

      /* SVG ring */
      '<div style="display:flex;justify-content:center;margin-bottom:30px;">' +
        '<div style="position:relative;width:180px;height:180px;">' +
          '<svg width="180" height="180" viewBox="0 0 100 100" ' +
            'style="transform:rotate(-90deg);">' +
            '<circle cx="50" cy="50" r="45" fill="none" stroke="var(--card-elevated)" ' +
              'stroke-width="6"/>' +
            '<circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" ' +
              'stroke-width="6" stroke-linecap="round" ' +
              'stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '" ' +
              'class="timer-ring"/>' +
          '</svg>' +
          '<div style="position:absolute;inset:0;display:flex;flex-direction:column;' +
            'align-items:center;justify-content:center;">' +
            '<span id="nz-timer-disp" style="font-size:38px;font-weight:800;' +
              'color:var(--foreground);font-variant-numeric:tabular-nums;' +
              'font-family:\'JetBrains Mono\',monospace;">' + fmt(remaining) + '</span>' +
            '<span style="font-size:12px;color:var(--muted-foreground);margin-top:4px;">' +
              (mode === 'focus' ? 'Focus Time' :
               mode === 'short' ? 'Short Break' : 'Long Break') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Controls */
      '<div style="display:flex;gap:10px;justify-content:center;">' +
        '<button id="nz-timer-start" onclick="nzTimerToggle()" class="nz-btn nz-btn-pri" ' +
          'style="min-width:110px;justify-content:center;">' +
          (running ? '⏸ Pause' : '▶ Start') + '</button>' +
        '<button onclick="nzTimerReset()" class="nz-btn nz-btn-ghost">↺ Reset</button>' +
      '</div>' +

      '</div>'
    );

    window.nzTimerMode = function (m) {
      mode = m; duration = MODES[m]; remaining = duration;
      running = false; clearInterval(interval); renderTimer();
    };
    window.nzTimerToggle = function () {
      running = !running;
      var btn = $id('nz-timer-start');
      if (btn) btn.textContent = running ? '⏸ Pause' : '▶ Start';
      if (running) {
        interval = setInterval(function () {
          remaining--;
          var disp = $id('nz-timer-disp');
          if (disp) disp.textContent = fmt(remaining);
          if (remaining <= 0) { clearInterval(interval); running = false; renderTimer(); }
        }, 1000);
      } else {
        clearInterval(interval);
      }
    };
    window.nzTimerReset = function () {
      clearInterval(interval); running = false; remaining = duration; renderTimer();
    };
  }

  renderTimer();
};

/* ────────────────────────────────────────────────────────────────
   PAGE: PROGRESS
──────────────────────────────────────────────────────────────── */
Pages.progress = function () {
  var d      = getUD();
  var tKanji = Object.values(kanjiData).reduce(function (s, a) { return s + a.length; }, 0);
  var tVocab = VocabPageWords.length;
  var tGram  = grammarPoints.length;

  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
        'letter-spacing:-.4px;">📊 Progress</h1>' +
      '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
        'Track your Japanese learning journey</p>' +
    '</div>' +

    /* Level & XP card */
    '<div class="nz-card" style="padding:22px;margin-bottom:15px;">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;' +
        'flex-wrap:wrap;">' +
        '<div style="width:56px;height:56px;border-radius:14px;' +
          'background:linear-gradient(135deg,var(--primary),#B02050);' +
          'display:flex;align-items:center;justify-content:center;' +
          'font-size:22px;font-weight:800;color:#fff;">' + (d.level || 1) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:18px;font-weight:800;color:var(--foreground);">' +
            'Level ' + (d.level || 1) + '</div>' +
          '<div style="font-size:13px;color:var(--muted-foreground);">' +
            (d.levelXP || 0) + ' / ' + (d.levelXPRequired || 200) +
            ' XP to next level</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          '<div style="font-size:24px;font-weight:800;color:var(--accent);">' +
            '🔥 ' + (d.streak || 1) + '</div>' +
          '<div style="font-size:11px;color:var(--muted-foreground);">Day Streak</div>' +
        '</div>' +
      '</div>' +
      progressRow('Level Progress', d.levelXP || 0, d.levelXPRequired || 200, 'var(--accent)') +
      progressRow('Daily XP Goal',  d.xp || 0,      d.xpGoal || 500,          'var(--primary)') +
    '</div>' +

    /* Content progress */
    '<h2 style="font-size:15px;font-weight:700;color:var(--foreground);' +
      'margin:0 0 12px;">Content Progress</h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));' +
      'gap:12px;margin-bottom:20px;">' +
      progressCard('漢 Kanji',     d.kanjiCount       || 0, tKanji, 'var(--jlpt-n4)') +
      progressCard('語 Vocabulary',d.vocabMastered    || 0, tVocab, 'var(--jlpt-n5)') +
      progressCard('文 Grammar',   d.lessonsCompleted || 0, tGram,  'var(--jlpt-n3)') +
    '</div>' +

    /* Kanji by JLPT */
    '<h2 style="font-size:15px;font-weight:700;color:var(--foreground);' +
      'margin:0 0 12px;">Kanji by JLPT Level</h2>' +
    '<div class="nz-card" style="padding:20px;">' +
      ['N5','N4','N3','N2','N1'].map(function (lv) {
        var c    = jlptColor(lv);
        var cnt  = (kanjiData[lv] || []).length;
        return '<div style="margin-bottom:13px;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
            '<span style="font-size:13px;font-weight:700;color:' + c + ';">' + lv + '</span>' +
            '<span style="font-size:12px;color:var(--muted-foreground);">' +
              cnt + ' characters</span>' +
          '</div>' +
          pctBar(cnt, cnt, c + '55', 6) +
          '</div>';
      }).join('') +
    '</div>' +

    '</div>'
  );
};

function progressRow(label, val, max, color) {
  var p = Math.min(100, Math.round(val / Math.max(max, 1) * 100));
  return '<div style="margin-bottom:11px;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
      '<span style="font-size:12px;color:var(--muted-foreground);">' + label + '</span>' +
      '<span style="font-size:12px;color:' + color + ';font-weight:700;">' +
        val + ' / ' + max + '</span>' +
    '</div>' +
    pctBar(val, max, color, 6) +
    '</div>';
}

function progressCard(label, val, max, color) {
  var p = Math.min(100, Math.round(val / Math.max(max, 1) * 100));
  return '<div class="nz-card" style="padding:18px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'margin-bottom:10px;">' +
      '<span style="font-size:13px;font-weight:700;color:var(--foreground);">' + label + '</span>' +
      '<span style="font-size:11px;color:' + color + ';font-weight:700;">' + p + '%</span>' +
    '</div>' +
    pctBar(val, max, color, 6) +
    '<div style="font-size:12px;color:var(--muted-foreground);margin-top:8px;">' +
      val + ' / ' + max + ' completed</div>' +
    '</div>';
}

/* ────────────────────────────────────────────────────────────────
   PAGE: PROFILE  (shows real Firebase auth + Firestore data)
──────────────────────────────────────────────────────────────── */
Pages.profile = function () {
  var u = getU(), d = getUD();
  var name   = d.displayName || u.displayName || 'Learner';
  var email  = d.email       || u.email       || '';
  var photo  = d.photoURL    || u.photoURL    || '';
  var phone  = d.phone       || u.phoneNumber || '';
  var uid    = u.uid || '';

  var providerId = (u.providerData && u.providerData[0] && u.providerData[0].providerId) || 'email';
  var providerLabel = {
    'google.com':   'Google',
    'facebook.com': 'Facebook',
    'phone':        'Phone',
    'password':     'Email / Password',
    'emailLink':    'Email Magic Link'
  }[providerId] || providerId;

  var created = '';
  try {
    if (d.createdAt && typeof d.createdAt.toDate === 'function')
      created = d.createdAt.toDate().toLocaleDateString();
  } catch (e) {}

  var ava = makeAvatar(photo, name, 80, 32);

  setHTML(
    '<div class="nz-page nz-fadein" style="max-width:540px;">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--foreground);margin:0 0 4px;' +
        'letter-spacing:-.4px;">👤 Profile</h1>' +
      '<p style="font-size:13px;color:var(--muted-foreground);margin:0;">' +
        'Your account and learning statistics</p>' +
    '</div>' +

    /* Avatar + identity */
    '<div class="nz-card" style="padding:24px;margin-bottom:14px;display:flex;' +
      'align-items:center;gap:20px;flex-wrap:wrap;">' +
      ava +
      '<div>' +
        '<div style="font-size:20px;font-weight:800;color:var(--foreground);' +
          'margin-bottom:4px;">' + H(name) + '</div>' +
        '<div style="font-size:13px;color:var(--muted-foreground);' +
          'margin-bottom:9px;">' + H(email) + '</div>' +
        '<span style="display:inline-flex;align-items:center;gap:6px;' +
          'padding:3px 10px;border-radius:20px;' +
          'background:var(--primary-dim);border:1px solid var(--primary);' +
          'font-size:11px;font-weight:700;color:var(--primary);">' +
          'Signed in with ' + H(providerLabel) +
        '</span>' +
      '</div>' +
    '</div>' +

    /* Account details */
    '<div class="nz-card" style="padding:20px;margin-bottom:14px;">' +
      '<h3 style="font-size:13px;font-weight:700;color:var(--foreground);' +
        'margin:0 0 12px;">Account Details</h3>' +
      profileRow('Display Name',   name,          false) +
      profileRow('Email',          email  || '—', false) +
      profileRow('Phone',          phone  || '—', false) +
      profileRow('User ID',        uid    || '—', true)  +
      profileRow('Sign-in Method', providerLabel, false) +
      profileRow('Member Since',   created || '—',false) +
    '</div>' +

    /* Learning stats */
    '<div class="nz-card" style="padding:20px;margin-bottom:15px;">' +
      '<h3 style="font-size:13px;font-weight:700;color:var(--foreground);' +
        'margin:0 0 12px;">Learning Stats</h3>' +
      profileRow('Level',          'Level '+(d.level||1),         false) +
      profileRow('Total XP',       (d.xp||0)+' XP',               false) +
      profileRow('Daily Streak',   (d.streak||1)+' days 🔥',       false) +
      profileRow('Kanji Learned',  (d.kanjiCount||0)+' characters',false) +
      profileRow('Vocab Mastered', (d.vocabMastered||0)+' words',  false) +
      profileRow('Quiz Accuracy',  (d.quizAccuracy||0)+'%',        false) +
    '</div>' +

    '<button onclick="window._nzSignOut && window._nzSignOut()" class="nz-btn" ' +
      'style="width:100%;justify-content:center;' +
      'background:var(--primary-dim);color:var(--primary);' +
      'border:1px solid var(--primary);">← Sign Out</button>' +

    '</div>'
  );
};

function profileRow(label, val, mono) {
  return '<div style="display:flex;justify-content:space-between;align-items:center;' +
    'padding:11px 0;border-bottom:1px solid var(--border);">' +
    '<span style="font-size:13px;color:var(--muted-foreground);">' + label + '</span>' +
    '<span style="font-size:' + (mono ? '11px' : '13px') + ';font-weight:600;' +
      'color:var(--foreground);' +
      (mono ? 'font-family:\'JetBrains Mono\',monospace;word-break:break-all;' +
              'text-align:right;max-width:210px;' : '') + '">' +
      H(val) + '</span>' +
    '</div>';
}

/* ────────────────────────────────────────────────────────────────
   SHARED HTML HELPERS
──────────────────────────────────────────────────────────────── */
function backBtn(fn, label) {
  return '<button onclick="' + fn + '()" ' +
    'style="display:flex;align-items:center;gap:6px;background:none;border:none;' +
    'color:var(--muted-foreground);cursor:pointer;font-size:13px;font-weight:600;' +
    'font-family:inherit;padding:0;margin-bottom:20px;" ' +
    'onmouseover="this.style.color=\'var(--foreground)\'" ' +
    'onmouseout="this.style.color=\'var(--muted-foreground)\'">← ' + label + '</button>';
}

function lvBadge(color, lv) {
  return '<span style="font-size:10px;font-weight:800;color:' + color + ';' +
    'background:' + color + '18;border:1px solid ' + color + ';' +
    'padding:3px 10px;border-radius:6px;font-family:\'JetBrains Mono\',monospace;' +
    'flex-shrink:0;">' + lv + '</span>';
}

function phraseCard(p) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;' +
    'padding:11px;border-radius:10px;background:var(--card-elevated);' +
    'border:1px solid var(--border);">' +
    '<div>' +
      '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;font-weight:700;' +
        'color:var(--foreground);margin:0 0 2px;">' + H(p.jp) + '</p>' +
      '<p style="font-size:11px;color:var(--muted-foreground);margin:0;">' + H(p.en) + '</p>' +
    '</div>' +
    '<button onclick="speak(\'' + H(p.jp) + '\')" ' +
      'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
      'font-size:14px;padding:2px 4px;">🔊</button>' +
    '</div>';
}

function quizBlock(quiz, answers, showResults, score, ansFn, checkFn, retryFn) {
  var allAnswered = Object.keys(answers).length >= quiz.length;
  return '<div class="nz-card" style="padding:20px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'margin-bottom:15px;">' +
      '<h3 style="font-size:13px;font-weight:700;color:var(--foreground);' +
        'margin:0;">Comprehension Quiz</h3>' +
      (showResults
        ? '<span style="font-size:13px;font-weight:700;color:' +
          (score === quiz.length ? 'var(--jlpt-n5)' : 'var(--primary)') + ';">' +
          score + '/' + quiz.length + ' correct</span>'
        : '') +
    '</div>' +
    quiz.map(function (q) {
      return '<div style="margin-bottom:15px;">' +
        '<p style="font-size:13px;font-weight:700;color:var(--foreground);' +
          'margin:0 0 9px;">' + H(q.question) + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
          q.options.map(function (opt, i) {
            var chosen  = answers[q.id] === i;
            var correct = i === q.answer;
            var bg = 'var(--card-elevated)', bc = 'var(--border)', cl = 'var(--foreground)';
            if (showResults && correct)            { bg = 'var(--jlpt-n5-dim)'; bc = 'var(--jlpt-n5)'; cl = 'var(--jlpt-n5)'; }
            if (showResults && chosen && !correct) { bg = 'var(--primary-dim)'; bc = 'var(--primary)'; cl = 'var(--primary)'; }
            else if (!showResults && chosen)       { bg = 'var(--primary-dim)'; bc = 'var(--primary)'; cl = 'var(--primary)'; }
            var icon = '';
            if (showResults && chosen && correct)  icon = '✅ ';
            else if (showResults && chosen)        icon = '❌ ';
            else if (showResults && correct)       icon = '✅ ';
            return '<button class="q-opt" ' +
              (showResults ? 'disabled ' : 'onclick="' + ansFn + '(\'' + q.id + '\',' + i + ')" ') +
              'style="background:' + bg + ';border-color:' + bc + ';color:' + cl + ';' +
              'cursor:' + (showResults ? 'default' : 'pointer') + ';">' +
              icon + H(opt) + '</button>';
          }).join('') +
        '</div></div>';
    }).join('') +
    (!showResults
      ? '<button onclick="' + checkFn + '()" class="nz-btn nz-btn-pri" ' +
        'style="width:100%;justify-content:center;margin-top:4px;" ' +
        (allAnswered ? '' : 'disabled') + '>' +
        'Check Answers</button>'
      : '<button onclick="' + retryFn + '()" class="nz-btn nz-btn-ghost" ' +
        'style="width:100%;justify-content:center;margin-top:4px;">Try Again</button>') +
    '</div>';
}

/* ────────────────────────────────────────────────────────────────
   ASYNC SPEECH HELPER  (used by Play Dialogue / Read Aloud)
──────────────────────────────────────────────────────────────── */
function speakAsync(text, rate, pauseAfter) {
  return new Promise(function (resolve) {
    if (!window.speechSynthesis || !text) { setTimeout(resolve, pauseAfter || 500); return; }
    window.speechSynthesis.cancel();
    var u  = new SpeechSynthesisUtterance(String(text));
    u.lang = 'ja-JP';
    u.rate = rate || 0.82;
    u.onend  = function () { setTimeout(resolve, pauseAfter || 600); };
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

/* ────────────────────────────────────────────────────────────────
   EXPORTS
──────────────────────────────────────────────────────────────── */
window.Router      = Router;
window.Pages       = Pages;
window.renderShell = renderShell;
window.speak       = speak;
