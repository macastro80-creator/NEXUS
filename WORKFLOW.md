# NEXUS App Workflow — Phased Launch Plan

This document outlines the platform architecture, user roles, module breakdown, and phased rollout for NEXUS — a real estate collaboration platform powered by REMAX Altitud.

---

## User Roles & Access Levels

Roles are stored in `localStorage.userRole` as a simple string. To **add a new role**, just add a row to this table and a matching `case` in the permission check — no restructuring needed.

| Role | `userRole` value | Access |
|---|---|---|
| **Every Agent** (default) | `agent` | Match Board, My Hub, My Profile |
| **REMAX Agent** | `remax` | + My Office, My Business, My Resources, Market |
| **Team Leader** | `teamleader` | + Team management, Junior Agent creation |
| **Broker** | `broker` | + Full office statistics dashboard |
| **Office Admin** (Secretary) | `officeadmin` | Data entry, limited views — Broker controls what they can see |
| **Main Admin** (Platform Owner) | `mainadmin` | Full access to all data, filtered by area or country |
| *(Add new roles here)* | *(new value)* | *(describe access)* |

> Every user starts as an "Every Agent." Locked features show a prompt: **"Premium Feature — Unlock with your Office."**
>
> **REMAX Agent**: This role is **assigned via the REMAX RECONNECT API sync** (see Phase 5). When an office connects their API, agents in that office's roster are invited and automatically assigned the `remax` role with full feature access. If an agent leaves the office (detected via API sync), their profile is deactivated.
>
> **Office Admin**: Can enter information (agents, properties, schedules) but the Broker sets which sections are visible/editable for them.
>
> **Main Admin**: Has a global view across all offices and areas. Can filter all statistics and data by region or country.

### Admin Panel (`admin.html`) — Main Admin Only
Instead of editing code, the Main Admin manages the platform through a visual **Admin Panel** page:

| Section | What you can do |
|---|---|
| **Manage Roles** | Assign/change any user's role from a dropdown (agent → remax → teamleader → broker → officeadmin). Add new role types. |
| **Manage Agencies** | View a list of all agencies. Add new ones when users frequently type the same name under "Other." Remove duplicates. |
| **Manage Offices** | Add/edit offices. Assign Brokers to offices. Set office IDs for API connections. |
| **User Directory** | Search all users, see their role, office, and activity. Promote, demote, or deactivate accounts. |
| **Platform Settings** | Toggle features on/off per phase. Set locked-feature messaging. Manage API keys. |

> This page is **only visible to `mainadmin`** and provides full control without touching any code.

### Platform Dashboard (Main Admin KPIs) — ✅ IMPLEMENTED
The Admin Panel shows 4 always-visible KPI cards at the top:

| KPI | Description | Status |
|---|---|---|
| **Offices** | Total connected offices | ✅ Live |
| **Teams** | Team Leaders count | ✅ Live (populated from agent data) |
| **REMAX** | Agents with brand = REMAX | ✅ Live |
| **External** | All non-REMAX agents | ✅ Live |

### Offices Tab — ✅ IMPLEMENTED
Admin can create and delete offices. Each office has: Name, Brand, Linked Area (Canton), Broker Name, Team count, Agent count.

### Future: Agent Hierarchy (Save for Later)
```
Admin (Main) →  creates Offices
    Office (Broker) →  adds REMAX Agents + Team Leaders
        Team Leader →  adds Junior Agents
            Junior Agent →  has own login
```
- Each person gets their own login credentials
- Office can only add agents that belong to it
- If an office has no user registered, agents default to normal (external) role
- Admin can see the full tree: Office → Teams → Agents

### Multi-Office Switching (Brokers)
A Broker who manages multiple offices (e.g., REMAX Altitud + REMAX Altitud Cero) can switch context:
- `localStorage.activeOffice` stores the current office ID (e.g., `altitud`, `altitud-cero`).
- A **dropdown in the top nav** (visible only to Brokers) lets them switch offices.
- All dashboard stats, agent lists, and pipeline data filter by `activeOffice`.
- Switching offices is instant — just changes the filter, no logout/login needed.

---

## Phase 1 — EveryAgentModule ✅ *(Current Build)*

**Available to:** All registered agents, regardless of brand.

### Pages

| Page | File | Purpose |
|---|---|---|
| Login | `login.html` | Email/password, sets role in `localStorage`, redirects to Match Board |
| Match Board | `index.html` | Universal feed of buyer searches. Post searches, send matches, filter by location/type |
| My Hub | `my-desk.html` | Personal inbox: active searches, incoming matches, feedback flow |
| My Profile | `profile.html` | Agent info, settings, team display, performance data |
| Post Search | `add-search.html` | Create a new buyer search card |

### Profile Data Collected (`profile.html`)
The profile page tracks key agent information that the platform uses for matching and analytics:

| Field | Purpose |
|---|---|
| Full Name, Email, WhatsApp | Contact and identity |
| Agency (REMAX, C21, etc.) | Brand affiliation. **Main Admin can add new agencies** to the dropdown when agents repeatedly type the same one under "Other" |
| **Month & Year Started** | How long they've been in the business |
| **TX Closed Last Year** | Transaction volume (ranges: 1-5, 6-15, 16-30, 31-50, 50+) |
| **Expected TX This Year** | Performance goals |
| Expert Zones (up to 3) | Geographic specialization |
| Specializations | Residential, Commercial, Developers, Rentals |
| Languages Spoken | Ordered by preference |

### Core Workflow: "The Matchmaker Flow"
1. **Agent A** posts a buyer search on the Match Board.
2. **Agent B** sees it, clicks "Send a Match", pastes their MLS link.
3. **Agent A** receives it in My Hub, reviews the property match.
4. Agents exchange showing feedback through the built-in modals.

### Navigation (Phase 1)
- **Bottom Nav**: Match Board · Hub · Profile
- **Top Premium Nav**: Hidden. Locked buttons show *"Premium Feature"*

---

## Phase 2 — REMAXAgentModule

**Available to:** Users with `userRole = 'remax'` (verified REMAX Altitud agents).

### New Pages

| Page | File | Purpose |
|---|---|---|
| My Office | `Mi_Oficina.html` | Office resources, booking (rooms, photographer, mentoring), procedures manual, RE dictionary |
| My Business | `my-business.html` | Kanban pipeline: Under Contract → DD → Sold. OKR reporting. **⚠️ Critical data source** — this is where Team Leaders and Brokers pull their agent performance and deal statistics from |
| Market | `market.html` | Market analytics, trends, charts. Includes REMAX API auth modal |
| Resources | *(Section in top nav)* | Internal documents, manual of procedures |

### REMAX CCA API Integration (`matchmaker.js`)
The app connects to the **REMAX Central America & Caribbean API** to pull live data per office:
- **Endpoint**: `api.remax-cca.com/api/PropertiesPerOffice/{OfficeID}` — fetches all listed properties
- **Endpoint**: `api.remax-cca.com/api/AgentsPerOffice/{OfficeID}` — fetches all agents in the office
- **Office ID (Altitud)**: `FEA8746D-CC1D-41B8-89F3-D04AC98274AF`

### Premium Auto-Match Alerts (REMAX Agents Only)
When a new buyer search is posted on the Match Board, the Matchmaker engine (`matchmaker.js`) runs in the background:
1. Fetches all office properties from the REMAX API.
2. Compares buyer requirements (location, property type, budget) against the property catalog.
3. If a match is found (e.g., 95% match), a **⚡ Premium Auto-Match notification** appears in the bell panel.
4. The REMAX agent can click **"Send Match Now"** — the MLS link is auto-filled from the API data.
5. Or they can decline with the ✕ button, which grays out the alert.

> This is **exclusive to REMAX agents** — it's a key incentive for agents to join REMAX Altitud and get automatic matching against the office's live inventory.

### Navigation (Phase 2)
- **Bottom Nav**: Match Board · My Hub · Market · Profile
- **Top Premium Nav (gold)**: Office · Business · Resources

---

## Phase 3 — TeamLeadersModule

**Available to:** Users with `userRole = 'teamleader'`.

### New Features
- **Team Management Dashboard**: A Team Leader can create and manage **Junior Agents**.
- **Junior Agent Onboarding**: The Team Leader creates Junior Agent accounts directly from their dashboard.
- **Team Performance View**: Aggregated stats for all Junior Agents (searches posted, matches sent, deals in pipeline).
- **Mentoring Tools**: Direct access to schedule mentoring sessions with Junior Agents.

### New Pages (Proposed)

| Page | File | Purpose |
|---|---|---|
| My Team | `my-team.html` *(NEW)* | Manage Junior Agents, view team stats, create new agents |

### Navigation (Phase 3)
- Top Premium Nav adds a **"My Team"** link for Team Leaders.

---

## Phase 4 — BrokerModule

**Available to:** Users with `userRole = 'broker'`.

### New Features
- **Office-Wide Statistics**: Track all agents' performance (total searches, matches, deals closed, revenue).
- **Agent Leaderboard**: Rank agents by activity and deal volume.
- **Pipeline Overview**: See all active deals across the entire office.
- **Reporting & Export**: Generate reports for office meetings.

### New Pages (Proposed)

| Page | File | Purpose |
|---|---|---|
| Broker Dashboard | `broker-dashboard.html` | Full office analytics and leaderboard |

### Navigation (Phase 4)
- Broker sees an additional **"Dashboard"** link in the top premium nav or a dedicated section in profile.

---

## Phase 5 — REMAX RECONNECT Office Integration *(Planned)*

**Purpose:** Connect REMAX offices to NEXUS via the REMAX RECONNECT API so that office brokers can manage their agents' access automatically.

### Flow

```
1. Office Broker signs up on NEXUS → navigates to Office Settings
2. Broker enters their REMAX RECONNECT API credentials (Office ID + API key)
3. NEXUS syncs with RECONNECT API → pulls full agent roster
4. Broker reviews the roster → sends email invitations to agents
5. Agents sign up via invitation link → automatically get:
   - role = "remax"
   - office_id = their office
   - is_premium = true
   - All features unlocked
6. Periodic background sync (daily/weekly cron):
   - Fetches current roster from RECONNECT
   - New agents in roster → send invitation email
   - Agents no longer in roster → profile marked INACTIVE
     (not deleted — past searches, matches, deals preserved)
```

### RECONNECT API Endpoints
| Endpoint | Purpose |
|---|---|
| `api.remax-cca.com/api/AgentsPerOffice/{OfficeID}` | Fetch all agents in an office |
| `api.remax-cca.com/api/PropertiesPerOffice/{OfficeID}` | Fetch all properties (used in Phase 2 auto-match) |

### Known Office IDs
| Office | RECONNECT Office ID |
|---|---|
| REMAX Altitud | `FEA8746D-CC1D-41B8-89F3-D04AC98274AF` |
| REMAX Altitud Cero | *(TBD — get from REMAX)* |

### Database Changes Needed

```sql
-- Add to profiles table:
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN reconnect_agent_id TEXT;  -- RECONNECT's agent identifier
ALTER TABLE profiles ADD COLUMN invited_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN deactivated_at TIMESTAMPTZ;

-- Add to offices table:
ALTER TABLE offices ADD COLUMN reconnect_office_id TEXT;  -- RECONNECT Office UUID
ALTER TABLE offices ADD COLUMN reconnect_api_key TEXT;     -- Encrypted API key
ALTER TABLE offices ADD COLUMN last_sync_at TIMESTAMPTZ;
```

### Agent Lifecycle

| Event | Action |
|---|---|
| Agent found in RECONNECT roster | Send invitation email, create pending profile |
| Agent accepts invitation | Activate profile, set role to `remax` |
| Agent no longer in roster | Set `is_active = false`, `deactivated_at = now()` |
| Agent rejoins roster | Reactivate profile, clear `deactivated_at` |

### Multi-Office Support
- Each office broker manages their own agents independently
- Broker for REMAX Altitud sees only Altitud agents
- Broker for REMAX Altitud Cero sees only Altitud Cero agents
- Main Admin sees all offices and all agents

### Implementation Components (Build Later)
1. **Office Settings Page** — UI for broker to enter RECONNECT credentials
2. **Sync Engine** — Supabase Edge Function or cron job to call RECONNECT API
3. **Email Service** — Supabase email or SendGrid for invitation emails
4. **Invitation Flow** — Magic link or signup with pre-filled office assignment
5. **Deactivation Logic** — Mark profiles inactive, restrict login, preserve data
6. **Admin View** — Show sync status, last sync time, active/inactive agent counts

---

## Technology Assessment

### Current Stack: Vanilla HTML/CSS/JS + Tailwind CDN

**Pros:**
- ✅ Zero build step — edit and deploy instantly via Vercel.
- ✅ Very fast for a small team to prototype and iterate.
- ✅ No framework lock-in.
- ✅ The existing pages work well and look premium.

**Cons:**
- ⚠️ No component reuse — navigation bars must be copy-pasted into every HTML file and updated via Python scripts.
- ⚠️ No real authentication — roles are stored in `localStorage` (easily spoofed).
- ⚠️ No database — `properties.json` and `agents.json` are static files.
- ⚠️ As modules grow (Phase 3–4), managing 10+ HTML files with shared logic becomes fragile.

### Recommendation

| Phase | Approach | Why |
|---|---|---|
| **Phase 1–2** | **Stay with Vanilla HTML/JS + Supabase** | Supabase is now integrated (auth, DB, RLS, Storage). The existing pages are polished and working. |
| **Phase 3–4** | **Consider migrating to a lightweight framework** (e.g., **Vite + vanilla JS modules**, or **Next.js** for SSR) | Team management and broker stats will benefit from component reuse and routing. |
| **Phase 5** | **Supabase Edge Functions + RECONNECT API** | The sync engine needs server-side execution for secure API calls and scheduled cron jobs. |

> **Bottom line:** Supabase is the backend. For Phase 1–2, **HTML + Supabase is working great. Don't rewrite.** Phase 5 (RECONNECT) will use Supabase Edge Functions for server-side API sync.

---

## File Map (All Phases)

```
NEXUS/
├── login.html           # Auth (All Phases)
├── index.html           # Match Board (Phase 1)
├── add-search.html      # Post Search (Phase 1)
├── my-desk.html         # My Hub (Phase 1)
├── profile.html         # My Profile (Phase 1)
├── Mi_Oficina.html      # My Office (Phase 2 — REMAX)
├── my-business.html     # My Business (Phase 2 — REMAX)
├── market.html          # Market Analytics (Phase 2 — REMAX)
├── my-team.html         # Team Management (Phase 3 — NEW)
├── broker-dashboard.html# Broker Stats (Phase 4)
├── REMAX_APP.html       # Alternate Business view (Phase 2)
├── global-theme.js      # Dark mode + theme (All Phases)
├── matchmaker.js        # Match logic (Phase 1)
├── locations.js         # Location DB (Phase 1)
├── agents.json          # Agent data (All Phases)
├── properties.json      # Property data (All Phases)
├── update_navbars*.py   # Navbar sync scripts
└── vercel.json          # Deployment config
```
