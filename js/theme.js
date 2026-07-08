/*==============================================
  NihongoZen — Shared Theme Engine
  Single source of truth for Dark / Light Pink /
  Light Orange switching. Include this file on
  EVERY page (after tokens.css) so theme state is
  consistent app-wide. Do not duplicate this logic
  anywhere else.

  Requires the tiny inline "pre-paint" snippet in
  <head> (see theme-boot-snippet.html) to avoid a
  flash of the wrong theme before this file loads.
================================================*/
(function () {
  var THEME_ORDER = ['dark', 'light', 'light-orange'];
  var THEME_META = {
    'dark':         { icon: '🌙', label: 'Dark theme',         next: 'Switch to Light theme' },
    'light':        { icon: '🌸', label: 'Light theme',        next: 'Switch to Light Orange theme' },
    'light-orange': { icon: '🧡', label: 'Light Orange theme', next: 'Switch to Dark theme' }
  };
  var THEME_COLOR = { 'dark': '#0F0F14', 'light': '#FFE8EE', 'light-orange': '#FCE9D2' };

  function applyTheme(theme) {
    if (THEME_ORDER.indexOf(theme) === -1) theme = 'dark';

    document.documentElement.classList.toggle('nz-light', theme === 'light');
    document.documentElement.classList.toggle('nz-light-orange', theme === 'light-orange');

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

    // Let page-specific features (e.g. index.html's cherry-blossom canvas) react without
    // theme.js needing to know they exist.
    document.dispatchEvent(new CustomEvent('nz:themechange', { detail: { theme: theme } }));
  }

  window.nzToggleTheme = function () {
    var current = THEME_ORDER.indexOf(window._nzTheme || 'dark');
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

  var saved;
  try { saved = localStorage.getItem('nz-theme'); } catch (e) { saved = null; }
  applyTheme(THEME_ORDER.indexOf(saved) !== -1 ? saved : 'dark');

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
