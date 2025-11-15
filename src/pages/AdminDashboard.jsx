import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getCourses } from '../services/courseService';
import { getAllStatistics } from '../services/statisticsService';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  Plus, 
  TrendingUp, 
  FileText,
  Settings,
  Calendar,
  Video,
  CheckCircle,
  Tag,
  Shield,
  ClipboardList,
  MessageSquare,
  Bell,
  CreditCard
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, userData } = useAuthStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
  });
  const [myCourses, setMyCourses] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get all courses created by admin/instructor
        const allCourses = await getCourses();
        const createdCourses = allCourses.filter(c => c.instructorId === user?.uid);
        setMyCourses(createdCourses.slice(0, 6));

        // Get all statistics
        const statistics = await getAllStatistics();
        setStats({
          totalCourses: createdCourses.length,
          totalStudents: statistics.totalStudents,
          totalEnrollments: statistics.totalEnrollments,
          totalCertificates: statistics.totalCertificates,
        });

        // Get recent enrollments
        const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
        const enrollments = enrollmentsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.enrolledAt || 0) - new Date(a.enrolledAt || 0))
          .slice(0, 5);
        setRecentEnrollments(enrollments);

        // Get pending certificate requests
        try {
          const certRequestsSnapshot = await getDocs(
            query(collection(db, 'certificateRequests'), where('status', '==', 'pending'))
          );
          setPendingRequests(certRequestsSnapshot.size);
        } catch (error) {
          console.error('Failed to fetch certificate requests:', error);
        }

        // Get recent users (last 5 signups)
        try {
          const usersSnapshot = await getDocs(
            query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))
          );
          setRecentUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error('Failed to fetch recent users:', error);
        }

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 md:p-12 text-white">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
          Welcome back, {userData?.name || 'Admin'}!
        </h1>
        <p className="text-base md:text-xl">
          Manage your courses, track student progress, and grow your learning platform
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Link 
          to="/courses/new" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Plus className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Create Course</p>
              <p className="text-xs md:text-sm text-gray-600">Add a new course</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/statistics" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Analytics</p>
              <p className="text-xs md:text-sm text-gray-600">View statistics</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/batches" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Manage Batches</p>
              <p className="text-xs md:text-sm text-gray-600">View all batches</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/settings" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Settings</p>
              <p className="text-xs md:text-sm text-gray-600">Configure LMS</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Additional Admin Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Link 
          to="/quizzes/new" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Create Quiz</p>
              <p className="text-xs md:text-sm text-gray-600">Add assessment</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/certificate-requests" 
          className="card hover:shadow-lg transition-shadow cursor-pointer relative"
        >
          {pendingRequests > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {pendingRequests}
            </span>
          )}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Certificates</p>
              <p className="text-xs md:text-sm text-gray-600">Review requests</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/coupons" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Tag className="h-5 w-5 md:h-6 md:w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Coupons</p>
              <p className="text-xs md:text-sm text-gray-600">Manage discounts</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/transactions" 
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold">Transactions</p>
              <p className="text-xs md:text-sm text-gray-600">View payments</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalCourses}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Courses</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalEnrollments}</p>
              <p className="text-xs sm:text-sm text-gray-600">Enrollments</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalCertificates}</p>
              <p className="text-xs sm:text-sm text-gray-600">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      {myCourses.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
              <span>My Courses</span>
            </h2>
            <Link 
              to="/courses" 
              className="text-primary-600 hover:text-primary-700 text-sm md:text-base"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {myCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-32 md:h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{course.shortIntroduction}</p>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span>{course.lessons || 0} Lessons</span>
                  {course.published ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Published
                    </span>
                  ) : (
                    <span className="text-yellow-600">Draft</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Enrollments */}
      {recentEnrollments.length > 0 && (
        <div className="card">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center space-x-2">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            <span>Recent Enrollments</span>
          </h2>
          <div className="space-y-3">
            {recentEnrollments.map((enrollment) => (
              <div 
                key={enrollment.id} 
                className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-medium">Course ID: {enrollment.courseId}</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    Progress: {enrollment.progress || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users */}
      {recentUsers.length > 0 && (
        <div className="card">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center space-x-2">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            <span>Recent Signups</span>
          </h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div 
                key={user.id} 
                className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-medium">{user.name || 'User'}</p>
                    <p className="text-xs md:text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role || 'student'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Link to="/assignments" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <ClipboardList className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="font-semibold text-lg">Manage Assignments</h3>
              <p className="text-sm text-gray-600">Review and grade submissions</p>
            </div>
          </div>
        </Link>
        
        <Link to="/batches" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <MessageSquare className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="font-semibold text-lg">Monitor Discussions</h3>
              <p className="text-sm text-gray-600">View and moderate discussions</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

