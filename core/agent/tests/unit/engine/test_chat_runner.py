"""
Unit tests for engine.nodes.chat.chat_runner
"""

from typing import Any, AsyncIterator, List
from unittest.mock import AsyncMock, Mock, patch

import pytest

from api.schemas.agent_response import AgentResponse
from api.schemas.llm_message import LLMMessage
from api.schemas.node_trace_patch import NodeTrace
from common_imports import Span
from domain.models.base import BaseLLMModel
from engine.nodes.chat.chat_prompt import CHAT_SYSTEM_TEMPLATE, CHAT_USER_TEMPLATE
from engine.nodes.chat.chat_runner import ChatRunner


class TestChatRunner:
    """Test cases for ChatRunner."""

    @pytest.fixture
    def mock_llm_model(self) -> Mock:
        """Create mock LLM model."""
        mock_model = Mock(spec=BaseLLMModel)
        mock_model.name = "gpt-3.5-turbo"
        mock_model.stream = AsyncMock()
        return mock_model

    @pytest.fixture
    def sample_chat_history(self) -> List[LLMMessage]:
        """Sample chat history for testing."""
        return [
            LLMMessage(role="user", content="Hello"),
            LLMMessage(role="assistant", content="Hi there!"),
        ]

    @pytest.fixture
    def chat_runner(
        self, mock_llm_model: Mock, sample_chat_history: List[LLMMessage]
    ) -> ChatRunner:
        """Create ChatRunner instance for testing."""
        return ChatRunner(
            model=mock_llm_model,
            chat_history=sample_chat_history,
            instruct="You are a helpful assistant.",
            knowledge="Some knowledge base content.",
            question="How can I help you today?",
        )

    @pytest.mark.unit
    def test_chat_runner_creation_with_all_fields(
        self, mock_llm_model: Mock, sample_chat_history: List[LLMMessage]
    ) -> None:
        """Test ChatRunner creation with all fields."""
        # Act
        runner = ChatRunner(
            model=mock_llm_model,
            chat_history=sample_chat_history,
            instruct="Custom instruction",
            knowledge="Knowledge content",
            question="Test question",
        )

        # Assert
        assert runner.model == mock_llm_model
        assert len(runner.chat_history) == 2
        assert runner.instruct == "Custom instruction"
        assert runner.knowledge == "Knowledge content"
        assert runner.question == "Test question"

    @pytest.mark.unit
    def test_chat_runner_creation_with_defaults(
        self, mock_llm_model: Mock, sample_chat_history: List[LLMMessage]
    ) -> None:
        """Test ChatRunner creation with default values."""
        # Act
        runner = ChatRunner(model=mock_llm_model, chat_history=sample_chat_history)

        # Assert
        assert runner.instruct == ""
        assert runner.knowledge == ""
        assert runner.question == ""

    @pytest.mark.unit
    def test_chat_runner_inherits_from_runner_base(
        self, chat_runner: ChatRunner
    ) -> None:
        """Test ChatRunner inherits from RunnerBase."""
        # Assert
        assert hasattr(chat_runner, "model")
        assert hasattr(chat_runner, "chat_history")
        assert hasattr(chat_runner, "cur_time")
        assert hasattr(chat_runner, "create_history_prompt")
        assert hasattr(chat_runner, "model_general_stream")

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_success(self, chat_runner: ChatRunner) -> None:
        """Test successful run execution."""
        # Arrange
        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        # Mock the model_general_stream method
        expected_responses = [
            AgentResponse(typ="content", content="Hello", model="gpt-3.5-turbo"),
            AgentResponse(typ="content", content=" there!", model="gpt-3.5-turbo"),
        ]

        async def mock_stream(
            *_args: Any, **_kwargs: Any  # pylint: disable=unused-argument
        ) -> AsyncIterator[AgentResponse]:
            for response in expected_responses:
                yield response

        # Patch the model_general_stream method
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=mock_stream,
        ) as mock_method:
            # Act
            responses = []
            async for response in chat_runner.run(mock_span, mock_node_trace):
                responses.append(response)

            # Assert
            assert len(responses) == 2
            assert responses[0].content == "Hello"
            assert responses[1].content == " there!"

            # Verify span was started correctly
            mock_span.start.assert_called_once_with("RunChatAgent")

            # Verify model_general_stream was called with correct arguments
            mock_method.assert_called_once()
            call_args = mock_method.call_args
            messages = call_args[0][0]  # First positional argument

            assert len(messages) == 2
            assert messages[0]["role"] == "system"
            assert messages[1]["role"] == "user"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_constructs_correct_system_prompt(
        self, chat_runner: ChatRunner
    ) -> None:
        """Test run constructs system prompt correctly."""
        # Arrange
        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        async def mock_stream(
            *_args: Any, **_kwargs: Any
        ) -> AsyncIterator[Any]:  # pylint: disable=unused-argument
            return
            yield  # Make it an async generator

        # Patch the model_general_stream method
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=mock_stream,
        ) as mock_method:
            # Mock cur_time to return predictable value
            with patch(
                "engine.nodes.chat.chat_runner.ChatRunner.cur_time",
                return_value="2024-01-01 12:00:00",
            ):
                # Act
                async for _ in chat_runner.run(mock_span, mock_node_trace):
                    break

            # Assert
            call_args = mock_method.call_args
            messages = call_args[0][0]
            system_message = messages[0]

            expected_system = CHAT_SYSTEM_TEMPLATE.replace(
                "{now}", "2024-01-01 12:00:00"
            )
            expected_system = expected_system.replace(
                "{instruct}", "You are a helpful assistant."
            )
            expected_system = expected_system.replace(
                "{knowledge}", "Some knowledge base content."
            )

            assert system_message["content"] == expected_system

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_constructs_correct_user_prompt(
        self, chat_runner: ChatRunner
    ) -> None:
        """Test run constructs user prompt correctly."""
        # Arrange
        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        async def mock_stream(
            *_args: Any, **_kwargs: Any
        ) -> AsyncIterator[Any]:  # pylint: disable=unused-argument
            return
            yield

        # Patch the model_general_stream method
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=mock_stream,
        ) as mock_method:
            # Mock create_history_prompt to return predictable value
            expected_history = "User: Hello\nAssistant: Hi there!"
            with patch(
                "engine.nodes.chat.chat_runner.ChatRunner.create_history_prompt",
                AsyncMock(return_value=expected_history),
            ):
                # Act
                async for _ in chat_runner.run(mock_span, mock_node_trace):
                    break

                # Assert
                call_args = mock_method.call_args
                messages = call_args[0][0]
                user_message = messages[1]

                expected_user = CHAT_USER_TEMPLATE.replace(
                    "{chat_history}", expected_history
                )
                expected_user = expected_user.replace(
                    "{question}", "How can I help you today?"
                )

                assert user_message["content"] == expected_user

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_with_empty_fields(
        self, mock_llm_model: Mock, sample_chat_history: List[LLMMessage]
    ) -> None:
        """Test run with empty instruct, knowledge, and question."""
        # Arrange
        runner = ChatRunner(
            model=mock_llm_model,
            chat_history=sample_chat_history,
            instruct="",
            knowledge="",
            question="",
        )

        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        async def mock_stream(
            *_args: Any, **_kwargs: Any
        ) -> AsyncIterator[Any]:  # pylint: disable=unused-argument
            return
            yield

        # Patch the model_general_stream method
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=mock_stream,
        ) as mock_method:
            with patch(
                "engine.nodes.chat.chat_runner.ChatRunner.cur_time",
                return_value="2024-01-01 12:00:00",
            ):
                # Act
                async for _ in runner.run(mock_span, mock_node_trace):
                    break

            # Assert
            call_args = mock_method.call_args
            messages = call_args[0][0]

            # System prompt should have empty replacements
            system_content = messages[0]["content"]
            assert "{instruct}" not in system_content
            assert "{knowledge}" not in system_content
            assert "{now}" not in system_content

            # User prompt should have empty question
            user_content = messages[1]["content"]
            assert "{question}" not in user_content
            assert "{chat_history}" not in user_content

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_handles_model_stream_error(
        self, chat_runner: ChatRunner
    ) -> None:
        """Test run handles model streaming errors."""
        # Arrange
        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        # Mock model_general_stream to raise an exception
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=Exception("Model error"),
        ):
            # Act & Assert
            with pytest.raises(Exception) as exc_info:
                async for _ in chat_runner.run(mock_span, mock_node_trace):
                    pass

            assert "Model error" in str(exc_info.value)

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_with_unicode_content(self, mock_llm_model: Mock) -> None:
        """Test run with unicode content in fields."""
        # Arrange
        history = [
            LLMMessage(role="user", content="你好"),
            LLMMessage(role="assistant", content="您好！我是AI助手"),
        ]

        runner = ChatRunner(
            model=mock_llm_model,
            chat_history=history,
            instruct="请用中文回答",
            knowledge="一些中文知识库内容",
            question="请问您需要什么帮助？",
        )

        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        async def mock_stream(
            *_args: Any, **_kwargs: Any  # pylint: disable=unused-argument
        ) -> AsyncIterator[AgentResponse]:
            yield AgentResponse(
                typ="content", content="中文回复", model="gpt-3.5-turbo"
            )

        # Patch the model_general_stream method
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=mock_stream,
        ) as mock_method:
            # Act
            responses = []
            async for response in runner.run(mock_span, mock_node_trace):
                responses.append(response)

            # Assert
            assert len(responses) == 1
            assert responses[0].content == "中文回复"

            # Verify the messages contain unicode content
            call_args = mock_method.call_args
            messages = call_args[0][0]

            assert "请用中文回答" in messages[0]["content"]
            assert "一些中文知识库内容" in messages[0]["content"]
            assert "请问您需要什么帮助？" in messages[1]["content"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_run_passes_correct_span_and_trace(
        self, chat_runner: ChatRunner
    ) -> None:
        """Test run passes span and node_trace correctly to model_general_stream."""
        # Arrange
        mock_span = Mock(spec=Span)
        mock_span_context = Mock()

        # Create a proper context manager mock
        context_manager = Mock()
        context_manager.__enter__ = Mock(return_value=mock_span_context)
        context_manager.__exit__ = Mock(return_value=None)
        mock_span.start = Mock(return_value=context_manager)

        mock_node_trace = Mock(spec=NodeTrace)

        async def mock_stream(
            *_args: Any, **_kwargs: Any
        ) -> AsyncIterator[Any]:  # pylint: disable=unused-argument
            return
            yield

        # Patch the model_general_stream method
        with patch(
            "engine.nodes.chat.chat_runner.ChatRunner.model_general_stream",
            side_effect=mock_stream,
        ) as mock_method:
            # Act
            async for _ in chat_runner.run(mock_span, mock_node_trace):
                break

            # Assert
            call_args = mock_method.call_args
            assert (
                call_args[0][1] == mock_span_context
            )  # Second argument should be span context
            assert (
                call_args[0][2] == mock_node_trace
            )  # Third argument should be node_trace
