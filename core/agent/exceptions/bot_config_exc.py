from common_imports import BaseExc
from exceptions.codes import c_40050, c_40051, c_40052, c_40053


class BotConfigMgrExc(BaseExc):
    pass


BotConfigAddExc = BotConfigMgrExc(*c_40050)
BotConfigDeleteExc = BotConfigMgrExc(*c_40051)
BotConfigUpdateExc = BotConfigMgrExc(*c_40052)
BotConfigIsExistedExc = BotConfigMgrExc(*c_40053)
