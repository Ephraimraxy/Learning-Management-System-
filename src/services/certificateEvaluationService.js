import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Certificate Requests
export const createCertificateRequest = async (requestData) => {
  try {
    const requestsRef = collection(db, 'certificateRequests');
    const docRef = await addDoc(requestsRef, {
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating certificate request:', error);
    return { success: false, error: error.message };
  }
};

export const getCertificateRequests = async (filters = {}) => {
  try {
    let q = query(collection(db, 'certificateRequests'));
    
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.courseId) {
      q = query(q, where('courseId', '==', filters.courseId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching certificate requests:', error);
    return [];
  }
};

export const updateCertificateRequest = async (requestId, updateData) => {
  try {
    const requestRef = doc(db, 'certificateRequests', requestId);
    await updateDoc(requestRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating certificate request:', error);
    return { success: false, error: error.message };
  }
};

// Certificate Evaluations
export const createCertificateEvaluation = async (evaluationData) => {
  try {
    const evaluationsRef = collection(db, 'certificateEvaluations');
    const docRef = await addDoc(evaluationsRef, {
      ...evaluationData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating certificate evaluation:', error);
    return { success: false, error: error.message };
  }
};

export const getCertificateEvaluations = async (certificateId) => {
  try {
    const evaluationsRef = collection(db, 'certificateEvaluations');
    const q = query(evaluationsRef, where('certificateId', '==', certificateId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching certificate evaluations:', error);
    return [];
  }
};

export const updateCertificateEvaluation = async (evaluationId, updateData) => {
  try {
    const evaluationRef = doc(db, 'certificateEvaluations', evaluationId);
    await updateDoc(evaluationRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating certificate evaluation:', error);
    return { success: false, error: error.message };
  }
};

// Approve certificate request and create certificate
export const approveCertificateRequest = async (requestId, evaluatorId) => {
  try {
    const requestRef = doc(db, 'certificateRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      return { success: false, error: 'Request not found' };
    }
    
    const requestData = requestSnap.data();
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      evaluatorId,
    });
    
    // Create certificate
    const { createCertificate } = await import('./certificateService');
    const certificateResult = await createCertificate({
      userId: requestData.userId,
      courseId: requestData.courseId,
      batchId: requestData.batchId,
      issuedAt: new Date().toISOString(),
    });
    
    if (certificateResult.success) {
      // Create evaluation record
      await createCertificateEvaluation({
        certificateId: certificateResult.id,
        requestId,
        evaluatorId,
        status: 'approved',
        notes: requestData.notes || '',
      });
    }
    
    return { success: true, certificateId: certificateResult.id };
  } catch (error) {
    console.error('Error approving certificate request:', error);
    return { success: false, error: error.message };
  }
};

// Reject certificate request
export const rejectCertificateRequest = async (requestId, evaluatorId, reason) => {
  try {
    const requestRef = doc(db, 'certificateRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      evaluatorId,
      rejectionReason: reason,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting certificate request:', error);
    return { success: false, error: error.message };
  }
};

