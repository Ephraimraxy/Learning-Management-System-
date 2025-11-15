import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getNotes, createOrUpdateNote, subscribeToNote } from '../services/noteService';
import { FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const NotesPanel = ({ lessonId }) => {
  const { user } = useAuthStore();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !lessonId) return;

    const loadNote = async () => {
      try {
        const noteData = await getNotes(user.uid, lessonId);
        if (noteData) {
          setNote(noteData);
          setContent(noteData.content || '');
        }
      } catch (error) {
        console.error('Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    loadNote();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNote(user.uid, lessonId, (noteData) => {
      if (noteData) {
        setNote(noteData);
        setContent(noteData.content || '');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, lessonId]);

  const handleSave = async () => {
    if (!user || !lessonId) return;

    setSaving(true);
    try {
      await createOrUpdateNote(user.uid, lessonId, content);
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-4 text-center text-gray-500">
        Please login to take notes
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold">My Notes</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading notes...</div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[200px]"
          placeholder="Take notes about this lesson..."
          onBlur={handleSave}
        />
      )}
    </div>
  );
};

export default NotesPanel;

