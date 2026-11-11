"""Upload any reel (video + caption) that is missing on Google Drive and fill the Drive Link column (H).

Drive: Islamic Guidance to You / Reels.  Sheet: Islamic Reels Tracker, tab "Reels Tracker".
Usage:  python -X utf8 scripts/sync_drive.py
"""
import glob
import json
import os
import re
import subprocess

from config import (DRIVE_FOLDER_ID, GDRIVE_BIN, NOT_PUB_DIR, PUB_DIR, REELS_TAB, sheet_row)
from sync_sheet import read_range, write_cell


def get_drive_files():
    cmd = [GDRIVE_BIN, "readonly", "ls", DRIVE_FOLDER_ID, "--max", "500", "--json"]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def upload_file(local_path):
    print(f"Uploading {os.path.basename(local_path)}...", flush=True)
    res = subprocess.run([GDRIVE_BIN, "mutate", "upload", local_path, "--parent", DRIVE_FOLDER_ID],
                         capture_output=True, text=True, check=True)
    match = re.search(r"\(ID:\s*([^\)]+)\)", res.stdout)
    if not match:
        raise RuntimeError(f"Could not parse ID from output: {res.stdout}")
    file_id = match.group(1).strip()
    print(f"  -> Uploaded (ID: {file_id})", flush=True)
    return file_id


def get_local_reels():
    reels = {}
    for folder in (PUB_DIR, NOT_PUB_DIR):
        for f in glob.glob(os.path.join(folder, "*.*")):
            fname = os.path.basename(f)
            m = re.match(r"^(\d{1,3})\s*-\s*(.+?)(?:\s*-\s*caption\.txt|\.mp4)$", fname, re.IGNORECASE)
            if not m:
                continue
            num = int(m.group(1))
            reels.setdefault(num, {"video": None, "caption": None})
            if fname.lower().endswith(".mp4"):
                reels[num]["video"] = f
            elif fname.lower().endswith(".txt"):
                reels[num]["caption"] = f
    return reels


def drive_id_for(num, path, ext, drive_map):
    """Return the Drive id for this local file, uploading it when Drive does not have it yet."""
    name = os.path.basename(path)
    if name in drive_map:
        return drive_map[name]
    same_number = [n for n in drive_map if n.startswith(f"{num:02d} - ") and n.endswith(ext)]
    if same_number:
        return drive_map[same_number[0]]
    drive_map[name] = upload_file(path)
    return drive_map[name]


def main():
    print("=== Step 1: Google Drive ===", flush=True)
    drive_map = {item["name"]: item["id"] for item in get_drive_files()}
    print(f"{len(drive_map)} items in Drive > Islamic Guidance to You > Reels", flush=True)

    print("=== Step 2: Local reels ===", flush=True)
    local = get_local_reels()
    print(f"{len(local)} local reels", flush=True)

    links = {}
    for num in sorted(local):
        data = local[num]
        if data["video"]:
            links[num] = f"https://drive.google.com/file/d/{drive_id_for(num, data['video'], '.mp4', drive_map)}/view?usp=sharing"
        if data["caption"]:
            drive_id_for(num, data["caption"], ".txt", drive_map)

    print("=== Step 3: Drive Link column in the Sheet ===", flush=True)
    rows = read_range(f"'{REELS_TAB}'!A1:H500") or []
    existing = {int(r[0]): (r[7] if len(r) > 7 else "") for r in rows[1:] if r and r[0].isdigit()}
    for num, link in links.items():
        if existing.get(num, "") == link:
            print(f"Reel {num:02d}: link already correct", flush=True)
            continue
        ok, msg = write_cell(f"{REELS_TAB}!H{sheet_row(num)}", link)
        print(f"Reel {num:02d}: " + ("link written" if ok else f"FAILED ({msg})"), flush=True)
    print("=== Done ===")


if __name__ == "__main__":
    main()
