// ============================================================
// NihongoZen — auth.js  (js/auth.js)
// Protects: index.html, jlpt-practice.html
// Unauthenticated users → redirected to login.html instantly
// Calls window._nzBootstrap() once user + Firestore data ready
//
// ── FIXES APPLIED ────────────────────────────────────────────
//  FIX-A  Duplicate-app crash
//         initializeApp() now uses getApps()/getApp() guard so that
//         re-entering this module (e.g. browser keeps the JS module
//         cache between page loads in some environments) no longer
//         throws "app/duplicate-app", which fell into the catch block
//         and redirected the authenticated user straight back to login.
//
//  FIX-B  Fallback timer too short (6 s → 15 s)
//         Google's OAuth popup + credential propagation + two Firestore
//         round-trips can easily exceed 6 seconds on a slow connection.
//         The old timer fired mid-flow and sent the user back to login
//         even though sign-in had already succeeded.
//
//  FIX-C  _nzBootstrapReady flag never set
//         auth-guard.js (legacy guard used on some pages) polls for
//         window._nzBootstrapReady before calling _nzBootstrap().
//         Without it the poll never resolves and the loading screen
//         stays up permanently even for authenticated users.
// ============================================================

import { initializeApp, getApps, getApp }   // FIX-A: added getApps, getApp
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

// FIX-A: Reuse an already-initialised app instead of crashing.
// login.html's own <script type="module"> also calls initializeApp()
// with the same config. If the browser module cache shares the Firebase
// SDK across navigations the default app already exists, so getApp()
// returns it safely rather than throwing "app/duplicate-app" and
// falling into the catch → redirect-to-login loop.
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Boot-once guard ───────────────────────────────────────────
// onAuthStateChanged can fire more than once (token refresh, network
// reconnect). This flag ensures the full bootstrap sequence only runs
// the first time.
let _bootstrapped = false;

// ── Fallback timer ────────────────────────────────────────────
// FIX-B: Raised from 6 000 ms to 15 000 ms.
// The original 6 s limit was too aggressive: signInWithPopup resolves
// on the login page, but the credential must propagate to Firebase's
// persistence layer before onAuthStateChanged fires here on index.html.
// Add two Firestore round-trips (getDoc + setDoc/updateDoc + getDoc)
// on a slow connection and 6 s is easily breached, so the fallback
// kicked in and sent a freshly-authenticated user back to login.html.
const fallbackTimer = setTimeout(() => {
  window.location.replace("login.html");
}, 15000);                                   // FIX-B: was 6000

// ── Auth State Check ──────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  clearTimeout(fallbackTimer);

  // Only run bootstrap once per page load
  if (_bootstrapped) return;

  if (!user) {
    // Not logged in → go to login immediately
    window.location.replace("login.html");
    return;
  }

  try {
    // Expose auth globals so every page script can reach them
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
      // 0 → same day (no change), 1 → consecutive (increment), >1 → reset
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

    // Lock the bootstrap sequence before calling into the app
    _bootstrapped = true;

    // FIX-C: Signal that auth + Firestore data are ready.
    // auth-guard.js (legacy) polls window._nzBootstrapReady before it
    // calls _nzBootstrap(). Without this flag its poll never resolves,
    // _nzBootstrap() is never invoked, and the loading overlay never
    // lifts — even though the user is fully authenticated.
    window._nzBootstrapReady = true;          // FIX-C: was missing entirely

    // Call the bootstrap function defined in index.html, or poll for
    // it if the deferred <script> blocks haven't executed yet.
    if (typeof window._nzBootstrap === "function") {
      window._nzBootstrap();
    } else {
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
