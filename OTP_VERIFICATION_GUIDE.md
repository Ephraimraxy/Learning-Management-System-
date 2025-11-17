# OTP Email Verification Guide

## Overview
The LMS now uses OTP (One-Time Password) codes for email verification instead of email links. Users receive a 6-digit code via email that they must enter to verify their account.

## How It Works

### 1. User Signup Flow
1. User fills out signup form (name, email, password)
2. System creates Firebase Auth account
3. System generates a 6-digit OTP code
4. OTP is stored in Firestore with 15-minute expiration
5. OTP is sent to user's email (via backend API)
6. User is signed out and redirected to verification page
7. User enters OTP code
8. System verifies OTP and activates account
9. User is automatically logged in and redirected to dashboard

### 2. User Login Flow (Unverified Account)
1. User attempts to login
2. System checks if account is verified
3. If not verified, user is redirected to verification page
4. User can request a new OTP code
5. After verification, user can login normally

## Features

- ✅ **6-digit OTP codes** - Easy to enter, secure
- ✅ **15-minute expiration** - Codes expire after 15 minutes
- ✅ **One-time use** - Each code can only be used once
- ✅ **Resend functionality** - Users can request new codes
- ✅ **Auto-login** - After verification during signup, user is automatically logged in
- ✅ **Development mode** - OTP codes shown in console/toast for testing

## Setup Instructions

### Step 1: Backend API Setup

You need to set up a backend API to send emails. See `backend-email-setup.md` for detailed instructions.

**Quick Setup (Node.js/Express):**

1. Create a backend server with the email endpoint
2. Set environment variable `VITE_API_URL` to your backend URL
3. Set `VITE_USE_EMAIL_BACKEND=true` only when the backend email service is running (defaults to local fallback)
3. The backend should accept POST requests to `/api/send-otp` with `{ email, otpCode }`

### Step 2: Environment Variables

Create a `.env` file in `lms-react-firebase`:

```env
VITE_API_URL=http://localhost:3001
VITE_USE_EMAIL_BACKEND=true
```

For production:
```env
VITE_API_URL=https://your-backend-domain.com
VITE_USE_EMAIL_BACKEND=true
```

### Step 3: Gmail App Password

The system uses Gmail App Password for sending emails:
- **Email:** hoseaephraim50@gmail.com
- **App Password:** ukgn evfd ewwc jwwq
- **App Name:** LMS

⚠️ **Security Note:** Never commit app passwords to version control. Use environment variables in production.

## Development Mode

In development mode (when backend API is not available), the system will:
- Store OTP in Firestore for validation
- Display OTP code in browser console
- Show OTP code in a toast notification
- Allow verification to work normally

This allows you to test the verification flow without setting up the backend immediately.

## Testing

1. **Signup Test:**
   - Go to `/signup`
   - Fill out the form
   - Check console/toast for OTP code (dev mode)
   - Enter OTP on verification page
   - Should auto-login and redirect to dashboard

2. **Login Test (Unverified):**
   - Try to login with unverified account
   - Should redirect to verification page
   - Request new OTP
   - Enter code and verify
   - Should be able to login

3. **Resend OTP:**
   - On verification page, click "Resend"
   - New OTP should be generated and sent
   - Previous OTP becomes invalid

## Firestore Collections

### `emailOTPs` Collection
Stores temporary OTP codes:
```javascript
{
  email: "user@example.com",
  code: "123456",
  createdAt: "2025-01-15T10:00:00Z",
  expiresAt: "2025-01-15T10:15:00Z",
  verified: false
}
```

### `users` Collection
User documents are updated after verification:
```javascript
{
  emailVerified: true,
  status: "active",
  registered: true,
  verifiedAt: "2025-01-15T10:05:00Z"
}
```

## Security Considerations

1. **OTP Expiration:** Codes expire after 15 minutes
2. **One-time Use:** Codes are deleted after successful verification
3. **Rate Limiting:** Consider implementing rate limiting on backend API
4. **HTTPS:** Always use HTTPS in production
5. **Environment Variables:** Never hardcode credentials

## Troubleshooting

### OTP Not Received
- Check spam folder
- Verify backend API is running
- Check backend logs for errors
- Verify Gmail App Password is correct
- Check `VITE_API_URL` environment variable

### OTP Expired
- Request a new OTP code
- Codes expire after 15 minutes

### Invalid OTP
- Make sure you're entering the correct 6-digit code
- Check for typos
- Request a new code if needed

### Backend API Not Available
- In development, OTP will be shown in console
- Set up backend API for production
- See `backend-email-setup.md` for setup instructions

## Production Checklist

- [ ] Set up backend API endpoint
- [ ] Configure `VITE_API_URL` environment variable
- [ ] Test email sending
- [ ] Remove development mode OTP display
- [ ] Implement rate limiting
- [ ] Set up monitoring/logging
- [ ] Test verification flow end-to-end
- [ ] Verify HTTPS is enabled

## Files Modified

- `src/pages/Signup.jsx` - Updated to use OTP instead of email links
- `src/pages/EmailVerification.jsx` - New OTP verification page
- `src/pages/Login.jsx` - Updated to check OTP verification status
- `src/services/emailService.js` - New email service for OTP
- `src/App.jsx` - Added `/verify-email` route

## Next Steps

1. Set up backend API (see `backend-email-setup.md`)
2. Test the verification flow
3. Deploy backend to production
4. Update environment variables
5. Test in production environment

