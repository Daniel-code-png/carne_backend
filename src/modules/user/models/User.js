const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Identidad ──────────────────────────────────────────────
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    document: { type: String, required: [true, 'La cédula es obligatoria'], unique: true, trim: true },
    email: { type: String, required: [true, 'El correo es obligatorio'], unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },

    // ── Rol ────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['estudiante', 'docente', 'administrativo', 'admin'],
      required: [true, 'El rol es obligatorio'],
    },
    career: { type: String, trim: true, default: '' },

    // ── Autenticación ──────────────────────────────────────────
    password: { type: String, required: true, minlength: 6, select: false },
    firstLogin: { type: Boolean, default: true },

    // ── Perfil visual ──────────────────────────────────────────
    photo: { type: String, default: '' },
    theme: {
      type: String,
      default: 'institucional',
      enum: ['institucional', 'kawaii', 'dark', 'spiderman', 'kuromi'],
    },

    // ── Estado ─────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },

    // ── Notificaciones push (Firebase FCM) ─────────────────────
    fcmToken: { type: String, default: '' },

    // ── Referencias a módulos ──────────────────────────────────
    activeLoans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Loan' }],
    accessHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AccessLog' }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Hash de contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;