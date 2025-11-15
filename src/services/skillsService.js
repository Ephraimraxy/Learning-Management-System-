import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Skills Management
export const getAllSkills = async () => {
  try {
    const skillsRef = collection(db, 'skills');
    const snapshot = await getDocs(skillsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

export const createSkill = async (skillData) => {
  try {
    const skillsRef = collection(db, 'skills');
    const docRef = await addDoc(skillsRef, {
      ...skillData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating skill:', error);
    return { success: false, error: error.message };
  }
};

// User Skills
export const getUserSkills = async (userId) => {
  try {
    const userSkillsRef = collection(db, 'userSkills');
    const q = query(userSkillsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return [];
  }
};

export const addUserSkill = async (userId, skillId, proficiency = 'beginner') => {
  try {
    const userSkillsRef = collection(db, 'userSkills');
    await addDoc(userSkillsRef, {
      userId,
      skillId,
      proficiency,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding user skill:', error);
    return { success: false, error: error.message };
  }
};

export const removeUserSkill = async (userSkillId) => {
  try {
    const userSkillRef = doc(db, 'userSkills', userSkillId);
    await deleteDoc(userSkillRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing user skill:', error);
    return { success: false, error: error.message };
  }
};

// Preferred Functions
export const getUserPreferredFunctions = async (userId) => {
  try {
    const prefFunctionsRef = collection(db, 'preferredFunctions');
    const q = query(prefFunctionsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching preferred functions:', error);
    return [];
  }
};

export const addPreferredFunction = async (userId, functionId) => {
  try {
    const prefFunctionsRef = collection(db, 'preferredFunctions');
    await addDoc(prefFunctionsRef, {
      userId,
      functionId,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding preferred function:', error);
    return { success: false, error: error.message };
  }
};

// Preferred Industries
export const getUserPreferredIndustries = async (userId) => {
  try {
    const prefIndustriesRef = collection(db, 'preferredIndustries');
    const q = query(prefIndustriesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching preferred industries:', error);
    return [];
  }
};

export const addPreferredIndustry = async (userId, industryId) => {
  try {
    const prefIndustriesRef = collection(db, 'preferredIndustries');
    await addDoc(prefIndustriesRef, {
      userId,
      industryId,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding preferred industry:', error);
    return { success: false, error: error.message };
  }
};

