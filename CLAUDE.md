# NEXUS Project Guidelines

## Project Overview
NEXUS is a real estate agent collaboration platform built for the REMAX Altitud office in Pérez Zeledón, Costa Rica. It enables agents to post client searches and match them with other agents' properties. The project is a mobile-first Vanilla HTML/JS frontend with **Supabase** as the backend (PostgreSQL, Auth, Storage).

**Owner**: Alejandra Castro (Broker, REMAX Altitud + REMAX Altitud Cero)

## Launch Status
- **Phase 1**: UI complete ✅
- **Phase 2**: Supabase backend integrated ✅ (auth, DB, RLS, Storage)
- **Phase 3**: Profile persistence ✅ (Supabase + localStorage fallback)
- **Deployed**: [nexus-gray-seven.vercel.app](https://nexus-gray-seven.vercel.app)

## Technical Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript — NO frameworks, NO npm packages
- **Styling**: Tailwind CSS (via CDN), Font Awesome icons (via CDN)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Data**: Supabase DB with `localStorage` fallback when no auth session
- **Hosting**: Vercel (configured via `vercel.json`)
- **Schema**: `supabase/schema.sql` — 8 tables, RLS policies, auto-profile trigger

## Supabase Configuration
- **URL**: Configured in `supabase-client.js`
- **Anon Key**: Configured in `supabase-client.js`
- **Client**: `supabase-client.js` — 30+ CRUD helper functions
- **SDK**: Loaded via CDN (`@supabase/supabase-js@2`)
- **Storage Bucket**: `avatars` (public) — for profile photos

### Database Tables
| Table | Purpose |
|---|---|
| `profiles` | User profiles (extends `auth.users`), roles, brand, expert zones |
| `offices` | REMAX/other offices with broker info |
| `searches` | Buyer/renter search posts on Match Board |
| `matches` | Properties sent to searches |
| `tickets` | Support tickets from agents |
| `locations` | Costa Rica cantons + districts |
| `deals` | Pipeline tracking (negotiation → sold) |
| `notifications` | User notifications |

### User Roles
- `agent` — Independent external agent
- `remax` — REMAX-branded agent
- `broker` — Office Broker / Owner
- `regional_director` — Regional Administrative Director
- `mainadmin` — Full platform administrative access
- `buyer` — Client assigned to an agent via `assigned_agent_id`

### Row Level Security (RLS)
- Profiles: everyone reads, only own profile updates
- Searches: active searches are public, agents manage own
- Matches: sender + search owner can view/update
- Tickets: users see own, admin sees all
- All tables have RLS enabled

## Key Pages
| File | Purpose | Supabase Integration |
|---|---|---|
| `login.html` | Auth (sign up/in/reset), **requires terms acceptance** | ✅ Real Supabase Auth |
| `index.html` | **Match Board** — search cards | ✅ Reads `searches` table |
| `my-desk.html` | **My Hub / CRM** — manage searches, matches, invites | ✅ Reads user's searches |
| `add-search.html` | **Post Search / Invite Client** — agent form | ✅ Writes to `searches` table |
| `client-onboarding.html`| **Client Portal** — client criteria + co-buyer | ✅ Writes to `searches`, auth |
| `buyer-matches.html` | **Client Match Board** — private property view | ✅ Reads `matches` table |
| `profile.html` | **My Profile** — identity, languages, zones | ✅ Supabase + localStorage |
| `network.html` | **Agent Roster** — directory of agents/offices | ✅ Reads `profiles` / `offices` |
| `network-profile.html`| **Public Agent Profile** — leads, info, listings | ✅ Reads `profiles` |
| `broker-dashboard.html`| **Broker Dashboard** — office analytics, zones | ✅ Reads enterprise metrics |
| `admin.html` | **Admin Panel** — control center | ✅ Offices, tickets, KPIs |
| `market.html` | Market page (locked — Premium Feature) | — |
| `Mi_Oficina.html` | Office page (locked — Premium Feature) | — |
| `my-business.html` | Business page (locked — Premium Feature) | — |

### Profile Page Features
- Name, email, WhatsApp (with country code dropdown, defaults to 🇨🇷 +506)
- Agency/brand selection, TX closed, expected TX
- Languages spoken (draggable, ordered)
- Expert zones (location search with up to 3 selections)
- Specializations (Residential, Commercial, Developers, Rentals)
- Profile photo upload (Supabase Storage or local preview)
- All fields persist via localStorage fallback + Supabase when authenticated

## Admin Panel (`admin.html`)
- **Password**: `nexus2025`
- **Dashboard KPIs**: Offices, Teams, REMAX agents, External agents (from DB)
- **4 Tabs**: Tickets, Offices, Agents, Locations
- **Data source**: Supabase with localStorage fallback

## Premium & Subscription Tiers
- **Free Tier**: Basic access for individual agents.
- **B2B Office Plans (Core, Pulse, Omni)**: Unlocks enterprise modules for brokerages.
- Modules include: **Cuentas Corrientes** (Billing/Expenses), **QyR** (Performance tracking), **Broker ERP**.
- Market, Office, Business, and Enterprise pages locked for unstructured/free users.
- Lock messages use neutral "Premium Feature" text (not REMAX-specific branding).
- Premium locking code runs on `DOMContentLoaded` in each page.

## Agent Hierarchy — REMAX RECONNECT Integration (Phase 5 — Planned)
```
Admin (Main) → creates Offices
    Office Broker → connects REMAX RECONNECT API → syncs agent roster
        REMAX Agent → invited via email, auto-assigned role + full access
            If agent leaves office (API sync) → profile deactivated (not deleted)
```
- Full plan documented in `WORKFLOW.md` → Phase 5
- Uses REMAX RECONNECT API (`api.remax-cca.com/api/AgentsPerOffice/{OfficeID}`)
- Each office broker manages their own agents independently
- Deactivated agents keep their past searches, matches, and deals

## Avatar System
- Profile page has circular photo upload with camera overlay
- Uploads to Supabase Storage `avatars` bucket (if available)
- Falls back to local preview via FileReader API
- Saved to localStorage for persistence without auth
- Default: person silhouette icon in gradient blue circle

## Costa Rica-Specific Rules
- **NO MLS numbers** — Costa Rica does not have an MLS system
- Properties identified by name + location
- **Locations**: Pérez Zeledón core area for launch; more via admin panel
- **Currency**: USD ($) for property prices
- **WhatsApp**: Country code defaults to +506 (Costa Rica)

## Terminology
- **Match Board** (not "Feed") — the main page with search cards
- **Searches** (not "Buyers") — stat card label in My Hub
- **Matches Sent** (not "Listings") — stat card label in My Hub
- **My Hub** (not "My Desk") — agent command center
- **Post Search** (not "Add Search") — creating a new client search
- **Premium Feature** (not "Join REMAX Altitud") — locked feature messaging

## localStorage Keys
| Key | Purpose |
|---|---|
| `nexusProfile` | Full profile object (name, phone, country code, agency, languages, specializations, expert zones, avatar) |
| `nexusTickets` | Support tickets array |
| `nexusOffices` | Offices array |
| `nexusLang` | Language preference (`en` / `es`) |
| `nexusEmail` / `userEmail` | User's email |
| `userName` | User's display name |
| `isPremium` | Boolean — premium access |
| `userRole` | `agent`, `remax`, `mainadmin`, `buyer` |
| `adminAuth` (sessionStorage) | Admin panel auth flag |
| `theme` | Theme (`dark` / not set) |

## Code Conventions
1. **Keep it Vanilla** — No npm, React, or build steps
2. **Mobile-first** — Design for 375-500px, scale to desktop
3. **Bilingual** — All text must have EN/ES versions (`lang-en` / `lang-es` classes)
4. **Tailwind classes** — Use via CDN, no custom config
5. **Async safety** — All Supabase calls wrapped in try/catch; never block premium-locking code
6. **Graceful fallback** — Always fallback to localStorage when Supabase is unavailable
7. **Font Awesome** — For all icons, loaded via CDN

## Key Files
| File | Purpose |
|---|---|
| `supabase-client.js` | Supabase client + 30+ CRUD helpers |
| `supabase/schema.sql` | Full DB schema (8 tables, RLS, triggers, seed data) |
| `locations.js` | Location database (cantons, districts, areas) |
| `global-theme.js` | Dark mode, language toggle |
| `vercel.json` | Vercel deployment config |
| `WORKFLOW.md` | Feature planning, phase roadmap |
