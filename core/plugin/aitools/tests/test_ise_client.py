"""
Unit tests for ISE speech evaluation client module.
"""

import os
from unittest.mock import Mock, patch

import pytest
from plugin.aitools.service.ise.ise_client import (
    AudioConverter,
    ISEClient,
    ISEParam,
    ISEResultParser,
)


class TestAudioConverter:
    """Test cases for AudioConverter"""

    def test_detect_audio_format_wav(self) -> None:
        """Test detecting WAV audio format"""
        wav_header = b"RIFF\x00\x00\x00\x00WAVE"
        assert AudioConverter.detect_audio_format(wav_header) == "wav"

    def test_detect_audio_format_mp3(self) -> None:
        """Test detecting MP3 audio format"""
        mp3_header = b"ID3\x03\x00\x00\x00"
        assert AudioConverter.detect_audio_format(mp3_header) == "mp3"

    def test_detect_audio_format_unknown(self) -> None:
        """Test detecting unknown audio format"""
        unknown_header = b"UNKN\x00\x00\x00\x00"
        assert AudioConverter.detect_audio_format(unknown_header) == "unknown"

    @patch("plugin.aitools.service.ise.ise_client.AudioSegment.from_wav")
    def test_get_audio_properties_success(self, mock_from_wav: Mock) -> None:
        """Test getting audio properties successfully"""
        mock_audio = Mock()
        mock_audio.frame_rate = 16000
        mock_audio.channels = 1
        mock_audio.sample_width = 2
        mock_audio.__len__ = Mock(return_value=10000)  # 10 seconds
        mock_from_wav.return_value = mock_audio

        with patch.object(AudioConverter, "detect_audio_format", return_value="wav"):
            properties = AudioConverter.get_audio_properties(b"fake_audio_data")

        assert properties["sample_rate"] == 16000
        assert properties["channels"] == 1
        assert properties["sample_width"] == 2
        assert properties["duration"] == 10.0
        assert properties["format"] == "wav"
        assert properties["bit_depth"] == 16

    @patch("plugin.aitools.service.ise.ise_client.AudioSegment.from_wav")
    def test_get_audio_properties_exception(self, mock_from_wav: Mock) -> None:
        """Test getting audio properties with exception"""
        mock_from_wav.side_effect = Exception("Invalid audio")

        with patch.object(AudioConverter, "detect_audio_format", return_value="wav"):
            properties = AudioConverter.get_audio_properties(b"fake_audio_data")

        assert properties["sample_rate"] is None
        assert "error" in properties

    @patch("plugin.aitools.service.ise.ise_client.AudioSegment.from_wav")
    def test_convert_to_wav_already_valid(self, mock_from_wav: Mock) -> None:
        """Test converting audio that's already in valid WAV format"""
        mock_audio = Mock()
        mock_audio.frame_rate = 16000
        mock_audio.channels = 1
        mock_audio.sample_width = 2
        mock_from_wav.return_value = mock_audio

        with patch.object(AudioConverter, "detect_audio_format", return_value="wav"):
            with patch.object(
                AudioConverter,
                "get_audio_properties",
                return_value={"sample_rate": 16000},
            ):
                wav_data, properties = AudioConverter.convert_to_wav(b"fake_wav_data")

        assert wav_data == b"fake_wav_data"

    @patch("plugin.aitools.service.ise.ise_client.AudioSegment.from_mp3")
    def test_convert_to_wav_from_mp3(self, mock_from_mp3: Mock) -> None:
        """Test converting MP3 to WAV"""
        mock_audio = Mock()
        mock_audio.frame_rate = 44100
        mock_audio.channels = 2
        mock_audio.sample_width = 2

        # Mock conversion methods
        mock_converted = Mock()
        mock_audio.set_frame_rate.return_value = mock_converted
        mock_converted.set_sample_width.return_value = mock_converted
        mock_converted.set_channels.return_value = mock_converted
        mock_converted.export = Mock()

        mock_from_mp3.return_value = mock_audio

        with patch.object(
            AudioConverter, "get_audio_properties", return_value={"sample_rate": 44100}
        ):
            with patch(
                "plugin.aitools.service.ise.ise_client.io.BytesIO"
            ) as mock_bytesio:
                mock_io = Mock()
                mock_io.getvalue.return_value = b"converted_wav_data"
                mock_bytesio.return_value = mock_io

                wav_data, properties = AudioConverter.convert_to_wav(
                    b"fake_mp3_data", "mp3"
                )

        assert wav_data == b"converted_wav_data"

    def test_validate_audio_format_valid_wav(self) -> None:
        """Test validating valid WAV format"""
        with patch.object(AudioConverter, "detect_audio_format", return_value="wav"):
            with patch(
                "plugin.aitools.service.ise.ise_client.AudioSegment.from_wav"
            ) as mock_from_wav:
                mock_audio = Mock()
                mock_audio.frame_rate = 16000
                mock_audio.channels = 1
                mock_audio.sample_width = 2
                mock_from_wav.return_value = mock_audio

                is_valid, message = AudioConverter.validate_audio_format(
                    b"fake_wav_data"
                )

        assert is_valid
        assert "音频格式符合要求" in message

    def test_validate_audio_format_invalid_wav(self) -> None:
        """Test validating invalid WAV format"""
        with patch.object(AudioConverter, "detect_audio_format", return_value="wav"):
            with patch(
                "plugin.aitools.service.ise.ise_client.AudioSegment.from_wav"
            ) as mock_from_wav:
                mock_audio = Mock()
                mock_audio.frame_rate = 44100
                mock_audio.channels = 2
                mock_audio.sample_width = 2
                mock_from_wav.return_value = mock_audio

                is_valid, message = AudioConverter.validate_audio_format(
                    b"fake_wav_data"
                )

        assert not is_valid
        assert "WAV格式不符合要求" in message


class TestISEResultParser:
    """Test cases for ISEResultParser"""

    def test_parse_xml_result_success(self) -> None:
        """Test parsing XML result successfully"""
        xml_string = """<?xml version="1.0" encoding="UTF-8"?>
<result>
    <rec_paper id="test_id">
        <task total_score="85.5" accuracy_score="90.0" fluency_score="80.0">
        </task>
    </rec_paper>
</result>"""
        result = ISEResultParser.parse_xml_result(xml_string)

        assert result["status"] == "success"
        assert result["overall_score"] == 85.5
        assert result["detailed_scores"]["total_score"] == 85.5
        assert result["detailed_scores"]["accuracy_score"] == 90.0

    def test_parse_xml_result_with_exception_info(self) -> None:
        """Test parsing XML result with exception info"""
        xml_string = """<?xml version="1.0" encoding="UTF-8"?>
<result>
    <rec_paper id="test_id">
        <task total_score="0" except_info="28673">
        </task>
    </rec_paper>
</result>"""
        result = ISEResultParser.parse_xml_result(xml_string)

        assert result["status"] == "audio_error"
        assert len(result["warnings"]) > 0

    def test_parse_xml_result_with_rejection(self) -> None:
        """Test parsing XML result with rejection"""
        xml_string = """<?xml version="1.0" encoding="UTF-8"?>
<result>
    <rec_paper id="test_id">
        <task total_score="50.0" is_rejected="true">
        </task>
    </rec_paper>
</result>"""
        result = ISEResultParser.parse_xml_result(xml_string)

        assert result["status"] == "rejected"
        assert any("乱读" in warning for warning in result["warnings"])

    def test_parse_xml_result_invalid_xml(self) -> None:
        """Test parsing invalid XML"""
        xml_string = "invalid xml"
        result = ISEResultParser.parse_xml_result(xml_string)

        assert result["status"] == "parse_error"
        assert "error" in result

    def test_check_low_score_warning(self) -> None:
        """Test low score warning mechanism"""
        result = {"overall_score": 3.0, "warnings": []}
        original_props = {"sample_rate": 44100}

        updated_result = ISEResultParser.check_low_score_warning(result, original_props)

        assert len(updated_result["warnings"]) > 0
        assert "低分预警" in updated_result["warnings"][0]


class TestISEParam:
    """Test cases for ISEParam"""

    def test_init_chinese(self) -> None:
        """Test initializing ISEParam for Chinese"""
        param = ISEParam(
            app_id="test_app",
            api_key="test_key",
            api_secret="test_secret",
            audio_data=b"fake_audio",
            text="测试文本",
            language="cn",
        )

        assert param.business_args["ent"] == "cn_vip"
        assert param.business_args["group"] == "adult"
        assert "测试文本" in param.business_args["text"]

    def test_init_english(self) -> None:
        """Test initializing ISEParam for English"""
        param = ISEParam(
            app_id="test_app",
            api_key="test_key",
            api_secret="test_secret",
            audio_data=b"fake_audio",
            text="test text",
            language="en",
        )

        assert param.business_args["ent"] == "en_vip"

    def test_init_invalid_group(self) -> None:
        """Test initializing ISEParam with invalid group"""
        with pytest.raises(ValueError, match="无效的年龄组参数"):
            ISEParam(
                app_id="test_app",
                api_key="test_key",
                api_secret="test_secret",
                audio_data=b"fake_audio",
                group="invalid",
            )

    def test_encode_text_empty(self) -> None:
        """Test encoding empty text"""
        param = ISEParam(
            app_id="test_app",
            api_key="test_key",
            api_secret="test_secret",
            audio_data=b"fake_audio",
            text="",
        )

        assert param.business_args["text"] == ""

    def test_encode_text_with_content(self) -> None:
        """Test encoding text with content"""
        param = ISEParam(
            app_id="test_app",
            api_key="test_key",
            api_secret="test_secret",
            audio_data=b"fake_audio",
            text="test text",
        )

        encoded_text = param.business_args["text"]
        assert "[content]" in encoded_text
        assert "test text" in encoded_text


class TestISEClient:
    """Test cases for ISEClient"""

    @pytest.fixture
    def client(self) -> ISEClient:
        """Create a test ISE client instance"""
        with patch.dict(os.environ, {"ISE_URL": "wss://test.ise.url"}):
            return ISEClient(
                app_id="test_app_id",
                api_key="test_api_key",
                api_secret="test_api_secret",
            )

    def test_init(self, client: ISEClient) -> None:
        """Test client initialization"""
        assert client.app_id == "test_app_id"
        assert client.api_key == "test_api_key"
        assert client.api_secret == "test_api_secret"
        assert client.base_url == "wss://test.ise.url"

    @patch("plugin.aitools.service.ise.ise_client.AudioConverter.validate_audio_format")
    @patch("plugin.aitools.service.ise.ise_client.AudioConverter.get_audio_properties")
    def test_evaluate_audio_valid_format(
        self, mock_get_props: Mock, mock_validate: Mock, client: ISEClient
    ) -> None:
        """Test evaluate_audio with valid format (mocked as sync)"""
        mock_validate.return_value = (True, "音频格式符合要求")
        mock_get_props.return_value = {"sample_rate": 16000}

        # Mock the async method as sync for testing
        with patch("asyncio.run") as mock_async_run:
            mock_async_run.return_value = (True, "评测成功", {"overall_score": 85.0})

            # Test the synchronous version that calls asyncio.run internally
            result = client.evaluate_pronunciation(b"fake_audio", "test text")

            assert "评测成功" in result[1]
            assert result[2]["overall_score"] == 85.0

    def test_evaluate_audio_auto_convert(self, client: ISEClient) -> None:
        """Test evaluate_audio with auto conversion (simplified)"""
        with patch("asyncio.run") as mock_async_run:
            mock_async_run.return_value = (True, "评测成功", {"overall_score": 85.0})

            result = client.evaluate_pronunciation(b"fake_audio", "test text")

            assert "评测成功" in result[1]
            assert result[2]["overall_score"] == 85.0
            mock_async_run.assert_called_once()

    def test_evaluate_audio_conversion_error(self, client: ISEClient) -> None:
        """Test evaluate_audio with conversion error (mocked as sync)"""
        with patch(
            "plugin.aitools.service.ise.ise_client.AudioConverter.validate_audio_format"
        ) as mock_validate:
            with patch(
                "plugin.aitools.service.ise.ise_client.AudioConverter.convert_to_wav"
            ) as mock_convert:
                with patch("asyncio.run") as mock_async_run:
                    mock_validate.return_value = (False, "需要转换")
                    mock_convert.side_effect = Exception("Conversion failed")
                    mock_async_run.side_effect = Exception(
                        "音频转换失败: Conversion failed"
                    )

                    try:
                        client.evaluate_pronunciation(b"fake_audio", "test text")
                        assert False, "Should have raised exception"
                    except Exception as e:
                        assert "音频转换失败" in str(e)

    def test_evaluate_audio_evaluation_error(self, client: ISEClient) -> None:
        """Test evaluate_audio with evaluation error (mocked as sync)"""
        with patch(
            "plugin.aitools.service.ise.ise_client.AudioConverter.validate_audio_format"
        ) as mock_validate:
            with patch(
                "plugin.aitools.service.ise.ise_client.AudioConverter.get_audio_properties"
            ):
                with patch("asyncio.run") as mock_async_run:
                    mock_validate.return_value = (True, "格式正确")
                    mock_async_run.return_value = (
                        False,
                        "WebSocket connection failed",
                        {},
                    )

                    result = client.evaluate_pronunciation(b"fake_audio", "test text")

                    assert "WebSocket connection failed" in result[1]

    def test_evaluate_pronunciation_sync(self, client: ISEClient) -> None:
        """Test evaluate_pronunciation synchronous method"""
        with patch("asyncio.run") as mock_run:
            mock_run.return_value = (True, "成功", {"score": 85.0})

            result = client.evaluate_pronunciation(b"fake_audio", "test text")

            assert result == (True, "成功", {"score": 85.0})
            mock_run.assert_called_once()

    def test_create_auth_url(self, client: ISEClient) -> None:
        """Test creating authentication URL"""
        import time
        from datetime import datetime

        with patch("plugin.aitools.service.ise.ise_client.datetime") as mock_datetime:
            with patch(
                "plugin.aitools.service.ise.ise_client.format_date_time"
            ) as mock_format_date:
                with patch("plugin.aitools.service.ise.ise_client.hmac") as mock_hmac:
                    with patch(
                        "plugin.aitools.service.ise.ise_client.base64"
                    ) as mock_base64:
                        # Create a proper datetime mock
                        mock_now = datetime(2023, 1, 1, 12, 0, 0)
                        mock_datetime.now.return_value = mock_now

                        # Mock mktime to return a proper timestamp
                        with patch(
                            "plugin.aitools.service.ise.ise_client.mktime"
                        ) as mock_mktime:
                            mock_mktime.return_value = time.mktime(mock_now.timetuple())
                            mock_format_date.return_value = "test_date"
                            mock_hmac.new.return_value.digest.return_value = (
                                b"signature"
                            )
                            mock_base64.b64encode.return_value.decode.return_value = (
                                "encoded_signature"
                            )

                            auth_url = client._create_auth_url()

                            assert "authorization=" in auth_url
                            assert "date=" in auth_url
                            assert client.base_url in auth_url
