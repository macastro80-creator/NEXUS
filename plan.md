# Phased Launch Plan

To launch Phase 1 (Match Board, My Hub, and Profile) while keeping Phase 2 features visible but locked, we take the following approach:

1. **Keep the Navigation Bars As-Is (Visible but Locked)**
   - The Bottom Nav and Top Premium Nav stay exactly as they are now.
   - Phase 2 links (Market, Office, Business, Resources) remain **visible** but are **locked**.
   - When a non-REMAX user taps a locked feature, a modal/toast appears: **"Join REMAX Altitud for more features."**
   - This builds anticipation and shows users the full platform potential.

2. **Disable Phase 2 Links in My Profile**
   - On `profile.html`, buttons for "My Business Dashboard," "My Office," and "Resources" stay visible.
   - They are styled as locked (e.g., grayed out, lock icon) and trigger the "Join REMAX Altitud" prompt on click.

3. **Retain All Files**
   - We will NOT delete `market.html`, `Mi_Oficina.html`, `my-business.html`, or any Phase 2 files.
   - They remain in the codebase exactly as they are.
   - When a user is upgraded to REMAX Agent (`userRole = 'remax'`), the locks are removed and everything turns on instantly.
