import { useEffect, useState } from 'react';
import { getEvaluations, createEvaluation, getEvaluators } from '../services/evaluationService';
import { useAuthStore } from '../stores/authStore';
import { Calendar, User, Plus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Evaluations = () => {
  const { user, userData } = useAuthStore();
  const [evaluations, setEvaluations] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filters = isAdmin ? {} : { userId: user?.uid };
        const [evaluationsData, evaluatorsData] = await Promise.all([
          getEvaluations(filters),
          isAdmin ? getEvaluators() : Promise.resolve([]),
        ]);
        setEvaluations(evaluationsData);
        setEvaluators(evaluatorsData);
      } catch (error) {
        toast.error('Failed to load evaluations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const upcomingEvaluations = evaluations.filter(
    e => new Date(e.scheduledDate) > new Date()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Calendar className="h-8 w-8" />
          <span>Evaluations</span>
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Evaluation</span>
          </button>
        )}
      </div>

      {/* Upcoming Evaluations */}
      {upcomingEvaluations.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upcoming Evaluations</h2>
          <div className="space-y-3">
            {upcomingEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{evaluation.title || 'Evaluation'}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(evaluation.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{evaluation.scheduledTime || 'TBD'}</span>
                      </div>
                      {evaluation.evaluatorId && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Evaluator Assigned</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    evaluation.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    evaluation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Evaluations */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">All Evaluations</h2>
        {evaluations.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No evaluations found</p>
        ) : (
          <div className="space-y-3">
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{evaluation.title || 'Evaluation'}</h3>
                    <p className="text-sm text-gray-600 mt-1">{evaluation.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Date: {new Date(evaluation.scheduledDate).toLocaleDateString()}</span>
                      {evaluation.courseId && <span>Course: {evaluation.courseId}</span>}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    evaluation.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    evaluation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <EvaluationCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          evaluators={evaluators}
          onSuccess={() => {
            setShowCreateModal(false);
            getEvaluations().then(setEvaluations);
          }}
        />
      )}
    </div>
  );
};

const EvaluationCreateModal = ({ isOpen, onClose, evaluators, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    courseId: '',
    userId: '',
    evaluatorId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEvaluation(formData);
      toast.success('Evaluation scheduled successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to schedule evaluation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Schedule Evaluation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input
                type="time"
                required
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Evaluator</label>
            <select
              value={formData.evaluatorId}
              onChange={(e) => setFormData({ ...formData, evaluatorId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Evaluator</option>
              {evaluators.map((evaluator) => (
                <option key={evaluator.id} value={evaluator.id}>
                  {evaluator.name || evaluator.email}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Evaluations;

