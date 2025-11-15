import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllBatchStudentsProgress, getBatchAnalytics } from '../services/batchService';
import { getAssignments } from '../services/assignmentService';
import { Users, TrendingUp, FileText, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminBatchDashboard = ({ batch }) => {
  const { batchId } = useParams();
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressData, analyticsData, assignmentsData] = await Promise.all([
          getAllBatchStudentsProgress(batchId),
          getBatchAnalytics(batchId),
          getAssignments({ batchId }),
        ]);
        setStudentsProgress(progressData);
        setAnalytics(analyticsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const progressDistribution = [
    { name: '0-25%', value: studentsProgress.filter(sp => sp.progress >= 0 && sp.progress < 25).length },
    { name: '25-50%', value: studentsProgress.filter(sp => sp.progress >= 25 && sp.progress < 50).length },
    { name: '50-75%', value: studentsProgress.filter(sp => sp.progress >= 50 && sp.progress < 75).length },
    { name: '75-100%', value: studentsProgress.filter(sp => sp.progress >= 75 && sp.progress <= 100).length },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.totalStudents || 0}</p>
              <p className="text-gray-600 text-sm">Total Students</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.averageProgress || 0}%</p>
              <p className="text-gray-600 text-sm">Average Progress</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.totalAssignments || 0}</p>
              <p className="text-gray-600 text-sm">Assignments</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.completionRate || 0}%</p>
              <p className="text-gray-600 text-sm">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Progress Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={progressDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {progressDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Student Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsProgress.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="userName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Students ({studentsProgress.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Student</th>
                <th className="text-left py-3 px-4 font-semibold">Enrolled</th>
                <th className="text-left py-3 px-4 font-semibold">Progress</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsProgress.map((student) => (
                <tr key={student.userId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{student.userName}</p>
                      <p className="text-sm text-gray-500">{student.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedStudent.userName}</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedStudent.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full"
                      style={{ width: `${selectedStudent.progress}%` }}
                    />
                  </div>
                  <span className="font-medium">{selectedStudent.progress}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Course Progress</p>
                <div className="space-y-2">
                  {selectedStudent.courseProgress.map((cp, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{cp.courseTitle}</p>
                        <span className="text-sm text-gray-600">
                          {cp.completedLessons} / {cp.totalLessons} lessons
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${cp.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">{cp.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignments */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assignments</h3>
          <Link to={`/assignments?batchId=${batchId}`} className="text-primary-600 hover:text-primary-700 text-sm">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assignments yet</p>
          ) : (
            assignments.slice(0, 5).map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{assignment.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/assignments/${assignment.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBatchDashboard;

