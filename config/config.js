/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         NihongoZen — Central Configuration File          ║
 * ║                                                          ║
 * ║  ⚠️  IMPORTANT SECURITY NOTES:                           ║
 * ║  1. Add this file to .gitignore before pushing to GitHub ║
 * ║  2. Never share this file publicly                       ║
 * ║  3. Firebase keys are safe (restricted by domain)        ║
 * ║  4. Gemini API key: restrict it in Google Cloud Console  ║
 * ║     → APIs & Services → Credentials → API Key           ║
 * ║     → Set HTTP referrer restrictions to your domain      ║
 * ╚══════════════════════════════════════════════════════════╝
 */

window.NZ_CONFIG = {

  /* ── Firebase Configuration ─────────────────────────────
     Safe for frontend — restrict domain in Firebase Console:
     Firebase Console → Project Settings → Your Apps
     → Add Authorized Domains: nihongo-zen-cd97d.web.app
  ──────────────────────────────────────────────────────── */
  firebase: {
    apiKey:            "AIzaSyCP2Uwo1lx996q0l3nkC7RhAesVuIHEXiA",
    authDomain:        "nihongo-zen-cd97d.firebaseapp.com",
    projectId:         "nihongo-zen-cd97d",
    storageBucket:     "nihongo-zen-cd97d.appspot.com",
    messagingSenderId: "513320956483",
    appId:             "1:513320956483:web:84729a0c4c44b76af65af6"
  },

  /* ── Google Gemini API (AI Sensei) ───────────────────────
     Restrict this key in Google Cloud Console:
     → APIs & Services → Credentials → Your API Key
     → Application Restrictions → HTTP referrers
     → Add: https://nihongo-zen-cd97d.web.app/*
  ──────────────────────────────────────────────────────── */
  gemini: {
    apiKey: "AIzaSyB-v5yOx6EwLEEfXknGAw1hZNG4XblVGVc",
    model:  "gemini-1.5-flash",
    url:    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
  },

  /* ── App Settings ────────────────────────────────────── */
  app: {
    name:        "NihongoZen",
    version:     "2.0.0",
    domain:      "https://nihongo-zen-cd97d.web.app",
    environment: "production" // "development" | "production"
  }

};

/* ── Expose individual keys for backward compatibility ── */
window.FIREBASE_CONFIG  = window.NZ_CONFIG.firebase;
window.AISENSEI_KEY     = window.NZ_CONFIG.gemini.apiKey;
