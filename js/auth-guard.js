/**
 * auth-guard.js — NihongoZen Protected Page Guard
 *
 * PURPOSE: Kisi bhi page pe (index.html ke BAAD ke pages agar ho to)
 * use karo. Agar user logged in nahi hai to login.html pe redirect karo.
 *
 * ⚠️  INDEX.HTML ke liye: Yeh file IMPORT NAHI KARNA.
 *     index.html ka apna inline auth guard hai jo sahi kaam karta hai.
 *     Yeh file SIRF future static pages ke liye hai jahan inline guard nahi.
 *
 * HOW TO USE (kisi bhi protected HTML page me):
 *   <script type="module" src="js/auth-guard.js"></script>
 */

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCP2Uwo1lx996q0l3nkC7RhAesVuIHEXiA",
  authDomain:        "nihongo-zen-cd97d.firebaseapp.com",
  projectId:         "nihongo-zen-cd97d",
  storageBucket:     "nihongo-zen-cd97d.firebasestorage.app",
  messagingSenderId: "513320956483",
  appId:             "1:513320956483:web:a1069825e0df3587f65af6",
  measurementId:     "G-1WTJ5ML3R2"
};

// ── GUARD: Duplicate Firebase app se bachao ──────────────────────────────────
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Login & Dashboard URLs ────────────────────────────────────────────────────
const LOGIN     = "login.html";
const DASHBOARD = "index.html";   // SPA — main app

// ── Persistence ───────────────────────────────────────────────────────────────
try { await setPersistence(auth, browserLocalPersistence); } catch(e) {}

// ── Detect current page ───────────────────────────────────────────────────────
const currentPath = window.location.pathname.toLowerCase();
const isLoginPage =
  currentPath.endsWith("login.html") ||
  currentPath.endsWith("login") ||
  currentPath === "/" && document.title.toLowerCase().includes("sign");

// ── Auth State Check ─────────────────────────────────────────────────────────
let _resolved = false;
const _fallback = setTimeout(() => {
  if (!_resolved) {
    console.warn("auth-guard: timeout — redirecting to login");
    if (!isLoginPage) window.location.replace(LOGIN);
  }
}, 8000);

onAuthStateChanged(auth, async (user) => {
  // Race condition fix: pehli null call pe thoda wait karo
  if (!user && !_resolved) {
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 300));
      if (auth.currentUser) { user = auth.currentUser; break; }
    }
  }
  _resolved = true;
  clearTimeout(_fallback);

  if (user) {
    // ✅ Logged in: agar login page pe hai to dashboard pe bhejo
    if (isLoginPage) {
      window.location.replace(DASHBOARD);
    }
    // Warna kuch nahi — page normally load hone do
  } else {
    // ❌ Not logged in: agar protected page pe hai to login pe bhejo
    if (!isLoginPage) {
      window.location.replace(LOGIN);
    }
  }
});
