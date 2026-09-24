# Cycle Sync — decisions

Phase 1 findings + Phase 2 options. **No feature code changes until each "Decision" is filled in.**
Content notes with page refs live in `reference/CONTENT_NOTES.md` (local, gitignored — the source book is copyrighted
and this repo is public).

## Status (2026-09-24)

All decisions below are built (commits `4443eb6` → `4f4bc4d`) and verified: **94/94 automated checks pass**
(79 in `tests/click-through.html` on demo data incl. a dead-click scan of all 122 buttons/links, plus 15 real-data
checks for onboarding validation, short-cycle edge cases, recovery look, cycle-settings edit and reset). No console errors.

## 1. Repo inspection

| | |
|---|---|
| Stack | Plain HTML/CSS/JS, 3 files (`index.html`, `style.css`, `app.js` ≈ 1,500 lines). No framework, npm, build step, tests or linter. |
| Structure | Single page; screens are `<section class="screen">` toggled by `showScreen()`. `app.js` sections: data → helpers → cycle logic → storage → `calendarSource` → alignment engine → demo seed → per-screen render functions → navigation → dialogs → start-up. One delegated click handler (`app.js:1456`). |
| Data | `localStorage`, keys `cyclesync.*` (settings, tasks, logs, prefs, demo.*). No backend. |
| Run | `python3 -m http.server 8000` in the repo → http://localhost:8000 (`?demo=1` = sample data, Day 14). Live: https://jklacis.github.io/cycle-sync/ (GitHub Pages from `main`). |
| Phone | Local serving is blocked by the "Startup House Guest" Wi-Fi (client isolation) + `ufw` → use the Pages link. |
| Content | Phase content is hard-coded in the `PHASES` object in `app.js` (paraphrased from the book). |
| State of UI | Contrary to the brief, almost every element already works (see "Now" lines below). Placeholders: Profile, Appearance, Contact us ("coming soon" toast). Mocked: integrations, weekly insight, AI Coach (scripted). |

## 2. Content audit (summary — details + sources in `reference/CONTENT_NOTES.md`)

- Fine as is: phase durations in the legend (PDF p. 5), POWR labels (p. 17–18), Work tips (p. 20), Move tips (p. 14), Eat tips (p. 11–12).
- **Excluded on purpose:** calorie restriction / intermittent fasting / keto plan (p. 13), "eliminates PMS, protects fertility" claims (p. 12),
  "adrenal fatigue" (p. 14 — not a recognised diagnosis, Endocrine Society / Mayo Clinic), disease lists (p. 4, 16), Love/Mom FLO (p. 22–24), ads (p. 39–41).
- **Evidence is weak** for phase-based exercise, food and work advice: meta-analyses find only trivial exercise-performance changes
  (McNulty 2020), no effect on strength training (Colenso-Semple 2023) and no robust cognitive-performance changes (Jang 2025).
  → All app text stays "suggestions inspired by *In the FLO*"; the score is framed as "fit with your plan", not performance.
- **Gap found:** onboarding allows period length 3–7 days; NHS says 2–7 (usually ~5). Cycle range 21–35 matches NHS.

---

## 3. App-wide decisions

### D1 Backend / data storage
- **A)** On-device only (`localStorage`), refactored behind one `store` module with a schema version + migration. Works on GitHub Pages and offline, no data leaves the phone.
- **B)** Local server (Python stdlib `http.server` + SQLite, JSON API). Real backend, but the app only works while the laptop runs; phone access is blocked on the guest Wi-Fi; kills the Pages link.
- **C)** Hosted service (e.g. Supabase: Postgres + auth + row-level security). Multi-device sync, but sensitive health data goes to a third party, needs auth, RLS policies and a privacy review — not realistic to do safely by Friday.
**Recommendation:** A — the only option that is solid *and* demo-safe by Friday; `store` module makes a later move to C a contained change.
**Decision:** A (2026-09-24)

### D2 Data model
- **A)** Keep: `settings {lastPeriodStart, cycleLength, periodLength}`, `tasks[]`, `logs{date → {energy, mood, focus, sleep}}`, `prefs`; add `schemaVersion`.
- **B)** A + period history: `periods[] {start}`; "My period started" action; cycle length = average of the last 3 cycles (falls back to the entered value).
- **C)** B + per-day flow/symptom logging.
**Recommendation:** A for Friday (with `schemaVersion` so B is a clean migration later). B is the best next feature after the demo.
**Decision:** A (2026-09-24)

### D3 How phase and day are calculated
- **A)** Current: `cycleDay = (days since lastPeriodStart mod cycleLength) + 1`; ovulation ≈ `cycleLength − 14` (NHS: ovulation ~10–16 days before the next period); Ovulatory = ovulation −1…+1; Menstrual wins overlaps. Label everything "estimated".
- **B)** Scale the book's typical durations (7–10 / 3–4 / 10–14 / 3–7) to the user's cycle length.
- **C)** Personalised from logged signals (LH tests, temperature) — needs D2 C, out of scope.
**Recommendation:** A — anchored on the luteal phase, which is the most stable part of the cycle; B has no physiological basis.
**Decision:** A (2026-09-24)

### D4 Accounts / login
- **A)** None — single user per device.
- **B)** Local profile only (first name, stored on device) — powers "Your Profile" and a personal greeting; no login.
- **C)** Real accounts — requires D1 C.
**Recommendation:** B — makes the Profile card real at near-zero cost; login adds nothing for an on-device prototype.
**Decision:** B (2026-09-24)

### D5 Where content lives
- **A)** Keep the `PHASES` / coach / FAQ content in `app.js`.
- **B)** Move all copy into `content.js` (plain script defining `CONTENT`, loaded before `app.js`); app code only renders it.
- **C)** `content.json` loaded with `fetch()` — breaks when opened as a file, adds async start-up.
**Recommendation:** B — easy to edit, no build step, works on Pages. (Changes the "three files" rule in CLAUDE.md.)
**Decision:** B (2026-09-24)

### D6 Period-length range
- **A)** Keep 3–7 days. **B)** 2–7 days (NHS). **C)** 2–8 days (looser).
**Recommendation:** B — matches the NHS source we cite.
**Decision:** B (2026-09-24)

---

## 4. Elements

Line numbers are for the current `main`. Repeated identical elements are grouped.

### Onboarding

### #1 Onboarding form + "Get started" (`index.html:27–43`, handler `app.js:1311`)
**Now:** Date (no future), cycle 21–35 (default 28), period 3–7 (default 5); errors inline; saves → Alignment. Shown only when no settings are saved; skipped in `?demo=1`.
**Purpose:** Get the minimum data to place today in the cycle.
- **A)** Keep as is.
- **B)** A + period range 2–7 (D6) + "Not sure? Use 28" hint + short "estimate, not for contraception" line under the date.
- **C)** B + optional first name (D4 B) on the same screen.
**Content source:** NHS (cycle 21–35, period 2–7); PDF p. 2 (disclaimer tone).
**Backend needed:** `settings` (+ `profile.name` for C).
**Recommendation:** C if D4 = B, else B.
**Decision:** C (2026-09-24, recommendation accepted)

### Global

### #2 Dock tabs ×4 (`index.html:407–410`)
**Now:** Switch screens; active tab highlighted; hidden during onboarding.
**Purpose:** Main navigation.
- **A)** Keep. **B)** A + remember last tab on reload.
**Content source:** none. **Backend needed:** none (B: one pref).
**Recommendation:** A — always opening on Alignment (the "aha" screen) is right for the demo.
**Decision:** A (2026-09-24, recommendation accepted)

### #3 Header avatars (`index.html:57, 120, 178` → Settings; `index.html:228` on Settings → "coming soon")
**Now:** Inconsistent: 3 avatars open Settings, the one on Settings shows a toast.
**Purpose:** Get to your profile.
- **A)** All avatars → Settings; on Settings → Profile.
- **B)** All avatars → Profile screen directly (needs D4 B).
- **C)** Show initials of the saved name in the avatar (D4 B) + B.
**Content source:** none. **Backend needed:** `profile` (B/C).
**Recommendation:** C if D4 = B, else A.
**Decision:** C (2026-09-24, recommendation accepted)

### #4 Back buttons (`index.html:318, 348, 363` → Settings; `index.html:395` → Cycle Plan)
**Now:** Work; phase detail always returns to Cycle Plan even when opened from Alignment.
**Purpose:** Return to where you came from.
- **A)** Keep fixed targets.
- **B)** Return to the previous screen (small history stack).
**Content source:** none. **Backend needed:** none.
**Recommendation:** B — phase detail is opened from 3 Alignment buttons too; landing on Cycle Plan is unexpected.
**Decision:** B (2026-09-24)

### Alignment

### #5 Calendar icon (`index.html:54`)
**Now:** Opens Cycle Plan.
- **A)** Keep. **B)** Open the add-task dialog.
**Content source:** none. **Backend needed:** none.
**Recommendation:** A — matches "View Full Calendar" and the icon's meaning.
**Decision:** A (2026-09-24, recommendation accepted)

### #6 "View phase details ›" (`app.js:560`)
**Now:** Opens phase detail for today's phase.
- **A)** Keep. **B)** A + improved detail content (see #27).
**Content source:** PDF p. 11–12, 14, 17–20. **Backend needed:** none.
**Recommendation:** B.
**Decision:** B (2026-09-24, recommendation accepted)

### #7 Score ring (`index.html:70`, `app.js:591`)
**Now:** Not interactive.
**Purpose:** Users will tap the big number to ask "why 78?".
- **A)** Keep static.
- **B)** Tap → sheet "How your score works": the 4 levels and points, today's tasks and their level, plus an honesty note (fit with your plan, not a performance prediction).
**Content source:** our scoring rules; evidence note from Jang 2025 / McNulty 2020. **Backend needed:** none.
**Recommendation:** B — explains the core metric and keeps claims honest.
**Decision:** B (2026-09-24)

### #8 Recommendation bar (`index.html:74`, `app.js:564`)
**Now:** Opens phase detail (normal and recovery wording).
- **A)** Keep.
- **B)** Recovery version opens a short "lighter day" sheet: move 1 low-fit task, 2-min breathing, the phase's Rest tips.
**Content source:** PDF p. 15, 16, 21 (step 4: remove non-essentials, add one self-care item). **Backend needed:** none.
**Recommendation:** B — gives the pink recovery state a real purpose.
**Decision:** B (2026-09-24)

### #9 / #10 "Good for you" / "Watch-outs" headers (`index.html:78, 85`)
**Now:** Open phase detail.
- **A)** Keep. **B)** Open a sheet listing why each item appears (from which task or phase default).
**Content source:** PDF p. 17–20. **Backend needed:** none.
**Recommendation:** A — B overlaps with #7 B.
**Decision:** A (2026-09-24, recommendation accepted)

### #11 Insight icons (`app.js:611`)
**Now:** Not interactive (labels only).
- **A)** Keep static. **B)** Tap → tooltip.
**Recommendation:** A. **Content source:** none. **Backend needed:** none.
**Decision:** A (2026-09-24, recommendation accepted)

### #12 "View Full Calendar →" (`index.html:96`)
**Now:** Opens Cycle Plan.
- **A)** Keep. **Recommendation:** A. **Content source/Backend:** none.
**Decision:** A (2026-09-24, recommendation accepted)

### #13 Week day buttons (`app.js:635`)
**Now:** Select a day → its tasks show below; phase dot per day; small dot if the day has tasks. Current week only.
- **A)** Keep. **B)** Add ‹ › to move between weeks.
**Content source:** none. **Backend needed:** tasks (exists).
**Recommendation:** A — Cycle Plan's month view covers other weeks (see #20).
**Decision:** A (2026-09-24, recommendation accepted)

### #14 Event row (`app.js:663`)
**Now:** Expands a detail line (type + fit explanation) with Delete.
- **A)** Keep. **B)** A + "Edit" (reuses the add-task dialog, prefilled).
**Content source:** PDF p. 20 (better-phase wording). **Backend needed:** update task.
**Recommendation:** B — fixing a typo or time without deleting is expected.
**Decision:** B (2026-09-24)

### #15 Delete task (`app.js:672`)
**Now:** Deletes immediately, no undo.
- **A)** Keep. **B)** Confirm dialog. **C)** Delete + "Undo" toast (5 s).
**Content source:** none. **Backend needed:** none.
**Recommendation:** C — fastest flow that still protects against mis-taps.
**Decision:** C (2026-09-24)

### #16 "+ Add task" (`index.html:103`) and #17 Add-task dialog (`index.html:419–450`, `app.js:1415`)
**Now:** Title, type (11 types), date, start/end (end after start); saves; closes; list + score update.
- **A)** Keep. **B)** A + show the level live ("High Sync on this day") under the type select.
**Content source:** task-type mapping (PDF p. 20). **Backend needed:** tasks.
**Recommendation:** B — teaches the scoring while planning; small change.
**Decision:** B (2026-09-24)

### Cycle Plan

### #18 Calendar icon (`index.html:117`)
**Now:** Jumps the month calendar back to this month.
- **A)** Keep. **Recommendation:** A. **Content source/Backend:** none.
**Decision:** A (2026-09-24, recommendation accepted)

### #19 Month ‹ › (`index.html:137–138`)
**Now:** Previous/next month; works across years.
- **A)** Keep. **Recommendation:** A.
**Decision:** A (2026-09-24, recommendation accepted)

### #20 Month day numbers (`app.js:750`)
**Now:** Not interactive.
**Purpose:** Tapping a date is the most natural action in a calendar.
- **A)** Keep static.
- **B)** Tap → sheet: date, cycle day, phase (estimated), that day's tasks, "Add task" prefilled with the date.
**Content source:** none. **Backend needed:** tasks.
**Recommendation:** B.
**Decision:** B (2026-09-24)

### #21 Legend items (`app.js:812`)
**Now:** Open phase detail for that phase.
- **A)** Keep. **Recommendation:** A.
**Decision:** A (2026-09-24, recommendation accepted)

### #22 Track Today "+" (`index.html:152`) and #23 tiles (`app.js:835`)
**Now:** Open the log sheet (tile focuses its field); tiles show today's values or "–".
- **A)** Keep. **B)** A + a 7-day mini history in the sheet (values only, no interpretation).
**Content source:** prototype brief (fields). **Backend needed:** logs.
**Recommendation:** A — B has no mockup and adds interpretation risk.
**Decision:** A (2026-09-24, recommendation accepted)

### #24 Log sheet (`index.html:455–469`, `app.js:878`)
**Now:** Energy slider 0–10, mood / focus / sleep pills, Save; values saved per day.
- **A)** Keep. **B)** A + "Clear today's log".
**Recommendation:** A.
**Decision:** A (2026-09-24, recommendation accepted)

### #25 Phase Focus "›" (`index.html:161`) and #26 tiles (`app.js:895`)
**Now:** All open the same phase detail.
- **A)** Keep. **B)** Each tile scrolls to its matching section (Work / Move / Eat).
**Content source:** PDF p. 14, 17–20. **Backend needed:** none.
**Recommendation:** B.
**Decision:** B (2026-09-24)

### #27 Phase detail screen (`index.html:393–400`, `app.js:922`)
**Now:** Name, POWR, user's day range, tagline, Work / Move / Eat lists (4 items each), source note.
- **A)** Keep.
- **B)** Richer, from the notes: one "what's happening" hormone line, 5–6 items per list, "Six steps for cyclical planning" (PDF p. 21) on Work, evidence note ("research on phase-based exercise and food is limited").
**Content source:** PDF p. 9, 11–12, 14, 17–21; McNulty 2020; Colenso-Semple 2023. **Backend needed:** none.
**Recommendation:** B (content moves to `content.js` if D5 = B).
**Decision:** B (2026-09-24)

### AI Coach

### #28 Clock button (`index.html:175`)
**Now:** Scrolls to the chat, or focuses the input if empty. Chat is lost on reload.
- **A)** Keep.
- **B)** Persist chat (last 50 messages); clock → scroll to history; add "Clear chat".
**Content source:** none. **Backend needed:** chat messages.
**Recommendation:** B — a "history" icon with no history is misleading.
**Decision:** B (2026-09-24)

### #29 Ask form + send (`index.html:194–197`, `app.js:1195`)
**Now:** Keyword match → 4 topics or fallback reply.
- **A)** Keep.
- **B)** More topics from the notes: "What phase am I in?", "How is my score calculated?", "Plan my week" (six steps, PDF p. 21), "I feel overwhelmed" (energy leaks, PDF p. 16).
**Content source:** PDF p. 6, 16, 21. **Backend needed:** none.
**Recommendation:** B.
**Decision:** B (2026-09-24)

### #30 Question chips (`app.js:1065`), #31 "Start … min" in a reply (`app.js:1078`)
**Now:** Chips send the question; reply button opens the timer.
- **A)** Keep. **Recommendation:** A.
**Decision:** A (2026-09-24, recommendation accepted)

### #32 "See All" (`index.html:209`) and #33 session cards (`app.js:1105`)
**Now:** See All toggles a 2×2 grid; cards open the guided timer.
- **A)** Keep. **Recommendation:** A.
**Decision:** A (2026-09-24, recommendation accepted)

### #34 Timer dialog: Start/Pause/Resume (`index.html:485`), Close (`index.html:477`)
**Now:** Countdown, 4-in / 6-out breathing cue, 3 tips; closing stops it.
- **A)** Keep. **B)** Different pattern per session (e.g. energy = shorter even breaths).
**Content source:** not in the PDF; no health claims made. **Backend needed:** none.
**Recommendation:** A — B would need a source we don't have.
**Decision:** A (2026-09-24, recommendation accepted)

### Settings

### #35 Bell with red dot (`index.html:225`)
**Now:** Scrolls to Notifications; the red dot never clears.
- **A)** Keep.
- **B)** Opens a sheet with "This week's insight" (current + next phase, generated from the user's data) when Weekly insight is on, otherwise "No notifications"; dot clears once seen this week.
**Content source:** PDF p. 17–20. **Backend needed:** `prefs.insightSeenWeek`.
**Recommendation:** B — a permanent unread dot is a small but visible bug.
**Decision:** B (2026-09-24)

### #36 Your Profile card (`index.html:234`)
**Now:** "Coming soon" toast.
- **A)** Keep coming soon.
- **B)** Profile screen: first name (optional), used in the Coach greeting and avatars.
**Content source:** none. **Backend needed:** `profile`.
**Recommendation:** B if D4 = B.
**Decision:** B (2026-09-24, recommendation accepted)

### #37 Integrations "See All" (`index.html:247`) and #38 integration cards (`app.js:1255`)
**Now:** See All adds Outlook/Garmin/Oura; tapping a card flips Connected / Not connected (saved, nothing happens); note says demo.
- **A)** Keep fake toggle.
- **B)** Tap → sheet: what the integration would do + "Coming soon"; status only "Connected" in `?demo=1`.
- **C)** Real Google Calendar via `.ics` file import into tasks.
**Content source:** prototype brief. **Backend needed:** C: parse ICS, map events to task type "meeting".
**Recommendation:** B — outside demo mode, showing "Connected" for something that isn't is a hidden-bug-grade lie.
**Decision:** B (2026-09-24)

### #39 Weekly insight switch (`index.html:264`)
**Now:** Saved; no effect.
- **A)** Keep. **B)** Controls whether the bell shows the weekly insight (#35 B).
**Recommendation:** B.
**Decision:** B (2026-09-24)

### #40 Cycle settings row (`index.html:271`) and #41 form (`index.html:323–340`, `app.js:1304`)
**Now:** Edit + validate + save; view-only in `?demo=1`.
- **A)** Keep. **B)** A + D6 range.
**Recommendation:** B.
**Decision:** B (2026-09-24, recommendation accepted)

### #42 Data & privacy row (`index.html:276`) and Reset all data (`index.html:357`)
**Now:** Privacy note; reset asks with native `confirm()` then reloads.
- **A)** Keep. **B)** A + "Export my data (JSON)" + styled confirm sheet.
**Content source:** none. **Backend needed:** read all `cyclesync.*` keys.
**Recommendation:** B — export is the natural pair to "your data stays on this device".
**Decision:** B (2026-09-24)

### #43 Appearance (`index.html:281`)
**Now:** "Coming soon".
- **A)** Keep. **B)** Text size (normal / large). **C)** Dark mode.
**Recommendation:** A — C is a large CSS job; not demo-critical.
**Decision:** A (2026-09-24, recommendation accepted)

### #44 Doctor report (`index.html:286`)
**Now:** Downloads a `.txt` summary (settings, today, phase ranges, next period, disclaimer).
- **A)** Keep. **B)** A + last 30 days of logs. **C)** Printable page (browser "Save as PDF").
**Content source:** NHS (estimate wording). **Backend needed:** logs.
**Recommendation:** B.
**Decision:** B (2026-09-24)

### #45 Help & FAQs row (`index.html:300`) and #46 FAQ items (`index.html:369–386`)
**Now:** 5 expandable questions.
- **A)** Keep. **B)** A + "How is the score calculated?" + "How accurate are the phase dates?" (NHS ovulation wording) + "What does the research say?" (evidence summary with sources).
**Content source:** NHS; McNulty 2020; Colenso-Semple 2023; Jang 2025.
**Recommendation:** B.
**Decision:** B (2026-09-24)

### #47 Contact us (`index.html:305`)
**Now:** "Coming soon".
- **A)** Keep. **B)** `mailto:` link (needs an address).
**Recommendation:** B if you give me an address, else A.
**Decision:** B — `mailto:praphull371@gmail.com` (2026-09-24)

---

# AI Coach (real LLM) — Phase 1 findings + Phase 2 options (2026-09-24)

## Findings

**Coach UI today** (all scripted, no network):

| Element | Location | Now |
|---|---|---|
| Clock (history) | `index.html:180`, handler `app.js` click handler | Scrolls to saved chat, or toast "No chat yet" |
| Greeting | `index.html:191` | "Hi {name}" from profile |
| Ask form + input + send | `index.html:199–202`, `app.js:1283` | Keyword match → scripted reply (`findTopic` `app.js:1121`, `askCoach` `app.js:1180`) |
| Question chips (4) | `index.html:205`, `renderCoachChips` `app.js:1126` | Static 4 topics from `content.js` |
| Demo note | `index.html:206` | "Demo coach: pre-written replies, not real AI." |
| Chat | `index.html:208`, `renderChat` `app.js:1149` | Bubbles, plain text, saved on device (50 msgs) |
| Clear chat | `index.html:210`, `clearChat` `app.js:1159` | Clears + Undo |
| Suggested sessions + timer | `index.html:216–221, 494` | Guided breathing timer (not LLM) — unchanged |

**Backend:** none. Static site (GitHub Pages); all data in the browser (`store`, D1). **Phase/day:** computed client-side
(`getCycleState`, `getPhaseRanges`, luteal-anchored, D3). **Knowledge:** `reference/CONTENT_NOTES.md` exists (local,
gitignored — copyrighted source); `content.js` holds our paraphrased phase content.

**Environment:** Python 3.14 available; **Node is not installed**; `python3 -m venv` fails until
`sudo apt install python3-venv` (no pip/ensurepip). No `ANTHROPIC_API_KEY` set.

**Current models (docs checked 2026-09-24, platform.claude.com):**

| Model | ID | Input / output per MTok | Cache read | Latency | Notes |
|---|---|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | $4 / $20 | $0.20 | Moderate | Docs' recommended default; thinking always on, effort default `medium` |
| Claude Sonnet 5 | `claude-sonnet-5` | $2 / $10 | $0.20 | Fast | Knowledge cutoff Jan 2026 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 | $0.10 | Fastest | Knowledge cutoff Feb 2025; min cacheable prompt 4,096 tokens |

**Constraint found:** the brief says the client sends only the message + a conversation ID, but all cycle data lives
on the device (D1), so the server cannot know phase/day unless the client sends a small context object (see C5).

## Decisions

### C1 Where the backend runs
- **A)** Local Python server on the laptop that serves the app **and** `POST /api/coach` (same origin, no CORS). The GitHub Pages copy shows the coach as offline (C9).
- **B)** Deploy the backend to a host (Render/Fly/Railway) and point the Pages frontend at it (CORS, secrets on the host, health data passes through that host).
- **C)** Serverless function (Cloudflare Workers / Vercel) — needs Node tooling, which isn't installed.
**Trade-offs:** A = zero infra, safe by Friday, only works where the laptop runs (phone blocked on guest Wi-Fi). B = works on any phone, but more setup, a hosting account and a privacy review.
**Recommendation:** A now; server URL is one config value so B is a contained follow-up.
**Decision:** A (2026-09-24)
**Update (2026-09-24): B on Render** — user wants a public link for any network. `render.yaml` Blueprint (free plan,
Python 3.14, server serves app + API, key entered in Render's dashboard). Per-visitor limit via proxy headers
(`FORWARDED_ALLOW_IPS=*`), plus a global daily cap (`RATE_LIMIT_GLOBAL_PER_DAY=300`) so the public link can't drain the
free Gemini quota. Free plan sleeps after 15 min; SQLite history is ephemeral there.

### C2 Server stack
- **A)** FastAPI + uvicorn + `anthropic` (AsyncAnthropic) + `python-dotenv`: async SSE streaming, typed request validation.
- **B)** Python stdlib `http.server` + `anthropic` only: fewer deps, hand-rolled validation/streaming/threading.
**Recommendation:** A — standard, reviewable, fewer hand-rolled parts. One-time `sudo apt install python3-venv`.
**Decision:** A (2026-09-24)

### C3 Model
- **A)** Claude Opus 5.5 at effort `low` (tunable). Best quality/safety nuance; ~$0.02/message; moderate latency (streaming hides most of it).
- **B)** Claude Sonnet 5. Fast, ~$0.01/message, slightly less nuance.
- **C)** Claude Haiku 4.5. Fastest, ~$0.005/message, older knowledge, prompt too small to cache.
**Recommendation:** A (docs' recommended default); switchable via `COACH_MODEL` in `.env`.
**Decision:** A — `claude-opus-5-5`, effort `low` (2026-09-24)
**Update (2026-09-24): Gemini is the default.** No free Anthropic API credits were available, so the user chose Google
Gemini's free tier (options considered: Gemini, Groq, local Ollama — laptop has 5.7 GB RAM, too little — or offline only).
`COACH_PROVIDER=gemini` (default, `gemini-3.8-flash`, thinking level `low`, official `google-genai` SDK) or `claude`
(unchanged code path). Trade-off: on the free tier Google may use prompts to improve its products; the in-app note and
the privacy screen say so. Gemini has no mid-conversation system message, so the user context is an `<app_context>`
block at the start of the user turn; caching is Gemini's implicit prefix caching.
**Busy models (2026-09-24):** free-tier models often return 503 "high demand". Decision: auto fallback — try
`gemini-3.8-flash`; if it is busy (429/5xx), even mid-answer, restart on `gemini-3.5-flash-lite`, then `gemini-3.1-flash-lite`
(`COACH_FALLBACK_MODELS`, minimal thinking for speed; the UI clears the partial answer on a `reset` event).

### C4 Knowledge grounding
- **A)** Condensed knowledge file (~2–3K tokens, our own paraphrase of CONTENT_NOTES + evidence notes + excluded topics) in the system prompt, prompt-cached.
- **B)** Retrieval over chunks (embeddings + vector store).
**Recommendation:** A — the corpus is small; retrieval adds infra and misses for no gain. Knowledge file is committed (paraphrase, like `content.js`).
**Decision:** A (2026-09-24)

### C5 Personal context per turn
- **A)** Minimal: date, cycle day/length, phase + day range, next phase and when.
- **B)** A + today's tasks (title, time, type, level) + today's score + last 7 days of check-ins.
- **C)** B + a "goals" field (new, set in Profile).
Never sent: name, email, raw chat outside the current conversation. Sent by the client as a small validated JSON object;
injected as a per-turn system message after the history (keeps the system prompt cache intact).
**Recommendation:** B — enough to personalise ("your 10:00 client presentation"); goals don't exist yet (C adds scope).
**Decision:** B (2026-09-24)

### C6 Conversation history
- **A)** Session only (server memory; lost on restart while the device still shows the chat → mismatch).
- **B)** Persisted server-side in SQLite by conversation ID; model gets the last 20 messages (plus a token cap); "Clear chat" deletes it server-side and starts a new ID.
- **C)** Client sends the full history each turn (contradicts the brief; larger payloads).
**Recommendation:** B.
**Decision:** B (2026-09-24)

### C7 Streaming
- **A)** Stream tokens (SSE) with a typing indicator until the first token.
- **B)** Single response.
**Recommendation:** A — Opus-tier first-token latency is noticeable on a phone.
**Decision:** A (2026-09-24)

### C8 Suggestion chips
- **A)** Keep the 4 static chips. **B)** 4 phase-aware chips from `content.js` (e.g. Ovulatory: "How do I nail today's presentation?"). **C)** B + model-suggested follow-ups after each answer.
**Recommendation:** B — personal at zero cost; C adds tokens + parsing.
**Decision:** B (2026-09-24)

### C9 When the server is unreachable (e.g. GitHub Pages)
- **A)** Error state + Retry only.
- **B)** Error state + Retry, and fall back to the existing scripted replies, clearly labelled "Offline coach".
**Recommendation:** B — the public link stays useful; no silent failures.
**Decision:** B (2026-09-24)

Fixed (no decision needed): API key only in server `.env` (gitignored, `.env.example` committed); input limit 1,000 chars;
per-IP rate limit (10/min, 200/day, in memory); request timeout 60 s; no message content in logs; in-app note that
messages are processed by an AI provider (Google Gemini by default, or Anthropic Claude).
