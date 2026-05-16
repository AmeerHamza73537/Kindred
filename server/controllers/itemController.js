import Item from '../models/Item.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { applyTrustScore } from '../utils/calcTrustScore.js';

const milesToMeters = (miles) => miles * 1609.34;

const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

async function uploadImagesIfConfigured(files = []) {
  const hasCreds =
    process.env.CLOUDINARY_CLOUD_NAME &&
    !String(process.env.CLOUDINARY_CLOUD_NAME).includes('your_cloudinary');
  if (!hasCreds || !files.length) return [];
  const urls = [];
  for (const f of files) {
    const r = await streamUpload(f.buffer, 'kindred/items');
    urls.push(r.secure_url);
  }
  return urls;
}

function distanceMiles(from, toCoords) {
  if (!from || !toCoords?.length) return null;
  const [lng1, lat1] = from;
  const [lng2, lat2] = toCoords;
  const R = 3958.8;
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

export const listItems = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 5;
    const category = req.query.category;
    const type = req.query.type;
    const status = req.query.status || 'available';

    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (req.query.owner) {
      filter.owner = req.query.owner;
    }

    let items;
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const maxDistance = milesToMeters(radius);
      items = await Item.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistance,
          },
        },
      })
        .populate('owner', 'name avatar trustScore location')
        .limit(60)
        .lean();
      items = items.map((it) => ({
        ...it,
        distanceMiles: distanceMiles([lng, lat], it.location?.coordinates),
      }));
    } else {
      items = await Item.find(filter)
        .populate('owner', 'name avatar trustScore location')
        .sort({ createdAt: -1 })
        .limit(60)
        .lean();
    }
    res.json({ success: true, message: 'OK', data: { items } });
  } catch (e) {
    next(e);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      type,
      borrowDurationDays,
      condition,
      tags,
      lat,
      lng,
    } = req.body;

    const coords =
      lat != null && lng != null
        ? [Number(lng), Number(lat)]
        : req.user.location?.coordinates || [-73.9857, 40.7484];

    const imageUrls = await uploadImagesIfConfigured(req.files || []);

    const item = await Item.create({
      owner: req.user._id,
      title,
      description: description || '',
      category,
      type,
      images: imageUrls,
      location: { type: 'Point', coordinates: coords },
      borrowDurationDays: Number(borrowDurationDays) || 7,
      condition: condition || 'good',
      tags: (() => {
        try {
          return tags ? (Array.isArray(tags) ? tags : JSON.parse(tags || '[]')) : [];
        } catch {
          return [];
        }
      })(),
    });

    const owner = await (await import('../models/User.js')).default.findById(req.user._id);
    owner.itemsShared = (owner.itemsShared || 0) + 1;
    const { applyTrustScore } = await import('../utils/calcTrustScore.js');
    applyTrustScore(owner);
    await owner.save();

    const populated = await Item.findById(item._id).populate('owner', 'name avatar trustScore');
    res.status(201).json({ success: true, message: 'Item created', data: { item: populated } });
  } catch (e) {
    next(e);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar bio trustScore badges');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found', data: null });
    }
    res.json({ success: true, message: 'OK', data: { item } });
  } catch (e) {
    next(e);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || String(item.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found or forbidden', data: null });
    }
    const { title, description, category, type, borrowDurationDays, condition, tags, lat, lng } = req.body;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) item.category = category;
    if (type) item.type = type;
    if (borrowDurationDays) item.borrowDurationDays = Number(borrowDurationDays);
    if (condition) item.condition = condition;
    if (tags) {
      try {
        item.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        item.tags = [];
      }
    }
    if (lat != null && lng != null) {
      item.location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    }
    const newUrls = await uploadImagesIfConfigured(req.files || []);
    if (newUrls.length) item.images = [...(item.images || []), ...newUrls];
    await item.save();
    res.json({ success: true, message: 'Updated', data: { item } });
  } catch (e) {
    next(e);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || String(item.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found or forbidden', data: null });
    }
    await Item.deleteOne({ _id: item._id });
    res.json({ success: true, message: 'Deleted', data: null });
  } catch (e) {
    next(e);
  }
};

export const patchStatus = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || String(item.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found or forbidden', data: null });
    }
    const { status } = req.body;
    if (!['available', 'in_use', 'lent_out'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }
    item.status = status;
    await item.save();
    res.json({ success: true, message: 'Status updated', data: { item } });
  } catch (e) {
    next(e);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found', data: null });
    }
    res.json({ success: true, message: 'OK', data: { availability: item.availability || [] } });
  } catch (e) {
    next(e);
  }
};

export const postAvailability = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || String(item.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found or forbidden', data: null });
    }
    const { dates } = req.body;
    const list = Array.isArray(dates) ? dates : [];
    for (const d of list) {
      const day = new Date(d);
      day.setUTCHours(12, 0, 0, 0);
      const exists = item.availability.some((a) => new Date(a.date).toDateString() === day.toDateString());
      if (!exists) {
        item.availability.push({ date: day, isBooked: true, requestId: null });
      }
    }
    await item.save();
    res.json({ success: true, message: 'Dates blocked', data: { availability: item.availability } });
  } catch (e) {
    next(e);
  }
};

export const getBorrowedItems = async (req, res, next) => {
  try {
    const active = await Request.find({
      borrower: req.user._id,
      status: { $in: ['active', 'approved'] },
    })
      .populate('item')
      .lean();
    const items = active.map((r) => r.item).filter(Boolean);
    res.json({ success: true, message: 'OK', data: { items } });
  } catch (e) {
    next(e);
  }
};

export const getGiftedItems = async (req, res, next) => {
  try {
    const completed = await Request.find({
      owner: req.user._id,
      status: 'completed',
    })
      .populate('item')
      .lean();
    const items = completed.map((r) => r.item).filter((i) => i && i.type === 'gift');
    res.json({ success: true, message: 'OK', data: { items } });
  } catch (e) {
    next(e);
  }
};
