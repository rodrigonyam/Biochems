import { useMutation } from '@tanstack/react-query'
import { mockApi, type QuizQuestionRequest, type QuizQuestionResponse } from '../services/mockApi'
import { useQuizSessionStore } from '../state/quizSessionStore'

export const useQuizQuestion = () => {
  const { sessionId, sequence, seed, applyResponse } = useQuizSessionStore()

  return useMutation<QuizQuestionResponse, Error, Omit<QuizQuestionRequest, 'sessionId' | 'sessionSequence' | 'seed'>>({
    mutationFn: async (payload) => {
      const response = await mockApi.requestQuizQuestion({
        ...payload,
        sessionId: sessionId ?? undefined,
        sessionSequence: sequence + 1,
        seed,
      })
      return response
    },
    onSuccess: (response) => {
      // Move store update to onSuccess to prevent infinite loops
      applyResponse(response)
    },
  })
}
