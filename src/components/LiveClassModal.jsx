import { useState, useEffect } from 'react';
import { createLiveClass, updateLiveClass } from '../services/liveClassService';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveClassModal = ({ isOpen, onClose, batchId, classData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    zoomLink: '',
    meetingId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classData) {
      const classDate = classData.date ? new Date(classData.date).toISOString().split('T')[0] : '';
      const classTime = classData.time || '';
      setFormData({
        title: classData.title || '',
        description: classData.description || '',
        date: classDate,
        time: classTime,
        duration: classData.duration || 60,
        zoomLink: classData.zoomLink || '',
        meetingId: classData.meetingId || '',
        password: classData.password || '',
      });
    }
  }, [classData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const classDataToSave = {
        batchId,
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        time: formData.time,
        duration: formData.duration,
        zoomLink: formData.zoomLink,
        meetingId: formData.meetingId,
        password: formData.password,
      };

      if (classData?.id) {
        await updateLiveClass(classData.id, classDataToSave);
        toast.success('Live class updated successfully');
      } else {
        await createLiveClass(classDataToSave);
        toast.success('Live class created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save live class');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {classData ? 'Edit Live Class' : 'Create Live Class'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min={15}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Zoom Meeting Link</label>
            <input
              type="url"
              value={formData.zoomLink}
              onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meeting ID</label>
              <input
                type="text"
                value={formData.meetingId}
                onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : classData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveClassModal;


