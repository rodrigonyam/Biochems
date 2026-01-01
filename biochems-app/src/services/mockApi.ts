import { modules, practiceQuestions, quizQuestions } from '../data/biomedData'
import { randomizeQuestions, scaleDifficulty, selectTopics } from '../engine/questionPlanner'
import type { PracticeQuestion, QuizQuestion } from '../types/study'
import type { QuestionDifficulty } from '../types/question'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

const getSessionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `sess_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const plannerOrder: QuestionDifficulty[] = ['intro', 'core', 'advanced']
const questionTopics = Array.from(new Set(quizQuestions.map((question) => question.topic)))

export type QuizQuestionRequest = {
  topicId?: string
  topicIds?: string[]
  focusAreas?: string[]
  batchSize?: number
  seed?: string
  sessionId?: string
  sessionSequence?: number
  learnerConfidence?: number
  recentPerformance?: Partial<Record<QuestionDifficulty, number>>
  templateDifficultyMix?: Partial<Record<QuestionDifficulty, number>>
}

export type QuizQuestionResponse = {
  sessionId: string
  sequence: number
  total: number
  question: QuizQuestion
  plan: {
    topics: string[]
    difficultyAssignments: Record<QuestionDifficulty, number>
  }
}

const normalizeDifficulty = (difficulty: QuizQuestion['difficulty']): QuestionDifficulty => {
  const normalized = difficulty.toLowerCase()
  if (normalized === 'advanced') return 'advanced'
  if (normalized === 'intro') return 'intro'
  return 'core'
}

const flattenPlan = (plan: Record<QuestionDifficulty, number>): QuestionDifficulty[] => {
  return plannerOrder.flatMap((band) => Array(plan[band]).fill(band))
}

const resolveTopics = (request: QuizQuestionRequest): string[] => {
  const requested = [
    ...(request.topicIds ?? []),
    ...(request.topicId ? [request.topicId] : []),
  ]

  const selected = selectTopics({
    modules,
    requestedTopics: requested,
    focusAreas: request.focusAreas,
    limit: Math.max(1, request.batchSize ?? 1),
  })

  const valid = selected.filter((topic) => questionTopics.includes(topic))
  if (valid.length > 0) return valid

  const requestedValid = requested.filter((topic) => questionTopics.includes(topic))
  if (requestedValid.length > 0) return requestedValid

  return questionTopics
}

const filterPoolByTopics = (topics: string[]): QuizQuestion[] => {
  if (!topics.length) return [...quizQuestions]
  const topicSet = new Set(topics)
  const pool = quizQuestions.filter((question) => topicSet.has(question.topic))
  return pool.length > 0 ? pool : [...quizQuestions]
}

const selectQuestionsForPlan = (
  pool: QuizQuestion[],
  planOrder: QuestionDifficulty[],
): QuizQuestion[] => {
  const workingPool = [...pool]
  const selections: QuizQuestion[] = []
  planOrder.forEach((band) => {
    const index = workingPool.findIndex((question) => normalizeDifficulty(question.difficulty) === band)
    if (index >= 0) {
      selections.push(...workingPool.splice(index, 1))
    }
  })
  while (selections.length < planOrder.length && workingPool.length) {
    selections.push(workingPool.shift() as QuizQuestion)
  }
  return selections
}

export const mockApi = {
  async fetchPracticeQuestions(): Promise<PracticeQuestion[]> {
    await delay()
    return practiceQuestions
  },
  async requestQuizQuestion(request: QuizQuestionRequest = {}): Promise<QuizQuestionResponse> {
    await delay()
    const batchSize = Math.max(1, request.batchSize ?? 1)
    const sessionId = request.sessionId ?? getSessionId()
    const topics = resolveTopics(request)
    const pool = filterPoolByTopics(topics)
    const shuffleSeed = request.seed ?? sessionId
    const shuffledPool = randomizeQuestions(pool, { seed: shuffleSeed })
    const difficultyAssignments = scaleDifficulty({
      totalQuestions: batchSize,
      templateMix: request.templateDifficultyMix,
      learnerConfidence: request.learnerConfidence,
      recentPerformance: request.recentPerformance,
    })
    const planOrder = flattenPlan(difficultyAssignments)
    const selections = selectQuestionsForPlan(shuffledPool, planOrder)
    const question = selections[0] ?? shuffledPool[0]

    if (!question) {
      throw new Error('No questions available for this criteria.')
    }

    return {
      sessionId,
      sequence: request.sessionSequence ?? (planOrder.length > 0 ? 1 : 0),
      total: planOrder.length || shuffledPool.length,
      question,
      plan: {
        topics,
        difficultyAssignments,
      },
    }
  },
}
