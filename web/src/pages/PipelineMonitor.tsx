import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface Goal {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  executor: string
  model: string
  startTime?: string
  endTime?: string
  logs: string[]
  duration?: number
}

interface Pipeline {
  projectName: string
  goals: Goal[]
  overallProgress: number
  startTime: string
  currentGoal?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
}

export default function PipelineMonitor() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 파이프라인 상태 폴링
  useEffect(() => {
    if (isRunning) {
      pollIntervalRef.current = setInterval(() => {
        fetchPipelineStatus()
      }, 1000) // 1초마다 업데이트
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isRunning])

  // 로그 자동 스크롤
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedGoalId, pipeline])

  // 파이프라인 상태 조회
  const fetchPipelineStatus = async () => {
    try {
      const response = await axios.get('/api/pipeline/status')
      setPipeline(response.data)

      if (response.data.status === 'completed' || response.data.status === 'failed') {
        setIsRunning(false)
      }
    } catch (error) {
      console.error('파이프라인 상태 조회 실패:', error)
    }
  }

  // 더미 파이프라인 시작 (데모용)
  const startPipeline = () => {
    const demoPipeline: Pipeline = {
      projectName: 'AI 챗봇 개발 프로젝트',
      goals: [
        {
          id: 'G001',
          name: '백엔드 API 개발',
          status: 'running',
          progress: 65,
          executor: 'executor',
          model: 'sonnet',
          startTime: new Date().toISOString(),
          logs: [
            '[2026-10-25 00:00:00] 🚀 Goal G001 시작: 백엔드 API 개발',
            '[2026-10-25 00:00:05] 📝 FastAPI 서버 초기화 중...',
            '[2026-10-25 00:00:10] ✅ 서버 초기화 완료',
            '[2026-10-25 00:00:15] 🔧 API 엔드포인트 구현 중...',
            '[2026-10-25 00:00:45] ✅ 사용자 API 완성',
            '[2026-10-25 00:00:50] ✅ 상품 API 완성',
            '[2026-10-25 00:00:55] ⏳ 주문 API 구현 중... (65% 완료)',
          ]
        },
        {
          id: 'G002',
          name: '프론트엔드 UI 개발',
          status: 'pending',
          progress: 0,
          executor: 'designer',
          model: 'sonnet',
          logs: [
            '[2026-10-25 00:00:00] ⏳ 대기 중... (G001 완료 대기)'
          ]
        },
        {
          id: 'G003',
          name: '통합 테스트',
          status: 'pending',
          progress: 0,
          executor: 'qa-tester',
          model: 'sonnet',
          logs: [
            '[2026-10-25 00:00:00] ⏳ 대기 중... (G002 완료 대기)'
          ]
        },
        {
          id: 'G004',
          name: '배포',
          status: 'pending',
          progress: 0,
          executor: 'devops',
          model: 'haiku',
          logs: [
            '[2026-10-25 00:00:00] ⏳ 대기 중... (G003 완료 대기)'
          ]
        }
      ],
      overallProgress: 16,
      startTime: new Date().toISOString(),
      currentGoal: 'G001',
      status: 'running'
    }

    setPipeline(demoPipeline)
    setIsRunning(true)
    setSelectedGoalId('G001')
  }

  // 파이프라인 중지
  const stopPipeline = () => {
    setIsRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#95a5a6'
      case 'running': return '#f39c12'
      case 'completed': return '#27ae60'
      case 'failed': return '#e74c3c'
      default: return '#7f8c8d'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ 대기 중'
      case 'running': return '⏳ 진행 중'
      case 'completed': return '✅ 완료'
      case 'failed': return '❌ 실패'
      default: return status
    }
  }

  if (!pipeline) {
    return (
      <div className="content">
        <h2>🚀 파이프라인 모니터</h2>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Ultragoal 실행 상황을 실시간으로 모니터링합니다
          </p>
          <button className="btn btn-success" onClick={startPipeline} style={{ fontSize: '16px', padding: '12px 24px' }}>
            🎬 파이프라인 시작
          </button>
          <p style={{ color: '#7f8c8d', marginTop: '20px', fontSize: '12px' }}>
            💡 Tip: Ultragoal 빌더에서 설정한 목표가 여기서 진행 중인 상황으로 표시됩니다.
          </p>
        </div>
      </div>
    )
  }

  const selectedGoal = pipeline.goals.find(g => g.id === selectedGoalId)

  return (
    <div className="content">
      <h2>🚀 파이프라인 모니터</h2>

      {/* 프로젝트 정보 & 전체 진행률 */}
      <div className="pipeline-header">
        <div>
          <h3>{pipeline.projectName}</h3>
          <p style={{ color: '#7f8c8d', margin: '5px 0' }}>
            상태: <strong style={{ color: getStatusColor(pipeline.status) }}>
              {getStatusText(pipeline.status)}
            </strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isRunning && (
            <button className="btn btn-danger" onClick={stopPipeline}>
              ⏹️ 중지
            </button>
          )}
          {!isRunning && pipeline.status === 'idle' && (
            <button className="btn btn-success" onClick={startPipeline}>
              🎬 시작
            </button>
          )}
        </div>
      </div>

      {/* 전체 진행률 바 */}
      <div className="progress-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>전체 진행률</span>
          <span style={{ fontWeight: 'bold' }}>{pipeline.overallProgress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${pipeline.overallProgress}%` }}
          />
        </div>
      </div>

      <div className="pipeline-container">
        {/* 좌측: Goal 파이프라인 */}
        <div className="pipeline-left">
          <h3 style={{ marginBottom: '15px' }}>📋 Goal 파이프라인</h3>

          <div className="pipeline-flow">
            {pipeline.goals.map((goal, idx) => (
              <div key={goal.id}>
                <div
                  className="pipeline-goal"
                  style={{
                    borderColor: getStatusColor(goal.status),
                    backgroundColor: selectedGoalId === goal.id ? '#f0f0f0' : '#fff',
                    cursor: 'pointer',
                    borderLeft: selectedGoalId === goal.id ? '4px solid #3498db' : '1px solid #bdc3c7'
                  }}
                  onClick={() => setSelectedGoalId(goal.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(goal.status),
                      animation: goal.status === 'running' ? 'pulse 1s infinite' : 'none'
                    }} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{goal.id}: {goal.name}</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        {goal.executor} / {goal.model}
                      </div>
                    </div>
                  </div>

                  {/* Goal별 진행률 */}
                  {goal.status !== 'pending' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        {goal.progress}%
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#ecf0f1',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${goal.progress}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(goal.status),
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '8px' }}>
                    {getStatusText(goal.status)}
                  </div>
                </div>

                {/* 화살표 */}
                {idx < pipeline.goals.length - 1 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px 0',
                    color: '#bdc3c7',
                    fontSize: '20px'
                  }}>
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 상세 정보 & 로그 */}
        <div className="pipeline-right">
          {selectedGoal ? (
            <div>
              <h3>{selectedGoal.id}: {selectedGoal.name}</h3>

              {/* 상세 정보 */}
              <div className="goal-details">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label>상태</label>
                    <div style={{ color: getStatusColor(selectedGoal.status), fontWeight: 'bold' }}>
                      {getStatusText(selectedGoal.status)}
                    </div>
                  </div>
                  <div>
                    <label>진행률</label>
                    <div style={{ fontWeight: 'bold' }}>{selectedGoal.progress}%</div>
                  </div>
                  <div>
                    <label>담당자</label>
                    <div>{selectedGoal.executor}</div>
                  </div>
                  <div>
                    <label>모델</label>
                    <div>{selectedGoal.model}</div>
                  </div>
                  {selectedGoal.duration && (
                    <div>
                      <label>소요 시간</label>
                      <div>{selectedGoal.duration.toFixed(1)}초</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 로그 */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>📋 실행 로그</h4>
                <div className="logs-container">
                  {selectedGoal.logs.map((log, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      borderBottom: '1px solid #ecf0f1',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: log.includes('✅') ? '#27ae60' : log.includes('❌') ? '#e74c3c' : log.includes('⏳') ? '#f39c12' : '#34495e'
                    }}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '40px' }}>
              <p>👈 Goal을 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
