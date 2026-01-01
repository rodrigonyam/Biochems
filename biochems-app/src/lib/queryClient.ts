import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        console.error('Query error:', error)
        return failureCount < 1
      },
      staleTime: 1000 * 60,
    },
    mutations: {
      retry: (failureCount, error) => {
        console.error('Mutation error:', error)
        return false
      },
      onError: (error, variables, context) => {
        console.error('Mutation failed:', error, variables)
      },
    },
  },
})
