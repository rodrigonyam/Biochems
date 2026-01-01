import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (_failureCount, error) => {
        console.error('Query error:', error)
        return _failureCount < 1
      },
      staleTime: 1000 * 60,
    },
    mutations: {
      retry: (_failureCount, error) => {
        console.error('Mutation error:', error)
        return false
      },
      onError: (error, variables, _context) => {
        console.error('Mutation failed:', error, variables)
      },
    },
  },
})
