import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { mockApi } from '../services/mockApi'
import type { PracticeQuestion } from '../types/study'

const practiceQuestionsKey = ['practiceQuestions']

export const usePracticeQuestions = (): UseQueryResult<PracticeQuestion[]> => {
  return useQuery({
    queryKey: practiceQuestionsKey,
    queryFn: async () => {
      try {
        console.log('Fetching practice questions...')
        const result = await mockApi.fetchPracticeQuestions()
        console.log('Practice questions fetched:', result?.length || 0)
        return result || []
      } catch (error) {
        console.error('Error fetching practice questions:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: typeof window !== 'undefined',
    retry: false,
  })
}
