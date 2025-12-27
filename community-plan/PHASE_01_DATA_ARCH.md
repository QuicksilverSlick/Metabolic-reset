# 📄 PHASE_01_DATA_ARCH.md

## 1. Objective
Establish the relational foundation in **Cloudflare D1** to support the **Midnight Gold Elite** social ecosystem. This architecture enables high-performance "Study" tracking with nested **Team Layers** and a robust social graph, ensuring strict data integrity for biometric validation.

---

## 1.1 Hybrid Architecture Decision

> **IMPORTANT:** This project uses a **hybrid storage approach**. See `MASTER_GOVERNANCE_CONTEXT.md` Section 2.1 for full details.

### Existing Secondary Index Patterns (Reuse These)
The codebase already has sophisticated secondary index patterns that social features should follow:

| Existing Index | Pattern | Reuse For |
|----------------|---------|-----------|
| `UserDailyScoresIndex` | `i:{userId}` prefix | User's posts lookup |
| `ProjectEnrollmentIndex` | `i:{projectId}` prefix | Community posts listing |
| `UserEnrollmentIndex` | `i:{userId}` prefix | User's team membership |

**Implementation Pattern (from `worker/core-utils.ts`):**
```typescript
// Batch index operations with transactions
async indexAddBatch<T>(items: T[]): Promise<void> {
  await this.ctx.storage.transaction(async (txn) => {
    for (const it of items) await txn.put('i:' + String(it), 1);
  });
}
```

> **AI Directive:** When implementing social features, follow the existing `IndexedEntity` pattern for consistency.

### What Already Exists (Durable Objects - Do Not Recreate)
The following concepts are **already implemented** in the existing codebase and should NOT be duplicated:

| Concept | Existing Implementation | Notes |
|---------|------------------------|-------|
| **Communities** | `ResetProjectEntity` | Projects = Communities. Use `projectId` as community reference. |
| **Teams** | `ProjectEnrollmentEntity.groupLeaderId` | Users are grouped by their assigned coach. |
| **Memberships** | `ProjectEnrollmentEntity` + `User.captainId` | Enrollment = membership. Role stored on enrollment. |
| **User Roles** | `User.role` ('challenger' \| 'coach') + `User.isAdmin` | Three-tier: admin, coach, challenger. |

### What This Phase Adds (D1 Database - New Tables)
Only the **social interaction tables** are new and belong in D1:

| Table | Purpose | Why D1? |
|-------|---------|---------|
| `community_posts` | Social feed content | SQL pagination, visibility filtering, JOINs |
| `post_comments` | Comment threads | Nested queries, sorting |
| `post_likes` | Like tracking | Unique constraints, count aggregates |

---

## 2. D1 SQL Schema (Social Features Only)
This schema adds social interactions. It references existing DO entities via `user_id` and `project_id`.

```sql
-- ============================================
-- D1 SOCIAL TABLES (New - Hybrid Architecture)
-- ============================================
-- Note: user_id and project_id reference Durable Object entities.
-- The API layer bridges D1 ↔ DO data at query time.

-- 1. Social Posts
-- project_id references ResetProjectEntity (DO) - this IS the "community"
-- user_id references UserEntity (DO)
-- team_id is the coach's user_id (groupLeaderId from ProjectEnrollmentEntity)
CREATE TABLE community_posts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,              -- References DO ResetProjectEntity.id
  user_id TEXT NOT NULL,                 -- References DO UserEntity.id
  team_id TEXT,                          -- Coach's user_id (for team-scoped posts)
  visibility TEXT CHECK(visibility IN ('global', 'team')) DEFAULT 'global',
  content_type TEXT CHECK(content_type IN ('text', 'image', 'video', 'milestone')) DEFAULT 'text',
  body TEXT,
  media_url TEXT,                        -- Cloudflare R2 Key or Stream UID
  likes_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  deleted_at DATETIME,                   -- Soft delete for 50-70 demographic accidents
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Post Likes
CREATE TABLE post_likes (
  post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,                 -- References DO UserEntity.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

-- 3. Post Comments
CREATE TABLE post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,                 -- References DO UserEntity.id
  parent_id TEXT,                        -- For threading (references post_comments.id)
  body TEXT NOT NULL,
  deleted_at DATETIME,                   -- Soft delete
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes for Performance
CREATE INDEX idx_posts_project_created ON community_posts(project_id, created_at DESC);
CREATE INDEX idx_posts_team_created ON community_posts(team_id, created_at DESC) WHERE team_id IS NOT NULL;
CREATE INDEX idx_posts_user ON community_posts(user_id);
CREATE INDEX idx_posts_pinned ON community_posts(project_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_comments_post ON post_comments(post_id, created_at);
CREATE INDEX idx_likes_user ON post_likes(user_id);
```

### 2.1 Schema Design Notes

**Why no `communities`, `teams`, or `memberships` tables?**
- `communities` → Use existing `ResetProjectEntity` (DO). Query via `/api/projects`.
- `teams` → Use existing `ProjectEnrollmentEntity.groupLeaderId` (DO). A "team" = all users with the same `groupLeaderId`.
- `memberships` → Use existing `ProjectEnrollmentEntity` (DO). Query via `/api/enrollments`.

**Bridge Pattern in API:**
```typescript
// Example: Enriching a D1 post with DO user data
const posts = await db.prepare(`SELECT * FROM community_posts WHERE project_id = ?`).bind(projectId).all();
const userIds = [...new Set(posts.results.map(p => p.user_id))];
const users = await Promise.all(userIds.map(id => new UserEntity(env, id).getState()));
// Merge user data into posts...
```

---

## 3. Shared TypeScript Models (`shared/models/social.ts`)
To be used by both the Hono Worker and the React Frontend for total type-safety.

```typescript
export type ChallengeStatus = 'pre-launch' | 'active' | 'concluding' | 'archived';
export type SocialRole = 'admin' | 'coach' | 'challenger';
export type Visibility = 'global' | 'team';
export type PostType = 'text' | 'image' | 'video' | 'milestone';

export interface Membership {
  userId: string;
  communityId: string;
  teamId?: string;
  role: SocialRole;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  communityId: string;
  teamId?: string;
  visibility: Visibility;
  contentType: PostType;
  body: string;
  mediaUrl?: string;
  likesCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  isPinned: boolean;
  createdAt: string;
}
```

---

## 4. Implementation Logic (Admin Control)

### 4.1 Team Logic Strategy
*   **Context-Aware Feed:** The API must filter `community_posts` based on the user's `team_id`. If `visibility` is `team`, the post is only returned if `request.user.team_id === post.team_id`.
*   **Coach Authority:** Coaches are assigned to a `team_id`. In the UI, posts by the `team.coach_id` will trigger the **Glow Border (Gold-500)** to ensure challengers do not miss instructions.

### 4.2 The "Soft Delete" Requirement
*   For the 50-70 demographic, hard deletions are dangerous.
*   **Rule:** When a user clicks "Delete Post," the API sets `deleted_at = NOW()`.
*   **Recovery:** Admins can see these in the dashboard and "Restore" them if the deletion was accidental.

### 4.3 Implementation Plan

> **December 2025 Best Practice:** D1 queries are now [40-60% faster](https://developers.cloudflare.com/changelog/2025-01-07-d1-faster-query/) due to reduced network round trips.

1.  **Step 1:** Create D1 database with location hint for optimal placement:
    ```bash
    npx wrangler d1 create metabolic-social --location=wnam  # Western North America
    ```
2.  **Step 2:** Add D1 binding to `wrangler.jsonc`:
    ```jsonc
    "d1_databases": [
      { "binding": "SOCIAL_DB", "database_name": "metabolic-social", "database_id": "<from step 1>" }
    ]
    ```
3.  **Step 3:** Run migration: `npx wrangler d1 execute metabolic-social --file=./migrations/001_social_tables.sql`.
4.  **Step 4:** Update `Env` interface in worker to include `SOCIAL_DB: D1Database`.
5.  **Step 5:** Implement Social API routes (see `PHASE_03_SOCIAL_API.md`).

**No data migration required.** Existing DO entities remain untouched. The social tables start empty.

---

## 5. Midnight Gold Alignment
*   **Badge Data:** Every `Post` response will include the `role`. The frontend will use this to render the **Gold Glow Badge** for Coaches and Admins, distinguishing them from Challengers.
*   **Milestone Posts:** Automated posts triggered by the tracker will have `content_type = 'milestone'`, allowing the frontend to render a specialized **Liquid Glass** celebration card.

---

**Next Phase: PHASE_02_MEDIA_PIPELINE.md (Ready for output?)**
