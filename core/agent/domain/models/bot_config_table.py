from datetime import datetime

from sqlalchemy import DATETIME, JSON, SMALLINT, BigInteger, Column, String
from sqlalchemy.orm import declarative_base

from repository.mysql_client import MysqlClient

Base = declarative_base()


class TbBotConfig(Base):  # type: ignore[valid-type,misc]
    __tablename__ = "bot_config"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    app_id = Column(String(32), nullable=False, comment="应用id")
    bot_id = Column(String(40), nullable=False, unique=True, comment="bot_id")
    knowledge_config = Column(JSON, nullable=False, comment="知识库参数配置")
    model_config = Column(JSON, nullable=False, comment="模型配置")
    regular_config = Column(JSON, nullable=False, comment="知识库选择配置")
    tool_ids = Column(JSON, nullable=False, comment="工具id配置")
    mcp_server_ids = Column(JSON, nullable=False, comment="mcp server id")
    mcp_server_urls = Column(JSON, nullable=False, comment="mcp server url")
    flow_ids = Column(JSON, nullable=False, comment="flow id")

    create_at = Column(DATETIME, default=datetime.now)
    update_at = Column(DATETIME, default=datetime.now, onupdate=datetime.now)
    is_deleted = Column(SMALLINT, nullable=False, default=0, comment="删除标志")

    async def create_or_update(self, client: MysqlClient) -> None:
        with client.session_getter() as session:
            session.add(self)
            session.commit()

    async def delete(self, client: MysqlClient) -> None:
        with client.session_getter() as session:
            record = (
                session.query(TbBotConfig)
                .filter_by(app_id=self.app_id, bot_id=self.bot_id, is_deleted=False)
                .first()
            )

            if record:
                record.is_deleted = True
                session.commit()
