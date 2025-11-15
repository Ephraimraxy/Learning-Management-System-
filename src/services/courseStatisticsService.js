import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getChapters } from './courseService';

// Auto-update course statistics
export const updateCourseStatistics = async (courseId) => {
  try {
    // Get lesson count
    const chapters = await getChapters(courseId);
    let lessonCount = 0;
    for (const chapter of chapters) {
      const { getLessons } = await import('./courseService');
      const lessons = await getLessons(chapter.id);
      lessonCount += lessons.length;
    }

    // Get enrollment count
    const enrollmentsRef = collection(db, 'enrollments');
    const enrollmentsQuery = query(enrollmentsRef, where('courseId', '==', courseId));
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const enrollmentCount = enrollmentsSnapshot.size;

    // Get average rating
    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(reviewsRef, where('courseId', '==', courseId));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      averageRating = totalRating / reviews.length;
    }

    // Update course document
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      lessons: lessonCount,
      enrollments: enrollmentCount,
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      statisticsUpdatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      statistics: {
        lessons: lessonCount,
        enrollments: enrollmentCount,
        rating: averageRating,
      },
    };
  } catch (error) {
    console.error('Error updating course statistics:', error);
    return { success: false, error: error.message };
  }
};

// Update all courses statistics
export const updateAllCoursesStatistics = async () => {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const results = await Promise.all(
      courses.map(course => updateCourseStatistics(course.id))
    );

    const successful = results.filter(r => r.success).length;
    return {
      success: true,
      total: courses.length,
      successful,
      failed: courses.length - successful,
    };
  } catch (error) {
    console.error('Error updating all courses statistics:', error);
    return { success: false, error: error.message };
  }
};

