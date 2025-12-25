import { Request, Response } from 'express';
import { User, Otp, Platform } from '../models';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { generateOtp, getOtpExpiry } from '../utils/otp';
import { sendOtpEmail, sendPasswordResetEmail } from '../services/email.service';
import { AuthRequest } from '../middleware/auth.middleware';

// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Create user
    const user = new User({ email, password, name });
    await user.save();

    // Generate OTP
    const otp = generateOtp();
    await Otp.create({
      userId: user._id,
      email,
      type: 'email_verification',
      code: otp,
      expiresAt: getOtpExpiry(10),
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    // Create email platform (auto-verified after OTP)
    await Platform.create({
      userId: user._id,
      platform: 'email',
      isVerified: false,
      data: { email },
    });

    res.status(201).json({
      message: 'Signup successful. Please verify your email.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating account' });
  }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find OTP
    const otpDoc = await Otp.findOne({
      email,
      type: 'email_verification',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      res.status(400).json({ message: 'OTP expired or invalid' });
      return;
    }

    // Check attempts
    if (otpDoc.attempts >= 3) {
      res.status(400).json({ message: 'Too many attempts. Please request new OTP.' });
      return;
    }

    // Verify OTP
    if (otpDoc.code !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    // Update user and platform
    await User.findByIdAndUpdate(otpDoc.userId, { isEmailVerified: true });
    await Platform.findOneAndUpdate(
      { userId: otpDoc.userId, platform: 'email' },
      { isVerified: true }
    );

    // Delete OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    // Generate tokens
    const user = await User.findById(otpDoc.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Email verified successfully',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

// Resend OTP
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    // Delete existing OTP
    await Otp.deleteMany({ email, type: 'email_verification' });

    // Generate new OTP
    const otp = generateOtp();
    await Otp.create({
      userId: user._id,
      email,
      type: 'email_verification',
      code: otp,
      expiresAt: getOtpExpiry(10),
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if email verified
    if (!user.isEmailVerified) {
      res.status(403).json({ message: 'Please verify your email first' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Get connected platforms
    const platforms = await Platform.find({ userId: user._id, isVerified: true });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
      platforms: platforms.map((p) => ({
        platform: p.platform,
        isVerified: p.isVerified,
        connectedAt: p.connectedAt,
      })),
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If email exists, OTP will be sent' });
      return;
    }

    // Delete existing OTPs
    await Otp.deleteMany({ email, type: 'password_reset' });

    // Generate OTP
    const otp = generateOtp();
    await Otp.create({
      userId: user._id,
      email,
      type: 'password_reset',
      code: otp,
      expiresAt: getOtpExpiry(10),
    });

    // Send email
    await sendPasswordResetEmail(email, otp);

    res.json({ message: 'If email exists, OTP will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find OTP
    const otpDoc = await Otp.findOne({
      email,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc || otpDoc.code !== otp) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // Update password
    const user = await User.findById(otpDoc.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.password = newPassword;
    await user.save();

    // Delete OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
