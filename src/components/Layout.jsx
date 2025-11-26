import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, BookOpen, Users, FileText, Award, BarChart3, Menu, X, Briefcase, Settings, Bell, MessageSquare, Megaphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadNotifications } from '../services/notificationService';

const Layout = () => {
  const { user, userData, logout } = useAuthStore();
  const navigate = useNavigate();


  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const notifications = await getUnreadNotifications(user.uid);
        setUnreadCount(notifications.length);
      } catch (error) {
        // Silently fail - notifications are not critical
        // This might happen if Firestore index is not created yet
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/batches', label: 'Batches', icon: Users },
    { path: '/quizzes', label: 'Quizzes', icon: FileText },
    { path: '/assignments', label: 'Assignments', icon: FileText },
    { path: '/programs', label: 'Programs', icon: Award },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
  ];

  if (userData?.role === 'instructor' || userData?.role === 'admin') {
    navItems.push({ path: '/statistics', label: 'Statistics', icon: BarChart3 });
    navItems.push({ path: '/settings', label: 'Settings', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">LMS</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/notifications"
                    className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/certificates"
                    className="hidden md:block p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    title="Certificates"
                  >
                    <Award className="h-5 w-5" />
                  </Link>
                  <Link
                    to={`/profile/${user.uid}`}
                    className="hidden md:block text-sm text-gray-700 hover:text-primary-600"
                  >
                    {userData?.name || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary"
                >
                  Login
                </Link>
              )}


            </div>
          </div>
        </div>


      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            © 2025 LMS - Learning Management System. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Navigation - Horizontal Scroll */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 overflow-x-auto bg-white scrollbar-hide shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <nav className="flex px-4 py-2 space-x-6 min-w-max justify-around w-full">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center px-1 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 whitespace-nowrap"
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              to={`/profile/${user.uid}`}
              className="flex flex-col items-center justify-center px-1 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 whitespace-nowrap"
            >
              <Users className="h-5 w-5 mb-1" />
              Profile
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Layout;

