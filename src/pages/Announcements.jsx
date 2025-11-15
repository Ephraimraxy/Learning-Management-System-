import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getAnnouncements, createAnnouncement, subscribeToAnnouncements } from '../services/announcementService';
import { Megaphone, Plus, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Announcements = () => {
  const { batchId } = useParams();
  const { user, userData } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!batchId) return;

    const unsubscribe = subscribeToAnnouncements(batchId, (data) => {
      setAnnouncements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [batchId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createAnnouncement({
        batchId,
        title,
        content,
        userId: user.uid,
        userName: userData?.name || user.email,
      });
      toast.success('Announcement created');
      setShowModal(false);
      setTitle('');
      setContent('');
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  const isInstructor = userData?.role === 'instructor' || userData?.role === 'admin';

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
        <h1 className="text-3xl font-bold">Announcements</h1>
        {isInstructor && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="card text-center py-12">
          <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card border-l-4 border-primary-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Megaphone className="h-5 w-5 text-primary-600" />
                    <h3 className="text-xl font-semibold">{announcement.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {announcement.createdAt?.toDate
                        ? announcement.createdAt.toDate().toLocaleString()
                        : new Date(announcement.createdAt).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>By {announcement.userName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">New Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="6"
                  placeholder="Announcement content"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;

