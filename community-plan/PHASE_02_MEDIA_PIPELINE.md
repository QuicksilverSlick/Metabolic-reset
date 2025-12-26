# 📄 PHASE_02_MEDIA_PIPELINE.md

## 1. Objective
Enable a high-performance, buffer-free media experience that feels like a premium "TikTok" feed but is optimized for the **50–70 demographic**. This phase leverages **Cloudflare Stream** for video and **Cloudflare R2** for images, ensuring that even users on older devices or slower connections experience the "Midnight Gold" elite feel without technical lag.

---

## 2. Storage Strategy: Stream vs. R2

| Asset Type | Primary Storage | Transformation | Usage |
| :--- | :--- | :--- | :--- |
| **Coaching Videos** | Cloudflare Stream | Adaptive Bitrate (HLS/Dash) | TikTok-style vertical feed |
| **Challenger Videos** | Cloudflare Stream | Auto-transcode | Team progress shares |
| **Biometric Proof** | Cloudflare R2 | Private/Authenticated | Smart scale screenshots (Secure) |
| **Social Photos** | Cloudflare R2 | CF Image Transformations | Progress photos, meal shares |
| **UI Assets** | Cloudflare R2 | Public Cache | Gold-themed banners, icons |

---

## 3. Implementation Workflow: "Direct-to-Edge" Uploads

To keep the Hono Worker lightweight, we use **Presigned URLs** for R2 and **Direct Creator Uploads** for Stream.

### 3.1 Video Upload (Stream)
1.  **Request:** Frontend calls `POST /api/media/video-upload-url`.
2.  **Authorize:** Worker validates user session and membership.
3.  **Generate:** Worker requests a one-time upload URL from Cloudflare Stream API.
4.  **Upload:** Frontend performs a `POST` directly to Cloudflare.
5.  **Sync:** Webhook (or frontend callback) updates `community_posts.media_url` with the Stream `uid`.

### 3.2 Image Upload (R2 + Transformations)
1.  **Request:** Frontend calls `GET /api/media/image-upload-url`.
2.  **Generate:** Worker creates an R2 Presigned URL via the S3-compatible API.
3.  **Upload:** Frontend performs a `PUT` directly to R2.
4.  **Display:** Served via a Worker-side loader that applies `format=webp&quality=80` automatically.

---

## 4. Midnight Gold UI/UX for Media

### 4.1 The "Elite" Video Player
Customizing the Cloudflare Stream Player to match the **Midnight Gold Elite** system:
*   **Primary Color:** `#F59E0B` (Gold 500) for the seek bar and play icons.
*   **Controls:** **Glassmorphism Overlay** (`bg-white/[0.04] backdrop-blur-md`).
*   **Interaction:** Large "Center-Screen" Play/Pause button (min 80x80px) for ease of use.

### 4.2 Loading & Shimmer States
While media is fetching, use **Shadcn Skeletons** with a custom gold-pulse:
```css
/* index.css */
@keyframes shimmer-gold {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.shimmer-media {
  background: linear-gradient(90deg, #020617 25%, #1E293B 50%, #020617 75%);
  background-size: 200% 100%;
  animation: shimmer-gold 2s infinite;
}
```

---

## 5. Accessibility Constraints
*   **Auto-Play Logic:** Videos in the feed should auto-play **Muted**.
*   **Captions:** Always enable the `captions` button by default in the player UI (crucial for users with hearing impairments).
*   **Layout Shift:** Every media container must have a fixed aspect ratio (e.g., `aspect-video` or `aspect-[9/16]`) to prevent "Content Jumping" which confuses senior users.

---

## 6. Shared Types Update (`shared/models/media.ts`)

```typescript
export interface MediaAsset {
  uid: string;          // CF Stream UID or R2 Key
  type: 'video' | 'image';
  thumbnailUrl: string;
  status: 'processing' | 'ready' | 'error';
  width: number;
  height: number;
}
```

## 7. AI Directive
When implementing the Media Pipeline, the agent must ensure that **Direct Creator Uploads** are used for videos to bypass Worker limits. For images, ensure that **Cloudflare Image Resizing** is utilized to serve responsive sizes based on device mode (Mobile vs. Tablet).

---

**Next Phase: PHASE_03_SOCIAL_API.md (Ready for output?)**
