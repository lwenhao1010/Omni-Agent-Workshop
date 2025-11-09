from common_imports import BaseExc
from exceptions.codes import c_40022


class CotExc(BaseExc):
    pass


CotFormatIncorrectExc = CotExc(*c_40022)
