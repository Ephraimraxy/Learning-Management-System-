import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getBatchStudentProgress } from '../services/batchService';
import { getAssignments } from '../services/assignmentService';
import { getUserSubmission } from '../services/assignmentService';
import { Calendar, BookOpen, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const StudentBatchDashboard = ({ batch, liveClasses = [] }) => {
  const { batchId } = useParams();
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [progressData, assignmentsData] = await Promise.all([
          getBatchStudentProgress(batchId, user.uid),
          getAssignments({ batchId }),
        ]);
        setProgress(progressData);

        // Get submission status for each assignment
        const assignmentsWithStatus = await Promise.all(
          assignmentsData.map(async (assignment) => {
            const submission = await getUserSubmission(assignment.id, user.uid);
            return {
              ...assignment,
              submitted: !!submission,
              grade: submission?.grade,
              status: submission?.status,
              feedback: submission?.feedback,
            };
          })
        );
        setAssignments(assignmentsWithStatus);

        // Get upcoming live classes
        const now = new Date();
        const classes = (liveClasses.length ? liveClasses : batch.liveClasses || []).filter(lc => new Date(lc.date) > now);
        setUpcomingClasses(classes.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [batchId, user, batch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No progress data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">My Progress</h2>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span className="text-2xl font-bold">{progress.overallProgress}%</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary-600 h-4 rounded-full transition-all"
                style={{ width: `${progress.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="space-y-4 mt-6">
          <h3 className="font-semibold">Course Progress</h3>
          {progress.courseProgress.map((cp, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary-600" />
                  <span className="font-medium">{cp.courseTitle}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {cp.completedLessons} / {cp.totalLessons} lessons
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${cp.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12">{cp.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Live Classes */}
      {upcomingClasses.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h2 className="text-2xl font-bold">Upcoming Live Classes</h2>
          </div>
          <div className="space-y-3">
            {upcomingClasses.map((liveClass, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{liveClass.title}</h3>
                    {liveClass.description && (
                      <p className="text-sm text-gray-600 mb-2">{liveClass.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(liveClass.date).toLocaleString()}</span>
                      </div>
                      {liveClass.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{liveClass.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {liveClass.meetingProvider === 'daily' ? (
                    <Link
                      to={`/live-classes/${liveClass.id}`}
                      className="btn btn-primary text-sm"
                    >
                      Enter Classroom
                    </Link>
                  ) : (
                    liveClass.externalLink && (
                      <a
                        href={liveClass.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-sm"
                      >
                        Join
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignments */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-primary-600" />
          <h2 className="text-2xl font-bold">Assignments</h2>
        </div>
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assignments yet</p>
          ) : (
            assignments.map((assignment) => {
              const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.submitted;
              return (
                <div
                  key={assignment.id}
                  className={`border rounded-lg p-4 ${
                    assignment.submitted
                      ? 'border-green-200 bg-green-50'
                      : isOverdue
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{assignment.title}</h3>
                        {assignment.submitted && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Submitted</span>
                          </span>
                        )}
                        {isOverdue && !assignment.submitted && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        {assignment.maxScore && (
                          <span className="text-gray-500">
                            Max Score: {assignment.maxScore}
                          </span>
                        )}
                        {assignment.grade !== undefined && (
                          <span className="font-medium text-green-600">
                            Grade: {assignment.grade} / {assignment.maxScore}
                          </span>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium mb-1">Feedback:</p>
                          <p className="text-gray-700">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/assignments/${assignment.id}`}
                      className="btn btn-primary text-sm ml-4"
                    >
                      {assignment.submitted ? 'View' : 'Submit'}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <h3 className="font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to={`/batches/${batchId}/discussions`}
            className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <span>Discussions</span>
          </Link>
          <Link
            to={`/batches/${batchId}/announcements`}
            className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-primary-600" />
            <span>Announcements</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentBatchDashboard;

