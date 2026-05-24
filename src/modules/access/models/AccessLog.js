const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['entrada', 'salida'], required: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, default: 'Principal' },
    notes: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AccessLog', accessLogSchema);