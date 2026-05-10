# JustDO — Home Workout App

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini%20API-4285F4?style=flat-square&logo=google&logoColor=white)

A personalized home workout system — runs entirely in the browser, no account required.

---

## Background

I built JustDO for people who train at home with minimal equipment and want a structured, flexible system — without subscriptions, accounts, or app store installs. Everything runs locally in the browser.

As part of my work providing AI training and consulting, I used this project to explore practical integration of AI APIs (Google Gemini) into a real-use productivity tool — applying AI not as a feature, but as a functional layer for planning and coaching.

---

## Features

- **Exercise Library** — create and tag custom exercises by equipment and muscle group
- **Workout Templates** — build reusable session structures
- **Weekly Planner** — schedule workouts across the week
- **Live Session** — real-time timer, audio cues, rep tracking
- **AI Plan Generator** — generates a personalized weekly plan via Gemini API
- **Personal Coach Chat** — AI coaching assistant during and between sessions
- **Progress Tracker** — session history with CSV export

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| AI | Google Gemini API |
| Storage | Browser localStorage (no backend) |

---

## Run Locally

**Prerequisites:** Node.js, a Gemini API key

```bash
npm install
```

Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
```
