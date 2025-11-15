import { useEffect, useState } from 'react';
import { getQuiz, submitQuiz } from '../services/quizService';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';

const QuizBlock = ({ quizId, embedded = true, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuiz(quizId);
        if (quizData) {
          setQuiz(quizData);
          // Check if user already submitted
          if (user) {
            const { getUserQuizSubmission } = await import('../services/quizService');
            const submission = await getUserQuizSubmission(quizId, user.uid);
            if (submission) {
              setSubmitted(true);
              setScore(submission.score);
              setAnswers(submission.answers);
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, user]);

  const handleAnswer = (questionId, answer) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit');
      if (!embedded) {
        navigate('/login');
      }
      return;
    }

    if (submitted) return;

    try {
      let calculatedScore = 0;
      const totalQuestions = quiz.questions.length;

      quiz.questions.forEach((q) => {
        const userAnswer = answers[q.id];
        if (q.type === 'multiple') {
          // For multiple choice, check if arrays match
          const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          if (correctAnswers.length === userAnswers.length && 
              correctAnswers.every(ans => userAnswers.includes(ans))) {
            calculatedScore++;
          }
        } else {
          if (userAnswer === q.correctAnswer) {
            calculatedScore++;
          }
        }
      });

      await submitQuiz({
        quizId,
        userId: user.uid,
        answers,
        score: calculatedScore,
        totalQuestions,
      });

      setScore(calculatedScore);
      setSubmitted(true);
      toast.success(`Quiz submitted! Score: ${calculatedScore}/${totalQuestions}`);
      
      if (onComplete) {
        onComplete(calculatedScore, totalQuestions);
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="border rounded-lg p-4 bg-yellow-50 text-yellow-800">
        Quiz not found
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm my-6">
      <div className="flex items-center space-x-2 mb-4">
        <HelpCircle className="h-5 w-5 text-primary-600" />
        <h3 className="text-xl font-semibold">{quiz.title}</h3>
      </div>
      
      {quiz.description && (
        <p className="text-gray-600 mb-4">{quiz.description}</p>
      )}

      {submitted ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${score >= quiz.questions.length / 2 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center space-x-2">
              {score >= quiz.questions.length / 2 ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-semibold">
                Your Score: {score}/{quiz.questions.length}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="border rounded-lg p-4">
                <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => {
                    const isSelected = answers[q.id] === option || 
                      (Array.isArray(answers[q.id]) && answers[q.id].includes(option));
                    const isCorrect = q.type === 'multiple' 
                      ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]).includes(option)
                      : q.correctAnswer === option;
                    
                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded ${
                          isCorrect ? 'bg-green-100 border-green-300' :
                          isSelected && !isCorrect ? 'bg-red-100 border-red-300' :
                          'bg-gray-50 border-gray-200'
                        } border`}
                      >
                        {option}
                        {isCorrect && <span className="ml-2 text-green-600">✓ Correct</span>}
                        {isSelected && !isCorrect && <span className="ml-2 text-red-600">✗ Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">{question.question}</h4>
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    (answers[question.id] === option || 
                     (Array.isArray(answers[question.id]) && answers[question.id].includes(option)))
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option || 
                      (Array.isArray(answers[question.id]) && answers[question.id].includes(option))}
                    onChange={() => {
                      if (question.type === 'multiple') {
                        const currentAnswers = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                        const newAnswers = currentAnswers.includes(option)
                          ? currentAnswers.filter(a => a !== option)
                          : [...currentAnswers, option];
                        handleAnswer(question.id, newAnswers);
                      } else {
                        handleAnswer(question.id, option);
                      }
                    }}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {isLastQuestion ? (
              <button 
                onClick={handleSubmit} 
                className="btn btn-primary"
                disabled={!answers[question.id]}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizBlock;

