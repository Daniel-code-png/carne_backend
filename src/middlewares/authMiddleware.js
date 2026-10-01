const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de acceso requerido' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.universityId) {
      const tenantIdFromHeader = req.universityId ? String(req.universityId) : null
      const tenantIdFromToken = String(decoded.universityId)

      if (tenantIdFromHeader && tenantIdFromHeader !== tenantIdFromToken) {
        return res.status(403).json({
          success: false,
          message: 'La universidad del token no coincide con la universidad solicitada',
        })
      }

      req.universityId = tenantIdFromHeader || tenantIdFromToken
      req.universitySlug = req.universitySlug || decoded.universitySlug || null
    }

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' })
  }
}

// Solo superadmin puede acceder
const superAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Acceso restringido a superadmin' })
  }
  next()
}

// Solo admin de universidad o superadmin
const adminMiddleware = (req, res, next) => {
  const allowed = ['admin', 'superadmin', 'rector']
  if (!allowed.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Acceso restringido a administradores' })
  }
  next()
}

// Roles con acceso al escáner QR
const scannerMiddleware = (req, res, next) => {
  const { SCANNER_ROLES } = require('../modules/user/models/User')
  if (!SCANNER_ROLES.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'No tienes permiso para escanear QR' })
  }
  next()
}

module.exports = { authMiddleware, superAdminMiddleware, adminMiddleware, scannerMiddleware }