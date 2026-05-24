const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ['pendiente', 'aceptado', 'rechazado', 'devuelto'],
      default: 'pendiente',
    },

    // Respuesta del usuario
    userConfirmed: { type: Boolean, default: null }, // null=sin responder, true=sí, false=no
    userConfirmedAt: { type: Date, default: null },

    // Términos y condiciones
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, default: null },

    // Fechas
    loanDate: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },

    notes: { type: String, default: '' },

    // Snapshot del token FCM al momento del préstamo
    fcmTokenSnapshot: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema);