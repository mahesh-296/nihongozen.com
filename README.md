# NihongoZen Static HTML/CSS/JS Build

This folder is a GitHub Pages-ready conversion of the original Next.js/TypeScript NihongoZen app.

## Run Locally

Use any static server from this folder, then open `login.html` in Chrome.

```powershell
python -m http.server 4173
```

The app uses `fetch()` for `data/*.json`, so opening HTML files directly from disk is not recommended.

## Firebase Setup

1. Create a fresh Firebase project.
2. Enable the sign-in providers you want, such as Google, email link, or phone OTP.
3. Add your domain and GitHub Pages domain to Firebase Authorized Domains.
4. Replace the placeholder public web config in `js/firebase-config.js`.

Only Firebase public web config belongs in frontend JavaScript. Do not add service-role keys, private keys, database passwords, or `.env` values.

## Data And Audio

Learning content is loaded dynamically from JSON files in `data/`.

Audio playback is MP3/WAV-only. Add files under `assets/audio/` using the `audioPath` values in the JSON files. Missing files are handled with an in-app message instead of breaking the page.

## Static Hosting Security Limits

GitHub Pages cannot provide server-only session controls such as HttpOnly cookies, CSRF protection, refresh-token rotation, server-side RBAC, secure password hashing, secret managers, or private database access. Firebase Auth handles authentication outside this static frontend; any truly protected data must be enforced by Firebase Security Rules or a backend service.
