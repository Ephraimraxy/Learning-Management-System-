import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { Briefcase, MapPin, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuthStore();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const canCreateJob = userData?.role === 'instructor' || userData?.role === 'admin';

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
        <h1 className="text-3xl font-bold">Job Openings</h1>
        {canCreateJob && (
          <Link to="/jobs/new" className="btn btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Post Job</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
              <Briefcase className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-gray-600 mb-4">{job.companyName}</p>
            <div className="space-y-2 text-sm text-gray-500">
              {job.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
              )}
            </div>
            {job.description && (
              <p className="text-gray-600 mt-4 line-clamp-2">{job.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Jobs;

