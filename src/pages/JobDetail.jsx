import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-12">Job not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.jobTitle}</h1>
            <p className="text-xl text-gray-600 mb-4">{job.companyName}</p>
          </div>
          <Briefcase className="h-8 w-8 text-primary-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {job.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{job.location}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <span>{job.salary}</span>
            </div>
          )}
          {job.postedDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {job.description && (
          <div className="prose max-w-none mb-6">
            <ReactMarkdown>{job.description}</ReactMarkdown>
          </div>
        )}

        {user && (
          <Link
            to={`/jobs/${jobId}/apply`}
            className="btn btn-primary"
          >
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobDetail;

