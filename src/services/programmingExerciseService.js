import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getProgrammingExercises = async (courseId) => {
  const q = query(
    collection(db, 'programmingExercises'),
    where('courseId', '==', courseId),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProgrammingExercise = async (exerciseId) => {
  const docRef = doc(db, 'programmingExercises', exerciseId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createProgrammingExercise = async (exerciseData) => {
  const docRef = await addDoc(collection(db, 'programmingExercises'), {
    ...exerciseData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateProgrammingExercise = async (exerciseId, data) => {
  const docRef = doc(db, 'programmingExercises', exerciseId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Submissions
export const getExerciseSubmissions = async (exerciseId) => {
  const q = query(
    collection(db, 'exerciseSubmissions'),
    where('exerciseId', '==', exerciseId),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserExerciseSubmission = async (exerciseId, userId) => {
  const q = query(
    collection(db, 'exerciseSubmissions'),
    where('exerciseId', '==', exerciseId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const submissionDoc = snapshot.docs[0];
  return { id: submissionDoc.id, ...submissionDoc.data() };
};

export const submitExercise = async (submissionData) => {
  const docRef = await addDoc(collection(db, 'exerciseSubmissions'), {
    ...submissionData,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  });
  return docRef.id;
};

// Note: Code execution would typically be done via a backend service
// This is a placeholder for the submission structure
export const executeCode = async (code, language, testCases) => {
  // This would call an external code execution service
  // For now, return a mock response
  return {
    passed: false,
    results: [],
    error: 'Code execution service not configured',
  };
};

