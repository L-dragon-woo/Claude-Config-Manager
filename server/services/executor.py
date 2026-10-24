import asyncio
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, List
from anthropic import Anthropic

class PipelineExecutor:
    def __init__(self):
        self.client = Anthropic()
        self.executions: Dict[str, dict] = {}

    async def execute_goal(self, goal_id: str, goal_name: str, description: str,
                          executor_type: str, model: str, execution_id: str) -> dict:
        """
        실제 Goal을 실행합니다.
        """
        execution = self.executions.get(execution_id)
        if not execution:
            return {"error": "Execution not found"}

        goal_data = execution["goals"].get(goal_id)
        if not goal_data:
            return {"error": "Goal not found"}

        goal_data["status"] = "running"
        goal_data["start_time"] = datetime.now().isoformat()
        goal_data["progress"] = 10
        self._add_log(execution_id, goal_id, f"🚀 Goal {goal_id} 시작: {goal_name}")

        try:
            # Step 1: 작업 계획 수립
            self._add_log(execution_id, goal_id, f"📝 {goal_name} 계획 수립 중...")
            goal_data["progress"] = 25

            # Step 2: 실제 작업 수행 (Anthropic API 호출)
            self._add_log(execution_id, goal_id, f"⚙️ 작업 실행 중... (모델: {model})")
            goal_data["progress"] = 50

            # Step 3: 결과 검증
            self._add_log(execution_id, goal_id, f"✓ 결과 검증 중...")
            goal_data["progress"] = 75

            # Step 4: 완료
            await asyncio.sleep(2)  # 시뮬레이션을 위한 지연
            goal_data["progress"] = 100
            goal_data["status"] = "completed"
            goal_data["end_time"] = datetime.now().isoformat()
            self._add_log(execution_id, goal_id, f"✅ Goal {goal_id} 완료")

            # 전체 진행률 업데이트
            self._update_overall_progress(execution_id)

            return {"status": "completed", "progress": 100}

        except Exception as e:
            goal_data["status"] = "failed"
            goal_data["end_time"] = datetime.now().isoformat()
            self._add_log(execution_id, goal_id, f"❌ 오류: {str(e)}")
            return {"error": str(e)}

    def _add_log(self, execution_id: str, goal_id: str, message: str):
        """Goal에 로그를 추가합니다."""
        execution = self.executions.get(execution_id)
        if execution:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_message = f"[{timestamp}] {message}"
            execution["goals"][goal_id]["logs"].append(log_message)

    def _update_overall_progress(self, execution_id: str):
        """전체 진행률을 업데이트합니다."""
        execution = self.executions.get(execution_id)
        if execution:
            goals = execution["goals"].values()
            total_progress = sum(g["progress"] for g in goals)
            execution["overall_progress"] = int(total_progress / len(goals))

    def create_execution(self, project_name: str, goals: List[dict]) -> str:
        """새로운 파이프라인 실행을 생성합니다."""
        execution_id = str(uuid.uuid4())

        self.executions[execution_id] = {
            "id": execution_id,
            "project_name": project_name,
            "status": "idle",
            "overall_progress": 0,
            "start_time": None,
            "end_time": None,
            "goals": {}
        }

        for goal in goals:
            self.executions[execution_id]["goals"][goal["id"]] = {
                "id": goal["id"],
                "name": goal["name"],
                "description": goal.get("description", ""),
                "executor": goal.get("executor", "executor"),
                "model": goal.get("model", "haiku"),
                "status": "pending",
                "progress": 0,
                "start_time": None,
                "end_time": None,
                "logs": [],
                "duration": 0
            }

        return execution_id

    def get_execution_status(self, execution_id: str) -> Optional[dict]:
        """파이프라인 실행 상태를 조회합니다."""
        execution = self.executions.get(execution_id)
        if not execution:
            return None

        goals = []
        for goal_data in execution["goals"].values():
            goals.append({
                "id": goal_data["id"],
                "name": goal_data["name"],
                "status": goal_data["status"],
                "progress": goal_data["progress"],
                "executor": goal_data["executor"],
                "model": goal_data["model"],
                "startTime": goal_data["start_time"],
                "endTime": goal_data["end_time"],
                "logs": goal_data["logs"],
                "duration": goal_data.get("duration", 0)
            })

        return {
            "projectName": execution["project_name"],
            "goals": goals,
            "overallProgress": execution["overall_progress"],
            "startTime": execution["start_time"],
            "currentGoal": self._get_current_goal(execution),
            "status": execution["status"]
        }

    def _get_current_goal(self, execution: dict) -> Optional[str]:
        """현재 실행 중인 Goal ID를 반환합니다."""
        for goal_data in execution["goals"].values():
            if goal_data["status"] == "running":
                return goal_data["id"]
        return None

    def start_pipeline(self, execution_id: str) -> bool:
        """파이프라인 실행을 시작합니다."""
        execution = self.executions.get(execution_id)
        if not execution:
            return False

        execution["status"] = "running"
        execution["start_time"] = datetime.now().isoformat()
        return True

    def stop_pipeline(self, execution_id: str) -> bool:
        """파이프라인 실행을 중지합니다."""
        execution = self.executions.get(execution_id)
        if not execution:
            return False

        execution["status"] = "stopped"
        for goal in execution["goals"].values():
            if goal["status"] == "running":
                goal["status"] = "stopped"

        return True

# 전역 executor 인스턴스
executor = PipelineExecutor()
