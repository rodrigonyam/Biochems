import Hero from './components/Hero'
import ModuleGrid from './components/ModuleGrid'
import QuestionBank from './components/QuestionBank'
import QuizGenerator from './components/QuizGenerator'
import FlashcardCarousel from './components/FlashcardCarousel'
import ProgressPanel from './components/ProgressPanel'
import ResourceStrip from './components/ResourceStrip'
import { usePracticeQuestions } from './hooks/usePracticeQuestions'
import { useQuizSessionStore } from './state/quizSessionStore'
import {
  examPlan,
  flashcards,
  modules,
  progressMetrics,
  resourceLinks,
  studyOverview,
} from './data/biomedData'

// Defensive checks for data imports
if (!examPlan) {
  console.error('examPlan is undefined!')
}
if (!modules || !Array.isArray(modules)) {
  console.error('modules is undefined or not an array!', modules)
}
if (!flashcards || !Array.isArray(flashcards)) {
  console.error('flashcards is undefined or not an array!', flashcards)
}

console.log('Data loaded:', { 
  examPlan: !!examPlan, 
  modules: modules?.length, 
  flashcards: flashcards?.length,
  progressMetrics: !!progressMetrics,
  resourceLinks: resourceLinks?.length,
  studyOverview: !!studyOverview
})

function App() {
  console.log('App component rendering...')
  
  try {
    const {
      data: practiceQuestions = [],
      isLoading: practiceLoading,
      isError: practiceError,
    } = usePracticeQuestions()
  
  // Use a single selector to avoid multiple subscriptions
  const quizSession = useQuizSessionStore((state) => ({
    sessionId: state.sessionId,
    sequence: state.sequence,
    lastPlan: state.lastPlan,
  }))
  
  const activeSession = quizSession.sessionId
    ? {
        sessionId: quizSession.sessionId,
        sequence: quizSession.sequence,
        plan: quizSession.lastPlan,
      }
    : null

  // Validate required data before rendering
  if (!modules || !Array.isArray(modules)) {
    console.error('Modules data is invalid:', modules)
    return <div className="app-shell">Error: Module data failed to load</div>
  }

  if (!flashcards || !Array.isArray(flashcards)) {
    console.error('Flashcards data is invalid:', flashcards)
    return <div className="app-shell">Error: Flashcard data failed to load</div>
  }

  console.log('App rendering with data:', {
    modules: modules?.length || 0,
    flashcards: flashcards?.length || 0,
    practiceQuestions: practiceQuestions?.length || 0,
    sessionId: quizSession.sessionId,
  })

  return (
    <div className="app-shell">
      {examPlan?.nextExam && examPlan?.focusBlock && examPlan?.objective ? (
        <Hero
          nextExamDate={examPlan.nextExam}
          focusBlock={examPlan.focusBlock}
          objective={examPlan.objective}
        />
      ) : (
        <div>Loading exam plan...</div>
      )}

      <main className="layout">
        <section className="panel panel--wide">
          <div className="panel-header">
            <p className="eyebrow">Systems snapshot</p>
            <h2>Stay ahead of the biomedical curve</h2>
          </div>
          {modules && Array.isArray(modules) && modules.length > 0 ? (
            <ModuleGrid modules={modules} />
          ) : (
            <div>Loading modules...</div>
          )}
        </section>

        <section className="panel panel--split">
          {practiceLoading ? (
            <div className="panel__status">Loading practice stems…</div>
          ) : practiceError ? (
            <div className="panel__status panel__status--error">
              Unable to load practice questions right now.
            </div>
          ) : (
            <QuestionBank questions={practiceQuestions || []} />
          )}
          {flashcards && Array.isArray(flashcards) && flashcards.length > 0 ? (
            <FlashcardCarousel flashcards={flashcards} />
          ) : (
            <div>Loading flashcards...</div>
          )}
        </section>

        <section className="panel panel--split">
          {modules && Array.isArray(modules) && modules.length > 0 ? (
            <QuizGenerator modules={modules} />
          ) : (
            <div>Loading quiz generator...</div>
          )}
          {progressMetrics && studyOverview ? (
            <ProgressPanel
              progress={progressMetrics}
              overview={studyOverview}
              activeSession={activeSession}
            />
          ) : (
            <div>Loading progress...</div>
          )}
        </section>

        <section className="panel panel--wide">
          <div className="panel-header">
            <p className="eyebrow">Go-to resources</p>
            <h2>Keep momentum with curated assets</h2>
          </div>
          {resourceLinks && Array.isArray(resourceLinks) && resourceLinks.length > 0 ? (
            <ResourceStrip resources={resourceLinks} />
          ) : (
            <div>Loading resources...</div>
          )}
        </section>
      </main>
    </div>
  )
  } catch (error) {
    console.error('App component error:', error)
    return (
      <div className="app-shell">
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#ffe6e6' }}>
          <h2>App Error</h2>
          <p>Something went wrong: {(error as Error).message}</p>
          <pre>{(error as Error).stack}</pre>
        </div>
      </div>
    )
  }
}

export default App
