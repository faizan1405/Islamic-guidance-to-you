"""Read and write the Google Sheet "Islamic Reels Tracker" through the gsheets CLI.

Reel N lives in row N+1 of the tab "Reels Tracker". This file only writes columns A-H.
Never write columns I-N (numbers you type and the Engagement % formula).
"""
import subprocess

from config import (CATEGORIES, GSHEETS_BIN, REELS_TAB, SPREADSHEET_ID, STATUSES, esc, sheet_row)


def write_cell(a1, value):
    """Write one cell. Returns (ok, message)."""
    try:
        r = subprocess.run([GSHEETS_BIN, "mutate", "write", SPREADSHEET_ID, a1, esc(value)],
                           capture_output=True, text=True, timeout=20)
    except Exception as e:  # CLI missing, timeout, ...
        return False, str(e)
    if r.returncode != 0:
        return False, r.stderr.strip() or r.stdout.strip() or f"gsheets failed with code {r.returncode}"
    return True, "ok"


def read_range(a1):
    """Read a range. Returns a list of rows (each a list of strings) or None when the CLI fails."""
    try:
        r = subprocess.run([GSHEETS_BIN, "readonly", "read", SPREADSHEET_ID, a1],
                           capture_output=True, text=True, timeout=30)
    except Exception:
        return None
    if r.returncode != 0:
        return None
    return [[c.strip() for c in line.split("\t")] for line in r.stdout.strip().splitlines()]


def log_reel_to_sheet(number, title, category, status="Done Making Reel", question="", source="",
                      publish_date="", drive_link=""):
    """Write / update one reel row. Returns (ok, message)."""
    if category not in CATEGORIES:
        return False, f"category must be one of {CATEGORIES}"
    if status not in STATUSES:
        return False, f"status must be one of {STATUSES}"
    row = sheet_row(number)
    cells = [("A", str(int(number))), ("B", title), ("C", category), ("D", status),
             ("E", publish_date), ("F", question), ("G", source), ("H", drive_link)]
    for col, value in cells:
        if value == "":
            continue
        ok, msg = write_cell(f"{REELS_TAB}!{col}{row}", value)
        if not ok:
            return False, f"{col}{row}: {msg}"
    return True, "Success"


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--number", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--category", required=True, choices=CATEGORIES)
    ap.add_argument("--status", default="Done Making Reel", choices=STATUSES)
    ap.add_argument("--question", default="")
    ap.add_argument("--source", default="")
    ap.add_argument("--date", default="")
    ap.add_argument("--drive-link", default="")
    a = ap.parse_args()
    ok, msg = log_reel_to_sheet(a.number, a.title, a.category, a.status, a.question, a.source, a.date, a.drive_link)
    print(f"✅ Google Sheet updated: #{a.number} - {a.title}" if ok else f"❌ Failed to update Google Sheet: {msg}")
