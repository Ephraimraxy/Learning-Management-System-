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

export const getEvaluations = async (filters = {}) => {
  let q = query(collection(db, 'evaluations'), orderBy('scheduledDate', 'asc'));
  
  if (filters.courseId) {
    q = query(q, where('courseId', '==', filters.courseId));
  }
  if (filters.userId) {
    q = query(q, where('userId', '==', filters.userId));
  }
  if (filters.evaluatorId) {
    q = query(q, where('evaluatorId', '==', filters.evaluatorId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEvaluation = async (evaluationId) => {
  const docRef = doc(db, 'evaluations', evaluationId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createEvaluation = async (evaluationData) => {
  const docRef = await addDoc(collection(db, 'evaluations'), {
    ...evaluationData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'scheduled',
  });
  return docRef.id;
};

export const updateEvaluation = async (evaluationId, evaluationData) => {
  const docRef = doc(db, 'evaluations', evaluationId);
  await updateDoc(docRef, {
    ...evaluationData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteEvaluation = async (evaluationId) => {
  await deleteDoc(doc(db, 'evaluations', evaluationId));
};

// Evaluators
export const getEvaluators = async () => {
  const snapshot = await getDocs(collection(db, 'evaluators'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createEvaluator = async (evaluatorData) => {
  const docRef = await addDoc(collection(db, 'evaluators'), {
    ...evaluatorData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Evaluator Slots
export const getEvaluatorSlots = async (evaluatorId) => {
  const q = query(
    collection(db, 'evaluatorSlots'),
    where('evaluatorId', '==', evaluatorId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createEvaluatorSlot = async (slotData) => {
  const docRef = await addDoc(collection(db, 'evaluatorSlots'), {
    ...slotData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};


