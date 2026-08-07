# NihongoZen — Audit & Enhancement Report

**Date:** August 2026
**Scope:** Login/Landing, Security, Theme Engine, Performance, SEO, PWA, Accessibility, i18n, Dead-code cleanup

This report covers every change made to the project, why it was made, and what's
intentionally still outstanding. All files referenced below were delivered
individually during this session — copy each one back into the matching path
in your project.

---

## 1. Login / Landing Page

**File:** `login.html`

Your project has no separate marketing landing page — unauthenticated visitors
are redirected straight to `login.html` by `js/auth-guard.js` (well, the live
copy of that logic — see §9). So `login.html` doubles as your landing page,
and was treated as such.

- Added SEO meta tags: description, Open Graph, Twitter Card, canonical URL
- Added `Content-Security-Policy`, `X-Content-Type-Options`, and a strict
  `Referrer-Policy` header
- Fixed an SEO mistake I initially introduced: `robots` was briefly set to
  `noindex, nofollow`, then corrected to `index, follow` once it was clear
  this page needs to be discoverable, not hidden
- Added JSON-LD structured data (`EducationalOrganization`) for rich results
- Accessibility: `aria-hidden` on ~20 decorative SVGs, `role="tablist"` /
  `aria-selected` on the Sign In / Sign Up tabs, `aria-live` regions for
  error/success messages, visible `:focus-visible` outlines,
  `prefers-reduced-motion` support, `lang="ja"` on Japanese text,
  `autocomplete="one-time-code"` on the OTP field
- Full i18n coverage (see §7)

## 2. Security Hardening

**File:** `firestore.rules`

Two real privacy leaks were found and fixed:

| Issue | Before | After |
|---|---|---|
| `friend_requests` | Any signed-in user could read **every** pending friend request in the app | Only the sender/recipient can read a given request |
| `groups/{id}/messages`, `groups/{id}/polls` | Any signed-in user could read **any** private study group's chat, even groups they're not a member of | Restricted to the group's owner/members via a `isGroupMember()` rule helper |

**Not fixed, flagged for you:**
- `config/config.js` has a live Gemini API key committed in plaintext. Confirm
  it has an HTTP-referrer restriction in Google Cloud Console, and rotate it
  if this repo has ever been public.
- `users/{userId}` lets any signed-in user read another user's full profile
  document, including email and phone. Fixing this properly means splitting
  the document into public fields (name, photo, level) and private fields
  (email, phone) — a data-model change that touches code across the app, so
  it wasn't done blind. Worth a dedicated pass.

## 3. Theme Engine

**Files:** `css/tokens.css`, `js/theme.js`, `theme-boot-snippet.html`, `index.html`, `login.html`

Went from 3 themes to 7: 🌸 Sakura (default), 🌙 Dark, 🩵 Sky Blue, 🌊 Ocean,
💚 Emerald, 💜 Purple, 🌇 Sunset.

- Every new palette hits WCAG AA contrast (4.5:1+) for body text
- First-time visitors (no saved preference) now get the OS dark-mode
  preference respected instead of always defaulting to Sakura
- Smooth cross-theme transitions, disabled under `prefers-reduced-motion`
- No flash-of-wrong-theme: the pre-paint boot script in both `index.html`
  and `login.html` recognizes all 7 themes
- 100% backward compatible — existing `nz-light` / `nz-light-blue`
  localStorage values and CSS classes are untouched

## 4. Performance

**Files:** `assets/logo-index.jpg`, `firebase.json`

- `assets/logo-index.jpg` was a 1254×1254px, 176KB JPEG used as a 44px
  onboarding icon. Resized to 176×176 (4× retina), now 10.8KB — a 94%
  reduction, same filename so no HTML changes were needed
- `firebase.json` didn't exist at all — no caching headers meant your
  700KB+ data files re-downloaded on every visit. Added tiered caching
  (1yr for fonts, 1wk for images, 1 day for JS/CSS with revalidation,
  no-cache for HTML) plus baseline security headers
- Confirmed already-good: your large data JS files were already using
  `defer`, and Google Fonts was already using `display=swap`

## 5. SEO

**Files:** `robots.txt`, `sitemap.xml` (both new — didn't exist before)

- `robots.txt` allows the public `login.html`, blocks the authenticated
  app shell (`index.html`, onboarding pages) and `config/` from crawlers
- `sitemap.xml` lists the one genuinely public/indexable page

`index.html` and the onboarding pages were deliberately left out of the
sitemap — they sit behind `auth-guard.js` and no crawler or logged-out
visitor can reach them, so indexing them would have no benefit.

## 6. PWA

**Files:** `manifest.json`, `js/service-worker.js`, 4 icon PNGs

**Real bug found:** the live `manifest.json` referenced
`assets/pwa/icon-192.png` and `icon-512.png` — **neither file existed**.
"Add to Home Screen" was silently broken on every platform.

- Generated all 4 required icon sizes/variants from your logo (later
  swapped to the exact logo image you provided), including maskable
  variants with proper safe-zone padding for Android adaptive icons
- Bumped the service worker cache version and added the new icons plus
  two CSS files (`ai-sensei.css`, `welcome.css`) that were missing from
  the offline precache list
- Not implemented: push notifications, background sync — both need
  server-side/Cloud Functions work that can't be done from the frontend
  alone

## 7. Accessibility (WCAG 2.2)

**Files:** `index.html`, `js/core.js`, `css/layout.css`

- 6 `<img>` avatar tags with no `alt` attribute at all — fixed
- 8 `<div onclick>` elements (module cards, kanji popup, nav rows, group
  chat, poll voting, flashcard tap-to-hear) had no keyboard path — added
  `role="button" tabindex="0"`, plus one global `keydown` handler in
  `core.js` that makes Enter/Space activate any `role="button"` element
  app-wide
- Added a skip-to-content link, visible `:focus-visible` states
  everywhere, and `prefers-reduced-motion` support

## 8. Internationalization (i18n)

**Files:** `js/i18n.js` (new), `login.html`, `index.html`

Full, honest scope note: `index.html` is a ~6,000-line SPA where nearly
every string is built dynamically inside JavaScript. Translating the
*entire* app in one pass risked both mistranslation and breakage, so the
work was scoped deliberately:

- **`login.html`** — 100% translated: headline, features, stats, tabs,
  forms, buttons, legal text. Transient loading-state microcopy
  ("Signing in…", "Sending OTP…") is still English-only.
- **`index.html`** — sidebar navigation, section headers, and the mobile
  bottom nav are translated. Actual lesson content (vocabulary meanings,
  kanji examples, grammar explanations) was **not** touched — that's a
  content-authoring task requiring native-speaker review, not something
  to auto-generate.
- 11 languages throughout: English, 日本語, हिन्दी, Español, Français,
  Deutsch, Indonesia, Tiếng Việt, 한국어, 中文, Português
- Switches instantly, no reload, persists to `localStorage`, and
  auto-detects the browser's language on first visit
- A language `<select>` now appears on both `login.html` and in the
  `index.html` sidebar footer, kept in sync via a shared `nz:langchange`
  event

## 9. Dead Code

**File:** `cleanup-dead-files.sh`

9 files (~40KB) confirmed via project-wide `grep` to be loaded by **zero**
`.html` or `.js` files:

- `js/app.js`, `js/progress.js`, `js/manifest.js` — simply unreferenced
- `js/config.js`, `js/firebase-config.js` — duplicate Firebase configs
  with a **mismatched `appId`** vs. the one actually in use, plus a
  second copy of the live Gemini API key
- `js/auth-guard.js` — duplicate of logic that isn't actually loaded by
  any page
- `js/protect.js` — imports `./firebase.js`, which doesn't exist in this
  project; was already broken
- `assets/pwa/manifest.json`, `assets/pwa/service-worker.js` — stale
  duplicates that try to cache a non-existent `dashboard.html`

Run `bash cleanup-dead-files.sh` from the project root; it asks for
confirmation and uses `git rm` if the folder is a git repo.

## 10. Performance — Lazy Loading

**File:** `index.html`

`nz-conversation-module.js` (~40KB) and `nz-pronunciation-module.js`
(~21KB) no longer load on every page view — only when a learner actually
opens the Conversation or Pronunciation page. Verified safe: every
reference to `window.ConversationPage` / `window.PronunciationPage` in
the codebase was already null-checked, and the app already had a
"module loading…" fallback UI in place, meaning this async pattern was
clearly anticipated by the original code, just never wired up.

---

## What Was Deliberately Not Done

| Item | Why |
|---|---|
| Full `index.html` i18n (lesson content) | Content-authoring task; auto-translating pedagogical facts risks misleading students |
| Code-splitting `nz-data.js` (671KB) / `nz-chapter-data-full.js` (708KB) | These likely have unverified synchronous dependencies across the app; guessing wrong would break a live app I can't test |
| `users/{userId}` PII field-splitting | Requires a data-model change touching many call sites; needs its own dedicated pass |
| Push notifications / background sync | Needs server-side Cloud Functions, not a frontend-only change |
| Full visual redesign of every dashboard module (Vocab, Kanji, Grammar, etc.) | Original prompt's scope was enormous (a full commercial redesign); this session focused on infrastructure, security, and correctness issues that had concrete, verifiable bugs |

---

## Quick Deploy Checklist

1. Copy every delivered file back to its path (see filenames above)
2. Run `bash cleanup-dead-files.sh`
3. `firebase deploy --only firestore:rules,hosting`
4. Rotate/restrict the Gemini API key in `config/config.js` if this repo
   has ever been public
5. Test theme switching, language switching, and the Conversation/
   Pronunciation pages specifically (lazy-loading is new — worth a manual
   click-through)
