const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const getOAuthClient = () => {
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${apiUrl}/api/auth/google/callback`
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  location: user.location,
  photo: user.photo,
});

const upsertGoogleUser = async ({ email, name, picture, googleId, role }) => {
  let user = await User.findOne({
    $or: [{ email }, ...(googleId ? [{ googleId }] : [])],
  });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), salt);
    user = await User.create({
      name,
      email,
      googleId,
      photo: picture || "https://i.pravatar.cc/300",
      role: ["buyer", "seller"].includes(role) ? role : "buyer",
      password: hashedPassword,
    });
  } else {
    if (googleId && !user.googleId) user.googleId = googleId;
    if (picture && (!user.photo || user.photo.includes("pravatar.cc"))) user.photo = picture;
    await user.save();
  }

  return user;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ['buyer', 'seller'].includes(role) ? role : 'buyer',
    });

    res.status(201).json({
      success: true,
      user: formatUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      user: formatUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.googleAuth = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ success: false, message: 'Google sign-in is not configured on the server' });
  }

  const role = ['buyer', 'seller'].includes(req.query.role) ? req.query.role : 'buyer';
  const state = Buffer.from(JSON.stringify({ role })).toString('base64url');
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['email', 'profile', 'openid'],
    state,
    prompt: 'select_account',
  });
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${frontend}/login?error=google_auth_cancelled`);
    }

    const { role } = JSON.parse(Buffer.from(state, 'base64url').toString());
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    const user = await upsertGoogleUser({ email, name, picture, googleId, role });

    if (user.status === 'blocked') {
      return res.redirect(`${frontend}/login?error=blocked`);
    }

    const token = generateToken(user._id);
    res.redirect(`${frontend}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect(`${frontend}/login?error=google_auth_failed`);
  }
};

exports.googleSync = async (req, res) => {
  try {
    const { email, name, picture, googleId, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Missing Google account info" });
    }

    const user = await upsertGoogleUser({
      email,
      name,
      picture,
      googleId,
      role: role || "buyer",
    });

    if (user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Your account has been blocked" });
    }

    res.json({
      success: true,
      user: formatUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
