import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Express interest in a course
export const expressCourseInterest = async (courseId, userId) => {
  try {
    const interestRef = doc(db, 'courseInterests', `${courseId}_${userId}`);
    await setDoc(interestRef, {
      courseId,
      userId,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error expressing course interest:', error);
    return { success: false, error: error.message };
  }
};

// Remove interest in a course
export const removeCourseInterest = async (courseId, userId) => {
  try {
    const interestRef = doc(db, 'courseInterests', `${courseId}_${userId}`);
    await deleteDoc(interestRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing course interest:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is interested in a course
export const isUserInterested = async (courseId, userId) => {
  try {
    const interestRef = doc(db, 'courseInterests', `${courseId}_${userId}`);
    const interestSnap = await getDoc(interestRef);
    return interestSnap.exists();
  } catch (error) {
    console.error('Error checking course interest:', error);
    return false;
  }
};

// Get interest count for a course
export const getCourseInterestCount = async (courseId) => {
  try {
    const interestsRef = collection(db, 'courseInterests');
    const q = query(interestsRef, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting course interest count:', error);
    return 0;
  }
};

// Get courses user is interested in
export const getUserInterestedCourses = async (userId) => {
  try {
    const interestsRef = collection(db, 'courseInterests');
    const q = query(interestsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user interested courses:', error);
    return [];
  }
};

