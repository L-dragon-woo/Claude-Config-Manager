import React, { useState } from 'react'
import axios from 'axios'

interface Goal {
  id: string
  name: string
  description: string
  model: 'haiku' | 'sonnet' | 'opus'
  executor: string
  parallel: boolean
  successCriteria: string[]
}

export default function UltragoalBuilder() {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [goals, setGoals] = useState<Goal[]>([])
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [generatedConfig, setGeneratedConfig] = useState('')

  // 새 Goal 추가
  const addGoal = () => {
    const newGoal: Goal = {
      id: `G${String(goals.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      model: 'sonnet',
      executor: '',
      parallel: false,
      successCriteria: ['']
    }
    setGoals([...goals, newGoal])
    setCurrentGoalIndex(goals.length)
  }

  // Goal 삭제
  const deleteGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index))
    setCurrentGoalIndex(null)
  }

  // Goal 업데이트
  const updateGoal = (index: number, updates: Partial<Goal>) => {
    const newGoals = [...goals]
    newGoals[index] = { ...newGoals[index], ...updates }
    setGoals(newGoals)
  }

  // 성공 기준 추가
  const addCriteria = (goalIndex: number) => {
    const newGoals = [...goals]
    newGoals[goalIndex].successCriteria.push('')
    setGoals(newGoals)
  }

  // 성공 기준 업데이트
  const updateCriteria = (goalIndex: number, criteriaIndex: number, value: string) => {
    const newGoals = [...goals]
    newGoals[goalIndex].successCriteria[criteriaIndex] = value
    setGoals(newGoals)
  }

  // 성공 기준 삭제
  const deleteCriteria = (goalIndex: number, criteriaIndex: number) => {
    const newGoals = [...goals]
    newGoals[goalIndex].successCriteria = newGoals[goalIndex].successCriteria.filter(
      (_, i) => i !== criteriaIndex
    )
    setGoals(newGoals)
  }

  // CLAUDE.md 프리뷰 생성
  const generatePreview = () => {
    if (!projectName || goals.length === 0) {
      alert('프로젝트 이름과 최소 1개 이상의 Goal이 필요합니다.')
      return
    }

    let config = `# ${projectName} - Ultragoal 설정

**설명**: ${projectDescription}
**총 Goal 수**: ${goals.length}
**병렬 실행**: ${goals.some(g => g.parallel) ? '가능' : '미사용'}

---

## 📋 Goal 정의

`

    goals.forEach((goal, idx) => {
      config += `
### ${goal.id}: ${goal.name}
**설명**: ${goal.description}
**모델**: ${goal.model}
**담당자**: ${goal.executor}
**병렬 실행**: ${goal.parallel ? '✅ Yes' : '❌ No'}

**성공 기준**:
${goal.successCriteria.map(c => `- ${c || '(정의 필요)'}`).join('\n')}

---
`
    })

    config += `
## 🔄 실행 흐름

\`\`\`
${goals.map((g, i) => `${g.id} (${g.model}${g.parallel ? ' - 병렬' : ''})`).join(' → ')}
\`\`\`

## ⚙️ 모델 할당

| Goal | 모델 | 역할 |
|------|------|------|
${goals.map(g => `| ${g.id} | ${g.model} | ${g.executor} |`).join('\n')}

---

**생성일**: ${new Date().toLocaleDateString('ko-KR')}
**상태**: 준비 완료
`

    setGeneratedConfig(config)
    setPreviewMode(true)
  }

  // CLAUDE.md에 저장
  const saveToClaudeMd = async () => {
    try {
      await axios.post('/api/claude-md/write', {
        content: generatedConfig
      })
      alert('✅ CLAUDE.md에 저장되었습니다!')
      setPreviewMode(false)
    } catch (error) {
      alert('❌ 저장 실패: ' + (error as any).message)
    }
  }

  // 템플릿 로드
  const loadTemplate = (template: 'startup' | 'enterprise' | 'research') => {
    const templates = {
      startup: {
        projectName: '스타트업 MVP 개발',
        projectDescription: '빠른 프로토타입 개발 및 시장 진입',
        goals: [
          {
            id: 'G001',
            name: '백엔드 API 개발',
            description: 'RESTful API 구현 및 배포',
            model: 'sonnet' as const,
            executor: 'executor',
            parallel: false,
            successCriteria: ['API 명세 완성', '모든 엔드포인트 테스트']
          },
          {
            id: 'G002',
            name: '프론트엔드 UI 개발',
            description: '사용자 인터페이스 구현',
            model: 'sonnet' as const,
            executor: 'designer',
            parallel: true,
            successCriteria: ['UI 완성', '반응형 디자인', '접근성 준수']
          },
          {
            id: 'G003',
            name: 'QA 및 배포',
            description: '전체 통합 테스트 및 배포',
            model: 'sonnet' as const,
            executor: 'qa-tester',
            parallel: false,
            successCriteria: ['테스트 100% 통과', '배포 완료']
          }
        ]
      },
      enterprise: {
        projectName: '엔터프라이즈 시스템 개선',
        projectDescription: '대규모 시스템 리팩토링 및 성능 최적화',
        goals: [
          {
            id: 'G001',
            name: '아키텍처 설계',
            description: '전체 시스템 아키텍처 재설계',
            model: 'opus' as const,
            executor: 'architect',
            parallel: false,
            successCriteria: ['설계 문서 완성', '검토 완료']
          },
          {
            id: 'G002',
            name: '모듈 리팩토링',
            description: '각 모듈별 리팩토링 및 최적화',
            model: 'sonnet' as const,
            executor: 'executor',
            parallel: true,
            successCriteria: ['코드 커버리지 > 80%', '성능 개선 > 30%']
          },
          {
            id: 'G003',
            name: '통합 테스트',
            description: '전체 시스템 통합 및 테스트',
            model: 'sonnet' as const,
            executor: 'test-engineer',
            parallel: false,
            successCriteria: ['E2E 테스트 완료', '성능 검증']
          },
          {
            id: 'G004',
            name: '배포 및 모니터링',
            description: '프로덕션 배포 및 모니터링 설정',
            model: 'haiku' as const,
            executor: 'devops',
            parallel: false,
            successCriteria: ['무중단 배포', '모니터링 설정']
          }
        ]
      },
      research: {
        projectName: 'AI 연구 프로젝트',
        projectDescription: '새로운 AI 모델 개발 및 평가',
        goals: [
          {
            id: 'G001',
            name: '문헌 조사',
            description: '최신 연구 동향 분석',
            model: 'opus' as const,
            executor: 'researcher',
            parallel: false,
            successCriteria: ['문헌 리뷰 완료', '기초 분석']
          },
          {
            id: 'G002',
            name: '모델 구현',
            description: '새로운 알고리즘 구현',
            model: 'sonnet' as const,
            executor: 'ml-engineer',
            parallel: false,
            successCriteria: ['모델 완성', '단위 테스트']
          },
          {
            id: 'G003',
            name: '실험 및 평가',
            description: '모델 성능 평가',
            model: 'opus' as const,
            executor: 'scientist',
            parallel: false,
            successCriteria: ['벤치마크 완료', 'SOTA 달성']
          },
          {
            id: 'G004',
            name: '논문 작성',
            description: '연구 결과 논문 작성',
            model: 'haiku' as const,
            executor: 'writer',
            parallel: false,
            successCriteria: ['논문 완성', '저널 제출']
          }
        ]
      }
    }

    const template = templates[template]
    setProjectName(template.projectName)
    setProjectDescription(template.projectDescription)
    setGoals(template.goals)
    setCurrentGoalIndex(null)
  }

  const currentGoal = currentGoalIndex !== null ? goals[currentGoalIndex] : null

  return (
    <div className="content">
      <h2>🎯 Ultragoal 빌더</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        Ultragoal을 쉽게 설정하고 CLAUDE.md로 자동 생성합니다
      </p>

      {!previewMode ? (
        <div className="ultragoal-container">
          {/* 좌측: 프로젝트 정보 */}
          <div className="ultragoal-left">
            <div className="section">
              <h3>📋 프로젝트 정보</h3>

              <label>프로젝트 이름 *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="예: AI 챗봇 개발 프로젝트"
              />

              <label>설명</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="프로젝트 목표와 설명을 입력하세요"
                style={{ height: '80px' }}
              />

              <div style={{ marginTop: '20px' }}>
                <h4>📁 템플릿 로드</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => loadTemplate('startup')}
                    style={{ fontSize: '12px' }}
                  >
                    🚀 스타트업
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => loadTemplate('enterprise')}
                    style={{ fontSize: '12px' }}
                  >
                    🏢 엔터프라이즈
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => loadTemplate('research')}
                    style={{ fontSize: '12px' }}
                  >
                    🔬 연구
                  </button>
                </div>
              </div>
            </div>

            {/* Goal 리스트 */}
            <div className="section" style={{ marginTop: '20px' }}>
              <h3>🎯 Goal 목록 ({goals.length})</h3>

              {goals.length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>Goal을 추가해주세요</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {goals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="goal-item"
                      style={{
                        padding: '12px',
                        border: currentGoalIndex === idx ? '2px solid #3498db' : '1px solid #bdc3c7',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: currentGoalIndex === idx ? '#ecf0f1' : '#fff',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setCurrentGoalIndex(idx)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{goal.id}</strong> - {goal.name || '(이름 입력)'}
                          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                            {goal.model} {goal.parallel ? '(병렬)' : ''}
                          </div>
                        </div>
                        <button
                          className="btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteGoal(idx)
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#e74c3c',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className="btn btn-success" onClick={addGoal} style={{ marginTop: '10px', width: '100%' }}>
                + Goal 추가
              </button>
            </div>
          </div>

          {/* 우측: Goal 상세 편집 */}
          <div className="ultragoal-right">
            {currentGoal ? (
              <div className="section">
                <h3>✏️ {currentGoal.id} 상세 설정</h3>

                <label>Goal 이름 *</label>
                <input
                  type="text"
                  value={currentGoal.name}
                  onChange={(e) => updateGoal(currentGoalIndex!, { name: e.target.value })}
                  placeholder="Goal 이름"
                />

                <label>설명</label>
                <textarea
                  value={currentGoal.description}
                  onChange={(e) => updateGoal(currentGoalIndex!, { description: e.target.value })}
                  placeholder="Goal 설명"
                  style={{ height: '60px' }}
                />

                <label>담당 에이전트/실행자 *</label>
                <select
                  value={currentGoal.executor}
                  onChange={(e) => updateGoal(currentGoalIndex!, { executor: e.target.value })}
                >
                  <option value="">선택하세요</option>
                  <option value="executor">executor (구현)</option>
                  <option value="designer">designer (UI/UX)</option>
                  <option value="qa-tester">qa-tester (테스트)</option>
                  <option value="code-reviewer">code-reviewer (검수)</option>
                  <option value="architect">architect (설계)</option>
                  <option value="writer">writer (문서)</option>
                  <option value="devops">devops (배포)</option>
                </select>

                <label>Claude 모델 *</label>
                <select
                  value={currentGoal.model}
                  onChange={(e) => updateGoal(currentGoalIndex!, { model: e.target.value as any })}
                >
                  <option value="haiku">🚀 Haiku (빠름, 간단한 작업)</option>
                  <option value="sonnet">⚡ Sonnet (표준, 일반적 작업)</option>
                  <option value="opus">🧠 Opus (강력함, 복잡한 작업)</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={currentGoal.parallel}
                    onChange={(e) => updateGoal(currentGoalIndex!, { parallel: e.target.checked })}
                  />
                  <span>다른 Goal과 병렬 실행</span>
                </label>

                {/* 성공 기준 */}
                <div style={{ marginTop: '20px' }}>
                  <h4>✅ 성공 기준</h4>
                  {currentGoal.successCriteria.map((criteria, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={criteria}
                        onChange={(e) => updateCriteria(currentGoalIndex!, idx, e.target.value)}
                        placeholder="성공 기준 입력"
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn"
                        onClick={() => deleteCriteria(currentGoalIndex!, idx)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#e74c3c',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-primary"
                    onClick={() => addCriteria(currentGoalIndex!)}
                    style={{ fontSize: '12px' }}
                  >
                    + 기준 추가
                  </button>
                </div>
              </div>
            ) : (
              <div className="section" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                <p>👈 Goal을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 프리뷰 모드
        <div className="preview-container">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setPreviewMode(false)}>
              ← 돌아가기
            </button>
            <button className="btn btn-success" onClick={saveToClaudeMd}>
              💾 CLAUDE.md에 저장
            </button>
          </div>

          <div style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            maxHeight: '500px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: '1.6'
          }}>
            {generatedConfig}
          </div>
        </div>
      )}

      {/* 최하단 액션 버튼 */}
      {!previewMode && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={generatePreview} disabled={!projectName || goals.length === 0}>
            👁️ 프리뷰
          </button>
        </div>
      )}
    </div>
  )
}
