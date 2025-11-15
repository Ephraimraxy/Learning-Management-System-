# Admin Setup & Email Verification Guide

## ✅ What's Been Fixed

1. **React Hooks Error Fixed** - Moved `useAuthStore()` hook to top level in `Quizzes.jsx`
2. **React Router Warnings Fixed** - Added future flags to suppress deprecation warnings
3. **Email Verification Added** - Users must verify their email before logging in
4. **Default Admin Account** - Setup page to create admin account

## 🔐 Default Admin Account

**Email:** `hoseaephraimephraim50@gmail.com`  
**Password:** `112233`  
**Role:** `admin`

## 📝 How to Create Admin Account

### Option 1: Using the Admin Setup Page (Recommended)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: **http://localhost:3000/admin-setup**

3. Click "Create Admin Account" button

4. The admin account will be created with:
   - Email: `hoseaephraimephraim50@gmail.com`
   - Password: `112233`
   - Role: `admin`

5. **Important:** You'll receive a verification email. Click the link to verify your email before logging in.

6. After verification, login at: **http://localhost:3000/login**

### Option 2: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter:
   - Email: `hoseaephraimephraim50@gmail.com`
   - Password: `112233`
5. Go to Firestore Database
6. Create a document in `users` collection with:
   ```json
   {
     "name": "Admin",
     "email": "hoseaephraimephraim50@gmail.com",
     "role": "admin",
     "emailVerified": true,
     "createdAt": "2024-01-01T00:00:00.000Z",
     "isDefaultAdmin": true
   }
   ```
   - Use the UID from Authentication as the document ID

## ✉️ Email Verification

### For New Users (Signup)

1. User signs up with email and password
2. Verification email is automatically sent
3. User sees a confirmation screen with instructions
4. User must click the verification link in their email
5. After verification, user can login

### For Login

- Users with unverified emails cannot login
- They'll see an error message
- A new verification email will be automatically sent
- They must verify before accessing the app

### Email Verification Status

- Email verification status is synced between Firebase Auth and Firestore
- The `emailVerified` field in Firestore is automatically updated when user verifies their email

## 🔧 Firebase Configuration Required

Make sure you have:

1. **Email/Password Authentication Enabled**
   - Firebase Console > Authentication > Sign-in method
   - Enable "Email/Password"

2. **Email Templates Configured** (Optional but recommended)
   - Firebase Console > Authentication > Templates
   - Customize email verification template

3. **Firestore Database Created**
   - Firebase Console > Firestore Database
   - Create database in production mode (or test mode for development)

4. **Firestore Security Rules**
   - Make sure `firestore.rules` is deployed
   - Or configure rules in Firebase Console

## 🚀 Testing the Setup

1. **Test Admin Creation:**
   - Visit `/admin-setup`
   - Create admin account
   - Check Firebase Console to verify user was created

2. **Test Email Verification:**
   - Sign up with a new email
   - Check inbox for verification email
   - Try logging in before verification (should fail)
   - Verify email and try logging in again (should succeed)

3. **Test Admin Login:**
   - Login with admin credentials
   - Verify you have admin access (can see Statistics, create courses, etc.)

## 📋 User Roles

- **student** - Default role for new signups
- **instructor** - Can create courses, quizzes, assignments
- **admin** - Full access including statistics and settings

## 🔒 Security Notes

1. **Change Admin Password** - After first login, change the default password
2. **Email Verification** - Required for all users to prevent fake accounts
3. **Firestore Rules** - Make sure security rules are properly configured
4. **Admin Setup Page** - Consider removing or protecting `/admin-setup` route in production

## 🐛 Troubleshooting

### "Admin account already exists"
- The email is already registered in Firebase Auth
- Check Firestore to see if user document exists
- If missing, create it manually with `role: 'admin'`

### "Email verification not working"
- Check Firebase Console > Authentication > Templates
- Verify email service is enabled
- Check spam folder
- Make sure email domain is not blocked

### "Cannot login after verification"
- Clear browser cache
- Check that `emailVerified` is `true` in Firebase Auth
- Verify Firestore user document has correct role

## 📚 Related Files

- `src/pages/AdminSetup.jsx` - Admin creation page
- `src/utils/initAdmin.js` - Admin initialization function
- `src/pages/Signup.jsx` - User signup with email verification
- `src/pages/Login.jsx` - Login with email verification check
- `src/stores/authStore.js` - Auth state management with email verification sync

