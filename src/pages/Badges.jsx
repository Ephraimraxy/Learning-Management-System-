import { useEffect, useState } from 'react';
import { getBadges, getUserBadges, createBadge } from '../services/badgeService';
import { useAuthStore } from '../stores/authStore';
import { Award, Plus, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, userData } = useAuthStore();
  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [allBadges, myBadges] = await Promise.all([
          getBadges(),
          user ? getUserBadges(user.uid) : Promise.resolve([]),
        ]);
        setBadges(allBadges);
        setUserBadges(myBadges);
      } catch (error) {
        toast.error('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Badges</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Badge</span>
          </button>
        )}
      </div>

      {/* My Badges */}
      {user && userBadges.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>My Badges</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userBadges.map((userBadge) => {
              const badge = badges.find(b => b.id === userBadge.badgeId);
              if (!badge) return null;
              return (
                <div key={userBadge.id} className="border rounded-lg p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <Award className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
                  <h3 className="font-semibold">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Earned: {new Date(userBadge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Badges */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">All Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`border rounded-lg p-4 text-center ${
                  isEarned
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <Award
                  className={`h-12 w-12 mx-auto mb-2 ${
                    isEarned ? 'text-yellow-600' : 'text-gray-400'
                  }`}
                />
                <h3 className="font-semibold">{badge.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                {isEarned && (
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">
                    Earned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <BadgeCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh badges
            getBadges().then(setBadges);
          }}
        />
      )}
    </div>
  );
};

const BadgeCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Award',
    criteria: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBadge(formData);
      toast.success('Badge created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create badge');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Badge</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Criteria</label>
            <input
              type="text"
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Complete 10 courses"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Badges;

