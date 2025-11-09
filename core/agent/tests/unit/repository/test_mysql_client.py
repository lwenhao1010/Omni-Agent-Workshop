"""
Unit tests for repository.mysql_client
"""

from unittest.mock import Mock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from repository.mysql_client import MysqlClient, MysqlClientCache, mysql_client_cache


class TestMysqlClientCache:
    """Test cases for MysqlClientCache."""

    @pytest.mark.unit
    def test_mysql_client_cache_creation(self) -> None:
        """Test MysqlClientCache creation."""
        # Act
        cache = MysqlClientCache()

        # Assert
        assert cache.client is None

    @pytest.mark.unit
    def test_mysql_client_cache_with_client(self) -> None:
        """Test MysqlClientCache with client set."""
        # Arrange
        # Use imported create_engine from module level
        test_engine = create_engine("sqlite:///:memory:")

        # Act
        cache = MysqlClientCache(client=test_engine)

        # Assert
        assert cache.client == test_engine

    @pytest.mark.unit
    def test_global_mysql_client_cache_instance(self) -> None:
        """Test global mysql_client_cache instance."""
        # Assert
        assert isinstance(mysql_client_cache, MysqlClientCache)
        assert mysql_client_cache.client is None


class TestMysqlClient:
    """Test cases for MysqlClient."""

    @pytest.fixture
    def mysql_client(self) -> MysqlClient:
        """Create MysqlClient instance for testing."""
        return MysqlClient(
            database_url="mysql+pymysql://user:pass@localhost:3306/testdb"
        )

    @pytest.fixture
    def mock_client_cache(self) -> Mock:
        """Create mock client cache."""
        return Mock(spec=MysqlClientCache)

    @pytest.mark.unit
    def test_mysql_client_creation_with_url(self) -> None:
        """Test MysqlClient creation with database URL."""
        # Arrange
        db_url = "mysql+pymysql://user:pass@localhost:3306/testdb"

        # Act
        client = MysqlClient(database_url=db_url)

        # Assert
        assert client.database_url == db_url
        assert isinstance(client.client, MysqlClientCache)

    @pytest.mark.unit
    def test_mysql_client_creation_with_custom_cache(
        self, mock_client_cache: Mock
    ) -> None:
        """Test MysqlClient creation with custom cache."""
        # Arrange
        db_url = "mysql+pymysql://user:pass@localhost:3306/testdb"

        # Act
        client = MysqlClient(database_url=db_url, client=mock_client_cache)

        # Assert
        assert client.database_url == db_url
        assert client.client == mock_client_cache

    @pytest.mark.unit
    def test_mysql_client_uses_global_cache_by_default(self) -> None:
        """Test MysqlClient uses global cache by default."""
        # Act
        client = MysqlClient(
            database_url="mysql+pymysql://user:pass@localhost:3306/testdb"
        )

        # Assert
        assert client.client == mysql_client_cache

    @pytest.mark.unit
    def test_create_client_success(self, mysql_client: MysqlClient) -> None:
        """Test successful client creation."""
        # Arrange
        with patch("repository.mysql_client.create_engine") as mock_create_engine:
            mock_engine = Mock()
            mock_create_engine.return_value = mock_engine

            # Act
            mysql_client.create_client()

            # Assert
            assert mysql_client.client.client == mock_engine
            mock_create_engine.assert_called_once_with(
                "mysql+pymysql://user:pass@localhost:3306/testdb",
                connect_args={},
                echo=False,
                pool_size=200,
                max_overflow=800,
                pool_recycle=3600,
            )

    @pytest.mark.unit
    def test_create_client_with_different_params(self) -> None:
        """Test create_client with different database URL."""
        # Arrange
        db_url = "mysql+pymysql://admin:secret@remote:3306/production"
        client = MysqlClient(database_url=db_url)

        with patch("repository.mysql_client.create_engine") as mock_create_engine:
            mock_engine = Mock()
            mock_create_engine.return_value = mock_engine

            # Act
            client.create_client()

            # Assert
            mock_create_engine.assert_called_once_with(
                db_url,
                connect_args={},
                echo=False,
                pool_size=200,
                max_overflow=800,
                pool_recycle=3600,
            )

    @pytest.mark.unit
    def test_session_getter_success(self, mysql_client: MysqlClient) -> None:
        """Test successful session creation and management."""
        # Arrange
        mock_engine = Mock()
        mock_session = Mock(spec=Session)
        mock_sessionmaker = Mock()
        mock_sessionmaker.return_value = mock_session

        mysql_client.client.client = mock_engine

        with patch("repository.mysql_client.sessionmaker") as mock_sessionmaker_class:
            mock_sessionmaker_class.return_value = mock_sessionmaker

            # Act
            with mysql_client.session_getter() as session:
                assert session == mock_session
                # Simulate some database operation
                # session.query.return_value.filter.return_value.first.return_value = None  # pylint: disable=line-too-long

            # Assert
            mock_sessionmaker_class.assert_called_once_with(bind=mock_engine)
            mock_sessionmaker.assert_called_once()
            mock_session.commit.assert_called_once()
            mock_session.close.assert_called_once()

    @pytest.mark.unit
    def test_session_getter_creates_client_if_none(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test session_getter creates client if none exists."""
        # Arrange
        mysql_client.client.client = None
        mock_engine = Mock()
        mock_session = Mock(spec=Session)
        mock_sessionmaker = Mock(return_value=mock_session)

        with (
            patch("repository.mysql_client.create_engine") as mock_create_engine,
            patch("repository.mysql_client.sessionmaker") as mock_sessionmaker_class,
        ):

            mock_create_engine.return_value = mock_engine
            mock_sessionmaker_class.return_value = mock_sessionmaker

            # Act
            with mysql_client.session_getter() as session:
                assert session == mock_session

            # Assert
            mock_create_engine.assert_called_once()
            assert mysql_client.client.client == mock_engine

    @pytest.mark.unit
    def test_session_getter_handles_exception_with_rollback(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test session_getter handles exceptions with rollback."""
        # Arrange
        mock_engine = Mock()
        mock_session = Mock(spec=Session)
        mock_sessionmaker = Mock(return_value=mock_session)

        mysql_client.client.client = mock_engine

        with patch("repository.mysql_client.sessionmaker") as mock_sessionmaker_class:
            mock_sessionmaker_class.return_value = mock_sessionmaker

            # Act & Assert
            with pytest.raises(RuntimeError) as exc_info:
                with mysql_client.session_getter():
                    raise RuntimeError("Database error")

            # Assert
            assert "Database error" in str(exc_info.value)  # type: ignore[unreachable]
            mock_session.rollback.assert_called_once()
            mock_session.close.assert_called_once()
            # commit should not be called when exception occurs
            mock_session.commit.assert_not_called()

    @pytest.mark.unit
    def test_session_getter_handles_exception_no_session(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test session_getter handles exceptions when session creation fails."""
        # Arrange
        mysql_client.client.client = Mock()

        with patch("repository.mysql_client.sessionmaker") as mock_sessionmaker_class:
            # Simulate sessionmaker creation failure
            mock_sessionmaker_class.side_effect = RuntimeError("Sessionmaker error")

            # Act & Assert
            with pytest.raises(RuntimeError) as exc_info:
                with mysql_client.session_getter():
                    pass

            assert "Sessionmaker error" in str(exc_info.value)

    @pytest.mark.unit
    def test_session_getter_context_manager_protocol(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test session_getter follows context manager protocol correctly."""
        # Arrange
        mock_engine = Mock()
        mock_session = Mock(spec=Session)
        mock_sessionmaker = Mock(return_value=mock_session)

        mysql_client.client.client = mock_engine

        with patch("repository.mysql_client.sessionmaker") as mock_sessionmaker_class:
            mock_sessionmaker_class.return_value = mock_sessionmaker

            # Act - Test entering context
            with mysql_client.session_getter() as session:
                assert session == mock_session

            # Assert
            mock_session.commit.assert_called_once()
            mock_session.close.assert_called_once()

    @pytest.mark.unit
    def test_session_getter_context_manager_with_exception(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test session_getter context manager handles exceptions properly."""
        # Arrange
        mock_engine = Mock()
        mock_session = Mock(spec=Session)
        mock_sessionmaker = Mock(return_value=mock_session)

        mysql_client.client.client = mock_engine

        with patch("repository.mysql_client.sessionmaker") as mock_sessionmaker_class:
            mock_sessionmaker_class.return_value = mock_sessionmaker

            # Act & Assert
            try:
                with mysql_client.session_getter():
                    # Simulate exception inside context manager
                    raise RuntimeError("Test exception")
            except RuntimeError:
                pass  # Expected exception

            # Assert
            mock_session.rollback.assert_called_once()
            mock_session.close.assert_called_once()
            mock_session.commit.assert_not_called()

    @pytest.mark.unit
    def test_model_config_allows_arbitrary_types(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test model config allows arbitrary types."""
        # Assert
        config = mysql_client.model_config
        assert (
            hasattr(config, "arbitrary_types_allowed")
            or "arbitrary_types_allowed" in config
        )

    @pytest.mark.unit
    def test_mysql_client_serialization(self, mysql_client: MysqlClient) -> None:
        """Test MysqlClient model serialization."""
        # Act
        client_dict = mysql_client.model_dump()

        # Assert
        assert (
            client_dict["database_url"]
            == "mysql+pymysql://user:pass@localhost:3306/testdb"
        )
        assert "client" in client_dict

    @pytest.mark.unit
    def test_mysql_client_with_complex_database_url(self) -> None:
        """Test MysqlClient with complex database URL containing special characters."""
        # Arrange
        complex_url = (
            "mysql+pymysql://user%40domain:p%40ssw0rd@db.example.com:3306/"
            "my_db?charset=utf8mb4&ssl_disabled=true"
        )

        # Act
        client = MysqlClient(database_url=complex_url)

        # Assert
        assert client.database_url == complex_url

    @pytest.mark.unit
    def test_create_client_engine_configuration(
        self, mysql_client: MysqlClient
    ) -> None:
        """Test create_client configures engine with correct parameters."""
        # Arrange
        with patch("repository.mysql_client.create_engine") as mock_create_engine:
            mock_engine = Mock()
            mock_create_engine.return_value = mock_engine

            # Act
            mysql_client.create_client()

            # Assert
            call_kwargs = mock_create_engine.call_args.kwargs
            assert call_kwargs["connect_args"] == {}
            assert call_kwargs["echo"] is False
            assert call_kwargs["pool_size"] == 200
            assert call_kwargs["max_overflow"] == 800
            assert call_kwargs["pool_recycle"] == 3600
