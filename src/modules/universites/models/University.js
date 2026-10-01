const mongoose = require('mongoose')

/**
 * Modelo de Universidad — núcleo del sistema multi-tenant.
 * Cada universidad tiene su propio subdominio, configuración y datos aislados.
 */
const universitySchema = new mongoose.Schema(
  {
    // ── Identidad ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    slug: {
      // unicatolica → unicatolica.carnetdigital.com
      type: String,
      required: [true, 'El slug es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'El slug solo puede contener letras, números y guiones'],
    },
    domain: {
      // unicatolica.carnetdigital.com
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    // ── Información institucional ──────────────────────────────
    logo: { type: String, default: '' },
    primaryColor: { type: String, default: '#1a3a6b' },
    secondaryColor: { type: String, default: '#FFD700' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    country: { type: String, default: 'Colombia' },
    city: { type: String, default: '' },

    // ── Estado ─────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    plan: {
      type: String,
      enum: ['trial', 'basic', 'pro', 'enterprise'],
      default: 'trial',
    },
    trialEndsAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },

    // ── Estadísticas ───────────────────────────────────────────
    stats: {
      totalUsers:     { type: Number, default: 0 },
      totalEquipment: { type: Number, default: 0 },
      totalLoans:     { type: Number, default: 0 },
    },
  },
  { timestamps: true }
)

// Virtual para URL completa
universitySchema.virtual('url').get(function () {
  return `https://${this.slug}.carnetdigital.com`
})

module.exports = mongoose.model('University', universitySchema)