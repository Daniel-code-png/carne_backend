const jwt        = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const User       = require('../../user/models/User')
const University = require('../../universites/models/University')

class AuthService {
  /**
   * Login multi-tenant.
   * El usuario se identifica por cédula + contraseña + universidad.
   */
  async login(document, password, universitySlug) {
    // Buscar universidad
    let university = null
    if (universitySlug) {
      university = await University.findOne({ slug: universitySlug, isActive: true })
      if (!university) throw { status: 404, message: `Universidad "${universitySlug}" no encontrada` }
    }

    // Buscar usuario
    const query = { document, isActive: true }
    if (university) query.university = university._id

    const user = await User.findOne(query).select('+password').populate('university', 'name slug primaryColor secondaryColor logo')

    if (!user) throw { status: 401, message: 'Credenciales incorrectas' }

    const isValid = await user.comparePassword(password)
    if (!isValid) throw { status: 401, message: 'Credenciales incorrectas' }

    const sessionId = uuidv4()

    const token = jwt.sign(
      {
        id:           user._id,
        document:     user.document,
        role:         user.role,
        universityId: user.university?._id,
        sessionId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    return {
      token,
      firstLogin: user.firstLogin,
      sessionId,
      canScan: user.canScan(),
      user: user.toSafeObject(),
    }
  }

  async changePassword(userId, newPassword) {
    const user = await User.findById(userId).select('+password')
    if (!user) throw { status: 404, message: 'Usuario no encontrado' }
    if (newPassword === user.document) throw { status: 400, message: 'La contraseña no puede ser igual a tu cédula' }
    if (newPassword.length < 6) throw { status: 400, message: 'Mínimo 6 caracteres' }
    user.password   = newPassword
    user.firstLogin = false
    await user.save()
    return { message: 'Contraseña actualizada' }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      throw { status: 401, message: 'Token inválido o expirado' }
    }
  }
}

module.exports = new AuthService()