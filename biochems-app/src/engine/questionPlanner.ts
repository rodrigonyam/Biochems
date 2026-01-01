import type { ModuleDefinition } from '../types/study'
import type { QuestionDifficulty } from '../types/question'

type TopicSelectionOptions = {
  modules: ModuleDefinition[]
  requestedTopics?: string[]
  focusAreas?: string[]
  limit?: number
}

type DifficultyScalingOptions = {
  totalQuestions: number
  templateMix?: Partial<Record<QuestionDifficulty, number>>
  learnerConfidence?: number // 0 (struggling) → 1 (mastery)
  recentPerformance?: Partial<Record<QuestionDifficulty, number>> // accuracy per band
}

type RandomizeOptions = {
  seed?: string
}

const DEFAULT_TOPIC_LIMIT = 4
const DEFAULT_DIFFICULTY_WEIGHTS: Record<QuestionDifficulty, number> = {
  intro: 0.2,
  core: 0.55,
  advanced: 0.25,
}
const DIFFICULTY_ORDER: QuestionDifficulty[] = ['intro', 'core', 'advanced']

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const hashSeed = (seed: string) => {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return (h >>> 0) / 4294967296
}

const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const deriveWeights = (
  templateMix?: Partial<Record<QuestionDifficulty, number>>,
): Record<QuestionDifficulty, number> => {
  const normalized = { ...DEFAULT_DIFFICULTY_WEIGHTS }
  if (templateMix) {
    const total = Object.values(templateMix).reduce((acc, val = 0) => acc + val, 0)
    if (total > 0) {
      DIFFICULTY_ORDER.forEach((band) => {
        const slice = templateMix[band]
        normalized[band] = typeof slice === 'number' ? slice / total : 0
      })
    }
  }
  return normalized
}

const applyConfidenceBias = (
  weights: Record<QuestionDifficulty, number>,
  learnerConfidence = 0.6,
): Record<QuestionDifficulty, number> => {
  const bias = (0.5 - clamp(learnerConfidence, 0, 1)) * 0.3
  const adjusted = { ...weights }
  if (bias > 0) {
    const steal = Math.min(adjusted.advanced, bias)
    adjusted.advanced -= steal
    adjusted.intro += steal * 0.6
    adjusted.core += steal * 0.4
  } else if (bias < 0) {
    const add = Math.min(adjusted.intro, Math.abs(bias))
    adjusted.intro -= add
    adjusted.core += add * 0.5
    adjusted.advanced += add * 0.5
  }
  return adjusted
}

const applyPerformanceBias = (
  weights: Record<QuestionDifficulty, number>,
  recentPerformance?: Partial<Record<QuestionDifficulty, number>>,
): Record<QuestionDifficulty, number> => {
  if (!recentPerformance) return weights
  const adjusted = { ...weights }
  DIFFICULTY_ORDER.forEach((band) => {
    const accuracy = recentPerformance[band]
    if (typeof accuracy === 'number') {
      const delta = (0.5 - clamp(accuracy, 0, 1)) * 0.1
      adjusted[band] = clamp(adjusted[band] + delta, 0, 1)
    }
  })
  const total = DIFFICULTY_ORDER.reduce((sum, band) => sum + adjusted[band], 0)
  if (total === 0) return weights
  DIFFICULTY_ORDER.forEach((band) => {
    adjusted[band] = adjusted[band] / total
  })
  return adjusted
}

const distributeCounts = (
  total: number,
  weights: Record<QuestionDifficulty, number>,
): Record<QuestionDifficulty, number> => {
  const counts: Record<QuestionDifficulty, number> = { intro: 0, core: 0, advanced: 0 }
  let remaining = total
  DIFFICULTY_ORDER.forEach((band) => {
    const slice = Math.floor(weights[band] * total)
    counts[band] = slice
    remaining -= slice
  })
  let index = 0
  while (remaining > 0) {
    const band = DIFFICULTY_ORDER[index % DIFFICULTY_ORDER.length]
    counts[band] += 1
    remaining -= 1
    index += 1
  }
  return counts
}

export const selectTopics = ({
  modules,
  requestedTopics = [],
  focusAreas = [],
  limit = DEFAULT_TOPIC_LIMIT,
}: TopicSelectionOptions): string[] => {
  const topicSet = new Set<string>()
  requestedTopics.forEach((topic) => topicSet.add(topic))
  focusAreas.forEach((topic) => topicSet.add(topic))
  modules.forEach((module) => {
    topicSet.add(module.id)
    module.focusAreas.forEach((area) => topicSet.add(area))
  })
  return Array.from(topicSet).slice(0, limit)
}

export const scaleDifficulty = ({
  totalQuestions,
  templateMix,
  learnerConfidence,
  recentPerformance,
}: DifficultyScalingOptions): Record<QuestionDifficulty, number> => {
  if (totalQuestions <= 0) {
    return { intro: 0, core: 0, advanced: 0 }
  }
  const baseWeights = deriveWeights(templateMix)
  const confidenceWeights = applyConfidenceBias(baseWeights, learnerConfidence)
  const performanceWeights = applyPerformanceBias(confidenceWeights, recentPerformance)
  return distributeCounts(totalQuestions, performanceWeights)
}

export const randomizeQuestions = <T>(
  questions: T[],
  { seed = `${Date.now()}` }: RandomizeOptions = {},
): T[] => {
  if (questions.length <= 1) return [...questions]
  const normalizedSeed = seed || 'biochem'
  const prng = mulberry32(hashSeed(normalizedSeed) * 1_000_000)
  const pool = [...questions]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(prng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}
