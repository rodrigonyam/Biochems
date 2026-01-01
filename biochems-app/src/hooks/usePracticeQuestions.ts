import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { mockApi } from '../services/mockApi'
import type { PracticeQuestion } from '../types/study'

const practiceQuestionsKey = ['practiceQuestions']

export const usePracticeQuestions = (): UseQueryResult<PracticeQuestion[]> => {
  return useQuery({
    queryKey: practiceQuestionsKey,
    queryFn: () => mockApi.fetchPracticeQuestions(),
    staleTime: 1000 * 60 * 5,
  })
}
