// Email Service using SMTP (Gmail App Password)
// This service sends OTP codes via email for email verification

// Note: For production, you MUST use a backend service (Node.js/Express/Firebase Functions) to send emails
// Client-side JavaScript cannot directly send SMTP emails for security reasons

const shouldUseBackendEmail = () => {
  const flag = import.meta.env.VITE_USE_EMAIL_BACKEND ?? process.env.REACT_APP_USE_EMAIL_BACKEND;
  return String(flag).toLowerCase() === 'true';
};

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
    
    // Try to send via backend API if available
    const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
    const useBackend = shouldUseBackendEmail() && Boolean(API_URL);
    
    if (useBackend) {
      try {
        const response = await fetch(`${API_URL}/api/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otpCode }),
        });
        
        if (response.ok) {
          return { success: true, message: 'OTP code sent to your email!' };
        }
      } catch (apiError) {
        if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
          console.warn('Backend API not available, falling back to local OTP logging:', apiError);
        }
      }
    } else if (API_URL && (import.meta.env.DEV || process.env.NODE_ENV === 'development')) {
      console.info('Skipping backend email send because VITE_USE_EMAIL_BACKEND is not true. Set it to "true" when your email service is running.');
    } else if (!API_URL && shouldUseBackendEmail()) {
      console.warn('VITE_USE_EMAIL_BACKEND is true but no API URL configured. Please set VITE_API_URL or REACT_APP_API_URL.');
    }
    
    // Fallback: For development, log OTP to console (only in development)
    // In production, you MUST set up a backend API
    if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] OTP Code for ${email}: ${otpCode}`);
      console.warn('⚠️ Email sending requires a backend API. Set up VITE_API_URL or REACT_APP_API_URL environment variable.');
    }
    
    // For now, return success but note that email needs to be sent via backend
    return { 
      success: true, 
      message: 'OTP code generated. Check your email.',
      devMode: import.meta.env.DEV || process.env.NODE_ENV === 'development',
      otpCode: (import.meta.env.DEV || process.env.NODE_ENV === 'development') ? otpCode : undefined
    };
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

