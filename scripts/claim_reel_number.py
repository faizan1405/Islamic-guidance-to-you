"""Reserve the next free reel number, safely, even with several AI agents running in parallel.

Usage (run from the project root, BEFORE writing the script):
    python -X utf8 scripts/claim_reel_number.py "<Title>"
Prints the reserved number, e.g. 03. Use it for the script, video and caption file names.

Each number gets a ticket file in "01 Islamic Reels/.claims/NN.claim". The ticket is created with
O_EXCL (create-only-if-missing), which the OS does atomically, so if two agents try the same number
at the same moment only one wins; the other moves on.
"""
import datetime
import os
import re
import sys

from config import CLAIMS, NOT_PUB_DIR, PUB_DIR, REELS, ROOT, SCRIPTS_DIR


def used_numbers():
    """Every number seen ANYWHERE counts as used: reel files, scripts, work folders, claim tickets, Sheet column A.
    Numbers are never reused, not even for a dropped reel."""
    nums = set()
    for d in [REELS, PUB_DIR, NOT_PUB_DIR, SCRIPTS_DIR]:
        if os.path.exists(d):
            for name in os.listdir(d):
                m = re.match(r"^(?:Script - )?(\d+)\s*-", name)
                if m:
                    nums.add(int(m.group(1)))
    wd = os.path.join(ROOT, "work")
    if os.path.exists(wd):
        for name in os.listdir(wd):
            m = re.match(r"^reel(\d+)$", name)
            if m:
                nums.add(int(m.group(1)))
    if os.path.exists(CLAIMS):
        for name in os.listdir(CLAIMS):
            m = re.match(r"^(\d+)\.claim$", name)
            if m:
                nums.add(int(m.group(1)))
    try:  # the Sheet is the master list: column A of Reels Tracker
        from sync_sheet import read_range
        from config import REELS_TAB
        rows = read_range(f"{REELS_TAB}!A2:A500")
        for r in rows or []:
            if r and r[0].strip().isdigit():
                nums.add(int(r[0]))
    except Exception:
        pass
    return nums


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        sys.exit('usage: python -X utf8 scripts/claim_reel_number.py "<Title>"')
    title = " ".join(sys.argv[1:]).strip()
    os.makedirs(CLAIMS, exist_ok=True)
    n = max(used_numbers(), default=0) + 1
    while True:
        path = os.path.join(CLAIMS, f"{n:02d}.claim")
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            n += 1
            continue
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(f"{title}\nclaimed {datetime.datetime.now():%Y-%m-%d %H:%M:%S}\n")
        print(f"{n:02d}")
        return


if __name__ == "__main__":
    main()
