const Suggestion = require('../models/Suggestion');
const Student = require('../models/Student');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { emitChange } = require('../utils/socket');

// Student side: sent with an admission number (works from the login page too).
exports.create = asyncHandler(async (req, res) => {
  const admissionNo = String(req.body.admissionNo || '').trim().toUpperCase();
  const student = await Student.findOne({ admissionNo, isActive: true });
  if (!student) throw new HttpError(404, 'Admission number not found. Check it and try again.');
  await Suggestion.create({ student: student._id, message: req.body.message });
  emitChange();
  res.status(201).json({ message: 'Thank you. Your suggestion was sent to the admin.' });
});

// Admin side
exports.list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = ['new', 'read', 'resolved'].includes(status) ? { status } : {};
  const [items, newCount] = await Promise.all([
    Suggestion.find(filter).sort({ createdAt: -1 }).limit(200).populate('student', 'admissionNo name course batch').lean(),
    Suggestion.countDocuments({ status: 'new' }),
  ]);
  res.json({ items, newCount });
});

exports.update = asyncHandler(async (req, res) => {
  if (!['new', 'read', 'resolved'].includes(req.body.status)) throw new HttpError(400, 'Invalid status');
  const item = await Suggestion.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!item) throw new HttpError(404, 'Suggestion not found');
  emitChange();
  res.json({ suggestion: item });
});

exports.remove = asyncHandler(async (req, res) => {
  const item = await Suggestion.findByIdAndDelete(req.params.id);
  if (!item) throw new HttpError(404, 'Suggestion not found');
  emitChange();
  res.json({ message: 'Suggestion deleted' });
});
