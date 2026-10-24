import { useEffect, useRef, useState, useCallback } from 'react'

interface PipelineStatus {
  projectName: string
  goals: any[]
  overallProgress: number
  startTime: string
  currentGoal?: string
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped'
}

export function usePipelineWebSocket(
  executionId: string | null,
  isRunning: boolean,
  onStatusUpdate: (status: PipelineStatus) => void,
  onError: (error: string) => void,
  useWebSocket: boolean = true
) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // WebSocket 연결 시도
  const connectWebSocket = useCallback(() => {
    if (!executionId || !isRunning || !useWebSocket) return

    try {
      const sessionId = 'default-session' // 세션 ID (필요시 동적으로 변경)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/pipeline/${sessionId}`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket 연결 성공')
        setIsConnected(true)
        // 초기 상태 요청
        if (wsRef.current) {
          wsRef.current.send(`status:${executionId}`)
        }
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'pipeline_status') {
            onStatusUpdate(message.data)
          }
        } catch (e) {
          console.error('메시지 파싱 오류:', e)
        }
      }

      wsRef.current.onerror = (event) => {
        console.error('WebSocket 오류:', event)
        onError('WebSocket 연결 오류')
        setIsConnected(false)
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket 연결 종료')
        setIsConnected(false)
        // 자동 재연결 (최대 5초)
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isRunning) {
            connectWebSocket()
          }
        }, 5000)
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      onError('WebSocket 연결 실패')
      setIsConnected(false)
    }
  }, [executionId, isRunning, onStatusUpdate, onError, useWebSocket])

  // HTTP 폴링 (WebSocket 사용 불가 시 폴백)
  const startPolling = useCallback(() => {
    if (!executionId || !isRunning) return

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/pipeline/status/${executionId}`)
        if (response.ok) {
          const data = await response.json()
          onStatusUpdate(data)
        }
      } catch (error) {
        console.error('폴링 오류:', error)
      }
    }, 1000) // 1초마다 폴링
  }, [executionId, isRunning, onStatusUpdate])

  // 연결/폴링 관리
  useEffect(() => {
    if (isRunning && executionId) {
      if (useWebSocket) {
        connectWebSocket()
      } else {
        startPolling()
      }
    }

    return () => {
      // 정리
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isRunning, executionId, connectWebSocket, startPolling, useWebSocket])

  // 수동으로 상태 요청
  const requestStatus = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && executionId) {
      wsRef.current.send(`status:${executionId}`)
    }
  }, [executionId])

  return {
    isConnected,
    requestStatus
  }
}
