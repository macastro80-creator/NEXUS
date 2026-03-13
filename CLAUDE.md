# NEXUS — Project Conventions

## What Is This

**NEXUS** is a mobile-first real estate agent collaboration platform, powered by **RE/MAX Altitud**, targeting the Costa Rica market (primarily Pérez Zeledón). It enables agents across agencies to post client property searches, match with listing agents, exchange bids, rate collaborators, and view market analytics. Deployed as a static site on **Vercel**.

## Tech Stack

| Layer       | Technology                                                             |
|-------------|------------------------------------------------------------------------|
| Markup      | Plain HTML5 (no framework, no build step)                              |
| Styling     | **TailwindCSS v3 via CDN** (`https://cdn.tailwindcss.com`)             |
| Icons       | **Font Awesome 6.4** via CDN                                           |
| JavaScript  | Vanilla JS — inline `<script>` blocks per page                        |
| Data        | `locations.js` — flat array `LOCATION_DB` loaded via `<script src>`    |
| Hosting     | **Vercel** — static deployment with `vercel.json` config               |
| Tests       | Python **Playwright** scripts (`test*.py`) for browser testing         |

## Project Structure

```
NEXUS/
├── index.html              # Feed — main search cards, swipe-to-dismiss, matchmaker notifications
├── add-search.html         # Post New Client Search form (buy/rent, budget, location, must-haves)
├── market.html             # Market Pulse — analytics, hot zones, premium gated content
├── my-desk.html            # My Desk — agent's active searches and bid review inbox
├── network.html            # Network — agent directory with search, profile modal, rating system
├── network-profile.html    # Public agent profile (stats, expert zones, specializations)
├── profile.html            # Identity Setup — onboarding form with Code of Conduct
├── admin.html              # Admin Panel — shadow ratings view, spider alerts, company management
├── locations.js            # Shared location database (Province > Canton > District hierarchy)
├── vercel.json             # Vercel deployment config (clean URLs, security headers)
├── nexus_logo.png          # Square logo
├── nexus_logo_horizontal.png  # Horizontal logo
├── test.py                 # Playwright test script
├── test-add.py             # Playwright test for add-search location autocomplete
└── test3.py                # Playwright test script
```

## Key Conventions

### Bilingual (EN/ES) Pattern

All user-facing text is duplicated with CSS class toggling:

```html
<span class="lang-en">English Text</span>
<span class="lang-es hidden">Texto en Español</span>
```

The `setLanguage(lang)` function toggles visibility by adding/removing `hidden`. Every page has its own copy of this function. When adding new text, **always provide both `lang-en` and `lang-es` versions**.

### Branding

| Token          | Value             | Usage                            |
|----------------|-------------------|----------------------------------|
| Primary Blue   | `#003DA5`         | Headers, buttons, navigation     |
| Action Red     | `#ED1C24`         | CTAs, alerts, RE/MAX branding    |
| Font style     | `font-black italic uppercase` | Section headers         |
| Border radius  | `rounded-[32px]`  | Cards, `rounded-2xl` for inputs  |
| Tagline        | "Powered by REMAX Altitud" | Appears on every page nav  |

### Location Autocomplete

The shared `locations.js` file exports a flat `LOCATION_DB` array with ~370 entries formatted as `"Province > Canton > District > Neighborhood"`. Two helper functions are also defined there:

- `normalizeStr(str)` — strips accents for accent-insensitive search
- `highlightMatch(text, query)` — wraps matched substring in styled `<span>`

Each page that uses location search re-implements `showSuggestions()` — this is **intentionally duplicated** (no shared module system). Keep this pattern consistent.

### Admin Mode

`index.html` has a hidden admin mode activated by **triple-clicking** the NEXUS header. This reveals elements with class `admin-only`.

### Navigation

Bottom tab bar is present on most pages (Feed, Pulse, Desk, Profile, Network). Navigation uses plain `<a href>` links between HTML files. The active tab is styled inline with `text-[#003DA5]`.

### Premium Gated Content

`market.html` implements a blurred content pattern:
- Content is blurred with `premium-blur` class
- An overlay prompts RE/MAX Altitud CRM authentication
- `unlockPremiumData()` removes the blur and shows content

### No Build System

There is **no bundler, no npm, no package.json**. All dependencies are loaded via CDN. Do not introduce a build step unless explicitly asked. Keep everything as plain HTML + inline JS.

### Form Validation

Forms use a manual validation approach:
- Required fields get class `validate`
- The `validateAndPost()` function checks for empty values and adds `field-error` class
- Success is shown via modals, not page navigation

## Deployment

Hosted on Vercel as a static site. The `vercel.json` configures:
- `cleanUrls: true` — URLs without `.html` extension
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`

## Testing

Python Playwright scripts exist for browser testing. They run headless Chromium against local file paths. Run with:

```bash
python test-add.py
```

> **Note:** Test file paths may need updating — they reference `/Users/alejandracastro/Desktop/NEXUS/` which is not the current working path.

## Important Rules

1. **Always bilingual** — Every user-facing string must have both `lang-en` and `lang-es` variants
2. **No build tools** — Keep it static HTML + CDN; do not add npm/webpack/vite
3. **TailwindCSS via CDN only** — Do not install Tailwind locally
4. **Inline JS per page** — Each page has its own `<script>` block; no shared JS modules except `locations.js`
5. **Mobile-first design** — The UI targets phone screens; use mobile breakpoints and touch interactions
6. **Maintain card-based UI** — Use `rounded-[32px]` cards with `border shadow-sm` consistently
7. **RE/MAX brand colors** — Primary `#003DA5`, accent `#ED1C24`; do not deviate
8. **Font Awesome for icons** — Do not mix icon libraries
9. **Keep CLAUDE.md up to date** — After each chat interaction, append any new rules, conventions, or decisions discussed with the user to this file so it remains the single source of truth
