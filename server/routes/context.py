from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.file_manager import FileManager
from utils.token_counter import TokenCounter

router = APIRouter()

@router.get("/status")
async def get_context_status():
    """컨텍스트 전체 상태 조회"""
    try:
        claude_md_path = FileManager.get_claude_md_path()
        skills_path = FileManager.get_skills_path()

        # 각 파일의 토큰 계산
        files = {
            "CLAUDE.md": claude_md_path,
            "skills.md": skills_path
        }

        context = TokenCounter.estimate_context_usage(files)

        return {
            "total_tokens": context["total_tokens"],
            "tokens_remaining": context["tokens_remaining"],
            "percent_used": round(context["percent_used"], 2),
            "max_tokens": 200000,
            "files": {
                name: {
                    "tokens": context["file_tokens"].get(name, 0),
                    "path": path,
                    "exists": FileManager.file_exists(path)
                }
                for name, path in files.items()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files")
async def get_all_files_info():
    """모든 설정 파일 정보 조회"""
    try:
        claude_md_path = FileManager.get_claude_md_path()
        skills_path = FileManager.get_skills_path()

        files = {}

        for name, path in [("CLAUDE.md", claude_md_path), ("skills.md", skills_path)]:
            if FileManager.file_exists(path):
                content = FileManager.read_file(path)
                size = FileManager.get_file_size(path)
                tokens = TokenCounter.count_tokens(content)

                files[name] = {
                    "path": path,
                    "size": size,
                    "size_mb": round(size / (1024 * 1024), 2),
                    "tokens": tokens,
                    "exists": True
                }
            else:
                files[name] = {
                    "path": path,
                    "size": 0,
                    "size_mb": 0,
                    "tokens": 0,
                    "exists": False
                }

        total_tokens = sum(f["tokens"] for f in files.values())
        total_size = sum(f["size"] for f in files.values())

        return {
            "files": files,
            "total_tokens": total_tokens,
            "total_size": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "tokens_remaining": max(0, 200000 - total_tokens)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tokens-count")
async def count_total_tokens():
    """전체 토큰 개수 계산"""
    try:
        claude_md_path = FileManager.get_claude_md_path()
        skills_path = FileManager.get_skills_path()

        claude_tokens = TokenCounter.count_file_tokens(claude_md_path)
        skills_tokens = TokenCounter.count_file_tokens(skills_path)

        total = claude_tokens + skills_tokens

        return {
            "claude_md_tokens": claude_tokens,
            "skills_tokens": skills_tokens,
            "total_tokens": total,
            "percent_used": round((total / 200000) * 100, 2),
            "tokens_remaining": max(0, 200000 - total)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
