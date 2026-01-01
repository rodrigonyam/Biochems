export type ModuleDefinition = {
  id: string
  title: string
  summary: string
  hoursPlanned: number
  focusAreas: string[]
  labSkills: string[]
  difficulty: 'Core' | 'Advanced'
  upcomingCheck: string
  callout: string
}

export type PracticeQuestion = {
  id: number
  stem: string
  answer: string
  rationale: string
  tags: string[]
  difficulty: 'Core' | 'Advanced'
}

export type QuizQuestion = {
  id: number
  prompt: string
  options: string[]
  answer: string
  explanation: string
  topic: string
  difficulty: 'Core' | 'Advanced'
}

export type Flashcard = {
  id: number
  front: string
  back: string
  hint?: string
}

export type ProgressMetric = {
  label: string
  value: number
}

export type ResourceLink = {
  label: string
  description: string
  url: string
}

export type StudyOverview = {
  hoursCompleted: number
  hoursTarget: number
  caseBlocksSolved: number
  labRunsReviewed: number
  focusArea: string
}
