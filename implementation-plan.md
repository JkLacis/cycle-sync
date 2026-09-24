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
| Score | **Today only.** Each task rated High Sync (100) / Good (65) / Low Sync (0) for today's phase; score = average, 0–100. No tasks → "–". |
| Good for you / Watch-outs | Exactly 3 short labels each: from today's High / Low Sync task types first, phase defaults fill the rest. |
| Calendar | Alignment: week strip + tasks. Cycle Plan: full month calendar with phase colours. |
| Real | Onboarding, tasks, score, calendar, logging (localStorage), phase tips, demo mode. |
| Mock | AI Coach = scripted replies + working breathing timer. Settings integrations = toggles that do nothing. |
| Dropped | Energy leak audit, real AI, real calendar sync, wearables, WhatsApp. |
| Overlap | Menstrual wins: Ovulatory starts at `max(periodLength + 1, ovulationDay - 1)`. |
| Palette | Match the mockup `reference/home-mockup.webp` (see below). |

### Palette (updated 2026-09-24, tokens in `style.css` `:root`)
Warm off-white bg `#f6f6f3`, navy text `#1c2b45`, blue `#4f86d6` (ring, selection), sage "good" card, soft peach "watch-out" card.
Follicular `#7dbf9b` sage · Ovulatory `#f1b548` yellow · Luteal `#5b8fd6` blue · Menstrual `#e9a393` soft peach.

### POWR labels
Follicular = Prepare · Ovulatory = Open Up · Luteal = Work · Menstrual = Rest.

### Task types → phases (suits = High Sync, avoid = Low Sync, other = Good)
| Type | Suits | Avoid |
|---|---|---|
| Pitch / presentation | Ovulatory | Menstrual |
| Networking / key conversation | Ovulatory | Menstrual |
| Meeting / check-in | – | Menstrual |
| Brainstorm / new project | Follicular | Luteal |
| Planning / research | Follicular | – |
| Deep work / admin | Luteal | Ovulatory |
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

### 7. [x] Alignment dashboard
- [x] Header: "Cycle Sync" + calendar + avatar; "DAY X" / phase name + phase icon (mockup)
- [x] Score ring 0–100 (formula above); updates after adding/deleting a task
- [x] No tasks → "–" and "No tasks today" instead of 0
- [x] Exactly 3 Good for you + 3 Watch-outs; event details name the better phase for Low Sync tasks
- [x] Wording = suggestions, no medical claims

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
