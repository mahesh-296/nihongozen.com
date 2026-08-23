/*==============================================
  NihongoZen — Shared Theme Engine
  8 selectable themes (4 light-family, 4 dark-family).
  Include this file on EVERY page (after tokens.css)
  so theme state is consistent app-wide. Do not
  duplicate this logic anywhere else — in particular,
  do NOT hardcode theme-toggle icons elsewhere; always
  read them from window.nzThemeMeta / window.nzThemeList
  so a page's icon can never drift out of sync with the
  actual active theme.

  Requires the tiny inline "pre-paint" snippet in
  <head> (see theme-boot-snippet.html) to avoid a
  flash of the wrong theme before this file loads.
================================================*/
(function () {
  var THEME_ORDER = [
    'light', 'coral-sunset', 'forest-dream', 'pastel-zen', 'warm-autumn',
    'dark', 'ocean-dark', 'lavender-night'
  ];
  var THEME_META = {
    'light':          { icon: '☀️', label: 'Light',          swatch: '#2F4A3D', next: 'Change theme' },
    'coral-sunset':   { icon: '🌅', label: 'Coral Sunset',   swatch: '#D97A4D', next: 'Change theme' },
    'forest-dream':   { icon: '🌲', label: 'Forest Dream',   swatch: '#3A6B54', next: 'Change theme' },
    'pastel-zen':     { icon: '✨', label: 'Pastel Zen',     swatch: '#B8859A', next: 'Change theme' },
    'warm-autumn':    { icon: '🍂', label: 'Warm Autumn',    swatch: '#A8663A', next: 'Change theme' },
    'dark':           { icon: '🌙', label: 'Dark',           swatch: '#5FAE7C', next: 'Change theme' },
    'ocean-dark':     { icon: '🌊', label: 'Ocean Dark',     swatch: '#3A8B7A', next: 'Change theme' },
    'lavender-night': { icon: '💜', label: 'Lavender Night', swatch: '#6B5B8F', next: 'Change theme' }
  };
  var THEME_COLOR = {
    'light': '#FAF7F1', 'coral-sunset': '#FEF6F0', 'forest-dream': '#F0F6F3',
    'pastel-zen': '#FDF9F7', 'warm-autumn': '#FAF5F0',
    'dark': '#2B3631', 'ocean-dark': '#0D1F1D', 'lavender-night': '#14121A'
  };
  var DEFAULT_THEME = 'light'; // Calm cream/green is the app-wide default

  function applyTheme(theme) {
    if (THEME_ORDER.indexOf(theme) === -1) theme = DEFAULT_THEME;

    THEME_ORDER.forEach(function (t) { document.documentElement.classList.remove('nz-' + t); });
    if (theme !== 'dark') document.documentElement.classList.add('nz-' + theme);
    // 'dark' has no class of its own — it is the :root default, exactly as before.

    window._nzTheme = theme;
    window._nzLightMode = theme === 'light'; // kept for backward-compat with any existing checks

    var meta = THEME_META[theme];

    // Update any theme-toggle buttons present on this page (there can be more than one,
    // e.g. mobile + desktop topbar). This is the ONLY place that sets these icons —
    // never hardcode a theme icon anywhere else in the app.
    document.querySelectorAll('[data-theme-toggle], #nz-theme-toggle, #nz-theme-toggle-desk')
      .forEach(function (btn) {
        btn.textContent = meta.icon;
        btn.setAttribute('aria-label', meta.next);
        btn.title = meta.label + ' — tap to change theme';
      });

    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', THEME_COLOR[theme]);

    // Refresh an open picker panel (if any) so its checkmark stays in sync.
    if (document.getElementById('nz-theme-picker-panel')) renderPickerOptions();

    document.dispatchEvent(new CustomEvent('nz:themechange', { detail: { theme: theme } }));
  }

  // Allow setting a specific theme directly.
  window.nzSetTheme = function (theme) {
    if (THEME_ORDER.indexOf(theme) === -1) return;
    try { localStorage.setItem('nz-theme', theme); } catch (e) {}
    applyTheme(theme);
  };

  // Back-compat: cycles to the next theme in THEME_ORDER (no longer used by the
  // built-in toggle buttons, which now open the picker instead, but kept in case
  // any other code still calls it).
  window.nzToggleTheme = function () {
    var current = THEME_ORDER.indexOf(window._nzTheme || DEFAULT_THEME);
    var next = THEME_ORDER[(current + 1) % THEME_ORDER.length];
    window.nzSetTheme(next);
  };

  // Expose the full list + metadata so a settings/theme-picker UI can render
  // options without hardcoding them a second time somewhere else.
  window.nzThemeList = THEME_ORDER.map(function (t) {
    return { id: t, icon: THEME_META[t].icon, label: THEME_META[t].label, swatch: THEME_META[t].swatch };
  });
  window.nzThemeMeta = THEME_META;

  /* ── Theme picker dropdown (shared implementation for every toggle
     button on any page — mobile topbar, desktop sidebar, settings, etc.) ── */
  var pickerAnchor = null;

  function renderPickerOptions() {
    var panel = document.getElementById('nz-theme-picker-panel');
    if (!panel) return;
    panel.innerHTML = '';
    THEME_ORDER.forEach(function (id) {
      var meta = THEME_META[id];
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:9px 10px;' +
        'border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;color:var(--fg);';
      row.addEventListener('mouseover', function () { row.style.background = 'var(--card-elevated)'; });
      row.addEventListener('mouseout', function () { row.style.background = ''; });
      row.innerHTML =
        '<span style="width:22px;height:22px;border-radius:7px;background:' + meta.swatch + ';' +
          'border:1px solid var(--border);flex-shrink:0;"></span>' +
        '<span style="flex:1;">' + meta.icon + ' ' + meta.label + '</span>' +
        (id === window._nzTheme ? '<span style="color:var(--primary);font-weight:800;">✓</span>' : '');
      row.addEventListener('click', function () {
        window.nzSetTheme(id);
        closePicker();
      });
      panel.appendChild(row);
    });
  }

  function positionPanel(panel, anchor) {
    var r = anchor.getBoundingClientRect();
    var panelWidth = 220;
    var left = Math.min(r.left, window.innerWidth - panelWidth - 12);
    left = Math.max(8, left);
    var top = r.bottom + 8;
    // Flip above the anchor if there isn't enough room below.
    if (top + 340 > window.innerHeight) top = Math.max(8, r.top - 340 - 8);
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  function outsideClickHandler(e) {
    var panel = document.getElementById('nz-theme-picker-panel');
    if (!panel) return;
    if (panel.contains(e.target) || (pickerAnchor && pickerAnchor.contains(e.target))) return;
    closePicker();
  }

  function closePicker() {
    var panel = document.getElementById('nz-theme-picker-panel');
    if (panel) panel.remove();
    document.removeEventListener('click', outsideClickHandler, true);
    window.removeEventListener('resize', closePicker);
    pickerAnchor = null;
  }

  window.nzOpenThemePicker = function (anchorEl) {
    // Toggle: if already open for this anchor, close it instead of re-opening.
    var existing = document.getElementById('nz-theme-picker-panel');
    if (existing) {
      var wasSameAnchor = pickerAnchor === anchorEl;
      closePicker();
      if (wasSameAnchor) return;
    }
    pickerAnchor = anchorEl;
    var panel = document.createElement('div');
    panel.id = 'nz-theme-picker-panel';
    panel.style.cssText = 'position:fixed;z-index:500;background:var(--card);' +
      'border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-lg);' +
      'padding:8px;width:220px;max-height:340px;overflow-y:auto;';
    document.body.appendChild(panel);
    renderPickerOptions();
    positionPanel(panel, anchorEl);
    setTimeout(function () {
      document.addEventListener('click', outsideClickHandler, true);
      window.addEventListener('resize', closePicker);
    }, 0);
  };

  var saved;
  try { saved = localStorage.getItem('nz-theme'); } catch (e) { saved = null; }

  var initial;
  if (THEME_ORDER.indexOf(saved) !== -1) {
    // Explicit user choice always wins.
    initial = saved;
  } else {
    // No saved preference yet (first-ever visit on this device): respect the
    // OS-level dark-mode setting rather than forcing Light on everyone.
    var systemPrefersDark = false;
    try { systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
    initial = systemPrefersDark ? 'dark' : DEFAULT_THEME;
  }
  applyTheme(initial);

  // Auto-wire any button already in the DOM, and any added later (e.g. after auth loads).
  // Clicking a toggle button now opens the picker rather than blindly cycling.
  function wireToggleButtons() {
    document.querySelectorAll('[data-theme-toggle], #nz-theme-toggle, #nz-theme-toggle-desk')
      .forEach(function (btn) {
        if (btn._nzWired) return;
        btn._nzWired = true;
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          window.nzOpenThemePicker(btn);
        });
      });
  }
  document.addEventListener('DOMContentLoaded', wireToggleButtons);
  document.addEventListener('nz:userReady', wireToggleButtons);
  // Also catch buttons injected well after initial load (e.g. topbar built async).
  setInterval(wireToggleButtons, 500);
})();
