"""
Test cases for common/hmac_gen.py module.

This module tests HMAC signature generation functionality including:
- URL parsing
- SHA256 base64 encoding
- Authentication URL assembly
- Error handling for malformed URLs
"""

import re
from urllib.parse import parse_qs, urlparse

import pytest
from plugin.aitools.common.hmac_gen import (
    AssembleHeaderException,
    Url,
    assemble_auth_url,
    parse_url,
    sha256base64,
)


class TestSha256Base64:
    """Test cases for sha256base64 function."""

    def test_sha256base64_empty_data(self) -> None:
        """Test SHA256 encoding of empty data."""
        result = sha256base64(b"")
        # SHA256 of empty string is a known value
        assert result == "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="

    def test_sha256base64_simple_string(self) -> None:
        """Test SHA256 encoding of simple string."""
        result = sha256base64(b"hello")
        # SHA256 of "hello" is a known value
        assert result == "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ="

    def test_sha256base64_unicode_data(self) -> None:
        """Test SHA256 encoding of unicode data."""
        result = sha256base64("测试".encode("utf-8"))
        assert isinstance(result, str)
        assert len(result) > 0

    def test_sha256base64_binary_data(self) -> None:
        """Test SHA256 encoding of binary data."""
        binary_data = bytes([0x00, 0x01, 0x02, 0x03, 0xFF])
        result = sha256base64(binary_data)
        assert isinstance(result, str)
        assert len(result) > 0


class TestUrl:
    """Test cases for Url class."""

    def test_url_initialization(self) -> None:
        """Test Url class initialization."""
        url = Url("example.com", "/api/v1", "https://")
        assert url.host == "example.com"
        assert url.path == "/api/v1"
        assert url.schema == "https://"

    def test_url_empty_values(self) -> None:
        """Test Url with empty values."""
        url = Url("", "", "")
        assert url.host == ""
        assert url.path == ""
        assert url.schema == ""


class TestAssembleHeaderException:
    """Test cases for AssembleHeaderException."""

    def test_exception_initialization(self) -> None:
        """Test exception initialization with message."""
        msg = "Test error message"
        exception = AssembleHeaderException(msg)
        assert exception.message == msg

    def test_exception_empty_message(self) -> None:
        """Test exception with empty message."""
        exception = AssembleHeaderException("")
        assert exception.message == ""


class TestParseUrl:
    """Test cases for parse_url function."""

    def test_parse_url_valid_https(self) -> None:
        """Test parsing valid HTTPS URL."""
        url = "https://api.example.com/v1/test"
        result = parse_url(url)
        assert result.host == "api.example.com"
        assert result.path == "/v1/test"
        assert result.schema == "https://"

    def test_parse_url_valid_http(self) -> None:
        """Test parsing valid HTTP URL."""
        url = "http://localhost:8080/api"
        result = parse_url(url)
        assert result.host == "localhost:8080"
        assert result.path == "/api"
        assert result.schema == "http://"

    def test_parse_url_valid_wss(self) -> None:
        """Test parsing valid WSS URL."""
        url = "wss://websocket.example.com/ws"
        result = parse_url(url)
        assert result.host == "websocket.example.com"
        assert result.path == "/ws"
        assert result.schema == "wss://"

    def test_parse_url_with_port(self) -> None:
        """Test parsing URL with port number."""
        url = "https://api.example.com:443/path"
        result = parse_url(url)
        assert result.host == "api.example.com:443"
        assert result.path == "/path"
        assert result.schema == "https://"

    def test_parse_url_root_path(self) -> None:
        """Test parsing URL with root path."""
        url = "https://example.com/"
        result = parse_url(url)
        assert result.host == "example.com"
        assert result.path == "/"
        assert result.schema == "https://"

    def test_parse_url_complex_path(self) -> None:
        """Test parsing URL with complex path."""
        url = "https://api.example.com/v1/users/123/profile?param=value"
        result = parse_url(url)
        assert result.host == "api.example.com"
        assert result.path == "/v1/users/123/profile?param=value"
        assert result.schema == "https://"

    def test_parse_url_invalid_no_path(self) -> None:
        """Test parsing invalid URL without path."""
        url = "https://example.com"
        with pytest.raises(ValueError):
            parse_url(url)

    def test_parse_url_invalid_format(self) -> None:
        """Test parsing URL with invalid format."""
        with pytest.raises(ValueError):
            parse_url("invalid-url")


class TestAssembleAuthUrl:
    """Test cases for assemble_auth_url function."""

    def test_assemble_auth_url_basic(self) -> None:
        """Test basic auth URL assembly."""
        url = "https://api.example.com/v1/test"
        api_key = "test_key"
        api_secret = "test_secret"

        result = assemble_auth_url(url, "GET", api_key, api_secret)

        # Verify the base URL is preserved
        assert result.startswith(url + "?")

        # Parse the query parameters
        parsed = urlparse(result)
        params = parse_qs(parsed.query)

        # Verify required parameters exist
        assert "host" in params
        assert "date" in params
        assert "authorization" in params

        # Verify values
        assert params["host"][0] == "api.example.com"
        assert len(params["date"][0]) > 0
        assert len(params["authorization"][0]) > 0

    def test_assemble_auth_url_post_method(self) -> None:
        """Test auth URL assembly with POST method."""
        url = "https://api.example.com/v1/create"
        result = assemble_auth_url(url, "POST", "key", "secret")

        assert url in result
        assert "host=" in result
        assert "date=" in result
        assert "authorization=" in result

    def test_assemble_auth_url_empty_credentials(self) -> None:
        """Test auth URL assembly with empty credentials."""
        url = "https://api.example.com/v1/test"
        result = assemble_auth_url(url, "GET", "", "")

        # Should still generate URL with empty credentials
        assert url in result
        parsed = urlparse(result)
        params = parse_qs(parsed.query)
        assert "authorization" in params

    def test_assemble_auth_url_special_characters(self) -> None:
        """Test auth URL assembly with special characters in credentials."""
        url = "https://api.example.com/v1/test"
        api_key = "key_with_special&chars="
        api_secret = "secret_with_special@chars#"

        result = assemble_auth_url(url, "GET", api_key, api_secret)

        # Should handle special characters properly
        assert url in result
        assert "authorization=" in result

    def test_assemble_auth_url_different_methods(self) -> None:
        """Test auth URL assembly with different HTTP methods."""
        url = "https://api.example.com/v1/test"
        methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]

        for method in methods:
            result = assemble_auth_url(url, method, "key", "secret")
            assert url in result
            assert "authorization=" in result

    def test_assemble_auth_url_with_port(self) -> None:
        """Test auth URL assembly with port in URL."""
        url = "https://api.example.com:8443/v1/test"
        result = assemble_auth_url(url, "GET", "key", "secret")

        parsed = urlparse(result)
        params = parse_qs(parsed.query)
        assert params["host"][0] == "api.example.com:8443"

    def test_assemble_auth_url_wss_protocol(self) -> None:
        """Test auth URL assembly with WSS protocol."""
        url = "wss://websocket.example.com/ws"
        result = assemble_auth_url(url, "GET", "key", "secret")

        assert "wss://websocket.example.com/ws?" in result
        parsed = urlparse(result)
        params = parse_qs(parsed.query)
        assert params["host"][0] == "websocket.example.com"

    def test_assemble_auth_url_date_format(self) -> None:
        """Test that date parameter follows correct format."""
        url = "https://api.example.com/v1/test"
        result = assemble_auth_url(url, "GET", "key", "secret")

        parsed = urlparse(result)
        params = parse_qs(parsed.query)
        date_str = params["date"][0]

        # Date should follow RFC 2822 format (used by format_date_time)
        # Example: "Mon, 01 Jan 2024 12:00:00 GMT"
        date_pattern = r"^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$"
        assert re.match(date_pattern, date_str), f"Date format invalid: {date_str}"

    def test_assemble_auth_url_authorization_structure(self) -> None:
        """Test that authorization parameter has correct structure."""
        url = "https://api.example.com/v1/test"
        api_key = "test_key"
        result = assemble_auth_url(url, "GET", api_key, "secret")

        parsed = urlparse(result)
        params = parse_qs(parsed.query)
        auth_b64 = params["authorization"][0]

        # Authorization should be base64 encoded
        import base64

        try:
            auth_decoded = base64.b64decode(auth_b64).decode("utf-8")
            # Should contain expected components
            assert f'api_key="{api_key}"' in auth_decoded
            assert 'algorithm="hmac-sha256"' in auth_decoded
            assert 'headers="host date request-line"' in auth_decoded
            assert "signature=" in auth_decoded
        except Exception as e:
            pytest.fail(f"Authorization parameter is not valid base64: {e}")
