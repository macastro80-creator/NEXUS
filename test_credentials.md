# NEXUS Test Credentials

Below are the recommended test accounts to verify all the different roles in the NEXUS platform. 

Since Supabase handles authentication and we do not have the master Service Key to inject raw passwords into the cloud database, **you will need to register these emails exactly once** via the `login.html` page using the "Create Account" tab. Once they are registered, you can change their roles in the Supabase Table Editor (`profiles` table).

| Role / User Type | Email | Suggested Password | Brand (Important) | What to test with this account |
| :--- | :--- | :--- | :--- | :--- |
| **RE/MAX Agent (Premium)** | `remax@test.com` | `NexusTest2026!` | `REMAX` | Has full access. Can view 'My Business', 'Mi Oficina', and 'Market' premium modules. |
| **External Agent** | `external@test.com` | `NexusTest2026!` | (Leave blank) | Can use the Match Board to post & view searches, but Premium tabs are locked. |
| **Client / Buyer** | `buyer@test.com` | `NexusTest2026!` | (Leave blank) | Can log in to view their private property matches via `buyer-matches.html`. |
| **Main Admin** | `admin@test.com` | `NexusTest2026!` | (Leave blank) | Has access to the main dashboard KPIs. |

---

### 🔑 Note on the Admin Panel (`admin.html`)
The Admin Panel itself is locked with a client-side passcode. 
- **Admin Page Password:** `nexus2025`

### 🛠️ Quick Setup Steps for these Accounts
1. Open `login.html` and click **"Create Account"**.
2. Sign up the 4 emails listed above with the suggested password `NexusTest2026!`.
3. Open your project on **Supabase Dashboard** -> **Table Editor** -> **`profiles`**.
4. Update the `role` and `brand` column for each email to match the table above:
   - For `remax@test.com` set role to **`remax`** and brand to **`REMAX`**.
   - For `admin@test.com` set role to **`mainadmin`**.
   - For `external@test.com` set role to **`agent`**.
   - For `buyer@test.com` set role to **`buyer`**.
