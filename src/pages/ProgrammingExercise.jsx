import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProgrammingExercise, submitExercise, getUserExerciseSubmission } from '../services/programmingExerciseService';
import { useAuthStore } from '../stores/authStore';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';

const ProgrammingExercise = () => {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const exerciseData = await getProgrammingExercise(exerciseId);
        if (exerciseData) {
          setExercise(exerciseData);
          setLanguage(exerciseData.language || 'python');
          setCode(exerciseData.starterCode || '');
          
          // Check for existing submission
          if (user) {
            const existingSubmission = await getUserExerciseSubmission(exerciseId, user.uid);
            if (existingSubmission) {
              setSubmission(existingSubmission);
              setCode(existingSubmission.code || exerciseData.starterCode || '');
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load exercise');
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [exerciseId, user]);

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    try {
      // In a real implementation, this would call a code execution service
      // For now, we'll use a mock execution
      const { executeCode } = await import('../services/programmingExerciseService');
      const executionResult = await executeCode(code, language, exercise.testCases || []);
      
      setResults(executionResult);
      
      if (executionResult.passed) {
        toast.success('All test cases passed!');
      } else {
        toast.error('Some test cases failed');
      }
    } catch (error) {
      toast.error('Failed to execute code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit');
      return;
    }

    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    try {
      const submissionId = await submitExercise({
        exerciseId,
        userId: user.uid,
        code,
        language,
        status: results?.passed ? 'passed' : 'submitted',
      });

      toast.success('Solution submitted successfully!');
      setSubmission({ id: submissionId, code, language, status: results?.passed ? 'passed' : 'submitted' });
    } catch (error) {
      toast.error('Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!exercise) {
    return <div className="text-center py-12">Exercise not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{exercise.title}</h1>
        {exercise.description && (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{exercise.description}</p>
          </div>
        )}

        {exercise.testCases && exercise.testCases.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
            <div className="space-y-2">
              {exercise.testCases.map((testCase, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm">
                    <strong>Input:</strong> <code className="bg-white px-2 py-1 rounded">{testCase.input}</code>
                  </div>
                  <div className="text-sm mt-1">
                    <strong>Expected Output:</strong> <code className="bg-white px-2 py-1 rounded">{testCase.expectedOutput}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Code Editor</h2>
          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button
              onClick={handleRun}
              disabled={submitting}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Run</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !results?.passed}
              className="btn btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        <Editor
          height="500px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </div>

      {results && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Execution Results</h3>
          {results.passed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">All test cases passed!</span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Some test cases failed</span>
              </div>
              {results.error && (
                <div className="mt-2">
                  <strong>Error:</strong>
                  <pre className="bg-white p-2 rounded mt-1 text-sm overflow-x-auto">{results.error}</pre>
                </div>
              )}
            </div>
          )}
          {results.results && results.results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.results.map((result, idx) => (
                <div key={idx} className={`p-3 rounded border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center space-x-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">Test Case {idx + 1}</span>
                  </div>
                  {!result.passed && (
                    <div className="mt-2 text-sm">
                      <div>Expected: <code>{result.expected}</code></div>
                      <div>Got: <code>{result.actual}</code></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {submission && (
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">
              {submission.status === 'passed' ? 'Solution submitted and passed!' : 'Solution submitted'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingExercise;

