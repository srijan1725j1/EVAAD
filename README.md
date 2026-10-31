# evaad — 180° Perspective & Structured Public Debate Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)

**evaad** (*Every Viewpoint Analyzed And Debated*) is a dual-sided public discourse and social debate platform built to counter algorithmic echo chambers. Instead of burying nuanced disagreement in chaotic comment threads, **evaad** organizes public issues into structured **Agree (For) vs. Disagree (Against)** arenas with real-time sentiment meters, live grounded fact-checking, 180° topic synthesis, and multilingual translation across 14+ Indian and global languages.

---

## Documentation Index

- **[README.md](./README.md)** — Setup steps, environment variables, scripts, and deployment guide.
- **[TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md)** — Technical Design Document (TDD), system & data-flow architectural diagrams, database schema, and API specifications.
- **[SAMPLE_DATA_AND_TESTS.md](./SAMPLE_DATA_AND_TESTS.md)** — Sample JSON fixtures, API test payloads, and end-to-end test cases.
- **[LICENSE](./LICENSE)** — MIT License.

---

## Core Features

1. **Two-Sided Debate Arenas (`For` vs. `Against`)**
   - Every topic presents a real-time split sentiment bar, side-by-side or alternating argument streams, and one-click stance voting.
   - Any social post or public statement can be converted into a structured 2-sided debate via **"Start Debate on This"** with embedded source attribution.

2. **Dual-Identity Architecture (Privacy by Design)**
   - **Debates Mode (100% Untraceable Anonymous Persona)**: Users participate in controversial debates using an auto-generated or customizable pseudonymous handle (`u/...`). Zero UID, email, or OAuth identifiers are attached to debate or argument documents.
   - **Social Posts Mode (Public Profile)**: Users share updates, media, and statements under their public handle (`@handle`).

3. **Real-Time Fact-Checking with Search Grounding (`/api/check-authenticity`)**
   - Evaluates empirical claims in debate arguments against live web sources, assigning a structured verdict (`Verified Authentic`, `Mostly Accurate`, `Questionable / Unverified`, or `False or Misleading`), an accuracy score (`0–100%`), analysis, and clickable source citations.

4. **AI 180° Synthesis & Moderator Assistant**
   - **Debate Summary (`/api/summarize-debate`)**: Synthesizes top pillars for both sides, shared consensus points, core friction points, and a balanced takeaway.
   - **180° Topic Search (`/api/ai-search`)**: Turns any search query into a neutral debate proposition with 3 arguments For and 3 Against.
   - **Voice-to-Argument Transcription (`/api/transcribe-audio`)**: Spoken arguments are transcribed directly into the debate composer.

5. **Instant Multilingual Translation (`/api/translate-batch`)**
   - One-click translation across English, Hindi (`हिन्दी`), Bengali (`বাংলা`), Tamil (`தமிழ்`), Telugu (`తెలుగు`), Marathi (`मराठी`), Gujarati (`ગુજરાતી`), Kannada (`ಕನ್ನಡ`), Malayalam (`മലയാളം`), Punjabi (`ਪੰਜਾਬੀ`), Spanish, French, German, Arabic, and Japanese.

6. **Untraceable Community Moderation & Safety**
   - Anonymous reporting across **Debates**, **Arguments**, **Social Posts**, and **Post Comments**.
   - Dedicated `/moderation` queue for administrators to review and resolve/delete reported content.

7. **Session-Stable Variable Ad Pacing & Partner Monetization**
   - Non-intrusive, variable in-feed ad spacing (every **6 to 10 items** per session seed, with zero ads on short feeds `< 6` items).
   - Supports both **Google AdSense** units and immediate **Affiliate / Partner Referral URL overrides**.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion |
| **Backend / API Server** | Node.js, Express (`server.ts`), Vite Middleware (Dev) / Static SPA Serving (Prod) |
| **Database & Auth** | Firebase Firestore (real-time `onSnapshot` listeners + offline local cache), Firebase Authentication (Google OAuth + Anonymous Auth) |
| **AI & Grounding** | `@google/genai` SDK (Gemini Flash with Google Search grounding + deterministic analytical fallbacks) |
| **PWA Support** | `vite-plugin-pwa`, Web App Manifest, Service Worker offline caching |

---

## Quick Start & Setup Steps

### Prerequisites
- **Node.js** `>= 20.x` (or **Bun** `>= 1.1.x`)
- **npm** `>= 10.x`
- A **Firebase project** with Firestore and Authentication enabled (configured via `firebase-applet-config.json`)
- *(Optional)* A **Gemini API Key** for live AI grounding, synthesis, and audio transcription

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/evaad.git
cd evaad
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your values (see the full [Environment Variables Reference](#environment-variables-reference) below).

### 4. Start the Development Server
```bash
npm run dev
```
The full-stack Express + Vite server will start on **`http://localhost:3000`**.

### 5. Type-Check & Build for Production
```bash
# Run TypeScript compiler validation
npm run lint

# Build the production client bundle into dist/
npm run build

# Start the production server
NODE_ENV=production npm start
```

---

## Environment Variables Reference

All environment variables are documented in [`.env.example`](./.env.example).

### Server-Side Variables

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | Recommended | `""` | API key for `@google/genai` powering fact-checking (`/api/check-authenticity`), debate summaries (`/api/summarize-debate`), 180° search (`/api/ai-search`), and voice transcription (`/api/transcribe-audio`). If omitted, resilient deterministic engines are used automatically. |
| `PORT` | No | `3000` | HTTP port on which the Express + Vite server listens. |
| `NODE_ENV` | No | `development` | Set to `production` when serving the compiled `dist/` bundle in production. |
| `APP_URL` | No | `http://localhost:3000` | Public canonical URL of the deployed application. |

### Client-Side Variables (`VITE_*`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_CONTACT_EMAIL` | Recommended | `""` | Official contact & abuse reporting email displayed on `/contact`, `/privacy`, and `/guidelines`. |
| `VITE_ADMIN_EMAIL` | Recommended | `chandra.oms@gmail.com` | Google account email authorized to resolve/remove reported content in `/moderation`. |
| `VITE_LEGAL_ENTITY_NAME` | No | `"evaad Platform"` | Publisher / legal entity name shown on `/privacy` and `/contact`. |
| `VITE_LEGAL_JURISDICTION` | No | `"India"` | Governing legal jurisdiction disclosed on `/privacy`. |
| `VITE_ADSENSE_CLIENT_ID` | No | `ca-pub-8666838424059257` | Google AdSense Publisher ID (`ca-pub-...`). |
| `VITE_ADSENSE_INFEED_SLOT` | No | `""` | Google AdSense ad slot ID for in-feed debate and post placements. Falls back to contextual partner cards when empty. |
| `VITE_ADSENSE_SIDEBAR_SLOT` | No | `""` | Google AdSense ad slot ID for sidebar placements. |
| `VITE_AFFILIATE_DEFAULT_URL` | No | `""` | Default referral/affiliate URL applied to partner cards for immediate click monetization while AdSense review is pending. |
| `VITE_AFFILIATE_TECH_URL` | No | `""` | Category-specific affiliate link override for `#TECH` partner cards. |
| `VITE_AFFILIATE_ECONOMY_URL` | No | `""` | Category-specific affiliate link override for `#ECONOMY` partner cards. |
| `VITE_AFFILIATE_WORK_URL` | No | `""` | Category-specific affiliate link override for `#WORK` partner cards. |
| `VITE_AFFILIATE_EDUCATION_URL` | No | `""` | Category-specific affiliate link override for `#EDUCATION` partner cards. |
| `VITE_AFFILIATE_SPORTS_URL` | No | `""` | Category-specific affiliate link override for `#SPORTS` partner cards. |
| `VITE_AFFILIATE_POLITICS_URL` | No | `""` | Category-specific affiliate link override for `#POLITICS` partner cards. |

---

## Deployment (Render / Cloud Run / Docker)

1. **Build Command**:
   ```bash
   npm install && npm run build
   ```
2. **Start Command**:
   ```bash
   NODE_ENV=production npm start
   ```
3. **Environment Variables**: Add your `.env` keys in your hosting provider's dashboard (Render Environment Group or Google Cloud Run Variables & Secrets).
4. **SPA Routing**: In production (`NODE_ENV=production`), `server.ts` serves static assets from `dist/` and falls back to `dist/index.html` for all client routes (`/about`, `/guidelines`, `/privacy`, `/contact`, `/moderation`, `/?debate=...`, `/?post=...`).

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.
