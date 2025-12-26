# 📄 DESIGN_SYSTEM_MIDNIGHT_GOLD.md

## 1. Vision & Philosophy
The **Midnight Gold Elite** design system is crafted for a premium, high-trust "Concierge" experience. For the 50–70 age demographic, it prioritizes **visual weight**, **tactile confirmation**, and **uncompromising legibility**. It moves away from flat design toward a "Spatial" interface using **Apple Liquid Glass** effects to create a clear sense of depth and hierarchy.

---

## 2. Color Architecture (WCAG 2.1 AAA)

### 2.1 The Midnight Core (Dark Mode)
*   **Background (Base):** `#020617` (Navy-950)
*   **Surface (Cards):** `#0F172A` (Navy-900) with `bg-white/[0.04]` overlay.
*   **Elevated (Dialogs):** `#1E293B` (Navy-800).
*   **Accent (Primary):** `#F59E0B` (Gold-500).

### 2.2 The Stone Core (Light Mode)
*   **Background (Base):** `#FAFAF9` (Stone-50).
*   **Surface (Cards):** `#FFFFFF` (White) with subtle `shadow-soft`.
*   **Accent (Primary):** `#D97706` (Gold-600) for better contrast on light backgrounds.

### 2.3 Semantic Accents
*   **Success:** `#22C55E` (Green-500).
*   **Coach/Info:** `#3B82F6` (Blue-500).
*   **Warning/Action:** `#F59E0B` (Gold-500).

---

## 3. Typography & Readability
*   **Display/Headings:** `Montserrat` or `Cal Sans`.
    *   *Rule:* Tracking `-0.02em` for better legibility at large sizes.
*   **Body Text:** `Open Sans` or `Inter Variable`.
    *   *Min Size:* **18px (text-lg)** for all challenger content.
    *   *Line Height:* **1.6 (leading-relaxed)** to reduce eye fatigue.
*   **Font Feature Settings:** `"cv05", "cv08", "ss01"` (Ensures distinct characters for 1, l, I).

---

## 4. Liquid Glass & Spatial Effects

### 4.1 The Elite Glass Layer
Used for "Floating" navigation and team cards.
*   **CSS:** `bg-white/[0.04] backdrop-blur-xl border border-white/[0.18]`
*   **Shadow:** `shadow-[0_8px_32px_rgba(15,23,42,0.4),inset_0_0_0_2px_rgba(15,23,42,0.5)]`

### 4.2 The Gold Glow Border
Reserved for **Coach Posts** and **Active Habits**.
*   **Animation:** `glow-border` 4s ease infinite.
*   **Implementation:** A pseudo-element `::before` with a moving conic gradient of Gold-500 to Gold-300.

---

## 5. Interaction Design (Physics-Based)

### 5.1 The "Squishy" Button (Framer Motion)
Buttons must respond like physical objects to provide confidence to senior users.
*   **Hover:** `scale: 1.02`, `shadow-gold-glow`.
*   **Tap:** `scale: 0.95`, `vibrate: 10ms`.
*   **Transition:** `type: "spring", stiffness: 400, damping: 15`.

### 5.2 Confirmation Loops
*   **The "Check-in" Flow:** When a user logs a habit, the card "lifts" (Y: -4px) and a subtle **Gold Halo** pulse radiates once from the center.
*   **Celebration:** `canvas-confetti` trigger on 100% daily completion using Gold and Teal particles.

---

## 6. Device Mode & Toggles
The application respects `prefers-color-scheme` but provides a visible, high-contrast toggle.
*   **Midnight (Dark):** Default mode. Minimizes blue light for evening resets.
*   **Stone (Light):** High-noon mode. Optimized for visibility in direct sunlight during outdoor walks/steps tracking.
*   **Transition:** A **morphing SVG animation** between the Sun and Moon, taking 500ms to ensure the user's eyes adjust to the brightness shift.

---

## 7. Component Accessibility Rules
1.  **Hit Targets:** Minimum `48px x 48px` for all interactive elements.
2.  **Labeling:** Every icon MUST be accompanied by text (e.g., `[Icon] Like`, not just `[Icon]`).
3.  **Haptics:** Soft vibration on every successful biometric entry or social "Cheer."
4.  **No Gestures Only:** Every "Swipe" action must have a visible "Button" alternative.

---

**Next Phase: PHASE_05_REALTIME_DO.md (Real-time synchronization for the social ecosystem)**
