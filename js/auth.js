// ============================================================
// NihongoZen — auth.js
// Protects: index.html, jlpt-practice.html
// Unauthenticated users → redirected to login.html instantly
// Calls window._nzBootstrap() once user + Firestore data ready
// ============================================================

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
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

// FIX #1: Guard against duplicate Firebase app initialisation.
// login.html's module script also calls initializeApp() with the same
// config. When auth.js runs on index.html that app is already registered,
// so we reuse it instead of creating a second instance (which throws
// "app/duplicate-app" and falls into the catch → redirect to login).
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Boot-once guard ───────────────────────────────────────────
let _bootstrapped = false;

// ── Fallback timer ────────────────────────────────────────────
// FIX #2: Increased fallback from 6 s to 15 s.
// Google's OAuth popup can legitimately take several seconds after the
// user completes verification before Firebase resolves the credential
// and fires onAuthStateChanged. The previous 6 s timeout was too short —
// it fired while the auth state was still resolving and redirected the
// freshly-authenticated user back to login.html.
const fallbackTimer = setTimeout(() => {
  window.location.replace("login.html");
}, 15000);

// ── Auth State Check ──────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  clearTimeout(fallbackTimer);

  if (_bootstrapped) return;

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  try {
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

    // ── Load or create Firestore user document ──────────────────
    const userRef  = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
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

    // ── Fetch fresh data after write ────────────────────────────
    const freshSnap = await getDoc(userRef);
    const data      = freshSnap.data();
    window._nzUserData = data;

    // FIX #3: Set _bootstrapped AFTER all data is ready, then call
    // _nzBootstrap. The flag is set here so any subsequent
    // onAuthStateChanged fires (token refresh) skip the sequence, but
    // the bootstrap call itself happens unconditionally at this point.
    _bootstrapped = true;

    // FIX #4: Also set window._nzBootstrapReady = true so that the
    // legacy waitForBootstrap() helper in auth-guard.js (if included
    // on any page) can proceed. Without this flag it polls forever
    // and _nzBootstrap() is never called, leaving the loading screen
    // visible permanently even though the user is authenticated.
    window._nzBootstrapReady = true;

    if (typeof window._nzBootstrap === "function") {
      window._nzBootstrap();
    } else {
      // Deferred scripts still loading — poll until available
      const waitForBootstrap = setInterval(() => {
        if (typeof window._nzBootstrap === "function") {
          clearInterval(waitForBootstrap);
          window._nzBootstrap();
        }
      }, 50);
    }

  } catch (err) {
    console.error("[NihongoZen] Auth / Firestore error:", err);
    window.location.replace("login.html");
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
