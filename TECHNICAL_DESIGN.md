# Technical Design Document (TDD) — evaad

**Document Version:** 1.0  
**System:** evaad — 180° Perspective & Structured Public Debate Platform  
**Runtime Stack:** React 19 + TypeScript + Tailwind CSS v4 (Client) · Node.js + Express (API & SSR/SPA Host) · Firebase Firestore & Auth (Persistence) · Google Gemini API (Search-Grounded Intelligence)

---

## 1. Executive Summary & System Goals

Public discussions on traditional social networks suffer from two structural flaws:
1. **Echo Chambers & Thread Burying**: High-velocity single-column comment feeds reward outrage over structured reasoning, hiding the strongest counter-arguments.
2. **Identity Retaliation vs. Accountability**: Users hesitate to express nuanced viewpoints on sensitive civic or workplace topics under their real names, yet purely anonymous boards often lack fact-checking and moderation safeguards.

**evaad** solves this through:
- **Structured Two-Sided Debate Arenas**: Every proposition is split into **Agree (`for`)** vs. **Disagree (`against`)** columns with live vote ratios and AI-synthesized common ground.
- **Cryptographically Separated Dual Personas**: A strict boundary between a user's **Public Social Persona** (`@handle` for X-style posts) and their **Untraceable Anonymous Debate Persona** (`u/handle` for debates and arguments, stripped of `uid`, `email`, and OAuth metadata before persistence).
- **Real-Time Grounded Verification**: Inline fact-checking backed by Google Search grounding and resilient analytical fallbacks.

---

## 2. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT LAYER (Browser / PWA)                         │
│                                                                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │  Debates Arena View  │  │  Social Posts Feed   │  │  Trust, Safety & Policy  │  │
│  │  • TopicCard         │  │  • PostsSection      │  │  • /about, /guidelines   │  │
│  │  • DebateChatView    │  │  • Reference Bridge  │  │  • /privacy, /contact    │  │
│  │  • 180° AI Search    │  │  • Threaded Comments │  │  • /moderation Queue     │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────────┬─────────────┘  │
│             │                         │                           │                │
│             ▼                         ▼                           ▼                │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │             Client Core Services & Local Resilience Layer                    │  │
│  │  • Dual-Persona Sanitizer (stripTraceableFieldsForDebate)                    │  │
│  │  • Session-Stable Variable Ad Pacing Engine (6–10 item intervals)            │  │
│  │  • LocalStorage Offline Mirror + Optimistic UI State                         │  │
│  └────────────────────────┬───────────────────────────────────┬─────────────────┘  │
└───────────────────────────┼───────────────────────────────────┼────────────────────┘
                            │                                   │
          Real-Time WebSockets (onSnapshot)          REST JSON API (/api/*)
                            │                                   │
                            ▼                                   ▼
┌───────────────────────────────────────┐   ┌────────────────────────────────────────┐
│     FIREBASE BACKEND SERVICES         │   │     EXPRESS SERVER (server.ts :3000)   │
│                                       │   │                                        │
│  • Firebase Auth (Google + Anon)      │   │  • POST /api/check-authenticity        │
│  • Cloud Firestore Collections:       │   │  • POST /api/summarize-debate          │
│    - /debates/{debateId}              │   │  • POST /api/debate-chat               │
│    - /arguments/{argumentId}          │   │  • POST /api/ai-search                 │
│    - /social_posts/{postId}           │   │  • POST /api/transcribe-audio          │
│    - /post_comments/{commentId}       │   │  • POST /api/translate-batch           │
│    - /usernames/{username}            │   │  • POST /api/trending-pulse            │
│    - /notifications/{notificationId}  │   └───────────────────┬────────────────────┘
│    - /moderation_reports/{reportId}   │                       │
└───────────────────────────────────────┘                       ▼
                                            ┌────────────────────────────────────────┐
                                            │   EXTERNAL AI & TRANSLATION PROVIDERS  │
                                            │  • Google Gemini API (@google/genai)   │
                                            │  • Google Search Grounding Tool        │
                                            │  • MyMemory Parallel Translation API   │
                                            └────────────────────────────────────────┘
```

---

## 3. Core Architectural Workflows & Diagrams

### 3.1 Dual-Identity Privacy Architecture (Untraceable Debate Mode vs. Public Social Mode)

To guarantee that a user's controversial debate arguments can never be linked back to their Google account or public social profile, `src/utils/anonymous.ts` enforces client-side stripping before any Firestore write to `/debates`, `/arguments`, or `/moderation_reports`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Authenticated User Session                        │
│              (Firebase Auth UID + Google Profile or Guest Session)          │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
         [Mode A: Debates Tab]                 [Mode B: Social Posts Tab]
                    │                                     │
                    ▼                                     ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│   stripTraceableFieldsForDebate()     │ │     getPublicPostAuthor()         │
│  • Replaces name with u/<desi_handle> │ │  • Retains public @handle         │
│  • Deletes uid, photoURL, email       │ │  • Links to /usernames registry   │
│  • Sets isAnonymousPersona = true     │ │  • Supports verified avatars      │
└───────────────────┬───────────────────┘ └───────────────┬───────────────────┘
                    │                                     │
                    ▼                                     ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│   Firestore: /debates & /arguments    │ │ Firestore: /social_posts          │
│   (Zero PII / Zero UID stored)        │ │ (Public social attribution)       │
└───────────────────────────────────────┘ └───────────────────────────────────┘
```

### 3.2 Fact-Checking & Search Grounding Pipeline (`/api/check-authenticity`)

```
User clicks "Verify Factuality" on an Argument
                     │
                     ▼
      POST /api/check-authenticity
  { argumentText, debateTitle, targetLang }
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ callGeminiSafe(['gemini-3.8-flash', 'gemini-3.5-flash']) │
│ with tools: [{ googleSearch: {} }] (7.5s timeout)        │
└────────────────────┬─────────────────────────┬───────────┘
                     │                         │
            [Success + Grounding]      [Quota / Timeout / No Key]
                     │                         │
                     ▼                         ▼
┌──────────────────────────────────┐ ┌────────────────────────────────────┐
│ Extract JSON Verdict + Score     │ │ Heuristic Empirical Analyzer       │
│ Extract groundingChunks Web URIs │ │ Evaluates quantitative citations,  │
│ Normalize score to verdict band  │ │ absolutist claims, & qualifiers    │
└────────────────────┬─────────────┘ └─────────────────┬──────────────────┘
                     │                                 │
                     └────────────────┬────────────────┘
                                      ▼
                    Optional Localization (targetLang != 'en')
                                      │
                                      ▼
                Persist `authenticityCheck` on Argument Document
```

### 3.3 Session-Stable Variable Ad Pacing Engine (`src/utils/adPersonalization.ts`)

Instead of a rigid modulo interval (`index % 3 === 0`) that frustrates readers and shifts during re-renders:
1. **Session Seed Initialization**: On tab load, `getSessionAdPacingSeed()` generates a 32-bit integer stored in `sessionStorage` (`evaad_ad_pacing_seed_v1`).
2. **FNV-1a Step Hashing**: For any feed (`debates_ALL`, `social_posts`, etc.), `hashStepToRange(seed, feedKey, slotIndex, 6, 10)` computes a deterministic step gap between **6 and 10 items**.
3. **Short-Feed Protection**: If `totalItems < 6`, `getVariableAdPlacements()` returns an empty `Map`, ensuring short or filtered views remain completely ad-free.
4. **Dual-Mode Rendering**: Each placement checks for an approved Google AdSense slot ID (`VITE_ADSENSE_INFEED_SLOT`) and falls back to topic-matched partner cards with optional affiliate URL overrides (`VITE_AFFILIATE_*_URL`).

---

## 4. Database Schema & Firestore Security Model

All collections are defined in [`firebase-blueprint.json`](./firebase-blueprint.json) and enforced by [`firestore.rules`](./firestore.rules).

### 4.1 Collections Overview

| Collection Path | Document ID | Primary Purpose | PII / Identity Policy |
| :--- | :--- | :--- | :--- |
| `/debates/{debateId}` | `debateId` | Public debate propositions, vote tallies (`forVotes`, `againstVotes`), tags, and optional embedded `referencePost`. | Pseudonymous `author` (`u/...`), no UID required. |
| `/arguments/{argumentId}` | `argumentId` | Individual `for` or `against` arguments linked via `debateId`, plus optional `authenticityCheck`. | Pseudonymous `author` (`u/...`), no UID stored. |
| `/social_posts/{postId}` | `postId` | X-style social posts with text, images, video, tags, and counter of spawned debates (`debatesCreatedCount`). | Public `author` (`@handle`). |
| `/post_comments/{commentId}` | `commentId` | Threaded comments on social posts linked via `postId`. | Public `author` (`@handle`). |
| `/usernames/{username}` | Lowercase `handle` | Unique username reservation mapping a handle to a Firebase `uid`. | Authenticated `uid` ownership check. |
| `/notifications/{notificationId}` | `notificationId` | Real-time in-app notifications for likes, comments, and post-to-debate references. | Scoped by `recipientHandle`. |
| `/moderation_reports/{reportId}` | `reportId` | Untraceable content reports across `debate`, `argument`, `post`, and `post_comment`. | **Strictly forbids** `reporterUid`, `reporterHandle`, `reporterName`, `uid`, or `email` in `firestore.rules`. |

### 4.2 Security Rules Highlights (`firestore.rules`)
- **Schema Validation at the Edge**: Every write validates field types, string length caps (`title <= 500`, `content <= 4000`), and non-negative counters (`forVotes >= 0`, `againstVotes >= 0`).
- **Untraceable Reporting Enforcement**: `isValidModerationReport()` explicitly asserts `!("reporterUid" in data) && !("uid" in data) && !("email" in data)` so reports can never expose the reporter.

---

## 5. Backend REST API Specification (`server.ts`)

| Endpoint | Method | Request Body | Response Payload |
| :--- | :---: | :--- | :--- |
| `/api/check-authenticity` | `POST` | `{ argumentText: string, debateTitle?: string, targetLang?: string }` | `{ verdict, score, analysis, keyTakeaway, sources: [{ title, url }], checkedAt }` |
| `/api/summarize-debate` | `POST` | `{ title: string, argumentsList: Argument[], targetLang?: string }` | `{ overview, forPoints, againstPoints, consensusPoints, frictionPoints, keyTakeaway, generatedAt }` |
| `/api/debate-chat` | `POST` | `{ messages: ChatMessage[], debateContext: object, targetLang?: string }` | `{ text: string }` |
| `/api/ai-search` | `POST` | `{ query: string, targetLang?: string }` | `{ framedQuestion, contextSummary, forPoints, againstPoints, suggestedTags, estimatedForPercent }` |
| `/api/transcribe-audio` | `POST` | `{ audioData: string (base64), mimeType?: string }` | `{ text: string }` |
| `/api/translate-batch` | `POST` | `{ texts: string[], targetLang: string }` | `{ targetLang, translations: [{ translatedText, detectedSourceLang }] }` |
| `/api/trending-pulse` | `POST` | `{ category?: string, refresh?: boolean, targetLang?: string }` | `{ items: TrendingPulseItem[], updatedAt: string }` |

---

## 6. Offline Resilience & Progressive Web App (PWA)

- **Dual-Write Persistence**: Every user action (creating a debate, voting, posting an argument, submitting a report) updates React state immediately, persists to `localStorage` (`src/utils/storage.ts`), and asynchronously syncs to Cloud Firestore.
- **Sticky Navigation & Deep Linking**:
  - Top navigation (`sticky top-0 z-30 backdrop-blur-xl`) and floating Back-to-Top controls remain accessible regardless of feed length.
  - Direct URL routing supports `/about`, `/guidelines`, `/privacy`, `/contact`, `/moderation`, `/?debate=<id>`, and `/?post=<id>`.
