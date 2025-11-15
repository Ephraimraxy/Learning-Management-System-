import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getNotifications = async (userId, limitCount = 50) => {
  try {
    // Try with orderBy first (requires composite index)
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index doesn't exist, fall back to simpler query and filter in memory
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory
        return notifications.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      } catch (fallbackError) {
        console.warn('Failed to fetch notifications:', fallbackError);
        return [];
      }
    }
    // For other errors, return empty array
    console.warn('Failed to fetch notifications:', error);
    return [];
  }
};

export const getUnreadNotifications = async (userId) => {
  try {
    // Try query with orderBy first (requires composite index)
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If index doesn't exist, fall back to simpler query and filter in memory
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory
        return notifications.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      } catch (fallbackError) {
        // If even that fails, return empty array
        return [];
      }
    }
    // For other errors, return empty array
    return [];
  }
};

export const createNotification = async (notificationData) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notificationData,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const markAsRead = async (notificationId) => {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, {
    read: true,
    readAt: serverTimestamp(),
  });
};

export const markAllAsRead = async (userId) => {
  const notifications = await getUnreadNotifications(userId);
  const updatePromises = notifications.map(notif => markAsRead(notif.id));
  await Promise.all(updatePromises);
};

export const subscribeToNotifications = (userId, callback) => {
  try {
    // Try with orderBy first
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications);
      },
      (error) => {
        // If index error, try without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          try {
            const fallbackQ = query(
              collection(db, 'notifications'),
              where('userId', '==', userId),
              limit(20)
            );
            return onSnapshot(fallbackQ, (snapshot) => {
              const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              // Sort in memory
              notifications.sort((a, b) => {
                const dateA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
                const dateB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
              });
              callback(notifications);
            });
          } catch (fallbackError) {
            console.warn('Failed to subscribe to notifications:', fallbackError);
            callback([]);
          }
        } else {
          console.warn('Notification subscription error:', error);
          callback([]);
        }
      }
    );
  } catch (error) {
    console.warn('Failed to create notification subscription:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

