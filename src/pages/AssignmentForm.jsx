import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { createAssignment, updateAssignment } from '../services/assignmentService';
import { getCourses } from '../services/courseService';
import { getBatches } from '../services/batchService';
import toast from 'react-hot-toast';
import { Save, X } from 'lucide-react';

const AssignmentForm = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    batchId: '',
    dueDate: '',
    maxScore: 100,
    submissionType: 'file',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, batchesData] = await Promise.all([
          getCourses({ published: true }),
          getBatches(),
        ]);
        setCourses(coursesData);
        setBatches(batchesData);
      } catch (error) {
        console.error('Failed to load courses/batches:', error);
      }
    };
    loadData();

    if (assignmentId && assignmentId !== 'new') {
      const fetchAssignment = async () => {
        try {
          const docRef = doc(db, 'assignments', assignmentId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title || '',
              description: data.description || '',
              courseId: data.courseId || '',
              batchId: data.batchId || '',
              dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
              maxScore: data.maxScore || 100,
              submissionType: data.submissionType || 'file',
            });
          }
        } catch (error) {
          toast.error('Failed to load assignment');
        }
      };
      fetchAssignment();
    }
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assignmentData = {
        ...formData,
        instructorId: user.uid,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        maxScore: parseInt(formData.maxScore) || 100,
      };

      if (assignmentId && assignmentId !== 'new') {
        await updateAssignment(assignmentId, assignmentData);
        toast.success('Assignment updated successfully');
      } else {
        await createAssignment(assignmentData);
        toast.success('Assignment created successfully');
      }
      navigate('/assignments');
    } catch (error) {
      toast.error(error.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">
          {assignmentId && assignmentId !== 'new' ? 'Edit Assignment' : 'Create Assignment'}
        </h1>
        <button
          onClick={() => navigate('/assignments')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            placeholder="Assignment title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows="6"
            placeholder="Assignment description and instructions"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course (Optional)
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="input"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch (Optional)
            </label>
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="input"
            >
              <option value="">Select a batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Score
            </label>
            <input
              type="number"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
              className="input"
              min="1"
              max="1000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submission Type
          </label>
          <select
            value={formData.submissionType}
            onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
            className="input"
          >
            <option value="file">File Upload</option>
            <option value="text">Text Submission</option>
            <option value="url">URL Submission</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Assignment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;

