# Islamic Guidance to You: reel video generator (code only)

Code-drawn 2D animation engine for 30-second Instagram Reels (Prophet/Sahaba stories and Quran-science reels).
Yahan **sirf code** hai. Reels, scripts, audio, captions aur `.env` is repo me nahi hain (Drive/PC par rehte hain).

## Setup (ek baar)
1. Install: **Node 20+**, **Python 3.10+**, **ffmpeg** (PATH me).
2. `cd growkaz-stickman-studio && npm install && npx playwright install chromium`
3. `cd video3d && npm install` (sirf 3D/Remotion kaam ke liye, optional)
4. `pip install -r requirements.txt` (`torch` ke liye CPU build kaafi hai)
5. `copy .env.example .env` aur apni `ELEVENLABS_API_KEY` daalo.
6. Optional (Sheet + Drive sync): `gsheets` aur `gdrive` CLIs install karo. `.env` me `ISLAMIC_SHEET_ID` / `ISLAMIC_DRIVE_FOLDER_ID` daalo agar apni Sheet/Drive use karni ho.

## Roz ka flow
Rules aur video spec: **AGENTS.md** (single source of truth). Windows par `python -X utf8` use karo.

```
python scripts/claim_reel_number.py                 # next reel number
python scripts/generate_voice.py --reel 01 --script work/reel01/voice_script.json --voice-id <ID>
python scripts/scale_voice.py --reel 01 --target 30
python scripts/populate_project.py --reel 01 --slug islamic-01-<name> --title "<Title>"
cd growkaz-stickman-studio && node render.mjs projects/islamic-01-<name>   # render + mix
python scripts/save_reel.py --number 01 --title "<Title>" --category "Sahaba Story" \
    --video <mp4> --caption <txt> --question "<comment question>" --source "<url1> | <url2>"
python scripts/organize_reels.py                    # Published / Not Published
python scripts/update_topics.py                     # TOPICS.md rebuild
```

## Folders
| Folder | Kaam |
|---|---|
| `growkaz-stickman-studio/` | Renderer (canvas + Three.js, headless Chromium, ffmpeg) |
| `growkaz-plugin/` | Silhouette character style |
| `video3d/` | Remotion 3D / captions |
| `scripts/` | Voice, project, Sheet, Drive, save/organize scripts |
| `01 Islamic Reels/` | Final reels (`Published/`, `Not Published/`) , git me nahi |
| `00 Scripts/`, `work/` | Scripts aur per-reel working files, git me nahi |

Repo private rakho. Kabhi `.env`, video ya reel content commit mat karo (`.gitignore` ye block karta hai).
