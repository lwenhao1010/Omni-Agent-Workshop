"""
ISE speech evaluation client module providing intelligent speech assessment services.
"""

import _thread as thread
import base64
import hashlib
import hmac
import io
import json
import os
import ssl
import xml.etree.ElementTree as ET
from datetime import datetime
from time import mktime
from typing import Any, Callable, Dict, Optional, Tuple
from urllib.parse import urlencode
from wsgiref.handlers import format_date_time

import websocket
from pydub import AudioSegment


class AudioConverter:
    """音频格式转换器"""

    @staticmethod
    def detect_audio_format(audio_data: bytes) -> str:
        """检测音频格式"""
        # 检查文件头标识
        if audio_data.startswith(b"RIFF") and b"WAVE" in audio_data[:12]:
            return "wav"
        elif (
            audio_data.startswith(b"ID3")
            or audio_data.startswith(b"\xff\xfb")
            or audio_data.startswith(b"\xff\xf3")
        ):
            return "mp3"
        elif audio_data.startswith(b"OggS"):
            return "ogg"
        elif audio_data.startswith(b"fLaC"):
            return "flac"
        elif audio_data.startswith(b"#!AMR"):
            return "amr"
        else:
            return "unknown"

    @staticmethod
    def get_audio_properties(audio_data: bytes) -> Dict[str, Any]:
        """获取音频属性（采样率、位深、声道数等）"""

        try:
            format_type = AudioConverter.detect_audio_format(audio_data)

            # 加载音频文件
            if format_type == "mp3":
                audio = AudioSegment.from_mp3(io.BytesIO(audio_data))
            elif format_type == "wav":
                audio = AudioSegment.from_wav(io.BytesIO(audio_data))
            elif format_type == "ogg":
                audio = AudioSegment.from_ogg(io.BytesIO(audio_data))
            elif format_type == "flac":
                audio = AudioSegment.from_file(io.BytesIO(audio_data), format="flac")
            else:
                # 尝试自动识别格式
                audio = AudioSegment.from_file(io.BytesIO(audio_data))

            return {
                "sample_rate": audio.frame_rate,
                "channels": audio.channels,
                "sample_width": audio.sample_width,
                "duration": len(audio) / 1000.0,  # 转换为秒
                "format": format_type,
                "bit_depth": audio.sample_width * 8,
            }

        except Exception as e:
            return {
                "sample_rate": None,
                "channels": None,
                "sample_width": None,
                "duration": None,
                "format": AudioConverter.detect_audio_format(audio_data),
                "error": f"音频属性检测失败: {str(e)}",
            }

    @staticmethod
    def convert_to_wav(
        audio_data: bytes, source_format: str | None = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """将音频转换为WAV格式（16kHz, 16bit, 单声道），返回转换后的数据和原始属性"""

        # 获取原始音频属性
        original_properties = AudioConverter.get_audio_properties(audio_data)

        try:
            # 如果没有指定格式，自动检测
            if source_format is None:
                source_format = AudioConverter.detect_audio_format(audio_data)

            # 如果已经是WAV格式，检查是否符合要求
            if source_format == "wav":
                # 检查WAV格式参数
                audio = AudioSegment.from_wav(io.BytesIO(audio_data))
                if (
                    audio.frame_rate == 16000
                    and audio.sample_width == 2
                    and audio.channels == 1
                ):
                    return audio_data, original_properties  # 已经符合要求，直接返回

            # 加载音频文件
            if source_format == "mp3":
                audio = AudioSegment.from_mp3(io.BytesIO(audio_data))
            elif source_format == "wav":
                audio = AudioSegment.from_wav(io.BytesIO(audio_data))
            elif source_format == "ogg":
                audio = AudioSegment.from_ogg(io.BytesIO(audio_data))
            elif source_format == "flac":
                audio = AudioSegment.from_file(io.BytesIO(audio_data), format="flac")
            else:
                # 尝试自动识别格式
                audio = AudioSegment.from_file(io.BytesIO(audio_data))

            # 转换为目标格式: 16kHz, 16bit, 单声道
            audio = audio.set_frame_rate(16000)  # 设置采样率为16kHz
            audio = audio.set_sample_width(2)  # 设置为16bit
            audio = audio.set_channels(1)  # 设置为单声道

            # 导出为WAV格式
            wav_io = io.BytesIO()
            audio.export(wav_io, format="wav")
            wav_data = wav_io.getvalue()
            wav_io.close()

            return wav_data, original_properties

        except Exception as e:
            raise ValueError(f"音频转换失败: {str(e)}")

    @staticmethod
    def validate_audio_format(audio_data: bytes) -> Tuple[bool, str]:
        """验证音频格式是否符合ISE要求"""
        try:
            format_type = AudioConverter.detect_audio_format(audio_data)
            if format_type == "wav":
                audio = AudioSegment.from_wav(io.BytesIO(audio_data))
                if (
                    audio.frame_rate == 16000
                    and audio.sample_width == 2
                    and audio.channels == 1
                ):
                    return True, "音频格式符合要求"
                else:
                    return (
                        False,
                        f"WAV格式不符合要求: {audio.frame_rate}Hz,\
                              {audio.sample_width*8}bit, {audio.channels}声道",
                    )
            else:
                return False, f"音频格式为{format_type}，需要转换为WAV"

        except Exception as e:
            return False, f"音频验证失败: {str(e)}"


class ISEResultParser:
    """ISE评测结果解析器 - 将XML转换为AI友好的JSON格式"""

    @staticmethod
    def parse_xml_result(xml_string: str, _group: str = "adult") -> Dict[str, Any]:
        """
        解析ISE返回的XML结果，转换为结构化JSON格式
        仅提取任务层级的整体评测结果，处理异常情况

        Args:
            xml_string: ISE返回的XML格式评测结果

        Returns:
            Dict: AI友好的结构化评测结果
        """
        try:
            root = ET.fromstring(xml_string)
            result = {
                "evaluation_id": root.get("id", ""),
                "overall_score": 0.0,
                "detailed_scores": {},
                "status": "success",
                "warnings": [],
                "raw_xml": xml_string,
            }

            # 查找评测节点
            task_node = ISEResultParser._find_evaluation_node(root, xml_string)
            if isinstance(task_node, dict):  # Error case
                return task_node

            # 处理异常状态
            ISEResultParser._process_exception_info(task_node, result)
            ISEResultParser._process_rejection_status(task_node, result)

            # 提取评分数据
            task_scores = ISEResultParser._extract_score_fields(task_node)
            result["detailed_scores"] = task_scores
            result["overall_score"] = task_scores.get("total_score", 0)

            return result

        except Exception as e:
            return {
                "error": f"XML解析失败: {str(e)}",
                "raw_xml": xml_string,
                "overall_score": 0,
                "status": "parse_error",
            }

    @staticmethod
    def _find_evaluation_node(root: Any, xml_string: str) -> Any:
        """查找包含评分数据的评测节点"""
        rec_paper = root.find(".//rec_paper")
        if rec_paper is None:
            return {
                "error": "未找到rec_paper节点",
                "raw_xml": xml_string,
                "overall_score": 0,
                "status": "parse_error",
            }

        for child in rec_paper:
            if child.get("total_score"):
                return child

        return {
            "error": "未找到包含评分的评测节点",
            "raw_xml": xml_string,
            "overall_score": 0,
            "status": "parse_error",
        }

    @staticmethod
    def _process_exception_info(task_node: Any, result: Dict[str, Any]) -> None:
        """处理except_info异常情况"""
        except_info = task_node.get("except_info", "0")
        if except_info == "0":
            return

        except_code = int(except_info)
        exception_mappings = {
            28673: ("audio_error", "引擎判断该语音为无语音或音量小类型"),
            28676: ("content_mismatch", "引擎判断该语音为乱说类型"),
            28680: ("noise_error", "引擎判断该语音为信噪比低类型"),
            28690: ("clipping_error", "引擎判断该语音为截幅类型"),
            28689: ("no_audio", "引擎判断没有音频输入"),
        }

        if except_code in exception_mappings:
            status, message = exception_mappings[except_code]
            result["status"] = status
            result["warnings"].append(message)
        else:
            result["status"] = "unknown_error"
            result["warnings"].append(f"引擎返回未知异常代码: {except_code}")

    @staticmethod
    def _process_rejection_status(task_node: Any, result: Dict[str, Any]) -> None:
        """处理is_rejected字段"""
        is_rejected = task_node.get("is_rejected", "false")
        if is_rejected == "true":
            result["status"] = "rejected"
            result["warnings"].append("评测结果被拒：引擎检测到乱读，分值不能作为参考")

    @staticmethod
    def _extract_score_fields(task_node: Any) -> Dict[str, Any]:
        """提取任务层级的所有评分指标"""
        task_scores = {}
        score_fields = [
            "total_score",
            "accuracy_score",
            "emotion_score",
            "fluency_score",
            "integrity_score",
            "phone_score",
            "tone_score",
        ]

        for field in score_fields:
            score_value = task_node.get(field)
            if score_value is not None and score_value != "":
                try:
                    task_scores[field] = float(score_value)
                except (ValueError, TypeError):
                    pass

        return task_scores

    # 移除了 _generate_summary 和 _generate_recommendations 方法，因为已不需要

    @staticmethod
    def check_low_score_warning(
        result: Dict[str, Any], original_audio_properties: Dict[str, Any]
    ) -> Dict[str, Any]:
        """检查低分预警机制，添加音频质量相关的警告"""
        score = result.get("overall_score", 0)
        original_sample_rate = original_audio_properties.get("sample_rate")

        # 如果分数低于5分且原始采样率不是16kHz，添加警告信息
        if score < 5 and original_sample_rate and original_sample_rate != 16000:
            warning_msg = (
                f"低分预警：检测到您的音频原始采样率为 {original_sample_rate}Hz，"
                f"ISE评测服务要求16kHz采样率以获得最佳效果。当前得分 {score:.1f} 可能受到音频质量影响。"
                f"建议使用16kHz采样率的高质量音频重新评测。"
            )

            # 将音频质量警告插入到警告列表中
            if "warnings" not in result:
                result["warnings"] = []
            result["warnings"].insert(0, warning_msg)

        return result


class ISEParam:
    """ISE WebSocket参数类"""

    def __init__(
        self,
        app_id: str,
        api_key: str,
        api_secret: str,
        audio_data: bytes,
        text: str = "",
        language: str = "cn",
        category: str = "read_sentence",
        group: str = "adult",
    ):
        self.app_id = app_id
        self.api_key = api_key
        self.api_secret = api_secret
        self.audio_data = audio_data
        self.text = text

        # 验证年龄组参数
        valid_groups = ["pupil", "youth", "adult"]
        if group not in valid_groups:
            raise ValueError(f"无效的年龄组参数: {group}，有效选项: {valid_groups}")

        # 根据语言设置引擎类型
        ent = "cn_vip" if language == "cn" else "en_vip"

        # 公共参数
        self.common_args = {"app_id": self.app_id}

        # 业务参数 - 按照官方文档格式
        self.business_args = {
            "category": category,  # 评测题型
            "sub": "ise",  # 服务类型
            "ent": ent,  # 引擎类型
            "cmd": "ssb",  # 命令字
            "auf": "audio/L16;rate=16000",  # 音频格式
            "aue": "raw",  # 音频编码
            "text": self._encode_text() if text else "",  # 评测文本
            "tte": "utf-8",  # 文本编码
            "rstcd": "utf8",  # 结果编码
            "group": group,  # 年龄组: pupil/youth/adult
        }

    def _encode_text(self) -> str:
        """编码评测文本"""
        if not self.text:
            return ""
        # 添加BOM和content标记，按照官方格式
        formatted_text = f"\ufeff[content]\n{self.text}"
        return formatted_text


class ISEClient:
    """讯飞星辰智能语音评测(ISE)客户端"""

    def __init__(self, app_id: str, api_key: str, api_secret: str) -> None:
        self.app_id = app_id
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = os.getenv("ISE_URL")
        self.evaluation_complete = False
        self.error_msg: Optional[str] = None
        self.result: Optional[Dict[str, Any]] = None

    async def evaluate_audio(
        self,
        audio_data: bytes,
        text: str = "",
        language: str = "cn",
        category: str = "read_sentence",
        auto_convert: bool = True,
        group: str = "adult",
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        语音评测

        Args:
            audio_data: 音频数据(支持MP3, WAV, OGG, FLAC等格式)
            text: 评测文本(可选，某些评测模式需要)
            language: 语言类型，cn(中文)/en(英文)
            category: 评测类型，read_syllable/read_word/read_sentence等
            auto_convert: 是否自动转换音频格式为WAV
            group: 年龄组类型，pupil(小学)/youth(中学)/adult(成人)，默认adult

        Returns:
            Tuple[bool, str, Dict]: (是否成功, 消息, 评测结果)
        """
        try:
            # 音频格式处理
            processed_audio_data = audio_data
            original_audio_properties: Dict[str, Any] = {}

            if auto_convert:
                # 检测和验证音频格式
                is_valid, validation_msg = AudioConverter.validate_audio_format(
                    audio_data
                )

                if not is_valid:
                    try:
                        # 自动转换为WAV格式，同时获取原始音频属性
                        processed_audio_data, original_audio_properties = (
                            AudioConverter.convert_to_wav(audio_data)
                        )
                        print(
                            f"音频格式已转换: {validation_msg} -> WAV 16kHz 16bit 单声道"
                        )
                        sample_rate = original_audio_properties.get(
                            "sample_rate", "unknown"
                        )
                        bit_depth = original_audio_properties.get(
                            "bit_depth", "unknown"
                        )
                        channels = original_audio_properties.get("channels", "unknown")
                        print(
                            f"原始音频属性: {sample_rate}Hz, {bit_depth}bit, {channels}声道"
                        )
                    except Exception as e:
                        return False, f"音频转换失败: {str(e)}", {}
                else:
                    print(f"音频格式验证: {validation_msg}")
                    # 即使格式符合要求，也获取音频属性用于后续分析
                    original_audio_properties = AudioConverter.get_audio_properties(
                        audio_data
                    )
            else:
                # 不自动转换时，仍然获取音频属性
                original_audio_properties = AudioConverter.get_audio_properties(
                    audio_data
                )

            ise_param = ISEParam(
                self.app_id,
                self.api_key,
                self.api_secret,
                processed_audio_data,
                text,
                language,
                category,
                group,
            )

            # 创建WebSocket连接
            auth_url = self._create_auth_url()

            # 使用同步WebSocket
            import asyncio

            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._sync_evaluate, ise_param, auth_url)

            if self.error_msg:
                return False, self.error_msg, {}

            if self.result:
                # 检查低分预警机制
                self.result = ISEResultParser.check_low_score_warning(
                    self.result, original_audio_properties
                )
                return True, "评测成功", self.result
            else:
                return False, "评测失败，未获取到结果", {}

        except Exception as e:
            return False, f"评测过程中发生错误: {str(e)}", {}

    def _sync_evaluate(self, ise_param: ISEParam, auth_url: str) -> None:
        """同步评测方法 - 采用官方分帧传输模式"""
        self.result = None
        self.error_msg = None
        self.evaluation_complete = False

        # 创建WebSocket连接
        websocket.enableTrace(False)
        ws = websocket.WebSocketApp(
            auth_url,
            on_message=self._create_message_handler(ise_param),
            on_error=self._create_error_handler(),
            on_close=self._create_close_handler(),
            on_open=self._create_open_handler(ise_param),
        )

        ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})

    def _create_message_handler(self, ise_param: ISEParam) -> Callable:
        """创建WebSocket消息处理器"""

        def on_message(ws: Any, message: str) -> None:
            try:
                print(f"Received message: {message}")
                data = json.loads(message)

                # 检查错误码
                if "code" in data and data["code"] != 0:
                    self.error_msg = data.get(
                        "message", f"评测失败，错误码: {data['code']}"
                    )
                    ws.close()
                    return

                # 解析评测结果
                if "data" in data:
                    self._handle_evaluation_response(data["data"], ise_param, ws)

            except Exception as e:
                self.error_msg = f"解析响应消息失败: {str(e)}"
                ws.close()

        return on_message

    def _handle_evaluation_response(
        self, data_info: Dict[str, Any], ise_param: ISEParam, ws: Any
    ) -> None:
        """处理评测响应数据"""
        status = data_info.get("status", 0)

        if status == 2:  # 评测完成
            if "data" in data_info and data_info["data"]:
                # Base64解码结果
                result_data = base64.b64decode(data_info["data"])
                result_str = result_data.decode("utf-8")
                # 使用ISEResultParser解析XML结果为AI友好的JSON格式
                self.result = ISEResultParser.parse_xml_result(
                    result_str,
                    ise_param.business_args.get("group", "adult"),
                )
            else:
                self.result = {
                    "error": "未接收到评测结果数据",
                    "overall_score": 0,
                    "status": "no_data",
                }
            self.evaluation_complete = True
            ws.close()

    def _create_error_handler(self) -> Callable:
        """创建WebSocket错误处理器"""

        def on_error(_ws: Any, error: Exception) -> None:
            self.error_msg = f"WebSocket连接错误: {str(error)}"

        return on_error

    def _create_close_handler(self) -> Callable:
        """创建WebSocket关闭处理器"""

        def on_close(_ws: Any, _close_status_code: Any, _close_msg: Any) -> None:
            pass

        return on_close

    def _create_open_handler(self, ise_param: ISEParam) -> Callable:
        """创建WebSocket连接开启处理器"""

        def on_open(ws: Any) -> None:
            def run() -> None:
                try:
                    self._send_initial_frame(ws, ise_param)
                    self._send_audio_frames(ws, ise_param)
                except Exception as e:
                    self.error_msg = f"发送数据失败: {str(e)}"
                    ws.close()

            thread.start_new_thread(run, ())

        return on_open

    def _send_initial_frame(self, ws: Any, ise_param: ISEParam) -> None:
        """发送首帧数据"""
        first_frame = {
            "common": ise_param.common_args,
            "business": ise_param.business_args,
            "data": {"status": 0, "data": ""},  # 首帧
        }
        ws.send(json.dumps(first_frame))
        print("发送首帧完成")

    def _send_audio_frames(self, ws: Any, ise_param: ISEParam) -> None:
        """分帧发送音频数据"""
        audio_data = ise_param.audio_data
        frame_size = 1280  # 每帧1280字节，与官方示例保持一致

        for i in range(0, len(audio_data), frame_size):
            chunk = audio_data[i : i + frame_size]
            is_last_frame = i + frame_size >= len(audio_data)

            if is_last_frame:
                self._send_final_frame(ws, chunk)
                break
            else:
                self._send_middle_frame(ws, chunk)

    def _send_final_frame(self, ws: Any, chunk: bytes) -> None:
        """发送最后一帧数据"""
        frame_data = {
            "business": {"cmd": "auw", "aus": 4},
            "data": {
                "status": 2,  # 结束
                "data": base64.b64encode(chunk).decode(),
            },
        }
        ws.send(json.dumps(frame_data))
        print("发送最后一帧")

    def _send_middle_frame(self, ws: Any, chunk: bytes) -> None:
        """发送中间帧数据"""
        frame_data = {
            "business": {"cmd": "auw", "aus": 1},
            "data": {
                "status": 1,  # 继续
                "data": base64.b64encode(chunk).decode(),
                "data_type": 1,
                "encoding": "raw",
            },
        }
        ws.send(json.dumps(frame_data))

    def _create_auth_url(self) -> str:
        """创建鉴权URL - 按照官方方法实现"""
        # 生成时间戳
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        # 构造签名原始字符串
        signature_origin = "host: ise-api.xfyun.cn\n"
        signature_origin += f"date: {date}\n"
        signature_origin += "GET /v2/open-ise HTTP/1.1"

        # 生成签名
        signature_sha = hmac.new(
            self.api_secret.encode("utf-8"),
            signature_origin.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        signature_sha_base64 = base64.b64encode(signature_sha).decode(encoding="utf-8")

        # 构造authorization字符串
        authorization_origin = (
            f'api_key="{self.api_key}", algorithm="hmac-sha256", '
            f'headers="host date request-line", signature="{signature_sha_base64}"'
        )
        authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(
            encoding="utf-8"
        )

        # 构造最终URL
        auth_params = urlencode(
            {"authorization": authorization, "date": date, "host": "ise-api.xfyun.cn"}
        )

        return f"{self.base_url}?{auth_params}"

    def evaluate_pronunciation(
        self,
        audio_data: bytes,
        text: str,
        language: str = "cn",
        auto_convert: bool = True,
        group: str = "adult",
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        发音评测(同步版本，用于简单调用)

        Args:
            audio_data: 音频数据(支持多种格式)
            text: 评测文本
            language: 语言类型
            auto_convert: 是否自动转换音频格式
            group: 年龄组类型，pupil(小学)/youth(中学)/adult(成人)，默认adult

        Returns:
            Tuple[bool, str, Dict]: (是否成功, 消息, 评测结果)
        """
        import asyncio

        return asyncio.run(
            self.evaluate_audio(
                audio_data, text, language, "read_chapter", auto_convert, group
            )
        )
