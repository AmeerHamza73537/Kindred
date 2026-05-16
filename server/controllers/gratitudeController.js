import Gratitude from '../models/Gratitude.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { applyTrustScore } from '../utils/calcTrustScore.js';

export const createGratitude = async (req, res, next) => {
  try {
    const { requestId, toUserId, message, tokenType, isPublic } = req.body;
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
      return res.status(400).json({ success: false, message: 'Cannot thank yourself', data: null });
    }
    const existing = await Gratitude.findOne({ request: requestId, fromUser: req.user._id, toUser: toUserId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already sent thanks for this exchange', data: null });
    }
    const g = await Gratitude.create({
      request: requestId,
      fromUser: req.user._id,
      toUser: toUserId,
      item: request.item,
      message: message || '',
      tokenType,
      isPublic: Boolean(isPublic),
    });
    const recipient = await User.findById(toUserId);
    recipient.helpfulnessVotes = (recipient.helpfulnessVotes || 0) + 1;
    applyTrustScore(recipient);
    await recipient.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${toUserId}`).emit('new_gratitude', { gratitudeId: g._id, fromUser: req.user._id });
      io.to(`user_${toUserId}`).emit('notification', {
        type: 'gratitude',
        message: `${req.user.name} sent you a thank-you`,
        link: `/profile/${req.user._id}`,
      });
    }

    const populated = await Gratitude.findById(g._id).populate('fromUser', 'name avatar').populate('item', 'title');
    res.status(201).json({ success: true, message: 'Thanks sent', data: { gratitude: populated } });
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
    const list = await Gratitude.find(q)
      .sort({ createdAt: -1 })
      .populate('fromUser', 'name avatar')
      .populate('item', 'title images');
    res.json({ success: true, message: 'OK', data: { gratitudes: list } });
  } catch (e) {
    next(e);
  }
};

export const sent = async (req, res, next) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    const list = await Gratitude.find({ fromUser: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('toUser', 'name avatar')
      .populate('item', 'title');
    res.json({ success: true, message: 'OK', data: { gratitudes: list } });
  } catch (e) {
    next(e);
  }
};
