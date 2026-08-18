// ============================================================
// NihongoZen — firebase-config.js  (shared Firebase config module)
// Google Sign-In ONLY. No email-link / password / other providers.
//
// FIXED (previous version was broken and inconsistent with the rest
// of the app):
//   - Was importing from bare "firebase/app" / "firebase/auth" specifiers,
//     which only work with a bundler (webpack/vite) + npm install.
//     This app loads Firebase straight from the gstatic CDN everywhere
//     else (see auth.js, login.html) — that mismatch meant this file
//     could never actually run in the browser as a plain <script>.
//   - Was calling sendSignInLinkToEmail() automatically on load, to a
//     hardcoded placeholder email ("user@example.com"). That is a
//     passwordless EMAIL-LINK auth flow — not Google Sign-In — and it
//     fired immediately just by importing the file. Removed entirely.
//   - Now uses getApps()/getApp() so it never crashes with a
//     "Firebase app already exists" error if index.html/login.html
//     have already initialized the app via auth.js.
//   - Reads config from window.NZ_CONFIG (config/config.js) first,
//     same pattern as auth.js and login.html, so all pages stay in
//     sync if the Firebase project keys ever change.
// ============================================================

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Firebase Config ───────────────────────────────────────────
// 🔒 Loaded from config/config.js when available; hardcoded fallback
// kept only for pages that forget to include config/config.js first.
const firebaseConfig = window.NZ_CONFIG ? window.NZ_CONFIG.firebase : {
  apiKey:            "AIzaSyCP2Uwo1lx996q0l3nkC7RhAesVuIHEXiA",
  authDomain:        "nihongo-zen-cd97d.firebaseapp.com",
  projectId:         "nihongo-zen-cd97d",
  storageBucket:     "nihongo-zen-cd97d.firebasestorage.app",
  messagingSenderId: "513320956483",
  appId:             "1:513320956483:web:a1069825e0df3587f65af6",
  measurementId:     "G-1WTJ5ML3R2"
};

// Reuse existing app instance if one was already created on this page
// (e.g. by auth.js) — prevents "app/duplicate-app" crashes.
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Sign-In ONLY.
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, googleProvider };
