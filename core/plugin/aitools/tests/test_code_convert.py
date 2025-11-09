"""
Test cases for const/err_code/code_convert.py module.

This module tests error code conversion functionality for third-party API codes.
"""

from plugin.aitools.const.err_code.code import CodeEnum
from plugin.aitools.const.err_code.code_convert import CodeConvert
from plugin.aitools.const.err_code.third_api_code import ThirdApiCodeEnum


class TestCodeConvert:
    """Test cases for CodeConvert class."""

    def test_image_generator_code_msg_format_error(self) -> None:
        """Test conversion of IMAGE_GENERATE_MSG_FORMAT_ERROR."""
        code = ThirdApiCodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.code
        result = CodeConvert.imageGeneratorCode(code)
        assert result == CodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR

    def test_image_generator_code_schema_error(self) -> None:
        """Test conversion of IMAGE_GENERATE_SCHEMA_ERROR."""
        code = ThirdApiCodeEnum.IMAGE_GENERATE_SCHEMA_ERROR.code
        result = CodeConvert.imageGeneratorCode(code)
        assert result == CodeEnum.IMAGE_GENERATE_SCHEMA_ERROR

    def test_image_generator_code_params_error(self) -> None:
        """Test conversion of IMAGE_GENERATE_PARAMS_ERROR."""
        code = ThirdApiCodeEnum.IMAGE_GENERATE_PARAMS_ERROR.code
        result = CodeConvert.imageGeneratorCode(code)
        assert result == CodeEnum.IMAGE_GENERATE_PARAMS_ERROR

    def test_image_generator_code_srv_not_enough_error(self) -> None:
        """Test conversion of IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR."""
        code = ThirdApiCodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR.code
        result = CodeConvert.imageGeneratorCode(code)
        assert result == CodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR

    def test_image_generator_code_input_audit_error(self) -> None:
        """Test conversion of IMAGE_GENERATE_INPUT_AUDIT_ERROR."""
        code = ThirdApiCodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR.code
        result = CodeConvert.imageGeneratorCode(code)
        assert result == CodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR

    def test_image_generator_code_image_sensitiveness_error(self) -> None:
        """Test conversion of IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR."""
        code = ThirdApiCodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR.code
        result = CodeConvert.imageGeneratorCode(code)
        assert result == CodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR

    def test_image_generator_code_unknown_error(self) -> None:
        """Test conversion of unknown error codes."""
        # Test with a code that doesn't match any specific error
        unknown_code = 99999
        result = CodeConvert.imageGeneratorCode(unknown_code)
        assert result == CodeEnum.IMAGE_GENERATE_ERROR

    def test_image_generator_code_negative_code(self) -> None:
        """Test conversion with negative error code."""
        result = CodeConvert.imageGeneratorCode(-1)
        assert result == CodeEnum.IMAGE_GENERATE_ERROR

    def test_image_generator_code_zero(self) -> None:
        """Test conversion with zero error code."""
        result = CodeConvert.imageGeneratorCode(0)
        assert result == CodeEnum.IMAGE_GENERATE_ERROR

    def test_image_generator_code_large_number(self) -> None:
        """Test conversion with very large error code."""
        result = CodeConvert.imageGeneratorCode(999999999)
        assert result == CodeEnum.IMAGE_GENERATE_ERROR

    def test_image_generator_code_all_third_api_codes(self) -> None:
        """Test that all third-party image generator codes are properly converted."""
        # Get all image generator related third-party codes
        third_api_codes = [
            ThirdApiCodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR,
            ThirdApiCodeEnum.IMAGE_GENERATE_SCHEMA_ERROR,
            ThirdApiCodeEnum.IMAGE_GENERATE_PARAMS_ERROR,
            ThirdApiCodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR,
            ThirdApiCodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR,
            ThirdApiCodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR,
        ]

        expected_mappings = [
            CodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR,
            CodeEnum.IMAGE_GENERATE_SCHEMA_ERROR,
            CodeEnum.IMAGE_GENERATE_PARAMS_ERROR,
            CodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR,
            CodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR,
            CodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR,
        ]

        for third_code, expected_code in zip(third_api_codes, expected_mappings):
            result = CodeConvert.imageGeneratorCode(third_code.code)
            assert result == expected_code, f"Failed for {third_code.name}"

    def test_image_generator_code_return_type(self) -> None:
        """Test that imageGeneratorCode always returns CodeEnum instances."""
        test_codes = [
            ThirdApiCodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.code,
            99999,  # Unknown code
            -1,  # Negative code
            0,  # Zero
        ]

        for code in test_codes:
            result = CodeConvert.imageGeneratorCode(code)
            assert isinstance(
                result, CodeEnum
            ), f"Result for code {code} is not CodeEnum instance"

    def test_image_generator_code_consistency(self) -> None:
        """Test that the same input always produces the same output."""
        test_code = ThirdApiCodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.code

        result1 = CodeConvert.imageGeneratorCode(test_code)
        result2 = CodeConvert.imageGeneratorCode(test_code)

        assert result1 == result2
        assert result1 is result2  # Should be the same enum instance

    def test_code_convert_is_static(self) -> None:
        """Test that CodeConvert methods are static and don't require instantiation."""
        # Should be able to call without creating an instance
        result = CodeConvert.imageGeneratorCode(
            ThirdApiCodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.code
        )
        assert result == CodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR

        # Test that the class doesn't need to be instantiated
        # This should not raise any errors
        assert hasattr(CodeConvert, "imageGeneratorCode")
        assert callable(CodeConvert.imageGeneratorCode)
