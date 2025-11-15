import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getComments, createComment, subscribeToComments } from '../services/discussionService';
import { X, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';

const DiscussionDetail = ({ discussion, onClose }) => {
  const { user, userData } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToComments(discussion.id, (data) => {
      setComments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [discussion.id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await createComment({
        discussionId: discussion.id,
        userId: user.uid,
        userName: userData?.name || user.email,
        content: newComment,
      });
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{discussion.title}</h2>
            <p className="text-gray-600 mb-4">{discussion.content}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span>{discussion.userName}</span>
              <span>•</span>
              <span>
                {discussion.createdAt?.toDate
                  ? discussion.createdAt.toDate().toLocaleDateString()
                  : new Date(discussion.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
          
          <div className="space-y-4 mb-6">
            {loading ? (
              <div className="text-center py-8">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No comments yet</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-gray-800 mb-2">{comment.content}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{comment.userName}</span>
                    <span>•</span>
                    <span>
                      {comment.createdAt?.toDate
                        ? comment.createdAt.toDate().toLocaleDateString()
                        : new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {user && (
            <form onSubmit={handleSubmitComment} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Post</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;

