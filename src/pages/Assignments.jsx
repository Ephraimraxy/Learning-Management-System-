import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { FileText, Calendar, Plus } from 'lucide-react';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuthStore();
  
  const canCreateAssignment = userData?.role === 'instructor' || userData?.role === 'admin';

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const q = query(collection(db, 'assignments'), orderBy('dueDate', 'desc'));
        const snapshot = await getDocs(q);
        setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

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
        <h1 className="text-2xl md:text-3xl font-bold">Assignments</h1>
        {canCreateAssignment && (
          <Link 
            to="/assignments/new" 
            className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <h3 className="text-xl font-semibold">{assignment.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{assignment.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <span>Max Score: {assignment.maxScore || 'N/A'}</span>
                </div>
              </div>
              <Link to={`/assignments/${assignment.id}`} className="btn btn-primary">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;

