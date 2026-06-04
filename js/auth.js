/**
 * auth.js — NihongoZen Login Page Auth Handler
 *
 * PURPOSE: Login page (login.html) ke liye auth logic.
 * - Google Sign-In
 * - Email Magic Link
 * - Phone OTP
 * - Email Link completion (jab user email link pe click kare)
 *
 * IMPORTANT:
 * - Firebase app sirf ek baar initialize hoti hai (duplicate guard ke saath).
 * - Login success ke baad redirect: index.html (SPA) pe — dashboard.html NAHI.
 * - auth-guard.js ab alag se use NAHI karna — index.html ka inline guard use karo.
 */

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPhoneNumber,
  RecaptchaVerifier,
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

// ── Persistence: localStorage force karo (GitHub Pages / reload fix) ────────
try { await setPersistence(auth, browserLocalPersistence); } catch(e) {}

// ── Dashboard URL (SPA — index.html hi app hai) ──────────────────────────────
const DASHBOARD = "index.html";

// ── Action Code Settings (email magic link) ──────────────────────────────────
// URL wahi hona chahiye jahan user redirect ho — login.html
const actionCodeSettings = {
  url: `${window.location.origin}/${window.location.pathname.split('/').slice(0,-1).join('/') ? window.location.pathname.split('/').slice(0,-1).join('/') + '/' : ''}login.html`,
  handleCodeInApp: true
};

// ── Phone OTP state ───────────────────────────────────────────────────────────
let recaptchaVerifier   = null;
let phoneConfirmResult  = null;

// ╔══════════════════════════════════════════════════════════════╗
// ║  EMAIL LINK COMPLETION                                       ║
// ║  Jab user email link pe click karke wapas aata hai          ║
// ╚══════════════════════════════════════════════════════════════╝
if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = localStorage.getItem("nz_emailForSignIn");
  if (!email) {
    // User ne kisi aur device pe link khola — email poochho
    email = window.prompt("Please confirm your email to complete sign-in:");
  }
  if (email) {
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem("nz_emailForSignIn");
      // Clean URL from email link params, phir redirect
      window.location.replace(DASHBOARD);
    } catch (err) {
      console.error("Email link sign-in failed:", err);
      if (typeof window.showLoginError === "function") {
        window.showLoginError(err.message);
      }
    }
  }
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  GOOGLE SIGN-IN                                              ║
// ╚══════════════════════════════════════════════════════════════╝
const _googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  try {
    await signInWithPopup(auth, provider);
    window.location.replace(DASHBOARD);
  } catch (err) {
    if (err.code === "auth/popup-blocked") {
      if (typeof window.showLoginError === "function")
        window.showLoginError("Popup blocked. Please allow popups for this site.");
    } else if (err.code !== "auth/popup-closed-by-user") {
      if (typeof window.showLoginError === "function")
        window.showLoginError(err.message);
      else console.error("Google login error:", err);
    }
  }
};

// Button IDs support karo (login.html ke liye)
document.getElementById("googleLogin")?.addEventListener("click", _googleLogin);
document.getElementById("btn-google-login")?.addEventListener("click", _googleLogin);
// Legacy button ID (agar purana button hai)
document.getElementById("loginBtn")?.addEventListener("click", _googleLogin);

// ╔══════════════════════════════════════════════════════════════╗
// ║  FACEBOOK SIGN-IN                                            ║
// ╚══════════════════════════════════════════════════════════════╝
const _fbLogin = async () => {
  const fbProvider = new FacebookAuthProvider();
  try {
    await signInWithPopup(auth, fbProvider);
    window.location.replace(DASHBOARD);
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      if (typeof window.showLoginError === "function")
        window.showLoginError(err.message);
    }
  }
};
document.getElementById("btn-facebook-login")?.addEventListener("click", _fbLogin);

// ╔══════════════════════════════════════════════════════════════╗
// ║  EMAIL MAGIC LINK                                            ║
// ╚══════════════════════════════════════════════════════════════╝
window.handleEmailLogin = async () => {
  const email = document.getElementById("emailInput")?.value?.trim();
  const errEl = document.getElementById("email-error");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) errEl.classList.add("visible");
    return;
  }
  if (errEl) errEl.classList.remove("visible");

  const btn = document.getElementById("emailLogin");
  if (btn) { btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Sending link…`; }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("nz_emailForSignIn", email);

    const emailFormSec = document.getElementById("email-form-section");
    const successBox   = document.getElementById("email-success-box");
    const otpToggleBtn = document.getElementById("otp-toggle-btn");

    if (emailFormSec)  emailFormSec.style.display = "none";
    if (successBox)    successBox.classList.add("visible");
    if (otpToggleBtn)  otpToggleBtn.style.display = "none";

    if (typeof window.showToast === "function")
      window.showToast("Magic link sent! Check your inbox.", "success");

  } catch (err) {
    if (typeof window.showLoginError === "function")
      window.showLoginError(err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Magic Link`;
    }
  }
};

// ── Legacy button listener (agar inline onclick nahi use ho raha) ──
document.getElementById("emailLogin")?.addEventListener("click", (e) => {
  // Prevent double-fire if inline onclick bhi hai
  if (!e._nzHandled) { e._nzHandled = true; window.handleEmailLogin(); }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║  PHONE OTP                                                   ║
// ╚══════════════════════════════════════════════════════════════╝
window.sendOTP = async () => {
  const phone = document.getElementById("phoneInput")?.value?.trim();
  if (!phone?.startsWith("+")) {
    if (typeof window.showLoginError === "function")
      window.showLoginError('Include country code, e.g. "+91 98765 43210"');
    return;
  }

  const btn = document.getElementById("sendOtpBtn");
  if (btn) { btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Sending OTP…`; }

  // Purrana reCAPTCHA clear karo
  if (recaptchaVerifier) { try { recaptchaVerifier.clear(); } catch(e) {} recaptchaVerifier = null; }
  const container = document.getElementById("recaptcha-container");
  if (container) container.innerHTML = "";

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    phoneConfirmResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);

    document.getElementById("otp-verify-section")?.classList.add("visible");
    if (typeof window.showToast === "function")
      window.showToast("OTP sent! Check your phone.", "success");

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Resend OTP`;
    }
  } catch (err) {
    if (typeof window.showLoginError === "function") window.showLoginError(err.message);
    if (recaptchaVerifier) { try { recaptchaVerifier.clear(); } catch(e) {} recaptchaVerifier = null; }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send OTP`;
    }
  }
};

window.verifyOTP = async () => {
  if (!phoneConfirmResult) {
    if (typeof window.showLoginError === "function")
      window.showLoginError("Please request an OTP first.");
    return;
  }
  const code = document.getElementById("otpInput")?.value?.trim();
  if (!code) {
    if (typeof window.showLoginError === "function")
      window.showLoginError("Please enter the 6-digit OTP.");
    return;
  }
  try {
    await phoneConfirmResult.confirm(code);
    if (typeof window.showToast === "function")
      window.showToast("Verified! Redirecting…", "success");
    await new Promise(r => setTimeout(r, 800));
    window.location.replace(DASHBOARD);
  } catch (err) {
    if (typeof window.showLoginError === "function")
      window.showLoginError(
        err.code === "auth/invalid-verification-code"
          ? "Incorrect OTP. Please try again."
          : err.message
      );
  }
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  APPLE SIGN-IN — Coming Soon                                 ║
// ╚══════════════════════════════════════════════════════════════╝
document.getElementById("btn-apple-login")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (typeof window.showToast === "function")
    window.showToast("Apple Sign-In — Coming Soon!", "info");
});

// ╔══════════════════════════════════════════════════════════════╗
// ║  NAVIGATION HELPERS                                          ║
// ╚══════════════════════════════════════════════════════════════╝
window.goSignup = () => {
  if (typeof window.switchTab === "function") {
    window.switchTab("signup");
  } else {
    window.location.href = "signup.html";
  }
};
