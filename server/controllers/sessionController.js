const mongoose = require('mongoose');
const Session = require('../models/Session');
const System = require('../models/System');
const Student = require('../models/Student');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { emitChange } = require('../utils/socket');

const SYSTEM_FIELDS = 'systemNumber name location';
const STUDENT_FIELDS = 'admissionNo name course batch';

/**
 * Ends an active session and frees its system.
 * The status guard on the session update means two simultaneous
 * logouts can never both succeed.
 */
async function releaseSession(session, endStatus) {
  const now = new Date();
  const ended = await Session.findOneAndUpdate(
    { _id: session._id, status: 'active' },
    {
      status: endStatus,
      logoutTime: now,
      duration: Math.max(0, Math.round((now - session.loginTime) / 1000)),
    },
    { new: true }
  );
  if (!ended) throw new HttpError(409, 'This session has already ended');

  await System.updateOne(
    { _id: session.system, status: 'occupied' },
    { status: 'available', currentStudent: null, lastUsedAt: now }
  );
  emitChange();
  return ended;
}

/* ----------------------------- Student side ----------------------------- */

exports.getMySession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ student: req.student._id, status: 'active' }).populate('system', SYSTEM_FIELDS);
  res.json({ session });
});

exports.assignSystem = asyncHandler(async (req, res) => {
  const { systemId } = req.body;
  if (!mongoose.isValidObjectId(systemId)) throw new HttpError(400, 'Choose a system first');
  const student = req.student;

  // Rule 1: one student, one active system
  const existing = await Session.findOne({ student: student._id, status: 'active' }).populate('system', SYSTEM_FIELDS);
  if (existing) {
    return res.status(409).json({ message: 'Your admission number already has an active session.', session: existing });
  }

  // Rules 2 + 3: atomically claim the system only if it is still "available".
  // If two students click at the same moment, only one update matches.
  const system = await System.findOneAndUpdate(
    { _id: systemId, status: 'available' },
    { status: 'occupied', currentStudent: student._id },
    { new: true }
  );
  if (!system) throw new HttpError(409, 'That system is no longer available. Pick another one.');

  let session;
  try {
    session = await Session.create({ student: student._id, system: system._id, loginTime: new Date() });
  } catch (err) {
    // Undo the claim if the session could not be written
    await System.updateOne({ _id: system._id, currentStudent: student._id }, { status: 'available', currentStudent: null });
    if (err.code === 11000) {
      const active = await Session.findOne({ student: student._id, status: 'active' }).populate('system', SYSTEM_FIELDS);
      return res.status(409).json({ message: 'Your admission number already has an active session.', session: active });
    }
    throw err;
  }

  emitChange();
  await session.populate('system', SYSTEM_FIELDS);
  res.status(201).json({ session });
});

exports.studentLogout = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ student: req.student._id, status: 'active' });
  if (!session) throw new HttpError(404, 'You have no active session');
  const ended = await releaseSession(session, 'completed');
  res.json({ message: 'System released', duration: ended.duration });
});

/* ------------------------------ Admin side ------------------------------ */

exports.listSessions = asyncHandler(async (req, res) => {
  const { status, date, admissionNo, student, system } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const filter = {};

  if (status === 'active') filter.status = 'active';
  else if (status === 'history') filter.status = { $ne: 'active' };
  else if (['completed', 'force-logout'].includes(status)) filter.status = status;

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    if (Number.isNaN(start.getTime())) throw new HttpError(400, 'Invalid date');
    filter.loginTime = { $gte: start, $lt: new Date(start.getTime() + 86400000) };
  }

  if (admissionNo || student) {
    const sf = {};
    if (admissionNo) sf.admissionNo = new RegExp(escapeRegex(admissionNo), 'i');
    if (student) sf.name = new RegExp(escapeRegex(student), 'i');
    filter.student = { $in: await Student.find(sf).distinct('_id') };
  }
  if (system) {
    const rx = new RegExp(escapeRegex(system), 'i');
    filter.system = { $in: await System.find({ $or: [{ systemNumber: rx }, { name: rx }] }).distinct('_id') };
  }

  const [items, total] = await Promise.all([
    Session.find(filter)
      .sort({ loginTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('student', STUDENT_FIELDS)
      .populate('system', SYSTEM_FIELDS)
      .lean(),
    Session.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// Rule 5: admin can override
exports.forceLogout = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new HttpError(404, 'Session not found');
  if (session.status !== 'active') throw new HttpError(409, 'This session has already ended');
  await releaseSession(session, 'force-logout');
  res.json({ message: 'Student logged out and system released' });
});

exports.releaseSession = releaseSession;
