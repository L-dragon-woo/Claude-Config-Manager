from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
from pathlib import Path

# routes 임포트
from routes.claude_md import router as claude_md_router
from routes.skills import router as skills_router
from routes.context import router as context_router

app = FastAPI(
    title="Claude Config Manager API",
    description="Claude 설정 파일 및 컨텍스트 관리 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(claude_md_router, prefix="/api/claude-md", tags=["claude.me"])
app.include_router(skills_router, prefix="/api/skills", tags=["skills"])
app.include_router(context_router, prefix="/api/context", tags=["context"])

@app.get("/")
async def root():
    return {"message": "Claude Config Manager API", "status": "running"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "Claude Config Manager"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
