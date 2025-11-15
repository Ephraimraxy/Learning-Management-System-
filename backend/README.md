# LMS Email Service Backend

Backend API service for sending OTP verification emails via Gmail SMTP.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - The `.env` file is already configured with Gmail credentials
   - For production, update `.env` with your actual credentials

3. **Start Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Verify Server is Running**
   - Open: http://localhost:3001/api/health
   - Should return: `{ "status": "ok", "service": "LMS Email Service" }`

## API Endpoints

### POST /api/send-otp
Sends OTP verification code via email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "messageId": "..."
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "LMS Email Service",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

## Configuration

### Environment Variables

- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - Gmail App Password (not regular password)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Gmail App Password Setup

1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate App Password
4. Use the generated password in `.env`

## Testing

Test the email service:

```bash
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","otpCode":"123456"}'
```

## Production Deployment

1. Update `.env` with production credentials
2. Set `NODE_ENV=production`
3. Use process manager (PM2, systemd, etc.)
4. Configure reverse proxy (nginx, etc.)
5. Enable HTTPS

## Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct
- Check Gmail account has 2-Step Verification enabled
- Ensure "Less secure app access" is not required (App Password replaces this)
- Check firewall/network restrictions

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 3001

### CORS Errors
- CORS is enabled for all origins in development
- For production, configure CORS to allow only your frontend domain

