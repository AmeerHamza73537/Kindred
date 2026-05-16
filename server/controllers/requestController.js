import Request from '../models/Request.js';
import Item from '../models/Item.js';
import Handoff from '../models/Handoff.js';

const emit = (req, event, payload) => {
  const io = req.app.get('io');
  if (!io) return;
  if (event === 'request_update' && payload.ownerId) {
    io.to(`user_${payload.ownerId}`).emit(event, payload);
    io.to(`user_${payload.borrowerId}`).emit(event, payload);
    return;
  }
  io.emit(event, payload);
};

export const getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('item');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    const uid = String(req.user._id);
    if (uid !== String(request.owner) && uid !== String(request.borrower)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    res.json({ success: true, message: 'OK', data: { request } });
  } catch (e) {
    next(e);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const { itemId, startDate, endDate, message } = req.body;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found', data: null });
    }
    if (String(item.owner) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot request your own item', data: null });
    }
    const dup = await Request.findOne({
      item: itemId,
      borrower: req.user._id,
      status: { $in: ['pending', 'approved', 'active'] },
    });
    if (dup) {
      return res.status(400).json({ success: false, message: 'You already have an open request for this item', data: null });
    }
    const request = await Request.create({
      item: itemId,
      borrower: req.user._id,
      owner: item.owner,
      requestedDates: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      message: message || '',
    });
    const populated = await Request.findById(request._id)
      .populate('item')
      .populate('borrower', 'name avatar trustScore')
      .populate('owner', 'name avatar trustScore');

    emit(req, 'request_update', {
      requestId: request._id,
      status: request.status,
      ownerId: String(request.owner),
      borrowerId: String(request.borrower),
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.owner}`).emit('notification', {
        type: 'request',
        message: `${req.user.name} requested ${item.title}`,
        link: `/requests`,
      });
    }

    res.status(201).json({ success: true, message: 'Request sent', data: { request: populated } });
  } catch (e) {
    next(e);
  }
};

export const incoming = async (req, res, next) => {
  try {
    const list = await Request.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item')
      .populate('borrower', 'name avatar trustScore badges');
    res.json({ success: true, message: 'OK', data: { requests: list } });
  } catch (e) {
    next(e);
  }
};

export const outgoing = async (req, res, next) => {
  try {
    const list = await Request.find({ borrower: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item')
      .populate('owner', 'name avatar trustScore');
    res.json({ success: true, message: 'OK', data: { requests: list } });
  } catch (e) {
    next(e);
  }
};

export const approve = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || String(request.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending', data: null });
    }
    request.status = 'approved';
    await request.save();
    emit(req, 'request_update', {
      requestId: request._id,
      status: request.status,
      ownerId: String(request.owner),
      borrowerId: String(request.borrower),
    });
    const populated = await Request.findById(request._id).populate('item').populate('borrower', 'name avatar');
    res.json({ success: true, message: 'Approved', data: { request: populated } });
  } catch (e) {
    next(e);
  }
};

export const reject = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || String(request.owner) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    request.status = 'rejected';
    await request.save();
    emit(req, 'request_update', {
      requestId: request._id,
      status: request.status,
      ownerId: String(request.owner),
      borrowerId: String(request.borrower),
    });
    res.json({ success: true, message: 'Rejected', data: { request } });
  } catch (e) {
    next(e);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || String(request.borrower) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }
    if (!['pending', 'approved'].includes(request.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel', data: null });
    }
    request.status = 'cancelled';
    await request.save();
    await Handoff.deleteOne({ request: request._id });
    emit(req, 'request_update', {
      requestId: request._id,
      status: request.status,
      ownerId: String(request.owner),
      borrowerId: String(request.borrower),
    });
    res.json({ success: true, message: 'Cancelled', data: { request } });
  } catch (e) {
    next(e);
  }
};
