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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export const getAssignments = async (filters = {}) => {
  let q = query(collection(db, 'assignments'), orderBy('dueDate', 'desc'));
  
  if (filters.courseId) {
    q = query(q, where('courseId', '==', filters.courseId));
  }
  if (filters.batchId) {
    q = query(q, where('batchId', '==', filters.batchId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAssignment = async (assignmentId) => {
  const docRef = doc(db, 'assignments', assignmentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createAssignment = async (assignmentData) => {
  const docRef = await addDoc(collection(db, 'assignments'), {
    ...assignmentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateAssignment = async (assignmentId, data) => {
  const docRef = doc(db, 'assignments', assignmentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Submissions
export const getSubmissions = async (assignmentId) => {
  const q = query(
    collection(db, 'assignmentSubmissions'),
    where('assignmentId', '==', assignmentId),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserSubmission = async (assignmentId, userId) => {
  const q = query(
    collection(db, 'assignmentSubmissions'),
    where('assignmentId', '==', assignmentId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const submissionDoc = snapshot.docs[0];
  return { id: submissionDoc.id, ...submissionDoc.data() };
};

export const submitAssignment = async (submissionData) => {
  const docRef = await addDoc(collection(db, 'assignmentSubmissions'), {
    ...submissionData,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  });
  return docRef.id;
};

export const uploadSubmissionFile = async (file, submissionId) => {
  const fileRef = ref(storage, `assignments/${submissionId}/${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

export const gradeSubmission = async (submissionId, grade, feedback) => {
  const docRef = doc(db, 'assignmentSubmissions', submissionId);
  await updateDoc(docRef, {
    grade,
    feedback,
    status: 'graded',
    gradedAt: new Date().toISOString(),
  });
};

