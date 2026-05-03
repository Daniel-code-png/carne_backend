const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Modelo de Usuario
 * Diseñado para escalar a préstamos, accesos e historial sin modificar estructura base.
 */
const userSchema = new mongoose.Schema(
  {
    // ── Identidad ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    document: {
      // Cédula — usado como username
      type: String,
      required: [true, 'La cédula es obligatoria'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Rol y cargo ────────────────────────────────────────────
    role: {
      type: String,
      enum: ['estudiante', 'docente', 'administrativo'],
      required: [true, 'El rol es obligatorio'],
    },
    career: {
      // Carrera (estudiante) o cargo (docente/admin)
      type: String,
      trim: true,
      default: '',
    },

    // ── Autenticación ──────────────────────────────────────────
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 6,
      select: false, // No retornar en queries por defecto
    },
    firstLogin: {
      type: Boolean,
      default: true, // true = debe cambiar contraseña
    },

    // ── Perfil visual ──────────────────────────────────────────
    photo: {
      type: String,
      default: '', // URL de la foto de perfil
    },
    theme: {
      type: String,
      default: 'institucional', // Tema visual del carné
      enum: ['institucional', 'kawaii', 'dark', 'spiderman', 'kuromi'],
    },

    // ── Estado ─────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Preparación para módulos futuros ───────────────────────
    // Los siguientes campos son referencias a futuras colecciones.
    // Se definen aquí para no romper el modelo al escalar.
    activeLoans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan', // Módulo: préstamos (fase 2)
      },
    ],
    accessHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessLog', // Módulo: control de acceso (fase 2)
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt automáticos
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Hooks ──────────────────────────────────────────────────────

// Hash de contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Métodos de instancia ───────────────────────────────────────

// Comparar contraseña ingresada con hash almacenado
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Serialización segura (sin contraseña)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;