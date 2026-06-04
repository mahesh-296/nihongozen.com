// ===== LOGIN.JS — NihongoZen =====
// Real Firebase Authentication: Google OAuth + Email Magic Link

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// ── Magic Link: finish sign-in if this is a return visit ──────
// (User clicks the emailed link and lands back on login.html)
if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = window.localStorage.getItem("nzEmailForSignIn");
  if (!email) {
    // Ask again if opened on a different device
    email = window.prompt("Please enter your email to complete sign-in:");
  }
  if (email) {
    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.localStorage.removeItem("nzEmailForSignIn");
        window.location.replace("index.html");
      })
      .catch(err => {
        showToast("Sign-in link expired or invalid. Try again.", "error");
        console.error(err);
      });
  }
}

// ── Tab switching ─────────────────────────────────────────────
let currentTab = "signin";

window.switchTab = function(tab, btn) {
  currentTab = tab;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const titleEl = document.getElementById("auth-title");
  const subEl   = document.getElementById("auth-sub");
  if (tab === "signin") {
    titleEl.textContent = "Welcome back";
    subEl.textContent   = "Sign in to continue your Japanese studies";
  } else {
    titleEl.textContent = "Start your journey";
    subEl.textContent   = "Create your free account to begin learning";
  }
  resetForm();
};

// ── Helpers ───────────────────────────────────────────────────
function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function resetForm() {
  document.getElementById("form-area").style.display    = "block";
  document.getElementById("success-area").style.display = "none";
  document.getElementById("email-input").value          = "";
  document.getElementById("email-error").textContent    = "";
}

function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = "toast"; }, 3500);
}

// ── Magic Link send ───────────────────────────────────────────
window.handleMagicLink = async function() {
  const input  = document.getElementById("email-input");
  const errEl  = document.getElementById("email-error");
  const btnLbl = document.getElementById("btn-label");
  const btn    = document.querySelector(".btn-primary");

  const email = input.value.trim();
  if (!email)               { errEl.textContent = "Email is required"; return; }
  if (!validateEmail(email)){ errEl.textContent = "Enter a valid email address"; return; }
  errEl.textContent = "";

  btn.disabled     = true;
  btnLbl.innerHTML = '<span class="spinner"></span> Sending magic link...';

  const actionCodeSettings = {
    // Must be whitelisted in Firebase Console → Authentication → Settings → Authorized domains
    url:             window.location.origin + "/login.html",
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email so we can finish sign-in when user returns
    window.localStorage.setItem("nzEmailForSignIn", email);

    document.getElementById("form-area").style.display    = "none";
    document.getElementById("success-area").style.display = "flex";
    showToast(`Magic link sent to ${email}`, "success");
  } catch (err) {
    console.error(err);
    errEl.textContent = "Failed to send link. Check your email and try again.";
    showToast("Error sending magic link.", "error");
  } finally {
    btn.disabled      = false;
    btnLbl.textContent = "Send Magic Link";
  }
};

// ── Google Sign-In ────────────────────────────────────────────
window.handleGoogle = async function() {
  showToast("Opening Google sign-in…", "info");
  try {
    await signInWithPopup(auth, provider);
    // onAuthStateChanged in auth-guard is NOT loaded on login.html,
    // so we redirect manually here after successful sign-in.
    window.location.replace("index.html");
  } catch (err) {
    if (err.code === "auth/popup-closed-by-user") {
      showToast("Sign-in cancelled.", "info");
    } else {
      console.error(err);
      showToast("Google sign-in failed. Try again.", "error");
    }
  }
};

// ── Enter key shortcut ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("email-input");
  if (input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") window.handleMagicLink();
    });
  }
});
