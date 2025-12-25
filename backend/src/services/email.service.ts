import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const mailOptions = {
    from: `"Message Scheduler" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify your email - Message Scheduler',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your password - Message Scheduler',
    html,
  });
};

export const sendScheduledMessage = async (
  to: string,
  subject: string,
  message: string
): Promise<void> => {
  await sendEmail({
    to,
    subject,
    html: `<div style="font-family: Arial, sans-serif;">${message}</div>`,
  });
};
