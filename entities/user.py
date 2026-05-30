from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class User:
    id: Optional[int] = None
    name: str = ""
    username: str = ""
    password: str = ""


@dataclass
class Session:
    id: Optional[int] = None
    username: str = ""
    token: str = ""
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None