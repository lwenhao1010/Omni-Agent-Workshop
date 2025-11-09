from enum import Enum

# 接入三方API错误吗


class ThirdApiCodeEnum(Enum):
    SUCCESS = (0, "成功")

    # 代码执行
    CODE_EXECUTE_POD_NOT_READY_ERROR = (10405, "pod 暂时还没有启动好，请稍后重试")
    CODE_EXECUTE_ERROR = (1, "exec code error::exit status 1")

    # 文生图错误
    IMAGE_GENERATE_MSG_FORMAT_ERROR = (10003, "用户的消息格式有错误")
    IMAGE_GENERATE_SCHEMA_ERROR = (10004, "用户数据的schema错误")
    IMAGE_GENERATE_PARAMS_ERROR = (10005, "用户参数值有错误")
    IMAGE_GENERATE_SRV_NOT_ENOUGH_ERROR = (10008, "服务容量不足")
    IMAGE_GENERATE_INPUT_AUDIT_ERROR = (10021, "输入审核不通过")
    IMAGE_GENERATE_IMAGE_SENSITIVENESS_ERROR = (
        10022,
        "模型生产的图片涉及敏感信息，审核不通过",
    )

    # SparkLink 相关错误
    SPARK_LINK_APP_INIT_ERR = (30001, "初始化失败")
    SPARK_LINK_COMMON_ERR = (30100, "一般错误")
    SPARK_LINK_JSON_PROTOCOL_PARSER_ERR = (30200, "协议解析失败")
    SPARK_LINK_JSON_SCHEMA_VALIDATE_ERR = (30201, "协议校验失败")
    SPARK_LINK_OPENAPI_SCHEMA_VALIDATE_ERR = (30300, "协议解析失败")
    SPARK_LINK_OPENAPI_SCHEMA_BODY_TYPE_NOT_SUPPORT_ERR = (30301, "body类型不支持")
    SPARK_LINK_OPENAPI_SCHEMA_SERVER_NOT_EXIST_ERR = (30302, "server 不存在")
    SPARK_LINK_THIRD_API_REQUEST_FAILED_ERR = (30400, "三方请求失败")
    SPARK_LINK_TOOL_NOT_EXIST_ERR = (30500, "工具不存在")
    SPARK_LINK_OPERATION_ID_NOT_EXIST_ERR = (30600, "Operation不存在")

    # 星火错误
    SPARK_WS_ERROR = (10000, "升级为ws出现错误")
    SPARK_WS_READ_ERROR = (10001, "通过ws读取用户的消息出错")
    SPARK_WS_SEND_ERROR = (10002, "通过ws向用户发送消息出错")
    SPARK_MESSAGE_FORMAT_ERROR = (10003, "用户的消息格式有错误")
    SPARK_SCHEMA_ERROR = (10004, "用户数据的schema错误")
    SPARK_PARAM_ERROR = (10005, "用户参数值有错误")
    SPARK_CONCURRENCY_ERROR = (
        10006,
        "用户并发错误：当前用户已连接，同一用户不能多处同时连接。",
    )
    SPARK_TRAFFIC_LIMIT_ERROR = (
        10007,
        "用户流量受限：服务正在处理用户当前的问题，需等待处理完成后再发送新的请求。（必须要等大模型完全回复之后，才能发送下一个问题）",
    )
    SPARK_CAPACITY_ERROR = (10008, "服务容量不足，联系工作人员")
    SPARK_ENGINE_CONNECTION_ERROR = (10009, "和引擎建立连接失败")
    SPARK_ENGINE_RECEIVE_ERROR = (10010, "接收引擎数据的错误")
    SPARK_ENGINE_SEND_ERROR = (10011, "发送数据给引擎的错误")
    SPARK_ENGINE_INTERNAL_ERROR = (10012, "引擎内部错误")
    SPARK_CONTENT_AUDIT_ERROR = (
        10013,
        "输入内容审核不通过，涉嫌违规，请重新调整输入内容",
    )
    SPARK_OUTPUT_AUDIT_ERROR = (
        10014,
        "输出内容涉及敏感信息，审核不通过，后续结果无法展示给用户",
    )
    SPARK_APP_ID_BLACKLIST_ERROR = (10015, "appid在黑名单中")
    SPARK_APP_ID_AUTH_ERROR = (
        10016,
        "appid授权类的错误。比如：未开通此功能，未开通对应版本，token不足，并发超过授权 等等",
    )
    SPARK_CLEAR_HISTORY_ERROR = (10017, "清除历史失败")
    SPARK_VIOLATION_ERROR = (
        10019,
        "表示本次会话内容有涉及违规信息的倾向；建议开发者收到此错误码后给用户一个输入涉及违规的提示",
    )
    SPARK_BUSY_ERROR = (10110, "服务忙，请稍后再试")
    SPARK_ENGINE_PARAMS_ERROR = (10163, "请求引擎的参数异常 引擎的schema 检查不通过")
    SPARK_ENGINE_NETWORK_ERROR = (10222, "引擎网络异常")
    SPARK_TOKEN_LIMIT_ERROR = (
        10907,
        "token数量超过上限。对话历史+问题的字数太多，需要精简输入",
    )
    SPARK_AUTH_ERROR = (
        11200,
        "授权错误：该appId没有相关功能的授权 或者 业务量超过限制",
    )
    SPARK_DAILY_LIMIT_ERROR = (11201, "授权错误：日流控超限。超过当日最大访问量的限制")
    SPARK_SECOND_LIMIT_ERROR = (
        11202,
        "授权错误：秒级流控超限。秒级并发超过授权路数限制",
    )
    SPARK_CONCURRENCY_LIMIT_ERROR = (
        11203,
        "授权错误：并发流控超限。并发路数超过授权路数限制",
    )

    @property
    def code(self) -> int:
        """获取状态码"""
        return self.value[0]

    @property
    def msg(self) -> str:
        """获取状态码信息"""
        return self.value[1]
