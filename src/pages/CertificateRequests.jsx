import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getCertificateRequests, approveCertificateRequest, rejectCertificateRequest, createCertificateRequest } from '../services/certificateEvaluationService';
import { getCourse } from '../services/courseService';
import { CheckCircle, XCircle, FileText, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const CertificateRequests = () => {
  const { user, userData } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const filters = isAdmin ? {} : { userId: user?.uid };
      const data = await getCertificateRequests(filters);
      
      // Enrich with course data
      const enriched = await Promise.all(
        data.map(async (request) => {
          if (request.courseId) {
            try {
              const course = await getCourse(request.courseId);
              return { ...request, course };
            } catch (error) {
              return request;
            }
          }
          return request;
        })
      );
      
      setRequests(enriched);
    } catch (error) {
      console.error('Failed to load certificate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Approve this certificate request?')) return;
    try {
      const result = await approveCertificateRequest(requestId, user.uid);
      if (result.success) {
        toast.success('Certificate request approved!');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      const result = await rejectCertificateRequest(requestId, user.uid, rejectionReason);
      if (result.success) {
        toast.success('Certificate request rejected');
        setRejectingId(null);
        setRejectionReason('');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleRequestCertificate = async (courseId) => {
    if (!user) {
      toast.error('Please login to request certificate');
      return;
    }
    try {
      const result = await createCertificateRequest({
        userId: user.uid,
        courseId,
        notes: '',
      });
      if (result.success) {
        toast.success('Certificate request submitted!');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-2">
          <Award className="h-6 w-6 md:h-8 md:w-8 text-primary-600" />
          <span>Certificate Requests</span>
        </h1>
      </div>

      {/* Pending Requests */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-yellow-600" />
            <span>Pending Requests ({pendingRequests.length})</span>
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      {request.course?.title || `Course ID: ${request.courseId}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600">{request.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="btn bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setRejectingId(request.id)}
                      className="btn bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
                {rejectingId === request.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="input mb-3"
                      rows="3"
                      placeholder="Please provide a reason for rejection"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(request.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason('');
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Requests (Students) */}
      {!isAdmin && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Certificate Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-600">You haven't requested any certificates yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold mb-2">
                        {request.course?.title || `Course ID: ${request.courseId}`}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status}
                      </span>
                      {request.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Approved ({approvedRequests.length})</span>
          </h2>
          <div className="space-y-4">
            {approvedRequests.map((request) => (
              <div key={request.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {request.course?.title || `Course ID: ${request.courseId}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Approved: {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Link
                    to="/certificates"
                    className="btn btn-primary text-sm"
                  >
                    View Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span>Rejected ({rejectedRequests.length})</span>
          </h2>
          <div className="space-y-4">
            {rejectedRequests.map((request) => (
              <div key={request.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    {request.course?.title || `Course ID: ${request.courseId}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Rejected: {request.rejectedAt ? new Date(request.rejectedAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {request.rejectionReason && (
                    <p className="text-sm text-red-600">
                      Reason: {request.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateRequests;

