import type { Question, QuestionDifficulty, QuestionFormat } from './question'

export type DeliveryConstraint = {
  maxMinutes?: number
  randomizeOrder?: boolean
  questionPoolSize?: number
  allowBacktracking: boolean
}

export type QuizTemplate = {
  id: string
  title: string
  description?: string
  bankId: string
  topicFilter?: string[]
  difficultyMix?: Record<QuestionDifficulty, number>
  formatsAllowed?: QuestionFormat[]
  constraints: DeliveryConstraint
  passingScore?: number
  createdBy: string
}

export type SessionStatus = 'draft' | 'inProgress' | 'submitted' | 'scored' | 'expired'

export type QuizSession = {
  id: string
  templateId: string
  userId: string
  status: SessionStatus
  startedAt: string
  submittedAt?: string
  expiresAt?: string
  timer: { maxSeconds: number; elapsedSeconds: number }
  questions: Array<{
    questionId: string
    order: number
    seed?: string
  }>
  scoring?: ScoreBreakdown
}

export type QuestionResponsePayload =
  | { format: 'multipleChoice'; selectedOptionIds: string[] }
  | { format: 'trueFalse'; value: boolean }
  | { format: 'fillBlank'; responseText: string }
  | { format: 'imageLabel'; hotspotId: string; value: string }
  | { format: 'caseStudy'; followUpAnswers: Array<{ followUpId: string; value: string }> }

export type QuestionResponse = {
  sessionId: string
  questionId: string
  answerPayload: QuestionResponsePayload
  answeredAt: string
  timeOnQuestion: number
  isFlaggedForReview: boolean
}

export type ScoreBreakdown = {
  totalQuestions: number
  correct: number
  incorrect: number
  skipped: number
  percentage: number
  perTopic: Record<string, { correct: number; total: number }>
  perFormat: Record<QuestionFormat, { correct: number; total: number }>
}

export type QuestionPlan = {
  topic: string
  difficulty: QuestionDifficulty
  count: number
}

export type QuestionSet = {
  plan: QuestionPlan[]
  pool: Question[]
}
