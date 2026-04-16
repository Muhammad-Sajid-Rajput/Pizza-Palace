import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user.js';
import { sign } from '../utils/token.js';
import { isMailConfigured, sendMail } from '../utils/mailer.js';

const tokenExpiryMs = 60 * 60 * 1000;
const verifyTokenExpiryMs = 24 * 60 * 60 * 1000;

const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

const buildLoginResponse = (user) => ({
  message: 'Login successful',
  token: sign({
    id: user._id,
    email: user.email,
    role: user.role
  }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

const loginByRole = async ({ email, password, requiredRole }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { error: { status: 400, message: 'Invalid credentials' } };
  }

  if (requireEmailVerification && !user.isVerified) {
    return { error: { status: 403, message: 'Please verify your email before logging in' } };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: { status: 400, message: 'Invalid credentials' } };
  }

  if (requiredRole && user.role !== requiredRole) {
    return { error: { status: 403, message: 'Not an admin account' } };
  }

  return { data: buildLoginResponse(user) };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = requireEmailVerification ? crypto.randomBytes(32).toString('hex') : undefined;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiresAt: requireEmailVerification ? new Date(Date.now() + verifyTokenExpiryMs) : undefined,
      isVerified: !requireEmailVerification
    });

    if (requireEmailVerification && verifyToken) {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verifyToken}`;
      await sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Verify Your Email - Pizza Palace',
        html: `
          <h2>Welcome to Pizza Palace</h2>
          <p>Please verify your account:</p>
          <a href="${verificationUrl}" style="background-color: #0f766e; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 6px;">Verify Email</a>
        `
      });
    }

    const response = {
      message: requireEmailVerification
        ? 'Registration successful. Please verify your email before logging in.'
        : 'Registration successful.',
      userId: user._id
    };

    if (requireEmailVerification && !isMailConfigured && process.env.NODE_ENV !== 'production') {
      response.devVerificationToken = verifyToken;
      response.message = 'Registration successful. Email is not configured, use devVerificationToken with /api/auth/verify-email/:token.';
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginByRole({ email, password });
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginByRole({ email, password, requiredRole: 'admin' });
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.json(result.data);
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error during admin login' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiresAt = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Server error during email verification' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const genericMessage = 'If the account exists, a password reset email has been sent.';

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = new Date(Date.now() + tokenExpiryMs);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await sendMail({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: 'Password Reset - Pizza Palace',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      `
    });

    if (!isMailConfigured && process.env.NODE_ENV !== 'production') {
      return res.json({
        message: `${genericMessage} Email is not configured; use the dev reset token response.`,
        devResetToken: resetToken
      });
    }

    return res.json({ message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error during password reset request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};
