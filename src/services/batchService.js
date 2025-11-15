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

// Get all batches
export const getBatches = async () => {
  try {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If orderBy fails, try without it
    try {
      const snapshot = await getDocs(collection(db, 'batches'));
      const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory
      return batches.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (fallbackError) {
      console.warn('Failed to fetch batches:', fallbackError);
      return [];
    }
  }
};

// Batch enrollments
export const enrollInBatch = async (batchId, userId) => {
  // Check if already enrolled
  const q = query(
    collection(db, 'batchEnrollments'),
    where('batchId', '==', batchId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error('Already enrolled in this batch');
  }

  await addDoc(collection(db, 'batchEnrollments'), {
    batchId,
    userId,
    enrolledAt: new Date().toISOString(),
    progress: 0,
  });

  // Update batch student count
  const batchRef = doc(db, 'batches', batchId);
  const batchSnap = await getDoc(batchRef);
  if (batchSnap.exists()) {
    const currentCount = batchSnap.data().enrolledStudents || 0;
    await updateDoc(batchRef, {
      enrolledStudents: currentCount + 1,
    });
  }
};

export const getBatchEnrollments = async (batchId) => {
  const q = query(
    collection(db, 'batchEnrollments'),
    where('batchId', '==', batchId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserBatchEnrollment = async (batchId, userId) => {
  const q = query(
    collection(db, 'batchEnrollments'),
    where('batchId', '==', batchId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const getUserBatches = async (userId) => {
  const q = query(
    collection(db, 'batchEnrollments'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const enrollments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Fetch batch details for each enrollment
  const batches = await Promise.all(
    enrollments.map(async (enrollment) => {
      const batchRef = doc(db, 'batches', enrollment.batchId);
      const batchSnap = await getDoc(batchRef);
      if (batchSnap.exists()) {
        return {
          ...batchSnap.data(),
          id: batchSnap.id,
          enrollmentId: enrollment.id,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
        };
      }
      return null;
    })
  );
  
  return batches.filter(b => b !== null);
};

// Student progress tracking
export const getBatchStudentProgress = async (batchId, userId) => {
  const enrollment = await getUserBatchEnrollment(batchId, userId);
  if (!enrollment) return null;

  // Get batch courses
  const batchRef = doc(db, 'batches', batchId);
  const batchSnap = await getDoc(batchRef);
  if (!batchSnap.exists()) return null;

  const batch = batchSnap.data();
  const courseIds = batch.courses || [];

  // Get progress for each course
  const courseProgress = await Promise.all(
    courseIds.map(async (courseId) => {
      // Get chapters
      const chaptersQuery = query(
        collection(db, 'chapters'),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      const chaptersSnap = await getDocs(chaptersQuery);
      const chapters = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get lessons for each chapter
      let totalLessons = 0;
      let completedLessons = 0;

      for (const chapter of chapters) {
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('chapterId', '==', chapter.id),
          orderBy('order', 'asc')
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        const lessons = lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        totalLessons += lessons.length;

        // Check completed lessons
        for (const lesson of lessons) {
          const progressQuery = query(
            collection(db, 'lessonProgress'),
            where('userId', '==', userId),
            where('lessonId', '==', lesson.id)
          );
          const progressSnap = await getDocs(progressQuery);
          if (!progressSnap.empty) {
            const progress = progressSnap.docs[0].data();
            if (progress.progress >= 100) {
              completedLessons++;
            }
          }
        }
      }

      const courseProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // Get course details
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      const course = courseSnap.exists() ? courseSnap.data() : { title: 'Unknown Course' };

      return {
        courseId,
        courseTitle: course.title,
        totalLessons,
        completedLessons,
        progress: Math.round(courseProgressPercent),
      };
    })
  );

  const overallProgress = courseProgress.length > 0
    ? courseProgress.reduce((sum, cp) => sum + cp.progress, 0) / courseProgress.length
    : 0;

  return {
    enrollment,
    courseProgress,
    overallProgress: Math.round(overallProgress),
  };
};

export const getAllBatchStudentsProgress = async (batchId) => {
  const enrollments = await getBatchEnrollments(batchId);
  
  const studentsProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const progress = await getBatchStudentProgress(batchId, enrollment.userId);
      
      // Get user details
      const userRef = doc(db, 'users', enrollment.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : { name: 'Unknown User', email: '' };

      return {
        userId: enrollment.userId,
        userName: userData.name || userData.email,
        userEmail: userData.email,
        enrollmentDate: enrollment.enrolledAt,
        progress: progress?.overallProgress || 0,
        courseProgress: progress?.courseProgress || [],
      };
    })
  );

  return studentsProgress;
};

// Batch analytics
export const getBatchAnalytics = async (batchId) => {
  const enrollments = await getBatchEnrollments(batchId);
  const studentsProgress = await getAllBatchStudentsProgress(batchId);

  const totalStudents = enrollments.length;
  const averageProgress = studentsProgress.length > 0
    ? studentsProgress.reduce((sum, sp) => sum + sp.progress, 0) / studentsProgress.length
    : 0;

  // Get assignments
  const assignmentsQuery = query(
    collection(db, 'assignments'),
    where('batchId', '==', batchId)
  );
  const assignmentsSnap = await getDocs(assignmentsQuery);
  const assignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Get submissions count
  let totalSubmissions = 0;
  let gradedSubmissions = 0;
  for (const assignment of assignments) {
    const submissionsQuery = query(
      collection(db, 'assignmentSubmissions'),
      where('assignmentId', '==', assignment.id)
    );
    const submissionsSnap = await getDocs(submissionsQuery);
    const submissions = submissionsSnap.docs.map(doc => doc.data());
    totalSubmissions += submissions.length;
    gradedSubmissions += submissions.filter(s => s.status === 'graded').length;
  }

  // Get upcoming live classes
  const batchRef = doc(db, 'batches', batchId);
  const batchSnap = await getDoc(batchRef);
  const batch = batchSnap.exists() ? batchSnap.data() : {};
  const liveClasses = batch.liveClasses || [];
  const now = new Date();
  const upcomingClasses = liveClasses.filter(lc => new Date(lc.date) > now);

  return {
    totalStudents,
    averageProgress: Math.round(averageProgress),
    totalAssignments: assignments.length,
    totalSubmissions,
    gradedSubmissions,
    upcomingClasses: upcomingClasses.length,
    completionRate: totalStudents > 0 ? Math.round((studentsProgress.filter(sp => sp.progress === 100).length / totalStudents) * 100) : 0,
  };
};

// Update batch progress
export const updateBatchProgress = async (batchId, userId, progress) => {
  const q = query(
    collection(db, 'batchEnrollments'),
    where('batchId', '==', batchId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const enrollmentRef = doc(db, 'batchEnrollments', snapshot.docs[0].id);
    await updateDoc(enrollmentRef, {
      progress,
      updatedAt: new Date().toISOString(),
    });
  }
};

