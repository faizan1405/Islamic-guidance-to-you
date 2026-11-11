"""Central settings for every script in this folder. Change IDs and names here only."""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _env(name, default):
    """Read NAME from the environment or from .env in the project root; else use default."""
    if os.environ.get(name):
        return os.environ[name].strip()
    try:
        with open(os.path.join(ROOT, ".env"), encoding="utf-8") as f:
            for line in f:
                if line.startswith(name + "="):
                    v = line.split("=", 1)[1].strip()
                    if v:
                        return v
    except OSError:
        pass
    return default

REELS = os.path.join(ROOT, "01 Islamic Reels")
PUB_DIR = os.path.join(REELS, "Published")
NOT_PUB_DIR = os.path.join(REELS, "Not Published")
CLAIMS = os.path.join(REELS, ".claims")
SCRIPTS_DIR = os.path.join(ROOT, "00 Scripts")
TOPICS_PATH = os.path.join(ROOT, "TOPICS.md")

# Google: Drive > "Islamic Guidance to You" holds the Sheet and the "Reels" subfolder.
SPREADSHEET_ID = _env("ISLAMIC_SHEET_ID", "1Cjb3uR2PhUq5D5vSwLjllq_Sd16SEaOmXIgNoErfPTg")   # Islamic Reels Tracker
DRIVE_FOLDER_ID = _env("ISLAMIC_DRIVE_FOLDER_ID", "18_VnYtQpmEoppyYHATEv_75JRKo_EbaK")             # Islamic Guidance to You / Reels
REELS_TAB = "Reels Tracker"
IDEAS_TAB = "Future Ideas"

CATEGORIES = ("Sahaba Story", "Prophet Story", "Quran Science")
STATUSES = ("Idea", "Script Ready", "In Production", "Done Making Reel", "Scheduled", "Published", "On Hold / Dropped")
LIVE_STATUSES = ("published", "scheduled")  # these live in the Published folder

# Reels Tracker columns: A No, B Reel Topic, C Category, D Status, E Publish Date,
# F Comment Question, G Source Reference, H Drive Link (I-N are numbers + a formula, never written here)
GSHEETS_BIN = shutil.which("gsheets") or "gsheets.cmd"
GDRIVE_BIN = shutil.which("gdrive") or "gdrive.cmd"


def sheet_row(number):
    """Row 1 is the header, so reel N lives in row N+1."""
    return int(number) + 1


def esc(value):
    """The gsheets CLI splits values on commas, so escape them."""
    return str(value).strip().replace(",", "\\,")
