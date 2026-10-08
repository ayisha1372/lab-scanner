const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  system: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date, default: null },
  status: { type: String, enum: ['active', 'completed', 'force-logout'], default: 'active' },
  duration: { type: Number, default: 0 }, // seconds
});

// Database-level guarantees (these hold even under concurrent requests):
// one active session per student, and one active session per system.
sessionSchema.index(
  { student: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_per_student' }
);
sessionSchema.index(
  { system: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_per_system' }
);
sessionSchema.index({ loginTime: -1 });

module.exports = mongoose.model('Session', sessionSchema);
