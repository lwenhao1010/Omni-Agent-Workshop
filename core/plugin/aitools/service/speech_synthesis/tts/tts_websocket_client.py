import base64
import binascii
import hashlib
import hmac
import json
import ssl
import threading
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlencode
from wsgiref.handlers import format_date_time

import websocket


class TTSWebSocketClient:
    """Encapsulated WebSocket client for Text-to-Speech synthesis requests.

    Comprehensive TTS client handling authentication, WebSocket communication,
    and audio data processing with configurable voice and speed parameters.

    Instance Attributes Organization:

    Authentication Credentials:
        - app_id: Application identifier for service access
        - api_key: API access key for authorization
        - api_secret: API secret key for signature generation

    Synthesis Parameters:
        - text: Input text content for voice synthesis
        - vcn: Voice character name/speaker selection
        - speed: Speech synthesis rate setting

    WebSocket Configuration:
        - common_args: Common parameters for WebSocket protocol
        - business_args: Business logic parameters (audio format, etc.)
        - data: Encoded text data for transmission
        - url: Complete authenticated WebSocket URL
        - ws: WebSocket application instance

    Session & Output:
        - nowtime: Session timestamp for identification
        - messages: Collected WebSocket response messages
        - audio_data: Accumulated synthesized audio buffer

    Attributes support the full TTS processing pipeline from authentication
    through WebSocket communication to audio data collection and output.
    """

    def __init__(
        self,
        app_id: str,
        api_key: str,
        api_secret: str,
        text: str,
        vcn: str,
        speed: int,
    ):
        """Initialize TTS WebSocket client with complete configuration parameters.

        All 6 parameters are required for proper TTS WebSocket functionality:

        Args:
            app_id (str): Application identifier - Required for service authentication
            api_key (str): API access key - Required for request authorization
            api_secret (str): API secret key - Required for HMAC auth signature
            text (str): Text content to synthesize - Required as input for TTS
            vcn (str): Voice character name - Required to specify voice model/speaker
            speed (int): Speech synthesis speed - Required for controlling output timing

        Note:
            Parameter necessity for WebSocket TTS operation:
            - app_id/api_key/api_secret: Auth credential triplet for secure access
            - text: Core content that will be converted to speech audio
            - vcn: Determines voice characteristics and speaker identity
            - speed: Controls speech rate for natural and customized output
        """
        self.app_id = app_id
        self.api_key = api_key
        self.api_secret = api_secret
        self.text = text
        self.vcn = vcn
        self.speed = speed

        # 公共参数(common)
        self.common_args = {"app_id": self.app_id}

        # 业务参数(business), lame是返回mp3格式，sfl=1添加为流式返回
        self.business_args = {
            "aue": "lame",
            "sfl": 1,
            "auf": "audio/L16;rate=16000",
            "vcn": self.vcn,
            "tte": "utf8",
            "speed": self.speed,
        }

        # 数据参数(data)
        self.data = {
            "status": 2,
            "text": str(base64.b64encode(self.text.encode("utf-8")), "UTF8"),
        }

        # WebSocket URL
        self.url = self.create_url()

        # 初始化WebSocket应用
        self.ws = websocket.WebSocketApp(
            self.url,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
        )
        self.ws.on_open = self.on_open

        self.nowtime = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        self.messages: List[Dict[str, Any]] = []  # 存储所有消息
        self.audio_data = bytearray()  # 用于存储所有音频数据

    def create_url(self) -> str:
        url = "wss://tts-api.xfyun.cn/v2/tts"
        now = datetime.now()
        date = format_date_time(time.mktime(now.timetuple()))

        signature_origin = "host: " + "ws-api.xfyun.cn" + "\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET " + "/v2/tts " + "HTTP/1.1"

        signature_sha_bytes: bytes = hmac.new(
            self.api_secret.encode("utf-8"),
            signature_origin.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        signature_sha: str = base64.b64encode(signature_sha_bytes).decode(
            encoding="utf-8"
        )

        authorization_origin = (
            f'api_key="{self.api_key}", algorithm="hmac-sha256", '
            f'headers="host date request-line", signature="{signature_sha}"'
        )
        authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(
            encoding="utf-8"
        )

        v = {"authorization": authorization, "date": date, "host": "ws-api.xfyun.cn"}

        url = url + "?" + urlencode(v)
        # print('websocket url :', url)
        return url

    def on_message(self, ws: websocket.WebSocket, message: str) -> None:
        try:
            message_dict = json.loads(message)
            self.messages.append(message_dict)  # 存储消息
            code = message_dict["code"]
            audio = message_dict["data"]["audio"]
            audio = base64.b64decode(audio)
            status = message_dict["data"]["status"]
            # print(111,message)
            if status == 2:
                # print("ws is closed")
                ws.close()
            if code != 0:
                # errMsg = message["message"]
                # print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))
                self.audio_data.extend(audio)  # 将音频数据追加到bytearray中
        except (json.JSONDecodeError, KeyError, binascii.Error):
            pass

    def on_error(self, ws: websocket.WebSocket, error: Exception) -> None:
        pass

    def on_close(
        self,
        ws: websocket.WebSocket,
        close_status_code: Optional[int] = None,
        close_msg: Optional[str] = None,
    ) -> None:
        pass

    def on_open(self, ws: websocket.WebSocket) -> None:
        def run(*_args: Any) -> None:
            d_dict = {
                "common": self.common_args,
                "business": self.business_args,
                "data": self.data,
            }
            d = json.dumps(d_dict)
            # print("------>开始发送文本数据")
            ws.send(d)
            # 删除之前的录音
            # if os.path.exists('./demo.MP3'):
            #     os.remove('./demo.MP3')

        threading.Thread(target=run).start()

    def run(self) -> Tuple[List[Dict[str, Any]], bytearray]:
        self.ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
        return self.messages, self.audio_data  # 返回消息和文件路径
