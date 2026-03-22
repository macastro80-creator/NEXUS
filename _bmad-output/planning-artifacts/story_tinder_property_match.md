# Story: Tinder-Style Co-Buyer Match Board

## Background
REMAX agents want to offer a premium, collaborative experience to their buyer clients. Often, properties are proposed to a couple (e.g., husband and wife) who must both agree on a property before requesting a showing. 

## Requirements
1. **Premium Tier Restriction**: Only agents with the `remax` role can generate invitations to this flow.
2. **Dual-Decision Engine**: 
   - When the agent sends a Match, it appears on the client's board.
   - Client A can swipe Right (Like) or Left (Reject).
   - If Client A swipes Right, the property shows as "Waiting on Partner".
   - If Client B also swipes Right, the property is "Mutually Liked" and the agent is notified.
   - If either client swipes Left, the property is "Rejected".
3. **The Couple's Board**: A minimalist, mobile-first page specifically designed for the `buyer` role that hides agent complexities (like Market, Business Kanban, etc.) and focuses purely on making decisions on proposed properties.

## Acceptance Criteria
- [ ] Non-REMAX agents cannot access the client-onboarding tool.
- [ ] A couple logging in sees only their assigned searches.
- [ ] Property likes/rejects are stored securely in the `matches` table (`liked_by` array).
- [ ] The agent dashboard accurately reflects if a match is fully accepted vs waiting on the other partner.
