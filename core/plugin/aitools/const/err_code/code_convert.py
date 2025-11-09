from plugin.aitools.const.err_code.code import CodeEnum
from plugin.aitools.const.err_code.third_api_code import ThirdApiCodeEnum


class CodeConvert:
    """
    三方api错误码转换
    """

    @staticmethod
    def imageGeneratorCode(code: int) -> CodeEnum:
        if code == ThirdApiCodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR.code:
            return CodeEnum.IMAGE_GENERATE_MSG_FORMAT_ERROR
        elif code == ThirdApiCodeEnum.IMAGE_GENERATE_SCHEMA_ERROR.code:
            return CodeEnum.IMAGE_GENERATE_SCHEMA_ERROR
        elif code == ThirdApiCodeEnum.IMAGE_GENERATE_PARAMS_ERROR.code:
            return CodeEnum.IMAGE_GENERATE_PARAMS_ERROR
        elif code == ThirdApiCodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR.code:
            return CodeEnum.IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR
        elif code == ThirdApiCodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR.code:
            return CodeEnum.IMAGE_GENERATE_INPUT_AUDIT_ERROR
        elif code == ThirdApiCodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR.code:
            return CodeEnum.IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR
        else:
            return CodeEnum.IMAGE_GENERATE_ERROR
