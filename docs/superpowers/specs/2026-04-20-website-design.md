# CosmicSelf Website — Design Spec

**Date:** 2026-04-20
**Status:** Approved for planning
**Scope:** B — Marketing + shareables (referral, shared reading, shared QR). No full web app port.

## Goal

Ship a beautiful, world-class marketing website for CosmicSelf at launch — covering acquisition (landing, features, pricing, about, contact, legal, blog-ready, changelog, 404) plus three shareable link types (`/r/:readingId`, `/invite/:code`, `/u/:qrCode`) that work without sign-in and convert visitors into installs. Stay inside the existing Expo Router codebase; leverage Expo's static web rendering; deploy to the existing Cloudflare Pages pipeline.

**Hero positioning:** *"Your cosmic mirror — daily readings, charts, and the wisdom of the stars, personalized for you."* (mystical/poetic)

## Non-Goals

- Full web app (in-browser auth, readings, Akasha chat, tabs). Users install the app for interactive flows.
- Blog content at launch — route scaffolded, zero posts.
- Dynamic per-reading Open Graph images — needs Cloudflare Worker; deferred.
- Status page, jobs page, press kit page.
- Web purchase flow — RevenueCat is mobile-only; pricing page links to stores.
- GA4 or any cookie-consent analytics.

## Architecture

**Rendering:** Expo Router static web output (`web.output: 'static'` in `app.config.js`). Every marketing page pre-renders to HTML at build time. Client hydrates only for interactive bits (three.js Zodiac scene, install-detect CTAs, shareable fetchers).

**Route split:** Web-specific routes render a `WebShell` by default on web and redirect to the closest in-app equivalent on mobile. Existing routes (`/`, `/legal/*`) already use `Platform.OS === 'web'` branching; new routes follow the same pattern.

**Shared web layout (`WebShell`):** One component wraps every web route.
- Sticky header: logo, nav (Features, Pricing, About, Blog, Changelog), install CTA.
- Page body (scoped max-width, responsive gutters).
- `WebFooter` (existing).
- Skip-to-content link, focus outlines, `prefers-reduced-motion` support.

**Blog mechanism:** File-based, no MDX runtime.
- Index: `app/blog/index.tsx` — lists published posts sorted by date.
- Post: `app/blog/[slug].tsx` — renders one.
- Posts: `src/content/posts/*.tsx` — each exports a default component plus a named `meta` object (`{ slug, title, description, date, published }`).
- Index imports all post metas via an index file (no dynamic filesystem scan at runtime).

**Deploy:**
- `expo export --platform web` → `dist/` (existing).
- Add `public/_redirects` (SPA fallback) and `public/_headers` (immutable cache for hashed assets, no-cache for HTML).
- Cloudflare Pages auto-deploys from `dist/` (existing).

**Bundle hygiene:**
- Native-only modules excluded via `Platform.OS` guards and `*.web.ts` stub shims where needed: AdMob, RevenueCat, Google Sign-In native, expo-camera.
- New shim folder: `src/services/platform-stubs/*.web.ts` for any module whose entire surface is native.

## Page Designs

### `/` Landing — refresh existing

- Hero: mystical one-liner + Zodiac three.js background (existing); install buttons (Play / App Store — iOS uses "Coming soon" until shipped).
- Today's Sky widget: moon phase + dominant transit rendered at build time from Swiss Ephemeris on the build machine (baked into HTML).
- Social proof strip: hidden at launch; appears once review data seeds.
- What's Inside: existing 5-card feature grid.
- How It Works: 3-step — chart in → daily insights + Akasha → share with friends.
- FAQ: existing.
- Final CTA band.

### `/features`

- One hero per feature (Self Chart, Today Brief, Ask Akasha, Compatibility, Cosmic QR), alternating left/right image layout.
- Each hero: in-app screenshot, one-sentence benefit headline, three bullet details.
- Footer CTA: link to `/pricing`.

### `/pricing`

- Two-column comparison sourced from shared constants (`FREE_FEATURES`, `PREMIUM_FEATURES`) in `app/subscription.tsx`. No duplication — single source of truth.
- Monthly/yearly toggle driven by `PREMIUM_MONTHLY_PRICE` / `PREMIUM_YEARLY_PRICE` constants.
- FAQ footer: cancel anytime, refund policy, platform billing explainer.
- CTAs link to stores (purchase flows through RevenueCat in-app).

### `/about`

- Short founder note (content placeholder to be filled by user).
- Mission paragraph.
- Values: 3 cards — Accuracy, Respect, Beauty.
- Science callout: Swiss Ephemeris, real birth data, no fortune-cookie generators.
- Team transparency.

### `/contact`

- Primary action: `mailto:admin@cosmicself.app`.
- Secondary: legal links.
- Response-time expectation: "We reply within 48 hours."
- No form backend.

### `/legal/privacy`, `/legal/terms`

- Keep existing pages.
- Audit once during implementation for `cosmicself.app` consistency.

### `/404` (web fallback)

- Zodiac scene, "This star didn't align" tagline, home link, contact link.
- Returns 200 HTML with correct `<title>` for SEO.

### `/r/:readingId` — shared reading viewer

- Fetches via `getSharedReading(readingId)` callable on client after hydrate (skeleton first).
- States: loading / success / not-found.
- Content: first name, date, question (if Akasha), answer, sign/element badges, "Get your own" install CTA.
- Share CTA at bottom (copy link + open store).

### `/invite/:code`

- Fetches via `getInviteMeta(code)` callable.
- Hero: "*{displayName} invited you to CosmicSelf.*"
- Copy explains the invite-only model and 3-referral cap.
- Stores `code` in `localStorage` (`cosmicself.pendingInvite`).
- Install CTAs deep-link `cosmicself://invite/{code}` with store fallback.
- "Already installed? Tap here to open in app" affordance.

### `/u/:qrCode` — cosmic card

- Fetches via `getPublicCosmicCard(qrCode)` callable.
- Renders: first name, sun sign, moon sign, dominant element, one-line vibe.
- "Open in CosmicSelf" deep-link CTA on mobile; install badges on desktop.
- If the existing QR encodes a public token already, use it directly. If it encodes a uid, add a `publicQr/{token}` mapping collection populated on QR generation.

### `/changelog`

- Static TSX list: newest first, one entry per release.
- Each entry: version, date, tag chips (feature / fix / perf), bullet list.
- Launch seed: `1.0.0 — Hello, cosmos.`

### `/blog` + `/blog/[slug]`

- Index: published posts sorted newest first; empty state at launch: "Words from the stars, coming soon."
- Post page: frontmatter title/date + JSX body.
- No runtime MDX — posts are TSX files.

## Shareable Flows + Backend

### Shared reading

**Data model:**
- New collection: `sharedReadings/{id}` — `{ ownerUid, firstName, date, kind, question?, answer, sign?, element?, createdAt }`. Nothing from the birth chart, nothing re-identifying.
- Source readings live in `users/{uid}/akashaReadings/{id}` (private, unchanged).

**Cloud Functions:**
- `getSharedReading(readingId)` — HTTPS callable, unauthenticated. Reads `sharedReadings/{id}`, returns public-safe fields only.

**In-app sharer flow:**
- "Share" button on a reading writes a sanitized copy to `sharedReadings/{uuid}`.
- Share is indefinite, revocable by owner.

**Firestore rules:**
```
match /sharedReadings/{id} {
  allow read: if false; // public read via callable only
  allow create: if request.auth != null
    && request.resource.data.ownerUid == request.auth.uid;
  allow delete: if request.auth != null
    && resource.data.ownerUid == request.auth.uid;
  allow update: if false;
}
```

**Revoke UI:** Out-of-scope for launch. Shares remain until Cloud Function deletion is wired in a follow-up ("My Shares" settings screen).

### Referral

**Data model changes:**
- Add `displayName` field to `referralCodes/{code}` docs.
- Seed script: `firebase-functions/scripts/seed-referral-names.js` — one-time backfill reading each code's owner profile and writing `displayName`.

**Cloud Function:**
- `getInviteMeta(code)` — HTTPS callable, unauthenticated. Returns `{ displayName, codeValid, used, cap }`. No uid leaked.

**Client flow:**
- Web route reads via callable, stores `code` in localStorage.
- Install CTAs deep-link with `?code=XXX`; app's existing `pendingReferral` flow handles it.
- Users who install without the deep-link get a "copy code" affordance.

### Cosmic QR

**Data model:**
- If existing QR codes encode a public token, use directly.
- If they encode a uid, add `publicQr/{token}` → `{ uid }` mapping collection; populated on QR generation in-app.

**Cloud Function:**
- `getPublicCosmicCard(qrCode)` — HTTPS callable, unauthenticated. Returns `{ firstName, sunSign, moonSign, dominantElement, vibeOneLiner }`.

**Firestore rules:**
```
match /publicQr/{token} {
  allow read: if false; // public read via callable only
  allow create: if request.auth != null
    && request.resource.data.uid == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.uid == request.auth.uid;
}
```

### Install-detect pattern (all three shareables)

- Hook: `src/hooks/useInstallDetect.web.ts` — `useInstallDetect(deepLink: string)`.
- On mobile web: try the deep link for ~800ms; if still on the page, show store badges based on `navigator.userAgent`.
- On desktop web: skip detection, show store badges + small QR code.

## Polish Layer

### SEO

- Per-page `<title>`, `<meta name="description">`, canonical URL, Open Graph, Twitter card — injected via a new `<Head>` component wrapping Expo Router's head API.
- `sitemap.xml` generated at build by `scripts/build-sitemap.js` — walks `app/` for routable files + iterates blog slugs.
- `robots.txt` allows everything except `/r/*`, `/invite/*`, `/u/*` (keep shareables out of Google's index to avoid social-graph leakage).

### Open Graph images

- One static OG image per marketing page under `assets/og/` (`home.png`, `features.png`, `pricing.png`, `about.png`, `contact.png`, `changelog.png`, `blog.png`).
- Generic fallback `assets/og/share.png` used for shareable pages and blog posts without custom art.
- Dimensions: 1200×630.

### Analytics

- Plausible via `<script async defer data-domain={EXPO_PUBLIC_PLAUSIBLE_DOMAIN}>` — only loaded if the env var is set.
- Auto pageviews + three custom events: `install_click`, `invite_landed`, `reading_shared_viewed`.
- No cookies, no consent banner, no GA.

### Design tokens

- Reuse existing `COLORS`, `FONTS`, `SPACING`, `BORDER_RADIUS` from `src/constants/theme.ts`.
- New `src/constants/web-theme.ts` — web-only tokens: `BREAKPOINTS` (sm 640, md 768, lg 1024, xl 1280), `MAX_WIDTH` (prose 720, wide 1120).
- Fluid type for hero + section headings via `clamp()`.

### Responsive + accessibility

- Mobile-first; single-column under `md`, multi-column at `lg`.
- Zodiac three.js scene scales to lower DPR on sub-768 viewports; disables when `prefers-reduced-motion`.
- Touch targets ≥ 44px.
- Skip-to-content link.
- WCAG AA color contrast audit; bump `textMuted` if it fails on dark backgrounds.
- Alt text on every image; keyboard-reachable interactive elements; visible focus rings.

### Performance

- First-load JS target: <100 KB gzipped on marketing pages.
- Zodiac three.js scene lazy-imported via `import()` — only hero pages pay for it.
- Preload primary display font.
- `loading="lazy"` on below-the-fold images.
- `public/_headers`: `Cache-Control: public, max-age=31536000, immutable` for hashed assets; `no-cache` for HTML.
- Lighthouse target: ≥95 Performance, SEO, Accessibility, Best Practices.

### Testing

- Vitest unit tests for new pure functions (install-detect hook, sitemap generator).
- Playwright smoke test: boots the static build, verifies every page returns 200 with correct `<title>` and OG tags.
- `scripts/check-links.js` — CI gate crawling internal links.
- Manual QA matrix: Chrome / Safari / Firefox desktop; Chrome Android; Safari iOS.

### Error handling

- Every shareable route handles loading / success / not-found explicitly — skeleton with Zodiac backdrop while loading, friendly "this link expired or was removed" on not-found with home CTA.
- No raw 404 flashes, no blank white flashes during hydration.

## Open Content Placeholders

These require content from the user before launch, but don't block implementation:

- `/about` founder note (1–2 short paragraphs).
- `/about` mission paragraph.
- `/about` values card copy (Accuracy / Respect / Beauty — one sentence each).
- OG image art (7 PNGs).
- `/changelog` 1.0.0 bullets (can start with "Hello, cosmos." one-liner).
- `/blog` first post (optional at launch).
