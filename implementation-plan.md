# Cycle Sync — Implementation Plan

**Implements:** `CLAUDE.md` + prototype doc (`reference/prototype.docx`, local only)
**Written:** 2026-09-24 · **Demo:** Friday 2026-09-25

## How to use
- One step at a time. Plan → OK → build → check every "done when" box → tick the step → commit + push.
- Order puts the demo's "aha" screen (Alignment) early. If time runs out, steps 9–11 can be cut or simplified.
- Check logic from the browser console (F12 → Console) where a criterion says so.

## Decisions (2026-09-24)
| Area | Decision |
|---|---|
| Tabs | 4-tab bottom dock: Alignment · Cycle Plan · Coach · Settings |
| Tasks | User-typed. Each task: title, date, start/end time, type. Saved in localStorage. Sample week only with `?demo=1`. |
| Score | **Today only.** Each task rated High Sync (100) / Good (75) / Moderate (60) / Low Sync (0) for today's phase; score = average, 0–100. No tasks → "–". Score < 50 → pink "recovery" look. *(updated 2026-09-24, final design)* |
| Good for you / Watch-outs | Exactly 3 short labels each: Good = today's High Sync task types first; Watch-outs = Low Sync, then Moderate task types; phase defaults fill the rest. |
| Calendar | Alignment: week strip + tasks. Cycle Plan: month calendar with a phase bar per week + legend (final design). |
| Real | Onboarding, tasks, score, calendar, logging (localStorage), phase tips, demo mode. |
| Mock | AI Coach = scripted replies + working breathing timer. Settings integrations = toggles that do nothing. |
| Dropped | Energy leak audit, real AI, real calendar sync, wearables, WhatsApp. |
| Overlap | Menstrual wins: Ovulatory starts at `max(periodLength + 1, ovulationDay - 1)`. |
| Palette | Match the mockup `reference/home-mockup.webp` (see below). |

### Palette (updated 2026-09-24, tokens in `style.css` `:root`)
Warm off-white bg `#f6f6f3`, navy text `#1c2b45`, blue `#4f86d6` (ring, selection), sage "good" card, soft peach "watch-out" card.
Phase colours follow the Cycle Plan mockup (2026-09-24): Menstrual `#ec9ea6` soft pink · Follicular `#6f9fdf` blue · Ovulatory `#f1b548` yellow · Luteal `#6cbf8e` sage green.

### POWR labels
Follicular = Prepare · Ovulatory = Open Up · Luteal = Work · Menstrual = Rest.

### Task types → phases
High Sync = suits this phase · Low Sync = on its avoid list · Good = suits no particular phase · Moderate = suits another phase.
| Type | Suits | Avoid |
|---|---|---|
| Pitch / presentation | Ovulatory | Menstrual |
| Networking / key conversation | Ovulatory | Menstrual |
| Meeting / check-in | – | Menstrual |
| Brainstorm / new project | Follicular | Luteal |
| Planning / research | Follicular | – |
| Deep work / admin | Luteal | – |
| Wrap-up / finishing | Luteal | Follicular |
| Review / reflection | Menstrual | Ovulatory |
| High-intensity workout | Follicular, Ovulatory | Menstrual |
| Strength / Pilates / yoga | Luteal | – |
| Rest / gentle walk | Menstrual | – |

---

## Steps

### 1. [x] git init + CLAUDE.md
### 2. [x] File structure + phone frame + tab bar (empty screens)

### 3. [x] New look + 4-tab dock
- [x] Colours in `:root` match the palette above (mockup); old terracotta/plum palette gone
- [x] Tab bar has 4 tabs with simple icons + labels: Alignment, Cycle Plan, AI Coach, Settings
- [x] Each tab opens its own (still empty) screen; active tab is highlighted (blue, as in mockup)
- [x] Old screens (today, calendar, phases) renamed/removed; onboarding + phase-detail kept
- [x] Looks right in the laptop phone frame and at phone width

### 4. [x] Cycle logic (console-checkable)
- [x] `parseLocalDate("2026-09-01")` returns a local date (no UTC off-by-one)
- [x] `getCycleDay(date, settings)` works for dates before the next period too (predicts forward)
- [x] `getPhase(cycleDay, settings)` follows CLAUDE.md rules, with Menstrual winning overlaps
- [x] 28/5: day 1→Menstrual, 6→Follicular, 13→Ovulatory, 16→Luteal, 28→Luteal
- [x] 21/7: no error; day 7→Menstrual, 8→Ovulatory, 10→Luteal
- [x] `daysUntilNextPhase(date, settings)` returns a correct number
- [x] `PHASES` object holds name, POWR label, icon (colour via CSS var), one-liner, Move/Eat/Work tips (own wording)

### 5. [ ] Onboarding
- [ ] Shown on first visit (no saved settings); other tabs hidden until done
- [ ] Date picker: first day of last period, no future dates
- [ ] Cycle length 21–35 (default 28), period length 3–7 (default 5); bad input shows a message
- [ ] Disclaimer shown: "For general wellness only. Not medical advice, and not for contraception."
- [ ] Save → stored in localStorage → Alignment screen opens; reload skips onboarding

### 6. [x] Tasks (on Alignment screen)
- [x] Week strip: Mon–Sun of this week (mockup), phase-colour dot per day (phase name in its screen-reader label), small dot if it has tasks
- [x] Tap a day → shows that day's tasks below (time, title, High Sync / Good / Low Sync badge, chevron → details)
- [x] "Add task" form: title, type, date, start/end time (end must be after start)
- [x] Task can be deleted (open its details → Delete)
- [x] Tasks survive a reload

### 7. [x] Alignment dashboard (final design, updated 2026-09-24)
- [x] Header: "Cycle Sync" + calendar + avatar
- [x] Hero card with drawn flower: "DAY X" / phase name + icon / "View phase details ›" (→ phase detail); score ring 0–100 on the right
- [x] Recommendation bar "See recommendations for your current phase" (→ phase detail)
- [x] Good for you + Watch-outs side by side, exactly 3 icons each in a row
- [x] Your Calendar This Week + "View Full Calendar →"; events "10:00 – 11:00 · title · badge ›"
- [x] 4 levels: High Sync / Good / Moderate / Low Sync; demo day (`?demo=1`) scores 78 as in the mockup
- [x] Score < 50 → pink recovery look (red ring, heart + "See recommendations for recovery", green Good card)
- [x] No tasks → "–" and "No tasks today" instead of 0; wording = suggestions, no medical claims

### 8. [x] Cycle Plan (final design, updated 2026-09-24)
- [x] Header "Cycle Plan" + calendar (back to this month) + avatar
- [x] Hero card with drawn flower: Day X / phase + icon, cycle bar (segments sized by this user's phase lengths, marker = today), "Next phase: X in N days"
- [x] Month calendar: phase bar under each week, phase icon on the day each phase starts, today in blue circle; prev/next month work across year boundaries
- [x] Legend: 4 phases with icon + typical length (3–7 / 7–10 / 3–4 / 10–14 days); tap → phase detail
- [x] Phase Focus: 3 picture tiles with icon + label for the current phase → phase detail
- [x] Phase detail: POWR label, day range for this user, Move / Eat / Work tips; back button returns

### 9. [x] Quick logging = Track Today (final design, updated 2026-09-24)
- [x] 4 tiles: Energy x/10, Mood, Focus, Sleep with today's value ("–" until logged)
- [x] Tap a tile or + → sheet: energy 0–10 slider, mood (Low/Okay/Good/Great), focus (Low/Medium/High), sleep (<8h / 8h / >8h)
- [x] Save → stored per date in localStorage (`cyclesync.logs`); reopening today shows saved values
- [x] Phase food check-in dropped (Nutrition tile not in final design)

### 10. [x] AI Coach (scripted, matches AI Coach mockup, updated 2026-09-24)
- [x] Header "AI Coach" + clock (jumps to chat) + avatar; "Hi there 👋" card with drawn leaves
- [x] Ask your coach: question box + 4 question chips → pre-written replies based on current phase, shown as chat below; typed questions matched by keyword, else a "here's what I can help with" reply
- [x] Clear note that it's a demo coach, not real AI
- [x] Suggested for You: 4 cards with drawn scenes (Calm your mind 2 min, Boost energy 3 min, Set clear goals 2 min, Better sleep 3 min); See All → 2×2 grid
- [x] Guided timer (any card): start/pause, countdown, "breathe in / out" cue (4 in, 6 out) + 3 phase tips; closing stops it
- [x] Phase scripts: boundaries (Luteal/Menstrual), intentions & outreach (Follicular/Ovulatory)

### 11. [x] Settings (matches Settings mockup, updated 2026-09-24)
- [x] Header "Settings" + bell with dot (jumps to Notifications) + avatar; Your Profile card (coming soon)
- [x] Integrations: WhatsApp, Google Calendar (on) + Apple Health (off) as in mockup; tap = switch Connected/Not connected (saved, does nothing); See All adds Outlook, Garmin, Oura; "demo, coming soon" note
- [x] Notifications: Weekly insight switch (saved, for show)
- [x] Cycle settings screen: edit cycle data (same validation as onboarding: no future date, 21–35, 3–7); saving updates all screens; view-only in `?demo=1`
- [x] Data & privacy screen: "data stays on this device" note + "Reset all data" with confirm (removes only `cyclesync.*` keys)
- [x] Doctor report: downloads a .txt summary (settings, today's day/phase, phase day ranges, next period, not-medical-advice line)
- [x] Help & FAQs screen (5 questions); Appearance, Contact us, Profile → "coming soon" message

### 12. [ ] Demo mode + polish + phone
- [ ] `?demo=1` shows a small panel to pick a pretend date; all screens follow it
- [ ] Can show all 4 phases in the demo by changing the date
- [ ] No console errors; text readable on phone
- [ ] Runs on the phone over Wi-Fi (`http://<laptop-IP>:8000`)
