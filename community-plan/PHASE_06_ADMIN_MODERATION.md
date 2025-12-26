# 📄 PHASE_06_ADMIN_MODERATION.md

## 1. Objective
Establish the "Safety Shield" of the Metabolic Reset. For the **50–70 demographic**, maintaining a supportive, scam-free, and respectful environment is the primary driver of trust. This phase implements **AI-driven automated moderation** and a comprehensive **Admin Command Center** to manage the community without the need for 24/7 manual policing.

---

## 2. AI-Automated Moderation (Cloudflare AI Workers)
We will implement an "Invisible Guardrail" that runs every time a post or comment is submitted.

### 2.1 Text Content Filtering
*   **Engine:** `@cloudflare/ai` using the `llama-3` or `mistral-7b-instruct` model.
*   **Logic:** Posts are scanned for:
    *   **Toxicity/Aggression:** Identifying "unsupportive" behavior.
    *   **Medical Red Flags:** Scanning for keywords like "insulin," "pills," or "fasting" that might require a coach's intervention rather than peer advice.
    *   **Action:** If a risk score > 0.8 is detected, the post is automatically flagged as `pending_review` and hidden from the feed.

### 2.2 Image Safety Scanning
*   **Engine:** Cloudflare AI Vision models.
*   **Logic:** Scans R2-bound images for inappropriate content or non-health-related spam.
*   **Result:** Prevents accidental or intentional disruptive imagery from reaching the demographic.

---

## 3. The Admin Command Center
A high-privilege UI route (`/admin/community`) built with **Midnight Gold Elite** styling, but optimized for data density.

### 3.1 Global Moderation Queue
*   **View:** A "Priority List" of posts flagged by AI or reported by users.
*   **Actions:**
    *   **[Approve]:** Clears the flag and restores visibility.
    *   **[Shadow Hide]:** Post remains visible *only* to the author (prevents confrontation).
    *   **[Delete]:** Moves to the `moderation_logs` (Phase 1 soft-delete).

### 3.2 The "Coach Broadcast" Tool
Coaches need to speak to all their teams simultaneously without friction.
*   **UI:** A "Gold-Standard" text editor.
*   **Logic:** A single `POST` that replicates the message across all `team_ids` assigned to that Coach.
*   **Branding:** Broadcasts are styled with the **Liquid Glass** effect and a **Double-Gold Border** to indicate "Official Instruction."

---

## 4. User Reporting Flow
Seniors are proactive protectors of their communities. We make "Flagging" easy and non-punitive.

1.  **Trigger:** User clicks a large "Report" button on a post.
2.  **UX:** A **Bottom Drawer** (Shadcn) appears with 3 simple options: "Spam," "Unkind," "Dangerous Advice."
3.  **Feedback:** Immediate high-contrast message: *"Thank you. Our coaches have been notified."*
4.  **Instant Action:** The post is hidden from *the reporting user's* view immediately via local state (Zustand) to reduce their stress.

---

## 5. Medical Disclaimer Injection
To protect the study's legal integrity, the API will "inject" disclaimers into specific content types.

*   **Logic:** Any post tagged with `contentType: 'milestone'` or posted by a Coach will automatically have a small-print footer appended in the UI.
*   **Copy:** *"Disclaimer: This is for informational purposes only as part of the Metabolic Reset study. Consult your physician before changing medication."*

---

## 6. Moderation SQL Schema (D1)
```sql
CREATE TABLE moderation_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT REFERENCES users(id),
  target_user_id TEXT REFERENCES users(id),
  post_id TEXT REFERENCES community_posts(id),
  action_taken TEXT CHECK(action_taken IN ('hide', 'delete', 'warn', 'restore')),
  reason TEXT,
  ai_risk_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Midnight Gold Admin UI Guidelines
*   **Danger Zones:** Buttons for "Delete" or "Ban" use a **Deep Crimson** variant of the theme (`#991B1B`) but maintain the **Liquid Glass** blur to stay consistent.
*   **Risk Indicators:** AI risk scores are displayed as a **Gold-to-Red Gradient** progress bar.
*   **Consistency:** Use the same `font-display` (Montserrat) for Admin headers to maintain the "Elite" brand feeling even in back-office tools.

---

**Next Phase: PHASE_08_PAYMENTS.md (The "Paywall" & Role Provisioning Engine)**
