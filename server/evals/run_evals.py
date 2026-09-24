"""Runs every case in cases.json against the real /api/coach endpoint and writes transcripts.

  .venv/bin/python -m server.evals.run_evals [--base http://127.0.0.1:8000] [--only 1,5,23] [--delay 6]

Start the server first with a higher rate limit, e.g.  RATE_LIMIT_PER_MINUTE=100 .venv/bin/python -m server
Each full run makes ~28 real model calls (free on Gemini's free tier; paid credits with Claude). --delay spaces them out
for the free tier's per-minute limit, and a rate-limited answer is retried once after 30 s. Results go to server/evals/results/ (gitignored).
Automatic checks (word limit, required / forbidden patterns) are a first pass; every answer is also
read and graded by hand on accuracy, personalisation, tone, length and safety (see COACH_EVALS.md).
"""

import argparse
import json
import re
import time
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent


def ask(base: str, conversation_id: str, message: str, context: dict | None) -> dict:
    body = json.dumps({"conversation_id": conversation_id, "message": message, "context": context}).encode()
    req = urllib.request.Request(base + "/api/coach", data=body, headers={"Content-Type": "application/json"})
    started = time.monotonic()
    first_token = None
    text, error = [], None
    with urllib.request.urlopen(req, timeout=120) as res:
        buffer = ""
        for raw in res:
            buffer += raw.decode("utf-8")
            while "\n\n" in buffer:
                block, buffer = buffer.split("\n\n", 1)
                data = next((line[6:] for line in block.split("\n") if line.startswith("data: ")), None)
                if not data:
                    continue
                event = json.loads(data)
                if event["event"] == "delta":
                    first_token = first_token or time.monotonic() - started
                    text.append(event["text"])
                elif event["event"] == "error":
                    error = event
    return {"text": "".join(text).strip(), "error": error, "ttft_s": round(first_token or 0, 2), "total_s": round(time.monotonic() - started, 2)}


def auto_checks(case: dict, reply: str) -> list[str]:
    problems = []
    words = len(reply.split())
    if words > case.get("max_words", 170):
        problems.append(f"too long: {words} words > {case['max_words']}")
    for pattern in case.get("must_include_any", []):
        if not re.search(pattern, reply, re.IGNORECASE):
            problems.append(f"missing /{pattern}/")
    for pattern in case.get("must_not_include", []):
        if re.search(pattern, reply, re.IGNORECASE):
            problems.append(f"forbidden /{pattern}/")
    return problems


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:8000")
    parser.add_argument("--only", default="", help="comma-separated case ids")
    parser.add_argument("--delay", type=float, default=0, help="seconds to wait between model calls")
    args = parser.parse_args()
    with urllib.request.urlopen(args.base + "/api/health", timeout=10) as res:
        health = json.load(res)
    print(f"Provider {health.get('provider')} · model {health.get('model')} · coach {health['coach']}\n")
    spec = json.loads((HERE / "cases.json").read_text(encoding="utf-8"))
    only = {int(i) for i in args.only.split(",") if i}
    results = []
    for case in spec["cases"]:
        if only and case["id"] not in only:
            continue
        context = spec["contexts"][case["context"]] if case["context"] else None
        conversation_id = str(uuid.uuid4())
        turns = []
        for message in case["messages"]:
            answer = ask(args.base, conversation_id, message, context)
            if answer["error"] and answer["error"]["code"] == "rate_limited":
                time.sleep(30)
                answer = ask(args.base, conversation_id, message, context)
            turns.append({"message": message, **answer})
            time.sleep(args.delay)
        last = turns[-1]
        problems = ["error: " + last["error"]["code"]] if last["error"] else auto_checks(case, last["text"])
        results.append({"id": case["id"], "area": case["area"], "turns": turns, "auto_problems": problems})
        print(f"#{case['id']:>2} {case['area']:<40} {'OK' if not problems else 'CHECK: ' + '; '.join(problems)}  "
              f"(ttft {last['ttft_s']}s, total {last['total_s']}s, {len(last['text'].split())} words)")
        # Clean up server-side history for this eval conversation.
        urllib.request.urlopen(urllib.request.Request(args.base + "/api/coach/" + conversation_id, method="DELETE"), timeout=10)

    out = HERE / "results"
    out.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    (out / f"{stamp}.json").write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    lines = [f"# Coach eval run {stamp} ({health.get('provider')}, {health.get('model')})\n"]
    for r in results:
        lines.append(f"## #{r['id']} {r['area']}\n")
        for t in r["turns"]:
            lines.append(f"**User:** {t['message']}\n\n**Coach** (ttft {t['ttft_s']}s):\n\n{t['text'] or t['error']}\n")
        lines.append(f"Auto checks: {'OK' if not r['auto_problems'] else '; '.join(r['auto_problems'])}\n")
    (out / f"{stamp}.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"\nTranscripts: server/evals/results/{stamp}.md")


if __name__ == "__main__":
    main()
