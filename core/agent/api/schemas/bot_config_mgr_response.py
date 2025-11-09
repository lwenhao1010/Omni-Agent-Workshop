from typing import Optional

from pydantic import BaseModel, Field


class GeneralResponse(BaseModel):
    code: int = Field(default=0)
    """Bot config management response status code"""

    message: str = Field(default="success")
    """Bot config management status code description message"""

    data: Optional[dict] = Field(default=None)
    """Bot config data"""
