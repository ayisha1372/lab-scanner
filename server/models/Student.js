const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9\-\/]{2,30}$/, 'Admission number can use letters, numbers, - and /'],
    },
    name: { type: String, required: [true, 'Student name is required'], trim: true, maxlength: 80 },
    course: { type: String, trim: true, maxlength: 80, default: '' },
    batch: { type: String, trim: true, maxlength: 40, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Student', studentSchema);
