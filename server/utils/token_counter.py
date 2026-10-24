import re
from pathlib import Path

class TokenCounter:
    """토큰 계산 유틸리티"""

    # 근사치 기반 토큰 계산 (1000자 ≈ 250 토큰)
    CHARS_PER_TOKEN = 4

    @staticmethod
    def count_tokens(text: str) -> int:
        """텍스트의 토큰 수 계산 (근사치)"""
        return max(1, len(text) // TokenCounter.CHARS_PER_TOKEN)

    @staticmethod
    def count_file_tokens(file_path: str) -> int:
        """파일의 토큰 수 계산"""
        try:
            path = Path(file_path).expanduser()
            if path.exists():
                content = path.read_text(encoding="utf-8")
                return TokenCounter.count_tokens(content)
            return 0
        except Exception:
            return 0

    @staticmethod
    def estimate_context_usage(files: dict) -> dict:
        """여러 파일의 컨텍스트 사용량 추정"""
        total_tokens = 0
        file_tokens = {}

        for name, path in files.items():
            tokens = TokenCounter.count_file_tokens(path)
            file_tokens[name] = tokens
            total_tokens += tokens

        return {
            "total_tokens": total_tokens,
            "file_tokens": file_tokens,
            "percent_used": min(100, (total_tokens / 200000) * 100),  # 200K 토큰 기준
            "tokens_remaining": max(0, 200000 - total_tokens)
        }

    @staticmethod
    def format_tokens(tokens: int) -> str:
        """토큰을 읽기 좋은 형식으로 변환"""
        if tokens >= 1000000:
            return f"{tokens / 1000000:.1f}M"
        elif tokens >= 1000:
            return f"{tokens / 1000:.1f}K"
        return str(tokens)
