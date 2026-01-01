import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './styles/global.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient.ts'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

console.log('Main.tsx loading...')

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  console.error('Error message:', event.message)
  console.error('Error filename:', event.filename)
  console.error('Error lineno:', event.lineno)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  document.body.innerHTML = '<div style="padding:20px;color:red;">Root element not found</div>'
  throw new Error('Root element not found')
}

console.log('Root element found, rendering app...')

try {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = '<div style="padding:20px;color:red;">Failed to render app: ' + (error as Error).message + '</div>'
}
