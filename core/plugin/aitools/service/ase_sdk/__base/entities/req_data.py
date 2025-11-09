from pydantic import BaseModel


class BaseReqSourceData(BaseModel):
    """
    请求原始数据数据，通过加工，转换，解析等操作，得到ReqData
    """


class ReqData(BaseModel):
    params: dict = {}
    body: dict = {}
    headers: dict = {}
    cookies: dict = {}
