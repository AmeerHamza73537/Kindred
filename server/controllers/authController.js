import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import {
  cookieAccessOptions,
  cookieRefreshOptions,
  clearAuthCookies,
  getRefreshFromRequest,
} from '../utils/cookieHelpers.js';
import { applyTrustScore } from '../utils/calcTrustScore.js';
import { formatAuthUser } from '../utils/formatAuthUser.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, bio, address, lat, lng } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required', data: null });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered', data: null });
    }
    const hashed = await bcrypt.hash(password, 12);
    const coords =
      lat != null && lng != null ? [Number(lng), Number(lat)] : [-73.9857, 40.7484];
    const user = await User.create({
      name,
      email,
      password: hashed,
      bio: bio || '',
      address: address || '',
      location: { type: 'Point', coordinates: coords },
    });
    applyTrustScore(user);
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', accessToken, cookieAccessOptions());
    res.cookie('refreshToken', refreshToken, cookieRefreshOptions());

    res.status(201).json({ success: true, message: 'Registered', data: { user: formatAuthUser(user) } });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required', data: null });
    }
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', accessToken, cookieAccessOptions());
    res.cookie('refreshToken', refreshToken, cookieRefreshOptions());

    res.json({ success: true, message: 'Logged in', data: { user: formatAuthUser(user) } });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refresh = getRefreshFromRequest(req);
    if (refresh) {
      try {
        const decoded = verifyRefreshToken(refresh);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: '' });
      } catch {
        /* ignore */
      }
    }
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out', data: null });
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = getRefreshFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token', data: null });
    }
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid refresh token', data: null });
    }
    const accessToken = generateAccessToken(user._id);
    const newRefresh = generateRefreshToken(user._id);
    user.refreshToken = newRefresh;
    await user.save({ validateBeforeSave: false });
    res.cookie('accessToken', accessToken, cookieAccessOptions());
    res.cookie('refreshToken', newRefresh, cookieRefreshOptions());
    res.json({ success: true, message: 'Token refreshed', data: null });
  } catch (e) {
    clearAuthCookies(res);
    if (e instanceof jwt.JsonWebTokenError || e instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', data: null });
    }
    next(e);
  }
};

export const uploadAvatarFile = async (buffer) => {
  const hasCreds =
    process.env.CLOUDINARY_CLOUD_NAME &&
    !String(process.env.CLOUDINARY_CLOUD_NAME).includes('your_cloudinary');
  if (!hasCreds) {
    return '';
  }
  try {
    const result = await streamUpload(buffer, 'kindred/avatars');
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary avatar upload failed:', err.message);
    return '';
  }
};
