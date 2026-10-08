const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const System = require('../models/System');
const Session = require('../models/Session');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');

const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO7pB6sT8Q6V0p0e9mEwQ3qfZ8kXx1y7K';

exports.login = asyncHandler(async (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!username || !password) throw new HttpError(400, 'Enter your username and password');

  const admin = await Admin.findOne({ username });
  // compare against a dummy hash when the user doesn't exist, so timing doesn't reveal valid usernames
  const ok = admin ? await admin.verifyPassword(password) : (await require('bcryptjs').compare(password, DUMMY_HASH), false);
  if (!ok) throw new HttpError(401, 'Incorrect username or password');

  const token = jwt.sign({ id: admin._id, type: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, admin: { _id: admin._id, username: admin.username, role: admin.role } });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 8) throw new HttpError(400, 'New password must be at least 8 characters');
  const admin = await Admin.findById(req.admin._id);
  if (!(await admin.verifyPassword(String(currentPassword || '')))) throw new HttpError(401, 'Current password is incorrect');
  admin.passwordHash = await Admin.hash(String(newPassword));
  await admin.save();
  res.json({ message: 'Password updated' });
});

exports.dashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [byStatus, totalStudents, activeSessions, todaySessions, systems] = await Promise.all([
    System.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Student.countDocuments({ isActive: true }),
    Session.countDocuments({ status: 'active' }),
    Session.countDocuments({ loginTime: { $gte: startOfDay } }),
    System.find().populate('currentStudent', 'admissionNo name').sort({ systemNumber: 1 }).collation({ locale: 'en', numericOrdering: true }).lean(),
  ]);

  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  res.json({
    stats: {
      totalSystems: systems.length,
      available: counts.available || 0,
      occupied: counts.occupied || 0,
      maintenance: counts.maintenance || 0,
      disabled: counts.disabled || 0,
      totalStudents,
      activeSessions,
      todaySessions,
    },
    systems,
  });
});

/* ------------------------------- Students ------------------------------- */

const studentFields = (b) => {
  const out = {};
  ['admissionNo', 'name', 'course', 'batch'].forEach((k) => b[k] !== undefined && (out[k] = b[k]));
  if (b.isActive !== undefined) out.isActive = Boolean(b.isActive);
  return out;
};

exports.listStudents = asyncHandler(async (req, res) => {
  const { q, status } = req.query;
  const filter = {};
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ admissionNo: rx }, { name: rx }, { course: rx }, { batch: rx }];
  }
  const students = await Student.find(filter).sort({ admissionNo: 1 }).limit(500).lean();
  const sessions = await Session.find({ status: 'active', student: { $in: students.map((s) => s._id) } })
    .populate('system', 'systemNumber')
    .lean();
  const byStudent = new Map(sessions.map((s) => [String(s.student), s]));
  res.json({
    students: students.map((s) => ({ ...s, activeSession: byStudent.get(String(s._id)) || null })),
  });
});

exports.createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(studentFields(req.body));
  res.status(201).json({ student });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new HttpError(404, 'Student not found');
  const fields = studentFields(req.body);
  if (fields.isActive === false && (await Session.exists({ student: student._id, status: 'active' }))) {
    throw new HttpError(409, 'This student is using a system. Force logout first.');
  }
  student.set(fields);
  await student.save();
  res.json({ student });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new HttpError(404, 'Student not found');
  if (await Session.exists({ student: student._id, status: 'active' })) {
    throw new HttpError(409, 'This student is using a system. Force logout first.');
  }
  if (await Session.exists({ student: student._id })) {
    student.isActive = false;
    await student.save();
    return res.json({ message: 'Student has session history, so they were deactivated instead of deleted', deactivated: true });
  }
  await student.deleteOne();
  res.json({ message: 'Student deleted' });
});
