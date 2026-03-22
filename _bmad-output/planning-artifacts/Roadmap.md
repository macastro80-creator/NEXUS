# NEXUS: Formal Roadmap

## Overview
Development is structured in a 5-Phase strategy to ensure a stable, progressively complex rollout. We have successfully completed the foundational layers and are currently expanding Enterprise components.

## Phase 1: The Network (COMPLETED)
**Objective:** Replace chaotic WhatsApp property sharing with a structured Database.
- [x] Basic Auth & Profiles
- [x] Post "Searches" (Demand)
- [x] Send "Matches" (Supply)
- [x] Centralized Feedback / Inbox (`my-desk.html`)

## Phase 2: Premium Workflows (IN PROGRESS)
**Objective:** Add premium locking, client automation, and pipeline tracking.
- [x] Kanban Board (`my-business.html`)
- [x] Auto-Match Engine Prototypes (REMAX CCA API)
- [x] **Co-Buyer Tinder Board**: Automated partner generation, dual-decision match logic, and strict RLS alignment. 
- [ ] Notification engine overhaul (migrating from polling to Supabase Realtime).

## Phase 3: Team Leaders (PENDING)
**Objective:** Enable Mentorship and Junior Agent oversight.
- [ ] Implement `teamleader` role logic on the UI.
- [ ] Create `my-team.html` dashboard mapping Jr Agents to their mentors.
- [ ] Implement "Assisted Swiping" or mentor approval steps on High-Value Deals.

## Phase 4: Office Brokers (PENDING)
**Objective:** Provide top-down Enterprise OKRs.
- [ ] Build `broker-dashboard.html`.
- [ ] Implement the *Agent Survival Line* (KPIs tracking YTD net commission against baseline targets).
- [ ] Advanced metrics view (Days on Market, Contract Fall-Through Rates).

## Phase 5: Regional Enterprise Sync (PENDING)
**Objective:** Transform into a turnkey SaaS platform.
- [ ] RECONNECT API Integration via Supabase Edge Functions.
- [ ] Master Franchisee Dashboard (Region-level analytics).
- [ ] Automated Billing / Subscription Management.
