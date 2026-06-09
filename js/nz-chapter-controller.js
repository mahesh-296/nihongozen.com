'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: js/nz-chapter-controller.js
// NihongoZen — Chapter Module Integration Controller
//
// Responsibilities:
//   1. Deduplicates vocab inside the existing VocabPage before it renders
//   2. Injects "📖 Chapters" button next to "📚 Basic Vocab" button
//   3. Adds chapter-wise Grammar / Reading / Listening tabs inside the
//      chapter overlay modal (reuses NZChapterVocab's overlay infrastructure)
//   4. Wires chapter sidebar navigation across all four content types
//   5. Plugs into existing NZGrammar / NZReading / NZListening render helpers
//      so all styling (CSS vars, card classes, quiz HTML) exactly matches the
//      live site — zero new style classes introduced except those already
//      defined in nz-chapter-vocab.js
//
// LOAD ORDER (add to index.html before </body>):
//   <script src="js/nz-chapter-vocab.js"></script>
//   <script src="js/nz-chapter-grammar.js"></script>
//   <script src="js/nz-chapter-reading.js"></script>
//   <script src="js/nz-chapter-listening.js"></script>
//   <script src="js/nz-chapter-controller.js"></script>  ← this file
// ═══════════════════════════════════════════════════════════════════════════════

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 1 — VOCAB DEDUPLICATION
   Patches the existing NZVocabPage / NZData objects to remove duplicate words
   before they are rendered, without touching the original data arrays.
   ───────────────────────────────────────────────────────────────────────────── */
(function deduplicateVocab() {
  // Wait until data objects are ready then patch
  const tryPatch = () => {
    // Support both common export names
    const dataObj = window.NZData || window.VocabPageWords || window.NihongoZenData;
    if (!dataObj) { setTimeout(tryPatch, 200); return; }

    const levels = ['n5', 'n4', 'n3', 'n2', 'n1', 'N5', 'N4', 'N3', 'N2', 'N1'];
    levels.forEach(lvl => {
      const arr = dataObj[lvl] || dataObj[lvl.toLowerCase()] || dataObj[lvl.toUpperCase()];
      if (!Array.isArray(arr)) return;
      const seen = new Set();
      const deduped = arr.filter(w => {
        // Normalise key: trim + lowercase the Japanese
        const key = (w.jp || w.word || w.kanji || '').trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      // Replace in-place so existing references still work
      arr.length = 0;
      deduped.forEach(w => arr.push(w));
    });
    console.log('[NZChapter] Vocab deduplication complete.');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPatch);
  } else {
    tryPatch();
  }
})();


/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2 — CHAPTER CONTROLLER SINGLETON
   ───────────────────────────────────────────────────────────────────────────── */
const NZChapterController = (() => {

  /* ── State ─────────────────────────────────────────────── */
  let activeLevel   = 'N5';
  let activeChapter = 0;      // index into the active level's chapter array
  let activeTab     = 'vocab'; // 'vocab' | 'grammar' | 'reading' | 'listening'
  let quizState     = { active:false, idx:0, score:0, answered:false };
  let passageState  = { open:false, passageIdx:0, showTrans:false, reading:false };
  let dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };

  /* ── Colour map ────────────────────────────────────────── */
  const COLORS = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };

  /* ── Level → textbook label ────────────────────────────── */
  function bookLabel(level, ch) {
    const c = ch.chBook || ch.ch;
    const map = {
      N5: `Minna no Nihongo I — Ch ${c}`,
      N4: `Minna no Nihongo II — Ch ${c}`,
      N3: `Minna no Nihongo Chukyu — Ch ${c}`,
      N2: `Nihongo Somatome N2 — Ch ${c}`,
      N1: `Nihongo Somatome N1 — Ch ${c}`,
    };
    return map[level] || `Ch ${c}`;
  }

  /* ── Get chapter data ──────────────────────────────────── */
  function chapterList(tab) {
    const src = {
      vocab:     window.NZChapterData,
      grammar:   window.NZChapterGrammar,
      reading:   window.NZChapterReading,
      listening: window.NZChapterListening,
    }[tab];
    return (src && src[activeLevel]) || [];
  }

  function currentChapter(tab) {
    const list = chapterList(tab);
    return list[activeChapter] || list[0] || null;
  }

  /* ── Escape ────────────────────────────────────────────── */
  function esc(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Speaker icon SVG ──────────────────────────────────── */
  function spk(sz=14){
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>`;
  }

  /* ── TTS ───────────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate;
    window.speechSynthesis.speak(u);
  }

  /* ═══════════════════════════════════════════════════════
     MODAL SHELL (tab bar upgrade)
     Extends the existing NZChapterVocab overlay by adding
     four content-type tabs to the top bar.
     ═══════════════════════════════════════════════════════ */
  function ensureTabBar() {
    // The tab bar lives inside #nzcv-modal's top bar
    const modal = document.getElementById('nzcv-modal');
    if (!modal || document.getElementById('nzcc-tab-bar')) return;

    // Find the first child div (top bar) — inject tab bar after the heading group
    const topBar = modal.querySelector('div');
    if (!topBar) return;

    const tabBar = document.createElement('div');
    tabBar.id = 'nzcc-tab-bar';
    tabBar.style.cssText =
      'display:flex;gap:4px;padding:0 20px 0;border-bottom:1px solid var(--border,#2a2a2a);flex-shrink:0;';
    topBar.insertAdjacentElement('afterend', tabBar);
    renderTabBar();
  }

  function renderTabBar() {
    const bar = document.getElementById('nzcc-tab-bar');
    if (!bar) return;
    const tabs = [
      { id:'vocab',     label:'📚 Vocabulary' },
      { id:'grammar',   label:'文 Grammar'     },
      { id:'reading',   label:'📖 Reading'     },
      { id:'listening', label:'🎧 Listening'   },
    ];
    bar.innerHTML = tabs.map(t => `
      <button data-tab="${t.id}" style="
        padding:10px 15px; background:transparent; border:none;
        border-bottom:2px solid ${activeTab===t.id?'var(--primary,#e8446a)':'transparent'};
        color:${activeTab===t.id?'var(--fg,#f0f0f0)':'var(--fg-muted,#888)'};
        font-size:12px; font-weight:${activeTab===t.id?700:500};
        cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap;">
        ${t.label}
      </button>`).join('');
    bar.querySelectorAll('button[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        quizState = { active:false, idx:0, score:0, answered:false };
        passageState = { open:false, passageIdx:0, showTrans:false, reading:false };
        dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
        renderTabBar();
        syncSidebar();
        renderChapterHeader();
        renderMainArea();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     SIDEBAR SYNC
     Overrides NZChapterVocab's sidebar to show chapters
     for the currently active tab's data source.
     ═══════════════════════════════════════════════════════ */
  function syncSidebar() {
    const sb = document.getElementById('nzcv-sidebar');
    if (!sb) return;
    const chapters = chapterList(activeTab);
    const color    = COLORS[activeLevel];
    sb.innerHTML = chapters.map((ch, i) => `
      <button class="nzcv-ch-btn ${i===activeChapter?'active':''}" data-idx="${i}"
        style="width:100%;padding:9px 16px;background:transparent;border:none;
               text-align:left;cursor:pointer;font-family:inherit;font-size:12px;
               color:${i===activeChapter?'var(--fg)':'var(--fg-muted,#888)'};
               border-left:3px solid ${i===activeChapter?color:'transparent'};
               font-weight:${i===activeChapter?700:400};
               transition:background 0.12s,color 0.12s;line-height:1.4;">
        <span style="display:inline-block;padding:1px 6px;border-radius:4px;
                     font-size:10px;font-weight:700;margin-right:6px;
                     background:${color}18;color:${color};
                     font-family:'JetBrains Mono',monospace;">${ch.ch}</span>
        <span style="font-size:11px;">${esc(ch.title)}</span>
      </button>`).join('');
    sb.querySelectorAll('.nzcv-ch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChapter = parseInt(btn.dataset.idx);
        quizState = { active:false, idx:0, score:0, answered:false };
        passageState = { open:false, passageIdx:0, showTrans:false, reading:false };
        dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
        syncSidebar();
        renderChapterHeader();
        renderMainArea();
        btn.scrollIntoView({ block:'nearest', behavior:'smooth' });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     CHAPTER HEADER
     ═══════════════════════════════════════════════════════ */
  function renderChapterHeader() {
    const wrap = document.getElementById('nzcv-ch-header');
    if (!wrap) return;
    const ch    = currentChapter(activeTab);
    if (!ch) { wrap.innerHTML = ''; return; }
    const color = COLORS[activeLevel];
    const list  = chapterList(activeTab);

    wrap.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;
                  flex-wrap:wrap;gap:8px;padding:16px 20px 12px;
                  border-bottom:1px solid var(--border,#2a2a2a);">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;
                         background:${color}22;color:${color};">${esc(activeLevel)}</span>
            <span style="font-size:11px;color:var(--fg-muted);">${esc(bookLabel(activeLevel,ch))}</span>
          </div>
          <div style="font-size:18px;font-weight:800;color:var(--fg);letter-spacing:-0.3px;margin-bottom:2px;
                      font-family:'Noto Sans JP',sans-serif;">${esc(ch.title)}</div>
          <div style="font-size:12px;color:var(--fg-muted);">${esc(ch.topic||'')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button id="nzcc-prev-ch" style="padding:7px;border-radius:10px;background:var(--card-elevated);
            border:1px solid var(--border);cursor:pointer;color:var(--fg);transition:border-color 0.15s;"
            ${activeChapter===0?'disabled style="opacity:0.3;pointer-events:none;"':''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button id="nzcc-next-ch" style="padding:7px;border-radius:10px;background:var(--card-elevated);
            border:1px solid var(--border);cursor:pointer;color:var(--fg);transition:border-color 0.15s;"
            ${activeChapter>=list.length-1?'disabled style="opacity:0.3;pointer-events:none;"':''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>`;

    document.getElementById('nzcc-prev-ch')?.addEventListener('click', () => {
      if (activeChapter > 0) { activeChapter--; refresh(); }
    });
    document.getElementById('nzcc-next-ch')?.addEventListener('click', () => {
      if (activeChapter < list.length - 1) { activeChapter++; refresh(); }
    });
  }

  function refresh() {
    quizState = { active:false, idx:0, score:0, answered:false };
    passageState = { open:false, passageIdx:0, showTrans:false, reading:false };
    dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
    syncSidebar();
    renderChapterHeader();
    renderMainArea();
  }

  /* ═══════════════════════════════════════════════════════
     MAIN AREA ROUTER
     ═══════════════════════════════════════════════════════ */
  function renderMainArea() {
    const area = document.getElementById('nzcv-main-area');
    if (!area) return;
    switch (activeTab) {
      case 'vocab':     renderVocabArea(area);     break;
      case 'grammar':   renderGrammarArea(area);   break;
      case 'reading':   renderReadingArea(area);   break;
      case 'listening': renderListeningArea(area); break;
    }
    // Hide search bar when not on vocab tab
    const searchWrap = document.querySelector('.nzcv-search-wrap')?.parentElement;
    if (searchWrap) searchWrap.style.display = activeTab === 'vocab' ? '' : 'none';
    // Hide mode buttons (grid/flashcard) when not on vocab tab
    const modeBtns = document.getElementById('nzcv-mode-btns');
    if (modeBtns) modeBtns.style.display = activeTab === 'vocab' ? '' : 'none';
  }

  /* ─── VOCAB ─────────────────────────────────────────── */
  function renderVocabArea(area) {
    // Delegate to NZChapterVocab's own render (it controls mode/flashcard/search)
    // We just trigger its internal render cycle by calling the public method it
    // exposes via renderAll() – however since NZChapterVocab is a closure we
    // cannot call renderAll() directly.  Instead we fire a synthetic click on
    // the active sidebar button which triggers NZChapterVocab's own handlers.
    // Simpler: just re-use NZChapterVocab data and render grid here ourselves.
    const ch = currentChapter('vocab');
    if (!ch) { area.innerHTML = '<p style="color:var(--fg-muted);padding:24px;">No vocabulary for this chapter.</p>'; return; }
    const color = COLORS[activeLevel];
    area.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
                                   gap:10px;padding:16px;">
      ${(ch.words||[]).map(w=>`
        <div class="nzcv-word-card" style="border-radius:12px;border:1px solid var(--border,#2a2a2a);
             background:var(--card,#141414);padding:16px;cursor:pointer;
             border-left:3px solid ${color};transition:transform 0.18s,box-shadow 0.18s;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
            <div>
              <div style="font-family:'Noto Sans JP',sans-serif;font-size:20px;font-weight:700;
                          color:var(--fg);margin-bottom:2px;">${esc(w.jp)}</div>
              <p style="font-family:'JetBrains Mono',monospace;font-size:10px;
                        color:var(--fg-muted);font-style:italic;">${esc(w.romaji||'')}</p>
            </div>
            <button class="nzcc-spk" data-jp="${esc(w.jp)}"
              style="padding:5px;border-radius:8px;border:none;background:transparent;
                     color:var(--fg-muted);cursor:pointer;">${spk(14)}</button>
          </div>
          <p style="font-size:12px;color:var(--fg);margin:0;">${esc(w.en)}</p>
        </div>`).join('')}
    </div>`;
    area.querySelectorAll('.nzcc-spk').forEach(b=>b.addEventListener('click',e=>{
      e.stopPropagation(); speak(b.dataset.jp);
    }));
  }

  /* ─── GRAMMAR ────────────────────────────────────────── */
  function renderGrammarArea(area) {
    const ch = currentChapter('grammar');
    if (!ch || !ch.points || !ch.points.length) {
      area.innerHTML = `<div class="nz-empty-state" style="text-align:center;padding:3rem;">
        <div style="font-size:2.5rem;">文</div>
        <p style="color:var(--fg-muted);">Grammar content for this chapter is coming soon.</p>
      </div>`; return;
    }
    area.innerHTML = `<div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
      ${ch.points.map((g,i)=>`
        <div class="nz-grammar-card" id="nzcc-gc-${i}"
          style="border-radius:12px;border:1px solid var(--border);background:var(--card);">
          <div class="nz-grammar-header" data-gi="${i}"
            style="display:flex;align-items:center;justify-content:space-between;
                   padding:14px 18px;cursor:pointer;gap:12px;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <span class="nz-grammar-pattern"
                  style="font-family:'Noto Sans JP',sans-serif;font-size:16px;font-weight:700;
                         color:var(--fg);">${esc(g.pattern)}</span>
                <span style="font-size:11px;color:var(--fg-muted);font-style:italic;">
                  ${esc(g.romaji||'')}</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
              <button class="nz-speak-btn nzcc-gspk" data-text="${esc(g.pattern)}"
                style="padding:4px;border:none;background:transparent;cursor:pointer;
                       color:var(--fg-muted);">${spk(13)}</button>
              <span class="nz-grammar-chevron" style="color:var(--fg-muted);font-size:14px;">▾</span>
            </div>
          </div>
          <div id="nzcc-gb-${i}" style="display:none;padding:0 18px 16px;">
            <p style="font-size:13px;color:var(--fg-muted);margin-bottom:12px;line-height:1.6;">
              ${esc(g.usage||'')}</p>
            ${g.example?`<div class="nz-grammar-example"
              style="background:var(--card-elevated);border-radius:8px;padding:12px 14px;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-family:'Noto Sans JP',sans-serif;font-size:15px;color:var(--fg);">
                  ${esc(g.example)}</span>
                <button class="nzcc-exspk" data-text="${esc(g.example)}"
                  style="padding:4px;border:none;background:transparent;cursor:pointer;
                         color:var(--fg-muted);flex-shrink:0;">${spk(12)}</button>
              </div>
              ${g.translation?`<div style="font-size:12px;color:var(--fg-muted);margin-top:4px;">
                ${esc(g.translation)}</div>`:''}
            </div>`:''}
            ${(g.more_examples||[]).map(ex=>`
              <div class="nz-grammar-example nz-grammar-example-more"
                style="background:var(--card-elevated);border-radius:8px;padding:10px 14px;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg);">
                    ${esc(ex.jp)}</span>
                  <button class="nzcc-exspk" data-text="${esc(ex.jp)}"
                    style="padding:4px;border:none;background:transparent;cursor:pointer;
                           color:var(--fg-muted);flex-shrink:0;">${spk(11)}</button>
                </div>
                ${ex.en?`<div style="font-size:11px;color:var(--fg-muted);margin-top:3px;">
                  ${esc(ex.en)}</div>`:''}
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;

    // Expand/collapse
    area.querySelectorAll('.nz-grammar-header[data-gi]').forEach(hdr=>{
      hdr.addEventListener('click', e=>{
        if (e.target.closest('.nz-speak-btn, .nzcc-gspk')) return;
        const i = hdr.dataset.gi;
        const body = document.getElementById(`nzcc-gb-${i}`);
        const chev = hdr.querySelector('.nz-grammar-chevron');
        const open = body.style.display!=='none';
        body.style.display = open?'none':'block';
        if (chev) chev.textContent = open?'▾':'▴';
      });
    });
    area.querySelectorAll('.nzcc-gspk,.nzcc-exspk').forEach(b=>{
      b.addEventListener('click', e=>{ e.stopPropagation(); speak(decodeURIComponent(b.dataset.text)); });
    });
  }

  /* ─── READING ────────────────────────────────────────── */
  function renderReadingArea(area) {
    if (passageState.open) { renderPassageView(area); return; }

    const ch = currentChapter('reading');
    if (!ch) {
      area.innerHTML=`<div style="text-align:center;padding:3rem;color:var(--fg-muted);">
        <div style="font-size:2.5rem;margin-bottom:1rem">📖</div>
        <p>No reading passage for this chapter yet.</p></div>`; return;
    }
    // Single passage per chapter — show info card then "Start Reading" button
    area.innerHTML = `
      <div style="padding:20px;max-width:680px;margin:0 auto;">
        <div class="nz-reading-card" style="border-radius:16px;border:1px solid var(--border);
             background:var(--card);padding:20px;margin-bottom:16px;">
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            <span class="nz-rc-level" style="padding:2px 8px;border-radius:6px;font-size:11px;
              font-weight:700;background:${COLORS[activeLevel]}22;color:${COLORS[activeLevel]};">
              ${esc(ch.level||activeLevel)}</span>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;
              background:var(--card-elevated);color:var(--fg-muted);">${esc(ch.difficulty||'')}</span>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;
              background:var(--card-elevated);color:var(--fg-muted);">${esc(ch.topic||'')}</span>
          </div>
          <h3 style="font-size:18px;font-weight:800;color:var(--fg);margin-bottom:8px;
                     font-family:'Noto Sans JP',sans-serif;">${esc(ch.title)}</h3>
          <p style="font-size:13px;color:var(--fg-muted);margin-bottom:16px;line-height:1.6;">
            ${esc(ch.passage?.[0]?.en||'')}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button id="nzcc-read-start"
              style="padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;
                     border:none;background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                     font-family:inherit;transition:opacity 0.15s;">
              📖 Start Reading →
            </button>
            ${(ch.quiz||[]).length?`<button id="nzcc-quiz-start"
              style="padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;
                     border:1px solid var(--border);background:var(--card-elevated);
                     color:var(--fg);cursor:pointer;font-family:inherit;transition:opacity 0.15s;">
              📝 Jump to Quiz
            </button>`:''}
          </div>
        </div>
        ${(ch.vocab||[]).length?`
          <div class="nz-vocab-section" style="border-radius:12px;border:1px solid var(--border);
               background:var(--card);padding:16px;">
            <h4 style="font-size:13px;font-weight:700;color:var(--fg-muted);margin-bottom:10px;">
              Key Vocabulary</h4>
            <div class="nz-vocab-chips" style="display:flex;flex-wrap:wrap;gap:8px;">
              ${(ch.vocab).map(v=>`
                <div class="nz-vocab-chip"
                  style="padding:5px 10px;border-radius:8px;background:var(--card-elevated);
                         border:1px solid var(--border);display:flex;align-items:center;gap:6px;">
                  <span style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg);">
                    ${esc(v.jp)}</span>
                  <span style="font-size:11px;color:var(--fg-muted);">${esc(v.en)}</span>
                  <button class="nzcc-vspk" data-jp="${esc(v.jp)}"
                    style="padding:3px;border:none;background:transparent;cursor:pointer;
                           color:var(--fg-muted);">${spk(11)}</button>
                </div>`).join('')}
            </div>
          </div>`:''}
      </div>`;

    document.getElementById('nzcc-read-start')?.addEventListener('click', ()=>{
      passageState.open=true; passageState.showTrans=false;
      quizState={ active:false, idx:0, score:0, answered:false };
      renderPassageView(area);
    });
    document.getElementById('nzcc-quiz-start')?.addEventListener('click', ()=>{
      passageState.open=true; quizState={ active:true, idx:0, score:0, answered:false };
      renderPassageView(area);
    });
    area.querySelectorAll('.nzcc-vspk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(b.dataset.jp);
    }));
  }

  function renderPassageView(area) {
    const ch = currentChapter('reading');
    if (!ch) return;

    if (quizState.active) { renderReadingQuiz(area, ch); return; }

    const lines = (ch.passage||[]).map((line,li)=>`
      <div class="nz-passage-line" id="nzcc-pl-${li}"
        style="padding:12px 0;border-bottom:1px solid var(--border,#1e1e1e);">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <div style="flex:1;">
            <div class="nz-line-jp"
              style="font-family:'Noto Sans JP',sans-serif;font-size:16px;color:var(--fg);
                     line-height:1.8;margin-bottom:2px;">${esc(line.jp)}</div>
            <div class="nz-line-en" id="nzcc-le-${li}"
              style="${passageState.showTrans?'':'display:none'};font-size:12px;
                     color:var(--fg-muted);margin-top:2px;">${esc(line.en)}</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;padding-top:2px;">
            <button class="nzcc-lspk" data-jp="${esc(line.jp)}"
              style="padding:5px;border-radius:8px;border:1px solid var(--border);
                     background:var(--card-elevated);cursor:pointer;color:var(--fg-muted);">
              ${spk(13)}
            </button>
            <button class="nzcc-ltoggle" data-li="${li}"
              style="padding:5px 8px;border-radius:8px;border:1px solid var(--border);
                     background:var(--card-elevated);cursor:pointer;color:var(--fg-muted);font-size:13px;">
              ${passageState.showTrans?'🙈':'👁'}
            </button>
          </div>
        </div>
      </div>`).join('');

    area.innerHTML = `
      <div class="nz-passage-wrap" style="padding:16px;max-width:720px;margin:0 auto;">
        <button id="nzcc-pass-back" class="nz-back-btn"
          style="margin-bottom:12px;padding:7px 14px;border-radius:8px;
                 border:1px solid var(--border);background:var(--card-elevated);
                 color:var(--fg-muted);cursor:pointer;font-size:12px;font-family:inherit;">
          ← Back to passage info
        </button>
        <div class="nz-reading-controls"
          style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <button id="nzcc-read-aloud"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;
                   border:1px solid var(--border);background:var(--card-elevated);
                   color:var(--fg);cursor:pointer;font-size:12px;font-family:inherit;">
            ${spk(14)} Read Aloud
          </button>
          <button id="nzcc-stop-aloud" style="display:none;padding:8px 14px;border-radius:10px;
            border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.1);
            color:#ef4444;cursor:pointer;font-size:12px;font-family:inherit;">
            ⏹ Stop
          </button>
          <div style="flex:1;"></div>
          <button id="nzcc-toggle-all"
            style="padding:8px 14px;border-radius:10px;border:1px solid var(--border);
                   background:var(--card-elevated);color:var(--fg-muted);cursor:pointer;
                   font-size:12px;font-family:inherit;">
            👁 ${passageState.showTrans?'Hide':'Show'} Translations
          </button>
        </div>
        <div id="nzcc-passage-body">${lines}</div>
        ${(ch.quiz||[]).length?`
          <button id="nzcc-to-quiz" class="nz-quiz-start-btn"
            style="display:block;width:100%;margin-top:20px;padding:12px;border-radius:12px;
                   border:none;background:linear-gradient(135deg,#e8446a,#c0304f);
                   color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">
            📝 Take Comprehension Quiz
          </button>`:''}
      </div>`;

    document.getElementById('nzcc-pass-back')?.addEventListener('click', ()=>{
      passageState.open=false; window.speechSynthesis?.cancel(); renderReadingArea(area);
    });
    document.getElementById('nzcc-to-quiz')?.addEventListener('click', ()=>{
      quizState={ active:true, idx:0, score:0, answered:false };
      renderReadingQuiz(area, ch);
    });
    document.getElementById('nzcc-toggle-all')?.addEventListener('click', ()=>{
      passageState.showTrans = !passageState.showTrans;
      area.querySelectorAll('[id^="nzcc-le-"]').forEach(el=>
        el.style.display = passageState.showTrans?'':'none');
      area.querySelectorAll('.nzcc-ltoggle').forEach(b=>
        b.textContent = passageState.showTrans?'🙈':'👁');
      const btn = document.getElementById('nzcc-toggle-all');
      if (btn) btn.textContent = `👁 ${passageState.showTrans?'Hide':'Show'} Translations`;
    });
    area.querySelectorAll('.nzcc-ltoggle').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const li  = btn.dataset.li;
        const el  = document.getElementById(`nzcc-le-${li}`);
        if (!el) return;
        const vis = el.style.display!=='none';
        el.style.display = vis?'none':'';
        btn.textContent  = vis?'👁':'🙈';
      });
    });
    area.querySelectorAll('.nzcc-lspk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(decodeURIComponent(b.dataset.jp));
    }));

    // Read aloud
    const raBtn   = document.getElementById('nzcc-read-aloud');
    const stopBtn = document.getElementById('nzcc-stop-aloud');
    raBtn?.addEventListener('click', ()=>{
      if (passageState.reading) return;
      passageState.reading=true;
      raBtn.style.display='none'; stopBtn.style.display='';
      const lines = ch.passage||[];
      let li=0;
      const next=()=>{
        if (!passageState.reading||li>=lines.length){
          passageState.reading=false;
          raBtn.style.display=''; stopBtn.style.display='none';
          area.querySelectorAll('.nz-passage-line.reading').forEach(e=>e.classList.remove('reading'));
          return;
        }
        area.querySelectorAll('.nz-passage-line.reading').forEach(e=>e.classList.remove('reading'));
        const el=document.getElementById(`nzcc-pl-${li}`);
        el?.classList.add('reading');
        el?.scrollIntoView({behavior:'smooth',block:'nearest'});
        const u=new SpeechSynthesisUtterance(lines[li].jp);
        u.lang='ja-JP'; u.rate=0.85;
        u.onend=()=>{ li++; setTimeout(next,900); };
        window.speechSynthesis?.cancel();
        window.speechSynthesis?.speak(u);
      };
      next();
    });
    stopBtn?.addEventListener('click', ()=>{
      passageState.reading=false;
      window.speechSynthesis?.cancel();
      raBtn.style.display=''; stopBtn.style.display='none';
      area.querySelectorAll('.nz-passage-line.reading').forEach(e=>e.classList.remove('reading'));
    });
  }

  function renderReadingQuiz(area, ch) {
    const qs = ch.quiz||[];
    if (quizState.idx >= qs.length) { renderQuizResult(area, qs.length, 'reading'); return; }
    const q = qs[quizState.idx];
    area.innerHTML = `
      <div class="nz-quiz-wrap" style="padding:24px;max-width:560px;margin:0 auto;">
        <div class="nz-quiz-progress"
          style="display:flex;justify-content:space-between;margin-bottom:16px;
                 font-size:12px;color:var(--fg-muted);">
          <span>Question ${quizState.idx+1} / ${qs.length}</span>
          <span class="nz-quiz-score">Score: ${quizState.score}</span>
        </div>
        <div class="nz-quiz-q"
          style="font-size:16px;font-weight:700;color:var(--fg);margin-bottom:16px;line-height:1.5;">
          ${esc(q.q)}</div>
        <div class="nz-quiz-opts" style="display:flex;flex-direction:column;gap:8px;">
          ${q.opts.map((o,i)=>`
            <button class="nz-quiz-opt nzcc-qopt" data-idx="${i}"
              style="padding:12px 16px;border-radius:10px;border:1px solid var(--border);
                     background:var(--card-elevated);color:var(--fg);text-align:left;
                     cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.15s;">
              ${esc(o)}
            </button>`).join('')}
        </div>
        <div id="nzcc-qfb" style="margin-top:12px;font-size:13px;font-weight:700;"></div>
      </div>`;
    area.querySelectorAll('.nzcc-qopt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if (quizState.answered) return;
        quizState.answered=true;
        const chosen=parseInt(btn.dataset.idx);
        const fb=document.getElementById('nzcc-qfb');
        if (chosen===q.ans){
          btn.style.background='rgba(34,197,94,0.15)'; btn.style.borderColor='#22c55e';
          quizState.score++;
          if (fb){ fb.textContent='✓ Correct!'; fb.style.color='#22c55e'; }
          speak('正解！','ja-JP',0.9);
        } else {
          btn.style.background='rgba(239,68,68,0.1)'; btn.style.borderColor='#ef4444';
          area.querySelectorAll('.nzcc-qopt')[q.ans].style.background='rgba(34,197,94,0.15)';
          area.querySelectorAll('.nzcc-qopt')[q.ans].style.borderColor='#22c55e';
          if (fb){ fb.textContent=`✗ Correct: ${esc(q.opts[q.ans])}`; fb.style.color='#ef4444'; }
        }
        setTimeout(()=>{
          quizState.idx++; quizState.answered=false;
          renderReadingQuiz(area, ch);
        }, 1400);
      });
    });
  }

  /* ─── LISTENING ──────────────────────────────────────── */
  function renderListeningArea(area) {
    if (dialogueState.open) { renderDialogueView(area); return; }

    const ch = currentChapter('listening');
    if (!ch) {
      area.innerHTML=`<div style="text-align:center;padding:3rem;color:var(--fg-muted);">
        <div style="font-size:2.5rem;margin-bottom:1rem">🎧</div>
        <p>No listening exercise for this chapter yet.</p></div>`; return;
    }
    area.innerHTML = `
      <div style="padding:20px;max-width:680px;margin:0 auto;">
        <div class="nz-listen-card" style="border-radius:16px;border:1px solid var(--border);
             background:var(--card);padding:20px;margin-bottom:16px;">
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;
              background:${COLORS[activeLevel]}22;color:${COLORS[activeLevel]};">
              ${esc(ch.level||activeLevel)}</span>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;
              background:var(--card-elevated);color:var(--fg-muted);">
              🎙️ ${(ch.script||[]).length} lines</span>
          </div>
          <h3 style="font-size:18px;font-weight:800;color:var(--fg);margin-bottom:6px;
                     font-family:'Noto Sans JP',sans-serif;">${esc(ch.title)}</h3>
          <p style="font-size:13px;color:var(--fg-muted);margin-bottom:16px;">
            ${esc(ch.script?.[0]?.en||'')}</p>
          <button id="nzcc-dial-start"
            style="padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;
                   border:none;background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                   font-family:inherit;">
            🎧 Start Listening →
          </button>
        </div>
        ${(ch.key_phrases||[]).length?`
          <div style="border-radius:12px;border:1px solid var(--border);
               background:var(--card);padding:16px;">
            <h4 style="font-size:13px;font-weight:700;color:var(--fg-muted);margin-bottom:10px;">
              Key Phrases</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${(ch.key_phrases).map(p=>`
                <div style="padding:5px 10px;border-radius:8px;background:var(--card-elevated);
                            border:1px solid var(--border);display:flex;align-items:center;gap:6px;">
                  <span style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg);">
                    ${esc(p.jp)}</span>
                  <span style="font-size:11px;color:var(--fg-muted);">${esc(p.en)}</span>
                  <button class="nzcc-pkspk" data-jp="${esc(p.jp)}"
                    style="padding:3px;border:none;background:transparent;cursor:pointer;
                           color:var(--fg-muted);">${spk(11)}</button>
                </div>`).join('')}
            </div>
          </div>`:''}
      </div>`;

    document.getElementById('nzcc-dial-start')?.addEventListener('click', ()=>{
      dialogueState.open=true; dialogueState.scriptVisible=false;
      quizState={ active:false, idx:0, score:0, answered:false };
      renderDialogueView(area);
    });
    area.querySelectorAll('.nzcc-pkspk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(b.dataset.jp);
    }));
  }

  function renderDialogueView(area) {
    const ch = currentChapter('listening');
    if (!ch) return;
    if (quizState.active) { renderListeningQuiz(area, ch); return; }

    const scriptHTML = (ch.script||[]).map(line=>`
      <div class="nz-script-line"
        style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border,#1e1e1e);">
        <span class="nz-script-speaker"
          style="min-width:70px;font-size:11px;font-weight:700;padding:2px 8px;
                 border-radius:6px;background:var(--card-elevated);color:var(--fg-muted);
                 height:fit-content;margin-top:3px;white-space:nowrap;">${esc(line.speaker)}</span>
        <div class="nz-script-text" style="flex:1;">
          <div class="nz-script-jp"
            style="font-family:'Noto Sans JP',sans-serif;font-size:15px;
                   color:var(--fg);margin-bottom:3px;">${esc(line.jp)}</div>
          <div class="nz-script-en"
            style="font-size:12px;color:var(--fg-muted);">${esc(line.en)}</div>
        </div>
        <button class="nzcc-sline-spk" data-jp="${esc(line.jp)}"
          style="padding:5px;border:1px solid var(--border);border-radius:8px;
                 background:var(--card-elevated);cursor:pointer;color:var(--fg-muted);flex-shrink:0;
                 align-self:flex-start;">${spk(12)}</button>
      </div>`).join('');

    area.innerHTML = `
      <div class="nz-listen-wrap" style="padding:16px;max-width:720px;margin:0 auto;">
        <button id="nzcc-dial-back"
          style="margin-bottom:12px;padding:7px 14px;border-radius:8px;
                 border:1px solid var(--border);background:var(--card-elevated);
                 color:var(--fg-muted);cursor:pointer;font-size:12px;font-family:inherit;">
          ← Back to dialogue info
        </button>

        <!-- Audio player (ready for real .mp3 files) -->
        <div class="nz-audio-player"
          style="display:flex;align-items:center;gap:12px;padding:14px;
                 border-radius:14px;border:1px solid var(--border);
                 background:var(--card);margin-bottom:16px;flex-wrap:wrap;">
          <div style="font-size:24px;">🎵</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:700;color:var(--fg);">${esc(ch.title)}</div>
            <div style="font-size:11px;color:var(--fg-muted);">
              Japanese Conversation • ${esc(ch.level||activeLevel)}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="nzcc-audio-play"
              style="padding:8px 16px;border-radius:10px;border:none;
                     background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                     font-family:inherit;font-size:13px;font-weight:700;">▶ Play</button>
            <button id="nzcc-audio-replay"
              style="padding:8px 14px;border-radius:10px;border:1px solid var(--border);
                     background:var(--card-elevated);color:var(--fg);cursor:pointer;
                     font-family:inherit;font-size:13px;">↺</button>
          </div>
          <audio id="nzcc-audio-el" src="${esc(ch.audio||'')}" preload="none"></audio>
          <div id="nzcc-audio-note"
            style="width:100%;font-size:11px;color:var(--fg-muted);margin-top:4px;">
            🎧 ${esc(ch.audio||'')}</div>
        </div>

        <!-- TTS read-all button -->
        <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <button id="nzcc-tts-dial"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;
                   border-radius:10px;border:1px solid var(--border);
                   background:var(--card-elevated);color:var(--fg);cursor:pointer;
                   font-size:12px;font-family:inherit;">
            ${spk(13)} Read Dialogue (TTS)
          </button>
        </div>

        <!-- Script toggle -->
        <button id="nzcc-script-toggle" class="nz-script-toggle"
          style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);
                 background:var(--card-elevated);color:var(--fg-muted);cursor:pointer;
                 font-size:13px;font-family:inherit;margin-bottom:8px;">
          👁️ ${dialogueState.scriptVisible?'Hide':'Show'} Script
        </button>
        <div id="nzcc-script-wrap" class="nz-script-wrap"
          style="${dialogueState.scriptVisible?'':'display:none;'}padding:0 0 12px;">
          ${scriptHTML}
        </div>

        ${(ch.questions||[]).length?`
          <button id="nzcc-lquiz-start"
            style="display:block;width:100%;margin-top:16px;padding:12px;border-radius:12px;
                   border:none;background:linear-gradient(135deg,#e8446a,#c0304f);
                   color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">
            📝 Take Comprehension Quiz
          </button>`:''}
      </div>`;

    document.getElementById('nzcc-dial-back')?.addEventListener('click', ()=>{
      dialogueState.open=false; window.speechSynthesis?.cancel();
      const audioEl=document.getElementById('nzcc-audio-el');
      if (audioEl) audioEl.pause();
      renderListeningArea(area);
    });

    // Real audio playback
    const audioEl = document.getElementById('nzcc-audio-el');
    document.getElementById('nzcc-audio-play')?.addEventListener('click', ()=>{
      if (!audioEl) return;
      if (audioEl.paused){
        audioEl.play().catch(()=>{
          const note=document.getElementById('nzcc-audio-note');
          if (note){ note.textContent='⚠️ Audio file not found. Add .mp3 to audio/ folder.'; note.style.color='#eab308'; }
        });
        document.getElementById('nzcc-audio-play').textContent='⏸ Pause';
      } else {
        audioEl.pause();
        document.getElementById('nzcc-audio-play').textContent='▶ Play';
      }
    });
    audioEl?.addEventListener('ended', ()=>{
      const pb=document.getElementById('nzcc-audio-play');
      if (pb) pb.textContent='▶ Play';
    });
    document.getElementById('nzcc-audio-replay')?.addEventListener('click', ()=>{
      if (!audioEl) return;
      audioEl.currentTime=0; audioEl.play().catch(()=>{});
      document.getElementById('nzcc-audio-play').textContent='⏸ Pause';
    });

    // TTS read dialogue
    document.getElementById('nzcc-tts-dial')?.addEventListener('click', ()=>{
      const lines=ch.script||[]; let i=0;
      const next=()=>{
        if (i>=lines.length) return;
        const u=new SpeechSynthesisUtterance(lines[i].jp);
        u.lang='ja-JP'; u.rate=0.85;
        u.onend=()=>{ i++; setTimeout(next, 800); };
        window.speechSynthesis?.cancel();
        window.speechSynthesis?.speak(u);
      };
      next();
    });

    // Script toggle
    document.getElementById('nzcc-script-toggle')?.addEventListener('click', ()=>{
      dialogueState.scriptVisible=!dialogueState.scriptVisible;
      const wrap=document.getElementById('nzcc-script-wrap');
      const btn=document.getElementById('nzcc-script-toggle');
      if (wrap) wrap.style.display=dialogueState.scriptVisible?'':'none';
      if (btn) btn.textContent=`${dialogueState.scriptVisible?'🙈 Hide':'👁️ Show'} Script`;
    });

    area.querySelectorAll('.nzcc-sline-spk').forEach(b=>b.addEventListener('click', e=>{
      e.stopPropagation(); speak(decodeURIComponent(b.dataset.jp));
    }));

    document.getElementById('nzcc-lquiz-start')?.addEventListener('click', ()=>{
      quizState={ active:true, idx:0, score:0, answered:false };
      renderListeningQuiz(area, ch);
    });
  }

  function renderListeningQuiz(area, ch) {
    const qs=ch.questions||[];
    if (quizState.idx>=qs.length){ renderQuizResult(area, qs.length,'listening'); return; }
    const q=qs[quizState.idx];
    area.innerHTML=`
      <div class="nz-quiz-wrap" style="padding:24px;max-width:560px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;
                    font-size:12px;color:var(--fg-muted);">
          <span>Question ${quizState.idx+1} / ${qs.length}</span>
          <span>Score: ${quizState.score}</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--fg);
                    margin-bottom:16px;line-height:1.5;">${esc(q.q)}</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${q.opts.map((o,i)=>`
            <button class="nz-quiz-opt nzcc-lqopt" data-idx="${i}"
              style="padding:12px 16px;border-radius:10px;border:1px solid var(--border);
                     background:var(--card-elevated);color:var(--fg);text-align:left;
                     cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.15s;">
              ${esc(o)}
            </button>`).join('')}
        </div>
        <div id="nzcc-lfb" style="margin-top:12px;font-size:13px;font-weight:700;"></div>
      </div>`;
    area.querySelectorAll('.nzcc-lqopt').forEach(btn=>{
      btn.addEventListener('click',()=>{
        if (quizState.answered) return;
        quizState.answered=true;
        const chosen=parseInt(btn.dataset.idx);
        const fb=document.getElementById('nzcc-lfb');
        if (chosen===q.ans){
          btn.style.background='rgba(34,197,94,0.15)'; btn.style.borderColor='#22c55e';
          quizState.score++;
          if (fb){ fb.textContent='✓ Correct!'; fb.style.color='#22c55e'; }
        } else {
          btn.style.background='rgba(239,68,68,0.1)'; btn.style.borderColor='#ef4444';
          area.querySelectorAll('.nzcc-lqopt')[q.ans].style.background='rgba(34,197,94,0.15)';
          area.querySelectorAll('.nzcc-lqopt')[q.ans].style.borderColor='#22c55e';
          if (fb){ fb.textContent=`✗ Correct: ${esc(q.opts[q.ans])}`; fb.style.color='#ef4444'; }
        }
        setTimeout(()=>{ quizState.idx++; quizState.answered=false; renderListeningQuiz(area,ch); },1400);
      });
    });
  }

  /* ─── SHARED QUIZ RESULT ─────────────────────────────── */
  function renderQuizResult(area, total, type) {
    const pct=Math.round(quizState.score/total*100);
    const msg=pct===100?'🏆 Perfect! 完璧!':pct>=70?'⭐ Well done!':'📚 Keep studying!';
    area.innerHTML=`
      <div class="nz-result-wrap"
        style="text-align:center;padding:40px 20px;max-width:420px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:12px;">${pct>=70?'🎉':'📖'}</div>
        <h2 style="font-size:22px;font-weight:800;color:var(--fg);margin-bottom:12px;">${msg}</h2>
        <div style="font-size:40px;font-weight:800;color:var(--primary,#e8446a);margin-bottom:4px;">
          ${quizState.score} / ${total}</div>
        <div style="font-size:14px;color:var(--fg-muted);margin-bottom:24px;">${pct}% accuracy</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button id="nzcc-retry"
            style="padding:10px 20px;border-radius:10px;border:1px solid var(--border);
                   background:var(--card-elevated);color:var(--fg);cursor:pointer;
                   font-size:13px;font-weight:700;font-family:inherit;">
            ↺ Try Again
          </button>
          <button id="nzcc-back-to-content"
            style="padding:10px 20px;border-radius:10px;border:none;
                   background:var(--primary,#e8446a);color:#fff;cursor:pointer;
                   font-size:13px;font-weight:700;font-family:inherit;">
            ← Back
          </button>
        </div>
      </div>`;
    document.getElementById('nzcc-retry')?.addEventListener('click',()=>{
      quizState={ active:true, idx:0, score:0, answered:false };
      renderMainArea();
    });
    document.getElementById('nzcc-back-to-content')?.addEventListener('click',()=>{
      quizState={ active:false, idx:0, score:0, answered:false };
      if (type==='reading')   passageState.open=true;
      if (type==='listening') dialogueState.open=true;
      renderMainArea();
    });
  }

  /* ═══════════════════════════════════════════════════════
     LEVEL TAB OVERRIDE
     Syncs level changes across all four data sources
     ═══════════════════════════════════════════════════════ */
  function patchLevelTabs() {
    const wrap = document.getElementById('nzcv-level-tabs');
    if (!wrap) return;
    wrap.querySelectorAll('button[data-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLevel   = btn.dataset.level;
        activeChapter = 0;
        quizState     = { active:false, idx:0, score:0, answered:false };
        passageState  = { open:false, passageIdx:0, showTrans:false, reading:false };
        dialogueState = { open:false, dialogueIdx:0, scriptVisible:false };
        syncSidebar();
        renderChapterHeader();
        renderMainArea();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     OPEN HOOK
     Called after NZChapterVocab.open() builds the modal DOM
     ═══════════════════════════════════════════════════════ */
  function onModalOpen() {
    ensureTabBar();
    // Give the vocab overlay a tick to finish its DOM setup
    setTimeout(() => {
      patchLevelTabs();
      // Mirror whatever level NZChapterVocab has active
      syncSidebar();
      renderChapterHeader();
      renderMainArea();
      renderTabBar();
    }, 50);
  }

  /* ═══════════════════════════════════════════════════════
     INJECT BUTTON — wraps NZChapterVocab.open()
     ═══════════════════════════════════════════════════════ */
  function injectButton() {
    const tryInject = () => {
      // Ensure NZChapterVocab is loaded
      if (!window.NZChapterVocab) { setTimeout(tryInject, 200); return; }

      // Look for the button container area in the vocab page
      // Support two common patterns: id="bv-open-btn" or class containing vocab
      const marker = document.getElementById('bv-open-btn') ||
                     document.querySelector('[id*="vocab"][id*="btn"]') ||
                     document.querySelector('.nz-vocab-header-btn');

      if (document.getElementById('nzcc-open-btn')) return; // already injected

      const btn = document.createElement('button');
      btn.id = 'nzcc-open-btn';
      btn.style.cssText =
        'background:linear-gradient(135deg,#e8446a,#c0304f);color:#fff;border:none;' +
        'padding:8px 18px;border-radius:10px;font-size:13px;font-weight:700;' +
        'cursor:pointer;font-family:inherit;transition:opacity 0.15s,transform 0.15s;' +
        'letter-spacing:0.3px;margin-right:8px;';
      btn.textContent = '📖 Chapters';
      btn.addEventListener('click', () => {
        window.NZChapterVocab.open();
        // Hook into the modal after it renders
        const waitForModal = setInterval(() => {
          if (document.getElementById('nzcv-overlay')?.classList.contains('open')) {
            clearInterval(waitForModal);
            onModalOpen();
          }
        }, 60);
      });

      if (marker) {
        marker.parentNode.insertBefore(btn, marker);
      } else {
        // Fallback: append to the vocab section header if it exists
        const vocabSection = document.querySelector('#vocab-section, .nz-vocab-section-wrap, [id*="vocab"]');
        if (vocabSection) vocabSection.prepend(btn);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryInject);
    } else {
      tryInject();
    }
  }

  /* ═══════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════ */
  return { injectButton, onModalOpen };

})();

window.NZChapterController = NZChapterController;
NZChapterController.injectButton();
