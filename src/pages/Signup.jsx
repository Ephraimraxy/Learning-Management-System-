import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendOTPEmail, generateOTP } from '../services/emailService';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          
          // Update pending signup with new data
          await setDoc(doc(db, 'pendingSignups', email), {
            name,
            email,
            password, // Store encrypted or hashed in production
            otpCode,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
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
          sessionStorage.setItem('pendingVerificationOtpSent', 'true');
          
          navigate('/verify-email', { replace: true });
          toast.success('New OTP code sent to your email!');
          setLoading(false);
          return;
        }
      }

      // Generate OTP code
      const otpCode = generateOTP();

      // Store signup data temporarily in Firestore (NOT creating Firebase Auth account yet)
      // This will be used to create the account AFTER OTP verification
      await setDoc(doc(db, 'pendingSignups', email), {
        name,
        email,
        password, // Store encrypted or hashed in production - for now storing plaintext temporarily
        otpCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours expiry
      });

      // Send OTP email
      const emailResult = await sendOTPEmail(email, otpCode);
      
      if (!emailResult.success) {
        // If email sending fails, delete the pending signup
        await setDoc(doc(db, 'pendingSignups', email), {
          deleted: true,
        }, { merge: true });
        toast.error('Failed to send verification email. Please try again.');
        setLoading(false);
        return;
      }

      // Store email and password in sessionStorage for verification page
      sessionStorage.setItem('pendingVerificationEmail', email);
      sessionStorage.setItem('pendingVerificationPassword', password);
      sessionStorage.setItem('pendingVerificationOtpSent', 'true');
      
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
              disabled={loading}
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

