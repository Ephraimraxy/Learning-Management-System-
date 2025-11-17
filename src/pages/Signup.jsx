import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { sendOTPEmail, generateOTP } from '../services/emailService';
import toast from 'react-hot-toast';
import { BookOpen, Mail } from 'lucide-react';

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate OTP code
      const otpCode = generateOTP();

      // Send OTP email
      const emailResult = await sendOTPEmail(email, otpCode);
      
      if (!emailResult.success) {
        // If email sending fails, delete the user account
        await user.delete();
        toast.error('Failed to send verification email. Please try again.');
        setLoading(false);
        return;
      }

      // Create a PENDING user document in Firestore (not fully registered yet)
      // This document will be activated only after OTP verification
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: 'student',
        emailVerified: false,
        status: 'pendingVerification', // Account is pending until OTP verified
        createdAt: new Date().toISOString(),
        registered: false, // Not fully registered until OTP verified
      });

      // Sign out the user immediately - they need to verify OTP first
      await auth.signOut();
      
      // Store email and password in sessionStorage instead of URL (more secure)
      sessionStorage.setItem('pendingVerificationEmail', email);
      sessionStorage.setItem('pendingVerificationPassword', password);
      sessionStorage.setItem('pendingVerificationOtpSent', 'true');
      
      // Clear any auth state to prevent auto-redirect
      // Wait a moment to ensure signout completes and auth state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Redirect to OTP verification page (email/password stored in sessionStorage, not URL)
      // Use replace: true to prevent back navigation issues
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

