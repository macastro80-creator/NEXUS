# NEXUS: Roles and Permissions Specification

## Overview
NEXUS uses a strict Role-Based Access Control (RBAC) model implemented both at the UI component level and securely enforced at the database layer via Supabase Row Level Security (RLS) policies.

## 1. User Roles
The `auth.users` table is mapped directly to a `profiles` table which stores the definitive `role` for a user.

| Role | Description | Access Level |
|---|---|---|
| `buyer` | A client navigating the property Match Board. | Read-only for their own assigned `searches` and proposed `matches` where they hold the `buyer_id` or `partner_id`. Cannot access the main platform dashboard. |
| `agent` | Standard independent agent using the open Match Board. | Can post `searches`, propose `matches`, and track generic stats. Blocked from Team or Office-level aggregations. |
| `remax` | A premium agent linked to a specific REMAX franchise office. | Unlocked Client Onboarding forms (NexLinks), Auto-Matching against API inventory, Kanban pipeline `deals` tracking, and internal office resources. |
| `teamleader` | A senior agent managing junior agents (`Mentorship` module). | Inherits `remax` permissions + can view searches/deals of assigned junior agents. |
| `broker` | Office Owner/Manager. | Top-down visibility. Can view aggregated `agent_performance_metrics`, monitor all office deals, and access the "Survival Line" analytics dashboard. |
| `officeadmin` | Assisting the Broker. | Administrative assistant capabilities for a single `office_id`. |
| `mainadmin` | Application Super-Admin. | Full CRUD access to user roles, office hierarchies, and API token configurations. (Managed via `admin.html`). |

## 2. Row Level Security (RLS) Rules
Database records are strongly isolated. UI "locks" rely on `localStorage.userRole`, but the database does not trust the client. 

### `searches` Table
- **Public Pool:** Any search with `status = 'active'` is visible to all authenticated agents.
- **Ownership:** Only the creator (`agent_id`) can `UPDATE` or `DELETE` the search.
- **Co-Buyer Linking:** As of Phase 2 logic updates, clients authenticated under `buyer_id`, `partner_id`, or `co_buyer_id` also have `SELECT` access to view their own search status.

### `matches` Table
- **Dual Verification:** A match can only be viewed by the Agent who proposed it (`sender_id`), the Agent who owns the target search (`searches.agent_id`), or the connected buyers (`searches.buyer_id`, `searches.partner_id`).

### `profiles` Table
- **Read:** Publicly viewable to allow agents to see who proposed a match (Name, Avatar, Brand).
- **Write:** Users can only `UPDATE` their own rows. `role` elevations must be performed by a `mainadmin` or triggered securely via trusted Edge Functions processing RECONNECT API payloads.
