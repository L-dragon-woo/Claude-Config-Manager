from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import anthropic

router = APIRouter()

class GuideQuestion(BaseModel):
    question: str
    context: Optional[str] = None

class TemplateRequest(BaseModel):
    file_type: str  # "claude_md" or "skills_md"
    use_case: str

def get_claude_md_guide() -> str:
    """CLAUDE.md 기본 가이드"""
    return """
# CLAUDE.md 란?

CLAUDE.md는 Claude Code에서 당신의 개인 설정 파일입니다.

## 📋 역할
- **프로젝트별 커스텀 지시사항** 작성
- **선호도 설정** (코드 스타일, 언어 등)
- **팀 규칙** 정의
- **보안 정책** 명시

## 🎯 주요 섹션

### 1. Operating Principles (운영 원칙)
당신의 작업 방식과 선호사항을 정의합니다.

예:
```
- 항상 테스트를 먼저 작성
- 성능보다 가독성 우선
- 주석은 최소한으로만
```

### 2. Delegation Rules (위임 규칙)
특정 작업을 어떤 에이전트에게 위임할지 정합니다.

예:
```
- 코드 리뷰 → code-reviewer 에이전트
- 문서 작성 → writer 에이전트
- 보안 검토 → security-reviewer 에이전트
```

### 3. Model Routing (모델 라우팅)
작업별로 사용할 Claude 모델을 지정합니다.

예:
```
- 빠른 작업 → haiku
- 표준 작업 → sonnet
- 복잡한 작업 → opus
```

## 💡 작성 팁

1. **명확하게**: 모호한 표현 피하기
2. **구체적으로**: 예제 포함
3. **유연하게**: 예외 상황 고려
4. **정기 업데이트**: 프로젝트 변화에 맞춰 수정

## 🔒 포함하면 안 될 것

❌ 개인 정보
❌ 비밀번호나 API 키
❌ 민감한 비즈니스 정보
❌ 보안 취약점 정보
"""

def get_skills_md_guide() -> str:
    """skills.md 기본 가이드"""
    return """
# skills.md 란?

skills.md는 Claude Code에서 사용 가능한 커스텀 에이전트와 스킬을 정의합니다.

## 📋 역할
- **커스텀 에이전트 정의** (역할, 능력, 도구)
- **특화된 스킬** 나열
- **팀 역할** 분담
- **자동화 워크플로우** 설정

## 🎯 주요 섹션

### 1. Agent Definition (에이전트 정의)
특정 역할을 수행하는 에이전트를 정의합니다.

예:
```
## api-specialist
- 역할: API 설계 및 구현
- 능력: RESTful, GraphQL, gRPC
- 도구: Postman, Swagger UI
- 모델: Sonnet
```

### 2. Workflow Automation (워크플로우 자동화)
반복적인 작업을 자동화합니다.

예:
```
## daily-standup-workflow
1. 어제 작업 요약
2. 오늘 목표 설정
3. 블로킹 이슈 확인
```

### 3. Team Roles (팀 역할)
팀 구성원의 역할을 명시합니다.

예:
```
## Frontend Lead
- 담당: React, Vue.js
- 리뷰 대상: 모든 웹 코드
- 의사결정: UI/UX 관련
```

## 💡 작성 팁

1. **명확한 이름**: 역할을 쉽게 알아볼 수 있게
2. **책임 범위**: 무엇을 하고 안 하는지 명시
3. **예제 포함**: 구체적인 사용 예시
4. **정기 리뷰**: 3개월마다 업데이트

## 🔧 활용 예시

### 개발팀
- Backend Engineer, Frontend Engineer, DevOps Engineer 정의
- 각자의 도구와 라이브러리 명시
- 리뷰 프로세스 정의

### 스타트업
- 다중역할 에이전트 정의 (Full-Stack Developer)
- 자동화 워크플로우로 효율성 극대화

### 개인 프로젝트
- 여러 특화된 에이전트 정의 (Writer, Coder, Reviewer)
- 워크플로우로 품질 관리 자동화
"""

@router.get("/guide/claude-md")
async def get_claude_md_guide_endpoint():
    """CLAUDE.md 가이드 조회"""
    return {
        "title": "CLAUDE.md 설정 가이드",
        "content": get_claude_md_guide(),
        "difficulty": "beginner"
    }

@router.get("/guide/skills-md")
async def get_skills_md_guide_endpoint():
    """skills.md 가이드 조회"""
    return {
        "title": "skills.md 설정 가이드",
        "content": get_skills_md_guide(),
        "difficulty": "intermediate"
    }

@router.post("/guide/ask")
async def ask_ai_guide(question: GuideQuestion):
    """AI에게 claude.md 또는 skills.md 관련 질문"""
    try:
        client = anthropic.Anthropic()

        system_prompt = """당신은 Claude Code 설정 전문가입니다.
사용자가 claude.md와 skills.md 설정에 대해 질문하면:

1. 명확하고 친절하게 설명
2. 구체적인 예제 제시
3. 베스트 프랙티스 권장
4. 사용자의 상황에 맞춘 조언

사용자의 컨텍스트: {context}

항상 실용적이고 이해하기 쉬운 답변을 제공하세요.""".format(
            context=question.context or "일반적인 사용"
        )

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": question.question}
            ]
        )

        return {
            "answer": message.content[0].text,
            "model": "claude-3-5-sonnet-20241022"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/guide/generate-template")
async def generate_template(request: TemplateRequest):
    """AI가 맞춤형 템플릿 생성"""
    try:
        client = anthropic.Anthropic()

        if request.file_type == "claude_md":
            prompt = f"""다음 사용 사례에 맞는 CLAUDE.md 템플릿을 생성해주세요:

사용 사례: {request.use_case}

마크다운 형식으로 작성하고:
1. Operating Principles
2. Delegation Rules
3. Model Routing
4. Verification
섹션을 포함해주세요.

실용적이고 바로 사용할 수 있는 템플릿을 원합니다."""
        else:  # skills_md
            prompt = f"""다음 사용 사례에 맞는 skills.md 템플릿을 생성해주세요:

사용 사례: {request.use_case}

마크다운 형식으로 작성하고:
1. Agent Definitions
2. Workflow Automation (해당하는 경우)
3. Team Roles (해당하는 경우)
섹션을 포함해주세요.

실용적이고 바로 사용할 수 있는 템플릿을 원합니다."""

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return {
            "template": message.content[0].text,
            "file_type": request.file_type,
            "use_case": request.use_case,
            "model": "claude-3-5-sonnet-20241022"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/guide/examples")
async def get_examples(file_type: str = "claude_md"):
    """실제 예제 조회"""
    examples = {
        "claude_md": {
            "titles": ["개인 개발자용", "스타트업용", "엔터프라이즈용"],
            "descriptions": [
                "자유도 높은 설정",
                "팀 협업 중심",
                "엄격한 정책과 자동화"
            ]
        },
        "skills_md": {
            "titles": ["풀스택 개발자", "분산 팀", "AI 전문팀"],
            "descriptions": [
                "다양한 도구와 언어",
                "시간대별 역할 분담",
                "AI 에이전트 특화"
            ]
        }
    }

    return {
        "examples": examples.get(file_type, {}),
        "file_type": file_type
    }
