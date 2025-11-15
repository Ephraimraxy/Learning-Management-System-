# 🚀 Services Started!

Both backend and frontend services should now be running.

## ✅ What's Running

1. **Backend Email Service**
   - Port: **3001**
   - Health Check: http://localhost:3001/api/health
   - Status: ✅ Running

2. **Frontend React App**
   - Port: **3000**
   - URL: http://localhost:3000
   - Status: ✅ Running

## 🧪 Test the OTP Flow

1. **Open Frontend:**
   - Go to: http://localhost:3000

2. **Sign Up:**
   - Click "New Student" or go to Sign Up
   - Fill in name, email, and password
   - Submit the form

3. **Check for OTP:**
   - **If backend is running:** Check your email inbox
   - **If backend is not running:** Check browser console or toast notification (dev mode)

4. **Verify Email:**
   - You'll be redirected to `/verify-email`
   - Enter the 6-digit OTP code
   - Click "Verify Email"

5. **Auto-Login:**
   - After verification, you'll be automatically logged in
   - Redirected to student dashboard

## 📧 Email Configuration

The backend is configured to send emails from:
- **Email:** hoseaephraim50@gmail.com
- **App Password:** ukgn evfd ewwc jwwq

## 🔍 Verify Services

### Check Backend:
```bash
# Open in browser or use curl
http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "service": "LMS Email Service",
  "timestamp": "..."
}
```

### Check Frontend:
- Open: http://localhost:3000
- Should see LMS home page

## 🛑 Stop Services

Press `Ctrl+C` in the terminal where services are running, or close the terminal window.

## 📝 Notes

- Backend runs on port **3001**
- Frontend runs on port **3000**
- Both services run concurrently
- OTP codes expire after 15 minutes
- In dev mode, OTPs are shown in console/toast if email fails

## 🆘 Troubleshooting

### Services Not Starting
- Check if ports 3000 and 3001 are available
- Verify `.env` files exist in both root and backend directories
- Check Node.js version (v16+)

### Backend Not Sending Emails
- Verify Gmail App Password is correct
- Check backend console for errors
- In dev mode, OTP will still be shown in console

### Frontend Can't Connect
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in `.env` file
- Restart frontend after changing `.env`

---

**Everything should be running now! Open http://localhost:3000 to test!** 🎉

