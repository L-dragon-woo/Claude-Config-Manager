import asyncio
from typing import Callable, Optional
from datetime import datetime


class GoalRunner:
    def __init__(self, execution_id: str, goal_id: str, goal_name: str,
                 description: str, executor_type: str, model: str,
                 on_log: Callable[[str], None],
                 on_progress: Callable[[int], None],
                 on_status_change: Callable[[str], None]):
        """
        개별 Goal을 실행하는 Runner입니다.

        Args:
            execution_id: 파이프라인 실행 ID
            goal_id: Goal ID
            goal_name: Goal 이름
            description: Goal 설명
            executor_type: 실행자 타입 (executor, designer, qa-tester, devops)
            model: Claude 모델 (haiku, sonnet, opus)
            on_log: 로그 콜백
            on_progress: 진행률 콜백
            on_status_change: 상태 변경 콜백
        """
        self.execution_id = execution_id
        self.goal_id = goal_id
        self.goal_name = goal_name
        self.description = description
        self.executor_type = executor_type
        self.model = model
        self.on_log = on_log
        self.on_progress = on_progress
        self.on_status_change = on_status_change
        self.status = "pending"
        self.start_time = None
        self.end_time = None

    async def run(self) -> bool:
        """Goal을 실행합니다."""
        try:
            self.status = "running"
            self.start_time = datetime.now()
            self.on_status_change("running")
            self.on_log(f"🚀 {self.goal_name} 시작")

            # Phase 1: 계획 수립
            await self._phase_planning()

            # Phase 2: 실행
            await self._phase_execution()

            # Phase 3: 검증
            await self._phase_validation()

            # Phase 4: 완료
            self.status = "completed"
            self.end_time = datetime.now()
            self.on_status_change("completed")
            self.on_log(f"✅ {self.goal_name} 완료")

            return True

        except Exception as e:
            self.status = "failed"
            self.end_time = datetime.now()
            self.on_status_change("failed")
            self.on_log(f"❌ {self.goal_name} 실패: {str(e)}")
            return False

    async def _phase_planning(self):
        """계획 수립 Phase"""
        self.on_log(f"📝 {self.goal_name}의 실행 계획 수립 중...")
        self.on_progress(15)

        # 시뮬레이션: 계획 수립
        await asyncio.sleep(1)

        steps = self._get_execution_steps()
        self.on_log(f"📋 실행 단계: {len(steps)}단계")
        for i, step in enumerate(steps):
            self.on_log(f"  {i + 1}. {step}")

    async def _phase_execution(self):
        """실행 Phase"""
        self.on_log(f"⚙️ {self.goal_name} 실행 중... (모델: {self.model})")
        self.on_progress(40)

        steps = self._get_execution_steps()
        for i, step in enumerate(steps):
            self.on_log(f"  ⏳ {step} 진행 중...")
            await asyncio.sleep(1)
            progress = 40 + int((i + 1) / len(steps) * 30)
            self.on_progress(progress)
            self.on_log(f"  ✓ {step} 완료")

    async def _phase_validation(self):
        """검증 Phase"""
        self.on_log(f"✓ {self.goal_name} 결과 검증 중...")
        self.on_progress(80)

        await asyncio.sleep(1)

        checks = [
            "구문 검사",
            "타입 검사",
            "로직 검증",
            "성능 검증"
        ]

        for check in checks:
            self.on_log(f"  • {check}... ✓")
            await asyncio.sleep(0.5)

        self.on_progress(95)

    def _get_execution_steps(self) -> list:
        """실행 단계를 반환합니다."""
        if self.executor_type == "executor":
            return [
                "코드 작성 및 구현",
                "종속성 설정",
                "API 통합",
                "에러 처리"
            ]
        elif self.executor_type == "designer":
            return [
                "UI 디자인",
                "CSS 스타일 적용",
                "반응형 레이아웃",
                "사용자 경험 검증"
            ]
        elif self.executor_type == "qa-tester":
            return [
                "테스트 케이스 작성",
                "기능 테스트",
                "엣지 케이스 테스트",
                "성능 테스트"
            ]
        else:  # devops
            return [
                "배포 준비",
                "환경 구성",
                "배포 실행",
                "헬스 체크"
            ]

    def get_duration(self) -> float:
        """Goal 실행 시간을 반환합니다 (초)."""
        if not self.start_time:
            return 0

        end = self.end_time or datetime.now()
        return (end - self.start_time).total_seconds()


class ParallelGoalRunner:
    """여러 Goal을 병렬로 실행합니다."""

    def __init__(self, execution_id: str, goals: list, on_log: Callable):
        self.execution_id = execution_id
        self.goals = goals
        self.on_log = on_log
        self.runners: dict = {}

    async def run_sequential(self):
        """Goal들을 순차적으로 실행합니다."""
        for goal in self.goals:
            runner = GoalRunner(
                execution_id=self.execution_id,
                goal_id=goal["id"],
                goal_name=goal["name"],
                description=goal.get("description", ""),
                executor_type=goal.get("executor", "executor"),
                model=goal.get("model", "haiku"),
                on_log=self.on_log,
                on_progress=lambda p: None,
                on_status_change=lambda s: None
            )
            self.runners[goal["id"]] = runner
            await runner.run()

    async def run_parallel(self, max_concurrent: int = 3):
        """Goal들을 병렬로 실행합니다 (최대 동시 실행 수: max_concurrent)."""
        semaphore = asyncio.Semaphore(max_concurrent)

        async def run_with_semaphore(goal):
            async with semaphore:
                runner = GoalRunner(
                    execution_id=self.execution_id,
                    goal_id=goal["id"],
                    goal_name=goal["name"],
                    description=goal.get("description", ""),
                    executor_type=goal.get("executor", "executor"),
                    model=goal.get("model", "haiku"),
                    on_log=self.on_log,
                    on_progress=lambda p: None,
                    on_status_change=lambda s: None
                )
                self.runners[goal["id"]] = runner
                await runner.run()

        tasks = [run_with_semaphore(goal) for goal in self.goals]
        await asyncio.gather(*tasks)
