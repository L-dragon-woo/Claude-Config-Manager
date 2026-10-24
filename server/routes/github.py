from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.github_service import github_service

router = APIRouter(prefix="/api/github", tags=["github"])


class AutoCommitRequest(BaseModel):
    message: str
    files: dict  # {"path": "content"}


class CreatePRRequest(BaseModel):
    title: str
    description: str
    branch: str = "feature/auto"


class MergePRRequest(BaseModel):
    prNumber: int
    commitTitle: str = "Auto-merge"


@router.post("/info")
async def get_github_info() -> dict:
    """GitHub 저장소 정보를 조회합니다."""
    result = await github_service.get_repo_info()
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/auto-commit")
async def auto_commit(request: AutoCommitRequest) -> dict:
    """
    자동 커밋을 생성합니다.

    파라미터:
    - message: 커밋 메시지
    - files: 파일 경로와 내용 매핑
    """
    result = await github_service.auto_commit(request.message, request.files)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/create-pr")
async def create_pull_request(request: CreatePRRequest) -> dict:
    """
    자동 PR을 생성합니다.

    파라미터:
    - title: PR 제목
    - description: PR 설명
    - branch: 생성할 브랜치 이름
    """
    result = await github_service.create_pull_request(
        request.title,
        request.description,
        request.branch
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/merge-pr")
async def merge_pull_request(request: MergePRRequest) -> dict:
    """
    PR을 자동 머지합니다.

    파라미터:
    - prNumber: PR 번호
    - commitTitle: 머지 커밋 제목
    """
    result = await github_service.merge_pull_request(
        request.prNumber,
        request.commitTitle
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/status")
async def github_status() -> dict:
    """GitHub 연결 상태를 확인합니다."""
    return {
        "configured": github_service.is_configured(),
        "repo": github_service.repo,
        "owner": github_service.owner
    }
