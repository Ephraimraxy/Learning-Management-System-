import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { user, userData } = useAuthStore();
  const pendingEmail = typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationEmail') : null;
  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';
  const needsVerification = !isAdmin && (
    (userData && (userData.status === 'pendingVerification' || userData.emailVerified === false)) ||
    (!userData && pendingEmail)
  );

  if (needsVerification) {
    const emailParam = encodeURIComponent(user?.email || userData?.email || pendingEmail || '');
    if (typeof window !== 'undefined' && !pendingEmail && (user?.email || userData?.email)) {
      sessionStorage.setItem('pendingVerificationEmail', user?.email || userData?.email);
    }
    return <Navigate to={`/verify-email${emailParam ? `?email=${emailParam}` : ''}`} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

