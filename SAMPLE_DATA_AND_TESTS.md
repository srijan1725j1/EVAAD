# Sample Data & Test Cases — evaad

This document provides ready-to-use **Sample JSON Fixtures** for all core entities in **evaad**, `curl` commands for testing backend API endpoints, and a structured **End-to-End Test Suite** covering functional, privacy, moderation, and monetization requirements.

---

## Part 1: Sample Data Fixtures

### 1.1 Sample Debate Document (`/debates/{debateId}`)

```json
{
  "id": "debate_india_ai_it_2026",
  "title": "Will AI engineering replace traditional entry-level IT jobs in India by 2028, or create higher-value software roles?",
  "tags": ["TECH", "WORK", "INDIA", "EDUCATION"],
  "author": {
    "name": "u/ChaiPeCharcha_42",
    "handle": "u/ChaiPeCharcha_42",
    "avatarColor": "#0284c7",
    "initials": "CP",
    "isAnonymousPersona": true
  },
  "forVotes": 148,
  "againstVotes": 112,
  "views": 1840,
  "likes": 64,
  "createdAt": "2026-10-30T08:30:00.000Z"
}
```

### 1.2 Sample Debate Argument with Grounded Fact-Check (`/arguments/{argumentId}`)

```json
{
  "id": "arg_ai_productivity_01",
  "debateId": "debate_india_ai_it_2026",
  "side": "for",
  "author": {
    "name": "u/FilterKaapiLogic",
    "handle": "u/FilterKaapiLogic",
    "avatarColor": "#10b981",
    "initials": "FK",
    "isAnonymousPersona": true
  },
  "content": "According to NASSCOM and GitHub developer studies, AI coding assistants accelerate boilerplate and unit-testing tasks by 35-55%, shifting fresher hiring away from repetitive maintenance toward system architecture and AI orchestration.",
  "likes": 29,
  "createdAt": "2026-10-30T09:05:00.000Z",
  "authenticityCheck": {
    "verdict": "Verified Authentic",
    "score": 92,
    "analysis": "Multiple empirical developer productivity benchmarks, including GitHub's controlled trial and NASSCOM industry reports, confirm productivity gains in the 35% to 55% range for routine coding and testing tasks.",
    "sources": [
      {
        "title": "GitHub Economic Impact of AI Coding Tools",
        "url": "https://github.blog/news-insights/research/"
      },
      {
        "title": "NASSCOM AI Adoption Index",
        "url": "https://nasscom.in/"
      }
    ],
    "checkedAt": "2026-10-30T09:06:12.000Z"
  }
}
```

### 1.3 Sample Social Post (`/social_posts/{postId}`)

```json
{
  "id": "post_metro_wfh_01",
  "author": {
    "name": "Aarav Sharma",
    "handle": "@aarav_tech",
    "avatarColor": "#6366f1",
    "initials": "AS",
    "isGoogleUser": true
  },
  "speakerTitle": "Staff Product Engineer · Bengaluru",
  "content": "Spending 3 hours every day stuck at Silk Board junction just to sit on Zoom calls from an office desk makes zero economic or environmental sense. Hybrid flexibility should be the default for knowledge work.",
  "tags": ["WORK", "INDIA", "SOCIETY"],
  "likes": 84,
  "commentsCount": 14,
  "views": 920,
  "debatesCreatedCount": 2,
  "createdAt": "2026-10-30T07:15:00.000Z"
}
```

### 1.4 Sample Untraceable Moderation Report (`/moderation_reports/{reportId}`)

> **Privacy Note:** Notice that `uid`, `email`, `reporterUid`, and `reporterHandle` are completely absent—enforced by both client sanitization and `firestore.rules`.

```json
{
  "id": "rep_1730289000_x9a2f",
  "targetType": "post_comment",
  "targetId": "comm_98231",
  "debateId": "post_metro_wfh_01",
  "targetPreview": "Spam link promoting unrelated crypto giveaway...",
  "reason": "spam",
  "details": "Repeated commercial spam link in post comments.",
  "status": "pending",
  "createdAt": "2026-10-30T10:10:00.000Z"
}
```

---

## Part 2: API Endpoint Test Commands (`curl`)

With the server running locally (`npm run dev` on `http://localhost:3000`), run these commands to verify each backend endpoint:

### 1. Test Fact-Checking & Search Grounding
```bash
curl -s -X POST http://localhost:3000/api/check-authenticity \
  -H "Content-Type: application/json" \
  -d '{
    "debateTitle": "Should India adopt simultaneous Lok Sabha and State Assembly elections?",
    "argumentText": "India previously held simultaneous elections from 1951 to 1967 before state assembly dissolutions desynchronized the cycle.",
    "targetLang": "en"
  }' | jq .
```

### 2. Test 180° AI Search Topic Framing
```bash
curl -s -X POST http://localhost:3000/api/ai-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "70 hour work week in Indian startups",
    "targetLang": "en"
  }' | jq .
```

### 3. Test Debate Synthesis Summary
```bash
curl -s -X POST http://localhost:3000/api/summarize-debate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Should IPL remove the Impact Player rule?",
    "argumentsList": [
      { "side": "for", "content": "It discourages captains from developing genuine all-rounders needed for international World Cups." },
      { "side": "against", "content": "It increases tactical depth and gives uncapped Indian specialist batters and bowlers more match opportunities." }
    ],
    "targetLang": "en"
  }' | jq .
```

### 4. Test Batch Multilingual Translation (English -> Hindi)
```bash
curl -s -X POST http://localhost:3000/api/translate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Respectful disagreement is the foundation of democracy."],
    "targetLang": "hi"
  }' | jq .
```

---

## Part 3: Structured Test Cases

### Test Suite A: Core Debate & Social Flows

| Test ID | Test Case | Preconditions | Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Create a Two-Sided Debate | User on **Debates** tab | 1. Click **New Debate** (`+`).<br>2. Enter proposition title and select `#TECH` tag.<br>3. Submit form. | Debate appears at top of feed with `50% / 50%` initial bar and author shown as anonymous `u/...` persona. |
| **TC-02** | Vote & Submit For/Against Arguments | Open any Debate into `DebateChatView` | 1. Select **Agree (For)** or **Disagree (Against)**.<br>2. Submit an argument.<br>3. Toggle sort filter (`Alternating`, `Live`, `For`, `Against`). | Vote bar recalculates percentage immediately; argument appears in the chosen stance column and persists after page refresh. |
| **TC-03** | Convert Social Post into a Structured Debate | User on **Posts** tab | 1. Locate any Social Post.<br>2. Click **Start Debate on This**.<br>3. Confirm proposition title in modal. | New debate is created with an embedded `referencePost` card linking back to the original social post; post's debate counter increments. |
| **TC-04** | Grounded Fact-Check on Argument | Inside `DebateChatView` with at least 1 argument | 1. Click the **Fact-Check / Verify** button on an argument. | Returns structured badge (`Verified Authentic`, `Mostly Accurate`, etc.), accuracy score (`0-100%`), analysis paragraph, and source links. |

### Test Suite B: Privacy, Safety & Moderation

| Test ID | Test Case | Preconditions | Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-05** | Untraceable Debate Persona Isolation | Signed in with Google OAuth | 1. Switch to **Debates** tab.<br>2. Post a new debate or argument.<br>3. Inspect payload in Firestore `/debates` or `/arguments`. | Author object contains only pseudonymous `u/...` handle, `initials`, and `avatarColor`. No `uid`, `email`, or Google `photoURL` is present. |
| **TC-06** | Anonymous Content Reporting (All 4 Content Types) | Any user session | 1. Click the Flag (`Report`) icon on a **Debate**, **Argument**, **Social Post**, and **Post Comment**.<br>2. Select a reason (e.g., `Harassment` or `Spam`) and submit. | Item badge changes to `Reported`; report is saved to `/moderation_reports` without any reporter identity fields. |
| **TC-07** | Admin Moderation Queue Resolution | Signed in as `VITE_ADMIN_EMAIL` | 1. Open `/moderation`.<br>2. Click **Remove Target Content** or **Dismiss Report** on a pending item. | Target item is removed (or report dismissed) and status updates in real time. |

### Test Suite C: Navigation, Ad Pacing & Policy Compliance

| Test ID | Test Case | Preconditions | Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-08** | Direct URL Routing & Refresh Persistence | Browser session | 1. Navigate directly to `/about`, `/guidelines`, `/privacy`, `/contact`, and `/moderation`.<br>2. Hard-refresh (`Ctrl+R` / `Cmd+R`) on each route. | Every route loads its dedicated view cleanly without 404 errors; browser Back/Forward buttons work as expected. |
| **TC-09** | Sticky Header & Floating Back-to-Top Button | Feed or Info Page with vertical scroll | 1. Scroll down past `360px`.<br>2. Observe top header and bottom-right corner.<br>3. Click the floating **Up Arrow** button. | Top navigation header stays pinned (`sticky top-0`) with backdrop blur; floating Back-to-Top button appears and smoothly scrolls to top on click. |
| **TC-10** | Session-Stable Variable Ad Spacing (6–10 Items) | Debates or Posts feed | 1. Filter feed to `< 6` items -> verify **0 ads** appear.<br>2. View full feed (`>= 10` items) -> verify ads appear only after variable intervals of **6 to 10 items**.<br>3. Like or vote on an item -> verify ad positions do not jump. | Ad placements are spaced every 6–10 items (never fixed every 3 items), zero ads appear on short feeds, and positions remain locked during re-renders. |
