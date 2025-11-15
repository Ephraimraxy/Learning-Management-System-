import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getAssignment, getUserSubmission, submitAssignment, uploadSubmissionFile } from '../services/assignmentService';
import { FileText, Upload, CheckCircle, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const AssignmentSubmission = () => {
  const { assignmentId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assignmentData, submissionData] = await Promise.all([
          getAssignment(assignmentId),
          user ? getUserSubmission(assignmentId, user.uid) : Promise.resolve(null),
        ]);
        setAssignment(assignmentData);
        setSubmission(submissionData);
      } catch (error) {
        toast.error('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [assignmentId, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setSubmitting(true);
    try {
      const fileUrls = [];
      for (const file of files) {
        const url = await uploadSubmissionFile(file, `${assignmentId}_${user.uid}`);
        fileUrls.push({ name: file.name, url });
      }

      await submitAssignment({
        assignmentId,
        userId: user.uid,
        files: fileUrls,
        submittedAt: new Date().toISOString(),
      });

      toast.success('Assignment submitted successfully');
      navigate('/assignments');
    } catch (error) {
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return <div className="text-center py-12">Assignment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-6 w-6 text-primary-600" />
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
        </div>
        <p className="text-gray-600 mb-4">{assignment.description}</p>
        <div className="text-sm text-gray-500">
          <p>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p>Max Score: {assignment.maxScore || 'N/A'}</p>
        </div>
      </div>

      {submission ? (
        <div className="card">
          <div className="flex items-center space-x-2 text-green-600 mb-4">
            <CheckCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Already Submitted</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Submitted on: {new Date(submission.submittedAt).toLocaleString()}
          </p>
          {submission.files && submission.files.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Submitted Files:</h3>
              <div className="space-y-2">
                {submission.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {submission.grade !== undefined && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">Grade: {submission.grade} / {assignment.maxScore}</p>
              {submission.feedback && (
                <p className="text-gray-600 mt-2">{submission.feedback}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Submit Assignment</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOC, DOCX files accepted
                  </p>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || files.length === 0}
              className="btn btn-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignmentSubmission;

