import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  setDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getCertificates = async (userId) => {
  try {
    // Try with orderBy first (requires composite index)
    const q = query(
      collection(db, 'certificates'),
      where('userId', '==', userId),
      orderBy('issuedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index doesn't exist, fall back to simpler query and filter in memory
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        const q = query(
          collection(db, 'certificates'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const certificates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory
        return certificates.sort((a, b) => {
          const dateA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
          const dateB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
          return dateB - dateA;
        });
      } catch (fallbackError) {
        console.warn('Failed to fetch certificates:', fallbackError);
        return [];
      }
    }
    // For other errors, return empty array
    console.warn('Failed to fetch certificates:', error);
    return [];
  }
};

export const getCertificate = async (certificateId) => {
  const docRef = doc(db, 'certificates', certificateId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createCertificate = async (certificateData) => {
  const docRef = await addDoc(collection(db, 'certificates'), {
    ...certificateData,
    issuedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getCertificateTemplate = async () => {
  const docRef = doc(db, 'certificateTemplates', 'default');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return getDefaultTemplate();
};

export const updateCertificateTemplate = async (template) => {
  const docRef = doc(db, 'certificateTemplates', 'default');
  await setDoc(docRef, {
    ...template,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

const getDefaultTemplate = () => ({
  title: 'Certificate of Completion',
  content: 'This is to certify that {{studentName}} has successfully completed the course {{courseName}}.',
  signature: '',
  logo: '',
  backgroundColor: '#ffffff',
  textColor: '#000000',
});

