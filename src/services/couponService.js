import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get all coupons
export const getCoupons = async () => {
  try {
    const couponsRef = collection(db, 'coupons');
    const snapshot = await getDocs(couponsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};

// Get a single coupon by code
export const getCouponByCode = async (code) => {
  try {
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    
    // Check if coupon is valid
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return null; // Not yet valid
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return null; // Expired
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return null; // Usage limit reached
    }
    
    return coupon;
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return null;
  }
};

// Create a coupon
export const createCoupon = async (couponData) => {
  try {
    const couponsRef = collection(db, 'coupons');
    const docRef = await addDoc(couponsRef, {
      ...couponData,
      code: couponData.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating coupon:', error);
    return { success: false, error: error.message };
  }
};

// Update coupon
export const updateCoupon = async (couponId, couponData) => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return { success: false, error: error.message };
  }
};

// Delete coupon
export const deleteCoupon = async (couponId) => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    await deleteDoc(couponRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, error: error.message };
  }
};

// Apply coupon to a price
export const applyCoupon = async (code, originalPrice) => {
  try {
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return { success: false, error: 'Invalid or expired coupon' };
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (originalPrice * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }
    
    const finalPrice = Math.max(0, originalPrice - discount);
    
    // Increment used count
    const couponRef = doc(db, 'coupons', coupon.id);
    await updateDoc(couponRef, {
      usedCount: (coupon.usedCount || 0) + 1,
    });
    
    return {
      success: true,
      discount,
      finalPrice,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  } catch (error) {
    console.error('Error applying coupon:', error);
    return { success: false, error: error.message };
  }
};

// Get coupon items (courses/products associated with coupon)
export const getCouponItems = async (couponId) => {
  try {
    const couponItemsRef = collection(db, 'couponItems');
    const q = query(couponItemsRef, where('couponId', '==', couponId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching coupon items:', error);
    return [];
  }
};

