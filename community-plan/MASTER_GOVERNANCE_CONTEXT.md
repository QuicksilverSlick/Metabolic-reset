# 📖 MASTER_GOVERNANCE_CONTEXT.md

## 1. Project Identity & Soul
*   **Project Name:** Metabolic Reset (28-Day Challenge)
*   **Target Demographic:** Seniors aged 50–70 (Requires high-contrast UI, large touch targets, simplified navigation).
*   **Core Logic:** A structured "Study" where challengers track 4 daily habits and weekly biometrics.
*   **Branding Theme:** "Midnight Gold Elite" (Navy-950, Gold-500, Apple-style Liquid Glass effects).
*   **Engagement Strategy:** **In-App Only.** No external Email/SMS. The app must be the sole destination for community and nudges.
*   **Push Notifications:** ✅ **Implemented and allowed.** Web Push (VAPID) is an in-app mechanism that respects user preferences. Push notifications are NOT the same as external Email/SMS and are permitted for:
    - Coach pin alerts
    - Bug report responses
    - System announcements
    - Achievement celebrations

## 2. Technical Stack (The "Cloudflare Native" Rule)
Any AI agent generating code must strictly adhere to:
*   **Backend:** Cloudflare Workers + Hono.js.
*   **Database:** Hybrid Architecture (see Section 2.1).
*   **State/Real-time:** Cloudflare Durable Objects.
*   **Storage:** Cloudflare R2 (Screenshots/Images).
*   **Video:** Cloudflare Stream (Direct Creator Uploads).
*   **Frontend:** React 18 + Vite + Tailwind CSS + Shadcn UI + Framer Motion.
*   **Type Safety:** Shared types in `@/shared` must be used for both Frontend and Backend.

### 2.1 Hybrid Storage Architecture
The application uses a **hybrid storage approach** combining existing Durable Objects with new D1 tables:

#### Existing Infrastructure (Durable Objects - Do Not Modify)
*   `UserEntity` - User profiles, authentication, Stripe data
*   `ResetProjectEntity` - Challenge/community metadata
*   `ProjectEnrollmentEntity` - User participation, team assignments
*   `DailyScoreEntity`, `WeeklyBiometricEntity` - Habit & biometric tracking
*   `NotificationEntity`, `PushSubscriptionEntity` - Notification system
*   `ReferralLedgerEntity`, `PointsLedgerEntity` - Genealogy & points
*   All other existing entities (26 total)

#### New Infrastructure (D1 Database - Social Features)
*   `community_posts` - Social feed content
*   `post_comments` - Comment threads
*   `post_likes` - Like tracking
*   `teams` - Accountability pods (extends existing group concept)
*   `moderation_logs` - Admin moderation audit trail

#### Bridge Pattern
Posts store `user_id` referencing DO `UserEntity`. The API enriches post data with:
*   Author name, avatar from `UserEntity`
*   Author role from `ProjectEnrollmentEntity`
*   Batched lookups for efficiency

---

## 3. The 12-Phase Roadmap & Documentation Mapping
This table tells the AI agent which `.md` file governs which phase of the project.

| Phase | Focus Area | Governing Document | Status |
| :--- | :--- | :--- | :--- |
| **0** | **Governance** | `MASTER_GOVERNANCE_CONTEXT.md` | **ACTIVE** |
| **1** | **Data & Teams** | `PHASE_01_DATA_ARCH.md` | Ready |
| **2** | **Media Pipeline** | `PHASE_02_MEDIA_PIPELINE.md` | Ready |
| **3** | **Social API** | `PHASE_03_SOCIAL_API.md` | Ready |
| **4** | **Branding & UI** | `DESIGN_SYSTEM_MIDNIGHT_GOLD.md` | **CORE TRUTH** |
| **5** | **Real-Time (DO)** | `PHASE_05_REALTIME_DO.md` | Ready |
| **6** | **Moderation/Admin**| `PHASE_06_ADMIN_MODERATION.md` | Ready |
| **7** | **Optimization** | `PHASE_07_OPTIMIZATION_LAUNCH.md` | Ready |
| **8** | **Monetization** | `PHASE_08_PAYMENTS.md` | Partial* |
| **9** | **Compliance** | `PHASE_09_PRIVACY_SECURITY.md` | 🔴 HIGH PRIORITY |
| **10** | **In-App Nudges** | `PHASE_10_ENGAGEMENT.md` | Ready |
| **11** | **Genealogy** | `PHASE_11_GENEALOGY_INTEGRATION.md` | Partial** |
| **12** | **Lifecycle** | `PHASE_12_CHALLENGE_CONTROL.md` | Ready |

*\*Phase 8: Core payment infrastructure exists; document focuses on post-challenge Alumni monetization.*
*\*\*Phase 11: Genealogy logic exists in the current repo; document governs integration into the new Social API.*

### December 2025 Updates Applied
- **Phase 1:** Added existing secondary index patterns and D1 location hints
- **Phase 3:** Added reference to existing Hono API patterns in `worker/index.ts`
- **Phase 5:** Added WebSocket Hibernation requirement and `CommunityDurableObject` spec
- **Phase 9:** Flagged as HIGH PRIORITY with security gap inventory
- **Phase 10:** Added TanStack Query pattern references

---

## 4. AI Agent Operating Directives
When tasked with development, the Agent must follow these rules:

1.  **Accessibility First:** Every UI component must have `aria-labels`, high contrast ratios, and `text-lg` (18px) as the minimum body font size.
2.  **State Management:** Use `Zustand` for UI state and `TanStack Query` for server state. Never "over-fetch" data.
3.  **Haptic/Visual Feedback:** Every "Post," "Like," or "Log" action must include a Framer Motion animation (scale-down 0.95) and a "Success" state.
4.  **No Ghosting:** Use Durable Objects for any "Live" feature (presence, cheer, live ticker). The app should never feel empty.
5.  **Refactoring Awareness:** Refer to `REFACTORING_PLAN.md` before changing core database schemas to avoid breaking the existing Alpha build.

---

## 5. Directory Navigation for AI
*   `/src/components/ui`: Shadcn base components.
*   `/src/features`: Complex feature-specific components (Social, Tracking, Biometrics).
*   `/src/server`: Hono.js worker logic.
*   `/src/shared`: Shared TypeScript interfaces (The Single Source of Truth for Data).
*   `.claude/prompts`: Context-specific prompt engineering for this project.

---

## 6. Current Priority
**The Agent is currently tasked with initializing Phase 1 (Data Architecture for Teams and Social) while respecting the Midnight Gold Design System.**

*Agent: Acknowledge this context by stating "Midnight Gold Context Received" before starting any task.*
