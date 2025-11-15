# LMS - Learning Management System (React + Firebase)

A modern Learning Management System built with React and Firebase, featuring the same scope and functionality as Frappe LMS.

## Features

- **Structured Learning**: Course → Chapter → Lesson hierarchy
- **Batches**: Group learners into batches with live classes
- **Quizzes**: Single-choice, multiple-choice, and open-ended questions
- **Assignments**: Document submission and grading
- **Certifications**: Certificate generation and management
- **Programs**: Learning paths with multiple courses
- **Live Classes**: Integration with video conferencing
- **User Profiles**: Complete user management with roles
- **Statistics**: Dashboard with analytics
- **Notifications**: Real-time notifications

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Copy your Firebase config to `src/config/firebase.js`

3. Start development server:
```bash
npm run dev
```

## Firebase Setup

1. Enable Authentication (Email/Password, Google)
2. Create Firestore database
3. Enable Storage for file uploads
4. Set up Firestore security rules (see `firestore.rules`)

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── config/        # Firebase configuration
├── hooks/         # Custom React hooks
├── services/      # Firebase services
├── stores/        # Zustand stores
├── utils/         # Utility functions
└── styles/        # Global styles
```

## License

MIT

