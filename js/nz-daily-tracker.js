/* ════════════════════════════════════════════════════════════════
   NZ DAILY TRACKER
   Lightweight shared "daily practice" tracker used to sync the dot
   indicator across the Conversation page and the Vocabulary
   Pronunciation / Verb Conjugation panels.

   Storage: localStorage key 'nz_daily_practice'
   Shape:   { "YYYY-MM-DD": { conversation: n, pronunciation: n, conjugation: n } }
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORE_KEY = 'nz_daily_practice';

  function todayKey(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() - (offsetDays || 0));
    return d.toISOString().slice(0, 10);
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* Record one unit of practice for today under a given category
     ('conversation' | 'pronunciation' | 'conjugation'). */
  function mark(category) {
    var data = load();
    var k = todayKey(0);
    if (!data[k]) data[k] = {};
    data[k][category] = (data[k][category] || 0) + 1;
    save(data);
    document.dispatchEvent(new CustomEvent('nz:dailyPracticeUpdated', { detail: { date: k, category: category } }));
    return data[k];
  }

  /* Returns array of last `n` days (oldest → newest), each:
     { date, label, total, done } */
  function getLastDays(n) {
    n = n || 7;
    var data = load();
    var out = [];
    var dayNames = ['S','M','T','W','T','F','S'];
    for (var i = n - 1; i >= 0; i--) {
      var key = todayKey(i);
      var entry = data[key] || {};
      var total = (entry.conversation || 0) + (entry.pronunciation || 0) + (entry.conjugation || 0);
      var d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ date: key, label: dayNames[d.getDay()], total: total, done: total > 0, isToday: i === 0 });
    }
    return out;
  }

  /* Builds the HTML for a row of dots representing the last `n` days.
     `title` is an optional label rendered to the left of the dots. */
  function renderDots(n, title) {
    var days = getLastDays(n || 7);
    var dotsHtml = days.map(function (d) {
      var bg = d.done ? 'var(--primary)' : 'var(--border)';
      var border = d.isToday ? '1.5px solid var(--primary)' : '1.5px solid transparent';
      return '<div title="' + d.date + (d.done ? ' · practiced' : '') + '" ' +
        'style="display:flex;flex-direction:column;align-items:center;gap:4px;">' +
          '<span style="width:10px;height:10px;border-radius:50%;background:' + bg + ';' +
            'border:' + border + ';box-shadow:' + (d.done ? '0 0 6px ' + bg + '88' : 'none') + ';' +
            'transition:all .2s;"></span>' +
          '<span style="font-size:9px;color:var(--fg-subtle);font-weight:700;">' + d.label + '</span>' +
        '</div>';
    }).join('');

    return '<div class="nz-daily-dots" style="display:flex;align-items:center;gap:10px;">' +
      (title ? '<span style="font-size:11px;font-weight:700;color:var(--fg-muted);' +
        'white-space:nowrap;">' + title + '</span>' : '') +
      '<div style="display:flex;gap:7px;">' + dotsHtml + '</div>' +
      '</div>';
  }

  /* Re-renders any element with [data-nz-daily-dots] in the DOM. */
  function refreshAll() {
    document.querySelectorAll('[data-nz-daily-dots]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-nz-daily-dots'), 10) || 7;
      var title = el.getAttribute('data-nz-daily-title') || '';
      el.innerHTML = renderDots(n, title);
    });
  }

  document.addEventListener('nz:dailyPracticeUpdated', refreshAll);

  window.NzDailyTracker = {
    mark: mark,
    getLastDays: getLastDays,
    renderDots: renderDots,
    refreshAll: refreshAll
  };
})();
