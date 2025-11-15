# User Flow Documentation

## Overview
This document explains how user signup, verification, login, and dashboard routing works in the LMS application.

## 1. User Signup Flow

### Process:
1. **User fills signup form** (`/signup`)
   - Name, Email, Password (min 6 characters)
   
2. **Account Creation**:
   - Firebase Auth creates user account
   - Email verification email is sent automatically
   - Firestore user document is created with:
     - `name`: User's full name
     - `email`: User's email
     - `role`: 'student' (default)
     - `emailVerified`: false
     - `registered`: true
     - `createdAt`: Timestamp

3. **Email Verification Screen**:
   - User sees verification message
   - Can resend verification email
   - Must verify email before login

### Key Points:
- ✅ Email verification is **required** for students
- ✅ User document is created in Firestore immediately
- ✅ User cannot login until email is verified

---

## 2. Admin Login Flow

### Process:
1. **Admin accesses login** (`/login?admin=true`)
   - Credentials are pre-filled:
     - Email: `hoseaephraim50@gmail.com`
     - Password: `112233`

2. **Authentication**:
   - Firebase Auth authenticates
   - Firestore user document is checked
   - If document doesn't exist, it's created automatically with admin role

3. **Email Verification**:
   - ⚠️ **SKIPPED** for admin/instructor roles
   - Admin can login without email verification

4. **Dashboard Redirect**:
   - Admin → `/admin/dashboard`
   - Instructor → `/admin/dashboard`

### Key Points:
- ✅ Admin login **bypasses** email verification
- ✅ Admin document is auto-created if missing
- ✅ Admin role is preserved

---

## 3. Student Login Flow

### Process:
1. **Student accesses login** (`/login`)
   - Enters email and password

2. **Authentication Check**:
   - Firebase Auth authenticates
   - **Checks if user document exists in Firestore**
   - If document doesn't exist → Error: "Account not found. Please sign up first"
   - Redirects to `/signup` if not registered

3. **Email Verification Check**:
   - Checks if email is verified
   - If not verified → Error: "Please verify your email"
   - Resends verification email
   - User must verify before login

4. **Dashboard Redirect**:
   - Student → `/student/dashboard`

### Key Points:
- ✅ **Only registered users can login** (must have Firestore document)
- ✅ Email verification is **required** for students
- ✅ Unregistered users are redirected to signup

---

## 4. Dashboard Routing

### Automatic Redirects:

#### Unauthenticated Users:
- `/` → Shows landing page with login/signup options
- `/login` → Login page
- `/signup` → Signup page
- `/admin/dashboard` → Redirects to login
- `/student/dashboard` → Redirects to login

#### Authenticated Users:
- `/` → Redirects based on role:
  - Admin/Instructor → `/admin/dashboard`
  - Student → `/student/dashboard`
- `/login` → Redirects to appropriate dashboard
- `/signup` → Redirects to appropriate dashboard

### Role-Based Dashboards:

#### Admin Dashboard (`/admin/dashboard`):
- Course management
- Statistics and analytics
- User management
- Settings
- Certificate requests
- Coupons management
- Transactions

#### Student Dashboard (`/student/dashboard`):
- Enrolled courses
- Progress tracking
- Certificates
- Assignments
- Quizzes
- Recommended courses
- Upcoming live classes

---

## 5. User Registration Validation

### Checks Performed:

1. **Login Validation**:
   ```javascript
   - User exists in Firebase Auth ✅
   - User document exists in Firestore ✅ (NEW)
   - Email is verified (for students) ✅
   - Role is valid ✅
   ```

2. **Signup Validation**:
   ```javascript
   - Email is valid ✅
   - Password is at least 6 characters ✅
   - Email is not already in use ✅
   - User document is created ✅
   ```

---

## 6. Security Features

### Email Verification:
- ✅ Required for all student accounts
- ✅ Bypassed for admin/instructor accounts
- ✅ Verification email sent automatically on signup
- ✅ Can be resent from login page

### User Registration:
- ✅ Only users with Firestore documents can login
- ✅ Unregistered users are redirected to signup
- ✅ Admin accounts are auto-created if missing

### Role-Based Access:
- ✅ Admin/Instructor → Admin dashboard
- ✅ Student → Student dashboard
- ✅ Protected routes check authentication

---

## 7. Error Handling

### Common Errors:

1. **"Account not found"**:
   - User tried to login but doesn't have Firestore document
   - Solution: User must signup first

2. **"Please verify your email"**:
   - Student account not verified
   - Solution: Check email and click verification link

3. **"Email already in use"**:
   - Email already registered
   - Solution: Use login instead of signup

4. **"Wrong password"**:
   - Incorrect password
   - Solution: Reset password or try again

---

## 8. Testing the Flow

### Test Student Signup:
1. Go to `/signup`
2. Fill form and submit
3. Check email for verification link
4. Click verification link
5. Go to `/login`
6. Login with credentials
7. Should redirect to `/student/dashboard`

### Test Admin Login:
1. Go to `/login?admin=true`
2. Credentials are pre-filled
3. Click "Sign in"
4. Should redirect to `/admin/dashboard` immediately (no verification needed)

### Test Unregistered User:
1. Create account in Firebase Auth only (not via signup)
2. Try to login
3. Should see "Account not found" error
4. Should be redirected to `/signup`

---

## Summary

✅ **Signup**: Creates account + sends verification email + creates Firestore document
✅ **Login**: Checks registration + verifies email (students only) + redirects to dashboard
✅ **Admin**: Bypasses verification + auto-creates document if missing
✅ **Routing**: Automatic redirects based on authentication and role
✅ **Security**: Only registered users can login, email verification required for students

