import os
from pathlib import Path
from typing import Optional
import json

class FileManager:
    """로컬 파일 시스템 관리"""

    CLAUDE_PATH = Path.home() / ".claude" / "CLAUDE.md"
    SKILLS_PATH = Path.cwd() / ".omc" / "skills.md"

    @staticmethod
    def read_file(file_path: str) -> str:
        """파일 읽기"""
        try:
            path = Path(file_path).expanduser()
            if path.exists():
                return path.read_text(encoding="utf-8")
            return ""
        except Exception as e:
            raise Exception(f"파일 읽기 실패: {str(e)}")

    @staticmethod
    def write_file(file_path: str, content: str) -> bool:
        """파일 쓰기"""
        try:
            path = Path(file_path).expanduser()
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
            return True
        except Exception as e:
            raise Exception(f"파일 쓰기 실패: {str(e)}")

    @staticmethod
    def delete_file(file_path: str) -> bool:
        """파일 삭제"""
        try:
            path = Path(file_path).expanduser()
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception as e:
            raise Exception(f"파일 삭제 실패: {str(e)}")

    @staticmethod
    def get_file_size(file_path: str) -> int:
        """파일 크기 조회 (바이트)"""
        try:
            path = Path(file_path).expanduser()
            if path.exists():
                return path.stat().st_size
            return 0
        except Exception as e:
            raise Exception(f"파일 크기 조회 실패: {str(e)}")

    @staticmethod
    def file_exists(file_path: str) -> bool:
        """파일 존재 여부"""
        return Path(file_path).expanduser().exists()

    @staticmethod
    def get_claude_md_path() -> str:
        """CLAUDE.md 경로"""
        return str(FileManager.CLAUDE_PATH)

    @staticmethod
    def get_skills_path() -> str:
        """skills.md 경로"""
        return str(FileManager.SKILLS_PATH)

    @staticmethod
    def read_claude_md() -> str:
        """CLAUDE.md 읽기"""
        path = FileManager.get_claude_md_path()
        return FileManager.read_file(path)

    @staticmethod
    def write_claude_md(content: str) -> bool:
        """CLAUDE.md 쓰기"""
        path = FileManager.get_claude_md_path()
        return FileManager.write_file(path, content)

    @staticmethod
    def read_skills() -> str:
        """skills.md 읽기"""
        path = FileManager.get_skills_path()
        return FileManager.read_file(path)

    @staticmethod
    def write_skills(content: str) -> bool:
        """skills.md 쓰기"""
        path = FileManager.get_skills_path()
        return FileManager.write_file(path, content)
