import { create } from 'zustand'
import type { QuizQuestionResponse } from '../services/mockApi'

const generateSeed = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `sess_${Date.now()}_${Math.floor(Math.random() * 1000)}`

export type QuizSessionState = {
  sessionId: string | null
  sequence: number
  seed: string
  lastPlan?: QuizQuestionResponse['plan']
  applyResponse: (payload: QuizQuestionResponse) => void
  reset: () => void
}

export const useQuizSessionStore = create<QuizSessionState>((set) => ({
  sessionId: null,
  sequence: 0,
  seed: generateSeed(),
  lastPlan: undefined,
  applyResponse: (payload) =>
    set(() => ({
      sessionId: payload.sessionId,
      sequence: payload.sequence,
      lastPlan: payload.plan,
    })),
  reset: () =>
    set(() => ({
      sessionId: null,
      sequence: 0,
      seed: generateSeed(),
      lastPlan: undefined,
    })),
}))
