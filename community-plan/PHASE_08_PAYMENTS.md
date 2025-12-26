# 📄 PHASE_08_PAYMENTS.md

## 1. Current Implementation Status
> **✅ IMPLEMENTED:** The core payment infrastructure for the 28-Day Challenge is already built and operational. Stripe Checkout, webhook provisioning, and role assignment are functional in the existing codebase.

This phase focuses on **extending** the existing payment system to support **post-challenge monetization**—allowing Challengers to continue participating in the community and tracking their activity after the initial 28 days.

---

## 2. Existing Tiered Access Model (Already Implemented)

| Role | Price | Access Level | Status |
| :--- | :--- | :--- | :--- |
| **Challenger** | $28.00 | 28-Day Study access, Team Feed, Habit Tracking. | ✅ Live |
| **Coach** | $49.00 | Team Management, Post Pinning, Genealogy/Referral tools. | ✅ Live |

---

## 3. Post-Challenge Monetization (NEW)

### 3.1 The "Continue" Subscription Model
After Day 28, Challengers are offered the opportunity to maintain access:

| Tier | Price | Access Level |
| :--- | :--- | :--- |
| **Alumni (Monthly)** | $9.99/mo | Community Feed, Habit Tracking, Team Access (read-only unless upgraded). |
| **Alumni (Annual)** | $79.99/yr | Same as monthly + Priority Coach Q&A access. |
| **Lifetime Reset** | $199.00 | Permanent access to all future Resets and Community features. |

### 3.2 Implementation Gaps to Address
*   **Subscription Mode:** Current Stripe integration uses one-time payments. Must add `mode: 'subscription'` for Alumni tiers.
*   **Grace Period:** After Day 28, users should have a **7-day grace window** to decide before losing Community access.
*   **Downgrade Flow:** If a user cancels, they retain read-only access to their historical data but lose posting/tracking privileges.

---

## 4. Schema Extensions Required (D1)

```sql
-- Extend subscription_status to include alumni states
ALTER TABLE users ADD COLUMN membership_tier TEXT CHECK(membership_tier IN ('challenger', 'alumni_monthly', 'alumni_annual', 'lifetime', 'expired'));
ALTER TABLE users ADD COLUMN challenge_end_date DATETIME;
ALTER TABLE users ADD COLUMN grace_period_end DATETIME;
```

---

## 5. Post-Challenge UI Triggers

### 5.1 The "Day 28" Transition Modal
*   **Trigger:** When `challenge_end_date` is reached.
*   **UI:** A **Liquid Glass** celebration modal congratulating the user.
*   **CTA Options:**
    *   `[ Continue My Journey - $9.99/mo ]` — Gold primary button.
    *   `[ Go Annual & Save ]` — Secondary outline button.
    *   `[ I'll Decide Later ]` — Subtle text link (starts grace period).

### 5.2 Grace Period Nudges
*   **Day 1-3:** Subtle in-app banner: *"Your Reset access ends in X days. Continue your progress?"*
*   **Day 4-6:** More prominent notification with Gold glow.
*   **Day 7:** Final "Last Chance" modal before read-only mode.

---

## 6. Webhook Extensions
The existing Stripe webhook handler needs to support:
*   `customer.subscription.created` — Activate Alumni tier.
*   `customer.subscription.updated` — Handle plan changes.
*   `customer.subscription.deleted` — Transition to `expired` state.
*   `invoice.payment_failed` — Trigger "Payment Issue" in-app notification.

---

## 7. Admin Dashboard Additions
*   **Conversion Metrics:** "Day 28 → Alumni Conversion Rate."
*   **Churn Tracking:** Users who let grace period expire.
*   **Lifetime Value (LTV):** Average revenue per Challenger over time.
*   **Manual Extensions:** Ability to grant additional grace days for edge cases.

---

## 8. AI Directive
When extending the payment system, ensure backward compatibility with existing one-time payment users. The Alumni subscription flow must **not** disrupt active 28-Day Challengers. Use feature flags to roll out the post-challenge monetization gradually.

---

**Next Phase: PHASE_09_PRIVACY_SECURITY.md (Compliance & Biometric Safety)** — *Shall I proceed?*
