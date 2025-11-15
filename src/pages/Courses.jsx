import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/courseService';
import { useAuthStore } from '../stores/authStore';
import { Plus, Search, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const { userData } = useAuthStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const filters = { published: true };
        if (category) filters.category = category;
        const data = await getCourses(filters);
        setCourses(data);
      } catch (error) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [category]);

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateCourse = userData?.role === 'instructor' || userData?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">All Courses</h1>
        {canCreateCourse && (
          <Link to="/courses/new" className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input md:w-48"
        >
          <option value="">All Categories</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-600">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCourses.map((course) => (
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
      )}
    </div>
  );
};

export default Courses;

