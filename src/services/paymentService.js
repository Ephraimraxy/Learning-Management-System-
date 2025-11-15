import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getTransactions = async (userId) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTransaction = async (transactionData) => {
  const docRef = await addDoc(collection(db, 'transactions'), {
    ...transactionData,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
  return docRef.id;
};

export const updateTransaction = async (transactionId, data) => {
  const docRef = doc(db, 'transactions', transactionId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Coupons
export const getCoupons = async () => {
  const snapshot = await getDocs(collection(db, 'coupons'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCoupon = async (couponCode) => {
  const q = query(
    collection(db, 'coupons'),
    where('code', '==', couponCode.toUpperCase()),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const couponDoc = snapshot.docs[0];
  return { id: couponDoc.id, ...couponDoc.data() };
};

export const validateCoupon = async (couponCode) => {
  const coupon = await getCoupon(couponCode);
  if (!coupon) return { valid: false, error: 'Invalid coupon code' };
  
  const now = new Date();
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { valid: false, error: 'Coupon has expired' };
  }
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }
  
  return { valid: true, coupon };
};

export const applyCoupon = async (couponCode, amount) => {
  const validation = await validateCoupon(couponCode);
  if (!validation.valid) {
    return validation;
  }
  
  const coupon = validation.coupon;
  let discount = 0;
  
  if (coupon.type === 'percentage') {
    discount = (amount * coupon.value) / 100;
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }
  
  const finalAmount = Math.max(0, amount - discount);
  
  return {
    valid: true,
    discount,
    finalAmount,
    coupon,
  };
};

