from pydantic import BaseModel, ConfigDict, Field


class KnowledgeConfig(BaseModel):
    score_threshold: float = Field(default=0)
    top_k: int = Field(default=0)


class Match(BaseModel):
    repoId: list[str] = Field(default_factory=list)


class Rag(BaseModel):
    type: str = Field(default="")


class RegularConfig(BaseModel):
    match: Match = Field(default_factory=Match)
    rag: Rag = Field(default_factory=Rag)


class RagConfig(BaseModel):
    knowledge_config: KnowledgeConfig = Field(default_factory=KnowledgeConfig)
    regular_config: RegularConfig = Field(default_factory=RegularConfig)


class ModelDetailParameter(BaseModel):
    max_tokens: int = Field(default=0)
    question_type: str = Field(default="")
    temperature: float = Field(default=0)
    top_k: int = Field(default=0)


class ModelDetailConfig(BaseModel):
    api: str = Field(default="")
    domain: str = Field(default="")
    patch_id: list[str] = Field(default_factory=list)
    sk: str = Field(default="")
    support_function_call: bool = Field(default=False)
    parameter: ModelDetailParameter = Field(default_factory=ModelDetailParameter)


class ModelConfig(BaseModel):
    plan: ModelDetailConfig = Field(default_factory=ModelDetailConfig)
    summary: ModelDetailConfig = Field(default_factory=ModelDetailConfig)


class Instruct(BaseModel):
    think_tip: str = Field(default="")
    answer_tip: str = Field(default="")


class Plugin(BaseModel):
    tool_ids: list[str] = Field(default_factory=list)
    mcp_server_ids: list[str] = Field(default_factory=list)
    mcp_server_urls: list[str] = Field(default_factory=list)


class BotConfigMgrInput(BaseModel):
    app_id: str
    bot_id: str
    rag_config: RagConfig = Field(default_factory=RagConfig)
    model_config_: ModelConfig = Field(
        alias="model_config", default_factory=ModelConfig
    )
    instruct: Instruct = Field(default_factory=Instruct)
    plugin: Plugin = Field(default_factory=Plugin)

    model_config = ConfigDict(extra="allow")
