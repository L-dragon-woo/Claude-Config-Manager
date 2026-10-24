import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface FileData {
  content: string
  size: number
  tokens: number
  path: string
}

export default function SkillsManager() {
  const [file, setFile] = useState<FileData | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadFile()
  }, [])

  const loadFile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/skills/read')
      setFile(response.data)
      setContent(response.data.content)
      setError('')
    } catch (err: any) {
      setError('파일을 불러올 수 없습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await axios.post('/api/skills/write', { content })
      setMessage('✅ 저장되었습니다!')
      setTimeout(() => setMessage(''), 3000)
      loadFile()
    } catch (err: any) {
      setMessage('❌ 저장 실패')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('skills.md를 삭제하시겠습니까?')) return

    try {
      await axios.delete('/api/skills/delete')
      setMessage('✅ 파일이 삭제되었습니다')
      setContent('')
      setTimeout(() => setMessage(''), 3000)
      loadFile()
    } catch (err: any) {
      setMessage('❌ 삭제 실패')
      console.error(err)
    }
  }

  if (loading) return <div className="content"><p>로딩 중...</p></div>

  return (
    <div className="content">
      <h2>🛠️ skills.md 관리자</h2>

      {file && (
        <div style={{ marginBottom: '15px', color: '#7f8c8d', fontSize: '14px' }}>
          <p>경로: {file.path}</p>
          <p>크기: {(file.size / 1024).toFixed(1)} KB | 토큰: {file.tokens}</p>
        </div>
      )}

      <div className="editor-container">
        <div className="editor">
          <label className="editor-label">📄 skills.md 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="skills.md 내용을 여기에 입력하세요..."
          />

          <div className="editor-actions">
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '저장 중...' : '💾 저장'}
            </button>
            <button className="btn btn-primary" onClick={loadFile}>
              🔄 새로고침
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              🗑️ 삭제
            </button>
          </div>

          {message && (
            <div
              className={`status-message ${
                message.includes('✅') ? 'status-success' : 'status-error'
              }`}
            >
              {message}
            </div>
          )}
          {error && (
            <div className="status-message status-error">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
