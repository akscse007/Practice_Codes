/**
 * E:\Codes\LibRepo\Mern\backend\controllers\authController.js
 *
 * Complete CommonJS controller for auth:
 * - register, login
 * - refreshToken, logout
 * - googleSignIn
 * - forgotPassword, resetPassword (simple token flow stubs)
 *
 * Uses:
 * - ../models/User
 * - ../utils/token (signAccessToken, signRefreshToken, verifyToken)
 *
 * Notes:
 * - This file is a drop-in replacement that covers all handlers your router expects.
 * - For production, replace the password-reset email/token logic with a secure email+token store.
 */

const crypto = require('crypto');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/token');

let OAuth2Client;
try {
  OAuth2Client = require('google-auth-library').OAuth2Client;
} catch (e) {
  OAuth2Client = null;
}

// cookie options for refresh token
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
};

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = new User({ name, email, password, role });
    await user.save();

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return res.json({ success: true, accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('authController.register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return res.json({ success: true, accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('authController.login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function refreshToken(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const stored = (user.refreshTokens || []).find(rt => rt.token === token);
    if (!stored) return res.status(401).json({ success: false, message: 'Refresh token not recognized' });

    // optionally rotate refresh tokens here (not implemented)
    const newAccess = signAccessToken({ id: user._id.toString(), role: user.role });
    return res.json({ success: true, accessToken: newAccess });
  } catch (err) {
    console.error('authController.refreshToken error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      return res.json({ success: true, message: 'Logged out' });
    }

    let payload = null;
    try { payload = verifyToken(token); } catch (e) { payload = null; }

    if (payload) {
      await User.findByIdAndUpdate(payload.id, { $pull: { refreshTokens: { token } } });
    }
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('authController.logout error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function googleSignIn(req, res) {
  if (!OAuth2Client) return res.status(501).json({ success: false, message: 'Google sign-in not available (google-auth-library not installed)' });

  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'No idToken provided' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    if (!email) return res.status(400).json({ success: false, message: 'Google account missing email' });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || 'Google User',
        email,
        password: Math.random().toString(36).slice(2, 12),
        role: 'student'
      });
      await user.save();
    }

    const tokenPayload = { id: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return res.json({ success: true, accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('authController.googleSignIn error:', err);
    return res.status(500).json({ success: false, message: 'Google sign-in failed' });
  }
}

/**
 * Simple password reset flow:
 * - forgotPassword: generates a token (not persisted elsewhere here) and returns it (in prod you'd email it)
 * - resetPassword: accepts token + newPassword. This example uses an in-memory token map (for demo only).
 *
 * Replace with a proper token store & email sender before using in production.
 */
const _resetTokens = new Map(); // token -> { userId, expiresAt }

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Missing email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes
    _resetTokens.set(token, { userId: user._id.toString(), expiresAt });

    // In production, send token via email. Here we return token for testing.
    return res.json({ success: true, message: 'Password reset token generated (return to client only in dev)', token, expiresAt });
  } catch (err) {
    console.error('authController.forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Missing token or newPassword' });

    const meta = _resetTokens.get(token);
    if (!meta || meta.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findById(meta.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword; // virtual -> hashed on save by model
    await user.save();

    _resetTokens.delete(token);
    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('authController.resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  googleSignIn,
  forgotPassword,
  resetPassword
};
