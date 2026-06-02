'use strict';
/**
 * NihongoZen — Vocabulary Page
 * 2104 words · 77 categories
 * Converted from vocab.tsx — same style, layout, audio functionality
 */


/* =========================================================
   VOCAB PAGE CSS — injected into <head> on mount
   Copy these styles into your components.css if needed
   ========================================================= */
(function injectVocabStyles() {
  if (document.getElementById('vocab-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'vocab-page-styles';
  style.textContent = `
    #vocab-cat-tabs::-webkit-scrollbar { display: none; }

    /* Flip card */
    #vocab-flip-inner.flipped { transform: rotateY(180deg); }

    /* Equalizer animation */
    .nz-eq {
      display: flex; align-items: flex-end; gap: 2px; height: 14px;
    }
    .nz-eq-bar {
      width: 3px; border-radius: 2px;
      background: var(--primary);
      animation: nzEqBounce 0.8s ease-in-out infinite;
    }
    .nz-eq-bar:nth-child(1) { animation-delay: 0s;    height: 6px; }
    .nz-eq-bar:nth-child(2) { animation-delay: 0.15s; height: 12px; }
    .nz-eq-bar:nth-child(3) { animation-delay: 0.3s;  height: 8px; }
    @keyframes nzEqBounce {
      0%,100% { transform: scaleY(0.4); }
      50%      { transform: scaleY(1);   }
    }

    /* Card hover */
    .vocab-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   VOCAB DATA — 2104 words across 77 categories
   ========================================================= */

var VocabPage = (() => {
  let mode           = 'grid';       // 'grid' | 'flashcard'
  let activeCategory = 'All';
  let cardIndex      = 0;
  let flipped        = false;
  let speakingId     = null;
  let speakTimer     = null;
  let keyHandler     = null;

  /* ── Audio helpers ──────────────────────────────────── */
  function speak(text, lang = 'ja-JP', rate = 0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang; utt.rate = rate;
    window.speechSynthesis.speak(utt);
  }

  function speakWord(jp, en) {
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
  }

  /* ── Filtered word list ─────────────────────────────── */
  function getFiltered() {
    if (activeCategory === 'All') return VocabPageWords;
    return VocabPageWords.filter(w => w.category === activeCategory);
  }

  /* ── Flashcard navigation ───────────────────────────── */
  function nextCard() {
    flipped = false;
    updateFlipCard();
    setTimeout(() => {
      const f = getFiltered();
      cardIndex = (cardIndex + 1) % f.length;
      renderFlashcardContent();
    }, 150);
  }

  function prevCard() {
    flipped = false;
    updateFlipCard();
    setTimeout(() => {
      const f = getFiltered();
      cardIndex = (cardIndex - 1 + f.length) % f.length;
      renderFlashcardContent();
    }, 150);
  }

  function flipCard() {
    flipped = !flipped;
    updateFlipCard();
  }

  function updateFlipCard() {
    const inner = document.getElementById('vocab-flip-inner');
    if (inner) inner.classList.toggle('flipped', flipped);
  }

  function goToCard(i) {
    cardIndex = i;
    flipped = false;
    updateFlipCard();
    renderFlashcardContent();
  }

  /* ── Keyboard handler ───────────────────────────────── */
  function attachKeyboard() {
    detachKeyboard();
    keyHandler = (e) => {
      if (mode !== 'flashcard') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
      else if (e.key === ' ') { e.preventDefault(); flipCard(); }
    };
    window.addEventListener('keydown', keyHandler);
  }

  function detachKeyboard() {
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  /* ── Speak button ───────────────────────────────────── */
  function handleSpeakBtn(e, word) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId = word.id;
    speakWord(word.jp, word.en);
    updateSpeakBtns();
    speakTimer = setTimeout(() => {
      speakingId = null;
      updateSpeakBtns();
    }, 3000);
  }

  function updateSpeakBtns() {
    document.querySelectorAll('.vocab-speak-btn').forEach(btn => {
      const id = btn.dataset.id;
      const isPlaying = id === speakingId;
      btn.style.background = isPlaying ? 'var(--primary-dim)' : 'transparent';
      btn.style.color       = isPlaying ? 'var(--primary)'     : 'var(--fg-muted)';
      btn.innerHTML = isPlaying
        ? `<div class="nz-eq"><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div><div class="nz-eq-bar"></div></div>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    });
  }

  /* ── Security ───────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Render category tabs ───────────────────────────── */
  function renderCategoryTabs() {
    const container = document.getElementById('vocab-cat-tabs');
    if (!container) return;
    container.innerHTML = VocabPageCategories.map(cat => {
      const active = cat === activeCategory;
      const filtered = cat === 'All' ? VocabPageWords : VocabPageWords.filter(w => w.category === cat);
      return `<button
        class="vocab-cat-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
        data-cat="${esc(cat)}"
        style="background:${active ? 'var(--primary)' : 'var(--card-elevated)'};
               color:${active ? '#fff' : 'var(--fg-muted)'};
               border:1px solid ${active ? 'var(--primary)' : 'var(--border)'};
               white-space:nowrap; flex-shrink:0;">
        ${esc(cat)} <span style="opacity:0.7;font-size:9px;">${filtered.length}</span>
      </button>`;
    }).join('');

    container.querySelectorAll('.vocab-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        cardIndex = 0;
        flipped = false;
        render();
      });
    });
  }

  /* ── Render grid ─────────────────────────────────────── */
  function renderGrid() {
    const filtered = getFiltered();
    const area = document.getElementById('vocab-main-area');
    if (!area) return;

    area.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
  ${filtered.map(word => `
    <div class="vocab-card card-hover"
      data-id="${esc(word.id)}"
      style="border-radius:12px;border:1px solid var(--border);
             background:var(--card);padding:16px;cursor:pointer;
             border-left:3px solid ${word.color};position:relative;
             transition:transform 0.2s,box-shadow 0.2s;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div style="font-family:'Noto Sans JP',sans-serif;font-size:22px;font-weight:700;
                      color:var(--fg);margin-bottom:2px;">${esc(word.jp)}</div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;
                    color:var(--fg-muted);font-style:italic;">${esc(word.romaji)}</p>
        </div>
        <button class="vocab-speak-btn"
          data-id="${esc(word.id)}"
          data-jp="${esc(word.jp)}"
          data-en="${esc(word.en)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
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

    // Click card to speak JP
    area.querySelectorAll('.vocab-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.vocab-speak-btn')) return;
        const id = card.dataset.id;
        const word = VocabPageWords.find(w => w.id === id);
        if (word) speak(word.jp);
      });
    });

    // Speak btn
    area.querySelectorAll('.vocab-speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = VocabPageWords.find(w => w.id === btn.dataset.id);
        if (word) handleSpeakBtn(e, word);
      });
    });
  }

  /* ── Render flashcard content only (no full re-render) ─ */
  function renderFlashcardContent() {
    const filtered = getFiltered();
    if (!filtered.length) return;
    const word = filtered[cardIndex] || filtered[0];

    const front = document.getElementById('vocab-fc-front');
    const back  = document.getElementById('vocab-fc-back');
    const counter = document.getElementById('vocab-fc-counter');
    const inner = document.getElementById('vocab-flip-inner');

    if (inner) inner.classList.toggle('flipped', flipped);

    if (front) front.innerHTML = `
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:52px;font-weight:700;
                  color:var(--fg);">${esc(word.jp)}</div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:13px;
                color:var(--fg-muted);">${esc(word.romaji)}</p>
      <button id="fc-speak-front"
        style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
               border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
               color:var(--primary);font-size:12px;cursor:pointer;margin-top:8px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
        Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-subtle);margin-top:6px;">Click to reveal meaning</p>`;

    if (back) back.innerHTML = `
      <p style="font-size:22px;font-weight:700;color:var(--fg);text-align:center;
                margin-bottom:10px;">${esc(word.en)}</p>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;
                     background:${word.color}22;color:${word.color};">${esc(word.category)}</span>
      </div>
      <button id="fc-speak-back"
        style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
               border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
               color:var(--primary);font-size:12px;cursor:pointer;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
        Hear both
      </button>
      <p style="font-size:11px;color:var(--fg-subtle);margin-top:6px;">Click to flip back</p>`;

    // Attach speak events
    const frontBtn = document.getElementById('fc-speak-front');
    if (frontBtn) frontBtn.addEventListener('click', e => { e.stopPropagation(); speak(word.jp); });
    const backBtn = document.getElementById('fc-speak-back');
    if (backBtn) backBtn.addEventListener('click', e => { e.stopPropagation(); speakWord(word.jp, word.en); });

    if (counter) counter.textContent = `${cardIndex + 1} / ${filtered.length}`;

    // Dots
    const dotsWrap = document.getElementById('vocab-fc-dots');
    if (dotsWrap) {
      const shown = filtered.slice(0, Math.min(filtered.length, 20));
      dotsWrap.innerHTML = shown.map((_, i) => `
        <button class="vocab-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;border:1px solid ${i === cardIndex ? 'var(--primary)' : 'var(--border)'};
                 background:${i === cardIndex ? 'var(--primary)' : 'var(--card-elevated)'};
                 cursor:pointer;padding:0;transition:all 0.15s;"></button>
      `).join('');
      dotsWrap.querySelectorAll('.vocab-dot').forEach(dot => {
        dot.addEventListener('click', () => goToCard(parseInt(dot.dataset.i)));
      });
    }
  }

  /* ── Render flashcard wrapper ────────────────────────── */
  function renderFlashcard() {
    const area = document.getElementById('vocab-main-area');
    if (!area) return;

    area.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;max-width:380px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → arrow keys to navigate · Space to flip
  </p>

  <!-- Flip card -->
  <div id="vocab-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="vocab-flip-inner"
      style="width:100%;height:220px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">

      <!-- Front face -->
      <div id="vocab-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;
               gap:8px;padding:24px;">
      </div>

      <!-- Back face -->
      <div id="vocab-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;
               gap:8px;padding:24px;">
      </div>
    </div>
  </div>

  <!-- Nav controls -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="vocab-fc-prev"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg);
             transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
    <span id="vocab-fc-counter"
      style="font-family:'JetBrains Mono',monospace;font-size:13px;
             color:var(--fg-muted);min-width:60px;text-align:center;">1 / 1</span>
    <button id="vocab-fc-next"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg);
             transition:border-color 0.15s;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
    <button id="vocab-fc-reset"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);
             transition:border-color 0.15s;margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    </button>
  </div>

  <!-- Dots -->
  <div id="vocab-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;

    // Attach events
    document.getElementById('vocab-fc-wrap').addEventListener('click', flipCard);
    document.getElementById('vocab-fc-prev').addEventListener('click', prevCard);
    document.getElementById('vocab-fc-next').addEventListener('click', nextCard);
    document.getElementById('vocab-fc-reset').addEventListener('click', () => {
      cardIndex = 0; flipped = false;
      updateFlipCard();
      renderFlashcardContent();
    });

    // Hover effects on nav buttons
    ['vocab-fc-prev','vocab-fc-next','vocab-fc-reset'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('mouseenter', () => btn.style.borderColor = 'var(--primary)');
      btn.addEventListener('mouseleave', () => btn.style.borderColor = 'var(--border)');
    });

    renderFlashcardContent();
    attachKeyboard();
  }

  /* ── Render mode toggle buttons ──────────────────────── */
  function renderModeBtns() {
    const wrap = document.getElementById('vocab-mode-btns');
    if (!wrap) return;
    wrap.innerHTML = ['grid','flashcard'].map(m => `
      <button class="vocab-mode-btn"
        data-mode="${m}"
        style="padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;
               border:1px solid ${mode === m ? 'var(--primary)' : 'var(--border)'};
               background:${mode === m ? 'var(--primary)' : 'var(--card-elevated)'};
               color:${mode === m ? '#fff' : 'var(--fg-muted)'};cursor:pointer;
               font-family:inherit;transition:all 0.15s;">
        ${m === 'grid' ? '⊞ Grid' : '🃏 Flashcards'}
      </button>
    `).join('');
    wrap.querySelectorAll('.vocab-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        detachKeyboard();
        mode = btn.dataset.mode;
        flipped = false;
        render();
      });
    });
  }

  /* ── Update header counts ────────────────────────────── */
  function updateCounts() {
    const el = document.getElementById('vocab-count-label');
    if (el) el.textContent = `${VocabPageWords.length} words · ${VocabPageCategories.length - 1} categories`;
  }

  /* ── Full render ─────────────────────────────────────── */
  function render() {
    renderModeBtns();
    renderCategoryTabs();
    updateCounts();
    if (mode === 'grid') {
      detachKeyboard();
      renderGrid();
    } else {
      renderFlashcard();
    }
  }

  /* ── Mount — called from pages.js vocab() ────────────── */
  function mount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
<div style="max-width:1600px;margin:0 auto;padding:24px 16px;">
  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:22px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">
        語彙 Vocabulary
      </h1>
      <p id="vocab-count-label" style="font-size:13px;color:var(--fg-muted);"></p>
    </div>
    <div id="vocab-mode-btns" style="display:flex;gap:8px;"></div>
  </div>

  <!-- Category scroll tabs -->
  <div id="vocab-cat-tabs"
    style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:20px;
           scrollbar-width:none;">
  </div>

  <!-- Main content area -->
  <div id="vocab-main-area"></div>
</div>`;

    render();
  }

  /* ── Cleanup (called on page nav away) ───────────────── */
  function cleanup() {
    detachKeyboard();
    if (speakTimer) clearTimeout(speakTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  return { mount, cleanup, render };
})();
