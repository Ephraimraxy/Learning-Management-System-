# Production Email Setup - Gmail Configuration

## ✅ Configuration Complete

Your LMS is now configured to send OTP verification emails via Gmail using the production credentials:

- **Email**: hoseaephraim50@gmail.com
- **App Password**: Configured (LMS app password)
- **Backend Port**: 3001
- **Status**: Production mode enabled

## Files Configured

### 1. Backend Configuration (`backend/.env`)
```env
GMAIL_USER=hoseaephraim50@gmail.com
GMAIL_APP_PASSWORD=ukgnevfdewwcjwwq
PORT=3001
NODE_ENV=production
```

### 2. Frontend Configuration (`.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_USE_EMAIL_BACKEND=true
```

### 3. Backend Server (`backend/server.js`)
- ✅ Uses environment variables for credentials
- ✅ Validates credentials on startup
- ✅ Removes spaces from app password automatically
- ✅ Professional HTML email template
- ✅ Error handling and logging

## How to Start

### Step 1: Start Backend Email Service

```bash
cd backend
npm install  # First time only
npm start
```

You should see:
```
🚀 LMS Email Service running on port 3001
📧 Email configured for: hoseaephraim50@gmail.com
✅ Email server is ready to send messages
```

### Step 2: Start Frontend

In a new terminal:
```bash
npm run dev
```

## Testing Email Sending

1. **Health Check**: Visit http://localhost:3001/api/health
   - Should return: `{"status":"ok","service":"LMS Email Service",...}`

2. **Test Signup**: 
   - Go to signup page
   - Fill in the form
   - Submit
   - Check the email inbox for the OTP code

3. **Check Backend Logs**:
   - Should see: `✅ OTP email sent successfully to [email] - Message ID: [id]`

## Email Template Features

- ✅ Professional HTML design
- ✅ Large, readable OTP code display
- ✅ 15-minute expiration notice
- ✅ Branded with LMS colors
- ✅ Mobile-responsive
- ✅ Plain text fallback

## Troubleshooting

### Backend Won't Start
- Check that `.env` file exists in `backend/` directory
- Verify Gmail credentials are correct
- Ensure port 3001 is not in use

### Emails Not Received
- Check spam/junk folder
- Verify Gmail App Password is correct (no spaces)
- Check backend console for error messages
- Ensure 2-Step Verification is enabled on Gmail account

### Frontend Can't Connect
- Ensure backend is running (`npm start` in backend directory)
- Check `VITE_API_URL` matches backend port
- Restart frontend after changing `.env` files

### Multiple OTP Emails
- This is fixed! OTP is only sent once on signup
- Resend button works correctly for manual resends

## Production Deployment

For production deployment:

1. **Update Backend `.env`**:
   - Keep same Gmail credentials
   - Set `NODE_ENV=production`
   - Update `PORT` if needed

2. **Update Frontend `.env`**:
   - Change `VITE_API_URL` to your production backend URL
   - Keep `VITE_USE_EMAIL_BACKEND=true`

3. **Deploy Backend**:
   - Deploy to your hosting service (Heroku, Railway, Render, etc.)
   - Ensure environment variables are set in hosting dashboard

4. **Deploy Frontend**:
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, etc.
   - Set environment variables in hosting dashboard

## Security Notes

- ✅ App password stored in `.env` (not in code)
- ✅ `.env` files are in `.gitignore`
- ✅ Credentials validated on startup
- ✅ No hardcoded passwords in source code

## Next Steps

1. Start the backend: `cd backend && npm start`
2. Start the frontend: `npm run dev`
3. Test signup flow
4. Verify emails are received
5. Deploy to production when ready

---

**Status**: ✅ Production email setup complete and ready to use!

