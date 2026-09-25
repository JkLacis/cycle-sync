# Cycle Sync — project brief

Phone-style web app prototype. Demo: **Friday 2026-09-25**.
Owner: JekabsL — first-year Start School / Qwasar student.
Collaborator: **Praful** (RTU student, experienced app/startup developer) — works on this laptop with JekabsL and may give
instructions. Technical language is fine when he is driving; keep it simple for JekabsL.

## How we work (important)
- **No teaching.** Goal is to finish the project. Keep replies short; no jargon lessons or in-depth explanations unless asked.
- Say where to run each command (Konsole + folder, e.g. `~/Desktop/Cycle-Sync`).
- Before writing code for a step, show a short plan and **wait for OK**.
- **One step at a time.** After each step: say how to see the result, then stop and wait for feedback.
- **No unrequested features.** Suggest ideas; the user decides.
- Commit after each working step with a succinct message, then `git push`.
- **Open decisions → ask with AskUserQuestion** (clickable question cards), never guess.
- **Acceptance criteria**: `implementation-plan.md` lists each step with checkable "done when" criteria.
  After a step, verify each criterion, tick it `[x]`, and tick the step when all pass.
- Keep this file updated whenever a new decision is made.

## ▶ START HERE (status as of 2026-09-24)
- Done: steps 1–11 + every element in `DECISIONS.md` (built + verified 2026-09-24, 94/94 checks).
  Test: http://localhost:8000/tests/click-through.html (demo data only). README = how to run.
- `implementation-plan.md` is the build plan — step 12: demo date panel done 2026-09-25 (strip above dock →
  sheet with 4 phase buttons + date picker; URL `&date=YYYY-MM-DD`; demo tasks follow the pretend date).
  Left: phone readability check (user, via GitHub Pages/Render link).
  `DEFAULT_SETTINGS` (Day 14, 28/5) is used in demo mode and behind onboarding; `hasSettings()` decides onboarding.
- Demo is **Friday 2026-09-25** — keep scope small; steps 9–11 can be cut/simplified if time runs out.
- **AI coach (Praful's prompt), in progress:** server + frontend + eval runner built and pushed (commits 11d047f,
  79bb7ce, 7b2bde9). No free Anthropic credits → switched default to **Gemini free tier** (2026-09-24, DECISIONS C3).
  Busy-model fallback built (c83a16c): 3.8-flash → 3.5-flash-lite → 3.1-flash-lite, `reset` SSE event. Free tier was
  very overloaded (503s, 10–50 s answers) on 2026-09-24 evening.
  **Key status:** the first Gemini key leaked into chat (pasted into `.env.example`, never pushed) and is now revoked
  (401). The one in `.env` is that dead key → user must paste a NEW key in `.env` (never in chat, never `.env.example`;
  check only that it's non-empty and test with a tiny call). Eval run 20260924-200616: only #2, #3 answered (not graded).
  **Render plan built 2026-09-24 (user asked for the link):** `render.yaml` (python, free, build
  `pip install -r server/requirements.txt`, start `python -m server`, health `/api/health`, `GEMINI_API_KEY` sync:false,
  HOST 0.0.0.0, PORT from Render), `.python-version` 3.14, trust proxy X-Forwarded-For only when env says so (per-IP
  limit), global daily cap (~300 msgs) to protect the free quota, README. User then: new key → render.com sign-up with
  GitHub → New → Blueprint → JkLacis/cycle-sync → paste key → Deploy. Free plan sleeps after 15 min (~1 min wake),
  SQLite history wiped on sleep.
  **Next = Phase 4 (after new key):**
  Then: `RATE_LIMIT_PER_MINUTE=100 .venv/bin/python -m server` → `/api/health` says "ready" →
  `.venv/bin/python -m server.evals.run_evals --delay 6` (27 cases, free) → grade each answer (accuracy, personalization,
  tone, length, safety) → write `COACH_EVALS.md` → fix prompt/code, re-run until all pass → check caching (`cached` tokens) in
  server logs → verify coach UI at 390px → final summary (architecture, decisions, eval results, limits, cost/message).

## Prototype doc summary (`reference/prototype.docx`)
- **Look**: sleek, premium, professional "health intelligence tool", not a period tracker.
  **Pale/soft blue main, green accent. No pink/purple/"girly" styling.**
- **Bottom dock, 4 tabs**: Alignment (dashboard) · Cycle Plan · AI Coach · Settings/Profile.
- **Alignment (main, "aha moment")**: header "Day 14 · Ovulatory Phase · Open Up";
  circular ring score (e.g. 78% Schedule Alignment) = how well today's/upcoming calendar items match the phase;
  **3 wins** + **3 watch-outs** (e.g. pitching in Ovulatory = win; admin-heavy work in Ovulatory, stressful
  meetings in Menstrual, missing complex carbs in Luteal = watch-outs).
  User also wants a **calendar with tasks below**, on this same screen.
- **Cycle Plan**: colour-coded cycle wheel + linear calendar; phases with POWR labels:
  Follicular = Prepare, Ovulatory = Open Up, Luteal = Work, Menstrual = Rest.
  Quick logging: energy 0–10, mood, focus; sleep (<8h / 8h / >8h); phase food check-ins.
- **AI Coach**: chat coach; 2–3 min breathing/grounding resets; phase-specific scripts; "energy leak audit".
- **Settings**: Google Calendar/Outlook sync, wearables, WhatsApp daily summary, privacy.
- **Not feasible for real by Friday (static app, no backend)**: Google Calendar sync, real AI chat,
  wearables, WhatsApp → mocked (confirmed): scripted coach, non-functional toggles.

## Decisions (2026-09-24) — details in `implementation-plan.md`
1. Tasks: user-typed. Task = title, date, start/end time, type. localStorage.
   Sample week (like the mockup) loads **only with `?demo=1`**. *(updated 2026-09-24)*
2. Score: **today only** — average of today's tasks: High Sync 100 · Good 75 · Moderate 60 · Low Sync 0.
   No tasks today → "–". Score < 50 → pink "recovery" look on Alignment.
   Good for you / Watch-outs = always exactly 3 short labels each: from today's task types first (Watch-outs:
   Low Sync then Moderate), phase's own strengths/watch-outs fill the gaps. *(updated 2026-09-24, final design)*
3. Real: logging, tasks, score, calendar, phase tips. Mock: AI Coach (scripted + real breathing timer),
   Settings integration toggles. **Energy leak audit dropped.**
4. Calendar on **both**: Alignment = week strip + tasks; Cycle Plan = month calendar with phase bars + legend (final design).
5. Palette: **match the mockup** `reference/home-mockup.webp` (warm off-white, blue, sage green, soft peach watch-outs). See Style. *(updated 2026-09-24)*
   Phase colours follow the Cycle Plan mockup: Menstrual soft pink, Follicular blue, Ovulatory yellow, Luteal sage green.
6. Short-cycle overlap: **Menstrual wins**.
7. Keep onboarding, demo mode `?demo=1`, Move/Eat/Work tips (shown in phase detail from Cycle Plan).

## Sources and content rules
- `reference/in-the-flo.pdf` = excerpt of *In the FLO* (Alisa Vitti, © HarperCollins, all rights reserved).
  **Never commit it; never copy its text into the app** — write our own short paraphrased suggestions.
- Evidence for cycle syncing is limited: frame tips as "suggestions inspired by *In the FLO*", not
  "research-proven". Avoid medical claims (e.g. "adrenal fatigue", "cortisol spike risk").
- `reference/` is gitignored. Everything in it stays local.

## Concept
"Cycle Sync" — cycle-syncing app for high-performing women. Based on which of the
four cycle phases she's in, it suggests how to **move**, what to **eat**, and what kind of **work** suits her energy.

## Tech
- Plain HTML/CSS/JS, four files: `index.html`, `style.css`, `content.js` (all app text, data only), `app.js` (logic).
  No frameworks, npm or build tools. *(content.js added 2026-09-24, DECISIONS.md D5)*
- **Languages (2026-09-25):** en (content.js) + lv, lt, et, pl, de, fr, es, it in `lang/<code>.js`
  (`CONTENT_TRANSLATIONS.<code>`, same keys, text only; merged over CONTENT by `loadLanguage()` before `start()`).
  Pick order: `?lang=xx` (not saved) → saved `cyclesync.lang` → phone language → English. Settings → Language and
  a pill on the welcome screen; choosing reloads. Screen labels: `data-i18n*` attributes + `CONTENT.ui`, `t(key, vars)`,
  `plural()`, `{xLower}` = lower-case value. English item names stay the keys (`itemLabels` = shown names).
  Saved values (log options, task types) stay English. AI coach gets `context.language` and answers in it.
  Check completeness: http://localhost:8000/tests/i18n-check.html. Translations are drafts → native-speaker review.
- AI coach backend: `server/` (Python FastAPI), run `.venv/bin/python -m server` (serves the app too).
  Provider via `COACH_PROVIDER`: **gemini** (default, free tier, `google-genai`, `gemini-3.8-flash`) or claude
  (`anthropic`, `claude-opus-5-5`); code in `server/providers/`. API keys only in `.env` (gitignored). Decisions C1–C9 in DECISIONS.md. System prompt `server/prompts/coach.md`,
  knowledge `server/prompts/knowledge.md` (our paraphrase). Evals: `server/evals/`, results in `COACH_EVALS.md`.
- Single-page app: screens are `<section>`s shown/hidden with JS, no reloads.
- Data in `localStorage` (no backend, no login).
- Mobile-first. On wide screens, show the app centred in a ~390px phone frame.
- **Public link with AI coach (Render, from `main`, auto-deploys on push):** https://cycle-sync-3dtv.onrender.com
  (demo: `?demo=1`; free plan sleeps after 15 min, ~1 min wake). Verified 2026-09-24: health ready, coach answers,
  `.env`/`server/` 404. Key lives in Render's dashboard; local `.env` still has the dead key.
- **Live (GitHub Pages, from `main`, updates ~1 min after each push):** https://jklacis.github.io/cycle-sync/
  (demo: add `?demo=1`). Use this for phone testing — the "Startup House Guest" Wi-Fi + ufw block phone → laptop.
- Run: `.venv/bin/python -m server` → http://localhost:8000 (with AI coach), or `python3 -m http.server 8000` (offline coach). On phone (same Wi-Fi):
  `http://<laptop-local-IP>:8000` (find IP with `hostname -I`). User is on Kubuntu 26.04.

## Screens
- Bottom dock, 4 tabs: **Alignment · Cycle Plan · Coach · Settings** (icons + labels).
- **Onboarding** (first visit): last period start (no future dates), cycle length (default 28, 21–35),
  period length (default 5, 2–7 — NHS range). Validate. Note: "For general wellness only. Not medical advice, and not for contraception."
- **Alignment** (final design): hero card with drawn flower (DAY X / phase + icon / View phase details, score ring
  "78 /100 Cycle Alignment"); recommendation bar; Good for you (3) + Watch-outs (3) side by side;
  headers open a pop-up (the 3 card items first, then phase strengths/watch-outs + task types that suit/are avoided);
  every item (card + pop-up) opens a small detail pop-up on top (why + how, `CONTENT.insightDetails`). *(2026-09-25)*
  "Your Calendar This Week" + View Full Calendar, Mon–Sun strip, today's events (time, title, badge, chevron) + add task.
  Pink recovery look when score < 50.
- **Cycle Plan** (final design): hero card (Day X / phase, cycle bar with today marker, next phase in N days;
  right: "Month Alignment" wheel over the leaves = average of daily scores of days with tasks in the month shown
  below, empty days skipped, "–" if none; `calculateMonthlyAlignment()`, `buildRing(id)`/`updateRing(id, ...)`);
  legend items sit level with calendar rows 1–4 (fixed row heights, `--week-h`);
  month calendar with phase bars + phase-start icons + legend; Track Today (Energy/Mood/Focus/Sleep, logs per day);
  Phase Focus (3 tiles from `PHASES[x].focus`). Tap phase → phase detail (Move/Eat/Work).
- **Coach** (match Praful's AI Coach mockup): real AI coach (Gemini by default, or Claude, via `server/`, streamed), 4 phase-aware
  chips, safe Markdown, Retry on every failure; offline scripted coach when the server is unreachable (GitHub Pages).
  Suggested for You = 4 cards → guided breathing timer. Note names the provider (from `/api/health`); the Gemini note says free-tier messages may be used to improve Google's products.
- **Settings** (match Praful's Settings mockup): Your Profile card; Integrations (tap = fake Connected/Not connected,
  See All adds Outlook/Garmin/Oura); Weekly insight switch; App Preferences → Cycle settings screen (edit + validate,
  view-only in demo), Language sheet (9 languages), Data & privacy screen (privacy note + Reset all data), Appearance sheet (Light / Dark / Match device,
  default Match device, `prefs.theme`, `applyTheme()` sets `<html data-theme>`; deep navy night palette = `:root[data-theme="dark"]`
  in style.css — new colours must be tokens), Doctor report
  (.txt download); Support → Help & FAQs screen, Contact us (coming soon). Dock Settings icon = gear.
- **Demo mode**: URL contains `?demo=1` → "Demo · date · Change date" strip above the dock → sheet to pretend it's
  another date (`&date=YYYY-MM-DD`, page reloads). `today()` returns it; `realToday()` anchors DEFAULT_SETTINGS (real today = Day 14).

## Cycle logic (use exactly this)
Days numbered from 1.
- `cycleDay = (daysSinceLastPeriodStart mod cycleLength) + 1` (predicts forward past several cycles)
- `ovulationDay = cycleLength - 14`
- Menstrual: 1 … periodLength
- Follicular: periodLength + 1 … ovulationDay - 2
- Ovulatory: max(periodLength + 1, ovulationDay - 1) … ovulationDay + 1  (Menstrual wins overlaps)
- Luteal: ovulationDay + 2 … cycleLength
- Short cycles may make a phase zero days long — must not error.
- **Compare dates as local calendar days, not UTC.** Never `new Date("YYYY-MM-DD")` (parses as UTC → off-by-one).
  Parse Y/M/D parts manually.
- Keep logic in small, clearly named, testable functions (checkable from the browser console).

## Content (one `PHASES` object in app.js)
Order: Follicular → Ovulatory → Luteal → Menstrual.
- **Follicular** — "Creativity / fresh start". Energy rising.
  Move: light, playful cardio — dance class, jumping rope, rebounding, indoor cycling, hiking.
  Eat: fresh, light — broccoli, carrots, zucchini, green peas, oats, citrus, avocado, lentils, eggs, chicken, fermented foods (sauerkraut).
  Work: start new projects, brainstorm, tackle hard mental problems, research new ideas, plan the month ahead.
- **Ovulatory** — "Communication". Energy and confidence at their peak.
  Move: highest intensity — HIIT, kettlebells, boot camp, kickboxing, power yoga.
  Eat: lots of veg and fibre — spinach, red peppers, tomatoes, asparagus, quinoa, berries, salmon, shrimp.
  Work: important conversations, pitching, negotiating, presenting, networking, asking for a raise.
- **Luteal** — "Completion". Energy gradually winds down.
  Move: strength first, then gentler — weight lifting, Pilates, barre, yoga.
  Eat: steady, grounding, complex carbs — sweet potato, squash, brown rice, chickpeas, leafy greens, cauliflower, apples, walnuts.
  Work: deep focused work, admin, finishing/wrapping up projects, reviewing documents, organising.
- **Menstrual** — "Rest and reflection". Energy at its lowest.
  Move: rest or gentle — walking, yin yoga, gentle mat Pilates.
  Eat: warm, nourishing — soups, stews, beets, mushrooms, kale, kidney beans, berries, miso, herbal tea.
  Work: review the past month, evaluate, journal, trust your gut, set intentions for next cycle, take breaks.

**Tone**: supportive suggestions, never rules. No calorie restriction, fasting, or weight-loss framing anywhere.

## Style
Sleek, premium "health intelligence tool" — not a period tracker. Minimal, lots of whitespace, little text.
Match the mockup image (Praful's reference). Warm off-white bg, dark navy text, blue score ring,
sage-green "good" card, very soft peach "watch-out" card (no aggressive red, no pink-heavy styling).
Exact colour tokens live in `:root` of style.css.

## Build order / progress
See `implementation-plan.md` (steps 1–12 with "done when" criteria). Steps 1–11 done.

## Feature decisions (Praful's review, 2026-09-24)
- `DECISIONS.md` (repo root) = every interactive element with options + the chosen decision. Build from it.
- `reference/CONTENT_NOTES.md` (local only) = PDF content by screen with page refs + web sources + evidence notes.
- App-wide: on-device storage behind `store` (D1), current data model + `schemaVersion` (D2), luteal-anchored
  phase calc labelled "estimated" (D3), local profile with optional first name, no login (D4), content in `content.js` (D5).
- Excluded from content: fasting/calorie restriction/keto (PDF p. 13), PMS/fertility claims (p. 12), "adrenal fatigue" (p. 14).

## Decisions log
- `reference/` (gitignored, never push — repo is public): mentor's example files from another project
  ("24" build spec, implementation plan, ClAUDEE.md). Used only as a model for spec/plan format.
- User on Pro plan; start a fresh session per step to save usage (this file carries the context).
- Git branch: `main`. Commit author: JekabsL. Remote `origin` = https://github.com/JkLacis/cycle-sync (public). `gh` CLI logged in as JkLacis.
- Screens are `<section class="screen" id="screen-NAME">`, toggled via the `hidden` attribute by `showScreen(name)`.
  Screen names: onboarding, alignment, plan, coach, settings, phase-detail, cycle-settings, privacy, help.
  Sub-screens map to their tab via `SCREEN_TAB` in app.js. `data-soon="Name"` → "Name is coming soon" toast (`showToast`).
  Any button with `data-go="NAME"` also opens a screen.
- app.js sections: data (PHASES, TASK_TYPES, SYNC_LEVELS, ICONS) → date helpers → cycle logic →
  storage → `calendarSource` (the one place events come from; swap for Google/Outlook later) →
  `calculateCycleAlignment()` → demo seed → render functions per component → navigation → add-task sheet.
- Storage: only the `store` object in app.js touches localStorage (JSON read/write never throws; bad saved settings
  count as missing). Keys `cyclesync.<name>`; in `?demo=1` everything uses `cyclesync.demo.<name>` so demo never touches
  real data, and settings are fixed to Day 14. `cyclesync.schemaVersion` + `MIGRATIONS` upgrade saved data.
- `validateCycleSettings()` is shared by onboarding and Settings.
- Tabs are `<button class="tab" data-screen="NAME">`; active tab gets class `active`.
- Phone frame kicks in at `min-width: 600px` (390×844, dark bezel). Below that the app fills the screen.
- Colours are CSS variables in `:root` of style.css (palette in Style section).
- `pandoc` not installed; read .docx with `unzip -p file.docx word/document.xml | sed 's/<[^>]*>//g'`.
- Phase icons (from Cycle Plan mockup): Menstrual drop, Follicular sprout, Ovulatory sun, Luteal leaf.
- Flower illustration = `flowerSVG()` in app.js, placed via `<div class="flower ..." data-flower>`; colours from CSS vars
  `--petal-*` / `--leaf-*` (pink in recovery look). Used on Alignment, Cycle Plan, Coach, Settings.
- Demo data version: bump `DEMO_VERSION` in app.js when sample tasks/logs change (old demo data is replaced).
