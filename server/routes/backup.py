from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.backup_service import backup_service

router = APIRouter(prefix="/api/backup", tags=["backup"])


class CreateBackupRequest(BaseModel):
    sourceDir: str
    description: str = ""


class RestoreBackupRequest(BaseModel):
    backupId: str
    targetDir: str


@router.post("/create")
async def create_backup(request: CreateBackupRequest) -> dict:
    """
    백업을 생성합니다.

    파라미터:
    - sourceDir: 백업할 디렉토리 경로
    - description: 백업 설명 (선택사항)
    """
    result = backup_service.create_backup(request.sourceDir, request.description)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/list")
async def list_backups() -> dict:
    """모든 백업 목록을 조회합니다."""
    return backup_service.list_backups()


@router.get("/{backup_id}")
async def get_backup_info(backup_id: str) -> dict:
    """특정 백업 정보를 조회합니다."""
    result = backup_service.get_backup_info(backup_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/restore")
async def restore_backup(request: RestoreBackupRequest) -> dict:
    """
    백업을 복원합니다.

    파라미터:
    - backupId: 복원할 백업 ID
    - targetDir: 복원할 디렉토리 경로
    """
    result = backup_service.restore_backup(request.backupId, request.targetDir)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.delete("/{backup_id}")
async def delete_backup(backup_id: str) -> dict:
    """백업을 삭제합니다."""
    result = backup_service.delete_backup(backup_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
