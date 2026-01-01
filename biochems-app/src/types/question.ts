export type QuestionDifficulty = 'intro' | 'core' | 'advanced'
export type QuestionFormat = 'multipleChoice' | 'trueFalse' | 'fillBlank' | 'imageLabel' | 'caseStudy'

export type QuestionStemAsset = {
  type: 'image' | 'audio' | 'video'
  url: string
  altText: string
  attribution?: string
}

export type QuestionBase = {
  id: string
  bankId: string
  format: QuestionFormat
  topicTags: string[]
  systemsTag: string
  difficulty: QuestionDifficulty
  estimatedSeconds: number
  objectives: string[]
  stem: string
  stemAssets?: QuestionStemAsset[]
  rationale: string
  createdBy: string
  updatedAt: string
}

export type MultipleChoiceQuestion = QuestionBase & {
  format: 'multipleChoice'
  options: Array<{ id: string; text: string; isCorrect: boolean }>
  allowMultiple: boolean
}

export type TrueFalseQuestion = QuestionBase & {
  format: 'trueFalse'
  statement: string
  answer: boolean
}

export type FillBlankQuestion = QuestionBase & {
  format: 'fillBlank'
  template: string
  acceptableAnswers: string[]
  gradingMode: 'exact' | 'keyword' | 'regex'
}

export type ImageLabelQuestion = QuestionBase & {
  format: 'imageLabel'
  stemAssets: [QuestionStemAsset & { type: 'image' }]
  hotspots: Array<{ id: string; coordinates: number[]; prompt: string; answer: string }>
}

export type CaseStudyQuestion = QuestionBase & {
  format: 'caseStudy'
  sections: Array<{ title: string; body: string }>
  followUps: Array<{ id: string; prompt: string; answer: string; explanation: string }>
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ImageLabelQuestion
  | CaseStudyQuestion
