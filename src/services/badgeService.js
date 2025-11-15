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

export const getBadges = async () => {
  const snapshot = await getDocs(collection(db, 'badges'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBadge = async (badgeId) => {
  const docRef = doc(db, 'badges', badgeId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createBadge = async (badgeData) => {
  const docRef = await addDoc(collection(db, 'badges'), {
    ...badgeData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getUserBadges = async (userId) => {
  const q = query(
    collection(db, 'userBadges'),
    where('userId', '==', userId),
    orderBy('earnedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const awardBadge = async (userId, badgeId) => {
  // Check if user already has this badge
  const q = query(
    collection(db, 'userBadges'),
    where('userId', '==', userId),
    where('badgeId', '==', badgeId)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    await addDoc(collection(db, 'userBadges'), {
      userId,
      badgeId,
      earnedAt: new Date().toISOString(),
    });
  }
};

