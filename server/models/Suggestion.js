const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  message: { type: String, required: [true, 'Write your suggestion'], trim: true, minlength: [5, 'Suggestion is too short'], maxlength: [500, 'Keep it under 500 characters'] },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
});
suggestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Suggestion', suggestionSchema);
