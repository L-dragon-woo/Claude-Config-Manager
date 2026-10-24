# Claude Config Manager

> Claude 사용자들을 위한 **설정 파일 관리 대시보드**

![Status](https://img.shields.io/badge/Status-Beta-blue)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-19-cyan)

Claude 사용자가 **CLAUDE.md**, **skills.md** 파일을 쉽게 관리하고, **컨텍스트 토큰 사용량**을 모니터링할 수 있는 웹 기반 관리 도구입니다.

## 🎯 핵심 기능

- **📝 CLAUDE.md 편집**: 설정 파일을 웹 에디터에서 직접 수정/저장/삭제
- **🛠️ skills.md 관리**: 에이전트 스킬 목록을 간편하게 관리
- **📊 컨텍스트 대시보드**: 토큰 사용량, 파일 크기, 남은 토큰 실시간 모니터링
- **🔄 실시간 동기화**: 파일 변경 사항 즉시 반영
- **📱 반응형 디자인**: 모바일/태블릿/데스크톱 모두 지원

## 🚀 빠른 시작

### 1️⃣ 백엔드 실행

```bash
cd server
pip install -r requirements.txt
python main.py
```

백엔드가 실행되면: http://localhost:8000 (Swagger UI: http://localhost:8000/docs)

### 2️⃣ 프론트엔드 실행

```bash
cd web
npm install
npm run dev
```

프론트엔드가 실행되면: http://localhost:5173

### 3️⃣ 웹 브라우저에서 접속

```
http://localhost:5173
```

## 📁 프로젝트 구조

```
Claude-Config-Manager/
├── server/                      # FastAPI 백엔드
│   ├── main.py                 # FastAPI 서버 메인
│   ├── requirements.txt         # Python 의존성
│   ├── routes/
│   │   ├── claude_md.py         # CLAUDE.md API (읽기/쓰기/삭제)
│   │   ├── skills.py            # skills.md API
│   │   └── context.py           # 컨텍스트 토큰 계산 API
│   └── utils/
│       ├── file_manager.py      # 파일 시스템 관리
│       └── token_counter.py     # 토큰 계산 엔진
│
├── web/                         # React 19 + Vite 프론트엔드
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx              # 메인 컴포넌트
│       ├── index.css            # 전역 스타일
│       └── pages/
│           ├── Dashboard.tsx     # 대시보드
│           ├── ClaudeMdEditor.tsx # CLAUDE.md 에디터
│           └── SkillsManager.tsx  # skills.md 관리
│
├── REQUIREMENTS.md              # 요구사항 명세
├── README.md                    # 이 파일
└── INSTALLATION.md              # 설치 가이드
```

## 📋 API 레퍼런스

### CLAUDE.md 관리
- `GET /api/claude-md/read` - 파일 읽기
- `POST /api/claude-md/write` - 파일 쓰기
- `DELETE /api/claude-md/delete` - 파일 삭제
- `GET /api/claude-md/info` - 파일 정보 조회

### skills.md 관리
- `GET /api/skills/read` - 파일 읽기
- `POST /api/skills/write` - 파일 쓰기
- `DELETE /api/skills/delete` - 파일 삭제
- `GET /api/skills/info` - 파일 정보 조회

### 컨텍스트 모니터링
- `GET /api/context/status` - 전체 컨텍스트 상태
- `GET /api/context/files` - 모든 파일 정보
- `GET /api/context/tokens-count` - 토큰 개수 계산

## 🛠️ 기술 스택

| 항목 | 기술 |
|------|------|
| **백엔드** | FastAPI, Python 3.10+ |
| **프론트엔드** | React 19, Vite, TypeScript |
| **에디터** | HTML textarea (향후 Monaco Editor 추가 예정) |
| **스타일** | CSS3 (vanilla) |
| **API** | RESTful API, Swagger UI |

## 📊 파일 경로

- **CLAUDE.md**: `~/.claude/CLAUDE.md`
- **skills.md**: `.omc/skills.md`

> 경로는 시스템 환경에 따라 자동으로 조정됩니다.

## 💡 사용 팁

1. **대시보드에서 모니터링**: 토큰 사용량을 실시간으로 확인
2. **정기적인 정리**: 불필요한 파일을 삭제하여 컨텍스트 최적화
3. **백업**: 중요한 설정은 별도로 백업하세요
4. **버전 관리**: Git으로 설정 파일 변경 이력 추적 (준비 중)

## ⚙️ 환경 설정

### .env 파일 (선택사항)

```bash
# 서버 설정
SERVER_PORT=8000
SERVER_HOST=0.0.0.0

# 컨텍스트 설정
MAX_TOKENS=200000
```

## 🐛 트러블슈팅

### 1. "파일을 찾을 수 없습니다" 에러

- CLAUDE.md를 처음 생성하는 경우 발생할 수 있습니다
- 에디터에서 내용을 입력 후 저장하면 자동으로 파일이 생성됩니다

### 2. CORS 에러

- 백엔드가 실행 중인지 확인: `http://localhost:8000/api/health`
- 프론트엔드 vite.config.ts의 proxy 설정 확인

### 3. 토큰 계산이 정확하지 않음

- 현재는 근사치 기반 계산 (1000자 ≈ 250 토큰)
- Anthropic API 정확한 계산 연동 예정

## 🚧 향후 계획

- [ ] Monaco Editor 통합 (문법 강조, 자동완성)
- [ ] 파일 버전 관리 (변경 이력)
- [ ] Git 자동 커밋
- [ ] 클라우드 백업
- [ ] 팀 공유 기능
- [ ] AI 기반 설정 최적화 제안

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🤝 기여

버그 리포트, 기능 제안, Pull Request는 언제든 환영합니다!

---

**Claude Config Manager** - Claude 설정 관리를 쉽게
