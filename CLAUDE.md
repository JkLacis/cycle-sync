# Cycle Sync — project brief

Phone-style web app prototype. Demo: **Friday 2026-09-25**.
Owner: JekabsL — first-year Start School / Qwasar student, complete beginner.

## How we work (important)
- **Teach while building**: plain-language explanations, define jargon on first use, keep it short.
- Before writing code for a step, show a short plan and **wait for OK**.
- **One step at a time.** After each step: explain exactly how to see the result, then stop and wait for feedback.
- **No unrequested features.** Suggest ideas; the user decides.
- Commit after each working step with a clear message. Explain new git commands the first time.
- Keep this file updated whenever a new decision is made.

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
1. **Onboarding**: first day of last period (date picker, no future dates), cycle length
   (default 28, 21–35), period length (default 5, 3–7). Validate inputs. Note:
   "For general wellness only. Not medical advice, and not for contraception."
2. **Today** (main): phase name, "Day X of Y", one-line phase summary, days until next phase,
   then three cards: Move, Eat, Work.
3. **Calendar**: month view, each day tinted with phase colour **and** a small phase letter
   (don't rely on colour alone). Prev/next month arrows. Today highlighted.
4. **Phase detail**: tap a phase (from Today or the Phases list) to see full content.
- Navigation: bottom tab bar — Today, Calendar, Phases. Settings (edit data / reset) reachable from Today.
- **Demo mode**: URL contains `?demo=1` → small panel to pretend it's a different date.

## Cycle logic (use exactly this)
Days numbered from 1.
- `cycleDay = (daysSinceLastPeriodStart mod cycleLength) + 1` (predicts forward past several cycles)
- `ovulationDay = cycleLength - 14`
- Menstrual: 1 … periodLength
- Follicular: periodLength + 1 … ovulationDay - 2
- Ovulatory: ovulationDay - 1 … ovulationDay + 1
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
Soft, warm, premium. Rounded cards, generous spacing, system font.
Phase colours (exact shades TBD, user will give feedback): Follicular = sage green,
Ovulatory = warm gold/coral, Luteal = terracotta/amber, Menstrual = deep berry/plum.

## Build order / progress
1. [x] git init + CLAUDE.md
2. [ ] File structure + phone frame + bottom tab bar (empty screens)
3. [ ] Cycle logic functions + console check
4. [ ] Onboarding screen
5. [ ] Today screen
6. [ ] Calendar
7. [ ] Phase detail
8. [ ] Demo mode + polish + run on phone

## Decisions log
- Git branch: `main`. Commit author: JekabsL.
