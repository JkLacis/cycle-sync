# Cycle Sync

Phone-style web app prototype: plan work, movement and food around the four phases of the menstrual cycle.
The home screen scores how well today's tasks fit your current phase.

**Live:** https://jklacis.github.io/cycle-sync/ · **Demo data:** https://jklacis.github.io/cycle-sync/?demo=1

> For general wellness only. Not medical advice, and not for contraception.

## Run it with the AI coach (Kubuntu / any Linux)

The app is plain HTML/CSS/JS; the AI coach needs the small Python server in `server/` (FastAPI), which also serves the app.

**One-time setup** (Konsole, in `~/Desktop/Cycle-Sync`):

```bash
sudo apt install python3-venv                    # Kubuntu ships Python 3 without venv/pip
python3 -m venv .venv
.venv/bin/pip install -r server/requirements.txt
cp .env.example .env                             # then open .env and paste your key after ANTHROPIC_API_KEY=
```

Get an API key at https://platform.claude.com/ → API keys. `.env` is gitignored; the key is only read by the server and
never sent to the browser.

**Run:**

```bash
cd ~/Desktop/Cycle-Sync
.venv/bin/python -m server
```

Open http://localhost:8000. Stop with **Ctrl+C**. Check the coach is ready: http://localhost:8000/api/health →
`"coach": "ready"` (`"not_configured"` = no API key in `.env`).

### Environment variables (`.env`)

| Variable | Default | Meaning |
|---|---|---|
| `ANTHROPIC_API_KEY` | — (required for the coach) | Anthropic API key |
| `COACH_MODEL` | `claude-opus-5-5` | Claude model ID |
| `COACH_EFFORT` | `low` | `low` / `medium` / `high` — thinking depth vs. speed and cost |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | Where the server listens (`0.0.0.0` to allow other devices on the network) |
| `RATE_LIMIT_PER_MINUTE` / `RATE_LIMIT_PER_DAY` | `10` / `200` | Coach messages per client IP |
| `COACH_TIMEOUT_SECONDS` | `90` | Max time for one answer |
| `COACH_DB_PATH` | `server/data/coach.db` | SQLite file with conversation history (gitignored) |

### Without the server

`python3 -m http.server 8000` (or the GitHub Pages link) still runs the whole app; the coach then answers with
pre-written replies, labelled "Offline coach".

- `?demo=1` → sample week, today fixed to Day 14 (Ovulatory). Demo data is stored separately and never touches real data.
- Port busy (`Address already in use`)? Use another port: `python3 -m http.server 8080`.
- Phone on the same Wi-Fi: `http://<laptop-IP>:8000` (IP from `hostname -I`). This needs the firewall to allow the port
  (`sudo ufw allow 8000/tcp`) and a network without client isolation; guest Wi-Fi often blocks it — use the live link instead.

## Test

- **App click-through:** with either server running, open http://localhost:8000/tests/click-through.html. It runs every
  element in `DECISIONS.md` inside the real app (`?demo=1`, offline coach) and checks for dead clicks. Demo data only.
- **Server unit tests** (no API calls): `.venv/bin/python -m unittest discover -s server/tests -t .`
- **Coach evals** (real API, costs credits): start the server with `RATE_LIMIT_PER_MINUTE=100 .venv/bin/python -m server`,
  then `.venv/bin/python -m server.evals.run_evals`. Cases: `server/evals/cases.json`; results and grading: `COACH_EVALS.md`.

## How it works

| File | Role |
|---|---|
| `index.html` | All screens as `<section class="screen">`, dialogs, bottom dock |
| `style.css` | Design tokens in `:root`, then styles per screen |
| `content.js` | **All app text** (phase suggestions, task types, coach replies, FAQ). Data only — edit wording here |
| `app.js` | Logic: cycle maths → storage (`store`) → alignment score → render functions → navigation |
| `DECISIONS.md` | Every interactive element + the AI coach decisions (options + what was chosen) |
| `server/` | FastAPI server: `app.py` (routes), `coach.py` (prompt assembly + streaming), `prompts/coach.md` (system prompt), `prompts/knowledge.md` (condensed knowledge), `storage.py` (SQLite history), `evals/` |
| `tests/` | Click-through test page |

- **Data:** stays on the device (`localStorage`, keys `cyclesync.*`). No account, no analytics or trackers. Exception:
  coach messages plus a short context (cycle day, phase, today's tasks, 7 days of check-ins — never name or email) go to
  the local server and to Anthropic to generate answers; the server keeps the conversation in SQLite until "Clear chat".
  The server never logs message content.
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

Not real yet: calendar and wearable integrations, notifications (in-app only), Appearance settings, hosting the
coach server publicly (it runs on the laptop; GitHub Pages uses the offline coach).
