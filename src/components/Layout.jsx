import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, BookOpen, Users, FileText, Award, BarChart3, Menu, X, Briefcase, Settings, Bell, MessageSquare, Megaphone, Home, GraduationCap, ClipboardList, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadNotifications } from '../services/notificationService';
import ChatWidget from './ChatWidget';

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
    { path: '/', label: 'Home', icon: Home },
    { path: '/courses', label: 'Courses', icon: GraduationCap },
    { path: '/batches', label: 'Batches', icon: Users },
    { path: '/quizzes', label: 'Quizzes', icon: ClipboardList },
    { path: '/assignments', label: 'Assignments', icon: CheckSquare },
    { path: '/programs', label: 'Programs', icon: Award },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
  ];

  const [isFieldMode, setIsFieldMode] = useState(false);

  if (userData?.role === 'instructor' || userData?.role === 'admin') {
    navItems.push({ path: '/statistics', label: 'Statistics', icon: BarChart3 });
    navItems.push({ path: '/settings', label: 'Settings', icon: Settings });
  }

  return (
    <div className={`min-h-screen ${isFieldMode ? 'bg-black text-yellow-400' : 'bg-gray-50'} pb-20 md:pb-0 transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isFieldMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className={`h-8 w-8 ${isFieldMode ? 'text-yellow-400' : 'text-primary-600'}`} />
              <span className={`text-xl font-bold ${isFieldMode ? 'text-yellow-400' : 'text-gray-900'}`}>LMS</span>
            </Link>

            {/* Field Mode Toggle */}
            <button
              onClick={() => setIsFieldMode(!isFieldMode)}
              className={`ml-4 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 transition-all ${isFieldMode
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
            >
              {isFieldMode ? (
                <>
                  <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                  <span>FIELD MODE ON</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>FIELD MODE OFF</span>
                </>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isFieldMode
                    ? 'text-yellow-100 hover:bg-gray-800 hover:text-yellow-400'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
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
                    className={`relative p-2 transition-colors ${isFieldMode ? 'text-yellow-400 hover:text-yellow-200' : 'text-gray-700 hover:text-primary-600'}`}
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
                    className={`hidden md:block p-2 transition-colors ${isFieldMode ? 'text-yellow-400 hover:text-yellow-200' : 'text-gray-700 hover:text-primary-600'}`}
                    title="Certificates"
                  >
                    <Award className="h-5 w-5" />
                  </Link>
                  <Link
                    to={`/profile/${user.uid}`}
                    className={`hidden md:block text-sm transition-colors ${isFieldMode ? 'text-yellow-100 hover:text-yellow-400' : 'text-gray-700 hover:text-primary-600'}`}
                  >
                    {userData?.name || user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${isFieldMode ? 'text-yellow-100 hover:text-red-400' : 'text-gray-700 hover:text-red-600'}`}
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
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isFieldMode ? 'high-contrast-mode' : ''}`}>
        <Outlet context={{ isFieldMode }} />
      </main>

      {/* Footer */}
      <footer className={`${isFieldMode ? 'bg-gray-900 border-gray-800 text-yellow-400/60' : 'bg-white border-gray-200 text-gray-600'} border-t mt-12 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm">
            © 2025 LMS - Learning Management System. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Navigation - Horizontal Scroll */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 overflow-x-auto scrollbar-hide shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ${isFieldMode ? 'bg-transparent backdrop-blur-sm' : 'bg-transparent backdrop-blur-sm'
        }`}>
        <nav className="flex px-3 py-3 space-x-2 min-w-max justify-start w-full">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${isFieldMode
                ? 'bg-gray-900/90 text-yellow-100 hover:bg-yellow-400 hover:text-black border border-yellow-400/30'
                : 'bg-white/90 text-gray-700 hover:bg-primary-600 hover:text-white shadow-sm border border-gray-200'
                }`}
            >
              <item.icon className="h-5 w-5 mb-1 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
          {user && (
            <Link
              to={`/profile/${user.uid}`}
              className={`group flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${isFieldMode
                ? 'bg-gray-900/90 text-yellow-100 hover:bg-yellow-400 hover:text-black border border-yellow-400/30'
                : 'bg-white/90 text-gray-700 hover:bg-primary-600 hover:text-white shadow-sm border border-gray-200'
                }`}
            >
              <Users className="h-5 w-5 mb-1 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[10px]">Profile</span>
            </Link>
          )}
        </nav>
      </div>

      {/* ISAC Chat Widget */}
      <ChatWidget isFieldMode={isFieldMode} />
    </div>
  );
};

export default Layout;

