"""
Error code definition module defining status codes and messages for business errors.
"""

from enum import Enum


class CodeEnum(Enum):
    OCR_FILE_HANDLING_ERROR = (45000, "OCR文件处理失败")

    QWEN_VL_72B_INSTRUCT_ERROR = (45050, "QWEN_VL_72B_INSTRUCT处理失败")

    # 文生图异常
    IMAGE_GENERATE_ERROR = (45100, "图片生成失败")
    IMAGE_STORAGE_ERROR = (45101, "图片存储失败")
    IMAGE_GENERATE_MSG_FORMAT_ERROR = (45103, "用户的消息格式有错误")
    IMAGE_GENERATE_SCHEMA_ERROR = (45104, "用户数据的schema错误")
    IMAGE_GENERATE_PARAMS_ERROR = (45105, "用户参数值有错误")
    IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR = (45106, "服务容量不足")
    IMAGE_GENERATE_INPUT_AUDIT_ERROR = (45107, "输入审核不通过")
    IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR = (
        45108,
        "模型生产的图片涉及敏感信息，审核不通过",
    )
    IMAGE_GENERATE_IMAGE_TIMEOUT_ERROR = (45109, "文生图超时")

    # 合合 OCR 识别异常
    TEXTIN_OCR_REQUESTURL_ERROR = (45150, "TEXTIN_OCR_RequestURL处理失败")
    TEXTIN_OCR_ERROR = (45151, "TEXTIN_OCR_Request处理OCR识别失败")
    TEXTIN_OCR_ENTITY_EXTRACTION_ERROR = (
        45152,
        "TEXTIN_OCR_ENTITY_EXTRACTION 处理OCR识别失败",
    )
    TEXTIN_OCR_ENTITY_EXTRACTION_PARAMS_ERROR = (
        45153,
        "TEXTIN_OCR_ENTITY_EXTRACTION 用户参数值有错误",
    )
    TEXTIN_OCR_UNSUPPORTED_FILE_TYPE_ERROR = (
        45154,
        "传入文件类型错误，支持pdf和图片文件",
    )
    TEXTIN_OCR_INSUFFICIENT_BALANCE_ERROR = (45155, "合合接口余额不足，请充值后使用")

    # word、excel 转 markdown 工具异常码
    OCR_REQUESTURL_ERROR = (45200, "请求下载链接失败")
    OCR_FILE_TYPE_ERROR = (45201, "不支持的文档格式")
    OCR_FILE_ERROR = (45202, "处理文档失败")
    OCR_UNKNOWN_FILE_ERROR = (45203, "未知的文件类型")

    # 翻译异常
    TRANSLATION_EMPTY_ERROR = (45250, "翻译文本不能为空")
    TRANSLATION_TOO_LONG_ERROR = (45251, "翻译文本超过5000字符限制")
    TRANSLATION_LANG_ERROR = (45252, "不支持的语言组合")
    TRANSLATION_API_ERROR = (45253, "翻译API调用失败")
    TRANSLATION_RESPONSE_ERROR = (45254, "翻译API返回数据格式错误")
    TRANSLATION_AUTH_ERROR = (45255, "翻译服务认证失败")
    TRANSLATION_NETWORK_ERROR = (45256, "翻译服务网络连接失败")

    # tts,smarttts
    OSS_STORAGE_ERROR = (45160, "OSS存储失败")
    TEXT_RESULT_NULL_ERROR = (46000, "text字段不能为空")
    VOICE_GENERATE_ERROR = (46001, "语音合成失败")
    TRAIN_ERROR = (46002, "一句话复刻API训练失败")
    AUDIO_URLS_ERROR = (46003, "用户上传的音频识别失败,请检查录音文件URL")
    UNAUTHORIZED_ERROR = (46004, "鉴权失败,请联系系统人员检查appid授权信息")
    ARXIV_SEARCH_ERROR = (46005, "论文搜索失败")
    WEB_SEARCH_ERROR = (46006, "博查websearch搜索失败")

    INTERNAL_ERROR = (46020, "服务内部报错")

    # excel
    EXCEL_READ_ERROR = (46100, "excel读取失败")
    EXCEL_WRITE_INVALID_CONTENT = (46101, "excel写入数据不合法")
    EXCEL_WRITE_ERROR = (46102, "excel写入失败")

    # echart
    ECHART_GENERATE_ERROR = (46200, "echart生成失败")
    ECHART_PARAMS_ERROR = (46201, "echart参数错误")
    ECHART_STORAGE_ERROR = (46203, "echart存储失败")
    ECHART_LINE_GENERATE_ERROR = (46204, "echart折线图生成失败")
    ECHART_SCATTER_GENERATE_ERROR = (46205, "echart散点图生成失败")
    ECHART_BAR_GENERATE_ERROR = (46206, "echart柱状图生成失败")
    ECHART_PIE_GENERATE_ERROR = (46207, "echart饼图生成失败")

    # database
    DATABASE_UNSUPPORTED_ERROR = (46300, "不支持的数据库类型")
    DATABASE_UNKNOW_PORT_ERROR = (46301, "未指定数据库端口")
    DATABASE_CONNECT_ERROR = (46302, "数据库连接失败")
    DATABASE_SQL_STATEMENT_ERROR = (46303, "SQL语句不合法")
    DATABASE_SQL_EXECUTE_ERROR = (46304, "SQL执行失败")

    # panshi
    PANSHI_EXCEL_ERROR = (46400, "磐石excel调用失败")
    PANSHI_API_REQUEST_ERROR = (46401, "磐石API调用请求失败")
    PANSHI_API_RESPONSE_ERROR = (46402, "磐石API调用返回不是xlsx")
    PANSHI_OSS_FILE_STORAGE_ERROR = (46403, "磐石文件上传OSS失败")
    PANSHI_AUTH_ERROR = (46404, "磐石获取授权令牌失败")

    # amap
    AMAP_API_REQUEST_ERROR = (46500, "高德地图API调用请求失败")
    AMAP_API_GEO_ERROR = (46501, "高德地图地理编码失败")
    AMAP_API_PLAN_ROUTE_ERROR = (46502, "高德地图出行路线规划失败")

    # weather
    WEATHER_API_REQUEST_ERROR = (46600, "30天天气API调用请求失败")

    # scenery
    SCENERY_API_REQUEST_ERROR = (46700, "景点列表API请求调用失败")

    # 图片理解
    IMAGE_UNDERSTANDING_ERROR = (46800, "请求图片地址失败")

    # ixf文件上传
    IXF_DOC_ERROR = (46900, "i讯飞文档文件挂载失败")

    # aiui天气查询
    AIUI_WEATHER_ERROR = (47000, "天气查询失败")

    @property
    def code(self) -> int:
        """获取状态码"""
        return self.value[0]

    @property
    def msg(self) -> str:
        """获取状态码信息"""
        return self.value[1]
