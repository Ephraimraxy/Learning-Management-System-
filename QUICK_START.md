# Quick Start Guide - LMS with OTP Email Verification

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gmail account with App Password configured

## Initial Setup (First Time Only)

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

   Or use the convenience script:
   ```bash
   npm run install:all
   ```

3. **Configure Environment**
   - Frontend `.env` file is already created with `VITE_API_URL=http://localhost:3001`
   - Backend `.env` file is already configured with Gmail credentials

## Running the Application

### Option 1: Run Separately (Recommended for Development)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

### Option 2: Run Both Together

```bash
npm run start:all
```

This will start both backend and frontend concurrently.

## Verify Everything is Working

1. **Backend Health Check**
   - Open: http://localhost:3001/api/health
   - Should see: `{"status":"ok","service":"LMS Email Service",...}`

2. **Frontend**
   - Open: http://localhost:3000
   - Should see the LMS home page

3. **Test OTP Flow**
   - Go to Sign Up page
   - Create a new account
   - Check your email for OTP code (or check console in dev mode)
   - Enter OTP on verification page
   - Should auto-login and redirect to dashboard

## Development Mode

In development mode (when backend is not running), the system will:
- Show OTP code in browser console
- Display OTP in a toast notification
- Allow full testing of verification flow

## Production Deployment

### Backend
1. Deploy backend to a server (Heroku, Railway, Render, etc.)
2. Update `VITE_API_URL` in frontend `.env` to production backend URL
3. Set environment variables on hosting platform

### Frontend
1. Build: `npm run build`
2. Deploy `dist` folder to hosting (Firebase Hosting, Netlify, Vercel, etc.)
3. Ensure `VITE_API_URL` points to production backend

## Troubleshooting

### Backend Won't Start
- Check if port 3001 is available
- Verify Node.js version (v16+)
- Check `backend/.env` file exists

### Frontend Can't Connect to Backend
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in `.env` matches backend URL
- Restart frontend after changing `.env`

### Emails Not Sending
- Verify Gmail App Password in `backend/.env`
- Check Gmail account has 2-Step Verification enabled
- Check backend console for error messages
- In dev mode, OTP will still be shown in console/toast

### OTP Not Received
- Check spam folder
- Verify backend is running
- Check backend logs for errors
- In dev mode, check browser console for OTP

## File Structure

```
lms-react-firebase/
├── backend/              # Backend email service
│   ├── server.js        # Express server
│   ├── package.json     # Backend dependencies
│   └── .env            # Backend config (Gmail credentials)
├── src/                # Frontend React app
├── .env                # Frontend config (API URL)
└── package.json        # Frontend dependencies
```

## Next Steps

1. ✅ Backend API created
2. ✅ Environment variables configured
3. ✅ Both services can run together
4. ⚠️ For production: Deploy backend and update `VITE_API_URL`

## Support

- Backend setup: See `backend/README.md`
- OTP verification: See `OTP_VERIFICATION_GUIDE.md`
- Email setup: See `backend-email-setup.md`

