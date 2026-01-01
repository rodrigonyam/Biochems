# Biochems - Biomedical Sciences Exam Prep App

A comprehensive exam preparation application for biomedical sciences students, featuring adaptive quiz generation, practice questions, flashcards, and progress tracking.

## Project Structure

The main application is located in the `biochems-app/` directory.

## Deployment

### Vercel Deployment Settings

When deploying to Vercel, use these settings:

- **Framework Preset**: Vite
- **Root Directory**: `biochems-app`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Local Development

```bash
cd biochems-app
npm install
npm run dev
```

### Production Build

```bash
cd biochems-app
npm run build
npm run preview
```

## Features

- Adaptive quiz generation with difficulty scaling
- Practice question bank with detailed rationales
- Interactive flashcard system
- Progress tracking and analytics
- Session continuity across questions
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand, TanStack React Query
- **Styling**: Custom CSS with glassmorphism design
- **Build**: Vite with TypeScript compilation

## Architecture

See `/biochems-app/docs/` for detailed documentation on:
- Domain models and API contracts
- System architecture
- Database schemas
- Deployment strategies