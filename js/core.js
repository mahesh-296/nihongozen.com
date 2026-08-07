'use strict';
/**
 * NihongoZen — Core Utilities
 * Security-hardened, XSS-safe vanilla JS
 */

/* =========================================================
   SECURITY — XSS Protection
   All dynamic content rendered via these helpers ONLY
   ========================================================= */
const Security = (() => {
  const ESC = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);

  /** Safe innerText setter — never uses innerHTML with untrusted input */
  const setText = (el, val) => { if (el) el.textContent = val; };

  /** Safe attribute setter */
  const setAttr = (el, attr, val) => { if (el) el.setAttribute(attr, esc(val)); };

  /** Create an element with safe text */
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  /** Safe HTML builder for trusted (static) template strings only */
  const safeHTML = strings => strings.raw ? strings.join('') : strings;

  return { esc, setText, setAttr, el, safeHTML };
})();

/* =========================================================
   SESSION — Mock auth token storage (secure practices)
   ========================================================= */
const Session = (() => {
  const KEY = 'nz_session';

  const get = () => {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch { return null; }
  };

  const set = data => {
    // Never store sensitive data like passwords
    const safe = { user: data.user, level: data.level, ts: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(safe));
  };

  const clear = () => sessionStorage.removeItem(KEY);

  const isLoggedIn = () => {
    const s = get();
    if (!s) return false;
    // Expire after 24h
    if (Date.now() - s.ts > 86400000) { clear(); return false; }
    return true;
  };

  // Auto-login mock user for demo
  const ensureDemo = () => {
    if (!isLoggedIn()) {
      set({ user: 'Kenji Tanaka', level: 12 });
    }
  };

  return { get, set, clear, isLoggedIn, ensureDemo };
})();

/* =========================================================
   ROUTER — SPA Navigation
   ========================================================= */
const Router = (() => {
  const handlers = {};
  let currentPage = 'dashboard';

  const register = (page, fn) => { handlers[page] = fn; };

  const go = (page, params = {}) => {
    currentPage = page;

    // Update active sidebar item
    document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`.sb-item[data-page="${page}"]`);
    if (active) active.classList.add('active');

    // Update mobile nav
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    const mobileActive = document.querySelector(`.nav-tab[data-page="${page}"]`);
    if (mobileActive) mobileActive.classList.add('active');

    // Scroll to top
    const content = document.getElementById('app-content');
    if (content) content.scrollTop = 0;

    // Run page handler
    if (handlers[page]) {
      handlers[page](params);
    } else {
      console.warn(`[Router] No handler for page: ${page}`);
    }

    // Close mobile drawer if open
    closeMobileDrawer();
  };

  const current = () => currentPage;

  return { register, go, current };
})();

/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */
const Toast = (() => {
  const getContainer = () => {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  };

  const show = (msg, type = 'info', duration = 3500) => {
    const container = getContainer();
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    t.textContent = `${icon} ${msg}`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition = 'all 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, duration);
  };

  return {
    success: msg => show(msg, 'success'),
    error:   msg => show(msg, 'error'),
    info:    msg => show(msg, 'info'),
  };
})();

/* =========================================================
   SPEECH — Web Speech API
   ========================================================= */
const Speech = (() => {
  const speak = (text, lang = 'ja-JP', rate = 0.85) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = rate;
    window.speechSynthesis.speak(utt);
  };

  const speakBoth = (jp, en) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const jpUtt = new SpeechSynthesisUtterance(jp);
    jpUtt.lang = 'ja-JP'; jpUtt.rate = 0.8;
    jpUtt.onend = () => setTimeout(() => {
      const enUtt = new SpeechSynthesisUtterance(en);
      enUtt.lang = 'en-US'; enUtt.rate = 0.9;
      window.speechSynthesis.speak(enUtt);
    }, 600);
    window.speechSynthesis.speak(jpUtt);
  };

  const cancel = () => window.speechSynthesis?.cancel();

  const playSequence = async (items, getJp, onActive, signal) => {
    for (const item of items) {
      if (signal && signal.aborted) break;
      if (onActive) onActive(item);
      await new Promise(resolve => {
        if (!window.speechSynthesis) { resolve(); return; }
        const utt = new SpeechSynthesisUtterance(getJp(item));
        utt.lang = 'ja-JP'; utt.rate = 0.85;
        utt.onend = () => setTimeout(resolve, 900);
        window.speechSynthesis.speak(utt);
      });
    }
    if (onActive) onActive(null);
  };

  return { speak, speakBoth, cancel, playSequence };
})();

/* =========================================================
   AUDIO — Chime via Web Audio API (timer done)
   ========================================================= */
const Audio = (() => {
  const chime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [261, 329, 392, 523].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.22 + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.22);
        osc.stop(ctx.currentTime + i * 0.22 + 0.5);
      });
    } catch (_) {}
  };
  return { chime };
})();

/* =========================================================
   APP STATE — Reactive mini-store
   ========================================================= */
const State = (() => {
  const state = {
    lang: 'en',          // 'en' | 'jp'
    learnedKanji: new Set(),
    sidebarCollapsed: false,
    userMenuOpen: false,
    mobileDrawerOpen: false,
    activePage: 'dashboard',
    xpToday: 340,
    xpGoal: 500,
    streak: 14,
    level: 12,
    totalXP: 4820,
    nextLevelXP: 6000,
    sessions: 2,          // pomodoro
  };

  // Initialize learned kanji from source data
  const initLearnedKanji = (allKanji) => {
    allKanji.filter(k => k.learned).forEach(k => state.learnedKanji.add(k.id));
  };

  const toggleLearnedKanji = id => {
    if (state.learnedKanji.has(id)) state.learnedKanji.delete(id);
    else state.learnedKanji.add(id);
  };

  const isLearned = id => state.learnedKanji.has(id);
  const learnedCount = () => state.learnedKanji.size;

  return { state, initLearnedKanji, toggleLearnedKanji, isLearned, learnedCount };
})();

/* =========================================================
   MOBILE DRAWER
   ========================================================= */
function openMobileDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawer  = document.getElementById('mobile-drawer');
  if (overlay) { overlay.style.display = 'block'; }
  if (drawer)  { drawer.style.display  = 'block'; }
  State.state.mobileDrawerOpen = true;
}

function closeMobileDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawer  = document.getElementById('mobile-drawer');
  if (overlay) overlay.style.display = 'none';
  if (drawer)  drawer.style.display  = 'none';
  State.state.mobileDrawerOpen = false;
}

/* =========================================================
   USER DROPDOWN
   ========================================================= */
function toggleUserMenu() {
  const menu = document.getElementById('user-dropdown');
  if (!menu) return;
  State.state.userMenuOpen = !State.state.userMenuOpen;
  menu.style.display = State.state.userMenuOpen ? 'block' : 'none';
}

function closeUserMenu() {
  const menu = document.getElementById('user-dropdown');
  if (menu) menu.style.display = 'none';
  State.state.userMenuOpen = false;
}

/* =========================================================
   SIDEBAR COLLAPSE
   ========================================================= */
function toggleSidebar() {
  const sb = document.getElementById('main-sidebar');
  if (!sb) return;
  State.state.sidebarCollapsed = !State.state.sidebarCollapsed;
  sb.classList.toggle('collapsed', State.state.sidebarCollapsed);
  const btn = document.getElementById('sb-toggle-btn');
  if (btn) btn.innerHTML = State.state.sidebarCollapsed ? '›' : '‹';
}

/* =========================================================
   LANGUAGE TOGGLE
   ========================================================= */
function setLang(lang) {
  State.state.lang = lang;
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Re-render sidebar labels
  document.querySelectorAll('.sb-item').forEach(item => {
    const lbl = item.querySelector('.sb-label');
    if (!lbl) return;
    const jp = item.dataset.labelJp;
    const en = item.dataset.labelEn;
    if (jp && en) lbl.textContent = lang === 'jp' ? jp : en;
  });
}

/* =========================================================
   PROGRESS BAR ANIMATE
   ========================================================= */
function animateProgressBars() {
  setTimeout(() => {
    document.querySelectorAll('[data-progress]').forEach(el => {
      el.style.width = el.dataset.progress + '%';
    });
  }, 350);
}

/* =========================================================
   RENDER HELPERS
   ========================================================= */
function renderContent(html) {
  const el = document.getElementById('app-content');
  if (!el) return;
  el.innerHTML = html;
  animateProgressBars();
}

/* =========================================================
   FORMAT HELPERS
   ========================================================= */
const fmt = {
  time: s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`,
  num:  n => Number(n).toLocaleString(),
  pct:  (v, t) => Math.round((v / t) * 100),
};

/* =========================================================
   GLOBAL CLICK OUTSIDE — close menus
   ========================================================= */
document.addEventListener('click', e => {
  // Close user menu
  if (!e.target.closest('#topbar-user-wrap')) {
    closeUserMenu();
  }
});

/* =========================================================
   INPUT SANITIZATION — validate email
   ========================================================= */
function validateEmail(email) {
  // RFC5322-ish, safe regex, no ReDoS risk
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email);
}

/* =========================================================
   ACCESSIBILITY — keyboard support for role="button" elements
   Many cards/rows/list-items across the app are <div onclick="...">
   for layout reasons. Giving them role="button" tabindex="0" makes
   them reachable by keyboard; this listener makes Enter/Space
   activate them exactly like a real <button> would, without having
   to rewrite every call site as an actual <button>.
   ========================================================= */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const target = e.target.closest('[role="button"]');
  if (!target) return;
  // Don't hijack Space/Enter typed inside a focused input/textarea nested in a card
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  e.preventDefault();
  target.click();
});
