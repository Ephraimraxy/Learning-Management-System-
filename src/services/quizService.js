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

export const getQuizzes = async (filters = {}) => {
  let q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
  
  if (filters.courseId) {
    q = query(q, where('courseId', '==', filters.courseId));
  }
  if (filters.lessonId) {
    q = query(q, where('lessonId', '==', filters.lessonId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getQuiz = async (quizId) => {
  const docRef = doc(db, 'quizzes', quizId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createQuiz = async (quizData) => {
  const docRef = await addDoc(collection(db, 'quizzes'), {
    ...quizData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateQuiz = async (quizId, quizData) => {
  const docRef = doc(db, 'quizzes', quizId);
  await updateDoc(docRef, {
    ...quizData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteQuiz = async (quizId) => {
  await deleteDoc(doc(db, 'quizzes', quizId));
};

// Quiz Submissions
export const submitQuiz = async (submissionData) => {
  const docRef = await addDoc(collection(db, 'quizSubmissions'), {
    ...submissionData,
    submittedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getQuizSubmissions = async (quizId) => {
  const q = query(
    collection(db, 'quizSubmissions'),
    where('quizId', '==', quizId),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserQuizSubmission = async (quizId, userId) => {
  const q = query(
    collection(db, 'quizSubmissions'),
    where('quizId', '==', quizId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const submissionDoc = snapshot.docs[0];
  return { id: submissionDoc.id, ...submissionDoc.data() };
};

