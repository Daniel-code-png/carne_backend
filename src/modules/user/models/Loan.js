const mongoose = require('mongoose');

/**
 * Modelo de Préstamo
 * Ciclo de vida: pendiente → aceptado → devuelto
 *                         → rechazado
 */
const loanSchema = new mongoose.Schema(
  {
    // Equipo prestado
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    // Usuario que recibe el préstamo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Admin que registró el préstamo
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Estado del préstamo
    status: {
      type: String,
      enum: ['pendiente', 'aceptado', 'rechazado', 'devuelto'],
      default: 'pendiente',
    },

    // Términos y condiciones
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
      default: null,
    },

    // Respuesta del usuario a la notificación
    userConfirmed: {
      type: Boolean,
      default: null, // null = sin responder, true = sí fui yo, false = no fui yo
    },
    userConfirmedAt: {
      type: Date,
      default: null,
    },

    // Fechas clave
    loanDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    returnDate: {
      type: Date,
      default: null,
    },

    // Notas del administrador
    notes: {
      type: String,
      default: '',
    },

    // FCM token del usuario al momento del préstamo
    // (para enviar la notificación aunque cambie el token después)
    fcmTokenSnapshot: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;