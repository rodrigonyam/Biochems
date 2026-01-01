import type {
  Flashcard,
  ModuleDefinition,
  PracticeQuestion,
  ProgressMetric,
  QuizQuestion,
  ResourceLink,
  StudyOverview,
} from '../types/study'

export const examPlan = {
  nextExam: '2026-02-05T09:00:00',
  focusBlock: 'Metabolism + Molecular Diagnostics',
  objective: 'Synthesize metabolic control with lab diagnostics'
}

export const modules: ModuleDefinition[] = [
  {
    id: 'metabolism',
    title: 'Metabolic Regulation',
    summary: 'Anchor glycolysis, TCA, and beta-oxidation control points under physiologic stress.',
    hoursPlanned: 6,
    focusAreas: ['Allosteric enzyme control', 'Energetics under hypoxia', 'Hormonal integration'],
    labSkills: ['Lactate curves', 'Respiratory quotient calculation'],
    difficulty: 'Core',
    upcomingCheck: 'Faculty roundtable (Week 2)',
    callout: 'Aim for 80% mastery on rate-limiting enzymes.'
  },
  {
    id: 'molecular',
    title: 'Molecular Diagnostics',
    summary: 'Translate nucleic acid detection workflows into actionable differential diagnoses.',
    hoursPlanned: 4,
    focusAreas: ['qPCR troubleshooting', 'Sequencing variant triage', 'CRISPR diagnostics'],
    labSkills: ['Ct shift interpretation', 'Melt curve validation'],
    difficulty: 'Advanced',
    upcomingCheck: 'Bench practical (Week 3)',
    callout: 'Document one troubleshooting tree per assay.'
  },
  {
    id: 'immuno',
    title: 'Immunopathology',
    summary: 'Map cytokine cascades to tissue injury patterns and biomarker panels.',
    hoursPlanned: 5,
    focusAreas: ['Complement defects', 'Checkpoint inhibitors', 'Cytokine release syndrome'],
    labSkills: ['Flow cytometry gating', 'ELISA quant'],
    difficulty: 'Advanced',
    upcomingCheck: 'Team-based case (Week 4)',
    callout: 'Prioritize rescue algorithms for CRS.'
  },
  {
    id: 'neuro',
    title: 'Neurochemistry',
    summary: 'Pair neurotransmitter synthesis with imaging correlates for acute management.',
    hoursPlanned: 3,
    focusAreas: ['Catecholamine synthesis', 'Neurotransmitter recycling', 'Glial metabolism'],
    labSkills: ['CSF panel reads', 'Spectroscopy hints'],
    difficulty: 'Core',
    upcomingCheck: 'Viva style check-in (Week 5)',
    callout: 'Sketch metabolic cross-talk for astrocytes.'
  },
]

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: 1,
    stem: 'A patient with septic shock shows rising lactate despite adequate perfusion. Which regulatory step most likely failed?',
    answer: 'Pyruvate dehydrogenase activation via PDH phosphatase.',
    rationale: 'Sepsis can suppress PDH phosphatase, preventing the PDH complex from channeling pyruvate into the TCA cycle, forcing lactate production.',
    tags: ['Metabolism', 'Critical Care'],
    difficulty: 'Advanced'
  },
  {
    id: 2,
    stem: 'During qPCR, late amplification with abnormal melt curves arises after reagent switch. What is the first variable to audit?',
    answer: 'Magnesium concentration relative to enzyme buffer.',
    rationale: 'Mg2+ drives polymerase fidelity and melt behavior; reagent changes often perturb free Mg2+, impacting both Ct and dissociation patterns.',
    tags: ['Molecular', 'Lab Skills'],
    difficulty: 'Core'
  },
  {
    id: 3,
    stem: 'A patient on CAR-T therapy develops fever, hypotension, and rising ferritin. Which cytokine target best tempers the process?',
    answer: 'IL-6 receptor blockade.',
    rationale: 'IL-6 dominates CRS escalation; tocilizumab (IL-6R blockade) interrupts downstream inflammatory amplification swiftly.',
    tags: ['Immunology', 'Therapeutics'],
    difficulty: 'Advanced'
  },
]

export const quizQuestions: QuizQuestion[] = [
  {
    id: 11,
    prompt: 'Which metabolite ratio best signals mitochondrial NADH overload?',
    options: ['Low citrate:malate', 'High beta-hydroxybutyrate:acetoacetate', 'Low fumarate:succinate', 'High citrate:isocitrate'],
    answer: 'High beta-hydroxybutyrate:acetoacetate',
    explanation: 'Beta-hydroxybutyrate formation requires increased mitochondrial NADH, making the ratio a sensitive signal.',
    topic: 'metabolism',
    difficulty: 'Core'
  },
  {
    id: 12,
    prompt: 'A CRISPR assay unexpectedly edits both alleles. Which design change prevents biallelic off-target hits?',
    options: ['Longer guide RNA seed region', 'Lowering Cas9 concentration only', 'Dual nickase strategy', 'Higher temperature incubation'],
    answer: 'Dual nickase strategy',
    explanation: 'Pairing Cas9 nickases requires adjacent guides on opposite strands, drastically reducing unintended double-strand breaks.',
    topic: 'molecular',
    difficulty: 'Advanced'
  },
  {
    id: 13,
    prompt: 'Flow cytometry shows CD55/CD59 loss. Which complement component escalates membrane damage?',
    options: ['C3b', 'C5b-9 complex', 'C1q', 'Factor H'],
    answer: 'C5b-9 complex',
    explanation: 'Without CD55/CD59, the membrane attack complex (C5b-9) forms unchecked, lysing cells.',
    topic: 'immuno',
    difficulty: 'Core'
  },
  {
    id: 14,
    prompt: 'Which imaging change mirrors dopamine depletion in the striatum?',
    options: ['Reduced DAT tracer uptake', 'Elevated FDG avidity', 'Increased MR spectroscopy choline', 'Uniform SWI blooming'],
    answer: 'Reduced DAT tracer uptake',
    explanation: 'Dopamine transporter tracers fall as dopaminergic terminals degenerate, preceding structural change.',
    topic: 'neuro',
    difficulty: 'Core'
  },
  {
    id: 15,
    prompt: 'What lab adjustment best distinguishes tumor lysis from macrophage activation syndrome when ferritin spikes?',
    options: ['Measure ionized calcium trends', 'Trend uric acid with LDH', 'Add complement functional assay', 'Repeat plasma osmolar gap'],
    answer: 'Trend uric acid with LDH',
    explanation: 'Tumor lysis features concurrent uric acid and LDH surges, whereas MAS elevates ferritin with minimal uric acid change.',
    topic: 'immuno',
    difficulty: 'Advanced'
  },
]

export const flashcards: Flashcard[] = [
  {
    id: 21,
    front: 'Rate-limiting enzyme for beta-oxidation entry into mitochondria',
    back: 'Carnitine palmitoyltransferase I (CPT-I)',
    hint: 'Inhibited by malonyl-CoA'
  },
  {
    id: 22,
    front: 'Meaning of a ΔCt shift of +2 in qPCR',
    back: 'Approximate four-fold decrease in template abundance relative to control',
    hint: 'Ct shifts translate logarithmically'
  },
  {
    id: 23,
    front: 'Cytokine triad that ignites CRS',
    back: 'IL-6, IFN-γ, and IL-1',
    hint: 'Think fever, macrophage activation, endothelial leak'
  },
  {
    id: 24,
    front: 'Primary astrocyte fuel during hypoglycemia',
    back: 'Lactate shuttled from glycolytic neurons',
    hint: 'Astrocytes buffer neuronal energy debt'
  },
]

export const progressMetrics: ProgressMetric[] = [
  { label: 'Metabolism Mastery', value: 72 },
  { label: 'Lab Readiness', value: 64 },
  { label: 'Case Synthesis', value: 58 },
  { label: 'Recall Agility', value: 81 },
]

export const studyOverview: StudyOverview = {
  hoursCompleted: 11,
  hoursTarget: 16,
  caseBlocksSolved: 4,
  labRunsReviewed: 3,
  focusArea: 'Redox balancing under hypoxia'
}

export const resourceLinks: ResourceLink[] = [
  {
    label: 'NBME Style Bank',
    description: 'Timed stems mirroring cardio-metabolic integrative exams.',
    url: '#nbme'
  },
  {
    label: 'Bench Troubleshooting Map',
    description: 'Decision trees for PCR, ELISA, and flow issues.',
    url: '#bench'
  },
  {
    label: 'Morning Synthesis Podcast',
    description: '15-minute clinical integrations across pathways.',
    url: '#podcast'
  },
]
