<div align="center">

# JUSTDO — Your Personal Home Workout Planner

**Train smart. Stay consistent. No gym required.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## The Story

JUSTDO started from a personal challenge: how do you build a consistent, personalized training routine when you don't have a gym membership, a trainer, or expensive equipment?

The answer is — you use what you have at home, build a smart plan, and just do it.

The app was originally prototyped using **Google AI Studio** as a foundation and then significantly extended, redesigned, and customized by hand — adding features like live workout sessions with audio cues, AI-powered plan generation, dark mode, CSV import/export, progress tracking, and more.

JUSTDO is built as an entrepreneurial tool: a real product that solves a real problem, designed to be clean, extensible, and ready to grow.

---

## What It Does

JUSTDO helps anyone build and follow a personalized home workout plan:

- **Custom Exercise Library** — Create, edit, and organize exercises by category, level, and muscle group
- **Workout Templates** — Build reusable workout sessions from your library
- **Weekly Planner** — Map templates to days of the week and run your program
- **Live Workout Session** — Real-time timer, audio cues (tick, finish, relax), set/rep tracking, and mid-session edits
- **AI Plan Generator** — Powered by Google Gemini: describe your goals, get a full weekly plan
- **Personal AI Coach** — Chat with an AI coach for advice and exercise guidance
- **Progress Tracker** — Log completed workouts, view history, and export data as CSV
- **Dark Mode** — Full light/dark theme support
- **Import / Export** — CSV import for exercises, templates, and plans — makes the app data-portable

---

## Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS |
| AI Integration | Google Gemini API (`@google/genai`) |
| State / Storage | React hooks + localStorage |
| Audio | Native HTML5 Audio API |

No backend, no database. Fully client-side — runs anywhere.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/liorbarworkspace/justdo-workout-planner.git
cd justdo-workout-planner

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.local.example .env.local
# Then add your Gemini API key inside .env.local:
# GEMINI_API_KEY=your_key_here

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

The AI features (Plan Generator, Personal Coach) require a valid Gemini API key. All other features work without it.

---

## Project Structure

```
justdo/
├── App.tsx                  # Root component — state, routing, modals
├── types.ts                 # TypeScript interfaces
├── constants.ts             # Initial exercise library, templates, plans
├── components/
│   ├── WorkoutSessionPage   # Live workout timer with audio
│   ├── PlanGenerator        # AI-powered plan generation wizard
│   ├── PersonalCoachChat    # Gemini AI chat interface
│   ├── WorkoutPlanner       # Weekly schedule view
│   ├── ExerciseLibrary      # Exercise catalog management
│   ├── ProgressTracker      # History and analytics
│   └── ...                  # Modals, forms, icons
└── sounds/
    ├── ticking.mp3
    ├── finish.mp3
    └── relaxing.mp3
```

---

## Screenshots

> _Screenshots coming soon_

---

## Roadmap

- [ ] User accounts and multi-profile support
- [ ] Cloud sync
- [ ] Mobile app (React Native)
- [ ] Nutrition tracking integration
- [ ] Social / sharing features

---

## Credits

- Initial scaffold generated with [Google AI Studio](https://aistudio.google.com)
- Extended, redesigned, and maintained by **Lior Bar**
- AI features powered by [Google Gemini](https://ai.google.dev)

---

## License

Copyright (c) 2025 Lior Bar. All Rights Reserved.  
See [LICENSE](./LICENSE) for details.
