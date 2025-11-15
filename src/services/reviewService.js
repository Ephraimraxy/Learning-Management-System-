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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getCourseReviews = async (courseId) => {
  const q = query(
    collection(db, 'reviews'),
    where('courseId', '==', courseId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createReview = async (reviewData) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateReview = async (reviewId, data) => {
  const docRef = doc(db, 'reviews', reviewId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteReview = async (reviewId) => {
  await deleteDoc(doc(db, 'reviews', reviewId));
};

export const getCourseRating = async (courseId) => {
  const reviews = await getCourseReviews(courseId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const average = totalRating / reviews.length;
  
  return {
    average: Math.round(average * 10) / 10,
    count: reviews.length
  };
};

