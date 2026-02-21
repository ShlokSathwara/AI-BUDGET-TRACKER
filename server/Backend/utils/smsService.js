const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

let twilioClient = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not found. Using mock SMS service.');
}

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} otp - OTP code to send
 * @returns {Promise<boolean>} Success status
 */
async function sendOTP(phoneNumber, otp) {
  // Format phone number (add country code if not present)
  let formattedPhoneNumber = phoneNumber;
  if (!phoneNumber.startsWith('+')) {
    // Assuming Indian numbers, add +91 prefix
    formattedPhoneNumber = '+91' + phoneNumber.replace(/^0+/, '');
  }

  if (twilioClient && serviceSid) {
    try {
      const message = await twilioClient.messages.create({
        body: `Your OTP for AI Budget Tracker is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // Your Twilio number
        to: formattedPhoneNumber
      });
      
      console.log(`SMS sent successfully: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  } else {
    // Mock SMS service for development
    console.log(`MOCK SMS: Sending OTP ${otp} to ${formattedPhoneNumber}`);
    console.log('To enable real SMS, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SERVICE_SID in .env');
    return true;
  }
}

module.exports = {
  sendOTP
};