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
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const liveClassesRef = collection(db, 'liveClasses');
const attendanceRef = collection(db, 'liveClassAttendance');

export const getLiveClasses = async (batchId) => {
  const q = query(
    liveClassesRef,
    where('batchId', '==', batchId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getLiveClass = async (classId) => {
  const docRef = doc(liveClassesRef, classId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const subscribeToLiveClass = (classId, callback) => {
  const docRef = doc(liveClassesRef, classId);
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() });
  });
};

export const createLiveClass = async (classData) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(liveClassesRef, {
    meetingProvider: 'daily',
    status: 'scheduled',
    recordingEnabled: true,
    recordingStatus: 'pending',
    attendeesExpected: [],
    ...classData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateLiveClass = async (classId, classData) => {
  const docRef = doc(liveClassesRef, classId);
  await updateDoc(docRef, {
    ...classData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteLiveClass = async (classId) => {
  await deleteDoc(doc(liveClassesRef, classId));
};

// Attendance
export const markAttendance = async (classId, userId, status = 'present') => {
  const q = query(
    attendanceRef,
    where('classId', '==', classId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // Update existing
    const attendanceDocRef = doc(attendanceRef, snapshot.docs[0].id);
    await updateDoc(attendanceDocRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Create new
    await addDoc(attendanceRef, {
      classId,
      userId,
      status,
      createdAt: new Date().toISOString(),
    });
  }
};

export const getClassAttendance = async (classId) => {
  const q = query(
    attendanceRef,
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
    attendanceRef,
    where('userId', '==', userId),
    where('classId', 'in', classIds)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateLiveClassStatus = async (classId, status) => {
  const docRef = doc(liveClassesRef, classId);
  await updateDoc(docRef, {
    status,
    statusChangedAt: new Date().toISOString(),
  });
};

export const saveLiveClassRecording = async (classId, recordingData) => {
  const docRef = doc(liveClassesRef, classId);
  await updateDoc(docRef, {
    recordingStatus: recordingData?.url ? 'available' : 'pending',
    recordingUrl: recordingData?.url || '',
    recordingNotes: recordingData?.notes || '',
    recordingDuration: recordingData?.duration || null,
    updatedAt: new Date().toISOString(),
  });
};





