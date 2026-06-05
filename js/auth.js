// ============================================================
// NihongoZen — auth.js
// Protects: index.html, jlpt-practice.html
// Unauthenticated users → redirected to login.html instantly
// Calls window._nzBootstrap() once user + Firestore data ready
// ============================================================

import { initializeApp }
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

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Boot-once guard ───────────────────────────────────────────
// BUG FIX #10: onAuthStateChanged can fire multiple times (token
// refresh, etc.). This flag ensures we only bootstrap the app once.
let _bootstrapped = false;

// ── Fallback timer ────────────────────────────────────────────
// BUG FIX #3 + #4: The original code hid document.documentElement
// visibility here, which conflicted with index.html's own #auth-loading
// overlay and caused a blank page on slow connections.
// We no longer touch document visibility — index.html's loading screen
// handles that entirely. The fallback only calls _nzBootstrap so the
// app doesn't hang forever if Firebase is slow or offline.
const fallbackTimer = setTimeout(() => {
  // If auth hasn't resolved in 6 seconds, redirect to login for safety
  window.location.replace("login.html");
}, 6000);

// ── Auth State Check ──────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  clearTimeout(fallbackTimer);

  // BUG FIX #10: Only run the full bootstrap sequence once
  if (_bootstrapped) return;

  if (!user) {
    // Not logged in → redirect immediately
    window.location.replace("login.html");
    return;
  }

  // BUG FIX #6: Wrap entire Firestore sequence in try/catch so a
  // network error or permission-denied doesn't leave the page hidden
  try {
    // Expose auth globals for all page scripts
    window._nzAuth = auth;
    window._nzDb   = db;
    window._nzUser = user;

    // BUG FIX #11: _nzSignOut now catches errors and shows feedback
    // instead of silently failing and leaving the user on a protected page
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
      // BUG FIX #5: xpGoal was incorrectly set to 50; correct default is 500
      await setDoc(userRef, {
        uid:                 user.uid,
        displayName:         user.displayName || "Learner",
        email:               user.email       || "",
        photoURL:            user.photoURL    || "",
        phone:               user.phoneNumber || "",
        xp:                  0,
        xpGoal:              500,   // FIX: was 50
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
      // BUG FIX #9: Auto-update streak on every login, not just account
      // creation. The original code only set streak=1 at creation and
      // never updated it automatically when the user returned.
      const existingData = userSnap.data();
      const lastLoginTs  = existingData.lastLogin?.toDate?.() || new Date(0);
      const now          = new Date();
      const diffDays     = Math.floor(
        (now.setHours(0,0,0,0) - new Date(lastLoginTs).setHours(0,0,0,0))
        / 86400000
      );
      // diffDays === 0 → same day, no streak change
      // diffDays === 1 → consecutive day, increment
      // diffDays  > 1 → streak broken, reset to 1
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

    // ── Mark bootstrapped before calling bootstrap fn ───────────
    _bootstrapped = true;

    // BUG FIX #2: The original auth.js dispatched nz:userReady but
    // never called window._nzBootstrap(), which index.html requires
    // to hide the loading screen and render the shell. Without this
    // call the app shows a permanent loading spinner.
    if (typeof window._nzBootstrap === "function") {
      window._nzBootstrap();
    } else {
      // _nzBootstrap not yet defined (deferred scripts still loading)
      // — poll until it's available, then call it
      const waitForBootstrap = setInterval(() => {
        if (typeof window._nzBootstrap === "function") {
          clearInterval(waitForBootstrap);
          window._nzBootstrap();
        }
      }, 50);
    }

  } catch (err) {
    // BUG FIX #6: Show the page on error so the user isn't stuck on a
    // blank screen. Log the error and redirect to login as a safe fallback.
    console.error("[NihongoZen] Auth / Firestore error:", err);
    window.location.replace("login.html");
  }
});

// ── XP update helper ─────────────────────────────────────────
// BUG FIX #7: Wrapped in try/catch; errors are now logged instead
// of failing silently and losing the XP award.
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

    // Sync cached user data so UI reads are always fresh
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
// BUG FIX #8: Wrapped in try/catch; errors are now logged.
// BUG FIX #9: Streak diff now uses date-boundary comparison (midnight)
// so crossing midnight correctly counts as a new day regardless of time.
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

    // Compare calendar days (midnight boundaries) not raw milliseconds
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

    // Sync cached data
    window._nzUserData = { ...d, streak: newStreak };

    return newStreak;
  } catch (err) {
    console.error("[NihongoZen] _nzUpdateStreak failed:", err);
  }
};
