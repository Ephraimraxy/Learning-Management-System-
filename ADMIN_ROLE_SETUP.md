# Admin Role Setup Guide

## Overview

The LMS now uses a simplified authentication system where **all users sign up and login the same way**. Admin privileges are determined by the `role` field in Firestore, not by a separate login interface.

## How It Works

1. **All users sign up/login normally** using the standard login/signup forms
2. **Role is determined by Firestore** - Check the `role` field in the `users` collection
3. **Automatic routing** - Users with `role: 'admin'` or `role: 'instructor'` are automatically redirected to `/admin/dashboard`
4. **Regular users** with `role: 'student'` go to `/student/dashboard`

## Making a User an Admin

### Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Open the `users` collection
5. Find the user document you want to make admin
6. Edit the document and change the `role` field:
   - From: `"student"`
   - To: `"admin"` or `"instructor"`
7. Save the changes

### Method 2: Using Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set admin role for a user
firebase firestore:set users/USER_ID role admin
```

### Method 3: Programmatically (for developers)

You can use the Firebase Admin SDK or client SDK to update the role:

```javascript
import { doc, setDoc } from 'firebase/firestore';
import { db } from './config/firebase';

// Update user role to admin
await setDoc(doc(db, 'users', userId), {
  role: 'admin'
}, { merge: true });
```

## Role Types

- **`student`** - Default role for all new signups
- **`admin`** - Full administrative access to admin dashboard
- **`instructor`** - Same access as admin (redirects to admin dashboard)

## What Was Removed

- ❌ Admin login interface (`/login?admin=true`)
- ❌ Admin login card on home page
- ❌ `/admin-setup` route
- ❌ Pre-filled admin credentials
- ❌ Separate admin login flow

## What Still Works

- ✅ Standard login/signup for all users
- ✅ Email verification (required for students)
- ✅ Role-based dashboard routing
- ✅ Admin dashboard (`/admin/dashboard`) - accessible if `role: 'admin'` or `role: 'instructor'`
- ✅ Student dashboard (`/student/dashboard`) - for regular users
- ✅ All existing admin features and permissions

## Security Notes

- ⚠️ **Important**: Only change user roles in Firestore if you trust the user
- ⚠️ Admin users can bypass email verification (by design)
- ⚠️ Make sure to secure your Firestore rules to prevent unauthorized role changes
- ✅ Consider adding role change logging for audit purposes

## Testing

1. **Create a regular user account** via signup
2. **Login** - should redirect to `/student/dashboard`
3. **Go to Firestore** and change the user's `role` to `"admin"`
4. **Logout and login again** - should now redirect to `/admin/dashboard`

## Firestore Rules Example

To prevent unauthorized role changes, add this to your Firestore rules:

```javascript
match /users/{userId} {
  // Users can read their own data
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Only admins can update roles
  allow update: if request.auth != null && 
    (request.auth.uid == userId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  
  // Only admins can create users with admin role
  allow create: if request.auth != null && 
    (!('role' in request.resource.data) || 
     request.resource.data.role == 'student' ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}
```

---

**Status**: ✅ Admin login interface removed. Role-based access control now managed via Firestore.

