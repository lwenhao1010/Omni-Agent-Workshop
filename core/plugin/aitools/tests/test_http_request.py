"""Unit tests for HttpRequest module."""

import os
import sys
from unittest.mock import Mock, patch

import pytest
import requests
from plugin.aitools.common.http_request import HttpRequest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestHttpRequest:
    """Test cases for HttpRequest class."""

    def setup_method(self) -> None:
        """Setup test environment before each test."""
        self.config = {
            "method": "GET",
            "url": "https://api.example.com/test",
            "headers": {"Content-Type": "application/json"},
            "params": {"key": "value"},
            "payload": {"data": "test"},
            "timeout": 30,
        }

    def test_init_with_complete_config(self) -> None:
        """Test HttpRequest initialization with complete config."""
        http_req = HttpRequest(self.config)
        assert http_req.config == self.config

    def test_init_with_empty_config(self) -> None:
        """Test HttpRequest initialization with empty config."""
        http_req = HttpRequest({})
        assert http_req.config == {}

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_get_request(self, mock_request: Mock) -> None:
        """Test sending GET request with default values."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"success": True}
        mock_request.return_value = mock_response

        config = {"url": "https://api.example.com/test"}
        http_req = HttpRequest(config)
        response = http_req.send()

        mock_request.assert_called_once_with(
            method="GET",
            url="https://api.example.com/test",
            headers={},
            params={},
            json={},
            timeout=10,
        )
        assert response == mock_response

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_post_request(self, mock_request: Mock) -> None:
        """Test sending POST request with payload."""
        mock_response = Mock()
        mock_response.status_code = 201
        mock_request.return_value = mock_response

        config = {
            "method": "POST",
            "url": "https://api.example.com/create",
            "payload": {"name": "test", "value": 123},
        }
        http_req = HttpRequest(config)
        response = http_req.send()

        mock_request.assert_called_once_with(
            method="POST",
            url="https://api.example.com/create",
            headers={},
            params={},
            json={"name": "test", "value": 123},
            timeout=10,
        )
        assert response == mock_response

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_with_custom_headers(self, mock_request: Mock) -> None:
        """Test sending request with custom headers."""
        mock_response = Mock()
        mock_request.return_value = mock_response

        config = {
            "url": "https://api.example.com/test",
            "headers": {"Authorization": "Bearer token123", "User-Agent": "TestApp"},
        }
        http_req = HttpRequest(config)
        http_req.send()

        mock_request.assert_called_once_with(
            method="GET",
            url="https://api.example.com/test",
            headers={"Authorization": "Bearer token123", "User-Agent": "TestApp"},
            params={},
            json={},
            timeout=10,
        )

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_with_params(self, mock_request: Mock) -> None:
        """Test sending request with URL parameters."""
        mock_response = Mock()
        mock_request.return_value = mock_response

        config = {
            "url": "https://api.example.com/search",
            "params": {"q": "python", "limit": 10, "offset": 0},
        }
        http_req = HttpRequest(config)
        http_req.send()

        mock_request.assert_called_once_with(
            method="GET",
            url="https://api.example.com/search",
            headers={},
            params={"q": "python", "limit": 10, "offset": 0},
            json={},
            timeout=10,
        )

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_with_custom_timeout(self, mock_request: Mock) -> None:
        """Test sending request with custom timeout."""
        mock_response = Mock()
        mock_request.return_value = mock_response

        config = {"url": "https://api.example.com/slow", "timeout": 60}
        http_req = HttpRequest(config)
        http_req.send()

        mock_request.assert_called_once_with(
            method="GET",
            url="https://api.example.com/slow",
            headers={},
            params={},
            json={},
            timeout=60,
        )

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_method_case_insensitive(self, mock_request: Mock) -> None:
        """Test that HTTP method is converted to uppercase."""
        mock_response = Mock()
        mock_request.return_value = mock_response

        config = {"method": "post", "url": "https://api.example.com/test"}
        http_req = HttpRequest(config)
        http_req.send()

        mock_request.assert_called_once_with(
            method="POST",
            url="https://api.example.com/test",
            headers={},
            params={},
            json={},
            timeout=10,
        )

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_with_all_parameters(self, mock_request: Mock) -> None:
        """Test sending request with all configuration parameters."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_request.return_value = mock_response

        http_req = HttpRequest(self.config)
        response = http_req.send()

        mock_request.assert_called_once_with(
            method="GET",
            url="https://api.example.com/test",
            headers={"Content-Type": "application/json"},
            params={"key": "value"},
            json={"data": "test"},
            timeout=30,
        )
        assert response == mock_response

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_request_exception(self, mock_request: Mock) -> None:
        """Test handling of request exceptions."""
        mock_request.side_effect = requests.exceptions.ConnectionError(
            "Connection failed"
        )

        config = {"url": "https://api.example.com/test"}
        http_req = HttpRequest(config)

        with pytest.raises(requests.exceptions.ConnectionError):
            http_req.send()

    @patch("plugin.aitools.common.http_request.requests.request")
    def test_send_timeout_exception(self, mock_request: Mock) -> None:
        """Test handling of timeout exceptions."""
        mock_request.side_effect = requests.exceptions.Timeout("Request timed out")

        config = {"url": "https://api.example.com/test", "timeout": 1}
        http_req = HttpRequest(config)

        with pytest.raises(requests.exceptions.Timeout):
            http_req.send()

    def test_missing_url_in_config(self) -> None:
        """Test behavior when URL is missing from config."""
        config = {"method": "GET"}
        http_req = HttpRequest(config)

        with patch(
            "plugin.aitools.common.http_request.requests.request"
        ) as mock_request:
            mock_request.side_effect = requests.exceptions.MissingSchema("Invalid URL")

            with pytest.raises(requests.exceptions.MissingSchema):
                http_req.send()
