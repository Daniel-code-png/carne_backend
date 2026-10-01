const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    code: { type: String, required: [true, 'El código es obligatorio'], trim: true, uppercase: true },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: ['laptop', 'proyector', 'cable', 'tablet', 'camara', 'audio', 'otro'],
    },
    description: { type: String, trim: true, default: '' },
    photo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['disponible', 'prestado', 'dañado', 'mantenimiento'],
      default: 'disponible',
    },
    currentLoan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

equipmentSchema.index({ university: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Equipment', equipmentSchema);