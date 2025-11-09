# pyright: reportIncompatibleVariableOverride=false
from typing import List, Literal, Optional

from openai.types.chat.chat_completion_chunk import (
    ChatCompletionChunk,
    Choice,
    ChoiceDelta,
    ChoiceDeltaToolCall,
    ChoiceDeltaToolCallFunction,
)
from pydantic import Field


class ReasonChoiceDeltaToolCallFunction(ChoiceDeltaToolCallFunction):
    response: Optional[str] = None


class ReasonChoiceDeltaToolCall(ChoiceDeltaToolCall):
    reason: str = Field(default="")
    function: Optional[ReasonChoiceDeltaToolCallFunction] = None
    type: Optional[Literal["workflow", "tool", "knowledge"]] = None


class ReasonChoiceDelta(ChoiceDelta):
    reasoning_content: Optional[str] = None

    tool_calls: Optional[List[ReasonChoiceDeltaToolCall]] = None
    role: Optional[Literal["assistant"]] = Field(default="assistant")


class ReasonChoice(Choice):
    delta: ReasonChoiceDelta


class ReasonChatCompletionChunk(ChatCompletionChunk):
    choices: List[ReasonChoice]
    code: int = Field(default=0)
    message: str = Field(default="success")
    object: Literal[
        "chat.completion.chunk",
        "chat.completion.log",
        "chat.completion.knowledge_metadata",
    ]
    logs: list[str] = Field(default_factory=list)
    knowledge_metadata: list[str] = Field(default_factory=list)
