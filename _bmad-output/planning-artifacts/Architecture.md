# NEXUS: System Architecture

## 1. High-Level Architecture
NEXUS adopts a headless architecture utilizing a "zero-build" Vanilla JS frontend interacting directly with a Backend-as-a-Service (BaaS) provider via REST/WebSocket APIs.

## 2. Frontend Layer
- **Tech Stack:** HTML5, CSS3, JavaScript (ES6+). No bundlers (Webpack/Vite) currently in use.
- **Styling:** Tailwind CSS (via CDN) ensuring rapid prototyping with responsive utility classes.
- **State Management:** `localStorage` for ephemeral user role/theme state.
- **Routing:** Direct HTML file navigation. Shared components (navbars) are synced at build-time using Python automation scripts (`update_navbars.py`).

## 3. Backend Layer & Database (Supabase)
- **Database:** PostgreSQL handling relational queries.
- **Authentication:** Supabase Auth mapping directly to the `profiles` table via Edge triggers.
- **Security:** Strict Row Level Security (RLS) policies ensuring users can only read their own notifications/matches or their office's data (depending on role).
- **Storage:** Public avatar buckets.

### Key Database Entities:
- `profiles`: Core user data tied to auth ids.
- `regions` / `offices` / `teams`: The hierarchy dictating user visibility.
- `searches`: The core "demand" object posted to the Match Board.
- `matches`: The core "supply" object responding to searches.
- `deals`: Pipeline tracking.

## 4. External Integrations
- **Current:** `api.remax-cca.com` (REMAX Central America) for fetching `PropertiesPerOffice` (Auto-Match feature) and `AgentsPerOffice`.
- **Planned (Phase 5):** `RECONNECT API` integration requiring protected Supabase Edge Functions to ensure seamless roster synchronization without exposing API keys on the client shell.
