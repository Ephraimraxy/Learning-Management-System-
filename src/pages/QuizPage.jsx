import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuiz({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit');
      return;
    }

    try {
      let score = 0;
      quiz.questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });

      await addDoc(collection(db, 'quizSubmissions'), {
        quizId,
        userId: user.uid,
        answers,
        score,
        totalQuestions: quiz.questions.length,
        submittedAt: new Date().toISOString(),
      });

      toast.success(`Quiz submitted! Score: ${score}/${quiz.questions.length}`);
      navigate('/quizzes');
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  };

  if (loading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>Progress: {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{question.question}</h2>
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option || (Array.isArray(answers[question.id]) && answers[question.id].includes(option))}
                  onChange={() => handleAnswer(question.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="btn btn-primary"
            >
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary">
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

