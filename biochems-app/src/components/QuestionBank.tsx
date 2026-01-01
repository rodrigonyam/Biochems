import { useState } from 'react'
import type { FC } from 'react'
import type { PracticeQuestion } from '../types/study'

type QuestionBankProps = {
  questions: PracticeQuestion[]
}

const QuestionBank: FC<QuestionBankProps> = ({ questions }) => {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set())

  const toggleQuestion = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="question-bank">
      <div className="panel-header">
        <p className="eyebrow">Precision questions</p>
        <h2>Practice stems you should not miss</h2>
      </div>
      <div className="question-bank__list">
        {questions.map((question) => (
          <article key={question.id} className="question-card">
            <div className="question-card__top">
              <div>
                <p className="question-card__stem">{question.stem}</p>
                <div className="chip-row">
                  <span className="pill pill--outline">{question.difficulty}</span>
                  {question.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn--ghost" onClick={() => toggleQuestion(question.id)}>
                {expanded.has(question.id) ? 'Hide rationale' : 'Show answer'}
              </button>
            </div>
            {expanded.has(question.id) && (
              <div className="question-card__details">
                <p className="question-card__answer">Answer · {question.answer}</p>
                <p>{question.rationale}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export default QuestionBank
