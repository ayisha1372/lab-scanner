const mongoose = require('mongoose');

const STATUSES = ['available', 'occupied', 'maintenance', 'disabled'];

const systemSchema = new mongoose.Schema(
  {
    systemNumber: {
      type: String,
      required: [true, 'System number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    name: { type: String, trim: true, maxlength: 60, default: '' },
    status: { type: String, enum: STATUSES, default: 'available' },
    location: { type: String, trim: true, maxlength: 60, default: 'Main Lab' },
    currentStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('System', systemSchema);
