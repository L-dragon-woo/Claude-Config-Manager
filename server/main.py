from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
from pathlib import Path

# routes 임포트
from routes.claude_md import router as claude_md_router
from routes.skills import router as skills_router
from routes.context import router as context_router
from routes.ai_guide import router as ai_guide_router
from routes.pipeline import router as pipeline_router

# services 임포트
from services.websocket_manager import ws_manager
from services.executor import executor

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
app.include_router(ai_guide_router, prefix="/api/guide", tags=["ai-guide"])
app.include_router(pipeline_router, tags=["pipeline"])

@app.get("/")
async def root():
    return {"message": "Claude Config Manager API", "status": "running"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "Claude Config Manager"}

# WebSocket 엔드포인트
@app.websocket("/ws/pipeline/{session_id}")
async def websocket_pipeline(websocket: WebSocket, session_id: str):
    """파이프라인 상태를 WebSocket으로 실시간 전송합니다."""
    await ws_manager.connect(session_id, websocket)
    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()

            # execution_id와 함께 상태 조회 요청
            if data.startswith("status:"):
                execution_id = data.split(":", 1)[1]
                status = executor.get_execution_status(execution_id)
                if status:
                    await ws_manager.send_to_client(session_id, websocket, {
                        "type": "pipeline_status",
                        "data": status
                    })
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id, websocket)
    except Exception as e:
        print(f"WebSocket 오류: {e}")
        ws_manager.disconnect(session_id, websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
