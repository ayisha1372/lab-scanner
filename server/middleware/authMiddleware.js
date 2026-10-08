const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

const verify = (req, res, type) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: 'Please sign in to continue' });
    return null;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== type) throw new Error('wrong token type');
    return payload;
  } catch {
    res.status(401).json({ message: 'Your session expired. Please sign in again.' });
    return null;
  }
};

exports.adminAuth = async (req, res, next) => {
  try {
    const payload = verify(req, res, 'admin');
    if (!payload) return;
    const admin = await Admin.findById(payload.id).select('-passwordHash');
    if (!admin) return res.status(401).json({ message: 'Admin account not found' });
    req.admin = admin;
    next();
  } catch (e) {
    next(e);
  }
};

exports.studentAuth = async (req, res, next) => {
  try {
    const payload = verify(req, res, 'student');
    if (!payload) return;
    const student = await Student.findById(payload.id);
    if (!student || !student.isActive) {
      return res.status(401).json({ message: 'This admission number is no longer active' });
    }
    req.student = student;
    next();
  } catch (e) {
    next(e);
  }
};

exports.validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
  next();
};
