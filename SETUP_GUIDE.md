# Claude Config Manager - 완전 설정 가이드

Claude Config Manager를 설치하고 AI 가이드 기능을 사용하기 위한 모든 단계입니다.

## 🚀 빠른 설정 (5분)

### 1. Anthropic API 키 발급

1. [Anthropic Console](https://console.anthropic.com)에 접속
2. 계정 생성 또는 로그인
3. **API Keys** 메뉴에서 새 API 키 생성
4. API 키를 복사 (다시 보이지 않으므로 안전히 저장)

### 2. 환경 변수 설정

#### Windows

```powershell
# PowerShell에서 환경 변수 설정
$env:ANTHROPIC_API_KEY="your-api-key-here"

# 또는 .env 파일 생성
# server/.env 파일 생성:
ANTHROPIC_API_KEY=your-api-key-here
```

#### macOS / Linux

```bash
# .bash_profile, .zshrc에 추가
export ANTHROPIC_API_KEY="your-api-key-here"

# 또는 .env 파일 생성
# server/.env 파일 생성:
ANTHROPIC_API_KEY=your-api-key-here
```

### 3. 의존성 설치

```bash
# 백엔드
cd server
pip install -r requirements.txt

# 프론트엔드
cd ../web
npm install
```

### 4. 서버 실행

#### 터미널 1: 백엔드
```bash
cd server
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

#### 터미널 2: 프론트엔드
```bash
cd web
npm run dev
```

### 5. 브라우저에서 접속

```
http://localhost:5175
```

---

## 🤖 AI 가이드 기능 사용법

### 📖 가이드 탭

**CLAUDE.md 가이드**
- CLAUDE.md의 역할과 구조 학습
- 실제 설정 예제 확인
- 빠른 템플릿 생성

**skills.md 가이드**
- skills.md의 목적과 사용법 학습
- 에이전트 정의 방법 이해
- 팀별 템플릿 생성

### 💬 AI 채팅

사용자가 질문 → Claude AI가 실시간으로 답변

**예시 질문:**
```
- "claude.md를 처음 설정하려면 어떻게 해야 하나요?"
- "skills.md에서 여러 에이전트를 정의하는 방법은?"
- "팀 협업을 위한 claude.md 설정 예제를 보여줘"
- "스타트업에 맞는 skills.md 구조는?"
```

### 🎯 템플릿 생성

**CLAUDE.md 템플릿**
- 개인 개발자용
- 스타트업용
- 엔터프라이즈용

**skills.md 템플릿**
- 풀스택 개발자용
- 분산 팀용
- AI 전문팀용

---

## 🔧 심화 설정

### 커스텀 포트

```bash
# 백엔드 포트 변경
uvicorn main:app --port 9000

# 프론트엔드 포트 변경
npm run dev -- --port 3000
```

### 프록시 설정

프론트엔드와 백엔드가 다른 포트에서 실행 중이면, `web/vite.config.ts`에서 프록시 업데이트:

```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8001',  // 백엔드 주소
    changeOrigin: true
  }
}
```

### API 테스트

Swagger UI에서 API 테스트:
```
http://127.0.0.1:8001/docs
```

---

## 🆘 문제 해결

### "API 키가 없습니다" 에러

**원인:** Anthropic API 키가 설정되지 않음

**해결:**
```bash
# 환경 변수 확인
echo $ANTHROPIC_API_KEY  # macOS/Linux
echo %ANTHROPIC_API_KEY%  # Windows

# 또는 .env 파일에 설정
# server/.env
ANTHROPIC_API_KEY=sk-ant-...
```

### "포트가 이미 사용 중" 에러

```bash
# 다른 포트 사용
uvicorn main:app --port 8002
npm run dev -- --port 5174
```

### "모듈을 찾을 수 없습니다" 에러

```bash
# 가상 환경 재설정
cd server
rm -rf venv
python -m venv venv
source venv/bin/activate  # macOS/Linux 또는
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### AI 응답이 없습니다

1. **API 키 확인**
   ```bash
   # 키가 올바른지 확인
   python -c "import os; print(os.getenv('ANTHROPIC_API_KEY'))"
   ```

2. **요청 로그 확인**
   - 백엔드 콘솔에서 에러 메시지 확인
   - Swagger UI에서 직접 테스트

3. **API 사용량 확인**
   - [Anthropic Console](https://console.anthropic.com) 에서 사용량 확인

---

## 📊 API 엔드포인트

### 가이드 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/guide/guide/claude-md` | CLAUDE.md 가이드 조회 |
| GET | `/api/guide/guide/skills-md` | skills.md 가이드 조회 |
| POST | `/api/guide/guide/ask` | AI에게 질문 |
| POST | `/api/guide/guide/generate-template` | 템플릿 생성 |
| GET | `/api/guide/guide/examples` | 예제 조회 |

### 파일 관리 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/claude-md/read` | CLAUDE.md 읽기 |
| POST | `/api/claude-md/write` | CLAUDE.md 쓰기 |
| DELETE | `/api/claude-md/delete` | CLAUDE.md 삭제 |
| GET | `/api/skills/read` | skills.md 읽기 |
| POST | `/api/skills/write` | skills.md 쓰기 |
| DELETE | `/api/skills/delete` | skills.md 삭제 |

---

## 💡 유용한 팁

### 1. 정기적인 백업
```bash
# claude.md 백업
cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.backup

# skills.md 백업
cp .omc/skills.md .omc/skills.md.backup
```

### 2. 버전 관리
```bash
# Git으로 설정 파일 추적
git add ~/.claude/CLAUDE.md
git add .omc/skills.md
git commit -m "Update configurations"
```

### 3. AI 가이드 활용
- 새로운 설정 시작할 때 "빠른 템플릿 생성" 이용
- 이해가 안 되는 개념은 AI에게 질문
- 생성된 템플릿을 기반으로 커스터마이징

### 4. 성능 최적화
- 큰 파일은 주기적으로 정리
- 불필요한 에이전트 정의 제거
- 토큰 사용량 대시보드에서 모니터링

---

## 📚 추가 리소스

- **[Claude 문서](https://claude.ai/docs)** - Claude 공식 문서
- **[Anthropic API 가이드](https://docs.anthropic.com)** - API 레퍼런스
- **[FastAPI 문서](https://fastapi.tiangolo.com)** - 백엔드 프레임워크
- **[React 문서](https://react.dev)** - 프론트엔드 라이브러리

---

## 🎯 다음 단계

1. ✅ 설치 및 실행
2. ✅ AI 가이드로 학습
3. ✅ claude.md와 skills.md 작성
4. ✅ Claude Code에서 사용
5. 📈 지속적 개선 및 최적화

---

**문제가 있으신가요?** 
- 백엔드 콘솔 확인
- Swagger UI에서 API 테스트
- 환경 변수 재확인

**준비되셨나요?** 🚀 
http://localhost:5175 에서 시작하세요!
