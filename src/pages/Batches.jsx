import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Calendar, Users, Clock } from 'lucide-react';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const q = query(collection(db, 'batches'), orderBy('startDate', 'desc'));
        const snapshot = await getDocs(q);
        setBatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to load batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Batches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <Link
            key={batch.id}
            to={`/batches/${batch.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{batch.name}</h3>
            <p className="text-gray-600 mb-4">{batch.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Starts: {new Date(batch.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{batch.enrolledStudents || 0} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{batch.duration || 'N/A'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Batches;

