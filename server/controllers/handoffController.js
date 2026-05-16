import Handoff from '../models/Handoff.js';
import Request from '../models/Request.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { applyTrustScore } from '../utils/calcTrustScore.js';

const emitHandoff = (req, handoff, extra = {}) => {
  const io = req.app.get('io');
  if (!io) return;
  const payload = { handoffId: handoff._id, stage: handoff.stage, ...extra };
  io.to(`user_${handoff.owner}`).emit('handoff_update', payload);
  io.to(`user_${handoff.borrower}`).emit('handoff_update', payload);
};

const bumpHandoffs = async (ownerId, borrowerId) => {
  for (const id of [ownerId, borrowerId]) {
    const u = await User.findById(id);
    if (u) {
      u.successfulHandoffs = (u.successfulHandoffs || 0) + 1;
      applyTrustScore(u);
      await u.save();
    }
  }
};

const genCode = () => String(Math.floor(1000 + Math.random() * 9000));

export const initiate = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.requestId)
      .populate('item')
      .populate('borrower')
      .populate('owner');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found', data: null });
    }
    if (String(request.owner._id || request.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only owner can initiate handoff', data: null });
    }
    if (request.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Request must be approved first', data: null });
    }
    let handoff = await Handoff.findOne({ request: request._id });
    if (handoff) {
      const populated = await Handoff.findById(handoff._id).populate('item');
      return res.json({ success: true, message: 'Handoff exists', data: { handoff: populated } });
    }
    handoff = await Handoff.create({
      request: request._id,
      item: request.item._id,
      borrower: request.borrower._id || request.borrower,
      owner: request.owner._id || request.owner,
      handoffCode: '',
      stage: 'pickup_pending',
    });
    emitHandoff(req, handoff);
    const populated = await Handoff.findById(handoff._id).populate('item');
    res.status(201).json({ success: true, message: 'Handoff started', data: { handoff: populated } });
  } catch (e) {
    next(e);
  }
};

export const setPickupDetails = async (req, res, next) => {
  try {
    const handoff = await Handoff.findById(req.params.id);
    if (!handoff || String(handoff.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    const { method, location, scheduledTime } = req.body;
    if (method) handoff.pickupDetails.method = method;
    if (location !== undefined) handoff.pickupDetails.location = location;
    if (scheduledTime) handoff.pickupDetails.scheduledTime = new Date(scheduledTime);
    await handoff.save();
    emitHandoff(req, handoff);
    res.json({ success: true, message: 'Pickup details saved', data: { handoff } });
  } catch (e) {
    next(e);
  }
};

export const confirmPickup = async (req, res, next) => {
  try {
    const handoff = await Handoff.findById(req.params.id);
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    const isOwner = String(handoff.owner) === String(req.user._id);
    const isBorrower = String(handoff.borrower) === String(req.user._id);
    if (!isOwner && !isBorrower) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    if (isOwner) handoff.pickupDetails.confirmedByOwner = true;
    if (isBorrower) handoff.pickupDetails.confirmedByBorrower = true;

    if (handoff.pickupDetails.confirmedByOwner && handoff.pickupDetails.confirmedByBorrower && !handoff.handoffCode) {
      handoff.handoffCode = genCode();
    }
    await handoff.save();
    emitHandoff(req, handoff, { handoffCodeReady: !!handoff.handoffCode });
    res.json({ success: true, message: 'Pickup confirmation updated', data: { handoff } });
  } catch (e) {
    next(e);
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const handoff = await Handoff.findById(req.params.id).populate('item');
    if (!handoff || String(handoff.borrower) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    const { code } = req.body;
    if (!code || String(code) !== String(handoff.handoffCode)) {
      return res.status(400).json({ success: false, message: 'Invalid code', data: null });
    }
    const item = await Item.findById(handoff.item);
    const request = await Request.findById(handoff.request);

    handoff.pickupDetails.completedAt = new Date();
    handoff.codeVerifiedAt = new Date();

    if (item.type === 'gift') {
      handoff.stage = 'completed';
      handoff.returnDetails.completedAt = new Date();
      request.status = 'completed';
      item.status = 'available';
      item.totalBorrows = (item.totalBorrows || 0) + 1;
      await bumpHandoffs(handoff.owner, handoff.borrower);
    } else {
      handoff.stage = 'item_with_borrower';
      request.status = 'active';
      item.status = 'lent_out';
    }
    await handoff.save();
    await request.save();
    await item.save();
    emitHandoff(req, handoff);
    res.json({ success: true, message: 'Code verified', data: { handoff } });
  } catch (e) {
    next(e);
  }
};

export const confirmReturn = async (req, res, next) => {
  try {
    const handoff = await Handoff.findById(req.params.id).populate('item');
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    const item = await Item.findById(handoff.item);
    if (item.type === 'gift') {
      return res.status(400).json({ success: false, message: 'No return for gifts', data: null });
    }
    const { step } = req.body;
    const isOwner = String(handoff.owner) === String(req.user._id);
    const isBorrower = String(handoff.borrower) === String(req.user._id);

    if (step === 'borrower_returning' && isBorrower) {
      if (handoff.stage !== 'item_with_borrower') {
        return res.status(400).json({ success: false, message: 'Item not with borrower yet', data: null });
      }
      handoff.stage = 'return_pending';
      handoff.returnDetails.confirmedByBorrower = true;
      handoff.returnDetails.scheduledDate = new Date();
    } else if (step === 'owner_received' && isOwner) {
      handoff.returnDetails.confirmedByOwner = true;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid step or role', data: null });
    }

    if (handoff.returnDetails.confirmedByBorrower && handoff.returnDetails.confirmedByOwner) {
      handoff.stage = 'completed';
      handoff.returnDetails.completedAt = new Date();
      const request = await Request.findById(handoff.request);
      request.status = 'completed';
      item.status = 'available';
      item.totalBorrows = (item.totalBorrows || 0) + 1;
      await request.save();
      await item.save();
      await bumpHandoffs(handoff.owner, handoff.borrower);
    }

    await handoff.save();
    emitHandoff(req, handoff);
    res.json({ success: true, message: 'Return updated', data: { handoff } });
  } catch (e) {
    next(e);
  }
};

export const getByRequest = async (req, res, next) => {
  try {
    const handoff = await Handoff.findOne({ request: req.params.requestId }).populate('item');
    if (!handoff) {
      return res.json({
        success: true,
        message: 'No handoff yet',
        data: { handoff: null, showCodeToOwner: false },
      });
    }
    const uid = String(req.user._id);
    if (uid !== String(handoff.owner) && uid !== String(handoff.borrower)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    const safe = handoff.toObject();
    const isBorrower = uid === String(handoff.borrower);
    const isOwner = uid === String(handoff.owner);
    if (isBorrower) delete safe.handoffCode;
    res.json({ success: true, message: 'OK', data: { handoff: safe, showCodeToOwner: isOwner } });
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const handoff = await Handoff.findById(req.params.id).populate('item');
    if (!handoff) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    const uid = String(req.user._id);
    if (uid !== String(handoff.owner) && uid !== String(handoff.borrower)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    const safe = handoff.toObject();
    if (uid === String(handoff.borrower)) delete safe.handoffCode;
    res.json({
      success: true,
      message: 'OK',
      data: { handoff: safe, showCodeToOwner: uid === String(handoff.owner) },
    });
  } catch (e) {
    next(e);
  }
};
