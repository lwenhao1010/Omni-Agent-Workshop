"""
Session ID generator module for creating unique session identifiers.
"""

from __future__ import annotations

import os
import socket
import time
from functools import cache
from typing import Optional

from plugin.aitools.const.const import (
    SERVICE_LOCATION_KEY,
    SERVICE_PORT_KEY,
    SERVICE_SUB_KEY,
)


def new_sid() -> str:
    """
    description: 生成sid
    :return:
    """
    return get_sid_generate().gen()


@cache
def get_sid_generate() -> SidGenerator2:
    service_sub = os.getenv(SERVICE_SUB_KEY) or "default"
    service_location = os.getenv(SERVICE_LOCATION_KEY) or "default"
    service_port = os.getenv(SERVICE_PORT_KEY) or "18668"
    service_ip = get_host_ip()
    return SidGenerator2(service_sub, service_location, service_ip, service_port)


def get_host_ip() -> str:
    """
    description:查询本机ip
    """
    s: Optional[socket.socket] = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(3)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception as err:
        raise Exception(f"failed to get local ip, err reason {str(err)}") from err
    finally:
        if s is not None:
            s.close()

    return ip


class SidGenerator2:
    # 2.0架构专用后缀
    sid2 = 2

    def __init__(
        self, service_sub: str, service_location: str, host_ip: str, service_port: str
    ) -> None:
        self.index = 0
        ip = socket.inet_aton(host_ip)
        if ip:
            ip_sec3 = ip[2]
            ip_sec4 = ip[3]
            ip3 = ip_sec3 & 0xFF
            ip4 = ip_sec4 & 0xFF
            self.short_local_ip = f"{ip3:02x}{ip4:02x}"
        else:
            raise ValueError("Bad IP !! " + host_ip)
        if len(service_port) < 4:
            raise ValueError("Bad Port!! ")
        self.port = service_port
        self.location = service_location
        self.sub = service_sub

    def gen(self) -> str:
        if len(self.sub) == 0:
            self.sub = "src"
        pid = os.getpid() & 0xFF
        self.index = (self.index + 1) & 0xFFFF
        tm_int = int(time.time() * 1000)
        tm = format(tm_int, "011x")
        sid = f"{self.sub}{pid:04x}{self.index:04x}@{self.location}{tm[-11:]}\
            {self.short_local_ip}{self.port[:2]}{self.sid2}"
        return sid
