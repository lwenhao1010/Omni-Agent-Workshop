from typing import Optional

from plugin.aitools.service.ase_sdk.__base.entities.req_data import (
    BaseReqSourceData,
    ReqData,
)
from pydantic import BaseModel


class Credentials(BaseModel):
    app_id: str
    api_key: str
    api_secret: str
    auth_in_params: bool = False


class CommonReqSourceData(BaseReqSourceData):
    credentials: Optional[Credentials] = None
    req_data: Optional[ReqData] = None
