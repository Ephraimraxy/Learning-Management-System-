# Quick Fix: Email Sending

## Issue
If you see OTP codes in the console instead of receiving emails, the backend email service is not running.

## Solution

### Step 1: Start the Backend Email Service

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:
```
🚀 LMS Email Service running on port 3001
📧 Email configured for: hoseaephraim50@gmail.com
✅ Email server is ready to send messages
```

### Step 2: Verify Frontend Configuration

Make sure your `.env` file in the root directory has:

```env
VITE_API_URL=http://localhost:3001
VITE_USE_EMAIL_BACKEND=true
```

### Step 3: Restart Frontend

After starting the backend, restart your frontend:

```bash
npm run dev
```

## What Changed

✅ **Error Messages**: Now show user-friendly messages instead of Firebase errors
✅ **Email Service**: Handles backend connection failures gracefully
✅ **Console Logs**: Reduced noise - only shows info messages in dev mode

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Try signing up - you should receive an email with the OTP code
4. Check your email inbox (and spam folder)

## Troubleshooting

### Backend won't start
- Check that `backend/.env` exists with Gmail credentials
- Verify port 3001 is not in use
- Check backend console for error messages

### Still seeing console logs
- This is normal in development mode
- OTP is always stored in Firestore for verification
- Console logs help developers but don't affect functionality

### Emails not received
- Check spam/junk folder
- Verify Gmail App Password is correct in `backend/.env`
- Check backend console for email sending errors
- Ensure 2-Step Verification is enabled on Gmail account

---

**Note**: The OTP is always stored in Firestore, so verification works even if email sending fails. The backend email service is optional but recommended for production.

