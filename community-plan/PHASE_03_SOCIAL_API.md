# 📄 PHASE_03_SOCIAL_API.md

## 1. Objective
Develop the core "brain" of the social ecosystem using **Hono.js** and **Cloudflare Workers**. This API manages the flow of content between the **D1 Database** and the **Midnight Gold Elite** frontend. The focus is on high-performance delivery of "Unified Feeds" (Global + Team content) and ensuring strict security so that users only see the data relevant to their specific accountability pod.

---

## 2. API Route Map (Hono)

All routes are protected by a `verifySession` and `checkMembership` middleware.

### 2.1 Feed Management
*   **`GET /api/v1/social/feed`**
    *   **Purpose:** Retrieves a unified scroll of content.
    *   **Logic:** Joins `community_posts` with `users` and `memberships`.
    *   **Filter:** `(visibility = 'global') OR (team_id = user.team_id)`.
    *   **Pagination:** Cursor-based (`?cursor=timestamp`).
*   **`GET /api/v1/social/teams/:teamId/feed`**
    *   **Purpose:** Exclusive view for small-group "Accountability Pods."

### 2.2 Post Interactions
*   **`POST /api/v1/social/posts`**
    *   **Payload:** `{ body, mediaUrl, contentType, visibility }`.
    *   **Constraint:** If `visibility === 'team'`, `team_id` is automatically injected from the user's session.
*   **`POST /api/v1/social/posts/:id/like`**
    *   **Logic:** Atomic toggle. Updates `likes_count` in the posts table and inserts/deletes from `post_likes`.
*   **`POST /api/v1/social/posts/:id/comment`**
    *   **Payload:** `{ body }`. Increments `comment_count`.

---

## 3. Cursor-Based Pagination Logic
To maintain the "TikTok-style" smooth scroll for seniors, we avoid page numbers. Cursors prevent content "jumping" when new posts are added.

```typescript
// Example SQL logic for Hono
const posts = await c.env.DB.prepare(`
  SELECT p.*, u.display_name, u.avatar_url,
  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
  (SELECT EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?)) as is_liked
  FROM community_posts p
  JOIN users u ON p.user_id = u.id
  WHERE (p.community_id = ? AND p.visibility = 'global')
     OR (p.team_id = ?)
  AND p.created_at < ?
  ORDER BY p.created_at DESC
  LIMIT 20
`).bind(userId, communityId, teamId, cursor).all();
```

---

## 4. Milestone Integration (The "Tracker-to-Feed" Bridge)
One of the most important features for engagement is the automatic generation of **Milestone Posts**.

*   **Trigger:** When a user completes a 7-day streak or reaches a weight-loss goal in the main tracker.
*   **Logic:** The API creates a post with `content_type = 'milestone'`.
*   **Data Payload:** Includes specific metadata (e.g., `{ "milestone_type": "water_streak", "value": 7 }`).
*   **UI Result:** The frontend renders this using the **Gold Glow Celebration** card.

---

## 5. Security & RBAC (Role-Based Access Control)
*   **Challenger:** Can post to their Team feed and view the Global feed. Cannot delete others' posts.
*   **Coach:** Can "Pin" posts to their Team feed. Can delete any post within their assigned Team.
*   **Admin:** Global delete power. Can "Pin" to the Global feed. Access to the Lifecycle Toggles (Phase 12).

---

## 6. Error Handling: "Actionable Messages"
Standard JSON errors are intercepted and transformed into senior-friendly text for the UI:
*   **401:** "Your session has expired. Please log in again to share your update."
*   **403:** "You don't have permission to post in this group."
*   **Payload Too Large:** "This video is too large. Try a shorter clip or a photo instead."

---

## 7. Midnight Gold Alignment
*   **Optimistic UI Responses:** The API is designed to return the newly created object immediately so the frontend can "fake" a successful post/like instantly using **TanStack Query**.
*   **Haptic Triggers:** Responses for "Likes" and "Milestones" include a `trigger_celebration: true` flag to tell the frontend to fire the **Confetti Engine**.

---

**Next Phase: DESIGN_SYSTEM_MIDNIGHT_GOLD.md (The Comprehensive UI/UX Blueprint)** — *Shall I proceed?*
