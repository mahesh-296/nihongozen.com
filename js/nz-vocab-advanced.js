'use strict';
/* ============================================================
   NihongoZen — Advanced Vocabulary System
   js/nz-vocab-advanced.js

   WHAT THIS FILE DOES
   --------------------
   Adds Step 5–7 of the "Premium Onboarding & Advanced Vocabulary"
   upgrade on top of the EXISTING vocabulary grid (js/nz-vocab-module.js)
   without modifying that file and without changing any styling —
   it only reuses classes/variables already defined in tokens.css /
   components.css.

   Adds to every vocab card:
     • JLPT level badge (from the active N5–N1 tab)
     • Category tag (from the current chapter's topic)
     • Learning status: ✅ Learned / ⭐ Favorite / ❌ Unlearned
       — saved instantly to Firestore under
         users/{uid}/vocabProgress/{wordId}
     • An "i" button that opens a Vocabulary Detail modal with
       Previous / Next navigation through the current word list

   Adds a Filter button (top-right of the Vocabulary page) that
   lets the user show/hide: Kanji/Kana, Romaji, English Meaning,
   JLPT badge, Category tag, and Audio button. Preference is saved
   to the user's profile (users/{uid}.vocabFilters).

   HONEST LIMITATION (please read):
   The underlying word data (js/vocabLevel.js) only stores
   { jp, romaji, en } — there is no separate hiragana-reading field,
   and no image field, for this dataset. Rather than inventing
   readings or pictures, the Hiragana and Image filter toggles are
   shown (per the spec) but marked "no data yet" and disabled, and
   the Detail modal says so plainly instead of guessing. Same for
   example sentences / synonyms / grammar notes — shown as an
   honest placeholder until that data exists, instead of making
   content up.

   This script is purely additive — it attaches via a
   MutationObserver, so it keeps working no matter which internal
   VocabPage function re-renders the grid (level tab, chapter
   button, search box, etc.), and it never touches BasicVocabPage,
   KanjiPage, or anything else already working.
   ============================================================ */

(function () {
  const LEVEL_COLORS = { N5: '#22c55e', N4: '#06b6d4', N3: '#eab308', N2: '#a855f7', N1: '#ef4444' };

  /* ---------------- helpers ---------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
  }
  function wordId(level, jp, en) {
    return level.toLowerCase() + '_' + hash(jp + '|' + en);
  }

  /* ---------------- state ---------------- */
  let progressMap = new Map();     // wordId -> 'learned' | 'favorite' | 'unlearned'
  let progressLoaded = false;
  let filters = {
    kanji: true, hiragana: true, romaji: true, meaning: true,
    jlpt: true, category: true, audio: true, image: true
  };

  /* ---------------- Firestore (reuses globals set by js/auth.js) ---------------- */
  async function fsMods() {
    return import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  }

  async function loadProgress() {
    if (progressLoaded) return;
    progressLoaded = true;
    try {
      if (!window._nzDb || !window._nzUser) return;
      const { collection, getDocs } = await fsMods();
      const snap = await getDocs(collection(window._nzDb, 'users', window._nzUser.uid, 'vocabProgress'));
      snap.forEach(d => progressMap.set(d.id, (d.data() || {}).status || 'unlearned'));
    } catch (err) {
      console.warn('[NihongoZen] Advanced Vocab: could not load progress', err);
    }
  }

  async function saveStatus(id, jp, en, level, status) {
    progressMap.set(id, status);
    try {
      if (!window._nzDb || !window._nzUser) return;
      const { doc, setDoc, serverTimestamp } = await fsMods();
      await setDoc(
        doc(window._nzDb, 'users', window._nzUser.uid, 'vocabProgress', id),
        { jp, en, level, status, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.warn('[NihongoZen] Advanced Vocab: could not save status', err);
    }
  }

  function loadFilters() {
    try {
      const saved = window._nzUserData && window._nzUserData.vocabFilters;
      if (saved) filters = Object.assign({}, filters, saved);
    } catch (e) { /* ignore */ }
  }

  async function saveFilters() {
    try {
      if (!window._nzDb || !window._nzUser) return;
      const { doc, updateDoc } = await fsMods();
      await updateDoc(doc(window._nzDb, 'users', window._nzUser.uid), { vocabFilters: filters });
      if (window._nzUserData) window._nzUserData.vocabFilters = filters;
    } catch (err) {
      console.warn('[NihongoZen] Advanced Vocab: could not save filters', err);
    }
  }

  /* ---------------- reading current level / category from the DOM ----------------
     (VocabPage keeps its state in a private closure, so we read the same info it
     already renders on screen instead of touching its internals.) */
  function currentLevel() {
    const el = document.querySelector('#vocab-level-tabs .nz-lvl-tab.active');
    return (el && el.dataset.level) || 'N5';
  }
  function currentCategory() {
    const label = document.getElementById('vocab-count-label');
    if (!label) return '';
    const text = label.textContent || '';
    const m = text.match(/Ch\s*\d+:\s*([^—·]+)(?:—\s*([^·]+))?·/);
    if (!m) return '';
    return (m[2] || m[1] || '').trim();
  }

  /* ---------------- status buttons (reused in card + modal) ---------------- */
  function statusButtonsHtml(status) {
    const mk = (key, icon, label, color) => {
      const active = status === key;
      return `<button class="nz-adv-status-btn" data-status="${key}" title="${label}"
        style="flex:1;padding:5px 0;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;
               font-family:inherit;transition:all .15s;
               border:1px solid ${active ? color : 'var(--border)'};
               background:${active ? color + '22' : 'transparent'};
               color:${active ? color : 'var(--fg-muted)'};">${icon}</button>`;
    };
    return mk('learned', '✅', 'Mark as Learned', '#22c55e')
         + mk('favorite', '⭐', 'Favorite', '#eab308')
         + mk('unlearned', '❌', 'Unlearned', '#ef4444');
  }

  function wireStatusButtons(row, id, jp, en, level, onChange) {
    row.querySelectorAll('.nz-adv-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const status = btn.dataset.status;
        saveStatus(id, jp, en, level, status);
        row.innerHTML = statusButtonsHtml(status);
        wireStatusButtons(row, id, jp, en, level, onChange);
        if (typeof onChange === 'function') onChange(status);
      });
    });
  }

  /* ---------------- filter panel ---------------- */
  function filterRowsConfig() {
    return [
      ['kanji', 'Kanji / Kana', true],
      ['hiragana', 'Hiragana reading', false],
      ['romaji', 'Romaji', true],
      ['meaning', 'English Meaning', true],
      ['jlpt', 'JLPT level badge', true],
      ['category', 'Category tag', true],
      ['audio', 'Audio button', true],
      ['image', 'Image', false]
    ];
  }

  function filterPanelHtml() {
    const rows = filterRowsConfig();
    return `<div style="font-size:12px;font-weight:700;color:var(--fg);margin-bottom:10px;">Show / Hide Fields</div>` +
      rows.map(([key, label, available]) => `
        <label style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px;
          color:${available ? 'var(--fg)' : 'var(--fg-subtle)'};cursor:${available ? 'pointer' : 'not-allowed'};">
          <input type="checkbox" data-filter="${key}" ${filters[key] ? 'checked' : ''} ${available ? '' : 'disabled'}
            style="accent-color:var(--primary);">
          ${label}${available ? '' : ' <span style="font-size:10px;">(no data yet)</span>'}
        </label>`).join('');
  }

  function injectFilterButton(root) {
    if (root.querySelector('#nz-adv-filter-btn')) return;
    const modeWrap = root.querySelector('#vocab-mode-btns');
    if (!modeWrap || !modeWrap.parentElement) return;

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.innerHTML = `
      <button id="nz-adv-filter-btn" class="btn btn-secondary" type="button" style="font-size:13px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filters
      </button>
      <div id="nz-adv-filter-panel" class="card"
        style="display:none;position:absolute;top:calc(100% + 8px);right:0;width:230px;padding:14px;
               z-index:60;box-shadow:var(--shadow-lg);">
        ${filterPanelHtml()}
      </div>`;
    modeWrap.parentElement.insertBefore(wrap, modeWrap);

    const btn = wrap.querySelector('#nz-adv-filter-btn');
    const panel = wrap.querySelector('#nz-adv-filter-panel');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) panel.style.display = 'none';
    });
    panel.querySelectorAll('input[data-filter]').forEach(input => {
      input.addEventListener('change', () => {
        filters[input.dataset.filter] = input.checked;
        saveFilters();
        document.querySelectorAll('.vocab-card[data-nz-adv]').forEach(applyFiltersToCard);
      });
    });
  }

  /* ---------------- apply filter visibility to one card ----------------
     Card DOM shape is fixed by nz-vocab-module.js's renderGrid():
       card.children[0] = header row  → children[0] = {jpDiv, romajiP}, children[1] = speak button
       card.children[1] = meaning <p>
     Everything from index 2 onward is what we appended (meta row, status row, info btn). */
  function applyFiltersToCard(card) {
    const headerRow = card.children[0];
    const meaningP = card.children[1];
    if (!headerRow) return;
    const headerLeft = headerRow.children[0];
    const speakBtn = headerRow.querySelector('.vocab-speak-btn');
    const jpDiv = headerLeft ? headerLeft.children[0] : null;
    const romajiP = headerLeft ? headerLeft.children[1] : null;
    const jlptBadge = card.querySelector('.nz-adv-jlpt');
    const catBadge = card.querySelector('.nz-adv-cat');

    if (jpDiv) jpDiv.style.display = filters.kanji ? '' : 'none';
    if (romajiP) romajiP.style.display = filters.romaji ? '' : 'none';
    if (meaningP) meaningP.style.display = filters.meaning ? '' : 'none';
    if (speakBtn) speakBtn.style.display = filters.audio ? '' : 'none';
    if (jlptBadge) jlptBadge.style.display = filters.jlpt ? '' : 'none';
    if (catBadge) catBadge.style.display = filters.category ? '' : 'none';
  }

  /* ---------------- enhance grid cards ---------------- */
  function enhanceCards(mainArea) {
    const level = currentLevel();
    const category = currentCategory();
    const color = LEVEL_COLORS[level] || 'var(--primary)';

    mainArea.querySelectorAll('.vocab-card:not([data-nz-adv])').forEach(card => {
      card.dataset.nzAdv = '1';
      card.style.position = 'relative';

      const jp = card.dataset.jp || '';
      const meaningP = card.children[1];
      const en = meaningP ? meaningP.textContent : '';
      const id = wordId(level, jp, en);
      card.dataset.nzId = id;
      card.dataset.nzLevel = level;
      card.dataset.nzCategory = category;
      card.dataset.nzEn = en;

      // Meta row: JLPT badge + category tag
      const metaRow = document.createElement('div');
      metaRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;';
      metaRow.innerHTML = `
        <span class="nz-adv-jlpt" style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;
          background:${color}22;color:${color};font-family:var(--font-mono);">${level}</span>
        <span class="nz-adv-cat" style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:5px;
          background:var(--card-elevated);color:var(--fg-muted);">${escapeHtml(category)}</span>`;
      card.appendChild(metaRow);

      // Status row
      const status = progressMap.get(id) || 'unlearned';
      const statusRow = document.createElement('div');
      statusRow.className = 'nz-adv-status';
      statusRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
      statusRow.innerHTML = statusButtonsHtml(status);
      card.appendChild(statusRow);
      wireStatusButtons(statusRow, id, jp, en, level);

      // Detail / info button
      const infoBtn = document.createElement('button');
      infoBtn.title = 'View details';
      infoBtn.style.cssText = 'position:absolute;top:10px;right:38px;padding:5px;border:none;' +
        'background:transparent;color:var(--fg-muted);cursor:pointer;border-radius:8px;';
      infoBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>`;
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetail(id, jp, en, level, category);
      });
      card.appendChild(infoBtn);

      applyFiltersToCard(card);
    });

    // Filter changes made while a card already existed should still apply.
    mainArea.querySelectorAll('.vocab-card[data-nz-adv]').forEach(applyFiltersToCard);
  }

  /* ---------------- detail modal (Step 7) ---------------- */
  function currentWordList() {
    return Array.from(document.querySelectorAll('#vocab-main-area .vocab-card')).map(c => ({
      id: c.dataset.nzId, jp: c.dataset.jp, en: c.dataset.nzEn,
      level: c.dataset.nzLevel, category: c.dataset.nzCategory
    }));
  }

  function openDetail(id, jp, en, level, category) {
    const list = currentWordList();
    let idx = list.findIndex(w => w.id === id);
    if (idx === -1) idx = 0;
    renderDetailModal(list, idx);
  }

  function renderDetailModal(list, idx) {
    const old = document.getElementById('nz-adv-detail-modal');
    if (old) old.remove();
    if (!list.length) return;

    const w = list[idx];
    const color = LEVEL_COLORS[w.level] || 'var(--primary)';
    const status = progressMap.get(w.id) || 'unlearned';

    const modal = document.createElement('div');
    modal.id = 'nz-adv-detail-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.6);' +
      'display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = `
      <div class="card" style="max-width:440px;width:100%;padding:30px;position:relative;">
        <button id="nz-adv-close" style="position:absolute;top:14px;right:14px;background:transparent;
          border:none;color:var(--fg-muted);cursor:pointer;font-size:16px;">✕</button>

        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:6px;
            background:${color}22;color:${color};font-family:var(--font-mono);">${w.level}</span>
          <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;
            background:var(--card-elevated);color:var(--fg-muted);">${escapeHtml(w.category)}</span>
        </div>

        <div style="font-family:'Noto Sans JP',sans-serif;font-size:36px;font-weight:800;
          color:var(--fg);margin-bottom:6px;">${escapeHtml(w.jp)}</div>
        <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fg-subtle);
          font-style:italic;margin-bottom:14px;">Hiragana reading — not available in current data</p>
        <p style="font-size:16px;color:var(--fg);margin-bottom:18px;">${escapeHtml(w.en)}</p>

        <div style="font-size:11px;color:var(--fg-subtle);line-height:1.6;margin-bottom:20px;
          border-top:1px solid var(--border);padding-top:14px;">
          Example sentences, grammar notes, synonyms/antonyms and related words aren't in the
          dataset for this word yet — they'll appear here automatically once that content is added.
        </div>

        <button id="nz-adv-speak-btn" class="btn btn-secondary" style="width:100%;margin-bottom:16px;">
          🔊 Play Pronunciation
        </button>

        <div id="nz-adv-modal-status" style="display:flex;gap:8px;margin-bottom:22px;"></div>

        <div style="display:flex;justify-content:space-between;">
          <button id="nz-adv-prev-btn" class="btn btn-secondary">← Previous</button>
          <button id="nz-adv-next-btn" class="btn btn-secondary">Next →</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector('#nz-adv-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('#nz-adv-speak-btn').addEventListener('click', () => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(w.jp);
      u.lang = 'ja-JP'; u.rate = 0.8;
      window.speechSynthesis.speak(u);
    });

    const statusWrap = modal.querySelector('#nz-adv-modal-status');
    statusWrap.innerHTML = statusButtonsHtml(status);
    wireStatusButtons(statusWrap, w.id, w.jp, w.en, w.level, () => {
      // keep the underlying grid card in sync
      const card = document.querySelector(`.vocab-card[data-nz-id="${w.id}"] .nz-adv-status`);
      if (card) {
        card.innerHTML = statusButtonsHtml(progressMap.get(w.id));
        wireStatusButtons(card, w.id, w.jp, w.en, w.level);
      }
    });

    modal.querySelector('#nz-adv-prev-btn').addEventListener('click', () => {
      renderDetailModal(list, (idx - 1 + list.length) % list.length);
    });
    modal.querySelector('#nz-adv-next-btn').addEventListener('click', () => {
      renderDetailModal(list, (idx + 1) % list.length);
    });
  }

  /* ---------------- bootstrap: watch for the Vocabulary page mounting ---------------- */
  function initAdvanced(root) {
    loadFilters();
    loadProgress().then(() => {
      const mainArea = root.querySelector('#vocab-main-area');
      if (mainArea) enhanceCards(mainArea);
    });
    injectFilterButton(root);

    const mainArea = root.querySelector('#vocab-main-area');
    if (mainArea) {
      enhanceCards(mainArea); // enhance immediately too (don't wait on network)
      const obs = new MutationObserver(() => enhanceCards(mainArea));
      obs.observe(mainArea, { childList: true });
    }
  }

  function watchForVocabPage() {
    const bodyObs = new MutationObserver(() => {
      const root = document.getElementById('nz-vocab-root');
      if (root && !root.dataset.nzAdvInit) {
        root.dataset.nzAdvInit = '1';
        // Give VocabPage.mount() a tick to finish building its DOM first.
        setTimeout(() => initAdvanced(root), 30);
      }
    });
    bodyObs.observe(document.body, { childList: true, subtree: true });

    // In case the vocab page is already open when this script loads.
    const existing = document.getElementById('nz-vocab-root');
    if (existing && !existing.dataset.nzAdvInit) {
      existing.dataset.nzAdvInit = '1';
      setTimeout(() => initAdvanced(existing), 30);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchForVocabPage);
  } else {
    watchForVocabPage();
  }
})();
