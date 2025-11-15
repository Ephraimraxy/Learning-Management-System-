# LMS React + Firebase Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier works)

## Step 1: Install Dependencies

```bash
cd lms-react-firebase
npm install
```

## Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Enable the following services:

### Authentication
- Go to Authentication > Sign-in method
- Enable "Email/Password"
- Optionally enable "Google" for social login

### Firestore Database
- Go to Firestore Database
- Click "Create database"
- Start in **test mode** (we'll update rules later)
- Choose a location close to you

### Storage (Optional, for file uploads)
- Go to Storage
- Click "Get started"
- Start in test mode
- Choose same location as Firestore

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app (name it "LMS")
5. Copy the Firebase configuration object

## Step 4: Configure Firebase in the App

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to Firestore Database > Rules
2. Copy the contents of `firestore.rules` file
3. Paste into the rules editor
4. Click "Publish"

## Step 6: Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Step 7: Create Your First User

1. Click "Sign up" in the app
2. Create an account with email/password
3. The user will be created in Firestore with role "student"

## Step 8: Create an Instructor/Admin (Optional)

To create an instructor or admin user:

1. Go to Firestore Database in Firebase Console
2. Navigate to `users` collection
3. Find your user document
4. Edit the document and change `role` field to:
   - `"instructor"` - Can create courses, quizzes, assignments
   - `"admin"` - Full access including statistics

## Project Structure

```
lms-react-firebase/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── config/         # Firebase configuration
│   ├── services/       # Firebase service functions
│   ├── stores/         # Zustand state management
│   └── styles/         # Global styles
├── firestore.rules     # Firestore security rules
└── package.json
```

## Features Implemented

✅ User Authentication (Email/Password)
✅ Course Management (Create, Read, Update, Delete)
✅ Chapter & Lesson Structure
✅ Course Enrollment
✅ Lesson Progress Tracking
✅ Batches & Live Classes
✅ Quizzes (Single/Multiple Choice)
✅ Assignments
✅ Programs (Learning Paths)
✅ User Profiles
✅ Statistics Dashboard (for instructors/admins)

## Next Steps

1. **Add File Upload**: Configure Firebase Storage for assignment submissions
2. **Add Certificates**: Implement certificate generation
3. **Add Notifications**: Set up Firebase Cloud Messaging
4. **Add Payments**: Integrate Stripe or similar for paid courses
5. **Add Video Hosting**: Integrate with Vimeo or YouTube API

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've configured Firebase in `src/config/firebase.js`

### "Permission denied" errors
- Check Firestore security rules are published
- Verify user role in Firestore `users` collection

### Port 3000 already in use
- Change port in `vite.config.js` or kill the process using port 3000

## Production Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Or deploy to Vercel/Netlify:
- Connect your GitHub repository
- Set build command: `npm run build`
- Set output directory: `dist`

