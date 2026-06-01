// ============================================================
//  kanaChart.js  —  Full Hiragana & Katakana interactive chart
//  Usage: place this file at  data/kanaChart.js
//         then add to your HTML:
//           <div id="kana-chart"></div>
//           <script src="data/kanaChart.js"></script>
// ============================================================

(function () {
  // ── DATA ────────────────────────────────────────────────────

  const hiragana = [
    // row, col, jp, romaji
    [0,0,'あ','a'],[0,1,'い','i'],[0,2,'う','u'],[0,3,'え','e'],[0,4,'お','o'],
    [1,0,'か','ka'],[1,1,'き','ki'],[1,2,'く','ku'],[1,3,'け','ke'],[1,4,'こ','ko'],
    [2,0,'さ','sa'],[2,1,'し','shi'],[2,2,'す','su'],[2,3,'せ','se'],[2,4,'そ','so'],
    [3,0,'た','ta'],[3,1,'ち','chi'],[3,2,'つ','tsu'],[3,3,'て','te'],[3,4,'と','to'],
    [4,0,'な','na'],[4,1,'に','ni'],[4,2,'ぬ','nu'],[4,3,'ね','ne'],[4,4,'の','no'],
    [5,0,'は','ha'],[5,1,'ひ','hi'],[5,2,'ふ','fu'],[5,3,'へ','he'],[5,4,'ほ','ho'],
    [6,0,'ま','ma'],[6,1,'み','mi'],[6,2,'む','mu'],[6,3,'め','me'],[6,4,'も','mo'],
    [7,0,'や','ya'],[7,2,'ゆ','yu'],[7,4,'よ','yo'],
    [8,0,'ら','ra'],[8,1,'り','ri'],[8,2,'る','ru'],[8,3,'れ','re'],[8,4,'ろ','ro'],
    [9,0,'わ','wa'],[9,2,'を','wo'],[9,4,'ん','n'],
  ];

  const katakana = [
    [0,0,'ア','a'],[0,1,'イ','i'],[0,2,'ウ','u'],[0,3,'エ','e'],[0,4,'オ','o'],
    [1,0,'カ','ka'],[1,1,'キ','ki'],[1,2,'ク','ku'],[1,3,'ケ','ke'],[1,4,'コ','ko'],
    [2,0,'サ','sa'],[2,1,'シ','shi'],[2,2,'ス','su'],[2,3,'セ','se'],[2,4,'ソ','so'],
    [3,0,'タ','ta'],[3,1,'チ','chi'],[3,2,'ツ','tsu'],[3,3,'テ','te'],[3,4,'ト','to'],
    [4,0,'ナ','na'],[4,1,'ニ','ni'],[4,2,'ヌ','nu'],[4,3,'ネ','ne'],[4,4,'ノ','no'],
    [5,0,'ハ','ha'],[5,1,'ヒ','hi'],[5,2,'フ','fu'],[5,3,'ヘ','he'],[5,4,'ホ','ho'],
    [6,0,'マ','ma'],[6,1,'ミ','mi'],[6,2,'ム','mu'],[6,3,'メ','me'],[6,4,'モ','mo'],
    [7,0,'ヤ','ya'],[7,2,'ユ','yu'],[7,4,'ヨ','yo'],
    [8,0,'ラ','ra'],[8,1,'リ','ri'],[8,2,'ル','ru'],[8,3,'レ','re'],[8,4,'ロ','ro'],
    [9,0,'ワ','wa'],[9,2,'ヲ','wo'],[9,4,'ン','n'],
  ];

  const dakuten = [
    [0,0,'が','ga'],[0,1,'ぎ','gi'],[0,2,'ぐ','gu'],[0,3,'げ','ge'],[0,4,'ご','go'],
    [1,0,'ざ','za'],[1,1,'じ','ji'],[1,2,'ず','zu'],[1,3,'ぜ','ze'],[1,4,'ぞ','zo'],
    [2,0,'だ','da'],[2,1,'ぢ','di'],[2,2,'づ','du'],[2,3,'で','de'],[2,4,'ど','do'],
    [3,0,'ば','ba'],[3,1,'び','bi'],[3,2,'ぶ','bu'],[3,3,'べ','be'],[3,4,'ぼ','bo'],
    [4,0,'ぱ','pa'],[4,1,'ぴ','pi'],[4,2,'ぷ','pu'],[4,3,'ぺ','pe'],[4,4,'ぽ','po'],
  ];

  const combinations = [
    [0,0,'きゃ','kya'],[0,1,'きゅ','kyu'],[0,2,'きょ','kyo'],
    [1,0,'しゃ','sha'],[1,1,'しゅ','shu'],[1,2,'しょ','sho'],
    [2,0,'ちゃ','cha'],[2,1,'ちゅ','chu'],[2,2,'ちょ','cho'],
    [3,0,'にゃ','nya'],[3,1,'にゅ','nyu'],[3,2,'にょ','nyo'],
    [4,0,'ひゃ','hya'],[4,1,'ひゅ','hyu'],[4,2,'ひょ','hyo'],
    [5,0,'みゃ','mya'],[5,1,'みゅ','myu'],[5,2,'みょ','myo'],
    [6,0,'りゃ','rya'],[6,1,'りゅ','ryu'],[6,2,'りょ','ryo'],
    [7,0,'ぎゃ','gya'],[7,1,'ぎゅ','gyu'],[7,2,'ぎょ','gyo'],
    [8,0,'じゃ','ja'],[8,1,'じゅ','ju'],[8,2,'じょ','jo'],
  ];

  const TABS = [
    { key: 'hiragana',     label: 'Hiragana',     jp: 'ひらがな', data: hiragana,     cols: 5, rows: 10 },
    { key: 'katakana',     label: 'Katakana',     jp: 'カタカナ', data: katakana,     cols: 5, rows: 10 },
    { key: 'dakuten',      label: 'Dakuten',      jp: '濁点',     data: dakuten,      cols: 5, rows: 5  },
    { key: 'combinations', label: 'Combinations', jp: '組み合わせ',data: combinations, cols: 3, rows: 9  },
  ];

  // ── STATE ────────────────────────────────────────────────────
  let activeTab  = 'hiragana';
  let activeCell = null;
  let isPlaying  = false;
  let stopFlag   = false;

  // ── STYLES ───────────────────────────────────────────────────
  const CSS = `
    #kana-chart * { box-sizing: border-box; margin: 0; padding: 0; }
    #kana-chart {
      font-family: 'Segoe UI', system-ui, sans-serif;
      max-width: 680px;
      margin: 0 auto;
      padding: 24px 16px;
      color: #1a1a1a;
      background: transparent;
    }
    .kc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .kc-title { font-size: 22px; font-weight: 600; color: #1a1a1a; }
    .kc-subtitle { font-size: 13px; color: #888; margin-top: 2px; }
    .kc-play-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 18px;
      border-radius: 8px;
      border: none;
      background: #534AB7;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      letter-spacing: 0.01em;
    }
    .kc-play-btn:hover { background: #7F77DD; }
    .kc-play-btn:active { transform: scale(0.97); }
    .kc-play-btn.stopping { background: #D85A30; }
    .kc-play-btn svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }

    .kc-tabs {
      display: flex;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
      background: #f7f7f7;
    }
    .kc-tab {
      flex: 1;
      padding: 10px 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 11px;
      color: #999;
      line-height: 1.4;
      transition: background 0.15s, color 0.15s;
      position: relative;
    }
    .kc-tab .kc-jp  { font-size: 15px; display: block; font-family: 'Noto Sans JP', serif; }
    .kc-tab.active  { background: #fff; color: #534AB7; font-weight: 600; box-shadow: inset 0 -2px 0 #534AB7; }
    .kc-tab:hover:not(.active) { background: #efefef; color: #555; }

    .kc-vowel-row {
      display: grid;
      gap: 8px;
      margin-bottom: 6px;
    }
    .kc-vowel-h {
      text-align: center;
      font-size: 11px;
      color: #aaa;
      font-family: monospace;
      padding: 2px 0;
    }

    .kc-grid { display: grid; gap: 8px; }

    .kc-cell {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      height: 66px;
      cursor: pointer;
      position: relative;
      transition: border-color 0.15s, background 0.15s, transform 0.1s, box-shadow 0.15s;
      padding: 4px;
      outline: none;
    }
    .kc-cell:hover {
      border-color: #AFA9EC;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(83,74,183,0.12);
    }
    .kc-cell:active { transform: translateY(0); }
    .kc-cell.active {
      background: #EEEDFE;
      border-color: #534AB7;
      box-shadow: 0 0 0 2px rgba(83,74,183,0.2);
    }
    .kc-cell-empty {
      height: 66px;
      border-radius: 10px;
      background: #f7f7f7;
      border: 1px dashed #e0e0e0;
    }
    .kc-char {
      font-size: 26px;
      line-height: 1;
      color: #1a1a1a;
      font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', serif;
      transition: color 0.15s;
    }
    .kc-cell.active .kc-char { color: #534AB7; }
    .kc-rom {
      font-size: 10px;
      color: #bbb;
      font-family: monospace;
      letter-spacing: 0.02em;
    }
    .kc-cell.active .kc-rom { color: #7F77DD; }
    .kc-sound-icon {
      position: absolute;
      top: 5px; right: 6px;
      font-size: 9px;
      color: #AFA9EC;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .kc-cell:hover .kc-sound-icon { opacity: 1; }

    .kc-footer {
      text-align: center;
      font-size: 12px;
      color: #ccc;
      margin-top: 16px;
    }

    @media (max-width: 400px) {
      .kc-cell { height: 56px; }
      .kc-char { font-size: 22px; }
      .kc-tab .kc-jp { font-size: 13px; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      #kana-chart { color: #f0f0f0; }
      .kc-title { color: #f0f0f0; }
      .kc-tabs { border-color: #333; background: #1a1a1a; }
      .kc-tab { color: #666; }
      .kc-tab.active { background: #262626; color: #AFA9EC; box-shadow: inset 0 -2px 0 #7F77DD; }
      .kc-tab:hover:not(.active) { background: #222; color: #aaa; }
      .kc-cell { background: #1e1e1e; border-color: #333; }
      .kc-cell:hover { border-color: #7F77DD; box-shadow: 0 4px 12px rgba(127,119,221,0.2); }
      .kc-cell.active { background: #26215C; border-color: #7F77DD; }
      .kc-cell-empty { background: #181818; border-color: #2a2a2a; }
      .kc-char { color: #f0f0f0; }
      .kc-vowel-h { color: #555; }
      .kc-subtitle { color: #666; }
    }
  `;

  // ── HELPERS ──────────────────────────────────────────────────
  function speak(text) {
    return new Promise(resolve => {
      if (!window.speechSynthesis || !text) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'ja-JP';
      utt.rate = 0.65;
      utt.onend  = () => setTimeout(resolve, 700);
      utt.onerror = resolve;
      window.speechSynthesis.speak(utt);
    });
  }

  function buildGrid(tabDef) {
    const { data, cols, rows } = tabDef;
    // Build lookup map  [row][col] → cell
    const map = {};
    data.forEach(([r, c, jp, romaji]) => {
      if (!map[r]) map[r] = {};
      map[r][c] = { jp, romaji, id: jp };
    });
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push(map[r] && map[r][c] ? map[r][c] : null);
      }
    }
    return cells;
  }

  // ── RENDER ───────────────────────────────────────────────────
  function render(root) {
    const tab = TABS.find(t => t.key === activeTab);
    const cells = buildGrid(tab);

    const playSVG = isPlaying
      ? `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
    const playLabel = isPlaying ? 'Stop' : '▶ Play All';

    const vowelHeaders = tab.cols === 5
      ? `<div class="kc-vowel-row" style="grid-template-columns:repeat(5,1fr)">
           ${['a','i','u','e','o'].map(v => `<div class="kc-vowel-h">${v}</div>`).join('')}
         </div>`
      : '';

    const gridHTML = cells.map(cell => {
      if (!cell) return `<div class="kc-cell-empty"></div>`;
      const isAct = activeCell === cell.id;
      return `<button class="kc-cell${isAct ? ' active' : ''}"
                data-jp="${cell.jp}"
                aria-label="${cell.romaji} — ${cell.jp}"
                title="${cell.romaji}">
        <span class="kc-char">${cell.jp}</span>
        <span class="kc-rom">${cell.romaji}</span>
        <span class="kc-sound-icon">🔊</span>
      </button>`;
    }).join('');

    const tabsHTML = TABS.map(t => `
      <button class="kc-tab${activeTab === t.key ? ' active' : ''}" data-tab="${t.key}">
        <span class="kc-jp">${t.jp}</span>${t.label}
      </button>`).join('');

    const count = cells.filter(Boolean).length;

    root.innerHTML = `
      <div class="kc-header">
        <div>
          <div class="kc-title">Kana Chart</div>
          <div class="kc-subtitle">Click any character to hear its pronunciation</div>
        </div>
        <button class="kc-play-btn${isPlaying ? ' stopping' : ''}" id="kc-play-btn">
          ${playSVG} ${playLabel}
        </button>
      </div>
      <div class="kc-tabs">${tabsHTML}</div>
      ${vowelHeaders}
      <div class="kc-grid" style="grid-template-columns:repeat(${tab.cols},1fr)">${gridHTML}</div>
      <div class="kc-footer">${count} characters · Web Speech API</div>
    `;

    // ── Events ────────────────────────────────────────────────
    root.querySelectorAll('.kc-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === activeTab) return;
        stopFlag = true;
        window.speechSynthesis && window.speechSynthesis.cancel();
        isPlaying = false; activeCell = null;
        activeTab = btn.dataset.tab;
        render(root);
      });
    });

    root.querySelectorAll('.kc-cell').forEach(btn => {
      btn.addEventListener('click', () => {
        const jp = btn.dataset.jp;
        if (!jp) return;
        activeCell = jp;
        render(root);
        speak(jp).then(() => {
          if (activeCell === jp) { activeCell = null; render(root); }
        });
      });
    });

    root.querySelector('#kc-play-btn').addEventListener('click', async () => {
      if (isPlaying) {
        stopFlag = true;
        window.speechSynthesis && window.speechSynthesis.cancel();
        isPlaying = false; activeCell = null;
        render(root); return;
      }
      isPlaying = true; stopFlag = false;
      render(root);
      const tab = TABS.find(t => t.key === activeTab);
      const cells = buildGrid(tab).filter(Boolean);
      for (const cell of cells) {
        if (stopFlag) break;
        activeCell = cell.id;
        render(root);
        await speak(cell.jp);
      }
      isPlaying = false; activeCell = null;
      render(root);
    });
  }

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    const mountEl = document.getElementById('kana-chart');
    if (!mountEl) {
      console.warn('[kanaChart.js] No element with id="kana-chart" found.');
      return;
    }

    // Inject styles once
    if (!document.getElementById('kana-chart-styles')) {
      const style = document.createElement('style');
      style.id = 'kana-chart-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    render(mountEl);
  }

  // Expose re-init so the SPA can call it after dynamically injecting #kana-chart
  window._nzKanaInit = function() {
    var el = document.getElementById('kana-chart');
    if (!el) return;
    // Re-inject styles if missing (e.g. after SPA navigation)
    if (!document.getElementById('kana-chart-styles')) {
      var style = document.createElement('style');
      style.id = 'kana-chart-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    // Reset state so chart starts fresh each time
    activeTab  = 'hiragana';
    activeCell = null;
    isPlaying  = false;
    stopFlag   = false;
    render(el);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
