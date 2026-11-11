"""Generate the narrator voiceover with ElevenLabs (with word timestamps) for one reel.

Usage (run from the project root):
    python -X utf8 scripts/generate_voice.py --reel 01 --script work/reel01/voice_script.json --voice-id <VOICE_ID>

voice_script.json:
    {"lines": [{"text": "[calm] Pehli line...", "gap": 0.2}, {"text": "Doosri line...", "gap": 0.0}]}
  - text may start with an emotion tag in [brackets]; tags are removed from captions and timing.
  - gap = silence in seconds after the line.

Writes work/reelNN/: lines/*.mp3, voiceover.mp3 (all lines joined), timing.json (lines + words).
Needs: ffmpeg on PATH, numpy, and ELEVENLABS_API_KEY in .env. The voice id is never defaulted:
Faizan must approve a voice sample first (see AGENTS.md section 3).
"""
import argparse
import base64
import json
import re
import subprocess
import urllib.request
from pathlib import Path

import numpy as np

SR = 44100
MODEL_ID = "eleven_v4"
LANGUAGE_CODE = "hi"


def load_api_key():
    env = Path(".env")
    assert env.exists(), ".env not found. Copy .env.example to .env and add your ELEVENLABS_API_KEY."
    for line in env.read_text(encoding="utf-8").splitlines():
        if line.startswith("ELEVENLABS_API_KEY="):
            key = line.split("=", 1)[1].strip()
            if key:
                return key
    raise SystemExit("ELEVENLABS_API_KEY is missing in .env")


def strip_tags(text):
    return re.sub(r"\[.*?\]", "", text).strip()


def decode_audio_f32(mp3_path):
    cmd = ["ffmpeg", "-v", "error", "-i", str(mp3_path), "-f", "f32le", "-acodec", "pcm_f32le", "-ac", "1", "-ar", str(SR), "-"]
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        raise RuntimeError(f"ffmpeg decode failed: {p.stderr.decode()}")
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def write_mp3(path, audio):
    p = subprocess.Popen(["ffmpeg", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-b:a", "192k", str(path)],
                         stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    p.communicate(audio.tobytes())


def words_from_chars(chars, starts, ends):
    """Group character timings into words, skipping [emotion tags]."""
    words, cur, cs, ce, in_tag = [], [], [], [], False
    for c, s, e in zip(chars, starts, ends):
        if c == "[":
            in_tag = True
            continue
        if in_tag:
            in_tag = c != "]"
            continue
        if c.isspace():
            if cur:
                words.append({"word": "".join(cur), "start": cs[0], "end": ce[-1]})
                cur, cs, ce = [], [], []
        else:
            cur.append(c); cs.append(s); ce.append(e)
    if cur:
        words.append({"word": "".join(cur), "start": cs[0], "end": ce[-1]})
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reel", required=True, help="reel number, e.g. 01")
    ap.add_argument("--script", required=True, help="voice_script.json")
    ap.add_argument("--voice-id", required=True)
    ap.add_argument("--tail", type=float, default=1.2, help="seconds of silence after the last line")
    a = ap.parse_args()

    api_key = load_api_key()
    lines = json.loads(Path(a.script).read_text(encoding="utf-8"))["lines"]
    work = Path(f"work/reel{a.reel}")
    out_dir = work / "lines"
    out_dir.mkdir(parents=True, exist_ok=True)

    print("=== Generating voice lines with ElevenLabs ===")
    for i, line in enumerate(lines):
        n = i + 1
        payload = {"text": line["text"], "model_id": MODEL_ID, "language_code": LANGUAGE_CODE,
                   "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}
        if i > 0:
            payload["previous_text"] = strip_tags(lines[i - 1]["text"])
        if i < len(lines) - 1:
            payload["next_text"] = strip_tags(lines[i + 1]["text"])
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{a.voice_id}/with-timestamps",
            data=json.dumps(payload).encode("utf-8"),
            headers={"xi-api-key": api_key, "Content-Type": "application/json"})
        print(f"Line {n:02d}: {line['text']}")
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
        (out_dir / f"{n:02d}.mp3").write_bytes(base64.b64decode(res["audio_base64"]))
        (out_dir / f"{n:02d}.json").write_text(json.dumps(res["alignment"], indent=1, ensure_ascii=False), encoding="utf-8")

    print("=== Joining lines and extracting global timings ===")
    t = 0.2
    master, all_words, all_lines = [], [], []
    for i, line in enumerate(lines):
        n = i + 1
        al = json.loads((out_dir / f"{n:02d}.json").read_text(encoding="utf-8"))
        words = words_from_chars(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"])
        raw = decode_audio_f32(out_dir / f"{n:02d}.mp3")
        raw_dur = len(raw) / SR
        trim_s = max(0.0, words[0]["start"] - 0.05) if words else 0.0
        trim_e = min(raw_dur, words[-1]["end"] + 0.08) if words else raw_dur
        audio = raw[int(trim_s * SR):int(trim_e * SR)]
        dur = len(audio) / SR
        all_lines.append({"i": n, "start": round(t, 3), "end": round(t + dur, 3), "text": strip_tags(line["text"])})
        for w in words:
            all_words.append({"word": w["word"], "start": round(t + w["start"] - trim_s, 3), "end": round(t + w["end"] - trim_s, 3)})
        master.append(audio)
        gap = float(line.get("gap", 0.0))
        if gap > 0:
            master.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += dur + gap

    total = t + a.tail
    write_mp3(work / "voiceover.mp3", np.concatenate(master))
    (work / "timing.json").write_text(json.dumps({"duration": round(total, 2), "lines": all_lines, "words": all_words},
                                                 indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Voiceover {len(np.concatenate(master)) / SR:.2f}s, video length with tail {total:.2f}s")
    print(f"Done: {work}/voiceover.mp3 and {work}/timing.json")


if __name__ == "__main__":
    main()
