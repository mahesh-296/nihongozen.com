'use strict';
/**
 * NihongoZen — Chapter Module
 * ─────────────────────────────────────────────────────────────
 * Adds chapter-wise navigation buttons to Vocabulary, Grammar,
 * Reading, and Listening pages.
 *
 * Book structure:
 *   N5  → Minna no Nihongo I          (25 chapters)
 *   N4  → Minna no Nihongo II         (25 chapters)
 *   N3  → Minna no Nihongo Chukyu     (12 chapters)
 *   N2  → Nihongo Somatome N2         (12 chapters)
 *   N1  → Nihongo Somatome N1         (12 chapters)
 *
 * Styling: matches existing NihongoZen CSS variables exactly.
 *   --primary, --border, --card, --card-elevated, --fg, --fg-muted
 *   Level colors: N5=#22c55e, N4=#06b6d4, N3=#eab308, N2=#a855f7, N1=#ef4444
 *
 * Usage:
 *   NZChapterModule.mountVocab(containerEl, level)
 *   NZChapterModule.mountGrammar(containerEl, level)
 *   NZChapterModule.mountReading(containerEl, level)
 *   NZChapterModule.mountListening(containerEl, level)
 *   NZChapterModule.openChapterOverlay(level, chapterIndex, section)
 */

/* ─────────────────────────────────────────────────────────────
   INJECT STYLES (once)
───────────────────────────────────────────────────────────────*/
(function injectChapterStyles() {
  if (document.getElementById('nz-chapter-styles')) return;
  const s = document.createElement('style');
  s.id = 'nz-chapter-styles';
  s.textContent = `

  /* ── Scrollbar hide ─────────────────────────────────────── */
  #nz-ch-level-tabs::-webkit-scrollbar,
  #nz-ch-grid::-webkit-scrollbar,
  #nz-ch-section-tabs::-webkit-scrollbar,
  .nz-ch-vocab-list::-webkit-scrollbar  { display:none; }

  /* ── Level tab active underline (matches existing pattern) ─ */
  .nz-ch-lvl-tab { position:relative; transition:color 0.15s; }
  .nz-ch-lvl-tab.active::after {
    content:'';
    position:absolute;
    bottom:-2px; left:50%; transform:translateX(-50%);
    width:70%; height:2px;
    background:#22c55e;
    border-radius:2px;
  }

  /* ── Level accent colors ──────────────────────────────────── */
  .nz-ch-accent-N5 { color:#22c55e; border-color:#22c55e; }
  .nz-ch-accent-N4 { color:#06b6d4; border-color:#06b6d4; }
  .nz-ch-accent-N3 { color:#eab308; border-color:#eab308; }
  .nz-ch-accent-N2 { color:#a855f7; border-color:#a855f7; }
  .nz-ch-accent-N1 { color:#ef4444; border-color:#ef4444; }

  /* ── Chapter button ──────────────────────────────────────── */
  .nz-ch-btn {
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    gap:6px;
    padding:14px 16px;
    border-radius:12px;
    border:1px solid var(--border,#2a2a2a);
    background:var(--card,#141414);
    cursor:pointer;
    font-family:inherit;
    text-align:left;
    transition:transform 0.18s, box-shadow 0.18s, border-color 0.18s;
    position:relative;
    overflow:hidden;
  }
  .nz-ch-btn::before {
    content:'';
    position:absolute;
    top:0; left:0;
    width:3px; height:100%;
    border-radius:12px 0 0 12px;
    background:var(--nz-ch-color, #22c55e);
    opacity:0.9;
  }
  .nz-ch-btn:hover {
    transform:translateY(-2px);
    box-shadow:0 6px 24px rgba(0,0,0,0.45);
    border-color:var(--nz-ch-color,#22c55e);
  }
  .nz-ch-btn:active { transform:translateY(0); }

  .nz-ch-btn-num {
    font-family:'JetBrains Mono',monospace;
    font-size:10px;
    font-weight:700;
    color:var(--nz-ch-color,#22c55e);
    letter-spacing:0.5px;
  }
  .nz-ch-btn-title {
    font-size:12px;
    font-weight:700;
    color:var(--fg,#f0f0f0);
    line-height:1.35;
  }
  .nz-ch-btn-grammar {
    font-size:10px;
    color:var(--fg-muted,#666);
    line-height:1.3;
    font-family:'JetBrains Mono',monospace;
  }
  .nz-ch-btn-meta {
    display:flex;
    align-items:center;
    gap:6px;
    margin-top:2px;
  }
  .nz-ch-pill {
    padding:2px 7px;
    border-radius:4px;
    font-size:9px;
    font-weight:700;
    background:var(--nz-ch-color-dim,rgba(34,197,94,0.15));
    color:var(--nz-ch-color,#22c55e);
    letter-spacing:0.3px;
  }

  /* ── Book label strip ─────────────────────────────────────── */
  .nz-ch-book-label {
    font-size:10px;
    font-weight:700;
    color:var(--fg-muted,#666);
    letter-spacing:0.6px;
    text-transform:uppercase;
    padding:12px 0 8px;
    border-bottom:1px solid var(--border,#2a2a2a);
    margin-bottom:12px;
    display:flex;
    align-items:center;
    gap:8px;
  }
  .nz-ch-book-label span {
    padding:2px 8px;
    border-radius:4px;
    font-size:9px;
    font-weight:800;
    background:var(--nz-ch-color-dim);
    color:var(--nz-ch-color);
  }

  /* ── Chapter overlay ─────────────────────────────────────── */
  #nz-ch-overlay {
    display:none;
    position:fixed; inset:0;
    background:rgba(0,0,0,0.75);
    z-index:1000;
    backdrop-filter:blur(6px);
  }
  #nz-ch-overlay.open { display:flex; align-items:center; justify-content:center; }
  #nz-ch-modal {
    width:min(96vw,980px);
    max-height:90vh;
    background:var(--bg,#0f0f0f);
    border:1px solid var(--border,#333);
    border-radius:20px;
    overflow:hidden;
    display:flex;
    flex-direction:column;
  }

  /* ── Modal header ─────────────────────────────────────────── */
  #nz-ch-modal-header {
    padding:20px 24px 0;
    border-bottom:1px solid var(--border,#2a2a2a);
    padding-bottom:16px;
    flex-shrink:0;
  }
  #nz-ch-modal-title {
    font-size:18px;
    font-weight:800;
    color:var(--fg,#f0f0f0);
    letter-spacing:-0.3px;
    margin-bottom:3px;
  }
  #nz-ch-modal-sub {
    font-size:11px;
    color:var(--fg-muted,#666);
    font-family:'JetBrains Mono',monospace;
  }

  /* ── Section tabs (Vocab / Grammar / Reading / Listening) ─── */
  .nz-ch-sec-tab {
    padding:8px 16px;
    border-radius:8px;
    font-size:13px;
    font-weight:600;
    cursor:pointer;
    font-family:inherit;
    border:1px solid var(--border,#2a2a2a);
    background:var(--card-elevated,#1a1a1a);
    color:var(--fg-muted,#666);
    transition:all 0.15s;
  }
  .nz-ch-sec-tab.active {
    border-color:var(--nz-ch-color,#22c55e);
    background:var(--card-elevated,#1a1a1a);
    color:var(--fg,#f0f0f0);
  }

  /* ── Modal body ───────────────────────────────────────────── */
  #nz-ch-modal-body {
    flex:1;
    overflow-y:auto;
    padding:20px 24px 28px;
  }

  /* ── Vocab cards in chapter ───────────────────────────────── */
  .nz-ch-vcard {
    border-radius:12px;
    border:1px solid var(--border,#2a2a2a);
    background:var(--card,#141414);
    padding:14px 16px;
    cursor:pointer;
    border-left:3px solid var(--nz-ch-color,#22c55e);
    transition:transform 0.18s, box-shadow 0.18s;
    position:relative;
  }
  .nz-ch-vcard:hover {
    transform:translateY(-2px);
    box-shadow:0 6px 24px rgba(0,0,0,0.4);
  }
  .nz-ch-vcard-jp {
    font-family:'Noto Sans JP',sans-serif;
    font-size:22px;
    font-weight:700;
    color:var(--fg,#f0f0f0);
    margin-bottom:2px;
  }
  .nz-ch-vcard-reading {
    font-family:'JetBrains Mono',monospace;
    font-size:11px;
    color:var(--fg-muted,#666);
    font-style:italic;
    margin-bottom:6px;
  }
  .nz-ch-vcard-en {
    font-size:13px;
    color:var(--fg,#f0f0f0);
    margin-bottom:8px;
  }
  .nz-ch-vcard-pos {
    padding:2px 7px;
    border-radius:4px;
    font-size:9px;
    font-weight:700;
    background:var(--nz-ch-color-dim);
    color:var(--nz-ch-color);
  }
  .nz-ch-speak-btn {
    position:absolute;
    top:12px; right:12px;
    padding:6px;
    border-radius:8px;
    border:none;
    background:transparent;
    color:var(--fg-muted,#666);
    cursor:pointer;
    transition:all 0.15s;
  }
  .nz-ch-speak-btn:hover { background:var(--card-elevated,#1a1a1a); }

  /* ── Grammar cards in chapter ─────────────────────────────── */
  .nz-ch-gcard {
    border-radius:12px;
    border:1px solid var(--border,#2a2a2a);
    background:var(--card,#141414);
    padding:16px 18px;
    margin-bottom:12px;
  }
  .nz-ch-gcard-pattern {
    font-size:15px;
    font-weight:800;
    color:var(--nz-ch-color,#22c55e);
    font-family:'JetBrains Mono',monospace;
    margin-bottom:6px;
  }
  .nz-ch-gcard-usage {
    font-size:12px;
    color:var(--fg-muted,#888);
    margin-bottom:10px;
  }
  .nz-ch-gcard-ex {
    background:var(--card-elevated,#1a1a1a);
    border-radius:8px;
    padding:10px 12px;
    font-family:'Noto Sans JP',sans-serif;
    font-size:14px;
    color:var(--fg,#f0f0f0);
    margin-bottom:4px;
    display:flex;
    align-items:center;
    gap:8px;
  }
  .nz-ch-gcard-tr {
    font-size:11px;
    color:var(--fg-muted,#666);
    padding:0 2px;
  }

  /* ── Reading/Listening info card ─────────────────────────── */
  .nz-ch-info-card {
    border-radius:12px;
    border:1px solid var(--border,#2a2a2a);
    background:var(--card,#141414);
    padding:20px 22px;
    margin-bottom:16px;
  }
  .nz-ch-info-card h4 {
    font-size:13px;
    font-weight:700;
    color:var(--nz-ch-color,#22c55e);
    margin-bottom:8px;
    display:flex;
    align-items:center;
    gap:6px;
  }
  .nz-ch-info-card p {
    font-size:13px;
    color:var(--fg-muted,#999);
    line-height:1.6;
  }

  /* ── Nav row (prev/next chapter) ─────────────────────────── */
  .nz-ch-nav-row {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-top:24px;
    padding-top:16px;
    border-top:1px solid var(--border,#2a2a2a);
    gap:12px;
  }
  .nz-ch-nav-btn {
    display:flex;
    align-items:center;
    gap:6px;
    padding:9px 16px;
    border-radius:10px;
    border:1px solid var(--border,#2a2a2a);
    background:var(--card-elevated,#1a1a1a);
    color:var(--fg,#f0f0f0);
    font-size:13px;
    font-weight:600;
    cursor:pointer;
    font-family:inherit;
    transition:border-color 0.15s, background 0.15s;
  }
  .nz-ch-nav-btn:hover { border-color:var(--nz-ch-color,#22c55e); }
  .nz-ch-nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
  .nz-ch-nav-counter {
    font-family:'JetBrains Mono',monospace;
    font-size:12px;
    color:var(--fg-muted,#666);
  }

  /* ── Chapter open btn (top-bar entry point) ───────────────── */
  #nz-ch-open-btn {
    background:linear-gradient(135deg,#3b82f6,#6366f1);
    color:#fff;
    border:none;
    padding:8px 16px;
    border-radius:10px;
    font-size:13px;
    font-weight:700;
    cursor:pointer;
    font-family:inherit;
    transition:opacity 0.15s, transform 0.15s;
    letter-spacing:0.3px;
    display:flex;
    align-items:center;
    gap:6px;
  }
  #nz-ch-open-btn:hover { opacity:0.88; transform:translateY(-1px); }

  /* ── Search in chapter overlay ────────────────────────────── */
  .nz-ch-search-wrap {
    display:flex; align-items:center; gap:8px;
    background:var(--card-elevated,#1a1a1a);
    border:1px solid var(--border,#2a2a2a);
    border-radius:12px;
    padding:0 14px;
    height:38px;
    flex:1;
  }
  .nz-ch-search-wrap input {
    flex:1; background:transparent; border:none; outline:none;
    color:var(--fg,#f0f0f0); font-size:13px; font-family:inherit;
  }
  .nz-ch-search-wrap input::placeholder { color:var(--fg-muted,#666); }

  /* ── Empty state ──────────────────────────────────────────── */
  .nz-ch-empty {
    text-align:center;
    padding:48px 24px;
    color:var(--fg-muted,#666);
  }
  .nz-ch-empty .icon { font-size:2.5rem; margin-bottom:12px; }

  /* ── Flashcard in chapter ─────────────────────────────────── */
  .nz-ch-fc-wrap {
    max-width:360px;
    margin:0 auto;
    padding:8px 0 24px;
  }
  `;
  document.head.appendChild(s);
})();

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────*/
const CH_LEVEL_COLORS = {
  N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444'
};
const CH_LEVEL_DIM = {
  N5:'rgba(34,197,94,0.13)', N4:'rgba(6,182,212,0.13)',
  N3:'rgba(234,179,8,0.13)', N2:'rgba(168,85,247,0.13)', N1:'rgba(239,68,68,0.13)'
};
const SECTIONS = ['Vocabulary','Grammar','Reading','Listening'];
const SECTION_ICONS = { Vocabulary:'📖', Grammar:'文', Reading:'📄', Listening:'🎧' };

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────*/
function esc(s) {
  return String(s||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function speakerSVG(size=14) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>`;
}
function speak(text, lang='ja-JP', rate=0.82) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = rate;
  window.speechSynthesis.speak(u);
}
function speakWord(jp, en) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const j = new SpeechSynthesisUtterance(jp);
  j.lang='ja-JP'; j.rate=0.8;
  j.onend = () => setTimeout(() => {
    const e = new SpeechSynthesisUtterance(en);
    e.lang='en-US'; e.rate=0.88;
    window.speechSynthesis.speak(e);
  }, 550);
  window.speechSynthesis.speak(j);
}

/* ─────────────────────────────────────────────────────────────
   DATA ACCESSOR  (relies on window.NZChapterData from nz-chapter-data.js)
───────────────────────────────────────────────────────────────*/
function getData(level) {
  const d = window.NZChapterData;
  if (!d) { console.warn('NZChapterData not loaded.'); return []; }
  return d[level] || [];
}

/* ─────────────────────────────────────────────────────────────
   CSS VARIABLES HELPER  (set per-render to avoid global bleed)
───────────────────────────────────────────────────────────────*/
function setLevelVars(level) {
  const root = document.documentElement;
  root.style.setProperty('--nz-ch-color', CH_LEVEL_COLORS[level]);
  root.style.setProperty('--nz-ch-color-dim', CH_LEVEL_DIM[level]);
}

/* ═══════════════════════════════════════════════════════════════
   CHAPTER OVERLAY (shared modal)
═══════════════════════════════════════════════════════════════*/
const ChapterOverlay = (() => {
  let currentLevel   = 'N5';
  let currentIdx     = 0;
  let currentSection = 'Vocabulary';
  let vocabSearch    = '';
  let vocabMode      = 'grid';   // 'grid' | 'flashcard'
  let fcIndex        = 0;
  let fcFlipped      = false;
  let keyHandler     = null;

  /* ── Overlay build / open ──────────────────────────────────── */
  function open(level, idx, section) {
    currentLevel   = level || 'N5';
    currentIdx     = idx || 0;
    currentSection = section || 'Vocabulary';
    vocabSearch    = '';
    fcIndex        = 0;
    fcFlipped      = false;
    setLevelVars(currentLevel);

    let ov = document.getElementById('nz-ch-overlay');
    if (!ov) { buildShell(); ov = document.getElementById('nz-ch-overlay'); }
    ov.classList.add('open');
    renderOverlay();
  }

  function close() {
    detachKeys();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const ov = document.getElementById('nz-ch-overlay');
    if (ov) ov.classList.remove('open');
  }

  function buildShell() {
    const ov = document.createElement('div');
    ov.id = 'nz-ch-overlay';
    ov.innerHTML = `
      <div id="nz-ch-modal">
        <div id="nz-ch-modal-header">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
            <div style="flex:1;min-width:0;">
              <div id="nz-ch-modal-title">Chapter 1</div>
              <div id="nz-ch-modal-sub">Minna no Nihongo I · N5</div>
            </div>
            <button id="nz-ch-close-btn"
              style="padding:8px;border-radius:10px;background:var(--card-elevated,#1a1a1a);
                     border:1px solid var(--border,#2a2a2a);cursor:pointer;color:var(--fg-muted,#888);
                     font-size:18px;line-height:1;flex-shrink:0;transition:border-color 0.15s;">✕</button>
          </div>
          <!-- Section tabs -->
          <div id="nz-ch-section-tabs"
            style="display:flex;gap:8px;margin-top:14px;overflow-x:auto;scrollbar-width:none;"></div>
        </div>
        <div id="nz-ch-modal-body"></div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.getElementById('nz-ch-close-btn').addEventListener('click', close);
  }

  /* ── Main render ─────────────────────────────────────────── */
  function renderOverlay() {
    setLevelVars(currentLevel);
    const chapters = getData(currentLevel);
    if (!chapters.length) return;
    const ch = chapters[currentIdx];

    // Header
    document.getElementById('nz-ch-modal-title').textContent =
      `Ch.${ch.chapter} — ${ch.title}`;
    document.getElementById('nz-ch-modal-sub').textContent =
      `${ch.book} · ${currentLevel} · ${ch.grammar_point}`;

    // Section tabs
    const tabsEl = document.getElementById('nz-ch-section-tabs');
    tabsEl.innerHTML = SECTIONS.map(s => `
      <button class="nz-ch-sec-tab ${s===currentSection?'active':''}" data-sec="${esc(s)}">
        ${SECTION_ICONS[s]} ${s}
      </button>`).join('');
    tabsEl.querySelectorAll('.nz-ch-sec-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSection = btn.dataset.sec;
        vocabSearch = ''; fcIndex = 0; fcFlipped = false;
        detachKeys();
        renderOverlay();
      });
    });

    // Body
    const body = document.getElementById('nz-ch-modal-body');
    body.innerHTML = '';
    if (currentSection === 'Vocabulary') renderVocab(body, ch);
    else if (currentSection === 'Grammar') renderGrammar(body, ch);
    else if (currentSection === 'Reading') renderReading(body, ch);
    else if (currentSection === 'Listening') renderListening(body, ch);
    renderNav(body, chapters.length);
  }

  /* ── VOCABULARY SECTION ──────────────────────────────────── */
  function renderVocab(body, ch) {
    const col = CH_LEVEL_COLORS[currentLevel];
    const dim = CH_LEVEL_DIM[currentLevel];
    const vocab = ch.vocab || [];

    // Top controls: search + mode toggle
    const ctrl = document.createElement('div');
    ctrl.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;';
    ctrl.innerHTML = `
      <div class="nz-ch-search-wrap">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted,#666)"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input id="nz-ch-vocab-search" type="text" placeholder="Search vocab…" value="${esc(vocabSearch)}"/>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="nz-ch-mode-btn" data-mode="grid"
          style="padding:7px 13px;border-radius:8px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;
                 border:1px solid ${vocabMode==='grid'?col:'var(--border,#2a2a2a)'};
                 background:${vocabMode==='grid'?col:'var(--card-elevated,#1a1a1a)'};
                 color:${vocabMode==='grid'?'#fff':'var(--fg-muted,#666)'};transition:all 0.15s;">
          ⊞ Grid
        </button>
        <button class="nz-ch-mode-btn" data-mode="flashcard"
          style="padding:7px 13px;border-radius:8px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;
                 border:1px solid ${vocabMode==='flashcard'?col:'var(--border,#2a2a2a)'};
                 background:${vocabMode==='flashcard'?col:'var(--card-elevated,#1a1a1a)'};
                 color:${vocabMode==='flashcard'?'#fff':'var(--fg-muted,#666)'};transition:all 0.15s;">
          🃏 Cards
        </button>
      </div>
    `;
    body.appendChild(ctrl);

    ctrl.querySelector('#nz-ch-vocab-search').addEventListener('input', e => {
      vocabSearch = e.target.value; fcIndex = 0;
      const area = document.getElementById('nz-ch-vocab-area');
      if (area) {
        if (vocabMode === 'grid') renderVocabGrid(area, vocab, col, dim);
        else renderVocabFC(area, vocab, col, dim);
      }
    });
    ctrl.querySelectorAll('.nz-ch-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        vocabMode = btn.dataset.mode; fcIndex = 0; fcFlipped = false;
        detachKeys();
        // Re-render section
        renderOverlay();
      });
    });

    // Stats bar
    const stats = document.createElement('div');
    stats.style.cssText = 'margin-bottom:14px;display:flex;align-items:center;gap:8px;';
    stats.innerHTML = `
      <span style="font-size:12px;color:var(--fg-muted,#666);">
        ${vocab.length} words in this chapter
      </span>
      <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;
                   background:${dim};color:${col};">${currentLevel}</span>`;
    body.appendChild(stats);

    // Area
    const area = document.createElement('div');
    area.id = 'nz-ch-vocab-area';
    body.appendChild(area);

    if (vocabMode === 'grid') renderVocabGrid(area, vocab, col, dim);
    else renderVocabFC(area, vocab, col, dim);
  }

  function filteredVocab(vocab) {
    if (!vocabSearch.trim()) return vocab;
    const q = vocabSearch.toLowerCase();
    return vocab.filter(w =>
      w.jp.includes(q) || (w.reading||'').includes(q) || w.en.toLowerCase().includes(q));
  }

  function renderVocabGrid(area, vocab, col, dim) {
    const words = filteredVocab(vocab);
    if (!words.length) {
      area.innerHTML = `<div class="nz-ch-empty"><div class="icon">🔍</div><p>No words match your search.</p></div>`;
      return;
    }
    area.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
        ${words.map((w,i) => `
          <div class="nz-ch-vcard" data-i="${i}"
            style="--nz-ch-color:${col};--nz-ch-color-dim:${dim}">
            <button class="nz-ch-speak-btn" data-jp="${esc(w.jp)}" data-en="${esc(w.en)}"
              title="Listen">${speakerSVG(13)}</button>
            <div class="nz-ch-vcard-jp">${esc(w.jp)}</div>
            <div class="nz-ch-vcard-reading">${esc(w.reading||'')}</div>
            <div class="nz-ch-vcard-en">${esc(w.en)}</div>
            <span class="nz-ch-vcard-pos">${esc(w.pos||'')}</span>
          </div>`).join('')}
      </div>`;
    area.querySelectorAll('.nz-ch-vcard').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.nz-ch-speak-btn')) return;
        const w = words[parseInt(card.dataset.i)];
        if (w) speak(w.jp);
      });
    });
    area.querySelectorAll('.nz-ch-speak-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        speakWord(btn.dataset.jp, btn.dataset.en);
      });
    });
  }

  function renderVocabFC(area, vocab, col, dim) {
    const words = filteredVocab(vocab);
    if (!words.length) {
      area.innerHTML = `<div class="nz-ch-empty"><div class="icon">🃏</div><p>No words found.</p></div>`;
      return;
    }
    if (fcIndex >= words.length) fcIndex = 0;
    const w = words[fcIndex];
    area.innerHTML = `
      <div class="nz-ch-fc-wrap">
        <p style="font-size:11px;color:var(--fg-muted,#666);text-align:center;margin-bottom:14px;">
          Click card to flip · ← → keys to navigate
        </p>
        <!-- Flashcard -->
        <div id="nz-ch-fc" style="perspective:1000px;cursor:pointer;margin-bottom:18px;">
          <div id="nz-ch-fc-inner"
            style="position:relative;width:100%;height:200px;transform-style:preserve-3d;
                   transition:transform 0.55s cubic-bezier(0.4,0,0.2,1);
                   ${fcFlipped?'transform:rotateY(180deg)':''}">
            <!-- Front -->
            <div style="position:absolute;inset:0;border-radius:16px;border:1px solid var(--border,#2a2a2a);
                        background:var(--card,#141414);backface-visibility:hidden;-webkit-backface-visibility:hidden;
                        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;">
              <div style="font-family:'Noto Sans JP',sans-serif;font-size:44px;font-weight:700;
                          color:var(--fg,#f0f0f0);">${esc(w.jp)}</div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:12px;
                          color:var(--fg-muted,#666);">${esc(w.reading||'')}</div>
              <button id="nz-ch-fc-speak"
                style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:8px;
                       border:1px solid rgba(${col.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.35);
                       background:rgba(${col.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.12);
                       color:${col};font-size:11px;cursor:pointer;font-family:inherit;">
                ${speakerSVG(11)} Hear
              </button>
              <p style="font-size:10px;color:var(--fg-muted,#666);">Tap to reveal meaning</p>
            </div>
            <!-- Back -->
            <div style="position:absolute;inset:0;border-radius:16px;border:2px solid ${col};
                        background:var(--card,#141414);backface-visibility:hidden;-webkit-backface-visibility:hidden;
                        transform:rotateY(180deg);
                        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;">
              <div style="font-size:20px;font-weight:700;color:var(--fg,#f0f0f0);text-align:center;">
                ${esc(w.en)}</div>
              <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;
                           background:${dim};color:${col};">${esc(w.pos||'')}</span>
              <p style="font-size:10px;color:var(--fg-muted,#666);">Tap to flip back</p>
            </div>
          </div>
        </div>
        <!-- Nav -->
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
          <button id="nz-ch-fc-prev"
            style="padding:9px;border-radius:10px;background:var(--card-elevated,#1a1a1a);
                   border:1px solid var(--border,#2a2a2a);cursor:pointer;color:var(--fg,#f0f0f0);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--fg-muted,#666);">
            ${fcIndex+1} / ${words.length}
          </span>
          <button id="nz-ch-fc-next"
            style="padding:9px;border-radius:10px;background:var(--card-elevated,#1a1a1a);
                   border:1px solid var(--border,#2a2a2a);cursor:pointer;color:var(--fg,#f0f0f0);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <!-- Dots -->
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:12px;max-width:320px;margin-left:auto;margin-right:auto;">
          ${words.slice(0,Math.min(words.length,20)).map((_,i)=>`
            <button class="nz-ch-fc-dot" data-i="${i}"
              style="width:7px;height:7px;border-radius:50%;padding:0;cursor:pointer;border:none;
                     background:${i===fcIndex?col:'var(--border,#2a2a2a)'};">
            </button>`).join('')}
        </div>
      </div>`;

    area.querySelector('#nz-ch-fc').addEventListener('click', () => {
      fcFlipped = !fcFlipped;
      const inner = area.querySelector('#nz-ch-fc-inner');
      if (inner) inner.style.transform = fcFlipped ? 'rotateY(180deg)' : '';
    });
    area.querySelector('#nz-ch-fc-speak')?.addEventListener('click', e => {
      e.stopPropagation(); speak(w.jp);
    });
    area.querySelector('#nz-ch-fc-prev').addEventListener('click', e => {
      e.stopPropagation();
      fcFlipped = false; fcIndex = (fcIndex - 1 + words.length) % words.length;
      renderVocabFC(area, vocab, col, dim);
    });
    area.querySelector('#nz-ch-fc-next').addEventListener('click', e => {
      e.stopPropagation();
      fcFlipped = false; fcIndex = (fcIndex + 1) % words.length;
      renderVocabFC(area, vocab, col, dim);
    });
    area.querySelectorAll('.nz-ch-fc-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        fcFlipped = false; fcIndex = parseInt(dot.dataset.i);
        renderVocabFC(area, vocab, col, dim);
      });
    });
    attachKeys(words, vocab, area, col, dim);
  }

  /* ── GRAMMAR SECTION ─────────────────────────────────────── */
  function renderGrammar(body, ch) {
    const col = CH_LEVEL_COLORS[currentLevel];
    const dim = CH_LEVEL_DIM[currentLevel];
    const grammar = ch.grammar || [];

    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom:16px;';
    header.innerHTML = `
      <div style="font-size:12px;color:var(--fg-muted,#666);margin-bottom:8px;">
        Grammar points for Chapter ${ch.chapter}
      </div>
      <div style="padding:10px 14px;border-radius:10px;background:${dim};
                  border:1px solid ${col}44;font-family:'JetBrains Mono',monospace;
                  font-size:12px;color:${col};">
        ${esc(ch.grammar_point)}
      </div>
      ${ch.notes ? `<p style="font-size:12px;color:var(--fg-muted,#888);margin-top:8px;line-height:1.5;">${esc(ch.notes)}</p>`:''}`;
    body.appendChild(header);

    if (!grammar.length) {
      body.insertAdjacentHTML('beforeend',
        `<div class="nz-ch-empty"><div class="icon">文</div><p>Grammar data coming soon for this chapter.</p></div>`);
      return;
    }

    grammar.forEach((g, i) => {
      const card = document.createElement('div');
      card.className = 'nz-ch-gcard';
      card.style.setProperty('--nz-ch-color', col);
      card.innerHTML = `
        <div class="nz-ch-gcard-pattern">
          ${esc(g.pattern)}
          <button class="nz-ch-speak-btn" data-jp="${esc(g.pattern)}"
            style="display:inline-flex;vertical-align:middle;padding:4px;border-radius:6px;
                   border:none;background:transparent;color:${col};cursor:pointer;margin-left:8px;">
            ${speakerSVG(12)}
          </button>
        </div>
        <div class="nz-ch-gcard-usage">${esc(g.usage||'')}</div>
        ${g.example ? `
          <div class="nz-ch-gcard-ex">
            <span style="font-family:'Noto Sans JP',sans-serif;">${esc(g.example)}</span>
            <button class="nz-ch-speak-btn" data-jp="${esc(g.example)}"
              style="padding:4px;border-radius:6px;border:none;background:transparent;
                     color:var(--fg-muted,#666);cursor:pointer;flex-shrink:0;">
              ${speakerSVG(12)}
            </button>
          </div>
          ${g.translation ? `<div class="nz-ch-gcard-tr">${esc(g.translation)}</div>`:''}
        ` : ''}`;
      body.appendChild(card);
      card.querySelectorAll('.nz-ch-speak-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation(); speak(btn.dataset.jp);
        });
      });
    });
  }

  /* ── READING SECTION ─────────────────────────────────────── */
  function renderReading(body, ch) {
    const col = CH_LEVEL_COLORS[currentLevel];
    const dim = CH_LEVEL_DIM[currentLevel];

    const topics = [
      { icon:'📄', label:'Reading Topic', value: ch.reading_topic },
      { icon:'🔑', label:'Grammar Focus', value: ch.grammar_point },
      { icon:'📝', label:'Chapter Notes',  value: ch.notes },
    ].filter(t => t.value);

    topics.forEach(t => {
      const card = document.createElement('div');
      card.className = 'nz-ch-info-card';
      card.style.setProperty('--nz-ch-color', col);
      card.innerHTML = `
        <h4>${t.icon} ${t.label}</h4>
        <p>${esc(t.value)}</p>`;
      body.appendChild(card);
    });

    // Vocab preview for reading context
    const vocab = ch.vocab || [];
    if (vocab.length) {
      const vHead = document.createElement('div');
      vHead.innerHTML = `
        <div style="font-size:12px;font-weight:700;color:var(--fg-muted,#666);
                    margin-bottom:10px;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">
          Key Vocabulary for Reading
        </div>`;
      body.appendChild(vHead);
      const chips = document.createElement('div');
      chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;';
      vocab.slice(0,15).forEach(w => {
        chips.insertAdjacentHTML('beforeend', `
          <div style="display:inline-flex;align-items:center;gap:6px;
                      padding:6px 12px;border-radius:20px;
                      border:1px solid var(--border,#2a2a2a);background:var(--card,#141414);
                      cursor:pointer;"
               data-jp="${esc(w.jp)}" data-en="${esc(w.en)}">
            <span style="font-family:'Noto Sans JP',sans-serif;font-size:14px;
                         color:var(--fg,#f0f0f0);">${esc(w.jp)}</span>
            <span style="font-size:11px;color:var(--fg-muted,#666);">${esc(w.en)}</span>
          </div>`);
      });
      chips.querySelectorAll('div').forEach(chip => {
        chip.addEventListener('click', () => speakWord(chip.dataset.jp, chip.dataset.en));
      });
      body.appendChild(chips);
    }

    // File path note
    body.insertAdjacentHTML('beforeend', `
      <div style="padding:12px 16px;border-radius:10px;border:1px dashed var(--border,#2a2a2a);
                  background:var(--card-elevated,#1a1a1a);font-size:11px;
                  color:var(--fg-muted,#666);font-family:'JetBrains Mono',monospace;">
        📁 Reading data file: <span style="color:${col};">data/${currentLevel.toLowerCase()}/reading.json</span>
        — Add passages following the NZReading format to activate reading exercises.
      </div>`);
  }

  /* ── LISTENING SECTION ───────────────────────────────────── */
  function renderListening(body, ch) {
    const col = CH_LEVEL_COLORS[currentLevel];
    const dim = CH_LEVEL_DIM[currentLevel];

    const topics = [
      { icon:'🎧', label:'Listening Topic',  value: ch.listening_topic },
      { icon:'🗣️', label:'Language Focus',   value: ch.grammar_point },
      { icon:'📝', label:'Chapter Context',  value: ch.notes },
    ].filter(t => t.value);

    topics.forEach(t => {
      const card = document.createElement('div');
      card.className = 'nz-ch-info-card';
      card.style.setProperty('--nz-ch-color', col);
      card.innerHTML = `<h4>${t.icon} ${t.label}</h4><p>${esc(t.value)}</p>`;
      body.appendChild(card);
    });

    // Key phrases to practice listening
    const vocab = ch.vocab || [];
    if (vocab.length) {
      const vHead = document.createElement('div');
      vHead.innerHTML = `
        <div style="font-size:12px;font-weight:700;color:var(--fg-muted,#666);
                    margin-bottom:10px;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">
          Practice Listening — Key Phrases
        </div>`;
      body.appendChild(vHead);

      vocab.slice(0,10).forEach(w => {
        const row = document.createElement('div');
        row.style.cssText = `display:flex;align-items:center;justify-content:space-between;
          padding:10px 14px;border-radius:10px;border:1px solid var(--border,#2a2a2a);
          background:var(--card,#141414);margin-bottom:8px;cursor:pointer;`;
        row.innerHTML = `
          <div>
            <div style="font-family:'Noto Sans JP',sans-serif;font-size:16px;
                        font-weight:600;color:var(--fg,#f0f0f0);">${esc(w.jp)}</div>
            <div style="font-size:11px;color:var(--fg-muted,#666);">${esc(w.en)}</div>
          </div>
          <button style="padding:8px 12px;border-radius:8px;
                         border:1px solid ${col}55;background:${dim};
                         color:${col};font-size:12px;cursor:pointer;
                         display:flex;align-items:center;gap:5px;font-family:inherit;"
            data-jp="${esc(w.jp)}" data-en="${esc(w.en)}">
            ${speakerSVG(13)} Listen
          </button>`;
        row.querySelector('button').addEventListener('click', e => {
          e.stopPropagation();
          speakWord(e.currentTarget.dataset.jp, e.currentTarget.dataset.en);
        });
        row.addEventListener('click', () => speak(w.jp));
        body.appendChild(row);
      });
    }

    // Audio file note
    body.insertAdjacentHTML('beforeend', `
      <div style="padding:12px 16px;border-radius:10px;border:1px dashed var(--border,#2a2a2a);
                  background:var(--card-elevated,#1a1a1a);font-size:11px;
                  color:var(--fg-muted,#666);font-family:'JetBrains Mono',monospace;margin-top:4px;">
        📁 Audio data file: <span style="color:${col};">data/listening/${currentLevel.toLowerCase()}.json</span>
        — Add dialogues following the NZListening format to activate full listening exercises.
      </div>`);
  }

  /* ── NAV ROW (prev / next chapter) ──────────────────────── */
  function renderNav(body, total) {
    const nav = document.createElement('div');
    nav.className = 'nz-ch-nav-row';
    nav.innerHTML = `
      <button class="nz-ch-nav-btn" id="nz-ch-nav-prev" ${currentIdx===0?'disabled':''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        Prev
      </button>
      <span class="nz-ch-nav-counter">Ch. ${currentIdx+1} / ${total}</span>
      <button class="nz-ch-nav-btn" id="nz-ch-nav-next" ${currentIdx>=total-1?'disabled':''}>
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>`;
    body.appendChild(nav);

    nav.querySelector('#nz-ch-nav-prev')?.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx--; vocabSearch=''; fcIndex=0; fcFlipped=false; detachKeys();
        renderOverlay();
      }
    });
    nav.querySelector('#nz-ch-nav-next')?.addEventListener('click', () => {
      if (currentIdx < total-1) {
        currentIdx++; vocabSearch=''; fcIndex=0; fcFlipped=false; detachKeys();
        renderOverlay();
      }
    });
  }

  /* ── Keyboard nav for flashcards ─────────────────────────── */
  function attachKeys(words, vocab, area, col, dim) {
    detachKeys();
    keyHandler = e => {
      if (vocabMode !== 'flashcard') return;
      if (e.key==='ArrowRight') { e.preventDefault(); fcFlipped=false; fcIndex=(fcIndex+1)%words.length; renderVocabFC(area,vocab,col,dim); }
      else if (e.key==='ArrowLeft') { e.preventDefault(); fcFlipped=false; fcIndex=(fcIndex-1+words.length)%words.length; renderVocabFC(area,vocab,col,dim); }
      else if (e.key===' ') { e.preventDefault(); fcFlipped=!fcFlipped; const inn=area.querySelector('#nz-ch-fc-inner'); if(inn) inn.style.transform=fcFlipped?'rotateY(180deg)':''; }
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler=null; }
  }

  return { open, close };
})();

/* ═══════════════════════════════════════════════════════════════
   CHAPTER GRID (the list of chapter buttons shown on pages)
═══════════════════════════════════════════════════════════════*/
function buildChapterGrid(containerEl, level, activeSection) {
  setLevelVars(level);
  const col   = CH_LEVEL_COLORS[level];
  const dim   = CH_LEVEL_DIM[level];
  const chapters = getData(level);
  if (!chapters.length) {
    containerEl.innerHTML = `
      <div class="nz-ch-empty">
        <div class="icon">📚</div>
        <p>Chapter data not loaded. Make sure nz-chapter-data.js is included.</p>
      </div>`;
    return;
  }

  // Group by book
  const books = {};
  chapters.forEach((ch, i) => {
    if (!books[ch.book]) books[ch.book] = [];
    books[ch.book].push({ ch, i });
  });

  containerEl.innerHTML = '';
  Object.entries(books).forEach(([book, items]) => {
    const bookLabel = document.createElement('div');
    bookLabel.className = 'nz-ch-book-label';
    bookLabel.style.setProperty('--nz-ch-color', col);
    bookLabel.style.setProperty('--nz-ch-color-dim', dim);
    bookLabel.innerHTML = `<span>${level}</span> ${esc(book)} — ${items.length} chapters`;
    containerEl.appendChild(bookLabel);

    const grid = document.createElement('div');
    grid.style.cssText = `display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
      gap:10px;margin-bottom:24px;`;

    items.forEach(({ ch, i }) => {
      const btn = document.createElement('button');
      btn.className = 'nz-ch-btn';
      btn.style.setProperty('--nz-ch-color', col);
      btn.style.setProperty('--nz-ch-color-dim', dim);
      btn.dataset.idx = i;
      btn.innerHTML = `
        <div class="nz-ch-btn-num">CH ${ch.chapter}${ch.sections?` · ${ch.sections.length} SECTIONS`:''}</div>
        <div class="nz-ch-btn-title">${esc(ch.title)}</div>
        <div class="nz-ch-btn-grammar">${esc(ch.grammar_point||'')}</div>
        <div class="nz-ch-btn-meta">
          <span class="nz-ch-pill">${esc(level)}</span>
          <span class="nz-ch-pill" style="background:rgba(255,255,255,0.06);color:var(--fg-muted,#666);">
            ${(ch.vocab||[]).length} words
          </span>
        </div>`;
      btn.addEventListener('click', () => ChapterOverlay.open(level, i, activeSection));
      grid.appendChild(btn);
    });
    containerEl.appendChild(grid);
  });
}

/* ═══════════════════════════════════════════════════════════════
   MOUNT FUNCTIONS — call these from each page/module
═══════════════════════════════════════════════════════════════*/

/**
 * Mount the chapter panel inside the Vocabulary page.
 * Inserts a "📖 Chapters" button next to existing controls,
 * and adds a chapter grid below.
 *
 * @param {HTMLElement} containerEl  — the vocab page root element
 * @param {string}      level        — 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 */
function mountVocabChapters(containerEl, level) {
  const lvl = (level || 'N5').toUpperCase();
  const col  = CH_LEVEL_COLORS[lvl];

  // Find or create the inject point (after the header area)
  const injectPoint = containerEl.querySelector('#vocab-main-area') || containerEl;

  // Add chapter-open button to the header controls row (if not already there)
  const headerRight = containerEl.querySelector('[style*="display:flex"][style*="align-items:center"][style*="gap:10px"]');
  if (headerRight && !document.getElementById('nz-ch-open-btn')) {
    const btn = document.createElement('button');
    btn.id = 'nz-ch-open-btn';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      Chapters`;
    btn.addEventListener('click', () => ChapterOverlay.open(lvl, 0, 'Vocabulary'));
    headerRight.insertBefore(btn, headerRight.firstChild);
  }

  // Build inline chapter section
  const chSection = document.createElement('div');
  chSection.id = 'nz-ch-vocab-section';
  chSection.style.cssText = 'margin-bottom:24px;';
  chSection.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div>
        <h3 style="font-size:16px;font-weight:800;color:var(--fg,#f0f0f0);margin-bottom:2px;">
          📚 Chapter-Wise Vocabulary
        </h3>
        <p style="font-size:11px;color:var(--fg-muted,#666);">
          ${lvl === 'N5' || lvl === 'N4' ? 'Minna no Nihongo' : lvl === 'N3' ? 'Minna no Nihongo Chukyu' : 'Nihongo Somatome'} · ${lvl}
        </p>
      </div>
      <button style="padding:6px 14px;border-radius:8px;border:1px solid ${col};
                     background:transparent;color:${col};font-size:12px;font-weight:700;
                     cursor:pointer;font-family:inherit;transition:all 0.15s;"
        id="nz-ch-vocab-expand-btn">
        ⊞ Browse Chapters
      </button>
    </div>
    <div id="nz-ch-vocab-grid" style="display:none;"></div>`;

  // Insert before main-area or at top
  if (injectPoint && injectPoint.parentNode) {
    injectPoint.parentNode.insertBefore(chSection, injectPoint);
  } else {
    containerEl.prepend(chSection);
  }

  let expanded = false;
  document.getElementById('nz-ch-vocab-expand-btn')?.addEventListener('click', () => {
    expanded = !expanded;
    const grid = document.getElementById('nz-ch-vocab-grid');
    const btn  = document.getElementById('nz-ch-vocab-expand-btn');
    if (grid) {
      grid.style.display = expanded ? 'block' : 'none';
      if (expanded && !grid.children.length) buildChapterGrid(grid, lvl, 'Vocabulary');
    }
    if (btn) btn.textContent = expanded ? '▲ Collapse' : '⊞ Browse Chapters';
  });
}

/**
 * Mount the chapter panel inside the Grammar page.
 * @param {HTMLElement} containerEl
 * @param {string}      level
 */
function mountGrammarChapters(containerEl, level) {
  const lvl = (level || 'N5').toUpperCase();
  const col  = CH_LEVEL_COLORS[lvl];

  if (document.getElementById('nz-ch-grammar-section')) return; // idempotent

  const chSection = document.createElement('div');
  chSection.id = 'nz-ch-grammar-section';
  chSection.style.cssText = 'margin-bottom:24px;';
  chSection.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div>
        <h3 style="font-size:16px;font-weight:800;color:var(--fg,#f0f0f0);margin-bottom:2px;">
          文 Chapter-Wise Grammar
        </h3>
        <p style="font-size:11px;color:var(--fg-muted,#666);">
          Structured grammar points chapter by chapter · ${lvl}
        </p>
      </div>
      <button style="padding:6px 14px;border-radius:8px;border:1px solid ${col};
                     background:transparent;color:${col};font-size:12px;font-weight:700;
                     cursor:pointer;font-family:inherit;transition:all 0.15s;"
        id="nz-ch-gram-expand-btn">
        ⊞ Browse Chapters
      </button>
    </div>
    <div id="nz-ch-gram-grid" style="display:none;"></div>`;

  containerEl.prepend(chSection);

  let expanded = false;
  document.getElementById('nz-ch-gram-expand-btn')?.addEventListener('click', () => {
    expanded = !expanded;
    const grid = document.getElementById('nz-ch-gram-grid');
    const btn  = document.getElementById('nz-ch-gram-expand-btn');
    if (grid) {
      grid.style.display = expanded ? 'block' : 'none';
      if (expanded && !grid.children.length) buildChapterGrid(grid, lvl, 'Grammar');
    }
    if (btn) btn.textContent = expanded ? '▲ Collapse' : '⊞ Browse Chapters';
  });
}

/**
 * Mount the chapter panel inside the Reading page.
 * @param {HTMLElement} containerEl
 * @param {string}      level
 */
function mountReadingChapters(containerEl, level) {
  const lvl = (level || 'N5').toUpperCase();
  const col  = CH_LEVEL_COLORS[lvl];

  if (document.getElementById('nz-ch-reading-section')) return;

  const chSection = document.createElement('div');
  chSection.id = 'nz-ch-reading-section';
  chSection.style.cssText = 'margin-bottom:24px;';
  chSection.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div>
        <h3 style="font-size:16px;font-weight:800;color:var(--fg,#f0f0f0);margin-bottom:2px;">
          📄 Chapter-Wise Reading
        </h3>
        <p style="font-size:11px;color:var(--fg-muted,#666);">
          Reading topics and vocabulary by chapter · ${lvl}
        </p>
      </div>
      <button style="padding:6px 14px;border-radius:8px;border:1px solid ${col};
                     background:transparent;color:${col};font-size:12px;font-weight:700;
                     cursor:pointer;font-family:inherit;transition:all 0.15s;"
        id="nz-ch-read-expand-btn">
        ⊞ Browse Chapters
      </button>
    </div>
    <div id="nz-ch-read-grid" style="display:none;"></div>`;

  containerEl.prepend(chSection);

  let expanded = false;
  document.getElementById('nz-ch-read-expand-btn')?.addEventListener('click', () => {
    expanded = !expanded;
    const grid = document.getElementById('nz-ch-read-grid');
    const btn  = document.getElementById('nz-ch-read-expand-btn');
    if (grid) {
      grid.style.display = expanded ? 'block' : 'none';
      if (expanded && !grid.children.length) buildChapterGrid(grid, lvl, 'Reading');
    }
    if (btn) btn.textContent = expanded ? '▲ Collapse' : '⊞ Browse Chapters';
  });
}

/**
 * Mount the chapter panel inside the Listening page.
 * @param {HTMLElement} containerEl
 * @param {string}      level
 */
function mountListeningChapters(containerEl, level) {
  const lvl = (level || 'N5').toUpperCase();
  const col  = CH_LEVEL_COLORS[lvl];

  if (document.getElementById('nz-ch-listening-section')) return;

  const chSection = document.createElement('div');
  chSection.id = 'nz-ch-listening-section';
  chSection.style.cssText = 'margin-bottom:24px;';
  chSection.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div>
        <h3 style="font-size:16px;font-weight:800;color:var(--fg,#f0f0f0);margin-bottom:2px;">
          🎧 Chapter-Wise Listening
        </h3>
        <p style="font-size:11px;color:var(--fg-muted,#666);">
          Listening topics and key phrases by chapter · ${lvl}
        </p>
      </div>
      <button style="padding:6px 14px;border-radius:8px;border:1px solid ${col};
                     background:transparent;color:${col};font-size:12px;font-weight:700;
                     cursor:pointer;font-family:inherit;transition:all 0.15s;"
        id="nz-ch-listen-expand-btn">
        ⊞ Browse Chapters
      </button>
    </div>
    <div id="nz-ch-listen-grid" style="display:none;"></div>`;

  containerEl.prepend(chSection);

  let expanded = false;
  document.getElementById('nz-ch-listen-expand-btn')?.addEventListener('click', () => {
    expanded = !expanded;
    const grid = document.getElementById('nz-ch-listen-grid');
    const btn  = document.getElementById('nz-ch-listen-expand-btn');
    if (grid) {
      grid.style.display = expanded ? 'block' : 'none';
      if (expanded && !grid.children.length) buildChapterGrid(grid, lvl, 'Listening');
    }
    if (btn) btn.textContent = expanded ? '▲ Collapse' : '⊞ Browse Chapters';
  });
}

/* ─────────────────────────────────────────────────────────────
   Level-aware re-mount (call when user switches N5→N4 etc.)
───────────────────────────────────────────────────────────────*/
function refreshChapterGrids(level) {
  const lvl = (level||'N5').toUpperCase();
  ['nz-ch-vocab-grid','nz-ch-gram-grid','nz-ch-read-grid','nz-ch-listen-grid'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.children.length) buildChapterGrid(el, lvl, id.includes('vocab')?'Vocabulary':id.includes('gram')?'Grammar':id.includes('read')?'Reading':'Listening');
  });
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════*/
window.NZChapterModule = {
  /** Mount chapter UI inside Vocabulary page */
  mountVocab:     mountVocabChapters,
  /** Mount chapter UI inside Grammar page */
  mountGrammar:   mountGrammarChapters,
  /** Mount chapter UI inside Reading page */
  mountReading:   mountReadingChapters,
  /** Mount chapter UI inside Listening page */
  mountListening: mountListeningChapters,
  /** Open the chapter modal directly */
  openChapterOverlay: (level, idx, section) => ChapterOverlay.open(level, idx||0, section||'Vocabulary'),
  /** Call when user switches JLPT level to refresh open grids */
  refreshLevel: refreshChapterGrids,
  /** Close the overlay */
  closeOverlay: () => ChapterOverlay.close(),
};
