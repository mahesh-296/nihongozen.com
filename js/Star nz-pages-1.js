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
  return { N5: 'var(--n5)', N4: 'var(--n4)', N3: 'var(--n3)',
           N2: 'var(--n2)', N1: 'var(--n1)' }[lv] || 'var(--primary)';
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
  return '<div class="progress-track" style="height:' + height + 'px;">' +
    '<div class="progress-fill nz-barfi" style="width:' + p + '%;height:' + height + 'px;background:' + color + ';"></div></div>';
}

/* ────────────────────────────────────────────────────────────────
   ROUTER
──────────────────────────────────────────────────────────────── */
var NzRouter = (function () {
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
          'color:var(--fg-muted);">Page not found.</div>');
      }
    }
  };
}());

/* ────────────────────────────────────────────────────────────────
   STYLES  (injected once into <head>)
──────────────────────────────────────────────────────────────── */
var NZ_CSS = `
/* ── Shell structure ── */
#nz-sb {
  position: fixed; top: 0; left: 0; bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  z-index: 200; overflow-y: auto; overflow-x: hidden;
  transition: transform .28s var(--ease);
}
#nz-main {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  background: var(--bg);
}
#nz-topbar {
  display: none;
  position: sticky; top: 0; z-index: 100;
  height: var(--topbar-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
}
#nz-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,.7);
  z-index: 199;
}
@media (max-width: 1024px) {
  #nz-sb { transform: translateX(-100%); }
  #nz-sb.open { transform: translateX(0); }
  #nz-main { margin-left: 0 !important; }
  #nz-topbar { display: flex !important; }
  #nz-overlay.open { display: block !important; }
}

/* ── Sidebar logo ── */
.nz-sb-top {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.nz-logomark {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary), #B02050);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-jp); font-size: 14px;
  color: #fff; font-weight: 700;
  box-shadow: 0 0 18px rgba(232,68,106,.3);
}
.nz-logoname {
  font-weight: 700; font-size: 15px;
  color: var(--fg); letter-spacing: -.3px;
}

/* ── Sidebar user card ── */
.nz-sb-user {
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.nz-sb-uname {
  font-size: 13px; font-weight: 700; color: var(--fg);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nz-sb-uemail {
  font-size: 11px; color: var(--fg-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 1px;
}
.nz-sb-stats3 {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 7px; margin-top: 12px;
}
.nz-sb-stat {
  background: var(--card-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 4px; text-align: center;
}
.nz-sb-stat-v {
  font-size: 12px; font-weight: 800;
  font-family: var(--font-mono); display: block;
}
.nz-sb-stat-l {
  font-size: 9px; color: var(--fg-muted);
  display: block; margin-top: 1px;
}

/* ── Sidebar nav ── */
.nz-sb-nav { padding: 8px; flex: 1; }
.nz-sb-sect {
  font-size: 10px; font-weight: 600; color: var(--fg-subtle);
  text-transform: uppercase; letter-spacing: .1em;
  padding: 12px 10px 5px;
  font-family: var(--font-mono); display: block;
}
.nz-navlink {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: var(--radius);
  text-decoration: none; margin-bottom: 2px;
  transition: background var(--duration-fast) var(--ease);
  border-left: 2px solid transparent;
}
.nz-navlink:hover { background: var(--card-elevated); }
.nz-navlink.nz-active {
  background: var(--primary-dim);
  border-left-color: var(--primary);
}
.nz-navlink.nz-active .nz-navlabel { color: var(--primary) !important; }
.nz-navicon {
  font-size: 16px; line-height: 1; width: 20px;
  text-align: center; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.nz-navlabel { font-size: 13px; font-weight: 500; color: var(--fg-muted); }
.nz-jbadge {
  font-size: 10px; font-weight: 700;
  padding: 2px 6px; border-radius: 4px;
  font-family: var(--font-mono); flex-shrink: 0;
}

/* ── Sidebar footer ── */
.nz-sb-foot {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.nz-signout-btn {
  width: 100%; padding: 8px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: transparent; color: var(--fg-muted);
  font-size: 12px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all var(--duration-fast);
}
.nz-signout-btn:hover { background: var(--card-elevated); color: var(--fg); }
.nz-menu-btn {
  background: none; border: none;
  color: var(--fg); cursor: pointer;
  font-size: 20px; padding: 4px;
}

/* ── Page wrapper ── */
.nz-page {
  max-width: 1200px; margin: 0 auto;
  padding: 28px 28px 48px;
}
@media (max-width: 768px) { .nz-page { padding: 18px 16px 48px; } }
.nz-fadein { opacity: 0; animation: fadeUp .35s var(--ease) forwards; }

/* ── Buttons ── */
.nz-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: var(--radius);
  border: none; font-size: 13px; font-weight: 600;
  font-family: inherit; cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
  white-space: nowrap;
}
.nz-btn:active { transform: scale(.97); }
.nz-btn:disabled { opacity: .45; cursor: not-allowed; pointer-events: none; }
.nz-btn-pri { background: var(--primary); color: #fff; }
.nz-btn-pri:hover { background: var(--primary-hover); }
.nz-btn-ghost {
  background: var(--card-elevated); color: var(--fg);
  border: 1px solid var(--border);
}
.nz-btn-ghost:hover { border-color: var(--primary); color: var(--primary); }

/* ── Stat + module cards ── */
.nz-stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 16px;
  display: flex; align-items: center; gap: 13px;
  transition: transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
}
.nz-stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.nz-mod-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
  cursor: pointer;
  transition: transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease), border-color var(--duration) var(--ease);
}
.nz-mod-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--border-strong); }

/* ── XP card ── */
.nz-xp-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 22px;
  margin-bottom: 18px;
}
.nz-xp-row {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 10px;
}

/* ── Kanji grid ── */
.kj-cell {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 12px 6px;
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  cursor: pointer; position: relative;
  transition: all var(--duration-fast) var(--ease);
}
.kj-cell:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: 0 4px 20px rgba(232,68,106,.2);
  background: var(--card-elevated);
}

/* ── Grammar accordion ── */
.gr-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); overflow: hidden;
  margin-bottom: 10px;
  transition: border-color var(--duration-fast);
}
.gr-card:hover { border-color: var(--border-strong); }
.gr-toggle {
  width: 100%; display: flex; align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: none; border: none; cursor: pointer;
  text-align: left;
  transition: background var(--duration-fast) var(--ease);
  gap: 12px;
}
.gr-toggle:hover { background: var(--card-elevated); }
.gr-body {
  padding: 0 20px 22px;
  border-top: 1px solid var(--border);
  background: var(--card);
}
.gr-example-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 13px 14px; border-radius: var(--radius);
  background: var(--card-elevated); border: 1px solid var(--border);
}

/* ── Script / reading lines ── */
.sc-line {
  display: flex; gap: 10px; padding: 13px;
  border-radius: var(--radius);
  background: var(--card-elevated);
  border-left: 3px solid transparent;
  transition: all var(--duration) var(--ease);
}
.sc-line.active {
  background: var(--primary-dim);
  border-left-color: var(--primary);
}

/* ── Quiz options ── */
.q-opt {
  padding: 11px 14px; border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--card-elevated); color: var(--fg);
  font-size: 12px; font-weight: 500; font-family: inherit;
  cursor: pointer; text-align: left;
  display: flex; align-items: center; gap: 7px;
  transition: all var(--duration-fast) var(--ease); width: 100%;
  line-height: 1.4;
}
.q-opt:not([disabled]):hover { border-color: var(--primary); color: var(--primary); background: var(--primary-dim); }

/* ── Kanji / detail modal ── */
.nz-overlay-bg {
  position: fixed; inset: 0; z-index: 900;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; background: rgba(0,0,0,.85);
  animation: fadeIn var(--duration-fast) var(--ease);
}
.nz-modal-box {
  background: var(--card); border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl); padding: 26px;
  width: 100%; max-width: 420px; position: relative;
  animation: slideUp var(--duration) var(--ease);
  max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-xl);
}
.nz-cardu {
  background: var(--card-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

/* ── Timer ring ── */
.timer-ring { transition: stroke-dashoffset .9s var(--ease); }

/* ── Progress bars ── */
.nz-bartr {
  background: var(--card-elevated);
  border-radius: 99px; overflow: hidden;
}
.nz-barfi { height: 100%; border-radius: 99px; transition: width 1s var(--ease); }

/* ── Hoverable ── */
.nz-hoverable {
  transition: transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
  cursor: pointer;
}
.nz-hoverable:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
`;

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
            '<span class="nz-sb-stat-v" style="color:var(--fg)">Lv.' + level + '</span>' +
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
            'color:var(--fg);">NihongoZen</span>' +
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
    s.textContent = NZ_CSS;
    document.head.appendChild(s);
  }

  /* Single delegated nav-click handler */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-route]');
    if (!el) return;
    e.preventDefault();
    if (window.innerWidth < 769) nzToggleSidebar();
    NzRouter.go(el.dataset.route);
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
        '<h1 style="font-size:24px;font-weight:800;color:var(--fg);margin:0 0 5px;' +
          'letter-spacing:-.5px;">Welcome back, ' + H(name) + ' 👋</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
          'Level ' + level + ' · ' + xp + ' XP · ' + streak + ' day streak 🔥</p>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="nz-btn nz-btn-pri" onclick="window.Router.go(\'kanji\')">漢 Study Kanji</button>' +
        '<button class="nz-btn nz-btn-ghost" onclick="window.Router.go(\'vocab\')">語 Vocabulary</button>' +
      '</div>' +
    '</div>' +

    /* XP card */
    '<div class="nz-xp-card">' +
      '<div class="nz-xp-row">' +
        '<span style="font-size:14px;font-weight:700;color:var(--fg);">Daily XP Goal</span>' +
        '<span style="font-size:13px;font-family:var(--font-mono);color:var(--primary);font-weight:700;">' + xp + ' <span style="color:var(--fg-subtle);font-weight:400;">/ ' + xpGoal + ' XP</span></span>' +
      '</div>' +
      pctBar(xp, xpGoal, 'linear-gradient(90deg, var(--primary), #F05578)', 10) +
      '<div style="margin-top:16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
          '<span style="font-size:11px;color:var(--fg-muted);">Level ' + level + ' progress</span>' +
          '<span style="font-size:11px;font-family:var(--font-mono);color:var(--accent);font-weight:700;">' + lvXP + ' / ' + lvReq + ' XP</span>' +
        '</div>' +
        pctBar(lvXP, lvReq, 'var(--accent)', 6) +
      '</div>' +
    '</div>' +

    /* Stats grid */
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));' +
      'gap:11px;margin-bottom:24px;">' +
      dashStat('🔥', 'Streak',   streak + ' days',           'var(--accent)') +
      dashStat('漢', 'Kanji',    (d.kanjiCount||0)+'/'+tKanji,'var(--n4)') +
      dashStat('語', 'Vocab',    (d.vocabMastered||0)+'/'+tVocab,'var(--n5)') +
      dashStat('📝', 'Lessons',  (d.lessonsCompleted||0)+' done','var(--n3)') +
      dashStat('🎯', 'Accuracy', (d.quizAccuracy||0)+'%',    'var(--n2)') +
      dashStat('文', 'Grammar',  tGram+' patterns',           'var(--n1)') +
    '</div>' +

    /* Study modules */
    '<h2 style="font-size:15px;font-weight:700;color:var(--fg);margin:0 0 13px;">' +
      'Study Modules</h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));' +
      'gap:11px;margin-bottom:24px;">' +
      dashMod('漢','Kanji',    'kanji',    tKanji+' characters · N5–N1', 'var(--n4)') +
      dashMod('語','Vocabulary','vocab',   tVocab+' words · 77 categories','var(--n5)') +
      dashMod('文','Grammar',  'grammar',  tGram+' patterns · N5–N3',   'var(--n3)') +
      dashMod('🎧','Listening','listening',dialogues.length+' dialogues','var(--n2)') +
      dashMod('📖','Reading',  'reading',  passages.length+' passages',  'var(--n1)') +
      dashMod('あ','Kana Chart','kana',    'Hiragana · Katakana · Combinations','var(--primary)') +
    '</div>' +

    /* JLPT buttons */
    '<h2 style="font-size:15px;font-weight:700;color:var(--fg);margin:0 0 13px;">' +
      'JLPT Practice</h2>' +
    '<div style="display:flex;gap:9px;flex-wrap:wrap;">' +
      ['N5','N4','N3','N2','N1'].map(function (lv) {
        var c  = jlptColor(lv);
        var lb = {N5:'Beginner',N4:'Elementary',N3:'Intermediate',
                  N2:'Upper-Int.',N1:'Advanced'}[lv];
        return '<button class="nz-btn" onclick="window.Router.go(\'jlpt-' + lv.toLowerCase() + '\')" ' +
          'style="background:' + c + '18;color:' + c + ';border:1px solid ' + c + ';' +
          'font-weight:800;">' + lv + ' — ' + lb + '</button>';
      }).join('') +
    '</div>' +

    '</div>'
  );
};

function dashStat(icon, label, value, color) {
  return '<div class="card nz-stat-card">' +
    '<div style="width:40px;height:40px;border-radius:var(--radius);background:' + color + '18;' +
      'border:1px solid ' + color + '40;display:flex;align-items:center;justify-content:center;' +
      'font-size:17px;font-family:var(--font-jp);color:' + color + ';flex-shrink:0;">' +
      icon + '</div>' +
    '<div>' +
      '<div style="font-size:17px;font-weight:700;color:var(--fg);letter-spacing:-.3px;font-family:var(--font-mono);">' +
        value + '</div>' +
      '<div class="text-muted" style="font-size:11px;margin-top:1px;">' +
        label + '</div>' +
    '</div>' +
    '</div>';
}

function dashMod(icon, title, route, sub, color) {
  return '<div class="card nz-mod-card" style="border-top:3px solid ' +
    color + ';" onclick="window.Router.go(\'' + route + '\')">' +
    '<div style="font-size:26px;color:' + color + ';font-family:var(--font-jp);margin-bottom:10px;">' + icon + '</div>' +
    '<div style="font-size:15px;font-weight:600;color:var(--fg);margin-bottom:4px;">' +
      title + '</div>' +
    '<div class="text-muted" style="font-size:12px;">' + sub + '</div>' +
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
          'color:var(--fg-muted);text-align:center;">' +
          H(k.reading.split('・')[0]) + '</span>' +
        '<span style="font-size:9px;color:var(--fg-subtle);text-align:center;">' +
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
          'color:var(--fg-muted);cursor:pointer;font-size:22px;line-height:1;">×</button>' +

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
              'color:var(--fg-muted);margin:0 0 4px;">' + H(k.reading) + '</p>' +
            '<p style="font-size:14px;font-weight:700;color:var(--fg);margin:0;">' +
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
            '<span style="font-size:10px;color:var(--fg-muted);' +
              'text-transform:uppercase;letter-spacing:.06em;">Example</span>' +
            '<button onclick="speak(\'' + H(k.example) + '\')" ' +
              'style="background:none;border:none;cursor:pointer;font-size:12px;' +
              'color:var(--primary);">🔊 Read aloud</button>' +
          '</div>' +
          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:14px;' +
            'color:var(--fg);margin:0 0 4px;">' + H(k.example) + '</p>' +
          '<p style="font-size:12px;color:var(--fg-muted);font-style:italic;margin:0;">' +
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
        '<span style="font-size:10px;color:var(--fg-muted);">' + label + '</span>' +
        (canSpeak && val && val !== '—'
          ? '<button onclick="speak(\'' + H(val) + '\')" ' +
            'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
            'font-size:11px;">🔊</button>'
          : '') +
      '</div>' +
      '<span style="font-family:\'JetBrains Mono\',monospace;font-size:12px;' +
        'color:var(--fg);">' + H(val) + '</span>' +
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
      btn.style.color        = act ? c : 'var(--fg-muted)';
      btn.style.borderBottom = act ? '2px solid ' + c : '2px solid transparent';
    });
    renderGrid();
  }

  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
        'letter-spacing:-.4px;">漢字 Kanji Study</h1>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
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
            'color:' + (act ? c : 'var(--fg-muted)') + ';' +
            'transition:all .15s;">' + t + '</button>';
        }).join('') +
      '</div>' +

      '<div style="position:relative;flex:1;max-width:270px;">' +
        '<span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);' +
          'color:var(--fg-muted);font-size:13px;pointer-events:none;">🔍</span>' +
        '<input id="kj-search" type="text" placeholder="Search kanji, meaning…" ' +
          'oninput="nzKanjiSearch(this.value)" ' +
          'style="width:100%;padding:10px 14px 10px 34px;border-radius:10px;' +
          'border:1px solid var(--border);background:var(--card);color:var(--fg);' +
          'font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;" ' +
          'onfocus="this.style.borderColor=\'var(--primary)\'" ' +
          'onblur="this.style.borderColor=\'var(--border)\'">' +
      '</div>' +
      '<span id="kj-cnt" style="font-size:12px;color:var(--fg-muted);' +
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
      '<div style="padding:40px;text-align:center;color:var(--fg-muted);">' +
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
            '<p style="font-size:13px;color:var(--fg-muted);line-height:1.7;' +
              'margin:18px 0 14px;">' + H(g.explanation) + '</p>' +
            '<div style="background:var(--bg-secondary);border:1px solid var(--border);' +
              'border-radius:var(--radius);padding:14px 16px;margin-bottom:16px;">' +
              '<p style="font-size:10px;font-weight:700;color:var(--fg-subtle);' +
                'text-transform:uppercase;letter-spacing:.1em;margin:0 0 7px;' +
                'font-family:var(--font-mono);">Structure</p>' +
              '<p style="font-family:var(--font-mono);font-size:14px;' +
                'color:var(--primary);margin:0;letter-spacing:.01em;">' + H(g.structure) + '</p>' +
            '</div>' +
            '<p style="font-size:10px;font-weight:700;color:var(--fg-subtle);' +
              'text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px;' +
              'font-family:var(--font-mono);">Examples</p>' +
            '<div style="display:flex;flex-direction:column;gap:9px;">' +
              g.examples.map(function (ex) {
                return '<div class="gr-example-row">' +
                  '<div style="flex:1;min-width:0;">' +
                    '<p style="font-family:var(--font-jp-sans);font-size:14px;' +
                      'color:var(--fg);margin:0 0 4px;line-height:1.6;">' + H(ex.jp) + '</p>' +
                    '<p style="font-size:12px;color:var(--fg-muted);' +
                      'font-style:italic;margin:0;">' + H(ex.en) + '</p>' +
                  '</div>' +
                  '<button onclick="speak(\'' + H(ex.jp) + '\')" ' +
                    'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                    'font-size:15px;flex-shrink:0;padding:3px 5px;opacity:.8;' +
                    'transition:opacity .15s;" onmouseover="this.style.opacity=1" ' +
                    'onmouseout="this.style.opacity=.8">🔊</button>' +
                  '</div>';
              }).join('') +
            '</div>' +
          '</div>';
      }

      return '<div class="gr-card">' +
        '<button class="gr-toggle" data-gid="' + g.id + '">' +
          '<div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">' +
            '<span class="badge badge-' + g.level.toLowerCase() + '" ' +
              'style="flex-shrink:0;">' + H(g.level) + '</span>' +
            '<div style="min-width:0;">' +
              '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:16px;' +
                  'font-weight:700;color:var(--fg);">' + H(g.pattern) + '</span>' +
                '<button onclick="event.stopPropagation();speak(\'' + H(g.pattern) + '\')" ' +
                  'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
                  'font-size:13px;padding:2px 4px;flex-shrink:0;">🔊</button>' +
              '</div>' +
              '<p style="font-size:12px;color:var(--fg-muted);margin:3px 0 0;">' +
                H(g.title) + '</p>' +
            '</div>' +
          '</div>' +
          '<span style="color:var(--fg-subtle);font-size:13px;flex-shrink:0;margin-left:8px;">' +
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
      btn.style.color       = act ? (l === 'All' ? '#fff' : c) : 'var(--fg-muted)';
      btn.style.borderColor = act ? (l === 'All' ? 'var(--primary)' : c) : 'var(--border)';
    });
    renderCards();
  }

  setHTML(
    '<div class="nz-page nz-fadein">' +
    '<div style="margin-bottom:20px;">' +
      '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
        'letter-spacing:-.4px;">文法 Grammar</h1>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
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
          'color:' + (act ? '#fff' : 'var(--fg-muted)') + ';' +
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
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
          'letter-spacing:-.4px;">聴解 Listening</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
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
              '<span style="font-size:11px;color:var(--fg-muted);">' +
                dlg.lineCount + ' lines</span>' +
            '</div>' +
            '<h3 style="font-size:15px;font-weight:700;color:var(--fg);' +
              'margin:0 0 3px;">' + H(dlg.topic) + '</h3>' +
            '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
              'color:var(--fg-muted);margin:0 0 7px;">' + H(dlg.topicJp) + '</p>' +
            '<p style="font-size:12px;color:var(--fg-subtle);margin:0 0 15px;">' +
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
          '<h1 style="font-size:20px;font-weight:800;color:var(--fg);margin:0 0 2px;">' +
            H(dlg.topic) + '</h1>' +
          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
            'color:var(--fg-muted);margin:0;">' + H(dlg.topicJp) + '</p>' +
        '</div>' +
      '</div>' +

      /* Script card */
      '<div class="card" style="padding:20px;margin-bottom:13px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;' +
          'margin-bottom:15px;">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:32px;height:32px;border-radius:8px;' +
              'background:var(--primary-dim);display:flex;align-items:center;' +
              'justify-content:center;font-size:15px;">🎙️</div>' +
            '<div>' +
              '<p style="font-size:13px;font-weight:700;color:var(--fg);margin:0;">' +
                'Dialogue Script</p>' +
              '<p style="font-size:11px;color:var(--fg-muted);margin:0;">' +
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
                  'color:var(--fg-muted);">' + H(ln.speaker) + '</span>' +
              '</div>' +
              '<div style="flex:1;min-width:0;">' +
                '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:13px;' +
                  'color:var(--fg);margin:0 0 3px;">' + H(ln.jp) + '</p>' +
                '<p style="font-size:12px;color:var(--fg-muted);' +
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
      '<div class="card" style="padding:20px;margin-bottom:13px;">' +
        '<h3 style="font-size:13px;font-weight:700;color:var(--fg);' +
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
      if (btn) { btn.textContent = '⏹ Stop'; btn.style.background = 'var(--n3)'; }

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
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
          'letter-spacing:-.4px;">読解 Reading</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
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
              '<span style="font-size:11px;color:var(--fg-muted);">' +
                p.wordCount + ' words</span>' +
            '</div>' +
            '<h3 style="font-size:15px;font-weight:700;color:var(--fg);' +
              'margin:0 0 3px;">' + H(p.title) + '</h3>' +
            '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
              'color:var(--fg-muted);margin:0 0 7px;">' + H(p.titleJp) + '</p>' +
            '<p style="font-size:12px;color:var(--fg-subtle);margin:0 0 15px;">' +
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
          '<h1 style="font-size:20px;font-weight:800;color:var(--fg);margin:0 0 2px;">' +
            H(p.title) + '</h1>' +
          '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:12px;' +
            'color:var(--fg-muted);margin:0;">' + H(p.titleJp) + '</p>' +
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
      '<div class="card" style="padding:20px;margin-bottom:13px;">' +
        p.lines.map(function (ln) {
          var vis = showAllTrans || visLines.has(ln.id);
          return '<div id="rd-' + H(ln.id) + '" ' +
            'style="display:flex;gap:10px;padding:12px;border-radius:10px;' +
            'margin-bottom:6px;border-left:3px solid transparent;transition:all .2s;">' +
            '<div style="flex:1;">' +
              '<p style="font-family:\'Noto Sans JP\',sans-serif;font-size:15px;' +
                'color:var(--fg);line-height:1.7;margin:0 0 3px;">' +
                H(ln.jp) + '</p>' +
              (vis ? '<p style="font-size:12px;color:var(--fg-muted);' +
                'font-style:italic;margin:0;">' + H(ln.en) + '</p>' : '') +
            '</div>' +
            '<div style="display:flex;gap:3px;flex-shrink:0;margin-top:2px;">' +
              '<button onclick="nzRdToggleLine(\'' + H(ln.id) + '\')" ' +
                'style="background:none;border:none;cursor:pointer;' +
                'color:var(--fg-muted);font-size:13px;padding:3px 5px;" ' +
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
      '<div class="card" style="padding:20px;margin-bottom:13px;">' +
        '<h3 style="font-size:13px;font-weight:700;color:var(--fg);' +
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
                'font-weight:700;color:var(--fg);">' + H(v.jp) + '</span>' +
              '<span style="font-size:11px;color:var(--fg-muted);">' +
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
      if (btn) { btn.textContent = '⏹ Stop'; btn.style.background = 'var(--n3)'; }

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
      '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
        'letter-spacing:-.4px;">かな Kana Chart</h1>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
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
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);' +
          'margin:0;letter-spacing:-.4px;">JLPT ' + lv + ' Practice</h1>' +
      '</div>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' + H(desc) + '</p>' +
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
      '<h2 style="font-size:15px;font-weight:700;color:var(--fg);' +
        'margin:0 0 11px;">Kanji Preview</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:22px;">' +
        kList.slice(0, 32).map(function (k) {
          return '<button onclick="window.Router.go(\'kanji\')" ' +
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
            '<span style="font-size:8px;color:var(--fg-muted);">' +
              H(k.reading.split('・')[0]) + '</span>' +
            '</button>';
        }).join('') +
        (kList.length > 32
          ? '<button onclick="window.Router.go(\'kanji\')" ' +
            'style="width:50px;height:50px;border-radius:10px;background:var(--card);' +
            'border:1px dashed var(--border);cursor:pointer;font-size:11px;' +
            'color:var(--fg-muted);">+' + (kList.length - 32) + '</button>'
          : '') +
      '</div>'
    : '') +

    /* Grammar preview */
    (gList.length ?
      '<h2 style="font-size:15px;font-weight:700;color:var(--fg);' +
        'margin:0 0 11px;">Grammar Patterns</h2>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:22px;">' +
        gList.map(function (g) {
          return '<div style="display:flex;align-items:center;gap:12px;padding:13px 16px;' +
            'border-radius:10px;background:var(--card);border:1px solid var(--border);' +
            'cursor:pointer;transition:all .15s;" ' +
            'onclick="window.Router.go(\'grammar\')" ' +
            'onmouseover="this.style.borderColor=\'' + color + '\'" ' +
            'onmouseout="this.style.borderColor=\'var(--border)\'">' +
            '<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:15px;' +
              'font-weight:700;color:' + color + ';">' + H(g.pattern) + '</span>' +
            '<span style="font-size:12px;color:var(--fg-muted);flex:1;">' +
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
    'onclick="window.Router.go(\'' + route + '\')">' +
    '<div style="font-size:26px;color:' + color + ';font-family:\'Noto Serif JP\',serif;' +
      'margin-bottom:9px;">' + icon + '</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--fg);' +
      'margin-bottom:4px;">' + title + '</div>' +
    '<div style="font-size:12px;color:var(--fg-muted);">' + sub + '</div>' +
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
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
          'letter-spacing:-.4px;">⏱ Focus Timer</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
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
            'color:' + (act ? '#fff' : 'var(--fg-muted)') + ';' +
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
              'color:var(--fg);font-variant-numeric:tabular-nums;' +
              'font-family:\'JetBrains Mono\',monospace;">' + fmt(remaining) + '</span>' +
            '<span style="font-size:12px;color:var(--fg-muted);margin-top:4px;">' +
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
      '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
        'letter-spacing:-.4px;">📊 Progress</h1>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
        'Track your Japanese learning journey</p>' +
    '</div>' +

    /* Level & XP card */
    '<div class="card" style="padding:22px;margin-bottom:15px;">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;' +
        'flex-wrap:wrap;">' +
        '<div style="width:56px;height:56px;border-radius:14px;' +
          'background:linear-gradient(135deg,var(--primary),#B02050);' +
          'display:flex;align-items:center;justify-content:center;' +
          'font-size:22px;font-weight:800;color:#fff;">' + (d.level || 1) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:18px;font-weight:800;color:var(--fg);">' +
            'Level ' + (d.level || 1) + '</div>' +
          '<div style="font-size:13px;color:var(--fg-muted);">' +
            (d.levelXP || 0) + ' / ' + (d.levelXPRequired || 200) +
            ' XP to next level</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          '<div style="font-size:24px;font-weight:800;color:var(--accent);">' +
            '🔥 ' + (d.streak || 1) + '</div>' +
          '<div style="font-size:11px;color:var(--fg-muted);">Day Streak</div>' +
        '</div>' +
      '</div>' +
      progressRow('Level Progress', d.levelXP || 0, d.levelXPRequired || 200, 'var(--accent)') +
      progressRow('Daily XP Goal',  d.xp || 0,      d.xpGoal || 500,          'var(--primary)') +
    '</div>' +

    /* Content progress */
    '<h2 style="font-size:15px;font-weight:700;color:var(--fg);' +
      'margin:0 0 12px;">Content Progress</h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));' +
      'gap:12px;margin-bottom:20px;">' +
      progressCard('漢 Kanji',     d.kanjiCount       || 0, tKanji, 'var(--n4)') +
      progressCard('語 Vocabulary',d.vocabMastered    || 0, tVocab, 'var(--n5)') +
      progressCard('文 Grammar',   d.lessonsCompleted || 0, tGram,  'var(--n3)') +
    '</div>' +

    /* Kanji by JLPT */
    '<h2 style="font-size:15px;font-weight:700;color:var(--fg);' +
      'margin:0 0 12px;">Kanji by JLPT Level</h2>' +
    '<div class="card" style="padding:20px;">' +
      ['N5','N4','N3','N2','N1'].map(function (lv) {
        var c    = jlptColor(lv);
        var cnt  = (kanjiData[lv] || []).length;
        return '<div style="margin-bottom:13px;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
            '<span style="font-size:13px;font-weight:700;color:' + c + ';">' + lv + '</span>' +
            '<span style="font-size:12px;color:var(--fg-muted);">' +
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
      '<span style="font-size:12px;color:var(--fg-muted);">' + label + '</span>' +
      '<span style="font-size:12px;color:' + color + ';font-weight:700;">' +
        val + ' / ' + max + '</span>' +
    '</div>' +
    pctBar(val, max, color, 6) +
    '</div>';
}

function progressCard(label, val, max, color) {
  var p = Math.min(100, Math.round(val / Math.max(max, 1) * 100));
  return '<div class="card" style="padding:18px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'margin-bottom:10px;">' +
      '<span style="font-size:13px;font-weight:700;color:var(--fg);">' + label + '</span>' +
      '<span style="font-size:11px;color:' + color + ';font-weight:700;">' + p + '%</span>' +
    '</div>' +
    pctBar(val, max, color, 6) +
    '<div style="font-size:12px;color:var(--fg-muted);margin-top:8px;">' +
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
      '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;' +
        'letter-spacing:-.4px;">👤 Profile</h1>' +
      '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' +
        'Your account and learning statistics</p>' +
    '</div>' +

    /* Avatar + identity */
    '<div class="card" style="padding:24px;margin-bottom:14px;display:flex;' +
      'align-items:center;gap:20px;flex-wrap:wrap;">' +
      ava +
      '<div>' +
        '<div style="font-size:20px;font-weight:800;color:var(--fg);' +
          'margin-bottom:4px;">' + H(name) + '</div>' +
        '<div style="font-size:13px;color:var(--fg-muted);' +
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
    '<div class="card" style="padding:20px;margin-bottom:14px;">' +
      '<h3 style="font-size:13px;font-weight:700;color:var(--fg);' +
        'margin:0 0 12px;">Account Details</h3>' +
      profileRow('Display Name',   name,          false) +
      profileRow('Email',          email  || '—', false) +
      profileRow('Phone',          phone  || '—', false) +
      profileRow('User ID',        uid    || '—', true)  +
      profileRow('Sign-in Method', providerLabel, false) +
      profileRow('Member Since',   created || '—',false) +
    '</div>' +

    /* Learning stats */
    '<div class="card" style="padding:20px;margin-bottom:15px;">' +
      '<h3 style="font-size:13px;font-weight:700;color:var(--fg);' +
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
    '<span style="font-size:13px;color:var(--fg-muted);">' + label + '</span>' +
    '<span style="font-size:' + (mono ? '11px' : '13px') + ';font-weight:600;' +
      'color:var(--fg);' +
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
    'color:var(--fg-muted);cursor:pointer;font-size:13px;font-weight:600;' +
    'font-family:inherit;padding:0;margin-bottom:20px;" ' +
    'onmouseover="this.style.color=\'var(--fg)\'" ' +
    'onmouseout="this.style.color=\'var(--fg-muted)\'">← ' + label + '</button>';
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
        'color:var(--fg);margin:0 0 2px;">' + H(p.jp) + '</p>' +
      '<p style="font-size:11px;color:var(--fg-muted);margin:0;">' + H(p.en) + '</p>' +
    '</div>' +
    '<button onclick="speak(\'' + H(p.jp) + '\')" ' +
      'style="background:none;border:none;cursor:pointer;color:var(--primary);' +
      'font-size:14px;padding:2px 4px;">🔊</button>' +
    '</div>';
}

function quizBlock(quiz, answers, showResults, score, ansFn, checkFn, retryFn) {
  var allAnswered = Object.keys(answers).length >= quiz.length;
  return '<div class="card" style="padding:20px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'margin-bottom:15px;">' +
      '<h3 style="font-size:13px;font-weight:700;color:var(--fg);' +
        'margin:0;">Comprehension Quiz</h3>' +
      (showResults
        ? '<span style="font-size:13px;font-weight:700;color:' +
          (score === quiz.length ? 'var(--n5)' : 'var(--primary)') + ';">' +
          score + '/' + quiz.length + ' correct</span>'
        : '') +
    '</div>' +
    quiz.map(function (q) {
      return '<div style="margin-bottom:15px;">' +
        '<p style="font-size:13px;font-weight:700;color:var(--fg);' +
          'margin:0 0 9px;">' + H(q.question) + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
          q.options.map(function (opt, i) {
            var chosen  = answers[q.id] === i;
            var correct = i === q.answer;
            var bg = 'var(--card-elevated)', bc = 'var(--border)', cl = 'var(--fg)';
            if (showResults && correct)            { bg = 'var(--n5-dim)'; bc = 'var(--n5)'; cl = 'var(--n5)'; }
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


/* ════════════════════════════════════════════════════════════════
   FEATURE 1 — Light / Dark Theme Switcher
════════════════════════════════════════════════════════════════ */
(function initTheme() {
  var LIGHT_CSS = `
    html.nz-light {
      --bg:             #FFF5F7;
      --bg-secondary:   #FFE8EE;
      --card:           #FFFFFF;
      --card-elevated:  #FFF0F4;
      --fg:             #1A0A10;
      --fg-muted:       #6B3A4A;
      --fg-subtle:      #9B6070;
      --border:         #F0C0CC;
      --border-strong:  #E090A8;
      --primary:        #C8305A;
      --primary-hover:  #A02040;
      --primary-dim:    #F8D0DC;
      --accent:         #E07030;
      --shadow:         0 4px 24px rgba(200,48,90,.10);
      --shadow-lg:      0 8px 40px rgba(200,48,90,.15);
      --shadow-xl:      0 16px 60px rgba(200,48,90,.18);
    }
    html.nz-light body { background: var(--bg); }
    html.nz-light #nz-sb,
    html.nz-light #nz-topbar { background: var(--bg-secondary); }
  `;
  if (!document.getElementById('nz-theme-light-css')) {
    var s = document.createElement('style');
    s.id = 'nz-theme-light-css';
    s.textContent = LIGHT_CSS;
    document.head.appendChild(s);
  }

  function applyTheme(light) {
    document.documentElement.classList.toggle('nz-light', !!light);
    window._nzLightMode = !!light;
    var btn = document.getElementById('nz-theme-toggle');
    if (btn) btn.textContent = light ? '🌙' : '🌸';
    var btnDesk = document.getElementById('nz-theme-toggle-desk');
    if (btnDesk) btnDesk.textContent = light ? '🌙' : '🌸';
    if (light) { startCherryBlossom(); } else { stopCherryBlossom(); }
  }

  window.nzToggleTheme = function () {
    var next = !window._nzLightMode;
    localStorage.setItem('nz-theme', next ? 'light' : 'dark');
    applyTheme(next);
  };

  var saved = localStorage.getItem('nz-theme');
  applyTheme(saved === 'light');

  document.addEventListener('nz:userReady', function () {
    setTimeout(injectThemeAndNotifButtons, 300);
  });
})();

function injectThemeAndNotifButtons() {
  var topbar = document.getElementById('nz-topbar');
  if (!topbar) return;
  if (document.getElementById('nz-theme-toggle')) return;

  var tb = document.createElement('button');
  tb.id = 'nz-theme-toggle';
  tb.textContent = window._nzLightMode ? '🌙' : '🌸';
  tb.title = 'Toggle theme';
  tb.style.cssText = 'background:none;border:1px solid var(--border);' +
    'border-radius:8px;padding:5px 9px;font-size:15px;cursor:pointer;' +
    'color:var(--fg);transition:all .2s;margin-right:6px;';
  tb.onclick = window.nzToggleTheme;

  var nb = document.createElement('button');
  nb.id = 'nz-notif-btn';
  nb.innerHTML = '🔔<span id="nz-notif-dot" style="display:none;position:absolute;' +
    'top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:#E8446A;"></span>';
  nb.title = 'Notifications';
  nb.style.cssText = 'position:relative;background:none;border:1px solid var(--border);' +
    'border-radius:8px;padding:5px 9px;font-size:15px;cursor:pointer;' +
    'color:var(--fg);transition:all .2s;margin-right:6px;';
  nb.onclick = window.nzToggleNotifPanel;

  topbar.insertBefore(nb, topbar.lastChild);
  topbar.insertBefore(tb, nb);
}


/* ════════════════════════════════════════════════════════════════
   FEATURE 2 — Cherry Blossom Canvas
════════════════════════════════════════════════════════════════ */
var _cbCanvas = null, _cbCtx = null, _cbPetals = [], _cbAF = null;

function startCherryBlossom() {
  if (_cbCanvas) return;
  _cbCanvas = document.createElement('canvas');
  _cbCanvas.id = 'nz-cherry-canvas';
  _cbCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'pointer-events:none;z-index:0;opacity:0.55;';
  document.body.appendChild(_cbCanvas);
  _cbCtx = _cbCanvas.getContext('2d');

  function resize() {
    _cbCanvas.width  = window.innerWidth;
    _cbCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  _cbPetals = [];
  for (var i = 0; i < 38; i++) _cbPetals.push(newPetal());

  function newPetal() {
    return {
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * -window.innerHeight,
      size:    4 + Math.random() * 7,
      speed:   0.6 + Math.random() * 1.2,
      drift:   (Math.random() - 0.5) * 1.2,
      rot:     Math.random() * Math.PI * 2,
      rotSpd:  (Math.random() - 0.5) * 0.04,
      opacity: 0.5 + Math.random() * 0.5,
      hue:     340 + Math.random() * 20
    };
  }

  function drawPetal(p) {
    var c = _cbCtx;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.rot);
    c.globalAlpha = p.opacity;
    c.fillStyle = 'hsl(' + p.hue + ',80%,80%)';
    c.beginPath();
    c.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function loop() {
    if (!_cbCanvas) return;
    _cbCtx.clearRect(0, 0, _cbCanvas.width, _cbCanvas.height);
    _cbPetals.forEach(function (p) {
      p.y   += p.speed;
      p.x   += p.drift + Math.sin(p.y * 0.012) * 0.4;
      p.rot += p.rotSpd;
      if (p.y > _cbCanvas.height + 20) {
        p.x = Math.random() * _cbCanvas.width;
        p.y = -20;
      }
      drawPetal(p);
    });
    _cbAF = requestAnimationFrame(loop);
  }
  loop();
}

function stopCherryBlossom() {
  if (_cbAF) { cancelAnimationFrame(_cbAF); _cbAF = null; }
  if (_cbCanvas) { _cbCanvas.remove(); _cbCanvas = null; _cbCtx = null; }
}


/* ════════════════════════════════════════════════════════════════
   TOAST HELPER
════════════════════════════════════════════════════════════════ */
function nzShowToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
    'background:var(--card);border:1px solid var(--border-strong);' +
    'border-radius:10px;padding:11px 20px;font-size:13px;font-weight:600;' +
    'color:var(--fg);box-shadow:var(--shadow-lg);z-index:9000;' +
    'animation:slideUp .25s var(--ease);max-width:90vw;text-align:center;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 2600);
  setTimeout(function() { t.remove(); }, 3000);
}

/* ════════════════════════════════════════════════════════════════
   FEATURE 4 — Smart Notification Center
════════════════════════════════════════════════════════════════ */
window._nzNotifs = JSON.parse(localStorage.getItem('nz-notifs') || '[]');

function nzSaveNotifs() {
  try { localStorage.setItem('nz-notifs', JSON.stringify(window._nzNotifs.slice(0, 60))); } catch(e) {}
}

window.nzAddNotif = function (type, title, body) {
  var notif = { id: Date.now(), type: type, title: title, body: body,
                time: new Date().toLocaleTimeString(), read: false };
  window._nzNotifs.unshift(notif);
  nzSaveNotifs();
  var dot = document.getElementById('nz-notif-dot');
  if (dot) dot.style.display = 'block';
  nzShowToast(title + ': ' + body);
};

window.nzToggleNotifPanel = function () {
  var existing = document.getElementById('nz-notif-panel');
  if (existing) { existing.remove(); return; }

  var panel = document.createElement('div');
  panel.id = 'nz-notif-panel';
  panel.style.cssText = 'position:fixed;top:56px;right:12px;width:320px;max-width:96vw;' +
    'background:var(--card);border:1px solid var(--border-strong);border-radius:14px;' +
    'box-shadow:var(--shadow-xl);z-index:800;overflow:hidden;' +
    'animation:slideUp .2s var(--ease);';

  var unread = window._nzNotifs.filter(function(n){return !n.read;}).length;
  var icons = { reminder:'⏰', goal:'🎯', xp:'⭐', task:'✅', weekly:'📊', chat:'💬' };

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;' +
      'padding:14px 16px;border-bottom:1px solid var(--border);">' +
      '<span style="font-size:14px;font-weight:700;color:var(--fg);">🔔 Notifications' +
        (unread ? ' <span style="font-size:11px;color:var(--primary);">(' + unread + ' new)</span>' : '') +
      '</span>' +
      '<div style="display:flex;gap:8px;">' +
        '<button onclick="nzMarkAllRead()" style="background:none;border:none;' +
          'font-size:11px;color:var(--fg-muted);cursor:pointer;">Mark all read</button>' +
        '<button onclick="nzClearNotifs()" style="background:none;border:none;' +
          'font-size:11px;color:var(--primary);cursor:pointer;">Clear all</button>' +
        '<button onclick="document.getElementById(\'nz-notif-panel\').remove()" ' +
          'style="background:none;border:none;color:var(--fg-muted);cursor:pointer;' +
          'font-size:16px;line-height:1;">×</button>' +
      '</div>' +
    '</div>' +
    '<div style="max-height:340px;overflow-y:auto;">' +
      (window._nzNotifs.length === 0
        ? '<div style="padding:28px;text-align:center;color:var(--fg-muted);font-size:13px;">No notifications yet</div>'
        : window._nzNotifs.map(function(n) {
            return '<div style="display:flex;gap:11px;padding:13px 16px;' +
              'border-bottom:1px solid var(--border);' +
              (n.read ? '' : 'background:var(--primary-dim);') + '">' +
              '<span style="font-size:18px;flex-shrink:0;">' + (icons[n.type] || '📌') + '</span>' +
              '<div style="flex:1;min-width:0;">' +
                '<div style="font-size:13px;font-weight:700;color:var(--fg);">' + H(n.title) + '</div>' +
                '<div style="font-size:12px;color:var(--fg-muted);margin-top:2px;">' + H(n.body) + '</div>' +
                '<div style="font-size:10px;color:var(--fg-subtle);margin-top:3px;">' + n.time + '</div>' +
              '</div></div>';
          }).join('')) +
    '</div>';

  document.body.appendChild(panel);
  window._nzNotifs.forEach(function(n){ n.read = true; });
  nzSaveNotifs();
  var dot = document.getElementById('nz-notif-dot');
  if (dot) dot.style.display = 'none';
};

window.nzMarkAllRead = function() {
  window._nzNotifs.forEach(function(n){ n.read = true; });
  nzSaveNotifs();
  var p = document.getElementById('nz-notif-panel');
  if (p) { p.remove(); window.nzToggleNotifPanel(); }
};

window.nzClearNotifs = function() {
  window._nzNotifs = []; nzSaveNotifs();
  var p = document.getElementById('nz-notif-panel');
  if (p) p.remove();
};

setInterval(function() {
  var notes = JSON.parse(localStorage.getItem('nz-notes') || '[]');
  var now   = Date.now();
  var changed = false;
  notes.forEach(function(note) {
    if (note.alarmTime && !note.alarmFired && now >= note.alarmTime) {
      note.alarmFired = true; changed = true;
      window.nzAddNotif('reminder', '⏰ Note Reminder', note.title || 'Study reminder');
    }
  });
  if (changed) localStorage.setItem('nz-notes', JSON.stringify(notes));
}, 60000);


/* ════════════════════════════════════════════════════════════════
   FEATURE 3 — Daily Study Planner (inside Progress page)
════════════════════════════════════════════════════════════════ */
function renderStudyPlanner() {
  var tasks = JSON.parse(localStorage.getItem('nz-planner-tasks') || '[]');
  var history = JSON.parse(localStorage.getItem('nz-planner-history') || '{}');
  var todayKey = new Date().toISOString().slice(0, 10);
  var done  = tasks.filter(function(t){ return t.done; }).length;
  var total = tasks.length;
  var pct   = total ? Math.round(done / total * 100) : 0;

  var QUICK = [
    {label:'漢 Kanji',xp:20},{label:'語 Vocab',xp:15},{label:'文 Grammar',xp:15},
    {label:'📖 Reading',xp:20},{label:'🎧 Listening',xp:20},
    {label:'✏️ Writing',xp:10},{label:'📝 Mock Quiz',xp:50}
  ];

  return (
    '<div class="card" style="padding:20px;margin-bottom:14px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
      '<h3 style="font-size:14px;font-weight:700;color:var(--fg);margin:0;">📋 Daily Study Planner</h3>' +
      '<span style="font-size:12px;font-weight:700;color:' + (pct===100?'var(--n5)':'var(--primary)') + ';">' + pct + '% done</span>' +
    '</div>' +
    '<div style="background:var(--card-elevated);border-radius:99px;overflow:hidden;height:8px;margin-bottom:14px;">' +
      '<div style="width:' + pct + '%;height:8px;border-radius:99px;background:linear-gradient(90deg,var(--primary),var(--n5));transition:width .5s;"></div>' +
    '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' +
      QUICK.map(function(q){
        return '<button onclick="nzPlannerQuickAdd(\'' + H(q.label) + '\',' + q.xp + ')" ' +
          'style="padding:5px 11px;border-radius:8px;font-size:11px;font-weight:700;' +
          'background:var(--card-elevated);border:1px solid var(--border);' +
          'color:var(--fg-muted);cursor:pointer;font-family:inherit;" ' +
          'onmouseover="this.style.borderColor=\'var(--primary)\';this.style.color=\'var(--primary)\'" ' +
          'onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--fg-muted)\'">' +
          q.label + ' +' + q.xp + 'XP</button>';
      }).join('') +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
      '<input id="nz-plan-inp" type="text" placeholder="Custom task…" ' +
        'style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border);' +
        'background:var(--card);color:var(--fg);font-size:13px;font-family:inherit;outline:none;" ' +
        'onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--border)\'">' +
      '<select id="nz-plan-xp" style="padding:8px;border-radius:8px;border:1px solid var(--border);' +
        'background:var(--card);color:var(--fg);font-size:12px;font-family:inherit;">' +
        '<option value="10">+10 XP</option><option value="20">+20 XP</option>' +
        '<option value="30">+30 XP</option><option value="50">+50 XP</option>' +
      '</select>' +
      '<button onclick="nzPlannerAdd()" class="nz-btn nz-btn-pri" style="padding:8px 14px;font-size:12px;">+ Add</button>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:7px;">' +
      (tasks.length === 0
        ? '<div style="text-align:center;padding:20px;color:var(--fg-muted);font-size:13px;">No tasks yet — add some above!</div>'
        : tasks.map(function(task, i) {
            return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;' +
              'border-radius:10px;background:var(--card-elevated);' +
              'border:1px solid ' + (task.done ? 'var(--n5)' : 'var(--border)') + ';' +
              'opacity:' + (task.done ? '0.7' : '1') + ';">' +
              '<button onclick="nzPlannerToggle(' + i + ')" ' +
                'style="width:20px;height:20px;border-radius:5px;flex-shrink:0;cursor:pointer;' +
                'border:2px solid ' + (task.done?'var(--n5)':'var(--border)') + ';' +
                'background:' + (task.done?'var(--n5)':'transparent') + ';' +
                'color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;font-family:inherit;">' +
                (task.done?'✓':'') + '</button>' +
              '<span style="flex:1;font-size:13px;color:var(--fg);' + (task.done?'text-decoration:line-through;color:var(--fg-muted);':'') + '">' + H(task.label) + '</span>' +
              '<span style="font-size:11px;font-weight:700;color:var(--primary);">+' + task.xp + ' XP</span>' +
              '<button onclick="nzPlannerDelete(' + i + ')" style="background:none;border:none;color:var(--fg-subtle);cursor:pointer;font-size:15px;line-height:1;padding:2px 4px;">×</button>' +
            '</div>';
          }).join('')) +
    '</div>' +
    '<div style="margin-top:16px;">' +
      '<div style="font-size:11px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">7-Day Completion History</div>' +
      '<div style="display:flex;align-items:flex-end;gap:5px;height:50px;">' +
        (function() {
          var bars = '';
          for (var i = 6; i >= 0; i--) {
            var d2 = new Date(); d2.setDate(d2.getDate() - i);
            var dk = d2.toISOString().slice(0, 10);
            var pct2 = history[dk] || 0;
            var day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d2.getDay()];
            bars += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">' +
              '<div style="width:100%;border-radius:4px 4px 0 0;' +
                'background:' + (dk===todayKey?'var(--primary)':'var(--n5)') + ';' +
                'opacity:' + (pct2?'1':'0.2') + ';height:' + Math.max(4,pct2*0.46) + 'px;transition:height .4s;"></div>' +
              '<span style="font-size:9px;color:var(--fg-subtle);">' + day + '</span></div>';
          }
          return bars;
        })() +
      '</div>' +
    '</div>' +
    '</div>'
  );
}

window.nzPlannerQuickAdd = function(label, xp) {
  var tasks = JSON.parse(localStorage.getItem('nz-planner-tasks') || '[]');
  tasks.push({ label: label, xp: xp, done: false });
  localStorage.setItem('nz-planner-tasks', JSON.stringify(tasks));
  Pages.progress();
};

window.nzPlannerAdd = function() {
  var inp = document.getElementById('nz-plan-inp');
  var xpSel = document.getElementById('nz-plan-xp');
  if (!inp || !inp.value.trim()) return;
  var tasks = JSON.parse(localStorage.getItem('nz-planner-tasks') || '[]');
  tasks.push({ label: inp.value.trim(), xp: parseInt(xpSel ? xpSel.value : 10), done: false });
  localStorage.setItem('nz-planner-tasks', JSON.stringify(tasks));
  Pages.progress();
};

window.nzPlannerToggle = function(i) {
  var tasks = JSON.parse(localStorage.getItem('nz-planner-tasks') || '[]');
  if (!tasks[i]) return;
  tasks[i].done = !tasks[i].done;
  if (tasks[i].done && window._nzAddXP) {
    window._nzAddXP(tasks[i].xp);
    window.nzAddNotif('task', '✅ Task Complete', 'You earned +' + tasks[i].xp + ' XP!');
    var history = JSON.parse(localStorage.getItem('nz-planner-history') || '{}');
    var todayKey = new Date().toISOString().slice(0, 10);
    var done2 = tasks.filter(function(t){ return t.done; }).length;
    history[todayKey] = Math.round(done2 / tasks.length * 100);
    localStorage.setItem('nz-planner-history', JSON.stringify(history));
  }
  localStorage.setItem('nz-planner-tasks', JSON.stringify(tasks));
  Pages.progress();
};

window.nzPlannerDelete = function(i) {
  var tasks = JSON.parse(localStorage.getItem('nz-planner-tasks') || '[]');
  tasks.splice(i, 1);
  localStorage.setItem('nz-planner-tasks', JSON.stringify(tasks));
  Pages.progress();
};


/* ════════════════════════════════════════════════════════════════
   FEATURE 10 — Weekly Progress Report (inside Progress page)
════════════════════════════════════════════════════════════════ */
function renderWeeklyReport() {
  var d = getUD();
  var xpHistory = JSON.parse(localStorage.getItem('nz-xp-history') || '{}');
  var vals = Object.values(xpHistory).concat([100]);
  var maxXP = Math.max.apply(null, vals);

  var days = [];
  for (var i = 6; i >= 0; i--) {
    var dt = new Date(); dt.setDate(dt.getDate() - i);
    var dk = dt.toISOString().slice(0, 10);
    days.push({ key: dk, day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()], xp: xpHistory[dk] || 0 });
  }
  var weekXP = days.reduce(function(s, d2){ return s + d2.xp; }, 0);
  var tKanji = Object.values(kanjiData).reduce(function(s, a){ return s + a.length; }, 0);

  return (
    '<div class="card" style="padding:20px;margin-bottom:14px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
      '<h3 style="font-size:14px;font-weight:700;color:var(--fg);margin:0;">📊 Weekly Progress Report</h3>' +
      '<button onclick="nzShareReport()" class="nz-btn nz-btn-ghost" style="font-size:12px;padding:6px 12px;">↑ Share</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:16px;">' +
      wkStat('⭐','XP This Week', weekXP) +
      wkStat('漢','Kanji', d.weeklyKanji || 0) +
      wkStat('語','Vocab', d.weeklyVocab || 0) +
      wkStat('📚','Lessons', d.weeklyLessons || 0) +
    '</div>' +
    '<div style="margin-bottom:16px;">' +
      '<div style="font-size:11px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Daily XP</div>' +
      '<div style="display:flex;align-items:flex-end;gap:5px;height:70px;">' +
        days.map(function(dy) {
          var h = Math.max(4, Math.round((dy.xp / maxXP) * 62));
          var isToday = dy.key === new Date().toISOString().slice(0,10);
          return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">' +
            '<span style="font-size:9px;color:var(--fg-subtle);">' + (dy.xp > 0 ? dy.xp : '') + '</span>' +
            '<div style="width:100%;border-radius:4px 4px 0 0;' +
              'background:' + (isToday ? 'var(--primary)' : 'var(--accent)') + ';' +
              'opacity:' + (dy.xp ? '0.9' : '0.15') + ';height:' + h + 'px;transition:height .4s;"></div>' +
            '<span style="font-size:9px;color:var(--fg-subtle);">' + dy.day + '</span></div>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Study Breakdown</div>' +
    progressRow('Kanji',    d.kanjiCount       || 0, tKanji,               'var(--n4)') +
    progressRow('Vocab',    d.vocabMastered    || 0, VocabPageWords.length,'var(--n5)') +
    progressRow('Grammar',  d.lessonsCompleted || 0, grammarPoints.length, 'var(--n3)') +
    progressRow('Accuracy', d.quizAccuracy     || 0, 100,                  'var(--n2)') +
    '<div style="margin-top:14px;">' +
      '<div style="font-size:11px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Achievements</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;">' +
        ((d.streak||0) >= 7  ? achBadge('🔥','7-Day Streak') : '') +
        ((d.streak||0) >= 30 ? achBadge('🏆','30-Day Streak') : '') +
        ((d.xp||0) >= 1000   ? achBadge('⭐','1000 XP Club') : '') +
        ((d.kanjiCount||0) >= 50 ? achBadge('漢','Kanji Learner') : '') +
        achBadge('🌱','Started Learning') +
      '</div>' +
    '</div>' +
    '</div>'
  );
}

function wkStat(icon, label, val) {
  return '<div style="background:var(--card-elevated);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center;">' +
    '<div style="font-size:16px;margin-bottom:4px;">' + icon + '</div>' +
    '<div style="font-size:15px;font-weight:800;color:var(--fg);">' + val + '</div>' +
    '<div style="font-size:10px;color:var(--fg-muted);">' + label + '</div></div>';
}

function achBadge(icon, label) {
  return '<div style="display:flex;align-items:center;gap:5px;padding:5px 10px;' +
    'border-radius:20px;background:var(--primary-dim);border:1px solid var(--primary);' +
    'font-size:11px;font-weight:700;color:var(--primary);">' + icon + ' ' + label + '</div>';
}

window.nzShareReport = function() {
  window.nzAddNotif('weekly','📊 Weekly Report','Your progress report has been shared!');
};

document.addEventListener('nz:xpUpdated', function(e) {
  if (!e.detail) return;
  var history = JSON.parse(localStorage.getItem('nz-xp-history') || '{}');
  history[new Date().toISOString().slice(0,10)] = e.detail.xp || 0;
  localStorage.setItem('nz-xp-history', JSON.stringify(history));
});

/* ── Patch Pages.progress to include planner + weekly report ── */
var _origProgress = Pages.progress;
Pages.progress = function() {
  _origProgress();
  setTimeout(function() {
    var page = document.querySelector('#nz-content .nz-page');
    if (!page) return;
    var extra = document.createElement('div');
    extra.innerHTML = renderWeeklyReport() + renderStudyPlanner();
    while (extra.firstChild) page.appendChild(extra.firstChild);
  }, 10);
};


/* ════════════════════════════════════════════════════════════════
   FEATURE 7 — My Goals System (sidebar: goals)
════════════════════════════════════════════════════════════════ */
function goalField(label, id, type, placeholder) {
  return '<label style="font-size:12px;color:var(--fg-muted);display:block;margin-bottom:5px;">' + label + '</label>' +
    '<input id="' + id + '" type="' + type + '" placeholder="' + placeholder + '" ' +
      'style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);' +
      'background:var(--card);color:var(--fg);font-size:13px;font-family:inherit;' +
      'box-sizing:border-box;margin-bottom:12px;" ' +
      'onfocus="this.style.borderColor=\'var(--primary)\'" ' +
      'onblur="this.style.borderColor=\'var(--border)\'">';
}

Pages.goals = function() {
  var goals = JSON.parse(localStorage.getItem('nz-goals') || 'null');
  if (!goals) {
    goals = [
      { id:'g1', title:'Pass JLPT N5', desc:'Achieve N5 certification', emoji:'🎌', target:100, unit:'%', progress:0 },
      { id:'g2', title:'500 Vocabulary Words', desc:'Master 500 essential words', emoji:'語', target:500, unit:'words', progress:0 },
      { id:'g3', title:'30-Day Streak', desc:'Study every day for 30 days', emoji:'🔥', target:30, unit:'days', progress:getUD().streak||1 },
      { id:'g4', title:'200 Kanji', desc:'Learn 200 kanji characters', emoji:'漢', target:200, unit:'kanji', progress:getUD().kanjiCount||0 }
    ];
    localStorage.setItem('nz-goals', JSON.stringify(goals));
  }

  function renderGoals() {
    setHTML(
      '<div class="nz-page nz-fadein">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;">' +
        '<div>' +
          '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;letter-spacing:-.4px;">🎯 My Goals</h1>' +
          '<p style="font-size:13px;color:var(--fg-muted);margin:0;">Set targets and track your learning milestones</p>' +
        '</div>' +
        '<button onclick="nzGoalNew()" class="nz-btn nz-btn-pri">+ New Goal</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">' +
        goals.map(function(g) {
          var pct = Math.min(100, Math.round(g.progress / Math.max(g.target,1) * 100));
          var done = pct >= 100;
          return '<div class="card" style="padding:20px;border-top:3px solid ' + (done?'var(--n5)':'var(--primary)') + ';">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
              '<span style="font-size:26px;">' + H(g.emoji) + '</span>' +
              '<div style="display:flex;gap:6px;">' +
                (done ? '<span style="font-size:11px;font-weight:700;color:var(--n5);background:rgba(34,197,94,.15);border:1px solid var(--n5);padding:2px 8px;border-radius:6px;">✅ Complete</span>' : '') +
                '<button onclick="nzGoalUpdate(\'' + H(g.id) + '\')" style="background:none;border:none;cursor:pointer;color:var(--fg-muted);font-size:14px;" title="Update progress">✏️</button>' +
                '<button onclick="nzGoalDelete(\'' + H(g.id) + '\')" style="background:none;border:none;cursor:pointer;color:var(--fg-subtle);font-size:14px;" title="Delete">🗑️</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:15px;font-weight:700;color:var(--fg);margin-bottom:3px;">' + H(g.title) + '</div>' +
            '<div style="font-size:12px;color:var(--fg-muted);margin-bottom:12px;">' + H(g.desc) + '</div>' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
              '<span style="font-size:12px;color:var(--fg-muted);">' + g.progress + ' / ' + g.target + ' ' + H(g.unit) + '</span>' +
              '<span style="font-size:12px;font-weight:700;color:' + (done?'var(--n5)':'var(--primary)') + ';">' + pct + '%</span>' +
            '</div>' +
            '<div style="background:var(--card-elevated);border-radius:99px;overflow:hidden;height:6px;">' +
              '<div style="width:' + pct + '%;height:6px;border-radius:99px;background:' + (done?'var(--n5)':'linear-gradient(90deg,var(--primary),var(--accent))') + ';transition:width .5s;"></div>' +
            '</div></div>';
        }).join('') +
      '</div></div>'
    );
  }

  window.nzGoalNew = function() {
    var ov = document.createElement('div'); ov.className = 'nz-overlay-bg';
    ov.innerHTML = '<div class="nz-modal-box">' +
      '<button onclick="this.closest(\'.nz-overlay-bg\').remove()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:22px;line-height:1;">×</button>' +
      '<h3 style="font-size:16px;font-weight:700;color:var(--fg);margin:0 0 16px;">🎯 New Goal</h3>' +
      goalField('Title','nz-gnew-title','text','e.g. Pass JLPT N4') +
      goalField('Description','nz-gnew-desc','text','Brief description') +
      goalField('Target Number','nz-gnew-target','number','100') +
      goalField('Unit','nz-gnew-unit','text','e.g. %, words, kanji') +
      goalField('Emoji','nz-gnew-emoji','text','🎌') +
      '<button onclick="nzGoalSaveNew()" class="nz-btn nz-btn-pri" style="width:100%;justify-content:center;margin-top:14px;">Create Goal</button></div>';
    document.body.appendChild(ov);
  };

  window.nzGoalSaveNew = function() {
    var f = function(id){ return document.getElementById(id); };
    if (!f('nz-gnew-title') || !f('nz-gnew-title').value.trim()) return;
    goals.push({ id:'g'+Date.now(), title:f('nz-gnew-title').value.trim(),
      desc:(f('nz-gnew-desc')&&f('nz-gnew-desc').value.trim())||'',
      target:parseInt((f('nz-gnew-target')&&f('nz-gnew-target').value)||100)||100,
      unit:(f('nz-gnew-unit')&&f('nz-gnew-unit').value.trim())||'%',
      emoji:(f('nz-gnew-emoji')&&f('nz-gnew-emoji').value.trim())||'🎯', progress:0 });
    localStorage.setItem('nz-goals', JSON.stringify(goals));
    var ov = document.querySelector('.nz-overlay-bg'); if (ov) ov.remove();
    renderGoals();
  };

  window.nzGoalUpdate = function(id) {
    var g = goals.find(function(x){return x.id===id;}); if (!g) return;
    var ov = document.createElement('div'); ov.className = 'nz-overlay-bg';
    ov.innerHTML = '<div class="nz-modal-box">' +
      '<button onclick="this.closest(\'.nz-overlay-bg\').remove()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:22px;line-height:1;">×</button>' +
      '<h3 style="font-size:16px;font-weight:700;color:var(--fg);margin:0 0 16px;">Update: ' + H(g.title) + '</h3>' +
      '<label style="font-size:12px;color:var(--fg-muted);display:block;margin-bottom:5px;">Current Progress (' + H(g.unit) + ')</label>' +
      '<input id="nz-gupd-val" type="number" value="' + g.progress + '" min="0" max="' + g.target + '" ' +
        'style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:14px;font-family:inherit;box-sizing:border-box;">' +
      '<button onclick="nzGoalSaveUpdate(\'' + H(id) + '\')" class="nz-btn nz-btn-pri" style="width:100%;justify-content:center;margin-top:14px;">Save Progress</button></div>';
    document.body.appendChild(ov);
  };

  window.nzGoalSaveUpdate = function(id) {
    var inp = document.getElementById('nz-gupd-val'); if (!inp) return;
    var g = goals.find(function(x){return x.id===id;}); if (!g) return;
    var prev = g.progress;
    g.progress = Math.min(g.target, parseInt(inp.value) || 0);
    localStorage.setItem('nz-goals', JSON.stringify(goals));
    var ov = document.querySelector('.nz-overlay-bg'); if (ov) ov.remove();
    if (g.progress >= g.target && prev < g.target) {
      if (window._nzAddXP) window._nzAddXP(100);
      window.nzAddNotif('goal','🎯 Goal Complete!', g.title + ' — +100 XP!');
    }
    renderGoals();
  };

  window.nzGoalDelete = function(id) {
    goals = goals.filter(function(g){return g.id!==id;});
    localStorage.setItem('nz-goals', JSON.stringify(goals));
    renderGoals();
  };

  renderGoals();
};


/* ════════════════════════════════════════════════════════════════
   FEATURE 8 — Smart Notes + Alarm System (sidebar: notes)
════════════════════════════════════════════════════════════════ */
Pages.notes = function() {
  var notes = JSON.parse(localStorage.getItem('nz-notes') || '[]');

  function saveAndRender() {
    localStorage.setItem('nz-notes', JSON.stringify(notes));
    renderNotes();
  }

  function renderNotes() {
    var pinned   = notes.filter(function(n){return n.pinned;});
    var unpinned = notes.filter(function(n){return !n.pinned;});
    var sorted   = pinned.concat(unpinned);

    setHTML(
      '<div class="nz-page nz-fadein">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;">' +
        '<div><h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;letter-spacing:-.4px;">📝 Smart Notes</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">Study notes with reminder alarms</p></div>' +
        '<button onclick="nzNoteNew()" class="nz-btn nz-btn-pri">+ New Note</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">' +
        (sorted.length === 0
          ? '<div style="padding:40px;text-align:center;color:var(--fg-muted);font-size:13px;grid-column:1/-1;">No notes yet — create your first one!</div>'
          : sorted.map(function(note) {
              var realIdx = notes.indexOf(note);
              var hasAlarm = note.alarmTime && !note.alarmFired;
              var alarmStr = hasAlarm ? new Date(note.alarmTime).toLocaleString() : '';
              return '<div class="card" style="padding:18px;border:' + (note.pinned?'1px solid var(--accent)':'1px solid var(--border)') + ';">' +
                '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">' +
                  '<span style="font-size:15px;font-weight:700;color:var(--fg);flex:1;margin-right:8px;">' + H(note.title||'Untitled') + '</span>' +
                  '<div style="display:flex;gap:4px;flex-shrink:0;">' +
                    '<button onclick="nzNotePin(' + realIdx + ')" style="background:none;border:none;cursor:pointer;font-size:14px;color:' + (note.pinned?'var(--accent)':'var(--fg-muted)') + ';">📌</button>' +
                    '<button onclick="nzNoteEdit(' + realIdx + ')" style="background:none;border:none;cursor:pointer;font-size:14px;color:var(--fg-muted);">✏️</button>' +
                    '<button onclick="nzNoteDelete(' + realIdx + ')" style="background:none;border:none;cursor:pointer;font-size:14px;color:var(--fg-subtle);">🗑️</button>' +
                  '</div></div>' +
                '<p style="font-size:13px;color:var(--fg-muted);margin:0 0 10px;line-height:1.5;white-space:pre-wrap;">' + H(note.body||'') + '</p>' +
                (hasAlarm ? '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--accent);font-weight:600;">⏰ ' + alarmStr + '</div>' : '') +
                (note.alarmFired ? '<div style="font-size:11px;color:var(--fg-subtle);">✅ Alarm fired</div>' : '') +
              '</div>';
            }).join('')) +
      '</div></div>'
    );
  }

  function showNoteModal(note, idx) {
    var isEdit = idx !== undefined;
    var ov = document.createElement('div'); ov.className = 'nz-overlay-bg';
    ov.innerHTML =
      '<div class="nz-modal-box" style="max-width:480px;">' +
      '<button onclick="this.closest(\'.nz-overlay-bg\').remove()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:22px;line-height:1;">×</button>' +
      '<h3 style="font-size:16px;font-weight:700;color:var(--fg);margin:0 0 16px;">' + (isEdit?'✏️ Edit Note':'📝 New Note') + '</h3>' +
      goalField('Title','nz-note-title','text','Note title…') +
      '<label style="font-size:12px;color:var(--fg-muted);display:block;margin-bottom:5px;">Content</label>' +
      '<textarea id="nz-note-body" placeholder="Write your notes…" rows="4" ' +
        'style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:13px;font-family:inherit;box-sizing:border-box;resize:vertical;margin-bottom:12px;outline:none;" ' +
        'onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--border)\'"></textarea>' +
      '<div style="font-size:12px;font-weight:700;color:var(--fg-muted);margin-bottom:8px;">⏰ Set Reminder</div>' +
      '<input id="nz-note-alarm" type="datetime-local" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:12px;font-family:inherit;box-sizing:border-box;margin-bottom:8px;">' +
      '<div style="font-size:12px;color:var(--fg-muted);margin-bottom:6px;">Or set from now:</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">' +
        ['30m','1h','3h','6h','1d'].map(function(d2){
          return '<button onclick="nzNoteSetDuration(\'' + d2 + '\')" style="padding:5px 11px;border-radius:8px;font-size:11px;font-weight:700;background:var(--card-elevated);border:1px solid var(--border);color:var(--fg-muted);cursor:pointer;font-family:inherit;">+' + d2 + '</button>';
        }).join('') +
      '</div>' +
      '<button onclick="nzNoteSave(' + (isEdit?idx:-1) + ')" class="nz-btn nz-btn-pri" style="width:100%;justify-content:center;">' + (isEdit?'Save Changes':'Create Note') + '</button>' +
      '</div>';
    document.body.appendChild(ov);
    if (isEdit) {
      var ti = document.getElementById('nz-note-title'); if (ti) ti.value = note.title||'';
      var bi = document.getElementById('nz-note-body');  if (bi) bi.value = note.body||'';
    }
  }

  window.nzNoteSetDuration = function(dur) {
    var ms = {'30m':30,'1h':60,'3h':180,'6h':360,'1d':1440}[dur]*60000;
    var dt = new Date(Date.now()+ms);
    var iso = new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().slice(0,16);
    var inp = document.getElementById('nz-note-alarm'); if (inp) inp.value = iso;
  };

  window.nzNoteSave = function(idx) {
    var ti = document.getElementById('nz-note-title');
    var bi = document.getElementById('nz-note-body');
    var ai = document.getElementById('nz-note-alarm');
    var noteObj = {
      title: (ti&&ti.value.trim())||'Untitled',
      body:  bi?bi.value:'',
      alarmTime: (ai&&ai.value)?new Date(ai.value).getTime():null,
      alarmFired:false, pinned:false
    };
    if (idx>=0) { noteObj.pinned=notes[idx].pinned||false; notes[idx]=noteObj; }
    else notes.push(noteObj);
    var ov=document.querySelector('.nz-overlay-bg'); if(ov)ov.remove();
    saveAndRender();
  };

  window.nzNoteNew    = function() { showNoteModal({},undefined); };
  window.nzNoteEdit   = function(i) { showNoteModal(notes[i],i); };
  window.nzNoteDelete = function(i) { notes.splice(i,1); saveAndRender(); };
  window.nzNotePin    = function(i) { notes[i].pinned=!notes[i].pinned; saveAndRender(); };

  renderNotes();
};


/* ════════════════════════════════════════════════════════════════
   FEATURE 5 — Community Chat (Real Firebase Firestore)
════════════════════════════════════════════════════════════════ */
Pages.chat = function() {
  var ROOMS = [
    {id:'general',label:'General 🌸'},{id:'jlpt',label:'JLPT Prep 📚'},
    {id:'kanji',label:'Kanji Help 漢'},{id:'vocab',label:'Vocab Share 語'},
    {id:'groups',label:'Study Groups 👥'},{id:'offtopic',label:'Off-Topic 💬'}
  ];
  var activeRoom = 'general';
  var _unsub = null;

  function renderChat() {
    var u = getU(), d = getUD();
    var name = d.displayName||u.displayName||'Learner';
    setHTML(
      '<div class="nz-page nz-fadein" style="max-width:900px;">' +
      '<div style="margin-bottom:16px;">' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;letter-spacing:-.4px;">💬 Community Chat</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">Real-time chat with fellow Japanese learners</p>' +
      '</div>' +
      '<div style="display:flex;gap:14px;flex-wrap:wrap;">' +
        '<div style="width:180px;flex-shrink:0;">' +
          '<div style="font-size:10px;font-weight:700;color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;font-family:var(--font-mono);">Rooms</div>' +
          ROOMS.map(function(r){
            var act = r.id===activeRoom;
            return '<button onclick="nzChatRoom(\'' + r.id + '\')" ' +
              'style="width:100%;text-align:left;padding:8px 10px;border-radius:8px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;border:none;margin-bottom:3px;' +
              'background:' + (act?'var(--primary-dim)':'transparent') + ';' +
              'color:' + (act?'var(--primary)':'var(--fg-muted)') + ';' +
              'border-left:2px solid ' + (act?'var(--primary)':'transparent') + ';">' + H(r.label) + '</button>';
          }).join('') +
        '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div id="nz-chat-msgs" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;margin-bottom:10px;">' +
            '<div style="text-align:center;color:var(--fg-muted);font-size:12px;padding:20px;">Loading messages…</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<input id="nz-chat-inp" type="text" placeholder="Message #' + activeRoom + '…" ' +
              'style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:13px;font-family:inherit;outline:none;" ' +
              'onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--border)\'" ' +
              'onkeydown="if(event.key===\'Enter\')nzChatSend()">' +
            '<button onclick="nzChatSend()" class="nz-btn nz-btn-pri">Send ↑</button>' +
          '</div>' +
        '</div>' +
      '</div></div>'
    );
    subscribeRoom(activeRoom);
  }

  function subscribeRoom(roomId) {
    if (_unsub) { try{_unsub();}catch(e){} _unsub=null; }
    if (!window._nzDb) return;
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(function(fs){
      if (!window._nzFS) window._nzFS = fs;
      var q = fs.query(
        fs.collection(window._nzDb,'chat_rooms',roomId,'messages'),
        fs.orderBy('timestamp','asc'), fs.limit(80)
      );
      _unsub = fs.onSnapshot(q, function(snap){
        var box = document.getElementById('nz-chat-msgs'); if(!box) return;
        var me = (window._nzUser&&window._nzUser.uid)||'';
        if (snap.empty) {
          box.innerHTML='<div style="text-align:center;color:var(--fg-muted);font-size:12px;padding:40px;">No messages yet — be the first! 🌸</div>';
          return;
        }
        box.innerHTML = snap.docs.map(function(doc){
          var m=doc.data(), own=m.uid===me;
          var ts=m.timestamp&&m.timestamp.toDate?m.timestamp.toDate().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
          var ava = m.photoURL
            ? '<img src="'+H(m.photoURL)+'" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">'
            : '<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#B02050);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;">' + H((m.displayName||'?').charAt(0).toUpperCase()) + '</div>';
          return '<div style="display:flex;align-items:flex-end;gap:7px;flex-direction:' + (own?'row-reverse':'row') + ';">' +
            ava +
            '<div style="max-width:68%;">' +
              '<div style="font-size:10px;color:var(--fg-subtle);margin-bottom:3px;text-align:' + (own?'right':'left') + ';">' + H(m.displayName||'Learner') + ' · ' + ts + '</div>' +
              '<div style="padding:9px 13px;border-radius:12px;font-size:13px;' +
                'background:' + (own?'var(--primary)':'var(--card-elevated)') + ';' +
                'color:' + (own?'#fff':'var(--fg)') + ';border:1px solid ' + (own?'transparent':'var(--border)') + ';' +
                'border-bottom-' + (own?'right':'left') + '-radius:3px;line-height:1.45;">' + H(m.text) + '</div>' +
            '</div></div>';
        }).join('');
        box.scrollTop=box.scrollHeight;
      });
    });
  }

  window.nzChatRoom = function(id){ activeRoom=id; renderChat(); };

  window.nzChatSend = function(){
    var inp=document.getElementById('nz-chat-inp'); if(!inp||!inp.value.trim()) return;
    var text=inp.value.trim(); inp.value='';
    if(!window._nzDb||!window._nzUser) return;
    var u2=window._nzUser, d2=getUD();
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(function(fs){
      fs.addDoc(fs.collection(window._nzDb,'chat_rooms',activeRoom,'messages'),{
        text:text, uid:u2.uid,
        displayName:d2.displayName||u2.displayName||'Learner',
        photoURL:d2.photoURL||u2.photoURL||'',
        timestamp:fs.serverTimestamp()
      });
    });
  };

  renderChat();
};


/* ════════════════════════════════════════════════════════════════
   FEATURE 9 — SRS Spaced Repetition System
════════════════════════════════════════════════════════════════ */
var _srsItems = null;

function getSRSItems() {
  if (!_srsItems) _srsItems = JSON.parse(localStorage.getItem('nz-srs-items')||'null');
  if (!_srsItems) {
    _srsItems = [];
    // BUGFIX: kanjiData may not be loaded yet — guard with try/catch
    try {
      if (typeof kanjiData !== 'undefined' && kanjiData['N5']) {
        kanjiData['N5'].slice(0,14).forEach(function(k){
          _srsItems.push({ id:'srs-'+k.id, front:k.kanji, reading:k.reading,
            back:k.meaning, type:'kanji', level:'N5', interval:1, due:Date.now() });
        });
      }
    } catch(e) { /* kanjiData not ready yet — items seeded later */ }
    saveSRS();
  }
  return _srsItems;
}

function saveSRS() {
  try { localStorage.setItem('nz-srs-items', JSON.stringify(_srsItems)); } catch(e) {}
}

function getDueItems() {
  return getSRSItems().filter(function(i){ return i.due <= Date.now(); });
}

function srsGrade(item, grade) {
  var mult = {again:0.25, hard:0.8, good:1.5, easy:2.5}[grade]||1;
  item.interval = Math.max(0.5,(item.interval||1)*mult);
  item.due = Date.now() + item.interval*24*3600000;
  var xpMap = {again:2,hard:3,good:5,easy:10};
  if (window._nzAddXP) window._nzAddXP(xpMap[grade]||5);
  saveSRS();
}

function gradeBtn(grade, label, color) {
  return '<button onclick="nzSRSGrade(\'' + grade + '\')" ' +
    'style="padding:11px;border-radius:10px;font-size:12px;font-weight:700;' +
    'font-family:inherit;cursor:pointer;border:1px solid ' + color + ';' +
    'background:' + color + '18;color:' + color + ';transition:all .15s;" ' +
    'onmouseover="this.style.background=\'' + color + '\';this.style.color=\'#fff\'" ' +
    'onmouseout="this.style.background=\'' + color + '18\';this.style.color=\'' + color + '\'">' + label + '</button>';
}

function updateSRSBadge() {
  var due = 0;
  try { due = getDueItems().length; } catch(e) {}
  var badge = document.getElementById('nz-srs-badge');
  if (badge) { badge.style.display=due>0?'inline-flex':'none'; badge.textContent=due>99?'99+':String(due); }
}

Pages.srs = function() {
  var items = getDueItems();
  var idx=0, revealed=false, doneCount=0;
  updateSRSBadge();

  function renderSRS() {
    var item = items[idx];
    if (!item || idx>=items.length) {
      setHTML(
        '<div class="nz-page nz-fadein" style="max-width:560px;">' +
        '<h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;">⭐ SRS Review</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0 0 24px;">Spaced Repetition System</p>' +
        '<div style="text-align:center;padding:40px;background:var(--card);border:1px solid var(--border);border-radius:16px;margin-bottom:16px;">' +
          '<div style="font-size:48px;margin-bottom:12px;">🎉</div>' +
          '<div style="font-size:18px;font-weight:700;color:var(--fg);margin-bottom:6px;">All caught up!</div>' +
          '<div style="font-size:13px;color:var(--fg-muted);">You reviewed ' + doneCount + ' items today.</div>' +
        '</div>' +
        '<div style="display:flex;gap:9px;">' +
          '<button onclick="nzSRSAddCustom()" class="nz-btn nz-btn-ghost">+ Add Card</button>' +
          '<button onclick="Pages.srs()" class="nz-btn nz-btn-ghost">↺ Restart</button>' +
        '</div></div>'
      );
      return;
    }
    setHTML(
      '<div class="nz-page nz-fadein" style="max-width:560px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;">' +
        '<div><h1 style="font-size:22px;font-weight:800;color:var(--fg);margin:0 0 4px;">⭐ SRS Review</h1>' +
        '<p style="font-size:13px;color:var(--fg-muted);margin:0;">' + (idx+1) + ' / ' + items.length + ' due today</p></div>' +
        '<button onclick="nzSRSAddCustom()" class="nz-btn nz-btn-ghost" style="font-size:12px;padding:7px 12px;">+ Add Card</button>' +
      '</div>' +
      '<div style="background:var(--card);border:1px solid var(--border-strong);border-radius:18px;padding:32px;text-align:center;margin-bottom:16px;box-shadow:var(--shadow);">' +
        '<div style="font-size:11px;font-weight:700;color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;">' + H(item.type||'card') + ' · ' + H(item.level||'') + '</div>' +
        '<div style="font-family:\'Noto Serif JP\',serif;font-size:64px;color:var(--primary);line-height:1;margin-bottom:8px;cursor:pointer;" onclick="speak(\'' + H(item.front) + '\')" title="Tap to hear">' + H(item.front) + '</div>' +
        (item.reading ? '<div style="font-family:var(--font-mono);font-size:14px;color:var(--fg-muted);margin-bottom:16px;">' + H(item.reading) + '</div>' : '<div style="margin-bottom:16px;"></div>') +
        (revealed
          ? '<div style="font-size:16px;font-weight:700;color:var(--fg);padding:14px;background:var(--card-elevated);border-radius:10px;border:1px solid var(--border);">' + H(item.back) + '</div>'
          : '<button onclick="nzSRSReveal()" class="nz-btn nz-btn-pri" style="width:100%;justify-content:center;">Show Answer</button>') +
      '</div>' +
      (revealed
        ? '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">' +
          gradeBtn('again','😰 Again','var(--primary)') +
          gradeBtn('hard','😓 Hard','var(--n3)') +
          gradeBtn('good','😊 Good','var(--n4)') +
          gradeBtn('easy','😄 Easy','var(--n5)') +
          '</div>'
        : '') +
      '</div>'
    );
    window.nzSRSReveal = function(){ revealed=true; renderSRS(); };
    window.nzSRSGrade  = function(g){ srsGrade(item,g); doneCount++; idx++; revealed=false; renderSRS(); };
  }

  window.nzSRSAddCustom = function() {
    var ov=document.createElement('div'); ov.className='nz-overlay-bg';
    ov.innerHTML = '<div class="nz-modal-box">' +
      '<button onclick="this.closest(\'.nz-overlay-bg\').remove()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:22px;line-height:1;">×</button>' +
      '<h3 style="font-size:16px;font-weight:700;color:var(--fg);margin:0 0 16px;">⭐ Add SRS Card</h3>' +
      goalField('Front (question)','nz-srs-front','text','Kanji or word') +
      goalField('Reading','nz-srs-reading','text','e.g. もの') +
      goalField('Back (answer)','nz-srs-back','text','Meaning in English') +
      '<label style="font-size:12px;color:var(--fg-muted);display:block;margin-bottom:5px;">Type</label>' +
      '<select id="nz-srs-type" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:13px;font-family:inherit;box-sizing:border-box;margin-bottom:14px;">' +
        '<option value="kanji">Kanji</option><option value="vocab">Vocabulary</option><option value="grammar">Grammar</option>' +
      '</select>' +
      '<button onclick="nzSRSSaveCustom()" class="nz-btn nz-btn-pri" style="width:100%;justify-content:center;">Add Card</button></div>';
    document.body.appendChild(ov);
  };

  window.nzSRSSaveCustom = function() {
    var f=document.getElementById('nz-srs-front'); if(!f||!f.value.trim()) return;
    var r=document.getElementById('nz-srs-reading'), b=document.getElementById('nz-srs-back'), t=document.getElementById('nz-srs-type');
    getSRSItems().push({ id:'srs-custom-'+Date.now(), front:f.value.trim(),
      reading:r?r.value.trim():'', back:b?b.value.trim():'',
      type:t?t.value:'kanji', level:'custom', interval:1, due:Date.now() });
    saveSRS(); _srsItems=null;
    var ov=document.querySelector('.nz-overlay-bg'); if(ov)ov.remove();
    Pages.srs();
  };

  renderSRS();
};


/* ════════════════════════════════════════════════════════════════
   LEVEL-WISE SRS REVIEW — Kanji & Vocab pages
════════════════════════════════════════════════════════════════ */
window.nzKanjiLevelSRS = function(level) {
  _srsItems = getSRSItems();
  (kanjiData[level]||[]).forEach(function(k){
    if (!_srsItems.find(function(x){return x.id==='srs-'+k.id;})) {
      _srsItems.push({ id:'srs-'+k.id, front:k.kanji, reading:k.reading,
        back:k.meaning, type:'kanji', level:level, interval:1, due:Date.now() });
    }
  });
  saveSRS(); runLevelSRS(level,'kanji');
};

window.nzVocabLevelSRS = function(level) {
  var vList = VocabPageWords.filter(function(w){return w.level===level;});
  if (!vList.length) { nzShowToast('No vocab found for '+level); return; }
  _srsItems = getSRSItems();
  vList.slice(0,60).forEach(function(w){
    var wid='srs-v-'+(w.id||w.word||w.jp||Math.random());
    if (!_srsItems.find(function(x){return x.id===wid;})) {
      _srsItems.push({ id:wid, front:w.word||w.jp||'', reading:w.reading||'',
        back:w.meaning||w.en||'', type:'vocab', level:level, interval:1, due:Date.now() });
    }
  });
  saveSRS(); runLevelSRS(level,'vocab');
};

function runLevelSRS(level, type) {
  var items = getSRSItems().filter(function(i){return i.level===level&&i.type===type&&i.due<=Date.now();});
  if (!items.length) items = getSRSItems().filter(function(i){return i.level===level&&i.type===type;});
  if (!items.length) { nzShowToast('No '+type+' cards for '+level); return; }

  var idx2=0, revealed2=false, doneCount2=0;
  var color=jlptColor(level);
  var backRoute = type==='kanji'?'kanji':'vocab';

  function renderLevelSRS() {
    var item=items[idx2];
    if (!item||idx2>=items.length) {
      setHTML(
        '<div class="nz-page nz-fadein" style="max-width:560px;">' +
        '<button onclick="window.Router.go(\'' + backRoute + '\')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;padding:0;margin-bottom:20px;" onmouseover="this.style.color=\'var(--fg)\'" onmouseout="this.style.color=\'var(--fg-muted)\'">← Back</button>' +
        '<div style="text-align:center;padding:40px;background:var(--card);border:1px solid var(--border);border-radius:16px;">' +
          '<div style="font-size:48px;margin-bottom:12px;">🎉</div>' +
          '<div style="font-size:18px;font-weight:700;color:var(--fg);margin-bottom:6px;">' + level + ' ' + type + ' review done!</div>' +
          '<div style="font-size:13px;color:var(--fg-muted);">Reviewed ' + doneCount2 + ' items.</div>' +
        '</div></div>'
      );
      return;
    }
    setHTML(
      '<div class="nz-page nz-fadein" style="max-width:560px;">' +
      '<button onclick="window.Router.go(\'' + backRoute + '\')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--fg-muted);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;padding:0;margin-bottom:20px;" onmouseover="this.style.color=\'var(--fg)\'" onmouseout="this.style.color=\'var(--fg-muted)\'">← Back to ' + (type==='kanji'?'Kanji':'Vocab') + '</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">' +
        '<span style="font-size:11px;font-weight:800;color:' + color + ';background:' + color + '18;border:1px solid ' + color + ';padding:3px 10px;border-radius:6px;font-family:var(--font-mono);">' + level + '</span>' +
        '<span style="font-size:14px;font-weight:700;color:var(--fg);">' + (type==='kanji'?'Kanji':'Vocab') + ' SRS Review</span>' +
        '<span style="font-size:12px;color:var(--fg-muted);margin-left:auto;">' + (idx2+1) + ' / ' + items.length + '</span>' +
      '</div>' +
      '<div style="background:var(--card);border:1px solid var(--border-strong);border-radius:18px;padding:32px;text-align:center;margin-bottom:16px;box-shadow:var(--shadow);">' +
        '<div style="font-family:\'Noto Serif JP\',serif;font-size:64px;color:' + color + ';line-height:1;margin-bottom:8px;cursor:pointer;" onclick="speak(\'' + H(item.front) + '\')" title="Tap to hear">' + H(item.front) + '</div>' +
        (item.reading ? '<div style="font-family:var(--font-mono);font-size:14px;color:var(--fg-muted);margin-bottom:16px;">' + H(item.reading) + '</div>' : '<div style="margin-bottom:16px;"></div>') +
        (revealed2
          ? '<div style="font-size:16px;font-weight:700;color:var(--fg);padding:14px;background:var(--card-elevated);border-radius:10px;border:1px solid var(--border);">' + H(item.back) + '</div>'
          : '<button onclick="nzLvSRSReveal()" class="nz-btn nz-btn-pri" style="width:100%;justify-content:center;">Show Answer</button>') +
      '</div>' +
      (revealed2
        ? '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">' +
          gradeBtn('again','😰 Again','var(--primary)') +
          gradeBtn('hard','😓 Hard','var(--n3)') +
          gradeBtn('good','😊 Good','var(--n4)') +
          gradeBtn('easy','😄 Easy','var(--n5)') +
          '</div>'
        : '') +
      '</div>'
    );
    window.nzLvSRSReveal = function(){ revealed2=true; renderLevelSRS(); };
    window.nzSRSGrade    = function(g){ srsGrade(item,g); doneCount2++; idx2++; revealed2=false; renderLevelSRS(); };
  }
  renderLevelSRS();
}


/* ════════════════════════════════════════════════════════════════
   FEATURE 6 — Kanji Writing Canvas
   Patched onto Pages.kanji — appended BELOW existing grid only.
   Original kanji page content, layout, audio: completely untouched.
════════════════════════════════════════════════════════════════ */
var _origKanjiPage = Pages.kanji;
Pages.kanji = function() {
  _origKanjiPage();
  setTimeout(injectKanjiSRSButtons, 20);
  setTimeout(injectKanjiWritingCanvas, 30);
};

function injectKanjiSRSButtons() {
  var page = document.querySelector('#nz-content .nz-page');
  if (!page || document.getElementById('nz-kanji-srs-row')) return;
  var srsRow = document.createElement('div');
  srsRow.id = 'nz-kanji-srs-row';
  srsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center;';
  srsRow.innerHTML =
    '<span style="font-size:12px;font-weight:700;color:var(--fg-muted);">🔁 SRS Review by Level:</span>' +
    ['N5','N4','N3','N2','N1'].map(function(lv){
      var c=jlptColor(lv);
      return '<button onclick="window.nzKanjiLevelSRS(\'' + lv + '\')" ' +
        'style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;' +
        'border:1px solid ' + c + ';background:' + c + '18;color:' + c + ';transition:all .15s;" ' +
        'onmouseover="this.style.background=\'' + c + '\';this.style.color=\'#fff\'" ' +
        'onmouseout="this.style.background=\'' + c + '18\';this.style.color=\'' + c + '\'">' + lv + '</button>';
    }).join('');
  var second = page.children[1];
  if (second) page.insertBefore(srsRow, second); else page.appendChild(srsRow);
}

function injectKanjiWritingCanvas() {
  var page = document.querySelector('#nz-content .nz-page');
  if (!page || document.getElementById('nz-writing-canvas-section')) return;

  var CHARS = ['一','二','三','四','五','六','七','八','九','十','日','月','火','水','木','金','土','山','川','人','口','手','目','耳','足','犬','猫','魚','花','林'];

  var section = document.createElement('div');
  section.id = 'nz-writing-canvas-section';
  section.style.marginTop = '28px';
  section.innerHTML =
    '<h2 style="font-size:16px;font-weight:700;color:var(--fg);margin:0 0 14px;">✏️ Writing Practice</h2>' +
    '<div class="card" style="padding:20px;">' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">' +
        CHARS.map(function(c){
          return '<button onclick="nzWriteSetChar(\'' + H(c) + '\')" data-wchar="' + H(c) + '" ' +
            'style="width:38px;height:38px;border-radius:8px;font-family:\'Noto Serif JP\',serif;font-size:18px;cursor:pointer;transition:all .15s;' +
            'border:1px solid var(--border);background:var(--card-elevated);color:var(--fg);">' + H(c) + '</button>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
        '<div style="flex-shrink:0;position:relative;">' +
          '<div id="nz-write-guide" style="font-family:\'Noto Serif JP\',serif;font-size:80px;color:var(--primary);opacity:0.12;position:absolute;pointer-events:none;user-select:none;line-height:1;padding-left:4px;top:0;left:0;">一</div>' +
          '<canvas id="nz-write-canvas" width="240" height="240" style="border:2px solid var(--border);border-radius:12px;background:var(--card-elevated);cursor:crosshair;touch-action:none;display:block;position:relative;z-index:1;"></canvas>' +
        '</div>' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="margin-bottom:12px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Brush Size</div>' +
            '<div style="display:flex;gap:6px;">' +
              [6,10,16,24].map(function(sz){
                return '<button onclick="nzWriteSetBrush(' + sz + ')" data-wbrush="' + sz + '" ' +
                  'style="width:36px;height:36px;border-radius:8px;cursor:pointer;border:1px solid var(--border);background:var(--card-elevated);display:flex;align-items:center;justify-content:center;transition:all .15s;">' +
                  '<div style="width:' + Math.round(sz*0.6) + 'px;height:' + Math.round(sz*0.6) + 'px;border-radius:50%;background:var(--fg);"></div></button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom:14px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Ink Color</div>' +
            '<div style="display:flex;gap:6px;">' +
              [['#ffffff','White'],['#E8446A','Red'],['#22cc66','Green'],['#F0B429','Gold'],['#3B82F6','Blue']].map(function(cv){
                return '<button onclick="nzWriteSetColor(\'' + cv[0] + '\')" data-wcolor="' + cv[0] + '" title="' + cv[1] + '" ' +
                  'style="width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid var(--border);background:' + cv[0] + ';transition:all .15s;"></button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:7px;">' +
            '<button onclick="nzWriteClear()" class="nz-btn nz-btn-ghost" style="justify-content:center;">🗑️ Clear</button>' +
            '<button onclick="nzWriteUndo()" class="nz-btn nz-btn-ghost" style="justify-content:center;">↩ Undo</button>' +
            '<button onclick="nzWriteSave()" class="nz-btn nz-btn-pri" style="justify-content:center;">💾 Save (+5 XP)</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="nz-write-thumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;"></div>' +
    '</div>';

  page.appendChild(section);
  initWritingCanvas();
}

function initWritingCanvas() {
  var canvas = document.getElementById('nz-write-canvas'); if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var brushSize=10, brushColor='#ffffff', drawing=false, strokes=[], lastX=0, lastY=0;

  ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);

  function getPos(e) {
    var r=canvas.getBoundingClientRect(), src=e.touches?e.touches[0]:e;
    return { x:(src.clientX-r.left)*(canvas.width/r.width), y:(src.clientY-r.top)*(canvas.height/r.height) };
  }

  canvas.addEventListener('mousedown',  function(e){ drawing=true; var p=getPos(e); lastX=p.x; lastY=p.y; strokes.push(ctx.getImageData(0,0,canvas.width,canvas.height)); e.preventDefault(); });
  canvas.addEventListener('mousemove',  function(e){ if(!drawing)return; e.preventDefault(); var p=getPos(e); ctx.strokeStyle=brushColor; ctx.lineWidth=brushSize; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(p.x,p.y); ctx.stroke(); lastX=p.x; lastY=p.y; });
  canvas.addEventListener('mouseup',    function(){ drawing=false; });
  canvas.addEventListener('mouseleave', function(){ drawing=false; });
  canvas.addEventListener('touchstart', function(e){ drawing=true; var p=getPos(e); lastX=p.x; lastY=p.y; strokes.push(ctx.getImageData(0,0,canvas.width,canvas.height)); e.preventDefault(); },{passive:false});
  canvas.addEventListener('touchmove',  function(e){ if(!drawing)return; e.preventDefault(); var p=getPos(e); ctx.strokeStyle=brushColor; ctx.lineWidth=brushSize; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(p.x,p.y); ctx.stroke(); lastX=p.x; lastY=p.y; },{passive:false});
  canvas.addEventListener('touchend',   function(){ drawing=false; });

  var savedThumbs = JSON.parse(localStorage.getItem('nz-write-thumbs')||'[]');

  function renderThumbs() {
    var c2=document.getElementById('nz-write-thumbs'); if(!c2||!savedThumbs.length) return;
    c2.innerHTML=savedThumbs.map(function(t,i){
      return '<div style="position:relative;cursor:pointer;" title="Click to restore">' +
        '<img src="'+t.data+'" width="60" height="60" style="border-radius:8px;border:1px solid var(--border);display:block;" onclick="nzWriteRestore('+i+')">' +
        '<span style="position:absolute;bottom:2px;right:2px;font-size:9px;color:var(--fg-subtle);background:rgba(0,0,0,.6);padding:1px 3px;border-radius:3px;">'+(t.char||'')+'</span>' +
      '</div>';
    }).join('');
  }
  renderThumbs();

  window._nzCurrentWriteChar = '一';

  window.nzWriteSetChar = function(c) {
    var g=document.getElementById('nz-write-guide'); if(g) g.textContent=c;
    document.querySelectorAll('[data-wchar]').forEach(function(btn){
      var a=btn.dataset.wchar===c;
      btn.style.background=a?'var(--primary-dim)':'var(--card-elevated)';
      btn.style.color=a?'var(--primary)':'var(--fg)';
      btn.style.borderColor=a?'var(--primary)':'var(--border)';
    });
    window._nzCurrentWriteChar=c;
  };

  window.nzWriteSetBrush = function(sz) {
    brushSize=sz;
    document.querySelectorAll('[data-wbrush]').forEach(function(btn){
      btn.style.borderColor=btn.dataset.wbrush==sz?'var(--primary)':'var(--border)';
    });
  };

  window.nzWriteSetColor = function(c) {
    brushColor=c;
    document.querySelectorAll('[data-wcolor]').forEach(function(btn){
      btn.style.borderWidth=btn.dataset.wcolor===c?'3px':'2px';
      btn.style.borderColor=btn.dataset.wcolor===c?'var(--primary)':'var(--border)';
    });
  };

  window.nzWriteClear = function() {
    strokes.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);
  };

  window.nzWriteUndo = function() {
    if (strokes.length) ctx.putImageData(strokes.pop(),0,0);
  };

  window.nzWriteSave = function() {
    var thumb=canvas.toDataURL('image/png',0.5);
    savedThumbs.unshift({data:thumb,char:window._nzCurrentWriteChar||'?'});
    if (savedThumbs.length>20) savedThumbs=savedThumbs.slice(0,20);
    localStorage.setItem('nz-write-thumbs',JSON.stringify(savedThumbs));
    renderThumbs();
    if (window._nzAddXP) window._nzAddXP(5);
    nzShowToast('Practice saved! +5 XP');
    if (window.nzAddNotif) window.nzAddNotif('task','✏️ Practice Saved','+5 XP earned!');
  };

  window.nzWriteRestore = function(i) {
    var thumb=savedThumbs[i]; if(!thumb) return;
    var img=new Image();
    img.onload=function(){ ctx.drawImage(img,0,0,canvas.width,canvas.height); };
    img.src=thumb.data;
  };
}

/* ════════════════════════════════════════════════════════════════
   VOCAB PAGE — inject SRS level buttons (no internal changes)
════════════════════════════════════════════════════════════════ */
var _origVocabPage = Pages.vocab;
Pages.vocab = function() {
  _origVocabPage();
  setTimeout(injectVocabSRSButtons, 80);
};

function injectVocabSRSButtons() {
  var root=document.getElementById('nz-vocab-root');
  if (!root||document.getElementById('nz-vocab-srs-row')) return;
  var srsRow=document.createElement('div');
  srsRow.id='nz-vocab-srs-row';
  srsRow.style.cssText='display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px 0;align-items:center;';
  srsRow.innerHTML =
    '<span style="font-size:12px;font-weight:700;color:var(--fg-muted);">🔁 SRS Review by Level:</span>' +
    ['N5','N4','N3','N2','N1'].map(function(lv){
      var c=jlptColor(lv);
      return '<button onclick="window.nzVocabLevelSRS(\'' + lv + '\')" ' +
        'style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;' +
        'border:1px solid ' + c + ';background:' + c + '18;color:' + c + ';transition:all .15s;" ' +
        'onmouseover="this.style.background=\'' + c + '\';this.style.color=\'#fff\'" ' +
        'onmouseout="this.style.background=\'' + c + '18\';this.style.color=\'' + c + '\'">' + lv + '</button>';
    }).join('');
  root.insertBefore(srsRow, root.firstChild);
}


/* ════════════════════════════════════════════════════════════════
   PATCH renderShell — adds new sidebar nav + desktop theme toggle
════════════════════════════════════════════════════════════════ */
var _origRenderShellFn = renderShell;
window.renderShell = renderShell = function() {
  // Always run original first — this is what shows the UI
  _origRenderShellFn();

  // BUGFIX: Wrap all feature injections in try/catch
  // If any feature crashes here, the shell still renders correctly
  try {
  var nav = document.querySelector('#nz-sb .nz-sb-nav');
  if (!nav) return;

  var toolsSect = null;
  nav.querySelectorAll('.nz-sb-sect').forEach(function(el){
    if (el.textContent.trim()==='Tools') toolsSect=el;
  });

  var newSection = document.createElement('span');
  newSection.className='nz-sb-sect';
  newSection.style.marginTop='14px';
  newSection.textContent='Community & Tools';

  var chatLink  = createNavEl('chat',  '💬','Community Chat');
  var goalsLink = createNavEl('goals', '🎯','My Goals');
  var srsLink   = createNavEl('srs',   '⭐','SRS Review');
  var notesLink = createNavEl('notes', '📝','Smart Notes');

  var badge=document.createElement('span');
  badge.id='nz-srs-badge';
  // BUGFIX: getDueItems can crash if kanjiData not loaded — default to 0
  var due = 0;
  try { due = getDueItems().length; } catch(e) { due = 0; }
  badge.style.cssText='font-size:10px;font-weight:800;padding:1px 6px;border-radius:10px;' +
    'background:var(--primary);color:#fff;margin-left:auto;align-items:center;' +
    'display:'+(due>0?'inline-flex':'none')+';';
  badge.textContent=due>99?'99+':String(due);
  srsLink.appendChild(badge);

  if (toolsSect) {
    nav.insertBefore(notesLink,  toolsSect);
    nav.insertBefore(srsLink,    toolsSect);
    nav.insertBefore(goalsLink,  toolsSect);
    nav.insertBefore(chatLink,   toolsSect);
    nav.insertBefore(newSection, toolsSect);
  } else {
    nav.appendChild(newSection);
    nav.appendChild(chatLink);
    nav.appendChild(goalsLink);
    nav.appendChild(srsLink);
    nav.appendChild(notesLink);
  }

  // Desktop theme toggle in sidebar logo bar
  var sbTop=document.querySelector('.nz-sb-top');
  if (sbTop && !document.getElementById('nz-theme-toggle-desk')) {
    var tbDesk=document.createElement('button');
    tbDesk.id='nz-theme-toggle-desk';
    tbDesk.textContent=window._nzLightMode?'🌙':'🌸';
    tbDesk.title='Toggle theme';
    tbDesk.style.cssText='background:none;border:none;font-size:16px;cursor:pointer;' +
      'margin-left:auto;padding:4px 6px;border-radius:6px;color:var(--fg-muted);transition:all .2s;';
    tbDesk.onclick=function(){
      window.nzToggleTheme();
      tbDesk.textContent=window._nzLightMode?'🌙':'🌸';
    };
    sbTop.appendChild(tbDesk);
  }

  setTimeout(injectThemeAndNotifButtons, 60);
  } catch(featureErr) {
    // Feature injection failed — log it but shell is already rendered fine
    console.error('NihongoZen: feature shell patch error:', featureErr);
  }
};

function createNavEl(route, icon, label) {
  var a=document.createElement('a');
  a.href='#'+route; a.dataset.route=route; a.className='nz-navlink';
  a.innerHTML='<span class="nz-navicon">'+icon+'</span><span class="nz-navlabel">'+label+'</span>';
  return a;
}

/* Register new routes after user is ready */
document.addEventListener('nz:userReady', function() {
  setTimeout(function(){
    if (window.Router) {
      window.Router.register('goals', function(){ Pages.goals(); });
      window.Router.register('srs',   function(){ Pages.srs(); });
      window.Router.register('notes', function(){ Pages.notes(); });
      window.Router.register('chat',  function(){ Pages.chat(); });
    }
  }, 150);
});

/* ════════════════════════════════════════════════════════════════
   EXPORTS
════════════════════════════════════════════════════════════════ */
window.Router      = NzRouter;
window.Pages       = Pages;
window.renderShell = renderShell;
window.speak       = speak;

