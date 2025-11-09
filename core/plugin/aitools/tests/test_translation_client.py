"""
Unit tests for translation client module.
"""

import json
import os
from typing import Generator
from unittest.mock import Mock, patch

import pytest
from plugin.aitools.service.translation.translation_client import TranslationClient


class TestTranslationClient:
    """Test cases for TranslationClient"""

    @pytest.fixture
    def client(self) -> TranslationClient:
        """Create a test translation client instance"""
        return TranslationClient(
            app_id="test_app_id", api_key="test_api_key", api_secret="test_api_secret"
        )

    @pytest.fixture
    def mock_env_vars(self) -> Generator[None, None, None]:
        """Mock environment variables"""
        with patch.dict(
            os.environ, {"TRANSLATION_URL": "https://test.translation.url"}
        ):
            yield

    def test_init(self, mock_env_vars: Generator[None, None, None]) -> None:
        """Test client initialization"""
        client = TranslationClient("app_id", "api_key", "api_secret")
        assert client.app_id == "app_id"
        assert client.api_key == "api_key"
        assert client.api_secret == "api_secret"
        assert client.base_url == "https://test.translation.url"

    def test_validate_input_empty_text(self, client: TranslationClient) -> None:
        """Test validation with empty text"""
        is_valid, error_msg = client._validate_input("", "cn", "en")
        assert not is_valid
        assert "翻译文本不能为空" in error_msg

    def test_validate_input_too_long_text(self, client: TranslationClient) -> None:
        """Test validation with text too long"""
        long_text = "a" * 5001
        is_valid, error_msg = client._validate_input(long_text, "cn", "en")
        assert not is_valid
        assert "翻译文本超过5000字符限制" in error_msg

    @patch(
        "plugin.aitools.service.translation.translation_client.is_valid_language_pair"
    )
    def test_validate_input_invalid_language_pair(
        self, mock_is_valid: Mock, client: TranslationClient
    ) -> None:
        """Test validation with invalid language pair"""
        mock_is_valid.return_value = False
        is_valid, error_msg = client._validate_input("test", "invalid", "en")
        assert not is_valid
        assert "不支持的语言组合" in error_msg

    def test_validate_input_valid(self, client: TranslationClient) -> None:
        """Test validation with valid input"""
        with patch(
            "plugin.aitools.service.translation.translation_client.is_valid_language_pair",
            return_value=True,
        ):
            is_valid, error_msg = client._validate_input("test", "cn", "en")
            assert is_valid
            assert error_msg == ""

    def test_parse_translation_response_with_trans_result(
        self, client: TranslationClient
    ) -> None:
        """Test parsing response with trans_result structure"""
        response_text = json.dumps({"trans_result": {"dst": "translated text"}})
        result = client._parse_translation_response(response_text)
        assert result == "translated text"

    def test_parse_translation_response_without_trans_result(
        self, client: TranslationClient
    ) -> None:
        """Test parsing response without trans_result structure"""
        response_text = json.dumps({"other": "data"})
        result = client._parse_translation_response(response_text)
        assert result == response_text

    def test_parse_translation_response_invalid_json(
        self, client: TranslationClient
    ) -> None:
        """Test parsing response with invalid JSON"""
        response_text = "not json"
        result = client._parse_translation_response(response_text)
        assert result == response_text

    @patch("plugin.aitools.service.translation.translation_client.assemble_auth_url")
    @patch("plugin.aitools.service.translation.translation_client.requests.post")
    def test_translate_success(
        self,
        mock_post: Mock,
        mock_auth_url: Mock,
        client: TranslationClient,
        mock_env_vars: Generator[None, None, None],
    ) -> None:
        """Test successful translation"""
        # Mock auth URL
        mock_auth_url.return_value = "https://auth.url"

        # Mock response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "payload": {
                "result": {
                    "text": "eyJ0cmFuc19yZXN1bHQiOnsiaXNTdWNjZXNzIjp0cnVlLCJkc3QiOiJ0cmFuc2xhdGVkIHRleHQifX0="  # base64 encoded
                }
            }
        }
        mock_post.return_value = mock_response

        with patch.object(client, "_validate_input", return_value=(True, "")):
            success, message, result = client.translate("hello", "en", "cn")

            assert success
            assert message == "翻译成功"
            assert "original_text" in result
            assert "translated_text" in result

    @patch("plugin.aitools.service.translation.translation_client.requests.post")
    def test_translate_http_error(
        self,
        mock_post: Mock,
        client: TranslationClient,
        mock_env_vars: Generator[None, None, None],
    ) -> None:
        """Test translation with HTTP error"""
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.text = "Bad Request"
        mock_post.return_value = mock_response

        with patch.object(client, "_validate_input", return_value=(True, "")):
            with patch(
                "plugin.aitools.service.translation.translation_client.assemble_auth_url"
            ):
                success, message, result = client.translate("hello", "en", "cn")

                assert not success
                assert "API请求失败" in message
                assert "error" in result

    @patch("plugin.aitools.service.translation.translation_client.requests.post")
    def test_translate_invalid_response_format(
        self,
        mock_post: Mock,
        client: TranslationClient,
        mock_env_vars: Generator[None, None, None],
    ) -> None:
        """Test translation with invalid response format"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"invalid": "format"}
        mock_post.return_value = mock_response

        with patch.object(client, "_validate_input", return_value=(True, "")):
            with patch(
                "plugin.aitools.service.translation.translation_client.assemble_auth_url"
            ):
                success, message, result = client.translate("hello", "en", "cn")

                assert not success
                assert "API返回数据格式错误" in message

    def test_translate_validation_error(self, client: TranslationClient) -> None:
        """Test translation with validation error"""
        success, message, result = client.translate("", "en", "cn")
        assert not success
        assert "翻译文本不能为空" in message
        assert result == {}

    @patch("plugin.aitools.service.translation.translation_client.requests.post")
    def test_translate_exception(
        self,
        mock_post: Mock,
        client: TranslationClient,
        mock_env_vars: Generator[None, None, None],
    ) -> None:
        """Test translation with exception"""
        mock_post.side_effect = Exception("Connection error")

        with patch.object(client, "_validate_input", return_value=(True, "")):
            with patch(
                "plugin.aitools.service.translation.translation_client.assemble_auth_url"
            ):
                success, message, result = client.translate("hello", "en", "cn")

                assert not success
                assert "翻译过程中发生错误" in message
                assert result == {}

    def test_get_supported_languages(self, client: TranslationClient) -> None:
        """Test getting supported languages"""
        with patch(
            "plugin.aitools.service.translation.translation_client.SUPPORTED_LANGUAGES",
            {"cn": "中文", "en": "英语"},
        ):
            languages = client.get_supported_languages()
            assert languages == {"cn": "中文", "en": "英语"}

            # Test that it returns a copy
            languages["test"] = "test"
            languages2 = client.get_supported_languages()
            assert "test" not in languages2
