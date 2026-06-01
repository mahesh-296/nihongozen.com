// ===== DATA.JS — Shared App Data =====
// Mirrors the data structures from the original Next.js project

const APP_DATA = {
  user: {
    name: 'Kenji',
    email: 'kenji@nihongozen.app',
    level: 12,
    rank: 'Scholar',
    xp: 48200,
    xpNextLevel: 50000,
    streak: 14,
    bestStreak: 21,
  },

  kanjiOfDay: { char: '日', reading: 'にち / ひ', meaning: 'Sun / Day', level: 'N5' },

  todayKanji: [
    { char: '山', reading: 'さん / やま', meaning: 'Mountain', level: 'N5' },
    { char: '水', reading: 'すい / みず', meaning: 'Water',    level: 'N5' },
    { char: '火', reading: 'か / ひ',    meaning: 'Fire',     level: 'N5' },
    { char: '木', reading: 'もく / き',   meaning: 'Tree',     level: 'N5' },
    { char: '金', reading: 'きん / かね', meaning: 'Gold / Money', level: 'N5' },
    { char: '土', reading: 'ど / つち',   meaning: 'Earth / Soil', level: 'N5' },
    { char: '花', reading: 'か / はな',   meaning: 'Flower',   level: 'N5' },
    { char: '空', reading: 'くう / そら', meaning: 'Sky',      level: 'N4' },
    { char: '海', reading: 'かい / うみ', meaning: 'Sea',      level: 'N4' },
    { char: '電', reading: 'でん',        meaning: 'Electricity', level: 'N4' },
  ],

  vocabulary: [
    { jp: '食べる', reading: 'たべる',   meaning: 'to eat',      level: 'N5' },
    { jp: '飲む',   reading: 'のむ',     meaning: 'to drink',    level: 'N5' },
    { jp: '見る',   reading: 'みる',     meaning: 'to see/watch',level: 'N5' },
    { jp: '行く',   reading: 'いく',     meaning: 'to go',       level: 'N5' },
    { jp: '来る',   reading: 'くる',     meaning: 'to come',     level: 'N5' },
    { jp: '勉強する', reading: 'べんきょうする', meaning: 'to study', level: 'N5' },
    { jp: '電車',   reading: 'でんしゃ', meaning: 'train',       level: 'N4' },
    { jp: '駅',     reading: 'えき',     meaning: 'station',     level: 'N4' },
  ],

  weeklyXP: [
    { day: 'Mon', xp: 420 },
    { day: 'Tue', xp: 380 },
    { day: 'Wed', xp: 510 },
    { day: 'Thu', xp: 290 },
    { day: 'Fri', xp: 340 },
    { day: 'Sat', xp: 0   },
    { day: 'Sun', xp: 0   },
  ],

  jlptLevels: [
    { level: 'N5', progress: 94, learned: 94,  total: 100,  color: 'var(--jlpt-n5)' },
    { level: 'N4', progress: 72, learned: 216, total: 300,  color: 'var(--jlpt-n4)' },
    { level: 'N3', progress: 28, learned: 182, total: 650,  color: 'var(--jlpt-n3)' },
    { level: 'N2', progress: 5,  learned: 50,  total: 1000, color: 'var(--jlpt-n2)' },
    { level: 'N1', progress: 0,  learned: 0,   total: 2000, color: 'var(--jlpt-n1)' },
  ],

  achievements: [
    { icon: '🎯', title: 'N5 Complete',  desc: 'Completed all N5 kanji',       earned: true,  date: 'Jan 2026' },
    { icon: '🔥', title: '14-Day Streak',desc: 'Studied 14 days in a row',     earned: true,  date: 'May 2026' },
    { icon: '📚', title: 'Scholar Rank', desc: 'Reached Level 12',             earned: true,  date: 'Apr 2026' },
    { icon: '漢', title: '100 Kanji',    desc: 'Learned 100 kanji characters', earned: true,  date: 'Feb 2026' },
    { icon: '⚡', title: 'XP Master',    desc: 'Earn 50,000 total XP',         earned: false, date: null       },
    { icon: '🏆', title: 'N4 Complete',  desc: 'Complete all N4 kanji',        earned: false, date: null       },
  ],

  recentActivity: [
    { text: 'Completed N4 kanji quiz — 8/10 correct', time: '2 minutes ago',  color: 'var(--jlpt-n4)' },
    { text: 'Learned 3 new vocabulary words',         time: '18 minutes ago', color: 'var(--jlpt-n5)' },
    { text: 'Earned +340 XP today',                   time: '1 hour ago',     color: 'var(--primary)'  },
    { text: 'Completed Pomodoro focus session',       time: '2 hours ago',   color: 'var(--accent)'   },
    { text: 'Reviewed 10 N5 kanji flashcards',        time: '3 hours ago',   color: 'var(--jlpt-n3)'  },
  ],
};

// Level colors helper
function jlptLevelColor(level) {
  const map = { N5: 'var(--jlpt-n5)', N4: 'var(--jlpt-n4)', N3: 'var(--jlpt-n3)', N2: 'var(--jlpt-n2)', N1: 'var(--jlpt-n1)' };
  return map[level] || 'var(--primary)';
}

// Shared toast utility
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// Sidebar toggle
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}
