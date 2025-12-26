# 📄 PHASE_12_CHALLENGE_CONTROL.md

## 1. Objective
Establish the **Lifecycle Management Engine** for the Metabolic Reset. This phase provides Admins with the "Master Switches" to control the visibility and interactivity of communities as they progress from pre-launch to completion. For the **50–70 demographic**, this ensures the app transitions smoothly into a "Library of Success" (Archive) once the 28 days are over, preserving their data while preventing the clutter of an abandoned social feed.

---

## 2. Community Lifecycle States
Each project/community in the `communities` table will be governed by one of the following states, toggled by the Admin:

| State | Visibility (Challenger) | Permissions | UI Behavior |
| :--- | :--- | :--- | :--- |
| **`pre-launch`** | Invisible | None | Admin/Coach prep only. |
| **`active`** | Full Access | Post, Like, Comment | Active tracking and social engagement. |
| **`concluding`**| Full Access | Comments Only | Posting disabled; "Wrap-up" celebration mode. |
| **`archived`** | Read-Only | View Only | Social feed locked; 28-day history preserved. |
| **`private`** | Invisible | None | Hidden from all except Admin records. |

---

## 3. Admin "Mass Toggle" Dashboard
A high-control UI within the Admin Command Center using the **Midnight Gold Elite** glassmorphism style.

### 3.1 The Lifecycle Control Card
*   **The Switch:** A large, high-contrast dropdown or segmented control (Shadcn Tabs).
*   **Action Logic:** When the state is changed to `archived`, the API performs a **Mass Access Update**.
*   **Safety Lock:** Changing a community to `archived` or `private` requires a "Double Confirmation" modal to prevent accidental disruption of an active study.

### 3.2 Automated Transition Messages
When the Admin flips the switch to `concluding` or `archived`:
*   **Trigger:** The **Durable Object (Phase 5)** pushes a final "Closing Ceremony" notification.
*   **Content:** *"Congratulations! The 28-Day Reset has concluded. Your results are now available in your Profile, and the community has been moved to the Archive."*

---

## 4. The "Alumni" View (Post-Challenge UX)
Once a community is archived, the frontend logic shifts to preserve the value of the participant's $28/49 investment.

*   **Social Feed Lock:** The "New Post" button disappears. The "Like" and "Comment" buttons are replaced with static icons (displaying the final counts).
*   **The "Study Summary" Card:** A new **Liquid Glass** card appears at the top of the feed summarizing the collective wins of the team (e.g., *"Together, Team Gold lost 42 lbs and walked 1.2 million steps!"*).
*   **Searchable History:** Challengers can still scroll back to see Coach instructions and their own biometric milestones.

---

## 5. Technical Implementation (API & Middleware)

### 5.1 Access Control Middleware
The Hono server will include a middleware check for every social write-action:
```typescript
async function restrictToActive(c, next) {
  const communityStatus = await getCommunityStatus(c.req.param('id'));
  if (communityStatus !== 'active' && c.req.method === 'POST') {
    return c.json({ error: "This community is now in read-only mode." }, 403);
  }
  await next();
}
```

### 5.2 SQL Snapshot (D1)
Ensuring the `status` is correctly indexed for fast filtering:
```sql
CREATE INDEX idx_community_status ON communities(status);
```

---

## 6. Future Capability: The "Day 29" Transition
*Note for Future Development Phases:*

While the current requirement focuses on Archiving, the architecture is prepared for a **"Maintenance Phase."**
*   **The Vision:** On Day 29, users are offered a "Subscription Renewal" to move from the Archived challenge into a **"Permanent Alumni Community."**
*   **Integration:** This will link with the **Genealogy System (Phase 11)** to ensure referring Coaches continue to receive credit for their long-term alumni.

---

## 7. Midnight Gold Alignment
*   **The "Archive" Badge:** Archived communities are labeled with a subtle **Slate-500** pill badge with a **Gold Padlock** icon.
*   **Visual Continuity:** Even in Archive mode, the **Midnight Gold** aesthetic remains, ensuring the user's "History of Success" looks elite and valuable forever.

---

**Next Steps:** This concludes the mapping of the 12-Phase Development Plan. All governing documents are now established for the AI Agent to begin implementation of the **Metabolic Reset Social Ecosystem**.
