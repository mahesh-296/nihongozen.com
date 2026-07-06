// ============================================================
// NihongoZen — auth.js  (js/auth.js)  — UPDATED
// Protects: index.html, jlpt-practice.html
// (login.html has its own self-contained auth flow — see login.html
//  inline <script type="module"> block — and does NOT load this file.)
//
// FIXES IN THIS VERSION:
//  FIX-A  Duplicate-app crash: initializeApp() uses getApps()/getApp()
//  FIX-B  Fallback timer raised to 20 s; only on protected pages
//  FIX-C  _nzBootstrapReady set BEFORE calling _nzBootstrap()
//  FIX-D  Firestore errors are non-fatal — don't bounce authenticated users
//  FIX-E  nz:userReady is dispatched after renderShell() in bootstrap
//  FIX-G  Auth persistence set to LOCAL so session survives page refresh
// ============================================================

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Firebase Config ───────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCP2Uwo1lx996q0l3nkC7RhAesVuIHEXiA",
  authDomain:        "nihongo-zen-cd97d.firebaseapp.com",
  projectId:         "nihongo-zen-cd97d",
  storageBucket:     "nihongo-zen-cd97d.firebasestorage.app",
  messagingSenderId: "513320956483",
  appId:             "1:513320956483:web:a1069825e0df3587f65af6",
  measurementId:     "G-1WTJ5ML3R2"
};

// FIX-A: Reuse existing app to prevent "app/duplicate-app" crash.
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// FIX-G: Set persistence to LOCAL so auth state survives refreshes.
// This prevents the jarring re-auth-check on every page load.
setPersistence(auth, browserLocalPersistence).catch(function(err) {
  console.warn("[NihongoZen] Could not set auth persistence:", err);
});

// ── Boot-once guard ───────────────────────────────────────────
let _bootstrapped = false;

// FIX-B: Only start the fallback timer on protected pages.
const IS_LOGIN_PAGE = window.location.pathname.endsWith("login.html");

const fallbackTimer = IS_LOGIN_PAGE ? null : setTimeout(() => {
  if (!_bootstrapped) {
    console.warn("[NihongoZen] Auth timed out — redirecting to login.");
    window.location.replace("login.html");
  }
}, 20000);

// ── Auth State Check ──────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (fallbackTimer) clearTimeout(fallbackTimer);

  // Only run bootstrap once per page load
  if (_bootstrapped) return;

  if (!user) {
    // Not logged in → go to login immediately
    if (!IS_LOGIN_PAGE) {
      window.location.replace("login.html");
    }
    return;
  }

  // ── Expose auth globals ───────────────────────────────────
  window._nzAuth = auth;
  window._nzDb   = db;
  window._nzUser = user;

  window._nzSignOut = async () => {
    try {
      await signOut(auth);
      window.location.replace("login.html");
    } catch (err) {
      console.error("[NihongoZen] Sign-out failed:", err);
      alert("Sign-out failed. Please try again.");
    }
  };

  // ── Load or create Firestore user document ────────────────
  // FIX-D: Firestore errors are caught separately — a DB hiccup must
  // never bounce an authenticated user back to the login page.
  try {
    const userRef  = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First login — create default profile
      await setDoc(userRef, {
        uid:                 user.uid,
        displayName:         user.displayName || "Learner",
        email:               user.email       || "",
        photoURL:            user.photoURL    || "",
        phone:               user.phoneNumber || "",
        xp:                  0,
        xpGoal:              500,
        streak:              1,
        kanjiCount:          0,
        lessonsCompleted:    0,
        vocabMastered:       0,
        quizAccuracy:        0,
        level:               1,
        levelXP:             0,
        levelXPRequired:     200,
        weeklyKanji:         0,
        weeklyLessons:       0,
        weeklyVocab:         0,
        weeklyAccuracyDelta: 0,
        lastLogin:           serverTimestamp(),
        createdAt:           serverTimestamp()
      });
    } else {
      // Returning user — update streak using calendar-day boundaries
      const existingData = userSnap.data();
      const lastLoginTs  = existingData.lastLogin?.toDate?.() || new Date(0);
      const now          = new Date();
      const diffDays     = Math.floor(
        (now.setHours(0,0,0,0) - new Date(lastLoginTs).setHours(0,0,0,0))
        / 86400000
      );
      const newStreak = diffDays === 1 ? (existingData.streak || 1) + 1
                      : diffDays  > 1 ? 1
                      : existingData.streak || 1;

      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        streak:    newStreak
      });
    }

    // Fetch fresh document after any writes
    const freshSnap = await getDoc(userRef);
    window._nzUserData = freshSnap.data();

  } catch (firestoreErr) {
    // FIX-D: Non-fatal — keep the user in the app with minimal data
    console.error("[NihongoZen] Firestore error (non-fatal):", firestoreErr);
    window._nzUserData = {
      uid:         user.uid,
      displayName: user.displayName || "Learner",
      email:       user.email       || "",
      photoURL:    user.photoURL    || "",
      xp: 0, xpGoal: 500, streak: 1, level: 1,
      levelXP: 0, levelXPRequired: 200
    };
  }

  // ── Mark bootstrapped before calling into the app ─────────
  _bootstrapped = true;

  // FIX-C: Signal ready BEFORE calling _nzBootstrap
  window._nzBootstrapReady = true;

  // ── Call the bootstrap function defined in index.html ─────
  if (typeof window._nzBootstrap === "function") {
    window._nzBootstrap();
  } else {
    // Wait for deferred scripts to define _nzBootstrap
    const waitForBootstrap = setInterval(() => {
      if (typeof window._nzBootstrap === "function") {
        clearInterval(waitForBootstrap);
        window._nzBootstrap();
      }
    }, 50);
  }
});

// ── XP update helper ─────────────────────────────────────────
window._nzAddXP = async (amount) => {
  if (!amount || amount <= 0) return;
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) return;

    const d        = snap.data();
    const newXP    = (d.xp      || 0) + amount;
    const newLvlXP = (d.levelXP || 0) + amount;
    const req      = d.levelXPRequired || 200;
    const lvlUp    = newLvlXP >= req;

    await updateDoc(userRef, {
      xp:      newXP,
      levelXP: lvlUp ? newLvlXP - req : newLvlXP,
      level:   lvlUp ? (d.level || 1) + 1 : (d.level || 1)
    });

    const fresh = await getDoc(userRef);
    window._nzUserData = fresh.data();

    document.dispatchEvent(
      new CustomEvent("nz:xpUpdated", { detail: fresh.data() })
    );
  } catch (err) {
    console.error("[NihongoZen] _nzAddXP failed:", err);
  }
};

// ── Streak update helper ──────────────────────────────────────
window._nzUpdateStreak = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) return;

    const d         = snap.data();
    const lastLogin = d.lastLogin?.toDate?.() || new Date(0);
    const now       = new Date();

    const lastMidnight = new Date(lastLogin).setHours(0, 0, 0, 0);
    const nowMidnight  = new Date(now).setHours(0, 0, 0, 0);
    const diffDays     = Math.floor((nowMidnight - lastMidnight) / 86400000);

    const newStreak = diffDays === 1 ? (d.streak || 1) + 1
                    : diffDays  > 1 ? 1
                    : d.streak  || 1;

    await updateDoc(userRef, {
      streak:    newStreak,
      lastLogin: serverTimestamp()
    });

    window._nzUserData = { ...d, streak: newStreak };
    return newStreak;
  } catch (err) {
    console.error("[NihongoZen] _nzUpdateStreak failed:", err);
  }
};
