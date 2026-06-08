'use strict';
/**
 * NihongoZen — Kanji Page Module
 * Precisely mirrors the reference UI:
 *   漢字 Kanji Study  header
 *   SRS Review by Level: N5 N4 N3 N2 N1 (colored pills)
 *   N5 | N4 | N3 | N2 | N1  tabs (active = green underline, matching photo)
 *   Search bar
 *   Grid / Flashcard modes
 */

/* =========================================================
   CSS — injected once
   ========================================================= */
(function injectKanjiStyles() {
  if (document.getElementById('kanji-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'kanji-page-styles';
  style.textContent = `
    /* ── Scrollbar hide ─── */
    #kanji-level-tabs::-webkit-scrollbar,
    #kanji-cat-tabs::-webkit-scrollbar { display:none; }

    /* ── Level tab active underline (green, matches photo) ─── */
    .knj-lvl-tab { position:relative; transition:color 0.15s; }
    .knj-lvl-tab.active::after {
      content:'';
      position:absolute;
      bottom:-2px; left:50%; transform:translateX(-50%);
      width:70%; height:2px;
      background:#22c55e;
      border-radius:2px;
    }

    /* ── SRS pill colors ─── */
    .knj-srs-N5 { color:#22c55e; border-color:#22c55e !important; }
    .knj-srs-N4 { color:#06b6d4; border-color:#06b6d4 !important; }
    .knj-srs-N3 { color:#eab308; border-color:#eab308 !important; }
    .knj-srs-N2 { color:#a855f7; border-color:#a855f7 !important; }
    .knj-srs-N1 { color:#ef4444; border-color:#ef4444 !important; }

    /* ── Kanji card ─── */
    .knj-card {
      border-radius:12px;
      border:1px solid var(--border,#2a2a2a);
      background:var(--card,#141414);
      padding:18px;
      cursor:pointer;
      transition:transform 0.2s, box-shadow 0.2s;
      position:relative;
    }
    .knj-card:hover {
      transform:translateY(-3px);
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
    }

    /* ── Flip card ─── */
    #knj-flip-inner.flipped { transform:rotateY(180deg); }

    /* ── Equalizer ─── */
    .knj-eq { display:flex;align-items:flex-end;gap:2px;height:14px; }
    .knj-eq-bar {
      width:3px;border-radius:2px;
      background:var(--primary,#e8446a);
      animation:knjEqBounce 0.8s ease-in-out infinite;
    }
    .knj-eq-bar:nth-child(1){animation-delay:0s;   height:6px;}
    .knj-eq-bar:nth-child(2){animation-delay:0.15s;height:12px;}
    .knj-eq-bar:nth-child(3){animation-delay:0.3s; height:8px;}
    @keyframes knjEqBounce {
      0%,100%{transform:scaleY(0.4);}
      50%    {transform:scaleY(1);}
    }

    /* ── Search bar ─── */
    .knj-search-wrap {
      flex:1; display:flex;align-items:center;gap:8px;
      background:var(--card-elevated,#1a1a1a);
      border:1px solid var(--border,#2a2a2a);
      border-radius:12px;
      padding:0 14px; height:40px;
    }
    .knj-search-wrap input {
      flex:1;background:transparent;border:none;outline:none;
      color:var(--fg,#f0f0f0);font-size:13px;font-family:inherit;
    }
    .knj-search-wrap input::placeholder{color:var(--fg-muted,#666);}

    /* ── Learned badge ─── */
    .knj-learned-badge {
      position:absolute;top:10px;right:10px;
      background:rgba(34,197,94,0.15);
      color:#22c55e;
      border:1px solid rgba(34,197,94,0.3);
      border-radius:6px;
      font-size:9px;font-weight:700;
      padding:2px 6px;
      letter-spacing:0.5px;
    }

    /* ── Nav button hover ─── */
    .knj-nav-btn:hover { border-color:var(--primary,#e8446a) !important; }

    /* ── Mode button ─── */
    .knj-mode-btn {
      padding:7px 14px;border-radius:8px;
      font-size:13px;font-weight:600;
      cursor:pointer;font-family:inherit;
      transition:all 0.15s;
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   KANJI PAGE
   ========================================================= */
var KanjiPage = (() => {
  let mode        = 'grid';
  let activeLevel = 'N5';
  let cardIndex   = 0;
  let flipped     = false;
  let speakingId  = null;
  let speakTimer  = null;
  let keyHandler  = null;
  let searchQuery = '';

  /* ── Level accent colors ────────────────────────────── */
  const LEVEL_COLORS = {
    N5:'#22c55e', N4:'#06b6d4', N3:'#eab308', N2:'#a855f7', N1:'#ef4444'
  };

  /* ── Audio ──────────────────────────────────────────── */
  function speak(text, lang='ja-JP', rate=0.85) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang=lang; u.rate=rate;
    window.speechSynthesis.speak(u);
  }
  function speakKanji(kanji, meaning) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const j = new SpeechSynthesisUtterance(kanji);
    j.lang='ja-JP'; j.rate=0.75;
    j.onend = () => setTimeout(()=>{
      const e = new SpeechSynthesisUtterance(meaning);
      e.lang='en-US'; e.rate=0.9;
      window.speechSynthesis.speak(e);
    }, 700);
    window.speechSynthesis.speak(j);
  }

  /* ── Filter ─────────────────────────────────────────── */
  function getFiltered() {
    if (typeof kanjiData === 'undefined') return [];
    let list = kanjiData[activeLevel] || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(k =>
        k.kanji.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.reading.toLowerCase().includes(q) ||
        (k.kun && k.kun.toLowerCase().includes(q)) ||
        (k.on  && k.on.toLowerCase().includes(q))
      );
    }
    return list;
  }

  /* ── Total count per level ──────────────────────────── */
  function levelCount(lvl) {
    if (typeof kanjiData === 'undefined') return 0;
    return (kanjiData[lvl]||[]).length;
  }

  /* ── Flashcard nav ──────────────────────────────────── */
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
    const el=document.getElementById('knj-flip-inner');
    if(el) el.classList.toggle('flipped',flipped);
  }
  function goToCard(i) { cardIndex=i; flipped=false; updateFlip(); renderFCContent(); }

  /* ── Keyboard ────────────────────────────────────────── */
  function attachKeys() {
    detachKeys();
    keyHandler = e => {
      if (mode!=='flashcard') return;
      if (e.key==='ArrowRight'){e.preventDefault();nextCard();}
      else if (e.key==='ArrowLeft'){e.preventDefault();prevCard();}
      else if (e.key===' '){e.preventDefault();flipCard();}
    };
    window.addEventListener('keydown', keyHandler);
  }
  function detachKeys() {
    if (keyHandler){window.removeEventListener('keydown',keyHandler);keyHandler=null;}
  }

  /* ── Speak btn update ────────────────────────────────── */
  function updateSpeakBtns() {
    document.querySelectorAll('.knj-speak-btn').forEach(btn=>{
      const playing=btn.dataset.id===speakingId;
      btn.style.background=playing?'var(--primary-dim,rgba(232,68,106,0.15))':'transparent';
      btn.style.color=playing?'var(--primary,#e8446a)':'var(--fg-muted,#666)';
      btn.innerHTML=playing
        ?`<div class="knj-eq"><div class="knj-eq-bar"></div><div class="knj-eq-bar"></div><div class="knj-eq-bar"></div></div>`
        :speakerIcon(14);
    });
  }
  function handleSpeakBtn(e, kanji) {
    e.stopPropagation();
    if (speakTimer) clearTimeout(speakTimer);
    speakingId=kanji.id;
    speakKanji(kanji.kanji, kanji.meaning);
    updateSpeakBtns();
    speakTimer=setTimeout(()=>{speakingId=null;updateSpeakBtns();},3000);
  }

  /* ── Toggle learned ─────────────────────────────────── */
  function toggleLearned(id) {
    if (typeof kanjiData==='undefined') return;
    for (const lvl of Object.keys(kanjiData)) {
      const k = kanjiData[lvl].find(x=>x.id===id);
      if (k) { k.learned=!k.learned; break; }
    }
    if (mode==='grid') renderGrid();
    else renderFCContent();
  }

  /* ── Helpers ─────────────────────────────────────────── */
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function speakerIcon(size=14){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }

  /* ── Level tabs ─────────────────────────────────────── */
  function renderLevelTabs() {
    const wrap=document.getElementById('kanji-level-tabs');
    if(!wrap) return;
    const col=LEVEL_COLORS[activeLevel];
    wrap.innerHTML=['N5','N4','N3','N2','N1'].map(lvl=>`
      <button class="knj-lvl-tab ${activeLevel===lvl?'active':''}" data-level="${lvl}"
        style="padding:10px 18px;font-size:14px;font-weight:700;
               background:transparent;border:none;
               color:${activeLevel===lvl?'var(--fg)':'var(--fg-muted)'};
               cursor:pointer;font-family:inherit;">
        ${lvl}
      </button>`).join('');
    wrap.querySelectorAll('.knj-lvl-tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        activeLevel=btn.dataset.level; cardIndex=0; flipped=false;
        searchQuery=''; const si=document.getElementById('kanji-search-input'); if(si) si.value='';
        render();
      });
    });
  }

  /* ── Grid ────────────────────────────────────────────── */
  function renderGrid() {
    const filtered=getFiltered();
    const area=document.getElementById('kanji-main-area');
    if(!area) return;
    const col=LEVEL_COLORS[activeLevel];

    if(!filtered.length){
      area.innerHTML=`<p style="color:var(--fg-muted);text-align:center;padding:48px 0;">No kanji found.</p>`;
      return;
    }

    area.innerHTML=`
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
  ${filtered.map(k=>`
    <div class="knj-card" data-id="${esc(k.id)}"
      style="border-left:3px solid ${col};">
      ${k.learned?`<span class="knj-learned-badge">✓ LEARNED</span>`:''}
      <!-- Kanji + speak -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
        <div style="font-family:'Noto Sans JP',sans-serif;font-size:44px;font-weight:900;
                    color:var(--fg);line-height:1;">${esc(k.kanji)}</div>
        <button class="knj-speak-btn" data-id="${esc(k.id)}"
          style="padding:6px;border-radius:8px;border:none;background:transparent;
                 color:var(--fg-muted);cursor:pointer;flex-shrink:0;transition:all 0.15s;margin-top:4px;">
          ${speakerIcon(14)}
        </button>
      </div>
      <!-- Meaning -->
      <p style="font-size:13px;font-weight:700;color:var(--fg);margin-bottom:6px;">${esc(k.meaning)}</p>
      <!-- Readings -->
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
        ${k.kun?`<span style="padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;
                              background:rgba(34,197,94,0.12);color:#22c55e;font-family:'Noto Sans JP',sans-serif;">
                   kun: ${esc(k.kun)}</span>`:''}
        ${k.on ?`<span style="padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;
                              background:rgba(6,182,212,0.12);color:#06b6d4;font-family:'Noto Sans JP',sans-serif;">
                   on: ${esc(k.on)}</span>`:''}
      </div>
      <!-- Example -->
      <p style="font-size:11px;color:var(--fg-muted);font-family:'Noto Sans JP',sans-serif;
                border-top:1px solid var(--border);padding-top:8px;margin-bottom:8px;">${esc(k.example)}</p>
      <!-- Learned toggle -->
      <button class="knj-learned-btn" data-id="${esc(k.id)}"
        style="width:100%;padding:5px 0;border-radius:7px;border:1px solid ${k.learned?'rgba(34,197,94,0.4)':'var(--border)'};
               background:${k.learned?'rgba(34,197,94,0.1)':'transparent'};
               color:${k.learned?'#22c55e':'var(--fg-muted)'};font-size:11px;font-weight:600;
               cursor:pointer;font-family:inherit;transition:all 0.15s;">
        ${k.learned?'✓ Learned':'Mark as Learned'}
      </button>
    </div>
  `).join('')}
</div>`;

    area.querySelectorAll('.knj-speak-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const k=(kanjiData[activeLevel]||[]).find(x=>x.id===btn.dataset.id);
        if(k) handleSpeakBtn(e,k);
      });
    });
    area.querySelectorAll('.knj-learned-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{ e.stopPropagation(); toggleLearned(btn.dataset.id); });
    });
    area.querySelectorAll('.knj-card').forEach(card=>{
      card.addEventListener('click',e=>{
        if(e.target.closest('.knj-speak-btn')||e.target.closest('.knj-learned-btn')) return;
        const k=(kanjiData[activeLevel]||[]).find(x=>x.id===card.dataset.id);
        if(k) speak(k.kanji);
      });
    });
  }

  /* ── Flashcard content ──────────────────────────────── */
  function renderFCContent() {
    const filtered=getFiltered();
    if(!filtered.length) return;
    const k=filtered[cardIndex]||filtered[0];
    const col=LEVEL_COLORS[activeLevel];
    const front=document.getElementById('knj-fc-front');
    const back=document.getElementById('knj-fc-back');
    const counter=document.getElementById('knj-fc-counter');
    const inner=document.getElementById('knj-flip-inner');
    if(inner) inner.classList.toggle('flipped',flipped);

    if(front) front.innerHTML=`
      <div style="font-family:'Noto Sans JP',sans-serif;font-size:80px;font-weight:900;
                  color:var(--fg);line-height:1;margin-bottom:8px;">${esc(k.kanji)}</div>
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        ${k.kun?`<span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;
                              background:rgba(34,197,94,0.12);color:#22c55e;">kun: ${esc(k.kun)}</span>`:''}
        ${k.on ?`<span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;
                              background:rgba(6,182,212,0.12);color:#06b6d4;">on: ${esc(k.on)}</span>`:''}
      </div>
      <button id="knj-fc-speak-front"
        style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
               border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
               color:var(--primary,#e8446a);font-size:12px;cursor:pointer;font-family:inherit;margin-top:4px;">
        ${speakerIcon(12)} Tap to hear
      </button>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:8px;">Click to reveal meaning</p>`;

    if(back) back.innerHTML=`
      <p style="font-size:26px;font-weight:800;color:var(--fg);text-align:center;margin-bottom:8px;">${esc(k.meaning)}</p>
      <p style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--fg-muted);
                text-align:center;margin-bottom:12px;">${esc(k.example)}</p>
      <span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;
                   background:${col}18;color:${col};margin-bottom:12px;">${esc(activeLevel)}</span>
      <div style="display:flex;gap:8px;">
        <button id="knj-fc-speak-back"
          style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
                 border:1px solid rgba(232,68,106,0.3);background:rgba(232,68,106,0.1);
                 color:var(--primary,#e8446a);font-size:12px;cursor:pointer;font-family:inherit;">
          ${speakerIcon(12)} Hear kanji
        </button>
        <button id="knj-fc-learned-btn"
          style="display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;
                 border:1px solid ${k.learned?'rgba(34,197,94,0.4)':'var(--border)'};
                 background:${k.learned?'rgba(34,197,94,0.12)':'transparent'};
                 color:${k.learned?'#22c55e':'var(--fg-muted)'};font-size:12px;cursor:pointer;font-family:inherit;">
          ${k.learned?'✓ Learned':'Mark Learned'}
        </button>
      </div>
      <p style="font-size:11px;color:var(--fg-muted);margin-top:8px;">Click to flip back</p>`;

    const ff=document.getElementById('knj-fc-speak-front');
    if(ff) ff.addEventListener('click',e=>{e.stopPropagation();speak(k.kanji);});
    const fb=document.getElementById('knj-fc-speak-back');
    if(fb) fb.addEventListener('click',e=>{e.stopPropagation();speakKanji(k.kanji,k.meaning);});
    const lb=document.getElementById('knj-fc-learned-btn');
    if(lb) lb.addEventListener('click',e=>{e.stopPropagation();toggleLearned(k.id);});

    if(counter) counter.textContent=`${cardIndex+1} / ${filtered.length}`;
    const dots=document.getElementById('knj-fc-dots');
    if(dots){
      const shown=filtered.slice(0,Math.min(filtered.length,20));
      dots.innerHTML=shown.map((_,i)=>`
        <button class="knj-dot" data-i="${i}"
          style="width:8px;height:8px;border-radius:50%;padding:0;cursor:pointer;transition:all 0.15s;
                 border:1px solid ${i===cardIndex?'var(--primary)':'var(--border)'};
                 background:${i===cardIndex?'var(--primary)':'var(--card-elevated)'};"></button>
      `).join('');
      dots.querySelectorAll('.knj-dot').forEach(d=>d.addEventListener('click',()=>goToCard(parseInt(d.dataset.i))));
    }
  }

  /* ── Flashcard wrapper ──────────────────────────────── */
  function renderFlashcard() {
    const area=document.getElementById('kanji-main-area');
    if(!area) return;
    area.innerHTML=`
<div style="display:flex;flex-direction:column;align-items:center;max-width:400px;margin:0 auto;">
  <p style="font-size:11px;color:var(--fg-muted);margin-bottom:16px;text-align:center;">
    Click card to flip · ← → keys to navigate · Space to flip
  </p>
  <div id="knj-fc-wrap" style="width:100%;perspective:1000px;cursor:pointer;margin-bottom:20px;">
    <div id="knj-flip-inner"
      style="width:100%;height:260px;position:relative;
             transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
      <div id="knj-fc-front"
        style="position:absolute;inset:0;border-radius:20px;border:1px solid var(--border);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               display:flex;flex-direction:column;align-items:center;justify-content:center;
               gap:6px;padding:24px;"></div>
      <div id="knj-fc-back"
        style="position:absolute;inset:0;border-radius:20px;border:2px solid var(--primary,#e8446a);
               background:var(--card);backface-visibility:hidden;-webkit-backface-visibility:hidden;
               transform:rotateY(180deg);
               display:flex;flex-direction:column;align-items:center;justify-content:center;
               gap:6px;padding:24px;"></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <button id="knj-fc-prev" class="knj-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span id="knj-fc-counter"
      style="font-family:'JetBrains Mono',monospace;font-size:13px;
             color:var(--fg-muted);min-width:60px;text-align:center;">1/1</span>
    <button id="knj-fc-next" class="knj-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <button id="knj-fc-reset" class="knj-nav-btn"
      style="padding:10px;border-radius:12px;background:var(--card-elevated);
             border:1px solid var(--border);cursor:pointer;color:var(--fg-muted);margin-left:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </div>
  <div id="knj-fc-dots" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
</div>`;
    document.getElementById('knj-fc-wrap').addEventListener('click',flipCard);
    document.getElementById('knj-fc-prev').addEventListener('click',prevCard);
    document.getElementById('knj-fc-next').addEventListener('click',nextCard);
    document.getElementById('knj-fc-reset').addEventListener('click',()=>{cardIndex=0;flipped=false;updateFlip();renderFCContent();});
    renderFCContent();
    attachKeys();
  }

  /* ── Mode buttons ────────────────────────────────────── */
  function renderModeBtns() {
    const wrap=document.getElementById('kanji-mode-btns');
    if(!wrap) return;
    wrap.innerHTML=['grid','flashcard'].map(m=>`
      <button class="knj-mode-btn" data-mode="${m}"
        style="border:1px solid ${mode===m?'var(--primary,#e8446a)':'var(--border)'};
               background:${mode===m?'var(--primary,#e8446a)':'var(--card-elevated)'};
               color:${mode===m?'#fff':'var(--fg-muted)'};">
        ${m==='grid'?'⊞ Grid':'🃏 Flashcards'}
      </button>`).join('');
    wrap.querySelectorAll('.knj-mode-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{detachKeys();mode=btn.dataset.mode;flipped=false;render();});
    });
  }

  /* ── Full render ─────────────────────────────────────── */
  function render() {
    renderModeBtns();
    renderLevelTabs();
    // Update subtitle count
    const sub=document.getElementById('kanji-count-label');
    if(sub){
      const total = Object.values(kanjiData||{}).reduce((a,b)=>a+b.length,0);
      const lvlCount = levelCount(activeLevel);
      sub.textContent=`${lvlCount} kanji in ${activeLevel} · ${total} total`;
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

  <!-- ═══ Header ═══ -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;
              margin-bottom:20px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:24px;font-weight:800;color:var(--fg);margin-bottom:4px;letter-spacing:-0.3px;">
        漢字 Kanji Study
      </h1>
      <p id="kanji-count-label" style="font-size:13px;color:var(--fg-muted);">
        Master kanji from N5 to N1 level
      </p>
    </div>
    <div id="kanji-mode-btns" style="display:flex;gap:8px;"></div>
  </div>

  <!-- ═══ SRS Review row (exact reference photo layout) ═══ -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
    <span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--fg-muted);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      SRS Review by Level:
    </span>
    <div id="kanji-srs-pills" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
  </div>

  <!-- ═══ Level tabs + Search (matches reference photo) ═══ -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
    <!-- Level tab row -->
    <div id="kanji-level-tabs"
      style="display:flex;align-items:center;
             background:var(--card-elevated,#1a1a1a);
             border:1px solid var(--border,#2a2a2a);
             border-radius:12px;padding:4px;
             overflow-x:auto;scrollbar-width:none;flex-shrink:0;">
    </div>
    <!-- Search bar -->
    <div class="knj-search-wrap" style="min-width:200px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input id="kanji-search-input" type="text" placeholder="Search kanji, meaning, reading…" />
    </div>
  </div>

  <!-- ═══ Stats strip ═══ -->
  <div id="kanji-stats-strip"
    style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;"></div>

  <!-- ═══ Main content area ═══ -->
  <div id="kanji-main-area"></div>
</div>`;

    /* SRS pills */
    const srsWrap=document.getElementById('kanji-srs-pills');
    if(srsWrap){
      srsWrap.innerHTML=['N5','N4','N3','N2','N1'].map(lvl=>`
        <button class="knj-srs-${lvl}" data-level="${lvl}"
          style="padding:6px 14px;border-radius:8px;font-size:13px;font-weight:700;
                 background:transparent;border:1px solid currentColor;
                 cursor:pointer;font-family:inherit;transition:background 0.15s;">
          ${lvl}
        </button>`).join('');
      srsWrap.querySelectorAll('button').forEach(btn=>{
        btn.addEventListener('mouseenter',()=>{btn.style.background='rgba(255,255,255,0.07)';});
        btn.addEventListener('mouseleave',()=>{btn.style.background='transparent';});
        btn.addEventListener('click',()=>{
          activeLevel=btn.dataset.level; cardIndex=0; flipped=false; searchQuery='';
          const si=document.getElementById('kanji-search-input'); if(si) si.value='';
          render();
        });
      });
    }

    /* Search */
    container.querySelector('#kanji-search-input').addEventListener('input',e=>{
      searchQuery=e.target.value; cardIndex=0;
      if(mode==='grid') renderGrid();
      else renderFCContent();
    });

    /* Stats strip */
    function buildStats() {
      const strip=document.getElementById('kanji-stats-strip');
      if(!strip||typeof kanjiData==='undefined') return;
      strip.innerHTML=['N5','N4','N3','N2','N1'].map(lvl=>{
        const total=(kanjiData[lvl]||[]).length;
        const learned=(kanjiData[lvl]||[]).filter(k=>k.learned).length;
        const pct=total?Math.round(learned/total*100):0;
        const col=LEVEL_COLORS[lvl];
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;
                             border-radius:10px;border:1px solid var(--border);
                             background:var(--card-elevated);">
          <span style="font-size:12px;font-weight:700;color:${col};">${lvl}</span>
          <div style="width:80px;height:4px;border-radius:4px;background:var(--border);overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${col};border-radius:4px;transition:width 0.4s;"></div>
          </div>
          <span style="font-size:11px;color:var(--fg-muted);">${learned}/${total}</span>
        </div>`;
      }).join('');
    }
    buildStats();

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
