import asyncio
import json
from typing import Dict, Set, Callable, Optional
from fastapi import WebSocket

class WebSocketManager:
    """WebSocket 연결을 관리합니다."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.execution_listeners: Dict[str, list] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        """WebSocket 연결을 추가합니다."""
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        """WebSocket 연결을 제거합니다."""
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, session_id: str, message: dict):
        """모든 클라이언트에게 메시지를 브로드캐스트합니다."""
        if session_id not in self.active_connections:
            return

        disconnected = set()
        for connection in self.active_connections[session_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"WebSocket 전송 실패: {e}")
                disconnected.add(connection)

        for connection in disconnected:
            self.disconnect(session_id, connection)

    async def send_to_client(self, session_id: str, websocket: WebSocket, message: dict):
        """특정 클라이언트에게 메시지를 전송합니다."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"WebSocket 전송 실패: {e}")
            self.disconnect(session_id, websocket)

    def register_listener(self, execution_id: str, callback: Callable):
        """실행 상태 변경 리스너를 등록합니다."""
        if execution_id not in self.execution_listeners:
            self.execution_listeners[execution_id] = []
        self.execution_listeners[execution_id].append(callback)

    async def notify_listeners(self, execution_id: str, event_type: str, data: dict):
        """등록된 리스너들에게 이벤트를 전달합니다."""
        if execution_id not in self.execution_listeners:
            return

        for callback in self.execution_listeners[execution_id]:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(event_type, data)
                else:
                    callback(event_type, data)
            except Exception as e:
                print(f"리스너 호출 실패: {e}")

    def get_active_sessions(self) -> list:
        """활성 세션 목록을 반환합니다."""
        return list(self.active_connections.keys())

    def get_session_client_count(self, session_id: str) -> int:
        """세션의 클라이언트 수를 반환합니다."""
        if session_id not in self.active_connections:
            return 0
        return len(self.active_connections[session_id])


# 전역 WebSocket 매니저
ws_manager = WebSocketManager()
