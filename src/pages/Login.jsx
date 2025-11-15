import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { BookOpen, AlertCircle, Shield } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const isAdminLogin = searchParams.get('admin') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, userData } = useAuthStore();

  // Pre-fill admin credentials if admin login
  useEffect(() => {
    if (isAdminLogin) {
      setEmail('hoseaephraim50@gmail.com');
      setPassword('112233');
    }
  }, [isAdminLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
      
      // Redirect based on role
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
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
            {isAdminLogin ? (
              <Shield className="h-12 w-12 text-primary-600" />
            ) : (
              <BookOpen className="h-12 w-12 text-primary-600" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAdminLogin ? 'Admin Login' : 'Sign in to your account'}
          </h2>
          {!isAdminLogin && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </Link>
            </p>
          )}
          {isAdminLogin && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Use your admin credentials to access the dashboard
            </p>
          )}
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

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            {!isAdminLogin && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="text-xs">
                  Make sure you've verified your email address before signing in.
                </p>
              </div>
            )}
            {isAdminLogin && (
              <Link
                to="/"
                className="text-center text-sm text-primary-600 hover:text-primary-500 block"
              >
                ← Back to Home
              </Link>
            )}
          </div>
        </form>
        {!isAdminLogin && (
          <div className="text-center">
            <Link
              to="/login?admin=true"
              className="text-sm text-primary-600 hover:text-primary-500 flex items-center justify-center space-x-1"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

