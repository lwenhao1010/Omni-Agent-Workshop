"""
HTTP request utility module providing HTTP client request functionality.

TODO: refactor input config type validation with Pydantic
"""

from typing import Any, Dict

import requests


class HttpRequest:
    def __init__(self, config: Dict[str, Any]) -> None:
        """
        初始化时传入配置字典 config，配置字典可以包含以下字段：
        - 'method': 请求方法（如 'GET', 'POST' 等）
        - 'url': 请求的 URL
        - 'headers': 请求头（可选）
        - 'params': 请求的 URL 参数（可选）
        - 'payload': 请求体数据（如 POST 请求体，可选）
        - 'timeout': 请求超时时间（可选）
        """
        self.config = config

    def send(self) -> requests.Response:
        # 提取方法、URL 和其他配置项
        method = self.config.get("method", "GET").upper()
        url = self.config.get("url", "")
        headers = self.config.get("headers", {})
        params = self.config.get("params", {})
        payload = self.config.get("payload", {})
        timeout = self.config.get("timeout", 10)

        # 使用 requests.request 来动态选择请求方法
        return requests.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            json=payload,
            timeout=timeout,
        )
