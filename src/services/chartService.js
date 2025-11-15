import { collection, getDocs, query, where, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get signups over time (last 30 days by default)
export const getSignupsChartData = async (days = 30) => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Group by date
    const dateMap = new Map();
    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        if (date >= startDate) {
          const dateKey = date.toISOString().split('T')[0];
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
        }
      }
    });

    // Fill in missing dates with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        signups: dateMap.get(dateKey) || 0,
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching signups chart data:', error);
    return [];
  }
};

// Get enrollments over time
export const getEnrollmentsChartData = async (days = 30) => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const snapshot = await getDocs(enrollmentsRef);
    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const dateMap = new Map();
    enrollments.forEach(enrollment => {
      if (enrollment.enrolledAt) {
        const date = new Date(enrollment.enrolledAt);
        if (date >= startDate) {
          const dateKey = date.toISOString().split('T')[0];
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
        }
      }
    });

    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        enrollments: dateMap.get(dateKey) || 0,
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching enrollments chart data:', error);
    return [];
  }
};

// Get certifications over time
export const getCertificationsChartData = async (days = 30) => {
  try {
    const certificatesRef = collection(db, 'certificates');
    const snapshot = await getDocs(certificatesRef);
    const certificates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const dateMap = new Map();
    certificates.forEach(cert => {
      if (cert.issuedAt || cert.createdAt) {
        const date = new Date(cert.issuedAt || cert.createdAt);
        if (date >= startDate) {
          const dateKey = date.toISOString().split('T')[0];
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
        }
      }
    });

    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        certifications: dateMap.get(dateKey) || 0,
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching certifications chart data:', error);
    return [];
  }
};

// Get lesson completion chart data
export const getLessonCompletionChartData = async (days = 30) => {
  try {
    const progressRef = collection(db, 'lessonProgress');
    const snapshot = await getDocs(progressRef);
    const progress = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const dateMap = new Map();
    progress.forEach(p => {
      if (p.updatedAt || p.createdAt) {
        const date = new Date(p.updatedAt || p.createdAt);
        if (date >= startDate) {
          const dateKey = date.toISOString().split('T')[0];
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
        }
      }
    });

    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        completions: dateMap.get(dateKey) || 0,
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching lesson completion chart data:', error);
    return [];
  }
};

