/**
 * Generate a 6-digit numeric OTP
 * @returns {string} 6-digit OTP code
 */
function generateOTP() {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Generate expiry time for OTP (5 minutes from now)
 * @returns {Date} Expiry date
 */
function getOTPExpiryTime() {
  const now = new Date();
  return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
}

module.exports = {
  generateOTP,
  getOTPExpiryTime
};