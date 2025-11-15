// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkVIUBwpB3NVSO968GyDYMACjkd_9_OGM",
  authDomain: "pcmd-8dd21.firebaseapp.com",
  projectId: "pcmd-8dd21",
  storageBucket: "pcmd-8dd21.firebasestorage.app",
  messagingSenderId: "252373878878",
  appId: "1:252373878878:web:4ccc78356e99570d52cccf",
  measurementId: "G-GX1CRZY80C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;

