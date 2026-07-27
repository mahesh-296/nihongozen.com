/*==============================================
  NihongoZen — Shared Theme Engine
  Single source of truth for Cherry Blossom (Pink,
  default) / Dark / Light Blue (Premium) switching.
  Include this file on EVERY page (after tokens.css)
  so theme state is consistent app-wide. Do not
  duplicate this logic anywhere else.

  Requires the tiny inline "pre-paint" snippet in
  <head> (see theme-boot-snippet.html) to avoid a
  flash of the wrong theme before this file loads.
================================================*/
(function () {
  var THEME_ORDER = ['light', 'dark', 'light-blue'];
  var THEME_META = {
    'light':      { icon: '🌸', label: 'Cherry Blossom theme', next: 'Switch to Dark theme' },
    'dark':       { icon: '🌙', label: 'Dark theme',            next: 'Switch to Light Blue theme' },
    'light-blue': { icon: '🩵', label: 'Light Blue theme',      next: 'Switch to Cherry Blossom theme' }
  };
  var THEME_COLOR = { 'dark': '#0F0F14', 'light': '#FFE8EE', 'light-blue': '#E8F2FC' };
  var DEFAULT_THEME = 'light'; // Pink Cherry Blossom is the app-wide default

  function applyTheme(theme) {
    if (THEME_ORDER.indexOf(theme) === -1) theme = DEFAULT_THEME;

    document.documentElement.classList.toggle('nz-light', theme === 'light');
    document.documentElement.classList.toggle('nz-light-blue', theme === 'light-blue');

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

  var saved;
  try { saved = localStorage.getItem('nz-theme'); } catch (e) { saved = null; }
  applyTheme(THEME_ORDER.indexOf(saved) !== -1 ? saved : DEFAULT_THEME);

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
