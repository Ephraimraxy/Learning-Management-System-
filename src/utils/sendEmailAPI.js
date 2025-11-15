// Email sending utility
// This file provides instructions for setting up email sending via backend API

// For production, you need to create a backend API endpoint that uses nodemailer
// Example Node.js/Express endpoint:

/*
// Backend API endpoint (Node.js/Express example)
// File: server/routes/email.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hoseaephraim50@gmail.com',
    pass: 'ukgn evfd ewwc jwwq' // Gmail App Password
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email, otpCode } = req.body;
  
  const mailOptions = {
    from: 'hoseaephraim50@gmail.com',
    to: email,
    subject: 'LMS - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">LMS Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #16a34a; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
*/

// Client-side function to call the API
export const sendOTPViaAPI = async (email, otpCode) => {
  try {
    // Replace with your actual backend API URL
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${API_URL}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otpCode }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send OTP via API:', error);
    return { success: false, error: error.message };
  }
};

