# 📄 PHASE_11_GENEALOGY_INTEGRATION.md

## 1. Objective
Leverage the existing **Genealogy & Referral Engine** to drive community growth and coach attribution. This phase ensures that the "Lineage" of a participant is visually represented and socially functional within the new application. For the **50–70 demographic**, this turns "Referrals" into a high-trust "Invite a Friend" experience, maintaining the elite feel of the platform.

---

## 2. Social-Genealogy Linkage
The existing genealogy system (Durable Objects + D1) must now sync with the `memberships` and `teams` tables created in Phase 1.

*   **Attribution Logic:** When a new user joins via a **Coach's Referral Link**, the system must:
    1.  Create the user record.
    2.  Update the `genealogy` tree (Existing logic).
    3.  Automatically assign the user to that Coach's **Team** (`memberships` table).
*   **Coach "Upgrades":** If a Challenger upgrades to a Coach (Phase 8), the `parent_id` in the genealogy tree remains fixed, ensuring the original referring Coach retains their attribution for the "Study" metrics.

---

## 3. The "Elite" Referral Experience
For this demographic, "Referral Links" can feel like "Spam." We re-brand them as **"Personal Invitations."**

### 3.1 The Personal Invite Link
*   **Format:** `reset.app/invite/[coach-slug]` or `reset.app/join/[challenger-id]`.
*   **UI:** A high-contrast **Liquid Glass** card in the Profile tab.
*   **Action:** One-tap "Copy My Invitation" button with a **Gold Glow** effect.
*   **UX:** Uses the **Native Share API** on mobile so users can send their link directly to friends via text or WhatsApp with a pre-written, supportive message.

### 3.2 "My Reset Circle" (Social UI)
*   **The Component:** A dedicated "Circle" view within the Community tab.
*   **Logic:** Shows a list of users the participant has personally invited.
*   **Gamification:** A **Gold-500 Badge** awarded to users who have invited 3+ friends to the study.

---

## 4. Admin Tree Visualization
A requirement for the Admin Command Center to manage the "Study" growth.

*   **The View:** A hierarchical **Tree Map** (using `d3.js` or a simplified grid) showing the flow of challengers.
*   **Branding:** Dark mode Navy-950 background with **Gold-500 lines** connecting the nodes.
*   **Functionality:** Admins can click a node (User) to see their 28-day biometric progress, linking **Growth** to **Results**.

---

## 5. Technical Integration (D1 + Durable Objects)

### 5.1 Existing Logic Sync
The `GenealogyDurableObject` will emit a "New Node" event when a referral is successful. The **Social API (Phase 3)** listens for this to trigger a **Welcome Milestone** in the Team feed.

### 5.2 SQL Alignment
```sql
-- Ensuring the memberships table respects the referral lineage
ALTER TABLE memberships ADD COLUMN referred_by TEXT REFERENCES users(id);
```

---

## 6. Midnight Gold Referral Rewards
To encourage growth within the study without external messaging:

*   **The "Founding Member" Badge:** Any user who refers another participant during the "Pre-Launch" phase (Phase 12) receives a permanent **Liquid Glass Gold Badge** on their social profile.
*   **Coach Visibility:** Coaches can see their "Direct Lineage" count on their dashboard, styled as a **Gold-Glow Metric Ticker**.

---

## 7. AI Directive
When integrating the genealogy logic, the agent must ensure that the **Durable Object** responsible for the tree remains the "Single Source of Truth" to prevent race conditions during high-volume registration events. The frontend should use the **Shadcn "Share" component** to provide a familiar, accessible interface for seniors.

---

**This completes the 12-Phase Documentation Set. Every phase of the Metabolic Reset is now fully mapped and aligned.**
