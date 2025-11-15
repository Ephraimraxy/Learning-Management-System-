import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse, getChapters, enrollInCourse, getUserEnrollments } from '../services/courseService';
import { expressCourseInterest, removeCourseInterest, isUserInterested, getCourseInterestCount } from '../services/courseInterestService';
import { getRelatedCourses } from '../services/relatedCoursesService';
import { updateCourseStatistics } from '../services/courseStatisticsService';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, Users, Clock, Award, Play, CheckCircle, Heart, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [interested, setInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, chaptersData] = await Promise.all([
          getCourse(courseId),
          getChapters(courseId),
        ]);
        setCourse(courseData);
        setChapters(chaptersData);

        if (user) {
          const [enrollments, userInterested, count, related] = await Promise.all([
            getUserEnrollments(user.uid),
            isUserInterested(courseId, user.uid),
            getCourseInterestCount(courseId),
            getRelatedCourses(courseId),
          ]);
          setEnrolled(enrollments.some(e => e.courseId === courseId));
          setInterested(userInterested);
          setInterestCount(count);
          setRelatedCourses(related);
        } else {
          const [count, related] = await Promise.all([
            getCourseInterestCount(courseId),
            getRelatedCourses(courseId),
          ]);
          setInterestCount(count);
          setRelatedCourses(related);
        }

        // Auto-update course statistics
        if (courseData) {
          await updateCourseStatistics(courseId);
        }
      } catch (error) {
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      return;
    }
    try {
      await enrollInCourse(courseId, user.uid);
      setEnrolled(true);
      toast.success('Successfully enrolled!');
      // Update statistics
      await updateCourseStatistics(courseId);
    } catch (error) {
      toast.error('Failed to enroll');
    }
  };

  const handleInterestToggle = async () => {
    if (!user) {
      toast.error('Please login to express interest');
      return;
    }
    try {
      if (interested) {
        await removeCourseInterest(courseId, user.uid);
        setInterested(false);
        setInterestCount(prev => Math.max(0, prev - 1));
        toast.success('Interest removed');
      } else {
        await expressCourseInterest(courseId, user.uid);
        setInterested(true);
        setInterestCount(prev => prev + 1);
        toast.success('Interest expressed!');
      }
    } catch (error) {
      toast.error('Failed to update interest');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {course.image && (
            <img
              src={course.image}
              alt={course.title}
              className="w-full md:w-96 h-64 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span>{course.enrollments || 0} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span>{course.lessons || 0} Lessons</span>
              </div>
              {course.rating && (
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>{course.rating} Rating</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {enrolled ? (
                <Link
                  to={`/courses/${courseId}/learn/${chapters[0]?.id}/${chapters[0]?.lessons?.[0]?.id}`}
                  className="btn btn-primary inline-flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Continue Learning</span>
                </Link>
              ) : (
                <button onClick={handleEnroll} className="btn btn-primary">
                  Enroll Now
                </button>
              )}
              {user && (
                <button
                  onClick={handleInterestToggle}
                  className={`btn ${interested ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} inline-flex items-center space-x-2`}
                >
                  <Heart className={`h-4 w-4 ${interested ? 'fill-red-600' : ''}`} />
                  <span>{interested ? 'Interested' : 'Show Interest'}</span>
                  {interestCount > 0 && (
                    <span className="ml-1 text-xs">({interestCount})</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
        <div className="space-y-4">
          {chapters.map((chapter, idx) => (
            <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                Chapter {idx + 1}: {chapter.title}
              </h3>
              <div className="space-y-2">
                {chapter.lessons?.map((lesson, lessonIdx) => (
                  <Link
                    key={lesson.id}
                    to={`/courses/${courseId}/learn/${chapter.id}/${lesson.id}`}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <Play className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">
                      {lessonIdx + 1}. {lesson.title}
                    </span>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{lesson.duration || '5 min'}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary-600" />
            <span>Related Courses</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {relatedCourses.map((relatedCourse) => (
              <Link
                key={relatedCourse.id}
                to={`/courses/${relatedCourse.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {relatedCourse.image && (
                  <img
                    src={relatedCourse.image}
                    alt={relatedCourse.title}
                    className="w-full h-32 md:h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">{relatedCourse.title}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{relatedCourse.shortIntroduction}</p>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span>{relatedCourse.lessons || 0} Lessons</span>
                  {relatedCourse.rating && <span>⭐ {relatedCourse.rating}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

