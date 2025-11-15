# Backend Email Setup Guide

## Overview
To send OTP codes via email, you need to set up a backend API endpoint. This guide shows you how to create a Node.js/Express server to send emails using the Gmail App Password.

## Gmail App Password Configuration

**Email:** hoseaephraim50@gmail.com  
**App Password:** ukgn evfd ewwc jwwq  
**App Name:** LMS

## Option 1: Node.js/Express Backend

### 1. Install Dependencies

```bash
npm init -y
npm install express nodemailer cors dotenv
```

### 2. Create Server File (`server.js`)

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hoseaephraim50@gmail.com',
    pass: 'ukgn evfd ewwc jwwq' // Gmail App Password
  }
});

// OTP Email Sending Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email, otpCode } = req.body;
  
  if (!email || !otpCode) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
  }
  
  const mailOptions = {
    from: 'hoseaephraim50@gmail.com',
    to: email,
    subject: 'LMS - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">LMS Email Verification</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello,</p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Thank you for signing up! Please use the following code to verify your email address:
          </p>
          <div style="background: #ffffff; border: 3px solid #16a34a; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #16a34a; letter-spacing: 12px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </div>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            This code will expire in <strong>15 minutes</strong>.
          </p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            If you didn't request this code, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            © 2025 LMS - Learning Management System
          </p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LMS Email Service' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});
```

### 3. Create `.env` file (optional)

```env
PORT=3001
```

### 4. Update Frontend Environment Variable

Create `.env` file in `lms-react-firebase`:

```env
VITE_API_URL=http://localhost:3001
```

Or for production:
```env
VITE_API_URL=https://your-backend-domain.com
```

### 5. Run the Server

```bash
node server.js
```

## Option 2: Firebase Cloud Functions

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### 2. Create Function (`functions/index.js`)

```javascript
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hoseaephraim50@gmail.com',
    pass: 'ukgn evfd ewwc jwwq'
  }
});

exports.sendOTP = functions.https.onCall(async (data, context) => {
  const { email, otpCode } = data;
  
  const mailOptions = {
    from: 'hoseaephraim50@gmail.com',
    to: email,
    subject: 'LMS - Email Verification Code',
    html: `Your verification code is: <strong>${otpCode}</strong>`
  };
  
  await transporter.sendMail(mailOptions);
  return { success: true };
});
```

### 3. Deploy

```bash
firebase deploy --only functions
```

## Testing

1. Start your backend server
2. Sign up with a new email
3. Check your email inbox for the OTP code
4. Enter the code in the verification page

## Security Notes

1. **Never commit app passwords to version control**
2. **Use environment variables for sensitive data**
3. **Implement rate limiting** to prevent abuse
4. **Use HTTPS** in production
5. **Consider using a dedicated email service** (SendGrid, Mailgun, etc.) for production

## Current Status

- ✅ OTP generation and storage in Firestore
- ✅ OTP verification logic
- ✅ Email verification page UI
- ⚠️ **Backend API required** for actual email sending
- ✅ Development mode shows OTP in console/toast

## Next Steps

1. Set up backend API using one of the options above
2. Update `VITE_API_URL` environment variable
3. Test email sending
4. Deploy backend to production

