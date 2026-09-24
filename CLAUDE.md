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
- Done: steps 1–2. All open decisions answered (see "Decisions" below).
- `implementation-plan.md` is the build plan — follow it step by step, next unticked step first (step 3: new look + 4-tab dock).
- Demo is **Friday 2026-09-25** — keep scope small; steps 9–11 can be cut/simplified if time runs out.

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
1. Tasks: **user-typed only** (no sample data). Task = title, date, type. localStorage.
2. Score: % of tasks in the next 7 days whose type suits the phase on that task's day
   (task-type → phase table in the plan). Wins = up to 3 suited, watch-outs = up to 3 unsuited.
3. Real: logging, tasks, score, calendar, phase tips. Mock: AI Coach (scripted + real breathing timer),
   Settings integration toggles. **Energy leak audit dropped.**
4. Calendar on **both**: Alignment = week strip + tasks; Cycle Plan = full month calendar.
5. Palette "cool spectrum" (see Style).
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
- Plain HTML/CSS/JS, three files: `index.html`, `style.css`, `app.js`. No frameworks, npm or build tools.
- Single-page app: screens are `<section>`s shown/hidden with JS, no reloads.
- Data in `localStorage` (no backend, no login).
- Mobile-first. On wide screens, show the app centred in a ~390px phone frame.
- Run: `python3 -m http.server 8000` → http://localhost:8000. On phone (same Wi-Fi):
  `http://<laptop-local-IP>:8000` (find IP with `hostname -I`). User is on Kubuntu 26.04.

## Screens
- Bottom dock, 4 tabs: **Alignment · Cycle Plan · Coach · Settings** (icons + labels).
- **Onboarding** (first visit): last period start (no future dates), cycle length (default 28, 21–35),
  period length (default 5, 3–7). Validate. Note: "For general wellness only. Not medical advice, and not for contraception."
- **Alignment**: header "Day X · <Phase> Phase · <POWR>", score ring, 3 wins + 3 watch-outs, week strip + tasks + add task.
- **Cycle Plan**: month calendar (phase colour **and** letter, today highlighted, prev/next), phase overview,
  tap phase → phase detail (Move/Eat/Work), quick logging.
- **Coach**: scripted chat, 2-min breathing reset, phase scripts. Labelled as demo, not real AI.
- **Settings**: edit cycle data, reset, fake integration toggles, privacy note.
- **Demo mode**: URL contains `?demo=1` → small panel to pretend it's a different date.

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
Sleek, premium "health intelligence tool" — not a period tracker. **No pink/purple.** Rounded cards, generous spacing, system font.
Base bg #eef4fb, text #1f3350, accent green #3fa77a.
Phases: Follicular #3fa7a0 teal · Ovulatory #6bbf59 green · Luteal #4a6fa5 slate blue · Menstrual #2e3d5c navy.

## Build order / progress
See `implementation-plan.md` (steps 1–12 with "done when" criteria). Steps 1–2 done.

## Decisions log
- `reference/` (gitignored, never push — repo is public): mentor's example files from another project
  ("24" build spec, implementation plan, ClAUDEE.md). Used only as a model for spec/plan format.
- User on Pro plan; start a fresh session per step to save usage (this file carries the context).
- Git branch: `main`. Commit author: JekabsL. Remote `origin` = https://github.com/JkLacis/cycle-sync (public). `gh` CLI logged in as JkLacis.
- Screens are `<section class="screen" id="screen-NAME">`, toggled via the `hidden` attribute by `showScreen(name)`.
  Screen names: onboarding, today, calendar, phases, phase-detail, settings.
- Tabs are `<button class="tab" data-screen="NAME">`; active tab gets class `active`.
- Phone frame kicks in at `min-width: 600px` (390×844, dark bezel). Below that the app fills the screen.
- Colours are CSS variables in `:root` of style.css (palette in Style section).
- `pandoc` not installed; read .docx with `unzip -p file.docx word/document.xml | sed 's/<[^>]*>//g'`.
