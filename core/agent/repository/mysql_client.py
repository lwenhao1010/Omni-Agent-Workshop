from contextlib import contextmanager
from typing import Generator

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


class MysqlClientCache(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    client: Engine | None = None


mysql_client_cache = MysqlClientCache()


class MysqlClient(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    database_url: str
    client: MysqlClientCache = Field(default=mysql_client_cache)

    def create_client(self) -> None:
        """Create client"""
        self.client.client = create_engine(  # pylint: disable=no-member
            self.database_url,
            connect_args={},
            echo=False,
            pool_size=200,
            max_overflow=800,
            pool_recycle=3600,
        )

    @contextmanager
    def session_getter(self) -> Generator[Session, None, None]:
        session = None
        try:
            if self.client.client is None:  # pylint: disable=no-member
                self.create_client()
            # pylint: disable=no-member
            session_factory = sessionmaker(bind=self.client.client)
            session = session_factory()
            yield session
            session.commit()
        except Exception as e:
            if session is not None:
                session.rollback()
            raise e
        finally:
            if session is not None:
                session.close()
