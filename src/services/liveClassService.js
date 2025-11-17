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

export const getLiveClasses = async (batchId) => {
  const q = query(
    collection(db, 'liveClasses'),
    where('batchId', '==', batchId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getLiveClass = async (classId) => {
  const docRef = doc(db, 'liveClasses', classId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createLiveClass = async (classData) => {
  const docRef = await addDoc(collection(db, 'liveClasses'), {
    ...classData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateLiveClass = async (classId, classData) => {
  const docRef = doc(db, 'liveClasses', classId);
  await updateDoc(docRef, {
    ...classData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteLiveClass = async (classId) => {
  await deleteDoc(doc(db, 'liveClasses', classId));
};

// Attendance
export const markAttendance = async (classId, userId, status = 'present') => {
  const q = query(
    collection(db, 'liveClassAttendance'),
    where('classId', '==', classId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // Update existing
    const attendanceRef = doc(db, 'liveClassAttendance', snapshot.docs[0].id);
    await updateDoc(attendanceRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Create new
    await addDoc(collection(db, 'liveClassAttendance'), {
      classId,
      userId,
      status,
      createdAt: new Date().toISOString(),
    });
  }
};

export const getClassAttendance = async (classId) => {
  const q = query(
    collection(db, 'liveClassAttendance'),
    where('classId', '==', classId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserAttendance = async (userId, batchId) => {
  // Get all classes for batch
  const classes = await getLiveClasses(batchId);
  const classIds = classes.map(c => c.id);
  
  if (classIds.length === 0) return [];
  
  const q = query(
    collection(db, 'liveClassAttendance'),
    where('userId', '==', userId),
    where('classId', 'in', classIds)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


