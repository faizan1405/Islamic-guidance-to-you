"""Create a reel project in the studio and fill it with the voiceover and timing.

Usage (after scale_voice.py):
    python -X utf8 scripts/populate_project.py --reel 01 --slug islamic-01-<short-name> --title "<claimed title>" --duration 30
Creates growkaz-stickman-studio/projects/<slug>/ with config.json (9:16, 1080p, 30 fps, no fade-in,
no music, SFX on, -14 LUFS), input/voiceover.mp3 and timeline/words.json + sentences.json.
The scenes (the four formats) are written afterwards in scenes/shots/.
"""
import argparse
import json
import shutil
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reel", required=True)
    ap.add_argument("--slug", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--duration", type=float, default=30.0)
    ap.add_argument("--style", default="emerald", help="a style id from engine/styles.js (look not decided yet)")
    a = ap.parse_args()

    work = Path(f"work/reel{a.reel}")
    proj = Path("growkaz-stickman-studio/projects") / a.slug
    for d in ["input", "timeline", "story", "scenes/sets", "scenes/shots", "build", "out", "audio"]:
        (proj / d).mkdir(parents=True, exist_ok=True)

    cfg = {"title": a.title, "aspect": "9:16", "resolution": "1080p", "fps": 30, "style": a.style,
           "voiceover": "input/voiceover.mp3", "script": None, "duration": a.duration,
           "captions": False, "bars": "none", "fadeIn": 0, "fadeOut": 0.8,
           "music": {"enabled": False},
           "sfx": {"enabled": True, "gainDb": -6},
           "loudness": -14}
    (proj / "config.json").write_text(json.dumps(cfg, indent=2), encoding="utf-8")

    shutil.copy2(work / "final_voiceover.mp3", proj / "input/voiceover.mp3")
    timing = json.loads((work / "scaled_timing.json").read_text(encoding="utf-8"))
    (proj / "timeline/words.json").write_text(
        json.dumps({"source": "elevenlabs-alignment", "words": timing["words"]}, indent=1, ensure_ascii=False), encoding="utf-8")
    (proj / "timeline/sentences.json").write_text(json.dumps(timing["lines"], indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"Project ready: {proj}")


if __name__ == "__main__":
    main()
