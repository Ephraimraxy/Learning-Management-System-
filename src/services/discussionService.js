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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Discussions
export const getDiscussions = async (batchId) => {
  const q = query(
    collection(db, 'discussions'),
    where('batchId', '==', batchId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createDiscussion = async (discussionData) => {
  const docRef = await addDoc(collection(db, 'discussions'), {
    ...discussionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const subscribeToDiscussions = (batchId, callback) => {
  const q = query(
    collection(db, 'discussions'),
    where('batchId', '==', batchId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const discussions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(discussions);
  });
};

// Comments/Replies
export const getComments = async (discussionId) => {
  const q = query(
    collection(db, 'comments'),
    where('discussionId', '==', discussionId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createComment = async (commentData) => {
  const docRef = await addDoc(collection(db, 'comments'), {
    ...commentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const subscribeToComments = (discussionId, callback) => {
  const q = query(
    collection(db, 'comments'),
    where('discussionId', '==', discussionId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(comments);
  });
};

// Lesson Comments
export const getLessonComments = async (lessonId) => {
  const q = query(
    collection(db, 'lessonComments'),
    where('lessonId', '==', lessonId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createLessonComment = async (commentData) => {
  const docRef = await addDoc(collection(db, 'lessonComments'), {
    ...commentData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

