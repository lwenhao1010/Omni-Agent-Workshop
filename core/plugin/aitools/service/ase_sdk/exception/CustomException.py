"""
Custom exception module defining exception types used in ASE SDK.
"""


class CustomException(Exception):
    code: int
    message: str

    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

    def __str__(self) -> str:
        return f"{self.code}: {self.message}"
