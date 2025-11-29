import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Quizzes from './pages/Quizzes';
import QuizPage from './pages/QuizPage';
import Assignments from './pages/Assignments';
import AssignmentSubmission from './pages/AssignmentSubmission';
import AssignmentForm from './pages/AssignmentForm';
import Programs from './pages/Programs';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import CourseForm from './pages/CourseForm';
import QuizForm from './pages/QuizForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import Discussions from './pages/Discussions';
import Announcements from './pages/Announcements';
import CourseReviews from './pages/CourseReviews';
import Certificates from './pages/Certificates';
import Notifications from './pages/Notifications';
import Badges from './pages/Badges';
import PaymentCheckout from './pages/PaymentCheckout';
import ProgrammingExercise from './pages/ProgrammingExercise';
import Transactions from './pages/Transactions';
import Evaluations from './pages/Evaluations';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Skills from './pages/Skills';
import Coupons from './pages/Coupons';
import CertificateRequests from './pages/CertificateRequests';
import EmailVerification from './pages/EmailVerification';
import LiveClassroom from './pages/LiveClassroom';
import ProtectedRoute from './components/ProtectedRoute';
import GetStarted from './pages/GetStarted';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode';
import ResetPassword from './pages/ResetPassword';
import LoadingOverlay from './components/LoadingOverlay';


function App() {
  const { user, userData, loading, initializeAuth } = useAuthStore();
  const hasPendingVerification = typeof window !== 'undefined' && sessionStorage.getItem('pendingVerificationEmail');
  const shouldRedirectToDashboard = Boolean(user && !hasPendingVerification);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={!shouldRedirectToDashboard ? <Login /> : <Navigate to={userData?.role === 'admin' || userData?.role === 'instructor' ? '/admin/dashboard' : '/student/dashboard'} />} />
        <Route path="/signup" element={!shouldRedirectToDashboard ? <Signup /> : <Navigate to={userData?.role === 'admin' || userData?.role === 'instructor' ? '/admin/dashboard' : '/student/dashboard'} />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/get-started" element={!shouldRedirectToDashboard ? <GetStarted /> : <Navigate to={userData?.role === 'admin' || userData?.role === 'instructor' ? '/admin/dashboard' : '/student/dashboard'} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* Home page without layout for unauthenticated users */}
        <Route path="/" element={!shouldRedirectToDashboard ? <Home /> : <Navigate to={userData?.role === 'admin' || userData?.role === 'instructor' ? '/admin/dashboard' : '/student/dashboard'} replace />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/reviews" element={<CourseReviews />} />
          <Route path="/courses/:courseId/learn/:chapterId/:lessonId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/batches/:batchId" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
          <Route path="/batches/:batchId/discussions" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
          <Route path="/batches/:batchId/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/new" element={<ProtectedRoute><QuizForm /></ProtectedRoute>} />
          <Route path="/quizzes/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/quizzes/:quizId/edit" element={<ProtectedRoute><QuizForm /></ProtectedRoute>} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/new" element={<ProtectedRoute><AssignmentForm /></ProtectedRoute>} />
          <Route path="/assignments/:assignmentId" element={<ProtectedRoute><AssignmentSubmission /></ProtectedRoute>} />
          <Route path="/assignments/:assignmentId/edit" element={<ProtectedRoute><AssignmentForm /></ProtectedRoute>} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/courses/new" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
          <Route path="/courses/:courseId/edit" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/courses/:courseId/checkout" element={<ProtectedRoute><PaymentCheckout /></ProtectedRoute>} />
          <Route path="/exercises/:exerciseId" element={<ProtectedRoute><ProgrammingExercise /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
          <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
          <Route path="/certificate-requests" element={<ProtectedRoute><CertificateRequests /></ProtectedRoute>} />
          <Route path="/evaluations" element={<ProtectedRoute><Evaluations /></ProtectedRoute>} />
          <Route path="/live-classes/:classId" element={<ProtectedRoute><LiveClassroom /></ProtectedRoute>} />
        </Route>
      </Routes>
      <LoadingOverlay />
    </BrowserRouter>
  );
}

export default App;

