# Biomedical Sciences Exam Prep Web App

A Vite + React (TypeScript) experience to plan, drill, and track biomedical science exam prep. The interface highlights systems modules, adaptive quizzes, flashcards, and readiness metrics for upcoming assessments.

## Features
- Mission control hero with countdown, focus block, and quick CTAs.
- Module grid summarizing study threads, lab skills, and upcoming checkpoints.
- Precision practice stems that reveal rationales on demand and tag content by theme.
- Adaptive quiz generator that filters by topic and offers inline feedback plus explanations.
- Flashcard carousel with keyboard/enter support for flipping cards.
- Readiness telemetry covering mastery metrics, study hours, and weekly focus.
- Resource strip for fast access to external prep materials.

## Tech Stack
- React 19 + TypeScript
- Vite 7 build tooling
- Modern CSS with Space Grotesk typography and glassmorphism theme

## Subject Coverage
- Immunology
- Pharmacology
- Biochemistry
- Anatomy
- Physiology
- Neuroanatomy
- Microbiology

## Target Users
- Biomedical Sciences undergraduates
- Pre-med students
- Nursing students
- Allied health students

## Getting Started
```
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check and bundle for production
npm run preview    # preview the production build locally
```

## Project Structure
```
src/
  components/        # UI building blocks (Hero, ModuleGrid, QuizGenerator, etc.)
  data/              # Centralized TypeScript data + types (biomedData.ts)
  styles/            # Global theme + layout styles
  main.tsx           # App bootstrap
  App.tsx            # Layout composition
```

## Customization
- Update **src/data/biomedData.ts** to change modules, questions, flashcards, and resource links.
- Add new UI sections under **src/components/** and compose them in **App.tsx**.
- Adjust theming inside **src/styles/global.css** (color tokens, spacing, gradients).

## Accessibility & Testing Notes
- Interactive elements receive focus outlines and keyboard support (buttons, flashcards, quiz options).
- Run `npm run build` before deploys to ensure the strict TypeScript config passes.
