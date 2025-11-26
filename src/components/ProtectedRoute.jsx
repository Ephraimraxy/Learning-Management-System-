import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { user, userData } = useAuthStore();
  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';
  const needsVerification = !isAdmin && Boolean(
    userData && (userData.status === 'pendingVerification' || userData.emailVerified === false)
  );

  if (needsVerification) {
    const emailParam = encodeURIComponent(user?.email || userData?.email || '');
    return <Navigate to={`/verify-email${emailParam ? `?email=${emailParam}` : ''}`} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

