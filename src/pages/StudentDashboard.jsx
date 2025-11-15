import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/courseService';
import { getUserEnrollments } from '../services/courseService';
import { getUserBatches } from '../services/batchService';
import { getLiveClasses } from '../services/liveClassService';
import { getRecommendedCourses } from '../services/relatedCoursesService';
import { useAuthStore } from '../stores/authStore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  BookOpen, 
  Users, 
  Award, 
  Calendar, 
  Video, 
  CheckCircle, 
  TrendingUp,
  Clock,
  PlayCircle,
  FileText,
  MessageSquare,
  Bell,
  Target
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, userData } = useAuthStore();
  const [myCourses, setMyCourses] = useState([]);
  const [myBatches, setMyBatches] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;

        // Get enrolled courses
        const enrollments = await getUserEnrollments(user.uid);
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        
        const enrolledCourses = await Promise.all(
          enrolledCourseIds.map(async (courseId) => {
            try {
              const { getCourse } = await import('../services/courseService');
              return await getCourse(courseId);
            } catch (error) {
              console.error('Failed to fetch course:', courseId);
              return null;
            }
          })
        );
        
        const validCourses = enrolledCourses.filter(c => c !== null);
        setMyCourses(validCourses.slice(0, 6));
        
        // Calculate stats
        const completed = validCourses.filter(c => {
          const enrollment = enrollments.find(e => e.courseId === c.id);
          return enrollment?.progress === 100;
        });
        
        // Get certificates count
        let certificatesCount = 0;
        try {
          const certsSnapshot = await getDocs(
            query(collection(db, 'certificates'), where('userId', '==', user.uid))
          );
          certificatesCount = certsSnapshot.size;
        } catch (error) {
          console.error('Failed to fetch certificates:', error);
        }

        setStats({
          enrolledCourses: validCourses.length,
          completedCourses: completed.length,
          certificates: certificatesCount,
          inProgress: validCourses.length - completed.length,
        });

        // Get batches
        const batches = await getUserBatches(user.uid);
        setMyBatches(batches.slice(0, 3));

        // Get upcoming live classes
        const allClasses = [];
        for (const batch of batches) {
          try {
            const classes = await getLiveClasses(batch.id);
            allClasses.push(...classes);
          } catch (error) {
            console.error('Failed to fetch classes for batch', batch.id);
          }
        }
        const now = new Date();
        const upcoming = allClasses
          .filter(c => new Date(c.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        setUpcomingClasses(upcoming);

        // Get recommended courses (using related courses service or fallback)
        try {
          const recommended = await getRecommendedCourses(user.uid);
          setRecommendedCourses(recommended.slice(0, 3));
        } catch (error) {
          // Fallback to simple recommendation
          const allCourses = await getCourses({ published: true });
          const recommended = allCourses
            .filter(c => !enrolledCourseIds.includes(c.id))
            .slice(0, 3);
          setRecommendedCourses(recommended);
        }

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
          Welcome back, {userData?.name || 'Student'}!
        </h1>
        <p className="text-base md:text-xl">
          Continue your learning journey and achieve your goals
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.enrolledCourses}</p>
              <p className="text-xs md:text-sm text-gray-600">Enrolled Courses</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.completedCourses}</p>
              <p className="text-xs md:text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs md:text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.certificates}</p>
              <p className="text-xs md:text-sm text-gray-600">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      {myCourses.length > 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-500">{course.lessons || 0} Lessons</span>
                  <div className="flex items-center space-x-1 text-primary-600">
                    <PlayCircle className="h-4 w-4" />
                    <span>Continue</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 md:py-12">
          <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold mb-2">No courses yet</h3>
          <p className="text-sm md:text-base text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
          <Link to="/courses" className="btn btn-primary inline-flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Browse Courses</span>
          </Link>
        </div>
      )}

      {/* Upcoming Live Classes */}
      {upcomingClasses.length > 0 && (
        <div className="card">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center space-x-2">
            <Video className="h-5 w-5 md:h-6 md:w-6" />
            <span>Upcoming Live Classes</span>
          </h2>
          <div className="space-y-3">
            {upcomingClasses.map((classItem) => (
              <div 
                key={classItem.id} 
                className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold mb-2">{classItem.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(classItem.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{classItem.time}</span>
                      </div>
                    </div>
                  </div>
                  {classItem.zoomLink && (
                    <a
                      href={classItem.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-sm whitespace-nowrap"
                    >
                      Join Class
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Batches */}
      {myBatches.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center space-x-2">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            <span>My Batches</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {myBatches.map((batch) => (
              <Link
                key={batch.id}
                to={`/batches/${batch.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg md:text-xl font-semibold mb-2">{batch.name}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{batch.description}</p>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-500">Progress: {batch.progress || 0}%</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              <span>Recommended for You</span>
            </h2>
            <Link 
              to="/courses" 
              className="text-primary-600 hover:text-primary-700 text-sm md:text-base"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recommendedCourses.map((course) => (
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
                  {course.rating && <span>⭐ {course.rating}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Student Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Link to="/assignments" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 rounded-lg mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">My Assignments</h3>
            <p className="text-xs text-gray-600">View and submit</p>
          </div>
        </Link>
        
        <Link to="/quizzes" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-green-100 rounded-lg mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Quizzes</h3>
            <p className="text-xs text-gray-600">Take assessments</p>
          </div>
        </Link>
        
        <Link to="/certificates" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-yellow-100 rounded-lg mb-3">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold mb-1">Certificates</h3>
            <p className="text-xs text-gray-600">View achievements</p>
          </div>
        </Link>
        
        <Link to="/notifications" className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-purple-100 rounded-lg mb-3">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Notifications</h3>
            <p className="text-xs text-gray-600">Stay updated</p>
          </div>
        </Link>
      </div>

      {/* Learning Goals */}
      <div className="card bg-gradient-to-r from-primary-50 to-green-50">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-primary-600 rounded-full">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold mb-2">Continue Your Learning</h3>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              You have {stats.inProgress} course{stats.inProgress !== 1 ? 's' : ''} in progress. 
              Keep learning to earn more certificates!
            </p>
            <Link to="/courses" className="btn btn-primary inline-flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Explore More Courses</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

