from pydantic import BaseModel, ConfigDict, Field


class BotKnowledgeConfig(BaseModel):
    score_threshold: float = Field(default=0.3)
    top_k: int = Field(default=3)


class BotModelDetailParameterConfig(BaseModel):
    max_tokens: int = Field(default=2048)
    question_type: str = Field(default="not_knowledge")
    temperature: float = Field(default=0.5)
    top_k: int = Field(default=4)


class BotModelDetailConfig(BaseModel):
    api: str = Field(default="")
    domain: str = Field(default="")
    sk: str = Field(default="")
    parameter: BotModelDetailParameterConfig = Field(
        default_factory=BotModelDetailParameterConfig
    )
    patch_id: list[str] = Field(default_factory=list)
    support_function_call: bool = Field(default=False)


class BotModelConfig(BaseModel):
    instruct: str = Field(default="")  # {"think_tip": "", "answer_tip": ""}
    plan: BotModelDetailConfig = Field(default_factory=BotModelDetailConfig)
    summary: BotModelDetailConfig = Field(default_factory=BotModelDetailConfig)


class BotRegularMatchConfig(BaseModel):
    repoId: list[str] = Field(default_factory=list)
    docId: list[str] = Field(default_factory=list)


class BotRegularRagConfig(BaseModel):
    type: str = Field(default="AIUI-RAG2")


class BotRegularConfig(BaseModel):
    match: BotRegularMatchConfig = Field(default_factory=BotRegularMatchConfig)
    rag: BotRegularRagConfig = Field(default_factory=BotRegularRagConfig)


class BotConfig(BaseModel):
    app_id: str = Field(..., min_length=1, max_length=64)
    bot_id: str = Field(..., min_length=1, max_length=64)
    knowledge_config: BotKnowledgeConfig = Field(default_factory=BotKnowledgeConfig)
    model_config_: BotModelConfig = Field(alias="model_config")
    regular_config: BotRegularConfig
    tool_ids: list[str] = Field(default_factory=list)
    mcp_server_ids: list[str] = Field(default_factory=list)
    mcp_server_urls: list[str] = Field(default_factory=list)
    flow_ids: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")
