import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { useLoadingStore } from '../stores/loadingStore';
import toast from 'react-hot-toast';
import { BookOpen, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser, initializeAuth } = useAuthStore();
  const { loading, showLoading, hideLoading } = useLoadingStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoading('Signing in...');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified (Firebase Auth's internal flag)
      // This is a preliminary check before fetching user data from Firestore
      if (!user.emailVerified) {
        await auth.signOut();
        hideLoading();
        toast.error(
          'Please verify your email before signing in. Check your inbox for the verification code.',
          { duration: 5000 }
        );
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      // Fetch user data to check if user is registered and get role
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      // Check if user document exists (user must be registered)
      if (!userDoc.exists()) {
        await auth.signOut();
        toast.error(
          'Account not found. Please sign up first to create an account.',
          { duration: 5000 }
        );
        setLoading(false);
        navigate('/signup');
        return;
      }

      const userData = userDoc.data();
      const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';

      // Check if email is verified (skip for admin/instructor)
      // For OTP verification, we check the Firestore status instead
      const needsVerification = userData.status === 'pendingVerification' && !isAdmin;

      if (needsVerification) {
        await auth.signOut();
        toast.error(
          'Please verify your email with the OTP code before signing in. Check your inbox for the verification code.',
          { duration: 5000 }
        );
        // Redirect to OTP verification page
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        setLoading(false);
        return;
      }

      // Also check Firebase Auth email verification as fallback
      if (!user.emailVerified && !isAdmin && userData.status !== 'active') {
        await auth.signOut();
        toast.error(
          'Please verify your email before signing in. Check your inbox for the verification code.',
          { duration: 5000 }
        );
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        setLoading(false);
        return;
      }

      // If email is verified and account was pending, activate the account
      if (user.emailVerified && userData.status === 'pendingVerification' && !isAdmin) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            ...userData,
            emailVerified: true,
            status: 'active', // Activate the account
            registered: true, // Mark as fully registered
            verifiedAt: new Date().toISOString(),
          }, { merge: true });
          // Update userData for immediate use
          userData.status = 'active';
          userData.registered = true;
          userData.verifiedAt = new Date().toISOString();
        } catch (error) {
          console.warn('Failed to activate account:', error);
          // Continue anyway - account will be updated on next login
        }
      }

      setUser(user);
      toast.success('Logged in successfully!');

      // Redirect based on role (admins determined by Firestore role)
      if (isAdmin) {
        hideLoading(); // Added hideLoading
        navigate('/admin/dashboard');
      } else {
        hideLoading(); // Added hideLoading
        navigate('/student/dashboard');
      }
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';

      // Map Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please check your password and try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address. Please enter a valid email.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'This sign-in method is not enabled. Please contact support.';
          break;
        default:
          // For unknown errors, show a generic message
          if (error.message && error.message.includes('Firebase')) {
            errorMessage = 'Unable to sign in. Please check your email and password.';
          } else {
            errorMessage = error.message || 'An error occurred. Please try again.';
          }
      }

      toast.error(errorMessage);
    } finally {
      hideLoading();
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input rounded-t-md"
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
                className="input rounded-b-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <p className="text-xs">
                Make sure you've verified your email address before signing in.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

