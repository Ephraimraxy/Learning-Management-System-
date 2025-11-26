import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DailyIframe from '@daily-co/daily-js';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import {
  subscribeToLiveClass,
  markAttendance,
  getClassAttendance,
  saveLiveClassRecording,
  updateLiveClassStatus,
} from '../services/liveClassService';
import { createDailyMeetingToken } from '../services/dailyService';

const LiveClassroom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuthStore();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [participants, setParticipants] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [recordingNotes, setRecordingNotes] = useState('');
  const iframeRef = useRef(null);
  const callFrameRef = useRef(null);

  const isInstructor = userData?.role === 'admin' || userData?.role === 'instructor';

  const loadAttendance = useCallback(async () => {
    if (!classId) return;
    try {
      const list = await getClassAttendance(classId);
      setAttendance(list);
    } catch (err) {
      console.error('Failed to load attendance', err);
    }
  }, [classId]);

  useEffect(() => {
    if (!classId) return;
    const unsubscribe = subscribeToLiveClass(classId, (doc) => {
      setLiveClass(doc);
      setLoading(false);
      if (doc?.recordingUrl) {
        setRecordingUrl(doc.recordingUrl);
      }
      if (doc?.recordingNotes) {
        setRecordingNotes(doc.recordingNotes);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [classId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave();
        callFrameRef.current.destroy();
      }
    };
  }, []);

  const attachCallFrameListeners = (frame) => {
    frame.on('participant-joined', (ev) => {
      setParticipants((prev) => ({
        ...prev,
        [ev.participant.session_id || ev.participant.user_id]: ev.participant,
      }));
    });
    frame.on('participant-updated', (ev) => {
      setParticipants((prev) => ({
        ...prev,
        [ev.participant.session_id || ev.participant.user_id]: ev.participant,
      }));
    });
    frame.on('participant-left', (ev) => {
      setParticipants((prev) => {
        const updated = { ...prev };
        delete updated[ev.participant.session_id || ev.participant.user_id];
        return updated;
      });
    });
  };

  const handleJoin = async () => {
    if (!liveClass?.dailyRoomName) {
      toast.error('Missing Daily room configuration for this class.');
      return;
    }
    if (!user) {
      toast.error('Please log in again.');
      return;
    }

    setJoining(true);
    try {
      const role = isInstructor ? 'instructor' : 'student';
      const identity =
        `${role}-` +
        (userData?.name?.replace(/\s+/g, '-').toLowerCase() ||
          userData?.email ||
          user.displayName ||
          user.uid);

      const tokenResponse = await createDailyMeetingToken({
        room: liveClass.dailyRoomName,
        identity,
        isOwner: isInstructor,
        userData: {
          user_id: user.uid,
          batch_id: liveClass.batchId,
        },
      });

      const frame = DailyIframe.createFrame(iframeRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '520px',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
        },
      });
      attachCallFrameListeners(frame);
      await frame.join({ url: tokenResponse.url, token: tokenResponse.token });

      callFrameRef.current = frame;
      await markAttendance(classId, user.uid, 'present');
      await loadAttendance();
      if (isInstructor && liveClass.status !== 'live') {
        await updateLiveClassStatus(classId, 'live');
      }
      toast.success('Joined classroom');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to join meeting');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
      callFrameRef.current.destroy();
      callFrameRef.current = null;
      setParticipants({});
    }
    if (isInstructor) {
      await updateLiveClassStatus(classId, 'ended');
    }
    toast.success('Call ended');
  };

  const handleRecordingSave = async () => {
    try {
      await saveLiveClassRecording(classId, {
        url: recordingUrl,
        notes: recordingNotes,
      });
      toast.success('Recording details saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save recording details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold mb-4">Live class not found</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Live Classroom</p>
            <h1 className="text-2xl font-bold">{liveClass.title}</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">{liveClass.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold capitalize">{liveClass.status || 'scheduled'}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Scheduled Time</p>
            <p className="font-semibold">{new Date(liveClass.date).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold">{liveClass.duration || 60} mins</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Provider</p>
            <p className="font-semibold capitalize">{liveClass.meetingProvider}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="btn btn-primary"
            onClick={handleJoin}
            disabled={joining || liveClass.meetingProvider !== 'daily'}
          >
            {joining ? 'Joining...' : 'Enter Classroom'}
          </button>
          {callFrameRef.current && (
            <button className="btn btn-secondary" onClick={handleLeave}>
              Leave session
            </button>
          )}
          {liveClass.externalLink && liveClass.meetingProvider === 'external' && (
            <a
              href={liveClass.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Join external meeting
            </a>
          )}
        </div>
      </div>

      {liveClass.meetingProvider === 'daily' && (
        <div className="card">
          <div ref={iframeRef} />
          {!callFrameRef.current && (
            <p className="text-sm text-gray-500 text-center py-6">
              Click &quot;Enter Classroom&quot; to launch the embedded Daily call.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Participants</h2>
            <span className="text-sm text-gray-500">{Object.keys(participants).length} live</span>
          </div>
          {Object.keys(participants).length === 0 ? (
            <p className="text-sm text-gray-500">No one in the room yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(participants).map(([id, participant]) => (
                <div key={id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold">
                    {participant.user_name || participant.user_id || participant.session_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    audio: {participant.audio ? 'on' : 'muted'} | video:{' '}
                    {participant.video ? 'on' : 'off'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Attendance</h2>
          {attendance.length === 0 ? (
            <p className="text-sm text-gray-500">No attendance logs yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {attendance.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold">{entry.userId}</p>
                  <p className="text-xs text-gray-500 capitalize">{entry.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isInstructor && liveClass.recordingEnabled && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Recording</h2>
              <p className="text-sm text-gray-500">
                Save the playback link or notes for learners who missed the call.
              </p>
            </div>
            <span className="text-xs uppercase text-gray-500">
              {liveClass.recordingStatus || 'pending'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recording URL</label>
              <input
                type="url"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={recordingNotes}
                onChange={(e) => setRecordingNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={handleRecordingSave}>
                Save recording details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassroom;

