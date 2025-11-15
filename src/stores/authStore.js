import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { ensureAdminDocument } from '../utils/ensureAdminDocument';

export const useAuthStore = create((set) => ({
  user: null,
  userData: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),
  
  initializeAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Sync email verification status from Firebase Auth
            const updatedUserData = {
              ...userData,
              emailVerified: user.emailVerified,
            };
            
            // If email was just verified and account was pending, activate it
            if (user.emailVerified && userData.status === 'pendingVerification' && userData.role !== 'admin' && userData.role !== 'instructor') {
              updatedUserData.status = 'active';
              updatedUserData.registered = true;
              updatedUserData.verifiedAt = new Date().toISOString();
            }
            
            // Update Firestore if email verification status changed or account needs activation
            if (userData.emailVerified !== user.emailVerified || 
                (user.emailVerified && userData.status === 'pendingVerification' && userData.role !== 'admin' && userData.role !== 'instructor')) {
              try {
                await setDoc(doc(db, 'users', user.uid), updatedUserData, { merge: true });
              } catch (updateError) {
                console.warn('Failed to update email verification status:', updateError);
                // Continue anyway - this is not critical
              }
            }
            set({ userData: updatedUserData });
          } else {
            // User document doesn't exist - check if it's admin first
            let userData = null;
            
            // Check if this is the admin user
            if (user.email === 'hoseaephraim50@gmail.com') {
              userData = await ensureAdminDocument(user);
            }
            
            // If not admin or ensureAdminDocument failed, create a basic document
            if (!userData) {
              const defaultUserData = {
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'User',
                role: 'student', // Default role
                emailVerified: user.emailVerified,
                createdAt: new Date().toISOString(),
              };
              try {
                await setDoc(doc(db, 'users', user.uid), defaultUserData);
                userData = defaultUserData;
              } catch (createError) {
                console.warn('Failed to create user document:', createError);
                // Set minimal user data from auth
                userData = {
                  email: user.email,
                  name: user.displayName || user.email?.split('@')[0] || 'User',
                  emailVerified: user.emailVerified,
                };
              }
            }
            
            set({ userData });
          }
        } catch (error) {
          console.error('Failed to fetch user data from Firestore:', error);
          // Set minimal user data from auth to prevent app crash
          set({ 
            userData: {
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              emailVerified: user.emailVerified,
            }
          });
        }
      } else {
        set({ user: null, userData: null });
      }
      set({ loading: false });
    });
  },
  
  logout: async () => {
    await auth.signOut();
    set({ user: null, userData: null });
  },
}));

