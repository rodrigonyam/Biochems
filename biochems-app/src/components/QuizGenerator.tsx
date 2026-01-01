import { useState } from 'react'
import type { FC } from 'react'
import { useQuizQuestion } from '../hooks/useQuizQuestion'
import type { ModuleDefinition } from '../types/study'

type QuizGeneratorProps = {
  modules: ModuleDefinition[]
}

const QuizGenerator: FC<QuizGeneratorProps> = ({ modules }) => {
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>('Choose a question to begin.')
  const [error, setError] = useState<string | null>(null)
  const {
    mutateAsync: generateQuestion,
    data: quizState,
    isPending,
    error: mutationError,
  } = useQuizQuestion()

  const nextQuestion = async () => {
    setError(null)
    setSelectedOption(null)
    setFeedback('Fetching a fresh stem…')

    try {
      const focusAreas =
        topicFilter === 'all'
          ? undefined
          : modules.find((module) => module.id === topicFilter)?.focusAreas
      await generateQuestion({
        topicIds: topicFilter === 'all' ? undefined : [topicFilter],
        focusAreas,
        batchSize: 1,
        learnerConfidence: 0.65,
      })
      setFeedback('Lock an answer to reveal the explanation.')
    } catch (err) {
      console.error(err)
      setFeedback('No question loaded yet. Try again in a moment.')
      setError('Unable to fetch a question right now.')
    }
  }

  const handleSelect = (option: string) => {
    if (!quizState?.question) return
    setSelectedOption(option)
    if (option === quizState.question.answer) {
      setFeedback('Correct — anchor the rationale before moving on.')
    } else {
      setFeedback('Revisit the pathway: the distractor misses a key control point.')
    }
  }

  const activeQuestion = quizState?.question ?? null
  const sessionLabel = quizState ? `${quizState.sessionId.slice(-6)}` : '--'
  const planSummary = quizState?.plan
    ? `Mix intro ${quizState.plan.difficultyAssignments.intro} / core ${quizState.plan.difficultyAssignments.core} / advanced ${quizState.plan.difficultyAssignments.advanced}`
    : null

  const isLoading = isPending
  const activeError = error || (mutationError ? 'Unable to fetch a question right now.' : null)

  return (
    <div className="quiz-generator">
      <div className="panel-header">
        <p className="eyebrow">Adaptive pulse check</p>
        <h2>Generate a quick board-style question</h2>
      </div>

      <div className="quiz-generator__controls">
        <label>
          Topic focus
          <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
            <option value="all">All threads</option>
            {modules.map((module) => (
              <option value={module.id} key={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn--primary" onClick={nextQuestion} disabled={isLoading}>
          {isLoading ? 'Fetching…' : 'Generate question'}
        </button>
      </div>

      {activeError && <p className="quiz-generator__error">{activeError}</p>}

      {activeQuestion ? (
        <div className="quiz-card">
          <div className="quiz-card__meta">
            <span>Session · {sessionLabel}</span>
            <span>
              Question {quizState?.sequence ?? 0} / {quizState?.total ?? 0}
            </span>
          </div>
          {quizState?.plan && (
            <p className="quiz-card__plan">
              Focus · {quizState.plan.topics.join(', ')}
              {planSummary ? ` · ${planSummary}` : ''}
            </p>
          )}
          <p className="quiz-card__prompt">{activeQuestion.prompt}</p>
          <ul className="quiz-card__options">
            {activeQuestion.options.map((option) => (
              <li key={option}>
                <button
                  className={`option ${selectedOption === option ? 'option--active' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
          <p className="quiz-card__feedback">{feedback}</p>
          {selectedOption && (
            <p className="quiz-card__explanation">Explanation · {activeQuestion.explanation}</p>
          )}
        </div>
      ) : (
        <div className="quiz-card quiz-card--empty" aria-busy={isLoading}>
          <p>{isLoading ? 'Retrieving board-style content…' : feedback}</p>
        </div>
      )}
    </div>
  )
}

export default QuizGenerator
