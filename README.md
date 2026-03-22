# NEXUS App

**NEXUS** is a real estate collaboration platform powered by REMAX Altitud. It features a tiered, role-based architecture designed to streamline property matching, agent collaboration, and office workflow.

## Overview

NEXUS connects real estate professionals with a unified "Match Board" for buyer searches, an automated property matching system, and powerful pipeline and office management tools tailored to an agent's specific role level. 

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Backend/Database**: Supabase (Auth, DB, RLS, Storage)
- **Deployment**: Vercel

The platform uses a lightweight vanilla HTML/JS approach for immediate iteration without complex build steps, relying heavily on Supabase for a robust backend foundation. 

## Access Levels and Roles

NEXUS assigns features dynamically based on `userRole`:

1. **Every Agent (`agent`)**: Base tier. Access to Match Board, My Hub (inbox), and My Profile. Can post buyer searches and manually send property matches.
2. **REMAX Agent (`remax`)**: Premium tier. Access to everything above plus: My Office, My Business (Canban pipeline), Market Analytics, internal resources, and **Premium Auto-Match Alerts** via the REMAX API.
3. **Team Leader (`teamleader`)**: Can create and manage Junior Agents, track team performance, and schedule mentoring.
4. **Broker (`broker`)**: Access to the full office statistics dashboard, agent leaderboards, pipeline overviews, and reporting. Can switch contexts between multiple managed offices.
5. **Office Admin (`officeadmin`)**: Data entry roles controlled by the Broker workspace.
6. **Main Admin (`mainadmin`)**: Platform owner view. Access to the visual Admin Panel (`admin.html`) to manage roles, agencies, offices, and platform-wide settings dynamically.

## Phased Rollout Plan

NEXUS is being actively developed and released in strategic phases:

- **Phase 1: EveryAgent Module (Live)**
  - Users: All registered agents.
  - Pages: Login, Match Board, My Hub, My Profile, Post Search.
  - Features: "The Matchmaker Flow" allowing agents to post buyer needs and send/receive exact property matches. 

- **Phase 2: REMAXAgent Module**
  - Users: Verified REMAX Altitud agents.
  - Features: My Office resources, My Business pipeline view, Market Analytics, and integration with the REMAX Central America & Caribbean (CCA) API for automatic matching against active inventory.

- **Phase 3: Team Leaders Module**
  - Features: Team management and junior agent onboarding.

- **Phase 4: Broker Module**
  - Features: Office-level performance insights, agent leaderboards, pipeline roll-ups.

- **Phase 5: REMAX RECONNECT Integration**
  - Features: Seamless backend sync with RECONNECT API to automate agent provisioning and manage credentials automatically based on the official REMAX roster.

## Core Features Flow (Matchmaker)

1. Agent A posts a buyer's property requirement on the **Match Board**.
2. **Auto-Match (Premium):** The system checks the REMAX API and notifies REMAX Agents of high-percentage matches in their inventory instantly.
3. Agent B sees the post and clicks "Send a Match," attaching their MLS Link.
4. Agent A receives the match in **My Hub** for review and coordinates next steps.

## Application Pages

Here is a comprehensive list of the core HTML pages in NEXUS and their primary functions:

- **`login.html`**: Auth entry point. Role is determined upon login.
- **`index.html`**: The Match Board. A universal feed of buyer searches where agents can post searches, send matches, and filter by location.
- **`add-search.html`**: The Post Search page. Used by agents to manually create a new search card OR generate a "NexLink" to invite clients.
- **`client-onboarding.html`**: Client Portal. Real clients fill out their property criteria and invite their spouses/co-buyers using their NexLink.
- **`buyer-matches.html`**: Client Match Board. A private view for clients to review properties their agent has shortlisted for them.
- **`my-desk.html`**: My Hub / CRM. A personal inbox tracking active searches, incoming matches, lead protection, and the Co-Swiping feedback flow.
- **`profile.html`**: My Profile. Displays agent info, settings, team info, and performance data.
- **`network.html`**: Agent Network Directory. View all active agents, teams, and offices within the REMAX network.
- **`network-profile.html`**: Public Agent Profile view, showing their contact info, stats, and expert zones.
- **`Mi_Oficina.html`**: My Office (Premium). Contains office resources, booking links (rooms, photographer, mentoring), and the real estate dictionary.
- **`my-business.html`**: My Business (Premium). A Kanban pipeline (Under Contract → DD → Sold) and OKR reporting dashboard.
- **`market.html`**: Market Analytics (Premium). Shows market trends, charts, and includes the REMAX API auth modal.
- **`broker-dashboard.html`**: Broker Dashboard (Premium). Full office analytics, performance metrics (Red/Green survival zones), leaderboards, and pipeline overviews.
- **`admin.html`**: Platform Admin Panel (Main Admin). Visual interface to manage roles, agencies, offices, and platform-wide settings.
- **`REMAX_APP.html`**: Consolidated prototype for REMAX Agent capabilities.

## Development Setup

1. The project has no `npm build` requirement for Phase 1 and 2. Open any `.html` file locally or serve them using a basic local web server (e.g., `python3 -m http.server 8000` or VS Code Live Server).
2. Updates to common UI elements like navbars across static files are handled by running the provided python sync scripts:
   - `python3 update_navbars.py`
   - `python3 update_navbars_fast.py`
3. Push changes to the `main` branch to trigger the automatic Vercel deployment.
