const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

/**
 * Roles fijos del sistema universitario.
 * Cada rol tiene acceso a diferentes funcionalidades.
 */
const ROLES = [
  // Directivos
  'rector',
  'vicerrector',
  'decano',
  'subdecano',
  'director_programa',
  // Académicos
  'docente',
  'coordinador',
  'tutor',
  // Estudiantes
  'estudiante',
  'egresado',
  // Administrativos
  'administrativo',
  'secretaria',
  'tesoreria',
  'bienestar',
  'biblioteca',
  // Operativos
  'guardia',
  'sistemas',
  'mantenimiento',
  'monitor',
  'asesor_academico',
  // Sistema
  'admin',
  'superadmin',
]

// Roles que tienen acceso al escáner QR
const SCANNER_ROLES = [
  'guardia',
  'administrativo',
  'admin',
  'superadmin',
  'rector',
  'vicerrector',
  'decano',
  'coordinador',
  'secretaria',
  'biblioteca',
  'sistemas',
  'mantenimiento',
]

const userSchema = new mongoose.Schema(
  {
    // ── Universidad (multi-tenant) ─────────────────────────────
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: function () { return this.role !== 'superadmin' },
      index: true,
    },

    // ── Identidad ──────────────────────────────────────────────
    name:     { type: String, required: true, trim: true },
    document: { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    phone:    { type: String, trim: true, default: '' },

    // ── Rol ────────────────────────────────────────────────────
    role:   { type: String, enum: ROLES, required: true },
    career: { type: String, trim: true, default: '' },

    // ── Autenticación ──────────────────────────────────────────
    password:   { type: String, required: true, minlength: 6, select: false },
    firstLogin: { type: Boolean, default: true },

    // ── Perfil visual ──────────────────────────────────────────
    photo: { type: String, default: '' }, // URL de S3
    theme: {
      type: String,
      default: 'institucional',
      enum: ['institucional', 'kawaii', 'dark', 'spiderman', 'kuromi'],
    },

    // ── Estado ─────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    fcmToken: { type: String, default: '' },

    // ── Módulos futuros ────────────────────────────────────────
    activeLoans:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Loan' }],
    accessHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AccessLog' }],
  },
  { timestamps: true }
)

// Índice compuesto: cédula única por universidad
userSchema.index({ university: 1, document: 1 }, { unique: true })
// Índice compuesto: correo único por universidad
userSchema.index({ university: 1, email: 1 },    { unique: true })

// Hash contraseña
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

userSchema.methods.canScan = function () {
  return SCANNER_ROLES.includes(this.role)
}

module.exports = mongoose.model('User', userSchema)
module.exports.ROLES         = ROLES
module.exports.SCANNER_ROLES = SCANNER_ROLES