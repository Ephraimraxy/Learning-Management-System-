import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizForm = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: '',
    questions: [],
  });

  useEffect(() => {
    if (quizId && quizId !== 'new') {
      const fetchQuiz = async () => {
        try {
          const docRef = doc(db, 'quizzes', quizId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData({ ...docSnap.data() });
          }
        } catch (error) {
          toast.error('Failed to load quiz');
        }
      };
      fetchQuiz();
    }
  }, [quizId]);

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: Date.now().toString(),
          question: '',
          type: 'single',
          options: ['', ''],
          correctAnswer: '',
        },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...formData.questions];
    questions[index] = { ...questions[index], [field]: value };
    setFormData({ ...formData, questions });
  };

  const addOption = (questionIndex) => {
    const questions = [...formData.questions];
    questions[questionIndex].options.push('');
    setFormData({ ...formData, questions });
  };

  const removeQuestion = (index) => {
    const questions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (quizId === 'new') {
        const docRef = await addDoc(collection(db, 'quizzes'), {
          ...formData,
          instructorId: user.uid,
          createdAt: new Date().toISOString(),
        });
        toast.success('Quiz created successfully!');
        navigate(`/quizzes/${docRef.id}`);
      } else {
        await setDoc(doc(db, 'quizzes', quizId), {
          ...formData,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast.success('Quiz updated successfully!');
        navigate(`/quizzes/${quizId}`);
      }
    } catch (error) {
      toast.error('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">
          {quizId === 'new' ? 'Create Quiz' : 'Edit Quiz'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Question Text *</label>
                      <input
                        type="text"
                        required
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                        className="input"
                      >
                        <option value="single">Single Choice</option>
                        <option value="multiple">Multiple Choice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Options</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === option}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                            className="rounded"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const options = [...question.options];
                              options[oIndex] = e.target.value;
                              updateQuestion(qIndex, 'options', options);
                              if (question.correctAnswer === option) {
                                updateQuestion(qIndex, 'correctAnswer', e.target.value);
                              }
                            }}
                            className="input flex-1"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="btn btn-secondary text-sm mt-2"
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.questions.length === 0}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;

