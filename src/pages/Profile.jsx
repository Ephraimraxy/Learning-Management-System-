import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Award, BookOpen } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-12 w-12 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            <p className="text-gray-600 mb-2">{profile.email}</p>
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {profile.role || 'Student'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold">{profile.enrolledCourses || 0}</p>
              <p className="text-gray-600">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-4">
            <Award className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{profile.certificates || 0}</p>
              <p className="text-gray-600">Certificates</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{profile.completedCourses || 0}</p>
              <p className="text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

