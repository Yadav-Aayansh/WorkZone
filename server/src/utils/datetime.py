from datetime import datetime
from zoneinfo import ZoneInfo

def get_indian_time():
    indian_tz = ZoneInfo("Asia/Kolkata")
    return datetime.now(indian_tz)

def get_indian_year():
    return get_indian_time().year
