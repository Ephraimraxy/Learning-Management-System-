# How to Start the Backend Email Service

## Quick Start

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies** (first time only)
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Verify it's running**
   - Open browser: http://localhost:3001/api/health
   - Should see: `{"status":"ok","service":"LMS Email Service",...}`

## What This Does

The backend server:
- ✅ Listens on port 3001
- ✅ Sends OTP emails via Gmail SMTP
- ✅ Provides `/api/send-otp` endpoint
- ✅ Handles CORS for frontend requests

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Option 2: Use a Process Manager

Install `concurrently`:
```bash
npm install -g concurrently
```

Then from project root:
```bash
concurrently "cd backend && npm start" "npm run dev"
```

## Troubleshooting

### Port 3001 Already in Use
- Change `PORT` in `backend/.env`
- Update `VITE_API_URL` in `.env` to match

### Email Not Sending
- Check Gmail App Password is correct in `backend/.env` (should be without spaces: `ukgnevfdewwcjwwq`)
- Verify Gmail account has 2-Step Verification enabled
- Check backend console for error messages
- Ensure `VITE_USE_EMAIL_BACKEND=true` in frontend `.env`

### Frontend Can't Connect
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in `.env` matches backend URL
- Restart frontend after changing `.env`

