# evaad — The Anti-Polarization Debate Platform

**evaad** (e-vaad / वाद — Sanskrit for purposeful dialogue and debate) is an anonymous, community-driven social debate platform where echo chambers are dismantled through balanced, like-ranked alternating arguments and interactive consensus polls.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Key revisions incorporated from your feedback:

- **Confirmed Brand Name**: **evaad** — honoring the ancient art of constructive philosophical debate (*vaad*).
- **Radical Anonymity**: No personal profile clout, real names, or follower hierarchies. Every user participates under randomized thoughtful pseudonyms (e.g., *Thinker #412*, *Logician #89*, *Dialectic #105*) with randomized geometric emblems.
- **User-Created Debates & Stances**: Any user can propose a debate post with a central premise, setting Side A (e.g., "In Favor / Proposition") and Side B (e.g., "Against / Opposition").
- **Strict Like-Ranked Interleaved Rhythm (`A1 B1 A2 B2 A3 B3...`)**:
  - Side A comments sorted by likes descending: $A_1, A_2, A_3, A_4...$
  - Side B comments sorted by likes descending: $B_1, B_2, B_3, B_4...$
  - The thread algorithm interleaves them directly: $A_1 \rightarrow B_1 \rightarrow A_2 \rightarrow B_2 \rightarrow A_3 \rightarrow B_3$. The highest-quality argument from each side meets its counterpart on equal footing.
- **Dynamic Healthy Poll Bar**: Interactive live vote bar showing the percentage and vote count for each side, visually illustrating which side is leading in a healthy, intellectual competition.

---

### 1. Overview & Core Concept

evaad gives people a clean, distraction-free arena to challenge and defend viewpoints without tribal algorithms or personal identity bias:

- **Anonymous Equality**: Removing personal identity eliminates preconceived biases based on age, gender, nationality, or follower count. The idea stands on its own merit.
- **Interleaved Alternating Discourse**: Unlike Twitter/X or Reddit where the majority faction downvotes and buries dissent, evaad pairs the most liked argument of Side A with the most liked argument of Side B in a direct chat-like rhythm ($A_1, B_1, A_2, B_2$).
- **Healthy Idea Competition**: Community votes power a prominent live split-meter showing the current consensus balance between Side A and Side B.
- **Mobile & Desktop First**: A WhatsApp/iMessage-like feel on mobile with fluid touch targets and sticky response controls; expands into an expansive split-view editorial layout on desktop.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Browse & Filter Topics**:
   - Filter by categories (*Politics*, *Society & Culture*, *Tech & AI*, *Philosophy*, *Economy*, *All*).
   - Each card displays the proposition title, creator pseudonym, the two opposing stance tags, live vote bar ratio, and comment counts.
2. **Launch a New Debate**:
   - Tap "New Debate" modal: enter proposition question/statement, context/background, customize Side A & Side B names (or use suggested defaults), and select a category.
3. **Immersive Debate View**:
   - Tap any debate card to open the full-screen debate room.
   - Header displays the live animated balance poll bar ($48\% \text{ vs } 52\%$) with an instant "Cast Your Vote" toggle.
   - The discussion feed displays arguments in the strict $A_1, B_1, A_2, B_2$ interleaved sequence:
     - Side A arguments on the left with Slate/Indigo badges.
     - Side B arguments on the right with Warm Bronze/Amber badges.
   - Each bubble shows the argument text, like counter with 1-tap upvote, and random pseudonym.
4. **Contribute an Argument**:
   - Clean, sticky bottom composer with a Side A vs. Side B toggle button, character counter, and instant post button.
   - Upvoting any comment dynamically re-ranks its position in the $A_n / B_n$ ladder.

#### Visual Identity & Theme
- **Color Tokens**:
  - Background: Deep Dark Slate (`#0B0F19`) and Crisp Paper (`#F8FAFC`).
  - Side A Theme: Slate/Cobalt (`#38BDF8`, `#1E293B`).
  - Side B Theme: Warm Bronze/Amber (`#F59E0B`, `#78350F`).
  - Borders: Crisp 1px hairline dividers (`border-slate-800` / `border-slate-200`).
- **Typography**:
  - Headings & Proposition: *Playfair Display* for intellectual depth.
  - Chat & Arguments: *Plus Jakarta Sans* for clean, rapid reading across small and large screens.
  - Tabular Numerals: Tabular monospace figures for vote percentages and like counts.

---

### 3. Key Product Decisions & Trade-Offs

- **Interleaving Algorithm**:
  ```ts
  const sideAComments = comments.filter(c => c.side === 'A').sort((a, b) => b.likes - a.likes);
  const sideBComments = comments.filter(c => c.side === 'B').sort((a, b) => b.likes - a.likes);
  const maxLength = Math.max(sideAComments.length, sideBComments.length);
  const interleaved = [];
  for (let i = 0; i < maxLength; i++) {
    if (sideAComments[i]) interleaved.push(sideAComments[i]);
    if (sideBComments[i]) interleaved.push(sideBComments[i]);
  }
  ```
- **Local Persistence & Seeding**:
  - Pre-seeded with rich, thought-provoking debates across Indian and global socio-political, philosophical, and technological topics.
  - Full `localStorage` persistence: all user-created debates, votes, and comments persist immediately across page refreshes.
- **Random Anonymous Identity**:
  - Generates a persistent or session-based pseudonym (`Thinker #729`) with an icon/color so the user knows their own comments while remaining totally anonymous to others.

---

### 4. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         evaad UI                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Top Bar: Brand "evaad" · Category Tabs · + New Debate │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│       ┌──────────────────────┴──────────────────────┐       │
│       ▼                                             ▼       │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │     Feed View           │   │   Full-Screen Debate    │  │
│  │  - Proposition Cards    │   │  - Live Poll / Vote Bar │  │
│  │  - Side A / Side B ratio│   │  - Strict A1 B1 A2 B2   │  │
│  │  - Category filters     │   │  - Like-sorting engine  │  │
│  │  - "Create Debate" modal│   │  - Dual-side composer   │  │
│  └─────────────────────────┘   └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
               ┌───────────────┴───────────────┐
               │     evaad Store (Storage)     │
               │  - Topics & User Debates      │
               │  - Like counts & User votes   │
               │  - Anonymous handle generator │
               └───────────────────────────────┘
```
