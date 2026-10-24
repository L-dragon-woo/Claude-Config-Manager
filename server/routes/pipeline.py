from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime
from services.executor import executor

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


class GoalInput(BaseModel):
    id: str
    name: str
    description: str = ""
    executor: str = "executor"
    model: str = "haiku"


class ExecutePipelineRequest(BaseModel):
    projectName: str
    goals: List[GoalInput]


class ExecutePipelineResponse(BaseModel):
    executionId: str
    status: str
    message: str


@router.post("/execute")
async def execute_pipeline(request: ExecutePipelineRequest) -> ExecutePipelineResponse:
    """
    파이프라인 실행을 시작합니다.

    파라미터:
    - projectName: 프로젝트 이름
    - goals: Goal 목록 (id, name, description, executor, model)

    반환:
    - executionId: 파이프라인 실행 ID (상태 조회에 사용)
    """
    try:
        # 1. 실행 생성
        goals = [g.dict() for g in request.goals]
        execution_id = executor.create_execution(request.projectName, goals)

        # 2. 파이프라인 시작
        executor.start_pipeline(execution_id)

        # 3. 백그라운드에서 Goal 실행 시작
        asyncio.create_task(_run_pipeline_background(execution_id, goals))

        return ExecutePipelineResponse(
            executionId=execution_id,
            status="started",
            message=f"파이프라인 실행 시작: {execution_id}"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{execution_id}")
async def get_pipeline_status(execution_id: str):
    """
    파이프라인 실행 상태를 조회합니다.

    파라미터:
    - execution_id: 파이프라인 실행 ID

    반환:
    - projectName: 프로젝트 이름
    - goals: Goal 목록 (상태, 진행률, 로그 포함)
    - overallProgress: 전체 진행률
    - status: 파이프라인 상태 (running, completed, failed, idle)
    """
    status = executor.get_execution_status(execution_id)
    if not status:
        raise HTTPException(status_code=404, detail="Execution not found")

    return status


@router.get("/logs/{execution_id}/{goal_id}")
async def get_goal_logs(execution_id: str, goal_id: str) -> dict:
    """
    Goal의 실행 로그를 조회합니다.

    파라미터:
    - execution_id: 파이프라인 실행 ID
    - goal_id: Goal ID

    반환:
    - logs: 로그 메시지 목록
    """
    execution = executor.executions.get(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    goal = execution["goals"].get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    return {"logs": goal["logs"]}


@router.post("/stop/{execution_id}")
async def stop_pipeline(execution_id: str) -> dict:
    """
    파이프라인 실행을 중지합니다.

    파라미터:
    - execution_id: 파이프라인 실행 ID
    """
    success = executor.stop_pipeline(execution_id)
    if not success:
        raise HTTPException(status_code=404, detail="Execution not found")

    return {"status": "stopped", "message": "파이프라인 중지됨"}


@router.get("/list")
async def list_executions() -> dict:
    """
    모든 파이프라인 실행 목록을 조회합니다.
    """
    executions = []
    for exec_id, exec_data in executor.executions.items():
        executions.append({
            "executionId": exec_id,
            "projectName": exec_data["project_name"],
            "status": exec_data["status"],
            "overallProgress": exec_data["overall_progress"],
            "startTime": exec_data["start_time"],
            "goalCount": len(exec_data["goals"])
        })

    return {"executions": executions}


# 백그라운드 작업: 파이프라인 실행
async def _run_pipeline_background(execution_id: str, goals: list):
    """백그라운드에서 파이프라인을 실행합니다."""
    try:
        for goal in goals:
            execution = executor.executions.get(execution_id)
            if not execution or execution["status"] != "running":
                break

            # Goal 실행
            await executor.execute_goal(
                goal_id=goal["id"],
                goal_name=goal["name"],
                description=goal.get("description", ""),
                executor_type=goal.get("executor", "executor"),
                model=goal.get("model", "haiku"),
                execution_id=execution_id
            )

            # 다음 Goal 전에 약간의 지연
            await asyncio.sleep(0.5)

        # 모든 Goal 완료
        execution = executor.executions.get(execution_id)
        if execution:
            execution["status"] = "completed"
            execution["end_time"] = datetime.now().isoformat()

    except Exception as e:
        execution = executor.executions.get(execution_id)
        if execution:
            execution["status"] = "failed"
            execution["end_time"] = datetime.now().isoformat()
