# 📄 PHASE_10_ENGAGEMENT.md

## 1. Objective
Establish an **In-App Only** engagement ecosystem that drives daily participation without relying on external noise (Email/SMS). For the **50–70 demographic**, this phase focuses on "Positive Gravity"—creating an environment where users feel a calm, consistent pull to return. We use **Social Proof**, **Physical Feedback**, and **Micro-Victories** to sustain momentum throughout the 28-day study.

---

## 2. Core Engagement Features (The "In-App Nudge" Logic)

### 2.1 The "Midnight Gold" Daily Streak Widget
*   **Visual Design:** A circular **Liquid Glass** progress ring on the main dashboard.
*   **The Logic:** Counts consecutive days of 100% habit completion.
*   **2025 UX:** Instead of a simple number, use **3D "Inflated" Gold Nodes**. As the streak grows, the nodes glow more intensely using the `glow-border` animation.
*   **The "Safety Net":** Once per 28 days, users can use a "Grace Day" to maintain their streak.
    *   *Reasoning:* Seniors value consistency but find rigid "streak-breaking" mechanics discouraging.

### 2.2 Global Progress Pulse (Social Proof)
*   **The Component:** A horizontal, slow-scrolling ticker at the top or bottom of the screen.
*   **The Logic:** Powered by the **Durable Object (Phase 5)** to show real-time, anonymized community wins.
*   **Examples:**
    *   *"242 Resetters just completed their morning walk."*
    *   *"Team Gold has reached 50,000 combined steps today!"*
*   **Style:** **Navy-900** background with **Gold-400** text and subtle **Glassmorphism** blur.

### 2.3 Contextual "Smart Banners"
*   **The Logic:** Reactive UI that changes based on missing logs.
*   **Implementation:**
    *   *Morning:* "Welcome back! Ready to track your first glass of water?"
    *   *Afternoon (Incomplete):* "You're 2 habits away from a Perfect Day. You've got this!"
    *   *Evening (Complete):* "Perfect Day achieved! See you tomorrow for Day [X]."
*   **Styling:** High-contrast **Gold-500** border with large, touch-friendly `[ Track Now ]` buttons.

---

## 3. Physical Feedback & Micro-Interactions

### 3.1 The "Success" Snap
When a user toggles a habit to "Complete":
*   **Animation:** The checkbox scales up (1.2), rotates slightly, and "snaps" into place with a **Gold-to-Teal gradient shift**.
*   **Haptics:** A single, sharp 15ms vibration (using `navigator.vibrate`) to mimic the feeling of a physical "click."

### 3.2 Celebration Engine (Confetti)
*   **Trigger:** 4/4 Habits completed.
*   **Execution:** Use `canvas-confetti`.
*   **Midnight Gold Palette:** Gold (`#F59E0B`), Navy (`#0F172A`), and Teal (`#0F766E`) particles only.
*   **Constraint:** Particles should clear quickly (within 2 seconds) to avoid obscuring the dashboard content.

---

## 4. In-App Notification Center (The "Activity" Tab)
A centralized place for social and study updates, replacing the need for push notifications or emails.

*   **Logic:** Stores the last 50 events (Likes, Coach Pins, Milestone Shares).
*   **UI:** Large-card list view with **Glassmorphism** headers.
*   **Badge Logic:** A single **Gold Dot** appears on the "Activity" icon in the navigation bar when new coach-instructions are available.

---

## 5. Technical Implementation (TanStack & Zustand)

```typescript
// Zustand State for Nudges
interface EngagementStore {
  dailyProgress: number; // 0 to 1
  streakCount: number;
  activeNudge: string | null;
  setNudge: (message: string) => void;
  triggerCelebration: () => void;
}
```

*   **Real-time Updates:** The **Durable Object** pushes "Pulse" updates via WebSocket. The frontend updates the ticker without a full page re-render.
*   **Edge Caching:** Daily Streaks are calculated at the edge in D1 to ensure the dashboard loads in <200ms globally.

---

## 6. Accessibility & Cognitive Load
1.  **Motion Preference:** If `prefers-reduced-motion` is active, replace the confetti and pulses with a simple **High-Contrast "Success" Badge**.
2.  **No Pressure:** Avoid countdown timers. Use "Progressive Language" (e.g., *"You're doing great"*) rather than "Urgency Language" (e.g., *"Hurry, only 2 hours left"*).
3.  **Color Blindness:** Use distinct shapes (Checkmark vs. Circle) alongside colors for goal states.

---

**Next Phase: PHASE_11_GENEALOGY_INTEGRATION.md (The Lifecycle Toggle & Archiving Engine)** — *Shall I proceed?*
