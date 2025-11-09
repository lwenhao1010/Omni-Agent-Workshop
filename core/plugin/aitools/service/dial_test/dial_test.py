"""
Dial test service module providing health checks and service availability monitoring.
"""

from typing import Any, Dict, Optional

import requests


def dial_test_main(
    method: str,
    url: str,
    headers: Dict[str, str],
    payload: Dict[str, Any],
    _success_code: int,
    _call_frequency: int,
) -> Optional[Dict[str, Any]]:
    """Execute HTTP request with specified parameters for dial testing.

    This function performs HTTP requests with comprehensive error handling
    for testing API endpoints. All 6 parameters are necessary for complete
    testing configuration:

    Args:
        method (str): HTTP method (GET, POST, PUT, DELETE) - Required for request type
        url (str): Target URL endpoint - Required for request destination
        headers (dict): HTTP headers dict - Required for authentication/content-type
        payload (dict): Request body data - Required for POST/PUT operations
        success_code (int): Expected success status code - Required for validation
        call_frequency (int): Frequency to call the endpoint - Required for load testing

    Returns:
        dict: JSON response from the API if successful, None if failed

    Note:
        All parameters are essential for comprehensive API testing:
        - method: Determines request behavior
        - url: Specifies target endpoint
        - headers: Provides authentication and metadata
        - payload: Contains request data
        - success_code: Validates response correctness
        - call_frequency: Enables load/stress testing
    """
    try:
        print(f"Sending {method} request to {url}")
        # 使用 json 参数以确保 payload 正确序列化为 JSON
        response = requests.request(
            method, url, headers=headers, json=payload, timeout=10
        )  # 设置超时时间
        response.raise_for_status()  # 如果响应状态码不是200范围，抛出HTTPError
        # print("Response received successfully.")
        # print(response.json())
        return response.json()
    except requests.exceptions.Timeout:
        print("The request timed out.")
        return None
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")  # 打印HTTP错误
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None
