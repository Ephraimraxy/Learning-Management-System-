import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDiscussions, createDiscussion, subscribeToDiscussions } from '../services/discussionService';
import { MessageSquare, Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import DiscussionModal from '../components/DiscussionModal';
import DiscussionDetail from '../components/DiscussionDetail';

const Discussions = () => {
  const { batchId } = useParams();
  const { user, userData } = useAuthStore();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  useEffect(() => {
    if (!batchId) return;

    const unsubscribe = subscribeToDiscussions(batchId, (data) => {
      setDiscussions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [batchId]);

  const handleCreateDiscussion = async (data) => {
    try {
      await createDiscussion({
        ...data,
        batchId,
        userId: user.uid,
        userName: userData?.name || user.email,
      });
      toast.success('Discussion created successfully');
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to create discussion');
    }
  };

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
        <h1 className="text-3xl font-bold">Discussions</h1>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Discussion</span>
          </button>
        )}
      </div>

      {discussions.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No discussions yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedDiscussion(discussion)}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{discussion.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{discussion.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{discussion.userName}</span>
                    </div>
                    <span>
                      {discussion.createdAt?.toDate
                        ? discussion.createdAt.toDate().toLocaleDateString()
                        : new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DiscussionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateDiscussion}
        />
      )}

      {selectedDiscussion && (
        <DiscussionDetail
          discussion={selectedDiscussion}
          onClose={() => setSelectedDiscussion(null)}
        />
      )}
    </div>
  );
};

export default Discussions;

