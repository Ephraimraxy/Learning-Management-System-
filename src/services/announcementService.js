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

export const getAnnouncements = async (batchId) => {
  const q = query(
    collection(db, 'announcements'),
    where('batchId', '==', batchId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createAnnouncement = async (announcementData) => {
  const docRef = await addDoc(collection(db, 'announcements'), {
    ...announcementData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateAnnouncement = async (announcementId, data) => {
  const docRef = doc(db, 'announcements', announcementId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteAnnouncement = async (announcementId) => {
  await deleteDoc(doc(db, 'announcements', announcementId));
};

export const subscribeToAnnouncements = (batchId, callback) => {
  const q = query(
    collection(db, 'announcements'),
    where('batchId', '==', batchId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(announcements);
  });
};

