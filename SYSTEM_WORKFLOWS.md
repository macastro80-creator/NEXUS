# NEXUS System Workflows

This document outlines the core user journeys and technical workflows within the NEXUS platform.

## 1. Authentication & Role Assignment Workflow

1. **Sign Up / Log In (`login.html`)**: User authenticates using email/password via Supabase Auth.
2. **Profile Creation**: A Supabase trigger (`handle_new_user()`) automatically creates a record in the `profiles` table matching the `auth.users` ID.
3. **Client Initialization**: The frontend fetches the user's profile data via `supabase-client.js` and stores key variables (like `userRole`, `isPremium`, and full profile object) in `localStorage`.
4. **Feature Gating**: Upon navigating to any page, a script checks `localStorage.userRole`. Premium modules (My Office, Market, My Business) either render or display a "Premium Feature" lock screen.

## 2. The Matchmaker Flow

This is the core loop of the platform bridging buyer agents with listing agents.

1. **Post Search (`add-search.html`)**: Agent A creates a criteria profile (Client name, budget, location, beds/baths). This creates a row in the `searches` table with status 'active'.
2. **Global Feed (`index.html`)**: The new search appears on the universal Match Board.
3. **Auto-Match (Premium)**: The `matchmaker.js` engine reads the new search, pings the REMAX CCA API for the office's inventory, and generates an algorithmic match percentage. High-percentage matches trigger a notification for REMAX agents to instantly send the listing.
4. **Manual Match Submission**: Agent B sees the card, clicks "Send a Match", inputs a property link, price, and commission split. This creates a row in the `matches` table linked to the `search_id`.
5. **Review & Feedback (`my-desk.html`)**: Agent A reviewing their "My Hub" sees the match under that specific search. They can Like, Reject, or mark it for Visit. Status updates propagate to both agents.

## 3. Client Onboarding Workflow

Allows real clients to enter their own data securely.

1. **NexLink Generation**: Agent goes to `add-search.html` and generates a unique private invitation link rather than filling out the form manually.
2. **Client Portal (`client-onboarding.html`)**: The client opens the link, authenticates/registers, and gets assigned the `buyer` role mapped to the `assigned_agent_id`.
3. **Data Entry**: Client populates their property criteria, unlocking the timeline.
4. **Co-Buyer Invitation**: The client can input their spouse/partner's email natively. The platform links the two profiles under the same search mandate.
5. **Private Match Board (`buyer-matches.html`)**: The agent filters global matches and pushes approved listings to the client's private board for them to review, heart, or dismiss.

## 4. Pipeline & Office Management Flow

1. **Deal Tracking (`my-business.html`)**: Matches that progress past 'Visit' can be converted into Deals. The Kanban board moves deals from 'Under Contract' -> 'Due Diligence' -> 'Sold'. Updates to this board alter the `deals` table.
2. **Broker Dashboard (`broker-dashboard.html`)**: The broker views aggregate office metrics. The page queries the `agent_performance_metrics` SQL View to calculate YTD Volume, Net Income, and compare it against the Office Survival Line (baseline income).
3. **Multi-Office Context**: A Broker managing multiple locations uses a dropdown nav. Selecting an office updates `localStorage.activeOffice`, instantly re-filtering the DOM elements via frontend JS queries against the Supabase data without a hard reload.
