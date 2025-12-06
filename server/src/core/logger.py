import logging
from pathlib import Path
from .config import Config

def setup_logger(name: str) -> logging.Logger:
    Path("logs").mkdir(exist_ok=True)

    LOG_FILE = "logs/workzone.log"
    LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
    
    logger = logging.getLogger(name)

    if logger.hasHandlers():
        logger.handlers.clear()

    logging.basicConfig(
        level=Config.LOG_LEVEL,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[
            logging.FileHandler(LOG_FILE, encoding="utf-8"),
            logging.StreamHandler()
        ]
    )

    return logger

logger = setup_logger("WorkZone")

    
