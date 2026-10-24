from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.file_manager import FileManager
from utils.token_counter import TokenCounter

router = APIRouter()

class FileContent(BaseModel):
    content: str

class FileResponse(BaseModel):
    content: str
    size: int
    tokens: int
    path: str

@router.get("/read", response_model=FileResponse)
async def read_skills():
    """skills.md 읽기"""
    try:
        path = FileManager.get_skills_path()
        content = FileManager.read_skills()
        size = FileManager.get_file_size(path)
        tokens = TokenCounter.count_tokens(content)

        return FileResponse(
            content=content,
            size=size,
            tokens=tokens,
            path=path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/write")
async def write_skills(data: FileContent):
    """skills.md 쓰기"""
    try:
        FileManager.write_skills(data.content)
        path = FileManager.get_skills_path()
        size = FileManager.get_file_size(path)
        tokens = TokenCounter.count_tokens(data.content)

        return {
            "success": True,
            "message": "파일이 저장되었습니다",
            "size": size,
            "tokens": tokens,
            "path": path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
async def delete_skills():
    """skills.md 삭제"""
    try:
        path = FileManager.get_skills_path()
        result = FileManager.delete_file(path)

        if result:
            return {"success": True, "message": "파일이 삭제되었습니다"}
        else:
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/info")
async def get_skills_info():
    """skills.md 정보 조회"""
    try:
        path = FileManager.get_skills_path()
        exists = FileManager.file_exists(path)
        size = FileManager.get_file_size(path) if exists else 0
        content = FileManager.read_skills() if exists else ""
        tokens = TokenCounter.count_tokens(content)

        return {
            "path": path,
            "exists": exists,
            "size": size,
            "tokens": tokens,
            "size_mb": round(size / (1024 * 1024), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
