import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getCourseReviews, createReview, getCourseRating } from '../services/reviewService';
import { Star, MessageSquare, Plus, X } from 'lucide-react';
import ReactStars from 'react-rating-stars-component';
import toast from 'react-hot-toast';

const CourseReviews = () => {
  const { courseId } = useParams();
  const { user, userData } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const [reviewsData, ratingData] = await Promise.all([
          getCourseReviews(courseId),
          getCourseRating(courseId),
        ]);
        setReviews(reviewsData);
        setRating(ratingData);
      } catch (error) {
        console.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [courseId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await createReview({
        courseId,
        userId: user.uid,
        userName: userData?.name || user.email,
        rating: reviewRating,
        content: reviewContent,
      });
      toast.success('Review submitted successfully');
      setShowModal(false);
      setReviewRating(0);
      setReviewContent('');
      // Reload reviews
      const [reviewsData, ratingData] = await Promise.all([
        getCourseReviews(courseId),
        getCourseRating(courseId),
      ]);
      setReviews(reviewsData);
      setRating(ratingData);
    } catch (error) {
      toast.error('Failed to submit review');
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Course Reviews</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{rating.average}</span>
            </div>
            <span className="text-gray-600">({rating.count} reviews)</span>
          </div>
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Write Review</span>
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Star className="h-5 w-5 text-primary-600 fill-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{review.userName}</h3>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
                  )}
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
              <h2 className="text-2xl font-bold">Write a Review</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <ReactStars
                  count={5}
                  value={reviewRating}
                  onChange={setReviewRating}
                  size={40}
                  activeColor="#ffd700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="6"
                  placeholder="Share your thoughts about this course..."
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
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReviews;

