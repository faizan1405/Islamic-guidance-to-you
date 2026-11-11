# READ THIS FIRST: Islamic Reels, my instructions
For every AI working in this folder (Claude Code, Antigravity, any other).
This is the ONLY place for my preferences. If something here conflicts with any other file or memory, this file wins. Update this file when I change a preference; don't create copies elsewhere.
Also read `HANDOFF.md` (latest state, pending work) at the start of every session.

---

## 1. My rules (always)
1. **Talk to me in Hinglish (Roman script), short and simple.** Bullets and tables, no long essays. End with 1 next action.
2. **Only two content types:** (a) **Prophet and Sahaba stories**, (b) **scientific miracles of the Quran**. Sheet categories: `Prophet Story`, `Sahaba Story`, `Quran Science`.
3. **Never make:** zikr reels, dua reels, nasheed reels, controversial topics (maslak disputes, madhab comparisons, fatwa-giving, anything that starts a fight), "spot the mistake" style content.
4. **Verified topics only (section 2).** No verified source = no reel. Skip anything that is only "people believe it is true".
5. **Research heavily every time, before writing any script (section 2).**
6. **Check `TOPICS.md` before suggesting a topic** (never repeat one), and **update it** after every script or reel.
7. **Show me the script + sources first** (short), then make the video only after my OK. No autonomous batch mode, accuracy matters more than speed.
8. **Every reel ends with ONE question** for the comments (section 3).
9. **Never invent** hadith, ayat, quotes, numbers, dates or science claims. If unsure, say "not verified" and drop the topic.
10. **Bigger tasks: plan first.** Short plan in chat, wait for my OK, one step at a time, show the result of each step.
11. **Always tell me the time taken** after each step, and the total at the end of a video (e.g. "⏱ 4 min").
12. **Multi-agent handoff:** read `HANDOFF.md` at the start; update it with 2-3 bullets before ending your turn.
13. **When a video is fully finished** (rendered, saved, caption + sources saved, Sheet and `TOPICS.md` updated), end with just one line: `✅ Video done: <Title> · ⏱ <total time>` + the clickable file link. If a step failed, say which one instead.
14. If you need something from me, ask **short questions**.
15. **GitHub = separate repo, code only.** Never commit `.env`, reels, videos, audio, captions, `00 Scripts/`, `work/`, `TOPICS.md`, `HANDOFF.md`, `docs/` or `projects/*`. Run `git ls-files` and check before every commit. **No `git push` and no upload/publish until I say so.**
16. **Maslak: Hanafi (Imam Abu Hanifa).** If a reel touches a practice where schools differ, either skip that part or say only "Hanafi fiqh me ...". Never give a fatwa, never compare madhabs, never say another school is wrong.

## 2. Verification and research (most important)
**Allowed sources**

| Type | Rule |
|---|---|
| Quran | Surah:ayah number + translation source. Arabic text must be copied exactly from quran.com, never typed from memory |
| Hadith | **Sahih only**, with book + number (Bukhari / Muslim first, or another book with a Sahih grading). Hasan only if I say so |
| Sahaba / Seerah events | Only if in the Quran or a Sahih hadith, or the chain is authentic. Famous stories with no chain are skipped |
| Quran science | Only where the ayat meaning is clear and the science fact is firmly established (NASA, journals, textbooks). Wording: "ayat ye kehti hai, science ne ye paaya". Never "proof hai" |

**Always skip:** weak or fabricated hadith, Israiliyyat, "mashhoor hai" stories, unverifiable dates or numbers, any claim where scholars or scientists disagree.

**Process for every reel**
1. Pick the topic from Sheet tab `Future Ideas` or from me.
2. Research with web search and open the primary sources (quran.com, sunnah.com, etc.). Do not rely on memory.
3. Find at least **2 independent sources** and check the hadith grading.
4. Save the links in the Sheet column `Source Reference`.
5. Show me: topic, one-line claim, sources (links), grade. If it is not verified, say so plainly and suggest another topic.
6. Only after my OK, write the script. Status `Script Ready` only when `Source Reference` is filled.

**Honorifics:** after the Prophet's name say and write ﷺ. After a Sahabi's name write رضي الله عنه / عنها. Same in captions and voice.

## 3. Video spec (default, don't ask me to change it)
- **Format:** 9:16, 1080x1920, **30 fps** (config `fps: 30`), **about 30 seconds**.
- **Hook:** frame 1 is already full (config `"fadeIn": 0`). A **visual hook and a script hook in the first second**. Open a loop early and keep the tension until the payoff at the end.
- **Every reel uses all four formats:**

| Time | Format | Job |
|---|---|---|
| 0-1s | Kinetic typography + silhouette | Hook line + visual that stops the scroll |
| 1-9s | **Silhouette cinematic scene** | Story or scene starts, tension builds |
| 9-16s | **Animated map journey** | Where, how far, when |
| 16-25s | **Split-screen** | One side: ayat/hadith + reference. Other side: real place, diagram or observation |
| 25-30s | **Kinetic typography + Arabic calligraphy** | Payoff line + the comment question |

- **Not used:** the two-cartoon-people dialogue format.
- **Faces:** the face of the Prophet ﷺ and of every Sahabi is never drawn. A **sun or moon sits over the face**. Default: sun = Prophet ﷺ, moon = Sahaba (confirm with me). No angels as figures. No depiction of Allah.
- **Comment question (every reel):** one clear question, easy to answer in one line, shown on screen in the last 3-4 seconds, repeated at the end of the caption, and saved in the Sheet column `Comment Question`. Example style: "Aapko kaunsa hissa sabse zyada surprising laga? Comment me likho."
- **Language and voice:** Hinglish (Roman script) with Urdu words where natural. **Voice is not chosen yet.** Before the first reel, send me 2-3 voice samples to pick from. ElevenLabs `eleven_v4`, key in `.env` (`ELEVENLABS_API_KEY`).
- **Captions:** always burned in, up to 3 words, current word highlighted. No speaker chips (single narrator).
- **Sound:** no music by default (voice + SFX only: pop, whoosh, tick, riser, reveal). Ask me before adding any music. Voice always clear, -14 LUFS, no clipping, SFX never on top of important words.
- **End card:** the comment question + page name (not decided yet). No logo yet.
- **Animation:** everything eases in and out, a camera move in every shot, nothing still for more than ~1.5 s, smooth transitions between the four formats.
- **Script rules:** hook first, one idea per line, short lines, human voice (not textbook, not AI-sounding). Self-check before sending: Is the hook strong in 1 second? Is every fact verified? Does the last line lead into the question?

## 4. Output and folders
- **Folders:** `00 Scripts/` (`Script - NN <Title>.md`), `01 Islamic Reels/` with `Published/` and `Not Published/`, `work/reelNN/` (voice, timing, QC per reel).
- **Tracker:** Google Sheet **Islamic Reels Tracker**, ID `1Cjb3uR2PhUq5D5vSwLjllq_Sd16SEaOmXIgNoErfPTg`.
  - `Reels Tracker`: No, Reel Topic, Category, Status, Publish Date, Comment Question, Source Reference, Drive Link, Views, Likes, Comments, Shares, Saves, Engagement % (formula, don't overwrite).
  - `Future Ideas`: No, Idea / Topic, Category, Hook Line, Comment Question, Source Reference, Script / Caption Draft, Priority, Status.
  - `Goals`: Goal, Target, Current, Progress, Deadline, Status, Notes. Don't invent targets, I fill them.
  - Status values (Reels Tracker): `Idea`, `Script Ready`, `In Production`, `Done Making Reel`, `Scheduled`, `Published`, `On Hold / Dropped`.
- **Caption:** saved as `NN - <Title> - caption.txt` next to the MP4. Short, value bullets, fresh wording (never copy the script), sources line, the comment question, relevant hashtags.
- **Drive:** folder **Islamic Guidance to You** (ID `1ndT1phAEKLhZGI9GKybHviz_JzYanLA2`), subfolder `Reels` (ID `18_VnYtQpmEoppyYHATEv_75JRKo_EbaK`); the Sheet lives in the main folder. `scripts/save_reel.py` uploads the Full HD render + caption to `Reels` automatically. IDs are set in `scripts/config.py` (overridable via `.env`).
- **Upload / scheduling:** do NOT post until I ask. When I ask, reply only: "Publish or schedule?". Metricool brand for this page is not set up yet.
- **Git:** own new repo, code only (rule 15). `.gitignore` already blocks content; still verify with `git ls-files`.
- **Scripts (rewritten, use them):** all in `scripts/`, settings in `config.py`.
  - `claim_reel_number.py`: reserves the next reel number (atomic, safe for several AIs at once). Use it before starting a reel.
  - `generate_voice.py` → `scale_voice.py` → `populate_project.py`: voice (single narrator, ElevenLabs), fit to 30 s, scaffold project (fps 30, 9:16, no music).
  - `save_reel.py`: the finish line. **Required:** `--number --title --category --video --caption --question --source`. It refuses if the question is empty, fewer than 2 sources (separate with ` | `), or the number was not claimed. Copies to `Not Published/` (or `Published/` with `--published`), uploads to Drive, logs to the Sheet (columns A-H only, never I-N).
  - `organize_reels.py` (move by Sheet status), `sync_drive.py` (upload missing + Drive Link), `sync_sheet.py` (log one row), `update_topics.py` (rebuild `TOPICS.md`).

## 5. Technical reference (for the AI, not for me)
**Folders**
- `growkaz-stickman-studio/`: main renderer (canvas + Three.js frames in headless Chromium, then ffmpeg). `engine/` (core, rig2d, fx2d, ui2d, three-kit, styles, `sf2/` kit), `tools/`, `audio/mix.py`, `projects/<slug>/`.
- `projects/`: `_reference-template` (old v2 reel, use only to learn how a shot file, `shots.json` SFX cues and the hook are built; its content is NOT for reuse), `sf2-lab`, `sf2-step1`, `test-optionA`.
- `growkaz-plugin/`: silhouette stickman style (black figures with rim light). This is the base for the faceless sun/moon characters.
- `video3d/`: Remotion project (`Scene3D`, `Captions`) for 3D and caption work.
- `docs/`: reference PDF and plugin file. `.env`: `ELEVENLABS_API_KEY`.

**Engine notes**
- Face characters from `engine/sf2/chars.js` (`drawPerson`) are **not used** for Prophet/Sahaba. New faceless character with sun/moon still has to be built.
- `engine/sf2/ui.js` still has the speaker-chip and logo-loader code (unused, single narrator). `engine/styles.js` has generic styles (`emerald`, `goldNight`, `lightBright`, ...). The final look is not decided yet.
- SFX library: `engine/sf2/sfx/` (tap, click, pop, slide, card, whoosh, whoosh_big, whip, riser, reveal, sparkle, pen, boing, success, error, typing, coin, stamp, notif + ambience). Generate missing ones with the ElevenLabs sound-generation API.
- Music file `engine/sf2/music/upbeat_explainer_31s.mp3` is not used (no music by default).

**Pipeline**
1. Verified topic (section 2) → my OK → script.
2. Voice with ElevenLabs + timestamps → captions timing.
3. Scaffold project (`scripts/populate_project.py`), compose the four formats in `scenes/shots/`.
4. Render (`node render.mjs`) → mix (`audio/mix.py`, -14 LUFS) → QC (stills sheet, no overlaps, no cut text, no empty frames).
5. `scripts/save_reel.py` (copy + Drive + Sheet), then `scripts/update_topics.py`.

**Windows gotchas:** keep paths short; use `python -X utf8`; run render commands from inside `growkaz-stickman-studio/`.
