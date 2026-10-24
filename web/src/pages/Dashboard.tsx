import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface ContextStatus {
  total_tokens: number
  tokens_remaining: number
  percent_used: number
  max_tokens: number
  files: Record<string, any>
}

export default function Dashboard() {
  const [status, setStatus] = useState<ContextStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/context/status')
      setStatus(response.data)
      setError('')
    } catch (err: any) {
      setError('컨텍스트 상태를 불러올 수 없습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="content"><p>로딩 중...</p></div>
  if (error) return <div className="content"><p style={{ color: 'red' }}>{error}</p></div>
  if (!status) return <div className="content"><p>데이터 없음</p></div>

  return (
    <div className="content">
      <h2>📊 컨텍스트 관리 대시보드</h2>

      <div className="dashboard" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3>전체 토큰 사용량</h3>
          <div className="stat-value">{status.total_tokens.toLocaleString()}</div>
          <div className="stat-label">/ {status.max_tokens.toLocaleString()} 토큰</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${status.percent_used}%` }}
            >
              {status.percent_used.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="card">
          <h3>남은 토큰</h3>
          <div className="stat-value" style={{ color: '#27ae60' }}>
            {status.tokens_remaining.toLocaleString()}
          </div>
          <div className="stat-label">사용 가능한 토큰</div>
        </div>

        <div className="card">
          <h3>CLAUDE.md</h3>
          <div className="stat-value">
            {status.files['CLAUDE.md']?.tokens.toLocaleString() || 0}
          </div>
          <div className="stat-label">
            {status.files['CLAUDE.md']?.exists ? '✅ 존재' : '❌ 없음'}
          </div>
          {status.files['CLAUDE.md']?.exists && (
            <div className="stat-label" style={{ marginTop: '5px' }}>
              {(status.files['CLAUDE.md']?.size / 1024).toFixed(1)} KB
            </div>
          )}
        </div>

        <div className="card">
          <h3>skills.md</h3>
          <div className="stat-value">
            {status.files['skills.md']?.tokens.toLocaleString() || 0}
          </div>
          <div className="stat-label">
            {status.files['skills.md']?.exists ? '✅ 존재' : '❌ 없음'}
          </div>
          {status.files['skills.md']?.exists && (
            <div className="stat-label" style={{ marginTop: '5px' }}>
              {(status.files['skills.md']?.size / 1024).toFixed(1)} KB
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button
          className="btn btn-primary"
          onClick={fetchStatus}
          style={{ marginBottom: '20px' }}
        >
          🔄 새로 고침
        </button>

        <div style={{ marginTop: '20px' }}>
          <h3>💡 팁</h3>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>CLAUDE.md와 skills.md를 편집하여 설정을 관리할 수 있습니다</li>
            <li>컨텍스트 토큰이 200K를 초과하면 성능이 저하될 수 있습니다</li>
            <li>정기적으로 불필요한 파일을 정리하세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
