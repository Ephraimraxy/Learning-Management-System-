# Email Verification Flow

## Overview
This document explains the email verification flow that ensures users are not fully registered until their email is verified.

## Account Status Flow

### 1. Signup Process

When a user signs up:

1. **Firebase Auth Account Created**
   - Account is created in Firebase Authentication (required to send verification email)
   - User is immediately signed out

2. **Firestore Document Created (PENDING)**
   - A user document is created with status: `pendingVerification`
   - `registered: false` - Account is NOT fully registered yet
   - `emailVerified: false` - Email not verified yet
   - User cannot login until email is verified

3. **Email Verification Sent**
   - Verification email is sent automatically
   - User sees verification screen

### 2. Email Verification

When user clicks verification link in email:

1. **Firebase Auth Status Updated**
   - Firebase Auth marks email as verified
   - User can now login

2. **Account Activation (On First Login)**
   - When user logs in after verification:
     - Status changes from `pendingVerification` → `active`
     - `registered` changes from `false` → `true`
     - `emailVerified` changes from `false` → `true`
     - `verifiedAt` timestamp is added

### 3. Login Process

**Before Email Verification:**
- User tries to login
- System checks if email is verified
- If NOT verified → Login blocked
- User is signed out immediately
- Verification email is resent

**After Email Verification:**
- User logs in successfully
- Account is activated (status → active, registered → true)
- User is redirected to their dashboard

## Account Statuses

### `pendingVerification`
- Account created but email not verified
- User cannot login
- Account is not fully registered
- Firestore document exists but account is inactive

### `active`
- Email verified
- Account fully activated
- User can login and access platform
- `registered: true`

## Security Features

1. **Immediate Sign Out**
   - User is signed out immediately after signup
   - Prevents access before verification

2. **Login Blocking**
   - Unverified users cannot login
   - System checks `emailVerified` status
   - Admin/instructor bypass verification

3. **Account Activation**
   - Account only activated after email verification
   - Status tracked in Firestore
   - Automatic activation on first verified login

## Firestore Document Structure

### Before Verification:
```javascript
{
  name: "User Name",
  email: "user@example.com",
  role: "student",
  emailVerified: false,
  status: "pendingVerification",
  registered: false,
  createdAt: "2025-01-15T10:00:00Z"
}
```

### After Verification:
```javascript
{
  name: "User Name",
  email: "user@example.com",
  role: "student",
  emailVerified: true,
  status: "active",
  registered: true,
  createdAt: "2025-01-15T10:00:00Z",
  verifiedAt: "2025-01-15T10:30:00Z"
}
```

## Important Notes

1. **Firebase Auth Requirement**
   - Firebase requires account creation before sending verification email
   - Account exists in Firebase Auth but is immediately signed out
   - Firestore document is marked as pending

2. **Account Activation**
   - Happens automatically on first login after verification
   - No manual intervention needed
   - Status is updated in both Firebase Auth and Firestore

3. **Admin Bypass**
   - Admin/instructor accounts bypass email verification
   - They are created with `status: 'active'` immediately
   - No pending verification period

## Testing the Flow

1. **Test Signup:**
   - Sign up with new email
   - Check that you're signed out immediately
   - Verify email verification screen appears
   - Check Firestore - document should have `status: 'pendingVerification'`

2. **Test Unverified Login:**
   - Try to login before verifying email
   - Should be blocked with error message
   - Verification email should be resent

3. **Test Verified Login:**
   - Verify email via link
   - Login with credentials
   - Check Firestore - document should have `status: 'active'` and `registered: true`

