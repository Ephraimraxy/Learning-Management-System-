import { Star, Clock, BookOpen, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    return (
        <Link to={`/courses/${course.id}`} className="group">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative overflow-hidden">
                    <div className="aspect-video">
                        <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    {/* Badge */}
                    {course.badge && (
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold ${course.badge === 'Bestseller' ? 'bg-yellow-400 text-yellow-900' :
                                course.badge === 'New' ? 'bg-green-500 text-white' :
                                    'bg-purple-600 text-white'
                            }`}>
                            {course.badge}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                    </h3>

                    {/* Instructor */}
                    <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-sm text-gray-900">{course.rating}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < Math.floor(course.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs text-gray-500">({course.reviews.toLocaleString()})</span>
                    </div>

                    {/* Duration & Lectures */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{course.lectures} lectures</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">₦{course.price.toLocaleString()}</span>
                            {course.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">₦{course.originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                        {course.originalPrice && (
                            <div className="mt-1 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

const Overview = () => {
    const courses = [
        // 🌱 Crop Production & Value Chains
        {
            id: 1,
            title: 'Field Crop Production 1: Rice & Maize Value Chain',
            instructor: 'Dr. Adebayo Akinola',
            rating: 4.7,
            reviews: 1234,
            duration: '18 hrs',
            lectures: 56,
            price: 9900,
            originalPrice: 14900,
            badge: 'Bestseller',
            image: '/images/courses/rice-farming.png',
            category: 'Crop Production'
        },
        {
            id: 2,
            title: 'Field Crop Production 2: Soybeans Value Chain',
            instructor: 'Prof. Chioma Okafor',
            rating: 4.6,
            reviews: 987,
            duration: '16 hrs',
            lectures: 48,
            price: 8900,
            originalPrice: 12900,
            badge: 'New',
            image: '/images/courses/soybean-farming.png',
            category: 'Crop Production'
        },
        {
            id: 3,
            title: 'Agricultural Value Chain: From Farm to Market',
            instructor: 'Dr. Emmanuel Nwosu',
            rating: 4.8,
            reviews: 1567,
            duration: '22 hrs',
            lectures: 68,
            price: 11900,
            originalPrice: 16900,
            badge: 'Bestseller',
            image: '/images/courses/rice-farming.png',
            category: 'Crop Production'
        },
        {
            id: 4,
            title: 'Value Addition & Export in Agribusiness',
            instructor: 'Mrs. Fatima Ahmed',
            rating: 4.5,
            reviews: 743,
            duration: '14 hrs',
            lectures: 42,
            price: 9900,
            originalPrice: 13900,
            image: '/images/courses/soybean-farming.png',
            category: 'Crop Production'
        },
        {
            id: 5,
            title: 'Vegetable Production: Greenhouse & Hydroponics',
            instructor: 'Engr. Tunde Bakare',
            rating: 4.9,
            reviews: 2103,
            duration: '24 hrs',
            lectures: 72,
            price: 12900,
            originalPrice: 17900,
            badge: 'Premium',
            image: '/images/courses/greenhouse.png',
            category: 'Crop Production'
        },
        {
            id: 6,
            title: 'Marketing Agriproducts: Cowpea Focus',
            instructor: 'Dr. Grace Eze',
            rating: 4.6,
            reviews: 856,
            duration: '12 hrs',
            lectures: 38,
            price: 7900,
            originalPrice: 10900,
            image: '/images/courses/soybean-farming.png',
            category: 'Crop Production'
        },

        // 🐟🐓 Livestock & Aquaculture
        {
            id: 7,
            title: 'Catfish Farming: Complete Production Guide',
            instructor: 'Mr. Biodun Peters',
            rating: 4.7,
            reviews: 1456,
            duration: '20 hrs',
            lectures: 58,
            price: 10900,
            originalPrice: 15900,
            badge: 'Bestseller',
            image: '/images/courses/catfish.png',
            category: 'Aquaculture'
        },
        {
            id: 8,
            title: 'Poultry Production: Layers & Broilers',
            instructor: 'Dr. Patience Okonkwo',
            rating: 4.8,
            reviews: 1889,
            duration: '18 hrs',
            lectures: 54,
            price: 9900,
            originalPrice: 14900,
            badge: 'Bestseller',
            image: '/images/courses/poultry.png',
            category: 'Livestock'
        },
        {
            id: 9,
            title: 'Ruminant Fattening: Cattle, Sheep & Goats',
            instructor: 'Alhaji Musa Ibrahim',
            rating: 4.6,
            reviews: 1124,
            duration: '16 hrs',
            lectures: 46,
            price: 8900,
            originalPrice: 12900,
            image: '/images/courses/cattle.png',
            category: 'Livestock'
        },

        // 💻📊 Agribusiness & Finance
        {
            id: 10,
            title: 'Entrepreneurship Development in Agribusiness',
            instructor: 'Prof. Oluwaseun Adeyemi',
            rating: 4.9,
            reviews: 2341,
            duration: '26 hrs',
            lectures: 78,
            price: 13900,
            originalPrice: 19900,
            badge: 'Premium',
            image: '/images/courses/rice-farming.png',
            category: 'Business'
        },
        {
            id: 11,
            title: 'Digital Agribusiness: Tech for Modern Farming',
            instructor: 'Dr. Chidi Okeke',
            rating: 4.7,
            reviews: 1678,
            duration: '20 hrs',
            lectures: 62,
            price: 11900,
            originalPrice: 16900,
            badge: 'New',
            image: '/images/courses/machinery.png',
            category: 'Business'
        },
        {
            id: 12,
            title: 'Financing Agribusiness: Loans & Grants',
            instructor: 'Mrs. Ngozi Udeh',
            rating: 4.6,
            reviews: 1234,
            duration: '15 hrs',
            lectures: 44,
            price: 9900,
            originalPrice: 13900,
            image: '/images/courses/soybean-farming.png',
            category: 'Finance'
        },
        {
            id: 13,
            title: 'Introduction to Agribusiness',
            instructor: 'Dr. Ahmed Bello',
            rating: 4.5,
            reviews: 2567,
            duration: '10 hrs',
            lectures: 32,
            price: 6900,
            originalPrice: 9900,
            badge: 'Bestseller',
            image: '/images/courses/rice-farming.png',
            category: 'Business'
        },
        {
            id: 14,
            title: 'Marketing Agriproducts & Agribusinesses',
            instructor: 'Mr. Kayode Williams',
            rating: 4.7,
            reviews: 1445,
            duration: '18 hrs',
            lectures: 52,
            price: 10900,
            originalPrice: 14900,
            image: '/images/courses/greenhouse.png',
            category: 'Marketing'
        },

        // 🚜 Farm Technology & Practical Skills
        {
            id: 15,
            title: 'Farm Irrigation and Machinery',
            instructor: 'Engr. John Obi',
            rating: 4.8,
            reviews: 1567,
            duration: '22 hrs',
            lectures: 64,
            price: 11900,
            originalPrice: 16900,
            badge: 'Premium',
            image: '/images/courses/machinery.png',
            category: 'Technology'
        },
        {
            id: 16,
            title: 'Onsite Practical Sessions: Hands-On Training',
            instructor: 'Practical Team',
            rating: 4.9,
            reviews: 2789,
            duration: '40 hrs',
            lectures: 12,
            price: 15900,
            originalPrice: 22900,
            badge: 'Bestseller',
            image: '/images/courses/rice-farming.png',
            category: 'Practical'
        },
        {
            id: 17,
            title: 'Agribusiness Seminar Series',
            instructor: 'Multiple Experts',
            rating: 4.6,
            reviews: 1234,
            duration: '8 hrs',
            lectures: 16,
            price: 4900,
            originalPrice: 6900,
            image: '/images/courses/greenhouse.png',
            category: 'Events'
        },
        {
            id: 18,
            title: 'Graduation CEC: Certificate Course',
            instructor: 'LMS Faculty',
            rating: 4.8,
            reviews: 3456,
            duration: '120 hrs',
            lectures: 200,
            price: 25900,
            originalPrice: 35900,
            badge: 'Premium',
            image: '/images/courses/rice-farming.png',
            category: 'Certification'
        },

        // 🧑‍💼 Leadership & Personal Development
        {
            id: 19,
            title: 'Leadership Skill Development for Agripreneurs',
            instructor: 'Dr. Blessing Nnamdi',
            rating: 4.7,
            reviews: 1789,
            duration: '16 hrs',
            lectures: 48,
            price: 9900,
            originalPrice: 14900,
            image: '/images/courses/rice-farming.png',
            category: 'Leadership'
        },
        {
            id: 20,
            title: 'Power of Vision: Opening Ceremony Session',
            instructor: 'Keynote Speaker',
            rating: 4.9,
            reviews: 4567,
            duration: '3 hrs',
            lectures: 4,
            price: 2900,
            originalPrice: 4900,
            badge: 'New',
            image: '/images/courses/greenhouse.png',
            category: 'Motivation'
        },
    ];

    // Calculate stats
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => sum + course.reviews, 0);
    const avgRating = (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1);

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold mb-4">
                        Explore Our Agribusiness Courses
                    </h1>
                    <p className="text-green-50 text-lg mb-6">
                        From crop production to digital agribusiness, master the skills to succeed in modern agriculture
                    </p>
                    <div className="flex flex-wrap gap-8">
                        <div>
                            <div className="text-3xl font-bold">{totalCourses}</div>
                            <div className="text-green-100 text-sm">Total Courses</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{totalStudents.toLocaleString()}+</div>
                            <div className="text-green-100 text-sm">Active Learners</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                            <div>
                                <div className="text-3xl font-bold">{avgRating}</div>
                                <div className="text-green-100 text-sm">Avg Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter/Sort Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{totalCourses} courses available</span>
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {/* Trust Section */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <Award className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Industry-Leading Agribusiness Education
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Join thousands of successful agripreneurs who have transformed their farming businesses
                    with our comprehensive courses taught by industry experts.
                </p>
            </div>
        </div>
    );
};

export default Overview;
