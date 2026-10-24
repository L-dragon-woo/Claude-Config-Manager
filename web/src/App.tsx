import React, { useState } from 'react'
import './index.css'
import ClaudeMdEditor from './pages/ClaudeMdEditor'
import SkillsManager from './pages/SkillsManager'
import Dashboard from './pages/Dashboard'
import AIGuide from './pages/AIGuide'
import UltragoalBuilder from './pages/UltragoalBuilder'
import PipelineMonitor from './pages/PipelineMonitor'

type Page = 'dashboard' | 'claude-md' | 'skills' | 'ai-guide' | 'ultragoal' | 'pipeline' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'claude-md':
        return <ClaudeMdEditor />
      case 'skills':
        return <SkillsManager />
      case 'ai-guide':
        return <AIGuide />
      case 'ultragoal':
        return <UltragoalBuilder />
      case 'pipeline':
        return <PipelineMonitor />
      case 'settings':
        return <div className="content"><h2>설정</h2><p>준비 중입니다...</p></div>
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>⚙️ Claude Config Manager</h2>

        <div
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          📊 대시보드
        </div>

        <div
          className={`nav-item ${currentPage === 'claude-md' ? 'active' : ''}`}
          onClick={() => setCurrentPage('claude-md')}
        >
          📝 CLAUDE.md
        </div>

        <div
          className={`nav-item ${currentPage === 'skills' ? 'active' : ''}`}
          onClick={() => setCurrentPage('skills')}
        >
          🛠️ skills.md
        </div>

        <div
          className={`nav-item ${currentPage === 'ai-guide' ? 'active' : ''}`}
          onClick={() => setCurrentPage('ai-guide')}
        >
          🤖 AI 가이드
        </div>

        <div
          className={`nav-item ${currentPage === 'ultragoal' ? 'active' : ''}`}
          onClick={() => setCurrentPage('ultragoal')}
        >
          🎯 Ultragoal 빌더
        </div>

        <div
          className={`nav-item ${currentPage === 'pipeline' ? 'active' : ''}`}
          onClick={() => setCurrentPage('pipeline')}
        >
          🚀 파이프라인 모니터
        </div>

        <div
          className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          ⚡ 설정
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Claude 설정 관리 도구</h1>
        </div>

        {renderPage()}
      </div>
    </div>
  )
}

export default App
