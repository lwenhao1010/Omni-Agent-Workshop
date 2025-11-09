import time
from typing import Any, Literal, Optional

from openai.types.completion_usage import CompletionUsage
from pydantic import BaseModel, Field

from service.plugin.base import BasePlugin


def cur_timestamp() -> int:
    return int(time.time() * 1000)


class CotStep(BaseModel):
    thought: str = Field(default="")
    action: str = Field(default="")
    action_input: dict[str, Any] = Field(default_factory=dict)
    action_output: dict[str, Any] = Field(default_factory=dict)
    finished_cot: bool = Field(default=False)
    tool_type: Optional[Literal["workflow", "tool"]] = Field(default=None)

    empty: bool = Field(default=False)
    plugin: Optional[BasePlugin] = Field(default=None)


class AgentResponse(BaseModel):
    typ: Literal[
        "reasoning_content", "content", "cot_step", "log", "knowledge_metadata"
    ]
    content: str | CotStep | list
    model: str
    created: int = Field(default_factory=cur_timestamp)
    usage: Optional[CompletionUsage] = Field(default=None)
