"""Put every reel file into 'Published' or 'Not Published' to match the Google Sheet.

Status Published or Scheduled -> Published folder. Everything else -> Not Published.
Falls back to TOPICS.md when the Sheet cannot be read.
Usage:  python -X utf8 scripts/organize_reels.py
"""
import os
import re
import shutil

from config import LIVE_STATUSES, NOT_PUB_DIR, PUB_DIR, REELS, REELS_TAB, TOPICS_PATH
from sync_sheet import read_range


def get_statuses_from_sheet():
    """Returns dict of int(number) -> 'Published' | 'Not Published'."""
    rows = read_range(f"'{REELS_TAB}'!A2:D500")
    if rows is None:
        print("⚠️ Could not read the Google Sheet, falling back to TOPICS.md")
        return {}
    statuses = {}
    for parts in rows:
        if len(parts) >= 4 and parts[0].isdigit():
            statuses[int(parts[0])] = "Published" if parts[3].lower() in LIVE_STATUSES else "Not Published"
    return statuses


def get_statuses_from_topics():
    statuses = {}
    if not os.path.exists(TOPICS_PATH):
        return statuses
    for line in open(TOPICS_PATH, encoding="utf-8"):
        if line.startswith("│"):
            cells = [c.strip() for c in line.strip("│").split("│")]
            if len(cells) >= 4 and cells[0].isdigit():
                statuses[int(cells[0])] = "Published" if cells[3].lower() in ("yes", "published", "scheduled") else "Not Published"
    return statuses


def main():
    os.makedirs(PUB_DIR, exist_ok=True)
    os.makedirs(NOT_PUB_DIR, exist_ok=True)
    statuses = get_statuses_from_sheet() or get_statuses_from_topics()
    print(f"Loaded statuses for {len(statuses)} reels.")

    moved = 0
    for folder in [REELS, PUB_DIR, NOT_PUB_DIR]:
        if not os.path.exists(folder):
            continue
        for fname in os.listdir(folder):
            if not os.path.isfile(os.path.join(folder, fname)):
                continue
            m = re.match(r"^(\d+)\s*-", fname)
            if not m:
                continue
            num = int(m.group(1))
            target_status = statuses.get(num, "Not Published")
            target_dir = PUB_DIR if target_status == "Published" else NOT_PUB_DIR
            if folder != target_dir:
                shutil.move(os.path.join(folder, fname), os.path.join(target_dir, fname))
                print(f"Moved #{num:02d} '{fname}' -> {target_status}")
                moved += 1
    print(f"Organization complete. Moved {moved} files.")


if __name__ == "__main__":
    main()
