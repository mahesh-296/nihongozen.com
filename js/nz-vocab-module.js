'use strict';
/**
 * NihongoZen — Vocabulary Page (Rebuilt)
 * Matches reference UI: 語彙 Vocabulary Study header, SRS level buttons,
 * N5/N4/N3/N2/N1 tabs with green underline active, search bar,
 * + "Basic Vocab" button housing 2,156 words × 20 categories.
 */

/* =========================================================
   VOCAB PAGE CSS
   ========================================================= */
(function injectVocabStyles() {
  if (document.getElementById('vocab-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'vocab-page-styles';
  style.textContent = `
    /* ── Scrollbar hide ─────────────────────────────────── */
    #vocab-cat-tabs::-webkit-scrollbar,
    #vocab-level-tabs::-webkit-scrollbar,
    #bv-cat-tabs::-webkit-scrollbar { display: none; }

    /* ── Flip card ──────────────────────────────────────── */
    #vocab-flip-inner.flipped,
    #bv-flip-inner.flipped { transform: rotateY(180deg); }

    /* ── Equalizer animation ────────────────────────────── */
    .nz-eq { display:flex; align-items:flex-end; gap:2px; height:14px; }
    .nz-eq-bar {
      width:3px; border-radius:2px;
      background:var(--primary);
      animation:nzEqBounce 0.8s ease-in-out infinite;
    }
    .nz-eq-bar:nth-child(1) { animation-delay:0s;    height:6px; }
    .nz-eq-bar:nth-child(2) { animation-delay:0.15s; height:12px; }
    .nz-eq-bar:nth-child(3) { animation-delay:0.3s;  height:8px; }
    @keyframes nzEqBounce {
      0%,100% { transform:scaleY(0.4); }
      50%      { transform:scaleY(1); }
    }

    /* ── Card hover ─────────────────────────────────────── */
    .vocab-card:hover, .bv-card:hover {
      transform:translateY(-3px);
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
    }

    /* ── Level tab active underline (green like reference) ─ */
    .nz-lvl-tab { position:relative; }
    .nz-lvl-tab.active::after {
      content:'';
      position:absolute;
      bottom:-2px; left:50%; transform:translateX(-50%);
      width:70%; height:2px;
      background:#22c55e;
      border-radius:2px;
    }

    /* ── SRS level pill colors ──────────────────────────── */
    .srs-pill-N5 { color:#22c55e; border-color:#22c55e; }
    .srs-pill-N4 { color:#06b6d4; border-color:#06b6d4; }
    .srs-pill-N3 { color:#eab308; border-color:#eab308; }
    .srs-pill-N2 { color:#a855f7; border-color:#a855f7; }
    .srs-pill-N1 { color:#ef4444; border-color:#ef4444; }

    /* ── Basic Vocab button highlight ───────────────────── */
    #bv-open-btn {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff;
      border:none;
      padding:8px 18px;
      border-radius:10px;
      font-size:13px;
      font-weight:700;
      cursor:pointer;
      font-family:inherit;
      transition:opacity 0.15s,transform 0.15s;
      letter-spacing:0.3px;
    }
    #bv-open-btn:hover { opacity:0.88; transform:translateY(-1px); }

    /* ── Basic Vocab overlay ────────────────────────────── */
    #bv-overlay {
      display:none;
      position:fixed; inset:0;
      background:rgba(0,0,0,0.7);
      z-index:999;
      backdrop-filter:blur(4px);
    }
    #bv-overlay.open { display:flex; align-items:center; justify-content:center; }
    #bv-modal {
      width:min(96vw,960px);
      max-height:88vh;
      background:var(--bg,#0f0f0f);
      border:1px solid var(--border,#333);
      border-radius:20px;
      overflow:hidden;
      display:flex;
      flex-direction:column;
    }

    /* ── Search bar ─────────────────────────────────────── */
    .nz-search-wrap {
      flex:1;
      display:flex; align-items:center; gap:8px;
      background:var(--card-elevated,#1a1a1a);
      border:1px solid var(--border,#2a2a2a);
      border-radius:12px;
      padding:0 14px;
      height:40px;
    }
    .nz-search-wrap input {
      flex:1; background:transparent; border:none; outline:none;
      color:var(--fg,#f0f0f0); font-size:13px; font-family:inherit;
    }
    .nz-search-wrap input::placeholder { color:var(--fg-muted,#666); }

    /* ── Mode toggle ─────────────────────────────────────── */
    .vocab-mode-btn, .bv-mode-btn {
      padding:7px 14px; border-radius:8px; font-size:13px; font-weight:600;
      cursor:pointer; font-family:inherit; transition:all 0.15s;
    }

    /* ── Nav button hover ───────────────────────────────── */
    .nz-nav-btn:hover { border-color:var(--primary,#e8446a) !important; }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   BASIC VOCAB MODULE  (2,156 words · 20 categories)
   ========================================================= */
var BasicVocabPage = (() => {
  let mode           = 'grid';
  let activeCategory = 'All';
  let cardIndex      = 0;
  let flipped        = false;
  let speakingId     = null;
  let speakTimer     = null;
  let keyHandler     = null;
  let searchQuery    = '';

  /* ── Audio ───────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
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
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    }, 600);
    window.speechSynthesis.speak(j);
  }

  /* ── Filter ──────────────────────────────────────────── */
  function getFiltered() {
    let words = activeCategory === 'All' ? VocabPageWords : VocabPageWords.filter(w => w.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(w =>
        w.jp.includes(q) ||
        (w.romaji && w.romaji.toLowerCase().includes(q)) ||
        w.en.toLowerCase().includes(q)
      );
    }
    return words;
  }

  /* ── Flashcard nav ───────────────────────────────────── */
  function nextCard() {
    flipped = false; updateFlip();
    setTimeout(() => { cardIndex = (cardIndex + 1) % getFiltered().length; renderFCContent(); }, 150);
  }
  function prevCard() {
    flipped = false; updateFlip();
    setTimeout(() => { const f=getFiltered(); cardIndex=(cardIndex-1+f.length)%f.length; renderFCContent(); }, 150);
  }
  function flipCard() { flipped=!flipped; updateFlip(); }
  function updateFlip() {
    const el = document.getElementById('bv-flip-inner');
    if (el) el.classList.toggle('flipped', flipped);
  }
  function goToCard(i) { cardIndex=i; flipped=false; updateFlip(); renderFCContent(); }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode !== 'flashcard') return;
      if (e.key==='ArrowRight') { e.preventDefault(); nextCard(); }
      else if (e.key==='ArrowLeft') { e.preventDefault(); prevCard(); }
      else if (e.key===' ') { e.preventDefault(); flipCard(); }
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler=null; }
  }

  /* ── Speak button ────────────────────────────────────── */
  function handleSpeakBtn(e, word) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId = word.id;
    speakWord(word.jp, word.en);
    updateSpeakBtns();
    speakTimer = setTimeout(() => { speakingId=null; updateSpeakBtns(); }, 3000);
  }
  function updateSpeakBtns() {
    document.querySelectorAll('.bv-speak-btn').forEach(btn => {
      const playing = btn.dataset.id === speakingId;
      btn.style.background = playing ? 'var(--primary-dim)' : 'transparent';
      btn.style.color       = playing ? 'var(--primary)'    : 'var(--fg-muted)';
      btn.innerHTML = playing
        ? `<div class="nz-eq"><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div></div>`
        : speakerIcon(15);
    });
  }

  /* ── Security ────────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Icons ───────────────────────────────────────────── */
  function speakerIcon(size=15) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }

  /* ── Category tabs ───────────────────────────────────── */
  function renderCatTabs() {
    const c = document.getElementById('bv-cat-tabs');
    if (!c) return;
    c.innerHTML = VocabPageCategories.map(cat => {
      const active = cat === activeCategory;
      const count  = cat==='All' ? VocabPageWords.length : VocabPageWords.filter(w=>w.category===cat).length;
      return `<button class="vocab-cat-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
        data-cat="${esc(cat)}"
        style="background:${active?'var(--primary)':'var(--card-elevated)'};
               color:${active?'#fff':'var(--fg-muted)'};
               border:1px solid ${active?'var(--primary)':'var(--border)'};
               white-space:nowrap;flex-shrink:0;padding:5px 12px;border-radius:20px;
               font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;">
        ${esc(cat)} <span style="opacity:0.7;font-size:9px;">${count}</span>
      </button>`;
    }).join('');
    c.querySelectorAll('.vocab-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        cardIndex=0; flipped=false; searchQuery='';
        const si = document.getElementById('bv-search-input');
        if (si) si.value = '';
        render();
      });
    });
  }

  /* ── Grid ────────────────────────────────────────────── */
  function renderGrid() {
    const filtered = getFiltered();
    const area = document.getElementById('bv-main-area');
    if (!area) return;
    if (!filtered.length) {
      area.innerHTML = `<p style="color:var(--fg-muted);text-align:center;padding:40px;">No words found.</p>`;
      return;
    }
    area.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;">
  ${filtered.map(word => `
    <div class="bv-card"
      data-id="${esc(word.id)}"
      style="border-radius:12px;border:1px solid var(--border);background:var(--card);
             padding:16px;cursor:pointer;border-left:3px solid ${word.color};
             position:relative;transition:transform 0.2s,box-shadow 0.2s;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div style="font-family:'Noto Sans JP',sans-serif;font-size:20px;font-weight:700;
                      color:var(--fg);margin-bottom:2px;">${esc(word.jp)}</div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;
                    color:var(--fg-muted);font-style:italic;">${esc(word.romaji||'')}</p>
        </div>
        <button class="bv-speak-btn" data-id="${esc(word.id)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;">
          ${speakerIcon(15)}
        </button>
      </div>
      <p style="font-size:13px;color:var(--fg);margin-bottom:12px;">${esc(word.en)}</p>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;
                     background:${word.color}22;color:${word.color};">${esc(word.category)}</span>
      </div>
    </div>
  `).join('')}
</div>`;

    area.querySelectorAll('.bv-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.bv-speak-btn')) return;
        const w = VocabPageWords.find(x=>x.id===card.dataset.id);
        if (w) speak(w.jp);
      });
    });
    area.querySelectorAll('.bv-speak-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const w = VocabPageWords.find(x=>x.id===btn.dataset.id);
        if (w) handleSpeakBtn(e,w);
      });
    });
  }

  /* ── Flashcard content ───────────────────────────────── */
  function renderFCContent() {
    const filtered = getFiltered();
    if (!filtered.length) return;
    const word = filtered[cardIndex] || filtered[0];
    const front   = document.getElementById('bv-fc-front');
    const back    = document.getElementById('bv-fc-back');
    const counter = document.getElementById('bv-fc-counter');
    const inner   = document.getElementById('bv-flip-inner');
    if (inner) inner.classList.toggle('flipped', flipped);
    if (front) front.innerHTML = `
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:48px;font-weight:700;color:var(--fg);">${esc(word.jp)}</div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);">${esc(word.romaji||'')}</p>
      <button id="bv-fc-speak-front" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;margin-top:8px;font-family:inherit;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to reveal meaning</p>`;
    if (back) back.innerHTML = `
      <p style="font-size:22px;font-weight:700;color:var(--fg);text-align:center;margin-bottom:10px;">${esc(word.en)}</p>
      <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
                   background:${word.color}22;color:${word.color};margin-bottom:10px;">${esc(word.category)}</span>
      <button id="bv-fc-speak-back" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;font-family:inherit;">
        ${speakerIcon(12)} Hear both
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to flip back</p>`;
    const ff = document.getElementById('bv-fc-speak-front');
    if (ff) ff.addEventListener('click', e => { e.stopPropagation(); speak(word.jp); });
    const fb = document.getElementById('bv-fc-speak-back');
    if (fb) fb.addEventListener('click', e => { e.stopPropagation(); speakWord(word.jp, word.en); });
    if (counter) counter.textContent = `${cardIndex+1} / ${filtered.length}`;
    const dots = document.getElementById('bv-fc-dots');
    if (dots) {
      const shown = filtered.slice(0, Math.min(filtered.length, 20));
      dots.innerHTML = shown.map((_,i) => `
        <button class="bv-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.bv-dot').forEach(d => d.addEventListener('click', ()=>goToCard(parseInt(d.dataset.i))));
    }
  }

  /* ── Flashcard wrapper ───────────────────────────────── */
  function renderFlashcard() {
    const area = document.getElementById('bv-main-area');
    if (!area) return;
    area.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;max-width:380px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → keys to navigate · Space to flip
  </p>
  <div id="bv-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="bv-flip-inner"
      style="width:100%;height:220px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="bv-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
      <div id="bv-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="bv-fc-prev" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg);transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="bv-fc-counter" style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="bv-fc-next" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg);transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="bv-fc-reset" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);
             cursor:pointer;color:var(--fg-muted);transition:border-color 0.15s;margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </div>
  <div id="bv-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('bv-fc-wrap').addEventListener('click', flipCard);
    document.getElementById('bv-fc-prev').addEventListener('click', prevCard);
    document.getElementById('bv-fc-next').addEventListener('click', nextCard);
    document.getElementById('bv-fc-reset').addEventListener('click', ()=>{cardIndex=0;flipped=false;updateFlip();renderFCContent();});
    renderFCContent();
    attachKeys();
  }

  /* ── Mode buttons ────────────────────────────────────── */
  function renderModeBtns() {
    const wrap = document.getElementById('bv-mode-btns');
    if (!wrap) return;
    wrap.innerHTML = ['grid','flashcard'].map(m => `
      <button class="bv-mode-btn" data-mode="${m}"
        style="padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;
               border:1px solid ${mode===m?'var(--primary)':'var(--border)'};
               background:${mode===m?'var(--primary)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};cursor:pointer;transition:all 0.15s;">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.bv-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => { detachKeys(); mode=btn.dataset.mode; flipped=false; render(); });
    });
  }

  /* ── Full render ─────────────────────────────────────── */
  function render() {
    renderModeBtns();
    renderCatTabs();
    const lbl = document.getElementById('bv-count-label');
    if (lbl) lbl.textContent = `${VocabPageWords.length} words · ${VocabPageCategories.length-1} categories`;
    if (mode==='grid') { detachKeys(); renderGrid(); }
    else renderFlashcard();
  }

  /* ── Open / close modal ──────────────────────────────── */
  function open() {
    const ov = document.getElementById('bv-overlay');
    if (!ov) { buildModal(); } else { ov.classList.add('open'); render(); }
  }
  function close() {
    detachKeys();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const ov = document.getElementById('bv-overlay');
    if (ov) ov.classList.remove('open');
  }

  function buildModal() {
    const ov = document.createElement('div');
    ov.id = 'bv-overlay';
    ov.innerHTML = `
<div id="bv-modal">
  <!-- Modal header -->
  <div style="display:flex;align-items:center;justify-content:space-between;
              padding:20px 24px 0;border-bottom:1px solid var(--border,#2a2a2a);padding-bottom:16px;">
    <div>
      <h2 style="font-size:20px;font-weight:800;color:var(--fg);margin-bottom:3px;letter-spacing:-0.3px;">
        📚 Basic Vocab
      </h2>
      <p id="bv-count-label" style="font-size:12px;color:var(--fg-muted);"></p>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div id="bv-mode-btns" style="display:flex;gap:8px;"></div>
      <button id="bv-close-btn"
        style="padding:8px;border-radius:10px;background:var(--card-elevated);
               border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);
               font-size:18px;line-height:1;transition:border-color 0.15s;">✕</button>
    </div>
  </div>

  <!-- Search + cats -->
  <div style="padding:14px 24px 0;">
    <!-- Search -->
    <div class="nz-search-wrap" style="margin-bottom:12px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="bv-search-input" type="text" placeholder="Search vocab, meaning, romaji…" />
    </div>
    <!-- Category tabs -->
    <div id="bv-cat-tabs"
      style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;"></div>
  </div>

  <!-- Main content -->
  <div id="bv-main-area" style="flex:1;overflow-y:auto;padding:16px 24px 24px;"></div>
</div>`;
    document.body.appendChild(ov);

    ov.addEventListener('click', e => { if (e.target===ov) close(); });
    document.getElementById('bv-close-btn').addEventListener('click', close);
    document.getElementById('bv-search-input').addEventListener('input', e => {
      searchQuery = e.target.value;
      cardIndex = 0;
      if (mode==='grid') renderGrid();
      else renderFCContent();
    });

    ov.classList.add('open');
    render();
  }

  return { open, close };
})();

/* =========================================================
   MAIN VOCAB PAGE  (JLPT N5–N1 words from existing data)
   ========================================================= */
var VocabPage = (() => {
  let mode           = 'grid';
  let activeLevel    = 'N4';
  let activeCategory = 'All';
  let cardIndex      = 0;
  let flipped        = false;
  let speakingId     = null;
  let speakTimer     = null;
  let keyHandler     = null;
  let searchQuery    = '';

  /* ── Audio ───────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang=lang; u.rate=rate;
    window.speechSynthesis.speak(u);
  }
  function speakWord(jp, en) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const j = new SpeechSynthesisUtterance(jp);
    j.lang='ja-JP'; j.rate=0.8;
    j.onend = () => setTimeout(()=>{
      const e = new SpeechSynthesisUtterance(en);
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    },600);
    window.speechSynthesis.speak(j);
  }

  /* ── Filter ──────────────────────────────────────────── */
  function getFiltered() {
    let words = typeof VocabPageWords !== 'undefined' ? VocabPageWords : [];
    if (activeLevel !== 'All') words = words.filter(w => (w.level||'N4') === activeLevel);
    if (activeCategory !== 'All') words = words.filter(w => w.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(w =>
        w.jp.includes(q) ||
        (w.romaji && w.romaji.toLowerCase().includes(q)) ||
        w.en.toLowerCase().includes(q)
      );
    }
    return words;
  }

  /* ── Flashcard nav ───────────────────────────────────── */
  function nextCard() {
    flipped=false; updateFlip();
    setTimeout(()=>{ cardIndex=(cardIndex+1)%getFiltered().length; renderFCContent(); },150);
  }
  function prevCard() {
    flipped=false; updateFlip();
    setTimeout(()=>{ const f=getFiltered(); cardIndex=(cardIndex-1+f.length)%f.length; renderFCContent(); },150);
  }
  function flipCard() { flipped=!flipped; updateFlip(); }
  function updateFlip() {
    const el=document.getElementById('vocab-flip-inner');
    if(el) el.classList.toggle('flipped',flipped);
  }
  function goToCard(i) { cardIndex=i; flipped=false; updateFlip(); renderFCContent(); }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode!=='flashcard') return;
      if (e.key==='ArrowRight'){e.preventDefault();nextCard();}
      else if(e.key==='ArrowLeft'){e.preventDefault();prevCard();}
      else if(e.key===' '){e.preventDefault();flipCard();}
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler){window.removeEventListener('keydown',keyHandler);keyHandler=null;}
  }

  /* ── Speak btn ───────────────────────────────────────── */
  function handleSpeakBtn(e, word) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId=word.id;
    speakWord(word.jp, word.en);
    updateSpeakBtns();
    speakTimer=setTimeout(()=>{speakingId=null;updateSpeakBtns();},3000);
  }
  function updateSpeakBtns() {
    document.querySelectorAll('.vocab-speak-btn').forEach(btn=>{
      const playing=btn.dataset.id===speakingId;
      btn.style.background=playing?'var(--primary-dim)':'transparent';
      btn.style.color=playing?'var(--primary)':'var(--fg-muted)';
      btn.innerHTML=playing
        ?`<div class="nz-eq"><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div></div>`
        :speakerIcon(15);
    });
  }

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function speakerIcon(size=15){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }

  /* ── Level colors (matching reference photo exactly) ─── */
  const LEVEL_COLORS = { N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444' };

  /* ── SRS level pills ─────────────────────────────────── */
  function renderSRSPills(container) {
    return ['N4','N3','N2','N1'].map(lvl => `
      <button class="srs-pill-${lvl}"
        style="padding:6px 14px;border-radius:8px;font-size:13px;font-weight:700;
               background:transparent;border:1px solid ${LEVEL_COLORS[lvl]};
               color:${LEVEL_COLORS[lvl]};cursor:pointer;font-family:inherit;
               transition:background 0.15s;">
        ${lvl}
      </button>`).join('');
  }

  /* ── Level tabs (N5 N4 N3 N2 N1 row with green underline) */
  function renderLevelTabs() {
    const wrap = document.getElementById('vocab-level-tabs');
    if (!wrap) return;
    wrap.innerHTML = ['N4','N3','N2','N1'].map(lvl => `
      <button class="nz-lvl-tab ${activeLevel===lvl?'active':''}"
        data-level="${lvl}"
        style="padding:10px 18px;font-size:14px;font-weight:700;
               background:transparent;border:none;
               color:${activeLevel===lvl?'var(--fg)':'var(--fg-muted)'};
               cursor:pointer;font-family:inherit;transition:color 0.15s;">
        ${lvl}
      </button>`).join('');
    wrap.querySelectorAll('.nz-lvl-tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        activeLevel=btn.dataset.level; cardIndex=0; flipped=false;
        searchQuery=''; const si=document.getElementById('vocab-search-input'); if(si) si.value='';
        render();
      });
    });
  }

  /* ── Category tabs ───────────────────────────────────── */
  function renderCatTabs() {
    const c = document.getElementById('vocab-cat-tabs');
    if (!c) return;
    const cats = ['All', ...new Set((VocabPageWords||[]).map(w=>w.category))];
    c.innerHTML = cats.map(cat=>{
      const active=cat===activeCategory;
      return `<button class="vocab-cat-btn"
        data-cat="${esc(cat)}"
        style="background:${active?'var(--primary)':'var(--card-elevated)'};
               color:${active?'#fff':'var(--fg-muted)'};
               border:1px solid ${active?'var(--primary)':'var(--border)'};
               white-space:nowrap;flex-shrink:0;padding:5px 12px;border-radius:20px;
               font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;">
        ${esc(cat)}
      </button>`;
    }).join('');
    c.querySelectorAll('.vocab-cat-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        activeCategory=btn.dataset.cat; cardIndex=0; flipped=false; render();
      });
    });
  }

  /* ── Grid ────────────────────────────────────────────── */
  function renderGrid() {
    const filtered=getFiltered();
    const area=document.getElementById('vocab-main-area');
    if(!area) return;
    if(!filtered.length){
      area.innerHTML=`<p style="color:var(--fg-muted);text-align:center;padding:40px;">No words found for ${activeLevel}.</p>`;
      return;
    }
    area.innerHTML=`
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
  ${filtered.map(word=>`
    <div class="vocab-card" data-id="${esc(word.id)}"
      style="border-radius:12px;border:1px solid var(--border);background:var(--card);
             padding:16px;cursor:pointer;border-left:3px solid ${word.color||LEVEL_COLORS[word.level||'N5']};
             position:relative;transition:transform 0.2s,box-shadow 0.2s;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div style="font-family:'Noto Sans JP',sans-serif;font-size:22px;font-weight:700;
                      color:var(--fg);margin-bottom:2px;">${esc(word.jp)}</div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;
                    color:var(--fg-muted);font-style:italic;">${esc(word.romaji||'')}</p>
        </div>
        <button class="vocab-speak-btn" data-id="${esc(word.id)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;">
          ${speakerIcon(15)}
        </button>
      </div>
      <p style="font-size:13px;color:var(--fg);margin-bottom:12px;">${esc(word.en)}</p>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;
                     background:${(word.color||LEVEL_COLORS[word.level||'N5'])}22;
                     color:${word.color||LEVEL_COLORS[word.level||'N5']};">${esc(word.category)}</span>
      </div>
    </div>
  `).join('')}
</div>`;
    area.querySelectorAll('.vocab-card').forEach(card=>{
      card.addEventListener('click',e=>{
        if(e.target.closest('.vocab-speak-btn')) return;
        const w=(VocabPageWords||[]).find(x=>x.id===card.dataset.id);
        if(w) speak(w.jp);
      });
    });
    area.querySelectorAll('.vocab-speak-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const w=(VocabPageWords||[]).find(x=>x.id===btn.dataset.id);
        if(w) handleSpeakBtn(e,w);
      });
    });
  }

  /* ── Flashcard content ───────────────────────────────── */
  function renderFCContent() {
    const filtered=getFiltered();
    if(!filtered.length) return;
    const word=filtered[cardIndex]||filtered[0];
    const front=document.getElementById('vocab-fc-front');
    const back=document.getElementById('vocab-fc-back');
    const counter=document.getElementById('vocab-fc-counter');
    const inner=document.getElementById('vocab-flip-inner');
    if(inner) inner.classList.toggle('flipped',flipped);
    const col=word.color||LEVEL_COLORS[word.level||'N5'];
    if(front) front.innerHTML=`
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:52px;font-weight:700;color:var(--fg);">${esc(word.jp)}</div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);">${esc(word.romaji||'')}</p>
      <button id="fc-speak-front" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;margin-top:8px;font-family:inherit;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to reveal meaning</p>`;
    if(back) back.innerHTML=`
      <p style="font-size:22px;font-weight:700;color:var(--fg);text-align:center;margin-bottom:10px;">${esc(word.en)}</p>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
                     background:${col}22;color:${col};">${esc(word.category)}</span>
      </div>
      <button id="fc-speak-back" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
        border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);color:var(--primary);
        font-size:12px;cursor:pointer;font-family:inherit;">
        ${speakerIcon(12)} Hear both
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:6px;">Click to flip back</p>`;
    const ff=document.getElementById('fc-speak-front');
    if(ff) ff.addEventListener('click',e=>{e.stopPropagation();speak(word.jp);});
    const fb=document.getElementById('fc-speak-back');
    if(fb) fb.addEventListener('click',e=>{e.stopPropagation();speakWord(word.jp,word.en);});
    if(counter) counter.textContent=`${cardIndex+1} / ${filtered.length}`;
    const dots=document.getElementById('vocab-fc-dots');
    if(dots){
      const shown=filtered.slice(0,Math.min(filtered.length,20));
      dots.innerHTML=shown.map((_,i)=>`
        <button class="vocab-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.vocab-dot').forEach(d=>d.addEventListener('click',()=>goToCard(parseInt(d.dataset.i))));
    }
  }

  /* ── Flashcard wrapper ───────────────────────────────── */
  function renderFlashcard() {
    const area=document.getElementById('vocab-main-area');
    if(!area) return;
    area.innerHTML=`
<div style="display:flex;flex-direction:column;align-items:center;max-width:380px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → keys to navigate · Space to flip
  </p>
  <div id="vocab-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="vocab-flip-inner"
      style="width:100%;height:220px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="vocab-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
      <div id="vocab-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="vocab-fc-prev" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="vocab-fc-counter" style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="vocab-fc-next" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="vocab-fc-reset" class="nz-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </div>
  <div id="vocab-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('vocab-fc-wrap').addEventListener('click',flipCard);
    document.getElementById('vocab-fc-prev').addEventListener('click',prevCard);
    document.getElementById('vocab-fc-next').addEventListener('click',nextCard);
    document.getElementById('vocab-fc-reset').addEventListener('click',()=>{cardIndex=0;flipped=false;updateFlip();renderFCContent();});
    renderFCContent();
    attachKeys();
  }

  /* ── Mode buttons ────────────────────────────────────── */
  function renderModeBtns() {
    const wrap=document.getElementById('vocab-mode-btns');
    if(!wrap) return;
    wrap.innerHTML=['grid','flashcard'].map(m=>`
      <button class="vocab-mode-btn" data-mode="${m}"
        style="padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;font-family:inherit;
               border:1px solid ${mode===m?'var(--primary)':'var(--border)'};
               background:${mode===m?'var(--primary)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};cursor:pointer;transition:all 0.15s;">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.vocab-mode-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{detachKeys();mode=btn.dataset.mode;flipped=false;render();});
    });
  }

  /* ── Full render ─────────────────────────────────────── */
  function render() {
    renderModeBtns();
    renderLevelTabs();
    renderCatTabs();
    const lbl=document.getElementById('vocab-count-label');
    if(lbl){
      const total=getFiltered().length;
      lbl.textContent=`Master vocabulary from N5 to N1 level`;
    }
    if(mode==='grid'){detachKeys();renderGrid();}
    else renderFlashcard();
  }

  /* ── Mount ───────────────────────────────────────────── */
  function mount(containerId) {
    const container=document.getElementById(containerId);
    if(!container) return;

    container.innerHTML=`
<div style="max-width:1600px;margin:0 auto;padding:24px 16px;">

  <!-- ═══ Header: title + Basic Vocab button ═══ -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;
              margin-bottom:20px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:24px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">
        語彙 Vocabulary Study
      </h1>
      <p id="vocab-count-label" style="font-size:13px;color:var(--fg-muted);">
        Master vocabulary from N5 to N1 level
      </p>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <!-- Basic Vocab button -->
      <button id="bv-open-btn">📚 Basic Vocab</button>
      <!-- Mode buttons -->
      <div id="vocab-mode-btns" style="display:flex;gap:8px;"></div>
    </div>
  </div>

  <!-- ═══ SRS Review row ═══ -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
    <span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--fg-muted);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      SRS Review by Level:
    </span>
    <div id="vocab-srs-pills" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
  </div>

  <!-- ═══ Level tabs + Search bar row ═══ -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
    <!-- Level tabs -->
    <div id="vocab-level-tabs"
      style="display:flex;align-items:center;background:var(--card-elevated,#1a1a1a);
             border:1px solid var(--border,#2a2a2a);border-radius:12px;padding:4px;
             overflow-x:auto;scrollbar-width:none;flex-shrink:0;">
    </div>
    <!-- Search bar -->
    <div class="nz-search-wrap" style="min-width:200px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="vocab-search-input" type="text" placeholder="Search vocab, meaning…" />
    </div>
  </div>

  <!-- ═══ Category scroll tabs ═══ -->
  <div id="vocab-cat-tabs"
    style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:20px;
           scrollbar-width:none;">
  </div>

  <!-- ═══ Main content area ═══ -->
  <div id="vocab-main-area"></div>
</div>`;

    /* SRS pills click → jump to level */
    const srsWrap=document.getElementById('vocab-srs-pills');
    if(srsWrap){
      srsWrap.innerHTML=['N4','N3','N2','N1'].map(lvl=>`
        <button class="srs-pill-${lvl}"
          data-level="${lvl}"
          style="padding:6px 14px;border-radius:8px;font-size:13px;font-weight:700;
                 background:transparent;border:1px solid currentColor;
                 cursor:pointer;font-family:inherit;transition:background 0.15s;">
          ${lvl}
        </button>`).join('');
      srsWrap.querySelectorAll('button').forEach(btn=>{
        btn.addEventListener('mouseenter',()=>{ btn.style.background='rgba(255,255,255,0.07)'; });
        btn.addEventListener('mouseleave',()=>{ btn.style.background='transparent'; });
        btn.addEventListener('click',()=>{
          activeLevel=btn.dataset.level; cardIndex=0; flipped=false; searchQuery='';
          const si=document.getElementById('vocab-search-input'); if(si) si.value='';
          render();
        });
      });
    }

    /* Search */
    container.querySelector('#vocab-search-input').addEventListener('input',e=>{
      searchQuery=e.target.value; cardIndex=0;
      if(mode==='grid') renderGrid();
      else renderFCContent();
    });

    /* Basic Vocab button */
    document.getElementById('bv-open-btn').addEventListener('click',()=>BasicVocabPage.open());

    render();
  }

  /* ── Cleanup ─────────────────────────────────────────── */
  function cleanup() {
    detachKeys();
    if(speakTimer) clearTimeout(speakTimer);
    if(window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { mount, cleanup, render };
})();
