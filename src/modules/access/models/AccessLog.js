const mongoose = require('mongoose')

const accessLogSchema = new mongoose.Schema(
  {
    university:    { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scannedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:          { type: String, enum: ['entrada', 'salida'], required: true },

    // Datos del QR escaneado
    sessionId:     { type: String, required: true },
    qrValid:       { type: Boolean, default: true },

    location:      { type: String, default: 'Principal' },
    notes:         { type: String, default: '' },
    timestamp:     { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model('AccessLog', accessLogSchema)