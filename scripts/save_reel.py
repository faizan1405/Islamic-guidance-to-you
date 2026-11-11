"""Save a finished reel into "01 Islamic Reels/Not Published" (or "Published") ONLY if claimed and verified.

Usage (run from the project root, after rendering + mixing):
    python -X utf8 scripts/save_reel.py --number 1 --title "<claimed title>" --category "Sahaba Story" \
        --video "growkaz-stickman-studio/projects/<slug>/out/<file>.mp4" --caption "<caption.txt>" \
        --question "<the comment question>" --source "<link 1> | <link 2>"

Refuses (exit code 1, nothing copied) when:
  - the number was never claimed with scripts/claim_reel_number.py, or belongs to a different title,
  - the category is not Sahaba Story / Prophet Story / Quran Science,
  - the comment question is missing,
  - fewer than 2 sources are given (separate them with " | "),
  - any file already uses that number (use --replace only to overwrite a re-render of the SAME title),
  - the video or caption is missing or empty.
"""
import argparse
import datetime
import os
import re
import shutil
import subprocess
import sys

from config import (CATEGORIES, CLAIMS, DRIVE_FOLDER_ID, GDRIVE_BIN, NOT_PUB_DIR, PUB_DIR, REELS)


def clean(title):
    t = title.replace(":", " -").replace("/", "-").replace("\\", "-")
    t = re.sub(r'[<>"|?*]', "", t)
    return re.sub(r"\s+", " ", t).strip().rstrip(".")


def fail(msg):
    print(f"❌ NOT SAVED: {msg}")
    sys.exit(1)


def find_existing_files(nn):
    found = []
    for d in [REELS, PUB_DIR, NOT_PUB_DIR]:
        if os.path.exists(d):
            for f in os.listdir(d):
                p = os.path.join(d, f)
                if os.path.isfile(p) and re.match(rf"^{nn}\s*-", f):
                    found.append(p)
    return found


def upload_to_drive(video_path, caption_path):
    """Upload the Full HD video and the caption to Drive > Islamic Guidance to You > Reels."""
    drive_link = ""
    try:
        print(f"☁️ Uploading video to Google Drive: {os.path.basename(video_path)}...")
        res = subprocess.run([GDRIVE_BIN, "mutate", "upload", video_path, "--parent", DRIVE_FOLDER_ID],
                             capture_output=True, text=True, check=True)
        m = re.search(r"\(ID:\s*([^\)]+)\)", res.stdout)
        if m:
            vid_id = m.group(1).strip()
            drive_link = f"https://drive.google.com/file/d/{vid_id}/view?usp=sharing"
            print(f"✅ Video uploaded to Drive (ID: {vid_id})")
        if caption_path and os.path.isfile(caption_path):
            subprocess.run([GDRIVE_BIN, "mutate", "upload", caption_path, "--parent", DRIVE_FOLDER_ID],
                           capture_output=True, text=True, check=True)
            print("✅ Caption uploaded to Drive")
    except Exception as e:
        print(f"⚠️ Google Drive upload skipped/failed: {e}")
    return drive_link


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--number", required=True, type=int)
    ap.add_argument("--title", required=True)
    ap.add_argument("--category", required=True, choices=CATEGORIES)
    ap.add_argument("--video", required=True)
    ap.add_argument("--caption", required=True)
    ap.add_argument("--question", required=True, help="the comment question shown at the end of the reel")
    ap.add_argument("--source", required=True, help='at least 2 sources separated by " | "')
    ap.add_argument("--published", action="store_true", help="save to Published folder (default: Not Published)")
    ap.add_argument("--replace", action="store_true", help="overwrite an earlier render of the SAME number + title")
    a = ap.parse_args()

    nn = f"{a.number:02d}"
    title = clean(a.title)

    if not a.question.strip():
        fail("comment question is empty. Every reel must end with one question.")
    sources = [s.strip() for s in a.source.split("|") if s.strip()]
    if len(sources) < 2:
        fail('need at least 2 sources in --source, separated by " | ". No verified source = no reel.')

    claim = os.path.join(CLAIMS, f"{nn}.claim")
    if not os.path.exists(claim):
        fail(f'number {nn} was never claimed. Run: python -X utf8 scripts/claim_reel_number.py "{a.title}"')
    claimed_title = open(claim, encoding="utf-8").readline().strip()
    if clean(claimed_title).lower() != title.lower():
        fail(f'number {nn} is claimed for "{claimed_title}", not "{a.title}". Use your own claimed number.')

    for p, what in ((a.video, "video"), (a.caption, "caption")):
        if not os.path.isfile(p) or os.path.getsize(p) == 0:
            fail(f"{what} file missing or empty: {p}")

    caption_text = open(a.caption, encoding="utf-8").read()
    if a.question.strip() not in caption_text:
        print("⚠️ The comment question is not inside the caption file. Add it at the end of the caption.")

    target_dir = PUB_DIR if a.published else NOT_PUB_DIR
    os.makedirs(target_dir, exist_ok=True)
    video_dst = os.path.join(target_dir, f"{nn} - {title}.mp4")
    caption_dst = os.path.join(target_dir, f"{nn} - {title} - caption.txt")

    taken_paths = find_existing_files(nn)
    if taken_paths:
        same = all(p in (video_dst, caption_dst) for p in taken_paths)
        if not (a.replace and same):
            fail(f"number {nn} is already used in the reels folders: {[os.path.basename(p) for p in taken_paths]}")

    shutil.copyfile(a.video, video_dst)
    shutil.copyfile(a.caption, caption_dst)
    with open(claim, "a", encoding="utf-8") as f:
        f.write(f"saved {datetime.datetime.now():%Y-%m-%d %H:%M:%S}\n")
    print(f"✅ Saved: {video_dst}")
    print(f"✅ Saved: {caption_dst}")

    drive_link = upload_to_drive(video_dst, caption_dst)

    if a.replace:
        print(f"ℹ️ Google Sheet: row #{nn} already exists, not added again (replace)")
        return
    try:
        from sync_sheet import log_reel_to_sheet
        status_str = "Published" if a.published else "Done Making Reel"
        ok, msg = log_reel_to_sheet(a.number, title, a.category, status=status_str, question=a.question,
                                    source=" | ".join(sources), drive_link=drive_link)
        print(f"✅ Google Sheet updated: #{nn} - {title} ({status_str})" if ok else f"⚠️ Google Sheet notice: {msg}")
    except Exception as e:
        print(f"⚠️ Google Sheet sync skipped: {e}")


if __name__ == "__main__":
    main()
