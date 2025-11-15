import { useEffect, useState } from 'react';
import { getAllStatistics } from '../services/statisticsService';
import { getSignupsChartData, getEnrollmentsChartData, getCertificationsChartData, getLessonCompletionChartData } from '../services/chartService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Award, TrendingUp, Calendar } from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
  });
  const [signupsData, setSignupsData] = useState([]);
  const [enrollmentsData, setEnrollmentsData] = useState([]);
  const [certificationsData, setCertificationsData] = useState([]);
  const [lessonCompletionData, setLessonCompletionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statistics, signups, enrollments, certifications, lessonCompletions] = await Promise.all([
          getAllStatistics(),
          getSignupsChartData(30),
          getEnrollmentsChartData(30),
          getCertificationsChartData(30),
          getLessonCompletionChartData(30),
        ]);

        setStats({
          totalCourses: statistics.totalPublishedCourses,
          totalStudents: statistics.totalStudents,
          totalEnrollments: statistics.totalEnrollments,
          totalCertificates: statistics.totalCertificates,
        });

        setSignupsData(signups);
        setEnrollmentsData(enrollments);
        setCertificationsData(certifications);
        setLessonCompletionData(lessonCompletions);
      } catch (error) {
        console.error('Failed to load statistics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Courses', value: stats.totalCourses },
    { name: 'Students', value: stats.totalStudents },
    { name: 'Enrollments', value: stats.totalEnrollments },
    { name: 'Certificates', value: stats.totalCertificates },
  ];

  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
              <p className="text-gray-600">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
              <p className="text-gray-600">Enrollments</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCertificates}</p>
              <p className="text-gray-600">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Signups Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-600" />
            <span>New Signups (30 Days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={signupsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="signups" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollments Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span>Course Enrollments (30 Days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrollments" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Certifications Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary-600" />
            <span>Certifications Issued (30 Days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={certificationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="certifications" stroke="#4ade80" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lesson Completion Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <span>Lesson Completions (30 Days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lessonCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completions" stroke="#86efac" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Overview Bar Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

