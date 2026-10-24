import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIGuide() {
  const [activeTab, setActiveTab] = useState<'claude-md' | 'skills-md' | 'chat'>('claude-md')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [guideContent, setGuideContent] = useState('')
  const [guideTitle, setGuideTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 가이드 로드
  const loadGuide = async (type: 'claude-md' | 'skills-md') => {
    try {
      setLoading(true)
      const endpoint = type === 'claude-md' ? '/api/guide/guide/claude-md' : '/api/guide/guide/skills-md'
      const response = await axios.get(endpoint)
      setGuideTitle(response.data.title)
      setGuideContent(response.data.content)
      setActiveTab(type)
    } catch (error) {
      console.error('가이드 로드 실패:', error)
      setGuideContent('가이드를 로드할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  // AI에게 질문
  const handleAskQuestion = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setMessages([...messages, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await axios.post('/api/guide/guide/ask', {
        question: userMessage,
        context: activeTab === 'claude-md' ? 'CLAUDE.md 설정' : 'skills.md 설정'
      })

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.answer }
      ])
    } catch (error: any) {
      console.error('AI 응답 오류:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '죄송합니다. 답변을 생성할 수 없습니다. API 키를 확인해주세요.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 템플릿 생성
  const generateTemplate = async (fileType: string, useCase: string) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/guide/guide/generate-template', {
        file_type: fileType,
        use_case: useCase
      })

      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: `"${useCase}"에 맞는 템플릿 생성 요청`
        },
        {
          role: 'assistant',
          content: `생성된 템플릿:\n\n${response.data.template}`
        }
      ])
      setActiveTab('chat')
    } catch (error) {
      console.error('템플릿 생성 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <h2>🤖 AI 가이드 & 템플릿</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        claude.md와 skills.md에 대해 AI와 대화하며 배우고, 맞춤형 템플릿을 생성할 수 있습니다.
      </p>

      <div className="guide-tabs">
        <button
          className={`tab ${activeTab === 'claude-md' ? 'active' : ''}`}
          onClick={() => loadGuide('claude-md')}
        >
          📝 CLAUDE.md 가이드
        </button>
        <button
          className={`tab ${activeTab === 'skills-md' ? 'active' : ''}`}
          onClick={() => loadGuide('skills-md')}
        >
          🛠️ skills.md 가이드
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 AI 채팅
        </button>
      </div>

      {/* 가이드 탭 */}
      {(activeTab === 'claude-md' || activeTab === 'skills-md') && (
        <div className="guide-container">
          <div className="guide-content">
            {loading ? (
              <p>로딩 중...</p>
            ) : guideContent ? (
              <div>
                <h3>{guideTitle}</h3>
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                >
                  {guideContent}
                </div>

                <div style={{ marginTop: '30px' }}>
                  <h4>🎯 빠른 템플릿 생성</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {activeTab === 'claude-md' ? (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => generateTemplate('claude_md', '개인 개발자')}
                        >
                          개인 개발자
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => generateTemplate('claude_md', '스타트업')}
                        >
                          스타트업
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => generateTemplate('claude_md', '엔터프라이즈')}
                        >
                          엔터프라이즈
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => generateTemplate('skills_md', '풀스택 개발자')}
                        >
                          풀스택 개발자
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => generateTemplate('skills_md', '분산 팀')}
                        >
                          분산 팀
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => generateTemplate('skills_md', 'AI 전문팀')}
                        >
                          AI 전문팀
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>가이드 내용이 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {/* 채팅 탭 */}
      {activeTab === 'chat' && (
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>
                <p>💬 AI에게 질문하세요!</p>
                <p style={{ fontSize: '12px' }}>
                  "claude.md를 어떻게 설정하나요?"<br />
                  "skills.md에서 에이전트를 어떻게 정의하나요?"<br />
                  등의 질문을 할 수 있습니다.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-role">
                  {msg.role === 'user' ? '👤 당신' : '🤖 AI'}
                </div>
                <div
                  className="message-content"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant-message">
                <div className="message-role">🤖 AI</div>
                <div className="message-content">
                  생각 중...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleAskQuestion()
                }
              }}
              placeholder="AI에게 질문하세요... (엔터로 전송)"
              disabled={loading}
            />
            <button
              className="btn btn-success"
              onClick={handleAskQuestion}
              disabled={loading || !input.trim()}
            >
              {loading ? '전송 중...' : '🚀 전송'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
