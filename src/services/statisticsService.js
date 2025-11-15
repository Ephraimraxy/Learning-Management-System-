import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get total number of students (users with role 'student')
export const getTotalStudents = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching total students:', error);
    return 0;
  }
};

// Get total number of certificates issued
export const getTotalCertificates = async () => {
  try {
    const certificatesRef = collection(db, 'certificates');
    const snapshot = await getDocs(certificatesRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching total certificates:', error);
    return 0;
  }
};

// Get total number of enrollments
export const getTotalEnrollments = async () => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const snapshot = await getDocs(enrollmentsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching total enrollments:', error);
    return 0;
  }
};

// Get total number of published courses
export const getTotalPublishedCourses = async () => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('published', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    // Fallback: get all courses and filter in memory
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const courses = snapshot.docs.map(doc => doc.data());
      return courses.filter(c => c.published === true).length;
    } catch (fallbackError) {
      console.error('Error fetching published courses:', fallbackError);
      return 0;
    }
  }
};

// Get total number of completed courses
export const getTotalCompletedCourses = async () => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const snapshot = await getDocs(enrollmentsRef);
    const enrollments = snapshot.docs.map(doc => doc.data());
    return enrollments.filter(e => e.progress === 100).length;
  } catch (error) {
    console.error('Error fetching completed courses:', error);
    return 0;
  }
};

// Get total number of completed lessons
export const getTotalCompletedLessons = async () => {
  try {
    const progressRef = collection(db, 'lessonProgress');
    const snapshot = await getDocs(progressRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    return 0;
  }
};

// Get all statistics at once
export const getAllStatistics = async () => {
  try {
    const [
      totalStudents,
      totalCertificates,
      totalEnrollments,
      totalPublishedCourses,
      totalCompletedCourses,
      totalCompletedLessons,
    ] = await Promise.all([
      getTotalStudents(),
      getTotalCertificates(),
      getTotalEnrollments(),
      getTotalPublishedCourses(),
      getTotalCompletedCourses(),
      getTotalCompletedLessons(),
    ]);

    return {
      totalStudents,
      totalCertificates,
      totalEnrollments,
      totalPublishedCourses,
      totalCompletedCourses,
      totalCompletedLessons,
    };
  } catch (error) {
    console.error('Error fetching all statistics:', error);
    return {
      totalStudents: 0,
      totalCertificates: 0,
      totalEnrollments: 0,
      totalPublishedCourses: 0,
      totalCompletedCourses: 0,
      totalCompletedLessons: 0,
    };
  }
};

