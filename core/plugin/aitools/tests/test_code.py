"""Unit tests for error code definition module."""

import os
import sys

from const.err_code.code import CodeEnum

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestCodeEnum:
    """Test cases for CodeEnum class."""

    def test_code_enum_has_required_attributes(self) -> None:
        """Test that CodeEnum entries have code and msg properties."""
        for code_enum in CodeEnum:
            assert hasattr(code_enum, "code")
            assert hasattr(code_enum, "msg")
            assert isinstance(code_enum.code, int)
            assert isinstance(code_enum.msg, str)

    def test_ocr_error_codes(self) -> None:
        """Test OCR-related error codes."""
        assert CodeEnum.OCR_FILE_HANDLING_ERROR.code == 45000
        assert CodeEnum.OCR_FILE_HANDLING_ERROR.msg == "OCR文件处理失败"

        assert CodeEnum.OCR_REQUESTURL_ERROR.code == 45200
        assert CodeEnum.OCR_REQUESTURL_ERROR.msg == "请求下载链接失败"

        assert CodeEnum.OCR_FILE_TYPE_ERROR.code == 45201
        assert CodeEnum.OCR_FILE_TYPE_ERROR.msg == "不支持的文档格式"

        assert CodeEnum.OCR_FILE_ERROR.code == 45202
        assert CodeEnum.OCR_FILE_ERROR.msg == "处理文档失败"

        assert CodeEnum.OCR_UNKNOWN_FILE_ERROR.code == 45203
        assert CodeEnum.OCR_UNKNOWN_FILE_ERROR.msg == "未知的文件类型"

    def test_qwen_vl_error_codes(self) -> None:
        """Test QWEN VL-related error codes."""
        assert CodeEnum.QWEN_VL_72B_INSTRUCT_ERROR.code == 45050
        assert CodeEnum.QWEN_VL_72B_INSTRUCT_ERROR.msg == "QWEN_VL_72B_INSTRUCT处理失败"

    def test_image_generate_error_codes(self) -> None:
        """Test image generation error codes."""
        assert CodeEnum.IMAGE_GENERATE_ERROR.code == 45100
        assert CodeEnum.IMAGE_GENERATE_ERROR.msg == "图片生成失败"

        assert CodeEnum.IMAGE_STORAGE_ERROR.code == 45101
        assert CodeEnum.IMAGE_STORAGE_ERROR.msg == "图片存储失败"

        assert CodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.code == 45103
        assert CodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.msg == "用户的消息格式有错误"

        assert CodeEnum.IMAGE_GENERATE_SCHEMA_ERROR.code == 45104
        assert CodeEnum.IMAGE_GENERATE_SCHEMA_ERROR.msg == "用户数据的schema错误"

        assert CodeEnum.IMAGE_GENERATE_PARAMS_ERROR.code == 45105
        assert CodeEnum.IMAGE_GENERATE_PARAMS_ERROR.msg == "用户参数值有错误"

        assert CodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR.code == 45106
        assert CodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR.msg == "服务容量不足"

        assert CodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR.code == 45107
        assert CodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR.msg == "输入审核不通过"

        assert CodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR.code == 45108
        assert (
            CodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR.msg
            == "模型生产的图片涉及敏感信息，审核不通过"
        )

        assert CodeEnum.IMAGE_GENERATE_IMAGE_TIMEOUT_ERROR.code == 45109
        assert CodeEnum.IMAGE_GENERATE_IMAGE_TIMEOUT_ERROR.msg == "文生图超时"

    def test_textin_ocr_error_codes(self) -> None:
        """Test TEXTIN OCR error codes."""
        assert CodeEnum.TEXTIN_OCR_REQUESTURL_ERROR.code == 45150
        assert (
            CodeEnum.TEXTIN_OCR_REQUESTURL_ERROR.msg == "TEXTIN_OCR_RequestURL处理失败"
        )

        assert CodeEnum.TEXTIN_OCR_ERROR.code == 45151
        assert CodeEnum.TEXTIN_OCR_ERROR.msg == "TEXTIN_OCR_Request处理OCR识别失败"

        assert CodeEnum.TEXTIN_OCR_ENTITY_EXTRACTION_ERROR.code == 45152
        assert (
            CodeEnum.TEXTIN_OCR_ENTITY_EXTRACTION_ERROR.msg
            == "TEXTIN_OCR_ENTITY_EXTRACTION 处理OCR识别失败"
        )

        assert CodeEnum.TEXTIN_OCR_ENTITY_EXTRACTION_PARAMS_ERROR.code == 45153
        assert (
            CodeEnum.TEXTIN_OCR_ENTITY_EXTRACTION_PARAMS_ERROR.msg
            == "TEXTIN_OCR_ENTITY_EXTRACTION 用户参数值有错误"
        )

        assert CodeEnum.TEXTIN_OCR_UNSUPPORTED_FILE_TYPE_ERROR.code == 45154
        assert (
            CodeEnum.TEXTIN_OCR_UNSUPPORTED_FILE_TYPE_ERROR.msg
            == "传入文件类型错误，支持pdf和图片文件"
        )

        assert CodeEnum.TEXTIN_OCR_INSUFFICIENT_BALANCE_ERROR.code == 45155
        assert (
            CodeEnum.TEXTIN_OCR_INSUFFICIENT_BALANCE_ERROR.msg
            == "合合接口余额不足，请充值后使用"
        )

    def test_tts_and_voice_error_codes(self) -> None:
        """Test TTS and voice-related error codes."""
        assert CodeEnum.OSS_STORAGE_ERROR.code == 45160
        assert CodeEnum.OSS_STORAGE_ERROR.msg == "OSS存储失败"

        assert CodeEnum.TEXT_RESULT_NULL_ERROR.code == 46000
        assert CodeEnum.TEXT_RESULT_NULL_ERROR.msg == "text字段不能为空"

        assert CodeEnum.VOICE_GENERATE_ERROR.code == 46001
        assert CodeEnum.VOICE_GENERATE_ERROR.msg == "语音合成失败"

        assert CodeEnum.TRAIN_ERROR.code == 46002
        assert CodeEnum.TRAIN_ERROR.msg == "一句话复刻API训练失败"

        assert CodeEnum.AUDIO_URLS_ERROR.code == 46003
        assert (
            CodeEnum.AUDIO_URLS_ERROR.msg == "用户上传的音频识别失败,请检查录音文件URL"
        )

        assert CodeEnum.UNAUTHORIZED_ERROR.code == 46004
        assert (
            CodeEnum.UNAUTHORIZED_ERROR.msg
            == "鉴权失败,请联系系统人员检查appid授权信息"
        )

        assert CodeEnum.ARXIV_SEARCH_ERROR.code == 46005
        assert CodeEnum.ARXIV_SEARCH_ERROR.msg == "论文搜索失败"

        assert CodeEnum.WEB_SEARCH_ERROR.code == 46006
        assert CodeEnum.WEB_SEARCH_ERROR.msg == "博查websearch搜索失败"

    def test_internal_error_code(self) -> None:
        """Test internal error code."""
        assert CodeEnum.INTERNAL_ERROR.code == 46020
        assert CodeEnum.INTERNAL_ERROR.msg == "服务内部报错"

    def test_excel_error_codes(self) -> None:
        """Test Excel-related error codes."""
        assert CodeEnum.EXCEL_READ_ERROR.code == 46100
        assert CodeEnum.EXCEL_READ_ERROR.msg == "excel读取失败"

        assert CodeEnum.EXCEL_WRITE_INVALID_CONTENT.code == 46101
        assert CodeEnum.EXCEL_WRITE_INVALID_CONTENT.msg == "excel写入数据不合法"

        assert CodeEnum.EXCEL_WRITE_ERROR.code == 46102
        assert CodeEnum.EXCEL_WRITE_ERROR.msg == "excel写入失败"

    def test_echart_error_codes(self) -> None:
        """Test EChart-related error codes."""
        assert CodeEnum.ECHART_GENERATE_ERROR.code == 46200
        assert CodeEnum.ECHART_GENERATE_ERROR.msg == "echart生成失败"

        assert CodeEnum.ECHART_PARAMS_ERROR.code == 46201
        assert CodeEnum.ECHART_PARAMS_ERROR.msg == "echart参数错误"

        assert CodeEnum.ECHART_STORAGE_ERROR.code == 46203
        assert CodeEnum.ECHART_STORAGE_ERROR.msg == "echart存储失败"

        assert CodeEnum.ECHART_LINE_GENERATE_ERROR.code == 46204
        assert CodeEnum.ECHART_LINE_GENERATE_ERROR.msg == "echart折线图生成失败"

        assert CodeEnum.ECHART_SCATTER_GENERATE_ERROR.code == 46205
        assert CodeEnum.ECHART_SCATTER_GENERATE_ERROR.msg == "echart散点图生成失败"

        assert CodeEnum.ECHART_BAR_GENERATE_ERROR.code == 46206
        assert CodeEnum.ECHART_BAR_GENERATE_ERROR.msg == "echart柱状图生成失败"

        assert CodeEnum.ECHART_PIE_GENERATE_ERROR.code == 46207
        assert CodeEnum.ECHART_PIE_GENERATE_ERROR.msg == "echart饼图生成失败"

    def test_database_error_codes(self) -> None:
        """Test database-related error codes."""
        assert CodeEnum.DATABASE_UNSUPPORTED_ERROR.code == 46300
        assert CodeEnum.DATABASE_UNSUPPORTED_ERROR.msg == "不支持的数据库类型"

        assert CodeEnum.DATABASE_UNKNOW_PORT_ERROR.code == 46301
        assert CodeEnum.DATABASE_UNKNOW_PORT_ERROR.msg == "未指定数据库端口"

        assert CodeEnum.DATABASE_CONNECT_ERROR.code == 46302
        assert CodeEnum.DATABASE_CONNECT_ERROR.msg == "数据库连接失败"

        assert CodeEnum.DATABASE_SQL_STATEMENT_ERROR.code == 46303
        assert CodeEnum.DATABASE_SQL_STATEMENT_ERROR.msg == "SQL语句不合法"

        assert CodeEnum.DATABASE_SQL_EXECUTE_ERROR.code == 46304
        assert CodeEnum.DATABASE_SQL_EXECUTE_ERROR.msg == "SQL执行失败"

    def test_panshi_error_codes(self) -> None:
        """Test Panshi-related error codes."""
        assert CodeEnum.PANSHI_EXCEL_ERROR.code == 46400
        assert CodeEnum.PANSHI_EXCEL_ERROR.msg == "磐石excel调用失败"

        assert CodeEnum.PANSHI_API_REQUEST_ERROR.code == 46401
        assert CodeEnum.PANSHI_API_REQUEST_ERROR.msg == "磐石API调用请求失败"

        assert CodeEnum.PANSHI_API_RESPONSE_ERROR.code == 46402
        assert CodeEnum.PANSHI_API_RESPONSE_ERROR.msg == "磐石API调用返回不是xlsx"

        assert CodeEnum.PANSHI_OSS_FILE_STORAGE_ERROR.code == 46403
        assert CodeEnum.PANSHI_OSS_FILE_STORAGE_ERROR.msg == "磐石文件上传OSS失败"

        assert CodeEnum.PANSHI_AUTH_ERROR.code == 46404
        assert CodeEnum.PANSHI_AUTH_ERROR.msg == "磐石获取授权令牌失败"

    def test_amap_error_codes(self) -> None:
        """Test AMAP (高德地图) error codes."""
        assert CodeEnum.AMAP_API_REQUEST_ERROR.code == 46500
        assert CodeEnum.AMAP_API_REQUEST_ERROR.msg == "高德地图API调用请求失败"

        assert CodeEnum.AMAP_API_GEO_ERROR.code == 46501
        assert CodeEnum.AMAP_API_GEO_ERROR.msg == "高德地图地理编码失败"

        assert CodeEnum.AMAP_API_PLAN_ROUTE_ERROR.code == 46502
        assert CodeEnum.AMAP_API_PLAN_ROUTE_ERROR.msg == "高德地图出行路线规划失败"

    def test_weather_error_codes(self) -> None:
        """Test weather-related error codes."""
        assert CodeEnum.WEATHER_API_REQUEST_ERROR.code == 46600
        assert CodeEnum.WEATHER_API_REQUEST_ERROR.msg == "30天天气API调用请求失败"

    def test_scenery_error_codes(self) -> None:
        """Test scenery-related error codes."""
        assert CodeEnum.SCENERY_API_REQUEST_ERROR.code == 46700
        assert CodeEnum.SCENERY_API_REQUEST_ERROR.msg == "景点列表API请求调用失败"

    def test_image_understanding_error_codes(self) -> None:
        """Test image understanding error codes."""
        assert CodeEnum.IMAGE_UNDERSTANDING_ERROR.code == 46800
        assert CodeEnum.IMAGE_UNDERSTANDING_ERROR.msg == "请求图片地址失败"

    def test_ixf_doc_error_codes(self) -> None:
        """Test IXF document error codes."""
        assert CodeEnum.IXF_DOC_ERROR.code == 46900
        assert CodeEnum.IXF_DOC_ERROR.msg == "i讯飞文档文件挂载失败"

    def test_aiui_weather_error_codes(self) -> None:
        """Test AIUI weather error codes."""
        assert CodeEnum.AIUI_WEATHER_ERROR.code == 47000
        assert CodeEnum.AIUI_WEATHER_ERROR.msg == "天气查询失败"

    def test_code_uniqueness(self) -> None:
        """Test that all error codes are unique."""
        codes = [enum_item.code for enum_item in CodeEnum]
        assert len(codes) == len(set(codes)), "Found duplicate error codes"

    def test_code_range_validation(self) -> None:
        """Test that error codes are in expected ranges."""
        for code_enum in CodeEnum:
            # All codes should be positive integers
            assert code_enum.code > 0
            # All codes should be in the 45000-47000 range based on the current definitions
            assert 45000 <= code_enum.code <= 47000

    def test_message_not_empty(self) -> None:
        """Test that all error messages are not empty."""
        for code_enum in CodeEnum:
            assert code_enum.msg
            assert len(code_enum.msg.strip()) > 0

    def test_enum_iteration(self) -> None:
        """Test that enum can be iterated properly."""
        codes = []
        messages = []

        for code_enum in CodeEnum:
            codes.append(code_enum.code)
            messages.append(code_enum.msg)

        # Should have collected all enum values
        assert len(codes) == len(CodeEnum)
        assert len(messages) == len(CodeEnum)

        # All codes should be integers
        for code in codes:
            assert isinstance(code, int)

        # All messages should be strings
        for msg in messages:
            assert isinstance(msg, str)

    def test_enum_value_access(self) -> None:
        """Test accessing enum values directly."""
        # Test accessing the tuple value directly
        ocr_error = CodeEnum.OCR_FILE_HANDLING_ERROR
        assert ocr_error.value == (45000, "OCR文件处理失败")

        # Test that value[0] is code and value[1] is message
        assert ocr_error.value[0] == ocr_error.code
        assert ocr_error.value[1] == ocr_error.msg

    def test_enum_comparison(self) -> None:
        """Test enum comparison operations."""
        error1 = CodeEnum.OCR_FILE_HANDLING_ERROR
        error2 = CodeEnum.OCR_FILE_HANDLING_ERROR
        error3 = CodeEnum.IMAGE_GENERATE_ERROR

        # Same enum should be equal
        assert error1 == error2
        assert error1 is error2

        # Different enums should not be equal
        assert error1 != error3
        assert error1 is not error3

    def test_enum_hash(self) -> None:
        """Test that enum values can be used as dictionary keys."""
        error_dict = {
            CodeEnum.OCR_FILE_HANDLING_ERROR: "OCR Error Handler",
            CodeEnum.IMAGE_GENERATE_ERROR: "Image Error Handler",
        }

        assert error_dict[CodeEnum.OCR_FILE_HANDLING_ERROR] == "OCR Error Handler"
        assert error_dict[CodeEnum.IMAGE_GENERATE_ERROR] == "Image Error Handler"

    def test_enum_string_representation(self) -> None:
        """Test string representation of enum values."""
        error = CodeEnum.OCR_FILE_HANDLING_ERROR

        # Test that string representation contains useful information
        str_repr = str(error)
        assert "OCR_FILE_HANDLING_ERROR" in str_repr

        # Test repr
        repr_str = repr(error)
        assert "CodeEnum" in repr_str
        assert "OCR_FILE_HANDLING_ERROR" in repr_str

    def test_code_categorization(self) -> None:
        """Test that error codes are properly categorized by ranges."""
        ocr_codes = []
        image_codes = []
        textin_codes = []
        tts_codes = []
        excel_codes = []
        echart_codes = []
        database_codes = []

        for code_enum in CodeEnum:
            code = code_enum.code
            if 45000 <= code <= 45049:
                ocr_codes.append(code)
            elif 45100 <= code <= 45149:
                image_codes.append(code)
            elif 45150 <= code <= 45199:
                textin_codes.append(code)
            elif code == 45160 or 46000 <= code <= 46019:
                tts_codes.append(code)
            elif 46100 <= code <= 46199:
                excel_codes.append(code)
            elif 46200 <= code <= 46299:
                echart_codes.append(code)
            elif 46300 <= code <= 46399:
                database_codes.append(code)

        # Verify we have codes in expected categories
        assert len(ocr_codes) > 0, "Should have OCR error codes"
        assert len(image_codes) > 0, "Should have image error codes"
        assert len(textin_codes) > 0, "Should have TEXTIN error codes"
