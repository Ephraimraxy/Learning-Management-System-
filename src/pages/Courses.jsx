import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/courseService';
import { useAuthStore } from '../stores/authStore';
import { Plus, Search, BookOpen, Layers3, LayoutList, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { COURSE_CATEGORIES, PROGRAM_STRUCTURE, MODULE_LOOKUP } from '../constants/courseCategories';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const { userData } = useAuthStore();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses({ published: true });
        setCourses(data);
      } catch (error) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = category ? course.category === category : true;
      const matchesSearch =
        !normalizedSearch ||
        course.title?.toLowerCase().includes(normalizedSearch) ||
        course.shortIntroduction?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [courses, category, normalizedSearch]);

  const categorySummaries = useMemo(() => {
    return PROGRAM_STRUCTURE.map((cat) => {
      const courseCount = courses.filter((course) => course.category === cat.value).length;
      return { ...cat, courseCount };
    });
  }, [courses]);

  const totalCourses = courses.length;
  const hasCourses = totalCourses > 0;
  const canCreateCourse = userData?.role === 'instructor' || userData?.role === 'admin';
  const filtersActive = Boolean(category || normalizedSearch);

  const resetFilters = () => {
    setCategory('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Program Catalogue</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Courses</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Browse the full curriculum or drill down into a category to focus on a learning pathway.
          </p>
        </div>
        {canCreateCourse && (
          <Link
            to="/courses/new"
            className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Link>
        )}
      </div>

      <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Showing</p>
          <p className="text-2xl font-bold text-gray-900">
            {displayedCourses.length}{' '}
            <span className="text-sm font-medium text-gray-500">of {totalCourses} courses</span>
          </p>
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Learning Hierarchy */}
      <section className="card space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-3">
          <Layers3 className="h-6 w-6 text-primary-600" />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Program Architecture</p>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Category → Module → Course</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
            <p className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <span role="img" aria-hidden="true">🗂</span>
              <span>Categories</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Broad subject areas that shape the overall learning pathways.
            </p>
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              {COURSE_CATEGORIES.map((cat) => (
                <li key={cat.value}>{cat.label}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
            <p className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <LayoutList className="h-4 w-4 text-primary-600" />
              <span>Modules</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Structured units inside each category, bundling related skills and learning goals.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Example: Field Crop Production → Field Crop Production 1 & 2.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
            <p className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-primary-600" />
              <span>Courses</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Individual lectures, labs, or sessions. Every course rolls up into a module, which rolls up into a category.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Example: Catfish Farming (Course) → Aquaculture Systems (Module) → Livestock & Aquaculture (Category).
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <div className="card space-y-4 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input md:w-80"
          >
            <option value="">All Categories</option>
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Overview */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Curriculum Categories</h2>
            <p className="text-sm md:text-base text-gray-600">
              A holistic mix of production, business, technology, and leadership development.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorySummaries.map((cat) => (
            <div
              key={cat.value}
              className={`card border ${
                category === cat.value ? 'border-primary-500 shadow-lg' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Category</p>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">{cat.label}</h3>
                  <p className="text-sm text-gray-600 mt-2">{cat.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Available Courses</p>
                  <p className="text-2xl font-bold text-primary-600">{cat.courseCount}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {cat.modules.map((module) => (
                  <div key={module.id} className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">{module.label}</p>
                      <span className="text-xs text-gray-500">{module.courses.length} course{module.courses.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {module.courses.map((course) => (
                        <li key={course.title} className="flex items-start space-x-2">
                          <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-primary-400"></span>
                          <span>{course.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCategory(category === cat.value ? '' : cat.value)}
                className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {category === cat.value ? 'Show all courses' : 'View courses in this category'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      {!hasCourses ? (
        <div className="card text-center py-10">
          <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold mb-2">No courses published yet</h3>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            Once courses are added and published, they will automatically appear here.
          </p>
          {canCreateCourse && (
            <Link to="/courses/new" className="btn btn-primary inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create the first course</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {displayedCourses.length === 0 && (
            <div className="card text-center py-6">
              <p className="text-sm md:text-base text-gray-600">
                No courses match your current filters. Try adjusting the search or resetting the category.
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-secondary mt-4 w-full sm:w-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {displayedCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayedCourses.map((course) => {
                const categoryLabel =
                  COURSE_CATEGORIES.find((cat) => cat.value === course.category)?.label || 'General';
                return (
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
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                        {categoryLabel}
                      </span>
                      {course.module && MODULE_LOOKUP[course.module] && (
                        <span className="inline-flex text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                          {MODULE_LOOKUP[course.module].label}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">
                      {course.shortIntroduction}
                    </p>
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                      <span>{course.lessons || 0} Lessons</span>
                      {course.rating && <span>⭐ {course.rating}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Courses;

