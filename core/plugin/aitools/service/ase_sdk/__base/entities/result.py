from pydantic import BaseModel


class Result(BaseModel):
    # 数据
    data: str = ""
    # 会话状态
    status: int = 0
