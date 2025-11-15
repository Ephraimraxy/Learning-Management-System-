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
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getNotes = async (userId, lessonId) => {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('lessonId', '==', lessonId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const noteDoc = snapshot.docs[0];
  return { id: noteDoc.id, ...noteDoc.data() };
};

export const getUserNotes = async (userId) => {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createOrUpdateNote = async (userId, lessonId, content) => {
  const existingNote = await getNotes(userId, lessonId);
  
  if (existingNote) {
    const docRef = doc(db, 'notes', existingNote.id);
    await updateDoc(docRef, {
      content,
      updatedAt: serverTimestamp(),
    });
    return existingNote.id;
  } else {
    const docRef = await addDoc(collection(db, 'notes'), {
      userId,
      lessonId,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }
};

export const deleteNote = async (noteId) => {
  await deleteDoc(doc(db, 'notes', noteId));
};

export const subscribeToNote = (userId, lessonId, callback) => {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('lessonId', '==', lessonId)
  );
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      const noteDoc = snapshot.docs[0];
      callback({ id: noteDoc.id, ...noteDoc.data() });
    }
  });
};

