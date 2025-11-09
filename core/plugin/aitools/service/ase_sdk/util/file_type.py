def get_file_type(file_bytes: bytes) -> str:
    """
    获取文件类型

    Args:
        file_bytes: 文件二进制数据

    Returns:
        str: 文件类型

    """
    if file_bytes.startswith(b"\x89PNG"):
        return "PNG"
    elif file_bytes.startswith(b"\xff\xd8\xff"):
        return "JPG"
    elif file_bytes.startswith(b"BM"):
        return "BMP"  # BMP 文件以 'BM' 开头
    elif file_bytes.startswith(b"RIFF") and b"WEBP" in file_bytes:
        return "WebP"  # WebP 文件以 'RIFF' 开头并包含 'WEBP'
    elif file_bytes.startswith(b"II*\x00") or file_bytes.startswith(b"MM\x00*"):
        return "TIFF"  # TIFF 文件头 'II' 或 'MM' 表示小端/大端
    else:
        raise ValueError("Unsupported file type")
