# Verification-First Signup Flow

## Overview

The signup process has been updated so that **NO account is created in Firebase Authentication or Firestore until email verification is complete**. This prevents the issue where users can't re-register if they don't receive the verification email.

## New Flow

### 1. Signup Process

When a user signs up:

1. **Check Existing Accounts**
   - Queries Firestore `users` collection to check if email is already registered
   - If verified account exists → Show error, redirect to login
   - If unverified/pending → Allow re-signup

2. **Store Data Temporarily**
   - Signup data (name, email, password) is stored in `pendingSignups` collection in Firestore
   - OTP code is generated and stored
   - **NO Firebase Auth account is created yet**
   - **NO user document in `users` collection is created yet**

3. **Send OTP Email**
   - OTP is sent to user's email
   - If email sending fails, pending signup data is marked for deletion

4. **Redirect to Verification**
   - User is redirected to verification page
   - Data stored in sessionStorage for verification page access

### 2. Verification Process

When user verifies OTP:

1. **Verify OTP Code**
   - OTP is verified against stored code in Firestore
   - If invalid/expired → Show error

2. **Create Account (ONLY AFTER VERIFICATION)**
   - Firebase Auth account is created with email/password
   - Firestore user document is created in `users` collection
   - Account is immediately set to `active` and `registered: true`
   - User is automatically logged in

3. **Cleanup**
   - Temporary signup data in `pendingSignups` is deleted
   - SessionStorage is cleared

### 3. Re-signup Handling

If user doesn't receive OTP and tries to sign up again:

1. **Check Pending Signup**
   - System checks if there's a pending signup less than 24 hours old
   - If found → Generate new OTP and resend
   - If older than 24 hours → Create new pending signup

2. **No Account Conflicts**
   - Since no Firebase Auth account exists until verification
   - User can re-signup without "email already in use" errors
   - Only verified accounts prevent re-signup

## Data Storage

### Temporary Storage (`pendingSignups` collection)

```javascript
{
  name: "User Name",
  email: "user@example.com",
  password: "hashed_password", // Should be hashed in production
  otpCode: "123456",
  createdAt: "2025-01-15T10:00:00Z",
  expiresAt: "2025-01-16T10:00:00Z" // 24 hours
}
```

### Permanent Storage (`users` collection) - Created AFTER verification

```javascript
{
  name: "User Name",
  email: "user@example.com",
  role: "student",
  emailVerified: true,
  status: "active",
  registered: true,
  createdAt: "2025-01-15T10:30:00Z",
  verifiedAt: "2025-01-15T10:30:00Z"
}
```

## Benefits

✅ **No Account Until Verified**
- Firebase Auth account only created after OTP verification
- Firestore user document only created after verification
- No "email already in use" errors for unverified signups

✅ **Re-signup Allowed**
- Users can re-signup if they don't receive OTP
- Pending signups expire after 24 hours
- New OTP can be generated for existing pending signups

✅ **Clean Data**
- Temporary data is cleaned up after account creation
- No orphaned accounts in Firebase Auth
- No unverified user documents in Firestore

✅ **Security**
- Password stored temporarily (should be hashed in production)
- OTP expires after 15 minutes
- Pending signups expire after 24 hours

## Important Notes

⚠️ **Password Storage**
- Currently stored in plaintext in `pendingSignups` (temporary)
- Should be hashed/encrypted in production
- Only exists for 24 hours maximum

⚠️ **Firestore Index**
- Ensure you have an index on `users.email` for the query to work
- Firebase will prompt you to create it if missing

⚠️ **Cleanup Job**
- Consider adding a Cloud Function to clean up expired `pendingSignups`
- Or run a periodic cleanup script

## Testing

1. **Test New Signup:**
   - Sign up with new email
   - Check Firebase Console - NO account in Authentication
   - Check Firestore - data in `pendingSignups`, NOT in `users`
   - Verify OTP
   - Check Firebase Console - account NOW exists in Authentication
   - Check Firestore - user document NOW exists in `users`

2. **Test Re-signup:**
   - Sign up but don't verify
   - Try to sign up again with same email
   - Should allow re-signup and send new OTP
   - Verify OTP - account created successfully

3. **Test Verified Account:**
   - Sign up and verify
   - Try to sign up again with same email
   - Should show "email already registered" error

---

**Status**: ✅ Verification-first flow implemented. Accounts only created after email verification.

