from pydantic import Field

from api.schemas.base_inputs import BaseInputs


class CompletionInputs(BaseInputs):
    bot_id: str = Field(default="", min_length=1, max_length=64)
