import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BookOpen } from 'lucide-react';

const Home = () => {
  const { user, userData } = useAuthStore();
  const [isGreen, setIsGreen] = useState(false);

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

  // Background Animation Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGreen((prev) => !prev);
    }, 2000); // Toggle every 2 seconds for a smoother transition
    return () => clearInterval(interval);
  }, []);

  if (user && userData) {
    const isAdmin = userData.role === 'admin' || userData.role === 'instructor';
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000 ease-in-out ${isGreen ? 'bg-green-100/80' : 'bg-white'
        }`}
    >
      <div className="max-w-4xl w-full text-center space-y-12">

        {/* Icon */}
        <div className="flex justify-center">
          <BookOpen className="h-20 w-20 text-green-600" strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Welcome to LMS
          </h1>
          <p className="text-xl md:text-2xl text-green-700 font-medium">
            Your journey to agribusiness knowledge starts here
          </p>
        </div>

        {/* Get Started Button */}
        <div>
          <Link
            to="/get-started"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-green-600 hover:bg-green-700 md:text-xl md:px-10 transition-transform hover:scale-105 shadow-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-gray-500">
            Powered by Burst-Brain Concept
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;

