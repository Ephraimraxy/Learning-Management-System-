import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendOTPEmail, generateOTP } from '../services/emailService';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';
import { encryptValue } from '../utils/encryption';
import { shouldUseBackendEmail, getEmailApiBaseUrl } from '../utils/emailBackend';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailServiceStatus, setEmailServiceStatus] = useState({
    checking: true,
    online: false,
    message: '',
  });
  const navigate = useNavigate();

  const checkEmailService = useCallback(async () => {
    if (!shouldUseBackendEmail()) {
      setEmailServiceStatus({ checking: false, online: true, message: '' });
      return;
    }

    const baseUrl = getEmailApiBaseUrl();
    if (!baseUrl) {
      setEmailServiceStatus({
        checking: false,
        online: false,
        message: 'Email service is not configured. Please contact support.',
      });
      return;
    }

    setEmailServiceStatus((prev) => ({ ...prev, checking: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${baseUrl}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Unhealthy response');
      }
      setEmailServiceStatus({ checking: false, online: true, message: '' });
    } catch (error) {
      setEmailServiceStatus({
        checking: false,
        online: false,
        message: 'Email verification service is temporarily unavailable. Please retry shortly.',
      });
    }
  }, []);

  useEffect(() => {
    checkEmailService();
  }, [checkEmailService]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailServiceStatus.checking) {
      toast.error('Hold on a moment, we are validating the email service.');
      return;
    }

    if (!emailServiceStatus.online) {
      toast.error(emailServiceStatus.message || 'Email service unavailable. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      // Check if email is already registered (query users collection by email)
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        // Check if it's a verified account
        if (userData.registered && userData.status === 'active') {
          toast.error('This email is already registered. Please sign in instead.');
          setLoading(false);
          return;
        }
        // If pending/not verified, allow re-signup (will overwrite temporary data)
      }

      // Check if there's already a pending signup for this email
      const pendingSignupDoc = await getDoc(doc(db, 'pendingSignups', email));
      if (pendingSignupDoc.exists()) {
        const pendingData = pendingSignupDoc.data();
        const createdAt = new Date(pendingData.createdAt);
        const now = new Date();
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
        
        // If pending signup is less than 24 hours old, allow resending OTP
        if (hoursSinceCreation < 24) {
          // Generate new OTP
          const otpCode = generateOTP();
          const encryptedPassword = encryptValue(password);
          
          // Update pending signup with new data
          await setDoc(doc(db, 'pendingSignups', email), {
            name,
            email,
            passwordEncrypted: encryptedPassword,
            otpCode,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            verificationStatus: 'otpResent',
          }, { merge: true });
          
          // Send OTP email
          const emailResult = await sendOTPEmail(email, otpCode);
          
          if (!emailResult.success) {
            toast.error('Failed to send verification email. Please try again.');
            setLoading(false);
            return;
          }
          
          // Store in sessionStorage for verification page
          sessionStorage.setItem('pendingVerificationEmail', email);
          sessionStorage.setItem('pendingVerificationPassword', password);
          
          navigate('/verify-email', { replace: true });
          toast.success('New OTP code sent to your email!');
          setLoading(false);
          return;
        }
      }

      // Generate OTP code
      const otpCode = generateOTP();

      const encryptedPassword = encryptValue(password);

      // Store signup data temporarily in Firestore (NOT creating Firebase Auth account yet)
      await setDoc(doc(db, 'pendingSignups', email), {
        name,
        email,
        passwordEncrypted: encryptedPassword,
        otpCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours expiry
        verificationStatus: 'otpSent',
      });

      // Send OTP email
      const emailResult = await sendOTPEmail(email, otpCode);
      
      if (!emailResult.success) {
        // If email sending fails, delete the pending signup
        await deleteDoc(doc(db, 'pendingSignups', email));
        toast.error('Failed to send verification email. Please try again.');
        setLoading(false);
        return;
      }

      // Store email and password in sessionStorage for verification page
      sessionStorage.setItem('pendingVerificationEmail', email);
      sessionStorage.setItem('pendingVerificationPassword', password);
      
      // Redirect to OTP verification page
      navigate('/verify-email', { replace: true });
      toast.success('OTP code sent to your email!');
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      // Map Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address. Please enter a valid email.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many signup attempts. Please try again later.';
          break;
        default:
          // For unknown errors, show a generic message
          if (error.message && error.message.includes('Firebase')) {
            errorMessage = 'Unable to create account. Please check your information and try again.';
          } else {
            errorMessage = error.message || 'An error occurred. Please try again.';
          }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        {!emailServiceStatus.checking && !emailServiceStatus.online && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Email verification service is offline.</p>
            <p className="mt-1">{emailServiceStatus.message}</p>
            <button
              type="button"
              onClick={checkEmailService}
              className="mt-3 inline-flex items-center rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Retry health check
            </button>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || emailServiceStatus.checking || !emailServiceStatus.online}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

