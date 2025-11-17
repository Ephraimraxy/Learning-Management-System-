import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { verifyOTP, sendOTPEmail, generateOTP } from '../services/emailService';
import { useAuthStore } from '../stores/authStore';

// Prevent auto-redirect during verification
import toast from 'react-hot-toast';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, user: currentUser, userData } = useAuthStore();
  const email = searchParams.get('email') || sessionStorage.getItem('pendingVerificationEmail');
  const [password, setPassword] = useState(sessionStorage.getItem('pendingVerificationPassword') || '');
  const [otpPrefilled, setOtpPrefilled] = useState(sessionStorage.getItem('pendingVerificationOtpSent') === 'true');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const otpSentRef = useRef(false);

  // Load password from sessionStorage if not in URL
  useEffect(() => {
    const storedPassword = sessionStorage.getItem('pendingVerificationPassword');
    if (storedPassword) {
      setPassword(storedPassword);
    }
  }, []);

  const sendNewOTP = async (isResend = false) => {
    if (!email) return;
    
    if (isResend) {
      setResending(true);
    }
    
    try {
      const otp = generateOTP();
      const result = await sendOTPEmail(email, otp);
      
      if (result.success) {
        toast.success(isResend ? 'New OTP code sent to your email!' : 'OTP code sent to your email!');
        sessionStorage.setItem('pendingVerificationOtpSent', 'true');
        setOtpPrefilled(true);
        // For development: show OTP in console and toast (only in dev mode)
        if (result.devMode && (import.meta.env.DEV || process.env.NODE_ENV === 'development')) {
          console.log(`[DEV] OTP Code for ${email}: ${otp}`);
          toast.info(`[DEV MODE] OTP Code: ${otp}`, { duration: 15000 });
        }
        if (!isResend) {
          otpSentRef.current = true;
        }
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP code');
    } finally {
      if (isResend) {
        setResending(false);
      }
    }
  };

  // Send OTP only once when component mounts with email
  useEffect(() => {
    if (otpPrefilled && !otpSentRef.current) {
      otpSentRef.current = true;
    }
    if (email && !verified && !currentUser && !otpSentRef.current) {
      sendNewOTP(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, verified, currentUser, otpPrefilled]); // Only depend on essentials to prevent multiple sends

  // Prevent auto-redirect if user accidentally gets logged in during verification
  useEffect(() => {
    if (currentUser && email && !verified) {
      // User got logged in but still needs to verify - sign them out immediately
      signOut(auth).catch(() => {
        // Ignore errors
      });
    }
  }, [currentUser, email, verified]);

  // Clean up session storage on unmount if verification not completed
  useEffect(() => {
    return () => {
      if (!verified) {
        // Keep session storage if verification is in progress
        // It will be cleared after successful verification
      }
    };
  }, [verified]);

  // Prevent redirect if user is already logged in but on verification page (without email param)
  useEffect(() => {
    if (currentUser && !email && !verified) {
      // User is logged in but shouldn't be here - redirect to dashboard
      const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';
      navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [currentUser, email, verified, userData, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      // First verify the OTP
      const result = await verifyOTP(email, otpCode);
      
      if (result.success) {
        setVerified(true);
        toast.success('Email verified successfully!');
        
        // Check if this is a new signup (has pending signup data)
        const pendingSignupDoc = await getDoc(doc(db, 'pendingSignups', email));
        
        if (pendingSignupDoc.exists() && password) {
          // This is a new signup - create account NOW after verification
          const pendingData = pendingSignupDoc.data();
          
          try {
            // Create Firebase Auth account (only after OTP verification)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create Firestore user document (only after verification)
            await setDoc(doc(db, 'users', user.uid), {
              name: pendingData.name || name,
              email: email,
              role: 'student',
              emailVerified: true,
              status: 'active',
              registered: true,
              createdAt: new Date().toISOString(),
              verifiedAt: new Date().toISOString(),
            });
            
            // Clean up temporary signup data
            await deleteDoc(doc(db, 'pendingSignups', email));
            
            // Set user in auth store
            setUser(user);
            toast.success('Account created and logged in successfully!');
            
            // Clear session storage
            sessionStorage.removeItem('pendingVerificationEmail');
            sessionStorage.removeItem('pendingVerificationPassword');
            sessionStorage.removeItem('pendingVerificationOtpSent');
            
            // Redirect to student dashboard (new signups are always students)
            navigate('/student/dashboard', { replace: true });
          } catch (createError) {
            console.error('Account creation failed:', createError);
            
            // Handle specific errors
            let errorMessage = 'Failed to create account. Please try again.';
            if (createError.code === 'auth/email-already-in-use') {
              errorMessage = 'This email is already registered. Please sign in instead.';
              // Clean up pending signup since account already exists
              await deleteDoc(doc(db, 'pendingSignups', email));
            }
            
            toast.error(errorMessage);
            setTimeout(() => {
              navigate('/login', { replace: true });
            }, 2000);
          }
        } else if (password) {
          // This is an existing user trying to verify (shouldn't happen with new flow, but handle it)
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update existing user document
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              await setDoc(doc(db, 'users', user.uid), {
                emailVerified: true,
                status: 'active',
                registered: true,
                verifiedAt: new Date().toISOString(),
              }, { merge: true });
            }
            
            setUser(user);
            toast.success('Email verified and logged in successfully!');
            
            // Clear session storage
            sessionStorage.removeItem('pendingVerificationEmail');
            sessionStorage.removeItem('pendingVerificationPassword');
            sessionStorage.removeItem('pendingVerificationOtpSent');
            
            // Redirect based on role
            const userData = userDoc.exists() ? userDoc.data() : {};
            const isAdmin = userData.role === 'admin' || userData.role === 'instructor';
            navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true });
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            toast.error('Verification successful! Please login manually.');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } else {
          // No password provided - just update verification status for existing account
          try {
            const usersQuery = query(collection(db, 'users'), where('email', '==', email));
            const usersSnapshot = await getDocs(usersQuery);
            
            if (!usersSnapshot.empty) {
              const userDoc = usersSnapshot.docs[0];
              await setDoc(doc(db, 'users', userDoc.id), {
                emailVerified: true,
                status: 'active',
                registered: true,
                verifiedAt: new Date().toISOString(),
              }, { merge: true });
            }
          } catch (error) {
            console.warn('Failed to update user document:', error);
          }
          
          // Clear session storage
          sessionStorage.removeItem('pendingVerificationEmail');
          sessionStorage.removeItem('pendingVerificationPassword');
          sessionStorage.removeItem('pendingVerificationOtpSent');
          
          toast.success('Email verified! You can now login.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } else {
        toast.error(result.message || 'Invalid OTP code');
      }
    } catch (error) {
      toast.error('Failed to verify OTP code');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Email Verified!
          </h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. {password ? 'Logging you in...' : 'You can now login to your account.'}
          </p>
          {!password && (
            <Link to="/login" className="btn btn-primary w-full">
              Go to Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-100 rounded-full">
              <Mail className="h-16 w-16 text-primary-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-1">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-lg font-semibold text-primary-600 mb-6">
            {email || 'your email'}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="btn btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => sendNewOTP(true)}
                disabled={resending}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                {resending ? 'Sending...' : "Didn't receive code? Resend"}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default EmailVerification;

