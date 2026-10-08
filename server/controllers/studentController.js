const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Session = require('../models/Session');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const publicStudent = (s) => ({ _id: s._id, admissionNo: s.admissionNo, name: s.name, course: s.course, batch: s.batch });

// Admission number in, short-lived student token out.
// If the student already has an active session it is returned too,
// so the UI can show "Active Session Found" instead of the system grid.
exports.login = asyncHandler(async (req, res) => {
  const admissionNo = String(req.body.admissionNo || '').trim().toUpperCase();
  if (!/^[A-Z0-9\-\/]{2,30}$/.test(admissionNo)) throw new HttpError(400, 'Enter a valid admission number');

  const student = await Student.findOne({ admissionNo });
  if (!student || !student.isActive) throw new HttpError(404, 'Admission number not found. Check it and try again.');

  const token = jwt.sign({ id: student._id, type: 'student' }, process.env.JWT_SECRET, { expiresIn: '12h' });
  const session = await Session.findOne({ student: student._id, status: 'active' }).populate('system', 'systemNumber name location');
  res.json({ token, student: publicStudent(student), session });
});
