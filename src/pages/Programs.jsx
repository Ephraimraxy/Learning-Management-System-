import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Award, BookOpen } from 'lucide-react';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const q = query(collection(db, 'programs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
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
      <h1 className="text-3xl font-bold">Learning Programs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <Link
            key={program.id}
            to={`/programs/${program.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-primary-600" />
              <h3 className="text-xl font-semibold">{program.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{program.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BookOpen className="h-4 w-4" />
              <span>{program.courses?.length || 0} Courses</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Programs;

