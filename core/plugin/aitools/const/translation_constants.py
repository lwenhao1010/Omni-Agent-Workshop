"""
Translation service language definitions and constants
"""

from typing import Dict, Set

# Complete language code mapping (44 languages + Chinese)
SUPPORTED_LANGUAGES: Dict[str, str] = {
    "cn": "中文",
    "en": "英语",
    "ja": "日语",
    "ko": "韩语",
    "th": "泰语",
    "ru": "俄语",
    "bg": "保加利亚语",
    "uk": "乌克兰语",
    "vi": "越南语",
    "ms": "马来语",
    "id": "印尼语",
    "tl": "菲律宾语",
    "de": "德语",
    "es": "西班牙语",
    "fr": "法语",
    "cs": "捷克语",
    "ro": "罗马尼亚语",
    "sv": "瑞典语",
    "nl": "荷兰语",
    "pl": "波兰语",
    "ar": "阿拉伯语",
    "fa": "波斯语",
    "ps": "普什图语",
    "ur": "乌尔都语",
    "hi": "印地语",
    "bn": "孟加拉语",
    "ha": "豪萨语",
    "hu": "匈牙利语",
    "sw": "斯瓦希里语",
    "uz": "乌兹别克语",
    "zu": "祖鲁语",
    "el": "希腊语",
    "he": "希伯来语",
    "hy": "亚美尼亚语",
    "ka": "格鲁吉亚语",
    "yue": "广东话",
    "ii": "彝语",
    "nm": "外蒙语",
    "zua": "壮语",
    "kk": "外哈语",
    "tr": "土耳其语",
    "mn": "内蒙语",
    "kka": "内哈萨克语",
}

# Quick access sets and lists
VALID_LANGUAGE_CODES: Set[str] = set(SUPPORTED_LANGUAGES.keys())

# Translation constraints
REQUIRES_CHINESE_PIVOT: bool = True
CHINESE_LANGUAGE_CODE: str = "cn"


def is_valid_language_pair(source: str, target: str) -> bool:
    """Check if language pair is supported (requires Chinese as pivot)"""
    if source not in VALID_LANGUAGE_CODES or target not in VALID_LANGUAGE_CODES:
        return False
    return source == CHINESE_LANGUAGE_CODE or target == CHINESE_LANGUAGE_CODE


def get_supported_language_name(code: str) -> str:
    """Get language name by code"""
    return SUPPORTED_LANGUAGES.get(code, "Unknown")
