import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCourses } from './courseService';

// Add a related course
export const addRelatedCourse = async (courseId, relatedCourseId) => {
  try {
    const relatedRef = doc(db, 'relatedCourses', `${courseId}_${relatedCourseId}`);
    await setDoc(relatedRef, {
      courseId,
      relatedCourseId,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding related course:', error);
    return { success: false, error: error.message };
  }
};

// Remove a related course
export const removeRelatedCourse = async (courseId, relatedCourseId) => {
  try {
    const relatedRef = doc(db, 'relatedCourses', `${courseId}_${relatedCourseId}`);
    await deleteDoc(relatedRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing related course:', error);
    return { success: false, error: error.message };
  }
};

// Get related courses for a course
export const getRelatedCourses = async (courseId) => {
  try {
    const relatedRef = collection(db, 'relatedCourses');
    const q = query(relatedRef, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    const relatedIds = snapshot.docs.map(doc => doc.data().relatedCourseId);
    
    // Fetch course details
    const courses = await Promise.all(
      relatedIds.map(async (id) => {
        try {
          const { getCourse } = await import('./courseService');
          return await getCourse(id);
        } catch (error) {
          return null;
        }
      })
    );
    
    return courses.filter(c => c !== null);
  } catch (error) {
    console.error('Error getting related courses:', error);
    return [];
  }
};

// Get recommended courses based on user's enrolled courses
export const getRecommendedCourses = async (userId) => {
  try {
    const { getUserEnrollments } = await import('./courseService');
    const enrollments = await getUserEnrollments(userId);
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    
    // Get all related courses for enrolled courses
    const allRelatedIds = new Set();
    for (const courseId of enrolledCourseIds) {
      const related = await getRelatedCourses(courseId);
      related.forEach(c => {
        if (!enrolledCourseIds.includes(c.id)) {
          allRelatedIds.add(c.id);
        }
      });
    }
    
    // Also get courses in same category
    const allCourses = await getCourses({ published: true });
    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));
    const categories = new Set(enrolledCourses.map(c => c.category).filter(Boolean));
    
    const categoryBased = allCourses.filter(c => 
      !enrolledCourseIds.includes(c.id) && 
      categories.has(c.category)
    );
    
    categoryBased.forEach(c => allRelatedIds.add(c.id));
    
    // Fetch course details
    const recommended = await Promise.all(
      Array.from(allRelatedIds).slice(0, 6).map(async (id) => {
        try {
          const { getCourse } = await import('./courseService');
          return await getCourse(id);
        } catch (error) {
          return null;
        }
      })
    );
    
    return recommended.filter(c => c !== null && c.published);
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    return [];
  }
};

