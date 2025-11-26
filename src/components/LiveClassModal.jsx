import { useState, useEffect } from 'react';
import { createLiveClass, updateLiveClass } from '../services/liveClassService';
import { createDailyRoom } from '../services/dailyService';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveClassModal = ({ isOpen, onClose, batchId, classData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    externalLink: '',
    meetingId: '',
    password: '',
    meetingProvider: 'daily',
    recordingEnabled: true,
    dailyRoomName: '',
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
        externalLink: classData.zoomLink || classData.externalLink || '',
        meetingId: classData.meetingId || '',
        password: classData.password || '',
        meetingProvider: classData.meetingProvider || 'daily',
        recordingEnabled: typeof classData.recordingEnabled === 'boolean' ? classData.recordingEnabled : true,
        dailyRoomName: classData.dailyRoomName || '',
      });
    }
  }, [classData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const classDate = new Date(`${formData.date}T${formData.time}`);
      const basePayload = {
        batchId,
        title: formData.title,
        description: formData.description,
        date: classDate.toISOString(),
        time: formData.time,
        duration: formData.duration,
        meetingProvider: formData.meetingProvider,
        recordingEnabled: formData.recordingEnabled,
        status: classData?.status || 'scheduled',
      };

      let meetingMetadata = {};
      if (formData.meetingProvider === 'daily') {
        const desiredName = formData.dailyRoomName || classData?.dailyRoomName || `${batchId}-${Date.now()}`;
        if (!classData?.dailyRoomName) {
          const roomResponse = await createDailyRoom({
            name: desiredName,
            properties: {
              start_audio_off: false,
              start_video_off: false,
              enable_screenshare: true,
            },
          });
          meetingMetadata = {
            dailyRoomName: roomResponse?.name || desiredName,
            dailyRoomUrl: roomResponse?.url || '',
          };
        } else {
          meetingMetadata = {
            dailyRoomName: classData.dailyRoomName,
            dailyRoomUrl: classData.dailyRoomUrl || '',
          };
        }
      } else {
        meetingMetadata = {
          externalLink: formData.externalLink,
          zoomLink: formData.externalLink,
          meetingId: formData.meetingId,
          password: formData.password,
        };
      }

      const classDataToSave = {
        ...basePayload,
        ...meetingMetadata,
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
            <label className="block text-sm font-medium mb-1">Meeting Provider</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="meetingProvider"
                  value="daily"
                  checked={formData.meetingProvider === 'daily'}
                  onChange={(e) => setFormData({ ...formData, meetingProvider: e.target.value })}
                />
                <span>In-app (Daily)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="meetingProvider"
                  value="external"
                  checked={formData.meetingProvider === 'external'}
                  onChange={(e) => setFormData({ ...formData, meetingProvider: e.target.value })}
                />
                <span>External Link</span>
              </label>
            </div>
          </div>

          {formData.meetingProvider === 'daily' ? (
            <div>
              <label className="block text-sm font-medium mb-1">Custom Room Name (optional)</label>
              <input
                type="text"
                value={formData.dailyRoomName}
                onChange={(e) => setFormData({ ...formData, dailyRoomName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="batch-name-week-3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to auto-generate the Daily room name.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">External Meeting Link</label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
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
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              id="enable-recording"
              type="checkbox"
              checked={formData.recordingEnabled}
              onChange={(e) => setFormData({ ...formData, recordingEnabled: e.target.checked })}
            />
            <label htmlFor="enable-recording" className="text-sm font-medium">
              Enable recording workflow for this session
            </label>
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





