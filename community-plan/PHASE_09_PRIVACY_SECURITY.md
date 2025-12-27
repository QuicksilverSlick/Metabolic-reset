# 📄 PHASE_09_PRIVACY_SECURITY.md

> ## 🔴 HIGH PRIORITY - COMPLIANCE CRITICAL
>
> This phase contains **GDPR/CCPA compliance requirements** that should be implemented early.
>
> ### Current Security Gaps (Must Address)
> | Gap | Risk Level | Status |
> |-----|------------|--------|
> | `X-User-ID` header forgeable | 🔴 Critical | Not implemented |
> | `consentTimestamp` on User | 🟡 High | Missing from schema |
> | `consentVersionId` on User | 🟡 High | Missing from schema |
> | Biometric vault (private R2) | 🟡 High | Not implemented |
> | "Right to be Forgotten" UI | 🟡 High | Not implemented |
> | Data export PDF generation | 🟢 Medium | Not implemented |
>
> ### Recommended Implementation Order
> 1. Add consent fields to User entity (before community launch)
> 2. Implement consent gate modal (registration flow)
> 3. Upgrade auth to signed sessions (before community launch)
> 4. Build biometric vault with signed URLs
> 5. Implement data deletion workflow

---

## 1. Objective
Establish a "Fortress of Trust" for sensitive biometric data. Given the **Metabolic Reset** involves tracking weight, body fat, and metabolic age, this phase ensures that participants (Ages 50–70) feel their data is handled with concierge-level security. We implement strict data isolation, private media storage, and the **"Physician's Report"** data-export feature.

---

## 1.1 Authentication Security Upgrade

> ⚠️ **CRITICAL:** Current auth uses `X-User-ID` header which is easily forgeable.

**Required Before Community Launch:**
```typescript
// Current (INSECURE)
const userId = c.req.header('X-User-ID');

// Required (SECURE)
const session = await verifySignedSession(c.req.header('Authorization'));
const userId = session.userId;
```

**Options:**
1. **JWT with HMAC-SHA256** - Signed tokens with expiry
2. **Cloudflare Access** - Zero-trust identity verification
3. **Session cookies** - HttpOnly, Secure, SameSite=Strict

---

## 2. Biometric Data Isolation (R2 Privacy)

Unlike social images, **Biometric Validation Photos** (screenshots of smart scales) are strictly private.

*   **Private R2 Bucket:** Create a separate R2 bucket (e.g., `biometric-vault`) with **Public Access Disabled**.
*   **Access Logic:**
    *   Photos are only accessible via a Hono Worker proxy that verifies the `user_id` or `assigned_coach_id`.
    *   The Worker generates a **Time-Limited Signed URL** (expires in 60 seconds) for viewing.
*   **Metadata:** Biometric records in D1 do not store raw filenames; they store hashed references to prevent data scraping.

---

## 3. Informed Consent & Onboarding (Section 1.1)

To comply with study protocols and build trust, the registration flow includes a mandatory "Consent Gate."

*   **The Component:** A **Midnight Gold** styled modal using `backdrop-blur-xl`.
*   **Typography:** Large, readable text explaining:
    1.  What data is collected.
    2.  Who sees it (Coach + Admin only).
    3.  How to withdraw (The "Right to be Forgotten").
*   **The Action:** A high-contrast Gold button: `[ I Consent to the Study ]`.
*   **Audit Trail:** The `users` table logs the `consent_timestamp` and `consent_version_id`.

---

## 4. The "Physician's Report" (Data Portability)

A core value proposition for the 50–70 demographic is the ability to share their reset results with their doctor.

*   **The Feature:** A "Download My Results" button in the Profile tab.
*   **Technical Implementation:**
    *   Worker fetches the user's 28-day biometric history from D1.
    *   Generates a clean, professional **PDF/HTML Report**.
    *   **Branding:** White-background, high-contrast, printer-friendly version of the **Midnight Gold Elite** aesthetic.
*   **Data Included:** Weight trends, metabolic age improvement, habit consistency percentages, and a "Notes" section for their physician.

---

## 5. "The Right to be Forgotten" (GDPR/CCPA Principles)

Seniors value the ability to "Clear the Slate."

*   **Requirement:** A visible "Delete My Data" section in Settings.
*   **Safety Logic:**
    1.  User clicks Delete -> A **60-second "Cool Down" timer** appears (preventing accidental clicks).
    2.  Verification: User must type their email to confirm.
    3.  **Hard Purge:** The Worker deletes all records from `biometric_data`, `community_posts`, and `memberships`, and removes media from R2.

---

## 6. Security Schema (D1)

```sql
CREATE TABLE biometric_vault_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  access_type TEXT CHECK(access_type IN ('upload', 'view', 'export')),
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN biometric_access_token TEXT; -- For internal proxy validation
```

---

## 7. Midnight Gold Trust Signals
*   **Encryption Badge:** Use a **Slate-400** shield icon in the footer: *"Your health data is encrypted at the edge."*
*   **Privacy Indicator:** When a user is on the Biometric tab, show a small **Gold Padlock** icon: *"This view is private to you and your coach."*
*   **Login Alerts:** If a login occurs from a new device, show an **In-App-Only Alert** on the dashboard.

---

**Next Phase: PHASE_10_ENGAGEMENT.md (In-App Nudges, Streaks & Progress Pulse)** — *Shall I proceed?*
