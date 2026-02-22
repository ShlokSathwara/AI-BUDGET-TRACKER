const nodemailer = require('nodemailer');
const config = require('../config');

// Mock email service for development
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const emailTemplates = {
  verification: (name, verificationLink) => ({
    subject: 'Verify Your Smart Budget Tracker Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Smart Budget Tracker</h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Secure Your Financial Future</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for signing up with Smart Budget Tracker. To secure your account and start managing your finances, 
            please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 Smart Budget Tracker. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
  
  welcome: (name) => ({
    subject: 'Welcome to Smart Budget Tracker!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome Aboard!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Your email has been successfully verified! You're now ready to start tracking your expenses and managing your budget with Smart Budget Tracker.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Getting Started:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Add your bank accounts</li>
              <li>Start logging your expenses</li>
              <li>Set savings goals with AI assistance</li>
              <li>Get insights on your spending patterns</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            If you have any questions or need help, our support team is here to assist you.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 Smart Budget Tracker. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
  
  passwordReset: (name, resetLink) => ({
    subject: 'Reset Your Smart Budget Tracker Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 Smart Budget Tracker. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};

// Generate verification token
const generateVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Mock email sending for development
const sendMockEmail = async (to, templateName, data = {}) => {
  console.log('=== MOCK EMAIL SENT ===');
  console.log('To:', to);
  console.log('Template:', templateName);
  console.log('Data:', data);
  
  // For verification emails, log the verification link
  if (templateName === 'verification' && data.link) {
    console.log('VERIFICATION LINK:', data.link);
    console.log('Click this link to verify your email during development');
  }
  
  console.log('=====================');
  
  // Simulate successful email sending
  return { success: true, messageId: 'mock-message-id' };
};

// Send email
const sendEmail = async (to, templateName, data = {}) => {
  try {
    // Use mock email service in development
    if (isDevelopment) {
      return await sendMockEmail(to, templateName, data);
    }
    
    const template = emailTemplates[templateName](data.name, data.link);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smartbudgettracker.com',
      to,
      subject: template.subject,
      html: template.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  generateVerificationToken,
  emailTemplates
};