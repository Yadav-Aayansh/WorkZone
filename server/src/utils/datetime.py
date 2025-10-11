from datetime import datetime
from zoneinfo import ZoneInfo

def get_indian_time():
    indian_tz = ZoneInfo("Asia/Kolkata")
    return datetime.now(indian_tz)