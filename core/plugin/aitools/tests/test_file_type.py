"""Unit tests for file type detection module."""

import os
import sys

import pytest

from service.ase_sdk.util.file_type import get_file_type

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestGetFileType:
    """Test cases for get_file_type function."""

    def test_png_file_detection(self) -> None:
        """Test PNG file type detection."""
        png_header = b"\x89PNG\r\n\x1a\n"
        png_data = png_header + b"fake_png_data"

        result = get_file_type(png_data)
        assert result == "PNG"

    def test_jpg_file_detection(self) -> None:
        """Test JPG file type detection."""
        jpg_header = b"\xff\xd8\xff"
        jpg_data = jpg_header + b"fake_jpg_data"

        result = get_file_type(jpg_data)
        assert result == "JPG"

    def test_bmp_file_detection(self) -> None:
        """Test BMP file type detection."""
        bmp_header = b"BM"
        bmp_data = bmp_header + b"fake_bmp_data"

        result = get_file_type(bmp_data)
        assert result == "BMP"

    def test_webp_file_detection(self) -> None:
        """Test WebP file type detection."""
        webp_header = b"RIFF"
        webp_data = webp_header + b"somedata" + b"WEBP" + b"more_data"

        result = get_file_type(webp_data)
        assert result == "WebP"

    def test_webp_without_webp_marker(self) -> None:
        """Test that RIFF without WEBP marker is not detected as WebP."""
        riff_data = b"RIFF" + b"no_webp_marker_here"

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(riff_data)

    def test_tiff_little_endian_detection(self) -> None:
        """Test TIFF file type detection (little endian)."""
        tiff_header = b"II*\x00"
        tiff_data = tiff_header + b"fake_tiff_data"

        result = get_file_type(tiff_data)
        assert result == "TIFF"

    def test_tiff_big_endian_detection(self) -> None:
        """Test TIFF file type detection (big endian)."""
        tiff_header = b"MM\x00*"
        tiff_data = tiff_header + b"fake_tiff_data"

        result = get_file_type(tiff_data)
        assert result == "TIFF"

    def test_unsupported_file_type(self) -> None:
        """Test unsupported file type raises ValueError."""
        unknown_data = b"UNKNOWN_FILE_FORMAT"

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(unknown_data)

    def test_empty_file_data(self) -> None:
        """Test empty file data raises ValueError."""
        empty_data = b""

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(empty_data)

    def test_partial_header_data(self) -> None:
        """Test partial header data."""
        # Test with data that's too short to match any format
        short_data = b"P"  # Not enough for PNG header

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(short_data)

    def test_false_positive_prevention(self) -> None:
        """Test that similar but different headers don't match."""
        # Similar to PNG but missing critical bytes
        fake_png = b"\x89PN"  # Missing 'G' and other bytes

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(fake_png)

        # Similar to JPG but missing bytes
        fake_jpg = b"\xff\xd8"  # Missing third byte

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(fake_jpg)

    def test_case_sensitivity(self) -> None:
        """Test that file type detection is case sensitive for binary data."""
        # WebP detection should be case sensitive
        webp_wrong_case = (
            b"RIFF" + b"somedata" + b"webp" + b"more_data"
        )  # lowercase 'webp'

        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(webp_wrong_case)

    def test_multiple_format_indicators(self) -> None:
        """Test file with multiple format indicators."""
        # File with both PNG and JPG indicators (should match PNG first)
        mixed_data = b"\x89PNG\r\n\x1a\n" + b"some_data" + b"\xff\xd8\xff"

        result = get_file_type(mixed_data)
        assert result == "PNG"  # Should match PNG since it's checked first

    def test_webp_marker_position(self) -> None:
        """Test WebP marker can be anywhere in the file after RIFF."""
        # WebP marker at different positions
        webp_early = b"RIFF" + b"WEBP" + b"more_data"
        result = get_file_type(webp_early)
        assert result == "WebP"

        webp_late = b"RIFF" + b"a" * 100 + b"WEBP" + b"more_data"
        result = get_file_type(webp_late)
        assert result == "WebP"

    def test_tiff_header_variations(self) -> None:
        """Test different TIFF header variations."""
        # Test exact TIFF headers
        tiff_ii = b"II*\x00exactly_this"
        result = get_file_type(tiff_ii)
        assert result == "TIFF"

        tiff_mm = b"MM\x00*exactly_this"
        result = get_file_type(tiff_mm)
        assert result == "TIFF"

        # Test that similar but incorrect headers don't match
        fake_tiff1 = b"II*"  # Missing null byte
        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(fake_tiff1)

        fake_tiff2 = b"MM\x00"  # Missing asterisk
        with pytest.raises(ValueError, match="Unsupported file type"):
            get_file_type(fake_tiff2)

    def test_real_world_file_headers(self) -> None:
        """Test with realistic file header examples."""
        # More complete PNG header
        png_complete = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
        result = get_file_type(png_complete)
        assert result == "PNG"

        # More complete JPG header with JFIF
        jpg_jfif = b"\xff\xd8\xff\xe0\x00\x10JFIF"
        result = get_file_type(jpg_jfif)
        assert result == "JPG"

        # Complete BMP header start
        bmp_complete = b"BM" + b"\x36\x84\x03\x00"  # BMP with file size info
        result = get_file_type(bmp_complete)
        assert result == "BMP"

    def test_edge_case_file_sizes(self) -> None:
        """Test edge cases with different file sizes."""
        # Minimum viable headers
        min_png = b"\x89PNG"
        result = get_file_type(min_png)
        assert result == "PNG"

        min_jpg = b"\xff\xd8\xff"
        result = get_file_type(min_jpg)
        assert result == "JPG"

        min_bmp = b"BM"
        result = get_file_type(min_bmp)
        assert result == "BMP"

        min_tiff_ii = b"II*\x00"
        result = get_file_type(min_tiff_ii)
        assert result == "TIFF"

        min_tiff_mm = b"MM\x00*"
        result = get_file_type(min_tiff_mm)
        assert result == "TIFF"

        # For WebP, need both RIFF and WEBP
        min_webp = b"RIFFWEBP"
        result = get_file_type(min_webp)
        assert result == "WebP"
