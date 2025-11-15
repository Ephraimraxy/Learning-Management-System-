// Utility to ensure admin user document exists in Firestore
// This should be called after admin login if their document is missing

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ADMIN_EMAIL = 'hoseaephraim50@gmail.com';

export const ensureAdminDocument = async (user) => {
  try {
    if (!user || user.email !== ADMIN_EMAIL) {
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create admin document if it doesn't exist
      const adminData = {
        name: 'Admin',
        email: ADMIN_EMAIL,
        role: 'admin',
        emailVerified: user.emailVerified || true,
        createdAt: new Date().toISOString(),
        isDefaultAdmin: true,
      };
      
      await setDoc(doc(db, 'users', user.uid), adminData);
      return adminData;
    } else {
      // Update role to admin if it's not set correctly
      const userData = userDoc.data();
      if (userData.role !== 'admin' && userData.email === ADMIN_EMAIL) {
        await setDoc(
          doc(db, 'users', user.uid),
          { role: 'admin', isDefaultAdmin: true },
          { merge: true }
        );
        return { ...userData, role: 'admin', isDefaultAdmin: true };
      }
      return userData;
    }
  } catch (error) {
    console.error('Failed to ensure admin document:', error);
    return null;
  }
};

