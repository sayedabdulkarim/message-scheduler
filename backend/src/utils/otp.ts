import crypto from 'crypto';

export const generateOtp = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
};

export const getOtpExpiry = (minutes: number = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
