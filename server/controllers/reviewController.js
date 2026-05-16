import Review from '../models/Review.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { applyTrustScore } from '../utils/calcTrustScore.js';

async function refreshRecipientRating(userId) {
  const stats = await Review.aggregate([
    { $match: { toUser: userId } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const user = await User.findById(userId);
  if (!user) return;
  if (stats.length) {
    user.ratingAverage = Math.round(stats[0].avg * 10) / 10;
    user.ratingCount = stats[0].count;
  } else {
    user.ratingAverage = 0;
    user.ratingCount = 0;
  }
  applyTrustScore(user);
  await user.save();
}

export const createReview = async (req, res, next) => {
  try {
    const { requestId, toUserId, rating, comment, isPublic } = req.body;
    const stars = Number(rating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1–5', data: null });
    }

    const request = await Request.findById(requestId);
    if (!request || request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Request must be completed', data: null });
    }

    const uid = String(req.user._id);
    if (![String(request.borrower), String(request.owner)].includes(uid)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    if (![String(request.borrower), String(request.owner)].includes(String(toUserId))) {
      return res.status(400).json({ success: false, message: 'Invalid recipient', data: null });
    }
    if (String(toUserId) === uid) {
      return res.status(400).json({ success: false, message: 'Cannot review yourself', data: null });
    }

    const existing = await Review.findOne({ request: requestId, fromUser: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this exchange', data: null });
    }

    const review = await Review.create({
      request: requestId,
      fromUser: req.user._id,
      toUser: toUserId,
      item: request.item,
      rating: stars,
      comment: (comment || '').trim(),
      isPublic: isPublic !== false,
    });

    await refreshRecipientRating(toUserId);

    const populated = await Review.findById(review._id)
      .populate('fromUser', 'name avatar')
      .populate('item', 'title');

    res.status(201).json({ success: true, message: 'Review submitted', data: { review: populated } });
  } catch (e) {
    next(e);
  }
};

export const received = async (req, res, next) => {
  try {
    const q = { toUser: req.params.userId };
    const viewer = req.user?._id;
    if (!viewer || String(viewer) !== String(req.params.userId)) {
      q.isPublic = true;
    }
    const list = await Review.find(q)
      .sort({ createdAt: -1 })
      .populate('fromUser', 'name avatar')
      .populate('item', 'title images');
    res.json({ success: true, message: 'OK', data: { reviews: list } });
  } catch (e) {
    next(e);
  }
};

export const forRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found', data: null });
    }
    const uid = String(req.user._id);
    if (![String(request.borrower), String(request.owner)].includes(uid)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    const mine = await Review.findOne({ request: request._id, fromUser: req.user._id });
    res.json({ success: true, message: 'OK', data: { review: mine } });
  } catch (e) {
    next(e);
  }
};
