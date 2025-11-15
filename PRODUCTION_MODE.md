# Production Mode Configuration

## Changes Made

1. **Removed Dev Mode Console Logs**
   - OTP codes only shown in console during development
   - Production mode hides all debug information
   - Clean console output in production

2. **Backend Server**
   - Backend server should be running on port 3001
   - Email service configured for production use

## Running in Production Mode

### Set Environment Variable

**Windows PowerShell:**
```powershell
$env:NODE_ENV="production"
```

**Linux/Mac:**
```bash
export NODE_ENV=production
```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Start Backend (Required for Email)

The backend must be running for email functionality:

```bash
cd backend
npm start
```

Or set up as a service/daemon for production.

## Production Checklist

- [x] Removed dev mode console logs
- [x] Backend server configured
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Deploy backend to production server
- [ ] Update VITE_API_URL to production backend URL
- [ ] Configure production email service
- [ ] Test email sending in production
- [ ] Set up monitoring/logging
- [ ] Configure HTTPS
- [ ] Set up domain and DNS

## Environment Variables for Production

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

### Backend (.env)
```env
GMAIL_USER=hoseaephraim50@gmail.com
GMAIL_APP_PASSWORD=ukgn evfd ewwc jwwq
PORT=3001
NODE_ENV=production
```

## Notes

- In production, OTP codes are NOT shown in console
- Backend API must be accessible for email sending
- All debug information is hidden in production builds
- Use proper error handling and logging in production

