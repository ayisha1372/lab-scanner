const System = require('../models/System');
const Session = require('../models/Session');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { emitChange } = require('../utils/socket');

const MANUAL_STATUSES = ['available', 'maintenance', 'disabled'];
const natural = { locale: 'en', numericOrdering: true };

// Student view: no student info is ever exposed here.
exports.listForStudents = asyncHandler(async (req, res) => {
  const systems = await System.find().select('systemNumber name location status').sort({ systemNumber: 1 }).collation(natural).lean();
  res.json({ systems });
});

exports.list = asyncHandler(async (req, res) => {
  const { q, status } = req.query;
  const filter = {};
  if (status && System.schema.path('status').enumValues.includes(status)) filter.status = status;
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ systemNumber: rx }, { name: rx }, { location: rx }];
  }
  const systems = await System.find(filter)
    .populate('currentStudent', 'admissionNo name')
    .sort({ systemNumber: 1 })
    .collation(natural)
    .lean();
  res.json({ systems });
});

exports.create = asyncHandler(async (req, res) => {
  const { systemNumber, name, location, status } = req.body;
  if (status && !MANUAL_STATUSES.includes(status)) throw new HttpError(400, 'A new system can be available, maintenance or disabled');
  const system = await System.create({ systemNumber, name, location, status });
  emitChange();
  res.status(201).json({ system });
});

exports.update = asyncHandler(async (req, res) => {
  const system = await System.findById(req.params.id);
  if (!system) throw new HttpError(404, 'System not found');
  const { systemNumber, name, location, status } = req.body;

  if (status !== undefined && status !== system.status) {
    if (!MANUAL_STATUSES.includes(status)) throw new HttpError(400, 'Status can be set to available, maintenance or disabled');
    if (system.status === 'occupied') throw new HttpError(409, 'This system is in use. Force logout the student first.');
    system.status = status;
  }
  if (systemNumber !== undefined) system.systemNumber = systemNumber;
  if (name !== undefined) system.name = name;
  if (location !== undefined) system.location = location;

  await system.save();
  emitChange();
  res.json({ system });
});

// Systems with history are disabled instead of deleted so old sessions keep their reference.
exports.remove = asyncHandler(async (req, res) => {
  const system = await System.findById(req.params.id);
  if (!system) throw new HttpError(404, 'System not found');
  if (system.status === 'occupied') throw new HttpError(409, 'This system is in use. Force logout the student first.');

  const hasHistory = await Session.exists({ system: system._id });
  if (hasHistory) {
    system.status = 'disabled';
    await system.save();
    emitChange();
    return res.json({ message: 'System has session history, so it was disabled instead of deleted', deactivated: true });
  }
  await system.deleteOne();
  emitChange();
  res.json({ message: 'System deleted' });
});
