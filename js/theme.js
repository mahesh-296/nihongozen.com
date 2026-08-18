/*==============================================
  NihongoZen — Shared Theme Engine
  Exactly two themes: Light and Dark. Both use the
  same "Calm" cream/green learning-studio look — only
  the light/dark balance changes, never the style.
  Include this file on EVERY page (after tokens.css)
  so theme state is consistent app-wide. Do not
  duplicate this logic anywhere else.

  Requires the tiny inline "pre-paint" snippet in
  <head> (see theme-boot-snippet.html) to avoid a
  flash of the wrong theme before this file loads.
================================================*/
(function () {
  var THEME_ORDER = ['light', 'dark'];
  var THEME_META = {
    'light': { icon: '☀️', label: 'Light theme', next: 'Switch to Dark theme' },
    'dark':  { icon: '🌙', label: 'Dark theme',  next: 'Switch to Light theme' }
  };
  var THEME_COLOR = { 'light': '#F7F3EA', 'dark': '#13201A' };
  var DEFAULT_THEME = 'light'; // Calm cream/green is the app-wide default

  function applyTheme(theme) {
    if (THEME_ORDER.indexOf(theme) === -1) theme = DEFAULT_THEME;

    document.documentElement.classList.remove('nz-light');
    if (theme === 'light') document.documentElement.classList.add('nz-light');

    window._nzTheme = theme;
    window._nzLightMode = theme === 'light'; // kept for backward-compat with any existing checks

    var meta = THEME_META[theme];

    // Update any theme-toggle buttons present on this page (there can be more than one,
    // e.g. mobile + desktop topbar).
    document.querySelectorAll('[data-theme-toggle], #nz-theme-toggle, #nz-theme-toggle-desk')
      .forEach(function (btn) {
        btn.textContent = meta.icon;
        btn.setAttribute('aria-label', meta.next);
        btn.title = meta.next;
      });

    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', THEME_COLOR[theme]);

    // Let page-specific features react to theme changes without theme.js needing to know
    // they exist (decorative canvases have been removed app-wide, but the event still fires
    // in case other lightweight UI needs to respond, e.g. syncing a settings menu).
    document.dispatchEvent(new CustomEvent('nz:themechange', { detail: { theme: theme } }));
  }

  window.nzToggleTheme = function () {
    var current = THEME_ORDER.indexOf(window._nzTheme || DEFAULT_THEME);
    var next = THEME_ORDER[(current + 1) % THEME_ORDER.length];
    try { localStorage.setItem('nz-theme', next); } catch (e) {}
    applyTheme(next);
  };

  // Allow setting a specific theme directly (used by a settings menu, if any).
  window.nzSetTheme = function (theme) {
    if (THEME_ORDER.indexOf(theme) === -1) return;
    try { localStorage.setItem('nz-theme', theme); } catch (e) {}
    applyTheme(theme);
  };

  // Expose the full list + metadata so a settings/theme-picker UI can render
  // options without hardcoding them a second time somewhere else.
  window.nzThemeList = THEME_ORDER.map(function (t) {
    return { id: t, icon: THEME_META[t].icon, label: THEME_META[t].label };
  });

  var saved;
  try { saved = localStorage.getItem('nz-theme'); } catch (e) { saved = null; }

  var initial;
  if (THEME_ORDER.indexOf(saved) !== -1) {
    // Explicit user choice always wins.
    initial = saved;
  } else {
    // No saved preference yet (first-ever visit on this device): respect the
    // OS-level dark-mode setting rather than forcing Light on everyone.
    // Light remains the default the moment the system is NOT in dark mode.
    var systemPrefersDark = false;
    try { systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
    initial = systemPrefersDark ? 'dark' : DEFAULT_THEME;
  }
  applyTheme(initial);

  // Auto-wire any button already in the DOM, and any added later (e.g. after auth loads).
  function wireToggleButtons() {
    document.querySelectorAll('[data-theme-toggle], #nz-theme-toggle, #nz-theme-toggle-desk')
      .forEach(function (btn) {
        if (btn._nzWired) return;
        btn._nzWired = true;
        btn.addEventListener('click', window.nzToggleTheme);
      });
  }
  document.addEventListener('DOMContentLoaded', wireToggleButtons);
  document.addEventListener('nz:userReady', wireToggleButtons);
})();
