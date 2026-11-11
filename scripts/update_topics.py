"""Rebuild TOPICS.md as a clean, aligned plain-text table (looks good in Notepad).

Run from the project root after saving a reel:   python -X utf8 scripts/update_topics.py

- Every "NN - Title.mp4" in "01 Islamic Reels" (Published or Not Published) becomes a row.
- Category comes from the Google Sheet (tab "Reels Tracker") when it can be read.
- IDEAS come from the Sheet tab "Future Ideas" (rows whose Status is "Idea").
"""
import os
import re

from config import IDEAS_TAB, NOT_PUB_DIR, PUB_DIR, REELS, REELS_TAB, TOPICS_PATH
from sync_sheet import read_range

W = {"no": 4, "topic": 60, "category": 14, "posted": 8}


def read_existing():
    rows, ideas = {}, []
    if not os.path.exists(TOPICS_PATH):
        return rows, ideas
    in_ideas = False
    for line in open(TOPICS_PATH, encoding="utf-8"):
        s = line.rstrip("\n")
        if s.strip().upper().startswith("IDEAS"):
            in_ideas = True
            continue
        if in_ideas and s.startswith("  - ") and "(none yet)" not in s:
            ideas.append(s[4:].strip())
            continue
        if s.startswith("│"):
            cells = [c.strip() for c in s.strip("│").split("│")]
            if len(cells) >= 4 and cells[0].isdigit():
                rows[int(cells[0])] = {"topic": cells[1], "category": cells[2], "posted": cells[3]}
    return rows, ideas


def sheet_categories():
    data = read_range(f"'{REELS_TAB}'!A2:D500")
    if not data:
        return {}
    return {int(r[0]): r[2] for r in data if len(r) >= 3 and r[0].isdigit() and r[2]}


def fresh_ideas():
    data = read_range(f"'{IDEAS_TAB}'!A2:I300")
    if data is None:
        return None
    return [r[1] for r in data if len(r) >= 9 and r[1] and r[8].lower() == "idea"]


def fit(text, width):
    return text if len(text) <= width else text[: width - 1] + "…"


def main():
    rows, ideas = read_existing()
    new_ideas = fresh_ideas()
    if new_ideas is not None:
        ideas = new_ideas
    cats = sheet_categories()

    for folder, is_pub in ((REELS, False), (PUB_DIR, True), (NOT_PUB_DIR, False)):
        if not os.path.exists(folder):
            continue
        for f in os.listdir(folder):
            m = re.match(r"^(\d+) - (.+)\.mp4$", f)
            if not m:
                continue
            n, topic = int(m.group(1)), m.group(2)
            rows.setdefault(n, {"topic": topic, "category": "", "posted": ""})
            if is_pub and not rows[n]["posted"]:
                rows[n]["posted"] = "Yes"
    for n, r in rows.items():
        if cats.get(n):
            r["category"] = cats[n]

    cols = ["no", "topic", "category", "posted"]
    head = {"no": "No", "topic": "Topic", "category": "Category", "posted": "Posted"}
    line = lambda l, m, r: l + m.join("─" * (W[c] + 2) for c in cols) + r
    row = lambda d: "│" + "│".join(" " + fit(d[c], W[c]).ljust(W[c]) + " " for c in cols) + "│"

    out = [
        "ISLAMIC REELS : TOPIC TRACKER",
        "=" * 29,
        "",
        "AI: check this before suggesting a topic (no repeats).",
        "    Only verified topics (see AGENTS.md section 2). Sources live in the Google Sheet.",
        "    After saving a reel, run:  python -X utf8 scripts/update_topics.py",
        "",
        f"DONE REELS ({len(rows)})",
        line("┌", "┬", "┐"), row(head), line("├", "┼", "┤"),
    ]
    if rows:
        for n in sorted(rows):
            out.append(row({"no": f"{n:02d}", **rows[n]}))
    else:
        out.append(row({"no": "", "topic": "", "category": "", "posted": ""}))
    out += [line("└", "┴", "┘"), "", f"IDEAS - not started ({len(ideas)})", ""]
    out += [f"  - {i}" for i in ideas] or ["  - (none yet)"]
    out += ["", "Numbers: always reserved with scripts/claim_reel_number.py (safe for parallel agents)."]
    open(TOPICS_PATH, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"TOPICS.md rebuilt: {len(rows)} reels, {len(ideas)} ideas")


if __name__ == "__main__":
    main()
