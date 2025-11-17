const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure nodemailer with Gmail
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser || !gmailAppPassword) {
  console.error('❌ Gmail credentials not configured! Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailAppPassword.replace(/\s+/g, '') // Remove any spaces from app password
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// OTP Email Sending Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email, otpCode } = req.body;
  
  if (!email || !otpCode) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and OTP code are required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format' 
    });
  }
  
  // Validate OTP format (6 digits)
  if (!/^\d{6}$/.test(otpCode)) {
    return res.status(400).json({ 
      success: false, 
      error: 'OTP code must be 6 digits' 
    });
  }
  
  const mailOptions = {
    from: `"LMS" <${gmailUser}>`,
    to: email,
    subject: 'LMS - Email Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LMS Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LMS Email Verification</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #f9fafb;">
                    <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">Hello,</p>
                    <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0; line-height: 1.6;">
                      Thank you for signing up for LMS! Please use the following verification code to complete your registration:
                    </p>
                    <!-- OTP Code Box -->
                    <div style="background: #ffffff; border: 3px solid #16a34a; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                      <div style="font-size: 48px; font-weight: bold; color: #16a34a; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 0;">
                        ${otpCode}
                      </div>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0; line-height: 1.6;">
                      This code will expire in <strong style="color: #16a34a;">15 minutes</strong>.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0; line-height: 1.6;">
                      If you didn't request this code, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #ffffff; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                      © 2025 LMS - Learning Management System. All rights reserved.
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; margin: 10px 0 0 0;">
                      This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `LMS Email Verification\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n© 2025 LMS - Learning Management System`
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email} - Message ID: ${info.messageId}`);
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'LMS Email Service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'LMS Email Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sendOTP: '/api/send-otp (POST)'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 LMS Email Service running on port ${PORT}`);
  console.log(`📧 Email configured for: ${gmailUser}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📬 Send OTP endpoint: http://localhost:${PORT}/api/send-otp`);
});

