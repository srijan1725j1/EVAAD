# Variable In-Feed Ad Pacing & Immediate Partner Monetization Plan

We will replace the repetitive fixed every-3-items ad placement across the Debates and Social Posts feeds with a session-stable variable interval of **6 to 10 items**, eliminate forced ads on short feeds, and add configurable partner/affiliate link overrides so you can earn immediately while Google AdSense site review is in progress.

---

> [!IMPORTANT]
> **Key Decisions Confirmed**
> - **Lighter Variable Ad Spacing (Every 6–10 Items)**: In-feed ads will appear only after variable intervals between **6 and 10 items** rather than a predictable every-3-items pattern.
> - **No Forced Short-Feed Ads**: Feeds with fewer than 6 items will not display in-feed sponsored cards, keeping short or filtered views clean and frustration-free.
> - **Immediate Referral/Affiliate Monetization Support**: Partner cards will support configurable referral or affiliate URLs via environment settings so clicks can generate immediate commission revenue while Google AdSense approval is pending.

---

## 1. Overview & Core Concept

Currently, `evaad` inserts a sponsored card strictly after every 3rd debate or social post, and forces an ad at the end of short feeds with fewer than 3 items. That rigid rhythm feels repetitive to readers.

This update introduces a **Session-Stable Variable Pacing Engine** that spaces sponsored placements organically between **6 and 10 items** apart. Because the intervals are deterministically seeded per browsing session and feed context, users experience a natural, non-repetitive reading flow without ads jumping or shifting positions when they vote, filter, or interact with posts.

---

## 2. User Experience & Visual Design

- **Organic Feed Rhythm**: A user scrolling through a long debate or social feed will encounter the first sponsored placement anywhere between item 6 and item 10, the next placement 6 to 10 items after that (e.g., after item 7, 15, 24, 31), and so on.
- **Clean Short & Filtered Views**: When a user filters by a niche category or searches for a topic that returns fewer than 6 debates or posts, zero in-feed ads are injected.
- **Stable Scroll Experience**: Ad positions remain locked for the duration of the user's session so voting on a debate or expanding comments never causes layout shifts.
- **Seamless Dual-Mode Monetization**:
  - When a live Google AdSense slot ID is configured and approved, the responsive AdSense unit renders inside the placement.
  - Otherwise, the contextual partner card renders with optional custom affiliate/referral tracking links so every click can monetize immediately.

---

## 3. Key Product Decisions & Trade-Offs

- **Deterministic Session Seeding vs. Pure Randomness on Render**: Using `Math.random()` inside a render loop causes ads to jump to different indices every time React re-renders (such as when a user upvotes a debate). By generating a session seed once per tab session and hashing each step interval between 6 and 10, placements feel random to the reader while remaining 100% stable across re-renders.
- **Minimum Threshold of 6 Items**: Dropping the old fallback rule (`length < 3` showing an ad at the end) prevents sparse categories or search results from feeling cluttered with promotions.
- **Configurable Partner Links**: Allowing environment-configured affiliate URLs lets you swap in real referral links (e.g., Coursera, Audible, Notion, Substack, or direct sponsor links) without hardcoding URLs or waiting on AdSense approval.

---

## 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────┐
│                         User Feed Rendering                           │
│               (Debates Feed View & Social Posts View)                 │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                Variable Ad Pacing Engine (6–10 Items)                 │
│  • Generates a stable session seed per browser tab                    │
│  • Steps forward by pseudo-random intervals in [6, 10]                │
│  • Maps eligible item indices -> sequential ad slot indices           │
│  • Returns empty map when total feed items < 6                        │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                   Contextual Placement Resolution                     │
│  • Matches surrounding item categories & keywords to user affinities  │
│  • Checks for approved AdSense Slot ID vs. Partner Affiliate Card     │
│  • Applies optional affiliate/referral URL overrides for immediate    │
│    click monetization                                                 │
└───────────────────────────────────────────────────────────────────────┘
```

### Pacing & Monetization Flow
1. **Session-Seeded Interval Generator**:
   - Computes a map of `itemIndex -> adSequenceNumber` for a given feed length and feed key (`debates` or `posts`).
   - Starts at index `-1` and repeatedly advances by a seeded offset between `6` and `10` (`minGap = 6`, `maxGap = 10`).
   - Only indices strictly within the available item count receive an ad placement.
2. **Contextual & Affiliate Resolution**:
   - Each resolved ad slot selects a topic-matched partner card based on the user's top interest categories and the adjacent debate/post category.
   - Supports optional environment overrides for partner URLs and call-to-action labels so direct sponsorships or affiliate programs can be updated at any time.
