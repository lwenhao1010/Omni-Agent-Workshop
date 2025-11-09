from typing import Optional

from pydantic import BaseModel


class PrivateConfig(BaseModel):
    timeout: Optional[float] = 2 * 60.0

    class Config:
        extra = "forbid"
        validate_assignment = True
