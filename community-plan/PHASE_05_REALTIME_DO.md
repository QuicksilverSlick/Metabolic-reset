# 📄 PHASE_05_REALTIME_DO.md

## 1. Objective
Transform the "Metabolic Reset" from a static tracking tool into a living, breathing social ecosystem using **Cloudflare Durable Objects (DO)**. This phase focuses on real-time synchronization, presence tracking, and high-speed interaction (likes/cheers) to ensure the app feels inhabited and responsive—critical for the emotional engagement of the **50–70 demographic**.

---

## 1.1 Implementation Priority (Phased Approach)

> **RECOMMENDATION:** Ship social features first with MVP real-time, then enhance.

### MVP (Ship First - No WebSockets Required)
The 50-70 demographic does not expect TikTok-level real-time. These features provide perceived "liveness" without WebSocket complexity:

| Feature | Implementation | User Perception |
|---------|----------------|-----------------|
| **"X users online"** | Polling every 60 seconds via REST | Feels live |
| **Coach Pin alerts** | Push notification (already implemented) | Immediate awareness |
| **New posts indicator** | TanStack Query `refetchInterval: 30000` | "3 new posts" button |
| **Like feedback** | Optimistic UI with D1 write | Instant response |

### Phase 2 (Post-Launch Enhancement)
Add WebSocket infrastructure after social features are validated:

| Feature | Benefit | Complexity |
|---------|---------|------------|
| **WebSocket presence** | True real-time user count | Medium |
| **Live Cheers** | Floating hearts animation | Medium |
| **Write-behind buffering** | Cost optimization for viral likes | High |

### Why This Order?
1. **Push notifications already work.** Coach pins can alert users immediately via existing infrastructure.
2. **Polling is imperceptible.** A 30-60 second refresh interval feels "live" to seniors.
3. **WebSocket debugging is complex.** Hibernation, reconnection, and state recovery add risk.
4. **Measure before optimizing.** Validate social engagement before investing in real-time infrastructure.

---

## 2. Durable Object Architecture (Phase 2)
We will implement a **`CommunityDurableObject`** class. Each active Community/Team gets its own DO instance to manage state and WebSocket connections at the edge.

### 2.1 The "Heartbeat" (Presence)
*   **Logic:** When a user opens the "Community" or "Team" tab, the frontend establishes a WebSocket connection to the corresponding DO.
*   **State:** The DO maintains an in-memory map of `activeUsers`.
*   **Broadcast:** Every 30 seconds (or when someone joins/leaves), the DO broadcasts the "Active Now" count to all connected clients.
*   **UI Result:** A subtle **Gold Pulse** indicator at the top of the feed: *"Coach Sarah and 12 others are active now."*

### 2.2 Real-Time Interaction (The "Cheer" System)
To avoid database write fatigue, "Cheers" (ephemeral high-fives or hearts) are handled entirely within the DO.
*   **Flow:** User taps "Cheer" -> WebSocket message sent to DO -> DO broadcasts "Cheer" event to all clients in that team.
*   **UI Result:** A floating **Gold Heart** animation (Framer Motion) drifts up the screen for all active users, providing immediate social proof without cluttering the D1 database.

---

## 3. Write-Behind Buffering (Efficiency)
To optimize D1 database costs and maintain the "Midnight Gold" snappiness, we use the DO as a write-buffer for "Likes."

1.  **Interaction:** User clicks "Like."
2.  **Immediate Feedback:** UI updates optimistically (Gold heart turns solid).
3.  **DO Storage:** The DO increments the like count in its own persistent storage (`this.storage.put()`).
4.  **Batch Flush:** Every 60 seconds, the DO flushes the aggregated counts to the **D1 Database** in a single SQL transaction.
5.  **Benefit:** 1,000 viral likes result in only **1** D1 write instead of 1,000.

---

## 4. In-App Notification Broadcaster
Since we are avoiding external Email/SMS, the DO is the primary engine for **In-App Nudges**.

*   **Coach "Pin" Alert:** When a Coach pins a post, the Worker notifies the DO. The DO immediately pushes a message to all active WebSockets.
*   **UI Toast:** A **Midnight Gold** styled notification appears: *"Coach Dave just pinned today's instructions. Tap to view."*
*   **Global Ticker:** The DO can push "Global Wins" (e.g., *"Team Blue just hit 100,000 steps combined!"*) to create a sense of collective movement.

---

## 5. WebSocket Protocol Definition
Communication between the React frontend and the Durable Object will follow this JSON structure:

```typescript
type IncomingMessage =
  | { type: 'JOIN_TEAM'; teamId: string }
  | { type: 'SEND_CHEER'; icon: string }
  | { type: 'POST_LIKE'; postId: string };

type OutgoingMessage =
  | { type: 'PRESENCE_UPDATE'; count: number; activeCoaches: string[] }
  | { type: 'LIVE_CHEER'; userId: string; icon: string }
  | { type: 'LIVE_NOTIFICATION'; title: string; body: string; link: string };
```

---

## 6. Midnight Gold UI Integration

### 6.1 The "Active Now" Indicator
*   **Styling:** A small green dot with a **Gold Glow Ping** animation (`animate-ping`).
*   **Text:** High-contrast Slate-300 text.

### 6.2 The "Live Feed" Animation
When a new post is detected by the DO while the user is viewing the feed:
*   **UI:** A "New Posts Available" button appears at the top.
*   **Style:** **Liquid Glass** effect with a Gold border.
*   **UX:** We **never** auto-scroll the user to the top (which confuses seniors); we provide the button so they have control.

---

## 7. AI Directive
When implementing the Durable Objects, ensure that **Alarm API** is used for the "Batch Flush" logic to ensure that even if the DO is evicted from memory, the pending likes are eventually written to the D1 database.

---

**Next Phase: PHASE_06_ADMIN_MODERATION.md (The Shield and Control Center)**
