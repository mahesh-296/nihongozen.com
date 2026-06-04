// ============================================================
// NihongoZen — auth.js
//
// NOTE: Authentication is handled INLINE in index.html
// (the <script type="module"> block at the top of index.html)
//
// This file is kept for reference but is NOT loaded by any HTML page.
// Do NOT add a <script src="js/auth.js"> to index.html — that would
// create a double Firebase initialization and break the auth flow.
//
// The inline script in index.html handles:
//   1. Firebase initialization with setPersistence
//   2. onAuthStateChanged with race condition fix
//   3. Firestore user document creation/update
//   4. window._nzBootstrap() call to start the app
//   5. window._nzAddXP() helper
// ============================================================
