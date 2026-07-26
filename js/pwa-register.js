// ============================================================
// NihongoZen — pwa-register.js
// Registers the service worker (offline caching) and listens
// for new versions so returning users get an update notice
// instead of silently running stale, cached code.
//
// Loaded with `defer` on every page (index.html, login.html,
// onboarding-language.html, onboarding-level.html) — must be
// safe to run on all of them, including before the user is
// signed in.
// ============================================================
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  // Notify the user via whichever toast helper the current page
  // actually defines — falls back to a console message so this
  // never throws on a page without a toast UI.
  function notify(msg) {
    try {
      if (typeof window.nzShowToast === 'function') { window.nzShowToast(msg); return; }
      if (typeof window.showToast === 'function')   { window.showToast(msg, 'info'); return; }
    } catch (e) {}
    console.log('[NihongoZen PWA] ' + msg);
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('js/service-worker.js', { scope: './' })
      .then(function (reg) {
        // A new service worker version was found — track it through
        // its lifecycle so we can tell the user once it's ready.
        reg.addEventListener('updatefound', function () {
          var newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // There's an already-active worker, so this is an
              // update (not the first install) — safe to tell the user.
              notify('A new version of NihongoZen is ready — refresh to update. 🌸');
            }
          });
        });
      })
      .catch(function (err) {
        console.warn('[NihongoZen PWA] Service worker registration failed:', err);
      });
  });

  // ── Install prompt ──────────────────────────────────────────
  // Chrome/Edge fire this instead of showing their own install UI
  // automatically. We stash it so any page can offer an "Install
  // app" button later without needing its own listener wired up.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window._nzInstallPrompt = e;
    document.dispatchEvent(new CustomEvent('nz:installReady'));
  });

  window.addEventListener('appinstalled', function () {
    window._nzInstallPrompt = null;
    notify('NihongoZen installed! You can now launch it from your home screen. 🎉');
  });
})();
