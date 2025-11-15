import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Courses
export const getCourses = async (filters = {}) => {
  try {
    let q = query(collection(db, 'courses'));
    
    // Apply filters first
    if (filters.published) {
      q = query(q, where('published', '==', true));
    }
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    // If we have filters, we can't use orderBy on different field without index
    // So we'll sort in memory after fetching
    const snapshot = await getDocs(q);
    let courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by createdAt in memory
    courses.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order
    });
    
    return courses;
  } catch (error) {
    // If query fails due to index, try without filters and filter in memory
    console.warn('Query with filters failed, trying alternative approach:', error);
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      let courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Apply filters in memory
      if (filters.published) {
        courses = courses.filter(c => c.published === true);
      }
      if (filters.category) {
        courses = courses.filter(c => c.category === filters.category);
      }
      
      // Sort by createdAt
      courses.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      return courses;
    } catch (fallbackError) {
      console.error('Failed to fetch courses:', fallbackError);
      return [];
    }
  }
};

export const getCourse = async (courseId) => {
  const docRef = doc(db, 'courses', courseId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createCourse = async (courseData) => {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...courseData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateCourse = async (courseId, courseData) => {
  const docRef = doc(db, 'courses', courseId);
  await updateDoc(docRef, {
    ...courseData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCourse = async (courseId) => {
  await deleteDoc(doc(db, 'courses', courseId));
};

// Chapters
export const getChapters = async (courseId) => {
  const q = query(
    collection(db, 'chapters'),
    where('courseId', '==', courseId),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createChapter = async (chapterData) => {
  const docRef = await addDoc(collection(db, 'chapters'), {
    ...chapterData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Lessons
export const getLessons = async (chapterId) => {
  const q = query(
    collection(db, 'lessons'),
    where('chapterId', '==', chapterId),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getLesson = async (lessonId) => {
  const docRef = doc(db, 'lessons', lessonId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createLesson = async (lessonData) => {
  const docRef = await addDoc(collection(db, 'lessons'), {
    ...lessonData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Enrollments
export const enrollInCourse = async (courseId, userId) => {
  await addDoc(collection(db, 'enrollments'), {
    courseId,
    userId,
    enrolledAt: new Date().toISOString(),
    progress: 0,
  });
};

export const getUserEnrollments = async (userId) => {
  const q = query(
    collection(db, 'enrollments'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Progress
export const updateLessonProgress = async (userId, lessonId, progress) => {
  await addDoc(collection(db, 'lessonProgress'), {
    userId,
    lessonId,
    progress,
    updatedAt: new Date().toISOString(),
  });
};

