# Phase 2 – System Architecture Blueprint

This blueprint locks down how the Biomedical Sciences Exam Prep platform will scale across the stack. The goal is to keep modular boundaries clear so Phase 3 (feature build-out) can proceed quickly.

---

## Frontend Stack (Vite + React)

| Concern | Tooling | Notes |
| --- | --- | --- |
| Routing | **React Router v7** | `/`, `/quiz`, `/review/:sessionId`, `/dashboard`, `/auth/*`. Code-split by route using `lazy()` to keep initial bundle light. |
| Server State | **React Query** | Wrap app with `QueryClientProvider`. Standardize API calls via a typed `apiClient`. Enables stale-time policies for question banks vs. session polling. |
| UI/Local State | **Zustand** (global) + Context (scoped) | Zustand store handles UI shell (theme, layout toggles) and active session metadata (timer, flags). Context remains for narrow concerns (e.g., flashcard carousel). Keeping both avoids prop drilling without over-centralizing. |
| Styling System | **Tailwind CSS** layered on top of current custom styles | Use Tailwind utility classes for layout/spacing while keeping the bespoke glass aesthetic via CSS variables (defined in `global.css`). Add `tailwind.config.ts` with custom colors matching the Space Grotesk palette. Component-level styling pattern: Tailwind for structure, CSS modules for advanced visuals. |
| Component Library | Minimal primitives (buttons, cards, forms) built in-house | MUI not selected to preserve brand aesthetic; however, we may pull iconography (Material Symbols). |
| Charts & Analytics | **Recharts** | For mastery heatmaps, progress sparklines, timer gauges. Wrap chart components to ensure consistent color tokens + responsive containers. |
| Forms & Validation | `react-hook-form` + Zod (to add later) | Ensures quiz template creation, login/signup, and filter panels stay type-safe. |

### Frontend Module Layout
```
src/
  routes/
    dashboard/
    quiz/
    review/
    auth/
  components/
    ui/ (buttons, inputs, cards)
    charts/
  hooks/
    useSessionTimer.ts
    useTopicSelector.ts
  state/
    useUiStore.ts          // Zustand
    useActiveSessionStore.ts
  services/
    apiClient.ts
    questionService.ts
  types/
    question.ts
    session.ts
```

### State Flow Highlights
1. **Session Launch**: Route action triggers `questionService.createSession()` → React Query caches session record → Zustand store mirrors key fields (`sessionId`, `timer` data) for components that do not need server refetching.
2. **Timer Module**: `useSessionTimer` hook reads from store, handles tick, dispatches optimistic updates, and pushes authoritative sync via `/timer` endpoint at intervals.
3. **Question Generation UI**: Topic selector + difficulty scaler run inside a dedicated hook, reading user mastery data (React Query) and writing the chosen plan to Zustand so multiple widgets (e.g., plan preview + start button) share it.

### Performance & DX Considerations
- Enable Vite aliases (`@components`, `@state`, `@types`).
- Use React Query mutation + optimistic updates for answer submissions; fallback to invalidating on failure.
- Code splitting for heavy routes (review view loads charts).
- Lighthouse targets: TTI < 2.5s on broadband; keep initial JS bundle < 350 KB gzipped.

---

## Backend Choice: Node.js + Express + MongoDB
Chosen for flexibility with complex question structures and to leverage prior experience. Future alternative adapters (Supabase/Firebase) remain possible via repository pattern.

### High-Level Topology
```
[Client SPA]
    │ fetch / websockets (future)
[API Gateway / Express App]
    │
 [Service Layer]
  ├─ QuestionService
  ├─ QuizService
  ├─ SessionService
  ├─ UserService
    │
 [MongoDB Atlas]
  ├─ questions
  ├─ questionBanks
  ├─ quizTemplates
  ├─ quizSessions
  ├─ questionResponses
  ├─ users
  └─ progressProfiles
```

### API Layer
- **Express + TypeScript** with `zod` validation per route.
- Controllers map directly to the contracts defined in `docs/domain-models.md`.
- Use `express-jwt` for authentication middleware and role-based guards.
- Rate limiting via `express-rate-limit` on auth and session endpoints.

### Service Layer Responsibilities
- `QuestionService`: CRUD, tagging, version control. Performs dedupe checks, handles media references (S3 or equivalent).
- `QuizService`: Template creation, difficulty/topic plan computation, orchestrates randomization through shared utility (mirrors frontend logic for parity).
- `SessionService`: Timer enforcement, persistence of responses, scoring functions, review payload assembly.
- `UserService`: Account management, mastery aggregation, recommendation seeds.

### Data Persistence (MongoDB)
- **Schema Design**
  - Store Question documents with embedded format-specific payloads under a `payload` field to keep indexes lean. Indexes on `topicTags`, `format`, `difficulty` for efficient retrieval.
  - QuizSession documents embed lightweight `questions[]` array (questionId, order, seed). Responses live in their own collection to support analytics queries without growing session documents indefinitely.
  - Use change streams to publish analytics events (future streaming needs).

### MongoDB Collection Schemas
| Collection | Key Fields | Indexes | Notes |
| --- | --- | --- | --- |
| `questionBanks` | `_id`, `title`, `topicsCovered[]`, `activeVersion`, `licensing`, timestamps | `{ title: 1 }`, `{ topicsCovered: 1 }` | Holds metadata only; questions reference `bankId`. |
| `questions` | `_id`, `bankId`, `format`, `topicTags[]`, `systemsTag`, `difficulty`, `estimatedSeconds`, `payload`, `rationale` | Compound `{ bankId: 1, topicTags: 1, difficulty: 1 }`, `{ format: 1 }`, TTL on `archivedAt` (optional) | `payload` contains format-specific data exactly matching `Question` union. Keep `stemAssets` as array of embedded docs. |
| `quizTemplates` | `_id`, `bankId`, `title`, `difficultyMix`, `formatsAllowed`, `constraints`, `passingScore` | `{ bankId: 1 }`, `{ title: 1 }` | Templates are immutable once published; use `status` flag for draft vs active. |
| `quizSessions` | `_id`, `templateId`, `userId`, `status`, `timer`, `startedAt`, `submittedAt`, `questions[]` | `{ userId: 1, status: 1 }`, `{ templateId: 1 }`, `{ startedAt: -1 }` | Only summary scoring stored here; question-level answers remain in `questionResponses`. |
| `questionResponses` | `_id`, `sessionId`, `questionId`, `answerPayload`, `timeOnQuestion`, `isFlaggedForReview` | `{ sessionId: 1, questionId: 1 }`, `{ questionId: 1 }` | Enables analytics on accuracy per question without loading entire session. |
| `users` | `_id`, `email`, `role`, `passwordHash`, `displayName`, `preferences` | Unique `{ email: 1 }` | Store auth data + profile; do not embed progress (kept separate). |
| `progressProfiles` | `_id`, `userId`, `goalExamDate`, `focusTopics[]`, `weeklyHourTarget`, `proficiency` map | `{ userId: 1 }` | Denormalized structure to support quick dashboard loads. |
| `mediaAssets` (optional) | `_id`, `url`, `altText`, `ownerId`, `expiresAt` | `{ url: 1 }`, TTL on `expiresAt` | Only needed if we track uploads separately from object storage metadata. |

**Schema patterns**
- Lean on `envalid`/Zod at the service layer to enforce payload shape before inserting.
- Use Mongo transactions when creating a session + reserving question set to keep referential integrity.
- Enable `strict` schemas via Mongoose or Zod schemas inside the repository layer to guard against payload drift.

### Hosting & Deployment Stack
| Layer | Choice | Rationale |
| --- | --- | --- |
| API Runtime | Azure Container Apps (ACA) running Node 20/Express container | Handles autoscale based on HTTP requests, easy secret management with Key Vault integration, keeps deployment close to Azure storage if used for media. |
| Database | MongoDB Atlas (M10 staging / M30 prod) hosted in same Azure region | Managed backups, performance advisor, option to scale vertically or shard as question volume grows. |
| Object Storage | Azure Blob Storage (`biochems-media` container) | Stores question images/audio. Access via SAS URLs issued by backend. |
| CI/CD | GitHub Actions → `az containerapp update` + Atlas CLI migrations | Automates tests, container builds, and deploys. Secrets injected via GitHub OIDC to Azure. |
| Monitoring | Azure Monitor + Log Analytics workspace | Collects container logs, custom metrics (session count, timer drifts). Atlas metrics forwarded via integration or DataDog (optional). |

**Environment layout**
- `dev`: Local Docker Compose (Express + MongoDB Community) for end-to-end testing.
- `staging`: ACA environment + Atlas M10; seeded with synthetic data, protected behind Entra ID or basic auth.
- `prod`: ACA production revision with autoscaling (min 2 replicas, max 10), Atlas M30 with weekly backups.

**Deployment flow**
1. Developer pushes to `main` → GitHub Actions runs unit tests and builds Docker image.
2. Image pushed to Azure Container Registry.
3. Action invokes `az containerapp update` pointing to new image tag and injects environment variables (Atlas URI, Blob endpoint, JWT secret).
4. Atlas trigger runs migrations or index creation scripts via `mongosh` job.

**Secrets & configuration**
- Store secrets in Azure Key Vault; ACA references them through managed identity.
- Runtime env vars: `MONGODB_URI`, `JWT_SECRET`, `BLOB_ACCOUNT`, `BLOB_CONTAINER`, `SESSION_HEARTBEAT_SECONDS`.

**Availability considerations**
- Configure ACA health probes hitting `/healthz` (checks DB connectivity).
- Enable Atlas multi-zone clusters when traffic grows; set read preference to `primaryPreferred` to protect timer writes.
- Use Azure Front Door or Application Gateway if custom domain + WAF needed.

### Scaling & Ops
- Deploy Express app via container (Docker) on Azure Container Apps or AWS ECS (TBD). Node 20 LTS.
- MongoDB Atlas M10 cluster for staging, scalable to M30+ with sharding if needed.
- Set up CI/CD (GitHub Actions) for lint/test/build + Docker publish.
- Observability: Winston logger + OpenTelemetry exporters to Azure Monitor / Datadog. Health endpoint `/healthz` with DB ping.

### Timed Exam Synchronization
- Sessions store authoritative timer server-side. Frontend pings every 15s; backend enforces expiration and auto-submits if `maxSeconds` exceeded.
- Optionally expose WebSocket channel later for real-time timer pushes; current scope uses REST heartbeat.

### Image Asset Handling
- Store question images in Azure Blob or AWS S3. Metadata persisted in Mongo along with signed URL expiration metadata.
- Upload pipeline: authors POST to `/media/upload`, backend responds with signed URL; client uploads directly and stores asset descriptor in question payload.

---

## Next Steps
1. **Frontend**: Add Tailwind, React Router, React Query, and Zustand dependencies. Scaffold `routes/` and `state/` folders per layout above.
2. **Backend**: Initialize Express + TypeScript project (monorepo or sibling folder), wire base controllers for questions and sessions.
3. **Shared Types**: Extract `Question`, `QuizTemplate`, `QuizSession` interfaces into a shared package (`packages/types/`) consumed by both FE and BE.
4. **Dev Tooling**: Add ESLint/Prettier configs aligned between FE/BE, configure `tsconfig` paths, set up environment variable management (`.env`, schema validation via `envalid`).

This architecture keeps the system modular, respects the product roadmap, and allows future additions such as adaptive engines or spaced repetition without major refactors.
