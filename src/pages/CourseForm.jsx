import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortIntroduction: '',
    category: '',
    image: '',
    published: false,
    paidCourse: false,
    coursePrice: '',
    currency: 'USD',
    enableCertification: false,
  });

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      const fetchCourse = async () => {
        try {
          const docRef = doc(db, 'courses', courseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData({ ...docSnap.data() });
          }
        } catch (error) {
          toast.error('Failed to load course');
        }
      };
      fetchCourse();
    }
  }, [courseId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `courses/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData({ ...formData, image: url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (courseId === 'new') {
        const docRef = await addDoc(collection(db, 'courses'), {
          ...formData,
          instructorId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success('Course created successfully!');
        navigate(`/courses/${docRef.id}`);
      } else {
        await setDoc(doc(db, 'courses', courseId), {
          ...formData,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        toast.success('Course updated successfully!');
        navigate(`/courses/${courseId}`);
      }
    } catch (error) {
      toast.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">
          {courseId === 'new' ? 'Create Course' : 'Edit Course'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Short Introduction</label>
            <textarea
              value={formData.shortIntroduction}
              onChange={(e) => setFormData({ ...formData, shortIntroduction: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={6}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="">Select Category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Course Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="input"
                disabled={uploading}
              />
              {formData.image && (
                <img src={formData.image} alt="Course" className="mt-2 h-32 rounded" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded"
              />
              <span>Published</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.paidCourse}
                onChange={(e) => setFormData({ ...formData, paidCourse: e.target.checked })}
                className="rounded"
              />
              <span>Paid Course</span>
            </label>

            {formData.paidCourse && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    value={formData.coursePrice}
                    onChange={(e) => setFormData({ ...formData, coursePrice: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
            )}

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enableCertification}
                onChange={(e) => setFormData({ ...formData, enableCertification: e.target.checked })}
                className="rounded"
              />
              <span>Enable Certification</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;

