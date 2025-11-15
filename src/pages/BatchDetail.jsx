import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Calendar, Users, Video, MessageSquare, Megaphone, BarChart3 } from 'lucide-react';
import AdminBatchDashboard from '../components/AdminBatchDashboard';
import StudentBatchDashboard from '../components/StudentBatchDashboard';
import { getUserBatchEnrollment, enrollInBatch } from '../services/batchService';
import toast from 'react-hot-toast';

const BatchDetail = () => {
  const { batchId } = useParams();
  const { user, userData } = useAuthStore();
  const [batch, setBatch] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const docRef = doc(db, 'batches', batchId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBatch({ id: docSnap.id, ...docSnap.data() });
        }

        // Check if user is enrolled
        if (user) {
          const enrollment = await getUserBatchEnrollment(batchId, user.uid);
          setEnrolled(!!enrollment);
        }
      } catch (error) {
        console.error('Failed to load batch');
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [batchId, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      return;
    }
    try {
      await enrollInBatch(batchId, user.uid);
      setEnrolled(true);
      toast.success('Successfully enrolled in batch!');
    } catch (error) {
      toast.error(error.message || 'Failed to enroll');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!batch) {
    return <div className="text-center py-12">Batch not found</div>;
  }

  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';
  const showDashboard = enrolled || isAdmin;

  return (
    <div className="space-y-6">
      {/* Batch Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{batch.name}</h1>
            <p className="text-gray-600 mb-4">{batch.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>Start: {new Date(batch.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span>{batch.enrolledStudents || 0} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-gray-500" />
                <span>{batch.liveClasses?.length || 0} Live Classes</span>
              </div>
            </div>
          </div>
          {!enrolled && !isAdmin && user && (
            <button onClick={handleEnroll} className="btn btn-primary">
              Enroll in Batch
            </button>
          )}
        </div>
      </div>

      {/* Tabs for enrolled users or admins */}
      {showDashboard && (
        <div className="card">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              ) : (
                <span>My Dashboard</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'classes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Live Classes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'discussions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Discussions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'announcements'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Megaphone className="h-4 w-4" />
                <span>Announcements</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <>
                {isAdmin ? (
                  <AdminBatchDashboard batch={batch} />
                ) : (
                  <StudentBatchDashboard batch={batch} />
                )}
              </>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4">
                {batch.liveClasses && batch.liveClasses.length > 0 ? (
                  batch.liveClasses.map((liveClass, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{liveClass.title}</h3>
                      <p className="text-gray-600 mb-2">{liveClass.description}</p>
                      <div className="text-sm text-gray-500">
                        <p>Date: {new Date(liveClass.date).toLocaleString()}</p>
                        {liveClass.zoomLink && (
                          <a
                            href={liveClass.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            Join Zoom Meeting →
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No live classes scheduled</p>
                )}
              </div>
            )}

            {activeTab === 'discussions' && (
              <div className="text-center py-8">
                <Link to={`/batches/${batchId}/discussions`} className="btn btn-primary">
                  Go to Discussions →
                </Link>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="text-center py-8">
                <Link to={`/batches/${batchId}/announcements`} className="btn btn-primary">
                  Go to Announcements →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public view for non-enrolled users */}
      {!showDashboard && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Live Classes</h2>
          {batch.liveClasses && batch.liveClasses.length > 0 ? (
            <div className="space-y-4">
              {batch.liveClasses.map((liveClass, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{liveClass.title}</h3>
                  <p className="text-gray-600 mb-2">{liveClass.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Date: {new Date(liveClass.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No live classes scheduled</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchDetail;

