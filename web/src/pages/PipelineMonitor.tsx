import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface Goal {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
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
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped'
}

interface StoredGoals {
  projectName: string
  goals: Array<{
    id: string
    name: string
    description: string
    executor: string
    model: string
  }>
}

export default function PipelineMonitor() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 파이프라인 상태 폴링
  useEffect(() => {
    if (isRunning && executionId) {
      pollIntervalRef.current = setInterval(() => {
        fetchPipelineStatus(executionId)
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
  }, [isRunning, executionId])

  // 로그 자동 스크롤
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedGoalId, pipeline])

  // 파이프라인 상태 조회
  const fetchPipelineStatus = async (execId: string) => {
    try {
      const response = await axios.get(`/api/pipeline/status/${execId}`)
      setPipeline(response.data)
      setError(null)

      if (response.data.status === 'completed' || response.data.status === 'failed' || response.data.status === 'stopped') {
        setIsRunning(false)
      }
    } catch (err) {
      console.error('파이프라인 상태 조회 실패:', err)
      setError('파이프라인 상태를 불러올 수 없습니다')
    }
  }

  // 파이프라인 시작
  const startPipeline = async () => {
    try {
      setLoading(true)
      setError(null)

      // localStorage에서 저장된 Goals 불러오기
      const storedGoals = localStorage.getItem('ultragoalData')
      if (!storedGoals) {
        setError('저장된 Goal이 없습니다. Ultragoal 빌더에서 Goals를 설정해주세요.')
        setLoading(false)
        return
      }

      const goalsData: StoredGoals = JSON.parse(storedGoals)

      // 파이프라인 실행 API 호출
      const response = await axios.post('/api/pipeline/execute', {
        projectName: goalsData.projectName,
        goals: goalsData.goals
      })

      const newExecutionId = response.data.executionId
      setExecutionId(newExecutionId)
      setIsRunning(true)

      // 초기 상태 조회
      await fetchPipelineStatus(newExecutionId)

    } catch (err: any) {
      console.error('파이프라인 시작 실패:', err)
      setError(err.response?.data?.detail || '파이프라인을 시작할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  // 파이프라인 중지
  const stopPipeline = async () => {
    if (!executionId) return

    try {
      setLoading(true)
      await axios.post(`/api/pipeline/stop/${executionId}`)
      setIsRunning(false)
      setError(null)
    } catch (err) {
      console.error('파이프라인 중지 실패:', err)
      setError('파이프라인을 중지할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  // 새 파이프라인 생성
  const resetPipeline = () => {
    setPipeline(null)
    setExecutionId(null)
    setSelectedGoalId(null)
    setIsRunning(false)
    setError(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#95a5a6'
      case 'running': return '#f39c12'
      case 'completed': return '#27ae60'
      case 'failed': return '#e74c3c'
      case 'stopped': return '#7f8c8d'
      default: return '#7f8c8d'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ 대기 중'
      case 'running': return '⏳ 진행 중'
      case 'completed': return '✅ 완료'
      case 'failed': return '❌ 실패'
      case 'stopped': return '⏹️ 중지'
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

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <strong>⚠️ {error}</strong>
            </div>
          )}

          <button
            className="btn btn-success"
            onClick={startPipeline}
            disabled={loading}
            style={{ fontSize: '16px', padding: '12px 24px' }}
          >
            {loading ? '시작 중...' : '🎬 파이프라인 시작'}
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

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>⚠️ {error}</strong>
        </div>
      )}

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
            <button className="btn btn-danger" onClick={stopPipeline} disabled={loading}>
              ⏹️ 중지
            </button>
          )}
          {!isRunning && pipeline.status === 'idle' && (
            <button className="btn btn-success" onClick={startPipeline} disabled={loading}>
              🎬 시작
            </button>
          )}
          {(pipeline.status === 'completed' || pipeline.status === 'failed' || pipeline.status === 'stopped') && (
            <button className="btn btn-primary" onClick={resetPipeline}>
              🔄 새로 시작
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
                  {selectedGoal.logs.length === 0 ? (
                    <div style={{ color: '#95a5a6', textAlign: 'center', padding: '20px' }}>
                      로그가 없습니다
                    </div>
                  ) : (
                    selectedGoal.logs.map((log, idx) => (
                      <div key={idx} style={{
                        padding: '8px',
                        borderBottom: '1px solid #ecf0f1',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: log.includes('✅') ? '#27ae60' : log.includes('❌') ? '#e74c3c' : log.includes('⏳') ? '#f39c12' : '#d4d4d4'
                      }}>
                        {log}
                      </div>
                    ))
                  )}
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
