# NEXUS: API Integrations Specification

## 1. REMAX CCA API (Central America & Caribbean)
The current integration provides live property inventory for the Auto-Match Engine.

### Endpoints Used
- **`GET api.remax-cca.com/properties`** 
  - **Purpose:** Fetches all active inventory for a specific `officeCode` (e.g., REMAX Altitud).
  - **Usage:** In `my-business.html` and `my-desk.html`, this feed is retrieved and actively parsed by `MatchEngine` algorithms to calculate similarities between new buyer `searches` and existing office stock.
- **`GET api.remax-cca.com/agents`**
  - **Purpose:** Pulls public agent data (rosters). 
  - **Limitation:** Mostly used for directory matching. Cannot be used for secure authentication workflows.

## 2. Planned Phase 5: RECONNECT API
The upcoming enterprise integration necessary to establish NEXUS as a true multi-tenant SaaS for REMAX Regions.

### Objective
Synchronize the `auth.users` and `profiles` tables with the official corporate roster. Maintain enterprise data isolation securely.

### Implementation Architecture
Direct client-side API requests to RECONNECT are forbidden due to CORS and API Key exposure. We will utilize **Supabase Edge Functions** serving as a middleware proxy.

1. **Cron Job Sync (Edge Function):** Nightly ping to Reconnect API -> `upsert` profiles into Supabase Database.
2. **Auto-Role Assignment:** If an agent is detected as `status: 'active'` in Reconnect, map them to `role = 'remax'`. If `status: 'inactive'`, map to `role = 'agent'` or disable the auth account.
3. **Hierarchy Sync:** Translate Reconnect `Region` > `Office` > `Team` > `Agent` structures directly into Supabase foreign keys to ensure the RLS `Broker` dashboard accurately calculates splits.

### Security
API tokens for Reconnect will be strictly housed in Supabase Vault / Edge Function Environment Variables.
