# NEXUS App Architecture

## System Overview

NEXUS is a real estate collaboration platform built for REMAX Altitud. It utilizes a lightweight, modern technology stack focused on rapid iteration and mobile-first design.

### Technology Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+). No build tools or frameworks (React/Vue) are used to allow instant deployment and easy edits.
- **Styling:** Tailwind CSS (via CDN) and Font Awesome (via CDN) for UI components and icons.
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Storage, Row Level Security).
- **Hosting:** Vercel (configured via `vercel.json` for static file serving).

## Data Architecture

The application relies on a robust PostgreSQL database hosted by Supabase.

### Core Entities (Database Schema)
1. **profiles**: Extends `auth.users`. Stores user roles, brand, expert zones, and enterprise metrics (split, employment type).
2. **regions & offices & teams**: Hierarchical structural data mapping Master Franchises -> Brokerages -> Agent Teams.
3. **searches**: Represents a buyer or renter's property criteria (The Match Board posts).
4. **matches**: Represents properties submitted by agents against specific searches. Tracks status (new, liked, visited, contract, sold).
5. **deals**: Pipeline tracking for properties progressing through negotiation, contract, and sold stages.
6. **locations**: Costa Rican cantons and districts used for filtering.
7. **notifications**: In-app alerts for new matches, feedback requests, and system updates.
8. **tickets**: Support/bug reporting from users to main admins.

### Row Level Security (RLS)
Security is enforced at the database layer using Supabase RLS:
- Profiles are universally readable, but editable only by the owner.
- Searches are public if active, but manageable only by the originating agent.
- Matches are restricted to the sender and the receiving agent (search owner).

## Frontend Architecture

The frontend consists of standalone HTML files. State and shared logic are handled minimally:

- **State Management:** Uses `localStorage` for offline fallback and persistence (e.g., `nexusProfile`, `userRole`, `theme`).
- **Backend Communication:** `supabase-client.js` acts as the data access layer, providing 30+ CRUD helper functions wrapping the `@supabase/supabase-js` library.
- **Shared UI:** Navigation bars and common overlays are synchronized across static HTML files via Python scripts (`update_navbars.py`).
- **Premium Feature Locking:** The DOM evaluates the `userRole` on `DOMContentLoaded`. If the user is an external agent, premium regions of the app (like Market or My Business) are locked with an overlay.

## External Integrations

- **REMAX CCA API:** Used presently for the "Auto-Match" engine, where standard buyer criteria load against active REMAX inventory via `/PropertiesPerOffice/{OfficeID}`.
- **REMAX RECONNECT (Phase 5):** Planned architectural extension to synchronize the office roster automatically, assigning roles (`remax`) and tearing down access dynamically based on active API roster checks.
