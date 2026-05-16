import User from '../models/User.js';
import { applyTrustScore, getTrustLabel, getTrustPills } from '../utils/calcTrustScore.js';
import { uploadAvatarFile } from './authController.js';

const milesToMeters = (miles) => miles * 1609.34;

const publicUserFields = (u) => {
  const o = u.toObject ? u.toObject() : { ...u };
  delete o.password;
  delete o.refreshToken;
  delete o.email;
  const score = o.trustScore ?? 50;
  return {
    ...o,
    trustLabel: getTrustLabel(score),
    trustPills: getTrustPills(o),
  };
};

export const getMe = async (req, res, next) => {
  try {
    const o = req.user.toObject();
    delete o.password;
    const score = o.trustScore ?? 50;
    res.json({
      success: true,
      message: 'OK',
      data: {
        user: {
          ...o,
          trustLabel: getTrustLabel(score),
          trustPills: getTrustPills(o),
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, bio, address, lat, lng } = req.body;
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) user.address = address;
    if (lat != null && lng != null) {
      user.location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    }
    if (req.file?.buffer) {
      const url = await uploadAvatarFile(req.file.buffer);
      if (url) user.avatar = url;
    }
    applyTrustScore(user);
    await user.save();
    res.json({ success: true, message: 'Profile updated', data: { user: publicUserFields(user) } });
  } catch (e) {
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }
    res.json({ success: true, message: 'OK', data: { user: publicUserFields(user) } });
  } catch (e) {
    next(e);
  }
};

export const getNearbyUsers = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 5;
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'lat and lng required', data: null });
    }
    const maxDistance = milesToMeters(radius);
    const q = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    };
    if (req.user?._id) q._id = { $ne: req.user._id };
    const users = await User.find(q)
      .limit(20)
      .lean();

    const withDist = users.map((u) => {
      const dist =
        userDistanceMiles([lng, lat], u.location?.coordinates) ?? null;
      return { ...publicUserFields(u), distanceMiles: dist };
    });
    res.json({ success: true, message: 'OK', data: { users: withDist } });
  } catch (e) {
    next(e);
  }
};

function userDistanceMiles(from, toCoords) {
  if (!toCoords || toCoords.length < 2) return null;
  const R = 3958.8;
  const [lng1, lat1] = from;
  const [lng2, lat2] = toCoords;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function deg2rad(d) {
  return (d * Math.PI) / 180;
}
