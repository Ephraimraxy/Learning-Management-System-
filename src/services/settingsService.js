import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SETTINGS_DOC_ID = 'lms_settings';

// Get LMS settings
export const getLMSSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return { success: true, data: settingsSnap.data() };
    } else {
      // Return default settings
      return {
        success: true,
        data: {
          siteName: 'LMS',
          siteDescription: 'Learning Management System',
          enableSignups: true,
          enableEmailVerification: true,
          enablePayments: false,
          currency: 'USD',
          enableCertificates: true,
          enableBadges: true,
          enableDiscussions: true,
          enableAnnouncements: true,
          enableLiveClasses: true,
          enableQuizzes: true,
          enableAssignments: true,
          enablePrograms: true,
          enableEvaluations: true,
          enableSkills: true,
          enableCoupons: false,
          defaultRole: 'student',
          maxFileUploadSize: 10, // MB
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
          emailNotifications: true,
          pushNotifications: false,
          maintenanceMode: false,
          maintenanceMessage: 'The system is under maintenance. Please check back later.',
        },
      };
    }
  } catch (error) {
    console.error('Error fetching LMS settings:', error);
    return { success: false, error: error.message };
  }
};

// Update LMS settings
export const updateLMSSettings = async (settings) => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating LMS settings:', error);
    return { success: false, error: error.message };
  }
};

// Zoom Settings
export const getZoomSettings = async () => {
  try {
    const zoomSettingsRef = doc(db, 'zoomSettings', 'default');
    const zoomSettingsSnap = await getDoc(zoomSettingsRef);
    
    if (zoomSettingsSnap.exists()) {
      return { success: true, data: zoomSettingsSnap.data() };
    } else {
      return {
        success: true,
        data: {
          apiKey: '',
          apiSecret: '',
          enabled: false,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching Zoom settings:', error);
    return { success: false, error: error.message };
  }
};

export const updateZoomSettings = async (settings) => {
  try {
    const zoomSettingsRef = doc(db, 'zoomSettings', 'default');
    await setDoc(zoomSettingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating Zoom settings:', error);
    return { success: false, error: error.message };
  }
};
