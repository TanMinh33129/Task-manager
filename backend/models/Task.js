const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline:     { type: Date },
    reminderSent: { type: Boolean, default: false },
    tags:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Task', taskSchema);