# Domain Models & API Contracts

This document captures the shared vocabulary for Biomedical Sciences Exam Prep. Use these types/contracts to keep the frontend, backend, and content tooling aligned.

## Conceptual Areas
1. **Content** – Question banks, media assets, rationales.
2. **Assessment Runtime** – Quiz/exam templates, sessions, timing, scoring.
3. **Learner Profile** – Accounts, preferences, history, mastery signals.
4. **Analytics** – Aggregated scores, topic mastery, attempt telemetry.

---

## Data Models
TypeScript-style interfaces describe the canonical structures. Persisted data can include additional metadata (timestamps, audit user IDs, etc.).

### Question Core
```ts
export type QuestionDifficulty = 'intro' | 'core' | 'advanced';
export type QuestionFormat = 'multipleChoice' | 'trueFalse' | 'fillBlank' | 'imageLabel' | 'caseStudy';

export interface QuestionStemAsset {
  type: 'image' | 'audio' | 'video';
  url: string;
  altText: string;
  attribution?: string;
}

export interface QuestionBase {
  id: string;
  bankId: string;
  format: QuestionFormat;
  topicTags: string[];          // e.g., ['metabolism', 'neuro']
  systemsTag: string;           // e.g., 'cardio', 'hepatology'
  difficulty: QuestionDifficulty;
  estimatedSeconds: number;
  objectives: string[];         // LO mappings
  stem: string;
  stemAssets?: QuestionStemAsset[];
  rationale: string;
  createdBy: string;
  updatedAt: string;
}
```

### Format-Specific Payloads
```ts
export interface MultipleChoiceQuestion extends QuestionBase {
  format: 'multipleChoice';
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  allowMultiple: boolean;
}

export interface TrueFalseQuestion extends QuestionBase {
  format: 'trueFalse';
  statement: string;
  answer: boolean;
}

export interface FillBlankQuestion extends QuestionBase {
  format: 'fillBlank';
  template: string;                     // e.g., 'The rate-limiting step is ____. '
  acceptableAnswers: string[];          // normalized for casing/spacing rules
  gradingMode: 'exact' | 'keyword' | 'regex';
}

export interface ImageLabelQuestion extends QuestionBase {
  format: 'imageLabel';
  stemAssets: [QuestionStemAsset & { type: 'image' }];
  hotspots: Array<{ id: string; coordinates: number[]; prompt: string; answer: string }>; // coordinates normalized 0–1
}

export interface CaseStudyQuestion extends QuestionBase {
  format: 'caseStudy';
  sections: Array<{ title: string; body: string }>;
  followUps: Array<{ id: string; prompt: string; answer: string; explanation: string }>;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ImageLabelQuestion
  | CaseStudyQuestion;
```

### Question Banks & Versioning
```ts
export interface QuestionBank {
  id: string;
  title: string;
  description: string;
  ownerTeam: string;
  topicsCovered: string[];
  licensing: 'internal' | 'licensed' | 'open';
  defaultTimerSec?: number;
  activeVersion: string;      // semantic version for syncing frontends
  revisionHistory: Array<{ version: string; notes: string; publishedAt: string }>;
}
```

### Quiz & Exam Templates
```ts
export interface DeliveryConstraint {
  maxMinutes?: number;
  randomizeOrder?: boolean;
  questionPoolSize?: number;
  allowBacktracking: boolean;
}

export interface QuizTemplate {
  id: string;
  title: string;
  description?: string;
  bankId: string;
  topicFilter?: string[];
  difficultyMix?: Record<QuestionDifficulty, number>; // target counts per level
  formatsAllowed?: QuestionFormat[];
  constraints: DeliveryConstraint;
  passingScore?: number;
  createdBy: string;
}
```

### Runtime Sessions & Attempts
```ts
export type SessionStatus = 'draft' | 'inProgress' | 'submitted' | 'scored' | 'expired';

export interface QuizSession {
  id: string;
  templateId: string;
  userId: string;
  status: SessionStatus;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  timer: { maxSeconds: number; elapsedSeconds: number };
  questions: Array<{
    questionId: string;
    order: number;
    seed?: string;                // used for deterministic shuffling
  }>;
  scoring?: ScoreBreakdown;
}

export interface QuestionResponse {
  sessionId: string;
  questionId: string;
  answerPayload: unknown;         // format-specific, see below
  answeredAt: string;
  timeOnQuestion: number;         // seconds
  isFlaggedForReview: boolean;
}

export interface ScoreBreakdown {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percentage: number;
  perTopic: Record<string, { correct: number; total: number }>;
  perFormat: Record<QuestionFormat, { correct: number; total: number }>;
}
```

**Answer payload expectations**
- `multipleChoice`: `{ selectedOptionIds: string[] }
- `trueFalse`: `{ value: boolean }
- `fillBlank`: `{ responseText: string }
- `imageLabel`: `{ hotspotId: string; value: string }
- `caseStudy`: `{ followUpAnswers: Array<{ followUpId: string; value: string }> }`

### User and Progress
```ts
export interface UserAccount {
  id: string;
  email: string;
  role: 'learner' | 'author' | 'admin';
  displayName: string;
  photoUrl?: string;
  createdAt: string;
}

export interface StudyProfile {
  userId: string;
  goalExamDate: string;
  focusTopics: string[];
  weeklyHourTarget: number;
  proficiency: Record<string, number>; // topic => % mastery
}

export interface AttemptHistoryEntry {
  sessionId: string;
  templateId: string;
  score: number;
  completedAt: string;
  durationSeconds: number;
  breakdown: ScoreBreakdown;
}
```

---

## API Contracts
Endpoints follow REST patterns and return JSON. Authenticated routes require a Bearer token (JWT or session cookie).

### Question Catalog
| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/question-banks` | List banks visible to caller with summary stats. |
| POST | `/api/question-banks` | Create a bank (authors/admin only). |
| GET | `/api/question-banks/{bankId}/questions` | Paginated question listing with filters (`topic`, `format`, `difficulty`). |
| POST | `/api/question-banks/{bankId}/questions` | Create or import a question. |
| GET | `/api/questions/{questionId}` | Fetch a single question (with latest version). |
| PUT | `/api/questions/{questionId}` | Update question content (version bump). |

**Sample response** `GET /api/question-banks/{bankId}/questions?topic=metabolism&format=multipleChoice`
```json
{
  "items": [
    {
      "id": "q_123",
      "format": "multipleChoice",
      "topicTags": ["metabolism"],
      "difficulty": "advanced",
      "stem": "Which metabolite ratio...",
      "options": [
        { "id": "a", "text": "Low citrate:malate" },
        { "id": "b", "text": "High beta-hydroxybutyrate:acetoacetate" }
      ],
      "allowMultiple": false
    }
  ],
  "nextCursor": null
}
```

### Quiz Templates & Sessions
| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/quizzes/templates` | List templates available to learner (with metadata). |
| POST | `/api/quizzes/templates` | Create/update a template (author role). |
| POST | `/api/quizzes/sessions` | Instantiate a quiz/exam session. Body includes `templateId`, overrides (e.g., `topicFilter`). |
| GET | `/api/quizzes/sessions/{sessionId}` | Retrieve session state, ordered question list, and timer info. |
| POST | `/api/quizzes/sessions/{sessionId}/responses` | Upsert a question response (idempotent). |
| POST | `/api/quizzes/sessions/{sessionId}/submit` | Finalize a session, trigger scoring + analytics. |

**Session creation request**
```json
{
  "templateId": "qt_metabolism_core",
  "overrides": {
    "topicFilter": ["metabolism"],
    "difficultyMix": { "core": 6, "advanced": 4 }
  }
}
```

**Session payload response**
```json
{
  "id": "sess_789",
  "templateId": "qt_metabolism_core",
  "status": "inProgress",
  "timer": { "maxSeconds": 1800, "elapsedSeconds": 0 },
  "questions": [
    { "order": 1, "questionId": "q_123" },
    { "order": 2, "questionId": "q_456" }
  ]
}
```

### Timed Exams & Monitoring
| Method | Route | Description |
| --- | --- | --- |
| PATCH | `/api/quizzes/sessions/{sessionId}/timer` | Server authoritative update (pause/resume). |
| GET | `/api/quizzes/sessions/{sessionId}/heartbeat` | Optional endpoint to keep timers synced when offline caching is used. |

### Review & Analytics
| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/quizzes/sessions/{sessionId}/review` | Full review data (questions, user answers, correct answers, rationale). |
| GET | `/api/users/{userId}/attempts` | Paginated attempt history. |
| GET | `/api/users/{userId}/progress` | Aggregated mastery (topic, format, streaks). |
| GET | `/api/users/{userId}/recommendations` | Next-best quiz templates or question lists (future feature hook). |

**Review payload**
```json
{
  "sessionId": "sess_789",
  "score": {
    "percentage": 78,
    "correct": 14,
    "incorrect": 6,
    "skipped": 0
  },
  "items": [
    {
      "questionId": "q_123",
      "format": "multipleChoice",
      "userAnswer": { "selectedOptionIds": ["b"] },
      "correctAnswer": { "selectedOptionIds": ["b"] },
      "rationale": "Beta-hydroxybutyrate formation..."
    }
  ]
}
```

### Auth & Profiles
| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a user account. |
| POST | `/api/auth/login` | Authenticate, return JWT/refresh pair. |
| GET | `/api/users/me` | Current profile + study settings. |
| PATCH | `/api/users/me` | Update preferences (goal exam date, focus topics, weekly target). |

---

## Implementation Notes
- **Versioning**: include `If-Match` / ETags on mutable resources (questions, templates) to avoid overwriting edits.
- **Media Storage**: store image assets in object storage with signed URLs referenced by `QuestionStemAsset`.
- **Localization**: wrap user-facing text fields for translation readiness (use locale keys if future requirement arises).
- **Telemetry Hooks**: emit events `session.started`, `session.submitted`, `response.saved` for analytics pipelines.
- **Future Backlog Hooks**: add `SpacedReviewCard` entity when spaced repetition launches; keep `QuestionFormat` union extensible.
