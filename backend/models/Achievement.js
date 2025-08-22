const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  unlocked: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  total: { type: Number, default: 1 },
  category: { type: String, default: 'beginner' },
  unlockedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);