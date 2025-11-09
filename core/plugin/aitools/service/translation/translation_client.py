"""
Translation client module providing Chinese text translation services using iFlytek API.

Supports bidirectional translation between Chinese and other languages including
English, Japanese, Korean, and Russian.
"""

import base64
import json
import logging
import os
from typing import Any, Dict, Tuple

import requests
from plugin.aitools.common.hmac_gen import assemble_auth_url
from plugin.aitools.const.translation_constants import (
    SUPPORTED_LANGUAGES,
    is_valid_language_pair,
)


class TranslationClient:
    """iFlytek machine translation client for Chinese text translation"""

    def __init__(self, app_id: str, api_key: str, api_secret: str):
        """
        Initialize translation client with iFlytek API credentials.

        Args:
            app_id: iFlytek application ID
            api_key: iFlytek API key
            api_secret: iFlytek API secret
        """
        self.app_id = app_id
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = os.getenv("TRANSLATION_URL")

    def _validate_input(
        self, text: str, source_language: str, target_language: str
    ) -> Tuple[bool, str]:
        """
        Validate translation input parameters.

        Args:
            text: Text to translate
            source_language: Source language code
            target_language: Target language code

        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        if not text or not text.strip():
            return False, "翻译文本不能为空"

        if len(text) > 5000:
            return False, "翻译文本超过5000字符限制"

        if not is_valid_language_pair(source_language, target_language):
            return False, f"不支持的语言组合: {source_language} -> {target_language}"

        return True, ""

    def _parse_translation_response(self, response_text: str) -> str:
        """
        Parse translation response and extract translated text.

        Args:
            response_text: Raw response text from API

        Returns:
            str: Extracted translated text
        """
        try:
            response_json = json.loads(response_text)
            if (
                "trans_result" in response_json
                and "dst" in response_json["trans_result"]
            ):
                return response_json["trans_result"]["dst"]
            else:
                # Fallback: return full response if structure is unexpected
                return response_text
        except json.JSONDecodeError:
            # Fallback: return raw text if it's not JSON
            return response_text

    def translate(
        self, text: str, target_language: str, source_language: str
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Translate text between Chinese and other languages.

        Args:
            text: Text to translate (max 5000 characters)
            target_language: Target language code (en/ja/ko/ru/cn)
            source_language: Source language code (auto/cn/en/ja/ko/ru)

        Returns:
            Tuple[bool, str, Dict]: (success, message, result)
        """
        try:
            # Input validation
            is_valid, error_msg = self._validate_input(
                text, source_language, target_language
            )
            if not is_valid:
                return False, error_msg, {}

            # Create request body
            request_body = {
                "header": {"app_id": self.app_id, "status": 3},
                "parameter": {
                    "its": {
                        "from": source_language,
                        "to": target_language,
                        "result": {},
                    }
                },
                "payload": {
                    "input_data": {
                        "encoding": "utf8",
                        "status": 3,
                        "text": base64.b64encode(text.encode("utf-8")).decode("utf-8"),
                    }
                },
            }

            # Generate authentication URL
            auth_url = assemble_auth_url(
                self.base_url,
                method="POST",
                api_key=self.api_key,
                api_secret=self.api_secret,
            )

            # Configure headers
            headers = {
                "content-type": "application/json",
                "host": "itrans.xf-yun.com",
                "app_id": self.app_id,
            }

            # Send request directly using requests
            response = requests.post(
                auth_url, data=json.dumps(request_body), headers=headers, timeout=30
            )

            # Parse response
            if response.status_code != 200:
                return (
                    False,
                    f"API请求失败: {response.status_code}",
                    {"error": response.text},
                )

            result_data = response.json()

            # Extract translation result
            if not ("payload" in result_data and "result" in result_data["payload"]):
                return False, "API返回数据格式错误", {"raw_response": result_data}

            # Decode base64 response
            response_text = base64.b64decode(
                result_data["payload"]["result"]["text"]
            ).decode("utf-8")

            # Parse and extract translated text
            translated_text = self._parse_translation_response(response_text)

            return (
                True,
                "翻译成功",
                {
                    "original_text": text,
                    "translated_text": translated_text,
                    "source_language": source_language,
                    "target_language": target_language,
                    # "raw_response": result_data
                },
            )

        except Exception as e:
            logging.error(f"Translation error: {str(e)}")
            return False, f"翻译过程中发生错误: {str(e)}", {}

    def get_supported_languages(self) -> Dict[str, str]:
        """
        Get supported language codes and names.

        Returns:
            Dict[str, str]: Language code to name mapping
        """
        return SUPPORTED_LANGUAGES.copy()
