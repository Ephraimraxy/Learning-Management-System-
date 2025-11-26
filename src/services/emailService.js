// Email Service using SMTP (Gmail App Password)
// This service sends OTP codes via email for email verification

// Note: For production, you MUST use a backend service (Node.js/Express/Firebase Functions) to send emails
// Client-side JavaScript cannot directly send SMTP emails for security reasons
import { shouldUseBackendEmail, getEmailApiBaseUrl } from '../utils/emailBackend';

import { shouldUseBackendEmail, getEmailApiBaseUrl } from '../utils/emailBackend';

export const sendOTPEmail = async (email, otpCode) => {
  try {
    // Store OTP in Firestore for validation
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const otpData = {
      email,
      code: otpCode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      verified: false,
    };
    
    // Store OTP in Firestore (temporary collection)
    await setDoc(doc(db, 'emailOTPs', email), otpData, { merge: true });
    
    const API_URL = getEmailApiBaseUrl();
    const useBackend = shouldUseBackendEmail() && Boolean(API_URL);
    
    if (!useBackend) {
      // Clean up OTP doc to avoid stale codes when email can't go out
      const { deleteDoc, doc: docRef } = await import('firebase/firestore');
      await deleteDoc(docRef(db, 'emailOTPs', email));
      return { success: false, message: 'Email service is not configured. Please contact support.' };
    }
    
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || 'Failed to send verification email.';
        const { deleteDoc, doc: docRef } = await import('firebase/firestore');
        await deleteDoc(docRef(db, 'emailOTPs', email));
        return { success: false, message };
      }
      
      return { success: true, message: 'OTP code sent to your email!' };
    } catch (apiError) {
      if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
        console.error('Email backend request failed:', apiError);
      }
      const { deleteDoc, doc: docRef } = await import('firebase/firestore');
      await deleteDoc(docRef(db, 'emailOTPs', email));
      return { success: false, message: 'Unable to reach email service. Please try again later.' };
    }
  } catch (error) {
    // Only log errors in development
    if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
      console.error('Failed to send OTP email:', error);
    }
    return { success: false, message: error.message };
  }
};

export const verifyOTP = async (email, code) => {
  try {
    const { doc, getDoc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    
    const otpDoc = await getDoc(doc(db, 'emailOTPs', email));
    
    if (!otpDoc.exists()) {
      return { success: false, message: 'No OTP found for this email' };
    }
    
    const otpData = otpDoc.data();
    
    // Check if OTP is expired
    if (new Date(otpData.expiresAt) < new Date()) {
      await deleteDoc(doc(db, 'emailOTPs', email));
      return { success: false, message: 'OTP code has expired. Please request a new one.' };
    }
    
    // Check if already verified
    if (otpData.verified) {
      return { success: false, message: 'This OTP code has already been used.' };
    }
    
    // Verify code
    if (otpData.code !== code) {
      return { success: false, message: 'Invalid OTP code. Please try again.' };
    }
    
    // Mark as verified and delete
    await deleteDoc(doc(db, 'emailOTPs', email));
    
    return { success: true, message: 'Email verified successfully!' };
  } catch (error) {
    // Only log errors in development
    if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
      console.error('Failed to verify OTP:', error);
    }
    return { success: false, message: error.message };
  }
};

export const generateOTP = () => {
  // Generate 6-digit OTP code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

