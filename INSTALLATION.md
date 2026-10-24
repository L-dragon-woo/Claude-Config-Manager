# 설치 가이드

Claude Config Manager를 설치하고 실행하는 방법을 설명합니다.

## 📋 사전 요구사항

- **Python 3.10 이상**
- **Node.js 18 이상**
- **npm 또는 pnpm**

## 🔧 설치 단계

### 1. 저장소 클론 또는 다운로드

```bash
# 저장소 클론 (GitHub 사용 시)
git clone <repository-url>
cd Claude-Config-Manager

# 또는 폴더 다운로드
unzip Claude-Config-Manager.zip
cd Claude-Config-Manager
```

### 2. 백엔드 설치

```bash
cd server

# Python 가상 환경 생성 (선택사항이지만 권장)
python -m venv venv

# 가상 환경 활성화
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

### 3. 프론트엔드 설치

```bash
cd ../web

# 의존성 설치
npm install
# 또는
pnpm install
```

## ▶️ 실행 방법

### 터미널 1: 백엔드 서버 실행

```bash
cd server

# 가상 환경 활성화 (필요시)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# 서버 실행
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**성공 메시지:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 터미널 2: 프론트엔드 개발 서버 실행

```bash
cd web

# 개발 서버 실행
npm run dev
# 또는
pnpm dev
```

**성공 메시지:**
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
```

### 4. 웹 브라우저에서 접속

```
http://localhost:5173
```

## 🧪 API 테스트 (선택사항)

### Swagger UI에서 API 테스트

```
http://localhost:8000/docs
```

### curl 명령어로 테스트

```bash
# CLAUDE.md 읽기
curl http://localhost:8000/api/claude-md/read

# 컨텍스트 상태 확인
curl http://localhost:8000/api/context/status

# 헬스 체크
curl http://localhost:8000/api/health
```

## 📁 파일 경로 설정

기본적으로 다음 경로를 사용합니다:

- **CLAUDE.md**: `~/.claude/CLAUDE.md`
- **skills.md**: `.omc/skills.md`

커스텀 경로를 사용하려면 `server/utils/file_manager.py`의 경로를 수정하세요:

```python
# file_manager.py
CLAUDE_PATH = Path.home() / ".claude" / "CLAUDE.md"  # 수정
SKILLS_PATH = Path.cwd() / ".omc" / "skills.md"      # 수정
```

## 🌐 원격 서버 배포

### Ubuntu/Linux 서버 배포 (예시)

```bash
# 1. 서버 접속
ssh user@server-ip

# 2. 저장소 클론
git clone <repository-url>
cd Claude-Config-Manager

# 3. Python 환경 설정
python3 -m venv venv
source venv/bin/activate
pip install -r server/requirements.txt

# 4. Node.js 환경 설정 및 빌드
cd web
npm install
npm run build
cd ..

# 5. PM2로 백엔드 실행 (선택)
npm install -g pm2
pm2 start "cd server && python main.py" --name claude-config-manager

# 6. Nginx 설정 (선택)
# web/dist를 웹 서버 루트에 배치
# API는 :8000으로 프록시
```

## 🐳 Docker 배포 (향후)

```dockerfile
# Dockerfile 구성 예정
FROM python:3.10-slim
# ...
```

## 🔒 보안 설정

### 프로덕션 환경에서 주의사항

1. **CORS 설정**: 신뢰할 수 있는 도메인만 허용
   ```python
   # main.py
   origins = ["https://yourdomain.com"]
   ```

2. **인증 추가** (향후)
   - JWT 토큰 기반 인증

3. **HTTPS 사용**
   - SSL/TLS 인증서 설정

4. **파일 접근 제어**
   - 사용자별 파일 접근 권한 관리

## 🆘 문제 해결

### 포트 충돌

```bash
# 포트 8000이 이미 사용 중인 경우
python main.py --port 8001

# 포트 5173이 이미 사용 중인 경우
npm run dev -- --port 5174
```

### Python 모듈 에러

```bash
# 가상 환경 재설정
rm -rf server/venv
python -m venv server/venv
source server/venv/bin/activate
pip install -r server/requirements.txt
```

### Node 모듈 에러

```bash
# node_modules 재설치
cd web
rm -rf node_modules package-lock.json
npm install
```

### CLAUDE.md 경로 문제

```bash
# 파일이 없는 경우, 수동으로 생성
mkdir -p ~/.claude
touch ~/.claude/CLAUDE.md
```

## 📚 추가 리소스

- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [React 문서](https://react.dev/)
- [Vite 문서](https://vitejs.dev/)

---

**설치 완료!** 이제 Claude Config Manager를 즐길 준비가 되었습니다. 🎉
