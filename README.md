# NEXUS Real Estate Platform

**NEXUS** is a next-generation real estate collaboration B2B SaaS platform powered by REMAX Altitud. It features a tiered, role-based architecture designed to streamline property matching, eliminate "WhatsApp chaos", and provide enterprise-grade analytics for Brokers and Regional Admins.

## Built With

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Styling**: Tailwind CSS (Dark Mode & Glassmorphism enabled).
- **Icons & Typography**: Font Awesome 6, Google 'Outfit' Font.
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS, Storage).
- **Hosting**: Vercel.

---

## The Core Value Proposition

NEXUS revolves around two distinct workflows that solve immediate pain points in the real estate industry:

### 1. The Collaborative Network (Free Tier - The Hook)
Agents spend hours losing data in WhatsApp group chats. NEXUS replaces this with a structured database.
- **Match Board**: Agents log exact buyer demands (Searches) and other agents supply exact inventory (Matches).
- **My Desk & My Business Kanban**: A free, visual pipeline where agents manage their leads and property flow dynamically.

### 2. The Premium Experience (B2B SaaS Subscriptions)
Acquired by the Office/Broker via tiered plans (Core, Pulse, Omni), granting "Pro" features:
- **Broker ERP & Cuentas Corrientes**: Advanced billing, expense management, and commission tracking.
- **QyR (Performance Tracking)**: 1to1 meeting bitácoras for agent development.
- **Tinder-Style Co-Buyer Client Portal**: Agents invite clients to swipe interactively on matches.
- **Auto-Match Engine API**: Automated suggestions crossing office inventory with active searches.

---

## Enterprise Dashboards (Phase A & B Expansion)

NEXUS isn't just for agents; it's a profound management tool:

### Broker Dashboard (`broker-dashboard.html`)
An 8-module ERP system analyzing agent and office performance:
1. **National Ranking**: MTD (Month-To-Date) and YTD billing rank against all other offices in Costa Rica.
2. **Recruitment & Retention**: Demographics (age, gender, nationality), churn rates, and active agent tracking.
3. **Property & API Management**: Inventory syncing and listing pipeline tracking.
4. **Agent Consolidation**: Tracking transactions, billing volume, and comparing agent income against the *Costa Rican National Average Salary* to predict agent survival ("The Green/Red Zone").
5. **Reservómetro (Forecasting)**: Pipeline of deals under contract and pending cash-flow.
6. **Sales Analysis**: Lead origin tracking and exclusivity ratios.
7. **Opex (Expenses)**: Office expense tracking (rent, brand fees, payroll, marketing).
8. **Profitability (P&L)**: Real-time net profit margins.

### Main Admin Region (`admin-dashboard.html`)
Master Franchisee (Region) view aggregating the performance of every office to track macro-economic metrics.

---

## Application Structure (Core Pages)

- **`login.html`**: Entry Auth. Roles dynamically fetched from Supabase.
- **`index.html`**: Global Deal Board / Match Board.
- **`profile.html`**: Agent identity, metrics, and specialization configuration.
- **`buyer-matches.html`**: Client match-voting UI (The "Tinder" Board).
- **`my-desk.html`**: Personal Deal Inbox and fast interactions.
- **`my-business.html`**: Deal flow Kanban board (Free for all users!).
- **`broker-dashboard.html`**: The comprehensive Office ERP.
- **`premium-upgrade.html`**: The High-aesthetic B2B Paywall hooking free users.

## Supabase Database Schema

The NEXUS schema (`schema.sql`) utilizes standard relational models paired with strict **Row Level Security (RLS)**:
- `profiles`
- `regions` and `offices`
- `searches` and `matches`
- `deals` and `properties`
- `expenses`
- `tickets` (Support & Upgrade requests)
- `notifications`

*All metrics and dashboards use internal PostgreSQL logic (Views and JSONB aggregations) for maximum performance.*

## Local Development

The project is structured entirely around standard static assets and requires **no build step** (No Webpack, Vite, or npm scripts natively required).

1. Clone repo.
2. Ensure your Supabase URL / Anon Key are correct in `db-service.js` and `supabase-client.js`.
3. Open in a live server (e.g. `npx serve .` or VS Code Live Server extension).
4. For sweeping Navbar changes, run `python3 update_navbars.py`.
