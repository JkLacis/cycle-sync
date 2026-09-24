# Cycle Sync

Phone-style web app prototype: plan work, movement and food around the four phases of the menstrual cycle.
The home screen scores how well today's tasks fit your current phase.

**Live:** https://jklacis.github.io/cycle-sync/ · **Demo data:** https://jklacis.github.io/cycle-sync/?demo=1

> For general wellness only. Not medical advice, and not for contraception.

## Run it locally (Kubuntu / any Linux)

Needs only Python 3 (pre-installed on Kubuntu). No npm, no build step.

```bash
cd ~/Desktop/Cycle-Sync
python3 -m http.server 8000
```

Open http://localhost:8000 in a browser. Stop the server with **Ctrl+C**.

- `?demo=1` → sample week, today fixed to Day 14 (Ovulatory). Demo data is stored separately and never touches real data.
- Port busy (`Address already in use`)? Use another port: `python3 -m http.server 8080`.
- Phone on the same Wi-Fi: `http://<laptop-IP>:8000` (IP from `hostname -I`). This needs the firewall to allow the port
  (`sudo ufw allow 8000/tcp`) and a network without client isolation; guest Wi-Fi often blocks it — use the live link instead.

## Test

With the local server running, open http://localhost:8000/tests/click-through.html.
It runs every element listed in `DECISIONS.md` inside the real app (`?demo=1`) and checks for dead clicks.
It resets and changes demo data only.

## How it works

| File | Role |
|---|---|
| `index.html` | All screens as `<section class="screen">`, dialogs, bottom dock |
| `style.css` | Design tokens in `:root`, then styles per screen |
| `content.js` | **All app text** (phase suggestions, task types, coach replies, FAQ). Data only — edit wording here |
| `app.js` | Logic: cycle maths → storage (`store`) → alignment score → render functions → navigation |
| `DECISIONS.md` | Every interactive element: what it does and why (options + decisions) |
| `tests/` | Click-through test page |

- **Data:** stays on the device (`localStorage`, keys `cyclesync.*`). No account, no server, no analytics or trackers.
  All reads/writes go through `store` in `app.js`, with a schema version and migrations. Settings → Data & privacy
  can export everything as JSON or delete it.
- **Cycle maths:** `cycleDay = (days since last period start mod cycle length) + 1`; ovulation is estimated at
  `cycle length − 14`; the Menstrual phase wins overlaps in short cycles. All dates are shown as estimates.
- **Score:** average of today's tasks — High Sync 100 · Good 75 · Moderate 60 · Low Sync 0. Below 50 the home screen
  switches to a softer "recovery" look.

## Content and evidence

Suggestions are our own paraphrases inspired by *In the FLO* (Alisa Vitti). The book is not in this repo.
Research on phase-based exercise, food and work is limited — studies find little or no change in performance
across the cycle — so the app presents ideas, not rules. Deliberately left out: fasting, calorie restriction and
keto plans; claims about curing PMS or fertility; "adrenal fatigue". Cycle-length and ovulation facts follow the NHS.

Not real yet: AI Coach (scripted replies), calendar and wearable integrations, notifications (in-app only),
Appearance settings.
