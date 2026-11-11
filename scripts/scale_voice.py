"""Fit the voiceover to the exact video length (about 30 s) and rescale the timings to match.

Usage (after generate_voice.py):
    python -X utf8 scripts/scale_voice.py --reel 01 --target 30
Reads work/reelNN/voiceover.mp3 + timing.json, writes final_voiceover.mp3 + scaled_timing.json.
If the speed change is more than 15 percent the voice will sound unnatural: shorten or lengthen the script instead.
"""
import argparse
import json
import subprocess
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reel", required=True)
    ap.add_argument("--target", type=float, default=30.0, help="video length in seconds")
    ap.add_argument("--tail", type=float, default=1.2, help="silence after the last word")
    a = ap.parse_args()

    work = Path(f"work/reel{a.reel}")
    raw = work / "voiceover.mp3"
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", str(raw)], capture_output=True, text=True)
    raw_dur = float(p.stdout.strip())
    factor = round(raw_dur / (a.target - a.tail), 4)
    print(f"Raw voice {raw_dur:.2f}s -> speed factor {factor}")
    if not 0.5 <= factor <= 2.0:
        raise SystemExit("Speed factor outside 0.5-2.0. Rewrite the script to the right length.")
    if abs(factor - 1) > 0.15:
        print("⚠️ More than 15% speed change. Better to edit the script length.")

    scaled = work / "voiceover_scaled.mp3"
    subprocess.run(["ffmpeg", "-y", "-i", str(raw), "-filter:a", f"atempo={factor}", "-b:a", "192k", str(scaled)],
                   check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-i", str(scaled), "-af", f"apad=whole_dur={a.target}", "-t", str(a.target),
                    "-b:a", "192k", str(work / "final_voiceover.mp3")], check=True, capture_output=True)

    timing = json.loads((work / "timing.json").read_text(encoding="utf-8"))
    out = {"duration": a.target,
           "lines": [{**l, "start": round(l["start"] / factor, 3), "end": round(l["end"] / factor, 3)} for l in timing["lines"]],
           "words": [{**w, "start": round(w["start"] / factor, 3), "end": round(w["end"] / factor, 3)} for w in timing["words"]]}
    (work / "scaled_timing.json").write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Done: {work}/final_voiceover.mp3 and scaled_timing.json ({a.target}s)")


if __name__ == "__main__":
    main()
