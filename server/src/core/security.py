import uuid
from jose import jwt, ExpiredSignatureError, JWTError
from datetime import datetime, timezone, timedelta
from .config import Config
from fastapi import HTTPException
    
def create_access_token(payload: dict, expires_minutes: int = 15) -> str:
    iat = datetime.now(timezone.utc)
    expire = iat + timedelta(minutes=expires_minutes)
    to_encode = {**payload, "iat": iat, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, Config.JWT_SECRET_KEY, Config.JWT_ALGORITHM)


def create_refresh_token(payload: dict, expires_days: int = 7) -> str:
    iat = datetime.now(timezone.utc)
    expire = iat + timedelta(days=expires_days)
    to_encode = {
        **payload,
        "iat": iat,
        "exp": expire,
        "type": "refresh",
        "jti": str(uuid.uuid4())
    }
    return jwt.encode(to_encode, Config.JWT_SECRET_KEY, Config.JWT_ALGORITHM)

def create_tokens(payload: dict) -> dict:
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    return {"access_token": access_token, "refresh_token": refresh_token}

def decode_token(token: str, exp_aud: str, exp_type: str = "access") -> dict:
    try:
        print(exp_aud)
        payload = jwt.decode(
            token=token,
            key=Config.JWT_SECRET_KEY,
            algorithms=[Config.JWT_ALGORITHM],
            audience=exp_aud
        )
        if payload.get("type") != exp_type:
            raise HTTPException(status_code=401, detail="Invalid token!")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Expired token!")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token!{e}")
    
