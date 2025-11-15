import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Timetable Templates
export const getTimetableTemplates = async () => {
  try {
    const templatesRef = collection(db, 'timetableTemplates');
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching timetable templates:', error);
    return [];
  }
};

export const createTimetableTemplate = async (templateData) => {
  try {
    const templatesRef = collection(db, 'timetableTemplates');
    const docRef = await addDoc(templatesRef, {
      ...templateData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating timetable template:', error);
    return { success: false, error: error.message };
  }
};

// Timetable Legends
export const getTimetableLegends = async () => {
  try {
    const legendsRef = collection(db, 'timetableLegends');
    const snapshot = await getDocs(legendsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching timetable legends:', error);
    return [];
  }
};

// Batch Timetable
export const getBatchTimetable = async (batchId) => {
  try {
    const timetableRef = collection(db, 'batchTimetables');
    const q = query(timetableRef, where('batchId', '==', batchId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching batch timetable:', error);
    return [];
  }
};

export const createBatchTimetableEntry = async (batchId, timetableData) => {
  try {
    const timetableRef = collection(db, 'batchTimetables');
    const docRef = await addDoc(timetableRef, {
      batchId,
      ...timetableData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating batch timetable entry:', error);
    return { success: false, error: error.message };
  }
};

export const updateBatchTimetableEntry = async (entryId, timetableData) => {
  try {
    const entryRef = doc(db, 'batchTimetables', entryId);
    await updateDoc(entryRef, {
      ...timetableData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating batch timetable entry:', error);
    return { success: false, error: error.message };
  }
};

export const deleteBatchTimetableEntry = async (entryId) => {
  try {
    const entryRef = doc(db, 'batchTimetables', entryId);
    await deleteDoc(entryRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting batch timetable entry:', error);
    return { success: false, error: error.message };
  }
};

// Scheduled Flows
export const getScheduledFlows = async (batchId) => {
  try {
    const flowsRef = collection(db, 'scheduledFlows');
    const q = query(flowsRef, where('batchId', '==', batchId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching scheduled flows:', error);
    return [];
  }
};

export const createScheduledFlow = async (flowData) => {
  try {
    const flowsRef = collection(db, 'scheduledFlows');
    const docRef = await addDoc(flowsRef, {
      ...flowData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating scheduled flow:', error);
    return { success: false, error: error.message };
  }
};

