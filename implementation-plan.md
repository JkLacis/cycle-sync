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
| Tasks | User-typed only (no sample data). Each task: title, date, type. Saved in localStorage. |
| Score | % of tasks in the next 7 days (today + 6) whose type suits the phase on that task's day. |
| Wins / watch-outs | Up to 3 suited tasks (wins) and up to 3 unsuited tasks (watch-outs, with "better in X phase"). |
| Calendar | Alignment: week strip + tasks. Cycle Plan: full month calendar with phase colours. |
| Real | Onboarding, tasks, score, calendar, logging (localStorage), phase tips, demo mode. |
| Mock | AI Coach = scripted replies + working breathing timer. Settings integrations = toggles that do nothing. |
| Dropped | Energy leak audit, real AI, real calendar sync, wearables, WhatsApp. |
| Overlap | Menstrual wins: Ovulatory starts at `max(periodLength + 1, ovulationDay - 1)`. |
| Palette | Cool spectrum (see below). No pink/purple. |

### Palette
Base bg `#eef4fb`, text `#1f3350`, accent `#3fa77a` (green).
Follicular `#3fa7a0` teal · Ovulatory `#6bbf59` green · Luteal `#4a6fa5` slate blue · Menstrual `#2e3d5c` navy.

### POWR labels
Follicular = Prepare · Ovulatory = Open Up · Luteal = Work · Menstrual = Rest.

### Task types → phases they suit
| Type | Suits |
|---|---|
| Pitch / presentation | Ovulatory |
| Networking / key conversation | Ovulatory |
| Brainstorm / new project | Follicular |
| Planning / research | Follicular |
| Deep work / admin | Luteal |
| Wrap-up / finishing | Luteal |
| Review / reflection | Menstrual |
| High-intensity workout | Follicular, Ovulatory |
| Strength / Pilates / yoga | Luteal |
| Rest / gentle walk | Menstrual |

---

## Steps

### 1. [x] git init + CLAUDE.md
### 2. [x] File structure + phone frame + tab bar (empty screens)

### 3. [ ] New look + 4-tab dock
- [ ] Colours in `:root` match the palette above; no pink/purple left in `style.css`
- [ ] Tab bar has 4 tabs with simple icons + labels: Alignment, Cycle Plan, Coach, Settings
- [ ] Each tab opens its own (still empty) screen; active tab is highlighted green
- [ ] Old screens (today, calendar, phases) renamed/removed; onboarding + phase-detail kept
- [ ] Looks right in the laptop phone frame and at phone width

### 4. [ ] Cycle logic (console-checkable)
- [ ] `parseLocalDate("2026-09-01")` returns a local date (no UTC off-by-one)
- [ ] `getCycleDay(date, settings)` works for dates before the next period too (predicts forward)
- [ ] `getPhase(cycleDay, settings)` follows CLAUDE.md rules, with Menstrual winning overlaps
- [ ] 28/5: day 1→Menstrual, 6→Follicular, 13→Ovulatory, 16→Luteal, 28→Luteal
- [ ] 21/7: no error; day 7→Menstrual, 8→Ovulatory, 10→Luteal
- [ ] `daysUntilNextPhase(date, settings)` returns a correct number
- [ ] `PHASES` object holds name, POWR label, colour, one-liner, Move/Eat/Work tips (own wording)

### 5. [ ] Onboarding
- [ ] Shown on first visit (no saved settings); other tabs hidden until done
- [ ] Date picker: first day of last period, no future dates
- [ ] Cycle length 21–35 (default 28), period length 3–7 (default 5); bad input shows a message
- [ ] Disclaimer shown: "For general wellness only. Not medical advice, and not for contraception."
- [ ] Save → stored in localStorage → Alignment screen opens; reload skips onboarding

### 6. [ ] Tasks (on Alignment screen)
- [ ] Week strip: today + next 6 days, each tinted with its phase colour + phase letter
- [ ] Tap a day → shows that day's tasks below
- [ ] "Add task" form: title, date, type (dropdown of the task types above)
- [ ] Task can be deleted
- [ ] Tasks survive a reload

### 7. [ ] Alignment dashboard
- [ ] Header: "Day X · <Phase> Phase · <POWR label>"
- [ ] Circular ring shows score % (formula above); updates after adding/deleting a task
- [ ] No tasks → friendly empty state instead of 0%
- [ ] Up to 3 wins and 3 watch-outs, each naming the task, its day's phase, and (watch-outs) the better phase
- [ ] Wording = suggestions, no medical claims

### 8. [ ] Cycle Plan: calendar + phases
- [ ] Month calendar: every day tinted with phase colour **and** phase letter; today highlighted
- [ ] Prev/next month arrows work across year boundaries
- [ ] Days with tasks show a small dot
- [ ] Phase overview (wheel or 4 coloured cards) with POWR labels and day ranges for this user
- [ ] Tap a phase → phase detail with Move / Eat / Work tips; back button returns

### 9. [ ] Quick logging (in Cycle Plan)
- [ ] Today's log: energy 0–10 slider, mood, focus, sleep (<8h / 8h / >8h), phase food check-in
- [ ] Save → stored per date in localStorage; reopening today shows saved values
- [ ] Food check-in text matches the current phase

### 10. [ ] Coach (scripted)
- [ ] Chat-style screen: a few suggested prompt buttons → pre-written replies based on current phase
- [ ] Clear note that it's a demo coach, not real AI
- [ ] 2-minute breathing reset: start/stop, countdown, "breathe in / out" cue
- [ ] Phase scripts: boundaries (Luteal/Menstrual), intentions & outreach (Follicular/Ovulatory)

### 11. [ ] Settings
- [ ] Edit cycle data (same validation as onboarding) and "Reset all data" with confirm
- [ ] Integration toggles (Google Calendar, Outlook, Apple Health, Garmin, Oura, WhatsApp 8:00 summary) switch on/off but do nothing; labelled "coming soon"
- [ ] Privacy note: data stays on this device

### 12. [ ] Demo mode + polish + phone
- [ ] `?demo=1` shows a small panel to pick a pretend date; all screens follow it
- [ ] Can show all 4 phases in the demo by changing the date
- [ ] No console errors; text readable on phone
- [ ] Runs on the phone over Wi-Fi (`http://<laptop-IP>:8000`)
