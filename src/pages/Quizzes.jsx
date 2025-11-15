import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { FileText, Clock, Plus } from 'lucide-react';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuthStore();
  const canCreateQuiz = userData?.role === 'instructor' || userData?.role === 'admin';

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        {canCreateQuiz && (
          <Link to="/quizzes/new" className="btn btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Quiz</span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            to={`/quizzes/${quiz.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="text-xl font-semibold">{quiz.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{quiz.questions?.length || 0} Questions</span>
              {quiz.timeLimit && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.timeLimit} min</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Quizzes;

