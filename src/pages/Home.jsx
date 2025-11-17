import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

const Home = () => {
  const { user, userData } = useAuthStore();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (user && userData) {
      const isAdmin = userData.role === 'admin' || userData.role === 'instructor';
      if (isAdmin) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/student/dashboard';
      }
    }
  }, [user, userData]);

  if (user && userData) {
    const isAdmin = userData.role === 'admin' || userData.role === 'instructor';
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-600 rounded-full">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to LMS
          </h1>
          <p className="text-xl text-gray-600">
            Learning Management System - Your gateway to structured learning
          </p>
        </div>

        {/* Login/Signup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Student Login */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <LogIn className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Login</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access your courses, track progress, and earn certificates
              </p>
              <Link
                to="/login"
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Student Signup */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">New Student</h2>
              <p className="text-gray-600 mb-6">
                Create an account to start learning. Email verification required.
              </p>
              <Link
                to="/signup"
                className="btn bg-green-600 text-white hover:bg-green-700 w-full flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-lg inline-block mb-3">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Courses</h3>
            <p className="text-sm text-gray-600">Learn at your own pace with structured content</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Certified Learning</h3>
            <p className="text-sm text-gray-600">Earn certificates upon course completion</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-yellow-100 rounded-lg inline-block mb-3">
              <LogIn className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-600">Monitor your learning journey and achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

