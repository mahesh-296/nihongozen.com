// ============================================================
// NihongoZen — auth-guard.js
// Protects: index.html, jlpt-practice.html
// Unauthenticated users → redirected to login.html instantly
// No flicker: page hidden until auth check completes
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

// Hide page immediately — prevents flash of protected content
document.documentElement.style.visibility = "hidden";

// Fallback: show page after 4s if Firebase is slow / offline
const fallbackTimer = setTimeout(() => {
  document.documentElement.style.visibility = "visible";
}, 4000);

// ── Auth State Check ──────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  clearTimeout(fallbackTimer);

  if (!user) {
    // Not logged in → redirect immediately
    window.location.replace("login.html");
    return;
  }

  // Logged in — show the page
  document.documentElement.style.visibility = "visible";

  // Expose globally for index.html scripts
  window._nzAuth    = auth;
  window._nzDb      = db;
  window._nzUser    = user;
  window._nzSignOut = () => signOut(auth).then(() => window.location.replace("login.html"));

  // ── Load or create Firestore user document ──────────────────
  const userRef  = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // First login — create default profile
    await setDoc(userRef, {
      uid:              user.uid,
      displayName:      user.displayName || "Learner",
      email:            user.email       || "",
      photoURL:         user.photoURL    || "",
      phone:            user.phoneNumber || "",
      xp:               0,
      xpGoal:           50,
      streak:           1,
      kanjiCount:       0,
      lessonsCompleted: 0,
      vocabMastered:    0,
      quizAccuracy:     0,
      level:            1,
      levelXP:          0,
      levelXPRequired:  200,
      weeklyKanji:      0,
      weeklyLessons:    0,
      weeklyVocab:      0,
      weeklyAccuracyDelta: 0,
      lastLogin:        serverTimestamp(),
      createdAt:        serverTimestamp()
    });
  } else {
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
  }

  // ── Fetch data and populate dashboard ──────────────────────
  const freshSnap = await getDoc(userRef);
  const data      = freshSnap.data();
  window._nzUserData = data;

  // Fire event so index.html scripts can react
  document.dispatchEvent(new CustomEvent("nz:userReady", {
    detail: { user, data }
  }));
});

// ── XP update helper ─────────────────────────────────────────
window._nzAddXP = async (amount) => {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const snap    = await getDoc(userRef);
  if (!snap.exists()) return;
  const d        = snap.data();
  const newXP    = (d.xp    || 0) + amount;
  const newLvlXP = (d.levelXP || 0) + amount;
  const req      = d.levelXPRequired || 200;
  const lvlUp    = newLvlXP >= req;
  await updateDoc(userRef, {
    xp:      newXP,
    levelXP: lvlUp ? newLvlXP - req : newLvlXP,
    level:   lvlUp ? (d.level || 1) + 1 : (d.level || 1)
  });
  const fresh = await getDoc(userRef);
  document.dispatchEvent(new CustomEvent("nz:xpUpdated", { detail: fresh.data() }));
};

// ── Streak update helper ──────────────────────────────────────
window._nzUpdateStreak = async () => {
  const user = auth.currentUser;
  if (!user) return;
  const userRef  = doc(db, "users", user.uid);
  const snap     = await getDoc(userRef);
  if (!snap.exists()) return;
  const d         = snap.data();
  const lastLogin = d.lastLogin?.toDate?.() || new Date(0);
  const now       = new Date();
  const diffDays  = Math.floor((now - lastLogin) / 86400000);
  const newStreak = diffDays === 1 ? (d.streak || 0) + 1
                  : diffDays  > 1 ? 1
                  : d.streak  || 1;
  await updateDoc(userRef, { streak: newStreak, lastLogin: serverTimestamp() });
  return newStreak;
};
