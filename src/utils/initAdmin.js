// Admin Initialization Script
// Run this once to create the default admin account

import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const ADMIN_EMAIL = 'hoseaephraim50@gmail.com';
const ADMIN_PASSWORD = '112233';

export const initializeAdmin = async () => {
  try {
    // Check if admin already exists in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('Admin account already exists!');
      return { success: false, message: 'Admin account already exists' };
    }

    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create admin user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: 'Admin',
      email: ADMIN_EMAIL,
      role: 'admin',
      emailVerified: false, // Will be true after email verification
      createdAt: new Date().toISOString(),
      isDefaultAdmin: true,
    });

    console.log('Admin account created successfully!');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Please verify the email address to complete setup.');
    
    // Sign out after creation
    await auth.signOut();
    
    return { 
      success: true, 
      message: 'Admin account created successfully! Please verify your email and then login.',
      userId: user.uid 
    };
  } catch (error) {
    console.error('Error creating admin account:', error);
    
    // If user already exists in Firebase Auth but not in Firestore
    if (error.code === 'auth/email-already-in-use') {
      return { 
        success: false, 
        message: 'Admin email already exists in Firebase Auth. Please check Firestore for user document.',
        error: error 
      };
    }
    
    return { 
      success: false, 
      message: error.message,
      error: error 
    };
  }
};

