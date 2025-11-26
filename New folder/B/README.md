# Daily + React + Firebase LMS Starter

Starter repository integrating Daily.co (web SDK) with a React frontend and Firebase (Cloud Functions + Firestore).
This project gives you a cloneable repo you can fork and modify for your LMS.

## Features
- React frontend (Vite) with a Classroom page using Daily's React SDK
- Firebase Cloud Functions to create Daily rooms and generate meeting tokens (server-side)
- Firestore usage points for sessions/attendance/metadata
- Clear env examples and run instructions

## What you must provide
- A Daily API key (create at https://dashboard.daily.co)
- A Firebase project (with Firebase CLI installed and initialized)

## Quick start (local)
1. Clone the repo
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install functions dependencies:
   ```bash
   cd ../functions
   npm install
   ```
4. Set environment variables:
   - Copy `.env.example` files and fill values (frontend/.env, functions/.env)
5. Start the frontend dev server:
   ```bash
   cd ../frontend
   npm run dev
   ```
6. Deploy/Run Firebase Functions:
   - For local testing, use `firebase emulators:start` (requires Firebase CLI)
   - Or deploy to your Firebase project: `firebase deploy --only functions`
7. Open the Classroom page and test joining as teacher/student.

## Project layout
- frontend/         # React app (Vite)
- functions/        # Firebase Cloud Functions (HTTP endpoints)
- firebase.json     # Firebase config (hosting + functions) - minimal
- README.md

---

If you want, I can:
- Customize UI (colors, layout) to match your LMS
- Add Firestore rules and sample security policies
- Add CI config (GitHub Actions) for auto-deploy to Firebase Hosting

Enjoy — download the starter repo zip and open it locally.
