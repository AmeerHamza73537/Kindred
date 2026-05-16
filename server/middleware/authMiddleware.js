import { verifyAccessToken } from '../utils/generateToken.js';
import { getTokenFromRequest } from '../utils/cookieHelpers.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized', data: null });
    }
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found', data: null });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized', data: null });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (user) req.user = user;
  } catch {
    /* ignore */
  }
  next();
};
