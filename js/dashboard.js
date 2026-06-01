// ===== DASHBOARD.JS =====

document.addEventListener('DOMContentLoaded', () => {
  renderKanjiGrid();
  renderVocabList();
  renderActivityFeed();
  initPomodoro();
});

/* ---- KANJI GRID ---- */
function renderKanjiGrid() {
  const grid = document.getElementById('kanji-grid');
  if (!grid) return;
  grid.innerHTML = APP_DATA.todayKanji.map(k => {
    const color = jlptLevelColor(k.level);
    return `
      <div class="kanji-card fade-up" onclick="showToast('${k.char}: ${k.meaning}','info')">
        <span class="kanji-char">${k.char}</span>
        <div class="kanji-reading">${k.reading}</div>
        <div class="kanji-meaning">${k.meaning}</div>
        <span class="kanji-level-dot" style="background:${color}"></span>
      </div>`;
  }).join('');
}

/* ---- VOCAB LIST ---- */
function renderVocabList() {
  const list = document.getElementById('vocab-list');
  if (!list) return;
  list.innerHTML = APP_DATA.vocabulary.map(v => {
    const color = jlptLevelColor(v.level);
    return `
      <div class="vocab-item">
        <span class="vocab-jp">${v.jp}</span>
        <span class="vocab-reading">${v.reading}</span>
        <span class="vocab-meaning">${v.meaning}</span>
        <span class="vocab-level" style="background:${color}22;color:${color};border:1px solid ${color}44">${v.level}</span>
      </div>`;
  }).join('');
}

/* ---- ACTIVITY FEED ---- */
function renderActivityFeed() {
  const list = document.getElementById('activity-list');
  if (!list) return;
  list.innerHTML = APP_DATA.recentActivity.map(a => `
    <li class="activity-item">
      <span class="activity-dot" style="background:${a.color}"></span>
      <div>
        <p class="activity-text">${a.text}</p>
        <p class="activity-time">${a.time}</p>
      </div>
    </li>`).join('');
}

/* ---- POMODORO TIMER ---- */
let timerInterval = null;
let timerSeconds  = 25 * 60;
let timerRunning  = false;
let timerName     = 'Focus Session';

function initPomodoro() {
  updateTimerDisplay();
}

function timerAction(minutes, label) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = parseInt(minutes) * 60;
  timerName    = label;
  document.getElementById('timer-label').textContent = label;
  document.getElementById('start-btn').textContent   = '▶ Start';
  updateTimerDisplay();

  document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function startTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('start-btn').textContent = '▶ Start';
  } else {
    timerRunning = true;
    document.getElementById('start-btn').textContent = '⏸ Pause';
    timerInterval = setInterval(() => {
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        document.getElementById('start-btn').textContent = '▶ Start';
        showToast(`${timerName} complete! 🍅`, 'success');
        return;
      }
      timerSeconds--;
      updateTimerDisplay();
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 25 * 60;
  timerName    = 'Focus Session';
  document.getElementById('timer-label').textContent = 'Focus Session';
  document.getElementById('start-btn').textContent   = '▶ Start';
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  const el = document.getElementById('timer-display');
  if (el) el.textContent = `${m}:${s}`;
}
