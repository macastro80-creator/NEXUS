# NEXUS: Product Requirements Document (PRD)

## 1. Introduction
This PRD outlines the features, mechanics, and backlog for the NEXUS platform. The system is broken down into modular phases addressing different User Roles.

## 2. User Roles
- `agent`: Standard access (Match Board, Hub, Profile).
- `remax`: Premium access (Office resources, Kanban Business view, REMAX Auto-Match).
- `teamleader`: Can manage Junior Agents.
- `broker`: Full office analytics and dashboard views.
- `officeadmin`: Read/Write access dictated by the Broker.
- `mainadmin`: Super-admin controlling agencies, region linking, and feature toggles.

## 3. Epics & Features

### Epic 1: Core Networking (EveryAgent Module) - *Live*
- **User Authentication:** Email/auth flow powered by Supabase.
- **Match Board:** Post anonymized/named buyer constraints (Location, Budget, Beds, Property Type).
- **Match Proposal:** Any agent can submit an MLS link against an active Search.
- **My Hub:** Centralized inbox for accepting, dismissing, or providing showing feedback on proposed properties.
- **Profile:** Manage contact info, transaction targets (TX goals), and expert zones.

### Epic 2: Premium Features (REMAXAgent Module) - *Live / In Progress*
- **Role-Gating:** Non-REMAX agents encounter "Premium Feature" locks when accessing advanced tools.
- **My Business Kanban:** Deal stage tracking (Negotiation → DD/Contract → Sold).
- **Auto-Match Engine:** Prototype integration with `remax-cca.com` API to auto-suggest matches from the office's inventory for new searches.
- **Co-Buyer Match Board ("Tinder for Properties"):** REMAX agents can generate NexLinks to onboard clients. If a partner email is provided, the system auto-registers the partner and links them to the same search. Both buyers get access to an immersive card-swiping UI where a property requires a "Like" from both partners to become a mutual match.

### Epic 3: Mentorship (TeamLeaders Module) - *Pending*
- **Junior Agent Onboarding:** Direct UI for Team Leaders to register and monitor staff.
- **Team Activity Feed:** Aggregate view of searches posted and matches sent by the team.

### Epic 4: Analytics (Broker Module) - *Pending*
- **Broker Dashboard:** Aggregate office statistics tying directly to the `agent_performance_metrics` SQL view.
- **Survival Line Tracking:** Visual red-zone/green-zone indicators on agent performance.

### Epic 5: Enterprise Sync (RECONNECT Integration) - *Pending*
- **Roster Synchronization:** Automated Supabase Edge Functions / Cron jobs linking NEXUS to the REMAX RECONNECT network.
- **Automated Lifecycle:** Auto-invite new agents found on the RECONNECT roster; auto-deactivate agents dropped from the roster.

## 4. Pending Action Items
1. Build `my-team.html` for Team Leaders.
2. Build `broker-dashboard.html` for Office Brokers.
3. Finalize the Co-Buyer linking logic inside the `deals` and `searches` workflow.
4. Replace duplicate HTML navbars with a unified component loader.
