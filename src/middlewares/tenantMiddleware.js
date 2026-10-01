const University = require('../modules/universites/models/University')

/**
 * Middleware de tenant — identifica la universidad desde el subdominio.
 *
 * En desarrollo: pasar header X-University-Slug: unicatolica
 * En producción: se detecta automáticamente del subdominio (unicatolica.carnetdigital.com)
 *
 * Agrega req.university al request.
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    let slug = null

    // 1. Desde header (desarrollo / apps móviles)
    if (req.headers['x-university-slug']) {
      slug = req.headers['x-university-slug'].toLowerCase().trim()
    }

    // 2. Desde subdominio (producción)
    if (!slug && req.hostname) {
      const host  = req.hostname // unicatolica.carnetdigital.com
      const parts = host.split('.')
      if (parts.length >= 3 && parts[1] === 'carnetdigital') {
        slug = parts[0]
      }
    }

    // 3. Superadmin no necesita tenant
    if (!slug) {
      req.university = null
      return next()
    }

    const university = await University.findOne({ slug, isActive: true })

    if (!university) {
      return res.status(404).json({
        success: false,
        message: `Universidad "${slug}" no encontrada o inactiva`,
      })
    }

    req.university     = university
    req.universityId   = university._id
    req.universitySlug = university.slug
    next()
  } catch (error) {
    console.error('Tenant middleware error:', error)
    next()
  }
}

module.exports = tenantMiddleware