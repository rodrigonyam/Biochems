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

function App() {
  const {
    data: practiceQuestions = [],
    isLoading: practiceLoading,
    isError: practiceError,
  } = usePracticeQuestions()
  const { sessionId, sequence, lastPlan } = useQuizSessionStore((state) => ({
    sessionId: state.sessionId,
    sequence: state.sequence,
    lastPlan: state.lastPlan,
  }))
  const activeSession = sessionId
    ? {
        sessionId,
        sequence,
        plan: lastPlan,
      }
    : null

  return (
    <div className="app-shell">
      <Hero
        nextExamDate={examPlan.nextExam}
        focusBlock={examPlan.focusBlock}
        objective={examPlan.objective}
      />

      <main className="layout">
        <section className="panel panel--wide">
          <div className="panel-header">
            <p className="eyebrow">Systems snapshot</p>
            <h2>Stay ahead of the biomedical curve</h2>
          </div>
          <ModuleGrid modules={modules} />
        </section>

        <section className="panel panel--split">
          {practiceLoading ? (
            <div className="panel__status">Loading practice stems…</div>
          ) : practiceError ? (
            <div className="panel__status panel__status--error">
              Unable to load practice questions right now.
            </div>
          ) : (
            <QuestionBank questions={practiceQuestions} />
          )}
          <FlashcardCarousel flashcards={flashcards} />
        </section>

        <section className="panel panel--split">
          <QuizGenerator modules={modules} />
          <ProgressPanel
            progress={progressMetrics}
            overview={studyOverview}
            activeSession={activeSession}
          />
        </section>

        <section className="panel panel--wide">
          <div className="panel-header">
            <p className="eyebrow">Go-to resources</p>
            <h2>Keep momentum with curated assets</h2>
          </div>
          <ResourceStrip resources={resourceLinks} />
        </section>
      </main>
    </div>
  )
}

export default App
