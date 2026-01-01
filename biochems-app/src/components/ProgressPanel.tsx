import type { FC } from 'react'
import type { QuestionDifficulty } from '../types/question'
import type { ProgressMetric, StudyOverview } from '../types/study'

type SessionPlan = {
  topics: string[]
  difficultyAssignments: Record<QuestionDifficulty, number>
}

type ActiveSessionSummary = {
  sessionId: string
  sequence: number
  plan?: SessionPlan
}

type ProgressPanelProps = {
  progress: ProgressMetric[]
  overview: StudyOverview
  activeSession?: ActiveSessionSummary | null
}

const ProgressPanel: FC<ProgressPanelProps> = ({ progress, overview, activeSession }) => {
  const percentHours = Math.round((overview.hoursCompleted / overview.hoursTarget) * 100)
  const sessionCode = activeSession?.sessionId
    ? activeSession.sessionId.slice(-6).toUpperCase()
    : null
  const mixSummary = activeSession?.plan
    ? `Intro ${activeSession.plan.difficultyAssignments.intro} / Core ${activeSession.plan.difficultyAssignments.core} / Advanced ${activeSession.plan.difficultyAssignments.advanced}`
    : null

  return (
    <div className="progress-panel">
      <div className="panel-header">
        <p className="eyebrow">Readiness signal</p>
        <h2>Monitor where mastery is sticking</h2>
      </div>
      {activeSession && (
        <div className="progress-panel__session">
          <div>
            <p className="eyebrow">Live quiz session</p>
            <h3>{sessionCode}</h3>
            <p className="progress-panel__session-meta">
              Question {Math.max(activeSession.sequence, 1)} in rotation
            </p>
          </div>
          {activeSession.plan && (
            <div className="progress-panel__session-plan">
              <span>Topics · {activeSession.plan.topics.join(', ')}</span>
              <span>{mixSummary}</span>
            </div>
          )}
        </div>
      )}
      <div className="progress-panel__grid">
        {progress.map((metric) => (
          <div className="progress-row" key={metric.label}>
            <div className="progress-row__label">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="progress-row__track">
              <div className="progress-row__fill" style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="progress-panel__stats">
        <div>
          <p className="eyebrow">Weekly hours</p>
          <h3>{overview.hoursCompleted} / {overview.hoursTarget} ({percentHours}%)</h3>
        </div>
        <div>
          <p className="eyebrow">Case blocks solved</p>
          <h3>{overview.caseBlocksSolved}</h3>
        </div>
        <div>
          <p className="eyebrow">Lab runs reviewed</p>
          <h3>{overview.labRunsReviewed}</h3>
        </div>
      </div>
      <div className="progress-panel__focus">
        <p className="eyebrow">This week&apos;s focus</p>
        <p>{overview.focusArea}</p>
      </div>
    </div>
  )
}

export default ProgressPanel
