const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    color: { type: String, default: '#6366f1' },
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

tagSchema.index({ user: 1 });

module.exports = mongoose.model('Tag', tagSchema);